import { _decorator, Component, Node, sp, resources } from 'cc';
import { UserArmyData } from '../user/UserArmyData';
import { ClassData, UserClassData } from '../user/UserClassData';
import { ResourceConfig } from '../global/config/ResourceConfig';
import { director } from 'cc';
import { game } from 'cc';
import { Material } from 'cc';
import { Vec3 } from 'cc';
import { Vec2 } from 'cc';
import { Sprite } from 'cc';
import { UITransform } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 军队组件
 */
@ccclass('Army')
export class Army extends Component {
    
    @property([Node])
    public heroContainers: Node[] = [];

    @property({ tooltip: "位置更新阈值（像素）" })
    public positionThreshold: number = 3;

    @property({ tooltip: "基础动画持续时间（秒）" })
    public baseAnimationDuration: number = 0.3;

    @property({ tooltip: "距离缩放因子" })
    public distanceScaleFactor: number = 0.5;

    @property({ tooltip: "中心点变化阈值" })
    public centerChangeThreshold: number = 0.005;

    @property({ tooltip: "光圈半径" })
    public lightRadius: number = 0.25;

    @property({ tooltip: "光圈模糊程度" })
    public lightBlur: number = 0.15;





    material !: Material;
    center : Vec2 = new Vec2(0.1, 0.5);
    
    // 位置更新优化相关
    private lastCenter: Vec2 = new Vec2(0.1, 0.5);
    private targetCenter: Vec2 = new Vec2(0.1, 0.5);
    private isAnimating: boolean = false;
    private animationStartTime: number = 0;
    private animationStartCenter: Vec2 = new Vec2(0.1, 0.5);
    private currentAnimationDuration: number = 0.3;

    mapWidth : number = 0;
    mapHeight : number = 0;

    onLoad() {
        this.initMaterial();
        this.loadArmyHeroes();
    }
    public initMaterial(){
        const bg = this.node.parent;
        const bgMaterial = bg.getComponent(Sprite).material;
        this.material = bgMaterial;
        if(!this.material){
            console.error('material is null ,please check the bg');
            return;
        }

        this.mapWidth = bg.getComponent(UITransform)!.contentSize.width;
        this.mapHeight = bg.getComponent(UITransform)!.contentSize.height;

        // 按照官网例子的方式初始化
        this.material.setProperty('wh_ratio', this.mapWidth / this.mapHeight);
        this.material.setProperty('center', this.center);

        // 计算初始中心点坐标
        this.updateCenterPosition();
        
        // 设置默认的标准视野效果
        this.setStandardVision();
    }

    update(deltaTime: number) {
        this.updateCenterPositionOptimized(deltaTime);
    }

    /**
     * 更新中心点坐标（优化版本）
     */
    private updateCenterPositionOptimized(deltaTime: number): void {
        if (!this.material) return;

        // 获取当前节点在世界坐标系中的位置
        const worldPos = this.node.getWorldPosition();
        
        // 获取背景节点在世界坐标系中的位置
        const bg = this.node.parent;
        const bgWorldPos = bg.getWorldPosition();
        
        // 计算相对于背景的本地坐标
        const localX = worldPos.x - bgWorldPos.x;
        const localY = worldPos.y - bgWorldPos.y;
        
        // 转换为UV坐标 (0-1范围)
        const newCenterX = (localX / this.mapWidth) + 0.5;
        const newCenterY = 1.0 - ((localY / this.mapHeight) + 0.5);
        
        // 确保坐标在有效范围内
        const clampedX = Math.max(0, Math.min(1, newCenterX));
        const clampedY = Math.max(0, Math.min(1, newCenterY));
        
        // 计算与上次位置的像素距离
        const pixelDistanceX = Math.abs(clampedX - this.lastCenter.x) * this.mapWidth;
        const pixelDistanceY = Math.abs(clampedY - this.lastCenter.y) * this.mapHeight;
        const totalDistance = Math.sqrt(pixelDistanceX * pixelDistanceX + pixelDistanceY * pixelDistanceY);
        
        // 如果距离超过阈值，更新目标位置
        if (totalDistance > this.positionThreshold) {
            this.targetCenter.set(clampedX, clampedY);
            this.lastCenter.set(clampedX, clampedY);
            this.isAnimating = true;
        }
        
        // 如果距离超过阈值，开始新的动画
        if (totalDistance > this.positionThreshold) {
            this.animationStartCenter.set(this.center.x, this.center.y);
            this.targetCenter.set(clampedX, clampedY);
            this.lastCenter.set(clampedX, clampedY);
            this.isAnimating = true;
            this.animationStartTime = 0; // 重置动画时间
            
            // 根据距离计算动画时间
            const distanceInPixels = totalDistance;
            const normalizedDistance = distanceInPixels / Math.max(this.mapWidth, this.mapHeight);
            this.currentAnimationDuration = this.baseAnimationDuration + (normalizedDistance * this.distanceScaleFactor);
        }
        
        // 基于时间的动画
        if (this.isAnimating) {
            this.animationStartTime += deltaTime;
            const progress = Math.min(1, this.animationStartTime / this.currentAnimationDuration);
            
            // 使用缓动函数计算插值因子
            const lerpFactor = this.easeInOutQuad(progress);
            
            // 从起始位置插值到目标位置
            this.center.x = this.lerp(this.animationStartCenter.x, this.targetCenter.x, lerpFactor);
            this.center.y = this.lerp(this.animationStartCenter.y, this.targetCenter.y, lerpFactor);
            
            // 更新材质
            this.material.setProperty('center', this.center);
            
            // 检查动画是否完成
            if (progress >= 1) {
                this.isAnimating = false;
                this.center.set(this.targetCenter.x, this.targetCenter.y);
                this.material.setProperty('center', this.center);
            }
        } else {
            // 没有动画时，直接跟随目标位置
            this.center.set(this.targetCenter.x, this.targetCenter.y);
            this.material.setProperty('center', this.center);
        }
    }

