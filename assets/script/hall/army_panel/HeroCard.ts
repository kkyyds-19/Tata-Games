import { _decorator, Component, Node, Sprite, Label, resources, sp, SpriteFrame, SpriteAtlas } from 'cc';
import { UserArmyData, CardData } from '../../user/UserArmyData';
import { UserClassData } from '../../user/UserClassData';
import { ResourceConfig } from '../../global/config/ResourceConfig';
import { qualityHeroCardBgMap, qualityStarMap } from '../../global/config/QualityConfig';
const { ccclass, property } = _decorator;

/**
 * 英雄卡片组件
 * 用于显示英雄的基本信息和状态
 */
@ccclass('HeroCard')
export class HeroCard extends Component {

    @property(Sprite)
    backgroundSprite: Sprite = null;

    @property(Node)
    skeletonNode: Node = null;

    @property(Sprite)
    classIconSprite: Sprite = null;

    @property(Label)
    levelLabel: Label = null;

    @property(Sprite)
    upgradeHintSprite: Sprite = null;
    //上阵提示节点
    @property(Node)
    onFieldNode: Node = null;

    //超级卡片 sprite 节点
    @property(Node)
    superCardNode: Node = null;

    //星星 节点
    @property(Node)
    starNode: Node = null;

    @property(Node)
    public choose: Node = null;

    @property(Node)
    public flg: Node = null;

    // 英雄等级（独立管理，不存储在cardData中）
    private _heroLevel: number = 1;

    // 卡片完整数据
    public cardData: CardData = null;

    onLoad() {
        this.initializeCard();
    }

    start() {
        this.updateUpgradeHint(false);
        this.updateUI();
    }

    //上阵提示节点
    public showOnFieldNode(): void {
        if (this.onFieldNode) {
            this.onFieldNode.active = true;
        }
    }
    //隐藏上阵提示节点
    public hideOnFieldNode(): void {
        if (this.onFieldNode) {
            this.onFieldNode.active = false;
        }
    }

    public showChoose(): void {
        if (this.choose) {
            this.choose.active = true;
        }
        if (this.flg) {
            this.flg.active = true;
        }


    }
    public hideChoose(): void {
        if (this.choose) {
            this.choose.active = false;
        }
        if (this.flg) {
            this.flg.active = false;
        }
    }

    /**
     * 初始化卡片
     */
    private initializeCard(): void {
       
    }

    /**
     * 设置英雄数据（通过卡片ID，不包含等级）
     * @param cardId 卡片ID
     */
    public setHeroData(cardId: string): void {
        // 从用户卡片列表中获取卡片数据
        const cardData = UserArmyData.getInstance().getCardById(cardId);
        if (cardData) {
            this.cardData = cardData;
            this.updateUI();
        }
    }

    /**
     * 设置英雄数据（通过卡片ID，不包含等级）
     * @param cardId 卡片ID
     */
    public setHeroDataWithCardData(cardData: CardData): void {
       
        
        // 从用户卡片列表中获取卡片数据
       
        if (cardData) {
            this.cardData = cardData;
            
            this.updateUI();
        }
    }

    /**
     * 从 UserClassData 自动获取并设置等级
     * 如果卡片已上场，则获取对应的等级；否则保持默认等级1
     */
    public loadLevelFromClassData(): void {
        if (this.cardData && this.cardData.cardId) {
            const level = UserClassData.getInstance().getCardLevel(this.cardData.cardId);
            if (level > 0) {
                this._heroLevel = level;
                this.updateLevelDisplay();
            }
        }
    }

    /**
     * 设置英雄等级（外部调用）
     * @param level 新等级
     */
    public setLevel(level: number): void {
        if (level > 0) {
            this._heroLevel = level;
            this.updateLevelDisplay();
        }
    }

    /**
     * 同步等级到 UserClassData（如果卡片已上场）
     * @param level 新等级
     */
    public syncLevelToClassData(level: number): void {
        if (this.cardData && this.cardData.cardId && level > 0) {
            UserClassData.getInstance().setCardLevel(this.cardData.cardId, level);
            this._heroLevel = level;
            this.updateLevelDisplay();
        }
    }

