// 自动生成的遗物配置
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

export interface StarEffect {
  star: number;
  effects: SkillEffect[];
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

export interface LegacyConfig {
  id: number;
  name: string;
  rarity: number;
  originZone: number;
  bondIds: number[];
  iconFrameName: string;
  baseFrameName: string;
  titleFrameName: string;
  lostImageName: string;
  starEffects: StarEffect[];
}

export const legacyConfigs: LegacyConfig[] = [
  {
    id: 10001,
    name: "山丘圣杯",
    rarity: 2,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_2_1",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10002,
    name: "巫毒雕像",
    rarity: 2,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_2_2",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10003,
    name: "银质颈环",
    rarity: 3,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_1",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10004,
    name: "巫王法杖",
    rarity: 3,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_2",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10005,
    name: "发条侏儒",
    rarity: 3,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_3",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10006,
    name: "巫毒人偶",
    rarity: 3,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_4",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10007,
    name: "诸神毁灭者",
    rarity: 3,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_5",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10008,
    name: "Lost_3_6",
    rarity: 3,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_6",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10009,
    name: "纯金夜壶",
    rarity: 4,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_1",
    baseFrameName: "legacy_icon_bg_1",
    titleFrameName: "legacy_icon_frame_1",
    lostImageName: "Lost_4_1",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10010,
    name: "狮鹫石像",
    rarity: 4,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_1",
    baseFrameName: "legacy_icon_bg_1",
    titleFrameName: "legacy_icon_frame_1",
    lostImageName: "Lost_4_2",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10011,
    name: "手甲",
    rarity: 4,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_1",
    baseFrameName: "legacy_icon_bg_1",
    titleFrameName: "legacy_icon_frame_1",
    lostImageName: "Lost_4_3",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10012,
    name: "羽饰耳环",
    rarity: 4,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_1",
    baseFrameName: "legacy_icon_bg_1",
    titleFrameName: "legacy_icon_frame_1",
    lostImageName: "Lost_4_4",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10013,
    name: "镶金假牙",
    rarity: 4,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_1",
    baseFrameName: "legacy_icon_bg_1",
    titleFrameName: "legacy_icon_frame_1",
    lostImageName: "Lost_4_5",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10014,
    name: "玉璧手镯",
    rarity: 4,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_1",
    baseFrameName: "legacy_icon_bg_1",
    titleFrameName: "legacy_icon_frame_1",
    lostImageName: "Lost_4_6",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10015,
    name: "宝石杯",
    rarity: 5,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_0",
    baseFrameName: "legacy_icon_bg_0",
    titleFrameName: "legacy_icon_frame_0",
    lostImageName: "Lost_5_1",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10016,
    name: "燃烧战锤",
    rarity: 5,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_0",
    baseFrameName: "legacy_icon_bg_0",
    titleFrameName: "legacy_icon_frame_0",
    lostImageName: "Lost_5_2",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10017,
    name: "铸铁烟斗",
    rarity: 5,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_0",
    baseFrameName: "legacy_icon_bg_0",
    titleFrameName: "legacy_icon_frame_0",
    lostImageName: "Lost_5_3",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10018,
    name: "献祭之刃",
    rarity: 5,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_0",
    baseFrameName: "legacy_icon_bg_0",
    titleFrameName: "legacy_icon_frame_0",
    lostImageName: "Lost_5_4",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10019,
    name: "赤红宝石",
    rarity: 5,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_0",
    baseFrameName: "legacy_icon_bg_0",
    titleFrameName: "legacy_icon_frame_0",
    lostImageName: "Lost_5_5",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 10020,
    name: "蜥蜴咒符",
    rarity: 5,
    originZone: 1,
    bondIds: [],
    iconFrameName: "legacy_icon_light_0",
    baseFrameName: "legacy_icon_bg_0",
    titleFrameName: "legacy_icon_frame_0",
    lostImageName: "Lost_5_6",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20001,
    name: "碎颅者节杖",
    rarity: 1,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_1_1",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20002,
    name: "萨满头饰",
    rarity: 1,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_1_2",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20003,
    name: "精灵护符",
    rarity: 1,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_1_3",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20004,
    name: "珍石颈带",
    rarity: 1,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_1_4",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20005,
    name: "灵魂镜",
    rarity: 2,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_2_1",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20006,
    name: "战狼雕塑",
    rarity: 2,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_2_2",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20007,
    name: "瑞苏之矛",
    rarity: 2,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_2_3",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20008,
    name: "启程之鼓",
    rarity: 2,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_2_4",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20009,
    name: "象牙梳",
    rarity: 3,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_1",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20010,
    name: "手工焚石",
    rarity: 3,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_2",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20011,
    name: "精灵风铃",
    rarity: 3,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_3",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20012,
    name: "恶魔之鞭",
    rarity: 3,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_4",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20013,
    name: "石头之槌",
    rarity: 3,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_5",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20014,
    name: "锈迹切肉刀",
    rarity: 3,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_6",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20015,
    name: "精灵硬币",
    rarity: 4,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_1",
    baseFrameName: "legacy_icon_bg_1",
    titleFrameName: "legacy_icon_frame_1",
    lostImageName: "Lost_4_1",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20016,
    name: "宝石项链",
    rarity: 4,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_1",
    baseFrameName: "legacy_icon_bg_1",
    titleFrameName: "legacy_icon_frame_1",
    lostImageName: "Lost_4_2",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20017,
    name: "银质发簪",
    rarity: 4,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_1",
    baseFrameName: "legacy_icon_bg_1",
    titleFrameName: "legacy_icon_frame_1",
    lostImageName: "Lost_4_3",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20018,
    name: "骨质酒杯",
    rarity: 4,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_1",
    baseFrameName: "legacy_icon_bg_1",
    titleFrameName: "legacy_icon_frame_1",
    lostImageName: "Lost_4_4",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20019,
    name: "灰烛残端",
    rarity: 4,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_1",
    baseFrameName: "legacy_icon_bg_1",
    titleFrameName: "legacy_icon_frame_1",
    lostImageName: "Lost_4_5",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20020,
    name: "鹿骨鱼钩",
    rarity: 4,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_1",
    baseFrameName: "legacy_icon_bg_1",
    titleFrameName: "legacy_icon_frame_1",
    lostImageName: "Lost_4_6",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20021,
    name: "丝绸长袍",
    rarity: 5,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_0",
    baseFrameName: "legacy_icon_bg_0",
    titleFrameName: "legacy_icon_frame_0",
    lostImageName: "Lost_5_1",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20022,
    name: "暗月刀",
    rarity: 5,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_0",
    baseFrameName: "legacy_icon_bg_0",
    titleFrameName: "legacy_icon_frame_0",
    lostImageName: "Lost_5_2",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20023,
    name: "白银匣子",
    rarity: 5,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_0",
    baseFrameName: "legacy_icon_bg_0",
    titleFrameName: "legacy_icon_frame_0",
    lostImageName: "Lost_5_3",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20024,
    name: "釉土瓦片",
    rarity: 5,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_0",
    baseFrameName: "legacy_icon_bg_0",
    titleFrameName: "legacy_icon_frame_0",
    lostImageName: "Lost_5_4",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20025,
    name: "石木长弓",
    rarity: 5,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_0",
    baseFrameName: "legacy_icon_bg_0",
    titleFrameName: "legacy_icon_frame_0",
    lostImageName: "Lost_5_5",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 20026,
    name: "青铜蝎",
    rarity: 5,
    originZone: 2,
    bondIds: [],
    iconFrameName: "legacy_icon_light_0",
    baseFrameName: "legacy_icon_bg_0",
    titleFrameName: "legacy_icon_frame_0",
    lostImageName: "Lost_5_6",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30001,
    name: "七彩祥云",
    rarity: 1,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_1_1",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30002,
    name: "定海神针",
    rarity: 1,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_1_2",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30003,
    name: "百花花环",
    rarity: 2,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_2_1",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30004,
    name: "鹏羽天角风筝",
    rarity: 2,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_2_2",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30005,
    name: "野餐餐篮",
    rarity: 2,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_2_3",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30006,
    name: "愚乐宝箱",
    rarity: 2,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_2_4",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30007,
    name: "烟花发射器",
    rarity: 2,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_2_5",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30008,
    name: "至尊火腿",
    rarity: 2,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_2_6",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30009,
    name: "照妖镜",
    rarity: 2,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_2_7",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30010,
    name: "金箍",
    rarity: 2,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_2_8",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30011,
    name: "魔並石像",
    rarity: 2,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_3",
    baseFrameName: "legacy_icon_bg_3",
    titleFrameName: "legacy_icon_frame_3",
    lostImageName: "Lost_2_9",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30012,
    name: "黑石铲",
    rarity: 3,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_1",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30013,
    name: "圣光石",
    rarity: 3,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_2",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30014,
    name: "胜杰翼羽",
    rarity: 3,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_3",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30015,
    name: "角鹰蛋壳",
    rarity: 3,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_4",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30016,
    name: "单曲CD",
    rarity: 3,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_5",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30017,
    name: "暗月门票",
    rarity: 3,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_6",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30018,
    name: "藏宝图",
    rarity: 3,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_7",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30019,
    name: "枯萎树苗",
    rarity: 3,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_8",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  },
  {
    id: 30020,
    name: "古老符纸",
    rarity: 3,
    originZone: 3,
    bondIds: [],
    iconFrameName: "legacy_icon_light_2",
    baseFrameName: "legacy_icon_bg_2",
    titleFrameName: "legacy_icon_frame_2",
    lostImageName: "Lost_3_9",
    starEffects: [
      { star: 1, effects: [] },
      { star: 2, effects: [] },
      { star: 3, effects: [] },
      { star: 4, effects: [] },
      { star: 5, effects: [] }
    ]
  }
];
