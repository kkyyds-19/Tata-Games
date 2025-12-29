import { _decorator, Component, Node, Label, Prefab, instantiate, sys, Button, director, game, Sprite, resources, UITransform, view } from 'cc';


import { UserInfoData } from '../../user/UserInfoData';
import { Hall } from '../hall';
import { PkItem } from './PkItem';
import { PkItem1 } from './PkItem1';
import { rankingAPI } from '../../api/RankingAPI';
import { RankingInfo } from '../../api/APITypes';
import { HttpClient } from '../../http/HttpClient';
import { ChallengeLogDialog } from './ChallengeLogDialog';

const { ccclass, property } = _decorator;
@ccclass('PkMain')
export class PkMain extends Component {
 
      // ==================== UI 属性 ====================
     
     @property({ type: Label, tooltip: "钻石数量标签" })
     public diamondLabel: Label = null;

    @property({ type: Label, tooltip: "荣誉积分数量标签" })
    public honorLabel: Label = null;
    @property({ type: Label, tooltip: "今日挑战次数标签" })
    public dailyChallengeLabel: Label = null;
 
 
     @property({ type: Prefab, tooltip: "PK段落(Item)的预制体" })
     public pkItemPrefab: Prefab = null;
 
    @property({ type: Prefab, tooltip: "PK子项（pk_item1）预制体" })
    public pkItem1Prefab: Prefab = null;

    @property({ type: Prefab, tooltip: "PK物品商店预制体" })
    public pkItemStorePrefab: Prefab = null;
 
    @property({ type: Node, tooltip: "滚动列表的容器节点" })
    public scrollContent: Node = null;
    @property({ type: Node, tooltip: "刷新五个按钮" })
    public refreshFiveButton: Node = null;

    private hallInstance: Hall = null;
    private rankingData: RankingInfo[] = [];
    private pageNum: number = 1;
    private pageSize: number = 5;
    private totalPages: number = 1;

    // ========== 每日战力稳定性工具 ==========
    private getTodayKey(): string {
        const d = new Date();
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');
        return `${d.getFullYear()}${mm}${dd}`;
    }

    private getDailySeed(): number {
        const keyDate = 'pk_power_seed_date';
        const keyValue = 'pk_power_seed_value';
        const today = this.getTodayKey();
        const lastDate = sys.localStorage.getItem(keyDate);
        if (lastDate === today) {
            const v = sys.localStorage.getItem(keyValue);
            return v ? parseInt(v, 10) : 0;
        }
        const newSeed = Math.floor(Math.random() * 0x7fffffff);
        sys.localStorage.setItem(keyDate, today);
        sys.localStorage.setItem(keyValue, String(newSeed));
        return newSeed;
    }

    private getDailyChallengeLimit(): number {
        return 5;
    }

    private getDailyChallengeRemaining(): number {
        const limit = this.getDailyChallengeLimit();
        const kDate = 'pk_daily_challenge_date';
        const kRemain = 'pk_daily_challenge_remaining';
        const today = this.getTodayKey();
        const lastDate = sys.localStorage.getItem(kDate);
        let remain = parseInt(sys.localStorage.getItem(kRemain) || '', 10);
        if (!lastDate || lastDate !== today) {
            sys.localStorage.setItem(kDate, today);
            remain = limit;
            sys.localStorage.setItem(kRemain, String(remain));
        }
        return remain < 0 ? 0 : remain;
    }

    private setDailyChallengeRemaining(val: number): void {
        const v = Math.max(0, val);
        sys.localStorage.setItem('pk_daily_challenge_remaining', String(v));
    }

    private updateChallengeCountLabel(): void {
        const lbl = this.dailyChallengeLabel
            || this.findLabelByNameHints(this.node, ['今日','挑战','次数'])
            || this.findLabelByNameHints(director.getScene(), ['今日','挑战','次数']);
        if (!lbl) return;
        const remain = this.getDailyChallengeRemaining();
        const max = this.getDailyChallengeLimit();
        lbl.string = `今日挑战次数：${remain}/${max}`;
        this.dailyChallengeLabel = lbl;
    }

