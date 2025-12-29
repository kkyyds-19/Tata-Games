import { _decorator, Component, Node } from 'cc';
import { AttackStat } from './attack_stat';
import { GameConfig } from '../global/config/GameConfig';
import { UserInfoData } from '../user/UserInfoData';
import { game } from 'cc';
import { director } from 'cc';
import { Sprite } from 'cc';
import { resManager } from '../utils/resManager';
import { GlobalVariable } from '../global/GlobalVariable';
import { Cfgs } from '../config/Cfgs';
import { Vec3 } from 'cc';
import { UITransform } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 选关地图组件
 * 支持普通和精英难度的星星显示系统
 * 星星数据通过UserInfoData持久化存储
 */
@ccclass('MapSelection')
export class MapSelection extends Component {

    // 攻击点一维数组 [总关卡索引]
    private mAttackStatList: AttackStat[] = [];

    // 部队当前所在的攻击点
    private army_attack_stat: AttackStat | null = null;

    private sprite: Sprite;
    onLoad() {
        this.initializeAttackStatArray();
        this.loadAttackStatNodes();
        this.sprite = this.node.getComponent(Sprite);
    }

    start() {
        // 确保UserInfoData与GlobalVariable同步
        // const userInfoData = UserInfoData.getInstance();
        // userInfoData.syncToGlobalVariable();

        this.initializeStageData();

        director.on(game.gameEvent.GAME_HALL_WORLD_CHANGE, this.onDifficultyChange, this);
        this.onDifficultyChange();
        director.emit(game.gameEvent.HALL_STAGE_SELECTED, game.myGlobal.currentStage - 1, game.myGlobal.currentStage);
    }

    onDifficultyChange() {
        if (Cfgs.CfgWorld.size === 0 || Cfgs.CfgMap.size === 0) {
            return;
        }
        const st = this;
        const cfg = Cfgs.GetCfg(Cfgs.CfgWorld, game.myGlobal.currentWorld);
        const name = cfg.imgUrl;
        // console.log(`setbg>>>>>>>>>>>${cfg.id}, ${cfg.imgUrl}`);
        resManager.setSprite(st.sprite, GlobalVariable.bundleRes, name);

        const size = st.sprite.getComponent(UITransform).contentSize;
        let pos = new Vec3();
        for (const cfg of Cfgs.CfgMap.values()) {
            if (Math.floor(cfg.id / 10000) !== game.myGlobal.currentWorld) continue;
            pos.x = cfg.pos[0] - size.x / 2;
            pos.y = size.y / 2 - cfg.pos[1];
            st.mAttackStatList[cfg.id % 10000 - 1].node.setPosition(pos);
        }
    }

    onDestroy() {
        director.off(game.gameEvent.GAME_HALL_WORLD_CHANGE, this.onDifficultyChange, this)
    }

    /**
     * 初始化攻击点一维数组
     */
    private initializeAttackStatArray(): void {
        const totalStages = GameConfig.MAX_STAGE * GameConfig.MAX_SUB_STAGE;
        this.mAttackStatList = new Array(totalStages).fill(null);
    }

    /**
     * 将大关小关转换为总关卡索引（仅用于节点名称解析）
     * @param majorStage 大关卡编号（1-based）
     * @param minorStage 小关卡编号（0-based）
     * @returns 总关卡索引（0-based）
     */
    private convertToStageIndex(majorStage: number, minorStage: number): number {
        return (majorStage - 1) * GameConfig.MAX_SUB_STAGE + minorStage;
    }

    /**
     * 将总关卡索引转换为显示用的关卡编号
     * @param stageIndex 总关卡索引（0-based）
     * @returns 显示用关卡编号（1-based）
     */
    private getDisplayStageNumber(stageIndex: number): number {
        return stageIndex + 1;
    }

