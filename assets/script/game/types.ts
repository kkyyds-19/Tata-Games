/**
 * 本文件根据"技能系统文档"定义了所有核心的数据结构和接口。
 */

/**
 * 通用数值修改器
 * 最终值计算公式: FinalValue = (BaseValue + TotalAdd) * (1 + TotalMultiply)
 */
export interface ValueModifier {
    add?: number;
    multiply?: number;
}

/**
 * 目标选择器
 */
export interface TargetSelector {
    type: 'self' | 'allies';
    count?: number;
    orderBy?: 'hp_percent_asc' | 'hp_percent_desc' | 'attack_asc' | 'attack_desc' | 'random';
    include_self?: boolean;             // 是否包含自己（默认false for allies）
    exclude_self?: boolean;             // 是否排除自己（优先级高于include_self）
    exclude_dead?: boolean;             // 是否排除死亡目标（默认true）
    exclude_full_hp?: boolean;         // 是否排除满血目标（默认false）
    include_full_hp?: boolean;         // 是否强制包含满血目标（优先级高于exclude_full_hp）
}

/**
 * 周期性效果 (如持续治疗/伤害)
 */
export interface TickEffect {
    interval: number;
    modifier: Modifier;
}

/**
 * 单个效果的完整定义
 */
export interface EffectData {
    target: TargetSelector;
    modifier: Modifier;
    duration: number; // 0: 瞬时, >0: Buff, Infinity: 光环/被动
    is_bullet_modifier?: boolean;
    tick?: TickEffect;
    target_max_hp_percent?: number; // 【新增】基于目标最大血量的治疗百分比（例如0.01表示治疗目标最大血量的1%）
}

/**
 * 技能解锁条件
 */
export interface SkillUnlock {
    type: 'default' | 'level' | 'synergy' | 'hero_star';
    value?: number;
    requires_hero_ids?: string[];
}

/**
 * 技能配置的主结构
 */
export interface SkillConfigData {
    skill_id: string;
    name: string;
    type: 'main' | 'passive';
    rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'synergy';
    unlock: SkillUnlock;
    description: string;
    bullet_id?: string;
    cooldown?: number; // 技能冷却时间（仅主技能使用）
    effects: EffectData[];
    trigger?: 'always' | 'on_attack' | 'on_hit' | 'on_kill';
    max_stack?: number;
}

/**
 * 最终计算出的角色属性，用于战斗逻辑
 */
export interface FinalStats {
    maxhp: number;
    attack: number;
    defense: number;
    damageReduction: number;
    skill_cooldown: number;
    crit_rate: number;
    crit_damage: number;
    lifesteal_percent: number;
    moveSpeed: number;
    attackRange: number;
    thornArmor: number;
    healing_power: number;
}

/**
 * 完整的修改器对象，包含了所有可被技能和Buff修改的属性
 */
export interface Modifier {
    // 英雄属性
    hp?: ValueModifier;
    maxhp?: ValueModifier;
    attack?: ValueModifier;
    defense?: ValueModifier;
    damageReduction?: ValueModifier;
    skill_cooldown?: ValueModifier;
    crit_rate?: ValueModifier;
    crit_damage?: ValueModifier;
    lifesteal_percent?: ValueModifier;
    thornArmor?: ValueModifier;
    
    // 治疗相关属性
    healing_power?: ValueModifier;      // 全局治疗强度
    skill_modifiers?: {                 // 技能专用修改器
        [skillId: string]: {
            duration_multiply?: number;   // 持续时间倍数修改
            duration_add?: number;        // 持续时间加法修改
            target_count_add?: number;    // 目标数量增加
            target_count_multiply?: number; // 目标数量倍数修改
            healing_multiply?: number;    // 治疗量倍数修改
            interval_multiply?: number;   // 触发间隔修改
        }
    };

    // 子弹属性
    damage?: ValueModifier;             // 子弹基础伤害
    pierce?: ValueModifier;
    bounce?: ValueModifier;
    colCount?: ValueModifier;
    waveCount?: ValueModifier;          // 子弹波次数量
    explosion?: { enabled: boolean; radius: number; damage: number };
    homing?: { enabled: boolean; speed: number; range: number };
    bullet_speed?: ValueModifier;
    range?: ValueModifier;
    scale?: ValueModifier;
    knockback?: { force: ValueModifier; chance?: number };
    slow?: { percent: number; duration: number; chance?: number };
    stun?: { duration: number; chance?: number };
    entangle?: { duration: number; chance?: number };
    dot?: { type: string; damage: number; duration: number; interval: number; chance?: number };
}

/**
 * 子弹数据
 */
export interface IBulletData {
    id: string;
    prefabName?: string;
    spriteFrameName?: string;
    damage?: number; // 子弹基础伤害
    speed?: number;
    maxDistance?: number;
    heroId?: string;
    scale?: number;
    pierce?: number; // 穿透
    bounce?: number; // 反弹
    colCount?: number;
    waveCount?: number;
    waveDelay?: number;
    colSpacing?: number;
    spreadAngle?: number;
    knockback?: { force?: number; chance?: number; };
    stun?: { duration: number; chance?: number };
    entangle?: { duration: number; chance?: number };
    slow?: { percent: number; duration: number; chance?: number; }; // 减速效果
    element?: any;
    lifesteal?: { percent: number }; // 吸血效果
    explosion?: { enabled?:boolean, radius?: number; damage?: number; }; // 爆炸效果
    heroAttack?: number; // 【新增】用于传递英雄的攻击力
    heroCritRate?: number; // 【新增】用于传递英雄的暴击率
    heroCritDamage?: number; // 【新增】用于传递英雄的暴击伤害
    bulletEffectType?: string;
    animationNames?: string[];
    hasTrail?: boolean; // 是否增加拖尾
    trailColor?: string; // 拖尾的颜色
    trailType?: string; // 拖尾类型名称（预制体资源名称，如 "prefab_tailing_leaves"）
    spriteColor?: string; // 子弹本体的颜色
    
    // 贝塞尔曲线相关参数
    offsetX?: number; // 起始位置X偏移
    offsetY?: number; // 起始位置Y偏移
    flightTime?: number; // 飞行时间（秒）
    arcHeight?: number; // 弧线高度（像素）
    waitTime?: number; // 到达目标后等待爆炸时间（秒）
    
    // 运动效果相关参数
    motionEffect?: 'none' | 'wave' | 'bounce' | 'zigzag'; // 运动效果类型
    motionAmplitude?: number; // 运动幅度（像素）
    motionFrequency?: number; // 运动频率（弧度/秒）
}