import { _decorator, Component, Node } from 'cc';
import { HeroCardDisplay } from './HeroCardDisplay';
import { HeroCard } from './HeroCard';
import { director } from 'cc';
import { game } from 'cc';
import { UITransform } from 'cc';
import { Widget } from 'cc';
import { Prefab } from 'cc';
import { Button } from 'cc';
import { Color } from 'cc';
import { Sprite } from 'cc';
import { Label } from 'cc';
import { CardData, UserArmyData } from '../../user/UserArmyData';
import { UserClassData } from '../../user/UserClassData';
import { tween } from 'cc';
import { Vec3 } from 'cc';
import { myHeroAPI } from '../../api/MyHeroAPI';
import { ShowToast } from '../../global/Toast';

const { ccclass, property } = _decorator;

/**
 * 军队面板组件
 * 空的控件，只提供显示和隐藏功能
 */
@ccclass('FullScreenTupo')
export class FullScreenTupo extends Component {


    @property(Node)
    public army_down:Node | null = null;

    //要突破的英雄卡片面板
    @property(Node)
    public main_heroCard:Node | null = null;

    //突破后的英雄卡片面板
    @property(Node)
    public aim_heroCard:Node | null = null;

    @property(Label)
    public heroCard_name:Label | null = null;

    @property(Label)
    public heroCard_tips:Label | null = null;

   
      //突破后生命提升
    @property(Label)
    public heroCard_life:Label | null = null;
    //突破后攻击提升
    @property(Label)
    public heroCard_attack:Label | null = null;
    
   //突破后等级提升
   @property(Label)
   public heroCard_level:Label | null = null;
    
 //自动突破按钮 文字状态 0 未突破 1 突破中 2 突破成功
   @property(Label)
   public autoBreak_btn_text:Label | null = null;

   // 遮罩节点
   @property(Node)
   public markNode: Node = null;

   // 提示标签
   @property(Label)
   public tipLabel: Label = null;




    //突破需要的英雄卡片面板1 left
    @property(Node)
    public left_node:Node | null = null;

    //突破需要的英雄卡片面板2 right
    @property(Node)
    public right_node:Node | null = null;


    //成功突破后 显示的节点
    @property(Node)
    public breakthroughSuccess:Node | null = null;

    //成功突破后 显示的英雄卡片
    @property(Node)
    public breakthroughSuccessHeroCard:Node | null = null;

    //成功突破 攻击数字
    @property(Label)
    public breakthroughSuccessAttack:Label | null = null;

    //成功突破 攻击加成提升数字
    @property(Label)
    public breakthroughSuccessAttackAdd:Label | null = null;

    //成功突破 生命数字
    @property(Label)
    public breakthroughSuccessLife:Label | null = null;

    //成功突破 生命加成提升数字
    @property(Label)
    public breakthroughSuccessLifeAdd:Label | null = null;

    //成功突破 其他文字
    @property(Label)
    public breakthroughSuccessOther:Label | null = null;

    //成功突破 暴击提示文字
    @property(Label)
    public breakthroughSuccessCrit:Label | null = null;






    //突破按钮
    @property(Button)
    public break_btn:Button | null = null;

    @property(Button)
    public abyss_btn:Button | null = null;


    //英雄卡片prefab
    @property(Prefab)
    public heroCardPrefab:Prefab | null = null;

    public heroCardDisplay:HeroCardDisplay | null = null;

    private isPullUp:boolean = false;



