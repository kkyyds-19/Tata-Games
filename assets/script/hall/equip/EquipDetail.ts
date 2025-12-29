import { _decorator, Component, Node, Label, ProgressBar, Button, director, BlockInputEvents, UIOpacity, UITransform, Layers, Vec3, Widget } from "cc";
import { EquipIcon } from "./EquipIcon";
import { UserEquipmentData, UserEquipmentItem } from "../../user/UserEquipmentData";
import { equipmentConfigs, EquipmentConfig, SkillEffectType } from "../../global/config/EquipmentConfig";
import { Color } from "cc";
import { Sprite } from "cc";

const { ccclass, property } = _decorator;

@ccclass('EquipDetail')
export class EquipDetail extends Component {

    // ============ 装备图标显示 ============
    @property(EquipIcon)
    mainEquipIcon: EquipIcon = null;

    @property(EquipIcon)
    previewEquipIcon: EquipIcon = null;

    // ============ 装备信息显示 ============
    @property(Label)
    equipNameLabel: Label = null;

    @property(Label)
    equipDescLabel: Label = null;

    @property(Label)
    skillEffectsLabel: Label = null;

    @property(Label)
    otherInfoLabel: Label = null;

    // ============ 等级进度 ============
    @property(ProgressBar)
    levelProgressBar: ProgressBar = null;

    @property(Label)
    levelLabel: Label = null;

    // ============ 按钮控件 ============
    @property(Button)
    upgradeButton: Button = null;

    @property(Button)
    equipButton: Button = null;

    @property(Label)
    equipButtonLabel: Label = null;

    @property(Button)
    closeButton: Button = null;

    // 私有变量
    private currentEquipId: number = 0;
    private currentUserEquip: UserEquipmentItem = null;
    private currentEquipConfig: EquipmentConfig = null;
    private onEquipmentChangeCallback: (() => void) | null = null;

