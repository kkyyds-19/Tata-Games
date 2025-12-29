import { _decorator } from 'cc';
import { UserInfoData } from './UserInfoData';
const { ccclass } = _decorator;

/**
 * 科技树节点类型
 */
export enum TechNodeType {
    ATTACK = 'attack',      // 攻击力
    DEFENSE = 'defense',    // 防御力
    HEALTH = 'health',      // 生命值
    SKILL = 'skill'         // 技能
}

/**
 * 简化的科技树数据管理（全局单例）
 */
@ccclass('UserTechTreeData')
export class UserTechTreeData {
    private static _instance: UserTechTreeData = null;
    
    // 当前激活的等级
    private _currentAttackLevel: number = 0;      // 当前激活的攻击力等级
    private _currentDefenseLevel: number = 0;     // 当前激活的防御力等级
    private _currentHealthLevel: number = 0;      // 当前激活的生命值等级
    private _currentSkillLevel: number = 0;       // 当前激活的技能等级


    
    // 技能数据表 - 某些级别可能没有技能，扩展到100级
    private static SKILL_DATA: { [level: number]: { skillId: string, skillName: string, description: string } } = {
        1: { skillId: 'skill_001', skillName: '基础战斗技巧', description: '提升基础战斗能力，解锁战斗连击' },
        5: { skillId: 'skill_001', skillName: '基础战斗技巧', description: '提升基础战斗能力，解锁战斗连击' },
        10: { skillId: 'skill_002', skillName: '进阶战术', description: '掌握进阶战术技巧，提升团队配合' },
        15: { skillId: 'skill_003', skillName: '精英训练', description: '精英级别的训练成果，获得特殊技能' },
        20: { skillId: 'skill_004', skillName: '大师级技艺', description: '大师级别的战斗技艺，解锁终极技能' },
        25: { skillId: 'skill_005', skillName: '传奇之力', description: '传奇级别的力量觉醒，获得传奇技能' },
        30: { skillId: 'skill_006', skillName: '英雄觉醒', description: '英雄级别的力量觉醒，全面提升战斗力' },
        35: { skillId: 'skill_007', skillName: '战场统御', description: '掌握战场统御技巧，指挥千军万马' },
        40: { skillId: 'skill_008', skillName: '神话传说', description: '神话级别的技能掌握，超越凡人极限' },
        45: { skillId: 'skill_009', skillName: '元素掌控', description: '掌控自然元素的力量，呼风唤雨' },
        50: { skillId: 'skill_010', skillName: '至尊无敌', description: '至尊级别的无敌技能，统御战场' },
        55: { skillId: 'skill_011', skillName: '时空操控', description: '操控时间与空间的禁忌力量' },
        60: { skillId: 'skill_012', skillName: '龙魂觉醒', description: '觉醒远古龙族血脉，获得龙之力量' },
        65: { skillId: 'skill_013', skillName: '不死不灭', description: '超越生死界限，获得不朽之身' },
        70: { skillId: 'skill_014', skillName: '万法归一', description: '融合所有法则，达到万法归一境界' },
        75: { skillId: 'skill_015', skillName: '创世神力', description: '掌握创造与毁灭的神级力量' },
        80: { skillId: 'skill_016', skillName: '维度穿越', description: '穿越多元宇宙，掌控维度之力' },
        85: { skillId: 'skill_017', skillName: '因果律控', description: '操控因果律则，改写命运轨迹' },
        90: { skillId: 'skill_018', skillName: '宇宙意志', description: '与宇宙意志共鸣，获得无限智慧' },
        95: { skillId: 'skill_019', skillName: '超越极限', description: '超越一切已知极限，达到无上境界' },
        100: { skillId: 'skill_020', skillName: '终极进化', description: '生命的终极进化，成为宇宙至高存在' }
    };

    private constructor() {
        // 初始化完成
    }

    public static getInstance(): UserTechTreeData {
        if (!this._instance) {
            this._instance = new UserTechTreeData();
        }
        return this._instance;
    }

    /**
     * 计算攻击力数值（丝滑公式）
     * 1级 10攻击，每过5级+10
     */
    public calculateAttackValue(level: number): number {
        if (level <= 0) return 0;
        return 10 + Math.floor((level - 1) / 5) * 10;
    }

    /**
     * 计算防御减伤数值（丝滑公式）
     * 1级 减伤1，每5级+1
     */
    public calculateDefenseValue(level: number): number {
        if (level <= 0) return 0;
        return 1 + Math.floor((level - 1) / 5);
    }

    /**
     * 计算生命值数值（丝滑公式）
     * 1级 100点生命，每过5级+100点
     */
    public calculateHealthValue(level: number): number {
        if (level <= 0) return 0;
        return 100 + Math.floor((level - 1) / 5) * 100;
    }

