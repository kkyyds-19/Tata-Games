import { _decorator, Component, EditBox, Node, Prefab, ScrollView, director, instantiate, resources } from 'cc';
import { HttpClient } from '../http/HttpClient';
import { ShowToast } from '../global/Toast';
import { UserInfoData } from '../user/UserInfoData';
import { AllServerGuild } from './AllServerGuild';
import { Guildicon, GuildListItemData } from './Guildicon';
import { GuildCreate } from './GuildCreate';
const { ccclass, property } = _decorator;

@ccclass('Guildapplication')
export class Guildapplication extends Component {
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

    private _guildCreate: GuildCreate | null = null;

    private _allServerGuild: AllServerGuild | null = null;

    private _isCheckingMember = false;
    private _pendingMemberCheck = false;

    // 记录上一次检测到的是否为公会成员（null 表示本地尚未初始化，首次用 hasGuild() 兜底）
    private static _lastIsMember: boolean | null = null;

    onLoad() {
        this._http = HttpClient.getInstance();
        this._scrollView = this.getComponentInChildren(ScrollView);
        if (!this.scrollContent) {
            this.scrollContent = this._scrollView?.content || null;
        }

        if (!this.searchEditBox) {
            this.searchEditBox = this.getComponentInChildren(EditBox);
        }
        if (this.searchEditBox) {
            this.searchEditBox.node.off(EditBox.EventType.EDITING_RETURN, this.onSearchButtonClick, this);
            this.searchEditBox.node.on(EditBox.EventType.EDITING_RETURN, this.onSearchButtonClick, this);
        }
    }

    onEnable() {
        void this.ensureMemberAndRoute();
    }

    public show() {
        this.node.active = false;
        void this.ensureMemberAndRoute();
    }

    public hide() {
        this.node.active = false;
    }

    public onCreateGuildButtonClick(): void {
        void this.openGuildCreate();
    }

    public onSearchButtonClick(): void {
        const name = (this.searchEditBox?.string || '').trim();
        this._searchName = name;
        this._pageNum = 1;
        void this.refreshGuildList();
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

    private async ensureMemberAndRoute(): Promise<void> {
        if (this._isCheckingMember) {
            this._pendingMemberCheck = true;
            return;
        }

        this._isCheckingMember = true;
        try {
            const isMember = await this.fetchIsMember();

            // 初始化上一次的成员状态
            let wasMember = Guildapplication._lastIsMember;
            if (wasMember === null) {
                wasMember = this.hasGuild();
            }

            Guildapplication._lastIsMember = isMember;

            // 从非成员 -> 成员：提示加入成功
            if (isMember) {
                if (!wasMember) {
                    ShowToast('加入公会成功');
                }
                this.node.active = false;
                await this.openAllServerGuild();
                return;
            }

            // 从成员 -> 非成员：可能是主动退出或被踢出，统一给出提示
            if (!isMember && wasMember) {
                ShowToast('你已不在任何公会中');
            }

            this.node.active = true;
            await this.refreshGuildList();
        } finally {
            this._isCheckingMember = false;
            if (this._pendingMemberCheck) {
                this._pendingMemberCheck = false;
                void this.ensureMemberAndRoute();
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

    private async openGuildCreate(): Promise<void> {
        try {
            if (this._guildCreate?.node?.isValid) {
                this._guildCreate.show?.();
                try {
                    const p = this._guildCreate.node.parent;
                    if (p) this._guildCreate.node.setSiblingIndex(p.children.length - 1);
                } catch {}
                return;
            }

            const scene = director.getScene();
            if (scene) {
                const list = scene.getComponentsInChildren(GuildCreate);
                if (list && list.length > 0) {
                    this._guildCreate = list[0];
                    this._guildCreate.show?.();
                    try {
                        const p = this._guildCreate.node.parent;
                        if (p) this._guildCreate.node.setSiblingIndex(p.children.length - 1);
                    } catch {}
                    return;
                }
            }

            const prefab = await new Promise<Prefab | null>((resolve) => {
                resources.load('prefab/guild/Guild_Create', Prefab, (err, p) => {
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
            this._guildCreate = node.getComponent(GuildCreate) || node.addComponent(GuildCreate);
            this._guildCreate.show?.();
            try {
                const p = node.parent;
                if (p) node.setSiblingIndex(p.children.length - 1);
            } catch {}
        } catch {}
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
