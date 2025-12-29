import { HttpClient } from "../http/HttpClient";
import { getAPIConfig, validateAPIParameters, buildRequestURL, APIConfig } from "../global/config/APIConfig";
import { isResponseSuccess, getResponseError } from "./APITypes";

/**
 * API 基类，提供通用的请求处理逻辑
 */
export class BaseAPI {
    protected httpClient: HttpClient;

    constructor() {
        this.httpClient = HttpClient.getInstance();
    }

    /**
     * 处理 API 响应
     * @param result API 响应结果
     * @param errorMessage 错误信息
     * @returns Promise<any>
     */
    protected handleResponse(result: any, errorMessage: string): Promise<any> {
        if (result.success) {
            // 服务器返回的格式是 {code: 200, data: [...], msg: null}
            const serverResponse = result.data;
            
            // 检查服务器响应状态码
            if (serverResponse && isResponseSuccess(serverResponse)) {
                return Promise.resolve(serverResponse);
            } else {
                // 服务器返回错误
                const serverError = serverResponse ? getResponseError(serverResponse) : errorMessage;
                return Promise.reject(new Error(serverError));
            }
        } else {
            // 网络请求失败
            return Promise.reject(new Error(result.error || errorMessage));
        }
    }

    /**
     * 根据配置发送请求
     * @param apiKey API配置键名
     * @param params 请求参数
     * @param errorMessage 错误信息
     * @returns Promise<any>
     */
    protected async request(apiKey: string, params: any = {}, errorMessage: string): Promise<any> {
        const config = getAPIConfig(apiKey);
        if (!config) {
            return Promise.reject(new Error(`未找到API配置: ${apiKey}`));
        }

        // 验证参数
        const validation = validateAPIParameters(config, params);
        if (!validation.isValid) {
            return Promise.reject(new Error(`参数验证失败: ${validation.errors.join(', ')}`));
        }

        // 构建请求URL
        const url = buildRequestURL(config, params);

        // 调试日志：方法、URL、参数概览（避免日志过长）
        try {
            const sampleParams = JSON.stringify(params);
            console.debug(`[API] ${config.method} ${url} | ${apiKey} | params: ${sampleParams}`);
        } catch (_) {
            console.debug(`[API] ${config.method} ${url} | ${apiKey} | params: <unserializable>`);
        }

        // 根据配置发送请求
        let result: any;
        switch (config.method) {
            case 'GET':
                result = await this.httpClient.get(url);
                break;
            case 'POST':
                const body = config.paramType === 'body-json' ? params : null;
                result = await this.httpClient.post(url, body);
                break;
            case 'PUT':
                const putBody = config.paramType === 'body-json' ? params : null;
                result = await this.httpClient.put(url, putBody);
                break;
            case 'DELETE':
                result = await this.httpClient.delete(url);
                break;
            default:
                return Promise.reject(new Error(`不支持的HTTP方法: ${config.method}`));
        }

        return this.handleResponse(result, errorMessage);
    }

    /**
     * 发送 GET 请求（兼容旧接口）
     * @param url 请求 URL
     * @param errorMessage 错误信息
     * @returns Promise<any>
     */
    protected get(url: string, errorMessage: string): Promise<any> {
        return this.httpClient.get(url)
            .then(result => this.handleResponse(result, errorMessage));
    }

    /**
     * 发送 POST 请求（兼容旧接口）
     * @param url 请求 URL
     * @param data 请求数据
     * @param errorMessage 错误信息
     * @returns Promise<any>
     */
    protected post(url: string, data: any, errorMessage: string): Promise<any> {
        return this.httpClient.post(url, data)
            .then(result => this.handleResponse(result, errorMessage));
    }

    /**
     * 发送 PUT 请求（兼容旧接口）
     * @param url 请求 URL
     * @param data 请求数据
     * @param errorMessage 错误信息
     * @returns Promise<any>
     */
    protected put(url: string, data: any, errorMessage: string): Promise<any> {
        return this.httpClient.put(url, data)
            .then(result => this.handleResponse(result, errorMessage));
    }
}