import { _decorator, Component, Sprite, Label, Color } from 'cc';
import { MusicManager } from '../../music/MusicManager';
import { sys } from 'cc';
import { director } from 'cc';
import { game } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AcMenu')
export class AcMenu extends Component {

    @property(Sprite)
    icon: Sprite = null;

    @property(Label)
    nameLabel: Label = null;

   
    id: number = 0;

    private originalColor: Color = Color.WHITE.clone();

    onLoad() {
        // 保存原始颜色
        if (this.icon) {
            this.originalColor = this.icon.color.clone();
        }

        if (this.nameLabel) {
            this.nameLabel.enableOutline=true
            if (sys.platform === sys.Platform.ANDROID) {
                this.nameLabel.outlineWidth = 2.5;
            } else if (sys.platform === sys.Platform.IOS) {
                this.nameLabel.outlineWidth = 0.75;
            } else {
                this.nameLabel.outlineWidth = 2.5;
            }
        }

        //更具手机平台 设置字体描边

    }

    /**
     * 设置灰色
     */
    setGray() {
        if (this.icon) {
            this.icon.color = Color.GRAY.clone();
        }
        if (this.nameLabel) {
            this.nameLabel.color = Color.GRAY.clone();
        }
    }

    /**
     * 恢复原始颜色
     */
    setNormal() {
        if (this.icon) {
            this.icon.color = this.originalColor.clone();
        }
        if (this.nameLabel) {
            this.nameLabel.color = Color.WHITE.clone();
        }
    }

    /**
     * 显示菜单
     */
    show() {
        this.node.active = true;
        this.node.setScale(1, 1);
    }

    /**
     * 隐藏菜单
     */
    hide() {
        this.node.active = false;
    }

    /**
     * 设置图标精灵
     * @param spriteFrame 精灵帧
     */
    setIcon(frameName: string) {
        if (this.icon && frameName) {
            this.icon.spriteFrame = this.icon.spriteAtlas.getSpriteFrame(frameName);
        }
    }

    /**
     * 设置名称文本
     * @param text 文本内容
     */
    setName(text: string) {
        if (this.nameLabel) {
            this.nameLabel.string = text;
        }
    }

    onClick() {
        console.log('onClick', this.nameLabel.string);
        director.emit(game.gameEvent.GAME_ACTIVITY_MENU_CLICK, this.id);
        MusicManager.getInstance().playButtonClickSound();
    }

    /**
     * 设置菜单是否可交互
     * @param interactable 是否可交互
     */
    setInteractable(interactable: boolean) {
        // 如果不可交互，设置为灰色
        if (!interactable) {
            this.setGray();
        } else {
            this.setNormal();
        }
    }
}
