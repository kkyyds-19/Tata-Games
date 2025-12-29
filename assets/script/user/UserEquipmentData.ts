import { director } from 'cc';
import { EquipmentConfig, equipmentConfigs, SkillEffect, ClassType } from '../global/config/EquipmentConfig';
import { game } from 'cc';
import { equipmentAPI } from '../api/EquipmentAPI';
import { AddEquipmentRequest, EquipmentInfo, EquipmentListResponse } from '../api/APITypes';

/**
 * 用户装备数据 - 对基础配置的扩展
 */
export interface UserEquipmentItem {
    equipId: number;            // 装备ID (对应EquipmentConfig.id)
    level: number;              // 装备等级
    currentFragments: number;   // 当前拥有碎片数量
    maxFragments: number;       // 升级所需最大碎片数量
    isUnlocked: boolean;        // 是否已解锁
    isOwned: boolean;           // 是否拥有
    name_as:string;             //别名
}

/**
 * 装备槽位类型
 */
export enum EquipSlotType {
    CHOSEN = 'chosen',      // 天选装备槽 (永久装备)
    TEMPORARY = 'temporary' // 游戏临时装备槽
}

/**
 * 职业加成数据
 */
export interface ClassBonus {
    classType: ClassType;
    className: string;
    bonuses: { [key: string]: number }; // 技能效果类型 -> 加成值
}

/**
 * 用户装备管理类
 */
export class UserEquipmentData {
    private static instance: UserEquipmentData = null;
    
    // 调试开关：是否在初始化时生成模拟数据
    private static readonly ENABLE_MOCK_DATA = true; // 发布时改为 false
    
    // 用户拥有的装备数据
    private userEquipments: Map<number, UserEquipmentItem> = new Map();
    
    // 天选装备栏 (3个槽位)
    private chosenEquipSlots: (UserEquipmentItem | null)[] = [null, null, null];
    
    // 游戏临时装备栏 (存储装备ID，动态引用用户装备数据)
    private temporaryEquipSlots: number[] = [];
    
    // 【新增】临时装备职业加成缓存（自动更新，避免重复计算）
    private temporaryEquipmentClassBonuses: ClassBonus[] = [];

    private constructor() {
        this.initializeUserEquipments();
        
        // 【新增】初始化临时装备职业加成缓存
        this.initializeTemporaryEquipmentClassBonuses();
        
        // 【新增】异步从服务器同步数据
        // this.syncFromServer().then(success => {
        //     if (success) {
        //         console.log('[UserEquipmentData] 服务器数据同步成功');
        //     } else {
        //         console.warn('[UserEquipmentData] 服务器数据同步失败，使用本地数据');
        //     }
        // }).catch(error => {
        //     console.error('[UserEquipmentData] 服务器数据同步异常:', error);
        // });
        
        // 开发模式下生成测试数据
        if (UserEquipmentData.ENABLE_MOCK_DATA) {
            this.generateMockData();
        }
    }

    public static getInstance(): UserEquipmentData {
        if (!UserEquipmentData.instance) {
            UserEquipmentData.instance = new UserEquipmentData();
        }
        return UserEquipmentData.instance;
    }

    /**
     * 初始化用户装备数据
     */
    private initializeUserEquipments() {
        equipmentConfigs.forEach(config => {
            const userEquip: UserEquipmentItem = {
                equipId: config.id,
                level: 1,
                currentFragments: 0,
                maxFragments: this.calculateMaxFragments(config.equipLevel),
                isUnlocked: config.unlockBy === 0, // 基础装备默认解锁
                isOwned: false,
                name_as:config.iconFrameName
            };
            this.userEquipments.set(config.id, userEquip);
        });
    }

    /**
     * 【新增】初始化临时装备职业加成缓存
     */
    private initializeTemporaryEquipmentClassBonuses(): void {
        // 初始化各职业的空加成
        const classNames = {
            [ClassType.TANK]: "坦克",
            [ClassType.PRIEST]: "牧师", 
            [ClassType.HUNTER]: "猎人",
            [ClassType.MAGE]: "法师",
            [ClassType.ASSASSIN]: "刺客"
        };

        this.temporaryEquipmentClassBonuses = [];
        for (const classType in classNames) {
            const type = parseInt(classType) as ClassType;
            this.temporaryEquipmentClassBonuses.push({
                classType: type,
                className: classNames[type],
                bonuses: {}
            });
        }
    }