    /**
     * 更新光圈参数
     */
    private updateLightParameters(): void {
        if (!this.material) return;
        
        // 按照官网例子的方式设置
        this.material.setProperty('wh_ratio', this.mapWidth / this.mapHeight);
        this.material.setProperty('blur', this.lightBlur);
        this.material.setProperty('radius', this.lightRadius);
        this.material.setProperty('center', this.center);
    }

    /**
     * 平滑插值函数（使用缓动效果）
     */
    private lerp(start: number, end: number, factor: number): number {
        // 使用平滑的缓动函数
        const smoothFactor = this.smoothStep(0, 1, factor);
        return start + (end - start) * smoothFactor;
    }

    /**
     * 平滑步进函数
     */
    private smoothStep(edge0: number, edge1: number, x: number): number {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }

    /**
     * 二次缓入缓出函数
     */
    private easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    /**
     * 更新中心点坐标（原始版本，保留用于调试）
     */
    private updateCenterPosition(): void {
        if (!this.material) return;

        // 获取当前节点在世界坐标系中的位置
        const worldPos = this.node.getWorldPosition();
        
        // 获取背景节点在世界坐标系中的位置
        const bg = this.node.parent;
        const bgWorldPos = bg.getWorldPosition();
        
        // 计算相对于背景的本地坐标
        const localX = worldPos.x - bgWorldPos.x;
        const localY = worldPos.y - bgWorldPos.y;
        
        // 转换为UV坐标 (0-1范围)
        this.center.x = (localX / this.mapWidth) + 0.5;
        this.center.y = 1.0 - ((localY / this.mapHeight) + 0.5);
        
        // 确保坐标在有效范围内
        this.center.x = Math.max(0, Math.min(1, this.center.x));
        this.center.y = Math.max(0, Math.min(1, this.center.y));
        
        this.material.setProperty('center', this.center);
    }

    /**
     * 测试中心点位置（用于调试）
     */
    public testCenterPosition(): void {
        if (!this.material) return;
        
        // 测试几个关键位置
        const testPositions = [
            { x: 0.5, y: 0.5, name: "中心" },
            { x: 0.0, y: 0.5, name: "左中" },
            { x: 1.0, y: 0.5, name: "右中" },
            { x: 0.5, y: 0.0, name: "中下" },
            { x: 0.5, y: 1.0, name: "中上" }
        ];
        
        testPositions.forEach((pos, index) => {
            setTimeout(() => {
                this.center.set(pos.x, pos.y);
                this.material.setProperty('center', this.center);
            }, index * 1000);
        });
    }

    /**
     * 调试材质参数（用于检查问题）
     */
    public debugMaterialParameters(): void {
        if (!this.material) {
            console.error('Material is null!');
            return;
        }
        
        console.log('=== 材质参数调试 ===');
        console.log(`Radius: ${this.lightRadius}`);
        console.log(`Blur: ${this.lightBlur}`);
        console.log(`Center: (${this.center.x.toFixed(3)}, ${this.center.y.toFixed(3)})`);
        console.log(`Map Size: ${this.mapWidth} x ${this.mapHeight}`);
        console.log(`Wh Ratio: ${this.mapWidth / this.mapHeight}`);
        console.log('==================');
    }

    /**
     * 重置到默认视野效果
     */
    public resetToDefault(): void {
        this.setStandardVision();
        this.center.set(0.5, 0.5);
        this.targetCenter.set(0.5, 0.5);
        this.lastCenter.set(0.5, 0.5);
        this.isAnimating = false;
        
        if (this.material) {
            this.material.setProperty('center', this.center);
        }
    }

    /**
     * 动态调整光圈效果
     * @param radius 光圈半径
     * @param blur 模糊程度
     */
    public setLightEffect(radius: number, blur: number): void {
        this.lightRadius = radius;
        this.lightBlur = blur;
        this.updateLightParameters();
    }

    /**
     * 设置迷雾效果（预设）
     */
    public setFogEffect(): void {
        this.setLightEffect(0.2, 0.12);
    }

    /**
     * 设置明亮效果（预设）
     */
    public setBrightEffect(): void {
        this.setLightEffect(0.35, 0.2);
    }

