import { _decorator, Component, Sprite, Label, ProgressBar, Node, resources, SpriteAtlas, SpriteFrame } from "cc";
import { UserEquipmentData } from "../../user/UserEquipmentData";
import { equipmentConfigs } from "../../global/config/EquipmentConfig";

const { ccclass, property } = _decorator;

/**
 * 装备图标的显示数据
 */
export interface EquipIconData {
    iconFrameName: string;      // 图标的精灵帧名称 (来自EquipmentConfig)
    equipLevel: number;         // 装备等级/品质, 用于决定外框 (来自EquipmentConfig)
    level: number;              // 玩家拥有的装备等级
    currentFragments: number;   // 当前碎片数量
    totalFragments: number;     // 升级或解锁所需的总碎片数量
}

@ccclass('EquipIcon')
export class EquipIcon extends Component {

    @property(Sprite)
    icon: Sprite = null;

    @property(Sprite)
    border: Sprite = null;

    @property(Node)
    bottomPanel: Node = null;

    @property(Label)
    levelLabel: Label = null;

    @property(Label)
    fragmentLabel: Label = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;


    private _onClickCallback: Function = null;
    
    // 静态变量用于管理额外的图集加载
    private static _extraAtlas: SpriteAtlas = null;
    private static _isLoadingAtlas: boolean = false;
    private static _waitingList: EquipIcon[] = [];
    
    private _currentIconName: string = "";

    onLoad() {
        // 默认隐藏底部面板
        // 统一绑定触摸点击，确保不依赖预制体事件配置
        this.node.on(Node.EventType.TOUCH_END, this.onclick, this);
    }

    /**
     * 设置底部面板的显示或隐藏
     * @param visible 是否显示
     */
    showBottomPanel(visible: boolean) {
        if (this.bottomPanel) {
            this.bottomPanel.active = visible;
        }
    }

    public setOnClickCallback(callback: Function) {
        this._onClickCallback = callback;
    }

    //执行回调函数
    onclick(): void {

        if (this._onClickCallback) {
            this._onClickCallback();
        }
    }

    /**
     * 根据装备ID从用户数据中更新UI
     * @param equipId 装备ID
     * @param showBottomPanel 是否显示底部面板 (可选，默认不改变当前状态)
     * @returns 是否成功更新
     */
    updateFromEquipId(equipId: number, showBottomPanel?: boolean): boolean {
        // 获取用户装备数据
        const userEquipmentData = UserEquipmentData.getInstance();
        const userEquip = userEquipmentData.getUserEquipment(equipId);
        
        if (!userEquip) {
            console.warn(`[EquipIcon] 未找到装备ID: ${equipId}`);
            return false;
        }

        // 获取装备配置
        const equipConfig = equipmentConfigs.find(config => config.id === equipId);
        if (!equipConfig) {
            console.warn(`[EquipIcon] 未找到装备配置: ${equipId}`);
            return false;
        }

        // 组合数据
        const equipIconData: EquipIconData = {
            iconFrameName: equipConfig.iconFrameName,
            equipLevel: equipConfig.equipLevel,
            level: userEquip.level,
            currentFragments: userEquip.currentFragments,
            totalFragments: userEquip.maxFragments
        };

        // 控制底部面板显示
        if (showBottomPanel !== undefined) {
            this.showBottomPanel(showBottomPanel);
        }

        // 更新UI
        this.updateUi(equipIconData);
        return true;
    }

    /**
     * 根据传入的数据更新UI
     * @param data 用于更新UI的数据
     */
    updateUi(data: EquipIconData) {
        if (!data) {
            return;
        }

        // 更新图标
        if (this.icon && data.iconFrameName) {
            this._currentIconName = data.iconFrameName;
            let spriteFrame: SpriteFrame = null;

            // 1. 尝试从当前绑定的图集获取
            if (this.icon.spriteAtlas) {
                spriteFrame = this.icon.spriteAtlas.getSpriteFrame(data.iconFrameName);
                if (!spriteFrame) spriteFrame = this.icon.spriteAtlas.getSpriteFrame(data.iconFrameName + ".png");
                if (!spriteFrame) spriteFrame = this.icon.spriteAtlas.getSpriteFrame(data.iconFrameName + ".jpg");
            }

            // 2. 如果没找到，尝试从额外的图集获取
            if (!spriteFrame && EquipIcon._extraAtlas) {
                spriteFrame = EquipIcon._extraAtlas.getSpriteFrame(data.iconFrameName);
                if (!spriteFrame) spriteFrame = EquipIcon._extraAtlas.getSpriteFrame(data.iconFrameName + ".png");
                if (!spriteFrame) spriteFrame = EquipIcon._extraAtlas.getSpriteFrame(data.iconFrameName + ".jpg");
            }

            if (spriteFrame) {
                this.icon.spriteFrame = spriteFrame;
            } else {
                // 3. 如果还是没找到，且没有正在加载，则尝试加载额外的图集
                if (!EquipIcon._extraAtlas) {
                    if (!EquipIcon._isLoadingAtlas) {
                        EquipIcon._isLoadingAtlas = true;
                        EquipIcon._waitingList.push(this);
                        
                        resources.load('img/icons/equip_icons_2', SpriteAtlas, (err, atlas) => {
                            EquipIcon._isLoadingAtlas = false;
                            if (err) {
                                console.warn(`[EquipIcon] 加载额外图集失败: ${err}`);
                                EquipIcon._waitingList = [];
                                return;
                            }
                            EquipIcon._extraAtlas = atlas;
                            
                            // 通知等待列表中的组件更新
                            EquipIcon._waitingList.forEach(icon => {
                                if (icon && icon.isValid && icon.icon && icon._currentIconName) {
                                    let frame = atlas.getSpriteFrame(icon._currentIconName);
                                    if (!frame) frame = atlas.getSpriteFrame(icon._currentIconName + ".png");
                                    if (!frame) frame = atlas.getSpriteFrame(icon._currentIconName + ".jpg");
                                    
                                    if (frame) {
                                        icon.icon.spriteFrame = frame;
                                    }
                                }
                            });
                            EquipIcon._waitingList = [];
                        });
                    } else {
                        // 正在加载中，加入等待列表
                        if (EquipIcon._waitingList.indexOf(this) === -1) {
                            EquipIcon._waitingList.push(this);
                        }
                    }
                } else {
                    console.warn(`[EquipIcon] 在图集中未找到图标: ${data.iconFrameName}`);
                }
            }
        }

        // 更新外框
        if (this.border && this.border.spriteAtlas && data.equipLevel > 0) {
            const borderSpriteName = `eq_fr_${data.equipLevel}`;
            const spriteFrame = this.border.spriteAtlas.getSpriteFrame(borderSpriteName);
            if (spriteFrame) {
                this.border.spriteFrame = spriteFrame;
            } else {
                console.warn(`[EquipIcon] 在图集中未找到外框: ${borderSpriteName}`);
            }
        }
        
        if (this.levelLabel) {
            this.levelLabel.string = `Lv.${data.level}`;
        }

        // 更新底部面板的元素
        if (this.bottomPanel && this.bottomPanel.active) {

            if (this.fragmentLabel) {
                this.fragmentLabel.string = `${data.currentFragments}/${data.totalFragments}`;
            }

            if (this.progressBar) {
                this.progressBar.progress = data.totalFragments > 0 ? data.currentFragments / data.totalFragments : 0;
            }
        }
    }
}
