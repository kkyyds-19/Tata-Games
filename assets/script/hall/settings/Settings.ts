import { _decorator, Component, Node, Toggle, Label, Button, sys } from 'cc';
import { MusicManager } from '../../music/MusicManager';
import { UserSettings } from '../../user/UserSettings';
import { UserInfoData } from '../../user/UserInfoData';
const { ccclass, property } = _decorator;

@ccclass('Settings')
export class Settings extends Component {

    @property({
        type: Toggle,
        displayName: "音乐开关"
    })
    public music: Toggle | null = null;

    @property({
        type: Toggle,
        displayName: "音效开关"
    })
    public sound: Toggle | null = null;

    @property({
        type: Toggle,
        displayName: "低画质"
    })
    public low_quality: Toggle | null = null;

    @property({
        type: Toggle,
        displayName: "高画质"
    })
    public high_quality: Toggle | null = null;

    @property({
        type: Label,
        displayName: "用户ID标签"
    })
    public uidLabel: Label | null = null;

    @property({
        type: Label,
        displayName: "版本号标签"
    })
    public versionLabel: Label | null = null;

    @property({
        type: Button,
        displayName: "用户协议按钮"
    })
    public userAgreementButton: Button | null = null;

    @property({
        type: Button,
        displayName: "隐私协议按钮"
    })
    public privacyPolicyButton: Button | null = null;

    @property({
        type: Button,
        displayName: "兑换码按钮"
    })
    public redeemCodeButton: Button | null = null;

    @property({
        type: Button,
        displayName: "选服按钮"
    })
    public selectServerButton: Button | null = null;

    @property({
        type: Button,
        displayName: "防沉迷公告按钮"
    })
    public antiAddictionButton: Button | null = null;

    @property({
        type: Button,
        displayName: "绑定手机号按钮"
    })
    public bindPhoneButton: Button | null = null;

    @property(Node)
    public setting_bg:Node | null = null;

    // 用户设置管理器
    private userSettings: UserSettings = null;

    start() {
        // 初始化用户设置
        this.userSettings = UserSettings.getInstance();
        
        this.initializeUI();
        this.setupEventListeners();
        this.loadSettings();

        this.setting_bg.on(Node.EventType.TOUCH_START , (event)=>{
            console.log('stage_setting')
            // 在Cocos Creator中阻止事件传播的方法
            if (event && typeof event.stopPropagation === 'function') {
                event.stopPropagation();
            } else if (event) {
                event.propagationStopped = true;
            }
            return false; // 返回false阻止事件继续传播
        }, this)

        this.node.on(Node.EventType.TOUCH_START , ()=>{
            // 如果自动选择激活，禁用用户交互
                  this.hide()

                return
            
        }, this)

    }

    public hide(){
        this.node.active = false;
    }
    public show(){
        this.node.active = true;
    }

    /**
     * 初始化UI显示
     */
    private initializeUI() {
        // 设置用户ID
        if (this.uidLabel) {
            const uid = this.generateOrGetUID();
            this.uidLabel.string = `UID: ${uid}`;
        }

        // 设置版本号
        if (this.versionLabel) {
            this.versionLabel.string = `版本: 1.0.0`;
        }
    }

    /**
     * 设置事件监听
     */
    private setupEventListeners() {
        // 音乐开关
        if (this.music) {
            this.music.node.on(Toggle.EventType.TOGGLE, this.onMusicToggle, this);
        }

        // 音效开关
        if (this.sound) {
            this.sound.node.on(Toggle.EventType.TOGGLE, this.onSoundToggle, this);
        }

        // 画质设置
        if (this.low_quality) {
            this.low_quality.node.on(Toggle.EventType.TOGGLE, this.onLowQualityToggle, this);
        }

        if (this.high_quality) {
            this.high_quality.node.on(Toggle.EventType.TOGGLE, this.onHighQualityToggle, this);
        }

        // 按钮事件
        if (this.userAgreementButton) {
            this.userAgreementButton.node.on(Button.EventType.CLICK, this.onUserAgreementClicked, this);
        }

        if (this.privacyPolicyButton) {
            this.privacyPolicyButton.node.on(Button.EventType.CLICK, this.onPrivacyPolicyClicked, this);
        }

        if (this.redeemCodeButton) {
            this.redeemCodeButton.node.on(Button.EventType.CLICK, this.onRedeemCodeClicked, this);
        }

        if (this.selectServerButton) {
            this.selectServerButton.node.on(Button.EventType.CLICK, this.onSelectServerClicked, this);
        }

        if (this.antiAddictionButton) {
            this.antiAddictionButton.node.on(Button.EventType.CLICK, this.onAntiAddictionClicked, this);
        }

        if (this.bindPhoneButton) {
            this.bindPhoneButton.node.on(Button.EventType.CLICK, this.onBindPhoneClicked, this);
        }

    }

