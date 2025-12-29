import { _decorator, Component, Node, Button, Prefab, instantiate, Label, director } from 'cc';
import { RelicIcon } from './RelicIcon';
import { RelicDetail } from './RelicDetail';
import { UserRelicData } from '../../user/UserRelicData';
import { RelicConfig, relicConfigs, SkillEffectType } from '../../global/config/RelicConfig';
import { game } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('RelicPanel')
export class RelicPanel extends Component {

    // ==================== 属性定义 ====================

    @property({ type: [Node], tooltip: "6个部位的圣物容器节点" })
    public equippedRelicIconContainers: Node[] = [];

    @property({ type: Button, tooltip: "预览按钮 (功能预留)" })
    public previewButton: Button = null;

    @property({ type: Button, tooltip: "一键装备按钮" })
    public autoEquipButton: Button = null;

    @property({ type: Prefab, tooltip: "用于滚动列表的圣物图标预制体" })
    public relicIconPrefab: Prefab = null;

    @property({ type: Node, tooltip: "圣物滚动列表的容器" })
    public relicListContainer: Node = null;

    @property({ type: [Button], tooltip: "筛选按钮 (0:全部, 1-6:位置1-6)" })
    public filterButtons: Button[] = [];

    @property({ type: RelicDetail, tooltip: "左侧圣物详情（当前装备的）" })
    public leftDetailPanel: RelicDetail = null;

    @property({ type: RelicDetail, tooltip: "右侧圣物详情（当前选择的）" })
    public rightDetailPanel: RelicDetail = null;

    @property({ type: Node, tooltip: "属性统计面板" })
    public statsPanel: Node = null;

    @property({ type: Label, tooltip: "属性统计文本" })
    public statsLabel: Label = null;

    @property({ type: Button, tooltip: "获取圣物按钮 (功能预留)" })
    public getRelicButton: Button = null;
    
    @property({ type: Button, tooltip: "关闭按钮" })
    public closeButton: Button = null;

    @property({ type: Button, tooltip: "打开属性统计面板的按钮" })
    public statsButton: Button = null;

    // ==================== 私有变量 ====================

    private _userRelicData: UserRelicData = null;
    private _currentFilter: number = 0; // 0 for all, 1-6 for position
    private _selectedRelicId: number | null = null;
    private _relicListIcons: RelicIcon[] = []; // 管理列表中的所有圣物图标

    // ==================== 生命周期 ====================

    onLoad() {
        this._userRelicData = UserRelicData.getInstance();
        this.addEventListeners();

        // 监听圣物数据变化事件
        director.on('relics-updated', this.onRelicsUpdated, this);
    }

    onEnable() {
        this.refreshAll();
    }
    
    onDestroy() {
        director.off('relics-updated', this.onRelicsUpdated, this);
    }

    // ==================== 事件处理 ====================

    private addEventListeners() {
        // 筛选按钮
        this.filterButtons.forEach((button, index) => {
            button.node.on(Button.EventType.CLICK, () => this.onFilterButtonClick(index), this);
        });

        // 关闭按钮
        this.closeButton.node.on(Button.EventType.CLICK, this.hide, this);
        
        // 属性统计按钮
        this.statsButton.node.on(Button.EventType.CLICK, this.toggleStatsPanel, this);
        this.statsPanel.on(Node.EventType.TOUCH_END, this.toggleStatsPanel, this); // 点击统计面板自身也可关闭
        
        // 一键装备
        this.autoEquipButton.node.on(Button.EventType.CLICK, this.autoEquip, this);


        //
        const top_area = this.node.getChildByName('top_area');
        top_area.on(Node.EventType.TOUCH_END, ()=>{
            // 隐藏详情面板
            this.leftDetailPanel.node.active = false;
            this.rightDetailPanel.node.active = false;
        }, this);

        // 预留功能按钮
        // this.previewButton.node.on(Button.EventType.CLICK, this.onPreviewClick, this);
        this.getRelicButton.node.on(Button.EventType.CLICK, this.onGetRelicClick, this);
    }

    private onGetRelicClick(): void {
        director.emit(game.gameEvent.GAME_RELIC_SUMMON_PAGE_SHOW);
    }

    private onFilterButtonClick(filterIndex: number) {
        this._currentFilter = filterIndex;
        this._selectedRelicId = null; // 清空选择
        this.updateFilterButtonStates();
        this.populateRelicList();
        this.updateDetailPanels(); // 隐藏详情面板
    }
    
