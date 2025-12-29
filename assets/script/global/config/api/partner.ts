import { APIConfig } from '../APIConfig';

/**
 * 伙伴相关API配置
 */
export const partnerConfigs: Record<string, APIConfig> = {
    'partner.getPartnerList': {
        url: '/api/user/partner/list',
        method: 'GET',
        paramType: 'query',
        description: '查询玩家伙伴列表'
    },

    'partner.getPartnerDetail': {
        url: '/api/user/partner/{id}',
        method: 'GET',
        paramType: 'path',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '伙伴ID' }
        ],
        description: '获取玩家伙伴详细信息'
    },

    'partner.addPartner': {
        url: '/api/user/partner',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id', type: 'number', required: false, description: '主键' },
            { name: 'userId', type: 'number', required: false, description: '玩家ID' },
            { name: 'partnerId', type: 'number', required: true, description: '伙伴ID' },
            { name: 'partnerLevel', type: 'number', required: true, description: '伙伴等级' },
            { name: 'starId', type: 'number', required: true, description: '伙伴星级' },
            { name: 'isBattle', type: 'number', required: true, description: '是否上阵' },
            { name: 'isCooperate', type: 'number', required: true, description: '是否协同' },
            { name: 'cooperate', type: 'string', required: false, description: '协同伙伴' },
            { name: 'passiveSkill', type: 'string', required: false, description: '参战技能' }
        ],
        description: '新增玩家伙伴'
    }
}; 