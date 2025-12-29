import { game } from 'cc';
import { IdleRewardData, stageRewardTable, StageRewardConfig } from '../global/config/IdelRewardConfig';
import { UserItemData } from './UserItemData';
import { idleRewardAPI } from '../api/IdleRewardAPI';
import { IdleRewardViewData } from '../api/APITypes';
import { gameItemConfigs } from '../global/config/GameItemConfig';

/**
 * 挂机收益数据接口
 */
export interface ServerIdleRewardData {
    currentLevel: number;
    gold: string;
    experience: string;
    timeGap: number;
    reward: Record<string, number>;
}

/**
 * @class UserIdleRewardData
 * @description 用户挂机奖励数据管理器。
 */
export class UserIdleRewardData {
    private static _instance: UserIdleRewardData = null;

    public static getInstance(): UserIdleRewardData {
        if (!this._instance) {
            this._instance = new UserIdleRewardData();
        }
        return this._instance;
    }

    // 本地挂机时间（仅作为服务器数据获取失败时的备选方案）
    private _localStartTime: number = 0;
    // 本地挂机收益上限（秒）
    private readonly MAX_LOCAL_IDLE_DURATION_SECONDS = 12 * 60 * 60; // 12 小时
    // 本地最小挂机时间（秒）
    private readonly MIN_LOCAL_IDLE_DURATION_SECONDS = 5 * 60; // 5分钟

    // 服务器数据缓存
    private _serverData: ServerIdleRewardData | null = null;
    private _lastUpdateTime: number = 0;
    private readonly CACHE_DURATION = 30 * 1000; // 30秒缓存

    constructor() {
        // 默认初始化，开始本地挂机计时（仅作为备选方案）
        this.startLocalIdle();
    }

    /**
     * 从服务器获取挂机收益数据
     * @returns Promise<ServerIdleRewardData>
     */
    public getServerData(): Promise<ServerIdleRewardData> {
        const now = Date.now();

        // 检查缓存是否有效
        if (this._serverData && (now - this._lastUpdateTime) < this.CACHE_DURATION) {
            return Promise.resolve(this._serverData);
        }

        return idleRewardAPI.getViewData()
            .then((response) => {
                if (response.code === 200 || response.code === 0) {
                    this._serverData = response.data;
                    this._lastUpdateTime = now;
                    console.log('获取挂机收益数据成功:', this._serverData);
                    return this._serverData;
                } else {
                    console.error('获取挂机收益数据失败:', response.msg);
                    throw new Error(response.msg || '获取挂机收益数据失败');
                }
            })
            .catch((error) => {
                console.error('获取挂机收益数据异常:', error);
                throw error;
            });
    }

    /**
     * 将服务器reward数据转换为本地UserItem格式
     * @param reward 服务器reward对象
     * @returns UserItem数组
     */
    public convertRewardToUserItems(reward: Record<string, number>): { itemId: number; amount: number; }[] {
        const result: { itemId: number; amount: number; }[] = [];

        for (const [key, amount] of Object.entries(reward)) {
            const itemConfig = gameItemConfigs.find(config => config.materialKey === key);
            if (itemConfig) {
                result.push({
                    itemId: itemConfig.id,
                    amount: amount
                });
            } else {
                console.warn(`未找到 materialKey=${key} 对应的物品配置`);
            }
        }

        return result;
    }

    /**
     * 领取挂机奖励（从服务器）
     * @returns Promise<boolean> 是否领取成功
     */
    public claimServerReward(): Promise<boolean> {
        return idleRewardAPI.receiveReward()
            .then((response) => {
                if (response.code === 200 || response.code === 0) {
                    console.log('领取挂机奖励成功');
                    // 清除缓存，强制重新获取数据
                    this._serverData = null;
                    return true;
                } else {
                    console.error('领取挂机奖励失败:', response.msg);
                    return false;
                }
            })
            .catch((error) => {
                console.error('领取挂机奖励异常:', error);
                return false;
            });
    }

    /**
     * 领取扫荡奖励（从服务器）
     * @returns Promise<boolean> 是否领取成功
     */
    public claimSweepReward(): Promise<boolean> {
        return idleRewardAPI.sweepReward()
            .then((response) => {
                if (response.code === 200 || response.code === 0) {
                    console.log('领取扫荡奖励成功');
                    // 清除缓存，强制重新获取数据
                    this._serverData = null;
                    return true;
                } else {
                    console.error('领取扫荡奖励失败:', response.msg);
                    return false;
                }
            })
            .catch((error) => {
                console.error('领取扫荡奖励异常:', error);
                return false;
            });
    }

    /**
     * 格式化时间差为可读格式
     * @param timeGap 时间差（毫秒）
     * @returns 格式化后的时间字符串
     */
    public formatTimeGap(timeGap: number): string {
        return idleRewardAPI.formatTimeGap(timeGap);
    }

