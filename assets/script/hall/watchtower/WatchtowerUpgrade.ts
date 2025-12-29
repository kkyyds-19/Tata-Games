import { _decorator, Component, Node, BlockInputEvents, Button, director, game, Sprite, Label, resources, SpriteAtlas, UITransform, SpriteFrame } from 'cc';
import { watchtowerConfigs } from '../../global/config/WatchtowerConfig';
import { UserWatchtowerData } from '../../user/UserWatchtowerData';
import { towerAPI } from '../../api/TowerAPI';
const { ccclass, property } = _decorator;

@ccclass('WatchtowerUpgrade')
export class WatchtowerUpgrade extends Component {
    /** 升星页面按钮：点击后打开升星页面（由 hall 统一管理） */
    @property(Button)
    public openStarButton: Button | null = null;
    @property(Sprite)
    public towerIcon: Sprite | null = null;
    @property(Label)
    public towerStarLabel: Label | null = null;
    @property(Label)
    public towerNameLabel: Label | null = null;
    @property(Node)
    public starLayout: Node | null = null;
    @property(Label)
    public levelCurrLabel: Label | null = null;
    @property(Label)
    public levelNextLabel: Label | null = null;
    @property(Label)
    public attackCurrLabel: Label | null = null;
    @property(Label)
    public attackNextLabel: Label | null = null;
    @property(Label)
    public hpCurrLabel: Label | null = null;
    @property(Label)
    public hpNextLabel: Label | null = null;
    @property(Button)
    public upgradeButton: Button | null = null;
    // 升级材料展示Label（解析 /api/user/watchtower/{id} 的 data.upgrade JSON 字段）
    @property(Label)
    public upgradeMaterialsLabel: Label | null = null;
    // 升级需要的碎片数展示Label（绑定 data.nextFragment 字段）
    @property(Label)
    public fragmentNeedLabel: Label | null = null;
    private iconSprite: Sprite | null = null;
    private levelLabel: Label | null = null;
    private starLabel: Label | null = null;
    private nameLabel: Label | null = null;
    private _starSprites: Sprite[] = [];
    private _starGrayFrames: (SpriteFrame | null)[] = [];
    private _brightStarFrame: SpriteFrame | null = null;
    private _starBrightNodes: Node[] = [];
    private _currentTowerId: number | null = null;

    start() {
        try {
            
            if (!this.node.getComponent(BlockInputEvents)) this.node.addComponent(BlockInputEvents);
            if (this.openStarButton) {
                this.openStarButton.node.off(Button.EventType.CLICK);
                this.openStarButton.node.on(Button.EventType.CLICK, () => {
                    try { director.emit(game.gameEvent.GAME_WATCHTOWER_UPGRADE_STAR_PAGE_SHOW, this._currentTowerId); } catch {}
                }, this);
            } else {
                const btn = this.node.getComponentInChildren(Button);
                if (btn) {
                    btn.node.off(Button.EventType.CLICK);
                    btn.node.on(Button.EventType.CLICK, () => {
                        try { director.emit(game.gameEvent.GAME_WATCHTOWER_UPGRADE_STAR_PAGE_SHOW, this._currentTowerId); } catch {}
                    }, this);
                }
            }
            this.iconSprite = this.towerIcon || null;
            this.levelLabel = this.levelLabel || null;
            this.starLabel = this.towerStarLabel || null;
            this.nameLabel = this.towerNameLabel || null;
            
            
        
            if (this.starLayout && this.starLayout.isValid) {
                const children = this.starLayout.children || [];
                this._starSprites = children.map(c => c.getComponent(Sprite)).filter(s => !!s) as Sprite[];
                this._starGrayFrames = this._starSprites.map(s => s.spriteFrame || null);
                this._starBrightNodes = children.map(c => this.findChildDeep(c, 'Watchtower_31')).filter(n => !!n) as Node[];
            }
            if (this.upgradeButton) {
                this.upgradeButton.node.off(Button.EventType.CLICK);
                this.upgradeButton.node.on(Button.EventType.CLICK, this.onClickUpgrade, this);
            }
        } catch {}
    }

