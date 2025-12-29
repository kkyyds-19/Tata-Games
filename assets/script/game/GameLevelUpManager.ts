import { SkillManager, SkillOption, OptionType } from './skills/SkillManager';
import { _decorator, Component, director, game } from 'cc';
import { GameObject } from './object/GameObject';
import { Heros } from './object/Heros';
import { HerosManager } from './HerosManager';
import { HeroPanel } from './HeroPanel';
import { UserClassData } from '../user/UserClassData';
import { UserArmyData } from '../user/UserArmyData';
import { UserEquipmentData } from '../user/UserEquipmentData';
import { StageType } from './stage/StageData';
import { GameManager } from './GameManager';
import { ResourceConfig } from '../global/config/ResourceConfig';
import { TimeManager } from './TimeManager';
import { arenaAPI } from '../api/ArenaAPI';
import { myHeroAPI } from '../api/MyHeroAPI';
import { mapEnemyListToCardData } from '../utils/EnemyHeroMapper';
import { Utils } from '../utils/Utils';

const { ccclass, property } = _decorator;

/**
 * 升级选择类型
 */
export enum LevelUpType {
  HERO_SELECTION = 'hero_selection',    // 英雄选择（偶数等级）
  SKILL_SELECTION = 'skill_selection'   // 技能选择（奇数等级）
}

/**
 * 升级选择事件接口
 */
export interface LevelUpChoiceEvent {
  type: LevelUpType
  playerLevel: number
  heroGameObjs?: GameObject[]         // 英雄GameObject选项（偶数等级）
  skillOptions?: SkillOption[]        // 技能选择选项（奇数等级）
}

/**
 * 🎮 游戏升级管理器
 * 处理玩家升级时的英雄选择和技能选择逻辑
 */
@ccclass('GameLevelUpManager')
export class GameLevelUpManager extends Component {
  private static instance: GameLevelUpManager
  private skillManager: SkillManager
  private herosManager: HerosManager;

  /**
   * 所有可能出现的英雄候选列表
   */
  private heroCandidates: GameObject[][] = [[], []];

  public static getInstance(): GameLevelUpManager {
    return GameLevelUpManager.instance
  }

  onLoad() {
    GameLevelUpManager.instance = this
    this.skillManager = SkillManager.getInstance()
    this.herosManager = HerosManager.getInstance();
    this.initEventListeners()
  }

  // /**
  //  * 初始化英雄候选列表
  //  */
  // private initializeHeroCandidates(): void {
  //   const deployedCardIds = UserClassData.getInstance().getDeployedCardIds();
  //   this.heroCandidates = [[], []];
  //   this.heroCandidates[0] = deployedCardIds.map(cardId => {
  //     const cardData = UserArmyData.getInstance().getCardById(cardId);
  //     return new Heros(cardData.heroId);
  //   })

    
   

  //   //NOTE，用所有英雄数据中未上阵的英雄每个职业选择出一个作为右侧英雄
  //   if (GameManager.getInstance().stageManager.stageData.stageType == StageType.Outland || GameManager.getInstance().stageManager.stageData.stageType == StageType.Endless) {
  //     const undeployedHeroIds = UserClassData.getInstance().getUndeployHerosIds();
  //     this.heroCandidates[1] = undeployedHeroIds.map(heroId => {
  //       return new Heros(heroId);
  //     })
  //   }

