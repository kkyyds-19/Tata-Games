import { _decorator, Component, Node, Color, Sprite, BlockInputEvents, UITransform, view, Vec3, director, Button, resources, SpriteAtlas, SpriteFrame, game, Label } from 'cc';
import { towerFactoryAPI } from '../../api/TowerFactoryAPI';
import { UserHomeData } from '../../user/UserHomeData';
const { ccclass, property } = _decorator;

@ccclass('WatchtowerPopup')
export class WatchtowerPopup extends Component {
    private _bg: Node | null = null;
    @property(Button)
    public commonButton: Button | null = null;
    @property(Button)
    public seniorButton: Button | null = null;
    @property(Label)
    public commonLabel: Label | null = null;
    @property(Label)
    public seniorLabel: Label | null = null;
    private _factoryId: string | null = null;

    start() {
        try { this.node.addComponent(BlockInputEvents); } catch {}
        try {
            const canvas = director.getScene()?.getChildByName('Canvas');
            if (canvas) this.node.parent = canvas;
            const p = this.node.parent;
            if (p) this.node.setSiblingIndex(p.children.length - 1);
        } catch {}
        this._bg = this.node.getChildByName('bg');
        if (!this._bg) {
            this._bg = new Node('bg');
            this.node.addChild(this._bg);
        }
        try { this._bg.addComponent(BlockInputEvents); } catch {}
        const ui = this._bg.getComponent(UITransform) || this._bg.addComponent(UITransform);
        const pui = this.node.parent?.getComponent(UITransform);
        const size = view.getVisibleSize();
        ui.setContentSize(pui ? pui.width : size.width, pui ? pui.height : size.height);
        this._bg.setPosition(new Vec3(0, 0, 0));
        const sprite = this._bg.getComponent(Sprite) || this._bg.addComponent(Sprite);
        try { (sprite as any).sizeMode = (Sprite as any).SizeMode?.CUSTOM ?? (sprite as any).sizeMode; } catch {}
        sprite.color = new Color(0, 0, 0, 255);
        try { this._bg.setSiblingIndex(0); } catch {}
        const handler = () => this.hide();
        this._bg.off(Node.EventType.TOUCH_START, handler, this);
        this._bg.off(Node.EventType.TOUCH_END, handler, this);
        this._bg.on(Node.EventType.TOUCH_START, handler, this);
        this._bg.on(Node.EventType.TOUCH_END, handler, this);

        try {
            if (this.commonButton) {
                this.commonButton.node.off(Button.EventType.CLICK);
                this.commonButton.node.on(Button.EventType.CLICK, () => this.onClickSummon('watchtower_common_drawing'), this);
            }
            if (this.seniorButton) {
                this.seniorButton.node.off(Button.EventType.CLICK);
                this.seniorButton.node.on(Button.EventType.CLICK, () => this.onClickSummon('watchtower_senior_drawing'), this);
            }
            if (!this.commonButton || !this.seniorButton) {
                const btns = this.node.getComponentsInChildren(Button) || [];
                const btnCommon = btns.find(b => b.node.name.toLowerCase().includes('common') || b.node.name.toLowerCase().includes('normal'));
                const btnSenior = btns.find(b => b.node.name.toLowerCase().includes('senior') || b.node.name.toLowerCase().includes('advanced'));
                if (!this.commonButton && btnCommon) {
                    this.commonButton = btnCommon;
                    this.commonButton.node.off(Button.EventType.CLICK);
                    this.commonButton.node.on(Button.EventType.CLICK, () => this.onClickSummon('watchtower_common_drawing'), this);
                }
                if (!this.seniorButton && btnSenior) {
                    this.seniorButton = btnSenior;
                    this.seniorButton.node.off(Button.EventType.CLICK);
                    this.seniorButton.node.on(Button.EventType.CLICK, () => this.onClickSummon('watchtower_senior_drawing'), this);
                }
            }
            if (!this.commonLabel || !this.seniorLabel) {
                const labels = this.node.getComponentsInChildren(Label) || [];
                if (!this.commonLabel) {
                    this.commonLabel = labels.find(l => {
                        const n = l.node.name.toLowerCase();
                        return n.includes('common') || n.includes('normal') || n.includes('watchtower_common_drawing');
                    }) || null;
                }
                if (!this.seniorLabel) {
                    this.seniorLabel = labels.find(l => {
                        const n = l.node.name.toLowerCase();
                        return n.includes('senior') || n.includes('advanced') || n.includes('watchtower_senior_drawing');
                    }) || null;
                }
            }
            this.updateDrawingLabels();
        } catch {}
    }