    /**
     * 加载所有攻击点节点
     */
    private loadAttackStatNodes(): void {
        // 获取所有子节点
        const children = this.node.children;
        let loadedCount = 0;

        for (const child of children) {
            // 检查节点名称是否以 "attack_stat_" 开头
            if (child.name.startsWith('attack_stat_')) {
                const result = this.parseAttackStatNodeName(child.name);
                if (result) {
                    const { majorStage, minorStage } = result;

                    // 检查索引范围
                    if (this.isValidStageIndex(majorStage, minorStage)) {
                        const attackStat = child.getComponent(AttackStat);
                        if (attackStat) {
                            // 转换为总关卡索引并存入一维数组
                            const stageIndex = this.convertToStageIndex(majorStage, minorStage);
                            this.mAttackStatList[stageIndex] = attackStat;
                            loadedCount++;
                        }
                    }
                }
            }
        }
    }

    /**
     * 解析攻击点节点名称（保留用于兼容现有节点命名）
     * @param nodeName 节点名称，格式: attack_stat_m_n
     * @returns 解析结果 {majorStage, minorStage} 或 null
     */
    private parseAttackStatNodeName(nodeName: string): { majorStage: number, minorStage: number } | null {
        // 预期格式: attack_stat_m_n
        const pattern = /^attack_stat_(\d+)_(\d+)$/;
        const match = nodeName.match(pattern);

        if (match) {
            const majorStage = parseInt(match[1]);
            const minorStage = parseInt(match[2]);

            if (!isNaN(majorStage) && !isNaN(minorStage)) {
                return { majorStage, minorStage };
            }
        }

        return null;
    }

    /**
     * 检查关卡索引是否有效（用于节点名称解析）
     * @param majorStage 大关卡编号（1-based）
     * @param minorStage 小关卡编号（0-based）
     */
    private isValidStageIndex(majorStage: number, minorStage: number): boolean {
        return majorStage >= 1 && majorStage <= GameConfig.MAX_STAGE &&
            minorStage >= 0 && minorStage < GameConfig.MAX_SUB_STAGE;
    }

    /**
     * 检查总关卡索引是否有效
     * @param stageIndex 总关卡索引（0-based）
     */
    private isValidTotalStageIndex(stageIndex: number): boolean {
        const totalStages = GameConfig.MAX_STAGE * GameConfig.MAX_SUB_STAGE;
        return stageIndex >= 0 && stageIndex < totalStages;
    }

    /**
     * 检查关卡是否已解锁
     * @param stageIndex 关卡索引（0-based）
     */
    private isStageUnlocked(stageIndex: number): boolean {
        const displayStage = this.getDisplayStageNumber(stageIndex);
        return displayStage <= game.myGlobal.maxStage;
    }

    /**
     * 通过关卡索引获取AttackStat组件
     * @param currentStage 关卡索引（0-based）
     * @returns AttackStat组件或null
     */
    public getAttackStat(currentStage: number): AttackStat | null {
        if (!this.isValidTotalStageIndex(currentStage)) {
            return null;
        }

        const attackStat = this.mAttackStatList[currentStage];

        return attackStat;
    }

    /**
     * 通过关卡显示编号获取AttackStat组件
     * @param stageId 关卡显示编号（1-based，如第1关、第2关...第30关）
     * @returns AttackStat组件或null
     */
    public getAttackStatByStageId(stageId: number): AttackStat | null {
        // 将显示编号（1-based）转换为内部索引（0-based）
        // const stageIndex = stageId - 1;
        if (!this.isValidTotalStageIndex(stageId)) {
            return null;
        }
        return this.mAttackStatList[stageId];
    }

    /**
     * 获取所有已加载的AttackStat组件
     * @returns AttackStat组件数组
     */
    public getAllAttackStats(): AttackStat[] {
        return this.mAttackStatList.filter(attackStat => attackStat !== null);
    }

    /**
     * 获取指定范围的AttackStat组件
     * @param startStage 开始关卡索引（0-based）
     * @param count 获取数量
     * @returns AttackStat组件数组
     */
    public getAttackStatsInRange(startStage: number, count: number): AttackStat[] {
        const attackStats: AttackStat[] = [];

        for (let i = 0; i < count; i++) {
            const stageIndex = startStage + i;
            if (this.isValidTotalStageIndex(stageIndex)) {
                const attackStat = this.mAttackStatList[stageIndex];
                if (attackStat) {
                    attackStats.push(attackStat);
                }
            }
        }

        return attackStats;
    }

