import { _decorator, Component, Node, Button, Label, Prefab, instantiate, Layout } from 'cc';
import { TransformationIcon } from './TransformationIcon';
import { TransformationPart, TransformationSkinConfigs } from '../../global/config/TransformationSkinConfig';
import { UserTransformationSkinData } from '../../user/UserTransformationSkinData';

const { ccclass, property } = _decorator;

@ccclass('TransformationMain')
export class TransformationMain extends Component {

    @property({type: Label, tooltip: "当前选中幻化皮肤的名称"})
    public selectedSkinNameLabel: Label = null;

    @property({type: Label, tooltip: "当前选中幻化皮肤的基础属性"})
    public selectedSkinStatsLabel: Label = null;

    @property({type: [Button], tooltip: "筛选按钮 (0:头, 1:胸, 2:肩, 3:手, 4:背)"})
    public filterButtons: Button[] = [];

    @property({type: Prefab, tooltip: "幻化皮肤图标的预制体"})
    public iconPrefab: Prefab = null;

    @property({type: Node, tooltip: "图标容器，需要挂载Layout组件"})
    public iconContainer: Node = null;

    @property({type: Button, tooltip: "升级按钮"})
    public upgradeButton: Button = null;

    @property({type: Button, tooltip: "穿戴按钮"})
    public wearButton: Button = null;

    @property({type: Label, tooltip: "穿戴按钮上的文字"})
    public wearButtonLabel: Label = null;

    private _currentFilterPart: TransformationPart = TransformationPart.HEAD;
    private _selectedSkinId: number = null;
    private _iconMap: Map<number, TransformationIcon> = new Map();

    onLoad() {
        this.addEventListeners();
        this.selectedSkinNameLabel.string = "";
        this.selectedSkinStatsLabel.string = "";
    }

    onEnable() {
        this._currentFilterPart = TransformationPart.HEAD; // 默认显示头部
        this._selectedSkinId = null;
        this.refreshAll();
    }
    
    public show() {
        this.node.active = true;
        this.onEnable();
    }

    public hide() {
        this.node.active = false;
    }

    private addEventListeners() {
        this.filterButtons.forEach((button, index) => {
            button.node.on(Button.EventType.CLICK, () => this.onFilterButtonClick(index), this);
        });

        this.upgradeButton.node.on(Button.EventType.CLICK, this.onUpgradeClick, this);
        this.wearButton.node.on(Button.EventType.CLICK, this.onWearClick, this);
    }

    private onFilterButtonClick(index: number) {
        const partOrder = [TransformationPart.HEAD, TransformationPart.CHEST, TransformationPart.SHOULDER, TransformationPart.HAND, TransformationPart.BACK];
        if (index < partOrder.length) {
            this._currentFilterPart = partOrder[index];
            this._selectedSkinId = null; // 切换筛选时清空选择
            this.refreshAll();
        }
    }

    private onIconClick(skinId: number) {
        this._selectedSkinId = skinId;
        this.updateSelectionStates();
        this.updateDetailDisplay();
    }

    private onUpgradeClick() {
        if (this._selectedSkinId === null) {
            console.log("[TransformationMain] 请先选择一个幻化皮肤进行升级。");
            return;
        }
        UserTransformationSkinData.getInstance().upgradeSkin(this._selectedSkinId);
        
        // 刷新单个图标和详情面板
        this.refreshSingleIcon(this._selectedSkinId);
        this.updateDetailDisplay();
    }

    private onWearClick() {
        if (this._selectedSkinId === null) {
            console.log("[TransformationMain] 请先选择一个幻化皮肤进行穿戴。");
            return;
        }
        const dataManager = UserTransformationSkinData.getInstance();
        const skinData = dataManager.getSkinData(this._selectedSkinId);
        if(!skinData) return;

        // 查找该部位之前穿戴的皮肤ID，以便刷新它的状态
        const previouslyEquippedId = dataManager.getEquippedSkinForPart(skinData.part);
        
        // 切换穿戴状态
        dataManager.toggleEquipSkin(this._selectedSkinId);

        // 刷新当前点击的图标
        this.refreshSingleIcon(this._selectedSkinId);
        
        // 如果之前有穿戴别的皮肤，并且不是同一件，也刷新它
        if (previouslyEquippedId !== null && previouslyEquippedId !== this._selectedSkinId) {
            this.refreshSingleIcon(previouslyEquippedId);
        }

        // 更新详情和按钮文本
        this.updateDetailDisplay();
    }

    private refreshAll() {
        this.updateFilterButtonStates();
        this.populateIcons();
        this.updateDetailDisplay(); // 在没有选中的情况下会清空详情
    }

