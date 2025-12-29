import { _decorator, Component, director, game, resources, Prefab, SpriteFrame, AudioClip, SpriteAtlas, JsonAsset, Sprite, UITransform, Widget, view } from 'cc';
import { GameEntry } from '../global/Entry';
import { Label } from 'cc';
import { ProgressBar } from 'cc';
import { ResourceConfig } from '../global/config/ResourceConfig';
import { AssetDownloader } from '../http/AssetDownloader';
import { NetworkConfig } from '../global/config/NetworkConfig';
import { VersionManager } from '../global/VersionManager';
// import { enableMultTextures } from '../../multTextures/MultTextures';
// import { enableMultTextures } from '../global/MultTextures';
import { profiler } from 'cc';
import { SmartLoginManager, LoginResult, PlatformType } from './SmartLoginManager';
import { ConfigAnalyze } from '../config/ConfigAnalyze';
import { Cfgs } from '../config/Cfgs';
import { UILoginMobile } from './UILoginMobile';
import { UILoginPassword } from './UILoginPassword';
import { UIForgetPassword } from './UIForgetPassword';
import { Node } from 'cc';
import { welcomeCtrl } from './welcomeCtrl';
import { EncryptUtils } from '../utils/EncryptUtils';
import { NetEvents } from '../global/EventManager';
const { ccclass, property } = _decorator;

// profiler.hideStats();
GameEntry.entryGame()


@ccclass('Welcome')
export class Welcome extends Component {

    @property(Label)
    btnLabel: Label = null

    @property(Label)
    btnLabel2: Label = null

    @property(ProgressBar)
    progressBar: ProgressBar = null

    @property(Sprite)
    public welcomeBg: Sprite | null = null;

    private g_loading: Node;
    private uiLoginMobile: UILoginMobile;
    private uiLoginPassword: UILoginPassword;
    private uiForgetPassword: UIForgetPassword;

    private totalResources: number = 0;
    private loadedResources: number = 0;
    private smartLoginManager: SmartLoginManager;

    private uiLoginUI:Node = null;
    private welcomeNode:Node = null;
    private btn_start:Node = null;
    private btn_kefu:Node = null;

    protected onLoad(): void {

        const st = this;
        st.g_loading = st.node.getChildByName("g_loading");
        st.uiLoginMobile = st.node.getChildByName("login_mobile").getComponent(UILoginMobile);
        st.uiLoginPassword = st.node.getChildByName("login_password").getComponent(UILoginPassword);
        st.uiForgetPassword = st.node.getChildByName("forget_password").getComponent(UIForgetPassword);
        st.uiLoginUI = st.node.getChildByName("loginUI");
        st.welcomeNode = st.node.getChildByName("default_sprite_splash");
        st.btn_start = st.uiLoginUI.getChildByName("btn_start");
        st.btn_kefu = st.uiLoginUI.getChildByName("btn_kefu");

        director.on(game.gameEvent.WELCOME_UI_SHOW, st.onWelcomeUIShow, st);
        director.on(game.gameEvent.WELCOME_PASSWORD_LOGIN, st.onWelcomePasswordLogin, st);
        director.on(game.gameEvent.WELCOME_SMS_LOGIN, st.onWelcomeSMSLogin, st);
        director.on(game.gameEvent.WELCOME_LOGIN_CODE, st.onWelcomeLoginCode, st);

        st.btn_start.on(Node.EventType.TOUCH_END, st.onBtnStartClick, st);
        st.btn_kefu.on(Node.EventType.TOUCH_END, st.onBtnKefuClick, st);

         // 只对新注册用户设置开屏动画
        st.checkAndSetGuideForNewUser();
    }

    protected onDestroy(): void {
        const st = this;
        director.off(game.gameEvent.WELCOME_UI_SHOW, st.onWelcomeUIShow, st);
        director.off(game.gameEvent.WELCOME_PASSWORD_LOGIN, st.onWelcomePasswordLogin, st);
        director.off(game.gameEvent.WELCOME_SMS_LOGIN, st.onWelcomeSMSLogin, st);
        director.off(game.gameEvent.WELCOME_LOGIN_CODE, st.onWelcomeLoginCode, st);
    }

