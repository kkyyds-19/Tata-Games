import { director } from 'cc';
import { relicConfigs, RelicConfig, relicSetConfigs, SkillEffectType } from '../global/config/RelicConfig';

/**
 * 用户圣物数据
 */
export interface UserRelicItem {
    relicId: number;    // 圣物ID
    isOwned: boolean;   // 是否拥有
}

/**
 * 用户圣物数据管理类
 */
export class UserRelicData {
    private static instance: UserRelicData = null;

    // 调试开关：是否在初始化时生成模拟数据
    private static readonly ENABLE_MOCK_DATA = true; // 发布时改为 false

    // 用户拥有的所有圣物
    private userRelics: Map<number, UserRelicItem> = new Map();

    // 圣物装备栏 (6个槽位, 对应位置1-6)
    // 数组索引 0-5 对应圣物位置 1-6
    private equippedRelicSlots: (number | null)[] = [null, null, null, null, null, null];

    private constructor() {
        this.initializeUserRelics();

        if (UserRelicData.ENABLE_MOCK_DATA) {
            this.generateMockData();
        }
    }

    public static getInstance(): UserRelicData {
        if (!UserRelicData.instance) {
            UserRelicData.instance = new UserRelicData();
        }
        return UserRelicData.instance;
    }

    /**
     * 初始化用户圣物列表
     */
    private initializeUserRelics() {
        relicConfigs.forEach(config => {
            const userRelic: UserRelicItem = {
                relicId: config.id,
                isOwned: false
            };
            this.userRelics.set(config.id, userRelic);
        });
    }

    // ==================== 圣物获取与管理 ====================

    /**
     * 获得一件圣物
     * @param relicId 圣物ID
     */
    public acquireRelic(relicId: number): void {
        const relic = this.userRelics.get(relicId);
        if (relic) {
            relic.isOwned = true;
        }
    }

    /**
     * 检查是否拥有某件圣物
     * @param relicId 圣物ID
     */
    public isRelicOwned(relicId: number): boolean {
        const relic = this.userRelics.get(relicId);
        return relic ? relic.isOwned : false;
    }
    
    /**
     * 获取所有已拥有的圣物
     * @returns 已拥有的圣物数组
     */
    public getOwnedRelics(): UserRelicItem[] {
        return Array.from(this.userRelics.values()).filter(r => r.isOwned);
    }
    
    /**
     * 获取所有圣物（包括未拥有的）
     */
    public getAllRelics(): UserRelicItem[] {
        return Array.from(this.userRelics.values());
    }

    // ==================== 圣物装备/卸下 ====================

    /**
     * 装备圣物
     * @param relicId 要装备的圣物ID
     * @returns 是否装备成功
     */
    public equipRelic(relicId: number): boolean {
        const relicData = this.userRelics.get(relicId);
        const relicConfig = relicConfigs.find(c => c.id === relicId);

        if (!relicData || !relicData.isOwned || !relicConfig) {
            console.warn(`[UserRelicData] 装备失败，圣物不存在或未拥有: ${relicId}`);
            return false;
        }

        const position = relicConfig.position; // 圣物位置 (1-6)
        if (position < 1 || position > 6) {
            console.warn(`[UserRelicData] 装备失败，无效的圣物位置: ${position}`);
            return false;
        }

        // 卸下同样位置的旧圣物
        this.unequipRelic(position); 

        // 装备新圣物
        this.equippedRelicSlots[position - 1] = relicId;
        console.log(`[UserRelicData] 圣物 ${relicId} 已装备到位置 ${position}`);

        // TODO: 发送事件通知UI更新
        return true;
    }

    /**
     * 从指定位置卸下圣物
     * @param position 要卸下的位置 (1-6)
     */
    public unequipRelic(position: number): void {
        if (position < 1 || position > 6) return;

        const currentlyEquippedId = this.equippedRelicSlots[position - 1];
        if (currentlyEquippedId !== null) {
            this.equippedRelicSlots[position - 1] = null;
            console.log(`[UserRelicData] 位置 ${position} 的圣物 ${currentlyEquippedId} 已卸下`);
        }
    }

    /**
     * 获取所有已装备的圣物ID
     */
    public getEquippedRelicIds(): (number | null)[] {
        return [...this.equippedRelicSlots];
    }
    
