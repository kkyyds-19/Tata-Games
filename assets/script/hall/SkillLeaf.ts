import { _decorator, Component, Node, Label, Button, Sprite } from 'cc';
import { UserTechTreeData, TechNodeType } from '../user/UserTechTreeData';
import { Color } from 'cc';
import { UserInfoData } from '../user/UserInfoData';
import { GameConfig } from '../global/config/GameConfig';
const { ccclass, property } = _decorator;

/**
 * 技能叶子节点组件
 * 管理单个等级的科技树UI显示
 */
@ccclass('SkillLeaf')
export class SkillLeaf extends Component {

    // === 低等级 N ===
    @property(Label)
    lowLevelLabel: Label = null;

    @property(Sprite)
    lowBg: Sprite = null;

    @property(Button)
    lowAttackBtn: Button = null;

    @property(Label)
    lowAttackLabel: Label = null;

    @property(Sprite)
    lowAttackFrame: Sprite = null;

    @property(Button)
    lowDefenseBtn: Button = null;

    @property(Label)
    lowDefenseLabel: Label = null;

    @property(Sprite)
    lowDefenseFrame: Sprite = null;

    @property(Button)
    lowHealthBtn: Button = null;

    @property(Label)
    lowHealthLabel: Label = null;

    @property(Sprite)
    lowHealthFrame: Sprite = null;

    @property(Sprite)
    lowHorizontalLine: Sprite = null;

    @property(Sprite)
    lowDiagonalLine: Sprite = null;

    @property(Button)
    lowSkillBtn: Button = null;

    @property(Sprite)
    lowSkillIcon: Sprite = null;

    @property(Sprite)
    lowSkillFrame: Sprite = null;

    // === 高等级 N+1 ===++++++==============

    @property(Sprite)
    highBg: Sprite = null;

    @property(Label)
    highLevelLabel: Label = null;

    @property(Button)
    highAttackBtn: Button = null;

    @property(Label)
    highAttackLabel: Label = null;


    @property(Sprite)
    highAttackFrame: Sprite = null;

    @property(Button)
    highDefenseBtn: Button = null;

    @property(Label)
    highDefenseLabel: Label = null;

    @property(Sprite)
    highDefenseFrame: Sprite = null;

    @property(Button)
    highHealthBtn: Button = null;

    @property(Label)
    highHealthLabel: Label = null;

    @property(Sprite)
    highHealthFrame: Sprite = null;

    @property(Sprite)
    highHorizontalLine: Sprite = null;

    @property(Sprite)
    highDiagonalLine: Sprite = null;

    @property(Button)
    highSkillBtn: Button = null;

    @property(Sprite)
    highSkillIcon: Sprite = null;

    @property(Sprite)
    highSkillFrame: Sprite = null;

    // 私有属性
    private _lowLevel: number = 1;
    private _highLevel: number = 2;
    private _techTreeData: UserTechTreeData = null;

    //未激活字体颜色 AAA8A8
    unactivatedColor: Color = new Color(170, 168, 168, 255);
    //已激活字体颜色 生命值亮绿色
    activatedHealthColor: Color = new Color(102, 255, 102, 255);
    //已激活字体颜色 攻击值橙红色
    activatedAttackColor: Color = new Color(255, 153, 51, 255);
    //已激活字体颜色 防御值亮蓝色
    activatedDefenseColor: Color = new Color(102, 204, 255, 255);
    

    onLoad() {
        this._techTreeData = UserTechTreeData.getInstance();
        this.setupButtonEvents();
    }

    start() {
        // this.lowBg.node.active=false
        // this.highBg.node.active=false
        this.updateUI();
    }

    /**
     * 设置等级
     * @param lowLevel 低等级 (N)
     * @param highLevel 高等级 (N+1)
     */
    public setLevels(lowLevel: number, highLevel: number): void {
        this._lowLevel = lowLevel;
        this._highLevel = highLevel;
         //是否当前玩家等级
         this.lowBg.node.active = UserInfoData.getInstance().getLevel() === this._lowLevel;
         this.highBg.node.active = UserInfoData.getInstance().getLevel() === this._highLevel;

         //是否是最后一个等级
         const islastleaf = this._highLevel === GameConfig.SKILL_TREE_MAX_LEVEL;
         if(islastleaf){
            this.highDiagonalLine.node.active = false;
            const _an = this.highDiagonalLine.node.parent.getChildByName("tree_rect_x_0");
            if(_an){
                _an.active = false;
            }
         }

        this.updateUI();
    }

