// 导入Cocos Creator相关模块
import { _decorator, Component, Node, Label, sp, resources, Animation, AnimationClip, game, SpriteFrame} from 'cc';
// 导入怪物图鉴配置和全局变量
import { MonsterCatalogEntry, MonsterType } from '../../global/config/MonsterCatalogEntry';
import { Sprite } from 'cc';
import { userMonsterData } from '../../user/UserMonsterData';
import { director } from 'cc';

const { ccclass, property } = _decorator;

/**
 * @class MonsterPreviewIcon
 * @description 怪物图鉴中单个怪物预览图标的组件。
 * 负责根据怪物数据，显示其动画、名称，并处理解锁和奖励状态。
 * 【修改】现在从服务器获取解锁和奖励状态
 */
@ccclass('MonsterPreviewIcon')
export class MonsterPreviewIcon extends Component {

    // --- 属性 ---
    

    @property(Sprite)
    public spritebg: Sprite = null;

    /**
     * 用于播放Sprite帧动画的节点
     * @property {Node}
     */
    @property(Node)
    public spriteNode: Node = null;

    /**
     * spriteNode上的Animation组件
     * @private
     */
    @property(Animation)
    private animation: Animation = null;

    /**
     * 用于播放Spine骨骼动画的节点
     * @property {Node}
     */
    @property(Node)
    public spineNode: Node = null;

    /**
     * spineNode上的sp.Skeleton组件 
     * @private
     */
    @property(sp.Skeleton)
    private spine: sp.Skeleton = null;

    /**
     * 显示怪物名称的Label组件
     * @property {Label}
     */
    @property(Label)
    public nameLabel: Label = null;

    /**
     * 怪物未解锁时显示的"锁"节点
     * @property {Node}
     */
    @property(Node)
    public lockNode: Node = null;

    /**
     * 怪物奖励已领取时显示的节点
     * @property {Node}
     */
    @property(Node)
    public rewardCollectedNode: Node = null;

    /**
     * 领取奖励按钮节点
     * @property {Node}
     */
    @property(Node)
    public claimRewardButton: Node = null;

    // --- 私有变量 ---
    private monsterEntry: MonsterCatalogEntry = null;
    private isUnlocked: boolean = false;
    private isRewardReceived: boolean = false;

    onLoad() {
        // 获取必要的组件引用 - 注释掉，让组件在需要时自动获取
        // this.animation = this.spriteNode.getComponent(Animation);
        // this.spine = this.spineNode.getComponent(sp.Skeleton);

        // 初始化节点状态
        // this.spriteNode.active = false;
        // this.spineNode.active = false;
        this.lockNode.active = true;
        this.rewardCollectedNode.active = false;
        this.nameLabel.string = '';

        // 绑定领取按钮点击事件
        if (this.claimRewardButton) {
            this.claimRewardButton.on(Node.EventType.TOUCH_END, this.onClaimRewardClicked, this);
        }
    }

   updatebg(){
            if(!this.spritebg)return

            let frameName=''
             if(this.monsterEntry.monsterType===MonsterType.NORMAL){
                frameName='monster_preview_9'
             }else if(this.monsterEntry.monsterType===MonsterType.ELITE){
                frameName='monster_preview_10'
             }else if(this.monsterEntry.monsterType===MonsterType.BOSS){
                frameName='monster_preview_11'
             }


             const spriteFrame=this.spritebg.spriteAtlas.getSpriteFrame(frameName)
             this.spritebg.spriteFrame=spriteFrame
   }
    /**
     * 初始化怪物图鉴图标
     * @param entry 怪物图鉴条目数据
     */
    public async init(entry: MonsterCatalogEntry) {
        
        this.monsterEntry = entry;
        
        // 先隐藏节点，然后延迟显示（模仿之前的工作版本）
        // this.node.active = false;
        
        // 下一帧执行 加载并播放动画（模仿之前的工作版本）
        this.scheduleOnce(async () => {
            // 显示节点
            // this.node.active = true;
            
            // 设置spritebg的spriteFrame
            this.updatebg();

            // 【优化】一次性获取所有状态，避免重复API调用
            const [isLocked, isRewardReceived] = await this.getMonsterStatusFromServer();
            this.isUnlocked = !isLocked;
            this.isRewardReceived = isRewardReceived;

            console.log(`MonsterPreviewIcon: 设置锁定状态 - key: ${entry.key}, name: ${entry.name}, isLocked: ${isLocked}, lockNode存在: ${!!this.lockNode}`);
            
            if (this.lockNode) {
                this.lockNode.active = isLocked;
                console.log(`MonsterPreviewIcon: lockNode.active已设置为 ${isLocked}`);
            } else {
                console.error(`MonsterPreviewIcon: lockNode为null，无法设置锁定状态 - key: ${entry.key}`);
            }

            if (isLocked) {
                // 锁定的怪物：隐藏奖励相关节点
                this.rewardCollectedNode.active = false;
                console.log(`MonsterPreviewIcon: 怪物已锁定，隐藏奖励节点 - key: ${entry.key}`);
            } else {
                // 已解锁的怪物：设置奖励状态显示
                this.updateRewardStatusDisplay();
                console.log(`MonsterPreviewIcon: 怪物已解锁，更新奖励状态显示 - key: ${entry.key}`);
            }

            this.nameLabel.string = entry.name;
            if (entry.key == 'm_n_0_019') {
                console.log('m_n_0_019')
            }
            this.loadAndPlayAnimation();
        }, 0.1);
    }

