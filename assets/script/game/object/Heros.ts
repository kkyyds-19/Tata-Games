import { GameObject } from './GameObject';
import { ResourceConfig } from '../../global/config/ResourceConfig';

export class Heros extends GameObject {
    public name: string = "";  // 英雄名称
    public description: string = "";  // 英雄描述
    
    constructor(id: number | string) {
        super();
        this.initFromId(id);
    }

    private initFromId(id: number | string) {
        const heroId = id.toString();
        // 从配置中获取英雄信息
        const heroConfig = ResourceConfig.heros_list.find(hero => hero.id === heroId);

        if (heroConfig) {
            // 设置英雄ID
            this.id = heroId;
            
            // 从配置读取属性
            this.name = heroConfig.name;
            this.description = heroConfig.description;
            this.class = heroConfig.class;
            this.resourceDir = heroConfig.path;
            this.attack = (heroConfig as any).attack || 0; 
            // 如果配置中存在 skinName，则进行设置
            if ((heroConfig as any).skinName) {
                this.skinName = (heroConfig as any).skinName;
            }

            // 设置通用默认属性
            this.level = 1;
            this.exp = 0;
            // 优先从配置读取属性，否则使用默认值
            this.maxhp = (heroConfig as any).maxhp || 100;
            this.defense = (heroConfig as any).defense || 0;
            this.hp = this.maxhp; // 初始化当前血量为最大血量
            this.skillCooldown = 5; // 技能冷却时间 秒
            this.resourceType = "spine";
            
            // 【修复】添加治疗量初始化
            this.healing_power = (heroConfig as any).healing_power || 0;

            this.super_skinName = (heroConfig as any).super_skinName || '';
            this.super_skin_enable = (heroConfig as any).super_skin_enable || false;

            

        } else {
           console.error("英雄配置不存在:", id);
        }
    }
}





