import { SkillConfigData } from '../../types'

/**
 * 🛡️ 步兵(FootMan)技能配置表
 * 主要定位：近战坦克，专注防御、嘲讽和保护队友
 */
export const FOOTMAN_SKILL_CONFIGS: SkillConfigData[] = [
  // ===================================
  // 主技能
  // ===================================
  {
    skill_id: 'footman_main_attack',
    name: '盾击',
    type: 'main',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '物理系弹道技能，发动剑气攻击目标。',
    bullet_id: 'footman_basic_shield',
    cooldown: 8,
    max_stack: 1,
    effects: []
  },

  // ===================================
  // 防御被动技能
  // ===================================
  {
    skill_id: 'iron_will',
    name: '钢铁意志',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '受到伤害-25%',
    max_stack: 3,
    effects: [
      {
        target: { type: 'self' },
        duration: Infinity,
        modifier: {
          damageReduction: { add: 0.25 }
        }
      }
    ]
  },

  {
    skill_id: 'footman_enhanced_sword_qi',
    name: '强化剑气',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    max_stack: 5,
    description: '剑气伤害+60%',
    effects: [
      {
        is_bullet_modifier: true,
        target: { type: 'self' },
        duration: Infinity,
        modifier: {
          attack: { multiply: 0.6 }
        }
      }
    ]
  },

  {
    skill_id: 'footman_sword_qi_split',
    name: '剑气分裂',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '剑气数量+1，剑气伤害-20%',
    max_stack: 3,
    effects: [{
      is_bullet_modifier: true,
      target: { type: 'self' },
      duration: Infinity,
      modifier: {
        colCount: { add: 1 },
        attack: { multiply: -0.2 }
      }
    }]
  },

  {
    skill_id: 'thorns_defense',
    name: '荆棘防御',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '受到伤害时对攻击者造成+15%攻击力反伤',
    max_stack: 3,
    effects: [
      {
        target: { type: 'self' },
        duration: Infinity,
        modifier: {
          thornArmor: { add: 0.15 }
        }
      }
    ]
  },



  


]
