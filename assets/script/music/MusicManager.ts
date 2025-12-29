import { _decorator, Component, AudioSource, AudioClip, sys, resources, Node, director, game, find } from 'cc';
import { ResourceConfig } from '../global/config/ResourceConfig';
import { GameConfig } from '../global/config/GameConfig';
const { ccclass, property } = _decorator;

@ccclass('MusicManager')
export class MusicManager extends Component {
    // 音效索引常量
    public static readonly SOUND_BUTTON_CLICK = 0;    // 按钮点击音
    public static readonly SOUND_ARROW = 1;           // 箭矢射击
    public static readonly SOUND_ARROW_2 = 2;         // 箭矢射击2
    public static readonly SOUND_ARROW_3 = 3;         // 箭矢射击3
    public static readonly SOUND_ATK_1 = 4;           // 普通攻击1
    public static readonly SOUND_ATK_2 = 5;           // 普通攻击2
    public static readonly SOUND_BOOM_1 = 6;          // 爆炸音效
    public static readonly SOUND_FIRE_BALL = 7;       // 火球发射
    public static readonly SOUND_HP_ADD = 8;          // 回复生命
    public static readonly SOUND_LEVEL_UP_1 = 9;      // 升级提示1
    public static readonly SOUND_LEVEL_UP_2 = 10;     // 升级提示2
    public static readonly SOUND_LIGHT = 11;          // 闪电/光效
    public static readonly SOUND_STON = 12;           // 石头砸击
    public static readonly SOUND_WILD = 13;           // 野性吼叫
    public static readonly SOUND_MONSTER_WARNINGS = 14; // 怪物警告
    public static readonly SOUND_BOSS_WARNING = 15; // boss警告
    public static readonly SOUND_BOSS = 16; // boss 出来


    private musicAudioSource: AudioSource = null!;
    private soundAudioSource: AudioSource = null!;
    private backgroundMusics: AudioClip[] = [];
    private soundEffects: AudioClip[] = [];

    private static readonly STORAGE_KEY = 'knight_audio_settings';

    // 简单的开关状态
    private musicEnabled: boolean =true;
    private soundEnabled: boolean = true;
    private currentMusicIndex: number = 0;

    private static instance: MusicManager = null!;
    private static readonly PERSISTENT_NODE_NAME = 'PersistentAudioManager';


    public static getInstance(): MusicManager {
        return MusicManager.instance;
    }

    /**
     * 清理重复的永驻音频节点，只保留一个
     */
    public static cleanupDuplicatePersistentNodes(): void {
        const persistentNodes: Node[] = [];
        
        // 方法1: 使用 find 查找所有同名节点
        const scene = director.getScene();
        if (scene) {
            const allNodes = scene.children;
            for (let i = 0; i < allNodes.length; i++) {
                const node = allNodes[i];
                if (node.name === MusicManager.PERSISTENT_NODE_NAME && 
                    director.isPersistRootNode(node)) {
                    persistentNodes.push(node);
                }
            }
        }

        console.log(`MusicManager: 找到 ${persistentNodes.length} 个永驻音频节点`);

        if (persistentNodes.length <= 1) {
            console.log('MusicManager: 没有重复的永驻节点需要清理');
            // 即使只有一个节点，也要清理重复的组件
            if (persistentNodes.length === 1) {
                MusicManager.cleanupDuplicateComponents(persistentNodes[0]);
            }
            return;
        }

        // 保留第一个节点，删除其余的
        const nodeToKeep = persistentNodes[0];
        console.log(`MusicManager: 保留节点: ${nodeToKeep.uuid}`);

        // 清理保留节点上的重复组件
        MusicManager.cleanupDuplicateComponents(nodeToKeep);

        for (let i = 1; i < persistentNodes.length; i++) {
            const nodeToRemove = persistentNodes[i];
            console.log(`MusicManager: 删除重复节点: ${nodeToRemove.uuid}`);
            
            // 从永驻节点列表中移除
            director.removePersistRootNode(nodeToRemove);
            
            // 销毁节点
            nodeToRemove.destroy();
        }

        console.log(`MusicManager: 清理完成，删除了 ${persistentNodes.length - 1} 个重复节点`);
    }

