import { BaseAPI } from "./BaseAPI";
import { 
    RankingListResponse,
    RankingRequest,
    ArenaHonorRankingListResponse,
    SubmitArenaHonorRequest,
    SubmitArenaHonorResponse,
    GulchChartsListResponse
} from "./APITypes";

/**
 * 排名相关 API
 */
export class RankingAPI extends BaseAPI {
    /**
     * 玩家主线章节排名
     * @param pageNum 页码（可选）
     * @param pageSize 每页数量（可选）
     * @returns Promise<RankingListResponse>
     */
    getChapterRanking(pageNum?: number, pageSize?: number): Promise<RankingListResponse> {
        const params: RankingRequest = {};
        if (pageNum !== undefined) params.pageNum = pageNum;
        if (pageSize !== undefined) params.pageSize = pageSize;
        
        return this.request('ranking.getChapterRanking', params, '获取主线章节排名失败')
            .then((response: RankingListResponse) => {
                console.log('主线章节排名响应:', response);
                return response;
            });
    }

    /**
     * 玩家战力排名
     * @param pageNum 页码（可选）
     * @param pageSize 每页数量（可选）
     * @returns Promise<RankingListResponse>
     */
    getFightPowerRanking(pageNum?: number, pageSize?: number): Promise<RankingListResponse> {
        const params: RankingRequest = {};
        if (pageNum !== undefined) params.pageNum = pageNum;
        if (pageSize !== undefined) params.pageSize = pageSize;
        
        return this.request('ranking.getFightPowerRanking', params, '获取战力排名失败')
            .then((response: RankingListResponse) => {
                console.log('战力排名响应:', response);
                return response;
            });
    }

    /**
     * 荣誉竞技场排名
     * @param pageNum 页码（可选）
     * @param pageSize 每页数量（可选）
     * @returns Promise<ArenaHonorRankingListResponse>
     */
    getArenaHonorRanking(pageNum?: number, pageSize?: number): Promise<ArenaHonorRankingListResponse> {
        const params: RankingRequest = {};
        if (pageNum !== undefined) params.pageNum = pageNum;
        if (pageSize !== undefined) params.pageSize = pageSize;

        return this.request('ranking.getArenaHonorRanking', params, '获取荣誉竞技场排名失败')
            .then((response: ArenaHonorRankingListResponse) => {
                console.log('荣誉竞技场排名响应:', response);
                return response;
            });
    }

    getGulchCharts(pageNum?: number, pageSize?: number): Promise<GulchChartsListResponse> {
        const params: RankingRequest = {};
        if (pageNum !== undefined) params.pageNum = pageNum;
        if (pageSize !== undefined) params.pageSize = pageSize;

        return this.request('ranking.getGulchCharts', params, '获取战歌峡谷排名失败')
            .then((response: GulchChartsListResponse) => {
                console.log('战歌峡谷排名响应:', response);
                return response;
            });
    }

    /**
     * 提交当前荣誉积分以参与荣誉竞技场排行榜
     * @param honorPoints 当前荣誉积分
     */
    submitArenaHonor(honorPoints: number): Promise<SubmitArenaHonorResponse> {
        const params: SubmitArenaHonorRequest = { honorPoints };
        return this.request('ranking.submitArenaHonor', params, '提交荣誉竞技场荣誉积分失败')
            .then((response: SubmitArenaHonorResponse) => {
                console.log('提交荣誉竞技场荣誉积分响应:', response);
                return response;
            });
    }

}

// 创建并导出单例实例
export const rankingAPI = new RankingAPI();