    /**
     * 设置按钮事件
     */
    private setupButtonEvents(): void {
        // 低等级按钮事件
        if (this.lowAttackBtn) {
            this.lowAttackBtn.node.on(Button.EventType.CLICK, () => {
                this.onAttackButtonClick(this._lowLevel);
            }, this);
        }

        if (this.lowDefenseBtn) {
            this.lowDefenseBtn.node.on(Button.EventType.CLICK, () => {
                this.onDefenseButtonClick(this._lowLevel);
            }, this);
        }

        if (this.lowHealthBtn) {
            this.lowHealthBtn.node.on(Button.EventType.CLICK, () => {
                this.onHealthButtonClick(this._lowLevel);
            }, this);
        }

        if (this.lowSkillBtn) {
            this.lowSkillBtn.node.on(Button.EventType.CLICK, () => {
                this.onSkillButtonClick(this._lowLevel);
            }, this);
        }

        // 高等级按钮事件
        if (this.highAttackBtn) {
            this.highAttackBtn.node.on(Button.EventType.CLICK, () => {
                this.onAttackButtonClick(this._highLevel);
            }, this);
        }

        if (this.highDefenseBtn) {
            this.highDefenseBtn.node.on(Button.EventType.CLICK, () => {
                this.onDefenseButtonClick(this._highLevel);
            }, this);
        }

        if (this.highHealthBtn) {
            this.highHealthBtn.node.on(Button.EventType.CLICK, () => {
                this.onHealthButtonClick(this._highLevel);
            }, this);
        }

        if (this.highSkillBtn) {
            this.highSkillBtn.node.on(Button.EventType.CLICK, () => {
                this.onSkillButtonClick(this._highLevel);
            }, this);
        }
    }

    /**
     * 更新UI显示
     */
    public updateUI(): void {
        // 确保_techTreeData已初始化
        if (!this._techTreeData) {
            this._techTreeData = UserTechTreeData.getInstance();
        }
        
        // 如果仍然为空，则跳过更新
        if (!this._techTreeData) {
            console.warn('SkillLeaf: UserTechTreeData未初始化，跳过UI更新');
            return;
        }
   
        this.updateLowLevelUI();
        this.updateHighLevelUI();
    }

    /**
     * 更新低等级UI
     */
    private updateLowLevelUI(): void {
        // 更新等级标签
        if (this.lowLevelLabel) {
            this.lowLevelLabel.string = `${this._lowLevel}`;
        }

        // 安全检查
        if (!this._techTreeData) {
            console.warn('SkillLeaf: _techTreeData为空，无法更新低等级UI');
            return;
        }

        const currentLevels = this._techTreeData.getCurrentLevels();

        // 更新攻击按钮和外框
        this.updateAttributeButton(
            this.lowAttackBtn,
            this.lowAttackFrame,
            this._lowLevel,
            TechNodeType.ATTACK,
            currentLevels.attack
        );

        // 更新防御按钮和外框
        this.updateAttributeButton(
            this.lowDefenseBtn,
            this.lowDefenseFrame,
            this._lowLevel,
            TechNodeType.DEFENSE,
            currentLevels.defense
        );

        // 更新生命按钮和外框
        this.updateAttributeButton(
            this.lowHealthBtn,
            this.lowHealthFrame,
            this._lowLevel,
            TechNodeType.HEALTH,
            currentLevels.health
        );

        // 更新连接线
        this.updateConnectionLines(
            this.lowHorizontalLine,
            this.lowDiagonalLine,
            currentLevels.attack >= this._lowLevel,
            currentLevels.health >= this._lowLevel
        );

        // 更新技能按钮
        this.updateSkillButton(
            this.lowSkillBtn,
            this.lowSkillIcon,
            this.lowSkillFrame,
            this._lowLevel,
            currentLevels.skill
        );
    }

