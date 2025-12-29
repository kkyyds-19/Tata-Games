import { _decorator, Component, Material, Sprite, Vec2, Enum, resources } from 'cc';
const { ccclass, property } = _decorator;

export enum MoveDirection {
    LEFT_TO_RIGHT = 0,    // 从左到右
    RIGHT_TO_LEFT = 1,    // 从右到左
    TOP_TO_BOTTOM = 2,    // 从上到下
    BOTTOM_TO_TOP = 3,    // 从下到上
}

export enum SlopeDirection {
    LEFT_SLOPE = 0,       // 左倾斜
    RIGHT_SLOPE = 1,      // 右倾斜
    NO_SLOPE = 2,         // 无倾斜（直线）
}

// 注册枚举类型
Enum(MoveDirection);
Enum(SlopeDirection);

@ccclass('ShaderController')
export class ShaderController extends Component {
    
    @property({ type: Material })
    material: Material = null;

    @property({ type: Enum(MoveDirection) })
    moveDirection: MoveDirection = MoveDirection.LEFT_TO_RIGHT;

    @property({ type: Enum(SlopeDirection) })
    slopeDirection: SlopeDirection = SlopeDirection.LEFT_SLOPE;

    @property({ range: [0, 1, 0.01] })
    slopeRate: number = 0.2; // 倾斜率

    @property({ range: [0.1, 1, 0.01] })
    width: number = 0.2; // 宽度

    @property({ range: [1, 3, 0.1] })
    strength: number = 1.3; // 强度

    @property({ range: [0.1, 3, 0.1] })
    speedScale: number = 1.0; // 速度

    @property({ range: [0, 3, 0.1] })
    pauseDuration: number = 0.5; // 停顿时间(秒)

    @property
    enablePause: boolean = true; // 是否启用停顿

    @property
    autoDetectUVScale: boolean = true; // 是否自动检测UV缩放

    @property
    uvScale: Vec2 = new Vec2(1.0, 1.0); // UV缩放比例

    private sprite: Sprite = null;
    private isMaterialIndependent: boolean = false;

    start() {
        this.sprite = this.getComponent(Sprite);
        this.setupMaterial();
        this.updateShaderParameters();
    }

    /**
     * 设置材质，确保每个对象都有独立的材质实例
     */
    private setupMaterial() {
        if (!this.sprite) return;

        // 如果已经有自定义材质，创建新的材质实例
        if (this.sprite.customMaterial) {
            this.createIndependentMaterialInstance(this.sprite.customMaterial);
        } else if (this.material) {
            // 如果设置了材质，创建新的材质实例
            this.createIndependentMaterialInstance(this.material);
        } else {
            // 如果没有设置材质，尝试加载默认的SpriteStreamer材质
            this.loadDefaultMaterial();
        }
    }

    /**
     * 创建独立的材质实例
     */
    private createIndependentMaterialInstance(sourceMaterial: Material) {
        // 创建新的材质实例
        const newMaterial = new Material();
        newMaterial.copy(sourceMaterial);
        
        this.material = newMaterial;
        this.sprite.customMaterial = this.material;
        this.isMaterialIndependent = true;
    }

    /**
     * 加载默认材质
     */
    private loadDefaultMaterial() {
        resources.load('particle/mtl/SpriteStreamer', Material, (err, material) => {
            if (err) {
                console.error('Failed to load SpriteStreamer material:', err);
                return;
            }
            
            // 创建独立的材质实例
            this.createIndependentMaterialInstance(material);
            
            // 更新参数
            this.updateShaderParameters();
        });
    }

    /**
     * 检测UV缩放比例
     */
    private detectUVScale(): Vec2 {
        if (!this.sprite || !this.sprite.spriteFrame) {
            return new Vec2(1.0, 1.0);
        }

        const spriteFrame = this.sprite.spriteFrame;
        const texture = spriteFrame.texture;
        
        if (!texture) {
            return new Vec2(1.0, 1.0);
        }

        // 获取贴图的实际尺寸
        const textureWidth = texture.width;
        const textureHeight = texture.height;
        
        // 获取sprite frame的UV范围
        const rect = spriteFrame.rect;
        const originalSize = spriteFrame.originalSize;
        
        // 计算UV缩放比例
        const uvScaleX = textureWidth / originalSize.width;
        const uvScaleY = textureHeight / originalSize.height;
        
        return new Vec2(uvScaleX, uvScaleY);
    }

    /**
     * 更新shader参数
     */
    updateShaderParameters() {
        if (!this.material) return;

        // 自动检测UV缩放
        if (this.autoDetectUVScale) {
            this.uvScale = this.detectUVScale();
        }

        // 设置基本参数
        this.material.setProperty('width', this.width);
        this.material.setProperty('strength', this.strength);
        this.material.setProperty('speedScale', this.speedScale);

        // 根据移动方向和倾斜方向计算shader参数
        const params = this.calculateShaderParams();
        this.material.setProperty('moveDirection', params.moveDirection);
        this.material.setProperty('slopeDirection', params.slopeDirection);
        this.material.setProperty('slopeRate', params.slopeRate);

        // 设置停顿控制参数
        this.material.setProperty('pauseDuration', this.pauseDuration);
        this.material.setProperty('enablePause', this.enablePause ? 1.0 : 0.0);

        // 设置UV缩放参数
        this.material.setProperty('uvScale', this.uvScale);
    }

