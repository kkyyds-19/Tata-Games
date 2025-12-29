import { _decorator, Vec3 } from 'cc';
import { GameObject } from '../object/GameObject';
const { ccclass, property } = _decorator;

// 剧情类型枚举
export enum StoryType {
    DIALOGUE = 'dialogue',        // 对话
    CUTSCENE = 'cutscene',       // 过场动画
    SPAWN_MONSTER = 'spawn_monster', // 生成怪物
    BOSS_APPEAR = 'boss_appear',  // Boss出现
    VICTORY = 'victory',          // 胜利
    DEFEAT = 'defeat'             // 失败
}

// 触发条件类型
export enum TriggerType {
    TIME = 'time',               // 时间触发
    KILL_COUNT = 'kill_count',   // 击杀数量触发
    HP_PERCENTAGE = 'hp_percentage', // 血量百分比触发
    AREA_ENTER = 'area_enter',   // 进入区域触发
    MANUAL = 'manual'            // 手动触发
}

// 怪物数据接口
export interface MonsterData {
    id: string;                  // 怪物ID
    gameObject: GameObject;      // 怪物游戏对象数据
    spawnPosition: Vec3;         // 生成位置
    count: number;               // 生成数量
    spawnInterval: number;       // 生成间隔(秒)
    level: number;               // 等级
}

// Boss数据接口
export interface BossData {
    id: string;                  // BossID
    gameObject: GameObject;      // Boss游戏对象数据
    spawnPosition: Vec3;         // 生成位置
    phases: BossPhase[];         // Boss阶段
    level: number;               // 等级
}

// Boss阶段数据
export interface BossPhase {
    phaseId: string;             // 阶段ID
    hpPercentage: number;        // 触发血量百分比
    skills: string[];            // 技能列表
    spawnMinions?: MonsterData[]; // 召唤小怪
}

// 剧情数据接口
export interface StoryData {
    id: string;                  // 剧情ID
    type: StoryType;            // 剧情类型
    title?: string;             // 标题
    content?: string;           // 内容
    speaker?: string;           // 说话者
    duration?: number;          // 持续时间(秒)
    imagePath?: string;         // 图片路径
    animationName?: string;     // 动画名称
}

// 关卡脚本事件接口
export interface StageEvent {
    id: string;                 // 事件ID
    triggerType: TriggerType;   // 触发类型
    triggerValue: number;       // 触发值 (时间/击杀数/血量百分比等)
    triggerCondition?: string;  // 附加触发条件
    storyId?: string;          // 剧情ID
    monsterSpawns?: MonsterData[]; // 生成怪物列表
    bossSpawn?: BossData;      // 生成Boss
    scriptAction?: string;     // 脚本动作
    isRepeatable: boolean;     // 是否可重复触发
    priority: number;          // 优先级 (数字越小优先级越高)
}

/**
 * 关卡类型 1普通 2外域 3地下城 4竞技场 5无尽燃烧 
 */
export enum StageType {
    Normal = 1,
    Outland,
    Dungeon,
    Arena,
    Endless,
}

// 关卡完整数据类
@ccclass('StageData')
export class StageData {

    public stageType: StageType;

    @property
    public stageId: string = '';           // 关卡ID

    @property
    public stageName: string = '';         // 关卡名称

    @property
    public stageDescription: string = '';  // 关卡描述

    @property
    public difficulty: number = 1;         // 难度等级

    @property
    public maxTime: number = 600;          // 最大时间限制(秒)

    @property
    public backgroundMusic: string = '';   // 背景音乐路径

    @property
    public backgroundImage: string = '';   // 背景图片路径

    // 所有小怪数据
    public monsters: MonsterData[] = [];

    // 所有Boss数据
    public bosses: BossData[] = [];

    // 所有剧情数据
    public stories: StoryData[] = [];

    // 关卡脚本事件列表
    public stageEvents: StageEvent[] = [];

    // 胜利条件
    public victoryConditions: {
        killAllMonsters: boolean;
        killBoss: boolean;
        surviveTime: number;
        protectTarget: boolean;
    } = {
            killAllMonsters: false,
            killBoss: false,
            surviveTime: 0,
            protectTarget: false
        };

