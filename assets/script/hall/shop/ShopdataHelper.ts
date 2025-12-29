import { storeAPI } from "../../api/API";
import { gameItemConfigs } from "../../global/config/GameItemConfig";
import { coinShopItems, CostType, ShopCategory, ShopItem ,itemShopItems} from "../../global/config/GameShopConfig"; 
import { diamondShopItems } from "../../global/config/GameShopConfig";
import { ShowToast } from "../../global/Toast";
import { UserArmyData } from "../../user/UserArmyData";
import { UserInfoData } from "../../user/UserInfoData";
import { UserItemData } from "../../user/UserItemData";
import { RewardedVideoAdManager } from "../../wx/RewardedVideoAdManager";
import { DailyTaskHelper } from "../daily_task/DailyTaskHelper";
import { heroBoxAPI, HeroBoxAPIExamples } from "../../api/HeroBoxAPI";
import { HeroBoxInfo, BoxDrawResponse } from "../../api/APITypes";

export interface UserStoreItemVO {
        consumeImage: string;
        consumeKey: string;
        consumeName: string;
        consumeNum: number;
        id: number;
        isAd: number;
        isDouble: number;
        isSoldOut: number;
        itemImage: string;
        itemKey: string;
        itemName: string;
        itemNum: number;
        storeId: number;
    }


export class ShopdataHelper {

    public static diamondRefreshTime: number = 0;
    public static materialRefreshTime: number = 0;
    public static honorRefreshTime: number = 0;

    // 英雄宝箱相关变量
    public static heroBoxInfo: HeroBoxInfo | null = null;
    public static isHeroBoxLoading: boolean = false;
    public static heroBoxLastUpdateTime: number = 0;
    public static readonly HERO_BOX_CACHE_DURATION: number = 10000; // 30秒缓存时间

    // 是否正在购买中，防止重复提交
    private static _isBuying: boolean = false;
    // 是否正在抽奖中，防止重复提交
    private static _isDrawing: boolean = false;


    public static formatTime(_countdown: string | number){
        // const countdown = "04:15:06"; // 时:分:秒

        // 将输入转换为数字
        const countdownNum = typeof _countdown === 'string' ? parseInt(_countdown) : _countdown;


        const countdown= Math.abs(countdownNum/1000);
        // console.log('countdown 时间戳 --》', countdown);

        //格式化 为 时:分:秒
        const hh = Math.floor(countdown / 3600);
        const mm = Math.floor((countdown % 3600) / 60);
        const ss = countdown % 60;
        const countdownStr = `${hh}:${mm}:${ss}`;
        // console.log('countdownStr 时间戳 --》', countdownStr);

        const now = Math.floor(Date.now() / 1000);

        // 目标时间戳（事件结束时间）
        const _eventEndTime = now + countdown;

        // console.log('countdownStr2 时间戳 --》', _eventEndTime);
        return _eventEndTime;
    }


    // 解析材料商店
    public static parseMaterialStore(userStoreItemVO: UserStoreItemVO[]){
        itemShopItems.length = 0;
        for(let i = 0; i < userStoreItemVO.length; i++){
            const item = userStoreItemVO[i];
            // console.log('材料商店物品:', item);
            const {itemName, itemNum, id, isSoldOut, consumeKey, consumeNum,itemKey} = item;
            // 根据itemKey 获取iconFrameName
            const itemConfig = gameItemConfigs.find(config => config.name === itemName);

            if(!itemConfig){
                console.error('材料商店物品不存在:', item.itemName);
                continue;
            }
            // const costConfig= gameItemConfigs.find(config => config.iconFrameName === consumeKey);
            const coinShopItem: ShopItem = {
                id:itemConfig.id,
                server_id:id,
                name: itemName,
                itemAmount: itemNum,
                iconFrameName: itemConfig.iconFrameName,
                costAmount: consumeNum,
                category: ShopCategory.DIAMOND,
                costType: this.getConsumeType(consumeKey),
             }
             // 针对猎人徽章强制使用荣誉点作为支付类型（兼容服务端未支持的新货币）
             if (itemName === '猎人徽章' || itemKey === 'badge_hunter') {
                 coinShopItem.category = ShopCategory.ITEM;
                 coinShopItem.costType = CostType.HONOR;
             }
             itemShopItems.push(coinShopItem);
             
        }

    }



