import { _decorator, Component, Prefab, instantiate, resources, Node, sp, director, game, input, Input, EventKeyboard, KeyCode, SpriteFrame, Widget, UITransform, view, screen } from 'cc';
import { ResourceConfig } from '../global/config/ResourceConfig';
import { GameConfig } from '../global/config/GameConfig';
import { AnimationLoader } from './AnimationLoader';
import { StageManager } from './stage/StageManager';
import { MonsterData, StageType } from './stage/StageData';
import { Custom2D_Collide_Manager } from '../Custom_Collide/Custom2D_Manager';
import { SkillsChoose } from '../dialog/skills_choose';
import { LevelUpChoiceEvent } from './GameLevelUpManager';
import { Tween, Animation } from 'cc';
import { TimeManager } from './TimeManager';
import { HeroPanel } from './HeroPanel';
import { Heros } from './object/Heros';
import { Sprite } from 'cc';
import { EffectContainer } from './EffectContainer';
import { BulletManager } from './BulletManager';
import { find } from 'cc';
import { DamageStatsManager } from './DamageStatsManager';
import { SkillManager } from './skills/SkillManager';
import { SkillCaster } from './SkillCaster';
import { HerosManager } from './HerosManager';
import { Buff } from './buff/Buff';
import { UserSettings } from '../user/UserSettings';
import { MusicManager } from '../music/MusicManager';
import { UserEquipmentData } from '../user/UserEquipmentData';
import { resManager } from '../utils/resManager';
import { GlobalVariable } from '../global/GlobalVariable';
import { StageComponent } from './stage/StageComponent';

const { ccclass, property } = _decorator;

/**
 * GameManager
 * 用于集中管理和获取游戏中用到的各种组件实例（如UI、数据、系统等）
 * 可通过单例方式全局访问
 */
