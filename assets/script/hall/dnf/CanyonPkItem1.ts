import { _decorator, Component, Node, Label, Sprite, resources, director, SpriteAtlas, SpriteFrame, sys } from 'cc';
import { game } from 'cc';
import { MusicManager } from '../../music/MusicManager';
 
import { Hall } from '../hall';
import { PkMain } from './PkMain';
import { Invite as InviteMain } from './InviteMain';
import { UserInfoData } from '../../user/UserInfoData';
import { DurnMain } from './DurnMain';
import { userAPI } from '../../api/UserAPI';

const { ccclass, property } = _decorator;
@ccclass('CanyonPkItem1')
export class CanyonPkItem1 extends Component {
     
    @property({ type: Sprite, tooltip: "段位Sprite" })
    public Rank: Sprite = null;

    @property({ type: Sprite, tooltip: "头像Sprite" })
    public Profile: Sprite = null;
    
    @property({ type: Label, tooltip: "战斗力数值显示" })
    public combatPowerLabel: Label = null;

    @property({ type: Label, tooltip: "荣誉积分显示" })
    public honorLabel: Label = null;
    
    @property({ type: Label, tooltip: "排名显示Label" })
    public rankLabel: Label = null;

    // 为兼容 Cocos Inspector 字段名“Ranking”，增加别名属性
    @property({ type: Label, tooltip: "排名显示（别名：Ranking）" })
    public Ranking: Label = null;

    @property({ type: Label, tooltip: "昵称显示" })
    public nicknameLabel: Label = null;


    @property({ type: SpriteAtlas, tooltip: "PK图集" })
    public pkAtlas: SpriteAtlas = null;

    @property({ type: Node, tooltip: "邀请按钮" })
    public inviteButton: Node = null;

    @property({ type: Node })
    public challengeButton: Node = null;

    

    private pk_idx:number = -1;
    private m_rarity: number = -1;
    private m_callback: (sender: any) => void = null;
    private hallInstance: Hall = null;
    private _userInfoData: UserInfoData = null;
    private combatPowerValue: number = 0;
    private nicknameValue: string = "";
    private honorValue: number = 0;
    private pkMainInstance: any = null;
    private userRankNumber: number = 0;

    // ========== 每日刷新控制工具 ==========
    private getTodayKey(): string {
        const d = new Date();
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');
        return `${d.getFullYear()}${mm}${dd}`;
    }

    private getDailySeed(): number {
        const keyDate = 'pk_daily_seed_date';
        const keyValue = 'pk_daily_seed_value';
        const today = this.getTodayKey();
        const lastDate = sys.localStorage.getItem(keyDate);
        if (lastDate === today) {
            const v = sys.localStorage.getItem(keyValue);
            return v ? parseInt(v, 10) : 0;
        }
        const newSeed = Math.floor(Math.random() * 0x7fffffff);
        sys.localStorage.setItem(keyDate, today);
        sys.localStorage.setItem(keyValue, String(newSeed));
        return newSeed;
    }

    private pickIndexBySeed(length: number): number {
        if (length <= 0) return 0;
        const seed = this.getDailySeed();
        const mix = (seed ^ (this.pk_idx * 1315423911)) >>> 0;
        return mix % length;
    }
     
    /**
     * 初始化PkItem
     * @param idx 索引
     * @param rarity 稀有度
     * @param hallInstance Hall实例
     * @param callback 回调函数
     */
    public init(idx: number, rarity: number, hallInstance: Hall, combatPower: number, nickname: string, callback: (sender: any) => void, pkMainInstance?: PkMain) {
        this.pk_idx = idx;
        this.m_rarity = rarity;
        this.hallInstance = hallInstance;
        this.m_callback = callback;
        this._userInfoData = UserInfoData.getInstance();
        this.combatPowerValue = combatPower;
        this.nicknameValue = nickname || "玩家";
        this.pkMainInstance = pkMainInstance || null;
        this.updateTitle(idx, rarity);
        this.updateAllUserInfo();
   
        this.node.active = true;
        this.bindInviteButton();
        this.bindChallengeButton();
        this.refreshRankFromGulchInfo();
    }

    onEnable() {
        this.updateAllUserInfo();
        this.refreshRankFromGulchInfo();
    }

