import { _decorator, Component, Node, Vec2, Vec3, director, find } from 'cc';
import { Bullet } from './Bullet';
import { IBulletData } from '../types';
import { Monster } from '../enemy/monster';
import { MusicManager } from '../../music/MusicManager';
import { BulletManager } from '../BulletManager';
import { TimeManager } from '../TimeManager';
import { EffectContainer } from '../EffectContainer';

const { ccclass, property } = _decorator;

/**
 * 炸弹处理类
 * 专门处理炸弹类型的子弹逻辑
 */
@ccclass('BombHandler')
export class BombHandler {

    /**
     * 处理炸弹类型的特殊逻辑
     * @param bullet 子弹实例
     */
    public static handleBombLogic(bullet: Bullet): void {
        if (!bullet.isBulletType('drboom_basic_bomb')) return;

        // 硬编码贝塞尔曲线参数
        const flightTime = 0.4; // 飞行时间0.4秒
        const arcHeight = 200; // 弧线高度200像素
        const waitTime = 0.8; // 等待爆炸时间0.8秒
        
        // 硬编码运动效果参数
        const motionEffect = 'none'; // 无运动效果
        const motionAmplitude = 0; // 运动幅度0像素
        const motionFrequency = 0; // 运动频率0弧度/秒

        // 贝塞尔运动参数 - 使用bullet.startPosition（因为此时bullet.node.worldPosition还是(0,0)）
        const startPos = new Vec3(
            bullet.startPosition.x,  // 手动应用偏移
            bullet.startPosition.y, 
            0
        );

        // 终点为目标点（targetPosition），如果没有则获取随机敌人位置
        let endPos: Vec3;
        
        // if (bullet.targetPosition) {
        //     endPos = new Vec3(bullet.targetPosition.x, bullet.targetPosition.y, 0);
        // } else {
            // 获取最近的敌人位置
            const bulletManager = BulletManager.instance;
            if (bulletManager) {
                const nearestTarget = bulletManager.findNearestEnemy(new Vec2(startPos.x, startPos.y+700));
                endPos = new Vec3(nearestTarget.x, nearestTarget.y, 0);
            } else {
                // fallback: 直线方向上移动一段距离
                const dir = ((bullet as any).direction || {x:1, y:0});
                endPos = startPos.add(new Vec3(dir.x, dir.y, 0).multiplyScalar(1000));
            }
        // }

        //目标点向下偏移100像素 途径
        endPos.y = endPos.y-100;
        //目标点x随机 100像素
        endPos.x = endPos.x + (Math.random() * 2 - 1) * 100;
        //y方向在随机 30像素
        endPos.y = endPos.y + (Math.random() * 2 - 1) * 40;

        // 控制点：起点和终点中点上方一定高度
        const mid = startPos.clone().lerp(endPos, 0.5);
        const controlPos = mid.add(new Vec3(0, arcHeight, 0)); // 使用配置的弧线高度

        // 记录到bullet实例
        (bullet as any)._bombBezier = {
            startPos, endPos, controlPos, totalTime: flightTime, elapsedTime: 0, arrived: false, waitTime, waitElapsed: 0,
            motionEffect, motionAmplitude, motionFrequency, motionTime: 0,
            // 弹跳相关参数 - 优化效果
            bounceCount: 0, maxBounces: 3, bounceHeight: 120, bounceTime: 0.25,
            // 缩放相关参数 - 基于子弹原始缩放值，优化效果
            originalScale: bullet.node.scale.clone(), 
            startScale: bullet.node.scale.x * 2.0, // 起手更大 - 2倍
            endScale: bullet.node.scale.x * 0.6    // 飞行中更小 - 0.6倍
        };
        

        
        // 禁用碰撞
        if (bullet.lqCollide) {
            bullet.lqCollide.enable = false;
        }
    }

    /**
     * 触发炸弹爆炸效果
     * @param bullet 子弹实例
     */
    private static triggerBombExplosion(bullet: Bullet): void {
        if (!bullet.isActive) return;

        // 播放爆炸音效
        MusicManager.getInstance().playSound(MusicManager.SOUND_BOOM_1);

        bullet.iconEffect.stopEffect();

        //播放爆炸效果
        const effectContainer = EffectContainer.getInstance();
        if (effectContainer) {
            effectContainer.playExplosionEffect(bullet.node.worldPosition);
        }

       
            // 使用父类的爆炸方法
        
       BombHandler.manualBombDamage(bullet);
        

        // 爆炸完成后销毁
        bullet.scheduleOnce(() => {
            bullet.destroyBullet();
        }, 0.2);
    }

