import { _decorator, Component, director, game, Node } from 'cc';
import { Heros } from './object/Heros';
import { GameObject } from './object/GameObject';
import { HeroPanel } from './HeroPanel';
import { GameLevelUpManager } from './GameLevelUpManager';
import { StageComponent } from './stage/StageComponent';
import { UserClassData } from '../user/UserClassData';
import { UserArmyData } from '../user/UserArmyData';
import { TechNodeType, UserTechTreeData } from '../user/UserTechTreeData';
import { UserEquipmentData } from '../user/UserEquipmentData';
import { UserRelicData } from '../user/UserRelicData';
import { SkillEffect, SkillEffectType, ClassType } from '../global/config/EquipmentConfig';
import { PartnerPanel } from './partner/PartnerPanel';
import { UserPartnerData } from '../user/UserPartnerData';
import { partnerConfigs } from '../global/config/PartnerConfig';
import { StageManager } from './stage/StageManager';
import { StageType } from './stage/StageData';
import { GameManager } from './GameManager';
import { WatchtowerPanel } from './watchtowerpanel/WatchtowerPanel';
import { UserWatchtowerData } from '../user/UserWatchtowerData';
const { property, ccclass } = _decorator;

/**
 * HerosManager
 * 管理所有英雄相关的面板、塔、宠物等节点
 */
@ccclass('HerosManager')
export class HerosManager extends Component {
    private static _instance: HerosManager;

    public static getInstance(): HerosManager {
        return this._instance;
    }

    /**
     * 英雄面板
     * [0维]:0-普通关卡|外域左侧面板 :1-外域右侧面板
     * [1维]:0-坦克面板 1-4其他4个英雄按上场顺序的面板
     */
    public heroPanels: HeroPanel[][];

    /**
     * 伙伴面板
     * [0维]:0-普通关卡|外域左侧面板 :1-外域右侧面板
     * [1维]:0~1-按顺序的面板
     */
    public partnerPanels: PartnerPanel[][];

    /**
     * 哨塔面板
     * [0维]:0-普通关卡|外域左侧面板 :1-外域右侧面板
     * [1维]:0~1-按顺序的面板
     */
    public watchtowerPanels: WatchtowerPanel[][];

    /**被守护者 */
    public principal: HeroPanel;

    /**
     * k:stageType
     * v-0维:side :0-普通关卡|外域左侧面板 :1-外域右侧面板
     * v-1维:index :0-坦克面板 1-4其他4个英雄按上场顺序的面板
     * v-2维:data :0-pos.x 1-pos.y 2-scale
     * 取不到就隐藏
     */
    private static readonly heroPanelPosAndScale: { [k: number]: number[][][] } = {
        1: [
            [[0, -838, 1], [-140, -1089, 1], [140, -1089, 1], [-435, -1049, 1], [435, -1049, 1]],
            []
        ],
        2: [
            [[-325, -237, .65], [-145, -577, .65], [-325, -577, .65], [-490, -923, .65], [-325, -923, .65]],
            [[325, -237, .65], [145, -577, .65], [325, -577, .65], [490, -923, .65], [325, -923, .65]]
        ],
        3: [
            [[0, -838, 1], [-140, -1089, 1], [140, -1089, 1], [-435, -1049, 1], [435, -1049, 1]],
            []
        ],
        //竞技场站位
        4: [
            //我方英雄
            [[-140, -838, 1], [-140, -1089, 1], [140, -1089, 1], [-435, -1049, 1], [435, -1049, 1]],

            //敌方英雄站位
            [[140, 638, 1], [-140, 838, 1], [140, 838, 1], [-435, 838, 1], [435, 838, 1]]
        ],
        //  5: [
        //      [[-325, -237, .65], [-145, -577, .65], [-325, -577, .65], [-490, -923, .65], [-325, -923, .65]],
        //      [[325, -237, .65], [145, -577, .65], [325, -577, .65], [490, -923, .65], [325, -923, .65]]
        //  ],

          5: [
            [[-140, -638, 1], [-140, -1089, 1], [140, -1089, 1], [-435, -1049, 1], [435, -1049, 1]],

            //队友英雄
            [[140, -638, 1], [-140, -838, 1], [140, -838, 1], [-435, -838, 1], [435, -838, 1]]
        ],
    } as const;

