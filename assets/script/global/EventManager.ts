/**
 * 事件管理器
 * 使用观察者模式处理全局事件，避免循环引用
 */

export interface EventCallback {
    (data?: any): void;
}

export class EventManager {
    private static _instance: EventManager;
    private listeners: Map<string, EventCallback[]> = new Map();

    private constructor() { }

    public static getInstance(): EventManager {
        if (!EventManager._instance) {
            EventManager._instance = new EventManager();
        }
        return EventManager._instance;
    }

    /**
     * 注册事件监听器
     * @param eventName 事件名称
     * @param callback 回调函数
     */
    public on(eventName: string, callback: EventCallback): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName)!.push(callback);
    }

    /**
     * 移除事件监听器
     * @param eventName 事件名称
     * @param callback 回调函数
     */
    public off(eventName: string, callback: EventCallback): void {
        const callbacks = this.listeners.get(eventName);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * 触发事件
     * @param eventName 事件名称
     * @param data 事件数据
     */
    public emit(eventName: string, data?: any): void {
        const callbacks = this.listeners.get(eventName);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`EventManager: 事件回调执行错误 [${eventName}]`, error);
                }
            });
        }
    }

    /**
     * 清除所有监听器
     */
    public clear(): void {
        this.listeners.clear();
    }
}

// 预定义的事件名称
export const LoginEvents = {
    LOGIN_REQUIRED: 'login_required',           // 需要登录
    LOGIN_STARTED: 'login_started',             // 开始登录
    LOGIN_SUCCESS: 'login_success',             // 登录成功
    LOGIN_FAILED: 'login_failed',               // 登录失败
    LOGIN_COMPLETED: 'login_completed',         // 登录完成
    TOKEN_EXPIRED: 'token_expired',             // Token过期
    SILENT_LOGIN_STARTED: 'silent_login_started', // 静默登录开始
    SILENT_LOGIN_SUCCESS: 'silent_login_success', // 静默登录成功
    SILENT_LOGIN_FAILED: 'silent_login_failed'    // 静默登录失败

} as const;

export const NetEvents = {
    /**显示网络遮罩 */
    NET_SHOW_BLOCKER: 'NET_SHOW_BLOCKER',
    /**显示网络对话框 */
    NET_SHOW_MESSAGE: 'NET_SHOW_MESSAGE',
    /**隐藏网络遮罩及对话框 */
    NET_HIDE: 'NET_HIDE',
    // /**隐藏网络对话框 */
    // NET_HIDE_MESSAGE: 'NET_HIDE_MESSAGE',

} as const;

export const ChatEvents = {
    CHAT_CONNECT: 'chat_connect',
    CHAT_CONNECTED: 'chat_connected',
    CHAT_DISCONNECTED: 'chat_disconnected',
    CHAT_ERROR: 'chat_error',
    CHAT_MESSAGE_RECEIVED: 'chat_message_received',
    CHAT_SEND: 'chat_send'
} as const;
