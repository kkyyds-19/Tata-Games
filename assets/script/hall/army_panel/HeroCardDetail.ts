import { _decorator, Component, Node, Label, Sprite, Button, EventTouch } from 'cc';
import { HeroCard } from './HeroCard';
import { SimpleHeroCard } from '../SimpleHeroCard';
import { director } from 'cc';
import { game } from 'cc';
import { UserArmyData, CardData } from '../../user/UserArmyData';
import { UserClassData, ClassData } from '../../user/UserClassData';
import { ResourceConfig } from '../../global/config/ResourceConfig';
import { Utils } from '../../utils/Utils';
import { UserInfoData } from '../../user/UserInfoData';
import { sys } from 'cc';
import { myHeroAPI } from '../../api/MyHeroAPI';
import { ShowToast } from '../../global/Toast';

const { ccclass, property } = _decorator;

@ccclass('HeroCardDetail')
export class HeroCardDetail extends Component {
    
    @property(Node)
    mark: Node = null;
    
    @property(Label)
    heroName: Label = null;
    
    @property(Label)
    attackType: Label = null;
    
    @property(Sprite)
    attackTypeIcon: Sprite = null;
    
    @property(HeroCard)
    hero: HeroCard = null;
    
    @property(Label)
    attack: Label = null;
    
    @property(Label)
    health: Label = null;
    
    @property(Label)
    combatPower: Label = null;
    
    @property(Label)
    heroDescription: Label = null;
    
    @property(Label)
    attributeDescription: Label = null;
    
    @property(SimpleHeroCard)
    bondHeroPanel1: SimpleHeroCard = null;
    
    @property(SimpleHeroCard)
    bondHeroPanel2: SimpleHeroCard = null;
    
    @property(Label)
    heroBondDescription: Label = null;
    
    @property(Sprite)
    upgradeItemIcon: Sprite = null;
    
    @property(Label)
    upgradeItemCount: Label = null;
    
    @property(Label)
    upgradeGoldCost: Label = null;
    
    @property(Button)
    upgradeButton: Button = null;
    
    @property(Button)
    deployButton: Button = null;

    // 数据管理器
    private userArmyData: UserArmyData = null;
    private userClassData: UserClassData = null;
    
    // 当前显示的卡片数据
    private currentCardData: CardData = null;
    private currentClassData: ClassData = null;

    private hero_data: any = null;

    // 上阵状态控制
    private isDeploying: boolean = false;
    private isUpgrading: boolean = false;

    // 服务端数据（从API获取）
    private _serverData: any = null;

    // 防重复调用机制
    private _isShowing: boolean = false;
    private _lastShowCardId: string = null;
    private _isRequesting: boolean = false;

    onLoad() {
        // 获取数据管理器实例
        this.userArmyData = UserArmyData.getInstance();
        this.userClassData = UserClassData.getInstance();


       
    }

    start() {

        if (this.heroName) {
            this.heroName.enableOutline=true
            if (sys.platform === sys.Platform.ANDROID) {
                this.heroName.outlineWidth = 2;
            } else if (sys.platform === sys.Platform.IOS) {
                this.heroName.outlineWidth = 0.5;
            } else {
                this.heroName.outlineWidth = 2;
            }
        }

        this.mark.on(Node.EventType.TOUCH_START , ()=>{
            // 如果正在上阵中，禁止关闭页面
            if (this.isDeploying) {
                console.log('HeroCardDetail: 正在上阵中，禁止关闭页面');
                return;
            }
            this.hide();
        }, this)


    }

    onDestroy() {
    }

    update(deltaTime: number) {
        
    }

