import { _decorator, Component, Node, Vec3, Vec2, game, director } from 'cc';
import { GameObject } from './object/GameObject';
import { SkillManager } from './skills/SkillManager';
import { BulletManager } from './BulletManager';
import { BulletConfig } from './bullet/BulletConfig';
import { HerosManager } from './HerosManager';
import { HeroPanel } from './HeroPanel';
import { EffectData, IBulletData, Modifier, TargetSelector } from './types';
import { HealingCalculator } from './utils/HealingCalculator';

const { ccclass, property } = _decorator;

/**
 * 释放技能的单例工具类
 */
@ccclass('SkillCaster')
export class SkillCaster extends Component {
    private static instance: SkillCaster;

    public static getInstance(): SkillCaster {
        if (!SkillCaster.instance) {
            const node = new Node('SkillCaster');
            SkillCaster.instance = node.addComponent(SkillCaster);
            director.getScene()?.addChild(node);
        }
        return SkillCaster.instance;
    }

    /**
     * 清理SkillCaster实例（游戏结束时调用）
     */
    public static clearInstance(): void {
        if (SkillCaster.instance) {
            console.log('[SkillCaster] 清理SkillCaster实例...')
            try {
                if (SkillCaster.instance.node && SkillCaster.instance.node.isValid) {
                    SkillCaster.instance.node.destroy()
                }
                SkillCaster.instance = null
                console.log('[SkillCaster] SkillCaster实例清理完成')
            } catch (error) {
                console.error('[SkillCaster] 清理SkillCaster实例时出错:', error)
                SkillCaster.instance = null
            }
        }
    }

    /**
     * 释放主技能 (重构版)
     * @param hero 英雄对象
     * @param startPosition 开始坐标
     * @param heroAttack 【新增】英雄的最终攻击力
     */
    public castMainSkill(hero: GameObject, startPosition: Vec3, heroAttack: number, heroCritRate: number = 0, heroCritDamage: number = 1.5): void {
        const skillManager = SkillManager.getInstance();
        
        const mainSkill = skillManager.getMainSkill(hero.id);
        const passiveSkills = skillManager.getEquippedSkills(hero.id)
                                          .filter(s => s.type === 'passive');

        if (!mainSkill || !mainSkill.effects) {
            // console.warn(`[SkillCaster] 未找到英雄 ${hero.id} 的主技能配置`);
            return;
        }

        // console.log(`[SkillCaster] 施放主技能: ${mainSkill.name}`);

        let allEffects: EffectData[] = [];
        
        // 1. 添加主技能的效果
        if (mainSkill.effects) {
            allEffects = allEffects.concat(mainSkill.effects);
        }
        
        // 2. 【修复】只收集子弹修改器效果，不收集永久状态效果
        for (const skill of passiveSkills) {
            if (skill.effects) {
                const stackCount = skill.stack;
                
                for (const effect of skill.effects) {
                    // 只收集子弹修改器，永久状态效果应该已经在技能选择时应用到英雄身上了
                    if (effect.is_bullet_modifier) {
                        for (let i = 0; i < stackCount; i++) {
                            allEffects.push(effect);
                        }
                    }
                }
            }
        }
        
        const bulletModifiers = this.applyEffects(hero, allEffects);
        
        // 2. 检查并应用回春术被动技能效果
        this.applyRejuvenationEffects(hero);

        if (mainSkill.bullet_id) {
            this.fireBullets(hero, startPosition, bulletModifiers, mainSkill.bullet_id, heroAttack, heroCritRate, heroCritDamage);
        }
    }

    /**
     * 释放主动技能 (待重构)
     */
    public castActiveSkill(hero: GameObject, startPosition: Vec3): void {
        // TODO: 使用新的 effects 模型重构此方法
        // 1. 从 SkillManager 获取主动技能
        // 2. 提取 effects 数组
        // 3. 调用 this.applyEffects(hero, effects)
        // 4. 如果有 bullet_id，调用 this.fireBullets
    }

