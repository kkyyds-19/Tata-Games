import { SkillConfigData } from '../../types'

export const ASSASSIN_SKILL_CONFIGS: SkillConfigData[] = [
  // 主技能 - 落雷
  {
    skill_id: 'assassin_lightning_strike',
    name: '落雷',
    type: 'main',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '降下落雷造成范围伤害，并使敌人触电，暴击时还可生成感电区域',
    bullet_id: 'assassin_lightning',
    cooldown: 8.0,
    effects: [
      {
        target: { type: 'self' },
        modifier: {
          explosion: { enabled: true, radius: 200, damage: 25 },
          stun: { duration: 1, chance: 1 }
        },
        duration: Infinity,
        is_bullet_modifier: true
      }
    ]
  },

  // 被动技能 - 强化落雷
  {
    skill_id: 'assassin_enhanced_lightning',
    name: '强化落雷',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'level', value: 1 },
    description: '落雷伤害+60%',
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

  // 被动技能 - 连续雷击
  {
    skill_id: 'assassin_continuous_lightning',
    name: '连续雷击',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '落雷施放次数+1，落雷伤害-30%',
    max_stack: 3,
    effects: [
      {
        target: { type: 'self' },
        modifier: {
          waveCount: { add: 1 },
          attack: { multiply: -0.25 }
        },
        duration: Infinity,
        is_bullet_modifier: true
      }
    ]
  }
] 