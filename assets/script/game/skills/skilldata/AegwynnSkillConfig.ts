import { SkillConfigData } from '../../types'

export const AEGWYNN_SKILL_CONFIGS: SkillConfigData[] = [
  {
    skill_id: 'aegwynn_main_attack',
    name: '魔法箭',
    type: 'main',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '释放魔法飞弹，自动追踪,造成大量伤害, 并穿透敌人。',
    bullet_id: 'aegwynn_basic_arrow',
    cooldown: 4,
    effects: [
        {
            is_bullet_modifier: true,
            target: { type: 'self' },
            duration: Infinity,
            modifier: {
              pierce: { add: 10 },
            }
          }
    ]
  },


  {
    skill_id: 'aegwynn_continuous_arrow',
    name: '奥术飞弹',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '飞弹个数 +1 ， 伤害 +10%',
    max_stack: 4,
    effects: [{
      is_bullet_modifier: true,
      target: { type: 'self' },
      duration: Infinity,
      modifier: {
        waveCount: { add: 1 },
      }
    },
    {
        is_bullet_modifier: true,
        target: { type: 'self' },
        duration: Infinity,
        modifier: {
          attack: { multiply: 0.1 }
        }
      }
    ]
  },

  {
    skill_id: 'aegwynn_basic_arrow_attack',
    name: '奥术光辉',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '魔法飞弹 伤害+60%',
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