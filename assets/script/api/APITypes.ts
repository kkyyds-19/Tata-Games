import { gameItemConfigs } from '../global/config/GameItemConfig';
import { UserItem } from '../user/UserItemData';
import { MailItem } from '../global/config/MailConfig';

/**
 * 通用API响应结构
 */
export interface APIResponse<T = any> {
    code: number;    // 状态码 0 表示成功
    data: T;         // 数据
    msg: string;     // 描述
}

/**
 * 邮件记录结构
 */
export interface EmailRecord {
    id: number;                    // 邮件ID
    userId: number;                // 用户ID
    emailName: string;             // 邮件名
    reward: string;                // 奖励JSON字符串，如: {"energy":15,"currency_gold":100}
    rewardDescription: string;     // 奖励描述
    isReceive: number;             // 是否领取，0没领取，1领取
    receiveTime: string | null;    // 领取时间
    lostTime: string;              // 过期时间
}

/**
 * 邮件列表响应
 */
export interface EmailListResponse extends APIResponse<EmailRecord[]> {
    code: number;                  // 200表示成功
    data: EmailRecord[];           // 邮件记录数组
    msg: string | null;            // 描述信息
}

/**
 * 成功响应
 */
export interface SuccessResponse extends APIResponse<any> {
    code: number;                  // 0表示成功
    data: any;                     // 响应数据
    msg: string;                   // 描述信息
}

/**
 * 邮件附件结构（如金币、钻石、道具等）
 */
export interface MailAttachment {
    itemId: number;              // 道具/资源 ID
    amount: number;              // 数量
}

/**
 * 背包物品结构
 */
export interface BackpackItem {
    id: number;                  // 主键
    userId: number;              // 玩家主键
    materialKey: string;         // 道具材料key
    materialNum: number;         // 道具材料个数
}

/**
 * 背包列表响应
 */
export interface BackpackListResponse extends APIResponse<BackpackItem[]> {
    code: number;                // 200表示成功
    data: BackpackItem[];        // 背包物品数组
    msg: string | null;          // 描述信息
}

/**
 * 添加背包物品请求
 */
export interface AddBackpackItemRequest {
    id?: number;                 // 主键（可选）
    userId?: number;             // 玩家主键（可选）
    materialKey: string;         // 道具材料key
    materialNum: number;         // 道具材料个数
}

/**
 * 背包奖励信息请求
 */
export interface BackpackRewardInfoRequest {
    key?: string;                // 道具key（可选）
}

/**
 * 背包奖励信息响应
 */
export interface BackpackRewardInfoResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 奖励信息数据
    msg: string | null;
}

/**
 * 使用背包物品请求
 */
export interface UseBackpackItemRequest {
    key?: string;                 // 道具key（可选）
    num?: number;                 // 使用数量（可选）
}

/**
 * 使用背包物品响应
 */
export interface UseBackpackItemResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 使用结果数据
    msg: string | null;
}

/**
 * 英雄宝箱信息
 */
export interface HeroBoxInfo {
    legendaryBoxId?: number;         // 传说宝箱id（可选，默认值1）
    rareBoxId?: number;              // 稀有宝箱id（可选，默认值3）
    normalBoxId?: number;            // 普通宝箱id（可选，默认值2）
    legendaryBoxEliteCount: number;  // 传说宝箱 N次内必出精英
    legendaryBoxSEliteCount: number; // 传说宝箱 N次内必出S精英
    legendaryDiamond1: number;       // 传说宝箱 抽1次所需钻石数量
    legendaryDiamond10: number;      // 传说宝箱 抽10次所需钻石数量
    normalBoxGoodCount: number;      // 普通宝箱 N次内必出优秀
    normalBoxKeyCount: number;       // 普通宝箱 钥匙数量
    normalBoxCountdown: number;      // 普通宝箱 倒计时（单位 秒），若<=0,则只能用钥匙,否则显示广告
    rareBoxGoodCount: number;        // 稀有宝箱 N次内必出精英
    rareBoxKeyCount: number;         // 稀有宝箱 钥匙数量
    rareBoxCountdown: number;        // 稀有宝箱 倒计时（单位 秒），若<=0,则只能用钥匙,否则显示广告
}

/**
 * 英雄宝箱响应
 */
export interface HeroBoxResponse extends APIResponse<HeroBoxInfo> {
    code: number;
    data: HeroBoxInfo;
    msg: string | null;
}

/**
 * 宝箱抽奖请求
 */
export interface BoxDrawRequest {
    id: number;                  // 宝箱ID
    type: number;                // 抽奖类型（1表示抽1次，10表示抽10次）
}

/**
 * 宝箱抽奖响应
 */
export interface BoxDrawResponse extends APIResponse<string[]> {
    code: number;
    data: string[];              // 英雄key数组
    msg: string | null;
}

/**
 * 宝箱英雄列表响应
 */
export interface BoxHeroListResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 宝箱英雄列表数据
    msg: string | null;
}

/**
 * 伙伴信息
 */
export interface PartnerInfo {
    id: number;                  // 主键
    userId: number;              // 玩家ID
    partnerId: number;           // 伙伴ID
    partnerLevel: number;        // 伙伴等级
    starId: number;              // 伙伴星级
    isBattle: number;            // 是否上阵
    isCooperate: number;         // 是否协同
    cooperate: string | null;    // 协同伙伴
    passiveSkill: string | null; // 参战技能
}