    /**
     * 计算升级所需最大碎片数量
     * @param equipLevel 装备等级
     * @returns 最大碎片数量
     */
    private calculateMaxFragments(equipLevel: number): number {
        // 基础公式: 等级越高需要碎片越多
        return 20 + (equipLevel - 1) * 10;
    }

    // ============ 装备获取和管理 ============

    /**
     * 获取用户装备数据
     * @param equipId 装备ID
     * @returns 用户装备数据
     */
    getUserEquipment(equipId: number): UserEquipmentItem | null {
        return this.userEquipments.get(equipId) || null;
    }

    /**
     * 获取所有用户装备数据
     * @returns 所有装备数据
     */
    getAllUserEquipments(): UserEquipmentItem[] {
        return Array.from(this.userEquipments.values());
    }

    /**
     * 获取已拥有的装备列表
     * @returns 已拥有的装备数据
     */
    getOwnedEquipments(): UserEquipmentItem[] {
        return Array.from(this.userEquipments.values()).filter(equip => equip.isOwned);
    }

    /**
     * 获取已解锁的装备列表
     * @returns 已解锁的装备数据
     */
    getUnlockedEquipments(): UserEquipmentItem[] {
        return Array.from(this.userEquipments.values()).filter(equip => equip.isUnlocked);
    }

    // ============ 装备碎片管理 ============

    /**
     * 添加装备碎片
     * @param equipId 装备ID
     * @param amount 添加数量
     * @returns 是否成功
     */
    async addFragments(equipId: number, amount: number): Promise<boolean> {
        const userEquip = this.getUserEquipment(equipId);
        if (!userEquip) return false;

        userEquip.currentFragments += amount;
        
        // 检查是否可以升级或解锁
        if (userEquip.currentFragments >= userEquip.maxFragments) {
            this.checkAutoUpgrade(userEquip);
        }
        
        // 同步到服务器
        await this.syncEquipmentToServer(equipId);
        
        return true;
    }

    /**
     * 自动升级检查
     * @param userEquip 用户装备数据
     */
    private checkAutoUpgrade(userEquip: UserEquipmentItem) {
        if (!userEquip.isOwned && userEquip.currentFragments >= userEquip.maxFragments) {
            // 首次获得装备
            userEquip.isOwned = true;
            userEquip.currentFragments -= userEquip.maxFragments;
            console.log(`[UserEquipmentData] 获得新装备: ${userEquip.equipId}`);
        }
        // TODO: 装备升级逻辑预留
    }

    // ============ 天选装备栏管理 ============

    /**
     * 装备到天选装备栏
     * @param equipId 装备ID
     * @param slotIndex 槽位索引 (0-2)
     * @returns 是否成功
     */
    equipToChosenSlot(equipId: number, slotIndex: number): boolean {
        if (slotIndex < 0 || slotIndex >= 3) return false;
        
        const userEquip = this.getUserEquipment(equipId);
        if (!userEquip || !userEquip.isOwned) return false;

        this.chosenEquipSlots[slotIndex] = userEquip;
        return true;
    }

    /**
     * 从天选装备栏卸下装备
     * @param slotIndex 槽位索引 (0-2)
     * @returns 是否成功
     */
    unequipFromChosenSlot(slotIndex: number): boolean {
        if (slotIndex < 0 || slotIndex >= 3) return false;
        
        this.chosenEquipSlots[slotIndex] = null;
        return true;
    }

    /**
     * 获取天选装备栏
     * @returns 天选装备栏数据
     */
    getChosenEquipSlots(): (UserEquipmentItem | null)[] {
        return [...this.chosenEquipSlots];
    }

    /**
     * 获取指定槽位的天选装备
     * @param slotIndex 槽位索引 (0-2)
     * @returns 装备数据或null
     */
    getChosenEquipment(slotIndex: number): UserEquipmentItem | null {
        if (slotIndex < 0 || slotIndex >= 3) return null;
        return this.chosenEquipSlots[slotIndex];
    }

    // ============ 游戏临时装备栏管理 ============

    /**
     * 添加临时装备 (游戏关卡中获得)
     * @param equipId 装备ID
     * @returns 是否成功
     */
    async addTemporaryEquipment(equipId: number): Promise<boolean> {
        const userEquip = this.getUserEquipment(equipId);
        if (!userEquip) return false;

        // 【修改】直接存储装备ID，引用用户装备数据（包含升级状态）
        this.temporaryEquipSlots.push(equipId);
        
        // 【新增】自动解锁关联装备
        await this.autoUnlockRelatedEquipments(equipId);
        
        // 【新增】自动更新临时装备职业加成
        this.updateTemporaryEquipmentClassBonuses();
        
        return true;
    }

