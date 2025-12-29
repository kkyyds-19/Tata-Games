import { BaseAPI } from "./BaseAPI";
import { 
    MonsterInfo, 
    MonsterListResponse, 
    MonsterRequest,
    APIResponse
} from "./APITypes";

/**
 * 怪物图鉴相关 API
 */
export class MonsterAPI extends BaseAPI {
    /**
     * 查询玩家怪物图鉴列表
     * @param type 怪物类型
     * @param pageNum 页码
     * @param pageSize 每页大小
     * @returns Promise<MonsterListResponse>
     */
    getMonsterList(type: string, pageNum: number, pageSize: number): Promise<MonsterListResponse> {
        return this.request('monster.getMonsterList', { type, pageNum, pageSize }, '获取怪物图鉴列表失败')
            .then((response: MonsterListResponse) => {
                return response;
            });
    }

    /**
     * 解锁玩家怪物图鉴
     * @param key 怪物key
     * @returns Promise<APIResponse<any>>
     */
    unlockMonster(key: string): Promise<APIResponse<any>> {
        const params: MonsterRequest = { key };
        return this.request('monster.unlockMonster', params, '解锁怪物图鉴失败')
            .then((response: APIResponse<any>) => {
                console.log('解锁怪物图鉴响应:', response);
                return response;
            });
    }

    /**
     * 领取玩家怪物图鉴奖励
     * @param key 怪物key
     * @returns Promise<APIResponse<any>>
     */
    receiveReward(key: string): Promise<APIResponse<any>> {
        const params: MonsterRequest = { key };
        return this.request('monster.receiveReward', params, '领取怪物图鉴奖励失败')
            .then((response: APIResponse<any>) => {
                console.log('领取怪物图鉴奖励响应:', response);
                return response;
            });
    }

    /**
     * 一键领取玩家怪物图鉴奖励
     * @returns Promise<APIResponse<any>>
     */
    receiveAllRewards(): Promise<APIResponse<any>> {
        return this.request('monster.receiveAllRewards', {}, '一键领取怪物图鉴奖励失败')
            .then((response: APIResponse<any>) => {
                console.log('一键领取怪物图鉴奖励响应:', response);
                return response;
            });
    }
}

// 创建并导出单例实例
export const monsterAPI = new MonsterAPI(); 