import { game, sys } from 'cc';
import { Utils } from '../utils/Utils';
import { _decorator, director } from 'cc';
const { ccclass } = _decorator;

/**
 * 本地存储键名常量
 */
const LOCAL_STORAGE_KEY = 'knight_user_info_15_08_01';



/**
 * 关卡星星数据结构
 */
export interface StageStarData {
    normal: number;         // 普通难度星星数 (0-3)
    elite: number;          // 精英难度星星数 (0-3)
}

/**
 * 服务器返回的关卡进度数据结构
 */
export interface LevelProgressData {
    id: number;                 // 记录ID
    userId: number;             // 用户ID
    level: number;              // 关卡等级
    starRate: number;           // 星星数量 (0-3)
    clearanceTime: string;      // 通关时间
    isElite: number;            // 是否精英模式 (0-普通, 1-精英)
}

/**
 * 用户基本信息数据结构,客户端用
 */
export interface UserInfo {
    /**令牌 */
    bearer: string;
    userId: string;         // 用户ID
    userName: string;       // 用户名称
    level: number;          // 用户等级
    avatar: string;         // 头像
    avatarBgColor: string;  // 头像背景颜色
    gold: number;           // 金币
    diamond: number;        // 钻石
    honor: number;          // 荣誉点
    energy: number;         // 体力
    maxEnergy: number;      // 最大体力
    exp: number;            // 当前经验总值
    vipLevel: number;       // VIP等级
    skinPoints: number;     // 皮肤点券
    flamesVoucher?: number;
    createTime: number;     // 创建时间戳
    lastLoginTime: number;  // 最后登录时间戳
    currentStage: number;   // 当前关卡
    maxStage: number;       // 最大已解锁关卡
    fightPower: number;     // 战斗力（服务器值）
    stageStars: { [stageIndex: number]: StageStarData }; // 关卡星星数据
    wxNickName?: string;    // 微信昵称
    wxPhoneNumber?: string; // 微信电话号码
    wxAvatarUrl?: string;   // 微信头像URL
    useWxAvatar?: boolean;  // 是否使用微信头像

    guildId?: string;
    guildName?: string;
    guildLevel?: number;
    guildIcon?: number | string;
}



/**
 * 用户信息数据管理（全局单例）
 * 管理用户的基本信息，包括等级、头像、货币、体力等
 */
@ccclass('UserInfoData')
export class UserInfoData {
    private static _instance: UserInfoData = null;
    private _userInfo: UserInfo = null;

    // 添加批量更新机制
    private isBatchUpdating: boolean = false;
    private needsUpdateEvent: boolean = false;

    private constructor() {
        this.initDefaultData();
        this.loadFromLocalStorage();
    }

    public static getInstance(): UserInfoData {
        if (!this._instance) {
            this._instance = new UserInfoData();
        }
        return this._instance;
    }

    public getBearer(): string {
        let bearer = this._userInfo.bearer || '';
        // if (bearer.length > 0) bearer += "=1=";
        return bearer;
    }

    public setBearer(bearer: string): void {
        this._userInfo.bearer = bearer;
        this.saveToLocalStorage();
    }

    /**
     * 初始化默认数据
     */
    private initDefaultData(): void {
        this._userInfo = {
            bearer: "",
            userId: '',
            userName: '新手玩家',
            level: 1, // 从1级开始，避免出现0级
            avatar: "avatar_default",
            avatarBgColor: "#7D60DA", // 默认紫色 #7D60DA
            gold: 0,
            diamond: 0,
            honor: 0,
            energy: 0,
            maxEnergy: 0,
            exp: 0,
            vipLevel: 0,
            skinPoints: 0, // 默认1000皮肤点券
            flamesVoucher: 0,
            createTime: Date.now(),
            lastLoginTime: Date.now(),
            currentStage: 1,
            maxStage: 1,
            stageStars: this.generateDefaultStageStars(),
            fightPower: 0,
            wxNickName: '',      // 微信昵称
            wxPhoneNumber: '',   // 微信电话号码
            wxAvatarUrl: '',     // 微信头像URL
            useWxAvatar: true    // 默认使用微信头像
        };
        console.log('UserInfoData: 使用默认数据初始化');
    }

    /**
     * 获取完整用户信息
     */
    public getUserInfo(): UserInfo {
        return { ...this._userInfo };
    }

    /**
     * 设置用户信息
     */
    public setUserInfo(userInfo: Partial<UserInfo>): void {
        this._userInfo = { ...this._userInfo, ...userInfo };
        this.saveToLocalStorage();
    }

    // ========== 用户基本信息 ==========

    /**
     * 获取用户ID
     */
    public getUserId(): string {
        return this._userInfo.userId;
    }

    /**
     * 设置用户ID
     */
    public setUserId(userId: string): void {
        this._userInfo.userId = userId;
        this.saveToLocalStorage();
    }

