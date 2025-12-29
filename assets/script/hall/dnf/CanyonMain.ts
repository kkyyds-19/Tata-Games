import { _decorator, Component, Node, Label, Prefab, instantiate, ScrollView, UITransform, Sprite, SpriteAtlas, SpriteFrame, resources, UIOpacity, Color, Graphics, Vec3, view, LabelOutline, tween, v3, sys } from 'cc';
import { director } from 'cc';
import { game } from 'cc';
import { userAPI } from '../../api/UserAPI';
import { CanyonPkMain } from './CanyonPkMain';
import { UserInfoData } from '../../user/UserInfoData';


const { ccclass, property } = _decorator;

@ccclass('CanyonMain')
export class CanyonMain extends Component {

     // ==================== UI 属性 ====================
    
    // @property({ type: Label, tooltip: "钻石数量标签" })
    // public diamondLabel: Label = null;

    // @property({ type: Label, tooltip: "皮肤点券数量标签" })
    // public skinPointsLabel: Label = null;

    // @property({ type: Label, tooltip: "闪电数量标签" })
    // public shandianLabel: Label = null;

    // @property({ type: Prefab, tooltip: "皮肤段落(Item)的预制体" })
    // public dnfItemPrefab: Prefab = null;

    @property({ type: Node, tooltip: "滚动列表的容器节点" })
    public scrollContent: Node = null;

    @property({ type: ScrollView, tooltip: "滚动视图组件" })
    public scrollView: ScrollView = null;

    @property({ type: Node, tooltip: "背景容器节点（用于计算高度）" })
    public backgroundNode: Node = null;
    @property({ type: Node, tooltip: "打开峡谷对战面板按钮" })
    public openPkButton: Node = null;
    @property({ type: Node, tooltip: "领取峡谷水晶按钮" })
    public receiveButton: Node = null;
    @property({ type: Label, tooltip: "峡谷水晶显示标签" })
    public canyonCrystalLabel: Label = null;
    @property({ type: Label, tooltip: "每小时产量标签" })
    public productionLabel: Label = null;
    @property({ type: Label, tooltip: "倒计时标签" })
    public countdownLabel: Label = null;
    @property({ type: Label, tooltip: "排名标签" })
    public rankLabel: Label = null;
    @property({ type: Label })
    public dailyChallengeLabel: Label = null;
    // 当前倒计时剩余秒数（单位秒，必要时从毫秒换算）
    private countdownSeconds: number = 0;
    // 标记是否已执行 start，用于控制 onEnable 恢复逻辑
    private _started: boolean = false;
    

    onLoad() {
        this.setupScroll();
    }

    start() {
        this.setupScroll();
        this.bindOpenPkButton();
        this.bindReceiveButton();
        this.fetchHomeInfo();
        this.fetchGulchInfo();
        try { director.on(game.gameEvent.HALL_USER_INFO_UPDATE, this.onUserInfoUpdate, this); } catch {}
        try { director.on(game.gameEvent.HALL_REWARD_POPUP_SHOW, this.showRewardPopup, this); } catch {}
        this._started = true;
        this.updateChallengeCountLabel();
    }

    onEnable() {
        if (!this._started) return;
        this.bindOpenPkButton();
        this.bindReceiveButton();
        try { director.on(game.gameEvent.HALL_USER_INFO_UPDATE, this.onUserInfoUpdate, this); } catch {}
        try { director.on(game.gameEvent.HALL_REWARD_POPUP_SHOW, this.showRewardPopup, this); } catch {}
        this.fetchHomeInfo();
        this.fetchGulchInfo();
        this.updateChallengeCountLabel();
    }

    private setupScroll() {
        const sv = this.scrollView;
        const content = this.scrollContent;
        if (!sv || !content) return;
        sv.vertical = true;
        sv.horizontal = false;
        if (sv.content !== content) sv.content = content;
        const ct = content.getComponent(UITransform);
        const bt = this.backgroundNode ? this.backgroundNode.getComponent(UITransform) : null;
        if (!ct || !bt) return;
        ct.height = bt.height;
        this.updateContentSizeByChildren();
    }

