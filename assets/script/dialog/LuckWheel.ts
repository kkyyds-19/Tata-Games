import { _decorator, Component, Node, Sprite, Button, Label, Vec3, tween, Color, CCInteger } from 'cc';
import { SmallHeroIcon } from './SmallHeroIcon';
import { Skill } from './skill';
import { SkillManager } from '../game/skills/SkillManager';
import { HerosManager } from '../game/HerosManager';
import { GameLevelUpManager } from '../game/GameLevelUpManager';
import { TimeManager } from '../game/TimeManager';
import { GameObject } from '../game/object/GameObject';

const { ccclass, property } = _decorator;

@ccclass('LuckWheel')
export class LuckWheel extends Component {

    @property({ type: [Node], displayName: "奖品节点数组(8个)" })
    public prizeNodes: Node[] = [];

    @property({ type: Sprite, displayName: "旋转指针" })
    public rotatePointer: Sprite | null = null;

    @property({ type: Node, displayName: "奖品详细展示面板" })
    public prizeDetailPanel: Node | null = null;

    @property({ type: Button, displayName: "关闭按钮" })
    public closeButton: Button | null = null;

    @property({ type: Button, displayName: "转盘按钮" })
    public spinButton: Button | null = null;
    
    @property({ type: [Node], displayName: "奖品详情面板中的技能节点数组(3个)" })
    public prizeDetailSkillNodes: Node[] = [];


    @property({ type: Label, displayName: "自动关闭提示" })
    public autoCloseTip: Label | null = null;

    @property({ type: CCInteger, displayName: "自动关闭倒计时秒数", min: 1, max: 60 })
    public autoCloseDelaySeconds: number = 3;

    // 转盘数据 - 技能选项数组
    private heroGameObjects: GameObject[] = [];
    private skillOptions: any[] = [];  // 存储完整的技能选项信息
    private isSpinning: boolean = false;
    private remainingSpins: number = 3;
    private currentRotation: number = 0;
    
    // 存储3次旋转的结果
    private spinResults: any[] = [];
    private currentSpinIndex: number = 0;
    
    // 自动旋转控制
    private isAutoSpinning: boolean = false;
    private autoCloseTimer: number = 0;
    private autoCloseCountdown: number = 0; // 自动关闭倒计时秒数（会在开始倒计时时设置为配置值）
    
    // 已使用的奖品索引列表
    private usedPrizeIndices: number[] = [];

    // 转盘配置
    private readonly PRIZE_COUNT = 8;
    private readonly DEGREES_PER_PRIZE = 360 / 8; // 每个奖品45度

    protected onLoad(): void {

        this.setupEventListeners();
        this.initializeUI();
        this.initializeHeroData();
       
    }

    protected onDestroy(): void {

    }

    /**
     * 初始化UI
     */
    private initializeUI(): void {
        if (this.prizeNodes.length !== this.PRIZE_COUNT) {
            console.warn(`LuckWheel: 奖品节点数量应为${this.PRIZE_COUNT}个，当前为${this.prizeNodes.length}个`);
        }

        if (this.prizeDetailPanel) {
            this.prizeDetailPanel.active = false;
        }

        // 检查奖品详情技能组件数量
        if (this.prizeDetailSkillNodes.length !== 3) {
            console.warn(`LuckWheel: 奖品详情技能组件数量应为3个，当前为${this.prizeDetailSkillNodes.length}个`);
        }

        // 验证技能节点数组
        console.log(`LuckWheel: 验证技能节点数组:`);
        this.prizeDetailSkillNodes.forEach((skillNode, index) => {
            if (!skillNode) {
                console.error(`LuckWheel: 第${index}个技能节点为空`);
            } else {
                const skillComponent = skillNode.getComponent(Skill);
                if (!skillComponent) {
                    console.error(`LuckWheel: 第${index}个节点没有Skill组件`);
                } else {
                    console.log(`LuckWheel: 第${index}个技能节点正常 - node:`, skillNode.name);
                }
            }
        });

        // 初始化时隐藏所有技能节点
        this.prizeDetailSkillNodes.forEach((skillNode, index) => {
            if (skillNode) {
                skillNode.active = false;
            } else {
                console.warn(`LuckWheel: 第${index}个技能节点为空`);
            }
        });
    }

