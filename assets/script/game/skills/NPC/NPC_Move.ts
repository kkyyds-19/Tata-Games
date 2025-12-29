import { _decorator, Component, Node, sp, resources, SkeletalAnimationState, Vec3, view, screen } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('NPC_Move')
export class NPC_Move extends Component {
    
    @property(Node)
    heroNode: Node = null;
    
    // 移动相关属性
    @property
    moveSpeed: number = 100; // 移动速度（像素/秒）
    
    @property
    changeDirectionInterval: number = 3; // 改变方向的间隔时间（秒）
    
    private spineComponent: sp.Skeleton = null;
    private heroId: string = 'h_0_0_0';
    
    // 移动相关变量
    private targetPosition: Vec3 = new Vec3();
    private currentPosition: Vec3 = new Vec3();
    private isMoving: boolean = false;
    private moveTimer: number = 0;
    private screenBounds = {
        left: -400,
        right: 400,
        top: 300,
        bottom: -300
    };
    
    start() {
        console.error('=== NPC_Move 组件启动测试 ===');
        console.error('🚀 NPC_Move 组件启动...');
        console.error('Hero Node:', this.heroNode);
        console.error('Hero ID:', this.heroId);
        
        // 初始化屏幕边界
        this.initScreenBounds();
        
        // 创建英雄Spine显示
        this.createHeroSpine();
        
        // 延迟启动移动（等Spine创建完成）
        this.scheduleOnce(() => {
            this.startRandomMovement();
        }, 1);
    }

    update(deltaTime: number) {
        if (!this.heroNode || !this.heroNode.isValid) return;
        
        // 更新移动计时器
        this.moveTimer += deltaTime;
        
        // 检查是否需要改变方向
        if (this.moveTimer >= this.changeDirectionInterval) {
            this.generateNewTarget();
            this.moveTimer = 0;
        }
        
        // 执行移动
        if (this.isMoving) {
            this.moveTowardsTarget(deltaTime);
        }
    }
    
    /**
     * 创建英雄Spine动画
     */
    private createHeroSpine(): void {
        console.error('=== 开始创建英雄Spine动画 ===');
        
        // 总是创建一个新的子节点来放置Spine组件，避免与现有渲染组件冲突
        const spineNode = new Node('HeroSpine');
        
        if (!this.heroNode) {
            console.error('heroNode为空，使用当前节点作为父节点');
            this.node.addChild(spineNode);
        } else {
            console.error('在heroNode下创建Spine子节点:', this.heroNode.name);
            this.heroNode.addChild(spineNode);
        }
        
        // 将spineNode设置为heroNode，这样后续代码可以正常工作
        this.heroNode = spineNode;
        console.error('创建的Spine节点:', this.heroNode.name);
        
        // 延迟执行以确保资源加载完成
        this.scheduleOnce(() => {
            console.error('开始延迟加载Spine资源...');
            this.loadHeroSpineAsset();
        }, 0.1);
    }
    
    /**
     * 加载英雄Spine资源
     */
    private loadHeroSpineAsset(): void {
        console.log(`开始加载英雄Spine资源: ${this.heroId}`);
        
        // 尝试多个可能的路径
        const possiblePaths = [
            `spine/heros/${this.heroId}`,  // 主要路径
            `spine/${this.heroId}`,        // 备用路径1
            `heros/${this.heroId}`,        // 备用路径2
            this.heroId                    // 直接使用ID
        ];
        
        this.tryLoadSpineFromPaths(possiblePaths, 0);
    }
    
    /**
     * 尝试从多个路径加载Spine资源
     */
    private tryLoadSpineFromPaths(paths: string[], index: number): void {
        if (index >= paths.length) {
            console.error(`所有路径都尝试失败，无法加载英雄Spine资源: ${this.heroId}`);
            console.error(`尝试过的路径:`, paths);
            return;
        }
        
        const currentPath = paths[index];
        console.log(`尝试路径 ${index + 1}/${paths.length}: ${currentPath}`);
        
        resources.load(currentPath, sp.SkeletonData, (err, spineAsset) => {
            if (err) {
                console.warn(`路径 "${currentPath}" 加载失败:`, err.message);
                // 尝试下一个路径
                this.tryLoadSpineFromPaths(paths, index + 1);
                return;
            }
            
            if (spineAsset) {
                console.log(`✅ 英雄Spine资源加载成功! 路径: ${currentPath}`);
                this.setupSpineComponent(spineAsset);
            } else {
                console.warn(`路径 "${currentPath}" 返回空资源`);
                // 尝试下一个路径
                this.tryLoadSpineFromPaths(paths, index + 1);
            }
        });
    }
    
