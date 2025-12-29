// 伙伴配置
export interface PartnerConfig {
    id: number;
    name: string;
    quality: number;             // 品质：0-6
    skillDesc: string;
    cooldown: number;
    attackBonus: number;
    hpBonus: number;
    //血量
    maxhp: number;
    iconFrameName: string;
    spinePath: string;
    spineSkinName: string;
    bulletId: string;
    animationNames:string[];
    stats: {
        healing: number;
        bulletSpeed: number;
    };
}

export const partnerConfigs: PartnerConfig[] = [
  {
    id: 10001,
    name: "熔岩领主",
    quality: 5,
    skillDesc: "召唤3块熔岩石砸向敌人，对目标造成高额攻击伤害，并使其下一次攻击不会进入冷却。",
    cooldown: 5.0, // 50帧 -> 5秒
    attackBonus: 0.072,
    maxhp: 1000,
    hpBonus: 0.072,
    iconFrameName: "p_0_002",
    spinePath: "spine/Partner/p_0_002",
    spineSkinName: "p_0_002",
    //熔岩弹幕
    bulletId: "lava_lord_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.1
    }
  },
  {
    id: 10006,
    name: "火焰游侠",
    quality: 4,
    skillDesc: "火焰斩击，造成持续灼烧伤害。",
    cooldown: 4.3,
    attackBonus: 0.07,
    maxhp: 1000,
    hpBonus: 0.07,
    iconFrameName: "p_0_001",
    spinePath: "spine/Partner/p_0_001",
    spineSkinName: "p_0_001",
    bulletId: "lava_lord_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.3
    }
  },
  {
    id: 10002,
    name: "电锤",
    quality: 4,
    skillDesc: "释放寒冰冲击波，减速敌人并造成范围伤害。",
    cooldown: 4.5, // 45帧 -> 4.5秒
    attackBonus: 0.065,
    maxhp: 1000,
    hpBonus: 0.08,
    iconFrameName: "p_0_004",
    spinePath: "spine/Partner/p_0_004",
    spineSkinName: "p_0_004",
    animationNames:[ "move","attack"],
    bulletId: "ice_queen_basic_bullet",
    stats: {
      healing: 0,
      bulletSpeed: 1.3
    }
  },
  {
    id: 10007,
    name: "风岩之龙",
    quality: 3,
    skillDesc: "风岩冲锋，造成穿透伤害并短暂击退。",
    cooldown: 4.4,
    attackBonus: 0.065,
    maxhp: 1050,
    hpBonus: 0.08,
    iconFrameName: "p_1_002",
    spinePath: "spine/Partner/p_1_002",
    spineSkinName: "p_1_002",
    bulletId: "thunder_warrior_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.25
    }
  },
  {
    id: 10003,
    name: "精灵龙",
    quality: 3,
    skillDesc: "治疗生命最低的队友，回复大量生命值。",
    cooldown: 4.0, // 40帧 -> 4秒
    attackBonus: 0.03,
    maxhp: 1000,
    hpBonus: 0.12,
    iconFrameName: "p_1_003",
    spinePath: "spine/Partner/p_1_003",
    spineSkinName: "p_1_003",
    animationNames:[ "move","attack"],
    bulletId: "healing_elf_basic_bullet",
    stats: {
      healing: 1.0,
      bulletSpeed: 1.0
    }
  },
  {
    id: 10004,
    name: "飞鹰领主",
    quality: 5,
    skillDesc: "快速穿梭敌阵，对路径上的敌人造成暴击伤害。",
    cooldown: 3.8, // 38帧 -> 3.8秒
    attackBonus: 0.09,
    maxhp: 1000,
    hpBonus: 0.05,
    iconFrameName: "p_0_003",
    spinePath: "spine/Partner/p_0_003",
    spineSkinName: "p_0_003",
    animationNames:[ "move","attack"],
    bulletId: "shadow_assassin_basic_bullet",
    stats: {
      healing: 0,
      bulletSpeed: 1.6
    }
  },
  {
    id: 10005,
    name: "黄金巨人",
    quality: 4,
    skillDesc: "唤雷击中敌人，造成眩晕与伤害。",
    cooldown: 4.2, // 42帧 -> 4.2秒
    attackBonus: 0.08,
    maxhp: 1000,
    hpBonus: 0.09,
    iconFrameName: "p_1_004",
    spinePath: "spine/Partner/p_1_004",
    spineSkinName: "p_1_004",
    animationNames:[ "move","attack"],
    bulletId: "thunder_warrior_basic_bullet",
    stats: {
      healing: 0,
      bulletSpeed: 1.4
    }
  },
  {
    id: 10010,
    name: "大地之龙",
    quality: 3,
    skillDesc: "震地冲击，对周围造成伤害并短暂减速。",
    cooldown: 4.5,
    attackBonus: 0.06,
    maxhp: 1100,
    hpBonus: 0.08,
    iconFrameName: "p_1_001",
    spinePath: "spine/Partner/p_1_001",
    spineSkinName: "p_1_001",
    bulletId: "earth_dragon_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.2
    }
  },
  {
    id: 10011,
    name: "奥术之龙",
    quality: 4,
    skillDesc: "释放奥术弹幕，穿透敌人造成伤害。",
    cooldown: 4.2,
    attackBonus: 0.075,
    maxhp: 1000,
    hpBonus: 0.07,
    iconFrameName: "p_2_001",
    spinePath: "spine/Partner/p_2_001",
    spineSkinName: "p_2_001",
    bulletId: "arcane_dragon_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.3
    }
  },
  {
    id: 10012,
    name: "毒霾之龙",
    quality: 3,
    skillDesc: "喷吐毒雾，持续伤害并降低敌人攻击。",
    cooldown: 4.8,
    attackBonus: 0.06,
    maxhp: 1050,
    hpBonus: 0.09,
    iconFrameName: "p_2_002",
    spinePath: "spine/Partner/p_2_002",
    spineSkinName: "p_2_002",
    bulletId: "poison_dragon_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.1
    }
  },
  {
    id: 10013,
    name: "时光之龙",
    quality: 5,
    skillDesc: "减缓时间流速，提升自身攻速并控制敌人。",
    cooldown: 4.0,
    attackBonus: 0.085,
    maxhp: 980,
    hpBonus: 0.06,
    iconFrameName: "p_2_003",
    spinePath: "spine/Partner/p_2_003",
    spineSkinName: "p_2_003",
    bulletId: "time_dragon_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.4
    }
  },
  {
    id: 10014,
    name: "亡灵巨龙",
    quality: 5,
    skillDesc: "亡灵冲击，造成高额伤害并吸取生命。",
    cooldown: 4.6,
    attackBonus: 0.09,
    maxhp: 1200,
    hpBonus: 0.1,
    iconFrameName: "p_2_004",
    spinePath: "spine/Partner/p_2_004",
    spineSkinName: "p_2_004",
    bulletId: "undead_dragon_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0.2,
      bulletSpeed: 1.25
    }
  },
  {
    id: 10015,
    name: "熊人领主",
    quality: 2,
    skillDesc: "重击敌人并获得短暂无敌。",
    cooldown: 4.3,
    attackBonus: 0.055,
    maxhp: 1150,
    hpBonus: 0.09,
    iconFrameName: "p_3_001",
    spinePath: "spine/Partner/p_3_001",
    spineSkinName: "p_3_001",
    bulletId: "bear_lord_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.2
    }
  },
  {
    id: 10016,
    name: "巨鹰长老",
    quality: 3,
    skillDesc: "迅捷突袭，连续攻击路径上的敌人。",
    cooldown: 3.9,
    attackBonus: 0.07,
    maxhp: 950,
    hpBonus: 0.06,
    iconFrameName: "p_3_002",
    spinePath: "spine/Partner/p_3_002",
    spineSkinName: "p_3_002",
    bulletId: "eagle_elder_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.5
    }
  },
  {
    id: 10017,
    name: "巨蛇首领",
    quality: 4,
    skillDesc: "毒牙一击，造成中毒与持续伤害。",
    cooldown: 4.4,
    attackBonus: 0.075,
    maxhp: 1100,
    hpBonus: 0.08,
    iconFrameName: "p_4_001",
    spinePath: "spine/Partner/p_4_001",
    spineSkinName: "p_4_001",
    bulletId: "serpent_chief_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.2
    }
  },
  {
    id: 10018,
    name: "副毒蛛将",
    quality: 2,
    skillDesc: "喷射蛛毒，减速并伤害敌人。",
    cooldown: 4.3,
    attackBonus: 0.055,
    maxhp: 900,
    hpBonus: 0.07,
    iconFrameName: "p_4_002",
    spinePath: "spine/Partner/p_4_002",
    spineSkinName: "p_4_002",
    bulletId: "spider_commander_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.3
    }
  },
  {
    id: 10019,
    name: "雷霆撕将",
    quality: 4,
    skillDesc: "落雷撕裂，造成范围麻痹与伤害。",
    cooldown: 4.2,
    attackBonus: 0.08,
    maxhp: 1000,
    hpBonus: 0.08,
    iconFrameName: "p_4_003",
    spinePath: "spine/Partner/p_4_003",
    spineSkinName: "p_4_003",
    bulletId: "thunder_ripper_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.4
    }
  },
  {
    id: 10020,
    name: "虚空亚龙",
    quality: 5,
    skillDesc: "虚空冲击，造成穿透伤害并虚弱敌人。",
    cooldown: 4.0,
    attackBonus: 0.09,
    maxhp: 950,
    hpBonus: 0.07,
    iconFrameName: "p_4_004",
    spinePath: "spine/Partner/p_4_004",
    spineSkinName: "p_4_004",
    bulletId: "void_wyrm_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.5
    }
  },
  
  {
    id: 10008,
    name: "怒熊领主",
    quality: 1,
    skillDesc: "蓄力猛击造成范围伤害并短暂击退。",
    cooldown: 4.5,
    attackBonus: 0.06,
    maxhp: 1200,
    hpBonus: 0.08,
    iconFrameName: "p_3_003",
    spinePath: "spine/Partner/p_3_003",
    spineSkinName: "p_3_003",
    bulletId: "shadow_assassin_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.3
    }
  },
  {
    id: 10009,
    name: "双风斥候",
    quality: 1,
    skillDesc: "快速突进并斩击，造成连击伤害。",
    cooldown: 4.2,
    attackBonus: 0.065,
    maxhp: 1000,
    hpBonus: 0.07,
    iconFrameName: "p_3_004",
    spinePath: "spine/Partner/p_3_004",
    spineSkinName: "p_3_004",
    bulletId: "thunder_warrior_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.4
    }
  },
];