    /**
     * 移除指定的临时装备
     * @param equipId 装备ID
     * @returns 是否成功移除
     */
    removeTemporaryEquipment(equipId: number): boolean {
        const index = this.temporaryEquipSlots.findIndex(id => id === equipId);
        if (index !== -1) {
            const removedEquipId = this.temporaryEquipSlots.splice(index, 1)[0];
            console.log(`[UserEquipmentData] 移除临时装备: ${removedEquipId}`);
            
            // 【新增】自动更新临时装备职业加成
            this.updateTemporaryEquipmentClassBonuses();
            
            return true;
        }
        return false;
    }

    /**
     * 清空临时装备栏 (游戏结束时调用)
     */
    clearTemporaryEquipments() {
        this.temporaryEquipSlots = [];
        
        // 【新增】清空临时装备职业加成缓存
        this.temporaryEquipmentClassBonuses = [];
        
        // 【新增】自动上锁非基础装备
        this.autoLockNonBasicEquipments();
    }

    /**
     * 获取临时装备栏
     * @returns 临时装备列表（动态获取用户装备数据）
     */
    getTemporaryEquipments(): UserEquipmentItem[] {
        return this.temporaryEquipSlots
            .map(equipId => this.getUserEquipment(equipId))
            .filter(equip => equip !== null) as UserEquipmentItem[];
    }

    // ============ 装备解锁管理 ============

    /**
     * 检查装备解锁条件
     * @param equipId 装备ID
     * @returns 是否可解锁
     */
    checkUnlockCondition(equipId: number): boolean {
        const config = equipmentConfigs.find(c => c.id === equipId);
        if (!config) return false;

        if (config.unlockBy === 0) return true; // 基础装备

        // 检查前置装备是否拥有
        const prerequisiteEquip = this.getUserEquipment(config.unlockBy);
        return prerequisiteEquip ? prerequisiteEquip.isOwned : false;
    }

    /**
     * 解锁装备
     * @param equipId 装备ID
     * @returns 是否成功
     */
    async unlockEquipment(equipId: number): Promise<boolean> {
        const userEquip = this.getUserEquipment(equipId);
        if (!userEquip || userEquip.isUnlocked) return false;

        if (this.checkUnlockCondition(equipId)) {
            userEquip.isUnlocked = true;
            
            // 同步到服务器
            await this.syncEquipmentToServer(equipId);
            
            return true;
        }
        return false;
    }

    // ============ 装备升级管理 ============

    /**
     * 升级装备
     * @param equipId 装备ID
     * @returns 是否成功
     */
    async upgradeEquipment(equipId: number): Promise<boolean> {
        const userEquip = this.getUserEquipment(equipId);
        if (!userEquip) return false;

        // 检查升级条件
        if (!userEquip.isOwned || 
            userEquip.level >= 5 || 
            userEquip.currentFragments < userEquip.maxFragments) {
            return false;
        }

        // 执行升级
        userEquip.currentFragments -= userEquip.maxFragments;
        userEquip.level++;
        
        // 更新最大碎片数量
        userEquip.maxFragments = this.calculateMaxFragments(userEquip.level);
        
        console.log(`[UserEquipmentData] 装备${equipId}升级到${userEquip.level}级`);
        
        // 【新增】如果该装备在临时装备栏中，自动更新临时装备职业加成
        if (this.temporaryEquipSlots.indexOf(equipId) !== -1) {
            this.updateTemporaryEquipmentClassBonuses();
            console.log(`[UserEquipmentData] 检测到临时装备升级，已更新职业加成`);
        }
        
        // 同步到服务器
        await this.syncEquipmentToServer(equipId);
        
        return true;
    }

    /**
     * 获取装备的实际技能效果（包含等级加成）
     * @param equipId 装备ID
     * @returns 技能效果数组
     */
    getEquipmentActualSkillEffects(equipId: number): SkillEffect[] {
        const userEquip = this.getUserEquipment(equipId);
        const equipConfig = equipmentConfigs.find(config => config.id === equipId);
        
        if (!userEquip || !equipConfig || !userEquip.isOwned) {
            return [];
        }

        // 基础技能效果
        const baseEffects = equipConfig.skillEffects;
        
        // 根据等级计算实际效果
        const actualEffects: SkillEffect[] = baseEffects.map(effect => ({
            ...effect,
            // 等级加成：每级增加基础效果的20%
            value: effect.value * (1 + (userEquip.level - 1) * 0.2)
        }));

        return actualEffects;
    }

