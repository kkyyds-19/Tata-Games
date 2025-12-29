import { _decorator, Component, Node, Label, Prefab, instantiate, Button } from 'cc';
import { DailyTask } from './DailyTask';
import { DailyTaskWatchAD } from './DailyTaskWatchAD';
import { DailyTask as DailyTaskData, DailyTaskHelper } from './DailyTaskHelper';
import { TaskType } from '../../api/APITypes';
import { ShowToast } from '../../global/Toast';
import { RewardedVideoAdManager } from '../../wx/RewardedVideoAdManager';

const { ccclass, property } = _decorator;

/**
 * 日常任务主页面组件
 */
@ccclass('DailyTaskMain')
export class DailyTaskMain extends Component {

    // 任务刷新时间标签
    @property(Label)
    refreshTimeLabel: Label = null!;

    // 普通任务预制体
    @property(Prefab)
    dailyTaskPrefab: Prefab = null!;

    // 广告任务预制体
    @property(Prefab)
    dailyTaskWatchADPrefab: Prefab = null!;

    // 完成所有任务可得标签
    @property(Label)
    accountProgressLabel: Label = null!;

    // 获得奖励按钮
    @property(Button)
    accountRewardButton: Button = null!;

    // 任务容器
    @property(Node)
    contentContainer: Node = null!;

    //总任务进度节点
    @property(Node)
    dailyTaskProgressNode: Node = null!;


    //网络同步数据提示文字
    @property(Label)
    networkSyncDataLabel: Label = null!;

    // 私有变量
    private taskComponents: (DailyTask | DailyTaskWatchAD)[] = [];
    private accountTask: DailyTaskData = null!;

    onLoad() {
        this.setupButtonEvents();
        this.node.on(Node.EventType.TOUCH_START, ()=>{

        }, this);
        // this.loadDailyTasks();
    }

    /**
     * 设置按钮事件
     */
    private setupButtonEvents() {
        if (this.accountRewardButton) {
            this.accountRewardButton.node.on(Button.EventType.CLICK, this.onAccountRewardClick, this);
        }
    }

    /**
     * 加载每日任务数据
     */
    private loadDailyTasks() {
        DailyTaskHelper.getDailyTaskInfo(
            (data) => {
                // 同步数据成功，隐藏提示文字，显示进度节点
                if (this.networkSyncDataLabel) {
                    this.networkSyncDataLabel.node.active = false;
                }
                if (this.dailyTaskProgressNode) {
                    this.dailyTaskProgressNode.active = true;
                }
                if (this.contentContainer) {
                    this.contentContainer.active = true;
                }
                
                this.updateUI();
                this.createTaskItems();
                
                // 数据加载成功后开始倒计时
                this.startCountdown();
            },
            (error) => {
                ShowToast('加载任务失败');
                
                // 同步失败，显示错误提示
                if (this.networkSyncDataLabel) {
                    this.networkSyncDataLabel.string = '数据同步失败，请重试';
                }
            }
        );
    }

    /**
     * 更新UI显示
     */
    private updateUI() {
        // 更新刷新时间
        this.updateRefreshTime();
        
        // 更新账户任务进度
        this.updateAccountProgress();
    }

    /**
     * 更新刷新时间
     */
    private updateRefreshTime() {
        if (this.refreshTimeLabel) {
            // 使用倒计时格式化方法
            this.refreshTimeLabel.string = DailyTaskHelper.formatCountdown();
        }
    }

    /**
     * 开始倒计时更新
     */
    private startCountdown() {
        if (this.refreshTimeLabel) {
            DailyTaskHelper.startCountdown((timeString: string) => {
                this.refreshTimeLabel.string = timeString;
            });
        }
    }

    /**
     * 停止倒计时更新
     */
    private stopCountdown() {
        DailyTaskHelper.stopCountdown();
    }

    public show() {
        // 显示网络同步提示，隐藏进度节点
        if (this.networkSyncDataLabel) {
            this.networkSyncDataLabel.node.active = true;
            this.networkSyncDataLabel.string = '正在同步数据...';
        }
        if (this.dailyTaskProgressNode) {
            this.dailyTaskProgressNode.active = false;
            this.contentContainer.active = false;
        }
        
        this.loadDailyTasks();
        this.node.active = true;
    }

    public hide() {
        this.node.active = false;
        // 停止倒计时
        this.stopCountdown();
    }
    /**
     * 更新账户任务进度
     */
    private updateAccountProgress() {
        // 查找 ACCOUNT 类型的任务
        this.accountTask = DailyTaskHelper.dailyTaskList.find(task => task.taskType === TaskType.ACCOUNT);
        
        if (this.accountTask && this.accountProgressLabel) {
            this.accountProgressLabel.string = `完成所有任务可得 (${this.accountTask.userFinishAccount}/${this.accountTask.taskAccount})`;
        }

        // 更新账户奖励按钮状态
        // if (this.accountRewardButton && this.accountTask) {
        //     const isCompleted = this.accountTask.userFinishAccount >= this.accountTask.taskAccount;
        //     const isClaimed = this.accountTask.isReceive === 1;
            
        //     this.accountRewardButton.node.active = isCompleted && !isClaimed;
        //     this.accountRewardButton.interactable = isCompleted && !isClaimed;
        // }
    }

