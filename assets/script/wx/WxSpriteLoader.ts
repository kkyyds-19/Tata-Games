import { _decorator, Component, Sprite, SpriteFrame, Texture2D, assetManager, ImageAsset, director } from 'cc';
import { UserInfoData } from '../user/UserInfoData';
import { SmartLoginManager } from '../welcome/SmartLoginManager';
import { game } from 'cc';

// 微信环境检查
declare const wx: any;

const { ccclass, property } = _decorator;

/**
 * 微信头像自动加载组件
 * 自动从UserInfoData获取微信头像URL并设置到Sprite
 * 支持本地缓存，避免重复授权
 */
@ccclass('WxSpriteLoader')
export class WxSpriteLoader extends Component {

    @property(Sprite)
    targetSprite: Sprite = null;

    @property(Sprite)
    localTargetSprite: Sprite = null;

    @property({ tooltip: '是否显示更新头像按钮（当有本地缓存时）' })
    showUpdateButton: boolean = false;

    private userInfoData: UserInfoData = null;
    private smartLoginManager: SmartLoginManager = null;
    
    // 防重复加载机制
    private lastAvatarUrl: string = '';
    private lastUseWxAvatar: boolean = true;
    private isLoading: boolean = false;

    onLoad() {
        this.userInfoData = UserInfoData.getInstance();
        this.smartLoginManager = SmartLoginManager.getInstance();
        
        // 监听用户信息更新事件
        director.on(game.gameEvent.HALL_USER_INFO_UPDATE, this.refreshUserInfo, this);
    }

    start() {
        this.loadAvatarFromUserInfo();
    }

    /**
     * 从UserInfoData加载头像
     */
    public loadAvatarFromUserInfo(): void {
        if (!this.targetSprite || !this.userInfoData) {
            console.error('WxSpriteLoader: 组件未正确初始化');
            return;
        }

        // 检查是否使用微信头像
        const useWxAvatar = this.userInfoData.getUseWxAvatar();
        const wxAvatarUrl = this.userInfoData.getWxAvatarUrl();
        
        // 防重复加载检查
        if (this.isLoading) {
            console.log('WxSpriteLoader: 正在加载中，跳过重复请求');
            return;
        }
        
        if (this.lastUseWxAvatar === useWxAvatar && this.lastAvatarUrl === wxAvatarUrl) {
            console.log('WxSpriteLoader: 头像设置未变化，跳过重复加载');
            return;
        }
        
        // 更新状态
        this.lastUseWxAvatar = useWxAvatar;
        this.lastAvatarUrl = wxAvatarUrl;
        
        if (useWxAvatar) {
            // 使用微信头像
            if (this.isValidAvatarUrl(wxAvatarUrl)) {
                console.log(`WxSpriteLoader: 开始加载微信头像: ${wxAvatarUrl}`);
                this.loadAvatar(wxAvatarUrl);
            } else {
                console.warn('WxSpriteLoader: 微信头像URL无效，显示本地头像');
                this.showLocalAvatar();
            }
        } else {
            // 不使用微信头像，直接显示本地头像
            console.log('WxSpriteLoader: 用户设置不使用微信头像，显示本地头像');
            this.showLocalAvatar();
        }
    }

    /**
     * 刷新用户信息（事件回调）
     */
    private refreshUserInfo(): void {
        // 检查是否真的需要刷新
        const currentUseWxAvatar = this.userInfoData.getUseWxAvatar();
        const currentAvatarUrl = this.userInfoData.getWxAvatarUrl();
        
        // 只有当设置或头像URL真正发生变化时才刷新
        if (this.lastUseWxAvatar !== currentUseWxAvatar || this.lastAvatarUrl !== currentAvatarUrl) {
            console.log('WxSpriteLoader: 头像设置或URL发生变化，刷新头像显示');
            this.loadAvatarFromUserInfo();
        }
    }

    /**
     * 显示本地头像
     */
    private showLocalAvatar(): void {
        // 清除加载状态
        this.isLoading = false;
        
        // 隐藏微信头像
        if (this.targetSprite) {
            this.targetSprite.node.active = false;
        }
        
        // 显示本地头像
        if (this.localTargetSprite) {
            this.localTargetSprite.node.active = true;
        }
    }

    /**
     * 隐藏本地头像
     */
    private hideLocalAvatar(): void {
        if (this.localTargetSprite) {
            this.localTargetSprite.node.active = false;
        }
    }

    /**
     * 加载头像
     */
    private loadAvatar(avatarUrl: string): void {
        // 检查是否在微信小游戏环境
        if (typeof wx !== 'undefined') {
            this.loadAvatarInWeChat(avatarUrl);
        } else {
            this.loadAvatarInWeb(avatarUrl);
        }
    }

