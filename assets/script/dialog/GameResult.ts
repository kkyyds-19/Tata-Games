import { _decorator, Component, Node, Label, Button, game, Prefab, instantiate, director, sys } from 'cc';
import { TimeManager } from '../game/TimeManager';
import { DamageStatsManager, IHeroDamageStats } from '../game/DamageStatsManager';
import { ResultHeroIcon } from './ResultHeroIcon';
import { Utils } from '../utils/Utils';
import { find } from 'cc';
import { StageComponent } from '../game/stage/StageComponent';
import { GameManager } from '../game/GameManager';
import { StageType } from '../game/stage/StageData';
import { GameConfig } from '../global/config/GameConfig';
import { UserInfoData } from '../user/UserInfoData';
import { stageRewardAPI } from '../api/StageRewardAPI';
import { userAPI } from '../api/UserAPI';
import { arenaAPI } from '../api/API';
import { StageRewardData } from '../api/APITypes';
import { GameItemIcon } from '../hall/GameItemIcon';
import { gameItemConfigs } from '../global/config/GameItemConfig';
import { ChallengeLog } from '../hall/dnf/ChallengeLog';
import { UserHomeData } from '../user/UserHomeData';

const { ccclass, property } = _decorator;

/**
 * 游戏结果界面组件
 * 处理游戏胜利/失败的结果展示和英雄伤害统计
 */
@ccclass('GameResult')
export class GameResult extends Component {

    @property(Label)
    totalDamageLabel: Label = null;

    @property(Node)
    heroStatsContainer: Node = null;

    @property(Prefab)
    resultHeroIconPrefab: Prefab = null;

    @property(Prefab)
    gameItemIconPrefab: Prefab = null;

    @property(Node)
    rewardsContainer: Node = null;

    @property(Node)
    victoryContainer: Node = null;

    @property(Node)
    defeatContainer: Node = null;

    @property(Button)
    closeButton: Button = null;


    //继续游戏按钮
    @property(Button)
    continueButton: Button = null;


    @property(Label)
    stageLayerLabel: Label = null;

    // 记录当前游戏结果状态
    private isVictory: boolean = false;
    
    // 记录通过类型（星星数量）
    private passType: number = 1;



    onLoad() {
        this.node.on(Node.EventType.TOUCH_START , ()=>{
            // 如果自动选择激活，禁用用户交互
                  console.log('touch start')

                  this.closerResult()
                return
            
        }, this)

       
    }
    protected start(): void {

        // this.initUI();

        this.bindEvents();
    }

    /**
     * 初始化UI组件
     */
    private initUI() {
        // 初始状态隐藏胜利和失败容器
        if (this.victoryContainer) {
            this.victoryContainer.active = false;
        }
        if (this.defeatContainer) {
            this.defeatContainer.active = false;
        }
    }

    /**
     * 绑定事件
     */
    private bindEvents() {
        this.closeButton.node.on(Button.EventType.CLICK, this.closerResult, this);
        if (this.continueButton) {
            this.continueButton.node.on(Button.EventType.CLICK, this.onContinueButtonClicked, this);
        }
    }
    
    

    private nextStageClick(){
        // 只有胜利时才进入下一关
        game.myGlobal.currentStage = game.myGlobal.currentStage + 1;
        
        const MAX_STAGE=GameConfig.MAX_STAGE *GameConfig.MAX_SUB_STAGE

        if(game.myGlobal.currentStage >=MAX_STAGE+1){
            game.myGlobal.currentStage = 0;
            game.myGlobal.maxStage=MAX_STAGE  
        }else{
            game.myGlobal.maxStage=game.myGlobal.maxStage<game.myGlobal.currentStage?game.myGlobal.currentStage:game.myGlobal.maxStage    
        }
        // 更新并持久化关卡与等级：每通关+1级（竞技场不升级）
        const stageType: number = (GameManager.getInstance()?.stageManager?.stageData?.stageType as number) ?? game.myGlobal.stageType;
        if (stageType !== StageType.Arena) {
            const userInfo = UserInfoData.getInstance();
            userInfo.updateCurrentStageFromGlobal();
            const newLevel = Math.max(1, userInfo.getLevel() + 1);
            // 将经验设置为新等级的累计经验，确保重启后根据经验计算的等级一致
            // 经验系统以总经验驱动等级，保存总经验更稳妥
            const totalExpForNewLevel = Utils.getTotalExpForLevel(newLevel);
            userInfo.setExp(totalExpForNewLevel);
            // 立即同步到全局，确保依赖 game.myGlobal.currentExp 的界面立刻显示正确等级
            game.myGlobal.currentExp = totalExpForNewLevel;
            // 通知大厅与相关UI刷新
            director.emit(game.gameEvent.HALL_USER_INFO_UPDATE);
            // 同步到服务器（忽略失败，避免阻塞流程）
            userAPI.updateLevel(newLevel).catch((e)=>{
                console.warn('[GameResult] 同步等级到服务器失败:', e);
            });
        } else {
            console.log('[GameResult] 荣誉竞技场胜利：不进行玩家等级升级');
        }
    }

