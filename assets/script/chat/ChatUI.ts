import { _decorator, Component, Node, EditBox, Button, Label, Layout, instantiate } from 'cc';
import { EventManager, ChatEvents } from '../global/EventManager';
import { ChatService, ChatMessage } from './ChatService';
const { ccclass, property } = _decorator;

@ccclass('ChatUI')
export class ChatUI extends Component {
    @property(EditBox)
    public input: EditBox = null;

    @property(Button)
    public sendButton: Button = null;

    @property(Node)
    public content: Node = null;

    onLoad() {
        const em = EventManager.getInstance();
        em.on(ChatEvents.CHAT_MESSAGE_RECEIVED, this.onMessageReceived.bind(this));
        if (this.sendButton) {
            this.sendButton.node.on(Button.EventType.CLICK, this.onSendClick, this);
        }
        this.ensureLayout();
    }

    public show() {
        this.node.active = true;
    }

    public hide() {
        this.node.active = false;
    }

    private ensureLayout() {
        const n = this.content || this.node;
        const layout = n.getComponent(Layout) || n.addComponent(Layout);
        layout.type = Layout.Type.VERTICAL;
        layout.resizeMode = Layout.ResizeMode.CONTAINER;
        layout.spacingY = 8;
        layout.paddingLeft = 0;
        layout.paddingRight = 0;
        layout.paddingTop = 0;
        layout.paddingBottom = 0;
    }

    private onSendClick() {
        const text = (this.input?.string || '').trim();
        if (!text) return;
        this.input.string = '';
        ChatService.getInstance().sendMessage(text, 'global');
        this.appendLocalMessage(text);
    }

    private onMessageReceived(msg: ChatMessage) {
        this.appendMessage(`[${msg.userName}] ${msg.content}`);
    }

    private appendLocalMessage(content: string) {
        this.appendMessage(`[我] ${content}`);
    }

    private appendMessage(text: string) {
        const parent = this.content || this.node;
        const item = new Node('msg_item');
        const label = item.addComponent(Label);
        label.string = text;
        parent.addChild(item);
    }
}

