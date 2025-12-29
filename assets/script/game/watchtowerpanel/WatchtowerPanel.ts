import { _decorator, Component, Node, Sprite, Label, ProgressBar, sp,  resources, Vec3,Animation, AnimationClip} from 'cc';
import { WatchtowerConfig, watchtowerConfigs } from '../../global/config/WatchtowerConfig';
import { UserWatchtowerData, UserWatchtowerItem } from '../../user/UserWatchtowerData';
import { animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WatchtowerPanel')
export class WatchtowerPanel extends Component {
      @property(Sprite)
    public class_bg: Sprite | null = null;

    @property(Sprite)
    public class_icon: Sprite | null = null;
    @property(Label)
    public level: Label | null = null;
    @property(ProgressBar)
    public skill_bar: ProgressBar | null = null;
    @property(ProgressBar)
    public hp_bar: ProgressBar | null = null;

     @property(Animation)
    public animation: Animation | null = null;
    
    @property(Sprite)
    public aniSprite: Sprite | null = null;
   
    @property(Node)
    public hero_pos: Node | null = null; // 英雄动画挂载点

    @property(Node)
    public info_bg: Node | null = null; // 

    @property(Node)
    public attack_area: Node | null = null; // 英雄受击区域
  
    public spine: sp.Skeleton | null = null; // Spine 动画组件

    public watchtower:UserWatchtowerItem | null = null;

    public watchtowerData:WatchtowerConfig | null = null;

    // 【新增】技能冷却相关属性
    public skillCurrent: number = 0;  // 当前技能冷却时间
    public skillCooldown: number = 999999; // 技能冷却时间（秒）
    public isDead: boolean = false; // 是否死亡
    public loadDone: boolean = false; // 加载资源完成
    public isOpen: boolean = false; // 是否开启


    //血量
    public maxhp: number = 0;   
    //当前血量
    public hp: number = 0;   

    protected onLoad(): void {
          this.close();
    }

    protected onDestroy(): void {


    }

    public initPanelData(watchtower:UserWatchtowerItem){
        this.watchtower=watchtower    
        this.open()
        this.watchtowerData=watchtowerConfigs.find(config => config.id === watchtower.id)

        // 【新增】初始化技能冷却时间
        // this.initSkillCooldown();

        // //加载spine
        // this.loadSpine()
      
        // //更新血量
        // this.updateHp()

        //加载哨塔
        this.loadWatchtower();
    }

    private loadWatchtower(){
        if (!this.watchtowerData) {
            console.error("watchtowerPanel: 伙伴数据不存在->", this.watchtower.id);
            return;
        }
        
        if (!this.class_bg || !this.class_bg.spriteAtlas) {
            console.warn("[class_bg] 背景Sprite或其图集未设置");
            return;
        }

        let frameName = this.watchtowerData.iconFrameName;
        // let frameName = `watchtower_0${this.watchtower.id}`;//"watchtower_0"+this.watchtower.id; //哨塔等级
        
        
        const spriteFrame = this.class_bg.spriteAtlas.getSpriteFrame(frameName);
        if (spriteFrame) {
            this.class_bg.spriteFrame = spriteFrame;
        } else {
            console.warn(`[watchtowerPanel] 在图集中未找到背景框: ${frameName}`);
        }
        

        this.playAnimation();
    }

    private updateHp(): void {
        if (!this.watchtowerData) {
            console.error("watchtowerPanel: 伙伴数据不存在->", this.watchtower.id);
            return;
        }

        const hpBonus= UserWatchtowerData.getInstance().getPartnerActualBonuses(this.watchtower.id).hpBonus
        //百分比
        this.maxhp=this.watchtowerData.maxhp+ this.watchtowerData.maxhp*hpBonus
        this.hp=this.maxhp
        this.hp_bar.progress=this.hp/this.maxhp 

    }

    playAnimation() {
        if (!this.animation || !this.watchtowerData) return;
        const id = this.watchtowerData.id;
        let clipName = 'Watchtower';
        if (id === 10012) clipName = 'Watchtower_1';
        else if (id === 10016) clipName = 'Watchtower_3';
        else if (id === 10017) clipName = 'Watchtower_4';
        else if (id === 10018) clipName = 'Watchtower_2';

        const existing = (this.animation as any).clips?.find((c: AnimationClip) => c && c.name === clipName);
        if (existing) { existing.wrapMode = AnimationClip.WrapMode.Loop; this.animation.play(clipName); return; }

        resources.load(`anim/img/${clipName}`, AnimationClip, (err, clip) => {
            if (err || !clip || !this.animation) { this.animation.play('Watchtower'); return; }
            clip.wrapMode = AnimationClip.WrapMode.Loop;
            (this.animation as any).createState(clip, clipName);
            this.animation.play(clipName);
        });
    }

    // /**
    //  * 【新增】初始化技能冷却时间
    //  */
    // private initSkillCooldown(): void {
    //     if (this.watchtowerData) {
    //         // 将配置中的cooldown从秒转换为实际冷却时间
    //         this.skillCooldown = this.watchtowerData.cooldown;
    //         this.skillCurrent = 0; // 初始化为0，立即可以释放技能
    //         // console.log(`[watchtowerPanel] 伙伴 ${this.watchtowerData.name} 技能冷却时间: ${this.skillCooldown}秒`);
    //     }
    // }

    // private loadSpine(): void {
    //     if (!this.watchtowerData) {
    //         console.error("watchtowerPanel: 伙伴数据不存在->", this.watchtower.id);
    //         return;
    //     }

    //     const scene = this.node.scene;
    //     const canvas = scene.getChildByName('Canvas');
    //     const bg = canvas.getChildByName('bg');
    //     const game_objs = bg.getChildByName('game_objs');

    //     //获取this.hero_pos 的世界坐标
    //     const hero_pos_world = this.hero_pos.getWorldPosition()
    //     const newSpineNode =new Node()
    //     newSpineNode.name='hero_partner_spine'
    //     //创建空 node 节点 
    //     this.spine=newSpineNode.addComponent(sp.Skeleton)
    //      newSpineNode.setScale(0.3,0.3)
    //      newSpineNode.parent=game_objs
    //      newSpineNode.setWorldPosition(hero_pos_world)



    //     const resourceDir=this.watchtowerData.spinePath
    //     const spineSkinName=this.watchtowerData.spineSkinName


    //     // 异步加载 Spine 资源
    //     resources.load(resourceDir, sp.SkeletonData, (err, skeletonData) => {
    //         if (err || !skeletonData) {
    //             console.error("watchtowerPanel: Spine资源加载失败:", err, resourceDir);
    //             return;
    //         }
            
    //         if (!this.spine) {
    //             console.warn('watchtowerPanel: spine 组件已被销毁');
    //             return;
    //         }

    //         try {
    //             this.spine.skeletonData = skeletonData;
                
    //             // 如果有皮肤名称，设置皮肤
    //             if (spineSkinName && spineSkinName !== '') {
    //                 this.spine.setSkin(spineSkinName);
    //                 console.log('watchtowerPanel: Boss皮肤设置成功:', spineSkinName);
    //             }

    //             // 设置动画完成监听器
    //             this.spine.setCompleteListener((entry) => {
    //                 // const animationName = entry.animation.name;
    //                 // console.log(`Monster: Boss动画完成 - ${animationName}`);
    //                 this.playAnimation(this.watchtowerData.animationNames[0], true);
                    
    //             });

    //             this.playAnimation(this.watchtowerData.animationNames[0], true);
    //             // 【新增】标记加载完成
    //             this.loadDone = true;
               
    //         } catch (error) {
    //             // console.error('Monster: 设置 Boss Spine 动画时出错:', error);
    //         }
    //     });
    // }

    // /**
    //  * 【新增】更新方法 - 处理技能冷却
    //  */
    // protected update(dt: number): void {
    //     if (!this.watchtower || !this.loadDone) {
    //         return;
    //     }
        
    //     // 使用 TimeManager 的缩放时间
    //     const scaledDt = TimeManager.getInstance().getDeltaTime(dt);

    //     // 【新增】死亡状态检查 - 死亡时停止所有技能逻辑
    //     if (this.isDead) {
    //         this.updateUI();
    //         return;
    //     }

    //     // 更新技能冷却
    //     this.skillCurrent += scaledDt;
        
    //     // 动态更新Spine动画速度
    //     if (this.spine) {
    //         const timeScale = TimeManager.getInstance().getTimeScale();
    //         this.spine.timeScale = timeScale;
    //     }
        
    //     // 检查技能是否冷却完成
    //     if (this.skillCurrent >= this.skillCooldown) {
    //         this.skillCurrent = 0;
    //         this.playAnimation(this.watchtowerData.animationNames[1], false);
            
    //         // 使用TimeManager控制的延迟
    //         const attackDelay = 0.8; // 攻击动画延迟时间（秒）
    //         const timeScale = TimeManager.getInstance().getTimeScale();
    //         const scaledDelay = timeScale > 0 ? attackDelay / timeScale : attackDelay;
            
    //         this.scheduleOnce(() => {
    //             this.castPartnerSkill();
    //         }, scaledDelay);
    //     }

    //     this.updateUI();
    // }

    // /**
    //  * 【新增】释放伙伴技能
    //  */
    // private castPartnerSkill(): void {
    //     if (!this.watchtowerData || this.isDead) {
    //         return;
    //     }

        
    //     // 这里可以调用技能释放系统
    //     // 例如：SkillCaster.getInstance().castPartnerSkill(this.watchtowerData, startPosition);
        
    //     // console.log(`[watchtowerPanel] 伙伴 ${this.watchtowerData.name} 释放技能`);


    //     //直接释放子弹 --伙伴不参数统计
    //     this.fireBullets(this.watchtowerData.bulletId)


    // }

    // private fireBullets(bulletId: string): void {
    //     // 获取伙伴位置作为起始位置
    //     const startPosition = this.getPartnerPosition();
        
    //     // 获取子弹配置
    //     const bulletData = BulletConfig.getBulletData(bulletId);
    //     if (!bulletData) {
    //         console.warn(`[watchtowerPanel] 未找到子弹配置: ${bulletId}`);
    //         return;
    //     }
   
    //     const attackBonus= UserPartnerData.getInstance().getPartnerActualBonuses(this.watchtower.id).attackBonus
       
    //     //百分比加成
    //     const finalAttack=bulletData.damage+bulletData.damage*attackBonus

    //     // 创建增强子弹数据（不包含修改器）
    //     const enhancedBulletData = {
    //         ...bulletData,
    //         // 可以根据伙伴等级或属性调整子弹伤害
    //         damage: finalAttack,
    //     };
        
    //     // 生成唯一的子弹ID
    //     const enhancedBulletId = `${bulletId}_partner_${Date.now()}`;


    //     BulletConfig.addBulletConfig({ ...enhancedBulletData, id: enhancedBulletId });

    //     // 设置起始位置
    //     let startPos2D = new Vec2(startPosition.x, startPosition.y);
    //     let targetPos2D: Vec2 | null = null;
      
    //     targetPos2D = new Vec2(startPosition.x, startPosition.y + 2000)
    //     // 发射子弹
    //     BulletManager.instance.getEventTarget().emit(game.gameEvent.FIRE_BULLET, {
    //         startPosition: startPos2D,
    //         targetPosition: targetPos2D, 
    //         bulletId: enhancedBulletId
    //     });

    //     // console.log(`[watchtowerPanel] 伙伴 ${this.watchtowerData?.name} 发射子弹: ${bulletId}, 位置: (${startPos2D.x.toFixed(1)}, ${startPos2D.y.toFixed(1)})`);
    // }
    /**
     * 【新增】获取伙伴位置
     */
    public getPartnerPosition(): Vec3 {
        if (!this.hero_pos) {
            return new Vec3();
        }
        const worldPos = this.hero_pos.getWorldPosition();
        return new Vec3(worldPos.x, worldPos.y, 0);
    }

    /**
     * 【新增】播放动画
     */
    // public playAnimation(animation: string, loop: boolean) {
    //     if (!this.spine) return;
        
    //     // 设置动画播放速度为TimeManager的倍速
    //     const timeScale = TimeManager.getInstance().getTimeScale();
    //     this.spine.timeScale = timeScale;
        
    //     this.spine.setAnimation(0, animation, loop);
    // }

    // /**
    //  * 【新增】更新UI
    //  */
    // private updateUI(): void {
    //     if (!this.watchtower) return;

    //     // 更新技能冷却进度条
    //     if (this.skill_bar) {
    //         if (this.isDead) {
    //             // 死亡时技能条保持当前状态（暂停显示）
    //             // 可以选择显示为0（完全暗）或保持当前进度
    //         } else {
    //             // 活着时正常更新技能冷却进度
    //             const skillPercent = this.skillCurrent / this.skillCooldown;
    //             this.skill_bar.progress = skillPercent;
    //         }
    //     }

    //     // 更新等级显示
    //     if (this.level) {
    //         this.level.string = `Lv.${this.watchtower.level}`;
    //     }
    // }

    public close() {
        this.isOpen = false;
        this.node.active = false;
    }

    public open() {
        this.isOpen = true;
        this.node.active = true;
    }
}


