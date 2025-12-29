import { watchtowerConfigs,WatchtowerConfig } from "../global/config/WatchtowerConfig";
import { towerAPI } from "../api/TowerAPI";

/**
 * 用户伙伴的核心数据结构
 */
export interface UserWatchtowerItem {
    id: number;
    level: number;
    star: number;
    isOwned: boolean;
}

/**
 * 伙伴数据管理
 * - 管理伙伴的等级、星级、上阵、协同状态
 * - 计算升级和升星带来的属性加成
 * - 处理伙伴的遣散逻辑
 */
export class UserWatchtowerData {
    private static instance: UserWatchtowerData;

    private static readonly ENABLE_MOCK_DATA = false;

    // 升级和升星效果的配置常量
    private static readonly UPGRADE_ATTACK_INCREMENT = 0.002; // 每级增加的攻击力百分比
    private static readonly UPGRADE_HP_INCREMENT = 0.002;     // 每级增加的生命值百分比
    private static readonly STAR_EFFECTIVENESS_MULTIPLIER = 0.1; // 每星级对升级效果的提升幅度 (10%)
    public static readonly MAX_STAR_LEVEL = 6;

    // 用户拥有的所有伙伴数据
    private userPartners: Map<number, UserWatchtowerItem> = new Map();

    // 上阵伙伴 (最多2个)
    private equippedPartnerIds: (number | null)[] = [null, null];

    // 协同伙伴 (最多2个)
    private synergizedPartnerIds: (number | null)[] = [null, null];

    private _loadedFromServer = false;
    private _serverTowerIds: number[] = [];
    private _serverRecordIdMap: Map<number, number> = new Map();
    private _serverWatchtowerIdMap: Map<number, number> = new Map();
    private constructor() {
        this.initializeUserPartners();
        if (UserWatchtowerData.ENABLE_MOCK_DATA) {
            this.generateMockData();
        }
    }

    public static getInstance(): UserWatchtowerData {
        if (!UserWatchtowerData.instance) {
            UserWatchtowerData.instance = new UserWatchtowerData();
        }
        return UserWatchtowerData.instance;
    }

    /**
     * 初始化所有伙伴的默认数据
     */
    private initializeUserPartners(): void {
        watchtowerConfigs.forEach(config => {
            this.userPartners.set(config.id, {
                id: config.id,
                level: 1,
                star: 1,
                isOwned: false,
            });
        });
    }

    public async loadFromServer(): Promise<void> {
        if (this._loadedFromServer) return;
        const resp = await towerAPI.getTowerList();
        const list = (resp && resp.data) ? resp.data : [];
        this._serverTowerIds = [];
        this._serverRecordIdMap.clear();
        this._serverWatchtowerIdMap.clear();
        const equippedByServer: number[] = [];
        for (const item of list as any[]) {
            const wid = typeof item.watchtowerId === 'number' ? Number(item.watchtowerId) : null;
            let cfg: WatchtowerConfig | null = null;
            const key = item.watchtowerKey as string | undefined;
            if (key) cfg = watchtowerConfigs.find(c => c.iconFrameName === key) || null;
            if (!cfg) continue;
            const id = cfg.id;
            const level = (item.level ?? 1) as number;
            const starRaw = (item.star ?? null) as number | null;
            const owned = starRaw !== null && starRaw !== undefined;
            const star = owned ? Math.max(1, Number(starRaw)) : 0;
            const p = this.userPartners.get(id);
            if (!p) {
                this.userPartners.set(id, { id, level: level, star: star, isOwned: owned });
            } else {
                p.level = level;
                p.star = star;
                p.isOwned = owned;
            }
            this._serverTowerIds.push(id);
            if (item.id !== undefined && item.id !== null) {
                this._serverRecordIdMap.set(id, Number(item.id));
            }
            if (wid !== null) {
                this._serverWatchtowerIdMap.set(id, wid);
            }
            if ((item as any).isBattle === 1) {
                equippedByServer.push(id);
            }
        }
        // 根据服务端 isBattle 初始化上阵槽位（最多两个）
        this.equippedPartnerIds = [null, null];
        for (let i = 0; i < Math.min(2, equippedByServer.length); i++) {
            this.equippedPartnerIds[i] = equippedByServer[i];
        }
        this._loadedFromServer = true;
    }

    public getServerTowerIds(): number[] {
        return [...this._serverTowerIds];
    }

    public getServerRecordIdByTowerId(towerConfigId: number): number | null {
        const rid = this._serverRecordIdMap.get(towerConfigId);
        return typeof rid === 'number' ? rid : null;
    }

    public getServerWatchtowerIdByConfigId(towerConfigId: number): number | null {
        const wid = this._serverWatchtowerIdMap.get(towerConfigId);
        return typeof wid === 'number' ? wid : null;
    }

    public getConfigIdByWatchtowerId(watchtowerId: number): number | null {
        for (const [cfgId, wid] of this._serverWatchtowerIdMap.entries()) {
            if (wid === watchtowerId) return cfgId;
        }
        return null;
    }

