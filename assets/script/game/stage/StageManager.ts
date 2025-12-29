import { _decorator, Component } from 'cc';
import { StageData, StageEvent, TriggerType, MonsterData, BossData, StageType } from './StageData';
import { TimeManager } from '../TimeManager';
import { director } from 'cc';
import { game } from 'cc';
import { HerosManager } from '../HerosManager';
import { HeroPanel } from '../HeroPanel';
const { ccclass, property } = _decorator;

// 关卡状态枚举
enum StageState {
    PREPARING = 'preparing',
    RUNNING = 'running',
    PAUSED = 'paused',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

@ccclass('StageManager')
export class StageManager extends Component {

    @property
    public stageData: StageData | null = null;

    private currentState: StageState = StageState.PREPARING;
    private stageTime: number = 0;
    private killCount: number = 0;
    private currentMonsterCount: number = 0;
    private completedEvents: string[] = [];
    private aliveHeroCount: number = 0;     // 存活英雄数量
    private totalHeroCount: number = 0;     // 总英雄数量
    private isTargetDestroyed: boolean = false;

    // 优化：关卡开始时统计总怪物数量
    private totalMonstersToKill: number = 0; // 关卡开始时计算的总怪物数量

    // Boss状态跟踪
    private bossSpawned: boolean = false;   // Boss是否已生成
    private bossKilled: boolean = false;    // Boss是否已被击杀
    private currentBossId: string = '';     // 当前Boss ID

    // 事件回调
    public onStoryTrigger: (storyId: string) => void = null;
    public onMonsterSpawn: (monsters: MonsterData[]) => void = null;
    public onBossSpawn: (boss: BossData) => void = null;
    public onStageComplete: (success: boolean) => void = null;
    public onHeroCountChanged: (aliveCount: number, totalCount: number) => void = null;

    start() {


    }

    initStage() {
        if (this.stageData && this.stageData.validateStageData()) {
            this.initializeStage();
        } else {
        }
    }



    update(dt: number) {
        if (this.currentState !== StageState.RUNNING) {
            return;
        }

        // 使用 TimeManager 的缩放时间
        const scaledDt = TimeManager.getInstance().getDeltaTime(dt);
        this.stageTime += scaledDt;

        // 只检查时间事件，胜利条件改为事件驱动
        this.checkTimeEvents();
    }

    private initializeStage(): void {
        this.currentState = StageState.PREPARING;
        this.stageTime = 0;
        this.killCount = 0;
        this.currentMonsterCount = 0;
        this.completedEvents = [];

        // 重置Boss状态
        this.bossSpawned = false;
        this.bossKilled = false;
        this.currentBossId = '';

        // 优化：关卡开始时统计总怪物数量
        this.calculateTotalMonsters();

        this.executeInitialStories();

        // TODO_TIMEMANAGER: 此处使用scheduleOnce不受TimeManager控制，关卡启动延迟，暂停时仍会执行
        this.scheduleOnce(() => {
            this.startStage();
        }, 1.0);
    }

    private startStage(): void {
        this.currentState = StageState.RUNNING;

    }

    private checkTimeEvents(): void {
        if (!this.stageData) return;

        const currentEvents = this.stageData.getEventsByTime(this.stageTime);

        // if (currentEvents.length > 0) {
        // }

        currentEvents.forEach(event => {
            if (!this.isEventCompleted(event)) {
                this.executeEvent(event);
            } else {
            }
        });
    }