    public updateAllUserInfo(): void {
        if (!this._userInfoData) this._userInfoData = UserInfoData.getInstance();
        const name = this._userInfoData.getNickname() || this.nicknameValue || "玩家";
        const power = this._userInfoData.getCombatPower() || 0;
        const label = this.ensureNicknameLabel();
        if (label) label.string = name;
        if (this.combatPowerLabel) this.combatPowerLabel.string = this.formatNumber(power);
        const rank = this.userRankNumber || this.computeDisplayRank();
        this.updateRankLabel(rank);
    }

    private computeDisplayRank(): number {
        const p = this.node.parent;
        if (!p) return 5;
        const list = p.children || [];
        for (let i = 0; i < list.length; i++) {
            if (list[i] === this.node) return i + 1;
        }
        return 5;
    }

    private refreshRankFromGulchInfo(): void {
        try {
            userAPI.getGulchInfo().then((resp: any) => {
                const data = resp && resp.data ? resp.data : null;
                const num = data && typeof data.number === 'number' ? data.number : 0;
                this.userRankNumber = num;
                this.updateRankLabel(num);
            }).catch(()=>{});
        } catch {}
    }

    /**
     * 更新标题显示
     */
    private updateTitle(count: number, skinIds: number) {
        this.updateRank(skinIds);
        this.updateProfile(skinIds);
        this.updateName(skinIds);
        this.updateCombatPower(skinIds);
    }

    /**
     * 更新段位显示
     */
    private updateRank(skinIds: number) {
        if (!this.Rank || !this.pkAtlas) {
            console.warn("[PkItem] 段位Sprite或图集未设置");
            return;
        }

        let frameName = "pk_32"; // 段位牌子
        if (skinIds === 1) { 
            frameName = "pk_32";
        } else if (skinIds === 2) { 
            frameName = "pk_32";
        } else if (skinIds === 3) { 
            frameName = "pk_32";
        } 
        
        const spriteFrame = this.pkAtlas.getSpriteFrame(frameName);
        if (spriteFrame) {
            this.Rank.spriteFrame = spriteFrame;
        } else {
            console.warn(`[PkItem] 在图集中未找到段位图片: ${frameName}`);
        }
    }

    /**
     * 更新头像显示
     */
    private updateProfile(skinIds: number) {
        if (!this.Profile) {
            console.warn('[PkItem] 头像Sprite未设置');
            return;
        }

        // 优先异步从 resources/img/icons 加载（Atlas 或目录），成功后覆盖头像
        resources.load('img/icons', SpriteAtlas, (err, atlas) => {
            if (!err && atlas) {
                const frames = atlas.getSpriteFrames();
                const hFrames = frames.filter(f => /^h_/.test(f.name));
                const pool = hFrames.length ? hFrames : frames;
                if (pool.length) {
                    const chosen = pool[this.pickIndexBySeed(pool.length)];
                    this.Profile.spriteFrame = chosen;
                    console.log(`[PkItem] 头像从 img/icons 图集（每日稳定）选择: ${chosen.name}`);
                } else {
                    console.warn('[PkItem] img/icons 图集中没有可用的 SpriteFrame');
                }
                return;
            }

            // 如果没有 Atlas，则尝试从目录加载全部 SpriteFrame
            resources.loadDir('img/icons', SpriteFrame, (err2, assets) => {
                if (!err2 && assets && assets.length) {
                    const hFrames = assets.filter(f => /^h_/.test(f.name));
                    const pool = hFrames.length ? hFrames : assets;
                    const chosen = pool[this.pickIndexBySeed(pool.length)];
                    this.Profile.spriteFrame = chosen;
                    console.log(`[PkItem] 头像从 img/icons 目录（每日稳定）选择: ${chosen.name}`);
                } else {
                    console.warn('[PkItem] img/icons 目录未找到任何 SpriteFrame');
                }
            });
        });

        // 同时做一个 pkAtlas 的本地兜底，确保初次显示不为空
        if (this.pkAtlas) {
            const candidates = ['pk_1','pk_2','pk_3','pk_4','pk_5','pk_7','pk_8','pk_9'];
            const available: { name: string, sf: SpriteFrame }[] = [];
            for (const name of candidates) {
                const sf = this.pkAtlas.getSpriteFrame(name);
                if (sf) available.push({ name, sf });
            }
            if (available.length > 0) {
                const chosen = available[this.pickIndexBySeed(available.length)];
                this.Profile.spriteFrame = chosen.sf;
                console.log(`[PkItem] 头像兜底选择（pkAtlas，每日稳定）: ${chosen.name}`);
            }
        }
    }

    /**
     * 更新名字显示
     */
    private updateName(skinIds: number) {
        const label = this.ensureNicknameLabel();
        if (label) {
            const text = (this._userInfoData && this._userInfoData.getNickname()) || this.nicknameValue || "玩家";
            label.string = text;
        }
    }

