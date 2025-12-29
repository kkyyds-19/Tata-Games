import { _decorator, Component, Node, Label, Button, Prefab, sp, instantiate, resources, Sprite, UITransform, Size } from 'cc';
import { MonsterRefresh } from './MonsterRefresh';
import { partnerConfigs, PartnerConfig } from '../../global/config/PartnerConfig';
import { UserPartnerData, UserPartnerItem } from '../../user/UserPartnerData';
import { PartnerIcon } from './PartnerIcon';
import { PartnerEditor } from './PartnerEditor';
import { director } from 'cc';
import { game } from 'cc';
import { HttpClient } from '../../http/HttpClient';

const { ccclass, property } = _decorator;

@ccclass('PartnerMainPanel')
export class PartnerMainPanel extends Component {

    // ==================== UI 属性 ====================

    @property({ type: Prefab, tooltip: "伙伴图标的预制体" })
    public partnerIconPrefab: Prefab = null;

    @property({ type: Node, tooltip: "伙伴列表的滚动容器" })
    public content: Node = null;

    @property({ type: sp.Skeleton, tooltip: "显示伙伴Spine动画的节点" })
    public partnerSpine: sp.Skeleton = null;

    @property({ type: Node, tooltip: "伙伴上阵编辑界面" })
    public partnerEditorNode: Node = null;

    @property({ type: Button, tooltip: "打开上阵编辑界面的按钮" })
    public editButton: Button = null;

    @property({ type: Label, tooltip: "伙伴名称" })
    public nameLabel: Label = null;

    @property({ type: Label, tooltip: "伙伴等级" })
    public levelLabel: Label = null;

    @property({ type: Label, tooltip: "技能冷却时间" })
    public cooldownLabel: Label = null;

    @property({ type: Label, tooltip: "攻击和生命加成" })
    public bonusLabel: Label = null;

    @property({ type: Label, tooltip: "技能描述" })
    public skillDescLabel: Label = null;

    @property({ type: Label, tooltip: "当前等级/最大等级" })
    public levelProgressLabel: Label = null;

    @property({ type: Label, tooltip: "当前星级/最大星级" })
    public starProgressLabel: Label = null;

    @property({ type: Label })
    public ownedCountLabel: Label = null;

    @property({ type: Button, tooltip: "关闭主面板的按钮" })
    public closeButton: Button = null;

    //升级
    @property({ type: Button, tooltip: "升级按钮" })
    public upgradeButton: Button = null;


    //升星
    @property({ type: Button, tooltip: "升星按钮" })
    public starButton: Button = null;

    //召唤
    @property({ type: Button, tooltip: "召唤按钮" })
    public summonButton: Button = null;


    // ==================== 内部状态 ====================

    private _allPartnerIcons: PartnerIcon[] = [];
    private _currentSelectedPartnerId: number | null = null;
    private _partnerEditorComponent: PartnerEditor = null;
    // 预加载的伙伴召唤面板 Prefab，用于加快页面切换速度
    private _summonPrefab: Prefab | null = null;
    private _openingSummon: boolean = false;
    // 预实例化的召唤节点缓存，加速首次打开
    private _summonNodeCache: Node | null = null;
    private _allowSpineLoad: boolean = false;
    private _summonSuccessPopup: Node | null = null;
    private _fetchingPartners: boolean = false;
    private _lastFetchTs: number = 0;


    onLoad() {

        this.node.on(Node.EventType.TOUCH_START, ()=>{
            //点击吞噬
        }, this);

        this.init();
        this.fetchAndPopulatePartners();
    }