    /**
     * 显示英雄卡片详细信息
     * @param cardId 卡片ID
     */
    show(cardId: string) {
        // 防重复调用机制
        if (this._isShowing && this._lastShowCardId === cardId) {
            return;
        }

        // 如果正在显示其他卡片，先隐藏
        if (this._isShowing && this._lastShowCardId !== cardId) {
            this.hide();
        }

        this._isShowing = true;
        this._lastShowCardId = cardId;
        
        this.node.active = true;
        
        // 获取卡片数据
        this.currentCardData = this.userArmyData.getCardById(cardId);
        if (!this.currentCardData) {
            console.warn(`HeroCardDetail: 找不到卡片ID ${cardId} 的数据`);
            return;
        }

        const  server_key=this.currentCardData.key;
        

        // 获取职业数据（如果已上场）
        this.currentClassData = this.userClassData.getClassData(this.currentCardData.class);
        this.hero_data=ResourceConfig.heros_list.find(hero => hero.id === this.currentCardData.heroId);
         
        
        // 更新界面显示
        this.updateHeroInfo();
        this.updateHeroStats();
        this.updateHeroBonds();
        this.updateUpgradeInfo();
        this.updateButtons();

        // if(this.hero){
        //     this.hero.levelLabel.node.active=false;
        // }

        // 根据server_key向服务端同步数据
        if (server_key) {
            // 检查是否已经有正在进行的请求
            if (this._isRequesting) {
                return;
            }
            
            // 记录当前请求的cardId，用于防止重复请求
            const requestCardId = this.currentCardData.cardId;
            this._isRequesting = true;
            
            myHeroAPI.syncHeroData(server_key, this.currentCardData.cardId)
                .then(response => {
                    // 检查是否还在显示同一个卡片
                    if (!this._isShowing || this._lastShowCardId !== cardId || this.currentCardData?.cardId !== requestCardId) {
                        this._isRequesting = false;
                        return;
                    }
                    
                    if (response.success) {
                        // 设置服务端数据并验证
                        this.setServerData(response.data.data);
                        
                        // 同步成功后，只更新不会覆盖服务端数据的UI部分
                        this.updateHeroInfo();
                        this.updateHeroBonds();
                        this.updateUpgradeInfo();
                        this.updateButtons();

                    } else {
                        console.warn(`HeroCardDetail: 同步数据失败，server_key: ${server_key}, 错误: ${response.message}`);
                    }
                })
                .catch(error => {
                    // 检查是否还在显示同一个卡片
                    if (!this._isShowing || this._lastShowCardId !== cardId || this.currentCardData?.cardId !== requestCardId) {
                        this._isRequesting = false;
                        return;
                    }
                    
                    console.error(`HeroCardDetail: 同步数据失败，server_key: ${server_key}, 错误: ${error}`);
                })
                .finally(() => {
                    this._isRequesting = false;
                });
        }
    }

    /**
     * 隐藏英雄卡片详细面板
     */
    hide() {
        // 如果正在上阵中，禁止关闭页面
        if (this.isDeploying) {
            console.log('HeroCardDetail: 正在上阵中，禁止关闭页面');
            ShowToast('正在上阵中');
            return;
        }
        //如果正在升级中
        if(this.isUpgrading){
            console.log('HeroCardDetail: 正在升级中，禁止关闭页面');
            ShowToast('正在升级中');
            return;
        }

        //如果正在突破中
        
        this.node.active = false;
        this.currentCardData = null;
        this.currentClassData = null;
        this._serverData = null; // 清除服务端数据
        this._isShowing = false;
        this._lastShowCardId = null;
        this._isRequesting = false;
    }

    // ==================== 服务端数据验证相关方法 ====================

    /**
     * 设置服务端数据（从API获取）
     * @param serverData 服务端数据
     */
    private setServerData(serverData: any): void {
        if (!serverData) {
            console.warn('HeroCardDetail: 传入的服务端数据为空');
            return;
        }

        this._serverData = serverData;
        console.log('HeroCardDetail: 设置服务端数据:', this._serverData);
        
        // 验证并更新UI显示
        this.validateAndUpdateFromServerData();
    }

