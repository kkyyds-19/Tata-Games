// enums.ts（可分文件）

// 导入子弹修改器类型
import { BulletModifier } from './BulletModifier';
import { SkillConfigData, EffectData, SkillUnlock } from '../types';


export class BaseSkill {
  readonly skill_id: string;
  readonly name: string;
  readonly type: 'main' | 'passive';
  readonly rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'synergy';
  readonly unlock: SkillUnlock;
  readonly description: string;
  readonly bullet_id?: string;
  readonly effects?: EffectData[];
  readonly trigger?: 'always' | 'on_attack' | 'on_hit' | 'on_kill';

  readonly max_stack: number = 1;
  public stack: number = 0;

  constructor(config: SkillConfigData) {
    this.skill_id = config.skill_id;
    this.name = config.name;
    this.type = config.type;
    this.rarity = config.rarity;
    this.unlock = config.unlock;
    this.description = config.description;
    this.bullet_id = config.bullet_id;
    this.effects = config.effects;
    this.trigger = config.trigger;
    this.max_stack = config.max_stack || 1;
  }

  public getStack(): number {
    return this.stack;
  }

  public setStack(stack: number): void {
    this.stack = stack;
  }

  public addStack(): boolean {
    if (this.stack < this.max_stack) {
      this.stack++;
      return true;
    }
    return false;
  }

  public canAddStack(): boolean {
    return this.stack < this.max_stack;
  }
  
  public getEffect(): { bullet_id?: string, effects?: EffectData[] } {
    // TODO: Re-implement modifier stacking logic later
    return {
      bullet_id: this.bullet_id,
      effects: this.effects
    };
  }

  public getCurrentDescription(): string {
    return this.description.replace('{stack}', this.stack.toString());
  }

  public isUnlocked(heroLevel: number, star: number, teamHeroIds: string[] = [], equippedSkillIds: string[] = []): boolean {
    switch (this.unlock.type) {
      case 'default':
        return true;
      case 'level':
        return heroLevel >= (this.unlock.value || 999);
      case 'hero_star':
        return star >= (this.unlock.value || 999);
      case 'synergy':
        if (!this.unlock.requires_hero_ids || this.unlock.requires_hero_ids.length === 0) {
          return true;
        }
        return this.unlock.requires_hero_ids.every(id => teamHeroIds.indexOf(id) !== -1);
      default:
        return false;
    }
  }
}
