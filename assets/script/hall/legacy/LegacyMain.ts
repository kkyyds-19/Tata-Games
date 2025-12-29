import { _decorator, Component, Node, Button, Prefab, instantiate } from 'cc';
import { legacyConfigs } from '../../global/config/LegacyConfig';
import { LegacyBlock } from './LegacyBlock';

const { ccclass, property } = _decorator;

@ccclass('LegacyMain')
export class LegacyMain extends Component {

    // ==================== UI 属性 ====================

    @property({ type: [Button], tooltip: "筛选按钮 (0:全部, 1:东部王国, 2:卡利姆多, 3:其他)" })
    public filterButtons: Button[] = [];

    @property({ type: Prefab, tooltip: "遗物段落(Block)的预制体" })
    public legacyBlockPrefab: Prefab = null;

    @property({ type: Node, tooltip: "滚动列表的容器节点" })
    public scrollContent: Node = null;
    
    @property({ type: Button, tooltip: "关闭按钮" })
    public closeButton: Button = null;

    // ==================== 内部状态 ====================

    // 当前筛选的出产地ID (0代表全部)
    private _currentFilterZone: number = 0;
    
    // 稀有度从高到低排序
    private readonly rarityOrder: number[] = [1, 3, 4, 5];

    // ==================== 生命周期 ====================

    onLoad() {
        this.addEventListeners();
    }

    onEnable() {
        this.refreshAll();
    }

    // ==================== 事件处理 ====================

    private addEventListeners() {
        this.filterButtons.forEach((button, index) => {
            const zoneId = this.getZoneIdByButtonIndex(index);
            button.node.on(Button.EventType.CLICK, () => this.onFilterButtonClick(zoneId), this);
        });
        
        // 关闭按钮
        if(this.closeButton) {
            this.closeButton.node.on(Button.EventType.CLICK, this.hide, this);
        }
    }

    private onFilterButtonClick(zoneId: number) {
        this._currentFilterZone = zoneId;
        this.refreshAll();
    }
    
    private onLegacyIconClick(legacyId: number) {
        console.log("点击了遗物图标, ID:", legacyId);
        // TODO: 在此实现点击遗物图标后的逻辑，例如弹出详情页
    }
    
    // ==================== UI刷新 ====================

    /**
     * 刷新整个主面板
     */
    public refreshAll() {
        this.updateFilterButtonStates();
        this.populateLegacyBlocks();
    }
    
    /**
     * 更新筛选按钮的视觉状态
     */
    private updateFilterButtonStates() {
        this.filterButtons.forEach((button, index) => {
            const lightNode = button.node.getChildByName('light');
            if (lightNode) {
                let isActive = false;
                if (this.filterButtons.length === 3) {
                    const zoneId = this.getZoneIdByButtonIndex(index);
                    isActive = zoneId === this._currentFilterZone;
                } else {
                    isActive = index === this._currentFilterZone;
                }
                lightNode.active = isActive;
            }
        });
    }

    /**
     * 填充遗物段落列表
     */
    private populateLegacyBlocks() {
        if (!this.scrollContent || !this.legacyBlockPrefab) {
            console.error("[LegacyMain] 滚动容器或Block预制体未设置");
            return;
        }

        this.scrollContent.removeAllChildren();
        const groupedLegacies = this.getGroupedAndFilteredLegacies();

        // 按稀有度从高到低遍历
        for (const rarity of this.rarityOrder) {
            const legacyIds = groupedLegacies.get(rarity);

            // 如果该稀有度下有遗物，则创建并显示Block
            if (legacyIds && legacyIds.length > 0) {
                const blockNode = instantiate(this.legacyBlockPrefab);
                blockNode.setPosition(585,0,0);
                const blockComponent = blockNode.getComponent(LegacyBlock);
                if (blockComponent) {
                    blockComponent.init(rarity, legacyIds, (id) => this.onLegacyIconClick(id));
                    this.scrollContent.addChild(blockNode);
                }
            }
        }
    }
    
    /**
     * 获取经过筛选和分组后的遗物数据
     * @returns Map<rarity, legacyId[]>
     */
    private getGroupedAndFilteredLegacies(): Map<number, number[]> {
        
        const filteredLegacyConfigs = legacyConfigs.filter(config => {
            // 应用出产地筛选 (0 为全部)
            if (this._currentFilterZone === 0) {
                return true;
            }
            return config.originZone === this._currentFilterZone;
        });
        
        // 按稀有度分组
        const grouped = new Map<number, number[]>();
        for (const config of filteredLegacyConfigs) {
            let rarityGroup = config.rarity;
            if (rarityGroup === 2) {
                rarityGroup = 1;
            }
            if (rarityGroup === 6) {
                rarityGroup = 1;
            }

            if (!grouped.has(rarityGroup)) {
                grouped.set(rarityGroup, []);
            }
            grouped.get(rarityGroup).push(config.id);
        }
        
        return grouped;
    }

    private getZoneIdByButtonIndex(index: number): number {
        if (this.filterButtons.length === 3) {
            if (index === 0) {
                return 2;
            }
            if (index === 1) {
                return 1;
            }
            if (index === 2) {
                return 3;
            }
            return 0;
        }
        return index;
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
