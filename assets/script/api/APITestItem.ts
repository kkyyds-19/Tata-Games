import { _decorator, Component, Node, Label, EditBox, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('APITestItem')
export class APITestItem extends Component {
    
    @property(Label)
    urlLabel: Label | null = null;
    
    @property(EditBox)
    paramsEditBox: EditBox | null = null;
    
    @property(Button)
    pasteParamsButton: Button | null = null;
    
    @property(Button)
    sendButton: Button | null = null;
    
    @property(Label)
    descriptionLabel: Label | null = null;

    start() {
        // 初始化事件监听
        this.initEventListeners();
    }

    private initEventListeners() {
        // 粘贴参数按钮
        if (this.pasteParamsButton) {
            this.pasteParamsButton.node.on(Button.EventType.CLICK, this.onPasteParams, this);
        }
        
        // 发送按钮
        if (this.sendButton) {
            this.sendButton.node.on(Button.EventType.CLICK, this.onSendRequest, this);
        }
    }

    private onPasteParams() {
        // 粘贴参数逻辑
        console.log('Paste params clicked in item');
    }

    private onSendRequest() {
        // 发送请求逻辑
        console.log('Send request clicked in item');
    }

    public setData(data: any) {
        // 设置数据
        if (this.urlLabel) {
            this.urlLabel.string = data.url || '';
        }
        if (this.descriptionLabel) {
            this.descriptionLabel.string = data.description || '';
        }
    }
} 