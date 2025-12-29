import { _decorator, Component, Node, Prefab, instantiate, Button, director } from 'cc';
import { soulBeastConfigs, SoulBeastTrait } from '../global/config/SoulBeastConfig';
import { SoulIcon } from './SoulIcon';
import { SoulBeastHome } from './SoulBeastHome';

const { ccclass, property } = _decorator;

@ccclass('SoulBeast_main')
export class SoulBeast_main extends Component {
    @property(Prefab)
    public soulIconPrefab: Prefab = null;

    @property(Node)
    public contentNode: Node = null;

    @property([Button])
    public navButtons: Button[] = [];

    @property(Node)
    public homePage: Node = null;

    @property(SoulBeastHome)
    public homeController: SoulBeastHome = null;

    @property([Button])
    public traitButtons: Button[] = [];

    private _currentTrait: SoulBeastTrait | null = null;

    private getHomeController(): SoulBeastHome | null {
        if (this.homeController && this.homeController.node && this.homeController.node.isValid) {
            return this.homeController;
        }
        if (this.homePage && this.homePage.isValid) {
            const home = this.homePage.getComponent(SoulBeastHome) || this.homePage.getComponentInChildren(SoulBeastHome);
            if (home) {
                this.homeController = home;
                if (!this.homePage) {
                    this.homePage = home.homePage || home.node;
                }
                return home;
            }
        }
        const scene = director.getScene();
        if (scene) {
            const homes = scene.getComponentsInChildren(SoulBeastHome);
            if (homes && homes.length > 0) {
                this.homeController = homes[0];
                if (!this.homePage) {
                    this.homePage = homes[0].homePage || homes[0].node;
                }
                return this.homeController;
            }
        }
        return null;
    }

    public show(): void {
        this.node.active = true;
        this.refresh();
    }

    public hide(): void {
        this.node.active = false;
    }

    onEnable() {
        this.bindNavButtons();
        this.bindTraitButtons();
        this.refresh();
    }

    private bindNavButtons() {
        this.navButtons.forEach((button, index) => {
            if (!button) {
                return;
            }
            button.node.off(Button.EventType.CLICK);
            button.node.on(Button.EventType.CLICK, () => {
                this.onNavButtonClick(index);
            }, this);
        });
    }

    private onNavButtonClick(index: number) {
        const home = this.getHomeController();
        if (index === 0) {
            if (home) {
              
            } else {
                if (this.homePage) {
                    this.homePage.active = true;
                }
            }
        } else if (index === 1) {
            if (home) {
              
            } else {
                if (this.homePage) {
                    this.homePage.active = false;
                }
                this.node.active = true;
                this.refresh();
            }
        } else if (index === 2) {
            console.log('[SoulBeast_main] nav button 3 clicked (reserved)');
        } else if (index === 3) {
            console.log('[SoulBeast_main] nav button 4 clicked (reserved)');
        }
    }

    private bindTraitButtons() {
        this.traitButtons.forEach((button, index) => {
            button.node.off(Button.EventType.CLICK);
            button.node.on(Button.EventType.CLICK, () => {
                this.onTraitButtonClick(index);
            }, this);
        });
    }

    private onTraitButtonClick(index: number) {
        if (index === 0) {
            this._currentTrait = null;
        } else if (index === 1) {
            this._currentTrait = SoulBeastTrait.HEAVY;
        } else if (index === 2) {
            this._currentTrait = SoulBeastTrait.FRENZY;
        } else if (index === 3) {
            this._currentTrait = SoulBeastTrait.CURSE;
        } else if (index === 4) {
            this._currentTrait = SoulBeastTrait.SAVE;
        } else if (index === 5) {
            this._currentTrait = SoulBeastTrait.CHARGE;
        }
        this.refresh();
    }

    private refresh() {
        if (!this.soulIconPrefab || !this.contentNode) {
            return;
        }
        this.contentNode.removeAllChildren();
        const list = this._currentTrait
            ? soulBeastConfigs.filter(c => c.trait === this._currentTrait)
            : soulBeastConfigs;
        for (const config of list) {
            const node = instantiate(this.soulIconPrefab);
            const icon = node.getComponent(SoulIcon);
            if (!icon) {
                continue;
            }
            icon.init(config.id);
            this.contentNode.addChild(node);
        }
    }
}