    //解析钻石商店
    public static parseDiamondStore(userStoreItemVO: UserStoreItemVO[]){
        diamondShopItems.length = 0;
        for(let i = 0; i < userStoreItemVO.length; i++){
            const item = userStoreItemVO[i];
            // console.log('钻石商店物品:', item);
            const {itemName, itemNum, id, isSoldOut, isDouble,consumeKey, consumeNum} = item;
            //赠送钻石数量 
            const bonusAmount = isDouble ? itemNum : 0;
            
            const coinShopItem: ShopItem = {
                    id: id,
                    server_id:id,
                    name: itemName,
                    itemAmount: itemNum,
                    iconFrameName: this.getDiamondStoreIconFrameName(i),
                    costAmount: consumeNum,
                    bonusAmount:bonusAmount,
                    category: ShopCategory.DIAMOND,
                    costType: this.getConsumeType(consumeKey),
                 }
                diamondShopItems.push(coinShopItem);


        }
    }

    //解析金币商店
    public static parseCoinStore(userStoreItemVO: UserStoreItemVO[]){
        coinShopItems.length = 0;
        for(let i = 0; i < userStoreItemVO.length; i++){
            const item = userStoreItemVO[i];
            // console.log('金币商店物品:', item);
            const {itemName, itemNum, id, isSoldOut, consumeKey, consumeNum} = item;
             const coinShopItem: ShopItem = {
                id: id,
                server_id:id,
                name: itemName,
                itemAmount: itemNum,
                iconFrameName: this.getCoinStoreIconFrameName(i),
                costAmount: consumeNum,
                category: ShopCategory.COIN,
                costType: this.getConsumeType(consumeKey),
             }
            coinShopItems.push(coinShopItem);
        }
    }


    public static getUserStoreInfo(): Promise<void> {
        return new Promise((resolve, reject) => {
            storeAPI.getUserStoreInfo().then(result => {
                // console.log('获取商店信息结果:', result);
                if (result.code === 200 && result.data) {
                    for (let i = 0; i < result.data.length; i++) {
                        const item = result.data[i];
                        const { storeType, countdown, userStoreItemVO } = item;

                        if (storeType === '材料商店') {
                            this.materialRefreshTime = this.formatTime(countdown);
                            this.parseMaterialStore(userStoreItemVO);
                        } else if (storeType === '钻石商店') {
                            this.diamondRefreshTime = this.formatTime(countdown);
                            this.parseDiamondStore(userStoreItemVO);
                        } else if (storeType === '金币商店') {
                            this.parseCoinStore(userStoreItemVO);
                        } else if (storeType === '荣誉商店') {
                            this.honorRefreshTime = this.formatTime(countdown);
                            this.parseHonorStore(userStoreItemVO);
                        }
                    }
                    resolve();
                } else {
                    const errorMsg = result.msg || `获取商店信息失败, code: ${result.code}`;
                    console.error(errorMsg);
                    reject(new Error(errorMsg));
                }
            }).catch(error => {
                console.error('获取商店信息失败:', error);
                reject(error);
            });
        });
    }

    public static getUserHonorStoreInfo(): Promise<void> {
        return new Promise((resolve, reject) => {
            storeAPI.getUserStoreInfo(2).then(result => {
                if (result.code === 200 && result.data) {
                    for (let i = 0; i < result.data.length; i++) {
                        const item = result.data[i];
                        const { storeType, countdown, userStoreItemVO } = item;
                        if (storeType === '荣誉商店') {
                            this.honorRefreshTime = this.formatTime(countdown);
                            this.parseHonorStore(userStoreItemVO);
                        }
                    }
                    resolve();
                } else {
                    const errorMsg = result.msg || `获取荣誉商店失败, code: ${result.code}`;
                    console.error(errorMsg);
                    reject(new Error(errorMsg));
                }
            }).catch(error => {
                console.error('获取荣誉商店失败:', error);
                reject(error);
            });
        });
    }