    /**
     * 手动处理炸弹伤害（备用方案）
     * @param bullet 子弹实例
     */
    private static manualBombDamage(bullet: Bullet): void {
        const bombPos = bullet.node.worldPosition;
        const radius = 200; // 默认爆炸范围

        // 计算炸弹伤害时包含暴击
        const heroCritRate = bullet.bulletData?.heroCritRate || 0;
        const heroCritDamage = bullet.bulletData?.heroCritDamage || 1.5;
        const isCritical = Math.random() < heroCritRate;

        const heroAttack = bullet.bulletData?.heroAttack || 0;
        const baseDamage = bullet.damage + heroAttack;
        const damage = isCritical ? Math.floor(baseDamage * heroCritDamage) : baseDamage;

        // 查找场景中所有的Monster组件
        const parent = bullet.node.parent?.parent;
        const enemyContainer = parent?.getChildByName("game_objs");

        if (!enemyContainer) {
            return;
        }

        let hitCount = 0;
        for (const child of enemyContainer.children) {
            const monster = child.getComponent(Monster);
            if (monster && !monster.isDead) {
                const enemyPos = child.worldPosition;
                const distance = Vec3.distance(bombPos, enemyPos);

                if (distance <= radius) {
                    // 计算碰撞点：子弹位置和怪物位置的中点，加上随机偏移
                    const bulletPos = bullet.node.getPosition();
                    const monsterNodePos = child.getPosition();
                    const hitPos = new Vec2(
                        (bulletPos.x + monsterNodePos.x) / 2 + (Math.random() * 2 - 1) * 10,
                        (bulletPos.y + monsterNodePos.y) / 2 + (Math.random() * 2 - 1) * 10
                    );
                    monster.takeDamage(damage, isCritical, true, bullet.heroId, hitPos);
                    hitCount++;
                    //计算从炸弹到怪物的方向向量，设置击退100码
                    const monsterPos2D = new Vec2(enemyPos.x, enemyPos.y);
                    const knockbackDir = new Vec2();
                    Vec2.subtract(knockbackDir, monsterPos2D, new Vec2(bombPos.x, bombPos.y));
                    monster.setKnockback(100, knockbackDir);
                }
            }
        }


    }

