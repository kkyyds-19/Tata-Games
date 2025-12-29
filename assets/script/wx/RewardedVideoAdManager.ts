/**
 * 激励视频广告管理器
 * 功能：处理微信激励视频广告的播放、计数和回调
 * 纯TS单例模式，不依赖Component
 */

import { EDITOR, WECHAT } from 'cc/env';
import { TimeManager } from '../game/TimeManager';
import { SimulatedAdComponent, AdSuccessCallback, AdFailCallback } from './SimulatedAdComponent';

// 微信API类型声明
declare const wx: any;

// 广告配置接口
export interface AdConfig {
    adUnitId: string;
    maxAdCount: number;
    simulationDuration?: number;
    simulationPrefabPath?: string;
    useSimulation?: boolean; // 新增：是否使用模拟广告
}

// 广告缓存项接口
interface AdCacheItem {
    rewardedVideoAd: any;
    playCount: number;
}

export class RewardedVideoAdManager {
    // 单例实例
    private static _instance: RewardedVideoAdManager = null;
    
    // 静态缓存，避免重复创建广告实例
    private static adCaches: Map<string, AdCacheItem> = new Map();
    
    // ==================== 配置属性 ====================
    private adUnitId: string = '';
    private maxAdCount: number = 10;
    private simulationDuration: number = 10;
    private simulationPrefabPath: string = 'prefabs/SimulatedAd';
    private useSimulation: boolean = true; // 新增：默认使用模拟广告
    
    // ==================== 私有属性 ====================
    private isAdInitialized: boolean = false;
    
    // UI更新回调
    private onAdCountChanged: (remainingCount: number) => void = null;

    /**
     * 私有构造函数，防止外部实例化
     */
    private constructor() {}

    /**
     * 获取单例实例
     */
    public static getInstance(): RewardedVideoAdManager {
        if (!RewardedVideoAdManager._instance) {
            RewardedVideoAdManager._instance = new RewardedVideoAdManager();
        }
        return RewardedVideoAdManager._instance;
    }

    /**
     * 初始化广告管理器
     * @param config 广告配置
     */
    public init(config: AdConfig): void {
        this.adUnitId = config.adUnitId;
        this.maxAdCount = config.maxAdCount;
        this.simulationDuration = config.simulationDuration || 10;
        this.simulationPrefabPath = config.simulationPrefabPath || 'prefabs/SimulatedAd';
        this.useSimulation = config.useSimulation !== undefined ? config.useSimulation : true; // 默认使用模拟广告
        
        this.initRewardedAd();
    }

    /**
     * 设置UI更新回调
     * @param callback 回调函数
     */
    public setAdCountCallback(callback: (remainingCount: number) => void): void {
        this.onAdCountChanged = callback;
    }

    /**
     * 初始化激励广告
     */
    private initRewardedAd(): void {
        if (!this.adUnitId) {
            console.log('RewardedVideoAdManager: 广告ID不存在，跳过广告初始化');
            return;
        }

        // 检查是否使用模拟广告
        if (this.useSimulation) {
            console.log('RewardedVideoAdManager: 开发模式，使用模拟广告');
            return;
        }

        if (!WECHAT) {
            console.log('RewardedVideoAdManager: 非微信环境，使用模拟广告');
            return;
        }

        this.createRewardedVideoAd();
        this.isAdInitialized = true;
    }

    /**
     * 创建激励视频广告
     */
    private createRewardedVideoAd(): void {
        let item = RewardedVideoAdManager.adCaches.get(this.adUnitId);
        if (item) {
            console.log('RewardedVideoAdManager: 广告已存在，跳过创建');
            this.updateAdCountDisplay();
            return;
        }

        item = { playCount: 0, rewardedVideoAd: null };
        RewardedVideoAdManager.adCaches.set(this.adUnitId, item);

        item.rewardedVideoAd = wx.createRewardedVideoAd({
            adUnitId: this.adUnitId
        });

        // 广告加载成功
        item.rewardedVideoAd.onLoad(() => {
            console.log('RewardedVideoAdManager: 广告加载成功');
        });

        // 广告加载失败
        item.rewardedVideoAd.onError(error => {
            console.log('RewardedVideoAdManager: 广告加载失败：', error);
            item.rewardedVideoAd.load();
        });

        this.updateAdCountDisplay();
        console.log('RewardedVideoAdManager: 激励广告初始化完成');
    }