    private checkVictoryConditions(): void {
        if (!this.stageData) return;

        // 竞技场胜利条件：上方（挑战者）英雄全部死亡则胜利
        if (this.stageData.stageType === StageType.Arena) {
            const { playerAlive, challengerAlive, playerTotal, challengerTotal } = this.getArenaAliveCounts();
            // 只有当挑战者侧有上场英雄时才判断其全部死亡为胜利
            if (challengerTotal > 0 && challengerAlive <= 0) {
                this.completeStage(true);
            }
            return; // 竞技场模式下不使用普通怪物/时间胜利逻辑
        }

        const conditions = this.stageData.victoryConditions;
        let victory = false;


        if (conditions.killBoss) {
            // 检查是否击杀了Boss
            if (!this.bossKilled) {
                return; // Boss未被击杀，不能胜利
            } else {
            }
        }

        if (conditions.surviveTime > 0) {
            if (this.stageTime >= conditions.surviveTime) {
                victory = true;
            }
        }

        // 如果同时设置了killAllMonsters和killBoss，两个条件都必须满足
        if (conditions.killAllMonsters && conditions.killBoss) {
            // 检查是否所有怪物都被击杀且Boss也被击杀
            if (this.killCount >= this.totalMonstersToKill && this.currentMonsterCount === 0 && this.bossKilled) {
                victory = true;
            }
        } else if (conditions.killAllMonsters) {
            // 只需要击杀所有怪物
            if (this.killCount >= this.totalMonstersToKill && this.currentMonsterCount === 0) {
                victory = true;
            }
        } else if (conditions.killBoss) {
            // 只需要击杀Boss
            if (this.bossKilled) {
                victory = true;
            }
        }

        if (victory) {
            this.completeStage(true);
        }
    }

    private checkDefeatConditions(): void {
        if (!this.stageData) return;

        // 竞技场失败条件：下方（我方）英雄全部死亡则失败
        if (this.stageData.stageType === StageType.Arena) {
            const { playerAlive, playerTotal } = this.getArenaAliveCounts();
            if (playerTotal > 0 && playerAlive <= 0) {
                this.completeStage(false);
                return;
            }
            // 继续检查时间限制/目标被摧毁（若仍然适用）
        }

        const defeatConditions = this.stageData.defeatConditions;
        console.log(`${defeatConditions.loseAllHeroes} ${defeatConditions.timeLimit} ${defeatConditions.targetDestroyed}`);


        // 检查失去所有英雄（非竞技场）
        if (this.stageData.stageType !== StageType.Arena) {
            if (defeatConditions.loseAllHeroes && this.aliveHeroCount <= 0 && this.totalHeroCount > 0) {
                this.completeStage(false);
                return;
            }
        }

        // 检查时间限制
        if (defeatConditions.timeLimit && this.stageData.maxTime > 0 && this.stageTime >= this.stageData.maxTime) {
            this.completeStage(false);
            return;
        }

        // 可以添加更多失败条件检查
        if (defeatConditions.targetDestroyed && this.isTargetDestroyed) {
            this.completeStage(false);
            return;
        }
    }

    private executeInitialStories(): void {
        if (!this.stageData) return;

        const initialEvents = this.stageData.stageEvents.filter(event =>
            event.triggerType === TriggerType.TIME && event.triggerValue === 0
        );

        initialEvents.forEach(event => {
            this.executeEvent(event);
        });
    }

    private executeEvent(event: StageEvent): void {
        console.log(`StageManager: 执行事件 ${event.id} (时间: ${this.stageTime.toFixed(1)}秒)`);

        if (event.storyId) {
            console.log(`StageManager: 触发剧情 ${event.storyId}`);
            this.triggerStory(event.storyId);
        }

        if (event.monsterSpawns && event.monsterSpawns.length > 0) {
            console.log(`StageManager: 生成怪物波次，包含 ${event.monsterSpawns.length} 种怪物`);
            this.spawnMonsters(event.monsterSpawns);
        }

        if (event.bossSpawn) {
            console.log(`StageManager: 尝试生成Boss ${event.bossSpawn ? event.bossSpawn.id : '未找到Boss数据'}`);
            this.spawnBoss(event.bossSpawn);
        }

        if (!event.isRepeatable) {
            this.markEventCompleted(event.id);
        }
    }