    /**
     * 获取装备的完整信息（包含基础配置和用户数据）
     * @param equipId 装备ID
     * @returns 装备完整信息
     */
    getEquipmentFullInfo(equipId: number): { userEquip: UserEquipmentItem; config: EquipmentConfig; actualEffects: SkillEffect[] } | null {
        const userEquip = this.getUserEquipment(equipId);
        const equipConfig = equipmentConfigs.find(config => config.id === equipId);
        
        if (!userEquip || !equipConfig) {
            return null;
        }

        const actualEffects = this.getEquipmentActualSkillEffects(equipId);
        
        return {
            userEquip: userEquip,
            config: equipConfig,
            actualEffects: actualEffects
        };
    }

    // ============ 职业加成计算 ============

    /**
     * 计算天选装备各职业的总加成
     * @returns 职业加成数据
     */
    calculateClassBonuses(): ClassBonus[] {
        const chosenEquipments = this.getChosenEquipSlots();
        
        // 初始化各职业加成
        const classBonusMap = new Map<ClassType, { [key: string]: number }>();
        
        // 初始化所有职业
        const classNames = {
            [ClassType.TANK]: "坦克",
            [ClassType.PRIEST]: "牧师", 
            [ClassType.HUNTER]: "猎人",
            [ClassType.MAGE]: "法师",
            [ClassType.ASSASSIN]: "刺客"
        };

        // 初始化职业加成映射
        for (const classType in classNames) {
            const type = parseInt(classType) as ClassType;
            classBonusMap.set(type, {});
        }

        // 计算装备加成
        chosenEquipments.forEach(userEquip => {
            if (!userEquip) return;

            // 获取装备的实际技能效果（包含等级加成）
            const actualEffects = this.getEquipmentActualSkillEffects(userEquip.equipId);
            
            actualEffects.forEach(effect => {
                this.applyEffectToClasses(effect, classBonusMap);
            });
        });

        // 转换为数组格式
        const result: ClassBonus[] = [];
        classBonusMap.forEach((bonuses, classType) => {
            result.push({
                classType: classType,
                className: classNames[classType],
                bonuses: bonuses
            });
        });

        return result;
    }

    /**
     * 【新增】获取临时装备的职业加成（缓存版本，自动更新）
     * @returns 临时装备职业加成数据
     */
    getTemporaryEquipmentClassBonuses(): ClassBonus[] {
        return [...this.temporaryEquipmentClassBonuses];
    }

    /**
     * 【新增】重新计算并更新临时装备的职业加成缓存
     */
    private updateTemporaryEquipmentClassBonuses(): void {
        // 初始化各职业加成
        const classBonusMap = new Map<ClassType, { [key: string]: number }>();
        
        // 初始化所有职业
        const classNames = {
            [ClassType.TANK]: "坦克",
            [ClassType.PRIEST]: "牧师", 
            [ClassType.HUNTER]: "猎人",
            [ClassType.MAGE]: "法师",
            [ClassType.ASSASSIN]: "刺客"
        };

        // 初始化职业加成映射
        for (const classType in classNames) {
            const type = parseInt(classType) as ClassType;
            classBonusMap.set(type, {});
        }

        // 计算临时装备加成
        this.temporaryEquipSlots.forEach(equipId => {
            // 【修改】通过装备ID获取用户装备数据（包含最新的升级状态）
            const userEquip = this.getUserEquipment(equipId);
            if (!userEquip || !userEquip.isOwned) return;

            // 获取装备的实际技能效果（包含等级加成）
            const actualEffects = this.getEquipmentActualSkillEffects(equipId);
            
            actualEffects.forEach(effect => {
                this.applyEffectToClasses(effect, classBonusMap);
            });
        });

        // 转换为数组格式并更新缓存
        const result: ClassBonus[] = [];
        classBonusMap.forEach((bonuses, classType) => {
            result.push({
                classType: classType,
                className: classNames[classType],
                bonuses: bonuses
            });
        });

        this.temporaryEquipmentClassBonuses = result;

        //发送一个事件 临时装备职业加成已更新
        director.emit(game.gameEvent.GAME_TEMPORARY_EQUIPMENT_CLASS_BONUSES_UPDATED, result);
        
    }