    /**
     * 获取用户名称
     */
    public getUserName(): string {
        return this._userInfo.userName;
    }

    /**
     * 获取昵称（别名方法）
     */
    public getNickname(): string {
        return this._userInfo.userName;
    }

    /**
     * 设置用户名称
     */
    public setUserName(userName: string): void {
        this._userInfo.userName = userName;
        this.saveToLocalStorage();
    }

    /**
     * 设置昵称（别名方法）
     */
    public setNickname(nickname: string): void {
        this._userInfo.userName = nickname;
        this.saveToLocalStorage();
    }

    /**
     * 获取用户等级
     */
    public getLevel(): number {
         return Math.max(1, this._userInfo.level);
    }

    /**
     * 设置用户等级
     */
    public setLevel(level: number): void {
        this._userInfo.level = Math.max(1, level);
        this.saveToLocalStorage();
    }

    /**
     * 获取头像
     */
    public getAvatar(): string {
        return this._userInfo.avatar;
    }

    /**
     * 设置头像
     */
    public setAvatar(avatar: string): void {
        this._userInfo.avatar = avatar;
        this.saveToLocalStorage();
    }

    /**
     * 获取头像ID（兼容性方法）
     */
    public getAvatarId(): string {
        return this._userInfo.avatar;
    }

    /**
     * 设置头像ID（兼容性方法）
     */
    public setAvatarId(avatarId: string): void {
        this._userInfo.avatar = avatarId;
        this.saveToLocalStorage();
    }

    /**
     * 获取头像背景颜色
     */
    public getAvatarBgColor(): string {
        return this._userInfo.avatarBgColor;
    }

    /**
     * 设置头像背景颜色
     */
    public setAvatarBgColor(avatarBgColor: string): void {
        this._userInfo.avatarBgColor = avatarBgColor;
        this.saveToLocalStorage();
    }
    // ========== 货币系统 ==========

    /**
     * 获取金币数量
     */
    public getGold(): number {
        return this._userInfo.gold;
    }

    /**
     * 设置金币数量
     */
    public setGold(gold: number): void {
        this._userInfo.gold = Math.max(0, gold);
        this.saveToLocalStorage();
    }

    /**
     * 增加金币
     */
    public addGold(amount: number): void {
        this._userInfo.gold += Math.max(0, amount);
        this.saveToLocalStorage();
    }

