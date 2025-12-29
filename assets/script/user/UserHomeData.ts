import { _decorator } from 'cc';
import { UserHomeInfo, MaterialDO, EquipmentVO, LevelProgressDO } from '../api/APITypes';
import { UserInfoData } from './UserInfoData';

const { ccclass } = _decorator;

/**
 * 用户首页数据管理类
 * 负责处理和管理用户首页相关的数据
 */
@ccclass('UserHomeData')
export class UserHomeData {
    private static _instance: UserHomeData = null;
    
    // 用户首页数据
    private _homeInfo: UserHomeInfo = null;
    
    // 材料数据映射表 (materialKey -> MaterialDO)
    private _materialMap: Map<string, MaterialDO> = new Map();
    
    // 装备数据映射表 (materials -> EquipmentVO)
    private _equipmentMap: Map<string, EquipmentVO> = new Map();
    
    // 关卡进度数据映射表 (level -> LevelProgressDO)
    private _levelProgressMap: Map<number, LevelProgressDO> = new Map();

    /**
     * 获取单例实例
     */
    public static getInstance(): UserHomeData {
        if (!UserHomeData._instance) {
            UserHomeData._instance = new UserHomeData();
        }
        return UserHomeData._instance;
    }

    /**
     * 更新用户首页数据
     * @param homeInfo 服务端返回的首页数据
     */
    public updateHomeInfo(homeInfo: UserHomeInfo): void {
        this._homeInfo = homeInfo;
        
        // 更新材料数据映射
        this._materialMap.clear();
        if (homeInfo.materialDOList) {
            homeInfo.materialDOList.forEach(material => {
                this._materialMap.set(material.materialKey, material);
            });
        }
        
        // 更新装备数据映射
        this._equipmentMap.clear();
        if (homeInfo.equipmentVOList) {
            homeInfo.equipmentVOList.forEach(equipment => {
                this._equipmentMap.set(equipment.materials, equipment);
            });
        }
        
        // 更新关卡进度数据映射
        this._levelProgressMap.clear();
        if (homeInfo.levelProgressDOList) {
            homeInfo.levelProgressDOList.forEach(levelProgress => {
                this._levelProgressMap.set(levelProgress.level, levelProgress);
            });
        }

        // 同步数据到 UserInfoData
        this.syncToUserInfoData(homeInfo);
    }

    /**
     * 获取用户首页信息
     */
    public getHomeInfo(): UserHomeInfo | null {
        return this._homeInfo;
    }

    /**
     * 获取用户昵称
     */
    public getNickName(): string {
        return this._homeInfo?.nickName || '';
    }

    /**
     * 获取用户等级
     */
    public getUserLevel(): number {
        return this._homeInfo?.userLevel || 1;
    }

    /**
     * 获取钻石数量
     */
    public getDiamondNumber(): number {
        return this._homeInfo?.diamondNumber || 0;
    }

    /**
     * 获取体力数量
     */
    public getMuscleNumber(): number {
        return this._homeInfo?.muscleNumber || 0;
    }

    /**
     * 获取金币数量
     */
    public getGoldNumber(): number {
        return this._homeInfo?.goldNumber || 0;
    }

    /**
     * 获取大地之种数量
     */
    public getEarthSeedsNumber(): number {
        return this._homeInfo?.earthSeedsNumber || 0;
    }

    /**
     * 获取战斗力
     */
    public getFightPower(): number {
        return this._homeInfo?.fightPower || 0;
    }

    /**
     * 获取经验值
     */
    public getPersonalExperience(): number {
        return this._homeInfo?.personalExperience || 0;
    }

    /**
     * 获取世界树等级
     */
    public getWorldTreeLevel(): number {
        return this._homeInfo?.worldTreeLevel || 1;
    }

    /**
     * 获取普通建造图纸数量
     */
    public getCommonNum(): number {
        return this._homeInfo?.commonNum || 0;
    }

    /**
     * 获取高级建造图纸数量
     */
    public getSeniorNum(): number {
        return this._homeInfo?.seniorNum || 0;
    }

