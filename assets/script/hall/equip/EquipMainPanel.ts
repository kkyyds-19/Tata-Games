import { _decorator, Component, Node, Prefab, instantiate, Label, director } from "cc";
import { EquipIcon } from "./EquipIcon";
import { EquipDetail } from "./EquipDetail";
import { UserEquipmentData, UserEquipmentItem, ClassBonus } from "../../user/UserEquipmentData";
import { equipmentConfigs, EquipmentConfig, SkillEffect, ClassType } from "../../global/config/EquipmentConfig";
import { EquipForge } from "./EquipForge";

const { ccclass, property } = _decorator;

@ccclass('EquipMainPanel')
export class EquipMainPanel extends Component {

    // ============ 天选装备栏 (3个槽位) ============
    @property(EquipIcon)
    chosenSlot1: EquipIcon = null;

    @property(EquipIcon)
    chosenSlot2: EquipIcon = null;

    @property(EquipIcon)
    chosenSlot3: EquipIcon = null;

    // ============ 装备列表 ============
    @property(Prefab)
    equipIconPrefab: Prefab = null;

    @property(Node)
    equipContainer: Node = null;

    // ============ 总加成显示 ============
    @property(Label)
    bonusText: Label = null;

    // ============ 装备详情面板 ============
    @property(EquipDetail)
    equipDetail: EquipDetail = null;


    @property(EquipForge)
    equipForge: EquipForge = null;

    // 私有变量
    private userEquipmentData: UserEquipmentData = null;
    private equipIconInstances: EquipIcon[] = []; // 装备图标实例列表

    onLoad() {
        this.userEquipmentData = UserEquipmentData.getInstance();
    }

    start() {
        // this.initEquipmentPanel();
        this.node.on(Node.EventType.TOUCH_START, ()=>{
            //点击吞噬
        }, this);
    }

    async show(): Promise<void> {
        this.node.active = true;
        this.initEquipmentPanel();
        
        // 先同步服务器数据
        // console.log('[EquipMainPanel] 显示装备面板，开始同步服务器数据...');
        // const syncSuccess = await this.userEquipmentData.syncFromServer();
        
        // if (syncSuccess) {
        //     console.log('[EquipMainPanel] 服务器数据同步成功，初始化装备面板');
        //     this.initEquipmentPanel();
        // } else {
        //     console.warn('[EquipMainPanel] 服务器数据同步失败，使用本地数据初始化装备面板');
        //     this.initEquipmentPanel();
        // }
    }

    hide(): void {
        this.node.active = false;
    }

    onclickForge(): void {
        this.equipForge.show();
    }

    /**
     * 初始化装备面板
     */
    private initEquipmentPanel() {
        this.updateChosenEquipmentSlots();
        this.createAllEquipmentIcons();
        this.updateTotalBonuses();
    }

    private onclickClose(): void {
          this.hide();
    }

    // ============ 天选装备栏管理 ============

    /**
     * 更新天选装备栏显示
     */
    private updateChosenEquipmentSlots() {
        const chosenSlots = [this.chosenSlot1, this.chosenSlot2, this.chosenSlot3];
        const chosenEquipments = this.userEquipmentData.getChosenEquipSlots();

        for (let i = 0; i < 3; i++) {
            const slot = chosenSlots[i];
            const equip = chosenEquipments[i];
            
            if (slot) {
                if (equip) {
                    // 有装备则显示并更新
                    slot.node.active = true;
                    slot.updateFromEquipId(equip.equipId, true);
                    
                    // 添加点击事件
                    this.addChosenSlotClickHandler(slot, equip.equipId);
                } else {
                    // 无装备则隐藏
                    slot.node.active = false;
                    
                    // 清除点击回调
                    slot.setOnClickCallback(null);
                }
            }
        }
    }

    /**
     * 为天选装备槽添加点击事件
     * @param slot 装备槽组件
     * @param equipId 装备ID
     */
    private addChosenSlotClickHandler(slot: EquipIcon, equipId: number) {
        // 设置点击回调
        slot.setOnClickCallback(() => {
            console.log(`[EquipMainPanel] 天选槽位点击 equipId=${equipId}`);
            this.showEquipDetail(equipId);
        });
    }

    /**
     * 装备到天选槽位
     * @param equipId 装备ID
     * @param slotIndex 槽位索引 (0-2)
     */
    public equipToChosenSlot(equipId: number, slotIndex: number) {
        if (this.userEquipmentData.equipToChosenSlot(equipId, slotIndex)) {
            this.updateChosenEquipmentSlots();
            this.updateTotalBonuses();
        }
    }

    /**
     * 从天选槽位卸下装备
     * @param slotIndex 槽位索引 (0-2)
     */
    public unequipFromChosenSlot(slotIndex: number) {
        if (this.userEquipmentData.unequipFromChosenSlot(slotIndex)) {
            this.updateChosenEquipmentSlots();
            this.updateTotalBonuses();
        }
    }

    // ============ 装备列表管理 ============