    /**
     * 设置标准视野效果（预设）
     */
    public setStandardVision(): void {
        this.lightRadius = 0.25;
        this.lightBlur = 0.15;
        this.updateLightParameters();
    }

    /**
     * 设置小光圈效果（预设）
     */
    public setSmallVision(): void {
        this.lightRadius = 0.15;
        this.lightBlur = 0.1;
        this.updateLightParameters();
    }

    /**
     * 设置大光圈效果（预设）
     */
    public setLargeVision(): void {
        this.lightRadius = 0.35;
        this.lightBlur = 0.2;
        this.updateLightParameters();
    }

    start() {
        director.on(game.gameEvent.HALL_ARMY_FORMATION_CHANGED, this.loadArmyHeroes, this);
    }

    onDestroy() {
        director.off(game.gameEvent.HALL_ARMY_FORMATION_CHANGED, this.loadArmyHeroes, this);
    }

    /**
     * 加载部队英雄
     */
    private loadArmyHeroes(classData:ClassData=null): void {
        // 从UserClassData获取上场阵容的卡片ID列表
        const deployedCardIds = UserClassData.getInstance().getDeployedCardIds();

        // 获取UserArmyData实例来查询卡片对应的英雄ID
        const userArmyData = UserArmyData.getInstance();
        const armyHeroIds: number[] = [];

        // 遍历上场卡片ID，获取对应的英雄ID
        deployedCardIds.forEach(cardId => {
            const cardData = userArmyData.getCardById(cardId);
            if (cardData && cardData.heroId) {
                // 将heroId转换为数字
                const heroId = parseInt(cardData.heroId);
                if (!isNaN(heroId)) {
                    armyHeroIds.push(heroId);
                }
            }
        });

        // 清空现有容器
        this.clearHeroContainers();

        // 为每个英雄ID加载对应的Spine动画
        armyHeroIds.forEach((heroId, index) => {
            if (index < this.heroContainers.length) {
                this.loadHeroSpine(heroId, this.heroContainers[index]);
            }
        });
    }

    /**
     * 清空英雄容器
     */
    private clearHeroContainers(): void {
        this.heroContainers.forEach(container => {
            container.removeAllChildren();
        });
    }

    /**
     * 加载英雄Spine动画
     * @param heroId 英雄ID
     * @param container 容器节点
     */
    private loadHeroSpine(heroId: number, container: Node): void {
        // 从ResourceConfig获取英雄数据
        const heroData = this.getHeroDataById(heroId);
        if (!heroData) {
            console.warn(`未找到英雄ID ${heroId} 的数据`);
            return;
        }

        // console.log(`加载英雄: ${heroData.name} (ID: ${heroId})`);
        // console.log(`Spine路径: ${heroData.path}`);
        // console.log(`皮肤名: ${heroData.skinName || '默认皮肤'}`);

        // 创建Spine节点
        const spineNode = new Node(`Hero_${heroId}`);
        spineNode.setScale(0.3,0.3)
        const spineComponent = spineNode.addComponent(sp.Skeleton);
        // 设置Spine资源
        const spineAssetPath = `${heroData.path}`;
        
        // 加载Spine资源
        this.loadSpineAsset(spineComponent, spineAssetPath, heroData.skinName)
            .then(() => {
                // 添加到容器
                container.addChild(spineNode);
                
                // 播放standby动画循环
                this.playStandbyAnimation(spineComponent);
            })
            .catch((error) => {
                console.error(`加载英雄 ${heroId} Spine失败:`, error);
            });
    }

    /**
     * 根据ID获取英雄数据
     * @param heroId 英雄ID
     * @returns 英雄数据或null
     */
    private getHeroDataById(heroId: number): any {
        return ResourceConfig.heros_list.find(hero => 
            parseInt(hero.id) === heroId
        );
    }

    /**
     * 加载Spine资源
     * @param spineComponent Spine组件
     * @param assetPath 资源路径
     * @param skinName 皮肤名
     */
    private async loadSpineAsset(spineComponent: sp.Skeleton, assetPath: string, skinName?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // 使用resources.load加载Spine资源
            resources.load(assetPath, sp.SkeletonData, (err, asset) => {
                if (err) {
                    reject(err);
                    return;
                }

                // 设置Spine数据
                spineComponent.skeletonData = asset;

                // 设置皮肤
                if (skinName && spineComponent._skeleton) {

                    spineComponent.setSkin(skinName)
                    // const skin = spineComponent._skeleton.data.findSkin(skinName);
                    // if (skin) {
                    //     spineComponent._skeleton.setSkin(skin);
                    //     spineComponent._skeleton.setSlotsToSetupPose();
                    // }
                }

                resolve();
            });
        });
    }

    /**
     * 播放standby动画循环
     * @param spineComponent Spine组件
     */
    private playStandbyAnimation(spineComponent: sp.Skeleton): void {
        if (spineComponent && spineComponent._skeleton) {
            // 尝试播放standby动画，如果没有则播放第一个可用动画
            const animations = spineComponent._skeleton.data.animations;
            let animationName = 'stand by';
            spineComponent.setAnimation(0, animationName, true);
           
        }
    }

   
} 