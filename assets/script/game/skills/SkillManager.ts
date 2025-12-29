import { BaseSkill } from './BaseSkill'
import { GameObject } from '../object/GameObject'
import { TANKER_SKILL_CONFIGS } from './skilldata/TankerSkillConfig'
import { HEALER_SKILL_CONFIGS } from './skilldata/HealerSkillConfig'
import { MAGE_SKILL_CONFIGS } from './skilldata/MageSkillConfig'
import { ASSASSIN_SKILL_CONFIGS } from './skilldata/AssassinSkillConfig'
import { ARCHER_SKILL_CONFIGS } from './skilldata/ArcherSkillConfig'
//新
import { POTIONER_SKILL_CONFIGS } from './skilldata/PotionerSkillConfig'
import { ICE_MAGE_SKILL_CONFIGS } from './skilldata/IceMageSkillConfig'
import { FOOTMAN_SKILL_CONFIGS } from './skilldata/FootManSkillConfig'
import { FOREST_ASSASSIN_SKILL_CONFIGS } from './skilldata/ForestAssassin'

import { SkillConfigData } from '../types';
import { equipmentConfigs } from '../../global/config/EquipmentConfig';
import { UserEquipmentData } from '../../user/UserEquipmentData';
import { TemporaryEquipmentBonusManager } from '../TemporaryEquipmentBonusManager';
import { FOREST_SAGE_SKILL_CONFIGS } from './skilldata/ForestSageSkillConfigs'
import { DRBOOM_SKILL_CONFIGS } from './skilldata/DrBoomSkillConfig'
import { AEGWYNN_SKILL_CONFIGS } from './skilldata/AegwynnSkillConfig'

/**
 * 选择选项类型枚举
 */
export enum OptionType {
  SKILL = 'skill',
  EQUIPMENT = 'equipment'
}

/**
 * 技能选择选项接口（支持技能和装备）
 */
export interface SkillOption {
  type: OptionType        // 选项类型：技能或装备
  
  // 技能相关字段
  skill?: BaseSkill       // 技能对象（当type为SKILL时）
  isNew?: boolean         // 是否为新技能（当type为SKILL时）
  heroId?: string         // 英雄ID（当type为SKILL时）
  gameObj?: GameObject    // 英雄游戏对象（当type为SKILL时）
  
  // 装备相关字段
  equipId?: number        // 装备ID（当type为EQUIPMENT时）
  name?: string           // 装备名称（当type为EQUIPMENT时）
  description?: string    // 装备描述（当type为EQUIPMENT时）
  level?: number          // 装备等级（当type为EQUIPMENT时）
  rarity?: string         // 装备稀有度（当type为EQUIPMENT时）
  iconFrameName?: string  // 图标资源名（当type为EQUIPMENT时）
}

/**
 * 临时装备选择选项接口（保留作为创建SkillOption的辅助）
 */
export interface EquipmentOption {
  equipId: number         // 装备ID
  name: string            // 装备名称
  description: string     // 装备描述
  level: number           // 装备等级
  rarity: string          // 装备稀有度
  iconFrameName: string   // 图标资源名
}

/**
 * 技能升级/叠加事件接口
 */
export interface SkillChangeEvent {
  heroId: string          // 英雄ID
  skillId: string         // 技能ID
  oldStack: number        // 旧的叠加层数
  newStack: number        // 新的叠加层数
  isNewSkill: boolean     // 是否为新技能
}

/**
 * 英雄信息接口
 */
export interface HeroInfo {
  heroId: string           // 英雄ID
  level: number            // 英雄等级
  star: number             // 英雄星级
  teamHeroIds?: string[]   // 队伍中的其他英雄ID
}

/**
 * 英雄技能数据接口
 */
export interface HeroSkillData {
  heroId: string                           // 英雄ID
  equippedSkills: Map<string, BaseSkill>   // 已装备的技能
  lastLevelUpLevel: number                 // 上次升级时的等级（避免重复升级）
}

/**
 * 🎮 统一技能管理器
 * 整合技能数据管理和游戏流程控制
 */
export class SkillManager {
  private static instance: SkillManager
  
  // === 数据存储 ===
  private heroIdSkillConfigs: Map<string, SkillConfigData[]> = new Map()
  private heroSkillData: Map<string, HeroSkillData> = new Map()
  private heroInfos: Map<string, HeroInfo> = new Map()
  
  // === 游戏状态 ===
  private pendingSkillChoices: Map<string, SkillOption[]> = new Map()

  /**
   * 单例模式
   */
  public static getInstance(): SkillManager {
    if (!SkillManager.instance) {
      SkillManager.instance = new SkillManager()
      SkillManager.instance.initializeSkillConfigs()
    }
    return SkillManager.instance
  }

  private constructor() {}