 /**
   * 购买指定商品（防重复点击）
   * @param itemId 商品 ID
   * @param onSuccess 成功回调（默认空函数）
   * @param onError 失败回调（默认空函数）
   */
 public static buyItemById(
    itemId: number,
    onSuccess: (data: any) => void = () => {},
    onError: (error: any) => void = () => {}
  ) {
    if (this._isBuying) {
      onError("请勿重复购买，上一笔交易未完成");
      return;
    }

    this._isBuying = true;

    storeAPI.purchaseStoreItem(itemId)
      .then(data => {
        // onSuccess(data);
        if(data.code === 200){
            DailyTaskHelper.completeShopPurchase();
            onSuccess(data);
        }else{
            onError(data.msg);
        }

      })
      .catch(err => {
        onError(err);
        console.log('购买失败', err);
      })
      .finally(() => {
        this._isBuying = false;
      });
  
}


//购买成功后的处理  金币 和 钻石   特殊处理， 其他道具进入背包
/**
 * 购买成功后的处理  金币 和 钻石   特殊处理， 其他道具进入背包
 * @param name 物品名称
 * @param count 购买数量
 */
public static buySuccess(name:string,count:number){
    const data = gameItemConfigs.find(config => config.name === name);
    console.log('购买成功', data);
    if(data){  
        if(data.name === '金币'){
            UserInfoData.getInstance().addGold(count);
        }else if(data.name === '钻石'){
            UserInfoData.getInstance().addDiamond(count);
        }else if(data.name === '体力'){
            UserInfoData.getInstance().addEnergy(count);
        }else{
            //其他道具进入背包
            UserItemData.getInstance().addItem(data.id,count);
        }
        
    }
    
}

public static buyItemByAd(itemId:number,onSuccess: (data: any) => void = () => {},onError: (error: any) => void = () => {}){
    //调用广告SDK
    //广告SDK 调用成功后 再调用 购买请求
    //购买成功后 再调用 购买成功后的处理
    RewardedVideoAdManager.getInstance().playRewardedAd((data) => {
        DailyTaskHelper.completeAdvertisement();
        onSuccess(data);
        //购买成功后 再调用 购买成功后的处理
    },(error) => {
        console.log('广告SDK 调用失败', error);
        onError(error);
    });
     
}


//更具 consumeKey 获取 消耗类型
    public static getConsumeType(consumeKey:string){
        if(consumeKey === 'currency_diamond'){
            return CostType.DIAMOND;
        }else if(consumeKey === 'currency_gold'){
            return CostType.COIN;
        }else if(consumeKey === 'currency_rmb'){
            return CostType.CASH;
        }else if(consumeKey === 'honorPoints' || consumeKey === 'honor' || consumeKey === 'honour' || consumeKey === 'currency_honor' || consumeKey === 'honor_points' || consumeKey === 'arena_honor'){
            return CostType.HONOR;
        }

        return CostType.AD;
}

//获取 金币 商店橱窗 iconFrameName
public static getCoinStoreIconFrameName(index:number){
        const map = {
            '0': 'shop_item_fonts_4',
            '1': 'shop_item_fonts_5',
            '2': 'shop_item_fonts_6',
            '3': 'shop_item_fonts_4',
            '4': 'shop_item_fonts_5',
            '5': 'shop_item_fonts_6', 
            '6': 'shop_item_fonts_4',
            '7': 'shop_item_fonts_5',
            '8': 'shop_item_fonts_6',
        }
        if(map[index]){
            return map[index];
        }

        return 'shop_item_fonts_4';
    }