    public getServerRecordIdByWatchtowerId(watchtowerId: number): number | null {
        const cfgId = this.getConfigIdByWatchtowerId(watchtowerId);
        if (cfgId === null) return null;
        const rid = this._serverRecordIdMap.get(cfgId);
        return typeof rid === 'number' ? rid : null;
    }

    // ==================== 数据查询 ====================

    public getPartner(partnerId: number): UserWatchtowerItem | null {
        return this.userPartners.get(partnerId) || null;
    }

    public isPartnerOwned(partnerId: number): boolean {
        const partner = this.getPartner(partnerId);
        return partner ? partner.isOwned : false;
    }

    public getOwnedPartners(): UserWatchtowerItem[] {
        return Array.from(this.userPartners.values()).filter(p => p.isOwned);
    }

    public getEquippedPartnerIds(): (number | null)[] {
        return [...this.equippedPartnerIds];
    }
    
    public getSynergizedPartnerIds(): (number | null)[] {
        return [...this.synergizedPartnerIds];
    }

    // ==================== Watchtower 语义别名 ====================
    public getWatchtower(id: number): UserWatchtowerItem | null {
        return this.getPartner(id);
    }
    public isWatchtowerOwned(id: number): boolean {
        return this.isPartnerOwned(id);
    }
    public getOwnedWatchtowers(): UserWatchtowerItem[] {
        return this.getOwnedPartners();
    }
    public getEquippedWatchtowerIds(): (number | null)[] {
        return this.getEquippedPartnerIds();
    }
    public getSynergizedWatchtowerIds(): (number | null)[] {
        return this.getSynergizedPartnerIds();
    }
    public getWatchtowerActualBonuses(id: number): { attackBonus: number, hpBonus: number } | null {
        return this.getPartnerActualBonuses(id);
    }

    // ==================== 核心逻辑 ====================

    /**
     * 获得一个新伙伴
     */
    public acquirePartner(partnerId: number): boolean {
        const partner = this.getPartner(partnerId);
        if (partner && !partner.isOwned) {
            partner.isOwned = true;
            console.log(`[UserPartnerData] 获得新伙伴, ID: ${partnerId}`);
            return true;
        }
        return false;
    }

    /**
     * 升级伙伴
     */
    public upgradePartner(partnerId: number): boolean {
        const partner = this.getPartner(partnerId);
        if (!partner || !partner.isOwned) return false;
        
        partner.level++;
        console.log(`[UserPartnerData] 伙伴 ${partnerId} 升级至 ${partner.level}级`);
        // TODO: 可在此处增加升级消耗逻辑
        return true;
    }
    
    /**
     * 升星伙伴
     */
    public starUpPartner(partnerId: number): boolean {
        const partner = this.getPartner(partnerId);
        if (!partner || !partner.isOwned) return false;

        partner.star = Math.min(UserWatchtowerData.MAX_STAR_LEVEL, (partner.star || 0) + 1);
        console.log(`[UserPartnerData] 伙伴 ${partnerId} 升至 ${partner.star}星`);
        // TODO: 可在此处增加升星消耗逻辑
        return true;
    }

    /**
     * 遣散一个伙伴
     */
    public dismissPartner(partnerId: number): void {
        const partner = this.getPartner(partnerId);
        if (!partner || !partner.isOwned) return;

        // 1. 重置伙伴数据
        partner.isOwned = false;
        partner.level = 1;
        partner.star = 1;
        console.log(`[UserPartnerData] 伙伴 ${partnerId} 已被遣散`);

        // 2. 如果正在上阵，则下阵
        const equippedIndex = this.equippedPartnerIds.indexOf(partnerId);
        if (equippedIndex !== -1) {
            this.unequipPartner(equippedIndex);
        }

        // 3. 如果正在协同，则取消协同
        const synergizedIndex = this.synergizedPartnerIds.indexOf(partnerId);
        if (synergizedIndex !== -1) {
            this.unsynergizePartner(synergizedIndex);
        }
    }


    // ==================== 上阵与协同 ====================

    /**
     * 将伙伴上阵到指定槽位
     */
    public equipPartner(partnerId: number, slotIndex: number): boolean {
        if (slotIndex < 0 || slotIndex >= 4 || !this.isPartnerOwned(partnerId)) return false;

        // 一个伙伴不能同时上阵和协同
        if (this.synergizedPartnerIds.indexOf(partnerId) !== -1) {
            console.warn(`[UserPartnerData] 伙伴 ${partnerId} 正在协同中，无法上阵`);
            return false;
        }
        
        // 替换掉槽位上原有的伙伴
        this.unequipPartner(slotIndex);

        this.equippedPartnerIds[slotIndex] = partnerId;
        console.log(`[UserPartnerData] 伙伴 ${partnerId} 已上阵到槽位 ${slotIndex}`);
        // return true;
    }
    
