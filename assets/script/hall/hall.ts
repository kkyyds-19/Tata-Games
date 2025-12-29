import { UITransform, _decorator, Component, Node, ScrollView, Vec2, director,Prefab, resources, instantiate, SpriteAtlas, Canvas, Camera } from 'cc';
import { MapSelection } from './map_selection';
import { game } from 'cc';
import { AttackStat } from './attack_stat';
import { SkillTree } from './SkillTree';
import { ArmyPanel } from './army_panel/ArmyPanel';
import { HeroCardDetail } from './army_panel/HeroCardDetail';
import { MusicManager } from '../music/MusicManager';
import { MailMenus } from './mail/MailMenus';
import { First_topup } from './Big_event/First_topup';
import { SevendayCheckin } from './Big_event/SevendayCheckin';
import { MonthlyPass } from './Big_event/MonthlyPass';
import { WatchtowerUpgrade } from './watchtower/WatchtowerUpgrade';
import { WatchtowerUpgradeStar } from './watchtower/WatchtowerUpgradeStar';
import { Settings } from './settings/Settings';
import { FullScreenTupo } from './army_panel/FullScreenTupo';
import { EquipMainPanel } from './equip/EquipMainPanel';
import { RelicPanel } from './relic/RelicPanel';
import { RelicSummon } from './relic/RelicSummon';
import { PartnerMainPanel } from './partner/PartnerMainPanel';
import { SkinPreviewMain } from './skin_preview/SkinPreviewMain';
import { LegacyMain } from './legacy/LegacyMain';
import { WatchTowerMain } from './watchtower/WatchTowerMain';
import { watchtowerOption } from './watchtower/watchtowerOption';
import { ShopMain } from './shop/ShopMain';
import { MailMain } from './mail/MailMain';
import { GameBag } from './GameBag';
import { MonsterPreviewMain } from './monster_preview/MonsterPreviewMain';
import { IdleReward } from './IdleReward';
import { TransformationMain } from './transformation/TransformationMain';
import { BattleGate } from './BattleGate';
import { StageDownloader } from '../dialog/StageDownloader';
import { SmartLoginManager } from '../welcome/SmartLoginManager';
import { DailyTaskMain } from './daily_task/DailyTaskMain';
import { PlayerInfo } from './player_info/PlayerInfo';
import { PlayerAgreement } from './player_info/PlayerAgreement';
import { PlayerBindPhone } from './player_info/PlayerBindPhone';
import { PlayerGiftCode } from './player_info/PlayerGiftCode';
import { EnergyShop } from './shop/EnergyShop';
import { ApiTestMain } from '../dialog/ApiTestMain';
import { UserWatchtowerData } from '../user/UserWatchtowerData';
import { GameEntry } from '../global/Entry';
import { LeaderBoardMain } from './leader_board/LeaderBoardMain';
import { ClearRewardMain } from './clear_reward/ClearRewardMain';
import { UIWorldSelect } from './world_select/UIWorldSelect';
import { DnfMain } from './dnf/DnfMain';
import { PkMain } from './dnf/PkMain';
import { DurnMain } from './dnf/DurnMain';
import { GuideMain } from './guide/GuideMain';
import { FriendMain } from './Big_event/FriendMain';
import { chat } from './Big_event/chat';
import { TeamUp } from './army_panel/TeamUp';
import { BlockInputEvents } from 'cc';
import ToastManager from '../dialog/ToastManager';
import { SoulBeast_main } from '../SoulBeast/SoulMain';
import { Guildapplication } from '../Guild/Guildapplication';

const { ccclass, property } = _decorator;

GameEntry.entryGame()

@ccclass('Hall')
export class Hall extends Component {
    @property(ScrollView)
    public scrollView: ScrollView | null = null;

    @property(MapSelection)
    public mapSelection: MapSelection | null = null;

    @property(Node)
    public army: Node | null = null;

    @property(SkillTree)
    public skillTree: SkillTree | null = null;

    @property(ArmyPanel)
    public armyPanel: ArmyPanel | null = null;

    @property(ShopMain)
    public shopMain: ShopMain | null = null;

    @property(HeroCardDetail)
    public heroCardDetail: HeroCardDetail | null = null;


    @property(MailMenus)
    public mailMenus: MailMenus | null = null;

    @property(Settings)
    public mySettings: Settings | null = null;


    @property(FullScreenTupo)
    public fullScreenTupo: FullScreenTupo | null = null;


    @property(EquipMainPanel)
    public equipMainPanel: EquipMainPanel | null = null;


    @property(RelicPanel)
    public relicPanel: RelicPanel | null = null;

    @property(RelicSummon)
    public relicSummon: RelicSummon | null = null;

    @property(PartnerMainPanel)
    public partnerMainPanel: PartnerMainPanel | null = null;

    @property(SkinPreviewMain)
    public skinPreviewMain: SkinPreviewMain | null = null;

    @property(LegacyMain)
    public legacyMainPanel: LegacyMain | null = null;

    @property(MailMain)
    public mailMain: MailMain | null = null;

    @property(GameBag)
    public gameBag: GameBag | null = null;

    @property(MonsterPreviewMain)
    public monsterPreviewMain: MonsterPreviewMain | null = null;

    @property(IdleReward)
    public idleReward: IdleReward | null = null;

    @property(BattleGate)
    public battleGate: BattleGate | null = null;

    @property(TransformationMain)
    public transformationMain: TransformationMain | null = null;

    @property(WatchTowerMain)
    public watchTowerMain: WatchTowerMain | null = null;

    @property(DailyTaskMain)
    public dailyTaskMain: DailyTaskMain | null = null;

    @property(SoulBeast_main)
    public soulBeastMain: SoulBeast_main | null = null;

    @property(PlayerInfo)
    public playerInfo: PlayerInfo | null = null;

    @property(PlayerAgreement)
    public playerAgreement: PlayerAgreement | null = null;

    @property(PlayerBindPhone)
    public playerBindPhone: PlayerBindPhone | null = null;


    @property(PlayerGiftCode)
    public playerGiftCode: PlayerGiftCode | null = null;



    @property(StageDownloader)
    public stageDownloader: StageDownloader | null = null;


    @property(EnergyShop)
    public energyShop: EnergyShop | null = null;


    //排行榜
    @property(LeaderBoardMain)
    public leaderBoardMain: LeaderBoardMain | null = null;
    /** 首充页面组件（由 Hall 统一管理显示/隐藏） */
    @property(First_topup)
    public firstTopup: First_topup | null = null;
    /** 七日签到页面组件（由 Hall 统一管理显示/隐藏） */
    @property(SevendayCheckin)
    public sevendayCheckin: SevendayCheckin | null = null;
    /** 月卡页面组件（由 Hall 统一管理显示/隐藏） */
    @property(MonthlyPass)
    public monthlyPass: MonthlyPass | null = null;
    /** 哨塔升级页面组件（由 Hall 统一管理显示/隐藏） */
    @property(WatchtowerUpgrade)
    public watchtowerUpgrade: WatchtowerUpgrade | null = null;
    /** 哨塔升星页面组件（由 Hall 统一管理显示/隐藏） */
    @property(WatchtowerUpgradeStar)
    public watchtowerUpgradeStar: WatchtowerUpgradeStar | null = null;


    //通关奖励
    @property(ClearRewardMain)
    public clearRewardMain: ClearRewardMain | null = null;



    @property(ApiTestMain)
    public apiTestMain: ApiTestMain | null = null;

    //地下城UI
    @property(DnfMain)
    public dnfMain: DnfMain | null = null;

