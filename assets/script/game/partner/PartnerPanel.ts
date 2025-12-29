import { _decorator, Component, Node, ProgressBar, Label, Rect, UITransform, Sprite, SpriteFrame, resources, Vec2, Vec3, game, director, Color } from 'cc';
import { GameObject } from '../object/GameObject';
import { sp } from 'cc';
import { Popup } from '../Popup';
import { TimeManager } from '../TimeManager';
import { StageComponent } from '../stage/StageComponent';
import { Prefab , instantiate } from 'cc';
import { UserPartnerData, UserPartnerItem } from '../../user/UserPartnerData';
import { PartnerConfig, partnerConfigs } from '../../global/config/PartnerConfig';
import { BulletConfig } from '../bullet/BulletConfig';
import { BulletManager } from '../BulletManager';
const { ccclass, property } = _decorator;

@ccclass('PartnerPanel')
export class PartnerPanel extends Component{
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
   
    @property(Node)
    public hero_pos: Node | null = null; // 英雄动画挂载点

    @property(Node)
    public info_bg: Node | null = null; // 

    @property(Node)
    public attack_area: Node | null = null; // 英雄受击区域
  
    public spine: sp.Skeleton | null = null; // Spine 动画组件

    public partner:UserPartnerItem | null = null;

    public partnerData:PartnerConfig | null = null;

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

    public initPanelData(partner:UserPartnerItem){
        this.partner=partner    
        this.open()
        this.partnerData=partnerConfigs.find(config => config.id === partner.id)

        // 【新增】初始化技能冷却时间
        this.initSkillCooldown();

        //加载spine
        this.loadSpine()
      
        //更新血量
        this.updateHp()
    }

    private updateHp(): void {
        if (!this.partnerData) {
            console.error("PartnerPanel: 伙伴数据不存在->", this.partner.id);
            return;
        }

        const hpBonus= UserPartnerData.getInstance().getPartnerActualBonuses(this.partner.id).hpBonus
        //百分比
        this.maxhp=this.partnerData.maxhp+ this.partnerData.maxhp*hpBonus
        this.hp=this.maxhp
        this.hp_bar.progress=this.hp/this.maxhp 

    }

    /**
     * 【新增】初始化技能冷却时间
     */
    private initSkillCooldown(): void {
        if (this.partnerData) {
            // 将配置中的cooldown从秒转换为实际冷却时间
            this.skillCooldown = this.partnerData.cooldown;
            this.skillCurrent = 0; // 初始化为0，立即可以释放技能
            // console.log(`[PartnerPanel] 伙伴 ${this.partnerData.name} 技能冷却时间: ${this.skillCooldown}秒`);
        }
    }

    private loadSpine(): void {
        if (!this.partnerData) {
            console.error("PartnerPanel: 伙伴数据不存在->", this.partner.id);
            return;
        }

        // 将伙伴Spine挂载在 PartnerPanel 的挂载点下，保证渲染层级高于面板背景
        const mount = this.hero_pos || this.node;
        const newSpineNode = new Node();
        newSpineNode.name = 'hero_partner_spine';
        this.spine = newSpineNode.addComponent(sp.Skeleton);
        newSpineNode.setScale(0.3, 0.3);
        newSpineNode.parent = mount;
        // 本地坐标居中于挂载点
        newSpineNode.setPosition(new Vec3(0, 0, 0));
        // 提升渲染顺序到父节点的最顶层
        try { newSpineNode.setSiblingIndex(mount.children.length - 1); } catch {}



        const resourceDir = this.partnerData.spinePath
        const spineSkinName = this.partnerData.spineSkinName


        // 异步加载 Spine 资源
        resources.load(resourceDir, sp.SkeletonData, (err, skeletonData) => {
            if (err || !skeletonData) {
                console.error("PartnerPanel: Spine资源加载失败:", err, resourceDir);
                return;
            }
            
            if (!this.spine) {
                console.warn('PartnerPanel: spine 组件已被销毁');
                return;
            }

            try {
                this.spine.skeletonData = skeletonData;
                if (spineSkinName && spineSkinName !== '') {
                    this.spine.setSkin(spineSkinName);
                    console.log('PartnerPanel: Boss皮肤设置成功:', spineSkinName);
                }
                this.spine.setCompleteListener((entry) => {
                    try { this.playAnimation('move', true); } catch {
                        const fb = (this.partnerData.animationNames && this.partnerData.animationNames[0]) || 'move';
                        this.playAnimation(fb, true);
                    }
                });
                try { this.playAnimation('attack', false); } catch {
                    const atk = (this.partnerData.animationNames && this.partnerData.animationNames.find(n => n.toLowerCase() === 'attack')) || 'move';
                    this.playAnimation(atk, false);
                }
                this.loadDone = true;
            } catch (error) {
            }
        });
    }

