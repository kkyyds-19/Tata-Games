import { _decorator, Component, Node, Label, ProgressBar, Sprite, Button } from 'cc';
import { UserInfoData } from '../user/UserInfoData';
import { director } from 'cc';
import { game } from 'cc';
import { ShowToast } from '../global/Toast';
import { staminaAPI } from '../api/API';
import { SmartLoginManager } from '../welcome/SmartLoginManager';
const { ccclass, property } = _decorator;

/**
 * 用户信息面板组件
 * 显示用户头像、等级、昵称、战斗力、经验条、钻石、体力、金币等信息
 */
@ccclass('UserInfoPanel')
export class UserInfoPanel extends Component {

    // === 用户基本信息 ===
    @property(Sprite)
    avatarSprite: Sprite = null;

    @property(Label)
    levelLabel: Label = null;

    @property(Label)
    nicknameLabel: Label = null;

    @property(Label)
    combatPowerLabel: Label = null;

    // === 经验进度条 ===
    @property(ProgressBar)
    expProgressBar: ProgressBar = null;

    // === 资源信息 ===
    @property(Label)
    diamondLabel: Label = null;

    @property(Label)
    staminaLabel: Label = null;

    @property(Label)
    goldLabel: Label = null;

    @property(Button)
    buyStaminaButton: Button = null;

    // 私有属性
    private _userInfoData: UserInfoData = null;
    private _updateTimer: number = 0;
    private _updateInterval: number = 1.0; // 每秒更新一次

    onLoad() {
        this._userInfoData = UserInfoData.getInstance();
    }

    start() {
        this.updateAllInfo()
        director.on(game.gameEvent.HALL_USER_INFO_UPDATE, this.refreshUserInfo, this);
        if (this.buyStaminaButton) {
            this.buyStaminaButton.node.on(Button.EventType.CLICK, this.onBuyStaminaClicked, this);
        }
    }

    onDestroy() {
        director.off(game.gameEvent.HALL_USER_INFO_UPDATE, this.refreshUserInfo, this);
        try {
            const btn = this.buyStaminaButton;
            const node = btn && btn.node;
            if (node && (node as any).isValid !== false) {
                node.off(Button.EventType.CLICK, this.onBuyStaminaClicked, this);
            }
        } catch {}
    }


    update(deltaTime: number) {
        // 定时更新用户信息
        this._updateTimer += deltaTime;
        if (this._updateTimer >= this._updateInterval) {
            this._updateTimer = 0;
            this.updateResourceInfo(); // 只更新资源信息，减少性能消耗
        }
    }

    /**
     * 更新所有用户信息
     */
    public updateAllInfo(): void {
        this.updateBasicInfo();
        this.updateExpInfo();
        this.updateResourceInfo();
    }

    /**
     * 更新基本信息（头像、等级、昵称、战斗力）
     */
    private updateBasicInfo(): void {
        if (!this._userInfoData) return;

        // 更新头像
        this.updateAvatar(this._userInfoData.getAvatar());

        // 更新等级
        if (this.levelLabel) {
            this.levelLabel.string = `${this._userInfoData.getLevel()}`;
        }

        // 更新昵称
        if (this.nicknameLabel) {
            this.nicknameLabel.string = this._userInfoData.getNickname();
        }

        // 更新战斗力
        if (this.combatPowerLabel) {
            this.combatPowerLabel.string = this.formatNumber(this._userInfoData.getCombatPower());
        }
    }

    /**
     * 更新经验信息
     */
    private updateExpInfo(): void {
        if (!this._userInfoData) return;

        const currentExp = this._userInfoData.getExp();
        const maxExp = this._userInfoData.getMaxExp();
        const expProgress = maxExp > 0 ? currentExp / maxExp : 0;

        // 更新经验进度条
        if (this.expProgressBar) {
            this.expProgressBar.progress = expProgress;
        }

       
    }

    /**
     * 更新资源信息（钻石、体力、金币）
     */
    private updateResourceInfo(): void {
        if (!this._userInfoData) return;

        // 更新钻石
        if (this.diamondLabel) {
            this.diamondLabel.string = this.formatNumber(this._userInfoData.getDiamond());
        }

        // 更新体力
        if (this.staminaLabel) {
            const currentStamina = this._userInfoData.getStamina();
            const maxStamina = this._userInfoData.getMaxStamina();
            this.staminaLabel.string = `${currentStamina}/${maxStamina}`;
        }

        // 更新金币
        if (this.goldLabel) {
            this.goldLabel.string = this.formatNumber(this._userInfoData.getGold());
        }
    }

    /**
     * 更新头像
     * @param avatar 头像
     */
    private updateAvatar(avatar: string): void {
        if (!this.avatarSprite) return;
        
        const  spriteFrameName = avatar
        const  spriteFrame = this.avatarSprite.spriteAtlas.getSpriteFrame(spriteFrameName)
        if(spriteFrame){
            this.avatarSprite.spriteFrame = spriteFrame
        }


        // console.log(`更新头像: ${avatar}`);
    }