    /**
     * 【优化】一次性从服务器获取怪物状态（解锁状态和奖励状态）
     */
    private async getMonsterStatusFromServer(): Promise<[boolean, boolean]> {
        if (!this.monsterEntry) {
            console.warn('MonsterPreviewIcon: monsterEntry为空');
            return [true, false]; // 默认锁定，未领取
        }

        try {
            // 一次性获取怪物数据，避免重复API调用
            const monsterKey = this.monsterEntry.key;
            console.log(`MonsterPreviewIcon: 正在获取怪物状态 - key: ${monsterKey}, name: ${this.monsterEntry.name}, id: ${this.monsterEntry.id}`);
            
            const serverData = await userMonsterData.getMonsterByKey(monsterKey);
            
            if (serverData) {
                // 服务器数据存在，根据字段判断
                const isLocked = serverData.isUnlock !== 1; // isUnlock为0表示未解锁，为1表示已解锁
                const isRewardReceived = serverData.isReceive === 1; // isReceive为1表示已领取，为0或null表示未领取
                console.log(`MonsterPreviewIcon: 服务器数据存在 - key: ${monsterKey}, isUnlock: ${serverData.isUnlock}, isReceive: ${serverData.isReceive}, 计算结果: isLocked=${isLocked}, isRewardReceived=${isRewardReceived}`);
                return [isLocked, isRewardReceived];
            } else {
                // 服务器数据不存在，默认锁定，未领取
                console.log(`MonsterPreviewIcon: 服务器数据不存在 - key: ${monsterKey}, 使用默认状态: 锁定=true, 未领取=false`);
                return [true, false];
            }
        } catch (error) {
            console.error(`MonsterPreviewIcon: 获取怪物状态失败 - ${this.monsterEntry.key}:`, error);
            return [true, false]; // 出错时默认锁定，未领取
        }
    }
    
