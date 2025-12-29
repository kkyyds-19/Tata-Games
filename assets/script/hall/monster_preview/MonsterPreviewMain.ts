// 导入Cocos Creator相关模块
import { _decorator, Component, Node, Prefab, instantiate, Button, Layout, director, game } from 'cc';
// 导入怪物图鉴的相关配置和组件
import { MonsterCatalogEntry, MonsterType, monsterCatalogEntries_normal, monsterCatalogEntries_elite, monsterCatalogEntries_boss } from '../../global/config/MonsterCatalogEntry';
import { MonsterPreviewIcon } from './MonsterPreviewIcon';
import { userMonsterData } from '../../user/UserMonsterData';

const { ccclass, property } = _decorator;

/**
 * @class MonsterPreviewMain
 * @description 怪物图鉴主界面控制器。
 * 负责处理怪物列表的筛选（普通、精英、首领），并动态生成和显示怪物图标。
 * 【修改】现在从UserMonsterData服务器获取解锁状态
 */
@ccclass('MonsterPreviewMain')
export class MonsterPreviewMain extends Component {

    // --- 属性 ---

    @property(Button)
    public normalFilterButton: Button = null;

    @property(Button)
    public eliteFilterButton: Button = null;

    @property(Button)
    public bossFilterButton: Button = null;

    @property(Prefab)
    public monsterIconPrefab: Prefab = null;

    //按钮一键领取
    @property(Button)
    public receiveAllRewardsButton: Button = null;

    @property(Node)
    public contentNode: Node = null;

    /**
     * 当前的怪物类型筛选器
     * @private
     */
    private _currentFilter: MonsterType = MonsterType.NORMAL;

    onLoad() {

        this.node.on(Node.EventType.TOUCH_START, (event) => {
            // 阻止事件冒泡到下层，避免误触关闭
            // event.propagationStopped = true;
            return
        });
        // 绑定筛选按钮的点击事件
        this.normalFilterButton.node.on('click', this.onFilterChanged, this);
        this.eliteFilterButton.node.on('click', this.onFilterChanged, this);
        this.bossFilterButton.node.on('click', this.onFilterChanged, this);
        
        // 绑定一键领取按钮的点击事件
        if (this.receiveAllRewardsButton) {
            this.receiveAllRewardsButton.node.on('click', this.onReceiveAllRewardsClicked, this);
        }
        
        this._currentFilter = MonsterType.NORMAL;
    }

    /**
     * 一键领取按钮点击事件处理
     */
    private async onReceiveAllRewardsClicked(): Promise<void> {
        if (!this.receiveAllRewardsButton) {
            console.warn('MonsterPreviewMain: 一键领取按钮未配置');
            return;
        }

        // 禁用按钮，防止重复点击
        this.receiveAllRewardsButton.interactable = false;
        
        try {
            console.log('MonsterPreviewMain: 开始一键领取所有奖励');
            
            // 调用UserMonsterData的一键领取方法
            const result = await userMonsterData.receiveAllRewards();
            
            if (result && result.success) {
                console.log('MonsterPreviewMain: 一键领取成功');
                
                // 显示奖励
                if (result.reward && result.reward !== '{}') {
                    director.emit(game.gameEvent.DIALOG_ITEM_SHOW, result.reward);
                    console.log('MonsterPreviewMain: 显示奖励对话框，奖励数据:', result.reward);
                } else {
                    console.log('MonsterPreviewMain: 没有可领取的奖励');
                }
                
                // 刷新界面以更新状态
                this.refresh();
                
            } else {
                console.error('MonsterPreviewMain: 一键领取失败:', result?.error);
                // 这里可以显示错误提示
            }
            
        } catch (error) {
            console.error('MonsterPreviewMain: 一键领取时发生错误:', error);
        } finally {
            // 重新启用按钮
            this.receiveAllRewardsButton.interactable = true;
        }
    }

    /**
     * 公共方法：显示图鉴界面
     */
    public show() {
        // 【优化】只在缓存过期或未初始化时才刷新缓存
        const cacheStatus = userMonsterData.getCacheStatus();
        if (!cacheStatus.isInitialized || cacheStatus.isExpired) {
            console.log('MonsterPreviewMain: 缓存需要刷新，开始刷新缓存');
            // 使用Promise.then()避免阻塞UI
            userMonsterData.refreshCache().then(() => {
                console.log('MonsterPreviewMain: 缓存刷新完成');
            }).catch((error) => {
                console.error('MonsterPreviewMain: 缓存刷新失败:', error);
            });
        } else {
            console.log('MonsterPreviewMain: 缓存有效，跳过刷新');
        }

        this.node.active = true;
        this.refresh();
    }

    /**
     * 公共方法：隐藏图鉴界面
     */
    public hide() {
        this.node.active = false;
    }

    /**
     * 公共方法：刷新整个界面
     */
    public refresh() {
        // 【修改】直接更新界面，不需要额外缓存
        this.updateFilterButtons();
        this.refreshMonsterList();
    }

    /**
     * 筛选按钮点击事件处理
     * @param button 被点击的按钮
     */
    private onFilterChanged(button: Button) {
        let newFilter: MonsterType;
        if (button === this.normalFilterButton) {
            newFilter = MonsterType.NORMAL;
        } else if (button === this.eliteFilterButton) {
            newFilter = MonsterType.ELITE;
        } else if (button === this.bossFilterButton) {
            newFilter = MonsterType.BOSS;
        }

        if (this._currentFilter !== newFilter) {
            this._currentFilter = newFilter;
            this.refresh();
        }
    }

    /**
     * 更新筛选按钮的高亮状态
     */
    private updateFilterButtons() {
        // 通过子节点 'light' 的激活状态来控制高亮
        this.normalFilterButton.node.getChildByName('light').active = this._currentFilter === MonsterType.NORMAL;
        this.eliteFilterButton.node.getChildByName('light').active = this._currentFilter === MonsterType.ELITE;
        this.bossFilterButton.node.getChildByName('light').active = this._currentFilter === MonsterType.BOSS;
    }

    /**
     * 刷新怪物列表的显示
     */
    private async refreshMonsterList() {
        // 清空当前列表
        this.contentNode.destroyAllChildren();

        // 根据当前筛选器获取对应的怪物数据列表
        let monsterList: MonsterCatalogEntry[];
        switch (this._currentFilter) {
            case MonsterType.NORMAL:
                monsterList = monsterCatalogEntries_normal;
                break;
            case MonsterType.ELITE:
                monsterList = monsterCatalogEntries_elite;
                break;
            case MonsterType.BOSS:
                monsterList = monsterCatalogEntries_boss;
                break;
        }

        // 遍历数据列表，生成怪物图标
        for (const entry of monsterList) {
            const monsterNode = instantiate(this.monsterIconPrefab);
            const iconComponent = monsterNode.getComponent(MonsterPreviewIcon);
            if (iconComponent) {
                // 【修改】不再传递MonsterPreviewMain实例
                await iconComponent.init(entry);
            }
            this.contentNode.addChild(monsterNode);
        }
    }
} 