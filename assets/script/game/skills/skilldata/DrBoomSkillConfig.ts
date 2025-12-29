import { SkillConfigData } from '../../types'

export const DRBOOM_SKILL_CONFIGS: SkillConfigData[] = [
  {
    skill_id: 'drboom_main_attack',
    name: 'Boom',
    type: 'main',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '释放炸弹，对敌人造成范围伤害.',
    bullet_id: 'drboom_basic_bomb',
    cooldown: 5.5,
    effects: []
  },
  
  {
    skill_id: 'drboom_continuous_bomb',
    name: '连续投掷',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '投掷次数+1',
    max_stack: 4,
    effects: [{
      is_bullet_modifier: true,
      target: { type: 'self' },
      duration: Infinity,
      modifier: {
        waveCount: { add: 1 }
      }
    }]
  },

  {
    skill_id: 'drboom_continuous_bomb_cooldown',
    name: '弹药充足',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '投掷炸弹冷却时间-10%',
    max_stack: 3,
    effects: [
      {
        target: { type: 'self' },
        modifier: {
          skill_cooldown: { multiply: -0.1 }
        },
        duration: Infinity,
        is_bullet_modifier: false
      }
    ]
  },

{
    skill_id: 'drboom_basic_bomb_attack',
    name: '火药改良',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '炸弹伤害+60%',
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