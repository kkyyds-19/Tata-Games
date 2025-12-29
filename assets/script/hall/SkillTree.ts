import { _decorator, Component, Node, ScrollView, Layout, Prefab, instantiate, UITransform, Vec2 } from 'cc';
import { SkillLeaf } from './SkillLeaf';
import { UserTechTreeData } from '../user/UserTechTreeData';
import { GameConfig } from '../global/config/GameConfig';
const { ccclass, property } = _decorator;

/**
 * 技能树组件
 * 管理整个技能树的滚动视图和子节点
 * 优化版本：直接使用content的所有子节点作为SkillLeaf节点
 */
@ccclass('SkillTree')
export class SkillTree extends Component {

    @property(ScrollView)
    scrollView: ScrollView = null;

    @property(Node)
    content: Node = null;

    // 私有属性
    private _techTreeData: UserTechTreeData = null;
    private _isInitialized: boolean = false;
    
    // 虚拟滚动相关属性
    private _nodeHeight: number = 750;        // 每个节点的高度
    private _visibleNodeCount: number = 4;    // 一屏显示的节点数量
    private _bufferNodeCount: number = 1;     // 缓冲区节点数量（上下各1个）
    
    // 优化相关属性
    private _lastContentY: number = 0;        // 上次计算时的content.y位置
    private _updateThreshold: number = 100;   // 移动阈值，超过此值才重新计算
    private _lastVisibleRange: { start: number, end: number } = { start: -1, end: -1 }; // 上次的可见范围

    onLoad() {
        this._techTreeData = UserTechTreeData.getInstance();
    }

    start() {
        this.initializeSkillLeafNodes();

        if (!this._isInitialized) {
            this.refreshAllNodes();
            this._isInitialized = true;
        }
        this.goToLevel();
    }

    /**
     * 滚动视图回调处理函数
     * 根据content.y位置计算显示哪些节点
     */
    private scrollview_roll_callback(data: any) {
        this.updateNodeVisibilityByContentY();
    }



    private goToLevel(): void {
        // this.scrollToLevel(20);
       this.scrollToCurrent(-750);
    }

    /**
     * 根据content.y位置更新节点可见性（优化版本）
     */
    private updateNodeVisibilityByContentY(): void {
        if (!this.content) return;

        const skillLeafNodes = this.getSkillLeafNodes();
        if (skillLeafNodes.length === 0) return;

        // 获取content的Y位置（向下滑动为负数）
        const contentY = this.content.y;
        
        // 检查是否需要更新（移动距离是否超过阈值）
        const deltaY = Math.abs(contentY - this._lastContentY);
        if (deltaY < this._updateThreshold && this._lastVisibleRange.start !== -1) {
            // 移动距离不够，跳过计算
            return;
        }
        
        // 计算当前应该显示的起始节点索引
        const startIndex = Math.max(0, Math.floor(-contentY / this._nodeHeight));
        
        // 计算结束索引（包含缓冲区）
        const endIndex = Math.min(
            skillLeafNodes.length - 1,
            startIndex + this._visibleNodeCount + this._bufferNodeCount
        );

        // 检查可见范围是否发生变化
        if (this._lastVisibleRange.start === startIndex && this._lastVisibleRange.end === endIndex) {
            // 可见范围没有变化，跳过更新
            return;
        }

        // 更新所有节点的可见性
        for (let i = 0; i < skillLeafNodes.length; i++) {
            const skillLeaf = skillLeafNodes[i];
            if (!skillLeaf || !skillLeaf.node) continue;

            const shouldBeVisible = i >= startIndex && i <= endIndex;
            
            // 只在状态改变时更新，避免频繁操作
            if (skillLeaf.node.active !== shouldBeVisible) {
                skillLeaf.node.active = shouldBeVisible;
            }
        }

        // 更新缓存值
        this._lastContentY = contentY;
        this._lastVisibleRange.start = startIndex;
        this._lastVisibleRange.end = endIndex;

        // 调试信息（可选，可以注释掉）
        console.log(`SkillTree: content.y=${contentY}, 显示节点 ${startIndex} 到 ${endIndex} (总共${skillLeafNodes.length}个)`);
    }

    /**
     * 强制更新节点可见性（忽略阈值检查）
     */
    private forceUpdateNodeVisibility(): void {
        // 重置缓存，强制下次更新
        this._lastVisibleRange.start = -1;
        this._lastVisibleRange.end = -1;
        this._lastContentY = this.content ? this.content.y - this._updateThreshold - 1 : 0;
        
        this.updateNodeVisibilityByContentY();
    }

    /**
     * 初始化技能叶子节点
     */
    private initializeSkillLeafNodes(): void {
        if (!this.content) {
            console.warn('SkillTree: 缺少内容节点');
            return;
        }

        // 为每个SkillLeaf节点设置对应的等级
        this.assignLevelsToNodes();

        const skillLeafNodes = this.getSkillLeafNodes();
        console.log(`SkillTree: 初始化完成，共${skillLeafNodes.length}个技能叶子节点`);
        
        // 初始化时强制更新一次
        this.forceUpdateNodeVisibility();
    }