    private backToHallClick(){
        const gameManager = GameManager.getInstance();
        if(gameManager){
            gameManager.endGameAndReturnToHall()    
        }
       
    }

    /**
     * 继续游戏按钮点击事件（深渊挑战专用）
     */
    private onContinueButtonClicked() {
        console.log('[GameResult] 深渊挑战继续游戏按钮点击');
        
        // 进入下一关
        game.myGlobal.currentStage = game.myGlobal.currentStage + 1;
        
        // 更新最大层数记录
        try {
            const current = game.myGlobal.currentStage;
            const layer = Math.max(1, current - 200);
            const saved = parseInt(sys.localStorage.getItem('Abyss.maxLayer') || '0');
            const next = Math.max(saved, layer);
            sys.localStorage.setItem('Abyss.maxLayer', String(next));
        } catch (e) {
            console.warn('[GameResult] 更新深渊最大层数失败', e);
        }
        
        // 重新加载游戏场景
        director.loadScene('game');
        
        // 隐藏结果界面
        this.hideResult();
        TimeManager.getInstance().resume();
    }
    /**
     * 显示游戏结果
     */
    public showResult(isVictory: boolean, levelRewardParams?: {
        level: number;
        json: string;
        type: number;
        rank: number;
    }) {
        TimeManager.getInstance().pause()
        // 记录游戏结果状态
        this.isVictory = isVictory;
        
        // 记录通过类型（星星数量）
        if (levelRewardParams) {
            this.passType = levelRewardParams.type;
        } else {
            this.passType = 1; // 默认1星
        }
        
        // 显示界面
        this.node.active = true;

        // 显示总伤害
        this.updateTotalDamage();
        
        // 显示胜利/失败容器（初始不显示星星，等服务器返回后再显示）
        this.updateResultDisplay(isVictory);
        
        // 显示英雄伤害统计
        this.displayHeroStats();
        
        // 更新深渊挑战层次显示
        this.updateAbyssLayerDisplay();
        
        // 如果有关卡奖励参数，则调用API获取奖励数据（胜利和失败都有奖励）
        if (levelRewardParams) {
            this.requestLevelReward(levelRewardParams);
        }
    }

    /**
     * 更新总伤害显示
     */
    private updateTotalDamage() {
        const damageManager = DamageStatsManager.getInstance();
        const totalDamage = damageManager.getTotalDamage();
        this.totalDamageLabel.string = `${Utils.formatNumber(totalDamage)}`;
    }



    /**
     * 更新胜利/失败显示
     * @param isVictory 是否胜利
     * @param passType 通过类型（1-3星），可选参数
     */
    private updateResultDisplay(isVictory: boolean, passType?: number) {
        if (this.victoryContainer) {
            this.victoryContainer.active = isVictory;
        } else {
            console.warn('[GameResult] victoryContainer 为 null，跳过显示切换');
        }
        if (this.defeatContainer) {
            this.defeatContainer.active = !isVictory;
        } else {
            console.warn('[GameResult] defeatContainer 为 null，跳过显示切换');
        }

        if (isVictory && passType !== undefined) {
            // 只有提供了通过类型时才显示星星（服务器返回后）
            this.updateStarDisplay(passType);
        } else if (isVictory) {
            // 胜利但还没有服务器数据时，隐藏所有星星
            this.resetStarDisplay();
        }
    }

