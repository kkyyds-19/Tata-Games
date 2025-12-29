import { _decorator, Component, Node, Prefab, instantiate, Vec3, director, game, resources, JsonAsset, TextAsset, find, assetManager } from 'cc';
import { AssetDownloader } from '../../http/AssetDownloader';
import { NetworkConfig } from '../../global/config/NetworkConfig';
import { VersionManager } from '../../global/VersionManager';
import { StageManager } from './StageManager';
import { MonsterData, BossData, StageData, StageType } from './StageData';
import { Monster } from '../enemy/monster';
import { UI_Frame_Top } from '../UIFrameTop';
import { TimeManager } from '../TimeManager';
import { WallManager } from '../WallManager';
import { GameResult } from '../../dialog/GameResult';
import { DamageStatsManager } from '../DamageStatsManager';
import { sp } from 'cc';
import { BossHPBar } from '../enemy/BossHPBar';
import { LuckWheel } from '../../dialog/LuckWheel';
import { GameConfig } from '../../global/config/GameConfig';
import { HerosManager } from '../HerosManager';
import { UserInfoData } from '../../user/UserInfoData';
import { userAPI } from '../../api/UserAPI';
import { MusicManager } from '../../music/MusicManager';
import { DailyTaskHelper } from '../../hall/daily_task/DailyTaskHelper';
import { userMonsterData } from '../../user/UserMonsterData';
import { Utils } from '../../utils/Utils';
import { resManager } from '../../utils/resManager';
import { GlobalVariable } from '../../global/GlobalVariable';
const { ccclass, property } = _decorator;

/**
 * 关卡系统使用示例
 * 展示如何集成关卡管理器到游戏中
 * 
 * 【新增功能】重新开始关卡：
 * 1. 实例方法调用：
 *    const stageComponent = StageComponent.getInstance();
 *    if (stageComponent) {
 *        stageComponent.restartCurrentStage();
 *    }
 * 
 * 2. 静态方法调用（推荐）：
 *    StageComponent.restartStage();
 * 
 * 3. 从游戏结果界面调用示例：
 *    // 在GameResult.ts中添加重启按钮点击事件：
 *    private onRestartButtonClicked(): void {
 *        if (StageComponent.restartStage()) {
 *            this.node.active = false; // 关闭结果界面
 *        }
 *    }
 * 
 * 【新增功能】难度系统：
 * - 基于 game.myGlobal.stageDifficulty 控制难度
 * - 0: 普通难度 (无属性加成)
 * - 1: 精英难度 (提升生命值和攻击力)
 * - 只在关卡类型为普通 (game.myGlobal.stageType === 0) 下生效
 * - 关卡类型: 0普通 1地下城 2竞技场 3无尽
 * - 难度配置在 GameConfig.DIFFICULTY_CONFIG 中管理
 */
@ccclass('StageComponent')
export class StageComponent extends Component {

    // 【新增】静态实例管理
    private static instance: StageComponent | null = null;

    @property(StageManager)
    public stageManager: StageManager = null;

    @property(Node)
    public monsterContainer: Node = null;

    @property(Node)
    public bossContainer: Node = null;

    @property(UI_Frame_Top)
    public uiContainer: UI_Frame_Top = null;

    @property(Prefab)
    public monsterPrefab: Prefab = null;


    // @property(Node)
    // public warningContainer: Node = null;

    @property(Node)
    public bossWarningspineNode: Node | null = null;

    @property(Node)
    public monsterWarningspineNode: Node | null = null;

    @property(BossHPBar)
    public midBossHPBar: BossHPBar | null = null;

    @property(BossHPBar)
    public finalBossHPBar: BossHPBar | null = null;

    @property(LuckWheel)
    public luckWheel: LuckWheel | null = null;

    // 关卡计时器
    private stageStartTime: number = 0;
    private currentStageTime: number = 0;

    // UI更新频率控制
    private uiUpdateTimer: number = 0;
    private uiUpdateInterval: number = 0.1; // 每0.1秒更新一次UI

    // 怪物生成跟踪
    private plannedMonsters: number = 0;    // 计划生成的怪物数量
    private actuallySpawned: number = 0;    // 实际生成的怪物数量

    private spawnBossId: number = 0;

    // 击杀统计
    private killStats = {
        normal: 0,      // 普通怪
        elite: 0,       // 精英怪
        little_boss: 0, // 小Boss
        big_boss: 0     // 大Boss
    };

    private get totalKill() {
        return this.killStats.normal + this.killStats.elite + this.killStats.little_boss + this.killStats.big_boss;
    }

    private onBossHpUpdate(event: any): void {
        const { bossId, hp, maxHp, name } = event;
        if (bossId == 1) {
            this.midBossHPBar.updateBossData(name, hp, maxHp);
        } else if (bossId == 2) {
            this.finalBossHPBar.updateBossData(name, hp, maxHp);
        }
    }

    // 缓存的生成区域信息
    private cachedSpawnArea: {
        leftBound: number;
        rightBound: number;
        bottomBound: number;
        topBound: number;
        width: number;
        height: number;
    } | null = null;

    // 【新增】当前关卡路径缓存
    private currentStagePath: string = '';
    public currentStageJson: any = null;

    onLoad() {
        // 设置静态实例
        StageComponent.instance = this;
    }

    /**
     * 【新增】获取StageComponent实例
     * 静态方法，可以从任何地方调用
     */
    public static getInstance(): StageComponent | null {
        return StageComponent.instance;
    }



    /**
     * 【新增】静态方法：重新开始当前关卡
     * 可以从任何地方调用，比如游戏结果界面
     */
    public static restartStage(): boolean {
        const instance = StageComponent.getInstance();
        if (instance) {
            instance.restartCurrentStage();
            return true;
        } else {
            console.warn('StageComponent实例不存在，无法重新开始关卡');
            return false;
        }
    }

    start() {
        if (!this.stageManager) {
            console.error('StageExample: StageManager未设置');
            return;
        }
        this.bossWarningspineNode.active = false;
        this.monsterWarningspineNode.active = false;


        this.midBossHPBar.hide();
        this.finalBossHPBar.hide();
        this.luckWheel.hideLuckWheel();

        this.loadJson1();
    }

    private async loadJson1() {
        console.log('game.myGlobal.currentStage', game.myGlobal.currentStage)

        // 加载第一关JSON数据 
        // this.loadStageFromJSON('stage/stage_test');
        //  this.loadStageFromJSON('stage/stage1')

        switch (game.myGlobal.currentWorld) {
            case 1:
                this.loadStageFromJSON('stage/stage' + game.myGlobal.currentStage);
                break;
            case 2:
                {
                    let level = game.myGlobal.currentStage;
                    level = 1;//TEMP
                    const jsonAsset = await resManager.asyncloadAsset(GlobalVariable.bundleCfg, `outland/stage${level}`, JsonAsset) as JsonAsset;
                    this.currentStageJson = jsonAsset.json;
                    this.processLoadedJSON();
                } break;
            case 3:
                 this.loadStageFromJSON('stage/stage' + game.myGlobal.currentStage);
                //this.loadStageFromJSON('stage/stage_testdnf_' + game.myGlobal.currentStage);
                
                break;
            
        }

        // this.loadStageFromJSON('stage/boss_test')
        // this.loadStageFromJSON('stage/monster_test')

        if (MusicManager.getInstance() && MusicManager.getInstance().playBgmGame) {
            MusicManager.getInstance().playBgmGame(game.myGlobal.currentStage);
        }

    }


    /**
     * 【新增】重新开始当前关卡
     * 公共方法，可以从外部调用
     */
    public restartCurrentStage(): void {
        console.log('重新开始当前关卡:', this.currentStagePath);

        if (!this.currentStagePath) {
            console.warn('没有当前关卡路径，无法重新开始');
            return;
        }

        // 1. 清理当前关卡状态
        this.cleanupCurrentStage();

        // 2. 重新加载关卡
        // this.loadStageFromJSON(this.currentStagePath);
        this.processLoadedJSON();

        console.log('关卡重启完成');
    }

