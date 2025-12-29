import { _decorator, Component, Node, Button, Label, instantiate, Prefab } from 'cc';
// 导入商店数据助手，用于处理英雄宝箱相关逻辑
import { ShopdataHelper } from './ShopdataHelper';
// 导入Toast提示工具
import { ShowToast } from '../../global/Toast';
// 导入用户信息数据管理器
import { UserInfoData } from '../../user/UserInfoData';
// 导入用户卡牌数据管理器
import { UserArmyData } from '../../user/UserArmyData';
// 导入智能登录管理器
import { SmartLoginManager } from '../../welcome/SmartLoginManager';
// 导入简单英雄卡片组件
import { SimpleHeroCard } from '../SimpleHeroCard';
// 导入资源配置
import { ResourceConfig } from '../../global/config/ResourceConfig';

const { ccclass, property } = _decorator;

@ccclass('HeroShop')
export class HeroShop extends Component {

    // ==================== 普通宝箱相关UI组件 ====================
    @property(Button)
    public normalChestAdButton: Button = null!;        // 普通宝箱广告抽奖按钮

    @property(Button)
    public normalChestKeyButton: Button = null!;       // 普通宝箱钥匙抽奖按钮

    @property(Label)
    public normalChestPityLabel: Label = null!;        // 普通宝箱保底信息显示标签

    @property(Label)
    public normalChestKeyLabel: Label = null!;         // 普通宝箱钥匙数量显示标签

    @property(Label)
    public normalChestCountdownLabel: Label = null!;   // 普通宝箱倒计时显示标签

    // ==================== 稀有宝箱相关UI组件 ====================
    @property(Button)
    public rareChestAdButton: Button = null!;          // 稀有宝箱广告抽奖按钮

    @property(Button)
    public rareChestKeyButton: Button = null!;         // 稀有宝箱钥匙抽奖按钮

    @property(Label)
    public rareChestPityLabel: Label = null!;          // 稀有宝箱保底信息显示标签

    @property(Label)
    public rareChestKeyLabel: Label = null!;           // 稀有宝箱钥匙数量显示标签

    @property(Label)
    public rareChestCountdownLabel: Label = null!;     // 稀有宝箱倒计时显示标签

    // ==================== 传说宝箱相关UI组件 ====================
    @property(Label)
    public legendaryPityLabel: Label = null!;          // 传说宝箱保底信息显示标签

    @property(Label)
    public elitePityLabel: Label = null!;              // 传说宝箱S精英保底信息显示标签

    @property(Label)
    public drawOnceCostLabel: Label = null!;           // 单抽钻石消耗显示标签

    @property(Label)
    public drawTenCostLabel: Label = null!;            // 十连抽钻石消耗显示标签

    @property(Button)
    public drawOnceButton: Button = null!;             // 传说宝箱单抽按钮

    @property(Button)
    public drawTenButton: Button = null!;              // 传说宝箱十连抽按钮

    // ==================== 抽奖结果展示相关UI组件 ====================
    @property(Node)
    public markNode: Node = null!;                     // 遮罩节点

    @property(Node)
    public showCardNode: Node = null!;                 // 展示卡片节点

    @property(Node)
    public cardlistContent: Node = null!;              // 卡片列表容器

    @property(Prefab)
    public simpleHeroCardPrefab: Prefab = null!;       // 简单英雄卡片预制体

    // 倒计时定时器ID，用于实时更新倒计时显示
    private countdownTimer: any = 0;

    /**
     * 组件加载时调用
     * 绑定按钮事件并初始化英雄宝箱数据
     */
    onLoad() {
        this._bindButtonEvents();
        this._initHeroBoxData();
    }

    /**
     * 组件销毁时调用
     * 清理事件绑定和定时器，防止内存泄漏
     */
    onDestroy() {
        this._unbindButtonEvents();
        this._clearCountdownTimer();
    }

    /**
     * 组件启用时调用
     * 每次显示面板时确保UI数据是最新的
     */
    onEnable() {
        this.refreshUI();
        this._startCountdownTimer();
    }

    /**
     * 组件禁用时调用
     * 停止倒计时定时器，节省资源
     */
    onDisable() {
        this._clearCountdownTimer();
    }

