import { _decorator, Component, Node, EditBox, Button, Label, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('APITestMain')
export class APITestMain extends Component {
    
    @property(EditBox)
    urlEditBox: EditBox | null = null;
    
    @property(EditBox)
    paramsEditBox: EditBox | null = null;
    
    @property(Button)
    pasteParamsButton: Button | null = null;
    
    @property(Node)
    methodToggleGroup: Node | null = null;
    
    @property(Node)
    paramTypeToggleGroup: Node | null = null;
    
    @property(Button)
    sendButton: Button | null = null;
    
    @property(Button)
    copyResultButton: Button | null = null;
    
    @property(Label)
    statusLabel: Label | null = null;
    
    @property(Label)
    resultLabel: Label | null = null;
    
    @property(Prefab)
    apiTestItemPrefab: Prefab | null = null;
    
    @property(Node)
    apiTestItemContainer: Node | null = null;
    
    @property(Node)
    customTestPage: Node | null = null;
    
    @property(Node)
    listTestPage: Node | null = null;
    
    @property(Button)
    customTestButton: Button | null = null;

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
        
        // 复制结果按钮
        if (this.copyResultButton) {
            this.copyResultButton.node.on(Button.EventType.CLICK, this.onCopyResult, this);
        }
        
        // 自定义测试按钮
        if (this.customTestButton) {
            this.customTestButton.node.on(Button.EventType.CLICK, this.onCustomTest, this);
        }
    }

    private onPasteParams() {
        // 粘贴参数逻辑
        console.log('Paste params clicked');
    }

    private onSendRequest() {
        // 发送请求逻辑
        console.log('Send request clicked');
    }

    private onCopyResult() {
        // 复制结果逻辑
        console.log('Copy result clicked');
    }

    private onCustomTest() {
        // 自定义测试逻辑
        console.log('Custom test clicked');
    }

    public hide() {
        // 隐藏界面
        this.node.active = false;
    }
} 