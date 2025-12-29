import { Color, Vec2 } from 'cc';
import { LabelAnimData } from './label-anim-data';
import { ObjectPool } from './object-pool';
import { Utils } from '../utils/Utils';

/**
 * PopUpLabel 辅助工具类
 * 提供常见动画效果的快速创建方法
 */
export class PopUpLabelHelper {
    
    // 动画坐标常量
    static readonly DAMAGE_END_POS = new Vec2(0, 80);
    static readonly DAMAGE_CONTROL_NORMAL = new Vec2(15, 40);
    static readonly DAMAGE_CONTROL_CRITICAL = new Vec2(30, 40);
    
    static readonly HEAL_END_POS = new Vec2(0, 60);
    static readonly HEAL_CONTROL = new Vec2(-20, 30);
    
    static readonly EXP_END_POS = new Vec2(0, 100);
    static readonly EXP_CONTROL = new Vec2(0, 50);
    
    static readonly MISS_END_POS = new Vec2(0, 40);
    static readonly MISS_CONTROL = new Vec2(25, 20);
    
    static readonly COIN_END_POS = new Vec2(0, 70);
    static readonly COIN_CONTROL = new Vec2(-10, 35);
    
    static readonly LEVELUP_END_POS = new Vec2(0, 120);
    static readonly LEVELUP_CONTROL = new Vec2(0, 60);
    
    static readonly START_POS = Vec2.ZERO;
    

    
    /**
     * 创建伤害数字动画
     * @param damage 伤害值
     * @param startPos 起始位置
     * @param isCritical 是否暴击
     * @param color 自定义颜色 (可选)
     * @returns 动画数据
     */
    static createDamageAnim(damage: number, startPos: Vec2, isCritical: boolean = false, color?: Color): LabelAnimData {
        const animData = ObjectPool.allocate(LabelAnimData);
        
        animData.text = Utils.formatNumber(damage);
        animData.font = 0;
        animData.duration = (isCritical ? 0.5 : 0.4) + (Math.random() * 0.2 + 0.1); // 暴击动画稍长, 并增加随机性
        animData.delay = 0;
        animData.ease = "quadOut"; // 开始快，然后减速，更有爆炸感
         
        // 起始状态
        animData.from.position.set(startPos);
        animData.from.scale = isCritical ? 0.6 : 0.3; // 暴击初始更大
        
        if (color) {
            animData.from.color.set(color);
        } else if (isCritical) {
            animData.from.color.set(255, 160, 0, 255); // 暴击用醒目的橙色
        } else {
            animData.from.color.set(Color.WHITE); // 普通攻击白色
        }
        
        // 圆形炸开效果 - 随机角度和半径
        const angle = Math.random() * Math.PI * 2; // 0 到 2π的随机角度
        const radius = isCritical ? (80 + Math.random() * 50) : (40 + Math.random() * 30); // 暴击散布更远
        
        const endX = startPos.x + Math.cos(angle) * radius;
        const endY = startPos.y + Math.sin(angle) * radius;
        animData.to.position.set(endX, endY);
        animData.to.scale = isCritical ? 1.6 : 1.0; // 暴击最终更大
        
        if (color) {
            animData.to.color.set(color);
        } else if (isCritical) {
            animData.to.color.set(255, 160, 0, 255); // 暴击最终颜色
        } else {
            animData.to.color.set(Color.WHITE);
        }
        animData.to.color.a = 255; // 动画过程中不淡出
        
        // 控制点 - 在起始点和终点之间，稍微偏移形成弧线
        const midRadius = radius * 0.4; // 调整控制点，让弧线更平直，速度感更强
        const controlOffsetAngle = angle + (Math.random() - 0.5) * 0.3; // 角度偏移减小
        const controlX = startPos.x + Math.cos(controlOffsetAngle) * midRadius;
        const controlY = startPos.y + Math.sin(controlOffsetAngle) * midRadius;
        animData.control1.set(controlX, controlY);
        
        return animData;
    }
    
