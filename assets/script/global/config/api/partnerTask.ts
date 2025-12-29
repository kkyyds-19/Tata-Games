import { APIConfig } from '../APIConfig';

/**
 * 伙伴任务相关API配置
 */
export const partnerTaskConfigs: Record<string, APIConfig> = {
    'partnerTask.getTaskList': {
        url: '/api/user/partner/task/list',
        method: 'GET',
        paramType: 'query',
        description: '查询玩家伙伴任务列表'
    },

    'partnerTask.addTask': {
        url: '/api/user/partner/task',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id', type: 'number', required: false, description: '主键' },
            { name: 'userId', type: 'number', required: false, description: '玩家ID' },
            { name: 'taskId', type: 'number', required: true, description: '任务ID' },
            { name: 'finishNum', type: 'number', required: true, description: '完成数量' },
            { name: 'isReceive', type: 'number', required: true, description: '是否领取(0/1)' },
            { name: 'receiveTime', type: 'string', required: false, description: '领取时间' }
        ],
        description: '新增玩家伙伴任务'
    },

    'partnerTask.claimTaskReward': {
        url: '/api/user/partner/task/{id}',
        method: 'GET',
        paramType: 'path',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '任务ID' }
        ],
        description: '领取伙伴任务奖励'
    }
}; 