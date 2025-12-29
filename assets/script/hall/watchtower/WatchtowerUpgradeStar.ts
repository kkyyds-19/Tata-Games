import { _decorator, Component, Node, BlockInputEvents, Button, director, game, Sprite, Label, resources, SpriteAtlas, UITransform, SpriteFrame, tween, Vec3, UIOpacity } from 'cc';
import { watchtowerConfigs } from '../../global/config/WatchtowerConfig';
import { UserWatchtowerData } from '../../user/UserWatchtowerData';
import { towerAPI } from '../../api/TowerAPI';
const { ccclass, property } = _decorator;

@ccclass('WatchtowerUpgradeStar')
export class WatchtowerUpgradeStar extends Component {
    @property(Button)
    public openUpgradeButton: Button | null = null;
    @property(Button)
    public starUpButton: Button | null = null;
    @property(Sprite)
    public towerIcon: Sprite | null = null;
    @property(Label)
    public towerNameLabel: Label | null = null;
    @property(Node)
    public starLayout: Node | null = null;
    @property(Label)
    public fragmentLabel: Label | null = null;
    private iconSprite: Sprite | null = null;
    private levelLabel: Label | null = null;
    private starLabel: Label | null = null;
    private nameLabel: Label | null = null;
    private _starSprites: Sprite[] = [];
    private _starGrayFrames: (SpriteFrame | null)[] = [];
    private _brightStarFrame: SpriteFrame | null = null;
    private _grayStarFrame: SpriteFrame | null = null;
    private _starBrightNodes: Node[] = [];
    private _watchtowerAtlas: SpriteAtlas | null = null;
    private _currentTowerId: number | null = null;

    start() {
        try {
            if (!this.node.getComponent(BlockInputEvents)) this.node.addComponent(BlockInputEvents);
            if (this.openUpgradeButton) {
                this.openUpgradeButton.node.off(Button.EventType.CLICK);
                this.openUpgradeButton.node.on(Button.EventType.CLICK, () => {
                    try { director.emit(game.gameEvent.GAME_WATCHTOWER_UPGRADE_PAGE_SHOW, this._currentTowerId); } catch {}
                }, this);
            } else {
                const firstBtn = this.node.getComponentInChildren(Button);
                if (firstBtn && (!this.starUpButton || firstBtn.node !== this.starUpButton.node)) {
                    firstBtn.node.off(Button.EventType.CLICK);
                    firstBtn.node.on(Button.EventType.CLICK, () => {
                        try { director.emit(game.gameEvent.GAME_WATCHTOWER_UPGRADE_PAGE_SHOW, this._currentTowerId); } catch {}
                    }, this);
                }
            }
            if (this.starUpButton) {
                this.starUpButton.node.off(Button.EventType.CLICK);
                this.starUpButton.node.on(Button.EventType.CLICK, this.onClickStarUp, this);
            }
            this.iconSprite = this.towerIcon || null;
            this.nameLabel = this.towerNameLabel || null;
            if (this.starLayout && this.starLayout.isValid) {
                const children = this.starLayout.children || [];
                const parseIdx = (name: string) => {
                    const m = name && name.match(/(\d+)/);
                    return m ? Number(m[1]) : 0;
                };
                const sorted = children.slice().sort((a, b) => parseIdx(a.name) - parseIdx(b.name));
                this._starSprites = sorted.map(c => this.findSpriteDeep(c)).filter(s => !!s) as Sprite[];
                this._starGrayFrames = this._starSprites.map(s => s.spriteFrame || null);
                this._starBrightNodes = sorted.map(c => this.findChildDeep(c, 'Watchtower_31')).filter(n => !!n) as Node[];
            }
        } catch {}
    }

    show(): void {
        try {
            this.node.active = true;
            const canvas = director.getScene()?.getChildByName('Canvas');
            if (canvas && this.node.parent !== canvas) this.node.parent = canvas;
            const p = this.node.parent; if (p) this.node.setSiblingIndex(p.children.length - 1);
            this.refreshView();
        } catch {}
    }

    hide(){ this.node.active = false; }

    update(deltaTime: number) {}

    public setTowerId(id?: number): void {
        if (id && id > 0) this._currentTowerId = id;
        if (this.node.active) this.refreshView();
    }

