import { SkillConfigData } from '../../types'

/**
 * 🛡️ 巨人之岭技能配置表 (重构版)
 * 所有技能均遵循新的 SkillConfigData 结构。
 */
export const TANKER_SKILL_CONFIGS: SkillConfigData[] = [
  // ===================================
  // 主技能
  // ===================================
  {
    skill_id: 'giant_main_attack',
    name: '巨石投掷',
    type: 'main',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '投掷滚石攻击随机目标，滚石可穿透所有敌人。',
    bullet_id: 'tanker_rock',
    cooldown: 10,
    effects: [
      {
        is_bullet_modifier: true,
        target: { type: 'self' },
        duration: Infinity,
        modifier: {
          pierce: { add: 99 },
          knockback: { force: { add: 15 }, chance: 1 }
        }
      }
    ]
  },


  {
    skill_id: 'thorns_armor',
    name: '反甲',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '受到伤害-30%，对攻击者造成10%反伤',
    max_stack: 3,
    effects: [
      {
        target: { type: 'self' },
        duration: Infinity,
        modifier: {
          damageReduction: { add: 0.3 },
          thornArmor: { add: 0.1 }
        }
      }
    ]
  },

  {
    skill_id: 'heavy_boulder',
    name: '重型滚石',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '滚石伤害+20%，滚石击退效果+100%',
    max_stack: 3,
    effects: [
      {
        is_bullet_modifier: true,
        target: { type: 'self' },
        duration: Infinity,
        modifier: {
          attack: { multiply: 0.2 },
          knockback: { force: { add: 15 }, chance: 1 }
        }
      }
    ]
  },





  {
    skill_id: 'reinforced_boulder',
    name: '强化滚石',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    max_stack: 5,
    description: '滚石伤害+60%',
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
    skill_id: 'multiple_boulders',
    name: '多重滚石',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '滚石释放次数+1，伤害-30%',
    max_stack: 3,
    effects: [
      {
        is_bullet_modifier: true,
        target: { type: 'self' },
        duration: Infinity,
        modifier: {
          waveCount: { add: 1 },
          attack: { multiply: -0.3 }
        }
      }
    ]
  },


 




  {
    skill_id: 'giant_boulder',
    name: '巨石',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '滚石体积增加10%',
    max_stack: 3,
    effects: [
      {
        is_bullet_modifier: true,
        target: { type: 'self' },
        duration: Infinity,
        modifier: {
          scale: { add: 0.10 }
        }
      }
    ]
  },
  




  // {
  //   skill_id: 'ricocheting_boulder',
  //   name: '反弹巨石',
  //   type: 'passive',
  //   rarity: 'epic',
  //   unlock: { type: 'default' },
  //   description: '滚石碰到墙壁会反弹一次',
  //   max_stack: 1,
  //   effects: [
  //     {
  //       is_bullet_modifier: true,
  //       target: { type: 'self' },
  //       duration: Infinity,
  //       modifier: {
  //         bounce: { add: 1 }
  //       }
  //     }
  //   ]
  // },

  
  {
    skill_id: 'concussive_force',
    name: '震荡之力',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '滚石有30%概率造成1秒眩晕',
    effects: [
      {
        is_bullet_modifier: true,
        target: { type: 'self' },
        duration: Infinity,
        modifier: {
          stun: { duration: 1, chance: 0.3 }
        }
      }
    ]
  },




  // ===================================
  // 特殊解锁技能
  // ===================================

  {
    skill_id: 'entangling_boulder',
    name: '缠绕巨石',
    type: 'passive',
    rarity: 'rare',
    unlock: {  type: 'synergy', requires_hero_ids: ['1001'] },
    description: '滚石有100%概率缠绕目标1秒，被缠绕的敌人无法移动',
    max_stack: 3,
    effects: [
      {
        is_bullet_modifier: true,
        target: { type: 'self' },
        duration: Infinity,
        modifier: {
          entangle: { duration: 1, chance: 1 } // 1秒缠绕, 100%概率
        }
      }
    ]
  },



  // {
  //   skill_id: 'landslide',
  //   name: '山崩',
  //   type: 'passive',
  //   rarity: 'epic',
  //   unlock: { type: 'hero_star', value: 3 },
  //   description: '滚石额外施放3次，但体积-15%',
  //   effects: [
  //     {
  //       is_bullet_modifier: true,
  //       target: { type: 'self' },
  //       duration: Infinity,
  //       modifier: {
  //         waveCount: { add: 3 },
  //         scale: { add: -0.15 }
  //       }
  //     }
  //   ]
  // },

  // {
  //   skill_id: 'giant_leap',
  //   name: '巨人跳跃',
  //   type: 'passive',
  //   rarity: 'epic',
  //   trigger: 'always',
  //   unlock: { type: 'level', value: 99 },
  //   description: '跳跃到目标位置，对路径上的敌人造成伤害',
  //   max_stack: 1,
  //   bullet_mod: {
  //     attack: { multiply: 1.5 },
  //     knockback: { force: { add: 100 }, chance: { set: 1 } }
  //   }
  // },
] 