    private getDailyStablePower(idx: number): number {
        const seed = this.getDailySeed();
        const mix = (seed ^ (idx * 1103515245)) >>> 0; // 线性同余混合保证分布
        return (mix % 100000) + 1; // 1..100000
    }

    // 每日稳定的荣誉积分（与战力分离）：范围 1..5000，随当日和索引稳定变化
    private getDailyStableHonor(idx: number): number {
        const seed = this.getDailySeed();
        const mix = (seed ^ (idx * 1013904223)) >>> 0; // 线性同余混合（不同常数）
        return (mix % 5000) + 1; // 1..5000
    }

    private getDailyStableName(idx: number): string {
        const seed = this.getDailySeed();
        const mix = (seed ^ (idx * 1664525)) >>> 0;
        const family = ['张','李','王','赵','刘','陈','杨','黄','周','吴','徐','孙','胡','朱','高'];
        const given = ['伟','芳','娜','敏','静','丽','强','磊','洋','勇','军','杰','娟','涛','超','梅','霞','飞'];
        const f = family[mix % family.length];
        const g = given[(mix >>> 8) % given.length];
        const num = ((mix >>> 16) % 10000).toString().padStart(4, '0');
        return `${f}${g}${num}`;
    }

    // 解析如 "36.2K" / "1.5M" / "35100" 的战力文本为数值
    private parsePowerText(text: string): number {
        if (!text) return 0;
        // 兼容多种前缀符号，如 "×35.9K"、"x35.9K"、"战力35.9K"，只保留数字、小数点和单位K/M
        const cleaned = String(text).toUpperCase().replace(/[^0-9KM\.]/g, '');
        if (!cleaned) return 0;
        // 判断末尾是否有单位
        const unitMatch = /[KM]$/.exec(cleaned);
        const unit = unitMatch ? unitMatch[0] : '';
        const numStr = unit ? cleaned.slice(0, -1) : cleaned;
        const val = parseFloat(numStr);
        if (isNaN(val)) return 0;
        if (unit === 'M') return Math.round(val * 1_000_000);
        if (unit === 'K') return Math.round(val * 1_000);
        return Math.round(val);
    }

    /**
     * 设置Hall实例引用
     * @param hall Hall实例
     */
    public setHallInstance(hall: Hall) {
        this.hallInstance = hall;
    }
 
     start() {
 
     }
 
     onLoad() {
         this.node.on(Node.EventType.TOUCH_START, ()=>{
             //点击吞噬
         }, this);
     }
 
    onEnable() {
        // 兜底绑定顶部货币标签，避免未在 Inspector 赋值导致不显示
        this.bindCurrencyLabels();
        this.refreshAll();
        // 监听用户信息更新事件，及时刷新货币显示（钻石、荣誉点）
        director.on(game.gameEvent.HALL_USER_INFO_UPDATE, this.updateCurrencyDisplay, this);
        this.bindChallengeLogButton();
        if (this.refreshFiveButton) {
            this.refreshFiveButton.off(Node.EventType.TOUCH_END, this.onRefreshFiveClicked, this);
            this.refreshFiveButton.on(Node.EventType.TOUCH_END, this.onRefreshFiveClicked, this);
        }
        this.bindPk30Button(this.node);
        this.updateChallengeCountLabel();
    }

    onDisable() {
        // 取消事件监听，避免无效回调和内存泄露
        director.off(game.gameEvent.HALL_USER_INFO_UPDATE, this.updateCurrencyDisplay, this);
    }
 
      // ==================== UI刷新 ====================
     
     /**
      * 刷新整个主面板
      */
     public refreshAll() {
         this.updateCurrencyDisplay();
         this.populateSkinBlocks();
     }
 
