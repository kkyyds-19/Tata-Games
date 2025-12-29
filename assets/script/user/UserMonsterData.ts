import { MonsterInfo } from "../api/APITypes";
import { monsterAPI } from "../api/MonsterAPI";

/**
 * 用户怪物图鉴数据管理器
 */
export class UserMonsterData {
    private static _instance: UserMonsterData = null;

    // 缓存前100个怪物的数据
    private _monsterCache: Map<string, MonsterInfo> = new Map();
    
    // 缓存是否已初始化
    private _isInitialized: boolean = false;
    
    // 缓存时间戳，用于判断是否需要刷新
    private _lastCacheTime: number = 0;
    
    // 缓存有效期（5分钟）
    private readonly CACHE_DURATION: number = 5 * 60 * 1000; // 增加到5分钟

    public static getInstance(): UserMonsterData {
        if (!this._instance) {
            this._instance = new UserMonsterData();
        }
        return this._instance;
    }

    private constructor() {
        console.log('UserMonsterData: 实例创建');
    }

    /**
     * 初始化怪物图鉴数据
     */
    public async initialize(): Promise<void> {
        if (this._isInitialized) {
            console.log('UserMonsterData: 已经初始化过，跳过重复初始化');
            return;
        }

        console.log('UserMonsterData: 开始初始化怪物图鉴数据');
        await this.refreshCache();
        this._isInitialized = true;
        console.log('UserMonsterData: 怪物图鉴数据初始化完成');
    }

    /**
     * 刷新缓存数据
     */
    public async refreshCache(): Promise<void> {
        try {
            console.log('UserMonsterData: 开始刷新怪物缓存数据');
            // 获取前100个怪物的数据
            const response = await monsterAPI.getMonsterList('', 1, 100);
            
            if (response && response.data && response.data.data) {
                this._monsterCache.clear();
                
                // 将数据存储到缓存中
                response.data.data.forEach((monster: MonsterInfo) => {
                    this._monsterCache.set(monster.key, { ...monster });
                });
                
                this._lastCacheTime = Date.now();
            } else {
                console.warn('UserMonsterData: 获取怪物列表失败，响应数据为空');
            }
        } catch (error) {
            console.error('UserMonsterData: 刷新缓存失败:', error);
            throw error;
        }
    }

    /**
     * 检查缓存是否需要刷新
     */
    private isCacheExpired(): boolean {
        return Date.now() - this._lastCacheTime > this.CACHE_DURATION;
    }

    /**
     * 确保缓存是最新的
     */
    private async ensureCacheFresh(): Promise<void> {
        if (!this._isInitialized || this.isCacheExpired()) {
            await this.refreshCache();
        }
    }

    /**
     * 获取所有缓存的怪物数据
     */
    public async getAllMonsters(): Promise<MonsterInfo[]> {
        await this.ensureCacheFresh();
        return Array.from(this._monsterCache.values());
    }

    /**
     * 根据key获取怪物信息
     * @param key 怪物key
     */
    public async getMonsterByKey(key: string): Promise<MonsterInfo | null> {
        await this.ensureCacheFresh();
        return this._monsterCache.get(key) || null;
    }

    /**
     * 检查怪物是否已解锁
     * @param key 怪物key
     */
    public async isMonsterUnlocked(key: string): Promise<boolean> {
        const monster = await this.getMonsterByKey(key);
        return monster ? monster.isUnlock === 1 : false;
    }

    /**
     * 检查怪物奖励是否已领取
     * @param key 怪物key
     */
    public async isMonsterRewardReceived(key: string): Promise<boolean> {
        const monster = await this.getMonsterByKey(key);
        return monster ? monster.isReceive === 1 : false;
    }

    /**
     * 解锁怪物
     * 先根据key查询是否已经解锁过，如果未解锁发送请求，成功后更改缓存数据
     * @param key 怪物key
     */
    public async unlockMonster(key: string): Promise<boolean> {
        try {
            // 先检查是否已经解锁
            if (await this.isMonsterUnlocked(key)) {
                console.log(`UserMonsterData: 怪物 ${key} 已经解锁，无需重复解锁`);
                return true;
            }

            const response = await monsterAPI.unlockMonster(key);
            
            // 【修复】正确处理服务器响应
            // 服务器返回 {code: 200, data: 1, msg: "该图鉴已解锁"} 表示成功
            if (response && (response.code === 0 || response.code === 200)) {
                // 更新缓存数据
                const monster = this._monsterCache.get(key);
                if (monster) {
                    monster.isUnlock = 1;
                    console.log(`UserMonsterData: 怪物 ${key} 解锁成功，缓存已更新`);
                } else {
                    // 如果缓存中没有该怪物，刷新缓存
                    console.log(`UserMonsterData: 缓存中未找到怪物 ${key}，刷新缓存`);
                    await this.refreshCache();
                }
                return true;
            } else {
                console.error(`UserMonsterData: 怪物 ${key} 解锁失败:`, response);
                return false;
            }
        } catch (error) {
            // 【修复】如果错误信息是"该图鉴已解锁"，说明已经解锁了，应该返回成功
            if (error.message && error.message.includes('该图鉴已解锁')) {
                console.log(`UserMonsterData: 怪物 ${key} 已经解锁，无需重复解锁`);
                // 更新缓存数据
                const monster = this._monsterCache.get(key);
                if (monster) {
                    monster.isUnlock = 1;
                    console.log(`UserMonsterData: 怪物 ${key} 缓存已更新为已解锁状态`);
                }
                return true;
            }
            console.error(`UserMonsterData: 解锁怪物 ${key} 时发生错误:`, error);
            return false;
        }
    }

