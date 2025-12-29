import { _decorator, Component, Node, Label, Button, Prefab, instantiate, resources, Sprite } from 'cc';
import { HttpClient } from '../../http/HttpClient';
import { PartnerIcon } from './PartnerIcon';
import { UserPartnerData } from '../../user/UserPartnerData';
import { game } from 'cc';
import { director } from 'cc';


const { ccclass, property } = _decorator;

@ccclass('PartnerEditor')
export class PartnerEditor extends Component {

    @property({ type: PartnerIcon, tooltip: "左边的伙伴图标" })
    public partnerLeft: PartnerIcon = null;

    @property({ type: Button, tooltip: "左边伙伴的父节点按钮" })
    public partnerLeftButton: Button = null;

    @property({ type: PartnerIcon, tooltip: "右边的伙伴图标" })
    public partnerRight: PartnerIcon = null;

    @property({ type: Button, tooltip: "右边伙伴的父节点按钮" })
    public partnerRightButton: Button = null;

    @property({ type: Label, tooltip: "已上阵伙伴数量" })
    public equippedCountLabel: Label = null;

    @property({ type: Button, tooltip: "确定按钮" })
    public confirmButton: Button = null;

    @property({ type: Prefab, tooltip: "伙伴图标的预制体" })
    public partnerIconPrefab: Prefab = null;

    @property({ type: Node, tooltip: "滚动视图的 content 节点" })
    public content: Node = null;

    private _allPartnerIcons: PartnerIcon[] = [];
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
        const equippedIds = UserPartnerData.getInstance().getEquippedPartnerIds();
        this._tempEquippedIds = [...equippedIds];
        await this.fetchOwnedPartnersIfNeeded();
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
            icon.setSelected(this._tempEquippedIds.indexOf(icon.partnerId) !== -1);
        });
    }

    private populatePartnerList() {
        this.content.removeAllChildren();
        this._allPartnerIcons = [];

        const allPartners = UserPartnerData.getInstance().getOwnedPartners();

        if (!this.partnerIconPrefab) {
            resources.load('prefab/hall/partner/partner_small_icon', Prefab, (err, prefab) => {
                if (err || !prefab) return;
                this.partnerIconPrefab = prefab;
                this.populatePartnerList();
            });
            return;
        }

        for (const partnerData of allPartners) {
            const partnerIconNode = instantiate(this.partnerIconPrefab);
            this.content.addChild(partnerIconNode);
            let partnerIcon = partnerIconNode.getComponent(PartnerIcon);
            if (!partnerIcon) {
                partnerIcon = partnerIconNode.addComponent(PartnerIcon);
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
            partnerIcon.setOnClickCallback((partnerId) => this.onPartnerIconClicked(partnerId));
            this._allPartnerIcons.push(partnerIcon);
        }
    }

    private async fetchOwnedPartnersIfNeeded() {
        const owned = UserPartnerData.getInstance().getOwnedPartners();
        if (owned && owned.length > 0) return;
        try {
            const client = HttpClient.getInstance();
            const listResp: any = await client.get(`/api/user/partner/list?ts=${Date.now()}`);
            const listData = listResp && listResp.data && listResp.data.data ? listResp.data.data : [];
            UserPartnerData.getInstance().syncFromPartnerList(listData);
        } catch {}
    }

    private updateEquippedPartners() {
        this.partnerLeft.init(this._tempEquippedIds[0]);
        this.partnerRight.init(this._tempEquippedIds[1]);
    }

    private updateEquippedCountLabel() {
        const equippedCount = this._tempEquippedIds.filter(id => id !== null).length;
        this.equippedCountLabel.string = `上阵伙伴数: ${equippedCount}/2`;
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

    private onPartnerIconClicked(partnerId: number) {
        // 必须先选择一个上阵位置
        if (this._selectedSlotIndex === null) {
            console.log("请先选择一个上阵位置");
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
        const userData = UserPartnerData.getInstance();
        
        userData.unequipPartner(0);
        userData.unequipPartner(1);

        if (this._tempEquippedIds[0]) {
            userData.equipPartner(this._tempEquippedIds[0], 0);
        }
        if (this._tempEquippedIds[1]) {
            userData.equipPartner(this._tempEquippedIds[1], 1);
        }

        console.log("Partner setup confirmed:", this._tempEquippedIds);
        this.node.active = false;
        //通知页面刷新
        director.emit(game.gameEvent.GAME_PARTNER_EDITOR_PAGE_REFRESH);
    }
}