    /**
     * 计算shader参数
     */
    private calculateShaderParams() {
        let moveDirection = 0;
        let slopeDirection = 0;
        let slopeRate = this.slopeRate;

        // 设置移动方向
        switch (this.moveDirection) {
            case MoveDirection.LEFT_TO_RIGHT:
                moveDirection = 0;
                break;
            case MoveDirection.RIGHT_TO_LEFT:
                moveDirection = 1;
                break;
            case MoveDirection.TOP_TO_BOTTOM:
                moveDirection = 2;
                break;
            case MoveDirection.BOTTOM_TO_TOP:
                moveDirection = 3;
                break;
        }

        // 设置倾斜方向
        switch (this.slopeDirection) {
            case SlopeDirection.LEFT_SLOPE:
                slopeDirection = 0;
                break;
            case SlopeDirection.RIGHT_SLOPE:
                slopeDirection = 1;
                break;
            case SlopeDirection.NO_SLOPE:
                slopeDirection = 2;
                slopeRate = 0; // 无倾斜时斜率为0
                break;
        }

        return { moveDirection, slopeDirection, slopeRate };
    }

    /**
     * 设置移动方向
     */
    setMoveDirection(direction: MoveDirection) {
        this.moveDirection = direction;
        this.updateShaderParameters();
    }

    /**
     * 设置倾斜方向
     */
    setSlopeDirection(direction: SlopeDirection) {
        this.slopeDirection = direction;
        this.updateShaderParameters();
    }

    /**
     * 设置倾斜率
     */
    setSlopeRate(rate: number) {
        this.slopeRate = Math.max(0, Math.min(1, rate));
        this.updateShaderParameters();
    }

    /**
     * 设置宽度
     */
    setWidth(width: number) {
        this.width = Math.max(0.1, Math.min(1, width));
        this.updateShaderParameters();
    }

    /**
     * 设置强度
     */
    setStrength(strength: number) {
        this.strength = Math.max(1, Math.min(3, strength));
        this.updateShaderParameters();
    }

    /**
     * 设置速度
     */
    setSpeedScale(speed: number) {
        this.speedScale = Math.max(0.1, Math.min(3, speed));
        this.updateShaderParameters();
    }

    /**
     * 设置停顿时间
     */
    setPauseDuration(duration: number) {
        this.pauseDuration = Math.max(0, Math.min(3, duration));
        this.updateShaderParameters();
    }

    /**
     * 启用或禁用停顿
     */
    setPauseEnabled(enabled: boolean) {
        this.enablePause = enabled;
        this.updateShaderParameters();
    }

    /**
     * 设置UV缩放比例
     */
    setUVScale(scaleX: number, scaleY: number) {
        this.uvScale.x = Math.max(0.1, scaleX);
        this.uvScale.y = Math.max(0.1, scaleY);
        this.updateShaderParameters();
    }

    /**
     * 启用或禁用自动UV检测
     */
    setAutoDetectUVScale(enabled: boolean) {
        this.autoDetectUVScale = enabled;
        if (enabled) {
            this.updateShaderParameters();
        }
    }

    /**
     * 手动刷新UV缩放检测
     */
    refreshUVScale() {
        this.uvScale = this.detectUVScale();
        this.updateShaderParameters();
    }

    /**
     * 快速预设：从左到右，左倾斜
     */
    setLeftToRightLeftSlope() {
        this.setMoveDirection(MoveDirection.LEFT_TO_RIGHT);
        this.setSlopeDirection(SlopeDirection.LEFT_SLOPE);
    }

    /**
     * 快速预设：从上到下，右倾斜
     */
    setTopToBottomRightSlope() {
        this.setMoveDirection(MoveDirection.TOP_TO_BOTTOM);
        this.setSlopeDirection(SlopeDirection.RIGHT_SLOPE);
    }

    /**
     * 快速预设：直线移动
     */
    setStraightMove() {
        this.setSlopeDirection(SlopeDirection.NO_SLOPE);
    }

    /**
     * 快速预设：连续循环（无停顿）
     */
    setContinuousLoop() {
        this.setPauseEnabled(false);
    }

    /**
     * 快速预设：带停顿的循环
     */
    setPauseLoop(pauseTime: number = 0.5) {
        this.setPauseEnabled(true);
        this.setPauseDuration(pauseTime);
    }

    /**
     * 快速预设：小贴图优化（较短的周期）
     */
    setSmallTextureOptimized() {
        this.setUVScale(2.0, 2.0); // 增加UV缩放，缩短周期
        this.setAutoDetectUVScale(false);
    }

    /**
     * 快速预设：大贴图优化（较长的周期）
     */
    setLargeTextureOptimized() {
        this.setUVScale(0.5, 0.5); // 减少UV缩放，延长周期
        this.setAutoDetectUVScale(false);
    }

    /**
     * 手动创建独立材质（如果需要）
     */
    createIndependentMaterial() {
        if (this.material && !this.isMaterialIndependent) {
            this.createIndependentMaterialInstance(this.material);
            this.updateShaderParameters();
        }
    }
} 