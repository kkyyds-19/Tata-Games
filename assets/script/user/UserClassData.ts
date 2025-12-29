import { _decorator } from 'cc';
import { UserArmyData, CardData } from './UserArmyData';
const { ccclass } = _decorator;

/**
 * 职业数据结构
 */
export interface ClassData {
    classId: number;    // 职业ID
    cardId: string;     // 对应的卡片ID
    level: number;      // 等级
    attack: number;     // 攻击力
    maxhp: number;     // 最大生命值
    cardData: CardData; // 卡片完整数据（避免重复查询）
}

/**
 * 升级结果接口
 */
export interface UpgradeResult {
    success: boolean;           // 是否升级成功
    message: string;            // 结果消息
    newLevel?: number;          // 新等级
    newAttack?: number;         // 新攻击力
    newMaxHp?: number;          // 新最大生命值
    costGold?: number;          // 消耗的金币
}

/**
 * 用户职业数据管理（全局单例）
 */
@ccclass('UserClassData')
export class UserClassData {
    private static _instance: UserClassData = null;

    /**已上阵的英雄
     * k:职业
     * v:ClassData
     */
    private _classData: Map<number, ClassData> = new Map();
    private _classLevels: Map<number, number> = new Map();
    private _userArmyData: UserArmyData = null;

    // 添加初始化状态标记
    private isInitialized: boolean = false;

    private constructor() {
        this._userArmyData = UserArmyData.getInstance();
        // 延迟初始化，等待登录完成
        console.log('UserClassData: 实例创建，等待登录完成后初始化');
    }

    public static getInstance(): UserClassData {
        if (!this._instance) {
            this._instance = new UserClassData();
        }
        return this._instance;
    }

    /**
     * 初始化职业数据（在登录完成后调用）
     */
    public initializeAfterLogin(): void {
        if (this.isInitialized) {
            console.log('UserClassData: 已经初始化过，跳过重复初始化');
            return;
        }

        console.log('UserClassData: 开始初始化职业数据');
        this.initializeClassLevels();
        // this.deployDefaultCards(); // 注释掉，改用服务器数据初始化上阵英雄
        this.isInitialized = true;
        console.log('UserClassData: 职业数据初始化完成');
    }

    private initializeClassLevels(): void {
        for (let i = 0; i < 5; i++) {
            this._classLevels.set(i, 1);
        }
        console.log(`UserClassData: 职业等级初始化完成`);
    }

    /**
     * 上阵卡片（如果同职业已有卡片，则替换）
     * @param cardId 卡片ID
     * @returns 上阵结果信息
     */
    public deployCard(cardId: string): { success: boolean, message: string, replacedCardId?: string } {
        const cardData = this._userArmyData.getCardById(cardId);
        if (!cardData) {
            console.warn(`UserClassData: 找不到卡片ID为 ${cardId} 的卡片数据`);
            return {
                success: false,
                message: "找不到卡片数据"
            };
        }

        // 验证英雄是否在玩家背包中
        const userCards = this._userArmyData.getUserCards();
        const isOwnedByPlayer = userCards.some(card => card.cardId === cardId);
        if (!isOwnedByPlayer) {
            console.warn(`UserClassData: 尝试部署不在背包中的英雄，cardId: ${cardId}`);
            return {
                success: false,
                message: "该英雄不在背包中，无法部署"
            };
        }

        // 检查该卡片是否已经上阵 
        if (this.isCardDeployed(cardId)) {
            return {
                success: false,
                message: "该英雄已经上阵"
            };
        }

        let replacedCardId: string | undefined = undefined;

        // 检查同职业是否已有上阵的英雄
        const existingClassData = this._classData.get(cardData.class);
        if (existingClassData) {
            replacedCardId = existingClassData.cardId;
            console.log(`UserClassData: 职业 ${cardData.class} 的英雄 ${replacedCardId} 被 ${cardId} 替换`);
        }

        // 保留职业等级
        const classLevel = this._classLevels.get(cardData.class) || 1;
        const classData: ClassData = {
            classId: cardData.class,
            cardId: cardData.cardId,
            level: classLevel,
            attack: this.calculateAttackByLevel(classLevel, cardData.quality, cardData.sLevel),
            maxhp: this.calculateMaxHpByLevel(classLevel, cardData.quality, cardData.sLevel),
            cardData: cardData
        };

        // 设置新的职业数据（会自动覆盖旧的）
        this._classData.set(cardData.class, classData);

        const message = replacedCardId
            ? `英雄 ${cardId} 上阵成功，替换了 ${replacedCardId}`
            : `英雄 ${cardId} 上阵成功`;

        console.log(`UserClassData: ${message}，职业 ${cardData.class}，等级 ${classLevel}`);

        return {
            success: true,
            message: message,
            replacedCardId: replacedCardId
        };
    }

