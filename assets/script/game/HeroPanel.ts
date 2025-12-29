import { _decorator, Component, Node, ProgressBar, Label, Rect, UITransform, Sprite, SpriteFrame, resources, Vec2, Vec3, game, director, Color } from 'cc';
import { GameObject } from './object/GameObject';
import { sp } from 'cc';
import { Popup } from './Popup';
import { TimeManager } from './TimeManager';
import { SkillManager } from './skills/SkillManager';
import { SkillCaster } from './SkillCaster';
import { BuffManager } from './buff/BuffManager';
import { FinalStats } from './types';
import { StageComponent } from './stage/StageComponent';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { qualityHeroBaseMap } from '../global/config/QualityConfig';
import { ClassBonus } from '../user/UserEquipmentData';
import { TemporaryEquipmentBonusManager } from './TemporaryEquipmentBonusManager';
import { RewardedVideoAdManager } from '../wx/RewardedVideoAdManager';
import { StageType } from './stage/StageData';
import { HerosManager } from './HerosManager';
const { ccclass, property } = _decorator;

@ccclass('HeroPanel')
export class HeroPanel extends Component {
    @property(Sprite)
    public class_bg: Sprite | null = null;// 英雄职业背景

    @property(Sprite)
    public class_icon: Sprite | null = null;// 英雄职业图标
    @property(Label)
    public level: Label | null = null;// 英雄等级标签
    @property(ProgressBar)
    public skill_bar: ProgressBar | null = null; // 技能冷却进度条
    @property(ProgressBar)
    public hp_bar: ProgressBar | null = null;// 生命值进度条
    @property(Node)
    public spr_bg: Node | null = null;// 英雄受击区域
    @property(Node)
    public hero_pos: Node | null = null; // 英雄动画挂载点
    @property(Node)
    public info_bg: Node | null = null; // 

    //Principal所需UI
    private heart: Node;
    private hearthp: Label;

    /**
     * 英雄受击区域
     */
    @property({ tooltip: "英雄受击区域", type: Node })
    public attack_area: Node | null = null;

    @property(sp.Skeleton)
    public spine: sp.Skeleton | null = null; // Spine 动画组件


    @property(Prefab)
    public revive_hero_prefab: Prefab | null = null; // 英雄


    // public revive_hero_bg:Node | null = null;
    private revive_hero_bg: Node | null = null;


    private revive_cont: Label | null = null;

    public hero: GameObject | null = null;
    public buffManager: BuffManager | null = null;

    // public currentHP: number = 100;  // Current HP value
    public skillCurrent: number = 0;  // 当前技能冷却时间
    public skillCooldown: number = 99;

    public activeSkillCurrent: number = 0;  // 当前主动技能冷却时间
    public activeSkillMax: number = 99    //默认没有主动技能

    public attack_area_rect: Rect | null = null;
    public isDead: boolean = false;


    public finalStats: FinalStats | null = null; // 【新增】缓存最终属性
    public loadDone: boolean = false;          //加载资源完成

    private _isOpen: boolean = false
    public get isOpen() {
        // console.log(`>>>>>>>>>>>>>>get isopen${this._isOpen} ${this.node.name}`);
        return this._isOpen
    };

    private lastLoggedCooldown: number | null = null; // 【调试】用于跟踪冷却时间变化

    public get maxHP(): number {
        return this.hero?.maxhp || 100;
    }

    public getHeroPosition(): Vec3 {
        if (!this.hero_pos) {
            return new Vec3();
        }
        const worldPos = this.hero_pos.getWorldPosition();
        return new Vec3(worldPos.x, worldPos.y, 0);
    }

    protected onLoad(): void {
        this.heart = this.node.getChildByName("heart");
        this.hearthp = this.heart.getChildByName("hp").getComponent(Label);

        // this.revive_hero_bg.active=false

        // 添加治疗效果事件监听
        director.on(game.gameEvent.GAME_HEAL_EFFECT, this.onHealEffect, this);
    }