    /**
     * 【新增】清理当前关卡状态
     */
    private cleanupCurrentStage(): void {
        console.log('清理当前关卡状态...');

        // 1. 安全清理怪物容器（排除特定子节点）
        if (this.monsterContainer) {
            this.safeRemoveChildren(this.monsterContainer);
        }

        // 2. 安全清理Boss容器（排除特定子节点）
        if (this.bossContainer) {
            this.safeRemoveChildren(this.bossContainer);
        }

        // 3. 重置关卡管理器状态（手动重置关键属性）
        if (this.stageManager) {
            // 由于StageManager没有公共的reset方法，我们通过重新设置数据来重置
            this.stageManager.stageData = null;
        }

        // 4. 重置计时器
        this.stageStartTime = 0;
        this.currentStageTime = 0;
        this.uiUpdateTimer = 0;
        this.spawnBossId = 0;

        // 5. 重置怪物生成跟踪
        this.plannedMonsters = 0;
        this.actuallySpawned = 0;

        // 6. 清理所有定时器
        this.unscheduleAllCallbacks();

        // 7. 重置时间管理器（如果需要）
        const timeManager = TimeManager.getInstance();
        if (timeManager.isPaused()) {
            timeManager.resume();
        }

        // 8. 【新增】重置伤害统计管理器
        const damageStatsManager = DamageStatsManager.getInstance();
        if (damageStatsManager) {
            damageStatsManager.reset();
        }

        // 9. 【新增】重置击杀统计
        this.killStats = {
            normal: 0,
            elite: 0,
            little_boss: 0,
            big_boss: 0
        };

        // 9. 【新增】通知其他系统重置状态
        // 发送关卡重启事件，让其他系统知道需要重置
        // director.emit('stage_restart');

        this.initializeUI();

        console.log('关卡状态清理完成');
    }

    /**
     * 【新增】安全清理子节点，排除特定的子节点
     * @param container 要清理的容器节点
     */
    private safeRemoveChildren(container: Node): void {
        const excludeNames = ['name', 'report_rect', 'hero_spine'];

        // 获取所有子节点的副本（避免在遍历时修改数组）
        const children = container.children.slice();

        for (const child of children) {
            // 检查是否是需要排除的节点
            if (excludeNames.indexOf(child.name) === -1) {
                child.removeFromParent();
                console.log(`清理子节点: ${child.name}`);
            } else {
                console.log(`保留子节点: ${child.name}`);
            }
        }
    }

    /**
     * 从JSON文件加载关卡数据（优先缓存，后备本地）
     */
    private loadStageFromJSON(path: string): void {
        console.log('开始加载关卡数据:', path);
        this.currentStagePath = path;

        // 从路径中解析关卡编号，例如 "stage/stage1" -> "1"
        const stageNumberMatch = path.match(/\d+$/);
        if (!stageNumberMatch) {
            console.error('无法从路径中解析关卡编号，回退至本地加载:', path);
            this.loadStageFromLocalResources(path);
            return;
        }

        const stageNumber = stageNumberMatch[0];
        const fileName = `stage${stageNumber}.json`;
        let remoteUrl = `${NetworkConfig.STAGE_DATA_BASE_URL}${stageNumber}.json`;

        // 从VersionManager获取版本号并拼接到URL
        const version = VersionManager.getInstance().getVersion(fileName);
        if (version) {
            remoteUrl += `?v=${version}`;
        }

        // 检查URL是否在预加载时已成功下载
        if (game.myGlobal.downloadedAssets.has(remoteUrl)) {
            console.log(`✅ 关卡文件已预加载，从缓存加载: ${remoteUrl}`);
            AssetDownloader.getInstance().download<JsonAsset>(remoteUrl)
                .then(jsonAsset => {
                    console.log(`✅ 成功从缓存加载关卡: ${remoteUrl}`);
                    this.currentStageJson = jsonAsset.json;
                    this.processLoadedJSON();
                })
                .catch(error => {
                    console.warn(`已缓存文件加载失败，回退至本地资源。URL: ${remoteUrl}`, error);
                    this.loadStageFromLocalResources(path);
                });
        } else {
            // 如果清单中没有，直接加载本地资源
            console.log(`ℹ️ 关卡文件未在启动时预加载，从本地资源加载: ${path}`);
            this.loadStageFromLocalResources(path);
        }
    }

    /**
     * 从本地resources目录加载关卡JSON（作为后备方案）
     */
    private loadStageFromLocalResources(path: string): void {
        const resourcePath = path.replace('.json', '');
        console.log('尝试从本地资源目录加载:', resourcePath);

        resources.load(resourcePath, JsonAsset, (err, jsonAsset) => {
            if (err) {
                console.error(`❌ 本地资源加载也失败了: ${resourcePath}`, err);
                return;
            }

            console.log(`✅ 成功从本地资源加载: ${resourcePath}`);
            this.currentStageJson = jsonAsset.json;
            this.processLoadedJSON();
        });
    }

    /**
     * 处理已加载的JSON数据
     */
    private processLoadedJSON(): void {
        const jsonData = this.currentStageJson;
        try {
            // 获取JSON数据
            const jsonString = JSON.stringify(jsonData);

            // console.log('JSON字符串:', jsonString);

            // 使用StageData的静态方法加载数据
            const stageData = StageData.loadStageFromJSON(jsonString);

            if (!stageData) {
                console.error('解析JSON失败');
                return;
            }

            // console.log('关卡数据解析成功:', stageData);
            console.log('怪物数量:', stageData.monsters.length);
            console.log('Boss数量:', stageData.bosses.length);
            console.log('事件数量:', stageData.stageEvents.length);

            // 设置关卡数据
            this.stageManager.stageData = stageData;

            // 继续初始化
            this.initializeStage(stageData);

            director.emit(game.gameEvent.GAME_MAP_CFG_LOADED);
        } catch (error) {
            console.error('处理JSON时出错:', error);
        }
    }

    /**
     * 初始化关卡
     */
    private initializeStage(stageData: StageData): void {
        // 设置事件回调
        this.setupStageCallbacks();

        // 初始化英雄数量（示例：假设有3个英雄）
        this.stageManager.setHeroCount(5, 5, false);

        // 启动关卡管理器
        this.stageManager.initStage();

        // 记录关卡开始时间
        this.stageStartTime = Date.now() / 1000;
        this.currentStageTime = 0;

        console.log('StageExample: 关卡系统已初始化');
        console.log('关卡信息:', stageData.stageName, stageData.stageDescription);

        // 显示当前关卡类型和难度设置
        // 保留game.myGlobal.stageType的当前值（可能来自DnfItem.ts），不被JSON数据覆盖
        const stageType = game.myGlobal.stageType = stageData.stageType;
        const stageTypeNames = [null, '普通', '外域', '地下城', '竞技场', '无尽'];
        const stageTypeName = stageTypeNames[stageType] || `未知(${stageType})`;
        console.log(`🏛️  关卡类型: ${stageTypeName} (${stageType})`);

        const difficulty = game.myGlobal.stageDifficulty;
        const config = GameConfig.getDifficultyConfig(difficulty);
        console.log(`🎯 当前难度: ${config.name} (${difficulty})`);

        // 只在普通关卡类型下显示难度加成信息
        if (stageType === StageType.Normal && difficulty !== 0) {
            console.log(`🔥 ${config.name}难度加成: 生命值 x${config.hpMultiplier}, 攻击力 x${config.attackMultiplier}`);
        } else if (stageType !== StageType.Normal) {
            console.log(`ℹ️  非普通关卡类型，不应用难度加成`);
        }

        // 初始化UI显示
        this.initializeUI();

        // 初始化事件监听
        this.initEventListeners();

        // 初始化生成区域缓存
        this.initSpawnAreaCache();

        // 确保在所有关卡数据设置完毕后，再触发游戏开始逻辑
        director.emit(game.gameEvent.GAME_START);
    }