    private init() {
        if (this.partnerEditorNode) {
            this._partnerEditorComponent = this.partnerEditorNode.getComponent(PartnerEditor);
            this.partnerEditorNode.active = false;
        }

        this.editButton.node.off(Button.EventType.CLICK, this.onShowEditor, this);
        this.closeButton.node.off(Button.EventType.CLICK, this.hide, this);
        this.upgradeButton.node.off(Button.EventType.CLICK, this.onUpgradePartner, this);
        this.starButton.node.off(Button.EventType.CLICK, this.onStarUpPartner, this);
        this.editButton.node.on(Button.EventType.CLICK, this.onShowEditor, this);
        this.closeButton.node.on(Button.EventType.CLICK, this.hide, this);
        this.upgradeButton.node.on(Button.EventType.CLICK, this.onUpgradePartner, this);
        this.starButton.node.on(Button.EventType.CLICK, this.onStarUpPartner, this);
        if (this.summonButton) {
            // 绑定召唤页打开事件
            this.summonButton.node.off(Button.EventType.CLICK, this.onShowSummon, this);
            this.summonButton.node.on(Button.EventType.CLICK, this.onShowSummon, this);
            this.summonButton.interactable = true;
        }

        // 预加载伙伴召唤面板，减少点击跳转时的首次加载等待
        // 这里使用 resources.load 获取 Prefab 实例，避免类型不匹配
        resources.load('prefab/hall/partner/partner_Summon', Prefab, (err, prefab) => {
            if (!err && prefab) {
                this._summonPrefab = prefab;
                try {
                    const node = instantiate(prefab);
                    const parent = this.node.parent || director.getScene();
                    node.active = false;
                    parent.addChild(node);
                    this._summonNodeCache = node;
                    const refresh = node.getComponent(MonsterRefresh);
                    if (refresh) {
                        refresh.prefetch();
                    }
                } catch {}
            }
        });
        
        
        // 数据由 fetchAndPopulatePartners 负责获取与填充

        // 防止重复注册事件导致刷新请求过多
        director.off(game.gameEvent.GAME_PARTNER_EDITOR_PAGE_REFRESH, this.refresh, this);
        director.off('GAME_PARTNER_SUMMON_SUCCESS', this.onSummonSuccess, this);
        director.on(game.gameEvent.GAME_PARTNER_EDITOR_PAGE_REFRESH, this.refresh, this);
        director.on('GAME_PARTNER_SUMMON_SUCCESS', this.onSummonSuccess, this);
    }
    onDestroy() {
        director.off(game.gameEvent.GAME_PARTNER_EDITOR_PAGE_REFRESH, this.refresh, this);
        director.off('GAME_PARTNER_SUMMON_SUCCESS', this.onSummonSuccess, this);
    }

    private refresh() {
        this._allowSpineLoad = true;
        this.fetchAndPopulatePartners();
    }

    private async fetchAndPopulatePartners() {
        const now = Date.now();
        if (this._fetchingPartners || (now - this._lastFetchTs) < 800) {
            return;
        }
        this._fetchingPartners = true;
        try {
            const client = HttpClient.getInstance();
            const listResp: any = await client.get(`/api/user/partner/list?ts=${Date.now()}`);
            const listData = listResp && listResp.data && listResp.data.data ? listResp.data.data : [];
            UserPartnerData.getInstance().syncFromPartnerList(listData);
        } catch {}
        finally {
            this._fetchingPartners = false;
            this._lastFetchTs = Date.now();
        }

        this.populatePartnerList();
        this.updateOwnedCountLabel();
        const allOwnedPartners = UserPartnerData.getInstance().getOwnedPartners();
        if (allOwnedPartners.length > 0) {
            this.selectPartner(allOwnedPartners[0].id, true);
        } else {
            this.clearDetailView();
        }
    }
    /**
     * 填充伙伴列表
     */
    private populatePartnerList() {
        if (!this.content || !this.content.isValid) {
            let found: Node | null = null;
            const stack: Node[] = [];
            if (this.node && this.node.isValid) stack.push(this.node);
            while (stack.length) {
                const n = stack.pop();
                if (!n || !n.isValid) continue;
                if (n.name === 'content') { found = n; break; }
                const children = n.children;
                if (children && children.length) {
                    for (let i = 0; i < children.length; i++) {
                        const c = children[i];
                        if (c && c.isValid) stack.push(c);
                    }
                }
            }
            if (found) this.content = found;
            if (!this.content || !this.content.isValid) {
                return;
            }
        }
        this.content.removeAllChildren();
        this._allPartnerIcons = [];

        const allPartners = UserPartnerData.getInstance().getOwnedPartners();

        if (!this.partnerIconPrefab) {
            resources.load('prefab/hall/partner/partner_small_icon', Prefab, (err, prefab) => {
                if (err || !prefab) return;
                this.partnerIconPrefab = prefab;
                this.populatePartnerList();
            });
            return;
        }

        for (const partnerData of allPartners) {
            const iconNode = instantiate(this.partnerIconPrefab);
            this.content.addChild(iconNode);
            let partnerIcon = iconNode.getComponent(PartnerIcon);
            if (!partnerIcon) {
                partnerIcon = iconNode.addComponent(PartnerIcon);
                const icon = iconNode.getChildByName('icon');
                const mark = iconNode.getChildByName('mark');
                const levl = iconNode.getChildByName('levl');
                const equip = iconNode.getChildByName('equip');
                const xietong = iconNode.getChildByName('xietong');
                const choose = iconNode.getChildByName('choose');
                if (icon) {
                    partnerIcon.iconSprite = icon.getComponent(Sprite);
                    const ui = icon.getComponent(UITransform) || icon.addComponent(UITransform);
                    ui.setContentSize(160, 160);
                }
                if (mark) {
                    const classE = mark.getChildByName('class_e');
                    if (classE) partnerIcon.qualitySprite = classE.getComponent(Sprite);
                }
                if (levl) {
                    const labelNode = levl.getChildByName('Label');
                    if (labelNode) partnerIcon.levelLabel = labelNode.getComponent(Label);
                }
                partnerIcon.equippedNode = equip || null;
                partnerIcon.synergizedNode = xietong || null;
                partnerIcon.selectedNode = choose || null;
            }
            partnerIcon.init(partnerData.id);
            partnerIcon.setOnClickCallback((id) => this.selectPartner(id, true));
            const btn = iconNode.getComponent(Button);
            if (btn) {
                try { (btn as any).clickEvents = []; } catch {}
                btn.node.off(Button.EventType.CLICK);
                btn.node.on(Button.EventType.CLICK, () => this.selectPartner(partnerData.id, true), this);
            }
            this._allPartnerIcons.push(partnerIcon);
        }
    }

