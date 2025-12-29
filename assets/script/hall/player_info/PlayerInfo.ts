import { _decorator, Component, Node, Button, Label, instantiate, Toggle } from 'cc';
import { PlayerAvatar } from './PlayerAvatar';
import { PlayerFrame } from './PlayerFrame';
import { ProgressBar } from 'cc';
import { Prefab } from 'cc';
import { PlayerNameEdit } from './PlayerNameEdit';
import { ResourceConfig } from '../../global/config/ResourceConfig';
import { resources } from 'cc';
import { userAPI } from '../../api/API';
import { UserInfoData } from '../../user/UserInfoData';
import { director } from 'cc';
import { game } from 'cc';

const { ccclass, property } = _decorator;

// 选项卡类型枚举
enum TabType {
    AVATAR = 'avatar',      // 头像
    FRAME = 'frame',        // 头像框
    BUBBLE = 'bubble',      // 气泡
    TITLE = 'title'         // 称号
}

@ccclass('PlayerInfo')
export class PlayerInfo extends Component {

    @property(PlayerAvatar)
    public playerAvatar: PlayerAvatar = null;

    @property(Label)
    public playerName: Label = null;

    //用户名修改器
    @property(PlayerNameEdit)
    public playerNameEdit: PlayerNameEdit = null;

    @property(Prefab)
    public playerAvatarPrefabs: Prefab = null;

    @property(Prefab)
    public playerAvatarBgPrefabs: Prefab = null;

    //经验进度条
    @property(ProgressBar)
    public playerProgress: ProgressBar = null;

    // 选项卡按钮
    @property(Button)
    public avatarTabButton: Button = null;

    @property(Button)
    public frameTabButton: Button = null;

    @property(Button)
    public bubbleTabButton: Button = null;

    @property(Button)
    public titleTabButton: Button = null;

    // 微信头像开关
    @property(Toggle)
    public wxAvatarToggle: Toggle = null;

   

    //用户头像列表根节点
    @property(Node)
    public playerAvatarRoot: Node = null;

    @property(Node)
    public playerAvatarList: Node = null;

    //用户头像底框根节点
    @property(Node)
    public playerAvatarBgRoot: Node = null;

    //用户头像底框列表
    @property(Node)
    public playerAvatarBgList: Node = null;

    //气泡根节点
    @property(Node)
    public playerBubbleRoot: Node = null;

    //气泡列表
    @property(Node)
    public playerBubbleList: Node = null;

    //称号
    @property(Node)
    public playerTitleRoot: Node = null;

    //称号列表
    @property(Node)
    public playerTitleList: Node = null;

    // 当前选中的选项卡
    private currentTab: TabType = TabType.AVATAR;

    // 当前选中的头像
    private currentSelectedAvatar: PlayerAvatar = null;

    // 当前选中的头像框
    private currentSelectedFrame: PlayerFrame = null;

    // 防重复点击标志
    private isProcessingRequest: boolean = false;

    // 模拟头像数据
    private mockAvatars = [
        { id: '1001', name: '默认头像', icon: 'h_0_0_0' },
        { id: '1002', name: '战士头像', icon: 'h_0_0_1' },
        { id: '1003', name: '法师头像', icon: 'h_1_0_0' },
        { id: '1004', name: '射手头像', icon: 'h_2_0_0' },
        { id: '1005', name: '刺客头像', icon: 'h_4_0_0' },
        { id: '1006', name: '德鲁伊头像', icon: 'h_1_0_1' },
        { id: '1007', name: '药剂师头像', icon: 'h_2_0_1' },
        { id: '1008', name: '冰法头像', icon: 'h_3_0_1' },
        { id: '1009', name: '绿林头像', icon: 'h_4_0_2' },
        { id: '1010', name: '博士头像', icon: 'h_4_0_1' },
        { id: '1011', name: '艾格文头像', icon: 'h_3_0_3' }
    ];

