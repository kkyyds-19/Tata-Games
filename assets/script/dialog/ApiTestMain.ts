import { _decorator, Component, Node, EditBox, Button, Label, Toggle, ToggleContainer, instantiate } from 'cc';
import { HttpClient } from '../http/HttpClient';
import { getClipboardText, setClipboardText } from '../utils/clipboard-utils';
import { ShowToast } from '../global/Toast';
import { Prefab } from 'cc';
import { APIConfigs, APIConfig } from '../global/config/APIConfig';
import { ApiTestItem, ApiTestCallback } from './ApiTestItem';
import { Layout } from 'cc';

const { ccclass, property } = _decorator;

/**
 * HTTP方法枚举
 */
enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    DELETE = 'DELETE'
}

/**
 * 参数形式枚举
 */
enum ParamType {
    QUERY = 'query',
    BODY = 'body-json',
    PATH = 'path'
}

/**
 * API测试主类
 * 提供完整的API测试功能，包括URL输入、参数配置、请求发送和结果显示
 */
@ccclass('ApiTestMain')
export class ApiTestMain extends Component {

    // --- UI 组件 ---

    @property(EditBox)
    public urlEditBox: EditBox = null!;

    @property(EditBox)
    public paramsEditBox: EditBox = null!;

    @property(Button)
    public pasteParamsButton: Button = null!;

    @property(ToggleContainer)
    public methodToggleGroup: ToggleContainer = null!;

    @property(ToggleContainer)
    public paramTypeToggleGroup: ToggleContainer = null!;

    @property(Button)
    public sendButton: Button = null!;

    @property(Button)
    public copyResultButton: Button = null!;

    @property(Label)
    public statusLabel: Label = null!;

    @property(Label)
    public resultLabel: Label = null!;



    @property(Prefab)
    public apiTestItemPrefab: Prefab = null!;

    @property(Node)
    public apiTestItemContainer: Node = null!;

    //自定义测试页面
    @property(Node)
    public customTestPage: Node = null!;
    //列表测试页面
    @property(Node)
    public listTestPage: Node = null!;

    //  页面切换按钮
    @property(Button)
    public customTestButton: Button = null!;
   
    

    // --- 私有属性 ---
    private httpClient: HttpClient = null!;
    private selectedMethod: HttpMethod = HttpMethod.POST;
    private selectedParamType: ParamType = ParamType.QUERY;
    private isRequesting: boolean = false;
    private currentPage: 'custom' | 'list' = 'custom';
    private apiTestItems: ApiTestItem[] = [];

    onLoad() {
        this.initHttpClient();
        this.initUI();
        this.bindEvents();
    }

    show() {
        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }

    /**
     * 初始化HTTP客户端
     */
    private initHttpClient() {
        this.httpClient = HttpClient.getInstance();
        this.httpClient.int(); // 初始化基础URL
    }

    /**
     * 初始化UI
     */
    private initUI() {
        // 设置占位符
       
        if (this.urlEditBox) {
            this.urlEditBox.placeholder = '输入API路径 (如: /api/user/info 或 /api/user/{id})';
        }
        if (this.paramsEditBox) {
            this.paramsEditBox.placeholder = '输入参数 (JSON格式，Path参数: {"id": 123})';
        }

        // 初始化状态显示
        this.updateStatus('就绪');
        this.updateResult('等待发送请求...');

        // 设置默认选择
        this.selectedMethod = HttpMethod.POST;
        this.selectedParamType = ParamType.QUERY;

        // 初始化页面状态
        this.switchToPage('custom');
    }

    /**
     * 绑定事件
     */
    private bindEvents() {
        // 粘贴参数按钮
        if (this.pasteParamsButton) {
            this.pasteParamsButton.node.on(Button.EventType.CLICK, this.onPasteParamsClicked, this);
        }

        // 发送按钮
        if (this.sendButton) {
            this.sendButton.node.on(Button.EventType.CLICK, this.onSendClicked, this);
        }

        // 复制结果按钮
        if (this.copyResultButton) {
            this.copyResultButton.node.on(Button.EventType.CLICK, this.onCopyResultClicked, this);
        }

        // 页面切换按钮
        if (this.customTestButton) {
            this.customTestButton.node.on(Button.EventType.CLICK, this.onCustomTestClicked, this);
        }
       

        // HTTP方法选择 - 监听ToggleContainer的子Toggle事件
        if (this.methodToggleGroup) {
            const toggles = this.methodToggleGroup.getComponentsInChildren(Toggle);
            toggles.forEach((toggle, index) => {
                // 存储Toggle的索引信息
                (toggle as any)._toggleIndex = index;
                toggle.node.on(Toggle.EventType.TOGGLE, this.onMethodToggleChanged, this);
            });
        }

        // 参数形式选择 - 监听ToggleContainer的子Toggle事件
        if (this.paramTypeToggleGroup) {
            const toggles = this.paramTypeToggleGroup.getComponentsInChildren(Toggle);
            toggles.forEach((toggle, index) => {
                // 存储Toggle的索引信息
                (toggle as any)._toggleIndex = index;
                toggle.node.on(Toggle.EventType.TOGGLE, this.onParamTypeToggleChanged, this);
            });
        }
    }

