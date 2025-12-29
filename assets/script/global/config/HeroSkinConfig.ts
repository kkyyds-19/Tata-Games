/**
 * 英雄皮肤配置接口
 */
// export interface HeroSkinConfig {
//     id: number;                          // 唯一ID
//     heroId: number;                      // 所属英雄ID
//     heroName: string;                    // 所属英雄名称（用于展示）
//     name: string;                        // 皮肤名称
//     rarity: HeroSkinRarity;             // 皮肤稀有度（数字枚举，见下）
//     iconFrameName: string;              // 图标框名称（用于 UI 展示）
//     spinePath: string;                  // Spine资源路径
//     spineSkinName: string;              // Spine皮肤名称
//     classType: ClassType;               // 职业类型（数字枚举，见下）
  
//     baseEffects: SkillEffect[];         // 默认加成效果（基础效果）
//     starEffects: Record<number, SkillEffect[]>; // 星级效果，每颗星可有多条效果，键是星级 1~5
//   }

  export interface HeroSkinConfig {
    id: number;                         // 皮肤唯一ID
    heroId: number;                     // 所属英雄ID
    heroName: string;                   // 所属英雄名称
    name: string;                       // 皮肤名称
    rarity: number;                     // 稀有度（0~5）
    iconFrameName: string;              // 图标名称
    spinePath: string;                  // Spine路径
    spineSkinName: string;              // Spine皮肤名
    classType: ClassType;              // 所属职业类型
    price: number;                 // 所需兑换货币数量
    baseEffects: {                     // 初始效果
        type: SkillEffectType;
        value: number;
        description: string;
    }[];
    starEffects: {                     // 星级效果
        [star: number]: {
            type: SkillEffectType;
            value: number;
            description: string;
        }[];
    };
}
  
  /**
   * 技能加成效果结构
   */
  export interface SkillEffect {
    type: SkillEffectType;              // 效果类型（如攻击、生命等）
    value: number;                      // 效果数值（具体值或百分比）
    description: string;                // 效果描述（用于展示）
  }
  
  /**
   * 效果类型枚举
   */
  export enum SkillEffectType {
    ATTACK = "attack",                  // 攻击力增加（固定数值）
    MAXHP = "maxhp",                    // 最大生命值增加（固定数值）
    DEFENSE = "defense",                // 防御力增加（固定数值）
    DAMAGE_REDUCTION = "damageReduction", // 受到伤害减少（百分比）
    SKILL_COOLDOWN = "skill_cooldown", // 技能冷却时间缩短（百分比）
    CRIT_RATE = "crit_rate",           // 暴击率增加（百分比）
    CRIT_DAMAGE = "crit_damage"        // 暴击伤害增加（百分比）
  }
  
  /**
   * 职业类型枚举（与角色系统统一）
   */
  export enum ClassType {
    TANK = 0,       // 坦克
    PRIEST = 1,     // 牧师
    HUNTER = 2,     // 猎人
    MAGE = 3,       // 法师
    ASSASSIN = 4,   // 刺客
    ALL = 99        // 全职业通用
  }
  
  /**
   * 皮肤稀有度枚举
   */
  export enum HeroSkinRarity {
    NORMAL = 0,     // 普通（灰）
    FINE = 1,       // 精良（绿）
    RARE = 2,       // 稀有（蓝）
    EPIC = 3,       // 史诗（紫）
    LEGENDARY = 4,  // 传说（橙）
    MYTHICAL = 5    // 神话（红）
  }
  

  export const heroSkinConfigs: HeroSkinConfig[] = [
    {
        id: 30002,
        heroId: 20002,
        heroName: "熔岩领主",
        name: "熔岩领主·狂怒",
        rarity: 2,
        iconFrameName: "b_0_0_2",
        spinePath: "spine/boss/b_0_0_2",
        spineSkinName: "b_0_0_2",
        classType: 0,
        price: 100,
        baseEffects: [
        {
            "type": SkillEffectType.DEFENSE,
            "value": 145,
            "description": "防御力 +145"
        },
        {
            "type": SkillEffectType.ATTACK,
            "value": 112,
            "description": "攻击力 +112"
        }
    ],
        starEffects: {
        "1": [
            {
                "type": SkillEffectType.MAXHP,
                "value": 209,
                "description": "最大生命 +209（★1）"
            },
            {
                "type": SkillEffectType.MAXHP,
                "value": 238,
                "description": "最大生命 +238（★1）"
            }
        ],
        "2": [
            {
                "type": SkillEffectType.MAXHP,
                "value": 89,
                "description": "最大生命 +89（★2）"
            },
            {
                "type": SkillEffectType.ATTACK,
                "value": 289,
                "description": "攻击力 +289（★2）"
            }
        ],
        "3": [
            {
                "type": SkillEffectType.ATTACK,
                "value": 130,
                "description": "攻击力 +130（★3）"
            }
        ],
        "4": [
            {
                "type": SkillEffectType.SKILL_COOLDOWN,
                "value": 0.13,
                "description": "技能冷却 +13%（★4）"
            }
        ],
        "5": [
            {
                "type": SkillEffectType.CRIT_DAMAGE,
                "value": 0.14,
                "description": "暴击伤害 +14%（★5）"
            },
            {
                "type": SkillEffectType.CRIT_DAMAGE,
                "value": 0.18,
                "description": "暴击伤害 +18%（★5）"
            }
        ]
    }
    },
    {
        id: 30003,
        heroId: 20003,
        heroName: "夜鬼双斧王",
        name: "夜鬼双斧王·狂怒",
        rarity: 1,
        iconFrameName: "b_0_0_3",
        spinePath: "spine/boss/b_0_0_3",
        spineSkinName: "b_0_0_3",
        classType: 2,
        price: 100,
        baseEffects: [
        {
            "type": SkillEffectType.CRIT_RATE,
            "value": 0.06,
            "description": "暴击率 +6%"
        },
        {
            "type": SkillEffectType.DEFENSE,
            "value": 86,
            "description": "防御力 +86"
        }
    ],
        starEffects: {
        "1": [
            {
                "type": SkillEffectType.CRIT_DAMAGE,
                "value": 0.2,
                "description": "暴击伤害 +20%（★1）"
            },
            {
                "type": SkillEffectType.CRIT_DAMAGE,
                "value": 0.17,
                "description": "暴击伤害 +17%（★1）"
            }
        ],
        "2": [
            {
                "type": SkillEffectType.CRIT_DAMAGE,
                "value": 0.15,
                "description": "暴击伤害 +15%（★2）"
            }
        ],
        "3": [
            {
                "type": SkillEffectType.CRIT_RATE,
                "value": 0.07,
                "description": "暴击率 +7%（★3）"
            },
            {
                "type": SkillEffectType.DEFENSE,
                "value": 278,
                "description": "防御力 +278（★3）"
            }
        ],
        "4": [
            {
                "type": SkillEffectType.MAXHP,
                "value": 221,
                "description": "最大生命 +221（★4）"
            },
            {
                "type": SkillEffectType.DAMAGE_REDUCTION,
                "value": 0.1,
                "description": "伤害减免 +10%（★4）"
            }
        ],
        "5": [
            {
                "type": SkillEffectType.ATTACK,
                "value": 107,
                "description": "攻击力 +107（★5）"
            },
            {
                "type": SkillEffectType.ATTACK,
                "value": 164,
                "description": "攻击力 +164（★5）"
            }
        ]
    }
    },
    {
        id: 30004,
        heroId: 20004,
        heroName: "娜迦领主",
        name: "娜迦领主·狂怒",
        rarity: 4,
        iconFrameName: "b_0_0_4",
        spinePath: "spine/boss/b_0_0_4",
        spineSkinName: "b_0_0_4",
        classType: 0,
        price: 100,
        baseEffects: [
        {
            "type": SkillEffectType.DEFENSE,
            "value": 264,
            "description": "防御力 +264"
        },
        {
            "type": SkillEffectType.DAMAGE_REDUCTION,
            "value": 0.2,
            "description": "伤害减免 +20%"
        }
    ],
        starEffects: {
        "1": [
            {
                "type": SkillEffectType.MAXHP,
                "value": 98,
                "description": "最大生命 +98（★1）"
            }
        ],
        "2": [
            {
                "type": SkillEffectType.DAMAGE_REDUCTION,
                "value": 0.14,
                "description": "伤害减免 +14%（★2）"
            },
            {
                "type": SkillEffectType.DAMAGE_REDUCTION,
                "value": 0.16,
                "description": "伤害减免 +16%（★2）"
            }
        ],
        "3": [
            {
                "type": SkillEffectType.SKILL_COOLDOWN,
                "value": 0.19,
                "description": "技能冷却 +19%（★3）"
            }
        ],
        "4": [
            {
                "type": SkillEffectType.DAMAGE_REDUCTION,
                "value": 0.12,
                "description": "伤害减免 +12%（★4）"
            }
        ],
        "5": [
            {
                "type": SkillEffectType.MAXHP,
                "value": 176,
                "description": "最大生命 +176（★5）"
            }
        ]
    }
    },
    {
        id: 30005,
        heroId: 20005,
        heroName: "雷皇圣者",
        name: "雷皇圣者·狂怒",
        rarity: 3,
        iconFrameName: "b_1_0_1",
        spinePath: "spine/boss/b_1_0_1",
        spineSkinName: "b_1_0_1",
        classType: 4,
        price: 100,
        baseEffects: [
        {
            "type": SkillEffectType.CRIT_RATE,
            "value": 0.09,
            "description": "暴击率 +9%"
        },
        {
            "type": SkillEffectType.CRIT_DAMAGE,
            "value": 0.09,
            "description": "暴击伤害 +9%"
        }
    ],
        starEffects: {
        "1": [
            {
                "type": SkillEffectType.CRIT_RATE,
                "value": 0.12,
                "description": "暴击率 +12%（★1）"
            }
        ],
        "2": [
            {
                "type": SkillEffectType.ATTACK,
                "value": 158,
                "description": "攻击力 +158（★2）"
            },
            {
                "type": SkillEffectType.MAXHP,
                "value": 164,
                "description": "最大生命 +164（★2）"
            }
        ],
        "3": [
            {
                "type": SkillEffectType.CRIT_DAMAGE,
                "value": 0.14,
                "description": "暴击伤害 +14%（★3）"
            },
            {
                "type": SkillEffectType.CRIT_RATE,
                "value": 0.1,
                "description": "暴击率 +10%（★3）"
            }
        ],
        "4": [
            {
                "type": SkillEffectType.ATTACK,
                "value": 54,
                "description": "攻击力 +54（★4）"
            },
            {
                "type": SkillEffectType.DAMAGE_REDUCTION,
                "value": 0.09,
                "description": "伤害减免 +9%（★4）"
            }
        ],
        "5": [
            {
                "type": SkillEffectType.CRIT_RATE,
                "value": 0.13,
                "description": "暴击率 +13%（★5）"
            }
        ]
    }
    },
    {
        id: 30006,
        heroId: 20006,
        heroName: "青翼蝙蝠",
        name: "青翼蝙蝠·狂怒",
        rarity: 3,
        iconFrameName: "b_1_0_2",
        spinePath: "spine/boss/b_1_0_2",
        spineSkinName: "b_1_0_2",
        classType: 1,
        price: 100,
        baseEffects: [
        {
            "type": SkillEffectType.CRIT_DAMAGE,
            "value": 0.09,
            "description": "暴击伤害 +9%"
        },
        {
            "type": SkillEffectType.ATTACK,
            "value": 221,
            "description": "攻击力 +221"
        }
    ],
        starEffects: {
        "1": [
            {
                "type": SkillEffectType.MAXHP,
                "value": 149,
                "description": "最大生命 +149（★1）"
            },
            {
                "type": SkillEffectType.ATTACK,
                "value": 206,
                "description": "攻击力 +206（★1）"
            }
        ],
        "2": [
            {
                "type": SkillEffectType.CRIT_RATE,
                "value": 0.13,
                "description": "暴击率 +13%（★2）"
            },
            {
                "type": SkillEffectType.SKILL_COOLDOWN,
                "value": 0.1,
                "description": "技能冷却 +10%（★2）"
            }
        ],
        "3": [
            {
                "type": SkillEffectType.SKILL_COOLDOWN,
                "value": 0.12,
                "description": "技能冷却 +12%（★3）"
            },
            {
                "type": SkillEffectType.DEFENSE,
                "value": 253,
                "description": "防御力 +253（★3）"
            }
        ],
        "4": [
            {
                "type": SkillEffectType.CRIT_RATE,
                "value": 0.06,
                "description": "暴击率 +6%（★4）"
            },
            {
                "type": SkillEffectType.DAMAGE_REDUCTION,
                "value": 0.1,
                "description": "伤害减免 +10%（★4）"
            }
        ],
        "5": [
            {
                "type": SkillEffectType.MAXHP,
                "value": 98,
                "description": "最大生命 +98（★5）"
            },
            {
                "type": SkillEffectType.DAMAGE_REDUCTION,
                "value": 0.13,
                "description": "伤害减免 +13%（★5）"
            }
        ]
    }
    },
    {
        id: 30007,
        heroId: 20007,
        heroName: "环地掘地蝎",
        name: "环地·那家强",
        rarity: 1,
        iconFrameName: "b_1_0_3",
        spinePath: "spine/boss/b_1_0_3",
        spineSkinName: "b_1_0_3",
        classType: 4,
        price: 100,
        baseEffects: [
        {
            "type": SkillEffectType.DAMAGE_REDUCTION,
            "value": 0.1,
            "description": "伤害减免 +10%"
        },
        {
            "type": SkillEffectType.MAXHP,
            "value": 218,
            "description": "最大生命 +218"
        }
    ],
        starEffects: {
        "1": [
            {
                "type": SkillEffectType.CRIT_RATE,
                "value": 0.06,
                "description": "暴击率 +6%（★1）"
            }
        ],
        "2": [
            {
                "type": SkillEffectType.MAXHP,
                "value": 275,
                "description": "最大生命 +275（★2）"
            }
        ],
        "3": [
            {
                "type": SkillEffectType.CRIT_DAMAGE,
                "value": 0.06,
                "description": "暴击伤害 +6%（★3）"
            },
            {
                "type": SkillEffectType.DAMAGE_REDUCTION,
                "value": 0.13,
                "description": "伤害减免 +13%（★3）"
            }
        ],
        "4": [
            {
                "type": SkillEffectType.MAXHP,
                "value": 196,
                "description": "最大生命 +196（★4）"
            }
        ],
        "5": [
            {
                "type": SkillEffectType.DAMAGE_REDUCTION,
                "value": 0.15,
                "description": "伤害减免 +15%（★5）"
            },
            {
                "type": SkillEffectType.DAMAGE_REDUCTION,
                "value": 0.15,
                "description": "伤害减免 +15%（★5）"
            }
        ]
    }
    },
    {
        id: 30008,
        heroId: 20008,
        heroName: "深岩之王",
        name: "深岩之王·狂怒",
        rarity: 2,
        iconFrameName: "b_1_0_4",
        spinePath: "spine/boss/b_1_0_4",
        spineSkinName: "b_1_0_4",
        classType: 0,
        price: 100,
        baseEffects: [
        {
            "type": SkillEffectType.CRIT_DAMAGE,
            "value": 0.16,
            "description": "暴击伤害 +16%"
        },
        {
            "type": SkillEffectType.MAXHP,
            "value": 225,
            "description": "最大生命 +225"
        }
    ],
        starEffects: {
        "1": [
            {
                "type": SkillEffectType.DEFENSE,
                "value": 247,
                "description": "防御力 +247（★1）"
            },
            {
                "type": SkillEffectType.ATTACK,
                "value": 52,
                "description": "攻击力 +52（★1）"
            }
        ],
        "2": [
            {
                "type": SkillEffectType.ATTACK,
                "value": 299,
                "description": "攻击力 +299（★2）"
            }
        ],
        "3": [
            {
                "type": SkillEffectType.DEFENSE,
                "value": 294,
                "description": "防御力 +294（★3）"
            },
            {
                "type": SkillEffectType.MAXHP,
                "value": 209,
                "description": "最大生命 +209（★3）"
            }
        ],
        "4": [
            {
                "type": SkillEffectType.MAXHP,
                "value": 151,
                "description": "最大生命 +151（★4）"
            },
            {
                "type": SkillEffectType.SKILL_COOLDOWN,
                "value": 0.07,
                "description": "技能冷却 +7%（★4）"
            }
        ],
        "5": [
            {
                "type": SkillEffectType.CRIT_RATE,
                "value": 0.11,
                "description": "暴击率 +11%（★5）"
            }
        ]
    }
    },
    {
        id: 30009,
        heroId: 20009,
        heroName: "大地霸主",
        name: "大地霸主·狂怒",
        rarity: 5,
        iconFrameName: "b_1_0_5",
        spinePath: "spine/boss/b_1_0_5",
        spineSkinName: "b_1_0_5",
        classType: 1,
        price: 100,
        baseEffects: [
        {
            "type": SkillEffectType.ATTACK,
            "value": 128,
            "description": "攻击力 +128"
        },
        {
            "type": SkillEffectType.CRIT_DAMAGE,
            "value": 0.08,
            "description": "暴击伤害 +8%"
        }
    ],
        starEffects: {
        "1": [
            {
                "type": SkillEffectType.ATTACK,
                "value": 155,
                "description": "攻击力 +155（★1）"
            },
            {
                "type": SkillEffectType.CRIT_DAMAGE,
                "value": 0.09,
                "description": "暴击伤害 +9%（★1）"
            }
        ],
        "2": [
            {
                "type": SkillEffectType.MAXHP,
                "value": 202,
                "description": "最大生命 +202（★2）"
            }
        ],
        "3": [
            {
                "type": SkillEffectType.MAXHP,
                "value": 149,
                "description": "最大生命 +149（★3）"
            }
        ],
        "4": [
            {
                "type": SkillEffectType.MAXHP,
                "value": 269,
                "description": "最大生命 +269（★4）"
            }
        ],
        "5": [
            {
                "type": SkillEffectType.ATTACK,
                "value": 159,
                "description": "攻击力 +159（★5）"
            },
            {
                "type": SkillEffectType.CRIT_DAMAGE,
                "value": 0.19,
                "description": "暴击伤害 +19%（★5）"
            }
        ]
    }
    },
    
    // ================== 根据 ResourceConfig 自动生成的模拟皮肤数据 ==================
    {
        id: 30010, heroId: 1000, heroName: "巨人之岭", name: "巨人之岭·典藏",
        rarity: HeroSkinRarity.EPIC, iconFrameName: "h_0_0_0",
        spinePath: "spine/heros/h_0_0_0", spineSkinName: "h_0_0_0",
        classType: ClassType.TANK, price: 180,
        baseEffects: [ { type: SkillEffectType.MAXHP, value: 550, description: "最大生命 +550" }, { type: SkillEffectType.DEFENSE, value: 120, description: "防御力 +120" } ],
        starEffects: {
            "1": [ { type: SkillEffectType.DAMAGE_REDUCTION, value: 0.05, description: "伤害减免 +5%（★1）" } ],
            "2": [ { type: SkillEffectType.MAXHP, value: 300, description: "最大生命 +300（★2）" } ],
            "3": [ { type: SkillEffectType.DEFENSE, value: 150, description: "防御力 +150（★3）" } ],
            "4": [ { type: SkillEffectType.DAMAGE_REDUCTION, value: 0.08, description: "伤害减免 +8%（★4）" } ],
            "5": [ { type: SkillEffectType.MAXHP, value: 800, description: "最大生命 +800（★5）" } ]
        }
    },
    {
        id: 30011, heroId: 1001, heroName: "知识古树", name: "知识古树·典藏",
        rarity: HeroSkinRarity.RARE, iconFrameName: "h_1_0_0",
        spinePath: "spine/heros/h_1_0_0", spineSkinName: "h_1_0_0",
        classType: ClassType.PRIEST, price: 120,
        baseEffects: [ { type: SkillEffectType.ATTACK, value: 80, description: "攻击力 +80" } ],
        starEffects: {
            "1": [ { type: SkillEffectType.SKILL_COOLDOWN, value: 0.05, description: "技能冷却 +5%（★1）" } ],
            "2": [ { type: SkillEffectType.MAXHP, value: 250, description: "最大生命 +250（★2）" } ],
            "3": [ { type: SkillEffectType.ATTACK, value: 100, description: "攻击力 +100（★3）" } ],
            "4": [ { type: SkillEffectType.SKILL_COOLDOWN, value: 0.10, description: "技能冷却 +10%（★4）" } ],
            "5": [ { type: SkillEffectType.ATTACK, value: 200, description: "攻击力 +200（★5）" } ]
        }
    },
    {
        id: 30012, heroId: 1002, heroName: "亡灵射手", name: "亡灵射手·典藏",
        rarity: HeroSkinRarity.LEGENDARY, iconFrameName: "h_2_0_0",
        spinePath: "spine/heros/h_2_0_0", spineSkinName: "h_2_0_0",
        classType: ClassType.HUNTER, price: 250,
        baseEffects: [ { type: SkillEffectType.ATTACK, value: 150, description: "攻击力 +150" }, { type: SkillEffectType.CRIT_RATE, value: 0.05, description: "暴击率 +5%" } ],
        starEffects: {
            "1": [ { type: SkillEffectType.CRIT_DAMAGE, value: 0.15, description: "暴击伤害 +15%（★1）" } ],
            "2": [ { type: SkillEffectType.ATTACK, value: 120, description: "攻击力 +120（★2）" } ],
            "3": [ { type: SkillEffectType.CRIT_RATE, value: 0.08, description: "暴击率 +8%（★3）" } ],
            "4": [ { type: SkillEffectType.ATTACK, value: 250, description: "攻击力 +250（★4）" } ],
            "5": [ { type: SkillEffectType.CRIT_DAMAGE, value: 0.30, description: "暴击伤害 +30%（★5）" } ]
        }
    },
    {
        id: 30013, heroId: 1003, heroName: "炎魔", name: "炎魔·典藏",
        rarity: HeroSkinRarity.EPIC, iconFrameName: "h_3_0_0",
        spinePath: "spine/heros/h_3_0_0", spineSkinName: "h_3_0_0",
        classType: ClassType.MAGE, price: 180,
        baseEffects: [ { type: SkillEffectType.ATTACK, value: 130, description: "攻击力 +130" } ],
        starEffects: {
            "1": [ { type: SkillEffectType.SKILL_COOLDOWN, value: 0.07, description: "技能冷却 +7%（★1）" } ],
            "2": [ { type: SkillEffectType.ATTACK, value: 150, description: "攻击力 +150（★2）" } ],
            "3": [ { type: SkillEffectType.CRIT_DAMAGE, value: 0.20, description: "暴击伤害 +20%（★3）" } ],
            "4": [ { type: SkillEffectType.ATTACK, value: 280, description: "攻击力 +280（★4）" } ],
            "5": [ { type: SkillEffectType.SKILL_COOLDOWN, value: 0.15, description: "技能冷却 +15%（★5）" } ]
        }
    },
    {
        id: 30014, heroId: 1004, heroName: "狮鹫骑士", name: "狮鹫骑士·典藏",
        rarity: HeroSkinRarity.MYTHICAL, iconFrameName: "h_4_0_0",
        spinePath: "spine/heros/h_4_0_0", spineSkinName: "h_4_0_0",
        classType: ClassType.ASSASSIN, price: 500,
        baseEffects: [ { type: SkillEffectType.CRIT_RATE, value: 0.1, description: "暴击率 +10%" }, { type: SkillEffectType.CRIT_DAMAGE, value: 0.2, description: "暴击伤害 +20%" } ],
        starEffects: {
            "1": [ { type: SkillEffectType.ATTACK, value: 150, description: "攻击力 +150（★1）" } ],
            "2": [ { type: SkillEffectType.CRIT_RATE, value: 0.05, description: "暴击率 +5%（★2）" } ],
            "3": [ { type: SkillEffectType.CRIT_DAMAGE, value: 0.25, description: "暴击伤害 +25%（★3）" } ],
            "4": [ { type: SkillEffectType.ATTACK, value: 300, description: "攻击力 +300（★4）" } ],
            "5": [ { type: SkillEffectType.SKILL_COOLDOWN, value: 0.1, description: "技能冷却 +10%（★5）" } ]
        }
    }
    ];