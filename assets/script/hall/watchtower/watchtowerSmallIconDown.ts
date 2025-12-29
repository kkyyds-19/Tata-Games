import { _decorator, Component, Node, Sprite, Label, SpriteFrame, resources, SpriteAtlas, director, Layout } from 'cc';
import { watchtowerConfigs, WatchtowerConfig } from '../../global/config/WatchtowerConfig';
import { UserWatchtowerData, UserWatchtowerItem } from '../../user/UserWatchtowerData';
import { game } from 'cc';
import { ShowToast } from '../../global/Toast';
import { towerAPI } from '../../api/TowerAPI';
import { TowerInfo, APIResponse } from '../../api/APITypes';

const { ccclass, property } = _decorator;

@ccclass('watchtowerSmallIconDown')
export class watchtowerSmallIconDown extends Component {
  @property(Sprite)
    public qualitySprite: Sprite = null;

    @property(Sprite)
    public iconSprite: Sprite = null;

    @property(Label)
    public levelLabel: Label = null;

    @property(Node)
    public synergizedNode: Node = null;

    @property(Node)
    public equippedNode: Node = null;

    @property({type: Node, tooltip: "选中提示"})
    public selectedNode: Node = null;

    @property({type: Sprite, tooltip: "未获得遮罩/占位图（自行在编辑器绑定）"})
    public unownedSprite: Sprite = null;

    @property({type: Label, tooltip: "未获得时显示的碎片数量文本（fragment）"})
    public fragmentLabel: Label = null;

    @property({type: Layout})
    public starLayout: Layout = null;

    private _towerId: number = 0;
    private _towerConfig: WatchtowerConfig = null;
    private _towerData: UserWatchtowerItem = null;
    private _onClickCallback: (towerId: number) => void = null;
    private _serverItem: TowerInfo | null = null;

    private static _listCache: TowerInfo[] | null = null;
    private static _lastFetchTime: number = 0;
    private static readonly CACHE_MS: number = 10000;

    public get towerId(): number {
        return this._towerId;
    }

    public init(towerId: number | null): void {
        if (!towerId) {
            this.clear();
            return;
        }

        this._towerId = towerId;
        this._towerConfig = watchtowerConfigs.find(p => p.id === this._towerId);
        this._towerData = null;
        
        this.node.active = true;
        this.node.off(Node.EventType.TOUCH_END, this.onClick, this);
        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
        this.loadServerAndRefresh();
    }
    
    /**
     * 设置点击回调
     * @param callback 回调函数
     */
    public setOnClickCallback(callback: (towerId: number) => void) {
        this._onClickCallback = callback;
    }

    private onClick() {
        const owned = this.isOwnedByServer();
        if (!owned) {
            ShowToast('未获得此哨塔');
            return;
        }
        if (this._onClickCallback && this._towerId) {
            this._onClickCallback(this._towerId);
        }
        try { director.emit(game.gameEvent.GAME_WATCHTOWER_UPGRADE_PAGE_SHOW, this._towerId); } catch {}
    }

    // 供编辑器按钮事件绑定：CustomEventData 传入哨塔ID（如 10012），不传则使用当前组件的 towerId
    public onClickOpenUpgrade(event: Event, customEventData: string): void {
        const id = Number(customEventData);
        const targetId = (!isNaN(id) && id > 0) ? id : this._towerId;
        const owned = UserWatchtowerData.getInstance().isWatchtowerOwned(targetId);
        if (!owned) {
            ShowToast('未获得此哨塔');
            return;
        }
        try { director.emit(game.gameEvent.GAME_WATCHTOWER_UPGRADE_PAGE_SHOW, targetId); } catch {}
    }

    public refresh(): void {
        this.updateIconSprite();
        this.updateQualitySprite();
        this.updateLevel();
        this.updateStatus();
        this.updateOwnedOverlayAndFragment();
        this.updateStarLayout();
    }

    public clear(): void {
        this._towerId = 0;
        this._towerConfig = null;
        this._towerData = null;
        this._serverItem = null;
        if (this.iconSprite) this.iconSprite.spriteFrame = null;
        if (this.qualitySprite) this.qualitySprite.spriteFrame = null;
        if (this.levelLabel) {
            this.levelLabel.string = '';
            this.levelLabel.node.active = false;
        }
        if (this.equippedNode) this.equippedNode.active = false;
        if (this.synergizedNode) this.synergizedNode.active = false;
        if (this.selectedNode) this.selectedNode.active = false;
        if (this.unownedSprite) this.unownedSprite.node.active = false;
        if (this.fragmentLabel) {
            this.fragmentLabel.string = '';
            this.fragmentLabel.node.active = false;
        }
        if (this.starLayout && this.starLayout.node) {
            const children = this.starLayout.node.children || [];
            for (let i = 0; i < children.length; i++) {
                children[i].active = false;
            }
            this.starLayout.node.active = false;
        }
        this.node.active = false;
    }
    
