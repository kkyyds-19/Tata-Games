import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { AcMenu } from './AcMenu';
import { ACTIVE_MENUS_CONFIG } from '../../global/config/ActiveMenusConfig';
const { ccclass, property } = _decorator;

@ccclass('ActiveMenus')
export class ActiveMenus extends Component {

    @property(Node)
    private menuList_left_content: Node = null;

    @property(Node)
    private menuList_right_content: Node = null;    

    @property(Prefab)
    private menuPrefab: Prefab = null;

    // 背景遮罩节点：点击后关闭当前活动菜单页面
    @property(Node)
    private markbg: Node = null;

    private menus_left: number[] = [7,1,2,3,4,5,6];
    private menus_right: number[] = [8,9,10,11,12,13];

    onLoad() {
        // 初始化菜单按钮
        this.initializeMenus();

        // 点击黑色背景关闭页面
        if (this.markbg) {
            this.markbg.off(Node.EventType.TOUCH_START);
            this.markbg.on(Node.EventType.TOUCH_START, () => {
                try { this.node.active = false; } catch {}
            }, this);
        }
    }

    /**
     * 初始化菜单按钮
     */
    private initializeMenus() {
        // 初始化左侧菜单
        this.initializeMenuList(this.menus_left, this.menuList_left_content);
        
        // 初始化右侧菜单
        this.initializeMenuList(this.menus_right, this.menuList_right_content);
    }

    /**
     * 初始化菜单列表
     * @param menuIds 菜单ID数组
     * @param container 容器节点
     */
    private initializeMenuList(menuIds: number[], container: Node) {
        if (!container || !this.menuPrefab) {
            console.warn('Container or menuPrefab is null');
            return;
        }

        // 清空容器
        container.removeAllChildren();

        // 为每个菜单ID创建按钮
        menuIds.forEach(id => {
            const menuConfig = this.getConfigById(id);
            if (menuConfig) {
                this.createMenuButton(menuConfig, container);
            }
        });
    }

    /**
     * 根据ID获取配置
     * @param id 菜单ID
     * @returns 配置对象或null
     */
    private getConfigById(id: number) {
        return ACTIVE_MENUS_CONFIG.find(config => config.id === id);
    }

    /**
     * 创建菜单按钮
     * @param config 菜单配置
     * @param container 容器节点
     */
    private createMenuButton(config: any, container: Node) {
        // 实例化预制体
        const menuNode = instantiate(this.menuPrefab);
        
        // 获取AcMenu组件
        const acMenu = menuNode.getComponent(AcMenu);
        if (acMenu) {
            // 设置菜单属性
            acMenu.setName(config.name);
            acMenu.setIcon(config.icon); 
            acMenu.id = config.id;
            
            // 根据状态设置可交互性
            if (config.status === 1) {
                acMenu.setInteractable(false);
            } else if (config.status === 2) {
                acMenu.hide();
            } else {
                acMenu.setInteractable(true);
                acMenu.show();
            }
        }
        
        // 添加到容器
        container.addChild(menuNode);
    }

    /**
     * 更新菜单状态
     * @param id 菜单ID
     * @param status 新状态
     */
    public updateMenuStatus(id: number, status: number) {
        const config = this.getConfigById(id);
        if (config) {
            config.status = status;
            // 重新初始化菜单以应用新状态
            this.initializeMenus();
        }
    }

}