  /**
   * 初始化所有英雄类型的技能配置
   */
  private initializeSkillConfigs(): void {
    // 使用英雄ID直接注册技能配置（一一对应）
    this.registerHeroIdSkillConfigs('1000', TANKER_SKILL_CONFIGS)       // 石头人(坦克)
    this.registerHeroIdSkillConfigs('1001', HEALER_SKILL_CONFIGS)       // 知识古树(治疗)
    this.registerHeroIdSkillConfigs('1002', ARCHER_SKILL_CONFIGS)       // 亡灵射手(暗黑游侠)
    this.registerHeroIdSkillConfigs('1003', MAGE_SKILL_CONFIGS)         // 火元素(法师)
    this.registerHeroIdSkillConfigs('1004', ASSASSIN_SKILL_CONFIGS)     // 暗影刺客(刺客)

    this.registerHeroIdSkillConfigs('1005', FOOTMAN_SKILL_CONFIGS)       // 骑士队长坦克
    this.registerHeroIdSkillConfigs('1006', FOREST_SAGE_SKILL_CONFIGS)       // 玛法里奥(治疗)
    this.registerHeroIdSkillConfigs('1007', POTIONER_SKILL_CONFIGS)       // 药剂师
    this.registerHeroIdSkillConfigs('1008', ICE_MAGE_SKILL_CONFIGS)         // (法师)
    this.registerHeroIdSkillConfigs('1009', FOREST_ASSASSIN_SKILL_CONFIGS)  // 森林刺客



    this.registerHeroIdSkillConfigs('1010', DRBOOM_SKILL_CONFIGS)       // 砰砰博士
    this.registerHeroIdSkillConfigs('1011', AEGWYNN_SKILL_CONFIGS)       // 艾格文

    //10.31新增英雄技能
     this.registerHeroIdSkillConfigs('1011', AEGWYNN_SKILL_CONFIGS)      
      this.registerHeroIdSkillConfigs('1012', AEGWYNN_SKILL_CONFIGS)      

    //10.28新添英雄技能
    for (let i = 1012; i <= 1029; i++) {
      this.registerHeroIdSkillConfigs(String(i), ARCHER_SKILL_CONFIGS)
    }

  }

  // ========== 游戏流程接口 ==========

  /**
   * 玩家获得新英雄时调用
   */
  public addHero(heroId: string, level: number = 1, star: number = 1): void {
    const heroInfo: HeroInfo = {
      heroId,
      level,
      star,
      teamHeroIds: []
    }
    
    this.registerHero(heroInfo)
    console.log(`新英雄加入: ${heroId} Lv${level}`)
    
    // 更新所有英雄的队伍信息
    this.updateAllHeroTeamIds()
    
    // 检查是否需要技能选择
    this.checkForSkillChoices([heroId])
  }

  /**
   * 英雄升级时调用
   */
  public heroLevelUp(heroId: string, newLevel: number): void {
    const heroInfo = this.getHeroInfo(heroId)
    if (heroInfo) {
      heroInfo.level = newLevel
      this.updateHeroInfo(heroInfo)
      
      // 检查是否需要技能选择
      this.checkForSkillChoices([heroId])
    }
  }

  /**
   * 批量处理英雄升级
   */
  public batchHeroLevelUp(levelUps: Array<{heroId: string, newLevel: number}>): void {
    const needsChoice = this.batchUpdateHeroLevels(levelUps)
    
    if (needsChoice.length > 0) {
      this.checkForSkillChoices(needsChoice)
    }
  }

  /**
   * 获取所有待选择技能的英雄
   */
  public getHeroesWithPendingChoices(): string[] {
    return Array.from(this.pendingSkillChoices.keys())
  }

  /**
   * 获取英雄的技能选择选项
   */
  public getSkillChoicesForHero(heroId: string): SkillOption[] {
    return this.pendingSkillChoices.get(heroId) || []
  }

  /**
   * 清除英雄的待选择技能
   */
  public clearPendingSkillChoices(heroId: string): void {
    const cleared = this.pendingSkillChoices.delete(heroId)
    if (cleared) {
    }
  }

  /**
   * 玩家选择技能
   */
  public selectSkill(heroId: string, optionIndex: number): SkillChangeEvent | null {
    const options = this.pendingSkillChoices.get(heroId)
    if (!options || optionIndex < 0 || optionIndex >= options.length) {
      console.warn(`无效的技能选择: ${heroId}, 选项${optionIndex}`)
      return null
    }

    const selectedOption = options[optionIndex]
    const upgradeEvent = this.selectSkillOption(heroId, selectedOption)
    
    // 移除已处理的选择
    this.pendingSkillChoices.delete(heroId)
    
    return upgradeEvent
  }

  /**
   * 获取所有英雄的概览信息
   */
  public getAllHeroesOverview(): Array<{
    heroId: string,
    level: number,
    skillCount: number,
    needsChoice: boolean
  }> {
    const overview: Array<{
      heroId: string,
      level: number,
      skillCount: number,
      needsChoice: boolean
    }> = []

    const allHeroIds = this.getAllHeroIds()
    
    for (const heroId of allHeroIds) {
      const heroInfo = this.getHeroInfo(heroId)
      const skillCount = this.getEquippedSkills(heroId).length
      const needsChoice = this.pendingSkillChoices.has(heroId)
      
      if (heroInfo) {
        overview.push({
          heroId,
          level: heroInfo.level,
          skillCount,
          needsChoice
        })
      }
    }

    return overview
  }

