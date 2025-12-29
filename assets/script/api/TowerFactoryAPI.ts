import { BaseAPI } from "./BaseAPI";
import { 
    TowerFactoryListResponse,
    AddBuildRecordRequest,
    AddBuildRecordResponse
} from "./APITypes";

/**
 * 哨塔建造厂相关 API
 */
export class TowerFactoryAPI extends BaseAPI {
    /**
     * 查询玩家哨塔建造厂列表
     * @returns Promise<TowerFactoryListResponse>
     */
    getBuildList(): Promise<TowerFactoryListResponse> {
        return this.request('towerFactory.getBuildList', {}, '获取哨塔建造厂列表失败')
            .then((response: TowerFactoryListResponse) => {
                console.log('哨塔建造厂列表响应:', response);
                return response;
            });
    }

    /**
     * 新增玩家哨塔建造厂记录
     * @param id 建造厂ID
     * @param key 建造厂key
     * @returns Promise<AddBuildRecordResponse>
     */
    addBuildRecord(id: string, key: string): Promise<AddBuildRecordResponse> {
        const params: AddBuildRecordRequest = { id, key };
        return this.request('towerFactory.addBuildRecord', params, '新增哨塔建造厂记录失败')
            .then((response: AddBuildRecordResponse) => {
                console.log('新增哨塔建造厂记录响应:', response);
                return response;
            });
    }
}

// 创建并导出单例实例
export const towerFactoryAPI = new TowerFactoryAPI(); 