    /**
     * 刷新所有UI标签，使用ShopdataHelper中的最新数据
     * 异步方法，会从服务器获取最新的宝箱信息
     */
    public async refreshUI() {
        try {
            // 获取最新的宝箱信息（带缓存机制）
            const boxInfo = await ShopdataHelper.getHeroBoxInfo();
            
            // 更新普通宝箱UI显示
            this._updateNormalChestUI(boxInfo);
            
            // 更新稀有宝箱UI显示
            this._updateRareChestUI(boxInfo);
            
            // 更新传说宝箱UI显示
            this._updateLegendaryChestUI(boxInfo);
            
        } catch (error) {
            console.error('刷新英雄宝箱UI失败:', error);
            ShowToast('宝箱信息加载失败');
        }
    }

    /**
     * 更新普通宝箱UI显示
     * 包括保底信息、钥匙数量、倒计时和按钮状态
     * @param boxInfo 宝箱信息数据
     */
    private _updateNormalChestUI(boxInfo: any) {
        // 获取普通宝箱的保底信息
        const pityInfo = ShopdataHelper.getBoxGuaranteeInfo('normal');
        // 获取普通宝箱的钥匙数量
        const keyCount = ShopdataHelper.getBoxKeyCount('normal');
        // 检查是否可以使用广告抽奖
        const canUseAd = ShopdataHelper.canUseAdDraw('normal');
        // 获取格式化的倒计时文本
        const countdownText = ShopdataHelper.getBoxCountdownText('normal');

        // 更新保底信息显示：当前次数/目标次数次必出优秀
        this.normalChestPityLabel.string = `${pityInfo.current}/${pityInfo.target}次必出${pityInfo.type}`;
        
        // 更新钥匙数量显示
        this.normalChestKeyLabel.string = `${keyCount}`;
        
        // 更新倒计时显示（如果存在倒计时标签）
        if (this.normalChestCountdownLabel) {
            this.normalChestCountdownLabel.string = countdownText;
        }

        // 不限制按钮交互状态，让用户点击时再提示
        // this.normalChestAdButton.interactable = canUseAd;    // 广告按钮根据倒计时状态启用/禁用
        // this.normalChestKeyButton.interactable = keyCount > 0; // 钥匙按钮根据钥匙数量启用/禁用
    }

    /**
     * 更新稀有宝箱UI显示
     * 包括保底信息、钥匙数量、倒计时和按钮状态
     * @param boxInfo 宝箱信息数据
     */
    private _updateRareChestUI(boxInfo: any) {
        // 获取稀有宝箱的保底信息
        const pityInfo = ShopdataHelper.getBoxGuaranteeInfo('rare');
        // 获取稀有宝箱的钥匙数量
        const keyCount = ShopdataHelper.getBoxKeyCount('rare');
        // 检查是否可以使用广告抽奖
        const canUseAd = ShopdataHelper.canUseAdDraw('rare');
        // 获取格式化的倒计时文本
        const countdownText = ShopdataHelper.getBoxCountdownText('rare');

        // 更新保底信息显示：当前次数/目标次数次必出精英
        this.rareChestPityLabel.string = `${pityInfo.current}/${pityInfo.target}次必出${pityInfo.type}`;
        
        // 更新钥匙数量显示
        this.rareChestKeyLabel.string = `${keyCount}`;
        
        // 更新倒计时显示（如果存在倒计时标签）
        if (this.rareChestCountdownLabel) {
            this.rareChestCountdownLabel.string = countdownText;
        }

        // 不限制按钮交互状态，让用户点击时再提示
        // this.rareChestAdButton.interactable = canUseAd;    // 广告按钮根据倒计时状态启用/禁用
        // this.rareChestKeyButton.interactable = keyCount > 0; // 钥匙按钮根据钥匙数量启用/禁用
    }

