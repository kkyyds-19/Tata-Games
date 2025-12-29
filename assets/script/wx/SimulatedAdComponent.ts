/**
 * 模拟广告组件
 * 功能：在开发环境中模拟激励视频广告的播放
 * 包含：标题、进度条、强制关闭、领取奖励按钮
 */

import { _decorator, Component, Node, Label, Button, ProgressBar, Sprite, Color, tween, Vec3, EventHandler, UIOpacity, Prefab, director, instantiate, resources } from 'cc';
import { TimeManager } from '../game/TimeManager';

// 广告回调函数类型定义
export type AdSuccessCallback = (result: any) => void;
export type AdFailCallback = (error: any) => void;

const { ccclass, property } = _decorator;

@ccclass('SimulatedAdComponent')
export class SimulatedAdComponent extends Component {
    // ==================== UI组件引用 ====================
    @property(Label)
    titleLabel: Label = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(Label)
    progressLabel: Label = null;

    @property(Button)
    forceCloseButton: Button = null;

    @property(Button)
    claimRewardButton: Button = null;

    @property(Node)
    titleBanner: Node = null;

    // ==================== 配置参数 ====================
    @property({ tooltip: '广告播放时长（秒）' })
    adDuration: number = 3;//NOTE //10

    @property({ tooltip: '强制关闭按钮延迟显示时间（秒）' })
    forceCloseDelay: number = 1; //NOTE //3;

    @property({ tooltip: '广告完成事件' })
    onAdComplete: EventHandler[] = [];

    @property({ tooltip: '广告关闭事件' })
    onAdClose: EventHandler[] = [];

    // ==================== 私有属性 ====================
    private currentTime: number = 0;
    private isPlaying: boolean = false;
    private isCompleted: boolean = false;
    private forceCloseEnabled: boolean = false;
    private uiOpacity: UIOpacity = null;

    // 当前广告回调函数
    private currentSuccessCallback: AdSuccessCallback = null;
    private currentFailCallback: AdFailCallback = null;



    // ==================== 静态方法 ====================
    /**
     * 播放模拟广告（静态方法）
     * @param prefabPath 预制体路径
     * @param duration 广告时长
     * @param successCallback 成功回调
     * @param failCallback 失败回调
     */
    public static playAd(prefabPath: string, duration: number, successCallback?: AdSuccessCallback, failCallback?: AdFailCallback): void {
        // 加载预制体
        resources.load(prefabPath, Prefab, (err, prefab) => {
            if (err) {
                console.log('SimulatedAdComponent: 加载模拟广告预制体失败:', err);
                if (failCallback) {
                    failCallback({ error: '加载广告预制体失败' });
                }
                return;
            }

            // 创建模拟广告界面
            const simulationNode = instantiate(prefab);
            const canvas = director.getScene().getChildByName('Canvas');
            simulationNode.parent = canvas;

            // 获取模拟广告组件
            const simulatedAdComponent = simulationNode.getComponent(SimulatedAdComponent);
            if (simulatedAdComponent) {
                // 设置广告时长
                simulatedAdComponent.setAdDuration(duration);

                // 设置回调事件
                simulatedAdComponent.setCallbacks(successCallback, failCallback);

                // 开始播放
                simulatedAdComponent.startPlay();
            } else {
                // 如果没有找到组件，使用简单方式
                setTimeout(() => {
                    if (simulationNode && simulationNode.isValid) {
                        simulationNode.destroy();
                    }
                    if (successCallback) {
                        successCallback({ isEnded: true });
                    }
                }, duration * 1000);
            }
        });
    }

    /**
     * 设置回调函数
     * @param successCallback 成功回调
     * @param failCallback 失败回调
     */
    public setCallbacks(successCallback?: AdSuccessCallback, failCallback?: AdFailCallback): void {
        // 保存回调函数
        this.currentSuccessCallback = successCallback;
        this.currentFailCallback = failCallback;

        // 清空事件数组（不使用事件系统）
        this.onAdComplete = [];
        this.onAdClose = [];
    }

    /**
     * 广告完成回调（用户点击领取奖励按钮）
     */
    public onAdCompleteCallback(event: any): void {
        if (this.currentSuccessCallback) {
            this.currentSuccessCallback({ isEnded: true });
        }
        console.log('SimulatedAdComponent: 用户点击领取奖励，发放奖励');

        // 清理回调函数
        this.currentSuccessCallback = null;
        this.currentFailCallback = null;
    }

    /**
     * 广告关闭回调（用户强制关闭）
     */
    public onAdCloseCallback(event: any): void {
        if (this.currentFailCallback) {
            this.currentFailCallback({ error: '用户强制关闭广告' });
        }
        console.log('SimulatedAdComponent: 用户强制关闭广告，不发放奖励');

        // 清理回调函数
        this.currentSuccessCallback = null;
        this.currentFailCallback = null;
    }

    // ==================== 原有方法 ====================
    /**
     * 组件加载
     */
    onLoad() {

        this.node.on(Node.EventType.TOUCH_START, () => {
            console.log('SimulatedAdComponent: 用户点击广告');
        })
        this.initializeUI();
        this.setupButtonEvents();
    }

    /**
     * 初始化UI
     */
    private initializeUI(): void {
        // 设置标题
        if (this.titleLabel) {
            this.titleLabel.string = '模拟广告';
        }

        // 初始化进度条
        if (this.progressBar) {
            this.progressBar.progress = 0;
        }

        // 初始化进度文本
        if (this.progressLabel) {
            this.progressLabel.string = '播放进度';
        }

        // 初始化按钮状态
        if (this.forceCloseButton) {
            this.forceCloseButton.interactable = false;
            this.forceCloseButton.node.active = false;
        }

        if (this.claimRewardButton) {
            this.claimRewardButton.node.active = false;
        }

        // 获取或添加UIOpacity组件
        this.uiOpacity = this.node.getComponent(UIOpacity);
        if (!this.uiOpacity) {
            this.uiOpacity = this.node.addComponent(UIOpacity);
        }

        // 设置初始透明度
        this.uiOpacity.opacity = 0;
    }

