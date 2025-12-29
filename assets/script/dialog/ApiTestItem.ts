import { _decorator, Component, Node, EditBox, Button, Label } from 'cc';
import { getClipboardText } from '../utils/clipboard-utils';
import { ShowToast } from '../global/Toast';

const { ccclass, property } = _decorator;

/**
 * API测试结果回调接口
 */
export interface ApiTestResult {
    success: boolean;
    data?: any;
    error?: string;
}

/**
 * API测试回调函数类型
 */
export type ApiTestCallback = (result: ApiTestResult) => void;

/**
 * API测试组件
 * 用于测试API接口，支持参数输入、粘贴剪贴板功能
 */
@ccclass('ApiTestItem')
export class ApiTestItem extends Component {

    // --- UI 组件 ---

    @property(Label)
    public urlLabel: Label = null!;

    @property(EditBox)
    public paramsEditBox: EditBox = null!;

    @property(Button)
    public pasteParamsButton: Button = null!;

    @property(Button)
    public sendButton: Button = null!;

    // 说明标签
    @property(Label)
    public descriptionLabel: Label = null!;

    public placeholderParams: string = 'Enter parameters (JSON)...';

    // --- 回调 ---
    private onSendCallback?: ApiTestCallback;
    private currentUrl: string = '';
    private currentDescription: string = '';

    onLoad() {
        this.initUI();
        this.bindEvents();
    }

    /**
     * 初始化UI
     */
    private initUI() {
       

        // 设置占位符
        if (this.paramsEditBox) {
            this.paramsEditBox.placeholder = this.placeholderParams;
        }
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
     * 发送按钮点击事件
     */
    private onSendClicked() {
        const params = this.paramsEditBox?.string || '';

        // 验证URL
        if (!this.currentUrl.trim()) {
            ShowToast('URL未设置');
            return;
        }

        // 验证参数（如果输入了参数）
        let parsedParams = null;
        if (params.trim()) {
            try {
                parsedParams = JSON.parse(params);
            } catch (error) {
                ShowToast('参数格式错误，请检查JSON格式');
                return;
            }
        }

        // 执行回调
        if (this.onSendCallback) {
            const result: ApiTestResult = {
                success: true,
                data: {
                    url: this.currentUrl.trim(),
                    params: parsedParams
                }
            };
            this.onSendCallback(result);
        }
    }

    /**
     * 设置发送回调
     * @param callback 回调函数
     */
    public setSendCallback(callback: ApiTestCallback) {
        this.onSendCallback = callback;
    }

    /**
     * 设置URL
     * @param url URL地址
     */
    public setUrl(url: string) {
        this.currentUrl = url;
        if (this.urlLabel) {
            this.urlLabel.string = url;
        }
    }

    /**
     * 设置参数
     * @param params 参数字符串或对象
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
     * 获取URL
     */
    public getUrl(): string {
        return this.currentUrl;
    }

    /**
     * 获取参数
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

    /**
     * 清空输入
     */
    public clear() {
        if (this.paramsEditBox) {
            this.paramsEditBox.string = '';
        }
    }

    /**
     * 设置按钮状态
     * @param enabled 是否启用
     */
    public setButtonsEnabled(enabled: boolean) {
        if (this.pasteParamsButton) {
            this.pasteParamsButton.interactable = enabled;
        }
        if (this.sendButton) {
            this.sendButton.interactable = enabled;
        }
    }

    /**
     * 设置描述
     * @param description 描述文本
     */
    public setDescription(description: string) {
        this.currentDescription = description;
        if (this.descriptionLabel) {
            this.descriptionLabel.string = description;
        }
    }

    onDestroy() {
       
    }
} 