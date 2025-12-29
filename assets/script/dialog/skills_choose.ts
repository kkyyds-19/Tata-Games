import { SkillManager, SkillOption, OptionType } from '../game/skills/SkillManager';
import { _decorator, Component, Node, Button, Label, ProgressBar, director, game, Vec2 } from 'cc';
import { Skill } from './skill';
import { Prefab } from 'cc';
import { GameLevelUpManager, LevelUpChoiceEvent } from '../game/GameLevelUpManager';
import { GameObject } from '../game/object/GameObject';
import { TimeManager } from '../game/TimeManager';
import { GameManager } from '../game/GameManager';
import { BaseSkill } from '../game/skills/BaseSkill';
import { Heros } from '../game/object/Heros';
import { instantiate } from 'cc';
import { HerosManager } from '../game/HerosManager';
import { SmallHeroIcon } from './SmallHeroIcon';
import { Sprite } from 'cc';
import { UserEquipmentData } from '../user/UserEquipmentData';
import { EquipIcon } from '../hall/equip/EquipIcon';
const { ccclass, property } = _decorator;

@ccclass('SkillsChoose')
export class SkillsChoose extends Component {
    // 按钮节点
    @property(Node)
    private main_panel: Node = null!; // 暂停按钮

    @property(Node)
    private list:Node []= [];

    //下方列表框
    @property(Node)
    private hero_list:Node []= [];

    //下方装备列表框
    @property(Node)
    private qeuip_list:Node []= [];

    //tips
    @property (Label)
    private tips:Label =null

    //类型
    private type:string =null

    @property (Sprite)
    private title:Sprite =null

    @property (Prefab)
     private prefab_hero:Prefab =null

     @property (Prefab)
     private prefab_qeuip:Prefab =null


