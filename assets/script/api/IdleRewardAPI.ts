import { BaseAPI } from "./BaseAPI";
import { 
    IdleRewardResponse,
    SweepRewardResponse,
    IdleRewardViewResponse,
    IdleRewardViewData
} from "./APITypes";

/**
 * 挂机收益相关 API
 */
export class IdleRewardAPI extends BaseAPI {
    /**
     * 玩家领取挂机奖励
     * @returns Promise<IdleRewardResponse>
     */
    receiveReward(): Promise<IdleRewardResponse> {
        return this.request('idleReward.receiveReward', {}, '领取挂机奖励失败')
            .then((response: IdleRewardResponse) => {
                console.log('领取挂机奖励响应:', response);
                return response;
            });
    }

    /**
     * 玩家领取扫荡奖励
     * @returns Promise<SweepRewardResponse>
     */
    sweepReward(): Promise<SweepRewardResponse> {
        return this.request('idleReward.sweepReward', {}, '领取扫荡奖励失败')
            .then((response: SweepRewardResponse) => {
                console.log('领取扫荡奖励响应:', response);
                return response;
            });
    }

    /**
     * 挂机收益页面数据展示
     * @returns Promise<IdleRewardViewResponse>
     */
    getViewData(): Promise<IdleRewardViewResponse> {
        return this.request('idleReward.getViewData', {}, '获取挂机收益页面数据失败')
            .then((response: IdleRewardViewResponse) => {
                console.log('挂机收益页面数据响应:', response);
                return response;
            });
    }

    /**
     * 测试挂机收益API
     */
    testIdleRewardAPI() {
        console.log('测试挂机收益API:');
        
        // 测试获取页面数据
        this.getViewData().then(response => {
            const data = response.data;
            console.log('挂机收益页面数据测试成功:', {
                currentLevel: data.currentLevel,
                gold: data.gold,
                experience: data.experience,
                timeGap: data.timeGap,
                rewardKeys: Object.keys(data.reward)
            });
        }).catch(error => {
            console.error('挂机收益页面数据测试失败:', error);
        });

        // 测试领取挂机奖励
        this.receiveReward().then(response => {
            console.log('领取挂机奖励测试成功:', response);
        }).catch(error => {
            console.error('领取挂机奖励测试失败:', error);
        });

        // 测试领取扫荡奖励
        this.sweepReward().then(response => {
            console.log('领取扫荡奖励测试成功:', response);
        }).catch(error => {
            console.error('领取扫荡奖励测试失败:', error);
        });
    }

    /**
     * 格式化时间差为可读格式
     * @param timeGap 时间差（毫秒）
     * @returns 格式化后的时间字符串
     */
    formatTimeGap(timeGap: number): string {
        const hours = Math.floor(timeGap / (1000 * 60 * 60));
        const minutes = Math.floor((timeGap % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeGap % (1000 * 60)) / 1000);
        
        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟${seconds}秒`;
        } else {
            return `${seconds}秒`;
        }
    }

    /**
     * 计算可领取的奖励数量
     * @param timeGap 时间差（毫秒）
     * @param rewardPerHour 每小时奖励数量
     * @returns 可领取的奖励数量
     */
    calculateRewardAmount(timeGap: number, rewardPerHour: number): number {
        const hours = timeGap / (1000 * 60 * 60);
        return Math.floor(hours * rewardPerHour);
    }

    /**
     * 验证挂机收益数据结构
     * @param data 挂机收益数据
     * @returns 是否有效
     */
    static validateIdleRewardData(data: IdleRewardViewData): boolean {
        return (
            typeof data.currentLevel === 'number' &&
            typeof data.gold === 'string' &&
            typeof data.experience === 'string' &&
            typeof data.timeGap === 'number' &&
            typeof data.reward === 'object' &&
            data.reward !== null
        );
    }

    /**
     * 解析奖励字符串为对象
     * @param rewardString 奖励字符串
     * @returns 解析后的奖励对象
     */
    static parseRewardString(rewardString: string): Record<string, number> {
        try {
            return JSON.parse(rewardString);
        } catch (error) {
            console.error('解析奖励字符串失败:', error);
            return {};
        }
    }
}

// 创建并导出单例实例
export const idleRewardAPI = new IdleRewardAPI();

/**
 * 使用示例：
 * 
 * // 获取挂机收益页面数据
 * idleRewardAPI.getViewData().then(response => {
 *     const data = response.data;
 *     console.log('当前关卡:', data.currentLevel);
 *     console.log('每小时金币:', data.gold);
 *     console.log('每小时经验:', data.experience);
 *     console.log('时间差:', idleRewardAPI.formatTimeGap(data.timeGap));
 *     console.log('奖励:', data.reward);
 * });
 * 
 * // 领取挂机奖励
 * idleRewardAPI.receiveReward().then(response => {
 *     console.log('挂机奖励领取成功');
 * });
 * 
 * // 领取扫荡奖励
 * idleRewardAPI.sweepReward().then(response => {
 *     console.log('扫荡奖励领取成功');
 * });
 */ 