    public showFor(id?: number): void {
        if (id && id > 0) this._currentTowerId = id;
        this.show();
        this.refreshView();
    }

    private refreshView(): void {
        if (!this._currentTowerId) return;
        const cfg = watchtowerConfigs.find(c => c.id === this._currentTowerId);
        const item = UserWatchtowerData.getInstance().getWatchtower(this._currentTowerId);
        if (this.nameLabel && cfg) { this.nameLabel.string = cfg.name || ''; this.nameLabel.node.active = true; }
        if (this.levelLabel && item) { this.levelLabel.string = `Lv.${item.level}`; this.levelLabel.node.active = true; }
        if (this.starLabel && item) { this.starLabel.string = `${item.star}`; this.starLabel.node.active = true; }
        if (this.iconSprite && cfg && cfg.iconFrameName) {
            const iconName = cfg.iconFrameName;
            if (this.iconSprite.spriteAtlas) {
                const frame = this.iconSprite.spriteAtlas.getSpriteFrame(iconName) || this.iconSprite.spriteAtlas.getSpriteFrame(iconName + '.png');
                if (frame) { this.iconSprite.spriteFrame = frame; }
            } else {
                resources.load('img/hall/watchtower', SpriteAtlas, (err, atlas) => {
                    if (err || !atlas) return;
                    const frame = atlas.getSpriteFrame(iconName) || atlas.getSpriteFrame(iconName + '.png');
                    if (frame) { this.iconSprite.spriteAtlas = atlas; this.iconSprite.spriteFrame = frame; }
                });
            }
        }
        if (this.iconSprite && this.iconSprite.node && this.iconSprite.node.isValid) {
            try { (this.iconSprite as any).sizeMode = (Sprite as any).SizeMode?.CUSTOM ?? (this.iconSprite as any).sizeMode; } catch {}
            const ui = this.iconSprite.node.getComponent(UITransform) || this.iconSprite.node.addComponent(UITransform);
            ui.setContentSize(381, 546);
        }
        this.refreshStars(item?.star || 0);
        this.updateFragmentLabel(this._currentTowerId);
    }

    private refreshStars(starCount: number): void {
        const starsRaw = this.starLayout?.children || [];
        const parseIdx = (name: string) => {
            const m = name && name.match(/(\d+)/);
            return m ? Number(m[1]) : 0;
        };
        const stars = starsRaw.slice().sort((a, b) => parseIdx(a.name) - parseIdx(b.name));
        if (!stars || stars.length === 0) return;
        const nodes: Node[] = [];
        let needCreate = false;
        for (let i = 0; i < stars.length; i++) {
            const parent = stars[i];
            parent.active = true;
            let n: Node | null = null;
            const cached = this._starBrightNodes[i];
            if (cached && cached.isValid && cached.parent === parent) {
                n = cached;
            } else {
                n = this.findChildDeep(parent, 'Watchtower_31');
            }
            if (!n) { needCreate = true; }
            nodes[i] = n as Node;
        }
        const applyVisibility = () => {
            this._starBrightNodes = nodes;
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                if (!n) continue;
                const wasActive = n.active;
                n.active = i < starCount;
                if (n.active && !wasActive) {
                    const opacity = n.getComponent(UIOpacity) || n.addComponent(UIOpacity);
                    opacity.opacity = 0;
                    n.scale = new Vec3(0, 0, 0);
                    tween(n).to(0.2, { scale: new Vec3(1.2, 1.2, 1.2) }).to(0.1, { scale: new Vec3(1, 1, 1) }).start();
                    tween(opacity).to(0.2, { opacity: 255 }).start();
                }
            }
        };

