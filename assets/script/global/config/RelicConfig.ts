// 中文圣物配置文件
export enum SkillEffectType {
    ATTACK = "attack", // 攻击力
    MAXHP = "maxhp", // 最大生命
    DEFENSE = "defense", // 防御力
    DAMAGE_REDUCTION = "damageReduction", // 攻击百分比
    SKILL_COOLDOWN = "skill_cooldown", // 技能冷却缩短
    CRIT_RATE = "crit_rate", // 暴击率
    CRIT_DAMAGE = "crit_damage" // 暴击伤害
}

export enum ClassType {
    ALL = 99 // 全职业
}

export interface SkillEffect {
    type: SkillEffectType;
    value: number;
    targetClass: ClassType;
    description?: string;
}

export interface RelicConfig {
    id: number;
    name: string;
    desc: string;
    quality: number;
    position: number;
    iconFrameName: string;
    setIds: number[];
    skillEffects: SkillEffect[];
}

export const relicConfigs: RelicConfig[] = [
    {
        id: 1001,
        name: "普通圣物 I",
        desc: "普通品质，属性加成",
        quality: 1,
        position: 1,
        iconFrameName: "relic_1_1",
        setIds: [1002, 1004],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 20, targetClass: ClassType.ALL, description: "增加攻击力20" },
        { type: SkillEffectType.MAXHP, value: 0.04, targetClass: ClassType.ALL, description: "最大生命提升4%" }
        ]
    },
    {
        id: 1002,
        name: "普通圣物 II",
        desc: "普通品质，属性加成",
        quality: 1,
        position: 2,
        iconFrameName: "relic_2_1",
        setIds: [],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 20, targetClass: ClassType.ALL, description: "增加攻击力20" },
        { type: SkillEffectType.MAXHP, value: 0.04, targetClass: ClassType.ALL, description: "最大生命提升4%" }
        ]
    },
    {
        id: 1003,
        name: "普通圣物 III",
        desc: "普通品质，属性加成",
        quality: 1,
        position: 3,
        iconFrameName: "relic_3_1",
        setIds: [],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 20, targetClass: ClassType.ALL, description: "增加攻击力20" },
        { type: SkillEffectType.MAXHP, value: 0.04, targetClass: ClassType.ALL, description: "最大生命提升4%" }
        ]
    },
    {
        id: 1004,
        name: "普通圣物 IV",
        desc: "普通品质，属性加成",
        quality: 1,
        position: 4,
        iconFrameName: "relic_4_1",
        setIds: [],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 20, targetClass: ClassType.ALL, description: "增加攻击力20" },
        { type: SkillEffectType.MAXHP, value: 0.04, targetClass: ClassType.ALL, description: "最大生命提升4%" }
        ]
    },
    {
        id: 1005,
        name: "普通圣物 V",
        desc: "普通品质，属性加成",
        quality: 1,
        position: 5,
        iconFrameName: "relic_5_1",
        setIds: [],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 20, targetClass: ClassType.ALL, description: "增加攻击力20" },
        { type: SkillEffectType.MAXHP, value: 0.04, targetClass: ClassType.ALL, description: "最大生命提升4%" }
        ]
    },
    {
        id: 1006,
        name: "普通圣物 VI",
        desc: "普通品质，属性加成",
        quality: 1,
        position: 6,
        iconFrameName: "relic_6_1",
        setIds: [],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 20, targetClass: ClassType.ALL, description: "增加攻击力20" },
        { type: SkillEffectType.MAXHP, value: 0.04, targetClass: ClassType.ALL, description: "最大生命提升4%" }
        ]
    },
    {
        id: 1007,
        name: "精良圣物 I",
        desc: "精良品质，属性加成",
        quality: 2,
        position: 1,
        iconFrameName: "relic_1_2",
        setIds: [],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 40, targetClass: ClassType.ALL, description: "增加攻击力40" },
        { type: SkillEffectType.MAXHP, value: 0.08, targetClass: ClassType.ALL, description: "最大生命提升8%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.1, targetClass: ClassType.ALL, description: "技能冷却提升10%" }
        ]
    },
    {
        id: 1008,
        name: "精良圣物 II",
        desc: "精良品质，属性加成",
        quality: 2,
        position: 2,
        iconFrameName: "relic_2_2",
        setIds: [],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 40, targetClass: ClassType.ALL, description: "增加攻击力40" },
        { type: SkillEffectType.MAXHP, value: 0.08, targetClass: ClassType.ALL, description: "最大生命提升8%" },
        { type: SkillEffectType.DEFENSE, value: 0.06, targetClass: ClassType.ALL, description: "防御力提升6%" }
        ]
    },
    {
        id: 1009,
        name: "精良圣物 III",
        desc: "精良品质，属性加成",
        quality: 2,
        position: 3,
        iconFrameName: "relic_3_2",
        setIds: [],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 40, targetClass: ClassType.ALL, description: "增加攻击力40" },
        { type: SkillEffectType.MAXHP, value: 0.08, targetClass: ClassType.ALL, description: "最大生命提升8%" },
        { type: SkillEffectType.DEFENSE, value: 0.06, targetClass: ClassType.ALL, description: "防御力提升6%" }
        ]
    },
    {
        id: 1010,
        name: "精良圣物 IV",
        desc: "精良品质，属性加成",
        quality: 2,
        position: 4,
        iconFrameName: "relic_4_2",
        setIds: [1001, 1002, 1003],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 40, targetClass: ClassType.ALL, description: "增加攻击力40" },
        { type: SkillEffectType.MAXHP, value: 0.08, targetClass: ClassType.ALL, description: "最大生命提升8%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.1, targetClass: ClassType.ALL, description: "技能冷却提升10%" }
        ]
    },
    {
        id: 1011,
        name: "精良圣物 V",
        desc: "精良品质，属性加成",
        quality: 2,
        position: 5,
        iconFrameName: "relic_5_2",
        setIds: [],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 40, targetClass: ClassType.ALL, description: "增加攻击力40" },
        { type: SkillEffectType.MAXHP, value: 0.08, targetClass: ClassType.ALL, description: "最大生命提升8%" },
        { type: SkillEffectType.DEFENSE, value: 0.06, targetClass: ClassType.ALL, description: "防御力提升6%" }
        ]
    },
    {
        id: 1012,
        name: "精良圣物 VI",
        desc: "精良品质，属性加成",
        quality: 2,
        position: 6,
        iconFrameName: "relic_6_2",
        setIds: [1001],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 40, targetClass: ClassType.ALL, description: "增加攻击力40" },
        { type: SkillEffectType.MAXHP, value: 0.08, targetClass: ClassType.ALL, description: "最大生命提升8%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.1, targetClass: ClassType.ALL, description: "技能冷却提升10%" }
        ]
    },
    {
        id: 1013,
        name: "稀有圣物 I",
        desc: "稀有品质，属性加成",
        quality: 3,
        position: 1,
        iconFrameName: "relic_1_3",
        setIds: [1001, 1003, 1004],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 60, targetClass: ClassType.ALL, description: "增加攻击力60" },
        { type: SkillEffectType.MAXHP, value: 0.12, targetClass: ClassType.ALL, description: "最大生命提升12%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.12, targetClass: ClassType.ALL, description: "暴击率提升12%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.15, targetClass: ClassType.ALL, description: "技能冷却提升15%" }
        ]
    },
    {
        id: 1014,
        name: "稀有圣物 II",
        desc: "稀有品质，属性加成",
        quality: 3,
        position: 2,
        iconFrameName: "relic_2_3",
        setIds: [1001, 1003],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 60, targetClass: ClassType.ALL, description: "增加攻击力60" },
        { type: SkillEffectType.MAXHP, value: 0.12, targetClass: ClassType.ALL, description: "最大生命提升12%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.15, targetClass: ClassType.ALL, description: "技能冷却提升15%" },
        { type: SkillEffectType.DEFENSE, value: 0.09, targetClass: ClassType.ALL, description: "防御力提升9%" }
        ]
    },
    {
        id: 1015,
        name: "稀有圣物 III",
        desc: "稀有品质，属性加成",
        quality: 3,
        position: 3,
        iconFrameName: "relic_3_3",
        setIds: [1000, 1001, 1004],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 60, targetClass: ClassType.ALL, description: "增加攻击力60" },
        { type: SkillEffectType.MAXHP, value: 0.12, targetClass: ClassType.ALL, description: "最大生命提升12%" },
        { type: SkillEffectType.DEFENSE, value: 0.09, targetClass: ClassType.ALL, description: "防御力提升9%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.12, targetClass: ClassType.ALL, description: "暴击率提升12%" }
        ]
    },
    {
        id: 1016,
        name: "稀有圣物 IV",
        desc: "稀有品质，属性加成",
        quality: 3,
        position: 4,
        iconFrameName: "relic_4_3",
        setIds: [1005],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 60, targetClass: ClassType.ALL, description: "增加攻击力60" },
        { type: SkillEffectType.MAXHP, value: 0.12, targetClass: ClassType.ALL, description: "最大生命提升12%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.12, targetClass: ClassType.ALL, description: "暴击率提升12%" },
        { type: SkillEffectType.DEFENSE, value: 0.09, targetClass: ClassType.ALL, description: "防御力提升9%" }
        ]
    },
    {
        id: 1017,
        name: "稀有圣物 V",
        desc: "稀有品质，属性加成",
        quality: 3,
        position: 5,
        iconFrameName: "relic_5_3",
        setIds: [],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 60, targetClass: ClassType.ALL, description: "增加攻击力60" },
        { type: SkillEffectType.MAXHP, value: 0.12, targetClass: ClassType.ALL, description: "最大生命提升12%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.24, targetClass: ClassType.ALL, description: "暴击伤害提升24%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.15, targetClass: ClassType.ALL, description: "技能冷却提升15%" }
        ]
    },
    {
        id: 1018,
        name: "稀有圣物 VI",
        desc: "稀有品质，属性加成",
        quality: 3,
        position: 6,
        iconFrameName: "relic_6_3",
        setIds: [1000, 1003, 1004],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 60, targetClass: ClassType.ALL, description: "增加攻击力60" },
        { type: SkillEffectType.MAXHP, value: 0.12, targetClass: ClassType.ALL, description: "最大生命提升12%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.15, targetClass: ClassType.ALL, description: "技能冷却提升15%" },
        { type: SkillEffectType.DEFENSE, value: 0.09, targetClass: ClassType.ALL, description: "防御力提升9%" }
        ]
    },
    {
        id: 1019,
        name: "史诗圣物 I",
        desc: "史诗品质，属性加成",
        quality: 4,
        position: 1,
        iconFrameName: "relic_1_4",
        setIds: [1000, 1004, 1005],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 80, targetClass: ClassType.ALL, description: "增加攻击力80" },
        { type: SkillEffectType.MAXHP, value: 0.16, targetClass: ClassType.ALL, description: "最大生命提升16%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.16, targetClass: ClassType.ALL, description: "暴击率提升16%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.32, targetClass: ClassType.ALL, description: "暴击伤害提升32%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.2, targetClass: ClassType.ALL, description: "技能冷却提升20%" }
        ]
    },
    {
        id: 1020,
        name: "史诗圣物 II",
        desc: "史诗品质，属性加成",
        quality: 4,
        position: 2,
        iconFrameName: "relic_2_4",
        setIds: [1002, 1005],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 80, targetClass: ClassType.ALL, description: "增加攻击力80" },
        { type: SkillEffectType.MAXHP, value: 0.16, targetClass: ClassType.ALL, description: "最大生命提升16%" },
        { type: SkillEffectType.DEFENSE, value: 0.12, targetClass: ClassType.ALL, description: "防御力提升12%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.32, targetClass: ClassType.ALL, description: "暴击伤害提升32%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.16, targetClass: ClassType.ALL, description: "暴击率提升16%" }
        ]
    },
    {
        id: 1021,
        name: "史诗圣物 III",
        desc: "史诗品质，属性加成",
        quality: 4,
        position: 3,
        iconFrameName: "relic_3_4",
        setIds: [1005],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 80, targetClass: ClassType.ALL, description: "增加攻击力80" },
        { type: SkillEffectType.MAXHP, value: 0.16, targetClass: ClassType.ALL, description: "最大生命提升16%" },
        { type: SkillEffectType.DEFENSE, value: 0.12, targetClass: ClassType.ALL, description: "防御力提升12%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.32, targetClass: ClassType.ALL, description: "暴击伤害提升32%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.16, targetClass: ClassType.ALL, description: "暴击率提升16%" }
        ]
    },
    {
        id: 1022,
        name: "史诗圣物 IV",
        desc: "史诗品质，属性加成",
        quality: 4,
        position: 4,
        iconFrameName: "relic_4_4",
        setIds: [1001, 1002],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 80, targetClass: ClassType.ALL, description: "增加攻击力80" },
        { type: SkillEffectType.MAXHP, value: 0.16, targetClass: ClassType.ALL, description: "最大生命提升16%" },
        { type: SkillEffectType.DEFENSE, value: 0.12, targetClass: ClassType.ALL, description: "防御力提升12%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.32, targetClass: ClassType.ALL, description: "暴击伤害提升32%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.2, targetClass: ClassType.ALL, description: "技能冷却提升20%" }
        ]
    },
    {
        id: 1023,
        name: "史诗圣物 V",
        desc: "史诗品质，属性加成",
        quality: 4,
        position: 5,
        iconFrameName: "relic_5_4",
        setIds: [1001, 1002, 1005],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 80, targetClass: ClassType.ALL, description: "增加攻击力80" },
        { type: SkillEffectType.MAXHP, value: 0.16, targetClass: ClassType.ALL, description: "最大生命提升16%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.2, targetClass: ClassType.ALL, description: "技能冷却提升20%" },
        { type: SkillEffectType.DEFENSE, value: 0.12, targetClass: ClassType.ALL, description: "防御力提升12%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.16, targetClass: ClassType.ALL, description: "暴击率提升16%" }
        ]
    },
    {
        id: 1024,
        name: "史诗圣物 VI",
        desc: "史诗品质，属性加成",
        quality: 4,
        position: 6,
        iconFrameName: "relic_6_4",
        setIds: [1000, 1005],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 80, targetClass: ClassType.ALL, description: "增加攻击力80" },
        { type: SkillEffectType.MAXHP, value: 0.16, targetClass: ClassType.ALL, description: "最大生命提升16%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.16, targetClass: ClassType.ALL, description: "暴击率提升16%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.2, targetClass: ClassType.ALL, description: "技能冷却提升20%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.32, targetClass: ClassType.ALL, description: "暴击伤害提升32%" }
        ]
    },
    {
        id: 1025,
        name: "传说圣物 I",
        desc: "传说品质，属性加成",
        quality: 5,
        position: 1,
        iconFrameName: "relic_1_5",
        setIds: [],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 100, targetClass: ClassType.ALL, description: "增加攻击力100" },
        { type: SkillEffectType.MAXHP, value: 0.2, targetClass: ClassType.ALL, description: "最大生命提升20%" },
        { type: SkillEffectType.DEFENSE, value: 0.15, targetClass: ClassType.ALL, description: "防御力提升15%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.4, targetClass: ClassType.ALL, description: "暴击伤害提升40%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.25, targetClass: ClassType.ALL, description: "技能冷却提升25%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.2, targetClass: ClassType.ALL, description: "暴击率提升20%" }
        ]
    },
    {
        id: 1026,
        name: "传说圣物 II",
        desc: "传说品质，属性加成",
        quality: 5,
        position: 2,
        iconFrameName: "relic_2_5",
        setIds: [1001, 1003],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 100, targetClass: ClassType.ALL, description: "增加攻击力100" },
        { type: SkillEffectType.MAXHP, value: 0.2, targetClass: ClassType.ALL, description: "最大生命提升20%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.4, targetClass: ClassType.ALL, description: "暴击伤害提升40%" },
        { type: SkillEffectType.DEFENSE, value: 0.15, targetClass: ClassType.ALL, description: "防御力提升15%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.25, targetClass: ClassType.ALL, description: "技能冷却提升25%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.2, targetClass: ClassType.ALL, description: "暴击率提升20%" }
        ]
    },
    {
        id: 1027,
        name: "传说圣物 III",
        desc: "传说品质，属性加成",
        quality: 5,
        position: 3,
        iconFrameName: "relic_3_5",
        setIds: [1002, 1004, 1005],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 100, targetClass: ClassType.ALL, description: "增加攻击力100" },
        { type: SkillEffectType.MAXHP, value: 0.2, targetClass: ClassType.ALL, description: "最大生命提升20%" },
        { type: SkillEffectType.DEFENSE, value: 0.15, targetClass: ClassType.ALL, description: "防御力提升15%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.2, targetClass: ClassType.ALL, description: "暴击率提升20%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.25, targetClass: ClassType.ALL, description: "技能冷却提升25%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.4, targetClass: ClassType.ALL, description: "暴击伤害提升40%" }
        ]
    },
    {
        id: 1028,
        name: "传说圣物 IV",
        desc: "传说品质，属性加成",
        quality: 5,
        position: 4,
        iconFrameName: "relic_4_5",
        setIds: [],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 100, targetClass: ClassType.ALL, description: "增加攻击力100" },
        { type: SkillEffectType.MAXHP, value: 0.2, targetClass: ClassType.ALL, description: "最大生命提升20%" },
        { type: SkillEffectType.DEFENSE, value: 0.15, targetClass: ClassType.ALL, description: "防御力提升15%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.25, targetClass: ClassType.ALL, description: "技能冷却提升25%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.4, targetClass: ClassType.ALL, description: "暴击伤害提升40%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.2, targetClass: ClassType.ALL, description: "暴击率提升20%" }
        ]
    },
    {
        id: 1029,
        name: "传说圣物 V",
        desc: "传说品质，属性加成",
        quality: 5,
        position: 5,
        iconFrameName: "relic_5_5",
        setIds: [1001, 1002, 1004],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 100, targetClass: ClassType.ALL, description: "增加攻击力100" },
        { type: SkillEffectType.MAXHP, value: 0.2, targetClass: ClassType.ALL, description: "最大生命提升20%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.4, targetClass: ClassType.ALL, description: "暴击伤害提升40%" },
        { type: SkillEffectType.DEFENSE, value: 0.15, targetClass: ClassType.ALL, description: "防御力提升15%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.2, targetClass: ClassType.ALL, description: "暴击率提升20%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.25, targetClass: ClassType.ALL, description: "技能冷却提升25%" }
        ]
    },
    {
        id: 1030,
        name: "传说圣物 VI",
        desc: "传说品质，属性加成",
        quality: 5,
        position: 6,
        iconFrameName: "relic_6_5",
        setIds: [1002, 1003],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 100, targetClass: ClassType.ALL, description: "增加攻击力100" },
        { type: SkillEffectType.MAXHP, value: 0.2, targetClass: ClassType.ALL, description: "最大生命提升20%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.2, targetClass: ClassType.ALL, description: "暴击率提升20%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.25, targetClass: ClassType.ALL, description: "技能冷却提升25%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.4, targetClass: ClassType.ALL, description: "暴击伤害提升40%" },
        { type: SkillEffectType.DEFENSE, value: 0.15, targetClass: ClassType.ALL, description: "防御力提升15%" }
        ]
    },
    {
        id: 1031,
        name: "神话圣物 I",
        desc: "神话品质，属性加成",
        quality: 6,
        position: 1,
        iconFrameName: "relic_1_6",
        setIds: [1000, 1003, 1005],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 120, targetClass: ClassType.ALL, description: "增加攻击力120" },
        { type: SkillEffectType.MAXHP, value: 0.24, targetClass: ClassType.ALL, description: "最大生命提升24%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.24, targetClass: ClassType.ALL, description: "暴击率提升24%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.48, targetClass: ClassType.ALL, description: "暴击伤害提升48%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.3, targetClass: ClassType.ALL, description: "技能冷却提升30%" },
        { type: SkillEffectType.DEFENSE, value: 0.18, targetClass: ClassType.ALL, description: "防御力提升18%" }
        ]
    },
    {
        id: 1032,
        name: "神话圣物 II",
        desc: "神话品质，属性加成",
        quality: 6,
        position: 2,
        iconFrameName: "relic_2_6",
        setIds: [1000, 1002],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 120, targetClass: ClassType.ALL, description: "增加攻击力120" },
        { type: SkillEffectType.MAXHP, value: 0.24, targetClass: ClassType.ALL, description: "最大生命提升24%" },
        { type: SkillEffectType.DEFENSE, value: 0.18, targetClass: ClassType.ALL, description: "防御力提升18%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.24, targetClass: ClassType.ALL, description: "暴击率提升24%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.3, targetClass: ClassType.ALL, description: "技能冷却提升30%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.48, targetClass: ClassType.ALL, description: "暴击伤害提升48%" }
        ]
    },
    {
        id: 1033,
        name: "神话圣物 III",
        desc: "神话品质，属性加成",
        quality: 6,
        position: 3,
        iconFrameName: "relic_3_6",
        setIds: [1003],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 120, targetClass: ClassType.ALL, description: "增加攻击力120" },
        { type: SkillEffectType.MAXHP, value: 0.24, targetClass: ClassType.ALL, description: "最大生命提升24%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.48, targetClass: ClassType.ALL, description: "暴击伤害提升48%" },
        { type: SkillEffectType.DEFENSE, value: 0.18, targetClass: ClassType.ALL, description: "防御力提升18%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.3, targetClass: ClassType.ALL, description: "技能冷却提升30%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.24, targetClass: ClassType.ALL, description: "暴击率提升24%" }
        ]
    },
    {
        id: 1034,
        name: "神话圣物 IV",
        desc: "神话品质，属性加成",
        quality: 6,
        position: 4,
        iconFrameName: "relic_4_6",
        setIds: [1001],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 120, targetClass: ClassType.ALL, description: "增加攻击力120" },
        { type: SkillEffectType.MAXHP, value: 0.24, targetClass: ClassType.ALL, description: "最大生命提升24%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.48, targetClass: ClassType.ALL, description: "暴击伤害提升48%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.3, targetClass: ClassType.ALL, description: "技能冷却提升30%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.24, targetClass: ClassType.ALL, description: "暴击率提升24%" },
        { type: SkillEffectType.DEFENSE, value: 0.18, targetClass: ClassType.ALL, description: "防御力提升18%" }
        ]
    },
    {
        id: 1035,
        name: "神话圣物 V",
        desc: "神话品质，属性加成",
        quality: 6,
        position: 5,
        iconFrameName: "relic_5_6",
        setIds: [],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 120, targetClass: ClassType.ALL, description: "增加攻击力120" },
        { type: SkillEffectType.MAXHP, value: 0.24, targetClass: ClassType.ALL, description: "最大生命提升24%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.24, targetClass: ClassType.ALL, description: "暴击率提升24%" },
        { type: SkillEffectType.DEFENSE, value: 0.18, targetClass: ClassType.ALL, description: "防御力提升18%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.3, targetClass: ClassType.ALL, description: "技能冷却提升30%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.48, targetClass: ClassType.ALL, description: "暴击伤害提升48%" }
        ]
    },
    {
        id: 1036,
        name: "神话圣物 VI",
        desc: "神话品质，属性加成",
        quality: 6,
        position: 6,
        iconFrameName: "relic_6_6",
        setIds: [1000, 1003],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 120, targetClass: ClassType.ALL, description: "增加攻击力120" },
        { type: SkillEffectType.MAXHP, value: 0.24, targetClass: ClassType.ALL, description: "最大生命提升24%" },
        { type: SkillEffectType.DEFENSE, value: 0.18, targetClass: ClassType.ALL, description: "防御力提升18%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.3, targetClass: ClassType.ALL, description: "技能冷却提升30%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.48, targetClass: ClassType.ALL, description: "暴击伤害提升48%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.24, targetClass: ClassType.ALL, description: "暴击率提升24%" }
        ]
    },
    {
        id: 1037,
        name: "泰坦圣物 I",
        desc: "泰坦品质，至高无上的属性加成",
        quality: 7,
        position: 1,
        iconFrameName: "relic_1_7",
        setIds: [1000, 1003, 1005],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 150, targetClass: ClassType.ALL, description: "增加攻击力150" },
        { type: SkillEffectType.MAXHP, value: 0.3, targetClass: ClassType.ALL, description: "最大生命提升30%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.3, targetClass: ClassType.ALL, description: "暴击率提升30%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.6, targetClass: ClassType.ALL, description: "暴击伤害提升60%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.4, targetClass: ClassType.ALL, description: "技能冷却提升40%" },
        { type: SkillEffectType.DEFENSE, value: 0.25, targetClass: ClassType.ALL, description: "防御力提升25%" },
        { type: SkillEffectType.DAMAGE_REDUCTION, value: 0.2, targetClass: ClassType.ALL, description: "攻击百分比提升20%" }
        ]
    },
    {
        id: 1038,
        name: "泰坦圣物 II",
        desc: "泰坦品质，至高无上的属性加成",
        quality: 7,
        position: 2,
        iconFrameName: "relic_2_7",
        setIds: [1001, 1002, 1004],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 150, targetClass: ClassType.ALL, description: "增加攻击力150" },
        { type: SkillEffectType.MAXHP, value: 0.3, targetClass: ClassType.ALL, description: "最大生命提升30%" },
        { type: SkillEffectType.DEFENSE, value: 0.25, targetClass: ClassType.ALL, description: "防御力提升25%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.3, targetClass: ClassType.ALL, description: "暴击率提升30%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.4, targetClass: ClassType.ALL, description: "技能冷却提升40%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.6, targetClass: ClassType.ALL, description: "暴击伤害提升60%" },
        { type: SkillEffectType.DAMAGE_REDUCTION, value: 0.2, targetClass: ClassType.ALL, description: "攻击百分比提升20%" }
        ]
    },
    {
        id: 1039,
        name: "泰坦圣物 III",
        desc: "泰坦品质，至高无上的属性加成",
        quality: 7,
        position: 3,
        iconFrameName: "relic_3_7",
        setIds: [1000, 1002, 1005],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 150, targetClass: ClassType.ALL, description: "增加攻击力150" },
        { type: SkillEffectType.MAXHP, value: 0.3, targetClass: ClassType.ALL, description: "最大生命提升30%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.6, targetClass: ClassType.ALL, description: "暴击伤害提升60%" },
        { type: SkillEffectType.DEFENSE, value: 0.25, targetClass: ClassType.ALL, description: "防御力提升25%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.4, targetClass: ClassType.ALL, description: "技能冷却提升40%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.3, targetClass: ClassType.ALL, description: "暴击率提升30%" },
        { type: SkillEffectType.DAMAGE_REDUCTION, value: 0.2, targetClass: ClassType.ALL, description: "攻击百分比提升20%" }
        ]
    },
    {
        id: 1040,
        name: "泰坦圣物 IV",
        desc: "泰坦品质，至高无上的属性加成",
        quality: 7,
        position: 4,
        iconFrameName: "relic_4_7",
        setIds: [1001, 1003, 1004],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 150, targetClass: ClassType.ALL, description: "增加攻击力150" },
        { type: SkillEffectType.MAXHP, value: 0.3, targetClass: ClassType.ALL, description: "最大生命提升30%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.6, targetClass: ClassType.ALL, description: "暴击伤害提升60%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.4, targetClass: ClassType.ALL, description: "技能冷却提升40%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.3, targetClass: ClassType.ALL, description: "暴击率提升30%" },
        { type: SkillEffectType.DEFENSE, value: 0.25, targetClass: ClassType.ALL, description: "防御力提升25%" },
        { type: SkillEffectType.DAMAGE_REDUCTION, value: 0.2, targetClass: ClassType.ALL, description: "攻击百分比提升20%" }
        ]
    },
    {
        id: 1041,
        name: "泰坦圣物 V",
        desc: "泰坦品质，至高无上的属性加成",
        quality: 7,
        position: 5,
        iconFrameName: "relic_5_7",
        setIds: [1000, 1001, 1002],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 150, targetClass: ClassType.ALL, description: "增加攻击力150" },
        { type: SkillEffectType.MAXHP, value: 0.3, targetClass: ClassType.ALL, description: "最大生命提升30%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.3, targetClass: ClassType.ALL, description: "暴击率提升30%" },
        { type: SkillEffectType.DEFENSE, value: 0.25, targetClass: ClassType.ALL, description: "防御力提升25%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.4, targetClass: ClassType.ALL, description: "技能冷却提升40%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.6, targetClass: ClassType.ALL, description: "暴击伤害提升60%" },
        { type: SkillEffectType.DAMAGE_REDUCTION, value: 0.2, targetClass: ClassType.ALL, description: "攻击百分比提升20%" }
        ]
    },
    {
        id: 1042,
        name: "泰坦圣物 VI",
        desc: "泰坦品质，至高无上的属性加成",
        quality: 7,
        position: 6,
        iconFrameName: "relic_6_7",
        setIds: [1003, 1004, 1005],
        skillEffects: [
        { type: SkillEffectType.ATTACK, value: 150, targetClass: ClassType.ALL, description: "增加攻击力150" },
        { type: SkillEffectType.MAXHP, value: 0.3, targetClass: ClassType.ALL, description: "最大生命提升30%" },
        { type: SkillEffectType.DEFENSE, value: 0.25, targetClass: ClassType.ALL, description: "防御力提升25%" },
        { type: SkillEffectType.SKILL_COOLDOWN, value: -0.4, targetClass: ClassType.ALL, description: "技能冷却提升40%" },
        { type: SkillEffectType.CRIT_DAMAGE, value: 0.6, targetClass: ClassType.ALL, description: "暴击伤害提升60%" },
        { type: SkillEffectType.CRIT_RATE, value: 0.3, targetClass: ClassType.ALL, description: "暴击率提升30%" },
        { type: SkillEffectType.DAMAGE_REDUCTION, value: 0.2, targetClass: ClassType.ALL, description: "攻击百分比提升20%" }
        ]
    },
];