    start() {
        welcomeCtrl.Ins.load();
        this.g_loading.active = false;
        this.onWelcomeUIShow("uiLoginPassword", false);
        this.onWelcomeUIShow("uiLoginMobile");
        this.initSmartLoginManager();

        // 确保欢迎页背景铺满屏幕
        this.scheduleOnce(() => {
            this.adjustWelcomeBackgroundToFullScreen();
        }, 0.2);
    }

    onBtnKefuClick(){
        
    }

    onBtnStartClick(){
        
    }

    private async onWelcomePasswordLogin() {
        const st = this;
        director.emit(NetEvents.NET_SHOW_BLOCKER);
        // await this.smartLoginManager.handleWebLogin();
        director.emit(NetEvents.NET_HIDE);
    }

    private async onWelcomeSMSLogin() {
        const st = this;
        director.emit(NetEvents.NET_SHOW_BLOCKER);
        await this.smartLoginManager.handleSMSLogin();
        director.emit(NetEvents.NET_HIDE);
    }

    private async onWelcomeLoginCode() {
        const st = this;
        director.emit(NetEvents.NET_SHOW_BLOCKER);

        try {
            await this.smartLoginManager.handleLoginCode();
        } catch (error) {
            console.error('Welcome: 登录流程异常', error);
            // this.updateLoadingText("登录异常，继续加载资源...");
            // this.startPreload();
            director.emit(NetEvents.NET_HIDE);
        }
    }

     /**
     * 检查并为新用户设置开屏动画
     * 只有新注册的用户才会显示开屏动画
     */
    private checkAndSetGuideForNewUser(): void {
        // 检查是否已经设置过showGuide（表示不是新用户）
        const existingGuideStatus = localStorage.getItem("showGuide");
        
        // 如果从未设置过showGuide，说明是新用户，设置为1显示开屏动画
        // 如果已经设置过（值为"2"表示已看过，或其他值），则不再显示
        if (existingGuideStatus === null || existingGuideStatus === undefined) {
            console.log('[Welcome] 检测到新用户，设置开屏动画');
            localStorage.setItem("showGuide", "1");
        } else {
            console.log('[Welcome] 老用户登录，跳过开屏动画，当前状态:', existingGuideStatus);
        }
    }

    /**
     * 初始化智能登录管理器
     */
    private initSmartLoginManager(): void {
        this.smartLoginManager = SmartLoginManager.getInstance();

        // 等待登录管理器准备就绪
        this.waitForLoginManagerReady();
    }

    /**
     * 等待登录管理器准备就绪
     */
    private async waitForLoginManagerReady(): Promise<void> {
        const st = this;
        // 等待登录管理器初始化完成
        while (!st.smartLoginManager.isReady()) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('Welcome: 登录管理器准备就绪，开始智能登录流程');

        st.smartLoginManager.setHandler(
            (result: LoginResult) => {
                console.log('Welcome: 登录成功', result);
                st.uiLoginUI.active = false;
                st.welcomeNode.active = true;
                switch (st.smartLoginManager.getPlatformType()) {
                    case PlatformType.WEB:
                        st.g_loading.active = true;
                        st.onWelcomeUIShow("uiLoginMobile", false);
                        break;
                    case PlatformType.WECHAT:
                        break;
                    default:
                        break;
                }
                const platformText = st.smartLoginManager.getPlatformText();
                st.updateLoadingText(`${platformText}登录成功，开始加载资源...`);
                st.startPreload();
            },
            (result: LoginResult) => {
                console.error('Welcome: 登录失败', result);
                st.uiLoginUI.active = true;
                st.welcomeNode.active = false;
                // 登录失败时也继续加载资源，但显示错误信息
                // setTimeout(() => {
                //     st.updateLoadingText("继续加载资源...");
                //     st.startPreload();
                // }, 2000);

                switch (st.smartLoginManager.getPlatformType()) {
                    case PlatformType.WEB:
                        break;
                    case PlatformType.WECHAT:
                        st.g_loading.active = true;
                        st.updateLoadingText("登录微信平台失败: " + result.message);
                        break;
                    default:
                        st.g_loading.active = true;
                        st.updateLoadingText("登录平台失败: " + result.message);
                        break;
                }

            },
            (result: LoginResult) => {
                // st.uiLoginUI.active = false;
                // st.welcomeNode.active = true;
                director.emit(NetEvents.NET_HIDE);
                console.log('Welcome: 登录流程完成', result);
            });
        // 开始智能登录
        await st.startSmartLogin();
    }

