import { APIConfig } from '../APIConfig';

/**
 * 哨塔建造厂相关API配置
 */
export const towerFactoryConfigs: Record<string, APIConfig> = {
    'towerFactory.getBuildList': {
        url: '/api/user/watchtower/build/list',
        method: 'GET',
        paramType: 'query',
        description: '查询玩家哨塔建造厂列表'
    },

    'towerFactory.addBuildRecord': {
        url: '/api/user/watchtower/build/add',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id', type: 'string', required: true, description: '建造厂ID' },
            { name: 'key', type: 'string', required: true, description: '建造厂key' }
        ],
        description: '新增玩家哨塔建造厂记录'
    }
}; 