    /**
     * k:stageType
     * v-0维:side :0-普通关卡|外域左侧面板 :1-外域右侧面板
     * v-1维:index :0-两个partner的面板
     * v-2维:data :0-pos.x 1-pos.y 2-scale
     * 取不到就隐藏
     * 伙伴位置
     */
    private static readonly partnerPanelPosAndScale: { [k: number]: number[][][] } = {
        1: [
            [[-430, -846, 1], [430, -846, 1]],
            []
        ],
        2: [
            [[-490, 437, .65], [-325, 437, .65],[490, 437, .65], [325, 437, .65]],
            [[490, 437, .65], [325, 437, .65]]
        ],
        3: [
            [[-430, -846, 1], [430, -846, 1]],
            []
        ],
        4: [
            [[-430, -846, 1], [430, -846, 1]],
            []
        ],
        5: [
            [
                 [-435, -638, 1], [435, -638, 1]
                //[-430, 437, 1], [430, 437, 1]
            ],
            []
        ],
    } as const;

    
    /**
     * k:stageType
     * v-0维:side :0-普通关卡|外域左侧面板 :1-外域右侧面板
     * v-1维:index :0-两个watchtower的面板
     * v-2维:data :0-pos.x 1-pos.y 2-scale
     * 取不到就隐藏
     * 哨塔位置
     */
    private static readonly watchtowerPanelPosAndScale: { [k: number]: number[][][] } = {
        1: [
            [],
            []
        ],
        2: [
            [[-310, 137, 1], [-145, 137, 1]],
            [[310, 137, 1], [145, 137, 1]]
        ],
        3: [
             [[-310, 137, 1],[310, 137, 1]],
             [],
        ],
        4: [
             [[-310, 137, 1],[310, 137, 1]],
             [],
        ],
        5: [
             [
                [-435, -138, 1], [435, -138, 1]
                //[-310, 137, 1],[310, 137, 1]
            ],
             [],
        ],
    } as const;


    protected onLoad(): void {
        HerosManager._instance = this;

        this.heroPanels = [[], []];
        this.partnerPanels = [[], []];
        this.watchtowerPanels = [[], []];
        for (let side = 0; side < 2; ++side) {
            const tank = this.node.getChildByPath(`tank${side}`).getComponent(HeroPanel);
            this.heroPanels[side].push(tank);
            for (let i = 0; i < 5 - 1; ++i) {
                const hero = this.node.getChildByPath(`hero${side}${i}`).getComponent(HeroPanel);
                hero.close();
                this.heroPanels[side].push(hero);
            }

            for (let i = 0; i < 2; ++i) {
                const partner = this.node.getChildByPath(`partner${side}${i}`).getComponent(PartnerPanel);
                partner.node.active = false;
                this.partnerPanels[side].push(partner);
            }

            for (let i = 0; i < 2; i++) {
                const watchtower = this.node.getChildByPath(`watchtower${side}${i}`).getComponent(WatchtowerPanel);
                watchtower.node.active = false;
                this.watchtowerPanels[side].push(watchtower);
            }
            // console.log(`hero>>>>>>>>>>>>>>>>>>>[${side}]>>>${this.heroPanels[side].length}`);
            // for (const hero of this.heroPanels[side]) {
            //     console.log(`${hero.node.name}`);
            // }
            // console.log(`partner>>>>>>>>>>>>>>>>[${side}]>>>${this.partnerPanels[side].length}`);
            // for (const partner of this.partnerPanels[side]) {
            //     console.log(`${partner.node.name}`);
            // }
        }
        this.principal = this.node.getChildByName("principal").getComponent(HeroPanel);


        // 监听英雄选择事件
        this.initEventListeners();
        this.setTopLayer();
    }