    // --- 动画加载部分 ---
    private loadAndPlayAnimation() {
        const { resourceType, resourceDir, animationNames, spineSkinName } = this.monsterEntry;

        // 根据资源类型，互斥显示Sprite或Spine节点
        // this.spriteNode.active = resourceType === 'anim';
        // this.spineNode.active = resourceType === 'spine';

        //特殊处理丑八怪
       if(animationNames[0]=='m_n_0_006'||animationNames[0]=='m_s_0_001'){
            this.spriteNode.setPosition(0,-70,0)
            this.spriteNode.setScale(0.8,0.8)
        } 
        // 新添加的怪物缩放处理
        else if(this.isNewMonster(this.monsterEntry.key)){
            this.spriteNode.setPosition(0,-70,0); // 调整位置
            // 为新精英怪物设置0.3倍缩放，其他新怪物保持0.6倍
            if(this.monsterEntry.key.startsWith('m_s_0_') && 
               ['m_s_0_006', 'm_s_0_007', 'm_s_0_008', 'm_s_0_009', 'm_s_0_010',
                'm_s_0_011', 'm_s_0_012', 'm_s_0_013', 'm_s_0_014', 'm_s_0_015',
                'm_s_0_016', 'm_s_0_017', 'm_s_0_018', 'm_s_0_019', ].includes(this.monsterEntry.key)) {
                this.spriteNode.setScale(0.3,0.3); // 新精英怪物0.3倍缩放
            } else {
                this.spriteNode.setScale(0.6,0.6); // 其他新怪物0.6倍缩放
            }
        }

        if (resourceType === 'anim') {
            // 确保spriteNode激活
            this.spriteNode.active = true;
            this.spineNode.active = false;
            
            // --- 加载Sprite帧动画 ---
            // 在需要时获取组件（模仿之前的工作版本）
            // if (!this.animation) {
            //     this.animation = this.spriteNode.getComponent(Animation);
            // }
            
            if (!this.animation) {
                console.error("错误: 在 spriteNode 上找不到 Animation 组件。请在编辑器中为预制件的 spriteNode 节点添加 Animation 组件。");
                return;
            }

            const clipName = animationNames[0];
            
            // 检查动画剪辑是否已在组件的clips数组中
            if (this.animation.clips.some(c => c && c.name === clipName)) {
                // 直接播放动画（模仿之前的工作版本）
                this.animation.play(clipName);
                const animState = this.animation.getState(clipName);
                if (animState) {
                    animState.wrapMode = AnimationClip.WrapMode.Loop;
                    animState.time = 0;
                    animState.sample(); // 跳到第一帧
                    animState.pause();  // 暂停
                    // 动画状态设置成功
                } else {
                    console.warn(`[Animation] getState(${clipName}) 返回 null，可能未正确初始化`);
                }
            } else {
                 console.warn(`动画剪辑 [${clipName}] 未在 Animation 组件中找到，请在编辑器中预先挂载。`);
            }
        } else if (resourceType === 'spine') {
            // 确保spineNode激活
            this.spriteNode.active = false;
            this.spineNode.active = true;
            
            // 缩放处理将在Spine资源加载完成后进行
            
            // --- 加载Spine骨骼动画 ---
            // 在需要时获取组件（模仿之前的工作版本）
            if (!this.spine) {
                this.spine = this.spineNode.getComponent(sp.Skeleton);
            }
            
            if (!this.spine) {
                console.error("错误: 在 spineNode 上找不到 sp.Skeleton 组件。请在编辑器中为预制件的 spineNode 节点添加 sp.Skeleton 组件。");
                return;
            }
            resources.load(resourceDir, sp.SkeletonData, (err, skeletonData) => {
                if (err) {
                    console.error(`加载Spine资源失败: ${resourceDir}`, err);
                    return;
                }
                
                if (!this.spine || !this.isValid) {
                    console.warn(`[Spine] 组件已销毁，跳过Spine动画设置: ${resourceDir}`);
                    return;
                }
                
                this.spine.skeletonData = skeletonData;

                // 如果有皮肤，则设置皮肤
                if (spineSkinName && spineSkinName !== '') {
                    this.spine.setSkin(spineSkinName);
                }
                
                // 设置并循环播放第一个动画
                const clipName = animationNames[0];
                const loop = true;
                this.spine.setAnimation(0, clipName, loop);
                console.log(`[Spine] 成功设置Spine动画: ${clipName}`);
            });
        }
    }

    /**
     * 设置奖励是否已领取的状态
     * @param isCollected - true表示已领取，false表示未领取
     */
    public setRewardCollected(isCollected: boolean) {
        // 如果怪物是锁定状态，则不显示奖励状态
        if (this.lockNode.active) {
             this.rewardCollectedNode.active = false;
             return;
        }
        this.rewardCollectedNode.active = isCollected;
    }

    /**
     * 【新增】更新奖励状态显示
     */
    private updateRewardStatusDisplay(): void {
        if (!this.isUnlocked) {
            // 未解锁：隐藏所有奖励相关节点
            this.rewardCollectedNode.active = false;
            return;
        }

        if (this.isRewardReceived) {
            // 已领取：隐藏未领取标识，隐藏领取按钮
            this.rewardCollectedNode.active = false;
        } else {
            // 未领取：显示未领取标识，显示领取按钮
            this.rewardCollectedNode.active = true;
        }
    }