/**
 * 伙伴列表响应
 */
export interface PartnerListResponse extends APIResponse<PartnerInfo[]> {
    code: number;
    data: PartnerInfo[];
    msg: string | null;
}

/**
 * 伙伴请求
 */
export interface PartnerRequest {
    id?: number;                 // 主键
    userId?: number;             // 玩家ID
    partnerId: number;           // 伙伴ID
    partnerLevel: number;        // 伙伴等级
    starId: number;              // 伙伴星级
    isBattle: number;            // 是否上阵
    isCooperate: number;         // 是否协同
    cooperate?: string;          // 协同伙伴
    passiveSkill?: string;       // 参战技能
}

/**
 * 怪物图鉴信息
 */
export interface MonsterInfo {
    key: string;                 // 怪物key
    isUnlock: number;            // 图鉴是否解锁，0没解锁，1解锁
    isReceive: number | null;    // 图鉴是否领取，0没领取，1领取
    receiveTime: string | null;  // 领取时间
}

/**
 * 怪物图鉴列表响应
 */
export interface MonsterListResponse extends APIResponse<{
    count: number;               // 总数
    size: number;                // 每页大小
    totalPage: number;           // 总页数
    page: number;                // 当前页
    data: MonsterInfo[];         // 怪物图鉴数据
}> {
    code: number;
    data: {
        count: number;
        size: number;
        totalPage: number;
        page: number;
        data: MonsterInfo[];
    };
    msg: string | null;
}

/**
 * 怪物图鉴请求
 */
export interface MonsterRequest {
    key: string;                 // 怪物key
}

/**
 * 商店商品信息
 */
export interface StoreItemInfo {
    id: number;                  // 商店商品主键
    storeId: number;             // 商店类型主键
    itemName: string;            // 出售商品名称
    itemKey: string;             // 出售商品key值
    itemImage: string;           // 出售商品图片
    itemNum: number;             // 出售商品数量
    consumeName: string;         // 购买材料名称
    consumeKey: string;          // 购买材料key值
    consumeImage: string;        // 购买材料key图片
    consumeNum: number;          // 购买材料key数量
    isDouble: number;            // 是否是双倍返利，0不是，1是
    isAd: number;                // 是否看广告，0不是，1是
    isSoldOut: number;           // 是否售尽，0不是，1是
}

/**
 * 商店信息
 */
export interface StoreInfo {
    storeType: string;           // 商店类型
    countdown: number;           // 商店刷新倒计时
    userStoreItemVO: StoreItemInfo[]; // 商店商品列表
}

/**
 * 商店响应
 */
export interface StoreResponse extends APIResponse<StoreInfo[]> {
    code: number;
    data: StoreInfo[];
    msg: string | null;
}

/**
 * 用户登录响应
 */
export interface UserLoginResponse extends APIResponse<{
    nickName: string;            // 昵称
    uuid: number;                // 玩家ID
    status: number;              // 玩家状态，0禁止，1正常
    token: string;               // 玩家token
}> {
    code: number;
    data: {
        nickName: string;
        uuid: number;
        status: number;
        token: string;
    };
    msg: string | null;
}

/**
 * 用户登录请求
 */
export interface UserLoginRequest {
    phone: string;               // 手机号
    password: string;            // 密码
}

/**
 * 用户注册请求
 */
export interface UserRegisterRequest {
    phone: string;               // 手机号
    code: string;                // 验证码
    password: string;            // 密码
    vxCode: string;              // 微信验证码
}

/**
 * 解析奖励字符串为用户物品数组
 * @param rewardString 奖励JSON字符串
 * @returns UserItem[]
 */
export function parseRewardToUserItems(rewardString: string): UserItem[] {
    try {
        const rewardObj = JSON.parse(rewardString);
        const userItems: UserItem[] = [];
        
        for (const [key, amount] of Object.entries(rewardObj)) {
            const itemConfig = gameItemConfigs.find(config => config.materialKey === key);
            if (itemConfig) {
                userItems.push({
                    itemId: itemConfig.id,
                    amount: amount as number
                });
            }
        }
        
        return userItems;
    } catch (error) {
        console.error('解析奖励字符串失败:', error);
        return [];
    }
}



/**
 * 检查响应是否成功
 * @param response API响应
 * @returns 是否成功
 */
export function isResponseSuccess(response: APIResponse): boolean {
    return response.code === 0 || response.code === 200;
}

/**
 * 获取响应错误信息
 * @param response API响应
 * @returns 错误信息
 */
export function getResponseError(response: APIResponse): string {
    return response.msg || '未知错误';
}

/**
 * 转换邮件记录为邮件项
 * @param emailRecord 邮件记录
 * @returns 邮件项
 */
