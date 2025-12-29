import { _decorator, Component, Node, Sprite, SpriteFrame, UIOpacity, SpriteAtlas } from 'cc';
import { ResourceConfig } from '../global/config/ResourceConfig';
import { GameObject } from '../game/object/GameObject';
import { IconEffect } from '../utils/IconEffect';
import { UserClassData } from '../user/UserClassData';
import { UserArmyData } from '../user/UserArmyData';
import { qualityClassRecMap } from '../global/config/QualityConfig';

const { ccclass, property } = _decorator;

/**
 * 小英雄图标组件
 * 用于显示英雄头像和背景框
 */
@ccclass('SmallHeroIcon')
export class SmallHeroIcon extends Component {

    @property(Sprite)
    icon_bg: Sprite = null;

    @property(Sprite)
    icon_effect: Sprite = null;

    @property(Sprite)
    icon: Sprite = null;

    @property([SpriteAtlas])
    public mAtlas: SpriteAtlas[] = [];

    // 当前英雄ID
    private currentHeroId: string = '';
    
    // 动画播放状态
    private isAnimationPlaying: boolean = false;

    onLoad() {
        // 初始状态重置所有显示
        // this.resetDisplay();
        this.stopAnimation();
    }



    public setHeroByGameObject(hero:GameObject) {
        this.resetDisplay()
        this.currentHeroId = hero.id;
        // 设置英雄头像
        this.setHeroIcon(hero.id);
        
        // 设置背景框（根据星级）
        this.setIconBackground(hero);
    }

    /**
     * 通过英雄ID设置图标和背景
     */
    public setHeroById(heroId: string) {
        this.resetDisplay()
        this.currentHeroId = heroId;
        // 设置英雄头像
        this.setHeroIcon(heroId);

        const classData = UserClassData.getInstance().getClassDataByHeroId(heroId)
        if (!classData) {
            console.warn(`[SmallHeroIcon] 未找到英雄配置: ${heroId}`);
            return;
        }
        const cardId = classData.cardId
        const heroStar = UserArmyData.getInstance().getCardById(cardId).quality

        //通过id 获取 活跃英雄 数据
        // 设置背景框（根据星级）
        this.setIconBackgroundbyStar(heroStar);
    }

    /**
     * 设置英雄头像
     */
    private setHeroIcon(heroId: string) {
        if (!this.icon) {
            console.warn('[SmallHeroIcon] icon 组件未找到');
            return;
        }

        const iconFrameName = this.getHeroIconFrameName(heroId);
        const spriteFrame = this.getSpriteFrameFromAtlas(iconFrameName);
        
        if (spriteFrame) {
            this.icon.spriteFrame = spriteFrame;
            // console.log(`[SmallHeroIcon] 成功设置英雄图标: ${iconFrameName}`);
        } else {
            console.warn(`[SmallHeroIcon] 未找到英雄图标: ${iconFrameName}`);
        }
    }

    /**
     * 设置图标背景
     */
    private setIconBackground(hero:GameObject) {
        this.setIconBackgroundbyStar(hero.heroStar)
    }

     /**
     * 设置图标背景
     */
     private setIconBackgroundbyStar(heroStar:number) {
        if (!this.icon_bg||heroStar==null||heroStar==undefined||heroStar<0) {
            console.warn('[SmallHeroIcon] icon_bg 组件未找到');
            return;
        }

        const bgFrameName = qualityClassRecMap[heroStar];
        const spriteFrame = this.getSpriteFrameFromAtlas(bgFrameName);
        
        if (spriteFrame) {
            this.icon_bg.spriteFrame = spriteFrame;
            // console.log(`[SmallHeroIcon] 成功设置背景图标: ${bgFrameName}, 星级: ${heroStar}`);
        } else {
            console.warn(`[SmallHeroIcon] 未找到背景图标: ${bgFrameName}`);
        }
    }

    /**
     * 根据英雄ID获取图标帧名称
     */
    private getHeroIconFrameName(heroId: string): string {
        // 从ResourceConfig中查找对应的英雄配置
        const heroConfig = ResourceConfig.heros_list.find(hero => hero.id === heroId);
        if (heroConfig && heroConfig.iconFrameName) {
            return heroConfig.iconFrameName;
        }
        
        // 备选方案：使用skinName
        if (heroConfig && heroConfig.skinName) {
            return heroConfig.skinName;
        }
        
        // 默认使用heroId
        return heroId;
    }

  