    /**
     * 计算解锁所需金币（丝滑公式）
     */
    public calculateUnlockCost(level: number, type: TechNodeType): number {
        if (level <= 0) return 0;
        
        let baseCost = 0;
        let multiplier = 1;

        switch (type) {
            case TechNodeType.ATTACK:
                baseCost = 100;
                multiplier = 1.2;
                break;
            case TechNodeType.DEFENSE:
                baseCost = 120;
                multiplier = 1.15;
                break;
            case TechNodeType.HEALTH:
                baseCost = 80;
                multiplier = 1.25;
                break;
            case TechNodeType.SKILL:
                baseCost = 200;
                multiplier = 1.5;
                break;
        }

        return Math.floor(baseCost * Math.pow(level, 1.3) * multiplier);
    }

    /**
     * 检查是否可以激活指定等级的节点
     * 激活前提：等级1攻击->等级1防御->等级1生命->等级2攻击->等级2防御->等级2生命...
     * 技能独立：只能激活有技能配置的等级，且必须按顺序激活
     */
    public canActivate(level: number, type: TechNodeType): boolean {
        if (level <= 0) return false;

        if (type === TechNodeType.SKILL) {
            // 检查该等级是否有技能配置
            if (!UserTechTreeData.SKILL_DATA[level]) {
                return false; // 该等级没有技能，无法激活
            }
            
            // 找到下一个应该激活的技能等级
            const nextSkillLevel = this.getNextAvailableSkillLevel();
            return level === nextSkillLevel;
        }

        // 属性升级需要按顺序
        if (type === TechNodeType.ATTACK) {
            // 攻击力：需要前一轮的生命值已激活
            if (level === 1) return true;
            return this._currentHealthLevel >= level - 1;
        }

        if (type === TechNodeType.DEFENSE) {
            // 防御力：需要同级攻击力已激活
            return this._currentAttackLevel >= level;
        }

        if (type === TechNodeType.HEALTH) {
            // 生命值：需要同级防御力已激活
            return this._currentDefenseLevel >= level;
        }

        return false;
    }

    /**
     * 获取下一个可激活的技能等级
     */
    private getNextAvailableSkillLevel(): number {
        // 获取所有有技能的等级，并排序
        const skillLevels = Object.keys(UserTechTreeData.SKILL_DATA)
            .map(level => parseInt(level))
            .sort((a, b) => a - b);

        // 找到当前技能等级在数组中的位置
        let currentIndex = -1;
        for (let i = 0; i < skillLevels.length; i++) {
            if (skillLevels[i] <= this._currentSkillLevel) {
                currentIndex = i;
            }
        }

        // 返回下一个技能等级
        if (currentIndex + 1 < skillLevels.length) {
            return skillLevels[currentIndex + 1];
        }

        return -1; // 没有更多技能了
    }

    /**
     * 激活指定等级的节点
     */
    public activateNode(level: number, type: TechNodeType): boolean {
        // 检查是否已经激活
        switch (type) {
            case TechNodeType.ATTACK:
                if (this._currentAttackLevel >= level) {
                    console.warn(`攻击力 Lv.${level} 已经激活，当前等级: ${this._currentAttackLevel}`);
                    return false;
                }
                break;
            case TechNodeType.DEFENSE:
                if (this._currentDefenseLevel >= level) {
                    console.warn(`防御力 Lv.${level} 已经激活，当前等级: ${this._currentDefenseLevel}`);
                    return false;
                }
                break;
            case TechNodeType.HEALTH:
                if (this._currentHealthLevel >= level) {
                    console.warn(`生命值 Lv.${level} 已经激活，当前等级: ${this._currentHealthLevel}`);
                    return false;
                }
                break;
            case TechNodeType.SKILL:
                if (this._currentSkillLevel >= level) {
                    console.warn(`技能 Lv.${level} 已经激活，当前等级: ${this._currentSkillLevel}`);
                    return false;
                }
                break;
        }

        if (!this.canActivate(level, type)) {
            console.warn(`无法激活 ${type} 等级 ${level}：不满足前提条件`);
            return false;
        }

        // 检查用户等级是否足够
        const userInfo = UserInfoData.getInstance();
        if (userInfo.getLevel() < level) {
            console.warn(`用户等级不足：需要等级 ${level}，当前等级 ${userInfo.getLevel()}`);
            return false;
        }

        // 检查金币是否足够
        const cost = this.calculateUnlockCost(level, type);
        if (!userInfo.consumeGold(cost)) {
            console.warn(`金币不足：需要 ${cost} 金币`);
            return false;
        }

        // 激活节点
        switch (type) {
            case TechNodeType.ATTACK:
                this._currentAttackLevel = level;
                break;
            case TechNodeType.DEFENSE:
                this._currentDefenseLevel = level;
                break;
            case TechNodeType.HEALTH:
                this._currentHealthLevel = level;
                break;
            case TechNodeType.SKILL:
                this._currentSkillLevel = level;
                break;
        }

        console.log(`成功激活 ${type} 等级 ${level}，消耗金币 ${cost}`);
        return true;
    }