    /**
     * 播放激励广告
     * @param successCallback 成功回调函数
     * @param failCallback 失败回调函数
     */
    public playRewardedAd(successCallback?: AdSuccessCallback, failCallback?: AdFailCallback): void {
        // 检查是否使用模拟广告
        if (this.useSimulation || !WECHAT) {
            // 使用SimulatedAdComponent的静态方法播放模拟广告
            SimulatedAdComponent.playAd(this.simulationPrefabPath, this.simulationDuration, successCallback, failCallback);
            return;
        }

        let item = RewardedVideoAdManager.adCaches.get(this.adUnitId);
        if (!item) {
            console.log(`RewardedVideoAdManager: 广告${this.adUnitId}不存在`);
            if (failCallback) {
                failCallback({ error: '广告不存在' });
            }
            return;
        }

        if (item.playCount >= this.maxAdCount) {
            console.log(`RewardedVideoAdManager: 广告${this.adUnitId}，已达到最大播放次数`);
            if (failCallback) {
                failCallback({ error: '已达到最大播放次数' });
            }
            return;
        }

        item.rewardedVideoAd.show();
        TimeManager.getInstance().pause();

        let callback = (res) => {
            item.rewardedVideoAd.offClose(callback);
            if (res && res.isEnded || res === undefined) {
                item.playCount++;
                this.updateAdCountDisplay();
                console.log(`RewardedVideoAdManager: 广告播放完成，当前播放次数: ${item.playCount}`);
                
                // 调用成功回调
                if (successCallback) {
                    successCallback(res);
                }
            } else {
                console.log('RewardedVideoAdManager: 广告未完整播放');
                
                // 调用失败回调
                if (failCallback) {
                    failCallback({ error: '广告未完整播放' });
                }
            }
            TimeManager.getInstance().resume();
        }
        item.rewardedVideoAd.onClose(callback);
    }

    /**
     * 更新广告次数显示
     */
    private updateAdCountDisplay(): void {
        const remainingCount = this.getRemainingAdCount();
        if (this.onAdCountChanged) {
            this.onAdCountChanged(remainingCount);
        }
    }

    /**
     * 检查广告是否可用
     */
    public isAdAvailable(): boolean {
        // 如果使用模拟广告，始终可用
        if (this.useSimulation) return true;
        
        if (!WECHAT || !this.adUnitId) return false;
        
        let item = RewardedVideoAdManager.adCaches.get(this.adUnitId);
        return item && item.playCount < this.maxAdCount;
    }

    /**
     * 获取剩余广告次数
     */
    public getRemainingAdCount(): number {
        // 如果使用模拟广告，返回最大次数
        if (this.useSimulation) return this.maxAdCount;
        
        if (!this.adUnitId) return 0;
        
        let item = RewardedVideoAdManager.adCaches.get(this.adUnitId);
        if (!item) return this.maxAdCount;
        
        return Math.max(0, this.maxAdCount - item.playCount);
    }

    /**
     * 重置广告计数（用于测试）
     */
    public resetAdCount(): void {
        if (this.adUnitId) {
            let item = RewardedVideoAdManager.adCaches.get(this.adUnitId);
            if (item) {
                item.playCount = 0;
                this.updateAdCountDisplay();
                console.log('RewardedVideoAdManager: 广告计数已重置');
            }
        }
    }

    /**
     * 设置是否使用模拟广告
     * @param useSimulation 是否使用模拟广告
     */
    public setUseSimulation(useSimulation: boolean): void {
        this.useSimulation = useSimulation;
        console.log(`RewardedVideoAdManager: 模拟广告模式已${useSimulation ? '开启' : '关闭'}`);
    }

    /**
     * 获取当前是否使用模拟广告
     */
    public getUseSimulation(): boolean {
        return this.useSimulation;
    }

    /**
     * 清理所有广告缓存
     */
    public static clearAllAdCaches(): void {
        RewardedVideoAdManager.adCaches.clear();
        console.log('RewardedVideoAdManager: 所有广告缓存已清理');
    }

    /**
     * 销毁管理器
     */
    public destroy(): void {
        // 清理单例引用
        RewardedVideoAdManager._instance = null;
        
        console.log('RewardedVideoAdManager: 管理器已销毁');
    }
} 