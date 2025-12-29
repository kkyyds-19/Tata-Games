import { BaseAPI } from "./BaseAPI";
import { ArenaOpponentTeamResponse, ArenaSubmitResultRequest, ArenaSubmitResultResponse } from "./APITypes";

/**
 * 竞技场相关 API
 */
export class ArenaAPI extends BaseAPI {
  /**
   * 获取荣誉竞技场对手阵容
   * @param stageId 可选关卡/场次ID
   */
  getOpponentTeam(stageId?: number): Promise<ArenaOpponentTeamResponse> {
    const params: any = {};
    if (stageId !== undefined) params.stageId = stageId;
    
    return this.request('arena.getOpponentTeam', params, '获取竞技场对手阵容失败')
      .then((response: ArenaOpponentTeamResponse) => {
        // 统一将 heroIds 规范化为 number[]，避免服务端返回字符串导致类型不匹配
        const data = response?.data;
        if (data && Array.isArray(data.heroIds)) {
          data.heroIds = data.heroIds
            .map((id: any) => (typeof id === 'string' ? parseInt(id, 10) : Number(id)))
            .filter((n: number) => Number.isFinite(n));
        }
        return response;
      })
      .catch((error: any) => {
        // 开发阶段：接口404时返回模拟数据
        if (error?.status === 404 || error?.message?.includes('404')) {
          console.warn('竞技场接口未就绪，使用模拟对手阵容');
          return this.getMockOpponentTeam(stageId);
        }
        throw error;
      });
  }

  /**
   * 开发阶段使用的模拟对手阵容
   */
  private getMockOpponentTeam(stageId?: number): Promise<ArenaOpponentTeamResponse> {
    // 根据关卡ID返回不同的模拟阵容
    const mockTeams = [
      // 阵容1：均衡阵容
      { opponentId: 1001, nickname: '竞技场高手', heroIds: [1005, 1006, 1010, 1011, 1009] },
      // 阵容2：坦克阵容  
      { opponentId: 1002, nickname: '钢铁防线', heroIds: [1005, 1000, 1010, 1001, 1006] },
      // 阵容3：输出阵容
      { opponentId: 1003, nickname: '火力全开', heroIds: [1002, 1007, 1008, 1009, 1011] },
      // 阵容4：混合阵容
      { opponentId: 1004, nickname: '全能战士', heroIds: [1000, 1002, 1006, 1008, 1010] }
    ];

    // 根据stageId选择不同的阵容，如果没有stageId则随机选择
    const teamIndex = stageId ? (stageId % mockTeams.length) : Math.floor(Math.random() * mockTeams.length);
    const mockData = mockTeams[teamIndex];

    return Promise.resolve({
      code: 200,
      data: mockData,
      msg: '模拟数据：开发阶段使用'
    });
  }

  /**
   * 提交竞技场结算结果，并让服务器更新荣誉积分
   * @param params { stageId?, isVictory, honorDelta }
   */
  submitResult(params: ArenaSubmitResultRequest): Promise<ArenaSubmitResultResponse> {
    return this.request('arena.submitResult', params, '上报竞技场结果失败');
  }
}

// 创建并导出单例实例
export const arenaAPI = new ArenaAPI();