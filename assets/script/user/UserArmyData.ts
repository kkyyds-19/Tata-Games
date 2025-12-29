import { _decorator } from 'cc';
import { myHeroAPI } from '../api/MyHeroAPI';
import { ResourceConfig } from '../global/config/ResourceConfig';
import { UserClassData } from './UserClassData';
import { director } from 'cc';
import { game } from 'cc';
const { ccclass } = _decorator;

/**
 * 服务器卡牌数据结构（扩展MyHeroInfo）
 */
export interface ServerHeroData {
    id: number;                  // 卡牌ID
    userId: number;              // 用户ID
    relationId: number;          // 英雄品质关联表主键
    isBattle: number;            // 是否上阵，0不上阵，1上阵
    careerLevel: number | null;  // 职业等级
    getTime: string | null;      // 获得时间
    // 扩展字段，用于解析英雄信息
    key?: string;                // 英雄key，格式：[角色类型]_[职业]_[品质]_[资源ID]
    heroId?: number;             // 英雄id
    qualityId?: number;          // 英雄品质id
}

/**
 * 卡片数据结构
 */
export interface CardData {
    cardId: string;         // 卡片ID
    name: string;           // 卡片名称
    heroId: string;         // 对应的英雄ID
    class: number;          // 职业（0-4）
    quality: number;        // 品质（0-9）
    attackType: number;     // 攻击派系（0-物理，1-水，2-火，3-电，4-风）
    sLevel: number;         // s阶（默认0）
    key?: string;           // 英雄key，格式：[角色类型]_[职业]_[品质]_[资源ID]
    serverHeroId?: number;  // 服务器英雄ID
}

/**
 * 用户当前部队数据管理（全局单例）
 */
@ccclass('UserArmyData')
export class UserArmyData {
    private static _instance: UserArmyData = null;
    
    /**
     * 用户拥有的卡片列表
     */
    private _userCards: CardData[] = [];
    
    /**
     * 添加初始化状态标记
     */
    public isInitialized: boolean = false;

    private constructor() {
        // 延迟初始化，等待登录完成
        console.log('UserArmyData: 实例创建，等待登录完成后初始化');
    }

    public static getInstance(): UserArmyData {
        if (!this._instance) {
            this._instance = new UserArmyData();
        }
        return this._instance;
        
    }

    /**
     * 初始化用户卡片数据（在登录完成后调用）
     */
    public initializeAfterLogin(): void {
        if (this.isInitialized) {
            return;
        }
        
        // 从服务器获取卡牌数据
        this.loadCardsFromServer();
        this.isInitialized = true;
    }

    /**
     * 从服务器加载卡牌数据
     */
    private async loadCardsFromServer(): Promise<void> {
        try {
            console.log('UserArmyData: 开始从服务器获取卡牌数据');
            
            // 先尝试从真实服务器获取数据
            const response = await myHeroAPI.getHeroList();
            
            if (response.code === 200 || response.code === 0) {
                const serverHeroList = response.data || [];
                // console.log('UserArmyData: 服务器返回卡牌数据:', serverHeroList);
                
                // 转换服务器数据为本地格式
                this._userCards = serverHeroList.map(serverHero => 
                    this.convertServerHeroToCardData(serverHero as ServerHeroData)
                ).filter(card => card !== null) as CardData[];
                
                console.log(`UserArmyData: 成功转换 ${this._userCards.length} 张卡牌数据`);
                
                // 初始化UserClassData（使用服务器数据）
                this.initializeUserClassDataFromServer(serverHeroList as ServerHeroData[]);
                
                // 如果没有成功转换任何卡牌，只输出警告
                if (this._userCards.length === 0) {
                    console.warn('UserArmyData: 没有成功转换任何卡牌');
                }
            } else {
                console.error('UserArmyData: 服务器返回错误:', response.msg);
                throw new Error('服务器返回错误: ' + response.msg);
            }
        } catch (error) {
            console.error('UserArmyData: 从服务器获取卡牌数据失败:', error);
            console.log('UserArmyData: 服务器获取失败，等待下次重试');
        }
    }