    onLoad() {
        this.clearAll();
        this.main_heroCard.on(Node.EventType.TOUCH_START,()=>{
            this.onclickMain()
            this.willaddUpdate()
        })

        this.left_node.on(Node.EventType.TOUCH_START,()=>{
            this.onclickLeft()
            this.updateBreakBtn()
        })

        this.right_node.on(Node.EventType.TOUCH_START,()=>{
            this.onclickRight()
            this.updateBreakBtn()
        })

        this.node.on(Node.EventType.TOUCH_START,()=>{

        })

        this.markNode.on(Node.EventType.TOUCH_START,()=>{
            
        })

        this.breakthroughSuccess.on(Node.EventType.TOUCH_START,()=>{
          
        })

        this.breakthroughSuccess.active=false;
    }
    
   
    start() {
        if(this.army_down){
            const heroCardDisplay = this.army_down.getComponent(HeroCardDisplay);
            heroCardDisplay.setOnHeroCardClick((card:HeroCard)=>{
                

                if(card.choose.active){
                      // 检查是否点击已选中的卡片，如果是则取消选中
                    if (this.isCardAlreadySelected(card.cardData.cardId)) {
                        this.cancelCardSelection(card.cardData.cardId);
                    }
                    return
                }
                
               this.handleHeroCardClick(card);
               this.updateBreakBtn()
               this.updateCardlist()
               this.willaddUpdate()
            });
            heroCardDisplay.setExcludeDeployedCards(false);
            this.heroCardDisplay=heroCardDisplay;
            this.pullUp(null,true);
        }
        
    }

   // 如果 突破 会得到的提升 文字更新
    public willaddUpdate(){
        const mainHeroCard = this.main_heroCard.getComponent(HeroCard);
        const mainHeroData = mainHeroCard.cardData;

        const aimHeroCard = this.aim_heroCard.getComponent(HeroCard);
        const aimHeroData = aimHeroCard.cardData;

        this.heroCard_name.string=aimHeroData.name;
        //品质提升
        this.heroCard_tips.string='品质提升 +1'

        const upgradeValue=UserClassData.getInstance().calculateUpgradeValue(
            mainHeroData.quality,
            mainHeroData.sLevel,
            mainHeroData.sLevel,
            aimHeroData.quality,
            aimHeroData.sLevel,
            aimHeroData.sLevel
           );
      
        //生命提升了多少
        this.heroCard_life.string='+'+upgradeValue.addMaxHp

        this.heroCard_attack.string='+'+upgradeValue.addAttack

        //等级提升
        const oldLevel=UserClassData.getInstance().getMaxLevelByQuality(mainHeroData.quality);
        const newLevel=UserClassData.getInstance().getMaxLevelByQuality(mainHeroData.quality+1);
        const addLevel=newLevel-oldLevel;   
        this.heroCard_level.string='+'+addLevel
        this.updateAbyssBtn()
    }

    public closeBreakSuccess(){
        this.breakthroughSuccess.active=false;
        this.breakthroughSuccessHeroCard.active=false;
        this.heroCardDisplay.refreshHeroCards();
    }

    public clearAll(){
        this.main_heroCard.active=false
        this.aim_heroCard.active=false
        this.left_node.active=false
        this.right_node.active=false
        this.updateBreakBtn()
        if (this.abyss_btn) {
            const s = this.abyss_btn.node.getComponent(Sprite);
            if (s) s.grayscale = true;
            this.abyss_btn.interactable = false;
        }
    }

    private updateBreakBtn(){
       const spirte=this.break_btn.node.getComponent(Sprite)
       const canBreak = this.main_heroCard.active && this.left_node.active && this.right_node.active;
       spirte.grayscale = !canBreak;
       this.break_btn.interactable = canBreak;
       if (canBreak) {
            this.showBreakSuccessAnimation(this.break_btn.node)
       }
    }
    private updateAbyssBtn(){
        if (!this.abyss_btn) return;
        const s = this.abyss_btn.node.getComponent(Sprite);
        const can = this.main_heroCard.active;
        if (s) s.grayscale = !can;
        this.abyss_btn.interactable = can;
    }


