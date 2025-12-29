import { _decorator, Component, Node, Sprite, Label, ProgressBar, SpriteAtlas } from 'cc';
import { TransformationSkinConfigs } from '../../global/config/TransformationSkinConfig';
import { UserTransformationSkinData, UserTransformationSkinItem } from '../../user/UserTransformationSkinData';

const { ccclass, property } = _decorator;

/**
 * @class TransformationIcon
 * @description 单个幻化皮肤图标的UI组件。
 */
@ccclass('TransformationIcon')
export class TransformationIcon extends Component {

    @property(Sprite)
    public iconBg: Sprite = null;

    @property(SpriteAtlas)
    public iconAtlas: SpriteAtlas = null;

    @property(Sprite)
    public icon: Sprite = null;

    @property(Label)
    public levelLabel: Label = null;

    @property(ProgressBar)
    public fragmentProgressBar: ProgressBar = null;

    @property(Label)
    public fragmentLabel: Label = null;

    @property(Node)
    public selectedNode: Node = null;

    @property(Node)
    public disabledNode: Node = null; // 比如，当部位不匹配时

    @property(Node)
    public lockedNode: Node = null;   // 在此项目中默认不使用，但保留结构

    private _skinItem: UserTransformationSkinItem = null;
    private _onClickCallback: (skinId: number) => void = null;

    public get skinId(): number {
        return this._skinItem?.transformatskinId;
    }

    /**
     * 初始化图标
     * @param skinItem 皮肤的用户数据
     */
    public init(skinItem: UserTransformationSkinItem) {
        this._skinItem = skinItem;
        this.refresh();
    }

    /**
     * 刷新整个图标的显示
     */
    public refresh() {
        if (!this._skinItem) return;

        const skinConfig = TransformationSkinConfigs.find(c => c.transformatskinId === this._skinItem.transformatskinId);
        if (!skinConfig) {
            console.error(`[TransformationIcon] 找不到皮肤配置: ${this._skinItem.transformatskinId}`);
            this.node.active = false;
            return;
        }

        // 1. 更新背景
        const bgFrameName = `transformation_${4+skinConfig.quality}`;
        const bgSpriteFrame = this.iconAtlas.getSpriteFrame(bgFrameName);
        if (bgSpriteFrame) {
            this.iconBg.spriteFrame = bgSpriteFrame;
        } else {
            console.warn(`[TransformationIcon] 在图集中找不到背景SpriteFrame: ${bgFrameName}`);
        }
        
        // 2. 更新图标 (预留方法，待资源就绪)
        // this.updateIcon(skinConfig.icon);

        // 3. 更新等级
        this.levelLabel.string = `${this._skinItem.level}级`;

        // 4. 更新碎片进度条和文本
        const requiredFragments = UserTransformationSkinData.getInstance().getFragmentsRequiredForLevelUp(this._skinItem.transformatskinId);
        if (requiredFragments > 0) {
            this.fragmentProgressBar.progress = this._skinItem.fragmentCount / requiredFragments;
            this.fragmentLabel.string = `${this._skinItem.fragmentCount}/${requiredFragments}`;
            this.fragmentProgressBar.node.active = true;
        } else {
            // 已满级
            this.fragmentProgressBar.progress = 1;
            this.fragmentLabel.string = "MAX";
        }

        // 5. 初始化状态
        this.setSelected(false);
        this.setDisabled(false);
        this.setLocked(false); // 默认都解锁
    }

    /**
     * 更新皮肤图标（待实现）
     * @param iconName 图标资源名
     */
    private updateIcon(iconName: string) {
        // const iconSpriteFrame = ... (从某个图集加载)
        // if(iconSpriteFrame) {
        //     this.icon.spriteFrame = iconSpriteFrame;
        // }
    }

    /**
     * 设置点击回调函数
     * @param callback 回调
     */
    public setOnClickCallback(callback: (skinId: number) => void) {
        this._onClickCallback = callback;
    }

    private onClick() {
        if (this._onClickCallback && this._skinItem) {
            this._onClickCallback(this._skinItem.transformatskinId);
        }
    }

    // --- 状态控制 ---

    public setSelected(isSelected: boolean) {
        if(this.selectedNode) this.selectedNode.active = isSelected;
    }

    public setDisabled(isDisabled: boolean) {
        if(this.disabledNode) this.disabledNode.active = isDisabled;
    }

    public setLocked(isLocked: boolean) {
        if(this.lockedNode) this.lockedNode.active = isLocked;
    }
}
