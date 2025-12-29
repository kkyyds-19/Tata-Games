import { heroSkinConfigs, HeroSkinConfig } from "../global/config/HeroSkinConfig";

/**
 * 用户单个皮肤的核心数据结构
 */
export interface UserSkinItem {
    id: number;       // 皮肤ID
    isOwned: boolean; // 是否已拥有
    isEquipped: boolean; // 是否已装备
    star: number;     // 当前星级, 0表示未激活
}

/**
 * 皮肤数据管理器
 * - 管理皮肤的获取、穿戴、升星等状态
 * - 计算皮肤带来的属性加成
 */
export class UserSkinData {
    private static instance: UserSkinData;

    // MOCK DATA 开关
    private static readonly ENABLE_MOCK_DATA = true;
    private static readonly MAX_STAR_LEVEL = 5;

    // 存储用户的所有皮肤数据
    private userSkins: Map<number, UserSkinItem> = new Map();

    private constructor() {
        this.initializeSkins();
        if (UserSkinData.ENABLE_MOCK_DATA) {
            this.generateMockData();
        }
    }

    public static getInstance(): UserSkinData {
        if (!UserSkinData.instance) {
            UserSkinData.instance = new UserSkinData();
        }
        return UserSkinData.instance;
    }

    /**
     * 初始化所有皮肤的默认数据
     */
    private initializeSkins(): void {
        heroSkinConfigs.forEach(config => {
            this.userSkins.set(config.id, {
                id: config.id,
                isOwned: false,
                isEquipped: false,
                star: 0,
            });
        });
    }

    // ==================== 数据查询 ====================

    /**
     * 获取指定ID的皮肤数据
     */
    public getSkinData(skinId: number): UserSkinItem | null {
        return this.userSkins.get(skinId) || null;
    }

    /**
     * 获取用户拥有的所有皮肤
     */
    public getOwnedSkins(): UserSkinItem[] {
        return Array.from(this.userSkins.values()).filter(s => s.isOwned);
    }
    
    /**
     * 获取指定英雄当前装备的皮肤
     * @param heroId 英雄ID
     * @returns 返回装备的皮肤数据，如果没有则返回 null
     */
    public getEquippedSkinForHero(heroId: number): UserSkinItem | null {
        for (const skin of this.userSkins.values()) {
            if (skin.isEquipped) {
                const config = heroSkinConfigs.find(c => c.id === skin.id);
                if (config && config.heroId === heroId) {
                    return skin;
                }
            }
        }
        return null;
    }


    // ==================== 核心逻辑 ====================

    /**
     * 用户获得一个新皮肤
     */
    public acquireSkin(skinId: number): boolean {
        const skin = this.getSkinData(skinId);
        if (skin && !skin.isOwned) {
            skin.isOwned = true;
            skin.star = 1; // 获得时默认1星
            console.log(`[UserSkinData] 获得新皮肤, ID: ${skinId}`);
            return true;
        }
        console.warn(`[UserSkinData] 获得皮肤失败，可能已拥有或ID无效: ${skinId}`);
        return false;
    }

    /**
     * 升星皮肤
     */
    public starUpSkin(skinId: number): boolean {
        const skin = this.getSkinData(skinId);
        if (!skin || !skin.isOwned) {
            console.warn(`[UserSkinData] 升星失败，未拥有该皮肤: ${skinId}`);
            return false;
        }
        if(skin.star >= UserSkinData.MAX_STAR_LEVEL) {
            console.log(`[UserSkinData] 皮肤 ${skinId} 已达到最高星级`);
            return false;
        }
        
        skin.star++;
        console.log(`[UserSkinData] 皮肤 ${skinId} 升至 ${skin.star}星`);
        // TODO: 可在此处增加升星消耗逻辑
        return true;
    }

    /**
     * 为英雄装备一个皮肤
     */
    public equipSkin(skinId: number): boolean {
        const skinToEquip = this.getSkinData(skinId);
        if (!skinToEquip || !skinToEquip.isOwned) {
            console.warn(`[UserSkinData] 装备失败，未拥有该皮肤: ${skinId}`);
            return false;
        }

        const skinConfig = heroSkinConfigs.find(c => c.id === skinId);
        if (!skinConfig) {
            console.error(`[UserSkinData] 找不到皮肤配置: ${skinId}`);
            return false;
        };

        // 卸下该英雄当前已穿戴的其他皮肤
        this.userSkins.forEach((skinItem) => {
            if (skinItem.isEquipped) {
                 const config = heroSkinConfigs.find(c => c.id === skinItem.id);
                 if(config && config.heroId === skinConfig.heroId){
                    skinItem.isEquipped = false;
                    console.log(`[UserSkinData] 自动卸下皮肤: ${skinItem.id}`);
                 }
            }
        });

        // 穿上新皮肤
        skinToEquip.isEquipped = true;
        console.log(`[UserSkinData] 英雄 ${skinConfig.heroId} 已装备皮肤: ${skinId}`);
        return true;
    }

     /**
     * 卸下指定皮肤
     */
    public unequipSkin(skinId: number): void {
        const skin = this.getSkinData(skinId);
        if(skin && skin.isEquipped){
            skin.isEquipped = false;
            console.log(`[UserSkinData] 卸下皮肤: ${skinId}`);
        }
    }


    // ==================== 调试 ====================
    private generateMockData(): void {

        // 拥有全部皮肤
        heroSkinConfigs.forEach(s => {
            this.acquireSkin(s.id);
            const skin = this.getSkinData(s.id);
            if (skin) {
                // 随机星级（1 到 MAX_STAR_LEVEL）
                skin.star = Math.floor(Math.random() * UserSkinData.MAX_STAR_LEVEL) + 1;
            }
        });


        // 随机拥有2-4个皮肤
        // const shuffled = [...heroSkinConfigs].sort(() => 0.5 - Math.random());
        // shuffled.slice(0, Math.floor(Math.random() * 3) + 2).forEach(s => {
        //     this.acquireSkin(s.id);
        //     const skin = this.getSkinData(s.id);
        //     if (skin) {
        //         // 随机星级
        //         skin.star = Math.floor(Math.random() * UserSkinData.MAX_STAR_LEVEL) + 1;
        //     }
        // });
        
        // 为每个英雄随机装备一个已拥有的皮肤
        // const ownedSkins = this.getOwnedSkins();
        // const equippedHeroIds = new Set<number>();
        // for (const skin of ownedSkins) {
        //     const config = heroSkinConfigs.find(c => c.id === skin.id);
        //     if (config && !equippedHeroIds.has(config.heroId)) {
        //         this.equipSkin(skin.id);
        //         equippedHeroIds.add(config.heroId);
        //     }
        // }
    }
} 