import { EffectData, Modifier } from "../types";
import { GameObject } from "../object/GameObject";

let nextBuffId = 0;

/**
 * 代表一个施加在 GameObject 上的具体状态效果实例。
 * 它由一个 EffectData 创建，并由 BuffManager 管理。
 */
export class Buff {
    public readonly id: number;
    public readonly sourceId: string; // 施加此Buff的单位的ID
    public readonly effectData: EffectData;
    
    public duration: number; // 剩余持续时间 (秒)
    public timeSinceLastTick: number = 0;

    constructor(effectData: EffectData, source: GameObject) {
        this.id = nextBuffId++;
        this.effectData = effectData;
        this.sourceId = source.id;
        this.duration = effectData.duration;
    }

    /**
     * 重置全局Buff ID计数器（游戏结束时调用）
     */
    public static resetBuffIdCounter(): void {
        console.log('[Buff] 重置Buff ID计数器...');
        nextBuffId = 0;
        console.log('[Buff] Buff ID计数器重置完成');
    }

    /**
     * 更新Buff的持续时间并处理周期性效果（tick）。
     * @param dt 距离上一帧的时间（秒）。
     * @returns 如果Buff已过期，则返回 true，否则返回 false。
     */
    public update(dt: number): boolean {
        // 更新持续时间
        if (this.duration !== Infinity) {
            this.duration -= dt;
            if (this.duration <= 0) {
                return true; // 已过期
            }
        }
        
        // 处理周期性效果
        if (this.effectData.tick) {
            this.timeSinceLastTick += dt;
            // 注意：触发效果的逻辑在 BuffManager 中处理，这里只负责计时
        }

        return false; // 未过期
    }

    /**
     * 获取此Buff的属性修改器。
     */
    public get modifier(): Modifier {
        return this.effectData.modifier;
    }

    /**
     * 获取此Buff的周期性效果修改器。
     */
    public get tickModifier(): Modifier | null {
        return this.effectData.tick?.modifier || null;
    }
} 