    /**
     * 选中一个伙伴，并更新所有视图
     * @param partnerId 要选中的伙伴ID
     */
    private selectPartner(partnerId: number, userInitiated: boolean = false) {
        if (this._currentSelectedPartnerId === partnerId) return;

        this._currentSelectedPartnerId = partnerId;
        if (userInitiated) this._allowSpineLoad = true;
        this.refreshAllViews();
    }

    /**
     * 根据当前选中的伙伴ID，刷新所有UI显示
     */
    private refreshAllViews() {
        if (!this._currentSelectedPartnerId) {
            this.clearDetailView();
            return;
        }

        const partnerData = UserPartnerData.getInstance().getPartner(this._currentSelectedPartnerId);
        const partnerConfig = partnerConfigs.find(c => c.id === this._currentSelectedPartnerId) || null;

        if (!partnerData) {
            console.error(`[PartnerMainPanel] 无法找到伙伴数据: ${this._currentSelectedPartnerId}`);
            this.clearDetailView();
            return;
        }

        this.updateDetailView(partnerData, partnerConfig as any);

        // 刷新列表中的选中状态
        this._allPartnerIcons.forEach(icon => {
            icon.setSelected(icon.partnerId === this._currentSelectedPartnerId);
        });
    }

    /**
     * 更新右侧的详细信息面板
     * @param partnerData 用户伙伴数据
     * @param partnerConfig 伙伴配置
     */
    private updateDetailView(partnerData: UserPartnerItem, partnerConfig: PartnerConfig | null) {
        const displayName = partnerData.displayName || (partnerConfig ? partnerConfig.name : '未知伙伴');
        this.nameLabel.string = displayName;
        this.levelLabel.string = `${partnerData.level}级`;
        this.skillDescLabel.string = partnerConfig ? partnerConfig.skillDesc : '';
        this.cooldownLabel.string = partnerConfig ? `冷却：${partnerConfig.cooldown}s` : '';

        const bonuses = UserPartnerData.getInstance().getPartnerActualBonuses(partnerData.id);
        if (bonuses) {
            const attackBonusPercent = (bonuses.attackBonus * 100).toFixed(1);
            const hpBonusPercent = (bonuses.hpBonus * 100).toFixed(1);
            this.bonusLabel.string = `攻击: +${attackBonusPercent}%  生命: +${hpBonusPercent}%`;
        } else {
            this.bonusLabel.string = '';
        }

        this.levelProgressLabel.string = `等级${partnerData.level}/200`;
        this.starProgressLabel.string = `${partnerData.star}/6`;

        if (this._allowSpineLoad) {
            if (partnerConfig) {
                const anim = (partnerConfig.animationNames && partnerConfig.animationNames[0]) || 'move';
                this.loadPartnerSpine(partnerConfig.spinePath, partnerConfig.spineSkinName, anim);
            } else {
                const nameAs = (partnerData as any).nameAs;
                if (nameAs) {
                    const candidates = this.deriveSpineCandidates(nameAs);
                    const skinHint = this.getSkinForNameAs(nameAs) || nameAs;
                    this.loadPartnerSpineFromCandidates(candidates, skinHint);
                } else if (this.partnerSpine) {
                    this.partnerSpine.node.active = false;
                    this.partnerSpine.clearTracks();
                }
            }
        }
    }
    
