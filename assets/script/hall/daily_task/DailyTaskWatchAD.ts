import { _decorator, Component, Node, ProgressBar, Label, Button, Prefab, instantiate, Layout, UITransform, Vec3 } from 'cc';
import { DailyTask as DailyTaskData } from './DailyTaskHelper';
import { TaskType } from '../../api/APITypes';
import { GameItemIcon } from '../GameItemIcon';
import { ShowToast } from '../../global/Toast';
import { DailyTask } from './DailyTask';

const { ccclass, property } = _decorator;

/**
 * 每日任务广告任务显示组件
 */
@ccclass('DailyTaskWatchAD')
export class DailyTaskWatchAD extends Component {

    // 进度条
    @property(ProgressBar)
    progressBar: ProgressBar = null!;

    // 进度文本 (如 1/30)
    @property(Label)
    progressLabel: Label = null!;

    // 按钮 - 去看广告
    @property(Button)
    watchAdButton: Button = null!;

    // 按钮 - 领取奖励
    @property(Button)
    claimButton: Button = null!;

    // 私有变量
    private _taskData: DailyTaskData = null!;
    private _onClaimCallback: (taskId: number) => void = null!;
    private _onWatchAdCallback: (taskId: number) => void = null!;

    /**
     * 初始化任务数据
     * @param taskData 任务数据
     * @param onClaim 领取奖励回调
     * @param onWatchAd 观看广告回调
     */
    public init(
        taskData: DailyTaskData,
        onClaim?: (taskId: number) => void,
        onWatchAd?: (taskId: number) => void
    ) {
        this._taskData = taskData;
        this._onClaimCallback = onClaim || (() => {});
        this._onWatchAdCallback = onWatchAd || (() => {});

        this.updateUI();
        this.setupButtonEvents();
    }

    /**
     * 更新UI显示
     */
    private updateUI() {
        if (!this._taskData) return;

        // 更新进度
        const progress = Math.min(this._taskData.userFinishAccount / this._taskData.taskAccount, 1);
        this.progressBar.progress = progress;
        this.progressLabel.string = `${this._taskData.userFinishAccount}/${this._taskData.taskAccount}`;

        // 更新按钮状态
        this.updateButtonStates();
    }

    /**
     * 更新按钮状态
     */
    private updateButtonStates() {
        const isCompleted = this._taskData.userFinishAccount >= this._taskData.taskAccount;
        const isClaimed = this._taskData.isReceive === 1;

        // 观看广告按钮：未完成且未领取时显示
        this.watchAdButton.node.active = !isCompleted && !isClaimed;
        this.watchAdButton.interactable = !isCompleted && !isClaimed;

        // 领取按钮：已完成且未领取时显示
        this.claimButton.node.active = isCompleted && !isClaimed;
        this.claimButton.interactable = isCompleted && !isClaimed;

        // 如果已领取，隐藏所有按钮
        if (isClaimed) {
            this.watchAdButton.node.active = false;
            this.claimButton.node.active = false;
        }
    }

    /**
     * 设置按钮事件
     */
    private setupButtonEvents() {
       
    }

    /**
     * 观看广告按钮点击事件
     */
    private onWatchAdClick() {
        if (this._taskData.userFinishAccount >= this._taskData.taskAccount) {
            ShowToast('任务已完成，请领取奖励');
            return;
        }

        if (this._taskData.isReceive === 1) {
            ShowToast('奖励已领取');
            return;
        }

        this._onWatchAdCallback(this._taskData.id);
    }

    /**
     * 领取奖励按钮点击事件
     */
    private onClaimClick() {
        if (this._taskData.userFinishAccount < this._taskData.taskAccount) {
            ShowToast('任务尚未完成');
            return;
        }

        if (this._taskData.isReceive === 1) {
            ShowToast('奖励已领取');
            return;
        }

        this._onClaimCallback(this._taskData.id);
    }

    /**
     * 刷新任务数据
     * @param taskData 新的任务数据
     */
    public refresh(taskData: DailyTaskData) {
        this._taskData = taskData;
        this.updateUI();
    }

    /**
     * 获取任务ID
     */
    public getTaskId(): number {
        return this._taskData?.id || 0;
    }

    /**
     * 获取任务数据
     */
    public getTaskData(): DailyTaskData {
        return this._taskData;
    }

    /**
     * 组件销毁时清理事件
     */
    onDestroy() {
     
    }
} 