    private handleHeroCardClick(card:HeroCard){
      

        //点击逻辑  第一次点级，显示要突破的英雄卡片面板，  创建一个要突破的英雄卡片
        if(this.main_heroCard&&this.main_heroCard.active===false){
            this.main_heroCard.active=true;
            this.main_heroCard.getComponent(HeroCard).setHeroDataWithCardData(card.cardData);
            this.heroCardDisplay.setFilter((card.cardData.class+1)%6);

            //创建一个零时 英雄卡片 用于显示要突破的英雄卡片
           this.aim_heroCard.active=true;
            const new_cardData={
                name:card.cardData.name,
                cardId:card.cardData.cardId,
                heroId:card.cardData.heroId,
                class:card.cardData.class,
                quality:card.cardData.quality+1,
                sLevel:card.cardData.sLevel,
                attackType:card.cardData.attackType
            }
       
            this.aim_heroCard.getComponent(HeroCard).setHeroDataWithCardData(new_cardData);
            this.pullUp(null,false);
           

            return
        }

        if(!this.limitBreakCard(card.cardData)){
               
            return
        }

        //第二次点击 显示 需要突破的英雄卡片 先左边 在右边
        if(this.left_node&&this.left_node.active===false){
            this.left_node.active=true;
            this.left_node.getComponent(HeroCard).setHeroDataWithCardData(card.cardData);
            
            return
        }
        // 第三次点级，显示突破后的英雄卡片    
        if(this.right_node&&this.right_node.active===false){
            this.right_node.active=true;
            this.right_node.getComponent(HeroCard).setHeroDataWithCardData(card.cardData);
            return
        }



    }
    
    //改变 top 位置 刷新widget和所有子控件
    public pullUp(sener:any=null,isPullUp:boolean=null): void {
        if(isPullUp===null) isPullUp=!this.isPullUp;
        this.isPullUp = isPullUp;
        const down_widget = this.army_down.getComponent(Widget);
          
         down_widget.top = this.isPullUp ? 840 : 1350;

            //获取子节点 

            const scrollView=  this.army_down.getChildByName('ScrollView')
            const army_pool_3=  this.army_down.getChildByName('army_pool_3')

           const scrollViewWidget= scrollView.getComponent(Widget)
           scrollViewWidget.top=  this.isPullUp ? 188 : 0;

            army_pool_3.active= this.isPullUp;

            // 更新所有子控件
            this.updateAllChildren(this.army_down);
        
    }

    /**
     * 递归更新所有子控件
     * @param node 要更新的节点
     */
    private updateAllChildren(node: Node): void {
        if (!node) return;
        
        // 更新当前节点的Widget组件
        const widget = node.getComponent(Widget);
        if (widget) {
            widget.updateAlignment();
        }
        
        
        // 递归更新所有子节点
        node.children.forEach(child => {
            this.updateAllChildren(child);
        });
    }

    public  onclickMain(){
        this.clearAll()
        this.pullUp(null,true);
        this.willaddUpdate()
        // this.updateCardlist()
        // this.heroCardDisplay.setFilter(0)
        this.heroCardDisplay.refreshHeroCards(true);
    }
    public  onclickLeft(){
       this.left_node.active=false
       this.updateCardlist()
       this.updateAbyssBtn()
    }
    public  onclickRight(){
        this.right_node.active=false
        this.updateCardlist()
        this.updateAbyssBtn()
    }

    /**
     * 显示面板
     */
    public show(): void {
        this.node.active = true;
        if(this.heroCardDisplay){
            this.heroCardDisplay.refreshHeroCards();
        }
        this.clearAll()
        this.pullUp(null,true);
    }

