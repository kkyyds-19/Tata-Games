import { _decorator, Component, Layout, Prefab, instantiate, Button, Node, Label, director, game } from 'cc';
import { clearRewardAPI } from '../../api/ClearRewardAPI';
import { ClearRewardListResponse, SysStarReward, UserLevelInfo } from '../../api/APITypes';
import { ClearRewardItem, RewardData } from './ClearRewardItem';
import { parseRewardToUserItems } from '../../api/APITypes';

const { ccclass, property } = _decorator;

/**
 * 通关奖励主页面组件
 */
@ccclass('ClearRewardMain')
export class ClearRewardMain extends Component {

    @property(Layout)
    public notFullStarLayout: Layout = null!; // 未满星关卡列表容器

    @property(Prefab)
    public rectStagePrefab: Prefab = null!; // rect_stage 预制体

    @property(Layout)
    public rewardListLayout: Layout = null!; // 奖励列表容器

    @property(Prefab)
    public clearRewardItemPrefab: Prefab = null!; // ClearRewardItem 预制体

   

    // 缓存数据
    private _cacheData: ClearRewardListResponse | null = null;
    private _cacheTime: number = 0;
    private readonly CACHE_DURATION = 60000; // 1分钟缓存

    // 未满星关卡列表
    private _notFullStarItems: Node[] = [];
    
    // 奖励列表
    private _rewardItems: ClearRewardItem[] = [];

    onLoad() {

        this.node.on(Node.EventType.TOUCH_START, ()=>{
            
        }, this);
        this.initEventListeners();
    }

    /**
     * 初始化事件监听
     */
    private initEventListeners(): void {
       
    }

    /**
     * 显示组件
     */
    public async show(): Promise<void> {
        this.node.active = true;
        await this.loadData();
    }

    /**
     * 隐藏组件
     */
    public hide(): void {
        this.node.active = false;
    }

    /**
     * 加载数据
     */
    private async loadData(): Promise<void> {
        try {
            // 检查缓存是否有效
            if (this.isCacheValid()) {
                this.updateDisplay();
                return;
            }

            const response = await clearRewardAPI.getRewardList();
            
            if (response.code === 200 || response.code === 0) {
                this._cacheData = response;
                this._cacheTime = Date.now();
                this.updateDisplay();
            } else {
                console.error('ClearRewardMain: 获取数据失败:', response.msg);
            }
        } catch (error) {
            console.error('ClearRewardMain: 加载数据失败:', error);
        }
    }

    /**
     * 检查缓存是否有效
     */
    private isCacheValid(): boolean {
        if (!this._cacheData || !this._cacheTime) {
            return false;
        }
        return (Date.now() - this._cacheTime) < this.CACHE_DURATION;
    }

    /**
     * 更新显示
     */
    private updateDisplay(): void {
        if (!this._cacheData) {
            console.error('ClearRewardMain: 没有数据可显示');
            return;
        }

        this.updateNotFullStarList();
        this.updateRewardList();
        this.updateAllRewardItemsStarSum();
    }

    /**
     * 更新未满星关卡列表
     */
    private updateNotFullStarList(): void {
        if (!this.notFullStarLayout || !this.rectStagePrefab) {
            console.error('ClearRewardMain: notFullStarLayout 或 rectStagePrefab 未设置');
            return;
        }

        // 清空现有列表
        this.notFullStarLayout.node.removeAllChildren();
        this._notFullStarItems = [];

        const userLevelList = this._cacheData.data.userLevelList || [];
        
        userLevelList.forEach((levelInfo: UserLevelInfo) => {
            const stageNode = instantiate(this.rectStagePrefab);
            this.notFullStarLayout.node.addChild(stageNode);
            this._notFullStarItems.push(stageNode);

            // 设置关卡标题
            const titleLabel = stageNode.getChildByName('title')?.getComponent(Label);
            if (titleLabel) {
                titleLabel.string = `第${levelInfo.level}关`;
            }
        });
    }

