import { BaseAPI } from "./BaseAPI";
import { 
    TowerListResponse,
    TowerDetailResponse,
    AddTowerRequest,
    AddTowerResponse,
    TowerUpgradeRequest,
    TowerUpgradeResponse,
    ObtainTowerRequest,
    ObtainTowerResponse
} from "./APITypes";
import { UserWatchtowerData } from "../user/UserWatchtowerData";

/**
 * 哨塔相关 API
 */
export class TowerAPI extends BaseAPI {
    /**
     * 查询玩家哨塔列表
     * @returns Promise<TowerListResponse>
     */
    getTowerList(): Promise<TowerListResponse> {
        return this.request('tower.getTowerList', {}, '获取哨塔列表失败')
            .then((response: TowerListResponse) => {
                console.log('哨塔列表响应:', response);
                return response;
            });
    }

    /**
     * 获取玩家哨塔详细信息
     * @param id 哨塔ID
     * @returns Promise<TowerDetailResponse>
     */
    getTowerDetail(watchtowerId: number): Promise<TowerDetailResponse> {
        return this.request('tower.getTowerDetail', { watchtowerId }, '获取哨塔详细信息失败')
            .then((response: TowerDetailResponse) => {
                console.log('哨塔详细信息响应:', response);
                return response;
            })
            .catch(async (err) => {
                const rid = UserWatchtowerData.getInstance().getServerRecordIdByWatchtowerId(watchtowerId);
                if (!rid) throw err;
                const fallback = await this.get(`/api/user/watchtower/${rid}`, '获取哨塔详细信息失败(备用)');
                console.log('哨塔详情备用端点响应:', fallback);
                return fallback as TowerDetailResponse;
            });
    }

    getTowerDetailByConfigId(configId: number): Promise<TowerDetailResponse> {
        const userData = UserWatchtowerData.getInstance();
        const wid = userData.getServerWatchtowerIdByConfigId(configId);
        if (!wid) {
            const rid = userData.getServerRecordIdByTowerId(configId);
            if (!rid) return Promise.reject(new Error('未找到服务器watchtowerId或记录id'));
            return this.get(`/api/user/watchtower/${rid}`, '获取哨塔详细信息失败(备用)') as Promise<TowerDetailResponse>
        }
        return this.request('tower.getTowerDetail', { watchtowerId: wid }, '获取哨塔详细信息失败')
            .then((response: TowerDetailResponse) => {
                console.log('哨塔详细信息响应:', response);
                return response;
            })
            .catch(async (err) => {
                const rid = userData.getServerRecordIdByTowerId(configId);
                if (!rid) throw err;
                const fallback = await this.get(`/api/user/watchtower/${rid}`, '获取哨塔详细信息失败(备用)');
                console.log('哨塔详情备用端点响应:', fallback);
                return fallback as TowerDetailResponse;
            });
    }

    /**
     * 新增玩家哨塔
     * @param towerRequest 哨塔请求参数
     * @returns Promise<AddTowerResponse>
     */
    addTower(towerRequest: AddTowerRequest): Promise<AddTowerResponse> {
        return this.request('tower.addTower', towerRequest, '新增哨塔失败')
            .then((response: AddTowerResponse) => {
                console.log('新增哨塔响应:', response);
                return response;
            });
    }

    /**
     * 升级玩家哨塔
     * @param id 哨塔ID
     * @returns Promise<TowerUpgradeResponse>
     */
    // upgradeTower(watchtowerId: number): Promise<TowerUpgradeResponse> {
    //     const params: TowerUpgradeRequest = { watchtowerId };
    //     return this.request('tower.upgradeTower', params, '哨塔升级失败')
    //         .then((response: TowerUpgradeResponse) => {
    //             console.log('哨塔升级响应:', response);
    //             return response;
    //         })
    //         .catch(async (err) => {
    //             const userData = UserWatchtowerData.getInstance();
    //             const rid = userData.getServerRecordIdByWatchtowerId(watchtowerId);
    //             if (!rid) throw err;
    //             const body: any = { id: rid };
    //             const fallback = await this.post('/api/user/watchtower/upgrade', body, '哨塔升级失败(备用)');
    //             console.log('哨塔升级备用端点响应:', fallback);
    //             return fallback as TowerUpgradeResponse;
    //         });
    // }

    upgradeTowerByConfigId(configId: number): Promise<TowerUpgradeResponse> {
        const userData = UserWatchtowerData.getInstance();
        const wid = userData.getServerWatchtowerIdByConfigId(configId);
        if (!wid) {
            return Promise.reject(new Error('未找到服务器watchtowerId'));
        }
        const params: TowerUpgradeRequest = { watchtowerId: wid };
        return this.request('tower.upgradeTower', params, '哨塔升级失败')
            .then((response: TowerUpgradeResponse) => {
                console.log('哨塔升级响应:', response);
                return response;
            })
            .catch(async (err) => {
                const rid = userData.getServerRecordIdByTowerId(configId);
                if (!rid) throw err;
                try {
                    const body: any = { id: wid };
                    //if (wid) body.watchtowerId = wid;
                    const fallback = await this.post('/api/user/watchtower/upgrade', body, '哨塔升级失败(备用)');
                    console.log('哨塔升级备用端点响应:', fallback);
                    return fallback as TowerUpgradeResponse;
                } catch (fallbackErr) {
                    throw fallbackErr;
                }
            });
    }

    // obtainTower(watchtowerId: number): Promise<ObtainTowerResponse> {
    //     const params: ObtainTowerRequest = { watchtowerId };
    //     return this.request('tower.obtainTower', params, '哨塔升星失败')
    //         .then((response: ObtainTowerResponse) => {
    //             console.log('哨塔升星响应:', response);
    //             return response;
    //         })
    //         .catch(async (err) => {
    //             const userData = UserWatchtowerData.getInstance();
    //             const rid = userData.getServerRecordIdByWatchtowerId(watchtowerId);
    //             if (!rid) throw err;
    //             const body: any = { id: rid, watchtowerId };
    //             const fallback = await this.post('/api/user/watchtower/obtain', body, '哨塔升星失败(备用)');
    //             console.log('哨塔升星备用端点响应:', fallback);
    //             return fallback as ObtainTowerResponse;
    //         });
    // }

    obtainTowerByConfigId(configId: number): Promise<ObtainTowerResponse> {
        const userData = UserWatchtowerData.getInstance();
        const wid = userData.getServerWatchtowerIdByConfigId(configId);
        if (!wid) {
            return Promise.reject(new Error('未找到服务器watchtowerId'));
        }
        const params: ObtainTowerRequest = { watchtowerId: wid };
        return this.request('tower.obtainTower', params, '哨塔升星失败')
            .then((response: ObtainTowerResponse) => {
                console.log('哨塔升星响应:', response);
                return response;
            })
            .catch(async (err) => {
                const rid = userData.getServerRecordIdByTowerId(configId);
                if (!rid) throw err;
                try {
                    const body: any = { id: wid };
                    if (wid) body.watchtowerId = wid;
                    const fallback = await this.post('/api/user/watchtower/obtain', body, '哨塔升星失败(备用)');
                    console.log('哨塔升星备用端点响应:', fallback);
                    return fallback as ObtainTowerResponse;
                } catch (fallbackErr) {
                    throw fallbackErr;
                }
            });
    }
}

// 创建并导出单例实例
export const towerAPI = new TowerAPI(); 
