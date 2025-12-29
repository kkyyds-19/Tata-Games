import { _decorator, Component, Node, ScrollView, Prefab, instantiate, tween, Vec3 } from 'cc';
import { HeroCard } from './HeroCard';
import { UserArmyData, CardData } from '../../user/UserArmyData';
import { UserClassData } from '../../user/UserClassData';
import { game } from 'cc';
import { director } from 'cc';
import { Layout } from 'cc';
import { myHeroAPI } from '../../api/MyHeroAPI';

const { ccclass, property } = _decorator;

/**
 * 英雄卡片展示组件
 * 用于展示和筛选用户拥有的所有英雄卡片
 */
@ccclass('HeroCardDisplay')
export class HeroCardDisplay extends Component {

    @property([Node])
    filterButtonList: Node[] = [];

    @property(Node)
    breakthroughButton: Node = null;

    @property(Node)
    abyssBreakButton: Node = null;

    @property(ScrollView)
    scrollView: ScrollView = null;

    @property(Node)
    content: Node = null;

    @property(Prefab)
    heroCardPrefab: Prefab = null;

    // 筛选类型：0-全部，1-坦克，2-牧师，3-猎人，4-法师，5-刺客
    private _currentFilter: number = 0;
    private _userArmyData: UserArmyData = null;
    private _userClassData: UserClassData = null;
    private _heroCardInstances: HeroCard[] = [];

    //设置回调函数
    private _onHeroCardClick: Function = null;

    // 是否排除已上阵的卡片（默认排除）
    private _excludeDeployedCards: boolean = true;

    onLoad() {
        this._onHeroCardClick = null;
        this._userArmyData = UserArmyData.getInstance();
        this._userClassData = UserClassData.getInstance();
        this.initializeFilterButtons();
        this.initializeBreakthroughButton();
        this.initializeAbyssButton();
    }

    start() {
        this.refreshHeroCards();
        director.on(game.gameEvent.HALL_ARMY_FORMATION_CHANGED, this.onhallarmyformationchanged, this);
    }
    onDestroy() {
        director.off(game.gameEvent.HALL_ARMY_FORMATION_CHANGED, this.onhallarmyformationchanged, this);
    }
   
    onhallarmyformationchanged(){
        this.refreshHeroCards(false);
    }

    /**
     * 初始化筛选按钮
     */
    private initializeFilterButtons(): void {
        const filterFunctions = [
            () => this.onFilterClick(0), // 全部
            () => this.onFilterClick(1), // 坦克
            () => this.onFilterClick(2), // 牧师
            () => this.onFilterClick(3), // 猎人
            () => this.onFilterClick(4), // 法师
            () => this.onFilterClick(5)  // 刺客
        ];

        this.filterButtonList.forEach((button, index) => {
            if (index < filterFunctions.length) {
                button.on(Node.EventType.TOUCH_END, filterFunctions[index], this);
            }
        });

        // 默认选中"全部"
        this.updateFilterButtonStates();
    }

    /**
     * 初始化突破按钮
     */
    private initializeBreakthroughButton(): void {
        if (this.breakthroughButton) {
            this.breakthroughButton.on(Node.EventType.TOUCH_END, this.onBreakthroughClick, this);
        }
    }

    private initializeAbyssButton(): void {
        if (this.abyssBreakButton) {
            this.abyssBreakButton.on(Node.EventType.TOUCH_END, this.onAbyssBreakClick, this);
        }
    }

    /**
     * 筛选按钮点击事件
     * @param filterType 筛选类型
     */
    private onFilterClick(filterType: number): void {
        console.log(`点击筛选按钮: ${this.getFilterName(filterType)}`);
        this._currentFilter = filterType;
        this.updateFilterButtonStates();
        this.refreshHeroCards();
    }

    /**
     * 突破按钮点击事件
     */
    private onBreakthroughClick(): void {
        director.emit(game.gameEvent.HALL_HERO_CARD_BREAKTHROUGH_CLICK);
    }