  /**
   * 重置英雄技能（用于测试）
   */
  public resetHeroSkills(heroId: string): void {
    const skillData = this.getHeroSkillData(heroId)
    if (skillData) {
      skillData.equippedSkills.clear()
      skillData.lastLevelUpLevel = 0
    }
    this.pendingSkillChoices.delete(heroId)
  }

  /**
   * 清理所有游戏相关数据（游戏结束时调用）
   */
  public clearGameData(): void {
    console.log('[SkillManager] 开始清理技能管理器数据...')
    
    try {
      // 清理所有英雄技能数据
      this.heroSkillData.forEach((skillData, heroId) => {
        skillData.equippedSkills.clear()
        skillData.lastLevelUpLevel = 0
      })
      this.heroSkillData.clear()
      
      // 清理英雄信息
      this.heroInfos.clear()
      
      // 清理待选择技能
      this.pendingSkillChoices.clear()
      
      // 【新增】清理临时装备加成管理器
      const bonusManager = TemporaryEquipmentBonusManager.getInstance();
      if (bonusManager) {
        bonusManager.clearAllBonuses();
      }
      
      console.log('[SkillManager] 技能管理器数据清理完成')
    } catch (error) {
      console.error('[SkillManager] 清理数据时出错:', error)
    }
  }

  /**
   * 重置技能管理器（完全重置，包括配置）
   */
  public resetSkillManager(): void {
    console.log('[SkillManager] 重置技能管理器...')
    
    try {
      // 清理游戏数据
      this.clearGameData()
      
      // 重新初始化技能配置
      this.initializeSkillConfigs()
      
      console.log('[SkillManager] 技能管理器重置完成')
    } catch (error) {
      console.error('[SkillManager] 重置技能管理器时出错:', error)
    }
  }

  // ========== 核心技能管理 ==========

  /**
   * 注册英雄
   */
  public registerHero(heroInfo: HeroInfo): void {
    this.heroInfos.set(heroInfo.heroId, heroInfo)
    
    // 初始化英雄技能数据
    if (!this.heroSkillData.has(heroInfo.heroId)) {
      this.heroSkillData.set(heroInfo.heroId, {
        heroId: heroInfo.heroId,
        equippedSkills: new Map(),
        lastLevelUpLevel: 0
      })
    }
    
    // 自动装备主技能
    this.autoEquipMainSkill(heroInfo.heroId)
  }

  /**
   * 注册英雄ID的技能配置
   */
  public registerHeroIdSkillConfigs(heroId: string, skillConfigs: SkillConfigData[]): void {
    this.heroIdSkillConfigs.set(heroId, skillConfigs)
  }

  /**
   * 获取英雄信息
   */
  public getHeroInfo(heroId: string): HeroInfo | undefined {
    return this.heroInfos.get(heroId)
  }

  /**
   * 更新英雄信息
   */
  public updateHeroInfo(heroInfo: HeroInfo): void {
    this.heroInfos.set(heroInfo.heroId, heroInfo)
  }

  /**
   * 获取英雄已装备的技能
   */
  public getEquippedSkills(heroId: string): BaseSkill[] {
    const skillData = this.getHeroSkillData(heroId)
    return skillData ? Array.from(skillData.equippedSkills.values()) : []
  }

  /**
   * 获取英雄已装备技能的ID列表
   */
  public getEquippedSkillIds(heroId: string): string[] {
    const skillData = this.getHeroSkillData(heroId)
    return skillData ? Array.from(skillData.equippedSkills.keys()) : []
  }

  /**
   * 检查英雄是否装备了某个技能
   */
  public isSkillEquipped(heroId: string, skillId: string): boolean {
    const skillData = this.getHeroSkillData(heroId)
    return skillData ? skillData.equippedSkills.has(skillId) : false
  }

  /**
   * 通过技能ID查找技能
   */
  public findSkillById(heroId: string, skillId: string): BaseSkill | null {
    const skillData = this.getHeroSkillData(heroId)
    if (!skillData) {
      return null
    }
    
    return skillData.equippedSkills.get(skillId) || null
  }

  /**
   * 获取英雄的主技能
   */
  public getMainSkill(heroId: string): BaseSkill | null {
    const skills = this.getEquippedSkills(heroId)
    return skills.find(s => s.type === 'main') || null
  }

  /**
   * 获取英雄已学习的、持续生效的被动技能
   */
  public getLearnedPassiveSkills(heroId: string): BaseSkill[] {
    const skills = this.getEquippedSkills(heroId);
    return skills.filter(skill => skill.type === 'passive' && skill.trigger === 'always');
  }

  /**
   * 获取英雄的主技能配置
   */
  public getMainSkillConfig(heroId: string): SkillConfigData | null {
    const skillConfigs = this.getHeroSkillConfigs(heroId)
    return skillConfigs.find(config => config.type === 'main') || null
  }

