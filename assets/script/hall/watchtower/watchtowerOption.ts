import { _decorator, Component, Node, director, Button, Prefab, instantiate, resources, Sprite, SpriteAtlas, Label, Animation, AnimationClip, UITransform } from 'cc';
import { UserWatchtowerData } from '../../user/UserWatchtowerData';
import { watchtowerConfigs } from '../../global/config/WatchtowerConfig';
import { game } from 'cc';
import { watchtowerSmallIcon } from './watchtowerSmallIcon';
import { watchtowerSmallIconDown } from './watchtowerSmallIconDown';
const { ccclass, property } = _decorator;

@ccclass('watchtowerOption')
export class watchtowerOption extends Component {
    @property({ type: Button })
    public openTakeButton: Button = null;

    @property({ type: Button })
    public openMainButton: Button = null;

    @property({ type: Sprite })
    public slotLeftSprite: Sprite = null;

    @property({ type: Sprite })
    public slotRightSprite: Sprite = null;

    @property({ type: Label })
    public slotLeftLabel: Label = null;

    @property({ type: Label })
    public slotRightLabel: Label = null;

    @property({ type: Node })
    public content: Node = null;

    @property({ type: Prefab })
    public towerIconPrefab: Prefab = null;

    private _slotLeftSprite: Sprite | null = null;
    private _slotRightSprite: Sprite | null = null;
    private _slotLeftLabel: Label | null = null;
    private _slotRightLabel: Label | null = null;
    private _takeNode: Node | null = null;
    private _allIcons: watchtowerSmallIcon[] = [];
    async start() {
        console.log('[watchtowerOption] start() 开始执行');

        // 绑定打开选择弹窗按钮
        try {
            if (this.openTakeButton) {
                this.openTakeButton.node.off(Button.EventType.CLICK);
                this.openTakeButton.node.on(Button.EventType.CLICK, () => this.openTake(), this);
            } else {
                const btn = this.node.getChildByName('btn_take')?.getComponent(Button);
                if (btn) {
                    btn.node.off(Button.EventType.CLICK);
                    btn.node.on(Button.EventType.CLICK, () => this.openTake(), this);
                }
            }
        } catch {}

        try {
            if (this.openMainButton) {
                this.openMainButton.node.off(Button.EventType.CLICK);
                this.openMainButton.node.on(Button.EventType.CLICK, () => this.openMain(), this);
            } else {
                const btnMain = this.node.getChildByName('btn_main')?.getComponent(Button)
                    || this.node.getChildByName('btn_watchtower_main')?.getComponent(Button)
                    || this.node.getChildByName('btn_back_to_main')?.getComponent(Button);
                if (btnMain) {
                    btnMain.node.off(Button.EventType.CLICK);
                    btnMain.node.on(Button.EventType.CLICK, () => this.openMain(), this);
                }
            }
        } catch {}

        // 查找两个上阵显示位的Sprite
        try {
            const bg = this.node.getChildByName('bg');
            const layout2 = bg?.getChildByName('Layout2');
            const leftNode = layout2?.getChildByName('Watchtower_31');
            const rightNode = layout2?.getChildByName('Watchtower_36');
            this._slotLeftSprite = leftNode ? leftNode.getComponent(Sprite) : null;
            this._slotRightSprite = rightNode ? rightNode.getComponent(Sprite) : null;
            const label1Node = layout2?.getChildByName('Label1');
            const label2Node = layout2?.getChildByName('Label2');
            this._slotLeftLabel = label1Node ? label1Node.getComponent(Label) : null;
            this._slotRightLabel = label2Node ? label2Node.getComponent(Label) : null;
            // 覆盖为编辑器绑定的节点（如果提供）
            this._slotLeftSprite = this.slotLeftSprite || this._slotLeftSprite;
            this._slotRightSprite = this.slotRightSprite || this._slotRightSprite;
            this._slotLeftLabel = this.slotLeftLabel || this._slotLeftLabel;
            this._slotRightLabel = this.slotRightLabel || this._slotRightLabel;
        } catch {}

        // 监听选择完成事件，刷新显示
        try { director.on(game.gameEvent.GAME_PARTNER_EDITOR_PAGE_REFRESH, this.updateSlotsFromData, this); } catch {}
        this.updateSlotsFromData();

        // 确保UserWatchtowerData已经初始化
        console.log('[watchtowerOption] 准备获取UserWatchtowerData实例');
        const userData = UserWatchtowerData.getInstance();
        await userData.loadFromServer();
        const allOwned = userData.getOwnedWatchtowers();
        console.log(`[watchtowerOption] UserWatchtowerData初始化完成，已拥有 ${allOwned.length} 个哨塔`);

        this.initContentNode();
        this.populateTowerList();
        
        console.log('[watchtowerOption] start() 执行完成');
    }