    /**
     * 初始化英雄数据
     */
    private initializeHeroData(): void {
        this.generateRandomSkillOptions();
        this.createHeroIcons();
    }

    /**
     * 生成随机的8个技能选项对应的英雄ID
     */
    private generateRandomSkillOptions(): void {
        // 获取技能管理器和英雄管理器实例
        const skillManager = SkillManager.getInstance();
        const herosManager = HerosManager.getInstance();
        
        if (!skillManager || !herosManager) {
            throw new Error('SkillManager 或 HerosManager 未找到');
        }
            const allSkillOptions: any[] = [];
            const activeHeroes = herosManager.getActiveHeroes();

            // 为每个活跃英雄生成技能选项
            for (const heroGameObj of activeHeroes) {
                const heroId = heroGameObj.id;
                
                // 获取英雄待选择的技能
                let heroSkillOptions = skillManager.getSkillChoicesForHero(heroId);
                
                // 如果没有待选择技能，生成新的升级选项
                if (heroSkillOptions.length === 0) {
                    heroSkillOptions = skillManager.getSkillOptionsOnLevelUp(heroId, 5);
                }
                
                // 将技能选项加入总列表，并补充 gameObj 字段
                heroSkillOptions.forEach((option: any) => {
                    // 确保 skillOption 包含 gameObj
                    if (option && !option.gameObj) {
                        option.gameObj = heroGameObj;
                    }
                    
                    allSkillOptions.push({
                        heroId: heroId,
                        skillOption: option
                    });
                });
            }

            // 技能选项不足时设置为空数组，让调用方处理
            if (allSkillOptions.length < 8) {
                console.log(`LuckWheel: 技能选项不足: ${allSkillOptions.length}/8`);
                this.skillOptions = [];
                this.heroGameObjects = [];
                return;
            }

            // 随机打乱并选择8个
            const shuffled = allSkillOptions.sort(() => Math.random() - 0.5);
            const selectedOptions = shuffled.slice(0, 8);
            
            this.heroGameObjects = selectedOptions.map(item => item.skillOption.gameObj);
            this.skillOptions = selectedOptions;

            console.log('LuckWheel: 生成技能选项英雄ID:', this.heroGameObjects);
            console.log('LuckWheel: 生成技能选项详情:', this.skillOptions.map(item => ({
                heroObj: item.skillOption.gameObj,
                skillId: item.skillOption?.skill?.skill_id || 'unknown',
                skillName: item.skillOption?.skill?.name || 'unknown',
                isNew: item.skillOption?.isNew || false
            })));
    }

    /**
     * 创建转盘上的英雄图标
     */
    private createHeroIcons(): void {
        for (let i = 0; i < Math.min(this.prizeNodes.length, this.heroGameObjects.length); i++) {
            if (this.prizeNodes[i]) {
                // 获取或创建SmallHeroIcon组件
                let heroIcon = this.prizeNodes[i].getComponent(SmallHeroIcon);
                if (!heroIcon) {
                    heroIcon = this.prizeNodes[i].addComponent(SmallHeroIcon);
                }
                
                // 设置英雄ID
                heroIcon.setHeroByGameObject(this.heroGameObjects[i]);
            }
        }
    }

    /**
     * 设置事件监听
     */
    private setupEventListeners(): void {
        if (this.closeButton) {
            this.closeButton.node.on(Button.EventType.CLICK, this.onCloseClick, this);
        }

        // if (this.spinButton) {
        //     this.spinButton.node.on(Button.EventType.CLICK, this.onSpinClick, this);
        // }
    }

    /**
     * 移除事件监听
     */
    private removeEventListeners(): void {
        
    }

   