     /**
     * 更新货币显示
     */
    private updateCurrencyDisplay() {
        const userInfo = UserInfoData.getInstance();
        const diamond = userInfo.getDiamond();
        const honor = userInfo.getHonor();

        // 兜底：若标签尚未绑定，尝试重新绑定一次
        if (!this.diamondLabel || !this.honorLabel) {
            this.bindCurrencyLabels();
        }

        if (this.diamondLabel) {
            this.diamondLabel.string = diamond.toString();
        } else {
            console.warn('[PkMain] diamondLabel 未绑定，无法显示钻石');
        }

        if (this.honorLabel) {
            this.honorLabel.string = honor.toString();
        } else {
                console.warn('[PkMain] honorLabel 未绑定，无法显示荣誉积分');
        }
        console.log(`[PkMain] 刷新货币显示 diamond=${diamond}, honor=${honor}, diamondLabelBound=${!!this.diamondLabel}, honorLabelBound=${!!this.honorLabel}`);
        this.updateChallengeCountLabel();
    }

    /**
     * 如果未在 Inspector 绑定，尝试在当前节点或场景中自动绑定货币标签
     */
    private bindCurrencyLabels() {
        try {
            if (!this.diamondLabel) {
                this.diamondLabel = this.findLabelByNameHints(this.node, ['diamond', '钻石', 'currency_diamond'])
                    || this.findLabelByNameHints(director.getScene(), ['diamond', '钻石', 'currency_diamond']);
                if (this.diamondLabel) {
                    console.log('[PkMain] 自动绑定 diamondLabel 成功:', this.diamondLabel.node?.name);
                } else {
                    console.warn('[PkMain] 未能自动绑定 diamondLabel，建议在 Inspector 设置');
                }
            }

            if (!this.honorLabel) {
                // 先按名称提示查找
                this.honorLabel = this.findLabelByNameHints(this.node, ['honorPoints', 'honor', '荣誉', 'honour', 'honor_points'])
                    || this.findLabelByNameHints(director.getScene(), ['honorPoints', 'honor', '荣誉', 'honour', 'honor_points']);
                // 若仍为空，尝试依据荣誉图标（pk_23）寻找同级/附近的数字Label
                if (!this.honorLabel) {
                    this.honorLabel = this.findLabelNearIcon(this.node, ['pk_23'])
                        || this.findLabelNearIcon(director.getScene(), ['pk_23']);
                }
                if (this.honorLabel) {
                    console.log('[PkMain] 自动绑定 honorLabel 成功:', this.honorLabel.node?.name);
                } else {
                    console.warn('[PkMain] 未能自动绑定 honorLabel，建议在 Inspector 设置');
                }
            }
        } catch (e) {
            console.warn('[PkMain] 绑定货币标签失败', e);
        }
    }

    /**
     * 按名称提示在节点树内查找 Label
     */
    private findLabelByNameHints(root: Node | null, hints: string[]): Label | null {
        if (!root) return null;
        const queue: Node[] = [root];
        const lowerHints = (hints || []).map(h => h.toLowerCase());
        while (queue.length) {
            const curr = queue.shift()!;
            const name = (curr.name || '').toLowerCase();
            if (lowerHints.some(h => name.includes(h))) {
                const lbl = curr.getComponent(Label);
                if (lbl) return lbl;
            }
            const children = curr.children || [];
            for (let i = 0; i < children.length; i++) queue.push(children[i]);
        }
        return null;
    }

