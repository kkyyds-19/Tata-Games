export enum SkillEffectType {
    ATTACK = "attack",                  // 攻击力增加（固定数值）
    MAXHP = "maxhp",                    // 最大生命值增加（固定数值）
    DEFENSE = "defense",                // 防御力增加（固定数值）
    DAMAGE_REDUCTION = "damageReduction", // 受到伤害减少（百分比）
    SKILL_COOLDOWN = "skill_cooldown", // 技能冷却时间缩短（百分比）
    CRIT_RATE = "crit_rate",           // 暴击率增加（百分比）
    CRIT_DAMAGE = "crit_damage"        // 暴击伤害增加（百分比）
  }
  
  export interface SkillEffect {
    type: SkillEffectType;
    value: number;
    description: string;
  }

export enum TransformationPart {
    HEAD,     // 头
    CHEST,    // 胸
    SHOULDER, // 肩
    HAND,     // 手
    BACK      // 背
  }

  
export interface TransformationSkinConfig {
    transformatskinId: number;                        // 唯一幻化 ID
    name: string;                          // 名称，例如 “仇恨头盗”
    icon: string;                          // 图标资源名
    quality: number;                       // 品质（1~5星）
    part: TransformationPart;                    // 所属部位：头、胸、肩、手、背
    bonus: SkillEffect[];                  // 基础属性加成
    bondId: number | null;                 // 羁绊 ID（无羁绊为 null）
    bondBonus: SkillEffect[];             // 羁绊激活后的额外加成
  }
  


  export const TransformationSkinConfigs: TransformationSkinConfig[] = [
    {
      transformatskinId: 1001,
      name: '头部幻化·1001',
      icon: '',
      quality: 2,
      part: TransformationPart.HEAD,
      bonus: [
      { type: SkillEffectType.ATTACK, value: 0.09, description: '攻击力 +0.09' }
    ],
      bondId: null,
      bondBonus: []
    },
    {
      transformatskinId: 1002,
      name: '头部幻化·1002',
      icon: '',
      quality: 2,
      part: TransformationPart.HEAD,
      bonus: [
      { type: SkillEffectType.CRIT_DAMAGE, value: 0.13, description: '暴击伤害增加 +13%' }
    ],
      bondId: 1,
      bondBonus: [
      { type: SkillEffectType.DEFENSE, value: 0.06, description: '防御力 +0.06' }
    ]
    },
    {
      transformatskinId: 1003,
      name: '头部幻化·1003',
      icon: '',
      quality: 3,
      part: TransformationPart.HEAD,
      bonus: [
      { type: SkillEffectType.ATTACK, value: 0.06, description: '攻击力 +0.06' }
    ],
      bondId: null,
      bondBonus: []
    },
    {
      transformatskinId: 1004,
      name: '胸部幻化·1004',
      icon: '',
      quality: 3,
      part: TransformationPart.CHEST,
      bonus: [
      { type: SkillEffectType.DEFENSE, value: 0.14, description: '防御力 +0.14' }
    ],
      bondId: 3,
      bondBonus: [
      { type: SkillEffectType.DEFENSE, value: 0.13, description: '防御力 +0.13' }
    ]
    },
    {
      transformatskinId: 1005,
      name: '胸部幻化·1005',
      icon: '',
      quality: 4,
      part: TransformationPart.CHEST,
      bonus: [
      { type: SkillEffectType.CRIT_RATE, value: 0.08, description: '暴击率 +8%' }
    ],
      bondId: null,
      bondBonus: []
    },
    {
      transformatskinId: 1006,
      name: '胸部幻化·1006',
      icon: '',
      quality: 1,
      part: TransformationPart.CHEST,
      bonus: [
      { type: SkillEffectType.MAXHP, value: 0.06, description: '生命值 +0.06' }
    ],
      bondId: null,
      bondBonus: []
    },  {
      transformatskinId: 1007,
      name: '胸部幻化·1007',
      icon: '',
      quality: 3,
      part: TransformationPart.CHEST,
      bonus: [
      { type: SkillEffectType.DEFENSE, value: 0.1, description: '防御力 +0.1' }
    ],
      bondId: null,
      bondBonus: []
    },
    {
      transformatskinId: 1008,
      name: '肩部幻化·1008',
      icon: '',
      quality: 1,
      part: TransformationPart.SHOULDER,
      bonus: [
      { type: SkillEffectType.DAMAGE_REDUCTION, value: 0.06, description: '受到伤害减少 +6%' }
    ],
      bondId: 1,
      bondBonus: [
      { type: SkillEffectType.MAXHP, value: 0.11, description: '生命值 +0.11' }
    ]
    },
    {
      transformatskinId: 1009,
      name: '肩部幻化·1009',
      icon: '',
      quality: 5,
      part: TransformationPart.SHOULDER,
      bonus: [
      { type: SkillEffectType.CRIT_DAMAGE, value: 0.06, description: '暴击伤害增加 +6%' }
    ],
      bondId: 2,
      bondBonus: [
      { type: SkillEffectType.DAMAGE_REDUCTION, value: 0.1, description: '受到伤害减少 +10%' }
    ]
    },
    {
      transformatskinId: 1010,
      name: '肩部幻化·1010',
      icon: '',
      quality: 3,
      part: TransformationPart.SHOULDER,
      bonus: [
      { type: SkillEffectType.DEFENSE, value: 0.08, description: '防御力 +0.08' }
    ],
      bondId: 2,
      bondBonus: [
      { type: SkillEffectType.SKILL_COOLDOWN, value: 0.12, description: '技能冷却时间缩短 +12%' }
    ]
    },
    {
      transformatskinId: 1011,
      name: '手部幻化·1011',
      icon: '',
      quality: 5,
      part: TransformationPart.HAND,
      bonus: [
      { type: SkillEffectType.CRIT_DAMAGE, value: 0.12, description: '暴击伤害增加 +12%' }
    ],
      bondId: 3,
      bondBonus: [
      { type: SkillEffectType.CRIT_DAMAGE, value: 0.11, description: '暴击伤害增加 +11%' }
    ]
    },
    {
      transformatskinId: 1012,
      name: '手部幻化·1012',
      icon: '',
      quality: 2,
      part: TransformationPart.HAND,
      bonus: [
      { type: SkillEffectType.DAMAGE_REDUCTION, value: 0.08, description: '受到伤害减少 +8%' }
    ],
      bondId: 2,
      bondBonus: [
      { type: SkillEffectType.DAMAGE_REDUCTION, value: 0.14, description: '受到伤害减少 +14%' }
    ]
    },
    {
      transformatskinId: 1013,
      name: '手部幻化·1013',
      icon: '',
      quality: 5,
      part: TransformationPart.HAND,
      bonus: [
      { type: SkillEffectType.CRIT_RATE, value: 0.07, description: '暴击率 +7%' }
    ],
      bondId: null,
      bondBonus: []
    },
    {
      transformatskinId: 1014,
      name: '背部幻化·1014',
      icon: '',
      quality: 1,
      part: TransformationPart.BACK,
      bonus: [
      { type: SkillEffectType.MAXHP, value: 0.1, description: '生命值 +0.1' }
    ],
      bondId: 3,
      bondBonus: [
      { type: SkillEffectType.DEFENSE, value: 0.09, description: '防御力 +0.09' }
    ]
    },
    {
      transformatskinId: 1015,
      name: '背部幻化·1015',
      icon: '',
      quality: 4,
      part: TransformationPart.BACK,
      bonus: [
      { type: SkillEffectType.ATTACK, value: 0.14, description: '攻击力 +0.14' }
    ],
      bondId: null,
      bondBonus: []
    },
    {
      transformatskinId: 1016,
      name: '背部幻化·1016',
      icon: '',
      quality: 2,
      part: TransformationPart.BACK,
      bonus: [
      { type: SkillEffectType.CRIT_DAMAGE, value: 0.1, description: '暴击伤害增加 +10%' }
    ],
      bondId: 1,
      bondBonus: [
      { type: SkillEffectType.CRIT_RATE, value: 0.09, description: '暴击率 +9%' }
    ]
    }
  ]
  
  


    // transformatskinId: number;                      // 对应幻化 ID
    // owned: boolean;                      // 是否已解锁
    // equipped: boolean;                   // 是否当前穿戴
    // fragmentCount: number;               // 当前拥有碎片数
    // lockStatus: 'locked' | 'unlocked' | 'disabled'; // 解锁状态
    // level: number;                       // 当前等级（例如 1 ~ 10）