export function convertEmailRecordToMailItem(emailRecord: EmailRecord): MailItem {
    // 解析奖励
    const userItems = parseRewardToUserItems(emailRecord.reward);
    const attachments: MailAttachment[] = userItems.map(item => ({
        itemId: item.itemId,
        amount: item.amount
    }));

    // 根据邮件名称判断类型
    let mailType: 'important' | 'system' | 'normal' = 'system';
    // const emailName = emailRecord.emailName.toLowerCase();
    
    // if (emailName.includes('系统') || emailName.includes('公告') || emailName.includes('维护')) {
    //     mailType = 'system';
    // } else if (emailName.includes('重要') || emailName.includes('奖励') || emailName.includes('福利')) {
    //     mailType = 'important';
    // }

    // 转换时间格式
    const sendTime = emailRecord.receiveTime ? new Date(emailRecord.receiveTime).getTime() : Date.now();
    const expireTime = emailRecord.lostTime ? new Date(emailRecord.lostTime).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000; // 默认7天过期

    return {
        id: emailRecord.id,
        type: mailType,
        title: emailRecord.emailName,
        content: emailRecord.rewardDescription,
        sender: '系统', // 默认发件人
        sendTime: sendTime,
        expireTime: expireTime,
        isRead: emailRecord.isReceive === 1,
        hasAttachment: attachments.length > 0,
        isCollected: emailRecord.isReceive === 1,
        attachments: attachments
    };
}

/**
 * 转换邮件记录数组为邮件项数组
 * @param emailRecords 邮件记录数组
 * @returns 邮件项数组
 */
export function convertEmailRecordsToMailItems(emailRecords: EmailRecord[]): MailItem[] {
    return emailRecords.map(convertEmailRecordToMailItem);
}

/**
 * 测试奖励解析功能
 */
export function testRewardParsing() {
    const testReward = '{"energy":15,"currency_gold":100,"badge_assassin":1}';
    const result = parseRewardToUserItems(testReward);
    console.log('测试奖励解析结果:', result);
    
    // 测试邮件转换
    const testEmailRecord: EmailRecord = {
        id: 1,
        userId: 123,
        emailName: '系统奖励邮件',
        reward: '{"energy":15,"currency_gold":100}',
        rewardDescription: '恭喜您获得系统奖励！',
        isReceive: 0,
        receiveTime: null,
        lostTime: '2024-12-31 23:59:59'
    };
    
    const mailItem = convertEmailRecordToMailItem(testEmailRecord);
    console.log('测试邮件转换结果:', mailItem);
}



/**
 * 系统通关奖励信息
 */
export interface SysStarReward {
    id: number;                  // 奖励ID
    starNumber: number;          // 星数量
    reward: string;              // 奖品JSON字符串
}

/**
 * 用户未满星关卡信息
 */
export interface UserLevelInfo {
    id: number;                  // 记录ID
    userId: number;              // 用户ID
    level: number;               // 关卡等级
    starRate: number;            // 星级
    clearanceTime: string;       // 通关时间
}

/**
 * 通关奖励列表响应
 */
export interface ClearRewardListResponse extends APIResponse<{
    starSum: number;             // 用户获得的星数量
    sysStarRewardlist: SysStarReward[]; // 系统通关奖励list
    userLevelList: UserLevelInfo[]; // 用户未满星关卡list
}> {
    code: number;
    data: {
        starSum: number;
        sysStarRewardlist: SysStarReward[];
        userLevelList: UserLevelInfo[];
    };
    msg: string | null;
}

/**
 * 领取奖励请求
 */
export interface ClaimRewardRequest {
    finishId: number;            // 通关星数表id
}

/**
 * 领取奖励响应
 */
export interface ClaimRewardResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 领取结果数据
    msg: string | null;
}

/**
 * 未满星关卡信息
 */
export interface NotFullStarLevel {
    levelId: number;             // 未满星关卡id
    starRate: number;            // 当前活动星星数量（3颗星满星）
    clearanceTime: string;       // 上次星星修改时间
}

/**
 * 未满星关卡列表响应
 */
export interface NotFullStarLevelsResponse extends APIResponse<NotFullStarLevel[]> {
    code: number;
    data: NotFullStarLevel[];    // 未满星关卡列表
    msg: string | null;
}

/**
 * 通关奖励列表请求
 */
export interface ClearRewardListRequest {
    // 无需参数
}

/**
 * 未满星关卡列表请求
 */
export interface NotFullStarLevelsRequest {
    page: number;                // 页码
    size: number;                // 每页数量
}

/**
 * 挂机收益页面数据
 */
export interface IdleRewardViewData {
    currentLevel: number;        // 当前扫荡关卡
    gold: string;               // 每小时可得到的金币
    reward: {                   // 奖励信息
        key_common: number;     // 普通钥匙key及对应数量
        badge_random: number;   // 随机徽章及其数量
        skin_essence: number;   // 皮肤精华及其数量
        [key: string]: number;  // 其他可能的奖励类型
    };
    timeGap: number;            // 当前时间与上一次领取时间的差值
    experience: string;         // 每小时可得到的经验
}

/**
 * 挂机收益响应
 */
export interface IdleRewardResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 挂机收益数据
    msg: string | null;
}

/**
 * 扫荡奖励响应
 */
export interface SweepRewardResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 扫荡奖励数据
    msg: string | null;
}

/**
 * 挂机收益页面数据响应
 */
export interface IdleRewardViewResponse extends APIResponse<IdleRewardViewData> {
    code: number;
    data: IdleRewardViewData;    // 页面展示数据
    msg: string | null;
}

/**
 * 我的英雄信息
 */
export interface MyHeroInfo {
    id: number;                  // 主键
    userId: number;              // 玩家ID
    key: string;                 // 英雄key
    isBattle: number;            // 是否上阵，0不上阵，1上阵
    careerLevel: number | null;  // 职业等级
    heroId: number;              // 英雄id
    qualityId: number;           // 英雄品质id
}

