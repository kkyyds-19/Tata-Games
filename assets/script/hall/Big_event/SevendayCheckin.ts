import { _decorator, Component, Node, BlockInputEvents, director, Button } from 'cc';
import { ShowToast } from '../../global/Toast';
const { ccclass, property } = _decorator;

@ccclass('SevendayCheckin')
export class SevendayCheckin extends Component {
    // 普通签到布局（7天基础奖励）
    @property(Node)
    public ordinaryLayout: Node = null;

    // 追加签到布局（追加奖励）
    @property(Node)
    public addLayout: Node = null;

    // 追加按钮（点击后切换到追加签到布局）
    @property(Node)
    public zhuijiaButton: Node = null;

    // 普通按钮（点击后切换到普通签到布局）
    @property(Node)
    public putongButton: Node = null;

    // 追加按钮的指示节点：Regular_check-in_54（显示为选中状态）
    @property(Node)
    public zhuijiaIndicator: Node = null;

    // 普通按钮的指示节点：Regular_check-in_54（显示为选中状态）
    @property(Node)
    public putongIndicator: Node = null;

    // 7天奖励的条目节点（需在编辑器按顺序绑定：第1天到第7天）
    @property([Node])
    public dayItems: Node[] = [];

    // 追加7天奖励的条目节点
    @property([Node])
    public dayItms1: Node[] = [];

    // 与 dayItems 一一对应的黑色遮罩节点 Black（领取后显示，表示不可再次领取）
    @property([Node])
    public dayBlackOverlays: Node[] = [];

    // 与追加奖励 dayItms1 一一对应的黑色遮罩节点（领取追加奖励后显示）
    @property([Node])
    public dayBlackOverlaysAdd: Node[] = [];

    // 本地存储键前缀
    private readonly startDateKey: string = 'SevendayCheckin.startDate';
    private readonly claimedKeyPrefix: string = 'SevendayCheckin.claimed.'; // 后接索引1-7
    private readonly claimedKeyPrefixAdd: string = 'SevendayCheckin.claimed.add.'; // 追加奖励领取标记
    private todayIndexCache: number | null = null;
    /**
     * 页面初始化：默认隐藏并阻止事件向下层穿透
     */
    start() {
        try {
            this.node.active = false;
            if (!this.node.getComponent(BlockInputEvents)) {
                this.node.addComponent(BlockInputEvents);
            }

            // 初始化开始日期，用于计算“当天是第几天”（1-7）
            this.ensureStartDate();
            // 更新界面：根据已领取状态显示黑色遮罩
            this.refreshClaimUI();

            // 绑定切换布局按钮事件
            this.bindToggleButtons();
            // 绑定每一天的点击事件（仅允许领取当天）
            this.bindDayItemEvents();
            // 绑定每一天的点击事件（仅允许领取当天）
            this.bindDayItemEvents1();
        } catch {}
    }

    /**
     * 打开七日签到页面（由 hall 统一调用）
     */
    public show(): void {
        try {
            this.node.active = true;
            const p = this.node.parent;
            if (p) this.node.setSiblingIndex(p.children.length - 1);
            // 打开页面时刷新一次当天索引和UI
            this.todayIndexCache = null;
            this.refreshClaimUI();
        } catch {}
    }

    /**
     * 关闭七日签到页面（由 hall 或页面自身调用）
     */
    public hide(){
        this.node.active = false;
    }

    update(deltaTime: number) {}

    /**
     * 绑定“追加/普通”切换按钮的事件
     */
    private bindToggleButtons(): void {
        try {
            if (this.zhuijiaButton) {
                this.zhuijiaButton.off(Button.EventType.CLICK);
                this.zhuijiaButton.on(Button.EventType.CLICK, this.onZhuijiaClicked, this);
            }
            if (this.putongButton) {
                this.putongButton.off(Button.EventType.CLICK);
                this.putongButton.on(Button.EventType.CLICK, this.onPutongClicked, this);
            }
        } catch {}
    }

    /**
     * 切换到追加签到布局
     * - 隐藏普通布局，显示追加布局
     * - 打开追加按钮的 Regular_check-in_54 指示，关闭普通按钮的指示
     */
    private onZhuijiaClicked(): void {
        try {
            if (this.ordinaryLayout) this.ordinaryLayout.active = false;
            if (this.addLayout) this.addLayout.active = true;
            if (this.zhuijiaIndicator) this.zhuijiaIndicator.active = true;
            if (this.putongIndicator) this.putongIndicator.active = false;
        } catch {}
    }

    /**
     * 切换到普通签到布局
     * - 显示普通布局，隐藏追加布局
     * - 打开普通按钮的 Regular_check-in_54 指示，关闭追加按钮的指示
     */
    private onPutongClicked(): void {
        try {
            if (this.ordinaryLayout) this.ordinaryLayout.active = true;
            if (this.addLayout) this.addLayout.active = false;
            if (this.putongIndicator) this.putongIndicator.active = true;
            if (this.zhuijiaIndicator) this.zhuijiaIndicator.active = false;
        } catch {}
    }

    /**
     * 为7天条目绑定点击事件：仅允许领取“当天”的奖励
     */
    private bindDayItemEvents(): void {
        try {
            for (let i = 0; i < this.dayItems.length; i++) {
                const idx = i + 1; // 转为1-7
                const n = this.dayItems[i];
                if (!n) continue;
                n.off(Node.EventType.TOUCH_START);
                n.on(Node.EventType.TOUCH_START, () => this.onDayItemClicked(idx), this);
            }
        } catch {}
    }