    protected onDestroy(): void {
        // 移除治疗效果事件监听
        director.off(game.gameEvent.GAME_HEAL_EFFECT, this.onHealEffect, this);
    }

    /**
     * 处理治疗效果事件
     * @param event 治疗事件数据
     */
    private onHealEffect(event: any): void {
        if (!this.hero || !event || !event.target) return;
        const { target, healAmount } = event

        // 检查是否是当前英雄被治疗
        if (target === this.hero) {
            // 【修改】死亡英雄不能接受治疗，只有存活英雄可以被治疗
            if (this.isDead || this.hero.hp <= 0) {
                console.log(`[HeroPanel] 英雄 ${this.hero.id} 已死亡，无法接受治疗`);
                return;
            }

            const oldHp = this.hero.hp;
            this.hero.hp = Math.min(this.hero.maxhp, this.hero.hp + healAmount);
            const actualHeal = this.hero.hp - oldHp;
            // 显示治疗数字
            if (this.hero_pos && Popup.instance) {
                const heroPos = this.hero_pos.parent.getPosition();
                const parentPos = this.hero_pos.parent.parent.getPosition()
                const heroWorldPos = new Vec2(heroPos.x + parentPos.x, heroPos.y + parentPos.y)
                const popupPos = new Vec2(
                    heroWorldPos.x + (Math.random() * 2 - 1) * 50, // 左右随机50像素
                    heroWorldPos.y + 80                           // y坐标+100
                );

                // 使用内置的治疗数字显示功能
                Popup.instance.showHeal(healAmount, popupPos);
            }

            // 更新UI
            this.updateUI();
        }
    }

    protected start(): void {
        // this.close()
    }

    /**
      * 用 GameObject 数据初始化面板
      */
    public initPanelData(obj: GameObject) {
        this.open()
        this.hero = obj;
        this.buffManager = new BuffManager(this.hero); // 初始化BuffManager

        // 【新增】从主技能配置中获取冷却时间
        const skillManager = SkillManager.getInstance();
        const mainSkillConfig = skillManager.getMainSkillConfig(this.hero.id);
        if (mainSkillConfig && mainSkillConfig.cooldown !== undefined) {
            this.hero.skillCooldown = mainSkillConfig.cooldown;
        } else {
            console.log(`[HeroPanel] 英雄 ${this.hero.id} 使用默认冷却时间: ${this.hero.skillCooldown}秒`);
        }

        // 注册英雄的永久被动技能效果
        this.registerPermanentSkillEffects();

        // 月卡1激活：全体攻击+10%，攻速（技能冷却）+10%（即冷却-10%）
        if (this.isMonthlyPassActive(0)) {
            try {
                const effect = {
                    is_bullet_modifier: false,
                    duration: Number.POSITIVE_INFINITY,
                    modifier: {
                        attack: { multiply: 0.1 },
                        skill_cooldown: { multiply: -0.1 },
                    }
                };
                this.buffManager.addBuff(effect as any, this.hero, true);
            } catch {}
        }

        // 【新增】为新初始化的英雄应用当前的临时装备加成
        this.applyCurrentTemporaryEquipmentBonuses();

        this.initCurrentState()
        this.initAnimation()
        this.initClassIcon(obj)
        this.initHeroClassBg(obj)
        this.refreshHeroLevel()
    }