    /**
     * 确保存在用于显示昵称的 Label：
     * 1) 优先使用名为“Name”的节点上的 Label；
     * 2) 若“Name”节点存在但没有 Label，则在其下创建一个“NicknameLabel”子节点；
     * 3) 否则自动匹配包含 name/nick 的 Label；
     * 4) 若仍没有，则在当前节点下创建一个“NicknameLabel”。
     */
    private ensureNicknameLabel(): Label | null {
        if (this.nicknameLabel) return this.nicknameLabel;

        const nameNode = this.node.getChildByName('Name');
        if (nameNode) {
            const labelOnName = nameNode.getComponent(Label);
            if (labelOnName) {
                this.nicknameLabel = labelOnName;
                console.log('[PkItem] 显式绑定昵称Label节点: Name');
                return labelOnName;
            }
            // 在 Name 节点下创建一个 Label
            const child = new Node('NicknameLabel');
            const labelComp = child.addComponent(Label);
            labelComp.fontSize = 50;
            labelComp.lineHeight = 50;
            child.setPosition(0, 0, 0);
            nameNode.addChild(child);
            this.nicknameLabel = labelComp;
            console.log('[PkItem] 在 Name 节点下创建 NicknameLabel 用于显示昵称');
            return labelComp;
        }

        // 自动匹配
        const labels = this.node.getComponentsInChildren(Label);
        const auto = labels.find(l => {
            const nn = l.node.name.toLowerCase();
            return nn.includes('nick') || nn.includes('name');
        });
        if (auto) {
            this.nicknameLabel = auto;
            console.log(`[PkItem] 自动绑定昵称Label节点: ${auto.node.name}`);
            return auto;
        }

        // 最后兜底：创建一个新的 Label
        const fallbackNode = new Node('NicknameLabel');
        const fallbackLabel = fallbackNode.addComponent(Label);
        fallbackLabel.fontSize = 70;
        fallbackLabel.lineHeight = 70;
        fallbackNode.setPosition(50, 40, 0);
        this.node.addChild(fallbackNode);
        this.nicknameLabel = fallbackLabel;
        console.log('[PkItem] 在当前节点下创建 NicknameLabel 用于显示昵称');
        return fallbackLabel;
    }

    /**
     * 更新战力显示
     */
    private updateCombatPower(skinIds: number) {
       

        let frameName = "pk_1"; // 默认战力图标
        if (skinIds === 1) { // 神话
            frameName = "pk_1";
        } else if (skinIds === 2) {
            frameName = "pk_1";
        } else if (skinIds === 3) { 
            frameName = "pk_1";
        }
        
        const spriteFrame = this.pkAtlas.getSpriteFrame(frameName);
      
    }

    /**
     * 在当前项下嵌入并展示 pk_item1 预制体，且同步排名、昵称、战力
     */
    private embedPkItem1(): void { return; }

    private bindInviteButton() {
        if (this.inviteButton) {
            this.inviteButton.off(Node.EventType.TOUCH_START, this.onInviteStart, this);
            this.inviteButton.off(Node.EventType.TOUCH_END, this.onInviteClick, this);
            this.inviteButton.on(Node.EventType.TOUCH_START, this.onInviteStart, this);
            this.inviteButton.on(Node.EventType.TOUCH_END, this.onInviteClick, this);
            return;
        }
        const stack: Node[] = [this.node];
        while (stack.length) {
            const n = stack.pop();
            const nn = (n.name || '').toLowerCase();
            if (nn.includes('invite') || nn.includes('邀请')) {
                n.off(Node.EventType.TOUCH_START, this.onInviteStart, this);
                n.off(Node.EventType.TOUCH_END, this.onInviteClick, this);
                n.on(Node.EventType.TOUCH_START, this.onInviteStart, this);
                n.on(Node.EventType.TOUCH_END, this.onInviteClick, this);
                return;
            }
            n.children.forEach(ch => stack.push(ch));
        }
    }

