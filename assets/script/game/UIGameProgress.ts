import { Sprite } from 'cc';
import { NodeEventType } from 'cc';
import { Button } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Utils } from '../utils/Utils';
import { director, game } from 'cc';
import { DailyTaskHelper } from '../hall/daily_task/DailyTaskHelper';
import { RewardedVideoAdManager } from '../wx/RewardedVideoAdManager';
import { resManager } from '../utils/resManager';
import { GlobalVariable } from '../global/GlobalVariable';
const { ccclass, property } = _decorator;

@ccclass('UIGameProgress')
export class UIGameProgress extends Component {

    private label: Label;
    private icon: Sprite;

    start() {
        const st = this;
        st.label = st.node.getChildByPath("label").getComponent(Label);
        st.icon = st.node.getChildByPath("icon").getComponent(Sprite);
        st.node.on(NodeEventType.TOUCH_END, st.onProgressClick, st);
    }

    /**
     * 
     * @param text 不填时隐藏
     * @returns 
     */
    setData(text?: string) {
        const st = this;
        if (text) {
            st.node.active = true;
            st.label.string = text;
        } else {
            st.node.active = false;
            return;
        }

    }
    /**
     * 
     * @param icon 不填时隐藏
     */
    setIcon(icon?: string) {
        const st = this;
        if (icon && icon.length > 0) {
            resManager.setSprite(st.icon, GlobalVariable.bundleRes, icon).then(() => {
                st.icon.node.active = true;
            });
        } else {
            st.icon.node.active = false;
        }
    }

    /**
     * 测试用：显示游戏结果界面
     */
    onProgressClick() {
        // this.showTestGameResult();
        // director.emit(game.gameEvent.GAME_LUCK_WHEEL_SHOW);
        // this.test_rewarded_video_ad();
        Utils.testLevelExpConfig();
    }

    /**
     * 显示测试游戏结果
     */
    private showTestGameResult() {
        director.emit(game.gameEvent.GAME_VICTORY, true);
    }

    private test_rewarded_video_ad() {
        RewardedVideoAdManager.getInstance().playRewardedAd(
            (res) => {
                console.log('广告 奖励发放成功', res);
                DailyTaskHelper.completeAdvertisement();
            },
            (res) => {
                console.log('广告 奖励发放失败', res);
            }
        );
    }

}