    private updateContentSizeByChildren() {
        const content = this.scrollContent;
        if (!content) return;
        const ct = content.getComponent(UITransform);
        if (!ct) return;
        let top = 0;
        let bottom = 0;
        let first = true;
        for (let i = 0; i < content.children.length; i++) {
            const ch = content.children[i];
            const ut = ch.getComponent(UITransform);
            if (!ut) continue;
            const a = ut.anchorPoint;
            const y = ch.position.y;
            const h = ut.height;
            const chTop = y + h * (1 - a.y);
            const chBottom = y - h * a.y;
            if (first) {
                top = chTop;
                bottom = chBottom;
                first = false;
            } else {
                if (chTop > top) top = chTop;
                if (chBottom < bottom) bottom = chBottom;
            }
        }
        const required = first ? ct.height : (top - bottom);
        const bt = this.backgroundNode ? this.backgroundNode.getComponent(UITransform) : null;
        const base = bt ? bt.height : 0;
        ct.height = Math.max(required, base, ct.height);
    }
    
    
  // ==================== 公共方法 ====================


    public hide() {
        this.node.active = false;
    }

    private bindOpenPkButton() {
        if (!this.openPkButton) return;
        this.openPkButton.off(Node.EventType.TOUCH_END, this.onOpenPkClicked, this);
        this.openPkButton.on(Node.EventType.TOUCH_END, this.onOpenPkClicked, this);
    }

    private onOpenPkClicked() {
        CanyonPkMain.openOnCanvas();
    }

    private bindReceiveButton() {
        if (this.receiveButton) {
            this.receiveButton.off(Node.EventType.TOUCH_END, this.onReceiveClicked, this);
            this.receiveButton.on(Node.EventType.TOUCH_END, this.onReceiveClicked, this);
            console.log('[CanyonMain] 已绑定 receiveButton:', this.receiveButton?.name);
            return;
        }
        // 名称兜底自动绑定
        const hints = ['receive', '领取', 'collect', 'claim'];
        const queue: Node[] = [this.node];
        while (queue.length) {
            const n = queue.shift()!;
            const name = (n.name || '').toLowerCase();
            if (hints.some(h => name.includes(h))) {
                n.off(Node.EventType.TOUCH_END, this.onReceiveClicked, this);
                n.on(Node.EventType.TOUCH_END, this.onReceiveClicked, this);
                this.receiveButton = n;
                console.log('[CanyonMain] 自动绑定 receiveButton:', n.name);
                break;
            }
            (n.children || []).forEach(ch => queue.push(ch));
        }
    }

    private onReceiveClicked() {
        console.log('[CanyonMain] 点击领取水晶');
        userAPI.gulchReceive().then((resp)=>{
            const ok = resp && (resp.code === 200) && (resp.data === 1);
            if (!ok) return;
            console.log('[CanyonMain] 领取成功，刷新首页水晶');
            this.fetchHomeInfo();
        }).catch(()=>{});
    }

    onDisable() {
        try { director.off(game.gameEvent.HALL_USER_INFO_UPDATE, this.onUserInfoUpdate, this); } catch {}
        try { director.off(game.gameEvent.HALL_REWARD_POPUP_SHOW, this.showRewardPopup, this); } catch {}
        this.unschedule(this.tickCountdown);
    }

    private onUserInfoUpdate() {
        const honor = UserInfoData.getInstance().getHonor();
        const lbl = this.canyonCrystalLabel || this.findLabelByHints(['canyon', '晶', '水晶']);
        if (lbl) lbl.string = String(honor);
        this.fetchGulchInfo();
        this.updateChallengeCountLabel();
    }

    private async loadSpriteFrameFromAtlas(path: string, frameName: string): Promise<SpriteFrame | null> {
        return new Promise((resolve) => {
            resources.load(path, SpriteAtlas, (err, atlas) => {
                if (err || !atlas) { resolve(null); return; }
                const frame = atlas.getSpriteFrame(frameName);
                resolve(frame || null);
            });
        });
    }