    /**
     * 设置按钮事件
     */
    private setupButtonEvents(): void {
        if (this.forceCloseButton) {
            this.forceCloseButton.node.on(Button.EventType.CLICK, this.onForceClose, this);
        }

        if (this.claimRewardButton) {
            this.claimRewardButton.node.on(Button.EventType.CLICK, this.onClaimReward, this);
        }
    }

    /**
     * 开始播放模拟广告
     */
    public startPlay(): void {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.currentTime = 0;
        this.isCompleted = false;
        this.forceCloseEnabled = false;

        // 显示广告界面
        this.showAd();

        // 开始进度更新
        this.schedule(this.updateProgress, 0.1);

        // 延迟启用强制关闭按钮
        this.scheduleOnce(() => {
            this.enableForceClose();
        }, this.forceCloseDelay);

        console.log('SimulatedAdComponent: 开始播放模拟广告');
    }

    /**
     * 显示广告界面
     */
    private showAd(): void {
        TimeManager.getInstance().pause();
        // 淡入动画
        tween(this.uiOpacity)
            .to(0.3, { opacity: 255 })
            .call(() => {
                // 暂停游戏时间
                // TimeManager.getInstance().pause();
            })
            .start();
    }

    /**
     * 更新进度
     */
    private updateProgress(): void {
        if (!this.isPlaying) return;

        // 如果游戏时间没有暂停，则暂停
        if (!TimeManager.getInstance().isPaused()) {
            TimeManager.getInstance().pause();
            return;
        }

        this.currentTime += 0.1;
        const progress = Math.min(this.currentTime / this.adDuration, 1.0);

        // 更新进度条
        if (this.progressBar) {
            this.progressBar.progress = progress;
        }

        // 更新进度文本 - 显示剩余秒数
        if (this.progressLabel) {
            const remainingSeconds = Math.max(0, this.adDuration - this.currentTime);
            this.progressLabel.string = `播放进度 ${remainingSeconds.toFixed(1)}s`;
        }

        // 检查是否播放完成
        if (progress >= 1.0 && !this.isCompleted) {
            this.onAdPlayComplete();
        }
    }

    /**
     * 广告播放完成
     */
    private onAdPlayComplete(): void {
        this.isCompleted = true;
        this.isPlaying = false;

        // 隐藏强制关闭按钮
        if (this.forceCloseButton) {
            this.forceCloseButton.node.active = false;
            this.forceCloseEnabled = false;
        }

        // 启用领取奖励按钮
        if (this.claimRewardButton) {
            this.claimRewardButton.node.active = true;
        }

        // 更新进度文本
        if (this.progressLabel) {
            this.progressLabel.string = '播放完成';
        }

        console.log('SimulatedAdComponent: 广告播放完成');
    }

    /**
     * 启用强制关闭按钮
     */
    private enableForceClose(): void {
        if (this.forceCloseButton) {
            this.forceCloseButton.interactable = true;
            this.forceCloseButton.node.active = true;
            this.forceCloseEnabled = true;
        }
    }

    /**
     * 强制关闭按钮点击事件
     */
    private onForceClose(): void {
        if (!this.forceCloseEnabled) return;

        console.log('SimulatedAdComponent: 用户强制关闭广告');
        this.closeAd(false); // false表示未完整播放
    }

    /**
     * 领取奖励按钮点击事件
     */
    private onClaimReward(): void {
        if (!this.isCompleted) return;

        console.log('SimulatedAdComponent: 用户领取奖励');
        this.closeAd(true); // true表示完整播放
    }

    /**
     * 关闭广告
     * @param isCompleted 是否完整播放
     */
    private closeAd(isCompleted: boolean): void {
        this.isPlaying = false;
        this.unschedule(this.updateProgress);

        // 恢复游戏时间
        TimeManager.getInstance().resume();

        // 淡出动画
        tween(this.uiOpacity)
            .to(0.3, { opacity: 0 })
            .call(() => {
                // 触发相应事件
                if (isCompleted) {
                    this.onAdCompleteCallback({ isEnded: true });
                } else {
                    this.onAdCloseCallback({ isEnded: false });
                }

                // 销毁节点
                this.node.destroy();
            })
            .start();
    }

    /**
     * 设置广告时长
     * @param duration 时长（秒）
     */
    public setAdDuration(duration: number): void {
        this.adDuration = Math.max(1, duration);
    }

    /**
     * 设置强制关闭延迟
     * @param delay 延迟时间（秒）
     */
    public setForceCloseDelay(delay: number): void {
        this.forceCloseDelay = Math.max(0, delay);
    }

    /**
     * 检查是否正在播放
     */
    public isAdPlaying(): boolean {
        return this.isPlaying;
    }

    /**
     * 检查是否播放完成
     */
    public isAdCompleted(): boolean {
        return this.isCompleted;
    }

    /**
     * 获取当前播放进度
     */
    public getCurrentProgress(): number {
        return this.currentTime / this.adDuration;
    }

    /**
     * 组件销毁时清理
     */
    onDestroy() {
        // 取消定时器
        this.unschedule(this.updateProgress);

        // 确保恢复游戏时间
        TimeManager.getInstance().resume();
    }
} 