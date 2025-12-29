import { _decorator, Component, director } from 'cc';
const { ccclass, property } = _decorator;

export interface IHeroDamageStats {
    heroId: string;
    totalDamage: number;
    percentage: number;
}

@ccclass('DamageStatsManager')
export class DamageStatsManager extends Component {
    private static _instance: DamageStatsManager;
    public static getInstance(): DamageStatsManager {
        if (!this._instance) {
            console.error("DamageStatsManager has not been initialized. Please add it to a persistent node in your scene.");
        }
        return this._instance;
    }

    private heroDamageMap: Map<string, number> = new Map();
    private totalDamage: number = 0;

    onLoad() {
        DamageStatsManager._instance = this
    }

    /**
     * 记录一次伤害
     * @param heroId 造成伤害的英雄ID
     * @param damage 伤害数值
     */
    public recordDamage(heroId: string, damage: number): void {
        if (!heroId || damage <= 0) {
            return;
        }

        // 记录英雄的独立伤害
        const currentDamage = this.heroDamageMap.get(heroId) || 0;
        this.heroDamageMap.set(heroId, currentDamage + damage);

        // 更新游戏总伤害
        this.totalDamage += damage;

        // --- 人性化的日志输出 ---
        // const allStats = this.getAllStats();
        // console.group(`--- 伤害统计更新 (总伤害: ${this.totalDamage.toFixed(0)}) ---`);
        // console.table(allStats);
        // console.groupEnd();
    }

    /**
     * 获取指定英雄的伤害统计
     */
    public getHeroStats(heroId: string): IHeroDamageStats | null {
        const damage = this.heroDamageMap.get(heroId);
        if (damage === undefined) {
            return null;
        }
        
        const percentage = this.totalDamage > 0 ? (damage / this.totalDamage) * 100 : 0;

        return {
            heroId,
            totalDamage: damage,
            percentage
        };
    }

    /**
     * 获取所有英雄的伤害统计，并按伤害从高到低排序
     */
    public getAllStats(): IHeroDamageStats[] {
        const stats: IHeroDamageStats[] = [];
        for (const [heroId, damage] of this.heroDamageMap.entries()) {
            const percentage = this.totalDamage > 0 ? (damage / this.totalDamage) * 100 : 0;
            stats.push({
                heroId,
                totalDamage: Math.round(damage), // 取整伤害值
                percentage: parseFloat(percentage.toFixed(2)) // 格式化百分比
            });
        }
        
        // 按伤害量降序排序
        return stats.sort((a, b) => b.totalDamage - a.totalDamage);
    }
    
    /**
     * 获取全局总伤害
     */
    public getTotalDamage(): number {
        return this.totalDamage;
    }

    /**
     * 重置所有统计数据
     */
    public reset(): void {
        this.heroDamageMap.clear();
        this.totalDamage = 0;
        console.log("Damage stats have been reset.");
    }
    
    onDestroy() {
        if (DamageStatsManager._instance === this) {
            DamageStatsManager._instance = null;
        }
    }
} 