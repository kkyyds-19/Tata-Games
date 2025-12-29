import { _decorator, director } from 'cc';
const { ccclass } = _decorator;

/**
 * 用户游戏设置数据结构
 */
export interface UserGameSettings {
    autoPartner: boolean;       // 是否伙伴自动
    showDamageNumbers: boolean; // 是否显示伤害数字
    showEffects: boolean;       // 是否显示特效
    highQuality: boolean;       // 是否高画质
}

/**
 * 用户设置管理类（全局单例）
 * 管理用户的游戏设置，包括自动伙伴、特效开关、画质等
 */
@ccclass('UserSettings')
export class UserSettings {
    private static _instance: UserSettings = null;

    private _settings: UserGameSettings = null;

    // 存储键名
    private static readonly STORAGE_KEY = 'knight_user_settings';

    private constructor() {
        // 从本地存储加载设置
        this.loadFromLocalStorage();
        
        // 如果没有加载到数据，则使用默认设置
        if (!this._settings) {
            this.initDefaultSettings();
        }
    }

    public static getInstance(): UserSettings {
        if (!this._instance) {
            this._instance = new UserSettings();
        }
        return this._instance;
    }

    /**
     * 初始化默认设置
     */
    private initDefaultSettings(): void {
        this._settings = {
            autoPartner: true,       // 默认开启伙伴自动
            showDamageNumbers: true, // 默认显示伤害数字
            showEffects: true,       // 默认显示特效
            highQuality: true        // 默认高画质
        };
        console.log('UserSettings: 使用默认设置初始化');
    }

    /**
     * 获取完整设置
     */
    public getSettings(): UserGameSettings {
        return { ...this._settings };
    }

    /**
     * 设置完整设置
     */
    public setSettings(settings: Partial<UserGameSettings>): void {
        this._settings = { ...this._settings, ...settings };
        this.saveToLocalStorage();
        this.emitSettingsChangeEvent();
    }

    // ========== 伙伴自动设置 ==========

    /**
     * 获取伙伴自动设置
     */
    public getAutoPartner(): boolean {
        return this._settings.autoPartner;
    }

    /**
     * 设置伙伴自动
     */
    public setAutoPartner(enabled: boolean): void {
        this._settings.autoPartner = enabled;
        this.saveToLocalStorage();
        this.emitSettingsChangeEvent();
    }

    /**
     * 切换伙伴自动设置
     */
    public toggleAutoPartner(): boolean {
        this.setAutoPartner(!this._settings.autoPartner);
        return this._settings.autoPartner;
    }

    // ========== 伤害数字显示设置 ==========

    /**
     * 获取伤害数字显示设置
     */
    public getShowDamageNumbers(): boolean {
        return this._settings.showDamageNumbers;
    }

    /**
     * 设置伤害数字显示
     */
    public setShowDamageNumbers(enabled: boolean): void {
        this._settings.showDamageNumbers = enabled;
        this.saveToLocalStorage();
        this.emitSettingsChangeEvent();
    }

    /**
     * 切换伤害数字显示设置
     */
    public toggleShowDamageNumbers(): boolean {
        this.setShowDamageNumbers(!this._settings.showDamageNumbers);
        return this._settings.showDamageNumbers;
    }

    // ========== 特效显示设置 ==========

    /**
     * 获取特效显示设置
     */
    public getShowEffects(): boolean {
        return this._settings.showEffects;
    }

    /**
     * 设置特效显示
     */
    public setShowEffects(enabled: boolean): void {
        this._settings.showEffects = enabled;
        this.saveToLocalStorage();
        this.emitSettingsChangeEvent();
    }

    /**
     * 切换特效显示设置
     */
    public toggleShowEffects(): boolean {
        this.setShowEffects(!this._settings.showEffects);
        return this._settings.showEffects;
    }

    // ========== 画质设置 ==========

    /**
     * 获取高画质设置
     */
    public getHighQuality(): boolean {
        return this._settings.highQuality;
    }

    /**
     * 设置高画质
     */
    public setHighQuality(enabled: boolean): void {
        this._settings.highQuality = enabled;
        this.saveToLocalStorage();
        this.emitSettingsChangeEvent();
    }

    /**
     * 切换画质设置
     */
    public toggleHighQuality(): boolean {
        this.setHighQuality(!this._settings.highQuality);
        return this._settings.highQuality;
    }

    /**
     * 获取画质描述
     */
    public getQualityDescription(): string {
        return this._settings.highQuality ? '高画质' : '低画质';
    }

    // ========== 批量操作 ==========

   

    /**
     * 重置为默认设置
     */
    public resetToDefault(): void {
        this.initDefaultSettings();
        this.saveToLocalStorage();
        this.emitSettingsChangeEvent();
        console.log('UserSettings: 已重置为默认设置');
    }

    // ========== 数据持久化 ==========

    /**
     * 保存到本地存储
     */
    private saveToLocalStorage(): void {
        try {
            const data = JSON.stringify(this._settings);
            localStorage.setItem(UserSettings.STORAGE_KEY, data);
        } catch (error) {
            console.error('UserSettings: 保存设置失败:', error);
        }
    }

    /**
     * 从本地存储加载
     */
    private loadFromLocalStorage(): void {
        try {
            const data = localStorage.getItem(UserSettings.STORAGE_KEY);
            if (data) {
                this._settings = JSON.parse(data);
                console.log('UserSettings: 从本地存储加载设置成功');
                console.log('  设置详情:', this._settings);
            } else {
                console.log('UserSettings: 本地存储中没有设置数据');
            }
        } catch (error) {
            console.error('UserSettings: 加载设置失败:', error);
            this._settings = null;
        }
    }

    // ========== 事件系统 ==========

    /**
     * 发送设置变更事件
     */
    private emitSettingsChangeEvent(): void {
        // 发送全局设置更新事件
    }

    // ========== 工具方法 ==========

   
    /**
     * 检查性能模式（低特效 + 低画质）
     */
    public isPerformanceMode(): boolean {
        return !this._settings.showEffects && !this._settings.highQuality;
    }

    /**
     * 设置性能模式
     */
    public setPerformanceMode(enabled: boolean): void {
        if (enabled) {
            // 开启性能模式：关闭特效和高画质
            this._settings.showEffects = false;
            this._settings.highQuality = false;
        } else {
            // 关闭性能模式：开启特效和高画质
            this._settings.showEffects = true;
            this._settings.highQuality = true;
        }
        this.saveToLocalStorage();
        this.emitSettingsChangeEvent();
    }

    /**
     * 获取设置的字符串表示（调试用）
     */
    public toString(): string {
        return JSON.stringify(this._settings, null, 2);
    }

    /**
     * 清除本地存储数据（调试用）
     */
    public clearLocalStorage(): void {
        localStorage.removeItem(UserSettings.STORAGE_KEY);
        console.log('UserSettings: 本地存储数据已清除');
    }

    /**
     * 检查本地存储中的数据（调试用）
     */
    public checkLocalStorage(): void {
        const data = localStorage.getItem(UserSettings.STORAGE_KEY);
        if (data) {
            console.log('UserSettings: 本地存储中的数据:');
            console.log(JSON.parse(data));
        } else {
            console.log('UserSettings: 本地存储中没有数据');
        }
    }
} 