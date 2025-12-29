import { _decorator, Component, Node, Button, Toggle } from 'cc';
import { UserRelicData } from '../../user/UserRelicData';

const { ccclass, property } = _decorator;

@ccclass('RelicSummon')
export class RelicSummon extends Component {

    @property({ type: Toggle, tooltip: "是否固定位置召唤的开关" })
    public fixedPositionToggle: Toggle = null;

    @property({ type: Node, tooltip: "6个位置选择按钮的父节点" })
    public positionButtonsContainer: Node = null;

    @property({ type: [Button], tooltip: "6个位置选择按钮" })
    public positionButtons: Button[] = [];

    @property({ type: Button, tooltip: "召唤1次按钮" })
    public summonOnceButton: Button = null;

    @property({ type: Button, tooltip: "召唤10次按钮" })
    public summonTenTimesButton: Button = null;

    @property({ type: Button, tooltip: "返回按钮" })
    public backButton: Button = null;
    
    private _userRelicData: UserRelicData = null;
    private _selectedPosition: number = -1; // -1表示未选择, 0-5 对应 位置1-6

    onLoad() {
        this._userRelicData = UserRelicData.getInstance();
        this.addEventListeners();
    }

    onEnable() {
        this.fixedPositionToggle.isChecked = false;
        this.onToggleStateChanged();
    }

    private addEventListeners() {
        this.fixedPositionToggle.node.on(Toggle.EventType.TOGGLE, this.onToggleStateChanged, this);
        this.backButton.node.on(Button.EventType.CLICK, this.hide, this);
        
        this.positionButtons.forEach((button, index) => {
            button.node.on(Button.EventType.CLICK, () => this.onPositionButtonClick(index), this);
        });

        this.summonOnceButton.node.on(Button.EventType.CLICK, this.onSummonOnceClick, this);
        this.summonTenTimesButton.node.on(Button.EventType.CLICK, this.onSummonTenTimesClick, this);
    }
    
    /**
     * 当固定位置的Toggle状态改变时
     */
    private onToggleStateChanged() {
        const isFixed = this.fixedPositionToggle.isChecked;
        this.positionButtonsContainer.active = isFixed;

        if (!isFixed) {
            // 如果关闭固定位置，则重置选择
            this._selectedPosition = -1;
        } else {
            // 如果开启，默认选择第一个
            this._selectedPosition = 0;
        }
        this.updatePositionButtonStates();
    }
    
    /**
     * 当点击位置选择按钮时
     * @param index 按钮索引 (0-5)
     */
    private onPositionButtonClick(index: number) {
        this._selectedPosition = index;
        this.updatePositionButtonStates();
    }

    /**
     * 更新位置选择按钮的状态
     */
    private updatePositionButtonStates() {
        if (!this.positionButtonsContainer.active) return;

        this.positionButtons.forEach((button, index) => {
            const isSelected = (index === this._selectedPosition);
            const light = button.node.getChildByName('light'); // 假设选中状态的节点叫'light'
            if (light) {
                light.active = isSelected;
            }
        });
    }

    /**
     * 点击召唤1次
     */
    private onSummonOnceClick() {
        this.performSummon(1);
    }

    /**
     * 点击召唤10次
     */
    private onSummonTenTimesClick() {
        this.performSummon(10);
    }

    /**
     * 执行召唤逻辑 (功能预留)
     * @param count 召唤次数
     */
    private performSummon(count: number) {
        const isFixed = this.fixedPositionToggle.isChecked;
        let summonType = "";

        if (isFixed && this._selectedPosition !== -1) {
            summonType = `为位置 ${this._selectedPosition + 1} 召唤`;
        } else {
            summonType = "随机召唤";
        }
        
        console.log(`[RelicSummon] 执行: ${summonType}, ${count}次`);

        // TODO: 在这里实现真正的抽卡逻辑
        // 1. 根据 summonType 和 count 从卡池中抽取圣物
        // 2. 调用 this._userRelicData.acquireRelic(relicId) 将抽到的圣物添加到用户数据中
        // 3. 显示抽卡结果
    }

    public show() {
        this.node.active = true;
    }

    public hide() {
        this.node.active = false;
    }

    onDestroy() {
       
    }
} 