    /**
     * 更新传说宝箱UI显示
     * 包括保底信息、钻石消耗和按钮状态
     * @param boxInfo 宝箱信息数据
     */
    private _updateLegendaryChestUI(boxInfo: any) {
        // 获取传说宝箱的保底信息
        const pityInfo = ShopdataHelper.getBoxGuaranteeInfo('legendary');
        // 获取单抽钻石消耗
        const diamondCost1 = ShopdataHelper.getBoxDiamondCost('legendary', 1);
        // 获取十连抽钻石消耗
        const diamondCost10 = ShopdataHelper.getBoxDiamondCost('legendary', 2);
        // 获取用户信息实例
        const userInfo = UserInfoData.getInstance();

        // 更新保底信息显示
        this.legendaryPityLabel.string = `${pityInfo.current}次必出优秀`;  // 传说保底
        this.elitePityLabel.string = `${pityInfo.target}次必出精英`;                  // S精英保底
        
        // 更新钻石消耗显示（如果存在消耗标签）
        if (this.drawOnceCostLabel) {
            this.drawOnceCostLabel.string = `${diamondCost1}`;
        }
        if (this.drawTenCostLabel) {
            this.drawTenCostLabel.string = `${diamondCost10}`;
        }

        // 不限制按钮交互状态，让用户点击时再提示
        // this.drawOnceButton.interactable = userInfo.getDiamond() >= diamondCost1;   // 单抽按钮
        // this.drawTenButton.interactable = userInfo.getDiamond() >= diamondCost10;   // 十连抽按钮
    }

    // ==================== 按钮点击事件处理方法 ====================

    /**
     * 普通宝箱广告抽奖按钮点击事件
     * 检查广告抽奖状态，执行广告抽奖逻辑
     */
    private async onNormalChestAdTapped() {
        console.log("普通宝箱广告抽奖按钮被点击");
        
        // 检查是否可以使用广告抽奖（倒计时是否结束）
        const canUseAd = ShopdataHelper.canUseAdDraw('normal');
        if (!canUseAd) {
            ShowToast('广告抽奖冷却中，请稍后再试');
            return;
        }

        // 执行普通宝箱广告抽奖 (type=1=看广告)
        ShopdataHelper.normalBoxDraw(1, 
            (response) => {
                // 抽奖成功回调
                // 展示抽奖结果
                this.showDrawResult(response.data);
                
                // 异步静默同步服务器数据
                this.syncServerData();
                
                // 抽奖成功后刷新UI显示
                this.refreshUI();
            },
            (error) => {
                // 抽奖失败回调
                console.error('普通宝箱广告抽奖失败:', error);
                ShowToast('抽奖失败');
            }
        );
    }

    /**
     * 普通宝箱钥匙抽奖按钮点击事件
     * 检查钥匙数量，执行钥匙抽奖逻辑
     */
    private async onNormalChestKeyTapped() {
        console.log("普通宝箱钥匙抽奖按钮被点击");
        
        // 检查钥匙数量是否足够
        const keyCount = ShopdataHelper.getBoxKeyCount('normal');
        if (keyCount <= 0) {
            ShowToast('钥匙不足');
            return;
        }

        // 执行普通宝箱钥匙抽奖 (type=2=用钥匙)
        ShopdataHelper.normalBoxDraw(2, 
            (response) => {
                // 抽奖成功回调
                // 展示抽奖结果
                this.showDrawResult(response.data);
                
                // 异步静默同步服务器数据
                this.syncServerData();
                
                // 抽奖成功后刷新UI显示
                this.refreshUI();
            },
            (error) => {
                // 抽奖失败回调
                console.error('普通宝箱钥匙抽奖失败:', error);
                ShowToast('抽奖失败');
            }
        );
    }

    /**
     * 稀有宝箱广告抽奖按钮点击事件
     * 检查广告抽奖状态，执行广告抽奖逻辑
     */
    private async onRareChestAdTapped() {
        console.log("稀有宝箱广告抽奖按钮被点击");
        
        // 检查是否可以使用广告抽奖（倒计时是否结束）
        const canUseAd = ShopdataHelper.canUseAdDraw('rare');
        if (!canUseAd) {
            ShowToast('广告抽奖冷却中，请稍后再试');
            return;
        }

        // 执行稀有宝箱广告抽奖 (type=1=看广告)
        ShopdataHelper.rareBoxDraw(1, 
            (response) => {
                // 抽奖成功回调
                // 展示抽奖结果
                this.showDrawResult(response.data);
                
                // 异步静默同步服务器数据
                this.syncServerData();
                
                // 抽奖成功后刷新UI显示
                this.refreshUI();
            },
            (error) => {
                // 抽奖失败回调
                console.error('稀有宝箱广告抽奖失败:', error);
                ShowToast('抽奖失败');
            }
        );
    }