  //   //  this.test()
  //   console.log(`LevelupMgr`);
  //   game.myGlobal.gameInitOne();
  // }


// 只使用玩家背包中拥有的英雄
  private async initializeHeroCandidates(): Promise<void> {
  const deployedCardIds = UserClassData.getInstance().getDeployedCardIds();
  this.heroCandidates = [[], []];
  
  // 获取玩家背包中拥有的英雄ID列表
  const userArmyData = UserArmyData.getInstance();
  const ownedCards = userArmyData.getUserCards();
  const ownedHeroIds = ownedCards.map(card => card.heroId);
  
  // 左侧英雄：使用玩家拥有的已部署英雄
  const deployedHeroIds = UserClassData.getInstance().getDeployedHeroIds();
  this.heroCandidates[0] = deployedHeroIds
    .filter(heroId => ownedHeroIds.includes(heroId))
    .map(heroId => new Heros(heroId));
  if (this.heroCandidates[0].length > 5) {
    this.heroCandidates[0] = this.heroCandidates[0].slice(0, 5);
  }
  if (this.heroCandidates[0].length < 5) {
    const existingLeft = new Set(this.heroCandidates[0].map(h => (h as any).id || (h as any).heroId || (h as any)));
    const fillCards = ownedCards
      .filter(c => !existingLeft.has(c.heroId))
      .sort((a, b) => (b.quality - a.quality) || ((Number(b.serverHeroId) || 0) - (Number(a.serverHeroId) || 0)));
    for (let i = 0; i < fillCards.length && this.heroCandidates[0].length < 5; i++) {
      this.heroCandidates[0].push(new Heros(fillCards[i].heroId));
    }
  }

  // 竞技场模式特殊处理：敌方英雄使用接口获取
  if (game.myGlobal.stageType === StageType.Arena) {
    try {
      // 优先：如果有对手用户ID，调用 myHero.getEnemyList
      const stageData = GameManager.getInstance()?.stageManager?.stageData as any;
      const opponentUserId: number | undefined = (stageData?.opponentUserId as number) ?? (game.myGlobal as any)?.arenaOpponentUserId;
      // 为避免资源ID不匹配（服务端heroId与本地ResourceConfig不一致），统一用本地heroId(string)
      let selectedHeroIds: string[] = [];

      if (typeof opponentUserId === 'number' && Number.isFinite(opponentUserId) && opponentUserId > 0) {
        const enemyRes = await myHeroAPI.getEnemyList(opponentUserId);
        const enemyList = enemyRes?.data || [];
        // 映射为本地CardData，提取本地heroId（字符串，来自资源表）
        const enemyCards = mapEnemyListToCardData(enemyList);
        selectedHeroIds = enemyCards.map(c => c.heroId).filter(id => typeof id === 'string' && id.length > 0);

        // 如果通过对手用户ID获取的上阵英雄为空，优先尝试使用其“拥有的英雄列表”（不筛选 isBattle）
        if (!selectedHeroIds || selectedHeroIds.length === 0) {
          try {
            const ownedRes = await myHeroAPI.getEnemyOwnedList(opponentUserId);
            const ownedList = ownedRes?.data || [];
            const ownedCards = mapEnemyListToCardData(ownedList);
            // 按品质优先挑选最多5个，并使用本地heroId（字符串）
            const sortedCards = ownedCards.sort((a, b) => (b.quality - a.quality) || ((Number(b.serverHeroId) || 0) - (Number(a.serverHeroId) || 0)));
            selectedHeroIds = sortedCards.slice(0, 5).map(c => c.heroId);
            if (selectedHeroIds.length > 0) {
              console.warn('Arena: 敌方上阵英雄为空，已改用其拥有英雄列表（按品质优先挑选）');
            }
          } catch (eOwned) {
            console.warn('Arena: 获取敌方拥有英雄列表失败', eOwned);
          }
        }

        // 若仍为空，则尝试 arena 接口作为备选
        if (!selectedHeroIds || selectedHeroIds.length === 0) {
          try {
            const res2 = await arenaAPI.getOpponentTeam(game.myGlobal.currentStage);
            const serverHeroIds2 = res2?.data?.heroIds || [];
            // arena 接口通常返回的是资源ID（数值），统一转换为字符串以与本地一致
            selectedHeroIds = (serverHeroIds2 as any[])
              .map(id => (typeof id === 'number' ? String(id) : String(parseInt(id, 10))))
              .filter(id => !!id);
            console.warn('Arena: 敌方上阵英雄为空，已尝试备选接口获取阵容');
          } catch (e2) {
            console.warn('Arena: 备选接口获取阵容失败', e2);
          }
        }
        if (selectedHeroIds && selectedHeroIds.length > 0 && selectedHeroIds.length < 5) {
          try {
            const res2 = await arenaAPI.getOpponentTeam(game.myGlobal.currentStage);
            const serverHeroIds2 = res2?.data?.heroIds || [];
            const arenaIds = (serverHeroIds2 as any[])
              .map(id => (typeof id === 'number' ? String(id) : String(parseInt(id, 10))))
              .filter(id => !!id);
            const exist = new Set(selectedHeroIds);
            for (let i = 0; i < arenaIds.length && selectedHeroIds.length < 5; i++) {
              const hid = arenaIds[i];
              if (!exist.has(hid)) {
                selectedHeroIds.push(hid);
                exist.add(hid);
              }
            }
          } catch {}
        }
      } else {
        // 次优先：调用 arena 对手阵容接口
        const res = await arenaAPI.getOpponentTeam();
        const serverHeroIds = res?.data?.heroIds || [];
        selectedHeroIds = (serverHeroIds as any[])
          .map(id => (typeof id === 'number' ? String(id) : String(parseInt(id, 10))))
          .filter(id => !!id);
      }

      if (!selectedHeroIds || selectedHeroIds.length === 0) {
        // 回退：从全英雄池随机抽取（统一转换为 number[]）
        const allHeroIds = ResourceConfig.heros_list
          .map(hero => (typeof hero.id === 'string' ? parseInt(hero.id, 10) : Number(hero.id)))
          .filter(n => Number.isFinite(n));
        const shuffledHeroIds = this.shuffle([...allHeroIds]);
        // 随机回退：改为字符串ID
        selectedHeroIds = shuffledHeroIds.slice(0, 5).map(n => String(n));
        console.warn('Arena 对手阵容为空或接口不可用，采用随机阵容');
      }

      this.heroCandidates[1] = selectedHeroIds.map(heroId => new Heros(heroId));
      if (this.heroCandidates[1].length > 5) {
        this.heroCandidates[1] = this.heroCandidates[1].slice(0, 5);
      }
      console.log(`LevelupMgr: 竞技场模式 - 玩家英雄: ${this.heroCandidates[0].length}, 敌方英雄: ${this.heroCandidates[1].length}`);
    } catch (e) {
      // 网络或服务端错误时的安全回退（统一转换为 number[]）
      const allHeroIds = ResourceConfig.heros_list
        .map(hero => (typeof hero.id === 'string' ? parseInt(hero.id, 10) : Number(hero.id)))
        .filter(n => Number.isFinite(n));
      const shuffledHeroIds = this.shuffle([...allHeroIds]);
      const selectedHeroIds = shuffledHeroIds.slice(0, 5);
      this.heroCandidates[1] = selectedHeroIds.map(heroId => new Heros(heroId));
      if (this.heroCandidates[1].length > 5) {
        this.heroCandidates[1] = this.heroCandidates[1].slice(0, 5);
      }
      console.error('获取竞技场对手阵容失败，使用随机阵容:', (e as Error)?.message || e);
    }
  } else if (game.myGlobal.stageType === StageType.Dungeon || game.myGlobal.stageType === StageType.Endless) {
    try {
      const stageData = GameManager.getInstance()?.stageManager?.stageData as any;
      const opponentUserId: number | undefined = (stageData?.opponentUserId as number) ?? (game.myGlobal as any)?.dungeonOpponentUserId ?? (game.myGlobal as any)?.arenaOpponentUserId;
      let selectedHeroIds: string[] = [];

      if (game.myGlobal.stageType === StageType.Endless) {
        if (typeof opponentUserId === 'number' && Number.isFinite(opponentUserId) && opponentUserId > 0) {
          const enemyRes = await myHeroAPI.getEnemyList(opponentUserId);
          const enemyList = enemyRes?.data || [];
          const enemyCards = mapEnemyListToCardData(enemyList);
          selectedHeroIds = enemyCards.map(c => c.heroId).filter(id => typeof id === 'string' && id.length > 0);
          if (selectedHeroIds.length < 5) {
            const exist = new Set(selectedHeroIds);
            for (let i = 0; i < enemyList.length && selectedHeroIds.length < 5; i++) {
              const hid = String(enemyList[i]?.heroId);
              if (hid && !exist.has(hid)) {
                selectedHeroIds.push(hid);
                exist.add(hid);
              }
            }
          }
          if (!selectedHeroIds || selectedHeroIds.length === 0) {
            throw new Error('无法获取对手英雄阵容');
          }
        } else {
          throw new Error('未找到有效的对手用户ID');
        }
      } else {
        // 地下城模式保持原有逻辑
        if (typeof opponentUserId === 'number' && Number.isFinite(opponentUserId) && opponentUserId > 0) {
          const enemyRes = await myHeroAPI.getEnemyList(opponentUserId);
          const enemyList = enemyRes?.data || [];
          const enemyCards = mapEnemyListToCardData(enemyList);
          selectedHeroIds = enemyCards.map(c => c.heroId).filter(id => typeof id === 'string' && id.length > 0);

          if (!selectedHeroIds || selectedHeroIds.length === 0) {
            try {
              const ownedRes = await myHeroAPI.getEnemyOwnedList(opponentUserId);
              const ownedList = ownedRes?.data || [];
              const ownedCards = mapEnemyListToCardData(ownedList);
              const sortedCards = ownedCards.sort((a, b) => (b.quality - a.quality) || ((Number(b.serverHeroId) || 0) - (Number(a.serverHeroId) || 0)));
              selectedHeroIds = sortedCards.slice(0, 5).map(c => c.heroId);
            } catch {}
          }
        }

        if (!selectedHeroIds || selectedHeroIds.length === 0) {
          const allHeroIds = ResourceConfig.heros_list
            .map(hero => (typeof hero.id === 'string' ? parseInt(hero.id, 10) : Number(hero.id)))
            .filter(n => Number.isFinite(n));
          const shuffledHeroIds = this.shuffle([...allHeroIds]);
          selectedHeroIds = shuffledHeroIds.slice(0, 5).map(n => String(n));
        }
      }

      this.heroCandidates[1] = selectedHeroIds.slice(0, 5).map(heroId => new Heros(heroId));
      console.log(`LevelupMgr: ${game.myGlobal.stageType === StageType.Endless ? '燃烧降临' : '地下城'}模式 - 玩家英雄: ${this.heroCandidates[0].length}, 敌方英雄: ${this.heroCandidates[1].length}`);
    } catch (error) {
      // 燃烧降临模式不允许回退到随机英雄
      if (game.myGlobal.stageType === StageType.Endless) {
        console.error('燃烧降临: 获取对手英雄失败，无法开始游戏', error);
        throw error;
      }
      
      // 地下城模式保持原有回退逻辑
      const allHeroIds = ResourceConfig.heros_list
        .map(hero => (typeof hero.id === 'string' ? parseInt(hero.id, 10) : Number(hero.id)))
        .filter(n => Number.isFinite(n));
      const shuffledHeroIds = this.shuffle([...allHeroIds]);
      const selectedHeroIds = shuffledHeroIds.slice(0, 5);
      this.heroCandidates[1] = selectedHeroIds.map(heroId => new Heros(heroId));
      if (this.heroCandidates[1].length > 5) {
        this.heroCandidates[1] = this.heroCandidates[1].slice(0, 5);
      }
    }
    } else {
    const undeployedHeroIds = UserClassData.getInstance().getUndeployHerosIds();
    this.heroCandidates[1] = undeployedHeroIds
      .filter(heroId => ownedHeroIds.includes(heroId))
      .map(heroId => new Heros(heroId));
  }

  console.log(`LevelupMgr: 初始化英雄候选列表 - 已部署: ${this.heroCandidates[0].length}, 未部署: ${this.heroCandidates[1].length}`);
  game.myGlobal.gameInitOne();
  // 深渊模式：在关卡初始化后直接开启第一次技能/装备选择
  const globalAny = game.myGlobal as any;
  const isAbyss = !!globalAny.abyssMode;
  const remaining = Number(globalAny.abyssSelectCount || 0);
  if (isAbyss && remaining > 0) {
    const playerLevel = Utils.getLevelFromTotalExp(Math.max(0, Number(game.myGlobal.currentExp || 0)));
    // 使用延迟调用确保技能选择面板已经初始化完成
    this.scheduleOnce(() => {
      this.handleSkillSelection(playerLevel);
    }, 0.1); // 延迟0.1秒
  }
  

}

