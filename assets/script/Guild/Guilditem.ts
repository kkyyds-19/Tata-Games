import { _decorator, Button, Component, Label, Node, Sprite, SpriteFrame, Texture2D, assetManager, director } from 'cc';
import { ShowToast } from '../global/Toast';
import { HttpClient } from '../http/HttpClient';
import { UserInfoData } from '../user/UserInfoData';
const { ccclass, property } = _decorator;

@ccclass('Guilditem')
export class Guilditem extends Component {
    private static _cachedLeaderUserId: string | null = null;
    private static _selfCanKick: boolean | null = null;

    public static setSelfCanKick(v: boolean | null): void {
        this._selfCanKick = v;
    }

    @property({ type: Label })
    public applicantNameLabel: Label | null = null;

    @property({ type: Label })
    public applicantPowerLabel: Label | null = null;

    @property({ type: Sprite })
    public avatarSprite: Sprite | null = null;

    @property({ type: Button })
    public approveButton: Button | null = null;

    @property({ type: Button })
    public rejectButton: Button | null = null;

    @property({ type: Button })
    public leaveGuildButton: Button | null = null;

    @property({ type: Button })
    public kickGuildButton: Button | null = null;

    private _defaultAvatarSpriteFrame: SpriteFrame | null = null;

    private _http: HttpClient | null = null;
    private _isProcessing = false;
    private _isLeaving = false;
    private _isKicking = false;
    private _boundProcessId: string | number | null = null;
    private _boundGuildId: string | number | null = null;
    private _boundTargetUserId: string | number | null = null;
    private _onProcessed: ((status: number) => void) | null = null;

    onLoad(): void {
        this._http = HttpClient.getInstance();
        this.bindWidgetsIfMissing();

        if (this.approveButton) {
            this.approveButton.node.off(Button.EventType.CLICK, this.onApproveClick, this);
            this.approveButton.node.on(Button.EventType.CLICK, this.onApproveClick, this);
        }
        if (this.rejectButton) {
            this.rejectButton.node.off(Button.EventType.CLICK, this.onRejectClick, this);
            this.rejectButton.node.on(Button.EventType.CLICK, this.onRejectClick, this);
        }

        if (this.leaveGuildButton) {
            this.leaveGuildButton.node.off(Button.EventType.CLICK, this.onLeaveGuildClick, this);
            this.leaveGuildButton.node.on(Button.EventType.CLICK, this.onLeaveGuildClick, this);
        }

        if (this.kickGuildButton) {
            this.kickGuildButton.node.off(Button.EventType.CLICK, this.onKickGuildClick, this);
            this.kickGuildButton.node.on(Button.EventType.CLICK, this.onKickGuildClick, this);
        }
    }

    public init(data: any): void {
        const name = this.pickString(data, ['name', 'nickname', 'nickName', 'userName', 'username', 'playerName', 'roleName']) || '';
        const power = this.pickNumberLike(data, ['fightPower', 'combatPower', 'power', 'fp', 'battlePower']);
        if (this.applicantNameLabel) this.applicantNameLabel.string = name;
        if (this.applicantPowerLabel) {
            this.applicantPowerLabel.string = power != null ? String(power) : '';
            this.applicantPowerLabel.node.active = true;
        }

        const icon = this.pickString(data, ['icon', 'avatar', 'avatarUrl', 'head', 'headUrl']);
        this.setAvatarUrl(icon);

        if (this.approveButton) this.approveButton.node.active = true;
        if (this.rejectButton) this.rejectButton.node.active = true;
        if (this.leaveGuildButton) this.leaveGuildButton.node.active = false;
        if (this.kickGuildButton) this.kickGuildButton.node.active = false;

        const idCandidate = this.pickString(data, ['id', 'applyId', 'applicationId']);
        if (idCandidate != null && String(idCandidate).trim() !== '') {
            const n = Number(idCandidate);
            this._boundProcessId = Number.isFinite(n) ? n : String(idCandidate);
        } else {
            this._boundProcessId = null;
        }

        this.node.active = true;
        this.setButtonsInteractable(true);
    }

