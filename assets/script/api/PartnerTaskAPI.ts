import { BaseAPI } from "./BaseAPI";
import { 
    PartnerTaskListResponse,
    PartnerTaskRequest,
    PartnerTaskResponse
} from "./APITypes";

/**
 * 伙伴任务相关 API
 */
export class PartnerTaskAPI extends BaseAPI {
    /**
     * 获取伙伴任务列表
     * @returns Promise<PartnerTaskListResponse>
     */
    getPartnerTaskList(): Promise<PartnerTaskListResponse> {
        return this.request('partnerTask.getPartnerTaskList', {}, '获取伙伴任务列表失败')
            .then((response: PartnerTaskListResponse) => {
                return response;
            });
    }

    /**
     * 新增伙伴任务
     * @param partnerTaskRequest 伙伴任务请求参数
     * @returns Promise<PartnerTaskResponse>
     */
    addPartnerTask(partnerTaskRequest: PartnerTaskRequest): Promise<PartnerTaskResponse> {
        return this.request('partnerTask.addPartnerTask', partnerTaskRequest, '新增伙伴任务失败')
            .then((response: PartnerTaskResponse) => {
                return response;
            });
    }

    /**
     * 领取伙伴任务奖励
     * @param taskId 任务ID
     * @returns Promise<PartnerTaskResponse>
     */
    claimTaskReward(taskId: number): Promise<PartnerTaskResponse> {
        return this.request('partnerTask.claimTaskReward', { taskId }, '领取伙伴任务奖励失败')
            .then((response: PartnerTaskResponse) => {
                return response;
            });
    }
}

// 创建并导出单例实例
export const partnerTaskAPI = new PartnerTaskAPI(); 