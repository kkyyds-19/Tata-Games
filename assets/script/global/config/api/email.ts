import { APIConfig } from '../APIConfig';

/**
 * 邮箱相关API配置
 */
export const emailConfigs: Record<string, APIConfig> = {
    'email.getEmailList': {
        url: '/api/user/email/list',
        method: 'GET',
        paramType: 'query',
        description: '查询用户邮件记录列表'
    },

    'email.receiveEmailReward': {
        url: '/api/user/email/{id}',
        method: 'GET',
        paramType: 'path',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '邮件ID' }
        ],
        description: '领取奖励'
    },

    'email.deleteEmail': {
        url: '/api/user/email/{id}',
        method: 'GET',
        paramType: 'path',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '邮件ID' }
        ],
        description: '删除用户邮件记录'
    },

    'email.receiveAllRewards': {
        url: '/api/user/email/receive',
        method: 'GET',
        paramType: 'query',
        description: '一键领取奖励'
    },

    'email.deleteAllEmails': {
        url: '/api/user/email/delete',
        method: 'GET',
        paramType: 'query',
        description: '一键删除用户邮件记录'
    }
}; 