import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { coinShopItems } from '../../global/config/GameShopConfig';
import { CoinShopItem } from './CoinShopItem';

const { ccclass, property } = _decorator;

@ccclass('CoinShop')
export class CoinShop extends Component {

    @property(Prefab)
    public coinItemPrefab: Prefab = null!;

    @property(Node)
    public contentNode: Node = null!;

    onLoad() {
        this.refresh();
    }

    /**
     * 刷新金币商店的显示
     * 该方法会重用现有的节点，而不是销毁它们，以提高性能。
     * 并且，此方法不会影响容器中的非CoinShopItem类型的节点。
     */
    public refresh() {
        if (!this.coinItemPrefab || !this.contentNode) {
            console.error('[CoinShop] Prefab or content node is not assigned.');
            return;
        }

        const itemsData = coinShopItems;
        // 1. 筛选出所有已经是金币商品项的节点
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
                itemNode = instantiate(this.coinItemPrefab);
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