    /**
     * 开始本地挂机计时（仅作为服务器数据获取失败时的备选方案）
     */
    public startLocalIdle() {
        this._localStartTime = Date.now();
        console.log(`本地挂机计时：已重置时间，新的开始时间: ${new Date(this._localStartTime).toLocaleString()}`);
    }

    /**
     * 计算当前可领取的本地挂机时长（秒），封顶12小时
     * 注意：此方法仅作为服务器数据获取失败时的备选方案
     * @returns {number} 挂机时长（秒）
     */
    public getCalculatedIdleTime(): number {
        const now = Date.now();
        const durationMs = now - this._localStartTime;
        const durationSeconds = Math.floor(durationMs / 1000);

        // 返回实际挂机时长和上限中的较小值
        return Math.min(durationSeconds, this.MAX_LOCAL_IDLE_DURATION_SECONDS);
    }

    /**
     * 检查是否有有效的服务器数据
     * @returns {boolean} 是否有服务器数据
     */
    public hasServerData(): boolean {
        return this._serverData !== null;
    }

    /**
     * 获取服务器数据（如果可用）
     * @returns {ServerIdleRewardData | null} 服务器数据
     */
    public getServerDataSync(): ServerIdleRewardData | null {
        return this._serverData;
    }

    /**
     * 领取挂机奖励（本地版本，保留兼容性）
     * @returns {IdleRewardData | null} 返回计算出的奖励数据，如果挂机时间为0则返回null
     */
    public claimRewards(): IdleRewardData | null {
        const idleTime = this.getCalculatedIdleTime();
        if (idleTime < this.MIN_LOCAL_IDLE_DURATION_SECONDS) {
            console.log(`挂机时间不足5分钟，无法领取奖励。当前挂机时长: ${Math.floor(idleTime / 60)}分钟`);
            return null;
        }

        const maxStage = game.myGlobal.maxStage;
        const baseReward = this._generateMockRewardForStage(maxStage);

        const hours = idleTime / 3600.0;

        // 计算总奖励
        const totalExp = Math.floor(baseReward.rewardPerHour.exp * hours);
        const totalCoin = Math.floor(baseReward.rewardPerHour.coin * hours);

        const finalDrops: { itemId: number; amount: number; }[] = [];
        baseReward.drops.forEach(drop => {
            finalDrops.push({
                itemId: drop.itemId,
                amount: Math.floor(drop.amount * hours) // 掉落物品也按小时计算
            });
        });

        // 发放奖励
        UserItemData.getInstance().addItem(507, totalCoin); // 507 是金币ID
        finalDrops.forEach(drop => {
            if (drop.amount > 0) {
                UserItemData.getInstance().addItem(drop.itemId, drop.amount);
            }
        });
        // 经验值需要加到用户经验上，这里先打印日志
        console.log(`获得了 ${totalExp} 经验, ${totalCoin} 金币。`);

        // 创建用于UI显示的奖励数据
        const claimedRewardData: IdleRewardData = {
            duration: idleTime,
            stageName: `第${maxStage}关`,
            monsterName: `关卡${maxStage}守护者`, // UI显示可以自定义
            rewardPerHour: baseReward.rewardPerHour,
            drops: finalDrops.map(d => ({ itemId: d.itemId, amount: d.amount }))
        };

        // 领取后重置本地挂机时间
        this.startLocalIdle();

        return claimedRewardData;
    }

    /**
     * 根据关卡等级从数据表中查找基础奖励数据
     * @param stage 玩家当前最大关卡
     * @private
     */
    private _getBaseRewardForStage(stage: number): StageRewardConfig {
        // 寻找对应关卡的奖励，如果关卡超过表格最大值，则使用最大关卡的奖励
        let rewardConfig = stageRewardTable.find(r => r.stage === stage);

        if (!rewardConfig) {
            // 如果没找到（例如stage > 30），则使用最后一项作为默认值
            rewardConfig = stageRewardTable[stageRewardTable.length - 1];
        }

        return rewardConfig;
    }

    /**
     * (此方法已废弃，被 _getBaseRewardForStage 替代)
     * 根据关卡等级模拟生成基础奖励数据（这里是模拟实现）
     * @param stage 玩家当前最大关卡
     * @private
     */
    private _generateMockRewardForStage(stage: number): IdleRewardData {
        const baseRewardConfig = this._getBaseRewardForStage(stage);

        return {
            duration: 0, // 基础数据模板，时长为0
            stageName: `第${stage}关`,
            monsterName: `关卡${stage}守护者`,
            rewardPerHour: baseRewardConfig.rewardPerHour,
            drops: baseRewardConfig.rewardPerHour.drops,
        };
    }
} 