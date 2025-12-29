import { taskAPI } from "../../api/API";
import { GameItemConfig, gameItemConfigs } from "../../global/config/GameItemConfig";
import { UserItem } from "../../user/UserItemData";
import { 
    TaskType, 
    TaskInfo, 
    DailyTaskResponse 
} from "../../api/APITypes";

// 单个任务对象结构（扩展TaskInfo，添加本地需要的字段）
export interface DailyTask extends Omit<TaskInfo, 'reward'> {
    taskType: TaskType;
    reward: UserItem[];
}

export class DailyTaskHelper {
    public static dailyTaskList: DailyTask[] = [];
    public static refreshTime: number = 0;
    public static countdownInterval: number = 0; // 倒计时定时器ID

    // 解析 reward 字段
    private static parseReward(raw: string): UserItem[] {
        const result: UserItem[] = [];
        try {
            const obj = JSON.parse(raw);
            for (const key in obj) {
                const amount = obj[key];
                const itemConfig = gameItemConfigs.find(config => config.materialKey === key);
                if (itemConfig) {
                    result.push({
                        itemId: itemConfig.id,
                        amount: amount
                    });
                } else {
                    console.warn(`未找到 materialKey=${key} 对应的物品配置`);
                }
            }
        } catch (e) {
            console.warn("无法解析 reward 字段:", raw, e);
        }
        return result;
    }

    // 获取任务类型枚举（从服务器返回的taskType字段）
    private static getTaskType(taskType: string): TaskType {
        // 根据服务器返回的taskType字符串映射到枚举
        switch (taskType) {
            case 'recharge':
                return TaskType.RECHARGE;
            case 'hunter':
                return TaskType.HUNTER;
            case 'advertisement':
                return TaskType.ADVERTISEMENT;
            case 'up':
                return TaskType.UP;
            case 'share':
                return TaskType.SHARE;
            case 'shop':
                return TaskType.SHOP;
            case 'account':
                return TaskType.ACCOUNT;
            case 'advertisement_account':
                return TaskType.ADVERTISEMENT_ACCOUNT;
            default:
                console.warn(`未知的任务类型标识符: ${taskType}`);
                return TaskType.SHARE; // 默认返回分享类型
        }
    }

    // 解析任务列表
    private static parseTaskList(data: TaskInfo[]): void {
        this.dailyTaskList = [];
        for (let i = 0; i < data.length; i++) {
            const taskInfo = data[i];
            try {
                // 创建扩展的DailyTask对象
                const task: DailyTask = {
                    ...taskInfo,
                    taskType: this.getTaskType(taskInfo.taskType), // 使用服务器返回的taskType
                    reward: this.parseReward(taskInfo.reward)
                };
                this.dailyTaskList.push(task);
            } catch (error) {
                console.warn(`解析任务 ${i} 失败:`, error, taskInfo);
            }
        }
    }

    // 获取每日任务信息
    public static getDailyTaskInfo(
        success: (data: any) => void,
        error: (error: any) => void
    ): Promise<void> {
        return taskAPI.getDailyTaskInfo()
            .then((result: DailyTaskResponse) => {
                if (result.code === 200) {
                    // currentTime 是服务器当前时间，用于计算下一个刷新时间
                    const serverTime = typeof result.data.currentTime === 'string' 
                        ? parseInt(result.data.currentTime) 
                        : result.data.currentTime;
                    
                    // 计算下一个凌晨00:00:00的时间戳
                    this.refreshTime = this.calculateNextRefreshTime(serverTime);
                    
                    this.parseTaskList(result.data.tasks);
                    success('ok');
                } else {
                    error(result);
                }
            })
            .catch(err => {
                error(err);
            });
    }

    // 计算下一个凌晨00:00:00的时间戳
    private static calculateNextRefreshTime(currentTime: number): number {
        const date = new Date(currentTime);
        
        // 设置为当天的凌晨00:00:00
        date.setHours(0, 0, 0, 0);
        
        // 如果当前时间已经过了今天的凌晨，则设置为明天的凌晨
        if (currentTime >= date.getTime()) {
            date.setDate(date.getDate() + 1);
        }
        
        return date.getTime();
    }