    //PK竞技场UI
    @property(PkMain)
    public pkMain: PkMain | null = null;

    //燃烧模式UI
    @property(DurnMain)
    public durnMain: DurnMain | null = null;

    @property(GuideMain)
    public guideMain:GuideMain | null = null;

    // 好友页面
    @property(FriendMain)
    public friendMain: FriendMain | null = null;

    @property(chat)
    public chatMain: chat | null = null;

    @property(Guildapplication)
    public guildApplication: Guildapplication | null = null;

    @property(Node)
    public chatButton: Node | null = null;

    @property({type: Prefab})
    public canyonMainPrefab: Prefab | null = null;
    private canyonMainNode: Node | null = null;

    private uiWorldSelect: UIWorldSelect;
    private teamUpPanel: TeamUp | null = null;

    // 防重复调用机制
    private _lastShowDetailCardId: string = null;
    private _lastShowDetailTime: number = 0;

    onLoad() {
        // 检查是否已经登录，避免重复调用登录流程
        // this.checkLoginStatus();
    
        if(localStorage.getItem("showGuide")== "1"){
           this.guideMain.show();
        }
        
    }

    /**
     * 检查登录状态，只在必要时调用登录流程
     */
    // private checkLoginStatus() {
    //     const smartLoginManager = SmartLoginManager.getInstance();

    //     // 如果已经登录成功，不需要再次调用登录流程
    //     if (smartLoginManager.isLoggedIn() && smartLoginManager.getCurrentStatus() === 'success') {
    //         console.log('[Hall] 已登录状态，跳过登录流程');
    //         return;
    //     }

    //     // 只有在未登录或登录失败时才调用登录流程
    //     console.log('[Hall] 检查登录状态，必要时启动登录流程');
    //     smartLoginManager.startSmartLogin();
    // }

    private ensureMainCanvasCamera(): void {
        try {
            const scene = director.getScene();
            if (!scene) return;
            const canvasNode = scene.getChildByName('Canvas');
            if (!canvasNode || !canvasNode.isValid) return;
            const canvas = canvasNode.getComponent(Canvas);
            if (!canvas) return;
            const currentCamera = (canvas as any)._cameraComponent as Camera | null;
            if (currentCamera && currentCamera.node && currentCamera.node.isValid && currentCamera.enabled) {
                return;
            }
            let cameraNode = scene.getChildByName('Camera');
            let camera: Camera | null = null;
            if (cameraNode && cameraNode.isValid) {
                camera = cameraNode.getComponent(Camera);
            }
            if (!camera) {
                cameraNode = new Node('Camera');
                scene.addChild(cameraNode);
                camera = cameraNode.addComponent(Camera);
            }
            if (!camera) return;
            try {
                const uiLayer = 1 << 30;
                camera.visibility |= uiLayer;
            } catch {}
            (canvas as any)._cameraComponent = camera;
        } catch {}
    }

    start() {
        this.ensureMainCanvasCamera();
        this.uiWorldSelect = this.node.getChildByPath("ui_popup_dialog/world_select_main")?.getComponent(UIWorldSelect);
        // console.log(`world_select_main ${this.node.name}>>>>>>>>>>>>>>${this.uiWorldSelect != null}`)
        this.skillTree.hide();

        const currentStage = game.myGlobal.currentStage;
        console.log(`[Hall] start() called with currentStage=${currentStage}, maxStage=${game.myGlobal.maxStage}`);

        // 边界检查：确保currentStage在有效范围内
        if (currentStage < 1 || currentStage > 30 || currentStage > game.myGlobal.maxStage + 2) {
            console.log(`[Hall] Invalid currentStage: ${currentStage}, resetting to 1`);
            game.myGlobal.currentStage = 1;
            this.scrollToStageNode(0, 1);
        } else {
            this.scrollToStageNode(currentStage - 1, currentStage);
        }


        if (MusicManager.getInstance()) {
            MusicManager.getInstance().playBgmHall();
        }

        director.on(game.gameEvent.HALL_STAGE_SELECTED, this.scrollToStageNode, this);
        director.on(game.gameEvent.HALL_NAV_BUTTON_CLICK, this.onNavButtonClick, this);
        director.on(game.gameEvent.HALL_HERO_CARD_DETAIL_SHOW, this.showDetail, this);
        director.on(game.gameEvent.HALL_HERO_CARD_DETAIL_HIDE, this.hideDetail, this);
        director.on(game.gameEvent.GAME_ACTIVITY_MENU_CLICK, this.onActivityMenuClick, this);
        director.on(game.gameEvent.HALL_HERO_CARD_BREAKTHROUGH_CLICK, this.onHeroCardBreakthroughClick, this);
        director.on(game.gameEvent.GAME_EQUIP_PAGE_SHOW, this.onEquipPageShow, this);
        director.on(game.gameEvent.GAME_RELIC_PAGE_SHOW, this.onRelicPageShow, this);
        director.on(game.gameEvent.GAME_RELIC_SUMMON_PAGE_SHOW, this.onRelicSummonPageShow, this);
        director.on(game.gameEvent.GAME_PARTNER_MAIN_PAGE_SHOW, this.onPartnerMainPageShow, this);
        director.on(game.gameEvent.GAME_SKIN_PREVIEW_PAGE_SHOW, this.onSkinPreviewPageShow, this);
        director.on(game.gameEvent.GAME_LEGACY_MAIN_PAGE_SHOW, this.onLegacyMainPageShow, this);
        director.on(game.gameEvent.GAME_SOULBEAST_MAIN_PAGE_SHOW, this.onSoulBeastMainPageShow, this);
        director.on(game.gameEvent.GAME_WATCHTOWER_MAIN_PAGE_SHOW, this.onWatchTowerMainPageShow, this);
        director.on(game.gameEvent.GAME_WATCHTOWER_OPTION_PAGE_SHOW, this.onWatchTowerOptionPageShow, this);
        director.on(game.gameEvent.GAME_WATCHTOWER_TAKE_PAGE_SHOW, this.onWatchTowerTakePageShow, this);
        director.on(game.gameEvent.GAME_WATCHTOWER_RECEIVE_PAGE_SHOW, this.onWatchTowerReceivePageShow, this);
        director.on(game.gameEvent.GAME_WATCHTOWER_UPGRADE_PAGE_SHOW, this.onWatchtowerUpgradePageShow, this);
        director.on(game.gameEvent.GAME_WATCHTOWER_UPGRADE_STAR_PAGE_SHOW, this.onWatchtowerUpgradeStarPageShow, this);
        try { resources.preload('prefab/hall/watchtower/watchtower_Option', Prefab, () => {}); } catch {}
        try { resources.preload('prefab/hall/watchtower/watchtower_Take', Prefab, () => {}); } catch {}
        try { resources.preload('prefab/hall/watchtower/Receive', Prefab, () => {}); } catch {}
        try { resources.preload('prefab/hall/watchtower/watchtower_Upgrade', Prefab, () => {}); } catch {}
        try { resources.preload('prefab/hall/watchtower/watchtower_UpgradeStar', Prefab, () => {}); } catch {}
        try { resources.preload('prefab/hall/watchtower/watchtower_small_icon', Prefab, () => {}); } catch {}
        try { resources.preload('img/hall/watchtower', SpriteAtlas, () => {}); } catch {}
        try { resources.preload('img/icons/class_icons', SpriteAtlas, () => {}); } catch {}
        try { UserWatchtowerData.getInstance().loadFromServer().catch(()=>{}); } catch {}
        director.on(game.gameEvent.GAME_PARTNER_SUMMON_PAGE_SHOW, this.onPartnerSummonPageShow, this);
        try { resources.preload('prefab/hall/partner/partner_Summon', Prefab, () => {}); } catch {}
        try { resources.preload('prefab/dialog/toast_manager', Prefab, () => {}); } catch {}
        try { resources.preload('prefab/dialog/toast', Prefab, () => {}); } catch {}
        director.on(game.gameEvent.GAME_HALL_UI_SHOW, this.onGameHallUIShow, this);
        director.on((game as any).gameEvent.HALL_OPEN_TEAM_UP, this.onOpenTeamUp, this);

        this.ensureToastManager();
    }