/**
 * 套装效果结构
 */
export interface RelicSetBonus {
    count: number; // 需要装备的件数
    effects: SkillEffect[]; // 生效的技能加成
}

/**
 * 圣物套装配置接口
 */
export interface RelicSetConfig {
    id: number;             // 套装唯一ID
    name: string;           // 套装名称
    desc: string;           // 套装描述
    icon: string;           // 套装图标（可选）
    quality: number;        // 推荐品质（如 4=史诗）
    bonuses: RelicSetBonus[]; // 不同件数的套装加成
}

// 圣物套装配置（含中文注释）
export const relicSetConfigs = [
    {
        id: 1000,
        name: "龙血套装",
        desc: "激发龙之力量，提升战斗潜能",
        icon: "relic_set_0",
        quality: 5,
        bonuses: [
        {
            count: 2,
            effects: [
                { type: SkillEffectType.ATTACK, value: 100, targetClass: ClassType.ALL, description: "增加攻击力100" }
            ]
        },
        {
            count: 4,
            effects: [
                { type: SkillEffectType.MAXHP, value: 0.15, targetClass: ClassType.ALL, description: "最大生命提升15%" }
            ]
        }
        ]
    },
    {
        id: 1001,
        name: "冰霜套装",
        desc: "寒冰之息环绕全身，减速敌人",
        icon: "relic_set_1",
        quality: 5,
        bonuses: [
        {
            count: 2,
            effects: [
                { type: SkillEffectType.DAMAGE_REDUCTION, value: 0.2, targetClass: ClassType.ALL, description: "增加攻击百分比20%" }
            ]
        },
        {
            count: 4,
            effects: [
                { type: SkillEffectType.DEFENSE, value: 0.12, targetClass: ClassType.ALL, description: "防御力提升12%" }
            ]
        }
        ]
    },
    {
        id: 1002,
        name: "雷霆套装",
        desc: "雷霆之力加持，暴击致命一击",
        icon: "relic_set_2",
        quality: 5,
        bonuses: [
        {
            count: 2,
            effects: [
                { type: SkillEffectType.DEFENSE, value: 0.12, targetClass: ClassType.ALL, description: "防御力提升12%" }
            ]
        },
        {
            count: 4,
            effects: [
                { type: SkillEffectType.MAXHP, value: 0.15, targetClass: ClassType.ALL, description: "最大生命提升15%" }
            ]
        }
        ]
    },
    {
        id: 1003,
        name: "暗影套装",
        desc: "潜行于暗影，适合敏捷职业",
        icon: "relic_set_3",
        quality: 5,
        bonuses: [
        {
            count: 2,
            effects: [
                { type: SkillEffectType.ATTACK, value: 100, targetClass: ClassType.ALL, description: "增加攻击力100" }
            ]
        },
        {
            count: 4,
            effects: [
                { type: SkillEffectType.DAMAGE_REDUCTION, value: 0.2, targetClass: ClassType.ALL, description: "增加攻击百分比20%" }
            ]
        }
        ]
    },
];

