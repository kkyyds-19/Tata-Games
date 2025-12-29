import { APIConfig } from '../APIConfig';

/**
 * 竞技场相关API配置
 */
export const arenaConfigs: Record<string, APIConfig> = {
  'arena.getOpponentTeam': {
    url: '/api/arena/opponent/team',
    method: 'GET',
    paramType: 'query',
    parameters: [
      { name: 'stageId', type: 'number', required: false, description: '关卡/场次ID' }
    ],
    description: '获取荣誉竞技场对手阵容'
  },
  // 提交竞技场结果并同步荣誉点到服务器
  'arena.submitResult': {
    url: '/api/arena/result',
    method: 'POST',
    paramType: 'body-json',
    parameters: [
      { name: 'stageId', type: 'number', required: false, description: '关卡/场次ID（可选）' },
      { name: 'isVictory', type: 'boolean', required: true, description: '是否胜利' },
      { name: 'honorDelta', type: 'number', required: true, description: '荣誉点变化（胜利+3，失败-1）' }
    ],
    description: '上报竞技场结算结果，服务器更新并返回最新荣誉点'
  }
};