    /**
     * 获取哨塔建造厂等级
     */
    public getBuildLevel(): number {
        return this._homeInfo?.buildLevel || 0;
    }

    /**
     * 获取定向召唤药水数量
     */
    public getRelicTargetedPotion(): number {
        return this._homeInfo?.relicTargetedPotion || 0;
    }

    /**
     * 获取唤灵宝珠数量
     */
    public getSummonOrb(): number {
        return this._homeInfo?.summonOrb || 0;
    }

    /**
     * 获取训练之书数量
     */
    public getTrainingBook(): number {
        return this._homeInfo?.trainingBook || 0;
    }

    /**
     * 获取魔铁矿石数量
     */
    public getDarkIron(): number {
        return this._homeInfo?.darkIron || 0;
    }

    /**
     * 获取关卡进度
     */
    public getStageProgress(): number {
        return this._homeInfo?.stageProgress || 0;
    }

    /**
     * 获取皮肤精华数量
     */
    public getSkinEssenceNum(): number {
        return this._homeInfo?.skinEssenceNum || 0;
    }

    /**
     * 获取活跃积分数量1
     */
    public getActivePoints1(): number | null {
        return this._homeInfo?.activePoints_1 || null;
    }

    /**
     * 获取活跃积分数量2
     */
    public getActivePoints2(): number | null {
        return this._homeInfo?.activePoints_2 || null;
    }

    /**
     * 获取已获得星数
     */
    public getTotalStatNum(): number {
        return this._homeInfo?.totalStatNum || 0;
    }

    /**
     * 获取下次获得通关奖励星数
     */
    public getStatNum(): number {
        return this._homeInfo?.statNum || 0;
    }

    /**
     * 是否显示挂机收益
     */
    public isAfkFlag(): boolean {
        return this._homeInfo?.afkFlag || false;
    }

    /**
     * 根据材料key获取材料数据
     * @param materialKey 材料key
     */
    public getMaterialByKey(materialKey: string): MaterialDO | null {
        return this._materialMap.get(materialKey) || null;
    }

    /**
     * 根据材料key获取材料数量
     * @param materialKey 材料key
     */
    public getMaterialNumber(materialKey: string): number {
        const material = this.getMaterialByKey(materialKey);
        return material?.materialNumber || 0;
    }

    /**
     * 获取所有材料数据
     */
    public getAllMaterials(): MaterialDO[] {
        return Array.from(this._materialMap.values());
    }

    /**
     * 根据装备碎片key获取装备数据
     * @param materials 装备碎片key
     */
    public getEquipmentByKey(materials: string): EquipmentVO | null {
        return this._equipmentMap.get(materials) || null;
    }

    /**
     * 根据装备碎片key获取碎片数量
     * @param materials 装备碎片key
     */
    public getFragmentNumber(materials: string): number {
        const equipment = this.getEquipmentByKey(materials);
        return equipment?.fragmentNumber || 0;
    }

    /**
     * 获取所有装备数据
     */
    public getAllEquipments(): EquipmentVO[] {
        return Array.from(this._equipmentMap.values());
    }

    /**
     * 根据关卡级别获取关卡进度数据
     * @param level 关卡级别
     */
    public getLevelProgress(level: number): LevelProgressDO | null {
        return this._levelProgressMap.get(level) || null;
    }

    /**
     * 根据关卡级别获取星级
     * @param level 关卡级别
     */
    public getLevelStarRate(level: number): number {
        const levelProgress = this.getLevelProgress(level);
        return levelProgress?.starRate || 0;
    }

    /**
     * 根据关卡级别获取通关时间
     * @param level 关卡级别
     */
    public getLevelClearanceTime(level: number): string | null {
        const levelProgress = this.getLevelProgress(level);
        return levelProgress?.clearanceTime || null;
    }

    /**
     * 获取所有关卡进度数据
     */
    public getAllLevelProgress(): LevelProgressDO[] {
        return Array.from(this._levelProgressMap.values());
    }