    /**
     * 当圣物数据更新时（接收到全局事件）
     */
    private onRelicsUpdated() {
        console.log('[RelicPanel] 接收到圣物更新通知，正在刷新面板...');
        this.refreshAll();
    }

    // ==================== UI刷新 ====================

    /**
     * 刷新整个面板
     */
    private refreshAll() {
        this.updateEquippedRelicsDisplay();
        this.populateRelicList();
        this.updateFilterButtonStates();
        this.updateDetailPanels();
        this.updateStatsPanel();
        this.statsPanel.active = false; // 默认关闭统计面板
    }

    /**
     * 更新顶部6个已装备圣物的图标显示
     */
    private updateEquippedRelicsDisplay() {
        if (!this.relicIconPrefab) {
            console.error('[RelicPanel] 圣物图标预制体尚未设置');
            return;
        }

        const equippedIds = this._userRelicData.getEquippedRelicIds();
        this.equippedRelicIconContainers.forEach((container, i) => {
            container.removeAllChildren();
            const relicId = equippedIds[i];
            if (relicId) {
                const relicConfig = relicConfigs.find(c => c.id === relicId);
                if (relicConfig) {
                    const node = instantiate(this.relicIconPrefab);
                    node.setScale(0.5, 0.5);
                    const icon = node.getComponent(RelicIcon);
                    icon.init(relicConfig);
                    icon.setOnClickCallback((id) => this.onRelicIconClick(id));
                    container.addChild(node);
                }
            }
        });
    }

    /**
     * 根据当前筛选条件，填充下方圣物列表
     */
    private populateRelicList() {
        this.relicListContainer.removeAllChildren();
        this._relicListIcons = []; // 重置管理列表

        if (!this.relicIconPrefab) {
            console.error('[RelicPanel] 圣物图标预制体尚未设置');
            return;
        }

        let ownedRelics = this._userRelicData.getOwnedRelics();
        
        // 应用筛选
        if (this._currentFilter > 0) {
            ownedRelics = ownedRelics.filter(item => {
                const config = relicConfigs.find(c => c.id === item.relicId);
                return config && config.position === this._currentFilter;
            });
        }
        
        // 排序：将已装备的圣物排在前面
        ownedRelics.sort((a, b) => {
            const isAEquipped = this._userRelicData.getEquippedRelicIds().indexOf(a.relicId) !== -1;
            const isBEquipped = this._userRelicData.getEquippedRelicIds().indexOf(b.relicId) !== -1;
            if (isAEquipped && !isBEquipped) return -1;
            if (!isAEquipped && isBEquipped) return 1;
            return a.relicId - b.relicId; // 否则按ID排序
        });

        // 实例化并添加到容器
        ownedRelics.forEach(relicItem => {
            const relicConfig = relicConfigs.find(c => c.id === relicItem.relicId);
            if(relicConfig){
                const node = instantiate(this.relicIconPrefab);
                const relicIcon = node.getComponent(RelicIcon);
                relicIcon.init(relicConfig);
                relicIcon.setOnClickCallback((relicId) => this.onRelicIconClick(relicId));

                // 检查并设置已装备标记
                const isEquipped = this._userRelicData.getEquippedRelicIds().indexOf(relicItem.relicId) !== -1;
                relicIcon.setEquipped(isEquipped);

                this._relicListIcons.push(relicIcon); // 添加到管理列表
                this.relicListContainer.addChild(node);
            }
        });

        this.updateRelicListSelection(); // 刷新列表后，更新选中状态
    }

    private onRelicIconClick(relicId: number) {
        this._selectedRelicId = relicId;
        this.updateDetailPanels();
        this.updateRelicListSelection();
    }
    
    /**
     * 更新左右两个详情面板的显示
     */
    private updateDetailPanels() {
        if (this._selectedRelicId === null) {
            this.leftDetailPanel.node.active = false;
            this.rightDetailPanel.node.active = false;
            return;
        }

        const selectedConfig = relicConfigs.find(c => c.id === this._selectedRelicId);
        if (!selectedConfig) return;

        const position = selectedConfig.position;
        const currentlyEquippedId = this._userRelicData.getRelicIdByPosition(position);

        // 显示左侧面板（当前装备的）
        if (currentlyEquippedId) {
            this.leftDetailPanel.node.active = true;
            this.leftDetailPanel.show(currentlyEquippedId);
        } else {
            this.leftDetailPanel.node.active = false;
        }

        // 如果选择的圣物和当前装备的不是同一个，则显示右侧面板
        if (this._selectedRelicId !== currentlyEquippedId) {
            this.rightDetailPanel.node.active = true;
            this.rightDetailPanel.show(this._selectedRelicId);
        } else {
            this.rightDetailPanel.node.active = false;
        }
    }

