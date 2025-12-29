import { _decorator, Component, Node, Sprite, Label, SpriteAtlas } from 'cc';
import { CostType, ShopItem, ShopCategory, diamondShopItems } from '../../global/config/GameShopConfig';
import { Utils } from '../../utils/Utils';
import { ShopdataHelper } from './ShopdataHelper';
import { ShowToast } from '../../global/Toast';

const { ccclass, property } = _decorator;

@ccclass('DiamondShopItem')
export class DiamondShopItem extends Component {

    @property(Sprite)
    public icon: Sprite = null!;

    @property(Label)
    public amountLabel: Label = null!;

    // --- Payment Panels ---
    @property(Node)
    public adPaymentPanel: Node = null!;

    @property(Node)
    public cashPaymentPanel: Node = null!;

    @property(Label)
    public cashCostLabel: Label = null!;

    // --- Bonus Display ---
    @property(Node)
    public bonusPanel: Node = null!;

    @property(Label)
    public bonusAmountLabel: Label = null!;

    // --- Atlas ---
    @property(SpriteAtlas)
    public shopAtlas: SpriteAtlas = null!;

    private itemData: ShopItem | null = null;

    /**
     * 初始化商品项UI
     * @param itemData 商品数据
     */
    public init(itemData: ShopItem) {
        this.itemData = itemData;

        // Log the received data for debugging
        // console.log(`[DiamondShopItem] Initializing with data:`, JSON.parse(JSON.stringify(itemData)));

        // Set icon from the atlas provided in the editor
        if (this.shopAtlas) {
            const spriteFrame = this.shopAtlas.getSpriteFrame(itemData.iconFrameName);
            if (spriteFrame) {
                this.icon.spriteFrame = spriteFrame;
            } else {
                console.warn(`[DiamondShopItem] SpriteFrame not found in atlas: ${itemData.iconFrameName}`);
            }
        }

        // Set the primary item amount
        this.amountLabel.string = Utils.formatNumber(itemData.itemAmount);

        // Configure payment panels
        this.adPaymentPanel.active = itemData.costType === CostType.AD;
        this.cashPaymentPanel.active = itemData.costType === CostType.CASH;

        if (itemData.costType === CostType.CASH) {
            this.cashCostLabel.string = `¥${itemData.costAmount}`;
        }
        
        // Configure bonus display
        if (itemData.bonusAmount != null && itemData.bonusAmount > 0) {
            this.bonusPanel.active = true;
            this.bonusAmountLabel.string = `+${Utils.formatNumber(itemData.bonusAmount)}`;
        } else {
            this.bonusPanel.active = false;
        }
    }

    /**
     * 根据ID初始化商品项
     * @param itemId 商品ID
     */
    public initWithId(itemId: number) {
        const itemData = diamondShopItems.find(item => item.id === itemId);
        if (itemData) {
            this.init(itemData);
        } else {
            console.error(`[DiamondShopItem] Diamond shop item with ID ${itemId} not found.`);
        }
    }

    /**
     * 购买按钮点击事件
     */
    private onBuyButtonClicked() {
        if (!this.itemData) {
            console.error('[DiamondShopItem] Item data not initialized.');
            return;
        }

        console.log(`Attempting to purchase diamond item: ${this.itemData.name}, ID: ${this.itemData.id}`);
        

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


        
        ShopdataHelper.buyItemById(this.itemData.server_id,
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
    }
}