    /**
     * 加载伙伴的Spine动画资源
     * @param path Spine资源路径
     * @param skin 皮肤名称
     */
    private loadPartnerSpine(path: string, skin: string, animName?: string) {
        if (!this.partnerSpine) return;
        this.partnerSpine.node.active = false;

        resources.load(path, sp.SkeletonData, (err, skeletonData) => {
            if (err || !skeletonData) {
                console.error(`[PartnerMainPanel] 加载Spine资源失败: ${path}`, err);
                return;
            }
            this.partnerSpine.node.active = true;
            this.partnerSpine.skeletonData = skeletonData;
            if (skin && skin !== '') {
                this.partnerSpine.setSkin(skin);
            }

            try {
                this.partnerSpine.setAnimation(0, 'stand by', true);
            } catch {
                const fallback = animName || 'move';
                try { this.partnerSpine.setAnimation(0, fallback, true); } catch {
                    try { this.partnerSpine.setAnimation(0, 'idle', true); } catch {}
                }
            }
            this.partnerSpine.node.setScale(0.88,0.88);
        });
    }

    private deriveSpineCandidates(nameAs: string): string[] {
        const candidates: string[] = [];
        const parts = nameAs.split('_');
        let zeroName: string | null = null;
        if (parts.length === 3) {
            const type = parts[1];
            const num = parts[2];
            const normalized = Number(num).toString();
            zeroName = `b_${type}_0_${normalized}`;
        }
        if (zeroName) {
            candidates.push(`spine/boss/${zeroName}`);
            candidates.push(`spine/boss/${zeroName}/${zeroName}`);
            candidates.push(`spine/boss/${zeroName}/${zeroName}_ske`);
            candidates.push(`spine/boss/${zeroName}.json`);
        }
        candidates.push(`spine/boss/${nameAs}`);
        candidates.push(`spine/boss/${nameAs}/${nameAs}`);
        candidates.push(`spine/boss/${nameAs}/${nameAs}_ske`);
        candidates.push(`spine/boss/${nameAs}.json`);
        return candidates;
    }

    private getSkinForNameAs(nameAs: string): string | null {
        const parts = nameAs.split('_');
        if (parts.length !== 3) return null;
        const type = parts[1];
        const num = parts[2];
        const normalized = Number(num).toString();
        return `b_${type}_0_${normalized}`;
    }

    private loadPartnerSpineFromCandidates(paths: string[], skin?: string) {
        if (!this.partnerSpine || !paths || paths.length === 0) return;
        const tryLoad = (index: number) => {
            if (index >= paths.length) {
                this.partnerSpine.node.active = false;
                this.partnerSpine.clearTracks();
                return;
            }
            resources.load(paths[index], sp.SkeletonData, (err, skeletonData) => {
                if (err || !skeletonData) {
                    tryLoad(index + 1);
                    return;
                }
                this.partnerSpine.node.active = true;
                this.partnerSpine.skeletonData = skeletonData;
                if (skin && skin !== '') {
                    try { this.partnerSpine.setSkin(skin); } catch {}
                }
                const anims = ['stand by', 'idle', 'move', 'attack', 'stand', 'run'];
                let setOk = false;
                for (const a of anims) {
                    try {
                        this.partnerSpine.setAnimation(0, a, true);
                        setOk = true;
                        break;
                    } catch {}
                }
                if (!setOk) {
                    this.partnerSpine.node.active = false;
                    this.partnerSpine.clearTracks();
                    tryLoad(index + 1);
                    return;
                }
                this.partnerSpine.node.setScale(0.88,0.88);
            });
        };
        tryLoad(0);
    }

    private updateOwnedCountLabel() {
        const total = 20;
        const owned = UserPartnerData.getInstance().getOwnedPartners().length;
        const text = `伙伴  ${owned}/${total}`;
        if (this.ownedCountLabel && this.ownedCountLabel.isValid) {
            this.ownedCountLabel.string = text;
            return;
        }
        const node = new Node('OwnedCountLabel');
        const label = node.addComponent(Label);
        label.fontSize = 36;
        label.lineHeight = 40;
        label.string = text;
        node.setPosition(0, 260);
        this.node.addChild(node);
        this.ownedCountLabel = label;
    }

    /**
     * 清空右侧的详细信息视图
     */
    private clearDetailView() {
        this.nameLabel.string = "未选择";
        this.levelLabel.string = "Lv.--";
        this.skillDescLabel.string = "";
        this.cooldownLabel.string = "";
        this.bonusLabel.string = "";
        this.levelProgressLabel.string = "--/200";
        this.starProgressLabel.string = "--/6";
        if(this.partnerSpine) this.partnerSpine.clearTracks();
    }

