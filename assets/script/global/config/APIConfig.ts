/**
 * API 配置
 * 定义所有API端点的配置信息
 */

export interface APIParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object';
    required: boolean;
    description?: string;
    defaultValue?: any;
}

export interface APIConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    paramType: 'query' | 'body-json' | 'path';
    parameters?: APIParameter[];
    description?: string;
}

// 从模块化配置中导入合并后的配置
import { APIConfigs as MergedAPIConfigs } from './api/index';
export const APIConfigs = MergedAPIConfigs;

/**
 * 获取API配置
 * @param apiKey API配置键名
 * @returns APIConfig | null
 */
export function getAPIConfig(apiKey: string): APIConfig | null {
    return APIConfigs[apiKey] || null;
}

/**
 * 验证API参数
 * @param config API配置
 * @param params 请求参数
 * @returns 验证结果
 */
export function validateAPIParameters(config: APIConfig, params: any): { isValid: boolean, errors: string[] } {
    const errors: string[] = [];
    
    if (!config.parameters) {
        return { isValid: true, errors: [] };
    }

    for (const param of config.parameters) {
        if (param.required) {
            if (params[param.name] === undefined || params[param.name] === null) {
                errors.push(`缺少必需参数: ${param.name}`);
            }
        }
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * 构建请求URL
 * @param config API配置
 * @param params 请求参数
 * @returns 完整的请求URL
 */
export function buildRequestURL(config: APIConfig, params: any): string {
    let url = config.url;
    
    // 处理路径参数
    if (config.paramType === 'path' && config.parameters) {
        for (const param of config.parameters) {
            const placeholder = `{${param.name}}`;
            if (url.includes(placeholder)) {
                const value = params[param.name];
                if (value !== undefined && value !== null) {
                    url = url.replace(placeholder, encodeURIComponent(value.toString()));
                }
            }
        }
    }
    
    // 处理查询参数
    if (config.paramType === 'query' && config.parameters) {
        const queryParams: string[] = [];
        for (const param of config.parameters) {
            const value = params[param.name];
            if (value !== undefined && value !== null) {
                queryParams.push(`${param.name}=${encodeURIComponent(value.toString())}`);
            }
        }
        if (queryParams.length > 0) {
            url += (url.includes('?') ? '&' : '?') + queryParams.join('&');
        }
    }
    
    return url;
} 