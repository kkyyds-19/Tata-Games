import { _decorator, Component, Node, Prefab, instantiate, Layout, Button } from 'cc';
import { RankingInfo } from '../../api/APITypes';
import { LeaderBoardIcon } from './LeaderBoardIcon';
import { LeaderBoardItem } from './LeaderBoardItem';
import { UserInfoData } from '../../user/UserInfoData';

const { ccclass, property } = _decorator;

/**
 * 排行榜类型枚举
 */
export enum LeaderBoardType {
    CHAPTER = 'chapter',    // 主线章节排行榜
    POWER = 'power'         // 战斗力排行榜
}

/**
 * 排行榜列表组件
 * 用于显示主线章节和战斗力排行榜
 */
@ccclass('LeaderBoardList')
export class LeaderBoardList extends Component {

    /**
     * 主线排行榜节点
     */
    @property(Node)
    public chapterRankingNode: Node = null;

    /**
     * 战斗力排行榜节点
     */
    @property(Node)
    public powerRankingNode: Node = null;

    /**
     * 第一名图标组件
     */
    @property(LeaderBoardIcon)
    public firstPlaceIcon: LeaderBoardIcon = null;

    /**
     * 第二名图标组件
     */
    @property(LeaderBoardIcon)
    public secondPlaceIcon: LeaderBoardIcon = null;

    /**
     * 第三名图标组件
     */
    @property(LeaderBoardIcon)
    public thirdPlaceIcon: LeaderBoardIcon = null;

    /**
     * 排行榜列表容器
     */
    @property(Layout)
    public rankingListLayout: Layout = null;

    /**
     * LeaderBoardItem预制体
     */
    @property(Prefab)
    public leaderBoardItemPrefab: Prefab = null;

    /**
     * 我的排名项
     */
    @property(LeaderBoardItem)
    public myRankingItem: LeaderBoardItem = null;

    /**
     * 关闭按钮
     */
    @property(Button)
    public closeButton: Button = null;

    /**
     * 当前排行榜类型
     */
    private _currentType: LeaderBoardType = LeaderBoardType.CHAPTER;

    /**
     * 排行榜数据（从父节点传入）
     */
    private _rankingData: RankingInfo[] = [];

    /**
     * 用户信息数据
     */
    private _userInfoData: UserInfoData = null;

    onLoad() {
        // 获取用户信息数据
        this._userInfoData = UserInfoData.getInstance();

        // 绑定关闭按钮事件
        if (this.closeButton) {
            this.closeButton.node.on('click', this.hide, this);
        }

        // 初始化显示
        this.updateRankingTypeDisplay();

        this.node.on(Node.EventType.TOUCH_START, () => {

        }, this);
    }

    start() {
        // 确保用户信息数据已初始化
        if (!this._userInfoData) {
            this._userInfoData = UserInfoData.getInstance();
        }
    }

    /**
     * 显示排行榜
     * @param type 排行榜类型
     */
    public show(type: LeaderBoardType = LeaderBoardType.CHAPTER): void {
        if (!this._userInfoData) {
            this._userInfoData = UserInfoData.getInstance();
        }
        this._currentType = type;
        this.node.active = true;
        
        // 更新排行榜类型显示
        this.updateRankingTypeDisplay();
        
        // 刷新UI显示
        this.refreshUI();
    }

    /**
     * 隐藏排行榜
     */
    public hide(): void {
        this.node.active = false;
    }

    /**
     * 更新排行榜数据（从父节点调用）
     * @param data 排行榜数据
     */
    public updateRankingData(data: RankingInfo[]): void {
        console.log('LeaderBoardList: 更新排行榜数据，长度:', data?.length || 0);
        this._rankingData = data || [];
        this.refreshUI();
    }

    /**
     * 更新排行榜类型显示
     */
    private updateRankingTypeDisplay(): void {
        if (this.chapterRankingNode) {
            this.chapterRankingNode.active = this._currentType === LeaderBoardType.CHAPTER;
        }
        
        if (this.powerRankingNode) {
            this.powerRankingNode.active = this._currentType === LeaderBoardType.POWER;
        }
    }

    /**
     * 刷新UI显示
     */
    private refreshUI(): void {
        this.updateTopThreeIcons();
        this.updateRankingList();
        this.updateMyRanking();
    }

    /**
     * 更新前三名图标
     */
    private updateTopThreeIcons(): void {
        console.log('LeaderBoardList: 更新前三名图标');
        const icons = [this.firstPlaceIcon, this.secondPlaceIcon, this.thirdPlaceIcon];
        
        for (let i = 0; i < icons.length; i++) {
            const icon = icons[i];
            const rankingData = this._rankingData[i];
            
            console.log(`LeaderBoardList: 第${i + 1}名数据:`, rankingData);
            
            if (icon && rankingData) {
                // 设置图标数据
                const iconData = {
                    name: rankingData.userName || rankingData.nickName || '未知玩家',
                    level: this.getPlayerLevel(rankingData.userId),
                    power: this._currentType === LeaderBoardType.POWER ? 
                           rankingData.fightPower : 
                           rankingData.chartNumber,
                    icon: rankingData.avatar || this.getPlayerAvatar(rankingData.userId)
                };
                
                icon.setData(iconData);
                icon.show();
            } else if (icon) {
                icon.clear();
                icon.hide();
            }
        }
    }

