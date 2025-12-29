import { _decorator, Component, Node, Vec3, find, Sprite, UIOpacity, ParticleSystem2D } from 'cc';
import { WallManager } from '../game/WallManager';

const { ccclass, property } = _decorator;

/**
 * 透视缩放组件 - 根据Y坐标实现透视缩放效果
 * 可用于子弹、怪物等游戏对象
 */
@ccclass('PerspectiveScaler')
export class PerspectiveScaler extends Component {
    
    @property({
        displayName: "启用透视缩放",
        tooltip: "是否启用基于Y坐标的透视缩放效果"
    })
    public enablePerspectiveScale: boolean = true;

    @property({
        displayName: "起始Y坐标",
        tooltip: "透视缩放的起始Y坐标（石头发射点，通常为负值或屏幕顶部）"
    })
    public startY: number = -500;

    @property({
        displayName: "结束Y坐标",
        tooltip: "透视缩放的结束Y坐标（目标区域中心Y）"
    })
    public endY: number = 1000;

    @property({
        displayName: "起始缩放比例",
        tooltip: "在起始Y坐标时的缩放比例（起始点，大尺寸）"
    })
    public startScale: number = 1.0;

    @property({
        displayName: "结束缩放比例", 
        tooltip: "在结束Y坐标时的缩放比例（目标点，小尺寸）"
    })
    public endScale: number = 0.3;

    @property({
        displayName: "使用WallManager自动配置",
        tooltip: "是否自动从WallManager获取stone_aim_rect的中心Y作为结束Y坐标"
    })
    public useWallManagerConfig: boolean = true;

    @property({
        displayName: "缩放曲线类型",
        tooltip: "缩放插值的曲线类型"
    })
    public scaleEasing: string = "linear";

    @property({
        displayName: "启用透明度渐变",
        tooltip: "是否启用基于Y坐标的透明度渐变效果（超过中心点逐渐消失）"
    })
    public enableAlphaFade: boolean = true;

    @property({
        displayName: "透明度渐变距离",
        tooltip: "从中心点开始多少像素的距离内完全消失"
    })
    public alphaFadeDistance: number = 200;

    // 原始缩放值（保存节点的初始缩放，避免影响原有缩放）
    private originalScale: Vec3 = new Vec3(1, 1, 1);
    private originalOpacity: number = 255; // 保存原始透明度
    private isInitialized: boolean = false;
    private centerY: number = 1000; // stone_aim_rect的中心Y坐标

    // 保存拖尾粒子系统的原始属性
    private originalParticleProperties: Map<ParticleSystem2D, any> = new Map();

    onLoad() {
        this.initializeScaler();
    }

    start() {
        this.updatePerspectiveScale();
    }

    /**
     * 初始化缩放器
     */
    private initializeScaler(): void {
        if (this.isInitialized) return;

        // 保存节点的原始缩放（X轴保存绝对值）
        const currentScale = this.node.scale;
        this.originalScale = new Vec3(
            Math.abs(currentScale.x), // 保存X轴绝对值，忽略朝向
            currentScale.y,
            currentScale.z
        );

        // 保存节点的原始透明度
        this.saveOriginalOpacity();

        // 如果启用WallManager自动配置，尝试获取配置
        if (this.useWallManagerConfig) {
            this.configureFromWallManager();
        }

        // 初始化拖尾粒子系统的原始属性
        this.initializeTrailParticleProperties();

        this.isInitialized = true;
    }

    /**
     * 从WallManager获取配置
     */
    private configureFromWallManager(): void {
        const wallManagerNode = find('Canvas/bg/bounce_rect');
        let wallManager: WallManager | null = null;
        
        if (wallManagerNode) {
            wallManager = wallManagerNode.getComponent(WallManager);
        }

        if (!wallManager) {
            console.warn('[透视缩放] 未找到WallManager，使用默认配置');
            return;
        }

        const rectInfo = wallManager.getStoneAimRectInfo();
        if (!rectInfo) {
            console.warn('[透视缩放] 未获取到stone_aim_rect信息，使用默认配置');
            return;
        }

        // 透明度渐变使用世界坐标（与WallManager保持一致）
        const worldEndY = rectInfo.y + rectInfo.height / 2;
        this.centerY = worldEndY; // 保存世界坐标用于透明度渐变
        
        // 缩放效果使用世界坐标系（与子弹保持一致）
        const currentWorldY = this.node.worldPosition.y;
        
        // 设置缩放的起始和结束Y坐标（世界坐标系）
        // 怪物从出生点（较小的Y值）移动到目标区域（较大的Y值）
        this.startY = 700;  // 怪物出生区域的世界Y坐标
        this.endY = worldEndY; // stone_aim_rect区域的中心Y（世界坐标）
    }