    private initGameObj() {
        const st = this;
        const stageType = game.myGlobal.stageType;
        let num = 0;
        // console.log(`>>>>>${stageType}>`);
        switch (stageType) {
            case StageType.Normal:
            case StageType.Outland:
            case StageType.Dungeon:
            case StageType.Arena:
            case StageType.Endless:
                {
                    for (let side = 0; side < 2; ++side) {
                        const groupdata = HerosManager.heroPanelPosAndScale[stageType][side];
                        for (let i = 0; i < 5; ++i) {
                            const data = groupdata[i];
                            const panel = st.heroPanels[side][i];
                            if (!data) {
                                panel.close();
                                // console.log(`>>>>>>>>>[side${side}][${i}]${panel.node.name}[close]`);
                            } else {
                                // console.log(`>>>>>>>>>[side${side}][${i}]${panel.node.name}[${data[0]},${data[1]}][open]`);
                                panel.node.setPosition(data[0], data[1]);
                                panel.node.setScale(data[2], data[2]);
                                panel.open();
                            }
                        }
                    }
                    for (let side = 0; side < 2; ++side) {
                        const groupdata = HerosManager.partnerPanelPosAndScale[stageType][side];
                        for (let i = 0; i < 2; ++i) {
                            const data = groupdata[i];
                            const panel = st.partnerPanels[side][i];
                            if (!data) {
                                panel.node.active = false;
                            } else {
                                panel.node.setPosition(data[0], data[1]);
                                panel.node.setScale(data[2], data[2]);
                                panel.node.active = true;
                            }
                        }
                    }
                    for (let side = 0; side < 2; side++) {
                        const groupdata = HerosManager.watchtowerPanelPosAndScale[stageType][side];
                        for (let i = 0; i < 2; i++) {
                           const data = groupdata[i];
                           const panel = st.watchtowerPanels[side][i]
                           if (!data) {
                              panel.node.active = false;
                           }else{
                              panel.node.setPosition(data[0],data[1])
                              panel.node.setScale(data[2],data[2]);
                              panel.node.active = true;
                           }
                        }
                    }
                    if(stageType == StageType.Outland){
                       num = 2;
                    }else if(stageType == StageType.Dungeon || stageType == StageType.Arena){
                        num = 1;
                    }else if(stageType == StageType.Endless){
                        num = 1;
                    }
                    else{}
                } break;
            default:
                throw new Error(`TODO`);
        }

        //初始化伙伴面板
        st.initPartnerPanel(num);
        st.initPrincipalPanel();
        st.initWatchtowerPanel(num);
        console.log(`HerosMgr`);
        game.myGlobal.gameInitOne();
        if(stageType === StageType.Endless){
            this.scheduleOnce(()=>{
                const glm = GameLevelUpManager.getInstance();
                const candidates = glm?.getHeroCandidates();
                if(candidates && candidates[0]?.length === 5 && candidates[1]?.length === 5){
                    this.deployAllInitialHeroes();
                }
            }, 0.05);
        }
        this.setTopLayer();
    }