    /**
     * 从服务器数据初始化UserClassData
     * @param serverHeroList 服务器英雄数据列表
     */
    private initializeUserClassDataFromServer(serverHeroList: ServerHeroData[]): void {
        const userClassData = UserClassData.getInstance();
        
        // 初始化职业等级
        userClassData.initializeAfterLogin();
        
        // 处理上阵英雄
        let deployedCount = 0;
        for (const serverHero of serverHeroList) {
            // 跳过未上阵的英雄
            if (serverHero.isBattle !== 1) {
                continue;
            }
            
            // 查找对应的本地卡牌数据
            const cardData = this._userCards.find(card => card.cardId === serverHero.id.toString());
            if (!cardData) {
                console.warn(`UserArmyData: 找不到上阵英雄对应的卡牌数据 (ID: ${serverHero.id})`);
                continue;
            }
            
            // 设置职业等级
            const careerLevel = serverHero.careerLevel || 1;
            userClassData.setClassLevel(cardData.class, careerLevel);
            
            // 上阵英雄
            const deployResult = userClassData.deployCard(cardData.cardId);
            if (deployResult.success) {
                deployedCount++;
            } else {
                console.warn(`UserArmyData: 上阵英雄失败 ${cardData.name} (ID: ${cardData.cardId}): ${deployResult.message}`);
            }
        }
        
        console.log(`UserArmyData: 从服务器数据完成上阵 ${deployedCount} 个英雄`);
        director.emit(game.gameEvent.HALL_ARMY_FORMATION_CHANGED);
    }

    /**
     * 将服务器英雄数据转换为本地卡片数据格式
     * @param serverHero 服务器英雄数据
     * @returns 本地卡片数据，转换失败返回null
     */
    private convertServerHeroToCardData(serverHero: ServerHeroData): CardData | null {
        try {
            // 检查必要字段
            if (!serverHero.key) {
                console.warn(`UserArmyData: 英雄数据缺少key字段 (ID: ${serverHero.id})`);
                return null;
            }

            // 解析英雄key: [角色类型]_[职业]_[品质]_[资源ID]
            const keyParts = serverHero.key.split('_');
            if (keyParts.length < 4) {
                console.warn(`UserArmyData: 无效的英雄key格式: ${serverHero.key} (ID: ${serverHero.id})`);
                return null;
            }

            const roleType = keyParts[0];    // 角色类型 (h)
            const classNum = parseInt(keyParts[1]);  // 职业 (0-4)
            const quality = parseInt(keyParts[2]);   // 品质 (0-24)
            const resourceId = keyParts[3];  // 资源ID

            // 验证解析的数据
            if (isNaN(classNum) || isNaN(quality)) {
                console.warn(`UserArmyData: 无法解析职业或品质数值 (key: ${serverHero.key}, ID: ${serverHero.id})`);
                return null;
            }

            // 构建基础0品质的资源key
            const baseKey = `${roleType}_${classNum}_0_${resourceId}`;
            
            // 在ResourceConfig中查找对应的英雄信息
            const heroConfig = ResourceConfig.heros_list.find(hero => 
                hero.iconFrameName === baseKey
            );

            if (!heroConfig) {
                console.warn(`UserArmyData: 在ResourceConfig中找不到英雄配置: ${baseKey} (ID: ${serverHero.id})`);
                return null;
            }

            // 计算s阶等级（根据品质判断）
            let sLevel = 0;
            
            // 固定的sLevel规则
            if (baseKey === 'h_4_0_1') {
                sLevel = 3;
            } else if (baseKey === 'h_3_0_3') {
                sLevel = 2;
            }

            // 构建本地卡片数据
            const cardData: CardData = {
                cardId: serverHero.id.toString(),
                name: heroConfig.name,
                heroId: heroConfig.id,
                class: classNum,
                quality: quality,
                attackType: this.getAttackTypeByClass(classNum), // 根据职业推断攻击类型
                sLevel: sLevel,
                key: serverHero.key, // 添加key字段
                serverHeroId: serverHero.heroId // 添加serverHeroId字段
            };

            return cardData;

        } catch (error) {
            console.error(`UserArmyData: 转换卡牌数据失败 (ID: ${serverHero.id}):`, error);
            return null;
        }
    }

