import { _decorator, Component, Node, Label, Vec3, Vec2, Color, UITransform, Camera, find } from 'cc';
import { LabelAnimData } from '../popuplabel/label-anim-data';
import { ObjectPool } from '../popuplabel/object-pool';
import { PopUpLabel } from '../popuplabel/popup-label';
import { PopUpLabelHelper } from '../popuplabel/popup-label-helper';

const { ccclass, property } = _decorator;

@ccclass('Popup')
export class Popup extends Component {
    private static _instance: Popup;
    public static get instance(): Popup {
        return this._instance;
    }

    @property(PopUpLabel)
    popup: PopUpLabel = null;

    @property(Node)
    public labelPool: Node | null = null;

    private readonly POOL_SIZE: number = 20;
    private readonly POPUP_DURATION: number = 1;
    private readonly POPUP_MOVE_DISTANCE: number = 100;

    private readonly COLOR_DAMAGE: Color = new Color(255, 0, 0, 255);  // 红色
    private readonly COLOR_HEAL: Color = new Color(0, 255, 0, 255);    // 绿色

    onLoad() {
         // 初始化对象池
        ObjectPool.init();
        Popup._instance = this;
        this.initPool();
    }

    private initPool() {
        if (!this.labelPool) return;

        // 预创建标签节点池
        for (let i = 0; i < this.POOL_SIZE; i++) {
            const labelNode = new Node();
            const label = labelNode.addComponent(Label);
            label.fontSize = 40;
            label.lineHeight = 40;
            labelNode.parent = this.labelPool;
            labelNode.active = false;
        }
    }

    onDestroy() {
        Popup._instance = null;
    }
   
    /**
     * 显示弹出文字
     * @param text 显示文本
     * @param position 世界坐标位置 (Vec2 或 Vec3)
     * @param color 颜色 (可选)
     * @param duration 持续时间 (可选)
     */
    showText(text: string, position: Vec2 | Vec3, color?: Color, duration: number = 0.6) {
        if (!this.popup) {
            console.warn('PopupLabels: popup组件未设置');
            return;
        }

        const startPos = new Vec2(position.x, position.y);
        const animData = PopUpLabelHelper.createTextAnim(text, startPos, color, duration);
        
        this.popup.addAnim(animData);
        animData.release();
    }

    /**
     * 显示伤害数字
     * @param damage 伤害值
     * @param position 世界坐标位置
     * @param isCritical 是否暴击
     * @param color 文字颜色 (可选)
     */
    showDamage(damage: number, position: Vec2 | Vec3, isCritical: boolean = false, color?: Color) {
        if (!this.popup) {
            console.warn('PopupLabels: popup组件未设置');
            return;
        }

        const startPos = new Vec2(position.x, position.y);
        const animData = PopUpLabelHelper.createDamageAnim(damage, startPos, isCritical, color);
        this.popup.addAnim(animData);
        animData.release();
    }

    /**
     * 显示治疗数字
     * @param heal 治疗值
     * @param position 位置
     */
    showHeal(heal: number, position: Vec2 | Vec3) {
        if (!this.popup) {
            console.warn('PopupLabels: popup组件未设置');
            return;
        }

        const startPos = new Vec2(position.x, position.y);
        const animData = PopUpLabelHelper.createHealAnim(heal, startPos);
        
        this.popup.addAnim(animData);
        animData.release();
    }

    /**
     * 显示经验值
     * @param exp 经验值
     * @param position 位置
     */
    showExp(exp: number, position: Vec2 | Vec3) {
        if (!this.popup) {
            console.warn('PopupLabels: popup组件未设置');
            return;
        }

        const startPos = new Vec2(position.x, position.y);
        const animData = PopUpLabelHelper.createExpAnim(exp, startPos);
        
        this.popup.addAnim(animData);
        animData.release();
    }