    // 模拟头像框数据
    private mockFrames = [
        { id: 'eq_fr_0', name: '默认头像框', icon: 'eq_fr_0' },
        { id: 'eq_fr_1', name: '青铜头像框', icon: 'eq_fr_1' },
        { id: 'eq_fr_2', name: '白银头像框', icon: 'eq_fr_2' },
        { id: 'eq_fr_3', name: '黄金头像框', icon: 'eq_fr_3' },
        { id: 'eq_fr_4', name: '钻石头像框', icon: 'eq_fr_4' },
        { id: 'eq_fr_5', name: '传说头像框', icon: 'eq_fr_5' },
        { id: 'eq_fr_6', name: '神话头像框', icon: 'eq_fr_2' },
        { id: 'eq_fr_7', name: '史诗头像框', icon: 'eq_fr_3' },
        { id: 'eq_fr_8', name: '稀有头像框', icon: 'eq_fr_4' },
        { id: 'eq_fr_9', name: '普通头像框', icon: 'eq_fr_5' }
    ];

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, ()=>{
        }, this);

        // 绑定选项卡按钮事件
        this.bindTabButtons();
        
        // 绑定微信头像开关事件
        this.bindWxAvatarToggle();

        director.on(game.gameEvent.HALL_USER_INFO_UPDATE, this.refreshUserInfo, this);

        // 延迟0.5秒刷新
        this.scheduleOnce(() => {
            this.refreshUserInfo();
        }, 0.5);
    }

    onDestroy() {
        director.off(game.gameEvent.HALL_USER_INFO_UPDATE, this.refreshUserInfo, this);
    }


    private refreshUserInfo(){
        if(this.playerAvatar){
            this.playerAvatar.setAvatar(UserInfoData.getInstance().getAvatar());
        }

        if(this.playerName){
            this.playerName.string = UserInfoData.getInstance().getNickname();
        }

        if(this.wxAvatarToggle){
            this.wxAvatarToggle.isChecked = UserInfoData.getInstance().getUseWxAvatar();
        }
    }

    private bindTabButtons() {
        this.avatarTabButton.node.on(Button.EventType.CLICK, () => this.switchTab(TabType.AVATAR), this);
        this.frameTabButton.node.on(Button.EventType.CLICK, () => this.switchTab(TabType.FRAME), this);
        this.bubbleTabButton.node.on(Button.EventType.CLICK, () => this.switchTab(TabType.BUBBLE), this);
        this.titleTabButton.node.on(Button.EventType.CLICK, () => this.switchTab(TabType.TITLE), this);
    }

    /**
     * 绑定微信头像开关事件
     */
    private bindWxAvatarToggle() {
        if (this.wxAvatarToggle) {
            this.wxAvatarToggle.node.on(Toggle.EventType.TOGGLE, this.onWxAvatarToggleChanged, this);
        }
    }

    /**
     * 微信头像开关状态改变事件
     */
    private onWxAvatarToggleChanged(toggle: Toggle) {
        const useWxAvatar = toggle.isChecked;
        console.log('PlayerInfo: 微信头像开关状态改变:', useWxAvatar);
        
        // 更新UserInfoData中的设置
        UserInfoData.getInstance().setUseWxAvatar(useWxAvatar);
        
        // 触发HALL_USER_INFO_UPDATE事件
        director.emit(game.gameEvent.HALL_USER_INFO_UPDATE);
    }

    private init() {
        //初始化 头像 
    }

    public show() {
        this.node.active = true;
        this.switchTab(TabType.AVATAR); // 默认显示头像选项卡
    }

    public hide() {
        this.node.active = false;
    }

    public showPlayerNameEdit(){
        this.playerNameEdit.show();
    }

    /**
     * 切换选项卡
     */
    private switchTab(tabType: TabType) {
        this.currentTab = tabType;
        
        // 更新按钮高亮状态
        this.updateTabButtonHighlight();
        
        // 更新内容区域显示
        this.updateContentArea();
        
        // 根据选项卡类型加载对应内容
        this.loadTabContent(tabType);
    }

    /**
     * 更新选项卡按钮高亮状态
     */
    private updateTabButtonHighlight() {
        // 重置所有按钮高亮
        this.setButtonHighlight(this.avatarTabButton, false);
        this.setButtonHighlight(this.frameTabButton, false);
        this.setButtonHighlight(this.bubbleTabButton, false);
        this.setButtonHighlight(this.titleTabButton, false);

        // 设置当前按钮高亮
        switch (this.currentTab) {
            case TabType.AVATAR:
                this.setButtonHighlight(this.avatarTabButton, true);
                break;
            case TabType.FRAME:
                this.setButtonHighlight(this.frameTabButton, true);
                break;
            case TabType.BUBBLE:
                this.setButtonHighlight(this.bubbleTabButton, true);
                break;
            case TabType.TITLE:
                this.setButtonHighlight(this.titleTabButton, true);
                break;
        }
    }

    /**
     * 设置按钮高亮状态
     */
    private setButtonHighlight(button: Button, isHighlight: boolean) {
        const lightNode = button.node.getChildByName('light');
        if (lightNode) {
            lightNode.active = isHighlight;
        }
    }

    /**
     * 更新内容区域显示
     */
    private updateContentArea() {
        // 隐藏所有内容区域
        this.playerAvatarRoot.active = false;
        this.playerAvatarBgRoot.active = false;
        this.playerBubbleRoot.active = false;
        this.playerTitleRoot.active = false;

        // 显示当前选项卡对应的内容区域
        switch (this.currentTab) {
            case TabType.AVATAR:
                this.playerAvatarRoot.active = true;
                break;
            case TabType.FRAME:
                this.playerAvatarBgRoot.active = true;
                break;
            case TabType.BUBBLE:
                this.playerBubbleRoot.active = true;
                break;
            case TabType.TITLE:
                this.playerTitleRoot.active = true;
                break;
        }
    }

    /**
     * 加载选项卡内容
     */
    private loadTabContent(tabType: TabType) {
        switch (tabType) {
            case TabType.AVATAR:
                this.loadAvatarList();
                break;
            case TabType.FRAME:
                this.loadFrameList();
                break;
            case TabType.BUBBLE:
                this.loadBubbleList();
                break;
            case TabType.TITLE:
                this.loadTitleList();
                break;
        }
    }

    /**
     * 加载头像列表
     */
    private loadAvatarList() {
        // 清空现有列表
        this.playerAvatarList.removeAllChildren();

        //查找当前选中的头像
         const currentAvatar = UserInfoData.getInstance().getAvatar();

        this.mockAvatars.forEach((avatar, index) => {
            const playerAvatar = this.createAvatarItem(avatar, index);
            if(playerAvatar.iconFrameName == currentAvatar){
                playerAvatar.setSelected(true);
                this.currentSelectedAvatar = playerAvatar;
            }
        });

        //默认选择第一个
        // if(this.playerAvatarList.children.length > 0){
        //     const playerAvatar = this.playerAvatarList.children[0].getComponent(PlayerAvatar);
        //     if(playerAvatar){
        //         playerAvatar.setSelected(true);
        //         this.currentSelectedAvatar = playerAvatar;
        //     }
        // }

   

        
         
    }

    /**
     * 创建头像列表项
     */
    private createAvatarItem(avatar: any, index: number) {
        const prefab = this.playerAvatarPrefabs;
        // 实例化预制体
        const itemNode = instantiate(prefab);
        this.playerAvatarList.addChild(itemNode);

        // 设置头像数据
        const playerAvatar = itemNode.getComponent(PlayerAvatar);
        playerAvatar.setAvatar(avatar.icon);
        playerAvatar.setSelected(false);
        playerAvatar.setNewTag(false);

        // 设置点击回调
        playerAvatar.setOnClickCallback((avatar: string, iconFrameName: string) => {
            this.onAvatarSelected(avatar, playerAvatar);
        });

        return playerAvatar;
    }

    /**
     * 头像选择事件
     */
    private onAvatarSelected(avatar: any, selectedAvatar: PlayerAvatar) {
        // 取消其他头像的选中状态
        this.clearAvatarSelection();
        
        // 设置当前头像为选中状态
        selectedAvatar.setSelected(true);
        this.currentSelectedAvatar = selectedAvatar;
        
        // TODO: 更新用户头像
        // UserInfoData.getInstance().setAvatar(avatar.id);
    }

    /**
     * 清除所有头像的选中状态
     */
    private clearAvatarSelection() {
        const avatarItems = this.playerAvatarList.children;
        avatarItems.forEach(item => {
            const playerAvatar = item.getComponent(PlayerAvatar);
            if (playerAvatar) {
                playerAvatar.setSelected(false);
            }
        });
        this.currentSelectedAvatar = null;
    }

    /**
     * 加载头像框列表
     */
    private loadFrameList() {
        // 清空现有列表
        this.playerAvatarBgList.removeAllChildren();

        // 加载头像框预制体并创建列表项
        this.mockFrames.forEach((frame, index) => {
            this.createFrameItem(frame, index);
        });
    }

    /**
     * 创建头像框列表项
     */
    private createFrameItem(frame: any, index: number) {
        const prefab = this.playerAvatarBgPrefabs;
        if (!prefab) {
            console.error('PlayerInfo: playerAvatarBgPrefabs 预制体为空！');
            return;
        }
        
        // 实例化预制体
        const itemNode = instantiate(prefab);
        this.playerAvatarBgList.addChild(itemNode);

        // 设置头像框数据
        const playerFrame = itemNode.getComponent(PlayerFrame);
        if (!playerFrame) {
            console.error('PlayerInfo: 预制体上没有找到 PlayerFrame 组件！');
            return;
        }
        
        playerFrame.setFrame(frame.icon);
        playerFrame.setSelected(false);
        // playerFrame.setNewTag(false);

        // 设置点击回调
        playerFrame.setOnClickCallback((frameId: string) => {
            this.onFrameSelected(frame, playerFrame);
        });
    }

    /**
     * 头像框选择事件
     */
    private onFrameSelected(frame: any, selectedFrame: PlayerFrame) {
        // 取消其他头像框的选中状态
        this.clearFrameSelection();
        
        // 设置当前头像框为选中状态
        selectedFrame.setSelected(true);
        this.currentSelectedFrame = selectedFrame;
        
        // TODO: 更新用户头像框
        // UserInfoData.getInstance().setAvatarFrameId(frame.id);
    }

    /**
     * 清除所有头像框的选中状态
     */
    private clearFrameSelection() {
        const frameItems = this.playerAvatarBgList.children;
        frameItems.forEach(item => {
            const playerFrame = item.getComponent(PlayerFrame);
            if (playerFrame) {
                playerFrame.setSelected(false);
            }
        });
        this.currentSelectedFrame = null;
    }

    /**
     * 加载气泡列表（预留）
     */
    private loadBubbleList() {
        // TODO: 实现气泡列表加载
    }

    /**
     * 加载称号列表（预留）
     */
    private loadTitleList() {
        // TODO: 实现称号列表加载
    }

    /**
     * 使用按钮点击事件
     */
    private async onUseButtonClick() {
        // 防重复点击检查
        if (this.isProcessingRequest) {
            return;
        }

        try {
            this.isProcessingRequest = true;
            
            switch (this.currentTab) {
                case TabType.AVATAR:
                    await this.handleAvatarUse();
                    break;
                case TabType.FRAME:
                    await this.handleFrameUse();
                    break;
                case TabType.BUBBLE:
                    await this.handleBubbleUse();
                    break;
                case TabType.TITLE:
                    await this.handleTitleUse();
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('PlayerInfo: 使用按钮处理失败:', error);
        } finally {
            this.isProcessingRequest = false;
        }
    }

    /**
     * 处理头像使用
     */
    private async handleAvatarUse() {
        if (!this.currentSelectedAvatar) {
            return;
        }

        try {
            // 获取选中的头像信息
            const avatarInfo = this.currentSelectedAvatar.getAvatarInfo();

            // 调用API修改头像
            const result = await userAPI.updateIcon(avatarInfo.iconFrameName);
            
            if(result.code == 200){
                // 更新本地数据
                UserInfoData.getInstance().setAvatar(avatarInfo.iconFrameName);
                
                // 当用户成功切换本地头像时，设置useWxAvatar为false
                UserInfoData.getInstance().setUseWxAvatar(false);
                
                // 同步Toggle按钮状态
                if (this.wxAvatarToggle) {
                    this.wxAvatarToggle.isChecked = false;
                }
                
                console.log('PlayerInfo: 头像切换成功，已关闭微信头像使用');
            }

        } catch (error) {
            console.error('PlayerInfo: 头像修改失败:', error);
            // 可以在这里添加错误提示
            // 例如：显示错误消息、播放错误音效等
        }
    }

    /**
     * 处理头像框使用（预留）
     */
    private async handleFrameUse() {
        // TODO: 实现头像框使用功能
    }

    /**
     * 处理气泡使用（预留）
     */
    private async handleBubbleUse() {
        // TODO: 实现气泡使用功能
    }

    /**
     * 处理称号使用（预留）
     */
    private async handleTitleUse() {
        // TODO: 实现称号使用功能
    }
}