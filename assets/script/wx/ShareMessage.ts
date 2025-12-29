/**
 * 微信分享组件
 * 功能：处理微信分享功能，包括分享给朋友和分享到朋友圈
 * 参考：原始ShareMessage.ts
 */

import { _decorator, Component, Node, EventTouch, CCString, randomRangeInt, game, Game } from 'cc';
import { WECHAT } from 'cc/env';

// 微信API类型声明
declare const wx: any;

const { ccclass, property } = _decorator;

@ccclass('ShareMessage')
export class ShareMessage extends Component {
    // ==================== 分享配置 ====================
    @property({ tooltip: '启用点击分享功能' })
    enableClickShare: boolean = true;

    @property([CCString])
    shareTitles: Array<string> = [
        '分享你一个超有趣的游戏！',
        '快来挑战这个刺激的游戏！',
        '这个游戏太好玩了，推荐给你！',
        '一起来玩这个精彩的游戏吧！'
    ];

    @property({ tooltip: '分享图片URL' })
    shareImageUrl: string = '';

    @property({ tooltip: '分享按钮节点（如果不设置则使用当前节点）' })
    shareButtonNode: Node | null = null;

    // ==================== 私有属性 ====================
    private isShareInitialized: boolean = false;

    /**
     * 组件加载
     */
    onLoad() {
        this.initShare();
    }

    /**
     * 初始化分享功能
     */
    private initShare(): void {
        if (!WECHAT) {
            console.log('ShareMessage: 非微信环境，跳过分享初始化');
            return;
        }

        // 设置分享按钮点击事件
        if (this.enableClickShare) {
            const targetNode = this.shareButtonNode || this.node;
            targetNode.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
                event.target.pauseSystemEvents();
                this.shareAppMessage();
                this.scheduleOnce(() => {
                    event.target.resumeSystemEvents();
                }, 1);
            });
        }

        // 注册全局分享事件
        this.registerGlobalShareEvents();
        
        this.isShareInitialized = true;
        console.log('ShareMessage: 分享功能初始化完成');
    }

    /**
     * 注册全局分享事件
     */
    private registerGlobalShareEvents(): void {
        // 显示分享菜单
        wx.showShareMenu({ 
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        });
        
        // 注册分享给朋友
        wx.onShareAppMessage(() => {
            const title = this.getRandomShareTitle();
            return {
                title: title,
                imageUrl: this.shareImageUrl
            };
        });

        // 注册分享到朋友圈
        wx.onShareTimeline(() => {
            const title = this.getRandomShareTitle();
            return {
                title: title,
                imageUrl: this.shareImageUrl
            };
        });
    }

    /**
     * 获取随机分享标题
     */
    private getRandomShareTitle(): string {
        if (this.shareTitles.length === 0) {
            return '分享你一个超有趣的游戏！';
        }
        return this.shareTitles[randomRangeInt(0, this.shareTitles.length)];
    }

    /**
     * 分享给朋友
     */
    public shareAppMessage(): void {
        if (!WECHAT) {
            console.log('ShareMessage: 非微信环境，模拟分享成功');
            this.onShareSuccess();
            return;
        }

        const title = this.getRandomShareTitle();
        wx.shareAppMessage({
            title: title,
            imageUrl: this.shareImageUrl
        });
        
        console.log('ShareMessage: 触发分享，标题:', title);
    }

    /**
     * 分享成功回调
     */
    private onShareSuccess(): void {
        console.log('ShareMessage: 分享成功');
        // 可以在这里添加分享成功的奖励逻辑
        // 例如：触发分享奖励事件
    }

    /**
     * 设置分享标题
     * @param titles 分享标题数组
     */
    public setShareTitles(titles: string[]): void {
        this.shareTitles = titles;
        console.log('ShareMessage: 分享标题已更新');
    }

    /**
     * 设置分享图片
     * @param imageUrl 分享图片URL
     */
    public setShareImage(imageUrl: string): void {
        this.shareImageUrl = imageUrl;
        console.log('ShareMessage: 分享图片已更新');
    }

    /**
     * 添加分享标题
     * @param title 新的分享标题
     */
    public addShareTitle(title: string): void {
        this.shareTitles.push(title);
        console.log('ShareMessage: 添加分享标题:', title);
    }

    /**
     * 清除所有分享标题
     */
    public clearShareTitles(): void {
        this.shareTitles = [];
        console.log('ShareMessage: 所有分享标题已清除');
    }

    /**
     * 获取当前分享标题数量
     */
    public getShareTitleCount(): number {
        return this.shareTitles.length;
    }

    /**
     * 检查分享功能是否已初始化
     */
    public checkShareInitialized(): boolean {
        return this.isShareInitialized;
    }

    /**
     * 手动触发分享（不依赖点击事件）
     */
    public triggerShare(): void {
        this.shareAppMessage();
    }

    /**
     * 组件销毁时清理
     */
    onDestroy() {
        // 移除事件监听
        if (this.shareButtonNode) {
            this.shareButtonNode.off(Node.EventType.TOUCH_END);
        }
        this.node.off(Node.EventType.TOUCH_END);
    }
}

// 全局分享事件注册（游戏启动时）
game.on(Game.EVENT_GAME_INITED, () => {
    if (!WECHAT) {
        return;
    }

    console.log('ShareMessage: 游戏初始化完成，注册全局分享事件');
}); 