  private test() {
    this.heroCandidates = [[
      // new Heros(1000), // 坦克
      // new Heros(1002), // 射手
      // new Heros(1001), // 辅助
      // new Heros(1003), // 法师
      // new Heros(1004), // 刺客


      new Heros(1005), // 坦克
      new Heros(1006), // 辅助 
      // new Heros(1007), // 射手
      // new Heros(1008), // 法师
      // new Heros(1009), // 刺客


      new Heros(1010), // 砰砰博士
      new Heros(1011), // 艾格文

    ], []]
  }

  public getHeroCandidates(): GameObject[][] {
    return this.heroCandidates;
  }

  /**
   * 初始化事件监听
   */
  private initEventListeners(): void {
    director.on(game.gameEvent.GAME_MAP_CFG_LOADED, this.initializeHeroCandidates, this);
    director.on(game.gameEvent.GAME_LEVEL_UP, this.onPlayerLevelUp, this)
  }

  onDestroy() {
    director.off(game.gameEvent.GAME_MAP_CFG_LOADED, this.initializeHeroCandidates, this);
    director.off(game.gameEvent.GAME_LEVEL_UP, this.onPlayerLevelUp, this)
  }

  /**
   * 处理玩家升级事件
   * @param event 升级事件数据
   */
  private async onPlayerLevelUp(event: { oldLevel: number, newLevel: number }): Promise<void> {
    if (!this.herosManager) {
      this.herosManager = HerosManager.getInstance();
    }
    const { newLevel } = event

    // 更稳健的关卡类型检测：优先使用StageManager中的类型，其次回退到game.myGlobal
    const currentStageType: StageType = (GameManager.getInstance()?.stageManager?.stageData?.stageType as StageType) ?? game.myGlobal.stageType;

    // 深渊模式：不需要选择英雄，直接上场所有英雄
    const globalAny = game.myGlobal as any;
    const isAbyss = !!globalAny.abyssMode;
    if (isAbyss && newLevel === 0) {
      // 深渊模式下，强制上场所有候选英雄，不考虑当前场上是否有英雄
      
      // 上场所有玩家候选英雄
      this.heroCandidates[0].forEach(hero => {
        this.selectHero(hero);
      });
      
      console.log(`深渊模式: 直接上场${this.heroCandidates[0].length}个玩家英雄`);
      
      // 若当前处于暂停状态，恢复到暂停前的速度（不覆盖玩家的加速设置）
      const tm = TimeManager.getInstance();
      if (tm.isPaused()) {
        tm.resume();
      }
      
      // 深渊模式下，直接上场所有英雄后立即返回，避免触发后续的选择逻辑导致游戏暂停
      return;
    }

    //荣誉竞技场：不需要选择英雄，直接上场所有英雄
    if (currentStageType === StageType.Arena) {
      // 荣誉竞技场模式下，强制上场所有候选英雄，不考虑当前场上是否有英雄
      
      // 上场所有玩家候选英雄
      this.heroCandidates[0].forEach(hero => {
        this.selectHero(hero);
      });
      
      console.log(`荣誉竞技场: 直接上场${this.heroCandidates[0].length}个玩家英雄`);
      
      // 直接上场所有敌方英雄（荣誉竞技场专属逻辑）
      this.heroCandidates[1].forEach(hero => {
        // 直接为敌方英雄上场，不需要玩家选择
        this.selectHeroForEnemy(hero);
      });
      
      console.log(`荣誉竞技场: 直接上场${this.heroCandidates[1].length}个敌方英雄`);
      
      // 若当前处于暂停状态，恢复到暂停前的速度（不覆盖玩家的加速设置）
      const tm = TimeManager.getInstance();
      if (tm.isPaused()) {
        tm.resume();
      }
      
      // 荣誉竞技场模式下，直接上场所有英雄后立即返回，避免触发后续的选择逻辑导致游戏暂停
      return;
    }
    //外域关卡，刚开始的时候，把10个英雄的其他9个全上场，剩下一个作为刚开始的第一个英雄给玩家选
    else if ((currentStageType === StageType.Outland) && newLevel === 0) {
      const activeHeroes = this.herosManager.getActiveHeroes();
      const activeHeroIds = activeHeroes.map(hero => hero.id);
      let availableGameObjs = this.heroCandidates[0].filter(gameObj =>
        activeHeroIds.indexOf(gameObj.id) === -1
      );
      const availableGameObjs1 = this.heroCandidates[1].filter(gameObj =>
        activeHeroIds.indexOf(gameObj.id) === -1
      );
      availableGameObjs = availableGameObjs.concat(availableGameObjs1);

      while (availableGameObjs.length > 1) {
        const index = Math.floor(Math.random() * availableGameObjs.length - 1);
        let obj = availableGameObjs.splice(index, 1)[0];
        this.selectHero(obj);
      }
    }else if((currentStageType === StageType.Dungeon || currentStageType === StageType.Endless) && newLevel === 0){
      const totalCandidates = (this.heroCandidates[0]?.length || 0) + (this.heroCandidates[1]?.length || 0);
      if (totalCandidates === 0) {
        await this.initializeHeroCandidates();
      }
      this.heroCandidates[0].forEach(hero => {
        this.selectHero(hero);
      });
      this.heroCandidates[1].forEach(hero => {
        this.selectHeroForEnemy(hero);
      });
      const tm = TimeManager.getInstance();
      if (tm.isPaused()) {
        tm.resume();
      }
      return;
    }else{

    }

    const activeHeroCount = this.herosManager.getActiveHeroes().length;
    const candidateHeroCount = this.heroCandidates[0].length + this.heroCandidates[1].length;
    if (activeHeroCount >= candidateHeroCount) {
      this.handleSkillSelection(newLevel);
      return;
    }

    if (activeHeroCount > candidateHeroCount) {
      this.handleSkillSelection(newLevel);
      return;
    }

    if (newLevel % 2 === 0) {
      this.handleHeroSelection(newLevel)
    } else {
      this.handleSkillSelection(newLevel)
    }
  }

