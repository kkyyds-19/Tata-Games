import { BaseAPI } from "./BaseAPI";
import { 
    BackpackItem, 
    BackpackListResponse, 
    AddBackpackItemRequest,
    BackpackRewardInfoRequest,
    BackpackRewardInfoResponse,
    UseBackpackItemRequest,
    UseBackpackItemResponse,
    APIResponse
} from "./APITypes";

/**
 * 背包相关 API
 */
export class BackpackAPI extends BaseAPI {
    /**
     * 查询玩家背包列表
     * @returns Promise<BackpackListResponse>
     */
    getBackpackList(): Promise<BackpackListResponse> {
        return this.request('backpack.getBackpackList', {}, '获取背包列表失败')
            .then((response: BackpackListResponse) => {
                console.log('背包列表响应:', response);
                return response;
            });
    }

    /**
     * 新增玩家背包物品
     * @param item 背包物品请求
     * @returns Promise<APIResponse<any>>
     */
    addBackpackItem(item: AddBackpackItemRequest): Promise<APIResponse<any>> {
        return this.request('backpack.addBackpackItem', item, '新增背包物品失败')
            .then((response: APIResponse<any>) => {
                console.log('新增背包物品响应:', response);
                return response;
            });
    }

    /**
     * 获取背包奖励信息
     * @param key 道具key（可选）
     * @returns Promise<BackpackRewardInfoResponse>
     */
    getBackpackRewardInfo(key?: string): Promise<BackpackRewardInfoResponse> {
        const params: BackpackRewardInfoRequest = { key };
        return this.request('backpack.getBackpackRewardInfo', params, '获取背包奖励信息失败')
            .then((response: BackpackRewardInfoResponse) => {
                console.log('背包奖励信息响应:', response);
                return response;
            });
    }

    /**
     * 使用背包物品
     * @param key 道具key（可选）
     * @param num 使用数量（可选）
     * @returns Promise<UseBackpackItemResponse>
     */
    useBackpackItem(key?: string, num?: number): Promise<UseBackpackItemResponse> {
        const params: UseBackpackItemRequest = { key, num };
        return this.request('backpack.useBackpackItem', params, '使用背包物品失败')
            .then((response: UseBackpackItemResponse) => {
                console.log('使用背包物品响应:', response);
                return response;
            });
    }
}

// 创建并导出单例实例
export const backpackAPI = new BackpackAPI(); 