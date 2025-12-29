import { _decorator, Component, Node, ScrollView, Button, Label } from 'cc';
import { ShowToast } from '../../global/Toast';
import { UserInfoData } from '../../user/UserInfoData';
import { HttpClient } from '../../http/HttpClient';
import { APIResponse } from '../../api/APITypes';
const { ccclass, property } = _decorator;

interface MonthlyCard {
    id: number;
    userId: number;
    planName: string;
    price: number;
    durationDays: number;
    dailyReward: string;
    immediateReward: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    isReceived: boolean;
    lastRewardTime: string;
    createdTime: string;
}

@ccclass('MonthlyPass')
export class MonthlyPass extends Component {
    /** ScrollView 组件 */
    @property(ScrollView)
    public scrollView: ScrollView = null;

    /** ScrollView 内的按钮集合（在 Inspector 绑定） */
    @property([Button])
    public scrollButtons: Button[] = [];

    /** 三个月卡的购买按钮（在 Inspector 绑定） */
    @property([Button])
    public purchaseButtons: Button[] = [];

    /** 三个购买按钮的图标节点（如 Monthlypass_2，未激活状态下显示） */
    @property([Node])
    public purchaseButtonIcons: Node[] = [];

    /** 三个购买按钮的文本节点（Label，购买成功后显示） */
    @property([Label])
    public purchaseButtonLabels: Label[] = [];

    /** 状态节点映射：未激活 → 已激活（Monthlypass_60 → Monthlypass_62） */
    @property([Node])
    public stateInactive60: Node[] = [];
    @property([Node])
    public stateActive62: Node[] = [];

    /** 状态节点映射：未激活 → 已激活（Monthlypass_58 → Monthlypass_48） */
    @property([Node])
    public stateInactive58: Node[] = [];
    @property([Node])
    public stateActive48: Node[] = [];

    /** 本地存储键前缀与常量 */
    private readonly PURCHASE_KEY_PREFIX = 'MonthlyPass.purchaseTime.'; // 购买时间戳（毫秒）
    private readonly CLAIM_KEY_PREFIX = 'MonthlyPass.claimDay.'; // 最近一次领取的日期（YYYYMMDD）
    private readonly THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    private serverCard: MonthlyCard | null = null;
    private readonly AVAILABLE_INDEX = 0;
    private isRequesting: boolean = false;

    private static parseReward(json: string): { diamond: number; gold: number } {
        try {
            const obj = JSON.parse(json) as Record<string, number>;
            const d = obj['currency_diamond'] || 0;
            const g = obj['currency_gold'] || 0;
            return { diamond: d, gold: g };
        } catch { return { diamond: 0, gold: 0 }; }
    }


 
    start() {
        try {
            this.node.active = false;
        } catch {}
    }

    show(): void {
        try {
            this.node.active = true;
            const p = this.node.parent;
            if (p) this.node.setSiblingIndex(p.children.length - 1);
            if (this.scrollView) this.scrollView.cancelInnerEvents = false;
            this.bindScrollButtons();
            this.bindPurchaseButtons();
            this.fetchMonthlyCard();
        } catch {}
    }

    hide() { this.node.active = false; }

    update(deltaTime: number) {}

    private bindScrollButtons(): void {
        try {
            if (!this.scrollButtons || this.scrollButtons.length === 0) return;
            for (const btn of this.scrollButtons) {
                if (!btn || !btn.node) continue;
                btn.node.off(Button.EventType.CLICK);
                btn.node.on(Button.EventType.CLICK, () => this.onScrollButtonClicked(btn), this);
            }
        } catch {}
    }

    private onScrollButtonClicked(btn: Button): void {
        ShowToast('点击');
    }

    private bindPurchaseButtons(): void {
        try {
            if (!this.purchaseButtons || this.purchaseButtons.length === 0) return;
            for (let i = 0; i < this.purchaseButtons.length; i++) {
                const btn = this.purchaseButtons[i];
                if (!btn) continue;
                btn.node.off(Button.EventType.CLICK);
                btn.node.on(Button.EventType.CLICK, () => this.onPurchaseClicked(i), this);
            }
        } catch {}
    }

    private async onPurchaseClicked(index: number): Promise<void> {
        try {
            if (index !== this.AVAILABLE_INDEX) {
                ShowToast('后端暂未开放该月卡');
                return;
            }
            if (!this.serverCard) {
                ShowToast('月卡数据未加载');
                return;
            }
            if (this.isRequesting) return;
            this.isRequesting = true;
            if (this.serverCard.isActive) {
                await this.claimMonthlyCard();
            } else {
                await this.payMonthlyCard();
            }
        } catch {
        } finally {
            this.isRequesting = false;
        }
    }

