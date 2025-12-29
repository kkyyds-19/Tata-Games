import { BaseAPI } from "./BaseAPI";
import { 
    StageRewardReceiveRequest,
    AdStageRewardRequest,
    StageRewardResponse,
    StageRewardData
} from "./APITypes";

/**
 * 关卡奖励相关 API
 * 
 * 使用示例：
 * 
 * // 1. 领取关卡奖励
 * const rewardResponse = await stageRewardAPI.receiveLevelReward(1, '{"normal":"100"}', 1, 0, 10);
 * const rewardData = stageRewardAPI.parseRewardString(rewardResponse.data);
 * console.log('获得奖励:', stageRewardAPI.formatRewardDescription(rewardData));
 * 
 * // 2. 看广告领取奖励
 * const adRewardResponse = await stageRewardAPI.receiveAdLevelReward(1, 0);
 * const adRewardData = stageRewardAPI.parseRewardString(adRewardResponse.data);
 * console.log('广告奖励:', stageRewardAPI.formatRewardDescription(adRewardData));
 */
export class StageRewardAPI extends BaseAPI {
    /**
     * 玩家关卡奖励领取
     * @param level 关卡级别
     * @param json 怪物json
     * @param type 通过类型1通关，2半血，3满血
     * @param flag 是否是精英关卡，0不是，1是
     * @param rank 关卡玩家等级
     * @returns Promise<StageRewardResponse>
     */
    receiveLevelReward(level: number, json: string, type: number, flag: number, rank: number): Promise<StageRewardResponse> {
        const params: StageRewardReceiveRequest = { level, json, type, flag, rank };
        return this.request('stageReward.receiveLevelReward', params, '领取关卡奖励失败')
            .then((response: StageRewardResponse) => {
                return response;
            });
    }

    /**
     * 玩家看广告关卡奖励领取
     * @param level 关卡级别
     * @param flag 是否是精英关卡
     * @returns Promise<StageRewardResponse>
     */
    receiveAdLevelReward(level: number, flag: number): Promise<StageRewardResponse> {
        const params: AdStageRewardRequest = { level, flag };
        return this.request('stageReward.receiveAdLevelReward', params, '领取广告关卡奖励失败')
            .then((response: StageRewardResponse) => {
                return response;
            });
    }



    /**
     * 解析关卡奖励JSON字符串为结构化数据
     * @param rewardString 奖励JSON字符串
     * @returns StageRewardData 解析后的奖励数据
     */
    parseRewardString(rewardString: string): StageRewardData {
        try {
            const rewardData = JSON.parse(rewardString);
            return rewardData as StageRewardData;
        } catch (error) {
            console.error('解析关卡奖励数据失败:', error, '原始数据:', rewardString);
            return {};
        }
    }

  

  

    
}

// 创建并导出单例实例
export const stageRewardAPI = new StageRewardAPI(); 