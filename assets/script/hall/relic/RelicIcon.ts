import { _decorator, Component, Node, Label, Sprite, SpriteFrame, SpriteAtlas } from 'cc';
import { RelicConfig, relicSetConfigs } from '../../global/config/RelicConfig';

const { ccclass, property } = _decorator;

@ccclass('RelicIcon')
export class RelicIcon extends Component {

    @property({ type: Label, tooltip: "装备位置" })
    public posLabel: Label = null;

    @property({ type: Sprite, tooltip: "圣物图标" })
    public relicIcon: Sprite = null;

    @property({ type: SpriteAtlas, tooltip: "圣物图集" })
    public relicAtlas: SpriteAtlas = null;

    @property({ type: [Sprite], tooltip: "套装图标, 最多3个" })
    public setIconSprites: Sprite[] = [];

    @property({ type: SpriteAtlas, tooltip: "套装图集" })
    public setAtlas: SpriteAtlas = null;

    @property({ type: Node, tooltip: "新获取提示" })
    public newNode: Node = null;

    @property({ type: Node, tooltip: "已装备" })
    public equippedNode: Node = null;

    @property({ type: Node, tooltip: "选中提示" })
    public selectedNode: Node = null;

    private _relicData: RelicConfig = null;
    private _onClickCallback: (relicId: number) => void = null;

    public get relicData(): RelicConfig {
        return this._relicData;
    }

    onLoad() {
      
    }

    public init(relicData: RelicConfig) {
        this._relicData = relicData;
        this.updateView();
    }

    /**
     * 设置已装备状态
     * @param isEquipped 是否已装备
     */
    public setEquipped(isEquipped: boolean) {
        if (this.equippedNode) {
            this.equippedNode.active = isEquipped;
        }
    }



    /**
     * 设置点击回调
     * @param callback 回调函数
     */
    public setOnClickCallback(callback: (relicId: number) => void) {
        this._onClickCallback = callback;
    }

    private onClick() {
        console.log('onClick', this._relicData.id);

        if (this._onClickCallback && this._relicData) {
            this._onClickCallback(this._relicData.id);
        }
    }

    private updateView() {
        if (!this._relicData) {
            this.clear();
            return;
        }

        this.node.active = true;

        if (this.posLabel) {
            this.posLabel.string = this._relicData.position.toString();
        }

        // 更新圣物图标
        if (this.relicIcon && this.relicAtlas && this._relicData.iconFrameName) {
            const spriteFrame = this.relicAtlas.getSpriteFrame(this._relicData.iconFrameName);
            if (spriteFrame) {
                this.relicIcon.spriteFrame = spriteFrame;
            } else {
                console.warn(`[RelicIcon] 在圣物图集中未找到图标: ${this._relicData.iconFrameName}`);
                this.relicIcon.spriteFrame = null;
            }
        }
        
        // 更新套装图标
        if (this.setIconSprites) {
            this.setIconSprites.forEach(sprite => sprite.node.active = false);
            const setIds = this._relicData.setIds;
            if (this.setAtlas && setIds && setIds.length > 0) {
                setIds.slice(0, this.setIconSprites.length).forEach((setId, index) => {
                    const setConfig = relicSetConfigs.find(c => c.id === setId);
                    if (setConfig) {
                        const setIconSprite = this.setIconSprites[index];
                        const spriteFrame = this.setAtlas.getSpriteFrame(setConfig.icon);
                        if (spriteFrame) {
                            setIconSprite.spriteFrame = spriteFrame;
                            setIconSprite.node.active = true;
                        } else {
                            console.warn(`[RelicIcon] 在套装图集中未找到图标: ${setConfig.icon}`);
                        }
                    }
                });
            }
        }
    }

    /**
     * 清除显示
     */
    public clear() {
        this._relicData = null;
        if(this.relicIcon) this.relicIcon.spriteFrame = null;
        if(this.posLabel) this.posLabel.string = "";
        this.setIconSprites.forEach(s => {
            s.spriteFrame = null;
            s.node.active = false;
        });
        this.setNew(false);
        this.setSelected(false);
        this.setEquipped(false);
        this.node.active = false;
    }

    /**
     * 设置新获取状态
     * @param isNew 是否新获取
     */
    public setNew(isNew: boolean) {
        if (this.newNode) {
            this.newNode.active = isNew;
        }
    }

    /**
     * 设置选中状态
     * @param isSelected 是否选中
     */
    public setSelected(isSelected: boolean) {
        if (this.selectedNode) {
            this.selectedNode.active = isSelected;
        }
    }

    onDestroy() {
        
    }
}
