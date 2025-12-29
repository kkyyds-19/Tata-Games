import { Buff } from "./Buff";
import { EffectData, FinalStats, Modifier, ValueModifier } from "../types";
import { GameObject } from "../object/GameObject";
import { HerosManager } from "../HerosManager";
import { director, game } from 'cc';
import { HealingCalculator } from "../utils/HealingCalculator";

/**
 * 管理单个 GameObject 身上的所有 Buff。
 * 负责Buff的添加、移除、更新，并计算最终的属性修正。
 */
export class BuffManager {
    private owner: GameObject;
    private buffs: Buff[] = [];

    constructor(owner: GameObject) {
        this.owner = owner;
    }

    /**
     * 根据效果数据，向拥有者添加一个Buff。
     * @param effectData 定义Buff行为的效果数据
     * @param source 施加此Buff的来源单位
     * @param isPermanent 【新增】是否为永久光环类Buff
     */
    public addBuff(effectData: EffectData, source: GameObject, isPermanent: boolean = false) {
        // 子弹修改器不作为Buff直接添加到管理器
        if (effectData.is_bullet_modifier) {
            return;
        }
        
        const newBuff = new Buff(effectData, source);

        // 如果是永久Buff，将其持续时间设置为无限
        if (isPermanent) {
            newBuff.duration = Infinity;
        }

        this.buffs.push(newBuff);

        // 如果是瞬时效果 (duration: 0)，立即应用并移除
        if (newBuff.duration === 0) {
            this.applyInstantEffect(newBuff.modifier, source, effectData.target_max_hp_percent);
            this.removeBuff(newBuff.id);
        }
    }

    /**
     * 根据ID移除一个Buff。
     */
    public removeBuff(buffId: number) {
        this.buffs = this.buffs.filter(b => b.id !== buffId);
    }

    /**
     * 移除所有来自特定来源的Buff（用于处理光环提供者死亡的情况）。
     */
    public removeBuffsFromSource(sourceId: string) {
        this.buffs = this.buffs.filter(b => b.sourceId !== sourceId);
    }
    
    /**
     * 每帧更新所有Buff的状态。
     * @param dt 距离上一帧的时间（秒）
     */
    public update(dt: number) {
        const expiredBuffIds: number[] = [];

        for (const buff of this.buffs) {
            const tickInterval = buff.effectData.tick?.interval;
            let justTicked = false;
            if (tickInterval) {
                if (buff.timeSinceLastTick >= tickInterval) {
                    const sourceGameObject = this.findGameObjectBySourceId(buff.sourceId);
                    this.applyInstantEffect(buff.tickModifier, sourceGameObject, buff.effectData.target_max_hp_percent);
                    buff.timeSinceLastTick -= tickInterval;
                    justTicked = true;
                }
            }

            if (buff.update(dt) && !justTicked) {
                expiredBuffIds.push(buff.id);
                // console.log(`[BuffManager] ${this.owner.name} Buff过期: ID=${buff.id}`);
            }
        }

        if (expiredBuffIds.length > 0) {
            this.buffs = this.buffs.filter(b => expiredBuffIds.indexOf(b.id) === -1);
        }
    }

    /**
     * 【修复】根据sourceId查找对应的GameObject
     * @param sourceId 源ID
     * @returns GameObject或null
     */
    private findGameObjectBySourceId(sourceId: string): GameObject | null {
        // 通过HerosManager查找对应的英雄
        const heroPanel = HerosManager.getInstance().getActiveHeroPanels().find(p => p.hero.id === sourceId);
        return heroPanel ? heroPanel.hero : null;
    }