    /**
     * 从图集中获取SpriteFrame
     */
    private getSpriteFrameFromAtlas(frameName: string): SpriteFrame | null {
        if (!this.mAtlas || this.mAtlas.length === 0) {
            console.warn('[SmallHeroIcon] mAtlas 未设置或为空');
            return null;
        }

        // 遍历所有图集查找指定的帧
        for (const atlas of this.mAtlas) {
            if (atlas) {
                const spriteFrame = atlas.getSpriteFrame(frameName);
                if (spriteFrame) {
                    return spriteFrame;
                }
            }
        }

        return null;
    }



    /**
     * 重置显示
     */
    public resetDisplay() {
        // 清空头像
        if (this.icon) {
            this.icon.spriteFrame = null;
        }
        
        // 清空背景
        if (this.icon_bg) {
            this.icon_bg.spriteFrame = null;
        }
        
        // 停止动画并重置状态
        this.stopAnimation();
        
        this.currentHeroId = '';
        
        // console.log('[SmallHeroIcon] 重置显示完成');
    }

    /**
     * 获取当前英雄ID
     */
    public getCurrentHeroId(): string {
        return this.currentHeroId;
    }

    /**
     * 直接设置英雄头像（通过SpriteFrame）
     */
    public setHeroIconDirect(spriteFrame: SpriteFrame) {
        if (this.icon && spriteFrame) {
            this.icon.spriteFrame = spriteFrame;
        }
    }

    /**
     * 直接设置背景图标（通过SpriteFrame）
     */
    public setIconBgDirect(spriteFrame: SpriteFrame) {
        if (this.icon_bg && spriteFrame) {
            this.icon_bg.spriteFrame = spriteFrame;
        }
    }

    /**
     * 设置图标透明度
     */
    public setOpacity(opacity: number) {
        // 使用UIOpacity组件设置透明度
        let uiOpacity = this.node.getComponent(UIOpacity);
        if (!uiOpacity) {
            uiOpacity = this.node.addComponent(UIOpacity);
        }
        uiOpacity.opacity = opacity;
    }

    /**
     * 设置图标缩放
     */
    public setScale(scale: number) {
        this.node.setScale(scale, scale);
    }

    /**
     * 获取动画播放状态
     */
    public isPlayingAnimation(): boolean {
        return this.isAnimationPlaying;
    }

    /**
     * 停止图标动画效果
     */
    public stopAnimation() {
        if (!this.icon_effect) {
            // console.warn('[SmallHeroIcon] icon_effect 组件未找到，无法停止动画');
            return;
        }

        const iconEffect = this.icon_effect.getComponent(IconEffect);
        if (iconEffect) {
            iconEffect.stopEffect();
            this.isAnimationPlaying = false; // 更新播放状态
            // console.log('[SmallHeroIcon] 成功停止动画');
        } else {
            // console.warn('[SmallHeroIcon] IconEffect 组件未找到，无法停止动画');
        }
    }

    /**
     * 播放大转盘奖励特效（缩放+旋转）
     * @param rotateTime 旋转时间（默认1.0秒）
     * @param scaleTime 缩放时间（默认0.5秒）
     * @param minScale 最小缩放（默认0.9倍）
     * @param maxScale 最大缩放（默认1.1倍）
     */
    public playLuckWheelPrizeEffect(
        rotateTime: number = 4.0,
        scaleTime: number = 1.0,
        minScale: number = 2,
        maxScale: number = 3
    ) {
        // 检查是否已经在播放动画
        if (this.isAnimationPlaying) {
            return;
        }

        if (!this.icon_effect) {
            return;
        }

        const iconEffect = this.icon_effect.getComponent(IconEffect);
        if (iconEffect) {
            // 先停止之前的动画，再播放新动画
            iconEffect.stopEffect();
            iconEffect.playScaleRotateEffect(rotateTime, scaleTime, minScale, maxScale, 360);
            this.isAnimationPlaying = true; // 标记为播放状态
            // console.log(`[SmallHeroIcon] 播放大转盘奖励特效，参数: 旋转${rotateTime}s, 缩放${scaleTime}s, 范围${minScale}-${maxScale}`);
        } else {
            // console.warn('[SmallHeroIcon] IconEffect 组件未找到，无法播放动画');
        }
    }
} 