    update(deltaTime: number) {
        
    }

    public show(): void {
        this.node.active = true;
    }

    public hide(): void {
        this.node.active = false;
    }

    private openTake(): void {
        try {
            director.emit(game.gameEvent.GAME_WATCHTOWER_TAKE_PAGE_SHOW);
        } catch {}
    }

    private openMain(): void {
        try {
            director.emit(game.gameEvent.GAME_WATCHTOWER_MAIN_PAGE_SHOW);
        } catch {}
        try { this.node.active = false; } catch {}
    }

    private openUpgrade(id?: number): void {
        try {
            director.emit(game.gameEvent.GAME_WATCHTOWER_UPGRADE_PAGE_SHOW, id);
        } catch {}
    }

    // 供编辑器事件绑定的小图标点击方法：在按钮事件中将 CustomEventData 设置为哨塔ID
    public onClickOpenUpgrade(event: Event, customEventData: string): void {
        const id = Number(customEventData);
        this.openUpgrade(isNaN(id) ? undefined : id);
    }

    private updateSlotsFromData(): void {
        const equipped = UserWatchtowerData.getInstance().getEquippedWatchtowerIds();
        resources.load('img/hall/watchtower', SpriteAtlas, (err, atlas) => {
            if (err || !atlas) return;
            const setFrame = (sprite: Sprite | null, id: number | null) => {
                if (!sprite) return;
                if (!id) { sprite.spriteFrame = null; return; }
                const cfg = watchtowerConfigs.find(c => c.id === id);
                if (!cfg) { sprite.spriteFrame = null; return; }
                const frame = atlas.getSpriteFrame(cfg.iconFrameName) || atlas.getSpriteFrame(cfg.iconFrameName + '.png');
                if (frame) {
                    sprite.spriteAtlas = atlas;
                    sprite.spriteFrame = frame;
                }
                this.playSlotAnimation(sprite, id);
            };
            setFrame(this._slotLeftSprite, equipped[0] || null);
            setFrame(this._slotRightSprite, equipped[1] || null);
            const setLabel = (label: Label | null, id: number | null) => {
                if (!label) return;
                if (!id) { label.string = ''; return; }
                const cfg = watchtowerConfigs.find(c => c.id === id);
                label.string = cfg ? cfg.name : '';
            };
            setLabel(this._slotLeftLabel, equipped[0] || null);
            setLabel(this._slotRightLabel, equipped[1] || null);
        });
    }

