import { BaseAPI } from "./BaseAPI";
import { 
    ClearRewardListRequest,
    ClearRewardListResponse,
    ClaimRewardRequest,
    ClaimRewardResponse,
    NotFullStarLevelsRequest,
    NotFullStarLevelsResponse
} from "./APITypes";

/**
 * 通关奖励相关 API
 */
export class ClearRewardAPI extends BaseAPI {
    /**
     * 展示奖励和未满星关卡
     * @returns Promise<ClearRewardListResponse>
     */
    getRewardList(): Promise<ClearRewardListResponse> {
        const params: ClearRewardListRequest = {};
        return this.request('clearReward.getRewardList', params, '获取通关奖励列表失败')
            .then((response: ClearRewardListResponse) => {
                console.log('通关奖励列表响应:', response);
                return response;
            });
    }

    /**
     * 领取奖励接口
     * @param finishId 通关星数表id
     * @returns Promise<ClaimRewardResponse>
     */
    claimReward(finishId: number): Promise<ClaimRewardResponse> {
        const params: ClaimRewardRequest = { finishId };
        return this.request('clearReward.claimReward', params, '领取通关奖励失败')
            .then((response: ClaimRewardResponse) => {
                console.log('领取通关奖励响应:', response);
                return response;
            });
    }

  
  
}

// 创建并导出单例实例
export const clearRewardAPI = new ClearRewardAPI(); 