    /**
     * 更新深渊挑战层次显示
     */
    private updateAbyssLayerDisplay(): void {
        const isAbyss = (game.myGlobal.stageType === StageType.Dungeon);
        const abyssMode = (game.myGlobal as any).abyssMode === true;

        if (isAbyss && abyssMode) {
            const currentStage = game.myGlobal.currentStage;
            const layer = Math.max(1, currentStage - 200 + 1);
            if (this.stageLayerLabel) {
                this.stageLayerLabel.string = `第${layer}层`;
                this.stageLayerLabel.node.active = true;
            }
            if (this.continueButton) {
                this.continueButton.node.active = this.isVictory === true;
            }
        } else {
            if (this.stageLayerLabel) {
                this.stageLayerLabel.node.active = false;
            }
            if (this.continueButton) {
                this.continueButton.node.active = false;
            }
        }
    }

    /**
     * 更新星星显示
     * @param passType 通过类型（1-3星）
     */
    private updateStarDisplay(passType: number): void {
        if (!this.victoryContainer) {
            console.warn('[GameResult] victoryContainer 未设置，无法显示星星');
            return;
        }

        // 查找星星节点
        const star0 = this.victoryContainer.getChildByName('star_0');
        const star1 = this.victoryContainer.getChildByName('star_1');
        const star2 = this.victoryContainer.getChildByName('star_2');

        // 默认隐藏所有星星
        if (star0) star0.active = false;
        if (star1) star1.active = false;
        if (star2) star2.active = false;

        // 根据通过类型显示对应数量的星星
        switch (passType) {
            case 1:
                // 1星：只显示 star_0
                if (star0) {
                    star0.active = true;
                    console.log('🌟 显示1星通关');
                }
                break;
                
            case 2:
                // 2星：显示 star_0 和 star_1
                if (star0) star0.active = true;
                if (star1) star1.active = true;
                console.log('🌟🌟 显示2星通关');
                break;
                
            case 3:
                // 3星：显示 star_0、star_1 和 star_2
                if (star0) star0.active = true;
                if (star1) star1.active = true;
                if (star2) star2.active = true;
                console.log('🌟🌟🌟 显示3星通关');
                break;
                
            default:
                // 其他情况默认显示1星
                if (star0) {
                    star0.active = true;
                    console.log('🌟 默认显示1星通关');
                }
                break;
        }

        // 调试信息
        console.log(`[GameResult] 通过类型: ${passType}, 星星状态: star_0=${star0?.active}, star_1=${star1?.active}, star_2=${star2?.active}`);
    }

    /**
     * 显示英雄伤害统计
     */
    private displayHeroStats() {
        const damageManager = DamageStatsManager.getInstance();
        const allStats = damageManager.getAllStats();
        
        // 清空容器中的现有节点
        this.heroStatsContainer.removeAllChildren();
        
        // 为每个英雄创建HeroIcon实例
        for (let i = 0; i < allStats.length; i++) {
            const heroStats = allStats[i];
            this.createHeroIcon(heroStats, i + 1);
        }
    }

    /**
     * 创建英雄图标实例
     */
    private createHeroIcon(stats: IHeroDamageStats, rank: number) {
        // 实例化HeroIcon预制体
        const heroIconNode = instantiate(this.resultHeroIconPrefab);
        
        // 添加到容器中
        heroIconNode.parent = this.heroStatsContainer;

        // 获取ResultHeroIcon组件并设置数据
        const heroIconComponent = heroIconNode.getComponent(ResultHeroIcon);
        
        if (heroIconComponent) {
            // 延迟设置数据，确保 onLoad 已执行
            this.scheduleOnce(() => {
                heroIconComponent.setHeroStats(stats);
            }, 0);
        } else {
            console.error('[GameResult] ResultHeroIcon 组件未找到');
        }
    }




