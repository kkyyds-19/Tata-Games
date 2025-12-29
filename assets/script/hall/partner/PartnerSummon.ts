import { _decorator, Component, Node, Button, Prefab, instantiate, resources, director, BlockInputEvents, Label, game, Color, UIOpacity, tween, Vec3, UITransform } from 'cc';
import { ShowToast } from '../../global/Toast';
import { HttpClient } from '../../http/HttpClient';
import { MonsterRefresh } from './MonsterRefresh';
import { PartnerMainPanel } from './PartnerMainPanel';
import { UserPartnerData } from '../../user/UserPartnerData';
const { ccclass, property } = _decorator;

@ccclass('PartnerSummon')
export class PartnerSummon extends Component {

    //返回
    @property({ type: Button })
    public backButton: Button = null;

    //伙伴
    @property({ type: Button })
    public openPartnerButton: Button = null;

    @property({ type: Button })
    public refreshSummonButton: Button = null;

    @property({ type: Button })
    public freeRefreshButton: Button = null;

    @property({ type: Label })
    public freeRefreshLabel: Label = null;

    //召唤按钮
    @property({ type: Button })
    public summonButton: Button = null;

    @property({ type: MonsterRefresh }) 
    public monsterRefresh: MonsterRefresh = null;

    //召唤石
    @property({ type: Label })
    public summonOrbLabel: Label = null;

    //刷新石
    @property({ type: Label })
    public ancientOrbLabel: Label = null;

    private _summonSuccessPopup: Node | null = null;
    private _freeRefreshUsed: number = 0;
    private _freeRefreshLimit: number = 3;
    private _summonOrbCount: number = 0;
    private _ancientOrbCount: number = 0;

    start() {
        // 在当前面板节点上添加阻止穿透组件，避免下层被点击
        // 并将本节点置于父节点最顶层，确保点击优先级最高
        try {
            this.node.addComponent(BlockInputEvents);
            if (this.node.parent) {
                this.node.setSiblingIndex(this.node.parent.children.length - 1);
            }
        } catch {}

        if (this.backButton) {
            this.backButton.node.on(Button.EventType.CLICK, this.goBackToMain, this);
        }
        if (this.openPartnerButton) {
            this.openPartnerButton.node.on(Button.EventType.CLICK, this.openPartnerMain, this);
        }
        if (this.refreshSummonButton) {
            this.refreshSummonButton.node.on(Button.EventType.CLICK, this.onRefreshSummon, this);
        }
        if (this.freeRefreshButton) {
            this.freeRefreshButton.node.on(Button.EventType.CLICK, this.onFreeRefreshSummon, this);
        }
        if (this.summonButton) {
            this.summonButton.node.on(Button.EventType.CLICK, this.onSummon, this);
        }

        if (!this.monsterRefresh) {
            const comps = this.node.getComponentsInChildren(MonsterRefresh);
            if (comps && comps.length > 0) this.monsterRefresh = comps[0];
        }

        this.initFreeRefreshCounter();
        this.updateFreeRefreshLabel();
        this.initOrbDisplay();
    }

    onEnable() {
        // 每次界面激活时都刷新数据
        this.initOrbDisplay();
    }

    /**
     * 初始化宝珠显示（先显示加载中，再异步获取真实数据）
     */
    private async initOrbDisplay() {
        // 显示加载中状态
        if (this.summonOrbLabel && this.summonOrbLabel.isValid) {
            this.summonOrbLabel.string = '...';
        }
        if (this.ancientOrbLabel && this.ancientOrbLabel.isValid) {
            this.ancientOrbLabel.string = '...';
        }
        
        // 异步获取真实数据
        await this.syncOrbLabels();
    }

    private goBackToMain() {
        this.openPartnerMain();
    }

    private openPartnerMain() {
        try {
            director.emit(game.gameEvent.GAME_PARTNER_MAIN_PAGE_SHOW);
            this.node.active = false;
        } catch {}
    }

    private async onRefreshSummon() {
        if (this._ancientOrbCount <= 0) { 
            this.showToastOnTop('❌ 刷新失败，材料不足！需要1个远古宝珠'); 
            return; 
        }
        const client = HttpClient.getInstance();
        if (this.refreshSummonButton) this.refreshSummonButton.interactable = false;
        
        try {
            const resp: any = await client.post('/api/user/partner/refresh', {});
            
            // 检查响应是否成功
            const success = resp && (
                (resp.success && resp.data) || 
                (resp.data && resp.data.code === 200)
            );
            
            if (success) {
                const scene = director.getScene();
                const comps = scene.getComponentsInChildren(MonsterRefresh);
                if (comps && comps.length > 0) {
                   for (const c of comps) {
                        c.refreshList();
                    }
                }
                // 本地扣除刷新石（默认每次消耗1个）并更新显示
                this._ancientOrbCount = Math.max(0, this._ancientOrbCount - 1);
                this.updateOrbLabelsLocal();
                this.showToastOnTop('✨ 刷新成功！');
            } else {
                this.showToastOnTop('❌ 刷新失败，请稍后重试');
            }
        } catch (error) {
            console.error('刷新失败:', error);
            this.showToastOnTop('❌ 刷新失败，网络错误');
        } finally {
            if (this.refreshSummonButton) this.refreshSummonButton.interactable = true;
        }
    }