    private initPartnerPanel(num: number): void {
        const partnerIds = UserPartnerData.getInstance().getEquippedPartnerIds();
        const stageType = GameManager.getInstance().stageManager.stageData.stageType;

        const sides: number[] = (stageType === StageType.Outland) ? [0, 1] : [0];
        for (const side of sides) {
            const pid = (stageType === StageType.Outland)
                ? partnerIds[side]
                : (partnerIds[0] ?? partnerIds[1] ?? null);

            if (!pid) {
                for (let j = 0; j < 2; j++) {
                    const panel = this.partnerPanels[side]?.[j];
                    if (panel && panel.node) panel.node.active = false;
                }
                continue;
            }

            const partner = UserPartnerData.getInstance().getPartner(pid);
            const hasConfig = !!partner && !!(partnerConfigs.find(c => c.id === partner.id));
            if (!hasConfig) {
                console.warn(`[HerosManager] 跳过无配置的伙伴ID: ${pid}`);
                for (let j = 0; j < 2; j++) {
                    const panel = this.partnerPanels[side]?.[j];
                    if (panel && panel.node) panel.node.active = false;
                }
                continue;
            }

            for (let j = 0; j < 2; j++) {
               this.partnerPanels[side][j].initPanelData(partner!);
            }
        }
    }

    private setTopLayer(): void {
        try {
            const p = this.node.parent as Node;
            if (p) this.node.setSiblingIndex(p.children.length - 1);
            this.raisePanelsToTop(0);
            this.raisePanelsToTop(1);
        } catch {}
    }

    private raisePanelsToTop(side: number): void {
        try {
            for (let i = 0; i < (this.heroPanels[side] ? this.heroPanels[side].length : 0); i++) {
                const panel = this.heroPanels[side][i];
                if (!panel || !panel.node) continue;
                try { panel.node.setSiblingIndex(this.node.children.length - 1); } catch {}
            }
        } catch {}
    }

    private initPrincipalPanel() {
        switch (game.myGlobal.stageType) {
            case StageType.Normal:
            case StageType.Dungeon:
            case StageType.Arena:
            case StageType.Endless:
                this.principal.close();
                break;
            case StageType.Outland://构造一个假的被守护者
                this.principal.open();

                const cardData = UserArmyData.getInstance().getUserCards()[0];
                let principalData = new Heros(cardData.heroId);
                principalData.id = GameObject.principal;
                principalData.maxhp = principalData.hp = 30;
                principalData.attackInterval = 999999;
                principalData.damageReduction = 9999999;
                this.principal.initPanelData(principalData);

                break;
    
            default:
                throw new Error("TODO");
        }
    }

    private initWatchtowerPanel(num:number): void{
       
        const partnerIds = UserWatchtowerData.getInstance().getEquippedPartnerIds()
        for (let i = 0; i < num; ++i) {
            if (partnerIds[i]) {
                const watchtower = UserWatchtowerData.getInstance().getPartner(partnerIds[i])
                if (watchtower) {
                    //this.watchtowerPanels[0][i].initPanelData(watchtower)
                    for (let j = 0; j < 2; j++) {
                       this.watchtowerPanels[i][j].initPanelData(watchtower)                   
                    }
                }
            }
        }
    }

    private onPartnerEditorRefresh() {
        let num = 1;
        const stageType = GameManager.getInstance().stageManager.stageData.stageType;
        if (stageType == StageType.Outland) num = 2;
        else if (stageType == StageType.Dungeon || stageType == StageType.Arena) num = 1;
        else if (stageType == StageType.Endless) num = 1;
        this.initPartnerPanel(num);
        this.initWatchtowerPanel(num);
    }

    /**
     * 初始化事件监听
     */
    private initEventListeners(): void {
        // 监听英雄选择完成事件
        director.on(game.gameEvent.GAME_HERO_SELECTED, this.onHeroSelected, this);
        director.on(game.gameEvent.GAME_SKILL_SELECTED, this.onSkillSelected, this);
        director.on(game.gameEvent.GAME_MAP_CFG_LOADED, this.initGameObj, this);
        director.on(game.gameEvent.GAME_PARTNER_EDITOR_PAGE_REFRESH, this.onPartnerEditorRefresh, this);
    }

    /**
     * 清理事件监听
     */
    onDestroy(): void {
        director.off(game.gameEvent.GAME_HERO_SELECTED, this.onHeroSelected, this);
        director.off(game.gameEvent.GAME_SKILL_SELECTED, this.onSkillSelected, this);
        director.off(game.gameEvent.GAME_MAP_CFG_LOADED, this.initGameObj, this);
        director.off(game.gameEvent.GAME_PARTNER_EDITOR_PAGE_REFRESH, this.onPartnerEditorRefresh, this);
        HerosManager._instance = null;
    }

