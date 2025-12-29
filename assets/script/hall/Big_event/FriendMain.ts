import { _decorator, Component, Node, Prefab, instantiate, Layout, sys } from 'cc';
import { rankingAPI } from '../../api/RankingAPI';
import { HttpClient } from '../../http/HttpClient';
import { RankingInfo } from '../../api/APITypes';
import { FriendItem } from './FriendItem';
const { ccclass, property } = _decorator;

@ccclass('FriendMain')
export class FriendMain extends Component {
    @property({ type: Prefab })
    public friendItemPrefab: Prefab | null = null;

    @property({ type: Node })
    public content: Node | null = null;

    @property
    public itemCount: number = 10;

    onEnable() {
        this.populateList();
    }

    public show(): void {
        this.node.active = true;
        this.populateList();
    }

    private async populateList(): Promise<void> {
        const cont = this.ensureContent();
        if (!cont || !this.friendItemPrefab) return;
        cont.removeAllChildren();
        this.ensureLayout(cont);

        let data: RankingInfo[] = [];
        try {
            HttpClient.getInstance().int();
            const resp = await rankingAPI.getFightPowerRanking(1, this.itemCount);
            const list = (resp?.data && (resp.data as any).data) ? (resp.data as any).data as RankingInfo[] : [];
            data = list || [];
            if (!data || data.length === 0) {
                const honorResp = await rankingAPI.getArenaHonorRanking(1, this.itemCount);
                const honorList = (honorResp?.data && (honorResp.data as any).data) ? (honorResp.data as any).data as any[] : [];
                data = (honorList || []).map((it: any) => ({
                    userId: it.userId ?? null,
                    userName: it.userName ?? undefined,
                    nickName: it.nickName ?? undefined,
                    avatar: it.avatar ?? undefined,
                    chartNumber: 0,
                    fightPower: typeof it.fightPower === 'number' ? it.fightPower : (typeof it.power === 'number' ? it.power : 0),
                    firstFinishTime: it.firstFinishTime ?? ''
                }));
            }
        } catch (e) {
            data = [];
        }

        for (let i = 0; i < (data.length || 0); i++) {
            const r = data[i];
            const node = instantiate(this.friendItemPrefab);
            cont.addChild(node);
            const comp = node.getComponent(FriendItem);
            if (comp) {
                const name = (r.nickName && r.nickName.length > 0) ? r.nickName : (r.userName || '玩家');
                const power = typeof r.fightPower === 'number' ? r.fightPower : 0;
                comp.init(name, undefined, power);
                const av = r.avatar || '';
                if (av && /^https?:\/\//.test(av)) {
                    comp.setAvatarFromUrl(av);
                } else if (av) {
                    comp.setAvatarByKey(av);
                }
            }
        }
    }

    private ensureContent(): Node | null {
        if (this.content) return this.content;
        const n = this.node.getChildByName('Content') || this.node.getChildByName('content') || this.node;
        this.content = n;
        return this.content;
    }

    private ensureLayout(n: Node): void {
        const layout = n.getComponent(Layout) || n.addComponent(Layout);
        layout.type = Layout.Type.VERTICAL;
        layout.resizeMode = Layout.ResizeMode.CONTAINER;
        layout.spacingX = 0;
        layout.spacingY = 12;
        layout.paddingLeft = 0;
        layout.paddingRight = 0;
        layout.paddingTop = 0;
        layout.paddingBottom = 0;
    }

    private getTodayKey(): string {
        const d = new Date();
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');
        return `${d.getFullYear()}${mm}${dd}`;
    }

    private getDailySeed(): number {
        const keyDate = 'friend_list_seed_date';
        const keyValue = 'friend_list_seed_value';
        const today = this.getTodayKey();
        const lastDate = sys.localStorage.getItem(keyDate);
        if (lastDate === today) {
            const v = sys.localStorage.getItem(keyValue);
            return v ? parseInt(v, 10) : 0;
        }
        const newSeed = Math.floor(Math.random() * 0x7fffffff);
        sys.localStorage.setItem(keyDate, today);
        sys.localStorage.setItem(keyValue, String(newSeed));
        return newSeed;
    }

 
    hide(){
        this.node.active = false;
    }
}


