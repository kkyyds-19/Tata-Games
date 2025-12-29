/**
 * API配置文件索引
 * 
 * 本文件用于合并所有模块化的API配置，实现MD文档与TS配置文件的一一对应
 * 
 * 对应关系说明：
 * 
 * 1. 用户相关  
 *    - MD文件: 玩家.md
 *    - TS文件: user.ts
 *    - 包含: 登录、注册、用户信息、首页信息等
 * 
 * 2. 邮箱相关
 *    - MD文件: 玩家邮箱.md
 *    - TS文件: email.ts
 *    - 包含: 邮件列表、领取奖励、删除邮件等
 * 
 * 3. 英雄宝箱相关
 *    - MD文件: 英雄宝箱.md
 *    - TS文件: heroBox.ts
 *    - 包含: 宝箱信息、抽奖、英雄列表等
 * 
 * 4. 商店相关
 *    - MD文件: 玩家商店.md
 *    - TS文件: store.ts
 *    - 包含: 商店信息、购买物品等
 * 
 * 5. 伙伴相关
 *    - MD文件: 玩家伙伴.md
 *    - TS文件: partner.ts
 *    - 包含: 伙伴列表、伙伴详情、添加伙伴等
 * 
 * 6. 怪物图鉴相关
 *    - MD文件: 玩家怪物图鉴.md
 *    - TS文件: monster.ts
 *    - 包含: 怪物列表、添加怪物、领取奖励等
 * 
 * 7. 任务相关
 *    - MD文件: 每日任务.md
 *    - TS文件: task.ts
 *    - 包含: 任务信息、执行任务、领取奖励等
 * 
 * 8. 背包相关
 *    - MD文件: 玩家背包.md
 *    - TS文件: backpack.ts
 *    - 包含: 背包列表、添加物品、使用物品、删除物品等
 * 
 * 9. 我的英雄相关
 *    - MD文件: 我的英雄.md
 *    - TS文件: myHero.ts
 *    - 包含: 英雄列表、突破、重生、详细信息等
 * 
 * 10. 体力购买相关
 *     - MD文件: 体力购买.md
 *     - TS文件: stamina.ts
 *     - 包含: 购买信息、体力购买等
 * 
 * 11. 排名相关
 *     - MD文件: 玩家排名.md
 *     - TS文件: ranking.ts
 *     - 包含: 章节排名、战力排名等
 * 
 * 12. 挂机收益相关
 *     - MD文件: 挂机收益.md
 *     - TS文件: idleReward.ts
 *     - 包含: 领取奖励、扫荡奖励、查看数据等
 * 
 * 13. 哨塔建造厂相关
 *     - MD文件: 玩家哨塔建造厂.md
 *     - TS文件: towerFactory.ts
 *     - 包含: 建造厂列表、添加建造记录等
 * 
 * 14. 哨塔相关
 *     - MD文件: 玩家哨塔.md
 *     - TS文件: tower.ts
 *     - 包含: 哨塔列表、哨塔详情、添加哨塔等
 * 
 * 15. 圣物相关
 *     - MD文件: 玩家圣物.md
 *     - TS文件: relic.ts
 *     - 包含: 圣物列表、召唤、合成、属性统计等
 * 
 * 16. 装备相关
 *     - MD文件: 我的装备.md
 *     - TS文件: equipment.ts
 *     - 包含: 仅数据模型，无API接口
 * 
 * 17. 圣物副词条相关
 *     - MD文件: 玩家圣物副词条.md
 *     - TS文件: relicSubAttr.ts
 *     - 包含: 副词条列表、标记、取消标记等
 * 
 * 18. 圣物套装相关
 *     - MD文件: 玩家圣物套装.md
 *     - TS文件: relicSet.ts
 *     - 包含: 套装列表、标记、取消标记等
 * 
 * 19. 伙伴任务相关
 *     - MD文件: 玩家伙伴任务.md
 *     - TS文件: partnerTask.ts
 *     - 包含: 任务列表、添加任务、领取奖励等
 * 
 * 20. 通关奖励相关
 *     - MD文件: 通关奖励.md
 *     - TS文件: clearReward.ts
 *     - 包含: 奖励列表、领取奖励、未满星关卡等
 * 
 * 21. 关卡奖励相关
 *     - MD文件: 玩家关卡奖励.md
 *     - TS文件: stageReward.ts
 *     - 包含: 关卡列表、关卡详情、领取奖励等
 * 
 * 检查状态: ✅ 所有21个MD文件与21个TS配置文件已完成一一对应检查
 * 修复记录: 
 * - 删除了重复的auth.ts文件，认证功能统一在user.ts中
 * - partnerTask.ts: 添加了缺少的领取奖励接口
 * - relic.ts: 移除了多余的装备相关接口，添加了召唤、合成等接口
 * - store.ts: 移除了体力相关接口，修正了接口描述
 * - myHero.ts: 移除了多余的接口，添加了突破、重生等接口
 */

import { APIConfig } from '../APIConfig';
import { userConfigs } from './user';
import { emailConfigs } from './email';
import { heroBoxConfigs } from './heroBox';
import { storeConfigs } from './store';
import { partnerConfigs } from './partner';
import { monsterConfigs } from './monster';
import { taskConfigs } from './task';
import { backpackConfigs } from './backpack';
import { myHeroConfigs } from './myHero';
import { staminaConfigs } from './stamina';
import { rankingConfigs } from './ranking';
import { idleRewardConfigs } from './idleReward';
import { towerFactoryConfigs } from './towerFactory';
import { towerConfigs } from './tower';
import { relicConfigs } from './relic';
import { equipmentConfigs } from './equipment';
import { relicSubAttrConfigs } from './relicSubAttr';
import { relicSetConfigs } from './relicSet';
import { partnerTaskConfigs } from './partnerTask';
import { clearRewardConfigs } from './clearReward';
import { stageRewardConfigs } from './stageReward';
import { arenaConfigs } from './arena';

/**
 * 合并所有API配置
 */
export const APIConfigs: Record<string, APIConfig> = {
    ...userConfigs,
    ...emailConfigs,
    ...heroBoxConfigs,
    ...storeConfigs,
    ...partnerConfigs,
    ...monsterConfigs,
    ...taskConfigs,
    ...backpackConfigs,
    ...myHeroConfigs,
    ...staminaConfigs,
    ...rankingConfigs,
    ...idleRewardConfigs,
    ...towerFactoryConfigs,
    ...towerConfigs,
    ...relicConfigs,
    ...equipmentConfigs,
    ...relicSubAttrConfigs,
    ...relicSetConfigs,
    ...partnerTaskConfigs,
    ...clearRewardConfigs,
    ...stageRewardConfigs,
    ...arenaConfigs
};

// 导出各个模块的配置，方便单独使用
export {
    userConfigs,
    emailConfigs,
    heroBoxConfigs,
    storeConfigs,
    partnerConfigs,
    monsterConfigs,
    taskConfigs,
    backpackConfigs,
    myHeroConfigs,
    staminaConfigs,
    rankingConfigs,
    idleRewardConfigs,
    towerFactoryConfigs,
    towerConfigs,
    relicConfigs,
    equipmentConfigs,
    relicSubAttrConfigs,
    relicSetConfigs,
    partnerTaskConfigs,
    clearRewardConfigs,
    stageRewardConfigs,
    arenaConfigs
};