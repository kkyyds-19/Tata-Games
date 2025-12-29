/**
 * 商城商品归类类型
 */

export enum ShopCategory {
    COIN = "coin",         // 金币商店
    DIAMOND = "diamond",   // 钻石商店
    ITEM = "item",          // 道具商店
  }

//支付类型
  export enum CostType {
    COIN = "coin",         // 金币
    DIAMOND = "diamond",   // 钻石
    AD = "ad",          // 广告
    CASH = "cash",          // 现金
    HONOR = "honor",        // 荣誉点
  }

/**
 * 支付方式类型
 */
// export type CostType = "diamond" | "coin" | "ad" | "cash";

/**
 * 商城商品定义
 */
export interface ShopItem {
  id: number;                   // 商品唯一ID
  name: string;                 // 商品显示名称
  itemAmount: number;           // 商品数量（金币、钻石、道具等）
  iconFrameName: string;        // 图标资源名
  category: ShopCategory;       // 所属商店分类
  costType: CostType;           // 支付方式：钻石、金币、广告、现金
  costAmount: number;           // 支付金额（单位依 costType）
  maxAdTimes?: number;          // （广告类专用）每日最大观看次数
  itemId?: number;              // 道具ID（仅 item_shop 时有效）
  bonusAmount?: number;           // 赠送的钻石数量（仅钻石商店有效）
  server_id?: number;            // 服务器ID
}


export const coinShopItems: ShopItem[] = [
    {
      id: 101,
      name: "金币",
      itemAmount: 10000,
      iconFrameName: "shop_item_fonts_4",
      costType: CostType.AD,
      costAmount: 0,
      maxAdTimes: 1,
      category: ShopCategory.COIN
    },
    {
      id: 102,
      name: "金币",
      itemAmount: 30000,
      iconFrameName: "shop_item_fonts_5",
      costType: CostType.DIAMOND,
      costAmount: 90,
      category: ShopCategory.COIN
    },
    {
      id: 103,
      name: "金币",
      itemAmount: 100000,
      iconFrameName: "shop_item_fonts_6",
      costType: CostType.DIAMOND,
      costAmount: 288,
      category: ShopCategory.COIN
    },
    {
      id: 104,
      name: "金币",
      itemAmount: 10000,
      iconFrameName: "shop_item_fonts_4",
      costType: CostType.DIAMOND,
      costAmount: 90,
      category: ShopCategory.COIN
    },
    {
      id: 105,
      name: "金币",
      itemAmount: 30000,
      iconFrameName: "shop_item_fonts_5",
      costType: CostType.DIAMOND,
      costAmount: 90,
      category: ShopCategory.COIN
    },
    {
      id: 106,
      name: "金币",
      itemAmount: 100000,
      iconFrameName: "shop_item_fonts_6",
      costType: CostType.DIAMOND,
      costAmount: 288,
      category: ShopCategory.COIN
    },
    {
      id: 107,
      name: "金币",
      itemAmount: 10000,
      iconFrameName: "shop_item_fonts_4",
      costType: CostType.DIAMOND,
      costAmount: 90,
      category: ShopCategory.COIN
    },
    {
      id: 108,
      name: "金币",
      itemAmount: 30000,
      iconFrameName: "shop_item_fonts_5",
      costType: CostType.DIAMOND,
      costAmount: 90,
      category: ShopCategory.COIN
    },
    {
      id: 109,
      name: "金币",
      itemAmount: 100000,
      iconFrameName: "shop_item_fonts_6",
      costType: CostType.DIAMOND,
      costAmount: 288,
      category: ShopCategory.COIN
    },
    {
      id: 110,
      name: "金币",
      itemAmount: 100000,
      iconFrameName: "shop_item_fonts_6",
      costType: CostType.DIAMOND,
      costAmount: 288,
      bonusAmount: 0,
      category: ShopCategory.COIN
    }
  ];



/**
 * 钻石商店商品配置
 */