    private calculateAttackByLevel(level: number, quality: number, sLevel: number): number {
        return level * 10 + quality * 50 + sLevel * 100;
    }



    /**
     * 根据等级和品质计算最大生命值
     * @param level 等级
     * @param quality 品质
     * @returns 最大生命值
     */
    private calculateMaxHpByLevel(level: number, quality: number, sLevel: number): number {
        return level * 100 + quality * 200 + sLevel * 300; // 生命值成长比攻击力更高
    }

    public getClassData(classId: number): ClassData | null {
        return this._classData.get(classId) || null;
    }

    public getAllClassData(): ClassData[] {
        return Array.from(this._classData.values()).sort((a, b) => a.classId - b.classId);
    }

    public getClassLevel(classId: number): number {
        return this._classLevels.get(classId) || 1;
    }

    public setClassLevel(classId: number, level: number): boolean {
        if (level <= 0) {
            return false;
        }

        this._classLevels.set(classId, level);
        const data = this._classData.get(classId);
        if (data) {
            data.level = level;
            data.attack = this.calculateAttackByLevel(level, data.cardData.quality, data.cardData.sLevel);
            data.maxhp = this.calculateMaxHpByLevel(level, data.cardData.quality, data.cardData.sLevel);
        }

        console.log(`UserClassData: 职业 ${classId} 等级设置为 ${level}`);
        return true;
    }

    public getCardLevel(cardId: string): number {
        for (const data of this._classData.values()) {
            if (data.cardId === cardId) {
                return data.level;
            }
        }
        return 0;
    }

    public setCardLevel(cardId: string, level: number): boolean {
        for (const data of this._classData.values()) {
            if (data.cardId === cardId) {
                return this.setClassLevel(data.classId, level);
            }
        }
        return false;
    }

    public getClassAttack(classId: number): number {
        const data = this._classData.get(classId);
        return data ? data.attack : 0;
    }

    /**
     * 获取职业最大生命值
     * @param classId 职业ID
     * @returns 最大生命值
     */
    public getClassMaxHp(classId: number): number {
        const data = this._classData.get(classId);
        return data ? data.maxhp : 0;
    }

    public isClassDeployed(classId: number): boolean {
        return this._classData.has(classId);
    }

    /**
     * 检查卡片是否已上阵
     * @param cardId 卡片ID
     * @returns 是否已上阵
     */
    public isCardDeployed(cardId: string): boolean {
        for (const data of this._classData.values()) {
            if (data.cardId === cardId) {
                return true;
            }
        }
        return false;
    }

    /**
    * 检查卡片是否已上阵
    * @param cardId 卡片ID
    * @returns 是否已上阵
    */
    public isCardDeployedbyheroid(heroId: string): boolean {
        for (const data of this._classData.values()) {
            if (data.cardData.heroId === heroId) {
                return true;
            }
        }
        return false;
    }

    public getDeployedCardIds(): string[] {
        return Array.from(this._classData.values())
            .sort((a, b) => a.classId - b.classId)
            .map(data => data.cardId);
    }

