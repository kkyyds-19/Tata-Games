import { _decorator, Component, Node, Label, Button, director } from 'cc';
import { RelicIcon } from './RelicIcon';
import { UserRelicData } from '../../user/UserRelicData';
import { relicConfigs, SkillEffectType } from '../../global/config/RelicConfig';

const { ccclass, property } = _decorator;

@ccclass('RelicDetail')
export class RelicDetail extends Component {

    @property({ type: RelicIcon, tooltip: "圣物小图标" })
    public relicIcon: RelicIcon = null;

    @property({ type: Label, tooltip: "圣物名字" })
    public nameLabel: Label = null;

    @property({ type: Label, tooltip: "攻击力加成" })
    public attackLabel: Label = null;

    @property({ type: Label, tooltip: "生命值加成" })
    public hpLabel: Label = null;

    @property({ type: Label, tooltip: "其他属性加成描述" })
    public otherDescLabel: Label = null;

    @property({ type: Label, tooltip: "是否已装备" })
    public equippedStatusLabel: Label = null;

    @property({ type: Button, tooltip: "装备/卸下按钮" })
    public actionButton: Button = null;

    @property({ type: Label, tooltip: "按钮上的文字" })
    public actionButtonLabel: Label = null;

    private _currentRelicId: number | null = null;
    private _userRelicData: UserRelicData = null;

    onLoad() {
        this._userRelicData = UserRelicData.getInstance();
        this.actionButton.node.on(Button.EventType.CLICK, this.onActionButtonClick, this);
    }

    /**
     * 初始化并显示圣物详情
     * @param relicId 圣物ID
     */
    public show(relicId: number | null): void {
        // 防御性检查：确保 _userRelicData 已被初始化
        if (!this._userRelicData) {
            this._userRelicData = UserRelicData.getInstance();
        }

        if (relicId === null) {
            this.node.active = false;
            return;
        }

        this._currentRelicId = relicId;
        const relicConfig = relicConfigs.find(c => c.id === this._currentRelicId);
        if (!relicConfig) {
            console.error(`[RelicDetail] 找不到ID为 ${relicId} 的圣物配置`);
            this.node.active = false;
            return;
        }

        this.node.active = true;

        // 更新小图标
        this.relicIcon.init(relicConfig);

        // 更新名字
        this.nameLabel.string = relicConfig.name;

        // 更新属性显示
        this.attackLabel.string = "";
        this.hpLabel.string = "";
        this.otherDescLabel.string = "";

        let otherEffects: string[] = [];
        relicConfig.skillEffects.forEach(effect => {
            const desc = effect.description || `${effect.type}: ${effect.value}`;
            switch (effect.type) {
                case SkillEffectType.ATTACK:
                    this.attackLabel.string = effect.value.toString();
                    break;
                case SkillEffectType.MAXHP:
                    this.hpLabel.string = desc;
                    break;
                default:
                    otherEffects.push(desc);
                    break;
            }
        });
        this.otherDescLabel.string = otherEffects.join('\n');
        
        // 更新装备状态和按钮
        this.updateStatus();
    }
    
    /**
     * 更新装备状态和按钮文字
     */
    private updateStatus(): void {
        if (this._currentRelicId === null) return;

        const relicConfig = relicConfigs.find(c => c.id === this._currentRelicId);
        if (!relicConfig) return;

        const equippedRelicId = this._userRelicData.getRelicIdByPosition(relicConfig.position);

        if (equippedRelicId === this._currentRelicId) {
            // 当前圣物已被装备
            this.equippedStatusLabel.string = "已装备";
            this.actionButtonLabel.string = "卸下";
            this.actionButton.interactable = true;
        } else {
            // 未装备或装备了其他圣物
            this.equippedStatusLabel.string = "未装备";
            this.actionButtonLabel.string = "装备";
            // 检查玩家是否拥有此圣物
            const isOwned = this._userRelicData.isRelicOwned(this._currentRelicId);
            this.actionButton.interactable = isOwned; // 只有拥有了才能装备
        }
    }

    /**
     * 装备/卸下按钮点击事件
     */
    private onActionButtonClick(): void {
        if (this._currentRelicId === null) return;

        const relicConfig = relicConfigs.find(c => c.id === this._currentRelicId);
        if (!relicConfig) return;
        
        const equippedRelicId = this._userRelicData.getRelicIdByPosition(relicConfig.position);

        if (equippedRelicId === this._currentRelicId) {
            // 如果当前圣物已装备，则卸下
            this._userRelicData.unequipRelic(relicConfig.position);
        } else {
            // 否则，装备该圣物
            this._userRelicData.equipRelic(this._currentRelicId);
        }
        
        // 操作后更新显示
        this.updateStatus();
        
        // 发送一个全局事件，通知其他UI（如主面板）更新
        director.emit('relics-updated');
    }

    onDestroy() {
    }
} 