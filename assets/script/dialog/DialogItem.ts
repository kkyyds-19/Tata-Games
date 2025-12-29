import { _decorator, Component, Node, Prefab, instantiate, director, tween, Tween, game } from 'cc';
import { GameItemIcon } from '../hall/GameItemIcon';
import { UserItem } from '../user/UserItemData';
import { gameItemConfigs } from '../global/config/GameItemConfig';

const { ccclass, property } = _decorator;

@ccclass('DialogItem')
export class DialogItem extends Component {

    @property({ type: Prefab, tooltip: "奖励图标预制体" })
    public itemIconPrefab: Prefab = null;

    @property({ type: Node, tooltip: "图标容器节点 layout" })
    public layoutNode: Node = null;

    private _canClose: boolean = false;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_END, this.tryHide, this);
        director.on(game.gameEvent.DIALOG_ITEM_SHOW, this.showItems, this);

        
        this.node.active = false;
    }

    onDestroy() {
        director.off(game.gameEvent.DIALOG_ITEM_SHOW, this.showItems, this);
    }

    private tryHide() {
        if (this._canClose) {
            this.hide();
        }
    }

    public hide() {
        this.node.active = false;
        this._canClose = false;
    }

    /**
     * 显示奖励图标（逐个添加）
     * @param itemIds 奖励道具的 itemId 数组 或 reward JSON字符串
     */
    public async showItems(itemIds: UserItem[] | string): Promise<void> {
        let items: UserItem[] = [];

        // 判断参数类型
        if (typeof itemIds === 'string') {
            // 如果是字符串，尝试解析为JSON
            items = this.parseRewardString(itemIds);
        } else if (Array.isArray(itemIds)) {
            // 如果是数组，直接使用
            items = itemIds;
        } else {
            console.error("[DialogItem] 参数类型错误，期望 UserItem[] 或 string");
            return;
        }

        // 基础验证
        if (items.length === 0) {
            console.warn("[DialogItem] 奖励 items 数组为空");
            return;
        }

        const main_panel = this.node.getChildByName("main_panel");
        if(main_panel){
            main_panel.active = true
        }    
        this.node.active = true;
        this._canClose = false;
        this.layoutNode.removeAllChildren();

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemNode = instantiate(this.itemIconPrefab);
            const icon = itemNode.getComponent(GameItemIcon);
            icon.init(item.itemId); // 默认使用图集
            icon.setCount(item.amount);
            this.layoutNode.addChild(itemNode);

            // 每次添加后等待 0.15 秒
            await this.wait(150);
        }

        // 等待 0.5 秒后允许关闭
        await this.wait(500);
        this._canClose = true;
    }

    /**
     * 解析 reward JSON字符串为 UserItem 数组
     * 参考 DailyTaskHelper.ts 的解析方法
     * @param rewardString reward JSON字符串，格式如: '{"gold": 100, "diamond": 50}'
     * @returns UserItem[] 数组
     */
    private parseRewardString(rewardString: string): UserItem[] {
        const result: UserItem[] = [];
        
        try {
            // 判断是否为有效的JSON字符串
            if (!this.isValidJsonString(rewardString)) {
                console.warn("[DialogItem] reward 不是有效的JSON字符串:", rewardString);
                return result;
            }

            const obj = JSON.parse(rewardString);
            
            for (const key in obj) {
                const amount = obj[key];
                const itemConfig = gameItemConfigs.find(config => config.materialKey === key);
                
                if (itemConfig) {
                    result.push({
                        itemId: itemConfig.id,
                        amount: amount
                    });
                } else {
                    console.warn(`[DialogItem] 未找到 materialKey=${key} 对应的物品配置`);
                }
            }
        } catch (e) {
            console.warn("[DialogItem] 无法解析 reward 字段:", rewardString, e);
        }
        
        return result;
    }

    /**
     * 判断字符串是否为有效的JSON格式
     * @param str 待检查的字符串
     * @returns 是否为有效JSON
     */
    private isValidJsonString(str: string): boolean {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 等待指定毫秒（用于逐个显示）
     */
    private wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
