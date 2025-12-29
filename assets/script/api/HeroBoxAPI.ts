import { BaseAPI } from "./BaseAPI";
import { 
    HeroBoxInfo, 
    HeroBoxResponse, 
    BoxDrawRequest, 
    BoxDrawResponse,
    BoxHeroListResponse,
    APIResponse
} from "./APITypes";

/**
 * 英雄宝箱相关 API
 */
export class HeroBoxAPI extends BaseAPI {
    /**
     * 获取玩家宝箱信息
     * @returns Promise<HeroBoxResponse>
     */
    getBoxInfo(): Promise<HeroBoxResponse> {
        return this.request('heroBox.getBoxInfo', {}, '获取宝箱信息失败')
            .then((response: HeroBoxResponse) => {
                console.log('宝箱信息响应:', response);
                return response;
            });
    }

    /**
     * 传说宝箱抽奖
     * @param id 传说宝箱ID
     * @param type 抽奖类型（1抽1次，10抽10次）
     * @returns Promise<BoxDrawResponse>
     */
    legendaryDraw(id: number, type: number): Promise<BoxDrawResponse> {
        const params: BoxDrawRequest = { id, type };
        return this.request('heroBox.legendaryDraw', params, '传说宝箱抽奖失败')
            .then((response: BoxDrawResponse) => {
                console.log('传说宝箱抽奖响应:', response);
                return response;
            });
    }

    /**
     * 稀有宝箱抽奖
     * @param id 稀有宝箱ID
     * @param type 抽奖类型（1抽1次，10抽10次）
     * @returns Promise<BoxDrawResponse>
     */
    rareDraw(id: number, type: number): Promise<BoxDrawResponse> {
        const params: BoxDrawRequest = { id, type };
        return this.request('heroBox.rareDraw', params, '稀有宝箱抽奖失败')
            .then((response: BoxDrawResponse) => {
                console.log('稀有宝箱抽奖响应:', response);
                return response;
            });
    }

    /**
     * 普通宝箱抽奖
     * @param id 普通宝箱ID
     * @param type 抽奖类型（1抽1次，10抽10次）
     * @returns Promise<BoxDrawResponse>
     */
    normalDraw(id: number, type: number): Promise<BoxDrawResponse> {
        const params: BoxDrawRequest = { id, type };
        return this.request('heroBox.normalDraw', params, '普通宝箱抽奖失败')
            .then((response: BoxDrawResponse) => {
                console.log('普通宝箱抽奖响应:', response);
                return response;
            });
    }

    /**
     * 获取宝箱里面的英雄列表
     * @param id 宝箱ID
     * @returns Promise<BoxHeroListResponse>
     */
    getHeroList(id: number): Promise<BoxHeroListResponse> {
        return this.request('heroBox.getHeroList', { id }, '获取宝箱英雄列表失败')
            .then((response: BoxHeroListResponse) => {
                console.log('宝箱英雄列表响应:', response);
                return response;
            });
    }

    /**
     * 检查宝箱倒计时状态
     * @param boxInfo 宝箱信息
     * @param boxType 宝箱类型 ('normal' | 'rare')
     * @returns 是否可以使用广告抽奖
     */
    canUseAdDraw(boxInfo: HeroBoxInfo, boxType: 'normal' | 'rare'): boolean {
        if (boxType === 'normal') {
            return boxInfo.normalBoxCountdown > 0;
        } else if (boxType === 'rare') {
            return boxInfo.rareBoxCountdown > 0;
        }
        return false;
    }

    /**
     * 检查宝箱钥匙数量
     * @param boxInfo 宝箱信息
     * @param boxType 宝箱类型 ('normal' | 'rare')
     * @returns 钥匙数量
     */
    getBoxKeyCount(boxInfo: HeroBoxInfo, boxType: 'normal' | 'rare'): number {
        if (boxType === 'normal') {
            return boxInfo.normalBoxKeyCount;
        } else if (boxType === 'rare') {
            return boxInfo.rareBoxKeyCount;
        }
        return 0;
    }

    /**
     * 获取宝箱ID
     * @param boxInfo 宝箱信息
     * @param boxType 宝箱类型 ('legendary' | 'rare' | 'normal')
     * @returns 宝箱ID
     */
    getBoxId(boxInfo: HeroBoxInfo, boxType: 'legendary' | 'rare' | 'normal'): number {
        switch (boxType) {
            case 'legendary':
                // 如果服务端没有提供legendaryBoxId，使用默认值1
                return boxInfo.legendaryBoxId || 1;
            case 'rare':
                // 如果服务端没有提供rareBoxId，使用默认值3
                return boxInfo.rareBoxId || 3;
            case 'normal':
                // 如果服务端没有提供normalBoxId，使用默认值2
                return boxInfo.normalBoxId || 2;
            default:
                return 0;
        }
    }
}

// 创建并导出单例实例
export const heroBoxAPI = new HeroBoxAPI();

/**
 * 英雄宝箱API使用示例
 */
