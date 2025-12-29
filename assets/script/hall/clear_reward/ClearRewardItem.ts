import { _decorator, Component, Layout, Prefab, instantiate, Label, Button, Node, Sprite, Material } from 'cc';
import { GameItemIcon } from '../GameItemIcon';

const { ccclass, property } = _decorator;

/**
 * 奖励数据结构
 */
export interface RewardData {
    itemId: number;      // 道具ID
    count: number;       // 道具数量
    isCollected?: boolean; // 是否已领取
}

/**
 * 通关奖励单项组件
 * 用于显示单个关卡的通关奖励
 */
@ccclass('ClearRewardItem')
export class ClearRewardItem extends Component {

    @property(Layout)
    public rewardListLayout: Layout = null!;

    @property(Prefab)
    public gameItemIconPrefab: Prefab = null!;

    @property(Label)
    public starCountLabel: Label = null!;

    @property(Button)
    public claimButton: Button = null!;

    @property(Label)
    public claimButtonLabel: Label = null!;


    private _rewards: RewardData[] = [];
    private _starCount: number = 0;
    private _isClaimed: boolean = false;
    private _currentStarSum: number = 0; // 当前星星总数
    private _onClaimCallback: ((rewards: RewardData[]) => void) | null = null;
    private _isProcessingClaim: boolean = false; // 防止重复点击

    onLoad() {
        this.initEventListeners();
    }

    /**
     * 初始化事件监听
     */
    private initEventListeners(): void {
        if (this.claimButton) {
            this.claimButton.node.on(Button.EventType.CLICK, this.onClaimButtonClicked, this);
        }
    }

    /**
     * 设置奖励数据
     * @param rewards 奖励数据数组
     * @param starCount 星星数量
     * @param isClaimed 是否已领取
     * @param currentStarSum 当前星星总数
     */
    public setData(rewards: RewardData[], starCount: number, isClaimed: boolean = false, currentStarSum: number = 0): void {
        this._rewards = rewards || [];
        this._starCount = starCount;
        this._isClaimed = isClaimed;
        this._currentStarSum = currentStarSum;

        this.updateDisplay();
    }

    /**
     * 更新显示
     */
    private updateDisplay(): void {
        this.updateRewardList();
        this.updateStarCount();
        this.updateClaimStatus();
    }

    /**
     * 更新奖励列表
     */
    private updateRewardList(): void {
        if (!this.rewardListLayout || !this.gameItemIconPrefab) {
            console.error('ClearRewardItem: rewardListLayout 或 gameItemIconPrefab 未设置');
            return;
        }

        // 清空现有列表
        this.rewardListLayout.node.removeAllChildren();

        // 创建奖励图标
        this._rewards.forEach((reward, index) => {
            const itemNode = instantiate(this.gameItemIconPrefab);
            this.rewardListLayout.node.addChild(itemNode);

            const gameItemIcon = itemNode.getComponent(GameItemIcon);
            if (gameItemIcon) {
                gameItemIcon.init(reward.itemId);
                gameItemIcon.setCount(reward.count);
                gameItemIcon.setCollected(reward.isCollected || false);
            }
        });
    }

    /**
     * 更新星星数量显示
     */
    private updateStarCount(): void {
        if (this.starCountLabel) {
            this.starCountLabel.string = `${this._currentStarSum}/${this._starCount}`;
        }
    }

    /**
     * 更新领取状态显示
     */
    private updateClaimStatus(): void {
        if (!this.claimButton) {
            return;
        }

        // 检查是否达到领取条件
        const canClaim = this._currentStarSum >= this._starCount;
        
        // 更新按钮交互状态
        this.claimButton.interactable = canClaim && !this._isClaimed;
        
        // 更新按钮标签
        if (this.claimButtonLabel) {
            if (canClaim) {
                this.claimButtonLabel.string = this._isClaimed ? '已领取' : '领取';
            } else {
                this.claimButtonLabel.string = '未完成';
            }
        }
        
        // 更新按钮灰度效果
        const buttonSprite = this.claimButton.getComponent(Sprite);
        if (buttonSprite) {
            if (canClaim && !this._isClaimed) {
                // 可以领取：正常显示
                buttonSprite.grayscale = false;
            } else {
                // 不能领取或已领取：变灰
                buttonSprite.grayscale = true;
            }
        }
    }

    /**
     * 设置领取回调
     * @param callback 领取回调函数
     */
    public setClaimCallback(callback: (rewards: RewardData[]) => void): void {
        this._onClaimCallback = callback;
    }

    /**
     * 领取按钮点击事件
     */
    private onClaimButtonClicked(): void {
        if (this._isClaimed) {
            return;
        }

        // 检查是否达到领取条件
        if (this._currentStarSum < this._starCount) {
            this.showToast('星星数量不足，无法领取');
            return;
        }

        if (this._isProcessingClaim) {
            this.showToast('正在处理中，请稍候');
            return;
        }

        if (this._onClaimCallback) {
            this._isProcessingClaim = true;
            this._onClaimCallback(this._rewards);
        }
    }

    /**
     * 设置为已领取状态
     */
    public setClaimed(): void {
        this._isClaimed = true;
        this.updateClaimStatus();
    }

    /**
     * 获取奖励数据
     */
    public getRewards(): RewardData[] {
        return this._rewards;
    }

    /**
     * 获取星星数量
     */
    public getStarCount(): number {
        return this._starCount;
    }

    /**
     * 是否已领取
     */
    public isClaimed(): boolean {
        return this._isClaimed;
    }

    /**
     * 更新当前星星总数
     * @param currentStarSum 当前星星总数
     */
    public updateCurrentStarSum(currentStarSum: number): void {
        this._currentStarSum = currentStarSum;
        this.updateClaimStatus();
    }

 

    /**
     * 显示Toast提示
     */
    private showToast(message: string): void {
        // 这里可以调用全局的Toast组件
        // 实际项目中应该调用: director.emit('SHOW_TOAST', message);
    }

    /**
     * 重置处理状态（供外部调用）
     */
    public resetProcessingState(): void {
        this._isProcessingClaim = false;
    }

    /**
     * 清除数据
     */
    public clear(): void {
        this._rewards = [];
        this._starCount = 0;
        this._isClaimed = false;
        this._currentStarSum = 0;
        this._onClaimCallback = null;
        this._isProcessingClaim = false;

        if (this.rewardListLayout) {
            this.rewardListLayout.node.removeAllChildren();
        }

        this.updateDisplay();
    }
}