    /**
     * 【新增】领取奖励按钮点击事件
     */
    private async onClaimRewardClicked(): Promise<void> {
        if (!this.isUnlocked || this.isRewardReceived || !this.monsterEntry) {
            console.warn('MonsterPreviewIcon: 无法领取奖励，状态不满足条件');
            return;
        }

        try {
            console.log(`MonsterPreviewIcon: 开始领取怪物 ${this.monsterEntry.key} 的奖励`);
            
            // 调用UserMonsterData领取奖励
            const result = await userMonsterData.receiveMonsterReward(this.monsterEntry.key);
            
            if (result && result.success) {
                // 领取成功，更新状态
                this.isRewardReceived = true;
                this.updateRewardStatusDisplay();
                
                // 【修改】使用服务器返回的奖励JSON字符串显示奖励
                const rewardJsonString = result.reward;
                this.showRewardDialog(rewardJsonString);
                
                console.log(`MonsterPreviewIcon: 怪物 ${this.monsterEntry.key} 奖励领取成功，奖励: ${rewardJsonString}`);
            } else {
                // 领取失败
                console.error(`MonsterPreviewIcon: 怪物 ${this.monsterEntry.key} 奖励领取失败:`, result?.error);
            }
        } catch (error) {
            console.error(`MonsterPreviewIcon: 领取奖励时发生错误 - ${this.monsterEntry.key}:`, error);
        }
    }

    /**
     * 【新增】获取默认奖励JSON字符串
     * 根据怪物类型返回不同的奖励JSON字符串
     */
    private getDefaultRewardJsonString(): string {
        if (!this.monsterEntry) {
            return '{"gold": 50}';
        }

        // 根据怪物类型返回不同的奖励JSON字符串
        switch (this.monsterEntry.monsterType) {
            case MonsterType.NORMAL:
                // 普通怪物奖励：金币
                return '{"gold": 50}';
                
            case MonsterType.ELITE:
                // 精英怪物奖励：金币 + 钻石
                return '{"gold": 100, "currency_diamond": 10}';
                
            case MonsterType.BOSS:
                // Boss奖励：金币 + 钻石 + 经验药水
                return '{"gold": 200, "currency_diamond": 50, "exp_potion": 1}';
                
            default:
                return '{"gold": 50}';
        }
    }

  

    /**
     * 【新增】发送全局事件显示奖励对话框
     */
    private showRewardDialog(rewardJsonString: string): void {
        if (!this.monsterEntry) {
            console.warn('MonsterPreviewIcon: monsterEntry为空，无法显示奖励');
            return;
        }

        try {
            // 发送全局事件显示奖励，直接传递JSON字符串
            director.emit(game.gameEvent.DIALOG_ITEM_SHOW, rewardJsonString);
            console.log(`MonsterPreviewIcon: 发送显示奖励事件 - ${this.monsterEntry.name}, 奖励: ${rewardJsonString}`);
        } catch (error) {
            console.error('MonsterPreviewIcon: 发送显示奖励事件失败:', error);
        }
    }

    /**
     * 判断是否是新添加的怪物或BOSS (通过key判断)
     * 新怪物: m_n_0_009 到 m_n_0_026
     * 新BOSS: b_0_005 到 b_0_017, b_1_007 到 b_1_017
     * 新精英怪: m_s_0_006 到 m_s_0_020
     */
    private isNewMonster(key: string): boolean {
        const newMonsterAnimations = [
            // 新添加的普通怪物
            'm_n_0_009', 'm_n_0_010', 'm_n_0_011', 'm_n_0_012', 'm_n_0_013',
            'm_n_0_014', 'm_n_0_015', 'm_n_0_016', 'm_n_0_017', 'm_n_0_018',
            'm_n_0_019', 'm_n_0_020', 'm_n_0_021', 'm_n_0_022', 'm_n_0_023',
            'm_n_0_024', 'm_n_0_025', 'm_n_0_026',
            // 新添加的精英怪物
            'm_s_0_005',,'m_s_0_006', 'm_s_0_007', 'm_s_0_008', 'm_s_0_009', 'm_s_0_010',
            'm_s_0_011', 'm_s_0_012', 'm_s_0_013', 'm_s_0_014', 'm_s_0_015',
            'm_s_0_016', 'm_s_0_017', 'm_s_0_018', 'm_s_0_019', 'm_s_0_020',
            // 新添加的BOSS
            'b_0_005', 'b_0_006', 'b_0_007', 'b_0_008', 'b_0_009', 'b_0_010',
            'b_0_011', 'b_0_012', 'b_0_013', 'b_0_014', 'b_0_015', 'b_0_016', 'b_0_017',
            'b_1_007', 'b_1_008', 'b_1_009', 'b_1_010', 'b_1_011', 'b_1_012',
            'b_1_013', 'b_1_014', 'b_1_015', 'b_1_016', 'b_1_017'
        ];
        return newMonsterAnimations.includes(key);
    }
}
   