    private closerResult(){
        // 荣誉竞技场：胜利后才记录交换目标，失败则清理挑战缓存，同时记录挑战结果
        try {
            const stageType: number = (GameManager.getInstance()?.stageManager?.stageData?.stageType as number) ?? game.myGlobal.stageType;
            const d = new Date();
            const mm = (d.getMonth() + 1).toString().padStart(2, '0');
            const dd = d.getDate().toString().padStart(2, '0');
            const todayKey = `${d.getFullYear()}${mm}${dd}`;
            if (this.isVictory && stageType === StageType.Arena) {
                const swapDate = sys.localStorage.getItem('pk_challenge_date');
                if (swapDate === todayKey) {
                    const targetName = sys.localStorage.getItem('pk_challenge_target_name') || '';
                    if (targetName && targetName.length > 0) {
                        sys.localStorage.setItem('pk_swap_target_name', targetName);
                        sys.localStorage.setItem('pk_swap_date', todayKey);
                        console.log(`[GameResult] 竞技场胜利：记录换位目标 ${targetName}`);
                        ChallengeLog.addRecord({ opponentName: targetName, result: 'win', dateKey: todayKey });
                    }
                }
            }
            // 失败也记录挑战结果（若存在挑战目标缓存）
            if (!this.isVictory && stageType === StageType.Arena) {
                const targetName = sys.localStorage.getItem('pk_challenge_target_name') || sys.localStorage.getItem('pk_swap_target_name') || '';
                if (targetName && targetName.length > 0) {
                    ChallengeLog.addRecord({ opponentName: targetName, result: 'lose', dateKey: todayKey });
                }
            }
            // 不论胜负或是否为竞技场，关闭结果时清理挑战缓存，避免跨次误触发
            sys.localStorage.removeItem('pk_challenge_target_name');
            sys.localStorage.removeItem('pk_challenge_date');
        } catch (e) {
            console.warn('[GameResult] 处理竞技场胜利换位记录失败', e);
        }
        // 荣誉竞技场：结算荣誉积分（胜利+3，失败-3）
        try {
            const stageType: number = (GameManager.getInstance()?.stageManager?.stageData?.stageType as number) ?? game.myGlobal.stageType;
            if (stageType === StageType.Arena) {
                const userInfo = UserInfoData.getInstance();
                const before = userInfo.getHonor();
                const change = 3;
                const delta = this.isVictory ? change : -change;
                const after = Math.max(0, before + delta);
                userInfo.setHonor(after);
                console.log(`[GameResult] 竞技场${this.isVictory ? '胜利' : '失败'}：荣誉积分 ${before} -> ${after} (变化 ${delta})`);
                // 通知大厅与相关UI刷新
                director.emit(game.gameEvent.HALL_USER_INFO_UPDATE);

                // 调用用户荣誉积分接口：胜利加分，失败扣分（服务端为准）
                try {
                    const challengeUserId: number = Number((game as any).myGlobal?.arenaOpponentUserId ?? 0);
                    if (!challengeUserId || isNaN(challengeUserId)) {
                        console.warn('[GameResult] 未找到对手用户ID，跳过荣誉积分接口调用');
                    } else {
                        const challengeResult = this.isVictory ? 1 : 0;
                        const isGulch = !!((game as any).myGlobal?.gulchChallenge);
                        if (isGulch) {
                            userAPI.gulchChallenge({ challengeUserId, challengeResult })
                                .then((resp) => {
                                    console.log('[GameResult] 峡谷挑战结果上报成功:', resp);
                                })
                                .catch((err) => {
                                    console.warn('[GameResult] 峡谷挑战结果上报失败:', err);
                                })
                                .finally(() => { (game as any).myGlobal.gulchChallenge = false; });
                        } else {
                            userAPI.grantHonor({ challengeUserId, challengeResult, change })
                                .then(async (resp) => {
                                    console.log('[GameResult] 荣誉积分接口调用成功:', resp);
                                    try {
                                        const homeResp = await userAPI.getHomeInfo();
                                        const homeInfo: any = (homeResp as any)?.data;
                                        if (homeInfo && typeof homeInfo.integral === 'number') {
                                            const userHome = UserHomeData.getInstance();
                                            userHome.updateHomeInfo(homeInfo);
                                            console.log(`[GameResult] 后端刷新荣誉积分: ${homeInfo.integral}`);
                                            director.emit(game.gameEvent.HALL_USER_INFO_UPDATE);
                                        }
                                    } catch (refreshErr) {
                                        console.warn('[GameResult] 刷新后端 HomeInfo 失败，继续使用本地结果', refreshErr);
                                        const home = UserHomeData.getInstance().getHomeInfo();
                                        if (home) {
                                            (home as any).integral = after;
                                        }
                                    }
                                })
                                .catch((err) => {
                                    console.warn('[GameResult] 调用荣誉积分接口失败，保留本地荣誉积分', err);
                                    const home = UserHomeData.getInstance().getHomeInfo();
                                    if (home) {
                                        (home as any).integral = after;
                                    }
                                });
                        }
                    }
                } catch (e) {
                    console.warn('[GameResult] 荣誉积分接口调用触发失败', e);
                    const home = UserHomeData.getInstance().getHomeInfo();
                    if (home) {
                        (home as any).integral = after;
                    }
                }
                
                // 延迟返回处理，确保UI有足够时间响应事件刷新显示
                this.scheduleOnce(() => {
                    // 只有胜利时才进入下一关，失败时直接返回大厅
                    if (this.isVictory) {
                        this.nextStageClick();
                        const isAbyss = (game.myGlobal.stageType === StageType.Dungeon);
                        const abyssMode = (game.myGlobal as any).abyssMode === true;
                        if (isAbyss && abyssMode) {
                            try {
                        const current = game.myGlobal.currentStage;
                        const layer = Math.max(1, current - 200);
                                const saved = parseInt(sys.localStorage.getItem('Abyss.maxLayer') || '0');
                                const next = Math.max(saved, layer);
                                sys.localStorage.setItem('Abyss.maxLayer', String(next));
                            } catch {}
                            // 深渊挑战模式：不自动重新加载场景，显示结算界面让玩家选择继续游戏
                            // director.loadScene('game');
                            // return;
                        }
                    }
                    this.backToHallClick();
                }, 0.1); // 延迟0.1秒
                return; // 提前返回，避免执行下面的backToHallClick
            }
        } catch (e) {
            console.warn('[GameResult] 荣誉积分结算失败', e);
        }
        // 只有胜利时才进入下一关，失败时直接返回大厅
        if (this.isVictory) {
            this.nextStageClick();
            const isAbyss = (game.myGlobal.stageType === StageType.Dungeon);
            const abyssMode = (game.myGlobal as any).abyssMode === true;
            if (isAbyss && abyssMode) {
                try {
                    const current = game.myGlobal.currentStage;
                    const layer = Math.max(1, current - 200);
                    const saved = parseInt(sys.localStorage.getItem('Abyss.maxLayer') || '0');
                    const next = Math.max(saved, layer);
                    sys.localStorage.setItem('Abyss.maxLayer', String(next));
                } catch {}
                // 深渊挑战模式：不自动重新加载场景，显示结算界面让玩家选择继续游戏
                // director.loadScene('game');
                // return;
            }
        }
        this.backToHallClick();
        // 隐藏结果界面
        this.hideResult();
        TimeManager.getInstance().resume();
    }





