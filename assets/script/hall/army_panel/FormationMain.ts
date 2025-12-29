import { _decorator, Component, Node, Button, Label, director, game, Prefab, instantiate, resources, sp, Sprite, SpriteAtlas, EventTouch } from 'cc';
import { UserClassData } from '../../user/UserClassData';
import { UserRelicData } from '../../user/UserRelicData';
import { UserEquipmentData } from '../../user/UserEquipmentData';
import { relicConfigs } from '../../global/config/RelicConfig';
import { equipmentConfigs } from '../../global/config/EquipmentConfig';
import { SmallHeroIcon } from '../../dialog/SmallHeroIcon';
import { RelicPanel } from '../relic/RelicPanel';
import { EquipMainPanel } from '../equip/EquipMainPanel';
import { EquipIcon } from '../equip/EquipIcon';
import { RelicIcon } from '../relic/RelicIcon';
import { ResourceConfig } from '../../global/config/ResourceConfig';
import { HeroCard } from './HeroCard';
import { ArmyPanel } from './ArmyPanel';
import { UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FormationMain')
export class FormationMain extends Component {

    @property({ type: Button, tooltip: "退出按钮" })
    public exitButton: Button = null;

    @property({ type: Button, tooltip: "英雄选择按钮" })
    public heroButton: Button = null;

    @property({ type: Button, tooltip: "圣物选择按钮" })
    public relicButton: Button = null;

    @property({ type: Button, tooltip: "装备选择按钮" })
    public equipButton: Button = null;

    @property({ type: Label, tooltip: "已选英雄显示" })
    public selectedHeroLabel: Label = null;

    @property({ type: Node, tooltip: "英雄图标容器" })
    public heroIconsContainer: Node = null;

    @property({ type: Prefab, tooltip: "小英雄图标预制体" })
    public heroIconPrefab: Prefab = null;

    @property({ type: Node, tooltip: "英雄动画容器" })
    public heroAnimContainer: Node = null;

    @property({ type: [HeroCard], tooltip: "编队英雄卡槽，布局与军团一致" })
    public heroCardList: HeroCard[] = [];

    @property({ type: Node, tooltip: "装备图标容器" })
    public equipIconsContainer: Node = null;

    @property({ type: Node, tooltip: "圣物图标容器" })
    public relicIconsContainer: Node = null;

    @property({ type: [Node], tooltip: "装备图标槽位(3个)" })
    public equipSlots: Node[] = [];

    @property({ type: [Node], tooltip: "圣物图标槽位(5个)" })
    public relicSlots: Node[] = [];

    start() {
        this.exitButton?.node.on(Button.EventType.CLICK, this.onExit, this);
        this.heroButton?.node.on(Button.EventType.CLICK, this.onHero, this);
        this.relicButton?.node.on(Button.EventType.CLICK, this.onRelic, this);
        this.equipButton?.node.on(Button.EventType.CLICK, this.onEquip, this);
        this.heroCardList?.forEach(card => card?.node?.on(Node.EventType.TOUCH_END, (e: any) => { if (e && e.stopPropagation) e.stopPropagation(); this.onHero(); }, this));
        this.equipSlots?.forEach((slot) => slot?.on(Node.EventType.TOUCH_END, (e: any) => { if (e && e.stopPropagation) e.stopPropagation(); this.onEquip(); }, this));
        this.relicSlots?.forEach((slot) => slot?.on(Node.EventType.TOUCH_END, (e: any) => {
            if (e && e.stopPropagation) e.stopPropagation();
            const idx = this.relicSlots.indexOf(slot);
            const pos = idx >= 0 ? (idx + 1) : 1;
            this.onRelicSlot(pos);
        }, this));
        director.on('relics-updated', this.refreshSelections, this);
        this.refreshSelections();
    }

    update(deltaTime: number) {
        
    }

    public show() {
        this.node.active = true;
        this.refreshSelections();
    }

    public hide() {
        this.node.active = false;
    }

    private onExit() {
        this.hide();
    }

    onDestroy() {
        director.off('relics-updated', this.refreshSelections, this);
    }

    private onHero() {
        director.emit(game.gameEvent.HALL_NAV_BUTTON_CLICK, 3);
        this.bringPanelToTopLater('hero');
    }

    private onRelic() {
        director.emit(game.gameEvent.GAME_RELIC_PAGE_SHOW);
        this.bringPanelToTopLater('relic');
    }

    private onRelicSlot(position: number) {
        director.emit(game.gameEvent.GAME_RELIC_PAGE_SHOW);
        this.bringPanelToTopLater('relic');
        this.scheduleOnce(() => {
            const scene = director.getScene();
            const panel = scene?.getComponentsInChildren(RelicPanel)[0];
            if (panel) {
                try {
                    (panel as any).onFilterButtonClick(position);
                } catch {}
            }
        }, 0.05);
    }

    private onEquip() {
        director.emit(game.gameEvent.GAME_EQUIP_PAGE_SHOW);
        this.bringPanelToTopLater('equip');
    }

    private refreshSelections() {
        if (!this.node.active) {
            return;
        }
        const deployed = UserClassData.getInstance().getDeployedCardData();
        const deployedIds = UserClassData.getInstance().getDeployedCardIds();

        if (this.heroCardList && this.heroCardList.length) {
            this.heroCardList.forEach((card, idx) => {
                if (!card) return;
                if (idx < deployedIds.length) {
                    card.setHeroData(deployedIds[idx]);
                    card.loadLevelFromClassData();
                    card.showOnFieldNode();
                } else {
                    card.reset();
                    card.hideOnFieldNode();
                }
            });
        }
        if (this.heroIconsContainer) {
            this.heroIconsContainer.removeAllChildren();
            deployed.forEach(card => {
                if (this.heroIconPrefab) {
                    const node = instantiate(this.heroIconPrefab);
                    node.parent = this.heroIconsContainer;
                    const icon = node.getComponent(SmallHeroIcon);
                    icon?.setHeroById(card.heroId);
                }
            });
        } else if (this.selectedHeroLabel) {
            const heroNames = deployed.map(d => d.name);
            this.selectedHeroLabel.string = heroNames.length ? heroNames.join('、') : '未选择';
        }

        if (this.heroAnimContainer && (!this.heroCardList || this.heroCardList.length === 0)) {
            this.heroAnimContainer.removeAllChildren();
            deployed.forEach(card => {
                const heroData = ResourceConfig.heros_list.find(h => h.id === card.heroId);
                if (!heroData || !heroData.path) return;
                const n = new Node();
                const sk = n.addComponent(sp.Skeleton);
                n.parent = this.heroAnimContainer || this.node;
                resources.load(heroData.path, sp.SkeletonData, (err, skeletonData) => {
                    if (err || !skeletonData || !sk || !sk.node || !sk.node.isValid) return;
                    sk.skeletonData = skeletonData;
                    if (heroData.skinName) {
                        sk.setSkin(heroData.skinName);
                    }
                    sk.setAnimation(0, 'stand by', true);
                });
            });
        }

        const equippedRelicIds = UserRelicData.getInstance().getEquippedRelicIds();

        const chosenSlots = UserEquipmentData.getInstance().getChosenEquipSlots();

        if (this.equipSlots && this.equipSlots.length) {
            const atlases = this.getEquipAtlasesFromScene();
            for (let i = 0; i < this.equipSlots.length; i++) {
                const slotNode = this.equipSlots[i];
                const item = chosenSlots[i];
                this.setEquipSlotNode(slotNode, item?.equipId, atlases?.iconAtlas, atlases?.borderAtlas);
            }
        } else if (this.equipIconsContainer) {
            this.equipIconsContainer.removeAllChildren();
            const atlases = this.getEquipAtlasesFromScene();
            chosenSlots.forEach(item => {
                if (!item) return;
                const iconNode = this.createEquipIconNode(item.equipId, atlases?.iconAtlas, atlases?.borderAtlas);
                if (iconNode) {
                    iconNode.parent = this.equipIconsContainer;
                }
            });
        }

        if (this.relicSlots && this.relicSlots.length) {
            const relicAtlas = this.getRelicAtlasFromScene();
            for (let i = 0; i < this.relicSlots.length; i++) {
                const slotNode = this.relicSlots[i];
                const id = equippedRelicIds[i];
                const cfg = id ? relicConfigs.find(c => c.id === (id as number)) : null;
                this.setRelicSlotNode(slotNode, cfg?.iconFrameName, relicAtlas);
            }
        } else if (this.relicIconsContainer) {
            this.relicIconsContainer.removeAllChildren();
            const relicAtlas = this.getRelicAtlasFromScene();
            equippedRelicIds.forEach(id => {
                if (!id) return;
                const cfg = relicConfigs.find(c => c.id === (id as number));
                if (!cfg) return;
                const node = this.createRelicIconNode(cfg.iconFrameName, relicAtlas);
                if (node) {
                    node.parent = this.relicIconsContainer;
                }
            });
        }

        // 若未设置动画容器，尝试直接在当前节点显示动画，避免“只有框”问题
        if (!this.heroAnimContainer) {
            const heroData = deployed[0] ? ResourceConfig.heros_list.find(h => h.id === deployed[0].heroId) : null;
            if (heroData && heroData.path) {
                const n = new Node();
                const sk = n.addComponent(sp.Skeleton);
                n.parent = this.node;
                resources.load(heroData.path, sp.SkeletonData, (err, skeletonData) => {
                    if (err || !skeletonData || !sk || !sk.node || !sk.node.isValid) return;
                    sk.skeletonData = skeletonData;
                    if (heroData.skinName) {
                        sk.setSkin(heroData.skinName);
                    }
                    sk.setAnimation(0, 'stand by', true);
                });
            }
        }
    }

    private setEquipSlotNode(slotNode: Node | undefined, equipId: number | undefined, iconAtlas?: SpriteAtlas, borderAtlas?: SpriteAtlas) {
        if (!slotNode) return;
        const slotUi = slotNode.getComponent(UITransform) || slotNode.addComponent(UITransform);
        slotUi.setContentSize(170, 170);
        let iconNode = slotNode.getChildByName('icon');
        let borderNode = slotNode.getChildByName('border');
        if (!iconNode) {
            iconNode = new Node('icon');
            iconNode.parent = slotNode;
        }
        if (!borderNode) {
            borderNode = new Node('border');
            borderNode.parent = slotNode;
        }
        const icon = iconNode.getComponent(Sprite) || iconNode.addComponent(Sprite);
        const border = borderNode.getComponent(Sprite) || borderNode.addComponent(Sprite);
        const iconUi = iconNode.getComponent(UITransform) || iconNode.addComponent(UITransform);
        const borderUi = borderNode.getComponent(UITransform) || borderNode.addComponent(UITransform);
        iconUi.setContentSize(170, 170);
        borderUi.setContentSize(170, 170);
        (icon as any).sizeMode = Sprite.SizeMode.CUSTOM;
        (border as any).sizeMode = Sprite.SizeMode.CUSTOM;
        if (!equipId || !iconAtlas || !borderAtlas) {
            icon.spriteFrame = null;
            border.spriteFrame = null;
            return;
        }
        const cfg = equipmentConfigs.find(c => c.id === equipId);
        if (!cfg) {
            icon.spriteFrame = null;
            border.spriteFrame = null;
            return;
        }
        const sf = iconAtlas.getSpriteFrame(cfg.iconFrameName);
        const bf = borderAtlas.getSpriteFrame(`eq_fr_${cfg.equipLevel}`);
        icon.spriteFrame = sf || null;
        border.spriteFrame = bf || null;
    }

    private setRelicSlotNode(slotNode: Node | undefined, frameName: string | undefined, atlas?: SpriteAtlas) {
        if (!slotNode) return;
        const slotUi = slotNode.getComponent(UITransform) || slotNode.addComponent(UITransform);
        slotUi.setContentSize(170, 170);
        let iconNode = slotNode.getChildByName('icon');
        if (!iconNode) {
            iconNode = new Node('icon');
            iconNode.parent = slotNode;
        }
        const sprite = iconNode.getComponent(Sprite) || iconNode.addComponent(Sprite);
        const iconUi = iconNode.getComponent(UITransform) || iconNode.addComponent(UITransform);
        iconUi.setContentSize(170, 170);
        (sprite as any).sizeMode = Sprite.SizeMode.CUSTOM;
        if (!frameName || !atlas) {
            sprite.spriteFrame = null;
            return;
        }
        const sf = atlas.getSpriteFrame(frameName);
        sprite.spriteFrame = sf || null;
    }

    private getEquipAtlasesFromScene(): { iconAtlas?: SpriteAtlas; borderAtlas?: SpriteAtlas } | null {
        const scene = director.getScene();
        if (!scene) return null;
        const panels = scene.getComponentsInChildren(EquipMainPanel);
        const panel = panels && panels.length ? panels[0] : null;
        const slot = panel ? (panel as any).chosenSlot1 as EquipIcon : null;
        const iconAtlas = slot && slot.icon && (slot.icon as any).spriteAtlas ? (slot.icon as any).spriteAtlas as SpriteAtlas : undefined;
        const borderAtlas = slot && slot.border && (slot.border as any).spriteAtlas ? (slot.border as any).spriteAtlas as SpriteAtlas : undefined;
        return { iconAtlas, borderAtlas };
    }

    private createEquipIconNode(equipId: number, iconAtlas?: SpriteAtlas, borderAtlas?: SpriteAtlas): Node | null {
        const cfg = equipmentConfigs.find(c => c.id === equipId);
        if (!cfg) return null;
        const root = new Node();
        const iconNode = new Node('icon');
        const borderNode = new Node('border');
        const icon = iconNode.addComponent(Sprite);
        const border = borderNode.addComponent(Sprite);
        iconNode.parent = root;
        borderNode.parent = root;
        iconNode.setScale(0.9, 0.9);
        borderNode.setScale(1.0, 1.0);
        if (iconAtlas) {
            const sf = iconAtlas.getSpriteFrame(cfg.iconFrameName);
            if (sf) icon.spriteFrame = sf;
        }
        if (borderAtlas) {
            const borderName = `eq_fr_${cfg.equipLevel}`;
            const bf = borderAtlas.getSpriteFrame(borderName);
            if (bf) border.spriteFrame = bf;
        }
        return root;
    }

    private getRelicAtlasFromScene(): SpriteAtlas | undefined {
        const scene = director.getScene();
        if (!scene) return undefined;
        const panels = scene.getComponentsInChildren(RelicPanel);
        const panel = panels && panels.length ? panels[0] : null;
        // 尝试在面板中查找一个 RelicIcon 以获取其图集
        if (panel) {
            const icons = panel.node.getComponentsInChildren(RelicIcon);
            if (icons && icons.length) {
                const atlas = (icons[0] as any).relicAtlas as SpriteAtlas;
                return atlas;
            }
        }
        return undefined;
    }

    private createRelicIconNode(frameName: string, atlas?: SpriteAtlas): Node | null {
        const node = new Node();
        const sprite = node.addComponent(Sprite);
        if (atlas) {
            const sf = atlas.getSpriteFrame(frameName);
            if (sf) {
                sprite.spriteFrame = sf;
                return node;
            }
        }
        return null;
    }

    private bringPanelToTopLater(type: 'relic' | 'equip' | 'hero') {
        this.scheduleOnce(() => {
            const scene = director.getScene();
            const canvas = scene?.getChildByName('Canvas');
            if (!scene || !canvas) return;
            if (type === 'relic') {
                const panels = scene.getComponentsInChildren(RelicPanel);
                const panel = panels && panels.length ? panels[0] : null;
                if (panel) {
                    const node = panel.node;
                    if (node.parent !== canvas) {
                        node.parent = canvas;
                    }
                    node.setSiblingIndex(canvas.children.length - 1);
                }
            } else if (type === 'equip') {
                const panels = scene.getComponentsInChildren(EquipMainPanel);
                const panel = panels && panels.length ? panels[0] : null;
                if (panel) {
                    const node = panel.node;
                    if (node.parent !== canvas) {
                        node.parent = canvas;
                    }
                    node.setSiblingIndex(canvas.children.length - 1);
                }
            } else if (type === 'hero') {
                const panels = scene.getComponentsInChildren(ArmyPanel);
                const panel = panels && panels.length ? panels[0] : null;
                if (panel) {
                    const node = panel.node;
                    if (node.parent !== canvas) {
                        node.parent = canvas;
                    }
                    node.setSiblingIndex(canvas.children.length - 1);
                }
            }
        }, 0);
    }
}


