import { _decorator, Component, Node, Vec2, Vec3, director, find } from 'cc';
import { Bullet } from './Bullet';
import { IBulletData } from '../types';
import { Monster } from '../enemy/monster';
import { MusicManager } from '../../music/MusicManager';

const { ccclass, property } = _decorator;

/**
 * 落雷处理类
 * 专门处理落雷类型的子弹逻辑
 */
@ccclass('LightningHandler')
export class LightningHandler {

    /**
     * 处理落雷类型的特殊逻辑
     * @param bullet 子弹实例
     */
    public static handleLightningLogic(bullet: Bullet): void {
        if (!bullet.isBulletType('assassin_lightning')) return;

        // 落雷特殊处理：禁用碰撞检测
        if (bullet.lqCollide) {
            bullet.lqCollide.enable = false;
        }

        // 延迟执行爆炸效果（给动画播放时间）
        bullet.scheduleOnce(() => {
            LightningHandler.triggerLightningStrike(bullet);
        }, 0.2); // 0.2秒后触发爆炸
    }

    /**
     * 触发落雷打击效果
     * @param bullet 子弹实例
     */
    private static triggerLightningStrike(bullet: Bullet): void {
        if (!bullet.isActive) return;

        // 播放落雷音效
        MusicManager.getInstance().playSound(MusicManager.SOUND_LIGHT);

        // 查找范围内的所有敌人并造成落雷伤害
        const explosionData = bullet.bulletData?.explosion;

        if (explosionData && explosionData.enabled) {
            // 使用父类的爆炸方法
            (bullet as any).applyExplosion(bullet.node);
        } else {
            console.warn(`[落雷] 爆炸效果未启用或数据为空`);

            // 手动查找附近敌人并造成伤害
            LightningHandler.manualLightningDamage(bullet);
        }

        // 爆炸完成后销毁
        bullet.scheduleOnce(() => {
            bullet.destroyBullet();
        }, 0.2);
    }

    /**
     * 手动处理落雷伤害（备用方案）
     * @param bullet 子弹实例
     */
    private static manualLightningDamage(bullet: Bullet): void {
        const lightningPos = bullet.node.worldPosition;
        const radius = 200; // 默认范围

        // 计算落雷伤害时包含暴击
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
            console.warn(`[落雷] 未找到敌人容器`);
            return;
        }

        let hitCount = 0;
        for (const child of enemyContainer.children) {
            const monster = child.getComponent(Monster);
            if (monster && !monster.isDead) {
                const enemyPos = child.worldPosition;
                const distance = Vec3.distance(lightningPos, enemyPos);

                if (distance <= radius) {
                    const hitPos = new Vec2(enemyPos.x, enemyPos.y);
                    monster.takeDamage(damage, isCritical, true, bullet.heroId, hitPos);

                    // 落雷特殊效果：眩晕
                    monster.applyStun(0.2);

                    hitCount++;
                }
            }
        }

        console.log(`[落雷] 命中 ${hitCount} 个敌人`);
    }

    /**
     * 处理落雷移动逻辑
     * @param bullet 子弹实例
     * @param dt 时间间隔
     */
    public static updateLightning(bullet: Bullet, dt: number): boolean {
        if (!bullet.isBulletType('assassin_lightning')) return false;

        // 落雷不移动，直接返回
        return true;
    }

    /**
     * 处理落雷碰撞，落雷不处理碰撞
     * @param bullet 子弹实例
     * @param selfCollide 自身碰撞器
     * @param other 其他碰撞器
     */
    public static handleLightningCollision(bullet: Bullet, selfCollide: any, other: any): boolean {
        if (bullet.isBulletType('assassin_lightning')) {
            return true; // 返回true表示已处理，不需要进一步处理
        }

        return false; // 返回false表示未处理，需要进一步处理
    }
} 