    /**
     * 音乐开关事件
     */
    private onMusicToggle(toggle: Toggle) {
        const musicManager = MusicManager.getInstance();
        if (musicManager) {
            musicManager.setMusicEnabled(toggle.isChecked);
        }
    }

    /**
     * 音效开关事件
     */
    private onSoundToggle(toggle: Toggle) {
        const musicManager = MusicManager.getInstance();
        if (musicManager) {
            musicManager.setSoundEnabled(toggle.isChecked);
            musicManager.playButtonClickSound()
        }

    }

    /**
     * 高画质Toggle事件
     */
    private onHighQualityToggle(toggle: Toggle) {
        if (toggle.isChecked) {
            this.userSettings.setHighQuality(true);
            // 自动取消低画质
            if (this.low_quality) {
                this.low_quality.isChecked = false;
            }
        } else {
            // 如果取消高画质，自动选择低画质
            this.userSettings.setHighQuality(false);
            if (this.low_quality) {
                this.low_quality.isChecked = true;
            }
        }
    }

    /**
     * 低画质Toggle事件
     */
    private onLowQualityToggle(toggle: Toggle) {
        if (toggle.isChecked) {
            this.userSettings.setHighQuality(false);
            // 自动取消高画质
            if (this.high_quality) {
                this.high_quality.isChecked = false;
            }
        } else {
            // 如果取消低画质，自动选择高画质
            this.userSettings.setHighQuality(true);
            if (this.high_quality) {
                this.high_quality.isChecked = true;
            }
        }
    }

    /**
     * 生成或获取用户ID
     */
    private generateOrGetUID(): string {
        const userInfoData = UserInfoData.getInstance();
        let uid = userInfoData.getUserId();
        
        return uid;
    }

    /**
     * 从UserSettings加载设置
     */
    private loadSettings() {
        if (!this.userSettings) return;

        // 设置画质Toggle (互斥)
        const isHighQuality = this.userSettings.getHighQuality();
        if (this.high_quality) {
            this.high_quality.isChecked = isHighQuality;
        }
        if (this.low_quality) {
            this.low_quality.isChecked = !isHighQuality;
        }

        // 设置音频Toggle
        const musicManager = MusicManager.getInstance();
        if (musicManager) {
            if (this.music) {
                this.music.isChecked = musicManager.isMusicEnabled();
            }
            if (this.sound) {
                this.sound.isChecked = musicManager.isSoundEnabled();
            }
        }
    }

    // 按钮点击事件处理 - 功能预留
    private onUserAgreementClicked() {
        console.log('点击用户协议');
        // TODO: 显示用户协议界面
    }

    private onPrivacyPolicyClicked() {
        console.log('点击隐私协议');
        // TODO: 显示隐私协议界面
    }

    private onRedeemCodeClicked() {
        console.log('点击兑换码');
        // TODO: 显示兑换码输入界面
    }

    private onSelectServerClicked() {
        console.log('点击选服');
        // TODO: 显示服务器选择界面
    }

    private onAntiAddictionClicked() {
        console.log('点击防沉迷公告');
        // TODO: 显示防沉迷公告
    }

    private onBindPhoneClicked() {
        console.log('点击绑定手机号');
        // TODO: 显示手机号绑定界面
    }

    

    onDestroy() {
       
    }
}