    // 自动选择相关变量
    private autoSelectTimer: number = 0;
    private isAutoSelectActive: boolean = false;
    private currentSkillOptions: SkillOption[] = [];
    private currentHeroOptions: GameObject[] = [];

    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_START , ()=>{
            // 如果自动选择激活，禁用用户交互
                return;

        }, this)
    }

    //刷新 选项
    flash(){
        // 清理自动选择定时器
        this.clearAutoSelectTimer();
        this.node.active = false
        TimeManager.getInstance().resume()
    }

    //传入数据
    updateUi(data:LevelUpChoiceEvent,type:string){
        this.type = type
        this.resetList()
        
        if(this.type == game.gameEvent.GAME_SHOW_HERO_CHOICE){
            // this.title.string = '英雄选择'
            this.title.spriteFrame = this.title.spriteAtlas.getSpriteFrame('sk_h_8')
            //输出参数 测试
            this.updateHeros(data.heroGameObjs)
        }else if(this.type == game.gameEvent.GAME_SHOW_SKILL_CHOICE){
            // this.title.string = '技能选择'
            this.title.spriteFrame = this.title.spriteAtlas.getSpriteFrame('sk_h_1')
        
            this.updateSkills(data.skillOptions)

        }

        //更新 英雄列表
        this.updateHeroList()

        //更新 装备列表
        this.updateEquipList()

        // 检查是否需要自动选择
        this.checkAutoSelect();



    }


    updateHeroList(){
        const heros =  HerosManager.getInstance().getActiveHeroes()
        this.hero_list.forEach(item=>{
            item.removeAllChildren()
        })
         //获取当前已上场的英雄列表
        for(let i=0;i<heros.length;i++){
            const heroNode = instantiate(this.prefab_hero)
            const smallHeroIcon = heroNode.getComponent(SmallHeroIcon)
            smallHeroIcon.setHeroByGameObject(heros[i])
            heroNode.parent = this.hero_list[i];
        }
        
    }

    updateEquipList(){

        //优先显示天选装备 然后是临时装备
        const chosenEquips = UserEquipmentData.getInstance().getChosenEquipSlots().filter(equip => equip !== null)  
        const tempEquips = UserEquipmentData.getInstance().getTemporaryEquipments()
        const equips = [...chosenEquips, ...tempEquips]

        this.qeuip_list.forEach((item,i)=>{
            item.removeAllChildren();

            if(equips[i]){
                const equipNode = instantiate(this.prefab_qeuip)
                equipNode.setScale(0.68,0.68)
                equipNode.parent = item
                const equipIcon = equipNode.getComponent(EquipIcon)
                
                equipIcon.updateFromEquipId(equips[i].equipId,false)
            }
        })

       
    }

    /**
     * 检查并启动自动选择功能
     */
    private checkAutoSelect(): void {
        if (game.myGlobal.autoSelectSkill===true) {
            this.isAutoSelectActive = true;
            
            // 禁用所有按钮交互
            this.setButtonsInteractable(false);
            
            // 设置1秒后自动选择
            this.autoSelectTimer = 1.0;
            
            // 更新标题显示自动选择状态
            if (this.type == game.gameEvent.GAME_SHOW_SKILL_CHOICE) {
                this.tips.string = '技能选择 (自动选择中...)';
            } else if (this.type == game.gameEvent.GAME_SHOW_HERO_CHOICE) {
                this.tips.string = '英雄选择 (自动选择中...)';
            }
        }else{
            this.isAutoSelectActive = false;
            this.setButtonsInteractable(true);
            this.tips.string="打不过就加入！礼包码：123456！"
        }
    }

    /**
     * 设置按钮是否可交互
     */
    private setButtonsInteractable(interactable: boolean): void {
        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].active) {
                const button = this.list[i].getComponent(Button);
                if (button) {
                    button.interactable = interactable;
                }
            }
        }
    }

    /**
     * 执行自动选择
     */
    private executeAutoSelect(): void {
        if (this.type == game.gameEvent.GAME_SHOW_SKILL_CHOICE) {
            // 【修复】自动选择第一个选项（可能是技能或装备）
            if (this.currentSkillOptions.length > 0) {
                const firstOption = this.currentSkillOptions[0];
                // 验证选项类型，确保数据完整性
                if (firstOption.type === OptionType.SKILL && (!firstOption.skill || !firstOption.gameObj)) {
                    console.error('[SkillsChoose] 自动选择的技能选项数据不完整:', firstOption);
                    return;
                }
                if (firstOption.type === OptionType.EQUIPMENT && !firstOption.equipId) {
                    console.error('[SkillsChoose] 自动选择的装备选项数据不完整:', firstOption);
                    return;
                }
                this.onSkillClick(firstOption);
            }
        } else if (this.type == game.gameEvent.GAME_SHOW_HERO_CHOICE) {
            // 自动选择第一个英雄
            if (this.currentHeroOptions.length > 0) {
                this.onHeroClick(this.currentHeroOptions[0]);
            }
        }
    }

    /**
     * 清理自动选择定时器
     */
    private clearAutoSelectTimer(): void {
        this.autoSelectTimer = 0;
        this.isAutoSelectActive = false;
    }

    resetList(){
        for(let i=0;i<this.list.length;i++){
            this.list[i].active = false
            // 清理回调和 Spine 动画，防止内存泄漏
            const skillComponent = this.list[i].getComponent(Skill);
            if (skillComponent) {
                skillComponent.clearCallback();
                // 清理 Spine 动画
                skillComponent.clearHeroSpineAnimation();
            }
        }
    }

    updateHeros(heros:GameObject[]){
        this.currentHeroOptions = heros; // 保存当前英雄选项
        
        for(let i=0;i<heros.length;i++){
            this.list[i].active = true
            const skillComponent = this.list[i].getComponent(Skill);
            skillComponent.updateHero(heros[i]);
            
            // 使用简化的回调机制
            skillComponent.setOnClick(() => {
                // 如果自动选择激活，禁用点击
                if (this.isAutoSelectActive) {
                    return;
                }
                this.onHeroClick(heros[i]);
            });
        }
    }

    updateSkills(skills:SkillOption[]){
        this.currentSkillOptions = skills; // 保存当前技能选项
        
        for(let i=0;i<skills.length;i++){
            this.list[i].active = true
            const skillComponent = this.list[i].getComponent(Skill);
            skillComponent.updateSkill(skills[i]);

            // 使用简化的回调机制
            skillComponent.setOnClick(() => {
                // 如果自动选择激活，禁用点击
                if (this.isAutoSelectActive) {
                    return;
                }
                this.onSkillClick(skills[i]);
            });
        }
    }

    start() {
       
    }

    update(deltaTime: number) {
        // 处理自动选择倒计时
        if (this.isAutoSelectActive && this.autoSelectTimer > 0) {
            this.autoSelectTimer -= deltaTime;
            
            if (this.autoSelectTimer <= 0) {
                this.executeAutoSelect();
            }
        }
    }

    onDestroy() {
        this.clearAutoSelectTimer();
    }
    
    onSkillClick(skill:SkillOption){
        this.clearAutoSelectTimer(); // 清理定时器
        GameLevelUpManager.getInstance().selectSkill(skill)
        this.node.active=false
        TimeManager.getInstance().resume()
       
    }

    onHeroClick(hero:GameObject){
        this.clearAutoSelectTimer(); // 清理定时器
        GameLevelUpManager.getInstance().selectHero(hero)
        this.node.active=false
        TimeManager.getInstance().resume()
        
    }
} 