    /**
     * 根据职业推断攻击类型
     * @param classNum 职业编号 (0-4)
     * @returns 攻击类型 (0-物理，1-水，2-火，3-电，4-风)
     */
    private getAttackTypeByClass(classNum: number): number {
        // 这里可以根据实际游戏设定来映射职业到攻击类型
        // 暂时使用简单的映射规则
        const attackTypeMap: Record<number, number> = {
            0: 0, // 坦克 - 物理
            1: 1, // 治疗 - 水
            2: 2, // 射手 - 火
            3: 3, // 法师 - 电
            4: 4  // 刺客 - 风
        };
        
        return attackTypeMap[classNum] || 0;
    }

    /**
     * 刷新卡牌数据（重新从服务器获取）
     */
    public async refreshCardsFromServer(): Promise<void> {
        console.log('UserArmyData: 开始刷新卡牌数据');
        this.isInitialized = false;
        await this.loadCardsFromServer();
        this.isInitialized = true;
        console.log('UserArmyData: 卡牌数据刷新完成');
    }
/**
 * 根据 quality 值返回星星数量
 */
public getStarCountByQuality(quality: number): number {
    const starMap: Record<number, number> = {
        0: 0,  // 普通
        1: 0,  // 优秀
        2: 0,  // 稀有
        3: 0,  // 精英
        4: 1,  // 精英一星
        5: 2,  // 精英两星
        6: 0,  // 传说
        7: 1,  // 传说一星
        8: 2,  // 传说二星
        9: 3,  // 传说三星
        10: 0, // 神话
        11: 1, // 神话一星
        12: 2, // 神话二星
        13: 3, // 神话三星
        14: 0,  // 泰坦
        15: 1,  // 泰坦一星
        16: 2,  // 泰坦两星
        17: 3,  // 泰坦三星
        18: 4,  // 泰坦四星
        19: 5,  // 泰坦五星
        20: 6,  // 泰坦六星
        21: 7,  // 泰坦七星
        22: 8,  // 泰坦八星
        23: 9,  // 泰坦九星
        24: 10, // 泰坦十星
    };

    return starMap[quality];
}

