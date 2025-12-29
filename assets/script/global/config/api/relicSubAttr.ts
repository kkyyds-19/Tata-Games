import { APIConfig } from '../APIConfig';

/**
 * 圣物副词条相关API配置
 */
export const relicSubAttrConfigs: Record<string, APIConfig> = {
    'relicSubAttr.getEntryList': {
        url: '/api/user/relic/entry',
        method: 'GET',
        paramType: 'query',
        description: '查询玩家圣物副词条列表'
    },

    'relicSubAttr.addEntry': {
        url: '/api/user/relic/entry/add',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '圣物副词条id' }
        ],
        description: '标记玩家圣物副词条'
    },

    'relicSubAttr.deleteEntry': {
        url: '/api/user/relic/entry/delete/{id}',
        method: 'GET',
        paramType: 'path',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '圣物副词条id' }
        ],
        description: '取消标记玩家圣物副词条'
    }
}; 