    private isMonthlyPassActive(index: number): boolean {
        const key = 'MonthlyPass.purchaseTime.' + index;
        const last = parseInt(localStorage.getItem(key) || '0');
        if (!last) return false;
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
        return (Date.now() - last) < THIRTY_DAYS_MS;
    }
    public initHeroClassBg(hero: GameObject) {
        if (!this.class_bg) {
            return
        }

        const spriteFrameName = qualityHeroBaseMap[hero.heroStar]


        this.class_bg.spriteFrame = this.class_bg.spriteAtlas.getSpriteFrame(spriteFrameName)
    }
    public initClassIcon(hero: GameObject) {
        if (hero.class == 0) {
            this.class_icon.spriteFrame = this.class_icon.spriteAtlas.getSpriteFrame("c_0")
        } else if (hero.class == 1) {
            this.class_icon.spriteFrame = this.class_icon.spriteAtlas.getSpriteFrame("c_1")
        } else if (hero.class == 2) {
            this.class_icon.spriteFrame = this.class_icon.spriteAtlas.getSpriteFrame("c_2")
        } else if (hero.class == 3) {
            this.class_icon.spriteFrame = this.class_icon.spriteAtlas.getSpriteFrame("c_3")
        } else if (hero.class == 4) {
            this.class_icon.spriteFrame = this.class_icon.spriteAtlas.getSpriteFrame("c_4")
        }
    }
    public initCurrentState() {
        if (!this.hero) return;

        switch (this.hero.id) {
            case GameObject.principal:
                this.info_bg.active = false;
                this.heart.active = true;
                break;
            default:
                this.info_bg.active = true;
                this.heart.active = false;
                break;
        }
        this.hero.hp = this.hero.maxhp;
        this.skillCurrent = 0;
        this.isDead = false;



        const transform = this.attack_area.getComponent(UITransform);
        const rect = transform.getBoundingBox();
        this.attack_area_rect = rect;
        // console.log("attack_area_rect:", this.attack_area_rect);
        this.level.string = `Lv.${this.hero.level}`;



        // console.log("class_icon:", this.class_icon.activeInHierarchy);
        // console.log("level:", this.level.node.activeInHierarchy);

    }
    //刷新英雄等级-和技能
    public refreshHeroLevel() {
        this.level.string = `Lv.${this.hero.level}`;
        //获取当前英雄 主技能  装备的技能
        // const mianSkills= SkillManager.getInstance().getMainSkill(this.hero.id)
        //获取当前英雄 主动技能
        // const activeSkills =SkillManager.getInstance().getActiveSkill(this.hero.id)

        //修正为主技能 cd
        // if(mianSkills){
        //     this.skillCooldown=mianSkills.cooldown
        // }

        // if(activeSkills){
        //     this.activeSkillMax = activeSkills.cooldown
        // }


    }

    public initAnimation() {
        if (!this.hero_pos || !this.hero) return;

        const scene = this.node.scene;
        const canvas = scene.getChildByName('Canvas');
        const bg = canvas.getChildByName('bg');
        const game_objs = bg.getChildByName('game_objs');
        const game_other_item = bg.getChildByName('game_other_item');

        //获取this.hero_pos 的世界坐标
        const hero_pos_world = this.hero_pos.getWorldPosition()
        if (!this.spine) {
            const newSpineNode = new Node()
            newSpineNode.name = 'hero_spine'
            //创建空 node 节点 
            this.spine = newSpineNode.addComponent(sp.Skeleton)
            newSpineNode.setScale(0.3, 0.3)
            if (false) {
                newSpineNode.parent = game_objs //旧代码，有层级问题
                newSpineNode.setWorldPosition(hero_pos_world)
            } else {
                newSpineNode.parent = this.node;
                newSpineNode.setSiblingIndex(1);
            }
        }

        // 设置动画完成监听器
        this.spine.setCompleteListener((entry) => {
            const animationName = entry.animation.name;
            if (animationName === 'attack') {
                // 播放待机动画
                this.playAnimation('stand by', true);
            }
        });

        // 异步加载 spine 资源
        resources.load(this.hero.resourceDir, sp.SkeletonData, (err, skeletonData) => {
            if (err || !skeletonData) {
                // console.error("Spine资源加载失败:", err);
                return;
            }
            this.spine!.skeletonData = skeletonData;
            this.setSkin()
            this.playAnimation('stand by', true);
            this.loadDone = true;
        });

        this.revive_hero_bg = this.createReviveNode(game_other_item, hero_pos_world)
    }

