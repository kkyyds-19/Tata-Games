import { _decorator, Component, Node, Rect, UITransform, find } from 'cc';
// import { BulletManager } from './BulletManager'; // 移除循环引用
// import { Bullet } from './bullet/Bullet'; // 移除循环引用

const { ccclass, property } = _decorator;

@ccclass('WallManager')
export class WallManager extends Component {

    private walls: Rect[] = [];

    @property(Node)
    public stone_aim_rect: Node | null = null;

    onLoad() {
      
    }
    protected start(): void {
        console.log('[WallManager] Initializing...');
        this.node.children.forEach(wallNode => {
            // 排除 stone_aim_rect 节点，它不应该参与反弹检测
            if (wallNode === this.stone_aim_rect) {
                console.log(`[WallManager] 跳过 stone_aim_rect 节点: ${wallNode.name}`);
                return;
            }
            
            const uiTransform = wallNode.getComponent(UITransform);
            if (uiTransform) {
                const worldRect = uiTransform.getBoundingBoxToWorld();
                this.walls.push(worldRect);
                console.log(`[WallManager] Detected wall at: x:${worldRect.x.toFixed(2)}, y:${worldRect.y.toFixed(2)}, w:${worldRect.width.toFixed(2)}, h:${worldRect.height.toFixed(2)} (${wallNode.name})`);
            } else {
                console.warn(`[WallManager] Child node '${wallNode.name}' does not have a UITransform component.`);
            }
        });
        
        // console.log(`[WallManager] 初始化完成，共检测到 ${this.walls.length} 个反弹墙壁`);
    }

    update(dt: number) {
        // 1. 通过find方法获取BulletManager实例，避免循环引用
        const bulletManagerNode = find('Canvas/bg/bullet_manager');
        if (!bulletManagerNode) return;
        
        const bulletManager = bulletManagerNode.getComponent('BulletManager');
        if (!bulletManager) return;

        // 2. 从BulletManager获取所有活跃子弹
        const activeBullets = (bulletManager as any).getActiveBullets();

        // 3. 遍历子弹，检查是否需要反弹
        for (const bullet of activeBullets) {
            // 只处理有剩余反弹次数的子弹
            if (bullet.remainingBounceCount > 0) {
                this.checkAndBounce(bullet);
            }
        }
    }

    private checkAndBounce(bullet: any) {
        const bulletNode = bullet.node;
        const bulletTransform = bulletNode.getComponent(UITransform);
        if (!bulletTransform) return;

        const bulletRect = bulletTransform.getBoundingBoxToWorld();

        for (const wallRect of this.walls) {
            // 3. 检查子弹和墙壁是否相交
            if (bulletRect.intersects(wallRect)) {
                
                // 4. 计算反弹
                const overlap = new Rect();
                Rect.intersection(overlap, bulletRect, wallRect);

                let hitVertical = false;
                let hitHorizontal = false;

                // 新增：判断是否为第一次反弹
                const initialBounceCount = bullet.bulletData?.bounce ?? 0;
                const isFirstBounce = bullet.remainingBounceCount === initialBounceCount;

                // 根据重叠的宽高比，判断是水平碰撞还是垂直碰撞
                if (overlap.width < overlap.height) {
                    // 垂直碰撞
                    hitVertical = true;
                    // 将子弹移出墙壁，防止卡住
                    const nudge = (bulletRect.center.x < wallRect.center.x ? -1 : 1) * overlap.width;
                    bulletNode.setWorldPosition(bulletNode.worldPosition.x + nudge, bulletNode.worldPosition.y, bulletNode.worldPosition.z);
                } else {
                    // 水平碰撞
                    hitHorizontal = true;
                    // 将子弹移出墙壁
                    const nudge = (bulletRect.center.y < wallRect.center.y ? -1 : 1) * overlap.height;
                    bulletNode.setWorldPosition(bulletNode.worldPosition.x, bulletNode.worldPosition.y + nudge, bulletNode.worldPosition.z);
                }

                // 调用子弹自己的反弹方法，并传入是否为首次反弹的标志
                bullet.bounce(hitVertical, hitHorizontal, isFirstBounce);

                // 5. 消耗一次反弹次数
                bullet.remainingBounceCount--;

                // 每次只处理一次反弹，防止在一帧内和多个墙壁连续反弹
                break; 
            }
        }
    }

    /**
     * 获取 stone_aim_rect 节点的世界坐标和尺寸
     * @returns 包含世界坐标(x, y)和尺寸(width, height)的对象，如果节点不存在则返回null
     */
    public getStoneAimRectInfo(): { x: number, y: number, width: number, height: number } | null {
        if (!this.stone_aim_rect) {
            console.warn('[WallManager] stone_aim_rect 节点未设置');
            return null;
        }

        const uiTransform = this.stone_aim_rect.getComponent(UITransform);
        if (!uiTransform) {
            console.warn('[WallManager] stone_aim_rect 节点没有 UITransform 组件');
            return null;
        }

        // 获取节点的本地位置
        const localPos = this.stone_aim_rect.position;
        
        // 获取节点的世界位置
        const worldPos = this.stone_aim_rect.worldPosition;
        
        // 获取世界坐标边界框
        const worldRect = uiTransform.getBoundingBoxToWorld();
        
        // 获取内容尺寸
        const contentSize = uiTransform.contentSize;
        
        const rectInfo = {
            x: worldRect.x,
            y: worldRect.y,
            width: worldRect.width,
            height: worldRect.height
        };

        // console.log(`[WallManager] stone_aim_rect 详细坐标信息:`);
        // console.log(`  本地位置: x=${localPos.x.toFixed(2)}, y=${localPos.y.toFixed(2)}`);
        // console.log(`  世界位置: x=${worldPos.x.toFixed(2)}, y=${worldPos.y.toFixed(2)}`);
        // console.log(`  内容尺寸: w=${contentSize.width.toFixed(2)}, h=${contentSize.height.toFixed(2)}`);
        // console.log(`  世界边界框: x=${rectInfo.x.toFixed(2)}, y=${rectInfo.y.toFixed(2)}, w=${rectInfo.width.toFixed(2)}, h=${rectInfo.height.toFixed(2)}`);
        // console.log(`  中心点计算: centerY = ${rectInfo.y.toFixed(2)} + ${rectInfo.height.toFixed(2)}/2 = ${(rectInfo.y + rectInfo.height/2).toFixed(2)}`);
        
        return rectInfo;
    }

    /**
     * 获取 stone_aim_rect 的中心点世界坐标
     * @returns 中心点坐标 {x, y}，如果节点不存在则返回null
     */
    public getStoneAimRectCenter(): { x: number, y: number } | null {
        const rectInfo = this.getStoneAimRectInfo();
        if (!rectInfo) {
            return null;
        }

        const centerX = rectInfo.x + rectInfo.width / 2;
        const centerY = rectInfo.y + rectInfo.height / 2;

        console.log(`[WallManager] stone_aim_rect 中心点: x=${centerX.toFixed(2)}, y=${centerY.toFixed(2)}`);
        
        return { x: centerX, y: centerY };
    }
} 