import { partnerConfigs, PartnerConfig } from "../global/config/PartnerConfig";
import { director, game } from 'cc';

/**
 * 用户伙伴的核心数据结构
 */
export interface UserPartnerItem {
    id: number;
    level: number;
    star: number;
    isOwned: boolean;
    nameAs?: string;
    quality?: number;
    displayName?: string;
}

/**
 * 伙伴数据管理
 * - 管理伙伴的等级、星级、上阵、协同状态
 * - 计算升级和升星带来的属性加成
 * - 处理伙伴的遣散逻辑
 */
export class UserPartnerData {
    private static instance: UserPartnerData;

    // 调试开关
    private static readonly ENABLE_MOCK_DATA = false;

    // 升级和升星效果的配置常量
    private static readonly UPGRADE_ATTACK_INCREMENT = 0.002; // 每级增加的攻击力百分比
    private static readonly UPGRADE_HP_INCREMENT = 0.002;     // 每级增加的生命值百分比
    private static readonly STAR_EFFECTIVENESS_MULTIPLIER = 0.1; // 每星级对升级效果的提升幅度 (10%)

    // 用户拥有的所有伙伴数据
    private userPartners: Map<number, UserPartnerItem> = new Map();

    // 上阵伙伴 (最多2个)
    private equippedPartnerIds: (number | null)[] = [null, null];

    // 协同伙伴 (最多2个)
    private synergizedPartnerIds: (number | null)[] = [null, null];

    private constructor() {
        this.initializeUserPartners();
        if (UserPartnerData.ENABLE_MOCK_DATA) {
            this.generateMockData();
        }
    }

    public static getInstance(): UserPartnerData {
        if (!UserPartnerData.instance) {
            UserPartnerData.instance = new UserPartnerData();
        }
        return UserPartnerData.instance;
    }

    /**
     * 初始化所有伙伴的默认数据
     */
    private initializeUserPartners(): void {
        (partnerConfigs || []).forEach(config => {
            if (!config) return;
            this.userPartners.set(config.id, {
                id: config.id,
                level: 1,
                star: 1,
                isOwned: false,
            });
        });
    }

    // ==================== 数据查询 ====================

    public getPartner(partnerId: number): UserPartnerItem | null {
        return this.userPartners.get(partnerId) || null;
    }

    public isPartnerOwned(partnerId: number): boolean {
        const partner = this.getPartner(partnerId);
        return partner ? partner.isOwned : false;
    }

    public getOwnedPartners(): UserPartnerItem[] {
        return Array.from(this.userPartners.values()).filter(p => p.isOwned);
    }

    public getEquippedPartnerIds(): (number | null)[] {
        return [...this.equippedPartnerIds];
    }
    
    public getSynergizedPartnerIds(): (number | null)[] {
        return [...this.synergizedPartnerIds];
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

        partner.star++;
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
        if (slotIndex < 0 || slotIndex >= 2 || !this.isPartnerOwned(partnerId)) return false;

        // 一个伙伴不能同时上阵和协同
        if (this.synergizedPartnerIds.indexOf(partnerId) !== -1) {
            console.warn(`[UserPartnerData] 伙伴 ${partnerId} 正在协同中，无法上阵`);
            return false;
        }
        
        // 替换掉槽位上原有的伙伴
        this.unequipPartner(slotIndex);

        this.equippedPartnerIds[slotIndex] = partnerId;
        console.log(`[UserPartnerData] 伙伴 ${partnerId} 已上阵到槽位 ${slotIndex}`);
        try { director.emit(game.gameEvent.GAME_PARTNER_EDITOR_PAGE_REFRESH); } catch {}
        return true;
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
        const config = (partnerConfigs || []).find(c => c && c.id === partnerId);
        if (!partner || !config) return null;

        // 星级对升级效果的加成
        const starMultiplier = 1 + (partner.star - 1) * UserPartnerData.STAR_EFFECTIVENESS_MULTIPLIER;
        
        // 每级实际增加的属性
        const actualAttackIncrement = UserPartnerData.UPGRADE_ATTACK_INCREMENT * starMultiplier;
        const actualHpIncrement = UserPartnerData.UPGRADE_HP_INCREMENT * starMultiplier;

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
        // 随机拥有2-4个伙伴
        const shuffled = [...(partnerConfigs || []).filter(Boolean)].sort(() => 0.5 - Math.random());
        shuffled.slice(0, 5).forEach(p => {
            this.acquirePartner(p.id);
            const partner = this.getPartner(p.id);
            // 随机等级和星级
            partner.level = Math.floor(Math.random() * 10) + 1;
            partner.star = Math.floor(Math.random() * 3) + 1;
        });
        
        const owned = this.getOwnedPartners();
        // if(owned.length > 0) this.equipPartner(owned[0].id, 0);
        if(owned.length > 0){
            for (let i = 0; i < owned.length; i++) {
                this.equipPartner(owned[i].id, i);
            }
        }
        // if(owned.length > 1) this.synergizePartner(owned[1].id, 0);
    }

    public syncFromPartnerList(list: any[]): void {
        if (!list || list.length === 0) {
            return;
        }
        (partnerConfigs || []).forEach(cfg => {
            if (!cfg) return;
            const p = this.userPartners.get(cfg.id);
            if (p) {
                p.isOwned = false;
                p.level = 1;
                p.star = 1;
                p.nameAs = undefined;
                p.quality = undefined;
                p.displayName = undefined;
            }
        });
        const prevEquipped = [...this.equippedPartnerIds];
        const equippedFromServer: number[] = [];
        for (const item of list || []) {
            let pid: number | null = null;
            if (typeof item.nameAs === 'string') {
                const cfgByName = (partnerConfigs || []).find(c => c && c.iconFrameName === item.nameAs);
                if (cfgByName) pid = cfgByName.id;
            }
            if (pid === null) continue;

            if (!this.userPartners.has(pid)) {
                this.userPartners.set(pid, {
                    id: pid,
                    level: 1,
                    star: 1,
                    isOwned: false,
                });
            }
            const p = this.userPartners.get(pid);
            if (!p) continue;
            p.isOwned = true;
            if (typeof item.partnerLevel === 'number') p.level = item.partnerLevel;
            if (typeof item.starId === 'number') p.star = Math.max(1, item.starId);
            if (typeof item.nameAs === 'string') p.nameAs = item.nameAs;
            if (typeof item.qualityId === 'number') p.quality = item.qualityId;
            if (typeof item.partnerName === 'string') p.displayName = item.partnerName;

            if (typeof item.isBattle === 'number' && item.isBattle === 1) {
                if (equippedFromServer.length < 2) equippedFromServer.push(pid);
            }
            if (typeof item.isCooperate === 'number' && item.isCooperate === 1) {
                const parts = typeof item.cooperate === 'string' ? item.cooperate.split(',').map((s: string) => Number(s)).filter(n => !isNaN(n)) : [];
                if (parts.length > 0) {
                    this.synergizedPartnerIds[0] = parts[0] || null;
                    this.synergizedPartnerIds[1] = parts[1] || null;
                }
            }
        }
        if (equippedFromServer.length > 0) {
            this.equippedPartnerIds[0] = equippedFromServer[0] ?? null;
            this.equippedPartnerIds[1] = equippedFromServer[1] ?? null;
        } else {
            this.equippedPartnerIds = prevEquipped;
        }
        try { director.emit(game.gameEvent.GAME_PARTNER_EDITOR_PAGE_REFRESH); } catch {}
    }
}