    onDestroy() {
        director.off(game.gameEvent.HALL_STAGE_SELECTED, this.scrollToStageNode, this);
        director.off(game.gameEvent.HALL_NAV_BUTTON_CLICK, this.onNavButtonClick, this);
        director.off(game.gameEvent.HALL_HERO_CARD_DETAIL_SHOW, this.showDetail, this);
        director.off(game.gameEvent.HALL_HERO_CARD_DETAIL_HIDE, this.hideDetail, this);
        director.off(game.gameEvent.GAME_ACTIVITY_MENU_CLICK, this.onActivityMenuClick, this);
        director.off(game.gameEvent.HALL_HERO_CARD_BREAKTHROUGH_CLICK, this.onHeroCardBreakthroughClick, this);
        director.off(game.gameEvent.GAME_EQUIP_PAGE_SHOW, this.onEquipPageShow, this);
        director.off(game.gameEvent.GAME_RELIC_PAGE_SHOW, this.onRelicPageShow, this);
        director.off(game.gameEvent.GAME_RELIC_SUMMON_PAGE_SHOW, this.onRelicSummonPageShow, this);
        director.off(game.gameEvent.GAME_PARTNER_MAIN_PAGE_SHOW, this.onPartnerMainPageShow, this);
        director.off(game.gameEvent.GAME_SKIN_PREVIEW_PAGE_SHOW, this.onSkinPreviewPageShow, this);
        director.off(game.gameEvent.GAME_LEGACY_MAIN_PAGE_SHOW, this.onLegacyMainPageShow, this);
        director.off(game.gameEvent.GAME_SOULBEAST_MAIN_PAGE_SHOW, this.onSoulBeastMainPageShow, this);
        director.off(game.gameEvent.GAME_WATCHTOWER_MAIN_PAGE_SHOW, this.onWatchTowerMainPageShow, this);
        director.off(game.gameEvent.GAME_WATCHTOWER_OPTION_PAGE_SHOW, this.onWatchTowerOptionPageShow, this);
        director.off(game.gameEvent.GAME_WATCHTOWER_TAKE_PAGE_SHOW, this.onWatchTowerTakePageShow, this);
        director.off(game.gameEvent.GAME_WATCHTOWER_UPGRADE_PAGE_SHOW, this.onWatchtowerUpgradePageShow, this);
        director.off(game.gameEvent.GAME_WATCHTOWER_UPGRADE_STAR_PAGE_SHOW, this.onWatchtowerUpgradeStarPageShow, this);
        director.off(game.gameEvent.GAME_PARTNER_SUMMON_PAGE_SHOW, this.onPartnerSummonPageShow, this);
        director.off(game.gameEvent.GAME_HALL_UI_SHOW, this.onGameHallUIShow, this);
        director.off((game as any).gameEvent.HALL_OPEN_TEAM_UP, this.onOpenTeamUp, this);
    }

    async onWatchtowerUpgradePageShow(id?: number): Promise<void> {
        try {
            if (this.watchtowerUpgrade && this.watchtowerUpgrade.node && this.watchtowerUpgrade.node.isValid) {
                this.watchtowerUpgrade.setTowerId?.(id);
                this.watchtowerUpgrade.show?.();
                this.ensureConsumesInput(this.watchtowerUpgrade.node);
                try { const p = this.watchtowerUpgrade.node.parent; if (p) this.watchtowerUpgrade.node.setSiblingIndex(p.children.length - 1); } catch {}
                if (this.watchtowerUpgradeStar && this.watchtowerUpgradeStar.node) this.watchtowerUpgradeStar.hide?.();
                this.hideAllUpgradeStarInstances();
                return;
            }
            const scene = director.getScene();
            if (scene) {
                const list = scene.getComponentsInChildren(WatchtowerUpgrade);
                if (list && list.length > 0) {
                    this.watchtowerUpgrade = list[0];
                    this.watchtowerUpgrade.setTowerId?.(id);
                    this.watchtowerUpgrade.show?.();
                    this.ensureConsumesInput(this.watchtowerUpgrade.node);
                    try { const p = this.watchtowerUpgrade.node.parent; if (p) this.watchtowerUpgrade.node.setSiblingIndex(p.children.length - 1); } catch {}
                    if (this.watchtowerUpgradeStar && this.watchtowerUpgradeStar.node) this.watchtowerUpgradeStar.hide?.();
                    return;
                }
            }
            await new Promise<void>((resolve, reject) => {
                resources.load('prefab/hall/watchtower/watchtower_Upgrade', Prefab, (err, prefab) => {
                    if (err || !prefab) { reject(err); return; }
                    const node = instantiate(prefab);
                    const canvas = director.getScene()?.getChildByName('Canvas');
                    const parent = canvas || this.node.parent || this.node;
                    parent.addChild(node);
                    this.watchtowerUpgrade = node.getComponent(WatchtowerUpgrade);
                    if (!this.watchtowerUpgrade) {
                        this.watchtowerUpgrade = node.addComponent(WatchtowerUpgrade);
                    }
                    this.watchtowerUpgrade.setTowerId?.(id);
                    this.watchtowerUpgrade.show?.();
                    this.ensureConsumesInput(this.watchtowerUpgrade.node);
                    try { const p = this.watchtowerUpgrade.node.parent; if (p) this.watchtowerUpgrade.node.setSiblingIndex(p.children.length - 1); } catch {}
                    if (this.watchtowerUpgradeStar && this.watchtowerUpgradeStar.node) this.watchtowerUpgradeStar.hide?.();
                    this.hideAllUpgradeStarInstances();
                    resolve();
                });
            });
        } catch (e) {
            console.error('[Hall] 打开哨塔升级页面失败', e);
        }
    }