export class HeroBoxAPIExamples {
    /**
     * 示例：获取宝箱信息并处理
     */
    static async getBoxInfoExample(): Promise<void> {
        try {
            const response = await heroBoxAPI.getBoxInfo();
            if (response.code === 200 || response.code === 0) {
                const boxInfo = response.data;
                console.log('宝箱信息:', boxInfo);
                
                // 检查各种宝箱状态
                console.log('传说宝箱ID:', boxInfo.legendaryBoxId);
                console.log('稀有宝箱ID:', boxInfo.rareBoxId);
                console.log('普通宝箱ID:', boxInfo.normalBoxId);
                
                // 检查倒计时状态
                console.log('普通宝箱可广告抽奖:', heroBoxAPI.canUseAdDraw(boxInfo, 'normal'));
                console.log('稀有宝箱可广告抽奖:', heroBoxAPI.canUseAdDraw(boxInfo, 'rare'));
                
                // 检查钥匙数量
                console.log('普通宝箱钥匙数量:', heroBoxAPI.getBoxKeyCount(boxInfo, 'normal'));
                console.log('稀有宝箱钥匙数量:', heroBoxAPI.getBoxKeyCount(boxInfo, 'rare'));
            }
        } catch (error) {
            console.error('获取宝箱信息失败:', error);
        }
    }

    /**
     * 示例：传说宝箱抽奖
     */
    static async legendaryDrawExample(): Promise<void> {
        try {
            // 先获取宝箱信息
            const boxInfoResponse = await heroBoxAPI.getBoxInfo();
            if (boxInfoResponse.code === 200 || boxInfoResponse.code === 0) {
                const boxId = heroBoxAPI.getBoxId(boxInfoResponse.data, 'legendary');
                
                // 抽1次
                const response = await heroBoxAPI.legendaryDraw(boxId, 1);
                if (response.code === 200 || response.code === 0) {
                    console.log('传说宝箱抽奖结果:', response.data);
                }
            }
        } catch (error) {
            console.error('传说宝箱抽奖失败:', error);
        }
    }

    /**
     * 示例：稀有宝箱抽奖
     */
    static async rareDrawExample(): Promise<void> {
        try {
            const boxInfoResponse = await heroBoxAPI.getBoxInfo();
            if (boxInfoResponse.code === 200 || boxInfoResponse.code === 0) {
                const boxId = heroBoxAPI.getBoxId(boxInfoResponse.data, 'rare');
                
                // 抽10次
                const response = await heroBoxAPI.rareDraw(boxId, 10);
                if (response.code === 200 || response.code === 0) {
                    console.log('稀有宝箱抽奖结果:', response.data);
                }
            }
        } catch (error) {
            console.error('稀有宝箱抽奖失败:', error);
        }
    }

    /**
     * 示例：普通宝箱抽奖
     */
    static async normalDrawExample(): Promise<void> {
        try {
            const boxInfoResponse = await heroBoxAPI.getBoxInfo();
            if (boxInfoResponse.code === 200 || boxInfoResponse.code === 0) {
                const boxId = heroBoxAPI.getBoxId(boxInfoResponse.data, 'normal');
                
                // 抽1次
                const response = await heroBoxAPI.normalDraw(boxId, 1);
                if (response.code === 200 || response.code === 0) {
                    console.log('普通宝箱抽奖结果:', response.data);
                }
            }
        } catch (error) {
            console.error('普通宝箱抽奖失败:', error);
        }
    }

    /**
     * 示例：获取宝箱英雄列表
     */
    static async getHeroListExample(): Promise<void> {
        try {
            const boxInfoResponse = await heroBoxAPI.getBoxInfo();
            if (boxInfoResponse.code === 200 || boxInfoResponse.code === 0) {
                const boxId = heroBoxAPI.getBoxId(boxInfoResponse.data, 'legendary');
                
                const response = await heroBoxAPI.getHeroList(boxId);
                if (response.code === 200 || response.code === 0) {
                    console.log('宝箱英雄列表:', response.data);
                }
            }
        } catch (error) {
            console.error('获取宝箱英雄列表失败:', error);
        }
    }

    /**
     * 示例：测试默认值处理
     * 验证当服务端没有提供宝箱ID字段时，是否能正确使用默认值
     */
    static testDefaultValues(): void {
        // 模拟服务端没有提供宝箱ID字段的情况
        const mockBoxInfo: HeroBoxInfo = {
            legendaryBoxEliteCount: 10,
            legendaryBoxSEliteCount: 50,
            legendaryDiamond1: 300,
            legendaryDiamond10: 2700,
            normalBoxGoodCount: 10,
            normalBoxKeyCount: 0,
            normalBoxCountdown: 10000,
            rareBoxGoodCount: 10,
            rareBoxKeyCount: 0,
            rareBoxCountdown: 10000
            // 注意：没有提供 legendaryBoxId, rareBoxId, normalBoxId
        };

        // 测试默认值处理
        const legendaryId = heroBoxAPI.getBoxId(mockBoxInfo, 'legendary');
        const rareId = heroBoxAPI.getBoxId(mockBoxInfo, 'rare');
        const normalId = heroBoxAPI.getBoxId(mockBoxInfo, 'normal');

        console.log('测试默认值处理:');
        console.log('传说宝箱ID (默认值):', legendaryId); // 应该输出 1
        console.log('稀有宝箱ID (默认值):', rareId);       // 应该输出 3
        console.log('普通宝箱ID (默认值):', normalId);     // 应该输出 2

        // 验证默认值是否正确
        if (legendaryId === 1 && rareId === 3 && normalId === 2) {
            console.log('✅ 默认值处理测试通过');
        } else {
            console.log('❌ 默认值处理测试失败');
        }
    }
} 