    /**
     * HTTP方法选择改变事件
     */
    private onMethodToggleChanged(toggle: Toggle) {
        if (toggle.isChecked) {
            const toggleIndex = (toggle as any)._toggleIndex;
            console.log('HTTP方法Toggle索引:', toggleIndex); // 调试日志
            
            // 根据索引确定HTTP方法 (0: POST, 1: GET, 2: DELETE)
            switch (toggleIndex) {
                case 0:
                    this.selectedMethod = HttpMethod.POST;
                    break;
                case 1:
                    this.selectedMethod = HttpMethod.GET;
                    break;
                case 2:
                    this.selectedMethod = HttpMethod.DELETE;
                    break;
                default:
                    console.warn('未知的HTTP方法Toggle索引:', toggleIndex);
                    break;
            }
            console.log('HTTP方法已切换为:', this.selectedMethod);
        }
    }

    /**
     * 参数形式选择改变事件
     */
    private onParamTypeToggleChanged(toggle: Toggle) {
        if (toggle.isChecked) {
            const toggleIndex = (toggle as any)._toggleIndex;
            console.log('参数Toggle索引:', toggleIndex); // 调试日志
            // 根据索引确定参数形式 (0: Query, 1: JSON, 2: Path)
            switch (toggleIndex) {
                case 0:
                    this.selectedParamType = ParamType.QUERY;
                    break;
                case 1:
                    this.selectedParamType = ParamType.BODY;
                    break;
                case 2:
                    this.selectedParamType = ParamType.PATH;
                    break;
                default:
                    console.warn('未知的参数形式Toggle索引:', toggleIndex);
                    break;
            }
            console.log('参数形式已切换为:', this.selectedParamType);
        }
    }

    /**
     * 页面切换按钮点击事件
     */
    private onCustomTestClicked() {
        // 根据当前页面状态切换
        if (this.currentPage === 'custom') {
            this.switchToPage('list');
        } else {
            this.switchToPage('custom');
        }

        // 重新绑定事件监听
        if (this.customTestButton) {
            this.customTestButton.node.on(Button.EventType.CLICK, this.onCustomTestClicked, this);
        }
    }

    /**
     * 切换页面
     */
    private switchToPage(page: 'custom' | 'list') {
        this.currentPage = page;
        
        // 切换页面显示
        if (this.customTestPage) {
            this.customTestPage.active = page === 'custom';
        }
        if (this.listTestPage) {
            this.listTestPage.active = page === 'list';
        }

        // 更新按钮状态和文本
        if (this.customTestButton) {
            // 按钮始终可用，但文本会根据当前页面变化
            this.customTestButton.interactable = true;
            // 可以在这里更新按钮文本，如果有Label组件的话
        }

        // 如果是列表页面，加载API配置列表
        if (page === 'list') {
            this.loadAPIList();
        } else {
            // 清空列表
            this.clearAPIList();
        }

        console.log(`切换到${page === 'custom' ? '自定义测试' : '列表测试'}页面`);
    }

