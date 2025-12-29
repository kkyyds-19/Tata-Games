import { _decorator, Component, Node, Label, Sprite, resources, director, SpriteAtlas, Button } from 'cc';
import { game } from 'cc';
import { MusicManager } from '../../music/MusicManager';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { Hall } from '../hall';
import { UserInfoData } from '../../user/UserInfoData';
import { UserHomeData } from '../../user/UserHomeData';

const { ccclass, property } = _decorator;
@ccclass('PkItem1')
export class PkItem1 extends Component {
     // === 用户信息显示 ===
     @property({ type: Sprite, tooltip: "段位Sprite" })
    public Rank: Sprite = null;

    @property({ type: Sprite, tooltip: "头像显示" })
    public avatarSprite: Sprite = null;

    @property({ type: Label, tooltip: "昵称显示" })
    public nicknameLabel: Label = null;

    
    @property({ type: Label, tooltip: "战斗力数值显示" })
    public combatPowerLabel: Label = null;

    @property({ type: Label, tooltip: "荣誉积分显示" })
    public honorLabel: Label = null;
    
    @property({ type: Label, tooltip: "排名显示" })
    public rankLabel: Label = null;

    // 为兼容 Cocos Inspector 字段名“Ranking”，增加别名属性
    @property({ type: Label, tooltip: "排名显示（别名：Ranking）" })
    public Ranking: Label = null;
    
    @property({ type: SpriteAtlas, tooltip: "PK图集" })
    public pkAtlas: SpriteAtlas = null;

    // 预设显示：可在预制体属性面板里直接设置，用于插入排序与显示
    @property({ tooltip: "用于插入排序的预设战力（数值）" })
    public presetCombatPower: number = 0;

    @property({ tooltip: "用于显示的预设昵称（不填则使用用户数据）" })
    public presetNickname: string = "";

    private pk_idx:number = -1;
    private m_rarity: number = -1;
    private m_callback: (sender: any) => void = null;
    private hallInstance: Hall = null;
    private _userInfoData: UserInfoData = null;
    // 防重复点击：避免一次点击触发多次切换
    private _isNavigating: boolean = false;

    // 覆盖显示（用于排行榜插入时按战力与昵称显示，而非用户全局信息）
    private combatPowerOverride: number = 0;
    private nicknameOverride: string = "";
    private honorValue: number = 0;

    public getUserCombatPower(): number {
        if (!this._userInfoData) this._userInfoData = UserInfoData.getInstance();
        return this._userInfoData.getCombatPower() || 0;
    }

    public getUserNickname(): string {
        if (!this._userInfoData) this._userInfoData = UserInfoData.getInstance();
        return this._userInfoData.getNickname() || "玩家";
    }
     
    /**
     * 初始化PkItem
     * @param idx 索引
     * @param rarity 稀有度
     * @param hallInstance Hall实例
     * @param callback 回调函数
     */
    public init(idx: number, rarity: number, hallInstance: Hall, callback: (sender: any) => void) {
        this.pk_idx = idx;
        this.m_rarity = rarity;
        this.hallInstance = hallInstance;
        this.m_callback = callback;
        this._userInfoData = UserInfoData.getInstance();
        this.updateTitle(idx, rarity);
        this.updateCombatPowerDisplay();
        this.updateAllCombatPowerInfo(); // 添加完整的战力信息更新
        this.updateAllUserInfo(); // 添加完整的用户信息更新（头像、昵称、战力）
   
        this.node.active = true;
        this.syncHonorFromUserInfo();
    }

    /**
     * 带覆盖值的初始化：用于排行榜按战力插入时，自定义显示战力与昵称
     */
    public initWithPowerAndName(idx: number, rarity: number, hallInstance: Hall, power: number, nickname: string, originalPresetName: string, callback: (sender: any) => void) {
        this.pk_idx = idx;
        this.m_rarity = rarity;
        this.hallInstance = hallInstance;
        this.m_callback = callback;
        this._userInfoData = UserInfoData.getInstance();
        
        // 强制使用传入的战力和昵称进行覆盖显示
        this.nicknameOverride = nickname || "玩家";
        this.combatPowerOverride = power || 0;

        this.updateTitle(idx, rarity);
        this.updateAllUserInfo();
        this.node.active = true;
        this.syncHonorFromUserInfo();
    }