    /**
     * 初始化UI显示
     * 
     */
    private initializeUI(): void {
        if (!this.uiContainer) return;

        // 初始化时间显示
        this.uiContainer.updateTimeLabel('0:00');

        switch (game.myGlobal.stageType) {
            case StageType.Normal:
            case StageType.Dungeon:
            case StageType.Arena:
            case StageType.Endless:
                this.uiContainer.updateKillIcon(0);
                this.uiContainer.updateKillLabel(1);
                break;
            case StageType.Outland:
                this.uiContainer.updateKillIcon(0, "img/game/ui/left");
                this.uiContainer.updateKillIcon(1, "img/game/ui/right");
                break;
            default:
        }


        // 初始化击杀进度显示
        this.updateProgressUI();
    }

    /**
     * 设置关卡事件回调
     */
    private setupStageCallbacks(): void {
        // 剧情触发回调
        this.stageManager.onStoryTrigger = (storyId: string) => {
            this.handleStoryTrigger(storyId);
        };

        // 怪物生成回调
        this.stageManager.onMonsterSpawn = (monsters: MonsterData[]) => {
            this.handleMonsterSpawn(monsters);
        };

        // Boss生成回调
        this.stageManager.onBossSpawn = (boss: BossData) => {
            this.handleBossSpawn(boss);
        };

        // 关卡完成回调
        this.stageManager.onStageComplete = (success: boolean) => {
            this.handleStageComplete(success);
        };

        // 英雄状态变化回调
        this.stageManager.onHeroCountChanged = (aliveCount: number, totalCount: number) => {
            this.updateHeroUI(aliveCount, totalCount);
        };
    }

    /**
     * 处理剧情触发
     */
    private handleStoryTrigger(storyId: string): void {
        const story = this.stageManager.stageData?.getStoryById(storyId);
        if (!story) return;

        // 这里可以显示剧情UI
        this.showStoryUI(story.title, story.content, story.duration || 3);
    }

    /**
     * 处理怪物生成
     */
    private handleMonsterSpawn(monsters: MonsterData[]): void {
        monsters.forEach(monsterData => {
            // 更新计划生成数量
            // 荣誉竞技场模式下，每个怪物会生成两次（镜像生成），所以需要乘以2
            if (this.stageManager.stageData.stageType === StageType.Arena) {
                this.plannedMonsters += monsterData.count * 2;
            } else {
                this.plannedMonsters += monsterData.count;
            }
            // 这里实际生成怪物实例
            this.spawnMonsterInstances(monsterData);
        });
    }

    /**
     * 处理Boss生成
     */
    private handleBossSpawn(boss: BossData): void {
        // 竞技场：Boss镜像生成（上下各一只）
        if (this.stageManager.stageData.stageType === StageType.Arena) {
            // 第一只（下方）推进boss计数
            this.spawnBossInstance(boss, 1700, true);
            // 第二只（上方）不推进boss计数，保持同事件的分类与血条一致
            this.spawnBossInstance(boss, 700, false);
        } else {
            // 其他关卡类型保持原有逻辑
            this.spawnBossInstance(boss);
        }
    }

    /**
     * 处理关卡完成
     */
    private handleStageComplete(success: boolean): void {

        //处理杀怪任务计数
        DailyTaskHelper.completeMonsterKill(this.totalKill);

        if (success) {
            // 关卡胜利时，显示胜利UI
            // 注意：对于普通关卡，升级逻辑在GameResult.ts的nextStageClick方法中处理
            this.showVictoryUI();
        } else {
            this.showDefeatUI();
        }
    }

    /**
     * 升级并保存等级到本地和服务器
     */
    private async levelUpAndSave(): Promise<void> {
        try {
            const userInfo = UserInfoData.getInstance();
            // 获取当前等级
            const currentLevel = userInfo.getLevel();
            // 升级一级
            const newLevel = currentLevel + 1;
            
            console.log(`=== 关卡完成！等级提升：${currentLevel} → ${newLevel} ===`);
            
            // 将经验设置为新等级的累计经验，确保重启后根据经验计算的等级一致
            // 经验系统以总经验驱动等级，保存总经验更稳妥
            const totalExpForNewLevel = Utils.getTotalExpForLevel(newLevel);
            userInfo.setExp(totalExpForNewLevel);
            
            // 立即同步到全局，确保依赖 game.myGlobal.currentExp 的界面立刻显示正确等级
            game.myGlobal.currentExp = totalExpForNewLevel;
            
            console.log('=== 等级和经验已保存到本地 ===');
            
            // 同步等级到服务器
            const response = await userAPI.updateLevel(newLevel);
            if (response && response.code === 700) {
                console.log('=== 等级已同步到服务器 ===');
            } else {
                console.warn('=== 等级同步到服务器失败 ===', response);
            }
            
            // 通知大厅与相关UI刷新
            director.emit(game.gameEvent.HALL_USER_INFO_UPDATE);
            
            // 触发等级提升事件
            director.emit(game.gameEvent.GAME_LEVEL_UP, {
                oldLevel: currentLevel,
                newLevel: newLevel
            });
            
        } catch (error) {
            console.error('=== 升级并保存等级失败 ===', error);
        }
    }

    /**
     * 显示剧情UI
     */
    private showStoryUI(title: string, content: string, duration: number): void {
        // 这里实现剧情UI显示逻辑
        if (!this.bossWarningspineNode.isValid || !this.monsterWarningspineNode.isValid) return;


        this.bossWarningspineNode.active = false;
        this.monsterWarningspineNode.active = false;

        // 模拟剧情显示时间
        // TODO_TIMEMANAGER: 此处使用scheduleOnce不受TimeManager控制，剧情显示延迟，暂停时仍会执行
        this.scheduleOnce(() => {
            // 剧情结束
            console.log('剧情----->', title, content, duration)

            if (title == 'Mid Boss Incoming' || title == 'Final Boss Incoming') {
                this.bossWarningspineNode.active = true;
                const spine = this.bossWarningspineNode.getComponent(sp.Skeleton);
                spine.setAnimation(0, 'animation', false);
                MusicManager.getInstance().playSound(MusicManager.SOUND_BOSS_WARNING);

                spine.setCompleteListener((trackEntry: any) => {
                    this.bossWarningspineNode.active = false;
                });

            } else if (title == 'Massive Attack Warning') {
                this.monsterWarningspineNode.active = true;
                const spine = this.monsterWarningspineNode.getComponent(sp.Skeleton);
                spine.setAnimation(0, 'animation', false);
                MusicManager.getInstance().playSound(MusicManager.SOUND_MONSTER_WARNINGS);
                spine.setCompleteListener((trackEntry: any) => {
                    this.monsterWarningspineNode.active = false;
                });
            }


        }, duration);
    }

    private unlockingKey: { [k: string]: boolean } = {};

    /**
     * 【新增】解锁新怪物图鉴
     * @param monsterKey 怪物的资源key
     */
    private async unlockNewMonster(monsterKey: string): Promise<void> {
        if (!monsterKey) {
            console.warn('StageComponent: 怪物key为空，无法解锁');
            return;
        }
        if (this.unlockingKey[monsterKey]) {
            //该图鉴已经在解锁中避免重复发包解锁
            return;
        }
        this.unlockingKey[monsterKey] = true;

        try {
            // 使用UserMonsterData的封装方法发送解锁请求
            const success = await userMonsterData.unlockMonster(monsterKey);
            if (success) {
                console.log(`StageComponent: 成功解锁新怪物图鉴 - ${monsterKey}`);
            } else {
                console.warn(`StageComponent: 解锁怪物图鉴失败 - ${monsterKey}`);
            }
        } catch (error) {
            console.error(`StageComponent: 解锁怪物图鉴时发生错误 - ${monsterKey}:`, error);
        } finally {
            delete this.unlockingKey[monsterKey];
        }
    }