    /**
     * 加载API配置列表
     */
    private loadAPIList() {
        if (!this.apiTestItemContainer || !this.apiTestItemPrefab) {
            console.warn('缺少必要的UI组件');
            return;
        }

        // 清空现有列表
        this.clearAPIList();

        // 获取所有API配置
        const configs = Object.entries(APIConfigs);
        
        configs.forEach(([key, config]) => {
            // 实例化预制体
            const itemNode = instantiate(this.apiTestItemPrefab);
            const apiTestItem = itemNode.getComponent(ApiTestItem);
            
            if (apiTestItem) {
                // 设置API信息
                apiTestItem.setUrl(config.url);
                
                // 设置描述
                const description = config.description || `${config.method} ${config.url}`;
                apiTestItem.setDescription(description);
                
                // 设置参数示例
                if (config.parameters && config.parameters.length > 0) {
                    const paramExample: any = {};
                    config.parameters.forEach(param => {
                        if (param.defaultValue !== undefined) {
                            paramExample[param.name] = param.defaultValue;
                        } else {
                            switch (param.type) {
                                case 'string':
                                    paramExample[param.name] = 'example';
                                    break;
                                case 'number':
                                    paramExample[param.name] = 0;
                                    break;
                                case 'boolean':
                                    paramExample[param.name] = false;
                                    break;
                                case 'object':
                                    paramExample[param.name] = {};
                                    break;
                            }
                        }
                    });
                    apiTestItem.setParams(paramExample);
                }

                // 设置回调
                apiTestItem.setSendCallback((result) => {
                    this.onApiTestItemCallback(key, config, result);
                });

                // 添加到容器
                this.apiTestItemContainer.addChild(itemNode);
                this.apiTestItems.push(apiTestItem);
            }
        });

        console.log(`加载了 ${configs.length} 个API配置`);
    }

    /**
     * 清空API列表
     */
    private clearAPIList() {
        if (this.apiTestItemContainer) {
            this.apiTestItemContainer.removeAllChildren();
        }
        this.apiTestItems = [];
    }

    /**
     * API测试项回调处理
     */
    private async onApiTestItemCallback(apiKey: string, config: APIConfig, result: any) {
        console.log(`API测试项回调: ${apiKey}`, result);

        if (!result.success) {
            ShowToast('参数获取失败');
            return;
        }

        const { url, params } = result.data;

        // 切换到自定义测试页面
        this.switchToPage('custom');

        // 设置URL和参数
        this.setUrl(url);
        this.setParams(params);

        // 设置HTTP方法和参数类型
        this.selectedMethod = config.method as HttpMethod;
        this.selectedParamType = config.paramType as ParamType;

        // 更新UI状态
        this.updateMethodToggle();
        this.updateParamTypeToggle();

        // 更新状态
        this.updateStatus(`已加载配置: ${config.description || apiKey}`);
        ShowToast(`已加载 ${apiKey} 配置`);
    }

    /**
     * 更新HTTP方法Toggle状态
     */
    private updateMethodToggle() {
        if (!this.methodToggleGroup) return;
        
        const toggles = this.methodToggleGroup.getComponentsInChildren(Toggle);
        const methodIndex = this.getMethodIndex(this.selectedMethod);
        
        toggles.forEach((toggle, index) => {
            toggle.isChecked = index === methodIndex;
        });
    }

    /**
     * 更新参数类型Toggle状态
     */
    private updateParamTypeToggle() {
        if (!this.paramTypeToggleGroup) return;
        
        const toggles = this.paramTypeToggleGroup.getComponentsInChildren(Toggle);
        const paramTypeIndex = this.getParamTypeIndex(this.selectedParamType);
        
        toggles.forEach((toggle, index) => {
            toggle.isChecked = index === paramTypeIndex;
        });
    }

    /**
     * 获取HTTP方法对应的索引
     */
    private getMethodIndex(method: HttpMethod): number {
        switch (method) {
            case HttpMethod.POST: return 0;
            case HttpMethod.GET: return 1;
            case HttpMethod.DELETE: return 2;
            default: return 0;
        }
    }

    /**
     * 获取参数类型对应的索引
     */
    private getParamTypeIndex(paramType: ParamType): number {
        switch (paramType) {
            case ParamType.QUERY: return 0;
            case ParamType.BODY: return 1;
            case ParamType.PATH: return 2;
            default: return 0;
        }
    }



    /**
     * 粘贴参数按钮点击事件
     */
    private async onPasteParamsClicked() {
        try {
            const clipboardText = await getClipboardText();
            if (clipboardText && this.paramsEditBox) {
                // 尝试格式化JSON
                try {
                    const parsed = JSON.parse(clipboardText);
                    this.paramsEditBox.string = JSON.stringify(parsed, null, 2);
                    ShowToast('参数已粘贴并格式化');
                } catch (parseError) {
                    // 如果不是JSON，直接粘贴
                    this.paramsEditBox.string = clipboardText;
                    ShowToast('参数已粘贴');
                }
            } else {
                ShowToast('剪贴板为空');
            }
        } catch (error) {
            console.error('粘贴参数失败:', error);
            ShowToast('粘贴失败');
        }
    }

