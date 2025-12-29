export interface IdleRewardData {
    duration: number; // 实际挂机时间（秒）
    stageName: string; // 如：“第2关”
    monsterName: string; // 如：“闪金燕燕”
    drops: {             //扫荡奖励，掉落物品 和挂机奖励分开
      itemId: number;   // 用于映射资源与名称
      amount: number;   // 掉落数量
    }[];
    rewardPerHour: {     //挂机奖励，每小时奖励
      exp: number;  // 每小时经验值
      coin: number; // 每小时金币
    };
  }
  
/**
 * 查表用的每小时奖励配置
 */
export interface StageRewardConfig {
  stage: number;      // 关卡
  rewardPerHour: {
    exp: number;      // 每小时经验
    coin: number;     // 每小时金币
    drops: {
      itemId: number; // 掉落物品ID
      amount: number; // 每小时掉落数量
    }[];
  };
}
  
// 1-30关的挂机奖励数据表
export const stageRewardTable: StageRewardConfig[] = [
    { stage: 1, rewardPerHour: { exp: 100, coin: 50, drops: [{ itemId: 513, amount: 5 }] } },
    { stage: 2, rewardPerHour: { exp: 120, coin: 60, drops: [{ itemId: 513, amount: 6 }] } },
    { stage: 3, rewardPerHour: { exp: 140, coin: 70, drops: [{ itemId: 513, amount: 7 }] } },
    { stage: 4, rewardPerHour: { exp: 160, coin: 80, drops: [{ itemId: 513, amount: 8 }, { itemId: 514, amount: 1 }] } },
    { stage: 5, rewardPerHour: { exp: 180, coin: 90, drops: [{ itemId: 513, amount: 9 }, { itemId: 514, amount: 1 }] } },
    { stage: 6, rewardPerHour: { exp: 200, coin: 100, drops: [{ itemId: 513, amount: 10 }, { itemId: 514, amount: 2 }] } },
    { stage: 7, rewardPerHour: { exp: 220, coin: 110, drops: [{ itemId: 513, amount: 11 }, { itemId: 514, amount: 2 }, { itemId: 509, amount: 1 }] } },
    { stage: 8, rewardPerHour: { exp: 240, coin: 120, drops: [{ itemId: 513, amount: 12 }, { itemId: 514, amount: 3 }, { itemId: 509, amount: 1 }] } },
    { stage: 9, rewardPerHour: { exp: 260, coin: 130, drops: [{ itemId: 513, amount: 13 }, { itemId: 514, amount: 3 }, { itemId: 509, amount: 1 }] } },
    { stage: 10, rewardPerHour: { exp: 280, coin: 140, drops: [{ itemId: 513, amount: 14 }, { itemId: 514, amount: 4 }, { itemId: 509, amount: 2 }] } },
    { stage: 11, rewardPerHour: { exp: 300, coin: 150, drops: [{ itemId: 513, amount: 15 }, { itemId: 514, amount: 4 }, { itemId: 509, amount: 2 }] } },
    { stage: 12, rewardPerHour: { exp: 320, coin: 160, drops: [{ itemId: 513, amount: 16 }, { itemId: 514, amount: 5 }, { itemId: 509, amount: 2 }] } },
    { stage: 13, rewardPerHour: { exp: 340, coin: 170, drops: [{ itemId: 513, amount: 17 }, { itemId: 514, amount: 5 }, { itemId: 510, amount: 1 }] } },
    { stage: 14, rewardPerHour: { exp: 360, coin: 180, drops: [{ itemId: 513, amount: 18 }, { itemId: 514, amount: 6 }, { itemId: 510, amount: 1 }] } },
    { stage: 15, rewardPerHour: { exp: 380, coin: 190, drops: [{ itemId: 513, amount: 19 }, { itemId: 514, amount: 6 }, { itemId: 510, amount: 1 }] } },
    { stage: 16, rewardPerHour: { exp: 400, coin: 200, drops: [{ itemId: 513, amount: 20 }, { itemId: 514, amount: 7 }, { itemId: 510, amount: 2 }] } },
    { stage: 17, rewardPerHour: { exp: 420, coin: 210, drops: [{ itemId: 513, amount: 21 }, { itemId: 514, amount: 7 }, { itemId: 510, amount: 2 }] } },
    { stage: 18, rewardPerHour: { exp: 440, coin: 220, drops: [{ itemId: 513, amount: 22 }, { itemId: 514, amount: 8 }, { itemId: 510, amount: 2 }] } },
    { stage: 19, rewardPerHour: { exp: 460, coin: 230, drops: [{ itemId: 513, amount: 23 }, { itemId: 514, amount: 8 }, { itemId: 511, amount: 1 }] } },
    { stage: 20, rewardPerHour: { exp: 480, coin: 240, drops: [{ itemId: 513, amount: 24 }, { itemId: 514, amount: 9 }, { itemId: 511, amount: 1 }] } },
    { stage: 21, rewardPerHour: { exp: 500, coin: 250, drops: [{ itemId: 513, amount: 25 }, { itemId: 514, amount: 9 }, { itemId: 511, amount: 1 }] } },
    { stage: 22, rewardPerHour: { exp: 520, coin: 260, drops: [{ itemId: 513, amount: 26 }, { itemId: 514, amount: 10 }, { itemId: 511, amount: 2 }] } },
    { stage: 23, rewardPerHour: { exp: 540, coin: 270, drops: [{ itemId: 513, amount: 27 }, { itemId: 514, amount: 10 }, { itemId: 511, amount: 2 }] } },
    { stage: 24, rewardPerHour: { exp: 560, coin: 280, drops: [{ itemId: 513, amount: 28 }, { itemId: 514, amount: 11 }, { itemId: 511, amount: 2 }] } },
    { stage: 25, rewardPerHour: { exp: 580, coin: 290, drops: [{ itemId: 513, amount: 29 }, { itemId: 514, amount: 11 }, { itemId: 522, amount: 1 }] } },
    { stage: 26, rewardPerHour: { exp: 600, coin: 300, drops: [{ itemId: 513, amount: 30 }, { itemId: 514, amount: 12 }, { itemId: 522, amount: 1 }] } },
    { stage: 27, rewardPerHour: { exp: 620, coin: 310, drops: [{ itemId: 513, amount: 31 }, { itemId: 514, amount: 12 }, { itemId: 522, amount: 1 }] } },
    { stage: 28, rewardPerHour: { exp: 640, coin: 320, drops: [{ itemId: 513, amount: 32 }, { itemId: 514, amount: 13 }, { itemId: 522, amount: 2 }] } },
    { stage: 29, rewardPerHour: { exp: 660, coin: 330, drops: [{ itemId: 513, amount: 33 }, { itemId: 514, amount: 13 }, { itemId: 522, amount: 2 }] } },
    { stage: 30, rewardPerHour: { exp: 680, coin: 340, drops: [{ itemId: 513, amount: 34 }, { itemId: 514, amount: 14 }, { itemId: 522, amount: 2 }] } }
];


