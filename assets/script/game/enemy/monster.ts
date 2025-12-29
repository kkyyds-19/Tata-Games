import {
    _decorator, Component, Size, Sprite, Animation, AnimationClip, Vec3,
    Node, UITransform, PhysicsGroup, Vec2, director, game, Label, Color,
    Collider2D, SpriteAtlas, Contact2DType, IPhysics2DContact, RigidBody2D, sp, resources, Prefab, instantiate, tween, find, Material
} from 'cc';
import { JSB } from 'cc/env';
import { GameObject } from '../object/GameObject';
import { AnimationLoader } from '../AnimationLoader';
import { HeroPanel } from '../HeroPanel'
import { Custom2D_Collide } from '../../Custom_Collide/Custom2D_Collide';
import { Popup } from '../Popup';
import { EffectContainer } from '../EffectContainer';
import { TimeManager } from '../TimeManager';
import { DamageStatsManager } from '../DamageStatsManager';
import { PerspectiveScaler } from '../../utils/PerspectiveScaler';
import { GameManager } from '../GameManager';
import { StageType } from '../stage/StageData';
const { ccclass, property } = _decorator;

// --- 伤害类型颜色 ---
const COLOR_POISON = new Color(0, 255, 0, 255);      // 绿色 (中毒)
const COLOR_EXPLOSION = new Color(255, 165, 0, 255); // 橙色 (爆炸)
const COLOR_BLEED = new Color(180, 0, 0, 255);     // 暗红色 (流血)

const COLOR_REFLECT = new Color(180, 0, 0, 255); // 暗红色 (反伤)


// 怪物状态枚举
enum MonsterState {
    IDLE = 'idle',        // 空闲
    REPORTING = 'reporting', // 前往报到点
    MOVING = 'moving',    // 移动中
    ATTACKING = 'attacking', // 攻击中
    PATROL = 'patrol',     // 巡逻
    /**移动中攻击 */
    MOVINGATTACK = 'moveingattack'
}

@ccclass('Monster')
export class Monster extends Component {

    @property(Animation)
    public animation: Animation | null = null;

    @property(Sprite)
    public sprite: Sprite | null = null;


    //sprite 材质
    @property(Material)
    private spritehitMaterial: Material | null = null;
    //spine 材质
    @property(Material)
    private spinehitMaterial: Material | null = null;


    public spine: sp.Skeleton | null = null;

    public patrolPoints: Vec3[] = [];

    public moveSpeed: number = 100;
    public detectRange: number = 50;
    public attackRange: number = 30;
    public attackInterval: number = 1.5;

    // 怪物尺寸属性
    public width: number = 100;   // 怪物宽度
    public height: number = 100;  // 怪物高度

    // 状态效果
    private isSlowed: boolean = false;
    private slowTimer: number = 0;
    private slowFactor: number = 1.0;
    private originalMoveSpeed: number = 0;
    private activeDots: any[] = []; // { type, damage, duration, interval, timer }
    private isStunned: boolean = false;
    private stunTimer: number = 0;
    private isEntangled: boolean = false; // 新增：是否被缠绕
    private entangleTimer: number = 0; // 新增：缠绕计时器
    // 报到点设置
    public reportPoint: Vec3 | null = null; // 报到点位置
    public hasReported: boolean = false; // 是否已经报到过

    /**路径id */
    public pathId: number;
    public pathsLeft: number[][];
    public static readonly paths = {
        1: [[270, 2072], [270, 1842], [440, 1842], [440, 1508], [100, 1508], [100, 1166], [440, 1166], [440, 830], [100, 830], [100, 492], [440, 492], [440, 320]],
        2: [[900, 2072], [900, 1842], [730, 1842], [730, 1508], [1070, 1508], [1070, 1166], [730, 1166], [730, 830], [1070, 830], [1070, 492], [730, 492], [730, 320]],
    } as const;

    // public animationNames: string[] = ['m_0_0_3', 'm_0_0_1', 'm_0_0_0', 'm_3_0_2'];


    @property([SpriteAtlas])
    public mAtlas: SpriteAtlas[] = [];




    public clips: AnimationClip[] = [];
    public gameObject: GameObject | null = null;

    // 状态管理
    private currentState: MonsterState = MonsterState.IDLE;
    private currentPatrolIndex: number = 0;
    private targetPosition: Vec3 = new Vec3();
    private lastAttackTime: number = 0;
    private targetOffset: Vec3 | null = null;

    // 英雄面板列表
    private heroPanels: HeroPanel[] = [];
    private currentTargetHero: HeroPanel | null = null;
    private currentTargetMonster: Monster | null = null; // 竞技场：可选为敌方怪物目标
    public laneSide: number | null = null;
    public laneDir: number | null = null;

    // 怪物状态
    public currentHP: number = 100;       // 当前血量（从gameObject.maxhp初始化）
    public isDead: boolean = false;       // 是否死亡

    // 血量显示UI
    private hpBarNode: Node = null;       // 血量显示容器节点
    private hpLabel: Label = null;        // 血量文字标签

    lqCollide: Custom2D_Collide = null;

    // 击退状态
    private isKnockingBack: boolean = false;     // 是否处于"击退冷却"状态
    private knockbackCooldownTimer: number = 0;  // 击退冷却计时器
    private readonly BASE_KNOCKBACK_COOLDOWN: number = 1.5; // 基础冷却时间
    private readonly KNOCKBACK_FORCE_TO_COOLDOWN_RATIO: number = 0.01; // 每点力度增加的冷却时间
    private currentKnockbackForce: number = 0;   // 当前正在应用的击退力
    private knockbackTween: any = null;          // 用于控制击退动画的Tween

    // 击退动画相关
    private knockbackStartPos: Vec3 | null = null;
    private knockbackTargetPos: Vec3 | null = null;
    private knockbackProgress: number = 0;
    private readonly KNOCKBACK_ANIM_DURATION: number = 0.3; // 击退动画持续时间



    // 被击中特效相关
    private isHit: boolean = false; // 是否处于被击中状态
    private hitTimer: number = 0; // 被击中效果计时器
    private hitCooldownTimer: number = 0; // 被击中冷却计时器
    private readonly HIT_EFFECT_DURATION: number = 0.4; // 被击中效果持续时间
    private readonly HIT_COOLDOWN_DURATION: number = 0.02; // 被击中冷却时间（避免频繁触发）
    private hitMedian: number = 0; // 击中效果中间值
    private isHitMaterialApplied: boolean = false; // 是否已应用击中材质
    private independentHitMaterial: Material | null = null; // 独立的击中特效材质实例

    // 受击颜色配置
    public hitFlashColor: Color = new Color(255, 0, 0, 255); // 默认红色

    // 【新增】特效颜色配置
    private slowEffectColor: Color = new Color(0, 150, 255, 255); // 蓝色 - 缓慢效果
    private entangleEffectColor: Color = new Color(255, 0, 255, 255); // 紫色 - 缠绕效果
    private stunEffectColor: Color = new Color(255, 255, 0, 255); // 黄色 - 眩晕效果

    public MAX_KNOCKBACK_FORCE: number = 600;

    // 【新增】特效状态管理
    private currentEffectColor: Color | null = null; // 当前特效颜色
    private effectColorTimer: number = 0; // 特效颜色计时器
    private readonly EFFECT_COLOR_DURATION: number = 0.5; // 特效颜色持续时间

    // private label: Label;

    onLoad() {
        // this.label = this.node.getChildByName("Label").getComponent(Label);
        // if (!this.animation) {
        //     this.animation = this.getComponent(Animation);
        // }

        // 初始化怪物的游戏对象数据
        // if (!this.gameObject) {
        //     this.gameObject = new GameObject();
        //     this.gameObject.attack = 1; // 设置默认攻击力
        //     this.gameObject.maxhp = 100; // 设置默认血量
        //     this.gameObject.level = 1; // 设置默认等级
        // console.log(`Monster: 初始化gameObject - 攻击力: ${this.gameObject.attack}`);
        // }
        // this.node.setScale(0.5,0.5)
        this.lqCollide = this.getComponent(Custom2D_Collide);

        director.on(game.gameEvent.GAME_HERO_REVIVE, this.onHeroRevive, this);
    }

    /**
     * 初始化被击中特效材质
     */
    private initHitEffectMaterial(): void {
        // 如果已经初始化过，直接返回
        if (this.independentHitMaterial) {
            return;
        }

        if (this.gameObject?.resourceType === 'spine' && this.spine) {
            // Spine动画：应用flash-spine材质
            if (this.spinehitMaterial) {
                // 创建独立的材质实例（只创建一次）
                this.independentHitMaterial = new Material();
                this.independentHitMaterial.copy(this.spinehitMaterial);

                // 设置初始u_rate为1（无闪光效果，恢复原始状态）
                this.independentHitMaterial.setProperty("u_rate", 1);
                // 设置击中颜色
                this.independentHitMaterial.setProperty("hit_color", this.hitFlashColor);

                // 调试：打印颜色值
                // console.log(`Monster: 设置Spine击中颜色 - R:${this.hitFlashColor.r}, G:${this.hitFlashColor.g}, B:${this.hitFlashColor.b}, A:${this.hitFlashColor.a}`);

                // 直接设置到spine组件上
                this.spine.customMaterial = this.independentHitMaterial;
                // this.spine.material = this.independentHitMaterial;

                this.isHitMaterialApplied = true;
            }
        } else if (this.sprite) {
            // Sprite动画：应用flash材质
            if (this.spritehitMaterial) {
                // 创建独立的材质实例（只创建一次）
                this.independentHitMaterial = new Material();
                this.independentHitMaterial.copy(this.spritehitMaterial);

                // 设置初始u_rate为1（无闪光效果，恢复原始状态）
                this.independentHitMaterial.setProperty("u_rate", 1);
                // 设置击中颜色
                this.independentHitMaterial.setProperty("hit_color", this.hitFlashColor);

                // 调试：打印颜色值
                // console.log(`Monster: 设置Sprite击中颜色 - R:${this.hitFlashColor.r}, G:${this.hitFlashColor.g}, B:${this.hitFlashColor.b}, A:${this.hitFlashColor.a}`);

                // 直接设置到sprite组件上
                this.sprite.material = this.independentHitMaterial;

                this.isHitMaterialApplied = true;
            }
        }
    }

    onDestroy() {
        // 清理击退 Tween
        if (this.knockbackTween) {
            this.knockbackTween.stop();
            this.knockbackTween = null;
        }

        // 清理独立材质实例
        if (this.independentHitMaterial) {
            this.independentHitMaterial.destroy();
            this.independentHitMaterial = null;
        }

        // 移除事件监听
        director.off(game.gameEvent.GAME_HERO_REVIVE, this.onHeroRevive, this);
    }