    /**
     * 复制结果按钮点击事件
     */
    private async onCopyResultClicked() {
        const resultText = this.resultLabel?.string || '';
        
        if (!resultText || resultText === '等待发送请求...' || resultText === '正在发送请求...') {
            ShowToast('没有可复制的结果');
            return;
        }

        try {
            const success = await setClipboardText(resultText);
            if (success) {
                ShowToast('结果已复制到剪贴板');
            } else {
                ShowToast('复制失败，请重试');
            }
        } catch (error) {
            console.error('复制结果失败:', error);
            ShowToast('复制失败');
        }
    }

    /**
     * 发送按钮点击事件
     */
    private async onSendClicked() {
        if (this.isRequesting) {
            ShowToast('请求进行中，请稍候...');
            return;
        }

        const url = this.urlEditBox?.string?.trim() || '';
        const params = this.paramsEditBox?.string?.trim() || '';

        // 验证URL
        if (!url) {
            ShowToast('请输入API路径');
            return;
        }

        // 验证参数（如果输入了参数）
        let parsedParams = null;
        if (params) {
            try {
                parsedParams = JSON.parse(params);
            } catch (error) {
                // 如果不是JSON格式，尝试其他格式
                const trimmedParams = params.trim();
                
                // 如果是单个数字或字符串，转换为对象格式
                if (/^\d+$/.test(trimmedParams)) {
                    // 数字格式，用于Path参数
                    parsedParams = { value: parseInt(trimmedParams) };
                } else if (/^[a-zA-Z0-9_-]+$/.test(trimmedParams)) {
                    // 简单字符串格式，用于Path参数
                    parsedParams = { value: trimmedParams };
                } else {
                    ShowToast('参数格式错误，请检查格式');
                    return;
                }
            }
        }

        // 开始请求
        this.isRequesting = true;
        this.updateStatus('请求中...');
        this.updateResult('正在发送请求...');
        this.setButtonsEnabled(false);

        try {
            const result = await this.sendRequest(url, parsedParams);
            this.handleRequestResult(result);
        } catch (error) {
            console.error('请求异常:', error);
            this.updateStatus('请求异常');
            this.updateResult(`请求异常: ${error instanceof Error ? error.message : '未知错误'}`);
            ShowToast('请求异常');
        } finally {
            this.isRequesting = false;
            this.setButtonsEnabled(true);
        }
    }

    /**
     * 发送HTTP请求
     */
    private async sendRequest(url: string, params: any): Promise<any> {
        console.log('发送API请求:', {
            method: this.selectedMethod,
            url: url,
            paramType: this.selectedParamType,
            params: params
        });

        // 处理Path参数 - 将参数替换到URL中的占位符或作为查询参数
        let finalUrl = url;
        if (this.selectedParamType === ParamType.PATH) {
            finalUrl = this.replacePathParams(url, params);
            // 如果Path参数处理失败（返回原始URL且有占位符），则不发送请求
            if (finalUrl === url && url.match(/\{[^}]+\}/g)) {
                return { success: false, error: 'Path参数处理失败' };
            }
        } else if (this.selectedParamType === ParamType.QUERY && params) {
            finalUrl = this.addQueryParams(url, params);
        }

