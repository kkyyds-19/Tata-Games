import { _decorator, Component, Node, Label, Sprite, resources, director, sys } from 'cc';
import { game } from 'cc';
import { MusicManager } from '../../music/MusicManager';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { Hall } from '../hall';
import { Utils } from '../../utils/Utils';

const { ccclass, property } = _decorator;

@ccclass('DnfItem')
export class DnfItem extends Component {

    
    @property({ type: [Sprite], tooltip: "框框数组，共4个" })
    public starSprites: Sprite[] = [];

    @property({ type: Sprite, tooltip: "icon背景图Sprite" })
    public backgroundSprite: Sprite = null;

    @property({ type: Sprite, tooltip: "标题底框Sprite" })
    public titleBackgroundSprite: Sprite = null;

    @property({ type: Sprite, tooltip: "标题Sprite" })
    public titleSprite: Sprite = null;

    @property({ type: Sprite, tooltip: "左边怪兽Sprite" })
    public leftSprite: Sprite = null;

    @property({ type: Label, tooltip: "挑战次数" })
    public tiaozhanLabel: Label = null;

    @property({ type: Label, tooltip: "传说文本标签" })
    public legendTextLabel: Label = null;

    @property({ type: Node, tooltip: "传说UI节点" })
    public legendUI: Node = null;

    @property({ tooltip: "关卡记录" })
    public legendText: string = "关卡记录";

    private m_idx:number = -1;
    private m_rarity: number = -1;
    private m_callback: (sender: any) => void = null;
    private hallInstance: Hall = null;
    
    /**
     * 初始化DnfItem
     * @param idx 索引
     * @param rarity 稀有度
     * @param hallInstance Hall实例
     * @param callback 回调函数
     */
    public init(idx: number, rarity: number, hallInstance: Hall, callback: (sender: any) => void) {
        this.m_idx = idx;
        this.m_rarity = rarity;
        this.hallInstance = hallInstance;
        this.m_callback = callback;
        this.updateTitle(idx,rarity);
   
        this.node.active = true;
    }

    /**
     * 更新标题显示
     */
    private updateTitle(count: number, skinIds: number) {
        if (this.tiaozhanLabel) {
            const maxCount = 20; // 根据需求，固定最大值为20
            this.tiaozhanLabel.string = `挑战次数: (${count}/${maxCount})`;
        }

        this.updateBackground(skinIds);
        this.updateTitleBg(skinIds);
        this.updateLeftSkin(skinIds);
    }

    private updateBackground(skinIds: number) {
        if (!this.backgroundSprite || !this.backgroundSprite.spriteAtlas) {
            console.warn("[DnfIcon] 背景Sprite或其图集未设置");
            return;
        }

        let frameName = "dnf_11"; // 默认传说
        if (skinIds === 1) { // 神话
            frameName = "dnf_10";
        }else if (skinIds === 2) { // 史诗
            frameName = "dnf_46";
        }else if (skinIds === 3) { // 稀有
            frameName = "dnf_44";
        }else if (skinIds === 4) { // 常规
            frameName = "dnf_50";
        }
        
        const spriteFrame = this.backgroundSprite.spriteAtlas.getSpriteFrame(frameName);
        if (spriteFrame) {
            this.backgroundSprite.spriteFrame = spriteFrame;
        } else {
            console.warn(`[DnfIcon] 在图集中未找到背景框: ${frameName}`);
        }
    }

    private updateTitleBg(skinIds: number) {
        if (!this.titleBackgroundSprite || !this.titleBackgroundSprite.spriteAtlas) {
            console.warn("[DnfIcon] 背景Sprite或其图集未设置");
            return;
        }

        let frameName = "dnf_35"; // 默认传说
        if (skinIds === 1) { // 神话
            frameName = "dnf_36";
        }else if (skinIds === 2) { // 史诗
            frameName = "nf_35";
        }else if (skinIds === 3) { // 史诗
            frameName = "dnf_36";
        }else if (skinIds === 4) { // 常规
            frameName = "dnf_48";
        }
        
        const spriteFrame = this.titleBackgroundSprite.spriteAtlas.getSpriteFrame(frameName);
        if (spriteFrame) {
            this.titleBackgroundSprite.spriteFrame = spriteFrame;
        } else {
            console.warn(`[DnfIcon] 在图集中未找到背景框: ${frameName}`);
        }

        let frameName2 = "dnf_28"; // 默认传说
        if (skinIds === 1) { // 神话
            frameName2 = "dnf_39";
        }else if (skinIds === 2) { // 史诗
            frameName2 = "dnf_43";
        }else if (skinIds === 3) { // 史诗
            frameName2 = "dnf_45";
        }else if (skinIds === 4) { // 常规
            frameName2 = "dnf_47";
        }

        const spriteFrame2 = this.titleSprite.spriteAtlas.getSpriteFrame(frameName2);
        if (spriteFrame2) {
            this.titleSprite.spriteFrame = spriteFrame2;
        } else {
            console.warn(`[DnfIcon] 在图集中未找到背景框: ${frameName2}`);
        }

        const isLegend = frameName2 === "dnf_28";
        if (this.legendUI) this.legendUI.active = isLegend;
        if (isLegend && this.legendTextLabel) {
            try {
                const saved = parseInt(sys.localStorage.getItem('Abyss.maxLayer') || '0');
                const layer = Math.max(1, saved);
                this.legendTextLabel.string = `第${layer}层`;
            } catch {
                this.legendTextLabel.string = this.legendText;
            }
        }
    }

