import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Texture2D, ImageAsset } from 'cc';
import { WeChatUserInfoManager, WeChatUserInfoData, WeChatLoginData, UserInfoCallback, LoginCallback } from './WeChatUserInfo';

// 微信环境检查
declare const wx: any;

const { ccclass, property } = _decorator;

/**
 * 微信用户信息使用示例
 * 展示如何获取和显示微信用户信息和登录凭证
 */
@ccclass('WeChatUserInfoExample')
export class WeChatUserInfoExample extends Component {
    @property(Label)
    public nickNameLabel: Label = null!;

    @property(Sprite)
    public avatarSprite: Sprite = null!;

    @property(Label)
    public statusLabel: Label = null!;

    @property(Label)
    public loginCodeLabel: Label = null!;

    private userInfoManager: WeChatUserInfoManager;

    onLoad() {
        this.userInfoManager = WeChatUserInfoManager.getInstance();
        this.updateStatus('准备获取用户信息...');
    }

    start() {
        // 自动获取用户信息和登录凭证
        // this.getUserInfoWithLogin();
        // this.getUserInfo();
        // this.getLoginData
    }

    /**
     * 获取用户信息
     */
    public getUserInfo(): void {
        this.updateStatus('正在获取用户信息...');
        
        this.userInfoManager.getUserInfo((userInfo, error) => {
            if (userInfo) {
                this.updateStatus('获取用户信息成功');
                this.displayUserInfo(userInfo);
            } else {
                this.updateStatus(`获取失败: ${error}`);
                console.error('获取用户信息失败:', error);
            }
        });
    }

    /**
     * 获取登录凭证
     */
    public getLoginData(): void {
        this.updateStatus('正在获取登录凭证...');
        
        this.userInfoManager.getLoginData((loginData, error) => {
            if (loginData) {
                this.updateStatus('获取登录凭证成功');
                this.displayLoginData(loginData);
            } else {
                this.updateStatus(`获取登录凭证失败: ${error}`);
                console.error('获取登录凭证失败:', error);
            }
        });
    }

    /**
     * 获取用户信息和登录凭证
     */
    public getUserInfoWithLogin(): void {
        this.updateStatus('正在获取用户信息和登录凭证...');
        
        this.userInfoManager.getUserInfoWithLogin((userInfo, loginData, error) => {
            if (userInfo && loginData) {
                this.updateStatus('获取用户信息和登录凭证成功');
                this.displayUserInfo(userInfo);
                this.displayLoginData(loginData);
            } else {
                this.updateStatus(`获取失败: ${error}`);
                console.error('获取用户信息和登录凭证失败:', error);
            }
        });
    }

    /**
     * 强制刷新用户信息
     */
    public refreshUserInfo(): void {
        this.updateStatus('正在刷新用户信息...');
        
        this.userInfoManager.getUserInfo((userInfo, error) => {
            if (userInfo) {
                this.updateStatus('刷新用户信息成功');
                this.displayUserInfo(userInfo);
            } else {
                this.updateStatus(`刷新失败: ${error}`);
                console.error('刷新用户信息失败:', error);
            }
        }, true); // 强制刷新
    }

    /**
     * 强制刷新登录凭证
     */
    public refreshLoginData(): void {
        this.updateStatus('正在刷新登录凭证...');
        
        this.userInfoManager.getLoginData((loginData, error) => {
            if (loginData) {
                this.updateStatus('刷新登录凭证成功');
                this.displayLoginData(loginData);
            } else {
                this.updateStatus(`刷新登录凭证失败: ${error}`);
                console.error('刷新登录凭证失败:', error);
            }
        }, true); // 强制刷新
    }

    /**
     * 显示用户信息
     */
    private displayUserInfo(userInfo: WeChatUserInfoData): void {
        // 显示昵称
        if (this.nickNameLabel) {
            this.nickNameLabel.string = userInfo.nickName;
        }

        // 显示头像
        if (this.avatarSprite && userInfo.avatarUrl) {
            this.loadAvatarFromUrl(userInfo.avatarUrl);
        }

        console.log('用户信息:', userInfo);
    }

    /**
     * 显示登录凭证
     */
    private displayLoginData(loginData: WeChatLoginData): void {
        // 显示登录凭证
        if (this.loginCodeLabel) {
            this.loginCodeLabel.string = `登录凭证: ${loginData.code}`;
        }

        console.log('登录凭证:', loginData);
    }

