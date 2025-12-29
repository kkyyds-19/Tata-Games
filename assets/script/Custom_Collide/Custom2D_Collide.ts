import { _decorator, CCBoolean, CCFloat, CCInteger, Color, Component, Enum, Graphics, math, Size, Vec2, PhysicsGroup, v2, rect, Rect, PhysicsSystem, isValid, director, toRadian, view } from 'cc';
import { Custom2D_Collide_Manager } from './Custom2D_Manager';
const { ccclass, property, executeInEditMode, type } = _decorator;

export enum Custom2D_Collide_Shape {
    /** 圆 */
    Circle = 1,
    /** 矩形(可旋转) */
    OBB = 1 << 1,
    /** 扇形 */
    Arc = 1 << 2,
    /** 多边形 */
    Polygon = 1 << 3,
    /** 椭圆形 */
    Ellipse = 1 << 4
}

export enum Custom2D_Collide_Status {
    Exit = 0,
    onEnter = 1,
    PreExit = 2,
}

export interface Custom2D_Collide_Info {
    collide: Custom2D_Collide,
    status: Custom2D_Collide_Status,
}

@ccclass('Custom2D_Collide')
@executeInEditMode
export class Custom2D_Collide extends Component {
    @property
    protected _isDraw: boolean = true;
    @property({ type: CCBoolean, displayName: "是否绘制形状" })
    get isDraw(): boolean {
        return this._isDraw;
    }
    set isDraw(value: boolean) {
        this._isDraw = value;
        this.draw_shape();
    }
    @property
    protected _isFill: boolean = false;
    @property({ type: CCBoolean, displayName: "是否填充" })
    get isFill(): boolean {
        return this._isFill;
    }
    set isFill(value: boolean) {
        this._isFill = value;
        this.draw_shape();
    }

    @property({ type: Enum(PhysicsGroup) })
    protected _customGroup = PhysicsGroup.DEFAULT;
    @property({ tooltip: "碰撞组将决定碰撞对象", type: Enum(PhysicsGroup), displayName: "碰撞组" })
    get group() {
        return this._customGroup;
    }
    set group(value) {
        this._customGroup = value;
        this.draw_shape();
        this.onGroupChanged();
    }
    /** 圆形 */
    @property({ type: Enum(Custom2D_Collide_Shape) })
    protected _shape: Custom2D_Collide_Shape = Custom2D_Collide_Shape.Circle;
    @property({ tooltip: "Circle为原型,OBB带角度的矩形,Arc扇形,Polygon为多边形", type: Enum(Custom2D_Collide_Shape), displayName: "形状" })
    get shape(): Custom2D_Collide_Shape {
        return this._shape;
    }
    set shape(value: Custom2D_Collide_Shape) {
        this._shape = value;
        this.draw_shape();
    }

    /** 扇形 */
    @property({ type: CCFloat })
    protected _startAngle: number = 45;
    @property({ tooltip: "扇形起始角度(顺时针画扇形到终止角度)", visible() { return this.shape === Custom2D_Collide_Shape.Arc; }, displayName: "起始角度" })
    get startAngle(): number {
        return this._startAngle;
    }
    set startAngle(value: number) {
        this._startAngle = value;
        this.initPoints();
        this.draw_shape();
    }
    @property({ type: CCFloat })
    protected _endAngle: number = -45;
    @property({ tooltip: "扇形终止角度", visible() { return this.shape === Custom2D_Collide_Shape.Arc; }, displayName: "终止角度" })
    get endAngle(): number {
        return this._endAngle;
    }
    set endAngle(value: number) {
        this._endAngle = value;
        this.initPoints();
        this.draw_shape();
    }
    /** 圆形、扇形半径 */
    @property({ type: CCInteger })
    protected _radius: number = 50;
    @property({ tooltip: "圆形或扇形半径", visible() { return this.shape === Custom2D_Collide_Shape.Circle || this.shape === Custom2D_Collide_Shape.Arc; }, displayName: "半径" })
    get radius(): number {
        return this._radius;
    }
    set radius(value: number) {
        this._radius = value;
        this.initPoints();
        this.draw_shape();
    }