    // 失败条件
    public defeatConditions: {
        loseAllHeroes: boolean;
        timeLimit: boolean;
        targetDestroyed: boolean;
    } = {
            loseAllHeroes: true,     // 默认启用：失去所有英雄时失败
            timeLimit: false,        // 时间限制失败
            targetDestroyed: false   // 保护目标被摧毁时失败
        };

    constructor() {
        // 初始化空数据
    }

    /**
     * 添加怪物数据
     */
    public addMonster(monster: MonsterData): void {
        this.monsters.push(monster);
    }

    /**
     * 添加Boss数据
     */
    public addBoss(boss: BossData): void {
        this.bosses.push(boss);
    }

    /**
     * 添加剧情数据
     */
    public addStory(story: StoryData): void {
        this.stories.push(story);
    }

    /**
     * 添加关卡事件
     */
    public addStageEvent(event: StageEvent): void {
        this.stageEvents.push(event);
        // 按优先级排序
        this.stageEvents.sort((a, b) => a.priority - b.priority);
    }

    /**
     * 根据ID获取怪物数据
     */
    public getMonsterById(id: string): MonsterData | null {
        return this.monsters.find(monster => monster.id === id) || null;
    }

    /**
     * 根据ID获取Boss数据
     */
    public getBossById(id: string): BossData | null {
        return this.bosses.find(boss => boss.id === id) || null;
    }

    /**
     * 根据ID获取剧情数据
     */
    public getStoryById(id: string): StoryData | null {
        return this.stories.find(story => story.id === id) || null;
    }

    /**
     * 获取指定时间的事件
     */
    public getEventsByTime(currentTime: number): StageEvent[] {
        return this.stageEvents.filter(event =>
            event.triggerType === TriggerType.TIME &&
            Math.abs(event.triggerValue - currentTime) < 0.1
        );
    }

    /**
     * 获取指定击杀数的事件
     */
    public getEventsByKillCount(killCount: number): StageEvent[] {
        return this.stageEvents.filter(event =>
            event.triggerType === TriggerType.KILL_COUNT &&
            event.triggerValue <= killCount
        );
    }

    /**
     * 获取指定血量百分比的事件
     */
    public getEventsByHpPercentage(hpPercentage: number): StageEvent[] {
        return this.stageEvents.filter(event =>
            event.triggerType === TriggerType.HP_PERCENTAGE &&
            event.triggerValue >= hpPercentage
        );
    }

    /**
     * 验证关卡数据完整性
     */
    public validateStageData(): boolean {
        if (!this.stageId || !this.stageName) {
            console.error('Stage: 关卡ID或名称不能为空');
            return false;
        }

        // 验证必须有胜利条件
        const hasVictoryCondition = this.victoryConditions.killAllMonsters ||
            this.victoryConditions.killBoss ||
            this.victoryConditions.surviveTime > 0 ||
            this.victoryConditions.protectTarget;

        if (!hasVictoryCondition) {
            console.error('Stage: 必须设置至少一个胜利条件');
            return false;
        }

        // 验证失败条件
        const hasDefeatCondition = this.defeatConditions.loseAllHeroes ||
            this.defeatConditions.timeLimit ||
            this.defeatConditions.targetDestroyed;

        if (!hasDefeatCondition) {
            console.log('Stage: 建议设置至少一个失败条件');
        }

        return true;
    }

    /**
     * 导出为JSON数据
     */
    public toJSON(): string {
        return JSON.stringify({
            stageId: this.stageId,
            stageName: this.stageName,
            stageDescription: this.stageDescription,
            difficulty: this.difficulty,
            maxTime: this.maxTime,
            backgroundMusic: this.backgroundMusic,
            backgroundImage: this.backgroundImage,
            monsters: this.monsters,
            bosses: this.bosses,
            stories: this.stories,
            stageEvents: this.stageEvents,
            victoryConditions: this.victoryConditions,
            defeatConditions: this.defeatConditions
        }, null, 2);
    }