    /**
     * 验证并根据服务端数据更新UI显示
     */
    private validateAndUpdateFromServerData(): void {
        if (!this._serverData || !this.currentCardData) return;

        const serverData = this._serverData;

        // 1. 等级上限以服务器为准
        if (serverData.levelCap) {
            const levelCap = parseInt(serverData.levelCap);
            if (!isNaN(levelCap)) {
                console.log(`HeroCardDetail: 服务端等级上限: ${levelCap}，当前本地等级上限: ${UserClassData.getInstance().getMaxLevelByCardId(this.currentCardData.cardId)}`);
            }
        }

        // 2. 品质信息输出日志
        if (serverData.qualityName) {
            console.log(`HeroCardDetail: 服务端品质信息: ${serverData.qualityName}`);
        }

        // 3. 职业信息输出日志
        if (serverData.careerName) {
            console.log(`HeroCardDetail: 服务端职业信息: ${serverData.careerName}`);
        }

        // 4. 羁绊信息输出日志
        if (serverData.heroBonds) {
            console.log(`HeroCardDetail: 服务端羁绊信息: ${serverData.heroBonds}`);
        }

        // 5. 处理服务端属性名称，更新attackType
        if (serverData.attributeName) {
            console.log(`HeroCardDetail: 服务端属性名称: ${serverData.attributeName}`);
            this.updateAttackTypeFromServer(serverData.attributeName);
        }

        // 6. 更新固有技能描述
        this.updateInherentSkillLabel(serverData.inherentSkill || "");

        // 7. 更新英雄描述
        this.updateDescriptionLabel(serverData.description || "");

        // 8. 更新属性描述
        this.updateAttributeDescriptionLabel(serverData.attributeDescription || "");

        // 9. 更新战斗力
        this.updateFightPowerLabel(serverData.fightPower || "");

        // 10. 更新攻击力
        this.updateAttackPowerLabel(serverData.attackPower || "");

        // 11. 更新生命值
        this.updateHealthValueLabel(serverData.healthValue || "");
    }

    // ==================== 服务端数据Label更新方法 ====================

    /**
     * 根据服务端属性名称更新attackType
     * @param attributeName 服务端返回的属性名称
     */
    private updateAttackTypeFromServer(attributeName: string): void {
        // 将服务端的属性名称映射到attackType数值
        const attackTypeMap: { [key: string]: number } = {
            "物理": 0,
            "水": 1,
            "火": 2,
            "电": 3,
            "风": 4
        };

        const newAttackType = attackTypeMap[attributeName];
        if (newAttackType !== undefined) {
            // 更新当前卡片数据的attackType
            this.currentCardData.attackType = newAttackType;
            
            // 更新UI显示
            if (this.attackType) {
                this.attackType.string = this.getAttackTypeName(newAttackType);
            }
            
            // 更新攻击类型图标
            if (this.attackTypeIcon) {
                this.loadAttackTypeIcon(newAttackType);
            }
            
            console.log(`HeroCardDetail: 更新attackType为 ${newAttackType} (${attributeName})`);
        } else {
            console.warn(`HeroCardDetail: 未知的属性名称: ${attributeName}`);
        }
    }

    /**
     * 更新固有技能描述Label
     * @param text 技能描述文本
     */
    private updateInherentSkillLabel(text: string): void {
        // 使用heroDescription来显示固有技能描述
        if (this.heroDescription) {
            this.heroDescription.string = text;
        }
        console.log(`HeroCardDetail: 更新固有技能描述: ${text}`);
    }

    /**
     * 更新英雄描述Label
     * @param text 英雄描述文本
     */
    private updateDescriptionLabel(text: string): void {
        // 使用heroDescription来显示英雄描述
        if (this.heroDescription) {
            this.heroDescription.string = text;
        }
        console.log(`HeroCardDetail: 更新英雄描述: ${text}`);
    }

    /**
     * 更新属性描述Label
     * @param text 属性描述文本
     */
    private updateAttributeDescriptionLabel(text: string): void {
        // 使用attributeDescription来显示属性描述
        if (this.attributeDescription) {
            this.attributeDescription.string = text;
        }
        console.log(`HeroCardDetail: 更新属性描述: ${text}`);
    }

    /**
     * 更新战斗力Label
     * @param text 战斗力文本
     */
    private updateFightPowerLabel(text: string): void {
        // 使用combatPower来显示战斗力
        if (this.combatPower) {
            this.combatPower.string = text;
        }
        console.log(`HeroCardDetail: 更新战斗力: ${text}`);
    }

