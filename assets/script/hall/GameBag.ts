import { _decorator, Component, Node, Prefab, instantiate, Layout } from 'cc';
import { UserItem, UserItemData } from '../user/UserItemData';
import { GameItemIcon } from './GameItemIcon';
import { backpackAPI } from '../api/BackpackAPI';

const { ccclass, property } = _decorator;

@ccclass('GameBag')
export class GameBag extends Component {

    @property(Prefab)
    itemIconPrefab: Prefab = null!;

    @property(Node)
    contentNode: Node = null!;

    private isLoading: boolean = false;

    onEnable() {
        this.node.on(Node.EventType.TOUCH_START, ()=>{

        }, this);

        this.refresh();
    }

    /**
     * 显示背包
     */
    public show() {
        this.node.active = true;
        this.refresh();
    }

    /**
     * 隐藏背包
     */
    public hide() {
        this.node.active = false;
    }

    /**
     * 从服务器刷新背包数据
     */
    public async refreshFromServer() {
        if (this.isLoading) {
            console.log('背包数据正在加载中，跳过重复请求');
            return;
        }

        this.isLoading = true;
        
        try {
            console.log('开始从服务器获取背包数据...');
            const response = await backpackAPI.getBackpackList();
            
            if (response && response.data) {
                console.log('服务器返回的背包数据:', response.data);
                
                // 更新本地道具数据
                const userItemData = UserItemData.getInstance();
                userItemData.updateFromBackpackData(response.data);
                
                // 刷新UI显示
                this.refreshUI();
            } else {
                console.error('服务器返回的背包数据格式错误:', response);
            }
        } catch (error) {
            console.error('获取背包数据失败:', error);
            // 可以在这里添加错误提示UI
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 刷新背包内的所有道具（使用本地数据）
     */
    public refresh() {
        // 优先从服务器获取最新数据
        this.refreshFromServer();
    }

    /**
     * 刷新UI显示（使用本地数据）
     */
    private refreshUI() {
        this.contentNode.removeAllChildren();
        const allItems = UserItemData.getInstance().getAllItems();
        
        // 过滤掉数量为0的道具
        const validItems = allItems.filter(item => item.amount > 0);

        console.log('显示背包道具:', validItems);

        validItems.forEach(itemData => {
            const itemNode = instantiate(this.itemIconPrefab);
            const itemIcon = itemNode.getComponent(GameItemIcon)!;
            itemIcon.init(itemData.itemId);
            itemIcon.setCount(itemData.amount);
            itemIcon.setCollected(false);
            this.contentNode.addChild(itemNode);
        });

        // 如果 contentNode 使用了 Layout 组件，可以强制刷新一下
        const layout = this.contentNode.getComponent(Layout);
        if (layout) {
            layout.updateLayout();
        }
    }
}