    /**
     * 设置Spine组件
     */
    private setupSpineComponent(spineAsset: sp.SkeletonData): void {
        console.log('开始设置Spine组件...');
        
        if (!this.heroNode) {
            console.error('❌ heroNode未设置，无法创建Spine组件');
            return;
        }
        
        console.log('✅ heroNode存在:', this.heroNode.name);
        
        // 获取或创建Spine组件
        this.spineComponent = this.heroNode.getComponent(sp.Skeleton);
        if (!this.spineComponent) {
            console.log('创建新的Spine组件...');
            this.spineComponent = this.heroNode.addComponent(sp.Skeleton);
        } else {
            console.log('使用现有的Spine组件');
        }
        
        if (!this.spineComponent) {
            console.error('❌ 无法创建或获取Spine组件');
            return;
        }
        
        console.log('✅ Spine组件准备就绪');
        
        // 设置Spine数据
        this.spineComponent.skeletonData = spineAsset;
        console.log('✅ Spine数据已设置');
        
        // 确保节点可见
        this.heroNode.active = true;
        console.log('✅ heroNode已激活');
        
        // 设置英雄的变换属性
        this.setupHeroTransform();
        
        // 播放默认动画
        this.playDefaultAnimation();
        
        console.log('🎉 英雄Spine组件设置完成!');
        console.log('节点信息:', {
            name: this.heroNode.name,
            active: this.heroNode.active,
            position: this.heroNode.position,
            scale: this.heroNode.scale,
            parent: this.heroNode.parent?.name
        });
    }
    
    /**
     * 播放默认动画
     */
    private playDefaultAnimation(): void {
        if (!this.spineComponent) {
            console.warn('❌ spineComponent不存在，无法播放动画');
            return;
        }
        
        console.log('开始播放默认动画...');
        
        // 尝试播放常见的默认动画 - 优先播放stand by相关动画
        const defaultAnimations = ['stand by', 'standby', 'stand', 'idle', 'default'];
        
        for (const animName of defaultAnimations) {
            if (this.spineComponent.findAnimation(animName)) {
                this.spineComponent.setAnimation(0, animName, true);
                console.log(`✅ 播放默认动画: ${animName}`);
                return;
            }
        }
        
        // 如果没有找到默认动画，播放第一个可用动画
        try {
            const animations = this.spineComponent.skeletonData.skeletonJson.animations;
            if (animations && Object.keys(animations).length > 0) {
                const firstAnim = Object.keys(animations)[0];
                this.spineComponent.setAnimation(0, firstAnim, true);
                console.log(`✅ 播放第一个可用动画: ${firstAnim}`);
                console.log('可用动画列表:', Object.keys(animations));
            } else {
                console.warn('❌ 没有找到任何可用动画');
            }
        } catch (error) {
            console.error('❌ 获取动画列表时出错:', error);
        }
    }
    
    /**
     * 设置英雄变换属性
     */
    private setupHeroTransform(): void {
        if (!this.heroNode) {
            console.warn('❌ heroNode不存在，无法设置变换属性');
            return;
        }
        
        console.log('设置英雄变换属性...');
        
        // 设置位置（相对于父节点）
        this.heroNode.setPosition(0, 0, 0);
        console.log('✅ 位置设置为 (0, 0, 0)');
        
        // 设置缩放 - 参考HeroCard的大小设置
        this.heroNode.setScale(0.5, 0.5, 1);
        console.log('✅ 缩放设置为 (0.5, 0.5, 1))');
        
        // 确保可见
        this.heroNode.active = true;
        console.log('✅ 节点已激活');
    }
    
    /**
     * 播放指定动画
     * @param animationName 动画名称
     * @param loop 是否循环播放
     */
    public playAnimation(animationName: string, loop: boolean = true): void {
        if (!this.spineComponent) {
            console.warn('Spine组件未初始化');
            return;
        }
        
        try {
            this.spineComponent.setAnimation(0, animationName, loop);
            console.log(`播放动画: ${animationName}, 循环: ${loop}`);
        } catch (error) {
            console.error(`播放动画失败: ${animationName}`, error);
        }
    }
    
    /**
     * 获取所有可用动画名称
     * @returns 动画名称数组
     */
    public getAvailableAnimations(): string[] {
        if (!this.spineComponent || !this.spineComponent.skeletonData) {
            return [];
        }
        
        const animations: string[] = [];
        const skeletonData = this.spineComponent.skeletonData.getRuntimeData();
        
        if (skeletonData && skeletonData.animations) {
            for (let i = 0; i < skeletonData.animations.length; i++) {
                const anim = skeletonData.animations[i];
                if (anim && anim.name) {
                    animations.push(anim.name);
                }
            }
        }
        
        return animations;
    }
    
    /**
     * 设置英雄可见性
     * @param visible 是否可见
     */
    public setHeroVisible(visible: boolean): void {
        if (this.heroNode) {
            this.heroNode.active = visible;
        }
    }
    
    /**
     * 设置英雄位置
     * @param x X坐标
     * @param y Y坐标
     * @param z Z坐标（可选）
     */
    public setHeroPosition(x: number, y: number, z: number = 0): void {
        if (this.heroNode) {
            this.heroNode.setPosition(x, y, z);
        }
    }
    
