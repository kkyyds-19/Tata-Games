import { SkillConfigData } from '../../types'

export const MAGE_SKILL_CONFIGS: SkillConfigData[] = [
  // 主技能
  {
    skill_id: 'mage_basic_spell',
    name: '基础法术',
    type: 'main',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '法师的基础魔法攻击，可升级提升伤害',
    bullet_id: 'mage_magic_missile',
    cooldown: 7.5,
    effects: [
    ]
  },
  
  // 被动技能 - 点燃
  {
    skill_id: 'mage_ignite',
    name: '点燃',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '击中目标时点燃敌人，造成火焰持续伤害。每级增加伤害和持续时间。',
    max_stack: 3,
    effects: [
      {
        target: { type: 'self' },
        modifier: {
          dot: { type: 'fire', damage: 10, duration: 2, interval: 0.3, chance: 1 }
        },
        duration: Infinity,
        is_bullet_modifier: true
      }
    ]
  },

  {
    skill_id: 'mage_multi_fireball',
    name: '连珠火球',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '增加魔法导弹的波次数量，每级+1波次',
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
    skill_id: 'mage_magic_mastery',
    name: '强化火球',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '火球术 伤害+60%',
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
    skill_id: 'mage_explosion',
    name: '爆燃',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'synergy', requires_hero_ids: ['1002']},
    description: '击中目标时引发爆炸，造成范围伤害。每级增加爆炸范围和伤害',
    max_stack: 3,
    effects: [
      {
        target: { type: 'self' },
        modifier: {
          explosion: { enabled: true, radius: 120, damage: 30 }
        },
        duration: Infinity,
        is_bullet_modifier: true
      }
    ]
  },

 

    




] 