    /**
     * 隐藏面板
     */
    public hide(): void {
        // this.node.active = false;
        // 需要判断 是否在突破中  是否  以及选择突破的卡片 是否上阵  

        //如果是突破中 弹出toast 提示 正在突破。
        if(this.breakthroughSuccess.active){
            ShowToast('正在突破...');
            return;
        }
        //如果已经 选择了突破的卡片 但是没有突破  //清空 选择卡片  下方list 也要清理
        if(this.main_heroCard.active){
            this.clearAll();
            this.pullUp(null,true);
            this.heroCardDisplay.refreshHeroCards(false);
            return;
        }

        this.node.active = false;
       


    }

    
    public onclickBreak(){
        console.log('FullScreenTupo: 开始单个卡牌突破');
        
        // 获取突破需要的英雄cardId
        const mainHeroCard = this.main_heroCard.getComponent(HeroCard);
        const leftHeroCard = this.left_node.getComponent(HeroCard);
        const rightHeroCard = this.right_node.getComponent(HeroCard);
        
        if (!mainHeroCard.cardData) {
            return;
        }
        const id1 = parseInt(mainHeroCard.cardData.cardId);
        const id2 = this.left_node.active && leftHeroCard.cardData ? parseInt(leftHeroCard.cardData.cardId) : undefined;
        const id3 = this.right_node.active && rightHeroCard.cardData ? parseInt(rightHeroCard.cardData.cardId) : undefined;
        if (isNaN(id1)) {
            return;
        }
        console.log(`FullScreenTupo: 突破参数`, { id1, id2, id3 });
        
        // 显示遮罩和提示
        this.showMarkAndTip('突破中...');
        
        // 调用服务器API
        myHeroAPI.heroBreak(id1, id2, id3)
            .then(response => {
                console.log('FullScreenTupo: 突破响应:', response);
                
                if (response.code === 200 || response.code === 0) {
                    console.log('FullScreenTupo: 突破成功');
                    
                    // 隐藏遮罩和提示
                    this.hideMarkAndTip();
                    
                    // 从服务器响应中获取品质增加的值，如果没有则默认+1
                    let qualityIncrease = 1; // 默认增加1
                    if (response.data && typeof response.data.qualityId === 'number') {
                        // qualityId 为突破后的品质，计算与当前品质的差值
                        qualityIncrease = response.data.qualityId - mainHeroCard.cardData.quality;
                        // 确保最小增加值为1
                        qualityIncrease = Math.max(qualityIncrease, 1);
                        console.log(`FullScreenTupo: 服务器返回品质增加: ${qualityIncrease} (从${mainHeroCard.cardData.quality}到${response.data.qualityId})`);
                    } else {
                        console.log('FullScreenTupo: 服务器未返回品质增加信息，使用默认值: +1');
                    }
                    
                    this.showBreakSuccess(qualityIncrease);
                    this.onclickMain();
                    this.willaddUpdate();
                    
                } else {
                    console.warn('FullScreenTupo: 突破失败:', response.msg);
                    this.hideMarkAndTip();
                }
            })
            .catch(error => {
                console.error('FullScreenTupo: 突破请求失败:', error);
                this.hideMarkAndTip();
            });
    }

    public onclickAbyssBreak(){
        const mainHeroCard = this.main_heroCard.getComponent(HeroCard);
        if (!mainHeroCard || !mainHeroCard.cardData) return;
        const id = parseInt(mainHeroCard.cardData.cardId);
        if (isNaN(id)) return;
        this.showMarkAndTip('突破中...');
        myHeroAPI.heroBreak(id)
            .then(response => {
                if (response && (response.code === 200 || response.code === 0)) {
                    let qualityIncrease = 1;
                    if (response.data && typeof response.data.qualityId === 'number') {
                        const oldQ = Number(mainHeroCard.cardData.quality);
                        const q = Number(response.data.qualityId);
                        qualityIncrease = isNaN(oldQ) || isNaN(q) ? 1 : Math.max(q - oldQ, 1);
                    }
                    this.showBreakSuccess(qualityIncrease);
                    this.hideMarkAndTip();
                    this.clearAll();
                    this.pullUp(null, true);
                    this.updateCardlist();
                    if (this.heroCardDisplay) this.heroCardDisplay.refreshHeroCards(false);
                } else {
                    this.hideMarkAndTip();
                }
            })
            .catch(() => {
                this.hideMarkAndTip();
            });
    }


