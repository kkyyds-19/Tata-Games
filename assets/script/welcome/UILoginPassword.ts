import { _decorator, Component, Node } from 'cc';
import { UIInputMobile } from './UIInputMobile';
import { Sprite } from 'cc';
import { Toggle } from 'cc';
import { NodeEventType } from 'cc';
import { ShowToast } from '../global/Toast';
import { resManager } from '../utils/resManager';
import { GlobalVariable } from '../global/GlobalVariable';
import { EditBox } from 'cc';
import { welcomeCtrl } from './welcomeCtrl';
import { EncryptUtils } from '../utils/EncryptUtils';
const { ccclass, property } = _decorator;

@ccclass('UILoginPassword')
export class UILoginPassword extends Component {
    private uiInputMobile: UIInputMobile;
    private btn_show_password: Node;
    private btn_show_password_sp: Sprite;
    private input_password: EditBox;
    private btn_switch: Node;
    private btn_forget_password: Node;
    private btn_password_login: Node;
    private toggle_agreement: Toggle;

    private hide_password: boolean = true;

    protected onLoad(): void {
        const st = this;
        st.uiInputMobile = st.node.getChildByPath("win_bg/g_password_login/input_mobile").getComponent(UIInputMobile);
        st.btn_show_password = st.node.getChildByPath("win_bg/g_password_login/g_password/btn_show_password");
        st.btn_show_password_sp = st.btn_show_password.getChildByName("Sprite").getComponent(Sprite);
        st.btn_switch = st.node.getChildByPath("win_bg/g_password_login/btn_switch");
        st.input_password = st.node.getChildByPath("win_bg/g_password_login/g_password/input_password").getComponent(EditBox);
        st.btn_forget_password = st.node.getChildByPath("win_bg/g_password_login/btn_forget_password");
        st.btn_password_login = st.node.getChildByPath("win_bg/g_password_login/btn_password_login");
        st.toggle_agreement = st.node.getChildByPath("win_bg/g_password_login/toggle_agreement").getComponent(Toggle);
        st.btn_show_password.on(NodeEventType.TOUCH_END, st.onBtnShowPasswordClick, st);
        st.btn_switch.on(NodeEventType.TOUCH_END, st.onBtnSwitchClick, st);
        st.btn_forget_password.on(NodeEventType.TOUCH_END, st.onBtnForgetPasswordClick, st);
        st.btn_password_login.on(NodeEventType.TOUCH_END, st.onBtnPasswordLoginClick, st);
   }

    setData() {
        const st = this;
        const d = welcomeCtrl.Ins;
        st.node.active = true;
        st.uiInputMobile.setData(d.data.mobile);
        st.input_password.string = d.data.password;
        st.refreshShowPassword();
    }

    refreshShowPassword() {
        const st = this;
        resManager.setSprite(st.btn_show_password_sp, GlobalVariable.bundleRes, st.hide_password ? "img/welcome/show_password" : "img/welcome/hide_password");
        st.input_password.inputFlag = st.hide_password ? EditBox.InputFlag.PASSWORD : EditBox.InputFlag.DEFAULT;
    }

    onBtnShowPasswordClick() {
        const st = this;
        st.hide_password = !st.hide_password;
        st.refreshShowPassword();
    }

    onBtnSwitchClick() {
        ShowToast("TODO验证码登录");
    }

    onBtnForgetPasswordClick() {
        ShowToast("TODO忘记密码");
    }

    onBtnPasswordLoginClick() {
        const st = this;
        const c = welcomeCtrl.Ins;
        if (c.data.mobile.mobileNum.trim().length != 11) {
            ShowToast("手机号格式错误");
            return;
        }
        const password = st.input_password.string.trim();
        console.log(`password:${password}`);

        if (password.length < 6 || password.length > 10) {
            ShowToast("密码长度为6-10");
            return;
        }
        if (!st.toggle_agreement.isChecked) {
            ShowToast("请阅读并同意用户协议及隐私政策");
            return;
        }
        const id = c.data.mobile.zone + c.data.mobile.mobileNum;
        c.data.encryptid = EncryptUtils.Encryption(id);
        console.log(`id[${id}][${c.data.encryptid}]`);
        // c.data.password = password;
        c.data.encryptpassword = EncryptUtils.Encryption(password);
        console.log(`password[${password}][${c.data.encryptpassword}]`);
        //TODO 密码登录
    }

}