    /**
     * 生成随机数
     */
    private getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 初始化用户拥有的卡片列表（模拟多张卡片数据）
     */
    private initializeUserCards(): void {
        // 基础卡片模板数据
        const baseCards = [
            {
                name: "巨人之岭",
                heroId: "1000",
                class: 0
            },
            {
                name: "知识古树",
                heroId: "1001",
                class: 1
            },
            {
                name: "亡灵射手",
                heroId: "1002",
                class: 2
            },
            {
                name: "炎魔",
                heroId: "1003",
                class: 3
            },
            {
                name: "狮鹫骑士",
                heroId: "1004",
                class: 4
            },
            {
                name: "骑士团长",
                heroId: "1005",
                class: 0
            },
            {
                name: "森林贤者",
                heroId: "1006",
                class: 1
            },
            {
                name: "疯狂博士",
                heroId: "1007",
                class: 2
            },
            {
                name: "急安娜",
                heroId: "1008",
                class: 3
            },
            {
                name: "绿林刺客",
                heroId: "1009",
                class: 4
            },
            {
                name: "砰砰博士",
                heroId: "1010",
                class: 4
            },
            {
                name: "艾格文",
                heroId: "1011",
                class: 3
            },
              {
                name: "硝烟游侠",
                heroId: "1012",
                class: 2
            },
             {
                name: "林歌猎手",
                heroId: "1013",
                class: 2
            },
             {
                name: "地精骑手",
                heroId: "1014",
                class: 1
            },
              {
                name: "蛮角督军",
                heroId: "1015",
                class: 0
            },
             {
                name: "先祖战吼者",
                heroId: "1016",
                class: 2
            },
             {
                name: "恶魔猎手",
                heroId: "1017",
                class: 3
            },
             {
                name: "赤炎剑魔",
                heroId: "1018",
                class: 4
            },
             {
                name: "幽冥骑士",
                heroId: "1019",
                class: 0
            },
             {
                name: "竹海宗师",
                heroId: "1020",
                class: 0
            },
             {
                name: "霜冠帝王",
                heroId: "1021",
                class: 0
            },
             {
                name: "光铸勇士",
                heroId: "1022",
                class: 1
            },
             {
                name: "影渊皇子",
                heroId: "1023",
                class: 1
            },
             {
                name: "暮光教长",
                heroId: "1024",
                class: 1
            },
             {
                name: "岚语信使",
                heroId: "1025",
                class: 2
            },
             {
                name: "神谕者",
                heroId: "1026",
                class: 3
            },
             {
                name: "猩红巫师",
                heroId: "1027",
                class: 3
            },
             {
                name: "炸弹人",
                heroId: "1028",
                class: 4
            },
             {
                name: "秘境守护者",
                heroId: "1029",
                class: 4
            },
             {
                name: "蒸汽空骑",
                heroId: "1030",
                class: 4
            },

        ];

        this._userCards = [];
        let cardIdCounter = 129301;

        // 为每种基础卡片生成3-5张
        baseCards.forEach((baseCard) => {
            const cardCount = this.getRandomInt(3, 5);
            
            for (let i = 0; i < cardCount; i++) {
                const card: CardData = {
                    cardId: cardIdCounter.toString(),
                    name: baseCard.name,
                    heroId: baseCard.heroId,
                    class: baseCard.class,
                    quality: this.getRandomInt(0, 14), // 随机品质0-14（对应品质配置）
                    attackType: this.getRandomInt(0, 4), // 随机攻击类型0-4
                    sLevel: Math.random() < 0.1 ? this.getRandomInt(1, 3) : 0,
                    key: `${baseCard.class}_${baseCard.class}_${this.getRandomInt(0, 14)}_${cardIdCounter}` // 模拟key
                };
                
                this._userCards.push(card);
                cardIdCounter++;
            }
        });

        console.log(`初始化完成，共生成 ${this._userCards.length} 张卡片`);
    }

    /**
     * 根据卡片ID获取卡片数据
     */
    public getCardById(cardId: string): CardData | null {
        return this._userCards.find(card => card.cardId === cardId) || null;
    }

    /**
     * 根据英雄ID获取卡片数据  方便显示，不能用于逻辑判断
     * @param heroId 英雄ID 
     * @returns 卡片数据，如果没有找到则返回null
     */
    public getCardByHeroId(heroId: string): CardData | null {
        return this._userCards.find(card => card.heroId === heroId) || null;
    }

    /**
     * 检查是否拥有指定卡片
     * @param cardId 卡片ID
     * @returns 是否拥有该卡片
     */
    public hasCard(cardId: string): boolean {
        return this._userCards.some(card => card.cardId === cardId);
    }

    /**
     * 获取所有用户卡片
     */
    public getUserCards(): CardData[] {
        return [...this._userCards];
    }

    /**
     * 更新卡片数据
     */
    public updateCard(cardId: string, updates: Partial<CardData>): boolean {
        const cardIndex = this._userCards.findIndex(card => card.cardId === cardId);
        if (cardIndex !== -1) {
            this._userCards[cardIndex] = { ...this._userCards[cardIndex], ...updates };
            return true;
        }
        return false;
    }

    /**
     * 添加新卡片
     */
    public addCard(cardData: CardData): void {
        const existingCard = this._userCards.find(card => card.cardId === cardData.cardId);
        if (!existingCard) {
            // 确保新属性有默认值
            const newCard: CardData = {
                ...cardData,
                sLevel: cardData.sLevel ?? 0
            };
            this._userCards.push(newCard);
        }
    }

    //删除
    public deleteCard(cardId: string): void {
        const cardIndex = this._userCards.findIndex(card => card.cardId === cardId);
        if (cardIndex !== -1) {
            this._userCards.splice(cardIndex, 1);
        }
    }
} 