/**
 * 我的英雄列表响应
 */
export interface MyHeroListResponse extends APIResponse<MyHeroInfo[]> {
    code: number;
    data: MyHeroInfo[];          // 英雄列表
    msg: string | null;
}

/**
 * 英雄突破请求
 */
export interface HeroBreakRequest {
    id1: number;
    id2?: number;
    id3?: number;
}

/**
 * 英雄上阵请求
 */
export interface HeroBattleRequest {
    id: number;                 // 我的英雄id
}

/**
 * 英雄升级请求
 */
export interface HeroUpgradeRequest {
    id: number;                  // 我的英雄id
}

/**
 * 英雄一键升级请求
 */
export interface HeroOneUpgradeRequest {
    id: number;                  // 我的英雄id
}

/**
 * 英雄突破响应
 */
export interface HeroBreakResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 突破结果数据
    msg: string | null;
}

/**
 * 英雄自动突破响应
 */
export interface HeroBreakAutoResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 自动突破结果数据
    msg: string | null;
}

export interface HeroAbyssRequest {
    id: number;
}

export interface HeroAbyssResponse extends APIResponse<{ 
    id: number;
    userId: number;
    key: string;
    isBattle: number;
    careerLevel: number | null;
    heroId: number;
    qualityId: number;
    getTime: string | null;
    isSkip: number;
}> {
    code: number;
    data: { 
        id: number;
        userId: number;
        key: string;
        isBattle: number;
        careerLevel: number | null;
        heroId: number;
        qualityId: number;
        getTime: string | null;
        isSkip: number;
    };
    msg: string | null;
}

/**
 * 英雄重生请求
 */
export interface HeroRebornRequest {
    key: string;                 // 英雄对应的key
}

/**
 * 英雄重生响应
 */
export interface HeroRebornResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 重生结果数据
    msg: string | null;
}

/**
 * 英雄详细信息
 */
export interface HeroDetailInfo {
    heroName: string;            // 英雄名称
    inherentSkill: string;       // 英雄技能描述
    attackInterval: number;      // 攻击间隔
    sectName: string;            // 流派
    description: string;         // 流派描述
    attributeName: string;       // 属性
    attributeDescription: string; // 属性描述
    heroBonds: string;           // 羁绊
    careerName: string;          // 职业名称
    materialName: string;        // 对应职业材料
    qualityName: string;         // 品质
    levelCap: string;            // 英雄品质等级上限
    skillName: string | null;    // 技能名
    skillDescription: string | null; // 技能描述
    fightPower: string;          // 战斗力
    attackPower: string;         // 攻击力
    healthValue: string;         // 生命值
    material?: string;           // 升级徽章key（上阵英雄才有）
    number?: number;             // 升级徽章数量（上阵英雄才有）
    money?: number;              // 升级金币数量（上阵英雄才有）
}

/**
 * 英雄详细信息响应
 */
export interface HeroDetailResponse extends APIResponse<HeroDetailInfo> {
    code: number;
    data: HeroDetailInfo;        // 英雄详细信息
    msg: string | null;
}

/**
 * 邮箱列表响应
 */
export interface EmailListResponse extends APIResponse<EmailRecord[]> {
    code: number;                // 200表示成功
    data: EmailRecord[];         // 邮件记录数组
    msg: string | null;          // 描述信息
}

/**
 * 领取邮件奖励请求
 */
export interface ReceiveEmailRewardRequest {
    id: number;                  // 邮件ID
}

/**
 * 领取邮件奖励响应
 */
export interface ReceiveEmailRewardResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 领取结果数据
    msg: string | null;
}

/**
 * 删除邮件请求
 */
export interface DeleteEmailRequest {
    id: number;                  // 邮件ID
}

/**
 * 删除邮件响应
 */
export interface DeleteEmailResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 删除结果数据
    msg: string | null;
}

/**
 * 一键领取奖励响应
 */
export interface ReceiveAllRewardsResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 领取结果数据
    msg: string | null;
}

/**
 * 一键删除邮件响应
 */
export interface DeleteAllEmailsResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 删除结果数据
    msg: string | null;
}

/**
 * 伙伴任务信息
 */
export interface PartnerTaskInfo {
    id: number;                  // 伙伴主键
    userId: number;              // 玩家主键
    taskId: number;              // 任务主键
    finishNum: number;           // 玩家完成任务数量
    isReceive: number;           // 是否领取，0没领取，1领取
    receiveTime: string | null;  // 领取时间
}

/**
 * 伙伴任务列表响应
 */
export interface PartnerTaskListResponse extends APIResponse<PartnerTaskInfo[]> {
    code: number;
    data: PartnerTaskInfo[];     // 伙伴任务列表
    msg: string | null;
}

/**
 * 伙伴任务请求
 */
export interface PartnerTaskRequest {
    id?: number;                 // 主键（可选）
    userId?: number;             // 玩家ID（可选）
    taskId: number;              // 任务ID
    finishNum: number;           // 完成数量
    isReceive: number;           // 是否领取(0/1)
    receiveTime?: string;        // 领取时间（可选）
}

/**
 * 伙伴任务响应
 */
export interface PartnerTaskResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 任务操作结果数据
    msg: string | null;
}

/**
 * 排名信息
 */
