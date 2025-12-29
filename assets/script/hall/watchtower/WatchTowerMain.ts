import { _decorator, Component, Node, Prefab, instantiate, resources, BlockInputEvents, director, game, Sprite, UIOpacity, tween, Vec3 } from 'cc';
import { HttpClient } from '../../http/HttpClient';
const { ccclass, property } = _decorator;

@ccclass('WatchTowerMain')
export class WatchTowerMain extends Component {
    // 哨塔位节点数组（与上阵英雄位类似，用于承载点击事件）
    @property({ type: [Node] })
    public towerSlots: Node[] = [];

    // 打开哨塔选项页面的单个按钮（如果仅需要一个入口按钮，设置该属性）
    @property({ type: Node })
    public towerButton: Node | null = null;

    // 选项页面预制体（可在编辑器中拖拽赋值），为空则走资源路径加载
    @property({ type: Prefab })
    public popupPrefab: Prefab = null;

    @property({ type: [Node] })
    public completionNodes: Node[] = [];
    @property({ type: [Node] })
    public hide14Nodes: Node[] = [];



   

    // 弹窗页面节点（点击哨塔打开的弹窗）
    private _popupNode: Node | null = null;
    // 选项页面节点（点击按钮打开的新页面）
    private _optionNode: Node | null = null;
    private _lastSummonTypes: number[] = [];

    start() {
        // 防止点击事件穿透到下层功能
        try { this.node.addComponent(BlockInputEvents); } catch {}
        // 绑定每个哨塔位的点击，打开弹窗页面（WatchtowerPopup）
        if (this.towerSlots && this.towerSlots.length) {
            this.towerSlots.forEach((slot, idx) => {
                if (!slot) return;
                slot.off(Node.EventType.TOUCH_END);
                slot.on(Node.EventType.TOUCH_END, () => this.openTowerPopup(idx), this);
            });
        }
        // 如果只是一个入口按钮，则绑定按钮点击
        if (this.towerButton) {
            this.towerButton.off(Node.EventType.TOUCH_END);
            this.towerButton.on(Node.EventType.TOUCH_END, () => {
                // 由 Hall 统一管理打开选项页面
                director.emit(game.gameEvent.GAME_WATCHTOWER_OPTION_PAGE_SHOW);
            }, this);
        }
        try { director.on(game.gameEvent.GAME_WATCHTOWER_SUMMON_SUCCESS, this.onWatchtowerSummonSuccess, this); } catch {}
    }

    update(deltaTime: number) {
    }

    public show(): void {
        this.node.active = true;
    }

    public hide(): void {
        this.node.active = false;
    }

    // 打开哨塔弹窗页面（WatchtowerPopup），不隐藏主页面
    private openTowerPopup(index?: number) {
        // 若弹窗已存在则仅显示并置顶
        if (this._popupNode && this._popupNode.isValid) {
            this._popupNode.active = true;
            try {
                const p = this._popupNode.parent;
                if (p) this._popupNode.setSiblingIndex(p.children.length - 1);
                const comp = this._popupNode.getComponent('WatchtowerPopup') as any;
                if (comp && comp.setFactoryId) comp.setFactoryId(String((index ?? 0) + 1));
            } catch {}
            return;
        }
        // 加载并实例化 Watchtower 弹窗预制体
        resources.load('prefab/hall/watchtower/watchtower_Popup', Prefab, (err, prefab) => {
            if (err || !prefab) return;
            const node = instantiate(prefab);
            const canvas = director.getScene()?.getChildByName('Canvas');
            const parent = canvas || this.node.parent || this.node;
            parent.addChild(node);
            this._popupNode = node;
            try {
                const comp = node.getComponent('WatchtowerPopup') as any;
                if (comp && comp.setFactoryId) comp.setFactoryId(String((index ?? 0) + 1));
            } catch {}
        });
    }