    /**
     * 更新高等级UI
     */
    private updateHighLevelUI(): void {
        // 更新等级标签
        if (this.highLevelLabel) {
            this.highLevelLabel.string = `${this._highLevel}`;
        }

        // 安全检查
        if (!this._techTreeData) {
            console.warn('SkillLeaf: _techTreeData为空，无法更新高等级UI');
            return;
        }

        const currentLevels = this._techTreeData.getCurrentLevels();

        // 更新攻击按钮和外框
        this.updateAttributeButton(
            this.highAttackBtn,
            this.highAttackFrame,
            this._highLevel,
            TechNodeType.ATTACK,
            currentLevels.attack
        );

        // 更新防御按钮和外框
        this.updateAttributeButton(
            this.highDefenseBtn,
            this.highDefenseFrame,
            this._highLevel,
            TechNodeType.DEFENSE,
            currentLevels.defense
        );

        // 更新生命按钮和外框
        this.updateAttributeButton(
            this.highHealthBtn,
            this.highHealthFrame,
            this._highLevel,
            TechNodeType.HEALTH,
            currentLevels.health
        );

        // 更新连接线
        this.updateConnectionLines(
            this.highHorizontalLine,
            this.highDiagonalLine,
            currentLevels.attack >= this._highLevel,
            currentLevels.health >= this._highLevel
        );

        // 更新技能按钮
        this.updateSkillButton(
            this.highSkillBtn,
            this.highSkillIcon,
            this.highSkillFrame,
            this._highLevel,
            currentLevels.skill
        );
    }

    /**
     * 更新属性按钮状态
     */
    private updateAttributeButton(
        button: Button,
        frame: Sprite,
        level: number,
        type: TechNodeType,
        currentLevel: number
    ): void {
        if (!button) return;

        const isActivated = currentLevel >= level;
        // 移除交互限制，按钮始终可点击
        // const canActivate = this._techTreeData.canActivate(level, type);
        // button.interactable = canActivate && !isActivated;

        // 设置外框显示状态
        if (frame) {
            frame.node.active = isActivated;
        }

        // 更新对应的标签文本和颜色
        this.updateAttributeLabel(level, type, isActivated);

        // 可以在这里设置按钮的颜色或其他视觉效果
        // 例如：已激活=绿色，可激活=黄色，不可激活=灰色
    }

    /**
     * 更新属性标签的文本和颜色
     */
    private updateAttributeLabel(level: number, type: TechNodeType, isActivated: boolean): void {
        // 安全检查
        if (!this._techTreeData) {
            console.warn('SkillLeaf: _techTreeData为空，无法更新属性标签');
            return;
        }

        let label: Label = null;
        let value: number = 0;
        let activatedColor: Color = this.unactivatedColor;

        // 根据等级和类型获取对应的标签和数值
        if (level === this._lowLevel) {
            switch (type) {
                case TechNodeType.ATTACK:
                    label = this.lowAttackLabel;
                    value = this._techTreeData.calculateAttackValue(level);
                    activatedColor = this.activatedAttackColor;
                    break;
                case TechNodeType.DEFENSE:
                    label = this.lowDefenseLabel;
                    value = this._techTreeData.calculateDefenseValue(level);
                    activatedColor = this.activatedDefenseColor;
                    break;
                case TechNodeType.HEALTH:
                    label = this.lowHealthLabel;
                    value = this._techTreeData.calculateHealthValue(level);
                    activatedColor = this.activatedHealthColor;
                    break;
            }
        } else if (level === this._highLevel) {
            switch (type) {
                case TechNodeType.ATTACK:
                    label = this.highAttackLabel;
                    value = this._techTreeData.calculateAttackValue(level);
                    activatedColor = this.activatedAttackColor;
                    break;
                case TechNodeType.DEFENSE:
                    label = this.highDefenseLabel;
                    value = this._techTreeData.calculateDefenseValue(level);
                    activatedColor = this.activatedDefenseColor;
                    break;
                case TechNodeType.HEALTH:
                    label = this.highHealthLabel;
                    value = this._techTreeData.calculateHealthValue(level);
                    activatedColor = this.activatedHealthColor;
                    break;
            }
        }

        // 更新标签
        if (label) {
            // 设置文本内容
            label.string = `+${value}`;
            
            // 设置颜色
            label.color = isActivated ? activatedColor : this.unactivatedColor;
        }
    }

