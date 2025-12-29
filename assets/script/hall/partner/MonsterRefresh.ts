import { _decorator, Component, Node, Label, sp, resources, Sprite, SpriteAtlas, director, tween, Vec3 } from 'cc';
import { ShowToast } from '../../global/Toast';
import { partnerConfigs, PartnerConfig } from '../../global/config/PartnerConfig';
import { HttpClient } from '../../http/HttpClient';
import { APIResponse } from '../../api/APITypes';
const { ccclass, property } = _decorator;

@ccclass('MonsterRefresh')
export class MonsterRefresh extends Component {
    @property({ type: Node })
    public animationContainer: Node = null;
    @property({ type: Label })
    public orbCountLabel: Label = null;
    @property({ type: Label, tooltip: "怪物名称1" })
    public monsterNameLabel1: Label = null;
    @property({ type: Label, tooltip: "怪物名称2" })
    public monsterNameLabel2: Label = null;
    @property({ type: Label, tooltip: "怪物名称3" })
    public monsterNameLabel3: Label = null;
    private _monsterAtlas: SpriteAtlas | null = null;
    private _skeletonCache: Record<string, sp.SkeletonData> = {};
    private _lastItems: SummonItem[] = [];
    private _rowStartY: number = 120;
    private _rowSpacingY: number = -80;
    private _activeSummonNode: Node | null = null;
    private _selectedSummonId: number | null = null;
    private _summonPopupNode: Node | null = null;
    private _iconAnimHandlers: Array<() => void> = [];
    private _iconAnimIndex: number[] = [0, 0, 0];
    private _iconAnimFPS: number = 8;

    async start() {
        await this.fetchAndRender();
    }

    public async refreshList(): Promise<void> {
        this.clearGeneratedNodes();
        this.stopAllIconAnimations();
        this._selectedSummonId = null;
        for (let i = 0; i < 3; i++) {
            const m = this.node.getChildByName(`Monster_${i + 1}`);
            if (m) m.active = true;
        }
        this.hideAllSummonNodes();
        await this.fetchAndRender();
    }

    private async fetchAndRender(): Promise<void> {
        try {
            const client = HttpClient.getInstance();
            const result = await client.get<APIResponse<SummonItem[]>>(`/api/user/partner?ts=${Date.now()}`);
            if (!result.success || !result.data) {
                console.error('MonsterRefresh: 请求失败');
                return;
            }
            const resp = result.data as APIResponse<SummonItem[]>;
            if (resp.code !== 200 || !Array.isArray(resp.data)) {
                console.error('MonsterRefresh: 响应格式错误');
                return;
            }
            const items = resp.data.slice(0, 3);
            this._lastItems = items;
            this.renderList(items);
            this.setMonsterIcons(items);
            this.updateOrbCount(items[0] || null);
            this.bindMonsterClickHandlers();
            this.bindSummonConfirmHandlers();
            this.hideAllSummonNodes();
            this._activeSummonNode = null;
        } catch (e) {
            console.error('MonsterRefresh: 异常', e);
        }
    }