    public static parseHonorStore(userStoreItemVO: UserStoreItemVO[]) {
        itemShopItems.length = 0;
        for (let i = 0; i < userStoreItemVO.length; i++) {
            const item = userStoreItemVO[i];
            const { itemName, itemNum, id, consumeKey, consumeNum, itemKey } = item;
            const itemConfig = gameItemConfigs.find(config => config.name === itemName || config.materialKey === itemKey);
            let iconFrame = 'shop_item_fonts_10';
            if (itemConfig && itemConfig.iconFrameName) {
                iconFrame = itemConfig.iconFrameName;
            }
            const shopItem: ShopItem = {
                id: itemConfig?.id ?? id,
                server_id: id,
                name: itemName,
                itemAmount: itemNum,
                iconFrameName: iconFrame,
                costAmount: consumeNum,
                category: ShopCategory.ITEM,
                costType: this.getConsumeType(consumeKey),
            };
            itemShopItems.push(shopItem);
        }
    }


    //获取 钻石 商店橱窗 iconFrameName
    public static getDiamondStoreIconFrameName(index:number){
        const map = {
            '0': 'shop_item_fonts_10',
            '1': 'shop_item_fonts_11',
            '2': 'shop_item_fonts_12',
            '3': 'shop_item_fonts_13',
            '4': 'shop_item_fonts_14',
            '5': 'shop_item_fonts_15',
            '6': 'shop_item_fonts_13',
            '7': 'shop_item_fonts_14',
            '8': 'shop_item_fonts_15',
        }
        if(map[index]){
            return map[index];
        }

        return 'shop_item_fonts_10';
    }

    // ==================== 英雄宝箱相关方法 ====================

    /**
     * 获取英雄宝箱信息（带缓存）
     * @param forceRefresh 是否强制刷新
     * @returns Promise<HeroBoxInfo>
     */
    public static async getHeroBoxInfo(forceRefresh: boolean = false): Promise<HeroBoxInfo> {
        const now = Date.now();
        
        // 检查缓存是否有效
        if (!forceRefresh && 
            this.heroBoxInfo && 
            (now - this.heroBoxLastUpdateTime) < this.HERO_BOX_CACHE_DURATION) {
            return this.heroBoxInfo;
        }

        // 如果正在加载，等待加载完成
        if (this.isHeroBoxLoading) {
            return new Promise((resolve, reject) => {
                const checkLoading = () => {
                    if (!this.isHeroBoxLoading) {
                        if (this.heroBoxInfo) {
                            resolve(this.heroBoxInfo);
                        } else {
                            reject(new Error('获取宝箱信息失败'));
                        }
                    } else {
                        setTimeout(checkLoading, 100);
                    }
                };
                checkLoading();
            });
        }

        this.isHeroBoxLoading = true;

        try {
            const response = await heroBoxAPI.getBoxInfo();
            if (response.code === 200 || response.code === 0) {
                this.heroBoxInfo = response.data;
                this.heroBoxLastUpdateTime = now;
                console.log('英雄宝箱信息更新成功:', this.heroBoxInfo);
                return this.heroBoxInfo;
            } else {
                throw new Error(response.msg || '获取宝箱信息失败');
            }
        } catch (error) {
            console.error('获取英雄宝箱信息失败:', error);
            throw error;
        } finally {
            this.isHeroBoxLoading = false;
        }
    }

    /**
     * 传说宝箱抽奖
     * @param drawType 抽奖类型（1=抽1次，2=抽10次）
     * @param onSuccess 成功回调
     * @param onError 失败回调
     */
    public static async legendaryBoxDraw(
        drawType: number,
        onSuccess: (data: BoxDrawResponse) => void = () => {},
        onError: (error: any) => void = () => {}
    ): Promise<void> {
        if (this._isDrawing) {
            onError("请勿重复抽奖，上一次抽奖未完成");
            return;
        }

        this._isDrawing = true;

        try {
            // 先获取宝箱信息
            const boxInfo = await this.getHeroBoxInfo();
            const boxId = this.getBoxId(boxInfo, 'legendary');
            
            // 传说宝箱：id=宝箱ID, type=抽奖类型(1=抽1次,2=抽10次)
            const response = await heroBoxAPI.legendaryDraw(boxId, drawType);
            if (response.code === 200 || response.code === 0) {
                console.log('传说宝箱抽奖成功:', response.data);
                onSuccess(response);
            } else {
                throw new Error(response.msg || '传说宝箱抽奖失败');
            }
        } catch (error) {
            console.error('传说宝箱抽奖失败:', error);
            onError(error);
        } finally {
            this._isDrawing = false;
        }
    }