    /**
     * 显示金币
     * @param gold 金币数量
     * @param position 位置
     */
    showGold(gold: number, position: Vec2 | Vec3) {
        if (!this.popup) {
            console.warn('PopupLabels: popup组件未设置');
            return;
        }

        const startPos = new Vec2(position.x, position.y);
        const animData = PopUpLabelHelper.createCoinAnim(gold, startPos);
        
        this.popup.addAnim(animData);
        animData.release();
    }

    /**
     * 显示闪避
     * @param position 位置
     */
    showMiss(position: Vec2 | Vec3) {
        if (!this.popup) {
            console.warn('PopupLabels: popup组件未设置');
            return;
        }

        const startPos = new Vec2(position.x, position.y);
        const animData = PopUpLabelHelper.createMissAnim(startPos);
        
        this.popup.addAnim(animData);
        animData.release();
    }

    /**
     * 显示等级提升
     * @param level 新等级
     * @param position 位置
     */
    showLevelUp(level: number, position: Vec2 | Vec3) {
        if (!this.popup) {
            console.warn('PopupLabels: popup组件未设置');
            return;
        }

        const startPos = new Vec2(position.x, position.y);
        const animData = PopUpLabelHelper.createLevelUpAnim(level, startPos);
        
        this.popup.addAnim(animData);
        animData.release();
    }

    /**
     * 随机位置显示文字（测试用）
     * @param text 文本
     */
    showRandomText(text: string) {
        const x = (Math.random() * 2 - 1) * 200;
        const y = (Math.random() * 2 - 1) * 200;
        
        const randomColor = new Color(
            ~~(255 * Math.random()),
            ~~(255 * Math.random()),
            ~~(255 * Math.random()),
            255
        );
        
        this.showText(text, new Vec2(x, y), randomColor);
    }

    /**
     * 获取当前动画数量
     */
    getAnimCount(): number {
        return this.popup ? this.popup.anims.length : 0;
    }

    private showNumber(text: string, position: Vec2, color: Color) {
        if (!this.labelPool) return;

        // 获取一个未使用的标签节点
        const labelNode = this.getInactiveLabelNode();
        if (!labelNode) return;

        // 设置标签属性
        const label = labelNode.getComponent(Label);
        label.string = text;
        label.color = color;

        // 设置初始位置
        labelNode.setPosition(position.x, position.y, 0);
        labelNode.active = true;

        // 创建动画
        const startY = position.y;
        const endY = startY + this.POPUP_MOVE_DISTANCE;
        let currentTime = 0;

        // 清除之前的计时器
        const timerId = labelNode['timerId'];
        if (timerId) {
            clearInterval(timerId);
        }

        // 创建新的动画计时器
        const animationInterval = setInterval(() => {
            currentTime += 0.016; // 假设60fps
            if (currentTime >= this.POPUP_DURATION) {
                clearInterval(animationInterval);
                labelNode.active = false;
                return;
            }

            const progress = currentTime / this.POPUP_DURATION;
            const y = startY + (endY - startY) * progress;
            const alpha = 1 - progress;

            labelNode.setPosition(position.x, y, 0);
            label.color = new Color(color.r, color.g, color.b, Math.floor(255 * alpha));
        }, 16);

        // 保存计时器ID以便清理
        labelNode['timerId'] = animationInterval;
    }

    private getInactiveLabelNode(): Node | null {
        if (!this.labelPool) return null;

        // 查找未激活的标签节点
        for (const node of this.labelPool.children) {
            if (!node.active) {
                return node;
            }
        }

        // 如果没有可用的节点，创建新的
        if (this.labelPool.children.length < this.POOL_SIZE) {
            const labelNode = new Node();
            const label = labelNode.addComponent(Label);
            label.fontSize = 40;
            label.lineHeight = 40;
            labelNode.parent = this.labelPool;
            return labelNode;
        }

        // 如果达到池大小限制，重用最早的节点
        return this.labelPool.children[0];
    }
} 