    /**
     * 更新标题显示
     */
    private updateTitle(count: number, skinIds: number) {
        this.updateRank(skinIds);
        this.updateProfile(skinIds);
        this.updateName(skinIds);
        this.updateCombatPower(skinIds);
    }

    /**
     * 更新段位显示
     */
    private updateRank(skinIds: number) {
        if (!this.Rank || !this.pkAtlas) {
            console.warn("[PkItem] 段位Sprite或图集未设置");
            return;
        }

        let frameName = "pk_8"; // 段位牌子
        
        
        const spriteFrame = this.pkAtlas.getSpriteFrame(frameName);
        if (spriteFrame) {
            this.Rank.spriteFrame = spriteFrame;
        } else {
            console.warn(`[PkItem] 在图集中未找到段位图片: ${frameName}`);
        }
    }

    /**
     * 更新头像显示
     */
    private updateProfile(skinIds: number) {
        // 这个方法主要用于更新用户的头像显示
        // 直接调用updateAvatarDisplay来处理头像更新逻辑
        this.updateAvatarDisplay();
    }

    /**
     * 更新名字显示
     */
    private updateName(skinIds: number) {
      

        let frameName = "pk_6"; // 默认名字
        
        
        const spriteFrame = this.pkAtlas.getSpriteFrame(frameName);
       

        // 更新昵称文本显示
        this.updateNicknameDisplay();
    }

    /**
     * 更新战力显示
     */
    private updateCombatPower(skinIds: number) {
    

        let frameName = "pk_1"; // 默认战力图标
        frameName = "pk_1";
    
        const spriteFrame = this.pkAtlas.getSpriteFrame(frameName);
       
    }

    //开始进入游戏/切换界面
    /**
     * 点击按钮：切换到军团界面（ArmyPanel）
     */
    private onStartClick(){
        if (this._isNavigating) {
            return;
        }
        this._isNavigating = true;
        console.warn("切换到军团界面", this.pk_idx);

        try {
            // 通过导航事件切换到 ArmyPanel（index = 3）
            director.emit(game.gameEvent.HALL_NAV_BUTTON_CLICK, 3);
        } catch (e) {
            console.warn('[PkItem1] 切换到军团界面失败', e);
        } finally {
            // 允许300ms后再次点击，避免快速连击触发两次
            setTimeout(() => { this._isNavigating = false; }, 300);
        }
    }

    /**
     * 更新所有战力信息（图标和数值）
     */
    public updateAllCombatPowerInfo(): void {
        if (!this._userInfoData) return;

        // 更新战力图标
        this.updateCombatPowerIcon();
        
        // 更新战力数值显示
        this.updateCombatPowerDisplay();

        // 同步荣誉积分显示（复用当前数值管道）
        this.updateHonorDisplay();
    }

    /**
     * 更新战力图标显示
     */
    private updateCombatPowerIcon(): void {
      

        let frameName = "pk_1"; // 战力图标
        const spriteFrame = this.pkAtlas.getSpriteFrame(frameName);
       
    }

    /**
     * 更新战斗力显示
     */
    public updateCombatPowerDisplay(): void {
        // 优先顺序：覆盖值 > 预设值 > 预制体Label文本 > 用户数据
        const fromOverride = this.combatPowerOverride && this.combatPowerOverride > 0 ? this.combatPowerOverride : 0;
        const fromPreset = !fromOverride && this.presetCombatPower && this.presetCombatPower > 0 ? this.presetCombatPower : 0;

        // 获取目标 Label：优先已绑定，其次自动匹配（包含 power/combat/atk/fight 的节点）
        let targetLabel: Label = this.combatPowerLabel;
        if (!targetLabel) {
            const labels = this.node.getComponentsInChildren(Label);
            targetLabel = labels.find(l => {
                const n = l.node.name.toLowerCase();
                return n.includes('power') || n.includes('combat') || n.includes('atk') || n.includes('fight');
            }) || null;
        }

        // 若已有Label文本（如 ×35.9K），则解析为数值优先使用
        let fromLabel = 0;
        if (!fromOverride && !fromPreset && targetLabel && targetLabel.string) {
            fromLabel = this.parsePowerText(targetLabel.string);
        }

        const fromUser = (!fromOverride && !fromPreset && !fromLabel && this._userInfoData) ? this._userInfoData.getCombatPower() : 0;

        const combatPower = fromOverride || fromPreset || fromLabel || fromUser || 0;

        if (targetLabel) {
            targetLabel.string = this.formatNumber(combatPower);
        }
    }