    private _selectedHeroCard: HeroCard | null = null;

    private onAbyssBreakClick(): void {
        const card = this._selectedHeroCard && this._selectedHeroCard.cardData ? this._selectedHeroCard.cardData : null;
        if (!card) {
            return;
        }
        const id = parseInt(card.cardId);
        if (isNaN(id)) {
            return;
        }
        myHeroAPI.heroAbyss(id).then(resp => {
            if (resp && (resp.code === 200 || resp.code === 0) && resp.data) {
                const qualityId = Number(resp.data.qualityId);
                if (!isNaN(qualityId)) {
                    this._userArmyData.updateCard(card.cardId, { quality: qualityId });
                    if (this._userClassData.isCardDeployed(card.cardId)) {
                        this._userClassData.updateClassData(card.cardId);
                    }
                }
                this.refreshHeroCards(false);
            } else {
                this._userArmyData.deleteCard(card.cardId);
                this.refreshHeroCards(false);
            }
        }).catch(() => {});
    }

    /**
     * 更新筛选按钮状态
     */
    private updateFilterButtonStates(): void {
        this.filterButtonList.forEach((button, index) => {
            const isSelected = (index === this._currentFilter);
            const light = button.getChildByName('light');
            if (light) {
                light.active = isSelected;
            }
        });
    }

    /**
     * 刷新英雄卡片显示
     * 是否使用动画
     */
    public refreshHeroCards(useAnimation:boolean=true): void {
        // 清空现有卡片
        this.clearHeroCards();

        // 获取筛选后的卡片数据
        const filteredCards = this.getFilteredCards();
        
        // 获取统计信息
        const totalCards = this._userArmyData.getUserCards().length;
        const deployedCount = this._userClassData.getDeployedCardIds().length;
        const undeployedCount = totalCards - deployedCount;

        // 先创建所有卡片实例（但隐藏）
        const heroCardNodes: Node[] = [];
        filteredCards.forEach(cardData => {
            const heroCardNode = this.createHeroCardInstance(cardData, false); // false表示创建时隐藏
            heroCardNode.active = useAnimation?false:true;
            if (heroCardNode) {
                heroCardNodes.push(heroCardNode);
            }
        });

        // 更新布局
        const layout = this.content.getComponent(Layout);
        if (layout) {
            layout.updateLayout();
        }

        // 逐步显示卡片（1秒内完成）
        if(useAnimation){
            this.showCardsGradually(heroCardNodes);
        }

        // 根据排除设置显示不同的统计信息
        // const statusText = this._excludeDeployedCards ? 
        //     `(总计:${totalCards}, 已上阵:${deployedCount}, 未上阵:${undeployedCount})` :
        //     `(总计:${totalCards}, 已上阵:${deployedCount})`;

        // console.log(`刷新完成，显示 ${filteredCards.length} 张 ${this.getFilterName(this._currentFilter)} 卡片 ${statusText}`);
    }

    /**
     * 逐步显示卡片动画
     * @param heroCardNodes 要显示的卡片节点数组
     */
    private showCardsGradually(heroCardNodes: Node[]): void {
        if (heroCardNodes.length === 0) return;

        const totalCards = heroCardNodes.length;
        
        // 根据卡片数量动态计算总时间，最多不超过2秒
        // 基础时间0.3秒 + 每张卡片0.08秒，上限2秒
        const showDuration = Math.min(0.2 + totalCards * 0.08, 2.0);
        const delayPerCard = showDuration / totalCards; // 每张卡片的延迟时间

        // console.log(`显示${totalCards}张卡片，总时间：${showDuration.toFixed(2)}秒，每张间隔：${(delayPerCard * 1000).toFixed(0)}毫秒`);

        heroCardNodes.forEach((cardNode, index) => {
            // 计算每张卡片的显示延迟
            const delay = index * delayPerCard;
            
            // 使用scheduleOnce延迟显示
            this.scheduleOnce(() => {
                if (cardNode && cardNode.isValid) {
                    cardNode.active = true;
                    // 添加简单的缩放动画效果
                    // cardNode.setScale(0.6, 0.6, 1.0);
                    // tween(cardNode)
                    //     .to(0.2, { scale: new Vec3(1.0, 1.0, 1.0) }, { easing: 'backOut' })
                    //     .start();
                }
            }, delay);
        });
    }