    // 格式化倒计时时间
    public static formatCountdown(): string {
        if (this.refreshTime <= 0) {
            return '刷新时间: 未知';
        }

        const now = Date.now();
        const timeDiff = this.refreshTime - now;

        if (timeDiff <= 0) {
            return '刷新时间: 已过期';
        }

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        return `刷新时间: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // 开始倒计时
    public static startCountdown(callback: (timeString: string) => void): void {
        // 清除之前的定时器
        this.stopCountdown();

        // 立即执行一次
        callback(this.formatCountdown());

        // 每秒更新一次
        this.countdownInterval = setInterval(() => {
            callback(this.formatCountdown());
        }, 1000) as any;
    }

    // 停止倒计时
    public static stopCountdown(): void {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = 0;
        }
    }

    // 执行任务进度
    private static executeTask(
        taskType: TaskType,
        number: number = 1,
        success?: (data: any) => void,
        error?: (error: any) => void
    ): Promise<void> {
        // 将TaskType枚举转换为字符串
        const taskTypeString = this.taskTypeToString(taskType);
        return taskAPI.executeTask(taskTypeString, number)
            .then((result) => {
                if(result.code == 200){
                    if(success) success(result);
                }else{
                    if(error) error(result);
                }
            })
            .catch(err => {
                if (error) error(err);
            });
    }

    // 将TaskType枚举转换为字符串
    private static taskTypeToString(taskType: TaskType): string {
        switch (taskType) {
            case TaskType.RECHARGE:
                return 'recharge';
            case TaskType.HUNTER:
                return 'hunter';
            case TaskType.ADVERTISEMENT:
                return 'advertisement';
            case TaskType.UP:
                return 'up';
            case TaskType.SHARE:
                return 'share';
            case TaskType.SHOP:
                return 'shop';
            case TaskType.ACCOUNT:
                return 'account';
            case TaskType.ADVERTISEMENT_ACCOUNT:
                return 'advertisement_account';
            default:
                return 'share';
        }
    }

    // 领取任务奖励
    public static claimTaskReward(
        taskId: number,
        success?: (data: any) => void,
        error?: (error: any) => void
    ): Promise<void> {
        return taskAPI.claimTaskReward(taskId)
            .then((result) => {
                if(result.code == 200){
                    if(success) success(result);
                }else{
                    if(error) error(result);
                }
            })
            .catch(err => {
                if (error) error(err);
            });
    }

    // ========== 日常任务完成函数 ==========

    /**
     * 升级英雄任务完成（寂静函数，无回调，已完成则不发送）
     */
    public static completeHeroUpgrade(heroCount: number = 1): void {
        const tasks = this.getTasksByType(TaskType.UP);
        if (tasks.length > 0 && tasks.every(task => this.isTaskCompleted(task.id))) {
            return;
        }
        this.executeTask(TaskType.UP, heroCount);
    }

    /**
     * 购买商店商品任务完成（寂静函数，无回调，已完成则不发送）
     */
    public static completeShopPurchase(itemCount: number = 1): void {
        const tasks = this.getTasksByType(TaskType.SHOP);
        if (tasks.length > 0 && tasks.every(task => this.isTaskCompleted(task.id))) {
            return;
        }
        this.executeTask(TaskType.SHOP, itemCount);
    }

    /**
     * 击杀怪物任务完成（寂静函数，无回调，已完成则不发送）
     */
    public static completeMonsterKill(monsterCount: number = 1): void {
        const tasks = this.getTasksByType(TaskType.HUNTER);
        if (tasks.length > 0 && tasks.every(task => this.isTaskCompleted(task.id))) {
            return;
        }
        this.executeTask(TaskType.HUNTER, monsterCount);
    }

    /**
     * 充值任务完成（寂静函数，无回调，已完成则不发送）
     */
    public static completeRecharge(rechargeAmount: number = 1): void {
        const tasks = this.getTasksByType(TaskType.RECHARGE);
        if (tasks.length > 0 && tasks.every(task => this.isTaskCompleted(task.id))) {
            return;
        }
        this.executeTask(TaskType.RECHARGE, rechargeAmount);
    }

    /**
     * 观看广告任务完成
     * @param adCount 观看的广告数量，默认为1
     * @param success 成功回调
     * @param error 错误回调
     */
    public static completeAdvertisement(
        adCount: number = 1,
        success?: (data: any) => void,
        error?: (error: any) => void
    ): Promise<void> {
        return this.executeTask(TaskType.ADVERTISEMENT, adCount, success, error);
    }

    /**
     * 分享游戏任务完成
     * @param shareCount 分享次数，默认为1
     * @param success 成功回调
     * @param error 错误回调
     */
    public static completeShare(
        shareCount: number = 1,
        success?: (data: any) => void,
        error?: (error: any) => void
    ): Promise<void> {
        return this.executeTask(TaskType.SHARE, shareCount, success, error);
    }

    /**
     * 获取指定类型的任务
     * @param taskType 任务类型
     * @returns 任务列表
     */
    public static getTasksByType(taskType: TaskType): DailyTask[] {
        return this.dailyTaskList.filter(task => task.taskType === taskType);
    }

    /**
     * 检查任务是否已完成
     * @param taskId 任务ID
     * @returns 是否已完成
     */
    public static isTaskCompleted(taskId: number): boolean {
        const task = this.dailyTaskList.find(t => t.id === taskId);
        return task ? task.userFinishAccount >= task.taskAccount : false;
    }

    /**
     * 检查任务是否已领取奖励
     * @param taskId 任务ID
     * @returns 是否已领取
     */
    public static isTaskRewardClaimed(taskId: number): boolean {
        const task = this.dailyTaskList.find(t => t.id === taskId);
        return task ? task.isReceive === 1 : false;
    }
}
