import { legacyConfigs, LegacyConfig, SkillEffect } from "../global/config/LegacyConfig";

/**
 * 用户单个遗物的数据结构
 */
export interface UserLegacyItem {
    id: number;       // 遗物ID
    isOwned: boolean; // 是否已拥有
    star: number;     // 当前星级, 0表示未激活
}

/**
 * 遗物数据管理器
 * - 管理遗物的获取、升星等状态
 * - 计算遗物带来的羁绊效果
 */
export class UserLegacyData {
    private static instance: UserLegacyData;

    // MOCK DATA 开关
    private static readonly ENABLE_MOCK_DATA = true;
    private static readonly MAX_STAR_LEVEL = 5;

    // 存储用户的所有遗物数据
    private userLegacies: Map<number, UserLegacyItem> = new Map();

    private constructor() {
        this.initializeLegacies();
        if (UserLegacyData.ENABLE_MOCK_DATA) {
            this.generateMockData();
        }
    }

    public static getInstance(): UserLegacyData {
        if (!UserLegacyData.instance) {
            UserLegacyData.instance = new UserLegacyData();
        }
        return UserLegacyData.instance;
    }

    /**
     * 初始化所有遗物的默认数据
     */
    private initializeLegacies(): void {
        legacyConfigs.forEach(config => {
            this.userLegacies.set(config.id, {
                id: config.id,
                isOwned: false,
                star: 0,
            });
        });
    }

    // ==================== 数据查询 ====================

    /**
     * 获取指定ID的遗物数据
     */
    public getLegacyData(legacyId: number): UserLegacyItem | null {
        return this.userLegacies.get(legacyId) || null;
    }

    /**
     * 获取用户拥有的所有遗物
     */
    public getOwnedLegacies(): UserLegacyItem[] {
        return Array.from(this.userLegacies.values()).filter(l => l.isOwned);
    }
    
    /**
     * 获取指定ID遗物是否拥有
     */
    public isLegacyOwned(legacyId: number): boolean {
        const legacy = this.getLegacyData(legacyId);
        return legacy ? legacy.isOwned : false;
    }

    // ==================== 核心逻辑 ====================

    /**
     * 用户获得一个新遗物
     */
    public acquireLegacy(legacyId: number): boolean {
        const legacy = this.getLegacyData(legacyId);
        if (legacy && !legacy.isOwned) {
            legacy.isOwned = true;
            legacy.star = 1; // 获得时默认1星
            console.log(`[UserLegacyData] 获得新遗物, ID: ${legacyId}`);
            return true;
        }
        console.warn(`[UserLegacyData] 获得遗物失败，可能已拥有或ID无效: ${legacyId}`);
        return false;
    }

    /**
     * 升星遗物
     */
    public starUpLegacy(legacyId: number): boolean {
        const legacy = this.getLegacyData(legacyId);
        if (!legacy || !legacy.isOwned) {
            console.warn(`[UserLegacyData] 升星失败，未拥有该遗物: ${legacyId}`);
            return false;
        }
        if(legacy.star >= UserLegacyData.MAX_STAR_LEVEL) {
            console.log(`[UserLegacyData] 遗物 ${legacyId} 已达到最高星级`);
            return false;
        }
        
        legacy.star++;
        console.log(`[UserLegacyData] 遗物 ${legacyId} 升至 ${legacy.star}星`);
        return true;
    }

    /**
     * 获取当前激活的所有羁绊效果
     * 羁绊效果的激活条件是：一个遗物和其 bondIds 指定的所有遗物都被拥有，且达到特定星级。
     * @returns 返回一个包含所有已激活技能效果的数组
     */
    public getBondEffects(): SkillEffect[] {
        const activeEffects: SkillEffect[] = [];

        // 遍历每一个遗物配置，检查其自身的羁绊条件
        for (const mainLegacyConfig of legacyConfigs) {
            // 1. 确定羁绊组的所有成员ID (主遗物 + 其绑定的所有遗物)
            const bondGroupIds = [mainLegacyConfig.id, ...mainLegacyConfig.bondIds];

            // 2. 获取这些成员的玩家数据
            const bondGroupData = bondGroupIds
                .map(id => this.getLegacyData(id))
                .filter((item): item is UserLegacyItem => !!item); // 过滤掉无效ID

            // 3. 检查是否所有羁绊成员都已拥有
            const allOwned = bondGroupData.length === bondGroupIds.length && bondGroupData.every(item => item.isOwned);

            if (allOwned) {
                // 4. 如果都拥有，计算羁绊组的最低星级
                const minStarOfBondGroup = Math.min(...bondGroupData.map(item => item.star));

                if (minStarOfBondGroup > 0) {
                    // 5. 根据最低星级，激活主遗物的星级效果
                    for (const starEffect of mainLegacyConfig.starEffects) {
                        if (starEffect.star <= minStarOfBondGroup) {
                            activeEffects.push(...starEffect.effects);
                        }
                    }
                }
            }
        }
        
        // 6. 去重后返回，因为多个羁绊组可能提供相同的效果
        const uniqueEffects = Array.from(new Map(activeEffects.map(item => [JSON.stringify(item), item])).values());
        return uniqueEffects;
    }

    // ==================== 调试 ====================
    private generateMockData(): void {
        // 拥有全部遗物
        legacyConfigs.forEach(s => {
            this.acquireLegacy(s.id);
            const legacy = this.getLegacyData(s.id);
            if (legacy) {
                // 随机星级（1 到 MAX_STAR_LEVEL）
                legacy.star = Math.floor(Math.random() * UserLegacyData.MAX_STAR_LEVEL) + 1;
            }
        });
    }
} 