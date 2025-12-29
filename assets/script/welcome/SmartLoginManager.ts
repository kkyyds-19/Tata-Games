import { UserInfoData } from '../user/UserInfoData';
import { UserHomeData } from '../user/UserHomeData';
import { WeChatUserInfoManager, WeChatLoginData, WeChatUserInfoData } from '../wx/WeChatUserInfo';
import { LoginConfig } from '../global/config/LoginConfig';
import { EventManager, LoginEvents, NetEvents } from '../global/EventManager';
import { NetworkConfig } from '../global/config/NetworkConfig';
import { userAPI } from '../api/UserAPI';
import { UserArmyData } from '../user/UserArmyData';
import { UserClassData } from '../user/UserClassData';
import { userMonsterData } from '../user/UserMonsterData';
import { director } from 'cc';
import { game } from 'cc';
import { welcomeCtrl } from './welcomeCtrl';
import ToastManager from '../dialog/ToastManager';
import { ShowToast } from '../global/Toast';
import { EncryptUtils } from '../utils/EncryptUtils';
import { NetMessageData } from './NetManager';
import { GameManager } from '../game/GameManager';

// 微信环境检查
declare const wx: any;
// const LOCAL_STORAGE_KEY = "knight_user_mobile_key";
/**
 * 登录状态枚举
 */
export enum LoginStatus {
    IDLE = 'idle',           // 空闲状态
    CHECKING = 'checking',   // 检查登录状态
    LOGGING_IN = 'logging_in', // 正在登录
    SUCCESS = 'success',     // 登录成功
    FAILED = 'failed'        // 登录失败
}

/**
 * 平台类型枚举
 */
export enum PlatformType {
    WECHAT = 'wechat',       // 微信小游戏
    WEB = 'web',            // Web平台
    UNKNOWN = 'unknown'     // 未知平台
}

/**
 * 登录结果接口
 */
export interface LoginResult {
    success: boolean;
    message: string;
    data?: any;
    platform?: PlatformType;
}

/**
 * 登录回调类型
 */
export type LoginCallback = (result: LoginResult) => void;

/**
 * 智能登录管理器
 * 纯TypeScript单例类，自动判断平台类型和登录状态，提供智能化的登录流程
 */
export class SmartLoginManager {
    private static _instance: SmartLoginManager;

    private userInfoData: UserInfoData;
    private userHomeData: UserHomeData;
    private weChatUserInfoManager: WeChatUserInfoManager;
    private eventManager: EventManager;
    private currentStatus: LoginStatus = LoginStatus.IDLE;
    private platformType: PlatformType = PlatformType.UNKNOWN;
    private isInitialized: boolean = false;

    // 添加并发控制标志
    private isLoginInProgress: boolean = false;

    // 登录回调
    private onLoginSuccess?: LoginCallback;
    private onLoginFailed?: LoginCallback;
    private onLoginComplete?: LoginCallback;

