import { Sprite, SpriteFrame, Texture2D, assetManager } from 'cc';

// 微信环境检查
declare const wx: any;

/**
 * 微信头像加载工具类
 * 专门用于在微信小游戏环境中加载微信头像URL
 * 简单版本：如果URL正确就显示，错误就隐藏
 */
export class WxAvatarLoader {
    
    /**
     * 设置微信头像到Sprite
     * @param sprite 目标Sprite组件
     * @param avatarUrl 微信头像URL
     */
    public static setAvatar(sprite: Sprite, avatarUrl: string): void {
        if (!sprite) {
            console.error('WxAvatarLoader: Sprite组件为空');
            return;
        }

        if (!avatarUrl || avatarUrl.trim() === '') {
            console.warn('WxAvatarLoader: 头像URL为空，隐藏Sprite');
            sprite.node.active = false;
            return;
        }

        console.log(`WxAvatarLoader: 开始加载微信头像: ${avatarUrl}`);

        // 检查是否在微信小游戏环境
        if (typeof wx !== 'undefined') {
            WxAvatarLoader.loadAvatarInWeChat(sprite, avatarUrl);
        } else {
            WxAvatarLoader.loadAvatarInWeb(sprite, avatarUrl);
        }
    }

    /**
     * 微信小游戏环境下的头像加载
     */
    private static loadAvatarInWeChat(sprite: Sprite, avatarUrl: string): void {
        // 使用wx.createImage()创建图片对象
        const image = wx.createImage();
        
        image.onload = () => {
            console.log('WxAvatarLoader: 微信头像加载成功', avatarUrl);
            // 在微信环境中，直接使用assetManager.loadRemote
            // 因为wx.createImage()已经处理了CORS问题
            assetManager.loadRemote<Texture2D>(avatarUrl, (err, texture) => {
                if (err) {
                    console.error('WxAvatarLoader: 微信头像转换失败', err);
                    sprite.node.active = false;
                    return;
                }

                if (texture) {
                    // 创建SpriteFrame
                    const spriteFrame = new SpriteFrame();
                    spriteFrame.texture = texture;

                    // 设置到Sprite并显示
                    sprite.spriteFrame = spriteFrame;
                    sprite.node.active = true;

                    console.log('WxAvatarLoader: 成功设置微信头像', avatarUrl);
                } else {
                    console.error('WxAvatarLoader: 微信头像纹理为空');
                    sprite.node.active = false;
                }
            });
        };

        image.onerror = (err: any) => {
            console.error('WxAvatarLoader: 微信头像加载失败', err);
            sprite.node.active = false;
        };

        image.src = avatarUrl;
    }

    /**
     * Web环境下的头像加载
     */
    private static loadAvatarInWeb(sprite: Sprite, avatarUrl: string): void {
        // 使用Cocos Creator的assetManager.loadRemote API
        assetManager.loadRemote<Texture2D>(avatarUrl, (err, texture) => {
            if (err) {
                console.error('WxAvatarLoader: Web头像加载失败', err);
                sprite.node.active = false;
                return;
            }

            if (texture) {
                // 创建SpriteFrame
                const spriteFrame = new SpriteFrame();
                spriteFrame.texture = texture;

                // 设置到Sprite并显示
                sprite.spriteFrame = spriteFrame;
                sprite.node.active = true;

                console.log('WxAvatarLoader: 成功设置Web头像', avatarUrl);
            } else {
                console.error('WxAvatarLoader: 加载的头像纹理为空');
                sprite.node.active = false;
            }
        });
    }

    /**
     * 检查是否为有效的微信头像URL
     * @param avatarUrl 头像URL
     * @returns 是否为有效URL
     */
    public static isValidAvatarUrl(avatarUrl: string): boolean {
        return avatarUrl && 
               avatarUrl.trim() !== '' && 
               avatarUrl.startsWith('http');
    }

    /**
     * 批量设置头像（可选功能）
     * @param sprites Sprite数组
     * @param avatarUrl 头像URL
     */
    public static setAvatarBatch(sprites: Sprite[], avatarUrl: string): void {
        if (!sprites || sprites.length === 0) {
            console.warn('WxAvatarLoader: Sprite数组为空');
            return;
        }

        sprites.forEach(sprite => {
            WxAvatarLoader.setAvatar(sprite, avatarUrl);
        });
    }
} 