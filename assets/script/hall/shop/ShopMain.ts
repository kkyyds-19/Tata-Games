import { Label, game, director } from 'cc';
import { _decorator, Component, Node, Button } from 'cc';
import { ShopdataHelper } from './ShopdataHelper';
import { ShowToast } from '../../global/Toast';

const { ccclass, property } = _decorator;

enum SyncState {
    IDLE,
    SYNCING,
    SUCCESS,
    FAILED
}

@ccclass('ShopMain')
export class ShopMain extends Component {

    // --- Shop Panels ---
    @property(Node)
    public coinShopPanel: Node = null!;

    @property(Node)
    public diamondShopPanel: Node = null!;

    @property(Node)
    public itemShopPanel: Node = null!;

    @property(Node)
    public heroShopPanel: Node = null!;

    // --- Navigation Buttons ---
    @property(Button)
    public coinShopButton: Button = null!;

    @property(Button)
    public diamondShopButton: Button = null!;

    @property(Button)
    public itemShopButton: Button = null!;

    @property(Button)
    public heroShopButton: Button = null!;

    //正在同步数据
    @property(Label)
    public syncDataLabel: Label = null!;

    private _panels: Node[] = [];
    private _buttons: Button[] = [];
    private _currentIndex: number = -1;
    private _syncState: SyncState = SyncState.IDLE;
    private _isFirstLoad: boolean = true;


    onLoad() {
        this._panels = [this.coinShopPanel, this.diamondShopPanel, this.itemShopPanel, this.heroShopPanel];
        this._buttons = [this.coinShopButton, this.diamondShopButton, this.itemShopButton, this.heroShopButton];
        
        // Default to selecting the Coin Shop
        this.selectTab(0);
        this.coinShopPanel.active = false;
        

    }

    onEnable() {
        if (this._isFirstLoad) {
            this.startSync();
        } else {
            this.checkForAutoRefresh();
        }
        this.schedule(this.checkForAutoRefresh, 1);
    }

    onDisable() {
        this.unschedule(this.checkForAutoRefresh);
    }

    private checkForAutoRefresh() {
        if (this._syncState === SyncState.SYNCING) {
            return;
        }

        const now = Math.floor(Date.now() / 1000);
        
        const needsRefresh = (ShopdataHelper.diamondRefreshTime > 0 && now > ShopdataHelper.diamondRefreshTime) ||
                             (ShopdataHelper.materialRefreshTime > 0 && now > ShopdataHelper.materialRefreshTime);

        if (needsRefresh) {
            console.log('Shop refresh time has passed. Triggering auto-refresh.');
            this.startSync();
        }
    }

    private startSync() {
        this._syncState = SyncState.SYNCING;
        this.syncDataLabel.node.active = true;
        this.syncDataLabel.string = '正在同步数据...';

        ShopdataHelper.getUserStoreInfo()
            .then(() => {
                this._syncState = SyncState.SUCCESS;
                this.syncDataLabel.node.active = false;
                this._isFirstLoad = false; 
                this.selectTab(0); 
                this.coinShopPanel.active = true;
                console.log('商店数据同步成功');
            })
            .catch((error) => {
                this._syncState = SyncState.FAILED;
                this.syncDataLabel.node.active = true;
                this.syncDataLabel.string = '同步失败，请稍后重试';
                console.error('商店数据同步失败:', error);
            });
    }

    /**
     * Activates a specific shop tab by its index.
     * @param index The index of the tab to select (0: Coin, 1: Diamond, 2: Item, 3: Hero).
     */
    public selectTab(index: number) {
        if (this._syncState === SyncState.SYNCING) {
            ShowToast("正在同步数据，请稍候...");
            return;
        }

        if (this._syncState === SyncState.FAILED) {
            this.startSync();
            return;
        }

        if (index < 0 || index >= this._panels.length || index === this._currentIndex) {
            return;
        }

        this._currentIndex = index;

        // Update panels visibility and button states
        for (let i = 0; i < this._panels.length; i++) {
            const isSelected = i === index;
            
            if (this._panels[i]) {
                this._panels[i].active = isSelected;
            }
            
            if (this._buttons[i]) {
                this.setButtonHighlight(this._buttons[i], isSelected);
            }
        }
    }

    /**
     * Sets the highlighted state of a button by activating/deactivating its 'light' child node.
     * @param button The button to modify.
     * @param isSelected Whether the button should be highlighted.
     */
    private setButtonHighlight(button: Button, isSelected: boolean) {
        const light = button.node.getChildByName('light');
        if (light) {
            light.active = isSelected;
        } else {
            console.warn(`Button '${button.node.name}' does not have a child named 'light' for highlighting.`);
        }
    }

    // --- Public methods for button clicks, to be linked in the editor ---
    public onCoinButtonTapped() {
        this.selectTab(0);
    }

    public onDiamondButtonTapped() {
        this.selectTab(1);
    }

    public onItemButtonTapped() {
        this.selectTab(2);
    }

    public onHeroButtonTapped() {
        this.selectTab(3);
    }

    // --- Generic Show/Hide/Close Methods ---
    
    /**
     * Shows the entire shop interface.
     */
    public show() {
        this.node.active = true;
    }

    /**
     * Hides the entire shop interface.
     */
    public hide() {
        this.node.active = false;
    }

    /**
     * Method to be called by a 'Back' or 'Close' button.
     */
    public onCloseButtonTapped() {
        this.hide();
    }
} 