import { _decorator, Component, Node, Label, ProgressBar, Color, Sprite, SpriteFrame, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BossHPBar')
export class BossHPBar extends Component {
    
    @property(ProgressBar)
    public progressBar: ProgressBar | null = null;
    
    @property(Node)
    public bar: Node | null = null;
    
    @property(Node)
    public backgroundBar: Node | null = null;
    
    @property(Label)
    public bossNameLabel: Label | null = null;
    
    @property(Label)
    public bossHPLayerLabel: Label | null = null;
    
    // 血条层数配置
    private maxHPLayers: number = 5;
    private currentHPLayer: number = 5;
    private hpPerLayer: number = 100;
    
    // private layerColors: Color[] = [
    //     new Color(255, 0, 0, 255),         // 第1层 - 纯红（终极危险）
    //     new Color(255, 69, 0, 255),        // 第2层 - 火焰橙
    //     new Color(255, 255, 0, 255),       // 第3层 - 亮黄（警告）
    //     new Color(255, 0, 255, 255),       // 第4层 - 品红（魔法破裂）
    //     new Color(128, 0, 128, 255),       // 第5层 - 深紫（护盾崩溃）
    //     new Color(255, 255, 0, 255),      // 第6层 - 黄（系统警告）
    //     new Color(123, 104, 238, 255),    // 第7层 - 中紫（魔法层）
    // ];


    private layerColors: Color[] = [
        new Color(255, 0, 0, 255),         // 第1层 - #FF0000 - 纯红（终极警告）
        new Color(255, 0, 102, 255),       // 第2层 - #FF0066 - 红粉（脉冲激活）
        new Color(255, 54, 0, 255),        // 第3层 - #FF3600 - 橙红（烈焰边缘）
        new Color(255, 114, 0, 255),       // 第4层 - #FF7200 - 橙黄（灼热提示）
        new Color(255, 186, 0, 255),       // 第5层 - #FFBA00 - 金黄（预警边界）
        new Color(255, 255, 0, 255),       // 第6层 - #FFFF00 - 亮黄（系统警告）
        new Color(123, 104, 238, 255),     // 第7层 - #7B68EE - 中紫（魔法能量层）
    ];
    
    // boss血量信息
    private currentHP: number = 0;
    private maxHP: number = 0;
    private bossName: string = "";
    
    // 自动隐藏计时器
    private hideTimer: number = 0;
    private readonly HIDE_DELAY: number = 10.0; // 5秒没更新自动隐藏

    // 当前主题名称（用于Arena上下两套血条风格）
    private themeName: string = 'default';
    
    onLoad() {
        this.initializeHPBar();
    }
    
    /**
     * 初始化血条
     */
    private initializeHPBar(): void {
        if (this.progressBar) {
            this.progressBar.progress = 1.0; // 初始满血
        }
        
        if (this.bossNameLabel) {
            this.bossNameLabel.string = "";
        }
        
        if (this.bossHPLayerLabel) {
            this.bossHPLayerLabel.string = "x5";
        }
        
        this.updateBarColor();
    }
    
    /**
     * 设置boss信息
     * @param name boss名称
     * @param maxHP boss最大血量
     * @param layerCount 血条层数
     */
    public setBossInfo(name: string, maxHP: number, layerCount: number = 5): void {
        this.bossName = name;
        this.maxHP = maxHP;
        this.currentHP = maxHP;
        this.maxHPLayers = Math.max(1, layerCount);
        this.currentHPLayer = this.maxHPLayers;
        this.hpPerLayer = Math.floor(maxHP / this.maxHPLayers);
        
        this.updateUI();
    }
    
    /**
     * 设置血条层数颜色列表
     * @param colors 颜色数组，从第1层到最高层
     */
    public setLayerColors(colors: Color[]): void {
        if (colors && colors.length > 0) {
            this.layerColors = [...colors];
            this.updateBarColor();
        }
    }

    /**
     * 应用血条主题风格
     * 可选值：'arenaTop' | 'arenaBottom' | 'default'
     */
    public applyTheme(theme: 'arenaTop' | 'arenaBottom' | 'default' = 'default'): void {
        this.themeName = theme;

        // 根据主题设置颜色风格与标签颜色
        if (theme === 'arenaTop') {
            // 上路Boss：冷色系（蓝/青/紫）更贴近天空区域视觉
            this.setLayerColors([
                new Color(0, 180, 255, 255),   // 1 层 - 天蓝
                new Color(0, 150, 255, 255),   // 2 层 - 亮蓝
                new Color(0, 120, 255, 255),   // 3 层 - 深蓝
                new Color(0, 200, 200, 255),   // 4 层 - 青蓝
                new Color(80, 220, 220, 255),  // 5 层 - 淡青
                new Color(140, 120, 255, 255), // 6 层 - 紫蓝
                new Color(170, 80, 255, 255),  // 7 层 - 亮紫
            ]);
            if (this.bossNameLabel) this.bossNameLabel.color = new Color(200, 230, 255, 255);
            if (this.bossHPLayerLabel) this.bossHPLayerLabel.color = new Color(200, 230, 255, 255);
        } else if (theme === 'arenaBottom') {
            // 下路Boss：暖色系（红/橙/黄）更贴近地面战斗氛围
            this.setLayerColors([
                new Color(255, 60, 60, 255),   // 1 层 - 鲜红
                new Color(255, 100, 60, 255),  // 2 层 - 红橙
                new Color(255, 140, 60, 255),  // 3 层 - 橙
                new Color(255, 180, 60, 255),  // 4 层 - 金黄
                new Color(255, 210, 80, 255),  // 5 层 - 亮黄
                new Color(255, 230, 120, 255), // 6 层 - 柔黄
                new Color(255, 180, 120, 255), // 7 层 - 橙黄
            ]);
            if (this.bossNameLabel) this.bossNameLabel.color = new Color(255, 230, 200, 255);
            if (this.bossHPLayerLabel) this.bossHPLayerLabel.color = new Color(255, 230, 200, 255);
        } else {
            // 默认：沿用当前颜色
            if (this.bossNameLabel) this.bossNameLabel.color = new Color(255, 255, 255, 255);
            if (this.bossHPLayerLabel) this.bossHPLayerLabel.color = new Color(255, 255, 255, 255);
            this.updateBarColor();
        }
    }
    
    /**
     * 更新boss血量
     * @param currentHP 当前血量
     */
    public updateHP(currentHP: number): void {
        this.currentHP = Math.max(0, currentHP);
        
        // 计算当前是第几层血条
        const newLayer = Math.ceil(this.currentHP / this.hpPerLayer);
        this.currentHPLayer = Math.max(1, Math.min(newLayer, this.maxHPLayers));
        
        this.updateUI();
    }
    
    /**
     * 外部更新boss数据的接口
     * @param name boss名称
     * @param currentHP 当前血量
     * @param maxHP 最大血量
     */
    public updateBossData(name: string, currentHP: number, maxHP: number): void {
        // 如果有updateBossData调用，则显示血条并重置隐藏计时器
        this.show();
        this.hideTimer = 0;
        
        // 如果最大血量发生变化，重新计算层数配置
        if (this.maxHP !== maxHP) {
            this.maxHP = maxHP;
            this.hpPerLayer = Math.floor(maxHP / this.maxHPLayers);
        }
        
        // 更新boss名称
        this.bossName = name;
        
        // 更新当前血量
        this.currentHP = Math.max(0, currentHP);
        
        // 计算当前是第几层血条
        const newLayer = Math.ceil(this.currentHP / this.hpPerLayer);
        this.currentHPLayer = Math.max(1, Math.min(newLayer, this.maxHPLayers));
        
        // 更新UI显示
        this.updateUI();
    }
    
    /**
     * 更新UI显示
     */
    public updateUI(): void {
        this.updateProgressBar();
        this.updateNameLabel();
        this.updateLayerLabel();
        this.updateBarColor();
    }
    
    /**
     * 更新进度条
     */
    private updateProgressBar(): void {
        if (!this.progressBar) return;
        
        // 计算当前层的血量进度
        const layerMinHP = (this.currentHPLayer - 1) * this.hpPerLayer;
        const layerMaxHP = this.currentHPLayer * this.hpPerLayer;
        const layerCurrentHP = Math.min(this.currentHP, layerMaxHP);
        
        let progress = 0;
        if (layerMaxHP > layerMinHP) {
            progress = (layerCurrentHP - layerMinHP) / (layerMaxHP - layerMinHP);
        }
        
        this.progressBar.progress = Math.max(0, Math.min(1, progress));
    }
    
    /**
     * 更新boss名称标签
     */
    private updateNameLabel(): void {
        if (this.bossNameLabel) {
            this.bossNameLabel.string = this.bossName;
        }
    }
    
    /**
     * 更新血条层数标签
     */
    private updateLayerLabel(): void {
        if (this.bossHPLayerLabel) {
            this.bossHPLayerLabel.string = `x${this.currentHPLayer}`;
        }
    }
    
    /**
     * 更新血条颜色
     */
    private updateBarColor(): void {
        if (!this.bar) return;
        
        // bar显示当前层的颜色
        const barColorIndex = Math.max(0, this.currentHPLayer - 1);
        const barColor = this.layerColors[barColorIndex];
        
        // 设置bar节点颜色
        const barSprite = this.bar.getComponent(Sprite);
        if (barSprite) {
            barSprite.color = new Color(barColor.r, barColor.g, barColor.b, barColor.a);
        }
        
        // 设置背景血条颜色
        if (this.backgroundBar) {
            const backgroundSprite = this.backgroundBar.getComponent(Sprite);
            if (backgroundSprite) {
                if (this.currentHPLayer <= 1) {
                    // 最后一层，背景设置为黑色透明
                    backgroundSprite.color = new Color(0, 0, 0, 0);
                } else {
                    // 背景显示下一层（更低层）的颜色
                    const bgColorIndex = Math.max(0, this.currentHPLayer - 2);
                    const bgColor = this.layerColors[bgColorIndex];
                    backgroundSprite.color = new Color(bgColor.r, bgColor.g, bgColor.b, bgColor.a);
                }
            }
        }
    }
    
    /**
     * 获取当前血量百分比
     */
    public getHPPercentage(): number {
        return this.maxHP > 0 ? this.currentHP / this.maxHP : 0;
    }
    
    /**
     * 获取当前层数
     */
    public getCurrentLayer(): number {
        return this.currentHPLayer;
    }
    
    /**
     * 获取最大层数
     */
    public getMaxLayers(): number {
        return this.maxHPLayers;
    }
    
    /**
     * 是否已经死亡（血量为0）
     */
    public isDead(): boolean {
        return this.currentHP <= 0;
    }
    
    /**
     * 显示血条
     */
    public show(): void {
        this.node.active = true;
    }
    
    /**
     * 隐藏血条
     */
    public hide(): void {
        this.node.active = false;
    }
    
    /**
     * 重置血条到满血状态
     */
    public reset(): void {
        this.currentHP = this.maxHP;
        this.currentHPLayer = this.maxHPLayers;
        // this.updateUI();
    }
    
    /**
     * 5秒没更新自动隐藏
     */
    update(dt: number): void {
        if (this.node.active && this.maxHP > 0) {
            this.hideTimer += dt;
            
            if (this.hideTimer >= this.HIDE_DELAY) {
                this.hide();
                this.hideTimer = 0;
            }
        }
    }
    

    


    
   
    

}