    /**
     * 将技能效果应用到职业加成中
     * @param effect 技能效果
     * @param classBonusMap 职业加成映射
     */
    private applyEffectToClasses(effect: SkillEffect, classBonusMap: Map<ClassType, { [key: string]: number }>) {
        if (effect.targetClass === ClassType.ALL) {
            // 全体加成：应用到所有职业
            classBonusMap.forEach((bonuses) => {
                bonuses[effect.type] = (bonuses[effect.type] || 0) + effect.value;
            });
        } else {
            // 特定职业加成
            const targetBonuses = classBonusMap.get(effect.targetClass);
            if (targetBonuses) {
                targetBonuses[effect.type] = (targetBonuses[effect.type] || 0) + effect.value;
            }
        }
    }

    // ============ 数据持久化 (功能预留) ============

    /**
     * 保存数据到本地存储
     * TODO: 实现数据持久化逻辑
     */
    saveToLocal() {
        // 功能预留: 保存用户装备数据到本地
        console.log('[UserEquipmentData] 保存数据到本地 (功能预留)');
    }

    /**
     * 从本地存储加载数据
     * TODO: 实现数据加载逻辑
     */
    loadFromLocal() {
        // 功能预留: 从本地加载用户装备数据
        console.log('[UserEquipmentData] 从本地加载数据 (功能预留)');
    }

    // ============ 服务器同步 ============

    /**
     * 从服务器拉取装备数据并同步
     * @returns Promise<boolean> 是否同步成功
     */
    async syncFromServer(): Promise<boolean> {
        console.log('[UserEquipmentData] 开始从服务器拉取装备数据...');
        
        try {
            // 从服务器获取装备列表
            const response: EquipmentListResponse = await equipmentAPI.getEquipmentList();
            
            if (response && response.code === 200) {
                const serverEquipments = response.data;
                
                if (serverEquipments && serverEquipments.length > 0) {
                    // 服务器有数据，解析并初始化本地数据
                    console.log(`[UserEquipmentData] 服务器返回${serverEquipments.length}个装备数据，开始解析...`);
                    this.initializeFromServerData(serverEquipments);
                    return true;
                } else {
                    // 服务器数据为空，将本地数据同步到服务器
                    console.log('[UserEquipmentData] 服务器数据为空，将本地数据同步到服务器...');
                    return await this.syncAllEquipmentsToServer() > 0;
                }
            } else {
                console.error('[UserEquipmentData] 从服务器获取装备数据失败:', response);
                return false;
            }
        } catch (error) {
            console.error('[UserEquipmentData] 从服务器拉取装备数据异常:', error);
            return false;
        }
    }

    /**
     * 从服务器数据初始化本地装备数据
     * @param serverEquipments 服务器返回的装备数据（JSON字符串数组）
     */
    private initializeFromServerData(serverEquipments: string[]): void {
        console.log('[UserEquipmentData] 开始从服务器数据初始化本地装备数据...');
        
        // 清空现有数据
        this.userEquipments.clear();
        
        // 遍历服务器数据，解析JSON字符串并初始化本地装备
        serverEquipments.forEach((jsonString, index) => {
            try {
                // 解析JSON字符串
                const serverEquip: EquipmentInfo = JSON.parse(jsonString);
                
                const userEquip: UserEquipmentItem = {
                    equipId: serverEquip.equipId,
                    level: serverEquip.level,
                    currentFragments: serverEquip.currentFragments,
                    maxFragments: serverEquip.maxFragments,
                    isUnlocked: serverEquip.isUnlocked,
                    isOwned: serverEquip.isOwned,
                    name_as: serverEquip.name_as || this.getDefaultNameAs(serverEquip.equipId)
                };
                
                this.userEquipments.set(serverEquip.equipId, userEquip);
                console.log(`[UserEquipmentData] 初始化装备: ID=${serverEquip.equipId}, 等级=${serverEquip.level}, 碎片=${serverEquip.currentFragments}/${serverEquip.maxFragments}, 解锁=${serverEquip.isUnlocked}, 拥有=${serverEquip.isOwned}`);
            } catch (error) {
                console.error(`[UserEquipmentData] 解析装备数据失败 (索引${index}):`, jsonString, error);
            }
        });
        
        // 检查是否有缺失的装备配置，如果有则补充
        // this.supplementMissingEquipments();
        
        console.log(`[UserEquipmentData] 从服务器数据初始化完成，共${this.userEquipments.size}个装备`);
    }

