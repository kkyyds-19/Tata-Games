import { game } from 'cc';
import { _decorator, Component, Sprite, Button, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StageInfoBoard')
export class StageInfoBoard extends Component {
    
    @property(Sprite)
    sprite: Sprite = null!;

    @property(Button)
    normalDifficultyBtn: Button = null!;

    @property(Button)
    eliteDifficultyBtn: Button = null!;

    @property(Sprite)
    normalHighlightSprite: Sprite = null!;

    @property(Sprite)
    eliteHighlightSprite: Sprite = null!;

    start() {
        this.setupButtonEvents();
        this.syncWithGlobalDifficulty();
    }

    private setupButtonEvents() {
        if (this.normalDifficultyBtn) {
            this.normalDifficultyBtn.node.on(Button.EventType.CLICK, this.onNormalDifficultyClick, this);
        }
        
        if (this.eliteDifficultyBtn) {
            this.eliteDifficultyBtn.node.on(Button.EventType.CLICK, this.onEliteDifficultyClick, this);
        }
    }

    public updateUI() {
        // UI界面更新方法
        if (this.sprite) {
            this.sprite.node.active = true;
        }
        
        if (this.normalDifficultyBtn) {
            this.normalDifficultyBtn.node.active = true;
        }
        
        if (this.eliteDifficultyBtn) {
            this.eliteDifficultyBtn.node.active = true;
        }

        // 根据全局难度设置高亮状态
        this.syncWithGlobalDifficulty();
    }

    private onNormalDifficultyClick() {
        console.log('普通难度被点击');
        game.myGlobal.stageDifficulty = 0; // 0表示普通难度
        this.highlightNormal();
        // 发送难度切换事件
        director.emit(game.gameEvent.GAME_DIFFICULTY_CHANGE);
    }

    private onEliteDifficultyClick() {
        console.log('精英难度被点击');
        game.myGlobal.stageDifficulty = 1; // 1表示精英难度
        this.highlightElite();
        // 发送难度切换事件
        director.emit(game.gameEvent.GAME_DIFFICULTY_CHANGE);
    }

    private syncWithGlobalDifficulty() {
        const difficulty = game.myGlobal.stageDifficulty;
        if (difficulty === 0) { // 0表示普通难度
            this.highlightNormal();
        } else if (difficulty === 1) { // 1表示精英难度
            this.highlightElite();
        } else {
            this.clearHighlight();
        }
    }

    private clearHighlight() {
        if (this.normalHighlightSprite) {
            this.normalHighlightSprite.node.active = false;
        }
        
        if (this.eliteHighlightSprite) {
            this.eliteHighlightSprite.node.active = false;
        }
    }

    private highlightNormal() {
        this.clearHighlight();
        if (this.normalHighlightSprite) {
            this.normalHighlightSprite.node.active = true;
        }
    }

    private highlightElite() {
        this.clearHighlight();
        if (this.eliteHighlightSprite) {
            this.eliteHighlightSprite.node.active = true;
        }
    }
} 