import { game ,native} from 'cc';
import { GlobalVariable } from './GlobalVariable';
import { GameConfig } from './config/GameConfig'; 
import { GameEvent } from './event/GameEvent';
import { Language } from '../language/Language';
import { Utils } from '../utils/Utils'
import { UserInfoData } from '../user/UserInfoData';
import { MusicManager } from '../music/MusicManager';
import { UserIdleRewardData } from '../user/UserIdleRewardData';
import { HttpClient } from '../http/HttpClient';
import { NetworkConfig } from './config/NetworkConfig';
import { RewardedVideoAdManager } from '../wx/RewardedVideoAdManager';
import { SmartLoginManager } from '../welcome/SmartLoginManager';
import { VersionManager } from './VersionManager';
import { ChatService } from '../chat/ChatService';

export class GameEntry {
    private static hasStarted: boolean = false;

    public static initGame(){
      HttpClient.getInstance().int();

      game.myGlobal.reSet()
      
      // 只初始化基础数据，不触发游戏数据初始化
      UserInfoData.getInstance().syncToGlobalVariable()
      
      //挂机奖励
      //NOTE 暂时不领
      // UserIdleRewardData.getInstance().getServerData()

      //登录管理器初始化（但不立即开始登录）
      SmartLoginManager.getInstance();

      // 初始化本地关卡配置数据
      // VersionManager.getInstance().initializeStageConfigFromLocal();
    }
    
    public static entryGame(): void {
      if (!GameEntry.hasStarted) {
        // 在这里执行游戏开始时只需要运行一次的逻辑 
        GameEntry.hasStarted = true
        
        game.myGlobal= new GlobalVariable()
        game.gameConfig = new GameConfig()
        game.gameEvent =new GameEvent()
        game.language = new Language()
        game.myUitils = new Utils()

        // 初始化音乐管理器（永驻节点）
        MusicManager.initializeMusicManager();
        RewardedVideoAdManager.getInstance().init({
          adUnitId: '1234567890',
          maxAdCount: 10,
          simulationDuration: 10,
          simulationPrefabPath: 'prefab/dialog/simulation_ad_video'
        });
        console.log('GameEntry: 音乐管理器初始化完成');

        this.initGame()
      }
    }
}