    /**
     * 根据图标SpriteFrame名称（例如荣誉图标 pk_23），寻找同级或父节点下的数字Label
     */
    private findLabelNearIcon(root: Node | null, iconNames: string[]): Label | null {
        if (!root) return null;
        const queue: Node[] = [root];
        const lowerIcons = (iconNames || []).map(n => n.toLowerCase());
        while (queue.length) {
            const curr = queue.shift()!;
            const spr = curr.getComponent(Sprite);
            const frameName = (spr && spr.spriteFrame && (spr.spriteFrame.name || '') || '').toLowerCase();
            const nodeName = (curr.name || '').toLowerCase();
            const isIconMatch = lowerIcons.some(k => frameName.includes(k) || nodeName.includes(k));
            if (isIconMatch) {
                // 优先同级寻找 Label
                const parent = curr.parent;
                if (parent) {
                    const siblings = parent.getComponentsInChildren(Label);
                    if (siblings && siblings.length > 0) {
                        // 返回最近一个Label（同级或直接子级）
                        const candidate = siblings.find(l => l.node !== curr);
                        if (candidate) return candidate;
                    }
                }
                // 其次在当前节点下寻找 Label
                const selfLabels = curr.getComponentsInChildren(Label);
                if (selfLabels && selfLabels.length > 0) {
                    return selfLabels[0];
                }
            }
            const children = curr.children || [];
            for (let i = 0; i < children.length; i++) queue.push(children[i]);
        }
        return null;
    }
     
 
     /**
      * 填充皮肤段落列表
      * 优先使用服务器战力排行榜数据；失败时回退到本地每日稳定伪数据
      */
    private async populateSkinBlocks() {
        if (!this.scrollContent || !this.pkItemPrefab) {
            console.warn("[PkMain] scrollContent或pkItemPrefab未设置");
            return;
        }

        this.scrollContent.removeAllChildren();
        
        // 统一数据结构与稀有度表
        const baseRarity = [6,5,4, 3, 2, 1];
        // power：战斗力；honor：荣誉积分（与战斗力分离显示）
        type Row = { type: 'pk' | 'pk1'; rarity: number; power: number; honor: number; name: string; sourceIdx: number; isPresetName?: boolean; originalPresetName?: string } & { rank?: number };
        const items: Row[] = [];

         // 优先尝试请求服务器荣誉排行榜数据
         let filledFromServer = false;
         try {
             // 确保基础URL已初始化
            HttpClient.getInstance().int();
            const resp = await rankingAPI.getArenaHonorRanking(this.pageNum, this.pageSize);
            if (resp && resp.code === 200) {
                // 兼容两种响应结构：直接数组或嵌套在 data.data（新接口返回数组：{userId,nickName,fightPower,segmentName,integral}[]）
                let honorArray: any[] = [];
                if (Array.isArray(resp.data)) {
                    honorArray = resp.data as any[];
                } else if (resp.data && Array.isArray((resp.data as any).data)) {
                    honorArray = (resp.data as any).data as any[];
                }
                if (resp && resp.data) {
                    const d: any = resp.data;
                    const tp = Number(d?.totalPage ?? d?.total ?? this.totalPages);
                    const pg = Number(d?.pageNum ?? d?.page ?? this.pageNum);
                    const sz = Number(d?.pageSize ?? d?.size ?? this.pageSize);
                    if (tp > 0) this.totalPages = tp;
                    if (pg > 0) this.pageNum = pg;
                    if (sz > 0) this.pageSize = sz;
                }
                // 将返回结构映射为 RankingInfo：fightPower 使用原始战斗力；荣誉积分单独作为 Row.honor
                const rankingData: RankingInfo[] = (honorArray || []).map((it: any) => {
                    const powerValue = typeof it.fightPower === 'number' ? it.fightPower : (typeof it.power === 'number' ? it.power : 0);
                    return {
                        userId: it.userId ?? null,
                        userName: it.userName ?? undefined,
                        nickName: it.nickName ?? undefined,
                        avatar: it.avatar ?? undefined,
                        chartNumber: 0,
                        fightPower: powerValue,
                        firstFinishTime: it.firstFinishTime ?? ''
                    } as RankingInfo;
                });
                 // 存储rankingData到类成员变量，供PkItem访问
                 this.rankingData = rankingData;
                 if (rankingData.length > 0) {
                     for (let i = 0; i < rankingData.length; i++) {
                         const r = rankingData[i];
                         const displayName = (r.nickName && r.nickName.length > 0) ? r.nickName : (r.userName || '未知玩家');
                        const power = typeof r.fightPower === 'number' ? r.fightPower : 0;
                        const honorSrc = honorArray[i];
                        const honor = typeof honorSrc?.integral === 'number' ? honorSrc.integral : (typeof honorSrc?.honorPoints === 'number' ? honorSrc.honorPoints : 0);
                         items.push({
                             type: 'pk',
                             rarity: baseRarity[i % baseRarity.length],
                             power: power,
                             honor: honor,
                             name: displayName,
                             sourceIdx: i,
                         });
                     }
                     // 如果榜单中包含当前用户昵称，则把该行标记为 pk1，用于嵌入显示
                     try {
                         const currentUserName = UserInfoData.getInstance().getNickname();
                         if (currentUserName && currentUserName.length > 0) {
                             const foundIndex = items.findIndex(row => row.name === currentUserName);
                             if (foundIndex >= 0) {
                                 items[foundIndex].type = 'pk1';
                                 items[foundIndex].originalPresetName = items[foundIndex].name;
                             }
                         }
                     } catch (e) {
                         console.warn('[PkMain] 标记用户行为 pk1 失败', e);
                     }

                    filledFromServer = true;
                }
            }
        } catch (e) {
            console.warn('[PkMain] 战力排行榜数据请求失败，使用本地伪数据', e);
        }

         // 失败降级：沿用本地每日稳定伪数据（含一个 pk_item1）
         if (!filledFromServer) {
            for (let i = 0; i < this.pageSize; i++) {
                items.push({
                    type: 'pk',
                    rarity: baseRarity[i % baseRarity.length],
                    power: this.getDailyStablePower(i),
                    honor: 0,
                    name: this.getDailyStableName(i),
                    sourceIdx: i,
                });
            }
            
        }

        // 应用上次挑战产生的手动交换（按当日有效）
        try {
            const swapDate = sys.localStorage.getItem('pk_swap_date');
            const d = new Date();
            const mm = (d.getMonth() + 1).toString().padStart(2, '0');
            const dd = d.getDate().toString().padStart(2, '0');
            const todayKey = `${d.getFullYear()}${mm}${dd}`;
            if (swapDate === todayKey) {
                const targetName = sys.localStorage.getItem('pk_swap_target_name') || '';
                if (targetName) {
                    const userIdx = items.findIndex(it => it.type === 'pk1');
                    const targetIdx = items.findIndex(it => it.name === targetName);
                    if (userIdx >= 0 && targetIdx >= 0 && userIdx !== targetIdx) {
                        // 插入式提升：胜者占被挑战者位置，被挑战者及区间玩家向下顺延一位
                        const winner = items.splice(userIdx, 1)[0];
                        items.splice(targetIdx, 0, winner);
                        console.log(`[PkMain] 应用插入式提升：胜者 '${winner.name}' 插入到索引 ${targetIdx}，被挑战者及区间下移一位`);

                        // 清除一次性交换标记，避免重复应用
                        try {
                            sys.localStorage.removeItem('pk_swap_target_name');
                            sys.localStorage.removeItem('pk_swap_date');
                        } catch { /* 忽略清理失败 */ }
                    }
                }
            }
        } catch (e) {
            console.warn('[PkMain] 应用手动交换失败', e);
        }

        const rankedItems: Row[] = items.map((it, idx) => ({ ...it, rank: ((this.pageNum - 1) * this.pageSize) + idx + 1 }));
        const displayItems: Row[] = rankedItems;

        for (let i = 0; i < displayItems.length; i++) {
            const it = displayItems[i];
            const blockNode = instantiate(this.pkItemPrefab);
            blockNode.setPosition(385, -i * 300, 0);
            const itemComponent = blockNode.getComponent(PkItem);
            if (itemComponent) {
                // 无论来源是 pk 还是 pk1，统一注入战力与昵称
                itemComponent.init(it.sourceIdx, it.rarity, this.hallInstance, it.power, it.name, (sender)=>{
                    console.log("[PkMain] PkItem点击回调", sender);
                }, this);
                // 注入荣誉积分（与战力分离显示）
                try { itemComponent.setHonorValue && itemComponent.setHonorValue(it.honor); } catch {}
                itemComponent.updateRankLabel(it.rank || 0);

                // 如果该行标记为 pk1，则在当前 pk_item 节点内插入 pk_item1 的显示（数据与排序仍以 it.power/it.name 为准）
                if (it.type === 'pk1' && this.pkItem1Prefab) {
                    try {
                        // 隐藏原 pk_item 的昵称，避免与 pk_item1 重叠显示
                        try {
                            if (itemComponent && itemComponent.nicknameLabel && itemComponent.nicknameLabel.node) {
                                itemComponent.nicknameLabel.node.active = false;
                            }
                        } catch { /* 忽略隐藏失败 */ }

                        // 隐藏该行内的"挑战"按钮（pk_item1 行不需要挑战按钮）
                        try {
                            const buttons = blockNode.getComponentsInChildren(Button);
                            buttons.forEach(b => { 
                                console.log(`[PkMain] 隐藏按钮组件: ${b.node.name}`);
                                b.node.active = false; 
                            });
                            // 兜底：按名称匹配可能的按钮节点（遍历子节点树而非用组件检索 Node 类型）
                            const possibleNames = ['challenge', 'start', 'btn', 'button', '挑战'];
                            const stack: Node[] = [blockNode];
                            let foundDnf26 = false;
                            while (stack.length) {
                                const curr = stack.pop()!;
                                const nn = (curr.name || '').toLowerCase();
                                if (possibleNames.some(k => nn.includes(k))) {
                                    console.log(`[PkMain] 隐藏名称匹配按钮: ${curr.name}`);
                                    curr.active = false;
                                }
                                // 专门隐藏名为 dnf_26 的按钮节点
                                if (curr.name === 'dnf_26') {
                                    console.log(`[PkMain] 找到并隐藏 dnf_26 按钮`);
                                    curr.active = false;
                                    foundDnf26 = true;
                                }
                                curr.children.forEach(ch => stack.push(ch));
                            }
                            if (!foundDnf26) {
                                console.warn('[PkMain] 未找到 dnf_26 按钮节点');
                            }
                        } catch (e) { 
                            console.warn('[PkMain] 隐藏按钮失败', e);
                        }

                        // 作为子节点插入到当前 pk_item 里，避免替换整行
                        const pk1Node = instantiate(this.pkItem1Prefab);
                        pk1Node.name = 'PkItem1Embed';
                        // 保持与 pk_item 内部坐标系一致，默认置于原点
                        pk1Node.setPosition(0, 0, 0);
                        // 可根据需要微调缩放与层级，确保可见
                        pk1Node.setScale(1, 1, 1);
                        pk1Node.setSiblingIndex(999);
                        blockNode.addChild(pk1Node);
                        const pk1Comp: PkItem1 = pk1Node.getComponent(PkItem1);
                        if (pk1Comp) {
                            pk1Comp.initWithPowerAndName(it.sourceIdx, it.rarity, this.hallInstance, it.power, it.name, it.originalPresetName || it.name, (sender)=>{
                                console.log("[PkMain] PkItem1嵌入点击回调", sender);
                            });
                            // 立即刷新显示，确保数据正确呈现
                            pk1Comp.updateAllUserInfo();
                            // 设置荣誉积分
                            try {
                                const hv = Number(it.honor) || 0;
                                if (pk1Comp.setHonorValue) pk1Comp.setHonorValue(hv);
                                if (pk1Comp.honorLabel) {
                                    pk1Comp.honorLabel.string = hv.toString();
                                    console.log(`[PkMain] 直接写入 PkItem1.honorLabel: ${pk1Comp.honorLabel.string}`);
                                }
                                console.log(`[PkMain] 设置 PkItem1 荣誉积分: ${hv}`);
                            } catch {}
                            // 兜底：直接写入子节点中名含 honor/integral/points/score/积分 的 Label
                            try {
                                const labels = pk1Node.getComponentsInChildren(Label);
                                const autoHonor = labels.find(l => {
                                    const nn = l.node.name.toLowerCase();
                                    return nn.includes('honor') || nn.includes('honour') || nn.includes('integral') || nn.includes('points') || nn.includes('score') || nn.includes('积分');
                                });
                                if (autoHonor) {
                                    autoHonor.string = (Number(it.honor) || 0).toString();
                                    console.log(`[PkMain] 兜底写入 PkItem1 荣誉积分到 Label(${autoHonor.node.name}): ${autoHonor.string}`);
                                }
                            } catch {}
                            // 设置排名显示
                            pk1Comp.updateRankLabel(items.length - i);
                            console.log(`[PkMain] 在PkItem内嵌PkItem1 排序位=${i}, 源idx=${it.sourceIdx}, 稀有度=${it.rarity}, 战力=${it.power}, 名字=${it.name}`);
                            
                            // 延迟再次检查并隐藏dnf_26按钮，确保按钮被正确隐藏
                            this.scheduleOnce(() => {
                                try {
                                    const buttons = blockNode.getComponentsInChildren(Button);
                                    buttons.forEach(b => { 
                                        if (b.node.active) {
                                            console.log(`[PkMain] 延迟隐藏按钮: ${b.node.name}`);
                                            b.node.active = false; 
                                        }
                                    });
                                    
                                    // 再次检查dnf_26按钮
                                    const stack: Node[] = [blockNode];
                                    while (stack.length) {
                                        const curr = stack.pop()!;
                                        if (curr.name === 'dnf_26' && curr.active) {
                                            console.log(`[PkMain] 延迟隐藏 dnf_26 按钮`);
                                            curr.active = false;
                                        }
                                        curr.children.forEach(ch => stack.push(ch));
                                    }
                                } catch (e) {
                                    console.warn('[PkMain] 延迟隐藏按钮失败', e);
                                }
                            }, 0.1); // 延迟0.1秒执行
                        } else {
                            console.warn('[PkMain] pk_item1 未挂载 PkItem1 组件，仅保留 pk_item 数据');
                        }
                    } catch (e) {
                        console.warn('[PkMain] 嵌入 pk_item1 失败，仅保留 pk_item', e);
                    }
                }
                // 统一将 pk_item 行加入滚动容器（无论是否嵌入了 pk_item1）
                this.scrollContent.addChild(blockNode);
                this.bindPk30Button(blockNode);
                console.log(`[PkMain] 创建PkItem 排序位=${i}, 源idx=${it.sourceIdx}, 稀有度=${it.rarity}, 战力=${it.power}, 名字=${it.name}, 类型=${it.type}`);
            } else {
                console.warn(`[PkMain] PkItem组件获取失败，排序位=${i}`);
            }
        }
 
         // const groupedSkins = this.getGroupedAndFilteredSkins();
 
         // // 按稀有度从高到低遍历
         // for (const rarity of this.rarityOrder) {
         //     const skinIds = groupedSkins.get(rarity);
 
         //     // 如果该稀有度下有皮肤，则创建并显示Block
         //     if (skinIds && skinIds.length > 0) {
         //         const blockNode = instantiate(this.dnfItemPrefab);
         //         blockNode.setPosition(585,0,0);
                 
         //     }
        // }
     }
    