    /**
     * 从URL加载头像
     */
    private loadAvatarFromUrl(url: string): void {
        // 注意：在微信小游戏中，需要使用微信的图片加载API
        if (typeof wx !== 'undefined') {
            // 微信环境下的图片加载
            wx.getImageInfo({
                src: url,
                success: (res: any) => {
                    console.log('头像加载成功:', res);
                    // 这里需要将微信的图片信息转换为Cocos Creator的纹理
                    // 具体实现可能需要根据项目需求调整
                },
                fail: (err: any) => {
                    console.error('头像加载失败:', err);
                }
            });
        } else {
            // 非微信环境，使用默认头像
            console.log('非微信环境，使用默认头像');
        }
    }

    /**
     * 更新状态显示
     */
    private updateStatus(status: string): void {
        if (this.statusLabel) {
            this.statusLabel.string = status;
        }
        console.log('状态更新:', status);
    }

    /**
     * 获取用户昵称（按钮点击事件）
     */
    public onGetNickName(): void {
        const nickName = this.userInfoManager.getNickName();
        this.updateStatus(`用户昵称: ${nickName}`);
    }

    /**
     * 获取头像地址（按钮点击事件）
     */
    public onGetAvatarUrl(): void {
        const avatarUrl = this.userInfoManager.getAvatarUrl();
        this.updateStatus(`头像地址: ${avatarUrl}`);
    }

    /**
     * 获取登录凭证（按钮点击事件）
     */
    public onGetLoginCode(): void {
        const loginCode = this.userInfoManager.getLoginCode();
        this.updateStatus(`登录凭证: ${loginCode}`);
    }

    /**
     * 检查是否有用户信息（按钮点击事件）
     */
    public onCheckUserInfo(): void {
        const hasInfo = this.userInfoManager.hasUserInfo();
        this.updateStatus(`是否有用户信息: ${hasInfo ? '是' : '否'}`);
    }

    /**
     * 检查是否有登录凭证（按钮点击事件）
     */
    public onCheckLoginData(): void {
        const hasLoginData = this.userInfoManager.hasLoginData();
        this.updateStatus(`是否有登录凭证: ${hasLoginData ? '是' : '否'}`);
    }

    /**
     * 清除缓存（按钮点击事件）
     */
    public onClearCache(): void {
        this.userInfoManager.clearCache();
        this.updateStatus('缓存已清除');
        
        // 清空显示
        if (this.nickNameLabel) {
            this.nickNameLabel.string = '';
        }
        if (this.avatarSprite) {
            this.avatarSprite.spriteFrame = null;
        }
        if (this.loginCodeLabel) {
            this.loginCodeLabel.string = '';
        }
    }

    /**
     * 获取缓存信息（按钮点击事件）
     */
    public onGetCachedInfo(): void {
        const cachedUserInfo = this.userInfoManager.getCachedUserInfo();
        const cachedLoginData = this.userInfoManager.getCachedLoginData();
        
        if (cachedUserInfo && cachedLoginData) {
            this.updateStatus('获取缓存信息成功');
            this.displayUserInfo(cachedUserInfo);
            this.displayLoginData(cachedLoginData);
        } else {
            this.updateStatus('没有缓存信息');
        }
    }

    /**
     * 发送登录凭证到服务器（按钮点击事件）
     */
    public onSendLoginToServer(): void {
        const loginCode = this.userInfoManager.getLoginCode();
        if (loginCode) {
            this.updateStatus('正在发送登录凭证到服务器...');
            
            // 模拟发送到服务器
            console.log('发送登录凭证到服务器:', loginCode);
            
            // 这里可以添加实际的网络请求代码
            // 例如：
            // this.sendLoginRequest(loginCode);
            
            setTimeout(() => {
                this.updateStatus('登录凭证发送成功');
            }, 1000);
        } else {
            this.updateStatus('没有登录凭证，请先获取');
        }
    }

    /**
     * 模拟发送登录请求到服务器
     */
    private sendLoginRequest(loginCode: string): void {
        // 这里可以添加实际的网络请求代码
        // 例如使用 fetch 或 XMLHttpRequest
        
        // 示例：
        /*
        fetch('https://your-server.com/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: loginCode,
                timestamp: Date.now()
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('登录成功:', data);
            this.updateStatus('服务器登录成功');
        })
        .catch(error => {
            console.error('登录失败:', error);
            this.updateStatus('服务器登录失败');
        });
        */
    }
} 