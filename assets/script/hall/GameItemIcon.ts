import { _decorator, Component, Sprite, SpriteAtlas, find, Label, Node } from 'cc';
import { gameItemConfigs, GameItemConfig } from '../global/config/GameItemConfig';
import { Color } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('GameItemIcon')
export class GameItemIcon extends Component {

    @property(Sprite)
    iconSprite: Sprite = null!;

    @property(SpriteAtlas)
    iconAtlas: SpriteAtlas = null!;

    @property(Label)
    countLabel: Label = null!;

    //已领取图标
    @property(Node)
    collectedNode: Node = null!;

    //背景
    @property(Sprite)
    backgroundNode: Sprite = null!;

    private _itemConfig: GameItemConfig | null = null;
      

    /**
     * 根据道具ID初始化图标
     * @param itemId 道具ID
     * @param atlas 可选的图集，如果未提供，则使用组件上挂载的图集
     */
    public init(itemId: number, atlas?: SpriteAtlas) {
        this._itemConfig = gameItemConfigs.find(c => c.id === itemId) || null;
        if (!this._itemConfig) {
            console.error(`GameItemIcon: 找不到ID为 ${itemId} 的道具配置`);
            this.iconSprite.spriteFrame = null;
            return;
        }

        const targetAtlas = atlas || this.iconAtlas;
        if (!targetAtlas) {
            console.error(`GameItemIcon: 道具 ${itemId} 未能找到图集`);
            return;
        }

        const spriteFrame = targetAtlas.getSpriteFrame(this._itemConfig.iconFrameName);
        if (spriteFrame) {
            this.iconSprite.spriteFrame = spriteFrame;
        } else {
            console.error(`GameItemIcon: 在图集 ${targetAtlas.name} 中找不到名为 ${this._itemConfig.iconFrameName} 的 SpriteFrame`);
            this.iconSprite.spriteFrame = null;
        }

        // 默认不显示数量
        if (this.countLabel) {
            this.countLabel.node.active = false;
        }
        
        // 根据配置设置背景颜色
        this.setBackground(this._itemConfig.colorScheme);
    }

    //设置背景颜色
    public setBackground(colorHex?: string) {
        if (!this.backgroundNode) {
            console.error('GameItemIcon: backgroundNode 未设置');
            return;
        }
        
        if (colorHex) {
            // console.log(`GameItemIcon: 设置背景颜色 ${colorHex}`);
            const color = this.hexToColor(colorHex);
            this.backgroundNode.color = color;
            // console.log(`GameItemIcon: 背景颜色已设置为 R:${color.r.toFixed(3)} G:${color.g.toFixed(3)} B:${color.b.toFixed(3)} A:${color.a.toFixed(3)}`);
        } else {
            const randomColor = this.getRandomBackgroundColor();
            this.backgroundNode.color = randomColor;
            // console.log(`GameItemIcon: 使用随机背景颜色 R:${randomColor.r.toFixed(3)} G:${randomColor.g.toFixed(3)} B:${randomColor.b.toFixed(3)} A:${randomColor.a.toFixed(3)}`);
        }
    }

    // 将十六进制颜色字符串转换为Color对象
    private hexToColor(hex: string): Color {
        // 移除#号
        const cleanHex = hex.replace('#', '');
        
        // 确保是6位十六进制
        if (cleanHex.length !== 6) {
            // console.error(`GameItemIcon: 无效的颜色格式 ${hex}`);
            return new Color(255, 255, 255, 255); // 返回白色作为默认值
        }
        
        // 解析RGB值 (0-255范围)
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        
        // console.log(`GameItemIcon: 颜色转换 ${hex} -> RGB(${r}, ${g}, ${b})`);
        
        // 创建Color对象，使用0-255范围
        return new Color(r, g, b, 255);
    }

    public getRandomBackgroundColor(): Color {
        // 预定义一些默认背景色 (使用0-255范围)
        const defaultColors = [
            new Color(102, 153, 204, 255), // 浅蓝色
            new Color(204, 153, 102, 255), // 浅橙色
            new Color(153, 204, 102, 255), // 浅绿色
            new Color(204, 102, 153, 255), // 浅紫色
            new Color(179, 179, 179, 255), // 浅灰色
        ];
        
        const randomIndex = Math.floor(Math.random() * defaultColors.length);
        return defaultColors[randomIndex];
    }

    /**
     * 设置道具数量
     * @param count 数量
     */
    public setCount(count: number) {
        if (this.countLabel) {
            if (count > 1) {
                this.countLabel.string = count.toString();
                this.countLabel.node.active = true;
            } else {
                this.countLabel.node.active = false;
            }
        }
    }

    /**
     * 设置为已领取状态（用于邮件等）
     * @param isCollected 
     */
    public setCollected(isCollected: boolean) {
        // 让图标变灰等
        this.collectedNode.active = isCollected;
    }
} 