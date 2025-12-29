import { _decorator } from 'cc';
const { ccclass } = _decorator;

/**
 * 英雄卡数据结构
 */
export interface HeroCard {
    heroId: number;     // 英雄ID
    count: number;      // 数量
    star: number;       // 星级
}

/**
 * 用户英雄卡数据管理（全局单例）
 */
@ccclass('UserHeroData')
export class UserHeroData {
    private static _instance: UserHeroData = null;

    private _heroCards: Map<number, HeroCard> = new Map();

    public static getInstance(): UserHeroData {
        if (!this._instance) {
            this._instance = new UserHeroData();
        }
        return this._instance;
    }

    /**
     * 获取英雄卡
     */
    public getHeroCard(heroId: number): HeroCard | null {
        return this._heroCards.get(heroId) || null;
    }

    /**
     * 设置英雄卡
     */
    public setHeroCard(heroId: number, count: number, star: number): void {
        this._heroCards.set(heroId, { heroId, count, star });
    }

    /**
     * 获取所有英雄卡
     */
    public getAllHeroCards(): HeroCard[] {
        return Array.from(this._heroCards.values());
    }

    /**
     * 是否拥有英雄
     */
    public hasHero(heroId: number): boolean {
        const card = this._heroCards.get(heroId);
        return card && card.count > 0;
    }
} 