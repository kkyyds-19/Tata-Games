import { SkillConfigData } from '../../types'

export const POTIONER_SKILL_CONFIGS: SkillConfigData[] = [
  // ===================================
  // 主技能
  // ===================================
  {
    skill_id: 'potioner_main_attack',
    name: '药剂投掷',
    type: 'main',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '药剂师的固有攻击技能，投掷药剂瓶攻击敌人。',
    bullet_id: 'potioner_basic_bottle',
    cooldown: 10,
    max_stack: 1,
    effects: [
      
    ]
  },

  // ===================================
  // 被动技能
  // ===================================
  {
    skill_id: 'healing_potion',
    name: '毒云',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '投掷的药剂瓶 对周围敌人造成中毒效果 伤害+30%',
    max_stack: 3,
    effects: [{
      is_bullet_modifier: true,
      target: { type: 'self' },
      duration: Infinity,
      modifier: {
        explosion: { enabled: true, radius: 120, damage: 30 },
      }
    },


]
  },

  {
    skill_id: 'poison_bottle',
    name: '毒药瓶',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '药剂瓶命中敌人造成中毒效果 伤害+30%',
    max_stack: 3,
    effects: [{
      is_bullet_modifier: true,
      target: { type: 'self' },
      duration: Infinity,
      modifier: {
        dot: { type: 'poison', damage: 10, duration: 3, interval: 0.3, chance: 1 }
      }
    }]
  },

  {
    skill_id: 'strengthen_potion',
    name: '强化药剂',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '药剂瓶伤害+60%',
    max_stack: 5,
    effects: [{
      is_bullet_modifier: true,
      target: { type: 'self' },
      duration: Infinity,
      modifier: {
        attack: { multiply: 0.6 }
      }
    }]
  }

]
