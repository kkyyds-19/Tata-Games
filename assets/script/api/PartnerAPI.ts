import { BaseAPI } from "./BaseAPI";
import { 
    PartnerInfo, 
    PartnerListResponse, 
    PartnerRequest,
    APIResponse
} from "./APITypes";

/**
 * 伙伴相关 API
 */
export class PartnerAPI extends BaseAPI {
    /**
     * 查询玩家伙伴列表
     * @returns Promise<PartnerListResponse>
     */
    getPartnerList(): Promise<PartnerListResponse> {
        return this.request('partner.getPartnerList', {}, '获取伙伴列表失败')
            .then((response: PartnerListResponse) => {
                console.log('伙伴列表响应:', response);
                return response;
            });
    }

    /**
     * 获取玩家伙伴详细信息
     * @param id 伙伴ID
     * @returns Promise<APIResponse<any>>
     */
    getPartnerDetail(id: number): Promise<APIResponse<any>> {
        return this.request('partner.getPartnerDetail', { id }, '获取伙伴详细信息失败')
            .then((response: APIResponse<any>) => {
                console.log('伙伴详细信息响应:', response);
                return response;
            });
    }

    /**
     * 新增玩家伙伴
     * @param partnerRequest 伙伴请求
     * @returns Promise<APIResponse<any>>
     */
    addPartner(partnerRequest: PartnerRequest): Promise<APIResponse<any>> {
        return this.request('partner.addPartner', partnerRequest, '新增伙伴失败')
            .then((response: APIResponse<any>) => {
                console.log('新增伙伴响应:', response);
                return response;
            });
    }
}

// 创建并导出单例实例
export const partnerAPI = new PartnerAPI(); 