    private triggerStory(storyId: string): void {
        if (this.onStoryTrigger) {
            this.onStoryTrigger(storyId);
        }

        const story = this.stageData?.getStoryById(storyId);
        if (story) {
        }
    }

    private spawnMonsters(monsters: MonsterData[]): void {
        if (this.onMonsterSpawn) {
            this.onMonsterSpawn(monsters);
        }

        monsters.forEach(monster => {
            const oldCount = this.currentMonsterCount;
            this.currentMonsterCount += monster.count;
        });
    }

    private spawnBoss(boss: BossData): void {
        console.log(`StageManager: spawnBoss被调用，Boss数据:`, boss);

        if (!boss) {
            console.error('StageManager: Boss数据为空，无法生成Boss');
            return;
        }

        console.log(`StageManager: 准备生成Boss ${boss.id}，血量: ${boss.gameObject.maxhp}`);

        if (this.onBossSpawn) {
            console.log('StageManager: 调用onBossSpawn回调');
            this.onBossSpawn(boss);
        } else {
            console.error('StageManager: onBossSpawn回调未设置');
        }

        // 更新Boss状态
        this.bossSpawned = true;
        this.currentBossId = boss.id;
        // Boss也算作怪物；竞技场镜像生成则计为2
        if (this.stageData.stageType === StageType.Arena) {
            this.currentMonsterCount += 2;
        } else {
            this.currentMonsterCount += 1;
        }

        console.log(`StageManager: Boss状态已更新 - bossSpawned: ${this.bossSpawned}, currentBossId: ${this.currentBossId}`);
    }

    private isEventCompleted(event: StageEvent): boolean {
        return this.completedEvents.indexOf(event.id) !== -1;
    }

    private markEventCompleted(eventId: string): void {
        if (this.completedEvents.indexOf(eventId) === -1) {
            this.completedEvents.push(eventId);
        }
    }

    private completeStage(success: boolean): void {
        this.currentState = success ? StageState.COMPLETED : StageState.FAILED;

        if (this.onStageComplete) {
            this.onStageComplete(success);
        }

    }

    public onMonsterKilled(monsterId: string): void {
        this.killCount++;
        this.currentMonsterCount = Math.max(0, this.currentMonsterCount - 1);

        // 检查是否击杀了Boss
        if (this.bossSpawned && monsterId === this.currentBossId) {
            this.bossKilled = true;
        }


        this.checkKillCountEvents();

        // 优化：只在怪物被击杀时检查胜利条件
        this.checkVictoryConditions();
    }

    private checkKillCountEvents(): void {
        if (!this.stageData) return;

        const killEvents = this.stageData.getEventsByKillCount(this.killCount);

        killEvents.forEach(event => {
            if (!this.isEventCompleted(event)) {
                this.executeEvent(event);
            }
        });
    }

    /**
     * 设置英雄数量
     */
    public setHeroCount(aliveCount: number, totalCount: number, isTargetDestroyed: boolean): void {
        this.aliveHeroCount = aliveCount;
        this.totalHeroCount = totalCount;
        this.isTargetDestroyed = isTargetDestroyed;

        if (this.onHeroCountChanged) {
            this.onHeroCountChanged(aliveCount, totalCount);
        }
    }

    /**
     * 英雄死亡回调
     */
    public onHeroDied(heroId: string): void {
        this.aliveHeroCount = Math.max(0, this.aliveHeroCount - 1);

        if (this.onHeroCountChanged) {
            this.onHeroCountChanged(this.aliveHeroCount, this.totalHeroCount);
        }

        // 竞技场需要在英雄死亡时同时检查胜利与失败条件
        this.checkDefeatConditions();
        this.checkVictoryConditions();
    }

    /**
     * 英雄复活回调
     */
    public onHeroRevived(heroId: string): void {
        this.aliveHeroCount = Math.min(this.totalHeroCount, this.aliveHeroCount + 1);

        if (this.onHeroCountChanged) {
            this.onHeroCountChanged(this.aliveHeroCount, this.totalHeroCount);
        }
    }