    show(): void {
        try {
            this.node.active = true;
            
            // 确保节点在Canvas下并置于最顶层
            const canvas = director.getScene()?.getChildByName('Canvas');
            if (canvas && this.node.parent !== canvas) {
                this.node.parent = canvas;
            }
            
            const p = this.node.parent;
            if (p) {
                this.node.setSiblingIndex(p.children.length - 1);
            }
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
        if (this.nameLabel && cfg) {
            this.nameLabel.string = cfg.name || '';
            this.nameLabel.node.active = true;
        }
        if (this.levelLabel && item) { this.levelLabel.string = `Lv.${item.level}`; this.levelLabel.node.active = true; }
        const lvl = item ? item.level : 1;
        const nextLvl = lvl + 1;
        if (this.levelCurrLabel) { this.levelCurrLabel.string = `${lvl}级`; this.levelCurrLabel.node.active = true; }
        if (this.levelNextLabel) { this.levelNextLabel.string = `${nextLvl}级`; this.levelNextLabel.node.active = true; }
        const atkCurr = 10 + 2 * (lvl - 1);
        const atkNext = 10 + 2 * (nextLvl - 1);
        const hpCurr = 100 + 20 * (lvl - 1);
        const hpNext = 100 + 20 * (nextLvl - 1);
        if (this.attackCurrLabel) { this.attackCurrLabel.string = `+${atkCurr}`; this.attackCurrLabel.node.active = true; }
        if (this.attackNextLabel) { this.attackNextLabel.string = `+${atkNext}`; this.attackNextLabel.node.active = true; }
        if (this.hpCurrLabel) { this.hpCurrLabel.string = `+${hpCurr}`; this.hpCurrLabel.node.active = true; }
        if (this.hpNextLabel) { this.hpNextLabel.string = `+${hpNext}`; this.hpNextLabel.node.active = true; }
        if (this.starLabel && item) { this.starLabel.string = `${item.star}`; this.starLabel.node.active = true; }
        if (this.iconSprite && cfg && cfg.iconFrameName) {
            const iconName = cfg.iconFrameName;
            if (this.iconSprite.spriteAtlas) {
                const frame = this.iconSprite.spriteAtlas.getSpriteFrame(iconName) || this.iconSprite.spriteAtlas.getSpriteFrame(iconName + '.png');
                if (frame) { this.iconSprite.spriteFrame = frame; return; }
            }
            resources.load('img/hall/watchtower', SpriteAtlas, (err, atlas) => {
                if (err || !atlas) return;
                const frame = atlas.getSpriteFrame(iconName) || atlas.getSpriteFrame(iconName + '.png');
                if (frame) { this.iconSprite.spriteAtlas = atlas; this.iconSprite.spriteFrame = frame; }
            });
        }
        if (this.iconSprite && this.iconSprite.node && this.iconSprite.node.isValid) {
            try { (this.iconSprite as any).sizeMode = (Sprite as any).SizeMode?.CUSTOM ?? (this.iconSprite as any).sizeMode; } catch {}
            const ui = this.iconSprite.node.getComponent(UITransform) || this.iconSprite.node.addComponent(UITransform);
            ui.setContentSize(381, 546);
        }
        this.refreshStars(item?.star || 0);
        this.updateMaterialLabels(this._currentTowerId);
        if (this.upgradeButton) {
            const owned = !!item && !!item.isOwned;
            this.upgradeButton.interactable = owned;
        }
    }

    private refreshStars(starCount: number): void {
        // 优先按结构 Star1..Star6 下的子节点 Watchtower_31 开关显示
        if (this._starBrightNodes && this._starBrightNodes.length > 0) {
            for (let i = 0; i < this._starBrightNodes.length; i++) {
                const n = this._starBrightNodes[i];
                if (!n) continue;
                n.active = i < starCount;
            }
            return;
        }
        // 兜底：无亮星子节点时，用帧切换方式点亮
        if (!this._starSprites || this._starSprites.length === 0) return;
        const apply = () => {
            for (let i = 0; i < this._starSprites.length; i++) {
                const s = this._starSprites[i];
                if (!s) continue;
                if (i < starCount && this._brightStarFrame) {
                    s.spriteFrame = this._brightStarFrame;
                } else {
                    s.spriteFrame = this._starGrayFrames[i] || s.spriteFrame;
                }
            }
        };
        if (this._brightStarFrame) { apply(); return; }
        resources.load('img/hall/watchtower', SpriteAtlas, (err, atlas) => {
            if (err || !atlas) { apply(); return; }
            this._brightStarFrame = atlas.getSpriteFrame('Watchtower_31') || atlas.getSpriteFrame('Watchtower_31.png');
            apply();
        });
    }

    public onClickStarUp(): void {
        if (!this._currentTowerId) return;
        const ok = UserWatchtowerData.getInstance().starUpPartner(this._currentTowerId);
        if (ok) this.refreshView();
    }

    public async onClickUpgrade(): Promise<void> {
        if (!this._currentTowerId) return;
        const userData = UserWatchtowerData.getInstance();
        if (!userData.isWatchtowerOwned(this._currentTowerId)) {
            console.warn('[WatchtowerUpgrade] 未拥有该哨塔，无法升级');
            return;
        }
        try {
            const resp = await towerAPI.upgradeTowerByConfigId(this._currentTowerId);
            if (resp && resp.code === 200) {
                const ok = UserWatchtowerData.getInstance().upgradePartner(this._currentTowerId);
                if (ok) this.refreshView();
                this.updateMaterialLabels(this._currentTowerId);
            } else if (resp && resp.code !== 200) {
                console.warn(`[WatchtowerUpgrade] 升级失败: code=${resp.code} msg=${resp.msg}`);
            }
        } catch (e) {
            console.error(e);
        }
    }

    private formatMaterialKey(key: string): string {
        const map: Record<string, string> = {
            'watchtower_wood': '木材',
            'currency_gold': '金币',
            'watchtower_magic_stone': '魔法石'
        };
        return map[key] || key;
    }

    private updateMaterialLabels(id: number | null): void {
        if (!id) return;
        towerAPI.getTowerDetailByConfigId(id).then(resp => {
            if (!resp || resp.code !== 200 || !resp.data) return;
            const data = resp.data as any;
            let upgradeStr = '';
            try {
                const raw = data.upgrade;
                const obj = typeof raw === 'string' ? JSON.parse(raw) : (raw || {});
                const parts: string[] = [];
                Object.keys(obj).forEach(k => {
                    const v = obj[k];
                    parts.push(`${this.formatMaterialKey(k)} x${v}`);
                });
                upgradeStr = parts.join('，');
            } catch (_) {}
            const nextFragment = data.nextFragment;
            if (this.upgradeMaterialsLabel) {
                this.upgradeMaterialsLabel.string = upgradeStr || '';
                this.upgradeMaterialsLabel.node.active = true;
            }
            if (this.fragmentNeedLabel && nextFragment !== undefined && nextFragment !== null) {
                this.fragmentNeedLabel.string = `${nextFragment}`;
                this.fragmentNeedLabel.node.active = true;
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
}