    /**
     * 调试：打印AttackStat数组状态
     */
    private logAttackStatArray(): void {
        for (let stageIndex = 0; stageIndex < this.mAttackStatList.length; stageIndex++) {
            const attackStat = this.mAttackStatList[stageIndex];
            if (attackStat) {
                const displayStage = this.getDisplayStageNumber(stageIndex);
                // console.log(`第${displayStage}关: 已加载`);
            }
        }
    }

    /**
     * 初始化关卡数据（使用真实星星数据）
     */
    private initializeStageData(): void {
        const userInfoData = UserInfoData.getInstance();
        const totalStages = GameConfig.MAX_STAGE * GameConfig.MAX_SUB_STAGE;

        // 获取当前选择的难度
        const currentDifficulty = game.myGlobal.stageDifficulty; // 0=普通, 1=精英
        const difficultyKey = currentDifficulty === 0 ? 'normal' : 'elite';

        // 应用数据到所有AttackStat组件
        for (let stageIndex = 0; stageIndex < totalStages; stageIndex++) {
            const attackStat = this.mAttackStatList[stageIndex];
            if (attackStat) {
                const displayStage = this.getDisplayStageNumber(stageIndex);

                // 获取真实星星数据
                const stageStars = userInfoData.getStageStars(stageIndex);
                const currentDifficultyStars = stageStars[difficultyKey];

                // 计算关卡状态
                const isUnlocked = this.isStageUnlocked(stageIndex);
                const isPassed = currentDifficultyStars > 0;

                // 设置关卡信息
                attackStat.setStageInfo(
                    displayStage,
                    isUnlocked,
                    isPassed,
                    currentDifficultyStars
                );
            }
        }

        console.log(`MapSelection: 使用${difficultyKey}难度数据初始化关卡显示`);
    }

    /**
     * 刷新关卡显示（当难度切换时调用）
     */
    public refreshStageDisplay(): void {
        this.initializeStageData();
        console.log('MapSelection: 刷新关卡显示完成');
    }

    /**
     * 获取指定关卡的星星数据
     * @param stageIndex 关卡索引（0-based）
     * @returns { normal: number, elite: number } 星星数据
     */
    public getStageStarsData(stageIndex: number): { normal: number, elite: number } {
        const userInfoData = UserInfoData.getInstance();
        return userInfoData.getStageStars(stageIndex);
    }

    /**
     * 设置指定关卡的星星数据
     * @param stageIndex 关卡索引（0-based）
     * @param difficulty 难度 ('normal' | 'elite')
     * @param stars 星星数 (0-3)
     */
    public setStageStars(stageIndex: number, difficulty: 'normal' | 'elite', stars: number): void {
        const userInfoData = UserInfoData.getInstance();
        userInfoData.setStageDifficultyStars(stageIndex, difficulty, stars);

        // 刷新当前显示的关卡数据
        this.refreshStageDisplay();
    }

    /**
     * 设置部队所在点
     * @param new_attack_stat 新的攻击点
     */
    public setArmyPosition(new_attack_stat: AttackStat): void {
        // 取消老的部队所在点
        if (this.army_attack_stat) {
            this.army_attack_stat.setHeroPosition(false);
        }

        // 设置新的部队所在点
        if (new_attack_stat) {
            new_attack_stat.setHeroPosition(true);
            this.army_attack_stat = new_attack_stat;
        } else {
            this.army_attack_stat = null;
        }
    }

    /**
     * 获取部队当前所在的攻击点
     */
    public getArmyPosition(): AttackStat | null {
        return this.army_attack_stat;
    }

    /**
     * 根据关卡索引设置部队位置
     * @param stageIndex 关卡索引（0-based）
     */
    public setArmyPositionByIndex(stageIndex: number): void {
        const attackStat = this.getAttackStat(stageIndex);
        if (attackStat) {
            this.setArmyPosition(attackStat);
        }
    }

    /**
     * 获取当前部队所在的关卡索引
     * @returns 关卡索引，如果没有部队位置则返回-1
     */
    public getArmyPositionIndex(): number {
        if (!this.army_attack_stat) {
            return -1;
        }

        // 在数组中查找部队所在的索引
        return this.mAttackStatList.indexOf(this.army_attack_stat);
    }

    update(deltaTime: number) {

    }
} 