    /**
     * 稀有宝箱钥匙抽奖按钮点击事件
     * 检查钥匙数量，执行钥匙抽奖逻辑
     */
    private async onRareChestKeyTapped() {
        console.log("稀有宝箱钥匙抽奖按钮被点击");
        
        // 检查钥匙数量是否足够
        const keyCount = ShopdataHelper.getBoxKeyCount('rare');
        if (keyCount <= 0) {
            ShowToast('钥匙不足');
            return;
        }

        // 执行稀有宝箱钥匙抽奖 (type=2=用钥匙)
        ShopdataHelper.rareBoxDraw(2, 
            (response) => {
                // 抽奖成功回调
                // 展示抽奖结果
                this.showDrawResult(response.data);
                
                // 异步静默同步服务器数据
                this.syncServerData();
                
                // 抽奖成功后刷新UI显示
                this.refreshUI();
            },
            (error) => {
                // 抽奖失败回调
                console.error('稀有宝箱钥匙抽奖失败:', error);
                ShowToast('抽奖失败');
            }
        );
    }

    /**
     * 传说宝箱单抽按钮点击事件
     * 检查钻石数量，执行单抽逻辑
     */
    private async onDrawOnceTapped() {
        console.log("传说宝箱单抽按钮被点击");
        
        // 获取用户信息和单抽钻石消耗
        const userInfo = UserInfoData.getInstance();
        const diamondCost = ShopdataHelper.getBoxDiamondCost('legendary', 1);
        
        // 检查钻石是否足够
        if (userInfo.getDiamond() < diamondCost) {
            ShowToast('钻石不足');
            return;
        }

        // 执行传说宝箱单抽
        ShopdataHelper.legendaryBoxDraw(1, 
            (response) => {
                // 抽奖成功回调
                // 展示抽奖结果
                this.showDrawResult(response.data);
                
                // 异步静默同步服务器数据
                this.syncServerData();
                
                // 抽奖成功后刷新UI显示
                this.refreshUI();
            },
            (error) => {
                // 抽奖失败回调
                console.error('传说宝箱单抽失败:', error);
                ShowToast('抽奖失败');
            }
        );
    }

    /**
     * 传说宝箱十连抽按钮点击事件
     * 检查钻石数量，执行十连抽逻辑
     */
    private async onDrawTenTapped() {
        console.log("传说宝箱十连抽按钮被点击");
        
        // 获取用户信息和十连抽钻石消耗
        const userInfo = UserInfoData.getInstance();
        const diamondCost = ShopdataHelper.getBoxDiamondCost('legendary', 2);
        
        // 检查钻石是否足够
        if (userInfo.getDiamond() < diamondCost) {
            ShowToast('钻石不足');
            return;
        }

        // 执行传说宝箱十连抽 (drawType: 2 = 抽10次)
        ShopdataHelper.legendaryBoxDraw(2, 
            (response) => {
                // 抽奖成功回调
                // 展示抽奖结果
                this.showDrawResult(response.data);
                
                // 异步静默同步服务器数据
                this.syncServerData();
                
                // 抽奖成功后刷新UI显示
                this.refreshUI();
            },
            (error) => {
                // 抽奖失败回调
                console.error('传说宝箱十连抽失败:', error);
                ShowToast('抽奖失败');
            }
        );
    }

    // ==================== 私有方法 ====================

