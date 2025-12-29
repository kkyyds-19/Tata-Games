import { BaseAPI } from "./BaseAPI";
import { 
    RelicSetListResponse,
    RelicSetMarkRequest,
    RelicSetResponse
} from "./APITypes";

/**
 * 圣物套装相关 API
 */
export class RelicSetAPI extends BaseAPI {
    /**
     * 查询玩家圣物套装列表
     * @returns Promise<RelicSetListResponse>
     */
    getPackageList(): Promise<RelicSetListResponse> {
        return this.request('relicSet.getPackageList', {}, '获取圣物套装列表失败')
            .then((response: RelicSetListResponse) => {
                console.log('圣物套装列表响应:', response);
                return response;
            });
    }

    /**
     * 标记玩家圣物套装
     * @param id 圣物套装id
     * @returns Promise<RelicSetResponse>
     */
    addPackage(id: number): Promise<RelicSetResponse> {
        const params: RelicSetMarkRequest = { id };
        return this.request('relicSet.addPackage', params, '标记圣物套装失败')
            .then((response: RelicSetResponse) => {
                console.log('标记圣物套装响应:', response);
                return response;
            });
    }

    /**
     * 取消标记玩家圣物套装
     * @param id 圣物套装id
     * @returns Promise<RelicSetResponse>
     */
    deletePackage(id: number): Promise<RelicSetResponse> {
        return this.request('relicSet.deletePackage', { id }, '取消标记圣物套装失败')
            .then((response: RelicSetResponse) => {
                console.log('取消标记圣物套装响应:', response);
                return response;
            });
    }
}

// 创建并导出单例实例
export const relicSetAPI = new RelicSetAPI(); 