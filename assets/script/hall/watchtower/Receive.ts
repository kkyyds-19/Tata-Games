import { _decorator, Component, Node, Label, BlockInputEvents, director, UIOpacity, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Receive')
export class Receive extends Component {
    @property({ type: [Label] })
    public labels: Label[] = [];

    start() {
        try { this.node.addComponent(BlockInputEvents); } catch {}
        const handler = () => this.close();
        this.node.off(Node.EventType.TOUCH_START, handler, this);
        this.node.off(Node.EventType.TOUCH_END, handler, this);
        this.node.on(Node.EventType.TOUCH_START, handler, this);
        this.node.on(Node.EventType.TOUCH_END, handler, this);
        try { const ui = this.node.getComponent(UIOpacity) || this.node.addComponent(UIOpacity); ui.opacity = 0; } catch {}
        try { this.node.setScale(new Vec3(0.85, 0.85, 1)); } catch {}
        try { const ui2 = this.node.getComponent(UIOpacity)!; tween(ui2).to(0.2, { opacity: 255 }).start(); } catch {}
        try { tween(this.node).to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }).start(); } catch {}
    }

    public setTexts(texts: string[]): void {
        const labels = (this.labels && this.labels.length) ? this.labels : (this.node.getComponentsInChildren(Label) || []);
        for (let i = 0; i < labels.length; i++) {
            labels[i].string = texts[i] ?? '';
        }
    }

    public setData(data: string | Record<string, number>): void {
        let obj: Record<string, number> = {};
        if (typeof data === 'string') {
            try { obj = JSON.parse(data) as Record<string, number>; } catch { obj = {}; }
        } else if (data && typeof data === 'object') {
            obj = data as Record<string, number>;
        }
        const labels = (this.labels && this.labels.length) ? this.labels : (this.node.getComponentsInChildren(Label) || []);
        const entries = Object.entries(obj).sort((a, b) => {
            const pa = parseInt((a[0].match(/_(\d+)$/) || [])[1] || '0');
            const pb = parseInt((b[0].match(/_(\d+)$/) || [])[1] || '0');
            return pa - pb;
        });
        for (let i = 0; i < labels.length; i++) {
            const v = entries[i] ? entries[i][1] : '';
            labels[i].string = String(v ?? '');
        }
    }

    private close(): void {
        try {
            const p = this.node.parent;
            if (p) this.node.removeFromParent();
            this.node.destroy();
        } catch {}
    }
}


