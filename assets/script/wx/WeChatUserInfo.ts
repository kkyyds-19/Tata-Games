import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Texture2D, ImageAsset } from 'cc';
import { UserInfoData } from '../user/UserInfoData';

// 微信环境检查
declare const wx: any;

// 微信用户信息接口
export interface WeChatUserInfoData {
    nickName: string;        // 用户昵称
    avatarUrl: string;       // 用户头像地址
    gender: number;          // 性别 0：未知、1：男、2：女
    country: string;         // 国家
    province: string;        // 省份
    city: string;           // 城市
    language: string;        // 语言
}

// 微信登录凭证接口
export interface WeChatLoginData {
    code: string;            // 登录凭证
    encryptedData?: string;  // 加密数据
    iv?: string;            // 加密算法的初始向量
    signature?: string;      // 签名
    rawData?: string;        // 原始数据
}

// 用户信息获取回调类型
export type UserInfoCallback = (userInfo: WeChatUserInfoData | null, error?: string) => void;

// 登录凭证获取回调类型
export type LoginCallback = (loginData: WeChatLoginData | null, error?: string) => void;

/**
 * 微信用户信息管理类
 * 用于获取微信用户的昵称、头像等信息和登录凭证
 */
export class WeChatUserInfoManager {
    private static instance: WeChatUserInfoManager;
    private userInfo: WeChatUserInfoData | null = null;
    private loginData: WeChatLoginData | null = null;
    private isGettingUserInfo: boolean = false;
    private isGettingLoginData: boolean = false;
    private userInfoCallbacks: UserInfoCallback[] = [];
    private loginCallbacks: LoginCallback[] = [];
    
    // 时间戳记录
    private lastLoginTime: number = 0;
    private lastUserInfoTime: number = 0;

    // 时间间隔限制（毫秒）
    private readonly LOGIN_MIN_INTERVAL: number = 10000;    // 登录最小间隔10秒（更保守）
    private readonly USERINFO_MIN_INTERVAL: number = 15000; // 用户信息最小间隔15秒（更保守）

    // 缓存时间（毫秒）
    private readonly LOGIN_CACHE_DURATION: number = 300000;    // 登录凭证缓存5分钟
    private readonly USERINFO_CACHE_DURATION: number = 600000; // 用户信息缓存10分钟

    private constructor() {}

    public static getInstance(): WeChatUserInfoManager {
        if (!WeChatUserInfoManager.instance) {
            WeChatUserInfoManager.instance = new WeChatUserInfoManager();
        }
        return WeChatUserInfoManager.instance;
    }

    /**
     * 获取登录凭证
     * @param callback 回调函数
     * @param forceRefresh 是否强制刷新（忽略缓存）
     */
    public getLoginData(callback: LoginCallback, forceRefresh: boolean = false): void {
        // 检查是否在微信环境中
        if (typeof wx === 'undefined') {
            console.warn('WeChatUserInfoManager: 非微信环境，无法获取登录数据');
            callback(null, '非微信环境，无法获取登录数据');
            return;
        }

        // 优先检查本地bearer token
        const userInfoData = UserInfoData.getInstance();
        const bearer = userInfoData.getBearer();
        
        if (bearer && bearer.trim() !== '' && !forceRefresh) {
            console.log('WeChatUserInfoManager: 检测到本地bearer token，跳过登录流程');
            // 有bearer说明已经登录过，不需要重新获取code
            callback(null, '已登录状态，无需重新获取登录凭证');
            return;
        }

        // 如果已有缓存且不强制刷新，直接返回
        if (this.loginData && !forceRefresh) {
            callback(this.loginData);
            return;
        }

        // 如果正在获取中，添加到回调队列
        if (this.isGettingLoginData) {
            this.loginCallbacks.push(callback);
            return;
        }

        this.isGettingLoginData = true;
        this.loginCallbacks.push(callback);

        console.log('WeChatUserInfoManager: 本地无有效bearer，调用wx.login获取新登录凭证');

        // 调用微信登录接口
        wx.login({
            success: (res: any) => {
                console.log('WeChatUserInfoManager: 登录成功', res);
                this.loginData = {
                    code: res.code,
                    encryptedData: res.encryptedData,
                    iv: res.iv,
                    signature: res.signature,
                    rawData: res.rawData
                };
                this.handleLoginSuccess(this.loginData);
            },
            fail: (err: any) => {
                console.error('WeChatUserInfoManager: 登录失败', err);
                this.handleLoginError('登录失败: ' + (err.errMsg || '未知错误'));
            }
        });
    }

