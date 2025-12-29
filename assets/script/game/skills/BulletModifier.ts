/**
 * 子弹修改器类型定义文件
 * 定义技能对子弹属性的修改规则和相关接口
 */

/**
 * 数值修改器接口
 * 定义三种常见的数值修改方式
 */
export interface ValueModifier {
  add?: number      // 增加固定值
  multiply?: number // 乘法系数（1.5 = 增加50%）
  percent?: number  // 百分比增加（50 = 增加50%）
}

/**
 * 元素类型枚举
 */
export type ElementType = 'fire' | 'ice' | 'lightning' | 'poison' | 'holy' | 'dark';


/**
 * 元素效果数据接口
 */
export interface ElementData {
  type?: ElementType;
  chance?: number;
  // 持续时间
  duration?: number;
  
  damage?: number; // 直接伤害
  // DOT (fire, poison，生命百分比伤害)
  damage_per_tick?: number;
  // 伤害间隔
  interval?: number;
  // 减速 (ice)
  slow_percent?: number;
  // 吸血 (dark)
  heal_percent?: number;
}

/**
 * 子弹修改器接口
 * 定义技能对子弹属性的修改规则
 */
export interface BulletModifier {
  // ==================== 基础属性 ====================
  /** 攻击力修改 */
  attack?: ValueModifier;

  /** 攻击速度修改 */
  attack_speed?: ValueModifier;

  /** 暴击率修改 */
  crit_rate?: ValueModifier;

  /** 暴击伤害修改 */
  crit_damage?: ValueModifier;

  // ==================== 子弹行为 ====================
  /** 子弹速度修改 */
  bullet_speed?: ValueModifier;

  /** 子弹射程修改 */
  range?: ValueModifier;

  /** 子弹大小修改 */
  scale?: number | ValueModifier;

  /** 穿透次数修改 */
  pierce?: {
    add?: number      // 增加穿透次数
    set?: number      // 直接设置穿透次数
  };

  /** 弹跳次数修改 */
  bounce?: {
    add?: number      // 增加弹跳次数
    set?: number      // 直接设置弹跳次数
  };



  /** 追踪能力 */
  homing?: {
    enabled?: boolean // 是否启用追踪
    speed?: number    // 追踪速度
    range?: number    // 追踪范围
  };

  /** 列数修改（散射） */
  colCount?: {
    add?: number      // 增加列数（并行子弹数）
    set?: number      // 直接设置列数
  };

  /** 波次修改（连射） */
  waveCount?: {
    add?: number      // 增加波次数
    set?: number      // 直接设置波次数
    interval?: number // 波次间隔时间（毫秒）
  };

  // ==================== 特殊效果 ====================
  /** 元素伤害 */
  element?: ElementData | ElementData[];

  /** 击退效果 */
  knockback?: {
    force?: ValueModifier;    // 击退力度
    chance?: number | { add?: number; set?: number; };   // 触发概率
  };

  /** 眩晕效果 */
  stun?: {
    duration?: number | ValueModifier // 眩晕时间（秒）
    chance?: number | ValueModifier   // 触发概率
  };

  /** 缠绕效果 (定身，但可攻击) */
  entangle?: {
    duration?: number | ValueModifier // 缠绕时间（秒）
    chance?: number | ValueModifier   // 触发概率
  };

  // ==================== 增益效果 ====================
  /** 医疗效果（治疗友方单位） */
  healing?: {
    amount?: number       // 治疗量
    percent?: number      // 按最大生命值百分比治疗（0.1 = 治疗10%最大生命值）
    over_time?: {         // 持续治疗
      amount?: number     // 每次治疗量
      duration?: number   // 持续时间（秒）
      interval?: number   // 治疗间隔（秒）
    }
    target_count?: number // 治疗目标数量（默认1，最多5）
    priority?: 'nearest' | 'farthest' | 'lowest_hp' | 'highest_hp' | 'random' // 目标选择优先级
  };

  /** 嗜血效果（限时攻击力提升） */
  bloodlust?: {
    attack_boost?: number     // 攻击力提升数值
    attack_boost_percent?: number // 攻击力提升百分比
    attack_speed_boost?: number   // 攻击速度提升百分比
    duration?: number         // 效果持续时间（秒）
    stack_limit?: number      // 最大叠加层数
    trigger_condition?: 'on_kill' | 'on_hit' | 'on_crit' // 触发条件
    chance?: number           // 触发概率
  };

  /** 鼓舞效果（范围增益光环） */
  inspire?: {
    attack_bonus?: number     // 攻击力加成
    attack_speed_bonus?: number // 攻击速度加成
    crit_rate_bonus?: number  // 暴击率加成
    damage_bonus?: number     // 伤害加成百分比
    duration?: number         // 效果持续时间（秒）
    radius?: number           // 影响范围
    target_count?: number     // 影响目标数量（最多5个）
    cooldown?: number         // 冷却时间（秒）
    friendly_only?: boolean   // 是否只影响友方单位
  };

  /** 范围爆炸 */
  explosion?: {
    enabled?: boolean        // 是否爆炸
    radius?: number          // 爆炸半径
    damage?: number          // 爆炸伤害
  };

  

} 

 