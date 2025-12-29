import { _decorator, Component, Node, Enum, Vec3, tween, Quat, CCInteger, Tween } from 'cc'
const { ccclass, property } = _decorator

export const actType = Enum({
    NONE: 0,
    SCALE: 1,
    MOVE: 2,
    SHAKE: 3,
    MOVE_RAND: 4,
    ROTATE: 5,
    SCALE_ROTATE: 6,
});

export const BulletEffectType = Enum({
    NONE: 0,
    SPIN: 1,
    SCALE_PULSE: 2,
    RANDOM_MOVE: 3,
    SHAKE: 4,
});

@ccclass('IconEffect')
export class IconEffect extends Component {
    @property({
        type: Enum(actType),
        displayName: "动画类型",
        tooltip: "0-无 1-缩放 2-移动 3-抖动 4-随机小范围移动 5-旋转 6-缩放+旋转"
    })
    private animType = actType.NONE;

    @property({
        displayName: "动画速度",
        tooltip: "运动消耗时间"
    })
    private animTime = 0.2;

    @property
    private startP = new Vec3(0.2, 0.2, 1);
    
    @property
    private endP = new Vec3(-0.2, -0.2, 1);

    @property({
        type: CCInteger,
        displayName: "随机范围",
        min: 1,
        max: 4,
        tooltip: "MOVE_RAND 随机数"
    })
    private rand = 1;

    @property({
        type: CCInteger,
        displayName: "旋转角度",
        min: 0,
        max: 360,
        tooltip: "ROTATE 旋转角度(每次)"
    })
    private rotateAngle = 360;

    @property({
        displayName: "最小缩放",
        min: 0.1,
        max: 3.0,
        tooltip: "SCALE_ROTATE 最小缩放倍数"
    })
    private minScale = 0.8;

    @property({
        displayName: "最大缩放",
        min: 0.1,
        max: 3.0,
        tooltip: "SCALE_ROTATE 最大缩放倍数"
    })
    private maxScale = 1.2;

    @property({
        displayName: "缩放时间",
        min: 0.1,
        max: 2.0,
        tooltip: "SCALE_ROTATE 缩放循环时间"
    })
    private scaleTime = 0.5;

    private _isStarted = false;

    public playEffect(
        type: number,
        time?: number,
        startP?: Vec3,
        endP?: Vec3,
        randValue?: number,
        rotateAngleValue?: number,
        minScaleValue?: number,
        maxScaleValue?: number,
        scaleTimeValue?: number
    ) {
        this.stopEffect();

        this.animType = type;
        if (time !== undefined) this.animTime = time;
        if (startP) this.startP = startP;
        if (endP) this.endP = endP;
        if (randValue !== undefined) this.rand = randValue;
        if (rotateAngleValue !== undefined) this.rotateAngle = rotateAngleValue;
        if (minScaleValue !== undefined) this.minScale = minScaleValue;
        if (maxScaleValue !== undefined) this.maxScale = maxScaleValue;
        if (scaleTimeValue !== undefined) this.scaleTime = scaleTimeValue;

        this._isStarted = true;
        this.startAnimation();
    }

    public playBulletEffect(effectType: number) {
        this.stopEffect();
        this._isStarted = true;

        switch (effectType) {
            case BulletEffectType.SPIN:
                this.bulletSpin();
                break;
            case BulletEffectType.SCALE_PULSE:
                this.bulletScalePulse();
                break;
            case BulletEffectType.RANDOM_MOVE:
                this.bulletRandomMove();
                break;
            case BulletEffectType.SHAKE:
                this.bulletShake();
                break;
        }
    }

    /**
     * 播放缩放+旋转效果的便捷方法
     * @param rotateTime 旋转一圈的时间
     * @param scaleTime 缩放循环时间  
     * @param minScale 最小缩放倍数
     * @param maxScale 最大缩放倍数
     * @param rotateAngle 每次旋转的角度
     */
    public playScaleRotateEffect(
        rotateTime: number = 1.0,
        scaleTime: number = 0.5, 
        minScale: number = 0.8,
        maxScale: number = 1.2,
        rotateAngle: number = 360
    ) {
        this.playEffect(
            actType.SCALE_ROTATE,
            rotateTime,
            undefined,
            undefined,
            undefined,
            rotateAngle,
            minScale,
            maxScale,
            scaleTime
        );
    }

    private bulletSpin() {
        // 子弹无限旋转动画
        tween(this.node)
            .by(0.3, { angle: 360 })
            .repeatForever()
            .start();
    }

