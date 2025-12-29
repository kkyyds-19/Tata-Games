import { TransformationSkinConfig, TransformationSkinConfigs, TransformationPart, SkillEffectType, SkillEffect } from "../global/config/TransformationSkinConfig";
import { sys } from "cc";

const USER_TRANSFORMATION_SKIN_DATA_KEY = 'user_transformation_skin_data';

export interface UserTransformationSkinItem {
    transformatskinId: number;
    level: number;
    fragmentCount: number;
    part: TransformationPart;
}

export class UserTransformationSkinData {
    private static _instance: UserTransformationSkinData = null;
    public static getInstance(): UserTransformationSkinData {
        if (!this._instance) {
            this._instance = new UserTransformationSkinData();
        }
        return this._instance;
    }

    private _userSkins: Map<number, UserTransformationSkinItem> = new Map();
    private _equippedSkins: Map<TransformationPart, number> = new Map(); // part -> skinId

    private readonly MAX_LEVEL = 10;
    private readonly TEST_MODE = true; 

    constructor() {
        this.loadData();
    }

    private saveData() {
        const data = {
            skins: Array.from(this._userSkins.values()),
            equipped: Array.from(this._equippedSkins.entries())
        };
        sys.localStorage.setItem(USER_TRANSFORMATION_SKIN_DATA_KEY, JSON.stringify(data));
    }

    private loadData() {
        const savedData = sys.localStorage.getItem(USER_TRANSFORMATION_SKIN_DATA_KEY);
        if (savedData && !this.TEST_MODE) { // Test mode will always re-initialize
            const data = JSON.parse(savedData);
            this._userSkins = new Map(data.skins.map((item: UserTransformationSkinItem) => [item.transformatskinId, item]));
            this._equippedSkins = new Map(data.equipped);
        } else {
            this.initializeDefaultSkins();
        }
    }

    private initializeDefaultSkins() {
        this._userSkins.clear();
        this._equippedSkins.clear();
        TransformationSkinConfigs.forEach(config => {
            const skinItem: UserTransformationSkinItem = {
                transformatskinId: config.transformatskinId,
                level: this.TEST_MODE ? Math.floor(Math.random() * this.MAX_LEVEL) + 1 : 1,
                fragmentCount: this.TEST_MODE ? Math.floor(Math.random() * 100) : 0,
                part: config.part
            };
            this._userSkins.set(config.transformatskinId, skinItem);
        });
    }

    public upgradeSkin(skinId: number): boolean {
        const skinData = this.getSkinData(skinId);
        if (!skinData) {
            console.error(`[UserTransformationSkinData] 尝试升级不存在的皮肤: ${skinId}`);
            return false;
        }
        if (skinData.level >= this.MAX_LEVEL) {
            console.log(`[UserTransformationSkinData] 皮肤 ${skinId} 已达到最高等级。`);
            return false;
        }
        const requiredFragments = this.getFragmentsRequiredForLevelUp(skinId);
        if (skinData.fragmentCount < requiredFragments) {
            console.log(`[UserTransformationSkinData] 皮肤 ${skinId} 碎片不足，无法升级。需要 ${requiredFragments}，拥有 ${skinData.fragmentCount}`);
            return false;
        }
        skinData.fragmentCount -= requiredFragments;
        skinData.level++;
        console.log(`[UserTransformationSkinData] 皮肤 ${skinId} 升级成功！当前等级: ${skinData.level}`);
        this.saveData();
        return true;
    }

    public toggleEquipSkin(skinId: number) {
        const skinData = this.getSkinData(skinId);
        if (!skinData) {
            console.error(`[UserTransformationSkinData] 尝试穿戴不存在的皮肤: ${skinId}`);
            return;
        }
        const currentEquippedId = this._equippedSkins.get(skinData.part);
        if (currentEquippedId === skinId) {
            this._equippedSkins.delete(skinData.part);
            console.log(`[UserTransformationSkinData] 卸下皮肤 ${skinId}`);
        } else {
            this._equippedSkins.set(skinData.part, skinId);
            console.log(`[UserTransformationSkinData] 穿戴皮肤 ${skinId} 到部位 ${TransformationPart[skinData.part]}`);
        }
        this.saveData();
    }
    
