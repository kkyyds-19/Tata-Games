import { _decorator, Component, Node, Sprite, Label } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 排行榜图标组件
 * 用于显示排行榜中的玩家信息，包括头像、名称和战斗力
 */
@ccclass('LeaderBoardIcon')
export class LeaderBoardIcon extends Component {

    /**
     * 玩家头像图标
     */
    @property(Sprite)
    public icon: Sprite = null;

    /**
     * 玩家名称标签
     */
    @property(Label)
    public nameLabel: Label = null;

    /**
     * 等级标签
     */
    @property(Label)
    public level: Label = null;

    /**
     * 战斗力标签
     */
    @property(Label)
    public power: Label = null;

    /**
     * 当前显示的数据
     */
    private _data: any = null;

    onLoad() {
        // 初始化组件
        this.init();
    }

    /**
     * 初始化组件
     */
    private init(): void {
        // 清空显示
        this.clear();
    }

    /**
     * 设置排行榜数据
     * @param data 排行榜数据对象
     */
    public setData(data: any): void {
        if (!data) {
            console.warn('LeaderBoardIcon: 数据为空');
            return;
        }

        this._data = data;
        this.updateDisplay();
    }

    /**
     * 更新显示内容
     */
    private updateDisplay(): void {
        if (!this._data) return;

        // 更新玩家名称
        if (this.nameLabel) {
            this.nameLabel.string = this._data.name || '未知玩家';
        }

        // 更新等级
        if (this.level) {
            const levelValue = this._data.level || this._data.playerLevel || 1;
            this.level.string = `Lv.${levelValue}`;
        }

        // 更新战斗力
        if (this.power) {
            const powerValue = this._data.power || this._data.combatPower || 0;
            this.power.string = this.formatPower(powerValue);
        }

        // 更新头像
        if (this.icon) {
            this.loadIcon(this._data.icon || this._data.avatar);
        }
    }

    /**
     * 加载头像图标
     * @param iconPath 图标路径或名称
     */
    private loadIcon(iconPath: string): void {
        if (!this.icon || !iconPath) {
            console.warn('LeaderBoardIcon: 无法加载头像，icon或iconPath为空');
            return;
        }

        // 如果有spriteAtlas，从图集中加载
        if (this.icon.spriteAtlas) {
            const spriteFrame = this.icon.spriteAtlas.getSpriteFrame(iconPath);
            if (spriteFrame) {
                this.icon.spriteFrame = spriteFrame;
            } else {
                console.warn(`LeaderBoardIcon: 在图集中未找到头像: ${iconPath}`);
            }
        } else {
            console.warn('LeaderBoardIcon: icon组件未配置spriteAtlas');
        }
    }

    /**
     * 格式化战斗力显示
     * @param power 战斗力数值
     * @returns 格式化后的字符串
     */
    private formatPower(power: number): string {
        if (power >= 1000000) {
            return (power / 1000000).toFixed(1) + 'M';
        } else if (power >= 1000) {
            return (power / 1000).toFixed(1) + 'K';
        } else {
            return power.toString();
        }
    }

    /**
     * 清空显示内容
     */
    public clear(): void {
        this._data = null;
        
        if (this.nameLabel) {
            this.nameLabel.string = '';
        }
        
        if (this.level) {
            this.level.string = '';
        }
        
        if (this.power) {
            this.power.string = '';
        }
        
        if (this.icon) {
            this.icon.spriteFrame = null;
        }
    }

    /**
     * 获取当前数据
     * @returns 当前显示的数据
     */
    public getData(): any {
        return this._data;
    }

    /**
     * 设置玩家名称
     * @param name 玩家名称
     */
    public setName(name: string): void {
        if (this.nameLabel) {
            this.nameLabel.string = name || '';
        }
    }

    /**
     * 设置等级
     * @param level 等级数值
     */
    public setLevel(level: number): void {
        if (this.level) {
            this.level.string = `Lv.${level}`;
        }
    }

    /**
     * 设置战斗力
     * @param power 战斗力数值
     */
    public setPower(power: number): void {
        if (this.power) {
            this.power.string = this.formatPower(power);
        }
    }

    /**
     * 设置头像
     * @param iconPath 头像路径或名称
     */
    public setIcon(iconPath: string): void {
        this.loadIcon(iconPath);
    }

    /**
     * 显示组件
     */
    public show(): void {
        this.node.active = true;
    }

    /**
     * 隐藏组件
     */
    public hide(): void {
        this.node.active = false;
    }

    /**
     * 设置可见性
     * @param visible 是否可见
     */
    public setVisible(visible: boolean): void {
        this.node.active = visible;
    }
}