  /**
   * 获取英雄的所有技能效果（用于战斗计算）
   */
  public getAllSkillEffects(heroId: string): Array<{skillId: string, effect: any}> {
    return this.getEquippedSkills(heroId).map(skill => ({
      skillId: skill.skill_id,
      effect: skill.getEffect()
    }))
  }

  /**
   * 获取技能统计信息
   */
  public getSkillStats(heroId: string): {
    totalSkills: number,
    mainSkills: number,
    passiveSkills: number,
    averageLevel: number
  } {
    const skills = this.getEquippedSkills(heroId)
    const totalSkills = skills.length
    const mainSkills = skills.filter(s => s.type === 'main').length
    const passiveSkills = skills.filter(s => s.type === 'passive').length
    const averageLevel = totalSkills > 0 ? 
      skills.reduce((sum, skill) => sum + skill.getStack(), 0) / totalSkills : 0
    
    return {
      totalSkills,
      mainSkills,
      passiveSkills,
      averageLevel: Math.round(averageLevel * 100) / 100
    }
  }

  /**
   * 获取所有注册的英雄ID列表
   */
  public getAllHeroIds(): string[] {
    return Array.from(this.heroInfos.keys())
  }

  /**
   * 检查英雄是否需要技能升级选择
   */
  public needsSkillLevelUp(heroId: string): boolean {
    const heroInfo = this.getHeroInfo(heroId)
    const skillData = this.getHeroSkillData(heroId)
    
    if (!heroInfo || !skillData) return false
    
    // 如果英雄等级比上次升级等级高，且有可选择的技能
    if (heroInfo.level > skillData.lastLevelUpLevel) {
      const options = this.getSkillOptionsOnLevelUp(heroId)
      return options.length > 0
    }
    
    return false
  }

  /**
   * 获取英雄升级时的技能选择选项
   */
  public getSkillOptionsOnLevelUp(heroId: string, optionCount: number = 3): SkillOption[] {
    const options: SkillOption[] = []
    const addedSkillIds = new Set<string>()
    
    // 获取可继续叠加的技能
    const stackableSkills = this.getStackableSkills(heroId)
    
    // 获取可解锁的新技能
    const unlockableSkills = this.getUnlockableSkills(heroId)
    
    // 优先添加可叠加的技能选项
    for (const skill of stackableSkills) {
      if (options.length >= optionCount) break
      if (addedSkillIds.has(skill.skill_id)) continue
      
      options.push({
        type: OptionType.SKILL,
        skill: skill,
        isNew: false,
        heroId: heroId,
        gameObj: null
      })
      addedSkillIds.add(skill.skill_id)
    }
    
    // 然后添加新技能选项
    for (const config of unlockableSkills) {
      if (options.length >= optionCount) break
      if (addedSkillIds.has(config.skill_id)) continue
      
      const newSkill = new BaseSkill(config)
      options.push({
        type: OptionType.SKILL,
        skill: newSkill,
        isNew: true,
        heroId: heroId,
        gameObj: null
      })
      addedSkillIds.add(config.skill_id)
    }
    
    // 【移除】混合装备选项逻辑，交由 GameLevelUpManager 处理
    // 现在只返回技能选项，装备混合由上层管理
    return options.slice(0, optionCount)
  }

