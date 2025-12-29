import { _decorator,Animation,game, Component, Node, Size,Vec2, Sprite, SpriteFrame, resources, SpriteAtlas, UITransform, PhysicsGroup, Vec3, tween, director, find, Color } from 'cc';
import { Custom2D_Collide } from '../../Custom_Collide/Custom2D_Collide';
import { Monster } from '../enemy/monster';
import { TimeManager } from '../TimeManager';
import { IBulletData } from '../types';
import { IconEffect } from '../../utils/IconEffect';
import { HerosManager } from '../HerosManager';
import { Prefab ,instantiate} from 'cc';
import { MotionStreak } from 'cc';
import { PerspectiveScaler } from '../../utils/PerspectiveScaler';
import { BulletManager } from '../BulletManager';
import { MusicManager } from '../../music/MusicManager';
import { BombHandler } from './BombHandler';
import { LightningHandler } from './LightningHandler';
import { ArcaneMissileHandler } from './ArcaneMissileHandler';
import { StageType } from '../stage/StageData';

const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    @property(Sprite)
    public sprite: Sprite | null = null;  // 子弹精灵组件

    @property(SpriteAtlas)
    public bulletAtlas: SpriteAtlas | null = null;

    @property(SpriteAtlas)
    public bulletAtlas_1: SpriteAtlas | null = null;

    @property(IconEffect)
    public iconEffect: IconEffect | null = null;

    @property(Prefab)
    public trailPrefabs: Prefab[] = []; // 拖尾预制体列表，自动使用预制体名称作为映射

    @property(PerspectiveScaler)
    public perspectiveScaler: PerspectiveScaler | null = null; // 透视缩放组件

    lqCollide: Custom2D_Collide = null;

    public spriteFrameName: string = '';
    public heroId: string = '';          // 【新增】发射角色的ID
    
    // 子弹数据（包含所有增强效果）
    public bulletData: IBulletData | null = null;
    
    // 运行时穿透计数器
    public remainingPierceCount: number = 0;  // 剩余穿透次数
    public remainingBounceCount: number = 0;  // 剩余反弹次数


    // 子弹状态 进入碰撞， 正在碰撞， 碰撞结束， 
    public bulletState: 'enter_collide' | 'collide' | 'collide_end'  = 'collide_end';
    
    start() {
        // 此处的逻辑已移至 bindCollide 和 updateSpriteFrame 中，以确保在正确的时间点执行
    }

    // 子弹属性
    public damage: number = 0;        // 伤害值
    public speed: number = 0;         // 移动速度
    public startPosition: Vec2 = new Vec2();  // 出生点
    public targetPosition: Vec2 = new Vec2(); // 目标点
    public isActive: boolean = false;  // 是否激活

    // 移动相关
    protected direction: Vec2 = new Vec2();  // 移动方向
    protected distance: number = 0;          // 已移动距离
    public maxDistance: number = 4000;    // 最大射程

    public init(startPosition: Vec2, targetPosition: Vec2, damage: number, speed: number, spriteFrameName: string) {
        this.startPosition.set(startPosition);
        this.targetPosition.set(targetPosition);
        this.damage = damage;
        this.speed = speed;
        this.isActive = true;
        this.distance = 0;
        this.spriteFrameName = spriteFrameName;
        this.remainingPierceCount = 0; // 默认无穿透
        this.remainingBounceCount = 0; // 默认无反弹
       
        // 计算移动方向
        Vec2.subtract(this.direction, this.targetPosition, this.startPosition);
        this.direction.normalize();
        this.updateSpriteFrame();
    }

    /**
     * 使用预计算的方向向量初始化子弹（用于确保完全平行的轨迹）
     */
    public initWithDirection(startPosition: Vec2, direction: Vec2, damage: number, speed: number, spriteFrameName: string) {
        this.startPosition.set(startPosition);
        this.damage = damage;
        this.speed = speed;
        this.isActive = true;
        this.distance = 0;
        this.spriteFrameName = spriteFrameName;
        this.remainingPierceCount = 0; // 默认无穿透
        this.remainingBounceCount = 0; // 默认无反弹
       
        // 使用传入的方向向量
        this.direction.set(direction);
        
        // 计算目标位置（可选，用于显示或调试）
        this.targetPosition.set(
            this.startPosition.x + this.direction.x * 1000,
            this.startPosition.y + this.direction.y * 1000
        );
        
        this.updateSpriteFrame();
    }

    /**
     * 使用完整的IBulletData初始化子弹（支持所有增强效果）
     */
    public initWithBulletData(startPosition: Vec2, direction: Vec2, bulletData: IBulletData): void {
        this.bulletData = bulletData;
        this.startPosition.set(startPosition);
        this.damage = bulletData.damage;
        this.speed = bulletData.speed;
        this.isActive = true;
        this.distance = 0;
        this.spriteFrameName = bulletData.spriteFrameName;
        this.maxDistance = bulletData.maxDistance || 4000;
        this.heroId = bulletData.heroId || '';  // 设置发射英雄ID
       
        // 使用传入的方向向量
        this.direction.set(direction);
        
        // 对于炸弹类型，不在这里设置targetPosition，让BombHandler来处理
        // 对于其他子弹，计算目标位置（可选，用于显示或调试）
        if (!this.isBulletType('drboom_basic_bomb')) {
            this.targetPosition.set(
                this.startPosition.x + this.direction.x * 1000,
                this.startPosition.y + this.direction.y * 1000
            );
        }
        
        this.updateSpriteFrame();
        
        // 应用缩放
        if (bulletData.scale !== undefined) {
            // 表现层处理：确保缩放值不小于一个最小值（例如0.1），避免因负值导致的反向放大
            const finalScale = Math.max(bulletData.scale as number, 0.1);
            // console.log(`[Bullet Debug] Original scale: ${bulletData.scale}, Final applied scale: ${finalScale}`);
            this.node.setScale(finalScale, finalScale);
        }

        // 初始化穿透次数
        if (bulletData.pierce) {
            this.remainingPierceCount = bulletData.pierce;
        }
        
        // 初始化反弹次数
        if (bulletData.bounce) {
            this.remainingBounceCount = bulletData.bounce;
        }
        
        // 初始化透视缩放效果（特殊处理坦克石头）
        this.initializePerspectiveScaling(bulletData);

        // 让辅助类处理特殊子弹的初始化逻辑
        BombHandler.handleBombLogic(this);
        LightningHandler.handleLightningLogic(this);
        ArcaneMissileHandler.handleArcaneMissileLogic(this);
    }

    /**
     * 特殊初始化：落雷效果
     * 直接在目标位置播放动画，然后执行爆炸效果
     */
    public initAsLightningStrike(targetPosition: Vec2, bulletData: IBulletData): void {
        this.bulletData = bulletData;
        this.damage = bulletData.damage;
        this.speed = 0; // 落雷不移动
        this.isActive = true;
        this.distance = 0;
        this.spriteFrameName = bulletData.spriteFrameName;
        this.heroId = bulletData.heroId || '';
        
        // 设置起始位置和目标位置都为目标点
        this.startPosition.set(targetPosition);
        this.targetPosition.set(targetPosition);
        this.direction.set(0, 0); // 不移动
        
        this.updateSpriteFrame();
        
        // 应用缩放
        if (bulletData.scale !== undefined) {
            const finalScale = Math.max(bulletData.scale as number, 0.1);
            this.node.setScale(finalScale, finalScale);
        }
        
        // 禁用物理碰撞检测（落雷不需要碰撞触发）
        if (this.lqCollide) {
            this.lqCollide.enable = false;
        }
        
        // 延迟执行爆炸效果（给动画播放时间）
        this.scheduleOnce(() => {
            this.triggerLightningStrike();
        }, 0.2); // 0.3秒后触发爆炸
    }

    /**
     * 触发落雷打击效果
     */
    private triggerLightningStrike(): void {
        if (!this.isActive) return;
        
        
        // 查找范围内的所有敌人并造成爆炸伤害
        const explosionData = this.bulletData?.explosion;
        
        if (explosionData && explosionData.enabled) {
            this.applyExplosion(this.node);
        } else {
            console.warn(`[落雷] 爆炸效果未启用或数据为空`);
            
            // 手动查找附近敌人并造成伤害
            this.manualLightningDamage();
        }
        
        // 落雷完成后销毁
        this.scheduleOnce(() => {
            this.destroyBullet();
        }, 0.2);
    }
    
    /**
     * 手动处理落雷伤害（备用方案）
     */
    private manualLightningDamage(): void {
        const lightningPos = this.node.worldPosition;
        const radius = 200; // 默认范围
        
        // 【修复】计算落雷伤害时包含暴击
        const heroCritRate = this.bulletData?.heroCritRate || 0;
        const heroCritDamage = this.bulletData?.heroCritDamage || 1.5;
        const isCritical = Math.random() < heroCritRate;
        
        const heroAttack = this.bulletData?.heroAttack || 0;
        const baseDamage = this.damage + heroAttack;
        const damage = isCritical ? Math.floor(baseDamage * heroCritDamage) : baseDamage;
        
        
        // 查找场景中所有的Monster组件
        const parent = this.node.parent?.parent;
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
                    monster.takeDamage(damage, isCritical, true, this.heroId, hitPos);
                    hitCount++;
                }
            }
        }
        
    }

    bindCollide(size: Size) {
        if (!this.lqCollide) {
            this.lqCollide = this.node.getComponent(Custom2D_Collide);
        }
        
        if (this.lqCollide) {
            this.lqCollide.group = 2 as any; // hero_bullets 组
            this.lqCollide.enable = true;
            
            this.lqCollide.size=size
            
            // 绑定回调函数
            this.lqCollide.onCollide = this.onCollide.bind(this);
            this.lqCollide.onEnter = this.onEnter.bind(this);
            this.lqCollide.onExit = this.onExit.bind(this);
        } else {
            console.warn('未找到 Custom2D_Collide 组件');
        }
    }
    onCollide(collide: Custom2D_Collide) {
        // 子弹持续碰撞处理
        this.bulletState = 'collide';
    }
    
    onEnter(selfCollide: Custom2D_Collide, other: Custom2D_Collide) {
        // 让辅助类处理特殊子弹的碰撞逻辑
        const bombHandled = BombHandler.handleBombCollision(this, selfCollide, other);
        if (bombHandled) return;
        
        const lightningHandled = LightningHandler.handleLightningCollision(this, selfCollide, other);
        if (lightningHandled) return;


        // 子弹开始碰撞处理
        this.handleHit(other);
        this.bulletState = 'enter_collide';


    }

    onExit(selfCollide: Custom2D_Collide, other: Custom2D_Collide) {
        // 子弹结束碰撞处理
        let isEmpty = selfCollide.collidingColliders.length === 0;
        if (isEmpty) {
            // 子弹已脱离所有碰撞体
        }

        this.bulletState = 'collide_end';
    }
    
    /**
     * 新增：处理反弹逻辑
     * @param hitVertical 是否撞到垂直墙面
     * @param hitHorizontal 是否撞到水平墙面
     * @param isFirstBounce 是否为第一次反弹，如果是，则增加随机角度
     */
    public bounce(hitVertical: boolean, hitHorizontal: boolean, isFirstBounce: boolean = false): void {
        if (hitVertical) {
            this.direction.x *= -1;
        }
        if (hitHorizontal) {
            this.direction.y *= -1;
        }

        // 如果是第一次反弹，增加一个随机的角度偏移
        if (isFirstBounce) {
            // 最大偏移角度（例如：15度）
            const maxOffsetAngle = 15 * (Math.PI / 180); 
            // -15度到+15度之间的随机偏移
            const randomOffset = (Math.random() - 0.5) * 2 * maxOffsetAngle;

            // 将偏移应用到当前方向
            const currentAngle = Math.atan2(this.direction.y, this.direction.x);
            const newAngle = currentAngle + randomOffset;
            
            this.direction.x = Math.cos(newAngle);
            this.direction.y = Math.sin(newAngle);
        }
    }

    /**
     * 处理碰撞命中逻辑（增强版，支持各种特效）
     */
    private handleHit(otherCollide: Custom2D_Collide) {
        if (!this.isActive) return;
        
        const targetNode = otherCollide.node;
        if (!targetNode) return;
        
        const monster = targetNode.getComponent(Monster);
        if (monster && !monster.isDead) {
            let ignore = false;
            const stageType = (game as any)?.myGlobal?.stageType;
            if (stageType === StageType.Arena && this.heroId) {
                let midlineY: number | null = null;
                let heroIsTop: boolean | null = null;
                try {
                    const panels = HerosManager.getInstance().getActiveHeroPanels();
                    const ys = panels.filter((p: any) => p && p.attack_area && p.isOpen).map((p: any) => p.attack_area.getWorldPosition().y);
                    if (ys.length >= 2) {
                        const minY = Math.min(...ys);
                        const maxY = Math.max(...ys);
                        midlineY = (minY + maxY) / 2;
                        const heroPanel = panels.find((p: any) => p && p.hero && p.hero.id === this.heroId);
                        if (heroPanel) {
                            const hy = heroPanel.attack_area ? heroPanel.attack_area.getWorldPosition().y : heroPanel.node.getWorldPosition().y;
                            heroIsTop = hy > midlineY;
                        }
                    }
                } catch {}

                if (heroIsTop != null) {
                    const mLaneDir = (monster as any).laneDir;
                    if (typeof mLaneDir === 'number') {
                        const monsterIsTopSpawn = mLaneDir < 0;
                        const monsterIsBottomSpawn = mLaneDir > 0;
                        if ((heroIsTop && monsterIsTopSpawn) || (!heroIsTop && monsterIsBottomSpawn)) {
                            ignore = true;
                        }
                    } else if (midlineY != null) {
                        const mY = targetNode.worldPosition.y;
                        const isMonsterTop = mY > midlineY;
                        if ((heroIsTop && isMonsterTop) || (!heroIsTop && !isMonsterTop)) {
                            ignore = true;
                        }
                    }
                }
            }

            if (ignore) {
                return;
            }
            this.applyDamageAndEffects(monster, targetNode);
        }
        
        if (this.shouldDestroyOnHit()) {
            this.destroyBullet();
        }
    }

    /**
     * 应用伤害和各种特效
     */
    private applyDamageAndEffects(monster: Monster, targetNode: Node): void {
        // 【修复】使用子弹的暴击属性（英雄基础属性 + 子弹修改器）
        const heroCritRate = this.bulletData?.heroCritRate || 0;
        const heroCritDamage = this.bulletData?.heroCritDamage || 1.5;
        const isCritical = Math.random() < heroCritRate;
        
        const heroAttack = this.bulletData?.heroAttack || 0;
        const bulletBaseDamage = this.damage;
        const totalDamage = heroAttack + bulletBaseDamage;
        const finalDamage = isCritical ? Math.floor(totalDamage * heroCritDamage) : totalDamage;

        // 应用元素效果
        if (this.bulletData?.element) {
            this.applyElementalEffect(monster, this.bulletData.element);
        }

        // 计算碰撞点
        const bulletPos = this.node.getPosition();
        const monsterPos = targetNode.getPosition();
        const hitPos = new Vec2(
            (bulletPos.x + monsterPos.x) / 2 + (Math.random() * 2 - 1) * 10,
            (bulletPos.y + monsterPos.y) / 2 + (Math.random() * 2 - 1) * 10
        );

        // 对怪物造成伤害
        monster.takeDamage(finalDamage, isCritical, true, this.heroId, hitPos);

        // 应用击退效果
        this.applyKnockback(monster, targetNode);

        // 应用眩晕效果
        this.applyStun(monster);

        // 新增：应用缠绕效果
        this.applyEntangle(monster);
        
        // 如果有爆炸效果，则触发爆炸并取消穿透
        this.applyExplosion(monster.node);
    }

    /**
     * 应用元素效果
     */
    private applyElementalEffect(monster: Monster, element: any): void {
        if (!element) {
            return;
        }

        const elementsToApply = Array.isArray(element) ? element : [element];

        for (const el of elementsToApply) {
            if (!el || Math.random() > (el.chance || 1)) {
                continue;
            }

            switch (el.type) {
                case 'fire':
                case 'poison':
                    monster.applyDot({
                        type: el.type,
                        damage: el.damage_per_tick || 0,
                        duration: el.duration || 3,
                        interval: el.interval || 1,
                        heroId: this.heroId, // 【修复】添加heroId以正确统计DOT伤害
                    });
                    break;
                case 'ice':
                    monster.applySlow(el.slow_percent || 30, el.duration || 2);
                    break;
                case 'dark':
                    this.applyLifesteal(el.heal_percent || 0);
                    break;
            }
        }
    }

    /**
     * 应用击退效果
     */
    private applyKnockback(monster: Monster, targetNode: Node): void {
        if (!this.bulletData?.knockback) return;

        const knockbackData = this.bulletData.knockback;
        // 使用类型断言来处理概率, 并用 ?? 1.0 修复 chance: 0 的bug
        const chance = (knockbackData.chance as number) ?? 1.0; 
        
        if (Math.random() < chance) {
            const force = (knockbackData.force as number) || 0;
            
            if (force > 0) {
                // 计算从子弹到怪物的方向
                const monsterPos = new Vec2(targetNode.worldPosition.x, targetNode.worldPosition.y);
                const bulletPos = new Vec2(this.node.worldPosition.x, this.node.worldPosition.y);
                const direction = monsterPos.subtract(bulletPos).normalize();
                
                // 调用新的 setKnockback 方法
                monster.setKnockback(force, direction);
            }
        }
    }

    /**
     * 应用眩晕效果
     */
    private applyStun(monster: Monster): void {
        if (!this.bulletData?.stun) return;
    
        const stunData = this.bulletData.stun;
        // 使用类型断言来处理概率, 并用 ?? 1 修复 chance: 0 的bug
        const chance = (stunData.chance as number) ?? 1;
        
        if (Math.random() < chance) {
            monster.applyStun((stunData.duration as number) ?? 1);
        }
    }

    /**
     * 新增：应用缠绕效果
     */
    private applyEntangle(monster: Monster): void {
        if (!this.bulletData?.entangle) return;
    
        const entangleData = this.bulletData.entangle;
        // 使用类型断言来处理概率, 并用 ?? 1 修复 chance: 0 的bug
        const chance = (entangleData.chance as number) ?? 1;
    
        if (Math.random() < chance) {
            monster.applyEntangle((entangleData.duration as number) ?? 1);
        }
    }

    /**
     * 应用生命偷取
     */
    private applyLifesteal(healPercent: number): void {
        if (!this.heroId || healPercent <= 0) return;
        const heroAttack = this.bulletData?.heroAttack || 0;
        const bulletBaseDamage = this.damage;
        const totalDamage = heroAttack + bulletBaseDamage;
        const healAmount = totalDamage * (healPercent / 100);
        if (healAmount > 0) {
            const heroToHeal = HerosManager.getInstance().getActiveHeroes().find(h => h.id === this.heroId);
            if (heroToHeal) {
                heroToHeal.hp = Math.min(heroToHeal.maxhp, heroToHeal.hp + healAmount);
                director.emit(game.gameEvent.GAME_HEAL_EFFECT, { target: heroToHeal, healAmount: healAmount });
            }
        }
    }

    /**
     * 应用爆炸效果（如果存在），并移除所有剩余的穿透次数
     * @param explosionCenterNode 爆炸中心
     */
    private applyExplosion(explosionCenterNode: Node): void {
        if (!this.bulletData?.explosion?.enabled) {
            return;
        }

        const explosionRadius = this.bulletData.explosion.radius || 0;
        const explosionDamage = this.bulletData.explosion.damage || 0;

        // 获取爆炸中心位置
        const explosionCenterPosition = explosionCenterNode.worldPosition.clone();

        explosionCenterPosition.set(explosionCenterPosition.x,explosionCenterPosition.y-100)
        // 查找敌人容器（修复路径查找问题）
        // const canvas = explosionCenterNode.parent?.parent?.parent; // bullet_manager -> bg -> Canvas
        // const gameObjs = canvas?.getChildByName('bg')?.getChildByName('game_objs');
        
        // 使用更安全的路径查找方法
        let gameObjs: Node | null = null;
        
        // 尝试通过父节点路径查找
        let currentNode = explosionCenterNode;
        while (currentNode && !gameObjs) {
            if (currentNode.name === 'bullet_manager') {
                // 从bullet_manager开始，查找Canvas/bg/game_objs
                const bg = currentNode.parent?.getChildByName('bg');
                if (bg) {
                    gameObjs = bg.getChildByName('game_objs');
                }
                break;
            }
            currentNode = currentNode.parent;
        }
        
        // 如果还没找到，使用全局搜索
        if (!gameObjs) {
            const canvas = director.getScene()?.getChildByName('Canvas');
            const bg = canvas?.getChildByName('bg');
            gameObjs = bg?.getChildByName('game_objs');
        }

        if (!gameObjs) {
            console.warn(`[爆炸] 找不到game_objs容器，无法处理爆炸效果`);
            return;
        }


        // 获取范围内的所有敌人
        const enemies = gameObjs.children.filter(child => {
            const monster = child.getComponent(Monster);
            return monster && !monster.isDead;
        });


        let hitCount = 0;
        
        for (const enemyNode of enemies) {
            const monster = enemyNode.getComponent(Monster);
            if (monster && !monster.isDead) {
                const enemyPos = enemyNode.worldPosition;
                const distance = Vec3.distance(explosionCenterPosition, enemyPos);
                
                
                if (distance <= explosionRadius) {
                    const hitPos = new Vec2(enemyNode.position.x, enemyNode.position.y);
                    
                    // 【修复】计算最终伤害（包含技能修改器和暴击）
                    const heroCritRate = this.bulletData?.heroCritRate || 0;
                    const heroCritDamage = this.bulletData?.heroCritDamage || 1.5;
                    const isCritical = Math.random() < heroCritRate;
                    
                    const heroAttack = this.bulletData?.heroAttack || 0;
                    const bulletBaseDamage = this.damage || 0; // 获取子弹的基础伤害（已包含技能修改器）
                    const baseTotalDamage = explosionDamage + heroAttack + bulletBaseDamage;
                    const totalDamage = isCritical ? Math.floor(baseTotalDamage * heroCritDamage) : baseTotalDamage;
                    
                    // 造成爆炸伤害
                    monster.takeDamage(totalDamage, isCritical, true, this.heroId, hitPos);
                    hitCount++;
                    // console.log("this.bulletData?.id",this.bulletData?.id);
                    //判断子弹id 是否是 药剂师 的 毒药瓶 (支持增强版本匹配)
                    if(this.isBulletType('potioner_basic_bottle')){
                        // 附加中毒DOT
                        monster.applyDot({
                            type: 'poison',
                            damage: 3, // 每跳伤害为怪物最大生命值的3%
                            duration: 3, // 持续3秒
                            interval: 0.3,   // 每秒1跳
                            heroId: this.heroId // 【修复】添加heroId以正确统计DOT伤害
                        });

                    }else if(this.isBulletType('ice_mage_basic_orb')){
                       
                         // 2. 减速效果 (50%减速，持续1秒)
                        monster.applySlow(50, 6);


                    }else{
                       
                         // 附加燃烧DOT
                         monster.applyDot({
                            type: 'fire',
                            damage: 3, // 每跳伤害为怪物最大生命值的3%
                            duration: 3, // 持续3秒
                            interval: 0.3,   // 每秒1跳
                            heroId: this.heroId // 【修复】添加heroId以正确统计DOT伤害
                        });

                    }
                    


                    
                    
                    // 附加落雷特效：先眩晕再减速
                    // 1. 眩晕效果 (0.3秒)
                    monster.applyStun(0.2);
                    
                   
                }
            }
        }
        
    }

        /**
     * 判断是否应该在命中时销毁子弹
     */
    private shouldDestroyOnHit(): boolean {
        // 检查穿透效果
        if (this.bulletData?.pierce && this.remainingPierceCount > 0) {
            this.remainingPierceCount--;
            return false;
        }

        // 检查弹跳效果
        if (this.bulletData?.bounce) {
            return false;
        }

        return true;
    }
    
    /**
     * 销毁子弹
     */
    public destroyBullet() {
        if (!this.isActive) return;
        this.isActive = false;
        
        if (this.lqCollide) {
            this.lqCollide.enable = false;
        }
        
        this.node.destroy();
    }

    /**
     * 判断子弹是否为指定的基础类型
     * 支持带有时间戳等后缀的增强版本匹配
     * @param baseBulletId 基础子弹ID
     * @returns 是否匹配
     */
    public isBulletType(baseBulletId: string): boolean {
        return this.bulletData?.id?.startsWith(baseBulletId) || false;
    }
    
    protected update(dt: number): void {
        if (!this.isActive) return;

        // 让辅助类处理特殊子弹的移动逻辑
        const bombHandled = BombHandler.updateBomb(this, dt);
        if (bombHandled) return;
        
        const lightningHandled = LightningHandler.updateLightning(this, dt);
        if (lightningHandled) return;

        const arcaneHandled = ArcaneMissileHandler.updateArcaneMissile(this, dt);
        if (arcaneHandled) return;

        // 默认移动逻辑
        const scaledDt = TimeManager.getInstance().getDeltaTime(dt);

        const moveDistance = this.speed * scaledDt;
        this.distance += moveDistance;

        if (this.distance >= this.maxDistance) {
            this.destroyBullet();
            return;
        }

        const moveVec = new Vec2(
            this.direction.x * moveDistance,
            this.direction.y * moveDistance
        );
        const currentPos = new Vec2(this.node.position.x, this.node.position.y);
        const newPos = currentPos.add(moveVec);
        
        this.node.setPosition(newPos.x, newPos.y, 0);
    }

   

    private playIconEffect() {
        if (this.iconEffect) {
            const effectType = this.bulletData?.bulletEffectType;
            if (effectType && parseInt(effectType, 10) > 0) {
                this.iconEffect.playBulletEffect(parseInt(effectType, 10))
                // this.iconEffect.playEffect(parseInt(effectType, 10));
            }
        }
    }
    
    protected updateSpriteFrame() {
        if (!this.sprite || !this.spriteFrameName) return;
        const frame = this.bulletAtlas.getSpriteFrame(this.spriteFrameName);

        // if(!frame){
        //     const frame_1 = this.bulletAtlas_1.getSpriteFrame(this.spriteFrameName);
        //     if(frame_1){
        //         this.sprite.spriteFrame = frame_1;
        //     }
        // }

        if (!frame) {
            const frame_1 = this.bulletAtlas_1.getSpriteFrame(this.spriteFrameName);

            if(frame_1){
                this.sprite.spriteFrame = frame_1;
            }
        }else{
            this.sprite.spriteFrame = frame;
        }


       
        const uiTransform = this.sprite.getComponent(UITransform);
        const actualSize = uiTransform.contentSize;
        
        // 对于落雷类型的子弹，不绑定碰撞检测
        if (!this.isBulletNoCollide()) {
            this.bindCollide(new Size(actualSize.width, actualSize.height));
        }
       
        const animation = this.sprite.getComponent(Animation);
        
      
        if (animation && this.bulletData?.animationNames && this.bulletData.animationNames.length > 0) {
            const animName = this.bulletData.animationNames[0];
            this.scheduleOnce(() => { animation.play(animName);},0.1);
        }

        
        this.setSpriteDirection();
        
        this.playIconEffect();

        this.addTrail();
        
        this.setSpriteColor();

        this.playSound();

    }

   /**
 * 判断当前子弹是否为不参与碰撞的类型（支持基础 ID + 后缀变种）
 * 注意：drboom_basic_bomb 和 assassin_lightning 现在有专门的子弹类处理
 */
