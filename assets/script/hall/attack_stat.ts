import { director } from 'cc';
import { game } from 'cc';
import { _decorator, Component, Node, Sprite, Label, Button, Canvas, find } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 攻击点组件
 */
@ccclass('AttackStat')
export class AttackStat extends Component {
    
    @property(Sprite)
    public flagSprite: Sprite | null = null; // 英雄是否在此落脚的标志
    
    @property(Label)
    public stageLabel: Label | null = null; // 第n关标签
    
    @property([Sprite])
    public brightStars: Sprite[] = []; // 亮星星列表（通过后的星级）
    
    @property([Sprite])
    public darkStars: Sprite[] = []; // 暗星星列表（未达到的星级）
    
    
    @property
    public stageId: number = 1; // 关卡编号
    
    @property
    public isUnlocked: boolean = false; // 关卡是否已解锁
    
    @property
    public isPassed: boolean = false; // 关卡是否已通过
    
    @property
    public starCount: number = 0; // 通过时获得的星级数量（0-3）
    
    @property
    public isHeroHere: boolean = false; // 英雄是否在此位置

    onLoad() {
        this.updateDisplay();
    }

    start() {
        
    }


    /**
     * 关卡按钮点击事件
     */
    public onStageButtonClicked(): void {
        if (!this.isUnlocked) {
            return;
        }

        director.emit(game.gameEvent.HALL_STAGE_SELECTED, this.stageId-1, this.stageId);
        
        // 获取Hall组件并滚动到当前节点位置
        // const hall = this.getHallComponent();

        // this.setHeroPosition(true)
        // if (hall) {
            // 滚动到当前节点为中心，并传递关卡信息
            // hall.scrollToStageNode(this.node, this.stageId);
        // }
        // TODO: 这里可以添加进入关卡的逻辑
    }

  
    /**
     * 更新显示状态
     */
    public updateDisplay(): void {
        // 已通过的关卡一定是解锁的
        if (this.isPassed) {
            this.isUnlocked = true;
        }
        
        // 更新关卡标签
        if (this.stageLabel) {
            this.stageLabel.string = `第${this.stageId}关`;
        }
        
        // 更新英雄落脚标志
        if (this.flagSprite) {
            this.flagSprite.node.active = this.isHeroHere;
        }
        
       
        
        // 检查关卡状态并更新显示
        if (!this.isUnlocked) {
            // 未解锁，隐藏整个节点
            this.node.active = false;
        } else {
            // 已解锁，显示节点
            this.node.active = true;
            
            if (this.isPassed) {
                // 已通过关卡，显示星级
                this.showStarRating();
            } else {
                // 已解锁但未通过，显示0星级（3个暗星星）
                this.showZeroStarRating();
            }
        }
    }
    
    /**
     * 显示星级评价
     */
    private showStarRating(): void {
        // 限制星级范围
        const validStarCount = Math.max(0, Math.min(3, this.starCount));
        
        // 显示亮星星
        for (let i = 0; i < this.brightStars.length && i < 3; i++) {
            if (this.brightStars[i]) {
                this.brightStars[i].node.active = i < validStarCount;
            }
        }
        
        // 显示暗星星
        for (let i = 0; i < this.darkStars.length && i < 3; i++) {
            if (this.darkStars[i]) {
                this.darkStars[i].node.active = i >= validStarCount;
            }
        }
    }
    
    /**
     * 显示0星级（3个暗星星）
     */
    private showZeroStarRating(): void {
        // 隐藏所有亮星星
        for (let i = 0; i < this.brightStars.length; i++) {
            if (this.brightStars[i]) {
                this.brightStars[i].node.active = false;
            }
        }
        
        // 显示所有暗星星
        for (let i = 0; i < this.darkStars.length; i++) {
            if (this.darkStars[i]) {
                this.darkStars[i].node.active = true;
            }
        }
    }
    
    /**
     * 隐藏所有星星
     */
    private hideStars(): void {
        // 隐藏所有亮星星
        for (let i = 0; i < this.brightStars.length; i++) {
            if (this.brightStars[i]) {
                this.brightStars[i].node.active = false;
            }
        }
        
        // 隐藏所有暗星星
        for (let i = 0; i < this.darkStars.length; i++) {
            if (this.darkStars[i]) {
                this.darkStars[i].node.active = false;
            }
        }
    }
    
    /**
     * 设置关卡信息
     * @param stageId 关卡编号
     * @param unlocked 是否解锁
     * @param passed 是否通过
     * @param stars 星级数量
     */
    public setStageInfo(stageId: number, unlocked: boolean, passed: boolean, stars: number = 0): void {
        this.stageId = stageId;
        this.isUnlocked = unlocked;
        this.isPassed = passed;
        this.starCount = stars;
        
        this.updateDisplay();
    }
    
    /**
     * 设置英雄位置
     * @param isHere 英雄是否在此位置
     */
    public setHeroPosition(isHere: boolean): void {
        this.isHeroHere = isHere;
        if (this.flagSprite) {
            this.flagSprite.node.active = isHere;
        }
    }
    
    /**
     * 解锁关卡
     */
    public unlockStage(): void {
        this.isUnlocked = true;
        this.updateDisplay();
    }
    
    /**
     * 完成关卡
     * @param stars 获得的星级数量
     */
    public completeStage(stars: number): void {
        this.isPassed = true;
        this.starCount = stars;
        this.updateDisplay();
    }

    /**
     * 获取关卡编号字符串
     */
    public getStageIdString(): string {
        return `${this.stageId}`;
    }


    update(deltaTime: number) {
        
    }
} 
