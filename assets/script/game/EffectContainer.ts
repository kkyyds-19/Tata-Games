import { _decorator, Component, Node, Prefab, instantiate, Vec3, resources, Animation, AnimationClip, tween, UITransform, Sprite } from 'cc';
import { GameObject } from './object/GameObject';
import { ParticleSystem2D } from 'cc';
const { ccclass, property } = _decorator;

/**
 * EffectContainer 效果容器
 * 管理小怪死亡动画、爆炸效果等特效
 */
@ccclass('EffectContainer')
export class EffectContainer extends Component {
    private static _instance: EffectContainer;

    /** 死亡效果预制体 (小怪与Boss共用) */
    @property(Prefab)
    deathEffectPrefab: Prefab = null;

    /** 爆炸效果预制体 */
    @property(Prefab)
    explosionEffectPrefab: Prefab = null;

   

    // 效果对象池
    private deathEffectPool: Node[] = [];
    private explosionEffectPool: Node[] = [];
    
    // 池子大小限制
    private readonly MAX_POOL_SIZE = 500;

    onLoad() {
        EffectContainer._instance = this;
        
       
    }

    public static getInstance(): EffectContainer {
        return EffectContainer._instance;
    }

    /**
     * 播放小怪死亡效果
     * @param position 死亡位置（世界坐标）
     * @param gameObject 怪物游戏对象，用于判断是否为Boss
     */
    public playMonsterDeathEffect(position: Vec3, gameObject?: GameObject) {
        // console.log(`EffectContainer: 收到死亡效果请求 - 类型: ${gameObject?.id}, 位置: (${position.x.toFixed(1)}, ${position.y.toFixed(1)})`);
        
        const effectNode = this.getDeathEffectNode();
        if (!effectNode||!effectNode.isValid) {
            console.warn('EffectContainer: 无法创建死亡效果节点，跳过死亡效果');
            return;
        }

        if(!position){
            return
        }
       

        // console.log(`EffectContainer: 成功创建效果节点: ${effectNode.name}`);

        // 设置效果位置
        effectNode.setWorldPosition(position);
        effectNode.active = true;

        // 获取帧序列动画组件（用户指出动画在名为 'Sprite' 的子节点上）
        const spriteNode = effectNode.getChildByName('Sprite');
        let animation = spriteNode ? spriteNode.getComponent(Animation) : null;
        
        // 如果在子节点上没有找到，作为备用方案，尝试在根节点上查找
        if (!animation) {
            animation = effectNode.getComponent(Animation);
        }

        if (animation) {
            // 从对象池中取出的节点可能残留上次动画的最后状态，
            // 因此在播放前先调用 stop() 来重置动画到初始状态。
            animation.stop();
            // 播放死亡动画
            const animName = this.getDeathAnimationName(gameObject);
            // const animName = 'monster_die';
            // console.log(`EffectContainer: 播放帧序列动画: ${animName}`);
            animation.play(animName);
            
            // 动画播放完成后回收节点
            animation.once(Animation.EventType.FINISHED, () => {
                // console.log(`EffectContainer: 帧序列动画播放完成，回收节点`);
                this.recycleDeathEffectNode(effectNode);
            });
            
            // 设置备用回收时间
            // TODO_TIMEMANAGER: 此处使用scheduleOnce不受TimeManager控制，死亡效果备用回收，暂停时仍会执行
            this.scheduleOnce(() => {
                if (effectNode && effectNode.isValid && effectNode.active) {
                    // console.log(`EffectContainer: 备用回收触发`);
                    this.recycleDeathEffectNode(effectNode);
                }
            }, 2.0);
        } else {
            // 如果没有帧序列动画，使用简单的渐隐效果
            console.log(`EffectContainer: 没有找到Animation组件（包括子节点），使用简单死亡效果`);
            //  this.playSimpleDeathEffect(effectNode, gameObject);
        }

        // console.log(`EffectContainer: 死亡效果处理完成`);
    }

