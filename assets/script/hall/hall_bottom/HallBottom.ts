import { spriteAssembler } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Button, Label } from 'cc';
import { director, game } from 'cc';
import { UserHomeData } from '../../user/UserHomeData';
import { GameEvent } from '../../global/event/GameEvent';
import { NodeEventType } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HallBottom')
export class HallBottom extends Component {

    @property(Button)
    arrowButtonLeft: Button = null;

    @property(Button)
    arrowButtonRight: Button = null;

    @property(Button)
    idleIncomeButton: Button = null;

    @property(Label)
    estimatedIncomeLabel: Label = null;

    @property(Button)
    starTotalButton: Button = null;

    @property(Label)
    starTotalLabel: Label = null;

    @property(Button)
    normalChestButton: Button = null;

    @property(Button)
    advancedChestButton: Button = null;

    @property(Button)
    fullHealthChestButton: Button = null;

    private btn_world_select: Button;


    public normalChestButtonisopen: boolean = false;
    public advancedChestButtonisopen: boolean = false;
    public fullHealthChestButtonisopen: boolean = false;

    private userHomeData: UserHomeData;

    onLoad() {
        const st = this;
        st.userHomeData = UserHomeData.getInstance();
        st.initializeButtons();
        st.updateLabels();
        st.setupEventListeners();
        st.btn_world_select = st.node.getChildByPath("btn_world_select")?.getComponent(Button);

        st.btn_world_select?.node.on(NodeEventType.TOUCH_END, st.onBtnWorldSelectClick, st);
    }

    start() {
        this.initializeCurrentStage();
    }

    onDestroy() {
        const st = this;
        // 移除事件监听器
        director.off(game.gameEvent.HALL_USER_INFO_UPDATE, this.onUserInfoUpdate, this);
    }