    /**
     * 隐藏游戏结果界面
     */
    public hideResult() {
        this.node.active = false;
        
        // 重置UI状态
        this.resetUIState();
    }

    /**
     * 重置UI状态
     */
    private resetUIState() {
        // 隐藏胜利和失败容器
        if (this.victoryContainer) {
            this.victoryContainer.active = false;
        }
        if (this.defeatContainer) {
            this.defeatContainer.active = false;
        }
        
        // 重置星星状态
        this.resetStarDisplay();
        
        // 清空所有英雄统计节点
        if (this.heroStatsContainer) {
            this.heroStatsContainer.removeAllChildren();
        }
        
        // 清空总伤害显示
        if (this.totalDamageLabel) {
            this.totalDamageLabel.string = "";
        }
        
        // 重置通过类型
        this.passType = 1;
    }

    /**
     * 重置星星显示状态
     */
    private resetStarDisplay(): void {
        if (!this.victoryContainer) return;

        const star0 = this.victoryContainer.getChildByName('star_0');
        const star1 = this.victoryContainer.getChildByName('star_1');
        const star2 = this.victoryContainer.getChildByName('star_2');

        // 隐藏所有星星
        if (star0) star0.active = false;
        if (star1) star1.active = false;
        if (star2) star2.active = false;
    }

 



