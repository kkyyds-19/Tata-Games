import { APIConfig } from '../APIConfig';

/**
 * 圣物套装相关API配置
 */
export const relicSetConfigs: Record<string, APIConfig> = {
    'relicSet.getPackageList': {
        url: '/api/user/relic/package',
        method: 'GET',
        paramType: 'query',
        description: '查询玩家圣物套装列表'
    },

    'relicSet.addPackage': {
        url: '/api/user/relic/package/add',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '圣物套装id' }
        ],
        description: '标记玩家圣物套装'
    },

    'relicSet.deletePackage': {
        url: '/api/user/relic/package/delete/{id}',
        method: 'GET',
        paramType: 'path',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '圣物套装id' }
        ],
        description: '取消标记玩家圣物套装'
    }
}; 