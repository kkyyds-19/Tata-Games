import { _decorator, BlockInputEvents, Component, EditBox, Node, Prefab, Sprite, SpriteAtlas, UITransform, director, instantiate, resources } from 'cc';
import { ShowToast } from '../global/Toast';
import { HttpClient } from '../http/HttpClient';
import { UserInfoData } from '../user/UserInfoData';
import { AllServerGuild } from './AllServerGuild';
const { ccclass, property } = _decorator;

@ccclass('GuildCreate')
export class GuildCreate extends Component {
    @property({ type: Node })
    public spriteFrame: Node | null = null;

    @property({ type: Node })
    public CreateGuild_bg: Node | null = null;

    @property({ type: Node })
    public icon1Node: Node | null = null;

    @property({ type: Node })
    public icon2Node: Node | null = null;

    @property({ type: Node })
    public icon3Node: Node | null = null;

    @property({ type: Node })
    public iconChoose1: Node | null = null;

    @property({ type: Node })
    public iconChoose2: Node | null = null;

    @property({ type: Node })
    public iconChoose3: Node | null = null;

    @property({ type: EditBox })
    public nameEditBox: EditBox | null = null;

    @property({ type: EditBox })
    public announcementEditBox: EditBox | null = null;

    @property({ type: Node })
    public previewIconNode: Node | null = null;

    @property({ type: SpriteAtlas })
    public createGuildAtlas: SpriteAtlas | null = null;

    private _selectedIcon = 1;
    private _http: HttpClient | null = null;
    private _previewSprite: Sprite | null = null;
    private _loadedAtlas: SpriteAtlas | null = null;
    private _atlasLoading: Promise<SpriteAtlas | null> | null = null;

    private _allServerGuild: AllServerGuild | null = null;

    private _onIcon1TouchEnd = (event?: any) => {
        try { event?.stopPropagation && event.stopPropagation(); } catch {}
        this.setSelectedIcon(1);
    };

    private _onIcon2TouchEnd = (event?: any) => {
        try { event?.stopPropagation && event.stopPropagation(); } catch {}
        this.setSelectedIcon(2);
    };

    private _onIcon3TouchEnd = (event?: any) => {
        try { event?.stopPropagation && event.stopPropagation(); } catch {}
        this.setSelectedIcon(3);
    };

    private _onRootTouchStart = (event: any) => {
        try {
            const bg = this.CreateGuild_bg;
            if (bg) {
                let t: Node | null = event?.target || null;
                while (t) {
                    if (t === bg) return;
                    t = t.parent;
                }
            }
        } catch {}
        try { event?.stopPropagation && event.stopPropagation(); } catch {}
        this.hide();
    };

    onLoad(): void {
        try {
            const canvas = director.getScene()?.getChildByName('Canvas');
            if (canvas) this.node.parent = canvas;
        } catch {}

        if (!this.spriteFrame) {
            this.spriteFrame = this.findDeep(this.node, 'spriteFrame');
        }
        if (!this.CreateGuild_bg) {
            this.CreateGuild_bg = this.findDeep(this.node, 'CreateGuild_bg');
        }

        this.initIconNodes();
        this.initInputBoxes();
        this.initPreviewNode();
        this.setSelectedIcon(this._selectedIcon);

        this.node.off(Node.EventType.TOUCH_START, this._onRootTouchStart, this, true);
        this.node.on(Node.EventType.TOUCH_START, this._onRootTouchStart, this, true);

        const stop = (event: any) => { try { event?.stopPropagation && event.stopPropagation(); } catch {} };

        if (this.CreateGuild_bg) {
            try {
                if (!this.CreateGuild_bg.getComponent(BlockInputEvents)) this.CreateGuild_bg.addComponent(BlockInputEvents);
            } catch {}
            this.CreateGuild_bg.off(Node.EventType.TOUCH_START, stop, this);
            this.CreateGuild_bg.off(Node.EventType.TOUCH_END, stop, this);
            this.CreateGuild_bg.on(Node.EventType.TOUCH_START, stop, this);
            this.CreateGuild_bg.on(Node.EventType.TOUCH_END, stop, this);
        }

        if (this.spriteFrame) {
            try {
                if (!this.spriteFrame.getComponent(BlockInputEvents)) this.spriteFrame.addComponent(BlockInputEvents);
            } catch {}
            const onMaskTouchStart = (event?: any) => {
                stop(event);
                this.hide();
            };
            this.spriteFrame.off(Node.EventType.TOUCH_START, onMaskTouchStart, this);
            this.spriteFrame.on(Node.EventType.TOUCH_START, onMaskTouchStart, this);
        }
    }

