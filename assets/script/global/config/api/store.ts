import { APIConfig } from '../APIConfig';

/**
 * 商店相关API配置
 */
export const storeConfigs: Record<string, APIConfig> = {
    'store.getUserStoreInfo': {
        url: '/api/user/store',
        method: 'GET',
        paramType: 'query',
        parameters: [
            { name: 'business', type: 'number', required: false, description: '业务类型：1系统，2荣誉竞技场' }
        ],
        description: '获取玩家商店信息'
    },

      'store.purchaseStoreItem': {
        url: '/api/user/store/{id}',
        method: 'GET',
        paramType: 'path',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '商店物品id' }
        ],
        description: '购买商店物品'
    }
};