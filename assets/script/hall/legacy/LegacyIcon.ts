import { _decorator, Component, Node, Label, Sprite, SpriteAtlas } from 'cc';
import { legacyConfigs, LegacyConfig } from '../../global/config/LegacyConfig';
import { UserLegacyData, UserLegacyItem } from '../../user/UserLegacyData';

const { ccclass, property } = _decorator;

@ccclass('LegacyIcon')
export class LegacyIcon extends Component {

    @property({ type: Sprite, tooltip: "遗物图标" })
    public iconSprite: Sprite = null;

    @property({ type: Sprite, tooltip: "遗物图片" })
    public legacyImageSprite: Sprite = null;

    @property({ type: SpriteAtlas, tooltip: "Kalimdor图集" })
    public kalimdorAtlas: SpriteAtlas = null;

    @property({ type: SpriteAtlas, tooltip: "East图集" })
    public eastAtlas: SpriteAtlas = null;

    @property({ type: SpriteAtlas, tooltip: "Others图集" })
    public othersAtlas: SpriteAtlas = null;

    @property({ type: Sprite, tooltip: "底座背景" })
    public baseSprite: Sprite = null;
    
    @property({ type: Label, tooltip: "遗物名称" })
    public nameLabel: Label = null;

    @property({ type: [Sprite], tooltip: "星级显示的星星数组，共5个" })
    public starSprites: Sprite[] = [];
    
    private _legacyId: number = 0;
    private _onClickCallback: (legacyId: number) => void = null;

    public get legacyId(): number {
        return this._legacyId;
    }

    /**
     * 初始化遗物图标
     * @param legacyId 遗物ID
     */
    public init(legacyId: number) {
        const legacyConfig = legacyConfigs.find(c => c.id === legacyId);
        const legacyData = UserLegacyData.getInstance().getLegacyData(legacyId);

        if (!legacyConfig || !legacyData) {
            console.error(`[LegacyIcon] 无法找到ID为 ${legacyId} 的遗物配置或数据`);
            this.node.active = false;
            return;
        }
        
        this._legacyId = legacyId;
        this.node.active = true;

        this.updateName(legacyConfig);
        this.updateStars(legacyData);
        this.updateBase(legacyConfig);
        this.updateIcon(legacyConfig);
        this.updateLegacyImage(legacyConfig);
    }
    
    private updateName(config: LegacyConfig) {
        if (this.nameLabel) {
            this.nameLabel.string = config.name;
        }
    }
    
    private updateStars(data: UserLegacyItem) {
        this.starSprites.forEach((sprite, index) => {
            if (sprite) {
                // 星级从1开始计数，所以index < star
                sprite.grayscale = index >= data.star;
            }
        });
    }
    
    private updateBase(config: LegacyConfig) {
        if (!this.baseSprite || !this.baseSprite.spriteAtlas) { 
            console.warn("[LegacyIcon] 底座Sprite或其图集未设置"); 
            return; 
        }
        const frame = this.baseSprite.spriteAtlas.getSpriteFrame(config.baseFrameName);
        if (frame) {
            this.baseSprite.spriteFrame = frame;
        } else {
            console.warn(`[LegacyIcon] 在图集中未找到底座: ${config.baseFrameName}`);
        }
    }
    
    private updateIcon(config: LegacyConfig) {
        if (!this.iconSprite || !this.iconSprite.spriteAtlas) { 
            console.warn("[LegacyIcon] 底座Sprite或其图集未设置, 无法更新Icon"); 
            return; 
        }
        // 假设图标的SpriteFrame名称就是遗物的ID
        const frame = this.iconSprite.spriteAtlas.getSpriteFrame(config.iconFrameName);
        if (this.iconSprite && frame) {
            this.iconSprite.spriteFrame = frame;
        } else {
            console.warn(`[LegacyIcon] 在图集中未找到图标: ${config.id}`);
        }
    }

    private updateLegacyImage(config: LegacyConfig) {
        if (!this.legacyImageSprite) {
            return;
        }

        let atlas: SpriteAtlas = null;
        if (config.originZone === 1) {
            atlas = this.eastAtlas;
        } else if (config.originZone === 2) {
            atlas = this.kalimdorAtlas;
        } else {
            atlas = this.othersAtlas;
        }

        if (!atlas) {
            console.warn("[LegacyIcon] 遗物图片图集未设置");
            return;
        }

        const baseName = config.lostImageName;

        let frame = atlas.getSpriteFrame(baseName);
        if (!frame) {
            frame = atlas.getSpriteFrame(baseName + ".png");
        }

        if (frame) {
            this.legacyImageSprite.spriteFrame = frame;
        } else {
            console.warn(`[LegacyIcon] 在图集中未找到遗物图片: ${baseName}`);
        }
    }

    /**
     * 设置点击回调函数
     * @param callback 回调
     */
    public setOnClickCallback(callback: (legacyId: number) => void) {
        this._onClickCallback = callback;
    }

    private onClick() {
        if (this._onClickCallback) {
            this._onClickCallback(this._legacyId);
        }
    }
}