    /**
     * 稀有宝箱抽奖
     * @param drawType 抽奖方式（1=看广告，2=用钥匙）
     * @param onSuccess 成功回调
     * @param onError 失败回调
     */
    public static async rareBoxDraw(
        drawType: number,
        onSuccess: (data: BoxDrawResponse) => void = () => {},
        onError: (error: any) => void = () => {}
    ): Promise<void> {
        if (this._isDrawing) {
            onError("请勿重复抽奖，上一次抽奖未完成");
            return;
        }

        this._isDrawing = true;

        try {
            // 先获取宝箱信息
            const boxInfo = await this.getHeroBoxInfo();
            const boxId = this.getBoxId(boxInfo, 'rare');
            
            // 稀有宝箱：默认抽1次，id=宝箱ID, type=抽奖方式(1=看广告,2=用钥匙)
            const response = await heroBoxAPI.rareDraw(boxId, drawType);
            if (response.code === 200 || response.code === 0) {
                console.log('稀有宝箱抽奖成功:', response.data);
                onSuccess(response);
            } else {
                throw new Error(response.msg || '稀有宝箱抽奖失败');
            }
        } catch (error) {
            console.error('稀有宝箱抽奖失败:', error);
            onError(error);
        } finally {
            this._isDrawing = false;
        }
    }

    /**
     * 普通宝箱抽奖
     * @param drawType 抽奖方式（1=看广告，2=用钥匙）
     * @param onSuccess 成功回调
     * @param onError 失败回调
     */
    public static async normalBoxDraw(
        drawType: number,
        onSuccess: (data: BoxDrawResponse) => void = () => {},
        onError: (error: any) => void = () => {}
    ): Promise<void> {
        if (this._isDrawing) {
            onError("请勿重复抽奖，上一次抽奖未完成");
            return;
        }

        this._isDrawing = true;

        try {
            // 先获取宝箱信息
            const boxInfo = await this.getHeroBoxInfo();
            const boxId = this.getBoxId(boxInfo, 'normal');
            
            // 普通宝箱：默认抽1次，id=宝箱ID, type=抽奖方式(1=看广告,2=用钥匙)
            const response = await heroBoxAPI.normalDraw(boxId, drawType);
            if (response.code === 200 || response.code === 0) {
                console.log('普通宝箱抽奖成功:', response.data);
                onSuccess(response);
            } else {
                throw new Error(response.msg || '普通宝箱抽奖失败');
            }
        } catch (error) {
            console.error('普通宝箱抽奖失败:', error);
            onError(error);
        } finally {
            this._isDrawing = false;
        }
    }

    /**
     * 获取宝箱英雄列表
     * @param boxType 宝箱类型 ('legendary' | 'rare' | 'normal')
     * @param onSuccess 成功回调
     * @param onError 失败回调
     */
    public static async getBoxHeroList(
        boxType: 'legendary' | 'rare' | 'normal',
        onSuccess: (data: any) => void = () => {},
        onError: (error: any) => void = () => {}
    ): Promise<void> {
        try {
            const boxInfo = await this.getHeroBoxInfo();
            const boxId = heroBoxAPI.getBoxId(boxInfo, boxType);
            
            const response = await heroBoxAPI.getHeroList(boxId);
            if (response.code === 200 || response.code === 0) {
                console.log('宝箱英雄列表获取成功:', response.data);
                onSuccess(response.data);
            } else {
                throw new Error(response.msg || '获取宝箱英雄列表失败');
            }
        } catch (error) {
            console.error('获取宝箱英雄列表失败:', error);
            onError(error);
        }
    }