  /**
   * 生成随机装备选项
   * @param count 生成数量
   * @returns 装备选项数组
   */
  public generateRandomEquipmentOptions(count: number): SkillOption[] {
    const equipmentOptions: SkillOption[] = [];
    
    // 【加强】数据验证
    if (count <= 0) {
      console.warn('[SkillManager] generateRandomEquipmentOptions: count <= 0');
      return equipmentOptions;
    }
    
    const userEquipmentData = UserEquipmentData.getInstance();
    
    // 获取用户拥有的装备
    const userEquipments = userEquipmentData.getAllUserEquipments();
    
    // 获取已装备的装备ID列表（天选装备 + 临时装备）
    const chosenEquipIds = userEquipmentData.getChosenEquipSlots()
      .filter(equip => equip !== null)
      .map(equip => equip!.equipId);
    
    const tempEquipIds = userEquipmentData.getTemporaryEquipments()
      .map(equip => equip.equipId);
    
    const equippedIds = new Set([...chosenEquipIds, ...tempEquipIds]);
    
    // 【修正】装备栏容量：总容量6个，临时装备栏动态补充天选装备栏
    const totalEquippedCount = chosenEquipIds.length + tempEquipIds.length;
    const maxChosenSlots = 3;           // 天选装备栏最大容量
    const maxTotalSlots = 6;            // 总装备栏容量
    const maxTempSlots = maxTotalSlots - chosenEquipIds.length; // 临时装备栏动态容量
    
    // 【调试】打印装备栏详细信息
    console.log(`[SkillManager] 装备栏状态: 天选装备${chosenEquipIds.length}/${maxChosenSlots}个[${chosenEquipIds.join(',')}], 临时装备${tempEquipIds.length}/${maxTempSlots}个[${tempEquipIds.join(',')}], 总计${totalEquippedCount}/${maxTotalSlots}`);
    
    // 【修正】当总装备栏满（6个）时，检查替换逻辑
    if (totalEquippedCount >= maxTotalSlots) {
      console.log('[SkillManager] 装备栏已满，检查是否有可替换的装备');
    }
    
    // 【新增】获取已装备装备的品阶信息
    const equippedEquipLevels = new Map<number, number>(); // equipId -> equipLevel
    [...chosenEquipIds, ...tempEquipIds].forEach(equipId => {
      const equipFullInfo = userEquipmentData.getEquipmentFullInfo(equipId);
      if (equipFullInfo) {
        equippedEquipLevels.set(equipId, equipFullInfo.config.equipLevel);
      }
    });
    
    // 【新增】构建装备升级链：找出哪些装备是被更高阶装备替代的
    const supersededEquipIds = new Set<number>();
    
    // 【调试】显示已装备装备的详细信息
    console.log('[SkillManager] 已装备装备详情:');
    for (const [equippedId, equippedLevel] of equippedEquipLevels) {
      const equipFullInfo = userEquipmentData.getEquipmentFullInfo(equippedId);
      if (equipFullInfo) {
        console.log(`  - 装备${equippedId}: ${equipFullInfo.config.name}, 品阶${equippedLevel}, 前置装备${equipFullInfo.config.unlockBy || '无'}`);
      }
    }
    
    // 遍历已装备的装备，找出被它们替代的低阶装备
    for (const [equippedId, equippedLevel] of equippedEquipLevels) {
      const equipFullInfo = userEquipmentData.getEquipmentFullInfo(equippedId);
      if (equipFullInfo && equipFullInfo.config.unlockBy && equipFullInfo.config.unlockBy > 0) {
        // 如果这个装备是由其他装备解锁的，那么前置装备就被替代了
        supersededEquipIds.add(equipFullInfo.config.unlockBy);
        console.log(`[SkillManager] 装备${equipFullInfo.config.name}(${equippedId})已装备，其前置装备${equipFullInfo.config.unlockBy}被替代`);
      }
    }
    
    // 筛选可用装备：已解锁、已拥有、未装备、未被替代
    const availableEquipments = userEquipments.filter(userEquip => {
      // 检查基本条件
      if (!userEquip.isUnlocked || !userEquip.isOwned) {
        return false;
      }
      
      // 检查是否已装备
      if (equippedIds.has(userEquip.equipId)) {
        return false;
      }
      
      // 【新增】检查是否被更高阶装备替代
      if (supersededEquipIds.has(userEquip.equipId)) {
        console.log(`[SkillManager] 装备${userEquip.equipId}已被更高阶装备替代，跳过`);
        return false;
      }
      
      // 检查装备配置是否存在（通过UserEquipmentData获取）
      const equipFullInfo = userEquipmentData.getEquipmentFullInfo(userEquip.equipId);
      if (!equipFullInfo) {
        return false;
      }
      
      return true;
    });
    
    // 【新增】如果装备栏满，检查是否有可替换的装备
    if (tempEquipIds.length >= maxTempSlots || totalEquippedCount >= maxTotalSlots) {
      console.log('[SkillManager] 装备栏已满，检查是否有可替换的装备');
      
             // 【修复】获取临时装备栏中可以被替换的低阶装备（天选装备不参与替换）
       const replaceableEquipments = new Set<number>();
       
       // 只遍历临时装备栏中的装备，找出可以被替换的低阶装备
       tempEquipIds.forEach(tempEquipId => {
         // 查找能够替换这个临时装备的高阶装备
         const possibleUpgrades = userEquipments.filter(userEquip => {
           if (!userEquip.isUnlocked || !userEquip.isOwned) return false;
           if (equippedIds.has(userEquip.equipId)) return false; // 已装备
           
           const equipFullInfo = userEquipmentData.getEquipmentFullInfo(userEquip.equipId);
           if (!equipFullInfo) return false;
           
           // 检查这个装备是否能替换当前临时装备
           return equipFullInfo.config.unlockBy === tempEquipId;
         });
         
         if (possibleUpgrades.length > 0) {
           replaceableEquipments.add(tempEquipId);
           console.log(`[SkillManager] 临时装备${tempEquipId}可以被替换，有${possibleUpgrades.length}个升级选项`);
         }
       });
       
       // 【新增】天选装备栏状态说明
       console.log(`[SkillManager] 天选装备栏[${chosenEquipIds.join(',')}]不参与替换，只检查临时装备栏[${tempEquipIds.join(',')}]`);
       console.log(`[SkillManager] 可替换的临时装备: [${Array.from(replaceableEquipments).join(',')}]`);
      
      // 【修复】获取所有可用的高阶装备（包括可以替换现有装备的）
      const upgradeEquipments = userEquipments.filter(userEquip => {
        if (!userEquip.isUnlocked || !userEquip.isOwned) return false;
        if (equippedIds.has(userEquip.equipId)) return false; // 已装备
        
        const equipFullInfo = userEquipmentData.getEquipmentFullInfo(userEquip.equipId);
        if (!equipFullInfo) return false;
        
        // 检查这个装备是否能替换装备栏中的某个装备
        const canReplace = equipFullInfo.config.unlockBy && 
                          equipFullInfo.config.unlockBy > 0 &&
                          replaceableEquipments.has(equipFullInfo.config.unlockBy);
        
        // 或者检查是否是比当前最高阶装备更高的装备
        const currentMaxLevel = Math.max(...Array.from(equippedEquipLevels.values()));
        const isHigherTier = equipFullInfo.config.equipLevel > currentMaxLevel;
        
        return canReplace || isHigherTier;
      });
      
      if (upgradeEquipments.length === 0) {
        console.log('[SkillManager] 装备栏已满且没有可替换的装备，返回空数组');
        return equipmentOptions;
      }
      
      console.log(`[SkillManager] 装备栏已满，但有${upgradeEquipments.length}个可用的升级装备`);
      
      // 随机选择升级装备
      const shuffledUpgradeEquipments = [...upgradeEquipments].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < Math.min(count, shuffledUpgradeEquipments.length); i++) {
        const userEquip = shuffledUpgradeEquipments[i];
        const equipFullInfo = userEquipmentData.getEquipmentFullInfo(userEquip.equipId);
        
        if (!equipFullInfo) {
          console.error('[SkillManager] Equipment full info not found for ID:', userEquip.equipId);
          continue;
        }
        
        equipmentOptions.push({
          type: OptionType.EQUIPMENT,
          equipId: userEquip.equipId,
          name: equipFullInfo.config.name || `装备#${userEquip.equipId}`,
          description: equipFullInfo.config.desc || '暂无描述',
          level: userEquip.level, 
          rarity: this.getEquipmentRarity(equipFullInfo.config.equipLevel || 1),
          iconFrameName: equipFullInfo.config.iconFrameName || 'default_equipment_icon'
        });
      }
      
      return equipmentOptions;
    }
    
