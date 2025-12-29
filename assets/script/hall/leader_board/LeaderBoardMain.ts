import { _decorator, Component, Node, Button } from 'cc';
import { LeaderBoardList, LeaderBoardType } from './LeaderBoardList';
import { LeaderBoardIcon } from './LeaderBoardIcon';
import { rankingAPI } from '../../api/RankingAPI';
import { RankingInfo } from '../../api/APITypes';
import { UserInfoData } from '../../user/UserInfoData';

const { ccclass, property } = _decorator;

/**
 * 排行榜主入口组件
 * 作为LeaderBoardList的父节点，负责排行榜的整体控制和切换
 */
@ccclass('LeaderBoardMain')
export class LeaderBoardMain extends Component {

    /**
     * 主线章节排行榜按钮
     */
    @property(Button)
    public chapterButton: Button = null;

    /**
     * 战斗力排行榜按钮
     */
    @property(Button)
    public powerButton: Button = null;

    /**
     * 排行榜列表组件
     */
    @property(LeaderBoardList)
    public leaderBoardList: LeaderBoardList = null;

    /**
     * 关闭按钮
     */
    @property(Button)
    public closeButton: Button = null;

    /**
     * 第一名主线排行榜玩家图标
     */
    @property(LeaderBoardIcon)
    public chapterFirstPlaceIcon: LeaderBoardIcon = null;

    /**
     * 第一名战力排行榜玩家图标
     */
    @property(LeaderBoardIcon)
    public powerFirstPlaceIcon: LeaderBoardIcon = null;

    /**
     * 当前选中的排行榜类型
     */
    private _currentType: LeaderBoardType = LeaderBoardType.CHAPTER;

    /**
     * 主线章节排行榜数据缓存
     */
    private _chapterRankingData: RankingInfo[] = [];

    /**
     * 战斗力排行榜数据缓存
     */
    private _powerRankingData: RankingInfo[] = [];

    /**
     * 主线章节缓存时间戳
     */
    private _chapterCacheTime: number = 0;

    /**
     * 战斗力缓存时间戳
     */
    private _powerCacheTime: number = 0;

    /**
     * 缓存有效期（1分钟）
     */
    private readonly CACHE_DURATION: number = 60 * 1000;

    /**
     * 用户信息数据
     */
    private _userInfoData: UserInfoData = null;

