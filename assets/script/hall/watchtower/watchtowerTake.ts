import { _decorator, Component, Node, Label, Button, Prefab, instantiate, resources, Sprite } from 'cc';
import { HttpClient } from '../../http/HttpClient';
import { watchtowerSmallIcon } from './watchtowerSmallIcon';
import { UserWatchtowerData, UserWatchtowerItem } from '../../user/UserWatchtowerData';
import { game } from 'cc';
import { director } from 'cc';
import { watchtowerConfigs } from '../../global/config/WatchtowerConfig';


const { ccclass, property } = _decorator;

@ccclass('watchtowerTake')
export class watchtowerTake extends Component {
 
     @property({ type: watchtowerSmallIcon, tooltip: "左边的伙伴图标" })
     public partnerLeft: watchtowerSmallIcon = null;
 
     @property({ type: Button, tooltip: "左边伙伴的父节点按钮" })
     public partnerLeftButton: Button = null;
 
     @property({ type: watchtowerSmallIcon, tooltip: "右边的伙伴图标" })
     public partnerRight: watchtowerSmallIcon = null;
 
     @property({ type: Button, tooltip: "右边伙伴的父节点按钮" })
     public partnerRightButton: Button = null;
 
     @property({ type: Label, tooltip: "已上阵伙伴数量" })
     public equippedCountLabel: Label = null;
 
     @property({ type: Button, tooltip: "确定按钮" })
     public confirmButton: Button = null;
 
     @property({ type: Prefab, tooltip: "哨塔图标的预制体" })
     public partnerIconPrefab: Prefab = null;
 
     @property({ type: Node, tooltip: "滚动视图的 content 节点" })
     public content: Node = null;
 
     private _allPartnerIcons: watchtowerSmallIcon[] = [];
     private _tempEquippedIds: (number | null)[] = [null, null];
     private _selectedSlotIndex: number | null = null;
 
     onLoad() {
         this.node.on(Node.EventType.TOUCH_START, ()=>{
             //点击吞噬
         }, this);
 
         this.init();
         this.confirmButton.node.on(Button.EventType.CLICK, this.onConfirm, this);
 
         //默认选中第一个槽位
         // this._selectedSlotIndex=0
         // this.refresh();
     }
 
    private async init() {
        const userData = UserWatchtowerData.getInstance();
        try {
            await userData.loadFromServer();
        } catch (e) {
            console.warn('[watchtowerTake] 加载服务器哨塔数据失败:', e);
        }
        const equippedIds = userData.getEquippedPartnerIds();
        this._tempEquippedIds = [...equippedIds];
        this.initContentNode();
        this.populatePartnerList();
 
         // this.partnerLeft.node.on(Node.EventType.TOUCH_END, (event) => event.propagationStopped = true);
         // this.partnerRight.node.on(Node.EventType.TOUCH_END, (event) => event.propagationStopped = true);
         
         this.partnerLeftButton.node.on(Button.EventType.CLICK, () => this.onSlotButtonClicked(0), this);
         this.partnerRightButton.node.on(Button.EventType.CLICK, () => this.onSlotButtonClicked(1), this);
 
         // 默认选中第一个槽位
         this._selectedSlotIndex=0
         this.refresh();
    }
 
     public refresh() {
         this.updateEquippedPartners();
         this.updateEquippedCountLabel();
         this.updateSlotSelectionVisuals();
        this._allPartnerIcons.forEach(icon => {
            icon.refresh();
            icon.setSelected(this._tempEquippedIds.indexOf(icon.towerId) !== -1);
        });
     }
 
    private populatePartnerList() {
        if (!this.content || !this.content.isValid) {
            console.warn('[watchtowerTake] populatePartnerList: content节点未找到');
            return;
        }
        this.content.removeAllChildren();
        this._allPartnerIcons = [];

        const userData = UserWatchtowerData.getInstance();
        const serverIds = userData.getServerTowerIds();
        const allConfigs = watchtowerConfigs.filter(cfg => serverIds.includes(cfg.id));
        const allPartners = allConfigs
            .map(cfg => userData.getWatchtower(cfg.id))
            .filter((p): p is UserWatchtowerItem => !!p && p.isOwned);
        console.log(`[watchtowerTake] populatePartnerList: 可上阵哨塔 ${allPartners.length} 个`);
 
         if (!this.partnerIconPrefab) {
             resources.load('prefab/hall/watchtower/watchtower_small_icon', Prefab, (err, prefab) => {
                 if (err || !prefab) return;
                 this.partnerIconPrefab = prefab;
                 this.populatePartnerList();
             });
             return;
         }

         for (const partnerData of allPartners) {
             const partnerIconNode = instantiate(this.partnerIconPrefab);
             this.content.addChild(partnerIconNode);
             let partnerIcon = partnerIconNode.getComponent(watchtowerSmallIcon);
             if (!partnerIcon) {
                 partnerIcon = partnerIconNode.addComponent(watchtowerSmallIcon);
                 const icon = partnerIconNode.getChildByName('icon');
                 const mark = partnerIconNode.getChildByName('mark');
                 const levl = partnerIconNode.getChildByName('levl');
                 const equip = partnerIconNode.getChildByName('equip');
                 const xietong = partnerIconNode.getChildByName('xietong');
                 const choose = partnerIconNode.getChildByName('choose');
                 if (icon) partnerIcon.iconSprite = icon.getComponent(Sprite);
                 if (mark) {
                     const classE = mark.getChildByName('class_e');
                     if (classE) partnerIcon.qualitySprite = classE.getComponent(Sprite);
                 }
                 if (levl) {
                     const labelNode = levl.getChildByName('Label');
                     if (labelNode) partnerIcon.levelLabel = labelNode.getComponent(Label);
                 }
                 partnerIcon.equippedNode = equip || null;
                 partnerIcon.synergizedNode = xietong || null;
                 partnerIcon.selectedNode = choose || null;
             }
            partnerIcon.init(partnerData.id);
            partnerIcon.setOnClickCallback((partnerId) => this.onTowerIconClicked(partnerId));
            this._allPartnerIcons.push(partnerIcon);
         }
    }

