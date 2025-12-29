import { Vec3, director, misc, rect, v3, view } from "cc";
import { Custom2D_Collide, Custom2D_Collide_Shape, Custom2D_Collide_Status } from "./Custom2D_Collide";
import Quadtree from "./Quadtree";
import Custom2D_Util from "./util/Custom2D_Util";

let __collideID: number = 1;

export class Custom2D_Collide_Manager {
    private static _custom2dManager: Custom2D_Collide_Manager = null;
    /** 用于检测碰撞的四叉树 */
    private _quadTree: Quadtree = null;
    /** 储存所有参与碰撞的碰撞体 */
    private _collides: Map<number, Custom2D_Collide> = new Map();
    /** 技能系统检测开关 */
    private _enable: boolean = true;
    /** 步长（每秒检测碰撞的次数） */
    private _step: number = 60;
    /** 距离上次检测碰撞的时间t */
    private _curr_t: number = 0;

    constructor() {
        this._quadTree = new Quadtree(rect(
            0,
            0,
            view.getVisibleSize().width,
            view.getVisibleSize().height
        ), 10, 8);
        __collideID = 1;
    }

    static get instance(): Custom2D_Collide_Manager {
        if (!this._custom2dManager) {
            this._custom2dManager = new Custom2D_Collide_Manager();
        }
        return this._custom2dManager;
    }

    /** 设置碰撞系统的开关 */
    set enable(b: boolean) {
        this._enable = b;
    }
    get enable(): boolean {
        return this._enable;
    }

    get quardTree(): Quadtree {
        return this._quadTree;
    }

    /** 步长（碰撞系统每秒检测碰撞的次数） */
    set step(s: number) {
        this._step = s;
    }

    get step(): number {
        return this._step;
    }

    insertCollide(collide: Custom2D_Collide) {
        if (!collide.id) collide.id = __collideID++;
        this._collides.set(collide.id, collide);
    }

    removeCollide(collide: Custom2D_Collide) {
        this._collides.delete(collide.id);

        // for (const [key, o] of collide.collide_map) {
        //     if (o && o.collide) {
        //         collide.onExit(collide, o.collide);
        //     }
        // }
        collide.collide_map?.forEach((o, key) => {
            if (o && o.collide) {
                collide.onExit(collide, o.collide);
            }
        })
        collide.collide_map.clear();
    }

    /**
     * 碰撞体状态切换
     * @param collide 
     */
    changeCollideStatus(collide: Custom2D_Collide) {
        collide.collide_map?.forEach((o, key) => {
            if (o) {
                if (o.status === Custom2D_Collide_Status.onEnter) {
                    o.status = Custom2D_Collide_Status.PreExit;
                } else if (o.status === Custom2D_Collide_Status.PreExit) {
                    o.status = Custom2D_Collide_Status.Exit;
                    collide.collide_map.delete(o.collide?.id);
                    collide.onExit(collide, o.collide);
                } else {
                    collide.collide_map.delete(o.collide?.id);
                }
            }
        })
    }

    /**
     * 碰撞中
     * @param collide 
     */
    colliding(collide: Custom2D_Collide, myCollide: Custom2D_Collide, b: boolean = true) {
        let o = collide.collide_map.get(myCollide.id);
        if (o) {
            o.status = Custom2D_Collide_Status.onEnter;
        }
        else {
            collide.collide_map.set(myCollide.id, {
                collide: myCollide,
                status: Custom2D_Collide_Status.onEnter,
            });
            collide.onEnter(collide, myCollide);
        }

        if (b) {
            this.colliding(myCollide, collide, false);
        }
    }