    /**
     * 获取筛选后的卡片数据（根据设置决定是否排除已上阵的卡片）
     */
    private getFilteredCards(): CardData[] {
        const allCards = this._userArmyData.getUserCards();
        const deployedCardIds = this._userClassData.getDeployedCardIds(); // string[]
        
        let cardsToFilter = allCards;
    
        // 1. 是否排除已上阵
        if (this._excludeDeployedCards) {
            cardsToFilter = allCards.filter(card => deployedCardIds.indexOf(card.cardId) === -1);
        }
    
        // 2. 职业过滤（classId 取值 0~4）
        if (this._currentFilter !== 0) {
            const classId = this._currentFilter - 1;
            cardsToFilter = cardsToFilter.filter(card => card.class === classId);
        }
    
        // 3. 排序逻辑（已上阵优先 → sLevel 高 → quality 高 → heroId 相同 → cardId 排序）
        const sortedCards = cardsToFilter.sort((a, b) => {
            const aDeployed = deployedCardIds.indexOf(a.cardId) !== -1 ? 1 : 0;
            const bDeployed = deployedCardIds.indexOf(b.cardId) !== -1 ? 1 : 0;
    
            if (aDeployed !== bDeployed) {
                return bDeployed - aDeployed; // 已上阵优先
            }
    
            if (a.sLevel !== b.sLevel) {
                return b.sLevel - a.sLevel;   // sLevel 降序
            }
    
            if (a.quality !== b.quality) {
                return b.quality - a.quality; // quality 降序
            }
            
            if (a.heroId !== b.heroId) {
                return a.heroId.localeCompare(b.heroId); // heroId 升序，相同英雄排在一起
            }
            
            // 相同等级、相同品质、相同英雄ID时，按cardId排序
            return a.cardId.localeCompare(b.cardId);
        });
    
        return sortedCards;
    }
    
    /**
     * 创建英雄卡片实例
     * @param cardData 卡片数据
     * @param hide 是否隐藏（默认显示）
     */
    private createHeroCardInstance(cardData: CardData, hide: boolean = false): Node | null {
        if (!this.heroCardPrefab || !this.content) {
            console.warn('HeroCardDisplay: heroCardPrefab 或 content 未设置');
            return null;
        }

        // 实例化卡片预制体
        const heroCardNode = instantiate(this.heroCardPrefab);
        const heroCard = heroCardNode.getComponent(HeroCard);

        if (!heroCard) {
            console.warn('HeroCardDisplay: 预制体中未找到 HeroCard 组件');
            heroCardNode.destroy();
            return null;
        }

        // 设置卡片数据
        heroCard.setHeroData(cardData.cardId);
        // 添加到content中
        this.content.addChild(heroCardNode);
        this._heroCardInstances.push(heroCard);

        if(this._excludeDeployedCards){
            heroCard.hideOnFieldNode()
        }else{
            //是否是上阵英雄
            const deployedCardIds = this._userClassData.getDeployedCardIds();
            if(deployedCardIds.indexOf(cardData.cardId) !== -1){
                heroCard.showOnFieldNode()
            }else{
                heroCard.hideOnFieldNode()
            }
        }


        // 绑定卡片点击事件
        heroCardNode.on(Node.EventType.TOUCH_END, () => {
            this.onHeroCardClick(heroCard);
        });

        // 根据hide参数设置显示状态
        if (hide) {
            heroCardNode.active = false;
        }

        return heroCardNode;
    }