@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager;

    // 组件引用示例
    // public uiFrameTop: UI_Frame_Top | null = null;
    // public levelData: LevelData | null = null;
    // ... 其他组件

    /** 主画布节点 */
    @property(Node)
    public mainCanvas: Node | null = null;
    /** 游戏背景节点 */
    @property(Sprite)
    public gameBg: Sprite | null = null;

    @property(Node)
    public game_objs: Node | null = null;

    @property(Node)
    public dialog_container: Node | null = null;



    //伤害数字
    @property(Node)
    public popup_container: Node | null = null;

    //特效
    @property(Node)
    public effect_container: Node | null = null;





    // 预制体注册表
    private prefabMap: Map<string, Prefab> = new Map();
    private loadedPrefabNames: string[] = [];
    private instantiatedNodes: Map<string, Node> = new Map();


    @property(StageManager)
    stageManager: StageManager = null;

    private temp_objs: Node;

    onLoad() {
       
        const st = this;
        GameManager._instance = st;
        Custom2D_Collide_Manager.instance.enable = true;
        st.temp_objs = st.node.getChildByPath("bg/temp_objs");

        st.initEventListeners();

        // 【新增】游戏开始时解锁天选装备的关联装备
        UserEquipmentData.getInstance().unlockEquipmentsBasedOnChosenSlots();

        st.initGame(() => {
            console.log(`GMgr-prefab`);
            game.myGlobal.gameInitOne();
        });
    }

    private checkStart() {
        //主动发送一个升级时间 触发第一个英雄上场
        director.emit(game.gameEvent.GAME_LEVEL_UP, { oldLevel: 0, newLevel: 0 });
    }

    /**
     * 将显示关卡编号转换为内部索引 (与map_selection.ts保持一致)
     * @param displayStage 显示关卡编号（1-based）
     * @returns 内部关卡索引（0-based）
     */
    private convertDisplayStageToIndex(displayStage: number): number {
        return displayStage - 1;
    }

    /**
     * 将关卡索引转换为大小关卡 (与map_selection.ts的逻辑对应)
     * @param stageIndex 关卡索引（0-based）
     * @returns {majorStage: number, minorStage: number}
     */
    private convertIndexToMajorMinor(stageIndex: number): { majorStage: number, minorStage: number } {
        const majorStage = Math.floor(stageIndex / GameConfig.MAX_SUB_STAGE) + 1;
        const minorStage = stageIndex % GameConfig.MAX_SUB_STAGE;
        return { majorStage, minorStage };
    }

    initGameObj() {
        this.temp_objs.active = this.stageManager.stageData.stageType == StageType.Outland;
        this.switchBackground();
        console.log(`GMgr-initGameobj`);
        game.myGlobal.gameInitOne();
    }

    private switchBackground() {
        const st = this;
        switch (st.stageManager.stageData.stageType) {
            case StageType.Normal:
                {
                    // 优先读取关卡JSON中的自定义背景字段 bg（如: "1"），不存在则按大关映射
                    const json = StageComponent.getInstance().currentStageJson || {};
                    const bgFromJson = json.bg;
                    if (bgFromJson) {
                        resManager.setSprite(st.gameBg, GlobalVariable.bundleRes, `img/game/game_bg/game_bg_${bgFromJson}`);
                    } else {
                        const currentStageDisplay = game.myGlobal.currentStage;
                        const stageIndex = st.convertDisplayStageToIndex(currentStageDisplay);
                        const { majorStage, minorStage } = st.convertIndexToMajorMinor(stageIndex);
                        resManager.setSprite(st.gameBg, GlobalVariable.bundleRes, `img/game/game_bg/game_bg_${majorStage}`);
                    }
                } break;
            case StageType.Outland:
                {
                    const json = StageComponent.getInstance().currentStageJson;
                    const bg = json.bg || "1";
                    // console.log(`>>>>>>>>>>>>>${bg}`);
                    resManager.setSprite(st.gameBg, GlobalVariable.bundleRes, `img/game/game_bg/game_bg_${bg}`);
                } break;
            case StageType.Dungeon:
                {
                     // 优先读取关卡JSON中的自定义背景字段 bg（如: "1"），不存在则按大关映射
                    const json = StageComponent.getInstance().currentStageJson || {};
                    const bgFromJson = json.bg;
                    if (bgFromJson) {
                        resManager.setSprite(st.gameBg, GlobalVariable.bundleRes, `img/game/game_bg/game_bg_${bgFromJson}`);
                    } else {
                        const currentStageDisplay = game.myGlobal.currentStage;
                        const stageIndex = st.convertDisplayStageToIndex(currentStageDisplay);
                        const { majorStage, minorStage } = st.convertIndexToMajorMinor(stageIndex);
                        resManager.setSprite(st.gameBg, GlobalVariable.bundleRes, `img/game/game_bg/game_bg_7`);
                    }
                
                } break;
                 case StageType.Arena:
                {
                    // 优先读取关卡JSON中的自定义背景字段 bg（如: "1"），不存在则按大关映射
                    const json = StageComponent.getInstance().currentStageJson || {};
                    const bgFromJson = json.bg;
                    if (bgFromJson) {
                        resManager.setSprite(st.gameBg, GlobalVariable.bundleRes, `img/game/game_bg/game_bg_${bgFromJson}`);
                    } else {
                        const currentStageDisplay = game.myGlobal.currentStage;
                        const stageIndex = st.convertDisplayStageToIndex(currentStageDisplay);
                        const { majorStage, minorStage } = st.convertIndexToMajorMinor(stageIndex);
                        resManager.setSprite(st.gameBg, GlobalVariable.bundleRes, `img/game/game_bg/game_bg_11`);
                    }
                }
                break;
                case StageType.Endless:
                {
                    // 优先读取关卡JSON中的自定义背景字段 bg（如: "1"），不存在则按大关映射
                    const json = StageComponent.getInstance().currentStageJson || {};
                    const bgFromJson = json.bg;
                    if (bgFromJson) {
                        resManager.setSprite(st.gameBg, GlobalVariable.bundleRes, `img/game/game_bg/game_bg_${bgFromJson}`);
                    } else {
                        const currentStageDisplay = game.myGlobal.currentStage;
                        const stageIndex = st.convertDisplayStageToIndex(currentStageDisplay);
                        const { majorStage, minorStage } = st.convertIndexToMajorMinor(stageIndex);
                        resManager.setSprite(st.gameBg, GlobalVariable.bundleRes, `img/game/game_bg/game_bg_8`);
                    }
                }
                break;
        }
        
        this.adjustBackgroundToFullScreen();
    }

    /**
     * 调整背景图片以填满整个屏幕
     */
    private adjustBackgroundToFullScreen(): void {
        if (!this.gameBg || !this.gameBg.node) {
            console.warn('gameBg 或其节点不存在');
            return;
        }

        const bgNode = this.gameBg.node;
        
        // 延迟执行，确保Sprite资源已经加载完成
        this.scheduleOnce(() => {
            const designResolution = view.getDesignResolutionSize();
            const visibleSize = view.getVisibleSize();
            
            // 设置Sprite的SizeMode为CUSTOM，允许自定义尺寸
            this.gameBg.sizeMode = Sprite.SizeMode.CUSTOM;
            
            const uiTransform = bgNode.getComponent(UITransform);
            if (uiTransform) {
                const json = StageComponent.getInstance().currentStageJson || {};
                const fitMode = (json.bgFit || json.backgroundFit || 'cover');
                const scaleX = visibleSize.width / designResolution.width;
                const scaleY = visibleSize.height / designResolution.height;
                const scale = fitMode === 'contain' ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);
                const extra = fitMode === 'contain' ? 1 : 1.2;
                const bgWidth = designResolution.width * scale * extra;
                const bgHeight = designResolution.height * scale * extra;

                uiTransform.setContentSize(bgWidth, bgHeight);
                uiTransform.setAnchorPoint(0.5, 0.5);
            }
            
            // 确保背景节点位于屏幕中心
            bgNode.setPosition(0, 0, 0);
            
            // 移除可能存在的Widget组件，避免冲突
            const existingWidget = bgNode.getComponent(Widget);
            if (existingWidget) {
                bgNode.removeComponent(existingWidget);
            }
            
            console.log('背景图片已调整为全屏显示', {
                designResolution: designResolution,
                visibleSize: visibleSize,
                bgSize: uiTransform ? { width: uiTransform.width, height: uiTransform.height } : 'unknown'
            });
        }, 0.1);
    }

    protected start(): void {
        this.initSettings();
        
        // 确保背景图片在游戏开始时也能正确适配
        this.scheduleOnce(() => {
            if (this.gameBg) {
                this.adjustBackgroundToFullScreen();
            }
        }, 0.5);
    }
    initEventListeners() {
        director.on(game.gameEvent.GAME_SHOW_HERO_CHOICE, this.onShowHeroChoice, this)
        director.on(game.gameEvent.GAME_SHOW_SKILL_CHOICE, this.onShowSkillsChoice, this)
        director.on(game.gameEvent.GAME_HIGH_QUALITY_CHANGE, this.onHighQualityChange, this)
        director.on(game.gameEvent.GAME_PARTNER_AUTO_CHANGE, this.onPartnerAutoChange, this)
        director.on(game.gameEvent.GAME_DAMAGE_DISPLAY_CHANGE, this.onDamageDisplayChange, this)
        director.on(game.gameEvent.GAME_EFFECT_DISPLAY_CHANGE, this.onEffectDisplayChange, this)
        director.on(game.gameEvent.GAME_MAP_CFG_LOADED, this.initGameObj, this);
        director.on(game.gameEvent.GAME_START, this.checkStart, this);

        // 添加键盘监听用于速度控制
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }
    closeEventListeners() {
        director.off(game.gameEvent.GAME_SHOW_HERO_CHOICE, this.onShowHeroChoice, this)
        director.off(game.gameEvent.GAME_SHOW_SKILL_CHOICE, this.onShowSkillsChoice, this)
        director.off(game.gameEvent.GAME_HIGH_QUALITY_CHANGE, this.onHighQualityChange, this)
        director.off(game.gameEvent.GAME_PARTNER_AUTO_CHANGE, this.onPartnerAutoChange, this)
        director.off(game.gameEvent.GAME_DAMAGE_DISPLAY_CHANGE, this.onDamageDisplayChange, this)
        director.off(game.gameEvent.GAME_EFFECT_DISPLAY_CHANGE, this.onEffectDisplayChange, this)
        director.off(game.gameEvent.GAME_MAP_CFG_LOADED, this.initGameObj, this);
        director.off(game.gameEvent.GAME_START, this.checkStart, this);

        // 移除键盘监听
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }
    onHighQualityChange(event: any) {
        const highQuality = UserSettings.getInstance().getHighQuality()
        console.log('高画质', highQuality)
        // this.popup_container.active= highQuality
    }
    onPartnerAutoChange(event: any) {
        const autoPartner = UserSettings.getInstance().getAutoPartner()
        console.log('伙伴自动', autoPartner)
    }
    onDamageDisplayChange(event: any) {
        const showDamageNumbers = UserSettings.getInstance().getShowDamageNumbers()
        console.log('伤害数字', showDamageNumbers)
        this.popup_container.active = showDamageNumbers
    }
    onEffectDisplayChange(event: any) {
        const showEffects = UserSettings.getInstance().getShowEffects()
        console.log('特效', showEffects)

        this.effect_container.active = showEffects
    }
    initSettings() {
        this.onHighQualityChange(null)
        this.onPartnerAutoChange(null)
        this.onDamageDisplayChange(null)
        this.onEffectDisplayChange(null)
    }

    onShowHeroChoice(event: LevelUpChoiceEvent) {
        const stageType = this.stageManager?.stageData?.stageType ?? game.myGlobal.stageType;
        if (stageType === StageType.Arena) {
            const node = this.dialog_container.getChildByName('skills_choose');
            if (node) node.active = false;
            return;
        }
        const node = this.dialog_container.getChildByName('skills_choose')
        node.getComponent(SkillsChoose).updateUi(event, game.gameEvent.GAME_SHOW_HERO_CHOICE)
        node.active = true
        // 暂停游戏时间流逝
        TimeManager.getInstance().pause()
    }
    onShowSkillsChoice(event: LevelUpChoiceEvent) {
        const stageType = this.stageManager?.stageData?.stageType ?? game.myGlobal.stageType;
        if (stageType === StageType.Arena) {
            const node = this.dialog_container.getChildByName('skills_choose');
            if (node) node.active = false;
            return;
        }
        const node = this.dialog_container.getChildByName('skills_choose')
        node.getComponent(SkillsChoose).updateUi(event, game.gameEvent.GAME_SHOW_SKILL_CHOICE)
        node.active = true
        // 暂停游戏时间流逝
        TimeManager.getInstance().pause()
    }

    /**
     * 键盘按键处理
     */
    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.DIGIT_1:
                // 按 1 键：正常速度
                TimeManager.getInstance().resumeToNormal();
                console.log('设置为正常速度 (1x)');
                break;
            case KeyCode.DIGIT_2:
                // 按 2 键：2倍速
                TimeManager.getInstance().setDoubleSpeed();
                console.log('设置为 2 倍速 (2x)');
                break;
        }
    }




    public static getInstance(): GameManager {
        return GameManager._instance;
    }

    /**
     * 游戏初始化，加载所有Prefab和动画资源，加载完成后可选回调
     */
    public initGame(onComplete?: () => void) {
        // 先初始化动画资源
        this.initAnimationResources(() => {
            // 动画资源加载完成后，再加载Prefabs
            this.loadAllPrefabs(onComplete);
        });
    }

    /**
     * 初始化动画资源
     */
    private initAnimationResources(onComplete?: () => void) {
        // 开始初始化动画资源

        // 加载怪物动画
        AnimationLoader.loadAllAnimationsFromPath('anim/monster', (clips) => {
            // 怪物动画加载完成

            // 可以在这里添加更多动画路径的加载
            // AnimationLoader.loadAllAnimationsFromPath('anim/hero', (heroClips) => {
            //     // 英雄动画加载完成
            // });

            onComplete && onComplete();
        });
    }

    /**
     * 加载所有Prefab，加载和实例化后立即初始化组件
     */
    public loadAllPrefabs(onComplete?: () => void) {
        this.loadedPrefabNames = [];
        let total = ResourceConfig.prefabList.length;
        let loaded = 0;
        ResourceConfig.prefabList.forEach(item => {
            resources.load(item.path, Prefab, (err, prefab) => {
                loaded++;
                let node: Node | null = null;
                if (!err && prefab) {
                    this.registerPrefab(item.name, prefab);
                    this.loadedPrefabNames.push(item.name);
                    // 有父节点则实例化
                    let parent: Node | null = null;
                    if (item.parent === 'Canvas') {
                        parent = this.mainCanvas;
                    } else if (item.parent === 'bg') {
                        parent = this.gameBg.node;
                    } else if (item.parent === 'dialog_container') {
                        parent = this.dialog_container;
                    }
                    if (parent) {
                        node = instantiate(prefab);
                        node.active = false;
                        node.parent = parent;
                        this.instantiatedNodes.set(item.name, node);
                        this.initComponentForItem(item, node);
                        // Prefab已加载
                    }
                } else {
                    console.error(`[GameManager] 加载Prefab失败: ${item.name} (${item.path})`, err);
                }

                if (loaded === total) {
                    // 所有Prefab加载完成
                    onComplete && onComplete();
                }
            });
        });
    }

    /**
     * 注册Prefab（可选）
     */
    public registerPrefab(name: string, prefab: Prefab) {
        this.prefabMap.set(name, prefab);
    }

    /**
     * 获取已注册的Prefab
     */
    public getPrefab(name: string): Prefab | undefined {
        return this.prefabMap.get(name);
    }

    /**
     * 针对每个 prefab 加载和实例化后立即初始化
     */
    private initComponentForItem(item: any, node: Node | null) {
        if (!node) return;
        // 其他组件初始化动作可继续扩展
    }

    private sortTimer: number = 0;
    private readonly SORT_INTERVAL: number = 0.2; // 每0.1秒排序一次

    protected update(dt: number): void {
        // 使用 TimeManager 的缩放时间
        const scaledDt = TimeManager.getInstance().getDeltaTime(dt);
        Custom2D_Collide_Manager.instance.update(scaledDt);

        // 定期对 game_objs 中的子节点进行Y轴排序
        this.sortTimer += dt;
        if (this.sortTimer >= this.SORT_INTERVAL) {
            this.sortTimer = 0;
            this.sortGameObjectsByY();
        }
    }

    /**
     * 按Y坐标对 game_objs 中的子节点进行排序
     * Y坐标越小（越靠上）的节点显示在上层
     * Y坐标越大（越靠下）的节点显示在下层
     * report_rect 节点不参与排序
     */
    private sortGameObjectsByY() {
        if (!this.game_objs) return;

        const children = this.game_objs.children;
        if (children.length <= 1) return;

        // 过滤出需要排序的节点（排除 report_rect）
        const sortableChildren = children.filter(child => child.name !== 'report_rect');
        const nonSortableChildren = children.filter(child => child.name === 'report_rect');

        if (sortableChildren.length <= 1) return;

        // 按Y坐标降序排序（Y坐标越小越靠后排列，显示在上层）
        sortableChildren.sort((a, b) => {
            const posA = a.getWorldPosition();
            const posB = b.getWorldPosition();
            return posB.y - posA.y; // 降序排列：Y小的在后（上层），Y大的在前（下层）
        });

        // 重新设置子节点顺序
        // 先放置非排序节点（如 report_rect）
        nonSortableChildren.forEach((child, index) => {
            child.setSiblingIndex(index);
        });

        // 再放置排序后的节点
        const nonSortableCount = nonSortableChildren.length;
        sortableChildren.forEach((child, index) => {
            child.setSiblingIndex(nonSortableCount + index);
        });
    }

    onDestroy() {
        this.closeEventListeners();
    }

    public clearGameData() {
        MusicManager.getInstance().stopBackgroundMusic();

        try {
            // 1. 暂停时间管理器
            TimeManager.getInstance().pause();

            // 2. 清理GameManager
            const gameManager = GameManager.getInstance();
            if (gameManager) {
                gameManager.closeEventListeners();
            }

            // 2.1 清理LevelData
            game.myGlobal.currentExp = 0;


            // 3. 清理效果容器
            const effectContainer = EffectContainer.getInstance();
            if (effectContainer) {
                effectContainer.clearAllPools();
            }

            // 4. 清理子弹管理器
            const bulletManager = find('Canvas')?.getComponentInChildren(BulletManager);
            if (bulletManager) {
                bulletManager.clearAll();
            }

            // 5. 清理动画缓存
            AnimationLoader.clearAllCache();

            // 6. 清理所有定时器回调
            this.unscheduleAllCallbacks();

            // 7. 重置伤害统计
            const damageStatsManager = DamageStatsManager.getInstance();
            if (damageStatsManager) {
                damageStatsManager.reset();
            }

            // 8. 清理碰撞检测管理器
            const collideManager = Custom2D_Collide_Manager.instance;
            if (collideManager) {
                collideManager.enable = false;
            }

            // 9. 清理技能管理器
            const skillManager = SkillManager.getInstance();
            if (skillManager) {
                skillManager.clearGameData();
            }

            // 10. 清理技能施法器
            SkillCaster.clearInstance();

            // 11. 清理所有英雄的BuffManager
            const herosManager = HerosManager.getInstance();
            if (herosManager) {
                const activeHeroPanels = herosManager.getActiveHeroPanels();
                activeHeroPanels.forEach(panel => {
                    if (panel.buffManager) {
                        panel.buffManager.clearAllBuffs();
                    }
                });
            }

            // 12. 重置Buff ID计数器
            Buff.resetBuffIdCounter();

            //13 .清理所有零时装备
            UserEquipmentData.getInstance().clearTemporaryEquipments();


            console.log('游戏状态清理完成，切换到大厅场景');

        } catch (error) {
            console.error('清理游戏状态时出错:', error);
        }
    }

    /**
     * 结束游戏并返回大厅
     */
    public endGameAndReturnToHall(): void {
        console.log('开始清理游戏状态...');
        MusicManager.getInstance().stopBackgroundMusic();

        try {
            // 1. 暂停时间管理器
            TimeManager.getInstance().pause();

            // 2. 清理GameManager
            const gameManager = GameManager.getInstance();
            if (gameManager) {
                gameManager.closeEventListeners();
            }

            // 2.1 清理LevelData
            game.myGlobal.currentExp = 0;


            // 3. 清理效果容器
            const effectContainer = EffectContainer.getInstance();
            if (effectContainer) {
                effectContainer.clearAllPools();
            }

            // 4. 清理子弹管理器
            const bulletManager = find('Canvas')?.getComponentInChildren(BulletManager);
            if (bulletManager) {
                bulletManager.clearAll();
            }

            // 5. 清理动画缓存
            AnimationLoader.clearAllCache();

            // 6. 清理所有定时器回调
            this.unscheduleAllCallbacks();

            // 7. 重置伤害统计
            const damageStatsManager = DamageStatsManager.getInstance();
            if (damageStatsManager) {
                damageStatsManager.reset();
            }

            // 8. 清理碰撞检测管理器
            const collideManager = Custom2D_Collide_Manager.instance;
            if (collideManager) {
                collideManager.enable = false;
            }

            // 9. 清理技能管理器
            const skillManager = SkillManager.getInstance();
            if (skillManager) {
                skillManager.clearGameData();
            }

            // 10. 清理技能施法器
            SkillCaster.clearInstance();

            // 11. 清理所有英雄的BuffManager
            const herosManager = HerosManager.getInstance();
            if (herosManager) {
                const activeHeroPanels = herosManager.getActiveHeroPanels();
                activeHeroPanels.forEach(panel => {
                    if (panel.buffManager) {
                        panel.buffManager.clearAllBuffs();
                    }
                });
            }

            // 12. 重置Buff ID计数器
            Buff.resetBuffIdCounter();

            //13 .清理所有零时装备
            UserEquipmentData.getInstance().clearTemporaryEquipments();


            console.log('游戏状态清理完成，切换到大厅场景');

        } catch (error) {
            console.error('清理游戏状态时出错:', error);
        }

        // 切换到大厅场景
        director.loadScene("hall");
    }




}