    /**
     * 播放爆炸效果
     * @param position 爆炸位置（世界坐标）
     * @param scale 爆炸规模 (默认1.0)
     */
    public playExplosionEffect(position: Vec3, scale: number = 1.0) {
        const effectNode = this.getExplosionEffectNode();
        if (!effectNode||!effectNode.isValid) {
            console.warn('无法创建爆炸效果节点');
            return;
        }

        // 设置效果位置和缩放
        effectNode.setWorldPosition(position);
        effectNode.setScale(scale, scale, 1);
        effectNode.active = true;

        // 【新增】重置粒子系统
        this.resetParticleSystem(effectNode);

        // 获取帧序列动画组件（用户指出动画在名为 'Sprite' 的子节点上）
        const spriteNode = effectNode.getChildByName('Sprite');
        let animation = spriteNode ? spriteNode.getComponent(Animation) : null;

        // 如果在子节点上没有找到，作为备用方案，尝试在根节点上查找
        if (!animation) {
            animation = effectNode.getComponent(Animation);
        }

        if (animation) {
            // 从对象池中取出的节点可能残留上次动画的最后状态，
            // 因此在播放前先调用 stop() 来重置动画到初始状态。
            animation.stop();
            // 播放爆炸动画
            animation.play('boom_small');
            
            // 动画播放完成后回收节点
            animation.once(Animation.EventType.FINISHED, () => {
                this.recycleExplosionEffectNode(effectNode);
            });
            
            // 设置备用回收时间
            // TODO_TIMEMANAGER: 此处使用scheduleOnce不受TimeManager控制，爆炸效果备用回收，暂停时仍会执行
            this.scheduleOnce(() => {
                if (effectNode && effectNode.isValid && effectNode.active) {
                    this.recycleExplosionEffectNode(effectNode);
                }
            }, 1.0);
        } else {
           
        }

        console.log(`播放爆炸效果，位置: ${position.x.toFixed(1)}, ${position.y.toFixed(1)}, 规模: ${scale}`);
    }

    /**
     * 批量播放爆炸效果（用于连锁爆炸）
     * @param positions 爆炸位置数组
     * @param interval 间隔时间（秒）
     * @param scale 爆炸规模
     */
    public playChainExplosion(positions: Vec3[], interval: number = 0.1, scale: number = 1.0) {
        positions.forEach((pos, index) => {
            // TODO_TIMEMANAGER: 此处使用scheduleOnce不受TimeManager控制，连锁爆炸延迟，暂停时仍会执行
            this.scheduleOnce(() => {
                this.playExplosionEffect(pos, scale);
            }, index * interval);
        });
    }

    /**
     * 获取死亡效果节点（从对象池或创建新的）
     */
    private getDeathEffectNode(): Node | null {
        // 尝试从对象池获取
        if (this.deathEffectPool.length > 0) {
            return this.deathEffectPool.pop()!;
        }

        // 对象池为空，创建新节点
        if (this.deathEffectPrefab) {
            const node = instantiate(this.deathEffectPrefab);
            node.parent = this.node;
            node.active = false;
            return node;
        }

        // 没有预制体，不创建任何效果
        console.warn(`EffectContainer: 没有配置死亡效果预制体，跳过死亡效果`);
        return null;
    }

    /**
     * 获取爆炸效果节点（从对象池或创建新的）
     */
    private getExplosionEffectNode(): Node | null {
        // 尝试从对象池获取
        if (this.explosionEffectPool.length > 0) {
            return this.explosionEffectPool.pop()!;
        }

        // 对象池为空，创建新节点
        if (this.explosionEffectPrefab) {
            const node = instantiate(this.explosionEffectPrefab);
            node.parent = this.node;
            node.active = false;
            return node;
        }

        // 没有预制体，创建简单效果节点
        return this.createSimpleExplosionEffect();
    }

    /**
     * 回收死亡效果节点到对象池
     */
    private recycleDeathEffectNode(node: Node) {
        node.active = false;
        
        if (this.deathEffectPool.length < this.MAX_POOL_SIZE) {
            this.deathEffectPool.push(node);
        } else {
            node.destroy();
        }
    }

    /**
     * 回收爆炸效果节点到对象池
     */
    private recycleExplosionEffectNode(node: Node) {
        node.active = false;
        if (this.explosionEffectPool.length < this.MAX_POOL_SIZE) {
            this.explosionEffectPool.push(node);
        } else {
            node.destroy();
        }
    }

