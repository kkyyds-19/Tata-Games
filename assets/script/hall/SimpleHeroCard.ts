import { _decorator, Component, Node, Sprite, Label, resources, SpriteAtlas } from 'cc';
import { UserArmyData, CardData } from '../user/UserArmyData';
import { ResourceConfig } from '../global/config/ResourceConfig';
import { qualityConfigs, qualityHeroCardBgMap } from '../global/config/QualityConfig';

const { ccclass, property } = _decorator;

/**
 * 简单英雄卡片展示组件
 * 用于显示英雄的基本信息
 */
@ccclass('SimpleHeroCard')
export class SimpleHeroCard extends Component {

    @property(Sprite)
    qualityFrameSprite: Sprite = null;

    @property(Sprite)
    heroIconSprite: Sprite = null;

    @property(Label)
    heroNameLabel: Label = null;

    @property(Label)
    heroLevelLabel: Label = null;

    @property(Sprite)
    classIconSprite: Sprite = null;

    @property(Sprite)
    attackTypeSprite: Sprite = null;

    @property(Node)
    maskNode: Node = null;

    // 私有属性
    private _cardId: string = '';
    private _heroId: string = '';
    private _heroName: string = '';
    private _heroClass: number = 0;
    private _heroQuality: number = 0;
    private _attackType: number = 0;
    private _heroLevel: number = 1;

    onLoad() {
        
    }

    start() {
    }

    /**
     * 设置英雄数据（不包含等级，等级需要单独设置）
     * @param cardId 卡片ID
     */
    public setHeroData(cardId: string): void {
        this._cardId = cardId;
        
        // 从用户卡片列表中获取卡片数据
        const cardData = UserArmyData.getInstance().getCardById(cardId);
        if (cardData) {
            this._heroId = cardData.heroId;
            this._heroName = cardData.name;
            this._heroClass = cardData.class;
            this._heroQuality = cardData.quality;
            // 等级不从 cardData 获取，保持当前等级或默认等级1
            // 使用 CardData 中的 attackType 属性
            this._attackType = cardData.attackType;
            
            this.updateUI();
        }
    }

    /**
     * 直接设置英雄数据
     * @param heroId 英雄ID
     * @param heroName 英雄名称
     * @param heroClass 英雄职业
     * @param heroQuality 英雄品质
     * @param heroLevel 英雄等级
     * @param attackType 攻击派系
     */
    public setHeroInfo(heroId: string, heroName: string, heroClass: number, heroQuality: number, heroLevel?: number, attackType?: number): void {
        this._heroId = heroId;
        this._heroName = heroName;
        this._heroClass = heroClass;
        this._heroQuality = heroQuality;
        this._heroLevel = heroLevel !== undefined ? heroLevel : 1;
        this._attackType = attackType !== undefined ? attackType : heroClass;
        
        this.updateUI();
    }

    /**
     * 单独设置英雄等级
     * @param level 新的等级
     */
    public setHeroLevel(level: number): void {
        if (level > 0) {
            this._heroLevel = level;
            this.updateHeroLevel();
        }
    }

    /**
     * 更新UI显示
     */
    private updateUI(): void {
        this.updateQualityFrame();
        this.updateHeroIcon();
        this.updateHeroName();
        this.updateHeroLevel();
        this.updateClassIcon();
        this.updateAttackTypeIcon();
    }

    /**
     * 更新品质框
     * 根据品质修改背景框
     */
    private updateQualityFrame(): void {
        if (!this.qualityFrameSprite) return;

        // 根据品质设置背景框
        const bgFrameName = qualityHeroCardBgMap[this._heroQuality];
        this.qualityFrameSprite.spriteFrame = this.qualityFrameSprite.spriteAtlas.getSpriteFrame(bgFrameName);
    }