    /**
     * 应用一个效果数组 (核心重构方法)
     * @param caster 施法者
     * @param effects 要应用的效果列表
     * @returns 一个只包含子弹修改器的 Modifier 数组
     */
    private applyEffects(caster: GameObject, effects: EffectData[]): Modifier[] {
        const bulletModifiers: Modifier[] = [];

        for (const effect of effects) {
            if (effect.is_bullet_modifier) {
                // 如果是子弹修改器，直接收集起来
                bulletModifiers.push(effect.modifier);
                continue;
            }

            // 应用技能专用修改器（如果有的话）
            const enhancedEffect = this.applySkillSpecificModifiers(effect, caster);

            // 查找目标
            const targets = this.findTargets(caster, enhancedEffect.target);

            // 对每个目标应用效果
            for (const targetPanel of targets) {
                if (enhancedEffect.duration === 0) {
                    // 瞬时治疗，使用专门的治疗方法
                    this.applyInstantHealing(targetPanel, enhancedEffect.modifier, caster);
                } else {
                    // Buff治疗，通过BuffManager处理
                    if (targetPanel.buffManager) {
                        targetPanel.buffManager.addBuff(enhancedEffect, caster);
                    }
                }
            }
        }

        return bulletModifiers;
    }

    /**
     * 【新增】应用技能专用修改器
     * @param effect 原始效果
     * @param caster 施法者
     * @returns 增强后的效果
     */
    private applySkillSpecificModifiers(effect: EffectData, caster: GameObject): EffectData {
        // 获取施法者的技能专用修改器
        const casterPanel = HerosManager.getInstance().getActiveHeroPanels().find(p => p.hero.id === caster.id);
        if (!casterPanel?.buffManager) {
            return effect;
        }

        const combinedModifier = casterPanel.buffManager.getCombinedModifier();
        const skillModifiers = combinedModifier.skill_modifiers;

        if (!skillModifiers) {
            return effect;
        }

        // 创建增强后的效果副本
        const enhancedEffect: EffectData = JSON.parse(JSON.stringify(effect));

        // 检查是否有针对特定技能的修改器
        // 这里需要知道当前处理的是哪个技能，暂时通过效果特征来判断
        const skillId = this.identifySkillFromEffect(effect);
        const skillMod = skillModifiers[skillId];

        if (skillMod) {
            // 应用持续时间修改器
            if (skillMod.duration_multiply) {
                enhancedEffect.duration *= (1 + skillMod.duration_multiply);
            }
            if (skillMod.duration_add) {
                enhancedEffect.duration += skillMod.duration_add;
            }

            // 应用目标数量修改器
            if (skillMod.target_count_add && enhancedEffect.target.count) {
                enhancedEffect.target.count += skillMod.target_count_add;
            }
            if (skillMod.target_count_multiply && enhancedEffect.target.count) {
                enhancedEffect.target.count = Math.round(enhancedEffect.target.count * (1 + skillMod.target_count_multiply));
            }

            // 应用治疗量修改器
            if (skillMod.healing_multiply && enhancedEffect.modifier.hp?.add) {
                enhancedEffect.modifier.hp.add *= (1 + skillMod.healing_multiply);
            }
            if (skillMod.healing_multiply && enhancedEffect.tick?.modifier.hp?.add) {
                enhancedEffect.tick.modifier.hp.add *= (1 + skillMod.healing_multiply);
            }

            // 应用间隔修改器
            if (skillMod.interval_multiply && enhancedEffect.tick?.interval) {
                enhancedEffect.tick.interval *= (1 + skillMod.interval_multiply);
            }


        }


        return enhancedEffect;
    }

