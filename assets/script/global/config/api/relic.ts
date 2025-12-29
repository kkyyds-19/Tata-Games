import { APIConfig } from '../APIConfig';

/**
 * 圣物相关API配置
 */
export const relicConfigs: Record<string, APIConfig> = {
    'relic.getRelicList': {
        url: '/api/user/relic',
        method: 'GET',
        paramType: 'query',
        description: '查询玩家圣物列表'
    },

    'relic.getCallRate': {
        url: '/api/user/relic/rate',
        method: 'GET',
        paramType: 'query',
        description: '召唤概率'
    },

    'relic.callRelic': {
        url: '/api/user/relic/call',
        method: 'GET',
        paramType: 'query',
        parameters: [
            { name: 'adv', type: 'boolean', required: true, description: '是否广告，true是广告，false是用钻石召唤' },
            { name: 'type', type: 'number', required: true, description: '1召唤1次，2召唤10次' },
            { name: 'location', type: 'number', required: true, description: '默认不指定 0，指定的部位 1,2...6号位置' }
        ],
        description: '召唤'
    },

    'relic.getAttributeStats': {
        url: '/api/user/relic/total',
        method: 'GET',
        paramType: 'query',
        description: '玩家圣物属性统计'
    },

    'relic.getSynthesisShow': {
        url: '/api/user/relic/show',
        method: 'GET',
        paramType: 'query',
        description: '玩家一键合成展示'
    },

    'relic.synthesis': {
        url: '/api/user/relic/synthesis',
        method: 'GET',
        paramType: 'query',
        description: '玩家一键合成'
    }
}; 