    /**
     * 开始智能登录流程
     */
    private async startSmartLogin(): Promise<void> {
        this.updateLoadingText("正在检查登录状态...");

        try {
            await this.smartLoginManager.startSmartLogin(
                // (result: LoginResult) => {
                //     console.log('Welcome: 登录成功', result);
                //     const platformText = this.smartLoginManager.getPlatformText();
                //     this.updateLoadingText(`${platformText}登录成功，开始加载资源...`);
                //     this.startPreload();
                // },
                // (result: LoginResult) => {
                //     console.error('Welcome: 登录失败', result);
                //     // 登录失败时也继续加载资源，但显示错误信息
                //     // setTimeout(() => {
                //     //     this.updateLoadingText("继续加载资源...");
                //     //     this.startPreload();
                //     // }, 2000);

                //     switch (this.smartLoginManager.getPlatformType()) {
                //         case PlatformType.WEB:
                //             this.g_loading.active = false;
                //             this.onWelcomeUIShow("uiLoginPassword");
                //             break;
                //         case PlatformType.WECHAT:
                //             this.g_loading.active = true;
                //             this.updateLoadingText("登录微信平台失败: " + result.message);
                //             break;
                //         default:
                //             this.g_loading.active = true;
                //             this.updateLoadingText("登录平台失败: " + result.message);
                //             break;
                //     }
                // },
                // (result: LoginResult) => {
                //     console.log('Welcome: 登录流程完成', result);
                // }
            );
        } catch (error) {
            console.error('Welcome: 登录流程异常', error);
            this.updateLoadingText("登录异常，继续加载资源...");
            this.startPreload();
        }
    }

    private async startPreload() {
        // 最先获取版本清单文件
        await this.fetchVersionData();
        this.g_loading.active = true;
        this.onWelcomeUIShow("uiForgetPassword", false);
        this.onWelcomeUIShow("uiLoginMobile", false);
        this.onWelcomeUIShow("uiLoginPassword", false);

        this.updateLoadingText("正在统计资源...");

        // 计算总资源数量
        this.totalResources = this.calculateTotalResources();
        this.loadedResources = 0;

        this.updateProgress(0);
        this.updateLoadingText("开始加载资源...");

        try {
            //加载配置
            await ConfigAnalyze.Ins.loadData();

            // 预加载各类资源
            await this.preloadPrefabs();
            await this.preloadGameBackgrounds();
            await this.preloadBigImages();
            await this.preloadSpriteAtlas();
            await this.preloadTTFFonts();
            await this.preloadHeroSpines();
            await this.preloadAudio();
            await this.preloadScenes();

            this.updateLoadingText("开始下载关卡文件...");
            //NOTE暂不下载关卡
            // await this.downloadStageFiles();

            this.updateLoadingText("资源加载完成！");
            this.updateProgress(1);

            // 延迟一下再跳转到主场景
            setTimeout(() => {
                this.enterGame();
            }, 500);

        } catch (error) {
            console.error("资源加载失败:", error);
            this.updateLoadingText("资源加载失败，请刷新重试");
        }
    }

