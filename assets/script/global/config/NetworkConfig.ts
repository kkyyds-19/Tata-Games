import { WECHAT } from 'cc/env';
/**
 * 网络配置类，用于统一管理游戏中的所有网络请求地址。
 */
export class NetworkConfig {

    //正式环境
    // public static readonly STAGE_DATA_BASE_URL = "https://xyx.qyy666.com/front_stage/stage";
    
    // public static readonly ASSETS_VERSIONS_URL = "https://xyx.qyy666.com/front_stage/assets_versions.json";
 
    // public static readonly API_URL = WECHAT ? "https://xyx.qyy666.com/prod-api" :  "http://47.122.124.81:8087/prod-api";
   
    //测试环境
    public static readonly STAGE_DATA_BASE_URL = "https://xyx.qyy666.com/front_stage/stage";
    
    public static readonly ASSETS_VERSIONS_URL = "https://xyx.qyy666.com/front_stage/assets_versions.json";
 
    public static readonly API_URL = WECHAT ? "https://xyx.qyy666.com/prod-api" :  "http://47.122.124.81:8087/prod-api";
    //public static readonly API_URL = WECHAT ? "https://xyx.qyy666.com/prod-api" :  "http://192.168.8.101:8086";
 
    public static readonly CHAT_WS_PATH = "/ws/chat";
    public static readonly CHAT_WS_URL = WECHAT ? "wss://xyx.qyy666.com/ws/chat" : "ws://47.122.124.81:8086/ws/chat";
   
} 