    /**
     * 清理节点上重复的 MusicManager 组件，只保留一个
     */
    public static cleanupDuplicateComponents(node: Node): void {
        if (!node || !node.isValid) {
            return;
        }

        const musicManagerComponents = node.getComponents(MusicManager);
        console.log(`MusicManager: 节点 ${node.name} 上找到 ${musicManagerComponents.length} 个 MusicManager 组件`);

        if (musicManagerComponents.length <= 1) {
            console.log('MusicManager: 没有重复的组件需要清理');
            return;
        }

        // 保留第一个组件，删除其余的
        const componentToKeep = musicManagerComponents[0];
        console.log(`MusicManager: 保留组件: ${componentToKeep.uuid}`);

        for (let i = 1; i < musicManagerComponents.length; i++) {
            const componentToRemove = musicManagerComponents[i];
            console.log(`MusicManager: 删除重复组件: ${componentToRemove.uuid}`);
            
            // 如果要删除的组件是当前的单例实例，先清空引用
            if (MusicManager.instance === componentToRemove) {
                MusicManager.instance = null!;
            }
            
            // 销毁组件
            componentToRemove.destroy();
        }

        // 确保保留的组件成为单例实例
        if (!MusicManager.instance || !MusicManager.instance.isValid) {
            MusicManager.instance = componentToKeep;
            console.log('MusicManager: 设置保留的组件为单例实例');
        }

        console.log(`MusicManager: 组件清理完成，删除了 ${musicManagerComponents.length - 1} 个重复组件`);
    }

