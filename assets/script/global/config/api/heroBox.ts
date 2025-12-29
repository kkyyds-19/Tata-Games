import { APIConfig } from '../APIConfig';

/**
 * 英雄宝箱相关API配置
 */
export const heroBoxConfigs: Record<string, APIConfig> = {
    'heroBox.getBoxInfo': {
        url: '/api/hero/box',
        method: 'GET',
        paramType: 'query',
        description: '获取玩家宝箱信息'
    },

    'heroBox.legendaryDraw': {
        url: '/api/hero/box/legendary',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '传说宝箱ID' },
            { name: 'type', type: 'number', required: true, description: '抽奖类型（1抽1次，10抽10次）' }
        ],
        description: '传说宝箱抽奖'
    },

    'heroBox.rareDraw': {
        url: '/api/hero/box/rare',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '稀有宝箱ID' },
            { name: 'type', type: 'number', required: true, description: '抽奖类型（1抽1次，10抽10次）' }
        ],
        description: '稀有宝箱抽奖'
    },

    'heroBox.normalDraw': {
        url: '/api/hero/box/normal',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '普通宝箱ID' },
            { name: 'type', type: 'number', required: true, description: '抽奖类型（1抽1次，10抽10次）' }
        ],
        description: '普通宝箱抽奖'
    },

    'heroBox.getHeroList': {
        url: '/api/hero/box/list',
        method: 'GET',
        paramType: 'query',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '宝箱ID' }
        ],
        description: '获取宝箱里面的英雄列表'
    }
}; 