    private calculateTotalResources(): number {
        let total = 0;
        total += ResourceConfig.prefabList.length; // 预制体
        total += ResourceConfig.game_bg_list.length; // 游戏背景
        total += ResourceConfig.ther_big_img_list.length; // 大图片
        total += ResourceConfig.spriteAtlas_plist_list.length; // 图集
        total += ResourceConfig.heros_list.length * 2; // 英雄spine + 图标
        total += ResourceConfig.ttffont_list.length; // TTF字体文件
        total += ResourceConfig.scene_list.length; // 场景文件
        total += ResourceConfig.soundFiles.length + ResourceConfig.bgmFiles.length; // 音效文件 + 音乐文件

        //NOTE暂不下载关卡
        // total += 30; // 30个关卡文件

        return total;
    }

    /**
     * 调整欢迎页背景以填满整个屏幕，参考 GameManager.adjustBackgroundToFullScreen
     */
    private adjustWelcomeBackgroundToFullScreen(): void {
        // 若未通过 Inspector 绑定，尝试从节点名获取
        if (!this.welcomeBg) {
            const node = this.node.getChildByName("default_sprite_splash");
            if (node) {
                this.welcomeBg = node.getComponent(Sprite);
            }
        }

        if (!this.welcomeBg || !this.welcomeBg.node) {
            console.warn('welcomeBg 或其节点不存在');
            return;
        }

        const bgNode = this.welcomeBg.node;

        // 延迟执行，确保Sprite资源已经加载完成
        this.scheduleOnce(() => {
            const designResolution = view.getDesignResolutionSize();
            const visibleSize = view.getVisibleSize();

            // 设置Sprite的SizeMode为CUSTOM，允许自定义尺寸
            this.welcomeBg.sizeMode = Sprite.SizeMode.CUSTOM;

            const uiTransform = bgNode.getComponent(UITransform);
            if (uiTransform) {
                const scaleX = visibleSize.width / designResolution.width;
                const scaleY = visibleSize.height / designResolution.height;
                const maxScale = Math.max(scaleX, scaleY);

                // 增加 20% 以确保完全覆盖（与游戏背景一致）
                const bgWidth = designResolution.width * maxScale * 1.2;
                const bgHeight = designResolution.height * maxScale * 1.2;

                uiTransform.setContentSize(bgWidth, bgHeight);
                uiTransform.setAnchorPoint(0.5, 0.5);
            }

            // 背景节点居中
            bgNode.setPosition(0, 0, 0);

            // 移除可能存在的Widget组件，避免与自适配冲突
            const existingWidget = bgNode.getComponent(Widget);
            if (existingWidget) {
                bgNode.removeComponent(existingWidget);
            }

            console.log('欢迎页背景已调整为全屏显示', {
                designResolution: designResolution,
                visibleSize: visibleSize,
                bgSize: uiTransform ? { width: uiTransform.width, height: uiTransform.height } : 'unknown'
            });
        }, 0.1);
    }

    private async preloadPrefabs(): Promise<void> {
        this.updateLoadingText("加载预制体资源...");

        for (const prefabInfo of ResourceConfig.prefabList) {
            try {
                await this.loadResource<Prefab>(`${prefabInfo.path}`, Prefab);
                this.onResourceLoaded(`预制体: ${prefabInfo.name}`);
            } catch (error) {
                console.warn(`预制体加载失败: ${prefabInfo.path}`, error);
                this.onResourceLoaded(`预制体: ${prefabInfo.name} (失败)`);
            }
        }
    }

    private async preloadGameBackgrounds(): Promise<void> {
        this.updateLoadingText("加载背景图片...");

        for (const bgPath of ResourceConfig.game_bg_list) {
            try {
                await this.loadResource<SpriteFrame>(`${bgPath}/spriteFrame`, SpriteFrame);
                this.onResourceLoaded(`背景: ${bgPath}`);
            } catch (error) {
                console.warn(`背景图片加载失败: ${bgPath}`, error);
                this.onResourceLoaded(`背景: ${bgPath} (失败)`);
            }
        }
    }

