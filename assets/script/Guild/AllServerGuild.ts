import { _decorator, Button, Component, EditBox, Label, Node, Prefab, ScrollView, Sprite, SpriteAtlas, instantiate, resources } from 'cc';
import { ShowToast } from '../global/Toast';
import { HttpClient } from '../http/HttpClient';
import { UserInfoData } from '../user/UserInfoData';
import { Guildicon, GuildListItemData } from './Guildicon';
const { ccclass, property } = _decorator;

@ccclass('AllServerGuild')
export class AllServerGuild extends Component {
    @property({ type: Label })
    public guildNameLabel: Label | null = null;

    @property({ type: Label })
    public guildLevelLabel: Label | null = null;

    @property({ type: Sprite })
    public guildIconSprite: Sprite | null = null;

    @property({ type: SpriteAtlas })
    public guildIconAtlas: SpriteAtlas | null = null;

    @property({ type: Prefab })
    public guildItemPrefab: Prefab | null = null;

    @property({ type: Node })
    public scrollContent: Node | null = null;

    @property({ type: EditBox })
    public searchEditBox: EditBox | null = null;

    private _scrollView: ScrollView | null = null;
    private _http: HttpClient | null = null;

    private _isRefreshing = false;
    private _pendingRefresh = false;
    private _pageNum = 1;
    private _pageSize = 11;
    private _searchName = '';

    private _searchButton: Button | null = null;

    onLoad() {
        this._http = HttpClient.getInstance();
        this._scrollView = this.getComponentInChildren(ScrollView);
        if (!this.scrollContent) {
            this.scrollContent = this._scrollView?.content || null;
        }

        this.bindSearchWidgets();
        this.refreshSelfGuildInfo();
    }

    onEnable() {
        this.refreshSelfGuildInfo();
        void this.refreshGuildList();
    }

    public show(): void {
        this.node.active = true;
        try {
            const p = this.node.parent;
            if (p) this.node.setSiblingIndex(p.children.length - 1);
        } catch {}
        this.refreshSelfGuildInfo();
        void this.refreshGuildList();
    }

    public hide(): void {
        this.node.active = false;
    }

    public onSearchButtonClick(): void {
        const name = (this.searchEditBox?.string || '').trim();
        this._searchName = name;
        this._pageNum = 1;
        void this.refreshGuildList();
    }

    public setSelfGuildName(name: string): void {
        if (this.guildNameLabel) this.guildNameLabel.string = String(name ?? '');
    }

    public setSelfGuildLevel(level: number | string): void {
        if (this.guildLevelLabel) this.guildLevelLabel.string = String(level ?? '');
    }

    public setSelfGuildIcon(iconId: number | string): void {
        if (!this.guildIconSprite || !this.guildIconAtlas) return;

        const num = typeof iconId === 'number' ? iconId : parseInt(String(iconId || ''), 10);
        const frameName = num >= 1 && num <= 3 ? `CreateGuild_${14 + num}` : 'CreateGuild_15';
        const frame = this.guildIconAtlas.getSpriteFrame(frameName) || this.guildIconAtlas.getSpriteFrame('CreateGuild_15');
        if (frame) this.guildIconSprite.spriteFrame = frame;
    }

    private refreshSelfGuildInfo(): void {
        try {
            const info = UserInfoData.getInstance().getUserInfo() as any;
            if (this.guildNameLabel) this.guildNameLabel.string = String(info?.guildName ?? '');
            if (this.guildLevelLabel) {
                const level = info?.guildLevel != null ? Number(info.guildLevel) : NaN;
                this.guildLevelLabel.string = Number.isFinite(level) && level > 0 ? String(level) : '';
            }
            if (info?.guildIcon != null) this.setSelfGuildIcon(info.guildIcon);
        } catch {}
    }


    private bindSearchWidgets(): void {
        if (!this.searchEditBox) {
            const boxes = this.getComponentsInChildren(EditBox);
            if (boxes && boxes.length > 0) {
                let best = boxes[0];
                for (let i = 1; i < boxes.length; i++) {
                    if (boxes[i].node.position.y > best.node.position.y) best = boxes[i];
                }
                this.searchEditBox = best;
            }
        }

        if (this.searchEditBox) {
            this.searchEditBox.node.off(EditBox.EventType.EDITING_RETURN, this.onSearchButtonClick, this);
            this.searchEditBox.node.on(EditBox.EventType.EDITING_RETURN, this.onSearchButtonClick, this);
        }

        const buttons = this.getComponentsInChildren(Button);
        for (const btn of buttons) {
            const evts = btn.clickEvents || [];
            const matched = evts.some((e: any) => String((e as any)?.handler || '') === 'onSearchButtonClick');
            if (matched) {
                this._searchButton = btn;
                break;
            }
        }

        if (this._searchButton) {
            this._searchButton.node.off(Button.EventType.CLICK, this.onSearchButtonClick, this);
            this._searchButton.node.on(Button.EventType.CLICK, this.onSearchButtonClick, this);
        }
    }

    private async refreshGuildList(): Promise<void> {
        if (this._isRefreshing) {
            this._pendingRefresh = true;
            return;
        }
        this._isRefreshing = true;
        try {
            const list = await this.fetchGuildList();
            await this.renderList(list);
        } finally {
            this._isRefreshing = false;
            if (this._pendingRefresh) {
                this._pendingRefresh = false;
                void this.refreshGuildList();
            }
        }
    }

    private async fetchGuildList(): Promise<GuildListItemData[]> {
        if (!this._http) this._http = HttpClient.getInstance();
        const res = await this._http.request<any>('/api/guild/list', {
            method: 'GET',
            body: {
                name: this._searchName,
                pageNum: this._pageNum,
                pageSize: this._pageSize
            }
        });
        if (!res.success) return [];
        const body = res.data as any;
        if (!body || body.code !== 200) {
            if (body?.msg) ShowToast(String(body.msg));
            return [];
        }
        const list = body?.data?.data;
        if (!Array.isArray(list)) return [];
        return list as GuildListItemData[];
    }

    private async renderList(list: GuildListItemData[]): Promise<void> {
        if (!this.scrollContent) {
            this._scrollView = this._scrollView || this.getComponentInChildren(ScrollView);
            this.scrollContent = this._scrollView?.content || null;
        }
        const content = this.scrollContent;
        if (!content) return;

        const needed = list.length;
        if (needed > content.children.length) {
            const prefab = await this.ensureItemPrefab();
            if (prefab) {
                for (let i = content.children.length; i < needed; i++) {
                    const node = instantiate(prefab);
                    node.setParent(content);
                }
            }
        }

        for (let i = 0; i < content.children.length; i++) {
            const node = content.children[i];
            if (i >= needed) {
                node.active = false;
                continue;
            }
            node.active = true;
            const item = node.getComponent(Guildicon);
            if (item) {
                await item.init(list[i]);
            }
        }
    }

    private ensureItemPrefab(): Promise<Prefab | null> {
        if (this.guildItemPrefab) return Promise.resolve(this.guildItemPrefab);
        return new Promise<Prefab | null>((resolve) => {
            resources.load('prefab/guild/Guild_icon', Prefab, (err, prefab) => {
                if (err || !prefab) {
                    resolve(null);
                    return;
                }
                this.guildItemPrefab = prefab;
                resolve(prefab);
            });
        });
    }

}


