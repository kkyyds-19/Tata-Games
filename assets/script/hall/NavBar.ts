import { game } from 'cc';
import { tween } from 'cc';
import { Vec3 } from 'cc';
import { Tween } from 'cc';
import { director } from 'cc';
import { _decorator, Component, Node, Button } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 导航栏组件
 * 管理导航栏中的按钮列表
 */
@ccclass('NavBar')
export class NavBar extends Component {
    
    /**
     * 按钮组件列表
     */
    @property([Button])
    public buttonList: Button[] = [];

    /**
     * 当前激活的按钮索引
     */
    private activeButtonIndex: number = -1;

    onLoad() {
        this.initButtons();
    }

    start() {
        // 初始化第一个按钮为激活状态
        if (this.buttonList.length > 0) {
            this.setActiveButton(2);
        }
    }

    /**
     * 初始化按钮事件
     */
    private initButtons(): void {
        this.buttonList.forEach((button, index) => {
            if (button && button.node) {
                // 为每个按钮添加点击事件
                button.node.on(Button.EventType.CLICK, () => {
                    this.onButtonClick(index);
                }, this);
            }
        });
    }



    /**
     * 按钮点击事件处理
     * @param index 按钮索引
     */
    private onButtonClick(index: number): void {
        this.setActiveButton(index);
        
        // 触发自定义事件，通知其他组件按钮被点击
    }

    //取消所有按钮的激活状态的视觉效果
    private cancelAllButton(): void {
        this.buttonList.forEach((button) => {
            if (button && button.node) {
                const icon = button.node.getChildByName('light');
                if (icon) {
                    icon.active = false;
                }

                const icon_spr = button.node.getChildByName('icon_spr');
                if(icon_spr){
                    // Tween.stopAllByTarget(icon_spr);
                    // icon_spr.setScale(1,1);
                    // icon_spr.setPosition(0,0);
                    Tween.stopAllByTarget(icon_spr);

                    tween(icon_spr)
                      .to(0.2, {
                        scale: new Vec3(1, 1, 1),
                        position: new Vec3(0, 0, 0)
                      }, {
                        easing: 'cubicInOut'
                      })
                      .start();
                    


                }
            }
        });
    }
  

    /**
     * 设置激活的按钮
     * @param index 按钮索引
     */
    public setActiveButton(index: number): void {
        if (index < 0 || index >= this.buttonList.length) {
            console.warn(`[NavBar] Invalid button index: ${index}`);
            return;
        }

        this.cancelAllButton();
        

        // 设置新的激活按钮
        this.activeButtonIndex = index;
        const activeButton = this.buttonList[index];
        if (activeButton && activeButton.node) {
            // 可以在这里添加激活状态的视觉效果
            const activeIcon = activeButton.node.getChildByName('light');
            if (activeIcon) {
                activeIcon.active = true;
            }

            const icon_spr = activeButton.node.getChildByName('icon_spr');
            if(icon_spr){
                // 停止所有对该节点的 tween 动画
                Tween.stopAllByTarget(icon_spr);
                // 开始新 tween 动画
                tween(icon_spr)
                    .to(0.2, {
                    scale: new Vec3(1.6, 1.6, 1),      // 平滑放大
                    position: new Vec3(0, 20, 0)       // 平滑位移
                    }, {
                    easing: 'cubicInOut'                 // 缓动函数（可换成 'cubicInOut' 等）
                    })
                    .start();
             }

        }

        director.emit(game.gameEvent.HALL_NAV_BUTTON_CLICK, index);
    }

    /**
     * 获取当前激活的按钮索引
     */
    public getActiveButtonIndex(): number {
        return this.activeButtonIndex;
    }

    /**
     * 获取按钮数量
     */
    public getButtonCount(): number {
        return this.buttonList.length;
    }

    /**
     * 根据索引获取按钮
     * @param index 按钮索引
     */
    public getButton(index: number): Button | null {
        if (index >= 0 && index < this.buttonList.length) {
            return this.buttonList[index];
        }
        return null;
    }

    /**
     * 启用/禁用指定按钮
     * @param index 按钮索引
     * @param enabled 是否启用
     */
    public setButtonEnabled(index: number, enabled: boolean): void {
        const button = this.getButton(index);
        if (button) {
            button.enabled = enabled;
            // 同时设置节点的交互状态
            if (button.node) {
                button.node.getComponent(Button).interactable = enabled;
            }
        }
    }

    /**
     * 启用/禁用所有按钮
     * @param enabled 是否启用
     */
    public setAllButtonsEnabled(enabled: boolean): void {
        this.buttonList.forEach((button, index) => {
            this.setButtonEnabled(index, enabled);
        });
    }

    /**
     * 销毁时清理事件监听
     */
    onDestroy(): void {
       
    }
} 