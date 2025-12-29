import { Color } from 'cc';
import { SpriteAtlas } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node, Button } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PlayerFrame')
export class PlayerFrame extends Component {

    @property(Sprite)
    public frameSprite: Sprite = null;

    //头像框 图集
    @property(SpriteAtlas)
    public frameAtlas: SpriteAtlas = null;

    //头像框id  string
    @property(String)
    public frameId: string = "eq_fr_0";

    //被选中 node   
    @property(Node)
    public selectedNode: Node = null;

    // //新 标记 
    // @property(Node)
    // public newTag: Node = null;

    // 点击回调函数
    private _onClickCallback: (frameId: string) => void = null;

    onLoad() {
        this.setFrame(this.frameId);
        this.setSelected(false);
        this.setNewTag(false);
        
        // 绑定点击事件
        const button = this.getComponent(Button);
        if (button) {
            button.node.on(Button.EventType.CLICK, this.onClick, this);
        }
    }

    //frameId 设置头像框
    public setFrame(frameId: string) {
        //图集没有，或者参数 为""  和 undefined
        if(!this.frameAtlas || frameId == "" || frameId == undefined){ 
            return;
        }

        const frameSpriteFrame = this.frameAtlas.getSpriteFrame(frameId);
        if(frameSpriteFrame){
            this.frameSprite.spriteFrame = frameSpriteFrame;
            this.frameId = frameId;
        }
    }

    //设置被选中
    public setSelected(isSelected: boolean){
        this.selectedNode.active = isSelected;
    }

    //设置新 标记
    public setNewTag(isNew: boolean){
        // this.newTag.active = isNew;
    }

    /**
     * 设置点击回调函数
     * @param callback 回调
     */
    public setOnClickCallback(callback: (frameId: string) => void) {
        this._onClickCallback = callback;
    }

    /**
     * 点击事件处理
     */
    private onClick() {
        if (this._onClickCallback) {
            this._onClickCallback(this.frameId);
        }
    }
}