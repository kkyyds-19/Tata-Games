import { Size, Enum } from 'cc';
import { StageType } from '../game/stage/StageData';
import { director } from 'cc';
import { game } from 'cc';

export class GlobalVariable {
  public static readonly bundleRes = "resources";
  public static readonly bundleCfg = "cfg";

  public designSize: Size = new Size(1170, 2532)
  public gamePause: boolean = false
  public gameOver: boolean = false

  //游戏机会
  public gameCount = 0
  //音乐
  public gameMusic: boolean = true
  //音效
  public gameSound: boolean = true
  //自动选择技能
  public autoSelectSkill: boolean = false

  /**当前选中的世界 */
  public currentWorld: number = 1;//2

  //当前关卡（从0开始计数，统计所有关卡）
  public currentStage: number = 1

  //已下载的远程资源url
  public downloadedAssets: Set<string> = new Set();

  //当前关卡（从0开始计数，统计所有关卡）
  public maxStage: number = 1
  // public maxStage: number = 30
  public currentExp: number = 0

  //关卡难度 0 普通 1 精英
  public stageDifficulty: number = 0

  //关卡类型 0普通 1地下城 2 竞技场 3 无尽
  public stageType: StageType = StageType.Normal;

  //竞技场对手用户ID
  public arenaOpponentUserId: number | null = null;


  public gameInited: number = 0;
  public gameInitOne() {
    ++this.gameInited;
    console.log(`gameInitOne:${this.gameInited}`);
    if (this.gameInited >= 4) director.emit(game.gameEvent.GAME_START);
  }

  reSet() {
    this.gamePause = false
    this.gameOver = false
    //游戏机会
    this.gameCount = 0

  }



}