    /**
     * 关闭按钮点击事件
     */
    private onCloseClick(): void {
        // 如果正在自动旋转，阻止关闭
        if (this.isAutoSpinning) {
            console.log('LuckWheel: 自动旋转进行中，无法关闭');
            return;
        }
        
        this.hideLuckWheel();
    }

    /**
     * 转盘按钮点击事件（已弃用，改为自动旋转）
     */
    private onSpinClick(): void {
        // 自动旋转模式下，不再使用手动点击
        console.log('LuckWheel: 当前为自动旋转模式，手动点击已禁用');
    }

    /**
     * 开始转动转盘
     */
    private startSpin(): void {
        if (!this.rotatePointer) {
            console.error('LuckWheel: 旋转指针未设置');
            return;
        }

        // 检查剩余旋转次数
        if (this.remainingSpins <= 0) {
            console.log('LuckWheel: 没有剩余旋转次数');
            return;
        }

        this.isSpinning = true;

        // 获取可用的奖品索引（排除已使用的）
        const availableIndices = [];
        for (let i = 0; i < this.PRIZE_COUNT; i++) {
            if (this.usedPrizeIndices.indexOf(i) === -1) {
                availableIndices.push(i);
            }
        }

        // 检查是否还有可用奖品
        if (availableIndices.length === 0) {
            console.error('LuckWheel: 没有可用的奖品了');
            this.isSpinning = false;
            return;
        }

        // 从可用奖品中随机选择一个
        const randomAvailableIndex = Math.floor(Math.random() * availableIndices.length);
        const winIndex = availableIndices[randomAvailableIndex];
        const winHeroId = this.heroGameObjects[winIndex].id;

        // 记录已使用的奖品索引
        this.usedPrizeIndices.push(winIndex);

        // 计算目标角度 - 每个奖品中心位置 (固定22.5度偏移)
        const targetAngle = winIndex * this.DEGREES_PER_PRIZE + 22.5;
        
        // 计算从当前位置到目标位置的旋转量
        let deltaAngle = targetAngle - (this.currentRotation % 360);
        
        // 确保是正向旋转
        if (deltaAngle < 0) {
            deltaAngle += 360;
        }
        
        // 增加6圈确保足够的旋转圈数，负值表示顺时针
        const totalRotation = -(360*8 + deltaAngle);

        console.log(`中奖: ${winIndex + 1}号奖品 (${winHeroId}), 可用奖品: [${availableIndices.join(', ')}], 已使用: [${this.usedPrizeIndices.join(', ')}]`);
        console.log(`旋转参数: 当前: ${this.currentRotation % 360}度, 目标: ${targetAngle}度, 增量: ${deltaAngle}度, 总旋转: ${totalRotation}度`);

        // 执行流畅的单一动画
        tween(this.rotatePointer.node)
            .by(3.0, { 
                eulerAngles: new Vec3(0, 0, totalRotation) 
            }, { easing: 'cubicOut' })   // 平滑的减速曲线
            .call(() => {
                this.onSpinComplete(winHeroId.toString(), winIndex);
                this.currentRotation = targetAngle;
            })
            .start();
    }