    /**
     * 设置英雄缩放
     * @param scaleX X轴缩放
     * @param scaleY Y轴缩放
     * @param scaleZ Z轴缩放（可选）
     */
    public setHeroScale(scaleX: number, scaleY: number, scaleZ: number = 1): void {
        if (this.heroNode) {
            this.heroNode.setScale(scaleX, scaleY, scaleZ);
        }
    }
    
    /**
     * 获取Spine组件
     * @returns Spine组件实例
     */
    public getSpineComponent(): sp.Skeleton {
        return this.spineComponent;
    }
    
    /**
     * 获取英雄节点
     * @returns 英雄节点实例
     */
    public getHeroNode(): Node {
        return this.heroNode;
    }
    
    // ==================== 移动相关方法 ====================
    
    /**
     * 初始化屏幕边界
     */
    private initScreenBounds(): void {
        const visibleSize = view.getVisibleSize();
        const margin = 50; // 边界留白
        
        this.screenBounds = {
            left: -visibleSize.width / 2 + margin,
            right: visibleSize.width / 2 - margin,
            top: visibleSize.height / 2 - margin,
            bottom: -visibleSize.height / 2 + margin
        };
        
        console.log('屏幕边界设置:', this.screenBounds);
    }
    
    /**
     * 开始随机移动
     */
    private startRandomMovement(): void {
        if (!this.heroNode) return;
        
        console.log('开始随机移动...');
        this.currentPosition = this.heroNode.position.clone();
        this.generateNewTarget();
        this.isMoving = true;
    }
    
    /**
     * 生成新的随机目标位置
     */
    private generateNewTarget(): void {
        const randomX = Math.random() * (this.screenBounds.right - this.screenBounds.left) + this.screenBounds.left;
        const randomY = Math.random() * (this.screenBounds.top - this.screenBounds.bottom) + this.screenBounds.bottom;
        
        this.targetPosition.set(randomX, randomY, 0);
        console.log(`新目标位置: (${randomX.toFixed(1)}, ${randomY.toFixed(1)})`);
        
        // 切换到移动动画
        this.playMoveAnimation();
    }
    
    /**
     * 向目标位置移动
     */
    private moveTowardsTarget(deltaTime: number): void {
        if (!this.heroNode) return;
        
        this.currentPosition = this.heroNode.position.clone();
        
        // 计算移动方向
        const direction = new Vec3();
        Vec3.subtract(direction, this.targetPosition, this.currentPosition);
        
        // 检查是否到达目标
        const distance = direction.length();
        if (distance < 5) {
            // 到达目标，切换到待机动画
            this.playStandAnimation();
            return;
        }
        
        // 标准化方向向量
        direction.normalize();
        
        // 计算移动距离
        const moveDistance = this.moveSpeed * deltaTime;
        
        // 计算新位置
        const newPosition = new Vec3();
        Vec3.scaleAndAdd(newPosition, this.currentPosition, direction, moveDistance);
        
        // 边界检测
        newPosition.x = Math.max(this.screenBounds.left, Math.min(this.screenBounds.right, newPosition.x));
        newPosition.y = Math.max(this.screenBounds.bottom, Math.min(this.screenBounds.top, newPosition.y));
        
        // 设置新位置
        this.heroNode.setPosition(newPosition);
        
        // 根据移动方向调整英雄朝向
        if (direction.x > 0) {
            this.heroNode.setScale(Math.abs(this.heroNode.scale.x), this.heroNode.scale.y, this.heroNode.scale.z);
        } else if (direction.x < 0) {
            this.heroNode.setScale(-Math.abs(this.heroNode.scale.x), this.heroNode.scale.y, this.heroNode.scale.z);
        }
    }
    
    /**
     * 播放移动动画
     */
    private playMoveAnimation(): void {
        if (!this.spineComponent) return;
        
        const moveAnimations = ['run', 'walk', 'move'];
        for (const animName of moveAnimations) {
            if (this.spineComponent.findAnimation(animName)) {
                this.spineComponent.setAnimation(0, animName, true);
                console.log(`播放移动动画: ${animName}`);
                return;
            }
        }
        
        // 如果没有移动动画，继续播放当前动画
        console.log('没有找到移动动画，继续当前动画');
    }
    
    /**
     * 播放待机动画
     */
    private playStandAnimation(): void {
        if (!this.spineComponent) return;
        
        const standAnimations = ['stand by', 'standby', 'stand', 'idle', 'default'];
        for (const animName of standAnimations) {
            if (this.spineComponent.findAnimation(animName)) {
                this.spineComponent.setAnimation(0, animName, true);
                console.log(`播放待机动画: ${animName}`);
                return;
            }
        }
    }
    
    /**
     * 组件销毁时清理资源
     */
    onDestroy(): void {
        if (this.spineComponent) {
            this.spineComponent = null;
        }
        if (this.heroNode) {
            this.heroNode = null;
        }
    }
}