    /**
     * 处理升级按钮点击事件
     */
    private onUpgradePartner() {
        if (!this._currentSelectedPartnerId) {
            console.log("未选择任何伙伴，无法升级。");
            return;
        }
        const success = UserPartnerData.getInstance().upgradePartner(this._currentSelectedPartnerId);
        if (success) {
            console.log(`伙伴 ${this._currentSelectedPartnerId} 升级成功`);
            this.refreshAllViews(); // 升级成功后刷新视图
        } else {
            console.log(`伙伴 ${this._currentSelectedPartnerId} 升级失败(可能已达最高等级或缺少材料)`);
            // 此处可以添加用户提示，例如 "已达到最高等级"
        }
    }

    /**
     * 处理升星按钮点击事件
     */
    private onStarUpPartner() {
        if (!this._currentSelectedPartnerId) {
            console.log("未选择任何伙伴，无法升星。");
            return;
        }
        const success = UserPartnerData.getInstance().starUpPartner(this._currentSelectedPartnerId);
        if (success) {
            console.log(`伙伴 ${this._currentSelectedPartnerId} 升星成功`);
            this.refreshAllViews(); // 升星成功后刷新视图
        } else {
            console.log(`伙伴 ${this._currentSelectedPartnerId} 升星失败(可能已达最高星级或缺少材料)`);
            // 此处可以添加用户提示，例如 "已达到最高星级"
        }
    }

    /**
     * 显示上阵编辑面板
     */
    private onShowEditor() {
        if(this.partnerEditorNode){
            this.partnerEditorNode.active = true;
            // 可以选择性地调用编辑器的刷新方法
            if(this._partnerEditorComponent) {
                this._partnerEditorComponent.refresh();
            }
        }
    }

    /**
     * 显示伙伴召唤页面
     */
    private onShowSummon() {
        try {
            director.emit(game.gameEvent.GAME_PARTNER_SUMMON_PAGE_SHOW);
            this.hide();
        } catch {}
    }

    private onSummonSuccess(data: any) {
        const item = data && data.item;
        const id = item && (item.id as number);
        const name = item && (item.partnerName || `伙伴${item.partnerId}`) || '召唤成功';
        this.showSummonSuccessPopup(`召唤成功：${name}`);
        this.hideAllSummonMonsters();
        this.updateOwnedCountLabel();
        if (!id || !isFinite(id)) return;
        this.handleSummonPersist(id);
    }

    private async handleSummonPersist(id: number) {
        try {
            const client = HttpClient.getInstance();
            await client.post('/api/user/partner', { id });
        } catch {}
        // 统一走本面板的拉取刷新（带防抖）
        this.fetchAndPopulatePartners();
    }

    private showSummonSuccessPopup(text: string) {
        if (this._summonSuccessPopup && this._summonSuccessPopup.isValid) {
            this._summonSuccessPopup.destroy();
            this._summonSuccessPopup = null;
        }
        const node = new Node('SummonSuccessPopupMain');
        const label = node.addComponent(Label);
        label.fontSize = 42;
        label.lineHeight = 46;
        label.string = text;
        node.setPosition(0, 260);
        this.node.addChild(node);
        this._summonSuccessPopup = node;
        this.scheduleOnce(() => {
            if (this._summonSuccessPopup && this._summonSuccessPopup.isValid) {
                this._summonSuccessPopup.destroy();
                this._summonSuccessPopup = null;
            }
        }, 1.5);
    }

    private hideAllSummonMonsters() {
        let target: Node | null = null;
        if (this._summonNodeCache && this._summonNodeCache.isValid) {
            target = this._summonNodeCache;
        } else {
            const parent = this.node.parent || director.getScene();
            for (const child of parent.children) {
                if (child.getComponent(MonsterRefresh)) { target = child; break; }
            }
        }
        if (!target) return;
        const refresh = target.getComponent(MonsterRefresh);
        if (refresh) {
            refresh.hideAllMonsters();
        } else {
            for (let i = 0; i < 3; i++) {
                const m = target.getChildByName(`Monster_${i + 1}`);
                if (m) m.active = false;
            }
        }
    }

    /**
     * 显示主面板
     */
    public show() {
        this.node.active = true;
        this.init();
        // this.refreshAllViews();
    }

    /**
     * 隐藏主面板
     */
    public hide() {
        this.node.active = false;
    }
} 