        const applyFallbackFrameSwitch = () => {
            if (!this._starSprites || this._starSprites.length === 0) return;
            const apply = () => {
                for (let i = 0; i < this._starSprites.length; i++) {
                    const s = this._starSprites[i];
                    if (!s) continue;
                    if (i < starCount && this._brightStarFrame) {
                        s.spriteFrame = this._brightStarFrame;
                    } else {
                        s.spriteFrame = this._starGrayFrames[i] || this._grayStarFrame || s.spriteFrame;
                    }
                }
            };
            if (this._brightStarFrame && this._grayStarFrame) { apply(); return; }
            resources.load('img/hall/watchtower', SpriteAtlas, (err, atlas) => {
                if (err || !atlas) { apply(); return; }
                this._brightStarFrame = atlas.getSpriteFrame('Watchtower_31') || atlas.getSpriteFrame('Watchtower_31.png');
                this._grayStarFrame = atlas.getSpriteFrame('Watchtower_36') || atlas.getSpriteFrame('Watchtower_36.png');
                apply();
            });
        };

        if (needCreate) {
            const finish = (atlas: SpriteAtlas) => {
                this._watchtowerAtlas = atlas;
                const bright = atlas.getSpriteFrame('Watchtower_31') || atlas.getSpriteFrame('Watchtower_31.png');
                const gray = atlas.getSpriteFrame('Watchtower_36') || atlas.getSpriteFrame('Watchtower_36.png');
                this._brightStarFrame = bright || this._brightStarFrame;
                this._grayStarFrame = gray || this._grayStarFrame;
                for (let i = 0; i < stars.length; i++) {
                    if (!nodes[i]) {
                        const parent = stars[i];
                        let n = new Node('Watchtower_31');
                        const sp = n.addComponent(Sprite);
                        try { (sp as any).sizeMode = (Sprite as any).SizeMode?.CUSTOM ?? (sp as any).sizeMode; } catch {}
                        if (bright) { sp.spriteAtlas = atlas; sp.spriteFrame = bright; }
                        parent.addChild(n);
                        n.setSiblingIndex(parent.children.length - 1);
                        const pui = parent.getComponent(UITransform);
                        const ui = n.getComponent(UITransform) || n.addComponent(UITransform);
                        if (pui) ui.setContentSize(pui.width, pui.height);
                        n.setPosition(0, 0, 0);
                        nodes[i] = n;
                    }
                }
                applyVisibility();
                applyFallbackFrameSwitch();
            };
            if (this._watchtowerAtlas) {
                finish(this._watchtowerAtlas);
            } else {
                resources.load('img/hall/watchtower', SpriteAtlas, (err, atlas) => {
                    if (err || !atlas) {
                        applyFallbackFrameSwitch();
                        return;
                    }
                    finish(atlas);
                });
            }
        } else {
            this._starBrightNodes = nodes;
            applyVisibility();
            applyFallbackFrameSwitch();
        }
    }

    public async onClickStarUp(): Promise<void> {
        if (!this._currentTowerId) return;
        try {
            const resp = await towerAPI.obtainTowerByConfigId(this._currentTowerId);
            if (resp && resp.code === 200) {
                const ok = UserWatchtowerData.getInstance().starUpPartner(this._currentTowerId);
                if (ok) {
                    this.refreshView();
                    this.updateFragmentLabel(this._currentTowerId);
                }
            }
        } catch {}
    }

    private updateFragmentLabel(id: number | null): void {
        if (!id) {
            if (this.fragmentLabel) { this.fragmentLabel.string = ''; this.fragmentLabel.node.active = false; }
            return;
        }
        towerAPI.getTowerDetailByConfigId(id).then(resp => {
            if (!resp || resp.code !== 200 || !resp.data) return;
            const data = resp.data as any;
            const frag = data.fragment;
            if (this.fragmentLabel) {
                this.fragmentLabel.string = (frag !== undefined && frag !== null) ? String(frag) : '';
                this.fragmentLabel.node.active = true;
            }
        }).catch(() => {});
    }

    private findChildDeep(root: Node, name: string): Node | null {
        if (!root) return null;
        if (root.name === name) return root;
        const children = root.children || [];
        for (let i = 0; i < children.length; i++) {
            const found = this.findChildDeep(children[i], name);
            if (found) return found;
        }
        return null;
    }

    private findSpriteDeep(root: Node): Sprite | null {
        if (!root) return null;
        const s = root.getComponent(Sprite);
        if (s) return s;
        const children = root.children || [];
        for (let i = 0; i < children.length; i++) {
            const found = this.findSpriteDeep(children[i]);
            if (found) return found;
        }
        return null;
    }
}