  /**
   * 处理英雄选择（偶数等级）
   * @param playerLevel 玩家等级
   */
  private handleHeroSelection(playerLevel: number): void {
    const currentStageType: StageType = (GameManager.getInstance()?.stageManager?.stageData?.stageType as StageType) ?? game.myGlobal.stageType;
    if (currentStageType === StageType.Arena) {
      return;
    }
    const activeHeroes = this.herosManager.getActiveHeroes();
    const activeHeroIds = activeHeroes.map(hero => hero.id);
    let availableGameObjs = this.heroCandidates[0].filter(gameObj =>
      activeHeroIds.indexOf(gameObj.id) === -1
    );
    // console.log(JSON.stringify(activeHeroIds));

    // let str = "";
    // for (const gameobj of availableGameObjs) {
    //   str += gameobj.id + ",";
    // }
    // console.log(`>>>>handleHeroSelection>>>>>>>>>>>>>${str}`);
    const availableGameObjs1 = this.heroCandidates[1].filter(gameObj =>
      activeHeroIds.indexOf(gameObj.id) === -1
    );

    // str = "";
    // for (const gameobj of availableGameObjs1) {
    //   str += gameobj.id + ",";
    // }
    // console.log(`>>>>handleHeroSelection>>>>>>>>>>>>>${str}`);

    availableGameObjs = availableGameObjs.concat(availableGameObjs1);

    const selectedGameObjs = this.getRandomGameObjs(availableGameObjs, 3)

    if (selectedGameObjs.length > 0) {
      const choiceEvent: LevelUpChoiceEvent = {
        type: LevelUpType.HERO_SELECTION,
        playerLevel,
        heroGameObjs: selectedGameObjs
      }

      director.emit(game.gameEvent.GAME_SHOW_HERO_CHOICE, choiceEvent)
    }
  }