    /**
     * 获取指定类型的总属性加成
     */
    public getTotalBonus(type: TechNodeType): number {
        switch (type) {
            case TechNodeType.ATTACK:
                return this.calculateTotalAttackValue(this._currentAttackLevel);
            case TechNodeType.DEFENSE:
                return this.calculateTotalDefenseValue(this._currentDefenseLevel);
            case TechNodeType.HEALTH:
                return this.calculateTotalHealthValue(this._currentHealthLevel);
            default:
                return 0;
        }
    }

    /**
     * 获取当前激活的技能ID列表
     */
    public getActivatedSkillIds(): string[] {
        const skillIds: string[] = [];
        
        // 获取所有有技能的等级，并排序
        const skillLevels = Object.keys(UserTechTreeData.SKILL_DATA)
            .map(level => parseInt(level))
            .sort((a, b) => a - b);

        // 只获取当前技能等级及以下的技能
        for (const level of skillLevels) {
            if (level <= this._currentSkillLevel) {
                const skillData = UserTechTreeData.SKILL_DATA[level];
                if (skillData) {
                    skillIds.push(skillData.skillId);
                }
            }
        }
        
        return skillIds;
    }

    /**
     * 获取当前等级信息
     */
    public getCurrentLevels(): { attack: number, defense: number, health: number, skill: number } {
        return {
            attack: this._currentAttackLevel,
            defense: this._currentDefenseLevel,
            health: this._currentHealthLevel,
            skill: this._currentSkillLevel
        };
    }

    /**
     * 获取下一级所需金币
     */
    public getNextLevelCost(type: TechNodeType): number {
        let nextLevel = 0;
        
        switch (type) {
            case TechNodeType.ATTACK:
                nextLevel = this._currentAttackLevel + 1;
                break;
            case TechNodeType.DEFENSE:
                nextLevel = this._currentDefenseLevel + 1;
                break;
            case TechNodeType.HEALTH:
                nextLevel = this._currentHealthLevel + 1;
                break;
            case TechNodeType.SKILL:
                nextLevel = this._currentSkillLevel + 1;
                break;
        }

        return this.calculateUnlockCost(nextLevel, type);
    }

    /**
     * 获取技能信息
     */
    public getSkillInfo(level: number): { skillId: string, skillName: string, description: string } | null {
        return UserTechTreeData.SKILL_DATA[level] || null;
    }

    /**
     * 获取下一个可激活的技能信息
     */
    public getNextAvailableSkillInfo(): { level: number, skillId: string, skillName: string, description: string } | null {
        const nextLevel = this.getNextAvailableSkillLevel();
        if (nextLevel === -1) {
            return null; // 没有更多技能了
        }
        
        const skillData = UserTechTreeData.SKILL_DATA[nextLevel];
        if (skillData) {
            return {
                level: nextLevel,
                ...skillData
            };
        }
        
        return null;
    }

    /**
     * 获取所有可用的技能等级列表
     */
    public getAllSkillLevels(): number[] {
        return Object.keys(UserTechTreeData.SKILL_DATA)
            .map(level => parseInt(level))
            .sort((a, b) => a - b);
    }

    /**
     * 获取统计信息
     */
    public getStatistics(): any {
        return {
            currentLevels: this.getCurrentLevels(),
            totalBonuses: {
                attack: this.getTotalBonus(TechNodeType.ATTACK),
                defense: this.getTotalBonus(TechNodeType.DEFENSE),
                health: this.getTotalBonus(TechNodeType.HEALTH)
            },
            activatedSkills: this.getActivatedSkillIds(),
            nextLevelCosts: {
                attack: this.getNextLevelCost(TechNodeType.ATTACK),
                defense: this.getNextLevelCost(TechNodeType.DEFENSE),
                health: this.getNextLevelCost(TechNodeType.HEALTH),
                skill: this.getNextLevelCost(TechNodeType.SKILL)
            }
        };
    }

    /**
     * 计算攻击力累加总值
     * 从1级到当前等级的累加计算
     */
    public calculateTotalAttackValue(level: number): number {
        if (level <= 0) return 0;
        
        let totalAttack = 0;
        
        // 累加从1级到当前等级的所有攻击力
        for (let i = 1; i <= level; i++) {
            totalAttack += this.calculateAttackValue(i);
        }
        
        return totalAttack;
    }

    /**
     * 计算防御力累加总值
     * 从1级到当前等级的累加计算
     */
    public calculateTotalDefenseValue(level: number): number {
        if (level <= 0) return 0;
        
        let totalDefense = 0;
        
        // 累加从1级到当前等级的所有防御力
        for (let i = 1; i <= level; i++) {
            totalDefense += this.calculateDefenseValue(i);
        }
        
        return totalDefense;
    }

    /**
     * 计算生命值累加总值
     * 从1级到当前等级的累加计算
     */
    public calculateTotalHealthValue(level: number): number {
        if (level <= 0) return 0;
        
        let totalHealth = 0;
        
        // 累加从1级到当前等级的所有生命值
        for (let i = 1; i <= level; i++) {
            totalHealth += this.calculateHealthValue(i);
        }
        
        return totalHealth;
    }

} 