    /**
     * 获取所有已上阵卡片的完整数据（按职业ID排序）
     * @returns 已上阵的卡片数据数组
     */
    public getDeployedCardData(): CardData[] {
        return Array.from(this._classData.values())
            .sort((a, b) => a.classId - b.classId)
            .map(data => data.cardData);
    }

    /**
     * 获取所有已上阵英雄的英雄ID列表（按职业ID排序）
     * @returns 已上阵的英雄ID数组
     */
    public getDeployedHeroIds(): string[] {
        return Array.from(this._classData.values())
            .sort((a, b) => a.classId - b.classId)
            .map(classData => classData.cardData.heroId);
    }

    /**
     * 获取未上阵的英雄，每个职业最多1个,最多5个
     * NOTE这个是外域战斗的临时解决方案，最终应使用上阵2组10人的方案
     */
    public getUndeployHerosIds() {
        const userCards = this._userArmyData.getUserCards();
        const deployedHeroIds = this.getDeployedHeroIds();
        // console.log(`<>>>>>>>>>>>>>>>>>>>${JSON.stringify(deployedHeroIds)}`);

        // 按职业分组卡片
        const cardsByClass = new Map<number, CardData[]>();
        userCards.forEach(cardData => {
            if (deployedHeroIds.indexOf(cardData.heroId) == -1) {
                if (!cardsByClass.has(cardData.class)) {
                    cardsByClass.set(cardData.class, []);
                }
                cardsByClass.get(cardData.class)!.push(cardData);
            }
        });

        let returnIds: string[] = [];
        // 从每个职业中随机选择一个英雄上阵
        for (const classCards of cardsByClass.values()) {
            if (classCards.length > 0) {
                // 随机选择该职业的一个英雄(现在直接用第一个)
                const randomIndex = 0;// Math.floor(Math.random() * classCards.length);
                const selectedCard = classCards[randomIndex];
                returnIds.push(UserArmyData.getInstance().getCardById(selectedCard.cardId).heroId);
                if (returnIds.length >= 5) break; // 最多上阵5个英雄
            }
        }
        // console.log(`<>>>>>>>>>>>>>>>>>>>${JSON.stringify(returnIds)}`);
        return returnIds;
    }


    private deployDefaultCards(): void {
        const userCards = this._userArmyData.getUserCards();

        // 按职业分组卡片
        const cardsByClass = new Map<number, CardData[]>();
        userCards.forEach(cardData => {
            if (!cardsByClass.has(cardData.class)) {
                cardsByClass.set(cardData.class, []);
            }
            cardsByClass.get(cardData.class)!.push(cardData);
        });

        // 从每个职业中随机选择一个英雄上阵
        let deployedCount = 0;
        for (const [classId, classCards] of cardsByClass) {
            if (deployedCount >= 5) break; // 最多上阵5个英雄

            if (classCards.length > 0) {
                // 随机选择该职业的一个英雄
                const randomIndex = Math.floor(Math.random() * classCards.length);
                const selectedCard = classCards[randomIndex];

                const result = this.deployCard(selectedCard.cardId);
                if (result.success) {
                    deployedCount++;
                    console.log(`UserClassData: 职业 ${classId} 随机选择英雄 ${selectedCard.cardId} 上阵`);
                } else {
                    console.warn(`UserClassData: 职业 ${classId} 默认上阵失败 - ${result.message}`);
                }
            }
        }

        console.log(`UserClassData: 默认上阵完成，共上阵 ${deployedCount} 个英雄`);
    }

    /**
     * 根据卡片稀有度获取最大升级等级
     * @param quality 卡片品质/稀有度 (0-9)
     * @returns 最大等级
     */
    public getMaxLevelByQuality(quality: number): number {
        // 根据品质设置最大等级
        // 品质0-1: 最大等级30
        // 品质2-3: 最大等级50  
        // 品质4-5: 最大等级70
        // 品质6-7: 最大等级90
        // 品质8-9: 最大等级100

        if (quality <= 1) {
            return 30;
        } else if (quality <= 3) {
            return 50;
        } else if (quality <= 5) {
            return 70;
        } else if (quality <= 7) {
            return 90;
        } else {
            return 100;
        }
    }

