// 伙伴配置
export interface WatchtowerConfig {
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

export const watchtowerConfigs: WatchtowerConfig[] = [
  {
    id: 10001,
    name: "熔岩领主",
    quality: 5,
    skillDesc: "召唤3块熔岩石砸向敌人，对目标造成高额攻击伤害，并使其下一次攻击不会进入冷却。",
    cooldown: 5.0, // 50帧 -> 5秒
    attackBonus: 0.072,
    maxhp: 1000,
    hpBonus: 0.072,
    iconFrameName: "b_0_002",
    spinePath: "spine/boss/b_0_0_2",
    spineSkinName: "b_0_0_2",
    //熔岩弹幕
    bulletId: "lava_lord_basic_bullet",
    animationNames:[ "move","attack"],
    stats: {
      healing: 0,
      bulletSpeed: 1.1
    }
  },
  {
    id: 10002,
    name: "冰霜女王",
    quality: 4,
    skillDesc: "释放寒冰冲击波，减速敌人并造成范围伤害。",
    cooldown: 4.5, // 45帧 -> 4.5秒
    attackBonus: 0.065,
    maxhp: 1000,
    hpBonus: 0.08,
    iconFrameName: "b_0_004",
    spinePath: "spine/boss/b_0_0_4",
    spineSkinName: "b_0_0_4",
    animationNames:[ "move","attack"],
    bulletId: "ice_queen_basic_bullet",
    stats: {
      healing: 0,
      bulletSpeed: 1.3
    }
  },
  {
    id: 10003,
    name: "治愈精灵",
    quality: 3,
    skillDesc: "治疗生命最低的队友，回复大量生命值。",
    cooldown: 4.0, // 40帧 -> 4秒
    attackBonus: 0.03,
    maxhp: 1000,
    hpBonus: 0.12,
    iconFrameName: "b_1_003",
    spinePath: "spine/boss/b_1_0_3",
    spineSkinName: "b_1_0_3",
    animationNames:[ "move","attack"],
    bulletId: "healing_elf_basic_bullet",
    stats: {
      healing: 1.0,
      bulletSpeed: 1.0
    }
  },
  {
    id: 10004,
    name: "影刃刺客",
    quality: 5,
    skillDesc: "快速穿梭敌阵，对路径上的敌人造成暴击伤害。",
    cooldown: 3.8, // 38帧 -> 3.8秒
    attackBonus: 0.09,
    maxhp: 1000,
    hpBonus: 0.05,
    iconFrameName: "b_0_003",
    spinePath: "spine/boss/b_0_0_3",
    spineSkinName: "b_0_0_3",
    animationNames:[ "move","attack"],
    bulletId: "shadow_assassin_basic_bullet",
    stats: {
      healing: 0,
      bulletSpeed: 1.6
    }
  },
  {
    id: 10005,
    name: "雷鸣战士",
    quality: 4,
    skillDesc: "唤雷击中敌人，造成眩晕与伤害。",
    cooldown: 4.2, // 42帧 -> 4.2秒
    attackBonus: 0.08,
    maxhp: 1000,
    hpBonus: 0.09,
    iconFrameName: "b_1_006",
    spinePath: "spine/boss/b_1_0_6",
    spineSkinName: "",
    animationNames:[ "move","attack"],
    bulletId: "thunder_warrior_basic_bullet",
    stats: {
      healing: 0,
      bulletSpeed: 1.4
    }
  },

  {
    id: 10006,
    name: "熔火哨塔",
    quality: 3,
    skillDesc: "发射灼烧弹，对敌人造成持续伤害。",
    cooldown: 4.0,
    attackBonus: 0.04,
    maxhp: 1000,
    hpBonus: 0.06,
    iconFrameName: "watchtower_06",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_basic_bullet",
    stats: { healing: 0, bulletSpeed: 1.2 }
  },
  {
    id: 10007,
    name: "暴风哨塔",
    quality: 4,
    skillDesc: "高速连射，持续压制前方敌人。",
    cooldown: 3.6,
    attackBonus: 0.06,
    maxhp: 1000,
    hpBonus: 0.06,
    iconFrameName: "watchtower_07",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_fast_bullet",
    stats: { healing: 0, bulletSpeed: 1.5 }
  },
  {
    id: 10008,
    name: "霜寒哨塔",
    quality: 3,
    skillDesc: "减速敌人，提升存活空间。",
    cooldown: 4.2,
    attackBonus: 0.03,
    maxhp: 1000,
    hpBonus: 0.08,
    iconFrameName: "watchtower_08",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_control_bullet",
    stats: { healing: 0, bulletSpeed: 1.2 }
  },
  {
    id: 10009,
    name: "光辉哨塔",
    quality: 3,
    skillDesc: "治疗友军并提供护盾。",
    cooldown: 4.5,
    attackBonus: 0.02,
    maxhp: 1000,
    hpBonus: 0.12,
    iconFrameName: "watchtower_09",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_heal_bullet",
    stats: { healing: 1.0, bulletSpeed: 1.0 }
  },
  {
    id: 10010,
    name: "雷霆哨塔",
    quality: 4,
    skillDesc: "充能后释放高额爆发。",
    cooldown: 4.6,
    attackBonus: 0.07,
    maxhp: 1000,
    hpBonus: 0.07,
    iconFrameName: "watchtower_10",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_burst_bullet",
    stats: { healing: 0, bulletSpeed: 1.3 }
  },
  {
    id: 10011,
    name: "腐蚀哨塔",
    quality: 3,
    skillDesc: "施加破甲效果，降低敌方防御。",
    cooldown: 4.0,
    attackBonus: 0.05,
    maxhp: 1000,
    hpBonus: 0.06,
    iconFrameName: "watchtower_11",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_basic_bullet",
    stats: { healing: 0, bulletSpeed: 1.2 }
  },
  {
    id: 10012,
    name: "水晶哨塔",
    quality: 4,
    skillDesc: "水晶攻击，覆盖多名敌人。",
    cooldown: 4.2,
    attackBonus: 0.06,
    maxhp: 1000,
    hpBonus: 0.06,
    iconFrameName: "watchtower_12",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_fast_bullet",
    stats: { healing: 0, bulletSpeed: 1.4 }
    //Watchtower_1
  },
  {
    id: 10013,
    name: "宁静哨塔",
    quality: 3,
    skillDesc: "提升队伍恢复效率。",
    cooldown: 4.0,
    attackBonus: 0.03,
    maxhp: 1000,
    hpBonus: 0.10,
    iconFrameName: "watchtower_13",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_heal_bullet",
    stats: { healing: 1.0, bulletSpeed: 1.0 }
  },
  {
    id: 10014,
    name: "裂地哨塔",
    quality: 4,
    skillDesc: "对地面造成冲击，打断敌人。",
    cooldown: 4.3,
    attackBonus: 0.07,
    maxhp: 1000,
    hpBonus: 0.07,
    iconFrameName: "watchtower_14",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_burst_bullet",
    stats: { healing: 0, bulletSpeed: 1.3 }
  },
  {
    id: 10015,
    name: "暗影哨塔",
    quality: 5,
    skillDesc: "暴击强化，瞬时高伤。",
    cooldown: 4.8,
    attackBonus: 0.09,
    maxhp: 1000,
    hpBonus: 0.06,
    iconFrameName: "watchtower_15",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_burst_bullet",
    stats: { healing: 0, bulletSpeed: 1.4 }
  },
  {
    id: 10016,
    name: "烈焰哨塔",
    quality: 4,
    skillDesc: "远程点控，减速与破甲。",
    cooldown: 4.1,
    attackBonus: 0.06,
    maxhp: 1000,
    hpBonus: 0.08,
    iconFrameName: "watchtower_16",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_control_bullet",
    stats: { healing: 0, bulletSpeed: 1.2 }
    //Watchtower_3
  },
  {
    id: 10017,
    name: "圣辉哨塔",
    quality: 5,
    skillDesc: "强力治疗并提供短暂免伤。",
    cooldown: 5.0,
    attackBonus: 0.02,
    maxhp: 1000,
    hpBonus: 0.12,
    iconFrameName: "watchtower_17",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_heal_bullet",
    stats: { healing: 1.2, bulletSpeed: 1.0 }
    //Watchtower_4
  },
  {
    id: 10018,
    name: "星陨哨塔",
    quality: 5,
    skillDesc: "高额范围爆发，收割战场。",
    cooldown: 5.2,
    attackBonus: 0.10,
    maxhp: 1000,
    hpBonus: 0.06,
    iconFrameName: "watchtower_18",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_power_bullet",
    stats: { healing: 0, bulletSpeed: 1.1 }
    //Watchtower_2
  },

  // 追加：纯哨塔资源（watchtower_01 ~ watchtower_05）
  {
    id: 20001,
    name: "哨塔01",
    quality: 4,
    skillDesc: "基础单体攻击。",
    cooldown: 4.0,
    attackBonus: 0.05,
    maxhp: 1000,
    hpBonus: 0.06,
    iconFrameName: "watchtower_01",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_basic_bullet",
    stats: { healing: 0, bulletSpeed: 1.2 }
  },
  {
    id: 20002,
    name: "哨塔02",
    quality: 4,
    skillDesc: "范围减速控制。",
    cooldown: 4.2,
    attackBonus: 0.04,
    maxhp: 1000,
    hpBonus: 0.07,
    iconFrameName: "watchtower_02",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_control_bullet",
    stats: { healing: 0, bulletSpeed: 1.2 }
  },
  {
    id: 20003,
    name: "哨塔03",
    quality: 3,
    skillDesc: "治疗与恢复。",
    cooldown: 4.0,
    attackBonus: 0.02,
    maxhp: 1000,
    hpBonus: 0.10,
    iconFrameName: "watchtower_03",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_heal_bullet",
    stats: { healing: 1.0, bulletSpeed: 1.0 }
  },
  {
    id: 20004,
    name: "哨塔04",
    quality: 5,
    skillDesc: "高爆发伤害。",
    cooldown: 4.5,
    attackBonus: 0.08,
    maxhp: 1000,
    hpBonus: 0.06,
    iconFrameName: "watchtower_04",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_burst_bullet",
    stats: { healing: 0, bulletSpeed: 1.3 }
  },
  {
    id: 20005,
    name: "哨塔05",
    quality: 4,
    skillDesc: "充能后强化输出。",
    cooldown: 4.2,
    attackBonus: 0.06,
    maxhp: 1000,
    hpBonus: 0.07,
    iconFrameName: "watchtower_05",
    spinePath: "",
    spineSkinName: "",
    animationNames:["move","attack"],
    bulletId: "watchtower_fast_bullet",
    stats: { healing: 0, bulletSpeed: 1.4 }
  }





  

];
