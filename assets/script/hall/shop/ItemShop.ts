import { _decorator, Component, Node, Prefab, instantiate, Label } from 'cc';
import { itemShopItems } from '../../global/config/GameShopConfig';
import { CoinShopItem } from './CoinShopItem';
import { Utils } from '../../utils/Utils';
import { ShopdataHelper } from './ShopdataHelper';

const { ccclass, property } = _decorator;

@ccclass('ItemShop')
export class ItemShop extends Component {

    @property(Prefab)
    public itemPrefab: Prefab = null!;

    @property(Node)
    public contentNode: Node = null!;

    @property(Label)
    public countdownLabel: Label = null!;

    private _eventEndTime: number = 0; // The timestamp (in seconds) when the event ends

    onLoad() {
        // Example: Set the event to end 3 days from now.
        // Replace this with your actual logic to get the end time, e.g., from a server.
        this._eventEndTime = ShopdataHelper.materialRefreshTime;
        if(ShopdataHelper.materialRefreshTime > 0){
            this._eventEndTime = ShopdataHelper.materialRefreshTime;
        }else{
            this._eventEndTime = Math.floor(Date.now() / 1000) + (5 * 24 * 60 * 60);
        }

        this.refresh();
    }

    update(dt: number) {
        const now = Math.floor(Date.now() /  1000);
        const remainingSeconds = this._eventEndTime - now;

        if (this.countdownLabel) {
            this.countdownLabel.string = Utils.formatTimeCountdown(remainingSeconds);
        }
    }

    /**
     * 刷新道具商店的显示
     * 该方法会重用现有的节点，而不是销毁它们，以提高性能。
     * 并且，此方法不会影响容器中的非CoinShopItem类型的节点。
     */
    public refresh() {
        if (!this.itemPrefab || !this.contentNode) {
            console.error('[ItemShop] Prefab or content node is not assigned.');
            return;
        }

        const itemsData = itemShopItems;
        // 1. 筛选出所有已经是道具商品项的节点
        const shopItemNodes = this.contentNode.children.filter(
            node => node.getComponent(CoinShopItem)
        );

        let i = 0;

        // 2. 遍历商品数据，更新或创建UI节点
        for (i = 0; i < itemsData.length; i++) {
            const data = itemsData[i];
            let itemNode: Node;

            if (i < shopItemNodes.length) {
                // 重用现有的商品项节点
                itemNode = shopItemNodes[i];
            } else {
                // 如果现有商品项节点不够，则创建新节点
                itemNode = instantiate(this.itemPrefab);
                this.contentNode.addChild(itemNode);
            }

            itemNode.active = true;
            const shopItemComponent = itemNode.getComponent(CoinShopItem);
            if (shopItemComponent) {
                shopItemComponent.init(data);
            }
        }

        // 3. 隐藏多余的、未被使用的商品项节点
        for (; i < shopItemNodes.length; i++) {
            shopItemNodes[i].active = false;
        }
    }
} 