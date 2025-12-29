import { BaseAPI } from "./BaseAPI";
import { 
    StoreInfo, 
    StoreResponse,
    APIResponse
} from "./APITypes";

/**
 * 商店相关 API
 */
export class StoreAPI extends BaseAPI {
    /**
     * 获取玩家商店信息
     * @returns Promise<StoreResponse>
     */
    getUserStoreInfo(business?: number): Promise<StoreResponse> {
        const params: any = {};
        if (typeof business === 'number') {
            params.business = business;
        }
        return this.request('store.getUserStoreInfo', params, '获取商店信息失败')
            .then((response: StoreResponse) => {
                console.log('商店信息响应:', response);
                return response;
            });
    }

    /**
     * 购买商店物品
     * @param id 商店物品id
     * @returns Promise<APIResponse<any>>
     */
    purchaseStoreItem(id: number): Promise<APIResponse<any>> {
        return this.request('store.purchaseStoreItem', { id }, '购买商店物品失败')
            .then((response: APIResponse<any>) => {
                console.log('购买商店物品响应:', response);
                return response;
            });
    }
}

// 创建并导出单例实例
export const storeAPI = new StoreAPI();