    /** 椭圆 */
    @property({ type: CCFloat })
    protected _longAxis: number = 200;
    @property({ tooltip: "椭圆长轴一半（长轴默认在x轴,若想长轴在y轴，可以将椭圆旋转90度）", visible() { return this.shape === Custom2D_Collide_Shape.Ellipse; }, displayName: "a" })
    get longAxis(): number {
        return this._longAxis;
    }
    set longAxis(value: number) {
        this._longAxis = value;
        this.initPoints();
        this.draw_shape();
    }
    @property({ type: CCFloat })
    protected _shortAxis: number = 50;
    @property({ tooltip: "椭圆短轴一半（（短轴默认在y轴,若想短轴在x轴，可以将椭圆旋转90度）", visible() { return this.shape === Custom2D_Collide_Shape.Ellipse; }, displayName: "b" })
    get shortAxis(): number {
        return this._shortAxis;
    }
    set shortAxis(value: number) {
        this._shortAxis = value;
        this.initPoints();
        this.draw_shape();
    }

    /** 扇形 、椭圆份数 */
    @property({ type: CCInteger })
    protected _phr: number = 10;
    @property({ tooltip: "扇形(椭圆)被等分份数，份数越多越趋近扇形(椭圆)", visible() { return this.shape === Custom2D_Collide_Shape.Arc || this.shape === Custom2D_Collide_Shape.Ellipse; }, displayName: "份数" })
    get PHR(): number {
        return this._phr;
    }
    set PHR(value: number) {
        if (!value) return;
        this._phr = value;
        this.initPoints();
        this.draw_shape();
    }

    /** 矩形 */
    @property
    protected _size: Size = new Size(100, 100);
    @property({ tooltip: "矩形长宽", visible() { return this.shape === Custom2D_Collide_Shape.OBB; }, displayName: "长宽" })
    get size(): Size {
        return this._size;
    }
    set size(value: Size) {
        this._size = value;
        this.draw_shape();
    }

    /** 多边形 */
    @property({ type: Vec2 })
    protected _points: Vec2[] = [new Vec2(-45, -45), new Vec2(45, -45), new Vec2(60, 40), new Vec2(0, 70), new Vec2(-60, 40)];
    @property({ type: Vec2, visible() { return this.shape === Custom2D_Collide_Shape.Polygon; }, displayName: "多边形碰撞点" })
    get points() {
        return this._points;
    }
    set points(v) {
        if (v.length < 3) return;
        this._points = v;
        this.draw_shape();
    }
    @property
    public _offset: Vec2 = new Vec2(0, 0);
    @property({ displayName: "位置偏移" })
    get offset(): Vec2 {
        return this._offset;
    }
    set offset(value: Vec2) {
        this._offset = value;
        this.draw_shape();
    }

    onLostFocusInEditor() {
        this.draw_shape();
    }

    onFocusInEditor() {
        this.draw_shape();
    }

    resetInEditor() {
        this.draw_shape();
    }

    //是否可碰撞
    private _enable: boolean = false;
    /** 该组件只有自身_enable属性及commponent被激活(comp的enabled属性为true)才参与碰撞检测 */
    get enable() {
        return this._enable && this.enabled;
    }
    set enable(b: boolean) {
        if (this._enable === b) return;
        this._enable = b;
        if (b) {
            Custom2D_Collide_Manager.instance.insertCollide(this);
        } else {
            Custom2D_Collide_Manager.instance.removeCollide(this);
        }
    }

    //唯一id
    private __id: number = 0;
    set id(id: number) {
        this.__id = id;
    }
    get id(): number {
        return this.__id;
    }

    //状态
    private __status: Custom2D_Collide_Status = Custom2D_Collide_Status.Exit;
    set status(s: Custom2D_Collide_Status) {
        this.__status = s;
    }
    get status(): Custom2D_Collide_Status {
        return this.__status;
    }

    // 储存当前的与自身发生碰撞的对象
    public collide_map: Map<number, Custom2D_Collide_Info> = new Map();

    private _g: Graphics = null;

    start() {
        this.initPoints();
        this.draw_shape();
    }

    onDisable(): void {
        this.enable = false;
    }

    initGraphics() {
        if (!this._g) {
            this._g = this.node?.getComponent(Graphics);
            if (!this._g) {
                this._g = this.node?.addComponent(Graphics);
                this._g.lineWidth = 60;
                this._g.lineJoin = Graphics.LineJoin.MITER;
                this._g.lineCap = Graphics.LineCap.BUTT;
                this._g.miterLimit = 10;
                this._g.strokeColor = Color.RED;
                this._g.fillColor = Color.BLUE;
            }
        }
    }