    private bulletScalePulse() {
        // 子弹缩放脉冲效果
        tween(this.node)
            .to(0.15, { scale: new Vec3(1.2, 1.2, 1) })
            .to(0.15, { scale: new Vec3(1, 1, 1) })
            .union()
            .repeatForever()
            .start();
    }

    private bulletRandomMove() {
        // 子弹随机小范围移动
        const moveRange = 3;
        tween(this.node)
            .by(0.1, { position: new Vec3(this.random(-moveRange, moveRange), this.random(-moveRange, moveRange), 0) })
            .by(0.1, { position: new Vec3(this.random(-moveRange, moveRange), this.random(-moveRange, moveRange), 0) })
            .union()
            .repeatForever()
            .start();
    }

    private bulletShake() {
        // 子弹抖动效果
        tween(this.node)
            .by(0.05, { angle: 15 })
            .by(0.05, { angle: -30 })
            .by(0.05, { angle: 15 })
            .union()
            .repeatForever()
            .start();
    }

    public stopEffect() {
        // 停止所有针对该节点的tween动画
        Tween.stopAllByTarget(this.node);
        
        // 重置节点状态到默认值
        this.node.setScale(1, 1);
        this.node.angle = 0;
        this.node.setPosition(0, 0, 0);
        
        this._isStarted = false;
    }

    private random(lower: number, upper: number): number {
        return Math.floor(Math.random() * (upper - lower + 1)) + lower;
    }

    onEnable() {
        if (this._isStarted) {
            this.startAnimation();
        }
    }

    onDisable() {
        this.stopEffect();
    }

    start() {
        if (!this._isStarted) {
            this._isStarted = true;
            this.startAnimation();
        }
    }

    private startAnimation() {
        switch (this.animType) {
            case actType.SCALE:
                this.actionScale();
                break;
            case actType.MOVE:
                this.actionMoveBy();
                break;
            case actType.MOVE_RAND:
                this.actionMoveRand();
                break;
            case actType.SHAKE:
                this.actionShake();
                break;
            case actType.ROTATE:
                this.actionRotate();
                break;
            case actType.SCALE_ROTATE:
                this.actionScaleRotate();
                break;
        }
    }

    private actionShake() {
        tween(this.node)
            .by(this.animTime, { angle: 1 })
            .by(this.animTime, { angle: -1 })
            .by(this.animTime, { angle: 3 })
            .by(this.animTime, { angle: -3 })
            .by(this.animTime, { angle: 5 })
            .by(this.animTime, { angle: -5 })
            .by(this.animTime, { angle: 4 })
            .by(this.animTime, { angle: -4 })
            .by(this.animTime, { angle: 2 })
            .by(this.animTime, { angle: -2 })
            .delay(0.5)
            .union()
            .repeatForever()
            .start();
    }

    private actionScale() {
        tween(this.node)
            .by(this.animTime, { scale: this.startP })
            .by(this.animTime, { scale: this.endP })
            .union()
            .repeatForever()
            .start();
    }

    private actionMoveBy() {
        tween(this.node)
            .by(this.animTime, { position: this.startP })
            .by(this.animTime, { position: this.endP })
            .union()
            .repeatForever()
            .start();
    }

    private actionMoveRand() {
        const x = this.random(-this.rand, this.rand);
        const y = this.random(-this.rand, this.rand);
        tween(this.node)
            .by(this.animTime, { position: new Vec3(x, y, 0) })
            .by(this.animTime, { position: new Vec3(-x, -y, 0) })
            .by(this.animTime, { position: new Vec3(y, x, 0) })
            .by(this.animTime, { position: new Vec3(-y, -x, 0) })
            .by(this.animTime, { position: new Vec3(-y, x, 0) })
            .by(this.animTime, { position: new Vec3(y, -x, 0) })
            .by(this.animTime, { position: new Vec3(-x, y, 0) })
            .by(this.animTime, { position: new Vec3(x, -y, 0) })
            .union()
            .repeatForever()
            .start();
    }

    private actionRotate() {
        tween(this.node)
            .by(this.animTime, { angle: this.rotateAngle })
            .union()
            .repeatForever()
            .start();
    }

    private actionScaleRotate() {
        // 同时执行缩放循环和旋转动画
        // 缩放动画：在最小和最大缩放之间循环
        tween(this.node)
            .to(this.scaleTime, { scale: new Vec3(this.maxScale, this.maxScale, 1) })
            .to(this.scaleTime, { scale: new Vec3(this.minScale, this.minScale, 1) })
            .union()
            .repeatForever()
            .start();

        // 旋转动画：持续旋转
        tween(this.node)
            .by(this.animTime, { angle: this.rotateAngle })
            .union()
            .repeatForever()
            .start();
    }

    update(deltaTime: Number) {
        // Your update function goes here.
    }
}