    if (availableEquipments.length === 0) {
      console.log('[SkillManager] 没有可用的装备选项');
      return equipmentOptions;
    }
    
    // 随机选择装备
    const shuffledEquipments = [...availableEquipments].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(count, shuffledEquipments.length); i++) {
      const userEquip = shuffledEquipments[i];
      const equipFullInfo = userEquipmentData.getEquipmentFullInfo(userEquip.equipId);
      
      // 【加强】单个装备数据验证
      if (!equipFullInfo) {
        console.error('[SkillManager] Equipment full info not found for ID:', userEquip.equipId);
        continue;
      }
      
      equipmentOptions.push({
        type: OptionType.EQUIPMENT,
        equipId: userEquip.equipId,
        name: equipFullInfo.config.name || `装备#${userEquip.equipId}`,
        description: equipFullInfo.config.desc || '暂无描述',
        level: userEquip.level, 
        rarity: this.getEquipmentRarity(equipFullInfo.config.equipLevel || 1),
        iconFrameName: equipFullInfo.config.iconFrameName || 'default_equipment_icon'
      });
    }
    
    return equipmentOptions;
  }

  /**
   * 根据装备等级获取稀有度
   * @param equipLevel 装备等级
   * @returns 稀有度字符串
   */
  private getEquipmentRarity(equipLevel: number): string {
    switch (equipLevel) {
      case 1: return 'common';
      case 2: return 'rare';
      case 3: return 'epic';
      case 4: return 'legendary';
      case 5: return 'mythic';
      default: return 'common';
    }
  }

  /**
   * 处理英雄的技能选择
   */
  public selectSkillOption(heroId: string, option: SkillOption): SkillChangeEvent | null {
    // 【新增】处理装备选择
    if (option.type === OptionType.EQUIPMENT) {
      return this.selectEquipmentOption(option);
    }
    
    // 处理技能选择
    const skillData = this.getHeroSkillData(heroId);
    if (!skillData) {
      console.error(`[SkillManager] selectSkillOption: Hero skill data not found for heroId: ${heroId}`);
      return null;
    }

    const { skill, isNew } = option;
    if (!skill) {
      console.error(`[SkillManager] selectSkillOption: Skill is undefined in option`);
      return null;
    }
    
    const skillId = skill.skill_id;
    let oldStack = 0;

    
    if (isNew) {
      // 装备一个全新的技能
      skillData.equippedSkills.set(skillId, skill);
      oldStack = 0;
      skill.setStack(1); // Manually set stack to 1 for new skills
    } else {
      // 升级一个已有的技能
      const existingSkill = skillData.equippedSkills.get(skillId);
      if (existingSkill) {
        oldStack = existingSkill.getStack();
        existingSkill.addStack(); // Use addStack for safer increment
      } else {
        // 如果出现不一致（标记为升级但找不到技能），则按新技能处理
        console.warn(`[SkillManager] Skill ${skillId} marked for upgrade but not found. Adding as new skill.`);
        skillData.equippedSkills.set(skillId, skill);
        oldStack = 0;
        skill.setStack(1); // Also set stack to 1 here
      }
    }
    
    const finalSkillInMap = skillData.equippedSkills.get(skillId);
    const newStack = finalSkillInMap ? finalSkillInMap.getStack() : oldStack + 1;


    const event: SkillChangeEvent = {
      heroId,
      skillId,
      oldStack,
      newStack,
      isNewSkill: isNew || false
    };

    return event;
  }

  /**
   * 处理装备选择
   * @param option 装备选项
   * @returns 空，因为装备选择不产生技能变更事件
   */
  private selectEquipmentOption(option: SkillOption): null {
    if (!option.equipId) {
      console.error(`[SkillManager] selectEquipmentOption: Equipment ID is undefined`);
      return null;
    }
    
    const equipmentData = UserEquipmentData.getInstance();
    const equipFullInfo = equipmentData.getEquipmentFullInfo(option.equipId);
    
    if (!equipFullInfo) {
      console.error(`[SkillManager] 装备信息不存在: ${option.equipId}`);
      return null;
    }
    
    // 【新增】检查是否是高阶装备，需要替换低阶装备
    if (equipFullInfo.config.unlockBy && equipFullInfo.config.unlockBy > 0) {
      const lowTierEquipId = equipFullInfo.config.unlockBy;
      const replaced = this.replaceEquipmentIfFound(equipmentData, lowTierEquipId, option.equipId, option.name);
      
      if (replaced) {
        console.log(`[SkillManager] 高阶装备${option.name}(${option.equipId})替换了低阶装备${lowTierEquipId}`);
        return null;
      }
    }
    
    // 【原有逻辑】直接添加装备（如果没有找到需要替换的低阶装备）
    const success = equipmentData.addTemporaryEquipment(option.equipId);
    
    if (success) {
      console.log(`[SkillManager] 成功装备临时装备: ${option.name} (ID: ${option.equipId})`);
    } else {
      console.error(`[SkillManager] 装备临时装备失败: ${option.name} (ID: ${option.equipId})`);
    }
    
    return null; // 装备选择不产生技能变更事件
  }

  /**
   * 查找并替换装备（仅在临时装备栏中查找）
   * @param equipmentData 装备数据管理器
   * @param lowTierEquipId 要替换的低阶装备ID
   * @param highTierEquipId 高阶装备ID
   * @param highTierEquipName 高阶装备名称
   * @returns 是否成功替换
   */
  private replaceEquipmentIfFound(
    equipmentData: UserEquipmentData, 
    lowTierEquipId: number, 
    highTierEquipId: number, 
    highTierEquipName?: string
  ): boolean {
    // 只在临时装备栏中查找和替换低阶装备
    const tempEquipments = equipmentData.getTemporaryEquipments();
    const tempEquipIndex = tempEquipments.findIndex(equip => equip.equipId === lowTierEquipId);
    
    if (tempEquipIndex !== -1) {
      // 在临时装备栏中找到了低阶装备，进行替换
      const success = equipmentData.removeTemporaryEquipment(lowTierEquipId);
      if (success) {
        equipmentData.addTemporaryEquipment(highTierEquipId);
        const lowTierEquipInfo = equipmentData.getEquipmentFullInfo(lowTierEquipId);
        const lowTierName = lowTierEquipInfo ? lowTierEquipInfo.config.name : `装备#${lowTierEquipId}`;
        console.log(`[SkillManager] 在临时装备栏中将${lowTierName}替换为${highTierEquipName || `装备#${highTierEquipId}`}`);
        return true;
      }
    }
    
    // 【备注】天选装备栏是永久装备，不参与游戏内临时装备的替换逻辑
    console.log(`[SkillManager] 临时装备栏中未找到低阶装备${lowTierEquipId}，直接添加高阶装备${highTierEquipId}`);
    return false; // 没有找到需要替换的低阶装备
  }

  /**
   * 批量处理英雄升级
   */
  public batchUpdateHeroLevels(heroLevelUps: Array<{heroId: string, newLevel: number}>): string[] {
    const needsSkillChoice: string[] = []
    
    for (const {heroId, newLevel} of heroLevelUps) {
      const heroInfo = this.getHeroInfo(heroId)
      if (heroInfo) {
        heroInfo.level = newLevel
        this.updateHeroInfo(heroInfo)
        
        if (this.needsSkillLevelUp(heroId)) {
          needsSkillChoice.push(heroId)
        }
      }
    }
    
    return needsSkillChoice
  }

  // ========== 私有方法 ==========

  /**
   * 获取英雄的技能配置
   */
  private getHeroSkillConfigs(heroId: string): SkillConfigData[] {
    return this.heroIdSkillConfigs.get(heroId) || []
  }

  /**
   * 获取英雄技能数据
   */
  private getHeroSkillData(heroId: string): HeroSkillData | undefined {
    return this.heroSkillData.get(heroId)
  }

  /**
   * 自动装备英雄的主技能
   */
  private autoEquipMainSkill(heroId: string): void {
    const skillConfigs = this.getHeroSkillConfigs(heroId)
    const mainSkills = skillConfigs.filter(config => config.type === 'main')
    
    if (mainSkills.length === 0) {
      return
    }
    
    if (mainSkills.length > 1) {
      console.error(`英雄 ${heroId} 配置了多个主技能，只能有一个主技能`)
      return
    }
    
    const mainSkillConfig = mainSkills[0]
    const skillData = this.getHeroSkillData(heroId)
    
    if (skillData && !skillData.equippedSkills.has(mainSkillConfig.skill_id)) {
      const mainSkill = new BaseSkill(mainSkillConfig)
      mainSkill.stack = 1
      skillData.equippedSkills.set(mainSkillConfig.skill_id, mainSkill)
    }
    
    // 🔧 新增：自动装备一些默认的被动技能用于测试
    // this.autoEquipTestPassiveSkills(heroId);
  }

  /**
   * 自动装备测试用的被动技能
   */
  private autoEquipTestPassiveSkills(heroId: string): void {
    const skillConfigs = this.getHeroSkillConfigs(heroId);
    const skillData = this.getHeroSkillData(heroId);
    
    if (!skillData) return;
    
    // 根据英雄ID装备不同的测试技能
    let testSkillIds: string[] = [];
    
    if (heroId === '1002') { // 亡灵射手 (Archer)
      testSkillIds = ['multi_shot', 'burst_fire']; // 散射 + 连射
    } else if (heroId === '1005') { // flyman (Archer_1)
      testSkillIds = ['piercing_shot', 'explosive_arrow']; // 穿透 + 爆炸
    } else {
      // 其他英雄暂时不装备测试技能
      return;
    }
    
    
    for (const skillId of testSkillIds) {
      // 检查是否已装备
      if (skillData.equippedSkills.has(skillId)) {
        continue;
      }
      
      // 查找技能配置
      const skillConfig = skillConfigs.find(config => config.skill_id === skillId);
      if (!skillConfig) {
        console.warn(`❌ [SkillManager] 技能配置未找到: ${skillId}`);
        continue;
      }
      
      // 创建并装备技能
      const skill = new BaseSkill(skillConfig);
      skill.stack = 1
      skillData.equippedSkills.set(skillId, skill);
    }
  }

  /**
   * 获取英雄可解锁的新技能
   */
  private getUnlockableSkills(heroId: string): SkillConfigData[] {
    const heroInfo = this.getHeroInfo(heroId)
    const skillConfigs = this.getHeroSkillConfigs(heroId)
    const equippedSkillIds = this.getEquippedSkillIds(heroId)
    
    if (!heroInfo) return []
    
    return skillConfigs.filter(config => {
      // 排除主技能，因为它们是自动装备的，但可以通过叠加来升级
      if (config.type === 'main') {
        return false
      }
      
      // 排除已装备的技能
      if (this.isSkillEquipped(heroId, config.skill_id)) {
        return false
      }
      
      // 检查解锁条件
      const tempSkill = new BaseSkill(config)
      return tempSkill.isUnlocked(
        heroInfo.level, 
        heroInfo.star, 
        heroInfo.teamHeroIds || [], 
        equippedSkillIds
      )
    })
  }

  /**
   * 获取英雄可升级的技能
   */
  private getStackableSkills(heroId: string): BaseSkill[] {
    return this.getEquippedSkills(heroId).filter(skill => skill.canAddStack())
  }

  /**
   * 检查指定英雄是否需要技能选择
   */
  private checkForSkillChoices(heroIds: string[]): void {
    heroIds.forEach(heroId => {
      
      if (this.needsSkillLevelUp(heroId)) {
        
        // 检查是否已经有待选择的技能
        const existingOptions = this.pendingSkillChoices.get(heroId)
        if (existingOptions && existingOptions.length > 0) {
          return
        }
        
        const options = this.getSkillOptionsOnLevelUp(heroId, 3)
        if (options.length > 0) {
          this.pendingSkillChoices.set(heroId, options)
          options.forEach((option, index) => {
          })
        } else {
        }
      } else {
      }
    })
  }

  /**
   * 更新所有英雄的队伍英雄ID列表
   * 每个英雄的teamHeroIds包含除自己外的所有其他英雄ID
   */
  private updateAllHeroTeamIds(): void {
    const allHeroIds = this.getAllHeroIds()
    
    for (const heroId of allHeroIds) {
      const heroInfo = this.getHeroInfo(heroId)
      if (heroInfo) {
        // 设置队伍中除自己外的所有其他英雄ID
        heroInfo.teamHeroIds = allHeroIds.filter(id => id !== heroId)
        this.updateHeroInfo(heroInfo)
      }
    }
    
    console.log(`队伍更新完成，当前队伍英雄: [${allHeroIds.join(', ')}]`)
  }
}