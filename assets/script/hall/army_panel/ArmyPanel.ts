import { _decorator, Component, Node } from 'cc';
import { HeroCardDisplay } from './HeroCardDisplay';
import { HeroCard } from './HeroCard';
import { director } from 'cc';
import { game } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 军队面板组件
 * 空的控件，只提供显示和隐藏功能
 */
@ccclass('ArmyPanel')
export class ArmyPanel extends Component {


    @property(Node)
    public army_down:Node | null = null;

    // 防重复发射事件机制
    private _lastEmitCardId: string = null;
    private _lastEmitTime: number = 0;

    onLoad() {
        
    }

    start() {
        if(this.army_down){
            const heroCardDisplay = this.army_down.getComponent(HeroCardDisplay);
            heroCardDisplay.setOnHeroCardClick((card:HeroCard)=>{
                // 防重复发射事件机制：如果最近500ms内已经发射过同一个卡片的事件，则忽略
                const currentTime = Date.now();
                const cardId = card.getCardId();
                if (this._lastEmitCardId === cardId && currentTime - this._lastEmitTime < 500) {
                    return;
                }
                
                this._lastEmitCardId = cardId;
                this._lastEmitTime = currentTime;
                
                director.emit(game.gameEvent.HALL_HERO_CARD_DETAIL_SHOW, cardId);
            });
        }
        
    }

    
    /**
     * 显示面板
     */
    public show(): void {
        this.node.active = true;
        if(this.army_down){
            const heroCardDisplay = this.army_down.getComponent(HeroCardDisplay);
            heroCardDisplay.refreshHeroCards();
        }
    }

    /**
     * 隐藏面板
     */
    public hide(): void {
        this.node.active = false;
    }

    

    onDestroy() {
        
    }
} 