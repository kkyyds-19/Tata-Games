import { _decorator, Component, find } from 'cc';
import { ShowToast } from '../global/Toast';
const { ccclass } = _decorator;

/**
 * TimeManager - 游戏时间管理器
 * 
 * 倍速配置示例：
 * - 默认配置: [1, 1.5, 2, 2.5, 3, 3.5, 4]
 * - 简化配置: [1, 2, 4, 8]
 * - 详细配置: [0.5, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 8]
 * 
 * 修改方法：
 * 1. 直接修改 _speedOptions 数组
 * 2. 运行时调用 setSpeedOptions(newArray)
 */
@ccclass('TimeManager')
export class TimeManager {
    private static _instance: TimeManager;
    private _timeScale: number = 1.0;
    private _isPaused: boolean = false;
    private _previousTimeScale: number = 1.0; // 记录暂停前的速度
    
    // 🎮 倍速配置数组 - 可以随时修改这个数组来调整倍速选项
    // 示例配置：
    // private _speedOptions: number[] = [1, 2, 4, 8];              // 简化版本
    // private _speedOptions: number[] = [0.5, 1, 2, 3, 5];        // 包含慢速
    private _speedOptions: number[] = [1, 1.5, 2, 2.5, 3]; // 默认配置
    private _currentSpeedIndex: number = 0; // 当前倍速在数组中的索引
    private readonly THIRTY_DAYS_MS: number = 30 * 24 * 60 * 60 * 1000;

    public static getInstance(): TimeManager {
        if (!TimeManager._instance) {
            TimeManager._instance = new TimeManager();
        }
        return TimeManager._instance;
    }

    /**
     * 设置时间缩放
     * @param scale 时间缩放值，0为暂停，1为正常速度
     */
    public setTimeScale(scale: number): void {
        // 如果不是暂停，记录当前速度作为之前的速度
        if (scale > 0 && this._timeScale > 0) {
            this._previousTimeScale = this._timeScale;
        }
        
        this._timeScale = Math.max(0, scale);
        this._isPaused = this._timeScale === 0;
        
        // 更新当前速度索引
        const index = this._speedOptions.indexOf(scale);
        if (index !== -1) {
            this._currentSpeedIndex = index;
        }
        
        console.log(`TimeScale set to: ${this._timeScale}`);
    }

    /**
     * 设置倍速选项数组（允许动态配置倍速选项）
     * @param speedOptions 倍速选项数组
     */
    public setSpeedOptions(speedOptions: number[]): void {
        this._speedOptions = [...speedOptions];
        this._currentSpeedIndex = 0;
        this.setTimeScale(this._speedOptions[0]);
    }

    /**
     * 获取当前倍速选项数组
     */
    public getSpeedOptions(): number[] {
        return [...this._speedOptions];
    }

    /**
     * 暂停游戏
     */
    public pause(): void {
        if (this._timeScale > 0) {
            this._previousTimeScale = this._timeScale;
        }
        this.setTimeScale(0);
    }

    /**
     * 恢复游戏（恢复到暂停前的速度）
     */
    public resume(): void {
        // 检查dialog_container中是否有激活的弹窗
        const dialog_container = find('Canvas/dialog_container');
        if (dialog_container) {
            // 遍历所有子节点，发现激活的弹窗就直接返回
            for (let i = 0; i < dialog_container.children.length; i++) {
                const child = dialog_container.children[i];
                if (child.active) {
                    console.log('[TimeManager] 检测到激活的弹窗，不能恢复游戏:', child.name);
                    return;
                }
            }
        }
        
        // 没有激活的弹窗，可以恢复游戏
        this.setTimeScale(this._previousTimeScale);
    }

    /**
     * 恢复到正常速度（强制设置为1倍速）
     */
    public resumeToNormal(): void {
        this._currentSpeedIndex = 0;
        this.setTimeScale(this._speedOptions[0]);
    }

    /**
     * 设置 2 倍速
     */
    public setDoubleSpeed(): void {
        const index = this._speedOptions.findIndex(speed => speed >= 1.5);
        if (index !== -1) {
            this._currentSpeedIndex = index;
            this.setTimeScale(this._speedOptions[index]);
        }
    }

    /**
     * 设置 0.5 倍速（慢动作）
     */
    public setHalfSpeed(): void {
        this.setTimeScale(0.5);
    }

   

   