    /**
     * 微信小游戏环境下的头像加载
     */
    private loadAvatarInWeChat(avatarUrl: string): void {
        console.log('WxSpriteLoader: 开始微信头像加载:', avatarUrl);
        
        // 设置加载状态
        this.isLoading = true;
        
        // 使用正确的微信小游戏加载方式
        // 注意：必须传入 ext 参数，否则微信小游戏无法正确识别文件类型
        assetManager.loadRemote<ImageAsset>(avatarUrl, { ext: '.png' }, (err, imageAsset) => {
            // 清除加载状态
            this.isLoading = false;
            
            if (err || !imageAsset) {
                console.error('WxSpriteLoader: 微信头像加载失败', err);
                this.showLocalAvatar();
                return;
            }

            console.log('WxSpriteLoader: 微信头像ImageAsset加载成功', {
                width: imageAsset.width,
                height: imageAsset.height
            });

            // 创建 Texture2D
            const texture = new Texture2D();
            texture.image = imageAsset;

            // 创建 SpriteFrame
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;

            // 设置到 Sprite 上
            this.targetSprite.spriteFrame = spriteFrame;
            this.targetSprite.node.active = true;

            // 隐藏本地头像
            this.hideLocalAvatar();

            console.log('WxSpriteLoader: 微信头像设置成功');
        });
    }

    /**
     * Web环境下的头像加载
     */
    private loadAvatarInWeb(avatarUrl: string): void {
        console.log('WxSpriteLoader: 开始Web头像加载:', avatarUrl);
        
        // 设置加载状态
        this.isLoading = true;
        
        // Web环境也使用相同的方式，但可以尝试不传ext参数
        assetManager.loadRemote<ImageAsset>(avatarUrl, (err, imageAsset) => {
            // 清除加载状态
            this.isLoading = false;
            
            if (err || !imageAsset) {
                console.error('WxSpriteLoader: Web头像加载失败', err);
                this.showLocalAvatar();
                return;
            }

            console.log('WxSpriteLoader: Web头像ImageAsset加载成功', {
                width: imageAsset.width,
                height: imageAsset.height
            });

            // 创建 Texture2D
            const texture = new Texture2D();
            texture.image = imageAsset;

            // 创建 SpriteFrame
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;

            // 设置到 Sprite 上
            this.targetSprite.spriteFrame = spriteFrame;
            this.targetSprite.node.active = true;

            // 隐藏本地头像
            this.hideLocalAvatar();

            console.log('WxSpriteLoader: Web头像设置成功');
        });
    }

    /**
     * 检查是否为有效的微信头像URL
     */
    private isValidAvatarUrl(avatarUrl: string): boolean {
        return avatarUrl && 
               avatarUrl.trim() !== '' && 
               avatarUrl.startsWith('http');
    }

    /**
     * 手动刷新头像（供外部调用）
     */
    public refreshAvatar(): void {
        this.loadAvatarFromUserInfo();
    }

    /**
     * 强制更新微信用户信息（会弹出授权框）
     * 供UI按钮调用，当用户主动要求更新头像时使用
     */
    public async forceUpdateWeChatUserInfo(): Promise<boolean> {
        if (!this.smartLoginManager) {
            console.error('WxSpriteLoader: SmartLoginManager未初始化');
            return false;
        }

        try {
            console.log('WxSpriteLoader: 用户主动要求更新微信用户信息');
            
            const success = await this.smartLoginManager.forceUpdateWeChatUserInfo();
            
            if (success) {
                // 更新成功后，重新加载头像
                this.loadAvatarFromUserInfo();
                console.log('WxSpriteLoader: 微信用户信息更新成功，头像已刷新');
            } else {
                console.warn('WxSpriteLoader: 微信用户信息更新失败');
            }
            
            return success;
        } catch (error) {
            console.error('WxSpriteLoader: 强制更新微信用户信息失败', error);
            return false;
        }
    }

    /**
     * 检查是否有本地存储的微信用户信息
     * 供UI组件调用，用于判断是否显示"更新头像"按钮
     */
    public hasLocalWeChatUserInfo(): boolean {
        if (!this.smartLoginManager) {
            return false;
        }
        return this.smartLoginManager.hasLocalWeChatUserInfo();
    }

    /**
     * 获取本地微信用户信息
     * 供UI组件调用，获取当前存储的微信用户信息
     */
    public getLocalWeChatUserInfo(): any {
        if (!this.smartLoginManager) {
            return null;
        }
        return this.smartLoginManager.getLocalWeChatUserInfoPublic();
    }

    onDestroy() {
        // 移除事件监听
        director.off(game.gameEvent.HALL_USER_INFO_UPDATE, this.refreshUserInfo, this);
    }
} 