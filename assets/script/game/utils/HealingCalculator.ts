import { GameObject } from '../object/GameObject';
import { HerosManager } from '../HerosManager';

/**
 * 治疗强度计算工具类
 * 统一处理所有治疗强度相关的计算逻辑
 */
export class HealingCalculator {
    /**
     * 计算最终治疗量
     * @param baseHealing 基础治疗量
     * @param source 施法者
     * @param target 被治疗目标（可选，用于基于目标血量的治疗计算）
     * @param targetMaxHpPercent 基于目标最大血量的治疗百分比（可选，例如0.1表示治疗目标最大血量的10%）
     * @returns 最终治疗量
     */
    public static calculateFinalHealing(baseHealing: number, source?: GameObject, target?: GameObject, targetMaxHpPercent?: number): number {
        // 【新增】计算基于目标最大血量的治疗量
        let finalBaseHealing = baseHealing;
        
        /**
         * 【兼容性治疗计算】
         * targetMaxHpPercent参数支持两种用途：
         * 1. 技能配置的百分比治疗：如森林贤者的hp.multiply = 0.6
         * 2. 兼容性额外治疗：默认0.005（0.5%），为所有治疗技能提供小幅额外效果
         * 
         * 计算逻辑：
         * - 如果targetMaxHpPercent > 0，则计算目标最大血量 × targetMaxHpPercent的额外治疗量
         * - 最终治疗量 = 基础治疗量 + 百分比治疗量
         * - 然后应用治疗强度修改器
         */
        if (target && targetMaxHpPercent && targetMaxHpPercent > 0) {
            const targetMaxHpHealing = target.maxhp * targetMaxHpPercent;
            finalBaseHealing = baseHealing + targetMaxHpHealing;
            // console.log(`[治疗计算] 基于目标血量: ${baseHealing} + ${target.maxhp} × ${targetMaxHpPercent} = ${finalBaseHealing}`);
        }
        
        if (!source) {
            return Math.round(finalBaseHealing);
        }

        // 获取施法者的HeroPanel来访问BuffManager
        const sourcePanel = HerosManager.getInstance().getActiveHeroPanels().find(p => p.hero.id === source.id);
        if (!sourcePanel?.buffManager) {
            return Math.round(finalBaseHealing);
        }

        // 获取施法者的治疗强度修改器
        const combinedModifier = sourcePanel.buffManager.getCombinedModifier();
        const healingPower = combinedModifier.healing_power;
        const equipHealingPower = Math.round((source.healing_power_equip || 0) * 100) / 100; // 修正浮点数精度

        if (!healingPower) {
            const result = Math.round(finalBaseHealing + equipHealingPower);
            return result;
        }

        // 应用治疗强度修改器：(基础值 + 加法修改) * (1 + 乘法修改) + 装备治疗强度
        const addBonus = healingPower.add || 0;
        const multiplyBonus = Math.round((healingPower.multiply || 0) * 100) / 100; // 修正浮点数精度
        const finalHealing = (finalBaseHealing + addBonus) * (1 + multiplyBonus) + equipHealingPower;

        const result = Math.round(finalHealing);
        
        return result;
    }

    /**
     * 计算基于目标最大血量百分比的治疗量
     * @param targetMaxHpPercent 目标最大血量的百分比（例如0.1表示治疗目标最大血量的10%）
     * @param source 施法者
     * @param target 被治疗目标
     * @param additionalHealing 额外的固定治疗量（可选）
     * @returns 最终治疗量
     */
    public static calculatePercentHealing(targetMaxHpPercent: number, source?: GameObject, target?: GameObject, additionalHealing: number = 0): number {
        return this.calculateFinalHealing(additionalHealing, source, target, targetMaxHpPercent);
    }
} 