    private updateLeftSkin(skinIds: number) {
        if (!this.leftSprite || !this.leftSprite.spriteAtlas) {
            console.warn("[DnfIcon] 背景Sprite或其图集未设置");
            return;
        }

        let frameName = "dnf_1"; // 默认传说
        if (skinIds === 1) { // 神话
            frameName = "dnf_2";
        }else if( skinIds === 2) { // 史诗
            frameName = "dnf_41";
        }else if (skinIds === 3) { // 稀有
            frameName = "dnf_42";
        }else if (skinIds === 4) { // 常规
            frameName = "dnf_49";
        }
        
        const spriteFrame = this.leftSprite.spriteAtlas.getSpriteFrame(frameName);
        if (spriteFrame) {
            this.leftSprite.spriteFrame = spriteFrame;
        } else {
            console.warn(`[DnfIcon] 在图集中未找到背景框: ${frameName}`);
        }
    }

    //开始进入游戏
    /**
     * 开始游戏 - 切换到游戏场景
     * @param stageId 关卡编号（可选，用于设置当前关卡）
     */
    private onStartClick(){
        console.warn("dnf游戏开始",this.m_idx);
        //game.myGlobal.stageType = 3;
        if(this.m_idx == 0){
             //点击战歌
             if (this.hallInstance) {
                 this.hallInstance.onCanyonButtonTapped();
                 return;
             }
        }else if (this.m_idx == 1) {
            //点击荣誉 - 跳转到PK竞技场
            console.log("点击荣誉竞技场")
            if (this.hallInstance) {
                this.hallInstance.onPkButtonTapped();
                return; // 阻止继续执行默认的游戏场景加载逻辑
            }
        }else if (this.m_idx == 2) {
            //点击燃烧 - 跳转到 DurnMain 界面
            console.log("点击燃烧模式")
            if (this.hallInstance) {
                this.hallInstance.onDurnButtonTapped();
                return; // 阻止继续执行默认的游戏场景加载逻辑
            }
        
          
        }else if (this.m_idx == 3) {
            //点击虚空
            game.myGlobal.stageType = 3;
            game.myGlobal.currentStage = 319; 
        
           
        }else if (this.m_idx == 4) {
            //点击深渊
            game.myGlobal.stageType = 3;
            game.myGlobal.currentStage = 200; 

            // 深渊挑战：初始化为26级，并预置26次技能/装备选择
            try {
                const totalExpForLv26 = Utils.getTotalExpForLevel(26);
                game.myGlobal.currentExp = totalExpForLv26;
            } catch (e) {
                console.warn('[DnfItem] 计算26级总经验失败，保持当前经验。', e);
            }
            // 标记深渊选择模式与次数（由 GameLevelUpManager 消费）
            (game.myGlobal as any).abyssMode = true;
            (game.myGlobal as any).abyssSelectCount = 26;

        }

        MusicManager.getInstance().stopBackgroundMusic();
        game.myGlobal.gameInited = 0;
        
        game.myGlobal.currentWorld = 1;
        // TimeManager.getInstance().pause();
        // director.emit(game.gameEvent.GAME_HALL_WORLD_CHANGE);
        console.log(`开始游戏，关卡：${game.myGlobal.currentStage}`);
       
        director.loadScene('game');
    }
    
    public setLegendText(text: string) {
        this.legendText = text;
        if (this.legendTextLabel) this.legendTextLabel.string = text;
    }
   
}