    /**
     * 更新等级显示
     */
    private updateLevelDisplay(): void {
        if (this.levelLabel) {
            this.levelLabel.string = `Lv.${this._heroLevel}级`;
        }
    }

    /**
     * 更新等级标签的描述文字
     * @param description 具体的描述内容，如："(23/30)"
     */
    public updateLevelDescription(description: string): void {
        if (this.levelLabel) {
            this.levelLabel.string = description;
        }
    }

    /**
     * 更新UI显示
     */
    public updateUI(): void {
        // 更新等级显示
        this.updateLevelDisplay();

        // 更新可升级提示 - 使用专门的方法
        // this.updateUpgradeHint(this._canUpgrade);

        // 更新骨骼动画（如果需要）
        this.updateSkeletonAnimation();

        // 更新职业图标（如果需要）
        this.updateClassIcon();

        // 更新背景框（根据品质）
        this.updateBackgroundFrame();

        //更新S阶级
        this.updateSLevel();

        //更新
        this.updateStar();
    }
    //星星
    private updateStar(): void {
        if (!this.cardData) return;
        
        const starCount = UserArmyData.getInstance().getStarCountByQuality(this.cardData.quality);
        //获取 星星容器 所有星星节点 
        const  childrens =this.starNode.children
        for(let i=0;i<childrens.length;i++){
            const star=childrens[i].getComponent(Sprite);
            if(star){
                let spriteFrameName=qualityStarMap[this.cardData.quality]
                if(!spriteFrameName){
                    spriteFrameName="card_detail_c_7"
                }
                star.spriteFrame=star.spriteAtlas.getSpriteFrame(spriteFrameName);
            }
            childrens[i].active = i < starCount;
        }
    }

    /**
     * 更新S阶级
     */
    private updateSLevel(): void {
        if (!this.cardData) return;
        
        this.superCardNode.active = this.cardData.sLevel > 0;
        if(this.cardData.sLevel > 0){
            const  spriteName= 'card_detail_s_'+(this.cardData.sLevel-1);
            const sprite=this.superCardNode.getComponent(Sprite);
            if(sprite){
                sprite.spriteFrame=sprite.spriteAtlas.getSpriteFrame(spriteName);
            }
        }
    }
    
    public updateUpgradeHint(canUpgrade: boolean): void {
        if (!this.upgradeHintSprite) {
            console.warn('HeroCard: upgradeHintSprite 未设置');
            return;
        }
        
        this.upgradeHintSprite.node.active = canUpgrade;
    }

    /**
     * 更新骨骼动画
     * 通过heroId从ResourceConfig.heros_list获取资源路径path和皮肤名skinName
     */
    private updateSkeletonAnimation(): void {
        if (!this.skeletonNode || !this.cardData) return;

        // 从ResourceConfig中查找英雄数据
        const heroData = ResourceConfig.heros_list.find(hero => hero.id === this.cardData.heroId);
        if (!heroData) {
            return;
        }

        // 获取骨骼动画组件
        const skeletonComponent = this.skeletonNode.getComponent(sp.Skeleton);
        if (!skeletonComponent) {
            return;
        }

        // 加载骨骼动画资源
        const skeletonPath = heroData.path;
        resources.load(skeletonPath, sp.SkeletonData, (err, skeletonData) => {
            if (err) {
                return;
            }

            // 确保组件和节点仍然有效（防止异步加载期间组件被销毁）
            if (!skeletonComponent || !skeletonComponent.node || !skeletonComponent.node.isValid) {
                return;
            }

            // 确保this.skeletonNode仍然有效
            if (!this.skeletonNode || !this.skeletonNode.isValid) {
                return;
            }

            // 确保skeletonData有效
            if (!skeletonData) {
                return;
            }

            try {
                // 设置骨骼数据
                skeletonComponent.skeletonData = skeletonData;
                
                // 设置皮肤（如果有）
                if (heroData.skinName) {
                    skeletonComponent.setSkin(heroData.skinName);
                }
                
                // 播放默认动画
                skeletonComponent.setAnimation(0, 'stand by', true);
            } catch (error) {
                console.warn('HeroCard: 设置骨骼动画时发生错误:', error);
            }
        });
    }