    async onWatchtowerUpgradeStarPageShow(id?: number): Promise<void> {
        try {
            if (this.watchtowerUpgradeStar && this.watchtowerUpgradeStar.node && this.watchtowerUpgradeStar.node.isValid) {
                this.watchtowerUpgradeStar.setTowerId?.(id);
                this.watchtowerUpgradeStar.show?.();
                this.ensureConsumesInput(this.watchtowerUpgradeStar.node);
                try { const p = this.watchtowerUpgradeStar.node.parent; if (p) this.watchtowerUpgradeStar.node.setSiblingIndex(p.children.length - 1); } catch {}
                if (this.watchtowerUpgrade && this.watchtowerUpgrade.node) this.watchtowerUpgrade.hide?.();
                this.hideAllUpgradeInstances();
                return;
            }
            const scene = director.getScene();
            if (scene) {
                const list = scene.getComponentsInChildren(WatchtowerUpgradeStar);
                if (list && list.length > 0) {
                    this.watchtowerUpgradeStar = list[0];
                    this.watchtowerUpgradeStar.setTowerId?.(id);
                    this.watchtowerUpgradeStar.show?.();
                    this.ensureConsumesInput(this.watchtowerUpgradeStar.node);
                    try { const p = this.watchtowerUpgradeStar.node.parent; if (p) this.watchtowerUpgradeStar.node.setSiblingIndex(p.children.length - 1); } catch {}
                    if (this.watchtowerUpgrade && this.watchtowerUpgrade.node) this.watchtowerUpgrade.hide?.();
                    return;
                }
            }
            await new Promise<void>((resolve, reject) => {
                resources.load('prefab/hall/watchtower/watchtower_UpgradeStar', Prefab, (err, prefab) => {
                    if (err || !prefab) { reject(err); return; }
                    const node = instantiate(prefab);
                    const canvas = director.getScene()?.getChildByName('Canvas');
                    const parent = canvas || this.node.parent || this.node;
                    parent.addChild(node);
                    this.watchtowerUpgradeStar = node.getComponent(WatchtowerUpgradeStar);
                    if (!this.watchtowerUpgradeStar) {
                        this.watchtowerUpgradeStar = node.addComponent(WatchtowerUpgradeStar);
                    }
                    this.watchtowerUpgradeStar.setTowerId?.(id);
                    this.watchtowerUpgradeStar.show?.();
                    this.ensureConsumesInput(this.watchtowerUpgradeStar.node);
                    try { const p = this.watchtowerUpgradeStar.node.parent; if (p) this.watchtowerUpgradeStar.node.setSiblingIndex(p.children.length - 1); } catch {}
                    if (this.watchtowerUpgrade && this.watchtowerUpgrade.node) this.watchtowerUpgrade.hide?.();
                    this.hideAllUpgradeInstances();
                    resolve();
                });
            });
        } catch (e) {
            console.error('[Hall] 打开哨塔升星页面失败', e);
        }
    }

    private hideAllUpgradeStarInstances(): void {
        try {
            const scene = director.getScene();
            if (!scene) return;
            const list = scene.getComponentsInChildren(WatchtowerUpgradeStar) || [];
            list.forEach(c => { try { c.hide?.(); } catch {} });
        } catch {}
    }

    private hideAllUpgradeInstances(): void {
        try {
            const scene = director.getScene();
            if (!scene) return;
            const list = scene.getComponentsInChildren(WatchtowerUpgrade) || [];
            list.forEach(c => { try { c.hide?.(); } catch {} });
        } catch {}
    }

    private async onOpenTeamUp(stageId: number) {
        try {
            const container = this.node.getChildByPath('ui_popup_dialog') || this.node;
            if (!this.teamUpPanel) {
                await new Promise<void>((resolve, reject) => {
                    resources.load('prefab/hall/army_panel/Team_up', Prefab, (err, prefab) => {
                        if (err) { reject(err); return; }
                        const node = instantiate(prefab);
                        container.addChild(node);
                        this.teamUpPanel = node.getComponent(TeamUp);
                        resolve();
                    });
                });
            }
            this.teamUpPanel?.show(stageId);
        } catch (e) {
            console.error('[Hall] 打开组队面板失败', e);
        }
    }

    //神器按钮点击
    public onGoddessButtonTapped() {

        // storeAPI.getStaminaPurchaseInfo().then((res:any)=>{
        //     console.log('体力购买信息',JSON.stringify(res));
        // });
        if (this.apiTestMain) {
            this.apiTestMain.show();
        }

    }

    //地下城
    public onDungeonButtonTapped() {
        console.log('地下城按钮点击');
        SmartLoginManager.getInstance().getUserInfo()
        if (this.dnfMain) {
            this.dnfMain.setHallInstance(this);
            this.dnfMain.show();
        }
    }

    //荣誉竞技场
    public onPkButtonTapped() {
        console.log('荣誉竞技场按钮点击');
        SmartLoginManager.getInstance().getUserInfo()
        // 运行时兜底：若未在 Inspector 绑定，尝试在场景中查找并绑定
        if (!this.pkMain) {
            console.log('pkMain未绑定，尝试在场景中查找');
            // 先在本节点层级中查找
            const list = this.node.getComponentsInChildren(PkMain);
            if (list && list.length > 0) {
                this.pkMain = list[0];
            }
            // 若仍未找到，递归遍历整个场景
            if (!this.pkMain) {
                const scene = director.getScene();
                if (scene) {
                    let found: PkMain = null;
                    const stack: Node[] = [scene];
                    while (stack.length > 0 && !found) {
                        const n = stack.pop();
                        const comp = n.getComponent(PkMain);
                        if (comp) {
                            found = comp;
                            break;
                        }
                        const children = n.children;
                        if (children && children.length) {
                            for (let i = 0; i < children.length; i++) {
                                stack.push(children[i]);
                            }
                        }
                    }
                    this.pkMain = found;
                }
            }
            console.log('查找结果 pkMain:', this.pkMain);
        }

        if (this.pkMain) {
            console.log('设置Hall实例并显示PkMain');
            this.pkMain.setHallInstance(this);
            this.pkMain.show();
            console.log('PkMain显示完成');
        } else {
            console.error('pkMain实例为null，无法显示');
        }
    }

    //燃烧模式
    public onDurnButtonTapped() {
        console.log('燃烧模式按钮点击');
        SmartLoginManager.getInstance().getUserInfo()
        // 运行时兜底：若未在 Inspector 绑定，尝试在场景中查找并绑定
        if (!this.durnMain) {
            console.log('durnMain未绑定，尝试在场景中查找');
            // 先在本节点层级中查找
            const list = this.node.getComponentsInChildren(DurnMain);
            if (list && list.length > 0) {
                this.durnMain = list[0];
            }
            // 若仍未找到，递归遍历整个场景
            if (!this.durnMain) {
                const scene = director.getScene();
                if (scene) {
                    let found: DurnMain = null;
                    const stack: Node[] = [scene];
                    while (stack.length > 0 && !found) {
                        const n = stack.pop();
                        const comp = n.getComponent(DurnMain);
                        if (comp) {
                            found = comp;
                            break;
                        }
                        const children = n.children;
                        if (children && children.length) {
                            for (let i = 0; i < children.length; i++) {
                                stack.push(children[i]);
                            }
                        }
                    }
                    this.durnMain = found;
                }
            }
            console.log('查找结果 durnMain:', this.durnMain);
        }
        
        if (this.durnMain) {
            console.log('设置Hall实例并显示DurnMain');
            this.durnMain.setHallInstance(this);
            this.durnMain.show();
            console.log('DurnMain显示完成');
        } else {
            console.error('durnMain实例为null，无法显示');
        }
    }

    // 好友
    public onFriendButtonTapped() {
        // 统一由Hall管理打开好友页面
        // 运行时兜底：若未在 Inspector 绑定，尝试在场景中查找
        if (!this.friendMain) {
            try {
                const list = this.node.getComponentsInChildren(FriendMain);
                if (list && list.length > 0) {
                    this.friendMain = list[0];
                }
                if (!this.friendMain) {
                    const scene = director.getScene();
                    if (scene) {
                        let found: FriendMain = null;
                        const stack: Node[] = [scene];
                        while (stack.length > 0 && !found) {
                            const n = stack.pop()!;
                            const comp = n.getComponent(FriendMain);
                            if (comp) { found = comp; break; }
                            const children = n.children;
                            if (children && children.length) {
                                for (let i = 0; i < children.length; i++) stack.push(children[i]);
                            }
                        }
                        this.friendMain = found;
                    }
                }
            } catch {}
        }

        if (this.friendMain) {
            this.hideAllMainPanels();
            this.friendMain.show();
        } else {
            console.warn('friendMain实例未找到，无法显示好友页面');
        }
    }