    /**
     * 创建治疗数字动画
     * @param heal 治疗值
     * @param startPos 起始位置
     * @returns 动画数据
     */
    static createHealAnim(heal: number, startPos: Vec2): LabelAnimData {
        const animData = ObjectPool.allocate(LabelAnimData);
        
        animData.text = `+${Utils.formatNumber(heal)}`;
        animData.font = 0;
        animData.duration = 1.2;
        animData.delay = 0;
        animData.ease = "quadOut";
        
        // 起始状态
        animData.from.position.set(startPos);
        animData.from.scale = 0.8;
        animData.from.color.set(Color.GREEN);
        
        // 结束状态
        animData.to.position.set(startPos.x + PopUpLabelHelper.HEAL_END_POS.x, startPos.y + PopUpLabelHelper.HEAL_END_POS.y);
        animData.to.scale = 1.2;
        animData.to.color.set(Color.GREEN);
        animData.to.color.a = 255;
        
        // 贝塞尔控制点
        animData.control1.set(startPos.x + PopUpLabelHelper.HEAL_CONTROL.x, startPos.y + PopUpLabelHelper.HEAL_CONTROL.y);
        
        return animData;
    }
    
    /**
     * 创建经验值动画
     * @param exp 经验值
     * @param startPos 起始位置
     * @returns 动画数据
     */
    static createExpAnim(exp: number, startPos: Vec2): LabelAnimData {
        const animData = ObjectPool.allocate(LabelAnimData);
        
        animData.text = `+${Utils.formatNumber(exp)} EXP`;
        animData.font = 0;
        animData.duration = 2.0;
        animData.delay = 0;
        animData.ease = "sineOut";
        
        // 起始状态
        animData.from.position.set(startPos);
        animData.from.scale = 0.7;
        animData.from.color.set(Color.BLUE);
        
        // 结束状态
        animData.to.position.set(startPos.x + PopUpLabelHelper.EXP_END_POS.x, startPos.y + PopUpLabelHelper.EXP_END_POS.y);
        animData.to.scale = 0.9;
        animData.to.color.set(Color.CYAN);
        animData.to.color.a = 0;
        
        // 贝塞尔控制点
        animData.control1.set(startPos.x + PopUpLabelHelper.EXP_CONTROL.x, startPos.y + PopUpLabelHelper.EXP_CONTROL.y);
        
        return animData;
    }
    
    /**
     * 创建Miss动画
     * @param startPos 起始位置
     * @returns 动画数据
     */
    static createMissAnim(startPos: Vec2): LabelAnimData {
        const animData = ObjectPool.allocate(LabelAnimData);
        
        animData.text = "Miss";
        animData.font = 0;
        animData.duration = 1.0;
        animData.delay = 0;
        animData.ease = "elasticOut";
        
        // 起始状态
        animData.from.position.set(startPos);
        animData.from.scale = 0.3;
        animData.from.color.set(Color.GRAY);
        
        // 结束状态
        animData.to.position.set(startPos.x + PopUpLabelHelper.MISS_END_POS.x, startPos.y + PopUpLabelHelper.MISS_END_POS.y);
        animData.to.scale = 1.0;
        animData.to.color.set(Color.GRAY);
        animData.to.color.a = 0;
        
        // 贝塞尔控制点
        animData.control1.set(startPos.x + PopUpLabelHelper.MISS_CONTROL.x, startPos.y + PopUpLabelHelper.MISS_CONTROL.y);
        return animData;
    }
    
    /**
     * 创建金币获得动画
     * @param coins 金币数量
     * @param startPos 起始位置
     * @returns 动画数据
     */
    static createCoinAnim(coins: number, startPos: Vec2): LabelAnimData {
        const animData = ObjectPool.allocate(LabelAnimData);
        
        animData.text = `+${Utils.formatNumber(coins)} Gold`;
        animData.font = 0;
        animData.duration = 1.8;
        animData.delay = 0;
        animData.ease = "bounceOut";
        
        // 起始状态
        animData.from.position.set(startPos);
        animData.from.scale = 0.4;
        animData.from.color.set(Color.YELLOW);
        
        // 结束状态
        animData.to.position.set(startPos.x + PopUpLabelHelper.COIN_END_POS.x, startPos.y + PopUpLabelHelper.COIN_END_POS.y);
        animData.to.scale = 1.1;
        animData.to.color.set(Color.YELLOW);
        animData.to.color.a = 0;
        
        // 贝塞尔控制点
        animData.control1.set(startPos.x + PopUpLabelHelper.COIN_CONTROL.x, startPos.y + PopUpLabelHelper.COIN_CONTROL.y);
        
        return animData;
    }
    