    /**
     * 异步静默同步服务器数据
     * 在抽奖成功后调用，不等待同步完成
     */
    private syncServerData(): void {
        console.log('HeroShop: 开始异步静默同步服务器数据');
        
        // 异步静默同步用户卡牌数据
        UserArmyData.getInstance().refreshCardsFromServer().then(() => {
            console.log('HeroShop: 用户卡牌数据异步静默同步完成');
        }).catch((error) => {
            console.error('HeroShop: 用户卡牌数据异步静默同步失败:', error);
        });
        
        // 异步静默同步用户信息数据（包括钻石、金币等）
        SmartLoginManager.getInstance().getUserInfo().then(() => {
            console.log('HeroShop: 用户信息数据异步静默同步完成');
        }).catch((error) => {
            console.error('HeroShop: 用户信息数据异步静默同步失败:', error);
        });
        
        console.log('HeroShop: 异步静默同步任务已启动');
    }

    /**
     * 绑定按钮点击事件
     * 将所有按钮的点击事件绑定到对应的处理方法
     */
    private _bindButtonEvents() {
        this.normalChestAdButton.node.on(Button.EventType.CLICK, this.onNormalChestAdTapped, this);
        this.normalChestKeyButton.node.on(Button.EventType.CLICK, this.onNormalChestKeyTapped, this);
        this.rareChestAdButton.node.on(Button.EventType.CLICK, this.onRareChestAdTapped, this);
        this.rareChestKeyButton.node.on(Button.EventType.CLICK, this.onRareChestKeyTapped, this);
        this.drawOnceButton.node.on(Button.EventType.CLICK, this.onDrawOnceTapped, this);
        this.drawTenButton.node.on(Button.EventType.CLICK, this.onDrawTenTapped, this);
    }

    /**
     * 解绑按钮点击事件
     * 清理所有按钮的事件绑定，防止内存泄漏
     */
    private _unbindButtonEvents() {
   
    }

    /**
     * 初始化英雄宝箱数据
     * 在组件加载时获取最新的宝箱信息
     */
    private async _initHeroBoxData() {
        try {
            // 获取英雄宝箱信息（带缓存机制）
            await ShopdataHelper.getHeroBoxInfo();
            console.log('英雄宝箱数据初始化成功');
        } catch (error) {
            console.error('英雄宝箱数据初始化失败:', error);
        }
    }

    /**
     * 启动倒计时定时器
     * 每秒更新一次倒计时显示，并在数据过期时自动刷新
     */
    private _startCountdownTimer() {
        // 先清除之前的定时器
        this._clearCountdownTimer();
        
        // 创建新的定时器，每秒执行一次
        this.countdownTimer = setInterval(() => {
            // 检查是否有宝箱信息
            if (ShopdataHelper.heroBoxInfo) {
                // 获取最新的倒计时文本
                const normalCountdown = ShopdataHelper.getBoxCountdownText('normal');
                const rareCountdown = ShopdataHelper.getBoxCountdownText('rare');
                
                // 更新普通宝箱倒计时显示
                if (this.normalChestCountdownLabel) {
                    this.normalChestCountdownLabel.string = normalCountdown;
                }
                // 更新稀有宝箱倒计时显示
                if (this.rareChestCountdownLabel) {
                    this.rareChestCountdownLabel.string = rareCountdown;
                }
                
                // 检查宝箱信息是否需要更新（30秒缓存过期）
                if (ShopdataHelper.isHeroBoxInfoStale()) {
                    this.refreshUI();
                }
            }
        }, 1000); // 每秒执行一次
    }