    /**
     * 转盘完成回调
     */
    private onSpinComplete(heroId: string, winIndex: number): void {
        this.isSpinning = false;
        
        const selectedOption = this.skillOptions[winIndex];
        const skillInfo = selectedOption.skillOption;
        
        console.log(`LuckWheel: 指针停在${winIndex + 1}号位置，获得英雄: ${heroId}`);
        console.log(`LuckWheel: 选中技能 - ${skillInfo.skill?.name || 'unknown'} (${skillInfo.isNew ? '新技能' : '升级'})`);
        
        // 更新奖品节点显示状态（已使用的变灰）
        this.updatePrizeNodesDisplay();
        
        // 存储旋转结果
        this.spinResults[this.currentSpinIndex] = {
            heroId: heroId,
            winIndex: winIndex,
            selectedOption: selectedOption,
            skillInfo: skillInfo
        };
        
        // 处理技能选择
        this.handleSkillSelection(selectedOption);
        
        // 更新技能显示
        this.updateSkillDisplay(this.currentSpinIndex, selectedOption);
        
        // 增加当前旋转索引，减少剩余次数
        this.currentSpinIndex++;
        this.remainingSpins--;
        
        console.log(`LuckWheel: 第${this.currentSpinIndex}次旋转完成，剩余次数: ${this.remainingSpins}`);
        
        // 显示面板
        this.showPanel();
        
        // 如果是自动旋转模式且还有剩余次数，等待0.5秒继续下次旋转
        if (this.isAutoSpinning && this.remainingSpins > 0) {
            console.log(`LuckWheel: 0.5秒后继续下次自动旋转`);
            this.scheduleOnce(() => {
                this.performAutoSpin();
            }, 0.5);
        } else if (this.isAutoSpinning && this.remainingSpins <= 0) {
            // 自动旋转完成
            this.completeAutoSpinSequence();
        }
    }




    
    /**
     * 处理技能选择
     */
    private handleSkillSelection(selectedOption: any): void {
        const gameLevelUpManager = GameLevelUpManager.getInstance();
        gameLevelUpManager.selectSkill(selectedOption.skillOption);
    }

    /**
     * 更新技能显示
     */
    private updateSkillDisplay(spinIndex: number, selectedOption: any): void {
        console.log(`LuckWheel: 尝试更新技能显示 - spinIndex: ${spinIndex}, 数组长度: ${this.prizeDetailSkillNodes.length}`);
        
        if (spinIndex < 0 || spinIndex >= this.prizeDetailSkillNodes.length) {
            console.warn(`LuckWheel: spinIndex 超出范围 - spinIndex: ${spinIndex}, 节点数量: ${this.prizeDetailSkillNodes.length}`);
            return;
        }
        
        const skillNode = this.prizeDetailSkillNodes[spinIndex];
        if (!skillNode) {
            console.warn(`LuckWheel: 第${spinIndex}个技能节点为空`);
            return;
        }
        
        const skillComponent = skillNode.getComponent(Skill);
        if (!skillComponent) {
            console.warn(`LuckWheel: 第${spinIndex}个节点没有Skill组件`);
            return;
        }
        
        try {
            skillNode.active = true;
            
            // 使用Skill组件的updateSkill方法显示技能信息
            skillComponent.updateSkill(selectedOption.skillOption);
            
            const skillInfo = selectedOption.skillOption;
            console.log(`LuckWheel: 成功更新第${spinIndex + 1}个技能节点 - 英雄: ${selectedOption.heroId}, 技能: ${skillInfo.skill?.name || 'unknown'}`);
        } catch (error) {
            console.error(`LuckWheel: 更新技能显示时出错:`, error);
            console.log(`LuckWheel: skillNode:`, skillNode);
            console.log(`LuckWheel: skillComponent:`, skillComponent);
        }
    }

    /**
     * 显示面板
     */
    private showPanel(): void {
        if (!this.prizeDetailPanel) {
            return;
        }

        this.prizeDetailPanel.active = true;

        // 显示所有已完成的旋转结果
        for (let i = 0; i < this.currentSpinIndex; i++) {
            if (this.prizeDetailSkillNodes[i] && this.spinResults[i]) {
                this.prizeDetailSkillNodes[i].active = true;
            }
        }

        console.log(`LuckWheel: 显示面板，当前已完成${this.currentSpinIndex}次旋转，剩余${this.remainingSpins}次`);
        
    }

    /**
     * 显示幸运转盘
     */
    public showLuckWheel(): void {
        this.node.active = true;
        
        // 重置转盘状态
        this.resetWheel();
        
        // 先尝试生成技能选项
        try {
            this.generateRandomSkillOptions();
            
            // 技能选项不足，直接退出
            if (this.skillOptions.length < 8) {
                console.log(`LuckWheel: 技能选项不足，直接关闭转盘: ${this.skillOptions.length}/8`);
                this.hideLuckWheel();
                return;
            }
            
            // 创建英雄图标
            this.createHeroIcons();
            
            // 开始自动旋转流程
            this.startAutoSpinSequence();
            
            console.log(`LuckWheel: 显示转盘，开始自动旋转流程`);
            
        } catch (error) {
            console.error('LuckWheel: 生成技能选项失败:', error);
            this.hideLuckWheel();
        }
    }