    /**
     * 获取用户信息（包含登录凭证）
     * @param callback 回调函数
     * @param forceRefresh 是否强制刷新（忽略缓存）
     */
    public getUserInfoWithLogin(callback: (userInfo: WeChatUserInfoData | null, loginData: WeChatLoginData | null, error?: string) => void, forceRefresh: boolean = false): void {
        // 检查是否在微信环境中
        if (typeof wx === 'undefined') {
            console.warn('WeChatUserInfoManager: 非微信环境，无法获取用户信息');
            callback(null, null, '非微信环境，无法获取用户信息');
            return;
        }

        // 先获取登录凭证
        this.getLoginData((loginData, loginError) => {
            if (loginError) {
                callback(null, null, loginError);
                return;
            }

            // 再获取用户信息
            this.getUserInfo((userInfo, userError) => {
                if (userError) {
                    callback(null, loginData, userError);
                    return;
                }

                callback(userInfo, loginData);
            }, forceRefresh);
        }, forceRefresh);
    }

    /**
     * 获取用户信息
     * @param callback 回调函数
     * @param forceRefresh 是否强制刷新（忽略缓存）
     */
    public getUserInfo(callback: UserInfoCallback, forceRefresh: boolean = false): void {
        // 检查是否在微信环境中
        if (typeof wx === 'undefined') {
            console.warn('WeChatUserInfoManager: 非微信环境，无法获取用户信息');
            callback(null, '非微信环境，无法获取用户信息');
            return;
        }

        // 优先检查本地微信用户信息
        const userInfoData = UserInfoData.getInstance();
        const wxNickName = userInfoData.getWxNickName();
        const wxAvatarUrl = userInfoData.getWxAvatarUrl();
        
        if (wxNickName && wxNickName.trim() !== '' && 
            wxAvatarUrl && wxAvatarUrl.trim() !== '' && 
            !forceRefresh) {
            console.log('WeChatUserInfoManager: 使用本地微信用户信息，跳过getUserProfile');
            
            // 构造用户信息对象
            const userInfo: WeChatUserInfoData = {
                nickName: wxNickName,
                avatarUrl: wxAvatarUrl,
                gender: 0,
                country: '',
                province: '',
                city: '',
                language: 'zh_CN'
            };
            
            this.userInfo = userInfo;
            callback(userInfo);
            return;
        }

        // 如果已有缓存且不强制刷新，直接返回
        if (this.userInfo && !forceRefresh) {
            callback(this.userInfo);
            return;
        }

        // 如果正在获取中，添加到回调队列
        if (this.isGettingUserInfo) {
            this.userInfoCallbacks.push(callback);
            return;
        }

        this.isGettingUserInfo = true;
        this.userInfoCallbacks.push(callback);

        console.log('WeChatUserInfoManager: 本地微信用户信息不完整，调用getUserProfile获取用户信息');

        // 不再需要检查授权状态，因为 getUserProfile 会弹出授权框
        this.requestUserInfo();
    }