    public onLiaotianButtonTapped() {
        if (!this.chatMain) {
            try {
                const list = this.node.getComponentsInChildren(chat);
                if (list && list.length > 0) {
                    this.chatMain = list[0];
                }
                if (!this.chatMain) {
                    const scene = director.getScene();
                    if (scene) {
                        let found: chat | null = null;
                        const stack: Node[] = [scene];
                        while (stack.length > 0 && !found) {
                            const n = stack.pop()!;
                            const comp = n.getComponent(chat);
                            if (comp) {
                                found = comp;
                                break;
                            }
                            const children = n.children;
                            if (children && children.length) {
                                for (let i = 0; i < children.length; i++) {
                                    stack.push(children[i]);
                                }
                            }
                        }
                        this.chatMain = found;
                    }
                }
            } catch {}
        }

        if (this.chatMain) {
            this.hideAllMainPanels();
            this.chatMain.show();
        } else {
            console.warn('chatMain实例未找到，无法显示聊天页面');
        }
    }

    public onCanyonButtonTapped() {
        console.log('战歌（峡谷）按钮点击');
        SmartLoginManager.getInstance().getUserInfo();

        if (this.canyonMainNode && this.canyonMainNode.isValid) {
            this.canyonMainNode.active = true;
            this.canyonMainNode.setSiblingIndex(9999);
            return;
        }

        if (this.canyonMainPrefab) {
            const n = instantiate(this.canyonMainPrefab);
            n.name = 'Canyon_main_Instance';
            n.setPosition(0, 0, 0);
            n.setSiblingIndex(9999);
            this.node.addChild(n);
            this.canyonMainNode = n;
            return;
        }

        resources.load('prefab/hall/dnf/Canyon_main', Prefab, (err, prefab) => {
            if (err) {
                console.error('加载 Canyon_main 预制体失败', err);
                return;
            }
            if (prefab) {
                const n = instantiate(prefab);
                n.name = 'Canyon_main_Instance';
                n.setPosition(0, 0, 0);
                n.setSiblingIndex(9999);
                this.node.addChild(n);
                this.canyonMainNode = n;
            }
        });
    }

    public onClearRewardButtonTapped() {
        this.clearRewardMain.show();
    }

    public onStageDownloaderButtonTapped() {
        this.stageDownloader.show();
    }
    //幻化
    public onTransformationButtonTapped() {
        console.log('幻化按钮点击');
        this.transformationMain.show();
    }

    onEnergyShopPageShow(): void {
        this.energyShop.show();
    }

    onPlayerGiftCodePageShow(): void {
        this.playerGiftCode.show();
    }
    onPlayerAgreementPageShow(sender: Node, event: Event): void {
        this.playerAgreement.show(event);
    }

    onPlayerBindPhonePageShow(): void {
        this.playerBindPhone.show();
    }
    onPlayerInfoPageShow(): void {
        this.playerInfo.show();
    }

    onIdleRewardPageShow(): void {
        this.idleReward.show();
    }

    onLegacyMainPageShow(): void {
        this.legacyMainPanel.show();
    }

    async onSoulBeastMainPageShow(): Promise<void> {
        try {
            this.ensureMainCanvasCamera();

            if (this.soulBeastMain && this.soulBeastMain.node && this.soulBeastMain.node.isValid) {
                this.soulBeastMain.show?.();
                this.ensureConsumesInput(this.soulBeastMain.node);
                try {
                    const p = this.soulBeastMain.node.parent;
                    if (p) this.soulBeastMain.node.setSiblingIndex(p.children.length - 1);
                } catch {}
                return;
            }

            this.soulBeastMain = null;

            const existing = director.getScene()?.getComponentsInChildren(SoulBeast_main) || [];
            if (existing && existing.length > 0) {
                this.soulBeastMain = existing[0];
                this.soulBeastMain.show?.();
                this.ensureConsumesInput(this.soulBeastMain.node);
                try {
                    const p = this.soulBeastMain.node.parent;
                    if (p) this.soulBeastMain.node.setSiblingIndex(p.children.length - 1);
                } catch {}
                return;
            }

            await new Promise<void>((resolve, reject) => {
                resources.load('prefab/hall/Soul_Beast/SoulBeast_main', Prefab, (err, prefab) => {
                    if (err || !prefab) { reject(err); return; }
                    const node = instantiate(prefab);
                    const canvas = director.getScene()?.getChildByName('Canvas');
                    const parent = canvas || this.node.parent || this.node;
                    parent.addChild(node);
                    this.soulBeastMain = node.getComponent(SoulBeast_main);
                    if (!this.soulBeastMain) {
                        this.soulBeastMain = node.addComponent(SoulBeast_main);
                    }
                    this.soulBeastMain.show?.();
                    this.ensureConsumesInput(node);
                    try { node.setSiblingIndex(parent.children.length - 1); } catch {}
                    resolve();
                });
            });
        } catch (e) {
            console.error('[Hall] 打开灵魂兽页面失败', e);
        }
    }

    onSkinPreviewPageShow(): void {
        this.skinPreviewMain.show();
    }

    async onWatchTowerMainPageShow(): Promise<void> {
        if (this.watchTowerMain && this.watchTowerMain.node && this.watchTowerMain.node.isValid) {
            this.watchTowerMain.node.active = true;
            try { const p = this.watchTowerMain.node.parent; if (p) this.watchTowerMain.node.setSiblingIndex(p.children.length - 1); } catch {}
            try { this.ensureConsumesInput(this.watchTowerMain.node); } catch {}
            try { if (this.watchtowerOptionNode && this.watchtowerOptionNode.isValid) this.watchtowerOptionNode.active = false; } catch {}
            return;
        }
        const existing = director.getScene()?.getComponentsInChildren(WatchTowerMain) || [];
        if (existing && existing.length > 0) {
            this.watchTowerMain = existing[0];
            this.watchTowerMain.node.active = true;
            try { const p = this.watchTowerMain.node.parent; if (p) this.watchTowerMain.node.setSiblingIndex(p.children.length - 1); } catch {}
            try { this.ensureConsumesInput(this.watchTowerMain.node); } catch {}
            try { if (this.watchtowerOptionNode && this.watchtowerOptionNode.isValid) this.watchtowerOptionNode.active = false; } catch {}
            return;
        }
        await new Promise<void>((resolve, reject) => {
            resources.load('prefab/hall/watchtower/watchtower_main', Prefab, (err, prefab) => {
                if (err || !prefab) { reject(err); return; }
                const node = instantiate(prefab);
                const parent = this.node.parent || this.node;
                parent.addChild(node);
                this.watchTowerMain = node.getComponent(WatchTowerMain);
                try { node.setSiblingIndex(parent.children.length - 1); } catch {}
                try { this.ensureConsumesInput(node); } catch {}
                try { if (this.watchtowerOptionNode && this.watchtowerOptionNode.isValid) this.watchtowerOptionNode.active = false; } catch {}
                resolve();
            });
        });
    }