    /**
     * 更新攻击力Label
     * @param text 攻击力文本
     */
    private updateAttackPowerLabel(text: string): void {
        // 使用attack来显示攻击力
        if (this.attack) {
            this.attack.string = text;
        }
        console.log(`HeroCardDetail: 更新攻击力: ${text}`);
    }

    /**
     * 更新生命值Label
     * @param text 生命值文本
     */
    private updateHealthValueLabel(text: string): void {
        // 使用health来显示生命值
        if (this.health) {
            this.health.string = text;
        }
        console.log(`HeroCardDetail: 更新生命值: ${text}`);
    }

    /**
     * 更新英雄基本信息
     */
    private updateHeroInfo(): void {
        if (!this.currentCardData) return;

        // 更新英雄名称
        if (this.heroName) {
            this.heroName.string = this.currentCardData.name;
        }

        // 更新攻击类型
        if (this.attackType) {
            this.attackType.string = this.getAttackTypeName(this.currentCardData.attackType);
        }

        // 更新攻击类型图标
        if (this.attackTypeIcon) {
            this.loadAttackTypeIcon(this.currentCardData.attackType);
        }

        // 更新英雄描述
        if (this.heroDescription) {
            this.heroDescription.string = this.getHeroDescription(this.currentCardData.heroId);
        }

        // 更新属性描述
        if (this.attributeDescription) {
            this.attributeDescription.string = this.getAttributeDescription(this.currentCardData);
        }

        //更新战斗力
        if(this.combatPower){
            const fomath_combatPower=Utils.formatNumber(this.getCombatPower(this.currentCardData))
            this.combatPower.string = fomath_combatPower
        }

        if(this.hero){
            this.hero.setHeroData(this.currentCardData.cardId);

            //description 等级描述 如果是未上场英雄 则显示 1/1
            let description=this.hero_data.level_description;
            if(this.userClassData.isCardDeployed(this.currentCardData.cardId)){
               //如果是上场英雄   从服务器数据中字段   levelCap 获取最大    /  level 获取当前
               if(this._serverData){
                const maxLevel=this._serverData.levelCap;
                const currentLevel=this.userClassData.getClassLevel(this.currentCardData.class);
                description=`${currentLevel}/${maxLevel}`;
               }else{
                description=`--/--`;
               }

            }else{
                description=`1/1`;
            }
            this.hero.updateLevelDescription(description);


            //最小 
            // const maxLevel = Math.max(this.userClassData.getMaxLevelByCardId(this.currentCardData.cardId),1);
            // const currentLevel = this.userClassData.getClassLevel(this.currentCardData.class);
            // this.hero.updateLevelDescription(`${currentLevel}/${maxLevel}`);
            
            // this.scheduleOnce(()=>{
            //     const maxLevel = this.userClassData.getMaxLevelByCardId(this.currentCardData.cardId);
            //     const currentLevel = this.userClassData.getClassLevel(this.currentCardData.class);
            //     this.hero.updateLevelDescription(`${currentLevel}/${maxLevel}`);
            // },0.1);
        }
    }

    //更新等级

    /**
     * 更新英雄属性数值
     */
    private updateHeroStats(): void {
        if (!this.currentCardData) return;

        // 如果有服务端数据，使用服务端数据
        if (this._serverData) {
            // 更新攻击力
            if (this.attack) {
                this.attack.string = this._serverData.attackPower || '0';
            }

            // 更新生命值
            if (this.health) {
                this.health.string = this._serverData.healthValue || '0';
            }

            // 更新战斗力
            if (this.combatPower) {
                this.combatPower.string = this._serverData.fightPower || '0';
            }
        } else {
            // 使用占位符，避免显示本地数据
            if (this.attack) {
                this.attack.string = '--';
            }
            if (this.health) {
                this.health.string = '--';
            }
            if (this.combatPower) {
                this.combatPower.string = '--';
            }
        }
    }

