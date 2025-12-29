import { NodeEventType } from 'cc';
import { EventTouch } from 'cc';
import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Cfgs } from '../../config/Cfgs';
import { ShowToast } from '../../global/Toast';
import { game } from 'cc';
import { director } from 'cc';
import { Sprite } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('UIWorldSelect')
export class UIWorldSelect extends Component {

    private btn_return: Node;
    private btn_world_1: Node;
    private btn_world_2: Node;
    private btn_world_3: Node;

    private btn_worlds: Node[];

    protected onLoad(): void {
        const st = this;
        st.btn_return = st.node.getChildByPath("main_panel/btn_return");
        st.btn_world_1 = st.node.getChildByPath("main_panel/btn_world_1");
        st.btn_world_2 = st.node.getChildByPath("main_panel/btn_world_2");
        st.btn_world_3 = st.node.getChildByPath("main_panel/btn_world_3");
        st.btn_worlds = [null, st.btn_world_1, st.btn_world_2, st.btn_world_3];

        st.btn_return.on(NodeEventType.TOUCH_END, st.onBtnReturnClick, st);
        st.btn_world_1.on(NodeEventType.TOUCH_END, st.onBtnWorldClick, st);
        st.btn_world_2.on(NodeEventType.TOUCH_END, st.onBtnWorldClick, st);
        st.btn_world_3.on(NodeEventType.TOUCH_END, st.onBtnWorldClick, st);
    }

    onEnable() {
        this.node.on(Node.EventType.TOUCH_START, () => {

        }, this);

    }

    /**
     * 显示
     */
    public show() {
        this.node.active = true;
        this.refresh();
    }

    /**
     * 隐藏
     */
    public hide() {
        this.node.active = false;
    }

    private refresh() {
        const st = this;
        Cfgs.CfgWorld.forEach((v, k, m) => {
            //TODO 实际开启逻辑
            st.btn_worlds[k].getComponent(Sprite).grayscale = v.openStageId < 0;
        })
    }

    onBtnReturnClick() {
        this.hide();
    }

    onBtnWorldClick(ev: EventTouch) {
        const st = this;
        const index = st.btn_worlds.indexOf(ev.target);
        if (index <= 0) {
            ShowToast('未知错误');
            return;
        }
        const cfgWrold = Cfgs.GetCfg(Cfgs.CfgWorld, index);
        if (!cfgWrold) {
            ShowToast('未知错误');
            return;
        }
        if (cfgWrold.openStageId == -1) {
            ShowToast('敬请期待');
            return;
        }
        if (cfgWrold.openStageId == -1) {//TODO 实际开启逻辑
            ShowToast('地图未解锁');
            return;
        }
        if (game.myGlobal.currentWorld != cfgWrold.id) {
            game.myGlobal.currentWorld = cfgWrold.id;
            director.emit(game.gameEvent.GAME_HALL_WORLD_CHANGE);
        }
        st.hide();
    }

}