    /**
     * 生成怪物实例
     */
    private spawnMonsterInstances(monsterData: MonsterData): void {
        // 荣誉竞技场需要生成镜像怪物，所以需要特殊处理
        if (this.stageManager.stageData.stageType === StageType.Arena) {
            // 为每个怪物生成两个位置（镜像生成）
            for (let i = 0; i < monsterData.count; i++) {
                // 生成第一个位置的怪物 (y=700)
                this.scheduleOnce(() => {
                    this.createMonsterInstance(monsterData, 1700);
                }, i * monsterData.spawnInterval);

                // 同时生成第二个位置的怪物 (y=1700)
                this.scheduleOnce(() => {
                    this.createMonsterInstance(monsterData, 700);
                }, i * monsterData.spawnInterval);
            }
        } else {
            // 其他关卡类型保持原有逻辑
            for (let i = 0; i < monsterData.count; i++) {
                // TODO_TIMEMANAGER: 此处使用scheduleOnce不受TimeManager控制，怪物生成延迟，暂停时仍会执行
                this.scheduleOnce(() => {
                    // 这里创建怪物节点并设置属性
                    const monsterNode = instantiate(this.monsterPrefab);
                    const monster = monsterNode.getComponent(Monster);

                    // 使用缓存的生成区域信息计算出生位置
                    let spawnPos = new Vec3(0, 1700, 0); // 默认位置

                    switch (this.stageManager.stageData.stageType) {
                        case StageType.Normal:
                            {
                                if (this.cachedSpawnArea) {
                                    // 使用缓存的区域信息
                                    const randomX = this.cachedSpawnArea.leftBound + Math.random() * this.cachedSpawnArea.width;
                                    const randomY = this.cachedSpawnArea.bottomBound + Math.random() * this.cachedSpawnArea.height;
                                    spawnPos = new Vec3(randomX, randomY + 250, 0);
                                }
                                monster.pathId = 0;
                            } break;
                        case StageType.Outland:
                            {
                                monsterData.gameObject.maxhp = monsterData.gameObject.hp = 9999999;//NOTE TEST
                                monsterData.gameObject.attack = monsterData.gameObject.attack * 100;
                                if (monsterData.gameObject.attackRange < 210) monsterData.gameObject.attackRange = 210;//防止打不到被守护者
                                if (monsterData.spawnPosition.x < 585) {
                                    spawnPos.x = 270;
                                    monster.pathId = 1;
                                    monster.pathsLeft = Array.from(Monster.paths[monster.pathId]);
                                } else {
                                    spawnPos.x = 900;
                                    monster.pathId = 2;
                                    monster.pathsLeft = Array.from(Monster.paths[monster.pathId]);
                                }
                                spawnPos.y = 2072;
                            } break;
                            case StageType.Dungeon:
                            {
                              if (this.cachedSpawnArea) {
                                    // 使用缓存的区域信息
                                    const randomX = this.cachedSpawnArea.leftBound + Math.random() * this.cachedSpawnArea.width;
                                    const randomY = this.cachedSpawnArea.bottomBound + Math.random() * this.cachedSpawnArea.height;
                                    spawnPos = new Vec3(randomX, randomY + 250, 0);
                                }
                                monster.pathId = 0;
                            }
                            break;
                            case StageType.Endless:
                            {
                              if (this.cachedSpawnArea) {
                                    // 使用缓存的区域信息
                                    const randomX = this.cachedSpawnArea.leftBound + Math.random() * this.cachedSpawnArea.width;
                                    const randomY = this.cachedSpawnArea.bottomBound + Math.random() * this.cachedSpawnArea.height;
                                    spawnPos = new Vec3(randomX, randomY + 250, 0);
                                }
                                monster.pathId = 0;
                            }
                            break;
                    }

                    // 更新实际生成数量
                    this.actuallySpawned++;

                    // 根据配置决定是否设置怪物经验值
                    const stageConfig = this.getCurrentStageConfig();
                    if (stageConfig.enable_monster_exp) {
                        // 启用脚本经验系统：从脚本中获取经验值
                        console.log(`脚本经验系统开启，${monsterData.gameObject.name} 从脚本中获取经验值 ${monsterData.gameObject.exp}`);
                    } else {
                        // 启用固定经验系统：使用关卡级别的配置
                        const monsterExpConfig = this.getCurrentMonsterExpConfig();
                        if (monsterExpConfig) {
                            // 使用关卡级别的经验配置
                            if (monsterData.gameObject.animationNames[0] && monsterData.gameObject.animationNames[0].startsWith('m_s_')) {
                                // 精英怪
                                monsterData.gameObject.exp = monsterExpConfig.elite;
                                console.log(`固定经验系统开启，精英怪 ${monsterData.gameObject.name} 设置经验值: ${monsterExpConfig.elite}`);
                            } else {
                                // 普通怪
                                monsterData.gameObject.exp = monsterExpConfig.normal;
                                console.log(`固定经验系统开启，普通怪 ${monsterData.gameObject.name} 设置经验值: ${monsterExpConfig.normal}`);
                            }
                        } else {
                            // 使用默认配置：精英怪2经验，普通怪1经验
                            if (monsterData.gameObject.animationNames[0] && monsterData.gameObject.animationNames[0].startsWith('m_s_')) {
                                monsterData.gameObject.exp = 2;
                                console.log(`固定经验系统开启，精英怪 ${monsterData.gameObject.name} 设置默认经验值: 2`);
                            } else {
                                monsterData.gameObject.exp = 1;
                                console.log(`固定经验系统开启，普通怪 ${monsterData.gameObject.name} 设置默认经验值: 1`);
                            }
                        }
                    }
                    // monsterNode.setScale(0.4,0.4,0)
                    // 先添加到容器，然后设置世界坐标
                    this.monsterContainer.addChild(monsterNode);
                    // 设置怪物的世界位置（因为spawnPos是基于世界坐标计算的）
                    monsterNode.setWorldPosition(spawnPos);

                    // 克隆怪物数据并应用难度调整
                    const monsterGameObject = monsterData.gameObject.clone();
                    this.applyDifficultyModifiers(monsterGameObject);
                    monster.lets_kill_hero(monsterGameObject)

                    // 【新增】获取怪物资源key并解锁新怪物图鉴
                    const monsterKey = monster.getMonsterResourceKey();
                    if (monsterKey) {
                        this.unlockNewMonster(monsterKey);
                    }

                }, i * monsterData.spawnInterval);
            }
        }
    }