    private constructor() {
        this.userInfoData = UserInfoData.getInstance();
        this.userHomeData = UserHomeData.getInstance();
        this.weChatUserInfoManager = WeChatUserInfoManager.getInstance();
        this.eventManager = EventManager.getInstance();
        this.detectPlatform();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    /**
     * 获取单例实例
     */
    public static getInstance(): SmartLoginManager {
        if (!SmartLoginManager._instance) {
            SmartLoginManager._instance = new SmartLoginManager();
        }
        return SmartLoginManager._instance;
    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners(): void {
        // 监听静默登录请求
        this.eventManager.on(LoginEvents.SILENT_LOGIN_STARTED, this.handleSilentLoginRequest.bind(this));

        // 监听 Token 过期事件
        this.eventManager.on(LoginEvents.TOKEN_EXPIRED, this.handleTokenExpired.bind(this));
    }

    /**
     * 处理静默登录请求
     */
    private async handleSilentLoginRequest(data: any): Promise<void> {
        try {
            const success = await this.silentRelogin();
            if (success) {
                data.onSuccess?.();
            } else {
                data.onError?.('静默登录失败');
            }
        } catch (error) {
            data.onError?.(error);
        }
    }

    /**
     * 处理 Token 过期事件
     */
    private async handleTokenExpired(data: any): Promise<void> {
        try {
            if (data.silent) {
                //实际不会走到这里
                await this.silentRelogin();
            } else {
                await this.forceRelogin(false);
            }
        } catch (error) {
            console.error('SmartLoginManager: 处理 Token 过期失败', error);
        }
    }

    /**
     * 检测当前平台类型
     */
    private detectPlatform(): void {
        if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
            this.platformType = PlatformType.WECHAT;
            console.log('SmartLoginManager: 检测到微信小游戏平台');
        } else {
            this.platformType = PlatformType.WEB;
            console.log('SmartLoginManager: 检测到Web平台');
        }
    }

    /**
     * 获取当前平台类型
     */
    public getPlatformType(): PlatformType {
        return this.platformType;
    }

    /**
     * 获取当前登录状态
     */
    public getCurrentStatus(): LoginStatus {
        return this.currentStatus;
    }

    /**
     * 检查是否已初始化
     */
    public isReady(): boolean {
        return this.isInitialized;
    }

    /**
     * 开始智能登录流程
     * @param onSuccess 登录成功回调
     * @param onFailed 登录失败回调
     * @param onComplete 登录完成回调（无论成功失败）
     */
    public async startSmartLogin(
        // onSuccess?: LoginCallback,
        // onFailed?: LoginCallback,
        // onComplete?: LoginCallback
    ): Promise<void> {
        // 检查是否已经在登录中
        if (this.isLoginInProgress) {
            console.warn('SmartLoginManager: 登录已在进行中，忽略重复请求');
            return;
        }

        this.isLoginInProgress = true;
        // this.onLoginSuccess = onSuccess;
        // this.onLoginFailed = onFailed;
        // this.onLoginComplete = onComplete;

        this.currentStatus = LoginStatus.CHECKING;
        console.log('SmartLoginManager: 开始智能登录流程');

        try {
            // 1. 检查是否已经登录过
            const isLoggedIn = this.checkIfAlreadyLoggedIn();

            if (isLoggedIn) {
                console.log('SmartLoginManager: 检测到已登录状态');
                await this.handleAlreadyLoggedIn();
            } else {
                console.log('SmartLoginManager: 未登录，开始新登录流程');
                await this.handleNewLogin();
            }
        } catch (error) {
            console.error('SmartLoginManager: 登录流程出错', error);
            this.handleLoginFailed('登录流程出错: ' + error.message);
        } finally {
            // 确保登录流程结束后重置标志
            this.isLoginInProgress = false;
        }
    }

    /**
     * 检查是否已经登录过
     * 通过检查 UserInfoData 中的 bearer token 是否为空来判断
     */
    private checkIfAlreadyLoggedIn(): boolean {
        const bearer = this.userInfoData.getBearer();
        const hasBearer = bearer && bearer.trim() !== '';

        console.log('SmartLoginManager: 检查登录状态', {
            hasBearer: hasBearer,
            bearerLength: bearer ? bearer.length : 0
        });

        return hasBearer;
    }

    /**
     * 处理已经登录的情况
     */
    private async handleAlreadyLoggedIn(): Promise<void> {
        try {
            this.currentStatus = LoginStatus.CHECKING;

            const ret = await this.getUserInfo();
            if (!ret) {
                // 如果获取用户信息失败，可能是token过期，清除token重新登录
                this.userInfoData.setBearer('');
                await this.handleNewLogin();
                return;
            }

            this.currentStatus = LoginStatus.SUCCESS;

            // 只有在有回调函数时才触发登录成功事件，避免重复日志
            if (this.onLoginSuccess || this.onLoginComplete) {
                this.handleLoginSuccess('已登录状态，获取用户信息成功');
            } else {
                console.log('SmartLoginManager: 已登录状态，获取用户信息成功（无回调）');
                // 即使没有回调，也要初始化游戏数据
                this.initializeGameDataAfterLogin();
            }

            // 从微信获取用户头像和名字
            await this.getWeChatUserProfile();

        } catch (error) {
            console.error('SmartLoginManager: 获取已登录用户信息失败', error);
            // 如果获取用户信息失败，可能是token过期，清除token重新登录
            this.userInfoData.setBearer('');
            await this.handleNewLogin();
        }
    }

    /**
     * 处理新登录流程
     */
    private async handleNewLogin(): Promise<void> {
        this.currentStatus = LoginStatus.LOGGING_IN;

        console.log('SmartLoginManager: 开始新登录流程', {
            platformType: this.platformType
        });

        try {
            if (this.platformType === PlatformType.WECHAT) {
                console.log('SmartLoginManager: 选择微信登录方式');
                await this.handleWeChatLogin();
            } else {
                console.log('SmartLoginManager: 选择Web登录方式');
                // await this.handleWebLogin();

                this.handleLoginFailed('无自动登录信息');
            }
        } catch (error) {
            console.error('SmartLoginManager: 新登录失败', error);
            this.handleLoginFailed('登录失败: ' + error.message);
        }
    }

    /**
     * 处理微信平台登录
     */
    private async handleWeChatLogin(): Promise<void> {
        console.log('SmartLoginManager: 开始微信平台登录');

        try {
            // 检查是否已有bearer token
            const bearer = this.userInfoData.getBearer();
            if (bearer && bearer.trim() !== '') {
                console.log('SmartLoginManager: 检测到本地bearer token，跳过微信登录流程');

                // 直接获取用户信息和微信用户资料
                await this.getWeChatUserProfile();
                await this.getUserInfo();

                this.currentStatus = LoginStatus.SUCCESS;
                this.handleLoginSuccess('已登录状态，微信登录跳过');
                return;
            }

            // 1. 获取微信登录凭证
            const loginData = await this.getWeChatLoginCode();
            console.log('SmartLoginManager: 获取到微信登录凭证');

            // 2. 调用微信登录API
            const loginResult = await this.callWeChatLoginAPI(loginData.code);
            console.log('SmartLoginManager: 微信登录API调用成功');

            // 3. 保存登录凭证 - 修复数据结构处理
            if (loginResult?.data?.token) {
                this.userInfoData.setBearer(loginResult.data.token);
                console.log('SmartLoginManager: 微信登录token已保存');
            } else if (loginResult?.token) {
                this.userInfoData.setBearer(loginResult.token);
                console.log('SmartLoginManager: 微信登录token已保存');
            } else {
                console.error('SmartLoginManager: 微信登录响应中没有找到token', loginResult);
                throw new Error('服务器返回的token为空');
            }

            // 4. 同步登录响应中的用户信息
            if (loginResult?.data) {
                this.syncLoginResponseToLocal(loginResult.data);
            }

            // 5. 从微信获取用户头像和名字
            await this.getWeChatUserProfile();

            // 6. 获取用户详细信息
            await this.getUserInfo();

            this.currentStatus = LoginStatus.SUCCESS;
            this.handleLoginSuccess('微信登录成功');

        } catch (error) {
            console.error('SmartLoginManager: 微信登录失败', error);
            this.handleLoginFailed('微信登录失败: ' + error.message);
        }
    }

    //////////SMS//////////
    /**
     * 调用SMS登录API
     */
    private async callSMSLoginAPI(): Promise<any> {
        return new Promise((resolve, reject) => {
            const data = welcomeCtrl.Ins.data;
            const loginData = {
                phone: data.mobile.mobileNum || "",
            };

            console.log(`SmartLoginManager: 准备发送Web登录事件 ${JSON.stringify(loginData)}`);

            // 发送事件，让 HttpClient 处理实际的 API 调用
            this.eventManager.emit(LoginEvents.LOGIN_STARTED, {
                type: 'smslogin',
                data: loginData,
                endpoint: LoginConfig.endpoints.smslogin,
                onSuccess: (result: any) => {
                    console.log('SmartLoginManager: SMS登录API响应', result);
                    resolve(result);
                },
                onError: (error: any) => {
                    console.error('SmartLoginManager: SMS登录API调用失败', error);
                    ShowToast('SMS登录失败: ' + error);
                    reject(new Error('SMS登录API调用失败: ' + error));
                }
            });
        });
    }

    /**
     * 处理SMS登录
     */
    async handleSMSLogin(): Promise<void> {
        console.log('SmartLoginManager: 开始SMS登录');

        try {
            // 使用账号密码登录（这里需要根据实际情况实现）
            const loginResult = await this.callSMSLoginAPI();
            console.log('SmartLoginManager: SMS登录API调用成功');

            if (loginResult?.code == 0 || loginResult?.code == 200) {
                console.log(`${JSON.stringify(loginResult || {})}`);
                console.log('SmartLoginManager: SMS登录API成功');
                director.emit(game.gameEvent.WELCOME_SMS_SEND_SUCCESS);
            } else {
                console.warn(`${JSON.stringify(loginResult || {})}`);
                console.error('SmartLoginManager:SMS登录错误　code:', loginResult?.code);
                // throw new Error('SMS登录错误');
                ShowToast(`${loginResult?.msg || "SMS登录错误"}`);
                this.handleLoginFailed('SMS登录错误: ' + loginResult?.msg);
                this.userInfoData.setBearer("");
                return;
            }

            // // 同步登录响应中的用户信息
            // if (loginResult?.data) {
            //     this.syncLoginResponseToLocal(loginResult.data);
            // }

            // // 获取用户详细信息
            // await this.getUserInfo();

            // this.currentStatus = LoginStatus.SUCCESS;
            // this.handleLoginSuccess('Web登录成功');

        } catch (error) {
            console.error('SmartLoginManager: SMS登录失败', error);
            this.handleLoginFailed('SMS登录失败: ' + error.message);
            this.userInfoData.setBearer("");
        }
    }
    //////////SMS//////////
    //////////LoginCode//////////
    public setHandler(
        onSuccess?: LoginCallback,
        onFailed?: LoginCallback,
        onComplete?: LoginCallback
    ) {
        this.onLoginSuccess = onSuccess;
        this.onLoginFailed = onFailed;
        this.onLoginComplete = onComplete;
    }
    /**
     * 调用SMS登录API
     */
    private async callLoginCodeAPI(): Promise<any> {
        return new Promise((resolve, reject) => {
            const data = welcomeCtrl.Ins.data;
            const mobile = data.mobile.mobileNum || ""

            data.encryptid = EncryptUtils.Encryption(mobile);
            data.encryptcode = EncryptUtils.Encryption(data.code);
            console.log(`${mobile}>${data.encryptid}`);
            console.log(`${data.code}>${data.encryptcode}`);
            const loginData = {
                phone: data.encryptid,
                code: data.encryptcode
            };

            console.log(`SmartLoginManager: 准备发送LoginCode事件 ${JSON.stringify(loginData)}`);

            // 发送事件，让 HttpClient 处理实际的 API 调用
            this.eventManager.emit(LoginEvents.LOGIN_STARTED, {
                type: 'logincode',
                data: loginData,
                endpoint: LoginConfig.endpoints.logincode,
                onSuccess: (result: any) => {
                    console.log('SmartLoginManager: LoginCodeAPI响应', result);
                    resolve(result);
                },
                onError: (error: any) => {
                    console.error('SmartLoginManager: LoginCodeAPI调用失败', error);
                    ShowToast('LoginCode失败: ' + error);
                    reject(new Error('LoginCodeAPI调用失败: ' + error));
                }
            });
        });
    }

    /**
     * 处理SMS登录
     */
    async handleLoginCode(): Promise<void> {
        console.log('SmartLoginManager: 开始LoginCode');
        try {
            // 使用账号密码登录（这里需要根据实际情况实现）
            const loginResult = await this.callLoginCodeAPI();
            console.log('SmartLoginManager: LoginCode调用成功');

            if (loginResult?.code == 0 || loginResult?.code == 200) {
                console.log(`${JSON.stringify(loginResult || {})}`);
                console.log('SmartLoginManager: LoginCodeAPI成功');

                // 保存登录凭证 - 修复数据结构处理
                const data = welcomeCtrl.Ins.data;
                if (loginResult?.data?.token) {
                    this.userInfoData.setBearer(loginResult.data.token);
                    welcomeCtrl.Ins.save();
                    // localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.mobile));
                    console.log('SmartLoginManager: LoginCodetoken已保存');
                } else if (loginResult?.token) {
                    this.userInfoData.setBearer(loginResult.data.token);
                    welcomeCtrl.Ins.save();
                    // localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.mobile));
                    console.log('SmartLoginManager: LoginCodetoken已保存');
                } else {
                    console.error('SmartLoginManager: Web登录响应中没有找到token', loginResult);
                    // throw new Error('服务器返回的token为空');
                    this.handleLoginFailed('SMS登录失败:  服务器返回的token为空');
                    this.userInfoData.setBearer("");
                    return;
                }
            } else {
                console.warn(`${JSON.stringify(loginResult || {})}`);
                console.error('SmartLoginManager:LoginCode错误　code:', loginResult?.code);
                ShowToast(`${loginResult?.msg || "SMS登录失败"}`);
                this.handleLoginFailed('SMS登录失败: ' + loginResult?.msg);
                this.userInfoData.setBearer("");
                return;
                // throw new Error('LoginCode错误');
            }

            // // 同步登录响应中的用户信息
            if (loginResult?.data) {
                this.syncLoginResponseToLocal(loginResult.data);
            }

            // 获取用户详细信息
            await this.getUserInfo();

            this.currentStatus = LoginStatus.SUCCESS;
            this.handleLoginSuccess('SMS登录失败');

        } catch (error) {
            console.error('SmartLoginManager: SMS登录失败', error);
            this.handleLoginFailed('SMS登录失败: ' + error.message);
            this.userInfoData.setBearer("");
        }
    }
    //////////LoginCode//////////

    /**
     * 处理Web平台登录
     */
    private async handleWebLogin(): Promise<void> {
        console.log('SmartLoginManager: 开始Web平台登录');

        try {
            // 使用账号密码登录（这里需要根据实际情况实现）
            const loginResult = await this.callWebLoginAPI();
            console.log('SmartLoginManager: Web登录API调用成功');

            // 保存登录凭证 - 修复数据结构处理
            if (loginResult?.data?.token) {
                // this.userInfoData.setBearer(loginResult.data.token);
                console.log('SmartLoginManager: Web登录token已保存');
            } else if (loginResult?.token) {
                // this.userInfoData.setBearer(loginResult.token);
                console.log('SmartLoginManager: Web登录token已保存');
            } else {
                console.error('SmartLoginManager: Web登录响应中没有找到token', loginResult);
                throw new Error('服务器返回的token为空');
            }

            // 同步登录响应中的用户信息
            if (loginResult?.data) {
                this.syncLoginResponseToLocal(loginResult.data);
            }

            // 获取用户详细信息
            await this.getUserInfo();

            this.currentStatus = LoginStatus.SUCCESS;
            this.handleLoginSuccess('Web登录成功');

        } catch (error) {
            console.error('SmartLoginManager: Web登录失败', error);
            this.handleLoginFailed('Web登录失败: ' + error.message);
        }
    }


    /**
     * 获取微信登录凭证
     */
    private getWeChatLoginCode(): Promise<WeChatLoginData> {
        return new Promise((resolve, reject) => {
            // 优先检查本地bearer token
            const bearer = this.userInfoData.getBearer();

            if (bearer && bearer.trim() !== '') {
                console.log('SmartLoginManager: 检测到本地bearer token，跳过登录流程');
                // 有bearer说明已经登录过，不需要重新获取code
                reject(new Error('已登录状态，无需重新获取登录凭证'));
                return;
            }

            // 如果本地没有bearer，则调用WeChatUserInfoManager获取
            this.weChatUserInfoManager.getLoginData((loginData, error) => {
                if (loginData) {
                    resolve(loginData);
                } else {
                    reject(new Error(error || '获取微信登录凭证失败'));
                }
            });
        });
    }

    /**
     * 调用微信登录API
     * @param code 微信登录凭证
     */
    private async callWeChatLoginAPI(code: string): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log('SmartLoginManager: 准备发送微信登录事件');

            // 发送事件，让 HttpClient 处理实际的 API 调用
            this.eventManager.emit(LoginEvents.LOGIN_STARTED, {
                type: 'wechat',
                code: code,
                endpoint: LoginConfig.endpoints.wxLogin,
                method: LoginConfig.methods.wxLogin, // 使用GET方法
                onSuccess: (result: any) => {
                    console.log('SmartLoginManager: 微信登录API响应', result);
                    resolve(result);
                },
                onError: (error: any) => {
                    console.error('SmartLoginManager: 微信登录API调用失败', error);
                    reject(new Error('微信登录API调用失败: ' + error));
                }
            });
        });
    }

    /**
     * 调用Web登录API
     */
    private async callWebLoginAPI(): Promise<any> {
        return new Promise((resolve, reject) => {
            const data = welcomeCtrl.Ins.data;
            const loginData = {
                phone: data.encryptid || "",
                password: data.encryptpassword || ""
            };

            console.log('SmartLoginManager: 准备发送Web登录事件');

            // 发送事件，让 HttpClient 处理实际的 API 调用
            this.eventManager.emit(LoginEvents.LOGIN_STARTED, {
                type: 'web',
                data: loginData,
                endpoint: LoginConfig.endpoints.login,
                onSuccess: (result: any) => {
                    console.log('SmartLoginManager: Web登录API响应', result);
                    resolve(result);
                },
                onError: (error: any) => {
                    console.error('SmartLoginManager: Web登录API调用失败', error);
                    ShowToast('Web登录失败: ' + error);
                    reject(new Error('Web登录API调用失败: ' + error));
                }
            });
        });
    }

    /**
     * 获取微信用户头像和名字
     */
    private async getWeChatUserProfile(): Promise<void> {
        if (this.platformType !== PlatformType.WECHAT) {
            console.log('SmartLoginManager: 非微信平台，跳过获取用户头像和名字');
            return;
        }

        try {
            console.log('SmartLoginManager: 开始获取微信用户头像和名字');

            // 首先检查本地是否已有微信用户信息
            const localWxUserInfo = this.getLocalWeChatUserInfo();

            if (localWxUserInfo) {
                console.log('SmartLoginManager: 使用本地存储的微信用户信息');
                await this.syncWeChatUserProfileToLocal(localWxUserInfo);
                return;
            }

            // 如果本地没有，则尝试从微信获取
            console.log('SmartLoginManager: 本地无微信用户信息，尝试从微信获取');
            const userProfile = await this.getWeChatUserInfo();

            if (userProfile) {
                // 同步微信用户信息到本地
                await this.syncWeChatUserProfileToLocal(userProfile);
                console.log('SmartLoginManager: 微信用户头像和名字获取成功');
            } else {
                console.warn('SmartLoginManager: 获取微信用户头像和名字失败，用户可能拒绝了授权');
            }
        } catch (error) {
            console.warn('SmartLoginManager: 获取微信用户头像和名字失败', error);
            // 获取失败不影响登录流程，只记录警告
        }
    }

    /**
     * 获取本地存储的微信用户信息
     */
    private getLocalWeChatUserInfo(): WeChatUserInfoData | null {
        const wxNickName = this.userInfoData.getWxNickName();
        const wxAvatarUrl = this.userInfoData.getWxAvatarUrl();

        // 检查是否有完整的微信用户信息
        if (wxNickName && wxAvatarUrl) {
            console.log('SmartLoginManager: 找到本地存储的微信用户信息', {
                nickName: wxNickName,
                avatarUrl: wxAvatarUrl
            });

            return {
                nickName: wxNickName,
                avatarUrl: wxAvatarUrl,
                gender: 0, // 默认值
                country: '',
                province: '',
                city: '',
                language: 'zh_CN'
            };
        }

        return null;
    }

    /**
     * 检查微信用户信息是否需要更新
     * 可以根据时间戳或其他条件判断是否需要重新获取
     */
    private shouldUpdateWeChatUserInfo(): boolean {
        // 这里可以添加逻辑来判断是否需要更新微信用户信息
        // 比如检查上次获取时间，或者检查头像URL是否有效等

        const wxAvatarUrl = this.userInfoData.getWxAvatarUrl();
        if (!wxAvatarUrl) {
            return true; // 没有头像URL，需要获取
        }

        // 可以添加更多检查逻辑，比如：
        // 1. 检查头像URL是否过期（微信头像URL有时效性）
        // 2. 检查上次获取时间是否超过一定期限
        // 3. 检查用户是否主动要求更新

        return false; // 默认不需要更新
    }

    /**
     * 强制更新微信用户信息（供外部调用）
     * 当用户主动要求更新头像或昵称时调用
     */
    public async forceUpdateWeChatUserInfo(): Promise<boolean> {
        if (this.platformType !== PlatformType.WECHAT) {
            console.warn('SmartLoginManager: 非微信平台，无法更新微信用户信息');
            return false;
        }

        try {
            console.log('SmartLoginManager: 强制更新微信用户信息');

            // 清除本地缓存的微信用户信息
            this.userInfoData.setWxNickName('');
            this.userInfoData.setWxAvatarUrl('');

            // 重新获取微信用户信息
            const userProfile = await this.getWeChatUserInfo();

            if (userProfile) {
                await this.syncWeChatUserProfileToLocal(userProfile);
                console.log('SmartLoginManager: 微信用户信息更新成功');
                return true;
            } else {
                console.warn('SmartLoginManager: 微信用户信息更新失败，用户可能拒绝了授权');
                return false;
            }
        } catch (error) {
            console.error('SmartLoginManager: 强制更新微信用户信息失败', error);
            return false;
        }
    }

    /**
     * 获取微信用户信息
     */
    private getWeChatUserInfo(): Promise<WeChatUserInfoData | null> {
        return new Promise((resolve) => {
            // 优先检查本地微信用户信息
            const userInfoData = UserInfoData.getInstance();
            const wxNickName = userInfoData.getWxNickName();
            const wxAvatarUrl = userInfoData.getWxAvatarUrl();

            if (wxNickName && wxNickName.trim() !== '' &&
                wxAvatarUrl && wxAvatarUrl.trim() !== '') {
                console.log('SmartLoginManager: 使用本地微信用户信息，跳过API调用');

                const localWxUserInfo: WeChatUserInfoData = {
                    nickName: wxNickName,
                    avatarUrl: wxAvatarUrl,
                    gender: 0,
                    country: '',
                    province: '',
                    city: '',
                    language: 'zh_CN'
                };

                resolve(localWxUserInfo);
                return;
            }

            // 如果本地没有或需要更新，则调用WeChatUserInfoManager
            this.weChatUserInfoManager.getUserInfo((userInfo, error) => {
                if (userInfo) {
                    resolve(userInfo);
                } else {
                    console.warn('SmartLoginManager: 获取微信用户信息失败', error);
                    resolve(null);
                }
            });
        });
    }

    /**
     * 同步微信用户头像和名字到本地
     * 并根据服务端用户名状态决定是否上传到服务器
     */
    private async syncWeChatUserProfileToLocal(wechatUserInfo: WeChatUserInfoData): Promise<void> {
        console.log('SmartLoginManager: 开始同步微信用户头像和名字');

        // 同步微信昵称到本地
        if (wechatUserInfo.nickName) {
            this.userInfoData.setWxNickName(wechatUserInfo.nickName);
            console.log('SmartLoginManager: 同步微信昵称到本地', wechatUserInfo.nickName);
        }

        // 同步微信头像URL到本地
        if (wechatUserInfo.avatarUrl) {
            this.userInfoData.setWxAvatarUrl(wechatUserInfo.avatarUrl);
            console.log('SmartLoginManager: 同步微信头像到本地', wechatUserInfo.avatarUrl);
        }

        // 检查是否需要上传用户名和头像到服务器
        await this.checkAndUploadUserProfile(wechatUserInfo);

        console.log('SmartLoginManager: 微信用户头像和名字同步完成');
    }

    /**
     * 检查并上传用户资料到服务器
     * 如果服务端用户名为空、空字符串或"新手玩家"，则上传微信用户信息
     * @param wechatUserInfo 微信用户信息
     */
    private async checkAndUploadUserProfile(wechatUserInfo: WeChatUserInfoData): Promise<void> {
        try {
            // 获取当前服务端的用户信息
            const currentUserInfo = this.userInfoData.getUserInfo();
            const serverUserName = currentUserInfo.userName || '';
            const serverAvatar = currentUserInfo.avatar || '';

            // 检查是否需要上传用户信息
            const shouldUpload = this.shouldUploadUserProfile(serverUserName, serverAvatar);

            if (shouldUpload) {
                console.log('SmartLoginManager: 检测到需要上传用户资料，开始上传');
                await this.uploadUserProfileToServer(wechatUserInfo);
            } else {
                console.log('SmartLoginManager: 服务端用户名已存在，跳过上传', serverUserName);
            }
        } catch (error) {
            console.error('SmartLoginManager: 检查并上传用户资料失败', error);
            // 上传失败不影响登录流程，只记录错误
        }
    }

    /**
     * 判断是否需要上传用户资料
     * @param serverNickName 服务端用户名
     * @param serverAvatar 服务端头像
     * @returns 是否需要上传
     */
    private shouldUploadUserProfile(serverNickName: string, serverAvatar?: string): boolean {
        // 如果用户名为空、空字符串或"新手玩家"，则需要上传
        const needUploadNickname = !serverNickName ||
            serverNickName.trim() === '' ||
            serverNickName === '新手玩家';

        // 如果头像为空或空字符串，则需要上传
        const needUploadAvatar = !serverAvatar ||
            serverAvatar.trim() === '';

        // 只要有一个需要上传，就返回true
        return needUploadNickname || needUploadAvatar;
    }

    /**
     * 上传用户资料到服务器
     * @param wechatUserInfo 微信用户信息
     */
    private async uploadUserProfileToServer(wechatUserInfo: WeChatUserInfoData): Promise<void> {
        try {
            // 上传用户名
            if (wechatUserInfo.nickName) {
                await this.uploadNickname(wechatUserInfo.nickName);
            }

            // 上传头像（这里需要根据实际情况处理头像URL）
            if (wechatUserInfo.avatarUrl) {
                await this.uploadAvatar(wechatUserInfo.avatarUrl);
            }

            console.log('SmartLoginManager: 用户资料上传成功');
        } catch (error) {
            console.error('SmartLoginManager: 用户资料上传失败', error);
            throw error;
        }
    }

    /**
     * 上传用户名到服务器
     * @param nickname 用户名
     */
    private async uploadNickname(nickname: string): Promise<void> {
        try {
            console.log('SmartLoginManager: 开始上传用户名', nickname);

            const response = await userAPI.updateNickname(nickname);

            if (response.code === 200 || response.code === 0) {
                console.log('SmartLoginManager: 用户名上传成功', nickname);
                // 更新本地用户信息
                this.userInfoData.setUserName(nickname);
            } else {
                throw new Error(response.msg || '用户名上传失败');
            }
        } catch (error) {
            console.error('SmartLoginManager: 用户名上传失败', error);
            throw error;
        }
    }

    /**
     * 上传头像到服务器
     * @param avatarUrl 头像URL
     */
    private async uploadAvatar(avatarUrl: string): Promise<void> {
        try {
            console.log('SmartLoginManager: 开始上传头像', avatarUrl);

            // 这里需要根据实际情况处理头像URL
            // 可能需要将URL转换为头像标识符，或者直接上传头像文件
            // 暂时使用一个默认的头像标识符
            const avatarKey = this.convertAvatarUrlToKey(avatarUrl);

            const response = await userAPI.updateIcon(avatarKey);

            if (response.code === 200 || response.code === 0) {
                console.log('SmartLoginManager: 头像上传成功', avatarKey);
                // 更新本地头像信息
                this.userInfoData.setWxAvatarUrl(avatarUrl);
            } else {
                throw new Error(response.msg || '头像上传失败');
            }
        } catch (error) {
            console.error('SmartLoginManager: 头像上传失败', error);
            throw error;
        }
    }

    /**
     * 将头像URL转换为头像标识符
     * 这里需要根据实际业务逻辑实现
     * @param avatarUrl 头像URL
     * @returns 头像标识符
     */
    private convertAvatarUrlToKey(avatarUrl: string): string {
        // 这里需要根据实际情况实现
        // 可能需要调用专门的API来上传头像文件并获取标识符
        // 暂时返回一个默认值
        console.log('SmartLoginManager: 转换头像URL为标识符', avatarUrl);

        // 示例：可以根据URL生成一个唯一的标识符
        // 或者调用专门的头像上传API
        return avatarUrl; // 临时返回默头像url
    }



    /**
     * 获取用户信息
     */
    public async getUserInfo(): Promise<boolean> {
        // console.log('SmartLoginManager: 开始获取用户详细信息');

        try {
            // 调用获取用户信息API
            const userInfoResult = await this.callGetUserInfoAPI();
            console.log('SmartLoginManager: 获取用户信息API响应', userInfoResult);

            if (userInfoResult?.code !== 200) {
                console.warn('SmartLoginManager: 获取用户信息失败');
                return false;
            }



            if (userInfoResult?.data) {
                // 检查是否有嵌套的错误响应
                if (userInfoResult.data.code === 201 && userInfoResult.data.msg) {
                    console.warn('SmartLoginManager: 用户扩展信息不存在，跳过详细信息同步');
                    // 用户扩展信息不存在，这是正常的，不需要抛出错误
                    return true;
                }

                // 同步用户信息到 UserInfoData
                this.syncUserInfoToLocal(userInfoResult.data);
                console.log('SmartLoginManager: 用户详细信息已同步到本地');
            } else {
                console.warn('SmartLoginManager: 获取用户信息响应中没有data字段', userInfoResult);
            }
            return true;
        } catch (error) {
            console.error('SmartLoginManager: 获取用户信息失败', error);
            // 获取用户信息失败不影响登录流程，只记录错误
            return false;
        }
    }

    /**
     * 调用获取用户信息API
     */
    private async callGetUserInfoAPI(): Promise<any> {
        return new Promise((resolve, reject) => {
            // console.log('SmartLoginManager: 准备发送获取用户信息事件');

            // 发送事件，让 HttpClient 处理实际的 API 调用
            this.eventManager.emit(LoginEvents.LOGIN_STARTED, {
                type: 'getUserInfo',
                endpoint: LoginConfig.endpoints.getUserInfo,
                method: LoginConfig.methods.getUserInfo,
                onSuccess: (result: any) => {
                    // console.log('SmartLoginManager: 获取用户信息API响应', result);
                    resolve(result);
                },
                onError: (error: any) => {
                    // console.error('SmartLoginManager: 获取用户信息API调用失败', error);
                    reject(new Error('获取用户信息API调用失败: ' + error));
                }
            });
        });
    }

    /**
     * 同步用户信息到本地 UserInfoData
     */
    private syncUserInfoToLocal(serverUserInfo: any): void {
        console.log('SmartLoginManager: 开始同步用户信息');

        // 直接更新UserHomeData，它会自动同步到UserInfoData
        this.userHomeData.updateHomeInfo(serverUserInfo);

        console.log('SmartLoginManager: 用户信息同步完成');
    }

    /**
     * 同步登录响应中的用户信息到本地
     */
    private syncLoginResponseToLocal(loginResponse: any): void {
        console.log('SmartLoginManager: 开始同步登录响应中的用户信息');

        // 开始批量更新，减少事件触发频率
        this.userInfoData.beginBatchUpdate();

        // 同步昵称
        if (loginResponse.nickName) {
            this.userInfoData.setUserName(loginResponse.nickName);
            console.log('SmartLoginManager: 同步昵称', loginResponse.nickName);
        }

        // 同步用户ID - 优先使用uuid字段，如果没有则使用userId
        if (loginResponse.uuid) {
            this.userInfoData.setUserId(loginResponse.uuid.toString());
            console.log('SmartLoginManager: 同步用户ID (uuid)', loginResponse.uuid);
        } else if (loginResponse.userId) {
            this.userInfoData.setUserId(loginResponse.userId.toString());
            console.log('SmartLoginManager: 同步用户ID (userId)', loginResponse.userId);
        }

        // 结束批量更新，只触发一次事件
        this.userInfoData.endBatchUpdate();

        console.log('SmartLoginManager: 登录响应用户信息同步完成');
    }

    /**
     * 处理登录成功
     */
    private handleLoginSuccess(message: string): void {
        const bearer = this.userInfoData.getBearer();
        // 脱敏显示bearer token，只显示前8位和后4位
        const maskedBearer = bearer ? `${bearer.substring(0, 8)}...${bearer.substring(bearer.length - 4)}` : 'null';
        console.log('SmartLoginManager: 登录成功，当前bearer token:', maskedBearer);

        // 登录成功后初始化游戏数据（非阻塞）
        this.initializeGameDataAfterLogin();

        const result: LoginResult = {
            success: true,
            message: message,
            platform: this.platformType,
            data: {
                bearer: bearer,
                userInfo: this.userInfoData.getUserInfo()
            }
        };

        if (this.onLoginSuccess) {
            this.onLoginSuccess(result);
        }

        if (this.onLoginComplete) {
            this.onLoginComplete(result);
        }
    }

    /**
     * 登录成功后初始化游戏数据
     */
    private initializeGameDataAfterLogin(): void {
        console.log('SmartLoginManager: 开始初始化游戏数据');

        // 使用Promise.then()避免阻塞登录流程
        this.initializeGameDataAsync();
    }

    /**
     * 异步初始化游戏数据（内部方法）
     */
    private initializeGameDataAsync(): void {
        try {
            // 初始化用户部队数据
            UserArmyData.getInstance().initializeAfterLogin();

            // 初始化用户职业数据
            UserClassData.getInstance().initializeAfterLogin();

            // 初始化用户怪物图鉴数据（非阻塞）
            userMonsterData.initialize().then(() => {
                console.log('SmartLoginManager: 怪物图鉴数据初始化完成');
            }).catch((error) => {
                console.error('SmartLoginManager: 怪物图鉴数据初始化失败', error);
            });
        } catch (error) {
            console.error('SmartLoginManager: 游戏数据初始化失败', error);
            throw error;
        }
    }

    /**
     * 处理登录失败
     */
    private handleLoginFailed(message: string): void {
        this.currentStatus = LoginStatus.FAILED;

        const result: LoginResult = {
            success: false,
            message: message,
            platform: this.platformType
        };

        console.error('SmartLoginManager: 登录失败', message);

        if (this.onLoginFailed) {
            this.onLoginFailed(result);
        }

        if (this.onLoginComplete) {
            this.onLoginComplete(result);
        }
    }

    /**
     * 退出登录
     */
    public logout(): void {
        console.log('SmartLoginManager: 退出登录');
        this.userInfoData.setBearer('');
        this.currentStatus = LoginStatus.IDLE;
    }

    /**
     * 静默重新登录（用于 HttpClient 自动重新登录）
     * 不触发回调函数，只更新登录状态
     */
    public async silentRelogin(): Promise<boolean> {
        console.log('SmartLoginManager: 开始静默重新登录');

        try {
            this.currentStatus = LoginStatus.LOGGING_IN;

            // 根据平台类型选择登录方式
            if (this.platformType === PlatformType.WECHAT) {
                await this.handleWeChatLoginSilent();
            } else {
                // await this.handleWebLoginSilent();
                //不再需要静默登录
                this.currentStatus = LoginStatus.FAILED;
                return false;
            }

            this.currentStatus = LoginStatus.SUCCESS;
            console.log('SmartLoginManager: 静默重新登录成功');
            return true;

        } catch (error) {
            console.error('SmartLoginManager: 静默重新登录失败', error);
            this.currentStatus = LoginStatus.FAILED;
            return false;
        }
        return false;
    }

    /**
     * 静默微信登录（不触发回调）
     */
    private async handleWeChatLoginSilent(): Promise<void> {
        try {
            // 静默登录时强制获取新的微信登录凭证，不检查本地bearer
            console.log('SmartLoginManager: 静默登录，强制获取新的微信登录凭证');

            // 1. 直接调用WeChatUserInfoManager获取登录凭证，强制刷新
            const loginData = await this.getWeChatLoginCodeForced();

            // 2. 调用微信登录API
            const loginResult = await this.callWeChatLoginAPI(loginData.code);

            // 3. 保存登录凭证 - 修复数据结构处理
            if (loginResult?.data?.token) {
                this.userInfoData.setBearer(loginResult.data.token);
                console.log('SmartLoginManager: 微信静默登录token已保存');
            } else if (loginResult?.token) {
                this.userInfoData.setBearer(loginResult.token);
                console.log('SmartLoginManager: 微信静默登录token已保存');
            } else {
                throw new Error('服务器返回的token为空');
            }

            // 4. 获取用户信息
            await this.getUserInfo();

            // 5. 从微信获取用户头像和名字
            await this.getWeChatUserProfile();

        } catch (error) {
            throw new Error('微信静默登录失败: ' + (error as Error).message);
        }
    }

    /**
     * 强制获取微信登录凭证（用于静默登录）
     * 不检查本地bearer，直接调用wx.login
     */
    private getWeChatLoginCodeForced(): Promise<WeChatLoginData> {
        return new Promise((resolve, reject) => {
            console.log('SmartLoginManager: 强制获取微信登录凭证，忽略本地bearer');

            // 直接调用WeChatUserInfoManager获取，强制刷新
            this.weChatUserInfoManager.getLoginData((loginData, error) => {
                if (loginData) {
                    resolve(loginData);
                } else {
                    reject(new Error(error || '获取微信登录凭证失败'));
                }
            }, true); // 强制刷新参数
        });
    }

    /**
     * 静默Web登录（不触发回调）
     */
    // private async handleWebLoginSilent(): Promise<void> {
    //     try {
    //         const loginResult = await this.callWebLoginAPI();

    //         // 保存登录凭证 - 修复数据结构处理
    //         if (loginResult?.data?.token) {
    //             // this.userInfoData.setBearer(loginResult.data.token);
    //             // 脱敏显示token
    //             const maskedToken = loginResult.data.token ?
    //                 `${loginResult.data.token.substring(0, 8)}...${loginResult.data.token.substring(loginResult.data.token.length - 4)}` : 'null';
    //             console.log('SmartLoginManager: Web静默登录token已保存', maskedToken);
    //         } else if (loginResult?.token) {
    //             // this.userInfoData.setBearer(loginResult.token);
    //             // 脱敏显示token
    //             const maskedToken = loginResult.token ?
    //                 `${loginResult.token.substring(0, 8)}...${loginResult.token.substring(loginResult.token.length - 4)}` : 'null';
    //             console.log('SmartLoginManager: Web静默登录token已保存', maskedToken);
    //         } else {
    //             throw new Error('服务器返回的token为空');
    //         }

    //         // 获取用户信息
    //         await this.getUserInfo();

    //     } catch (error) {
    //         throw new Error('Web静默登录失败: ' + (error as Error).message);
    //     }
    // }

    /**
     * 强制重新登录（支持静默模式）
     */
    public async forceRelogin(silent: boolean = false): Promise<void> {
        console.log('SmartLoginManager: 强制重新登录', { silent });

        this.userInfoData.setBearer('');
        this.currentStatus = LoginStatus.IDLE;

        if (silent) {
            //实际不会进入这里
            await this.silentRelogin();
        } else {
            // await this.startSmartLogin(this.onLoginSuccess, this.onLoginFailed, this.onLoginComplete);


            const scene = director.getScene();
            // console.log(`>>>>>>>>>>>>>>>>>>>>director.getScene()${scene.name}`);
            switch (scene.name) {
                case "welcome":
                    ShowToast("token已过期，请重新登录");
                    break;
                case "game":
                    director.emit(NetEvents.NET_SHOW_MESSAGE, {
                        content: "token已过期，请重新登录",
                        ok: "返回登录",
                        okcb: () => {
                            GameManager.getInstance().clearGameData();
                            director.loadScene("welcome");
                        }
                    } as NetMessageData);
                    break;
                default:
                    director.emit(NetEvents.NET_SHOW_MESSAGE, {
                        content: "token已过期，请重新登录",
                        ok: "返回登录",
                        okcb: () => {
                            director.loadScene("welcome");
                        }
                    } as NetMessageData);
            }

        }
    }

    /**
     * 检查登录状态（便捷方法）
     */
    public isLoggedIn(): boolean {
        return this.checkIfAlreadyLoggedIn();
    }

    /**
     * 获取当前用户信息
     */
    public getCurrentUserInfo(): any {
        return this.userInfoData.getUserInfo();
    }

    /**
     * 获取登录状态文本
     */
    public getStatusText(): string {
        switch (this.currentStatus) {
            case LoginStatus.IDLE:
                return '准备登录...';
            case LoginStatus.CHECKING:
                return '检查登录状态...';
            case LoginStatus.LOGGING_IN:
                return '正在登录...';
            case LoginStatus.SUCCESS:
                return '登录成功';
            case LoginStatus.FAILED:
                return '登录失败';
            default:
                return '未知状态';
        }
    }

    /**
     * 获取平台文本
     */
    public getPlatformText(): string {
        switch (this.platformType) {
            case PlatformType.WECHAT:
                return '微信小游戏';
            case PlatformType.WEB:
                return 'Web平台';
            case PlatformType.UNKNOWN:
                return '未知平台';
            default:
                return '未知平台';
        }
    }

    /**
     * 等待登录完成
     */
    public async waitForLoginComplete(): Promise<LoginResult> {
        return new Promise((resolve) => {
            const checkStatus = () => {
                if (this.currentStatus === LoginStatus.SUCCESS || this.currentStatus === LoginStatus.FAILED) {
                    const result: LoginResult = {
                        success: this.currentStatus === LoginStatus.SUCCESS,
                        message: this.getStatusText(),
                        platform: this.platformType,
                        data: this.currentStatus === LoginStatus.SUCCESS ? {
                            bearer: this.userInfoData.getBearer(),
                            userInfo: this.userInfoData.getUserInfo()
                        } : undefined
                    };
                    resolve(result);
                } else {
                    setTimeout(checkStatus, 100);
                }
            };
            checkStatus();
        });
    }

    /**
     * 测试用户名上传逻辑
     * 用于验证用户名和头像上传功能是否正常工作
     */
    public async testUserProfileUpload(): Promise<void> {
        console.log('SmartLoginManager: 开始测试用户资料上传功能');

        try {
            // 模拟微信用户信息
            const mockWeChatUserInfo: WeChatUserInfoData = {
                nickName: '测试用户',
                avatarUrl: 'https://example.com/avatar.jpg',
                gender: 1,
                country: 'China',
                province: 'Guangdong',
                city: 'Shenzhen',
                language: 'zh_CN'
            };

            // 测试用户名上传逻辑
            await this.checkAndUploadUserProfile(mockWeChatUserInfo);

            console.log('SmartLoginManager: 用户资料上传测试完成');
        } catch (error) {
            console.error('SmartLoginManager: 用户资料上传测试失败', error);
        }
    }

    /**
     * 手动触发用户资料上传
     * 可以在需要的时候手动调用此方法来上传用户资料
     */
    public async manualUploadUserProfile(): Promise<void> {
        console.log('SmartLoginManager: 手动触发用户资料上传');

        try {
            // 获取微信用户信息
            const wechatUserInfo = await this.getWeChatUserInfo();

            if (wechatUserInfo) {
                await this.uploadUserProfileToServer(wechatUserInfo);
                console.log('SmartLoginManager: 手动用户资料上传成功');
            } else {
                console.warn('SmartLoginManager: 无法获取微信用户信息，跳过上传');
            }
        } catch (error) {
            console.error('SmartLoginManager: 手动用户资料上传失败', error);
            throw error;
        }
    }

    /**
     * 检查是否有本地存储的微信用户信息
     * 供其他组件调用，用于判断是否需要显示"更新头像"按钮等
     */
    public hasLocalWeChatUserInfo(): boolean {
        const wxNickName = this.userInfoData.getWxNickName();
        const wxAvatarUrl = this.userInfoData.getWxAvatarUrl();
        return !!(wxNickName && wxAvatarUrl);
    }

    /**
     * 获取本地存储的微信用户信息（公共方法）
     * 供其他组件调用，获取当前存储的微信用户信息
     */
    public getLocalWeChatUserInfoPublic(): WeChatUserInfoData | null {
        return this.getLocalWeChatUserInfo();
    }

    /**
     * 清除本地存储的微信用户信息
     * 供其他组件调用，用于清除缓存强制重新获取
     */
    public clearLocalWeChatUserInfo(): void {
        console.log('SmartLoginManager: 清除本地微信用户信息缓存');
        this.userInfoData.setWxNickName('');
        this.userInfoData.setWxAvatarUrl('');
    }

    /**
     * 检查微信用户信息是否需要更新（公共方法）
     * 供其他组件调用，用于判断是否需要提示用户更新信息
     */
    public shouldUpdateWeChatUserInfoPublic(): boolean {
        return this.shouldUpdateWeChatUserInfo();
    }
}