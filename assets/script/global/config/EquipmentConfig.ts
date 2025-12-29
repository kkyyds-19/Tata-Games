/**
 * 技能效果类型枚举
 * 与 FinalStats 接口保持一致，确保属性名称统一
 */
export enum SkillEffectType {
    // 基础属性
    MAXHP = "maxhp",
    //攻击属性
    ATTACK = "attack", 
    //防御属性
    DEFENSE = "defense",
    //伤害减免
    DAMAGE_REDUCTION = "damageReduction",
    
    // 技能相关 技能cd 减少
    SKILL_COOLDOWN = "skill_cooldown",
    
    // 暴击相关
    CRIT_RATE = "crit_rate",
    //暴击伤害
    CRIT_DAMAGE = "crit_damage",
    
    // 治疗效果 目前不支持
    HEALING_POWER = "healing_power",
    
    //吸血 百分比 目前不支持
    LIFESTEAL_PERCENT = "lifesteal_percent",
    //移动速度 目前不支持
    MOVE_SPEED = "moveSpeed",
    //攻击范围 目前不支持
    ATTACK_RANGE = "attackRange", 
    //荆棘护甲   目前不支持
    THORN_ARMOR = "thornArmor"
}

/**
 * 职业类型枚举
 */
export enum ClassType {
    TANK = 0,       // 坦克
    PRIEST = 1,     // 牧师
    HUNTER = 2,     // 猎人
    MAGE = 3,       // 法师
    ASSASSIN = 4,   // 刺客
    ALL = 99        // 全体
}

/**
 * 技能效果接口
 */
export interface SkillEffect {
    //装备效果类型
    type: SkillEffectType;
    //装备效果值
    value: number;
    //目标职业 0 全体 1 坦克 2 牧师 3 猎人 4 法师 5 刺客
    targetClass: ClassType;
    //描述
    description?: string;
}

/**
 * 装备配置接口
 */
export interface EquipmentConfig {
    id: number; //装备id
    name: string; //装备名称
    desc: string; //装备描述
    iconFrameName: string; //装备图标
    equipLevel: number; //装备阶级  2级装备 - 进阶装备（由1级装备解锁）
    unlockBy: number; //解锁条件 目标id    0为基础装备不用解锁   
    skillEffects: SkillEffect[]; //装备效果
}

/**
 * 装备配置数据
 */