    private playSlotAnimation(sprite: Sprite | null, id: number | null): void {
        if (!sprite || !id) return;
        let clipName = '';
        if (id === 10012) clipName = 'Watchtower_1';
        else if (id === 10016) clipName = 'Watchtower_3';
        else if (id === 10017) clipName = 'Watchtower_4';
        else if (id === 10018) clipName = 'Watchtower_2';
        else return;

        // 在槽位Sprite节点下创建一个子节点用于播放动画，保留原始哨塔图标
        const host = sprite.node;
        let animNode = host.getChildByName('slotAnim');
        if (!animNode) {
            animNode = new Node('slotAnim');
            animNode.setPosition(0, 0);
            host.addChild(animNode);
        }
        let animSprite = animNode.getComponent(Sprite);
        if (!animSprite) animSprite = animNode.addComponent(Sprite);
        // 初始与底层图标一致，避免短暂无图
        if (sprite.spriteFrame) animSprite.spriteFrame = sprite.spriteFrame;
        if (sprite.spriteAtlas) animSprite.spriteAtlas = sprite.spriteAtlas;

        let anim = animNode.getComponent(Animation);
        if (!anim) anim = animNode.addComponent(Animation);
        const existing = (anim as any).clips?.find((c: AnimationClip) => c && c.name === clipName);
        if (existing) {
            existing.wrapMode = AnimationClip.WrapMode.Loop;
            anim.play(clipName);
            return;
        }
        resources.load(`anim/img/${clipName}`, AnimationClip, (err, clip) => {
            if (err || !clip || !anim) return;
            clip.wrapMode = AnimationClip.WrapMode.Loop;
            (anim as any).createState(clip, clipName);
            anim.play(clipName);
        });
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

    private populateTowerList(): void {
        if (!this.content) {
            console.warn('[watchtowerOption] populateTowerList: content节点未找到');
            return;
        }
        this.content.removeAllChildren();
        this._allIcons = [];

        const userData = UserWatchtowerData.getInstance();
        const serverIds = userData.getServerTowerIds();
        const towers = watchtowerConfigs.filter(cfg => serverIds.includes(cfg.id));
        console.log(`[watchtowerOption] populateTowerList: 从服务端筛选到 ${towers.length} 个哨塔`);
        console.log('[watchtowerOption] 哨塔ID列表:', towers.map(t => t.id));

        if (!this.towerIconPrefab) {
            resources.load('prefab/hall/watchtower/watchtower_small_icon', Prefab, (err, prefab) => {
                if (err || !prefab) return;
                this.towerIconPrefab = prefab;
                this.populateTowerList();
            });
            return;
        }

        for (const cfg of towers) {
            const node = instantiate(this.towerIconPrefab);
            node.name = `watchtower_icon_${cfg.id}`;
            this.content.addChild(node);

            let icon = node.getComponent(watchtowerSmallIcon) as watchtowerSmallIcon | null;
            if (!icon) icon = node.getComponent(watchtowerSmallIconDown) as any;
            if (!icon) {
                icon = node.addComponent(watchtowerSmallIcon);
                const iconNode = node.getChildByName('icon');
                const mark = node.getChildByName('mark');
                const levl = node.getChildByName('levl');
                const equip = node.getChildByName('equip');
                const xietong = node.getChildByName('xietong');
                const choose = node.getChildByName('choose');
                if (iconNode) icon.iconSprite = iconNode.getComponent(Sprite);
                if (mark) {
                    const classE = mark.getChildByName('class_e');
                    if (classE) icon.qualitySprite = classE.getComponent(Sprite);
                }
                if (levl) {
                    const labelNode = levl.getChildByName('Label');
                    if (labelNode) icon.levelLabel = labelNode.getComponent(Label);
                }
                icon.equippedNode = equip || null;
                icon.synergizedNode = xietong || null;
                icon.selectedNode = choose || null;
            }

            icon.init(cfg.id);
            icon.setOnClickCallback((towerId: number) => this.openUpgrade(towerId));
            this._allIcons.push(icon);
        }

        try {
            const ct = this.content.getComponent(UITransform);
            const children = this.content.children || [];
            const first = children[0];
            const it = first ? first.getComponent(UITransform) : null;
            const itemW = it ? it.width : 100;
            const itemH = it ? it.height : 100;
            const paddingX = 10;
            const paddingY = 10;
            const spacingX = 10;
            const spacingY = 10;
            const cols = 6;
            const contentW = ct ? ct.width : (cols * (itemW + spacingX) + paddingX * 2);
            const contentH = ct ? ct.height : Math.ceil(children.length / cols) * (itemH + spacingY) + paddingY * 2;
            const startX = -contentW / 2 + paddingX + itemW / 2;
            const startY = contentH / 2 - paddingY - itemH / 2;
            for (let i = 0; i < children.length; i++) {
                const r = Math.floor(i / cols);
                const c = i % cols;
                const x = startX + c * (itemW + spacingX);
                const y = startY - r * (itemH + spacingY);
                children[i].setPosition(x, y);
            }
        } catch {}

        console.log(`[watchtowerOption] 成功创建 ${this._allIcons.length} 个哨塔图标`);
    }
}