    /**
     * 【新增】从效果特征识别技能ID
     * @param effect 效果数据
     * @returns 技能ID
     */
    private identifySkillFromEffect(effect: EffectData): string {
        // 根据效果的特征来判断是哪个技能
        if (effect.tick && effect.tick.modifier.hp?.add) {
            // 有周期性治疗效果，判断为回春术
            return 'rejuvenation_effect';
        }
        
        // 未来可以根据更多特征来识别其他技能
        return 'unknown';
    }

    /**
     * 【新增】专门的瞬时治疗方法
     * @param target 目标HeroPanel
     * @param modifier 修改器
     * @param source 施法者
     */
    private applyInstantHealing(target: HeroPanel, modifier: Modifier, source: GameObject) {
        if (!modifier.hp) return;
        
        let baseHealing = 0;
        let targetMaxHpPercent = 0;
        
        // 处理固定数值治疗
        if (modifier.hp.add) {
            baseHealing = modifier.hp.add;
        }
        
        // 处理百分比治疗
        if (modifier.hp.multiply) {
            targetMaxHpPercent = modifier.hp.multiply;
        }
        
        // 如果没有治疗量，直接返回
        if (baseHealing === 0 && targetMaxHpPercent === 0) return;
        
        /**
         * 【兼容性参数说明】
         * 保留0.005作为默认的额外治疗百分比，用于兼容其他可能需要额外治疗效果的技能
         * 这个参数会在HealingCalculator.calculateFinalHealing中被处理：
         * - 如果技能配置了hp.multiply，则使用配置的百分比
         * - 如果没有配置hp.multiply，则使用0.005作为默认的额外治疗百分比
         * - 这样可以确保所有治疗技能都能获得一定的额外治疗效果，提升游戏体验
         * 
         * 计算示例：
         * - 森林贤者：hp.multiply = 0.6，目标血量4500，治疗量 = 4500 × 0.6 = 2700
         * - 其他技能：hp.add = 300，目标血量4500，额外治疗 = 4500 × 0.005 = 22.5，总治疗量 = 300 + 22.5 = 322.5
         */
        const defaultExtraHealingPercent = 0.005; // 0.5%的默认额外治疗百分比
        
        // 应用治疗强度修改器
        const healingAmount = this.calculateFinalHealing(baseHealing, source, target.hero, targetMaxHpPercent || defaultExtraHealingPercent);
        
        // 【新增】只在有治疗强度加成时输出日志
        if (healingAmount !== baseHealing) {
            console.log(`[治疗强度] ${target.hero.name}: ${baseHealing} -> ${healingAmount}点 (装备+${Math.round((source.healing_power_equip || 0) * 100) / 100})`);
        }
        
        // 通过事件系统发送治疗消息，而不是直接修改血量
        director.emit(game.gameEvent.GAME_HEAL_EFFECT, { 
            target: target.hero, 
            healAmount: healingAmount 
        });
        
        // 同时应用石肤术等额外效果
        this.applyHealingBonusEffects(target, source);
    }

    /**
     * 【重构】计算最终治疗量 - 现在使用统一的工具类
     * @param baseHealing 基础治疗量
     * @param source 施法者
     * @param target 被治疗目标（可选）
     * @param targetMaxHpPercent 基于目标最大血量的治疗百分比（可选）
     * @returns 最终治疗量
     */
    private calculateFinalHealing(baseHealing: number, source: GameObject, target?: GameObject, targetMaxHpPercent?: number): number {
        return HealingCalculator.calculateFinalHealing(baseHealing, source, target, targetMaxHpPercent);
    }

    /**
     * 【新增】应用治疗时的额外效果（如石肤术）
     * @param target 目标
     * @param source 施法者
     */
    private applyHealingBonusEffects(target: HeroPanel, source: GameObject) {
        // TODO: 处理石肤术等随治疗附加的效果
        // 暂时先输出日志，等技能系统完善后实现
    }