    /**
     * 根据卡片ID获取最大升级等级
     * @param cardId 卡片ID
     * @returns 最大等级，如果卡片不存在则返回0
     */
    public getMaxLevelByCardId(cardId: string): number {
        const classData = this.getClassDataByCardId(cardId);
        if (!classData) {
            return 0;
        }
        return this.getMaxLevelByQuality(classData.cardData.quality);
    }

    public getUpgradeGoldCost(cardId: string): number {
        const classData = this.getClassDataByCardId(cardId);
        if (!classData) {
            return 0;
        }

        const currentLevel = classData.level;
        const maxLevel = this.getMaxLevelByCardId(cardId);

        if (currentLevel >= maxLevel) {
            return 0;
        }

        return currentLevel * 100;
    }

    /**
     * 获取升级道具消耗数量
     * @param cardId 卡片ID
     * @returns 升级所需的道具数量
     */
    public getUpgradeItemCost(cardId: string): number {
        const classData = this.getClassDataByCardId(cardId);
        if (!classData) {
            return 0;
        }

        const currentLevel = classData.level;
        const maxLevel = this.getMaxLevelByCardId(cardId);

        if (currentLevel >= maxLevel) {
            return 0;
        }

        // 道具消耗随等级递增：基础消耗 + 等级系数
        // 前期消耗较少，后期消耗增加
        const baseCost = Math.max(1, Math.floor(currentLevel / 5));
        const levelMultiplier = Math.floor(currentLevel / 10) + 1;

        return baseCost * levelMultiplier;
    }

    /**
     * 获取升级所需的道具类型
     * @param cardId 卡片ID
     * @returns 道具类型字符串
     */
    public getUpgradeItemType(cardId: string): string {
        const classData = this.getClassDataByCardId(cardId);
        if (!classData) {
            return "unknown_item";
        }

        const quality = classData.cardData.quality;
        // 根据卡片品质返回不同道具类型
        if (quality <= 2) {
            return "basic_exp_item";        // 基础经验道具
        } else if (quality <= 4) {
            return "advanced_exp_item";     // 高级经验道具
        } else if (quality <= 6) {
            return "rare_exp_item";         // 稀有经验道具
        } else {
            return "legendary_exp_item";    // 传说经验道具
        }
    }

    /**
     * 获取升级进度百分比
     * @param cardId 卡片ID
     * @returns 升级进度 (0-100)
     */
    public getUpgradeProgress(cardId: string): number {
        const classData = this.getClassDataByCardId(cardId);
        if (!classData) {
            return 0;
        }

        const currentLevel = classData.level;
        const maxLevel = this.getMaxLevelByCardId(cardId);

        if (maxLevel === 0) {
            return 0;
        }

        return Math.min(100, Math.floor((currentLevel / maxLevel) * 100));
    }

    /**
     * 获取升级后的属性预览
     * @param cardId 卡片ID
     * @returns 升级后的属性信息
     */
    public getUpgradePreview(cardId: string): { attack: number, maxhp: number, level: number } | null {
        const classData = this.getClassDataByCardId(cardId);
        if (!classData || !this.canUpgrade(cardId)) {
            return null;
        }

        const newLevel = classData.level + 1;
        const newAttack = this.calculateAttackByLevel(newLevel, classData.cardData.quality, classData.cardData.sLevel);
        const newMaxHp = this.calculateMaxHpByLevel(newLevel, classData.cardData.quality, classData.cardData.sLevel);

        return {
            attack: newAttack,
            maxhp: newMaxHp,
            level: newLevel
        };
    }

