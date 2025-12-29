import { _decorator, Component, BlockInputEvents, EditBox, ScrollView, Node, instantiate, Label, UITransform, Widget, Layout } from 'cc';
import { ShowToast } from '../../global/Toast';
import { EventManager, ChatEvents } from '../../global/EventManager';
import { ChatService, ChatMessage } from '../../chat/ChatService';
import { UserInfoData } from '../../user/UserInfoData';
import { HttpClient } from '../../http/HttpClient';
import { userAPI } from '../../api/UserAPI';
const { ccclass, property } = _decorator;

@ccclass('chat')
export class chat extends Component {
    @property(EditBox)
    public inputBox: EditBox | null = null;

    @property(ScrollView)
    public scrollView: ScrollView | null = null;

    @property(Node)
    public content: Node | null = null;

    @property(Node)
    public messageItemTemplate: Node | null = null;

    @property(Node)
    public myMessageItemTemplate: Node | null = null;

    @property(Label)
    public nameLabelTemplate: Label | null = null;

    @property(Label)
    public contentLabelTemplate: Label | null = null;

    private _onChatMessageReceived: ((data?: any) => void) | null = null;
    private _wsInitialized = false;
    private _lastLocalContent: string = '';
    private _lastLocalTime = 0;
    private _userNickMap: Map<string, string> = new Map();
    private _userListLoading = false;
    private _userListLoaded = false;
    private _nameLabelPath: string = '';
    private _contentLabelPath: string = '';

    onLoad() {
        try {
            this._onChatMessageReceived = (data?: any) => {
                this.onMessageReceived(data as ChatMessage);
            };
            EventManager.getInstance().on(ChatEvents.CHAT_MESSAGE_RECEIVED, this._onChatMessageReceived);
        } catch {}
    }

    start() {
        try {
            this.node.active = false;
            if (!this.node.getComponent(BlockInputEvents)) {
                this.node.addComponent(BlockInputEvents);
            }

            if (!this.content && this.scrollView && this.scrollView.content) {
                this.content = this.scrollView.content;
            }

            if (this.messageItemTemplate) {
                this.messageItemTemplate.active = false;
            }
            if (this.myMessageItemTemplate) {
                this.myMessageItemTemplate.active = false;
            }
            this.initLabelPaths();
        } catch {}
    }

    private initLabelPaths(): void {
        const rootTemplate = this.messageItemTemplate || this.myMessageItemTemplate;
        if (!rootTemplate) {
            return;
        }
        if (this.nameLabelTemplate) {
            const p = this.buildRelativePath(rootTemplate, this.nameLabelTemplate.node);
            this._nameLabelPath = p || '';
        }
        if (this.contentLabelTemplate) {
            const p2 = this.buildRelativePath(rootTemplate, this.contentLabelTemplate.node);
            this._contentLabelPath = p2 || '';
        }
    }

    private buildRelativePath(root: Node, target: Node): string | null {
        const segments: string[] = [];
        let cur: Node | null = target;
        while (cur && cur !== root) {
            segments.unshift(cur.name);
            cur = cur.parent;
        }
        if (cur !== root) {
            return null;
        }
        return segments.join('/');
    }

    private findChildByPath(root: Node, path: string): Node | null {
        if (!path) {
            return null;
        }
        const parts = path.split('/');
        let cur: Node | null = root;
        for (let i = 0; i < parts.length; i++) {
            if (!cur) {
                return null;
            }
            const child = cur.getChildByName(parts[i]);
            if (!child) {
                return null;
            }
            cur = child;
        }
        return cur;
    }

    public show(): void {
        try {
            this.node.active = true;
            const p = this.node.parent;
            if (p) {
                this.node.setSiblingIndex(p.children.length - 1);
            }

            if (!this._wsInitialized) {
                this._wsInitialized = true;
                ChatService.getInstance().init();
            }
            this.ensureBottomPadding();
            this.loadUserList();
        } catch {}
    }

    public hide(): void {
        try {
            this.node.active = false;
            this._wsInitialized = false;
            ChatService.getInstance().disconnect();
        } catch {}
    }

    private getContentNode(): Node | null {
        if (this.content) {
            return this.content;
        }
        if (this.scrollView && this.scrollView.content) {
            this.content = this.scrollView.content;
            return this.content;
        }
        return null;
    }

    private updateLayoutAndAutoScroll(): void {
        const sv = this.scrollView;
        const contentNode = this.getContentNode();
        if (!sv || !contentNode) {
            return;
        }

        try {
            const layout = contentNode.getComponent(Layout);
            if (layout) {
                layout.updateLayout();
            }
        } catch {}

        const viewTrans = sv.node.getComponent(UITransform);
        const contentTrans = contentNode.getComponent(UITransform);
        if (!viewTrans || !contentTrans) {
            return;
        }

        const viewHeight = viewTrans.height;
        const contentHeight = contentTrans.height;
        try {
            if (contentHeight <= viewHeight) {
                sv.scrollToTop(0);
            } else {
                sv.scrollToBottom(0);
            }
        } catch {}
    }