    // 设置角色 Spine 皮肤
    public setSkin(): void {
        // 解构出需要的皮肤配置字段
        const { super_skin_enable, super_skinName, skinName } = this.hero;

        console.log("super_skin_enable:", super_skin_enable)
        console.log("super_skinName:", super_skinName)
        console.log("skinName:", skinName)

        // 优先使用超级皮肤（前提是启用并且非空），否则使用普通皮肤
        const finalSkin =
            (super_skin_enable && super_skinName?.trim()) || // 超级皮肤优先
            skinName?.trim();                                // 否则使用普通皮肤

        // 如果最终皮肤名合法，设置给 spine
        if (finalSkin) {
            // 可选：输出日志便于调试
            console.log(`[setSkin] 使用皮肤: ${finalSkin}`);
            this.spine.setSkin(finalSkin);
        }
    }



    //创建一个 复活 节点 
    public createReviveNode(parent: Node, worldPos: Vec3) {
        const reviveNode = instantiate(this.revive_hero_prefab)
        reviveNode.parent = parent
        reviveNode.name = 'revive_hero_bg'
        reviveNode.active = false
        this.revive_cont = reviveNode.getChildByName('cont').getComponent(Label)
        reviveNode.setWorldPosition(worldPos)
        return reviveNode
    }



    public playAnimation(animation: string, loop: boolean) {
        if (!this.spine) return;

        // 设置动画播放速度为TimeManager的倍速
        const timeScale = TimeManager.getInstance().getTimeScale();
        this.spine.timeScale = timeScale;

        this.spine.setAnimation(0, animation, loop);
    }

    /**
     * 【新增】播放死亡动画
     */
    private playDeathAnimation(): void {
        if (!this.spine) return;

        // 【修改】死亡时设置半透明并循环播放站立动画
        const spineNode = this.spine.node;
        // 设置spine节点为半透明
        this.spine.color = new Color(255, 255, 255, 120); // RGBA，A=120为半透明
        this.playAnimation('stand by', true);

        console.log(`[HeroPanel] 英雄 ${this.hero?.id} 进入死亡状态（半透明）`);
    }







    /**
     * 【新增】复活英雄
     * @param healAmount 复活时的治疗量
     */
    private reviveHero(sender: any, healAmount: number): void {
        if (!this.hero || !this.isDead) return;

        // 检查广告是否可用
        const adManager = RewardedVideoAdManager.getInstance();
        if (!adManager.isAdAvailable()) {
            console.log('[HeroPanel] 广告不可用，无法复活');
            // 可以在这里显示提示信息，比如"广告次数已用完"
            return;
        }

        console.log('[HeroPanel] 玩家点击复活按钮，开始播放激励广告');

        // 播放激励广告
        adManager.playRewardedAd(
            // 成功回调 - 广告播放完成，复活英雄
            (result) => {
                console.log('[HeroPanel] 激励广告播放成功，复活英雄');
                this.executeRevive(healAmount);
            },
            // 失败回调 - 广告播放失败，不复活
            (error) => {
                console.log('[HeroPanel] 激励广告播放失败:', error.error);
                if (error.error === '用户强制关闭广告') {
                    console.log('[HeroPanel] 用户强制关闭广告，无法复活');
                } else if (error.error === '广告不存在') {
                    console.log('[HeroPanel] 广告不存在，无法复活');
                } else if (error.error === '已达到最大播放次数') {
                    console.log('[HeroPanel] 广告次数已用完，无法复活');
                } else {
                    console.log('[HeroPanel] 其他广告错误，无法复活');
                }
            }
        );
    }

