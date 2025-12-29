import { APIConfig } from '../APIConfig';

/**
 * 通关奖励相关API配置
 */
export const clearRewardConfigs: Record<string, APIConfig> = {
    'clearReward.getRewardList': {
        url: '/api/user/star-reward/list',
        method: 'GET',
        paramType: 'query',
        parameters: [],
        description: '展示奖励和未满星关卡'
    },

    'clearReward.claimReward': {
        url: '/api/user/star-reward/claim',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'finishId', type: 'number', required: true, description: '通关星数表id' }
        ],
        description: '领取奖励接口'
    },

    'clearReward.getNotFullStarLevels': {
        url: '/api/user/star-reward/not-full-star-levels',
        method: 'GET',
        paramType: 'query',
        parameters: [
            { name: 'page', type: 'number', required: true, description: '页码' },
            { name: 'size', type: 'number', required: true, description: '每页数量' }
        ],
        description: '展示未获得满星接口'
    }
}; 