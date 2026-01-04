import { _decorator, Button, Component, EditBox, Label, Layout, Node, Prefab, ScrollView, Sprite, SpriteAtlas, director, instantiate, resources } from 'cc';
import { ShowToast } from '../global/Toast';
import { HttpClient } from '../http/HttpClient';
import { UserInfoData } from '../user/UserInfoData';
import { Guildicon, GuildListItemData } from './Guildicon';
import { Guilditem } from './Guilditem';
import { Guildapplication } from './Guildapplication';
import { Guildmain } from './Guildmain';
const { ccclass, property } = _decorator;

@ccclass('AllServerGuild')
export class AllServerGuild extends Component {
    @property({ type: Node })
    public allServerGuild13Layer: Node | null = null;

    @property({ type: Node })
    public allServerGuild13LayerAllServer: Node | null = null;

    @property({ type: Node })
    public allServerGuild13LayerLog: Node | null = null;

    @property({ type: Node })
    public allServerGuild13LayerTeam: Node | null = null;

    @property({ type: Prefab })
    public memberItemPrefab: Prefab | null = null;

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

    @property({ type: Button })
    public manageButton: Button | null = null;

    private _scrollView: ScrollView | null = null;
    private _http: HttpClient | null = null;

    private _isRefreshing = false;
    private _pendingRefresh = false;
    private _pageNum = 1;
    private _pageSize = 11;
    private _searchName = '';

    private _viewMode: 'guild' | 'member' | 'log' = 'guild';

    private _isRefreshingMember = false;
    private _pendingRefreshMember = false;
    private _memberPageNum = 1;
    private _memberPageSize = 11;

    private _searchButton: Button | null = null;

    private _guildMain: Guildmain | null = null;

    private _guildApplication: Guildapplication | null = null;
    private _isCheckingMember = false;
    private _pendingMemberCheck = false;

    private _onGuildLeft = () => {
        this.node.active = false;
        void this.openGuildApplication();
    };

    onLoad() {
        this._http = HttpClient.getInstance();
        this._scrollView = this.getComponentInChildren(ScrollView);
        if (!this.scrollContent) {
            this.scrollContent = this._scrollView?.content || null;
        }

        this.bindSearchWidgets();
        this.bindManageWidget();
        this.refreshSelfGuildInfo();
        void this.refreshSelfGuildInfoFromServer();

        director.off('guild-left', this._onGuildLeft, this);
        director.on('guild-left', this._onGuildLeft, this);
    }

    onDestroy(): void {
        director.off('guild-left', this._onGuildLeft, this);
    }

    onEnable() {
        void this.ensureMemberOrRedirect();
    }

    public show(): void {
        this.node.active = true;
        try {
            const p = this.node.parent;
            if (p) this.node.setSiblingIndex(p.children.length - 1);
        } catch {}
        void this.ensureMemberOrRedirect();
    }

    public hide(): void {
        this.node.active = false;
    }

    public onManageButtonClick(): void {
        void this.openGuildMain();
    }

    public onAllServerButtonClick(): void {
        this.openAllServerGuild13Layer('guild');
        this.switchViewMode('guild');
        this._pageNum = 1;
        void this.refreshGuildList();
    }

    public onLogButtonClick(): void {
        this.openAllServerGuild13Layer('log');
        this.switchViewMode('log');
    }

    public onTeamButtonClick(): void {
        this.openAllServerGuild13Layer('member');
        this.switchViewMode('member');
        this._memberPageNum = 1;
        void this.refreshSelfGuildInfoFromServer();
        void this.refreshMemberList();
    }

    private bindManageWidget(): void {
        try {
            if (!this.manageButton) {
                const buttons = this.getComponentsInChildren(Button) || [];
                for (const btn of buttons) {
                    const evts = btn.clickEvents || [];
                    const matched = evts.some((e: any) => String((e as any)?.handler || '') === 'onManageButtonClick');
                    if (matched) {
                        this.manageButton = btn;
                        break;
                    }
                }
                if (!this.manageButton) {
                    const guanli = this.node.getChildByName('guanli');
                    const btn = guanli?.getComponent(Button) || null;
                    if (btn) this.manageButton = btn;
                }
            }
            if (this.manageButton) {
                this.manageButton.node.off(Button.EventType.CLICK, this.onManageButtonClick, this);
                this.manageButton.node.on(Button.EventType.CLICK, this.onManageButtonClick, this);
            }
        } catch {}
    }


