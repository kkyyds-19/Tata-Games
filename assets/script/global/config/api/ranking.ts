import { APIConfig } from '../APIConfig';

/**
 * 排名相关API配置
 */
export const rankingConfigs: Record<string, APIConfig> = {
    'ranking.getChapterRanking': {
        url: '/api/chart/chaptercharts',
        method: 'GET',
        paramType: 'query',
        parameters: [
            { name: 'pageNum', type: 'number', required: false, description: '页码' },
            { name: 'pageSize', type: 'number', required: false, description: '每页数量' }
        ],
        description: '玩家主线章节排名'
    },

    'ranking.getFightPowerRanking': {
        url: '/api/chart/fightcharts',
        method: 'GET',
        paramType: 'query',
        parameters: [
            { name: 'pageNum', type: 'number', required: false, description: '页码' },
            { name: 'pageSize', type: 'number', required: false, description: '每页数量' }
        ],
        description: '玩家战力排名'
    },

    // 荣誉竞技场排行（读取）
    'ranking.getArenaHonorRanking': {
        url: '/api/user/honor/charts',
        method: 'GET',
        paramType: 'query',
        parameters: [
            { name: 'pageNum', type: 'number', required: false, description: '页码' },
            { name: 'pageSize', type: 'number', required: false, description: '每页数量' }
        ],
        description: '荣誉竞技场排名列表'
    },

    'ranking.getGulchCharts': {
        url: '/api/user/gulch/charts',
        method: 'GET',
        paramType: 'query',
        parameters: [
            { name: 'pageNum', type: 'number', required: false, description: '页码' },
            { name: 'pageSize', type: 'number', required: false, description: '每页数量' }
        ],
        description: '战歌峡谷排行榜列表'
    },

    // 荣誉竞技场排行（提交当前荣誉积分至排行榜）
    'ranking.submitArenaHonor': {
        url: '/api/chart/arenahonorsubmit',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'honorPoints', type: 'number', required: true, description: '当前荣誉积分' }
        ],
        description: '提交荣誉竞技场的当前荣誉积分用于排行榜'
    }
};