    /**
     * 领取怪物奖励
     * @param key 怪物key
     */
    public async receiveMonsterReward(key: string): Promise<any> {
        try {
            // 检查是否已经领取
            if (await this.isMonsterRewardReceived(key)) {
                console.log(`UserMonsterData: 怪物 ${key} 奖励已经领取，无需重复领取`);
                return { success: true, reward: '{}' }; // 已领取时返回空奖励
            }

            const response = await monsterAPI.receiveReward(key);
            
            // 【修复】正确处理服务器响应
            if (response && (response.code === 0 || response.code === 200)) {
                // 更新缓存数据
                const monster = this._monsterCache.get(key);
                if (monster) {
                    monster.isReceive = 1;
                    monster.receiveTime = new Date().toISOString();
                    console.log(`UserMonsterData: 怪物 ${key} 奖励领取成功，缓存已更新`);
                }
                
                // 返回成功响应，包含奖励数据
                return { 
                    success: true, 
                    reward: response.data || '{}' // 使用服务器返回的奖励数据，没有则返回空对象
                };
            } else {
                console.error(`UserMonsterData: 怪物 ${key} 奖励领取失败:`, response);
                return { success: false, error: response?.msg || '领取失败' };
            }
        } catch (error) {
            console.error(`UserMonsterData: 领取怪物 ${key} 奖励时发生错误:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 一键领取所有可领取的奖励
     */
    public async receiveAllRewards(): Promise<any> {
        try {
            const response = await monsterAPI.receiveAllRewards();
            
            // 【修复】正确处理服务器响应
            if (response && (response.code === 0 || response.code === 200)) {
                // 刷新缓存以获取最新状态
                await this.refreshCache();
                console.log('UserMonsterData: 一键领取所有奖励成功，缓存已刷新');
                
                // 返回成功响应，包含奖励数据
                return { 
                    success: true, 
                    reward: response.data || '{}' // 使用服务器返回的奖励数据，没有则返回空对象
                };
            } else {
                console.error('UserMonsterData: 一键领取所有奖励失败:', response);
                return { success: false, error: response?.msg || '领取失败' };
            }
        } catch (error) {
            console.error('UserMonsterData: 一键领取所有奖励时发生错误:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 获取已解锁的怪物数量
     */
    public async getUnlockedCount(): Promise<number> {
        const monsters = await this.getAllMonsters();
        return monsters.filter(monster => monster.isUnlock === 1).length;
    }

    /**
     * 获取已领取奖励的怪物数量
     */
    public async getReceivedCount(): Promise<number> {
        const monsters = await this.getAllMonsters();
        return monsters.filter(monster => monster.isReceive === 1).length;
    }

    /**
     * 获取可领取奖励的怪物列表
     */
    public async getRewardableMonsters(): Promise<MonsterInfo[]> {
        const monsters = await this.getAllMonsters();
        return monsters.filter(monster => 
            monster.isUnlock === 1 && monster.isReceive === 0
        );
    }

    /**
     * 获取未解锁的怪物列表
     */
    public async getLockedMonsters(): Promise<MonsterInfo[]> {
        const monsters = await this.getAllMonsters();
        return monsters.filter(monster => monster.isUnlock === 0);
    }

    /**
     * 强制刷新缓存
     */
    public async forceRefreshCache(): Promise<void> {
        console.log('UserMonsterData: 强制刷新缓存');
        this._lastCacheTime = 0; // 重置时间戳
        await this.refreshCache();
    }

    /**
     * 清除缓存
     */
    public clearCache(): void {
        this._monsterCache.clear();
        this._lastCacheTime = 0;
        this._isInitialized = false;
        console.log('UserMonsterData: 缓存已清除');
    }

    /**
     * 获取缓存状态信息
     */
    public getCacheStatus(): {
        isInitialized: boolean;
        cacheSize: number;
        lastCacheTime: number;
        isExpired: boolean;
    } {
        return {
            isInitialized: this._isInitialized,
            cacheSize: this._monsterCache.size,
            lastCacheTime: this._lastCacheTime,
            isExpired: this.isCacheExpired()
        };
    }
}

// 创建并导出单例实例
export const userMonsterData = UserMonsterData.getInstance();