    update(deltaTime: number) {
        
    }

    public show(): void {
        this.node.active = true;
        this.updateDrawingLabels();
    }

    public hide(): void {
        this.node.active = false;
    }

    public setFactoryId(id?: string): void {
        this._factoryId = id || null;
    }

    private findDeep(root: Node | null, name: string): Node | null {
        if (!root) return null;
        if (root.name === name) return root;
        const children = root.children || [];
        for (let i = 0; i < children.length; i++) {
            const r = this.findDeep(children[i], name);
            if (r) return r;
        }
        return null;
    }

    private async onClickSummon(key: string): Promise<void> {
        if (!this._factoryId) return;
        try {
            const resp = await towerFactoryAPI.addBuildRecord(this._factoryId, key);
            if (resp && resp.code === 200) {
                try {
                    const idxEmit = parseInt(this._factoryId || '0');
                    const typeEmit = key === 'watchtower_senior_drawing' ? 2 : 1;
                    director.emit(game.gameEvent.GAME_WATCHTOWER_SUMMON_SUCCESS, idxEmit, typeEmit);
                } catch {}
                this.hide();
                try {
                    const scene = director.getScene();
                    const idx = parseInt(this._factoryId || '0');
                    const factoryName = `watchtower_${17 + idx}`;
                    const factoryNode = this.findDeep(scene, factoryName);
                    if (!factoryNode) return;
                    const n32 = this.findDeep(factoryNode, 'Watchtower_32');
                    if (n32) n32.active = true;
                    const n39 = this.findDeep(factoryNode, 'watchtower_39');
                    const n35 = this.findDeep(factoryNode, 'watchtower_35');
                    if (n39) n39.active = true;
                    if (n35) n35.active = false;

                    const targetName = `watchtower_${idx}`;
                    const targetNode = this.findDeep(factoryNode, targetName);
                    const targetSprite = targetNode ? targetNode.getComponent(Sprite) : null;
                    const applyFrame = (frame: SpriteFrame | null) => {
                        if (!frame) return;
                        if (targetSprite) targetSprite.spriteFrame = frame;
                        const sprites = factoryNode.getComponentsInChildren(Sprite) || [];
                        for (let i = 0; i < sprites.length; i++) {
                            const s = sprites[i];
                            const name = s.spriteFrame?.name || '';
                            if (name.indexOf('watchtower_35') !== -1) {
                                s.spriteFrame = frame;
                            }
                        }
                    };
                    resources.load('img/hall/watchtower_1', SpriteAtlas, (err1, atlas1) => {
                        let frame: SpriteFrame | null = null;
                        if (!err1 && atlas1) frame = atlas1.getSpriteFrame('watchtower_39');
                        if (frame) {
                            applyFrame(frame);
                        } else {
                            resources.load('img/hall/Watchtower1', SpriteAtlas, (err2, atlas2) => {
                                const frame2 = !err2 && atlas2 ? atlas2.getSpriteFrame('watchtower_39') : null;
                                applyFrame(frame2);
                            });
                        }
                    });
                } catch {}
            }
        } catch {}
    }

    private updateDrawingLabels(): void {
        try {
            const home = UserHomeData.getInstance();
            const commonNum = home.getCommonNum();
            const seniorNum = home.getSeniorNum();
            if (this.commonLabel) {
                this.commonLabel.string = `${commonNum}`;
                this.commonLabel.node.active = true;
            }
            if (this.seniorLabel) {
                this.seniorLabel.string = `${seniorNum}`;
                this.seniorLabel.node.active = true;
            }
        } catch {}
    }
}