    public setSelected(isSelected: boolean) {
        if (this.selectedNode) {
            this.selectedNode.active = isSelected;
        }
    }

    private updateIconSprite(): void {
        if (!this.iconSprite || !this.iconSprite.isValid) return;

        const iconName = this._towerConfig ? this._towerConfig.iconFrameName : null;
        if (!iconName) return;
        if (this.iconSprite.spriteAtlas) {
            const spriteFrame = this.iconSprite.spriteAtlas.getSpriteFrame(iconName);
            if (spriteFrame) {
                this.iconSprite.spriteFrame = spriteFrame;
                return;
            }
        }
        resources.load('img/hall/watchtower', SpriteAtlas, (err, atlas) => {
            if (err || !atlas) return;
            const frame = atlas.getSpriteFrame(iconName) || atlas.getSpriteFrame(iconName + '.png');
            if (frame) {
                this.iconSprite.spriteAtlas = atlas;
                this.iconSprite.spriteFrame = frame;
            }
        });
    }

    private updateQualitySprite(): void {
        if (!this.qualitySprite || !this.qualitySprite.isValid) return;

        const qualityValue = this._towerConfig ? this._towerConfig.quality : null;
        if (qualityValue === null || qualityValue === undefined) return;
        const qualityFrameName = `class_rec_${qualityValue}`;
        if (this.qualitySprite.spriteAtlas) {
            const frame = this.qualitySprite.spriteAtlas.getSpriteFrame(qualityFrameName);
            if (frame) {
                this.qualitySprite.spriteFrame = frame;
                return;
            }
        }
        resources.load('img/icons/class_icons', SpriteAtlas, (err, atlas) => {
            if (err || !atlas) return;
            const frame = atlas.getSpriteFrame(qualityFrameName) || atlas.getSpriteFrame(qualityFrameName + '.png');
            if (frame) {
                this.qualitySprite.spriteAtlas = atlas;
                this.qualitySprite.spriteFrame = frame;
            }
        });
    }

    private updateLevel(): void {
        const owned = this.isOwnedByServer();
        if (owned) {
            const levelVal = this._serverItem?.level ?? 1;
            if (this.levelLabel) {
                this.levelLabel.string = `Lv.${levelVal}`;
                this.levelLabel.node.active = true;
            }
        } else {
            if (this.levelLabel) this.levelLabel.node.active = false;
        }
    }

    private updateStatus(): void {
        const userData = UserWatchtowerData.getInstance();
        const isEquipped = userData.getEquippedWatchtowerIds().indexOf(this._towerId) !== -1;
        const isSynergized = userData.getSynergizedWatchtowerIds().indexOf(this._towerId) !== -1;
        if (this.equippedNode) this.equippedNode.active = !!isEquipped;
        if (this.synergizedNode) this.synergizedNode.active = !!isSynergized;
    }

    private updateOwnedOverlayAndFragment(): void {
        const owned = this.isOwnedByServer();
        if (this.unownedSprite) this.unownedSprite.node.active = !owned;
        if (this.fragmentLabel) {
            const frag = this._serverItem?.fragment ?? null;
            if (!owned && frag !== null && frag !== undefined) {
                this.fragmentLabel.string = `${frag}/30`;
                this.fragmentLabel.node.active = true;
            } else {
                this.fragmentLabel.string = '';
                this.fragmentLabel.node.active = false;
            }
        }
    }

    private isOwnedByServer(): boolean {
        const starVal = this._serverItem?.star ?? null;
        return starVal !== null && starVal !== undefined;
    }

    private async loadServerAndRefresh(): Promise<void> {
        try {
            const now = Date.now();
            const needFetch = !watchtowerSmallIconDown._listCache || (now - watchtowerSmallIconDown._lastFetchTime) > watchtowerSmallIconDown.CACHE_MS;
            if (needFetch) {
                const resp = await towerAPI.getTowerList();
                if (resp && (resp.code === 200 || resp.code === 0)) {
                    watchtowerSmallIconDown._listCache = resp.data || [];
                    watchtowerSmallIconDown._lastFetchTime = now;
                } else {
                    ShowToast(resp?.msg || '获取哨塔列表失败');
                }
            }
            const list = watchtowerSmallIconDown._listCache || [];
            const key = this._towerConfig?.iconFrameName;
            this._serverItem = list.find(i => i.watchtowerKey === key) || null;
            this.refresh();
        } catch {
            this._serverItem = null;
            this.refresh();
        }
    }

    private updateStarLayout(): void {
        if (!this.starLayout || !this.starLayout.node || !this.starLayout.node.isValid) return;
        const owned = this.isOwnedByServer();
        const count = owned ? Number(this._serverItem?.star || 0) : 0;
        const container = this.starLayout.node;
        const children = container.children || [];
        for (let i = 0; i < children.length; i++) {
            children[i].active = i < count;
        }
        container.active = owned && count > 0;
    }
}