    /**
     * 更新技能按钮状态
     */
    private updateSkillButton(
        button: Button,
        icon: Sprite,
        frame: Sprite,
        level: number,
        currentSkillLevel: number
    ): void {
        // 安全检查
        if (!this._techTreeData) {
            console.warn('SkillLeaf: _techTreeData为空，无法更新技能按钮');
            // 隐藏所有技能相关UI
            if (button) button.node.active = false;
            if (icon) icon.node.active = false;
            if (frame) frame.node.active = false;
            return;
        }

        const skillInfo = this._techTreeData.getSkillInfo(level);
        
        if (!skillInfo) {
            // 该等级没有技能，隐藏按钮
            if (button) button.node.active = false;
            if (icon) icon.node.active = false;
            if (frame) frame.node.active = false;
            return;
        }

        // 显示技能按钮
        if (button) button.node.active = true;
        if (icon) icon.node.active = true;

        const isActivated = currentSkillLevel >= level;
        // 移除交互限制，技能按钮始终可点击
        // const canActivate = this._techTreeData.canActivate(level, TechNodeType.SKILL);
        // if (button) {
        //     button.interactable = canActivate && !isActivated;
        // }

        // 设置外框显示状态
        if (frame) {
            frame.node.active = isActivated;
        }

        // 这里可以根据技能ID设置不同的图标
        // 例如：icon.spriteFrame = this.getSkillIcon(skillInfo.skillId);
    }

    /**
     * 更新连接线状态
     */
    private updateConnectionLines(
        horizontalLine: Sprite,
        diagonalLine: Sprite,
        attackActivated: boolean,
        healthActivated: boolean
    ): void {
        // 攻击激活后横条点亮
        if (horizontalLine) {
            horizontalLine.node.active = attackActivated;
        }

        // 生命激活后斜条点亮
        if (diagonalLine) {
            diagonalLine.node.active = healthActivated;
        }
    }

    /**
     * 攻击按钮点击事件
     */
    private onAttackButtonClick(level: number): void {
        // 安全检查
        if (!this._techTreeData) {
            console.warn('SkillLeaf: _techTreeData为空，无法处理攻击按钮点击');
            return;
        }

        // 检查是否已经激活
        const currentLevels = this._techTreeData.getCurrentLevels();
        if (currentLevels.attack >= level) {
            console.log(`攻击 Lv.${level} 已经激活，无法重复激活`);
            // this.outputTechTreeStatus();
            return;
        }

        const success = this._techTreeData.activateNode(level, TechNodeType.ATTACK);
        if (success) {
            this.updateUI();
            console.log(`成功激活攻击 Lv.${level} 当前余额: ${UserInfoData.getInstance().getGold()}`);
            // this.outputTechTreeStatus();
        }
    }

    /**
     * 防御按钮点击事件
     */
    private onDefenseButtonClick(level: number): void {
        // 安全检查
        if (!this._techTreeData) {
            console.warn('SkillLeaf: _techTreeData为空，无法处理防御按钮点击');
            return;
        }

        // 检查是否已经激活
        const currentLevels = this._techTreeData.getCurrentLevels();
        if (currentLevels.defense >= level) {
            console.log(`防御 Lv.${level} 已经激活，无法重复激活`);
            // this.outputTechTreeStatus();
            return;
        }

        const success = this._techTreeData.activateNode(level, TechNodeType.DEFENSE);
        if (success) {
            this.updateUI();
            console.log(`成功激活防御 Lv.${level} 当前余额: ${UserInfoData.getInstance().getGold()}`);
            // this.outputTechTreeStatus();
        }
    }

    /**
     * 生命按钮点击事件
     */
    private onHealthButtonClick(level: number): void {
        // 安全检查
        if (!this._techTreeData) {
            console.warn('SkillLeaf: _techTreeData为空，无法处理生命按钮点击');
            return;
        }

        // 检查是否已经激活
        const currentLevels = this._techTreeData.getCurrentLevels();
        if (currentLevels.health >= level) {
            console.log(`生命 Lv.${level} 已经激活，无法重复激活`);
            // this.outputTechTreeStatus();
            return;
        }

        const success = this._techTreeData.activateNode(level, TechNodeType.HEALTH);
        if (success) {
            this.updateUI();
            console.log(`成功激活生命 Lv.${level} 当前余额: ${UserInfoData.getInstance().getGold()}`);
            // this.outputTechTreeStatus();
        }
    }

