import { SkillConfigData } from '../../types'

export const FOREST_SAGE_SKILL_CONFIGS: SkillConfigData[] = [
  {
    skill_id: 'instant_healing',
    name: '森林贤者',
    type: 'main',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '为血量最低的2名队友立即回复15%最大生命值，并移除他们身上的一个负面状态。',
    bullet_id: 'forest_heal_burst',
    cooldown: 8,
    effects: [
      {
        target: { type: 'allies', count: 2, orderBy: 'hp_percent_asc', include_self: true },
        duration: 0,
        modifier: {
          hp: { multiply: 0.15 }
        }
      }
    ]
  },
  {
    skill_id: 'enhanced_healing',
    name: '自然之力',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'level', value: 1 },
    description: '所有治疗效果+60%',
    max_stack: 5,
    effects: [{
      target: { type: 'self' },
      duration: Infinity,
      modifier: {
        healing_power: { multiply: 0.6 }
      }
    }]
  },

  {
    skill_id: 'forest_sage_enhanced_skill',
    name: '大地的愤怒',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    max_stack: 5,
    description: '技能伤害+60% 技能cd-15%',
    effects: [
      {
        is_bullet_modifier: true,
        target: { type: 'self' },
        duration: Infinity,
        modifier: {
          attack: { multiply: 0.6 },
        }
      },
      {
        target: { type: 'self' },
        modifier: {
          skill_cooldown: { multiply: -0.15 }
        },
        duration: Infinity,
        is_bullet_modifier: false
      }
    ]
  }

   
   
]