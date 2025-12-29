import { APIConfig } from '../APIConfig';

/**
 * 装备相关API配置
 */
export const equipmentConfigs: Record<string, APIConfig> = {
    'equipment.getEquipmentList': {
        url: '/api/my/equipment/list',
        method: 'GET',
        paramType: 'query',
        parameters: [],
        description: '查询我的装备列表'
    },
    'equipment.addEquipment': {
        url: '/api/my/equipment/add',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'item', type: 'string', required: true, description: '前端装备JSON字符串' }
        ],
        description: '新增我的装备'
    }
}; 