    /**
     * 根据目标选择器查找目标
     * @param caster 施法者
     * @param selector 目标选择规则
     * @returns 一个 HeroPanel 数组
     */
    private findTargets(caster: GameObject, selector: TargetSelector): HeroPanel[] {
        return this.selectHealingTargets(selector, caster);
    }

    /**
     * 智能治疗目标选择（新增方法）
     * @param selector 目标选择器
     * @param caster 施法者
     * @returns 目标对象数组
     */
    private selectHealingTargets(selector: TargetSelector, caster: GameObject): HeroPanel[] {
        const allHeroPanels = HerosManager.getInstance().getActiveHeroPanels();
        const casterPanel = allHeroPanels.find(p => p.hero.id === caster.id);

        if (!casterPanel) return [];

        let candidates: HeroPanel[] = [];
        
        if (selector.type === 'allies') {
            // 获取所有友方英雄
            candidates = [...allHeroPanels];
            
            // 处理自己的包含/排除逻辑
            if (selector.exclude_self) {
                // 强制排除自己（优先级最高）
                candidates = candidates.filter(p => p.hero.id !== caster.id);
            } else if (selector.include_self) {
                // 包含自己（如果没有exclude_self）
                // 已经包含在allHeroPanels中，无需额外操作
            } else {
                // 默认行为：排除自己
                candidates = candidates.filter(p => p.hero.id !== caster.id);
            }
        } else if (selector.type === 'self') {
            candidates = [casterPanel];
        }
        
        // 【修复】处理死亡目标的排除逻辑 - 默认排除死亡英雄
        if (selector.exclude_dead !== false) { 
            // 默认排除死亡目标（hp <= 0 或 isDead 状态）
            const beforeFilter = candidates.length;
            candidates = candidates.filter(panel => {
                return panel.hero.hp > 0 && !panel.isDead;
            });
            const afterFilter = candidates.length;
            if (beforeFilter !== afterFilter) {
                console.log(`[SkillCaster] 排除了 ${beforeFilter - afterFilter} 个死亡目标，剩余存活目标: ${afterFilter}`);
            }
        } else {
            console.log(`[SkillCaster] 包含死亡目标 (exclude_dead: false)`);
        }
        
        // 处理满血目标的包含/排除逻辑
        if (selector.include_full_hp) {
            // 强制包含满血目标（优先级最高）
        } else if (selector.exclude_full_hp) {
            // 排除满血目标
            const beforeFilter = candidates.length;
            candidates = candidates.filter(panel => {
                const stats = panel.getFinalStats();
                return panel.hero.hp < stats.maxhp;
            });
            const afterFilter = candidates.length;
        } else {
            // 默认行为：包含满血目标
        }
        
        // 排序和选择
        if (selector.orderBy) {
            candidates = this.sortTargets(candidates, selector.orderBy);
        }
        
        // 限制数量
        if (selector.count && selector.count > 0) {
            candidates = candidates.slice(0, selector.count);
        }
        
        return candidates;
    }

    /**
     * 按指定规则排序目标（新增方法）
     * @param targets 目标数组
     * @param orderBy 排序规则
     * @returns 排序后的目标数组
     */
    private sortTargets(targets: HeroPanel[], orderBy: string): HeroPanel[] {
        const sorted = targets.sort((a, b) => {
            const statA = a.getFinalStats();
            const statB = b.getFinalStats();
            const hpPercentA = a.hero.hp / statA.maxhp;
            const hpPercentB = b.hero.hp / statB.maxhp;

            switch (orderBy) {
                case 'hp_percent_asc':
                    return hpPercentA - hpPercentB;
                case 'hp_percent_desc':
                    return hpPercentB - hpPercentA;
                case 'attack_asc':
                    return statA.attack - statB.attack;
                case 'attack_desc':
                    return statB.attack - statA.attack;
                case 'random':
                    return Math.random() - 0.5;
                default:
                    return 0;
            }
        });
        
        return sorted;
    }