    /**
     * 执行复活逻辑
     * @param healAmount 复活时的治疗量
     */
    private executeRevive(healAmount: number): void {
        if (!this.hero || !this.isDead) return;

        // 复活英雄
        this.isDead = false;
        if (!healAmount) {
            healAmount = this.hero.maxhp
        }

        this.hero.hp = Math.min(this.hero.maxhp, healAmount);

        // 英雄复活时隐藏复活背景
        if (this.revive_hero_bg.isValid) {
            this.revive_hero_bg.active = false;
        }

        // 重置技能冷却（可选，让复活的英雄立即可以行动）
        this.skillCurrent = 0;

        // 恢复正常动画监听器和透明度
        if (this.spine) {
            // 【新增】恢复正常透明度
            this.spine.color = new Color(255, 255, 255, 255); // RGBA，A=255为完全不透明

            // 播放复活/站立动画
            this.playAnimation('stand by', true);
        }

        // 显示复活治疗数字
        if (this.hero_pos && Popup.instance) {
            const heroPos = this.hero_pos.parent.getPosition();
            const parentPos = this.hero_pos.parent.parent.getPosition()
            const heroWorldPos = new Vec2(heroPos.x + parentPos.x, heroPos.y + parentPos.y)
            const popupPos = new Vec2(
                heroWorldPos.x + (Math.random() * 2 - 1) * 50,
                heroWorldPos.y + 80
            );

            // 显示复活治疗效果
            Popup.instance.showHeal(healAmount, popupPos);
        }

        // 更新UI
        this.updateUI();

        // 【新增】通知 StageManager 英雄复活
        this.notifyStageManagerHeroRevived();

        // 【新增】为复活的英雄重新应用临时装备加成
        this.applyCurrentTemporaryEquipmentBonuses();

        //通知 小怪  击退效果
        director.emit(game.gameEvent.GAME_HERO_REVIVE, this.hero)

        console.log(`[HeroPanel] 英雄 ${this.hero.id} 复活！当前血量: ${this.hero.hp}/${this.hero.maxhp}，透明度已恢复正常`);
    }

    public close() {
        this._isOpen = false
        this.node.active = false;
        // console.log(`>>>>>>>>>>>>>>>>>close ${this.node.name}`);
    }

    public open() {
        this._isOpen = true
        this.node.active = true;
        // console.log(`>>>>>>>>>>>>>>>>>open ${this.node.name}`);
    }

    protected update(dt: number): void {
        if (!this.hero || !this.loadDone) {
            return
        }

        // 使用 TimeManager 的缩放时间
        const scaledDt = TimeManager.getInstance().getDeltaTime(dt);

        // 更新Buff管理器
        this.buffManager.update(scaledDt);

        // 【修复】更新并缓存最终属性
        this.finalStats = this.getFinalStats();
        this.skillCooldown = this.finalStats.skill_cooldown;

        // 【调试】显示最终冷却时间（仅第一次或冷却时间改变时）
        if (!this.lastLoggedCooldown || this.lastLoggedCooldown !== this.skillCooldown) {
            this.lastLoggedCooldown = this.skillCooldown;
        }

        // 【新增】死亡状态检查 - 死亡时停止所有技能逻辑
        if (this.isDead) {
            // 死亡时不更新技能冷却，暂停技能条
            //修正血量 如果死亡了 血量为0 ，
            if (this.hero.hp > 0) {
                this.hero.hp = 0
            }
            this.updateUI();
            return;
        }

        this.skillCurrent += scaledDt;

        // 动态更新Spine动画速度
        if (this.spine) {
            const timeScale = TimeManager.getInstance().getTimeScale();
            this.spine.timeScale = timeScale;
        }

        if (this.skillCurrent >= this.skillCooldown) {
            this.skillCurrent = 0;
            this.playAnimation('attack', false);
            // 使用TimeManager控制的延迟
            const attackDelay = 0.8; // 攻击动画延迟时间（秒）
            const timeScale = TimeManager.getInstance().getTimeScale();
            const scaledDelay = timeScale > 0 ? attackDelay / timeScale : attackDelay;

            this.scheduleOnce(() => {
                this.castMainSkill()
            }, scaledDelay);

        }

        this.activeSkillCurrent += scaledDt;

        if (this.activeSkillCurrent >= this.activeSkillMax) {
            this.activeSkillCurrent = 0
            // this.castActiveSkill()
        }

        this.updateUI();
    }