    onLoad() {
        this.setupEventListeners();
        const main_panel = this.node.getChildByName('main_panel');
        if (!this.node.getComponent(BlockInputEvents)) {
            this.node.addComponent(BlockInputEvents);
        }

        main_panel.on(Node.EventType.TOUCH_START , (event)=>{
            // 在Cocos Creator中阻止事件传播的方法
            if (event && typeof event.stopPropagation === 'function') {
                event.stopPropagation();
            } else if (event) {
                event.propagationStopped = true;
            }
            return false; // 返回false阻止事件继续传播
        }, this)

        const mark = this.node.getChildByName('mark');
        if (mark) {
            if (!mark.getComponent(BlockInputEvents)) {
                mark.addComponent(BlockInputEvents);
            }
            mark.on(Node.EventType.TOUCH_START, ()=>{
                console.log('[EquipDetail] 点击遮罩关闭');
                this.hideEquipDetail();
            }, this);
        }
    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners() {
        // 升级按钮
        if (this.upgradeButton) {
            this.upgradeButton.node.on(Button.EventType.CLICK, this.onUpgradeClick, this);
        }

        // 装备/卸下按钮
        if (this.equipButton) {
            this.equipButton.node.on(Button.EventType.CLICK, this.onEquipClick, this);
        }

        // 关闭按钮
        if (this.closeButton) {
            this.closeButton.node.on(Button.EventType.CLICK, this.onCloseClick, this);
        }
    }

    /**
     * 显示装备详情
     * @param equipId 装备ID
     * @param onEquipmentChangeCallback 装备变化回调 (可选)
     */
    public showEquipDetail(equipId: number, onEquipmentChangeCallback?: () => void) {
        this.currentEquipId = equipId;
        this.onEquipmentChangeCallback = onEquipmentChangeCallback || null;
        console.log(`[EquipDetail] showEquipDetail 开始 equipId=${equipId}`);
        
        // 获取装备数据
        this.currentUserEquip = UserEquipmentData.getInstance().getUserEquipment(equipId);
        this.currentEquipConfig = equipmentConfigs.find(config => config.id === equipId);

        if (!this.currentUserEquip || !this.currentEquipConfig) {
            console.warn(`[EquipDetail] 无法找到装备数据: ${equipId}`);
            return;
        }

        // 更新UI显示
        this.updateEquipDisplay();
        console.log('[EquipDetail] 已更新装备显示');
        
        const scene = director.getScene();
        const canvas = scene?.getChildByName('Canvas');
        if (canvas) {
            if (this.node.parent !== canvas) {
                this.node.parent = canvas;
            }
            this.node.layer = Layers.Enum.UI_2D;
            this.node.setSiblingIndex(canvas.children.length - 1);
            const mp = this.node.getChildByName('main_panel');
            const mk = this.node.getChildByName('mark');
            if (mp) {
                mp.active = true;
                const mpOpacity = mp.getComponent(UIOpacity) || mp.addComponent(UIOpacity);
                mpOpacity.opacity = 255;
                mp.scale = new Vec3(1,1,1);
                const mpWidget = mp.getComponent(Widget);
                if (mpWidget) mpWidget.updateAlignment();
            }
            if (mk) {
                mk.active = true;
                const mkOpacity = mk.getComponent(UIOpacity) || mk.addComponent(UIOpacity);
                mkOpacity.opacity = 160;
                const mkWidget = mk.getComponent(Widget);
                if (mkWidget) mkWidget.updateAlignment();
            }
            console.log(`[EquipDetail] 置于顶层 parent=${this.node.parent?.name} index=${this.node.getSiblingIndex()} layer=${this.node.layer}`);
        }

        // 显示面板
        this.node.active = true;
        const mp = this.node.getChildByName('main_panel');
        const mk = this.node.getChildByName('mark');
        const mpOpacity = mp?.getComponent(UIOpacity)?.opacity;
        const mkOpacity = mk?.getComponent(UIOpacity)?.opacity;
        console.log(`[EquipDetail] 显示完成 active=${this.node.active} main_panelActive=${mp?.active} markActive=${mk?.active} mpOpacity=${mpOpacity} mkOpacity=${mkOpacity}`);
    }

    /**
     * 隐藏装备详情
     */
    public hideEquipDetail() {
        this.node.active = false;
        console.log('[EquipDetail] 已隐藏');
        this.currentEquipId = 0;
        this.currentUserEquip = null;
        this.currentEquipConfig = null;
    }

    /**
     * 更新装备显示
     */
    private updateEquipDisplay() {
        if (!this.currentUserEquip || !this.currentEquipConfig) return;

        // 更新主装备图标
        if (this.mainEquipIcon) {
            this.mainEquipIcon.updateFromEquipId(this.currentEquipId, false);
        }

        // 更新预览装备图标
        if (this.previewEquipIcon) {
            this.previewEquipIcon.updateFromEquipId(this.currentEquipId, true);
        }

        // 更新装备名称
        this.updateEquipName();

        // 更新装备描述
        this.updateEquipDescription();

        // 更新技能效果
        this.updateSkillEffects();

        // 更新其他信息
        this.updateOtherInfo();

        // 更新等级进度
        this.updateLevelProgress();

        // 更新按钮状态
        this.updateButtonStates();
    }

    /**
     * 更新装备名称
     */
    private updateEquipName() {
        if (this.equipNameLabel && this.currentEquipConfig) {
            this.equipNameLabel.string = this.currentEquipConfig.name;
        }

        //更具 装备阶段  设置颜色
         // 1阶  绿色
         // 2阶  蓝色
         // 3阶  紫色
         // 4阶  橙色
         // 5阶  红色

         if(this.currentEquipConfig.equipLevel == 1){
            this.equipNameLabel.color = new Color(0, 255, 0, 255);
            this.equipNameLabel.outlineColor = new Color(0, 128, 0, 255); // 深绿色描边
         }else if(this.currentEquipConfig.equipLevel == 2){
            this.equipNameLabel.color = new Color(0, 0, 255, 255);
            this.equipNameLabel.outlineColor = new Color(0, 0, 128, 255); // 深蓝色描边
         }else if(this.currentEquipConfig.equipLevel == 3){
            this.equipNameLabel.color = new Color(255, 0, 255, 255);
            this.equipNameLabel.outlineColor = new Color(128, 0, 128, 255); // 深紫色描边
         }else if(this.currentEquipConfig.equipLevel == 4){
            this.equipNameLabel.color = new Color(255, 165, 0, 255);
            this.equipNameLabel.outlineColor = new Color(128, 82, 0, 255); // 深橙色描边
         }else {
            this.equipNameLabel.color = new Color(255, 0, 0, 255);
            this.equipNameLabel.outlineColor = new Color(128, 0, 0, 255); // 深红色描边
         }

         // 设置等级标签的颜色和描边
         this.levelLabel.color = this.equipNameLabel.color;
         this.levelLabel.outlineColor = this.equipNameLabel.outlineColor;
    }

    /**
     * 更新装备描述
     */
    private updateEquipDescription() {
        if (this.equipDescLabel && this.currentEquipConfig) {
            this.equipDescLabel.string = this.currentEquipConfig.desc;
        }
    }

    /**
     * 更新技能效果
     */
    private updateSkillEffects() {
        if (!this.skillEffectsLabel || !this.currentEquipId) return;

        const skillTexts: string[] = [];
        
        // 使用 UserEquipmentData 获取实际技能效果（包含等级加成）
        const actualEffects = UserEquipmentData.getInstance().getEquipmentActualSkillEffects(this.currentEquipId);
        
        actualEffects.forEach(effect => {
            const percentage = (effect.value * 100).toFixed(0);
            const targetName = this.getClassTypeName(effect.targetClass);
            const effectName = this.getSkillEffectName(effect.type);
            
            skillTexts.push(`${targetName}-${effectName}+${percentage}%`);
        });

        // 如果有等级加成，显示额外信息
        if (this.currentUserEquip && this.currentUserEquip.level > 1) {
            skillTexts.push(`\n提升: ${this.currentUserEquip.level}级 (+${((this.currentUserEquip.level - 1) * 20).toFixed(0)}%)`);
        }

        this.skillEffectsLabel.string = skillTexts.join('\n');
    }

    /**
     * 更新其他信息
     */
    private updateOtherInfo() {
        if (this.otherInfoLabel) {
            this.otherInfoLabel.string = ''; // 显示空字符串
        }
    }

    /**
     * 更新等级进度
     */
    private updateLevelProgress() {
        if (!this.currentUserEquip) return;

        // 更新进度条 (当前等级 / 最大等级5)
        if (this.levelProgressBar) {
            const progress = this.currentUserEquip.level / 5;
            this.levelProgressBar.progress = Math.min(progress, 1.0);
        }

        // 更新等级标签
        if (this.levelLabel) {
            this.levelLabel.string = `${this.currentUserEquip.level}级`;
        }
    }

    /**
     * 更新按钮状态
     */
    private updateButtonStates() {
        if (!this.currentUserEquip) return;

        // 升级按钮状态
        this.updateUpgradeButtonState();

        // 装备/卸下按钮状态
        this.updateEquipButtonState();
    }

    /**
     * 更新升级按钮状态
     */
    private updateUpgradeButtonState() {
        if (!this.upgradeButton || !this.currentUserEquip) return;

        // 检查是否可以升级
        const canUpgrade = this.currentUserEquip.isOwned && 
                          this.currentUserEquip.level < 5 && 
                          this.currentUserEquip.currentFragments >= this.currentUserEquip.maxFragments;

        this.upgradeButton.interactable = canUpgrade;

        //获取sprite组件
        const sprite = this.upgradeButton.node.getComponent(Sprite);
        if(sprite){
            sprite.grayscale = !canUpgrade;
        }


    }

    /**
     * 更新装备/卸下按钮状态
     */
    private updateEquipButtonState() {
        if (!this.equipButton || !this.equipButtonLabel || !this.currentUserEquip) return;

        const isEquipped = this.isEquipmentEquipped();
        
        // 更新按钮文字
        this.equipButtonLabel.string = isEquipped ? "卸下" : "装备";
        
        // 更新按钮可用性
        this.equipButton.interactable = this.currentUserEquip.isOwned;
    }

    /**
     * 检查装备是否已装备
     */
    private isEquipmentEquipped(): boolean {
        const chosenSlots = UserEquipmentData.getInstance().getChosenEquipSlots();
        return chosenSlots.some(equip => equip && equip.equipId === this.currentEquipId);
    }

    /**
     * 获取装备所在的槽位索引
     */
    private getEquippedSlotIndex(): number {
        const chosenSlots = UserEquipmentData.getInstance().getChosenEquipSlots();
        return chosenSlots.findIndex(equip => equip && equip.equipId === this.currentEquipId);
    }

    /**
     * 获取空闲槽位索引
     */
    private getEmptySlotIndex(): number {
        const chosenSlots = UserEquipmentData.getInstance().getChosenEquipSlots();
        return chosenSlots.findIndex(equip => equip === null);
    }

    // ============ 事件处理 ============

    /**
     * 升级按钮点击事件
     */
    private onUpgradeClick() {
        if (!this.currentEquipId) return;

        // 使用 UserEquipmentData 的升级方法
        if (UserEquipmentData.getInstance().upgradeEquipment(this.currentEquipId)) {
            // 重新获取装备数据
            this.currentUserEquip = UserEquipmentData.getInstance().getUserEquipment(this.currentEquipId);
            
            // 刷新显示
            this.updateEquipDisplay();
            
            // 通知主面板刷新
            if (this.onEquipmentChangeCallback) {
                this.onEquipmentChangeCallback();
            }
        }
    }

    /**
     * 装备/卸下按钮点击事件
     */
    private onEquipClick() {
        if (!this.currentUserEquip || !this.currentUserEquip.isOwned) return;

        const isEquipped = this.isEquipmentEquipped();
        
        if (isEquipped) {
            // 卸下装备
            const slotIndex = this.getEquippedSlotIndex();
            if (slotIndex >= 0) {
                UserEquipmentData.getInstance().unequipFromChosenSlot(slotIndex);
            }
        } else {
            // 装备到空闲槽位
            const emptySlotIndex = this.getEmptySlotIndex();
            if (emptySlotIndex >= 0) {
                UserEquipmentData.getInstance().equipToChosenSlot(this.currentEquipId, emptySlotIndex);
            } else {
                // TODO: 显示替换装备选择界面
            }
        }

        // 刷新显示
        this.updateEquipDisplay();
        
        // 通知主面板刷新
        if (this.onEquipmentChangeCallback) {
            this.onEquipmentChangeCallback();
        }

        this.hideEquipDetail();
    }

    /**
     * 关闭按钮点击事件
     */
    private onCloseClick() {
        this.hideEquipDetail();
    }

    // ============ 辅助方法 ============

    /**
     * 获取职业类型名称
     */
    private getClassTypeName(classType: number): string {
        const classNames = {
            0: "坦克",
            1: "牧师",
            2: "猎人", 
            3: "法师",
            4: "刺客",
            99: "全体"
        };
        return classNames[classType] || "未知";
    }

    /**
     * 获取技能效果名称
     */
    private getSkillEffectName(effectType: string): string {
        const effectNames = {
            [SkillEffectType.MAXHP]: "生命值",
            [SkillEffectType.ATTACK]: "攻击力",
            [SkillEffectType.DEFENSE]: "防御力",
            [SkillEffectType.DAMAGE_REDUCTION]: "伤害减免",
            [SkillEffectType.SKILL_COOLDOWN]: "技能冷却",
            [SkillEffectType.CRIT_RATE]: "暴击率",
            [SkillEffectType.CRIT_DAMAGE]: "暴击伤害",
            [SkillEffectType.HEALING_POWER]: "治疗量",
            [SkillEffectType.LIFESTEAL_PERCENT]: "吸血",
            [SkillEffectType.MOVE_SPEED]: "移动速度",
            [SkillEffectType.ATTACK_RANGE]: "攻击范围",
            [SkillEffectType.THORN_ARMOR]: "荆棘护甲"
        };
        return effectNames[effectType] || effectType;
    }
}