    /**
     * 应用一个瞬时的效果修改器（如治疗）。
     * 【修改】增加施法者参数以支持治疗强度计算
     */
    private applyInstantEffect(modifier: Modifier | null, source?: GameObject, targetMaxHpPercent?: number) {
        if (!modifier) return;

        // 处理生命值变动
        if (modifier.hp) {
            let baseHealing = 0;
            let percentHealing = 0;
            
            // 处理固定数值治疗
            if (modifier.hp.add) {
                baseHealing = modifier.hp.add;
            }
            
            // 处理百分比治疗
            if (modifier.hp.multiply) {
                percentHealing = modifier.hp.multiply;
            }
            
            // 如果没有治疗量，直接返回
            if (baseHealing === 0 && percentHealing === 0) return;
            
            let healingAmount = baseHealing;
            
            /**
             * 【兼容性说明】
             * 这里使用传入的targetMaxHpPercent参数，该参数通常由SkillCaster传入
             * 如果SkillCaster没有传入百分比参数，则使用0.005作为默认值
             * 这样可以确保BuffManager和SkillCaster的治疗计算逻辑保持一致
             */
            const defaultExtraHealingPercent = 0.005; // 0.5%的默认额外治疗百分比
            const finalPercentHealing = percentHealing || targetMaxHpPercent || defaultExtraHealingPercent;
            
            // 如果有施法者，应用治疗强度修改器（现在支持基于目标血量的治疗）
            if (source && (baseHealing > 0 || finalPercentHealing > 0)) {
                healingAmount = this.applyHealingModifiers(baseHealing, source, this.owner, finalPercentHealing);
            }
            
            const oldHp = this.owner.hp;
            this.owner.hp = Math.min(this.owner.maxhp, this.owner.hp + healingAmount);
            const actualHealing = this.owner.hp - oldHp;
            
            // 触发治疗事件（用于UI显示）- 总是发送事件以显示治疗数字
            this.triggerHealingEvent(actualHealing > 0 ? actualHealing : healingAmount, source);
        }
        // 未来可扩展处理其他瞬时效果
    }

    /**
     * 【重构】计算治疗强度修改后的治疗量 - 现在使用统一的工具类
     * @param baseHealing 基础治疗量
     * @param source 施法者
     * @param target 被治疗目标（可选）
     * @param targetMaxHpPercent 基于目标最大血量的治疗百分比（可选）
     * @returns 最终治疗量
     */
    private applyHealingModifiers(baseHealing: number, source?: GameObject, target?: GameObject, targetMaxHpPercent?: number): number {
        return HealingCalculator.calculateFinalHealing(baseHealing, source, target, targetMaxHpPercent);
    }

    /**
     * 【新增】触发治疗事件
     * @param amount 实际治疗量
     * @param source 施法者
     */
    private triggerHealingEvent(amount: number, source?: GameObject) {
        // 通过事件系统发送治疗消息
        director.emit(game.gameEvent.GAME_HEAL_EFFECT, { 
            target: this.owner, 
            healAmount: amount 
        });
        
        // console.log(`[BuffManager] 发送治疗事件: ${this.owner.name} 治疗 ${amount} 点，当前血量: ${this.owner.hp}/${this.owner.maxhp}`);
    }

    /**
     * 将所有持续性Buff的效果合并，应用到基础属性上，返回最终属性。
     * @param baseStats 拥有者的基础属性
     * @returns 计算Buff加成后的最终属性
     */
    public applyModifiers(baseStats: FinalStats): FinalStats {
        const combinedModifier: Modifier = this.getCombinedModifier();
        
        const finalStats = { ...baseStats };

        const applyValueMod = (base: number, mod: ValueModifier | undefined): number => {
            if (!mod) return base;
            const add = mod.add || 0;
            const multiply = mod.multiply || 0;
            return (base + add) * (1 + multiply);
        };

        finalStats.maxhp = applyValueMod(baseStats.maxhp, combinedModifier.maxhp);
        finalStats.defense = applyValueMod(baseStats.defense, combinedModifier.defense);
        finalStats.attack = applyValueMod(baseStats.attack, combinedModifier.attack);
        finalStats.damageReduction = applyValueMod(baseStats.damageReduction, combinedModifier.damageReduction);
        finalStats.skill_cooldown = applyValueMod(baseStats.skill_cooldown, combinedModifier.skill_cooldown);
        finalStats.crit_rate = applyValueMod(baseStats.crit_rate, combinedModifier.crit_rate);
        finalStats.crit_damage = applyValueMod(baseStats.crit_damage, combinedModifier.crit_damage);
        finalStats.lifesteal_percent = applyValueMod(baseStats.lifesteal_percent, combinedModifier.lifesteal_percent);
        finalStats.thornArmor = applyValueMod(baseStats.thornArmor, combinedModifier.thornArmor);
        // 【新增】应用治疗强度加成
        finalStats.healing_power = applyValueMod(baseStats.healing_power, combinedModifier.healing_power);

        // 在最大生命值增加后，按比例增加当前生命值
        if (finalStats.maxhp > baseStats.maxhp) {
             const hpRatio = this.owner.hp / baseStats.maxhp;
             this.owner.hp = Math.round(hpRatio * finalStats.maxhp);
        } else {
             this.owner.hp = Math.min(finalStats.maxhp, this.owner.hp);
        }

        //技能cd 缩短时间 2秒
        // finalStats.skill_cooldown = finalStats.skill_cooldown * (1 - this.owner.skill_cd_reduce);
        const reduced = finalStats.skill_cooldown * (1 - this.owner.skill_cd_reduce);
        finalStats.skill_cooldown = Math.max(reduced, 2);

        return finalStats;
    }