    private bindDayItemEvents1():void{
        try{
            // 修复循环条件：应为 i < this.dayItms1.length
            for(let i = 0; i < this.dayItms1.length; i++){
                const idx = i+1;
                const n = this.dayItms1[i];
                if(!n) continue;
                n.off(Node.EventType.TOUCH_START)
                // 复用普通领取逻辑：仅允许领取当天，领取后显示黑色遮罩
                n.on(Node.EventType.TOUCH_START, () => this.onDayItemClicked1(idx), this) 
            }
        }catch {}
    }

    /**
     * 点击某一天的奖励条目
     */
    private onDayItemClicked(dayIndex: number): void {
        const today = this.getTodayIndex();
        if (dayIndex !== today) {
            ShowToast('只能领取当天的奖励');
            return;
        }
        if (this.isClaimed(dayIndex)) {
            ShowToast('今日奖励已领取');
            return;
        }
        // 标记领取并显示黑色遮罩
        this.markClaimed(dayIndex);
        this.showBlackOverlay(dayIndex, true);
        ShowToast('领取成功');
    }

    private onDayItemClicked1(dayIndex:number):void{
        const today = this.getTodayIndex1();
        if (dayIndex !== today) {
            ShowToast('只能领取当天的奖励');
            return;
        }
        if (this.isClaimed1(dayIndex)) {
            ShowToast('今日奖励已领取');
            return;
        }
        // 标记领取并显示黑色遮罩
        this.markClaimed1(dayIndex);
        this.showBlackOverlayAdd(dayIndex, true);
        ShowToast('领取成功');

    }

    /**
     * 计算并缓存当天是第几天（1-7），基于 startDate 与当前日期的相差天数
     */
    private getTodayIndex(): number {
        if (this.todayIndexCache != null) return this.todayIndexCache;
        const start = localStorage.getItem(this.startDateKey);
        const s = start ? new Date(start) : new Date();
        const t = new Date();
        const d1 = new Date(s.getFullYear(), s.getMonth(), s.getDate());
        const d2 = new Date(t.getFullYear(), t.getMonth(), t.getDate());
        const diffMs = d2.getTime() - d1.getTime();
        const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
        // 转为 1-7 范围，超过7天则固定为7
        const idx = Math.min(7, Math.max(1, diffDays + 1));
        this.todayIndexCache = idx;
        return idx;
    }

    private getTodayIndex1(): number {
        if (this.todayIndexCache != null) return this.todayIndexCache;
        const start = localStorage.getItem(this.startDateKey);
        const s = start ? new Date(start) : new Date();
        const t = new Date();
        const d1 = new Date(s.getFullYear(), s.getMonth(), s.getDate());
        const d2 = new Date(t.getFullYear(), t.getMonth(), t.getDate());
        const diffMs = d2.getTime() - d1.getTime();
        const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
        // 转为 1-7 范围，超过7天则固定为7
        const idx = Math.min(7, Math.max(1, diffDays + 1));
        this.todayIndexCache = idx;
        return idx;
    }


    /**
     * 确保开始日期存在：首次打开时记录当天为第1天
     */
    private ensureStartDate(): void {
        const start = localStorage.getItem(this.startDateKey);
        if (!start) {
            const now = new Date();
            const y = now.getFullYear();
            const m = (now.getMonth() + 1).toString().padStart(2, '0');
            const d = now.getDate().toString().padStart(2, '0');
            localStorage.setItem(this.startDateKey, `${y}-${m}-${d}`);
        }
    }

    /**
     * 是否已领取指定天的奖励
     */
    private isClaimed(dayIndex: number): boolean {
        const k = this.claimedKeyPrefix + dayIndex;
        return localStorage.getItem(k) === '1';
    }
    private isClaimed1(dayIndex: number): boolean {
        const k = this.claimedKeyPrefixAdd + dayIndex;
        return localStorage.getItem(k) === '1';
    }


    /**
     * 标记指定天已领取
     */
    private markClaimed(dayIndex: number): void {
        const k = this.claimedKeyPrefix + dayIndex;
        localStorage.setItem(k, '1');
    }
    private markClaimed1(dayIndex: number): void {
        const k = this.claimedKeyPrefixAdd + dayIndex;
        localStorage.setItem(k, '1');
    }


    /**
     * 根据已领取状态刷新界面：显示/隐藏各天的黑色遮罩
     */
    private refreshClaimUI(): void {
        try {
            for (let i = 0; i < this.dayBlackOverlays.length; i++) {
                const idx = i + 1;
                const overlay = this.dayBlackOverlays[i];
                if (!overlay) continue;
                overlay.active = this.isClaimed(idx);
            }
            for (let i = 0; i < this.dayBlackOverlaysAdd.length; i++) {
                const idx = i + 1;
                const overlay = this.dayBlackOverlaysAdd[i];
                if (!overlay) continue;
                overlay.active = this.isClaimed1(idx);
            }
        } catch {}
    }

    /**
     * 显示/隐藏指定天的黑色遮罩
     */
    private showBlackOverlay(dayIndex: number, show: boolean): void {
        const i = dayIndex - 1;
        if (i < 0 || i >= this.dayBlackOverlays.length) return;
        const overlay = this.dayBlackOverlays[i];
        if (overlay) overlay.active = !!show;
    }

    private showBlackOverlayAdd(dayIndex: number, show: boolean): void {
        const i = dayIndex - 1;
        if (i < 0 || i >= this.dayBlackOverlaysAdd.length) return;
        const overlay = this.dayBlackOverlaysAdd[i];
        if (overlay) overlay.active = !!show;
    }
}


