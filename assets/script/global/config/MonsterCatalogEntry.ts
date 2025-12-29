/**
 * 怪物类型枚举
 */
export enum MonsterType {
    NORMAL = "normal",   // 普通怪物
    ELITE = "elite",     // 精英怪物
    BOSS = "boss"        // 首领怪物
  }
  
  /**
   * 怪物图鉴项定义
   */
  export interface MonsterCatalogEntry {
    id: number;                     // 怪物唯一ID（从10000起）
    name: string;                   // 怪物名称
    description: string;            // 怪物简介
    iconFrameName: string;          // 图标资源名（预设空字符串）
    resourceType: "anim" | "spine"; // 动画资源类型："anim" 为帧动画，"spine" 为 Spine 动画
    resourceDir: string;            // 动画资源目录
    spineSkinName: string;          // Spine 皮肤名（Spine动画填写，否则空字符串）
    animationNames: string[];       // 动画名称列表
    unlockStage: number;            // 解锁所需通过的关卡编号
    monsterType: MonsterType;       // 怪物类型
    key: string;                    // 怪物key，用于API调用
  }
  

//boss 动画类型统一为'spine'    
//resourceDir:"spine/boss/"  
//animationNames 统一为 "animationNames": ["move","attack"]
  export const monsterCatalogEntries_boss: MonsterCatalogEntry[] = [
    {
      id: 10000,
      name: "青翼蝙蝠",
      description: "剧毒蝙蝠，藏于阴影，行动迅捷。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_0_2",
      spineSkinName: "b_1_0_2",
      animationNames: ["move", "attack"],
      unlockStage: 1,
      monsterType: MonsterType.BOSS,
      key: "b_1_0_2"
    },
    {
      id: 10001,
      name: "环地掘地蝎",
      description: "剧毒蝎子，尾钩一击致命。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_0_3",
      spineSkinName: "b_1_0_3",
      animationNames: ["move", "attack"],
      unlockStage: 1,
      monsterType: MonsterType.BOSS,
      key: "b_1_0_3"
    },
    {
      id: 10002,
      name: "大地霸主",
      description: "花岗岩巨人，坚不可摧的守护者。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_0_5",
      spineSkinName: "b_1_0_5",
      animationNames: ["move", "attack"],
      unlockStage: 7,
      monsterType: MonsterType.BOSS,
      key: "b_1_0_5"
    },
    {
      id: 10003,
      name: "深岩之王",
      description: "巨型兽人，以蛮力征服洞窟。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_0_4",
      spineSkinName: "b_1_0_4",
      animationNames: ["move", "attack"],
      unlockStage: 7,
      monsterType: MonsterType.BOSS,
      key: "b_1_0_4"
    },
    {
      id: 10004,
      name: "青屠夫",
      description: "冷酷残忍的杀戮者，挥舞大刀屠尽一切。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_0_1",
      spineSkinName: "",
      animationNames: ["move", "attack"],
      unlockStage: 13,
      monsterType: MonsterType.BOSS,
      key: "b_0_0_1"
    },
    {
      id: 10005,
      name: "熔岩领主",
      description: "火焰领主，掌控岩浆与烈焰。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_0_2",
      spineSkinName: "b_0_0_2",
      animationNames: ["move", "attack"],
      unlockStage: 13,
      monsterType: MonsterType.BOSS,
      key: "b_0_0_2"
    },
    {
      id: 10006,
      name: "夜鬼双斧王",
      description: "双头食人魔，双斧怒吼撕裂敌人。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_0_3",
      spineSkinName: "b_0_0_3",
      animationNames: ["move", "attack"],
      unlockStage: 19,
      monsterType: MonsterType.BOSS,
      key: "b_0_0_3"
    },
    {
      id: 10007,
      name: "娜迦领主",
      description: "巨斧娜迦，冷血水域霸主。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_0_4",
      spineSkinName: "b_0_0_4",
      animationNames: ["move", "attack"],
      unlockStage: 19,
      monsterType: MonsterType.BOSS,
      key: "b_0_0_4"
    },
    {
      id: 10008,
      name: "雷皇圣者",
      description: "巫妖王，支配雷电与亡灵的高阶存在。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_0_1",
      spineSkinName: "b_1_0_1",
      animationNames: ["move", "attack"],
      unlockStage: 25,
      monsterType: MonsterType.BOSS,
      key: "b_1_0_1"
    },
    {
      id: 10009,
      name: "亡灵骨龙",
      description: "冰霜骨龙，亡者之翼。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_0_6",
      spineSkinName: "",
      animationNames: ["move", "attack"],
      unlockStage: 25,
      monsterType: MonsterType.BOSS,
      key: "b_1_0_6"
    },

    //10.29新增boss

     {
      id: 10010,
      name: "冰原狼王",
      description: "冰原狼王",
      iconFrameName: "冰原狼王",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_005",
      spineSkinName: "b_0_005",
      animationNames: ["move", "attack"],
      unlockStage: 25,
      monsterType: MonsterType.BOSS,
      key: "b_0_005"
    },
    {
      id: 10011,
      name: "暗影魔王",
      description: "操控暗影力量的魔王，攻击带有暗属性伤害。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_006",
      spineSkinName: "b_0_006",
      animationNames: ["move", "attack"],
      unlockStage: 31,
      monsterType: MonsterType.BOSS,
      key: "b_0_006"
    },
    {
      id: 10012,
      name: "钢铁巨兽",
      description: "全身覆盖钢铁装甲的巨型怪兽，防御力极强。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_007",
      spineSkinName: "b_0_007",
      animationNames: ["move", "attack"],
      unlockStage: 31,
      monsterType: MonsterType.BOSS,
      key: "b_0_007"
    },
    {
      id: 10013,
      name: "烈焰君主",
      description: "掌控烈焰的君主，攻击带有强烈的火焰伤害。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_008",
      spineSkinName: "b_0_008",
      animationNames: ["move", "attack"],
      unlockStage: 31,
      monsterType: MonsterType.BOSS,
      key: "b_0_008"
    },
    {
      id: 10014,
      name: "冰霜女王",
      description: "冰雪王国的女王，能够冻结一切敌人。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_009",
      spineSkinName: "b_0_009",
      animationNames: ["move", "attack"],
      unlockStage: 37,
      monsterType: MonsterType.BOSS,
      key: "b_0_009"
    },
    {
      id: 10015,
      name: "雷霆战神",
      description: "掌控雷电之力的战神，攻击速度极快。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_010",
      spineSkinName: "b_0_010",
      animationNames: ["move", "attack"],
      unlockStage: 37,
      monsterType: MonsterType.BOSS,
      key: "b_0_010"
    },
    {
      id: 10016,
      name: "毒液之主",
      description: "剧毒沼泽的主宰，攻击带有致命毒素。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_011",
      spineSkinName: "b_0_011",
      animationNames: ["move", "attack"],
      unlockStage: 37,
      monsterType: MonsterType.BOSS,
      key: "b_0_011"
    },
    {
      id: 10017,
      name: "光明审判者",
      description: "神圣光明的审判者，净化一切邪恶。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_012",
      spineSkinName: "b_0_011",
      animationNames: ["move", "attack"],
      unlockStage: 43,
      monsterType: MonsterType.BOSS,
      key: "b_0_012"
    },
    {
      id: 10018,
      name: "虚空吞噬者",
      description: "来自虚空的恐怖存在，能够吞噬一切。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_013",
      spineSkinName: "b_0_013",
      animationNames: ["move", "attack"],
      unlockStage: 43,
      monsterType: MonsterType.BOSS,
      key: "b_0_013"
    },
    {
      id: 10019,
      name: "混沌之王",
      description: "混沌力量的化身，攻击模式变幻莫测。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_014",
      spineSkinName: "b_0_014",
      animationNames: ["move", "attack"],
      unlockStage: 43,
      monsterType: MonsterType.BOSS,
      key: "b_0_014"
    },
    {
      id: 10020,
      name: "时空守护者",
      description: "守护时空秩序的古老存在，拥有时间操控能力。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_015",
      spineSkinName: "b_0_014",
      animationNames: ["move", "attack"],
      unlockStage: 49,
      monsterType: MonsterType.BOSS,
      key: "b_0_015"
    },
    {
      id: 10021,
      name: "星辰毁灭者",
      description: "能够毁灭星辰的恐怖存在，力量无法估量。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_016",
      spineSkinName: "b_0_012",
      animationNames: ["move", "attack"],
      unlockStage: 49,
      monsterType: MonsterType.BOSS,
      key: "b_0_016"
    },
    {
      id: 10022,
      name: "终极魔神",
      description: "传说中的终极魔神，拥有毁天灭地的力量。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_0_017",
      spineSkinName: "b_0_017",
      animationNames: ["move", "attack"],
      unlockStage: 49,
      monsterType: MonsterType.BOSS,
      key: "b_0_017"
    },
    {
      id: 10023,
      name: "深渊霸主",
      description: "深渊中的绝对统治者，拥有无尽的黑暗力量。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_007",
      spineSkinName: "b_1_007",
      animationNames: ["move", "attack"],
      unlockStage: 55,
      monsterType: MonsterType.BOSS,
      key: "b_1_007"
    },
    {
      id: 10024,
      name: "炼狱魔王",
      description: "炼狱之主，掌控地狱烈火的恐怖存在。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_008",
      spineSkinName: "b_1_008",
      animationNames: ["move", "attack"],
      unlockStage: 55,
      monsterType: MonsterType.BOSS,
      key: "b_1_008"
    },
    {
      id: 10025,
      name: "极冰帝王",
      description: "冰雪世界的帝王，能够冻结时间与空间。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_009",
      spineSkinName: "b_1_009",
      animationNames: ["move", "attack"],
      unlockStage: 55,
      monsterType: MonsterType.BOSS,
      key: "b_1_009"
    },
    {
      id: 10026,
      name: "雷神之怒",
      description: "雷神的化身，掌控天地间所有雷电之力。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_010",
      spineSkinName: "b_1_010",
      animationNames: ["move", "attack"],
      unlockStage: 61,
      monsterType: MonsterType.BOSS,
      key: "b_1_010"
    },
    {
      id: 10027,
      name: "毒瘴之王",
      description: "剧毒沼泽的绝对主宰，毒气能腐蚀一切。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_011",
      spineSkinName: "b_1_011",
      animationNames: ["move", "attack"],
      unlockStage: 61,
      monsterType: MonsterType.BOSS,
      key: "b_1_011"
    },
    {
      id: 10028,
      name: "圣光裁决者",
      description: "神圣力量的执行者，审判一切邪恶与黑暗。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_012",
      spineSkinName: "b_1_012",
      animationNames: ["move", "attack"],
      unlockStage: 61,
      monsterType: MonsterType.BOSS,
      key: "b_1_012"
    },
    {
      id: 10029,
      name: "虚无吞噬者",
      description: "来自虚无的终极掠夺者，能够吞噬整个世界。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_013",
      spineSkinName: "b_1_013",
      animationNames: ["move", "attack"],
      unlockStage: 67,
      monsterType: MonsterType.BOSS,
      key: "b_1_013"
    },
    {
      id: 10030,
      name: "混沌创世者",
      description: "混沌的创造者，拥有重塑世界的恐怖力量。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_014",
      spineSkinName: "b_1_014",
      animationNames: ["move", "attack"],
      unlockStage: 67,
      monsterType: MonsterType.BOSS,
      key: "b_1_014"
    },
    {
      id: 10031,
      name: "时空主宰",
      description: "时空的绝对主宰，能够操控过去、现在与未来。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_015",
      spineSkinName: "b_1_015",
      animationNames: ["move", "attack"],
      unlockStage: 67,
      monsterType: MonsterType.BOSS,
      key: "b_1_015"
    },
    {
      id: 10032,
      name: "宇宙毁灭者",
      description: "能够毁灭整个宇宙的终极存在，力量超越想象。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_016",
      spineSkinName: "b_1_015",
      animationNames: ["move", "attack"],
      unlockStage: 73,
      monsterType: MonsterType.BOSS,
      key: "b_1_016"
    },
    {
      id: 10033,
      name: "永恒支配者",
      description: "永恒的支配者，超越生死的至高存在。",
      iconFrameName: "",
      resourceType: "spine",
      resourceDir: "spine/boss/b_1_017",
      spineSkinName: "b_0_016",
      animationNames: ["move", "attack"],
      unlockStage: 73,
      monsterType: MonsterType.BOSS,
      key: "b_1_017"
    },


  ];