    private async openGuildMain(): Promise<void> {
        try {
            if (this._guildMain?.node?.isValid) {
                this._guildMain.show?.();
                try {
                    const p = this._guildMain.node.parent;
                    if (p) this._guildMain.node.setSiblingIndex(p.children.length - 1);
                } catch {}
                return;
            }

            const scene = director.getScene();
            if (scene) {
                const list = scene.getComponentsInChildren(Guildmain);
                if (list && list.length > 0) {
                    this._guildMain = list[0];
                    this._guildMain.show?.();
                    try {
                        const p = this._guildMain.node.parent;
                        if (p) this._guildMain.node.setSiblingIndex(p.children.length - 1);
                    } catch {}
                    return;
                }
            }

            const prefab = await new Promise<Prefab | null>((resolve) => {
                resources.load('prefab/guild/Guild_main', Prefab, (err, p) => {
                    if (err || !p) {
                        try { console.error('[AllServerGuild] 加载 Guild_main 失败', err); } catch {}
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
            try { node.setPosition(0, 0, 0); } catch {}
            this._guildMain = node.getComponent(Guildmain) || node.addComponent(Guildmain);
            this._guildMain.show?.();
            try {
                const p = node.parent;
                if (p) node.setSiblingIndex(p.children.length - 1);
            } catch {}
        } catch (e) {
            try { console.error('[AllServerGuild] 打开公会管理页面失败', e); } catch {}
        }
    }

    public onSearchButtonClick(): void {
        const name = (this.searchEditBox?.string || '').trim();
        this._searchName = name;
        this._pageNum = 1;
        void this.refreshGuildList();
    }

    private getLayerByMode(mode: 'guild' | 'member' | 'log'): Node | null {
        if (mode === 'guild') return this.allServerGuild13LayerAllServer || this.allServerGuild13Layer;
        if (mode === 'member') return this.allServerGuild13LayerTeam || this.allServerGuild13Layer;
        return this.allServerGuild13LayerLog || this.allServerGuild13Layer;
    }

    private openAllServerGuild13Layer(mode: 'guild' | 'member' | 'log'): void {
        const layer = this.getLayerByMode(mode);
        if (this.allServerGuild13LayerAllServer && this.allServerGuild13LayerAllServer !== layer) this.allServerGuild13LayerAllServer.active = false;
        if (this.allServerGuild13LayerLog && this.allServerGuild13LayerLog !== layer) this.allServerGuild13LayerLog.active = false;
        if (this.allServerGuild13LayerTeam && this.allServerGuild13LayerTeam !== layer) this.allServerGuild13LayerTeam.active = false;
        if (this.allServerGuild13Layer && this.allServerGuild13Layer !== layer) this.allServerGuild13Layer.active = false;

        if (!layer || !layer.isValid) return;
        layer.active = true;
    }

    private switchViewMode(mode: 'guild' | 'member' | 'log'): void {
        if (this._viewMode === mode) return;
        this._viewMode = mode;
        try {
            const listRoot = this.resolveListRoot(mode);
            listRoot?.destroyAllChildren();
        } catch {}
    }

    public setSelfGuildName(name: string): void {
        if (this.guildNameLabel) this.guildNameLabel.string = String(name ?? '');
    }

    public setSelfGuildLevel(level: number | string): void {
        if (this.guildLevelLabel) this.guildLevelLabel.string = this.formatGuildLevel(level);
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
                this.guildLevelLabel.string = this.formatGuildLevel(level);
            }
            if (info?.guildIcon != null) this.setSelfGuildIcon(info.guildIcon);
        } catch {}
    }

    private async refreshSelfGuildInfoFromServer(): Promise<void> {
        if (!this._http) this._http = HttpClient.getInstance();
        try {
            const res = await this._http.request<any>('/api/guild/my', {
                method: 'GET'
            });
            if (!res.success) return;

            const body = res.data as any;
            if (!body || body.code !== 200) return;

            const data = body?.data?.data ?? body?.data;
            this.applySelfGuildInfoFromAny(data);
        } catch {}
    }

    private formatGuildLevel(level: number | string): string {
        const n = typeof level === 'number' ? level : Number(String(level ?? '').trim());
        if (!Number.isFinite(n) || n <= 0) return '';
        const v = Math.floor(n);
        return `${v}级`;
    }

    private applySelfGuildInfoFromAny(v: any): void {
        if (!v || typeof v !== 'object') return;

        const name = this.pickString(v, ['guildName', 'guild_name', 'name']);
        const level = this.pickNumberLike(v, ['guildLevel', 'guild_level', 'level']);
        const icon = this.pickNumberLike(v, ['guildIcon', 'guild_icon', 'icon']);
        const id = this.pickString(v, ['guildId', 'guild_id', 'gid', 'id']);

        if (name != null && name.trim() !== '') {
            this.setSelfGuildName(name);
            UserInfoData.getInstance().setUserInfo({ guildName: name });
        }
        if (level != null) {
            const n = typeof level === 'number' ? level : Number(String(level).trim());
            if (Number.isFinite(n) && n > 0) {
                this.setSelfGuildLevel(n);
                UserInfoData.getInstance().setUserInfo({ guildLevel: Math.floor(n) });
            }
        }
        if (icon != null) {
            const n = typeof icon === 'number' ? icon : Number(String(icon).trim());
            if (Number.isFinite(n) && n > 0) {
                this.setSelfGuildIcon(n);
                UserInfoData.getInstance().setUserInfo({ guildIcon: n });
            }
        }
        if (id != null && id.trim() !== '' && id.trim() !== '0') {
            UserInfoData.getInstance().setUserInfo({ guildId: id });
        }
    }

    private pickString(obj: any, keys: string[]): string | null {
        if (!obj) return null;
        for (const k of keys) {
            const val = obj?.[k];
            if (val == null) continue;
            const s = String(val).trim();
            if (s !== '') return s;
        }
        return null;
    }

    private pickNumberLike(obj: any, keys: string[]): number | string | null {
        if (!obj) return null;
        for (const k of keys) {
            const val = obj?.[k];
            if (val == null) continue;
            if (typeof val === 'number') return val;
            const s = String(val).trim();
            if (s === '') continue;
            const n = Number(s);
            return Number.isFinite(n) ? n : s;
        }
        return null;
    }

    private hasGuild(): boolean {
        try {
            const info = UserInfoData.getInstance().getUserInfo() as any;
            const idRaw = info?.guildId != null ? String(info.guildId).trim() : '';
            if (idRaw.length > 0 && idRaw !== '0' && idRaw.toLowerCase() !== 'null' && idRaw.toLowerCase() !== 'undefined') {
                return true;
            }
            const name = info?.guildName != null ? String(info.guildName).trim() : '';
            if (name.length > 0) return true;
            return false;
        } catch {
            return false;
        }
    }

    private parseIsMemberValue(v: any): boolean | null {
        if (typeof v === 'number') return v === 1;
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') {
            const s = v.trim().toLowerCase();
            if (s === 'true') return true;
            if (s === 'false') return false;
            const n = Number(s);
            if (Number.isFinite(n)) return n === 1;
            return null;
        }
        if (v && typeof v === 'object') {
            const obj = v as any;
            if (obj.isMember != null) return this.parseIsMemberValue(obj.isMember);
            if (obj.member != null) return this.parseIsMemberValue(obj.member);
            if (obj.value != null) return this.parseIsMemberValue(obj.value);
        }
        return null;
    }

    private async ensureMemberOrRedirect(): Promise<void> {
        if (this._isCheckingMember) {
            this._pendingMemberCheck = true;
            return;
        }

        this._isCheckingMember = true;
        try {
            const isMember = await this.fetchIsMember();
            if (!isMember) {
                this.node.active = false;
                await this.openGuildApplication();
                return;
            }

            this.node.active = true;
            this.refreshSelfGuildInfo();
            await this.refreshSelfGuildInfoFromServer();
            await this.refreshGuildList();
        } finally {
            this._isCheckingMember = false;
            if (this._pendingMemberCheck) {
                this._pendingMemberCheck = false;
                void this.ensureMemberOrRedirect();
            }
        }
    }

    private async fetchIsMember(): Promise<boolean> {
        if (!this._http) this._http = HttpClient.getInstance();
        try {
            const res = await this._http.request<any>('/api/guild/isMember', {
                method: 'GET'
            });

            if (!res.success) return this.hasGuild();

            const body = res.data as any;
            if (!body || body.code !== 200) {
                if (body?.msg) ShowToast(String(body.msg));
                return this.hasGuild();
            }

            const raw = body?.data?.data ?? body?.data;
            const parsed = this.parseIsMemberValue(raw);
            if (parsed != null) return parsed;
            return this.hasGuild();
        } catch {
            return this.hasGuild();
        }
    }

    private async openGuildApplication(): Promise<void> {
        try {
            if (this._guildApplication?.node?.isValid) {
                this._guildApplication.show?.();
                try {
                    const p = this._guildApplication.node.parent;
                    if (p) this._guildApplication.node.setSiblingIndex(p.children.length - 1);
                } catch {}
                return;
            }

            const scene = director.getScene();
            if (scene) {
                const list = scene.getComponentsInChildren(Guildapplication);
                if (list && list.length > 0) {
                    this._guildApplication = list[0];
                    this._guildApplication.show?.();
                    try {
                        const p = this._guildApplication.node.parent;
                        if (p) this._guildApplication.node.setSiblingIndex(p.children.length - 1);
                    } catch {}
                    return;
                }
            }

            const prefab = await new Promise<Prefab | null>((resolve) => {
                resources.load('prefab/guild/Guild_Application', Prefab, (err, p) => {
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
            try { node.setPosition(0, 0, 0); } catch {}
            this._guildApplication = node.getComponent(Guildapplication) || node.addComponent(Guildapplication);
            this._guildApplication.show?.();
            try {
                const p = node.parent;
                if (p) node.setSiblingIndex(p.children.length - 1);
            } catch {}
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

    private resolveListRoot(mode: 'guild' | 'member' | 'log' = this._viewMode): Node | null {
        const preferredRoot = this.getLayerByMode(mode);
        const preferredValidRoot = preferredRoot && preferredRoot.isValid ? preferredRoot : null;

        let sv: ScrollView | null = null;
        if (preferredValidRoot) {
            sv = preferredValidRoot.getComponentInChildren(ScrollView);
        }
        if (!sv) sv = this._scrollView || this.getComponentInChildren(ScrollView);

        const content = sv?.content || null;
        if (!content) return null;

        this._scrollView = sv;

        const layoutName = mode === 'guild' ? 'Layout1' : mode === 'member' ? 'Layout2' : '';
        let container: Node | null = null;
        if (layoutName) container = content.getChildByName(layoutName);

        if (!container) {
            const candidates = content.children.filter((n) => !!n.getComponent(Layout));
            if (candidates.length > 0) {
                if (mode === 'member' && candidates.length >= 2) {
                    container = candidates[candidates.length - 1];
                } else {
                    container = candidates[0];
                }
            }
        }

        this.scrollContent = container || content;
        return this.scrollContent;
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
        const content = this.resolveListRoot('guild');
        if (!content) return;

        const canApply = !this.hasGuild();

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
                await item.init(list[i], { canApply });
            }
        }
    }

    private async refreshMemberList(): Promise<void> {
        if (this._isRefreshingMember) {
            this._pendingRefreshMember = true;
            return;
        }
        this._isRefreshingMember = true;
        try {
            const list = await this.fetchGuildMemberList();
            await this.renderMemberList(list);
        } finally {
            this._isRefreshingMember = false;
            if (this._pendingRefreshMember) {
                this._pendingRefreshMember = false;
                void this.refreshMemberList();
            }
        }
    }

    private async fetchGuildMemberList(): Promise<any[]> {
        if (!this._http) this._http = HttpClient.getInstance();
        const res = await this._http.request<any>('/api/guild/my/list', {
            method: 'GET',
            body: {
                name: '',
                pageNum: this._memberPageNum,
                pageSize: this._memberPageSize
            }
        });
        if (!res.success) return [];
        const body = res.data as any;
        if (!body || body.code !== 200) {
            if (body?.msg) ShowToast(String(body.msg));
            return [];
        }
        const container = body?.data;
        this.applySelfGuildInfoFromAny(container);

        const list = container?.data;
        if (!Array.isArray(list)) return [];

        if (list.length > 0) {
            this.applySelfGuildInfoFromAny(list[0]);
        }
        return list as any[];
    }

    private async renderMemberList(list: any[]): Promise<void> {
        const content = this.resolveListRoot('member');
        if (!content) return;

        const needed = list.length;
        if (needed > content.children.length) {
            const prefab = await this.ensureMemberItemPrefab();
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
            const item = node.getComponent(Guilditem);
            if (item) {
                (item as any).initMember?.(list[i]);
            } else {
                const comp = node.addComponent(Guilditem);
                (comp as any).initMember?.(list[i]);
            }
        }
    }

    private ensureMemberItemPrefab(): Promise<Prefab | null> {
        if (this.memberItemPrefab) return Promise.resolve(this.memberItemPrefab);
        return new Promise<Prefab | null>((resolve) => {
            resources.load('prefab/guild/Guild_item', Prefab, (err, prefab) => {
                if (err || !prefab) {
                    resolve(null);
                    return;
                }
                this.memberItemPrefab = prefab;
                resolve(prefab);
            });
        });
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