private isBulletNoCollide(): boolean {
    // 不参与碰撞的基础子弹类型列表
    //drboom_basic_bomb 和 assassin_lightning 现在有专门的子弹类处理 任然要调用 
    const noCollideBulletList: string[] = ['drboom_basic_bomb','assassin_lightning'];
  
    // 如果任意一个匹配 isBulletType，则返回 true
    return noCollideBulletList.some(baseId => this.isBulletType(baseId));
  }
  

    private playSound() {
        //弓箭手
         if(this.isBulletType('archer_basic_arrow')){
            MusicManager.getInstance().playSound(MusicManager.SOUND_ARROW);
         }else if(this.isBulletType('tanker_rock')){
            MusicManager.getInstance().playSound(MusicManager.SOUND_STON);
         }else if(this.isBulletType('mage_magic_missile')){
            MusicManager.getInstance().playSound(MusicManager.SOUND_FIRE_BALL);
         }else if(this.isBulletType('assassin_lightning')){
            MusicManager.getInstance().playSound(MusicManager.SOUND_LIGHT);
         }else if(this.isBulletType('potioner_basic_bottle')){  
            // MusicManager.getInstance().playSound(MusicManager.SOUND_ATK_1);
         }else if(this.isBulletType('footman_basic_shield')){
            MusicManager.getInstance().playSound(MusicManager.SOUND_WILD);
         }else if(this.isBulletType('forest_assassin_shadow_blade')){
            MusicManager.getInstance().playSound(MusicManager.SOUND_ATK_2);
         }
    }

    private addTrail() {
        if(this.bulletData?.hasTrail && this.trailPrefabs.length > 0){
            // 选择拖尾预制体（自动使用预制体名称映射）
            let selectedPrefab: Prefab;
            
            // 根据拖尾类型名称查找对应的预制体
            if (this.bulletData.trailType) {
                const foundPrefab = this.trailPrefabs.find(prefab => prefab.name === this.bulletData.trailType);
                if (foundPrefab) {
                    selectedPrefab = foundPrefab;
                } else {
                    console.warn(`拖尾类型 "${this.bulletData.trailType}" 未找到，使用默认拖尾`);
                    selectedPrefab = this.trailPrefabs[0];
                }
            } else {
                // 默认使用第一个预制体
                selectedPrefab = this.trailPrefabs[0];
            }
            
            const trail = instantiate(selectedPrefab);
            trail.parent = this.node;
         

            
            // 设置渲染顺序：拖尾在最后面渲染（先绘制）
            trail.setSiblingIndex(-1);
            
            // 如果需要，也可以设置 z-order
            trail.setPosition(0, 0, -1); // z轴向后一点

            if(this.bulletData.trailType === 'prefab_tailing_stone'){  
              trail.setPosition(0, -30, -1);
            } 
            
            // 设置拖尾颜色
            if (this.bulletData.trailColor) {   
                const trailColor = new Color();
                const hexTrailColor = this.bulletData.trailColor.startsWith('#') 
                    ? this.bulletData.trailColor 
                    : '#' + this.bulletData.trailColor;
                trailColor.fromHEX(hexTrailColor);
                
                const motionStreak = trail.getComponent(MotionStreak);
                if (motionStreak) {
                    motionStreak.color = trailColor;
                }
            }       
        }
    }

    /**
     * 设置子弹本体颜色 (火焰中心颜色)
     */
    private setSpriteColor() {
        if (this.bulletData?.spriteColor) {
            const spriteColor = new Color();
            const hexSpriteColor = this.bulletData.spriteColor.startsWith('#') 
                ? this.bulletData.spriteColor 
                : '#' + this.bulletData.spriteColor;
            spriteColor.fromHEX(hexSpriteColor);
            this.sprite.color = spriteColor;
            this.sprite.node.setScale(1.8,1.8)
            
        }
        this.sprite.node.setSiblingIndex(99);
    }

    /**
     * 根据移动方向设置sprite的朝向
     */
    private setSpriteDirection() {
        if (this.direction.x !== 0 || this.direction.y !== 0) {
            const angle = Math.atan2(this.direction.y, this.direction.x) * (180 / Math.PI);
            const correctedAngle = angle - 90;
            this.node.setRotationFromEuler(0, 0, correctedAngle);
        }
    }

    /**
     * 初始化透视缩放效果（特殊处理坦克石头）
     */
    private initializePerspectiveScaling(bulletData: IBulletData): void {
        // 只为坦克石头启用透视缩放效果
        if (bulletData.id && bulletData.id.includes('tanker_rock')) {
            if (!this.perspectiveScaler) {
                // 如果没有透视缩放组件，动态添加一个
                this.perspectiveScaler = this.node.addComponent(PerspectiveScaler);
            }
            
            if (this.perspectiveScaler) {
                // 先应用原有的缩放逻辑
                if (bulletData.scale !== undefined) {
                    const finalScale = Math.max(bulletData.scale as number, 0.1);
                    this.node.setScale(finalScale, finalScale);

                    this.perspectiveScaler.startScale = 1.0;  // 起始缩放（怪物出生时）
                    this.perspectiveScaler.endScale = 0.7;    // 结束缩放（到达目标区域时）
                    
                    // 通知透视缩放组件更新原始缩放
                    this.perspectiveScaler.refreshOriginalScale();
                }
                
                // 启用透视缩放效果
                this.perspectiveScaler.setEnabled(true);
                
            }
        } else {
            // 对于非坦克石头，禁用透视缩放
            if (this.perspectiveScaler) {
                this.perspectiveScaler.setEnabled(false);
            }
        }
    }

   
}
