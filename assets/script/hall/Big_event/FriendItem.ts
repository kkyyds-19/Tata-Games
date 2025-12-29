import { _decorator, Component, Node, Label, Sprite, resources, SpriteAtlas, SpriteFrame, sys } from 'cc';
import { WxAvatarLoader } from '../../wx/WxAvatarLoader';
const { ccclass, property } = _decorator;

@ccclass('FriendItem')
export class FriendItem extends Component {
    @property({ type: Sprite })
    public avatar: Sprite | null = null;

    @property({ type: Label })
    public nameLabel: Label | null = null;

    @property({ type: Label })
    public levelLabel: Label | null = null;

    @property({ type: Label })
    public powerLabel: Label | null = null;

    start() {
        this.setDailyStableAvatar();
    }

    public init(name: string, level?: number, power?: number): void {
        if (this.nameLabel) this.nameLabel.string = name || '玩家';
        if (this.levelLabel) {
            const lv = Number(level);
            if (lv && lv > 0) {
                this.levelLabel.node.active = true;
                this.levelLabel.string = `Lv.${lv}`;
            } else {
                this.levelLabel.node.active = false;
            }
        }
        if (this.powerLabel) this.powerLabel.string = this.formatNumber(Number(power) || 0);
        this.setDailyStableAvatar();
    }

    public setAvatarByKey(key?: string): void {
        if (!this.avatar || !key) return;
        const trySet = (atlas: SpriteAtlas | null) => {
            if (!atlas) return false;
            const sf = atlas.getSpriteFrame(key) || atlas.getSpriteFrame(`${key}.png`);
            if (sf) {
                this.avatar!.spriteFrame = sf;
                return true;
            }
            return false;
        }
        // 先尝试已有图集
        if (this.avatar.spriteAtlas && trySet(this.avatar.spriteAtlas)) return;
        // 再尝试加载常用图集
        resources.load('img/icons', SpriteAtlas, (err, atlas) => {
            if (!err && atlas) {
                if (trySet(atlas)) return;
            }
        });
    }

    public setAvatarFromUrl(url?: string): void {
        if (!this.avatar || !url) return;
        WxAvatarLoader.setAvatar(this.avatar, url);
    }

    private setDailyStableAvatar(): void {
        if (!this.avatar) return;
        resources.load('img/icons', SpriteAtlas, (err, atlas) => {
            if (!err && atlas) {
                const frames = atlas.getSpriteFrames();
                const hFrames = frames.filter(f => /^h_/i.test(f.name));
                const pool = hFrames.length ? hFrames : frames;
                if (pool.length) {
                    const idx = this.pickIndexBySeed(pool.length);
                    this.avatar!.spriteFrame = pool[idx];
                }
                return;
            }
            resources.loadDir('img/icons', SpriteFrame, (err2, assets) => {
                if (!err2 && assets && assets.length) {
                    const hFrames = assets.filter(f => /^h_/i.test(f.name));
                    const pool = hFrames.length ? hFrames : assets;
                    const idx = this.pickIndexBySeed(pool.length);
                    this.avatar!.spriteFrame = pool[idx];
                }
            });
        });
    }

    private getTodayKey(): string {
        const d = new Date();
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');
        return `${d.getFullYear()}${mm}${dd}`;
    }

    private getDailySeed(): number {
        const keyDate = 'friend_daily_seed_date';
        const keyValue = 'friend_daily_seed_value';
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

    private pickIndexBySeed(length: number): number {
        if (length <= 0) return 0;
        const seed = this.getDailySeed();
        const mix = (seed ^ 1315423911) >>> 0;
        return mix % length;
    }

    private formatNumber(num: number): string {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
}