    public showBreakSuccess(qualityIncrease: number = 1){
        this.breakthroughSuccess.active=true;
        this.breakthroughSuccessHeroCard.active=true;

       //摧毁 要突破的英雄卡片材料卡片
       const mainHeroCard = this.main_heroCard.getComponent(HeroCard);
       const mainHeroData = mainHeroCard.cardData;
       
       // 使用服务器返回的品质增加值，如果没有则使用默认值1
       console.log(`FullScreenTupo: 使用品质增加值: ${qualityIncrease}`);

       //提升 qualityIncrease 品质
       const oldQuality=mainHeroData.quality;
       mainHeroData.quality+=qualityIncrease;

       // 升级 
       UserArmyData.getInstance().updateCard(mainHeroData.cardId,{quality:mainHeroData.quality});
      //  则更新 突破后的英雄职业数据
      //判断是否上阵 如果上阵 则更新 突破后的英雄职业数据
      if(UserClassData.getInstance().isCardDeployed(mainHeroData.cardId)){
        UserClassData.getInstance().updateClassData(mainHeroData.cardId);
      }
       

       const leftHeroCard = this.left_node.getComponent(HeroCard);
       const leftHeroData = leftHeroCard.cardData;
       const rightHeroCard = this.right_node.getComponent(HeroCard);
       const rightHeroData = rightHeroCard.cardData;

       if (this.left_node.active && leftHeroData) {
           UserArmyData.getInstance().deleteCard(leftHeroData.cardId);
       }
       if (this.right_node.active && rightHeroData) {
           UserArmyData.getInstance().deleteCard(rightHeroData.cardId);
       }
       director.emit(game.gameEvent.HALL_ARMY_FORMATION_CHANGED);

       //更新 
       const upgradeValue=UserClassData.getInstance().
       calculateUpgradeValue(
        oldQuality,
        1,
        mainHeroData.sLevel,
        mainHeroData.quality,
        1,
        mainHeroData.sLevel
       );

       //成功突破后 显示的英雄卡片
   
       this.breakthroughSuccessHeroCard.active=true;
       this.breakthroughSuccessHeroCard.getComponent(HeroCard).setHeroDataWithCardData(mainHeroData);

     this.breakthroughSuccessAttack.string=upgradeValue.newAttack.toString();
     this.breakthroughSuccessAttackAdd.string=upgradeValue.addAttack.toString();
     this.breakthroughSuccessLife.string=upgradeValue.newMaxHp.toString();
     this.breakthroughSuccessLifeAdd.string=upgradeValue.addMaxHp.toString();
     if(qualityIncrease > 1){
        this.breakthroughSuccessCrit.node.active=true;
        this.breakthroughSuccessCrit.string="暴击！ 品质+"+qualityIncrease.toString();
     }else{
        this.breakthroughSuccessCrit.node.active=false;
     }
     

    }

    private showAbyssSuccess(mainHeroData: CardData, oldQuality: number, newQuality: number, qualityIncrease: number){
        this.breakthroughSuccess.active = true;
        this.breakthroughSuccessHeroCard.active = true;
        const upgraded = { ...mainHeroData, quality: newQuality } as CardData;
        this.breakthroughSuccessHeroCard.getComponent(HeroCard).setHeroDataWithCardData(upgraded);

        const upgradeValue = UserClassData.getInstance().calculateUpgradeValue(
            oldQuality,
            1,
            upgraded.sLevel,
            newQuality,
            1,
            upgraded.sLevel
        );
        this.breakthroughSuccessAttack.string = upgradeValue.newAttack.toString();
        this.breakthroughSuccessAttackAdd.string = upgradeValue.addAttack.toString();
        this.breakthroughSuccessLife.string = upgradeValue.newMaxHp.toString();
        this.breakthroughSuccessLifeAdd.string = upgradeValue.addMaxHp.toString();

        if (qualityIncrease > 1) {
            this.breakthroughSuccessCrit.node.active = true;
            this.breakthroughSuccessCrit.string = "暴击！ 品质+" + qualityIncrease.toString();
        } else {
            this.breakthroughSuccessCrit.node.active = false;
        }
    }


    //选择突破卡片 限制突破需要的英雄卡片面板
    private limitBreakCard(cardData:CardData){
        const cardId=cardData.cardId;
        //已上阵的卡片
        const deployedCards=UserClassData.getInstance().isCardDeployed(cardId);

        if(deployedCards){
            console.log('已上阵的卡片',cardId);
            return  false
        }

        //品质以达到极限
        if(cardData.quality>=22){
            console.log('品质以达到极限',cardId);
            return  false
        }

         const mainHeroCard = this.main_heroCard.getComponent(HeroCard);
         //突破需要的英雄卡片面板
         const leftHeroCard = this.left_node.getComponent(HeroCard);
         const leftHeroData = leftHeroCard.cardData;
         const rightHeroCard = this.right_node.getComponent(HeroCard);
         const rightHeroData = rightHeroCard.cardData;

         if(this.main_heroCard.active&&mainHeroCard.cardData&&mainHeroCard.cardData.cardId===cardId){
            console.log('主卡已上',cardId);
             if(!this.break_btn.interactable){
                this.showBreakSuccessAnimation(this.main_heroCard)
             }
            return  false
         }

        if(this.left_node.active&&leftHeroData&&leftHeroData.cardId===cardId){
             //播放提示动画
             if(!this.break_btn.interactable){
                 this.showBreakSuccessAnimation(this.left_node)
             }
            return  false
        }
        if(this.right_node.active&&rightHeroData&&rightHeroData.cardId===cardId){
            //播放提示动画
            if(!this.break_btn.interactable){
             this.showBreakSuccessAnimation(this.right_node)
            }
            return  false
        }

        return true
        
    }