    private onSkillSelected(event: any): void {
        const { heroGameObj, heroId, heroName, skillId, skillName, upgradeEvent } = event;

        console.log(`升级事件:`, upgradeEvent);

        //查找 heroGameObj 在哪个面板
        const heroPanel = this.findHeroPanel(heroGameObj);
        if (heroPanel) {
            // heroPanel.initPanelData(heroGameObj);
            heroPanel.refreshHeroLevel()
        }


    }

    private findHeroPanel(heroGameObj: GameObject): HeroPanel | null {
        for (const group of this.heroPanels) {
            for (const panel of group) {
                if (panel && panel.hero && panel.hero.id === heroGameObj.id) {
                    return panel;
                }
            }
        }
        return null;
    }

    /**
     * 处理英雄选择事件
     * @param event 英雄选择事件数据
     */
    private onHeroSelected(event: any): void {
        const { heroGameObj, heroId, name, side: eventSide } = event;
        console.log(`HerosManager: 收到英雄选择事件 - ${name} (ID: ${heroId})`);

        if (!heroGameObj) {
            console.error('英雄GameObject为空');
            return;
        }

        // 如果事件中直接指定了side，优先使用
        if (eventSide !== undefined) {
            console.log(`使用事件指定的side: ${eventSide}`);
            this.assignHeroToPanel(heroGameObj as GameObject, eventSide);
            return;
        }

        //TODO 使用实际的编组获取side
        let side = 0;
        if (GameManager.getInstance().stageManager.stageData.stageType == StageType.Outland) {
            const cardDatas = UserClassData.getInstance().getDeployedCardData();
            const heroIds = cardDatas.map((v) => { return v.heroId });
            side = heroIds.indexOf(heroId) == -1 ? 1 : 0;
            console.log(`side:${side} ${JSON.stringify(heroIds)} ${heroId}`);
        }

        if (GameManager.getInstance().stageManager.stageData.stageType == StageType.Endless) {
            const cardDatas = UserClassData.getInstance().getDeployedCardData();
            const heroIds = cardDatas.map((v) => { return v.heroId });
            side = heroIds.indexOf(heroId) == -1 ? 1 : 0;
            console.log(`side:${side} ${JSON.stringify(heroIds)} ${heroId}`);
        }

        if (GameManager.getInstance().stageManager.stageData.stageType == StageType.Arena) {
            const cardDatas = UserClassData.getInstance().getDeployedCardData();
            const heroIds = cardDatas.map((v) => { return v.heroId });
            side = heroIds.indexOf(heroId) == -1 ? 1 : 0;
            console.log(`side:${side} ${JSON.stringify(heroIds)} ${heroId}`);
        }

        // 根据英雄类型分配到对应面板
        this.assignHeroToPanel(heroGameObj as GameObject, side);
    }

    //从用户class数据中 设置英雄星级 和攻击力 生命
    private setHeroStarAndAttack(hero: GameObject): void {
        //获取职业  数据
        const classData = UserClassData.getInstance().getClassData(hero.class)
        //获取卡片信息
        const cardData = UserArmyData.getInstance().getCardById(classData.cardId)
        //设置英雄星级
        hero.heroStar = cardData.quality

        //增加 英雄攻击力 和生命
        hero.attack = hero.attack + classData.attack
        hero.maxhp = hero.maxhp + classData.maxhp
    }