    /**
     * 更新排行榜列表
     */
    private updateRankingList(): void {
        if (!this.rankingListLayout || !this.leaderBoardItemPrefab) {
            console.warn('LeaderBoardList: 排行榜列表组件未配置');
            return;
        }

        // 清空现有列表
        this.rankingListLayout.node.removeAllChildren();

        // 创建排行榜项目（从第4名开始，因为前3名有特殊图标）
        for (let i = 3; i < this._rankingData.length; i++) {
            const rankingData = this._rankingData[i];
            const itemNode = instantiate(this.leaderBoardItemPrefab);
            const itemComponent = itemNode.getComponent(LeaderBoardItem);
            
            if (itemComponent) {
                // 设置排行榜数据
                const itemData = {
                    rank: i + 1,
                    name: rankingData.userName || rankingData.nickName || '未知玩家',
                    level: this.getPlayerLevel(rankingData.userId),
                    power: this._currentType === LeaderBoardType.POWER ? 
                           rankingData.fightPower : 
                           rankingData.chartNumber,
                    stage: this._currentType === LeaderBoardType.CHAPTER ? 
                           rankingData.chartNumber : 
                           0,
                    icon: rankingData.avatar || this.getPlayerAvatar(rankingData.userId)
                };
                
                // 确保节点可见
                itemNode.active = true;
                
                // 延迟设置数据，确保组件完全初始化
                this.scheduleOnce(() => {
                    // 设置显示类型
                    const displayType = this._currentType === LeaderBoardType.POWER ? 'power' : 'stage';
                    itemComponent.setData(itemData, displayType);
                }, 0.1);
            }
            
            this.rankingListLayout.node.addChild(itemNode);
        }
        
        // 强制更新布局
        this.rankingListLayout.updateLayout();
    }

    /**
     * 更新我的排名
     */
    private updateMyRanking(): void {
        if (!this.myRankingItem) {
            console.warn('LeaderBoardList: 我的排名组件未配置');
            return;
        }

        // 确保用户信息数据已初始化
        if (!this._userInfoData) {
            this._userInfoData = UserInfoData.getInstance();
        }

        const myUserId = this.getSafeUserId();
        const myRanking = this.findMyRanking(myUserId);
        
        if (myRanking) {
            // 我在前50名内
            const myData = {
                rank: myRanking.rank,
                name: this._userInfoData?.getUserName() || '未知玩家',
                level: this._userInfoData?.getLevel() || 1,
                power: this._currentType === LeaderBoardType.POWER ? 
                       (this._userInfoData?.getFightPower() || 0) : 
                       0,
                stage: this._currentType === LeaderBoardType.CHAPTER ? 
                       (this._userInfoData?.getCurrentStage() || 1) : 
                       0,
                icon: this._userInfoData?.getAvatar() || 'avatar_default'
            };
            
            const displayType = this._currentType === LeaderBoardType.POWER ? 'power' : 'stage';
            // 延迟设置数据，确保组件完全初始化
            this.scheduleOnce(() => {
                this.myRankingItem.setData(myData, displayType);
            }, 0.1);
        } else {
            // 我未上榜
            const myData = {
                rank: 0, // 未上榜
                name: this._userInfoData?.getUserName() || '未知玩家',
                level: this._userInfoData?.getLevel() || 1,
                power: this._currentType === LeaderBoardType.POWER ? 
                       (this._userInfoData?.getFightPower() || 0) : 
                       0,
                stage: this._currentType === LeaderBoardType.CHAPTER ? 
                       (this._userInfoData?.getCurrentStage() || 1) : 
                       0,
                icon: this._userInfoData?.getAvatar() || 'avatar_default'
            };
            
            const displayType = this._currentType === LeaderBoardType.POWER ? 'power' : 'stage';
            // 延迟设置数据，确保组件完全初始化
            this.scheduleOnce(() => {
                this.myRankingItem.setData(myData, displayType);
            }, 0.1);
        }
    }

    /**
     * 查找我的排名
     */
    private findMyRanking(myUserId: number): { rank: number, data: RankingInfo } | null {
        for (let i = 0; i < this._rankingData.length; i++) {
            if (this._rankingData[i].userId === myUserId) {
                return {
                    rank: i + 1,
                    data: this._rankingData[i]
                };
            }
        }
        return null;
    }

    /**
     * 获取玩家等级（这里可以根据实际需求实现）
     */
    private getPlayerLevel(userId: number): number {
        // 这里可以根据userId从服务器获取玩家等级
        // 暂时返回一个默认值
        return 1;
    }

    /**
     * 获取玩家头像（这里可以根据实际需求实现）
     */
    private getPlayerAvatar(userId: number): string {
        // 这里可以根据userId从服务器获取玩家头像
        // 暂时返回一个默认值
        return 'avatar_default';
    }

    /**
     * 安全获取用户ID
     */
    private getSafeUserId(): number {
        if (!this._userInfoData) {
            console.warn('LeaderBoardList: 用户信息数据未初始化，返回默认用户ID');
            return 0;
        }
        
        const userId = this._userInfoData.getUserId();
        if (!userId) {
            console.warn('LeaderBoardList: 用户ID为空，返回默认用户ID');
            return 0;
        }
        
        return parseInt(userId) || 0;
    }

    /**
     * 切换排行榜类型
     */
    public switchRankingType(type: LeaderBoardType): void {
        if (this._currentType !== type) {
            this._currentType = type;
            this.show(type);
        }
    }
}