    /**
     * 更新英雄图标
     * 根据英雄ID设置图标
     */
    private updateHeroIcon(): void {
        if (!this.heroIconSprite) return;

        // 从 ResourceConfig 中根据英雄ID获取对应的图标名称
        const heroData = ResourceConfig.heros_list.find(hero => hero.id === this._heroId);
        if (heroData) {
            const heroIconName = heroData.iconFrameName;
            this.heroIconSprite.spriteFrame = this.heroIconSprite.spriteAtlas.getSpriteFrame(heroIconName);
        } else {
            console.warn(`SimpleHeroCard: 未找到英雄ID ${this._heroId} 对应的数据`);
        }
    }

    /**
     * 更新英雄名称
     */
    private updateHeroName(): void {
        if (this.heroNameLabel) {
            this.heroNameLabel.string = this._heroName;
        }
    }

    /**
     * 更新英雄等级
     */
    private updateHeroLevel(): void {
        if (this.heroLevelLabel) {
            this.heroLevelLabel.string = `Lv.${this._heroLevel}`;
        }
    }

    /**
     * 更新职业图标
     * 根据职业ID设置职业图标
     */
    private updateClassIcon(): void {
        if (!this.classIconSprite) return;

        // 根据职业ID加载对应的图标
        const classIconName = `c_${this._heroClass}`;
        this.classIconSprite.spriteFrame = this.classIconSprite.spriteAtlas.getSpriteFrame(classIconName);
    }

    /**
     * 更新攻击派系图标
     * 根据攻击派系设置图标
     */
    private updateAttackTypeIcon(): void {
        if (!this.attackTypeSprite) return;

        // 根据攻击派系加载对应的图标
        // 0-物理，1-水，2-火，3-电，4-风
        const attackTypeIconName = `atk_type_${this._attackType}`;
        this.attackTypeSprite.spriteFrame = this.attackTypeSprite.spriteAtlas.getSpriteFrame(attackTypeIconName);
    }

    /**
     * 显示半透明遮盖
     */
    public showMask(): void {
        if (this.maskNode) {
            this.maskNode.active = true;
        }
    }

    /**
     * 隐藏半透明遮盖
     */
    public hideMask(): void {
        if (this.maskNode) {
            this.maskNode.active = false;
        }
    }

    /**
     * 切换半透明遮盖状态
     */
    public toggleMask(): void {
        if (this.maskNode) {
            this.maskNode.active = !this.maskNode.active;
        }
    }

    /**
     * 设置遮盖状态
     * @param visible 是否显示遮盖
     */
    public setMaskVisible(visible: boolean): void {
        if (this.maskNode) {
            this.maskNode.active = visible;
        }
    }

    /**
     * 获取卡片ID
     */
    public getCardId(): string {
        return this._cardId;
    }

    /**
     * 获取英雄ID
     */
    public getHeroId(): string {
        return this._heroId;
    }

    /**
     * 获取英雄名称
     */
    public getHeroName(): string {
        return this._heroName;
    }

    /**
     * 获取英雄职业
     */
    public getHeroClass(): number {
        return this._heroClass;
    }

    /**
     * 获取英雄品质
     */
    public getHeroQuality(): number {
        return this._heroQuality;
    }

    /**
     * 获取英雄等级
     */
    public getHeroLevel(): number {
        return this._heroLevel;
    }

    /**
     * 获取攻击派系
     */
    public getAttackType(): number {
        return this._attackType;
    }

    /**
     * 获取遮盖状态
     */
    public isMaskVisible(): boolean {
        return this.maskNode ? this.maskNode.active : false;
    }

    /**
     * 重置卡片
     */
    public reset(): void {
        this._cardId = '';
        this._heroId = '';
        this._heroName = '';
        this._heroClass = 0;
        this._heroQuality = 0;
        this._attackType = 0;
        this._heroLevel = 1;

        if (this.heroNameLabel) {
            this.heroNameLabel.string = '';
        }

        if (this.heroLevelLabel) {
            this.heroLevelLabel.string = 'Lv.1';
        }

        this.hideMask();
    }
}