    /**
     * 从JSON数据加载
     */
    public fromJSON(jsonData: string): boolean {
        try {
            const data = JSON.parse(jsonData);

            this.stageType = data.stageType || StageType.Normal;
            this.stageId = data.stageId || '';
            this.stageName = data.stageName || '';
            this.stageDescription = data.stageDescription || '';
            this.difficulty = data.difficulty || 1;
            this.maxTime = data.maxTime || 300;
            this.backgroundMusic = data.backgroundMusic || '';
            this.backgroundImage = data.backgroundImage || '';

            // 转换怪物数据
            this.monsters = (data.monsters || []).map((monsterData: any) => {
                const monster: MonsterData = {
                    id: monsterData.id,
                    gameObject: this.convertToGameObject(monsterData.gameObject),
                    spawnPosition: this.convertToVec3(monsterData.spawnPosition),
                    count: monsterData.count,
                    spawnInterval: monsterData.spawnInterval,
                    level: monsterData.level
                };
                return monster;
            });

            // 转换Boss数据
            this.bosses = (data.bosses || []).map((bossData: any) => {
                const boss: BossData = {
                    id: bossData.id,
                    gameObject: this.convertToGameObject(bossData.gameObject),
                    spawnPosition: this.convertToVec3(bossData.spawnPosition),
                    level: bossData.level,
                    phases: bossData.phases || []
                };
                return boss;
            });

            this.stories = data.stories || [];

            // 转换关卡事件数据
            this.stageEvents = (data.stageEvents || []).map((eventData: any) => {
                const event: StageEvent = {
                    id: eventData.id,
                    triggerType: eventData.triggerType,
                    triggerValue: eventData.triggerValue,
                    triggerCondition: eventData.triggerCondition,
                    storyId: eventData.storyId,
                    isRepeatable: eventData.isRepeatable,
                    priority: eventData.priority
                };

                // 处理怪物生成引用
                if (eventData.monsterSpawns) {
                    event.monsterSpawns = eventData.monsterSpawns.map((spawnId: string) => {
                        return this.monsters.find(m => m.id === spawnId);
                    }).filter(Boolean);
                }

                // 处理Boss生成引用
                if (eventData.bossSpawn) {
                    console.log(`StageData: 处理Boss引用 "${eventData.bossSpawn}"，当前Boss列表:`, this.bosses.map(b => b.id));
                    event.bossSpawn = this.bosses.find(b => b.id === eventData.bossSpawn);
                    if (event.bossSpawn) {
                        console.log(`StageData: Boss引用解析成功 - ${event.bossSpawn.id}`);
                    } else {
                        console.error(`StageData: Boss引用解析失败 - 未找到ID为 "${eventData.bossSpawn}" 的Boss`);
                    }
                }

                return event;
            });

            this.victoryConditions = data.victoryConditions || {
                killAllMonsters: false,
                killBoss: false,
                surviveTime: 0,
                protectTarget: false
            };
            this.defeatConditions = data.defeatConditions || {
                loseAllHeroes: true,
                timeLimit: false,
                targetDestroyed: false
            };

            return this.validateStageData();
        } catch (error) {
            console.error('Stage: JSON数据解析失败', error);
            return false;
        }
    }

    /**
     * 转换JSON对象为Vec3
     */
    private convertToVec3(data: any): Vec3 {
        if (!data) return new Vec3(0, 0, 0);
        return new Vec3(data.x || 0, data.y || 0, data.z || 0);
    }

    /**
     * 转换JSON对象为GameObject
     */
    private convertToGameObject(data: any): GameObject {
        if (!data) return new GameObject();

        const gameObject = new GameObject();
        gameObject.id = data.id || '';
        gameObject.name = data.name || '';
        gameObject.attack = data.attack || 0;
        gameObject.maxhp = data.maxhp || 100;
        gameObject.level = data.level || 1;
        gameObject.class = data.class || 0;
        gameObject.defense = data.defense || 0;
        gameObject.exp = data.exp || 0;
        gameObject.resourceType = data.resourceType || '';
        gameObject.resourceDir = data.resourceDir || '';
        gameObject.animationNames = data.animationNames || [];
        gameObject.moveSpeed = data.moveSpeed || 100;
        gameObject.attackRange = data.attackRange || 30;
        gameObject.attackInterval = data.attackInterval || 1.5;
        gameObject.isBoss = data.isBoss || false;
        gameObject.scale = data.scale || 1;
        gameObject.skinName = data.skinName || '';

        // 调试日志
        console.log(`创建GameObject: ${gameObject.id}, 移动速度: ${gameObject.moveSpeed}`);

        return gameObject;
    }

    /**
     * 从JSON字符串加载关卡数据（静态工具方法）
     */
    public static loadStageFromJSON(jsonString: string): StageData | null {
        const stageData = new StageData();

        if (stageData.fromJSON(jsonString)) {
            return stageData;
        }

        return null;
    }
} 