        switch (this.selectedMethod) {
            case HttpMethod.GET:
                return await this.httpClient.get(finalUrl);
            
            case HttpMethod.POST:
                // 根据参数形式决定如何处理参数
                if (this.selectedParamType === ParamType.BODY) {
                    // Body形式，直接发送参数
                    return await this.httpClient.post(finalUrl, params);
                } else {
                    // Query和Path形式，POST请求不需要body参数
                    return await this.httpClient.post(finalUrl, null);
                }
            
            case HttpMethod.DELETE:
                return await this.httpClient.delete(finalUrl);
            
            default:
                throw new Error(`不支持的HTTP方法: ${this.selectedMethod}`);
        }
    }

    /**
     * 添加查询参数到URL
     * @param url 原始URL
     * @param params 参数对象
     * @returns 添加查询参数后的URL
     */
    private addQueryParams(url: string, params: any): string {
        const queryParams = new URLSearchParams();
        for (const key in params) {
            queryParams.append(key, params[key].toString());
        }
        const queryString = queryParams.toString();
        
        let finalUrl = url;
        if (queryString) {
            finalUrl += (url.includes('?') ? '&' : '?') + queryString;
        }
        
        console.log('Query参数处理:', { 
            originalUrl: url, 
            finalUrl: finalUrl, 
            params: params 
        });
        return finalUrl;
    }

    /**
     * 替换URL中的Path参数
     * @param url 原始URL，包含占位符如 {id}, {name}
     * @param params 参数对象
     * @returns 替换后的URL
     */
    private replacePathParams(url: string, params: any): string {
        let finalUrl = url;
        let hasPlaceholder = false;
        
        // 如果没有参数，检查URL中是否有未替换的占位符
        if (!params || Object.keys(params).length === 0) {
            // 检查URL中是否有占位符
            const placeholderRegex = /\{[^}]+\}/g;
            const placeholders = url.match(placeholderRegex);
            
            if (placeholders) {
                console.warn('Path参数处理: URL中有占位符但未提供参数', {
                    originalUrl: url,
                    placeholders: placeholders
                });
                ShowToast('URL中有占位符，请提供对应的参数');
                return url; // 返回原始URL，不进行请求
            }
            
            console.log('Path参数处理: 无参数，无占位符', { 
                originalUrl: url, 
                finalUrl: finalUrl 
            });
            return finalUrl;
        }
        
        // 首先检查是否有占位符需要替换
        for (const key in params) {
            const placeholder = `{${key}}`;
            if (finalUrl.includes(placeholder)) {
                hasPlaceholder = true;
                const value = params[key];
                finalUrl = finalUrl.replace(placeholder, encodeURIComponent(String(value)));
            }
        }
        
        // 如果没有占位符，则将参数值直接拼接到URL路径后面
        if (!hasPlaceholder && Object.keys(params).length > 0) {
            const paramValues = Object.values(params).map(value => encodeURIComponent(String(value)));
            finalUrl += '/' + paramValues.join('/');
        }
        
        console.log('Path参数处理:', { 
            originalUrl: url, 
            finalUrl: finalUrl, 
            params: params,
            hasPlaceholder: hasPlaceholder 
        });
        return finalUrl;
    }

    /**
     * 处理请求结果
     */
    private handleRequestResult(result: any) {
        console.log('API请求结果:', result);

        if (result.success) {
            this.updateStatus('请求成功');
            this.updateResult(this.formatResponse(result.data));
            ShowToast('请求成功');
        } else {
            this.updateStatus('请求失败');
            this.updateResult(`请求失败: ${result.error || '未知错误'}\n状态码: ${result.statusCode || 'N/A'}`);
            ShowToast('请求失败');
        }
    }

    /**
     * 格式化响应数据
     */
    private formatResponse(data: any): string {
        if (!data) {
            return '响应数据为空';
        }

        try {
            return JSON.stringify(data, null, 2);
        } catch (error) {
            return `格式化失败: ${error instanceof Error ? error.message : '未知错误'}`;
        }
    }

    /**
     * 更新状态显示
     */
    private updateStatus(status: string) {
        if (this.statusLabel) {
            this.statusLabel.string = `状态: ${status}`;
        }
    }

    /**
     * 更新结果显示
     */
    private updateResult(result: string) {
        if (this.resultLabel) {
            this.resultLabel.string = result;
            const  parent = this.resultLabel.node.parent;
            if (parent) {
                parent.getComponent(Layout)?.updateLayout();
            }
        }
  

    }

    /**
     * 设置按钮状态
     */
    private setButtonsEnabled(enabled: boolean) {
        if (this.pasteParamsButton) {
            this.pasteParamsButton.interactable = enabled;
        }
        if (this.sendButton) {
            this.sendButton.interactable = enabled;
        }
        if (this.copyResultButton) {
            this.copyResultButton.interactable = enabled;
        }
    }

    /**
     * 清空输入
     */
    public clear() {
        if (this.urlEditBox) {
            this.urlEditBox.string = '';
        }
        if (this.paramsEditBox) {
            this.paramsEditBox.string = '';
        }
        this.updateStatus('就绪');
        this.updateResult('等待发送请求...');
    }

    /**
     * 设置URL
     */
    public setUrl(url: string) {
        if (this.urlEditBox) {
            this.urlEditBox.string = url;
        }
    }

    /**
     * 设置参数
     */
    public setParams(params: string | object) {
        if (this.paramsEditBox) {
            if (typeof params === 'string') {
                this.paramsEditBox.string = params;
            } else {
                this.paramsEditBox.string = JSON.stringify(params, null, 2);
            }
        }
    }

    /**
     * 获取当前URL
     */
    public getUrl(): string {
        return this.urlEditBox?.string || '';
    }

    /**
     * 获取当前参数
     */
    public getParams(): any {
        const params = this.paramsEditBox?.string || '';
        if (!params.trim()) {
            return null;
        }
        try {
            return JSON.parse(params);
        } catch (error) {
            console.error('参数解析失败:', error);
            return null;
        }
    }

    onDestroy() {
        // 游戏引擎会自动清理事件监听器，无需手动取消
        
        // 清空API列表
        // this.clearAPIList();
    }
} 