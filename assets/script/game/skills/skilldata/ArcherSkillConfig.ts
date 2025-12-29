import { SkillConfigData } from '../../types'

export const ARCHER_SKILL_CONFIGS: SkillConfigData[] = [
  // ===================================
  // 主技能
  // ===================================
  {
    skill_id: 'archer_main_attack',
    name: '精准射击',
    type: 'main',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '亡灵游侠的固有攻击技能，射出箭矢攻击敌人。',
    bullet_id: 'archer_basic_arrow',
    cooldown: 6,
    max_stack: 1,
    effects:[]
  },
  
  {
    skill_id: 'rapid_fire',
    name: '连射',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '连射次数+3',
    max_stack: 3,
    effects: [{
      is_bullet_modifier: true,
      target: { type: 'self' },
      duration: Infinity,
      modifier: {
        waveCount: { add: 3 }
      }
    }]
  },
  {
    skill_id: 'scatter_shot',
    name: '散射箭',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '箭矢数量+1，箭矢伤害-20%',
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
    skill_id: 'piercing_shot',
    name: '穿透箭',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '箭矢穿透+1，箭矢伤害+20%',
    max_stack: 3,
    effects: [{
      is_bullet_modifier: true,
      target: { type: 'self' },
      duration: Infinity,
      modifier: {
        pierce: { add: 1 },
        attack: { multiply: 0.2 }
      }
    }]
  },

  {
    skill_id: 'strengthen_arrow',
    name: '强化箭矢',
    type: 'passive',
    rarity: 'rare',
    unlock: { type: 'default' },
    description: '箭矢伤害+60%',
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
    skill_id: 'explosive_arrow',
    name: '爆裂箭',
    type: 'passive',
    rarity: 'synergy',
    trigger: 'always',
    unlock: { type: 'synergy', requires_hero_ids: ['1003'] }, 
    description: '为箭矢附魔火焰，命中敌人时爆炸',
    effects: [{
      is_bullet_modifier: true,
      target: { type: 'self' },
      duration: Infinity,
      modifier: {
        explosion: { enabled: true, radius: 280, damage: 150 }
      }
    }]
  },


  // ===================================
  // 测试技能
  // ===================================

  // {
  //   skill_id: 'ultimate_test_arrow',
  //   name: '终极魔改箭',
  //   type: 'passive',
  //   rarity: 'common',
  //   trigger: 'always',
  //   unlock: { type: 'default' },
  //   description: '测试用技能，附加爆炸、眩晕、火焰持续伤害、毒素持续伤害、减速效果。',
  //   max_stack: 5,
  //   effects: [
  //     {
  //       is_bullet_modifier: true,
  //       target: { type: 'self' },
  //       duration: Infinity,
  //       modifier: {
  //         explosion: { enabled: true, radius: 280, damage: 50 },
  //         stun: { duration: 1, chance: 1 }
  //       }
  //     },
  //     {
  //       is_bullet_modifier: true,
  //       target: { type: 'self' },
  //       duration: Infinity,
  //       modifier: {
  //         dot: { type: 'fire', damage: 5, duration: 5, interval: 0.5, chance: 1 }
  //       }
  //     },
  //     {
  //       is_bullet_modifier: true,
  //       target: { type: 'self' },
  //       duration: Infinity,
  //       modifier: {
  //         dot: { type: 'poison', damage: 3, duration: 5, interval: 0.3, chance: 1 }
  //       }
  //     },
  //     {
  //       is_bullet_modifier: true,
  //       target: { type: 'self' },
  //       duration: Infinity,
  //       modifier: {
  //         dot: { type: 'ice', damage: 1, duration: 1,interval: 1, chance: 1 },
  //       }
  //     }
      
  //   ]
  // }
] 