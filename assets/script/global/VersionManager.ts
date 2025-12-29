import { resources, JsonAsset } from 'cc';

/**
 * 版本数据接口，定义了从assets_versions.json中获取的数据结构。
 */
interface IVersionData {
    [key: string]: string;
}

/**
 * 关卡配置接口
 */
interface IStageConfig {
    exp_per_level: number;        // 每级所需经验值
    enable_monster_exp: boolean;  // 是否启用脚本经验系统（true=从脚本获取，false=固定经验）
}

/**
 * 怪物经验配置接口
 */
interface IMonsterExpConfig {
    normal: number;  // 普通怪经验值
    elite: number;   // 精英怪经验值
}

/**
 * Boss经验配置接口
 */
interface IBossExpConfig {
    mid: number;     // 中期Boss经验值
    final: number;   // 最终Boss经验值
}

/**
 * 单个关卡规则配置接口
 */
interface IStageRule {
    exp_per_level: number;        // 每级所需经验值
    enable_monster_exp: boolean;  // 是否启用脚本经验系统
    monster_exp?: IMonsterExpConfig;  // 怪物经验配置（可选）
    boss_exp?: IBossExpConfig;        // Boss经验配置（可选）
}

/**
 * 关卡规则配置接口
 */
interface IStageRules {
    [stageNumber: string]: IStageRule;
}

/**
 * 版本管理器（单例）
 * 负责获取、存储和查询资源的版本信息。
 */
export class VersionManager {
    private static instance: VersionManager;
    private versions: IVersionData = {};

    private constructor() {}

    /**
     * 获取VersionManager的单例实例。
     */
    public static getInstance(): VersionManager {
        if (!VersionManager.instance) {
            VersionManager.instance = new VersionManager();
        }
        return VersionManager.instance;
    }

    /**
     * 初始化版本管理器，存入从服务器获取的版本数据。
     * @param versionData - 从 assets_versions.json 获取的原始版本数据对象。
     */
    public initialize(versionData: IVersionData): void {
        this.versions = versionData;
        console.log("✅ 版本管理器初始化成功", this.versions);
    }

    /**
     * 获取指定资源的版本号。
     * @param resourceName - 资源的文件名 (例如 "stage1.json")。
     * @returns - 返回该资源的版本号字符串，如果不存在则返回null。
     */
    public getVersion(resourceName: string): string | null {
        return this.versions[resourceName] || null;
    }

    /**
     * 获取关卡配置
     * @returns 关卡配置对象，如果不存在则返回默认配置
     */
    public getStageConfig(): IStageConfig {
        const config = this.versions['stage_config'] as any;
        if (config && typeof config === 'object') {
            return {
                exp_per_level: config.exp_per_level || 25,
                enable_monster_exp: config.enable_monster_exp || false
            };
        }
        
        // 返回默认配置：25经验/级，启用固定经验系统（不使用脚本经验）
        return {
            exp_per_level: 25,
            enable_monster_exp: false
        };
    }

    /**
     * 获取指定关卡的配置
     * @param stageNumber 关卡编号
     * @returns 关卡配置对象，如果不存在则返回全局默认配置
     */
    public getStageRule(stageNumber: number): IStageRule {
        const config = this.versions['stage_config'] as any;
        if (config && config.stage_rules && config.stage_rules[stageNumber.toString()]) {
            const stageRule = config.stage_rules[stageNumber.toString()];
            return {
                exp_per_level: stageRule.exp_per_level || config.exp_per_level || 25,
                enable_monster_exp: stageRule.enable_monster_exp !== undefined ? stageRule.enable_monster_exp : (config.enable_monster_exp || false),
                monster_exp: stageRule.monster_exp,
                boss_exp: stageRule.boss_exp
            };
        }
        
        // 如果没有特定关卡配置，返回全局配置
        return this.getStageConfig();
    }

    /**
     * 获取指定关卡的怪物经验配置
     * @param stageNumber 关卡编号
     * @returns 怪物经验配置，如果不存在则返回null
     */
    public getMonsterExpConfig(stageNumber: number): IMonsterExpConfig | null {
        const stageRule = this.getStageRule(stageNumber);
        return stageRule.monster_exp || null;
    }

    /**
     * 获取指定关卡的Boss经验配置
     * @param stageNumber 关卡编号
     * @returns Boss经验配置，如果不存在则返回null
     */
    public getBossExpConfig(stageNumber: number): IBossExpConfig | null {
        const stageRule = this.getStageRule(stageNumber);
        return stageRule.boss_exp || null;
    }

    /**
     * 从本地读取关卡配置
     * @param callback 回调函数，参数为配置对象或null
     */
    public loadStageConfigFromLocal(callback: (config: any) => void): void {
        // 从本地resources目录加载assets_versions.json
        resources.load('stage/assets_versions', JsonAsset, (err: any, jsonAsset: any) => {
            if (err) {
                console.warn('无法从本地加载assets_versions.json:', err);
                callback(null);
                return;
            }

            try {
                const config = jsonAsset.json;
                if (config && config.stage_config) {
                    console.log('✅ 成功从本地加载关卡配置:', config.stage_config);
                    callback(config.stage_config);
                } else {
                    console.warn('本地assets_versions.json中没有找到stage_config配置');
                    callback(null);
                }
            } catch (error) {
                console.error('解析本地关卡配置时出错:', error);
                callback(null);
            }
        });
    }

    /**
     * 从本地读取并初始化关卡配置
     * 如果服务器配置不存在，则使用本地配置作为后备
     */
    public initializeStageConfigFromLocal(): void {
        this.loadStageConfigFromLocal((localConfig) => {
            if (localConfig) {
                // 检查当前是否已有服务器配置
                const currentConfig = this.versions['stage_config'];
                if (!currentConfig) {
                    // 如果没有服务器配置，使用本地配置
                    this.versions['stage_config'] = localConfig;
                    console.log('✅ 使用本地关卡配置初始化:', localConfig);
                } else {
                    console.log('ℹ️ 已有服务器配置，本地配置作为后备');
                }
            }
        });
    }
} 