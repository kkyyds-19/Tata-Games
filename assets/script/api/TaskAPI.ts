import { BaseAPI } from "./BaseAPI";
import { 
    DailyTaskResponse,
    ExecuteTaskRequest,
    ExecuteTaskResponse,
    ClaimTaskRewardRequest,
    ClaimTaskRewardResponse
} from "./APITypes";

/**
 * 任务相关 API
 */
export class TaskAPI extends BaseAPI {
    /**
     * 获取每日任务信息
     * @returns Promise<DailyTaskResponse>
     */
    getDailyTaskInfo(): Promise<DailyTaskResponse> {
        return this.request('task.getDailyTaskInfo', {}, '获取每日任务信息失败')
            .then((response: DailyTaskResponse) => {
                return response;
            });
    }

    /**
     * 执行任务进度
     * @param type 任务类型
     * @param number 任务数量
     * @returns Promise<ExecuteTaskResponse>
     */
    executeTask(type: string, number: number): Promise<ExecuteTaskResponse> {
        const params: ExecuteTaskRequest = { type, number };
        return this.request('task.executeTask', params, '执行任务失败')
            .then((response: ExecuteTaskResponse) => {
                return response;
            });
    }

    /**
     * 领取任务奖励
     * @param taskId 任务ID
     * @returns Promise<ClaimTaskRewardResponse>
     */
    claimTaskReward(taskId: number): Promise<ClaimTaskRewardResponse> {
        const params: ClaimTaskRewardRequest = { taskId };
        return this.request('task.claimTaskReward', params, '领取任务奖励失败')
            .then((response: ClaimTaskRewardResponse) => {
                return response;
            });
    }
}

// 创建并导出单例实例
export const taskAPI = new TaskAPI(); 