    /**
     * 处理炸弹贝塞尔运动和爆炸等待
     * @param bullet 子弹实例
     * @param dt 时间间隔
     */
    public static updateBomb(bullet: Bullet, scaledDt: number): boolean {
        if (!bullet.isBulletType('drboom_basic_bomb')) return false;
        if (!bullet.isActive) return false;
         // 使用TimeManager的scaledDt，确保时间控制一致
         const dt = TimeManager.getInstance().getDeltaTime(scaledDt);

        const bezier = (bullet as any)._bombBezier;
        if (!bezier) return false;

        if (!bezier.arrived) {
            // 贝塞尔插值
            bezier.elapsedTime += dt;
            let t = Math.min(bezier.elapsedTime / bezier.totalTime, 1);
            
            // 使用极速开始的缓动函数
            t = BombHandler.easeOutCubic(t);
            
                          // 二次贝塞尔公式
              const p0 = bezier.startPos.clone();
              const p1 = bezier.controlPos;
              const p2 = bezier.endPos;
              
              
                          let pos = new Vec3(
                  (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
                  (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y,
                  0
              );
              
              
            
                          // 运动效果已移除
            
            // 更新缩放效果：从大到小，基于原始缩放值
            const scaleProgress = t;
            const currentScale = bezier.startScale + (bezier.endScale - bezier.startScale) * scaleProgress;
            bullet.node.setScale(currentScale, currentScale, bullet.node.scale.z);
            
            bullet.node.setWorldPosition(pos);
                           if (t >= 1) {
                   bezier.arrived = true;
                   bezier.waitElapsed = 0;
                   // 跳过弹跳，直接等待爆炸
                   bezier.bounceCount = bezier.maxBounces;
               }
            return true;
        } else {
            // 到达终点，执行弹跳效果
            if (bezier.bounceCount < bezier.maxBounces) {
                const bounceProgress = (bezier.elapsedTime - bezier.bounceStartTime) / bezier.bounceTime;
                if (bounceProgress <= 1) {
                    // 弹跳动画
                    const bounceT = BombHandler.easeOutQuad(bounceProgress);
                    const bounceHeight = bezier.bounceHeight * (1 - bezier.bounceCount * 0.3); // 每次弹跳高度递减
                    const bounceY = bezier.endPos.y + Math.sin(bounceProgress * Math.PI) * bounceHeight;
                    const bounceX = bezier.endPos.x + (bezier.bounceCount * 20); // 轻微水平移动
                    
                    bullet.node.setWorldPosition(bounceX, bounceY, 0);
                    
                    // 弹跳时的缩放效果，基于原始缩放值
                    const bounceScale = bezier.endScale + Math.sin(bounceProgress * Math.PI) * (bezier.originalScale.x * 0.2);
                    bullet.node.setScale(bounceScale, bounceScale, bullet.node.scale.z);
                } else {
                    // 弹跳结束，开始下一次弹跳或等待爆炸
                    bezier.bounceCount++;
                    bezier.bounceStartTime = bezier.elapsedTime;
                }
                return true;
            } else {
                // 弹跳完成，等待爆炸
                bezier.waitElapsed += dt;
                

                
                // 爆炸前的脉冲缩放效果 - 大小大小大小
                const explosionProgress = Math.min(bezier.waitElapsed / bezier.waitTime, 1);
                if (explosionProgress > 0.5) { // 最后50%时间开始脉冲缩放
                    const pulseTime = (explosionProgress - 0.5) * 15; // 更快的脉冲频率
                    const pulseScale = Math.sin(pulseTime * Math.PI * 2) * 0.8 + 1; // 0.2-1.8倍的脉冲，更明显
                    const finalScale = bezier.endScale * pulseScale;
                    bullet.node.setScale(finalScale, finalScale, bullet.node.scale.z);
                }
                
                if (bezier.waitElapsed >= bezier.waitTime) {
                    BombHandler.triggerBombExplosion(bullet);
                    // 防止多次爆炸
                    bezier.waitElapsed = -9999;
                }
                return true;
            }
        }
    }

    /**
     * 缓动函数 - 让贝塞尔曲线更丝滑
     * @param t 时间参数 (0-1)
     * @returns 缓动后的时间参数
     */
    private static easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    /**
     * 缓动函数 - 先快后慢（急速开始，逐渐减速）
     * @param t 时间参数 (0-1)
     * @returns 缓动后的时间参数
     */
    private static easeOutQuad(t: number): number {
        // 更强的先快后慢效果：开始很快，结束很慢
        return 1 - (1 - t) * (1 - t);
    }

    /**
     * 缓动函数 - 极速开始（更快的起手速度）
     * @param t 时间参数 (0-1)
     * @returns 缓动后的时间参数
     */
    private static easeOutCubic(t: number): number {
        // 三次方缓动，开始更快
        return 1 - (1 - t) * (1 - t) * (1 - t);
    }

    /**
     * 计算运动效果偏移
     * @param effectType 运动效果类型
     * @param time 当前时间
     * @param amplitude 运动幅度
     * @param frequency 运动频率
     * @param t 贝塞尔参数 (0-1)
     * @returns 运动偏移向量
     */
    private static calculateMotionOffset(
        effectType: string, 
        time: number, 
        amplitude: number, 
        frequency: number,
        t: number
    ): Vec3 {
        switch (effectType) {
            case 'wave':
                // 波浪运动：垂直于飞行方向的波浪
                const waveOffset = Math.sin(time * frequency) * amplitude * (1 - t * 0.5);
                return new Vec3(0, waveOffset, 0);
                
            case 'bounce':
                // 弹跳运动：垂直方向的弹跳
                const bounceOffset = Math.abs(Math.sin(time * frequency)) * amplitude * (1 - t * 0.7);
                return new Vec3(0, bounceOffset, 0);
                
            case 'zigzag':
                // 之字形运动：水平方向的之字形
                const zigzagOffset = Math.sin(time * frequency * 2) * amplitude * (1 - t * 0.6);
                return new Vec3(zigzagOffset, 0, 0);
                
            default:
                return new Vec3(0, 0, 0);
        }
    }

    /**
     * 处理炸弹碰撞，炸弹不处理碰撞
     * @param bullet 子弹实例
     * @param selfCollide 自身碰撞器
     * @param other 其他碰撞器
     */
    public static handleBombCollision(bullet: Bullet, selfCollide: any, other: any): boolean {
        if (bullet.isBulletType('drboom_basic_bomb')) {
            return true; // 返回true表示已处理，不需要进一步处理
        }
        return false; // 返回false表示未处理，需要进一步处理
    }
} 