    private renderList(items: SummonItem[]): void {
        const spacingY = this._rowSpacingY;
        const startY = this._rowStartY;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            this.scheduleOnce(() => {
                const row = new Node(`MonsterItem_${i + 1}`);
                const label = row.addComponent(Label);
                label.fontSize = 36;
                label.lineHeight = 40;
                label.enableWrapText = false;
                label.overflow = Label.Overflow.NONE;
                label.horizontalAlign = Label.HorizontalAlign.LEFT;
                label.verticalAlign = Label.VerticalAlign.CENTER;
                const purchaseText = item.isPurchase === 1 ? '已购买' : '未购买';
                const name = item.partnerName || `伙伴${item.partnerId}`;
                label.string = `${name} | 宝珠: ${item.partnerSummonOrb} | ${purchaseText}`;
                row.setPosition(0, startY + i * spacingY);
                this.node.addChild(row);

                const monsterNode = this.node.getChildByName(`Monster_${i + 1}`);
                if (monsterNode) {
                    const bound = i === 0 ? this.monsterNameLabel1 : (i === 1 ? this.monsterNameLabel2 : this.monsterNameLabel3);
                    if (bound && bound.isValid) {
                        bound.string = item.partnerName || '';
                    } else {
                        const nameLabelNode = monsterNode.getChildByName('NameLabel');
                        if (nameLabelNode) {
                            const nameLabel = nameLabelNode.getComponent(Label);
                            if (nameLabel) {
                                nameLabel.string = item.partnerName || '';
                            }
                        } else {
                            const nameNode = new Node('NameLabel');
                            const nameLabel = nameNode.addComponent(Label);
                            nameLabel.fontSize = 36;
                            nameLabel.lineHeight = 40;
                            nameLabel.string = item.partnerName || '';
                            monsterNode.addChild(nameNode);
                        }
                    }
                }
            }, i * 0.001);
        }
    }

    private setMonsterIcons(items: SummonItem[]): void {
        const apply = (atlas: SpriteAtlas) => {
            const sprites = this.node.getComponentsInChildren(Sprite);
            const targetMap: Record<string, Sprite> = {};
            for (const spComp of sprites) {
                const n = spComp.node?.name;
                if (n === 'Monster_1' || n === 'Monster_2' || n === 'Monster_3') {
                    targetMap[n] = spComp;
                }
            }
            for (let i = 0; i < 3; i++) {
                const item = items[i];
                if (!item || !item.nameAs) continue;
                const key = `Monster_${i + 1}`;
                const sprite = targetMap[key];
                if (!sprite) continue;
                const name = item.nameAs;
                let frame = atlas.getSpriteFrame(name);
                if (!frame) frame = atlas.getSpriteFrame(name + '.png');
                if (!frame) {
                    sprite.spriteFrame = null;
                    return;
                }
                sprite.spriteAtlas = atlas;
                sprite.spriteFrame = frame;

                // 尝试为静态图标绑定序列帧动画
                this.startIconAnimation(atlas, sprite, name, i);
            }
        };
        this.loadMonsterAtlas(() => apply(this._monsterAtlas!));
    }

    private loadMonsterAtlas(cb?: () => void): void {
        if (this._monsterAtlas) {
            cb && cb();
            return;
        }
        resources.load('img/icons/Partner_1', SpriteAtlas, (err, atlas) => {
            if (!err && atlas) {
                this._monsterAtlas = atlas;
                cb && cb();
                return;
            }
            resources.load('img/icons/monster_icons', SpriteAtlas, (err2, fallback) => {
                if (err2 || !fallback) return;
                this._monsterAtlas = fallback;
                cb && cb();
            });
        });
    }

    private updateOrbCount(item: SummonItem | null): void {
        const text = item && typeof item.partnerSummonOrb === 'number'
            ? `召唤所需宝珠：${item.partnerSummonOrb}`
            : '';
        if (this.orbCountLabel && this.orbCountLabel.isValid) {
            this.orbCountLabel.string = text;
            return;
        }
        const mount = this.animationContainer || this.node;
        const node = new Node('OrbCountLabel');
        const label = node.addComponent(Label);
        label.fontSize = 36;
        label.lineHeight = 40;
        label.string = text;
        node.setPosition(0, 220);
        mount.addChild(node);
        this.orbCountLabel = label;
    }

    private clearGeneratedNodes(): void {
        const mount = this.animationContainer || this.node;
        const toRemoveNames = ['OrbCountLabel', 'SummonSuccessPopup'];
        for (const child of this.node.children.slice()) {
            if (child.name.startsWith('MonsterItem_')) {
                child.destroy();
            }
        }
        for (const child of mount.children.slice()) {
            if (child.name.startsWith('MonsterSpine_') || toRemoveNames.includes(child.name)) {
                child.destroy();
            }
        }
    }

    private clearSpineNodes(): void {
        const mount = this.animationContainer || this.node;
        for (const child of mount.children.slice()) {
            if (child.name.startsWith('MonsterSpine_')) {
                child.destroy();
            }
        }
    }

    private startIconAnimation(atlas: SpriteAtlas, sprite: Sprite, baseName: string, index: number): void {
        // 构造可能的序列帧名称列表
        const candidates: string[] = [];
        for (let i = 0; i < 20; i++) {
            candidates.push(`${baseName}_${i}`);
            candidates.push(`${baseName}_${i}.png`);
            candidates.push(`${baseName}_${i.toString().padStart(2, '0')}`);
        }
        const frames: string[] = [];
        for (const n of candidates) {
            const f = atlas.getSpriteFrame(n);
            if (f) frames.push(n);
        }

        if (frames.length >= 2) {
            const handler = () => {
                const idx = (this._iconAnimIndex[index]++) % frames.length;
                const sf = atlas.getSpriteFrame(frames[idx]);
                if (sf && sprite && sprite.isValid) sprite.spriteFrame = sf;
            };
            this._iconAnimHandlers[index] = handler;
            this.unschedule(handler);
            this.schedule(handler, 1 / this._iconAnimFPS);
        } else {
            // 无序列帧，使用轻微呼吸动画增强动态感
            const node = sprite.node;
            tween(node)
                .stop()
                .set({ scale: new Vec3(1, 1, 1) })
                .to(0.8, { scale: new Vec3(1.05, 1.05, 1) })
                .to(0.8, { scale: new Vec3(1, 1, 1) })
                .union()
                .repeatForever()
                .start();
        }
    }

    private stopAllIconAnimations(): void {
        for (let i = 0; i < this._iconAnimHandlers.length; i++) {
            const h = this._iconAnimHandlers[i];
            if (h) {
                this.unschedule(h);
                this._iconAnimHandlers[i] = null;
                this._iconAnimIndex[i] = 0;
            }
        }
        // 停止所有 Monster_* 的呼吸动画
        for (let i = 0; i < 3; i++) {
            const n = this.node.getChildByName(`Monster_${i + 1}`);
            if (n) tween(n).stop();
        }
    }

    private bindAnimationForItem(item: SummonItem, index: number, y: number): void {
        const cfg = this.findPartnerConfig(item.partnerId) || this.findPartnerConfigByName(item.nameAs || '');
        const mount = this.animationContainer || this.node;
        const spineNode = new Node(`MonsterSpine_${index + 1}`);
        const skeleton = spineNode.addComponent(sp.Skeleton);
        spineNode.setPosition(260, y, 0);
        spineNode.setScale(0.6, 0.6);
        mount.addChild(spineNode);

        if (cfg) {
            const key = cfg.spinePath;
            const setData = (data: sp.SkeletonData) => {
                if (!skeleton || !skeleton.isValid) return;
                skeleton.skeletonData = data;
                if (cfg.spineSkinName && cfg.spineSkinName !== '') {
                    skeleton.setSkin(cfg.spineSkinName);
                }
                const anim = (cfg.animationNames && cfg.animationNames[0]) || 'move';
                skeleton.setAnimation(0, anim, true);
            };
            if (this._skeletonCache[key]) {
                setData(this._skeletonCache[key]);
                return;
            }
            this.scheduleOnce(() => {
                resources.load(cfg.spinePath, sp.SkeletonData, (err, data) => {
                    if (err || !data) return;
                    this._skeletonCache[key] = data;
                    setData(data);
                });
            }, index * 0.05);
            return;
        }

        if (item.nameAs) {
            const resPath = `spine/Partner/${item.nameAs}`;
            const skinName = item.nameAs;
            this.scheduleOnce(() => {
                resources.load(resPath, sp.SkeletonData, (err, data) => {
                    if (err || !data) return;
                    if (!skeleton || !skeleton.isValid) return;
                    skeleton.skeletonData = data;
                    try { if (skinName) skeleton.setSkin(skinName); } catch {}
                    try { skeleton.setAnimation(0, 'move', true); } catch {
                        try { skeleton.setAnimation(0, 'stand by', true); } catch {}
                    }
                });
            }, index * 0.05);
        }
    }

    private findPartnerConfig(partnerId: number): PartnerConfig | null {
        const cfg = (partnerConfigs || []).find(c => c && c.id === partnerId);
        return cfg || null;
    }

    private findPartnerConfigByName(nameAs: string): PartnerConfig | null {
        if (!nameAs) return null;
        const cfg = (partnerConfigs || []).find(c => c && c.iconFrameName === nameAs);
        return cfg || null;
    }

    public prefetch(): void {
        this.loadMonsterAtlas();
    }

    private bindMonsterClickHandlers(): void {
        for (let i = 0; i < 3; i++) {
            const n = this.node.getChildByName(`Monster_${i + 1}`);
            if (!n) continue;
            n.off(Node.EventType.TOUCH_END);
            n.on(Node.EventType.TOUCH_END, () => this.onMonsterClicked(i), this);
        }
    }

    private onMonsterClicked(index: number): void {
        const item = this._lastItems[index];
        if (!item) return;
        // 仅清理Spine，不清空列表条目
        this.clearSpineNodes();
        this.hideAllSummonNodes();
        this._selectedSummonId = item.id;
        if (this.orbCountLabel && this.orbCountLabel.isValid) {
            this.orbCountLabel.string = `召唤所需宝珠：${item.partnerSummonOrb}`;
        }
        // 显示对应的 Summon_8 按钮，不创建或播放Spine
        const s = this.findSummonNodeForIndex(index);
        if (s) {
            this._activeSummonNode = s;
            s.active = true;
            if (s.parent) s.setSiblingIndex(s.parent.children.length - 1);
        }
    }

    private bindSummonConfirmHandlers(): void {
        for (let i = 0; i < 3; i++) {
            const s = this.findSummonNodeForIndex(i);
            if (!s) continue;
            s.off(Node.EventType.TOUCH_END);
        }
        const top = this.node.getChildByName('Summon_8');
        if (top) {
            top.off(Node.EventType.TOUCH_END);
        }
    }

    private onSummonConfirmed(index: number): void {
        const item = this._lastItems[index];
        if (!item) return;
        director.emit('GAME_PARTNER_SUMMON_SUCCESS', { index, item });
        const m = this.node.getChildByName(`Monster_${index + 1}`);
        if (m) m.active = false;
        const row = this.node.getChildByName(`MonsterItem_${index + 1}`);
        if (row) row.destroy();
        this.hideAllSummonNodes();
    }

    public hideAllMonsters(): void {
        for (let i = 0; i < 3; i++) {
            const m = this.node.getChildByName(`Monster_${i + 1}`);
            if (m) m.active = false;
        }
        this.hideAllSummonNodes();
    }

    private showSummonSuccessPopup(text: string): void {
        ShowToast(text);
    }

    public getSelectedSummonId(): number | null {
        return this._selectedSummonId;
    }

    public getSelectedSummonCost(): number {
        const id = this._selectedSummonId;
        if (!id && this._lastItems && this._lastItems.length) {
            return this._lastItems[0]?.partnerSummonOrb ?? 0;
        }
        const it = this._lastItems.find(x => x && x.id === id);
        return it ? (it.partnerSummonOrb ?? 0) : 0;
    }

    public getDefaultSummonId(): number | null {
        const first = this._lastItems && this._lastItems[0];
        return first ? first.id : null;
    }

    private hideAllSummonNodes(): void {
        for (let i = 0; i < 3; i++) {
            const m = this.node.getChildByName(`Monster_${i + 1}`);
            if (!m) continue;
            const s = m.getChildByName('Summon_8');
            if (s) s.active = false;
        }
        if (this._activeSummonNode) {
            this._activeSummonNode.active = false;
            this._activeSummonNode = null;
        }
        const top = this.node.getChildByName('Summon_8');
        if (top) top.active = false;
    }

    private findSummonNodeForIndex(index: number): Node | null {
        const m = this.node.getChildByName(`Monster_${index + 1}`);
        if (m) {
            const s = m.getChildByName('Summon_8');
            if (s) return s;
        }
        const alt = this.node.getChildByName(`Summon_8_${index + 1}`);
        if (alt) return alt;
        const single = this.node.getChildByName('Summon_8');
        if (single) return single;
        return null;
    }

    public hideSummonedByItemId(id: number): void {
        const idx = this._lastItems.findIndex(it => it && it.id === id);
        if (idx < 0) return;
        const m = this.node.getChildByName(`Monster_${idx + 1}`);
        if (m) m.active = false;
        const row = this.node.getChildByName(`MonsterItem_${idx + 1}`);
        if (row) row.destroy();
        this.hideAllSummonNodes();
    }
}

interface SummonItem {
    id: number;
    partnerId: number;
    nameAs: string | null;
    partnerName?: string;
    partnerSummonOrb: number;
    isPurchase: number;
}