    /**
     * 更新奖励列表
     */
    private updateRewardList(): void {
        if (!this.rewardListLayout || !this.clearRewardItemPrefab) {
            console.error('ClearRewardMain: rewardListLayout 或 clearRewardItemPrefab 未设置');
            return;
        }

        // 清空现有列表
        this.rewardListLayout.node.removeAllChildren();
        this._rewardItems = [];

        const sysStarRewardlist = this._cacheData.data.sysStarRewardlist || [];
        
        sysStarRewardlist.forEach((starReward: SysStarReward) => {
            const rewardNode = instantiate(this.clearRewardItemPrefab);
            this.rewardListLayout.node.addChild(rewardNode);

            const clearRewardItem = rewardNode.getComponent(ClearRewardItem);
            if (clearRewardItem) {
                // 转换奖励数据
                const rewards = this.convertRewardToRewardData(starReward.reward);
                
                // 获取当前星星总数
                const currentStarSum = this.getTotalStars();
                
                // 设置数据
                clearRewardItem.setData(rewards, starReward.starNumber, false, currentStarSum);
                
                // 设置领取回调
                clearRewardItem.setClaimCallback((rewards: RewardData[]) => {
                    this.onClaimReward(starReward.id, rewards);
                });

                this._rewardItems.push(clearRewardItem);
            }
        });
    }

    /**
     * 转换奖励字符串为RewardData格式
     */
    private convertRewardToRewardData(rewardString: string): RewardData[] {
        try {
            // 使用统一的奖励解析函数
            const userItems = parseRewardToUserItems(rewardString);
            const rewardData: RewardData[] = [];

            // 转换为RewardData格式
            for (const userItem of userItems) {
                rewardData.push({
                    itemId: userItem.itemId,
                    count: userItem.amount,
                    isCollected: false
                });
            }

            return rewardData;
        } catch (error) {
            console.error('ClearRewardMain: 解析奖励数据失败:', error);
            return [];
        }
    }

    /**
     * 领取奖励回调
     */
    private async onClaimReward(finishId: number, rewards: RewardData[]): Promise<void> {
        try {
            const response = await clearRewardAPI.claimReward(finishId);
            
            if (response.code === 200 || response.code === 0) {
                // 显示奖励内容
                this.showRewardDialog(rewards);
                
                // 刷新数据
                this._cacheTime = 0; // 清除缓存，强制刷新
                await this.loadData();
            } else {
                console.error('ClearRewardMain: 奖励领取失败:', response.msg);
                this.showToast(response.msg || '奖励领取失败');
            }
        } catch (error) {
            console.error('ClearRewardMain: 领取奖励失败:', error);
            this.showToast('网络错误，请重试');
        } finally {
            // 重置所有奖励项的处理状态
            this._rewardItems.forEach(item => {
                item.resetProcessingState();
            });
        }
    }

    /**
     * 显示Toast提示
     */
    private showToast(message: string): void {
        // 这里可以调用全局的Toast组件
        // 实际项目中应该调用: director.emit('SHOW_TOAST', message);
    }

    /**
     * 显示奖励对话框
     * @param rewards 奖励数据数组
     */
    private showRewardDialog(rewards: RewardData[]): void {
        try {
            // 将 RewardData[] 转换为 UserItem[] 格式
            const userItems = rewards.map(reward => ({
                itemId: reward.itemId,
                amount: reward.count
            }));

            // 发送全局事件显示奖励对话框
            director.emit(game.gameEvent.DIALOG_ITEM_SHOW, userItems);
        } catch (error) {
            console.error('ClearRewardMain: 发送显示奖励事件失败:', error);
        }
    }

    /**
     * 强制刷新数据
     */
    public async forceRefresh(): Promise<void> {
        this._cacheTime = 0; // 清除缓存
        await this.loadData();
    }

    /**
     * 更新所有奖励项的星星总数
     */
    private updateAllRewardItemsStarSum(): void {
        const currentStarSum = this.getTotalStars();
        this._rewardItems.forEach(item => {
            item.updateCurrentStarSum(currentStarSum);
        });
    }

    /**
     * 获取缓存数据
     */
    public getCacheData(): ClearRewardListResponse | null {
        return this._cacheData;
    }

    /**
     * 获取总星星数
     */
    public getTotalStars(): number {
        return this._cacheData?.data.starSum || 0;
    }

    /**
     * 获取未满星关卡数量
     */
    public getNotFullStarCount(): number {
        return this._cacheData?.data.userLevelList?.length || 0;
    }

    /**
     * 获取奖励列表数量
     */
    public getRewardListCount(): number {
        return this._cacheData?.data.sysStarRewardlist?.length || 0;
    }

    /**
     * 清除数据
     */
    public clear(): void {
        this._cacheData = null;
        this._cacheTime = 0;
        this._notFullStarItems = [];
        this._rewardItems = [];

        if (this.notFullStarLayout) {
            this.notFullStarLayout.node.removeAllChildren();
        }

        if (this.rewardListLayout) {
            this.rewardListLayout.node.removeAllChildren();
        }
    }
}
