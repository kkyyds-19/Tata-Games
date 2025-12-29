import { BaseAPI } from "./BaseAPI";
import { 
    RelicSubAttrListResponse,
    RelicSubAttrMarkRequest,
    RelicSubAttrResponse
} from "./APITypes";

/**
 * 圣物副词条相关 API
 */
export class RelicSubAttrAPI extends BaseAPI {
    /**
     * 查询玩家圣物副词条列表
     * @returns Promise<RelicSubAttrListResponse>
     */
    getEntryList(): Promise<RelicSubAttrListResponse> {
        return this.request('relicSubAttr.getEntryList', {}, '获取圣物副词条列表失败')
            .then((response: RelicSubAttrListResponse) => {
                console.log('圣物副词条列表响应:', response);
                return response;
            });
    }

    /**
     * 标记玩家圣物副词条
     * @param id 圣物副词条id
     * @returns Promise<RelicSubAttrResponse>
     */
    addEntry(id: number): Promise<RelicSubAttrResponse> {
        const params: RelicSubAttrMarkRequest = { id };
        return this.request('relicSubAttr.addEntry', params, '标记圣物副词条失败')
            .then((response: RelicSubAttrResponse) => {
                console.log('标记圣物副词条响应:', response);
                return response;
            });
    }

    /**
     * 取消标记玩家圣物副词条
     * @param id 圣物副词条id
     * @returns Promise<RelicSubAttrResponse>
     */
    deleteEntry(id: number): Promise<RelicSubAttrResponse> {
        return this.request('relicSubAttr.deleteEntry', { id }, '取消标记圣物副词条失败')
            .then((response: RelicSubAttrResponse) => {
                console.log('取消标记圣物副词条响应:', response);
                return response;
            });
    }
}

// 创建并导出单例实例
export const relicSubAttrAPI = new RelicSubAttrAPI(); 