    /**
     * 检查是否有足够道具升级
     * @param cardId 卡片ID
     * @param userItems 用户道具数量映射
     * @returns 是否有足够道具
     */
    public canAffordUpgradeItems(cardId: string, userItems: Map<string, number>): boolean {
        if (!this.canUpgrade(cardId)) {
            return false;
        }

        const itemType = this.getUpgradeItemType(cardId);
        const itemCost = this.getUpgradeItemCost(cardId);
        const userItemCount = userItems.get(itemType) || 0;

        return userItemCount >= itemCost;
    }

    /**
     * 获取完整的升级信息
     * @param cardId 卡片ID
     * @returns 升级信息对象
     */
    public getUpgradeInfo(cardId: string): {
        canUpgrade: boolean;
        goldCost: number;
        itemCost: number;
        itemType: string;
        progress: number;
        preview: { attack: number, maxhp: number, level: number } | null;
        currentLevel: number;
        maxLevel: number;
    } {
        const classData = this.getClassDataByCardId(cardId);
        const canUpgrade = this.canUpgrade(cardId);

        return {
            canUpgrade: canUpgrade,
            goldCost: this.getUpgradeGoldCost(cardId),
            itemCost: this.getUpgradeItemCost(cardId),
            itemType: this.getUpgradeItemType(cardId),
            progress: this.getUpgradeProgress(cardId),
            preview: this.getUpgradePreview(cardId),
            currentLevel: classData ? classData.level : 0,
            maxLevel: this.getMaxLevelByCardId(cardId)
        };
    }

    /**
     * 检查卡片是否可以升级
     * 只基于当前等级和最大等级判断，不考虑金币
     * @param cardId 卡片ID
     * @returns 是否可以升级
     */
    public canUpgrade(cardId: string): boolean {
        const classData = this.getClassDataByCardId(cardId);
        if (!classData) {
            return false;
        }

        const currentLevel = classData.level;
        const maxLevel = this.getMaxLevelByCardId(cardId);

        return currentLevel < maxLevel;
    }

    /**
     * 检查是否有足够金币升级
     * @param cardId 卡片ID
     * @param userGold 用户当前金币数量
     * @returns 是否有足够金币
     */
    public canAffordUpgrade(cardId: string, userGold: number): boolean {
        if (!this.canUpgrade(cardId)) {
            return false;
        }

        const goldCost = this.getUpgradeGoldCost(cardId);
        return userGold >= goldCost;
    }

    public upgradeCard(cardId: string, userGold: number): UpgradeResult {
        const goldCost = this.getUpgradeGoldCost(cardId);
        if (goldCost === 0) {
            return {
                success: false,
                message: "卡片未上场或已达最高等级"
            };
        }

        if (userGold < goldCost) {
            return {
                success: false,
                message: "金币不足"
            };
        }

        const classData = this.getClassDataByCardId(cardId);
        if (!classData) {
            return {
                success: false,
                message: "找不到对应的职业数据"
            };
        }

        const newLevel = classData.level + 1;
        const upgradeSuccess = this.setClassLevel(classData.classId, newLevel);

        if (!upgradeSuccess) {
            return {
                success: false,
                message: "升级失败"
            };
        }

        const newAttack = this.getClassAttack(classData.classId);
        const newMaxHp = this.getClassMaxHp(classData.classId);

        return {
            success: true,
            message: `升级成功！等级提升至 ${newLevel}`,
            newLevel: newLevel,
            newAttack: newAttack,
            newMaxHp: newMaxHp,
            costGold: goldCost
        };
    }

    /**
     * 通过英雄ID获取对应的职业数据
     * @param heroId 英雄ID
     * @returns 对应的ClassData，如果未找到则返回null
     */
    public getClassDataByHeroId(heroId: string): ClassData | null {
        // 遍历所有已上阵的职业数据
        for (const classData of this._classData.values()) {
            if (classData.cardData.heroId === heroId) {
                return classData;
            }
        }
        return null;
    }

