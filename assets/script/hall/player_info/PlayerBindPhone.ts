import { Color } from 'cc';
import { EditBox } from 'cc';
import { Button } from 'cc';
import { SpriteAtlas } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { UserInfoData } from '../../user/UserInfoData';
import { Label } from 'cc';

const { ccclass, property } = _decorator;

//用户头像框
@ccclass('PlayerBindPhone')
export class PlayerBindPhone extends Component {

   
    //手机号输入框
    @property(EditBox)
    public phoneInput: EditBox = null;

    //验证码输入框
    @property(EditBox)
    public codeInput: EditBox = null;

    // 绑定按钮
    @property(Button)
    public bindButton: Button = null;

    // 发送验证码按钮
    @property(Button)
    public sendCodeButton: Button = null;

    //验证码倒计时
    @property(Label)    
    public codeCountdown: Label = null;

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



}