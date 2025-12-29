import { _decorator, Component, Node, Sprite, Label, SpriteFrame, resources, SpriteAtlas } from 'cc';
import { watchtowerConfigs, WatchtowerConfig } from '../../global/config/WatchtowerConfig';
import { UserWatchtowerData, UserWatchtowerItem } from '../../user/UserWatchtowerData';

const { ccclass, property } = _decorator;

@ccclass('watchtowerSmallIcon')
export class watchtowerSmallIcon extends Component {
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

    private _towerId: number = 0;
    private _towerConfig: WatchtowerConfig = null;
    private _towerData: UserWatchtowerItem = null;
    private _onClickCallback: (towerId: number) => void = null;

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
        this._towerData = UserWatchtowerData.getInstance().getWatchtower(this._towerId);
        
        this.node.active = true;
        this.node.off(Node.EventType.TOUCH_END, this.onClick, this);
        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
        this.refresh();
    }
    
    /**
     * 设置点击回调
     * @param callback 回调函数
     */
    public setOnClickCallback(callback: (towerId: number) => void) {
        this._onClickCallback = callback;
    }

    public onClick(event?: Event, customEventData?: string) {
        const idFromCustom = Number(customEventData);
        const targetId = (!isNaN(idFromCustom) && idFromCustom > 0) ? idFromCustom : this._towerId;
        if (this._onClickCallback && targetId) {
            this._onClickCallback(targetId);
        }
    }

    public refresh(): void {
        this.updateIconSprite();
        this.updateQualitySprite();
        this.updateLevel();
        this.updateStatus();
    }

    public clear(): void {
        this._towerId = 0;
        this._towerConfig = null;
        this._towerData = null;
        if (this.iconSprite) this.iconSprite.spriteFrame = null;
        if (this.qualitySprite) this.qualitySprite.spriteFrame = null;
        if (this.levelLabel) {
            this.levelLabel.string = '';
            this.levelLabel.node.active = false;
        }
        if (this.equippedNode) this.equippedNode.active = false;
        if (this.synergizedNode) this.synergizedNode.active = false;
        if (this.selectedNode) this.selectedNode.active = false;
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
        if (this._towerData && this._towerData.isOwned) {
            this.levelLabel.string = `Lv.${this._towerData.level}`;
            this.levelLabel.node.active = true;
        } else {
            if (this.levelLabel) this.levelLabel.node.active = false;
        }
    }

    private updateStatus(): void {
        const userData = UserWatchtowerData.getInstance();
        const isEquipped = userData.getEquippedWatchtowerIds().indexOf(this._towerId) !== -1;
        const isSynergized = userData.getSynergizedWatchtowerIds().indexOf(this._towerId) !== -1;
        
        if (this.equippedNode) {
            this.equippedNode.active = isEquipped;
        }
        if (this.synergizedNode) {
            this.synergizedNode.active = isSynergized;
        }
    }
}


