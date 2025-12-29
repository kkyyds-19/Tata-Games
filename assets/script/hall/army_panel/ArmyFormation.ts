import { _decorator, Component, Node, Button } from 'cc';
import { HeroCard } from './HeroCard';
import { ClassData, UserClassData } from '../../user/UserClassData';
import { director } from 'cc';
import { game } from 'cc';
import { tween } from 'cc';
import { Vec3 } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 出战阵容UI展示类
 */
@ccclass('ArmyFormation')
export class ArmyFormation extends Component {

    @property([HeroCard])
    heroCardList: HeroCard[] = [];

    @property([Node])
    buttonList: Node[] = [];

    // 按钮状态数组：0-开放，1-待开放，2-隐藏
    private _buttonStates: number[] = [0, 0, 0, 0, 0, 0, 0];

    private _userClassData: UserClassData = null;

    // 防重复发射事件机制
    private _lastEmitCardId: string = null;
    private _lastEmitTime: number = 0;

    onLoad() {
        this._userClassData = UserClassData.getInstance();
        this.initializeHeroCards();
        this.initializeButtons();
        director.on(game.gameEvent.HALL_ARMY_FORMATION_CHANGED, this.onhallarmyformationchanged, this);
    }
    onDestroy() {
        director.off(game.gameEvent.HALL_ARMY_FORMATION_CHANGED, this.onhallarmyformationchanged, this);
    }

    onhallarmyformationchanged(classData:ClassData){
        this.initializeHeroCards(classData);
    }
    /**
     * 初始化英雄卡片
     */
    private initializeHeroCards(classData:ClassData=null): void {
        // 从UserClassData获取上场卡片ID列表
        const deployedCardIds = this._userClassData.getDeployedCardIds();
        
        // 为每个HeroCard设置对应的卡片数据
        this.heroCardList.forEach((heroCard, index) => {
            if (index < deployedCardIds.length) {
                heroCard.setHeroData(deployedCardIds[index]); 
                this.scheduleOnce(()=>{
                    //下一帧更新升级提示
                    const canUpgrade = this._userClassData.canUpgrade(deployedCardIds[index]);
                    heroCard.updateUpgradeHint(canUpgrade) 
                    heroCard.loadLevelFromClassData();
                },0.1)

                if(classData&&classData.classId==index){
                   //来一个闪烁提示动画 tween.to
                   tween(heroCard.node)
                   .to(0.1, { scale: new Vec3(1.2, 1.2, 1) }) // 放大
                   .to(0.1, { scale: Vec3.ONE })             // 恢复
                   .to(0.1, { scale: new Vec3(1.2, 1.2, 1) }) // 再次放大
                   .to(0.1, { scale: Vec3.ONE })             // 恢复
                   .start();

                }

                // 先移除旧的事件监听器，避免重复注册
                heroCard.node.off(Node.EventType.TOUCH_END);
                
                // 注册新的事件监听器
                heroCard.node.on(Node.EventType.TOUCH_END, () => {
                    // 防重复发射事件机制：如果最近500ms内已经发射过同一个卡片的事件，则忽略
                    const currentTime = Date.now();
                    const cardId = deployedCardIds[index];
                    if (this._lastEmitCardId === cardId && currentTime - this._lastEmitTime < 500) {
                        return;
                    }
                    
                    this._lastEmitCardId = cardId;
                    this._lastEmitTime = currentTime;
                    
                    director.emit(game.gameEvent.HALL_HERO_CARD_DETAIL_SHOW, cardId);
                });
            }
        });
    }

    /**
     * 初始化功能按钮
     */
    private initializeButtons(): void {
        const buttonFunctions = [
            this.onRelicButton,     // 圣物
            this.onEquipButton,     // 装备
            this.onPartnerButton,   // 伙伴
            this.onSoulBeastButton, // 灵魂兽
            this.onTowerButton,      // 哨塔
            this.onSkinButton,      // 皮肤
            this.onArchButton,      // 考古
        ];

        this.buttonList.forEach((button, index) => {
            if (index < buttonFunctions.length) {
                button.on(Node.EventType.TOUCH_END, buttonFunctions[index], this);
            }
        });

        // 初始化按钮状态
        this.updateButtonStates();
    }

    /**
     * 更新按钮状态显示
     */
    private updateButtonStates(): void {
        this.buttonList.forEach((button, index) => {
            if (index < this._buttonStates.length) {
                this.setButtonStateInternal(button, this._buttonStates[index]);
            }
        });
    }

    /**
     * 设置单个按钮状态（内部方法）
     * @param button 按钮节点
     * @param state 状态：0-开放，1-待开放，2-隐藏
     */
    private setButtonStateInternal(button: Node, state: number): void {
        if (!button) return;

        const light=button.getChildByName('light');

        switch (state) {
            case 0: // 开放状态
                button.active = true;
                light.active=true;
                break;
            case 1: // 待开放状态
                button.active = true;
                light.active=false;
                break;
            case 2: // 隐藏状态
                button.active = false;
                break;
        }
    }

    /**
     * 设置按钮状态
     * @param buttonIndex 按钮索引
     * @param state 状态：0-开放，1-待开放，2-隐藏
     */
    public setButtonState(buttonIndex: number, state: number): void {
        if (buttonIndex >= 0 && buttonIndex < this._buttonStates.length) {
            this._buttonStates[buttonIndex] = state;
            if (buttonIndex < this.buttonList.length) {
                this.setButtonStateInternal(this.buttonList[buttonIndex], state);
            }
        }
    }

    /**
     * 批量设置按钮状态
     * @param states 状态数组
     */
    public setButtonStates(states: number[]): void {
        for (let i = 0; i < Math.min(states.length, this._buttonStates.length); i++) {
            this._buttonStates[i] = states[i];
        }
        this.updateButtonStates();
    }

    /**
     * 获取按钮状态
     * @param buttonIndex 按钮索引
     * @returns 按钮状态
     */
    public getButtonState(buttonIndex: number): number {
        if (buttonIndex >= 0 && buttonIndex < this._buttonStates.length) {
            return this._buttonStates[buttonIndex];
        }
        return 0;
    }

    /**
     * 圣物按钮
     */
    private onRelicButton(): void {
        director.emit(game.gameEvent.GAME_RELIC_PAGE_SHOW);
    }

    /**
     * 装备按钮
     */
    private onEquipButton(): void {
        director.emit(game.gameEvent.GAME_EQUIP_PAGE_SHOW);
    }

    /**
     * 伙伴按钮
     */
    private onPartnerButton(): void {
        console.log('点击伙伴按钮');
        director.emit(game.gameEvent.GAME_PARTNER_MAIN_PAGE_SHOW);
    }

    /**
     * 考古按钮
     */
    private onArchButton(): void {
        console.log('点击考古按钮');
        director.emit(game.gameEvent.GAME_LEGACY_MAIN_PAGE_SHOW);
    }

    /**
     * 灵魂兽按钮
     */
    private onSoulBeastButton(): void {
        console.log('点击灵魂兽按钮');
        director.emit(game.gameEvent.GAME_SOULBEAST_MAIN_PAGE_SHOW);
    }

    /**
     * 皮肤按钮
     */
    private onSkinButton(): void {
        director.emit(game.gameEvent.GAME_SKIN_PREVIEW_PAGE_SHOW);
    }

    /**
     * 哨塔按钮
     */
    private onTowerButton(): void {
        console.log('点击哨塔按钮');
        director.emit(game.gameEvent.GAME_WATCHTOWER_MAIN_PAGE_SHOW);
    }

   

    
} 
