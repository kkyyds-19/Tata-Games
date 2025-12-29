import { BaseAPI } from "./BaseAPI";
import { 
    AddEquipmentRequest,
    AddEquipmentResponse,
    EquipmentListResponse,
    APIResponse
} from "./APITypes";

/**
 * 装备相关 API
 */
export class EquipmentAPI extends BaseAPI {
    /**
     * 查询我的装备列表
     * @returns Promise<EquipmentListResponse>
     */
    getEquipmentList(): Promise<EquipmentListResponse> {
        return this.request('equipment.getEquipmentList', {}, '查询装备列表失败')
            .then((response: EquipmentListResponse) => {
                console.log('查询装备列表响应:', response);
                return response;
            });
    }

    /**
     * 新增我的装备
     * @param equipmentItem 装备数据
     * @returns Promise<AddEquipmentResponse>
     */
    addEquipment(equipmentItem: AddEquipmentRequest): Promise<AddEquipmentResponse> {
        // 将装备数据转换为JSON字符串
        const itemJson = JSON.stringify(equipmentItem);
        
        return this.request('equipment.addEquipment', { item: itemJson }, '新增装备失败')
            .then((response: AddEquipmentResponse) => {
                console.log('新增装备响应:', response);
                return response;
            });
    }
}

// 创建并导出单例实例
export const equipmentAPI = new EquipmentAPI(); 