    /**
     * 请求用户授权并获取信息
     */
    private requestUserInfo(): void {
        console.log('WeChatUserInfoManager: 请求用户授权获取信息');
        
        // 新版本微信小游戏使用 wx.getUserProfile 获取用户信息
        // 这是获取用户信息的推荐方式 getUserProfile
        if (typeof wx.getUserProfile !== 'undefined') {
            wx.getUserProfile({
                desc: '用于自动注册登录', // 声明获取用户个人信息后的用途
                success: (res: any) => {
                    console.log('WeChatUserInfoManager: getUserProfile 成功', res);
                    this.userInfo = res.userInfo;
                    this.handleSuccess(this.userInfo);
                },
                fail: (err: any) => {
                    console.error('WeChatUserInfoManager: getUserProfile 失败', err);
                    
                    // 检查是否是隐私政策问题
                    if (err.errMsg && err.errMsg.includes('privacy usage')) {
                        console.warn('WeChatUserInfoManager: 需要在微信公众平台声明隐私使用用途');
                        this.handleError('需要在微信公众平台声明隐私使用用途');
                    } else {
                        this.handleError('用户拒绝授权或获取失败: ' + (err.errMsg || '未知错误'));
                    }
                }
            });
        } else {
            // 兼容旧版本，使用 wx.getUserInfo
            wx.getUserInfo({
                success: (res: any) => {
                    console.log('WeChatUserInfoManager: getUserInfo 成功', res);
                    this.userInfo = res.userInfo;
                    this.handleSuccess(this.userInfo);
                },
                fail: (err: any) => {
                    console.error('WeChatUserInfoManager: getUserInfo 失败', err);
                    this.handleError('用户拒绝授权或获取失败: ' + (err.errMsg || '未知错误'));
                }
            });
        }

        // 如果用户没有主动授权，返回错误
        setTimeout(() => {
            if (this.isGettingUserInfo) {
                this.handleError('用户未授权获取信息');
            }
        }, 10000); // 10秒超时
    }

 

    /**
     * 处理成功回调
     */
    private handleSuccess(userInfo: WeChatUserInfoData): void {
        this.isGettingUserInfo = false;
        const callbacks = [...this.userInfoCallbacks];
        this.userInfoCallbacks = [];
        
        callbacks.forEach(callback => {
            try {
                callback(userInfo);
            } catch (error) {
                console.error('WeChatUserInfoManager: 回调执行错误', error);
            }
        });
    }

    /**
     * 处理登录成功回调
     */
    private handleLoginSuccess(loginData: WeChatLoginData): void {
        this.isGettingLoginData = false;
        const callbacks = [...this.loginCallbacks];
        this.loginCallbacks = [];
        
        callbacks.forEach(callback => {
            try {
                callback(loginData);
            } catch (error) {
                console.error('WeChatUserInfoManager: 登录回调执行错误', error);
            }
        });
    }

    /**
     * 处理错误回调
     */
    private handleError(error: string): void {
        this.isGettingUserInfo = false;
        const callbacks = [...this.userInfoCallbacks];
        this.userInfoCallbacks = [];
        
        callbacks.forEach(callback => {
            try {
                callback(null, error);
            } catch (err) {
                console.error('WeChatUserInfoManager: 错误回调执行错误', err);
            }
        });
    }

    /**
     * 处理登录错误回调
     */
    private handleLoginError(error: string): void {
        this.isGettingLoginData = false;
        const callbacks = [...this.loginCallbacks];
        this.loginCallbacks = [];
        
        callbacks.forEach(callback => {
            try {
                callback(null, error);
            } catch (err) {
                console.error('WeChatUserInfoManager: 登录错误回调执行错误', err);
            }
        });
    }

    /**
     * 获取缓存的用户信息
     */
    public getCachedUserInfo(): WeChatUserInfoData | null {
        return this.userInfo;
    }

    /**
     * 获取缓存的登录凭证
     */
    public getCachedLoginData(): WeChatLoginData | null {
        return this.loginData;
    }

    /**
     * 清除缓存
     */
    public clearCache(): void {
        this.userInfo = null;
        this.loginData = null;
        this.lastLoginTime = 0;
        this.lastUserInfoTime = 0;
        console.log('WeChatUserInfoManager: 缓存已清除');
    }

    /**
     * 检查是否已获取用户信息
     */
    public hasUserInfo(): boolean {
        return this.userInfo !== null;
    }

    /**
     * 检查是否已获取登录凭证
     */
    public hasLoginData(): boolean {
        return this.loginData !== null;
    }