    /** 判断两个碰撞体是否相交 */
    collideIsIntersects(collide: Custom2D_Collide, myCollide: Custom2D_Collide) {
        let isIntersects: boolean = false;
        switch (collide.shape | myCollide.shape) {
            case (Custom2D_Collide_Shape.Circle | Custom2D_Collide_Shape.Circle):    // 圆与圆
                isIntersects = Custom2D_Util.circleIntersectsCircle(collide.worldPoints[0], collide.worldRadius, myCollide.worldPoints[0], myCollide.worldRadius);
                break;
            case (Custom2D_Collide_Shape.OBB | Custom2D_Collide_Shape.OBB):   // 矩形与矩形
                {
                    let angle1: Vec3 = v3(), angle2: Vec3 = v3();
                    collide.node.worldRotation.clone().getEulerAngles(angle1);
                    myCollide.node.worldRotation.clone().getEulerAngles(angle2);
                    if (angle1.z === 0 && angle2.z === 0) {
                        isIntersects = Custom2D_Util.aabbIntersectsAabb(collide.worldAABB, myCollide.worldAABB);
                    } else {
                        isIntersects = Custom2D_Util.polygonInterectsPolygon(collide.worldPoints, myCollide.worldPoints)
                    }
                }
                break;
            case (Custom2D_Collide_Shape.Circle | Custom2D_Collide_Shape.OBB):   // 圆与矩形
                {
                    let angle: Vec3 = v3();
                    let circleCollide: Custom2D_Collide, obbCollide: Custom2D_Collide;
                    if (collide.shape === Custom2D_Collide_Shape.OBB) {
                        obbCollide = collide;
                        circleCollide = myCollide;
                    } else {
                        obbCollide = myCollide;
                        circleCollide = collide;
                    }
                    obbCollide.node.worldRotation.clone().getEulerAngles(angle);
                    if (angle.z === 0) {
                        isIntersects = Custom2D_Util.circleIntersectsAabb(circleCollide.worldPoints[0], circleCollide.worldRadius, obbCollide.worldAABB);
                    } else {
                        isIntersects = Custom2D_Util.circleInterectsPolygon(circleCollide.worldPoints[0], circleCollide.worldRadius, obbCollide.worldPoints);
                    }
                }
                break;
            case (Custom2D_Collide_Shape.Circle | Custom2D_Collide_Shape.Arc):  // 圆与扇形
            case (Custom2D_Collide_Shape.Circle | Custom2D_Collide_Shape.Polygon):  // 圆与多边形
            case (Custom2D_Collide_Shape.Circle | Custom2D_Collide_Shape.Ellipse):  // 圆与椭圆
                {
                    let circleCollide: Custom2D_Collide, polygonCollide: Custom2D_Collide;
                    if (collide.shape === Custom2D_Collide_Shape.Circle) {
                        circleCollide = collide;
                        polygonCollide = myCollide;
                    } else {
                        circleCollide = myCollide;
                        polygonCollide = collide;
                    }
                    isIntersects = Custom2D_Util.circleInterectsPolygon(circleCollide.worldPoints[0], circleCollide.worldRadius, polygonCollide.worldPoints);
                }
                break;
            default: // 多边形与多边形
                isIntersects = Custom2D_Util.polygonInterectsPolygon(collide.worldPoints, myCollide.worldPoints);
                break;
        }
        return isIntersects;
    }

    update(dt: number) {
        if (!this.enable || this.step <= 0) return;
        if (this._curr_t + dt < 1 / this.step) return;
        this._curr_t = 0;

        this._quadTree.clear();

        // for (const [key, collide] of this._collides) {
        //     if (!collide || !collide.isValid || !collide.enable) continue;
        //     this._quadTree.insert(collide.worldAABB)
        // }
        this._collides?.forEach((collide, key) => {
            if (collide && collide.isValid && collide.enable)
                this._quadTree?.insert(collide);
        });

        this._collides?.forEach((collide, key) => {
            // 变更碰撞状态，若预分离，变为分离，碰撞中状态则变为预分离
            this.changeCollideStatus(collide);
            // 寻找四叉树内相同区域的碰撞体
            let candidates = this._quadTree?.retrieve(collide);
            candidates?.forEach(myCollide => {
                // 判断两个碰撞体是否能碰撞
                if (collide && collide.canCollide(myCollide)) {
                    // 检测是否相交
                    if (this.collideIsIntersects(collide, myCollide)) {
                        // 变更碰撞状态为碰撞中
                        this.colliding(collide, myCollide);
                    }
                }
            });
        });
    }
}


