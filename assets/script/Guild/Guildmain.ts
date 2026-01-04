import { _decorator, BlockInputEvents, Component, Node, director, instantiate, ScrollView } from 'cc';
import { HttpClient } from '../http/HttpClient';
import { Guilditem } from './Guilditem';
import { ShowToast } from '../global/Toast';

const { ccclass, property } = _decorator;

@ccclass('Guildmain')
export class Guildmain extends Component {
    @property({ type: Node })
    public contentRoot: Node | null = null;

    @property({ type: Node })
    public maskNode: Node | null = null;

    private _scrollView: ScrollView | null = null;
    private _itemTemplate: Node | null = null;
    private _contentLayout: Node | null = null;

    private _onApplicationProcessed = () => {
        void this.fetchApplyList();
    };

    private _stopEvent = (event: any) => {
        try { event?.stopPropagation && event.stopPropagation(); } catch {}
    };

    onLoad(): void {
        try {
            const canvas = director.getScene()?.getChildByName('Canvas');
            if (canvas) this.node.parent = canvas;
        } catch {}

        if (!this.contentRoot || this.contentRoot === this.maskNode || this.contentRoot.name === 'tuichu') {
            this.contentRoot = this.findDeep(this.node, 'partner_mid_area') || this.contentRoot || null;
        }
        if (!this.maskNode) {
            this.maskNode = this.findDeep(this.node, 'tuichu') || null;
        }

        if (this.contentRoot) {
            try {
                if (!this.contentRoot.getComponent(BlockInputEvents)) this.contentRoot.addComponent(BlockInputEvents);
            } catch {}
            this.contentRoot.off(Node.EventType.TOUCH_START, this._stopEvent, this);
            this.contentRoot.off(Node.EventType.TOUCH_END, this._stopEvent, this);
            this.contentRoot.on(Node.EventType.TOUCH_START, this._stopEvent, this);
            this.contentRoot.on(Node.EventType.TOUCH_END, this._stopEvent, this);

            // Initialize ScrollView and Template
            const svNode = this.findDeep(this.contentRoot, 'ScrollView');
            if (svNode) {
                this._scrollView = svNode.getComponent(ScrollView);
                const view = this.findDeep(svNode, 'view');
                const layout = this.findDeep(view || svNode, 'Layout');
                if (layout) {
                    this._contentLayout = layout;
                    // Find existing item to use as template
                    const item = this.findDeep(layout, 'Guild_item');
                    if (item) {
                        this._itemTemplate = instantiate(item);
                        item.active = false; // Hide original
                        // Optionally remove original if we use template exclusively, 
                        // but hiding is safer to keep layout valid initially.
                        // Or we can just use the item as a template reference and remove it from parent.
                        this._itemTemplate.active = false;
                        item.destroy(); // Remove the placeholder from scene
                    }
                }
            }
        }

        if (this.maskNode) {
            try {
                if (!this.maskNode.getComponent(BlockInputEvents)) this.maskNode.addComponent(BlockInputEvents);
            } catch {}
            const close = (event: any) => {
                this._stopEvent(event);
                this.hide();
            };
            this.maskNode.off(Node.EventType.TOUCH_START, close, this);
            this.maskNode.on(Node.EventType.TOUCH_START, close, this);
        }

        director.off('guild-application-processed', this._onApplicationProcessed, this);
        director.on('guild-application-processed', this._onApplicationProcessed, this);
    }

    onDestroy(): void {
        director.off('guild-application-processed', this._onApplicationProcessed, this);
    }

    public show(): void {
        this.node.active = true;
        try {
            const p = this.node.parent;
            if (p) this.node.setSiblingIndex(p.children.length - 1);
        } catch {}
        
        this.fetchApplyList();
    }

    public hide(): void {
        this.node.active = false;
    }

    private async fetchApplyList() {
        if (!this._contentLayout || !this._itemTemplate) return;

        try {
            const http = HttpClient.getInstance();
            const res = await http.request('/api/guild/apply/list', {
                method: 'GET',
                body: {
                    pageNum: 1,
                    pageSize: 11,
                    name: '',
                }
            });

            // Clear existing items
            this._contentLayout.destroyAllChildren();

            if (!res.success) {
                ShowToast(res.error || '获取申请列表失败');
                return;
            }

            const body = res.data as any;
            const applyList = Array.isArray(body?.data?.data) ? body.data.data : [];

            const memberIdSet = await this.fetchMemberUserIdSet();
            const list = memberIdSet.size > 0
                ? applyList.filter((it: any) => {
                    const uid = it?.userId;
                    if (uid == null) return true;
                    return !memberIdSet.has(String(uid));
                })
                : applyList;
            
            if (!Array.isArray(list)) {
                return;
            }

            for (const itemData of list) {
                const node = instantiate(this._itemTemplate);
                node.active = true;
                this._contentLayout.addChild(node);
                
                const comp = node.getComponent(Guilditem);
                if (comp) {
                    comp.init(itemData);
                }
            }

        } catch (e) {
            console.error('Fetch apply list error', e);
        }
    }

    private async fetchMemberUserIdSet(): Promise<Set<string>> {
        try {
            const http = HttpClient.getInstance();
            const res = await http.request<any>('/api/guild/my/list', {
                method: 'GET',
                body: {
                    name: '',
                    pageNum: 1,
                    pageSize: 11
                }
            });
            if (!res.success) return new Set();
            const body = res.data as any;
            const list = Array.isArray(body?.data?.data) ? body.data.data : [];
            if (!Array.isArray(list)) return new Set();

            const set = new Set<string>();
            for (const it of list) {
                const uid = it?.userId;
                if (uid != null) set.add(String(uid));
            }
            return set;
        } catch {
            return new Set();
        }
    }

    private findDeep(root: Node | null, name: string): Node | null {
        if (!root) return null;
        if (root.name === name) return root;
        const children = root.children || [];
        for (let i = 0; i < children.length; i++) {
            const r = this.findDeep(children[i], name);
            if (r) return r;
        }
        return null;
    }
}