    public getStageProgress(): {
        time: number;
        killCount: number;
        currentMonsters: number;
        aliveHeroes: number;
        totalHeroes: number;
    } {
        return {
            time: this.stageTime,
            killCount: this.killCount,
            currentMonsters: this.currentMonsterCount,
            aliveHeroes: this.aliveHeroCount,
            totalHeroes: this.totalHeroCount
        };
    }

    /**
     * 获取关卡详细状态（包括Boss信息）
     */
    public getDetailedStageStatus(): {
        time: number;
        killCount: number;
        currentMonsters: number;
        aliveHeroes: number;
        totalHeroes: number;
        bossSpawned: boolean;
        bossKilled: boolean;
        currentBossId: string;
        stageState: string;
    } {
        return {
            time: this.stageTime,
            killCount: this.killCount,
            currentMonsters: this.currentMonsterCount,
            aliveHeroes: this.aliveHeroCount,
            totalHeroes: this.totalHeroCount,
            bossSpawned: this.bossSpawned,
            bossKilled: this.bossKilled,
            currentBossId: this.currentBossId,
            stageState: this.currentState
        };
    }

    private calculateTotalMonsters(): void {
        if (!this.stageData) return;

        let totalMonstersToKill = 0;

        // 计算所有关卡事件中的怪物总数
        this.stageData.stageEvents.forEach(event => {
            if (event.monsterSpawns && event.monsterSpawns.length > 0) {
                event.monsterSpawns.forEach(monster => {
                    // 竞技场镜像生成，怪物按2倍计入
                    if (this.stageData.stageType === StageType.Arena) {
                        totalMonstersToKill += monster.count * 2;
                    } else {
                        totalMonstersToKill += monster.count;
                    }
                });
            }

            // 包括Boss
            if (event.bossSpawn) {
                if (this.stageData.stageType === StageType.Arena) {
                    totalMonstersToKill += 2;
                } else {
                    totalMonstersToKill += 1;
                }
            }
        });

        // 如果没有事件定义的怪物，则使用基础数据
        if (totalMonstersToKill === 0) {
            // 计算基础怪物数据中的总数
            this.stageData.monsters.forEach(monster => {
                if (this.stageData.stageType === StageType.Arena) {
                    totalMonstersToKill += monster.count * 2;
                } else {
                    totalMonstersToKill += monster.count;
                }
            });

            // 包括Boss
            if (this.stageData.stageType === StageType.Arena) {
                totalMonstersToKill += this.stageData.bosses.length * 2;
            } else {
                totalMonstersToKill += this.stageData.bosses.length;
            }
        }

        this.totalMonstersToKill = totalMonstersToKill;
    }

    // 计算竞技场上下侧英雄的存活情况
    private getArenaAliveCounts(): {
        playerAlive: number;
        challengerAlive: number;
        playerTotal: number;
        challengerTotal: number;
    } {
        const hm = HerosManager.getInstance?.();
        if (!hm || !hm.heroPanels || hm.heroPanels.length < 2) {
            // 回退到整体统计，避免空引用
            return {
                playerAlive: this.aliveHeroCount,
                challengerAlive: 0,
                playerTotal: this.totalHeroCount,
                challengerTotal: 0
            };
        }

        const panelsPlayer = hm.heroPanels[0] as HeroPanel[];
        const panelsChallenger = hm.heroPanels[1] as HeroPanel[];

        const countTotal = (panels: HeroPanel[]) => panels.filter(p => p && p.isOpen && p.hero).length;
        const countAlive = (panels: HeroPanel[]) => panels.filter(p => p && p.isOpen && p.hero && !p.isDead).length;

        return {
            playerAlive: countAlive(panelsPlayer),
            challengerAlive: countAlive(panelsChallenger),
            playerTotal: countTotal(panelsPlayer),
            challengerTotal: countTotal(panelsChallenger)
        };
    }
}