    /**
     * 合并所有激活的、持续性的Buff的修改器。
     */
    public getCombinedModifier(): Modifier {
        const combined: Modifier = {};
        
        // 定义哪些键是用于修改角色数值的 (类型为 ValueModifier)
        const statKeys: (keyof Modifier)[] = [
            'maxhp', 'attack', 'defense', 'damageReduction', 
            'skill_cooldown', 'crit_rate', 'crit_damage', 
            'lifesteal_percent', 'thornArmor', 'healing_power'  // 【新增】支持治疗强度
        ];

        for (const buff of this.buffs.filter(b => b.duration !== 0)) { // 只合并持续性Buff
            for (const key of statKeys) {
                const valueMod = buff.modifier[key] as ValueModifier;

                if (valueMod && (valueMod.add || valueMod.multiply)) {
                    if (!(combined[key] as ValueModifier)) {
                        (combined[key] as ValueModifier) = { add: 0, multiply: 0 };
                    }
                    const combinedValueMod = combined[key] as ValueModifier;
                    combinedValueMod.add += valueMod.add || 0;
                    combinedValueMod.multiply += valueMod.multiply || 0;
                }
            }
        }
        
        // 【新增】合并技能专用修改器
        combined.skill_modifiers = {};
        
        for (const buff of this.buffs.filter(b => b.duration !== 0)) {
            const skillMods = buff.modifier.skill_modifiers;
            if (skillMods) {
                for (const skillId in skillMods) {
                    if (!combined.skill_modifiers[skillId]) {
                        combined.skill_modifiers[skillId] = {};
                    }
                    
                    const targetMod = combined.skill_modifiers[skillId];
                    const sourceMod = skillMods[skillId];
                    
                    // 累加各种修改器
                    targetMod.duration_multiply = (targetMod.duration_multiply || 0) + (sourceMod.duration_multiply || 0);
                    targetMod.duration_add = (targetMod.duration_add || 0) + (sourceMod.duration_add || 0);
                    targetMod.target_count_add = (targetMod.target_count_add || 0) + (sourceMod.target_count_add || 0);
                    targetMod.target_count_multiply = (targetMod.target_count_multiply || 0) + (sourceMod.target_count_multiply || 0);
                    targetMod.healing_multiply = (targetMod.healing_multiply || 0) + (sourceMod.healing_multiply || 0);
                    targetMod.interval_multiply = (targetMod.interval_multiply || 0) + (sourceMod.interval_multiply || 0);
                }
            }
        }
        
        return combined;
    }

    /**
     * 获取所有与子弹相关的修改器。
     * 这些修改器不会被合并，而是作为数组返回，由子弹发射逻辑逐一应用。
     */
    public getBulletModifiers(): Modifier[] {
        return this.buffs
            .filter(b => b.effectData.is_bullet_modifier)
            .map(b => b.modifier);
    }

    /**
     * 【新增】清除所有技能相关的永久Buff
     * 用于重新应用技能效果时清除旧的效果
     */
    public clearSkillBuffs() {
        // 移除所有持续时间为无限的Buff（即永久技能效果）
        this.buffs = this.buffs.filter(b => b.duration !== Infinity);
    }

    /**
     * 清理所有Buff（游戏结束时调用）
     */
    public clearAllBuffs(): void {
        console.log(`[BuffManager] 清理 ${this.owner.name} 的所有Buff...`);
        try {
            // 清理所有Buff
            this.buffs = [];
            console.log(`[BuffManager] ${this.owner.name} 的Buff清理完成`);
        } catch (error) {
            console.error(`[BuffManager] 清理 ${this.owner.name} 的Buff时出错:`, error);
        }
    }
} 