    /**
     * 刷新激活状态UI：根据购买时间判断是否处于30天有效期
     */
    private refreshActivationUI(): void {
        try {
            for (let i = 0; i < this.purchaseButtons.length; i++) {
                const active = this.serverCard && i === this.AVAILABLE_INDEX ? !!this.serverCard.isActive : false;
                this.setNodeActive(this.stateInactive60[i], !active);
                this.setNodeActive(this.stateActive62[i], active);
                this.setNodeActive(this.stateInactive58[i], !active);
                this.setNodeActive(this.stateActive48[i], active);
                this.setNodeActive(this.purchaseButtonIcons[i], !active);
                const label = this.purchaseButtonLabels[i];
                if (label) {
                    label.node.active = !!active;
                    if (active && (!label.string || label.string.trim().length === 0)) label.string = '已激活';
                }
                const btn = this.purchaseButtons[i];
                if (btn) btn.interactable = i === this.AVAILABLE_INDEX;
            }
        } catch {}
    }

    /**
     * 领取每日奖励（每个激活月卡每天一次）
     */
    private handleDailyClaim(index: number): void {
        try {
            if (index !== this.AVAILABLE_INDEX) {
                ShowToast('后端暂未开放该月卡');
                return;
            }
            if (!this.serverCard) {
                ShowToast('月卡数据未加载');
                return;
            }
            this.claimMonthlyCard();
        } catch {}
    }

    private async fetchMonthlyCard(): Promise<void> {
        try {
            const res = await HttpClient.getInstance().get<APIResponse<MonthlyCard[]>>('/api/user/monthly/card');
            if (res.success && res.data && (res.data.code === 200 || res.data.code === 0)) {
                const list = Array.isArray(res.data.data) ? res.data.data : [];
                this.serverCard = list.length > 0 ? list[0] : null;
                this.refreshActivationUI();
            } else {
                ShowToast(res.data?.msg || '获取月卡信息失败');
            }
        } catch {
            ShowToast('网络错误，获取月卡失败');
        }
    }

    private async payMonthlyCard(): Promise<void> {
        try {
            const res = await HttpClient.getInstance().post<APIResponse<null>>('/api/user/monthly/card/pay', { id: this.serverCard.id });
            if (res.success && res.data && (res.data.code === 200 || res.data.code === 201)) {
                const msg = res.data.msg || '月卡已购买';
                ShowToast(msg);
                if (this.serverCard.immediateReward) {
                    const { diamond, gold } = MonthlyPass.parseReward(this.serverCard.immediateReward);
                    if (diamond) UserInfoData.getInstance().addDiamond(diamond);
                    if (gold) UserInfoData.getInstance().addGold(gold);
                }
                this.serverCard.isActive = true;
                this.refreshActivationUI();
            } else {
                ShowToast(res.data?.msg || '购买失败');
            }
        } catch {
            ShowToast('网络错误，购买失败');
        }
    }

    private async claimMonthlyCard(): Promise<void> {
        try {
            const res = await HttpClient.getInstance().post<APIResponse<null>>('/api/user/monthly/card/claim', { id: this.serverCard.id });
            if (res.success && res.data && (res.data.code === 200)) {
                if (this.serverCard.dailyReward) {
                    const { diamond, gold } = MonthlyPass.parseReward(this.serverCard.dailyReward);
                    if (diamond) UserInfoData.getInstance().addDiamond(diamond);
                    if (gold) UserInfoData.getInstance().addGold(gold);
                    if (gold && diamond) {
                        ShowToast(`领取成功!   钻石 +${diamond}  金币 +${gold}`);
                    } else if (diamond) {
                        ShowToast(`领取成功!   钻石 +${diamond}`);
                    } else if (gold) {
                        ShowToast(`领取成功!   金币 +${gold}`);
                    } else {
                        ShowToast('领取成功');
                    }
                } else {
                    ShowToast('领取成功');
                }
            } else {
                ShowToast(res.data?.msg || '领取失败');
            }
        } catch {
            ShowToast('网络错误，领取失败');
        }
    }

    /**
     * 获取今天的日期键（YYYYMMDD）
     */
    private getTodayKey(): string {
        const d = new Date();
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${y}${m}${day}`;
    }

    private setNodeActive(n: Node | undefined, active: boolean): void {
        if (n && n.isValid) n.active = !!active;
    }
}