    /**
     * 更新羁绊信息
     */
    private updateHeroBonds(): void {
        if (!this.currentCardData) return;

        // 更新羁绊英雄面板
        if (this.bondHeroPanel1) {
            this.updateBondHeroPanel(this.bondHeroPanel1, 0);
        }

        if (this.bondHeroPanel2) {
            this.updateBondHeroPanel(this.bondHeroPanel2, 1);
        }

        // 更新羁绊描述
        if (this.heroBondDescription) {
            this.heroBondDescription.string = this.getBondDescription(this.currentCardData.heroId);
        }
    }

    /**
     * 更新升级信息
     */
    private updateUpgradeInfo(): void {
        if (!this.currentCardData) return;

        // 如果有服务端数据，优先使用服务端数据
        if (this._serverData && this._serverData.material) {
            // 更新升级消耗物品图标
            if (this.upgradeItemIcon) {
                this.loadUpgradeItemIconFromServer();
            }

            // 更新升级消耗物品数量
            if (this.upgradeItemCount) {
                this.upgradeItemCount.string = this._serverData.number?.toString() || '0';
            }

            // 更新升级消耗金币
            if (this.upgradeGoldCost) {
                this.upgradeGoldCost.string = this._serverData.money?.toString() || '0';
            }
        } else {
            // 使用占位符，避免显示本地数据
            // 更新升级消耗物品图标
            if (this.upgradeItemIcon) {
                this.loadUpgradeItemIcon();
            }

            // 更新升级消耗物品数量
            if (this.upgradeItemCount) {
                this.upgradeItemCount.string = '--';
            }

            // 更新升级消耗金币
            if (this.upgradeGoldCost) {
                this.upgradeGoldCost.string = '--';
            }
        }
    }

    /**
     * 更新按钮状态和文本
     */
    private updateButtons(): void {
        if (!this.currentCardData) return;

        const isDeployed = this.userClassData.isCardDeployed(this.currentCardData.cardId);
        
        // 更新上阵按钮
        if (this.deployButton) {
            this.deployButton.node.active = !isDeployed; // 只有未上阵的英雄才显示上阵按钮
            const buttonLabel = this.deployButton.node.getComponentInChildren(Label);
            if (buttonLabel) {
                if (this.isDeploying) {
                    buttonLabel.string = "上阵中...";
                    this.deployButton.interactable = false; // 上阵期间禁用按钮
                } else {
                    buttonLabel.string = "上阵";
                    this.deployButton.interactable = true;
                }
            }
        }

        // 更新一键升级按钮
        if (this.upgradeButton) {
            this.upgradeButton.node.active = isDeployed; // 只有上阵的英雄才能升级
            
            if (isDeployed) {
                const buttonLabel = this.upgradeButton.node.getComponentInChildren(Label);
                if (buttonLabel) {
                    if (this.isUpgrading) {
                        buttonLabel.string = "升级中...";
                        this.upgradeButton.interactable = false; // 升级期间禁用按钮
                    } else {
                        // 如果有服务端数据，根据服务端数据判断是否可以升级
                        if (this._serverData && this._serverData.material) {
                            // 服务端有升级数据，说明可以升级
                            buttonLabel.string = "一键升级";
                            this.upgradeButton.interactable = true;
                        } else if (this._serverData) {
                            // 服务端没有升级数据，说明已达满级
                            buttonLabel.string = "满级";
                            this.upgradeButton.interactable = false;
                        } else {
                            // 没有服务端数据，显示加载中
                            buttonLabel.string = "加载中...";
                            this.upgradeButton.interactable = false;
                        }
                    }
                }
            }
        }
    }

    // =============== 预留方法，下一步实现 ===============

    /**
     * 获取攻击类型名称
     */
    private getAttackTypeName(attackType: number): string {
        // TODO: 下一步实现
        const typeNames = ["物理", "水", "火", "电", "风"];
        return typeNames[attackType] || "未知";
    }

    /**
     * 加载攻击类型图标
     */
    private loadAttackTypeIcon(attackType: number): void {
        if(this.attackTypeIcon){
            const attackTypeIconName = `atk_type_${attackType}`;
            this.attackTypeIcon.spriteFrame = this.attackTypeIcon.spriteAtlas.getSpriteFrame(attackTypeIconName);
        }
    }

