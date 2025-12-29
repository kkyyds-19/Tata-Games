import { APIConfig } from '../APIConfig';

/**
 * 任务相关API配置
 */
export const taskConfigs: Record<string, APIConfig> = {
    'task.getDailyTaskInfo': {
        url: '/api/task/progress',
        method: 'GET',
        paramType: 'query',
        description: '获取每日任务信息'
    },

    'task.executeTask': {
        url: '/api/task/execute',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'type', type: 'string', required: true, description: '任务类型' },
            { name: 'number', type: 'number', required: true, description: '任务数量' }
        ],
        description: '执行任务进度'
    },

    'task.claimTaskReward': {
        url: '/api/task/receive',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'taskId', type: 'number', required: true, description: '任务ID' }
        ],
        description: '领取任务奖励'
    }
}; 