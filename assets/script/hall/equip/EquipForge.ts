import { _decorator, Component, Node, Label, Button, Toggle } from "cc";

const { ccclass, property } = _decorator;

@ccclass('EquipForge')
export class EquipForge extends Component {

    // ============ UI显示标签 ============
    @property(Label)
    diamondLabel: Label = null; // 钻石数量显示

    @property(Label)
    oreLabel: Label = null; // 矿石数量显示

    @property(Label)
    forgeCountLabel: Label = null; // 锻造次数显示

    @property(Label)
    adFreeTimesLabel: Label = null; // 广告免费次数显示 (n/2格式)

    // ============ 操作按钮 ============
    @property(Button)
    forgeOnceButton: Button = null; // 锻造一次按钮

    @property(Button)
    forgeFiveButton: Button = null; // 锻造5次按钮

    @property(Button)
    closeButton: Button = null; // 关闭按钮

    // ============ 设置选项 ============
    @property(Toggle)
    skipAnimationToggle: Toggle = null; // 跳过动画开关，默认为否

    // ============ 私有数据 ============
    private diamondCount: number = 0; // 当前钻石数量
    private oreCount: number = 0; // 当前矿石数量
    private forgeCount: number = 0; // 当前锻造次数
    private adFreeTimes: number = 0; // 广告免费次数
    private maxAdFreeTimes: number = 2; // 最大广告免费次数
    private isSkipAnimation: boolean = false; // 是否跳过动画

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, ()=>{

        }, this);
        this.initializeUI();
        this.setupEventListeners();
    }

    start() {
        // 初始化时隐藏面板
        // this.hide();
    }

    // ============ 基本显示/隐藏方法 ============

    /**
     * 显示锻造面板
     */
    public show(): void {
        this.node.active = true;
        this.updateAllUI();
        console.log('[EquipForge] 显示锻造面板');
    }

    /**
     * 隐藏锻造面板
     */
    public hide(): void {
        this.node.active = false;
        console.log('[EquipForge] 隐藏锻造面板');
    }

    // ============ UI初始化 ============

    /**
     * 初始化UI显示
     */
    private initializeUI(): void {
        // 设置默认占位符
        this.updateDiamondDisplay();
        this.updateOreDisplay();
        this.updateForgeCountDisplay();
        this.updateAdFreeTimesDisplay();
        
        // 设置跳过动画开关默认值
        if (this.skipAnimationToggle) {
            this.skipAnimationToggle.isChecked = this.isSkipAnimation;
        }
    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners(): void {
        // 锻造一次按钮
        if (this.forgeOnceButton) {
            this.forgeOnceButton.node.on(Button.EventType.CLICK, this.onForgeOnceClick, this);
        }

        // 锻造5次按钮
        if (this.forgeFiveButton) {
            this.forgeFiveButton.node.on(Button.EventType.CLICK, this.onForgeFiveClick, this);
        }

        // 关闭按钮
        if (this.closeButton) {
            this.closeButton.node.on(Button.EventType.CLICK, this.onCloseClick, this);
        }

        // 跳过动画开关
        if (this.skipAnimationToggle) {
            this.skipAnimationToggle.node.on(Toggle.EventType.TOGGLE, this.onSkipAnimationToggle, this);
        }
    }

    // ============ UI更新方法 ============

    /**
     * 更新钻石数量显示
     */
    private updateDiamondDisplay(): void {
        if (this.diamondLabel) {
            this.diamondLabel.string = this.diamondCount > 0 ? this.diamondCount.toString() : '--';
        }
    }

    /**
     * 更新矿石数量显示
     */
    private updateOreDisplay(): void {
        if (this.oreLabel) {
            this.oreLabel.string = this.oreCount > 0 ? this.oreCount.toString() : '--';
        }
    }

    /**
     * 更新锻造次数显示
     */
    private updateForgeCountDisplay(): void {
        if (this.forgeCountLabel) {
            this.forgeCountLabel.string = this.forgeCount > 0 ? this.forgeCount.toString() : '--';
        }
    }

    /**
     * 更新广告免费次数显示
     */
    private updateAdFreeTimesDisplay(): void {
        if (this.adFreeTimesLabel) {
            this.adFreeTimesLabel.string = `免费次数 ${this.adFreeTimes}/${this.maxAdFreeTimes}`;
        }
    }

    /**
     * 更新所有UI显示
     */
    private updateAllUI(): void {
        this.updateDiamondDisplay();
        this.updateOreDisplay();
        this.updateForgeCountDisplay();
        this.updateAdFreeTimesDisplay();
    }

    // ============ 事件处理方法 ============

    /**
     * 锻造一次按钮点击事件
     */
    private onForgeOnceClick(): void {
        console.log('[EquipForge] 点击锻造一次按钮');
        // TODO: 实现锻造一次逻辑，等待服务端接口
        this.performForge(1);
    }

    /**
     * 锻造5次按钮点击事件
     */
    private onForgeFiveClick(): void {
        console.log('[EquipForge] 点击锻造5次按钮');
        // TODO: 实现锻造5次逻辑，等待服务端接口
        this.performForge(5);
    }

    /**
     * 关闭按钮点击事件
     */
    private onCloseClick(): void {
        console.log('[EquipForge] 点击关闭按钮');
        this.hide();
    }

    /**
     * 跳过动画开关切换事件
     */
    private onSkipAnimationToggle(): void {
        if (this.skipAnimationToggle) {
            this.isSkipAnimation = this.skipAnimationToggle.isChecked;
            console.log(`[EquipForge] 跳过动画设置: ${this.isSkipAnimation ? '是' : '否'}`);
        }
    }

    // ============ 锻造逻辑方法 (预留实现) ============

    /**
     * 执行锻造操作
     * @param times 锻造次数
     */
    private performForge(times: number): void {
        console.log(`[EquipForge] 准备执行锻造 ${times} 次`);
        
        // TODO: 等待服务端接口完成后实现以下逻辑：
        // 1. 检查资源是否足够 (钻石、矿石)
        // 2. 发送锻造请求到服务器
        // 3. 处理服务器响应
        // 4. 更新本地资源和UI
        // 5. 播放锻造动画 (如果未跳过)
        // 6. 显示锻造结果

        // 临时模拟逻辑
        this.simulateForge(times);
    }

    /**
     * 模拟锻造操作 (临时实现)
     */
    private simulateForge(times: number): void {
        console.log(`[EquipForge] 模拟锻造 ${times} 次`);
        
        // 模拟消耗资源
        if (this.diamondCount >= times * 10 && this.oreCount >= times * 5) {
            this.diamondCount -= times * 10;
            this.oreCount -= times * 5;
            this.forgeCount += times;
            
            console.log(`[EquipForge] 锻造成功! 消耗钻石: ${times * 10}, 消耗矿石: ${times * 5}`);
            this.updateAllUI();
        } else {
            console.warn('[EquipForge] 资源不足，无法锻造');
            // TODO: 显示资源不足提示
        }
    }

    /**
     * 检查是否可以锻造
     * @param times 锻造次数
     * @returns 是否可以锻造
     */
    private canForge(times: number): boolean {
        // TODO: 实现真实的锻造条件检查
        // 检查钻石、矿石是否足够
        // 检查是否有免费次数
        return true;
    }

    // ============ 数据同步方法 (预留实现) ============

    /**
     * 从服务器同步锻造相关数据
     */
    private async syncForgeDataFromServer(): Promise<void> {
        console.log('[EquipForge] 开始同步锻造数据...');
        
        try {
            // TODO: 等待服务端接口完成后实现：
            // 1. 调用API获取用户钻石、矿石数量
            // 2. 获取锻造次数、免费次数等信息
            // 3. 更新本地数据
            // 4. 刷新UI显示
            
            // 临时模拟数据
            this.diamondCount = 1000;
            this.oreCount = 500;
            this.forgeCount = 25;
            this.adFreeTimes = 1;
            
            this.updateAllUI();
            console.log('[EquipForge] 锻造数据同步完成');
            
        } catch (error) {
            console.error('[EquipForge] 同步锻造数据失败:', error);
        }
    }

    // ============ 公共接口方法 ============

    /**
     * 设置钻石数量
     * @param count 钻石数量
     */
    public setDiamondCount(count: number): void {
        this.diamondCount = count;
        this.updateDiamondDisplay();
    }

    /**
     * 设置矿石数量
     * @param count 矿石数量
     */
    public setOreCount(count: number): void {
        this.oreCount = count;
        this.updateOreDisplay();
    }

    /**
     * 设置锻造次数
     * @param count 锻造次数
     */
    public setForgeCount(count: number): void {
        this.forgeCount = count;
        this.updateForgeCountDisplay();
    }

    /**
     * 设置广告免费次数
     * @param current 当前免费次数
     * @param max 最大免费次数
     */
    public setAdFreeTimes(current: number, max: number = 2): void {
        this.adFreeTimes = current;
        this.maxAdFreeTimes = max;
        this.updateAdFreeTimesDisplay();
    }

    /**
     * 获取是否跳过动画设置
     * @returns 是否跳过动画
     */
    public getSkipAnimation(): boolean {
        return this.isSkipAnimation;
    }

    /**
     * 刷新锻造面板数据
     */
    public async refreshData(): Promise<void> {
        console.log('[EquipForge] 刷新锻造面板数据');
        await this.syncForgeDataFromServer();
    }
}
