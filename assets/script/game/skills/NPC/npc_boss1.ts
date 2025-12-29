import { _decorator, Component, Node, sp, resources, SkeletalAnimationState, Vec3, view, screen, UITransform, UIOpacity, Layers, director, Canvas, tween } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('npc_boss1')
export class npc_boss1 extends Component {
    
    @property(Node)
    heroNode: Node = null;
    
    // 移动相关属性
    @property
    moveSpeed: number = 100; // 移动速度（像素/秒）
    
    @property
    changeDirectionInterval: number = 3; // 改变方向的间隔时间（秒）
    
    private spineComponent: sp.Skeleton = null;
    private heroId: string = 'b_0_005';
    
    // 移动相关变量
    private targetPosition: Vec3 = new Vec3();
    private currentPosition: Vec3 = new Vec3();
    private isMoving: boolean = false;
    private enableRandomMovement: boolean = false; // 关闭随机移动，改为Y轴往返
    private basePosition: Vec3 = new Vec3();
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
        
        // 延迟启动Y轴往返移动（等Spine节点创建完成）
        this.scheduleOnce(() => {
            this.startVerticalOscillation(1000);
        }, 0.5);
    }

    update(deltaTime: number) {
        if (!this.heroNode || !this.heroNode.isValid) return;
        
        if (!this.enableRandomMovement) {
            return; // 禁用随机移动逻辑
        }
        // 以下为随机移动逻辑（当前关闭）
        this.moveTimer += deltaTime;
        if (this.moveTimer >= this.changeDirectionInterval) {
            this.generateNewTarget();
            this.moveTimer = 0;
        }
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
        // 添加UITransform以参与UI渲染，并设置一个合理的内容大小
        let uiTransform = spineNode.getComponent(UITransform);
        if (!uiTransform) {
            uiTransform = spineNode.addComponent(UITransform);
        }
        uiTransform.setContentSize(400, 400);
        // 设置UI层，确保由UICamera渲染
        spineNode.layer = Layers.Enum.UI_2D;
        
        if (!this.heroNode) {
            console.error('heroNode为空，使用当前节点作为父节点');
            this.node.addChild(spineNode);
        } else {
            console.error('在heroNode下创建Spine子节点:', this.heroNode.name);
            this.heroNode.addChild(spineNode);
        }
        
        // 如果当前不在Canvas下，尝试移动到Canvas下，避免渲染不到
        try {
            const scene = director.getScene();
            const canvasNode = scene?.getChildByName('Canvas');
            if (canvasNode) {
                const underCanvas = this.isUnderNode(spineNode, canvasNode);
                if (!underCanvas) {
                    console.log('将Spine节点移动到Canvas下以确保显示');
                    spineNode.removeFromParent();
                    canvasNode.addChild(spineNode);
                }
            }
            // 放到同层最后，避免被遮挡
            if (spineNode.parent) {
                spineNode.setSiblingIndex(spineNode.parent.children.length - 1);
            }
        } catch (e) {
            console.warn('移动到Canvas下过程遇到问题，可忽略:', e);
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
            `spine/boss/${this.heroId}`,   // boss目录（已确认路径）
            `spine/${this.heroId}`,        // 备用路径1
            this.heroId                    // 直接使用ID
        ];
        console.log('将尝试加载的资源路径候选:', possiblePaths);
        
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
        // 显示优化设置
        this.spineComponent.premultipliedAlpha = false; // 如仍不显示，可尝试改为true
        this.spineComponent.timeScale = 1.0;
        
        // 设置Spine数据
        this.spineComponent.skeletonData = spineAsset;
        console.log('✅ Spine数据已设置');
        
        // 皮肤与初始姿态设置
        try {
            const skins = this.getAvailableSkins();
            console.log('可用皮肤列表:', skins);
            if (skins.length > 0) {
                const useSkin = skins.includes('default') ? 'default' : skins[0];
                this.spineComponent.setSkin(useSkin);
                console.log('应用皮肤:', useSkin);
            } else {
                console.log('未检测到皮肤列表，跳过设置皮肤');
            }
            // 重置到Setup Pose，防止插槽初始状态异常导致不可见
            this.spineComponent.setSlotsToSetupPose();
            console.log('已重置到Setup Pose');
        } catch (e) {
            console.warn('设置皮肤或初始姿态时异常:', e);
        }
        
        // 打开调试渲染以确认可见性（临时）
        this.spineComponent.debugSlots = true;
        this.spineComponent.debugBones = true;
        console.log('调试渲染: debugSlots/debugBones 已启用');
        
        // 确保节点可见
        this.heroNode.active = true;
        console.log('✅ heroNode已激活');
        
        // 设置英雄的变换属性
        this.setupHeroTransform();
        
        // 播放默认动画
        this.playDefaultAnimation();
        
        // 可见性诊断
        this.checkDisplayVisibility();
        
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
        
        // 优先尝试播放移动相关动画
        const moveAnimations = ['move', 'run', 'walk'];
        for (const animName of moveAnimations) {
            if (this.spineComponent.findAnimation(animName)) {
                try {
                    this.spineComponent.setAnimation(0, animName, true);
                    console.log(`✅ 播放默认移动动画: ${animName}`);
                    return;
                } catch (error) {
                    console.error(`❌ 播放 ${animName} 失败:`, error);
                }
            }
        }
        
        // 其次尝试待机类动画
        const defaultAnimations = ['stand by', 'standby', 'stand', 'idle', 'default'];
        for (const animName of defaultAnimations) {
            if (this.spineComponent.findAnimation(animName)) {
                try {
                    this.spineComponent.setAnimation(0, animName, true);
                    console.log(`✅ 播放默认待机动画: ${animName}`);
                    return;
                } catch (error) {
                    console.error(`❌ 播放 ${animName} 失败:`, error);
                }
            }
        }
        
        // 如果都没有，播放第一个可用动画
        const available = this.getAvailableAnimations();
        if (available.length > 0) {
            const firstAnim = available[0];
            try {
                this.spineComponent.setAnimation(0, firstAnim, true);
                console.log(`✅ 播放第一个可用动画: ${firstAnim}`);
                console.log('可用动画列表:', available);
            } catch (error) {
                console.error('❌ 设置第一个动画失败:', error);
            }
        } else {
            console.warn('❌ 没有找到任何可用动画');
        }
    }

    /**
     * 可见性与屏幕诊断
     */
    private checkDisplayVisibility(): void {
        if (!this.heroNode) return;
        console.log('=== 显示可见性诊断 ===');
        try {
            const worldPos = this.heroNode.getWorldPosition();
            const ui = this.heroNode.getComponent(UITransform);
            const bbox = ui ? ui.getBoundingBoxToWorld() : null;
            const screenSize = view.getVisibleSize();
            const opacity = this.heroNode.getComponent(UIOpacity)?.opacity ?? '未添加UIOpacity';
            console.log('节点世界位置:', worldPos);
            console.log('UITransform存在:', !!ui, '世界边界框:', bbox);
            console.log('屏幕尺寸:', screenSize);
            console.log('节点层(layer):', this.heroNode.layer);
            console.log('opacity:', opacity);
            if (bbox) {
                const onScreen = bbox.x < screenSize.width && bbox.x + bbox.width > 0 && bbox.y < screenSize.height && bbox.y + bbox.height > 0;
                console.log('是否在屏幕可见区域:', onScreen ? '是' : '否');
            }
        } catch (e) {
            console.warn('可见性诊断异常:', e);
        }
    }

    /**
     * 判断节点是否在指定祖先之下
     */
    private isUnderNode(node: Node, ancestor: Node): boolean {
        let cur = node.parent;
        while (cur) {
            if (cur === ancestor) return true;
            cur = cur.parent;
        }
        return false;
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
        this.heroNode.setScale(0.3, 0.3, 1);
        console.log('✅ 缩放设置为 (0.3, 0.3, 1)');
        
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
     * 获取所有可用皮肤名称
     */
    private getAvailableSkins(): string[] {
        if (!this.spineComponent || !this.spineComponent.skeletonData) {
            return [];
        }
        const skins: string[] = [];
        try {
            const runtime = this.spineComponent.skeletonData.getRuntimeData();
            if (runtime && runtime.skins) {
                for (let i = 0; i < runtime.skins.length; i++) {
                    const skin = runtime.skins[i];
                    if (skin && skin.name) skins.push(skin.name);
                }
            }
        } catch (e) {
            console.warn('获取皮肤列表异常:', e);
        }
        return skins;
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
     * 沿Y轴往返移动：向上移动指定距离，再移动回原位，循环往复
     */
    private startVerticalOscillation(distance: number = 1000): void {
        if (!this.heroNode) return;
        
        // 记录初始位置
        this.basePosition = this.heroNode.getPosition().clone();
        console.log(`启动Y轴往返移动，基础位置: (${this.basePosition.x}, ${this.basePosition.y}), 距离: ${distance}`);
        
        // 计算时长（基于moveSpeed）
        const duration = Math.max(0.01, distance / this.moveSpeed);
        console.log(`往返每段时长: ${duration.toFixed(2)}s (速度: ${this.moveSpeed})`);
        
        // 播放移动动画
        this.playMoveAnimation();
        
        // 构造往返补间
        const upPos = new Vec3(this.basePosition.x, this.basePosition.y + distance, this.basePosition.z);
        tween(this.heroNode)
            .to(duration, { position: upPos })
            .to(duration, { position: this.basePosition })
            .union()
            .repeatForever()
            .start();
        
        // 关闭随机移动标志
        this.enableRandomMovement = false;
        this.isMoving = false;
        console.log('随机移动已关闭，Y轴往返移动启动');
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


