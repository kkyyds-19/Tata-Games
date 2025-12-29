import { _decorator, Component, find, Node, Button, Label, ProgressBar, director, game, Vec2, Color, Sprite, SpriteFrame, sys, view, Widget } from 'cc';
import { ShowToast } from '../global/Toast';
import { Popup } from './Popup';
import { TimeManager } from './TimeManager';
import { GameManager } from './GameManager';
import { EffectContainer } from './EffectContainer';
import { BulletManager } from './BulletManager';
import { AnimationLoader } from './AnimationLoader';
import { DamageStatsManager } from './DamageStatsManager';
import { Custom2D_Collide_Manager } from '../Custom_Collide/Custom2D_Manager';
import { GamePause } from '../dialog/GamePause';
import { RewardedVideoAdManager } from '../wx/RewardedVideoAdManager';
import { DailyTaskHelper } from '../hall/daily_task/DailyTaskHelper';
import { VersionManager } from '../global/VersionManager';
import { Utils } from '../utils/Utils';
import { UIGameProgress } from './UIGameProgress';
import { StageType } from './stage/StageData';


const { ccclass, property } = _decorator;

@ccclass('UI_Frame_Top')
export class UI_Frame_Top extends Component {
    // 按钮节点
    @property(Button)
    private pauseButton: Button = null!; // 暂停按钮

    @property(Button)
    private autoButton: Button = null!; // 自动按钮

    @property(Button)
    private fastForwardButton: Button = null!; // 快进/倍速按钮

    // 标签属性
    @property(Label)
    private levelLabel: Label = null!; // 等级标签（如"0级"）

    @property(Label)
    private speedLabel: Label = null!; // 倍速标签（如"X1"）

    @property(Label)
    private timeLabel: Label = null!; // 时间标签（如"0:0"）

    // 经验进度条（exp_progress_bar）
    @property(ProgressBar)
    private expProgressBar: ProgressBar = null!; // 经验进度条组件

    /**击杀百分比标签（如"0%"） */
    private ui_game_progress: UIGameProgress[];

    // 平滑动画相关
    private _targetExpProgress: number = 0;
    private _currentExpProgress: number = 0;
    private _expLerpSpeed: number = 12; // 越大越快，建议 3~8

    // 添加计时器变量
    private _testTimer: number = 0;



    start() {
        const st = this;
        st.ui_game_progress = [
            st.node.getChildByPath("game_progress_0").getComponent(UIGameProgress),
            st.node.getChildByPath("game_progress_1").getComponent(UIGameProgress)
        ];

        // 初始化按钮事件监听
        st.initButtonEvents();
        st.updateExpBar(0, false);

        // 监听经验值更新消息
        st.initEventListeners();

        // 初始化自动按钮显示状态
        st.updateAutoButtonDisplay();

        st.adjustForNotch();

        // 根据关卡类型初始化击杀进度UI
        st.updateProgressUIByStageType();
    }

    /**
     * 根据关卡类型更新击杀进度UI的图标和标签
     */
    private updateProgressUIByStageType() {
        switch (game.myGlobal.stageType) {
            case StageType.Normal:
                this.updateKillIcon(0);
                this.updateKillLabel(1);
                break;
            case StageType.Dungeon:
                this.updateKillIcon(0);
                this.updateKillLabel(1);
                break;
            case StageType.Outland:
                this.updateKillIcon(0, "img/game/ui/left");
                this.updateKillIcon(1, "img/game/ui/right");
                break;
            case StageType.Arena:
            case StageType.Endless:
                this.updateKillIcon(0);
                this.updateKillLabel(1);
            default:
                this.updateKillIcon(0);
                this.updateKillLabel(1);
                break;
        }
    }

    private adjustForNotch() {
        if (!sys.isMobile) {
            return;
        }

        const widget = this.getComponent(Widget);
        if (!widget) {
            console.warn('[UI_Frame_Top] Widget component not found. Cannot adjust for notch.');
            return;
        }

        const safeArea = sys.getSafeAreaRect();
        const screenSize = view.getVisibleSize();

        const topInset = screenSize.height - safeArea.y - safeArea.height;

        if (topInset > 1) {
            widget.top = topInset;
            widget.updateAlignment();
            console.log(`[UI_Frame_Top] Notch detected. Added ${topInset} to widget.top. New value: ${widget.top}`);
        }
    }

    private initButtonEvents() {
        // 暂停按钮事件
        this.pauseButton.node.on(Button.EventType.CLICK, this.onPauseClick, this);

        // 自动按钮事件
        this.autoButton.node.on(Button.EventType.CLICK, this.onAutoClick, this);

        // 快进按钮事件
        this.fastForwardButton.node.on(Button.EventType.CLICK, this.onFastForwardClick, this);
    }

    private initEventListeners() {
        // 监听经验值更新事件
        director.on(game.gameEvent.GAME_EXP_UPDATE, this.onExpUpdate, this);
    }