    /**
     * 获取当前伤害统计
     */
    public getDamageStats(): IHeroDamageStats[] {
        const damageManager = DamageStatsManager.getInstance();
        return damageManager.getAllStats();
    }

    /**
     * 请求关卡奖励
     * @param levelRewardParams 关卡奖励参数
     */
    private async requestLevelReward(levelRewardParams: {
        level: number;
        json: string;
        type: number;
        rank: number;
    }): Promise<void> {
        try {
            console.log('🎮 请求关卡奖励参数:', levelRewardParams);
            
            // 判断是否为精英关卡
            const flag = game.myGlobal.stageDifficulty === 1 ? 1 : 0;
            
            // 调用API获取奖励
            const response = await stageRewardAPI.receiveLevelReward(
                levelRewardParams.level,
                levelRewardParams.json,
                levelRewardParams.type,
                flag,
                levelRewardParams.rank
            );
            
            if (response && response.code === 200) {
                // 解析奖励数据
                const rewardData = stageRewardAPI.parseRewardString(response.data);
                console.log('🎁 获得关卡奖励:', rewardData);
                
                // 服务器返回成功后，如果是胜利则显示星星
                
                this.updateResultDisplay(this.isVictory, this.passType);
                console.log(`🌟 服务器返回成功，显示${this.passType}星通关`);
                
                // 更新UI显示奖励（服务端已处理物品增加，客户端只展示）
                this.updateRewardDisplay(rewardData);
            } else {
                
                this.updateResultDisplay(this.isVictory, 1);
               console.log('⚠️ 服务器返回失败，显示默认1星通关');
                
            }
        } catch (error) {
            
                this.updateResultDisplay(this.isVictory, 1);
                console.log('⚠️ 请求异常，显示默认1星通关');
            
        }
    }

    /**
     * 创建奖励图标
     * @param itemId 道具ID
     * @param count 数量
     * @param name 道具名称
     */
    private createRewardIcon(itemId: number, count: number, name: string): void {
        if (!this.gameItemIconPrefab || !this.rewardsContainer) {
            console.error('[GameResult] gameItemIconPrefab 或 rewardsContainer 未设置');
            return;
        }

        // 实例化GameItemIcon预制体
        const rewardIconNode = instantiate(this.gameItemIconPrefab);
        
        // 添加到奖励容器中
        rewardIconNode.parent = this.rewardsContainer;

        // 获取GameItemIcon组件并设置数据
        const gameItemIconComponent = rewardIconNode.getComponent(GameItemIcon);
        
        if (gameItemIconComponent) {
            // 初始化图标
            gameItemIconComponent.init(itemId);
            
            // 设置数量
            gameItemIconComponent.setCount(count);
            
            console.log(`🎁 成功创建奖励图标: ${name} x${count}`);
        } else {
            console.error('[GameResult] GameItemIcon 组件未找到');
        }
    }

    /**
     * 更新奖励显示（服务端返回的真实奖励数据）
     * @param rewardData 服务端返回的奖励数据
     */
    private updateRewardDisplay(rewardData: StageRewardData): void {
        
        // 清空奖励容器
        if (this.rewardsContainer) {
            this.rewardsContainer.removeAllChildren();
        }
        
        // 处理服务端返回的奖励数据
        if (rewardData) {
            // 遍历所有奖励并创建图标
            for (const [key, value] of Object.entries(rewardData)) {
                if (value && value > 0) {
                    // 根据materialKey查找对应的道具配置
                    const itemConfig = gameItemConfigs.find(config => config.materialKey === key);
                    
                    if (itemConfig) {
                        this.createRewardIcon(itemConfig.id, value, itemConfig.name);
                        console.log(`🎁 创建奖励图标: ${itemConfig.name} x${value} (ID: ${itemConfig.id})`);
                    } else {
                        console.warn(`🎁 未找到materialKey为 "${key}" 的道具配置，跳过该奖励: ${value}`);
                    }
                }
            }
        }
    }



    onDestroy() {
    }
}

 