    /**
     * 更新荣誉积分显示（与战力同源，现映射为 integral）
     */
    public updateHonorDisplay(): void {
        let targetLabel: Label = this.honorLabel;
        if (!targetLabel) {
            const labels = this.node.getComponentsInChildren(Label);
            targetLabel = labels.find(l => {
                const n = l.node.name.toLowerCase();
                return n.includes('honor') || n.includes('honour') || n.includes('integral') || n.includes('points') || n.includes('score') || n.includes('积分');
            }) || null;
        }
        const val = Number(this.honorValue) || 0;
        if (targetLabel) {
            targetLabel.string = val.toString();
            console.log(`[PkItem1] 荣誉积分显示: ${val} label=${targetLabel.node.name}`);
        } else {
            console.warn('[PkItem1] 未找到用于显示荣誉积分的Label');
        }
    }

    public setHonorValue(value: number): void {
        const n = Number(value);
        this.honorValue = isFinite(n) ? n : 0;
        this.refreshHonor();
    }

    public refreshHonor(): void {
        let targetLabel: Label = this.honorLabel;
        if (!targetLabel) {
            const labels = this.node.getComponentsInChildren(Label);
            targetLabel = labels.find(l => {
                const n = l.node.name.toLowerCase();
                return n.includes('honor') || n.includes('honour') || n.includes('integral') || n.includes('points') || n.includes('score') || n.includes('积分');
            }) || null;
        }
        const val = Number(this.honorValue) || 0;
        if (targetLabel) {
            targetLabel.string = val.toString();
            console.log(`[PkItem1] 刷新荣誉积分: ${val} label=${targetLabel.node.name}`);
        } else {
            console.warn('[PkItem1] 刷新荣誉积分失败：未找到Label');
        }
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

    // 解析战力文本，如 "×35.9K" / "35.9K" / "1.2M" / "35100"
    private parsePowerText(text: string): number {
        if (!text) return 0;
        const cleaned = String(text).toUpperCase().replace(/[^0-9KM\.]/g, '');
        if (!cleaned) return 0;
        const unitMatch = /[KM]$/.exec(cleaned);
        const unit = unitMatch ? unitMatch[0] : '';
        const numStr = unit ? cleaned.slice(0, -1) : cleaned;
        const val = parseFloat(numStr);
        if (isNaN(val)) return 0;
        if (unit === 'M') return Math.round(val * 1_000_000);
        if (unit === 'K') return Math.round(val * 1_000);
        return Math.round(val);
    }

    /**
     * 手动刷新战斗力显示（供外部调用）
     */
    public refreshCombatPower(): void {
        this.updateAllUserInfo(); // 刷新所有用户信息（头像、昵称、战力）
    }

    private onUserInfoUpdate(): void {
        this.refreshCombatPower();
        this.syncHonorFromUserInfo();
    }

    private syncHonorFromUserInfo(): void {
        const home = UserHomeData.getInstance().getHomeInfo();
        let honor = 0;
        if (home && typeof (home as any).integral === 'number') {
            honor = (home as any).integral;
            console.log(`[PkItem1] 从后端 integral 读取荣誉积分: ${honor}`);
        } else if (home && typeof (home as any).honorPoints === 'number') {
            honor = (home as any).honorPoints;
            console.log(`[PkItem1] 从后端 honorPoints 读取荣誉积分: ${honor}`);
        } else {
            const ui = UserInfoData.getInstance();
            honor = Number(ui.getHonor()) || 0;
            console.log(`[PkItem1] 后端缺失，使用本地用户荣誉积分: ${honor}`);
        }
        this.honorValue = Number(honor) || 0;
        this.refreshHonor();
    }

    /**
     * 获取当前战斗力值
     * @returns 当前战斗力数值
     */
    public getCurrentCombatPower(): number {
        return this._userInfoData ? this._userInfoData.getCombatPower() : 0;
    }
    /**
     * 头像映射表：将用户头像数据映射到pkAtlas中的图片帧
     */
    private getAvatarFrameName(avatar: string): string {
        // 头像映射表
        const avatarMap: { [key: string]: string } = {
            "avatar_default": "pk_5",
            "avatar_1": "pk_1",
            "avatar_2": "pk_2", 
            "avatar_3": "pk_3",
            "avatar_4": "pk_4",
            "avatar_5": "pk_5",
            "avatar_6": "pk_6",
            "avatar_7": "pk_7",
            "avatar_8": "pk_8",
            "avatar_9": "pk_9",
            "pk_1": "pk_1",  // 直接映射
            "pk_2": "pk_2",
            "pk_3": "pk_3",
            "pk_4": "pk_4",
            "pk_5": "pk_5",
            "pk_6": "pk_6",
            "pk_7": "pk_7",
            "pk_8": "pk_8",
            "pk_9": "pk_9"
        };

        // 如果在映射表中找到，返回对应的图片帧名
        if (avatarMap[avatar]) {
            return avatarMap[avatar];
        }

        // 如果是数字格式的头像ID，尝试映射到pk_x
        const avatarId = parseInt(avatar);
        if (!isNaN(avatarId) && avatarId >= 1 && avatarId <= 37) {
            return `pk_${avatarId}`;
        }

        // 默认返回pk_5
        return "pk_5";
    }

    /**
     * 更新头像显示（仿照UserInfoPanel实现）
     */
    private updateAvatarDisplay(): void {
        if (!this._userInfoData) {
            console.warn("[PkItem] UserInfoData 未初始化");
            return;
        }
        
        const avatar = this._userInfoData.getAvatar();
        console.log(`[PkItem] 获取到的头像数据: ${avatar}`);
        
        // 更新头像Sprite（使用pkAtlas获取头像图片）
        if (this.avatarSprite && this.pkAtlas) {
            // 通过映射表获取对应的图集帧名
            const spriteFrameName = this.getAvatarFrameName(avatar);
            
            console.log(`[PkItem] 映射后的头像图片: ${spriteFrameName}`);
            
            const spriteFrame = this.pkAtlas.getSpriteFrame(spriteFrameName);
            if (spriteFrame) {
                this.avatarSprite.spriteFrame = spriteFrame;
                console.log(`[PkItem] 头像设置成功: ${spriteFrameName}`);
            } else {
                console.warn(`[PkItem] 在图集中未找到头像图片: ${spriteFrameName}`);
                // 尝试使用默认头像
                const defaultFrame = this.pkAtlas.getSpriteFrame("pk_5");
                if (defaultFrame) {
                    this.avatarSprite.spriteFrame = defaultFrame;
                    console.log(`[PkItem] 使用默认头像: pk_5`);
                } else {
                    console.error(`[PkItem] 连默认头像 pk_5 也未找到！`);
                }
            }
        } else {
            if (!this.avatarSprite) console.warn("[PkItem] avatarSprite 未设置");
            if (!this.pkAtlas) console.warn("[PkItem] pkAtlas 未设置");
        }
    }

    /**
     * 更新昵称文本显示
     */
    private updateNicknameDisplay(): void {
        // 优先顺序：覆盖值 > 预设值 > 用户数据 > 现有标签文本
        let nickname = "玩家";
        if (this.nicknameOverride && this.nicknameOverride.length > 0) {
            nickname = this.nicknameOverride;
        } else if (this.presetNickname && this.presetNickname.length > 0) {
            nickname = this.presetNickname;
        } else if (this._userInfoData) {
            nickname = this._userInfoData.getNickname();
        } else if (this.nicknameLabel && this.nicknameLabel.string && this.nicknameLabel.string.length > 0) {
            nickname = this.nicknameLabel.string;
        }

        // 获取目标 Label：优先已绑定，其次自动匹配（包含 name/nick/昵称 的节点）
        let targetLabel: Label = this.nicknameLabel;
        if (!targetLabel) {
            const labels = this.node.getComponentsInChildren(Label);
            targetLabel = labels.find(l => {
                const n = l.node.name.toLowerCase();
                return n.includes('name') || n.includes('nick') || n.includes('昵称');
            }) || null;
        }

        if (targetLabel) {
            targetLabel.string = nickname || "玩家";
        }
    }

    /**
     * 更新所有用户基本信息（头像、昵称、战力）
     */
    public updateAllUserInfo(): void {
        if (!this._userInfoData) return;

        // 更新头像显示
        this.updateAvatarDisplay();
        
        // 更新昵称显示
        this.updateNicknameDisplay();
        
        // 更新战力显示
        this.updateAllCombatPowerInfo();
    }

    /**
     * 设置头像并更新显示（仿照UserInfoPanel）
     * @param avatar 新的头像
     */
    public setAvatar(avatar: string): void {
        if (this._userInfoData) {
            this._userInfoData.setAvatar(avatar);
            this.updateAvatarDisplay();
        }
    }

    /**
     * 设置昵称并更新显示（仿照UserInfoPanel）
     * @param nickname 新的昵称
     */
    public setNickname(nickname: string): void {
        if (this._userInfoData) {
            this._userInfoData.setNickname(nickname);
            this.updateNicknameDisplay();
        }
    }

    onLoad() {
        this._userInfoData = UserInfoData.getInstance();
        this.setupButtonEvents();
    }

    /**
     * 设置按钮点击事件
     */
    private setupButtonEvents(): void {
        // 查找所有子节点中的Button组件
        const buttons = this.node.getComponentsInChildren(Button);
        console.log(`[PkItem1] 找到 ${buttons.length} 个按钮组件`);
        
        // 移除旧的点击事件监听，避免重复绑定
        buttons.forEach(button => {
            button.node.off(Button.EventType.CLICK, this.onStartClick, this);
        });
        
        // 绑定新的点击事件
        buttons.forEach(button => {
            button.node.on(Button.EventType.CLICK, this.onStartClick, this);
            console.log(`[PkItem1] 绑定点击事件到按钮: ${button.node.name}`);
        });
        
        if (buttons.length === 0) {
            console.warn('[PkItem1] 未找到任何按钮组件，请检查预制体结构');
        }
    }

    private testButtonClick() {
        // 添加一个测试按钮来验证点击功能
        const testButton = this.node.getChildByName('btn_start');
        if (testButton) {
            console.log(`[PkItem1] 找到测试按钮: ${testButton.name}`);
            // 模拟点击事件
            setTimeout(() => {
                console.log(`[PkItem1] 模拟按钮点击`);
                this.onStartClick();
            }, 1000);
        } else {
            console.warn(`[PkItem1] 未找到测试按钮 btn_start`);
        }
    }

    start() {
        director.on(game.gameEvent.HALL_USER_INFO_UPDATE, this.onUserInfoUpdate, this);
        this.syncHonorFromUserInfo();
    }

    onDestroy() {
        director.off(game.gameEvent.HALL_USER_INFO_UPDATE, this.onUserInfoUpdate, this);
    }

    /**
     * 更新排名显示（小到大：idx+1）
     * @param rank 排名数值
     */
    public updateRankLabel(rank: number): void {
        // 优先使用显式绑定（rankLabel 或别名 Ranking）
        const boundLabel = this.rankLabel || this.Ranking;
        // 若未在编辑器绑定，则动态创建一个Label
        if (!boundLabel) {
            const rankNode = new Node('RankLabel');
            const labelComp = rankNode.addComponent(Label);
            labelComp.string = rank.toString();
            labelComp.fontSize = 70;
            labelComp.lineHeight = 70;
            // 默认放到节点左上角附近，避免遮挡原UI（可按需微调）
            rankNode.setPosition(430, 90, 0);
            this.node.addChild(rankNode);
            // 同步到两个属性，便于后续使用
            this.rankLabel = labelComp;
            this.Ranking = labelComp;
        } else {
            boundLabel.string = rank.toString();
        }
    }
}