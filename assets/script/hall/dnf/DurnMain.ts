import { Prefab } from 'cc';
import { Label } from 'cc';
import { Button } from 'cc';
import { sys } from 'cc';
import { game } from 'cc';
import { _decorator, Component, Node, director, resources, instantiate } from 'cc';
import { Sprite } from 'cc';
import { SpriteFrame } from 'cc';
import { MusicManager } from '../../music/MusicManager';
import { userAPI } from '../../api/API';
import { UserInfoData } from '../../user/UserInfoData';
import { Hall } from '../hall';
const { ccclass, property } = _decorator;

@ccclass('DurnMain')
export class DurnMain extends Component {
    private hallInstance: Hall = null;
    private originalInvitedAvatarFrame: SpriteFrame | null = null;
      // ==================== UI 属性 ====================
        
        
    
        @property({ type: Label, tooltip: "燃烧卷数量标签" })
        public shandianLabel: Label = null;
        @property({ type: Label, tooltip: "体力数量标签" })
        public staminaLabel: Label = null;
    

        @property({ type: Label, tooltip: "第一个文本标签" })
        public label1: Label = null;

        @property({ type: Label, tooltip: "第二个文本标签" })
        public label2: Label = null;

         @property({ type: Label, tooltip: "第二个文本标签" })
        public label3: Label = null;

        @property({ type: Label, tooltip: "倒计时显示标签" })
        public djs: Label = null;

        @property({ type: Sprite, tooltip: "邀请的用户头像" })
        public invitedAvatarSprite: Sprite = null;

        @property({ type: Node, tooltip: "Burn_46领取按钮" })
        public claimButton: Node = null;

        @property({ type: Node, tooltip: "Burn_49按钮节点" })
        public burnButton: Node = null;

        @property({ type: Node, tooltip: "Burn_49按钮节点" })
        public burnButton1: Node = null;
        // 自定义文本内容数组
        private textOptions: string[][] = [
            ["英雄增加10%属性", "怪物降低10%属性","燃烧降临-难度1"],
            ["英雄增加20%属性", "怪物降低20%属性","燃烧降临-难度2"],
            ["英雄增加30%属性", "怪物降低30%属性","燃烧降临-难度3"],
            ["英雄增加40%属性", "怪物降低40%属性","燃烧降临-难度4"],
            ["英雄增加50%属性", "怪物降低50%属性","燃烧降临-难度5"]
        ];
        
        private currentTextIndex: number = 0;
        private remainingSeconds: number = 0;
        private canClaim: boolean = false;
        @property({ type: Prefab })
        public inviteMainPrefab: Prefab = null;

    start() {
        this.setupButtonEvent();
    }

    update(deltaTime: number) {
        
    }
    
    onLoad() {
        // 确保节点作为场景的直接子节点，实现覆盖效果
        const scene = director.getScene();
        const canvas = scene?.getChildByName('Canvas');
        if (canvas) {
            this.node.parent = canvas;
        }
    }

    onEnable() {
        this.refreshAll();
        this.restoreCountdownFromStorage();
        this.bindBurn30Button(this.node);
    }

    // ==================== UI刷新 ====================
    
    /**
     * 刷新整个主面板
     */
    public refreshAll() {
        this.updateCurrencyDisplay();
    
    }
    
        /**
         * 更新货币显示
         */
        private updateCurrencyDisplay() {
            const userInfo = UserInfoData.getInstance();
            if (this.shandianLabel) this.shandianLabel.string = userInfo.getFlamesVoucher().toString();
            if (this.staminaLabel) this.staminaLabel.string = `${userInfo.getStamina()}/${userInfo.getMaxStamina()}`;
        }
        
        private onStartClick(){
            game.myGlobal.currentStage = 312;
            MusicManager.getInstance().stopBackgroundMusic();
            game.myGlobal.gameInited = 0;
            game.myGlobal.stageType = 5;
            game.myGlobal.currentWorld = 1;
            console.log(`开始游戏，关卡：${game.myGlobal.currentStage}`);
            director.loadScene('game');
        } 

        
    // ==================== 公共方法 ====================