    draw_shape() {
        this.initGraphics();
        this._g.clear();
        if (!this.isDraw) {
            this._g.destroy();
            this._g = null;
            return;
        }

        switch (this.shape) {
            case Custom2D_Collide_Shape.Circle:
                this._g.circle(this.offset.x, this.offset.y, this._radius);
                this._g.stroke();
                break;
            case Custom2D_Collide_Shape.OBB:
                this._g.moveTo(-this.size.width * 0.5 + this.offset.x, -this.size.height * 0.5 + this.offset.y);
                this._g.lineTo(-this.size.width * 0.5 + this.offset.x, this.size.height * 0.5 + this.offset.y);
                this._g.lineTo(this.size.width * 0.5 + this.offset.x, this.size.height * 0.5 + this.offset.y);
                this._g.lineTo(this.size.width * 0.5 + this.offset.x, -this.size.height * 0.5 + this.offset.y);
                this._g.close();
                this._g.stroke();
                break;
            case Custom2D_Collide_Shape.Arc:
            case Custom2D_Collide_Shape.Ellipse:
            case Custom2D_Collide_Shape.Polygon:
                this.initPoints();
                this._g.moveTo(this.points[0].x + this.offset.x, this.points[0].y + this.offset.y);
                for (let i = 1; i < this.points.length; i++) {
                    this._g.lineTo(this.points[i].x + this.offset.x, this.points[i].y + this.offset.y);
                }
                this._g.close();
                this._g.stroke();
                break;

        }
        if (this.isFill) this._g.fill();
    }

    onGroupChanged() {
        // console.log('==============>mask: ', this.mask);
        // console.log('==============>group: ', this.group);
    }

    initPoints() {
        if (this.shape === Custom2D_Collide_Shape.Arc) {
            const points = [v2(0, 0)];
            // 扇形绘制总度数
            const totalDegree: number = this.getTotalDegree();
            const a = totalDegree / this.PHR;
            const startRadius = toRadian(this.startAngle);
            const endRadius = toRadian(this.endAngle);
            // 起始向量
            const startVec: Vec2 = v2(Math.cos(startRadius) * this.radius, Math.sin(startRadius) * this.radius);
            points.push(startVec);
            for (let i = 1; i < this.PHR; i++) {
                let radius = toRadian(a * i);
                points.push(v2(Math.cos(radius) * startVec.x + Math.sin(radius) * startVec.y, -Math.sin(radius) * startVec.x + Math.cos(radius) * startVec.y));
            }
            const endVec: Vec2 = v2(Math.cos(endRadius) * this.radius, Math.sin(endRadius) * this.radius);
            points.push(endVec);

            this._points = points;
        } else if (this.shape === Custom2D_Collide_Shape.Ellipse) {
            const points = [v2(this.longAxis, 0)];
            const a = 360 / this.PHR;
            for (let i = 1; i < this.PHR; i++) {
                const radius = toRadian(a * i);
                points.push(v2(this.longAxis * Math.cos(radius), this.shortAxis * Math.sin(radius)));
            }
            this._points = points;
        }

    }

    getTotalDegree() {
        if (isNaN(this.startAngle) || isNaN(this.endAngle)) return 0;
        let startAngle = this.startAngle;
        while (startAngle < 0) {
            startAngle += 360;
        }
        while (startAngle > 360) {
            startAngle -= 360;
        }
        let endAngle = this.endAngle;
        while (endAngle < 0) {
            endAngle += 360;
        }
        while (endAngle > 360) {
            endAngle -= 360;
        }
        return endAngle - startAngle < 0 ? Math.abs(endAngle - startAngle) : (360 - Math.abs(endAngle - startAngle));
    }

    /**
    * @en
    * Get the world aabb of the collider.
    * @zh
    * 获取碰撞体的世界坐标系下的顶点坐标。
    */
    get worldPoints(): Readonly<Vec2>[] {
        let worldPoints: Vec2[] = [];
        switch (this.shape) {
            case Custom2D_Collide_Shape.Circle:
                // 世界坐标下的圆心
                worldPoints[0] = v2();
                Vec2.transformMat4(worldPoints[0], v2(this.offset.x, this.offset.y), this.node.worldMatrix)
                break;
            case Custom2D_Collide_Shape.OBB:
                worldPoints = [v2(), v2(), v2(), v2()];
                const aabb = rect();
                aabb.x = this.offset.x - this.size.width / 2;
                aabb.y = this.offset.y - this.size.height / 2;
                aabb.width = this.size.width;
                aabb.height = this.size.height;
                aabb.transformMat4ToPoints(this.node.worldMatrix, worldPoints[0], worldPoints[1], worldPoints[2], worldPoints[3]);
                break;
            case Custom2D_Collide_Shape.Arc:
            case Custom2D_Collide_Shape.Polygon:
            case Custom2D_Collide_Shape.Ellipse:
                const points = this.points;
                const m = this.node.worldMatrix;
                for (let i = 0; i < points.length; i++) {
                    if (!worldPoints[i]) {
                        worldPoints[i] = new Vec2();
                    }
                    Vec2.transformMat4(worldPoints[i], points[i].clone().add(v2(this.offset.x, this.offset.y)), m);
                }
                break;

        }
        return worldPoints;
    }