export interface RankingInfo {
    userId: number | null;       // 用户id
    userName?: string;           // 用户昵称（可选）
    nickName?: string;           // 用户昵称（可选，兼容服务器返回的字段名）
    avatar?: string;             // 用户头像（可选）
    chartNumber: number;         // 章节数/主线章节数
    fightPower: number;          // 战斗力
    firstFinishTime: string;     // 第一次通关时间
}

/**
 * 排名列表数据
 */
export interface RankingListData {
    total: number;               // 总数
    data: RankingInfo[];         // 排名数据
    totalPage: number;           // 总页数
    pageSize: number;            // 每页大小
    pageNum: number;             // 当前页码
}

/**
 * 排名列表响应
 */
export interface RankingListResponse extends APIResponse<RankingListData> {
    code: number;
    data: RankingListData;       // 排名列表数据
    msg: string | null;
}

/**
 * 排名请求参数
 */
export interface RankingRequest {
    pageNum?: number;            // 页码（可选）
    pageSize?: number;           // 每页数量（可选）
}

/**
 * 荣誉竞技场排行信息
 */
export interface ArenaHonorRankingInfo {
    userId: number | null;       // 用户id
    userName?: string;           // 用户昵称（可选）
    nickName?: string;           // 用户昵称（兼容字段，可选）
    avatar?: string;             // 用户头像（可选）
    honorPoints: number;         // 当前荣誉点
    firstFinishTime?: string;    // 首次达到当前荣誉点的时间（可选）
}

/**
 * 荣誉竞技场排行列表数据
 */
export interface ArenaHonorRankingListData {
    total: number;
    data: ArenaHonorRankingInfo[];
    totalPage: number;
    pageSize: number;
    pageNum: number;
}

/**
 * 荣誉竞技场排行列表响应
 */
export interface ArenaHonorRankingListResponse extends APIResponse<ArenaHonorRankingListData> {
    code: number;
    data: ArenaHonorRankingListData;
    msg: string | null;
}

export interface GulchChartsInfo {
    userId: number | null;
    userName?: string;
    nickName?: string | null;
    avatar?: string;
    fightPower: number;
    canyonCrystal?: number;
    production?: number;
    integral?: number;
}

export interface GulchChartsListData {
    count: number;
    size: number;
    totalPage: number;
    page: number;
    data: GulchChartsInfo[];
}

export interface GulchChartsListResponse extends APIResponse<GulchChartsListData> {
    code: number;
    data: GulchChartsListData;
    msg: string | null;
}

/**
 * 提交荣誉竞技场当前荣誉点请求
 */
export interface SubmitArenaHonorRequest {
    honorPoints: number;         // 当前荣誉点
}

/**
 * 提交荣誉竞技场当前荣誉点响应
 */
export interface SubmitArenaHonorResponse extends APIResponse<any> {
    code: number;
    data: any;
    msg: string | null;
}

 

/**
 * 荣誉积分变更请求（挑战玩家胜利直接获得荣誉积分）
 */
export interface HonorGrantRequest {
    challengeUserId: number;   // 被挑战的对手用户ID
    challengeResult: number;   // 挑战结果（0胜利，1失败）
    change: number;            // 荣誉积分变化值（胜利+3，失败-1）
}

/**
 * 荣誉积分变更响应
 * 服务端示例返回: { code: 200, data: 1, msg: null }
 */
export interface HonorGrantResponse extends APIResponse<number> {
    code: number;
    data: number;             // 1表示成功（示例），具体以服务端为准
    msg: string | null;
}

export interface GulchChallengeRequest {
    challengeUserId: number;
    challengeResult: number; // 0失败，1胜利
}

export interface GulchChallengeResponse extends APIResponse<any> {
    code: number;
    data: any;
    msg: string | null;
}

export interface GulchInfo {
    id: number;
    userId: number;
    nickName: string | null;
    number: number;
    production: number;
    countdown: number;
}

export interface GulchInfoResponse extends APIResponse<GulchInfo> {
    code: number;
    data: GulchInfo;
    msg: string | null;
}

/**
 * 峡谷领取水晶响应
 * 服务端示例返回: { code: 200, data: 1, msg: null }
 */
export interface GulchReceiveResponse extends APIResponse<number> {
    code: number;
    data: number;
    msg: string | null;
}

/**
 * 圣物信息
 */
export interface RelicInfo {
    id: number;                  // 主键
    userId: number;              // 玩家ID
    isEquip: number;             // 是否装备，0不装备，1装备
    isLock: number;              // 是否锁定，0不锁定，1锁定
    getTime: string | null;      // 获得时间
    packages: string;            // 圣物套装主键列表，以逗号分隔
    bonusId: number;             // 圣物主属性加成主键
    entry: string | null;        // 圣物属性条目
    advTime: string | null;      // 看广告获取圣物时间，每天免费2次
    nameAs: string | null;       // 圣物名称
}

/**
 * 圣物列表响应
 */
export interface RelicListResponse extends APIResponse<RelicInfo[]> {
    code: number;
    data: RelicInfo[];           // 圣物列表
    msg: string | null;
}

/**
 * 圣物召唤请求
 */
export interface RelicCallRequest {
    adv: boolean;                // 是否广告，true是广告，false是用钻石召唤
    type: number;                // 1召唤1次，2召唤10次
    location: number;            // 默认不指定 0，指定的部位 1,2...6号位置
}

/**
 * 圣物操作响应
 */
export interface RelicResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 操作结果数据
    msg: string | null;
}

