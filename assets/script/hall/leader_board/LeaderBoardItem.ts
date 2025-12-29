import { _decorator, Component, Node, Sprite, Label } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 排行榜单个玩家信息组件
 * 用于显示排行榜中的单个玩家信息，包括头像、排名、等级、名称和战力/关卡进度
 */
@ccclass('LeaderBoardItem')
export class LeaderBoardItem extends Component {

    /**
     * 玩家头像图标
     */
    @property(Sprite)
    public icon: Sprite = null;

    /**
     * 排名标签
     */
    @property(Label)
    public rank: Label = null;

    /**
     * 等级标签
     */
    @property(Label)
    public level: Label = null;

    /**
     * 玩家名称标签
     */
    @property(Label)
    public nameLabel: Label = null;

    /**
     * 战力/关卡进度标签
     */
    @property(Label)
    public value: Label = null;

    /**
     * 当前显示的数据
     */
    private _data: any = null;

    /**
     * 显示类型：'power' 表示战力，'stage' 表示关卡进度
     */
    private _displayType: 'power' | 'stage' = 'power';

    onLoad() {
        // 确保节点可见
        this.node.active = true;
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
     * @param displayType 显示类型：'power' 表示战力，'stage' 表示关卡进度
     */
    public setData(data: any, displayType: 'power' | 'stage' = 'power'): void {
        if (!data) {
            console.warn('LeaderBoardItem: 数据为空');
            return;
        }

        // 确保节点可见
        this.node.active = true;

        this._data = data;
        this._displayType = displayType;
        
        // 延迟更新显示，确保组件完全初始化
        this.scheduleOnce(() => {
            this.updateDisplay();
        }, 0);
    }

    /**
     * 更新显示内容
     */
    private updateDisplay(): void {
        if (!this._data) return;

        // 更新排名
        if (this.rank) {
            const rankValue = this._data.rank || this._data.ranking || 0;
            if (rankValue > 0) {
                this.rank.string = `#${rankValue}`;
            } else {
                this.rank.string = '未上榜';
            }
        } else {
            console.warn('LeaderBoardItem: rank 属性为空，无法设置排名');
        }

        // 更新等级
        if (this.level) {
            const levelValue = this._data.level || this._data.playerLevel || 1;
            this.level.string = `Lv.${levelValue}`;
        } else {
            console.warn('LeaderBoardItem: level 属性为空，无法设置等级');
        }

        // 更新玩家名称
        if (this.nameLabel) {
            this.nameLabel.string = this._data.name || this._data.playerName || '未知玩家';
        } else {
            console.warn('LeaderBoardItem: nameLabel 属性为空，无法设置名称');
        }

        // 更新战力/关卡进度
        if (this.value) {
            this.updateValueDisplay();
        } else {
            console.warn('LeaderBoardItem: value 属性为空，无法设置战力/关卡');
        }

        // 更新头像
        if (this.icon) {
            this.loadIcon(this._data.icon || this._data.avatar);
        } else {
            console.warn('LeaderBoardItem: icon 属性为空，无法设置头像');
        }
    }

    /**
     * 更新战力/关卡进度显示
     */
    private updateValueDisplay(): void {
        if (!this.value) {
            console.warn('LeaderBoardItem: value 属性为空，无法更新战力/关卡显示');
            return;
        }

        if (this._displayType === 'power') {
            // 显示战力
            const powerValue = this._data.power || this._data.combatPower || this._data.fightPower || 0;
            if (powerValue > 0) {
                this.value.string = this.formatPower(powerValue);
            } else {
                this.value.string = '--';
            }
        } else if (this._displayType === 'stage') {
            // 显示关卡进度
            const stageValue = this._data.stage || this._data.stageProgress || this._data.progress || 0;
            if (stageValue > 0) {
                this.value.string = `第${stageValue}关`;
            } else {
                this.value.string = '--';
            }
        }
    }

    /**
     * 加载头像图标
     * @param iconPath 图标路径或名称
     */
    private loadIcon(iconPath: string): void {
        if (!this.icon || !iconPath) {
            console.warn('LeaderBoardItem: 无法加载头像，icon或iconPath为空');
            return;
        }

        // 如果有spriteAtlas，从图集中加载
        if (this.icon.spriteAtlas) {
            const spriteFrame = this.icon.spriteAtlas.getSpriteFrame(iconPath);
            if (spriteFrame) {
                this.icon.spriteFrame = spriteFrame;
            } else {
                console.warn(`LeaderBoardItem: 在图集中未找到头像: ${iconPath}`);
            }
        } else {
            console.warn('LeaderBoardItem: icon组件未配置spriteAtlas');
        }
    }

    /**
     * 格式化战力显示
     * @param power 战力数值
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
        
        if (this.rank) {
            this.rank.string = '未上榜';
        }
        
        if (this.level) {
            this.level.string = '';
        }
        
        if (this.nameLabel) {
            this.nameLabel.string = '';
        }
        
        if (this.value) {
            this.value.string = '--';
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
     * 设置排名
     * @param rank 排名数值
     */
    public setRank(rank: number): void {
        if (this.rank) {
            if (rank > 0) {
                this.rank.string = `#${rank}`;
            } else {
                this.rank.string = '未上榜';
            }
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
     * 设置玩家名称
     * @param name 玩家名称
     */
    public setName(name: string): void {
        if (this.nameLabel) {
            this.nameLabel.string = name || '';
        }
    }

    /**
     * 设置战力
     * @param power 战力数值
     */
    public setPower(power: number): void {
        if (this.value && this._displayType === 'power') {
            if (power > 0) {
                this.value.string = this.formatPower(power);
            } else {
                this.value.string = '--';
            }
        }
    }

    /**
     * 设置关卡进度
     * @param stage 关卡数值
     */
    public setStage(stage: number): void {
        if (this.value && this._displayType === 'stage') {
            if (stage > 0) {
                this.value.string = `第${stage}关`;
            } else {
                this.value.string = '--';
            }
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
     * 设置显示类型
     * @param type 显示类型：'power' 表示战力，'stage' 表示关卡进度
     */
    public setDisplayType(type: 'power' | 'stage'): void {
        this._displayType = type;
        this.updateValueDisplay();
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