    /**
     * 获取英雄描述
     */
    private getHeroDescription(heroId: string): string {

        return   this.hero_data?.description;
    }

    /**
     * 获取属性描述
     */
    private getAttributeDescription(cardData: CardData): string {
        // TODO: 下一步实现
        // return `职业: ${cardData.class}, 品质: ${cardData.quality}`;
        return this.hero_data?.bond_description;
    }

    /**
     * 获取基础攻击力
     */
    private getBaseAttack(cardData: CardData): number {
        // TODO: 下一步实现具体计算逻辑
        return cardData.quality * 50;
    }

    /**
     * 获取生命值
     */
    private getHealthValue(cardData: CardData): number {
        // TODO: 下一步实现具体计算逻辑
        return this.currentClassData.maxhp+this.hero_data.maxhp
    }

    /**
     * 获取战斗力
     */
    private getCombatPower(cardData: CardData): number {
        // TODO: 下一步实现具体计算逻辑
        const attackValue = this.currentClassData ? this.currentClassData.attack : this.getBaseAttack(cardData);
        const healthValue = this.getHealthValue(cardData);
        // 简化战斗力计算：攻击力 * 1.5 + 生命值 * 0.8
        return Math.floor(attackValue * 1.5 + healthValue * 0.8);
    }

    /**
     * 更新羁绊英雄面板
     */
    private updateBondHeroPanel(panel: SimpleHeroCard, bondIndex: number): void {
        // TODO: 下一步实现羁绊英雄显示
        // console.log(`TODO: 更新羁绊英雄面板 ${bondIndex}`);
        if(panel){

           const hero_id=this.hero_data.bonids[bondIndex];
        //    
        const is_deployed=UserClassData.getInstance().isCardDeployedbyheroid(hero_id);

        //创建一个零时卡牌数据
            const hero_data=ResourceConfig.heros_list.find(hero => hero.id === hero_id);


        const cardData ={
            heroId:hero_id,
            quality:1,
            level:1,
            sLevel:0,
            cardId:"-1",
            class:hero_data.class,
            name:hero_data.name,
        }

            if(cardData){
                panel.setHeroInfo(cardData.heroId,cardData.name,cardData.class,cardData.quality,cardData.level,cardData.sLevel);
                if(!is_deployed){
                    panel.showMask();
                }else{
                    panel.hideMask();
                }
            }
        }
    }

    /**
     * 获取羁绊描述
     */
    private getBondDescription(heroId: string): string {
        // TODO: 下一步实现
        // return `英雄 ${heroId} 的羁绊效果描述...`;
        return this.hero_data?.bond_description;
    
    }

    /**
     * 加载升级消耗物品图标
     */
    private loadUpgradeItemIcon(): void {
        // TODO: 下一步实现图标加载
        // console.log(`TODO: 加载升级物品图标 ${fragmentId}`);
        if(this.upgradeItemIcon){
            const itemIconName = `p_c_${this.currentCardData.class}`;
            this.upgradeItemIcon.spriteFrame = this.upgradeItemIcon.spriteAtlas.getSpriteFrame(itemIconName)
        }
    }

    /**
     * 从服务端数据加载升级消耗物品图标
     */
    private loadUpgradeItemIconFromServer(): void {
        // if(this.upgradeItemIcon && this._serverData && this._serverData.material){
        //     // 根据服务端的material key加载对应的图标
        //     const itemIconName = `p_${this._serverData.material}`;
        //     this.upgradeItemIcon.spriteFrame = this.upgradeItemIcon.spriteAtlas.getSpriteFrame(itemIconName);
        // }
        this.loadUpgradeItemIcon();
    }

    /**
     * 刷新服务端数据
     */
    private refreshServerData(): void {
        if (!this.currentCardData || !this.currentCardData.cardId) {
            console.warn('HeroCardDetail: 无法刷新服务端数据，缺少cardId');
            return;
        }

        // 重新获取服务端数据
        myHeroAPI.syncHeroData(this.currentCardData.cardId, this.currentCardData.cardId)
            .then(result => {
                if (result.success && result.data) {
                    this.setServerData(result.data.data);
                    this.validateAndUpdateFromServerData();
                }
            })
            .catch(error => {
                console.error('HeroCardDetail: 刷新服务端数据失败:', error);
            });
    }