    public initMember(data: any): void {
        this.bindWidgetsIfMissing();

        const name = this.pickString(data, ['name', 'nickname', 'nickName', 'userName', 'username', 'playerName', 'roleName']) || '';
        if (this.applicantNameLabel) this.applicantNameLabel.string = name;

        const icon = this.pickString(data, ['icon', 'avatar', 'avatarUrl', 'head', 'headUrl']);
        this.setAvatarUrl(icon);

        const power = this.pickNumberLike(data, ['fightPower', 'combatPower', 'power', 'fp', 'battlePower']);
        if (this.applicantPowerLabel) {
            this.applicantPowerLabel.string = power != null ? String(power) : '';
            this.applicantPowerLabel.node.active = true;
        }

        if (this.approveButton) this.approveButton.node.active = false;
        if (this.rejectButton) this.rejectButton.node.active = false;

        const guildIdCandidate = this.pickString(data, ['guildId', 'guild_id', 'gid', 'guildID']);
        if (guildIdCandidate != null && String(guildIdCandidate).trim() !== '') {
            const n = Number(guildIdCandidate);
            this._boundGuildId = Number.isFinite(n) ? n : String(guildIdCandidate);
        }

        const selfId = String(UserInfoData.getInstance().getUserId() ?? '').trim();
        const rowId = this.pickString(data, ['userId', 'uid', 'id']) || '';
        const isSelf = selfId !== '' && rowId !== '' && selfId === rowId;

        this._boundTargetUserId = null;
        if (rowId && rowId.trim() !== '') {
            const n = Number(rowId);
            this._boundTargetUserId = Number.isFinite(n) ? n : rowId;
        }

        this.tryUpdateCachedLeaderIdFromMemberRow(data, rowId);
        const leaderId = Guilditem._cachedLeaderUserId || '';
        const isSelfLeader = selfId !== '' && leaderId !== '' && selfId === leaderId;
        const canKickOthers = Guilditem._selfCanKick != null ? Guilditem._selfCanKick : isSelfLeader;

        if (this.leaveGuildButton) {
            this.leaveGuildButton.node.active = isSelf;
            this.leaveGuildButton.interactable = true;

            this.leaveGuildButton.node.off(Button.EventType.CLICK, this.onLeaveGuildClick, this);
            this.leaveGuildButton.node.on(Button.EventType.CLICK, this.onLeaveGuildClick, this);
        }

        if (this.kickGuildButton) {
            this.kickGuildButton.node.active = canKickOthers && !isSelf;
            this.kickGuildButton.interactable = true;

            this.kickGuildButton.node.off(Button.EventType.CLICK, this.onKickGuildClick, this);
            this.kickGuildButton.node.on(Button.EventType.CLICK, this.onKickGuildClick, this);
        }

        this.node.active = true;
    }

    public setOnProcessed(callback: ((status: number) => void) | null): void {
        this._onProcessed = callback;
    }

    private onApproveClick(): void {
        void this.processApplication(1);
    }

    private onRejectClick(): void {
        void this.processApplication(-1);
    }

    private onLeaveGuildClick(): void {
        void this.leaveGuild();
    }

    private onKickGuildClick(): void {
        void this.kickGuildMember();
    }

