import { _decorator, Component, Node, Label, Button, game, Prefab, instantiate } from 'cc';
import { TimeManager } from '../game/TimeManager';
import { DamageStatsManager, IHeroDamageStats } from '../game/DamageStatsManager';
import { ResultHeroIcon } from './ResultHeroIcon';
import { Utils } from '../utils/Utils';
import { find } from 'cc';
import { StageComponent } from '../game/stage/StageComponent';
import { GameManager } from '../game/GameManager';
import { EffectContainer } from '../game/EffectContainer';
import { BulletManager } from '../game/BulletManager';
import { AnimationLoader } from '../game/AnimationLoader';
import { Custom2D_Collide_Manager } from '../Custom_Collide/Custom2D_Manager';
import { director } from 'cc';
import { MusicManager } from '../music/MusicManager';
import { Toggle } from 'cc';
import { HerosManager } from '../game/HerosManager';
import { SmallHeroIcon } from './SmallHeroIcon';
import { UserSettings } from '../user/UserSettings';
import { UserEquipmentData } from '../user/UserEquipmentData';
import { EquipIcon } from '../hall/equip/EquipIcon';

const { ccclass, property } = _decorator;

/**
 * 游戏结果界面组件
 * 处理游戏胜利/失败的结果展示和英雄伤害统计
 */
@ccclass('GamePause')
export class GamePause extends Component {

    @property(Label)
    stageLabel: Label = null;

    //英雄列表list
    @property(Node)
    private hero_list:Node []= [];

    //装备列表list
    @property(Node)
    private qeuip_list:Node []= [];

    //关卡设置
    @property(Node)
    public stage_setting:Node | null = null;

    //低画质
    @property(Toggle)
    public low_quality:Toggle | null = null;

    //高画质
    @property(Toggle)
    public high_quality:Toggle | null = null;

    //伙伴自动
    @property(Toggle)
    public partner_auto:Toggle | null = null;

    //伤害显示
    @property(Toggle)
    public damage_display:Toggle | null = null;
    
   //特效显示
    @property(Toggle)
    public effect_display:Toggle | null = null;

    //音乐
    @property(Toggle)
    public music:Toggle | null = null;

    //音效
    @property(Toggle)
    public sound:Toggle | null = null;



    @property (Prefab)
    private prefab_hero:Prefab =null

    @property (Prefab)
    private prefab_qeuip:Prefab =null

    // 用户设置管理器
    private userSettings: UserSettings = null;

    onLoad() {

        this.stage_setting.on(Node.EventType.TOUCH_START , (event)=>{
            console.log('stage_setting')
            // 在Cocos Creator中阻止事件传播的方法
            if (event && typeof event.stopPropagation === 'function') {
                event.stopPropagation();
            } else if (event) {
                event.propagationStopped = true;
            }
            return false; // 返回false阻止事件继续传播
        }, this)

        this.node.on(Node.EventType.TOUCH_START , ()=>{
            // 如果自动选择激活，禁用用户交互
                  this.closerPause()
                return
            
        }, this)

       
    }
    
    protected start(): void {
        this.stageLabel.string = `关卡： ${game.myGlobal.currentStage }`;

        // 初始化用户设置
        this.userSettings = UserSettings.getInstance();
        
        // 初始化Toggle状态
        this.initializeToggles();
        
        // 绑定Toggle事件
        this.bindToggleEvents();
    }

   

    updateHeroList(){
        const heros =  HerosManager.getInstance().getActiveHeroes()
        this.hero_list.forEach(item=>{
            item.removeAllChildren()
        })
         //获取当前已上场的英雄列表
        for(let i=0;i<heros.length;i++){
            const heroNode = instantiate(this.prefab_hero)
            const smallHeroIcon = heroNode.getComponent(SmallHeroIcon)
            smallHeroIcon.setHeroByGameObject(heros[i])
            heroNode.parent = this.hero_list[i];
        }

        
    }

    updateEquipList(){

        //优先显示天选装备 然后是临时装备
        const chosenEquips = UserEquipmentData.getInstance().getChosenEquipSlots().filter(equip => equip !== null)
        const tempEquips = UserEquipmentData.getInstance().getTemporaryEquipments()
        const equips = [...chosenEquips, ...tempEquips]

        this.qeuip_list.forEach((item,i)=>{
            item.removeAllChildren();

            if(equips[i]){
                const equipNode = instantiate(this.prefab_qeuip)
                equipNode.setScale(0.86,0.86)
                equipNode.parent = item
                const equipIcon = equipNode.getComponent(EquipIcon)
                equipIcon.updateFromEquipId(equips[i].equipId,false)
            }
        })

       
    }

    showPause(){
        this.node.active = true;
        TimeManager.getInstance().pause();
        
        // 更新英雄列表
        this.updateHeroList();

        // 更新装备列表
        this.updateEquipList();
        
        // 刷新Toggle状态以确保与当前设置同步
        this.refreshToggleStates();
    }
    

    closerPause(){
        MusicManager.getInstance().playButtonClickSound()
        this.node.active = false;
        TimeManager.getInstance().resume();
    }

    
    onbackClick(){
        MusicManager.getInstance().playButtonClickSound()
        const gameManager = GameManager.getInstance();
        if(gameManager){
            gameManager.endGameAndReturnToHall()    
        }

    }

  