    /**
     * 检查英雄是否已上阵并获取其职业数据
     * @param heroId 英雄ID
     * @returns 包含是否上阵和职业数据的对象
     */
    public getHeroDeployStatus(heroId: string): { isDeployed: boolean, classData: ClassData | null } {
        const classData = this.getClassDataByHeroId(heroId);
        return {
            isDeployed: classData !== null,
            classData: classData
        };
    }

    private getClassDataByCardId(cardId: string): ClassData | null {
        for (const data of this._classData.values()) {
            if (data.cardId === cardId) {
                return data;
            }
        }
        return null;
    }

    /**
     * 完整的升级方法（包含道具消耗）
     * @param cardId 卡片ID
     * @param userGold 用户金币
     * @param userItems 用户道具数量映射
     * @returns 升级结果
     */
    public upgradeCardWithItems(cardId: string, userGold: number, userItems: Map<string, number>): UpgradeResult & {
        consumedItems?: { type: string, count: number }
    } {
        // 检查基础升级条件
        const upgradeResult = this.upgradeCard(cardId, userGold);
        if (!upgradeResult.success) {
            return upgradeResult;
        }

        // 检查道具消耗
        const itemType = this.getUpgradeItemType(cardId);
        const itemCost = this.getUpgradeItemCost(cardId);

        if (!this.canAffordUpgradeItems(cardId, userItems)) {
            return {
                success: false,
                message: `道具不足，需要 ${itemType} x${itemCost}`
            };
        }

        // 消耗道具
        const currentItemCount = userItems.get(itemType) || 0;
        userItems.set(itemType, currentItemCount - itemCost);

        return {
            ...upgradeResult,
            consumedItems: {
                type: itemType,
                count: itemCost
            }
        };
    }

    /**
     * 获取升级推荐策略
     * @param cardId 卡片ID
     * @param userGold 用户金币
     * @returns 升级建议
     */
    public getUpgradeStrategy(cardId: string, userGold: number): {
        recommendedLevel: number;
        maxAffordableLevel: number;
        totalCost: number;
        costBreakdown: Array<{ level: number, cost: number }>;
    } {
        const classData = this.getClassDataByCardId(cardId);
        if (!classData) {
            return {
                recommendedLevel: 0,
                maxAffordableLevel: 0,
                totalCost: 0,
                costBreakdown: []
            };
        }

        const currentLevel = classData.level;
        const maxLevel = this.getMaxLevelByCardId(cardId);
        const costBreakdown: Array<{ level: number, cost: number }> = [];

        let totalCost = 0;
        let maxAffordableLevel = currentLevel;

        // 计算每级升级成本
        for (let level = currentLevel; level < maxLevel; level++) {
            // 临时设置等级以计算成本
            const tempClassData = { ...classData, level: level };
            const goldCost = level * 100; // 使用简化的成本计算

            costBreakdown.push({
                level: level + 1,
                cost: goldCost
            });

            if (totalCost + goldCost <= userGold) {
                totalCost += goldCost;
                maxAffordableLevel = level + 1;
            } else {
                break;
            }
        }

        // 推荐升级到用户可承受的最高等级的80%，保留一些金币
        const recommendedLevel = Math.min(
            Math.floor(maxAffordableLevel * 0.8),
            currentLevel + 5 // 一次最多推荐升级5级
        );

        return {
            recommendedLevel: Math.max(recommendedLevel, currentLevel),
            maxAffordableLevel,
            totalCost,
            costBreakdown
        };
    }

    //更新职业数据
    public updateClassData(cardId: string): void {
        //先判断是否已经上阵英雄 如果上阵 则更新职业数据


        //卡牌库中获取最新的数据
        const cardData = UserArmyData.getInstance().getCardById(cardId);
        if (!cardData) {
            return;
        }

        const classData = this.getClassDataByCardId(cardId);
        if (!classData) {
            return;
        }

        classData.cardData = cardData
        classData.level = classData.level;
        classData.attack = this.calculateAttackByLevel(classData.level, classData.cardData.quality, classData.cardData.sLevel);
        classData.maxhp = this.calculateMaxHpByLevel(classData.level, classData.cardData.quality, classData.cardData.sLevel);

        this._classData.set(classData.classId, classData);
    }