    //从科技树中 设置英雄防御力
    private setHeroDataFromTechTree(hero: GameObject): void {
        const techTreeData = UserTechTreeData.getInstance()
        const defense = techTreeData.getTotalBonus(TechNodeType.DEFENSE)
        const attack = techTreeData.getTotalBonus(TechNodeType.ATTACK)
        const maxhp = techTreeData.getTotalBonus(TechNodeType.HEALTH)

        console.log(`科技树防御力: ${defense}, 攻击力: ${attack}, 生命: ${maxhp}`);

        hero.defense = hero.defense + defense
        hero.attack = hero.attack + attack
        hero.maxhp = hero.maxhp + maxhp
    }


    /**
     * 从圣物中设置英雄数据
     * @param hero 英雄对象
     */
    private setHeroDataFromRelics(hero: GameObject): void {
        const relicData = UserRelicData.getInstance();
        const totalBonuses = relicData.calculateTotalBonuses();

        for (const type in totalBonuses) {
            const value = totalBonuses[type as SkillEffectType];
            if (!value || value === 0) continue;

            // 根据效果类型应用到英雄属性
            switch (type) {
                case SkillEffectType.ATTACK:
                    // 圣物的攻击力是固定数值加成
                    hero.attack += value;
                    break;
                case SkillEffectType.MAXHP:
                    // 最大生命值：基于原值的百分比增加
                    hero.maxhp *= (1 + value);
                    break;
                case SkillEffectType.SKILL_COOLDOWN:
                    // 技能冷却：累加技能冷却减少百分比
                    hero.skill_cd_reduce += Math.abs(value);
                    break;
                case SkillEffectType.CRIT_RATE:
                    // 暴击率：直接累加百分比
                    hero.crit_rate += value;
                    break;
                case SkillEffectType.CRIT_DAMAGE:
                    // 暴击伤害：直接累加百分比
                    hero.crit_damage += value;
                    break;
                case SkillEffectType.DEFENSE:
                    // 防御力：基于原值的百分比增加
                    hero.defense *= (1 + value);
                    break;
                case SkillEffectType.DAMAGE_REDUCTION:
                    // 伤害减免：直接累加百分比
                    hero.damageReduction += value;
                    break;
                default:
                    break;
            }
        }

        // 如果英雄还活着，更新当前血量为最大血量
        if (hero.hp > 0) {
            hero.hp = hero.maxhp;
        }
    }

    //从装备中 设置英雄数据
    private setHeroDataFromEquipment(hero: GameObject): void {
        const equipmentData = UserEquipmentData.getInstance()

        // 获取天选装备栏的所有装备
        const chosenEquipments = equipmentData.getChosenEquipSlots()

        // 遍历所有装备，应用对应职业的效果
        chosenEquipments.forEach(userEquip => {
            if (!userEquip) return

            // 获取装备的实际技能效果（包含等级加成）
            const actualEffects = equipmentData.getEquipmentActualSkillEffects(userEquip.equipId)

            // 应用装备效果到英雄身上
            actualEffects.forEach(effect => {
                this.applyEquipmentEffectToHero(hero, effect)
            })
        })

        // 更新当前血量为最大血量（如果英雄还活着）
        if (hero.hp > 0) {
            hero.hp = hero.maxhp
        }
    }