    /**
     * 检查宝箱是否可以使用广告抽奖
     * @param boxType 宝箱类型 ('normal' | 'rare')
     * @returns boolean
     */
    public static canUseAdDraw(boxType: 'normal' | 'rare'): boolean {
        if (!this.heroBoxInfo) {
            return false;
        }
        return heroBoxAPI.canUseAdDraw(this.heroBoxInfo, boxType);
    }

    /**
     * 获取宝箱钥匙数量
     * @param boxType 宝箱类型 ('normal' | 'rare')
     * @returns number
     */
    public static getBoxKeyCount(boxType: 'normal' | 'rare'): number {
        if (!this.heroBoxInfo) {
            return 0;
        }
        return heroBoxAPI.getBoxKeyCount(this.heroBoxInfo, boxType);
    }

    /**
     * 获取宝箱倒计时（格式化显示）
     * @param boxType 宝箱类型 ('normal' | 'rare')
     * @returns string 格式化的时间字符串 (HH:MM:SS)
     */
    public static getBoxCountdownText(boxType: 'normal' | 'rare'): string {
        if (!this.heroBoxInfo) {
            return '00:00:00';
        }

        let countdown: number;
        if (boxType === 'normal') {
            countdown = this.heroBoxInfo.normalBoxCountdown;
        } else {
            countdown = this.heroBoxInfo.rareBoxCountdown;
        }

        if (countdown <= 0) {
            return '00:00:00';
        }

        const hours = Math.floor(countdown / 3600);
        const minutes = Math.floor((countdown % 3600) / 60);
        const seconds = countdown % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * 获取宝箱钻石消耗
     * @param boxType 宝箱类型 ('legendary')
     * @param drawType 抽奖类型 (1 | 10)
     * @returns number
     */
    public static getBoxDiamondCost(boxType: 'legendary', drawType: 1 | 2): number {
        if (!this.heroBoxInfo) {
            return 0;
        }

        if (boxType === 'legendary') {
            return drawType === 1 ? this.heroBoxInfo.legendaryDiamond1 : this.heroBoxInfo.legendaryDiamond10;
        }

        return 0;
    }

    /**
     * 刷新英雄宝箱信息
     * @returns Promise<void>
     */
    public static async refreshHeroBoxInfo(): Promise<void> {
        try {
            await this.getHeroBoxInfo(true);
        } catch (error) {
            console.error('刷新英雄宝箱信息失败:', error);
            throw error;
        }
    }

    /**
     * 检查宝箱信息是否需要更新
     * @returns boolean
     */
    public static isHeroBoxInfoStale(): boolean {
        const now = Date.now();
        return !this.heroBoxInfo || (now - this.heroBoxLastUpdateTime) >= this.HERO_BOX_CACHE_DURATION;
    }

    /**
     * 获取宝箱保底信息
     * @param boxType 宝箱类型 ('legendary' | 'rare' | 'normal')
     * @returns { current: number, target: number, type: string }
     */
    public static getBoxGuaranteeInfo(boxType: 'legendary' | 'rare' | 'normal'): { current: number, target: number, type: string } {
        if (!this.heroBoxInfo) {
            return { current: 0, target: 0, type: '' };
        }

        switch (boxType) {
            case 'legendary':
                return {
                    current: this.heroBoxInfo.legendaryBoxEliteCount,
                    target: this.heroBoxInfo.legendaryBoxSEliteCount,
                    type: 'S精英'
                };
            case 'rare':
                return {
                    current: this.heroBoxInfo.rareBoxGoodCount,
                    target: 10, // 假设稀有宝箱10次保底
                    type: '精英'
                };
            case 'normal':
                return {
                    current: this.heroBoxInfo.normalBoxGoodCount,
                    target: 10, // 假设普通宝箱10次保底
                    type: '优秀'
                };
            default:
                return { current: 0, target: 0, type: '' };
        }
    }

    /**
     * 获取宝箱ID
     * @param boxInfo 宝箱信息
     * @param boxType 宝箱类型 ('legendary' | 'rare' | 'normal')
     * @returns 宝箱ID
     */
    public static getBoxId(boxInfo: HeroBoxInfo, boxType: 'legendary' | 'rare' | 'normal'): number {
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