    /**
     * 创建怪物实例（用于荣誉竞技场的镜像生成）
     * @param monsterData 怪物数据
     * @param yPosition Y轴位置
     */
    private createMonsterInstance(monsterData: MonsterData, yPosition: number): void {
        // 创建怪物节点并设置属性
        const monsterNode = instantiate(this.monsterPrefab);
        const monster = monsterNode.getComponent(Monster);

        // 计算出生位置，使用缓存的生成区域信息
        let spawnPos = new Vec3(0, yPosition, 0);
        if (this.cachedSpawnArea) {
            const randomX = this.cachedSpawnArea.leftBound + Math.random() * this.cachedSpawnArea.width;
            spawnPos = new Vec3(randomX, yPosition, 0);
        }
        
        monster.pathId = 0;
        
        

        // 更新实际生成数量
        this.actuallySpawned++;

        // 根据配置决定是否设置怪物经验值
        const stageConfig = this.getCurrentStageConfig();
        if (stageConfig.enable_monster_exp) {
            // 启用脚本经验系统：从脚本中获取经验值
            console.log(`脚本经验系统开启，${monsterData.gameObject.name} 从脚本中获取经验值 ${monsterData.gameObject.exp}`);
        } else {
            // 启用固定经验系统：使用关卡级别的配置
            const monsterExpConfig = this.getCurrentMonsterExpConfig();
            if (monsterExpConfig) {
                // 使用关卡级别的经验配置
                if (monsterData.gameObject.animationNames[0] && monsterData.gameObject.animationNames[0].startsWith('m_s_')) {
                    // 精英怪
                    monsterData.gameObject.exp = monsterExpConfig.elite;
                    console.log(`固定经验系统开启，精英怪 ${monsterData.gameObject.name} 设置经验值: ${monsterExpConfig.elite}`);
                } else {
                    // 普通怪
                    monsterData.gameObject.exp = monsterExpConfig.normal;
                    console.log(`固定经验系统开启，普通怪 ${monsterData.gameObject.name} 设置经验值: ${monsterExpConfig.normal}`);
                }
            } else {
                // 使用默认配置：精英怪2经验，普通怪1经验
                if (monsterData.gameObject.animationNames[0] && monsterData.gameObject.animationNames[0].startsWith('m_s_')) {
                    monsterData.gameObject.exp = 2;
                    console.log(`固定经验系统开启，精英怪 ${monsterData.gameObject.name} 设置默认经验值: 2`);
                } else {
                    monsterData.gameObject.exp = 1;
                    console.log(`固定经验系统开启，普通怪 ${monsterData.gameObject.name} 设置默认经验值: 1`);
                }
            }
        }

        // 先添加到容器，然后设置世界坐标
        this.monsterContainer.addChild(monsterNode);
        // 设置怪物的世界位置（因为spawnPos是基于世界坐标计算的）
        monsterNode.setWorldPosition(spawnPos);

        // 克隆怪物数据并应用难度调整
        const monsterGameObject = monsterData.gameObject.clone();
        this.applyDifficultyModifiers(monsterGameObject);
        if (this.stageManager.stageData.stageType === StageType.Arena) {
            monster.laneSide = (yPosition === 700) ? 0 : (yPosition === 1700) ? 1 : null;
            monster.laneDir = (yPosition === 700) ? +1 : (yPosition === 1700) ? -1 : null;
        } else {
            monster.laneSide = null;
            monster.laneDir = null;
        }
        monster.lets_kill_hero(monsterGameObject);

        // 根据yPosition设置怪物移动方向
        if (yPosition === 1700) {
            // y=700位置的怪物默认向下移动
            const currentPos = monsterNode.getWorldPosition();
            const targetPos = new Vec3(currentPos.x, currentPos.y - 700, currentPos.z);
            (monster as any).targetPosition = targetPos;
            (monster as any).currentState = 'moving';
           
        } else if (yPosition === 700) {
            // y=1700位置的怪物默认向上移动
            const currentPos = monsterNode.getWorldPosition();
            const targetPos = new Vec3(currentPos.x, currentPos.y + 700, currentPos.z);
            (monster as any).targetPosition = targetPos;
            (monster as any).currentState = 'moving';
          
        }

        // 获取怪物资源key并解锁新怪物图鉴
        const monsterKey = monster.getMonsterResourceKey();
        if (monsterKey) {
            this.unlockNewMonster(monsterKey);
        }
    }

    /**
     * 生成Boss实例
     */
    private spawnBossInstance(boss: BossData, yPosition?: number, advanceId: boolean = true): void {
        // 这里创建Boss节点并设置属性
        const bossNode = instantiate(this.monsterPrefab);
        const bossComponent = bossNode.getComponent(Monster);

        // Boss出生位置：X在0点，Y使用cachedSpawnArea计算
        let spawnPos = new Vec3(585, 700, 0); // 默认位置
        switch (this.stageManager.stageData.stageType) {
            case StageType.Normal:
            case StageType.Dungeon:
            case StageType.Arena:
            case StageType.Endless:
                {
                    if (this.cachedSpawnArea) {
                        if (this.stageManager.stageData.stageType === StageType.Arena && typeof yPosition === 'number') {
                            // 竞技场镜像Boss：按指定y生成
                            spawnPos.y = yPosition;
                        } else {
                            const randomY = this.cachedSpawnArea.bottomBound + (Math.random() * 0 + .5) * this.cachedSpawnArea.height;
                            spawnPos.y = randomY;
                        }
                    } else if (typeof yPosition === 'number') {
                        spawnPos.y = yPosition;
                    }
                    bossComponent.pathId = 0;
                } break;
            case StageType.Outland:
                {
                    if (boss.gameObject.attackRange < 210) boss.gameObject.attackRange = 210;//防止打不到被守护者
                    if (boss.spawnPosition.x < 585) {
                        spawnPos.x = 270;
                        bossComponent.pathId = 1;
                        bossComponent.pathsLeft = Array.from(Monster.paths[bossComponent.pathId]);
                    } else {
                        spawnPos.x = 900;
                        bossComponent.pathId = 2;
                        bossComponent.pathsLeft = Array.from(Monster.paths[bossComponent.pathId]);
                    }
                    spawnPos.y = 2072;
                } break;
        }

        if (advanceId) {
            this.spawnBossId++;
        }
        this.bossContainer.addChild(bossNode);
        bossNode.setWorldPosition(spawnPos);

        // 竞技场镜像Boss移动方向：上方Boss向上、下方Boss向下
        if (this.stageManager.stageData.stageType === StageType.Arena && typeof yPosition === 'number') {
            const currentPos = bossNode.getWorldPosition();
            if (yPosition === 700) {
                // 下方Boss默认向下移动
                const targetPos = new Vec3(currentPos.x, currentPos.y - 1000, currentPos.z);
                (bossComponent as any).targetPosition = targetPos;
                (bossComponent as any).currentState = 'moving';
                console.log('Arena Boss(下) 设定向下移动');
            } else if (yPosition === 1700) {
                // 上方Boss默认向上移动
                const targetPos = new Vec3(currentPos.x, currentPos.y + 1000, currentPos.z);
                (bossComponent as any).targetPosition = targetPos;
                (bossComponent as any).currentState = 'moving';
                console.log('Arena Boss(上) 设定向上移动');
            }
        }

        // 克隆Boss数据并应用难度调整
        const bossGameObject = boss.gameObject.clone();
        this.applyDifficultyModifiers(bossGameObject);
        MusicManager.getInstance().playSound(MusicManager.SOUND_BOSS);
        bossGameObject.isBoss = true;
        bossGameObject.bossId = this.spawnBossId

        console.log('spawnBossId--->', this.spawnBossId, bossGameObject.name, bossGameObject.maxhp)

        // 根据配置决定是否设置Boss经验值
        const stageConfig = this.getCurrentStageConfig();
        if (stageConfig.enable_monster_exp) {
            // 启用脚本经验系统：从脚本中获取经验值
            console.log(`脚本经验系统开启，${bossGameObject.name} 从脚本中获取经验值 ${bossGameObject.exp}`);
        } else {
            // 启用固定经验系统：使用关卡级别的配置
            const bossExpConfig = this.getCurrentBossExpConfig();
            if (bossExpConfig) {
                // 使用关卡级别的经验配置
                if (this.spawnBossId == 1) {
                    bossGameObject.exp = bossExpConfig.mid;
                    console.log(`固定经验系统开启，中期Boss ${bossGameObject.name} 设置经验值: ${bossExpConfig.mid}`);
                } else if (this.spawnBossId == 2) {
                    bossGameObject.exp = bossExpConfig.final;
                    console.log(`固定经验系统开启，最终Boss ${bossGameObject.name} 设置经验值: ${bossExpConfig.final}`);
                }
            } else {
                // 使用默认配置：中期Boss 3经验，最终Boss 7经验
                if (this.spawnBossId == 1) {
                    bossGameObject.exp = 3;
                    console.log(`固定经验系统开启，中期Boss ${bossGameObject.name} 设置默认经验值: 3`);
                } else if (this.spawnBossId == 2) {
                    bossGameObject.exp = 7;
                    console.log(`固定经验系统开启，最终Boss ${bossGameObject.name} 设置默认经验值: 7`);
                }
            }
        }

        if (advanceId) {
            if (this.spawnBossId == 1) {
                this.midBossHPBar.setBossInfo(bossGameObject.name, bossGameObject.maxhp, 5);
            } else if (this.spawnBossId == 2) {
                this.finalBossHPBar.setBossInfo(bossGameObject.name, bossGameObject.maxhp, 5);
            }
        }
        if (this.stageManager.stageData.stageType === StageType.Arena && typeof yPosition === 'number') {
            bossComponent.laneSide = (yPosition === 700) ? 0 : (yPosition === 1700) ? 1 : null;
            bossComponent.laneDir = (yPosition === 700) ? +1 : (yPosition === 1700) ? -1 : null;
        } else {
            bossComponent.laneSide = null;
            bossComponent.laneDir = null;
        }
        bossComponent.lets_kill_hero(bossGameObject)

        // 【新增】获取Boss资源key并解锁新怪物图鉴
        const bossKey = bossComponent.getMonsterResourceKey();
        if (bossKey) {
            this.unlockNewMonster(bossKey);
        }
    }