    /**
     * 检查关卡是否已通关
     * @param level 关卡级别
     */
    public isLevelCleared(level: number): boolean {
        const starRate = this.getLevelStarRate(level);
        return starRate > 0;
    }

    /**
     * 检查关卡是否满星
     * @param level 关卡级别
     */
    public isLevelFullStar(level: number): boolean {
        const starRate = this.getLevelStarRate(level);
        return starRate === 3;
    }

    /**
     * 获取已通关的关卡数量
     */
    public getClearedLevelCount(): number {
        return this.getAllLevelProgress().filter(level => level.starRate > 0).length;
    }

    /**
     * 获取满星关卡数量
     */
    public getFullStarLevelCount(): number {
        return this.getAllLevelProgress().filter(level => level.starRate === 3).length;
    }

    /**
     * 同步数据到 UserInfoData
     * @param homeInfo 服务端返回的首页数据
     */
    private syncToUserInfoData(homeInfo: UserHomeInfo): void {
        console.log('UserHomeData: 开始同步数据到 UserInfoData');
        console.log('UserHomeData: 收到的 homeInfo:', JSON.stringify(homeInfo, null, 2));
        
        const userInfoData = UserInfoData.getInstance();
        
        // 开始批量更新，减少事件触发频率
        userInfoData.beginBatchUpdate();
        
        // 基本信息
        if (homeInfo.nickName) {
            userInfoData.setUserName(homeInfo.nickName);
            console.log('UserHomeData: 同步昵称', homeInfo.nickName);
        }
        
        // 货币信息
        if (homeInfo.goldNumber !== undefined) {
            userInfoData.setGold(homeInfo.goldNumber);
            console.log('UserHomeData: 同步金币', homeInfo.goldNumber);
        }
        
        if (homeInfo.diamondNumber !== undefined) {
            userInfoData.setDiamond(homeInfo.diamondNumber);
            console.log('UserHomeData: 同步钻石', homeInfo.diamondNumber);
        }

        if (typeof (homeInfo as any).flamesVoucher === 'number') {
            userInfoData.setFlamesVoucher((homeInfo as any).flamesVoucher);
        }

        // 荣誉点同步
        {
            let honorValue: number | undefined = undefined;
            let foundKey: string | undefined = undefined;

            // 1) 优先检查服务端顶层字段（snake_case）：honor_points 等
            const topHonorKeys = ['honorPoints', 'honorNumber', 'honor_points', 'currency_honor', 'honor', 'honour', 'arena_honor'];
            for (const key of topHonorKeys) {
                const v = (homeInfo as any)[key];
                if (typeof v === 'number') {
                    honorValue = v;
                    foundKey = `top:${key}`;
                    console.log('UserHomeData: 使用顶层字段解析荣誉点', key, v);
                    break;
                }
            }

            // 2) 如果顶层没有，尝试使用接口内的可选字段 honorPoints（camelCase）
            if (honorValue === undefined && this._homeInfo?.honorPoints !== undefined && this._homeInfo?.honorPoints !== null) {
                honorValue = this._homeInfo.honorPoints;
                foundKey = 'honorPoints';
                console.log('UserHomeData: 使用 honorPoints 字段解析荣誉点:', honorValue);
            }

            // 3) 如果仍未找到，尝试从 materialDOList 中查找同名材料
            if (honorValue === undefined) {
                const honorKeys = ['honor_points', 'currency_honor', 'honor', 'honour', 'arena_honor'];

                // 调试：输出所有 materialKey
                console.log('UserHomeData: 所有materialKeys:', Array.from(this._materialMap.keys()));

                for (const key of honorKeys) {
                    if (this._materialMap.has(key)) {
                        const mat = this._materialMap.get(key);
                        honorValue = mat?.materialNumber ?? 0;
                        foundKey = `material:${key}`;
                        console.log('UserHomeData: 解析荣誉点自材料', key, honorValue);
                        break;
                    }
                }
            }

            // 4) 不再从徽章系统推断荣誉点，荣誉点仅来源 honor_points（或同义键）

            if (honorValue !== undefined) {
                const localHonor = userInfoData.getHonor();
                const mergedHonor = Math.max(localHonor, honorValue);
                userInfoData.setHonor(mergedHonor);
                console.log('UserHomeData: 同步荣誉点', honorValue, '本地', localHonor, '合并为', mergedHonor, '来自key:', foundKey);
            } else {
                // 不覆盖本地荣誉点，避免服务端缺失字段导致回退
                console.warn('UserHomeData: 未找到荣誉点数据，保留本地荣誉点', userInfoData.getHonor());
            }
        }

        // 体力信息
        if (homeInfo.muscleNumber !== undefined) {
            userInfoData.setEnergy(homeInfo.muscleNumber);
            console.log('UserHomeData: 同步体力', homeInfo.muscleNumber);
        }
        
        // 经验信息（仅当服务端不落后于本地时才覆盖）
        if (homeInfo.personalExperience !== undefined) {
            const localExp = userInfoData.getExp();
            if (homeInfo.personalExperience >= localExp) {
                userInfoData.setExp(homeInfo.personalExperience);
                console.log('UserHomeData: 同步经验', homeInfo.personalExperience);
                console.log('UserHomeData: 同步等级', userInfoData.getUserInfo().level);
            } else {
                console.log('UserHomeData: 跳过经验回退，保留本地更高经验', localExp);
            }
        }

        // 用户等级（仅当服务端不低于本地时才覆盖）
        if (homeInfo.userLevel) {
            const localLevel = userInfoData.getLevel();
            if (homeInfo.userLevel >= localLevel) {
                userInfoData.setLevel(homeInfo.userLevel);
                console.log('UserHomeData: 同步等级', homeInfo.userLevel);
            } else {
                console.log('UserHomeData: 跳过等级回退，保留本地更高等级', localLevel);
            }
        }
        
        // 战斗力信息
        if (homeInfo.fightPower !== undefined) {
            userInfoData.setFightPower(homeInfo.fightPower);
            console.log('UserHomeData: 同步战斗力', homeInfo.fightPower);
        }
        
        // 关卡进度 - 对应最大关卡（仅当服务端不低于本地时才覆盖）
        if (homeInfo.stageProgress !== undefined) {
            const localMaxStage = userInfoData.getMaxStage();
            if (homeInfo.stageProgress >= localMaxStage) {
                userInfoData.setMaxStage(homeInfo.stageProgress);
                console.log('UserHomeData: 同步最大关卡', homeInfo.stageProgress);
            } else {
                console.log('UserHomeData: 跳过最大关卡回退，保留本地更高进度', localMaxStage);
            }
        }
        
        // 皮肤精华
        if (homeInfo.skinEssenceNum !== undefined) {
            userInfoData.setSkinPoints(homeInfo.skinEssenceNum);
            // console.log('UserHomeData: 同步皮肤精华', homeInfo.skinEssenceNum);
        }
        
        // 关卡星星数据同步
        if (homeInfo.levelProgressDOList && homeInfo.levelProgressDOList.length > 0) {
            // 将 LevelProgressDO 转换为 LevelProgressData 格式
            const levelProgressData = homeInfo.levelProgressDOList.map(progress => ({
                id: progress.id || 0,
                userId: progress.userId || 0,
                level: progress.level,
                starRate: progress.starRate,
                clearanceTime: progress.clearanceTime || '',
                isElite: progress.isElite || 0  // 是否精英模式，默认为普通模式
            }));
            
            userInfoData.syncStageStarsFromServer(levelProgressData);
        }
        
        // 结束批量更新，只触发一次事件
        userInfoData.endBatchUpdate();
        
    }

    /**
     * 清除所有数据
     */
    public clear(): void {
        this._homeInfo = null;
        this._materialMap.clear();
        this._equipmentMap.clear();
        this._levelProgressMap.clear();
    }
}