    /**
     * 发射子弹 (重构版)
     */
    private fireBullets(hero: GameObject, startPosition: Vec3, bulletModifiers: Modifier[], bulletId: string, heroAttack: number, heroCritRate: number = 0, heroCritDamage: number = 1.5): void {
        const baseBulletData = BulletConfig.getBulletData(bulletId);
        if (!baseBulletData) {
            console.warn(`未找到子弹配置: ${bulletId}`);
            return;
        }

        const enhancedBulletData = this.createEnhancedBulletData(baseBulletData, bulletModifiers, hero, heroAttack, heroCritRate, heroCritDamage);
        
        const enhancedBulletId = `${bulletId}_enhanced_${Date.now()}`;
        BulletConfig.addBulletConfig({ ...enhancedBulletData, id: enhancedBulletId });

        let startPos2D = new Vec2(startPosition.x, startPosition.y);
        let targetPos2D: Vec2 | null = null;
        
        // 特殊处理：石头人的子弹随机x位置但保持垂直向上发射
        if (bulletId === 'tanker_rock') {
            const screenWidth = 1600; // 固定屏幕宽度
            const randomRange = screenWidth * 0.75; // 75%的屏幕宽度
            const randomX = (Math.random() - 0.5) * randomRange;
            
            // 更新起始位置为随机x坐标
            startPos2D = new Vec2(randomX, startPosition.y);
            // 目标位置保持同样的x坐标，确保垂直发射
            targetPos2D = new Vec2(randomX, startPosition.y + 2000);
        }
        
        BulletManager.instance.getEventTarget().emit(game.gameEvent.FIRE_BULLET, {
            startPosition: startPos2D,
            targetPosition: targetPos2D, 
            bulletId: enhancedBulletId
        });
    }