    /**
     * 强制更新UI显示（公共方法）
     */
    public forceUpdateUI(): void {
        this.updateTimeDisplay();
        this.updateProgressUI();
    }

    /**
     * 获取当前关卡统计信息（公共方法）
     */
    public getStageStats(): {
        currentTime: number;
        formattedTime: string;
        killCount: number;
        totalMonsters: number;
        killPercentage: number;
        aliveHeroes: number;
        totalHeroes: number;
    } {
        const progress = this.stageManager.getStageProgress();
        const totalMonsters = this.getTotalMonstersInStage();
        const killPercentage = totalMonsters > 0 ?
            Math.floor((progress.killCount / totalMonsters) * 100) : 0;

        return {
            currentTime: this.currentStageTime,
            formattedTime: this.formatTime(this.currentStageTime),
            killCount: progress.killCount,
            totalMonsters: totalMonsters,
            killPercentage: killPercentage,
            aliveHeroes: progress.aliveHeroes,
            totalHeroes: progress.totalHeroes
        };
    }

    /**
     * 更新英雄UI
     */
    private updateHeroUI(aliveCount: number, totalCount: number): void {
        // 这里更新实际的英雄UI显示
        // this.heroCountLabel.string = `英雄: ${aliveCount}/${totalCount}`;

        // 检查是否需要显示警告
        if (aliveCount <= 1 && totalCount > 1) {
            // this.showWarningUI('只剩最后一个英雄！');
        }
    }

    /**
     * 更新进度UI
     */
    private updateProgressUI(): void {
        if (!this.uiContainer) return;

        const progress = this.stageManager.getStageProgress();

        // 更新击杀进度百分比
        const totalMonstersToKill = this.getTotalMonstersInStage();
        const killPercentage = totalMonstersToKill > 0 ?
            Math.floor((progress.killCount / totalMonstersToKill) * 100) : 0;

        switch (game.myGlobal.stageType) {
            case StageType.Normal:
            case StageType.Dungeon://地下城更新百分比
                this.uiContainer.updateKillLabel(0, `${killPercentage}%`);
                break;
            case StageType.Outland:
                this.uiContainer.updateKillLabel(0, `${killPercentage}%`);
                this.uiContainer.updateKillLabel(1, `${killPercentage}%`);
                break;
            case StageType.Arena:
            case StageType.Endless:
                this.uiContainer.updateKillLabel(0, `${killPercentage}%`);
                break;
            default:
        }




        // 调试信息（开启详细关卡日志）
        // if (Date.now() % 7000 < 100) { // 每5秒打印一次调试信息
        //     const detailedStatus = this.stageManager.getDetailedStageStatus();
        //     console.log('=== 关卡进度 ===');
        //     console.log(`时间: ${Math.floor(progress.time)}秒`);
        //     console.log(`击杀数: ${progress.killCount}/${totalMonstersToKill} (${killPercentage}%)`);
        //     console.log(`剩余怪物: ${progress.currentMonsters}`);
        //     console.log(`存活英雄: ${progress.aliveHeroes}/${progress.totalHeroes}`);
        //     console.log(`Boss状态: 已生成=${detailedStatus.bossSpawned}, 已击杀=${detailedStatus.bossKilled}, ID=${detailedStatus.currentBossId}`);
        //     console.log(`关卡状态: ${detailedStatus.stageState}`);
        //     console.log(`怪物生成: 计划=${this.plannedMonsters}, 实际=${this.actuallySpawned}, 差异=${this.plannedMonsters - this.actuallySpawned}`);
        //     console.log('================');
        // }
    }

    /**
     * 获取关卡中总怪物数量
     */
    private getTotalMonstersInStage(): number {
        if (!this.stageManager.stageData) return 0;

        let totalMonsters = 0;

        // 计算所有关卡事件中的怪物总数
        this.stageManager.stageData.stageEvents.forEach(event => {
            if (event.monsterSpawns && event.monsterSpawns.length > 0) {
                event.monsterSpawns.forEach(monster => {
                    totalMonsters += monster.count;
                });
            }

            // 包括Boss；竞技场为镜像生成，计为2
            if (event.bossSpawn) {
                if (this.stageManager.stageData.stageType === StageType.Arena) {
                    totalMonsters += 2;
                } else {
                    totalMonsters += 1;
                }
            }
        });

        // 如果没有事件定义的怪物，则使用基础数据
        if (totalMonsters === 0) {
            // 计算基础怪物数据中的总数
            this.stageManager.stageData.monsters.forEach(monster => {
                totalMonsters += monster.count;
            });

            // 包括Boss；竞技场为镜像生成，计为2
            if (this.stageManager.stageData.stageType === StageType.Arena) {
                totalMonsters += this.stageManager.stageData.bosses.length * 2;
            } else {
                totalMonsters += this.stageManager.stageData.bosses.length;
            }
        }

        return totalMonsters;
    }

    /**
     * 获取关卡中总Boss数量
     */
    private getTotalBossesInStage(): number {
        if (!this.stageManager.stageData) return 0;

        let totalBosses = 0;

        // 计算所有关卡事件中的Boss总数
        this.stageManager.stageData.stageEvents.forEach(event => {
            if (event.bossSpawn) {
                totalBosses += 1;
            }
        });

        // 如果没有事件定义的Boss，则使用基础数据
        if (totalBosses === 0) {
            totalBosses = this.stageManager.stageData.bosses.length;
        }

        return totalBosses;
    }

