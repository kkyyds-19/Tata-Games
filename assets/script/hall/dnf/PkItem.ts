import { _decorator, Component, Node, Label, Sprite, resources, director, SpriteAtlas, SpriteFrame, sys } from 'cc';
import { game } from 'cc';
import { MusicManager } from '../../music/MusicManager';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { Hall } from '../hall';
import { PkMain } from './PkMain';
import { UserInfoData } from '../../user/UserInfoData';

const { ccclass, property } = _decorator;
@ccclass('PkItem')
export class PkItem extends Component {
     
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

    @property({ type: Prefab, tooltip: "子预制体：pk_item1（嵌入显示）" })
    public pkItem1Prefab: Prefab = null;

    private pk_idx:number = -1;
    private m_rarity: number = -1;
    private m_callback: (sender: any) => void = null;
    private hallInstance: Hall = null;
    private _userInfoData: UserInfoData = null;
    private combatPowerValue: number = 0;
    private nicknameValue: string = "";
    private honorValue: number = 0;
    private pkMainInstance: PkMain = null;

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

    private getDailyChallengeLimit(): number {
        return 5;
    }

    private getDailyChallengeRemaining(): number {
        const limit = this.getDailyChallengeLimit();
        const kDate = 'pk_daily_challenge_date';
        const kRemain = 'pk_daily_challenge_remaining';
        const today = this.getTodayKey();
        const lastDate = sys.localStorage.getItem(kDate);
        let remain = parseInt(sys.localStorage.getItem(kRemain) || '', 10);
        if (!lastDate || lastDate !== today) {
            sys.localStorage.setItem(kDate, today);
            remain = limit;
            sys.localStorage.setItem(kRemain, String(remain));
        }
        return remain < 0 ? 0 : remain;
    }

    private setDailyChallengeRemaining(val: number): void {
        const v = Math.max(0, val);
        sys.localStorage.setItem('pk_daily_challenge_remaining', String(v));
    }