    public show(): void {
        this.node.active = true;
        try {
            const p = this.node.parent;
            if (p) this.node.setSiblingIndex(p.children.length - 1);
        } catch {}
    }

    public hide(): void {
        this.node.active = false;
    }

    public onSelectIcon1(): void {
        this.setSelectedIcon(1);
    }

    public onSelectIcon2(): void {
        this.setSelectedIcon(2);
    }

    public onSelectIcon3(): void {
        this.setSelectedIcon(3);
    }

    public async onCreateGuildButtonClick(): Promise<void> {
        const name = (this.nameEditBox?.string || '').trim();
        if (!name) {
            ShowToast('请输入公会名称');
            return;
        }

        let announcement = (this.announcementEditBox?.string || '').trim();
        if (!announcement) announcement = '大家一起玩';

        if (!this._http) this._http = HttpClient.getInstance();
        const res = await this._http.request<any>('/api/guild/create', {
            method: 'POST',
            body: {
                icon: String(this._selectedIcon),
                name,
                announcement
            }
        });

        if (!res.success) {
            ShowToast(res.error || '创建失败');
            return;
        }

        const body = res.data as any;
        if (!body || body.code !== 200) {
            if (body?.msg) ShowToast(String(body.msg));
            else ShowToast('创建失败');
            return;
        }

        try {
            const data = (body as any)?.data?.data ?? (body as any)?.data ?? {};
            const guildId = data?.id ?? data?.guildId ?? data?.guild_id;
            const guildLevel = Math.max(1, Number(data?.level ?? 1));
            UserInfoData.getInstance().setUserInfo({
                guildId: guildId != null ? String(guildId) : '',
                guildName: name,
                guildLevel,
                guildIcon: this._selectedIcon
            });
        } catch {}

        ShowToast('创建成功');
        await this.openAllServerGuild();
        this.hide();
    }

    private async openAllServerGuild(): Promise<void> {
        try {
            if (this._allServerGuild?.node?.isValid) {
                this._allServerGuild.show?.();
                try {
                    const p = this._allServerGuild.node.parent;
                    if (p) this._allServerGuild.node.setSiblingIndex(p.children.length - 1);
                } catch {}
                return;
            }

            const scene = director.getScene();
            if (scene) {
                const list = scene.getComponentsInChildren(AllServerGuild);
                if (list && list.length > 0) {
                    this._allServerGuild = list[0];
                    this._allServerGuild.show?.();
                    try {
                        const p = this._allServerGuild.node.parent;
                        if (p) this._allServerGuild.node.setSiblingIndex(p.children.length - 1);
                    } catch {}
                    return;
                }
            }

            const prefab = await new Promise<Prefab | null>((resolve) => {
                resources.load('prefab/guild/All_ServerGuild', Prefab, (err, p) => {
                    if (err || !p) {
                        resolve(null);
                        return;
                    }
                    resolve(p);
                });
            });
            if (!prefab) return;

            const node = instantiate(prefab);
            const canvas = director.getScene()?.getChildByName('Canvas');
            const parent = canvas || this.node.parent || this.node;
            parent.addChild(node);
            this._allServerGuild = node.getComponent(AllServerGuild) || node.addComponent(AllServerGuild);
            this._allServerGuild.show?.();
            try {
                const p = node.parent;
                if (p) node.setSiblingIndex(p.children.length - 1);
            } catch {}
        } catch {}
    }

    private initInputBoxes(): void {
        if (!this.nameEditBox) {
            const nameRoot = this.findDeep(this.node, 'CreateGuild_3');
            this.nameEditBox = nameRoot?.getComponentInChildren(EditBox) || null;
        }

        if (!this.announcementEditBox) {
            const annRoot = this.findDeep(this.node, 'CreateGuild_10');
            this.announcementEditBox = annRoot?.getComponentInChildren(EditBox) || null;
        }
    }

