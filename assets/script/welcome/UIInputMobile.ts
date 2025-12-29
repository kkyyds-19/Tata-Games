import { _decorator, Component, Node } from 'cc';
import { mobileData } from './welcomeCtrl';
import { Label } from 'cc';
import { Button } from 'cc';
import { EditBox } from 'cc';
import { director } from 'cc';
import { GameEvent } from '../global/event/GameEvent';
import { game } from 'cc';
import { NodeEventType } from 'cc';
import { ShowToast } from '../global/Toast';
const { ccclass, property } = _decorator;

@ccclass('UIInputMobile')
export class UIInputMobile extends Component {
    private btn_zone: Node;
    private lab_zone: Label;
    private input_mobile: EditBox;
    public uiData: mobileData;
    onLoad() {
        const st = this;
        st.btn_zone = st.node.getChildByName("btn_zone");
        st.lab_zone = st.btn_zone.getChildByName("lab_zone").getComponent(Label);
        st.input_mobile = st.node.getChildByName("input_mobile").getComponent(EditBox);
        st.input_mobile.node.on(EditBox.EventType.TEXT_CHANGED, st.onTextChange, st);
        st.btn_zone.on(NodeEventType.TOUCH_END, st.onBtnZoneClick, st);
    }

    protected onEnable(): void {
        const st = this;
        director.on(game.gameEvent.WELCOME_ZONE_HIDE, st.onPrefixHide, st);
    }

    protected onDisable(): void {
        const st = this;
        director.off(game.gameEvent.WELCOME_ZONE_HIDE, st.onPrefixHide, st);
    }



    setData(data: mobileData) {
        this.uiData = data;
        this.refresh();
    }

    refresh() {
        const st = this;
        const d = st.uiData;
        st.lab_zone.string = d.zone;
        st.input_mobile.string = d.mobileNum;
    }

    onBtnZoneClick() {
        ShowToast("变更区域");
    }

    onPrefixHide(data: string) {
        this.uiData.zone = data;
    }

    onTextChange() {
        this.uiData.mobileNum = this.input_mobile.string.trim();
    }

}


