import { SkillManager, SkillOption, OptionType } from '../game/skills/SkillManager';
import { _decorator, Component, RichText, Node, Button, Label, ProgressBar, director, game, Vec2, resources } from 'cc';
import { Sprite, SpriteFrame } from 'cc';
import { BaseSkill } from '../game/skills/BaseSkill';
import { GameObject } from '../game/object/GameObject';
import { sp } from 'cc';
import { Heros } from '../game/object/Heros';
import { UserClassData } from '../user/UserClassData';
import { UserArmyData } from '../user/UserArmyData';
import { qualitySkillSelectBgMap } from '../global/config/QualityConfig';
import { EquipIcon } from '../hall/equip/EquipIcon';
const { ccclass, property } = _decorator;

@ccclass('Skill')
export class Skill extends Component {
    //purple  稀有度
    @property(Sprite)
    private purple:Sprite =null  

    //职业边框
    @property(Sprite)
    private class_icon:Sprite =null  

    //推荐小图标
    @property(Sprite)
    private recommend:Sprite =null  

    //稀有技能框
    @property(Sprite)
    private rare_skill_frame:Sprite =null  


    //头像
    @property(Sprite)
    private hero_icon:Sprite =null  

    //技能名称
    @property (Label)
    private skill_name:Label =null

    //技能描述
    @property (RichText)
    private skill_desc:RichText =null

    //等级
    @property (Label)
    private hero_level:Label =null

     //下一个等级
     @property (Label)
     private hero_level_next:Label =null


     //装备 隐藏面板
     @property (Node)
     private equipment_hide_panel:Node =null

     //装备 显示icon
     @property (Node)
     private equipment_icon:Node =null

    // 简化的回调机制
    private onClickCallback: (() => void) | null = null;

    // Spine 动画相关
    private heroSpine: sp.Skeleton | null = null;
    private currentHero: GameObject | null = null;

    protected onLoad(): void {
        // 绑定按钮点击事件
        const button = this.node.getComponent(Button);
        if (button) {
            button.node.on(Button.EventType.CLICK, this.handleClick, this);
        }
    }

    /**
     * 统一的点击处理
     */
    private handleClick(): void {
        if (this.onClickCallback) {
            this.onClickCallback();
        }
    }

    /**
     * 设置点击回调（简化版）
     * @param callback 回调函数
     */
    public setOnClick(callback: () => void): void {
        this.onClickCallback = callback;
    }

    /**
     * 清理回调
     */
    public clearCallback(): void {
        this.onClickCallback = null;
    }

    /**
     * 公共方法：清理英雄 Spine 动画
     */
    public clearHeroSpineAnimation(): void {
        this.clearHeroSpine();
    }

  

    updateHero(hero:GameObject){
        this.equipment_hide_panel.active=true
        this.equipment_icon.active=false
        this.currentHero = hero;
        this.skill_name.string = hero.name
        this.skill_desc.string = hero.description
        this.hero_level.string = hero.level.toString()
        this.hero_level_next.string = (hero.level+1).toString()

        this.updateHeroUI(hero)
        
        //稀有技能框
        this.rare_skill_frame.node.active=false


        //推荐框
        this.recommend.node.active=false


        // 加载英雄的 Spine 动画
        this.loadHeroSpineAnimation(hero);
        
    }

    //英雄 信息
    private updateHeroUI(hero:GameObject){

        //加载职业小图标
        const frameName = 'c_'+hero.class
        this.class_icon.spriteFrame = this.class_icon.spriteAtlas.getSpriteFrame(frameName)


        const classData= UserClassData.getInstance().getClassData(hero.class)
        //获取卡片信息
        const cardData= UserArmyData.getInstance().getCardById(classData.cardId)
        //设置英雄星级
        hero.heroStar=cardData.quality

        //英雄🌟级---
        const rareSkillFrameName = qualitySkillSelectBgMap[hero.heroStar]
        this.purple.spriteFrame = this.purple.spriteAtlas.getSpriteFrame(rareSkillFrameName)


    }


    updateSkill(option: SkillOption){
        // 【新增】根据选项类型分发到不同的更新方法
        if (option.type === OptionType.EQUIPMENT) {
            this.updateEquipment(option);
        } else if (option.type === OptionType.SKILL) {
            this.updateSkillDisplay(option);
        } else {
            console.error('[Skill] 未知的选项类型:', option.type);
        }
    }

    /**
     * 【新增】更新装备显示
     * @param option 装备选项
     */
    private updateEquipment(option: SkillOption): void {
        console.log('[Skill] 显示装备选项:', option);
        
        // 【加强】数据验证
        if (!option.equipId) {
            console.error('[Skill] 装备选项缺少equipId:', option);
            this.skill_name.string = '错误装备';
            this.skill_desc.string = '装备数据异常';
            return;
        }
        
        // 装备名称（加强空值处理）
        this.skill_name.string = option.name || `装备#${option.equipId}`;
        
        // 装备描述（加强空值处理）
        let description = option.description || '暂无描述';
        // description += `\n<color=#FFD700>临时装备 - 自动装备</color>`;
        // description += `\n<color=#87CEEB>稀有度: ${option.rarity || 'common'}</color>`;
        // description += `\n<color=#98FB98>等级: ${option.level || 1}</color>`;
        
        this.skill_desc.string = description;
        
      
        
        // 隐藏英雄相关UI元素
        this.hideHeroRelatedUI();
        
        // 显示装备相关UI
        this.showEquipmentIcon(option);
    }

