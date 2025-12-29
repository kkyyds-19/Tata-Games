import { Color } from 'cc';
import { EditBox } from 'cc';
import { Button } from 'cc';
import { SpriteAtlas } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { UserInfoData } from '../../user/UserInfoData';

const { ccclass, property } = _decorator;

//用户头像框
@ccclass('PlayerAgreement')
export class PlayerAgreement extends Component {

   
   

    onLoad() {

        this.node.on(Node.EventType.TOUCH_START, ()=>{
            
        }, this);
    }

    //显示面板
    public show(event:Event){  
        this.node.active = true;
        console.log('PlayerAgreement show',event);
    }

    //隐藏面板
    public hide(){
        this.node.active = false;
    }



}