    // 打开哨塔选项页面改为发事件，由Hall统一管理
    private openOptionPage() {
        director.emit(game.gameEvent.GAME_WATCHTOWER_OPTION_PAGE_SHOW);
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

    private onWatchtowerSummonSuccess(factoryId: number, type?: number): void {
        const idx = parseInt(String(factoryId));
        const slotIndex = isNaN(idx) ? 0 : (idx >= 1 ? idx - 1 : idx);
        if (typeof type === 'number' && type > 0) this._lastSummonTypes[slotIndex] = type;
        let usedNode: Node | null = null;
        if (this.towerSlots && this.towerSlots[slotIndex]) usedNode = this.towerSlots[slotIndex];
        if (!usedNode) {
            const scene = director.getScene();
            const factoryName = String(idx);
            usedNode = this.findDeep(scene, factoryName);
        }
        if (!usedNode) return;
        const toHide = ['watchtower_1','watchtower_3','watchtower_4','watchtower_5','watchtower_6','watchtower_14'];
        for (let i = 0; i < toHide.length; i++) {
            const list = this.findAllDeep(usedNode, toHide[i]);
            for (let j = 0; j < list.length; j++) list[j].active = false;
        }
        if (this.hide14Nodes && this.hide14Nodes[slotIndex]) {
            this.hide14Nodes[slotIndex].active = false;
        }
        let completions = this.findAllDeep(usedNode, 'Completion');
        if (completions && completions.length) {
            for (let i = 0; i < completions.length; i++) {
                const node = completions[i];
                node.active = true;
                try { const ui = node.getComponent(UIOpacity) || node.addComponent(UIOpacity); ui.opacity = 0; } catch {}
                try { node.setScale(new Vec3(0.85, 0.85, 1)); } catch {}
                try { const ui2 = node.getComponent(UIOpacity)!; tween(ui2).to(0.2, { opacity: 255 }).start(); } catch {}
                try { tween(node).to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }).start(); } catch {}
                node.off(Node.EventType.TOUCH_END);
                node.on(Node.EventType.TOUCH_END, () => this.onCompletionClicked(slotIndex), this);
            }
        } else {
            if (this.completionNodes && this.completionNodes[slotIndex]) {
                const node = this.completionNodes[slotIndex];
                node.active = true;
                try { const ui = node.getComponent(UIOpacity) || node.addComponent(UIOpacity); ui.opacity = 0; } catch {}
                try { node.setScale(new Vec3(0.85, 0.85, 1)); } catch {}
                try { const ui2 = node.getComponent(UIOpacity)!; tween(ui2).to(0.2, { opacity: 255 }).start(); } catch {}
                try { tween(node).to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }).start(); } catch {}
                node.off(Node.EventType.TOUCH_END);
                node.on(Node.EventType.TOUCH_END, () => this.onCompletionClicked(slotIndex), this);
            }
        }
    }

    private findAllDeep(root: Node | null, name: string): Node[] {
        const result: Node[] = [];
        if (!root) return result;
        if (root.name === name) result.push(root);
        const children = root.children || [];
        for (let i = 0; i < children.length; i++) {
            const sub = this.findAllDeep(children[i], name);
            for (let j = 0; j < sub.length; j++) result.push(sub[j]);
        }
        return result;
    }

    private async onCompletionClicked(slotIndex: number): Promise<void> {
        try {
            const type = this._lastSummonTypes[slotIndex] || 1;
            const key = slotIndex + 1;
            const http = HttpClient.getInstance();
            const result = await http.post<any>('/api/user/watchtower', { type, key });
            if (!result || !result.success) return;
            const resp = result.data as any;
            if (!resp || resp.code !== 200) return;
            let payload: Record<string, number> = {};
            try {
                const dataStr = resp.data as string;
                payload = dataStr ? JSON.parse(dataStr) : {};
            } catch {}
            try {
                let usedNode: Node | null = null;
                if (this.towerSlots && this.towerSlots[slotIndex]) usedNode = this.towerSlots[slotIndex];
                if (!usedNode) {
                    const scene = director.getScene();
                    usedNode = this.findDeep(scene, String(slotIndex + 1));
                }
                if (usedNode) {
                    const completions = this.findAllDeep(usedNode, 'Completion');
                    for (let i = 0; i < completions.length; i++) {
                        const c = completions[i];
                        try { const ui = c.getComponent(UIOpacity) || c.addComponent(UIOpacity); tween(ui).to(0.15, { opacity: 0 }).call(() => { c.active = false; }).start(); } catch { c.active = false; }
                    }
                    if (this.completionNodes && this.completionNodes[slotIndex]) {
                        const n = this.completionNodes[slotIndex];
                        try { const ui = n.getComponent(UIOpacity) || n.addComponent(UIOpacity); tween(ui).to(0.15, { opacity: 0 }).call(() => { n.active = false; }).start(); } catch { n.active = false; }
                    }
                    const names = ['watchtower_1','watchtower_2','watchtower_3','watchtower_4','watchtower_5','watchtower_6'];
                    for (let n = 0; n < names.length; n++) {
                        const list = this.findAllDeep(usedNode, names[n]);
                        for (let i = 0; i < list.length; i++) list[i].active = true;
                    }
                    const show14s = this.findAllDeep(usedNode, 'watchtower_14');
                    for (let i = 0; i < show14s.length; i++) show14s[i].active = true;
                    if (this.hide14Nodes && this.hide14Nodes[slotIndex]) this.hide14Nodes[slotIndex].active = true;
                }
            } catch {}
            try { director.emit(game.gameEvent.GAME_WATCHTOWER_RECEIVE_PAGE_SHOW, resp.data); } catch {}
        } catch {}
    }
}