    /**
     * 清空所有英雄卡片
     */
    private clearHeroCards(): void {
        this._heroCardInstances.forEach(heroCard => {
            if (heroCard && heroCard.node) {
                heroCard.node.destroy();
            }
        });
        this._heroCardInstances = [];

        if (this.content) {
            this.content.removeAllChildren();
        }
    }

    public setOnHeroCardClick(callback: Function): void {

        //清理自己的回调
        this._onHeroCardClick = null;
        this._onHeroCardClick = callback;
    }
    /**
     * 英雄卡片点击事件
     * @param heroCard 被点击的英雄卡片
     */
    private onHeroCardClick(heroCard: HeroCard): void {
        this._selectedHeroCard = heroCard;
        if(this._onHeroCardClick){
            this._onHeroCardClick(heroCard);
        }
    }

    /**
     * 获取筛选类型名称
     * @param filterType 筛选类型
     */
    private getFilterName(filterType: number): string {
        const filterNames = ['全部', '坦克', '牧师', '猎人', '法师', '刺客'];
        return filterNames[filterType] || '未知';
    }

    /**
     * 获取职业名称
     * @param classId 职业ID
     */
    private getClassName(classId: number): string {
        const classNames = ['坦克', '牧师', '猎人', '法师', '刺客'];
        return classNames[classId] || '未知';
    }

    /**
     * 设置筛选类型
     * @param filterType 筛选类型
     */
    public setFilter(filterType: number): void {
        if (filterType >= 0 && filterType <= 5) {
            this._currentFilter = filterType;
            this.updateFilterButtonStates();
            this.refreshHeroCards();
        }
    }

    public setBreakchooseFilter(excludeList:CardData[],mainHeroCard:CardData){
             // 如果在排除列表中  

        const deployedCards=UserClassData.getInstance().getDeployedCardData();
        

        this.content.children.forEach(child=>{
            const heroCard=child.getComponent(HeroCard);
            if(heroCard){   
                heroCard.hideChoose()

                //剔除已上阵的卡片
                deployedCards.forEach(card=>{
                    if(heroCard.cardData.cardId===card.cardId){
                        heroCard.choose.active=true;
                    }
                })
                

                   excludeList.forEach(card=>{
                        if(heroCard.cardData.cardId===card.cardId){
                            heroCard.showChoose()
                        }
                   })

                   // 剔除 不同英雄id   
                   if(!heroCard.choose.active){
                        if(heroCard.cardData.heroId!==mainHeroCard.heroId){
                            heroCard.choose.active=true;
                        }else{
                              // 相同英雄id  剔除 不同品质
                              if(heroCard.cardData.quality!==mainHeroCard.quality){
                                 heroCard.choose.active=true;
                              }
                        }


                   }

                  
                  
            }
        })
    }

    /**
     * 获取当前筛选类型
     */
    public getCurrentFilter(): number {
        return this._currentFilter;
    }

    /**
     * 获取当前显示的卡片数量
     */
    public getDisplayedCardCount(): number {
        return this._heroCardInstances.length;
    }

    /**
     * 滚动到顶部
     */
    public scrollToTop(): void {
        if (this.scrollView) {
            this.scrollView.scrollToTop(0.5);
        }
    }

    /**
     * 滚动到底部
     */
    public scrollToBottom(): void {
        if (this.scrollView) {
            this.scrollView.scrollToBottom(0.5);
        }
    }

    /**
     * 设置是否排除已上阵的卡片
     * @param exclude 是否排除已上阵的卡片
     */
    public setExcludeDeployedCards(exclude: boolean): void {
        if (this._excludeDeployedCards !== exclude) {
            this._excludeDeployedCards = exclude;
            this.refreshHeroCards(); // 立即刷新显示
        }
    }

    /**
     * 获取当前是否排除已上阵的卡片
     */
    public getExcludeDeployedCards(): boolean {
        return this._excludeDeployedCards;
    }

}