    /**
     * 更新职业图标
     * 通过_heroClassId设置职业图标
     */
    private updateClassIcon(): void {
        if (!this.classIconSprite || !this.cardData) return;

        // 根据职业ID加载对应的图标
        const iconFrameName = `c_${this.cardData.class}`;
        
        // 从class_icons图集中加载对应的SpriteFrame
        resources.load('img/icons/class_icons', SpriteAtlas, (err, atlas) => {
            if (err) {
                return;
            }

            // 确保组件仍然有效（防止异步加载期间组件被销毁）
            if (!this.classIconSprite || !this.classIconSprite.node || !this.classIconSprite.node.isValid) {
                return;
            }

            // 确保atlas有效
            if (!atlas) {
                return;
            }

            try {
                const spriteFrame = atlas.getSpriteFrame(iconFrameName);
                if (spriteFrame) {
                    this.classIconSprite.spriteFrame = spriteFrame;
                }
            } catch (error) {
                console.warn('HeroCard: 设置职业图标时发生错误:', error);
            }
        });
    }

    /**
     * 更新背景框
     * 根据品质更换背景框
     */
    private updateBackgroundFrame(): void {
        if (!this.backgroundSprite || !this.cardData) return;

        // 根据品质设置背景框
        const bgFrameName = qualityHeroCardBgMap[this.cardData.quality];
        
        // 这里假设背景框资源在某个图集中，您可以根据实际情况调整路径
        resources.load('img/general/frame', SpriteAtlas, (err, atlas) => {
            if (err) {
                return;
            }

            // 确保组件仍然有效（防止异步加载期间组件被销毁）
            if (!this.backgroundSprite || !this.backgroundSprite.node || !this.backgroundSprite.node.isValid) {
                return;
            }

            // 确保atlas有效
            if (!atlas) {
                return;
            }

            try {
                const spriteFrame = atlas.getSpriteFrame(bgFrameName);
                if (spriteFrame) {
                    this.backgroundSprite.spriteFrame = spriteFrame;
                }
            } catch (error) {
                console.warn('HeroCard: 设置背景框时发生错误:', error);
            }
        });
    }

    /**
     * 获取卡片ID
     */
    public getCardId(): string {
        return this.cardData ? this.cardData.cardId : '';
    }

    /**
     * 获取英雄ID
     */
    public getHeroId(): string {
        return this.cardData ? this.cardData.heroId : '';
    }

    /**
     * 获取英雄等级
     */
    public getLevel(): number {
        return this._heroLevel;
    }

    /**
     * 获取职业ID
     */
    public getClassId(): number {
        return this.cardData ? this.cardData.class : 0;
    }

    /**
     * 获取品质
     */
    public getQuality(): number {
        return this.cardData ? this.cardData.quality : 0;
    }

    /**
     * 获取卡片完整数据
     */
    public getCardData(): CardData | null {
        return this.cardData;
    }

    /**
     * 卡片点击事件
     */
    public onCardClick(): void {
        // 这里可以触发英雄详情界面或其他逻辑
    }

    /**
     * 显示卡片
     */
    public show(): void {
        this.node.active = true;
    }

    /**
     * 隐藏卡片
     */
    public hide(): void {
        this.node.active = false;
    }

    /**
     * 重置卡片数据
     */
    public reset(): void {
        this.cardData = null;
        this._heroLevel = 1;
        
        this.updateLevelDisplay();
        
        // 使用统一的方法设置升级提示
        this.updateUpgradeHint(false);
    }

    /**
     * 组件销毁时的清理工作
     */
    onDestroy(): void {
        // 清理骨骼动画组件
        
    }
}