    /**
     * 创建任务项
     */
    private createTaskItems() {
        // 清空现有任务项
        this.contentContainer.removeAllChildren();
        this.taskComponents = [];

        const taskList = DailyTaskHelper.dailyTaskList;
        
        taskList.forEach((taskData) => {
            // 跳过 ACCOUNT 类型的任务（已在顶部显示）
            if (taskData.taskType === TaskType.ACCOUNT) {
                return;
            }

            let taskNode: Node;
            let taskComponent: DailyTask | DailyTaskWatchAD;

            // 根据任务类型选择预制体
            if (taskData.taskType === TaskType.ADVERTISEMENT_ACCOUNT) {
                // 广告累计任务使用 DailyTaskWatchAD
                taskNode = instantiate(this.dailyTaskWatchADPrefab);
                taskComponent = taskNode.getComponent(DailyTaskWatchAD);
                
                if (taskComponent) {
                    (taskComponent as DailyTaskWatchAD).init(
                        taskData,
                        this.onTaskClaim.bind(this),
                        this.onTaskWatchAd.bind(this)
                    );
                }
            } else {
                // 其他任务使用 DailyTask
                taskNode = instantiate(this.dailyTaskPrefab);
                taskComponent = taskNode.getComponent(DailyTask);
                
                if (taskComponent) {
                    (taskComponent as DailyTask).init(
                        taskData,
                        this.onTaskClaim.bind(this),
                        this.onTaskWatchAd.bind(this),
                        this.onTaskShare.bind(this)
                    );
                }
            }
            
            if (taskComponent) {
                this.taskComponents.push(taskComponent);
            }
            
            this.contentContainer.addChild(taskNode);
        });
    }

    /**
     * 任务领取奖励回调
     */
    private onTaskClaim(taskId: number) {
        ShowToast('奖励领取成功！');
        
        DailyTaskHelper.claimTaskReward(
            taskId,
            (result) => {
                ShowToast('奖励领取成功！');
                // 刷新任务数据
                this.refreshTaskData();
            },
            (error) => {
                ShowToast('领取奖励失败，请重试');
            }
        );
    }

    /**
     * 任务观看广告回调
     */
    private onTaskWatchAd(taskId: number) {
        RewardedVideoAdManager.getInstance().playRewardedAd(
            (result) => {
                 // 调用真实的广告任务接口
                DailyTaskHelper.completeAdvertisement();
                // 刷新任务数据
                this.refreshTaskData();
            },
            (error) => {
                ShowToast('广告任务执行失败，请重试');
            }
        );
       
    }

    /**
     * 任务分享回调
     */
    private onTaskShare(taskId: number) {
         DailyTaskHelper.completeShare();
       
    }

    /**
     * 账户奖励按钮点击事件
     */
    private onAccountRewardClick() {
        if (!this.accountTask) {
            ShowToast('账户任务数据不存在');
            return;
        }

        if (this.accountTask.userFinishAccount < this.accountTask.taskAccount) {
            ShowToast('任务尚未全部完成');
            return;
        }

        if (this.accountTask.isReceive === 1) {
            ShowToast('奖励已领取');
            return;
        }

        ShowToast('领取账户任务奖励');
        
        DailyTaskHelper.claimTaskReward(
            this.accountTask.id,
            (result) => {
                ShowToast('账户奖励领取成功！');
                // 刷新任务数据
                this.refreshTaskData();
            },
            (error) => {
                ShowToast('领取账户奖励失败，请重试');
            }
        );
    }



    /**
     * 刷新任务数据
     */
    private refreshTaskData() {
        DailyTaskHelper.getDailyTaskInfo(
            (data) => {
                this.updateUI();
                // 更新现有任务组件的数据
                const taskList = DailyTaskHelper.dailyTaskList;
                this.taskComponents.forEach((taskComponent, index) => {
                    const taskData = taskList.find(t => t.id === taskComponent.getTaskId());
                    if (taskData) {
                        taskComponent.refresh(taskData);
                    }
                });
            },
            (error) => {
                ShowToast('刷新任务数据失败');
            }
        );
    }

    /**
     * 刷新按钮点击事件
     */
    public onRefreshClick() {
        this.loadDailyTasks();
    }

    public onclickleft(){
        this.loadDailyTasks();
    }
    public onclickright(){
        ShowToast('暂未开放');
    }





    /**
     * 组件销毁时清理事件
     */
    onDestroy() {
        // 停止倒计时
        this.stopCountdown();
    }
} 