/**
 * 圣物套装信息
 */
export interface RelicSetInfo {
    id: number;                  // 圣物套装ID
    // 其他套装信息字段根据实际响应补充
}

/**
 * 圣物套装列表响应
 */
export interface RelicSetListResponse extends APIResponse<RelicSetInfo[]> {
    code: number;
    data: RelicSetInfo[];        // 圣物套装列表
    msg: string | null;
}

/**
 * 圣物套装标记请求
 */
export interface RelicSetMarkRequest {
    id: number;                  // 圣物套装id
}

/**
 * 圣物套装操作响应
 */
export interface RelicSetResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 操作结果数据
    msg: string | null;
}

/**
 * 圣物副词条信息
 */
export interface RelicSubAttrInfo {
    id: number;                  // 圣物副词条ID
    // 其他副词条信息字段根据实际响应补充
}

/**
 * 圣物副词条列表响应
 */
export interface RelicSubAttrListResponse extends APIResponse<RelicSubAttrInfo[]> {
    code: number;
    data: RelicSubAttrInfo[];    // 圣物副词条列表
    msg: string | null;
}

/**
 * 圣物副词条标记请求
 */
export interface RelicSubAttrMarkRequest {
    id: number;                  // 圣物副词条id
}

/**
 * 圣物副词条操作响应
 */
export interface RelicSubAttrResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 操作结果数据
    msg: string | null;
}

/**
 * 关卡奖励数据（解析后的格式）
 */
export interface StageRewardData {
    gold?: number;               // 金币数量
    diamond?: number;            // 钻石数量
    key_common?: number;         // 普通钥匙数量
    key_rare?: number;           // 稀有钥匙数量
    exp?: number;                // 经验值
    currency_gold?: number;      // 货币金币
    currency_diamond?: number;   // 货币钻石
    [key: string]: number | undefined; // 其他可能的奖励类型
}

/**
 * 关卡奖励领取请求
 */
export interface StageRewardReceiveRequest {
    level: number;               // 关卡级别
    json: string;                // 怪物json
    type: number;                // 通过类型1通关，2半血，3满血
    flag: number;                // 是否是精英关卡，0不是，1是
    rank: number;                // 关卡玩家等级
}

/**
 * 广告关卡奖励领取请求
 */
export interface AdStageRewardRequest {
    level: number;               // 关卡级别
    flag: number;                // 是否是精英关卡
}

/**
 * 关卡奖励操作响应
 */
export interface StageRewardResponse extends APIResponse<string> {
    code: number;
    data: string;                // 奖励JSON字符串，如: {"gold":1079,"diamond":4,"key_common":1}
    msg: string | null;
}



/**
 * 体力购买配置信息
 */
export interface StaminaPurchaseInfo {
    cost: number;                // 钻石数量，0表示无需钻石
    stamina: number;             // 体力值
    id: number;                  // 配置ID
    type: number;                // 类型：1钻石购买，2免费广告
    remaining: number;           // 今日剩余次数
}

/**
 * 体力购买信息响应
 */
export interface StaminaPurchaseInfoResponse extends APIResponse<StaminaPurchaseInfo[]> {
    code: number;
    data: StaminaPurchaseInfo[]; // 体力购买配置列表
    msg: string | null;
}

/**
 * 体力购买请求
 */
export interface StaminaPurchaseRequest {
    configId: number;    // 购买配置ID
}

/**
 * 体力购买结果
 */
export interface StaminaPurchaseResult {
    diamonds: number;            // 该用户现在的钻石数量
    success: boolean;            // 购买是否成功
    stamina: number;             // 该用户现在的体力值
}

/**
 * 体力购买响应
 */
export interface StaminaPurchaseResponse extends APIResponse<StaminaPurchaseResult> {
    code: number;
    data: StaminaPurchaseResult; // 购买结果数据
    msg: string | null;
}

// ==================== 每日任务相关类型 ====================

/**
 * 任务类型枚举
 */
export enum TaskType {
    RECHARGE = "recharge",                       // 每日充值
    HUNTER = "hunter",                           // 击杀怪物
    ADVERTISEMENT = "advertisement",             // 观看广告
    UP = "up",                                   // 升级操作
    SHARE = "share",                             // 分享游戏
    SHOP = "shop",                               // 购买商店商品
    ACCOUNT = "account",                         // 完成所有任务
    ADVERTISEMENT_ACCOUNT = "advertisement_account" // 广告累计次数
}

/**
 * 单个任务信息
 */
export interface TaskInfo {
    id: number;                  // 任务ID
    taskDescription: string;     // 任务描述
    taskAccount: number;         // 用户完成任务需要的次数
    userFinishAccount: number;   // 用户已经完成的次数
    isReceive: number;           // 是否领取，0为未领取，1为领取
    reward: string;              // 奖励key与其对应的数量
    lastCompleteTime?: string;   // 玩家上一次完成任务的时间（可选）
    taskType: string;            // 任务类型标识符（如 "hunter", "shop", "advertisement_account" 等）
}

/**
 * 每日任务响应数据
 */
export interface DailyTaskData {
    currentTime: string;         // 当前时间
    tasks: TaskInfo[];           // 任务列表
}

/**
 * 每日任务响应
 */
export interface DailyTaskResponse extends APIResponse<DailyTaskData> {
    code: number;
    data: DailyTaskData;         // 每日任务数据
    msg: string | null;
}

