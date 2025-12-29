import { IBulletData } from "../types";

// 弹幕配置表
export class BulletConfig {
    private static bulletConfigs: Map<string, IBulletData> = new Map([
        // 黑暗弓箭手箭矢 - 单发
        ['archer_basic_arrow', {
            id: 'archer_basic_arrow',
            scale: 0.6,
            damage: 100,
           speed: 800,
            spriteFrameName: 'arrow',
            hasTrail: true, // 是否增加拖尾
            trailType: "prefab_tailing_arrow", 
            maxDistance: 4000,
            count: 1,
            spreadAngle: 4.2,      // 扇形角度
            waveCount: 1,        // 1波
            colCount: 1,         // 每波1个
            waveDelay: 0.189,     // 
            colSpacing: 0       // 列间距
        }],
        
        // 石头
        ['tanker_rock', {
            id: 'tanker_rock',
            scale: 0.8,
            damage: 100,
            speed: 200, 
            spriteFrameName: 'stone_0',
            animationNames:['bullet_tanker_rock'],
            hasTrail: true, // 是否增加拖尾
            trailType: "prefab_tailing_stone",
            maxDistance: 10000,
            spreadAngle: 0,     
            waveCount: 1,       // 
            colCount: 1,        // 每波
            waveDelay: 2.0,    // 每波延
            colSpacing: 250,     
        }],
        // 治疗师藤蔓子弹
        ['healer_vine', {
            id: 'healer_vine',
            damage: 100,
           speed: 800,
            scale: 0.8,
            spriteFrameName: 'tree',  // 暂时复用tree贴图
            hasTrail: true, // 是否增加拖尾
            trailType: "prefab_tailing_leaves",
            bulletEffectType: "1",
            maxDistance: 6000,
            count: 1,
            spreadAngle: 0,
            waveCount: 1,
            colCount: 1,
            waveDelay: 0,
            colSpacing: 0
        }],

        // 森林贤者 治疗弹幕
        ['forest_heal_burst', {
            id: 'forest_heal_burst',
            damage: 100,
            scale: 0.6,
           speed: 800,
            spriteFrameName: 'bullet_1',  // 
            hasTrail: true, // 是否增加拖尾
            trailType: "prefab_tailing_leaves",
            // bulletEffectType: "1",
            maxDistance: 6000,
            count: 1,
            spreadAngle: 0,
            waveCount: 1,
            colCount: 1,
            waveDelay: 0,
            colSpacing: 0
        }],

        // 法师 火球 
        ['mage_magic_missile', {
            id: 'mage_magic_missile',
            damage: 100,
            scale: 0.818,
           speed: 800,
            spriteFrameName: 'none',
            hasTrail: true, // 是否增加拖尾
            trailType: "prefab_tailing_fire_01", // 自动映射预制体名称（如 tailing_leaves.prefab）
            trailColor: "#FF4500", // 火焰的红色 (橙红色)  #FF4500
            spriteColor: "#FFF700", // 火焰中心的颜色 🔥 (亮白黄色) #FFF700
            maxDistance: 6000,
            count: 1,          // 3 * 5 = 15
            spreadAngle: 15,    // 每排30度扇形
            waveCount: 1,       // 3波
            colCount: 1,        // 每波5个
            waveDelay: 0.5,     // 每波延迟0.1秒
            colSpacing: 60       // 使用扇形，不用固定列间距
        }],
        
        // 刺客-落雷
        ['assassin_lightning', {
            id: 'assassin_lightning',
            damage: 100,
            speed: 2000,
            scale: 1.2,
            spriteFrameName: 'light_0', // 落雷纹理
            animationNames:['light'],
            explosion: { enabled: true, radius: 200, damage: 100 }, // 添加爆炸效果配置
            maxDistance: 2000,
            count: 1,
            spreadAngle: 0,
            waveCount: 1,
            colCount: 1,
            waveDelay: 0.6,
            colSpacing: 0
        }],


        // ------- 新
        //  药剂师  毒药 
        ['potioner_basic_bottle', {
            id: 'potioner_basic_bottle',
            damage: 100,
            scale: 0.818,
           speed: 800,
            spriteFrameName: 'none',
            hasTrail: true, // 是否增加拖尾
            trailType: "prefab_tailing_fire", // 自动映射预制体名称（如 tailing_leaves.prefab）
        //    // 毒药瓶（深绿色，带不透明感）
        //     spriteColor : "#2A7F3F",  // 或 "#1E5F2B"（更暗）
        //     // 拖尾（荧光绿，半透明更亮）
        //     trailColor : "#4AFF7D",    // 或 "#00FF88"（更霓虹）
        // 毒药瓶（紫黑色，厚重感）
            spriteColor : "#3D1A5F",  // 或 #3D1A5F

            // 拖尾（亮紫色，半透明）
            trailColor :"#B388FF",   // 或 #B388FF


            maxDistance: 6000,
            count: 1,          // 3 * 5 = 15
            spreadAngle: 15,    // 每排30度扇形
            waveCount: 1,       // 3波
            colCount: 1,        // 每波5个
            waveDelay: 0.5,     // 每波延迟0.1秒
            colSpacing: 60       // 使用扇形，不用固定列间距
        }],


        // 冰法师 冰球
        ['ice_mage_basic_orb', {
            id: 'ice_mage_basic_orb',
            damage: 100,
            scale: 0.818,
           speed: 800,
            spriteFrameName: 'none',
            hasTrail: true, // 是否增加拖尾
            trailType: "prefab_tailing_ice", // 自动映射预制体名称（如 tailing_leaves.prefab）
             // 冰球（深蓝带透明感，如魔法凝聚）
            spriteColor : "#4CC9F0",  // 或 #4CC9F0
            // 拖尾（霓虹蓝，增强魔力感）
            trailColor : "#00F5FF",   // 或 #00F5FF

            maxDistance: 6000,
            count: 1,          // 3 * 5 = 15
            spreadAngle: 15,    // 每排30度扇形
            waveCount: 1,       // 3波
            colCount: 1,        // 每波5个
            waveDelay: 0.5,     // 每波延迟0.1秒
            colSpacing: 60       // 使用扇形，不用固定列间距
        }],

        // 步兵盾牌
        ['footman_basic_shield', {
            id: 'footman_basic_shield',
            damage: 100,
            scale: 0.9,
           speed: 800,
            spriteFrameName: 'bullet_0',
            // hasTrail: true, // 是否增加拖尾
            // trailType: "prefab_tailing_fire", // 自动映射预制体名称
            // // 盾牌（金属银色，厚重感）
            // spriteColor : "#C0C0C0",  // 银色
            // // 拖尾（金黄色，英勇感）
            // trailColor : "#FFD700",   // 金色

            maxDistance: 6000,
            count: 1,
            spreadAngle: 0,
            waveCount: 1,
            colCount: 1,
            waveDelay: 0.6,
            colSpacing: 0
        }],

        // 森林刺客暗影飞刃
        ['forest_assassin_shadow_blade', {
            id: 'forest_assassin_shadow_blade',
            damage: 100,
            scale: 0.25,
           speed: 800,
            spriteFrameName: 'flash3',
            hasTrail: true, // 是否增加拖尾
            trailType: "prefab_tailing_fire", // 自动映射预制体名称
            spriteColor : "#D4A017",  //第1层 -rgb(215, 198, 10) 荧光绿
            trailColor:  '#D4A017',    // 冰蓝尾焰 #D4A017
            bulletEffectType: "1",

            maxDistance: 5000,
            count: 1,
            spreadAngle: 4,
            waveCount: 1,
            colCount: 1,
            waveDelay: 0.2,
            colSpacing: 0
        }],

        // 砰砰博士 炸弹
        ['drboom_basic_bomb', {
            id: 'drboom_basic_bomb',
            damage: 200,
            scale: 0.418,
            speed: 1800,
            spriteFrameName: 'zhadan',
            maxDistance: 5000,
            count: 1,
            spreadAngle: 4,
            waveCount: 1,
            colCount: 1,
            waveDelay: 0.2,
            colSpacing: 0
        }],

        // 艾格文 魔法箭
        ['aegwynn_basic_arrow', {
            id: 'aegwynn_basic_arrow',
            damage: 10,
            scale: 0.618,
            speed: 800,
            spriteFrameName: 'none',
            hasTrail: true, // 是否增加拖尾
            trailType: "prefab_tailing_fire", // 自动映射预制体名称
            spriteColor: '#00C8E0',    // 青蓝偏冷主色 #00C8E0
            trailColor:  '#87F0FF',    // 冰蓝尾焰 #87F0FF


            maxDistance: 6000,
            count: 1,
            spreadAngle: 4,
            waveCount: 1,
            colCount: 1,
            waveDelay: 0.2,
            colSpacing: 0
        }],


















        //伙伴 **********************

        ['lava_lord_basic_bullet', {
            id: 'lava_lord_basic_bullet',
            damage: 1000,
            scale: 0.818,
           speed: 800,
            spriteFrameName: 'none',
            hasTrail: true, // 是否增加拖尾
            trailType: "prefab_tailing_fire_01", // 自动映射预制体名称
            trailColor: "#FF4500", // 火焰的红色 (橙红色)  #FF4500
            spriteColor: "#FFF700", // 火焰中心的颜色 🔥 (亮白黄色) #FFF700
            maxDistance: 6000,
            count: 1,
            spreadAngle: 15,    // 每排30度扇形
            waveCount: 1,       // 3波
            colCount: 1,        // 每波5个
            waveDelay: 0.5,     // 每波延迟0.1秒
            colSpacing: 60       // 使用扇形，不用固定列间距
        }],
         //冰霜女王
        ['ice_queen_basic_bullet', {
            id: 'ice_queen_basic_bullet',
            damage: 1000,
            scale: 0.818,
           speed: 800,
            spriteFrameName: 'none',
            hasTrail: true, // 是否增加拖尾
            trailType: "prefab_tailing_fire", // 自动映射预制体名称
            spriteColor: '#4CC9F0',    // 冰蓝色
            trailColor: '#00F5FF',    // 冰蓝色
            maxDistance: 6000,
            count: 1,
            spreadAngle: 15,    // 每排30度扇形
            waveCount: 1,       // 3波
            colCount: 1,        // 每波5个
            waveDelay: 0.5,     // 每波延迟0.1秒
            colSpacing: 60       // 使用扇形，不用固定列间距
        }],
        //治愈精灵
        ['healing_elf_basic_bullet', {
            id: 'healing_elf_basic_bullet',
            damage: 1000,
            scale: 0.818,
           speed: 800,
            spriteFrameName: 'none',
            hasTrail: true, // 是否增加拖尾
            trailType: "prefab_tailing_fire", // 自动映射预制体名称
            spriteColor: '#00FF00',    // 绿色
            trailColor: '#00FF00',    // 绿色
            maxDistance: 6000,
            count: 1,
            spreadAngle: 15,    // 每排30度扇形
            waveCount: 1,       // 3波
            colCount: 1,        // 每波5个
            waveDelay: 0.5,     // 每波延迟0.1秒
            colSpacing: 60       // 使用扇形，不用固定列间距
        }],
        //暗影刺客
        ['shadow_assassin_basic_bullet', {
            id: 'shadow_assassin_basic_bullet',
            damage: 1000,
            scale: 0.818,
           speed: 800,
            spriteFrameName: 'none',
            hasTrail: true, // 是否增加拖尾
            trailType: "prefab_tailing_fire", // 自动映射预制体名称
            spriteColor: '#000000',    // 黑色
            trailColor: '#000000',    // 黑色
            maxDistance: 6000,
            count: 1,
            spreadAngle: 15,    // 每排30度扇形
            waveCount: 1,       // 3波
            colCount: 1,        // 每波5个
            waveDelay: 0.5,     // 每波延迟0.1秒
            colSpacing: 60       // 使用扇形，不用固定列间距
        }],
        //雷鸣战士
        ['thunder_warrior_basic_bullet', {
            id: 'thunder_warrior_basic_bullet',
            damage: 1000,
            scale: 0.818,
           speed: 800,
            spriteFrameName: 'none',
            hasTrail: true, // 是否增加拖尾
            trailType: "prefab_tailing_fire", // 自动映射预制体名称
            spriteColor: '#000000',    // 黑色
            trailColor: '#000000',    // 黑色
            maxDistance: 6000,
            count: 1,
            spreadAngle: 15,    // 每排30度扇形
            waveCount: 1,       // 3波
            colCount: 1,        // 每波5个
            waveDelay: 0.5,     // 每波延迟0.1秒
            colSpacing: 60       // 使用扇形，不用固定列间距
        }],



    ]);

    /**
     * 根据ID获取弹幕配置
     */
    public static getBulletData(bulletId: string): IBulletData | null {
        return this.bulletConfigs.get(bulletId) || null;
    }

    /**
     * 获取所有弹幕配置
     */
    public static getAllBulletData(): IBulletData[] {
        return Array.from(this.bulletConfigs.values());
    }

    /**
     * 添加新的弹幕配置
     */
    public static addBulletConfig(bulletData: IBulletData): void {
        this.bulletConfigs.set(bulletData.id, bulletData);
    }
} 