    private updateUI() {
        if (!this.hero) return;
        switch (game.myGlobal.stageType) {
            case StageType.Normal:
            case StageType.Dungeon:
            case StageType.Arena:
            case StageType.Endless:
                this.updateUINormal();
                break;
            case StageType.Outland:
                this.hearthp.string = this.hero.hp.toFixed(0);
                break;
            default:
                throw new Error(`TODO`);
        }
    }

    private updateUINormal() {
        const finalStats = this.getFinalStats();
        // 更新血条
        if (this.hp_bar) {
            this.hp_bar.progress = this.hero.hp / finalStats.maxhp;
        }

        // 更新复活背景显示状态
        if (this.revive_hero_bg.isValid) {
            this.revive_hero_bg.active = this.isDead;
        }

        // 更新技能冷却
        if (this.skill_bar) {
            if (this.isDead) {
                // 【新增】死亡时技能条保持当前状态（暂停显示）
                // 可以选择显示为0（完全暗）或保持当前进度
                // this.skill_bar.progress = 0; // 选项1：显示为空
                // 选项2：保持当前进度不变，表示技能被暂停
            } else {
                // 活着时正常更新技能冷却进度
                const skillPercent = this.skillCurrent / this.skillCooldown;
                this.skill_bar.progress = skillPercent;
            }
        }
    }

    /**
     * 受到伤害, 并返回反伤值
     * @param damage 原始伤害
     * @param attacker 攻击者（可选），用于计算反伤
     * @returns 基于攻击者攻击力计算出的反伤值
     */
    public takeDamage(damage: number, attacker?: GameObject): number {
        if (this.isDead || !this.hero) {

            return 0;
        }

        const finalStats = this.getFinalStats();
        const finalDamage = this.calculateFinalDamage(damage, finalStats);

        // console.log(`[HeroPanel] 英雄 ${this.hero.id} 受到伤害: 原始伤害=${damage}, 最终伤害=${finalDamage}`);

        this.hero.hp -= finalDamage;
        this.hero.hp = Math.max(0, this.hero.hp);

        // 更新UI
        this.updateUI();

        // 显示伤害数字
        if (this.hero_pos && Popup.instance) {
            const heroPos = this.hero_pos.parent.getPosition();
            const parentPos = this.hero_pos.parent.parent.getPosition()
            const heroWorldPos = new Vec2(heroPos.x + parentPos.x, heroPos.y + parentPos.y)

            const popupPos = new Vec2(
                heroWorldPos.x + (Math.random() * 2 - 1) * 50,
                heroWorldPos.y + 100
            );
            Popup.instance.showDamage(finalDamage, popupPos);
        }

        if (this.hero.hp <= 0) {
            this.hero.hp = 0; // 确保血量不会是负数
            this.isDead = true;

            // 英雄死亡时显示复活背景
            if (this.revive_hero_bg.isValid) {
                this.revive_hero_bg.active = true;
            }

            // 【新增】播放死亡动画
            this.playDeathAnimation();

            // 【新增】通知 StageManager 英雄死亡
            this.notifyStageManagerHeroDied();

            console.log(`[HeroPanel] 英雄 ${this.hero.id} 死亡，等待友军复活`);
        }

        // 计算并返回反伤值
        if (attacker && finalStats.thornArmor && finalStats.thornArmor > 0) {
            const reflectDamage = (attacker.attack || 0) * finalStats.thornArmor;
            const roundedReflectDamage = Math.round(reflectDamage);
            return roundedReflectDamage;
        } else {
            if (attacker) {
            }
        }

        return 0;
    }