    /**
     * 格式化时间显示
     * @param seconds 秒数
     * @returns 格式化的时间字符串 (如 "1:23")
     */
    private formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const secondsStr = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds.toString();
        return `${minutes}:${secondsStr}`;
    }

    /**
     * 更新时间显示
     */
    private updateTimeDisplay(): void {
        if (!this.uiContainer) return;

        // 使用 TimeManager 的缩放时间来计算实际游戏时间
        const timeManager = TimeManager.getInstance();
        const realTime = Date.now() / 1000;
        const deltaTime = realTime - this.stageStartTime;

        // 如果游戏暂停，不更新时间
        if (timeManager.getTimeScale() === 0) {
            // 暂停时保持当前时间显示
            return;
        }

        // 累积游戏时间（考虑时间缩放）
        this.currentStageTime += deltaTime * timeManager.getTimeScale();
        this.stageStartTime = realTime; // 更新基准时间

        // 更新UI显示
        const timeText = this.formatTime(this.currentStageTime);
        this.uiContainer.updateTimeLabel(timeText);
    }

    /**
     * 显示胜利UI
     */
    private showVictoryUI(): void {
        console.log('=== 关卡胜利! ===');
        console.log('恭喜您完成了关卡！');

        // 组织关卡奖励参数
        const levelRewardParams = this.organizeLevelRewardParams();

        // 显示胜利界面
        const game_result = find('Canvas/dialog_container/game_result');
        if (game_result) {
            const gameResult = game_result.getComponent(GameResult);
            if (gameResult) {
                // 传递胜利状态和关卡奖励参数
                gameResult.showResult(true, levelRewardParams);
            }
        }
    }

    /**
     * 显示失败UI
     */
    private showDefeatUI(): void {
        console.log('=== 关卡失败! ===');
        console.log('再试一次吧！');

        // 组织失败奖励参数（失败时type为0）
        const levelRewardParams = this.organizeLevelRewardParams();
        // 失败时设置type为0，表示失败
        levelRewardParams.type = 0;

        const game_result = find('Canvas/dialog_container/game_result');
        if (game_result) {
            const gameResult = game_result.getComponent(GameResult);
            if (gameResult) {
                //延迟1秒弹出
                this.scheduleOnce(() => {
                    gameResult.showResult(false, levelRewardParams);
                }, 0.3);
            }
        }
    }



    /**
     * 根据难度调整怪物/Boss属性
     * @param gameObject 怪物/Boss的游戏对象
     */
    private applyDifficultyModifiers(gameObject: any): void {
        // 只在普通关卡类型下根据难度调整属性
        if (game.myGlobal.stageType !== StageType.Normal) {
            return;
        }

        const difficulty = game.myGlobal.stageDifficulty;
        const config = GameConfig.getDifficultyConfig(difficulty);

        // 如果不是普通难度，则应用属性调整
        if (difficulty !== 0) {
            // 提升生命值
            if (gameObject.maxhp !== undefined) {
                const originalHp = gameObject.maxhp;
                gameObject.maxhp = Math.floor(originalHp * config.hpMultiplier);
                // console.log(`🔥 ${config.name}难度 - 生命值: ${originalHp} → ${gameObject.maxhp} (x${config.hpMultiplier})`);
            }

            // 提升攻击力
            if (gameObject.attack !== undefined) {
                const originalAttack = gameObject.attack;
                gameObject.attack = Math.floor(originalAttack * config.attackMultiplier);
                // console.log(`🔥 ${config.name}难度 - 攻击力: ${originalAttack} → ${gameObject.attack} (x${config.attackMultiplier})`);
            }
        }
    }

    /**
     * 获取当前关卡配置
     * @returns 关卡配置对象，包含经验相关设置
     */
    private getCurrentStageConfig(): { exp_per_level: number; enable_monster_exp: boolean } {
        const currentStage = game.myGlobal.currentStage;
        return VersionManager.getInstance().getStageRule(currentStage);
    }

    /**
     * 获取当前关卡的怪物经验配置
     * @returns 怪物经验配置，如果不存在则返回null
     */
    private getCurrentMonsterExpConfig(): { normal: number; elite: number } | null {
        const currentStage = game.myGlobal.currentStage;
        return VersionManager.getInstance().getMonsterExpConfig(currentStage);
    }

    /**
     * 获取当前关卡的Boss经验配置
     * @returns Boss经验配置，如果不存在则返回null
     */
    private getCurrentBossExpConfig(): { mid: number; final: number } | null {
        const currentStage = game.myGlobal.currentStage;
        return VersionManager.getInstance().getBossExpConfig(currentStage);
    }

    /**
     * 初始化生成区域缓存
     */
    private initSpawnAreaCache(): void {
        const wallManagerNode = find('Canvas/bg/bounce_rect');
        if (wallManagerNode) {
            const wallManager = wallManagerNode.getComponent(WallManager);
            if (wallManager) {
                const rectInfo = wallManager.getStoneAimRectInfo();
                if (rectInfo) {
                    this.cachedSpawnArea = {
                        leftBound: rectInfo.x,
                        rightBound: rectInfo.x + rectInfo.width,
                        bottomBound: rectInfo.y,
                        topBound: rectInfo.y + rectInfo.height,
                        width: rectInfo.width,
                        height: rectInfo.height
                    };
                }
            }
        }
    }

    /**
     * 初始化事件监听
     */
    private initEventListeners(): void {
        // 监听怪物死亡事件（通过经验更新事件）
        director.on(game.gameEvent.GAME_EXP_UPDATE, this.onMonsterKilled, this);
        director.on(game.gameEvent.GAME_BOOS_HP_UPDATE, this.onBossHpUpdate, this);
        director.on(game.gameEvent.GAME_LUCK_WHEEL_SHOW, this.onLuckWheelShow, this);
        director.on(game.gameEvent.GAME_VICTORY, this.handleStageComplete, this);
    }

    /**
    * 组件销毁时清理
    */
    onDestroy() {
        // 移除事件监听
        director.off(game.gameEvent.GAME_EXP_UPDATE, this.onMonsterKilled, this);
        director.off(game.gameEvent.GAME_BOOS_HP_UPDATE, this.onBossHpUpdate, this);
        director.off(game.gameEvent.GAME_LUCK_WHEEL_SHOW, this.onLuckWheelShow, this);
        director.off(game.gameEvent.GAME_VICTORY, this.handleStageComplete, this);

        // 【新增】清理静态实例
        if (StageComponent.instance === this) {
            StageComponent.instance = null;
        }
    }

    private onLuckWheelShow(event: any): void {
        TimeManager.getInstance().pause();
        this.luckWheel.showLuckWheel();
    }

    /**
     * 怪物被击杀事件处理
     */
    private onMonsterKilled(event: any): void {
        const { exp, monsterId, monsterLevel, isBoss, bossId } = event;

        //修改杀怪任务逻辑，不再每击杀一个怪物就法宝了，在关卡结束的时候一次性发送
        // DailyTaskHelper.completeMonsterKill();

        // 通知关卡管理器
        this.stageManager.onMonsterKilled(monsterId);

        // 统计击杀类型
        if (isBoss) {
            // Boss被击杀
            if (bossId === 1) {
                this.killStats.little_boss++;
                console.log(`🏆 小Boss击杀 - ID: ${monsterId}, BossId: ${bossId}, 等级: ${monsterLevel}, 经验: ${exp}`);
            } else if (bossId === 2) {
                this.killStats.big_boss++;
                console.log(`🏆 大Boss击杀 - ID: ${monsterId}, BossId: ${bossId}, 等级: ${monsterLevel}, 经验: ${exp}`);
            }

            // 隐藏对应的Boss血条
            if (bossId === 1 && this.midBossHPBar) {
                this.midBossHPBar.hide();

                // 🎰 击杀中期Boss时触发幸运大转盘奖励
                console.log(`🎰 击杀中期Boss！触发幸运大转盘奖励！`);
                this.scheduleOnce(() => {
                    this.luckWheel.showLuckWheel();
                }, 0.5); // 延迟0.5秒显示，让Boss死亡动画播放完

            } else if (bossId === 2 && this.finalBossHPBar) {
                this.finalBossHPBar.hide();
                console.log(`🏆 击杀最终Boss！关卡即将完成！`);
            }
        } else {
            // 普通怪物被击杀，判断是否为精英怪
            // 从event中获取怪物动画名称来判断是否为精英怪
            const monsterAnimationName = event.monsterAnimationName || '';
            if (monsterAnimationName && monsterAnimationName.startsWith('m_s_')) {
                // 精英怪物
                this.killStats.elite++;
                console.log(`⚔️ 精英怪物击杀 - ID: ${monsterId}, 等级: ${monsterLevel}, 经验: ${exp}`);
            } else {
                // 普通怪物
                this.killStats.normal++;
                console.log(`⚔️ 普通怪物击杀 - ID: ${monsterId}, 等级: ${monsterLevel}, 经验: ${exp}`);
            }
        }

        // 打印当前击杀统计
        console.log(`📊 当前击杀统计: 普通${this.killStats.normal}, 精英${this.killStats.elite}, 小Boss${this.killStats.little_boss}, 大Boss${this.killStats.big_boss}`);

        // 立即更新UI显示
        this.forceUpdateUI();
    }

    update(dt: number) {
        // 使用 TimeManager 的缩放时间
        const scaledDt = TimeManager.getInstance().getDeltaTime(dt);

        // 更新UI显示计时器
        this.uiUpdateTimer += scaledDt;

        // 定期更新UI显示
        if (this.uiUpdateTimer >= this.uiUpdateInterval) {
            this.uiUpdateTimer = 0;

            // 更新时间显示
            this.updateTimeDisplay();

            // 更新进度显示
            this.updateProgressUI();
        }

        // 定期更新关卡管理器
        if (this.stageManager) {
            // StageManager 内部会处理时间缩放
        }
    }



    /**
     * 获取击杀统计信息（返回实际击杀记录）
     */
    private getKillStatistics(): { normal: number; elite: number; little_boss: number; big_boss: number } {
        // 直接返回实际的击杀统计
        return {
            normal: this.killStats.normal,
            elite: this.killStats.elite,
            little_boss: this.killStats.little_boss,
            big_boss: this.killStats.big_boss
        };
    }

    /**
     * 组织关卡奖励参数
     * @returns 关卡奖励参数对象
     */
    private organizeLevelRewardParams(): {
        level: number;
        json: string;
        type: number;
        rank: number;
    } {
        // 获取当前关卡
        const level = game.myGlobal.currentStage;

        // 获取击杀统计
        const killStats = this.getKillStatistics();

        // 构建JSON字符串
        const jsonData = {
            normal: killStats.normal.toString(),
            elite: killStats.elite.toString(),
            little_boss: killStats.little_boss.toString(),
            big_boss: killStats.big_boss.toString()
        };
        const json = JSON.stringify(jsonData);

        // 计算通过类型：1通关，2半血，3满血
        const stageProgress = this.stageManager.getStageProgress();
        const type = this.calculatePassType(stageProgress.aliveHeroes, stageProgress.totalHeroes);

        // 获取当前玩家等级
        const rank = this.getCurrentPlayerLevel();

        return {
            level,
            json,
            type,
            rank
        };
    }

    /**
     * 获取当前玩家等级（使用梯度经验系统）
     */
    private getCurrentPlayerLevel(): number {
        const currentExp = game.myGlobal.currentExp;
        return Utils.getLevelFromTotalExp(currentExp);
    }

    /**
     * 计算通过类型
     * 1通关，2半血，3满血
     */
    private calculatePassType(aliveHeroes: number, totalHeroes: number): number {
        if (totalHeroes === 0) return 1; // 保底通关

        // 检查是否所有英雄都存活
        if (aliveHeroes === totalHeroes) {
            // 检查所有英雄是否满血
            const herosManager = HerosManager.getInstance();
            const activeHeroPanels = herosManager.getActiveHeroPanels();

            let allFullHP = true;
            for (const panel of activeHeroPanels) {
                if (!panel.hero || panel.isDead || panel.hero.hp < panel.hero.maxhp) {
                    allFullHP = false;
                    break;
                }
            }

            if (allFullHP) {
                return 3; // 满血通关
            } else {
                return 1; // 通关但不满血
            }
        }

        // 检查是否只死亡一个英雄
        if (aliveHeroes === totalHeroes - 1) {
            return 2; // 半血通关
        }

        return 1; // 通关
    }

    // 以下方法已注释，奖励由服务端处理
    // /**
    //  * 计算星星数
    //  * 规则：
    //  * - 满英雄满血 = 3星
    //  * - 死亡一个英雄 = 2星
    //  * - 其他情况 = 1星
    //  */
    // private calculateStars(aliveHeroes: number, totalHeroes: number): number {
    //     if (totalHeroes === 0) return 1; // 保底1星

    //     // 检查是否所有英雄都存活
    //     if (aliveHeroes === totalHeroes) {
    //         // 检查所有英雄是否满血
    //         const herosManager = HerosManager.getInstance();
    //         const activeHeroPanels = herosManager.getActiveHeroPanels();

    //         let allFullHP = true;
    //         for (const panel of activeHeroPanels) {
    //             if (!panel.hero || panel.isDead || panel.hero.hp < panel.hero.maxhp) {
    //                 allFullHP = false;
    //                 break;
    //             }
    //         }

    //         if (allFullHP) {
    //             return 3 // 满英雄满血 = 3星
    //         }else{
    //             return 2 // 满英雄不满血 = 2星
    //         }
    //     }

    //     // 检查是否只死亡一个英雄
    //     if (aliveHeroes === totalHeroes - 1) {
    //         return 2; // 死亡一个英雄 = 2星
    //     }

    //     // 其他情况 = 1星
    //     return 1;
    // }

    // /**
    //  * 生成物品奖励列表
    //  */
    // private generateItemRewards(stageLevel: number, difficulty: number, stars: number): import("../../dialog/GameResult").ItemReward[] {
    //     const rewards: import("../../dialog/GameResult").ItemReward[] = [];

    //     // 基础金币奖励：关卡等级 * 50 + 难度加成 + 星星加成
    //     const baseGold = stageLevel * 50;
    //     const difficultyBonus = difficulty === 1 ? 100 : 0; // 精英难度额外100金币
    //     const starBonus = stars * 25; // 每星25金币
    //     const totalGold = baseGold + difficultyBonus + starBonus;

    //     rewards.push({
    //         id: 'gold',
    //         amount: totalGold,
    //         name: '金币',
    //         type: 'currency'
    //     });

    //     // 钻石奖励（精英难度额外奖励）
    //     if (difficulty === 1) {
    //         const diamonds = Math.floor(stageLevel / 5) + stars; // 每5关1钻石 + 星星数
    //         rewards.push({
    //             id: 'diamond',
    //             amount: diamonds,
    //             name: '钻石',
    //             type: 'currency'
    //         });
    //     }

    //     // 经验药水（高星级奖励）
    //     if (stars >= 3) {
    //         rewards.push({
    //             id: 'exp_potion',
    //             amount: 1,
    //             name: '经验药水',
    //             type: 'consumable'
    //         });
    //     }

    //     // 装备碎片（随机奖励，难度越高概率越大）
    //     const fragmentChance = difficulty === 1 ? 0.3 : 0.1;
    //     if (Math.random() < fragmentChance) {
    //         rewards.push({
    //             id: 'equipment_fragment',
    //             amount: Math.floor(Math.random() * 3) + 1,
    //             name: '装备碎片',
    //             type: 'material'
    //         });
    //     }

    //     return rewards;
    // }

    // /**
    //  * 保存星星数据到UserInfoData
    //  */
    // private saveStarData(rewardData: import("../../dialog/GameResult").GameResultData): void {
    //     const userInfoData = UserInfoData.getInstance();
    //     const difficultyKey = rewardData.difficulty === 0 ? 'normal' : 'elite';

    //     // 获取当前星星数，只有更高的星数才更新
    //     const currentStars = userInfoData.getStageDifficultyStars(rewardData.stageIndex, difficultyKey);
    //     if (rewardData.stars > currentStars) {
    //         userInfoData.setStageDifficultyStars(rewardData.stageIndex, difficultyKey, rewardData.stars);
    //         console.log(`⭐ 更新${difficultyKey}难度第${rewardData.stageIndex + 1}关星星数: ${currentStars} → ${rewardData.stars}`);
    //     } else {
    //         console.log(`⭐ ${difficultyKey}难度第${rewardData.stageIndex + 1}关已有${currentStars}星，无需更新`);
    //     }
    // }

    // /**
    //  * 打印奖励详情
    //  */
    // private logRewardDetails(rewardData: import("../../dialog/GameResult").GameResultData): void {
    //     console.log('🎉 ===== 胜利奖励详情 =====');
    //     console.log(`🏆 关卡: 第${rewardData.stageIndex + 1}关 (${rewardData.difficulty === 0 ? '普通' : '精英'}难度)`);
    //     console.log(`⭐ 星星数: ${rewardData.stars}/3`);
    //     console.log(`👥 英雄状态: ${rewardData.aliveHeroes}/${rewardData.totalHeroes} 存活`);
    //     console.log(`🔢 经验奖励: ${rewardData.expReward}`);
    //     console.log(`⏱️ 用时: ${Math.floor(rewardData.duration)}秒`);
    //     console.log(`⚔️ 击杀数: ${rewardData.killCount}`);

    //     if (rewardData.itemRewards && rewardData.itemRewards.length > 0) {
    //         console.log('🎁 物品奖励:');
    //         rewardData.itemRewards.forEach(item => {
    //                 console.log(`   ${item.name}: ${item.amount}`);
    //             });
    //         }
    //     console.log('========================');
    // }


}