    /**
     * 创建增强的子弹配置 (最终重构版)
     */
    private createEnhancedBulletData(baseBulletData: IBulletData, modifiers: Modifier[], hero: GameObject, heroAttack: number, heroCritRate: number = 0, heroCritDamage: number = 1.5): IBulletData {
        const enhanced: IBulletData = JSON.parse(JSON.stringify(baseBulletData)); // Deep copy
        
        // 1. 先将英雄的基础属性（已包含buff）设置到子弹数据
        enhanced.heroAttack = heroAttack;
        enhanced.heroCritRate = heroCritRate;
        enhanced.heroCritDamage = heroCritDamage;
        enhanced.heroId = hero.id;

        // console.log(`[SkillCaster] 创建增强子弹数据，基础攻击力: ${heroAttack}`);
        // console.log(`[SkillCaster] 应用 ${modifiers.length} 个修改器`);

        const applyValueMod = (base: number, modValue?: { add?: number; multiply?: number; }) => {
            if (!modValue) return base;
            let result = base;
            if (modValue.add) result += modValue.add;
            if (modValue.multiply) result *= (1 + modValue.multiply);
            return result;
        };

        for (const mod of modifiers) {
            // console.log(`[SkillCaster] 处理修改器:`, mod);
            
            // 2. 【修复】技能修改器应该影响子弹的基础伤害，而不是英雄攻击力
            if (mod.attack) {
                const oldDamage = enhanced.damage || 0;
                enhanced.damage = applyValueMod(enhanced.damage || 0, mod.attack);
                // console.log(`[SkillCaster] 子弹伤害修改器:`, mod.attack, `${oldDamage} -> ${enhanced.damage}`);
            }
            
            // 【新增】暴击率修改器
            if (mod.crit_rate) {
                const oldCritRate = enhanced.heroCritRate || 0;
                enhanced.heroCritRate = applyValueMod(enhanced.heroCritRate || 0, mod.crit_rate);
                // console.log(`[SkillCaster] 暴击率修改器:`, mod.crit_rate, `${oldCritRate} -> ${enhanced.heroCritRate}`);
            }
            
            // 【新增】暴击伤害修改器
            if (mod.crit_damage) {
                const oldCritDamage = enhanced.heroCritDamage || 1.5;
                enhanced.heroCritDamage = applyValueMod(enhanced.heroCritDamage || 1.5, mod.crit_damage);
                // console.log(`[SkillCaster] 暴击伤害修改器:`, mod.crit_damage, `${oldCritDamage} -> ${enhanced.heroCritDamage}`);
            }
            
            if (mod.bullet_speed) {
                const oldSpeed = enhanced.speed;
                enhanced.speed = applyValueMod(enhanced.speed, mod.bullet_speed);
                // console.log(`[SkillCaster] 子弹速度修改器:`, mod.bullet_speed, `${oldSpeed} -> ${enhanced.speed}`);
            }
            
            if (mod.scale) {
                const oldScale = enhanced.scale || 1;
                enhanced.scale = applyValueMod(enhanced.scale || 1, mod.scale);
                // console.log(`[SkillCaster] 子弹缩放修改器:`, mod.scale, `${oldScale} -> ${enhanced.scale}`);
            }
            
            if (mod.pierce) {
                const oldPierce = enhanced.pierce || 0;
                enhanced.pierce = applyValueMod(enhanced.pierce || 0, mod.pierce);
                // console.log(`[SkillCaster] 穿透修改器:`, mod.pierce, `${oldPierce} -> ${enhanced.pierce}`);
            }
            
            if (mod.bounce) {
                const oldBounce = enhanced.bounce || 0;
                enhanced.bounce = applyValueMod(enhanced.bounce || 0, mod.bounce);
                // console.log(`[SkillCaster] 反弹修改器:`, mod.bounce, `${oldBounce} -> ${enhanced.bounce}`);
            }
            
            if (mod.colCount) {
                const oldColCount = enhanced.colCount || 1;
                enhanced.colCount = Math.round(applyValueMod(enhanced.colCount || 1, mod.colCount));
                // console.log(`[SkillCaster] 列数修改器:`, mod.colCount, `${oldColCount} -> ${enhanced.colCount}`);
            }
            
            if (mod.waveCount) {
                const oldWaveCount = enhanced.waveCount || 1;
                enhanced.waveCount = Math.round(applyValueMod(enhanced.waveCount || 1, mod.waveCount));
                // console.log(`[SkillCaster] 波次修改器:`, mod.waveCount, `${oldWaveCount} -> ${enhanced.waveCount}`);
                // 使用默认波次间隔
                if (!enhanced.waveDelay) {
                    enhanced.waveDelay = 0.8; // 默认800ms间隔，增加波次间隔时间
                    // console.log(`[SkillCaster] 设置默认波次间隔: ${enhanced.waveDelay}秒`);
                }
            }

            if (mod.knockback) {
                if (!enhanced.knockback) enhanced.knockback = {};
                if (mod.knockback.force) {
                    const oldForce = enhanced.knockback.force || 0;
                    enhanced.knockback.force = applyValueMod(enhanced.knockback.force || 0, mod.knockback.force);
                    // console.log(`[SkillCaster] 击退力修改器:`, mod.knockback.force, `${oldForce} -> ${enhanced.knockback.force}`);
                }
                if (mod.knockback.chance !== undefined) {
                    enhanced.knockback.chance = mod.knockback.chance;
                    // console.log(`[SkillCaster] 击退概率设置为: ${enhanced.knockback.chance}`);
                }
            }
            
            if (mod.stun) {
                if (!enhanced.stun) enhanced.stun = { duration: 0 };
                if (mod.stun.duration !== undefined) {
                    // 【修复】眩晕时长应该累加，不是直接设置
                    enhanced.stun.duration += mod.stun.duration;
                    // console.log(`[SkillCaster] 眩晕时长累加: +${mod.stun.duration}秒，总计: ${enhanced.stun.duration}秒`);
                }
                if (mod.stun.chance !== undefined) {
                    enhanced.stun.chance = mod.stun.chance;
                    // console.log(`[SkillCaster] 眩晕概率设置为: ${enhanced.stun.chance}`);
                }
            }
            
            if (mod.slow) {
                if (!enhanced.slow) enhanced.slow = { percent: 0, duration: 0 };
                if (mod.slow.percent !== undefined) {
                    enhanced.slow.percent = mod.slow.percent;
                    // console.log(`[SkillCaster] 减速百分比设置为: ${enhanced.slow.percent}`);
                }
                if (mod.slow.duration !== undefined) {
                    // 【修复】减速时长应该累加，不是直接设置
                    enhanced.slow.duration += mod.slow.duration;
                    // console.log(`[SkillCaster] 减速时长累加: +${mod.slow.duration}秒，总计: ${enhanced.slow.duration}秒`);
                }
                if (mod.slow.chance !== undefined) {
                    enhanced.slow.chance = mod.slow.chance;
                    // console.log(`[SkillCaster] 减速概率设置为: ${enhanced.slow.chance}`);
                }
            }

            if (mod.entangle) {
                if (!enhanced.entangle) enhanced.entangle = { duration: 0, chance: 0 };
                if (mod.entangle.duration !== undefined) {
                    // 【修复】缠绕时长应该累加，不是直接设置
                    enhanced.entangle.duration += mod.entangle.duration;
                    // console.log(`[SkillCaster] 缠绕时长累加: +${mod.entangle.duration}秒，总计: ${enhanced.entangle.duration}秒`);
                }
                if (mod.entangle.chance !== undefined) {
                    enhanced.entangle.chance = mod.entangle.chance;
                    // console.log(`[SkillCaster] 缠绕概率设置为: ${enhanced.entangle.chance}`);
                }
            }

            if (mod.explosion) {
                if (!enhanced.explosion) {
                    enhanced.explosion = { enabled: false, radius: 0, damage: 0 };
                }
                
                // 启用爆炸效果
                if (mod.explosion.enabled) {
                    enhanced.explosion.enabled = true;
                }
                
                // 累加爆炸范围和伤害
                if (mod.explosion.radius !== undefined) {
                    enhanced.explosion.radius = (enhanced.explosion.radius || 0) + mod.explosion.radius;
                }
                if (mod.explosion.damage !== undefined) {
                    enhanced.explosion.damage = (enhanced.explosion.damage || 0) + mod.explosion.damage;
                }
                
                // console.log(`[SkillCaster] 爆炸效果累加为:`, enhanced.explosion);
            }
            
            // 【新增】处理持续伤害效果
            if (mod.dot) {
                // 如果子弹还没有element属性，初始化为数组
                if (!enhanced.element) {
                    enhanced.element = [];
                }
                
                // 检查是否已存在相同类型的DOT效果
                const existingDotIndex = enhanced.element.findIndex((e: any) => e.type === mod.dot.type);
                if (existingDotIndex >= 0) {
                    // 【修复】如果已存在，累加所有属性
                    const existingDot = enhanced.element[existingDotIndex];
                    
                    if (mod.dot.type === 'ice') {
                        // 对于ice类型，累加减速效果
                        const newSlowPercent = ((existingDot as any).slow_percent || 0) + 30; // 每层增加30%减速
                        (existingDot as any).slow_percent = newSlowPercent; // 不在这里限制，让Monster自己处理
                        existingDot.duration += mod.dot.duration; // 累加持续时间
                        // 累加概率（但不超过100%）
                        (existingDot as any).chance = Math.min(((existingDot as any).chance || 0) + (mod.dot.chance || 0), 1);
                        // 累加间隔（更频繁的触发）
                        existingDot.interval = Math.max(existingDot.interval - 0.1, 0.1); // 每层减少0.1秒间隔，最少0.1秒
                        

                    } else {
                        // 对于其他DOT类型，累加伤害和其他属性
                        existingDot.damage_per_tick += mod.dot.damage; // 累加伤害
                        existingDot.duration += mod.dot.duration; // 累加持续时间
                        // 累加概率（但不超过100%）
                        (existingDot as any).chance = Math.min(((existingDot as any).chance || 0) + (mod.dot.chance || 0), 1);
                        // 累加间隔（更频繁的触发）
                        existingDot.interval = Math.max(existingDot.interval - 0.1, 0.1); // 每层减少0.1秒间隔，最少0.1秒
                    }
                } else {
                    // 如果不存在，添加新效果
                    const dotElement = {
                        type: mod.dot.type,
                        damage_per_tick: mod.dot.damage,
                        duration: mod.dot.duration,
                        interval: mod.dot.interval,
                        chance: mod.dot.chance || 1
                    };
                    
                    // 对于ice类型，设置减速参数而不是伤害参数
                    if (mod.dot.type === 'ice') {
                        (dotElement as any).slow_percent = 30; // 基础减速30%
                        delete (dotElement as any).damage_per_tick; // 冰冻不造成伤害
                    }
                    
                    enhanced.element.push(dotElement);
                }
            }
        }
        
        // 对最终的子弹基础伤害和其他数值属性进行取整
        if (enhanced.damage !== undefined) {
            enhanced.damage = Math.round(enhanced.damage);
        }
        if (enhanced.pierce !== undefined) {
            enhanced.pierce = Math.round(enhanced.pierce);
        }
        if (enhanced.bounce !== undefined) {
            enhanced.bounce = Math.round(enhanced.bounce);
        }
        if (enhanced.knockback?.force !== undefined) {
            enhanced.knockback.force = Math.round(enhanced.knockback.force);
        }
        
        // 输出最终的waveDelay时间
        
        return enhanced;
    }

