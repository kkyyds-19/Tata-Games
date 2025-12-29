import { BaseAPI } from "./BaseAPI";
import { 
    MyHeroListResponse,
    HeroBreakRequest,
    HeroBreakResponse,
    HeroBreakAutoResponse,
    HeroRebornRequest,
    HeroRebornResponse,
    HeroDetailResponse,
    HeroBattleRequest,
    HeroUpgradeRequest,
    HeroOneUpgradeRequest,
    HeroAbyssRequest,
    HeroAbyssResponse
} from "./APITypes";
import { UserClassData } from "../user/UserClassData";

/**
 * 我的英雄相关 API
 */
export class MyHeroAPI extends BaseAPI {
    /**
     * 查询我的英雄列表
     * @param retryCount 重试次数，默认3次
     * @returns Promise<MyHeroListResponse>
     */
    async getHeroList(retryCount: number = 3): Promise<MyHeroListResponse> {
        for (let i = 0; i < retryCount; i++) {
            try {
                const response = await this.request('myHero.getHeroList', {}, '获取我的英雄列表失败');
                console.log('我的英雄列表响应:', response);
                return response;
            } catch (error) {
                console.warn(`MyHeroAPI: 获取英雄列表失败 (尝试 ${i + 1}/${retryCount}):`, error);
                
                // 如果是最后一次尝试，抛出错误
                if (i === retryCount - 1) {
                    throw error;
                }
                
                // 等待一段时间后重试
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
        
        throw new Error('获取英雄列表失败，已重试多次');
    }

    /**
     * 查询敌方（指定用户）的上阵英雄列表
     * @param userId 敌方用户ID
     * @returns Promise<MyHeroListResponse>
     */
    async getEnemyList(userId: number): Promise<MyHeroListResponse> {
        const response = await this.request('myHero.getEnemyList', { userId }, '查询敌方英雄列表失败');
        // 规范化：确保返回值中的 heroId 为 number，且仅保留已上阵英雄
        const data = (response?.data || []).filter((h: any) => h && h.isBattle === 1);
        for (const h of data) {
            if (typeof h.heroId !== 'number') {
                h.heroId = Number(h.heroId);
            }
        }
        return { ...response, data };
    }

    /**
     * 查询敌方（指定用户）拥有的全部英雄列表（不筛选 isBattle）
     * 当对手未上阵或上阵列表为空时，可作为回退数据源
     * @param userId 敌方用户ID
     * @returns Promise<MyHeroListResponse>
     */
    async getEnemyOwnedList(userId: number): Promise<MyHeroListResponse> {
        const response = await this.request('myHero.getEnemyList', { userId }, '查询敌方拥有英雄列表失败');
        const data = (response?.data || []);
        for (const h of data) {
            if (typeof h?.heroId !== 'number') {
                (h as any).heroId = Number(h?.heroId);
            }
        }
        return { ...response, data };
    }

    /**
     * 英雄突破
     * @param id1 我的英雄id1
     * @param id2 我的英雄id2
     * @param id3 我的英雄id3
     * @returns Promise<HeroBreakResponse>
     */
    heroBreak(id1: number, id2?: number, id3?: number): Promise<HeroBreakResponse> {
        const params: HeroBreakRequest = { id1 };
        if (typeof id2 === 'number') (params as any).id2 = id2;
        if (typeof id3 === 'number') (params as any).id3 = id3;
        return this.request('myHero.heroBreak', params, '英雄突破失败')
            .then((response: HeroBreakResponse) => {
                console.log('英雄突破响应:', response);
                return response;
            });
    }

    /**
     * 英雄自动突破
     * @returns Promise<HeroBreakAutoResponse>
     */
    heroBreakAuto(): Promise<HeroBreakAutoResponse> {
        return this.request('myHero.heroBreakAuto', {}, '英雄自动突破失败')
            .then((response: HeroBreakAutoResponse) => {
                console.log('英雄自动突破响应:', response);
                return response;
            });
    }

    heroAbyss(id: number): Promise<HeroBreakResponse> {
        return this.heroBreak(id);
    }

    /**
     * 我的英雄等级重生
     * @param key 英雄nameAs
     * @returns Promise<HeroRebornResponse>
     */
    levelReborn(key: string): Promise<HeroRebornResponse> {
        const params: HeroRebornRequest = { key };
        return this.request('myHero.levelReborn', params, '英雄等级重生失败')
            .then((response: HeroRebornResponse) => {
                console.log('英雄等级重生响应:', response);
                return response;
            });
    }

    /**
     * 我的英雄品质重生
     * @param key 英雄nameAs
     * @returns Promise<HeroRebornResponse>
     */
    qualityReborn(key: string): Promise<HeroRebornResponse> {
        const params: HeroRebornRequest = { key };
        return this.request('myHero.qualityReborn', params, '英雄品质重生失败')
            .then((response: HeroRebornResponse) => {
                console.log('英雄品质重生响应:', response);
                return response;
            });
    }

    /**
     * 获取未上阵英雄详细信息
     * @param key 对应的英雄nameAs
     * @returns Promise<HeroDetailResponse>
     */
    getNoBattleDetail(key: string): Promise<HeroDetailResponse> {
        return this.request('myHero.getNoBattleDetail', { key }, '获取未上阵英雄详细信息失败')
            .then((response: HeroDetailResponse) => {
                console.log('未上阵英雄详细信息响应:', response);
                return response;
            });
    }

    /**
     * 获取上阵英雄详细信息
     * @param key 对应的英雄nameAs
     * @returns Promise<HeroDetailResponse>
     */
    getBattleDetail(key: string): Promise<HeroDetailResponse> {
        return this.request('myHero.getBattleDetail', { key }, '获取上阵英雄详细信息失败')
            .then((response: HeroDetailResponse) => {
                console.log('上阵英雄详细信息响应:', response);
                return response;
            });
    }

    /**
     * 根据server_key同步英雄数据
     * @param serverKey 服务器英雄key
     * @param cardId 本地卡片ID
     * @returns Promise<any>
     */
    async syncHeroData(serverKey: string, cardId: string): Promise<any> {
        try {
            // 检查英雄是否已上阵
            const userClassData = UserClassData.getInstance();
            const isDeployed = userClassData.isCardDeployed(cardId);
            
            let response;
            if (isDeployed) {
                // 已上阵，调用getBattleDetail
                console.log(`MyHeroAPI: 英雄已上阵，调用getBattleDetail, serverKey: ${serverKey}`);
                response = await this.getBattleDetail(serverKey);
            } else {
                // 未上阵，调用getNoBattleDetail
                console.log(`MyHeroAPI: 英雄未上阵，调用getNoBattleDetail, serverKey: ${serverKey}`);
                response = await this.getNoBattleDetail(serverKey);
            }
            
            console.log(`MyHeroAPI: 同步数据结果, serverKey: ${serverKey}, 响应:`, response);
            return { success: true, data: response };
            
        } catch (error) {
            console.error(`MyHeroAPI: 同步数据失败, serverKey: ${serverKey}, 错误:`, error);
            return { success: false, message: error.message || '同步数据失败' };
        }
    }

    /**
     * 英雄上阵
     * @param heroId 我的英雄id
     * @returns Promise<any>
     */
    heroBattle(heroId: number): Promise<any> {
        const params: HeroBattleRequest = { id: heroId };
        return this.request('myHero.heroBattle', params, '英雄上阵失败')
            .then((response: any) => {
                console.log('英雄上阵响应:', response);
                return response;
            });
    }

    /**
     * 英雄升级
     * @param heroId 我的英雄id
     * @returns Promise<any>
     */
    heroUpgrade(heroId: number): Promise<any> {
        const params: HeroUpgradeRequest = { id: heroId };
        return this.request('myHero.heroUpgrade', params, '英雄升级失败')
            .then((response: any) => {
                console.log('英雄升级响应:', response);
                return response;
            });
    }

    /**
     * 英雄一键升级
     * @param heroId 我的英雄id
     * @returns Promise<any>
     */
    heroOneUpgrade(heroId: number): Promise<any> {
        const params: HeroOneUpgradeRequest = { id: heroId };
        return this.request('myHero.heroOneUpgrade', params, '英雄一键升级失败')
            .then((response: any) => {
                console.log('英雄一键升级响应:', response);
                return response;
            });
    }
}

// 创建并导出单例实例
export const myHeroAPI = new MyHeroAPI();