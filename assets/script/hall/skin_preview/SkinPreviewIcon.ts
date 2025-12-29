import { _decorator, Component, Node, Label, Sprite, sp, resources } from 'cc';
import { HeroSkinConfig, heroSkinConfigs } from '../../global/config/HeroSkinConfig';
import { UserSkinData, UserSkinItem } from '../../user/UserSkinData';

const { ccclass, property } = _decorator;

@ccclass('SkinPreviewIcon')
export class SkinPreviewIcon extends Component {

    @property({ type: Label, tooltip: "英雄名称" })
    public heroNameLabel: Label = null;

    @property({ type: Label, tooltip: "皮肤名称" })
    public skinNameLabel: Label = null;

    @property({ type: sp.Skeleton, tooltip: "皮肤Spine动画节点" })
    public spineNode: sp.Skeleton = null;

    @property({ type: [Sprite], tooltip: "星级显示的星星数组，共5个" })
    public starSprites: Sprite[] = [];

    @property({ type: Sprite, tooltip: "背景框Sprite" })
    public backgroundSprite: Sprite = null;

    @property({ type: Label, tooltip: "皮肤价格" })
    public priceLabel: Label = null;

    private _skinId: number = 0;
    private _onClickCallback: (skinId: number) => void = null;

    public get skinId(): number {
        return this._skinId;
    }

    /**
     * 初始化皮肤图标
     * @param skinId 皮肤ID
     */
    public init(skinId: number) {
        const skinConfig = heroSkinConfigs.find(c => c.id === skinId);
        const skinData = UserSkinData.getInstance().getSkinData(skinId);

        if (!skinConfig || !skinData) {
            console.error(`[SkinPreviewIcon] 无法找到ID为 ${skinId} 的皮肤配置或数据`);
            this.node.active = false;
            return;
        }
        
        this._skinId = skinId;
        this.node.active = true;

        this.updateNames(skinConfig);
        this.updateStars(skinData);
        this.updateBackground(skinConfig);
        this.updatePrice(skinConfig);
        this.loadSpineAnimation(skinConfig);
    }

    private updateNames(config: HeroSkinConfig) {
        if (this.heroNameLabel) this.heroNameLabel.string = config.heroName;
        if (this.skinNameLabel) this.skinNameLabel.string = config.name;
    }

    private updateStars(data: UserSkinItem) {
        this.starSprites.forEach((sprite, index) => {
            if(sprite){
                // 星级从1开始计数，所以index < star
                sprite.grayscale = index >= data.star;
            }
        });
    }

    private updateBackground(config: HeroSkinConfig) {
        if (!this.backgroundSprite || !this.backgroundSprite.spriteAtlas) {
            console.warn("[SkinPreviewIcon] 背景Sprite或其图集未设置");
            return;
        }

        let frameName = "skin_preview_13"; // 默认传说
        if (config.rarity === 5) { // 神话
            frameName = "skin_preview_12";
        }
        
        const spriteFrame = this.backgroundSprite.spriteAtlas.getSpriteFrame(frameName);
        if (spriteFrame) {
            this.backgroundSprite.spriteFrame = spriteFrame;
        } else {
            console.warn(`[SkinPreviewIcon] 在图集中未找到背景框: ${frameName}`);
        }
    }

    private updatePrice(config: HeroSkinConfig) {
        if (this.priceLabel) {
            this.priceLabel.string = config.price.toString();
        }
    }

    private loadSpineAnimation(config: HeroSkinConfig) {
        if (!this.spineNode) return;
        this.spineNode.node.active = false;
        
        resources.load(config.spinePath, sp.SkeletonData, (err, skeletonData) => {
            if (err || !skeletonData) {
                console.error(`[SkinPreviewIcon] 加载Spine资源失败: ${config.spinePath}`, err);
                return;
            }
            this.spineNode.node.active = true;
            this.spineNode.skeletonData = skeletonData;
            if (config.spineSkinName) {
                this.spineNode.setSkin(config.spineSkinName);
            }
            //判断是否有这个动画
            const runtimeSkeleton = this.spineNode.skeletonData?.getRuntimeData?.();
            const hasMove = runtimeSkeleton?.findAnimation('move') != null;

            const anim = hasMove ? 'move' : 'stand by';
            this.spineNode.setAnimation(0, anim, true);

            this.spineNode.node.setScale(0.46,0.46);
        });
    }

    /**
     * 设置点击回调函数
     * @param callback 回调
     */
    public setOnClickCallback(callback: (skinId: number) => void) {
        this._onClickCallback = callback;
    }

    private onClick() {
        if (this._onClickCallback) {
            this._onClickCallback(this._skinId);
        }
    }
}
