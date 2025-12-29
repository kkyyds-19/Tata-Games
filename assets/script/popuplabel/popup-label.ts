import { _decorator, Component, Node, Label, Font, Color, CCFloat, CCInteger, CCBoolean } from 'cc';
import { TimeManager } from '../game/TimeManager';
import { LabelAnimData } from './label-anim-data';
import { LabelAnimRuntimeInfo } from './label-anim-runtime-info';
import { ObjectPool } from './object-pool';
const { ccclass, property } = _decorator;

@ccclass('PopUpLabel')
export class PopUpLabel extends Component {
    

    @property({
        type: [Font]
    })
    private pop_fonts: Array<Font> =[];


    // public get fonts(): Array<Font> {
    //     return this._fonts;
    // }
    // public set fonts(v: Array<Font>) {
    //     this._fonts = v;
    // }

    @property(CCFloat)
    private _spacingX: number = 0;
    @property({
        type: CCFloat,
        tooltip: "字间距"
    })
    public get spacingX(): number {
        return this._spacingX;
    }
    public set spacingX(v: number) {
        this._spacingX = v;
    }

    @property(CCFloat)
    private _fontSize: number = 24;
    @property({
        type: CCFloat,
        tooltip: "字体大小",
        range: [8, 72, 1]
    })
    public get fontSize(): number {
        return this._fontSize;
    }
    public set fontSize(v: number) {
        this._fontSize = Math.max(8, v);
    }

    @property(Color)
    private _color: Color = Color.WHITE;
    @property({
        type: Color,
        tooltip: "文字颜色"
    })
    public get color(): Color {
        return this._color;
    }
    public set color(v: Color) {
        this._color = v;
        this.updateAllLabelsColor();
    }

    @property(CCBoolean)
    private _enableOutline: boolean = false;
    @property({
        type: CCBoolean,
        tooltip: "是否启用描边"
    })
    public get enableOutline(): boolean {
        return this._enableOutline;
    }
    public set enableOutline(v: boolean) {
        this._enableOutline = v;
        this.updateAllLabelsOutline();
    }

    @property(CCFloat)
    private _outlineWidth: number = 2;
    @property({
        type: CCFloat,
        tooltip: "描边宽度",
        range: [0, 10, 0.1],
        visible: function() { return this._enableOutline; }
    })
    public get outlineWidth(): number {
        return this._outlineWidth;
    }
    public set outlineWidth(v: number) {
        this._outlineWidth = Math.max(0, v);
        this.updateAllLabelsOutline();
    }

    @property(Color)
    private _outlineColor: Color = Color.BLACK;
    @property({
        type: Color,
        tooltip: "描边颜色",
        visible: function() { return this._enableOutline; }
    })
    public get outlineColor(): Color {
        return this._outlineColor;
    }
    public set outlineColor(v: Color) {
        this._outlineColor = v;
        this.updateAllLabelsOutline();
    }

    /** 
     * 添加一个动画
     */
    public addAnim(data: LabelAnimData | LabelAnimData[]) {
        (Array.isArray(data) ? data : [data]).forEach((d) => {
            const anim = ObjectPool.allocate(LabelAnimRuntimeInfo, d, null, this.spacingX, this._fontSize);
            this._allAnims.push(anim);
            this.createLabelForAnim(anim);
        });
    }

    private _allAnims: LabelAnimRuntimeInfo[] = [];
    private _labelNodes: Node[] = [];

    public get anims(): LabelAnimRuntimeInfo[] {
        return this._allAnims.filter(a => a.active);
    }

    onEnable() {
        // 组件启用时的逻辑
    }

    update(dt: number) {
        let needCleanup = false;
        const scaledDt = TimeManager.getInstance().getDeltaTime(dt);
        // 更新所有动画
        this._allAnims.forEach((anim, index) => {
            anim.update(scaledDt);
            
            if (anim.shouldRecycle) {
                needCleanup = true;
                // 销毁对应的Label节点
                if (this._labelNodes[index] && this._labelNodes[index].isValid) {
                    this._labelNodes[index].destroy();
                }
                this._labelNodes[index] = null;
                anim.release();
            } else if (anim.active) {
                // 更新Label的位置、缩放、颜色等
                this.updateLabelTransform(anim, this._labelNodes[index]);
            }
        });

        // 清理已回收的动画和节点
        if (needCleanup) {
        this._allAnims = this._allAnims.filter(a => !a.shouldRecycle);
            this._labelNodes = this._labelNodes.filter(n => n !== null);
        }
    }

