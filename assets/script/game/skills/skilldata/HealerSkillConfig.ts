import { SkillConfigData } from '../../types'

export const HEALER_SKILL_CONFIGS: SkillConfigData[] = [
  // 主技能：藤蔓缠绕
  {
    skill_id: 'rejuvenation',
    name: '回春术',
    type: 'main',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '发射藤蔓攻击敌人，50%概率缠绕目标1秒。发射时立即治疗2名血量最低的队友30点生命值。',
    bullet_id: 'healer_vine',
    cooldown: 6,
    effects: [
      // 子弹缠绕效果
      {
        target: { type: 'self' },
        duration: Infinity,
        is_bullet_modifier: true,
        modifier: { 
          entangle: { duration: 1, chance: 0.5 } 
        }
      },
      // 发射时瞬时治疗
      // {
      //   target: { type: 'allies', count: 2, orderBy: 'hp_percent_asc', include_self: true },
      //   duration: 0,
      //   modifier: { 
      //     hp: { add: 30 } 
      //   }
      // }
    ]
  },
   // 回春术（重新设计为被动技能）
  //  {
  //   skill_id: 'rejuvenation',
  //   name: '回春术',
  //   type: 'passive',
  //   rarity: 'rare',
  //   unlock: { type: 'default' },
  //   description: '主技能额外为1名血量最低的队友施加回春效果，每2秒恢复25点生命值，持续6秒',
  //   effects: []  // 空效果，实际逻辑在SkillCaster中实现
  // },

  // 愈合

  {
    skill_id: 'enhanced_healing',
    name: '愈合',
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

 

  // 绽放
  {
    skill_id: 'bloom',
    name: '绽放',
    type: 'passive',
    rarity: 'rare',
    unlock: {  type: 'level', value: 2},
    description: '回春术持续时间+20%',
    max_stack: 3,
    effects: [{
      target: { type: 'self' },
      duration: Infinity,
      modifier: {
        skill_modifiers: {
          'rejuvenation_effect': {
            duration_multiply: 0.2
          }
        }
      }
    }]
  },

  // 百花齐放
  {
    skill_id: 'full_bloom',
    name: '百花齐放',
    type: 'passive',
    rarity: 'epic',
    unlock: {  type: 'level', value: 2 },
    description: '回春术额外影响1个目标',
    max_stack: 2,
    effects: [{
      target: { type: 'self' },
      duration: Infinity,
      modifier: {
        skill_modifiers: {
          'rejuvenation_effect': {
            target_count_add: 1
          }
        }
      }
    }]
  },
  // 繁盛
  {
    skill_id: 'flourish',
    name: '繁盛',
    type: 'passive',
    rarity: 'common',
    unlock: { type: 'default' },
    description: '藤蔓释放次数+1，藤蔓伤害+30%',
    max_stack: 3,
    effects: [{
      target: { type: 'self' },
      duration: Infinity,
      is_bullet_modifier: true,
      modifier: {
        waveCount: { add: 1 },
        damage: { multiply: 0.3 }
      }
    }]
  },

  // 石肤术（暂时注释，等待完整实现）
  // {
  //   skill_id: 'stone_skin',
  //   name: '石肤术',
  //   type: 'passive',
  //   rarity: 'rare',
  //   unlock: { type: 'default' },
  //   description: '治疗时为目标提供10%伤害减免',
  //   max_stack: 5,
  //   effects: [{
  //     target: { type: 'self' },
  //     duration: Infinity,
  //     modifier: {
  //       // 这个技能需要特殊处理，暂时先加个标记属性
  //       damageReduction: { add: 0.1 }
  //     }
  //   }]
  // },
   
]