    /**
     * 技能按钮点击事件
     */
    private onSkillButtonClick(level: number): void {
        // 安全检查
        if (!this._techTreeData) {
            console.warn('SkillLeaf: _techTreeData为空，无法处理技能按钮点击');
            return;
        }

        // 检查是否已经激活
        const currentLevels = this._techTreeData.getCurrentLevels();
        if (currentLevels.skill >= level) {
            console.log(`技能 Lv.${level} 已经激活，无法重复激活`);
            // this.outputTechTreeStatus();
            return;
        }

        const success = this._techTreeData.activateNode(level, TechNodeType.SKILL);
        if (success) {
            this.updateUI();
            console.log(`成功激活技能 Lv.${level} 当前余额: ${UserInfoData.getInstance().getGold()}`);
            // this.outputTechTreeStatus();
        }
    }

    /**
     * 输出当前技能树状态和总加成
     */
    private outputTechTreeStatus(): void {
        // 安全检查
        if (!this._techTreeData) {
            console.warn('SkillLeaf: _techTreeData为空，无法输出技能树状态');
            return;
        }

        const stats = this._techTreeData.getStatistics();
        const userInfo = UserInfoData.getInstance();
        
        console.log('=== 当前技能树状态 ===');
        console.log(`玩家等级: ${userInfo.getLevel()} | 金币余额: ${userInfo.getGold()}`);
        console.log('--- 激活等级 ---');
        console.log(`攻击力: Lv.${stats.currentLevels.attack}`);
        console.log(`防御力: Lv.${stats.currentLevels.defense}`);
        console.log(`生命值: Lv.${stats.currentLevels.health}`);
        console.log(`技能: Lv.${stats.currentLevels.skill}`);
        console.log('--- 总加成 ---');
        console.log(`总攻击力加成: +${stats.totalBonuses.attack}`);
        console.log(`总防御减伤: +${stats.totalBonuses.defense}`);
        console.log(`总生命值加成: +${stats.totalBonuses.health}`);
        console.log(`已激活技能数量: ${stats.activatedSkills.length}`);
        if (stats.activatedSkills.length > 0) {
            console.log(`已激活技能: ${stats.activatedSkills.join(', ')}`);
        }
        console.log('--- 下级升级费用 ---');
        console.log(`攻击力下级费用: ${stats.nextLevelCosts.attack} 金币`);
        console.log(`防御力下级费用: ${stats.nextLevelCosts.defense} 金币`);
        console.log(`生命值下级费用: ${stats.nextLevelCosts.health} 金币`);
        console.log(`技能下级费用: ${stats.nextLevelCosts.skill} 金币`);
        console.log('==================');
    }

    /**
     * 获取技能信息（供外部调用）
     */
    public getSkillInfo(level: number): { skillId: string, skillName: string, description: string } | null {
        // 安全检查
        if (!this._techTreeData) {
            console.warn('SkillLeaf: _techTreeData为空，无法获取技能信息');
            return null;
        }

        return this._techTreeData.getSkillInfo(level);
    }

    /**
     * 获取属性加成信息（供外部调用）
     */
    public getAttributeBonus(level: number, type: TechNodeType): number {
        // 安全检查
        if (!this._techTreeData) {
            console.warn('SkillLeaf: _techTreeData为空，无法获取属性加成');
            return 0;
        }

        switch (type) {
            case TechNodeType.ATTACK:
                return this._techTreeData.calculateAttackValue(level);
            case TechNodeType.DEFENSE:
                return this._techTreeData.calculateDefenseValue(level);
            case TechNodeType.HEALTH:
                return this._techTreeData.calculateHealthValue(level);
            default:
                return 0;
        }
    }

    /**
     * 获取升级费用（供外部调用）
     */
    public getUpgradeCost(level: number, type: TechNodeType): number {
        // 安全检查
        if (!this._techTreeData) {
            console.warn('SkillLeaf: _techTreeData为空，无法获取升级费用');
            return 0;
        }

        return this._techTreeData.calculateUnlockCost(level, type);
    }
} 