    /**
     * 将装备效果应用到英雄身上
     * @param hero 英雄对象
     * @param effect 装备效果
     */
    private applyEquipmentEffectToHero(hero: GameObject, effect: SkillEffect): void {
        // 检查效果是否适用于该英雄的职业
        if (effect.targetClass !== 99 && effect.targetClass !== hero.class) {
            return // 不适用于该英雄职业
        }

        // 是否是治疗职业（牧师）
        const isHealer = hero.class === ClassType.PRIEST;

        // 根据效果类型应用到英雄属性
        switch (effect.type) {
            case SkillEffectType.ATTACK:
                // 攻击力：基于原值的百分比增加
                hero.attack = hero.attack * (1 + effect.value)
                // 治疗职业：攻击力也转换为医疗量
                // if (isHealer) {
                //     // hero.healing_power_equip = hero.healing_power_equip + 100 * ( effect.value)
                //     hero.healing_power = hero.healing_power + 100 * ( effect.value)
                // }
                break
            case SkillEffectType.MAXHP:
                // 最大生命值：基于原值的百分比增加
                hero.maxhp = hero.maxhp * (1 + effect.value)
                break
            case SkillEffectType.SKILL_COOLDOWN:
                // 技能冷却：累加技能冷却减少百分比
                hero.skill_cd_reduce = hero.skill_cd_reduce + Math.abs(effect.value)
                break
            case SkillEffectType.CRIT_RATE:
                // 暴击率：直接累加百分比
                hero.crit_rate = hero.crit_rate + effect.value
                break
            case SkillEffectType.CRIT_DAMAGE:
                // 暴击伤害：直接累加百分比
                hero.crit_damage = hero.crit_damage + effect.value
                break
            case SkillEffectType.DEFENSE:
                // 防御力：基于原值的百分比增加
                hero.defense = hero.defense * (1 + effect.value)
                break
            case SkillEffectType.DAMAGE_REDUCTION:
                // 伤害减免：直接累加百分比
                hero.damageReduction = hero.damageReduction + effect.value
                break
            case SkillEffectType.LIFESTEAL_PERCENT:
                // 吸血：直接累加百分比
                hero.lifesteal_percent = hero.lifesteal_percent + effect.value
                break
            case SkillEffectType.MOVE_SPEED:
                // 移动速度：基于原值的百分比增加
                hero.moveSpeed = hero.moveSpeed * (1 + effect.value)
                break
            case SkillEffectType.ATTACK_RANGE:
                // 攻击范围：基于原值的百分比增加
                hero.attackRange = hero.attackRange * (1 + effect.value)
                break
            case SkillEffectType.THORN_ARMOR:
                // 反甲：直接累加数值
                hero.thornArmor = hero.thornArmor + effect.value
                break
            case SkillEffectType.HEALING_POWER:
                // 治疗量：基于原值的百分比增加
                hero.healing_power = hero.healing_power * (1 + effect.value)
                break
            default:
                break
        }
    }

    /**
     * 根据英雄类型分配到对应面板
     * @param hero 英雄GameObject
     */
    private assignHeroToPanel(hero: GameObject, side: number): void {
        const heroInstance = hero as Heros;
        const heroClass = heroInstance.class;
        const heroName = heroInstance.name;

        console.log(`分配英雄 ${heroName} (职业: ${heroClass}) 到面板`);

        this.setHeroStarAndAttack(hero)
        //输出英雄星级 和攻击力 生命

        this.setHeroDataFromTechTree(hero)
        console.log(`英雄星级: ${hero.heroStar}, 攻击力: ${hero.attack}, 生命: ${hero.maxhp}`);
        console.log(`英雄治疗量: ${hero.healing_power} 装备治疗量: ${hero.healing_power_equip}`);

        //从圣物中 设置英雄数据
        this.setHeroDataFromRelics(hero);

        //从装备中 设置英雄数据
        this.setHeroDataFromEquipment(hero)
        console.log(`英雄星级: ${hero.heroStar}, 攻击力: ${hero.attack}, 生命: ${hero.maxhp}`);
        console.log(`英雄治疗量: ${hero.healing_power} 装备治疗量: ${hero.healing_power_equip}`);

        let heroAssigned = false;

        switch (heroClass) {
            case 0: // 坦克
                if (this.heroPanels[side][0] && this.heroPanels[side][0].isOpen && !this.heroPanels[side][0].hero) {
                    console.log(`${heroName} 分配到坦克面板`);
                    this.heroPanels[side][0].initPanelData(hero);
                    heroAssigned = true;
                } else {
                    console.warn(`坦克面板不可用或已有英雄`);
                }
                break;

            case 1: // 辅助/治疗师
            case 2: // 射手
            case 3: // 法师
            case 4: // 刺客
                // 其他职业分配到通用英雄面板
                const availablePanel = this.findAvailableHeroPanel(side);
                if (availablePanel) {
                    console.log(`${heroName} 分配到英雄面板`);
                    availablePanel.initPanelData(hero);
                    heroAssigned = true;
                } else {
                    console.warn(`没有可用的英雄面板`);
                }
                break;

            default:
                console.warn(`未知的英雄职业: ${heroClass}`);
                break;
        }

        // 【新增】如果英雄成功分配，则同步更新 StageManager 的英雄数量
        if (heroAssigned) {
            this.updateStageManagerHeroCount();
        }
    }