    private updateFilterButtonStates() {
        const partOrder = [TransformationPart.HEAD, TransformationPart.CHEST, TransformationPart.SHOULDER, TransformationPart.HAND, TransformationPart.BACK];
        const currentIndex = partOrder.indexOf(this._currentFilterPart);
        this.filterButtons.forEach((button, index) => {
            const lightNode = button.node.getChildByName('light');
            if (lightNode) {
                lightNode.active = (index === currentIndex);
            }
        });
    }

    private populateIcons() {
        this.iconContainer.removeAllChildren();
        this._iconMap.clear();

        const dataManager = UserTransformationSkinData.getInstance();
        const allSkins = dataManager.getAllSkins();
        const filteredSkins = allSkins.filter(s => s.part === this._currentFilterPart);

        // 按品质从高到低，ID从小到大排序
        filteredSkins.sort((a, b) => {
             const configA = TransformationSkinConfigs.find(c => c.transformatskinId === a.transformatskinId);
             const configB = TransformationSkinConfigs.find(c => c.transformatskinId === b.transformatskinId);
             if (configA.quality !== configB.quality) {
                 return configB.quality - configA.quality;
             }
             return a.transformatskinId - b.transformatskinId;
        });

        filteredSkins.forEach(skinItem => {
            const node = instantiate(this.iconPrefab);
            const iconComp = node.getComponent(TransformationIcon);
            iconComp.init(skinItem);
            iconComp.setOnClickCallback(this.onIconClick.bind(this));
            this.iconContainer.addChild(node);
            this._iconMap.set(skinItem.transformatskinId, iconComp);
        });
        
        // 列表刷新后，默认选中第一个或者当前部位已穿戴的那个
        const equippedId = dataManager.getEquippedSkinForPart(this._currentFilterPart);
        if (equippedId !== null) {
            this.onIconClick(equippedId);
        } else if (filteredSkins.length > 0) {
            this.onIconClick(filteredSkins[0].transformatskinId);
        } else {
             // 如果该分类下没有皮肤，则清空选择和详情
            this._selectedSkinId = null;
            this.updateSelectionStates();
            this.updateDetailDisplay();
        }
    }

    private updateSelectionStates() {
        this._iconMap.forEach((icon, skinId) => {
            icon.setSelected(skinId === this._selectedSkinId);
        });
    }

    private refreshSingleIcon(skinId: number) {
        const iconComp = this._iconMap.get(skinId);
        if (iconComp) {
            const skinItem = UserTransformationSkinData.getInstance().getSkinData(skinId);
            if(skinItem) {
                iconComp.init(skinItem); // 重新初始化来刷新显示
                iconComp.setSelected(skinId === this._selectedSkinId); // 保持选中状态
            }
        }
    }
    
    private updateDetailDisplay() {
        if (this._selectedSkinId === null) {
            this.selectedSkinNameLabel.string = "请选择一个皮肤";
            this.selectedSkinStatsLabel.string = "";
            this.wearButtonLabel.string = "穿戴";
            return;
        }

        const dataManager = UserTransformationSkinData.getInstance();
        const skinData = dataManager.getSkinData(this._selectedSkinId);
        const skinConfig = TransformationSkinConfigs.find(c => c.transformatskinId === this._selectedSkinId);

        if (!skinData || !skinConfig) {
            console.error(`[TransformationMain] 无法找到ID为 ${this._selectedSkinId} 的皮肤配置或数据`);
            return;
        }

        // 1. 更新名称和等级
        this.selectedSkinNameLabel.string = `${skinConfig.name} (Lv.${skinData.level})`;

        // 2. 更新属性显示
        const currentAttributes = dataManager.getAttributesForSkin(this._selectedSkinId);
        const statsTextLines: string[] = [];
        for (const key in currentAttributes) {
            const value = currentAttributes[key];
            if (value > 0) {
                // 将浮点数格式化，并保留 "属性: +数值" 的格式
                statsTextLines.push(`${this.mapAttributeToName(key)}: +${value.toFixed(2)}`);
            }
        }
        // 使用多个空格进行分隔，实现清晰的单行显示
        this.selectedSkinStatsLabel.string = statsTextLines.join('   ');
        
        // 3. 更新穿戴按钮文本
        const isEquipped = dataManager.getEquippedSkinForPart(skinData.part) === this._selectedSkinId;
        this.wearButtonLabel.string = isEquipped ? "卸下" : "穿戴";
    }

    private mapAttributeToName(key: string): string {
        const map = {
            'attack': '攻击',
            'maxhp': '生命',
            'defense': '防御',
            'damageReduction': '减伤',
            'skill_cooldown': '技能冷却缩减',
            'crit_rate': '暴击率',
            'crit_damage': '暴击伤害'
        };
        return map[key] || key;
    }
    
} 