    private test_level_up() {
        let curExp = game.myGlobal.currentExp;

        // 计算当前等级
        let currentLevel = Utils.getLevelFromTotalExp(curExp);

        // 计算当前等级内的经验进度
        const { currentLevelExp, requiredExpForLevel } = Utils.getCurrentLevelProgress(curExp, currentLevel);

        // 计算升到下一级所需的经验值
        const expNeeded = requiredExpForLevel - currentLevelExp + 1; // +1确保能升级

        console.log(`当前等级: ${currentLevel}, 当前经验: ${curExp}`);
        console.log(`当前等级内经验: ${currentLevelExp}/${requiredExpForLevel}`);
        console.log(`升级需要增加: ${expNeeded} 经验`);

        // 直接升级
        this.updateExpBar(expNeeded, true);
    }



    // 按钮点击事件处理
    private onPauseClick() {
        console.log('暂停按钮点击 - 结束游戏返回大厅');

        // if(director.isPaused()){
        //     director.resume();
        // }else{
        //     director.pause();
        // }

        const game_pause = find('Canvas/dialog_container/game_pause');
        if (game_pause) {
            const gamePause = game_pause.getComponent(GamePause);
            if (gamePause) {
                gamePause.showPause();
            }
        }
    }

    /**
     * 结束游戏并返回大厅
     */
    private endGameAndReturnToHall(): void {
        console.log('开始清理游戏状态...');

        try {
            // 1. 暂停时间管理器
            TimeManager.getInstance().pause();

            // 2. 清理GameManager
            const gameManager = GameManager.getInstance();
            if (gameManager) {
                gameManager.closeEventListeners();
            }

            // 2.1 清理LevelData
            game.myGlobal.currentExp = 0;


            // 3. 清理效果容器
            const effectContainer = EffectContainer.getInstance();
            if (effectContainer) {
                effectContainer.clearAllPools();
            }

            // 4. 清理子弹管理器
            const bulletManager = find('Canvas')?.getComponentInChildren(BulletManager);
            if (bulletManager) {
                bulletManager.clearAll();
            }

            // 5. 清理动画缓存
            AnimationLoader.clearAllCache();

            // 6. 清理所有定时器回调
            this.unscheduleAllCallbacks();

            // 7. 重置伤害统计
            const damageStatsManager = DamageStatsManager.getInstance();
            if (damageStatsManager) {
                damageStatsManager.reset();
            }

            // 8. 清理碰撞检测管理器
            const collideManager = Custom2D_Collide_Manager.instance;
            if (collideManager) {
                collideManager.enable = false;
            }

            console.log('游戏状态清理完成，切换到大厅场景');

        } catch (error) {
            console.error('清理游戏状态时出错:', error);
        }

        // 切换到大厅场景
        director.loadScene("hall");
    }

    private onAutoClick() {
        console.log('Auto button clicked');

        // 开启条件：第三档月卡激活（30天内）
        const key = 'MonthlyPass.purchaseTime.2';
        const last = parseInt(localStorage.getItem(key) || '0');
        const active = last > 0 && (Date.now() - last) < (30 * 24 * 60 * 60 * 1000);
        if (!active) {
            ShowToast('自动选卡需开通月卡');
            return;
        }

        if (game.myGlobal) {
            game.myGlobal.autoSelectSkill = !game.myGlobal.autoSelectSkill;
            const status = game.myGlobal.autoSelectSkill ? '开启' : '关闭';
            console.log(`自动选择技能: ${status}`);
            this.updateAutoButtonDisplay();
        }
    }

    private onFastForwardClick() {
        console.log('Fast forward button clicked');

        // 循环切换游戏速度：1x -> 2x -> 3x -> 1x
        TimeManager.getInstance().toggleSpeed();

        // 更新速度显示标签
        const speedText = TimeManager.getInstance().getSpeedText();
        this.updateSpeedLabel(speedText);

        console.log(`游戏速度切换到: ${speedText}`);
    }

    // 经验值更新事件处理
    private onExpUpdate(event: any) {
        const { exp, monsterId, monsterLevel } = event;
        // console.log(`UIFrameTop: 收到经验值更新 - 获得${exp}点经验 (怪物ID: ${monsterId}, 等级: ${monsterLevel})`);
        // 更新经验条和等级
        this.updateExpBar(exp, true);
    }


    // 平滑设置经验进度条目标值（0~1）
    public setExpProgressSmooth(target: number) {
        this._targetExpProgress = Math.max(0, Math.min(1, target));
    }

    // 立即设置经验进度条（无动画）
    public setExpProgressImmediate(value: number) {
        this._targetExpProgress = this._currentExpProgress = Math.max(0, Math.min(1, value));
        if (this.expProgressBar) {
            this.expProgressBar.progress = this._currentExpProgress;
        }
    }