    /**
     * 【新增】更新方法 - 处理技能冷却
     */
    protected update(dt: number): void {
        if (!this.partner || !this.loadDone) {
            return;
        }
        
        // 使用 TimeManager 的缩放时间
        const scaledDt = TimeManager.getInstance().getDeltaTime(dt);

        // 【新增】死亡状态检查 - 死亡时停止所有技能逻辑
        if (this.isDead) {
            this.updateUI();
            return;
        }

        // 更新技能冷却
        this.skillCurrent += scaledDt;
        
        // 动态更新Spine动画速度
        if (this.spine) {
            const timeScale = TimeManager.getInstance().getTimeScale();
            this.spine.timeScale = timeScale;
        }
        
        // 检查技能是否冷却完成
        if (this.skillCurrent >= this.skillCooldown) {
            this.skillCurrent = 0;
            this.playAnimation(this.partnerData.animationNames[1], false);
            
            // 使用TimeManager控制的延迟
            const attackDelay = 0.8; // 攻击动画延迟时间（秒）
            const timeScale = TimeManager.getInstance().getTimeScale();
            const scaledDelay = timeScale > 0 ? attackDelay / timeScale : attackDelay;
            
            this.scheduleOnce(() => {
                this.castPartnerSkill();
            }, scaledDelay);
        }

        this.updateUI();
    }

    /**
     * 【新增】释放伙伴技能
     */
    private castPartnerSkill(): void {
        if (!this.partnerData || this.isDead) {
            return;
        }

        
        // 这里可以调用技能释放系统
        // 例如：SkillCaster.getInstance().castPartnerSkill(this.partnerData, startPosition);
        
        // console.log(`[PartnerPanel] 伙伴 ${this.partnerData.name} 释放技能`);


        //直接释放子弹 --伙伴不参数统计
        this.fireBullets(this.partnerData.bulletId)


    }

    private fireBullets(bulletId: string): void {
        // 获取伙伴位置作为起始位置
        const startPosition = this.getPartnerPosition();
        
        // 获取子弹配置
        const bulletData = BulletConfig.getBulletData(bulletId);
        if (!bulletData) {
            console.warn(`[PartnerPanel] 未找到子弹配置: ${bulletId}`);
            return;
        }
   
        const attackBonus= UserPartnerData.getInstance().getPartnerActualBonuses(this.partner.id).attackBonus
       
        //百分比加成
        const finalAttack=bulletData.damage+bulletData.damage*attackBonus

        // 创建增强子弹数据（不包含修改器）
        const enhancedBulletData = {
            ...bulletData,
            // 可以根据伙伴等级或属性调整子弹伤害
            damage: finalAttack,
        };
        
        // 生成唯一的子弹ID
        const enhancedBulletId = `${bulletId}_partner_${Date.now()}`;


        BulletConfig.addBulletConfig({ ...enhancedBulletData, id: enhancedBulletId });

        // 设置起始位置
        let startPos2D = new Vec2(startPosition.x, startPosition.y);
        let targetPos2D: Vec2 | null = null;
      
        targetPos2D = new Vec2(startPosition.x, startPosition.y + 2000)
        // 发射子弹
        BulletManager.instance.getEventTarget().emit(game.gameEvent.FIRE_BULLET, {
            startPosition: startPos2D,
            targetPosition: targetPos2D, 
            bulletId: enhancedBulletId
        });

        // console.log(`[PartnerPanel] 伙伴 ${this.partnerData?.name} 发射子弹: ${bulletId}, 位置: (${startPos2D.x.toFixed(1)}, ${startPos2D.y.toFixed(1)})`);
    }
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
    public playAnimation(animation: string, loop: boolean) {
        if (!this.spine) return;
        
        // 设置动画播放速度为TimeManager的倍速
        const timeScale = TimeManager.getInstance().getTimeScale();
        this.spine.timeScale = timeScale;
        
        this.spine.setAnimation(0, animation, loop);
    }

    /**
     * 【新增】更新UI
     */
    private updateUI(): void {
        if (!this.partner) return;

        // 更新技能冷却进度条
        if (this.skill_bar) {
            if (this.isDead) {
                // 死亡时技能条保持当前状态（暂停显示）
                // 可以选择显示为0（完全暗）或保持当前进度
            } else {
                // 活着时正常更新技能冷却进度
                const skillPercent = this.skillCurrent / this.skillCooldown;
                this.skill_bar.progress = skillPercent;
            }
        }

        // 更新等级显示
        if (this.level) {
            this.level.string = `Lv.${this.partner.level}`;
        }
    }

    public close() {
        this.isOpen = false;
        this.node.active = false;
    }

    public open() {
        this.isOpen = true;
        this.node.active = true;
    }
    
   

   

  

   

   

  

  

}

