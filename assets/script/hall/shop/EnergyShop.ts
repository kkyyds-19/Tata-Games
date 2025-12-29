import { _decorator, Component, Node, Button, Label } from 'cc';
import { ShopdataHelper } from './ShopdataHelper';
import { ShowToast } from '../../global/Toast';
import { UserInfoData } from '../../user/UserInfoData';
import { RewardedVideoAdManager } from '../../wx/RewardedVideoAdManager';
import { staminaAPI } from '../../api/API';
import { SmartLoginManager } from '../../welcome/SmartLoginManager';

const { ccclass, property } = _decorator;

// 体力购买配置接口
interface StaminaPurchaseConfig {
    id: number;
    type: number;           // 购买类型：1=钻石购买，2=看广告
    stamina: number;        // 获得体力数量
    cost: number;          // 消耗钻石数量（钻石购买时）
    remaining: number;     // 剩余次数
}

@ccclass('EnergyShop')
export class EnergyShop extends Component {

    // --- 钻石购买区域 ---
 

    @property(Label)
    public diamondRemainingCountLabel: Label = null!;

    @property(Label)
    public diamondEnergyAmountLabel: Label = null!;

    @property(Button)
    public diamondBuyButton: Button = null!;

    // --- 看广告获取区域 ---

    @property(Label)
    public adRemainingCountLabel: Label = null!;

    @property(Label)
    public adEnergyAmountLabel: Label = null!;

    @property(Button)
    public adRewardButton: Button = null!;

    // --- 配置数据 ---
    private staminaConfig: StaminaPurchaseConfig[] = []; // 从服务器获取的体力购买配置
    private isLoading: boolean = false; // 加载状态
    
    // --- 缓存机制 ---
    private lastLoadTime: number = 0; // 最后加载时间
    private readonly CACHE_DURATION: number = 30000; // 缓存时间30秒
    private readonly FORCE_REFRESH_DURATION: number = 500; // 强制刷新时间5秒（购买后）
    private isInitialized: boolean = false; // 是否已初始化

