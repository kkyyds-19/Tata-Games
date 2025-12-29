import { Color } from 'cc';
import { EditBox } from 'cc';
import { Button } from 'cc';
import { SpriteAtlas } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { UserInfoData } from '../../user/UserInfoData';
import { Label } from 'cc';
import { System } from 'cc';
import { getClipboardText } from '../../utils/clipboard-utils';

const { ccclass, property } = _decorator;

//用户头像框
@ccclass('PlayerGiftCode')
export class PlayerGiftCode extends Component {

   
    //礼包码输入框
    @property(EditBox)
    public giftCodeInput: EditBox = null;


    // 确定按钮
    @property(Button)
    public confirmButton: Button = null;

    //黏贴按钮
    @property(Button)
    public pasteButton: Button = null;


    onLoad() {

        this.node.on(Node.EventType.TOUCH_START, ()=>{}, this);
    }

    //显示面板
    public show(){  
        this.node.active = true;
    }

    //隐藏面板
    public hide(){
        this.node.active = false;
    }


    public onConfirmButtonClick(){
        console.log('onConfirmButtonClick');
    }

    //黏贴 礼品码
    public async onPasteButtonClick(){
        console.log('onPasteButtonClick');
        //访问剪贴板
        const text = await getClipboardText()

        if (text && text.trim() !== '') {
            this.giftCodeInput.string = text;
            this.giftCodeInput.node.active = true;
            console.log('粘贴成功:', text);
        } else {
            console.warn('剪贴板为空或读取失败');
        }


        // console.log('text',text);
        // this.giftCodeInput.string = text;
        // this.giftCodeInput.node.active = true;
    }


}