import { APIConfig } from '../APIConfig';

/**
 * 挂机收益相关API配置
 */
export const idleRewardConfigs: Record<string, APIConfig> = {
    'idleReward.receiveReward': {
        url: '/api/afk/receive',
        method: 'GET',
        paramType: 'query',
        description: '玩家领取挂机奖励'
    },

    'idleReward.sweepReward': {
        url: '/api/afk/sweep',
        method: 'GET',
        paramType: 'query',
        description: '玩家领取扫荡奖励'
    },

    'idleReward.getViewData': {
        url: '/api/afk/view',
        method: 'GET',
        paramType: 'query',
        description: '挂机收益页面数据展示'
    }
}; 