    /**
     * 创建等级提升动画
     * @param level 新等级
     * @param startPos 起始位置
     * @returns 动画数据
     */
    static createLevelUpAnim(level: number, startPos: Vec2): LabelAnimData {
        const animData = ObjectPool.allocate(LabelAnimData);
        
        animData.text = `Level ${level}!`;
        animData.font = 0;
        animData.duration = 2.5;
        animData.delay = 0;
        animData.ease = "backOut";
        
        // 起始状态
        animData.from.position.set(startPos);
        animData.from.scale = 0.1;
        animData.from.color.set(Color.WHITE);
        
        // 结束状态
        animData.to.position.set(startPos.x + PopUpLabelHelper.LEVELUP_END_POS.x, startPos.y + PopUpLabelHelper.LEVELUP_END_POS.y);
        animData.to.scale = 2.0;
        animData.to.color.set(Color.MAGENTA);
        animData.to.color.a = 0;
        
        // 贝塞尔控制点
        animData.control1.set(startPos.x + PopUpLabelHelper.LEVELUP_CONTROL.x, startPos.y + PopUpLabelHelper.LEVELUP_CONTROL.y);
        
        return animData;
    }
    
    /**
     * 创建通用文字动画（随机效果）
     * @param text 显示文本
     * @param startPos 起始位置
     * @param color 颜色 (可选，默认白色)
     * @param duration 持续时间 (可选，默认0.6)
     * @returns 动画数据
     */
    static createTextAnim(text: string, startPos: Vec2, color?: Color, duration: number = 0.6): LabelAnimData {
        const animData = ObjectPool.allocate(LabelAnimData);
        
        animData.text = text;
        animData.font = 0;
        animData.duration = duration;
        animData.delay = 0;
        animData.ease = "quadOut";
        
        // 起始状态
        animData.from.position.set(startPos);
        animData.from.scale = 3;
        animData.from.color.set(color || Color.WHITE);
        
        // 终点设置（向上移动）- 随机左右偏移
        const endX = startPos.x + (Math.random() * 2 - 1) * 30;
        const endY = startPos.y + Math.random() * 20 + 50;
        animData.to.position.set(endX, endY);
        animData.to.scale = 2;
        animData.to.color.set(color || Color.WHITE);
        animData.to.color.a = 0; // 淡出
        
        // 控制点 - 抛物线效果
        const controlX = startPos.x + Math.sin(Math.random() * Math.PI) * 20;
        const controlY = startPos.y + Math.random() * 50 + 80;
        animData.control1.set(controlX, controlY);
        
        return animData;
    }
    
    /**
     * 创建自定义动画
     * @param config 动画配置
     * @returns 动画数据
     */
    static createCustomAnim(config: {
        text: string;
        duration?: number;
        delay?: number;
        ease?: string;
        fromPos?: Vec2;
        toPos?: Vec2;
        fromScale?: number;
        toScale?: number;
        fromColor?: Color;
        toColor?: Color;
        control?: Vec2;
    }): LabelAnimData {
        const animData = ObjectPool.allocate(LabelAnimData);
        
        animData.text = config.text;
        animData.font = 0;
        animData.duration = config.duration || 1.5;
        animData.delay = config.delay || 0;
        animData.ease = config.ease as any || "quadOut";
        
        // 起始状态
        animData.from.position.set(config.fromPos || Vec2.ZERO);
        animData.from.scale = config.fromScale || 1.0;
        animData.from.color.set(config.fromColor || Color.WHITE);
        
        // 结束状态
        animData.to.position.set(config.toPos || new Vec2(0, 50));
        animData.to.scale = config.toScale || 1.0;
        animData.to.color.set(config.toColor || Color.WHITE);
        
        // 贝塞尔控制点
        animData.control1.set(config.control || Vec2.ZERO);
        
        return animData;
    }
} 