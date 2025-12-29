import { GameConfig } from "./script/global/config/GameConfig";
import { GameEvent } from "./script/global/event/GameEvent";
import { GlobalVariable } from "./script/global/GlobalVariable";
import { Language } from "./script/language/Language";
import { Utils } from "./script/utils/Utils";

declare module 'cc' {
    interface Game {
      myGlobal: GlobalVariable
      gameConfig:GameConfig
      gameEvent:GameEvent
      language: Language
      myUitils:Utils
    }
}