    /**
     * 查找可用的英雄面板(不包含坦克)（已开启且没有英雄）
     * @returns 可用的英雄面板或null
     */
    private findAvailableHeroPanel(side: number): HeroPanel | null {
        // console.log(`>>>>>>>>>>>>>>>>${side}`);

        const heroPanels = this.heroPanels[side];
        for (let i = 1; i < heroPanels.length; ++i) {
            const panel = heroPanels[i];
            if (panel && panel.isOpen && !panel.hero) {
                return panel;
            }
            // if (!panel) {
            //     console.warn(`>>>>>${i}>>>!panel`);
            // } else {
            //     if (!panel.isOpen) {
            //         console.warn(`>>>>>${i}>>>close`);
            //     }
            //     if (panel.hero) {
            //         console.warn(`>>>>>${i}>>>hero`);
            //     }
            // }
        }
        return null;
    }

    /**
     * 获取所有已上场的英雄面板
     */
    public getActiveHeroPanels(): HeroPanel[] {
        const activePanels: HeroPanel[] = [];
        for (const group of this.heroPanels) {
            for (const panel of group) {
                // 确保面板存在，已开启，并且上面有英雄
                if (panel && panel.isOpen && panel.hero) {
                    activePanels.push(panel);
                }
            }
        }

        return activePanels;
    }

    /**
     * 获取所有已上场的英雄
     */
    public getActiveHeroes(): GameObject[] {
        return this.getActiveHeroPanels().map(panel => panel.hero);
    }

    /**
     * 【新增】更新 StageManager 的英雄数量统计
     */
    private updateStageManagerHeroCount(): void {
        const activePanels = this.getActiveHeroPanels();
        const totalHeroes = activePanels.length;

        // 计算存活英雄数（未死亡的英雄）
        const aliveHeroes = activePanels.filter(panel => !panel.isDead).length;

        console.log(`[HerosManager] 更新 StageManager 英雄数量: 存活=${aliveHeroes}, 总数=${totalHeroes}`);

        // 通知 StageManager
        const stageComponent = StageComponent.getInstance();
        if (stageComponent && stageComponent.stageManager) {
            stageComponent.stageManager.setHeroCount(aliveHeroes, totalHeroes, this.principal.isDead);
            console.log(`[HerosManager] 已通知 StageManager 英雄数量更新`);
        } else {
            console.warn(`[HerosManager] 无法通知 StageManager，StageComponent 或 StageManager 不存在`);
        }
    }

    /**
     * 【新增】公共方法：手动更新 StageManager 英雄数量
     * 可以在英雄死亡/复活等情况下调用
     */
    public notifyStageManagerHeroCountChanged(): void {
        this.updateStageManagerHeroCount();
    }

    public deployAllInitialHeroes(): void {
        const glm = GameLevelUpManager.getInstance();
        if(!glm) return;
        const candidates = glm.getHeroCandidates();
        const total = (candidates?.[0]?.length || 0) + (candidates?.[1]?.length || 0);
        const active = this.getActiveHeroes().length;
        if(active >= total) return;
        candidates?.[0]?.forEach(h=>{ glm.selectHero(h); });
        candidates?.[1]?.forEach(h=>{ glm.selectHeroForEnemy(h); });
        this.notifyStageManagerHeroCountChanged();
    }
}