    private ensureBottomPadding(): void {
        const contentNode = this.getContentNode();
        if (!contentNode) {
            return;
        }
        const layout = contentNode.getComponent(Layout);
        if (!layout) {
            return;
        }
        const trans = contentNode.getComponent(UITransform);
        if (!trans) {
            return;
        }
        const viewHeight = this.scrollView?.node?.getComponent(UITransform)?.height || 0;
        const padding = Math.max(0, viewHeight * 0.1);
        if (layout.paddingTop !== padding || layout.paddingBottom !== padding) {
            layout.paddingTop = padding;
            layout.paddingBottom = padding;
            layout.updateLayout();
        }
    }

    private async loadUserList(): Promise<void> {
        if (this._userListLoaded || this._userListLoading) {
            return;
        }
        this._userListLoading = true;
        try {
            HttpClient.getInstance().int();
            const resp = await userAPI.getUserList();
            let list: any = resp && resp.data ? resp.data : [];
            if (list && !Array.isArray(list) && Array.isArray((list as any).data)) {
                list = (list as any).data;
            }
            const map = new Map<string, string>();
            if (Array.isArray(list)) {
                for (let i = 0; i < list.length; i++) {
                    const row: any = list[i];
                    const uid = row && (row.userId ?? row.uuid ?? row.id);
                    const nn = row && (row.nickName ?? row.userName ?? row.name);
                    if (uid != null && nn && String(nn).length > 0) {
                        map.set(String(uid), String(nn));
                    }
                }
            }
            this._userNickMap = map;
            this._userListLoaded = true;
        } catch (e) {
            this._userListLoaded = false;
        } finally {
            this._userListLoading = false;
        }
    }

    public onSendButtonClicked(): void {
        try {
            const t = this.inputBox ? this.inputBox.string || '' : '';
            const text = t.trim();
            if (!text) {
                ShowToast('请输入聊天内容');
                return;
            }

            const contentNode = this.getContentNode();
            if (!contentNode) {
                return;
            }
            const template = this.myMessageItemTemplate || this.messageItemTemplate;
            if (!template) {
                return;
            }
            const item = instantiate(template);
            item.active = true;
            contentNode.addChild(item);

            const now = Date.now();
            this._lastLocalContent = text;
            this._lastLocalTime = now;
            const ui = UserInfoData.getInstance();
            const myUserId = ui.getUserId();
            let displayName = ui.getUserName() || '玩家';
            if (myUserId && this._userNickMap.size > 0) {
                const nn = this._userNickMap.get(myUserId);
                if (nn && nn.length > 0) {
                    displayName = nn;
                }
            }
            this.applyMessageTextAndResize(item, displayName, text, true);

            console.log('[hall.chat] onSendButtonClicked text =', text);
            ChatService.getInstance().sendMessage(text, 'global');

            if (this.inputBox) {
                this.inputBox.string = '';
            }

            this.updateLayoutAndAutoScroll();
        } catch {}
    }

    private onMessageReceived(msg: ChatMessage): void {
        try {
            const content = (msg?.content || '').trim();
            if (!content) return;

            const myUserId = UserInfoData.getInstance().getUserId();
            const isMine = !!myUserId && msg.userId === myUserId;
            if (isMine) {
                const dt = Date.now() - this._lastLocalTime;
                if (dt >= 0 && dt < 2000 && content === this._lastLocalContent) {
                    return;
                }
            }

            const contentNode = this.getContentNode();
            if (!contentNode) return;

            const template = isMine ? (this.myMessageItemTemplate || this.messageItemTemplate) : this.messageItemTemplate;
            if (!template) return;

            const item = instantiate(template);
            item.active = true;
            contentNode.addChild(item);

            const ui = UserInfoData.getInstance();
            let userName = (msg.userName || '').trim();
            if (!userName) {
                userName = '玩家';
            }
            if (msg.userId && this._userNickMap.size > 0) {
                const nn = this._userNickMap.get(msg.userId);
                if (nn && nn.length > 0) {
                    userName = nn;
                }
            }
            if (isMine) {
                const selfMapName = myUserId && this._userNickMap.get(myUserId);
                const selfName = selfMapName && selfMapName.length > 0 ? selfMapName : ui.getUserName();
                if (selfName && selfName.length > 0) {
                    userName = selfName;
                }
            }
            this.applyMessageTextAndResize(item, userName, content, isMine);
        } catch {}
    }