    /**
     * 判断是否为Boss类型
     */
    private isBossType(gameObject?: GameObject): boolean {
        return gameObject?.isBoss === true;
    }

    /**
     * 根据怪物类型获取死亡动画名称
     */
    private getDeathAnimationName(gameObject?: GameObject): string {
        if (this.isBossType(gameObject)) {
            return 'boss_die'; // Boss死亡动画
        } else {
            return 'monster_die'; // 小怪死亡动画
        }
    }

    /**
     * 创建简单的死亡效果节点
     */
    private createSimpleDeathEffect(): Node {
        const node = new Node('SimpleDeathEffect');
        node.parent = this.node;
        node.active = false;
        
        // 为了让死亡效果可见，添加一个简单的白色方块作为占位符
        const uiTransform = node.addComponent(UITransform);
        uiTransform.setContentSize(50, 50);
        
        const sprite = node.addComponent(Sprite);
        // 使用白色材质作为占位符
        // sprite.color = new Color(255, 255, 255, 255);    
        
        console.log('创建简单死亡效果节点，包含占位符精灵');
        
        return node;
    }

    /**
     * 创建简单的爆炸效果节点
     */
    private createSimpleExplosionEffect(): Node {
        const node = new Node('SimpleExplosionEffect');
        node.parent = this.node;
        node.active = false;
        
        // 可以在这里添加粒子系统或其他组件
        
        return node;
    }

    /**
     * 播放简单的死亡效果（无帧序列动画时使用）
     */
    private playSimpleDeathEffect(effectNode: Node, gameObject?: GameObject) {
        if (!effectNode) {
            console.warn('死亡效果节点为空，跳过简单死亡效果');
            return;
        }

        console.log('播放简单死亡效果：放大并消失');
        
        // 安全的简单死亡效果：只使用缩放，避免复杂的tween
        try {
            // 设置初始状态
            effectNode.setScale(0.5, 0.5, 1);
            
            // 使用简单的缩放动画
            // TODO_TIMEMANAGER: 此处使用tween不受TimeManager控制，死亡效果动画，暂停时仍会执行
            tween(effectNode)
                .to(0.3, { scale: new Vec3(2.0, 2.0, 1) })
                .to(0.2, { scale: new Vec3(0, 0, 1) })
                .call(() => {
                    console.log('简单死亡效果完成，回收节点');
                    if (effectNode && effectNode.isValid) {
                        this.recycleDeathEffectNode(effectNode);
                    }
                })
                .start();
        } catch (error) {
            console.error('简单死亡效果出错:', error);
            // 直接回收
            // TODO_TIMEMANAGER: 此处使用scheduleOnce不受TimeManager控制，死亡效果错误回收，暂停时仍会执行
            this.scheduleOnce(() => {
                if (effectNode && effectNode.isValid) {
                    this.recycleDeathEffectNode(effectNode);
                }
            }, 0.1);
        }
    }


    /**
     * 【新增】重置粒子系统
     * @param effectNode 效果节点
     */
    private resetParticleSystem(effectNode: Node): void {
        // 查找名为 'particle' 的子节点
        const particleNode = effectNode.getChildByName('particle');
        if (particleNode) {
            // 获取 ParticleSystem2D 组件
            const particleSystem = particleNode.getComponent(ParticleSystem2D) 
            if (particleSystem) {
                // 重置粒子系统
                particleSystem.resetSystem();
            } else {
                // console.warn('EffectContainer: 未找到 ParticleSystem2D 组件');
            }
        } else {
            // console.warn('EffectContainer: 未找到 particle 子节点');
        }
    }

 

    /**
     * 清理所有效果对象池
     */
    public clearAllPools() {
        // 清理小怪死亡效果池
        this.deathEffectPool.forEach(node => {
            if (node && node.isValid) {
                node.destroy();
            }
        });
        this.deathEffectPool = [];

        // 清理爆炸效果池
        this.explosionEffectPool.forEach(node => {
            if (node && node.isValid) {
                node.destroy();
            }
        });
        this.explosionEffectPool = [];
    }

    onDestroy() {
        this.clearAllPools();
    }
} 