    /**
     * 获取升级消耗物品数量
     */
    private getUpgradeItemCount(cardId: string): number {
        // TODO: 下一步实现
        return this.userClassData.getUpgradeItemCost(cardId);
    }

    /**
     * 一键升级英雄卡片
     */
    private upgradeCard(): void {
        if (!this.currentCardData) {
            console.warn('HeroCardDetail: 当前没有选中的卡片数据');
            return;
        }

        // 如果正在升级中，禁止重复操作
        if (this.isUpgrading) {
            console.log('HeroCardDetail: 正在升级中，请稍候...');
            return;
        }

        // 检查是否有cardId
        if (!this.currentCardData.cardId) {
            console.warn('HeroCardDetail: 缺少cardId，无法发送升级请求');
            return;
        }

        console.log(`HeroCardDetail: 开始一键升级英雄，cardId: ${this.currentCardData.cardId}`);

        // 设置升级状态，禁止用户操作
        this.isUpgrading = true;
        this.updateButtons(); // 更新按钮状态

        // 调用服务端一键升级接口
        myHeroAPI.heroOneUpgrade(Number(this.currentCardData.cardId))
            .then(response => {
                console.log('HeroCardDetail: 服务器一键升级响应:', response);
                
                // 检查页面是否还存在
                if (!this.node || !this.node.isValid) {
                    console.warn('HeroCardDetail: 页面已关闭，取消后续操作');
                    return;
                }

                if (response.code === 200 || response.code === 0) {
                    console.log('HeroCardDetail: 一键升级成功');
                     // 等级+1
                     if (this.currentClassData&&response.data) {
                        const level =  Number(response.data);
                        console.log('HeroCardDetail: 一键升级成功，', level);
                        if(level>this.currentClassData.level){
                            this.currentClassData.level =level;
                        }
                    }
                    
                    // 发送事件通知其他组件
                    director.emit(game.gameEvent.HALL_ARMY_FORMATION_CHANGED, this.currentClassData);
                    
                    // 关闭页面
                    this.hide();
                    
                    // TODO: 播放升级成功特效
                    // TODO: 显示升级成功提示
                } else {
                    console.warn(`HeroCardDetail: 一键升级失败 - ${response.msg}`);
                    // TODO: 显示升级失败提示
                }
            })
            .catch(error => {
                console.error('HeroCardDetail: 一键升级请求失败:', error);
                
                // 检查页面是否还存在
                if (!this.node || !this.node.isValid) {
                    console.warn('HeroCardDetail: 页面已关闭，取消后续操作');
                    return;
                }

                // TODO: 显示升级失败提示
            })
            .finally(() => {
                // 重置升级状态
                this.isUpgrading = false;
                this.updateButtons();
            });
    }