    //计算剔除列表
    private calculateExcludeList(){
        const excludeList:CardData[]=[];
        // const deployedCards=UserClassData.getInstance().getDeployedCardData();
        // deployedCards.forEach(card=>{
        //         excludeList.push(card);
        // })

        const mainHeroCard = this.main_heroCard.getComponent(HeroCard);
        if(this.main_heroCard.active&&mainHeroCard.cardData){
            excludeList.push(mainHeroCard.cardData);
        }

        const leftHeroCard = this.left_node.getComponent(HeroCard);
        if(this.left_node.active&&leftHeroCard.cardData){
            excludeList.push(leftHeroCard.cardData);
        }

        const rightHeroCard = this.right_node.getComponent(HeroCard);
        if(this.right_node.active&&rightHeroCard.cardData){
            excludeList.push(rightHeroCard.cardData);
        }

        return excludeList;
    }
    // 更新 卡片库状态
    private updateCardlist(){
          //main 
          const mainHeroCard = this.main_heroCard.getComponent(HeroCard);

          this.heroCardDisplay.setBreakchooseFilter(this.calculateExcludeList(),mainHeroCard.cardData)
    }

    //播放提示动画
    private showBreakSuccessAnimation(node:Node){
        tween(node)
        .to(0.1, { scale: new Vec3(1.2, 1.2, 1) }) // 放大
        .to(0.1, { scale: Vec3.ONE })             // 恢复
        .to(0.1, { scale: new Vec3(1.2, 1.2, 1) }) // 再次放大
        .to(0.1, { scale: Vec3.ONE })             // 恢复
        .start();
    }

    // 自动突破 按钮 点击
    public onclickAutoBreak(){
        console.log('FullScreenTupo: 开始自动突破');
        
        // 显示遮罩和提示
        this.showMarkAndTip('自动突破中...');
        
        // 更新按钮文字状态
        if (this.autoBreak_btn_text) {
            this.autoBreak_btn_text.string = '突破中';
        }
        
        // 调用服务器API
        myHeroAPI.heroBreakAuto()
            .then(response => {
                console.log('FullScreenTupo: 自动突破响应:', response);
                
                if (response.code === 200 || response.code === 0) {
                    console.log('FullScreenTupo: 自动突破成功，开始同步数据');
                    
                    // 更新提示
                    this.updateTip('同步数据中...');
                    
                    // 同步服务器数据
                    this.syncServerData()
                        .then(() => {
                            console.log('FullScreenTupo: 数据同步完成，刷新页面');
                            
                            // 刷新当前页面
                            this.refreshPage();
                            
                            // 隐藏遮罩和提示
                            this.hideMarkAndTip();
                            
                            // 更新按钮文字状态
                            if (this.autoBreak_btn_text) {
                                this.autoBreak_btn_text.string = '突破成功';
                            }
                            
                        })
                        .catch(error => {
                            console.error('FullScreenTupo: 数据同步失败:', error);
                            this.hideMarkAndTip();
                            // 恢复按钮文字状态
                            if (this.autoBreak_btn_text) {
                                this.autoBreak_btn_text.string = '自动突破';
                            }
                        });
                        
                } else {
                    console.warn('FullScreenTupo: 自动突破失败:', response.msg);
                    this.hideMarkAndTip();
                    // 恢复按钮文字状态
                    if (this.autoBreak_btn_text) {
                        this.autoBreak_btn_text.string = '自动突破';
                    }
                }
            })
            .catch(error => {
                console.error('FullScreenTupo: 自动突破请求失败:', error);
                this.hideMarkAndTip();
                // 恢复按钮文字状态
                if (this.autoBreak_btn_text) {
                    this.autoBreak_btn_text.string = '自动突破';
                }
            });
    }

