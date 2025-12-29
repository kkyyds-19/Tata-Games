import { Color } from 'cc';

// 自动生成的道具配置表(ID 从 500 开始)
export interface GameItemConfig {
  id: number; //客户端显示 物品 id
  name: string;  // 客户端物品名称
  iconFrameName: string; // 客户端物品图标
  server_id?: number; // 服务器物品 id
  materialKey?: string; // 服务器物品 key 
  //底色配色方案 - 直接填写颜色值
  colorScheme?: string;
}


export const gameItemConfigs: GameItemConfig[] = [
  // 徽章类
  { id: 500, name: "刺客徽章", server_id: 7, iconFrameName: "badge_assassin", materialKey: "badge_assassin", 
    colorScheme: "#FF4747" }, // 红色 #FF4747
  { id: 501, name: "法师徽章", server_id: 8, iconFrameName: "badge_mage", materialKey: "badge_mage", 
    colorScheme: "#A878E6" }, // 淡紫色 #A878E6
  { id: 502, name: "猎人徽章", server_id: 9, iconFrameName: "badge_hunter", materialKey: "badge_hunter", 
    colorScheme: "#73E98A" }, // 森林绿 #73E98A
  { id: 503, name: "牧师徽章", server_id: 10, iconFrameName: "badge_priest", materialKey: "badge_priest", 
    colorScheme: "#FFEC77" }, // 金黄色 #FFEC77
  { id: 504, name: "坦克徽章", server_id: 3, iconFrameName: "badge_tank", materialKey: "badge_tank", 
    colorScheme: "#6EC7FF" }, // 浅蓝色 #6EC7FF
  { id: 505, name: "随机徽章", server_id: 27, iconFrameName: "badge_random", materialKey: "badge_random", 
    colorScheme: "#73E98A" }, // 浅绿色 #73E98A

  // 货币类
  { id: 506, name: "钻石", server_id: 1, iconFrameName: "currency_diamond", materialKey: "currency_diamond", 
    colorScheme: "#A878E6" }, // 紫色  #A878E6
  { id: 507, name: "体力", server_id: 2, iconFrameName: "energy", materialKey: "energy", 
    colorScheme: "#87CEEB" }, // 浅蓝色 #87CEEB
  { id: 508, name: "金币", server_id: 3, iconFrameName: "currency_gold", materialKey: "currency_gold", 
    colorScheme: "#9370DB" }, // 紫色 #9370DB

  // 道具类
  { id: 509, name: "通行证活跃积分", server_id: 4, iconFrameName: "active_points_1", materialKey: "active_points_1", 
    colorScheme: "#A878E6" }, // 紫色 #A878E6
  { id: 510, name: "训练之书", server_id: 6, iconFrameName: "partner_training_book", materialKey: "partner_training_book", 
    colorScheme: "#73E98A" }, // 深绿色 #73E98A
  { id: 511, name: "皮肤精华", server_id: 7, iconFrameName: "skin_essence", materialKey: "skin_essence", 
    colorScheme: "#73E98A" }, // 深绿色 #73E98A
  { id: 512, name: "唤灵宝珠", server_id: 8, iconFrameName: "partner_summon_orb", materialKey: "partner_summon_orb", 
    colorScheme: "#A878E6" }, // 紫色 #A878E6
  { id: 513, name: "经验值", server_id: 9, iconFrameName: "exp", materialKey: "exp", 
    colorScheme: "#FF4747" }, // 红色 #FF4747
  { id: 514, name: "魔铁矿石", server_id: 10, iconFrameName: "equip_dark_iron", materialKey: "equip_dark_iron", 
    colorScheme: "#FF4747" }, // 红色 #FF4747
  { id: 515, name: "大地之种", server_id: 11, iconFrameName: "earth_seed", materialKey: "earth_seed", 
    colorScheme: "#73E98A" }, // 深绿色 #73E98A

  // 特殊物品类
  { id: 516, name: "英雄通行证活跃积分", server_id: 12, iconFrameName: "active_points_2", materialKey: "active_points_2", 
    colorScheme: "#FFEC77" }, // 紫色 #FFEC77
  { id: 517, name: "重铸锤", server_id: 13, iconFrameName: "relic_recast_hammer", materialKey: "relic_recast_hammer", 
    colorScheme: "#FFEC77" }, // 黄色 #FFEC77
  { id: 518, name: "皮肤礼券", server_id: 15, iconFrameName: "skin_ticket", materialKey: "skin_ticket", 
    colorScheme: "#FF4747" }, // 红色 #FF4747
  { id: 519, name: "定向召唤圣水", server_id: 16, iconFrameName: "relic_targeted_potion", materialKey: "relic_targeted_potion", 
    colorScheme: "#FFEC77" }, // 黄色 #FFEC77
  { id: 520, name: "重生十字章", server_id: 17, iconFrameName: "rebirth_crucifix", materialKey: "rebirth_crucifix", 
    colorScheme: "#A878E6" }, // 紫色 #A878E6

  // 钥匙类 - 只有四种
  { id: 521, name: "普通钥匙", server_id: 18, iconFrameName: "key_common", materialKey: "key_common", 
    colorScheme: "#A878E6" }, // 浅褐色 #A878E6
  { id: 522, name: "稀有钥匙", server_id: 19, iconFrameName: "key_rare", materialKey: "key_rare", 
    colorScheme: "#FFEC77" }, // 紫色 #FFEC77
  { id: 523, name: "传说", server_id: 20, iconFrameName: "key_legendary", materialKey: "key_legendary", 
    colorScheme: "#73E98A" }, // 橙色 #73E98A
  { id: 524, name: "神话", server_id: 21, iconFrameName: "key_mythic", materialKey: "key_mythic", 
    colorScheme: "#6EC7FF" }, // 红色 #6EC7FF



  // 圣物类 - 目前只有一个随机 底色不一样我bu
  { id: 525, name: "随机稀有圣物", server_id: 23, iconFrameName: "relic_0_2", materialKey: "random_relic", 
    colorScheme: "#FFEC77" }, // 蓝色 #FFEC77
  { id: 526, name: "随机传说圣物", server_id: 24, iconFrameName: "relic_0_2", materialKey: "random_relic", 
    colorScheme: "#A878E6" }, // 橙色 #A878E6
];