  /**
   * 处理技能选择（奇数等级）- 现在包含装备选项
   * @param playerLevel 玩家等级
   */
  private handleSkillSelection(playerLevel: number): void {
    const currentStageType: StageType = (GameManager.getInstance()?.stageManager?.stageData?.stageType as StageType) ?? game.myGlobal.stageType;
    if (currentStageType === StageType.Arena) {
      return;
    }
    const allSkillOptions: SkillOption[] = []
    const allEquipmentOptions: SkillOption[] = []
    const activeHeroes = this.herosManager.getActiveHeroes();

    // 【修复】分别收集技能和装备选项，避免重复
    for (const heroGameObj of activeHeroes) {
      const heroId = heroGameObj.id
      const heroName = (heroGameObj as any).name || '未知英雄'

      const heroSkillOptions = this.skillManager.getSkillChoicesForHero(heroId)

      if (heroSkillOptions.length === 0) {
        // 【修改】单独生成技能选项，避免多英雄重复装备
        const heroSkills = this.skillManager.getSkillOptionsOnLevelUp(heroId, 5).filter(option => option.type === OptionType.SKILL)

        heroSkills.forEach((option) => {
          option.gameObj = heroGameObj
          allSkillOptions.push(option)
        })
      } else {
        heroSkillOptions.forEach((option) => {
          if (option.type === OptionType.SKILL) {
            option.gameObj = heroGameObj
            allSkillOptions.push(option)
          }
        })
      }
    }

    // 【修复】装备选项只生成一次，避免重复
    if (activeHeroes.length > 0) {
      const equipmentOptions = this.skillManager.generateRandomEquipmentOptions(1);
      allEquipmentOptions.push(...equipmentOptions);
    }

    // 【修复】动态分配选项数量，确保总数为3个
    const equipmentCount = Math.min(1, allEquipmentOptions.length); // 最多1个装备
    const skillCount = equipmentCount > 0 ? Math.min(2, allSkillOptions.length) : Math.min(3, allSkillOptions.length); // 有装备时2个技能，无装备时3个技能

    console.log(`[GameLevelUpManager] 选项分配: ${skillCount}个技能 + ${equipmentCount}个装备 = ${skillCount + equipmentCount}个总选项`);

    const selectedSkills = this.getRandomSkillOptions(allSkillOptions, skillCount);
    const selectedEquipments = allEquipmentOptions.slice(0, equipmentCount);

    const allSelectedOptions = [...selectedSkills, ...selectedEquipments];

    // 【加强】边界情况检查
    if (allSelectedOptions.length === 0) {
      console.warn('[GameLevelUpManager] 没有可用的技能或装备选项');
      return;
    }

    // 随机打乱最终选项
    const shuffledOptions = allSelectedOptions.sort(() => Math.random() - 0.5);

    if (shuffledOptions.length > 0) {
      // 【调试输出1】弹出选项时输出3个选项数据
      console.log('=== 🎮 技能选择选项弹出 ===');
      shuffledOptions.forEach((option, index) => {
        if (option.type === OptionType.SKILL) {
          console.log(`选项${index + 1} [技能]: ${option.skill?.name} (${option.isNew ? '新技能' : '升级'}) - 英雄: ${option.gameObj?.name || option.heroId}`);
        } else if (option.type === OptionType.EQUIPMENT) {
          console.log(`选项${index + 1} [装备]: ${option.name} (Lv${option.level}) - 稀有度: ${option.rarity} - ID: ${option.equipId}`);
        }
      });
      console.log('===========================');

      const choiceEvent: LevelUpChoiceEvent = {
        type: LevelUpType.SKILL_SELECTION,
        playerLevel,
        skillOptions: shuffledOptions
      }

      director.emit(game.gameEvent.GAME_SHOW_SKILL_CHOICE, choiceEvent)
    }
  }