    private async showRewardPopup(payload: { canyonCrystal: number, currencyGold: number }): Promise<void> {
        try {
            const parent = director.getScene()?.getChildByName('Canvas') || this.node.parent || director.getScene();
            if (!parent) return;
            const overlay = new Node('RewardOverlay');
            overlay.layer = parent.layer;
            parent.addChild(overlay);
            // 根据父节点或可视区域设置覆盖尺寸
            const parentUI = (parent as Node).getComponent(UITransform);
            const visible = view.getVisibleSize();
            const w = parentUI ? parentUI.width : visible.width;
            const h = parentUI ? parentUI.height : visible.height;

            const mask = new Node('RewardMask');
            const panel = new Node('RewardPanel');
            const titleNode = new Node('Title');
            const crystalIcon = new Node('CrystalIcon');
            const crystalLabelNode = new Node('CrystalLabel');
            const goldIcon = new Node('GoldIcon');
            const goldLabelNode = new Node('GoldLabel');

            // 遮罩使用 Graphics 绘制半透明全屏背景，确保可见
            const overlayUI = overlay.addComponent(UITransform);
            overlayUI.setContentSize(w, h);
            overlay.setPosition(new Vec3(0, 0, 0));

            const shade = new Node('shade');
            const shadeUI = shade.addComponent(UITransform);
            shadeUI.setContentSize(overlayUI.width, overlayUI.height);
            const shadeG = shade.addComponent(Graphics);
            shadeG.fillColor = new Color(0, 0, 0, 180);
            shadeG.rect(-w / 2, -h / 2, w, h);
            shadeG.fill();
            overlay.addChild(shade);

            const titleLabel = titleNode.addComponent(Label);
            titleLabel.string = '获得奖励';
            titleLabel.fontSize = 56;
            const titleOutline = titleNode.addComponent(LabelOutline);
            titleOutline.color = new Color(255, 215, 0, 255);
            titleOutline.width = 4;
            titleNode.setPosition(0, 200);

            const crystalLabel = crystalLabelNode.addComponent(Label);
            crystalLabel.string = String(Math.max(0, Number(payload?.canyonCrystal) || 0));
            crystalLabel.fontSize = 48;
            const crystalOutline = crystalLabelNode.addComponent(LabelOutline);
            crystalOutline.color = new Color(0, 0, 0, 255);
            crystalOutline.width = 3;
            crystalLabelNode.setPosition(-60, 40);

            const goldLabel = goldLabelNode.addComponent(Label);
            goldLabel.string = String(Math.max(0, Number(payload?.currencyGold) || 0));
            goldLabel.fontSize = 48;
            const goldOutline = goldLabelNode.addComponent(LabelOutline);
            goldOutline.color = new Color(0, 0, 0, 255);
            goldOutline.width = 3;
            goldLabelNode.setPosition(140, 40);

            const crystalSprite = crystalIcon.addComponent(Sprite);
            const goldSprite = goldIcon.addComponent(Sprite);

            // 载入图集帧
            const canyonFrame = await this.loadSpriteFrameFromAtlas('img/hall/dnf_Canyon', 'Canyon_8');
            const goldFrame = await this.loadSpriteFrameFromAtlas('img/general/game_item', 'currency_gold');
            if (canyonFrame) {
                crystalSprite.spriteFrame = canyonFrame;
                crystalIcon.setPosition(-140, 40);
                crystalIcon.setScale(0.1, 0.1, 0.1);
                tween(crystalIcon).to(0.35, { scale: v3(1, 1, 1) }, { easing: 'backOut' }).start();
            }
            if (goldFrame) {
                goldSprite.spriteFrame = goldFrame;
                goldIcon.setPosition(100, 40);
                goldIcon.setScale(0.1, 0.1, 0.1);
                tween(goldIcon).to(0.35, { scale: v3(1, 1, 1) }, { easing: 'backOut' }).start();
            }

            // 组装层级
            // 面板背景
            const panelBg = panel.addComponent(Graphics);
            const panelW = Math.min(900, w - 160);
            const panelH = 280;
            panelBg.fillColor = new Color(30, 45, 110, 220);
            panelBg.roundRect(-panelW / 2, -panelH / 2, panelW, panelH, 18);
            panelBg.fill();

            panel.addChild(titleNode);
            panel.addChild(crystalIcon);
            panel.addChild(crystalLabelNode);
            panel.addChild(goldIcon);
            panel.addChild(goldLabelNode);
            panel.setPosition(new Vec3(0, 0, 0));

            overlay.addChild(panel);
            // 置顶层级：overlay 在父节点层级最上，panel 在遮罩之上
            try {
                overlay.setSiblingIndex(parent.children.length - 1);
                panel.setSiblingIndex(overlay.children.length - 1);
            } catch {}

            // 点击遮罩关闭
            shade.on(Node.EventType.TOUCH_END, () => { overlay.removeFromParent(); });
            // 自动关闭（可选）
            this.scheduleOnce(() => { if (overlay && (overlay as any).isValid !== false) { overlay.removeFromParent(); } }, 3);
            this.fetchGulchInfo();
        } catch {}
    }

    private fetchHomeInfo() {
        userAPI.getHomeInfo().then((resp: any) => {
            const data = resp && resp.data ? resp.data : null;
            const v = data && typeof data.canyonCrystal === 'number' ? data.canyonCrystal : 0;
            const lbl = this.canyonCrystalLabel || this.findLabelByHints(['canyon', '晶', '水晶']);
            if (lbl) lbl.string = String(v);
        }).catch(() => {});
    }