    //计算 1 级 老品质 老等级 提升的数值

    /**
     * 
     * @param oldQuality 老品质
     * @param oldLevel 老等级
     * @param oldSLevel 老星级
     * @param newQuality 新品质
     * @param newLevel 新等级
     * @param newSLevel 新星级
     * @returns 提升的数值
     */
    public calculateUpgradeValue(oldQuality: number, oldLevel: number, oldSLevel: number, newQuality: number, newLevel: number, newSLevel: number): any {

        const oldAttack = this.calculateAttackByLevel(oldLevel, oldQuality, oldSLevel);
        const oldMaxHp = this.calculateMaxHpByLevel(oldLevel, oldQuality, oldSLevel);
        const newAttack = this.calculateAttackByLevel(newLevel, newQuality, newSLevel);
        const newMaxHp = this.calculateMaxHpByLevel(newLevel, newQuality, newSLevel);

        return {
            oldAttack: oldAttack,
            oldMaxHp: oldMaxHp,
            oldQuality: oldQuality,
            oldLevel: oldLevel,

            newAttack: newAttack,
            newMaxHp: newMaxHp,
            newQuality: newQuality,
            newLevel: newLevel,

            addAttack: newAttack - oldAttack,
            addMaxHp: newMaxHp - oldMaxHp,
            addQuality: newQuality - oldQuality
        };
    }

    /**
     * 测试上阵/替换逻辑（开发调试用）
     */
    public testDeployLogic(): void {
        console.log("=== 开始测试上阵/替换逻辑 ===");

        const userCards = this._userArmyData.getUserCards();
        if (userCards.length < 3) {
            console.warn("测试需要至少3张卡片");
            return;
        }

        // 清空当前阵容
        this._classData.clear();

        // 测试0: 随机默认上阵
        console.log("\n--- 测试0: 随机默认上阵 ---");
        this.deployDefaultCards();
        console.log(`随机上阵结果: ${this.getDeployedCardIds().join(', ')}`);

        // 清空重新测试
        this._classData.clear();

        // 测试1: 正常上阵
        console.log("\n--- 测试1: 正常上阵 ---");
        const card1 = userCards[0];
        const result1 = this.deployCard(card1.cardId);
        console.log(`上阵结果: ${result1.message}`);
        console.log(`当前阵容: ${this.getDeployedCardIds().join(', ')}`);

        // 测试2: 同职业替换
        console.log("\n--- 测试2: 同职业替换 ---");
        const sameClassCard = userCards.find(card =>
            card.class === card1.class && card.cardId !== card1.cardId
        );

        if (sameClassCard) {
            const result2 = this.deployCard(sameClassCard.cardId);
            console.log(`替换结果: ${result2.message}`);
            console.log(`被替换的卡片: ${result2.replacedCardId}`);
            console.log(`当前阵容: ${this.getDeployedCardIds().join(', ')}`);
        } else {
            console.log("没有找到同职业的其他卡片");
        }

        // 测试3: 重复上阵同一卡片
        console.log("\n--- 测试3: 重复上阵同一卡片 ---");
        const currentCard = this.getDeployedCardIds()[0];
        if (currentCard) {
            const result3 = this.deployCard(currentCard);
            console.log(`重复上阵结果: ${result3.message}`);
        }

        // 测试4: 多次随机上阵验证随机性
        console.log("\n--- 测试4: 多次随机上阵验证随机性 ---");
        for (let i = 0; i < 3; i++) {
            this._classData.clear();
            this.deployDefaultCards();
            console.log(`第${i + 1}次随机上阵: ${this.getDeployedCardIds().join(', ')}`);
        }

        console.log("\n=== 测试完成 ===");
    }
}