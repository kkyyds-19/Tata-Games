import { Color } from 'cc';
import { EditBox } from 'cc';
import { Button } from 'cc';
import { SpriteAtlas } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { UserInfoData } from '../../user/UserInfoData';
import { userAPI } from '../../api/API';
import { director } from 'cc';
import { game } from 'cc';

const { ccclass, property } = _decorator;

//用户头像框
@ccclass('PlayerNameEdit')
export class PlayerNameEdit extends Component {

   
    //输入框
    @property(EditBox)
    public input: EditBox = null;

    //免费 确认按钮
    @property(Button)
    public confirmButton_free: Button = null;

    //钻石 确认按钮
    @property(Button)
    public confirmButton_diamond: Button = null;

    //关闭按钮
    @property(Button)
    public closeButton: Button = null;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, ()=>{}, this);
        this.input.string = UserInfoData.getInstance().getUserName();
        
        // 绑定按钮事件
        this.confirmButton_free.node.on(Button.EventType.CLICK, this.onConfirmFree, this);
        this.confirmButton_diamond.node.on(Button.EventType.CLICK, this.onConfirmDiamond, this);
        this.closeButton.node.on(Button.EventType.CLICK, this.hide, this);
    }

    //显示面板
    public show(){  
        this.node.active = true;
        this.input.string = UserInfoData.getInstance().getUserName();
    }

    //隐藏面板
    public hide(){
        this.node.active = false;
    }

    // 免费确认按钮事件
    private async onConfirmFree() {
        await this.updateNickname();
    }

    // 钻石确认按钮事件
    private async onConfirmDiamond() {
        await this.updateNickname();
    }

    // 更新昵称
    private async updateNickname() {
        const newNickname = this.input.string.trim();
        
        if (!newNickname) {
            console.warn('昵称不能为空');
            return;
        }

        try {
            // 调用API更新昵称
            await userAPI.updateNickname(newNickname);
            
            // 保存到本地数据
            UserInfoData.getInstance().setUserName(newNickname);
            
            console.log('昵称更新成功:', newNickname);
            
            // 隐藏面板
            this.hide();
            
        } catch (error) {
            console.error('昵称更新失败:', error);
        }
    }
}