    /**
     * 补充缺失的装备配置
     */
    private supplementMissingEquipments(): void {
        let supplementCount = 0;
        
        equipmentConfigs.forEach(config => {
            if (!this.userEquipments.has(config.id)) {
                // 服务器数据中缺少此装备，使用默认配置初始化
                const userEquip: UserEquipmentItem = {
                    equipId: config.id,
                    level: 1,
                    currentFragments: 0,
                    maxFragments: this.calculateMaxFragments(config.equipLevel),
                    isUnlocked: config.unlockBy === 0, // 基础装备默认解锁
                    isOwned: false,
                    name_as: config.iconFrameName
                };
                
                this.userEquipments.set(config.id, userEquip);
                supplementCount++;
                console.log(`[UserEquipmentData] 补充缺失装备: ID=${config.id}, 名称=${config.name}`);
            }
        });
        
        if (supplementCount > 0) {
            console.log(`[UserEquipmentData] 补充了${supplementCount}个缺失的装备配置`);
        }
    }

    /**
     * 获取默认的name_as值
     * @param equipId 装备ID
     * @returns 默认的name_as值
     */
    private getDefaultNameAs(equipId: number): string {
        const config = equipmentConfigs.find(c => c.id === equipId);
        return config ? config.iconFrameName : `equipment_${equipId}`;
    }

    /**
     * 将本地装备数据转换为服务器格式
     * @returns 服务器格式的装备数据数组
     */
    private convertToServerFormat(): EquipmentInfo[] {
        const serverEquipments: EquipmentInfo[] = [];
        
        this.userEquipments.forEach((userEquip, equipId) => {
            const serverEquip: EquipmentInfo = {
                equipId: userEquip.equipId,
                level: userEquip.level,
                currentFragments: userEquip.currentFragments,
                maxFragments: userEquip.maxFragments,
                isUnlocked: userEquip.isUnlocked,
                isOwned: userEquip.isOwned,
                name_as: userEquip.name_as
            };
            
            serverEquipments.push(serverEquip);
        });
        
        return serverEquipments;
    }

    /**
     * 同步装备数据到服务器
     * @param equipId 装备ID
     * @returns Promise<boolean> 是否同步成功
     */
    async syncEquipmentToServer(equipId: number): Promise<boolean> {
        const userEquip = this.getUserEquipment(equipId);
        if (!userEquip) {
            console.error(`[UserEquipmentData] 装备${equipId}不存在，无法同步到服务器`);
            return false;
        }

        try {
            const equipmentRequest: AddEquipmentRequest = {
                equipId: userEquip.equipId,
                level: userEquip.level,
                currentFragments: userEquip.currentFragments,
                maxFragments: userEquip.maxFragments,
                isUnlocked: userEquip.isUnlocked,
                isOwned: userEquip.isOwned,
                name_as: userEquip.name_as
            };

            const response = await equipmentAPI.addEquipment(equipmentRequest);
            
            if (response && response.code === 200) {
                console.log(`[UserEquipmentData] 装备${equipId}同步到服务器成功，记录ID: ${response.data}`);
                return true;
            } else {
                console.error(`[UserEquipmentData] 装备${equipId}同步到服务器失败:`, response);
                return false;
            }
        } catch (error) {
            console.error(`[UserEquipmentData] 装备${equipId}同步到服务器异常:`, error);
            return false;
        }
    }

    /**
     * 同步所有装备数据到服务器
     * @returns Promise<number> 成功同步的装备数量
     */
    async syncAllEquipmentsToServer(): Promise<number> {
        console.log('[UserEquipmentData] 开始同步所有装备数据到服务器...');
        
        const allEquipments = this.getAllUserEquipments();
        let successCount = 0;
        
        for (const userEquip of allEquipments) {
            const success = await this.syncEquipmentToServer(userEquip.equipId);
            if (success) {
                successCount++;
            }
        }
        
        console.log(`[UserEquipmentData] 装备数据同步完成，成功${successCount}/${allEquipments.length}个装备`);
        return successCount;
    }