    /**
     * 刷新技能选项数据（已弃用，改为在showLuckWheel中直接处理）
     */
    public refreshSkillOptions(): void {
        // 自动旋转模式下，技能选项的生成在showLuckWheel中处理
        console.log('LuckWheel: refreshSkillOptions已弃用，技能选项在showLuckWheel中生成');
    }

    /**
     * 隐藏幸运转盘
     */
    public hideLuckWheel(): void {
        this.node.active = false;
        if (this.prizeDetailPanel) {
            this.prizeDetailPanel.active = false;
        }
        
        // 隐藏倒计时提示
        this.hideCountdownTip();
        
        // 取消所有定时器和自动旋转状态
        this.unscheduleAllCallbacks();
        this.isAutoSpinning = false;
        
        TimeManager.getInstance().resume();
    }


    /**
     * 设置剩余转动次数
     */
    public setRemainingSpins(count: number): void {
        this.remainingSpins = Math.max(0, count);
    }

    /**
     * 获取剩余转动次数
     */
    public getRemainingSpins(): number {
        return this.remainingSpins;
    }

    /**
     * 获取所有旋转结果
     */
    public getSpinResults(): any[] {
        return [...this.spinResults]; // 返回副本避免外部修改
    }

    /**
     * 获取当前旋转索引（已完成的旋转次数）
     */
    public getCurrentSpinIndex(): number {
        return this.currentSpinIndex;
    }

    /**
     * 开始自动旋转序列
     */
    private startAutoSpinSequence(): void {
        // 取消用户 close 按钮交互
        this.setCloseButtonInteractable(false);
        
        // 随机设置旋转次数 1-3
        this.remainingSpins = Math.floor(Math.random() * 3) + 1;
        this.isAutoSpinning = true;
        
        console.log(`LuckWheel: 开始自动旋转序列，总次数: ${this.remainingSpins}`);
        
        // 开始第一次自动旋转
        this.performAutoSpin();
    }
    
    /**
     * 执行自动旋转
     */
    private performAutoSpin(): void {
        if (this.remainingSpins <= 0) {
            this.completeAutoSpinSequence();
            return;
        }
        
        console.log(`LuckWheel: 开始第${this.currentSpinIndex + 1}次自动旋转，剩余: ${this.remainingSpins}`);
        this.startSpin();
    }
    
    /**
     * 完成自动旋转序列
     */
    private completeAutoSpinSequence(): void {
        this.isAutoSpinning = false;
        
        // 开放 close 按钮交互
        this.setCloseButtonInteractable(true);
        
        console.log(`LuckWheel: 完成所有自动旋转，开始${this.autoCloseDelaySeconds}秒自动关闭倒计时`);
        
        // 开始倒计时
        this.startCountdown();
    }
    
    /**
     * 设置关闭按钮交互状态
     */
    private setCloseButtonInteractable(interactable: boolean): void {
        if (this.closeButton) {
            this.closeButton.interactable = interactable;
            // 添加视觉反馈，改变按钮颜色
            const spriteComponent = this.closeButton.node.getComponent(Sprite);
            if (spriteComponent) {
                spriteComponent.color = interactable ? 
                    new Color(255, 255, 255, 255) : new Color(128, 128, 128, 255);
            }
        }
    }

    /**
     * 开始自动关闭倒计时
     */
    private startCountdown(): void {
        this.autoCloseCountdown = this.autoCloseDelaySeconds;
        this.showCountdownTip();
        this.updateCountdown();
    }

