import { _decorator, Vec2, MotionStreak, game } from 'cc';
import { Bullet } from './Bullet';
import { BulletManager } from '../BulletManager';
import { Monster } from '../enemy/monster';
import { TimeManager } from '../TimeManager';
import { StageType } from '../stage/StageData';
import { HerosManager } from '../HerosManager';

const { ccclass } = _decorator;

/**
 * Arcane Missile Handler
 * Handles homing logic for arcane missile bullets ("arcane_missile").
 */
@ccclass('ArcaneMissileHandler')
export class ArcaneMissileHandler {
    /**
     * Special logic for arcane missile bullets
     * @param bullet Bullet instance
     */
    public static handleArcaneMissileLogic(bullet: Bullet): void {
        if (!bullet.isBulletType('aegwynn_basic_arrow')) return;
        // Optionally: set up initial target, etc.
        // No collision disables for arcane missile
    }

  
    public static updateArcaneMissile(bullet: Bullet, dt: number): boolean {
        if (!bullet.isBulletType('aegwynn_basic_arrow') || !bullet.isActive) return false;
        
        // Initialize missile state if not exists
        if (!(bullet as any)._arcaneMissileState) {
            (bullet as any)._arcaneMissileState = {
                hitIds: new Set<string>(),
                currentTargetId: null,
                lastBulletState: 'collide_end'
            };
        }

        const state = (bullet as any)._arcaneMissileState;
        const currentPos = new Vec2(bullet.node.worldPosition.x, bullet.node.worldPosition.y);
        
        // 使用TimeManager的scaledDt，确保时间控制一致
        const scaledDt = TimeManager.getInstance().getDeltaTime(dt);

        // 检查子弹状态变化 - 当进入碰撞状态时记录敌人
        if (bullet.bulletState !== state.lastBulletState) {
            state.lastBulletState = bullet.bulletState;
            
            if (bullet.bulletState === 'enter_collide') {
                // 找到最近的敌人并记录
                const parent = bullet.node.parent?.parent;
                const enemyContainer = parent?.getChildByName('game_objs');
                
                if (enemyContainer) {
                    let nearestEnemy: any = null;
                    let minDist = Number.MAX_VALUE;
                    let midlineY: number | null = null;
                    let isTopAttacker: boolean | null = null;
                    let desiredLaneDir: number | null = null;
                    if ((game as any)?.myGlobal?.stageType === StageType.Arena) {
                        try {
                            const panels = HerosManager.getInstance().getActiveHeroPanels();
                            const ys = panels.filter((p: any) => p && p.attack_area && p.isOpen).map((p: any) => p.attack_area.getWorldPosition().y);
                            if (ys.length >= 2) {
                                const minY = Math.min(...ys);
                                const maxY = Math.max(...ys);
                                midlineY = (minY + maxY) / 2;
                                isTopAttacker = currentPos.y > midlineY;
                                desiredLaneDir = isTopAttacker ? +1 : -1;
                            }
                        } catch {}
                    }
                    
                    for (const child of enemyContainer.children) {
                        const monster = child.getComponent(Monster) as Monster;
                        if (monster && !monster.isDead) {
                            const monsterPos = new Vec2(child.worldPosition.x, child.worldPosition.y);
                            if (desiredLaneDir != null) {
                                const dir = (monster as any).laneDir;
                                if (typeof dir === 'number') {
                                    if (dir !== desiredLaneDir) continue;
                                } else if (midlineY != null && isTopAttacker != null) {
                                    const isMonsterTop = monsterPos.y > midlineY;
                                    if (isTopAttacker === isMonsterTop) continue;
                                }
                            }
                            const dist = Vec2.distance(currentPos, monsterPos);
                            if (dist < minDist) {
                                minDist = dist;
                                nearestEnemy = child;
                            }
                        }
                    }
                    
                    if (nearestEnemy) {
                        const uniqueId = nearestEnemy.uuid;
                        state.hitIds.add(uniqueId);
                        // console.log(`[ArcaneMissile] 记录已命中敌人: ${uniqueId}, 距离: ${minDist.toFixed(1)}`);
                        
                        // 清除当前目标
                        if (state.currentTargetId === uniqueId) {
                            state.currentTargetId = null;
                        }
                    }
                }
            } else if (bullet.bulletState === 'collide_end') {
                // 碰撞结束后，立即寻找新目标
                state.currentTargetId = null;
                // 重置拖尾效果，确保新的追踪方向有干净的拖尾
                ArcaneMissileHandler.resetTrailEffect(bullet);
            }
        }
        
        // 如果没有当前目标，寻找新目标
        if (!state.currentTargetId) {
            const parent = bullet.node.parent?.parent;
            const enemyContainer = parent?.getChildByName('game_objs');
            
            if (enemyContainer) {
                let nearestEnemyPos: Vec2 | null = null;
                let nearestEnemyId: string | null = null;
                let minDist = Number.MAX_VALUE;
                let midlineY: number | null = null;
                let isTopAttacker: boolean | null = null;
                let desiredLaneDir: number | null = null;
                if ((game as any)?.myGlobal?.stageType === StageType.Arena) {
                    try {
                        const panels = HerosManager.getInstance().getActiveHeroPanels();
                        const ys = panels.filter((p: any) => p && p.attack_area && p.isOpen).map((p: any) => p.attack_area.getWorldPosition().y);
                        if (ys.length >= 2) {
                            const minY = Math.min(...ys);
                            const maxY = Math.max(...ys);
                            midlineY = (minY + maxY) / 2;
                            isTopAttacker = currentPos.y > midlineY;
                            desiredLaneDir = isTopAttacker ? +1 : -1;
                        }
                    } catch {}
                }
                
                for (const child of enemyContainer.children) {
                    const monster = child.getComponent(Monster) as Monster;
                    if (monster && !monster.isDead) {
                        const uniqueId = child.uuid;
                        if (!state.hitIds.has(uniqueId)) {
                            const monsterPos = new Vec2(child.worldPosition.x, child.worldPosition.y);
                            if (desiredLaneDir != null) {
                                const dir = (monster as any).laneDir;
                                if (typeof dir === 'number') {
                                    if (dir !== desiredLaneDir) continue;
                                } else if (midlineY != null && isTopAttacker != null) {
                                    const isMonsterTop = monsterPos.y > midlineY;
                                    if (isTopAttacker === isMonsterTop) continue;
                                }
                            }
                            const dist = Vec2.distance(currentPos, monsterPos);
                            if (dist < minDist) {
                                minDist = dist;
                                nearestEnemyPos = monsterPos;
                                nearestEnemyId = uniqueId;
                            }
                        }
                    }
                }
                
                if (nearestEnemyPos && nearestEnemyId) {
                    const toTarget = new Vec2(nearestEnemyPos.x - currentPos.x, nearestEnemyPos.y - currentPos.y);
                    toTarget.normalize();
                    
                    // 检查方向是否发生显著变化
                    const currentDir = (bullet as any).direction;
                    const angleChange = Math.abs(Math.atan2(toTarget.y, toTarget.x) - Math.atan2(currentDir.y, currentDir.x));
                    
                    // 每次目标切换都重置拖尾，确保拖尾与当前方向一致
                    if (angleChange > 0.1) { // 任何明显的方向变化
                        ArcaneMissileHandler.resetTrailEffect(bullet);
                    }
                    
                    (bullet as any).direction.set(toTarget);
                    state.currentTargetId = nearestEnemyId;
                    // console.log(`[ArcaneMissile] 切换目标到: ${nearestEnemyId}, 距离: ${minDist.toFixed(1)}, 已命中: ${state.hitIds.size}`);
                } else {
                    // console.log(`[ArcaneMissile] 所有敌人都已命中，飞出屏幕, 已命中: ${state.hitIds.size}`);
                }
            }
        }
        
        // 移动子弹
        const moveDistance = bullet.speed * scaledDt;
        (bullet as any).distance += moveDistance;
        
        if ((bullet as any).distance >= bullet.maxDistance) {
            bullet.destroyBullet();
            return true;
        }
        
        const moveVec = new Vec2((bullet as any).direction.x * moveDistance, (bullet as any).direction.y * moveDistance);
        const newPos = new Vec2(bullet.node.position.x + moveVec.x, bullet.node.position.y + moveVec.y);
        bullet.node.setPosition(newPos.x, newPos.y, 0);
        
        return true;
    }

    /**
     * 重置拖尾效果，避免方向改变时的错位
     */
    private static resetTrailEffect(bullet: Bullet): void {
       
    }
}