    /**
     * 显示遮罩和提示
     */
    private showMarkAndTip(tipText: string): void {
        if (this.markNode) {
            this.markNode.active = true;
        }
        if (this.tipLabel) {
            this.tipLabel.node.active = true
            this.tipLabel.string = tipText;
        }
    }

    /**
     * 隐藏遮罩和提示
     */
    private hideMarkAndTip(): void {
        if (this.markNode) {
            this.markNode.active = false;
        }
        if (this.tipLabel) {
            this.tipLabel.node.active = false
            this.tipLabel.string = '';
        }
    }

    /**
     * 更新提示文字
     */
    private updateTip(tipText: string): void {
        if (this.tipLabel) {
            this.tipLabel.string = tipText;
        }
    }

    /**
     * 同步服务器数据
     */
    private async syncServerData(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // 重置初始化状态，确保重新从服务器获取数据
                UserArmyData.getInstance().isInitialized = false;
                UserArmyData.getInstance().initializeAfterLogin();
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 刷新页面
     */
    private refreshPage(): void {
        // 刷新英雄卡片显示
        if (this.heroCardDisplay) {
            this.heroCardDisplay.refreshHeroCards();
        }
        
        // 清空当前选择
        this.clearAll();
        
        // 重新拉上界面
        this.pullUp(null, true);
        
        // 触发阵容更新事件
        director.emit(game.gameEvent.HALL_ARMY_FORMATION_CHANGED);
    }

    /**
     * 检查卡片是否已经被选中
     * @param cardId 卡片ID
     * @returns 是否已选中
     */
    private isCardAlreadySelected(cardId: string): boolean {
        // 检查主卡
        if (this.main_heroCard.active) {
            const mainHeroCard = this.main_heroCard.getComponent(HeroCard);
            if (mainHeroCard.cardData && mainHeroCard.cardData.cardId === cardId) {
                return true;
            }
        }

        // 检查左卡
        if (this.left_node.active) {
            const leftHeroCard = this.left_node.getComponent(HeroCard);
            if (leftHeroCard.cardData && leftHeroCard.cardData.cardId === cardId) {
                return true;
            }
        }

        // 检查右卡
        if (this.right_node.active) {
            const rightHeroCard = this.right_node.getComponent(HeroCard);
            if (rightHeroCard.cardData && rightHeroCard.cardData.cardId === cardId) {
                return true;
            }
        }

        return false;
    }

    /**
     * 取消卡片选中状态
     * @param cardId 要取消选中的卡片ID
     */
    private cancelCardSelection(cardId: string): void {
        // 取消主卡选中
        if (this.main_heroCard.active) {
            const mainHeroCard = this.main_heroCard.getComponent(HeroCard);
            if (mainHeroCard.cardData && mainHeroCard.cardData.cardId === cardId) {
                 this.onclickMain()
                return;
            }
        }

        // 取消左卡选中
        if (this.left_node.active) {
            const leftHeroCard = this.left_node.getComponent(HeroCard);
            if (leftHeroCard.cardData && leftHeroCard.cardData.cardId === cardId) {
                this.left_node.active = false;
                this.updateCardlist();
                this.updateBreakBtn();
                // 如果还有主卡，需要更新突破预览
                if (this.main_heroCard.active) {
                    this.willaddUpdate();
                }
                return;
            }
        }

        // 取消右卡选中
        if (this.right_node.active) {
            const rightHeroCard = this.right_node.getComponent(HeroCard);
            if (rightHeroCard.cardData && rightHeroCard.cardData.cardId === cardId) {
                this.right_node.active = false;
                this.updateCardlist();
                this.updateBreakBtn();
                // 如果还有主卡，需要更新突破预览
                if (this.main_heroCard.active) {
                    this.willaddUpdate();
                }
                return;
            }
        }
    }

    onDestroy() {
        
    }
}