    private bindChallengeButton() {
        if (this.challengeButton) {
            this.challengeButton.off(Node.EventType.TOUCH_START, this.onChallengeStart, this);
            this.challengeButton.off(Node.EventType.TOUCH_END, this.onChallengeClick, this);
            this.challengeButton.on(Node.EventType.TOUCH_START, this.onChallengeStart, this);
            this.challengeButton.on(Node.EventType.TOUCH_END, this.onChallengeClick, this);
            return;
        }
        const stack: Node[] = [this.node];
        while (stack.length) {
            const n = stack.pop();
            const nn = (n.name || '').toLowerCase();
            if (nn.includes('challenge') || nn.includes('挑战')) {
                n.off(Node.EventType.TOUCH_START, this.onChallengeStart, this);
                n.off(Node.EventType.TOUCH_END, this.onChallengeClick, this);
                n.on(Node.EventType.TOUCH_START, this.onChallengeStart, this);
                n.on(Node.EventType.TOUCH_END, this.onChallengeClick, this);
                return;
            }
            n.children.forEach(ch => stack.push(ch));
        }
    }

    private onChallengeStart(event: any) {
        try { event?.stopPropagation && event.stopPropagation(); } catch {}
    }

    private onChallengeClick(event: any) {
        try { event?.stopPropagation && event.stopPropagation(); } catch {}
        this.onStartClick();
    }

    private onInviteStart(event: any) {
        try { event?.stopPropagation && event.stopPropagation(); } catch {}
    }

    private onInviteClick(event: any) {
        try { event?.stopPropagation && event.stopPropagation(); } catch {}
        try {
            const frame = this.Profile ? this.Profile.spriteFrame : null;
            const durn = this.resolveDurnMainInstance();
            if (durn && frame) {
                try { (durn as any).setInvitedAvatarSprite && (durn as any).setInvitedAvatarSprite(frame); } catch {}
            }
            const opponentUserId = this.getOpponentUserId();
            if (opponentUserId) {
                (game.myGlobal as any).arenaOpponentUserId = opponentUserId;
                this.onStartClick();
            }
        } catch {}
    }

    private resolveDurnMainInstance(): DurnMain | null {
        const viaHall = this.hallInstance && (this.hallInstance as any).durnMain;
        if (viaHall) return viaHall as DurnMain;
        try {
            const scene = director.getScene();
            if (!scene) return null;
            const stack: Node[] = [scene];
            while (stack.length) {
                const n = stack.pop()!;
                const comp = n.getComponent(DurnMain);
                if (comp) return comp;
                const children = n.children || [];
                for (let i = 0; i < children.length; i++) stack.push(children[i]);
            }
        } catch {}
        return null;
    }

    //开始进入游戏
    /**
     * 获取对手的用户ID
     * @returns 对手的用户ID，如果找不到则返回null
     */
    private getOpponentUserId(): number | null {
        if (!this.pkMainInstance || !this.pkMainInstance['rankingData']) {
            this.pkMainInstance = this.resolveRankingProvider();
        }
        if (!this.pkMainInstance || !this.pkMainInstance['rankingData']) {
            console.warn('[PkItem] 无法获取rankingData，PkMain/Invite实例或rankingData不存在');
            return null;
        }
        
        try {
            const rankingData = this.pkMainInstance['rankingData'] as any[];
            // 根据当前项的昵称在rankingData中查找对应的用户ID
            const opponentInfo = rankingData.find(item => 
                item.nickName === this.nicknameValue || 
                item.userName === this.nicknameValue
            );
            
            if (opponentInfo && opponentInfo.userId) {
                console.log(`[PkItem] 找到对手用户ID: ${opponentInfo.userId}, 昵称: ${this.nicknameValue}`);
                // 将字符串类型的userId转换为数字类型
                const userIdNumber = Number(opponentInfo.userId);
                if (isNaN(userIdNumber)) {
                    console.warn(`[PkItem] 用户ID转换失败: ${opponentInfo.userId}`);
                    return null;
                }
                return userIdNumber;
            } else {
                console.warn(`[PkItem] 在rankingData中找不到昵称为 ${this.nicknameValue} 的对手信息`);
                return null;
            }
        } catch (e) {
            console.warn('[PkItem] 获取对手用户ID失败', e);
            return null;
        }
    }

    private resolveRankingProvider(): any | null {
        try {
            const scene = director.getScene();
            if (!scene) return null;
            const stack: Node[] = [scene];
            while (stack.length) {
                const n = stack.pop()!;
                const pk = n.getComponent(PkMain);
                if (pk && (pk as any)['rankingData']) return pk;
                const invite = n.getComponent(InviteMain as any);
                if (invite && (invite as any)['rankingData']) return invite;
                const children = n.children || [];
                for (let i = 0; i < children.length; i++) stack.push(children[i]);
            }
        } catch {}
        return null;
    }