    /**
     * 严格查找现有的永驻音频节点
     */
    private static findExistingPersistentAudioNode(): Node | null {
        // 方法1: 使用 find 全局查找
        let existingNode = find(MusicManager.PERSISTENT_NODE_NAME);
        
        if (existingNode && director.isPersistRootNode(existingNode)) {
            console.log('MusicManager: 找到现有的永驻音频节点');
            return existingNode;
        }

        // 方法2: 遍历当前场景的根节点查找
        const scene = director.getScene();
        if (scene) {
            const children = scene.children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child.name === MusicManager.PERSISTENT_NODE_NAME && 
                    director.isPersistRootNode(child)) {
                    console.log('MusicManager: 在场景根节点中找到永驻音频节点');
                    return child;
                }
            }
        }

        console.log('MusicManager: 没有找到现有的永驻音频节点');
        return null;
    }

    /**
     * 获取或创建永驻音频节点
     */
    public static getOrCreatePersistentAudioNode(): Node {
        // 首先清理重复节点
        MusicManager.cleanupDuplicatePersistentNodes();
        
        // 严格查找现有的永驻音频节点
        const existingNode = MusicManager.findExistingPersistentAudioNode();
        
        if (existingNode) {
            console.log('MusicManager: 使用现有的永驻音频节点');
            return existingNode;
        }

        // 创建新的永驻音频节点
        const audioNode = new Node(MusicManager.PERSISTENT_NODE_NAME);
        
        // 设置为永驻节点，在场景切换时不会被销毁
        director.addPersistRootNode(audioNode);
        
        console.log('MusicManager: 创建新的永驻音频节点');
        return audioNode;
    }

    /**
     * 初始化 MusicManager 实例
     */
    public static initializeMusicManager(): MusicManager {
        // 如果已有实例且有效，直接返回
        if (MusicManager.instance && MusicManager.instance.node && MusicManager.instance.node.isValid) {
            console.log('MusicManager: 使用现有的 MusicManager 实例');
            return MusicManager.instance;
        }

        // 获取或创建永驻节点
        const persistentNode = MusicManager.getOrCreatePersistentAudioNode();
        
        // 清理节点上重复的组件
        MusicManager.cleanupDuplicateComponents(persistentNode);
        
        // 检查节点上是否已有 MusicManager 组件
        let musicManager = persistentNode.getComponent(MusicManager);
        
        if (!musicManager) {
            // 添加 MusicManager 组件
            musicManager = persistentNode.addComponent(MusicManager);
            console.log('MusicManager: 在永驻节点上创建新的 MusicManager 组件');
        } else {
            console.log('MusicManager: 使用永驻节点上现有的 MusicManager 组件');
        }
        
        return musicManager;
    }

    start() {
        // 检查是否已有实例
        if (MusicManager.instance && MusicManager.instance !== this) {
            // 如果当前不是在永驻节点上，销毁当前实例
            console.log('MusicManager: 发现重复实例，销毁当前实例');
            this.destroy();
            return;
        }

        // 设置单例实例
        MusicManager.instance = this;

        // 确保当前节点是永驻节点
        this.ensurePersistentNode();

        // 清理当前节点上的重复组件
        MusicManager.cleanupDuplicateComponents(this.node);

        // 初始化音频组件
        this.initAudioSources();

        // 加载设置
        this.loadSettings();
        
        // 加载音频资源
        this.loadAudioResources();

        console.log('MusicManager: 初始化完成，运行在永驻节点上');
    }

    /**
     * 确保当前节点是永驻节点
     */
    private ensurePersistentNode() {
        // 如果当前节点不是永驻节点，将其设置为永驻节点
        const isAlreadyPersistent = director.isPersistRootNode(this.node);
        
        if (!isAlreadyPersistent) {
            director.addPersistRootNode(this.node);
            console.log('MusicManager: 将当前节点设置为永驻节点');
        }
    }

    /**
     * 初始化音频组件
     */
    private initAudioSources() {
        // 创建音乐播放器
        const musicNode = new Node('MusicAudioSource');
        musicNode.parent = this.node;
        this.musicAudioSource = musicNode.addComponent(AudioSource);
        this.musicAudioSource.loop = true;
        this.musicAudioSource.volume = 0.7;

        // 创建音效播放器
        const soundNode = new Node('SoundAudioSource');
        soundNode.parent = this.node;
        this.soundAudioSource = soundNode.addComponent(AudioSource);
        this.soundAudioSource.loop = false;
        this.soundAudioSource.volume = 1.0;
    }

    /**
     * 加载音频资源
     */
    private loadAudioResources() {
        // 加载背景音乐文件
        this.loadBackgroundMusics();
        
        // 加载音效文件
        this.loadSoundEffects();
    }

    /**
     * 加载所有背景音乐文件
     */
    private loadBackgroundMusics() {
        let loadedBgmCount = 0;
        const bgmFiles = ResourceConfig.bgmFiles;
        
        console.log(`开始加载 ${bgmFiles.length} 个背景音乐文件...`);
        
        bgmFiles.forEach((path, index) => {
            resources.load(path, AudioClip, (err, clip) => {
                if (!err && clip) {
                    this.backgroundMusics[index] = clip;
                    console.log(`背景音乐加载成功: ${clip.name} (索引: ${index})`);
                } else {
                    console.warn(`背景音乐加载失败: ${path}`, err);
                }
                
                loadedBgmCount++;
                if (loadedBgmCount === bgmFiles.length) {
                    console.log('所有背景音乐加载完成');
                    
                    // 背景音乐加载完成后，如果音乐开启则播放
                    // if (this.musicEnabled && this.backgroundMusics.length > 0) {
                    //     this.playBackgroundMusic();
                    // }
                }
            });
        });
    }

    /**
     * 加载所有音效文件
     */
    private loadSoundEffects() {
        const soundFiles = ResourceConfig.soundFiles;
        let loadedSoundCount = 0;
        
        console.log(`开始加载 ${soundFiles.length} 个音效文件...`);

        soundFiles.forEach((path, index) => {
            resources.load(path, AudioClip, (err, clip) => {
                if (!err && clip) {
                    this.soundEffects[index] = clip;
                    console.log(`音效加载成功: ${clip.name} (索引: ${index})`);
                } else {
                    console.warn(`音效加载失败: ${path}`, err);
                }
                
                loadedSoundCount++;
                if (loadedSoundCount === soundFiles.length) {
                    console.log('所有音效加载完成');
                }
            });
        });
    }

    public playBgmHall(){
        this.setBackgroundMusic(0);
    }

    public playBgmGame(stage:number){
        // 游戏背景音乐从1开始 每过6关换一个背景音乐    取整数  
        let bgmIndex=Math.floor((stage-1)/GameConfig.MAX_SUB_STAGE)+1;
     
        this.setBackgroundMusic(bgmIndex);
    }

    /**
     * 播放背景音乐
     */
    public playBackgroundMusic() {
        if (!this.musicEnabled || !this.musicAudioSource || 
            this.backgroundMusics.length === 0 || 
            this.currentMusicIndex < 0 || 
            this.currentMusicIndex >= this.backgroundMusics.length) {
            return;
        }

        const currentMusic = this.backgroundMusics[this.currentMusicIndex];
        if (currentMusic) {
            this.musicAudioSource.clip = currentMusic;
            this.musicAudioSource.loop = true;
            this.musicAudioSource.play();
        }
    }

    /**
     * 停止背景音乐
     */
    public stopBackgroundMusic() {
        if (this.musicAudioSource) {
            this.musicAudioSource.stop();
        }
    }

    /**
     * 播放音效
     * @param soundIndex 音效索引
     */
    public playSound(soundIndex: number) {
        if (!this.soundEnabled || !this.soundAudioSource || soundIndex < 0 || soundIndex >= this.soundEffects.length) {
            return;
        }

        const soundClip = this.soundEffects[soundIndex];
        if (soundClip) {
            this.soundAudioSource.playOneShot(soundClip);
        }
    }

    /**
     * 播放按钮点击音效
     */
    public playButtonClickSound() {
        this.playSound(MusicManager.SOUND_BUTTON_CLICK);
    }

   

    /**
     * 切换音乐开关
     */
    public toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        
        if (this.musicEnabled) {
            this.playBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
        
        this.saveSettings();
    }

    /**
     * 切换音效开关
     */
    public toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveSettings();
    }

    /**
     * 切换到下一首背景音乐
     */
    public nextBackgroundMusic() {
        if (this.backgroundMusics.length <= 1) {
            return;
        }

        this.currentMusicIndex = (this.currentMusicIndex + 1) % this.backgroundMusics.length;
        
        if (this.musicEnabled) {
            this.playBackgroundMusic();
        }
        
        this.saveSettings();
    }

    

    /**
     * 设置指定索引的背景音乐
     */
    public setBackgroundMusic(index: number) {
        if (index < 0 || index >= this.backgroundMusics.length) {
            return;
        }

        this.currentMusicIndex = index;
        this.stopBackgroundMusic();
        
        
        if (this.musicEnabled) {
            this.playBackgroundMusic();
        }
        
        this.saveSettings();
    }

    /**
     * 获取当前背景音乐索引
     */
    public getCurrentMusicIndex(): number {
        return this.currentMusicIndex;
    }

    /**
     * 获取背景音乐总数
     */
    public getBackgroundMusicCount(): number {
        return this.backgroundMusics.length;
    }

    /**
     * 设置音乐开关
     */
    public setMusicEnabled(enabled: boolean) {
        this.musicEnabled = enabled;
        
        if (enabled) {
            this.playBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
        
        this.saveSettings();
    }

    /**
     * 设置音效开关
     */
    public setSoundEnabled(enabled: boolean) {
        this.soundEnabled = enabled;
        this.saveSettings();
    }

    /**
     * 获取音乐开关状态
     */
    public isMusicEnabled(): boolean {
        return this.musicEnabled;
    }

    /**
     * 获取音效开关状态
     */
    public isSoundEnabled(): boolean {
        return this.soundEnabled;
    }

    /**
     * 保存设置到本地存储
     */
    private saveSettings() {
        const settings = {
            musicEnabled: this.musicEnabled,
            soundEnabled: this.soundEnabled,
            currentMusicIndex: this.currentMusicIndex
        };
        sys.localStorage.setItem(MusicManager.STORAGE_KEY, JSON.stringify(settings));
    }

    /**
     * 从本地存储加载设置
     */
    private loadSettings() {
        const settingsStr = sys.localStorage.getItem(MusicManager.STORAGE_KEY);
        
        if (settingsStr) {
            try {
                const settings = JSON.parse(settingsStr);
                this.musicEnabled = settings.musicEnabled !== undefined ? settings.musicEnabled : true;
                this.soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
                this.currentMusicIndex = settings.currentMusicIndex !== undefined ? settings.currentMusicIndex : 0;
                
                // 确保索引在有效范围内
                if (this.currentMusicIndex < 0 || this.currentMusicIndex >= this.backgroundMusics.length) {
                    this.currentMusicIndex = 0;
                }
            } catch (e) {
                // 解析失败，使用默认值
                this.musicEnabled = true;
                this.soundEnabled = true;
                this.currentMusicIndex = 0;
            }
        }
    }



    onDestroy() {
        //先停止所有音乐
        this.stopBackgroundMusic();

        if (MusicManager.instance === this) {
            MusicManager.instance = null!;
            console.log('MusicManager destroyed');
        }
    }
} 