    /**
     * 更新透视缩放效果
     */
    public updatePerspectiveScale(): void {
        if (!this.enablePerspectiveScale || !this.isInitialized) {
            return;
        }

        // 统一使用世界坐标系进行缩放和透明度计算
        const currentWorldY = this.node.worldPosition.y;
        
        // 简化的线性映射：从起点到终点的平滑过渡
        let progressRatio = 0;
        
        if (this.endY !== this.startY) {
            // 计算当前位置在起点到终点之间的比例 (0-1)
            // 0 = 在起始点（大缩放），1 = 在目标点（小缩放）
            const totalDistance = this.endY - this.startY;
            const currentDistance = currentWorldY - this.startY;
            
            // 确保比例在0-1之间
            progressRatio = Math.max(0, Math.min(1, currentDistance / totalDistance));
        }
        
        // 根据缓动类型计算缩放比例
        const scaleFactor = this.calculateScaleFactor(progressRatio);

        // 应用透视缩放，保持X轴朝向但缩放绝对值
        const currentScale = this.node.getScale();
        const xSign = Math.sign(currentScale.x); // 保存朝向符号
        const finalScale = new Vec3(
            Math.abs(this.originalScale.x) * scaleFactor * xSign, // 应用缩放但保持朝向
            this.originalScale.y * scaleFactor,
            this.originalScale.z * scaleFactor
        );

        this.node.setScale(finalScale);

        // 检查并缩放拖尾粒子系统
        this.scaleTrailParticles(scaleFactor);

        // 应用透明度渐变效果（使用世界坐标）
        if (this.enableAlphaFade) {
            this.updateAlphaFade(currentWorldY);
        }
    }

    /**
     * 计算缩放因子
     * @param ratio Y坐标比例 (0-1)
     * @returns 缩放因子
     */
    private calculateScaleFactor(ratio: number): number {
        switch (this.scaleEasing.toLowerCase()) {
            case 'ease-in':
                ratio = ratio * ratio;
                break;
            case 'ease-out':
                ratio = 1 - (1 - ratio) * (1 - ratio);
                break;
            case 'ease-in-out':
                ratio = ratio < 0.5 
                    ? 2 * ratio * ratio 
                    : 1 - 2 * (1 - ratio) * (1 - ratio);
                break;
            case 'linear':
            default:
                // 保持原始比例
                break;
        }

        // 在起始缩放和结束缩放之间插值
        return this.startScale + (this.endScale - this.startScale) * ratio;
    }

    /**
     * 手动设置透视缩放参数
     */
    public configurePerspectiveScale(startY: number, endY: number, startScale: number = 1.0, endScale: number = 0.3): void {
        this.startY = startY;
        this.endY = endY;
        this.startScale = startScale;
        this.endScale = endScale;
        this.useWallManagerConfig = false;
        
        this.updatePerspectiveScale();
    }

    /**
     * 重新计算原始缩放（当节点缩放发生变化时调用）
     * 保存绝对值，忽略朝向符号
     */
    public refreshOriginalScale(): void {
        const currentScale = this.node.scale;
        this.originalScale = new Vec3(
            Math.abs(currentScale.x), // 保存X轴绝对值
            currentScale.y,
            currentScale.z
        );
    }

    /**
     * 启用/禁用透视缩放
     */
    public setEnabled(enabled: boolean): void {
        const wasEnabled = this.enablePerspectiveScale;
        this.enablePerspectiveScale = enabled;
        
        if (wasEnabled && !enabled) {
            // 恢复原始缩放，保持X轴朝向但恢复原始绝对值
            const currentScale = this.node.getScale();
            const xSign = Math.sign(currentScale.x); // 保存朝向符号
            const restoredScale = new Vec3(
                Math.abs(this.originalScale.x) * xSign, // 恢复原始大小但保持朝向
                this.originalScale.y,
                this.originalScale.z
            );
            this.node.setScale(restoredScale);
        } else if (!wasEnabled && enabled) {
            // 重新应用透视缩放
            this.updatePerspectiveScale();
        }
    }

    /**
     * 在update中自动更新透视缩放（可选）
     */
    update(dt: number) {
        if (this.enablePerspectiveScale) {
            this.updatePerspectiveScale();
        }
    }

