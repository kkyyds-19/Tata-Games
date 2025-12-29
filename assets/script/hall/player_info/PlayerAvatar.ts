import { Color } from 'cc';
import { SpriteAtlas } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node, Button } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PlayerAvatar')
export class PlayerAvatar extends Component {

    @property(Sprite)
    public playerInfoBg: Sprite = null;

    @property(Sprite)
    public playerAvatar: Sprite = null;

    //用户头像 图集1
    @property(SpriteAtlas)
    public playerAvatarAtlas: SpriteAtlas = null;

    //用户头像id  string   默认 h_3_0_0
    @property(String)
    public iconFrameName: string = "h_3_0_0";

    //被选中 node   
    @property(Node)
    public selectedNode: Node = null;

    //新 标记 
    @property(Node)
    public newTag: Node = null;

    // 点击回调函数
    private _onClickCallback: (avatar: string, iconFrameName: string) => void = null;

    onLoad() {
        this.setAvatar(this.iconFrameName)
        this.setSelected(false);
        this.setNewTag(false);
        
        // 绑定点击事件
        const button = this.getComponent(Button);
        if (button) {
            button.node.on(Button.EventType.CLICK, this.onClick, this);
        }
    }

    // 设置头像背景颜色
    public setBgColor(color: string) {
        this.playerInfoBg.color = new Color(color);
    }

    //获取头像 和 背景信息
    public getAvatarInfo(){
        return {
            iconFrameName: this.iconFrameName,
            color: this.playerInfoBg.color.toString()
        }
    }

    //iconFrameName 设置头像
    public setAvatar(iconFrameName: string) {
        
       //图集没有，或者参数 为""  和 undefined
        if(!this.playerAvatarAtlas || iconFrameName == "" || iconFrameName == undefined){ 
            return;
        }

        const avatarFrame = this.playerAvatarAtlas.getSpriteFrame(iconFrameName);
        if(avatarFrame){
            this.playerAvatar.spriteFrame = avatarFrame;
            this.iconFrameName = iconFrameName;
        }
    }

    //设置被选中
    public setSelected(isSelected: boolean){
        this.selectedNode.active = isSelected;
    }

    //设置新 标记
    public setNewTag(isNew: boolean){
        this.newTag.active = isNew;
    }

    /**
     * 设置点击回调函数
     * @param callback 回调
     */
    public setOnClickCallback(callback: (avatar: string, iconFrameName: string) => void) {
        this._onClickCallback = callback;
    }

    /**
     * 点击事件处理
     */
    private onClick() {
        if (this._onClickCallback) {
            this._onClickCallback(this.iconFrameName, this.iconFrameName);
        }
    }
}