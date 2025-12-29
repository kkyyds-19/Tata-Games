import { BaseAPI } from "./BaseAPI";
import { 
    StaminaPurchaseInfoResponse,
    StaminaPurchaseRequest,
    StaminaPurchaseResponse
} from "./APITypes";

/**
 * 体力购买相关 API
 */
export class StaminaAPI extends BaseAPI {
    /**
     * 体力购买信息展示
     * @returns Promise<StaminaPurchaseInfoResponse>
     */
    getPurchaseInfo(): Promise<StaminaPurchaseInfoResponse> {
        return this.request('stamina.getPurchaseInfo', {}, '获取体力购买信息失败')
            .then((response: StaminaPurchaseInfoResponse) => {
                console.log('体力购买信息响应:', response);
                return response;
            });
    }

    /**
     * 体力购买接口实现
     * @param configId 购买配置ID
     * @returns Promise<StaminaPurchaseResponse>
     */
    purchaseStamina(configId: number): Promise<StaminaPurchaseResponse> {
        const params: StaminaPurchaseRequest = { configId };
        return this.request('stamina.purchaseStamina', params, '体力购买失败')
            .then((response: StaminaPurchaseResponse) => {
                console.log('体力购买响应:', response);
                return response;
            });
    }
}

// 创建并导出单例实例
export const staminaAPI = new StaminaAPI(); 