    private bindChallengeLogButton() {
        try {
            const target = this.findNodeByNameBreadthFirst(this.node, 'pk_31') || this.findNodeByNameBreadthFirst(director.getScene(), 'pk_31');
            if (!target) {
                console.warn('[PkMain] 未找到名为 pk_31 的按钮节点');
                return;
            }
            target.off(Node.EventType.TOUCH_END, this.openChallengeLog, this);
            target.on(Node.EventType.TOUCH_END, this.openChallengeLog, this);
            console.log('[PkMain] 已绑定 pk_31 按钮打开挑战记录');
        } catch (e) {
            console.warn('[PkMain] 绑定 pk_31 按钮失败', e);
        }
    }

    private bindPk30Button(root: Node) {
        const stack: Node[] = [root];
        while (stack.length) {
            const curr = stack.pop()!;
            if (curr.name === 'pk_30') {
                const btn = curr.getComponent(Button);
                if (btn) {
                    btn.node.off(Button.EventType.CLICK, this.onPk30Clicked, this);
                    btn.node.on(Button.EventType.CLICK, this.onPk30Clicked, this);
                } else {
                    curr.off(Node.EventType.TOUCH_END, this.onPk30Clicked, this);
                    curr.on(Node.EventType.TOUCH_END, this.onPk30Clicked, this);
                }
                return;
            }
            curr.children.forEach(ch => stack.push(ch));
        }
    }