    /**
     * 为动画创建对应的Label节点
     */
    private createLabelForAnim(anim: LabelAnimRuntimeInfo) {
        const labelNode = new Node('PopupText');
        labelNode.setParent(this.node);
        
        const labelComp = labelNode.addComponent(Label);
        labelComp.string = anim.data.text;
        labelComp.fontSize = this._fontSize;
        labelComp.color = this._color.clone();
        
        // 设置Label属性确保背景透明
        labelComp.enableWrapText = false;
        labelComp.overflow = Label.Overflow.NONE;
        labelComp.horizontalAlign = Label.HorizontalAlign.CENTER;
        labelComp.verticalAlign = Label.VerticalAlign.CENTER;
        
        // 确保节点层级正确
        labelNode.layer = this.node.layer;
        
        // 设置字体
        if (this.pop_fonts && this.pop_fonts[anim.data.font]) {
            labelComp.font = this.pop_fonts[anim.data.font];
        }
        
        // 设置描边
        labelComp.enableOutline=this._enableOutline
        if (this._enableOutline) {
            labelComp.outlineWidth = this._outlineWidth;
            labelComp.outlineColor = this._outlineColor.clone();
        } 
        
        // 设置初始状态
        labelNode.setPosition(anim.data.from.position.x, anim.data.from.position.y, 0);
        labelNode.setScale(anim.data.from.scale, anim.data.from.scale, 1);
        
        // 设置初始颜色
        const initialColor = anim.data.from.color.multiply(this._color);
        labelComp.color = initialColor;
        
        this._labelNodes.push(labelNode);
        
        // console.log('Debug - Created label for animation:', {
        //     text: anim.data.text,
        //     fontSize: this._fontSize,
        //     initialPos: anim.data.from.position,
        //     initialScale: anim.data.from.scale,
        //     initialColor: initialColor,
        //     nodeLayer: labelNode.layer,
        //     parentLayer: this.node.layer,
        //     overflow: 'NONE',
        //     alignment: 'CENTER',
        //     hasBackground: false,
        //     nodeComponents: labelNode.components.map(c => c.constructor.name)
        // });
    }

    /**
     * 更新Label的变换属性
     */
    private updateLabelTransform(anim: LabelAnimRuntimeInfo, labelNode: Node) {
        if (!labelNode || !labelNode.isValid) {
            return;
        }

        const labelComp = labelNode.getComponent(Label);
        if (!labelComp) {
            return;
        }

        // 更新位置
        labelNode.setPosition(
            anim.current.position.x,
            anim.current.position.y,
            0
        );

        // 更新缩放
        const scale = anim.current.scale;
        labelNode.setScale(scale, scale, 1);

        // 更新颜色
        const currentColor = anim.current.color.multiply(this._color);
        labelComp.color = currentColor;
    }

    /**
     * 更新所有Label的颜色
     */
    private updateAllLabelsColor() {
        this._labelNodes.forEach((labelNode, index) => {
            if (labelNode && labelNode.isValid) {
                const labelComp = labelNode.getComponent(Label);
                const anim = this._allAnims[index];
                if (labelComp && anim) {
                    const newColor = anim.current.color.multiply(this._color);
                    labelComp.color = newColor;
                }
            }
        });
    }

    /**
     * 更新所有Label的描边
     */
    private updateAllLabelsOutline() {
        this._labelNodes.forEach((labelNode, index) => {
            if (labelNode && labelNode.isValid) {
                const labelComp = labelNode.getComponent(Label);
                if (labelComp) {
                    if (this._enableOutline) {
                        labelComp.outlineWidth = this._outlineWidth;
                        labelComp.outlineColor = this._outlineColor.clone();
                    } else {
                        labelComp.outlineWidth = 0;
                    }
                }
            }
        });
    }

    onLoad() {
        console.log('Debug - PopUpLabel loaded with system Label approach');
    }

    onDestroy() {
        // 清理所有Label节点
        this._labelNodes.forEach(node => {
            if (node && node.isValid) {
                node.destroy();
            }
        });
        this._labelNodes.length = 0;
        
        // 清理动画数据
        this._allAnims.forEach(anim => anim.release());
        this._allAnims.length = 0;
    }
}