    private async preloadBigImages(): Promise<void> {
        this.updateLoadingText("加载大图片资源...");

        for (const imgPath of ResourceConfig.ther_big_img_list) {
            try {
                await this.loadResource<SpriteFrame>(`${imgPath}/spriteFrame`, SpriteFrame);
                this.onResourceLoaded(`大图片: ${imgPath}`);
            } catch (error) {
                console.warn(`大图片加载失败: ${imgPath}`, error);
                this.onResourceLoaded(`大图片: ${imgPath} (失败)`);
            }
        }
    }

    private async preloadSpriteAtlas(): Promise<void> {
        this.updateLoadingText("加载图集资源...");

        for (const atlasPath of ResourceConfig.spriteAtlas_plist_list) {
            try {
                await this.loadResource<SpriteAtlas>(`${atlasPath}`, SpriteAtlas);
                this.onResourceLoaded(`图集: ${atlasPath}`);
            } catch (error) {
                console.warn(`图集加载失败: ${atlasPath}`, error);
                this.onResourceLoaded(`图集: ${atlasPath} (失败)`);
            }
        }
    }

    private async preloadTTFFonts(): Promise<void> {
        this.updateLoadingText("加载字体文件...");

        for (const fontPath of ResourceConfig.ttffont_list) {
            try {
                await this.loadResource(`${fontPath}`, Object);
                this.onResourceLoaded(`字体: ${fontPath}`);
            } catch (error) {
                console.warn(`字体文件加载失败: ${fontPath}`, error);
                this.onResourceLoaded(`字体: ${fontPath} (失败)`);
            }
        }
    }

    private async preloadHeroSpines(): Promise<void> {
        this.updateLoadingText("加载英雄动画...");

        for (const hero of ResourceConfig.heros_list) {
            try {
                // 加载spine动画资源
                await this.loadResource(`${hero.path}`, Object);
                this.onResourceLoaded(`英雄动画: ${hero.name}`);
            } catch (error) {
                console.warn(`英雄spine加载失败: ${hero.path}`, error);
                this.onResourceLoaded(`英雄动画: ${hero.name} (失败)`);
            }
        }
    }



    private async preloadAudio(): Promise<void> {
        this.updateLoadingText("加载音频资源...");

        // 加载音效文件
        for (const soundPath of ResourceConfig.soundFiles) {
            try {
                await this.loadResource<AudioClip>(soundPath, AudioClip);
                this.onResourceLoaded(`音效: ${soundPath}`);
            } catch (error) {
                console.warn(`音效加载失败: ${soundPath}`, error);
                this.onResourceLoaded(`音效: ${soundPath} (失败)`);
            }
        }

        // 加载背景音乐文件
        for (const bgmPath of ResourceConfig.bgmFiles) {
            try {
                await this.loadResource<AudioClip>(bgmPath, AudioClip);
                this.onResourceLoaded(`音乐: ${bgmPath}`);
            } catch (error) {
                console.warn(`背景音乐加载失败: ${bgmPath}`, error);
                this.onResourceLoaded(`音乐: ${bgmPath} (失败)`);
            }
        }
    }

    private async preloadScenes(): Promise<void> {
        this.updateLoadingText("预加载场景文件...");

        for (const scenePath of ResourceConfig.scene_list) {
            try {
                await this.preloadScene(scenePath);
                this.onResourceLoaded(`场景: ${scenePath}`);
            } catch (error) {
                console.warn(`场景预加载失败: ${scenePath}`, error);
                this.onResourceLoaded(`场景: ${scenePath} (失败)`);
            }
        }
    }