    private calculateFinalDamage(incomingDamage: number, finalStats: FinalStats): number {
        // 1. 应用百分比减伤
        const damageAfterPercentReduction = incomingDamage * (1 - (finalStats.damageReduction || 0));

        // 2. 应用护甲减伤
        const defense = finalStats.defense || 0;
        const armorReductionFactor = defense / (defense + 100);
        let finalDamage = damageAfterPercentReduction * (1 - armorReductionFactor);

        // 3. 确保伤害不为负，并四舍五入到整数
        finalDamage = Math.round(Math.max(1, finalDamage));
        return finalDamage
    }

    public getFinalStats(): FinalStats {
        if (!this.hero) {
            // 提供一个安全的默认值
            return {
                maxhp: 100, attack: 10, defense: 0, damageReduction: 0,
                skill_cooldown: 5, crit_rate: 0, crit_damage: 1.5,
                lifesteal_percent: 0, moveSpeed: 100, attackRange: 100,
                thornArmor: 0, healing_power: 0
            };
        }

        const baseStats: FinalStats = {
            maxhp: this.hero.maxhp,
            attack: this.hero.attack,
            defense: this.hero.defense,
            damageReduction: this.hero.damageReduction,
            skill_cooldown: this.hero.skillCooldown,
            crit_rate: this.hero.crit_rate,
            crit_damage: this.hero.crit_damage,
            lifesteal_percent: this.hero.lifesteal_percent,
            moveSpeed: this.hero.moveSpeed,
            attackRange: this.hero.attackRange,
            thornArmor: this.hero.thornArmor,
            healing_power: this.hero.healing_power,
        };

        // 1. 先应用Buff加成
        const statsWithBuffs = this.buffManager.applyModifiers(baseStats);

        // 2. 再应用临时装备加成
        const finalStats = this.applyTemporaryEquipmentBonuses(statsWithBuffs);

        return finalStats;
    }

    /**
     * 【新增】应用临时装备加成到属性
     * @param baseStats 基础属性（已包含Buff加成）
     * @returns 应用临时装备加成后的最终属性
     */
    private applyTemporaryEquipmentBonuses(baseStats: FinalStats): FinalStats {
        if (!this.hero || !this.hero.temporaryEquipmentBonuses) {
            return baseStats;
        }

        const bonuses = this.hero.temporaryEquipmentBonuses;
        const finalStats = { ...baseStats };

        // 应用各种属性加成
        if (bonuses.attack) {
            finalStats.attack *= (1 + bonuses.attack);
        }

        if (bonuses.maxhp) {
            const oldMaxHp = finalStats.maxhp;
            finalStats.maxhp *= (1 + bonuses.maxhp);

            // 按比例调整当前血量
            if (this.hero.hp > 0) {
                const hpRatio = this.hero.hp / oldMaxHp;
                this.hero.hp = Math.round(hpRatio * finalStats.maxhp);
            }
        }

        if (bonuses.defense) {
            finalStats.defense *= (1 + bonuses.defense);
        }

        if (bonuses.damageReduction) {
            finalStats.damageReduction *= (1 + bonuses.damageReduction);
        }

        if (bonuses.skill_cooldown) {
            finalStats.skill_cooldown *= (1 + bonuses.skill_cooldown);
        }

        if (bonuses.crit_rate) {
            finalStats.crit_rate *= (1 + bonuses.crit_rate);
        }

        if (bonuses.crit_damage) {
            finalStats.crit_damage *= (1 + bonuses.crit_damage);
        }

        if (bonuses.lifesteal_percent) {
            finalStats.lifesteal_percent *= (1 + bonuses.lifesteal_percent);
        }

        if (bonuses.moveSpeed) {
            finalStats.moveSpeed *= (1 + bonuses.moveSpeed);
        }

        if (bonuses.attackRange) {
            finalStats.attackRange *= (1 + bonuses.attackRange);
        }

        if (bonuses.thornArmor) {
            finalStats.thornArmor *= (1 + bonuses.thornArmor);
        }

        // 【新增】治疗量加成
        if (bonuses.healing_power) {
            finalStats.healing_power *= (1 + bonuses.healing_power);

            // 【调试】输出治疗量变化
            // console.log(
            //     `%c[临时装备加成]%c 英雄${this.hero.id}(${this.hero.name}) 治疗量: ${baseStats.healing_power} -> ${finalStats.healing_power} (+${(bonuses.healing_power * 100).toFixed(1)}%)`,
            //     'color: green; font-weight: bold;',
            //     'color: #007acc;'
            // );
        }

        return finalStats;
    }

