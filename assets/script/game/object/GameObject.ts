import { _decorator, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameObject')
export class GameObject {
    public static readonly principal = "principal";
    // 通用属性
    /**id principal时为外域专用守护者 */
    public id: string = '';
    public active: boolean = true;
    public position: Vec2 = new Vec2();  // 位置
    public heroStar: number = 0;
    // 属性
    public name: string = ""; // 名称
    public description: string = ""; // 描述
    public class: number = 0; // 职业编号
    public level: number = 1; // 等级
    public exp: number = 0; // 经验
    public maxhp: number = 10; // 最大生命值
    public hp: number = 100; // 当前生命值
    public skillCooldown: number = 5; // 技能冷却时间, s
    public attack: number = 10; // 攻击力
    public defense: number = 5; // 防御力
    public damageReduction: number = 0; // 百分比减伤（例如 0.1 代表 10%）
    public thornArmor: number = 0; // 反伤比例（例如 0.1 代表 10%）
    public crit_rate: number = 0.1; // 暴击率 (0 to 1)
    public crit_damage: number = 1.5; // 暴击伤害倍率
    public lifesteal_percent: number = 0; // 生命偷取百分比
    public resourceType: string = ""; // 资源类型
    public resourceDir: string = ""; // 资源目录
    public skinName: string = ""; // 皮肤
    public super_skinName: string = ""; // 超级皮肤 s皮肤
    public super_skin_enable: boolean = false; // 超级皮肤
    public iconFrameName: string = ""; // 图标框架名称
    public animationNames: string[] = [];
    public attackRange: number = 30;
    public attackInterval: number = 1.5;
    public bossId: number = -1;
    //技能cd 缩短时间
    public skill_cd_reduce: number = 0;
    //医疗量 (治疗职业专用)
    public healing_power: number = 0;
    //装备 医疗加成
    public healing_power_equip: number = 0;
    public isBoss: boolean = false;
    public moveSpeed: number = 100;
    //缩放
    public scale: number = 1;

    // 【新增】临时装备职业加成属性
    public temporaryEquipmentBonuses: { [key: string]: number } = {}; // 临时装备提供的加成

    // 尺寸属性
    public width: number = 100;   // 宽度
    public height: number = 100;  // 高度

    // 可扩展更多通用方法和属性
    public clone(): GameObject {
        const obj = new GameObject()
        obj.id = this.id
        obj.active = this.active
        obj.position = this.position
        obj.heroStar = this.heroStar
        obj.name = this.name
        obj.description = this.description
        obj.class = this.class
        obj.level = this.level
        obj.exp = this.exp
        obj.maxhp = this.maxhp
        obj.hp = this.hp
        obj.skillCooldown = this.skillCooldown
        obj.attack = this.attack
        obj.defense = this.defense
        obj.damageReduction = this.damageReduction
        obj.thornArmor = this.thornArmor;
        obj.crit_rate = this.crit_rate;
        obj.crit_damage = this.crit_damage;
        obj.lifesteal_percent = this.lifesteal_percent;
        obj.resourceType = this.resourceType
        obj.resourceDir = this.resourceDir
        obj.skinName = this.skinName
        obj.iconFrameName = this.iconFrameName
        obj.animationNames = this.animationNames.slice()
        obj.attackRange = this.attackRange;
        obj.attackInterval = this.attackInterval;
        obj.isBoss = this.isBoss
        obj.moveSpeed = this.moveSpeed
        obj.scale = this.scale
        obj.width = this.width
        obj.height = this.height
        obj.bossId = this.bossId
        obj.skill_cd_reduce = this.skill_cd_reduce
        obj.healing_power = this.healing_power
        obj.healing_power_equip = this.healing_power_equip
        obj.super_skinName = this.super_skinName
        obj.super_skin_enable = this.super_skin_enable
        // 【新增】复制临时装备加成
        obj.temporaryEquipmentBonuses = { ...this.temporaryEquipmentBonuses };

        return obj
    }

    // 设置位置
    public setPosition(x: number, y: number) {
        this.position.set(x, y);
    }

    // 获取位置
    public getPosition(): Vec2 {
        return this.position;
    }
} 