    /**
     * 预加载单个场景文件（只下载，不切换）
     * @param sceneName 场景名称
     * @returns Promise
     */
    private preloadScene(sceneName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            director.preloadScene(sceneName, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`场景 ${sceneName} 预加载完成（资源已下载，但未切换）`);
                    resolve();
                }
            });
        });
    }

    /**
     * 获取并初始化版本数据
     */
    private async fetchVersionData(): Promise<void> {
        try {
            this.updateLoadingText("正在获取版本信息...");
            // 附加时间戳来“破坏”缓存，确保每次都获取最新的版本文件
            const url = `${NetworkConfig.ASSETS_VERSIONS_URL}?nocache=${new Date().getTime()}`;
            const versionAsset = await AssetDownloader.getInstance().download<JsonAsset>(url);
            VersionManager.getInstance().initialize(versionAsset.json);
        } catch (error) {
            console.warn("获取远程版本文件失败，将使用本地资源或缓存。", error);
            // 初始化一个空的版本管理器，防止后续调用出错
            VersionManager.getInstance().initialize({});
        }
    }

    private async downloadStageFiles(): Promise<void> {
        this.updateLoadingText("下载关卡数据...");
        const baseUrl = NetworkConfig.STAGE_DATA_BASE_URL;
        const totalStages = 30;

        for (let i = 1; i <= totalStages; i++) {
            const fileName = `stage${i}.json`;
            let url = `${baseUrl}${i}.json`;

            // 从VersionManager获取版本号并拼接到URL
            const version = VersionManager.getInstance().getVersion(fileName);
            if (version) {
                url += `?v=${version}`;
            }

            try {
                await AssetDownloader.getInstance().download<JsonAsset>(url);
                // 下载成功后，将带版本号的URL添加到全局清单
                game.myGlobal.downloadedAssets.add(url);
                this.onResourceLoaded(`关卡文件: ${fileName}`);
            } catch (error) {
                console.warn(`关卡文件下载失败: ${url}`, error);
                this.onResourceLoaded(`关卡文件: ${fileName} (失败)`);
            }
        }
        console.log("所有关卡文件下载完成。");
    }

    private loadResource<T>(path: string, type: any): Promise<T> {
        return new Promise((resolve, reject) => {
            resources.load(path, type, (err, resource) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(resource as T);
                }
            });
        });
    }

    private onResourceLoaded(resourceName: string) {
        this.loadedResources++;
        const progress = this.loadedResources / this.totalResources;
        this.updateProgress(progress);
        console.log(`已加载: ${resourceName} (${this.loadedResources}/${this.totalResources})`);
    }

    private updateProgress(progress: number) {
        if (this.progressBar) {
            this.progressBar.progress = progress;
        }
    }

    private updateLoadingText(text: string) {
        if (this.btnLabel) {
            this.btnLabel.string = text;
        }
        console.log(text);
    }

    private enterGame() {
        // 显示登录状态信息
        this.showLoginStatus();

        // 延迟一下再跳转到主场景
        setTimeout(() => {
            director.loadScene("hall");
        }, 1000);
    }

    /**
     * 显示登录状态信息
     */
    private showLoginStatus(): void {
        if (this.smartLoginManager && this.smartLoginManager.isLoggedIn()) {
            const platformText = this.smartLoginManager.getPlatformText();
            const statusText = this.smartLoginManager.getStatusText();
            const userInfo = this.smartLoginManager.getCurrentUserInfo();

            console.log('Welcome: 登录状态信息', {
                platform: platformText,
                status: statusText,
                userInfo: userInfo
            });

            this.updateLoadingText(`${platformText}登录成功，准备进入游戏...`);
        } else {
            this.updateLoadingText("准备进入游戏...");
        }
    }

    onWelcomeUIShow(ui: string, isShow: boolean = true) {
        const st = this;
        switch (ui) {
            case "uiLoginMobile":
                isShow ? st.uiLoginMobile.setData() : st.uiLoginMobile.node.active = false;
                break;
            case "uiLoginPassword":
                isShow ? st.uiLoginPassword.setData() : st.uiLoginPassword.node.active = false;
                break;
            case "uiForgetPassword":
                isShow ? st.uiForgetPassword.setData() : st.uiForgetPassword.node.active = false;
                break;
        }
    }
}

