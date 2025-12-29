import { director, game } from 'cc';
import { _decorator, Component, Node, Sprite, Button, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MailMenus')
export class MailMenus extends Component {

    @property({
        type: Sprite,
        displayName: "背景遮罩"
    })
    markbg: Sprite = null!;

    @property({
        type: Sprite,
        displayName: "菜单背景"
    })
    menusbg: Sprite = null!;

    @property({
        type: Button,
        displayName: "邮箱按钮"
    })
    mailButton: Button = null!;

    @property({
        type: Button,
        displayName: "背包按钮"
    })
    bagButton: Button = null!;

    @property({
        type: Button,
        displayName: "图鉴按钮"
    })
    bookButton: Button = null!;

    @property({
        type: Button,
        displayName: "设置按钮"
    })
    settingsButton: Button = null!;

    @property({
        type: Button,
        displayName: "小游戏按钮"
    })
    minigameButton: Button = null!;


    onLoad(){
         // 默认隐藏
         this.hideImmediate();
         this.setupButtonEvents();
        
    }

    start() {
       
    }

    /**
     * 设置按钮事件
     */
    private setupButtonEvents() {
        if (this.mailButton) {
            this.mailButton.node.on(Button.EventType.CLICK, this.onMailClicked, this);
        }
        
        if (this.bagButton) {
            this.bagButton.node.on(Button.EventType.CLICK, this.onBagClicked, this);
        }
        
        if (this.bookButton) {
            this.bookButton.node.on(Button.EventType.CLICK, this.onBookClicked, this);
        }
        
        if (this.settingsButton) {
            this.settingsButton.node.on(Button.EventType.CLICK, this.onSettingsClicked, this);
        }
        
        if (this.minigameButton) {
            this.minigameButton.node.on(Button.EventType.CLICK, this.onMinigameClicked, this);
        }

        // 点击背景遮罩隐藏菜单
        if (this.markbg) {
            this.markbg.node.on(Node.EventType.TOUCH_START, ()=>{
                    this.hide()
            }, this);
        }
    }

    /**
     * 显示菜单（带动画）
     */
    public show() {
        this.hideImmediate()

        this.node.active = true;

        // 使用 scheduleOnce 确保在下一帧执行，避免第一次显示时的时序问题
        this.scheduleOnce(() => {
            // 确保节点在这一帧是激活的
            this.node.active = true;
            
            if (this.menusbg) {
                this.menusbg.node.active = true;
                this.menusbg.node.setScale(0.1, 0.1, 1); // 从更小开始
                const menuColor = this.menusbg.color.clone();
                menuColor.a = 255;
                this.menusbg.color = menuColor;
                
                // 菜单背景缩放弹出动画
                tween(this.menusbg.node)
                    .to(0.4, { scale: Vec3.ONE }, { easing: 'backOut' })
                    .start();
            }
        }, 0);
    }

    /**
     * 隐藏菜单（带动画）
     */
    public hide() {
    if (!this.node.active) {
            return;
        }
        this.node.active = false;
        // 菜单背景缩放消失动画
        // if (this.menusbg) {
        //     tween(this.menusbg.node)
        //         .to(0.2, { scale: new Vec3(0.5, 0.5, 1) }, { easing: 'backIn' })
        //         .call(() => {
        //             this.node.active = false;
        //         })
        //         .start();
        // } else {
        //     // 如果没有菜单背景，直接隐藏
        //     this.node.active = false;
        // }

    }

    /**
     * 立即隐藏（无动画）
     */
    private hideImmediate() {
        this.node.active = false;
        
        // 设置初始状态
        if (this.menusbg) {
            this.menusbg.node.setScale(0.1, 0.1, 1);
        }
    }

    /**
     * 切换显示/隐藏状态
     */
    public toggle() {
        if (this.node.active) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 获取当前显示状态
     */
    public getVisible(): boolean {
        return this.node.active;
    }

    //100 邮箱 101 背包 102 图鉴 103 设置 104 小游戏
     // 按钮点击事件处理方法
    private onMailClicked() {
        // TODO: 实现邮箱功能
        director.emit(game.gameEvent.GAME_ACTIVITY_MENU_CLICK, 100);
        this.hide();
    }

    private onBagClicked() {
        // TODO: 实现背包功能
        director.emit(game.gameEvent.GAME_ACTIVITY_MENU_CLICK, 101);
        this.hide();
    }

    private onBookClicked() {
        // TODO: 实现图鉴功能
        director.emit(game.gameEvent.GAME_ACTIVITY_MENU_CLICK, 102);
        this.hide();
    }

    private onSettingsClicked() {
        // TODO: 实现设置功能
        director.emit(game.gameEvent.GAME_ACTIVITY_MENU_CLICK, 103);
        this.hide();
    }

    private onMinigameClicked() {
        // TODO: 实现小游戏功能
        director.emit(game.gameEvent.GAME_ACTIVITY_MENU_CLICK, 104);
        this.hide();
    }

    onDestroy() {
      
    }
}