    /**
     * 【重构】更新技能显示（原updateSkill逻辑）
     * @param option 技能选项
     */
    private updateSkillDisplay(option: SkillOption): void {
        if (!option.skill || !option.gameObj) {
            console.error('[Skill] 技能或游戏对象为空');
            return;
        }
        this.equipment_hide_panel.active=true
        this.equipment_icon.active=false
        this.skill_name.string = option.skill.name;
        
        let description: string;
        
        if (option.isNew) {
            description = option.skill.description;
            description += `\n<color=#2E8B57>新技能</color>`;
        } else {
            const currentStack = option.skill.getStack();
            const maxStack = option.skill.max_stack;
            
            description = option.skill.description;
            if (maxStack > 1) {
                description += `\n<color=#FF6B35>叠加: ${currentStack} → ${currentStack + 1}</color> (最大 ${maxStack})`;
            } else {
                description += `\n<color=#FF6B35>已达最大叠加</color>`;
            }
        }
        
        this.skill_desc.string = description;
        
        this.hero_level.string = option.gameObj.level.toString();
        this.hero_level_next.string = (option.gameObj.level + 1).toString();

        this.updateHeroUI(option.gameObj);
        this.loadHeroSpineAnimation(option.gameObj);

        // 稀有技能框
        this.rare_skill_frame.node.active = false;
        this.recommend.node.active = false;

        if (option.skill.rarity == 'epic' ||
            option.skill.rarity == 'legendary' ||
            option.skill.rarity == 'synergy' ||
            option.skill.rarity == 'rare') {
            this.rare_skill_frame.node.active = true;
            this.recommend.node.active = true;
        }
    }

    /**
     * 【新增】隐藏英雄相关UI元素
     */
    private hideHeroRelatedUI(): void {
        // 隐藏
        this.equipment_hide_panel.active=false
        this.equipment_icon.active=true
        
        // 清理英雄Spine动画
        this.clearHeroSpine();
        


    }

    /**
     * 【新增】显示装备相关UI
     * @param option 装备选项
     */
    private showEquipmentIcon(option: SkillOption): void {
        // 根据装备稀有度设置背景框
        const rarityColorMap: { [key: string]: string } = {
            'common': 's_h_fram_1',    // 普通 - 绿色
            'rare': 's_h_fram_2',      // 稀有 - 蓝色  
            'epic': 's_h_fram_3',      // 史诗 - 紫色
            'legendary': 's_h_fram_4', // 传说 - 橙色
            'mythic': 's_h_fram_5'     // 神话 - 红色
        };

        console.log('[Skill] 装备稀有度:', option);

        const rarityFrame = rarityColorMap[option.rarity || 'common'] || rarityColorMap['common'];
        if (this.purple && this.purple.spriteAtlas) {
            this.purple.spriteFrame = this.purple.spriteAtlas.getSpriteFrame(rarityFrame);
        }




        
        const equipIcon = this.equipment_icon.getComponent(EquipIcon)
        if(equipIcon){
            equipIcon.updateFromEquipId(option.equipId,false)
        }

        
        const button = this.equipment_icon.getComponent(Button)
        if(button){
            button.interactable=false
        }


       
    }

    
    /**
     * 加载英雄的 Spine 动画
     * @param hero 英雄GameObject
     */
    private loadHeroSpineAnimation(hero: GameObject): void {
        if (!this.hero_icon || !hero.resourceDir) {
            console.warn('hero_icon 节点或 resourceDir 不存在');
            return;
        }

        // 清理之前的 Spine 动画
        this.clearHeroSpine();
        // 创建新的 Spine 节点
        const spineNode = new Node('hero_spine');
        
        spineNode.parent = this.hero_icon.node.parent;
        this.hero_icon.node.active=false
        
        // 设置位置和缩放（调整大小）
        spineNode.setPosition(0, -60, 0);
        spineNode.setScale(0.24, 0.24, 1); // 调整为更小的尺寸
        
        // 添加 Spine 组件
        this.heroSpine = spineNode.addComponent(sp.Skeleton);

        // 异步加载 Spine 资源
        resources.load(hero.resourceDir, sp.SkeletonData, (err, skeletonData) => {
            if (err || !skeletonData) {
                console.error("Spine资源加载失败:", err, hero.resourceDir);
                return;
            }
            
            if (!this.heroSpine) {
                console.warn('heroSpine 组件已被销毁');
                return;
            }

            try {
                this.heroSpine.skeletonData = skeletonData;
                
                // 如果有皮肤名称，设置皮肤
                if (hero.skinName && hero.skinName !== '') {
                    this.heroSpine.setSkin(hero.skinName);
                }
                this.heroSpine.setAnimation(0, 'stand by', true);
                
            } catch (error) {
                console.error('设置 Spine 动画时出错:', error);
            }
        });
    }

    /**
     * 清理英雄 Spine 动画
     */
    private clearHeroSpine(): void {
        if (this.heroSpine && this.heroSpine.node) {
            this.heroSpine.node.destroy();
            this.heroSpine = null;
        }
    }

    start() {
       
    }

    onDestroy() {
        // 清理事件监听和回调
    
        this.clearCallback();
        
        // 清理 Spine 动画
        this.clearHeroSpine();
    }
} 