    /**
     * 更新倒计时
     */
    private updateCountdown(): void {
        if (this.autoCloseCountdown > 0) {
            this.updateCountdownDisplay();
            
            // 1秒后继续倒计时
            this.scheduleOnce(() => {
                this.autoCloseCountdown--;
                this.updateCountdown();
            }, 1.0);
        } else {
            // 倒计时结束，自动关闭
            this.hideCountdownTip();
            if (this.node.active) {
                console.log(`LuckWheel: 倒计时结束，自动关闭转盘`);
                this.hideLuckWheel();
            }
        }
    }

    /**
     * 更新倒计时显示文本
     */
    private updateCountdownDisplay(): void {
        if (this.autoCloseTip) {
            this.autoCloseTip.string = `${this.autoCloseCountdown}秒后自动关闭`;
        }
    }

    /**
     * 显示倒计时提示
     */
    private showCountdownTip(): void {
        if (this.autoCloseTip) {
            this.autoCloseTip.node.active = true;
        }
    }

    /**
     * 隐藏倒计时提示
     */
    private hideCountdownTip(): void {
        if (this.autoCloseTip) {
            this.autoCloseTip.node.active = false;
        }
    }

    /**
     * 重置奖品节点显示状态
     */
    private resetPrizeNodesDisplay(): void {
        // 恢复所有奖品节点的正常显示
        this.prizeNodes.forEach((prizeNode, index) => {
            if (prizeNode) {
                const spriteComponent = prizeNode.getComponent(Sprite);
                const heroIcon = prizeNode.getComponent(SmallHeroIcon);
                
                if (spriteComponent) {
                    spriteComponent.color = new Color(255, 255, 255, 255); // 恢复正常颜色
                }
                
                // 停止所有奖品动画
                if (heroIcon) {
                    console.log(`[LuckWheel] 重置时停止奖品${index}动画`);
                    heroIcon.stopAnimation();
                }
                
                prizeNode.active = true; // 确保节点可见
            }
        });
    }

    /**
     * 更新奖品节点显示状态（中奖奖品播放动画）
     */
    private updatePrizeNodesDisplay(): void {
        const lastUsedIndex = this.usedPrizeIndices[this.usedPrizeIndices.length - 1];
        
        this.prizeNodes.forEach((prizeNode, index) => {
            if (prizeNode) {
                const heroIcon = prizeNode.getComponent(SmallHeroIcon);
                const isUsed = this.usedPrizeIndices.indexOf(index) !== -1;
                const isLastUsed = index === lastUsedIndex;
                
                if (isUsed && isLastUsed && heroIcon) {
                    // 只有刚中奖的奖品开始播放动画
                    console.log(`[LuckWheel] 奖品${index}开始播放特效动画`);
                    heroIcon.playLuckWheelPrizeEffect();
                }
                // 不修改颜色，不停止之前中奖奖品的动画
            }
        });
    }

    /**
     * 重置转盘状态
     */
    public resetWheel(): void {
        this.isSpinning = false;
        this.isAutoSpinning = false;
        this.remainingSpins = 3;
        this.currentRotation = 0; // 默认指针在0度
        this.currentSpinIndex = 0; // 重置旋转索引
        this.spinResults = []; // 清空旋转结果
        this.autoCloseTimer = 0;
        this.autoCloseCountdown = this.autoCloseDelaySeconds; // 重置倒计时
        this.usedPrizeIndices = []; // 清空已使用的奖品索引
        
        // 取消所有定时器
        this.unscheduleAllCallbacks();
        
        // 隐藏倒计时提示
        this.hideCountdownTip();
        
        if (this.rotatePointer) {
            this.rotatePointer.node.setRotationFromEuler(0, 0, 0);
        }
        
        if (this.prizeDetailPanel) {
            this.prizeDetailPanel.active = false;
        }

        // 重置时隐藏所有技能节点
        this.prizeDetailSkillNodes.forEach(skillNode => {
            if (skillNode) skillNode.active = false;
        });
        
        // 恢复所有奖品节点的显示状态
        this.resetPrizeNodesDisplay();
        
        // 恢复关闭按钮交互
        this.setCloseButtonInteractable(true);
    }
} 