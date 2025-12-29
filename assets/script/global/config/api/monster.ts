import { APIConfig } from '../APIConfig';

/**
 * 怪物图鉴相关API配置
 */
export const monsterConfigs: Record<string, APIConfig> = {
    'monster.getMonsterList': {
        url: '/api/user/monster',
        method: 'GET',
        paramType: 'query',
        parameters: [
            { name: 'type', type: 'string', required: true, description: '怪物类型' },
            { name: 'pageNum', type: 'number', required: true, description: '页码' },
            { name: 'pageSize', type: 'number', required: true, description: '每页大小' }
        ],
        description: '查询玩家怪物图鉴列表'
    },

    'monster.unlockMonster': {
        url: '/api/user/monster/add',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'key', type: 'string', required: true, description: '怪物key' }
        ],
        description: '解锁玩家怪物图鉴'
    },

    'monster.receiveReward': {
        url: '/api/user/monster/receive',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'key', type: 'string', required: true, description: '怪物key' }
        ],
        description: '领取玩家怪物图鉴奖励'
    },

    'monster.receiveAllRewards': {
        url: '/api/user/monster/one/receive',
        method: 'POST',
        paramType: 'body-json',
        parameters: [],
        description: '一键领取玩家怪物图鉴奖励'
    }
}; 