export const equipmentConfigs: EquipmentConfig[] = [
    // 1级装备 - 基础装备
    {
        id: 1,
        name: "力量手套",
        desc: "坦克-技能伤害+20%",
        iconFrameName: "equip_0_1",
        equipLevel: 1,
        unlockBy: 0,
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.2,
                targetClass: ClassType.TANK,
                description: "坦克攻击力提升20%" 
            }
        ]
    },
    {
        id: 2,
        name: "树枝",
        desc: "牧师-攻击力+20%，治疗量+30%",
        iconFrameName: "equip_1_1",
        equipLevel: 1,
        unlockBy: 0,
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.2,
                targetClass: ClassType.PRIEST,
                description: "牧师攻击力提升20%" 
            },
            { 
                type: SkillEffectType.HEALING_POWER, 
                value: 0.3,
                targetClass: ClassType.PRIEST,
                description: "牧师治疗量提升30%" 
            }
        ]
    },
    {
        id: 3,
        name: "敏捷便鞋",
        desc: "猎人-技能伤害+20%",
        iconFrameName: "equip_2_1",
        equipLevel: 1,
        unlockBy: 0,
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.2,
                targetClass: ClassType.HUNTER,
                description: "猎人攻击力提升20%" 
            }
        ]
    },
    {
        id: 4,
        name: "攻击之爪",
        desc: "刺客-攻击速度+20%",
        iconFrameName: "equip_4_1",
        equipLevel: 1,
        unlockBy: 0,
        skillEffects: [
            { 
                type: SkillEffectType.SKILL_COOLDOWN, 
                value: -0.2,
                targetClass: ClassType.ASSASSIN,
                description: "刺客技能冷却减少20%" 
            }
            
        ]
    },
    {
        id: 5,
        name: "智力斗篷",
        desc: "法师-技能伤害+20%",
        iconFrameName: "equip_3_1",
        equipLevel: 1,
        unlockBy: 0,
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.2,
                targetClass: ClassType.MAGE,
                description: "法师攻击力提升20%" 
            }
        ]
    },

    //  2级装备 - 进阶装备（由1级装备解锁）
    {
        id: 6,
        name: "锁子甲",
        desc: "坦克-技能伤害+40%；战斗中每升五级，坦克技能伤害+10%",
        iconFrameName: "equip_0_2",
        equipLevel: 2,
        unlockBy: 1, // 由力量手套解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.4,
                targetClass: ClassType.TANK,
                description: "坦克攻击力提升40%，每升5级额外+10%" 
            },
            { 
                type: SkillEffectType.MAXHP, 
                value: 0.2,
                targetClass: ClassType.TANK,
                description: "坦克最大生命+20%" 
            },
        ]
    },

    {
        id: 7,
        name: "挂件",
        desc: "全体攻击力+20%，全体治疗量+25%",
        iconFrameName: "equip_99_3",
        equipLevel: 2,
        unlockBy: 2, // 由治疗法杖解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.2,
                targetClass: ClassType.ALL,
                description: "全体攻击力+20%" 
            },
            { 
                type: SkillEffectType.HEALING_POWER, 
                value: 0.25,
                targetClass: ClassType.ALL,
                description: "全体治疗量+25%" 
            }
        ]
    }, 


    {
        id: 8,
        name: "标枪",
        desc: "猎人-技能伤害+40%；战斗中每升五级，猎人技能伤害+10%",
        iconFrameName: "equip_2_2",
        equipLevel: 2,
        unlockBy: 3, // 由敏捷便鞋解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.4,
                targetClass: ClassType.HUNTER,
                description: "猎人攻击力提升40%，每升5级额外+10%" 
            },
        ]
    },

    {
        id: 9,
        name: "毒球",
        desc: "刺客-暴击率提高20% 暴击伤害增加20%",
        iconFrameName: "equip_99_2",
        equipLevel: 2,
        unlockBy: 4, // 由攻击之爪解锁
        skillEffects: [
            { 
                type: SkillEffectType.CRIT_RATE, 
                value: 0.2,
                targetClass: ClassType.ASSASSIN,
                description: "刺客暴击率提升20%" 
            },
            { 
                type: SkillEffectType.CRIT_DAMAGE, 
                value: 0.2,
                targetClass: ClassType.ASSASSIN,
                description: "刺客暴击伤害提升20%" 
            }
        ]
    },
    {
        id: 10,
        name: "大棒",
        desc: "法师-技能伤害+40%；战斗中每升5级，法师技能伤害+10%",
        iconFrameName: "equip_3_2",
        equipLevel: 2,
        unlockBy: 5, // 由智力斗篷解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.4,
                targetClass: ClassType.MAGE,
                description: "法师攻击力提升40%，每升5级额外+10%" 
            }
        ]
    },



    ///--3排
    {
        id: 11,
        name: "圣殿戒",
        desc: "全体技能伤害+20%；攻击后每4秒获得1层【蓄力】（每层+5%伤害，攻击后重置）",
        iconFrameName: "equip_99_5",
        equipLevel: 2,
        unlockBy: 1, // 由大剑解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.2,
                targetClass: ClassType.ALL,
                description: "全体攻击力+20%，蓄力机制" 
            }
        ]
    },

    {
        id: 12,
        name: "系带",
        desc: "全体技能伤害+20%；每次攻击20%概率获得1层【狂暴】（+5%伤害，10秒，最多10层）",
        iconFrameName: "equip_99_7",
        equipLevel: 2,
        unlockBy: 2, // 由挂件解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.2,
                targetClass: ClassType.ALL,
                description: "全体攻击力+20%，狂暴叠加" 
            }
        ]
    },


    {
        id: 13,
        name: "大剑",
        desc: "全体技能伤害+20%；暴击时造成额外伤害，并使对面眩晕0.2秒",
        iconFrameName: "equip_99_4",
        equipLevel: 2,
        unlockBy: 3, 
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.2,
                targetClass: ClassType.ALL,
                description: "全体攻击力+20%，暴击附加眩晕" 
            }
        ]
    },
    {
        id: 14,
        name: "面罩",
        desc: "全体技能伤害+20%；攻击时额外释放能量冲击，对目标造成一次范围伤害，冷却5秒",
        iconFrameName: "equip_99_1",
        equipLevel: 2,
        unlockBy: 4, // 由力量手套解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.2,
                targetClass: ClassType.ALL,
                description: "全体攻击力+20%，攻击释放能量冲击" 
            }
        ]
    },
    
    {
        id: 15,
        name: "短棍",
        desc: "全体技能伤害+20%；攻击有20%几率产生可弹射的闪电链",
        iconFrameName: "equip_99_6",
        equipLevel: 2,
        unlockBy: 5, 
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.2,
                targetClass: ClassType.ALL,
                description: "全体攻击力+20%，20%几率释放闪电链" 
            }
        ]
    },

    // 3级装备 - 传说装备
    {
        id: 16,
        name: "魂戒",
        desc: "全体技能伤害+40%；每层【蓄力】额外+2%伤害",
        iconFrameName: "equip_99_8",
        equipLevel: 3,
        unlockBy: 11, // 由圣殿戒解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.4,
                targetClass: ClassType.ALL,
                description: "全体攻击力+40%，蓄力效果增强" 
            }
        ]
    },
	
	// 3级装备 - 传说装备
    {
        id: 17,
        name: "强袭",
        desc: "坦克-技能伤害+100%;坦克-战斗中每升五级，坦克技能伤害+40%",
        iconFrameName: "equip_0_3",
        equipLevel: 3,
        unlockBy: 6, // 由锁子甲解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 1,
                targetClass: ClassType.TANK,
                description: "坦克攻击力提升100%，每升5级额外+40%" 
            }
        ]
    },
	
	{
        id: 18,
        name: "卫士靴",
        desc: "牧师-技能伤害+100%；牧师-战斗中每升五级，牧师技能伤害+40%",
        iconFrameName: "equip_1_2",
        equipLevel: 3,
        unlockBy: 7, // 由生命挂件解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 1,
                targetClass: ClassType.PRIEST,
                description: "牧师攻击力提升100%，每升5级额外+40%" 
            }
        ]
    },
	
	{
        id: 19,
        name: "群星之怒",
        desc: "猎人-技能伤害+150%；猎人-战斗中每升五级，猎人技能伤害+40%",
        iconFrameName: "equip_2_3",
        equipLevel: 3,
        unlockBy: 7, // 由生命挂件解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 1.5,
                targetClass: ClassType.HUNTER,
                description: "猎人攻击力提升150%，每升5级额外+40%" 
            }
        ]
    },
	
	{
        id: 20,
        name: "紫苑",
        desc: "法师-技能伤害+100%；法师-战斗中每升五级，法师技能伤害+40%",
        iconFrameName: "equip_3_3",
        equipLevel: 3,
        unlockBy: 10, // 由大棒解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 1,
                targetClass: ClassType.MAGE,
                description: "法师攻击力提升100%，每升5级额外+40%" 
            }
        ]
    },
	
	{
        id: 21,
        name: "金箍棒",
        desc: "全体技能伤害+50%;15%的概率触发【重击】  【重击：造成150%伤害】",
        iconFrameName: "equip_99_9",
        equipLevel: 3,
        unlockBy: 13, // 由大剑解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.5,
                targetClass: ClassType.ALL,
                description: "全体攻击力+50%，15%概率触发重击" 
            }
        ]
    },
	
	{
        id: 22,
        name: "西瓦",
        desc: "全体技能伤害+50%;每10秒获得【护盾】 （护盾：15%最大生命值，持续15秒）",
        iconFrameName: "equip_99_10",
        equipLevel: 3,
        unlockBy: 7, // 由生命挂件解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.5,
                targetClass: ClassType.ALL,
                description: "全体攻击力+50%，护盾机制" 
            }
        ]
    },
	
	{
        id: 23,
        name: "血精石",
        desc: "全体技能伤害+50%;每拥有1%的最大生命值护盾提供3%的增伤",
        iconFrameName: "equip_99_11",
        equipLevel: 3,
        unlockBy: 7, // 由生命挂件解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.5,
                targetClass: ClassType.ALL,
                description: "全体攻击力+50%，护盾增伤机制" 
            }
        ]
    },
	
	{
        id: 24,
        name: "灵龛",
        desc: "全体技能伤害+50%;每秒恢复0.2%的已损失生命",
        iconFrameName: "equip_99_12",
        equipLevel: 3,
        unlockBy: 7, // 由生命挂件解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.5,
                targetClass: ClassType.ALL,
                description: "全体攻击力+50%，恢复机制" 
            }
        ]
    },
	
	{
        id: 25,
        name: "龙芯",
        desc: "全体技能伤害+50%;全体击杀怪物10%概率收割一层灵魂，每层是全体技能伤害+1%，最多60层",
        iconFrameName: "equip_99_13",
        equipLevel: 3,
        unlockBy: 14, // 由面罩解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.5,
                targetClass: ClassType.ALL,
                description: "全体攻击力+50%，收割灵魂叠加" 
            }
        ]
    },
	
	{
        id: 26,
        name: "辉耀",
        desc: "全体技能伤害+50%;【重击】伤害增加+90%",
        iconFrameName: "equip_99_14",
        equipLevel: 3,
        unlockBy: 13, // 由大剑解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.5,
                targetClass: ClassType.ALL,
                description: "全体攻击力+50%，重击效果增强" 
            }
        ]
    },
	
	{
        id: 27,
        name: "蛋刀",
        desc: "刺客-技能伤害+150%；刺客-战斗中每升五级，刺客技能伤害+40%",
        iconFrameName: "equip_4_2",
        equipLevel: 3,
        unlockBy: 9, // 由毒球解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 1.5,
                targetClass: ClassType.ASSASSIN,
                description: "刺客攻击力提升150%，每升5级额外+40%" 
            }
        ]
    },
	
	{
        id: 28,
        name: "霜之哀伤",
        desc: "全体技能伤害+75%;全体击杀怪物10%概率收割一层灵魂，每层是全体技能伤害+1%，最多100层",
        iconFrameName: "equip_99_15",
        equipLevel: 3,
        unlockBy: 14, // 由面罩解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.75,
                targetClass: ClassType.ALL,
                description: "全体攻击力+75%，收割灵魂叠加" 
            }
        ]
    },
	
	{
        id: 29,
        name: "古尔丹之颅",
        desc: "全体技能伤害+75%；全体攻击时额外释放能量冲击，对目标额外造成一次范围伤害，冷却2秒",
        iconFrameName: "equip_99_16",
        equipLevel: 3,
        unlockBy: 14, // 由面罩解锁
        skillEffects: [
            { 
                type: SkillEffectType.ATTACK, 
                value: 0.75,
                targetClass: ClassType.ALL,
                description: "全体攻击力+75%，攻击释放能量冲击" 
            }
        ]
    },
	
	{
		id: 30,
		name: "水晶锤",
		desc: "全体技能伤害+75%;30%的概率触发【重击】  【重击：造成150%伤害】",
		iconFrameName: "equip_99_17",
		equipLevel: 3,
		unlockBy: 13, // 由大剑解锁
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.75,
				targetClass: ClassType.ALL,
				description: "全体攻击力+75%，30%概率触发重击" 
			}
		]
	},
	{
		id: 31,
		name: "先锋盾",
		desc: "坦克-技能伤害+84%;坦克-战斗中每升5级，坦克技能伤害+20%，减伤+10%",
		iconFrameName: "equip_0_4",
		equipLevel: 3,
		unlockBy: 17,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.84,
				targetClass: ClassType.TANK,
				description: "坦克攻击力提升84%，每升5级额外+20%，减伤+10%" 
			}
		]
	},
	{
		id: 32,
		name: "锁子甲",
		desc: "坦克-技能伤害+56%;坦克-战斗中每升5级，坦克技能伤害+10%",
		iconFrameName: "equip_0_5",
		equipLevel: 3,
		unlockBy: 17,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.56,
				targetClass: ClassType.TANK,
				description: "坦克攻击力提升56%，每升5级额外+10%" 
			}
		]
	},
	{
		id: 33,
		name: "力量手套",
		desc: "坦克-技能伤害+52%",
		iconFrameName: "equip_0_6",
		equipLevel: 3,
		unlockBy: 17,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.52,
				targetClass: ClassType.TANK,
				description: "坦克攻击力提升52%" 
			}
		]
	},
	{
		id: 34,
		name: "梅肯",
		desc: "牧师-技能伤害+84%;牧师-战斗中每升5级，牧师技能伤害+20%，治疗+10%",
		iconFrameName: "equip_1_3",
		equipLevel: 3,
		unlockBy: 18,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.84,
				targetClass: ClassType.PRIEST,
				description: "牧师攻击力提升84%，每升5级额外+20%，治疗+10%" 
			}
		]
	},
	{
		id: 35,
		name: "回复头巾",
		desc: "牧师-技能伤害+56%;牧师-战斗中每升5级，牧师技能伤害+10%",
		iconFrameName: "equip_1_4",
		equipLevel: 3,
		unlockBy: 18,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.56,
				targetClass: ClassType.PRIEST,
				description: "牧师攻击力提升56%，每升5级额外+10%" 
			}
		]
	},
	{
		id: 36,
		name: "树枝",
		desc: "牧师-技能伤害+48%",
		iconFrameName: "equip_1_5",
		equipLevel: 3,
		unlockBy: 18,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.48,
				targetClass: ClassType.PRIEST,
				description: "牧师攻击力提升48%" 
			}
		]
	},
	{
		id: 37,
		name: "鹰角弓",
		desc: "猎人-技能伤害+72%;猎人-战斗中每升5级，猎人技能伤害+20%，攻速+10%",
		iconFrameName: "equip_2_4",
		equipLevel: 3,
		unlockBy: 19,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.72,
				targetClass: ClassType.HUNTER,
				description: "猎人攻击力提升72%，每升5级额外+20%，攻速+10%" 
			}
		]
	},
	{
		id: 38,
		name: "标枪",
		desc: "猎人-技能伤害+56%;猎人-战斗中每升5级，猎人技能伤害+10%",
		iconFrameName: "equip_2_5",
		equipLevel: 3,
		unlockBy: 19,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.56,
				targetClass: ClassType.HUNTER,
				description: "猎人攻击力提升56%，每升5级额外+10%" 
			}
		]
	},
	{
		id: 39,
		name: "敏捷便鞋",
		desc: "猎人-技能伤害+48%",
		iconFrameName: "equip_2_6",
		equipLevel: 3,
		unlockBy: 19,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.48,
				targetClass: ClassType.HUNTER,
				description: "猎人攻击力提升48%" 
			}
		]
	},
	{
		id: 40,
		name: "神秘法杖",
		desc: "法师-技能伤害+72%;法师-战斗中每升5级，法师技能伤害+20%",
		iconFrameName: "equip_3_4",
		equipLevel: 3,
		unlockBy: 20,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.72,
				targetClass: ClassType.MAGE,
				description: "法师攻击力提升72%，每升5级额外+20%" 
			}
		]
	},
	{
		id: 41,
		name: "大棒",
		desc: "法师-技能伤害+56%;法师-战斗中每升5级，法师技能伤害+10%",
		iconFrameName: "equip_3_5",
		equipLevel: 3,
		unlockBy: 20,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.56,
				targetClass: ClassType.MAGE,
				description: "法师攻击力提升56%，每升5级额外+10%" 
			}
		]
	},
	{
		id: 42,
		name: "智力斗篷",
		desc: "法师-技能伤害+52%",
		iconFrameName: "equip_3_6",
		equipLevel: 3,
		unlockBy: 20,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.52,
				targetClass: ClassType.MAGE,
				description: "法师攻击力提升52%" 
			}
		]
	},
	{
		id: 43,
		name: "大炮",
		desc: "刺客-技能伤害+100%;刺客-战斗中每升5级，刺客技能伤害+40%，暴击率+10%",
		iconFrameName: "equip_4_3",
		equipLevel: 3,
		unlockBy: 27,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 1.0,
				targetClass: ClassType.ASSASSIN,
				description: "刺客攻击力提升100%，每升5级额外+40%，暴击率+10%" 
			}
		]
	},
	{
		id: 44,
		name: "水晶剑",
		desc: "刺客-技能伤害+84%;刺客-战斗中每升5级，刺客技能伤害+20%，暴击率+10%",
		iconFrameName: "equip_4_4",
		equipLevel: 3,
		unlockBy: 27,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.84,
				targetClass: ClassType.ASSASSIN,
				description: "刺客攻击力提升84%，每升5级额外+20%，暴击率+10%" 
			}
		]
	},
	{
		id: 45,
		name: "秘银锤",
		desc: "刺客-技能伤害+56%;刺客-战斗中每升5级，刺客技能伤害+10%",
		iconFrameName: "equip_4_5",
		equipLevel: 3,
		unlockBy: 27,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.56,
				targetClass: ClassType.ASSASSIN,
				description: "刺客攻击力提升56%，每升5级额外+10%" 
			}
		]
	},
	{
		id: 46,
		name: "攻击之爪",
		desc: "刺客-技能伤害+52%",
		iconFrameName: "equip_4_6",
		equipLevel: 3,
		unlockBy: 27,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.52,
				targetClass: ClassType.ASSASSIN,
				description: "刺客攻击力提升52%" 
			}
		]
	},
	{
		id: 47,
		name: "分身",
		desc: "全技能伤害+60%;每层【狂暴】额外+3%攻速",
		iconFrameName: "equip_99_18",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.6,
				targetClass: ClassType.ALL,
				description: "全技能伤害+60%，每层狂暴+3%攻速" 
			}
		]
	},
	{
		id: 48,
		name: "深渊",
		desc: "全体技能伤害+60%;全体暴击时造成额外伤害并使目标眩晕0.4秒",
		iconFrameName: "equip_99_19",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.6,
				targetClass: ClassType.ALL,
				description: "全技能伤害+60%，暴击眩晕" 
			}
		]
	},
	{
		id: 49,
		name: "对剑",
		desc: "全体技能伤害+70%;每次攻击60%概率获得1层【狂暴】（狂暴:每层+5%）",
		iconFrameName: "equip_99_20",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.7,
				targetClass: ClassType.ALL,
				description: "全技能伤害+70%，攻击获狂暴" 
			}
		]
	},
	{
		id: 50,
		name: "冰眼",
		desc: "全体技能伤害+60%;攻击时有60%概率施加1层【诅咒】",
		iconFrameName: "equip_99_21",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.6,
				targetClass: ClassType.ALL,
				description: "全技能伤害+60%，攻击施加诅咒" 
			}
		]
	},
	{
		id: 51,
		name: "夜叉",
		desc: "全体技能伤害+36%;每层【狂暴】额外+2%攻速",
		iconFrameName: "equip_99_22",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.36,
				targetClass: ClassType.ALL,
				description: "全技能伤害+36%，狂暴加攻速" 
			}
		]
	},
	{
		id: 52,
		name: "精气球",
		desc: "全体技能伤害+36%;每层【著力】额外+4%伤害",
		iconFrameName: "equip_99_23",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.36,
				targetClass: ClassType.ALL,
				description: "全技能伤害+36%，著力加伤害" 
			}
		]
	},
	{
		id: 53,
		name: "小电锤",
		desc: "全体技能伤害+36%;全体攻击时有40%几率产生可弹射2次的闪电链",
		iconFrameName: "equip_99_24",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.36,
				targetClass: ClassType.ALL,
				description: "全技能伤害+36%，闪电链" 
			}
		]
	},
	{
		id: 54,
		name: "勋章",
		desc: "全体技能伤害+36%;攻击时有40%概率施加1层【诅咒】",
		iconFrameName: "equip_99_25",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.36,
				targetClass: ClassType.ALL,
				description: "全技能伤害+36%，攻击施加诅咒" 
			}
		]
	},
	{
		id: 55,
		name: "绿杖",
		desc: "全体技能伤害+36%;每有1层其他持续伤害效果【诅咒】造成的伤害提高",
		iconFrameName: "equip_99_26",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.36,
				targetClass: ClassType.ALL,
				description: "全技能伤害+36%，诅咒增伤" 
			}
		]
	},
	{
		id: 56,
		name: "红杖",
		desc: "全体技能伤害+36%;全体攻击时额外释放能量冲击，对目标额外造成1次范围伤害",
		iconFrameName: "equip_99_27",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.36,
				targetClass: ClassType.ALL,
				description: "全技能伤害+36%，能量冲击" 
			}
		]
	},
	{
		id: 57,
		name: "镇魂石",
		desc: "全体技能伤害+36%;每拥有1%最大生命值护盾提供2%增伤",
		iconFrameName: "equip_99_28",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.36,
				targetClass: ClassType.ALL,
				description: "全技能伤害+36%，护盾增伤" 
			}
		]
	},
	{
		id: 58,
		name: "天鹰戒",
		desc: "生命+2.8%;全体技能伤害+36%;攻击后每3秒获得1层【蓄力】",
		iconFrameName: "equip_99_29",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.36,
				targetClass: ClassType.ALL,
				description: "全技能伤害+36%，蓄力" 
			},
			{ 
				type: SkillEffectType.MAXHP, 
				value: 0.028,
				targetClass: ClassType.ALL,
				description: "生命+2.8%" 
			}
		]
	},
	{
		id: 59,
		name: "玄冥盾牌",
		desc: "全体技能伤害+36%;每15秒获得【护盾】(护盾:15%最大生命值，持续5秒)",
		iconFrameName: "equip_99_30",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.36,
				targetClass: ClassType.ALL,
				description: "全技能伤害+36%，获得护盾" 
			}
		]
	},
	{
		id: 60,
		name: "大魔棒",
		desc: "全体技能伤害+36%;每秒回复0.15%已损失血量;造成持续伤害+1.4%",
		iconFrameName: "equip_99_31",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.36,
				targetClass: ClassType.ALL,
				description: "全技能伤害+36%，回血，持续伤害增加" 
			}
		]
	},
	{
		id: 61,
		name: "碎骨锤",
		desc: "全体技能伤害+42%;全体暴击时造成额外伤害并使目标眩晕0.3秒",
		iconFrameName: "equip_99_32",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.42,
				targetClass: ClassType.ALL,
				description: "全技能伤害+42%，暴击眩晕" 
			}
		]
	},
	{
		id: 62,
		name: "掠夺者",
		desc: "全体技能伤害+36%;全体击杀怪物10%概率收割1层灵魂，每层使全体技能伤害+1%",
		iconFrameName: "equip_99_33",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.36,
				targetClass: ClassType.ALL,
				description: "全技能伤害+36%，收割灵魂" 
			}
		]
	},
	{
		id: 63,
		name: "散华",
		desc: "全体技能伤害+36%;每次攻击40%概率获得1层【狂暴】（狂暴:每层+5%）",
		iconFrameName: "equip_99_34",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.36,
				targetClass: ClassType.ALL,
				description: "全技能伤害+36%，攻击获狂暴" 
			}
		]
	},
	{
		id: 64,
		name: "恶魔刀锋",
		desc: "全体技能伤害+36%;10%概率触发【重击】（重击:造成150%伤害）",
		iconFrameName: "equip_99_35",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.36,
				targetClass: ClassType.ALL,
				description: "全技能伤害+36%，重击" 
			}
		]
	},
	{
		id: 65,
		name: "圣者遗物",
		desc: "全体技能伤害+36%;【重击】伤害增加60%",
		iconFrameName: "equip_99_36",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.36,
				targetClass: ClassType.ALL,
				description: "全技能伤害+36%，重击增强" 
			}
		]
	},
	{
		id: 66,
		name: "毒球",
		desc: "全体技能伤害+32%;攻击时有20%概率施加1层【诅咒】",
		iconFrameName: "equip_99_37",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.32,
				targetClass: ClassType.ALL,
				description: "全技能伤害+32%，攻击施加诅咒" 
			}
		]
	},
	{
		id: 67,
		name: "挂件",
		desc: "全体技能伤害+28%;每有1层其他持续伤害效果，伤害提高",
		iconFrameName: "equip_99_38",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.28,
				targetClass: ClassType.ALL,
				description: "全技能伤害+28%，持续伤害增伤" 
			}
		]
	},
	{
		id: 68,
		name: "大剑",
		desc: "全体技能伤害+28%;全体暴击时造成额外伤害并使目标眩晕0.2秒",
		iconFrameName: "equip_99_39",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.28,
				targetClass: ClassType.ALL,
				description: "全技能伤害+28%，暴击眩晕" 
			}
		]
	},
	{
		id: 69,
		name: "面罩",
		desc: "全体技能伤害+32%;全体攻击时额外释放能量冲击，对目标额外造成1次范围伤害",
		iconFrameName: "equip_99_40",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.32,
				targetClass: ClassType.ALL,
				description: "全技能伤害+32%，能量冲击" 
			}
		]
	},
	{
		id: 70,
		name: "圣殿戒",
		desc: "全体技能伤害+28%;攻击后每4秒获得1层【著力】（著力:每层+5%伤害）",
		iconFrameName: "equip_99_41",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.28,
				targetClass: ClassType.ALL,
				description: "全技能伤害+28%，著力" 
			}
		]
	},
	{
		id: 71,
		name: "短棍",
		desc: "全体技能伤害+24%;全体攻击时有20%几率产生可弹射1次的闪电链",
		iconFrameName: "equip_99_42",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.24,
				targetClass: ClassType.ALL,
				description: "全技能伤害+24%，闪电链" 
			}
		]
	},
	{
		id: 72,
		name: "系带",
		desc: "全体技能伤害+28%;每次攻击20%概率获得1层【狂暴】（狂暴:每层+5%伤害）",
		iconFrameName: "equip_99_43",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.28,
				targetClass: ClassType.ALL,
				description: "全技能伤害+28%，攻击获狂暴" 
			}
		]
	},
	{
		id: 73,
		name: "魂戒",
		desc: "全体技能伤害+28%;每层【著力】额外+2%伤害",
		iconFrameName: "equip_99_44",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.28,
				targetClass: ClassType.ALL,
				description: "全技能伤害+28%，著力增强" 
			}
		]
	},
	{
		id: 74,
		name: "穷鬼盾",
		desc: "全体技能伤害+28%;每20秒获得【护盾】（护盾:15%最大生命值的护盾）",
		iconFrameName: "equip_99_45",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.28,
				targetClass: ClassType.ALL,
				description: "全技能伤害+28%，获得护盾" 
			}
		]
	},
	{
		id: 75,
		name: "坚韧球",
		desc: "全体技能伤害+24%;每拥有1%最大生命值护盾提供1%增伤",
		iconFrameName: "equip_99_46",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.24,
				targetClass: ClassType.ALL,
				description: "全技能伤害+24%，护盾增伤" 
			}
		]
	},
	{
		id: 76,
		name: "腰带",
		desc: "全体技能伤害+28%;【重击】伤害增加30%",
		iconFrameName: "equip_99_47",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.28,
				targetClass: ClassType.ALL,
				description: "全技能伤害+28%，重击增强" 
			}
		]
	},
	{
		id: 77,
		name: "小魔棒",
		desc: "全体技能伤害+28%;每秒回复0.1%已损失血量",
		iconFrameName: "equip_99_48",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.28,
				targetClass: ClassType.ALL,
				description: "全技能伤害+28%，回血" 
			}
		]
	},
	{
		id: 78,
		name: "护腕",
		desc: "全体技能伤害+24%;5%概率触发【重击】（重击:造成150%伤害）",
		iconFrameName: "equip_99_49",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.24,
				targetClass: ClassType.ALL,
				description: "全技能伤害+24%，重击" 
			}
		]
	},
	{
		id: 79,
		name: "食人魔之斧",
		desc: "全体技能伤害+28%;全体击杀怪物10%概率收割1层灵魂，每层使全体技能伤害+1%",
		iconFrameName: "equip_99_50",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.28,
				targetClass: ClassType.ALL,
				description: "全技能伤害+28%，收割灵魂" 
			}
		]
	},
	{
		id: 80,
		name: "手套",
		desc: "全体技能伤害+28%;每层【狂暴】额外+1%攻速",
		iconFrameName: "equip_99_51",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.28,
				targetClass: ClassType.ALL,
				description: "全技能伤害+28%，狂暴加攻速" 
			}
		]
	},
	{
		id: 81,
		name: "艾露恩之赐",
		desc: "全体技能伤害+100%;攻击后每1秒获得1层【著力】（著力:每层+5%伤害）",
		iconFrameName: "equip_99_52",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 1.0,
				targetClass: ClassType.ALL,
				description: "全技能伤害+100%，著力" 
			}
		]
	},
	{
		id: 82,
		name: "真理守护者",
		desc: "全体技能伤害+100%;每5秒获得【护盾】（护盾15%最大生命值，持续5秒）",
		iconFrameName: "equip_99_53",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 1.0,
				targetClass: ClassType.ALL,
				description: "全技能伤害+100%，获得护盾" 
			}
		]
	},
	{
		id: 83,
		name: "纳鲁道标",
		desc: "全体技能伤害+100%;每秒回复0.5%已损失血量;每次获得治疗时，攻击力+2%",
		iconFrameName: "equip_99_54",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 1.0,
				targetClass: ClassType.ALL,
				description: "全技能伤害+100%，回血，治疗加攻" 
			}
		]
	},
	{
		id: 84,
		name: "烈焰之击",
		desc: "全体技能伤害+100%;全体攻击时额外释放能量冲击，对目标额外造成1次范围伤害",
		iconFrameName: "equip_99_55",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 1.0,
				targetClass: ClassType.ALL,
				description: "全技能伤害+100%，能量冲击" 
			}
		]
	},
	{
		id: 85,
		name: "毁灭之锤",
		desc: "全体技能伤害+100%;30%概率触发【重击】（重击:造成150%伤害）",
		iconFrameName: "equip_99_56",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 1.0,
				targetClass: ClassType.ALL,
				description: "全技能伤害+100%，重击" 
			}
		]
	},
	{
		id: 86,
		name: "香噬者之牙",
		desc: "全体技能伤害+100%;全体暴击时造成额外伤害并使目标眩晕0.5秒;全体造成暴击伤害+50%",
		iconFrameName: "equip_99_57",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 1.0,
				targetClass: ClassType.ALL,
				description: "全技能伤害+100%，暴击眩晕" 
			},
			{ 
				type: SkillEffectType.CRIT_DAMAGE, 
				value: 0.5,
				targetClass: ClassType.ALL,
				description: "暴击伤害+50%" 
			}
		]
	},
	{
		id: 87,
		name: "乌萨勒斯",
		desc: "全体技能伤害+100%;攻击时必定施加1层诅咒",
		iconFrameName: "equip_99_58",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 1.0,
				targetClass: ClassType.ALL,
				description: "全技能伤害+100%，必定诅咒" 
			}
		]
	},
	{
		id: 88,
		name: "泰坦之击",
		desc: "全体技能伤害+100%;全体攻击时必定产生可弹射5次的闪电伤害",
		iconFrameName: "equip_99_59",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 1.0,
				targetClass: ClassType.ALL,
				description: "全技能伤害+100%，必定闪电链" 
			}
		]
	},
	{
		id: 89,
		name: "诅咒坠饰",
		desc: "全体技能伤害+75%;攻击时必定施加1层【诅咒】",
		iconFrameName: "equip_99_60",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.75,
				targetClass: ClassType.ALL,
				description: "全技能伤害+75%，必定诅咒" 
			}
		]
	},
	{
		id: 90,
		name: "金盾",
		desc: "全体技能伤害+75%;每5秒获得【护盾】（护盾15%最大生命值，持续5秒）",
		iconFrameName: "equip_99_61",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.75,
				targetClass: ClassType.ALL,
				description: "全技能伤害+75%，获得护盾" 
			}
		]
	},
	{
		id: 91,
		name: "龙鳞",
		desc: "全体技能伤害+75%;每秒回复0.3%已损失血量",
		iconFrameName: "equip_99_62",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.75,
				targetClass: ClassType.ALL,
				description: "全技能伤害+75%，回血" 
			}
		]
	},
	{
		id: 92,
		name: "月之祝福",
		desc: "全体技能伤害+75%;攻击后每1秒获得1层【著力】（著力:每层+5%伤害）",
		iconFrameName: "equip_99_63",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.75,
				targetClass: ClassType.ALL,
				description: "全技能伤害+75%，著力" 
			}
		]
	},
	{
		id: 93,
		name: "裂魂",
		desc: "全体技能伤害+75%;每次攻击必定获得1层【狂暴】（狂暴:每层+5%伤害）",
		iconFrameName: "equip_99_64",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 0.75,
				targetClass: ClassType.ALL,
				description: "全技能伤害+75%，必定狂暴" 
			}
		]
	},
	{
		id: 94,
		name: "灰烬使者",
		desc: "全体技能伤害+100%;每次攻击必定获得1层【狂暴】（狂暴:每层+5%伤害）",
		iconFrameName: "equip_99_65",
		equipLevel: 3,
		unlockBy: 30,
		skillEffects: [
			{ 
				type: SkillEffectType.ATTACK, 
				value: 1.0,
				targetClass: ClassType.ALL,
				description: "全技能伤害+100%，必定狂暴" 
			}
		]
	}
]; 
