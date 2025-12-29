import { gameItemConfigs } from "../global/config/GameItemConfig";
import { BackpackItem } from "../api/APITypes";

export interface UserItem {
    itemId: number;
    amount: number;
}

/**
 * 用户道具数据管理器
 */
export class UserItemData {
    private static _instance: UserItemData = null;

    public static getInstance(): UserItemData {
        if (!this._instance) {
            this._instance = new UserItemData();
        }
        return this._instance;
    }

    private _items: { [id: number]: UserItem } = {};

    constructor() {
        // Can be initialized with saved data
        // this.initForTest();
    }
    
    /**
     * For testing purpose
     */
    public initForTest() {
        this._items = {};
        gameItemConfigs.forEach(config => {
            this.addItem(config.id, 100);
        })
    }

    /**
     * 从存档加载道具数据
     * @param items 
     */
    public loadItems(items: UserItem[]) {
        this._items = {};
        if (items) {
            for (const item of items) {
                this._items[item.itemId] = { ...item };
            }
        }
    }

    /**
     * 获取所有道具数据 (用于存档)
     */
    public getAllItems(): UserItem[] {
        return Object.keys(this._items).map(key => this._items[parseInt(key)]);
    }

    /**
     * 获取指定ID的道具信息
     * @param id 道具ID
     * @returns 
     */
    public getItem(id: number): UserItem {
        return this._items[id];
    }

    /**
     * 获取指定ID的道具数量
     * @param id 道具ID
     * @returns 
     */
    public getItemCount(id: number): number {
        return this._items[id]?.amount ?? 0;
    }
    
    /**
     * 增加道具
     * @param id 道具ID
     * @param count 数量
     */
    public addItem(id: number, count: number) {
        if (count <= 0) {
            return;
        }

        const itemConfig = gameItemConfigs.find(c => c.id === id);
        if (!itemConfig) {
            console.error(`UserItemData.addItem: Item with id ${id} not found in config.`);
            return;
        }

        let currentCount = this.getItemCount(id);
        let newCount = currentCount + count;

        const maxStack = this.getMaxStack(id);
        if (newCount > maxStack) {
            newCount = maxStack;
        }

        if (!this._items[id]) {
            this._items[id] = {itemId: id, amount: 0 };
        }
        this._items[id].amount = newCount;
    }
    
    /**
     * 消耗/移除道具
     * @param id 道具ID
     * @param count 数量
     * @returns 是否成功
     */
    public removeItem(id: number, count: number): boolean {
        if (count <= 0) {
            return true;
        }

        const currentCount = this.getItemCount(id);
        if (currentCount < count) {
            console.warn(`UserItemData.removeItem: Not enough items for id ${id}. Required: ${count}, Has: ${currentCount}`);
            return false; // Not enough items
        }

        this._items[id].amount -= count;
        return true;
    }

    private getMaxStack(id: number): number {
        // diamonds: 505, gold: 507
        if (id === 505 || id === 507) {
            return Number.MAX_SAFE_INTEGER;
        }
        return 9999;
    }

    /**
     * 从服务器背包数据更新本地道具数据
     * @param backpackItems 服务器返回的背包物品数组
     */
    public updateFromBackpackData(backpackItems: BackpackItem[]) {
        // 清空当前数据
        this._items = {};
        
        console.log('开始处理服务器背包数据，共', backpackItems.length, '项');
        
        // 遍历服务器数据，转换为本地格式
        for (const backpackItem of backpackItems) {
            console.log('处理背包项:', backpackItem);
            
            // 根据materialKey找到对应的本地道具配置
            const itemConfig = gameItemConfigs.find(config => config.materialKey === backpackItem.materialKey);
            
            if (itemConfig) {
                // 只添加数量大于0的道具
                if (backpackItem.materialNum > 0) {
                    this._items[itemConfig.id] = {
                        itemId: itemConfig.id,
                        amount: backpackItem.materialNum
                    };
                    console.log(`成功映射: ${backpackItem.materialKey} -> ${itemConfig.name} (ID: ${itemConfig.id}, 数量: ${backpackItem.materialNum})`);
                } else {
                    console.log(`跳过数量为0的道具: ${backpackItem.materialKey}`);
                }
            } else {
                console.warn(`警告: 未找到materialKey为 "${backpackItem.materialKey}" 的道具配置，已跳过该道具`);
            }
        }
        
        console.log('从服务器数据更新道具数据完成，共', Object.keys(this._items).length, '个有效道具:', this._items);
    }

    /**
     * 检查是否有足够的道具
     * @param id 道具ID
     * @param count 数量
     * @returns 
     */
    public hasItem(id: number, count: number = 1): boolean {
        return this.getItemCount(id) >= count;
    }
} 