//普通怪物 
//resourceDir:"anim/monster"
//animationNames [xxx,xxx_atk] xxx=m_n_1_001   如 "animationNames": ["m_n_1_001","m_n_1_001_atk"]
//spineSkinName 统一 为空‘’
//unlockStage 关卡解锁

  export const monsterCatalogEntries_normal: MonsterCatalogEntry[] = [
    // Stage 1-6
    {
      id: 11000,
      name: "骷髅兵",
      description: "骷髅战士，曾经的守卫者如今只剩残骸。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_n_0_001", "m_n_0_001_atk"],
      unlockStage: 1,
      monsterType: MonsterType.NORMAL,
      key: "m_n_0_001"
    },
    {
      id: 11001,
      name: "吸血蝙蝠",
      description: "潜伏于黑暗的吸血者。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_n_0_002", "m_n_0_002_atk"],
      unlockStage: 1,
      monsterType: MonsterType.NORMAL,
      key: "m_n_0_002"
    },
    {
      id: 11002,
      name: "夜魇魔女",
      description: "施放黑暗魔法的巫师。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_n_1_001", "m_n_1_001_atk"],
      unlockStage: 1,
      monsterType: MonsterType.NORMAL,
      key: "m_n_1_001"
    },
  
    // Stage 7-12
    {
      id: 11003,
      name: "泥沼吞噬者",
      description: "泥潭中的怪物，缓慢却致命。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_n_0_003", "m_n_0_003_atk"],
      unlockStage: 7,
      monsterType: MonsterType.NORMAL,
      key: "m_n_0_003"
    },
    {
      id: 11004,
      name: "魂灵侍者",
      description: "服侍死者的幽魂。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_n_0_004", "m_n_0_004_atk"],
      unlockStage: 7,
      monsterType: MonsterType.NORMAL,
      key: "m_n_0_004"
    },
    {
      id: 11005,
      name: "娜迦海妖",
      description: "歌声令人迷失的娜迦族。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_n_1_002", "m_n_1_002_atk"],
      unlockStage: 7,
      monsterType: MonsterType.NORMAL,
      key: "m_n_1_002"
    },
  
    // Stage 13-18
    {
      id: 11006,
      name: "暴走卫士",
      description: "疯狂失控的守护者。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_n_0_005", "m_n_0_005_atk"],
      unlockStage: 13,
      monsterType: MonsterType.NORMAL,
      key: "m_n_0_005"
    },
    {
      id: 11007,
      name: "食人魔狂战",
      description: "嗜血残暴的食人魔战士。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_n_0_006", "m_n_0_006_atk"],
      unlockStage: 13,
      monsterType: MonsterType.NORMAL,
      key: "m_n_0_006"
    },
    {
      id: 11008,
      name: "亡魂收割者",
      description: "操控灵魂的远程刺客。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_n_1_003", "m_n_1_003_atk"],
      unlockStage: 13,
      monsterType: MonsterType.NORMAL,
      key: "m_n_1_003"
    },
  
    // Stage 19-24
    {
      id: 11009,
      name: "石心战士",
      description: "石之躯体，不动如山。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_n_0_007", "m_n_0_007_atk"],
      unlockStage: 19,
      monsterType: MonsterType.NORMAL,
      key: "m_n_0_007"
    },
    {
      id: 11010,
      name: "锤命巨人",
      description: "巨锤一挥，震碎大地。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_n_0_008", "m_n_0_008_atk"],
      unlockStage: 19,
      monsterType: MonsterType.NORMAL,
      key: "m_n_0_008"
    },
    {
      id: 11011,
      name: "虚空魔蝶",
      description: "虚空降临者，翅膀裹挟着死亡。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_n_1_004", "m_n_1_004_atk"],
      unlockStage: 19,
      monsterType: MonsterType.NORMAL,
      key: "m_n_1_004"
    },


    // Stage 25+ 新增怪物
  {
    id: 11012,
    name: "幽影刺客",
    description: "潜行于暗影中的杀手，攻击迅猛致命。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_009", "m_n_0_009_atk"],
    unlockStage: 25,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_009"
  },
  {
    id: 11013,
    name: "钢铁守卫",
    description: "身披重甲的机械战士，防御力惊人。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_010", "m_n_0_010_atk"],
    unlockStage: 25,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_010"
  },
  {
    id: 11014,
    name: "烈焰魔蛛",
    description: "喷射火焰的巨型蜘蛛，攻击带有灼烧效果。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_011", "m_n_0_011_atk"],
    unlockStage: 25,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_011"
  },
  {
    id: 11015,
    name: "冰霜巨狼",
    description: "来自极地的巨狼，攻击附带冰冻效果。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_012", "m_n_0_012_atk"],
    unlockStage: 25,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_012"
  },
  {
    id: 11016,
    name: "雷电法师",
    description: "掌控雷电之力的法师，远程攻击威力巨大。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_013", "m_n_0_013_atk"],
    unlockStage: 25,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_013"
  },
  {
    id: 11017,
    name: "毒液喷射者",
    description: "能够喷射剧毒液体的怪物，攻击带有中毒效果。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_014", "m_n_0_014_atk"],
    unlockStage: 31,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_014"
  },
  {
    id: 11018,
    name: "暗影猎手",
    description: "擅长远程狙击的暗影生物，攻击精准致命。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_015", "m_n_0_015_atk"],
    unlockStage: 31,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_015"
  },
  {
    id: 11019,
    name: "岩浆巨兽",
    description: "由岩浆构成的巨型怪物，攻击带有火焰伤害。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_016", "m_n_0_016_atk"],
    unlockStage: 31,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_016"
  },
  {
    id: 11020,
    name: "风暴之眼",
    description: "操控风暴的神秘生物，攻击范围极广。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_017", "m_n_0_017_atk"],
    unlockStage: 31,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_017"
  },
  {
    id: 11021,
    name: "深渊恶魔",
    description: "来自深渊的恶魔，拥有强大的黑暗力量。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_018", "m_n_0_018_atk"],
    unlockStage: 37,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_018"
  },
  {
    id: 11022,
    name: "水晶守护者",
    description: "由水晶构成的守护者，能够反射部分伤害。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_019", "m_n_0_019_atk"],
    unlockStage: 37,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_019"
  },
  {
    id: 11023,
    name: "虚空掠夺者",
    description: "来自虚空的掠夺者，能够吞噬敌人的生命力。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_020", "m_n_0_020_atk"],
    unlockStage: 37,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_020"
  },
  {
    id: 11024,
    name: "光明审判者",
    description: "神圣的审判者，攻击带有净化效果。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_021", "m_n_0_021_atk"],
    unlockStage: 37,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_021"
  },
  {
    id: 11025,
    name: "混沌之子",
    description: "混沌力量的化身，攻击模式难以预测。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_022", "m_n_0_022_atk"],
    unlockStage: 43,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_022"
  },
  {
    id: 11026,
    name: "时空扭曲者",
    description: "能够操控时空的神秘存在，攻击带有时间延迟效果。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_023", "m_n_0_023_atk"],
    unlockStage: 43,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_023"
  },
  {
    id: 11027,
    name: "星辰守望者",
    description: "来自星空的守望者，拥有预知未来的能力。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_024", "m_n_0_024_atk"],
    unlockStage: 43,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_024"
  },
  {
    id: 11028,
    name: "末日使者",
    description: "预示着末日降临的使者，攻击威力极其恐怖。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_025", "m_n_0_025_atk"],
    unlockStage: 43,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_025"
  },
  {
    id: 11029,
    name: "永恒之王",
    description: "不朽的王者，拥有无尽的生命力和强大的统治力。",
    iconFrameName: "",
    resourceType: "anim",
    resourceDir: "anim/monster",
    spineSkinName: "",
    animationNames: ["m_n_0_026", "m_n_0_026_atk"],
    unlockStage: 49,
    monsterType: MonsterType.NORMAL,
    key: "m_n_0_026"
  }
  ];




  //精英怪物
  //resourceDir:"anim/monster"
  //animationNames [xxx,xxx_atk] xxx=m_s_0_001   如 "animationNames": ["m_s_0_001","m_s_0_001_atk"]
  //spineSkinName 统一 为空‘’
  //unlockStage 关卡解锁
  //monsterType 统一为 MonsterType.ELITE
  export const monsterCatalogEntries_elite: MonsterCatalogEntry[] = [
    {
      id: 20001,
      name: "双头斧王",
      description: "拥有双斧的狂战士，近战杀伤力极强。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_001", "m_s_0_001_atk"],
      unlockStage: 1,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_001"
    },
    {
      id: 20002,
      name: "磐石怪人",
      description: "由岩石构成的巨怪，行动缓慢但防御极高。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_002", "m_s_0_002_atk"],
      unlockStage: 1 ,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_002"
    },
    {
      id: 20003,
      name: "大地破坏者",
      description: "震撼地面的猛士，擅长冲撞和范围打击。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_003", "m_s_0_003_atk"],
      unlockStage: 7,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_003"
    },
    {
      id: 20004,
      name: "海潮守卫",
      description: "来自深海的战士，攻击带有水属性。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_004", "m_s_0_004_atk"],
      unlockStage: 7,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_004"
    },
    {
      id: 20005,
      name: "花蝙法老",
      description: "神秘的蝙蝠魔法生物，精通黑暗魔法。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_1_001", "m_s_1_001_atk"],
      unlockStage: 13,
      monsterType: MonsterType.ELITE,
      key: "m_s_1_001"
    },
    {
      id: 20006,
      name: "毒钩嗜血者",
      description: "操控毒素的远程杀手，攻击附带中毒效果。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_1_002", "m_s_1_002_atk"],
      unlockStage: 13,
      monsterType: MonsterType.ELITE,
      key: "m_s_1_002"
    },
    {
      id: 20007,
      name: "夜鹰",
      description: "黑夜中的猎杀者，飞行速度极快。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_1_003", "m_s_1_003_atk"],
      unlockStage: 19,
      monsterType: MonsterType.ELITE,
      key: "m_s_1_003"
    },
    {
      id: 20008,
      name: "双首蛇龟",
      description: "混合生物，拥有剧毒与护甲的双重特性。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_1_004", "m_s_1_004_atk"],
      unlockStage: 19,
      monsterType: MonsterType.ELITE,
      key: "m_s_1_004"
    },
       {
      id: 20009,
      name: "超级石头怪",
      description: "新添精英怪。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_005", "m_s_0_005_atk"],
      unlockStage: 19,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_005"
    },
    {
      id: 20010,
      name: "烈焰战士",
      description: "掌握火焰力量的精英战士，攻击带有灼烧效果。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_006", "m_s_0_006_atk"],
      unlockStage: 20,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_006"
    },
    {
      id: 20011,
      name: "冰霜守卫",
      description: "身披冰甲的精英守卫，能够减缓敌人移动速度。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_007", "m_s_0_007_atk"],
      unlockStage: 21,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_007"
    },
    {
      id: 20012,
      name: "雷电法师",
      description: "操控雷电之力的精英法师，攻击具有麻痹效果。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_008", "m_s_0_008_atk"],
      unlockStage: 22,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_008"
    },
    {
      id: 20013,
      name: "毒刺刺客",
      description: "行动敏捷的毒系刺客，攻击附带持续毒伤害。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_009", "m_s_0_009_atk"],
      unlockStage: 23,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_009"
    },
    {
      id: 20014,
      name: "岩石巨人",
      description: "由坚硬岩石构成的巨型精英怪物，拥有极高的防御力。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_010", "m_s_0_010_atk"],
      unlockStage: 24,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_010"
    },
    {
      id: 20015,
      name: "暗影潜行者",
      description: "隐匿在阴影中的精英杀手，擅长偷袭和暴击。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_011", "m_s_0_011_atk"],
      unlockStage: 25,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_011"
    },
    {
      id: 20016,
      name: "风暴召唤师",
      description: "能够召唤风暴的精英法师，攻击范围广阔。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_012", "m_s_0_012_atk"],
      unlockStage: 26,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_012"
    },
    {
      id: 20017,
      name: "血腥屠夫",
      description: "嗜血成性的精英战士，攻击力随血量降低而提升。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_013", "m_s_0_013_atk"],
      unlockStage: 27,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_013"
    },
    {
      id: 20018,
      name: "圣光骑士",
      description: "被圣光祝福的精英骑士，拥有治疗和净化能力。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_014", "m_s_0_014_atk"],
      unlockStage: 28,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_014"
    },
    {
      id: 20019,
      name: "虚空行者",
      description: "来自虚空的神秘精英生物，能够穿越空间进行攻击。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_015", "m_s_0_015_atk"],
      unlockStage: 29,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_015"
    },
    {
      id: 20020,
      name: "机械战甲",
      description: "高科技机械精英单位，装备各种先进武器系统。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_016", "m_s_0_016_atk"],
      unlockStage: 30,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_016"
    },
    {
      id: 20021,
      name: "龙血战士",
      description: "拥有龙族血脉的精英战士，攻击附带龙息效果。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_017", "m_s_0_017_atk"],
      unlockStage: 31,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_017"
    },
    {
      id: 20022,
      name: "星辰法师",
      description: "操控星辰之力的精英法师，能够召唤流星攻击。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_018", "m_s_0_018_atk"],
      unlockStage: 32,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_018"
    },
    {
      id: 20023,
      name: "深渊恶魔",
      description: "来自深渊的邪恶精英恶魔，拥有强大的黑暗魔法。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_019", "m_s_0_019_atk"],
      unlockStage: 33,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_019"
    },
    {
      id: 20024,
      name: "时空守护者",
      description: "掌控时空力量的终极精英守护者，能够操控时间流速。",
      iconFrameName: "",
      resourceType: "anim",
      resourceDir: "anim/monster",
      spineSkinName: "",
      animationNames: ["m_s_0_020", "m_s_0_020_atk"],
      unlockStage: 34,
      monsterType: MonsterType.ELITE,
      key: "m_s_0_020"
    },
  ];



  
  