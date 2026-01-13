import { _decorator, Button, Component, Label, Node, Sprite, SpriteAtlas } from 'cc';
import { userAPI } from '../api/UserAPI';
import { ShowToast } from '../global/Toast';
import { HttpClient } from '../http/HttpClient';
const { ccclass, property } = _decorator;

export interface GuildListItemData {
    id: number;
    uid: string;
    icon: number | string;
    name: string;
    level: number;
    currentMembers: number;
    leaderId?: number | string;
}

@ccclass('Guildicon')
export class Guildicon extends Component {
    private static _userNameMap = new Map<string, string>();
    private static _userListPromise: Promise<void> | null = null;

    @property({ type: Sprite })
    public iconSprite: Sprite | null = null;

    @property({ type: SpriteAtlas })
    public iconAtlas: SpriteAtlas | null = null;

    private labelCreatorName: Label | null = null;
    private labelGuildLevel: Label | null = null;
    private labelGuildName: Label | null = null;
    private labelMembers: Label | null = null;
    private _boundUid: string | null = null;
    private _boundGuildId: number | null = null;

    private _applyButton: Button | null = null;
    private _applyLabel: Label | null = null;
    private _isApplying = false;
    private _hasApplied = false;

    onLoad() {
        this.iconSprite = this.iconSprite || this.node.getChildByPath('Guild_11/Guild_26/tuan')?.getComponent(Sprite) || null;
        this.labelCreatorName = this.node.getChildByPath('Guild_11/Layout/Label1')?.getComponent(Label) || null;
        this.labelGuildLevel = this.node.getChildByPath('Guild_11/Layout/Label2')?.getComponent(Label) || null;
        this.labelGuildName = this.node.getChildByPath('Guild_11/Layout/Label3')?.getComponent(Label) || null;
        this.labelMembers = this.node.getChildByPath('Guild_11/Guild_29/Label5')?.getComponent(Label) || null;

        this._applyButton = this.node.getChildByPath('Guild_11/Guild_20')?.getComponent(Button) || null;
        if (this._applyButton) {
            this._applyButton.node.off(Button.EventType.CLICK, this.onApplyButtonClick, this);
            this._applyButton.node.on(Button.EventType.CLICK, this.onApplyButtonClick, this);
            this._applyLabel = this._applyButton.getComponentInChildren(Label) || null;
        }
    }

    public async init(data: GuildListItemData, options?: { canApply?: boolean }): Promise<void> {
        this._boundGuildId = data.id;
        const canApply = options?.canApply ?? true;
        if (this._applyButton) {
            this._applyButton.node.active = canApply;
            this._applyButton.interactable = canApply;
        }

        if (this.labelGuildLevel) this.labelGuildLevel.string = this.formatGuildLevel(data.level);
        if (this.labelGuildName) this.labelGuildName.string = data.name ?? '';
        if (this.labelMembers) {
            const num = Math.max(0, Number(data.currentMembers ?? 0));
            this.labelMembers.string = `${num}/80`;
        }

        const leaderKey = data.leaderId != null && String(data.leaderId).trim() !== '' ? String(data.leaderId) : '';
        this._boundUid = leaderKey || (data.uid ?? '');
        if (this.labelCreatorName) this.labelCreatorName.string = this._boundUid;
        void this.updateCreatorNameAsync(this._boundUid);

        this.updateIcon(data.icon);
    }

    private formatGuildLevel(level: number | string): string {
        const n = typeof level === 'number' ? level : Number(String(level ?? '').trim());
        if (!Number.isFinite(n) || n <= 0) return '';
        const v = Math.floor(n);
        return `${v}级`;
    }

    private async onApplyButtonClick(): Promise<void> {
        if (this._hasApplied) {
            ShowToast('你已申请该公会，请等待审核');
            return;
        }
        if (this._isApplying) return;
        const guildId = this._boundGuildId;
        if (guildId == null) return;

        this._isApplying = true;
        if (this._applyButton) this._applyButton.interactable = false;
        try {
            const http = HttpClient.getInstance();
            const res = await http.request<any>('/api/guild/apply', {
                method: 'POST',
                body: {
                    guildId,
                    note: '是我'
                }
            });

            if (!res.success) {
                ShowToast(res.error || '申请失败');
                if (this._applyButton) this._applyButton.interactable = true;
                return;
            }

            const body = res.data as any;
            const outerCode = Number(body?.code);
            if (!Number.isFinite(outerCode)) {
                ShowToast('申请失败');
                if (this._applyButton) this._applyButton.interactable = true;
                return;
            }

            if (outerCode !== 200 && outerCode !== 201) {
                if (body?.msg) ShowToast(String(body.msg));
                else ShowToast('申请失败');
                if (this._applyButton) this._applyButton.interactable = true;
                return;
            }

            const inner = body?.data?.data ?? body?.data ?? null;
            const innerCode = Number(inner?.code);
            const msg = String(inner?.msg ?? body?.msg ?? '');
            const ok = (Number.isFinite(innerCode) && (innerCode === 200 || innerCode === 201)) || outerCode === 200 || outerCode === 201;

            if (ok) {
                this._hasApplied = true;
                if (this._applyLabel) this._applyLabel.string = '已申请';
                ShowToast(msg || '已申请该公会，请等待审核');
            } else {
                if (msg) ShowToast(msg);
                if (this._applyButton) this._applyButton.interactable = true;
            }
        } catch {
            ShowToast('申请失败');
            if (this._applyButton) this._applyButton.interactable = true;
        } finally {
            this._isApplying = false;
        }
    }

    private updateIcon(iconId: number | string): void {
        if (!this.iconSprite || !this.iconAtlas) return;

        const num = typeof iconId === 'number' ? iconId : parseInt(String(iconId || ''), 10);
        const frameName = num >= 1 && num <= 3 ? `CreateGuild_${14 + num}` : 'CreateGuild_15';
        const frame = this.iconAtlas.getSpriteFrame(frameName) || this.iconAtlas.getSpriteFrame('CreateGuild_15');
        if (frame) this.iconSprite.spriteFrame = frame;
    }

    private async updateCreatorNameAsync(uid: string): Promise<void> {
        if (!this.labelCreatorName) return;
        if (!uid) return;

        const name = await Guildicon.resolveNameByUid(uid);
        if (this._boundUid !== uid) return;
        this.labelCreatorName.string = name;
    }

    private static async resolveNameByUid(uid: string): Promise<string> {
        if (this._userNameMap.has(uid)) return this._userNameMap.get(uid) as string;

        try {
            await this.ensureUserListLoaded();
        } catch {
        }

        return this._userNameMap.get(uid) || uid;
    }

    private static ensureUserListLoaded(): Promise<void> {
        if (this._userListPromise) return this._userListPromise;

        this._userListPromise = userAPI.getUserList().then((resp) => {
            const list: any[] = (resp as any)?.data || [];
            for (const item of list) {
                const key = item?.userId != null ? String(item.userId) : '';
                if (!key) continue;
                const name = String(item?.nickName || item?.userName || '');
                if (name) this._userNameMap.set(key, name);
            }
        });

        return this._userListPromise;
    }
}