    private initContentNode(): void {
        if (this.content && this.content.isValid) return;
        let byName = this.node.getChildByName('content')
            || this.node.getChildByName('bg')?.getChildByName('content')
            || this.node.getChildByName('bg')?.getChildByName('tower_list');
        if (!byName) {
            let found: Node | null = null;
            const stack: Node[] = [];
            if (this.node && this.node.isValid) stack.push(this.node);
            while (stack.length) {
                const n = stack.pop();
                if (!n || !n.isValid) continue;
                if (n.name === 'content' || n.name === 'tower_list') {
                    found = n;
                    break;
                }
                const children = n.children;
                if (children && children.length) {
                    for (let i = 0; i < children.length; i++) {
                        const c = children[i];
                        if (c && c.isValid) stack.push(c);
                    }
                }
            }
            byName = found;
        }
        if (byName && byName.isValid) {
            this.content = byName;
        }
    }
 
     private async fetchOwnedPartnersIfNeeded() {
         const owned = UserWatchtowerData.getInstance().getOwnedPartners();
         if (owned && owned.length > 0) return;
     }
 
     private updateEquippedPartners() {
         this.partnerLeft.init(this._tempEquippedIds[0]);
         this.partnerRight.init(this._tempEquippedIds[1]);
     }
 
     private updateEquippedCountLabel() {
         const equippedCount = this._tempEquippedIds.filter(id => id !== null).length;
         this.equippedCountLabel.string = `上阵哨塔数: ${equippedCount}/2`;
     }
 
     private updateSlotSelectionVisuals() {
         const leftLight = this.partnerLeftButton.node.getChildByName('light');
         if(leftLight) leftLight.active = this._selectedSlotIndex === 0;
 
         const rightLight = this.partnerRightButton.node.getChildByName('light');
         if(rightLight) rightLight.active = this._selectedSlotIndex === 1;
     }
 
     private onSlotButtonClicked(slotIndex: number) {
         // if (this._selectedSlotIndex === slotIndex) {
         //     this._selectedSlotIndex = null;
         //     this._tempEquippedIds[slotIndex] = null; // Clear the slot if clicked again
         // } else {
         //     this._selectedSlotIndex = slotIndex;
         // }
 
         this._selectedSlotIndex = slotIndex;
         this.refresh();
     }
 
    private onTowerIconClicked(partnerId: number) {
        // 必须先选择一个上阵位置
        if (this._selectedSlotIndex === null) {
            console.log("请先选择一个上阵位置");
            return;
        }

        if (!UserWatchtowerData.getInstance().isWatchtowerOwned(partnerId)) {
            console.log(`[watchtowerTake] 未拥有的哨塔，无法上阵: ${partnerId}`);
            return;
        }
 
         // 检查被点击的伙伴(partnerId)是否已在某个槽位上阵
         const currentIndex = this._tempEquippedIds.indexOf(partnerId);
 
         if (currentIndex !== -1) {
             // 如果伙伴已上阵
             if (currentIndex === this._selectedSlotIndex) {
                 // 如果点击的伙伴已在当前选中的槽位，则无需任何操作
                 return;
             } else {
                 // 如果伙伴在另一个槽位，则将另一个槽位清空（下阵）
                 this._tempEquippedIds[currentIndex] = null;
             }
         }
 
        // 将当前点击的伙伴(partnerId)设置到选中的槽位
        this._tempEquippedIds[this._selectedSlotIndex] = partnerId;
 
         // this._selectedSlotIndex = null; // Deselect slot after assignment
         this.refresh();
     }
 
     private onClose() {
         this.node.active = false;
     }
 
     private onConfirm() {
         const userData = UserWatchtowerData.getInstance();
         
         userData.unequipPartner(0);
         userData.unequipPartner(1);

         if (this._tempEquippedIds[0]) {
             userData.equipPartner(this._tempEquippedIds[0], 0);
         }
         if (this._tempEquippedIds[1]) {
             userData.equipPartner(this._tempEquippedIds[1], 1);
         }

         console.log("Watchtower setup confirmed:", this._tempEquippedIds);
         this.node.active = false;
         //通知页面刷新
         director.emit(game.gameEvent.GAME_PARTNER_EDITOR_PAGE_REFRESH);
     }
}
 