    /**
     * 保存节点的原始透明度
     */
    private saveOriginalOpacity(): void {
        // 尝试从UIOpacity组件获取透明度
        const uiOpacity = this.node.getComponent(UIOpacity);
        if (uiOpacity) {
            this.originalOpacity = uiOpacity.opacity;
            return;
        }

        // 尝试从Sprite组件获取透明度
        const sprite = this.node.getComponent(Sprite);
        if (sprite) {
            this.originalOpacity = sprite.color.a;
            return;
        }

        // 如果都没有，默认为255（完全不透明）
        this.originalOpacity = 255;
    }

    /**
     * 更新透明度渐变效果
     * @param currentWorldY 当前世界Y坐标
     */
    private updateAlphaFade(currentWorldY: number): void {
        let targetOpacity = this.originalOpacity;

        // 当石头超过stone_aim_rect区域（centerY为世界坐标）后才开始消失
        if (currentWorldY >= this.centerY) {
            const distanceFromTarget = currentWorldY - this.centerY;
            
            // 使用属性中定义的渐变距离
            const fadeDistance = this.alphaFadeDistance;
            
            // 计算透明度比例 (0-1)
            const fadeRatio = Math.min(distanceFromTarget / fadeDistance, 1);
            
            // 从原始透明度渐变到0
            targetOpacity = this.originalOpacity * (1 - fadeRatio);
        }

        // 应用透明度到节点
        this.applyOpacity(targetOpacity);
    }

    /**
     * 应用透明度到节点
     * @param opacity 目标透明度 (0-255)
     */
    private applyOpacity(opacity: number): void {
        // 优先尝试UIOpacity组件
        let uiOpacity = this.node.getComponent(UIOpacity);

        // if (!uiOpacity) {
        //     const _node =this.node.getChildByName('Sprite')
        //     uiOpacity = _node.getComponent(UIOpacity);
        //     if (!uiOpacity) {
        //         // 如果没有UIOpacity组件，动态添加一个
        //         uiOpacity = _node.addComponent(UIOpacity);
        //     }
        // }
        

        if (!uiOpacity) {
            // 如果没有UIOpacity组件，动态添加一个
            uiOpacity = this.node.addComponent(UIOpacity);
        }
        
        if (uiOpacity) {
            uiOpacity.opacity = Math.max(0, Math.min(255, opacity));


            return;
        }
        
    }

    /**
     * 重置透明度到原始值
     */
    public resetOpacity(): void {
        this.applyOpacity(this.originalOpacity);
    }

    /**
     * 检查并缩放拖尾粒子系统
     * @param scaleFactor 缩放因子
     */
    private scaleTrailParticles(scaleFactor: number): void {
        // 查找名为 prefab_tailing_stone 的子节点
        const trailNode = this.node.children.find(child => child.name === 'prefab_tailing_stone');
        
        if (!trailNode) {
            return; // 没有找到拖尾节点
        }

        // 缩放节点中的粒子系统
        this.scaleParticleSystemsInNode(trailNode, scaleFactor);
    }

    /**
     * 缩放节点中的粒子系统
     * @param node 要处理的节点
     * @param scaleFactor 缩放因子
     */
    private scaleParticleSystemsInNode(node: Node, scaleFactor: number): void {
        // 检查当前节点的 ParticleSystem2D 组件
        const particleSystem = node.getComponent(ParticleSystem2D);
        if (particleSystem) {
            const originalProps = this.originalParticleProperties.get(particleSystem);
            if (originalProps) {
                // 使用保存的原始值进行缩放
                particleSystem.startSize = originalProps.startSize * scaleFactor;
                particleSystem.endSize = originalProps.endSize * scaleFactor;
            }
        }
    }

    /**
     * 初始化拖尾粒子系统的原始属性
     */
    private initializeTrailParticleProperties(): void {
        // 查找名为 prefab_tailing_stone 的直接子节点
        const trailNode = this.node.children.find(child => child.name === 'prefab_tailing_stone');
        
        if (!trailNode) {
            return; // 没有找到拖尾节点，不管
        }

        // 保存ParticleSystem2D的原始属性
        const particleSystem = trailNode.getComponent(ParticleSystem2D);
        if (particleSystem) {
            this.originalParticleProperties.set(particleSystem, {
                startSize: particleSystem.startSize,
                endSize: particleSystem.endSize
            });
        }
    }
} 