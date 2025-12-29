import { _decorator, Component, Node, Label, Sprite, resources, director, Button } from 'cc';
import { game } from 'cc';
import { MusicManager } from '../../music/MusicManager';

const { ccclass, property } = _decorator;

@ccclass('DnfItemq')
export class DnfItemq extends Component {

    
    @property({ type: [Sprite], tooltip: "框框数组，共4个" })
    public starSprites: Sprite[] = [];

    @property({ type: Sprite, tooltip: "icon背景图Sprite" })
    public backgroundSprite: Sprite = null;

    @property({ type: Sprite, tooltip: "标题底框Sprite" })
    public titleBackgroundSprite: Sprite = null;

    @property({ type: Sprite, tooltip: "标题Sprite" })
    public titleSprite: Sprite = null;

    @property({ type: Sprite, tooltip: "左边怪兽Sprite" })
    public leftSprite: Sprite = null;

    @property({ type: Label, tooltip: "挑战次数" })
    public tiaozhanLabel: Label = null;

    // 添加开始按钮引用
    @property({ type: Node, tooltip: "开始按钮节点" })
    public startButton: Node = null;

    /**
     * 初始化段落显示
     * @param rarity 皮肤品质
     * @param skinIds 该品质下的皮肤ID列表
     * @param onIconClick 点击任意图标时的回调函数
     */
    public init(idx: number, skinIds: number, onIconClick?: (skinId: number) => void) {
        // if (!skinIds) {
        //     this.node.active = false;
        //     return;
        // }

        this.updateTitle(idx,skinIds);
   
        this.node.active = true;
        
        // 添加事件监听
        this.setupEventListeners();
    }

    private setupEventListeners() {
        if (this.startButton) {
            this.startButton.on(Node.EventType.TOUCH_END, () => {
                // 调用onStartClick时不传递参数
                this.onStartClick();
            }, this);
        }
    }

    /**
     * 更新标题显示
     */
    private updateTitle(count: number, skinIds: number) {
        if (this.tiaozhanLabel) {
            const maxCount = 20; // 根据需求，固定最大值为20
            this.tiaozhanLabel.string = `挑战次数: (${count}/${maxCount})`;
        }

        this.updateBackground(skinIds);
        this.updateTitleBg(skinIds);
        this.updateLeftSkin(skinIds);
    }

    private updateBackground(skinIds: number) {
        if (!this.backgroundSprite || !this.backgroundSprite.spriteAtlas) {
            console.warn("[DnfIcon] 背景Sprite或其图集未设置");
            return;
        }

        let frameName = "dnf_11"; // 默认传说
        if (skinIds === 1) { // 神话
            frameName = "dnf_10";
        }
        
        const spriteFrame = this.backgroundSprite.spriteAtlas.getSpriteFrame(frameName);
        if (spriteFrame) {
            this.backgroundSprite.spriteFrame = spriteFrame;
        } else {
            console.warn(`[DnfIcon] 在图集中未找到背景框: ${frameName}`);
        }
    }

    private updateTitleBg(skinIds: number) {
        if (!this.titleBackgroundSprite || !this.titleBackgroundSprite.spriteAtlas) {
            console.warn("[DnfIcon] 背景Sprite或其图集未设置");
            return;
        }

        let frameName = "dnf_35"; // 默认传说
        if (skinIds === 1) { // 神话
            frameName = "dnf_36";
        }
        
        const spriteFrame = this.titleBackgroundSprite.spriteAtlas.getSpriteFrame(frameName);
        if (spriteFrame) {
            this.titleBackgroundSprite.spriteFrame = spriteFrame;
        } else {
            console.warn(`[DnfIcon] 在图集中未找到背景框: ${frameName}`);
        }

        let frameName2 = "dnf_28"; // 默认传说
        if (skinIds === 1) { // 神话
            frameName2 = "dnf_39";
        }
        const spriteFrame2 = this.titleSprite.spriteAtlas.getSpriteFrame(frameName2);
        if (spriteFrame2) {
            this.titleSprite.spriteFrame = spriteFrame2;
        } else {
            console.warn(`[DnfIcon] 在图集中未找到背景框: ${frameName2}`);
        }
    }

    private updateLeftSkin(skinIds: number) {
        if (!this.leftSprite || !this.leftSprite.spriteAtlas) {
            console.warn("[DnfIcon] 背景Sprite或其图集未设置");
            return;
        }

        let frameName = "dnf_1"; // 默认传说
        if (skinIds === 1) { // 神话
            frameName = "dnf_2";
        }
        
        const spriteFrame = this.leftSprite.spriteAtlas.getSpriteFrame(frameName);
        if (spriteFrame) {
            this.leftSprite.spriteFrame = spriteFrame;
        } else {
            console.warn(`[DnfIcon] 在图集中未找到背景框: ${frameName}`);
        }
    }

    //开始进入游戏
    /**
     * 开始游戏 - 切换到游戏场景
     * @param stageId 关卡编号（可选，用于设置当前关卡）
     */
    private onStartClick(event?: Event) {
        console.warn("dnf游戏开始");
        MusicManager.getInstance().stopBackgroundMusic();
        game.myGlobal.gameInited = 0;
        game.myGlobal.currentStage = 12;
        // TimeManager.getInstance().pause();
        // game.myGlobal.currentWorld = 3;
        // director.emit(game.gameEvent.GAME_HALL_WORLD_CHANGE);
        console.log(`开始游戏，关卡：${game.myGlobal.currentStage}`);
       
        director.loadScene('game');
    }
   
}

