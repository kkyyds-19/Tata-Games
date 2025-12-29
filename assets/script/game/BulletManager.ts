import { _decorator, Component, Node, instantiate, Prefab, Vec2, Vec3, EventTarget, game, find, view, Rect } from 'cc';
import { Bullet } from './bullet/Bullet';
import { BulletConfig } from './bullet/BulletConfig';
import { IBulletData } from './types';
import { Monster } from './enemy/monster';
import { UITransform } from 'cc';
import { TimeManager } from './TimeManager';
import { HerosManager } from './HerosManager';
import { StageType } from './stage/StageData';
// import { WallManager } from './WallManager'; // 移除循环引用
const { ccclass, property } = _decorator;

// 用于管理多波次发射任务的接口
interface IWaveSpawner {
    bulletData: IBulletData;
    directionVectors: Vec2[];
    colOffsets: number[];
    startPosition: Vec2;
    originalTargetPosition: Vec2 | null; // 保存原始的targetPosition，用于判断是否需要重新计算
    
    waveCount: number;
    waveDelay: number;
    
    currentWave: number;
    timer: number;
}

@ccclass('BulletManager')
export class BulletManager extends Component {
    private static _instance: BulletManager;
    public static get instance(): BulletManager {
        return this._instance;
    }

    private bullets: Bullet[] = [];
    private eventTarget: EventTarget = new EventTarget();
    private waveSpawners: IWaveSpawner[] = []; // 多波次发射器数组
    
    // 随机选择池 - 实现平均随机且不重复
    private randomEnemyPool: Vec2[] = [];
    private usedEnemyIndices: Set<number> = new Set();

    @property(Prefab)
    public bulletPrefab: Prefab | null = null;
    
    // 子弹回收配置
    private readonly BULLET_MAX_LIFETIME = 20; // 子弹最长存活时间（秒）
    private readonly OFFSCREEN_BUFFER = 200;  // 屏幕外回收缓冲区域（像素）

    onLoad() {
        BulletManager._instance = this;
        // 注册发射子弹事件监听
        this.eventTarget.on(game.gameEvent.FIRE_BULLET, this.onFireBullet, this);
    }

    onDestroy() {
        // 注销事件监听
        this.eventTarget.off(game.gameEvent.FIRE_BULLET, this.onFireBullet, this);
    }

    /**
     * 主循环，处理波次发射和子弹回收
     * @param dt 
     */
    update(dt: number) {
        // 使用 TimeManager 的缩放时间
        const scaledDt = TimeManager.getInstance().getDeltaTime(dt);
        
        // 1. 处理波次发射器
        for (let i = this.waveSpawners.length - 1; i >= 0; i--) {
            const spawner = this.waveSpawners[i];
            spawner.timer += scaledDt;

            if (spawner.timer >= spawner.waveDelay) {
                spawner.timer -= spawner.waveDelay; // 减去延迟，保留多余的时间
                
                this.spawnWave(spawner); // 发射一波
                spawner.currentWave++;

                if (spawner.currentWave >= spawner.waveCount) {
                    this.waveSpawners.splice(i, 1); // 完成所有波次，移除发射器
                }
            }
        }

        // 2. 更新和回收子弹
        this.updateAndRecycleBullets(scaledDt);
    }

    /**
     * 根据子弹ID创建对应的子弹类型
     * @param bulletId 子弹ID
     * @returns 对应的子弹组件类型
     */
    private getBulletClass(bulletId: string): typeof Bullet {
        // 所有子弹都使用基础Bullet类
        return Bullet;
    }

