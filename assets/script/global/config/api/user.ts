import { APIConfig } from '../APIConfig';

/**
 * 用户相关API配置
 */
export const userConfigs: Record<string, APIConfig> = {
    // 用户登录注册API
    'user.login': {
        url: '/api/user/login',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'phone', type: 'string', required: true, description: '手机号' },
            { name: 'password', type: 'string', required: true, description: '密码' }
        ],
        description: '用户登录'
    },

    'user.register': {
        url: '/api/user/register',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'phone', type: 'string', required: true, description: '手机号' },
            { name: 'code', type: 'string', required: true, description: '验证码' },
            { name: 'password', type: 'string', required: true, description: '密码' },
            { name: 'vxCode', type: 'string', required: true, description: '微信code' }
        ],
        description: '用户注册'
    },

    'user.wxLogin': {
        url: '/api/user/wx/register',
        method: 'GET',
        paramType: 'query',
        parameters: [
            { name: 'code', type: 'string', required: true, description: '微信code' }
        ],
        description: '微信端用户登录'
    },

    // 用户基础信息API
    'user.updateNickname': {
        url: '/api/user/update/nickname',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'nickName', type: 'string', required: true, description: '用户昵称' }
        ],
        description: '用户更改昵称'
    },
    
    'user.updateIcon': {
        url: '/api/user/update/icon',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'key', type: 'string', required: true, description: '头像标识' }
        ],
        description: '用户更改头像'
    },

    'user.updatePassword': {
        url: '/api/user/update/password',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'key', type: 'string', required: true, description: '新密码' }
        ],
        description: '用户更改密码'
    },

    'user.getHomeInfo': {
        url: '/api/user/home',
        method: 'GET',
        paramType: 'query',
        description: '用户首页接口信息'
    },

    // 用户等级更新API
    'user.updateLevel': {
        url: '/api/user/update/level',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'level', type: 'number', required: true, description: '用户等级' }
        ],
        description: '用户更新等级'
    },

    // 荣誉竞技场挑战玩家直接获得荣誉积分
    'user.honorGrant': {
        url: '/api/user/honor',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'challengeUserId', type: 'number', required: true, description: '被挑战的对手用户ID' },
            { name: 'challengeResult', type: 'number', required: true, description: '挑战结果（0胜利，1失败）' },
            { name: 'change', type: 'number', required: true, description: '荣誉积分变化值（胜利+3，失败-1）' }
        ],
        description: '荣誉竞技场胜利后直接变更荣誉积分'
    }
    ,
    'user.getGulchInfo': {
        url: '/api/user/gulch',
        method: 'GET',
        paramType: 'query',
        parameters: [],
        description: '战歌峡谷信息'
    },
    'user.gulchChallenge': {
        url: '/api/user/gulch',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'challengeUserId', type: 'number', required: true, description: '被挑战的对手用户ID' },
            { name: 'challengeResult', type: 'number', required: true, description: '挑战结果（0失败，1胜利）' }
        ],
        description: '战歌峡谷挑战结果上报'
    },
    'user.gulchReceive': {
        url: '/api/user/gulch/receive',
        method: 'POST',
        paramType: 'body-json',
        parameters: [],
        description: '战歌峡谷领取水晶'
    },
    'user.flamesVoucher': {
        url: '/api/user/flames/voucher',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'num', type: 'number', required: true, description: '烈焰卷获取' }
        ],
        description: '领取火焰凭证'
    },
    'user.getList': {
        url: '/api/user/list',
        method: 'GET',
        paramType: 'query',
        description: '查询用户列表'
    }
};