    private onPk30Clicked() {
        this.showPkItemStore();
    }

    private showPkItemStore() {
        if (this.pkItemStorePrefab) {
            this.instantiatePkItemStore(this.pkItemStorePrefab);
            return;
        }
        resources.load('prefab/hall/shop/pk_item_Store', Prefab, (err, prefab) => {
            if (!err && prefab) {
                this.pkItemStorePrefab = prefab;
                this.instantiatePkItemStore(prefab);
            }
        });
    }

    private instantiatePkItemStore(prefab: Prefab) {
        const exist = this.node.getChildByName('pk_item_Store_Instance');
        if (exist) {
            exist.active = true;
            this.ensureStoreBackdrop(exist);
            return;
        }
        const n = instantiate(prefab);
        n.name = 'pk_item_Store_Instance';
        n.setPosition(0, 0, 0);
        n.setSiblingIndex(9999);
        this.node.addChild(n);
        this.ensureStoreBackdrop(n);
    }

    private ensureStoreBackdrop(storeNode: Node) {
        let mask = this.node.getChildByName('pk_item_Store_Mask');
        if (!mask) {
            mask = new Node('pk_item_Store_Mask');
            const ui = mask.addComponent(UITransform);
            const size = view.getVisibleSize();
            ui.setContentSize(size);
            mask.setPosition(0, 0, 0);
            this.node.addChild(mask);
        }
        mask.active = true;
        mask.setSiblingIndex(storeNode.getSiblingIndex() - 1);
        mask.off(Node.EventType.TOUCH_END, this.closePkItemStore, this);
        // 使用 once 确保点击只触发一次，避免重复销毁
        (mask as any).once?.(Node.EventType.TOUCH_END, this.closePkItemStore, this) || mask.on(Node.EventType.TOUCH_END, this.closePkItemStore, this);
    }