    public getAttributesForSkin(skinId: number, includeBond: boolean = false): { [key: string]: number } {
        const skinData = this.getSkinData(skinId);
        const skinConfig = TransformationSkinConfigs.find(c => c.transformatskinId === skinId);
        if (!skinData || !skinConfig) return {};

        const attributes: { [key: string]: number } = {};
        
        // 1. 计算皮肤自身属性（含等级成长）
        // 简化成长公式：基础值 + (等级-1) * 2  (假设成长值为2)
        const growthFactor = 2;
        skinConfig.bonus.forEach(attr => {
            const finalValue = attr.value + (skinData.level - 1) * growthFactor;
            attributes[attr.type] = (attributes[attr.type] || 0) + finalValue;
        });
        
        // 2. 如果需要，并且羁绊是激活的，则加上羁绊属性
        if (includeBond && skinConfig.bondId !== null) {
            if (this.isBondActive(skinConfig.bondId)) {
                skinConfig.bondBonus.forEach(attr => {
                    attributes[attr.type] = (attributes[attr.type] || 0) + attr.value;
                });
            }
        }
        
        return attributes;
    }

    public getFragmentsRequiredForLevelUp(skinId: number): number {
        const skinData = this.getSkinData(skinId);
        if (!skinData || skinData.level >= this.MAX_LEVEL) return Infinity; // 使用Infinity表示无法升级
        return skinData.level * 10;
    }

    public getAllSkins(): UserTransformationSkinItem[] {
        return Array.from(this._userSkins.values());
    }

    public getSkinData(skinId: number): UserTransformationSkinItem | undefined {
        return this._userSkins.get(skinId);
    }

    public getEquippedSkinIds(): number[] {
        return Array.from(this._equippedSkins.values());
    }

    public getEquippedSkinForPart(part: TransformationPart): number | null {
        return this._equippedSkins.get(part) ?? null;
    }

    public getTotalAttributeBonus(): { [key: string]: number } {
        const totalAttributes: { [key: string]: number } = {};
        const equippedSkinIds = this.getEquippedSkinIds();

        // 1. 累加所有已装备皮肤的自身属性
        equippedSkinIds.forEach(skinId => {
            const skinAttributes = this.getAttributesForSkin(skinId, false); // 只计算基础属性
            for (const key in skinAttributes) {
                totalAttributes[key] = (totalAttributes[key] || 0) + skinAttributes[key];
            }
        });

        // 2. 累加所有已激活羁绊的属性
        const activeBonds = this.getActiveBonds();
        activeBonds.forEach(bond => {
            bond.bondBonus.forEach(bonus => {
                totalAttributes[bonus.type] = (totalAttributes[bonus.type] || 0) + bonus.value;
            });
        });

        return totalAttributes;
    }
    
    public isBondActive(bondId: number): boolean {
        if (bondId === null) return false;
        const requiredSkins = TransformationSkinConfigs.filter(c => c.bondId === bondId);
        if (requiredSkins.length === 0) return false;
        
        const equippedIds = new Set(this.getEquippedSkinIds());
        return requiredSkins.every(skin => equippedIds.has(skin.transformatskinId));
    }

    private getActiveBonds(): TransformationSkinConfig[] {
        const activeBondIds = new Set<number>();
        const equippedIds = new Set(this.getEquippedSkinIds());
    
        // 找出所有激活的羁绊ID
        TransformationSkinConfigs.forEach(config => {
            if (config.bondId !== null && equippedIds.has(config.transformatskinId)) {
                if(this.isBondActive(config.bondId)){
                    activeBondIds.add(config.bondId);
                }
            }
        });
    
        // 从配置中返回激活了的羁绊的代表皮肤（每个羁绊ID只返回一个作为代表）
        const activeBonds: TransformationSkinConfig[] = [];
        const addedBondIds = new Set<number>();
        TransformationSkinConfigs.forEach(config => {
            if (config.bondId !== null && activeBondIds.has(config.bondId) && !addedBondIds.has(config.bondId)) {
                activeBonds.push(config);
                addedBondIds.add(config.bondId);
            }
        });
    
        return activeBonds;
    }
} 