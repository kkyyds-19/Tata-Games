import { _decorator, Component, Node, Sprite, Label, SpriteFrame, resources, SpriteAtlas } from 'cc';
import { partnerConfigs, PartnerConfig } from '../../global/config/PartnerConfig';
import { UserPartnerData, UserPartnerItem } from '../../user/UserPartnerData';

const { ccclass, property } = _decorator;

@ccclass('PartnerIcon')
export class PartnerIcon extends Component {

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

    private _partnerId: number = 0;
    private _partnerConfig: PartnerConfig = null;
    private _partnerData: UserPartnerItem = null;
    private _onClickCallback: (partnerId: number) => void = null;

    public get partnerId(): number {
        return this._partnerId;
    }

    public init(partnerId: number | null): void {
        if (!partnerId) {
            this.clear();
            return;
        }

        this._partnerId = partnerId;
        this._partnerConfig = partnerConfigs.find(p => p.id === this._partnerId);
        this._partnerData = UserPartnerData.getInstance().getPartner(this._partnerId);

        if (!this._partnerData) {
            this.node.active = false;
            return;
        }
        
        this.node.active = true;
        this.node.off(Node.EventType.TOUCH_END, this.onClick, this);
        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
        this.refresh();
    }
    
    /**
     * 设置点击回调
     * @param callback 回调函数
     */
    public setOnClickCallback(callback: (partnerId: number) => void) {
        this._onClickCallback = callback;
    }

    private onClick() {
        if (this._onClickCallback && this._partnerId) {
            this._onClickCallback(this._partnerId);
        }
    }

    public refresh(): void {
        if (!this._partnerData) {
            return;
        }

        this.updateIconSprite();
        this.updateQualitySprite();
        this.updateLevel();
        this.updateStatus();
    }

    public clear(): void {
        this._partnerId = 0;
        this._partnerConfig = null;
        this._partnerData = null;
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

        const iconName = (this._partnerData && this._partnerData.nameAs) ? this._partnerData.nameAs : (this._partnerConfig ? this._partnerConfig.iconFrameName : null);
        if (!iconName) return;
        if (this.iconSprite.spriteAtlas) {
            const spriteFrame = this.iconSprite.spriteAtlas.getSpriteFrame(iconName);
            if (spriteFrame) {
                this.iconSprite.spriteFrame = spriteFrame;
                return;
            }
        }
        resources.load('img/icons/Partner_1', SpriteAtlas, (err, atlas) => {
            if (!err && atlas) {
                const frame = atlas.getSpriteFrame(iconName) || atlas.getSpriteFrame(iconName + '.png');
                if (frame) {
                    this.iconSprite.spriteAtlas = atlas;
                    this.iconSprite.spriteFrame = frame;
                    return;
                }
            }
            resources.load('img/icons/hero_icons', SpriteAtlas, (err2, fallbackAtlas) => {
                if (err2 || !fallbackAtlas) return;
                const frame2 = fallbackAtlas.getSpriteFrame(iconName) || fallbackAtlas.getSpriteFrame(iconName + '.png');
                if (frame2) {
                    this.iconSprite.spriteAtlas = fallbackAtlas;
                    this.iconSprite.spriteFrame = frame2;
                }
            });
        });
    }

    private updateQualitySprite(): void {
        if (!this.qualitySprite || !this.qualitySprite.isValid) return;

        const qualityValue = (this._partnerData && typeof this._partnerData.quality === 'number') ? this._partnerData.quality : (this._partnerConfig ? this._partnerConfig.quality : null);
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
        if (this._partnerData.isOwned) {
            this.levelLabel.string = `Lv.${this._partnerData.level}`;
            this.levelLabel.node.active = true;
        } else {
            this.levelLabel.node.active = false;
        }
    }

    private updateStatus(): void {
        const userData = UserPartnerData.getInstance();
        const isEquipped = userData.getEquippedPartnerIds().indexOf(this._partnerId) !== -1;
        const isSynergized = userData.getSynergizedPartnerIds().indexOf(this._partnerId) !== -1;
        
        if (this.equippedNode) {
            this.equippedNode.active = isEquipped;
        }
        if (this.synergizedNode) {
            this.synergizedNode.active = isSynergized;
        }
    }
}