    /**
     * 获取用户昵称
     */
    public getNickName(): string {
        return this.userInfo?.nickName || '未知用户';
    }

    /**
     * 获取用户头像地址
     */
    public getAvatarUrl(): string {
        return this.userInfo?.avatarUrl || '';
    }

    /**
     * 获取登录凭证
     */
    public getLoginCode(): string {
        return this.loginData?.code || '';
    }
}

/**
 * 微信用户信息组件
 * 可以挂载到节点上使用
 */
const { ccclass, property } = _decorator;

@ccclass('WeChatUserInfo')
export class WeChatUserInfo extends Component {
    @property
    public autoGetUserInfo: boolean = true;

    @property
    public autoGetLoginData: boolean = true;

    @property
    public showLogs: boolean = true;

    private userInfoManager: WeChatUserInfoManager;

    onLoad() {
        this.userInfoManager = WeChatUserInfoManager.getInstance();
        
        if (this.autoGetUserInfo) {
            // 改为检查本地缓存，避免自动弹出授权框
            this.checkLocalUserInfo();
        }

        if (this.autoGetLoginData) {
            this.getLoginData();
        }
    }

    /**
     * 检查本地用户信息，避免自动弹出授权框
     */
    private checkLocalUserInfo(): void {
        // 检查是否有本地缓存的用户信息
        const cachedUserInfo = this.userInfoManager.getCachedUserInfo();
        
        if (cachedUserInfo) {
            console.log('WeChatUserInfo: 使用本地缓存的用户信息', cachedUserInfo);
            // 可以在这里触发回调或更新UI
        } else {
            console.log('WeChatUserInfo: 本地无用户信息缓存，等待用户主动获取');
            // 不自动弹出授权框，等待用户主动调用
        }
    }

    /**
     * 获取用户信息
     */
    public getUserInfo(callback?: UserInfoCallback): void {
        this.userInfoManager.getUserInfo((userInfo, error) => {
            if (this.showLogs) {
                if (userInfo) {
                    console.log('WeChatUserInfo: 获取用户信息成功', userInfo);
                } else {
                    console.error('WeChatUserInfo: 获取用户信息失败', error);
                }
            }
            
            if (callback) {
                callback(userInfo, error);
            }
        });
    }

    /**
     * 获取登录凭证
     */
    public getLoginData(callback?: LoginCallback): void {
        this.userInfoManager.getLoginData((loginData, error) => {
            if (this.showLogs) {
                if (loginData) {
                    console.log('WeChatUserInfo: 获取登录凭证成功', loginData);
                } else {
                    console.error('WeChatUserInfo: 获取登录凭证失败', error);
                }
            }
            
            if (callback) {
                callback(loginData, error);
            }
        });
    }

    /**
     * 获取用户信息和登录凭证
     */
    public getUserInfoWithLogin(callback?: (userInfo: WeChatUserInfoData | null, loginData: WeChatLoginData | null, error?: string) => void): void {
        this.userInfoManager.getUserInfoWithLogin((userInfo, loginData, error) => {
            if (this.showLogs) {
                if (userInfo && loginData) {
                    console.log('WeChatUserInfo: 获取用户信息和登录凭证成功', { userInfo, loginData });
                } else {
                    console.error('WeChatUserInfo: 获取用户信息和登录凭证失败', error);
                }
            }
            
            if (callback) {
                callback(userInfo, loginData, error);
            }
        });
    }

    /**
     * 获取用户昵称
     */
    public getNickName(): string {
        return this.userInfoManager.getNickName();
    }

    /**
     * 获取用户头像地址
     */
    public getAvatarUrl(): string {
        return this.userInfoManager.getAvatarUrl();
    }

    /**
     * 获取登录凭证
     */
    public getLoginCode(): string {
        return this.userInfoManager.getLoginCode();
    }

    /**
     * 检查是否有用户信息
     */
    public hasUserInfo(): boolean {
        return this.userInfoManager.hasUserInfo();
    }

    /**
     * 检查是否有登录凭证
     */
    public hasLoginData(): boolean {
        return this.userInfoManager.hasLoginData();
    }
} 