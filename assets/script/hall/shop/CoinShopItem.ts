import { _decorator, Component, Node, Sprite, Label, SpriteAtlas, resources } from 'cc';
import { CostType, ShopItem, ShopCategory, coinShopItems, diamondShopItems, itemShopItems } from '../../global/config/GameShopConfig';
import { Utils } from '../../utils/Utils';
import { ShopdataHelper } from './ShopdataHelper';
import { ShowToast } from '../../global/Toast';
import { UserInfoData } from '../../user/UserInfoData';
const { ccclass, property } = _decorator;
//item 商品项 和 金币  通用
@ccclass('CoinShopItem')
export class CoinShopItem extends Component {

    @property(Sprite)
    public icon: Sprite = null!;

    @property(Label)
    public nameLabel: Label = null!;

    @property(Label)
    public amountLabel: Label = null!;

    @property(Node)
    public adPaymentPanel: Node = null!;

    @property(Node)
    public otherPaymentPanel: Node = null!;

    @property(Label)
    public costLabel: Label = null!;

    @property(Node)
    public coinPaymentPanel: Node = null!;

    @property(Label)
    public coinCostLabel: Label = null!;

    @property(SpriteAtlas)
    public shopAtlas: SpriteAtlas = null!;

    private itemData: ShopItem | null = null;

    /**
     * 初始化商品项UI
     * @param itemData 商品数据
     */
    public init(itemData: ShopItem) {
        this.itemData = itemData;

        // 设置图标
        if (this.shopAtlas) {
            const spriteFrame = this.shopAtlas.getSpriteFrame(itemData.iconFrameName);
            if (spriteFrame) {
                this.icon.spriteFrame = spriteFrame;
            } else {
                console.warn(`[CoinShopItem] 在图集中未找到 icon: ${itemData.iconFrameName}`);
            }
        }

        // 设置名称和数量
        this.nameLabel.string = itemData.name;
        this.amountLabel.string = Utils.formatNumber(itemData.itemAmount);

        // 根据支付类型显示不同的面板
        this.adPaymentPanel.active = false;
        this.otherPaymentPanel.active = false;
        this.coinPaymentPanel.active = false;

        if (itemData.costType === CostType.AD) {
            this.adPaymentPanel.active = true;
        } else if (itemData.costType === CostType.COIN) {
            this.coinPaymentPanel.active = true;
            this.coinCostLabel.string = itemData.costAmount.toString();
        } else {
            this.otherPaymentPanel.active = true;
            this.costLabel.string = itemData.costAmount.toString();

            // 切换荣誉点支付的图标为 dnf_pk 图集中的 pk_23
            if (itemData.costType === CostType.HONOR) {
                resources.load('img/hall/dnf_pk', SpriteAtlas, (err, atlas) => {
                    if (err) {
                        console.warn('[CoinShopItem] 加载荣誉点图集失败:', err);
                        return;
                    }
                    if (!atlas) {
                        console.warn('[CoinShopItem] 未获取到 dnf_pk 图集');
                        return;
                    }
                    const honorFrame = atlas.getSpriteFrame('pk_23');
                    if (!honorFrame) {
                        console.warn('[CoinShopItem] 在 dnf_pk 图集中未找到 pk_23');
                        return;
                    }
                    // 在支付面板下查找用于显示货币的小图标 Sprite
                    const sprites = this.otherPaymentPanel.getComponentsInChildren(Sprite);
                    if (sprites && sprites.length > 0) {
                        // 选取第一个子级 Sprite 作为货币图标进行替换
                        sprites[0].spriteFrame = honorFrame;
                    } else {
                        console.warn('[CoinShopItem] otherPaymentPanel 下未找到可替换的 Sprite');
                    }
                });
            }
        }
    }

    /**
     * 根据ID和分类初始化商品项
     * @param itemId 商品ID
     * @param category 商品分类
     */
    public initWithId(itemId: number, category: ShopCategory) {
        let itemData: ShopItem | undefined;

        switch (category) {
            case ShopCategory.COIN:
                itemData = coinShopItems.find(item => item.id === itemId);
                break;
            case ShopCategory.DIAMOND:
                itemData = diamondShopItems.find(item => item.id === itemId);
                break;
            case ShopCategory.ITEM:
                itemData = itemShopItems.find(item => item.id === itemId);
                break;
            default:
                console.error(`[CoinShopItem] 未知的商品分类: ${category}`);
                return;
        }

        if (itemData) {
            this.init(itemData);
        } else {
            console.error(`[CoinShopItem] 在分类 ${category} 中未找到ID为 ${itemId} 的商品`);
        }
    }

    /**
     * 购买按钮点击事件//item 商品项 和 金币  通用
     */
    private onBuyButtonClicked() {
        if (!this.itemData) {
            console.error('[CoinShopItem] 商品数据未初始化，无法购买');
            return;
        }
        console.log(`请求购买商品: ${this.itemData.name}, ID: ${this.itemData.server_id}`);
         //要先获取 商品的 购买类型
         const costType=this.itemData.costType;

         //如果是广告，那么 调用广告SDK
         if(costType === CostType.AD){
            //调用广告SDK
            //广告SDK 调用成功后 再调用 购买请求
            ShopdataHelper.buyItemByAd(this.itemData.server_id,
                (data) => {
                    const amount=Utils.formatNumber(this.itemData.itemAmount)
                    const text = `购买成功!   ${this.itemData.name}  +${amount}`;
                    ShowToast(text);
                    ShopdataHelper.buySuccess(this.itemData.name,this.itemData.itemAmount);
                },
                (err) => {
                    const text = `购买失败! ${err}`;
                    ShowToast(text);
                    console.log('购买失败', err);
                }
            );

            
            return
         }

        // 金币支付前置校验：余额不足则直接提示并终止
        if (costType === CostType.COIN) {
            const needGold = this.itemData.costAmount ?? 0;
            const userGold = UserInfoData.getInstance().getGold();
            if (userGold < needGold) {
                ShowToast('金币不足！');
                return;
            }
        }

        ShopdataHelper.buyItemById(this.itemData.server_id,
            (data) => {
                const amount=Utils.formatNumber(this.itemData.itemAmount)
                const text = `购买成功!   ${this.itemData.name}  +${amount}`;
                ShowToast(text);
                ShopdataHelper.buySuccess(this.itemData.name,this.itemData.itemAmount);
                // 与服务器状态保持一致：金币购买成功后本地扣除金币
                if (costType === CostType.COIN) {
                    const needGold = this.itemData.costAmount ?? 0;
                    if (needGold > 0) {
                        UserInfoData.getInstance().consumeGold(needGold);
                    }
                }
            },
            (err) => {
                const text = `购买失败! ${err}`;
                ShowToast(text);
                console.log('购买失败', err);
            }
        );
        // TODO: 在此实现具体的购买逻辑
        // 例如:
        // 1. 检查玩家资源是否足够
        // 2. 如果是广告，则调用广告SDK
        // 3. 发起购买请求到后端或更新本地玩家数据
        // 4. 播放音效、显示提示
    }
}