    update(dt: number) {
        // 平滑过渡经验进度条
        if (Math.abs(this._currentExpProgress - this._targetExpProgress) > 0.001) {
            this._currentExpProgress = this._currentExpProgress + (this._targetExpProgress - this._currentExpProgress) * Math.min(1, this._expLerpSpeed * dt);
            if (this.expProgressBar) {
                this.expProgressBar.progress = this._currentExpProgress;
            }
        }

        // 实时更新速度显示
        this.updateSpeedDisplay();

        // 测试代码：每3秒增加100经验值
        // this._testTimer += dt;
        // if (this._testTimer >= 3) {
        //     this._testTimer = 0; // 重置计时器
        //     this.updateExpBar(100, true);
        // }
    }

    /**
     * 更新速度显示（包括文本和颜色）
     */
    private updateSpeedDisplay() {
        if (!this.speedLabel) return;

        const timeManager = TimeManager.getInstance();
        const speedText = timeManager.getSpeedText();
        const speedColor = timeManager.getSpeedColor();

        // 更新文本
        this.speedLabel.string = speedText;

        // 更新颜色
        const color = new Color();
        color.fromHEX(speedColor);
        this.speedLabel.color = color;
    }

    /**
     * 更新自动按钮显示状态
     */
    private updateAutoButtonDisplay() {
        if (!this.autoButton || !game.myGlobal) return;

        // 根据自动选择状态改变按钮透明度或颜色
        const isAutoEnabled = game.myGlobal.autoSelectSkill;

        // 只使用颜色来表示状态，不设置透明度

        // 你也可以在这里添加其他视觉反馈，比如改变颜色
        const color = new Color();
        if (isAutoEnabled) {
            color.fromHEX('#00FF00'); // 绿色表示激活
        } else {
            color.fromHEX('#FFFFFF'); // 白色表示未激活
        }

        // 如果按钮有Sprite组件，可以改变颜色
        const sprite = this.autoButton.getComponent(Sprite);
        if (sprite) {
            sprite.color = color;
        }
        // const lock =this.autoButton.node.getChildByName('b_8')
        // if(lock){
        //     lock.active=isAutoEnabled
        // }
    }

    // 更新标签文本
    public updateLevelLabel(text: string) {
        if (this.levelLabel) {
            this.levelLabel.string = text;
        }
    }

    public updateSpeedLabel(text: string) {
        if (this.speedLabel) {
            this.speedLabel.string = text;
        }
    }

    public updateTimeLabel(text: string) {
        if (this.timeLabel) {
            this.timeLabel.string = text;
        }
    }

    public updateKillLabel(index: number, text?: string) {
        this.ui_game_progress[index]?.setData(text);
    }

    public updateKillIcon(index: number, icon?: string) {
        this.ui_game_progress[index]?.setIcon(icon);
    }

    /**
     * 获取当前关卡配置
     * @returns 关卡配置对象，包含经验相关设置
     */
    private getCurrentStageConfig(): { exp_per_level: number; enable_monster_exp: boolean } {
        const currentStage = game.myGlobal.currentStage;
        return VersionManager.getInstance().getStageRule(currentStage);
    }



    /**
     * 更新经验条和等级（使用梯度经验系统）
     * @param exp 新增经验值
     * @param animated 是否动画
     */
    public updateExpBar(exp: number, animated: boolean = true) {
        let curExp = game.myGlobal.currentExp;

        //NOTE 如果是异域暂时变为4倍经验
        // if (game.myGlobal.stageType == StageType.Outland) {
            exp *= 4;
        // }

        // 计算当前等级（升级前）
        let oldLevel = Utils.getLevelFromTotalExp(curExp);

        // 计算新的总经验和新等级
        let totalExp = curExp + exp;
        let newLevel = Utils.getLevelFromTotalExp(totalExp);

        // 计算当前等级内的经验条进度
        const { currentLevelExp, requiredExpForLevel } = Utils.getCurrentLevelProgress(totalExp, newLevel);
        let progress = Math.max(0, Math.min(1, currentLevelExp / requiredExpForLevel));

        // 更新 LevelData
        game.myGlobal.currentExp = totalExp;

        // 更新等级标签
        this.updateLevelLabel(`${newLevel}级`);

        // 更新经验条
        if (animated) {
            this.setExpProgressSmooth(progress);
        } else {
            this.setExpProgressImmediate(progress);
        }

        // 升级检测
        if (newLevel > oldLevel) {
            console.log(`玩家升级: ${oldLevel} -> ${newLevel} (经验: ${curExp} -> ${totalExp})`);
            console.log(`当前等级 ${newLevel} 内经验: ${currentLevelExp}/${requiredExpForLevel} (${(progress * 100).toFixed(1)}%)`);
            // 发送全局升级消息
            director.emit(game.gameEvent.GAME_LEVEL_UP, { oldLevel, newLevel });
        }
    }

    onDestroy() {
        // 移除事件监听
        director.off(game.gameEvent.GAME_EXP_UPDATE, this.onExpUpdate, this);
    }
} 