    /**
     * 强制同步本地数据到服务器（覆盖服务器数据）
     * @returns Promise<boolean> 是否同步成功
     */
    async forceSyncToServer(): Promise<boolean> {
        console.log('[UserEquipmentData] 强制同步本地数据到服务器...');
        
        try {
            // 将本地数据转换为服务器格式
            const serverEquipments = this.convertToServerFormat();
            
            // 逐个同步到服务器
            let successCount = 0;
            for (const serverEquip of serverEquipments) {
                const equipmentRequest: AddEquipmentRequest = {
                    equipId: serverEquip.equipId,
                    level: serverEquip.level,
                    currentFragments: serverEquip.currentFragments,
                    maxFragments: serverEquip.maxFragments,
                    isUnlocked: serverEquip.isUnlocked,
                    isOwned: serverEquip.isOwned,
                    name_as: serverEquip.name_as
                };

                const response = await equipmentAPI.addEquipment(equipmentRequest);
                if (response && response.code === 200) {
                    successCount++;
                }
            }
            
            const success = successCount === serverEquipments.length;
            console.log(`[UserEquipmentData] 强制同步完成，成功${successCount}/${serverEquipments.length}个装备`);
            return success;
        } catch (error) {
            console.error('[UserEquipmentData] 强制同步到服务器异常:', error);
            return false;
        }
    }

    // ============ 调试和辅助方法 ============

    /**
     * 生成模拟测试数据 - 所有装备已拥有，随机碎片和等级
     */
    generateMockData() {
        console.log('[UserEquipmentData] 开始生成模拟测试数据...');
        
        this.userEquipments.forEach((userEquip, equipId) => {
            // 设置为已拥有
            userEquip.isOwned = true;
            // userEquip.isUnlocked = true;
            
            // 随机等级 (1-5级)
            userEquip.level = Math.floor(Math.random() * 5) + 1;
            
            // 随机碎片数量 (0到最大碎片数量之间)
            const maxFragments = 200
            userEquip.currentFragments = Math.floor(Math.random() * maxFragments);
            
            console.log(`装备${equipId}: 等级${userEquip.level}, 碎片${userEquip.currentFragments}/${userEquip.maxFragments}`);
            
            // 显示实际技能效果
            const actualEffects = this.getEquipmentActualSkillEffects(equipId);
            if (actualEffects.length > 0) {
                const effectTexts = actualEffects.map(effect => {
                    const percentage = (effect.value * 100).toFixed(1);
                    return `${effect.type}: +${percentage}%`;
                });
                // console.log(`  实际效果: ${effectTexts.join(', ')}`);
            }
        });

        // 随机装备一些天选装备
        // const ownedEquipments = this.getOwnedEquipments();
        // if (ownedEquipments.length >= 3) {
        //     // 随机选择3个装备放入天选装备栏
        //     const shuffled = [...ownedEquipments].sort(() => 0.5 - Math.random());
        //     for (let i = 0; i < 3 && i < shuffled.length; i++) {
        //         this.chosenEquipSlots[i] = shuffled[i];
        //     }
        // }

        // 随机添加一些临时装备 (1-3个)
        // const tempEquipCount = Math.floor(Math.random() * 3) + 1;
        // for (let i = 0; i < tempEquipCount; i++) {
        //     const randomEquipId = Math.floor(Math.random() * equipmentConfigs.length) + 1;
        //     this.addTemporaryEquipment(randomEquipId);
        // }

        // console.log('[UserEquipmentData] 模拟测试数据生成完成！');
        // this.debugPrintAllEquipments();
    }

    /**
     * 重置为初始状态
     */
    resetToInitialState() {
        console.log('[UserEquipmentData] 重置为初始状态...');
        
        // 清空装备栏
        this.chosenEquipSlots = [null, null, null];
        this.temporaryEquipSlots = [];
        
        // 【新增】重新初始化临时装备职业加成缓存
        this.initializeTemporaryEquipmentClassBonuses();
        
        // 重新初始化装备数据
        this.initializeUserEquipments();
        
        console.log('[UserEquipmentData] 重置完成！');
    }