     private consumeOneChallengeIfAvailable(): boolean {
        const remain = this.getDailyChallengeRemaining();
        if (remain <= 0) {
            try { director.emit(game.gameEvent.GAME_TOAST_SHOW, '今日挑战次数已用完'); } catch {}
            return false;
        }
        this.setDailyChallengeRemaining(remain - 1);
        try { director.emit(game.gameEvent.HALL_USER_INFO_UPDATE); } catch {}
        return true;
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
        this.updateCombatPowerDisplay();
        this.updateRankLabel(idx + 1);
   
        this.node.active = true;
        this.bindInviteButton();
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
     

        // 昵称文本显示：优先绑定/创建名为“Name”的 Label，其次自动匹配
        const label = this.ensureNicknameLabel();
        if (label) {
            const text = this.nicknameValue || "玩家";
            label.string = text;
            console.log(`[PkItem] 显示昵称: ${text} (Label: ${label.node.name})`);
        } else {
            console.warn('[PkItem] 未找到或创建昵称Label，请在预制体中绑定 nicknameLabel 或名为 Name 的Label');
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
    private embedPkItem1(): void {
        if (!this.pkItem1Prefab) {
            return;
        }

        // 避免重复嵌入：如果已存在，先移除
        const exists = this.node.getChildByName('PkItem1Embed');
        if (exists) {
            exists.removeFromParent();
            exists.destroy();
        }

        const child = instantiate(this.pkItem1Prefab);
        child.name = 'PkItem1Embed';
        // 默认放置在当前节点原点，具体位置请在编辑器中调整 pk_item1 预制体内部布局
        child.setPosition(0, 0, 0);
        this.node.addChild(child);

        // 同步数据到 PkItem1（若组件存在）
        const pk1 = child.getComponent('PkItem1') as any;
        if (pk1) {
            // 同步昵称
            try {
                if (pk1.nicknameLabel) {
                    pk1.nicknameLabel.string = this.nicknameValue || '玩家';
                } else {
                    // 兜底：尝试在子节点中查找包含 name/nick 的 Label
                    const labels = child.getComponentsInChildren(Label);
                    const auto = labels.find((l: Label) => {
                        const nn = l.node.name.toLowerCase();
                        return nn.includes('name') || nn.includes('nick');
                    });
                    if (auto) auto.string = this.nicknameValue || '玩家';
                }
            } catch (e) {
                console.warn('[PkItem] 同步昵称到 pk_item1 失败', e);
            }

            // 同步战力
            try {
                const text = this.formatNumber(this.combatPowerValue);
                if (pk1.combatPowerLabel) {
                    pk1.combatPowerLabel.string = text;
                } else {
                    // 兜底：尝试查找名为 power/combat 的 Label
                    const labels = child.getComponentsInChildren(Label);
                    const auto = labels.find((l: Label) => {
                        const nn = l.node.name.toLowerCase();
                        return nn.includes('power') || nn.includes('combat');
                    });
                    if (auto) auto.string = text;
                }
                // 已移除：不再用战力文本同步荣誉积分，改为使用独立 honorValue
            } catch (e) {
                console.warn('[PkItem] 同步战力到 pk_item1 失败', e);
            }

            // 覆盖：同步独立荣誉积分 honorValue 到 pk_item1
            try {
                const honorVal = Number(this.honorValue) || 0;
                if ((pk1 as any).setHonorValue) {
                    (pk1 as any).setHonorValue(honorVal);
                } else if ((pk1 as any).honorLabel) {
                    (pk1 as any).honorLabel.string = honorVal.toString();
                } else {
                    const labels = child.getComponentsInChildren(Label);
                    const autoHonor = labels.find((l: Label) => {
                        const nn = l.node.name.toLowerCase();
                        return nn.includes('honor') || nn.includes('honour') || nn.includes('integral') || nn.includes('points') || nn.includes('score') || nn.includes('积分');
                    });
                    if (autoHonor) autoHonor.string = honorVal.toString();
                }
            } catch (e) {
                console.warn('[PkItem] 覆盖荣誉积分到 pk_item1 失败', e);
            }

            // 如需同步排名，可在 pk_item1 中绑定对应的排名 Label，这里仅日志提示
            console.log(`[PkItem] 已嵌入 pk_item1，并同步数据：昵称=${this.nicknameValue}, 战力=${this.combatPowerValue}`);
        } else {
            console.warn('[PkItem] pk_item1 预制体未挂载 PkItem1 组件，已仅进行节点嵌入');
        }
    }

    private bindInviteButton() {
        const stack: Node[] = [this.node];
        while (stack.length) {
            const n = stack.pop();
            const nn = (n.name || '').toLowerCase();
            if (nn.includes('invite') || nn.includes('邀请')) {
                n.off(Node.EventType.TOUCH_END, this.onInviteClick, this);
                n.on(Node.EventType.TOUCH_END, this.onInviteClick, this);
                return;
            }
            n.children.forEach(ch => stack.push(ch));
        }
    }

    private onInviteClick() {
        try {
            const frame = this.Profile ? this.Profile.spriteFrame : null;
            const durn = this.hallInstance && (this.hallInstance as any).durnMain;
            if (durn && frame) {
                try { durn.setInvitedAvatarSprite && durn.setInvitedAvatarSprite(frame); } catch {}
            }
            if (frame) {
                try {
                    const name = (frame as any).name || '';
                    if (name) sys.localStorage.setItem('durn_invited_avatar_name', name);
                } catch {}
            }
        } catch {}
    }

    //开始进入游戏
    /**
     * 获取对手的用户ID
     * @returns 对手的用户ID，如果找不到则返回null
     */
    private getOpponentUserId(): number | null {
        if (!this.pkMainInstance || !this.pkMainInstance['rankingData']) {
            console.warn('[PkItem] 无法获取rankingData，PkMain实例或rankingData不存在');
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

    /**
     * 开始游戏 - 荣誉竞技场
     * @param stageId 关卡编号（可选，用于设置当前关卡）
     */
    private onStartClick(){
        if (!this.consumeOneChallengeIfAvailable()) {
            return;
        }
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
            this.honorLabel.string = (Number(this.honorValue) || 0).toString();
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
 
 
 