    private onHeroRevive(sender: any, healAmount: number): void {
        // 复活击退 特殊处理 直接 向上后退 200像素
        // this.node.setPosition(this.node.position.x,this.node.position.y-300,this.node.position.z)
        // 并且将当前状态 设置为 移动 

        this.checkForHero();
        this.currentState = MonsterState.MOVING;

        //向上击退效果 设置击退方向为向上  
        const knockbackDir = new Vec2(0, 1);
        this.setKnockback(300, knockbackDir, true);

        //并且强制眩晕 1秒
        this.applyStun(2, true);


    }

    private findHeroPanels() {
        this.heroPanels = [];
        const heroLayer = find('Canvas/bg/heros_manager');
        if (heroLayer) {
            heroLayer.children.forEach((child) => {
                const heroPanel = child.getComponent(HeroPanel);
                if (heroPanel && (heroPanel as any).isOpen === true) {
                    this.heroPanels.push(heroPanel);
                }
            });
        }
        const gm = GameManager.getInstance();
        if (gm && gm.stageManager && gm.stageManager.stageData && gm.stageManager.stageData.stageType === StageType.Arena) {
            if (this.laneSide !== null && this.heroPanels.length > 0) {
                const ys = this.heroPanels.map(p => {
                    const n = p.attack_area ? p.attack_area : p.node;
                    const wp = n.getWorldPosition();
                    return wp.y;
                });
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);
                const cut = (minY + maxY) / 2;
                this.heroPanels = this.heroPanels.filter(p => {
                    const n = p.attack_area ? p.attack_area : p.node;
                    const y = n.getWorldPosition().y;
                    return this.laneSide === 0 ? y > cut : y <= cut;
                });
            }
        }
    }

    // /**
    //  * 设置英雄面板列表 未用到
    //  */
    // public setHeroPanels(panels: HeroPanel[]) {
    //     this.heroPanels = panels;
    //     this.initPatrolPointsFromHeroPanels();
    // }

    /**
     * 设置报到点
     * @param point 报到点的世界坐标
     */
    public setReportPoint(point: Vec3) {
        this.reportPoint = point.clone();
        this.hasReported = false;
        // console.log(`Monster: 设置报到点 (${point.x.toFixed(1)}, ${point.y.toFixed(1)})`);
    }

    /**
     * 通过节点设置报到点
     * @param node 报到点节点
     */
    public setReportPointFromNode() {
        const report_rect = this.node.parent.getChildByName('report_rect');
        if (!report_rect) {
            // console.warn('Monster: 未找到report_rect节点');
            return;
        }

        // 获取report_rect的长宽
        const report_rect_size = report_rect.getComponent(UITransform).contentSize;
        if (!report_rect_size) {
            // console.warn('Monster: report_rect节点没有UITransform组件');
            return;
        }

        // 获取报到区域的世界坐标
        const reportAreaPos = report_rect.getWorldPosition();

        // 获取怪物当前坐标
        const monsterPos = this.node.getWorldPosition();

        // 计算报到区域的边界
        const leftBound = reportAreaPos.x - report_rect_size.width / 2;
        const rightBound = reportAreaPos.x + report_rect_size.width / 2;

        // 修正X坐标：如果在范围内保持不变，否则修正到最左或最右
        let correctedX = monsterPos.x;
        if (monsterPos.x < leftBound) {
            correctedX = leftBound;
        } else if (monsterPos.x > rightBound) {
            correctedX = rightBound;
        }

        // Y坐标修正为报到区域的Y坐标
        const correctedY = reportAreaPos.y;

        // 设置修正后的报到点
        const correctedReportPoint = new Vec3(correctedX, correctedY, monsterPos.z);
        this.setReportPoint(correctedReportPoint);

        // console.log(`Monster: 报到区域范围 X:[${leftBound.toFixed(1)}, ${rightBound.toFixed(1)}], Y:${reportAreaPos.y.toFixed(1)}`);
        // console.log(`Monster: 怪物原坐标 (${monsterPos.x.toFixed(1)}, ${monsterPos.y.toFixed(1)}) → 修正后报到点 (${correctedX.toFixed(1)}, ${correctedY.toFixed(1)})`);
    }

    /**
     * 清除报到点，直接开始巡逻
     */
    public clearReportPoint() {
        this.reportPoint = null;
        this.hasReported = true;
        // console.log(`Monster: 清除报到点`);
    }

    /**
     * 根据HeroPanel的attack_area_rect初始化巡逻点
     */
    private initPatrolPointsFromHeroPanels() {
        this.patrolPoints = [];

        if (this.heroPanels.length === 0) {
            // console.warn('Monster: 未找到HeroPanel，使用默认巡逻点');
            return;
        }

        // 获取怪物当前位置
        const monsterPos = this.node.getWorldPosition();

        // 创建带距离信息的英雄面板数组
        const heroPanelWithDistance = this.heroPanels
            .filter(heroPanel => heroPanel && heroPanel.attack_area && heroPanel.isOpen)
            .map(heroPanel => {
                const panelPos = heroPanel.attack_area.getWorldPosition();
                const distance = Vec3.distance(monsterPos, panelPos);
                return {
                    heroPanel,
                    position: panelPos,
                    distance
                };
            });

        // 按距离由近到远排序
        heroPanelWithDistance.sort((a, b) => a.distance - b.distance);

        // 重新排序heroPanels数组和生成巡逻点
        this.heroPanels = [];
        heroPanelWithDistance.forEach((item, index) => {
            this.heroPanels.push(item.heroPanel);

            // 创建随机偏移
            const offset = new Vec3(
                Math.random() * 200 - 100,  // x轴随机偏移 ±100
                0,   // y轴随机偏移 ±50
                0
            );

            // 创建新的巡逻点位置（复制原始位置）
            const patrolPoint = new Vec3(
                item.position.x + offset.x,
                item.position.y + offset.y,
                item.position.z
            );

            this.patrolPoints.push(patrolPoint);

            // 调试日志
            // console.log(`Monster ${this.gameObject?.id}: 巡逻点 ${index} - 原始位置:(${item.position.x.toFixed(1)}, ${item.position.y.toFixed(1)}), 偏移:(${offset.x.toFixed(1)}, ${offset.y.toFixed(1)}), 最终位置:(${patrolPoint.x.toFixed(1)}, ${patrolPoint.y.toFixed(1)})`);
        });

        // console.log(`Monster: 按距离排序完成，共 ${this.patrolPoints.length} 个巡逻点`);

        if (this.patrolPoints.length > 0) {
            this.targetPosition = this.patrolPoints[0].clone();
        }
    }

    lets_kill_hero(obj: GameObject) {
        this.gameObject = obj

        this.addClips();

        // 初始化血量
        this.currentHP = this.gameObject.maxhp;

        this.attackRange = this.gameObject.attackRange;
        this.attackInterval = this.gameObject.attackInterval;

        // 设置移动速度
        this.moveSpeed = this.gameObject.moveSpeed;
        this.originalMoveSpeed = this.gameObject.moveSpeed; // 保存原始速度



     // 添加透视缩放组件（竞技场禁用透视缩放）
        if (GameManager.getInstance().stageManager.stageData.stageType !== StageType.Arena) {
            this.addPerspectiveScaler();
        } else {
            const ps = this.node.getComponent(PerspectiveScaler);
            if (ps) ps.setEnabled(false);
        }

        this.findHeroPanels();

        switch (GameManager.getInstance().stageManager.stageData.stageType) {
            case StageType.Normal:
            case StageType.Dungeon:
            case StageType.Arena:
            case StageType.Endless:
                this.initPatrolPointsFromHeroPanels();
                this.setReportPointFromNode();
                // 检查是否需要先去报到点
                if (this.reportPoint && !this.hasReported) {
                    this.startReporting();
                } else {
                    // 没有报到点或已经报到过，直接开始巡逻
                    this.startPatrol();
                }
                break;
            case StageType.Outland:
                this.getNextPathPos();
                break;
            default:
                throw new Error();
        }

        this.bindCollide()


        // 创建血条UI
        //  this.createHPBar();

    }

    update(dt: number) {
        const scaledDt = TimeManager.getInstance().getDeltaTime(dt);
        // 更新被击中特效
        this.updateHitEffect(scaledDt);
        // 【新增】更新特效颜色
        this.updateEffectColor(scaledDt);

        // 死亡状态下不执行任何行为
        if (this.isDead) return;
        // 使用 TimeManager 的缩放时间

        // 更新状态效果
        this.updateStatusEffects(scaledDt);

        // 更新击退冷却
        if (this.isKnockingBack) {
            this.knockbackCooldownTimer -= scaledDt;
            if (this.knockbackCooldownTimer <= 0) {
                this.isKnockingBack = false;
                this.currentKnockbackForce = 0;
            }
        }

        // 动态更新Spine动画速度
        if (this.spine) {
            const timeScale = TimeManager.getInstance().getTimeScale();
            this.spine.timeScale = timeScale;
        }

        // 每3秒打印一次当前速度（用于调试）
        // if (Date.now() % 3000 < 16) {
        //     console.log(`Monster ${this.gameObject?.id}: 当前速度=${this.moveSpeed}, 实际速度=${this.moveSpeed * TimeManager.getInstance().getTimeScale()}`);
        // }

        switch (GameManager.getInstance().stageManager.stageData.stageType) {
            case StageType.Normal:
            case StageType.Dungeon:
            case StageType.Arena:
            case StageType.Endless:
                this.updateBehavior(scaledDt);
                break;
            case StageType.Outland:
                this.updateBehaviorOutland(scaledDt);
                break;
            default:
                throw new Error();
        }


    }

    /**
     * 更新怪物行为
     */
    private updateBehavior(dt: number) {
        // 游戏暂停时，不执行任何行为
        if (TimeManager.getInstance().isPaused()) {
            if (this.spine) { this.spine.timeScale = 0; }
            return;
        }

        // 眩晕状态下，完全停止行为和动画
        if (this.isStunned) {
            if (this.spine) { this.spine.timeScale = 0; }
            return;
        }

        // 恢复动画
        if (this.spine) { this.spine.timeScale = TimeManager.getInstance().getTimeScale(); }

        // 缠绕状态下，可以攻击但不能移动
        if (this.isEntangled) {
            this.checkForHero(); // 仍然需要检查英雄以确定攻击目标
            if (this.currentState === MonsterState.ATTACKING) {
                this.updateAttack(dt);
            }
            return; // 跳过移动相关的行为
        }

        switch (this.currentState) {
            case MonsterState.IDLE:
                // 空闲状态，检查是否需要报到或开始巡逻
                if (this.reportPoint && !this.hasReported) {
                    this.startReporting();
                } else {
                    this.startPatrol();
                }
                break;

            case MonsterState.REPORTING:
                // 前往报到点状态
                this.updateMovement(dt);
                break;

            case MonsterState.MOVING:
                // 移动状态
                this.updateMovement(dt);
                break;

            case MonsterState.ATTACKING:
                // 攻击状态
                this.updateAttack(dt);
                break;

            case MonsterState.PATROL:
                // 巡逻状态，检查是否有英雄
                this.checkForHero();
                if (this.currentState === MonsterState.PATROL) {
                    // 没有发现英雄，继续移动
                    this.updateMovement(dt);
                }
                break;
        }
    }

    private updateBehaviorOutland(dt: number) {
        // 游戏暂停时，不执行任何行为
        if (TimeManager.getInstance().isPaused()) {
            if (this.spine) { this.spine.timeScale = 0; }
            return;
        }

        // 眩晕状态下，完全停止行为和动画
        if (this.isStunned) {
            if (this.spine) { this.spine.timeScale = 0; }
            return;
        }

        // 恢复动画
        if (this.spine) { this.spine.timeScale = TimeManager.getInstance().getTimeScale(); }

        // 缠绕状态下，可以攻击但不能移动
        if (this.isEntangled) {
            this.checkForHeroOutland(); // 仍然需要检查英雄以确定攻击目标
            if (this.currentState === MonsterState.MOVINGATTACK) {
                this.updateMovingAttack(dt);
            }
            return; // 跳过移动相关的行为
        }

        // console.log(`${this.currentState}`);
        switch (this.currentState) {
            case MonsterState.IDLE:
            case MonsterState.REPORTING:
                this.currentState = MonsterState.MOVING;
                this.playAnimation(this.gameObject.animationNames[0]);
            case MonsterState.MOVING:
                {
                    this.checkForHeroOutland();
                    //@ts-ignore
                    if (this.currentState == MonsterState.MOVINGATTACK) {
                        this.updateMovingAttack(dt);
                    }
                    this.updateMovementOutland(dt);
                }
                break;
            case MonsterState.MOVINGATTACK:
                this.updateMovingAttack(dt);
                this.updateMovementOutland(dt);
                break;
        }
    }

    /**
     * 开始巡逻
     */
    private startPatrol() {
        this.currentState = MonsterState.PATROL;
        // 直接检查英雄，不再使用巡逻点
        this.checkForHero();

        if (this.currentState === MonsterState.PATROL) {
            // 如果没有找到目标，随机移动
            const randomOffset = new Vec3(
                Math.random() * 400 - 200,  // x轴随机偏移 ±200
                0,   // y轴不偏移
                0
            );

            // 从当前位置随机选择一个新的目标点
            const currentPos = this.node.getWorldPosition();
            this.targetPosition = new Vec3(
                currentPos.x + randomOffset.x,
                currentPos.y,
                currentPos.z
            );

            // 播放移动动画
            this.playAnimation(this.gameObject.animationNames[0]);
        }
    }

    /**
     * 开始前往报到点
     */
    private startReporting() {
        if (!this.reportPoint) return;

        this.currentState = MonsterState.REPORTING;
        this.targetPosition = this.reportPoint.clone();
        // 播放移动动画 - 使用自动循环判断（移动动画会循环）
        this.playAnimation(this.gameObject.animationNames[0])
        // console.log(`Monster: 前往报到点 (${this.reportPoint.x.toFixed(1)}, ${this.reportPoint.y.toFixed(1)})`);
    }

    /**
     * 更新移动
     */
    private updateMovement(dt: number) {
        const currentPos = this.node.getWorldPosition();

        // 如果是巡逻状态，每隔一段时间检查是否有英雄
        if (this.currentState === MonsterState.PATROL) {
            this.checkForHero();
            if (this.currentState !== MonsterState.PATROL) {
                // 如果找到了目标，就不继续执行移动逻辑
                return;
            }
        }

        // 如果处于移动状态且有目标英雄，持续检查距离
        if (this.currentState === MonsterState.MOVING && this.currentTargetHero) {
            const targetPos = this.currentTargetHero.attack_area.getWorldPosition();
            const distanceToTarget = Vec3.distance(currentPos, targetPos);

            // 如果已经在攻击范围内，立即开始攻击
            if (distanceToTarget <= this.attackRange) {
                // console.log(`Monster ${this.gameObject?.id}: 移动中发现目标在攻击范围内，切换到攻击状态`);
                this.startAttack();
                return;
            }

            // 更新目标位置（以防目标移动）
            const finalTargetPos = new Vec3();
            Vec3.add(finalTargetPos, targetPos, this.targetOffset || Vec3.ZERO);
            this.targetPosition = finalTargetPos;
        }

        const direction = new Vec3();
        Vec3.subtract(direction, this.targetPosition, currentPos);

        const distance = direction.length();

        if (distance < 30) {
            // 到达目标点
            if (this.currentState === MonsterState.PATROL) {
                // 如果是巡逻状态，选择新的随机目标点
                this.startPatrol();
            } else if (this.currentState === MonsterState.REPORTING) {
                // 到达报到点
                this.hasReported = true;
                this.startPatrol();
            } else if (this.currentState === MonsterState.MOVING) {
                // 如果是移动状态，重新检查是否可以攻击
                // console.log(`Monster ${this.gameObject?.id}: 到达目标点，重新检查攻击条件`);
                this.checkForHero();
            }
        } else {
            // 继续移动
            direction.normalize();

            const timeScale = TimeManager.getInstance().getTimeScale();
            // 应用移动速度（包含减速效果）并计算实际移动距离
            const scaledSpeed = this.moveSpeed * this.slowFactor * timeScale;

            const moveDistance = scaledSpeed * dt;
            direction.multiplyScalar(moveDistance);

            const newPos = new Vec3();
            Vec3.add(newPos, currentPos, direction);

            // 设置新位置
            this.node.setWorldPosition(newPos);

            // 根据移动方向设置面向
            this.faceTo(direction.x);
        }
    }

    faceTo(dx: number) {
        if (dx !== 0) {
            // 如果是spine动画，需要调整整个节点的缩放
            if (this.gameObject?.resourceType === 'spine' && this.spine) {
                const scale = this.node.getScale();
                scale.x = Math.abs(scale.x) * (dx > 0 ? -1 : 1);
                this.node.setScale(scale);
            } else if (this.sprite) {
                // 如果是普通精灵，直整个节点的缩放
                const scale = this.node.getScale();
                scale.x = Math.abs(scale.x) * (dx > 0 ? -1 : 1);
                this.node.setScale(scale);
            }
        }
    }

    updateMovementOutland(dt: number) {
        const currentPos = this.node.getWorldPosition();

        const timeScale = TimeManager.getInstance().getTimeScale();
        // 应用移动速度（包含减速效果）并计算实际移动距离
        const scaledSpeed = this.moveSpeed * this.slowFactor * timeScale;
        let moveDistance = scaledSpeed * dt;

        while (moveDistance > 0) {
            if (!this.targetPosition) {
                if (!this.getNextPathPos()) return;
            }

            const direction = new Vec3();
            Vec3.subtract(direction, this.targetPosition, currentPos);
            // if (direction.x == 0 && direction.y == 0) {
            //     this.targetPosition = null;
            //     continue;
            // }

            const distance = direction.length();
            if (moveDistance < distance) {//没到目标，直接走
                direction.normalize();
                direction.multiplyScalar(moveDistance);

                const newPos = new Vec3();
                Vec3.add(newPos, currentPos, direction);

                // 设置新位置
                this.node.setWorldPosition(newPos);
                // this.label.string = `[${newPos.x.toFixed(1)},${newPos.y.toFixed(1)}]->[${this.targetPosition.x.toFixed(1)},${this.targetPosition.y.toFixed(1)}]`;
                this.faceTo(direction.x);
                return;
            } else {//移动距离超过到下个点的距离，继续走下一段
                moveDistance -= distance;
                this.targetPosition = null;
            }
        }

    }

    getNextPathPos(): boolean {
        let pos = this.pathsLeft.shift();
        if (!pos) return false;
        this.targetPosition = new Vec3(pos[0], pos[1], 0);
        return true;
    }

    /**
     * 检查是否有英雄
     */
    private checkForHero() {
        // 获取当前怪物位置
        const monsterPos = this.node.getWorldPosition();

        // 创建英雄面板数组，包含距离和类型信息
        let availableHeroes = this.heroPanels
            .filter(heroPanel => this.isHeroAliveAtPanel(heroPanel))
            .map(heroPanel => {
                const heroPanelPos = heroPanel.attack_area.getWorldPosition();
                const distance = Vec3.distance(monsterPos, heroPanelPos);
                // console.log(`Monster ${this.gameObject?.id}: 检测英雄 - 距离: ${distance}, 攻击范围: ${this.attackRange}, 是否Tank: ${heroPanel.hero?.class === 0}`);
                return {
                    heroPanel,
                    distance,
                    isTank: heroPanel.hero?.class === 0 // 0表示tank类型
                };
            });

        // 竞技场按前进方向过滤“前方”目标，避免到中路后掉头返攻
        if (GameManager.getInstance().stageManager.stageData.stageType === StageType.Arena && this.laneDir !== null) {
            availableHeroes = availableHeroes.filter(h => {
                const y = h.heroPanel.attack_area.getWorldPosition().y;
                const dy = y - monsterPos.y;
                return this.laneDir > 0 ? dy >= 0 : dy <= 0;
            });
        }

        // 竞技场：收集敌方怪物作为可攻击目标（laneDir 相反）
        let availableEnemies: { monster: Monster, distance: number }[] = [];
        if (GameManager.getInstance().stageManager.stageData.stageType === StageType.Arena) {
            const container = this.node.parent; // 怪物都在同一容器中
            if (container) {
                for (const child of container.children) {
                    const m = child.getComponent(Monster);
                    if (!m || m === this) continue;
                    if (m.isDead) continue;
                    const dir = (m as any).laneDir;
                    if (typeof dir === 'number' && this.laneDir != null) {
                        if (dir === this.laneDir) continue; // 仅对立侧
                    }
                    const w = m.node.worldPosition;
                    const d = Vec3.distance(monsterPos, w);
                    availableEnemies.push({ monster: m, distance: d });
                }
            }
        }

        // 若无英雄目标且存在敌方怪物，则选取最近怪物
        if (availableHeroes.length === 0 && availableEnemies.length > 0) {
            const nearestEnemy = availableEnemies.sort((a, b) => a.distance - b.distance)[0];
            this.currentTargetMonster = nearestEnemy.monster;
            this.currentTargetHero = null;
            this.targetOffset = null;
            if (nearestEnemy.distance <= this.attackRange) {
                this.startAttack();
            } else {
                this.moveTowardsMonster(nearestEnemy.monster);
            }
            return;
        } else if (availableHeroes.length === 0) {
            this.currentTargetHero = null;
            this.currentTargetMonster = null;
            this.targetOffset = null;
            if (GameManager.getInstance().stageManager.stageData.stageType === StageType.Arena && this.laneDir !== null) {
                const step = 400;
                const forward = new Vec3(0, this.laneDir > 0 ? step : -step, 0);
                const forwardPos = new Vec3();
                Vec3.add(forwardPos, monsterPos, forward);
                this.currentState = MonsterState.MOVING;
                this.playAnimation(this.gameObject.animationNames[0]);
                this.targetPosition = forwardPos;
            }
            return;
        }

        // 首先尝试找最近的Tank
        const nearestTank = availableHeroes
            .filter(hero => hero.isTank)
            .sort((a, b) => a.distance - b.distance)[0];

        // 如果有Tank，选择Tank为目标，否则选择最近的英雄
        const target = nearestTank || availableHeroes.sort((a, b) => a.distance - b.distance)[0];

        // 如果目标切换了，就计算一个新的随机偏移位置
        if (this.currentTargetHero !== target.heroPanel) {
            const radius = this.attackRange * (0.5 + Math.random() * 0.4); // 半径为攻击距离的50%-90%
            const angle = Math.random() * Math.PI * 2;
            this.targetOffset = new Vec3(radius * Math.cos(angle), radius * Math.sin(angle) * 0.5, 0);
        }

        // 竞技场：若最近敌方怪物比英雄更近，则改为怪物为目标
        if (availableEnemies.length > 0) {
            const nearestEnemy = availableEnemies.sort((a, b) => a.distance - b.distance)[0];
            // 优先与对侧怪物战斗：只要敌方怪物比英雄更近，就优先攻击怪物
            if (nearestEnemy.distance < target.distance) {
                this.currentTargetMonster = nearestEnemy.monster;
                this.currentTargetHero = null;
                this.targetOffset = null;
                if (nearestEnemy.distance <= this.attackRange) {
                    this.startAttack();
                } else {
                    this.moveTowardsMonster(nearestEnemy.monster);
                }
                return;
            }
        }

        // 默认选择英雄
        this.currentTargetMonster = null;
        this.currentTargetHero = target.heroPanel;

        // 检查是否在攻击范围内
        if (target.distance <= this.attackRange) {
            // console.log(`Monster ${this.gameObject?.id}: 目标在攻击范围内，开始攻击`);
            this.startAttack();
        } else {
            // console.log(`Monster ${this.gameObject?.id}: 目标不在攻击范围内，移动靠近`);
            this.moveTowardsHero(target.heroPanel);
        }
    }

    /**
     * 检查是否有英雄
     */
    private checkForHeroOutland() {
        // 获取当前怪物位置
        const monsterPos = this.node.getWorldPosition();

        // 创建英雄面板数组，包含距离和类型信息
        const availableHeroes = this.heroPanels
            .filter(heroPanel => this.isHeroAliveAtPanel(heroPanel))
            .map(heroPanel => {
                const heroPanelPos = heroPanel.attack_area.getWorldPosition();
                const distance = Vec3.distance(monsterPos, heroPanelPos);
                // console.log(`Monster ${this.gameObject?.id}: 检测英雄 - 距离: ${distance}, 攻击范围: ${this.attackRange}, 是否Tank: ${heroPanel.hero?.class === 0}`);
                return {
                    heroPanel,
                    distance,
                    isTank: heroPanel.hero?.class === 0 // 0表示tank类型
                };
            });

        if (availableHeroes.length === 0) {
            this.currentTargetHero = null;
            this.targetOffset = null; // 目标丢失，清除偏移
            return;
        }

        // 首先尝试找最近的守护者
        const principal = availableHeroes
            .filter(hero => hero.heroPanel.hero.id === GameObject.principal)
            .sort((a, b) => a.distance - b.distance)[0];

        const nearHero = availableHeroes.sort((a, b) => a.distance - b.distance)[0];
        let target = principal && (principal.distance <= this.attackRange) ? principal : (nearHero.distance <= this.attackRange ? nearHero : null);
        this.targetOffset = null;
        this.currentTargetHero = target?.heroPanel;
        if (target) {
            this.startMovingAttack();
        }
    }



    /**
     * 检查HeroPanel是否有活着的英雄
     */
    private isHeroAliveAtPanel(heroPanel: HeroPanel): boolean {
        return heroPanel && heroPanel.hero && heroPanel.hero.hp > 0;
    }

    /**
     * 向英雄移动
     */
    private moveTowardsHero(heroPanel: HeroPanel) {
        if (!heroPanel || !heroPanel.attack_area) {
            this.currentState = MonsterState.PATROL;
            return;
        }
        this.currentState = MonsterState.MOVING;
        this.playAnimation(this.gameObject.animationNames[0]);
        this.targetPosition = heroPanel.attack_area.getWorldPosition();
    }

    /**
     * 开始攻击
     */
    private startAttack() {
        const currentTime = Date.now() / 1000;
        const timeSinceLastAttack = currentTime - this.lastAttackTime;

        if (timeSinceLastAttack >= this.attackInterval) {
            this.currentState = MonsterState.ATTACKING;
            this.lastAttackTime = currentTime;

            // 攻击前调整面向目标
            this.faceTarget();

            // 确保有攻击动画
            if (this.gameObject?.animationNames && this.gameObject.animationNames.length > 1) {
                // console.log(`Monster ${this.gameObject?.id}: 播放攻击动画 ${this.gameObject.animationNames[1]}`);
                this.playAnimation(this.gameObject.animationNames[1], false);
            }

            // 造成伤害：优先对当前选中的目标（英雄或怪物）
            if (this.currentTargetMonster && !this.currentTargetMonster.isDead) {
                this.dealDamageToMonster(this.currentTargetMonster);
            } else if (this.currentTargetHero && this.isHeroAliveAtPanel(this.currentTargetHero)) {
                this.dealDamageToHero(this.currentTargetHero);
            }
        }
    }

    /**
     * 开始攻击
     */
    private startMovingAttack() {
        const currentTime = Date.now() / 1000;
        const timeSinceLastAttack = currentTime - this.lastAttackTime;

        if (timeSinceLastAttack >= this.attackInterval) {
            this.currentState = MonsterState.MOVINGATTACK;
            this.lastAttackTime = currentTime;

            // 攻击前调整面向目标
            this.faceTarget();

            // 确保有攻击动画
            if (this.gameObject?.animationNames && this.gameObject.animationNames.length > 1) {
                // console.log(`Monster ${this.gameObject?.id}: 播放攻击动画 ${this.gameObject.animationNames[1]}`);
                this.playAnimation(this.gameObject.animationNames[1], false);
            }

            // 造成伤害：优先对当前选中的目标（英雄或怪物）
            if (this.currentTargetMonster && !this.currentTargetMonster.isDead) {
                this.dealDamageToMonster(this.currentTargetMonster);
            } else if (this.currentTargetHero && this.isHeroAliveAtPanel(this.currentTargetHero)) {
                this.dealDamageToHero(this.currentTargetHero);
            }
        }
    }


    /**
     * 更新攻击状态
     */
    private updateAttack(dt: number) {
        // 检查当前目标是否有效
        const heroInvalid = !this.currentTargetHero || !this.isHeroAliveAtPanel(this.currentTargetHero);
        const monsterInvalid = !this.currentTargetMonster || this.currentTargetMonster.isDead;
        if ((this.currentTargetMonster ? monsterInvalid : true) && (this.currentTargetHero ? heroInvalid : true)) {
            // 英雄死亡或无效，回到巡逻状态
            // console.log(`Monster ${this.gameObject?.id}: 目标无效或已死亡，回到巡逻状态`);
            this.currentTargetHero = null;
            this.currentTargetMonster = null;

            this.currentState = MonsterState.PATROL;
            this.playAnimation(this.gameObject.animationNames[0]);
            return;
        }

        // 检查是否在攻击范围内
        const monsterPos = this.node.getWorldPosition();
        let distance = 0;
        if (this.currentTargetMonster) {
            const targetPos = this.currentTargetMonster.node.getWorldPosition();
            distance = Vec3.distance(monsterPos, targetPos);
        } else if (this.currentTargetHero) {
            const targetPos = this.currentTargetHero.attack_area.getWorldPosition();
            distance = Vec3.distance(monsterPos, targetPos);
        }

        if (distance <= this.attackRange) {
            // 在攻击范围内，继续攻击
            this.startAttack();
        } else {
            // 超出攻击范围，切换到移动状态
            // console.log(`Monster ${this.gameObject?.id}: 目标超出攻击范围，切换到移动状态`);
            if (this.currentTargetMonster) this.moveTowardsMonster(this.currentTargetMonster);
            else if (this.currentTargetHero) this.moveTowardsHero(this.currentTargetHero);
        }
    }

    /**
     * 更新攻击状态
     */
    private updateMovingAttack(dt: number) {
        const st = this;
        // 检查当前目标是否还有效
        const heroInvalid = !st.currentTargetHero || !st.isHeroAliveAtPanel(st.currentTargetHero);
        const monsterInvalid = !st.currentTargetMonster || st.currentTargetMonster.isDead;
        if ((st.currentTargetMonster ? monsterInvalid : true) && (st.currentTargetHero ? heroInvalid : true)) {
            // 英雄死亡或无效，回到巡逻状态
            // console.log(`Monster ${st.gameObject?.id}: 目标无效或已死亡，回到巡逻状态`);
            st.currentTargetHero = null;
            st.currentTargetMonster = null;

            st.currentState = MonsterState.MOVING;
            st.playAnimation(st.gameObject.animationNames[0]);
            return;
        }

        const monsterPos = st.node.getWorldPosition();
        const currentTime = Date.now() / 1000;
        const timeSinceLastAttack = currentTime - st.lastAttackTime;

        if (timeSinceLastAttack >= st.attackInterval) {
            //时间够了再检查

            const availableHeroes = st.heroPanels
                .filter(heroPanel => st.isHeroAliveAtPanel(heroPanel) && heroPanel.hero.id === GameObject.principal)
                .map(heroPanel => {
                    const heroPanelPos = heroPanel.attack_area.getWorldPosition();
                    const distance = Vec3.distance(monsterPos, heroPanelPos);
                    // console.log(`Monster ${this.gameObject?.id}: 检测英雄 - 距离: ${distance}, 攻击范围: ${this.attackRange}, 是否Tank: ${heroPanel.hero?.class === 0}`);
                    return {
                        heroPanel,
                        distance,
                        isTank: heroPanel.hero?.class === 0 // 0表示tank类型
                    };
                });
            const principal = availableHeroes.sort((a, b) => a.distance - b.distance)[0];
            // 竞技场：检查最近敌方怪物
            let nearestEnemy: Monster | null = null;
            let enemyDistance = Number.MAX_VALUE;
            if (GameManager.getInstance().stageManager.stageData.stageType === StageType.Arena) {
                const container = st.node.parent;
                if (container) {
                    for (const child of container.children) {
                        const m = child.getComponent(Monster);
                        if (!m || m === st) continue;
                        if (m.isDead) continue;
                        const dir = (m as any).laneDir;
                        if (typeof dir === 'number' && st.laneDir != null) {
                            if (dir === st.laneDir) continue;
                        }
                        const w = m.node.worldPosition;
                        const d = Vec3.distance(monsterPos, w);
                        if (d < enemyDistance) { enemyDistance = d; nearestEnemy = m; }
                    }
                }
            }
            // 优先与对侧怪物交战：只要敌怪比守护者更近，就优先攻击怪物
            if (nearestEnemy && (principal ? enemyDistance < principal.distance : enemyDistance <= st.attackRange * 1.5)) {
                st.currentTargetMonster = nearestEnemy;
                st.currentTargetHero = null;
                st.startMovingAttack();
            } else if (principal && principal.distance <= st.attackRange) {
                st.currentTargetMonster = null;
                st.currentTargetHero = principal.heroPanel;
                st.startMovingAttack();
            } else {
                // 检查是否在攻击范围内
                let distance = 0;
                if (st.currentTargetMonster) {
                    const targetPos = st.currentTargetMonster.node.getWorldPosition();
                    distance = Vec3.distance(monsterPos, targetPos);
                } else if (st.currentTargetHero) {
                    const targetPos = st.currentTargetHero.attack_area.getWorldPosition();
                    distance = Vec3.distance(monsterPos, targetPos);
                }

                if (distance <= st.attackRange) {
                    // 在攻击范围内，继续攻击
                    st.startMovingAttack();
                } else {
                    st.currentTargetHero = null;
                    st.currentTargetMonster = null;
                    st.currentState = MonsterState.MOVING;
                    st.playAnimation(st.gameObject.animationNames[0]);
                    // 超出攻击范围，切换到移动状态
                    // console.log(`Monster ${st.gameObject?.id}: 目标超出攻击范围，切换到移动状态`);
                }

            }
        }
    }


    /**
     * 让怪物面向目标（2D游戏只需要左右方向）
     */
    private faceTarget() {
        const monsterPos = this.node.getWorldPosition();
        let targetPos: Vec3 | null = null;
        if (this.currentTargetMonster) {
            targetPos = this.currentTargetMonster.node.getWorldPosition();
        } else if (this.currentTargetHero && this.currentTargetHero.attack_area) {
            targetPos = this.currentTargetHero.attack_area.getWorldPosition();
        } else {
            return;
        }

        // 计算目标相对于怪物的方向
        const direction = (targetPos?.x || 0) - monsterPos.x;

        if (Math.abs(direction) > 5) { // 避免在目标正上方/下方时频繁翻转
            // 如果是spine动画，调整整个节点的缩放
            if (this.gameObject?.resourceType === 'spine' && this.spine) {
                const scale = this.node.getScale();
                scale.x = Math.abs(scale.x) * (direction > 0 ? -1 : 1);
                this.node.setScale(scale);
            } else if (this.sprite) {
                // 如果是普通精灵，调整整个节点的缩放
                const scale = this.node.getScale();
                scale.x = Math.abs(scale.x) * (direction > 0 ? -1 : 1);
                this.node.setScale(scale);
            }
        }
    }

    /**
     * 对英雄造成伤害
     */
    private dealDamageToHero(heroPanel: HeroPanel) {
        if (!heroPanel || !this.gameObject || !heroPanel.hero) {
            return;
        }

        if (!this.isHeroAliveAtPanel(heroPanel)) {
            return;
        }

        const damage = this.gameObject.attack || 20;
        const reflectDamage = heroPanel.takeDamage(damage, this.gameObject);

        if (reflectDamage > 0) {
            // 怪物对自己造成反伤，并将伤害来源归于该英雄
            this.takeDamage(reflectDamage, false, true, heroPanel.hero.id, undefined, COLOR_REFLECT);
        }
    }

    // 竞技场：对敌方怪物造成伤害
    private dealDamageToMonster(target: Monster) {
        if (!target || target.isDead || !this.gameObject) return;
        const damage = this.gameObject.attack || 20;
        target.takeDamage(damage, false, true);
    }

    // 竞技场：向敌方怪物移动
    private moveTowardsMonster(target: Monster) {
        if (!target || target.isDead) return;
        const targetPos = target.node.getWorldPosition();
        this.targetPosition = new Vec3(targetPos.x, targetPos.y, 0);
        this.currentState = MonsterState.MOVING;
        this.playAnimation(this.gameObject.animationNames[0]);
    }

    //加载动画
    private addClips() {

        if (this.gameObject.resourceType == 'spine') {
            this.loadBossSpineAnimation();
        } else {
            this.addClipsFromLoader();
        }
    }


    /**
     * 从AnimationLoader获取动画并添加到Animation组件
     */

    private addClipsFromLoader() {
        // 如果在编辑器中已经预加载了动画剪辑，则不需要再次添加
        // console.log('Monster: 检查动画组件状态');
        this.playAnimation(this.gameObject.animationNames[0]);

        // 动画加载完成后，初始化被击中特效材质
        this.initHitEffectMaterial();
    }




    /**
     * 
     * @param hero 
     * @returns 
     */

    private loadBossSpineAnimation(): void {
        const boss = this.gameObject

        if (!boss.resourceDir) {
            // console.warn('Monster: boss resourceDir 不存在');
            return;
        }

        const spineNode = new Node('boss_spine');
        spineNode.parent = this.node;

        // 设置位置和缩放（调整大小）
        spineNode.setPosition(0, 0, 0);

        // 添加 Spine 组件
        this.spine = spineNode.addComponent(sp.Skeleton);

        // 异步加载 Spine 资源
        resources.load(boss.resourceDir, sp.SkeletonData, (err, skeletonData) => {
            if (err || !skeletonData) {
                console.error("Monster: Spine资源加载失败:", err, boss.resourceDir);
                return;
            }

            if (!this.spine) {
                console.warn('Monster: spine 组件已被销毁');
                return;
            }

            try {
                this.spine.skeletonData = skeletonData;

                // 如果有皮肤名称，设置皮肤
                if (boss.skinName && boss.skinName !== '') {
                    this.spine.setSkin(boss.skinName);
                    console.log('Monster: Boss皮肤设置成功:', boss.skinName);
                }

                // 设置动画完成监听器
                this.spine.setCompleteListener((entry) => {
                    const animationName = entry.animation.name;
                    // console.log(`Monster: Boss动画完成 - ${animationName}`);

                    // 如果攻击动画完成，切换回移动动画
                    if (animationName === boss.animationNames[1]) { // 攻击动画
                        // console.log('Monster: Boss攻击动画完成，切换到移动动画');
                        this.playAnimation(boss.animationNames[0], true); // 播放移动动画

                        // 重置攻击状态，允许继续寻找目标或巡逻
                        if (this.currentState === MonsterState.ATTACKING) {
                            this.currentState = MonsterState.PATROL;
                        }
                    }
                });

                this.spine.setAnimation(0, boss.animationNames[0], true);

                // Spine动画加载成功后，初始化被击中特效材质
                this.initHitEffectMaterial();

            } catch (error) {
                // console.error('Monster: 设置 Boss Spine 动画时出错:', error);
            }
        });
    }



    // /**
    //  * 动态添加新的动画剪辑
    //  * @param animName 动画名称
    //  */
    // public addAnimationName(animName: string) {
    //     if (this.gameObject.animationNames.indexOf(animName) === -1) {
    //         this.gameObject.animationNames.push(animName);

    //         const animationPath = 'anim/monster';
    //         // 从AnimationLoader获取动画并添加
    //         const clip = AnimationLoader.getAnimationClip(animationPath, animName);
    //         if (clip && this.animation) {
    //             this.animation.addClip(clip, animName);
    //             this.clips.push(clip);
    //             // console.log(`Monster: Dynamically added clip ${animName}`);
    //         } else {
    //             // console.warn(`Monster: Animation clip '${animName}' not found in loader cache`);
    //         }
    //     }
    // }

    /**
     * 播放指定的动画，根据动画类型判断是否循环
     * @param clipName 动画名称
     * @param loop 是否循环（可选）
     */
    private playAnimation(clipName: string, loop?: boolean) {
        // 如果没有指定循环参数，根据动画类型自动判断
        if (loop === undefined) {
            // 攻击动画和死亡动画不循环，其他动画（如行走、待机）循环播放
            loop = clipName !== this.gameObject?.animationNames[1]
        }

        // 如果是spine动画类型，使用spine播放
        if (this.gameObject?.resourceType === 'spine' && this.spine) {
            try {
                // 设置动画播放速度为TimeManager的倍速
                const timeScale = TimeManager.getInstance().getTimeScale();
                this.spine.timeScale = timeScale;

                this.spine.setAnimation(0, clipName, loop);
                // console.log(`Monster: Spine动画播放成功 - ${clipName}, 循环: ${loop}`);
            } catch (error) {
                // console.error(`Monster: Spine动画播放失败 - ${clipName}:`, error);
            }
        } else if (this.animation) {
            // 普通动画使用Animation组件播放
            this.animation.play(clipName);

            // 获取动画状态并设置循环模式
            const animState = this.animation.getState(clipName);
            if (animState) {
                // 设置循环模式
                if (loop) {
                    animState.wrapMode = AnimationClip.WrapMode.Loop;
                    animState.repeatCount = Infinity; // 无限循环
                } else {
                    animState.wrapMode = AnimationClip.WrapMode.Loop;
                    animState.repeatCount = Infinity; // 播放一次
                }
            }
        }
    }




    /**
     * 获取当前状态
     */
    public getCurrentState(): MonsterState {
        return this.currentState;
    }

    /**
     * 强制设置状态（调试用）
     */
    public setState(state: MonsterState) {
        this.currentState = state;
    }

    /**
     * 获取怪物宽度
     */
    public getWidth(): number {
        return this.width;
    }

    /**
     * 获取怪物高度
     */
    public getHeight(): number {
        return this.height;
    }

    /**
     * 设置怪物尺寸
     */
    public setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }

    /**
     * 获取怪物尺寸
     */
    public getSize(): { width: number, height: number } {
        return { width: this.width, height: this.height };
    }



    bindCollide() {
        const lqCollide = this.node.getComponent(Custom2D_Collide);
        if (!lqCollide) {
            console.warn('Monster: 未找到 Custom2D_Collide 组件');
            return;
        }

        // 初始化碰撞体基本设置
        this.initializeColliderSettings(lqCollide);

        // 根据资源类型设置碰撞体
        if (this.isSpineAnimation()) {
            this.setupSpineCollider(lqCollide);
        } else if (this.sprite) {
            this.setupSpriteCollider(lqCollide);
        } else {
            console.warn('Monster: 未检测到有效的动画组件');
            // 使用怪物的width和height属性作为碰撞体大小
            lqCollide.size = new Size(this.width, this.height);
        }

        this.lqCollide = lqCollide;

        // 【重要】从最终的碰撞体尺寸获取真实的宽度和高度
        this.width = lqCollide.size.width;
        this.height = lqCollide.size.height;
    }

    /**
     * 初始化碰撞体基本设置
     */
    private initializeColliderSettings(lqCollide: Custom2D_Collide): void {
        lqCollide.group = 1; // monster 组
        lqCollide.enable = true;
    }

    /**
     * 检查是否为Spine动画
     */
    private isSpineAnimation(): boolean {
        return this.gameObject?.resourceType === 'spine' && !!this.spine;
    }

    /**
     * 设置Spine动画的碰撞体
     */
    private setupSpineCollider(lqCollide: Custom2D_Collide): void {
        // 延迟获取Spine尺寸，确保Spine已完全加载
        this.scheduleOnce(() => {
            try {
                const spineNode = this.spine?.node;
                const uiTransform = spineNode?.getComponent(UITransform);

                if (!uiTransform || !this.lqCollide) {
                    console.warn('Monster: Spine UITransform 或 lqCollide 不存在');
                    return;
                }

                const contentSize = uiTransform.contentSize;
                if (contentSize.width <= 0 || contentSize.height <= 0) {
                    console.warn('Monster: Spine contentSize 无效');
                    return;
                }

                // 设置碰撞体大小 (70%的Spine尺寸)
                const colliderSize = new Size(
                    contentSize.width * 0.7,
                    contentSize.height * 0.7
                );
                this.lqCollide.size = colliderSize;

                // 调整Spine位置让底部对齐
                const adjustedY = contentSize.height * 0.5 * 0.7;
                this.lqCollide.offset = new Vec2(0, adjustedY)
                // spineNode.setPosition(0, adjustedY, 0);



            } catch (error) {
                console.error('Monster: 设置Spine碰撞体时出错:', error);
            }
        }, 0.1);
    }

    /**
     * 设置Sprite动画的碰撞体
     */
    private setupSpriteCollider(lqCollide: Custom2D_Collide): void {
        const uiTransform = this.sprite?.getComponent(UITransform);
        if (!uiTransform) {
            console.warn('Monster: Sprite UITransform 不存在');
            return;
        }

        // 设置临时碰撞体大小
        const contentSize = uiTransform.contentSize;
        const tempColliderSize = new Size(
            contentSize.width * 0.8,
            contentSize.height * 0.8
        );
        lqCollide.size = tempColliderSize;
        const offy = (tempColliderSize.height - this.node.getComponent(UITransform).contentSize.height)
        lqCollide.offset = new Vec2(0, offy);


        // 延迟更新到精确尺寸
        this.scheduleOnce(() => {
            this.updateFrameColliderSize();
        }, 0.2);
    }

    /**
     * 更新帧动画的碰撞体大小
     */
    private updateFrameColliderSize(): void {
        if (!this.sprite?.spriteFrame || !this.lqCollide) {
            return;
        }

        const frameSize = this.sprite.spriteFrame.originalSize;
        if (frameSize.width <= 0 || frameSize.height <= 0) {
            return;
        }

        // 考虑节点缩放
        // const nodeScale = this.node.getScale();
        const nodeScale = new Vec2(1, 1);
        const actualWidth = frameSize.width * Math.abs(nodeScale.x);
        const actualHeight = frameSize.height * Math.abs(nodeScale.y);

        const colliderSize = new Size(actualWidth * 0.7, actualHeight * 0.7);
        const offy = (colliderSize.height - this.node.getComponent(UITransform).contentSize.height)
        this.lqCollide.offset = new Vec2(0, offy);

        this.lqCollide.size = colliderSize;
    }

    /**
     * 怪物受到伤害
     * @param damage 伤害值
     * @param isCritical 是否暴击
     * @param showPopup 是否显示伤害数字
     * @param sourceHeroId 伤害来源英雄ID
     * @param hitPosition 受击位置（用于精确显示伤害数字）
     * @param damageColor 伤害数字颜色（可选）
     * @param isDotDamage 是否为dot伤害
     */
    public takeDamage(damage: number, isCritical: boolean = false,
        showPopup: boolean = true,
        sourceHeroId?: string,
        hitPosition?: Vec2,
        damageColor?: Color,
        isDotDamage: boolean = false) {
        // 显示被击中的变红特效
        if (!isDotDamage) {
            this.showHitEffect();
        }


        if (this.isDead) return;

        // 计算防御力减免
        let finalDamage = this.calculateDamageAfterDefense(damage);

        // 暴击伤害不受防御力影响（或者只受到50%防御力影响）
        if (isCritical) {
            // 暴击时防御力效果减半
            const defenseReduction = damage - finalDamage;
            finalDamage = damage - (defenseReduction * 0.5);
        }

        // 确保最小伤害为1（防止防御力过高导致0伤害）
        finalDamage = Math.max(1, Math.floor(finalDamage));

        this.currentHP -= finalDamage;



        if (showPopup && Popup.instance) {
            const popupPos = hitPosition ? hitPosition : new Vec2(this.node.position.x, this.node.position.y + 50);
            // 在最终位置基础上向上偏移30%的怪物高度
            popupPos.y += this.height * 0.3;
            Popup.instance.showDamage(finalDamage, popupPos, isCritical, damageColor);
        }

        if (sourceHeroId && finalDamage > 0) {
            DamageStatsManager.getInstance().recordDamage(sourceHeroId, finalDamage);
        }
        director.emit(game.gameEvent.GAME_BOOS_HP_UPDATE, {
            bossId: this.gameObject.bossId,
            hp: this.currentHP,
            maxHp: this.gameObject.maxhp,
            name: this.gameObject.name
        });
        this.updateHPBar();
        if (this.currentHP <= 0) {
            this.die();
        }
    }

    /**
     * 计算防御力减免后的伤害
     * @param originalDamage 原始伤害
     * @returns 减免后的伤害
     */
    private calculateDamageAfterDefense(originalDamage: number): number {
        if (!this.gameObject || !this.gameObject.defense) {
            return originalDamage;
        }

        const defense = this.gameObject.defense;

        // 防御力计算公式：伤害减免 = 防御力 / (防御力 + 100)
        // 这样防御力永远不会让伤害减少到0，但会显著降低伤害
        const damageReduction = defense / (defense + 100);
        const finalDamage = originalDamage * (1 - damageReduction);

        return finalDamage;
    }

    /**
     * 怪物死亡
     */
    private die() {
        if (this.isDead) return;

        this.isDead = true;
        // console.log('Monster: 怪物死亡');

        // 获取怪物死亡位置
        let deathPosition: Vec3 | null = null;
        if (this.node && this.node.isValid) {
            try {
                deathPosition = this.node.getWorldPosition().clone(); // clone 防止外部引用共享
            } catch (e) {
                console.warn('Monster: 获取死亡位置失败', e);
            }
        }


        // 发送经验值更新消息
        if (this.gameObject && this.gameObject.exp > 0) {
            director.emit(game.gameEvent.GAME_EXP_UPDATE, {
                exp: this.gameObject.exp,
                monsterId: this.gameObject.id,
                monsterLevel: this.gameObject.level,
                isBoss: this.gameObject.isBoss || false,
                bossId: this.gameObject.bossId || -1
            });
            // console.log(`Monster: 怪物死亡获得经验 ${this.gameObject.exp} 点`);
        }

        // 播放死亡效果 - 只使用EffectContainer的帧序列死亡动画
        const effectContainer = EffectContainer.getInstance();
        if (effectContainer) {
            // 直接传递 GameObject 而不是字符串类型
            // console.log(`Monster: 准备播放死亡效果 - GameObject: ${this.gameObject?.id}, 位置: (${deathPosition.x.toFixed(1)}, ${deathPosition.y.toFixed(1)})`);


            effectContainer.playMonsterDeathEffect(deathPosition, this.gameObject);
        } else {
            // console.warn('Monster: EffectContainer实例未找到，无法播放死亡效果');
        }

        // 停止所有行为
        this.currentState = MonsterState.IDLE;
        this.currentTargetHero = null;

        // 注意：不立即重置被击中状态，让击中特效播放完成
        // 击中特效会在updateHitEffect中自动结束

        // 禁用碰撞体
        if (this.lqCollide) {
            this.lqCollide.enable = false;
        }

        // 隐藏血量显示
        if (this.hpBarNode) {
            this.hpBarNode.active = false;
        }

        // 播放死亡动画（如果有的话）
        if (this.gameObject && this.gameObject.animationNames && this.gameObject.animationNames.length > 2) {
            // 播放死亡动画 - 使用自动循环判断（死亡动画不循环）
            // this.playAnimation(this.gameObject.animationNames[2]); // 通常死亡动画在第3个
        }

        // 延迟销毁节点
        // TODO_TIMEMANAGER: 此处使用scheduleOnce不受TimeManager控制，怪物死亡销毁延迟，暂停时仍会执行
        this.scheduleOnce(() => {
            if (this.node && this.node.isValid) {
                this.node.destroy();
            }
        }, 1.0); // 1秒后销毁
    }

    /**
     * 创建血量显示UI
     */
    private createHPBar() {
        // 创建血量显示容器节点
        this.hpBarNode = new Node('HPDisplay');
        this.hpBarNode.setParent(this.node);

        // 设置血量显示位置（怪物上方80像素）
        this.hpBarNode.setPosition(0, this.height + 20, 0);

        // 创建血量文字标签
        this.hpLabel = this.hpBarNode.addComponent(Label);
        const labelTransform = this.hpBarNode.addComponent(UITransform);
        labelTransform.setContentSize(200, 60); // 更大的显示区域

        // 配置标签
        this.hpLabel.string = `${this.currentHP}/${this.gameObject.maxhp}`;
        this.hpLabel.fontSize = 30; // 大号字体
        this.hpLabel.color = new Color(255, 255, 255, 255); // 白色文字
        this.hpLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        this.hpLabel.verticalAlign = Label.VerticalAlign.CENTER;

        // console.log(`Monster: 创建血量显示 - 当前血量: ${this.currentHP}/${this.gameObject.maxhp}`);
    }

    /**
     * 更新血量显示
     */
    private updateHPBar() {
        if (!this.hpLabel || !this.gameObject) return;
        // 更新文字
        this.hpLabel.string = `${this.currentHP}/${this.gameObject.maxhp}`;

        // 根据血量百分比改变文字颜色
        const hpPercent = this.currentHP / this.gameObject.maxhp;
        if (hpPercent > 0.6) {
            this.hpLabel.color = new Color(50, 255, 50, 255); // 绿色
        } else if (hpPercent > 0.3) {
            this.hpLabel.color = new Color(255, 255, 50, 255); // 黄色
        } else {
            this.hpLabel.color = new Color(255, 50, 50, 255); // 红色
        }
    }

    // 新增：开始击退动画
    public startKnockbackAnimation(force: number) {
        this.knockbackStartPos = this.node.position.clone();
        this.knockbackTargetPos = new Vec3(
            this.node.position.x,
            this.node.position.y + force,
            0
        );
        this.knockbackProgress = 0;
        // 如果之前是攻击状态，返回到移动状态
        if (this.currentState === MonsterState.ATTACKING) {
            this.currentState = MonsterState.MOVING;
        }
    }

    // 修改：设置击退状态 强制击退 不考虑免疫击退效果
    public setKnockback(force: number = 0, knockbackDir?: Vec2, force_immunity: boolean = false) {
        // 检查是否免疫击退效果
        if (this.isImmuneToControlEffect("knockback") && !force_immunity) {
            // console.log(`${this.gameObject?.id || 'Monster'} 免疫击退效果`);
            return;
        }
        // 检查是否可以应用新的击退效果
        // 条件：1. 不在冷却中, 或者 2. 新的力大于当前的力
        // 如果force_immunity为true 则不考虑冷却时间
        if (force_immunity) {
            this.isKnockingBack = true;
            this.knockbackCooldownTimer = 0;
            // 距离累加 叠加击退距离 衰减
            if (this.currentKnockbackForce > 0) {
                force = this.currentKnockbackForce + force * 0.25;
            } else {
                force = this.currentKnockbackForce + force;
            }

            // force = this.currentKnockbackForce+force;
        }
        if (!this.isKnockingBack || force >= this.currentKnockbackForce) {

            // 停止任何正在进行的旧击退动画
            if (this.knockbackTween) {
                this.knockbackTween.stop();
                this.knockbackTween = null;
            }

            // 更新状态
            this.isKnockingBack = true;
            // 动态计算冷却时间
            this.knockbackCooldownTimer = this.BASE_KNOCKBACK_COOLDOWN + (force * this.KNOCKBACK_FORCE_TO_COOLDOWN_RATIO);
            this.currentKnockbackForce = force;
            // 最大击退距离
            // this.currentKnockbackForce = Math.min(this.currentKnockbackForce,this.MAX_KNOCKBACK_FORCE);

            let direction: Vec2;
            // 如果提供了方向向量，并且它不是一个零向量，就使用它
            if (knockbackDir && knockbackDir.lengthSqr() > 0) {
                direction = knockbackDir.normalize();
            } else {
                // 否则（没有提供方向或方向是零向量），生成一个随机方向
                const randomAngle = Math.random() * 2 * Math.PI;
                direction = new Vec2(Math.cos(randomAngle), Math.sin(randomAngle));
            }

            // 应用新的击退动画
            const startPos = this.node.position.clone();
            const offset = new Vec3(direction.x * force, direction.y * force, 0);
            const targetPos = startPos.add(offset);

            this.knockbackTween = tween(this.node)
                .to(0.2, { position: targetPos }, { easing: 'quadOut' })
                .call(() => {
                    this.knockbackTween = null;
                    // 动画结束，但不立即重置状态，等待冷却结束
                })
                .start();
        }
    }

    /**
     * 检查是否对控制效果免疫
     * @param effectType 控制效果类型："knockback" | "stun" | "slow" | "entangle" | "all"
     * @returns true表示免疫该效果，false表示受影响
     */
    public isImmuneToControlEffect(effectType: string = "all"): boolean {
        // Boss对所有控制效果免疫
        if (this.gameObject?.isBoss) {
            return true;
        }

        // 未来可以扩展特定怪物的免疫配置
        // 例如：某些精英怪物可能对特定效果免疫
        const immuneConfig = this.getImmuneConfig();

        if (effectType === "all") {
            // 检查是否对所有控制效果免疫
            return immuneConfig.knockback && immuneConfig.stun &&
                immuneConfig.slow && immuneConfig.entangle;
        }

        return immuneConfig[effectType] || false;
    }

    /**
     * 获取怪物的免疫配置
     * 未来可以根据怪物ID、类型等进行配置
     */
    private getImmuneConfig(): { [key: string]: boolean } {
        // 默认配置：普通怪物不免疫任何效果
        const defaultConfig = {
            knockback: false,
            stun: false,
            slow: false,
            entangle: false
        };

        // 可以根据怪物属性定制化配置
        if (this.gameObject?.isBoss) {
            // Boss免疫所有控制效果
            return {
                knockback: true,
                stun: true,
                slow: true,
                entangle: true
            };
        }

        // 未来可以添加其他特殊怪物的配置
        // 例如：根据怪物ID或类型设置不同的免疫效果
        // if (this.gameObject?.id === "stone_golem") {
        //     return { ...defaultConfig, knockback: true }; // 石头巨魔免疫击退
        // }

        return defaultConfig;
    }

    /**
     * 应用眩晕效果
     * @param duration 持续时间（秒）
     */
    public applyStun(duration: number, force: boolean = false): void {
        if (this.isDead) return;

        // 检查是否免疫眩晕效果
        if (this.isImmuneToControlEffect("stun") && !force) {
            // console.log(`${this.gameObject?.id || 'Monster'} 免疫眩晕效果`);
            return;
        }

        this.isStunned = true;
        this.showStunEffect(); // 显示眩晕特效

        // 【新增】触发眩晕特效颜色
        this.triggerEffectColor(this.stunEffectColor);

        // 刷新或增加持续时间
        this.stunTimer = Math.max(this.stunTimer, duration);
    }

    /**
     * 新增：应用缠绕效果
     * @param duration 持续时间（秒）
     */
    public applyEntangle(duration: number): void {
        if (this.isDead) return;

        // 检查是否免疫缠绕效果
        if (this.isImmuneToControlEffect("entangle")) {
            // console.log(`${this.gameObject?.id || 'Monster'} 免疫缠绕效果`);
            return;
        }

        this.isEntangled = true;
        this.entangleTimer += duration;

        // if (this.currentState !== MonsterState.ATTACKING) {
        // 只有在非攻击状态下，缠绕才会暂停动画
        // if (this.spine) {
        //     this.spine.paused = true;
        // } else if(this.animation){
        //     this.animation.pause();
        // }
        // }

        // 显示缠绕特效
        this.showEntangleEffect();

        // 【新增】触发缠绕特效颜色
        this.triggerEffectColor(this.entangleEffectColor);
    }

    /**
     * 应用减速效果
     * @param percent 减速百分比 (例如 30)
     * @param duration 持续时间（秒）
     */
    public applySlow(percent: number, duration: number): void {
        if (this.isDead) return;

        // 检查是否免疫减速效果
        if (this.isImmuneToControlEffect("slow")) {
            // console.log(`${this.gameObject?.id || 'Monster'} 免疫减速效果`);
            return;
        }

        this.isSlowed = true;
        this.slowTimer = Math.max(this.slowTimer, duration);
        // 【修复】限制减速效果最大为99%，防止怪物反方向移动
        const clampedPercent = Math.min(percent, 99);
        this.slowFactor = 1 - (clampedPercent / 100);

        // 【新增】触发缓慢特效颜色
        this.triggerEffectColor(this.slowEffectColor);
    }

    /**
     * 应用DOT（持续伤害）效果，如燃烧、中毒
     * @param dotData 效果数据 { type, damage, duration, interval }
     */
    public applyDot(dotData: any): void {
        if (this.isDead) return;
        const existingDot = this.activeDots.find(d => d.type === dotData.type);
        if (existingDot) {
            // 【修改】累加伤害并更新持续时间
            existingDot.damage += dotData.damage; // 累加伤害
            existingDot.duration = Math.max(existingDot.duration, dotData.duration); // 取更长的持续时间
            if (dotData.heroId) existingDot.heroId = dotData.heroId;
        } else {
            this.activeDots.push({ ...dotData, timer: 0 });
        }
    }

    /**
     * 在 Update 中调用，用于更新所有状态效果
     * @param dt 已经经过时间缩放的deltaTime
     */
    private updateStatusEffects(dt: number) {
        // dt 已经在 update() 方法中经过时间缩放，直接使用
        const scaledDt = dt;



        // 更新击退冷却
        if (this.isKnockingBack) {
            this.knockbackCooldownTimer -= scaledDt;
            if (this.knockbackCooldownTimer <= 0) {
                this.isKnockingBack = false;
                // 【修复】击退恢复后重新播放正确的动画
                this.currentKnockbackForce = 0; // 重置当前击退力
                this.resumeFromKnockback();
            }
        }

        // 更新眩晕状态
        if (this.isStunned) {
            this.stunTimer -= scaledDt;
            if (this.stunTimer <= 0) {
                this.isStunned = false;
                // 【修复】眩晕恢复后重新播放正确的动画


                this.resumeFromStun();
                this.hideStunEffect();
                // 【新增】解除眩晕特效颜色
                this.clearEffectColor();
            } else {
                return; // 眩晕时，不执行后续逻辑
            }
        }

        // 更新缠绕状态
        if (this.isEntangled) {
            this.entangleTimer -= scaledDt;
            if (this.entangleTimer <= 0) {
                this.isEntangled = false;
                // 恢复动画
                this.resumeFromStun();
                this.hideEntangleEffect();
                // 【新增】解除缠绕特效颜色
                this.clearEffectColor();
            } else if (this.currentState !== MonsterState.ATTACKING) {
                return; // 缠绕时如果不在攻击，则不移动
            }
        }

        // 更新减速状态
        if (this.isSlowed) {
            this.slowTimer -= scaledDt;
            if (this.slowTimer <= 0) {
                this.isSlowed = false;
                this.slowFactor = 1.0;
                // 【新增】解除减速特效颜色
                this.clearEffectColor();
            }
        }

        // 更新DOT效果
        for (let i = this.activeDots.length - 1; i >= 0; i--) {
            const dot = this.activeDots[i];
            dot.duration -= scaledDt;
            dot.timer += scaledDt;

            if (dot.duration <= 0) {
                this.activeDots.splice(i, 1);
                continue;
            }

            if (dot.timer >= dot.interval) {
                dot.timer -= dot.interval;

                // 定义DOT类型与颜色的映射
                const dotColorMap: { [key: string]: Color } = {
                    'fire': new Color(255, 99, 71),   // 火焰 = 番茄色
                    'poison': new Color(138, 43, 226), // 剧毒 = 紫罗兰色
                };

                const dotColor = dotColorMap[dot.type];

                // 【修复】DOT伤害按怪物最大血量百分比计算，限制在1-500点范围内
                const maxHp = this.gameObject?.maxhp || 100;
                const percentDamage = Math.floor(maxHp * (dot.damage / 100));
                const finalDotDamage = Math.min(Math.max(1, percentDamage), 500); // 限制在1-500点范围内

                //如果是boss 
                const hideffect = this.gameObject?.isBoss ? true : false;
                this.takeDamage(finalDotDamage, false, true, dot.heroId, undefined, dotColor, hideffect);
            }
        }
    }

    private showStunEffect(): void {
        let stunEffectNode = this.node.getChildByName('StunEffect');
        if (stunEffectNode) {
            stunEffectNode.active = true;
        } else {
            // console.warn('Stun effect node "StunEffect" not found');
        }
    }

    private hideStunEffect(): void {
        const stunEffectNode = this.node.getChildByName('StunEffect');
        if (stunEffectNode) {
            stunEffectNode.active = false;
        }
    }

    /** 新增：显示和隐藏缠绕特效的方法 */
    private showEntangleEffect(): void {
        let entangleEffectNode = this.node.getChildByName('EntangleEffect');
        if (entangleEffectNode) {
            entangleEffectNode.active = true;
        } else {
            // console.warn('Entangle effect node "EntangleEffect" not found. Please add it to the monster prefab.');
        }
    }

    private hideEntangleEffect(): void {
        const entangleEffectNode = this.node.getChildByName('EntangleEffect');
        if (entangleEffectNode) {
            entangleEffectNode.active = false;
        }
    }



    /**
     * 从眩晕状态恢复，重新播放正确的动画
     */
    private resumeFromStun(): void {
        // 根据当前状态播放对应的动画
        if (this.currentState === MonsterState.ATTACKING) {
            // 如果是攻击状态，播放攻击动画
            if (this.gameObject?.animationNames && this.gameObject.animationNames.length > 1) {
                this.playAnimation(this.gameObject.animationNames[1], false);
            }
        } else {
            // 其他状态（移动、巡逻、报到）都播放移动动画
            if (this.gameObject?.animationNames && this.gameObject.animationNames.length > 0) {
                this.playAnimation(this.gameObject.animationNames[0], true);
            }
        }
    }

    /**
     * 从击退状态恢复，重新播放正确的动画
     */
    private resumeFromKnockback(): void {
        // 根据当前状态播放对应的动画
        if (this.currentState === MonsterState.ATTACKING || this.currentState === MonsterState.MOVINGATTACK) {
            // 如果是攻击状态，播放攻击动画
            if (this.gameObject?.animationNames && this.gameObject.animationNames.length > 1) {
                this.playAnimation(this.gameObject.animationNames[1], false);
            }
        } else if (this.currentState === MonsterState.MOVING ||
            this.currentState === MonsterState.PATROL ||
            this.currentState === MonsterState.REPORTING) {
            // 移动相关状态播放移动动画
            if (this.gameObject?.animationNames && this.gameObject.animationNames.length > 0) {
                this.playAnimation(this.gameObject.animationNames[0], true);
            }
        }
    }

    /**
     * 为怪物添加透视缩放效果
     */
    private addPerspectiveScaler(): void {
        // 检查是否已经有透视缩放组件
        let perspectiveScaler = this.node.getComponent(PerspectiveScaler);
        if (!perspectiveScaler) {
            // 如果没有，则动态添加组件
            perspectiveScaler = this.node.addComponent(PerspectiveScaler);
        }

        // 配置透视缩放参数
        if (perspectiveScaler) {
            perspectiveScaler.enablePerspectiveScale = true;
            perspectiveScaler.startScale = 1.0;  // 起始缩放（怪物出生时）
            perspectiveScaler.endScale = 0.6;    // 结束缩放（到达目标区域时）
            perspectiveScaler.useWallManagerConfig = true; // 使用WallManager自动配置
            perspectiveScaler.enableAlphaFade = true;       // 启用透明度渐变
            perspectiveScaler.alphaFadeDistance = 250;       // 透明度渐变距离

        }
    }

    /**
     * 触发怪物被击中的shader特效
     */
    private showHitEffect(): void {
        // 如果在冷却中，不触发新的被击中效果
        // if (this.hitCooldownTimer > 0) {
        //     console.log('Monster: 击中特效冷却中');
        //     return;
        // }

        // 开始被击中效果
        this.isHit = true;
        this.hitTimer = this.HIT_EFFECT_DURATION;
        this.hitCooldownTimer = this.HIT_COOLDOWN_DURATION;
        this.hitMedian = this.HIT_EFFECT_DURATION / 2;

        // 确保击中材质已初始化
        if (!this.isHitMaterialApplied) {
            this.initHitEffectMaterial();
        }

        // 初始化shader参数
        this.initHitShaderParams();

        // 【新增】触发通用受击特效颜色（红色）
        this.triggerEffectColor(this.hitFlashColor);
    }

    /**
     * 初始化击中特效的shader参数
     */
    private initHitShaderParams(): void {
        if (this.independentHitMaterial) {
            // 设置闪光强度为0（开始闪光）
            this.independentHitMaterial.setProperty("u_rate", 0);
        }
    }

    /**
     * 更新被击中特效状态
     * @param dt 时间增量
     */
    private updateHitEffect(dt: number): void {
        if (!this.isHit || !this.independentHitMaterial) {
            return;
        }

        // 使用TimeManager的deltaTime确保时间一致性
        const deltaTime = dt
        // TimeManager.getInstance().getDeltaTime(dt);

        this.hitTimer -= deltaTime;

        if (this.hitTimer <= 0) {
            // 击中效果结束，重置为原始状态
            this.isHit = false;
            this.resetHitShaderParams();
            return;
        }

        // 计算闪光强度：从0开始，到结束达到最大值1，然后消失
        const progress = (this.HIT_EFFECT_DURATION - this.hitTimer) / this.HIT_EFFECT_DURATION;
        const rate = progress; // 0 -> 1

        // 更新shader参数
        this.updateHitShaderRate(rate);
    }

    /**
     * 更新击中特效的shader参数
     */
    private updateHitShaderRate(rate: number): void {
        if (this.gameObject?.resourceType === 'spine' && this.spine) {
            const spine: any = this.spine;
            const cache = spine._materialCache;
            for (let i in cache) {
                cache[i].setProperty("u_rate", rate);
                // cache[i].setProperty("hit_color", this.hitFlashColor);
            }
        } else if (this.sprite) {
            if (this.independentHitMaterial) {
                this.independentHitMaterial.setProperty("u_rate", rate);
                // this.independentHitMaterial.setProperty("hit_color", this.hitFlashColor);
            }
        }
    }

    /**
     * 重置击中特效的shader参数
     */
    private resetHitShaderParams(): void {
        // 重置击中颜色 必须调用updateHitShaderRate    
        this.updateHitShaderRate(1);
    }

    /**
     * 【新增】更新特效颜色状态
     * @param dt 时间增量
     */
    private updateEffectColor(dt: number): void {
        if (!this.currentEffectColor || !this.independentHitMaterial) {
            return;
        }

        this.effectColorTimer -= dt;

        if (this.effectColorTimer <= 0) {
            // 特效颜色结束，重置为原始状态
            this.currentEffectColor = null;
            this.resetEffectColor();
            return;
        }

        // 计算颜色强度：从0开始，到结束达到最大值1，然后消失
        const progress = (this.EFFECT_COLOR_DURATION - this.effectColorTimer) / this.EFFECT_COLOR_DURATION;
        const rate = progress; // 0 -> 1

        // 更新特效颜色
        this.updateEffectShaderColor(rate);
    }

    /**
     * 【新增】重置特效颜色
     */
    private resetEffectColor(): void {
        // 重置特效颜色为原始状态
        this.updateEffectShaderColor(1);
    }

    /**
     * 【新增】更新特效颜色的shader参数
     */
    private updateEffectShaderColor(rate: number): void {
        if (this.gameObject?.resourceType === 'spine' && this.spine) {
            const spine: any = this.spine;
            const cache = spine._materialCache;
            for (let i in cache) {
                // 当currentEffectColor为null时，使用默认的白色或原始颜色
                const colorToUse = this.currentEffectColor || new Color(255, 255, 255, 255);
                cache[i].setProperty("hit_color", colorToUse);
                cache[i].setProperty("u_rate", rate);
            }
        } else if (this.sprite) {
            if (this.independentHitMaterial) {
                // 当currentEffectColor为null时，使用默认的白色或原始颜色
                const colorToUse = this.currentEffectColor || new Color(255, 255, 255, 255);
                this.independentHitMaterial.setProperty("hit_color", colorToUse);
                this.independentHitMaterial.setProperty("u_rate", rate);
            }
        }
    }

    /**
     * 【新增】触发特效颜色
     * @param effectColor 特效颜色
     */
    private triggerEffectColor(effectColor: Color): void {
        // 确保击中材质已初始化
        if (!this.isHitMaterialApplied) {
            this.initHitEffectMaterial();
        }

        // 设置特效颜色
        this.currentEffectColor = effectColor;
        this.effectColorTimer = this.EFFECT_COLOR_DURATION;

        // 初始化特效颜色参数
        this.initEffectColorParams();
    }

    /**
     * 【新增】初始化特效颜色的shader参数
     */
    private initEffectColorParams(): void {
        if (this.independentHitMaterial && this.currentEffectColor) {
            // 设置特效颜色强度为0（开始特效）
            this.independentHitMaterial.setProperty("u_rate", 0);
            this.independentHitMaterial.setProperty("hit_color", this.currentEffectColor);
        }
    }

    /**
     * 【新增】解除特效颜色
     */
    private clearEffectColor(): void {
        // 重置特效颜色状态
        this.currentEffectColor = null;
        this.effectColorTimer = 0;
        this.updateEffectShaderColor(1);
    }

    /**
     * 【新增】获取怪物的资源key
     * @returns 怪物的资源key字符串
     */
    public getMonsterResourceKey(): string {
        if (!this.gameObject) {
            console.warn('Monster: gameObject不存在，无法获取资源key');
            return '';
        }

        // 如果是boss，从resourceDir中提取最后的key
        if (this.gameObject.isBoss && this.gameObject.resourceDir) {
            // 从resourceDir中提取最后的key，例如 "spine/boss/b_1_0_3" -> "b_1_0_3"
            const pathParts = this.gameObject.resourceDir.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            return lastPart;
        }

        // 如果是普通怪物，返回第一个动画名称
        if (this.gameObject.animationNames && this.gameObject.animationNames.length > 0) {
            return this.gameObject.animationNames[0];
        }

        console.warn('Monster: 无法获取怪物资源key，gameObject数据不完整');
        return '';
    }
}
