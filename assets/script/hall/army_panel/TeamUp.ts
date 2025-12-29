import { _decorator, Component, Node, Button, director, game, Prefab, resources, instantiate } from 'cc';
import { HeroCard } from './HeroCard';
import { UserClassData } from '../../user/UserClassData';
import { MusicManager } from '../../music/MusicManager';
import { StageType } from '../../game/stage/StageData';
import { FormationMain } from './FormationMain';
const { ccclass, property } = _decorator;

@ccclass('TeamUp')
export class TeamUp extends Component {

    @property({ type: Button, tooltip: "开始游戏按钮" })
    public startButton: Button = null;

    @property({ type: Button, tooltip: "关闭按钮" })
    public closeButton: Button = null;

    @property({ type: Button, tooltip: "编队按钮" })
    public formationButton: Button = null;

    @property({ type: [HeroCard], tooltip: "上阵英雄槽位数组" })
    public heroCardList: HeroCard[] = [];

    private stageId: number = 0;

    private formationPanel: FormationMain | null = null;

    start() {
        this.startButton?.node.on(Button.EventType.CLICK, this.onStartGame, this);
        this.closeButton?.node.on(Button.EventType.CLICK, this.onClose, this);
        this.formationButton?.node.on(Button.EventType.CLICK, this.onOpenFormation, this);
        director.on(game.gameEvent.HALL_ARMY_FORMATION_CHANGED, this.refreshHeroSlots, this);
        this.refreshHeroSlots();
    }

    public show(stageId: number) {
        this.stageId = stageId;
        this.node.active = true;
        this.refreshHeroSlots();
    }

    public hide() {
        this.node.active = false;
    }

    private onStartGame() {
        MusicManager.getInstance().stopBackgroundMusic();
        (game as any).myGlobal.gameInited = 0;
        (game as any).myGlobal.currentStage = this.stageId;
        (game as any).myGlobal.stageType = StageType.Outland;
        (game as any).myGlobal.currentWorld = 2;
        
        console.log(`TeamUp: 开始游戏，关卡：${this.stageId}`);
        director.loadScene('game');
    }

    private onClose() {
        this.hide();
    }

    private async onOpenFormation() {
        if (!this.formationPanel) {
            await new Promise<void>((resolve, reject) => {
                resources.load('prefab/hall/army_panel/Formation_main', Prefab, (err, prefab) => {
                    if (err) { reject(err); return; }
                    const node = instantiate(prefab);
                    const container = this.node.parent || this.node;
                    container.addChild(node);
                    this.formationPanel = node.getComponent(FormationMain);
                    resolve();
                });
            });
        }
        this.formationPanel?.node.setSiblingIndex((this.node?.getSiblingIndex?.() ?? 0) + 1);
        this.formationPanel?.show?.();
    }

    private refreshHeroSlots() {
        const ids = UserClassData.getInstance().getDeployedCardIds();
        for (let i = 0; i < this.heroCardList.length; i++) {
            const card = this.heroCardList[i];
            if (!card) continue;
            if (i < ids.length) {
                card.setHeroData(ids[i]);
                card.loadLevelFromClassData();
                card.showOnFieldNode();
                card.show();
            } else {
                card.reset();
                card.hideOnFieldNode();
                card.hide();
            }
        }
    }

    onDestroy() {
        director.off(game.gameEvent.HALL_ARMY_FORMATION_CHANGED, this.refreshHeroSlots, this);
    }
}
