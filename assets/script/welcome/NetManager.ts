import { game } from 'cc';
import { director } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { NetEvents } from '../global/EventManager';
import { Label } from 'cc';
const { ccclass, property } = _decorator;

export class NetMessageData {
    title?: string;
    content: string;
    ok?: string;
    okcb: () => void;
}


@ccclass('NetManager')
export class NetManager extends Component {
    private static _instance: NetManager;
    public static get instance(): NetManager {
        return this._instance;
    }

    private g_win: Node;
    private lab_title: Label;
    private lab_content: Label;
    private btn_ok: Node;
    private lab_ok: Label;

    private okcb: () => void;

    onLoad() {
        const st = NetManager._instance = this;
        director.on(NetEvents.NET_SHOW_BLOCKER, st.showBlocker, st);
        director.on(NetEvents.NET_SHOW_MESSAGE, st.showMessage, st);
        director.on(NetEvents.NET_HIDE, st.hide, st);
        st.g_win = st.node.getChildByPath("win_bg/g_win");
        st.lab_title = st.g_win.getChildByPath("lab_title").getComponent(Label);
        st.btn_ok = st.g_win.getChildByPath("btn_ok");
        st.lab_ok = st.btn_ok.getChildByPath("Label").getComponent(Label);
        st.btn_ok.on(Node.EventType.TOUCH_END, st.onBtnOkClick, st);
    }

    protected onDestroy(): void {
        const st = this;
        NetManager._instance = null;
        st.okcb = null;
        director.off(NetEvents.NET_SHOW_BLOCKER, st.showBlocker, st);
        director.off(NetEvents.NET_SHOW_MESSAGE, st.showMessage, st);
        director.off(NetEvents.NET_HIDE, st.hide, st);
    }

    protected start(): void {
        this.node.active = false;
    }

    showBlocker() {
        this.node.active = true;
        this.g_win.active = false;
    }

    hide() {
        this.node.active = false;
        this.g_win.active = false;
    }

    showMessage(data: NetMessageData) {
        const st = this;
        st.node.active = true;
        st.g_win.active = true;
        st.lab_title.string = data.title || "提示";
        st.lab_content.string = data.content;
        st.lab_ok.string = data.ok || "确认";
    }

    onBtnOkClick() {
        if (this.okcb) this.okcb();
    }

}