    /**
     * 更新圣物列表所有图标的选中状态
     */
    private updateRelicListSelection() {
        this._relicListIcons.forEach(icon => {
            const isSelected = icon.relicData && icon.relicData.id === this._selectedRelicId;
            icon.setSelected(isSelected);
        });
    }

    /**
     * 更新筛选按钮高亮状态
     */
    private updateFilterButtonStates() {
        this.filterButtons.forEach((button, index) => {
            const isSelected = (index === this._currentFilter);
            const light = button.node.getChildByName('light');
            if (light) {
                light.active = isSelected;
            }
        });
    }
    
    /**
     * 更新属性统计面板
     */
    private updateStatsPanel() {
        const bonuses = this._userRelicData.calculateTotalBonuses();
        let statsText = "当前总属性加成:\n\n";
        
        // 将效果转换为更易读的格式
        const descriptions = [];
        for (const key in bonuses) {
            const type = key as SkillEffectType;
            const value = bonuses[type];
            if (value === 0) continue; // 不显示0加成

            const dummyConfig = relicConfigs.find(c => c.skillEffects.some(e => e.type === type));
            if(dummyConfig){
                const dummyEffect = dummyConfig.skillEffects.find(e => e.type === type);
                if (dummyEffect && dummyEffect.description) {
                     // 尝试从描述中提取中文名称
                    const name = dummyEffect.description.split(/[0-9-.]+/)[0] || type;
                    
                    // 根据属性类型，区分显示固定数值和百分比
                    if (type === SkillEffectType.ATTACK) {
                        // 攻击力是固定数值
                        const displayValue = value.toFixed(0);
                        descriptions.push(`${name}: +${displayValue}`);
                    } else {
                        // 其他是百分比
                        const displayValue = (value * 100).toFixed(0);
                        if (value > 0) {
                            descriptions.push(`${name}: +${displayValue}%`);
                        } else {
                            descriptions.push(`${name}: ${displayValue}%`);
                        }
                    }
                } else {
                    descriptions.push(`${type}: ${value}`);
                }
            }
        }
        
        if (descriptions.length > 0) {
            statsText += descriptions.join('\n');
        } else {
            statsText += "无";
        }

        this.statsLabel.string = statsText;
    }

    // ==================== 核心功能 ====================
    
    /**
     * 一键装备：为所有空的圣物槽位装备一件最合适的圣物
     */
    private autoEquip() {
        console.log("[RelicPanel] 执行一键装备...");
        const ownedRelics = this._userRelicData.getOwnedRelics();
        let equippedCount = 0;
        
        for (let pos = 1; pos <= 6; pos++) {
            const isSlotEmpty = this._userRelicData.getRelicIdByPosition(pos) === null;
            if (isSlotEmpty) {
                // 找到该位置上已拥有但未装备的圣物
                const availableRelics = ownedRelics.filter(item => {
                    const config = relicConfigs.find(c => c.id === item.relicId);
                    const isEquipped = this._userRelicData.getEquippedRelicIds().indexOf(item.relicId) !== -1;
                    return config && config.position === pos && !isEquipped;
                });
                
                if (availableRelics.length > 0) {
                    // 优先装备品质最高的圣物
                    availableRelics.sort((a, b) => {
                        const configA = relicConfigs.find(c => c.id === a.relicId);
                        const configB = relicConfigs.find(c => c.id === b.relicId);
                        if (!configA || !configB) return 0;
                        // 按品质降序排序
                        return configB.quality - configA.quality;
                    });
                    
                    // 装备品质最高的圣物
                    this._userRelicData.equipRelic(availableRelics[0].relicId);
                    equippedCount++;
                }
            }
        }
        
        if(equippedCount > 0){
            console.log(`[RelicPanel] 一键装备了 ${equippedCount} 件圣物。`);
            this.refreshAll(); // 刷新整个面板
        } else {
            console.log(`[RelicPanel] 没有可自动装备的圣物。`);
        }
    }

    private toggleStatsPanel() {
        this.statsPanel.active = !this.statsPanel.active;
        if(this.statsPanel.active) {
            this.updateStatsPanel();
        }
    }

    public show() {
        this.node.active = true;
    }

    public hide() {
        this.node.active = false;
    }
} 