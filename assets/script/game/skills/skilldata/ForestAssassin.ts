import { SkillConfigData } from '../../types'

export const FOREST_ASSASSIN_SKILL_CONFIGS: SkillConfigData[] = [
  // ===================================
  // 主技能
  // ===================================
  {
    skill_id: 'forest_assassin_main_attack',
    name: '翠叶飞刃',
    type: 'main',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '森林刺客的基础攻击，投掷翠绿飞刃进行快速突袭',
    bullet_id: 'forest_assassin_shadow_blade',
    cooldown: 7,
    effects: []
  },

  // ===================================
  // 被动技能
  // ===================================
  {
    skill_id: 'forest_assassin_swift_strike',
    name: '疾风连击',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '刺客的敏捷训练，攻击速度+15%（减少冷却时间）',
    max_stack: 3,
    effects: [
      {
        target: { type: 'self' },
        modifier: {
          skill_cooldown: { multiply: -0.15 }
        },
        duration: Infinity,
        is_bullet_modifier: false
      }
    ]
  },

  {
    skill_id: 'forest_assassin_poison_blade',
    name: '毒藤之刃',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '飞刃附着毒藤精华，击中目标时造成自然毒素持续伤害',
    max_stack: 3,
    effects: [
      {
        target: { type: 'self' },
        modifier: {
          dot: { type: 'poison', damage: 15, duration: 3, interval: 0.5, chance: 1 }
        },
        duration: Infinity,
        is_bullet_modifier: true
      }
    ]
  },

  {
    skill_id: 'forest_assassin_multi_strike',
    name: '连环叶刃',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '增加翠叶飞刃投掷次数，每级+1次连击',
    max_stack: 3,
    effects: [
      {
        target: { type: 'self' },
        modifier: {
          waveCount: { add: 1 }
        },
        duration: Infinity,
        is_bullet_modifier: true
      }
    ]
  },

  {
    skill_id: 'forest_assassin_piercing_blade',
    name: '穿林飞刃',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '飞刃获得穿透森林的力量，可穿透+1个敌人，伤害+20%',
    max_stack: 3,
    effects: [
      {
        target: { type: 'self' },
        modifier: {
          pierce: { add: 1 },
          attack: { multiply: 0.2 }
        },
        duration: Infinity,
        is_bullet_modifier: true
      }
    ]
  },



  {
    skill_id: 'forest_assassin_enhanced_blade',
    name: '强化叶刃',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '汲取森林精华，翠叶飞刃伤害+60%',
    max_stack: 5,
    effects: [
      {
        target: { type: 'self' },
        modifier: {
          attack: { multiply: 0.6 }
        },
        duration: Infinity,
        is_bullet_modifier: true
      }
    ]
  },
  {
    skill_id: 'forest_assassin_deadly_precision',
    name: '致命精准',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '刺客的精准训练，暴击率+15%，暴击伤害+25%',
    max_stack: 5,
    effects: [
      {
        target: { type: 'self' },
        modifier: {
          crit_rate: { add: 0.15 },
          crit_damage: { add: 0.25 }
        },
        duration: Infinity,
        is_bullet_modifier: true
      }
    ]
  },

  

]