    // --- 当前状态 ---
    // 删除本地存储相关变量，改为从服务器获取

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, ()=>{
        }, this);

        // 初始化广告管理器

        this.bindEvents();
        this.initUI();
    }

    onEnable() {
        // 避免重复初始化
        if (!this.isInitialized) {
            this.refreshData();
            this.isInitialized = true;
        } else {
            // 已初始化，只检查是否需要刷新
            this.checkAndRefreshIfNeeded();
        }
    }

   

    /**
     * 检查是否需要刷新数据
     */
    private checkAndRefreshIfNeeded() {
        const now = Date.now();
        const cacheAge = now - this.lastLoadTime;
        
        // 如果缓存过期且没有正在加载，则刷新
        if (cacheAge >= this.CACHE_DURATION && !this.isLoading) {
            console.log('缓存已过期，自动刷新数据');
            this.loadStaminaConfig(false);
        } else if (this.staminaConfig.length > 0) {
            // 使用缓存数据更新UI
            this.updateUI();
        }
    }

    /**
     * 从服务器加载体力购买配置
     */
    private async loadStaminaConfig(forceRefresh: boolean = false) {
        if (this.isLoading) {
            console.log('体力购买配置正在加载中，跳过重复请求');
            return;
        }
        
        // 检查缓存是否有效
        const now = Date.now();
        const cacheAge = now - this.lastLoadTime;
        
        if (!forceRefresh && 
            this.staminaConfig.length > 0 && 
            cacheAge < this.CACHE_DURATION) {
            
            console.log(`使用缓存的体力购买配置，缓存年龄: ${cacheAge}ms`);
            this.updateUI();
            return;
        }
        
        console.log(`开始加载体力购买配置，强制刷新: ${forceRefresh}, 缓存年龄: ${cacheAge}ms`);
        this.isLoading = true;
        
        try {
            const result = await staminaAPI.getPurchaseInfo();
            
            // 判断接口返回状态
            if (result && result.code === 200 && result.data) {
                this.staminaConfig = result.data;
                this.lastLoadTime = now;
                console.log('体力购买配置加载成功，数据条数:', this.staminaConfig.length);
            } else {
                console.error('体力购买配置接口返回异常:', result);
                if (result && result.msg) {
                    ShowToast(result.msg);
                } else {
                    ShowToast('加载配置失败');
                }
                // 如果接口失败但有缓存数据，继续使用缓存
                if (this.staminaConfig.length === 0) {
                    this.staminaConfig = [];
                }
            }
            
            this.updateUI();
        } catch (error) {
            console.error('加载体力购买配置失败:', error);
            ShowToast('加载配置失败');
            // 如果请求失败但有缓存数据，继续使用缓存
            if (this.staminaConfig.length === 0) {
                this.staminaConfig = [];
            }
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 获取钻石购买配置
     */
    private getDiamondConfig(): StaminaPurchaseConfig | null {
        return this.staminaConfig.find(config => config.type === 1) || null;
    }

    /**
     * 获取看广告配置
     */
    private getAdConfig(): StaminaPurchaseConfig | null {
        return this.staminaConfig.find(config => config.type === 2) || null;
    }

    /**
     * 绑定事件
     */
    private bindEvents() {
        if (this.diamondBuyButton) {
            this.diamondBuyButton.node.on(Button.EventType.CLICK, this.onDiamondBuyClicked, this);
        }

        if (this.adRewardButton) {
            this.adRewardButton.node.on(Button.EventType.CLICK, this.onAdRewardClicked, this);
        }
    }

    /**
     * 初始化UI
     */
    private initUI() {
        // 设置体力数量显示（从服务器配置获取）
        const diamondConfig = this.getDiamondConfig();
        const adConfig = this.getAdConfig();
        
        if (this.diamondEnergyAmountLabel && diamondConfig) {
            this.diamondEnergyAmountLabel.string = diamondConfig.stamina.toString();
        }

        if (this.adEnergyAmountLabel && adConfig) {
            this.adEnergyAmountLabel.string = adConfig.stamina.toString();
        }
    }

    /**
     * 刷新数据
     */
    private async refreshData() {
        // 如果正在加载，跳过
        if (this.isLoading) {
            console.log('正在加载中，跳过刷新请求');
            return;
        }
        
        // 检查是否需要强制刷新（购买后短时间内）
        const now = Date.now();
        const forceRefresh = (now - this.lastLoadTime) < this.FORCE_REFRESH_DURATION;
        
        console.log(`refreshData 调用，强制刷新: ${forceRefresh}`);
        await this.loadStaminaConfig(forceRefresh);
    }

    /**
     * 更新UI显示
     */
    private updateUI() {
        const diamondConfig = this.getDiamondConfig();
        const adConfig = this.getAdConfig();

        // 更新钻石购买剩余次数
        if (this.diamondRemainingCountLabel && diamondConfig) {
            this.diamondRemainingCountLabel.string = `今日剩余次数：${diamondConfig.remaining}`;
        }

        // 更新看广告剩余次数
        if (this.adRemainingCountLabel && adConfig) {
            this.adRemainingCountLabel.string = `今日剩余次数：${adConfig.remaining}`;
        }

        // 更新按钮状态
        // this.updateButtonStates();
    }

   

    /**
     * 钻石购买按钮点击事件
     */
    private async onDiamondBuyClicked() {
        const diamondConfig = this.getDiamondConfig();
        if (!diamondConfig) {
            ShowToast('钻石购买配置不存在');
            return;
        }

        // 检查剩余次数
        if (diamondConfig.remaining <= 0) {
            ShowToast('今日钻石购买次数已用完');
            return;
        }

        // 检查钻石数量
        const currentDiamond = UserInfoData.getInstance().getDiamond();
        if (currentDiamond < diamondConfig.cost) {
            ShowToast('钻石不足');
            return;
        }

        try {
            // 调用购买体力API
            const result = await staminaAPI.purchaseStamina(diamondConfig.id);
            
            // 购买成功，强制刷新数据
            await this.loadStaminaConfig(true);
            
            // 静默更新用户信息
            const loginManager = SmartLoginManager.getInstance();
            loginManager.getUserInfo().catch(error => {
                console.error('更新用户信息失败:', error);
            });
            
            ShowToast(`购买成功，获得${diamondConfig.stamina}点体力`);
            
        } catch (error) {
            console.error('钻石购买体力失败:', error);
            ShowToast('购买失败，请重试');
        }
    }

        /**
     * 看广告获取按钮点击事件
     */
    private async onAdRewardClicked() {
        const adConfig = this.getAdConfig();
        if (!adConfig) {
            ShowToast('看广告配置不存在');
            return;
        }

        // 检查剩余次数
        if (adConfig.remaining <= 0) {
            ShowToast('今日看广告次数已用完');
            return;
        }

        // 检查广告是否可用
        const adManager = RewardedVideoAdManager.getInstance();
        if (!adManager.isAdAvailable()) {
            ShowToast('广告暂时不可用，请稍后再试');
            return;
        }

        // 播放激励视频广告
        adManager.playRewardedAd(
            // 成功回调
            async (result) => {
                console.log('看广告成功，发送购买请求');
                
                try {
                    // 看广告成功后，发送购买请求给服务端
                    const purchaseResult = await staminaAPI.purchaseStamina(adConfig.id);
                    
                    // 购买成功，强制刷新数据
                    await this.loadStaminaConfig(true);
                    
                    // 静默更新用户信息
                    const loginManager = SmartLoginManager.getInstance();
                    loginManager.getUserInfo().catch(error => {
                        console.error('更新用户信息失败:', error);
                    });
                    
                    ShowToast(`观看成功，获得${adConfig.stamina}点体力`);
                } catch (error) {
                    console.error('看广告购买失败:', error);
                    ShowToast('购买失败，请重试');
                }
            },
            // 失败回调
            (error) => {
                console.error('看广告失败:', error);
                ShowToast('观看失败，请重试');
            }
        );
    }

    /**
     * 手动刷新数据（供外部调用）
     */
    public async refreshStaminaConfig() {
        await this.loadStaminaConfig(true);
    }

    /**
     * 显示体力商店
     */
    public show() {
        this.node.active = true;
        this.refreshData();
    }

    /**
     * 隐藏体力商店
     */
    public hide() {
        this.node.active = false;
    }

    onDestroy() {
      
    }
} 