    /**
     * 新增：负责子弹的更新和回收
     * @param scaledDt 经过时间缩放的dt
     */
    private updateAndRecycleBullets(scaledDt: number) {
        const visibleSize = view.getVisibleSize();
        // 定义回收边界，比屏幕可视范围大一点，给子弹留出缓冲空间
        const recycleBounds = new Rect(
            -this.OFFSCREEN_BUFFER,
            -this.OFFSCREEN_BUFFER,
            visibleSize.width + this.OFFSCREEN_BUFFER * 2,
            visibleSize.height + this.OFFSCREEN_BUFFER * 2
        );

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            // 基本的有效性检查
            if (!bullet || !bullet.node || !bullet.node.isValid) {
                this.bullets.splice(i, 1);
                continue;
            }

            let shouldRecycle = false;

            // 条件1: 子弹本身变为非活动状态（例如击中目标）
            if (!bullet.isActive) {
                shouldRecycle = true;
            } else {
                // 为子弹动态附加一个计时器来管理其生命周期
                const bulletWithTimer = bullet as any;

                // 条件2: 子弹存活时间超限
                // 【修改】只有当子弹无法再反弹时，才开始计时并检查其寿命
                if (bullet.remainingBounceCount <= 0) {
                    bulletWithTimer.lifeTimer = (bulletWithTimer.lifeTimer || 0) + scaledDt;
                    if (bulletWithTimer.lifeTimer > this.BULLET_MAX_LIFETIME) {
                        shouldRecycle = true;
                    }
                }

                // 条件3: 子弹超出屏幕范围
                const pos = bullet.node.worldPosition;
                if (!recycleBounds.contains(new Vec2(pos.x, pos.y))) {
                    shouldRecycle = true;
                }
            }
            
            if (shouldRecycle) {
                // 执行回收, 优先调用子弹自身的回收方法，否则直接销毁
                if (typeof (bullet as any).recycle === 'function') {
                    (bullet as any).recycle();
                } else {
                    bullet.node.destroy();
                }
                // 从管理器中移除
                this.bullets.splice(i, 1);
            }
        }
    }

    /**
     * 新增：获取当前所有活跃的子弹（只读）
     */
    public getActiveBullets(): readonly Bullet[] {
        return this.bullets;
    }

    /**
     * 获取事件目标，供外部发射事件使用
     */
    public getEventTarget(): EventTarget {
        return this.eventTarget;
    }

    /**
     * 处理发射子弹事件
     * @param data 事件数据 {startPosition: Vec2, targetPosition: Vec2, bulletId: string}
     */
    private onFireBullet(data: { startPosition: Vec2, targetPosition: Vec2, bulletId: string }) {
       
        
        this.spawnBullet(data.startPosition, data.targetPosition, data.bulletId);
    }

    /**
     * 生成子弹（支持多波次多连）
     * @param startPosition 出生点
     * @param targetPosition 目标点  null 表示随机找一个敌人发射
     * @param bulletId 弹幕ID
     */
    public spawnBullet(startPosition: Vec2, targetPosition: Vec2|null, bulletId: string): Bullet[] {
        if (!this.bulletPrefab) {
            console.warn('BulletManager: bulletPrefab is not assigned!');
            return [];
        }

        // 从配置表获取弹幕数据
        const bulletData: IBulletData | null = BulletConfig.getBulletData(bulletId);
        if (!bulletData) {
            console.warn(`BulletManager: 未找到弹幕配置 ID: ${bulletId}`);
            return [];
        }

        // 保存原始的targetPosition（可能为null）
        const originalTargetPosition = targetPosition;
        
        // 如果targetPosition为null，自动寻找最近的敌人（仅用于第一波的方向计算）
        if (!targetPosition) {
            targetPosition = this.findNearestEnemy(startPosition);
        }

        const createdBullets: Bullet[] = [];
        
        // 获取波次和列数
        const waveCount = bulletData.waveCount || 1;
        const colCount = bulletData.colCount || 1;
        const colSpacing = bulletData.colSpacing || 0;
        
        // 1. 预计算所有子弹的【方向向量】（仅用于第一波）
        const directionVectors: Vec2[] = this.calculateDirectionVectors(startPosition, targetPosition, bulletData);

        // 2. 预计算所有列的【起始X偏移】
        const colOffsets: number[] = [];
        for (let col = 0; col < colCount; col++) {
            if (bulletData.spreadAngle <= 0 && colSpacing > 0) {
                colOffsets.push((col - (colCount - 1) / 2) * colSpacing);
            } else {
                colOffsets.push(0);
            }
        }

        // 创建一个临时的发射器数据用于发射第一波
        const spawner: IWaveSpawner = {
            bulletData, directionVectors, colOffsets, startPosition,
            originalTargetPosition: originalTargetPosition, // 保存原始的targetPosition
            waveCount, waveDelay: bulletData.waveDelay || 0,
            currentWave: 0, timer: 0
        };

        this.spawnWave(spawner); // 立即发射第一波

        // 如果有多波，则创建发射器并加入管理
        if (waveCount > 1) {
            spawner.currentWave = 1; // 下一波是第1波 (索引从0开始)
            this.waveSpawners.push(spawner);
        }

        return createdBullets;
    }

    /**
     * 根据发射器数据，生成一波子弹
     * @param spawner 
     */
    private spawnWave(spawner: IWaveSpawner) {
        // 特殊处理：落雷效果
        if (spawner.bulletData.id.includes('assassin_lightning')) {
            this.spawnLightningStrike(spawner);
            return;
        }

        // 如果原始targetPosition为null，需要重新计算当前波次的目标位置和方向
        let currentDirectionVectors = spawner.directionVectors;

        // 特殊处理：tanker_rock 透视梯形投影 - 出生点x映射到目标区域x
        if (spawner.bulletData.id.includes('tanker_rock')) {
            // 1. 随机生成开始点x坐标（梯形底部 - 较大范围）
            const screenWidth = 1200;
            const randomRange = screenWidth * 0.75;
            const randomStartX = 585 + (Math.random() - 0.5) * randomRange;
            
            // 2. 通过透视映射计算目标点坐标
            const targetPos = this.calculatePerspectiveMappedTarget(randomStartX);
            
            // 3. 更新开始位置和目标位置
            const randomStartPos = new Vec2(randomStartX, spawner.startPosition.y);
            
            // 4. 更新spawner的起始位置并重新计算方向向量
            spawner.startPosition = randomStartPos;
            currentDirectionVectors = this.calculateDirectionVectors(randomStartPos, targetPos, spawner.bulletData);
            
        } else {
            // 普通子弹：每一波都重新选择目标
            let newTarget: Vec2;
            if (spawner.bulletData.id.includes('drboom_basic_bomb')) {
                // 炸弹：选择最近的敌人
                newTarget = this.findNearestEnemy(spawner.startPosition);
            } else {
                // 其他子弹：随机选择敌人
                newTarget = this.findRandomEnemy(spawner.startPosition);
            }
            
            if (newTarget) {
                currentDirectionVectors = this.calculateDirectionVectors(spawner.startPosition, newTarget, spawner.bulletData);
                // 保存目标位置，供子弹使用
                (spawner as any).currentTarget = newTarget;
            }
        }

        const colCount = spawner.bulletData.colCount || 1;
        for (let col = 0; col < colCount; col++) {
            const bulletNode = instantiate(this.bulletPrefab);
            if (!bulletNode) continue;

            // 根据子弹ID获取对应的子弹类
            const BulletClass = this.getBulletClass(spawner.bulletData.id);
            
            // 获取或创建Bullet组件
            let bullet = bulletNode.getComponent(Bullet);
            if (!bullet) {
                bullet = bulletNode.addComponent(Bullet);
                if (!bullet) continue;
            }
            
            // 【关键修复】调用 initWithBulletData 初始化子弹
            bullet.initWithBulletData(spawner.startPosition, currentDirectionVectors[col], spawner.bulletData);
            
            // 为炸弹设置目标位置
            if (spawner.bulletData.id.includes('drboom_basic_bomb') && (spawner as any).currentTarget) {
                bullet.targetPosition.set((spawner as any).currentTarget);
            }

            // 获取bullet_manager节点
            const gameObjsNode = find('Canvas/bg/bullet_manager');
            if (gameObjsNode) {
                gameObjsNode.addChild(bulletNode);
            } else {
                // console.warn('BulletManager: 未找到 Canvas/bg/game_objs 节点，子弹将添加到场景根节点');
                this.node.scene.addChild(bulletNode);
            }
            
            // 设置起始位置
            let finalStartPos = new Vec3(
                spawner.startPosition.x + spawner.colOffsets[col],
                spawner.startPosition.y,
                0
            );
            
            // 为炸弹应用偏移量
            if (spawner.bulletData.id.includes('drboom_basic_bomb')) {
                const offsetX =80;  // 向右偏移180像素
                const offsetY = 150; // 向上偏移350像素
                finalStartPos = new Vec3(
                    finalStartPos.x + offsetX,
                    finalStartPos.y + offsetY,
                    0
                );

            }
            
            // 使用世界坐标来设置位置，避免坐标系问题
            bulletNode.setWorldPosition(finalStartPos);
            

            
            // 将bullet实例加入管理列表
            this.bullets.push(bullet);
        }
    }

    /**
     * 特殊处理：生成落雷效果
     * @param spawner 发射器数据
     */
    private spawnLightningStrike(spawner: IWaveSpawner) {
        const colCount = spawner.bulletData.colCount || 1;
        
        for (let col = 0; col < colCount; col++) {
            // 为每个落雷找一个随机目标，如果没找到敌人则劈向(0,0)
            const targetPos = this.findLightningTarget(spawner.startPosition);
            
            // 创建落雷子弹节点
            const bulletNode = instantiate(this.bulletPrefab);
            if (!bulletNode) continue;

            const bullet = bulletNode.getComponent(Bullet);
            if (!bullet) continue;
            
            // 设置子弹为特殊的落雷模式
            bullet.initAsLightningStrike(targetPos, spawner.bulletData);

            // 获取bullet_manager节点
            const gameObjsNode = find('Canvas/bg/bullet_manager');
            if (gameObjsNode) {
                gameObjsNode.addChild(bulletNode);
            } else {
                this.node.scene.addChild(bulletNode);
            }
            
            // 直接设置在目标位置
            bulletNode.setWorldPosition(new Vec3(targetPos.x, targetPos.y+100, 0));
            
            // 将bullet实例加入管理列表
            this.bullets.push(bullet);
        }
    }



    /**
     * 为落雷寻找目标位置 - 使用平均随机算法
     * @param startPosition 起始位置（实际上落雷不使用这个参数）
     * @returns 如果找到敌人返回随机敌人位置，否则返回(567,1600)
     */
    private findLightningTarget(startPosition: Vec2): Vec2 {
        // 使用平均随机选择获取敌人位置
        const randomEnemy = this.findRandomEnemy(startPosition);
        
        // 如果返回的是默认位置（表示没有敌人），则使用特定的落雷位置
        const defaultPos = new Vec2(startPosition.x, startPosition.y + 300);
        if (randomEnemy.equals(defaultPos)) {
            return new Vec2(567, 1600);
        }
        
        return randomEnemy;
    }

    /**
     * 计算方向向量（提取为独立方法，便于复用）
     */
    private calculateDirectionVectors(startPosition: Vec2, targetPosition: Vec2, bulletData: IBulletData): Vec2[] {
        const colCount = bulletData.colCount || 1;
        
        // 计算基础方向
        const baseDirection = new Vec2();
        Vec2.subtract(baseDirection, targetPosition, startPosition);
        const baseAngle = Math.atan2(baseDirection.y, baseDirection.x);

        const directionVectors: Vec2[] = [];
        
        if (bulletData.spreadAngle > 0) {
            // 扇形发射：为每列计算不同的角度和方向
            for (let col = 0; col < colCount; col++) {
                let angleOffset = 0;
                if (colCount > 1) {
                    const spreadRange = (bulletData.spreadAngle * Math.PI) / 180;
                    angleOffset = (col / (colCount - 1) - 0.5) * spreadRange;
                }
                const currentAngle = baseAngle + angleOffset;
                const direction = new Vec2(Math.cos(currentAngle), Math.sin(currentAngle));
                directionVectors.push(direction);
            }
        } else {
            // 平行发射：所有子弹使用完全相同的基础方向
            const normalizedBaseDirection = new Vec2();
            Vec2.normalize(normalizedBaseDirection, baseDirection);
            
            // 添加小幅随机扩散（5度内）
            const spreadAngleRad = (5 * Math.PI) / 180; // 5度扩散
            
            for (let col = 0; col < colCount; col++) {
                // 为每颗子弹添加小幅随机偏移
                const randomOffset = (Math.random() - 0.5) * spreadAngleRad;
                const adjustedAngle = baseAngle + randomOffset;
                const adjustedDirection = new Vec2(Math.cos(adjustedAngle), Math.sin(adjustedAngle));
                
                directionVectors.push(adjustedDirection);
            }
        }
        
        return directionVectors;
    }

    /**
     * 清除所有子弹和发射器
     */
    public clearAll() {
        for (const bullet of this.bullets) {
            if (bullet && bullet.node && bullet.node.isValid) {
                bullet.node.destroy();
            }
        }
        this.bullets = [];
        this.waveSpawners = []; // 同时清空发射器
    }

    /**
     * 寻找最近的敌人坐标
     * @param startPosition 起始位置
     * @returns 最近敌人的世界坐标，如果没找到敌人则返回startPosition正上方y轴+300的位置
     */
    public findNearestEnemy(startPosition: Vec2): Vec2 {
        // 查找场景中所有的Monster组件
        const parent = this.node.parent;
        const enemycontainer = parent.getChildByName("game_objs");

        let nearestEnemy: Vec2 | null = null;
        let nearestDistance = Number.MAX_VALUE;

        // 竞技场同侧过滤：仅在竞技场模式下启用
        const stageType = (game as any)?.myGlobal?.stageType;
        let arenaMidlineY: number | null = null;
        let isTopAttacker: boolean | null = null;
        let desiredLaneDir: number | null = null;
        if (stageType === StageType.Arena) {
            arenaMidlineY = this.getArenaMidlineY();
            if (arenaMidlineY != null) {
                isTopAttacker = startPosition.y > arenaMidlineY;
                desiredLaneDir = isTopAttacker ? +1 : -1;
            }
        }

        if (enemycontainer) {
            for (const child of enemycontainer.children) {
                const monster = child.getComponent(Monster);
                if (monster && monster.node && monster.node.active) {
                    // 获取怪物的世界坐标
                    const monsterWorldPos = monster.node.worldPosition;
                    const monsterPos2D = new Vec2(monsterWorldPos.x, monsterWorldPos.y);
                    // 竞技场侧边过滤
                    if (desiredLaneDir != null) {
                        const dir = (monster as any).laneDir;
                        if (typeof dir === 'number') {
                            if (dir !== desiredLaneDir) continue;
                        } else if (arenaMidlineY != null && isTopAttacker != null) {
                            const isMonsterTop = monsterPos2D.y > arenaMidlineY;
                            if (isTopAttacker === isMonsterTop) continue;
                        }
                    }
                    
                    // 计算距离
                    const distance = Vec2.distance(startPosition, monsterPos2D);
                    
                    // 如果这个敌人更近，则更新最近敌人
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestEnemy = monsterPos2D;
                    }
                }
            }
        }

        // 如果找到敌人，返回最近敌人位置；否则返回正上方位置
        if (nearestEnemy) {
            return nearestEnemy;
        }
        
        return new Vec2(startPosition.x, startPosition.y + 300);
    }

    /**
     * 更新敌人池 - 获取当前所有活着的敌人位置
     */
    private updateEnemyPool(): void {
        const parent = this.node.parent;
        const enemycontainer = parent.getChildByName("game_objs");

        this.randomEnemyPool = [];

        if (enemycontainer) {
            for (const child of enemycontainer.children) {
                const monster = child.getComponent(Monster);
                if (monster && monster.node && monster.node.active && !monster.isDead) {
                    // 获取怪物的世界坐标
                    const monsterWorldPos = monster.node.worldPosition;
                    const monsterPos2D = new Vec2(monsterWorldPos.x, monsterWorldPos.y);
                    this.randomEnemyPool.push(monsterPos2D);
                }
            }
        }
    }

    /**
     * 重置随机选择状态 - 当所有敌人都被选择过后调用
     */
    private resetRandomSelection(): void {
        this.usedEnemyIndices.clear();
    }

    /**
     * 平均随机选择敌人 - 确保每个敌人都有平等的被选择机会，不重复选择
     * @param startPosition 起始位置
     * @returns 随机敌人的世界坐标，如果没找到敌人则返回startPosition正上方y轴+300的位置
     */
    public findRandomEnemy(startPosition: Vec2): Vec2 {
        // 更新敌人池
        this.updateEnemyPool();

        // 如果没有敌人，返回默认位置
        if (this.randomEnemyPool.length === 0) {
            return new Vec2(startPosition.x, startPosition.y + 300);
        }

        // 竞技场同侧过滤：仅在竞技场模式下启用
        const stageType = (game as any)?.myGlobal?.stageType;
        let pool = this.randomEnemyPool;
        if (stageType === StageType.Arena) {
            const midlineY = this.getArenaMidlineY();
            if (midlineY != null) {
                const isTopAttacker = startPosition.y > midlineY;
                const desiredLaneDir = isTopAttacker ? +1 : -1;
                const parent = this.node.parent;
                const enemycontainer = parent.getChildByName("game_objs");
                if (enemycontainer) {
                    const filtered: Vec2[] = [];
                    for (const child of enemycontainer.children) {
                        const monster = child.getComponent(Monster);
                        if (monster && monster.node && monster.node.active && !monster.isDead) {
                            const dir = (monster as any).laneDir;
                            if (typeof dir === 'number' && dir === desiredLaneDir) {
                                const w = monster.node.worldPosition;
                                filtered.push(new Vec2(w.x, w.y));
                            }
                        }
                    }
                    if (filtered.length > 0) pool = filtered;
                    else pool = pool.filter(p => (isTopAttacker ? p.y < midlineY : p.y > midlineY));
                } else {
                    pool = pool.filter(p => (isTopAttacker ? p.y < midlineY : p.y > midlineY));
                }
            }
        }

        if (pool.length === 0) {
            return new Vec2(startPosition.x, startPosition.y + 300);
        }

        // 如果所有敌人都被选择过，重置选择状态
        if (this.usedEnemyIndices.size >= pool.length) {
            this.resetRandomSelection();
        }

        // 创建未被选择的敌人索引数组
        const availableIndices: number[] = [];
        for (let i = 0; i < pool.length; i++) {
            if (!this.usedEnemyIndices.has(i)) {
                availableIndices.push(i);
            }
        }

        // 从可用的敌人中随机选择一个
        if (availableIndices.length > 0) {
            const randomAvailableIndex = Math.floor(Math.random() * availableIndices.length);
            const selectedEnemyIndex = availableIndices[randomAvailableIndex];
            
            // 标记这个敌人已被选择
            this.usedEnemyIndices.add(selectedEnemyIndex);
            
            const selectedEnemy = pool[selectedEnemyIndex];
            
            return selectedEnemy;
        }

        // 如果没有可用的敌人（理论上不应该到这里），返回默认位置
        return new Vec2(startPosition.x, startPosition.y + 300);
    }

    /**
     * 批量随机选择多个不重复的敌人 - 用于多发子弹或技能
     * @param startPosition 起始位置
     * @param count 需要选择的敌人数量
     * @returns 随机敌人位置数组
     */
    public findMultipleRandomEnemies(startPosition: Vec2, count: number): Vec2[] {
        this.updateEnemyPool();

        const results: Vec2[] = [];
        const defaultPos = new Vec2(startPosition.x, startPosition.y + 300);

        // 如果没有敌人，返回默认位置数组
        if (this.randomEnemyPool.length === 0) {
            for (let i = 0; i < count; i++) {
                results.push(new Vec2(defaultPos.x + (i - count/2) * 100, defaultPos.y));
            }
            return results;
        }

        // 竞技场同侧过滤：仅在竞技场模式下启用
        const stageType = (game as any)?.myGlobal?.stageType;
        let pool = this.randomEnemyPool;
        if (stageType === StageType.Arena) {
            const midlineY = this.getArenaMidlineY();
            if (midlineY != null) {
                const isTopAttacker = startPosition.y > midlineY;
                const desiredLaneDir = isTopAttacker ? +1 : -1;
                const parent = this.node.parent;
                const enemycontainer = parent.getChildByName("game_objs");
                if (enemycontainer) {
                    const filtered: Vec2[] = [];
                    for (const child of enemycontainer.children) {
                        const monster = child.getComponent(Monster);
                        if (monster && monster.node && monster.node.active && !monster.isDead) {
                            const dir = (monster as any).laneDir;
                            if (typeof dir === 'number' && dir === desiredLaneDir) {
                                const w = monster.node.worldPosition;
                                filtered.push(new Vec2(w.x, w.y));
                            }
                        }
                    }
                    if (filtered.length > 0) pool = filtered;
                    else pool = pool.filter(p => (isTopAttacker ? p.y < midlineY : p.y > midlineY));
                } else {
                    pool = pool.filter(p => (isTopAttacker ? p.y < midlineY : p.y > midlineY));
                }
            }
        }

        // 如果需要的数量大于等于敌人总数，每个敌人选择一次，剩余用随机填充
        if (count >= pool.length) {
            // 先选择所有敌人
            for (let i = 0; i < pool.length; i++) {
                results.push(pool[i]);
            }
            
            // 剩余的数量用随机重复选择
            const remaining = count - pool.length;
            for (let i = 0; i < remaining; i++) {
                const randomIndex = Math.floor(Math.random() * pool.length);
                results.push(pool[randomIndex]);
            }
        } else {
            // 如果需要的数量小于敌人总数，使用洗牌算法选择不重复的敌人
            const shuffledIndices = [...Array(pool.length).keys()];
            
            // Fisher-Yates 洗牌算法
            for (let i = shuffledIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
            }
            
            // 选择前count个
            for (let i = 0; i < count; i++) {
                const selectedIndex = shuffledIndices[i];
                results.push(pool[selectedIndex]);
            }
        }

        return results;
    }

    /**
     * 通过透视映射计算目标点坐标
     * 实现透视梯形效果：出生点x（梯形底部）按比例映射到目标区域x（梯形顶部）
     * @param startX 起始点x坐标
     * @returns 目标点坐标
     */
    private calculatePerspectiveMappedTarget(startX: number): Vec2 {
        // 查找WallManager组件
        const wallManagerNode = find('Canvas/bg/bounce_rect');
        let wallManager: any = null;
        
        if (wallManagerNode) {
            wallManager = wallManagerNode.getComponent('WallManager');
        }
        
        if (!wallManager) {
            console.warn('[坦克石头-透视] 未找到WallManager，使用默认映射');
            // 默认映射关系：出生区域1200*0.75 -> 目标区域800
            const spawnRange = 1200 * 0.75; // 900
            const spawnCenter = 585;
            const spawnLeft = spawnCenter - spawnRange / 2;  // 135
            const spawnRight = spawnCenter + spawnRange / 2; // 1035
            
            const targetLeft = 200;
            const targetRight = 1000;
            const targetCenter = (targetLeft + targetRight) / 2; // 600
            
            // 计算映射比例
            const spawnRatio = (startX - spawnLeft) / (spawnRight - spawnLeft);
            const mappedX = targetLeft + spawnRatio * (targetRight - targetLeft);
            
            const defaultY = 1000; // 默认目标y
            return new Vec2(mappedX, defaultY);
        }

        // 获取stone_aim_rect的范围信息（梯形顶部）
        const rectInfo = wallManager.getStoneAimRectInfo();
        if (!rectInfo) {
            console.warn('[坦克石头-透视] 未获取到stone_aim_rect信息，使用默认映射');
            // 使用默认映射
            const spawnRange = 1200 * 0.75;
            const spawnCenter = 585;
            const spawnLeft = spawnCenter - spawnRange / 2;
            const spawnRight = spawnCenter + spawnRange / 2;
            
            const targetLeft = 200;
            const targetRight = 1000;
            
            const spawnRatio = (startX - spawnLeft) / (spawnRight - spawnLeft);
            const mappedX = targetLeft + spawnRatio * (targetRight - targetLeft);
            
            const defaultY = 1000;
            return new Vec2(mappedX, defaultY);
        }

        // === 透视梯形映射计算 ===
        
        // 梯形底部（出生区域）- 较大范围
        const screenWidth = 1200;
        const spawnRange = screenWidth * 0.75; // 900
        const spawnCenter = 585;
        const spawnLeft = spawnCenter - spawnRange / 2;  // 135
        const spawnRight = spawnCenter + spawnRange / 2; // 1035
        
        // 梯形顶部（目标区域）- stone_aim_rect
        const targetLeft = rectInfo.x;
        const targetRight = rectInfo.x + rectInfo.width;
        const targetCenterY = rectInfo.y + rectInfo.height / 2; // 目标y固定为中心点
        
        // 计算出生点在出生区域中的比例 (0-1)
        const spawnRatio = Math.max(0, Math.min(1, (startX - spawnLeft) / (spawnRight - spawnLeft)));
        
        // 按比例映射到目标区域x坐标
        const mappedTargetX = targetLeft + spawnRatio * (targetRight - targetLeft);
        
        return new Vec2(mappedTargetX, targetCenterY);
    }

    /**
     * 计算竞技场的中线Y坐标（根据英雄受击区域的最小与最大Y）
     */
    private getArenaMidlineY(): number | null {
        try {
            const panels = HerosManager.getInstance().getActiveHeroPanels();
            const ys = panels
                .filter((p: any) => p && p.attack_area && p.isOpen)
                .map((p: any) => p.attack_area.getWorldPosition().y);
            if (ys.length < 2) return null;
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            return (minY + maxY) / 2;
        } catch (e) {
            return null;
        }
    }

}
