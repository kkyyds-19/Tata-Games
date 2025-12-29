import { APIConfig } from '../APIConfig';

/**
 * 关卡奖励相关API配置
 */
export const stageRewardConfigs: Record<string, APIConfig> = {
    'stageReward.receiveLevelReward': {
        url: '/api/user/level/receive',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'level', type: 'number', required: true, description: '关卡级别' },
            { name: 'json', type: 'string', required: true, description: '怪物json' },
            { name: 'type', type: 'number', required: true, description: '通过类型1通关，2半血，3满血' },
            { name: 'flag', type: 'number', required: true, description: '是否是精英关卡，0不是，1是' },
            { name: 'rank', type: 'number', required: true, description: '关卡玩家等级' }
        ],
        description: '玩家关卡奖励领取'
    },

    'stageReward.receiveAdLevelReward': {
        url: '/api/user/level/adreceive',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'level', type: 'number', required: true, description: '关卡级别' },
            { name: 'flag', type: 'number', required: true, description: '是否是精英关卡，0不是，1是' }
        ],
        description: '玩家看广告关卡奖励领取'
    }
}; 