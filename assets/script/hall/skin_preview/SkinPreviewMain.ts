import { _decorator, Component, Node, Label, Button, Prefab, instantiate } from 'cc';
import { heroSkinConfigs, HeroSkinConfig, ClassType, HeroSkinRarity } from '../../global/config/HeroSkinConfig';
import { UserInfoData } from '../../user/UserInfoData';
import { UserSkinData } from '../../user/UserSkinData';
import { SkinPreviewBlock } from './SkinPreviewBlock';
import { SkinPreviewDetail } from './SkinPreviewDetail';

const { ccclass, property } = _decorator;

@ccclass('SkinPreviewMain')
export class SkinPreviewMain extends Component {

    // ==================== UI 属性 ====================

    @property({ type: Label, tooltip: "钻石数量标签" })
    public diamondLabel: Label = null;

    @property({ type: Label, tooltip: "皮肤点券数量标签" })
    public skinPointsLabel: Label = null;

    @property({ type: [Button], tooltip: "筛选按钮 (0:全部, 1:坦克, 2:牧师, 3:猎人, 4:法师, 5:刺客)" })
    public filterButtons: Button[] = [];

    @property({ type: Prefab, tooltip: "皮肤段落(Block)的预制体" })
    public skinBlockPrefab: Prefab = null;

    @property({ type: Node, tooltip: "滚动列表的容器节点" })
    public scrollContent: Node = null;

    @property({ type: SkinPreviewDetail, tooltip: "皮肤详情面板" })
    public skinDetailPanel: SkinPreviewDetail = null;


    // ==================== 内部状态 ====================

    private _currentFilter: ClassType | 'ALL' = 'ALL';
    private readonly rarityOrder: HeroSkinRarity[] = [
        HeroSkinRarity.MYTHICAL,
        HeroSkinRarity.LEGENDARY,
        HeroSkinRarity.EPIC,
        HeroSkinRarity.RARE,
        HeroSkinRarity.FINE,
        HeroSkinRarity.NORMAL,
    ];

    // ==================== 生命周期 ====================

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, ()=>{
            //点击吞噬
        }, this);
        this.addEventListeners();
        this.skinDetailPanel.node.active = false;
    }

    onEnable() {
        this.refreshAll();
    }

    // ==================== 事件处理 ====================

    private addEventListeners() {
        this.filterButtons.forEach((button, index) => {
            button.node.on(Button.EventType.CLICK, () => this.onFilterButtonClick(index), this);
        });
    }

    private onFilterButtonClick(filterIndex: number) {
        // 0:全部, 1:坦克, 2:牧师, 3:猎人, 4:法师, 5:刺客
        const filterMap: { [key: number]: ClassType | 'ALL' } = {
            0: 'ALL', 1: ClassType.TANK, 2: ClassType.PRIEST,
            3: ClassType.HUNTER, 4: ClassType.MAGE, 5: ClassType.ASSASSIN,
        };
        this._currentFilter = filterMap[filterIndex] ?? 'ALL';
        
        this.refreshAll();
    }
    
    private onSkinIconClick(skinId: number) {
        if(this.skinDetailPanel) {
            this.skinDetailPanel.show(skinId);
        }
    }
    
    // ==================== UI刷新 ====================

    /**
     * 刷新整个主面板
     */
    public refreshAll() {
        this.updateCurrencyDisplay();
        this.updateFilterButtonStates();
        this.populateSkinBlocks();
    }

    /**
     * 更新货币显示
     */
    private updateCurrencyDisplay() {
        const userInfo = UserInfoData.getInstance();
        if (this.diamondLabel) this.diamondLabel.string = userInfo.getDiamond().toString();
        if (this.skinPointsLabel) this.skinPointsLabel.string = userInfo.getSkinPoints().toString();
    }
    
    /**
     * 更新筛选按钮的视觉状态
     */
    private updateFilterButtonStates() {
        const filterMap: { [key in ClassType | 'ALL']: number } = {
            'ALL': 0, [ClassType.TANK]: 1, [ClassType.PRIEST]: 2,
            [ClassType.HUNTER]: 3, [ClassType.MAGE]: 4, [ClassType.ASSASSIN]: 5,
             [ClassType.ALL]: 0
        };
        const currentIndex = filterMap[this._currentFilter];

        this.filterButtons.forEach((button, index) => {
            const lightNode = button.node.getChildByName('light');
            if (lightNode) {
                lightNode.active = (index === currentIndex);
            }
        });
    }

    /**
     * 填充皮肤段落列表
     */
    private populateSkinBlocks() {
        if (!this.scrollContent || !this.skinBlockPrefab) return;

        this.scrollContent.removeAllChildren();
        const groupedSkins = this.getGroupedAndFilteredSkins();

        // 按稀有度从高到低遍历
        for (const rarity of this.rarityOrder) {
            const skinIds = groupedSkins.get(rarity);

            // 如果该稀有度下有皮肤，则创建并显示Block
            if (skinIds && skinIds.length > 0) {
                const blockNode = instantiate(this.skinBlockPrefab);
                blockNode.setPosition(585,0,0);
                const blockComponent = blockNode.getComponent(SkinPreviewBlock);
                if (blockComponent) {
                    blockComponent.init(rarity, skinIds, (id) => this.onSkinIconClick(id));
                    this.scrollContent.addChild(blockNode);
                }
            }
        }
    }
    
    /**
     * 获取经过筛选和分组后的皮肤数据
     * @returns Map<HeroSkinRarity, number[]>
     */
    private getGroupedAndFilteredSkins(): Map<HeroSkinRarity, number[]> {
        const userSkins = UserSkinData.getInstance().getOwnedSkins();
        const skinConfigs = heroSkinConfigs;
        
        const filteredSkinConfigs = skinConfigs.filter(config => {
            // 检查皮肤是否被拥有
            const isOwned = userSkins.some(s => s.id === config.id);
            if(!isOwned) return false;

            // 应用职业筛选
            if (this._currentFilter === 'ALL') {
                return true; // 全部职业
            }
            return config.classType === this._currentFilter;
        });
        
        // 按稀有度分组
        const grouped = new Map<HeroSkinRarity, number[]>();
        for (const config of filteredSkinConfigs) {
            if (!grouped.has(config.rarity)) {
                grouped.set(config.rarity, []);
            }
            grouped.get(config.rarity).push(config.id);
        }
        
        return grouped;
    }

    // ==================== 公共方法 ====================

    public show() {
        this.node.active = true;
        this.refreshAll();
    }

    public hide() {
        this.node.active = false;
    }
}