    private watchtowerOptionNode: Node | null = null;
    private watchtowerTakeNode: Node | null = null;
    private watchtowerReceiveNode: Node | null = null;
    private partnerSummonNode: Node | null = null;
    async onWatchTowerOptionPageShow(): Promise<void> {
        try {
            // 若已存在实例，直接显示并置顶
            if (this.watchtowerOptionNode && this.watchtowerOptionNode.isValid) {
                this.watchtowerOptionNode.active = true;
                try {
                    const p = this.watchtowerOptionNode.parent;
                    if (p) this.watchtowerOptionNode.setSiblingIndex(p.children.length - 1);
                } catch {}
                // 统一设置页面防穿透
                this.ensureConsumesInput(this.watchtowerOptionNode);
                if (this.watchTowerMain && this.watchTowerMain.node) this.watchTowerMain.node.active = false;
                return;
            }
            // 查找场景中是否已有 watchtowerOption 组件实例
            const comps = director.getScene()?.getComponentsInChildren(watchtowerOption) || [];
            if (comps.length > 0) {
                const comp = comps[0];
                this.watchtowerOptionNode = comp.node;
                this.watchtowerOptionNode.active = true;
                // 统一设置页面防穿透
                this.ensureConsumesInput(this.watchtowerOptionNode);
                if (this.watchTowerMain && this.watchTowerMain.node) this.watchTowerMain.node.active = false;
                return;
            }
            // 加载并实例化选项页面预制体
            await new Promise<void>((resolve, reject) => {
                resources.load('prefab/hall/watchtower/watchtower_Option', Prefab, (err, prefab) => {
                    if (err || !prefab) { reject(err); return; }
                    const node = instantiate(prefab);
                    const canvas = director.getScene()?.getChildByName('Canvas');
                    const parent = canvas || this.node.parent || this.node;
                    parent.addChild(node);
                    this.watchtowerOptionNode = node;
                    // 统一设置页面防穿透
                    this.ensureConsumesInput(this.watchtowerOptionNode);
                    resolve();
                });
            });
            if (this.watchTowerMain && this.watchTowerMain.node) this.watchTowerMain.node.active = false;
        } catch (e) {
            console.error('[Hall] 打开哨塔选项页面失败', e);
        }
    }

    async onWatchTowerReceivePageShow(data?: any): Promise<void> {
        try {
            if (this.watchtowerReceiveNode && this.watchtowerReceiveNode.isValid) {
                this.watchtowerReceiveNode.active = true;
                try { const p = this.watchtowerReceiveNode.parent; if (p) this.watchtowerReceiveNode.setSiblingIndex(p.children.length - 1); } catch {}
                this.ensureConsumesInput(this.watchtowerReceiveNode);
                try { const comp = this.watchtowerReceiveNode.getComponent('Receive') as any; comp?.setData?.(data); } catch {}
                return;
            }
            const existing = director.getScene()?.getChildByName('Canvas')?.getComponentsInChildren('Receive' as any) || [];
            if (existing.length > 0) {
                const node = (existing[0] as any).node as Node;
                this.watchtowerReceiveNode = node;
                this.watchtowerReceiveNode.active = true;
                try { const p = this.watchtowerReceiveNode.parent; if (p) this.watchtowerReceiveNode.setSiblingIndex(p.children.length - 1); } catch {}
                this.ensureConsumesInput(this.watchtowerReceiveNode);
                try { const comp = this.watchtowerReceiveNode.getComponent('Receive' as any) as any; comp?.setData?.(data); } catch {}
                return;
            }
            await new Promise<void>((resolve, reject) => {
                resources.load('prefab/hall/watchtower/Receive', Prefab, (err, prefab) => {
                    if (err || !prefab) { reject(err); return; }
                    const node = instantiate(prefab);
                    const canvas = director.getScene()?.getChildByName('Canvas');
                    const parent = canvas || this.node.parent || this.node;
                    parent.addChild(node);
                    this.watchtowerReceiveNode = node;
                    this.ensureConsumesInput(this.watchtowerReceiveNode);
                    try { const comp = node.getComponent('Receive') as any; comp?.setData?.(data); } catch {}
                    resolve();
                });
            });
        } catch (e) {
            console.error('[Hall] 打开哨塔奖励页面失败', e);
        }
    }

    async onWatchTowerTakePageShow(): Promise<void> {
        try {
            if (this.watchtowerTakeNode && this.watchtowerTakeNode.isValid) {
                this.watchtowerTakeNode.active = true;
                try {
                    const p = this.watchtowerTakeNode.parent;
                    if (p) this.watchtowerTakeNode.setSiblingIndex(p.children.length - 1);
                } catch {}
                this.ensureConsumesInput(this.watchtowerTakeNode);
                return;
            }
            const existing = director.getScene()?.getChildByName('Canvas')?.getComponentsInChildren('watchtowerTake' as any) || [];
            if (existing.length > 0) {
                const compNode = (existing[0] as any).node as Node;
                this.watchtowerTakeNode = compNode;
                this.watchtowerTakeNode.active = true;
                this.ensureConsumesInput(this.watchtowerTakeNode);
                return;
            }
            await new Promise<void>((resolve, reject) => {
                resources.load('prefab/hall/watchtower/watchtower_Take', Prefab, (err, prefab) => {
                    if (err || !prefab) { reject(err); return; }
                    const node = instantiate(prefab);
                    const canvas = director.getScene()?.getChildByName('Canvas');
                    const parent = canvas || this.node.parent || this.node;
                    parent.addChild(node);
                    this.watchtowerTakeNode = node;
                    this.ensureConsumesInput(this.watchtowerTakeNode);
                    resolve();
                });
            });
        } catch (e) {
            console.error('[Hall] 打开哨塔上阵页面失败', e);
        }
    }

    async onPartnerSummonPageShow(): Promise<void> {
        try {
            if (this.partnerSummonNode && this.partnerSummonNode.isValid) {
                this.partnerSummonNode.active = true;
                try {
                    const p = this.partnerSummonNode.parent;
                    if (p) this.partnerSummonNode.setSiblingIndex(p.children.length - 1);
                } catch {}
                this.ensureConsumesInput(this.partnerSummonNode);
                return;
            }
            await new Promise<void>((resolve, reject) => {
                resources.load('prefab/hall/partner/partner_Summon', Prefab, (err, prefab) => {
                    if (err || !prefab) { reject(err); return; }
                    const node = instantiate(prefab);
                    const canvas = director.getScene()?.getChildByName('Canvas');
                    const parent = canvas || this.node.parent || this.node;
                    parent.addChild(node);
                    this.partnerSummonNode = node;
                    this.ensureConsumesInput(this.partnerSummonNode);
                    resolve();
                });
            });
        } catch (e) {
            console.error('[Hall] 打开伙伴召唤页面失败', e);
        }
    }

    private ensureToastManager(): void {
        try {
            const scene = director.getScene();
            if (!scene) return;
            const existing = scene.getComponentsInChildren(ToastManager);
            if (existing && existing.length > 0) {
                const node = existing[0].node;
                if (node && node.isValid) {
                    node.active = true;
                    try {
                        const p = node.parent;
                        if (p) node.setSiblingIndex(p.children.length - 1);
                    } catch {}
                }
                return;
            }
            resources.load('prefab/dialog/toast_manager', Prefab, (err, prefab) => {
                if (err || !prefab) return;
                const node = instantiate(prefab);
                const canvas = director.getScene()?.getChildByName('Canvas');
                const parent = canvas || this.node.parent || this.node;
                parent.addChild(node);
                try {
                    node.setSiblingIndex(parent.children.length - 1);
                } catch {}
            });
        } catch {}
    }