    /**
     * 清除倒计时定时器
     * 防止内存泄漏，在组件禁用或销毁时调用
     */
    private _clearCountdownTimer() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = 0;
        }
    }

    // ==================== 抽奖结果展示相关方法 ====================

    /**
     * 解析英雄key，获取英雄信息
     * @param heroKey 英雄key，格式：[角色类型]_[职业]_[品质]_[资源ID]
     * @returns 英雄信息对象，解析失败返回null
     */
    private parseHeroKey(heroKey: string): { heroId: string, heroName: string, class: number, quality: number } | null {
        try {
            // 解析英雄key: [角色类型]_[职业]_[品质]_[资源ID]
            const keyParts = heroKey.split('_');
            if (keyParts.length < 4) {
                console.warn(`HeroShop: 无效的英雄key格式: ${heroKey}`);
                return null;
            }

            const roleType = keyParts[0];    // 角色类型 (h)
            const classNum = parseInt(keyParts[1]);  // 职业 (0-4)
            const quality = parseInt(keyParts[2]);   // 品质 (0-24)
            const resourceId = keyParts[3];  // 资源ID

            // 验证解析的数据
            if (isNaN(classNum) || isNaN(quality)) {
                console.warn(`HeroShop: 无法解析职业或品质数值 (key: ${heroKey})`);
                return null;
            }

            // 构建基础0品质的资源key
            const baseKey = `${roleType}_${classNum}_0_${resourceId}`;
            
            // 在ResourceConfig中查找对应的英雄信息
            const heroConfig = ResourceConfig.heros_list.find(hero => 
                hero.iconFrameName === baseKey
            );

            if (!heroConfig) {
                console.warn(`HeroShop: 在ResourceConfig中找不到英雄配置: ${baseKey}`);
                return null;
            }

            return {
                heroId: heroConfig.id,
                heroName: heroConfig.name,
                class: classNum,
                quality: quality
            };

        } catch (error) {
            console.error(`HeroShop: 解析英雄key失败 (key: ${heroKey}):`, error);
            return null;
        }
    }

    /**
     * 展示抽奖结果
     * @param heroKeys 英雄key数组，如 ['h_3_6_0','h_4_7_0']
     */
    public showDrawResult(heroKeys: string[]): void {
        console.log('HeroShop: 展示抽奖结果:', heroKeys);
        
        // 显示遮罩和展示卡片节点
        this.markNode.active = true;
        this.showCardNode.active = true;
        
        // 清空卡片列表容器
        this.clearCardList();
        
        // 解析并创建英雄卡片
        const validHeroes = heroKeys
            .map(heroKey => this.parseHeroKey(heroKey))
            .filter(hero => hero !== null);
        
        console.log('HeroShop: 解析到的有效英雄:', validHeroes);
        
        // 为每个英雄创建卡片
        validHeroes.forEach((hero, index) => {
            this.createHeroCard(hero, index);
        });
        
        // 绑定遮罩点击事件
        this.bindMarkClickEvent();
    }

    /**
     * 创建英雄卡片
     * @param hero 英雄信息
     * @param index 索引
     */
    private createHeroCard(hero: { heroId: string, heroName: string, class: number, quality: number }, index: number): void {
        if (!this.simpleHeroCardPrefab || !this.cardlistContent) {
            console.error('HeroShop: 缺少必要的预制体或容器');
            return;
        }

        // 实例化预制体
        const cardNode = instantiate(this.simpleHeroCardPrefab);
        cardNode.setParent(this.cardlistContent);
        
        // 获取SimpleHeroCard组件
        const heroCard = cardNode.getComponent(SimpleHeroCard);
        if (heroCard) {
            // 设置英雄信息
            heroCard.setHeroInfo(
                hero.heroId,
                hero.heroName,
                hero.class,
                hero.quality,
                1, // 默认等级1
                hero.class // 使用职业作为攻击类型
            );

            heroCard.setMaskVisible(false);
        }
        
        // 设置位置（可以根据需要调整布局）
        cardNode.setPosition(0, 0, 0);
    }

    /**
     * 清空卡片列表
     */
    private clearCardList(): void {
        if (this.cardlistContent) {
            this.cardlistContent.removeAllChildren();
        }
    }

    /**
     * 绑定遮罩点击事件
     */
    private bindMarkClickEvent(): void {
        if (this.markNode) {
            this.markNode.on(Node.EventType.TOUCH_END, this.onMarkClicked, this);
        }
    }

    /**
     * 解绑遮罩点击事件
     */
    private unbindMarkClickEvent(): void {
        if (this.markNode) {
            this.markNode.off(Node.EventType.TOUCH_END, this.onMarkClicked, this);
        }
    }

    /**
     * 遮罩点击事件处理
     */
    private onMarkClicked(): void {
        console.log('HeroShop: 遮罩被点击，关闭抽奖结果展示');
        this.hideDrawResult();
    }

    /**
     * 隐藏抽奖结果展示
     */
    public hideDrawResult(): void {
        this.markNode.active = false;
        this.showCardNode.active = false;
        this.unbindMarkClickEvent();
    }
} 