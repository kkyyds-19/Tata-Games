import { APIConfig } from '../APIConfig';

/**
 * 体力购买相关API配置
 */
export const staminaConfigs: Record<string, APIConfig> = {
    'stamina.getPurchaseInfo': {
        url: '/api/user/stamina/purchase-info',
        method: 'GET',
        paramType: 'query',
        description: '体力购买信息展示'
    },

    'stamina.purchaseStamina': {
        url: '/api/user/stamina/purchase',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'configId', type: 'number', required: true, description: '购买配置ID' }
        ],
        description: '体力购买接口实现'
    }
}; 