    private async leaveGuild(): Promise<void> {
        if (this._isLeaving) return;
        if (!this._http) this._http = HttpClient.getInstance();

        const info = UserInfoData.getInstance().getUserInfo() as any;
        let guildId: string | number | null = null;
        const guildIdRaw = info?.guildId != null ? String(info.guildId).trim() : '';
        if (guildIdRaw && guildIdRaw !== '0' && guildIdRaw.toLowerCase() !== 'null' && guildIdRaw.toLowerCase() !== 'undefined') {
            const gidNum = Number(guildIdRaw);
            guildId = Number.isFinite(gidNum) ? gidNum : guildIdRaw;
        }
        if (guildId == null && this._boundGuildId != null && String(this._boundGuildId).trim() !== '') {
            guildId = this._boundGuildId;
        }
        if (guildId == null) {
            guildId = await this.fetchGuildIdFallback();
        }
        if (guildId == null || String(guildId).trim() === '' || String(guildId).trim() === '0') {
            ShowToast('未加入公会');
            return;
        }

        this._isLeaving = true;
        if (this.leaveGuildButton) this.leaveGuildButton.interactable = false;
        try {
            const res = await this._http.request<any>('/api/guild/leave', {
                method: 'POST',
                body: {
                    guildId
                }
            });

            if (!res.success) {
                ShowToast(res.error || '退出公会失败');
                return;
            }

            const body = res.data as any;
            if (!body || body.code !== 200) {
                if (body?.msg) ShowToast(String(body.msg));
                else ShowToast('退出公会失败');
                return;
            }

            UserInfoData.getInstance().setUserInfo({
                guildId: '',
                guildName: '',
                guildLevel: undefined,
                guildIcon: undefined
            });

            ShowToast('已退出公会');
            try { director.emit('guild-left'); } catch {}
        } catch {
            ShowToast('退出公会失败');
        } finally {
            this._isLeaving = false;
            if (this.leaveGuildButton) this.leaveGuildButton.interactable = true;
        }
    }

    private async kickGuildMember(): Promise<void> {
        if (this._isKicking) return;
        if (!this._http) this._http = HttpClient.getInstance();

        const targetUserId = this._boundTargetUserId;
        if (targetUserId == null || String(targetUserId).trim() === '') {
            ShowToast('踢人失败');
            return;
        }

        const guildId = await this.resolveGuildIdForRequest();
        if (guildId == null || String(guildId).trim() === '' || String(guildId).trim() === '0') {
            ShowToast('未加入公会');
            return;
        }

        this._isKicking = true;
        if (this.kickGuildButton) this.kickGuildButton.interactable = false;
        try {
            const res = await this._http.request<any>('/api/guild/kick', {
                method: 'POST',
                body: {
                    guildId,
                    targetUserId
                }
            });

            if (!res.success) {
                ShowToast(res.error || '踢人失败');
                return;
            }

            const body = res.data as any;
            if (!body || (body.code !== 200 && body.code !== 201)) {
                if (body?.msg) ShowToast(String(body.msg));
                else ShowToast('踢人失败');
                return;
            }

            ShowToast('已踢出公会');
            this.node.active = false;
            try { director.emit('guild-member-kicked', { guildId, targetUserId }); } catch {}
        } catch {
            ShowToast('踢人失败');
        } finally {
            this._isKicking = false;
            if (this.kickGuildButton) this.kickGuildButton.interactable = true;
        }
    }

    private async resolveGuildIdForRequest(): Promise<string | number | null> {
        const info = UserInfoData.getInstance().getUserInfo() as any;
        let guildId: string | number | null = null;
        const guildIdRaw = info?.guildId != null ? String(info.guildId).trim() : '';
        if (guildIdRaw && guildIdRaw !== '0' && guildIdRaw.toLowerCase() !== 'null' && guildIdRaw.toLowerCase() !== 'undefined') {
            const gidNum = Number(guildIdRaw);
            guildId = Number.isFinite(gidNum) ? gidNum : guildIdRaw;
        }
        if (guildId == null && this._boundGuildId != null && String(this._boundGuildId).trim() !== '') {
            guildId = this._boundGuildId;
        }
        if (guildId == null) {
            guildId = await this.fetchGuildIdFallback();
        }
        return guildId;
    }