    private closePkItemStore() {
        const inst = this.node.getChildByName('pk_item_Store_Instance');
        try {
            if (inst && (inst as any).isValid !== false) {
                inst.removeFromParent();
                inst.destroy();
            }
        } catch {}
        const mask = this.node.getChildByName('pk_item_Store_Mask');
        try {
            if (mask && (mask as any).isValid !== false) {
                mask.removeFromParent();
                mask.destroy();
            }
        } catch {}
    }

    private onRefreshFiveClicked() {
        const tp = this.totalPages || 1;
        this.pageNum = ((this.pageNum % tp) || 0) + 1;
        this.populateSkinBlocks();
    }

    private openChallengeLog() {
        try {
            ChallengeLogDialog.showOn(this.node);
        } catch (e) {
            console.warn('[PkMain] 打开挑战记录失败', e);
        }
    }

    private findNodeByNameBreadthFirst(root: Node | null, name: string): Node | null {
        if (!root) return null;
        const queue: Node[] = [root];
        while (queue.length) {
            const curr = queue.shift()!;
            if ((curr.name || '') === name) return curr;
            const children = curr.children || [];
            for (let i = 0; i < children.length; i++) queue.push(children[i]);
        }
        return null;
    }
     
 
     // ==================== 公共方法 ====================
 
    public show() {
        this.node.active = true;
    }

    public hide() {
        this.node.active = false;
    }
 }
 
 
 
