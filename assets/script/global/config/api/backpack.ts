import { APIConfig } from '../APIConfig';

/**
 * 背包相关API配置
 */
export const backpackConfigs: Record<string, APIConfig> = {
    'backpack.getBackpackList': {
        url: '/api/user/backpack',
        method: 'GET',
        paramType: 'query',
        description: '查询玩家背包列表'
    },

    'backpack.addBackpackItem': {
        url: '/api/user/backpack',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id', type: 'number', required: false, description: '主键' },
            { name: 'userId', type: 'number', required: false, description: '玩家主键' },
            { name: 'materialKey', type: 'string', required: true, description: '道具材料key' },
            { name: 'materialNum', type: 'number', required: true, description: '道具材料个数' }
        ],
        description: '新增玩家背包'
    },

    'backpack.getBackpackRewardInfo': {
        url: '/api/user/backpack/show',
        method: 'GET',
        paramType: 'query',
        parameters: [
            { name: 'key', type: 'string', required: false, description: '道具key' }
        ],
        description: '奖励信息'
    },

    'backpack.useBackpackItem': {
        url: '/api/user/backpack/use',
        method: 'POST',
        paramType: 'query',
        parameters: [
            { name: 'key', type: 'string', required: false, description: '道具key' },
            { name: 'num', type: 'number', required: false, description: '使用数量' }
        ],
        description: '使用道具'
    }
}; 