    public setHallInstance(hall: Hall) {
        this.hallInstance = hall;
    }

    public show() {
        this.node.active = true;
        this.refreshAll();
    }

    public hide() {
        this.node.active = false;
        try {
            const target = this.ensureInvitedAvatarSprite();
            if (target && this.originalInvitedAvatarFrame) {
                target.spriteFrame = this.originalInvitedAvatarFrame;
            }
            this.originalInvitedAvatarFrame = null;
        } catch {}
    }

    // ==================== 按钮事件处理 ====================

   private setupButtonEvent() {
        if (this.burnButton) {
            this.burnButton.on(Node.EventType.TOUCH_END, this.onLeftButtonClicked, this);
        }
        if (this.burnButton1) {
            this.burnButton1.on(Node.EventType.TOUCH_END, this.onRightButtonClicked, this);
        }
        if (this.claimButton) {
            this.claimButton.on(Node.EventType.TOUCH_END, this.onClaimButtonClicked, this);
        }
}

    private onLeftButtonClicked() {
    this.switchTextContent(-1); // 向左切换
}

private onRightButtonClicked() {
    this.switchTextContent(1); // 向右切换
}

  private switchTextContent(direction: number) {
    if (this.textOptions.length === 0) return;

    // 根据方向计算新的索引
    if (direction > 0) {
        // 向右切换
        this.currentTextIndex = (this.currentTextIndex + 1) % this.textOptions.length;
    } else {
        // 向左切换  
        this.currentTextIndex = (this.currentTextIndex - 1 + this.textOptions.length) % this.textOptions.length;
    }

    // 更新Label文本
    const currentTexts = this.textOptions[this.currentTextIndex];
    if (this.label1 && currentTexts[0]) this.label1.string = currentTexts[0];
    if (this.label2 && currentTexts[1]) this.label2.string = currentTexts[1];
    if (this.label3 && currentTexts[2]) this.label3.string = currentTexts[2];
}

    // 设置自定义文本内容的方法
    public setTextOptions(options: string[][]) {
        this.textOptions = options;
        this.currentTextIndex = 0;
    }

    public startCountdown(seconds: number) {
        this.remainingSeconds = Math.max(0, Math.floor(seconds));
        this.canClaim = this.remainingSeconds === 0;
        this.updateCountdownLabel();
        this.unschedule(this.tickCountdown);
        if (this.remainingSeconds > 0) {
            this.schedule(this.tickCountdown, 1);
        }
    }

    private tickCountdown() {
        if (this.remainingSeconds <= 0) {
            this.canClaim = true;
            this.updateCountdownLabel();
            this.unschedule(this.tickCountdown);
            return;
        }
        this.remainingSeconds -= 1;
        if (this.remainingSeconds <= 0) {
            this.remainingSeconds = 0;
            this.canClaim = true;
            this.unschedule(this.tickCountdown);
        }
        this.updateCountdownLabel();
    }

    private updateCountdownLabel() {
        if (this.djs) {
            const h = Math.floor(this.remainingSeconds / 3600);
            const m = Math.floor((this.remainingSeconds % 3600) / 60);
            const s = this.remainingSeconds % 60;
            const hh = h < 10 ? `0${h}` : `${h}`;
            const mm = m < 10 ? `0${m}` : `${m}`;
            const ss = s < 10 ? `0${s}` : `${s}`;
            this.djs.string = h > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
        }
        this.updateClaimButtonState();
    }

    public setNextAvailableAt(timestampMs: number) {
        try { sys.localStorage.setItem('burn_claim_next_available_ms', String(timestampMs)); } catch {}
        const now = Date.now();
        const diff = Math.ceil((timestampMs - now) / 1000);
        this.startCountdown(Math.max(0, diff));
    }

    public tryClaim(): boolean {
        return this.canClaim;
    }