    private async onFreeRefreshSummon() {
        const remaining = this._freeRefreshLimit - this._freeRefreshUsed;
        if (remaining <= 0) { 
            this.showToastOnTop('❌ 刷新失败，免费次数已用完'); 
            return; 
        }
        const client = HttpClient.getInstance();
        if (this.freeRefreshButton) this.freeRefreshButton.interactable = false;
        try {
            const resp: any = await client.post('/api/user/partner/refresh', {});
            const ok = !!(resp && ((resp.success && resp.data) || (resp.data && resp.data.code === 200 && resp.data.data === 1)));
            const scene = director.getScene();
            const comps = scene.getComponentsInChildren(MonsterRefresh);
            if (comps && comps.length > 0) {
               for (const c of comps) {
                    c.refreshList();
                }
            }
            if (ok) {
                this._freeRefreshUsed += 1;
                this.persistFreeRefreshCounter();
                this.updateFreeRefreshLabel();
                this.showToastOnTop('✨ 免费刷新成功');
            } else {
                this.showToastOnTop('❌ 免费刷新失败');
            }
        } catch (error) {
            console.error('免费刷新失败:', error);
            this.showToastOnTop('❌ 免费刷新失败，网络错误');
        } finally {
            if (this.freeRefreshButton) this.freeRefreshButton.interactable = true;
        }
    }

    /**
     * 显示Toast并确保在最顶层
     */
    private showToastOnTop(message: string) {
        console.log('PartnerSummon: 显示Toast -', message);
        
        // 方案1: 使用全局Toast
        try {
            ShowToast(message);
        } catch (e) {
            console.error('ShowToast失败:', e);
        }
        
        // 方案2: 创建临时顶层Toast节点（备用方案，确保一定能看到）
        this.scheduleOnce(() => {
            try {
                const canvas = director.getScene()?.getChildByName('Canvas');
                if (!canvas) {
                    console.warn('未找到Canvas节点');
                    return;
                }
                
                // 创建临时Toast容器节点
                const toastNode = new Node('TempToast');
                const uiTransform = toastNode.addComponent(UITransform);
                uiTransform.setContentSize(600, 80);
                
                // 添加透明度组件用于淡入淡出
                const uiOpacity = toastNode.addComponent(UIOpacity);
                uiOpacity.opacity = 0;
                
                // 创建Label
                const label = toastNode.addComponent(Label);
                if (label) {
                    label.string = message;
                    label.fontSize = 36;
                    label.lineHeight = 45;
                    label.overflow = Label.Overflow.SHRINK;
                    label.horizontalAlign = Label.HorizontalAlign.CENTER;
                    label.verticalAlign = Label.VerticalAlign.CENTER;
                    
                    // 根据消息类型设置颜色
                    if (message.includes('成功') || message.includes('🎉') || message.includes('✨')) {
                        label.color = new Color(100, 255, 100, 255); // 绿色
                    } else if (message.includes('失败') || message.includes('❌')) {
                        label.color = new Color(255, 100, 100, 255); // 红色
                    } else {
                        label.color = new Color(255, 255, 255, 255); // 白色
                    }
                    
                    // 添加到Canvas的最顶层
                    canvas.addChild(toastNode);
                    toastNode.setSiblingIndex(canvas.children.length - 1);
                    toastNode.setPosition(0, 200, 0);
                    
                    console.log('PartnerSummon: 创建临时Toast节点成功，层级:', toastNode.getSiblingIndex());
                    
                    // 淡入 + 上移 + 淡出动画
                    tween(uiOpacity)
                        .to(0.3, { opacity: 255 })
                        .delay(1.5)
                        .to(0.5, { opacity: 0 })
                        .start();
                    
                    tween(toastNode)
                        .by(2.3, { position: new Vec3(0, 150, 0) })
                        .call(() => {
                            if (toastNode && toastNode.isValid) {
                                toastNode.destroy();
                                console.log('PartnerSummon: Toast节点已销毁');
                            }
                        })
                        .start();
                }
            } catch (e) {
                console.error('创建临时Toast失败:', e);
            }
        }, 0.05);
    }

