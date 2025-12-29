import { _decorator, Component, Node, BlockInputEvents, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('First_topup')
export class First_topup extends Component {
    /**
     * 页面初始化：默认隐藏并阻止事件向下层穿透
     */
    start() {
        try {
            this.node.active = false;
            if (!this.node.getComponent(BlockInputEvents)) {
                this.node.addComponent(BlockInputEvents);
            }
        } catch {}
    }

    /**
     * 打开首充页面（由 hall 统一调用）
     */
    show(): void {
        try {
            this.node.active = true;
            const p = this.node.parent;
            if (p) this.node.setSiblingIndex(p.children.length - 1);
        } catch {}
    }

    /**
     * 关闭首充页面（由 hall 或页面自身调用）
     */
    hide(): void {
        try {
            this.node.active = false;
        } catch {}
    }

    update(deltaTime: number) { }

  
}