    private applyMessageTextAndResize(item: Node, name: string, content: string, alignRight: boolean): void {
        let nameLabel: Label | null = null;
        let contentLabel: Label | null = null;
        if (this._nameLabelPath) {
            const n = this.findChildByPath(item, this._nameLabelPath);
            if (n) {
                nameLabel = n.getComponent(Label);
            }
        }
        if (this._contentLabelPath) {
            const n2 = this.findChildByPath(item, this._contentLabelPath);
            if (n2) {
                contentLabel = n2.getComponent(Label);
            }
        }
        if (!contentLabel) {
            const labels = item.getComponentsInChildren(Label);
            if (!labels || labels.length === 0) {
                return;
            }
            contentLabel = labels[labels.length - 1];
        }
        if (nameLabel) {
            nameLabel.string = name;
        }
        if (contentLabel) {
                contentLabel.horizontalAlign = Label.HorizontalAlign.LEFT;
                const trans = contentLabel.node.getComponent(UITransform);
                if (trans) {
                    trans.setAnchorPoint(0, 0.5);
                }
                const widget = contentLabel.node.getComponent(Widget);
                if (widget && widget.enabled) {
                    widget.enabled = false;
                }

                if (nameLabel) {
                    contentLabel.string = content;
                } else {
                    contentLabel.string = `[${name}] ${content}`;
                }
                contentLabel.overflow = Label.Overflow.NONE;
            }

            const contentNodeLabel = contentLabel ? contentLabel.node : null;
            const labelTransform = contentNodeLabel ? contentNodeLabel.getComponent(UITransform) : null;
            if (!labelTransform) {
                return;
            }

            const bubbleNode = contentNodeLabel ? contentNodeLabel.parent : null;
            if (bubbleNode) {
                const bubbleTransform = bubbleNode.getComponent(UITransform);
                if (bubbleTransform) {
                    const layout = bubbleNode.getComponent(Layout);
                    if (layout && layout.enabled) {
                        layout.enabled = false;
                    }

                    const baseWidth = bubbleTransform.width; 
                    const paddingLeft = 12;
                    const paddingRight = 70;
                    const paddingX = paddingLeft + paddingRight;

                    contentLabel.overflow = Label.Overflow.NONE;
                    contentLabel.horizontalAlign = Label.HorizontalAlign.LEFT;
                    contentLabel.updateRenderData(true);
                    
                    const naturalWidth = labelTransform.width;
                    const maxInnerWidth = baseWidth > paddingX ? (baseWidth - paddingX) : baseWidth;

                    let finalLabelWidth = naturalWidth;
                    
                    if (naturalWidth > maxInnerWidth) {
                        finalLabelWidth = maxInnerWidth;
                        contentLabel.overflow = Label.Overflow.RESIZE_HEIGHT;
                        labelTransform.width = finalLabelWidth;
                    } else {
                        contentLabel.overflow = Label.Overflow.NONE;
                        finalLabelWidth = naturalWidth;
                    }

                    const minBubbleWidth = 60;
                    let finalBubbleWidth = finalLabelWidth + paddingX;
                    if (finalBubbleWidth < minBubbleWidth) {
                        finalBubbleWidth = minBubbleWidth;
                    }

                    bubbleTransform.width = finalBubbleWidth;
                    
                    labelTransform.setAnchorPoint(0, 0.5);
                    if (contentNodeLabel) {
                        const w = contentNodeLabel.getComponent(Widget);
                        if (w && w.enabled) w.enabled = false;
                    }

                    const bubbleAnchorX = bubbleTransform.anchorX;
                    const bubbleLeftX = -finalBubbleWidth * bubbleAnchorX;
                    const bubbleAnchorY = bubbleTransform.anchorY;
                    const targetY = (0.5 - bubbleAnchorY) * bubbleTransform.height;

                    if (contentNodeLabel) {
                        contentNodeLabel.setPosition(bubbleLeftX + paddingLeft, targetY, contentNodeLabel.position.z);
                    }
                    
                    contentLabel.updateRenderData(true);

                    const padding = 16;
                    bubbleTransform.height = labelTransform.height + padding;
                }
            }

            const itemTransform = item.getComponent(UITransform);
            if (itemTransform && bubbleNode) {
                const bubbleTransform = bubbleNode.getComponent(UITransform);
                if (bubbleTransform) {
                    const extra = 8;
                    itemTransform.height = bubbleTransform.height + extra;
                }
            }

            const contentNode = this.getContentNode();
            if (contentNode) {
                const contentTransform = contentNode.getComponent(UITransform);
                const itemTransform2 = item.getComponent(UITransform);
                if (contentTransform && itemTransform2) {
                    const cw = contentTransform.width;
                    const iw = itemTransform2.width;
                    const ax = itemTransform2.anchorX;
                    const contentAnchorX = contentTransform.anchorX;
                    const leftMargin = 10;
                    const rightMargin = 10;

                    let x = 0;
                    if (alignRight) {
                        const rightEdge = cw * (1 - contentAnchorX) - rightMargin;
                        x = rightEdge - iw * (1 - ax);
                    } else {
                        const leftEdge = -cw * contentAnchorX + leftMargin;
                        x = leftEdge + iw * ax;
                    }

                    item.setPosition(x, item.position.y, item.position.z);
                }
            }

            if (this.scrollView) {
                try {
                    this.updateLayoutAndAutoScroll();
                } catch {}
            }
    }

    public onCloseButtonClicked(): void {
        this.hide();
    }

    onDestroy() {
        try {
            if (this._onChatMessageReceived) {
                EventManager.getInstance().off(ChatEvents.CHAT_MESSAGE_RECEIVED, this._onChatMessageReceived);
                this._onChatMessageReceived = null;
            }
        } catch {}
    }

    update(deltaTime: number) {}
}
