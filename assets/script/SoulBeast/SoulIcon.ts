import { _decorator, Component, Sprite, Label, SpriteAtlas, Vec3 } from 'cc';
import { soulBeastConfigs, SoulBeastConfig } from '../global/config/SoulBeastConfig';
import { UserSoulBeastData, UserSoulBeastItem } from '../user/UserSoulBeastData';

const { ccclass, property } = _decorator;

@ccclass('SoulIcon')
export class SoulIcon extends Component {
    @property(Sprite)
    public iconSprite: Sprite = null;

    @property([Sprite])
    public starSprites: Sprite[] = [];

    @property(Label)
    public nameLabel: Label = null;

    @property(Label)
    public levelLabel: Label = null;

    @property(Label)
    public shardLabel: Label = null;

    @property(Label)
    public traitLabel: Label = null;

    @property(SpriteAtlas)
    public soulBeastAtlas: SpriteAtlas = null;

    private _config: SoulBeastConfig = null;
    private _data: UserSoulBeastItem = null;

    public init(beastId: number) {
        this._config = soulBeastConfigs.find(c => c.id === beastId) || null;
        this._data = UserSoulBeastData.getInstance().getBeast(beastId);

        if (!this._config || !this._data) {
            this.node.active = false;
            return;
        }

        this.node.active = true;
        this.updateName();
        this.updateTrait();
        this.updateLevel();
        this.updateShard();
        this.updateStars();
        this.updateIcon();
    }

    private updateName() {
        if (!this.nameLabel || !this._config) {
            return;
        }
        this.nameLabel.string = this._config.name;
    }

    private updateTrait() {
        if (!this.traitLabel || !this._config) {
            return;
        }
        this.traitLabel.string = this._config.trait;
    }

    private updateLevel() {
        if (!this.levelLabel || !this._data) {
            return;
        }
        this.levelLabel.string = `Lv.${this._data.level}`;
    }

    private updateShard() {
        if (!this.shardLabel || !this._config || !this._data) {
            return;
        }
        let need = this._config.baseShardNeed;
        if (this._data.star > 0) {
            need = this._config.baseShardNeed + this._data.star * 10;
        }
        this.shardLabel.string = `${this._data.shard}/${need}`;
    }

    private updateStars() {
        if (!this._data) {
            return;
        }
        this.starSprites.forEach((sprite, index) => {
            if (!sprite) {
                return;
            }
            sprite.grayscale = index >= this._data.star;
        });
    }

    private updateIcon() {
        if (!this.iconSprite || !this.soulBeastAtlas || !this._config) {
            return;
        }
        const frame = this.soulBeastAtlas.getSpriteFrame(this._config.iconFrameName);
        if (!frame) {
            console.warn(`[SoulIcon] sprite frame not found: ${this._config.iconFrameName}`);
            return;
        }
        this.iconSprite.spriteFrame = frame;
        this.iconSprite.node.setScale(new Vec3(0.5, 0.5, 1));
    }
}