/**
 * 执行任务请求
 */
export interface ExecuteTaskRequest {
    type: string;                // 任务类型
    number: number;              // 任务数量
}

/**
 * 执行任务响应
 */
export interface ExecuteTaskResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 执行结果数据
    msg: string | null;
}

/**
 * 领取任务奖励请求
 */
export interface ClaimTaskRewardRequest {
    taskId: number;              // 任务ID
}

/**
 * 领取任务奖励响应
 */
export interface ClaimTaskRewardResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 领取结果数据
    msg: string | null;
}

// ==================== 哨塔相关类型 ====================

/**
 * 哨塔信息
 */
export interface TowerInfo {
    id: number;
    userId: number;
    relationId?: number;
    watchtowerKey?: string;
    watchtowerId?: number;
    level: number | null;
    skillLevel: number | null;
    star: number | null;
    qualityId: number;
    fragment?: number | null;
    isBattle?: number;           // 是否上阵：0未上阵，1上阵
}

/**
 * 哨塔列表响应
 */
export interface TowerListResponse extends APIResponse<TowerInfo[]> {
    code: number;
    data: TowerInfo[];           // 哨塔列表
    msg: string | null;
}

/**
 * 哨塔详细信息响应
 */
export interface TowerDetailResponse extends APIResponse<TowerInfo> {
    code: number;
    data: TowerInfo;             // 哨塔详细信息
    msg: string | null;
}

/**
 * 新增哨塔请求
 */
export interface AddTowerRequest {
    id?: number;                 // 主键（可选）
    userId?: number;             // 玩家ID（可选）
    relationId: number;          // 关联ID
    level: number;               // 等级
    skillLevel?: number;         // 技能等级（可选）
    star?: number;               // 星级（可选）
    qualityId?: number;          // 品质ID（可选）
}

// ==================== 竞技场相关类型 ====================

export interface ArenaOpponentTeamData {
    opponentId?: number;          // 对手玩家ID（可选）
    nickname?: string | null;     // 对手昵称（可选）
    heroIds: number[];            // 敌方上阵英雄ID列表
}

export interface ArenaOpponentTeamResponse extends APIResponse<ArenaOpponentTeamData> {
    code: number;                 // 200表示成功
    data: ArenaOpponentTeamData;  // 对手阵容数据
    msg: string | null;           // 描述信息
}

/**
 * 竞技场结果上报请求
 */
export interface ArenaSubmitResultRequest {
    stageId?: number;             // 关卡/场次ID（可选）
    isVictory: boolean;           // 是否胜利
    honorDelta: number;           // 荣誉点变化（胜利+3，失败-1）
}

/**
 * 竞技场结果上报响应数据
 */
export interface ArenaSubmitResultData {
    honorPoints: number;          // 服务器返回的最新荣誉点
}

/**
 * 竞技场结果上报响应
 */
export interface ArenaSubmitResultResponse extends APIResponse<ArenaSubmitResultData> {
    code: number;                 // 200表示成功
    data: ArenaSubmitResultData;  // 返回最新荣誉点
    msg: string | null;           // 描述信息
}

/**
 * 新增哨塔响应
 */
export interface AddTowerResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 新增结果数据
    msg: string | null;
}

/**
 * 哨塔升级请求
 */
export interface TowerUpgradeRequest {
    watchtowerId: number;        // 哨塔主键（服务端）
}

/**
 * 哨塔升级响应
 */
export interface TowerUpgradeResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 升级结果数据
    msg: string | null;
}

/**
 * 哨塔升星请求
 */
export interface ObtainTowerRequest {
    watchtowerId: number;        // 哨塔主键（服务端）
}

/**
 * 哨塔升星响应
 */
export interface ObtainTowerResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 升星结果数据
    msg: string | null;
}

// ==================== 哨塔建造厂相关类型 ====================

/**
 * 哨塔建造厂信息
 */
export interface TowerFactoryInfo {
    id: string;                  // 建造厂ID
    key: string;                 // 建造厂key
    // 其他建造厂信息字段根据实际响应补充
}

/**
 * 哨塔建造厂列表响应
 */
export interface TowerFactoryListResponse extends APIResponse<TowerFactoryInfo[]> {
    code: number;
    data: TowerFactoryInfo[];    // 建造厂列表
    msg: string | null;
}

/**
 * 新增建造厂记录请求
 */
export interface AddBuildRecordRequest {
    id: string;                  // 建造厂ID
    key: string;                 // 建造厂key
}

/**
 * 新增建造厂记录响应
 */
export interface AddBuildRecordResponse extends APIResponse<number> {
    code: number;
    data: number;                // 新增记录ID
    msg: string | null;
}

// ==================== 用户相关类型补充 ====================

/**
 * 微信登录请求
 */
export interface WxLoginRequest {
    code: string;                // 微信code
}

/**
 * 微信登录响应
 */
export interface WxLoginResponse extends APIResponse<{
    nickName: string | null;     // 昵称
    uuid: number;                // 玩家id
    status: number;              // 玩家状态，0禁止，1正常
    token: string;               // 玩家token
}> {
    code: number;
    data: {
        nickName: string | null;
        uuid: number;
        status: number;
        token: string;
    };
    msg: string | null;
}

/**
 * 用户注册响应
 */
