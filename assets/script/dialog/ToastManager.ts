import {
    _decorator,
    Component,
    Node,
    Prefab,
    director,
    tween,
    Label,
    instantiate,
    UIOpacity,
    Vec3,
    game,
    easing
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ToastManager')
export default class ToastManager extends Component {

    @property(Prefab)
    toastPrefab: Prefab = null;

    @property
    moveDistance: number = 220;

    @property
    moveDuration: number = 1;

    @property
    fadeDuration: number = 1;

    @property
    delayBeforeMove: number = 0.2;

    @property
    debounceDelay: number = 500;

    private _toastPool: Node[] = [];
    private _lastShowTime: number = 0;

    onLoad() {
        director.on(game.gameEvent.GAME_TOAST_SHOW, this.show, this);
        this.initToastPool();
    }

    onDestroy() {
        director.off(game.gameEvent.GAME_TOAST_SHOW, this.show, this);
    }

    initToastPool() {
        for (let i = 0; i < 3; i++) {
            let toastNode = instantiate(this.toastPrefab);
            toastNode.parent = this.node;
            toastNode.active = false;
            this._toastPool.push(toastNode);
        }
    }

    show(text: string) {
        const now = Date.now();
        if (now - this._lastShowTime < this.debounceDelay) return;
        this._lastShowTime = now;

        if (!text) return;

        try {
            // 确保ToastManager节点在最顶层
            const p = this.node.parent;
            if (p) {
                this.node.setSiblingIndex(p.children.length - 1);
                // 额外确保在Canvas的最顶层
                let canvas = p;
                while (canvas.parent) {
                    canvas = canvas.parent;
                }
                // 如果不在Canvas的直接子节点，尝试移动到Canvas
                if (p !== canvas) {
                    const canvasChildren = canvas.children;
                    if (canvasChildren && canvasChildren.length > 0) {
                        const lastIndex = canvasChildren.length - 1;
                        if (p.getSiblingIndex() < lastIndex) {
                            p.setSiblingIndex(lastIndex);
                        }
                    }
                }
            }
            this.node.active = true;
        } catch (e) {
            console.warn('ToastManager: 设置层级失败', e);
        }

        let toastNode = this._toastPool.find(node => !node.active);
        if (!toastNode) return;

        const label = toastNode.getChildByName("bg")?.getChildByName("text")?.getComponent(Label);
        if (!label) return;

        const uiOpacity = toastNode.getComponent(UIOpacity);

        label.string = text;
        toastNode.active = true;
        if (uiOpacity) uiOpacity.opacity = 255;
        toastNode.setPosition(toastNode.position.x, 200, toastNode.position.z);

        // 移动动画（含延迟 + easing）
        tween(toastNode)
            .delay(this.delayBeforeMove)
            .by(this.moveDuration, { position: new Vec3(0, this.moveDistance, 0) }, { easing: 'quadIn' })  // 先慢后快
            .call(() => {
                toastNode.active = false;
            })
            .start();

        if (uiOpacity) {
            // 渐隐动画（同步延迟）
            tween(uiOpacity)
                .delay(this.delayBeforeMove)
                .to(this.fadeDuration, { opacity: 0 }, { easing: 'quadIn' })
                .start();
        }
    }
}