    /**
     * 【新增】应用回春术被动技能效果
     * @param caster 施法者
     */
    private applyRejuvenationEffects(caster: GameObject): void {
        const skillManager = SkillManager.getInstance();
        const rejuvenationSkill = skillManager.getEquippedSkills(caster.id).find(s => s.skill_id === 'rejuvenation');
        
        if (!rejuvenationSkill || rejuvenationSkill.stack <= 0) {
            return; // 没有学习回春术或者等级为0
        }

        // 为每层回春术技能创建一个周期性治疗效果
        for (let i = 0; i < rejuvenationSkill.stack; i++) {
            // 【修复】使用英雄的基础治疗强度，但仍然需要通过HealingCalculator进行完整计算
            // 这里只设置技能的基础值，治疗强度加成会在应用时计算
            const skillBaseHealing = 25 + (caster.healing_power || 0);
            
            console.log(`[回春术] 施法者 ${caster.id}: 基础治疗量 = 25 + ${caster.healing_power || 0} = ${skillBaseHealing}`);
            
            const rejuvenationEffect = {
                target: { 
                    type: 'allies' as const, 
                    count: 2, 
                    orderBy: 'hp_percent_asc' as const, 
                    include_self: true 
                },
                duration: 2, // 2秒持续时间
                modifier: {},
                tick: {
                    interval: 0.6, // 每0.5秒触发
                    modifier: {
                        hp: { add: skillBaseHealing } // 基础值 + hero.healing_power，装备治疗强度会在BuffManager中计算
                    }
                }
                // target_max_hp_percent: 0.001 // 【新增】恢复目标最大血量的1%
            };

            // 应用技能专用修改器（绽放、百花齐放等）
            const enhancedEffect = this.applySkillSpecificModifiers(rejuvenationEffect, caster);

            // 查找目标并添加Buff
            const targets = this.findTargets(caster, enhancedEffect.target);
            for (const targetPanel of targets) {
                if (targetPanel.buffManager) {
                    targetPanel.buffManager.addBuff(enhancedEffect, caster);
                }
            }
        }
    }
} 