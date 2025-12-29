import { _decorator, Component, Node, ProgressBar, Label, Button, Prefab, instantiate, Layout, UITransform, Vec3 } from 'cc';
import { DailyTask as DailyTaskData } from './DailyTaskHelper';
import { TaskType } from '../../api/APITypes';
import { GameItemIcon } from '../GameItemIcon';
import { ShowToast } from '../../global/Toast';

const { ccclass, property } = _decorator;

/**
 * 每日任务单个任务显示组件
 */
@ccclass('DailyTask')
export class DailyTask extends Component {

    // 进度条
    @property(ProgressBar)
    progressBar: ProgressBar = null!;

    // 进度文本 (如 1/30)
    @property(Label)
    progressLabel: Label = null!;

    // 任务描述
    @property(Label)
    descriptionLabel: Label = null!;

    // 按钮 - 去看广告
    @property(Button)
    watchAdButton: Button = null!;

    // 按钮 - 去分享
    @property(Button)
    shareButton: Button = null!;

    // 按钮 - 领取奖励
    @property(Button)
    claimButton: Button = null!;

    // 未完成状态节点
    @property(Node)
    incompleteNode: Node = null!;

    // 已领取标记节点
    @property(Node)
    markNode: Node = null!;

    // 已领取面板
    @property(Node)
    claimedPanel: Node = null!;

    // 奖励容器 (Layout)
    @property(Node)
    rewardContainer: Node = null!;

    // GameItemIcon 预制体
    @property(Prefab)
    gameItemIconPrefab: Prefab = null!;

    // 私有变量
    private _taskData: DailyTaskData = null!;
    private _onClaimCallback: (taskId: number) => void = null!;
    private _onWatchAdCallback: (taskId: number) => void = null!;
    private _onShareCallback: (taskId: number) => void = null!;

    /**
     * 初始化任务数据
     * @param taskData 任务数据
     * @param onClaim 领取奖励回调
     * @param onWatchAd 观看广告回调
     * @param onShare 分享回调
     */
    public init(
        taskData: DailyTaskData,
        onClaim?: (taskId: number) => void,
        onWatchAd?: (taskId: number) => void,
        onShare?: (taskId: number) => void
    ) {
        this._taskData = taskData;
        this._onClaimCallback = onClaim || (() => {});
        this._onWatchAdCallback = onWatchAd || (() => {});
        this._onShareCallback = onShare || (() => {});

        this.updateUI();
        this.setupButtonEvents();
    }

    /**
     * 更新UI显示
     */
    private updateUI() {
        if (!this._taskData) return;

        // 更新任务描述
        this.descriptionLabel.string = this._taskData.taskDescription;

        // 更新进度
        const progress = Math.min(this._taskData.userFinishAccount / this._taskData.taskAccount, 1);
        this.progressBar.progress = progress;
        this.progressLabel.string = `${this._taskData.userFinishAccount}/${this._taskData.taskAccount}`;

        // 更新按钮状态
        this.updateButtonStates();

        // 更新奖励显示
        this.updateRewards();

        // 更新未完成状态
        this.updateIncompleteState();
    }

    /**
     * 更新按钮状态
     */
    private updateButtonStates() {
        const isCompleted = this._taskData.userFinishAccount >= this._taskData.taskAccount;
        const isClaimed = this._taskData.isReceive === 1;

        // 默认隐藏所有按钮
        this.watchAdButton.node.active = false;
        this.shareButton.node.active = false;
        this.claimButton.node.active = false;

        // 如果已领取，不显示任何操作按钮
        if (isClaimed) {
            return;
        }

        // 根据任务类型和状态显示对应按钮
        switch (this._taskData.taskType) {
            case TaskType.ADVERTISEMENT:
                // 广告任务：未完成时显示观看广告按钮
                this.watchAdButton.node.active = !isCompleted;
                break;
            case TaskType.SHARE:
                // 分享任务：未完成时显示分享按钮
                this.shareButton.node.active = !isCompleted;
                break;
            case TaskType.HUNTER:
            case TaskType.UP:
            case TaskType.SHOP:
            case TaskType.RECHARGE:
                // 其他任务类型：不显示操作按钮，只显示进度
                break;
            default:
                console.warn(`未知任务类型: ${this._taskData.taskType}`);
                break;
        }

        // 领取按钮：已完成且未领取时显示
        if (isCompleted && !isClaimed) {
            this.claimButton.node.active = true;
            this.claimButton.interactable = true;
        }
    }

    /**
     * 更新奖励显示
     */
    private updateRewards() {
        // 清空现有奖励
        this.rewardContainer.removeAllChildren();

        if (!this._taskData.reward || this._taskData.reward.length === 0) {
            console.warn(`任务 ${this._taskData.id} 没有奖励数据`);
            return;
        }

        // 创建奖励图标
        this._taskData.reward.forEach((rewardItem, index) => {
            const iconNode = instantiate(this.gameItemIconPrefab);
            const iconComponent = iconNode.getComponent(GameItemIcon);
            
            if (iconComponent) {
                iconComponent.init(rewardItem.itemId);
                iconComponent.setCount(rewardItem.amount);
                // 根据是否已领取设置收集状态
                iconComponent.setCollected(this._taskData.isReceive === 1);
                
                iconNode.setScale(0.63,0.63);
                // 设置图标大小为 115x115
                // const transform = iconNode.getComponent(UITransform);
                // if (transform) {
                //     transform.setContentSize(115, 115);
                // }
            }

            this.rewardContainer.addChild(iconNode);
        });

        // 如果容器有Layout组件，强制刷新布局
        const layout = this.rewardContainer.getComponent(Layout);
        if (layout) {
            layout.updateLayout();
        }
    }

    /**
     * 更新未完成状态
     */
    private updateIncompleteState() {
        const isCompleted = this._taskData.userFinishAccount >= this._taskData.taskAccount;
        const isClaimed = this._taskData.isReceive === 1;
        
        // 未完成状态：只有在没有操作按钮且未完成时才显示
        const hasActionButton = this.watchAdButton.node.active || this.shareButton.node.active;
        this.incompleteNode.active = !isCompleted && !isClaimed && !hasActionButton;
        
        // 已领取标记：已领取时显示
        if (this.markNode) {
            this.markNode.active = isClaimed;
        }
        
        // 已领取面板：已领取时显示
        if (this.claimedPanel) {
            this.claimedPanel.active = isClaimed;
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

        this._onWatchAdCallback(this._taskData.id);
    }

    /**
     * 分享按钮点击事件
     */
    private onShareClick() {
        if (this._taskData.userFinishAccount >= this._taskData.taskAccount) {
            ShowToast('任务已完成，请领取奖励');
            return;
        }

        this._onShareCallback(this._taskData.id);
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