    /**
     * 调试: 打印所有装备状态
     */
    debugPrintAllEquipments() {
        console.log('=== 用户装备状态 ===');
        this.userEquipments.forEach((equip, id) => {
            console.log(`ID: ${id}, 等级: ${equip.level}, 碎片: ${equip.currentFragments}/${equip.maxFragments}, 解锁: ${equip.isUnlocked}, 拥有: ${equip.isOwned}`);
        });
        console.log('=== 天选装备栏 ===');
        this.chosenEquipSlots.forEach((equip, index) => {
            console.log(`槽位${index}: ${equip ? `装备ID ${equip.equipId}` : '空'}`);
        });
        console.log('=== 临时装备栏 ===');
        this.temporaryEquipSlots.forEach((equipId, index) => {
            console.log(`临时装备${index}: ID ${equipId}`);
        });
        console.log('=== 天选装备职业加成统计 ===');
        const classBonuses = this.calculateClassBonuses();
        classBonuses.forEach(bonus => {
            const bonusTexts: string[] = [];
            for (const effectType in bonus.bonuses) {
                const value = bonus.bonuses[effectType];
                if (value > 0) {
                    const percentage = (value * 100).toFixed(1);
                    bonusTexts.push(`${effectType}: +${percentage}%`);
                }
            }
            if (bonusTexts.length > 0) {
                console.log(`${bonus.className}加成: ${bonusTexts.join(', ')}`);
            }
        });
        
        console.log('=== 临时装备职业加成统计 ===');
        const tempBonuses = this.getTemporaryEquipmentClassBonuses();
        tempBonuses.forEach(bonus => {
            const bonusTexts: string[] = [];
            for (const effectType in bonus.bonuses) {
                const value = bonus.bonuses[effectType];
                if (value > 0) {
                    const percentage = (value * 100).toFixed(1);
                    bonusTexts.push(`${effectType}: +${percentage}%`);
                }
            }
            if (bonusTexts.length > 0) {
                console.log(`${bonus.className}加成: ${bonusTexts.join(', ')}`);
            }
        });
    }

    // ============ 自动上锁/解锁管理 ============

    /**
     * 自动解锁与指定装备关联的所有装备
     * @param equipId 装备ID
     */
    private async autoUnlockRelatedEquipments(equipId: number): Promise<void> {
        const unlockedEquipments = equipmentConfigs
            .filter(config => config.unlockBy === equipId)
            .map(config => {
                const userEquip = this.getUserEquipment(config.id);
                if (userEquip && !userEquip.isUnlocked) {
                    userEquip.isUnlocked = true;
                    console.log(`[UserEquipmentData] 自动解锁装备: ${config.name} (ID: ${config.id})`);
                    return userEquip;
                }
                return null;
            })
            .filter(equip => equip !== null);

        // 同步解锁的装备到服务器
        for (const userEquip of unlockedEquipments) {
            if (userEquip) {
                await this.syncEquipmentToServer(userEquip.equipId);
            }
        }

        if (unlockedEquipments.length > 0) {
            console.log(`[UserEquipmentData] 装备${equipId}触发解锁了${unlockedEquipments.length}个关联装备`);
        }
    }

    /**
     * 自动上锁所有非基础装备（unlockBy不为0的装备）
     */
    private autoLockNonBasicEquipments(): void {
        let lockedCount = 0;
        this.userEquipments.forEach((userEquip, equipId) => {
            const equipConfig = equipmentConfigs.find(config => config.id === equipId);
            if (equipConfig && equipConfig.unlockBy !== 0 && userEquip.isUnlocked) {
                userEquip.isUnlocked = false;
                console.log(`[UserEquipmentData] 自动上锁装备: ${equipConfig.name} (ID: ${equipId})`);
                lockedCount++;
            }
        });

        if (lockedCount > 0) {
            console.log(`[UserEquipmentData] 关卡结束，自动上锁了${lockedCount}个非基础装备`);
        }
    }

    /**
     * 根据天选装备栏解锁对应的关联装备（游戏开始时调用）
     */
    public async unlockEquipmentsBasedOnChosenSlots(): Promise<void> {
        console.log('[UserEquipmentData] 游戏开始，根据天选装备解锁关联装备...');
        
        let totalUnlockedCount = 0;
        
        for (const chosenEquip of this.chosenEquipSlots) {
            if (chosenEquip) {
                const equipConfig = equipmentConfigs.find(config => config.id === chosenEquip.equipId);
                const equipName = equipConfig ? equipConfig.name : `装备#${chosenEquip.equipId}`;
                
                console.log(`[UserEquipmentData] 天选装备槽: ${equipName} (ID: ${chosenEquip.equipId})`);
                
                // 解锁与该天选装备关联的所有装备
                const beforeCount = this.getUnlockedEquipments().length;
                await this.autoUnlockRelatedEquipments(chosenEquip.equipId);
                const afterCount = this.getUnlockedEquipments().length;
                const unlockedCount = afterCount - beforeCount;
                totalUnlockedCount += unlockedCount;
            }
        }

        if (totalUnlockedCount > 0) {
            console.log(`[UserEquipmentData] 游戏开始时共解锁了${totalUnlockedCount}个关联装备`);
        } else {
            console.log(`[UserEquipmentData] 游戏开始时没有新的装备需要解锁`);
        }
    }
} 