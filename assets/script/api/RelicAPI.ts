import { BaseAPI } from "./BaseAPI";
import { 
    RelicListResponse,
    RelicCallRequest,
    RelicResponse
} from "./APITypes";

/**
 * 圣物相关 API
 */
export class RelicAPI extends BaseAPI {
    /**
     * 查询玩家圣物列表
     * @returns Promise<RelicListResponse>
     */
    getRelicList(): Promise<RelicListResponse> {
        return this.request('relic.getRelicList', {}, '获取圣物列表失败')
            .then((response: RelicListResponse) => {
                console.log('圣物列表响应:', response);
                return response;
            });
    }

    /**
     * 召唤概率
     * @returns Promise<RelicResponse>
     */
    getCallRate(): Promise<RelicResponse> {
        return this.request('relic.getCallRate', {}, '获取召唤概率失败')
            .then((response: RelicResponse) => {
                console.log('召唤概率响应:', response);
                return response;
            });
    }

    /**
     * 召唤
     * @param adv 是否广告，true是广告，false是用钻石召唤
     * @param type 1召唤1次，2召唤10次
     * @param location 默认不指定 0，指定的部位 1,2...6号位置
     * @returns Promise<RelicResponse>
     */
    callRelic(adv: boolean, type: number, location: number): Promise<RelicResponse> {
        const params: RelicCallRequest = { adv, type, location };
        return this.request('relic.callRelic', params, '召唤失败')
            .then((response: RelicResponse) => {
                console.log('召唤响应:', response);
                return response;
            });
    }

    /**
     * 玩家圣物属性统计
     * @returns Promise<RelicResponse>
     */
    getAttributeStats(): Promise<RelicResponse> {
        return this.request('relic.getAttributeStats', {}, '获取圣物属性统计失败')
            .then((response: RelicResponse) => {
                console.log('圣物属性统计响应:', response);
                return response;
            });
    }

    /**
     * 玩家一键合成展示
     * @returns Promise<RelicResponse>
     */
    getSynthesisShow(): Promise<RelicResponse> {
        return this.request('relic.getSynthesisShow', {}, '获取一键合成展示失败')
            .then((response: RelicResponse) => {
                console.log('一键合成展示响应:', response);
                return response;
            });
    }

    /**
     * 玩家一键合成
     * @returns Promise<RelicResponse>
     */
    synthesis(): Promise<RelicResponse> {
        return this.request('relic.synthesis', {}, '一键合成失败')
            .then((response: RelicResponse) => {
                console.log('一键合成响应:', response);
                return response;
            });
    }
}

// 创建并导出单例实例
export const relicAPI = new RelicAPI(); 