    private async onClaimButtonClicked() {
        if (!this.canClaim) return;
        try {
            const res = await userAPI.claimFlamesVoucher(1);
            const data = res && res.data ? res.data : null;
            const count = data && typeof data.flamesVoucher === 'number' ? data.flamesVoucher : undefined;
            if (count !== undefined) {
                UserInfoData.getInstance().setFlamesVoucher(count);
                this.updateCurrencyDisplay();
            }
            if (count === undefined) {
                try {
                    const home = await userAPI.getHomeInfo();
                    const fv = home && home.data && typeof (home.data as any).flamesVoucher === 'number' ? (home.data as any).flamesVoucher : undefined;
                    if (fv !== undefined) {
                        UserInfoData.getInstance().setFlamesVoucher(fv);
                        this.updateCurrencyDisplay();
                    }
                } catch {}
            }
            const next = Date.now() + 12 * 60 * 60 * 1000;
            this.setNextAvailableAt(next);
        } catch (e) {
            console.warn('[DurnMain] 领取火焰凭证失败', e);
        }
    }

    private updateClaimButtonState() {
        if (!this.claimButton) return;
        const btn = this.claimButton.getComponent(Button);
        if (btn) {
            btn.interactable = this.canClaim;
        }
    }

    private restoreCountdownFromStorage() {
        let ts = 0;
        try {
            const val = sys.localStorage.getItem('burn_claim_next_available_ms');
            if (val) ts = parseInt(val, 10) || 0;
        } catch {}
        const now = Date.now();
        if (!ts || ts <= now) {
            this.startCountdown(0);
        } else {
            const diff = Math.ceil((ts - now) / 1000);
            this.startCountdown(diff);
        }
    }

    private bindBurn30Button(root: Node) {
        const stack: Node[] = [];
        if (root) stack.push(root);
        const scene = director.getScene();
        if (scene) stack.push(scene);
        while (stack.length) {
            const curr = stack.pop()!;
            if ((curr.name || '') === 'Burn_30') {
                curr.off(Node.EventType.TOUCH_END, this.onBurn30Clicked, this);
                curr.on(Node.EventType.TOUCH_END, this.onBurn30Clicked, this);
                return;
            }
            const children = curr.children || [];
            for (let i = 0; i < children.length; i++) stack.push(children[i]);
        }
    }

    private onBurn30Clicked() {
        this.showInviteMain();
    }

    private showInviteMain() {
        const exist = this.node.getChildByName('Invite_main_Instance');
        if (exist) {
            exist.active = true;
            return;
        }
        if (this.inviteMainPrefab) {
            const n = instantiate(this.inviteMainPrefab);
            n.name = 'Invite_main_Instance';
            n.setPosition(0, 0, 0);
            n.setSiblingIndex(9999);
            this.node.addChild(n);
            return;
        }
        resources.load('prefab/hall/dnf/Invite_main', Prefab, (err, prefab) => {
            if (!err && prefab) {
                this.inviteMainPrefab = prefab;
                const n = instantiate(prefab);
                n.name = 'Invite_main_Instance';
                n.setPosition(0, 0, 0);
                n.setSiblingIndex(9999);
                this.node.addChild(n);
            }
        });
    }

    public setInvitedAvatarSprite(frame: SpriteFrame | null) {
        const target = this.ensureInvitedAvatarSprite();
        if (target && frame) {
            if (!this.originalInvitedAvatarFrame) {
                this.originalInvitedAvatarFrame = target.spriteFrame || null;
            }
            target.spriteFrame = frame;
        }
    }

    private ensureInvitedAvatarSprite(): Sprite | null {
        if (this.invitedAvatarSprite) return this.invitedAvatarSprite;
        const byName = this.node.getComponentsInChildren(Sprite).find(s => {
            const n = (s.node.name || '').toLowerCase();
            return n.includes('invited') || n.includes('invite') || n.includes('avatar') || n.includes('icon');
        });
        if (byName) {
            this.invitedAvatarSprite = byName;
            return byName;
        }
        const n = new Node('InvitedAvatar');
        const sp = n.addComponent(Sprite);
        n.setPosition(0, 0, 0);
        this.node.addChild(n);
        this.invitedAvatarSprite = sp;
        return sp;
    }

    // 已取消持久化头像恢复，进入界面保持原始头像，邀请后临时覆盖，退出时还原
}