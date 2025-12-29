import { _decorator, Component, Node, Label, Prefab, instantiate, Sprite } from 'cc';
import { legacyConfigs } from '../../global/config/LegacyConfig';
import { UserLegacyData } from '../../user/UserLegacyData';
import { LegacyIcon } from './LegacyIcon';

const { ccclass, property } = _decorator;

// 用于将枚举映射到中文名称
const rarityToNameMap: { [key: number]: string } = {
    0: "普通",
    1: "神话",
    2: "神话",
    3: "传说",
    4: "史诗",
    5: "精英",
    6: "神话",
};

@ccclass('LegacyBlock')
export class LegacyBlock extends Component {

    @property({ type: Label, tooltip: "段落标题" })
    public titleLabel: Label = null;

    @property({ type: Prefab, tooltip: "遗物图标的预制体" })
    public legacyIconPrefab: Prefab = null;

    @property({ type: Node, tooltip: "图标列表的容器Layout节点" })
    public contentLayout: Node = null;

    @property({ type: Sprite, tooltip: "标题背景框Sprite" })
    public titleBackgroundSprite: Sprite = null;

    /**
     * 初始化段落显示
     * @param rarity 遗物品质
     * @param legacyIds 该品质下的遗物ID列表
     * @param onIconClick 点击任意图标时的回调函数
     */
    public init(rarity: number, legacyIds: number[], onIconClick?: (legacyId: number) => void) {
        if (!legacyIds || legacyIds.length === 0) {
            this.node.active = false;
            return;
        }

        this.updateTitle(rarity, legacyIds);
        this.populateList(legacyIds, onIconClick);
        this.node.active = true;
    }

    /**
     * 更新标题显示
     */
    private updateTitle(rarity: number, legacyIds: number[]) {
        if (this.titleLabel) {
            const rarityName = rarityToNameMap[rarity] || "未知品质";
            const totalCount = legacyIds.length;
            const ownedCount = legacyIds.filter(id => UserLegacyData.getInstance().isLegacyOwned(id)).length;
            this.titleLabel.string = `${rarityName}遗物 (${ownedCount}/${totalCount})`;
        }

        this.updateTitleBackground(rarity);
    }

    /**
     * 更新标题背景
     */
    private updateTitleBackground(rarity: number) {
        if (!this.titleBackgroundSprite || !this.titleBackgroundSprite.spriteAtlas) {
            console.warn("[LegacyBlock] 标题背景Sprite或其图集未设置");
            return;
        }

        // 从配置中找到对应品质的 frameName
        const configWithRarity = legacyConfigs.find(c => c.rarity === rarity);
        if (!configWithRarity) {
            console.warn(`[LegacyBlock] 找不到品质为 ${rarity} 的配置`);
            return;
        }

        const frameName = configWithRarity.titleFrameName;
        const spriteFrame = this.titleBackgroundSprite.spriteAtlas.getSpriteFrame(frameName);
        if (spriteFrame) {
            this.titleBackgroundSprite.spriteFrame = spriteFrame;
        } else {
            console.warn(`[LegacyBlock] 在图集中未找到标题背景框: ${frameName}`);
        }
    }

    /**
     * 填充图标列表
     */
    private populateList(legacyIds: number[], onIconClick?: (legacyId: number) => void) {
        if (!this.contentLayout || !this.legacyIconPrefab) {
            console.error("[LegacyBlock] 内容容器(contentLayout)或图标预制体(legacyIconPrefab)未设置");
            return;
        }

        this.contentLayout.removeAllChildren();

        for (const id of legacyIds) {
            const iconNode = instantiate(this.legacyIconPrefab);
            const iconComponent = iconNode.getComponent(LegacyIcon);
            
            if (iconComponent) {
                iconComponent.init(id);
                if (onIconClick) {
                    iconComponent.setOnClickCallback(onIconClick);
                }
                this.contentLayout.addChild(iconNode);
            } else {
                 console.warn(`[LegacyBlock] 预制体上缺少 LegacyIcon 组件`);
            }
        }
    }
}