    private async fetchGuildIdFallback(): Promise<string | number | null> {
        try {
            if (!this._http) this._http = HttpClient.getInstance();

            const my = await this._http.request<any>('/api/guild/my', {
                method: 'GET'
            });
            if (my.success) {
                const body = my.data as any;
                if (body && body.code === 200) {
                    const data = body?.data;
                    const id = this.pickString(data, ['id', 'guildId', 'guild_id', 'gid', 'guildID']);
                    if (id != null && String(id).trim() !== '') {
                        const n = Number(id);
                        return Number.isFinite(n) ? n : String(id);
                    }
                }
            }

            const res = await this._http.request<any>('/api/guild/my/list', {
                method: 'GET',
                body: {
                    name: '',
                    pageNum: 1,
                    pageSize: 1
                }
            });
            if (!res.success) return null;
            const body = res.data as any;
            if (!body || body.code !== 200) return null;

            const data = body?.data;
            const headerGid = this.pickString(data, ['guildId', 'guild_id', 'gid', 'guildID']);
            if (headerGid != null && String(headerGid).trim() !== '') {
                const n = Number(headerGid);
                return Number.isFinite(n) ? n : String(headerGid);
            }

            const list = data?.data;
            if (Array.isArray(list) && list.length > 0) {
                const rowGid = this.pickString(list[0], ['guildId', 'guild_id', 'gid', 'guildID']);
                if (rowGid != null && String(rowGid).trim() !== '') {
                    const n = Number(rowGid);
                    return Number.isFinite(n) ? n : String(rowGid);
                }
            }
            return null;
        } catch {
            return null;
        }
    }

    private async processApplication(status: number): Promise<void> {
        if (this._isProcessing) return;
        if (!this._http) this._http = HttpClient.getInstance();
        if (this._boundProcessId == null || String(this._boundProcessId).trim() === '') {
            ShowToast('处理失败');
            return;
        }

        this._isProcessing = true;
        this.setButtonsInteractable(false);

        try {
            const res = await this._http.request<any>('/api/guild/process', {
                method: 'POST',
                body: {
                    id: this._boundProcessId,
                    status
                }
            });

            if (!res.success) {
                ShowToast(res.error || '处理失败');
                this.setButtonsInteractable(true);
                return;
            }

            const body = res.data as any;
            const outerCode = Number(body?.code);
            const outerMsg = body?.msg != null ? String(body.msg) : '';
            if (outerMsg) ShowToast(outerMsg);

            if (!Number.isFinite(outerCode)) {
                this.setButtonsInteractable(true);
                return;
            }

            if (outerCode !== 200 && outerCode !== 201) {
                this.setButtonsInteractable(true);
                return;
            }

            const inner = body?.data?.data ?? body?.data ?? null;
            const innerCode = Number(inner?.code);
            const innerMsg = inner?.msg != null ? String(inner.msg) : '';
            if (innerMsg) ShowToast(innerMsg);

            const ok = (Number.isFinite(innerCode) && (innerCode === 200 || innerCode === 201)) || outerCode === 200 || outerCode === 201;
            if (!ok) {
                this.setButtonsInteractable(true);
                return;
            }

            this.node.active = false;
            try { this._onProcessed && this._onProcessed(status); } catch {}
            try { director.emit('guild-application-processed', { status, id: this._boundProcessId }); } catch {}
        } catch {
            ShowToast('处理失败');
            this.setButtonsInteractable(true);
        } finally {
            this._isProcessing = false;
        }
    }

    private setButtonsInteractable(v: boolean): void {
        if (this.approveButton) this.approveButton.interactable = v;
        if (this.rejectButton) this.rejectButton.interactable = v;
    }

