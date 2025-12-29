import { APIConfig } from '../APIConfig';

/**
 * 哨塔相关API配置
 */
export const towerConfigs: Record<string, APIConfig> = {
    'tower.getTowerList': {
        url: '/api/user/watchtower/list',
        method: 'GET',
        paramType: 'query',
        description: '查询玩家哨塔列表'
    },

    'tower.getTowerDetail': {
        url: '/api/user/watchtower/{watchtowerId}',
        method: 'GET',
        paramType: 'path',
        parameters: [
            { name: 'watchtowerId', type: 'number', required: true, description: '服务器哨塔ID（watchtowerId）' }
        ],
        description: '获取玩家哨塔详细信息（按watchtowerId）'
    },

    'tower.addTower': {
        url: '/api/user/watchtower',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id', type: 'number', required: false, description: '主键' },
            { name: 'userId', type: 'number', required: false, description: '玩家ID' },
            { name: 'relationId', type: 'number', required: true, description: '关联ID' },
            { name: 'level', type: 'number', required: true, description: '等级' }
        ],
        description: '新增玩家哨塔'
    },

    'tower.upgradeTower': {
        url: '/api/user/watchtower/upgrade',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '哨塔主键watchtowerId' }
        ],
        description: '哨塔升级（按watchtowerId）'
    }
    ,
    'tower.obtainTower': {
        url: '/api/user/watchtower/obtain',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'watchtowerId', type: 'number', required: true, description: '哨塔主键watchtowerId' }
        ],
        description: '哨塔升星（按watchtowerId）'
    }
};