export interface UserRegisterResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 注册结果数据
    msg: string | null;
}

export interface UserListItem {
    userId: number;
    nickName: string;
    userName?: string | null;
}

export interface UserListResponse extends APIResponse<UserListItem[]> {
    code: number;
    data: UserListItem[];
    msg: string | null;
}

/**
 * 用户首页信息,服务器用
 */
export interface UserHomeInfo {
    nickName: string;            // 昵称
    userLevel: number;           // 玩家等级
    diamondNumber: number;       // 钻石数量
    muscleNumber: number;        // 体力数量
    goldNumber: number;          // 金币数量
    earthSeedsNumber: number;    // 大地之种数量
    fightPower: number;          // 战斗力
    personalExperience: number;  // 经验值
    worldTreeLevel: number;      // 玩家世界树等级
    commonNum: number;           // 普通建造图纸数量
    seniorNum: number;           // 高级建造图纸数量
    buildLevel: number;          // 哨塔建造厂等级
    relicTargetedPotion: number; // 定向召唤药水
    summonOrb: number;           // 唤灵宝珠数量
    trainingBook: number;        // 训练之书数量
    darkIron: number;            // 魔铁矿石数量
    stageProgress: number;       // 关卡进度
    skinEssenceNum: number;      // 皮肤精华数量
    flamesVoucher?: number;
    honorPoints?: number;        // 荣誉点数量（可选字段）
    activePoints_1: number | null; // 活跃积分数量
    activePoints_2: number | null; // 活跃积分数量，用于英雄通行证
    totalStatNum: number;        // 已获得星数
    statNum: number;             // 下次获得通关奖励星数
    afkFlag: boolean;            // 首页是否显示挂机收益 true=显示，false=不显示
    materialDOList: MaterialDO[]; // 材料列表
    equipmentVOList: EquipmentVO[]; // 装备列表
    levelProgressDOList: LevelProgressDO[]; // 关卡进度列表
}

// ==== User Level Update ====
export interface UpdateLevelRequest {
    level: number;
}

export interface UpdateLevelResponse extends APIResponse<any> {}

/**
 * 材料数据对象
 */
export interface MaterialDO {
    id: number;                  // 材料ID
    userId: number;              // 用户ID
    materialName: string;        // 材料名称
    materialKey: string;         // 材料key
    materialNumber: number;      // 材料数量
    getTime: string | null;      // 获得时间
}

/**
 * 装备数据对象
 */
export interface EquipmentVO {
    materials: string;           // 装备碎片key
    fragmentNumber: number;      // 装备碎片数量
}

/**
 * 关卡进度数据对象
 */
export interface LevelProgressDO {
    id: number;                  // 关卡进度ID
    userId: number;              // 用户ID
    level: number;               // 关卡级别
    starRate: number;            // 关卡星数，1通关，2半血，3满血
    clearanceTime: string;       // 通关时间
    isElite?: number;            // 是否精英模式 (0-普通, 1-精英) - 可选字段
}

/**
 * 用户首页响应
 */
export interface UserHomeResponse extends APIResponse<UserHomeInfo> {
    code: number;
    data: UserHomeInfo;          // 用户首页信息
    msg: string | null;
}

/**
 * 更新昵称请求
 */
export interface UpdateNicknameRequest {
    nickName: string;                 // 用户昵称
}

/**
 * 更新昵称响应
 */
export interface UpdateNicknameResponse extends APIResponse<number> {
    code: number;
    data: number;                // 更新结果
    msg: string | null;
}

/**
 * 更新头像请求
 */
export interface UpdateIconRequest {
    key: string;                 // 头像标识
}

/**
 * 更新头像响应
 */
export interface UpdateIconResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 更新结果数据
    msg: string | null;
}

/**
 * 更新密码请求
 */
export interface UpdatePasswordRequest {
    key: string;                 // 新密码
}

/**
 * 更新密码响应
 */
export interface UpdatePasswordResponse extends APIResponse<any> {
    code: number;
    data: any;                   // 更新结果数据
    msg: string | null;
}

// ==================== 装备相关类型 ====================

/**
 * 装备信息结构
 */
export interface EquipmentInfo {
    equipId: number;             // 装备ID (对应EquipmentConfig.id)
    level: number;               // 装备等级
    currentFragments: number;    // 当前拥有碎片数
    maxFragments: number;        // 升级所需最大碎片数量
    isUnlocked: boolean;         // 是否已解锁
    isOwned: boolean;            // 是否拥有
    name_as?: string;            // 别名（可选）
}

/**
 * 装备列表响应
 */
export interface EquipmentListResponse extends APIResponse<string[]> {
    code: number;
    data: string[];              // 装备JSON字符串数组
    msg: string | null;
}

/**
 * 装备数据请求结构（与UserEquipmentItem匹配）
 */
export interface AddEquipmentRequest {
    equipId: number;             // 装备ID (对应EquipmentConfig.id)
    level: number;               // 装备等级
    currentFragments: number;    // 当前拥有碎片数
    maxFragments: number;        // 升级所需最大碎片数量
    isUnlocked: boolean;         // 是否已解锁
    isOwned: boolean;            // 是否拥有
    name_as?: string;            // 别名（可选）
}

/**
 * 新增装备响应
 */
export interface AddEquipmentResponse extends APIResponse<number> {
    code: number;
    data: number;                // 新增的装备记录ID
    msg: string | null;
}