    private bindWidgetsIfMissing(): void {
        if (!this.applicantNameLabel) {
            const n = this.findDeep(this.node, 'name') || this.findDeep(this.node, 'Name');
            this.applicantNameLabel = n?.getComponent(Label) || null;
        }
        if (!this.applicantPowerLabel) {
            const n = this.findDeep(this.node, 'power') || this.findDeep(this.node, 'pm');
            this.applicantPowerLabel = n?.getComponent(Label) || null;
        }
        if (!this.avatarSprite) {
            const n = this.findDeep(this.node, 'tx');
            this.avatarSprite = n?.getComponent(Sprite) || null;
        }
        if (!this.approveButton) {
            const n = this.findDeep(this.node, 'dnf_26');
            this.approveButton = n?.getComponent(Button) || null;
        }
        if (!this.rejectButton) {
            const n =
                this.findDeep(this.node, 'reject') ||
                this.findDeep(this.node, 'jujue') ||
                this.findDeep(this.node, 'dnf_reject') ||
                this.findDeep(this.node, 'dnf_28');
            this.rejectButton = n?.getComponent(Button) || null;
        }

        if (!this.leaveGuildButton) {
            const n = this.findDeep(this.node, 'likai');
            this.leaveGuildButton = n?.getComponent(Button) || null;
        }

        if (!this.kickGuildButton) {
            const n = this.findDeep(this.node, 'dnf_27');
            this.kickGuildButton = n?.getComponent(Button) || null;
        }

        if (this.avatarSprite && !this._defaultAvatarSpriteFrame) {
            this._defaultAvatarSpriteFrame = this.avatarSprite.spriteFrame;
        }
    }

    private setAvatarUrl(url: string | null): void {
        const sprite = this.avatarSprite;
        if (!sprite) return;

        if (this._defaultAvatarSpriteFrame) {
            sprite.spriteFrame = this._defaultAvatarSpriteFrame;
        }
        
        if (this._defaultAvatarSpriteFrame) {
            sprite.node.active = true;
        } else {
            sprite.node.active = false;
        }

        const u = (url || '').trim();
        if (!u) {
            return;
        }

        assetManager.loadRemote<Texture2D>(u, (err, texture) => {
            if (err || !texture || !sprite.isValid) {
                return;
            }
            const sf = new SpriteFrame();
            sf.texture = texture;
            sprite.spriteFrame = sf;
            sprite.node.active = true;
        });
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

    private pickString(obj: any, keys: string[]): string | null {
        if (!obj) return null;
        for (const k of keys) {
            const v = obj?.[k];
            if (v == null) continue;
            const s = String(v).trim();
            if (s !== '') return s;
        }
        return null;
    }

    private pickNumberLike(obj: any, keys: string[]): number | string | null {
        if (!obj) return null;
        for (const k of keys) {
            const v = obj?.[k];
            if (v == null) continue;
            if (typeof v === 'number') return v;
            const s = String(v).trim();
            if (s === '') continue;
            const n = Number(s);
            return Number.isFinite(n) ? n : s;
        }
        return null;
    }

    private pickBooleanLike(obj: any, keys: string[]): boolean | null {
        if (!obj) return null;
        for (const k of keys) {
            const v = obj?.[k];
            if (v == null) continue;
            if (typeof v === 'boolean') return v;
            if (typeof v === 'number') return v === 1;
            const s = String(v).trim().toLowerCase();
            if (s === 'true' || s === '1') return true;
            if (s === 'false' || s === '0') return false;
        }
        return null;
    }

    private tryUpdateCachedLeaderIdFromMemberRow(data: any, rowId: string): void {
        if (!rowId) return;

        const roleName = this.pickString(data, ['roleName', 'positionName', 'postName', 'dutyName', 'title', 'jobName']);
        if (roleName) {
            const s = roleName.trim();
            if (s.includes('会长') || s.toLowerCase().includes('leader') || s.toLowerCase().includes('president')) {
                Guilditem._cachedLeaderUserId = rowId;
                return;
            }
        }

        const isLeader = this.pickBooleanLike(data, ['isLeader', 'leader', 'isChairman', 'chairman', 'isPresident', 'president']);
        if (isLeader === true) {
            Guilditem._cachedLeaderUserId = rowId;
            return;
        }

        const roleId = this.pickNumberLike(data, ['roleId', 'role_id', 'position', 'post', 'duty', 'job', 'identity', 'rank']);
        if (typeof roleId === 'number') {
            if (roleId === 1) {
                Guilditem._cachedLeaderUserId = rowId;
                return;
            }
        } else if (typeof roleId === 'string') {
            const s = roleId.trim().toLowerCase();
            if (s === 'leader' || s === 'chairman' || s === 'president') {
                Guilditem._cachedLeaderUserId = rowId;
                return;
            }
        }
    }
}
