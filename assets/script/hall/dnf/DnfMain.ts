import { _decorator, Component, Node, Label, Prefab, instantiate} from 'cc';

import { DnfItem } from './DnfItem';
import { UserInfoData } from '../../user/UserInfoData';
import { Hall } from '../hall';

const { ccclass, property } = _decorator;

@ccclass('DnfMain')
export class DnfMain extends Component {

     // ==================== UI 属性 ====================
    
    @property({ type: Label, tooltip: "钻石数量标签" })
    public diamondLabel: Label = null;

    @property({ type: Label, tooltip: "皮肤点券数量标签" })
    public skinPointsLabel: Label = null;

    @property({ type: Label, tooltip: "闪电数量标签" })
    public shandianLabel: Label = null;

    @property({ type: Label, tooltip: "金币数量标签" })
    public goldLabel: Label = null;

    @property({ type: Prefab, tooltip: "皮肤段落(Item)的预制体" })
    public dnfItemPrefab: Prefab = null;

    @property({ type: Node, tooltip: "滚动列表的容器节点" })
    public scrollContent: Node = null;

    private hallInstance: Hall = null;

    /**
     * 设置Hall实例引用
     * @param hall Hall实例
     */
    public setHallInstance(hall: Hall) {
        this.hallInstance = hall;
    }

    start() {

    }

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, ()=>{
            //点击吞噬
        }, this);
    }

    onEnable() {
        this.refreshAll();
    }

     // ==================== UI刷新 ====================
    
    /**
     * 刷新整个主面板
     */
    public refreshAll() {
        this.updateCurrencyDisplay();
        this.populateSkinBlocks();
    }

    /**
     * 更新货币显示
     */
    private updateCurrencyDisplay() {
        const userInfo = UserInfoData.getInstance();
        if (this.diamondLabel) this.diamondLabel.string = userInfo.getDiamond().toString();
        if (this.skinPointsLabel) this.skinPointsLabel.string = userInfo.getSkinPoints().toString();
        if (this.shandianLabel) this.shandianLabel.string = `${userInfo.getStamina()}/${userInfo.getMaxStamina()}`;
        if (this.goldLabel) this.goldLabel.string = userInfo.getGold().toString();
    }
    

    /**
     * 填充皮肤段落列表
     */
    private populateSkinBlocks() {
        if (!this.scrollContent || !this.dnfItemPrefab) return;

        this.scrollContent.removeAllChildren();
        
        // 定义稀有度顺序：从高到低排列（数值越小越稀有）
        const rarityOrder = [4,3, 2, 1, 0]; // 神话(4) > 史诗(3) > 稀有(2) > 传说(1)
        
        for (let i = 0; i < rarityOrder.length; i++) {
            const blockNode = instantiate(this.dnfItemPrefab);
            // 按照从上到下的顺序排列
            blockNode.setPosition(385, -i * 300, 0);
            const itemComponent = blockNode.getComponent(DnfItem);
            
            if (itemComponent) {
                // 第一个参数是索引，第二个参数是稀有度，第三个参数是Hall实例
                itemComponent.init(i, rarityOrder[i], this.hallInstance, (sender)=>{

                });
                this.scrollContent.addChild(blockNode);
            }
        }

        // const groupedSkins = this.getGroupedAndFilteredSkins();

        // // 按稀有度从高到低遍历
        // for (const rarity of this.rarityOrder) {
        //     const skinIds = groupedSkins.get(rarity);

        //     // 如果该稀有度下有皮肤，则创建并显示Block
        //     if (skinIds && skinIds.length > 0) {
        //         const blockNode = instantiate(this.dnfItemPrefab);
        //         blockNode.setPosition(585,0,0);
                
        //     }
        // }
    }
    

    // ==================== 公共方法 ====================

    public show() {
        this.node.active = true;
        this.refreshAll();
    }

    public hide() {
        this.node.active = false;
    }
}


