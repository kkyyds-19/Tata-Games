import { soulBeastConfigs } from "../global/config/SoulBeastConfig";

export interface UserSoulBeastItem {
  id: number;
  level: number;
  star: number;
  shard: number;
  isOwned: boolean;
}

export class UserSoulBeastData {
  private static instance: UserSoulBeastData;

  private static readonly MAX_STAR_LEVEL = 5;

  private beasts: Map<number, UserSoulBeastItem> = new Map();

  private constructor() {
    this.initialize();
  }

  public static getInstance(): UserSoulBeastData {
    if (!UserSoulBeastData.instance) {
      UserSoulBeastData.instance = new UserSoulBeastData();
    }
    return UserSoulBeastData.instance;
  }

  private initialize(): void {
    soulBeastConfigs.forEach(c => {
      this.beasts.set(c.id, {
        id: c.id,
        level: 1,
        star: 0,
        shard: 0,
        isOwned: false,
      });
    });
  }

  public getBeast(id: number): UserSoulBeastItem | null {
    return this.beasts.get(id) || null;
  }

  public getOwnedBeasts(): UserSoulBeastItem[] {
    return Array.from(this.beasts.values()).filter(b => b.isOwned);
  }

  public addShard(id: number, amount: number): void {
    const beast = this.getBeast(id);
    if (!beast || amount <= 0) {
      return;
    }
    beast.shard += amount;
  }

  public acquire(id: number): void {
    const beast = this.getBeast(id);
    if (!beast) {
      return;
    }
    if (!beast.isOwned) {
      beast.isOwned = true;
      if (beast.star === 0) {
        beast.star = 1;
      }
    }
  }

  public canStarUp(id: number): boolean {
    const beast = this.getBeast(id);
    const config = soulBeastConfigs.find(c => c.id === id);
    if (!beast || !config) {
      return false;
    }
    if (beast.star >= UserSoulBeastData.MAX_STAR_LEVEL || beast.star >= config.maxStar) {
      return false;
    }
    const need = this.getShardNeedForNextStar(config, beast.star);
    return beast.shard >= need;
  }

  public starUp(id: number): boolean {
    const beast = this.getBeast(id);
    const config = soulBeastConfigs.find(c => c.id === id);
    if (!beast || !config) {
      return false;
    }
    if (!this.canStarUp(id)) {
      return false;
    }
    const need = this.getShardNeedForNextStar(config, beast.star);
    beast.shard -= need;
    beast.star += 1;
    return true;
  }

  public levelUp(id: number): boolean {
    const beast = this.getBeast(id);
    const config = soulBeastConfigs.find(c => c.id === id);
    if (!beast || !config) {
      return false;
    }
    if (beast.level >= config.maxLevel) {
      return false;
    }
    beast.level += 1;
    return true;
  }

  private getShardNeedForNextStar(config: { baseShardNeed: number }, currentStar: number): number {
    if (currentStar <= 0) {
      return config.baseShardNeed;
    }
    return config.baseShardNeed + currentStar * 10;
  }
}