    /**
     * 获取circle在世界坐标系下的实际半径
     */
    get worldRadius() {
        let r = Math.abs(this.node?.worldScale?.x) || 1;
        return this.radius * r;
    }

    /**
    * @en
    * Get the world aabb of the collider.
    * @zh
    * 获取碰撞体的世界坐标系下的包围盒。
    * x,y为左下点
    */
    get worldAABB(): Readonly<Rect> {
        const aabb = new Rect();
        const wps = this.worldPoints;
        switch (this.shape) {
            case Custom2D_Collide_Shape.Circle:
                {
                    aabb.width = this.worldRadius * 2;
                    aabb.height = this.worldRadius * 2;
                    aabb.x = wps[0].x - this.worldRadius;
                    aabb.y = wps[0].y - this.worldRadius;
                }
                break;
            case Custom2D_Collide_Shape.OBB:
                {
                    const minx = Math.min(wps[0].x, wps[1].x, wps[2].x, wps[3].x);
                    const miny = Math.min(wps[0].y, wps[1].y, wps[2].y, wps[3].y);
                    const maxx = Math.max(wps[0].x, wps[1].x, wps[2].x, wps[3].x);
                    const maxy = Math.max(wps[0].y, wps[1].y, wps[2].y, wps[3].y);
                    aabb.width = maxx - minx;
                    aabb.height = maxy - miny;
                    aabb.x = minx;
                    aabb.y = miny;
                }
                break;
            case Custom2D_Collide_Shape.Arc:
            case Custom2D_Collide_Shape.Polygon:
            case Custom2D_Collide_Shape.Ellipse:
                {
                    let minx = Number.MAX_SAFE_INTEGER;
                    let miny = Number.MAX_SAFE_INTEGER;
                    let maxx = Number.MIN_SAFE_INTEGER;
                    let maxy = Number.MIN_SAFE_INTEGER;
                    for (let i = 0; i < wps.length; i++) {
                        const p = wps[i];
                        if (!p || !(p instanceof Vec2)) continue;
                        if (p.x < minx) {
                            minx = p.x;
                        }
                        if (p.y < miny) {
                            miny = p.y;
                        }
                        if (p.x > maxx) {
                            maxx = p.x;
                        }
                        if (p.y > maxy) {
                            maxy = p.y;
                        }
                    }
                    aabb.width = maxx - minx;
                    aabb.height = maxy - miny;
                    aabb.x = minx;
                    aabb.y = miny;
                }
                break;

        }
        return aabb;
    }

    get mask() {
        // 使用项目配置的碰撞矩阵，而不是依赖PhysicsSystem.instance
        // 根据settings/v2/packages/project.json中的配置
        // collisionMatrix 表示每个组可以与哪些组碰撞（位掩码）
        const collisionMatrix = {
            "0": 1,   // DEFAULT -> 组1
            "1": 4,   // monster -> 组4 (hero)
            "2": 1,   // hero_bullets -> 组1 (monster) ！！！这是关键修复
            "3": 4,   // monster_bullets -> 组4 (hero)
            "4": 1    // hero -> 组1 (monster)
        };
        
        const mask = collisionMatrix[`${this.group}`] || 0;
        return mask;
    }

    /** 检测碰撞体能否碰撞 */
    canCollide(other: Custom2D_Collide) {
        if (!other || !other.isValid || !isValid(other.node) || !this.isValid || !isValid(this.node)) return false;
        if (other === this) return false;
        if (!this.enable || !other.enable) return false;
        
        try {
            const canCollide = !!(this.mask & other.group);
            return canCollide;
        } catch (error) {
            console.warn('canCollide error:', error);
            return false;
        }
    }

    /** 获取当前与该collide发生碰撞的collides */
    get collidingColliders() {
        let arr = [];
        this.collide_map?.forEach((collide, id) => {
            if (collide.status === Custom2D_Collide_Status.onEnter || collide.status === Custom2D_Collide_Status.PreExit) {
                arr.push(collide);
            }
        });
        return arr;
    }

    public onEnter(selfCollide: Custom2D_Collide, otherCollide: Custom2D_Collide) { }
    public onExit(selfCollide: Custom2D_Collide, otherCollide: Custom2D_Collide) { }
    public onCollide(collide: Custom2D_Collide) { }
}


