import { sys } from "cc";
import { UserInfoData } from "../user/UserInfoData";
import { director } from "cc";
import { game } from "cc";
import { NetworkConfig } from "../global/config/NetworkConfig";
import { ShowToast } from "../global/Toast";
import { LoginConfig } from "../global/config/LoginConfig";
import { EventManager, LoginEvents } from "../global/EventManager";

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    timeout?: number;
    body?: any;
}

interface RequestResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
}

export class HttpClient {
    private static instance: HttpClient;
    private baseUrl: string = '';
    private eventManager: EventManager;

    private constructor() {
        this.eventManager = EventManager.getInstance();
        this.setupEventListeners();
    }

    public static getInstance(): HttpClient {
        if (!HttpClient.instance) {
            HttpClient.instance = new HttpClient();
        }
        return HttpClient.instance;
    }
    public int() {
        this.baseUrl = NetworkConfig.API_URL;
    }

    public setBaseUrl(url: string): void {
        this.baseUrl = url;
    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners(): void {
        // 监听登录请求事件
        this.eventManager.on(LoginEvents.LOGIN_STARTED, this.handleLoginRequest.bind(this));
    }

    /**
     * 处理登录请求事件
     */
    private async handleLoginRequest(data: any): Promise<void> {
        try {
            const { type, endpoint, method, onSuccess, onError } = data;
            let requestData: any;
            let requestMethod = method || 'POST';

            if (type === 'wechat') {
                // 微信登录使用GET请求，code作为查询参数
                const code = data.code;
                const urlWithCode = `${endpoint}?code=${code}`;
                console.log('HttpClient: 发送微信登录GET请求', {
                    url: urlWithCode,
                    method: requestMethod
                });

                const result = await this.get(urlWithCode);

                console.log('HttpClient: 微信登录请求响应', result);
                console.log('HttpClient: 微信登录响应详情', {
                    success: result.success,
                    hasData: !!result.data,
                    dataType: typeof result.data,
                    dataKeys: result.data ? Object.keys(result.data) : [],
                    fullData: result.data
                });

                if (result.success) {
                    console.log('HttpClient: 调用微信登录成功回调，传递数据:', result.data);
                    onSuccess?.(result.data);
                } else {
                    const errorMessage = result.error || '微信登录请求失败';
                    console.error('HttpClient: 微信登录请求失败', errorMessage);
                    onError?.(errorMessage);
                }
                return;
            } else if (type === 'getUserInfo') {
                // 获取用户信息使用GET请求
                console.log('HttpClient: 发送获取用户信息GET请求', {
                    url: endpoint,
                    method: requestMethod
                });

                const result = await this.get(endpoint);

                console.log('HttpClient: 获取用户信息请求响应', result);

                if (result.success) {
                    onSuccess?.(result.data);
                } else {
                    const errorMessage = result.error || '获取用户信息请求失败';
                    console.error('HttpClient: 获取用户信息请求失败', errorMessage);
                    onError?.(errorMessage);
                }
                return;
            } else if (type === 'web') {
                requestData = data.data;
                requestMethod = 'POST';
            } else if (type === 'smslogin') {
                requestData = data.data;
                requestMethod = 'POST';
            } else if (type === 'logincode') {
                requestData = data.data;
                requestMethod = 'POST';
            }

            console.log('HttpClient: 发送登录请求', {
                endpoint: endpoint,
                type: type,
                method: requestMethod,
                data: requestData
            });

            let result;
            if (requestMethod === 'GET') {
                result = await this.get(endpoint);
            } else {
                result = await this.post(endpoint, requestData);
            }

            console.log('HttpClient: 登录请求响应', result);

            if (result.success) {
                onSuccess?.(result.data);
            } else {
                const errorMessage = result.error || '登录请求失败';
                console.error('HttpClient: 登录请求失败', errorMessage);
                onError?.(errorMessage);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '网络请求异常';
            console.error('HttpClient: 处理登录请求失败', errorMessage);
            data.onError?.(errorMessage);
        }
    }

    public async request<T>(url: string, options: RequestOptions = {}): Promise<RequestResult<T>> {
        // 检查是否需要认证 - 登录相关请求不需要认证检查
        const isLoginRequest = url === LoginConfig.endpoints.login ||
            url === LoginConfig.endpoints.register ||
            url === LoginConfig.endpoints.wxLogin ||
            url === LoginConfig.endpoints.smslogin ||
            url === LoginConfig.endpoints.logincode ||
            url.startsWith(LoginConfig.endpoints.wxLogin + '?'); // 包含查询参数的微信登录

        const isAuthRequired = !isLoginRequest;

        if (isAuthRequired) {
            const bearer = UserInfoData.getInstance().getBearer();
            if (!bearer || bearer.trim() === '') {
                const loginSuccess = await this.checkAndRefreshLoginIfNeeded();
                if (!loginSuccess) {
                    return { success: false, error: '请先登录' };
                }
            }
        }

        const { method = 'GET', headers = {}, timeout = 50000, body = null } = options;

        // 智能调整URL和请求体
        let finalUrl = this.baseUrl + url;
        let finalBody = body;

        // 如果是GET 或者 put 请求且有body参数，将body转换为Query参数
        if ((method.toUpperCase() === 'GET' || method.toUpperCase() === 'PUT') && body) {
            const queryParams = new URLSearchParams();
            for (const key in body) {
                if (body[key] !== undefined && body[key] !== null) {
                    queryParams.append(key, body[key].toString());
                }
            }
            const queryString = queryParams.toString();
            if (queryString) {
                finalUrl += (url.includes('?') ? '&' : '?') + queryString;
            }
            finalBody = null; // GET请求不应该有请求体
        }

        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, finalUrl, true);
            xhr.timeout = timeout;

            // Set default headers
            xhr.setRequestHeader('Content-Type', 'application/json');

            // 添加认证头 - 只有非登录请求才添加
            if (isAuthRequired) {
                const currentBearer = UserInfoData.getInstance().getBearer();
                if (currentBearer) {
                    xhr.setRequestHeader('Authorization', `Bearer ${currentBearer}`);
                }
            }

            for (const key in headers) {
                xhr.setRequestHeader(key, headers[key]);
            }

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const responseData = JSON.parse(xhr.responseText);

                            // 只有非登录相关的请求才调用 handleResponseError，避免死循环
                            if (isAuthRequired) {
                                this.handleResponseError(responseData);
                            }

                            resolve({ success: true, data: responseData, statusCode: xhr.status });
                        } catch (e) {
                            resolve({ success: false, error: 'Failed to parse JSON response', statusCode: xhr.status });
                        }
                    } else {
                        resolve({ success: false, error: `Request failed with status: ${xhr.status}`, statusCode: xhr.status });
                    }
                }
            };

            xhr.ontimeout = () => {
                console.error(`HttpClient: 请求超时 - URL: ${finalUrl}, 超时时间: ${timeout}ms`);
                resolve({ success: false, error: 'Request timed out' });
            };

            xhr.onerror = () => {
                console.error(`HttpClient: 网络错误 - URL: ${finalUrl}, 状态: ${xhr.status}, 状态文本: ${xhr.statusText}`);
                resolve({ success: false, error: 'Network error' });
            };

            const requestBody = finalBody ? JSON.stringify(finalBody) : null;
            xhr.send(requestBody);
        });
    }

    public get<T>(url: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<RequestResult<T>> {
        return this.request<T>(url, { ...options, method: 'GET' });
    }

    public post<T>(url: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<RequestResult<T>> {
        return this.request<T>(url, { ...options, method: 'POST', body });
    }

    public put<T>(url: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<RequestResult<T>> {
        return this.request<T>(url, { ...options, method: 'PUT', body });
    }

    public delete<T>(url: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<RequestResult<T>> {
        return this.request<T>(url, { ...options, method: 'DELETE' });
    }

    /**
     * 检查并刷新登录状态
     */
    private async checkAndRefreshLoginIfNeeded(): Promise<boolean> {
        return new Promise((resolve) => {
            console.log('HttpClient: 检测到无登录凭证，尝试自动登录');

            // 发送静默登录事件
            this.eventManager.emit(LoginEvents.SILENT_LOGIN_STARTED, {
                onSuccess: () => {
                    console.log('HttpClient: 静默登录成功');
                    resolve(true);
                },
                onError: (error: any) => {
                    console.error('HttpClient: 静默登录失败', error);
                    resolve(false);
                }
            });
        });
    }

    /**
     * 处理响应错误
     * 使用 SmartLoginManager 处理自动重新登录
     */
    private handleResponseError(responseData: any): void {
        const { code, msg } = responseData;

        // 只处理 code 为 201 的响应
        if (code !== 201) return;

        if (msg != null) {
            // 处理登录凭证失效的情况
            if (msg === '登录凭证已失效，请重新登录') {
                this.handleTokenExpired();
            }

            // 显示错误消息
            ShowToast(msg);
        }
    }

    /**
     * 处理 Token 过期
     * 发送事件通知需要重新登录
     */
    private async handleTokenExpired(): Promise<void> {
        console.log('HttpClient: 检测到登录凭证已失效，开始自动重新登录');

        // 清除当前无效的 token
        UserInfoData.getInstance().setBearer('');

        // 发送 Token 过期事件
        this.eventManager.emit(LoginEvents.TOKEN_EXPIRED, {
            silent: false
        });

        console.log('HttpClient: 已发送 Token 过期事件');
    }
} 
