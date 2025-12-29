import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { coinShopItems, itemShopItems, diamondShopItems, ShopItem, CostType } from '../../global/config/GameShopConfig';
import { ShopdataHelper } from './ShopdataHelper';

const { ccclass, property } = _decorator;

@ccclass('CoinShop_pk')
export class CoinShop_pk extends Component {

    @property(Prefab)
    public coinItemPrefab: Prefab = null!;

    @property(Node)
    public contentNode: Node = null!;

    onLoad() {
        this.loadHonorAndRefresh();
    }

    /**
     * 刷新金币商店的显示
     * 该方法会重用现有的节点，而不是销毁它们，以提高性能。
     * 并且，此方法不会影响容器中的非CoinShopItem类型的节点。
     */
    public refresh() {
        this.refreshWith(coinShopItems);
    }

    private refreshWith(itemsData: ShopItem[]) {
        if (!this.coinItemPrefab || !this.contentNode) {
            console.error('[CoinShop] Prefab or content node is not assigned.');
            return;
        }

        const shopItemNodes = this.contentNode.children.filter(
            node => node.getComponent('CoinShopItem_pk') || node.getComponent('PkStore')
        );

        let i = 0;
        for (i = 0; i < itemsData.length; i++) {
            const data = itemsData[i];
            let itemNode: Node;

            if (i < shopItemNodes.length) {
                itemNode = shopItemNodes[i];
            } else {
                itemNode = instantiate(this.coinItemPrefab);
                this.contentNode.addChild(itemNode);
            }

            itemNode.active = true;
            const compPk = itemNode.getComponent('CoinShopItem_pk') as any;
            const compStore = itemNode.getComponent('PkStore') as any;
            if (compPk && typeof compPk.init === 'function') {
                compPk.init(data);
            } else if (compStore && typeof compStore.init === 'function') {
                compStore.init(data);
            }
        }

        for (; i < shopItemNodes.length; i++) {
            shopItemNodes[i].active = false;
        }
    }

    private async loadHonorAndRefresh() {
        try {
            await ShopdataHelper.getUserHonorStoreInfo();
            const honorItems = (itemShopItems && itemShopItems.length > 0)
                ? itemShopItems.filter(i => i && (i.costType === CostType.HONOR || i.costType === CostType.DIAMOND))
                : [];
            if (honorItems.length > 0) {
                this.refreshWith(honorItems);
                return;
            }
        } catch (e) {}
        const fallback = coinShopItems.length > 0 ? coinShopItems : diamondShopItems;
        this.refreshWith(fallback);
    }
}
