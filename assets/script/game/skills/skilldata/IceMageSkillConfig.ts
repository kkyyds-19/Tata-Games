import { SkillConfigData } from '../../types'

export const ICE_MAGE_SKILL_CONFIGS: SkillConfigData[] = [
  // ===================================
  // 主技能
  // ===================================
  {
    skill_id: 'ice_mage_main_attack',
    name: '冰珠术',
    type: 'main',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '冰魔导师的固有攻击技能，发射冰珠攻击敌人。',
    bullet_id: 'ice_mage_basic_orb',
    cooldown: 9,
    max_stack: 1,
    effects: [
        {
            is_bullet_modifier: true,
            target: { type: 'self' },
            duration: Infinity,
            modifier: {
              dot: { type: 'ice', damage: 1, duration: 5, interval: 1, chance: 1 }
            }
          }
    ]
  },

  // ===================================
  // 被动技能
  // ===================================
  {
    skill_id: 'continuous_ice_orb',
    name: '连续冰珠',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '冰珠次数+1，伤害-20%',
    max_stack: 3,
    effects: [{
      is_bullet_modifier: true,
      target: { type: 'self' },
      duration: Infinity,
      modifier: {
        waveCount: { add: 1 },
        attack: { multiply: -0.2 }
      }
    }]
  },

  {
    skill_id: 'strengthen_ice_orb',
    name: '强化冰珠',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '冰珠伤害+60%',
    max_stack: 5,
    effects: [{
      is_bullet_modifier: true,
      target: { type: 'self' },
      duration: Infinity,
      modifier: {
        attack: { multiply: 0.6 }
      }
    }]
  },


  {
    skill_id: 'ice_explosion',
    name: '冰霜新星',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '冰珠命中时产生冰霜爆炸，对周围敌人造成伤害',
    max_stack: 3,
    effects: [{
      is_bullet_modifier: true,
      target: { type: 'self' },
      duration: Infinity,
      modifier: {
        explosion: { enabled: true, radius: 150, damage: 40 }
      }
    }]
  }
]
