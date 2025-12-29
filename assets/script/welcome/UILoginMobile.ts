import { _decorator, Component, Node } from 'cc';
import { UIInputMobile } from './UIInputMobile';
import { Toggle } from 'cc';
import { Label } from 'cc';
import { EditBox } from 'cc';
import { NodeEventType } from 'cc';
import { ShowToast } from '../global/Toast';
import { welcomeCtrl } from './welcomeCtrl';
import { director } from 'cc';
import { game } from 'cc';
import { Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UILoginMobile')
export class UILoginMobile extends Component {
    private g_mobile_login: Node;
    private uiInputMobile: UIInputMobile;
    private btn_switch: Node;
    private btn_sendmessage: Node;
    private toggle_agreement: Toggle;

    private g_verification_code: Node;
    private lab_send_mobile: Label;
    private input_verification_code: EditBox;
    private btn_mobile_login: Node;
    private btn_cannot_get_code: Node;
    private btn_send_again: Node;
    private lab_send_again: Label;

    private interval: number = -1;
    private nextSend: number;

    protected onLoad(): void {
        const st = this;
        st.g_mobile_login = st.node.getChildByPath("win_bg/g_mobile_login");
        st.uiInputMobile = st.g_mobile_login.getChildByPath("input_mobile").getComponent(UIInputMobile);
        st.btn_switch = st.g_mobile_login.getChildByPath("btn_switch");
        st.btn_sendmessage = st.g_mobile_login.getChildByPath("btn_sendmessage");
        st.toggle_agreement = st.g_mobile_login.getChildByPath("toggle_agreement").getComponent(Toggle);

        st.g_verification_code = st.node.getChildByPath("win_bg/g_verification_code");
        st.lab_send_mobile = st.g_verification_code.getChildByPath("lab_send_mobile").getComponent(Label);
        st.input_verification_code = st.g_verification_code.getChildByPath("g_verification_code/input_verification_code").getComponent(EditBox);
        st.btn_mobile_login = st.g_verification_code.getChildByPath("btn_mobile_login");
        st.btn_cannot_get_code = st.g_verification_code.getChildByPath("btn_cannot_get_code");
        st.btn_send_again = st.g_verification_code.getChildByPath("btn_send_again");
        st.lab_send_again = st.btn_send_again.getChildByPath("Label").getComponent(Label);
        st.btn_switch.on(NodeEventType.TOUCH_END, st.onBtnSwitchClick, st);
        st.btn_sendmessage.on(NodeEventType.TOUCH_END, st.onBtnSendMessageClick, st);
        st.btn_mobile_login.on(NodeEventType.TOUCH_END, st.onBtnMobileLoginClick, st);
        st.btn_cannot_get_code.on(NodeEventType.TOUCH_END, st.onBtnCannotGetCodeClick, st);
        st.btn_send_again.on(NodeEventType.TOUCH_END, st.onBtnSendAgainClick, st);
    }

    protected onEnable(): void {
        director.on(game.gameEvent.WELCOME_SMS_SEND_SUCCESS, this.onSMSSend, this);
    }

    protected onDisable(): void {
        director.off(game.gameEvent.WELCOME_SMS_SEND_SUCCESS, this.onSMSSend, this);
    }

    protected onDestroy(): void {
        this.clearInterval();
    }

    setData() {
        const st = this;
        const d = welcomeCtrl.Ins;
        st.g_mobile_login.active = true;
        st.g_verification_code.active = false;
        st.uiInputMobile.setData(d.data.mobile);
    }

    onBtnSwitchClick() {
        ShowToast("暂未支持其他登录方式");
        director.emit(game.gameEvent.WELCOME_SMS_SEND_SUCCESS);
    }

    onBtnSendMessageClick() {
        const st = this;
        const c = welcomeCtrl.Ins;
        if (c.data.mobile.mobileNum.trim().length != 11) {
            ShowToast("手机号格式错误");
            return;
        }
        if (!st.toggle_agreement.isChecked) {
            ShowToast("请阅读并同意用户协议、隐私政策及运营商服务协议");
            return;
        }
        this.sendSMS();
    }

    sendSMS() {
        director.emit(game.gameEvent.WELCOME_SMS_LOGIN);
    }

    onSMSSend() {
        const st = this;
        const d = welcomeCtrl.Ins;
        st.g_mobile_login.active = false;
        st.g_verification_code.active = true;
        st.lab_send_mobile.string = `${d.data.mobile.zone}${d.data.mobile.mobileNum}`;
        st.input_verification_code.string = "";
        st.clearInterval();
        st.nextSend = 60;
        st.lab_send_again.color = Color.WHITE;
        st.lab_send_again.string = `${st.nextSend.toFixed()}秒后重新发送`;
        st.interval = setInterval(st.onInterval.bind(st), 1000);
        ShowToast("验证码已发送至您的手机");
    }

    onInterval() {
        const st = this;
        --st.nextSend;
        if (st.nextSend <= 0) {
            st.clearInterval();
            st.lab_send_again.string = "重新发送验证码";
            st.lab_send_again.color = new Color(`FFD000`);
        } else {
            st.lab_send_again.string = `${st.nextSend.toFixed()}秒后重新发送`;
        }
    }

    clearInterval() {
        const st = this;
        if (st.interval != -1) {
            clearInterval(st.interval);
            st.interval = -1;
        }
    }

    onBtnMobileLoginClick() {
        const st = this;
        const code = st.input_verification_code.string.trim();
        console.log(`code:${code}`);
        if (code.length < 1) {
            ShowToast("请输入验证码");
            return;
        }
        if (code.length != 4) {
            ShowToast("验证码格式错误");
            return;
        }
        welcomeCtrl.Ins.data.code = code;
        director.emit(game.gameEvent.WELCOME_LOGIN_CODE);
    }

    onBtnCannotGetCodeClick() {
        ShowToast("TODO");
    }

    onBtnSendAgainClick() {
        const st = this;
        if (st.interval != -1) {
            ShowToast("请稍后再试");
            return;
        }
        this.sendSMS();
    }



}
