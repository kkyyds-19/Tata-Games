import { _decorator, Component, Node, Label, ProgressBar, Prefab, instantiate } from 'cc';
import { IHeroDamageStats } from '../game/DamageStatsManager';
import { SmallHeroIcon } from './SmallHeroIcon';
import { Utils } from '../utils/Utils';

const { ccclass, property } = _decorator;

/**
 * 英雄图标组件
 * 用于显示英雄头像、伤害占比进度条和伤害数值
 */
@ccclass('ResultHeroIcon')
export class ResultHeroIcon extends Component {

    @property(Prefab)
    smallHeroIcon: Prefab = null;

    @property(ProgressBar)
    damageProgressBar: ProgressBar = null;

    @property(Label)
    damageLabel: Label = null;

    // 当前英雄数据
    private heroStats: IHeroDamageStats = null;
    
    // 小英雄图标实例
    private smallHeroIconComponent: SmallHeroIcon = null;
    
    // 缓存的英雄ID，用于延迟设置
    private pendingHeroId: string = null;

    onLoad() {

        this.initSmallHeroIcon();
        this.resetDisplay();
    }
    start(){
    }

    /**
     * 初始化小英雄图标
     */
    private initSmallHeroIcon() {
        if (!this.smallHeroIcon) {
            console.warn('[ResultHeroIcon] smallHeroIcon prefab 未设置');
            return;
        }

        // 实例化小英雄图标预制体
        const heroIconNode = instantiate(this.smallHeroIcon);
        
        if (heroIconNode) {
            heroIconNode.parent = this.node;
            this.smallHeroIconComponent = heroIconNode.getComponent(SmallHeroIcon);
            
            if (!this.smallHeroIconComponent) {
                console.error('[ResultHeroIcon] SmallHeroIcon 组件未找到');
            } else {
                // 如果有缓存的英雄ID，立即设置
                if (this.pendingHeroId) {
                    this.smallHeroIconComponent.setHeroById(this.pendingHeroId);
                    this.pendingHeroId = null; // 清空缓存
                }
            }
        } else {
            console.error('[ResultHeroIcon] 实例化小英雄图标失败');
        }
    }

    /**
     * 设置英雄统计数据
     */
    public setHeroStats(stats: IHeroDamageStats) {
        this.heroStats = stats;
        
        // 设置小英雄图标
        this.setSmallHeroIcon(stats.heroId);
        
        // 设置伤害数值
        this.updateDamageDisplay(stats.totalDamage);
        
        // 设置伤害占比进度条
        this.updateProgressBar(stats.percentage);
        

    }

    /**
     * 设置小英雄图标
     */
    private setSmallHeroIcon(heroId: string) {
        if (this.smallHeroIconComponent) {
            this.smallHeroIconComponent.setHeroById(heroId);
        } else {
            // 缓存英雄ID，等待初始化完成后设置
            this.pendingHeroId = heroId;
        }
    }

    /**
     * 更新伤害数值显示
     */
    private updateDamageDisplay(damage: number) {
        if (this.damageLabel) {
            this.damageLabel.string = Utils.formatNumber(damage);
        }
    }

    /**
     * 更新进度条显示
     */
    private updateProgressBar(percentage: number) {
        if (this.damageProgressBar) {
            // 进度条值为 0-1，百分比为 0-100
            const progress = Math.max(0, Math.min(percentage / 100, 1));
            this.damageProgressBar.progress = progress;
        }
    }

    /**
     * 重置显示
     */
    public resetDisplay() {
        // 重置小英雄图标
        if (this.smallHeroIconComponent) {
            this.smallHeroIconComponent.resetDisplay();
        }
        
        // 重置进度条
        if (this.damageProgressBar) {
            this.damageProgressBar.progress = 0;
        }
        
        // 清空标签
        if (this.damageLabel) {
            this.damageLabel.string = "0";
        }
        
        this.heroStats = null;
        

    }

    /**
     * 获取当前英雄统计数据
     */
    public getHeroStats(): IHeroDamageStats {
        return this.heroStats;
    }



    /**
     * 获取小英雄图标组件
     */
    public getSmallHeroIcon(): SmallHeroIcon {
        return this.smallHeroIconComponent;
    }
} 