    /**
     * 【新增】为当前英雄应用临时装备加成（英雄初始化或复活时调用）
     */
    private applyCurrentTemporaryEquipmentBonuses(): void {
        const bonusManager = TemporaryEquipmentBonusManager.getInstance();
        if (bonusManager) {
            bonusManager.applyCurrentBonusToHero(this);
        }
    }

    private castActiveSkill() {
        if (!this.hero) return;
        const heroWorldPosition = this.hero_pos.getWorldPosition()
        const startPosition = new Vec3(heroWorldPosition.x, heroWorldPosition.y, 0)
        // SkillCaster.getInstance().castActiveSkill(this.hero,startPosition)


    }

    private castMainSkill() {
        if (!this.hero_pos || !this.hero || this.isDead) {
            // 【新增】死亡时不能释放技能
            return;
        }

        const startPosition = this.getHeroPosition();

        // 【修复】确保使用最新的最终属性
        const finalStats = this.finalStats || this.getFinalStats();

        // 将最终属性传递给 SkillCaster
        SkillCaster.getInstance().castMainSkill(this.hero, startPosition, finalStats.attack, finalStats.crit_rate, finalStats.crit_damage);
    }

    /**
     * 【新增】注册英雄所有永久生效的被动技能效果到BuffManager
     */
    private registerPermanentSkillEffects(): void {
        if (!this.hero || !this.buffManager) return;

        const skillManager = SkillManager.getInstance();
        const passiveSkills = skillManager.getLearnedPassiveSkills(this.hero.id);

        for (const skill of passiveSkills) {
            if (skill.effects) {
                for (const effect of skill.effects) {
                    // 将技能的永久效果作为Buff添加到管理器中
                    this.buffManager.addBuff(effect, this.hero, true);
                }
            }
        }
    }

    /**
     * 【新增】通知 StageManager 英雄死亡
     */
    private notifyStageManagerHeroDied(): void {
        if (!this.hero) return;

        const stageComponent = StageComponent.getInstance();
        if (stageComponent && stageComponent.stageManager) {
            HerosManager.getInstance().notifyStageManagerHeroCountChanged();
            stageComponent.stageManager.onHeroDied(this.hero.id);
            console.log(`[HeroPanel] 已通知 StageManager 英雄 ${this.hero.id} 死亡`);
        } else {
            console.warn(`[HeroPanel] 无法通知 StageManager 英雄死亡，StageComponent 或 StageManager 不存在`);
        }
    }

    /**
     * 【新增】通知 StageManager 英雄复活
     */
    private notifyStageManagerHeroRevived(): void {
        if (!this.hero) return;

        const stageComponent = StageComponent.getInstance();
        if (stageComponent && stageComponent.stageManager) {
            HerosManager.getInstance().notifyStageManagerHeroCountChanged();
            stageComponent.stageManager.onHeroRevived(this.hero.id);
            console.log(`[HeroPanel] 已通知 StageManager 英雄 ${this.hero.id} 复活`);
        } else {
            console.warn(`[HeroPanel] 无法通知 StageManager 英雄复活，StageComponent 或 StageManager 不存在`);
        }
    }

}