    private async onSummon() {
        if (this._summonOrbCount <= 0) { 
            this.showToastOnTop('❌ 召唤失败，材料不足'); 
            return; 
        }
        const mr = this.monsterRefresh || director.getScene().getComponentsInChildren(MonsterRefresh)[0];
        if (!mr) return;
        const selectedId = mr.getSelectedSummonId();
        const fallbackId = mr.getDefaultSummonId();
        const id = selectedId || fallbackId;
        if (!id) { 
            this.showToastOnTop('❌ 请先选择要召唤的伙伴'); 
            return; 
        }
        const cost = mr.getSelectedSummonCost();
        
        if (cost > this._summonOrbCount) {
            this.showToastOnTop(`❌ 召唤失败，材料不足！需要${cost}个唤灵宝珠，当前只有${this._summonOrbCount}个`);
            return;
        }
        
        const client = HttpClient.getInstance();
        if (this.summonButton) this.summonButton.interactable = false;
        try {
            const resp: any = await client.post('/api/user/partner', { id });
            
            // 检查响应是否成功
            const success = resp && (
                (resp.success && resp.data) || 
                (resp.data && resp.data.code === 200)
            );
            
            if (success) {
                director.emit(game.gameEvent.GAME_PARTNER_EDITOR_PAGE_REFRESH);
                mr.hideSummonedByItemId(id);
                // 本地扣除召唤石并更新显示
                if (cost > 0) {
                    this._summonOrbCount = Math.max(0, this._summonOrbCount - cost);
                    this.updateOrbLabelsLocal();
                }
                // 延迟显示成功提示，确保在最顶层
                this.scheduleOnce(() => {
                    this.showToastOnTop('🎉 召唤成功！新伙伴已加入队伍');
                }, 0.1);
            } else {
                this.showToastOnTop('❌ 召唤失败，请稍后重试');
            }
        } catch (error) {
            console.error('召唤失败:', error);
            this.showToastOnTop('❌ 召唤失败，网络错误');
        } finally {
            if (this.summonButton) this.summonButton.interactable = true;
        }
    }

    private async syncOrbLabels() {
        try {
            const client = HttpClient.getInstance();
            const resp: any = await client.get('/api/user/home');
            
            console.log('PartnerSummon: 获取用户数据', resp);
            
            // 正确的数据路径：resp.data.data
            const data = resp && resp.data && resp.data.data ? resp.data.data : null;
            
            if (data) {
                const summonOrb = typeof data.summonOrb === 'number' ? data.summonOrb : 0;
                const ancientOrb = typeof data.ancientOrb === 'number' ? data.ancientOrb : 0;
                
                console.log('PartnerSummon: 召唤石数量', summonOrb, '刷新石数量', ancientOrb);
                
                this._summonOrbCount = summonOrb;
                this._ancientOrbCount = ancientOrb;
                this.updateOrbLabelsLocal();
            } else {
                console.warn('PartnerSummon: 获取用户数据失败，数据为空');
                // 如果获取失败，显示0而不是...
                this._summonOrbCount = 0;
                this._ancientOrbCount = 0;
                this.updateOrbLabelsLocal();
            }
        } catch (error) {
            console.error('PartnerSummon: 获取用户数据异常', error);
            // 异常时显示0
            this._summonOrbCount = 0;
            this._ancientOrbCount = 0;
            this.updateOrbLabelsLocal();
        }
    }

    private updateOrbLabelsLocal(): void {
        if (this.summonOrbLabel && this.summonOrbLabel.isValid) {
            this.summonOrbLabel.string = `${this._summonOrbCount}`;
        }
        if (this.ancientOrbLabel && this.ancientOrbLabel.isValid) {
            this.ancientOrbLabel.string = `${this._ancientOrbCount}`;
        }
    }

    update(deltaTime: number) {}

    private showSummonSuccessPopup(text: string): void {
        ShowToast(text);
    }

    private showLargeMaterialPopup(text: string): void {
        ShowToast(text);
    }

    private initFreeRefreshCounter(): void {
        const today = this.getTodayKey();
        const savedDay = localStorage.getItem('PartnerSummon.freeRefresh.day') || '';
        if (savedDay !== today) {
            this._freeRefreshUsed = 0;
            localStorage.setItem('PartnerSummon.freeRefresh.day', today);
            localStorage.setItem('PartnerSummon.freeRefresh.used', '0');
        } else {
            const v = parseInt(localStorage.getItem('PartnerSummon.freeRefresh.used') || '0');
            this._freeRefreshUsed = isNaN(v) ? 0 : v;
        }
    }

    private persistFreeRefreshCounter(): void {
        localStorage.setItem('PartnerSummon.freeRefresh.day', this.getTodayKey());
        localStorage.setItem('PartnerSummon.freeRefresh.used', String(this._freeRefreshUsed));
    }

    private updateFreeRefreshLabel(): void {
        const remaining = Math.max(0, this._freeRefreshLimit - this._freeRefreshUsed);
        if (this.freeRefreshLabel && this.freeRefreshLabel.isValid) {
            this.freeRefreshLabel.string = `免费次数（${remaining}/${this._freeRefreshLimit}）`;
        }
    }

    private getTodayKey(): string {
        const d = new Date();
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${y}${m}${day}`;
    }
}


