// 导入Cocos Creator相关模块
import { _decorator, Component, Node, Label, Prefab, Button, instantiate, game, director } from 'cc';
// 导入相关数据管理器和配置
import { UserIdleRewardData, ServerIdleRewardData } from '../user/UserIdleRewardData';
import { UserInfoData } from '../user/UserInfoData';
import { GameItemIcon } from './GameItemIcon';
import { ShowToast } from '../global/Toast';

const { ccclass, property } = _decorator;

/**
 * @class IdleReward
 * @description 挂机奖励UI面板的控制器。
 */
@ccclass('IdleReward')
export class IdleReward extends Component {

    // --- 属性 ---
    @property(Label)
    public timeLabel: Label = null;

    @property(Label)
    public stageLabel: Label = null;

    @property(Node)
    public dropListContent: Node = null;

    @property(Prefab)
    public itemIconPrefab: Prefab = null;

    @property(Label)
    public expPerHourLabel: Label = null;

    @property(Label)
    public coinPerHourLabel: Label = null;

    @property(Button)
    public sweepButton: Button = null;

    @property(Button)
    public claimButton: Button = null;
    
    // --- 私有变量 ---
    private readonly SWEEP_ENERGY_COST = 5;
    private _serverData: ServerIdleRewardData | null = null;
    private _isLoading = false;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, ()=>{
        }, this);

        this.claimButton.node.on('click', this.onClaimButtonClicked, this);
        this.sweepButton.node.on('click', this.onSweepButtonClicked, this);
    }

    show(){
        this.loadServerData();
    }

    hide(){
        this.node.active=false;
    }


    onDisable() {
        this.unschedule(this.updateTimeAndButtons);
        // 重置状态
        this._serverData = null;
        this._isLoading = false;
    }

    /**
     * 从服务器加载挂机收益数据
     */
    private loadServerData() {
        if (this._isLoading) return;
        
        this._isLoading = true;
        
        // 使用 Promise 处理，避免抛出未处理的错误
        const idleData = UserIdleRewardData.getInstance();
        idleData.getServerData()
            .then((serverData) => {
                this._serverData = serverData;
                this.node.active = true;
                this.refreshPanel();
                // 成功获取数据后开始定时刷新
                this.schedule(this.updateTimeAndButtons, 1);
            })
            .catch((error) => {
                console.error('加载挂机收益数据失败:', error);
                ShowToast('加载挂机收益数据失败');
                // 服务器获取失败，直接关闭页面
                this.hide();
            })
            .finally(() => {
                this._isLoading = false;
            });
    }

        /**
     * 领取挂机奖励按钮点击事件
     */
    private onClaimButtonClicked() {
        if (this._isLoading) return;

        this._isLoading = true;
        const idleData = UserIdleRewardData.getInstance();
        
        idleData.claimServerReward()
            .then((success) => {
                if (success) {
                    console.log("挂机奖励领取成功！");
                    ShowToast("挂机奖励领取成功！");
                    
                    // 重新加载数据
                    this.loadServerData();
                    
                    // 显示奖励物品
                    if (this._serverData) {
                        const userItems = idleData.convertRewardToUserItems(this._serverData.reward);
                        director.emit(game.gameEvent.DIALOG_ITEM_SHOW, userItems);
                    }
                    
                    this.hide();
                } else {
                    ShowToast("挂机奖励领取失败，可能是时间不够。");
                }
            })
            .catch((error) => {
                console.error('领取挂机奖励失败:', error);
                ShowToast("领取挂机奖励失败");
            })
            .finally(() => {
                this._isLoading = false;
            });
    }

        /**
     * 扫荡按钮点击事件
     */
    private onSweepButtonClicked() {
        if (this._isLoading) return;

        const userInfo = UserInfoData.getInstance();
        if (userInfo.hasEnoughEnergy(this.SWEEP_ENERGY_COST)) {
            this._isLoading = true;
            const idleData = UserIdleRewardData.getInstance();
            
            idleData.claimSweepReward()
                .then((success) => {
                    if (success) {
                        // 扣除体力
                        userInfo.consumeEnergy(this.SWEEP_ENERGY_COST);

                        console.log(`扫荡成功！消耗${this.SWEEP_ENERGY_COST}体力。`);
                        ShowToast("扫荡成功！");
                        
                        // 重新加载数据
                        this.loadServerData();
                        
                        // 显示奖励物品
                        if (this._serverData) {
                            const userItems = idleData.convertRewardToUserItems(this._serverData.reward);
                            director.emit(game.gameEvent.DIALOG_ITEM_SHOW, userItems);
                        }
                        
                        this.hide();
                    } else {
                        ShowToast("扫荡失败");
                    }
                })
                .catch((error) => {
                    console.error('扫荡失败:', error);
                    ShowToast("扫荡失败");
                })
                .finally(() => {
                    this._isLoading = false;
                });
        } else {
            ShowToast("体力不足，无法扫荡。");
        }
    }

    /**
     * 每秒更新时间和按钮状态
     */
    private updateTimeAndButtons() {
        if (this._serverData) {
            // 使用服务器数据的时间差
            const timeGap = this._serverData.timeGap;
            this.timeLabel.string = UserIdleRewardData.getInstance().formatTimeGap(timeGap);
            this.updateButtonStates();
        }
        // 如果没有服务器数据，页面应该已经被关闭了
    }
    
    /**
     * 刷新整个面板的显示
     */
    private refreshPanel() {
        if (this._serverData) {
            this.refreshPanelWithServerData();
        }
        // 如果没有服务器数据，页面应该已经被关闭了
    }

    /**
     * 使用服务器数据刷新面板
     */
    private refreshPanelWithServerData() {
        if (!this._serverData) return;

        // 1. 更新时间和按钮
        this.timeLabel.string = UserIdleRewardData.getInstance().formatTimeGap(this._serverData.timeGap);
        this.updateButtonStates();
        
        // 2. 更新关卡和每小时收益
        this.stageLabel.string = `第 ${this._serverData.currentLevel} 关`;
        this.expPerHourLabel.string = this._serverData.experience;
        this.coinPerHourLabel.string = this._serverData.gold;

        // 3. 更新累计奖励列表
        this.dropListContent.destroyAllChildren();
        
        // 转换服务器reward为本地格式并显示
        const idleData = UserIdleRewardData.getInstance();
        const userItems = idleData.convertRewardToUserItems(this._serverData.reward);
        
        userItems.forEach(item => {
            this.createDropItemIcon(item.itemId, item.amount);
        });
    }



    /**
     * 更新按钮的可交互状态
     */
    private updateButtonStates() {
        if (!this._serverData) return;
        
        // 更新领取按钮状态
        const canClaim = this._serverData.timeGap > 0;
        this.claimButton.interactable = canClaim && !this._isLoading;

        // 更新扫荡按钮状态
        const canSweep = UserInfoData.getInstance().hasEnoughEnergy(this.SWEEP_ENERGY_COST);
        this.sweepButton.interactable = canSweep && !this._isLoading;
    }
    
    /**
     * 创建掉落物品图标
     */
    private createDropItemIcon(itemId: number, amount: number) {
        const itemNode = instantiate(this.itemIconPrefab);
       
        itemNode.parent=this.dropListContent;
        const iconComp = itemNode.getComponent(GameItemIcon);
        iconComp.init(itemId);
        iconComp.setCount(amount);
        iconComp.setCollected(false);
        itemNode.active=true;
    }
    

}