    /**
     * 初始化Toggle状态
     */
    private initializeToggles(): void {
        if (!this.userSettings) return;

        // 设置画质Toggle (互斥)
        const isHighQuality = this.userSettings.getHighQuality();
        if (this.high_quality) {
            this.high_quality.isChecked = isHighQuality;
        }
        if (this.low_quality) {
            this.low_quality.isChecked = !isHighQuality;
        }

        // 设置伙伴自动
        if (this.partner_auto) {
            this.partner_auto.isChecked = this.userSettings.getAutoPartner();
        }

        // 设置伤害显示
        if (this.damage_display) {
            this.damage_display.isChecked = this.userSettings.getShowDamageNumbers();
        }

        // 设置特效显示
        if (this.effect_display) {
            this.effect_display.isChecked = this.userSettings.getShowEffects();
        }

        // 设置音乐和音效
        const musicManager = MusicManager.getInstance();
        if (musicManager) {
            if (this.music) {
                this.music.isChecked = !musicManager.isMusicEnabled();
            }
            if (this.sound) {
                this.sound.isChecked = !musicManager.isSoundEnabled();
            }
        }

        console.log('GamePause: Toggle状态已初始化');
    }

    /**
     * 绑定Toggle事件
     */
    private bindToggleEvents(): void {
        // 高画质Toggle
        if (this.high_quality) {
            this.high_quality.node.on(Toggle.EventType.TOGGLE, this.onHighQualityToggle, this);
        }

        // 低画质Toggle
        if (this.low_quality) {
            this.low_quality.node.on(Toggle.EventType.TOGGLE, this.onLowQualityToggle, this);
        }

        // 伙伴自动Toggle
        if (this.partner_auto) {
            this.partner_auto.node.on(Toggle.EventType.TOGGLE, this.onPartnerAutoToggle, this);
        }

        // 伤害显示Toggle
        if (this.damage_display) {
            this.damage_display.node.on(Toggle.EventType.TOGGLE, this.onDamageDisplayToggle, this);
        }

        // 特效显示Toggle
        if (this.effect_display) {
            this.effect_display.node.on(Toggle.EventType.TOGGLE, this.onEffectDisplayToggle, this);
        }

        // 音乐Toggle
        if (this.music) {
            this.music.node.on(Toggle.EventType.TOGGLE, this.onMusicToggle, this);
        }

        // 音效Toggle
        if (this.sound) {
            this.sound.node.on(Toggle.EventType.TOGGLE, this.onSoundToggle, this);
        }

        console.log('GamePause: Toggle事件已绑定');
    }

    /**
     * 高画质Toggle事件
     */
    private onHighQualityToggle(toggle: Toggle): void {
        if (toggle.isChecked) {
            this.userSettings.setHighQuality(true);
            // 自动取消低画质
            if (this.low_quality) {
                this.low_quality.isChecked = false;
            }
        } else {
            // 如果取消高画质，自动选择低画质
            this.userSettings.setHighQuality(false);
            if (this.low_quality) {
                this.low_quality.isChecked = true;
            }
        }
    }

    /**
     * 低画质Toggle事件
     */
    private onLowQualityToggle(toggle: Toggle): void {
        if (toggle.isChecked) {
            this.userSettings.setHighQuality(false);
            // 自动取消高画质
            if (this.high_quality) {
                this.high_quality.isChecked = false;
            }
        } else {
            // 如果取消低画质，自动选择高画质
            this.userSettings.setHighQuality(true);
            if (this.high_quality) {
                this.high_quality.isChecked = true;
            }
        }
        director.emit(game.gameEvent.GAME_HIGH_QUALITY_CHANGE, toggle.isChecked);
    }

    /**
     * 伙伴自动Toggle事件
     */
    private onPartnerAutoToggle(toggle: Toggle): void {
        this.userSettings.setAutoPartner(toggle.isChecked);
        director.emit(game.gameEvent.GAME_PARTNER_AUTO_CHANGE, toggle.isChecked);
    }

    /**
     * 伤害显示Toggle事件
     */
    private onDamageDisplayToggle(toggle: Toggle): void {
        this.userSettings.setShowDamageNumbers(toggle.isChecked);
        director.emit(game.gameEvent.GAME_DAMAGE_DISPLAY_CHANGE, toggle.isChecked);
    }

    /**
     * 特效显示Toggle事件
     */
    private onEffectDisplayToggle(toggle: Toggle): void {
        this.userSettings.setShowEffects(toggle.isChecked);
        director.emit(game.gameEvent.GAME_EFFECT_DISPLAY_CHANGE, toggle.isChecked);
    }

    /**
     * 音乐Toggle事件
     */
    private onMusicToggle(toggle: Toggle): void {
        const musicManager = MusicManager.getInstance();
        if (musicManager) {
            musicManager.setMusicEnabled(!toggle.isChecked);
        }
    }

    /**
     * 音效Toggle事件
     */
    private onSoundToggle(toggle: Toggle): void {
        const musicManager = MusicManager.getInstance();
        if (musicManager) {
            musicManager.setSoundEnabled(!toggle.isChecked);

            musicManager.playButtonClickSound()
        }
    }

    /**
     * 刷新Toggle状态（用于外部调用同步状态）
     */
    public refreshToggleStates(): void {
        this.initializeToggles();
    }

    onDestroy() {
    }
}