    /**
     * 开始游戏 - 荣誉竞技场
     * @param stageId 关卡编号（可选，用于设置当前关卡）
     */
    private onStartClick(){
        console.warn("PK游戏开始", this.pk_idx);
        
        // 新逻辑：仅记录挑战目标，胜利后再交换排名
        try {
            // 记录本次挑战的目标昵称到本地存储，胜利后由结果界面确认并触发真实交换
            const targetName = this.nicknameValue || '';
            if (targetName && targetName.length > 0) {
                sys.localStorage.setItem('pk_challenge_target_name', targetName);
                const d = new Date();
                const mm = (d.getMonth() + 1).toString().padStart(2, '0');
                const dd = d.getDate().toString().padStart(2, '0');
                const todayKey = `${d.getFullYear()}${mm}${dd}`;
                sys.localStorage.setItem('pk_challenge_date', todayKey);
            }
        } catch (e) {
            console.warn('[PkItem] 记录挑战目标失败', e);
        }
        
        // 为所有索引设置关卡，避免仅前4项生效
        game.myGlobal.currentStage = 326; 
        game.myGlobal.stageType = 4;
        (game.myGlobal as any).gulchChallenge = true;

        // 设置对手用户ID，用于竞技场获取敌方英雄
        const opponentUserId = this.getOpponentUserId();
        if (opponentUserId) {
            game.myGlobal.arenaOpponentUserId = opponentUserId;
            console.log(`[PkItem] 设置竞技场对手用户ID: ${opponentUserId}`);
        } else {
            console.warn('[PkItem] 无法获取对手用户ID，竞技场可能无法正确获取敌方英雄');
            // 清除可能存在的旧对手ID
            game.myGlobal.arenaOpponentUserId = null;
        }

        MusicManager.getInstance().stopBackgroundMusic();
        game.myGlobal.gameInited = 0;
        
        game.myGlobal.currentWorld = 1;
        // TimeManager.getInstance().pause();
        // director.emit(game.gameEvent.GAME_HALL_WORLD_CHANGE);
        console.log(`开始游戏，关卡：${game.myGlobal.currentStage}`);
        
        // 直接进入战斗，胜利后再应用换位
        director.loadScene('game');
    }

    /**
     * 更新战斗力显示
     */
    public updateCombatPowerDisplay(): void {
        // 更新战斗力数值（使用当前项的随机战力）
        if (this.combatPowerLabel) {
            this.combatPowerLabel.string = this.formatNumber(this.combatPowerValue);
        }
        // 不在此处同步荣誉积分，荣誉积分独立于战斗力
    }

    /**
     * 格式化数字显示（添加千分位分隔符或使用K、M等单位）
     * @param num 要格式化的数字
     * @returns 格式化后的字符串
     */
    private formatNumber(num: number): string {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        } else {
            return num.toString();
        }
    }

    /**
     * 手动刷新战斗力显示（供外部调用）
     */
    public refreshCombatPower(): void {
        this.updateCombatPowerDisplay();
    }

    /**
     * 手动刷新荣誉积分显示（供外部调用）
     */
    public refreshHonor(): void {
        if (this.honorLabel) {
            const v = Number(this.honorValue) || 0;
            this.honorLabel.string = `+${v}/h`;
        }
    }

    /** 设置荣誉积分数值（独立于战斗力）并刷新显示 */
    public setHonorValue(value: number): void {
        this.honorValue = typeof value === 'number' ? value : 0;
        this.refreshHonor();
    }

    /**
     * 获取当前战斗力值
     * @returns 当前战斗力数值
     */
    public getCurrentCombatPower(): number {
        return this.combatPowerValue;
    }

    /**
     * 更新排名显示（小到大：idx+1）
     * @param rank 排名数值
     */
    public updateRankLabel(rank: number): void {
        // 优先使用显式绑定（rankLabel 或别名 Ranking）
        const boundLabel = this.rankLabel || this.Ranking;
        // 若未在编辑器绑定，则动态创建一个Label
        if (!boundLabel) {
            const rankNode = new Node('RankLabel');
            const labelComp = rankNode.addComponent(Label);
            labelComp.string = rank.toString();
            labelComp.fontSize = 70;
            labelComp.lineHeight = 70;
            // 默认放到节点左上角附近，避免遮挡原UI（可按需微调）
            rankNode.setPosition(430, 90, 0);
            this.node.addChild(rankNode);
            // 同步到两个属性，便于后续使用
            this.rankLabel = labelComp;
            this.Ranking = labelComp;
        } else {
            boundLabel.string = rank.toString();
        }
    }
}
 
 
 