    private fetchGulchInfo() {
        userAPI.getGulchInfo().then((resp: any) => {
            const data = resp && resp.data ? resp.data : null;
            const prod = data && typeof data.production === 'number' ? data.production : 0;
            const cd = data && typeof data.countdown === 'number' ? data.countdown : 0;
            const num = data && typeof data.number === 'number' ? data.number : 0;
            const prodLbl = this.productionLabel || this.findLabelByHints(['production','产量','每小时']);
            const cdLbl = this.countdownLabel || this.findLabelByHints(['countdown','倒计时','剩余','cd']);
            const rankLbl = this.rankLabel || this.findLabelByHints(['number','排名','rank']);
            if (prodLbl) prodLbl.string = `+${prod}/h`;
            this.countdownLabel = cdLbl || this.countdownLabel;
            this.startCountdown(cd);
            if (rankLbl) rankLbl.string = String(num);
        }).catch(() => {});
    }

    private startCountdown(seconds: number): void {
        let s = Math.max(0, Math.floor(seconds || 0));
        if (s > 8640000) {
            s = Math.floor(s / 1000);
        }
        this.countdownSeconds = s;
        const lbl = this.countdownLabel || this.findLabelByHints(['countdown','倒计时','剩余','cd']);
        if (lbl) lbl.string = this.formatCountdown(this.countdownSeconds);
        this.unschedule(this.tickCountdown);
        if (this.countdownSeconds > 0) {
            this.schedule(this.tickCountdown, 1);
        }
    }

    private tickCountdown(): void {
        if (this.countdownSeconds <= 0) {
            this.countdownSeconds = 0;
            this.unschedule(this.tickCountdown);
        } else {
            this.countdownSeconds -= 1;
        }
        const lbl = this.countdownLabel || this.findLabelByHints(['countdown','倒计时','剩余','cd']);
        if (lbl) lbl.string = this.formatCountdown(this.countdownSeconds);
    }

    private formatCountdown(seconds: number): string {
        let s = Math.max(0, Math.floor(seconds));
        // 兼容毫秒：若数值异常偏大，按毫秒处理
        if (s > 8640000) { // 大于100天秒数的10倍阈值，视为毫秒
            s = Math.floor(s / 1000);
        }
        const day = Math.floor(s / 86400);
        const h = Math.floor((s % 86400) / 3600);
        const m = Math.floor((s % 3600) / 60);
        const ss = s % 60;
        const fh = h.toString().padStart(2, '0');
        const fm = m.toString().padStart(2, '0');
        const fs = ss.toString().padStart(2, '0');
        return `${fh}：${fm}：${fs}`;
    }

    private getTodayKey(): string {
        const d = new Date();
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');
        return `${d.getFullYear()}${mm}${dd}`;
    }

    private getDailyChallengeLimit(): number { return 10; }

    private getDailyChallengeRemaining(): number {
        const limit = this.getDailyChallengeLimit();
        const kDate = 'gulch_daily_challenge_date';
        const kRemain = 'gulch_daily_challenge_remaining';
        const today = this.getTodayKey();
        const lastDate = sys.localStorage.getItem(kDate);
        let remain = parseInt(sys.localStorage.getItem(kRemain) || '', 10);
        if (!lastDate || lastDate !== today) {
            sys.localStorage.setItem(kDate, today);
            remain = limit;
            sys.localStorage.setItem(kRemain, String(remain));
        }
        if (isNaN(remain)) remain = limit;
        if (remain < 0) remain = 0;
        if (remain > limit) remain = limit;
        return remain;
    }

    private updateChallengeCountLabel(): void {
        const lbl = this.dailyChallengeLabel || this.findLabelByHints(['今日','挑战','次数']);
        if (!lbl) return;
        const remain = this.getDailyChallengeRemaining();
        const max = this.getDailyChallengeLimit();
        lbl.string = `今日挑战次数：${remain}/${max}`;
    }

    private findLabelByHints(hints: string[]): Label | null {
        const root = this.node;
        const queue: Node[] = [root];
        const lower = hints.map(h => h.toLowerCase());
        while (queue.length) {
            const curr = queue.shift()!;
            const name = (curr.name || '').toLowerCase();
            if (lower.some(h => name.includes(h))) {
                const lbl = curr.getComponent(Label);
                if (lbl) return lbl;
            }
            const children = curr.children || [];
            for (let i = 0; i < children.length; i++) queue.push(children[i]);
        }
        return null;
    }

    onDestroy() {
        this.unschedule(this.tickCountdown);
    }
}