    /**
     * 切换到下一个倍速
     */
    public toggleSpeed(): void {
        const nextIndex = (this._currentSpeedIndex + 1) % this._speedOptions.length;
        const desiredSpeed = this._speedOptions[nextIndex];

        // 允许索引前进到3倍速，但未开通时不改变当前时间缩放
        if (desiredSpeed > 2 && !this.isMonthlyPassActive(1)) {
            this._currentSpeedIndex = nextIndex; // 索引前进到3x
            ShowToast('三倍速需开通月卡');
            return; // 保持当前倍速（例如仍为2x）
        }

        this._currentSpeedIndex = nextIndex;
        this.setTimeScale(desiredSpeed);
        console.log(`切换到 ${desiredSpeed}x 倍速`);
    }

    /**
     * 切换到上一个倍速
     */
    public toggleSpeedReverse(): void {
        const prevIndex = this._currentSpeedIndex === 0 
            ? this._speedOptions.length - 1 
            : this._currentSpeedIndex - 1;
        const desiredSpeed = this._speedOptions[prevIndex];

        if (desiredSpeed > 2 && !this.isMonthlyPassActive(1)) {
            this._currentSpeedIndex = prevIndex; // 索引后退到3x
            ShowToast('三倍速需开通月卡');
            return; // 保持当前倍速
        }

        this._currentSpeedIndex = prevIndex;
        this.setTimeScale(desiredSpeed);
        console.log(`切换到 ${desiredSpeed}x 倍速`);
    }

    /**
     * 直接设置倍速索引
     * @param index 倍速数组的索引
     */
    public setSpeedByIndex(index: number): void {
        if (index >= 0 && index < this._speedOptions.length) {
            const speed = this._speedOptions[index];
            if (speed > 2 && !this.isMonthlyPassActive(1)) {
                ShowToast('三倍速需开通月卡');
                return;
            }
            this._currentSpeedIndex = index;
            this.setTimeScale(speed);
        }
    }

    /**
     * 获取当前倍速索引
     */
    public getCurrentSpeedIndex(): number {
        return this._currentSpeedIndex;
    }

    /**
     * 获取当前时间缩放
     */
    public getTimeScale(): number {
        return this._timeScale;
    }

    /**
     * 是否暂停
     */
    public isPaused(): boolean {
        return this._isPaused;
    }

    /**
     * 获取缩放后的deltaTime
     * @param dt 原始deltaTime
     * @returns 缩放后的deltaTime
     */
    public getDeltaTime(dt: number): number {
        return dt * this._timeScale;
    }

    /**
     * 获取缩放后的时间
     * @param time 原始时间
     * @returns 缩放后的时间
     */
    public getScaledTime(time: number): number {
        return time * this._timeScale;
    }

    /**
     * 获取暂停前的速度
     */
    public getPreviousTimeScale(): number {
        return this._previousTimeScale;
    }

    /**
     * 获取当前速度的显示文本
     */
    public getSpeedText(): string {
        if (this._timeScale === 0) {
            return '暂停';
        } else if (this._timeScale === 0.5) {
            return '0.5x';
        } else if (this._timeScale % 1 === 0) {
            // 整数倍速
            return `${this._timeScale}x`;
        } else {
            // 小数倍速
            return `${this._timeScale}x`;
        }
    }

    /**
     * 获取当前速度的颜色（用于UI显示）
     */
    public getSpeedColor(): string {
        if (this._timeScale === 0) {
            return '#FF0000'; // 红色 - 暂停
        } else if (this._timeScale < 1) {
            return '#FFA500'; // 橙色 - 慢速
        } else {
            // 根据在倍速数组中的位置动态分配颜色
            const colors = [
                '#00FF00', // 绿色 - 第1档 (通常是1x)
                '#00BFFF', // 蓝色 - 第2档 
                '#FF69B4', // 粉色 - 第3档
                '#FFD700', // 金色 - 第4档
                '#FF4500', // 橙红色 - 第5档
                '#9370DB', // 紫色 - 第6档
                '#DC143C'  // 深红色 - 第7档及以上
            ];
            
            const colorIndex = Math.min(this._currentSpeedIndex, colors.length - 1);
            return colors[colorIndex];
        }
    }

    private isMonthlyPassActive(index: number): boolean {
        const key = 'MonthlyPass.purchaseTime.' + index;
        const last = parseInt(localStorage.getItem(key) || '0');
        if (!last) return false;
        return (Date.now() - last) < this.THIRTY_DAYS_MS;
    }
}
