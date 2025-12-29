import { BitmapFont, Rect, easing, lerp } from "cc";
import { LabelAnimData } from "./label-anim-data";
import { LabelAnimState } from "./label-anim-state";
import { ObjectPool, PoolItem } from "./object-pool";

@ObjectPool.register()
export class LabelAnimRuntimeInfo implements PoolItem {
    initialize(anim: LabelAnimData, font: any, spacingX: number, fontSize: number = 24) {
        this.progress = 0;
        this.ts = 0;
        this.shouldRecycle = false;
        this.len = anim.text.length;
        this.data.copy(anim);
        this.fontSize = fontSize;
        this.isFadingOut = false;
        this.fadeOutTimer = 0;

        // 设置初始颜色
        this.current.color.r = this.data.from.color.r;
        this.current.color.g = this.data.from.color.g;
        this.current.color.b = this.data.from.color.b;
        this.current.color.a = this.data.from.color.a;

        // 设置初始位置和缩放
        this.current.position.set(this.data.from.position);
        this.current.scale = this.data.from.scale;
    }

    release() {
        this.current.reset();
        this.fontSize = 24;
    }
   
    quadraticBezier(t: number, p0: number, p1: number, p2: number): number {
        const u = 1 - t;
        return u * u * p0 + 2 * u * t * p1 + t * t * p2;
    }

    setcurrentColor(r: number, g: number, b: number) {
        this.current.color.r = r;
        this.current.color.g = g;
        this.current.color.b = b;
    }

    update(dt: number) {
        this.ts += dt;
        if (this.ts < this.data.delay) {
            return;
        }

        if (this.isFadingOut) {
            this.updateFadeOut(dt);
            return;
        }
        
        this.progress = Math.min(1, (this.ts - this.data.delay) / this.data.duration);
        const r = easing[this.data.ease](this.progress);
        
        // 更新缩放
        this.current.scale = lerp(this.data.from.scale, this.data.to.scale, r);
        
        // 更新透明度
        this.current.color.a = lerp(this.data.from.color.a, this.data.to.color.a, r);
        
        // 更新颜色（如果需要）
        this.current.color.r = lerp(this.data.from.color.r, this.data.to.color.r, r);
        this.current.color.g = lerp(this.data.from.color.g, this.data.to.color.g, r);
        this.current.color.b = lerp(this.data.from.color.b, this.data.to.color.b, r);

        // 使用贝塞尔曲线计算位置
        this.current.position.x = this.quadraticBezier(r, this.data.from.position.x, this.data.control1.x, this.data.to.position.x);
        this.current.position.y = this.quadraticBezier(r, this.data.from.position.y, this.data.control1.y, this.data.to.position.y);
        
        if (this.progress >= 1) {
            this.isFadingOut = true;
        }
    }

    private updateFadeOut(dt: number) {
        if (!this.isFadingOut) return;

        this.fadeOutTimer += dt;
        const fadeProgress = Math.min(1, this.fadeOutTimer / this.FADE_OUT_DURATION);
        
        this.current.color.a = lerp(255, 0, fadeProgress);

        if (fadeProgress >= 1) {
            this.shouldRecycle = true;
        }
    }

    /** 每个字符的布局数据偏移量（保留兼容性，但不再使用） */
    static readonly LetterOffset = 6;

    /** layout data（保留兼容性，但不再使用） */
    layout: number[] = [];
    /** 动画数据 */
    data = ObjectPool.allocate(LabelAnimData);
    /** 字符串长度 */
    len: number;
    /** 运行时间，单位ms */
    ts: number;
    /** 当前进度 */
    progress: number = 0;
    /** 当前状态 */
    current = new LabelAnimState();
    /** 回收标记 */
    shouldRecycle: boolean = false;
    /** 是否正在淡出 */
    isFadingOut: boolean = false;
    /** 淡出计时器 */
    fadeOutTimer: number = 0;
    /** 淡出持续时间 */
    readonly FADE_OUT_DURATION: number = 0.2;
    /** 是否激活 */
    get active() {
        return this.ts >= this.data.delay;
    }
    /** 字体大小 */
    fontSize: number = 24;
}