    /**
     * 初始化当前关卡
     */
    private initializeCurrentStage() {
        // 确保全局变量有默认值
        if (!game.myGlobal.currentStage) {
            game.myGlobal.currentStage = 1;
        }
        this.updateArrowButtonStates();

    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners() {
        // 监听用户信息更新事件
        director.on(game.gameEvent.HALL_USER_INFO_UPDATE, this.onUserInfoUpdate, this);
    }

    /**
     * 用户信息更新事件处理
     */
    private onUserInfoUpdate() {
        this.updateLabels();
        this.updateArrowButtonStates();
    }

    /**
     * 初始化按钮事件
     */
    private initializeButtons() {
        // 左箭头按钮
        if (this.arrowButtonLeft) {
            this.arrowButtonLeft.node.on('click', this.onLeftArrowClick, this);
        }

        // 右箭头按钮
        if (this.arrowButtonRight) {
            this.arrowButtonRight.node.on('click', this.onRightArrowClick, this);
        }

        // 挂机收益按钮
        if (this.idleIncomeButton) {
            this.idleIncomeButton.node.on('click', this.onIdleIncomeClick, this);
        }

        // 星星总数按钮
        if (this.starTotalButton) {
            this.starTotalButton.node.on('click', this.onStarTotalClick, this);
        }

        // 普通宝箱按钮
        if (this.normalChestButton) {
            this.normalChestButton.node.on('click', this.onNormalChestClick, this);
        }

        // 高级宝箱按钮
        if (this.advancedChestButton) {
            this.advancedChestButton.node.on('click', this.onAdvancedChestClick, this);
        }

        // 满血宝箱按钮
        if (this.fullHealthChestButton) {
            this.fullHealthChestButton.node.on('click', this.onFullHealthChestClick, this);
        }
    }

    /**
     * 更新标签文本
     */
    private updateLabels() {
        // 更新估计收益
        this.updateEstimatedIncome();

        // 更新星星总数
        this.updateStarTotal();
    }

    /**
     * 左箭头按钮点击事件（向后一关）
     */
    private onLeftArrowClick() {
        console.log('左箭头按钮被点击');

        // 检查是否可以向后移动（基于最大解锁关卡）
        const maxStage = game.myGlobal.maxStage || 1;
        if (game.myGlobal.currentStage >= maxStage) {
            console.log('已到达最大解锁关卡，无法向后移动');
            return;
        }

        // 移动到下一关
        game.myGlobal.currentStage += 1;

        // 发送关卡选择事件
        director.emit(game.gameEvent.HALL_STAGE_SELECTED, game.myGlobal.currentStage - 1, game.myGlobal.currentStage);

        console.log(`移动到第${game.myGlobal.currentStage}关`);

        // 更新按钮状态
        this.updateArrowButtonStates();
    }

    /**
     * 右箭头按钮点击事件（向前一关）
     */
    private onRightArrowClick() {
        console.log('右箭头按钮被点击');

        // 检查是否可以向前移动
        if (game.myGlobal.currentStage <= 1) {
            console.log('已到达第一关，无法向前移动');
            return;
        }

        // 移动到上一关
        game.myGlobal.currentStage -= 1;

        // 发送关卡选择事件
        director.emit(game.gameEvent.HALL_STAGE_SELECTED, game.myGlobal.currentStage - 1, game.myGlobal.currentStage);

        console.log(`移动到第${game.myGlobal.currentStage}关`);

        // 更新按钮状态
        this.updateArrowButtonStates();
    }

    /**
     * 挂机收益按钮点击事件
     */
    private onIdleIncomeClick() {
        console.log('挂机收益按钮被点击');
        // TODO: 打开挂机收益界面
    }

    /**
     * 星星总数按钮点击事件
     */
    private onStarTotalClick() {
        console.log('星星总数按钮被点击');
        // TODO: 打开星星相关界面
    }

    /**
     * 普通宝箱按钮点击事件
     */
    private onNormalChestClick() {
        console.log('普通宝箱按钮被点击');
        // TODO: 打开普通宝箱
        //修改贴图
        const sprite = this.normalChestButton.node.getComponent(Sprite)

        if (!sprite) return;

        this.normalChestButtonisopen = !this.normalChestButtonisopen;
        const frameName = this.normalChestButtonisopen ? 'hall_stage_open_0' : 'hall_stage_box_0';
        sprite.spriteFrame = sprite.spriteAtlas.getSpriteFrame(frameName)


    }

    /**
     * 高级宝箱按钮点击事件
     */
    private onAdvancedChestClick() {
        console.log('高级宝箱按钮被点击');
        // TODO: 打开高级宝箱
        //修改贴图
        const sprite = this.advancedChestButton.node.getComponent(Sprite)

        if (!sprite) return;

        this.advancedChestButtonisopen = !this.advancedChestButtonisopen;
        const frameName = this.advancedChestButtonisopen ? 'hall_stage_open_1' : 'hall_stage_box_1';
        sprite.spriteFrame = sprite.spriteAtlas.getSpriteFrame(frameName)
    }

    /**
     * 满血宝箱按钮点击事件
     */
    private onFullHealthChestClick() {
        console.log('满血宝箱按钮被点击');
        // TODO: 打开满血宝箱
        //修改贴图
        const sprite = this.fullHealthChestButton.node.getComponent(Sprite)

        if (!sprite) return;

        this.fullHealthChestButtonisopen = !this.fullHealthChestButtonisopen;
        const frameName = this.fullHealthChestButtonisopen ? 'hall_stage_open_2' : 'hall_stage_box_2';
        sprite.spriteFrame = sprite.spriteAtlas.getSpriteFrame(frameName)
    }

    /**
     * 点击世界地图按钮
     */
    private onBtnWorldSelectClick() {
        director.emit(game.gameEvent.GAME_HALL_UI_SHOW, "world_select");
    }

    /**
     * 更新估计收益显示
     */
    public updateEstimatedIncome() {
        if (this.estimatedIncomeLabel) {
            this.estimatedIncomeLabel.string = `挂机收益`;
        }
    }

    /**
     * 更新星星总数显示
     */
    public updateStarTotal() {
        if (this.starTotalLabel) {
            // 从 UserHomeData 获取星星数据
            const totalStatNum = this.userHomeData.getTotalStatNum();
            const statNum = this.userHomeData.getStatNum();
            this.starTotalLabel.string = `${totalStatNum}/${statNum}`;
        }
    }

    /**
     * 获取当前关卡ID
     * @returns 当前关卡ID（1-based）
     */
    public getCurrentStageId(): number {
        return game.myGlobal.currentStage || 1;
    }

    /**
     * 手动刷新UI
     * 供外部调用，强制更新所有显示内容
     */
    public refreshUI() {
        this.updateLabels();
        this.updateArrowButtonStates();
    }

    /**
     * 更新箭头按钮状态和挂机收益按钮可见性
     */
    public updateArrowButtonStates() {
        const maxStage = game.myGlobal.maxStage || 1;
        const currentStage = game.myGlobal.currentStage || 1;

        // 更新左箭头状态（向后一关）
        if (this.arrowButtonLeft) {
            this.arrowButtonLeft.node.active = currentStage < maxStage;
        }

        // 更新右箭头状态（向前一关）
        if (this.arrowButtonRight) {
            this.arrowButtonRight.node.active = currentStage > 1;
        }

        // 更新挂机收益按钮可见性，根据 UserHomeData 的 afkFlag
        if (this.idleIncomeButton) {
            const afkFlag = this.userHomeData.isAfkFlag();
            this.idleIncomeButton.node.active = afkFlag;
        }
    }
}
