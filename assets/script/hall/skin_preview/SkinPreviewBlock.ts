import { _decorator, Component, Node, Label, Prefab, instantiate } from 'cc';
import { HeroSkinRarity } from '../../global/config/HeroSkinConfig';
import { SkinPreviewIcon } from './SkinPreviewIcon';
import { Sprite } from 'cc';

const { ccclass, property } = _decorator;

// 用于将枚举映射到中文名称
const rarityToNameMap: { [key in HeroSkinRarity]?: string } = {
    [HeroSkinRarity.NORMAL]: "普通",
    [HeroSkinRarity.FINE]: "精良",
    [HeroSkinRarity.RARE]: "稀有",
    [HeroSkinRarity.EPIC]: "史诗",
    [HeroSkinRarity.LEGENDARY]: "传说",
    [HeroSkinRarity.MYTHICAL]: "神话",
};

@ccclass('SkinPreviewBlock')
export class SkinPreviewBlock extends Component {

    @property({ type: Label, tooltip: "段落标题" })
    public titleLabel: Label = null;

    @property({ type: Prefab, tooltip: "皮肤预览图标的预制体" })
    public skinIconPrefab: Prefab = null;

    @property({ type: Node, tooltip: "图标列表的容器Layout节点" })
    public contentLayout: Node = null;

    @property({ type: Sprite, tooltip: "title背景框Sprite" })
    public backgroundSprite: Sprite = null;

    /**
     * 初始化段落显示
     * @param rarity 皮肤品质
     * @param skinIds 该品质下的皮肤ID列表
     * @param onIconClick 点击任意图标时的回调函数
     */
    public init(rarity: HeroSkinRarity, skinIds: number[], onIconClick?: (skinId: number) => void) {
        if (!skinIds) {
            this.node.active = false;
            return;
        }

        this.updateTitle(rarity, skinIds.length);
        this.populateList(skinIds, onIconClick);
        this.node.active = true;
    }

    /**
     * 更新标题显示
     */
    private updateTitle(rarity: HeroSkinRarity, count: number) {
        if (this.titleLabel) {
            const rarityName = rarityToNameMap[rarity] || "未知品质";
            const maxCount = 20; // 根据需求，固定最大值为20
            this.titleLabel.string = `${rarityName}皮肤 (${count}/${maxCount})`;
        }

        this.updateBackground(rarity);
    }

    private updateBackground(rarity: HeroSkinRarity) {
        if (!this.backgroundSprite || !this.backgroundSprite.spriteAtlas) {
            console.warn("[SkinPreviewIcon] 背景Sprite或其图集未设置");
            return;
        }

        let frameName = "skin_preview_11"; // 默认传说
        if (rarity === 5) { // 神话
            frameName = "skin_preview_10";
        }
        
        const spriteFrame = this.backgroundSprite.spriteAtlas.getSpriteFrame(frameName);
        if (spriteFrame) {
            this.backgroundSprite.spriteFrame = spriteFrame;
        } else {
            console.warn(`[SkinPreviewIcon] 在图集中未找到背景框: ${frameName}`);
        }
    }

    /**
     * 填充图标列表
     */
    private populateList(skinIds: number[], onIconClick?: (skinId: number) => void) {
        if (!this.contentLayout || !this.skinIconPrefab) {
            console.error("[SkinPreviewBlock] 内容容器(contentLayout)或图标预制体(skinIconPrefab)未设置");
            return;
        }

        this.contentLayout.removeAllChildren();

        for (const id of skinIds) {
            const iconNode = instantiate(this.skinIconPrefab);
            const iconComponent = iconNode.getComponent(SkinPreviewIcon);
            
            if (iconComponent) {
                iconComponent.init(id);
                if (onIconClick) {
                    iconComponent.setOnClickCallback(onIconClick);
                }
                this.contentLayout.addChild(iconNode);
            } else {
                 console.warn(`[SkinPreviewBlock] 预制体上缺少 SkinPreviewIcon 组件`);
            }
        }
    }
}