    /**
     * 统一设置页面防穿透：为页面节点及关键容器添加 BlockInputEvents，并阻止触摸事件向下层传播
     * @param root 页面根节点
     */
    private ensureConsumesInput(root: Node): void {
        try {
            // 根节点添加事件阻断
            if (!root.getComponent(BlockInputEvents)) {
                root.addComponent(BlockInputEvents);
            }
            // 统一绑定触摸事件，阻止传播
            const stop = (event: any) => { try { event?.stopPropagation && event.stopPropagation(); } catch {} };
            const bindOn = (n: Node) => {
                n.off(Node.EventType.TOUCH_START, stop, this);
                n.off(Node.EventType.TOUCH_END, stop, this);
                n.on(Node.EventType.TOUCH_START, stop, this);
                n.on(Node.EventType.TOUCH_END, stop, this);
            };
            bindOn(root);
            // 为常见容器节点添加阻断（panel/content/bg/background/container/scroll）
            const queue: Node[] = [root];
            while (queue.length) {
                const curr = queue.shift()!;
                const name = (curr.name || '').toLowerCase();
                if (name.includes('panel') || name.includes('content') || name.includes('bg') || name.includes('background') || name.includes('container') || name.includes('scroll')) {
                    bindOn(curr);
                    if (!curr.getComponent(BlockInputEvents)) curr.addComponent(BlockInputEvents);
                }
                const children = curr.children || [];
                for (let i = 0; i < children.length; i++) queue.push(children[i]);
            }
        } catch {}
    }

    onPartnerMainPageShow(): void {
        this.partnerMainPanel.show();
    }

    onRelicSummonPageShow(): void {
        this.relicSummon.show();
    }

    onRelicPageShow(): void {
        this.relicPanel.show();
    }

    async onEquipPageShow(): Promise<void> {
        if (this.equipMainPanel) {
            await this.equipMainPanel.show();
        }
    }

    onHeroCardBreakthroughClick(): void {

        this.fullScreenTupo.show();

    }
    //100 邮箱 101 背包 102 图鉴 103 设置 104 小游戏
    onActivityMenuClick(id: number) {
        switch (id) {
            case 12: // 好友
                this.onFriendButtonTapped();
                break;
            case 102:
                this.monsterPreviewMain.show();
                break;
            case 103:
                this.mySettings.show();
                break;
            case 100:
                this.mailMain.show();
                break;
            case 101:
                this.gameBag.show();
                break;
            case 7:
                this.dailyTaskMain.show();
                break;
            case 8:
                this.mailMenus.show();
                break;
            case 1:
                // 月卡
                // 若未在 Inspector 绑定，运行时兜底查找 MonthlyPass 组件
                if (!this.monthlyPass) {
                    try {
                        const list = this.node.getComponentsInChildren(MonthlyPass);
                        if (list && list.length > 0) {
                            this.monthlyPass = list[0];
                        }
                        if (!this.monthlyPass) {
                            const scene = director.getScene();
                            if (scene) {
                                let found: MonthlyPass = null;
                                const stack: Node[] = [scene];
                                while (stack.length > 0 && !found) {
                                    const n = stack.pop()!;
                                    const comp = n.getComponent(MonthlyPass);
                                    if (comp) { found = comp; break; }
                                    const children = n.children;
                                    if (children && children.length) {
                                        for (let i = 0; i < children.length; i++) stack.push(children[i]);
                                    }
                                }
                                this.monthlyPass = found;
                            }
                        }
                    } catch {}
                }
                this.monthlyPass?.show?.();
                break;
            case 13://排行榜
                this.leaderBoardMain.show();
                break;
            case 11: // 首充
                // 若未在 Inspector 绑定，运行时兜底查找 First_topup 组件
                if (!this.firstTopup) {
                    try {
                        // 先在本节点层级中查找
                        const list = this.node.getComponentsInChildren(First_topup);
                        if (list && list.length > 0) {
                            this.firstTopup = list[0];
                        }
                        // 若仍未找到，递归遍历整个场景
                        if (!this.firstTopup) {
                            const scene = director.getScene();
                            if (scene) {
                                let found: First_topup = null;
                                const stack: Node[] = [scene];
                                while (stack.length > 0 && !found) {
                                    const n = stack.pop()!;
                                    const comp = n.getComponent(First_topup);
                                    if (comp) { found = comp; break; }
                                    const children = n.children;
                                    if (children && children.length) {
                                        for (let i = 0; i < children.length; i++) stack.push(children[i]);
                                    }
                                }
                                this.firstTopup = found;
                            }
                        }
                    } catch {}
                }

                // 显示首充页面（由 First_topup 自身管理层级与阻断事件）
                this.firstTopup?.show?.();
                break;
            case 3: // 七日签到
                // 若未在 Inspector 绑定，运行时兜底查找 SevendayCheckin 组件
                if (!this.sevendayCheckin) {
                    try {
                        const list = this.node.getComponentsInChildren(SevendayCheckin);
                        if (list && list.length > 0) {
                            this.sevendayCheckin = list[0];
                        }
                        if (!this.sevendayCheckin) {
                            const scene = director.getScene();
                            if (scene) {
                                let found: SevendayCheckin = null;
                                const stack: Node[] = [scene];
                                while (stack.length > 0 && !found) {
                                    const n = stack.pop()!;
                                    const comp = n.getComponent(SevendayCheckin);
                                    if (comp) { found = comp; break; }
                                    const children = n.children;
                                    if (children && children.length) {
                                        for (let i = 0; i < children.length; i++) stack.push(children[i]);
                                    }
                                }
                                this.sevendayCheckin = found;
                            }
                        }
                    } catch {}
                }

                // 显示七日签到页面
                this.sevendayCheckin?.show?.();
                break;
            case 9:
                // director.emit(game.gameEvent.DEBUG_FPS_SHOW_HIDE);
                break;
        }
    }

    showDetail(cardId: string): void {
        // 防重复调用机制：如果最近500ms内已经显示过同一个卡片，则忽略
        const currentTime = Date.now();
        if (this._lastShowDetailCardId === cardId && currentTime - this._lastShowDetailTime < 500) {
            return;
        }

        this._lastShowDetailCardId = cardId;
        this._lastShowDetailTime = currentTime;

        this.heroCardDetail.show(cardId);
    }
    hideDetail(): void {
        this.heroCardDetail.hide();
    }

    onNavButtonClick(index: number): void {
        console.log(`[Hall] 收到消息 onNavButtonClick: ${index}`);

        if (index == 5) {
            this.hideAllMainPanels();
            this.guildApplication?.show?.();
        } else {
            this.guildApplication?.hide?.();
        }

        if (index == 4) {
            this.skillTree.show();
        } else {
            this.skillTree.hide();
        }

        if (index == 1) {
            this.battleGate.show();
        } else {
            this.battleGate.hide();
        }

        if (index == 2) {
            if (this.chatButton) {
                this.chatButton.active = true;
            }
        }

        if (index == 3) {
            // 军团界面作为底层页面：先关闭其他界面，再显示军团
            this.hideAllMainPanels();
            this.armyPanel.show();
        } else {
            this.armyPanel.hide();
        }

        if (index == 0) {
            this.shopMain.show();
        } else {
            this.shopMain.hide();
        }

        if (this.chatButton && index !== 2) {
            this.chatButton.active = false;
        }


    }

