import { APIConfig } from '../APIConfig';

/**
 * 我的英雄相关API配置
 */
export const myHeroConfigs: Record<string, APIConfig> = {
    'myHero.getHeroList': {
        url: '/api/my/hero/list',
        method: 'GET',
        paramType: 'query',
        description: '查询我的英雄列表'
    },

    'myHero.getEnemyList': {
        url: '/api/my/hero/battleList',
        method: 'GET',
        paramType: 'query',
        parameters: [
            { name: 'userId', type: 'number', required: true, description: '敌方用户id' }
        ],
        description: '查询敌方英雄列表'
    },



    'myHero.heroBattle': {
        url: '/api/my/hero/battle',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '我的英雄id' }
        ],
        description: '英雄上阵'
    },

    'myHero.heroUpgrade': {
        url: '/api/my/hero/upgrade',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '我的英雄id' }
        ],
        description: '英雄升级'
    },

    'myHero.heroOneUpgrade': {
        url: '/api/my/hero/one/upgrade',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '我的英雄id' }
        ],
        description: '英雄一键升级'
    },

    'myHero.heroBreak': {
        url: '/api/my/hero/myHeroBreak',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id1', type: 'number', required: true, description: '我的英雄id1' },
            { name: 'id2', type: 'number', required: false, description: '我的英雄id2(可选)' },
            { name: 'id3', type: 'number', required: false, description: '我的英雄id3(可选)' }
        ],
        description: '英雄突破(支持1~3个英雄)'
    },

    'myHero.heroBreakAuto': {
        url: '/api/my/hero/myHeroBreakAuto',
        method: 'GET',
        paramType: 'query',
        description: '英雄自动突破'
    },

    'myHero.heroAbyss': {
        url: '/api/my/hero/abyss',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'id', type: 'number', required: true, description: '我的英雄id' }
        ],
        description: '单英雄深渊突破'
    },

    'myHero.levelReborn': {
        url: '/api/my/hero/levelReborn',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'key', type: 'string', required: true, description: '英雄对应的key' }
        ],
        description: '我的英雄等级重生'
    },

    'myHero.qualityReborn': {
        url: '/api/my/hero/qualityReborn',
        method: 'POST',
        paramType: 'body-json',
        parameters: [
            { name: 'key', type: 'string', required: true, description: '英雄对应的key' }
        ],
        description: '我的英雄品质重生'
    },

    'myHero.getNoBattleDetail': {
        url: '/api/my/hero/noBattleDetail',
        method: 'GET',
        paramType: 'query',
        parameters: [
            { name: 'key', type: 'string', required: true, description: '对应的英雄nameAs' }
        ],
        description: '获取未上阵英雄详细信息'
    },

    'myHero.getBattleDetail': {
        url: '/api/my/hero/battleDetail',
        method: 'GET',
        paramType: 'query',
        parameters: [
            { name: 'key', type: 'string', required: true, description: '对应的英雄nameAs' }
        ],
        description: '获取上阵英雄详细信息'
    }
};