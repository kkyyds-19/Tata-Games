import { _decorator, Component, Node, Label, Sprite } from 'cc';
import { HeroSkinConfig, heroSkinConfigs } from '../../global/config/HeroSkinConfig';
import { UserInfoData } from '../../user/UserInfoData';
import { UserSkinData, UserSkinItem } from '../../user/UserSkinData';
import { SkinPreviewIcon } from './SkinPreviewIcon';

const { ccclass, property } = _decorator;

@ccclass('SkinPreviewDetail')
export class SkinPreviewDetail extends Component {

    @property({ type: SkinPreviewIcon, tooltip: "用于展示皮肤预览的大图标" })
    public mainSkinIcon: SkinPreviewIcon = null;

    @property({ type: Label, tooltip: "显示用户金币数量" })
    public goldLabel: Label = null;

    @property({ type: Label, tooltip: "显示用户钻石数量" })
    public diamondLabel: Label = null;

    @property({ type: Label, tooltip: "显示用户皮肤点券数量" })
    public skinPointsLabel: Label = null;

    @property({ type: [Node], tooltip: "5个星级效果面板的数组" })
    public starEffectPanels: Node[] = [];

    private _currentSkinId: number | null = null;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, ()=>{
            //点击吞噬
        }, this);

        this.node.on(Node.EventType.TOUCH_END, ()=>{
            //点击吞噬
            this.hide()
        }, this);
        
        this.updateCurrencyDisplay();
    }

    /**
     * 根据皮肤ID显示详细信息
     * @param skinId 要显示的皮肤ID
     */
    public show(skinId: number) {
        this._currentSkinId = skinId;
        const skinConfig = heroSkinConfigs.find(c => c.id === skinId);
        const skinData = UserSkinData.getInstance().getSkinData(skinId);

        if (!skinConfig || !skinData) {
            console.error(`[SkinPreviewDetail] 无法找到ID为 ${skinId} 的皮肤配置或数据`);
            this.node.active = false;
            return;
        }

        this.node.active = true;
        this.mainSkinIcon.init(skinId);
        this.updateStarEffects(skinConfig, skinData);
        this.updateCurrencyDisplay();
    }

    /**
     * 更新星级效果的显示
     */
    private updateStarEffects(skinConfig: HeroSkinConfig, skinData: UserSkinItem) {
        this.starEffectPanels.forEach((panel, index) => {
            const starLevel = index + 1; // 星级从1开始
            const starSprite = panel.getChildByName('s1')?.getComponent(Sprite);
            const descriptionLabel = panel.getChildByName('atk_hp_add')?.getComponent(Label);

            if (starSprite) {
                starSprite.grayscale = starLevel > skinData.star;
            }

            if (descriptionLabel) {
                const effects = skinConfig.starEffects[starLevel];
                if (effects && effects.length > 0) {
                    descriptionLabel.string = effects.map(e => e.description).join('\n');
                } else {
                    descriptionLabel.string = "无此星级效果";
                }
            }
        });
    }

    /**
     * 更新顶部货币信息的显示
     */
    public updateCurrencyDisplay() {
        const userInfo = UserInfoData.getInstance();
        if(this.goldLabel) this.goldLabel.string = userInfo.getGold().toString();
        if(this.diamondLabel) this.diamondLabel.string = userInfo.getDiamond().toString();
        if(this.skinPointsLabel) this.skinPointsLabel.string = userInfo.getSkinPoints().toString();
    }

    /**
     * 隐藏面板
     */
    public hide() {
        this.node.active = false;
    }
}