export const diamondShopItems: ShopItem[] = [
    {
      id: 201,
      name: "钻石",
      itemAmount: 60,
      bonusAmount: 0,
      iconFrameName: "shop_item_fonts_10",
      category: ShopCategory.DIAMOND,
      costType: CostType.CASH,
      costAmount: 6
    },
    {
      id: 202,
      name: "钻石",
      itemAmount: 300,
      bonusAmount: 30,
      iconFrameName: "shop_item_fonts_11",
      category: ShopCategory.DIAMOND,
      costType: CostType.CASH,
      costAmount: 30
    },
    {
      id: 203,
      name: "钻石",
      itemAmount: 680,
      bonusAmount: 100,
      iconFrameName: "shop_item_fonts_12",
      category: ShopCategory.DIAMOND,
      costType: CostType.CASH,
      costAmount: 68
    },
    {
      id: 204,
      name: "钻石",
      itemAmount: 1280,
      bonusAmount: 260,
      iconFrameName: "shop_item_fonts_13",
      category: ShopCategory.DIAMOND,
      costType: CostType.CASH,
      costAmount: 128
    },
    {
      id: 205,
      name: "钻石",
      itemAmount: 1980,
      bonusAmount: 480,
      iconFrameName: "shop_item_fonts_14",
      category: ShopCategory.DIAMOND,
      costType: CostType.CASH,
      costAmount: 198
    },
    {
      id: 206,
      name: "钻石",
      itemAmount: 3280,
      bonusAmount: 880,
      iconFrameName: "shop_item_fonts_13",
      category: ShopCategory.DIAMOND,
      costType: CostType.CASH,
      costAmount: 328
    },
    {
      id: 207,
      name: "钻石",
      itemAmount: 6480,
      bonusAmount: 1680,
      iconFrameName: "shop_item_fonts_10",
      category: ShopCategory.DIAMOND,
      costType: CostType.CASH,
      costAmount: 648
    },
    {
      id: 208,
      name: "钻石",
      itemAmount: 12800,
      bonusAmount: 3200,
      iconFrameName: "shop_item_fonts_14",
      category: ShopCategory.DIAMOND,
      costType: CostType.CASH,
      costAmount: 1280
    },
    {
      id: 209,
      name: "钻石",
      itemAmount: 19800,
      bonusAmount: 5200,
      iconFrameName: "shop_item_fonts_15",
      category: ShopCategory.DIAMOND,
      costType: CostType.CASH,
      costAmount: 1980
    }
  ];






  /**
   * 材料商店商品配置（共 9 项）
   */
  export const itemShopItems: ShopItem[] = [
    {
        id: 301,
        name: "刺客徽章",
        itemAmount: 1,
        iconFrameName: "badge_assassin",
        category: ShopCategory.ITEM,
        costType: CostType.AD,
        costAmount: 0,
        maxAdTimes: 1,
        itemId: 301
    },
    {
      id: 302,
      name: "牧师徽章",
      itemAmount: 1,
      iconFrameName: "badge_priest",
      category: ShopCategory.ITEM,
      costType: CostType.DIAMOND,
      costAmount: 200,
      itemId: 302
    },
    {
      id: 303,
      name: "魔铁矿石",
      itemAmount: 1,
      iconFrameName: "equip_dark_iron",
      category: ShopCategory.ITEM,
      costType: CostType.DIAMOND,
      costAmount: 400,
      itemId: 303
    },
    {
      id: 304,
      name: "训练之书",
      itemAmount: 1,
      iconFrameName: "partner_training_book",
      category: ShopCategory.ITEM,
      costType: CostType.DIAMOND,
      costAmount: 200,
      itemId: 304
    },
    {
      id: 305,
      name: "唤灵宝箱",
      itemAmount: 1,
      iconFrameName: "spirit_orb",
      category: ShopCategory.ITEM,
      costType: CostType.DIAMOND,
      costAmount: 200,
      itemId: 305
    },
    {
      id: 306,
      name: "圣物重铸锤",
      itemAmount: 1,
      iconFrameName: "relic_recast_hammer",
      category: ShopCategory.ITEM,
      costType: CostType.DIAMOND,
      costAmount: 300,
      itemId: 306
    },
    {
      id: 307,
      name: "目标圣物药水",
      itemAmount: 1,
      iconFrameName: "relic_targeted_potion",
      category: ShopCategory.ITEM,
      costType: CostType.DIAMOND,
      costAmount: 300,
      itemId: 307
    },
    {
      id: 308,
      name: "重生十字章",
      itemAmount: 1,
      iconFrameName: "rebirth_crucifix",
      category: ShopCategory.ITEM,
      costType: CostType.DIAMOND,
      costAmount: 300,
      itemId: 308
    },
    {
      id: 309,
      name: "皮肤精华",
      itemAmount: 1,
      iconFrameName: "skin_essence",
      category: ShopCategory.ITEM,
      costType: CostType.DIAMOND,
      costAmount: 300,
      itemId: 309
    },
     {
      id: 310,
      name: "猎人徽章",
      itemAmount: 1,
      iconFrameName: "badge_hunter",
      category: ShopCategory.ITEM,
      costType: CostType.HONOR, // 改为荣誉点购买
      costAmount: 100,
      itemId: 310
    },
    
  ];
  