    /**
     * 获取所有SkillLeaf节点
     */
    private getSkillLeafNodes(): SkillLeaf[] {
        const skillLeafNodes: SkillLeaf[] = [];
        const children = this.content.children;
        
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const skillLeaf = child.getComponent(SkillLeaf);
            if (skillLeaf) {
                skillLeafNodes.push(skillLeaf);
            }
        }
        
        return skillLeafNodes;
    }

    /**
     * 为节点分配等级
     */
    private assignLevelsToNodes(): void {
        const nodesPerLeaf = 2; // 每个SkillLeaf显示2个等级
        const skillLeafNodes = this.getSkillLeafNodes();
        
        for (let i = 0; i < skillLeafNodes.length; i++) {
            const skillLeaf = skillLeafNodes[i];
            if (!skillLeaf || !skillLeaf.isValid) continue;

            const lowLevel = i * nodesPerLeaf + 1;
            const highLevel = lowLevel + 1;

            // 设置等级
            skillLeaf.setLevels(lowLevel, highLevel);
            
            // 设置节点名称（便于调试）
            skillLeaf.node.name = `SkillLeaf_${lowLevel}_${highLevel}`;
        }
        
        console.log(`SkillTree: 为${skillLeafNodes.length}个节点分配等级完成`);
    }

    /**
     * 刷新所有技能叶子节点
     */
    public refreshAllNodes(): void {
        const skillLeafNodes = this.getSkillLeafNodes();
        let refreshCount = 0;
        
        skillLeafNodes.forEach((skillLeaf, index) => {
            if (skillLeaf && skillLeaf.isValid) {
                skillLeaf.updateUI();
                refreshCount++;
            }
        });
        
        console.log(`SkillTree: 刷新完成，共刷新${refreshCount}个节点`);
        
        // 刷新后强制更新节点可见性
        this.forceUpdateNodeVisibility();
    }

    /**
     * 显示技能树
     */
    public show(): void {
        this.node.active = true;
        // 只有在未初始化时才刷新
        if (!this._isInitialized) {
            this.refreshAllNodes();
            this._isInitialized = true;
        } else {
            // 已初始化时也要强制更新节点可见性
            this.forceUpdateNodeVisibility();
        }
    }

    /**
     * 隐藏技能树
     */
    public hide(): void {
        this.node.active = false;
    }

    /**
     * 滚动到当前等级
     * @param off 偏移量，正数向上偏移，负数向下偏移
     */
    public scrollToCurrent(off: number = 0): void {
        if (!this._techTreeData) return;
        
        // 获取当前最高激活等级
        const currentLevel = this.getCurrentMaxLevel();
        this.scrollToLevel(currentLevel, off);
    }

    /**
     * 滚动到指定等级
     * @param level 目标等级
     * @param off 偏移量，正数向上偏移，负数向下偏移
     */
    public scrollToLevel(level: number, off: number = 0): void {
        if (!this.scrollView || !this.content) return;

        const nodeIndex = Math.floor((level - 1) / 2); // 每个节点显示2个等级
        const skillLeafNodes = this.getSkillLeafNodes();
        
        if (nodeIndex >= 0 && nodeIndex < skillLeafNodes.length) {
            // 计算目标节点的位置
            // 每个节点高度750像素，从上到下排列
            const targetNodeY = nodeIndex * this._nodeHeight; // 目标节点距离顶部的距离
            
            // 应用偏移量
            const targetY = targetNodeY + off;
            
            // 获取content的总高度和scrollView的可视高度
            const contentTransform = this.content.getComponent(UITransform);
            const viewTransform = this.scrollView.node.getComponent(UITransform);
            const contentHeight = contentTransform?.contentSize.height || 0;
            const viewHeight = viewTransform?.contentSize.height || 0;
            
            // 计算滚动百分比 (0-1)
            // 滚动百分比 = 目标位置 / (总高度 - 可视高度)
            const maxScrollDistance = Math.max(0, contentHeight - viewHeight);
            let scrollPercent = 0;
            
            if (maxScrollDistance > 0) {
                scrollPercent = Math.max(0, Math.min(1, targetY / maxScrollDistance));
            }
            
            // 使用scrollToPercentVertical滚动
            this.scrollView.scrollToPercentVertical(scrollPercent, 0.5);
            
            console.log(`SkillTree: 滚动到等级${level}，节点索引${nodeIndex}，目标位置${targetY}px，滚动百分比${scrollPercent.toFixed(3)}，偏移${off}px`);
            
            // 滚动后强制更新节点可见性
            this.scheduleOnce(() => {
                this.forceUpdateNodeVisibility();
            }, 0.1);
        }
    }

    /**
     * 获取当前最高激活等级
     */
    private getCurrentMaxLevel(): number {
        if (!this._techTreeData) return 1;
        
        const levels = this._techTreeData.getCurrentLevels();
        return Math.max(levels.attack, levels.defense, levels.health, levels.skill);
    }
} 