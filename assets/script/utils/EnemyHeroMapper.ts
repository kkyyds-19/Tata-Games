import { ResourceConfig } from "../global/config/ResourceConfig";
import { MyHeroInfo } from "../api/APITypes";
import { CardData } from "../user/UserArmyData";

/**
 * 敌方英雄（MyHeroInfo）映射为本地 CardData，便于和自己的数据结构统一使用
 * 解析规则与 UserArmyData.convertServerHeroToCardData 保持一致
 */
export function mapMyHeroInfoToCardData(info: MyHeroInfo): CardData | null {
  try {
    if (!info?.key) {
      console.warn(`EnemyHeroMapper: 英雄数据缺少 key 字段 (ID: ${info?.id})`);
      return null;
    }

    // 解析英雄key: [角色类型]_[职业]_[品质]_[资源ID]
    const keyParts = info.key.split('_');
    if (keyParts.length < 4) {
      console.warn(`EnemyHeroMapper: 无效的英雄key格式: ${info.key} (ID: ${info.id})`);
      return null;
    }

    const roleType = keyParts[0];           // 角色类型 (h)
    const classNum = parseInt(keyParts[1]); // 职业 (0-4)
    const quality = parseInt(keyParts[2]);  // 品质 (0-24)
    const resourceId = keyParts[3];         // 资源ID

    if (!Number.isFinite(classNum) || !Number.isFinite(quality)) {
      console.warn(`EnemyHeroMapper: 无法解析职业或品质数值 (key: ${info.key}, ID: ${info.id})`);
      return null;
    }

    // 构建基础0品质的资源key，用于在资源表中查找静态配置
    const baseKey = `${roleType}_${classNum}_0_${resourceId}`;
    const heroConfig = ResourceConfig.heros_list.find(hero => hero.iconFrameName === baseKey);
    if (!heroConfig) {
      console.warn(`EnemyHeroMapper: 在ResourceConfig中找不到英雄配置: ${baseKey} (ID: ${info.id})`);
      return null;
    }

    // s阶等级规则（与本地一致）
    let sLevel = 0;
    if (baseKey === 'h_4_0_1') {
      sLevel = 3;
    } else if (baseKey === 'h_3_0_3') {
      sLevel = 2;
    }

    const cardData: CardData = {
      cardId: String(info.id),
      name: heroConfig.name,
      heroId: heroConfig.id,        // 注意：本地 heroId 为字符串（资源ID）
      class: classNum,
      quality: quality,             // 直接使用解析到的品质值
      attackType: getAttackTypeByClass(classNum),
      sLevel: sLevel,
      key: info.key,
      serverHeroId: typeof info.heroId === 'number' ? info.heroId : Number(info.heroId)
    };

    return cardData;
  } catch (e) {
    console.error(`EnemyHeroMapper: 转换失败 (ID: ${info?.id}):`, e);
    return null;
  }
}

/**
 * 批量映射敌方 MyHeroInfo 列表为 CardData 列表
 */
export function mapEnemyListToCardData(list: MyHeroInfo[]): CardData[] {
  const out: CardData[] = [];
  for (const info of (list || [])) {
    const cd = mapMyHeroInfoToCardData(info);
    if (cd) out.push(cd);
  }
  return out;
}

/**
 * 根据职业推断攻击类型 (0-物理，1-水，2-火，3-电，4-风)
 */
function getAttackTypeByClass(classNum: number): number {
  const attackTypeMap: Record<number, number> = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 };
  return attackTypeMap[classNum] ?? 0;
}