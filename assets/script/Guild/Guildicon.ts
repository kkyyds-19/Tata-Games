import { _decorator, Component, Label, Node, Sprite, SpriteAtlas } from 'cc';
import { userAPI } from '../api/UserAPI';
const { ccclass, property } = _decorator;

export interface GuildListItemData {
    id: number;
    uid: string;
    icon: number | string;
    name: string;
    level: number;
    currentMembers: number;
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

    onLoad() {
        this.iconSprite = this.iconSprite || this.node.getChildByPath('Guild_11/Guild_26/tuan')?.getComponent(Sprite) || null;
        this.labelCreatorName = this.node.getChildByPath('Guild_11/Layout/Label1')?.getComponent(Label) || null;
        this.labelGuildLevel = this.node.getChildByPath('Guild_11/Layout/Label2')?.getComponent(Label) || null;
        this.labelGuildName = this.node.getChildByPath('Guild_11/Layout/Label3')?.getComponent(Label) || null;
        this.labelMembers = this.node.getChildByPath('Guild_11/Guild_29/Label5')?.getComponent(Label) || null;
    }

    public async init(data: GuildListItemData): Promise<void> {
        if (this.labelGuildLevel) this.labelGuildLevel.string = String(data.level ?? 1);
        if (this.labelGuildName) this.labelGuildName.string = data.name ?? '';
        if (this.labelMembers) {
            const num = Math.max(0, Number(data.currentMembers ?? 0));
            this.labelMembers.string = `${num}/80`;
        }

        this._boundUid = data.uid ?? '';
        if (this.labelCreatorName) this.labelCreatorName.string = this._boundUid;
        void this.updateCreatorNameAsync(this._boundUid);

        this.updateIcon(data.icon);
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