    /**
     * 创建所有装备图标
     */
    private createAllEquipmentIcons() {
        if (!this.equipIconPrefab || !this.equipContainer) {
            console.warn('[EquipMainPanel] 装备图标预制体或容器未设置');
            return;
        }

        // 清空现有图标
        this.clearEquipmentIcons();
        // 获取已有的所有装备
        const ownedEquipments = this.userEquipmentData.getOwnedEquipments();
        
        // 为每个装备创建图标
        ownedEquipments.forEach(userEquip => {
            this.createEquipmentIcon(userEquip);
        });
    }

    /**
     * 创建单个装备图标
     * @param userEquip 用户装备数据
     */
    private createEquipmentIcon(userEquip: UserEquipmentItem) {
        const iconNode = instantiate(this.equipIconPrefab);
        iconNode.setScale(0.8,0.8)
        const equipIcon = iconNode.getComponent(EquipIcon);
        
        if (equipIcon) {
            // 更新装备图标显示
            equipIcon.updateFromEquipId(userEquip.equipId, true);
            
            // 添加到容器
            iconNode.parent = this.equipContainer;
            this.equipIconInstances.push(equipIcon);

            // 添加点击事件处理
            this.addEquipIconClickHandler(equipIcon, userEquip.equipId);
        }
    }

    /**
     * 为装备图标添加点击事件
     * @param equipIcon 装备图标组件
     * @param equipId 装备ID
     */
    private addEquipIconClickHandler(equipIcon: EquipIcon, equipId: number) {
        equipIcon.setOnClickCallback(() => {
            console.log(`[EquipMainPanel] 装备图标点击 equipId=${equipId}`);
            this.showEquipDetail(equipId);
        });
    }

    /**
     * 显示装备详情
     * @param equipId 装备ID
     */
    private showEquipDetail(equipId: number) {
        console.log(`[EquipMainPanel] 准备显示装备详情 equipId=${equipId}, equipDetailBound=${!!this.equipDetail}`);
        if (this.equipDetail) {
            console.log(`[EquipMainPanel] 调用 EquipDetail.showEquipDetail equipId=${equipId}`);
            this.equipDetail.showEquipDetail(equipId, () => {
                // 装备变化回调，刷新主面板
                this.refreshPanel();
                console.log('[EquipMainPanel] 接收到装备变化回调，已刷新面板');
            });
        } else {
            console.warn('[EquipMainPanel] 装备详情面板未设置');
        }
    }

    /**
     * 清空装备图标
     */
    private clearEquipmentIcons() {
        this.equipIconInstances.forEach(icon => {
            if (icon && icon.node) {
                icon.node.destroy();
            }
        });
        this.equipIconInstances = [];
    }

    // ============ 总加成计算 ============

    /**
     * 更新总加成显示
     */
    private updateTotalBonuses() {
        // 使用 UserEquipmentData 中的计算方法
        const classBonuses = this.userEquipmentData.calculateClassBonuses();
        this.displayClassBonuses(classBonuses);
    }

    // ============ 职业加成计算 (已移至 UserEquipmentData) ============
    // 相关逻辑已移至 UserEquipmentData.calculateClassBonuses()
    // 包含装备等级加成的计算逻辑

    /**
     * 显示职业加成信息
     * @param classBonuses 职业加成数据
     */
    private displayClassBonuses(classBonuses: ClassBonus[]) {
        if (!this.bonusText) {
            console.warn('[EquipMainPanel] 加成显示标签未设置');
            return;
        }

        const displayLines: string[] = [];
        
        // 遍历各职业加成
        classBonuses.forEach(classBonus => {
            const bonusTexts: string[] = [];
            
            // 收集该职业的所有加成效果
            for (const effectType in classBonus.bonuses) {
                const value = classBonus.bonuses[effectType];
                if (value > 0) {
                    const percentage = (value * 100).toFixed(1);
                    const effectName = this.getSkillEffectDisplayName(effectType);
                    bonusTexts.push(`${effectName}+${percentage}%`);
                }
            }
            
            // 如果该职业有加成，添加到显示列表
            if (bonusTexts.length > 0) {
                const classLine = `${classBonus.className}: ${bonusTexts.join(', ')}`;
                displayLines.push(classLine);
            }
        });
        
        // 设置显示文本，用换行符连接
        if (displayLines.length > 0) {
            this.bonusText.string = displayLines.join('\n');
        } else {
            this.bonusText.string = '暂无装备加成';
        }
        

    }

    /**
     * 获取技能效果的显示名称
     * @param effectType 效果类型
     * @returns 显示名称
     */
    private getSkillEffectDisplayName(effectType: string): string {
        const effectNames = {
            'skillDamage': '技能伤害',
            'hp': '生命值',
            'attack': '攻击力',
            'attackSpeed': '攻击速度',
            'crit': '暴击率',
            'critDamage': '暴击伤害'
        };
        return effectNames[effectType] || effectType;
    }



    // ============ 公共接口 ============

    /**
     * 刷新装备面板
     */
    public refreshPanel() {
        this.updateChosenEquipmentSlots();
        this.createAllEquipmentIcons();
        this.updateTotalBonuses();
    }

    /**
     * 获取当前总加成
     * @returns 职业加成数据
     */
    public getCurrentBonuses(): ClassBonus[] {
        return this.userEquipmentData.calculateClassBonuses();
    }
}