    /**
     * 从指定槽位下阵伙伴
     */
    public unequipPartner(slotIndex: number): void {
        if (slotIndex < 0 || slotIndex >= 2) return;
        const partnerId = this.equippedPartnerIds[slotIndex];
        if(partnerId){
            this.equippedPartnerIds[slotIndex] = null;
            console.log(`[UserPartnerData] 伙伴 ${partnerId} 已从槽位 ${slotIndex} 下阵`);
        }
    }
    
    /**
     * 将伙伴设置到协同槽位
     */
    public synergizePartner(partnerId: number, slotIndex: number): boolean {
        if (slotIndex < 0 || slotIndex >= 2 || !this.isPartnerOwned(partnerId)) return false;

        // 一个伙伴不能同时上阵和协同
        if (this.equippedPartnerIds.indexOf(partnerId) !== -1) {
            console.warn(`[UserPartnerData] 伙伴 ${partnerId} 正在上阵中，无法协同`);
            return false;
        }

        // 替换掉槽位上原有的伙伴
        this.unsynergizePartner(slotIndex);

        this.synergizedPartnerIds[slotIndex] = partnerId;
        console.log(`[UserPartnerData] 伙伴 ${partnerId} 已协同到槽位 ${slotIndex}`);
        return true;
    }

    /**
     * 从指定槽位取消协同伙伴
     */
    public unsynergizePartner(slotIndex: number): void {
        if (slotIndex < 0 || slotIndex >= 2) return;
        const partnerId = this.synergizedPartnerIds[slotIndex];
        if(partnerId){
            this.synergizedPartnerIds[slotIndex] = null;
            console.log(`[UserPartnerData] 伙伴 ${partnerId} 已从槽位 ${slotIndex} 取消协同`);
        }
    }

    // ==================== 属性加成计算 ====================
    
    /**
     * 获取单个伙伴经过等级和星级加成后的实际属性
     */
    public getPartnerActualBonuses(partnerId: number): { attackBonus: number, hpBonus: number } | null {
        const partner = this.getPartner(partnerId);
        const config = watchtowerConfigs.find(c => c.id === partnerId);
        if (!partner || !config) return null;

        // 星级对升级效果的加成
        const starMultiplier = 1 + (partner.star - 1) * UserWatchtowerData.STAR_EFFECTIVENESS_MULTIPLIER;
        
        // 每级实际增加的属性
        const actualAttackIncrement = UserWatchtowerData.UPGRADE_ATTACK_INCREMENT * starMultiplier;
        const actualHpIncrement = UserWatchtowerData.UPGRADE_HP_INCREMENT * starMultiplier;

        // 等级带来的总增量
        const totalBonusFromLevels = {
            attack: (partner.level - 1) * actualAttackIncrement,
            hp: (partner.level - 1) * actualHpIncrement,
        };
        
        return {
            attackBonus: config.attackBonus + totalBonusFromLevels.attack,
            hpBonus: config.hpBonus + totalBonusFromLevels.hp,
        };
    }

    /**
     * 计算所有协同伙伴提供的总属性加成 (用于全局buff)
     */
    public calculateTotalSynergyBonuses(): { totalAttackBonus: number, totalHpBonus: number } {
        const totalBonuses = { totalAttackBonus: 0, totalHpBonus: 0 };

        this.synergizedPartnerIds.forEach(partnerId => {
            if (partnerId) {
                const bonuses = this.getPartnerActualBonuses(partnerId);
                if (bonuses) {
                    totalBonuses.totalAttackBonus += bonuses.attackBonus;
                    totalBonuses.totalHpBonus += bonuses.hpBonus;
                }
            }
        });
        
        return totalBonuses;
    }


    // ==================== 调试 ====================
    private generateMockData(): void {
        // 拥有全部哨塔：前5个BOSS哨塔(10001-10005) + 所有watchtower_开头的哨塔
        // 确保能显示所有18个本地哨塔
        const allowed = watchtowerConfigs.filter(c => {
            // 包含所有以watchtower_开头的哨塔
            if (c.iconFrameName && c.iconFrameName.startsWith('watchtower_')) {
                return true;
            }
            // 包含前5个BOSS哨塔 (10001-10005)
            if (c.id >= 10001 && c.id <= 10005) {
                return true;
            }
            return false;
        });
        
        console.log(`[UserWatchtowerData] generateMockData: 找到 ${allowed.length} 个哨塔配置`);
        console.log('[UserWatchtowerData] 哨塔ID列表:', allowed.map(p => p.id));
        
        allowed.forEach(p => {
            this.acquirePartner(p.id);
            const partner = this.getPartner(p.id);
            partner.level = Math.floor(Math.random() * 10) + 1;
            partner.star = 1;
        });
        
        const owned = this.getOwnedPartners();
        console.log(`[UserWatchtowerData] 生成Mock数据完成，共拥有 ${owned.length} 个哨塔`);
        
        if(owned.length > 0){
            for (let i = 0; i < Math.min(owned.length, 2); i++) {
                this.equipPartner(owned[i].id, i);
            }
        }
        // if(owned.length > 1) this.synergizePartner(owned[1].id, 0);
    }
}