    /**
     * 上阵英雄卡片
     */
    private deployCard(): void {
        if (!this.currentCardData) {
            console.warn('HeroCardDetail: 当前没有选中的卡片数据');
            return;
        }

        // 如果正在上阵中，禁止重复操作
        if (this.isDeploying) {
            console.log('HeroCardDetail: 正在上阵中，请稍候...');
            return;
        }

        // 如果本地判断已经上阵，直接提示并同步UI，避免重复请求
        const localUserClassData = UserClassData.getInstance();
        if (localUserClassData.isCardDeployed(this.currentCardData.cardId)) {
            console.log('HeroCardDetail: 本地检测到该英雄已上阵，跳过请求');
            ShowToast('该英雄已上阵');
            // 更新UI为已上阵状态
            this.updateButtons();
            this.updateHeroStats();
            this.updateUpgradeInfo();
            return;
        }

        // 换成了cardId
        if (!this.currentCardData.cardId) {
            console.warn('HeroCardDetail: 缺少cardId，无法发送上阵请求');
            return;
        }

        console.log(`HeroCardDetail: 开始上阵英雄，cardId: ${this.currentCardData.cardId}`);

        // 设置上阵状态，禁止用户操作
        this.isDeploying = true;
        this.updateButtons(); // 更新按钮状态

        // 先发送上阵请求到服务器
        myHeroAPI.heroBattle(Number(this.currentCardData.cardId))
            .then(response => {
                console.log('HeroCardDetail: 服务器上阵响应:', response);
                
                // 检查页面是否还存在
                if (!this.node || !this.node.isValid) {
                    console.warn('HeroCardDetail: 页面已关闭，取消后续操作');
                    return;
                }
                
                if (response.code === 200) {
                    console.log('HeroCardDetail: 服务器上阵成功，执行本地操作');
                    
                    // 服务器上阵成功后，执行本地上阵操作
                    const userClassData = UserClassData.getInstance();
                    const deployResult = userClassData.deployCard(this.currentCardData.cardId);
                    
                    if (deployResult.success) {
                        console.log(`HeroCardDetail: 本地上阵成功 - ${deployResult.message}`);
                        
                        if (deployResult.replacedCardId) {
                            console.log(`HeroCardDetail: 替换了英雄 ${deployResult.replacedCardId}`);
                            // TODO: 显示替换提示，例如："英雄A替换了英雄B上阵"
                        }
                        
                        // 重置上阵状态，允许关闭页面
                        this.isDeploying = false;
                        
                        // 更新UI
                        this.updateButtons();
                        this.updateHeroStats();
                        this.updateUpgradeInfo(); // 上阵后需要更新升级信息
                        
                        // 触发阵容更新事件
                        director.emit(game.gameEvent.HALL_ARMY_FORMATION_CHANGED, this.currentClassData);
                        
                        // 关闭页面
                        this.hide();
                        
                        // TODO: 显示上阵成功提示
                        
                    } else {
                        console.warn(`HeroCardDetail: 本地上阵失败 - ${deployResult.message}`);
                        // TODO: 显示本地上阵失败提示
                    }
                    
                } else {
                    console.warn(`HeroCardDetail: 服务器上阵失败 - ${response.msg}`);
                    // 如果服务器提示该英雄已上阵，则同步本地状态并更新UI
                    if (String(response.msg).includes('已上阵')) {
                        console.log('HeroCardDetail: 服务器提示已上阵，本地同步为已上阵');
                        const userClassData = UserClassData.getInstance();
                        const deployResult = userClassData.deployCard(this.currentCardData.cardId);
                        if (deployResult.success) {
                            ShowToast('该英雄已上阵');
                            this.isDeploying = false;
                            this.updateButtons();
                            this.updateHeroStats();
                            this.updateUpgradeInfo();
                            director.emit(game.gameEvent.HALL_ARMY_FORMATION_CHANGED, this.currentClassData);
                            this.hide();
                            return;
                        }
                    }
                    // 其他错误情况走原有提示逻辑
                    // TODO: 显示服务器上阵失败提示
                }
            })
            .catch(error => {
                console.error('HeroCardDetail: 上阵请求失败:', error);
                // 如果错误信息包含已上阵，同步本地状态
                if (String(error).includes('已上阵')) {
                    console.log('HeroCardDetail: 捕获到“已上阵”错误，本地同步为已上阵');
                    const userClassData = UserClassData.getInstance();
                    const deployResult = userClassData.deployCard(this.currentCardData.cardId);
                    if (deployResult.success) {
                        ShowToast('该英雄已上阵');
                        if (this.node && this.node.isValid) {
                            this.isDeploying = false;
                            this.updateButtons();
                            this.updateHeroStats();
                            this.updateUpgradeInfo();
                            director.emit(game.gameEvent.HALL_ARMY_FORMATION_CHANGED, this.currentClassData);
                            this.hide();
                            return;
                        }
                    }
                }
                // TODO: 显示网络请求失败提示
            })
            .finally(() => {
                // 无论成功还是失败，都要重置上阵状态
                if (this.node && this.node.isValid) {
                    this.isDeploying = false;
                    this.updateButtons(); // 更新按钮状态
                }
            });
    }

   
}