  /**
   * 随机获取GameObject
   * @param gameObjs GameObject列表
   * @param count 选项数量
   */
  private getRandomGameObjs(gameObjs: GameObject[], count: number): GameObject[] {
    const shuffled = [...gameObjs].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, gameObjs.length))
  }

  /**
   * 随机获取技能选项（去重版本）
   * @param skillOptions 可选技能列表（可能包含装备选项）
   * @param count 选项数量
   */
  private getRandomSkillOptions(
    skillOptions: SkillOption[],
    count: number
  ): SkillOption[] {
    const uniqueSkillsMap = new Map<string, SkillOption>()

    for (const option of skillOptions) {
      // 【修复】只处理技能选项，跳过装备选项
      if (option.type !== OptionType.SKILL || !option.skill || !option.heroId) {
        continue;
      }

      const key = `${option.skill.skill_id}_${option.heroId}_${option.isNew ? 'new' : 'upgrade'}`
      if (!uniqueSkillsMap.has(key)) {
        uniqueSkillsMap.set(key, option)
      }
    }

    const uniqueSkills = Array.from(uniqueSkillsMap.values())
    const shuffled = [...uniqueSkills].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(count, shuffled.length))

    return selected
  }

  /**
   * 玩家选择英雄
   * @param heroGameObj 选择的英雄GameObject
   */
  public selectHero(heroGameObj: GameObject): void {
    const heroInstance = heroGameObj as Heros
    const heroName = heroInstance.name || '未知英雄'

    // 荣誉竞技场模式下，强制上场英雄，不检查是否已激活
    const currentStageType: StageType = (GameManager.getInstance()?.stageManager?.stageData?.stageType as StageType) ?? game.myGlobal.stageType;
    if (currentStageType !== StageType.Arena) {
      const isAlreadyActive = this.herosManager.getActiveHeroes().some(hero => hero.id === heroGameObj.id)
      if (isAlreadyActive) {
        return
      }
    }

    this.skillManager.addHero(
      heroGameObj.id,
      heroGameObj.level,
      heroGameObj.heroStar
    )

    const heroSelectedEvent = {
      heroGameObj: heroGameObj,
      heroId: heroGameObj.id,
      name: heroName
    }

    director.emit(game.gameEvent.GAME_HERO_SELECTED, heroSelectedEvent)
  }

  /**
   * 为敌方英雄直接上场（荣誉竞技场专属）
   * @param heroGameObj 敌方英雄对象
   */
  public selectHeroForEnemy(heroGameObj: GameObject): void {
    const heroInstance = heroGameObj as Heros
    const heroName = heroInstance.name || '未知英雄'

    // 荣誉竞技场模式下，强制上场英雄，不检查是否已激活
    const currentStageType: StageType = (GameManager.getInstance()?.stageManager?.stageData?.stageType as StageType) ?? game.myGlobal.stageType;
    if (currentStageType !== StageType.Arena) {
      const isAlreadyActive = this.herosManager.getActiveHeroes().some(hero => hero.id === heroGameObj.id)
      if (isAlreadyActive) {
        return
      }
    }

    this.skillManager.addHero(
      heroGameObj.id,
      heroGameObj.level,
      heroGameObj.heroStar
    )

    // 为敌方英雄创建选择事件，设置side=1表示敌方
    const heroSelectedEvent = {
      heroGameObj: heroGameObj,
      heroId: heroGameObj.id,
      name: heroName,
      side: 1 // 明确设置为敌方
    }

    director.emit(game.gameEvent.GAME_HERO_SELECTED, heroSelectedEvent)
  }

  /**
   * 玩家选择技能或装备
   * @param skillOption 选择的选项（技能或装备）
   */
  public selectSkill(skillOption: SkillOption): void {
    // 【修复】如果是装备选项，直接调用SkillManager处理
    if (skillOption.type === OptionType.EQUIPMENT) {
      // 【调试输出2】装备前的情况
      console.log('=== ⚔️ 装备选择前状态 ===');
      const userEquipmentData = UserEquipmentData.getInstance();
      const tempEquipsBefore = userEquipmentData.getTemporaryEquipments();
      const chosenEquipsBefore = userEquipmentData.getChosenEquipSlots();
      console.log('临时装备数量:', tempEquipsBefore.length);
      tempEquipsBefore.forEach((equip, index) => {
        const equipInfo = userEquipmentData.getEquipmentFullInfo(equip.equipId);
        const equipName = equipInfo ? equipInfo.config.name : `装备#${equip.equipId}`;
        console.log(`  临时装备${index + 1}: ${equipName} (Lv${equip.level}) - ID: ${equip.equipId}`);
      });
      console.log('天选装备数量:', chosenEquipsBefore.filter(equip => equip !== null).length);
      chosenEquipsBefore.forEach((equip, index) => {
        if (equip) {
          const equipInfo = userEquipmentData.getEquipmentFullInfo(equip.equipId);
          const equipName = equipInfo ? equipInfo.config.name : `装备#${equip.equipId}`;
          console.log(`  天选装备${index + 1}: ${equipName} (Lv${equip.level}) - ID: ${equip.equipId}`);
        } else {
          console.log(`  天选装备${index + 1}: empty`);
        }
      });

      // 执行装备选择
      this.skillManager.selectSkillOption('', skillOption); // heroId对装备选择无意义

      // 【调试输出2】装备后的情况
      console.log('=== ⚔️ 装备选择后状态 ===');
      const tempEquipsAfter = userEquipmentData.getTemporaryEquipments();
      const chosenEquipsAfter = userEquipmentData.getChosenEquipSlots();
      console.log('临时装备数量:', tempEquipsAfter.length);
      tempEquipsAfter.forEach((equip, index) => {
        const equipInfo = userEquipmentData.getEquipmentFullInfo(equip.equipId);
        const equipName = equipInfo ? equipInfo.config.name : `装备#${equip.equipId}`;
        console.log(`  临时装备${index + 1}: ${equipName} (Lv${equip.level}) - ID: ${equip.equipId}`);
      });
      console.log('天选装备数量:', chosenEquipsAfter.filter(equip => equip !== null).length);
      chosenEquipsAfter.forEach((equip, index) => {
        if (equip) {
          const equipInfo = userEquipmentData.getEquipmentFullInfo(equip.equipId);
          const equipName = equipInfo ? equipInfo.config.name : `装备#${equip.equipId}`;
          console.log(`  天选装备${index + 1}: ${equipName} (Lv${equip.level}) - ID: ${equip.equipId}`);
        } else {
          console.log(`  天选装备${index + 1}: empty`);
        }
      });
      console.log('===========================');
      // 深渊模式：每次选择后递进到下一次选择（直到用尽）
      this.triggerNextAbyssChoice();
      return;
    }

    // 处理技能选择
    if (!skillOption.skill || !skillOption.heroId || !skillOption.gameObj) {
      console.error('[GameLevelUpManager] 技能选项缺少必要字段:', skillOption);
      return;
    }

    const { heroId, gameObj, skill, isNew } = skillOption
    const heroInstance = gameObj as Heros
    const heroName = heroInstance.name || '未知英雄'


    const upgradeEvent = this.skillManager.selectSkillOption(heroId, skillOption)

    if (upgradeEvent) {
      this.skillManager.clearPendingSkillChoices(heroId)

      // 技能选择成功后，提升英雄等级
      const currentLevel = this.getHeroLevel(heroId);
      this.skillManager.heroLevelUp(heroId, currentLevel + 1);
      gameObj.level += 1;

      // 【DEBUG】特别检查反甲技能
      if (skill.skill_id === 'thorns_armor') {
        const equippedSkills = this.skillManager.getEquippedSkills(heroId);

        // 检查技能是否正确叠加
        const thornsSkill = equippedSkills.find(s => s.skill_id === 'thorns_armor');
        if (thornsSkill) {
        }

        // 检查英雄面板是否正确应用了技能效果
        const heroPanel = this.findHeroPanelById(heroId);
        if (heroPanel) {
          const finalStats = heroPanel.getFinalStats();
        }
      }

      // 找到对应的英雄面板并重新注册技能效果
      const heroPanel = this.findHeroPanelById(heroId);
      if (heroPanel && heroPanel.buffManager) {

        // 清除旧的技能效果，重新注册
        heroPanel.buffManager.clearSkillBuffs();

        const passiveSkills = this.skillManager.getEquippedSkills(heroId).filter(s => s.type === 'passive');
        for (const passiveSkill of passiveSkills) {
          if (passiveSkill.effects) {
            for (const effect of passiveSkill.effects) {
              if (!effect.is_bullet_modifier) {
                // 根据技能层数重复添加效果
                for (let i = 0; i < passiveSkill.stack; i++) {
                  heroPanel.buffManager.addBuff(effect, heroPanel.hero, true);
                }
              }
            }
          }
        }

        // 再次检查最终属性
        const finalStatsAfter = heroPanel.getFinalStats();
      }

      const skillSelectedEvent = {
        heroGameObj: gameObj,
        heroId,
        heroName,
        skillId: skill.skill_id,
        skillName: skill.name,
        upgradeEvent
      }
      director.emit(game.gameEvent.GAME_SKILL_SELECTED, skillSelectedEvent)
      // 深渊模式：每次选择后递进到下一次选择（直到用尽）
      this.triggerNextAbyssChoice();
    }
  }

  /**
   * 深渊模式连续选择控制：在每次选择后递减计数并继续弹出
   */
  private triggerNextAbyssChoice(): void {
    const globalAny = game.myGlobal as any;
    if (!globalAny) return;
    if (!globalAny.abyssMode) return;
    const count = Number(globalAny.abyssSelectCount || 0);
    if (count <= 0) {
      globalAny.abyssMode = false;
      return;
    }
    // 消耗一次选择机会
    globalAny.abyssSelectCount = count - 1;
    if (globalAny.abyssSelectCount > 0) {
      const playerLevel = Utils.getLevelFromTotalExp(Math.max(0, Number(game.myGlobal.currentExp || 0)));
      // 使用延迟调用确保技能选择面板已经初始化完成
      this.scheduleOnce(() => {
        this.handleSkillSelection(playerLevel);
      }, 0.1); // 延迟0.1秒
    } else {
      globalAny.abyssMode = false;
    }
  }

  /**
   * 获取英雄当前等级
   * @param heroId 英雄ID
   */
  private getHeroLevel(heroId: string): number {
    const heroInfo = this.skillManager.getHeroInfo(heroId)
    return heroInfo ? heroInfo.level : 1
  }

  /**
   * 获取当前上场英雄GameObject列表
   * @deprecated Use HerosManager.getInstance().getActiveHeroes() instead
   */
  public getActiveHeroGameObjs(): GameObject[] {
    return this.herosManager.getActiveHeroes();
  }

  /**
   * 根据英雄ID查找英雄面板
   */
  private findHeroPanelById(heroId: string): HeroPanel | null {
    const heroPanels = this.getAllHeroPanels();
    return heroPanels.find(panel => panel.hero && panel.hero.id === heroId) || null;
  }

  /**
   * 获取所有英雄面板
   */
  private getAllHeroPanels(): HeroPanel[] {
    return this.herosManager.getActiveHeroPanels();
  }

  /**
   * 随机打乱数组（Fisher-Yates洗牌算法）
   * @param array 要打乱的数组
   */
  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

}