    /**
     * 消耗金币
     */
    public consumeGold(amount: number): boolean {
        if (this._userInfo.gold >= amount) {
            this._userInfo.gold -= amount;
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    /**
     * 获取钻石数量
     */
    public getDiamond(): number {
        return this._userInfo.diamond;
    }

    /**
     * 设置钻石数量
     */
    public setDiamond(diamond: number): void {
        this._userInfo.diamond = Math.max(0, diamond);
        this.saveToLocalStorage();
    }

    /**
     * 增加钻石
     */
    public addDiamond(amount: number): void {
        this._userInfo.diamond += Math.max(0, amount);
        this.saveToLocalStorage();
    }

    /**
     * 消耗钻石
     */
    public consumeDiamond(amount: number): boolean {
        if (this._userInfo.diamond >= amount) {
            this._userInfo.diamond -= amount;
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    /**
     * 获取荣誉点数量
     */
    public getHonor(): number {
        return this._userInfo.honor || 0;
    }

    /**
     * 设置荣誉点数量
     */
    public setHonor(honor: number): void {
        this._userInfo.honor = Math.max(0, honor);
        this.saveToLocalStorage();
        // 批量更新时由 endBatchUpdate 统一触发事件
        if (!this.isBatchUpdating) {
            this.emitUpdateEvent();
        }
    }

    /**
     * 增加荣誉点
     */
    public addHonor(amount: number): void {
        if (!this._userInfo.honor) this._userInfo.honor = 0;
        this._userInfo.honor += Math.max(0, amount);
        this.saveToLocalStorage();
        // 批量更新时由 endBatchUpdate 统一触发事件
        if (!this.isBatchUpdating) {
            this.emitUpdateEvent();
        }
    }

    /**
     * 消耗荣誉点
     */
    public consumeHonor(amount: number): boolean {
        const current = this._userInfo.honor || 0;
        if (current >= amount) {
            this._userInfo.honor = current - amount;
            this.saveToLocalStorage();
            // 批量更新时由 endBatchUpdate 统一触发事件
            if (!this.isBatchUpdating) {
                this.emitUpdateEvent();
            }
            return true;
        }
        return false;
    }

    /**
     * 获取皮肤点券数量
     */
    public getSkinPoints(): number {
        return this._userInfo.skinPoints || 0;
    }

    /**
     * 增加皮肤点券
     */
    public addSkinPoints(amount: number): void {
        if (!this._userInfo.skinPoints) this._userInfo.skinPoints = 0;
        this._userInfo.skinPoints += Math.max(0, amount);
        this.saveToLocalStorage();
    }

    /**
     * 设置皮肤点券数量
     */
    public setSkinPoints(amount: number): void {
        this._userInfo.skinPoints = Math.max(0, amount);
        this.saveToLocalStorage();
    }

    public getFlamesVoucher(): number {
        return this._userInfo.flamesVoucher || 0;
    }

    public setFlamesVoucher(count: number): void {
        this._userInfo.flamesVoucher = Math.max(0, count);
        this.saveToLocalStorage();
        if (!this.isBatchUpdating) {
            this.emitUpdateEvent();
        }
    }

    /**
     * 消耗皮肤点券
     */
    public consumeSkinPoints(amount: number): boolean {
        if (this.getSkinPoints() >= amount) {
            this._userInfo.skinPoints -= amount;
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // ========== 体力系统 ==========

    /**
     * 获取当前体力
     */
    public getEnergy(): number {
        return this._userInfo.energy;
    }

    /**
     * 获取最大体力
     */
    public getMaxEnergy(): number {
        return this._userInfo.maxEnergy;
    }

    /**
     * 设置体力
     */
    public setEnergy(energy: number): void {
        this._userInfo.energy = Math.max(0, energy);
        this.saveToLocalStorage();
    }

    /**
     * 增加体力
     */
    public addEnergy(amount: number): void {
        this._userInfo.energy = this._userInfo.energy + Math.max(0, amount);
        this.saveToLocalStorage();
    }

    /**
     * 消耗体力
     */
    public consumeEnergy(amount: number): boolean {
        if (this._userInfo.energy >= amount) {
            this._userInfo.energy -= amount;
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    /**
     * 检查体力是否充足
     */
    public hasEnoughEnergy(amount: number): boolean {
        return this._userInfo.energy >= amount;
    }

    // ========== 经验系统 ==========

    /**
     * 获取当前经验总值
     */
    public getExp(): number {
        return this._userInfo.exp;
    }

    /**
     * 获取当前等级在当前经验总值下的剩余经验
     */
    public getCurrentLevelExp(): number {
        const currentLevelStartExp = this.getLevelStartExp(this._userInfo.level);
        return this._userInfo.exp - currentLevelStartExp;
    }

    /**
     * 获取当前等级升级所需的经验值
     */
    public getMaxExp(): number {
       return Utils.getExpRequiredForLevel(this.getLevel());
    }

    /**
     * 获取指定等级的起始经验总值
     */
    private getLevelStartExp(level: number): number {
       return Utils.getTotalExpForLevel(Math.max(1, level));
    }

    /**
     * 根据经验总值计算等级
     */
    private calculateLevelFromExp(totalExp: number): number {
        return Utils.getLevelFromTotalExp(Math.max(0, totalExp));
    }

    /**
     * 用 total 累计经验计算等级（从0级开始）
     */
    private calculateLevelFromTotalExp(totalExp: number): number {
        const totalTable = UserInfoData.LEVEL_EXP_MAP;

        for (let i = 0; i < totalTable.length; i++) {
            if (totalExp < totalTable[i]) {
                return i; // i从0开始，等级也从0开始
            }
        }

        // 如果超过最大值，返回最大等级（满级可自定义处理）
        return totalTable.length;
    }


    /**
     * 增加经验值
     */
    public addExp(exp: number): boolean {
        const oldLevel = this._userInfo.level;
        this._userInfo.exp += Math.max(0, exp);

        // 根据经验总值重新计算等级 - 使用正确的等级计算函数
        const newLevel = this.calculateLevelFromExp(this._userInfo.exp);
        this._userInfo.level = Math.max(1, newLevel);

        const leveledUp = newLevel > oldLevel;

        // 保存数据（会自动发送HALL_USER_INFO_UPDATE事件）
        this.saveToLocalStorage();

        return leveledUp;
    }

    /**
     * 设置经验总值
     */
    public setExp(exp: number): void {
        this._userInfo.exp = Math.max(0, exp);
        // 根据经验总值重新计算等级 - 使用正确的等级计算函数
        this._userInfo.level = Math.max(1, this.calculateLevelFromExp(this._userInfo.exp));
         this.saveToLocalStorage();
    }

    // ========== VIP系统 ==========

    /**
     * 获取VIP等级
     */
    public getVipLevel(): number {
        return this._userInfo.vipLevel;
    }

    /**
     * 设置VIP等级
     */
    public setVipLevel(vipLevel: number): void {
        this._userInfo.vipLevel = Math.max(0, vipLevel);
        this.saveToLocalStorage();
    }

    /**
     * 获取战斗力（服务器值）
     */
    public getFightPower(): number {
        return this._userInfo.fightPower || 0;
    }

    /**
     * 设置战斗力（服务器值）
     */
    public setFightPower(fightPower: number): void {
        this._userInfo.fightPower = Math.max(0, fightPower);
        this.saveToLocalStorage();
    }

    // ========== 战斗力系统 ==========

    /**
     * 计算战斗力
     * 优先使用服务器返回的战斗力值，如果没有则基于等级、VIP等级、装备等因素综合计算
     */
    public getCombatPower(): number {
        // 优先使用服务器返回的战斗力值
        if (this._userInfo.fightPower && this._userInfo.fightPower > 0) {
            return this._userInfo.fightPower;
        }

        // 如果服务器没有返回战斗力值，则使用本地计算
        let combatPower = 0;

        // 基础战斗力：等级 × 100
        combatPower += this._userInfo.level * 100;

        // VIP加成：VIP等级 × 500
        combatPower += this._userInfo.vipLevel * 500;

        // 经验加成：总经验 / 100
        combatPower += Math.floor(this._userInfo.exp / 100);

        // 财富加成：金币和钻石影响战斗力
        // 金币加成：每10000金币+1战斗力
        combatPower += Math.floor(this._userInfo.gold / 10000);

        // 钻石加成：每10钻石+5战斗力
        combatPower += Math.floor(this._userInfo.diamond / 10) * 5;

        // TODO: 可以根据实际需求添加更多因素
        // - 装备战斗力
        // - 技能等级加成
        // - 宠物加成
        // - 称号加成等

        return Math.max(0, combatPower);
    }

    /**
     * 获取战斗力等级称号
     */
    public getCombatPowerTitle(): string {
        const power = this.getCombatPower();

        if (power >= 1000000) {
            return "传说霸主";
        } else if (power >= 500000) {
            return "神话强者";
        } else if (power >= 100000) {
            return "史诗勇士";
        } else if (power >= 50000) {
            return "稀有精英";
        } else if (power >= 10000) {
            return "优秀战士";
        } else if (power >= 5000) {
            return "熟练冒险者";
        } else if (power >= 1000) {
            return "初级战士";
        } else {
            return "新手冒险者";
        }
    }

    // ========== 时间相关 ==========

    /**
     * 获取创建时间
     */
    public getCreateTime(): number {
        return this._userInfo.createTime;
    }

    /**
     * 获取最后登录时间
     */
    public getLastLoginTime(): number {
        return this._userInfo.lastLoginTime;
    }

    /**
     * 更新最后登录时间
     */
    public updateLastLoginTime(): void {
        this._userInfo.lastLoginTime = Date.now();
        this.saveToLocalStorage();
    }

    // ========== 关卡系统 ==========

    /**
     * 获取当前关卡
     */
    public getCurrentStage(): number {
        return this._userInfo.currentStage;
    }

    /**
     * 设置当前关卡
     */
    public setCurrentStage(stage: number): void {
        this._userInfo.currentStage = Math.max(1, stage);
        this.saveToLocalStorage();
    }

    /**
     * 获取最大已解锁关卡
     */
    public getMaxStage(): number {
        return this._userInfo.maxStage;
    }

    /**
     * 设置最大已解锁关卡
     */
    public setMaxStage(stage: number): void {
        this._userInfo.maxStage = Math.max(1, stage);
        this.saveToLocalStorage();
    }

    /**
     * 解锁新关卡（通关时调用）
     * @param stage 要解锁的关卡
     * @returns 是否成功解锁了新关卡
     */
    public unlockStage(stage: number): boolean {
        const oldMaxStage = this._userInfo.maxStage;
        if (stage > this._userInfo.maxStage) {
            this._userInfo.maxStage = stage;
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    /**
     * 检查关卡是否已解锁
     */
    public isStageUnlocked(stage: number): boolean {
        return stage <= this._userInfo.maxStage;
    }

    /**
     * 进入关卡（设置当前关卡）
     */
    public enterStage(stage: number): boolean {
        if (this.isStageUnlocked(stage)) {
            this._userInfo.currentStage = stage;
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    /**
     * 通关当前关卡
     * 自动解锁下一关并设置为当前关卡
     */
    public completeCurrentStage(): void {
        const nextStage = this._userInfo.currentStage + 1;
        this.unlockStage(nextStage);
        this._userInfo.currentStage = nextStage;
        this.saveToLocalStorage();
    }

    /**
     * 获取关卡进度百分比（当前关卡/最大关卡）
     */
    public getStageProgress(): number {
        if (this._userInfo.maxStage === 0) return 0;
        return Math.min(100, (this._userInfo.currentStage / this._userInfo.maxStage) * 100);
    }

    // ========== 星星系统 ==========

    /**
     * 获取指定关卡的星星数据
     * @param stageIndex 关卡索引 (0-based)
     * @returns 星星数据或默认数据
     */
    public getStageStars(stageIndex: number): StageStarData {
        if (this._userInfo.stageStars[stageIndex]) {
            return { ...this._userInfo.stageStars[stageIndex] };
        }
        return { normal: 0, elite: 0 };
    }

    /**
     * 获取指定关卡指定难度的星星数
     * @param stageIndex 关卡索引 (0-based)
     * @param difficulty 难度 ('normal' | 'elite')
     * @returns 星星数 (0-3)
     */
    public getStageDifficultyStars(stageIndex: number, difficulty: 'normal' | 'elite'): number {
        const stageStars = this.getStageStars(stageIndex);
        return stageStars[difficulty];
    }

    /**
     * 设置指定关卡的星星数据
     * @param stageIndex 关卡索引 (0-based)
     * @param normal 普通难度星星数 (0-3)
     * @param elite 精英难度星星数 (0-3)
     */
    public setStageStars(stageIndex: number, normal: number, elite: number): void {
        if (!this._userInfo.stageStars) {
            this._userInfo.stageStars = {};
        }

        this._userInfo.stageStars[stageIndex] = {
            normal: Math.max(0, Math.min(3, normal)),
            elite: Math.max(0, Math.min(3, elite))
        };

        this.saveToLocalStorage();
    }

    /**
     * 设置指定关卡指定难度的星星数
     * @param stageIndex 关卡索引 (0-based)
     * @param difficulty 难度 ('normal' | 'elite')
     * @param stars 星星数 (0-3)
     */
    public setStageDifficultyStars(stageIndex: number, difficulty: 'normal' | 'elite', stars: number): void {
        const currentStars = this.getStageStars(stageIndex);
        currentStars[difficulty] = Math.max(0, Math.min(3, stars));
        this.setStageStars(stageIndex, currentStars.normal, currentStars.elite);
    }

    /**
     * 获取所有关卡的星星数据
     * @returns 星星数据对象
     */
    public getAllStageStars(): { [stageIndex: number]: StageStarData } {
        return { ...this._userInfo.stageStars };
    }

    /**
     * 获取总星星数统计
     * @returns { totalNormal: number, totalElite: number, total: number }
     */
    public getTotalStarsCount(): { totalNormal: number, totalElite: number, total: number } {
        let totalNormal = 0;
        let totalElite = 0;

        for (const stageIndex in this._userInfo.stageStars) {
            const stageStars = this._userInfo.stageStars[stageIndex];
            totalNormal += stageStars.normal;
            totalElite += stageStars.elite;
        }

        return {
            totalNormal,
            totalElite,
            total: totalNormal + totalElite
        };
    }

    // ========== 数据持久化 ==========

    /**
     * 开始批量更新（减少事件触发频率）
     */
    public beginBatchUpdate(): void {
        this.isBatchUpdating = true;
        this.needsUpdateEvent = false;
    }

    /**
     * 结束批量更新（触发一次事件）
     */
    public endBatchUpdate(): void {
        this.isBatchUpdating = false;
        if (this.needsUpdateEvent) {
            this.emitUpdateEvent();
            this.needsUpdateEvent = false;
        }
    }

    /**
     * 保存到本地存储
     */
    private saveToLocalStorage(): void {
        try {
            const data = JSON.stringify(this._userInfo);
           // Use Cocos sys.localStorage to ensure persistence across platforms
            sys.localStorage.setItem(LOCAL_STORAGE_KEY, data);

            // 批量更新时延迟发送事件
            if (this.isBatchUpdating) {
                this.needsUpdateEvent = true;
            } else {
                // 发送用户信息更新事件
                this.emitUpdateEvent();
            }
        } catch (error) {
            console.error('保存用户信息失败:', error);
        }
    }

    /**
     * 从本地存储加载
     */
    private loadFromLocalStorage(): void {
        try {
            const data = sys.localStorage.getItem(LOCAL_STORAGE_KEY);
            if (data) {
                const userInfo = JSON.parse(data);
                if (userInfo && typeof userInfo === 'object') {
                    this._userInfo = { ...this._userInfo, ...(userInfo as any) };
                }

                const anyInfo = this._userInfo as any;
                if (anyInfo.guildId != null) anyInfo.guildId = String(anyInfo.guildId);
                if (anyInfo.guildName != null) anyInfo.guildName = String(anyInfo.guildName);
                if (anyInfo.guildLevel != null) anyInfo.guildLevel = Math.max(1, Number(anyInfo.guildLevel));

                // 数据兼容性处理：确保有stageStars字段
                if (!this._userInfo.stageStars) {
                    this._userInfo.stageStars = this.generateDefaultStageStars();
                    console.log('UserInfoData: 添加缺失的星星数据');
                }

                console.log('UserInfoData: 从本地存储加载数据成功');
                console.log(`  当前关卡: ${this._userInfo.currentStage}`);
                console.log(`  最大关卡: ${this._userInfo.maxStage}`);
            } else {
                console.log('UserInfoData: 本地存储中没有用户数据');
            }
        } catch (error) {
            console.error('UserInfoData: 加载用户信息失败:', error);
            this.initDefaultData();
        }
    }

    /**
     * 生成默认星星数据
     */
    private generateDefaultStageStars(): { [stageIndex: number]: StageStarData } {
        const stageStars: { [stageIndex: number]: StageStarData } = {};

        // 为前几关生成一些模拟星星数据
        // const completedStages = Math.min(5, this._userInfo?.maxStage || 1);
        const completedStages = 0

        for (let i = 0; i < completedStages; i++) {
            // 普通难度随机1-3星
            const normalStars = Math.floor(Math.random() * 3) + 1;
            // 精英难度有30%概率有星星，如果有则1-3星随机
            const eliteStars = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0;

            stageStars[i] = {
                normal: normalStars,
                elite: eliteStars
            };
        }

        return stageStars;
    }

    /**
     * 重置用户数据
     */
    public resetUserData(): void {
        this._userInfo = {
            bearer: "",
            userId: '',
            userName: '新手玩家',
            avatarBgColor: "#7D60DA", // 默认紫色 #7D60DA
            level: 0, // 从0级开始
            avatar: "avatar_default",
            // 头像背景颜色
            gold: 9999,
            diamond: 100,
            honor: 0,
            energy: 100,
            maxEnergy: 100,
            exp: 0,
            vipLevel: 0,
            skinPoints: 1000, // 默认1000皮肤点券
            createTime: Date.now(),
            lastLoginTime: Date.now(),
            currentStage: 1,
            maxStage: 0,
            stageStars: {},
            fightPower: 0,
            wxNickName: '',      // 微信昵称
            wxPhoneNumber: '',   // 微信电话号码
            wxAvatarUrl: '',     // 微信头像URL
            useWxAvatar: true    // 默认使用微信头像
        };
        this.saveToLocalStorage();
        console.log('UserInfoData: 用户数据已重置');
    }

    /**
     * 获取用户数据的字符串表示（用于调试）
     */
    public toString(): string {
        return JSON.stringify(this._userInfo, null, 2);
    }

    /**
     * 清除本地存储数据（调试用）
     */
    public clearLocalStorage(): void {
         sys.localStorage.removeItem(LOCAL_STORAGE_KEY);
        console.log('UserInfoData: 本地存储数据已清除');
    }

    /**
     * 检查本地存储中的数据（调试用）
     */
    public checkLocalStorage(): void {
        const data = sys.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (data) {
            console.log('UserInfoData: 本地存储中的数据:');
            console.log(JSON.parse(data));
        } else {
            console.log('UserInfoData: 本地存储中没有数据');
        }
    }


    //  策划提供 用experience
    //  public static LEVEL_EXP_MAP: number[] = [
    //     1000, 1050, 1103, 1158, 1216, 1276, 1340, 1407, 1477, 1551,
    //     1629, 1710, 1796, 1886, 1980, 2079, 2183, 2292, 2407, 2527,
    //     2653, 2786, 2925, 3072, 3225, 3386, 3556, 3733, 3920, 4116,
    //     4322, 4538, 4765, 5003, 5253, 5516, 5792, 6081, 6385, 6705,
    //     7040, 7392, 7762, 8150, 8557, 8985, 9434, 9906, 10401, 10921,
    //     11467, 12041, 12643, 13275, 13939, 14636, 15367, 16136, 16943, 17790,
    //     18679, 19613, 20594, 21623, 22705, 23840, 25032, 26283, 27598, 28978,
    //     30426, 31948, 33545, 35222, 36984, 38833, 40774, 42813, 44954, 47201,
    //     49561, 52040, 54641, 57374, 60242, 63254, 66417, 69738, 73225, 76886,
    //     80730, 84767, 89005, 93455, 98128, 103035, 108186, 113596, 119276, 125239,
    //     131501, 138076, 144980, 152229, 159841, 167833, 176224, 185035, 194287, 204002,
    //     214202, 224912, 236157, 247965, 260363, 273382, 287051, 301403, 316473, 332297,
    //     348912, 366358, 384675, 403909, 424105, 445310, 467575, 490954, 515502, 541277,
    //     568341, 596758, 626596, 657926, 690822, 725363, 761631, 799713, 839698, 881683,
    //     925767, 972056, 1020659, 1071691, 1125276, 1181540, 1240617, 1302648, 1367780, 1436169,
    //     1507977, 1583376, 1662545, 1745672, 1832956, 1924604, 2020834, 2121876, 2227970, 2339368,
    //     2456336, 2579153, 2708111, 2843516, 2985692, 3134977, 3291726, 3456312, 3629128, 3810584,
    //     4001113, 4201169, 4411227, 4631789, 4863378, 5106547, 5361874, 5629968, 5911467, 6207040,
    //     6517392, 6843261, 7185425, 7544696, 7921931, 8318027, 8733928, 9170625, 9629156, 10110614,
    //     10616145, 11146952, 11704299, 12289514, 12903990, 13549190, 14226649, 14937981
    //   ];


    // 策划提供 用total
    public static LEVEL_EXP_MAP: number[] = [
        1000, 2050, 3153, 4311, 5527, 6803, 8143, 9550, 11027, 12578,
        14207, 15917, 17713, 19599, 21579, 23658, 25841, 28133, 30540, 33067,
        35720, 38506, 41431, 44503, 47728, 51114, 54670, 58403, 62323, 66439,
        70761, 75299, 80064, 85067, 90320, 95836, 101628, 107709, 114094, 120799,
        127839, 135231, 142993, 151143, 159700, 168685, 178119, 188025, 198426, 209347,
        220814, 232855, 245498, 258773, 272712, 287348, 302715, 318851, 335794, 353584,
        372263, 391876, 412470, 434093, 456798, 480638, 505670, 531953, 559551, 588529,
        618955, 650903, 684448, 719670, 756654, 795487, 836261, 879074, 924028, 971229,
        1020790, 1072830, 1127471, 1184845, 1245087, 1308341, 1374758, 1444496, 1517721, 1594607,
        1675337, 1760104, 1849109, 1942564, 2040692, 2143727, 2251913, 2365509, 2484785, 2610024,
        2741525, 2879601, 3024581, 3176810, 3336651, 3504484, 3680708, 3865743, 4060030, 4264032,
        4478234, 4703146, 4939303, 5187268, 5447631, 5721013, 6008064, 6309467, 6625940, 6958237,
        7307149, 7673507, 8058182, 8462091, 8886196, 9331506, 9799081, 10290035, 10805537, 11346814,
        11915155, 12511913, 13138509, 13796435, 14487257, 15212620, 15974251, 16773964, 17613662, 18495345,
        19421112, 20393168, 21413827, 22485518, 23610794, 24792334, 26032951, 27335599, 28703379, 30139548,
        31647525, 33230901, 34893446, 36639118, 38472074, 40396678, 42417512, 44539388, 46767358, 49106726,
        51563062, 54142215, 56850326, 59693842, 62679534, 65814511, 69106237, 72562549, 76191677, 80002261,
        84003374, 88204543, 92615770, 97247559, 102110937, 107217484, 112579358, 118209326, 124120793, 130327833,
        136845225, 143688486, 150873911, 158418607, 166340538, 174658565, 183392493, 192563118, 202192274, 212302888,
        222919033, 234065985, 245770284, 258059798, 270963788, 284512978, 298739627, 313677608
    ];



    // ========== 体力系统别名方法（兼容性） ==========

    /**
     * 获取当前体力（别名方法）
     */
    public getStamina(): number {
        return this._userInfo.energy;
    }

    /**
     * 获取最大体力（别名方法）
     */
    public getMaxStamina(): number {
        return this._userInfo.maxEnergy;
    }

    /**
     * 设置体力（别名方法）
     */
    public setStamina(stamina: number): void {
        this.setEnergy(stamina);
    }



    /**
     * 增加体力（别名方法）
     */
    public addStamina(amount: number): void {
        this.addEnergy(amount);
    }

    /**
     * 消耗体力（别名方法）
     */
    public consumeStamina(amount: number): boolean {
        return this.consumeEnergy(amount);
    }

    /**
     * 检查体力是否充足（别名方法）
     */
    public hasEnoughStamina(amount: number): boolean {
        return this.hasEnoughEnergy(amount);
    }

    /**
     * 发送用户信息更新事件
     */
    private emitUpdateEvent(): void {
        director.emit(game.gameEvent.HALL_USER_INFO_UPDATE)
        // 发送全局用户信息更新事件
        // director.emit('HALL_USER_INFO_UPDATE', this.getUserInfo());
    }

    // ========== 与 GlobalVariable 同步方法 ==========

    /**
     * 将关卡数据同步到 GlobalVariable（原封不动）
     * 初始化时调用一次
     */
    public syncToGlobalVariable(): void {
        game.myGlobal.currentStage = this._userInfo.currentStage;
        game.myGlobal.maxStage = this._userInfo.maxStage;
         // 同步经验到全局，确保UI按经验显示等级一致
        game.myGlobal.currentExp = this._userInfo.exp || 0;

        if (!game.myGlobal.currentStage || game.myGlobal.currentStage <= 0) {
            game.myGlobal.currentStage = 1
            game.myGlobal.maxStage = 1
        }
        console.log(`UserInfoData: 同步关卡数据到 GlobalVariable:`);
        console.log(`  当前关卡: ${game.myGlobal.currentStage}`);
        console.log(`  最大关卡: ${game.myGlobal.maxStage}`);
        console.log(`  当前经验: ${game.myGlobal.currentExp}`);
    }

    /**
     * 从 game.myGlobal 更新当前关卡（过关时调用）
     */
    public updateCurrentStageFromGlobal(): void {
        this.setCurrentStage(game.myGlobal.currentStage);
        this.setMaxStage(game.myGlobal.maxStage);

        console.log(`UserInfoData: 从 GlobalVariable 更新当前关卡:`);
        console.log(`  当前关卡: ${this._userInfo.currentStage}`);
        console.log(`  最大关卡: ${this._userInfo.maxStage}`);
    }

    // ========== 微信相关属性方法 ==========

    /**
     * 获取微信昵称
     */
    public getWxNickName(): string {
        return this._userInfo.wxNickName || '';
    }

    /**
     * 设置微信昵称
     */
    public setWxNickName(wxNickName: string): void {
        this._userInfo.wxNickName = wxNickName;
        this.saveToLocalStorage();
        this.emitUpdateEvent();
    }

    /**
     * 获取微信电话号码
     */
    public getWxPhoneNumber(): string {
        return this._userInfo.wxPhoneNumber || '';
    }

    /**
     * 设置微信电话号码
     */
    public setWxPhoneNumber(wxPhoneNumber: string): void {
        this._userInfo.wxPhoneNumber = wxPhoneNumber;
        this.saveToLocalStorage();
        this.emitUpdateEvent();
    }

    /**
     * 获取微信头像URL
     */
    public getWxAvatarUrl(): string {
        return this._userInfo.wxAvatarUrl || '';
    }

    /**
     * 设置微信头像URL
     */
    public setWxAvatarUrl(wxAvatarUrl: string): void {
        this._userInfo.wxAvatarUrl = wxAvatarUrl;
        this.saveToLocalStorage();
        this.emitUpdateEvent();
    }

    /**
     * 获取是否使用微信头像
     */
    public getUseWxAvatar(): boolean {
        return this._userInfo.useWxAvatar !== false; // 默认为true
    }

    /**
     * 设置是否使用微信头像
     */
    public setUseWxAvatar(useWxAvatar: boolean): void {
        this._userInfo.useWxAvatar = useWxAvatar;
        this.saveToLocalStorage();
        this.emitUpdateEvent();
    }

    // ========== 服务器数据同步方法 ==========

    /**
     * 从服务器关卡进度数据同步到本地星星数据
     * @param levelProgressList 服务器返回的关卡进度数组
     */
    public syncStageStarsFromServer(levelProgressList: LevelProgressData[]): void {
        if (!levelProgressList || !Array.isArray(levelProgressList)) {
            console.warn('UserInfoData: 服务器关卡进度数据无效');
            return;
        }

        // 重置星星数据
        this._userInfo.stageStars = {};

        // 先从 levelProgressList 更新 stageMap 星星
        const stageMap = new Map<number, { normal: number, elite: number }>();

        levelProgressList.forEach(progress => {
            const stageIndex = progress.level - 1; // 转换为0-based索引
            const isElite = progress.isElite === 1;
            const stars = Math.max(0, Math.min(3, progress.starRate)); // 确保星星数在0-3范围内

            if (!stageMap.has(stageIndex)) {
                stageMap.set(stageIndex, { normal: 0, elite: 0 });
            }

            const stageData = stageMap.get(stageIndex);
            if (isElite) {
                stageData.elite = Math.max(stageData.elite, stars); // 取最高星星数
            } else {
                stageData.normal = Math.max(stageData.normal, stars); // 取最高星星数
            }
        });


        // 循环遍历从第1关到最大关卡，确保普通模式至少1星
        for (let level = 1; level <= this._userInfo.maxStage; level++) {
            const stageIndex = level - 1; // 转换为0-based索引

            if (!stageMap.has(stageIndex)) {
                stageMap.set(stageIndex, { normal: 0, elite: 0 });
            }

            const stageData = stageMap.get(stageIndex);

            // 若普通关卡为0星设置为1星（最大关卡如果是0星可以略过）
            if (stageData.normal === 0 && level < this._userInfo.maxStage) {
                stageData.normal = 1;
                console.log(`UserInfoData: 关卡${level}普通模式自动设置为1星`);
            }
        }

        // 转换为 stageStars 格式
        stageMap.forEach((stageData, stageIndex) => {
            this._userInfo.stageStars[stageIndex] = {
                normal: stageData.normal,
                elite: stageData.elite
            };
        });

        this.saveToLocalStorage();

        console.log('UserInfoData: 从服务器同步关卡星星数据完成');
        console.log(`  同步了 ${stageMap.size} 个关卡的数据`);
        console.log(`  最大解锁关卡: ${this._userInfo.maxStage}`);

        // 调试输出前几个关卡的星星数据
        for (let i = 0; i < Math.min(5, stageMap.size); i++) {
            const stars = this._userInfo.stageStars[i];
            if (stars) {
                console.log(`  关卡${i + 1}: 普通${stars.normal}星, 精英${stars.elite}星`);
            }
        }
    }



}