    /**
     * 获取指定位置的圣物ID
     * @param position 圣物位置 (1-6)
     */
    public getRelicIdByPosition(position: number): number | null {
        if (position < 1 || position > 6) return null;
        return this.equippedRelicSlots[position - 1];
    }


    // ==================== 属性加成计算 ====================

    /**
     * 计算所有已装备圣物提供的总属性加成（包括套装效果）
     * @returns 属性加成对象
     */
    public calculateTotalBonuses(): { [key in SkillEffectType]?: number } {
        const totalBonuses: { [key in SkillEffectType]?: number } = {};
        const equippedRelicIds = this.getEquippedRelicIds().filter(id => id !== null) as number[];
        
        if (equippedRelicIds.length === 0) {
            return {};
        }

        const setCounts = new Map<number, number>();

        // 1. 累加单个圣物的词条属性，并统计套装件数
        equippedRelicIds.forEach(relicId => {
            const relicConfig = relicConfigs.find(c => c.id === relicId);
            if (!relicConfig) return;

            // 累加基础词条
            relicConfig.skillEffects.forEach(effect => {
                totalBonuses[effect.type] = (totalBonuses[effect.type] || 0) + effect.value;
            });

            // 统计套装ID
            if (relicConfig.setIds) {
                relicConfig.setIds.forEach(setId => {
                    setCounts.set(setId, (setCounts.get(setId) || 0) + 1);
                });
            }
        });

        // 2. 激活并累加套装效果
        // setCounts.forEach((count, setId) => {
        //     const setConfig = relicSetConfigs.find(sc => sc.id === setId);
        //     if (!setConfig) return;

        //     setConfig.bonuses.forEach(bonus => {
        //         // 如果装备件数满足要求
        //         if (count >= bonus.count) {
        //             bonus.effects.forEach(effect => {
        //                 totalBonuses[effect.type] = (totalBonuses[effect.type] || 0) + effect.value;
        //             });
        //         }
        //     });
        // });

        return totalBonuses;
    }


    // ==================== 调试方法 ====================

    /**
     * 生成模拟数据
     */
    public generateMockData(): void {
        console.log('[UserRelicData] 生成模拟圣物数据...');

        // 随机获取 10-20 件圣物
        const allRelicIds = relicConfigs.map(c => c.id);
        const shuffled = [...allRelicIds].sort(() => 0.5 - Math.random());
        const relicsToOwn = shuffled.slice(0, Math.floor(Math.random() * 11) + 30);

        relicsToOwn.forEach(id => this.acquireRelic(id));
        
        console.log(`[UserRelicData] 已随机拥有 ${relicsToOwn.length} 件圣物。`);

        // 从已拥有的圣物中，为每个位置随机装备一件
        // for (let pos = 1; pos <= 6; pos++) {
        //     const availableForPos = this.getOwnedRelics().filter(item => {
        //         const config = relicConfigs.find(c => c.id === item.relicId);
        //         return config && config.position === pos;
        //     });
            
        //     if (availableForPos.length > 0) {
        //         const randomRelicToEquip = availableForPos[Math.floor(Math.random() * availableForPos.length)];
        //         this.equipRelic(randomRelicToEquip.relicId);
        //     }
        // }
    }

    /**
     * 打印当前圣物状态以供调试
     */
    public debugPrintStatus(): void {
        console.log('======== [UserRelicData 调试信息] ========');
        console.log('--- 已拥有的圣物 ---');
        this.getOwnedRelics().forEach(r => {
            const config = relicConfigs.find(c => c.id === r.relicId);
            console.log(`ID: ${r.relicId}, 名称: ${config?.name}`);
        });

        console.log('\n--- 已装备的圣物 ---');
        this.equippedRelicSlots.forEach((id, index) => {
            if (id !== null) {
                const config = relicConfigs.find(c => c.id === id);
                console.log(`位置 ${index + 1}: [${id}] ${config?.name}`);
            } else {
                console.log(`位置 ${index + 1}: 空`);
            }
        });

        console.log('\n--- 当前总属性加成 ---');
        const bonuses = this.calculateTotalBonuses();
        for (const key in bonuses) {
            const value = bonuses[key as SkillEffectType];
            console.log(`${key}: ${value}`);
        }
        console.log('============================================');
    }
} 