    /**
     * 统一关闭所有主界面，保证切换时只有目标界面显示
     */
    private hideAllMainPanels(): void {
        this.skillTree?.hide();
        this.battleGate?.hide();
        this.shopMain?.hide();
        this.pkMain?.hide();
        this.dnfMain?.hide();
        this.guildApplication?.hide?.();
        this.equipMainPanel?.hide?.();
        this.relicPanel?.hide?.();
        this.relicSummon?.hide?.();
        this.partnerMainPanel?.hide?.();
        this.skinPreviewMain?.hide?.();
        this.legacyMainPanel?.hide?.();
        this.mailMain?.hide?.();
        this.mailMenus?.hide?.();
        this.gameBag?.hide?.();
        this.monsterPreviewMain?.hide?.();
        this.idleReward?.hide?.();
        this.transformationMain?.hide?.();
        this.dailyTaskMain?.hide?.();
        this.leaderBoardMain?.hide?.();
        this.clearRewardMain?.hide?.();
        this.apiTestMain?.hide?.();
        this.energyShop?.hide?.();
        this.playerInfo?.hide?.();
        this.playerAgreement?.hide?.();
        this.playerBindPhone?.hide?.();
        this.playerGiftCode?.hide?.();
        this.stageDownloader?.hide?.();
        this.heroCardDetail?.hide?.();
        this.armyPanel?.hide();
        this.friendMain?.hide?.();
        this.chatMain?.hide?.();
    }

    /**
     * 获取地图节点
     */
    public getMapNode(): Node | null {
        return this.scrollView?.content || null;
    }

    /**
     * 获取地图尺寸
     */
    public getMapSize(): { width: number, height: number } {
        const mapNode = this.getMapNode();
        if (mapNode) {
            const transform = mapNode.getComponent(UITransform);
            if (transform) {
                return {
                    width: transform.contentSize.width,
                    height: transform.contentSize.height
                };
            }
        }
        return { width: 0, height: 0 };
    }

    /**
     * 滚动到指定关卡节点为中心的位置
     * @param stageNode 关卡节点
     * @param currentStage 关卡索引（0-based，显示时+1）
     * @param time 滚动动画时间 (秒，默认0.3)
     */
    public scrollToStageNode(stageId: number, currentStage: number, time: number = 0.3): void {

        // console.log(`[Hall] scrollToStageNode called with stageId=${stageId}, currentStage=${currentStage}`);

        let attackStat = this.mapSelection.getAttackStat(stageId);
        // console.log(`[Hall] getAttackStat(${stageId}) returned:`, attackStat);

        if (!attackStat) {
            console.error(`[Hall] AttackStat not found for stageId=${stageId} (第${currentStage}关)`);

            // 尝试找到最近的有效关卡
            let fallbackStageId = stageId;
            let fallbackAttackStat = null;

            // 向前搜索
            for (let i = stageId - 1; i >= 0; i--) {
                fallbackAttackStat = this.mapSelection.getAttackStat(i);
                if (fallbackAttackStat) {
                    fallbackStageId = i;
                    console.log(`[Hall] Found fallback stage: ${i} (第${i + 1}关)`);
                    break;
                }
            }

            // 如果向前搜索没找到，向后搜索
            if (!fallbackAttackStat) {
                for (let i = stageId + 1; i < 30; i++) {
                    fallbackAttackStat = this.mapSelection.getAttackStat(i);
                    if (fallbackAttackStat) {
                        fallbackStageId = i;
                        console.log(`[Hall] Found fallback stage: ${i} (第${i + 1}关)`);
                        break;
                    }
                }
            }

            if (fallbackAttackStat) {
                // 使用备用关卡
                attackStat = fallbackAttackStat;
                console.log(`[Hall] Using fallback stage ${fallbackStageId} instead of ${stageId}`);
            } else {
                console.error(`[Hall] No valid stage found, aborting scroll`);
                return;
            }
        }

        const stageNode = attackStat.node;

        if (!this.scrollView || !stageNode || (!stageNode.isValid)) {
            console.error(`[Hall] Invalid state: scrollView=${!!this.scrollView}, stageNode=${!!stageNode}, isValid=${stageNode?.isValid}`);
            return;
        }

        const contentNode = this.scrollView.content;
        if (!contentNode) {
            return;
        }

        // 设置army坐标 = stageNode坐标
        if (this.army) {
            this.army.setPosition(stageNode.position);
        }

        // 获取必要的组件
        const scrollViewTransform = this.scrollView.node.getComponent(UITransform);
        const contentTransform = contentNode.getComponent(UITransform);
        const stageTransform = stageNode.getComponent(UITransform);

        if (!scrollViewTransform || !contentTransform || !stageTransform) {
            return;
        }

        // 获取尺寸信息
        const viewSize = scrollViewTransform.contentSize;
        const contentSize = contentTransform.contentSize;
        const stageLocalPos = stageNode.position;

        // 计算content锚点偏移
        const contentAnchor = contentTransform.anchorPoint;
        const contentAnchorOffsetX = contentSize.width * contentAnchor.x;
        const contentAnchorOffsetY = contentSize.height * (1 - contentAnchor.y);

        // 将节点位置转换为从content左上角开始的坐标
        const nodeX = stageLocalPos.x + contentAnchorOffsetX;
        const nodeY = contentAnchorOffsetY - stageLocalPos.y;

        // 计算让节点居中显示所需的偏移量
        const targetOffsetX = nodeX - viewSize.width / 2;
        const targetOffsetY = nodeY - viewSize.height / 2;

        // 限制偏移量在有效范围内
        const maxOffset = this.scrollView.getMaxScrollOffset();
        const clampedOffsetX = Math.max(0, Math.min(maxOffset.x, targetOffsetX));
        const clampedOffsetY = Math.max(0, Math.min(maxOffset.y, targetOffsetY));

        // 执行滚动
        const targetOffset = new Vec2(clampedOffsetX, clampedOffsetY);
        this.scrollView.scrollToOffset(targetOffset, time);

        // 设置部队位置
        this.mapSelection.setArmyPosition(stageNode.getComponent(AttackStat));

        // 更新全局当前关卡
        game.myGlobal.currentStage = currentStage;
        console.log(`[Hall] 更新全局当前关卡: ${game.myGlobal.currentStage}`);
    }

    /**
     * 实时获取ScrollView状态
     */
    public getCurrentScrollViewStatus(): any {
        if (true) return;

        if (!this.scrollView) return null;

        const currentOffset = this.scrollView.getScrollOffset();
        const maxOffset = this.scrollView.getMaxScrollOffset();
        const mapSize = this.getMapSize();

        // 计算当前百分比位置
        const xPercent = maxOffset.x > 0 ? (currentOffset.x / maxOffset.x * 100) : 0;
        const yPercent = maxOffset.y > 0 ? (currentOffset.y / maxOffset.y * 100) : 0;

        const status = {
            currentOffset: currentOffset,
            maxOffset: maxOffset,
            xPercent: parseFloat(xPercent.toFixed(1)),
            yPercent: parseFloat(yPercent.toFixed(1)),
            isScrolling: this.scrollView.isScrolling(),
            isAutoScrolling: this.scrollView.isAutoScrolling(),
            mapSize: mapSize
        };

        return status;
    }

    onGameHallUIShow(ui: string, isShow: boolean = true) {
        switch (ui) {
            case "world_select":
                isShow ? this.uiWorldSelect?.show() : this.uiWorldSelect?.hide();
                break;
        }
    }

    /**
     * 开始游戏 - 切换到游戏场景
     * @param stageId 关卡编号（可选，用于设置当前关卡）
     */
    public startGame(): void {
        if ((game as any).myGlobal.currentWorld == 2) {
            this.onOpenTeamUp((game as any).myGlobal.currentStage);
            return;
        }

        MusicManager.getInstance().stopBackgroundMusic();
        game.myGlobal.gameInited = 0;
        console.log(`开始游戏，关卡：${game.myGlobal.currentStage}`);
        director.loadScene('game');
    }
}