    onLoad() {
        // 获取用户信息数据
        this._userInfoData = UserInfoData.getInstance();

        this.initButtons();
        this.updateButtonStates();
        this.updateFirstPlaceIcons();
        
        
        // 默认隐藏排行榜列表
        if (this.leaderBoardList) {
            this.leaderBoardList.hide();
        }
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
     * 初始化按钮事件
     */
    private initButtons(): void {
        // 主线章节排行榜按钮
        if (this.chapterButton) {
            this.chapterButton.node.on('click', () => {
                this.switchToChapterRanking();
            }, this);
        }

        // 战斗力排行榜按钮
        if (this.powerButton) {
            this.powerButton.node.on('click', () => {
                this.switchToPowerRanking();
            }, this);
        }

        // 关闭按钮
        if (this.closeButton) {
            this.closeButton.node.on('click', () => {
                this.hide();
            }, this);
        }
    }

        /**
     * 显示排行榜
     * 获取服务器排行榜数据，初始化第一名图标，等待用户选择
     */
    public async show(): Promise<void> {
        // 确保用户信息数据已初始化
        if (!this._userInfoData) {
            this._userInfoData = UserInfoData.getInstance();
        }
        
        this.node.active = true;
        
        // 加载所有排行榜数据
        await this.loadAllRankingData();
        
        // 初始化第一名图标
        this.updateFirstPlaceIcons();
        
        // 默认显示主线章节排行榜
        this._currentType = LeaderBoardType.CHAPTER;
        this.updateButtonStates();
        
        // 默认隐藏排行榜列表，等待用户选择
        if (this.leaderBoardList) {
            this.leaderBoardList.hide();
        }
    }

    /**
     * 隐藏排行榜
     */
    public hide(): void {
        this.node.active = false;
        
        // 同时隐藏排行榜列表
        if (this.leaderBoardList) {
            this.leaderBoardList.hide();
        }
    }

    /**
     * 切换到主线章节排行榜
     */
    public switchToChapterRanking(): void {
        this.switchRankingType(LeaderBoardType.CHAPTER);
    }

    /**
     * 切换到战斗力排行榜
     */
    public switchToPowerRanking(): void {
        this.switchRankingType(LeaderBoardType.POWER);
    }

    /**
     * 切换排行榜类型
     * @param type 排行榜类型
     */
    private switchRankingType(type: LeaderBoardType): void {
        this._currentType = type;
        this.updateButtonStates();
        this.updateFirstPlaceIcons();

        // 切换排行榜显示（数据已缓存）
        this.switchRankingDisplay(type);
    }

    /**
     * 更新按钮状态
     */
    private updateButtonStates(): void {
        // 主线章节按钮状态
        if (this.chapterButton) {
            // this.chapterButton.interactable = this._currentType !== LeaderBoardType.CHAPTER;
            // 可以在这里添加视觉反馈，比如改变按钮颜色或图标
        }

        // 战斗力按钮状态
        if (this.powerButton) {
            // this.powerButton.interactable = this._currentType !== LeaderBoardType.POWER;
            // 可以在这里添加视觉反馈，比如改变按钮颜色或图标
        }
    }

    /**
     * 更新第一名图标显示
     */
    private updateFirstPlaceIcons(): void {
        // 确保用户信息数据已初始化
        if (!this._userInfoData) {
            console.warn('LeaderBoardMain: 用户信息数据未初始化');
            this._userInfoData = UserInfoData.getInstance();
        }

        // 更新主线章节第一名图标
        if (this.chapterFirstPlaceIcon) {
            const chapterFirst = this._chapterRankingData[0];
            if (chapterFirst) {
                const iconData = {
                    name: chapterFirst.userName || chapterFirst.nickName || '未知玩家',
                    level: this.getPlayerLevel(chapterFirst.userId),
                    power: chapterFirst.chartNumber,
                    icon: chapterFirst.avatar || this.getPlayerAvatar(chapterFirst.userId)
                };
                this.chapterFirstPlaceIcon.setData(iconData);
                this.chapterFirstPlaceIcon.show();
            } else {
                this.chapterFirstPlaceIcon.clear();
                this.chapterFirstPlaceIcon.hide();
            }
        }

        // 更新战斗力第一名图标
        if (this.powerFirstPlaceIcon) {
            const powerFirst = this._powerRankingData[0];
            if (powerFirst) {
                const iconData = {
                    name: powerFirst.userName || powerFirst.nickName || '未知玩家',
                    level: this.getPlayerLevel(powerFirst.userId),
                    power: powerFirst.fightPower,
                    icon: powerFirst.avatar || this.getPlayerAvatar(powerFirst.userId)
                };
                this.powerFirstPlaceIcon.setData(iconData);
                this.powerFirstPlaceIcon.show();
            } else {
                this.powerFirstPlaceIcon.clear();
                this.powerFirstPlaceIcon.hide();
            }
        }
    }

    /**
     * 请求排行榜数据
     */
    private async requestRankingData(type: LeaderBoardType): Promise<void> {
        try {
            let response;
            
            if (type === LeaderBoardType.CHAPTER) {
                response = await rankingAPI.getChapterRanking(1, 50);
            } else {
                response = await rankingAPI.getFightPowerRanking(1, 50);
            }

            if (response && response.code === 200) {
                // 修复数据解析：服务器直接返回数组，不是嵌套在data.data中
                let rankingData: RankingInfo[] = [];
                if (Array.isArray(response.data)) {
                    rankingData = response.data;
                } else if (response.data && Array.isArray(response.data.data)) {
                    rankingData = response.data.data;
                }

                // 根据类型更新对应的缓存
                if (type === LeaderBoardType.CHAPTER) {
                    this._chapterRankingData = rankingData;
                    this._chapterCacheTime = Date.now();
                } else {
                    this._powerRankingData = rankingData;
                    this._powerCacheTime = Date.now();
                }

                // 更新第一名图标
                this.updateFirstPlaceIcons();

                // 通知列表组件更新数据
                if (this.leaderBoardList) {
                    this.leaderBoardList.updateRankingData(rankingData);
                }
            } else {
                console.error('LeaderBoardMain: 排行榜数据请求失败:', response?.msg);
            }
        } catch (error) {
            console.error('LeaderBoardMain: 请求排行榜数据时发生错误:', error);
        }
    }

    /**
     * 检查缓存是否有效
     */
    private isCacheValid(type: LeaderBoardType): boolean {
        if (type === LeaderBoardType.CHAPTER) {
            return this._chapterRankingData.length > 0 && 
                   (Date.now() - this._chapterCacheTime) < this.CACHE_DURATION;
        } else {
            return this._powerRankingData.length > 0 && 
                   (Date.now() - this._powerCacheTime) < this.CACHE_DURATION;
        }
    }

    /**
     * 获取当前排行榜数据
     */
    public getCurrentRankingData(): RankingInfo[] {
        if (this._currentType === LeaderBoardType.CHAPTER) {
            return this._chapterRankingData;
        } else {
            return this._powerRankingData;
        }
    }

    /**
     * 获取指定类型的排行榜数据
     */
    public getRankingData(type: LeaderBoardType): RankingInfo[] {
        if (type === LeaderBoardType.CHAPTER) {
            return this._chapterRankingData;
        } else {
            return this._powerRankingData;
        }
    }

    /**
     * 切换排行榜显示（数据已缓存，只切换显示）
     */
    public switchRankingDisplay(type: LeaderBoardType): void {
        this._currentType = type;
        this.updateButtonStates();
        
        // 显示排行榜列表并传递数据
        const data = this.getRankingData(type);
        
        if (this.leaderBoardList) {
            this.leaderBoardList.updateRankingData(data);
            this.leaderBoardList.show(type); // 传递类型给LeaderBoardList
        }
    }

    /**
     * 加载所有排行榜数据（主线章节和战斗力）
     */
    public async loadAllRankingData(): Promise<void> {
        // 并行加载两种排行榜数据
        const promises: Promise<void>[] = [];
        
        // 检查主线章节排行榜缓存
        if (!this.isCacheValid(LeaderBoardType.CHAPTER)) {
            promises.push(this.requestRankingData(LeaderBoardType.CHAPTER));
        }
        
        // 检查战斗力排行榜缓存
        if (!this.isCacheValid(LeaderBoardType.POWER)) {
            promises.push(this.requestRankingData(LeaderBoardType.POWER));
        }
        
        // 等待所有请求完成
        if (promises.length > 0) {
            await Promise.all(promises);
        }
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
            console.warn('LeaderBoardMain: 用户信息数据未初始化，返回默认用户ID');
            return 0;
        }
        
        const userId = this._userInfoData.getUserId();
        if (!userId) {
            console.warn('LeaderBoardMain: 用户ID为空，返回默认用户ID');
            return 0;
        }
        
        return parseInt(userId) || 0;
    }

    /**
     * 获取当前排行榜类型
     */
    public getCurrentType(): LeaderBoardType {
        return this._currentType;
    }

    /**
     * 强制刷新当前排行榜数据
     */
    public async forceRefresh(): Promise<void> {
        if (this._currentType === LeaderBoardType.CHAPTER) {
            this._chapterCacheTime = 0; // 清除缓存
        } else {
            this._powerCacheTime = 0; // 清除缓存
        }
        await this.requestRankingData(this._currentType);
    }

    /**
     * 强制刷新指定类型的排行榜数据
     */
    public async forceRefreshType(type: LeaderBoardType): Promise<void> {
        if (type === LeaderBoardType.CHAPTER) {
            this._chapterCacheTime = 0; // 清除缓存
        } else {
            this._powerCacheTime = 0; // 清除缓存
        }
        await this.requestRankingData(type);
    }

    /**
     * 检查排行榜是否显示
     */
    public isVisible(): boolean {
        return this.node.active;
    }
}