    /**
     * 格式化数字显示（添加千分位分隔符或使用K、M等单位）
     * @param num 要格式化的数字
     * @returns 格式化后的字符串
     */
    private formatNumber(num: number): string {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        } else {
            return num.toString();
        }
    }

    /**
     * 手动刷新用户信息（供外部调用）
     */
    public refreshUserInfo(): void {
        this.updateAllInfo();
    }

    /**
     * 设置头像并更新显示
     * @param avatar 新的头像
     */
    public setAvatar(avatar: string): void {
        if (this._userInfoData) {
            this._userInfoData.setAvatar(avatar);
            this.updateAvatar(avatar);
        }
    }

    /**
     * 设置头像ID并更新显示（兼容性方法）
     * @param avatarId 新的头像ID
     */
    public setAvatarId(avatarId: string): void {
        if (this._userInfoData) {
            this._userInfoData.setAvatarId(avatarId);
            this.updateAvatar(avatarId);
        }
    }

    /**
     * 设置昵称并更新显示
     * @param nickname 新的昵称
     */
    public setNickname(nickname: string): void {
        if (this._userInfoData) {
            this._userInfoData.setNickname(nickname);
            if (this.nicknameLabel) {
                this.nicknameLabel.string = nickname;
            }
        }
    }

    private async onBuyStaminaClicked() {
        try {
            const info = await staminaAPI.getPurchaseInfo();
            const list = (info && info.data) ? info.data : [];
            const diamondOption = list.find((x: any) => x && x.type === 1);
            if (!diamondOption) {
                ShowToast('暂无钻石购买选项');
                return;
            }
            if (diamondOption.remaining <= 0) {
                ShowToast('今日购买次数已用完');
                return;
            }
            const diamond = this._userInfoData?.getDiamond() ?? 0;
            if (diamond < (diamondOption.cost ?? 0)) {
                ShowToast('钻石不足');
                return;
            }
            await staminaAPI.purchaseStamina(diamondOption.id);
            const login = SmartLoginManager.getInstance();
            login.getUserInfo().catch(() => {});
            this.updateResourceInfo();
            ShowToast(`购买成功，获得${diamondOption.stamina}点体力`);
        } catch (e) {
            ShowToast('购买失败，请重试');
        }
    }

    /**
     * 添加经验并更新显示
     * @param exp 要添加的经验值
     */
    public addExp(exp: number): void {
        if (this._userInfoData) {
            this._userInfoData.addExp(exp);
            this.updateBasicInfo(); // 可能升级了，需要更新等级
            this.updateExpInfo();
        }
    }

    /**
     * 添加钻石并更新显示
     * @param diamond 要添加的钻石数量
     */
    public addDiamond(diamond: number): void {
        if (this._userInfoData) {
            this._userInfoData.addDiamond(diamond);
            this.updateResourceInfo();
        }
    }

    /**
     * 消耗钻石并更新显示
     * @param diamond 要消耗的钻石数量
     * @returns 是否消耗成功
     */
    public consumeDiamond(diamond: number): boolean {
        if (this._userInfoData) {
            const success = this._userInfoData.consumeDiamond(diamond);
            if (success) {
                this.updateResourceInfo();
            }
            return success;
        }
        return false;
    }

    /**
     * 添加体力并更新显示
     * @param stamina 要添加的体力值
     */
    public addStamina(stamina: number): void {
        if (this._userInfoData) {
            this._userInfoData.addStamina(stamina);
            this.updateResourceInfo();
        }
    }

    /**
     * 消耗体力并更新显示
     * @param stamina 要消耗的体力值
     * @returns 是否消耗成功
     */
    public consumeStamina(stamina: number): boolean {
        if (this._userInfoData) {
            const success = this._userInfoData.consumeStamina(stamina);
            if (success) {
                this.updateResourceInfo();
            }
            return success;
        }
        return false;
    }

    /**
     * 添加金币并更新显示
     * @param gold 要添加的金币数量
     */
    public addGold(gold: number): void {
        if (this._userInfoData) {
            this._userInfoData.addGold(gold);
            this.updateResourceInfo();
        }
    }

    public testAddGold(): void {
        // this.addGold(10000);
    }   

    /**
     * 消耗金币并更新显示
     * @param gold 要消耗的金币数量
     * @returns 是否消耗成功
     */
    public consumeGold(gold: number): boolean {
        if (this._userInfoData) {
            const success = this._userInfoData.consumeGold(gold);
            if (success) {
                this.updateResourceInfo();
            }
            return success;
        }
        return false;
    }

    /**
     * 获取当前用户信息摘要
     */
    public getUserInfoSummary(): string {
        if (!this._userInfoData) return '';
        
        return `昵称: ${this._userInfoData.getNickname()} | ` +
               `等级: ${this._userInfoData.getLevel()} | ` +
               `战斗力: ${this.formatNumber(this._userInfoData.getCombatPower())} | ` +
               `金币: ${this.formatNumber(this._userInfoData.getGold())} | ` +
               `钻石: ${this.formatNumber(this._userInfoData.getDiamond())} | ` +
               `体力: ${this._userInfoData.getStamina()}/${this._userInfoData.getMaxStamina()}`;
    }

   
}