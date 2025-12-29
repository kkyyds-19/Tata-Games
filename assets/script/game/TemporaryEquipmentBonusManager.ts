import { _decorator, Component, director, game } from 'cc';
import { ClassBonus } from '../user/UserEquipmentData';
import { HerosManager } from './HerosManager';
import { HeroPanel } from './HeroPanel';

const { ccclass } = _decorator;

/**
 * 临时装备加成管理器
 * 独立系统，负责管理临时装备对英雄的职业加成效果
 * 不影响现有的Buff系统和技能系统
 */
@ccclass('TemporaryEquipmentBonusManager')
export class TemporaryEquipmentBonusManager extends Component {
    private static instance: TemporaryEquipmentBonusManager;

    /**
     * 当前的临时装备职业加成数据
     */
    private currentBonuses: ClassBonus[] = [];

    /**
     * 获取单例实例
     */
    public static getInstance(): TemporaryEquipmentBonusManager {
        if (!TemporaryEquipmentBonusManager.instance) {
            console.warn('[TemporaryEquipmentBonusManager] 实例尚未创建，请确保在场景中添加此组件');
        }
        return TemporaryEquipmentBonusManager.instance;
    }

    protected onLoad(): void {
        // 设置单例
        if (TemporaryEquipmentBonusManager.instance) {
            console.warn('[TemporaryEquipmentBonusManager] 检测到重复实例，销毁当前实例');
            this.node.destroy();
            return;
        }
        
        TemporaryEquipmentBonusManager.instance = this;
        
        // 监听临时装备职业加成更新事件
        director.on(game.gameEvent.GAME_TEMPORARY_EQUIPMENT_CLASS_BONUSES_UPDATED, this.onTemporaryEquipmentBonusesUpdated, this);
        
        console.log('[TemporaryEquipmentBonusManager] 临时装备加成管理器已初始化');
    }

    protected onDestroy(): void {
        // 移除事件监听
        director.off(game.gameEvent.GAME_TEMPORARY_EQUIPMENT_CLASS_BONUSES_UPDATED, this.onTemporaryEquipmentBonusesUpdated, this);
        
        // 清理单例
        if (TemporaryEquipmentBonusManager.instance === this) {
            TemporaryEquipmentBonusManager.instance = null;
        }
        
        console.log('[TemporaryEquipmentBonusManager] 临时装备加成管理器已销毁');
    }

    /**
     * 处理临时装备职业加成更新事件
     * @param bonuses 新的职业加成数据
     */
    private onTemporaryEquipmentBonusesUpdated(bonuses: ClassBonus[]): void {
        console.log('[TemporaryEquipmentBonusManager] 收到临时装备职业加成更新');
        
        // 更新当前加成数据
        this.currentBonuses = bonuses;
        
        // 应用加成到所有活跃英雄
        this.applyBonusesToAllHeroes();
        
        // 输出更新详情
        this.logBonusUpdate();
    }

    /**
     * 应用加成到所有活跃英雄
     */
    private applyBonusesToAllHeroes(): void {
        const heroManager = HerosManager.getInstance();
        const activePanels = heroManager.getActiveHeroPanels();
        
        for (const panel of activePanels) {
            if (panel.hero) {
                this.applyBonusToHero(panel);
            }
        }
        
    }

    /**
     * 应用加成到指定英雄
     * @param heroPanel 英雄面板
     */
    private applyBonusToHero(heroPanel: HeroPanel): void {
        if (!heroPanel.hero) return;
        
        const hero = heroPanel.hero;
        const heroClass = hero.class;
        
        // 查找对应职业的加成
        const classBonus = this.currentBonuses.find(bonus => bonus.classType === heroClass);
        
        if (classBonus && classBonus.bonuses) {
            // 更新英雄的临时装备加成属性
            hero.temporaryEquipmentBonuses = { ...classBonus.bonuses };
            
            // 【调试】输出应用的加成
            if (Object.keys(classBonus.bonuses).length > 0) {
                const bonusTexts: string[] = [];
                for (const key in classBonus.bonuses) {
                    const value = classBonus.bonuses[key];
                    const percentage = (value * 100).toFixed(1);
                    bonusTexts.push(`${key}: +${percentage}%`);
                }
                
                console.log(
                    `[TemporaryEquipmentBonusManager] 英雄${hero.id}(${classBonus.className})应用加成: ${bonusTexts.join(', ')}`
                );
            }
        } else {
            // 清空加成
            hero.temporaryEquipmentBonuses = {};
        }
    }

    /**
     * 手动为指定英雄应用当前加成（用于新英雄加入或英雄复活时）
     * @param heroPanel 英雄面板
     */
    public applyCurrentBonusToHero(heroPanel: HeroPanel): void {
        if (this.currentBonuses.length > 0) {
            this.applyBonusToHero(heroPanel);
        }
    }

    /**
     * 获取指定职业的当前加成
     * @param classType 职业类型
     * @returns 加成数据，如果没有则返回空对象
     */
    public getBonusForClass(classType: number): { [key: string]: number } {
        const classBonus = this.currentBonuses.find(bonus => bonus.classType === classType);
        return classBonus ? { ...classBonus.bonuses } : {};
    }

    /**
     * 获取所有当前加成数据（只读）
     * @returns 当前所有职业加成
     */
    public getCurrentBonuses(): ClassBonus[] {
        return [...this.currentBonuses];
    }

    /**
     * 清除所有英雄的临时装备加成（游戏结束时调用）
     */
    public clearAllBonuses(): void {
        console.log('[TemporaryEquipmentBonusManager] 清除所有临时装备加成');
        
        this.currentBonuses = [];
        
        const heroManager = HerosManager.getInstance();
        const activePanels = heroManager.getActiveHeroPanels();
        
        for (const panel of activePanels) {
            if (panel.hero) {
                panel.hero.temporaryEquipmentBonuses = {};
            }
        }
        
        console.log('[TemporaryEquipmentBonusManager] 临时装备加成清除完成');
    }

    /**
     * 输出加成更新详情（用于调试）
     */
    private logBonusUpdate(): void {
        console.log('===—————————————————————————————————— 临时装备职业加成更新详情 *******************===');
        
        for (const bonus of this.currentBonuses) {
            const bonusTexts: string[] = [];
            for (const effectType in bonus.bonuses) {
                const value = bonus.bonuses[effectType];
                if (value > 0) {
                    const percentage = (value * 100).toFixed(1);
                    bonusTexts.push(`${effectType}: +${percentage}%`);
                }
            }
            
            if (bonusTexts.length > 0) {
                console.log(`  ${bonus.className}: ${bonusTexts.join(', ')}`);
            }
        }
        
        if (this.currentBonuses.every(b => Object.keys(b.bonuses).length === 0)) {
            console.log('  当前没有任何职业加成');
        }
    }

    /**
     * 检查系统是否正常运行（用于调试）
     */
    public debugStatus(): void {
        console.log('=== 临时装备加成管理器状态 ===');
        console.log(`当前加成数量: ${this.currentBonuses.length}`);
        
        const heroManager = HerosManager.getInstance();
        const activePanels = heroManager.getActiveHeroPanels();
        console.log(`活跃英雄数量: ${activePanels.length}`);
        
        for (const panel of activePanels) {
            if (panel.hero) {
                const bonusCount = Object.keys(panel.hero.temporaryEquipmentBonuses).length;
                console.log(`  英雄${panel.hero.id}: ${bonusCount}个加成属性`);
            }
        }
    }
} 