    private initIconNodes(): void {
        if (!this.icon1Node) this.icon1Node = this.findDeep(this.node, 'tubiao1');
        if (!this.icon2Node) this.icon2Node = this.findDeep(this.node, 'tubiao2');
        if (!this.icon3Node) this.icon3Node = this.findDeep(this.node, 'tubiao3');

        if (!this.iconChoose1) this.iconChoose1 = this.findDeep(this.icon1Node, 'choose');
        if (!this.iconChoose2) this.iconChoose2 = this.findDeep(this.icon2Node, 'choose');
        if (!this.iconChoose3) this.iconChoose3 = this.findDeep(this.icon3Node, 'choose');

        if (this.icon1Node) {
            this.icon1Node.off(Node.EventType.TOUCH_END, this._onIcon1TouchEnd, this);
            this.icon1Node.on(Node.EventType.TOUCH_END, this._onIcon1TouchEnd, this);
        }
        if (this.icon2Node) {
            this.icon2Node.off(Node.EventType.TOUCH_END, this._onIcon2TouchEnd, this);
            this.icon2Node.on(Node.EventType.TOUCH_END, this._onIcon2TouchEnd, this);
        }
        if (this.icon3Node) {
            this.icon3Node.off(Node.EventType.TOUCH_END, this._onIcon3TouchEnd, this);
            this.icon3Node.on(Node.EventType.TOUCH_END, this._onIcon3TouchEnd, this);
        }
    }

    private setSelectedIcon(iconId: number): void {
        const v = iconId >= 1 && iconId <= 3 ? iconId : 1;
        this._selectedIcon = v;
        if (this.iconChoose1) this.iconChoose1.active = v === 1;
        if (this.iconChoose2) this.iconChoose2.active = v === 2;
        if (this.iconChoose3) this.iconChoose3.active = v === 3;
        void this.updatePreviewIcon();
    }

    private initPreviewNode(): void {
        if (!this.previewIconNode) {
            this.previewIconNode = this.findDeep(this.node, 'CreateGuild_15');
        }
        if (!this._previewSprite && this.previewIconNode) {
            this._previewSprite = this.previewIconNode.getComponent(Sprite);
        }
        try {
            const ui = this.previewIconNode?.getComponent(UITransform);
            ui?.setContentSize(206, 230);
        } catch {}
    }

    private async updatePreviewIcon(): Promise<void> {
        if (!this.previewIconNode || !this._previewSprite) return;
        try {
            const ui = this.previewIconNode.getComponent(UITransform);
            ui?.setContentSize(206, 230);
        } catch {}

        const frameName = `CreateGuild_${14 + this._selectedIcon}`;
        const atlas = await this.getCreateGuildAtlas();
        if (!atlas) return;

        const frame = atlas.getSpriteFrame(frameName) || atlas.getSpriteFrame('CreateGuild_15');
        if (frame) this._previewSprite.spriteFrame = frame;
    }

    private getCreateGuildAtlas(): Promise<SpriteAtlas | null> {
        if (this.createGuildAtlas) return Promise.resolve(this.createGuildAtlas);
        if (this._loadedAtlas) return Promise.resolve(this._loadedAtlas);
        if (this._atlasLoading) return this._atlasLoading;

        this._atlasLoading = new Promise<SpriteAtlas | null>((resolve) => {
            resources.load('img/hall/CreateGuild', SpriteAtlas, (err, atlas) => {
                if (err || !atlas) {
                    resolve(null);
                    return;
                }
                this._loadedAtlas = atlas;
                resolve(atlas);
            });
        }).finally(() => {
            this._atlasLoading = null;
        });

        return this._atlasLoading;
    }

    private findDeep(root: Node | null, name: string): Node | null {
        if (!root) return null;
        if (root.name === name) return root;
        const children = root.children || [];
        for (let i = 0; i < children.length; i++) {
            const r = this.findDeep(children[i], name);
            if (r) return r;
        }
        return null;
    }
}


