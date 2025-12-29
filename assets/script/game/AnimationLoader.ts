import { AnimationClip, resources } from 'cc';

/**
 * 动画资源管理器
 * 负责加载和存储AnimationClip资源
 */
export class AnimationLoader {
    
    // 存储已加载的动画剪辑，按路径分组
    private static animationCache: Map<string, Map<string, AnimationClip>> = new Map();
    
    /**
     * 加载指定路径下的所有动画剪辑并存储
     * @param animationPath 动画资源文件夹路径（相对于resources目录）
     * @param onComplete 加载完成回调
     */
    public static loadAllAnimationsFromPath(
        animationPath: string,
        onComplete?: (clips: Map<string, AnimationClip>) => void
    ): void {
        if (!animationPath) {
            console.warn('AnimationLoader: animationPath is not set');
            onComplete && onComplete(new Map());
            return;
        }

        // 检查是否已经加载过该路径的动画
        if (this.animationCache.has(animationPath)) {
            console.log(`AnimationLoader: Animations from ${animationPath} already cached`);
            onComplete && onComplete(this.animationCache.get(animationPath)!);
            return;
        }

        // 加载指定目录下的所有动画剪辑
        resources.loadDir(animationPath, AnimationClip, (err, clips) => {
            if (err) {
                console.error('AnimationLoader: Failed to load animations from', animationPath, err);
                onComplete && onComplete(new Map());
                return;
            }

            console.log(`AnimationLoader: Loaded ${clips.length} animation clips from ${animationPath}`);

            // 创建该路径的动画映射
            const pathClips = new Map<string, AnimationClip>();
            clips.forEach(clip => {
                if (clip) {
                    pathClips.set(clip.name, clip);
                    console.log(`AnimationLoader: Cached clip ${clip.name}`);
                }
            });

            // 存储到缓存中
            this.animationCache.set(animationPath, pathClips);
            
            onComplete && onComplete(pathClips);
        });
    }

    /**
     * 从缓存中获取指定路径的所有动画
     * @param animationPath 动画路径
     * @returns 该路径下的所有动画映射
     */
    public static getAnimationsFromPath(animationPath: string): Map<string, AnimationClip> | null {
        return this.animationCache.get(animationPath) || null;
    }

    /**
     * 从缓存中获取指定的动画剪辑
     * @param animationPath 动画路径
     * @param animationName 动画名称
     * @returns 动画剪辑或null
     */
    public static getAnimationClip(animationPath: string, animationName: string): AnimationClip | null {
        const pathClips = this.animationCache.get(animationPath);
        if (pathClips) {
            return pathClips.get(animationName) || null;
        }
        return null;
    }

    /**
     * 获取指定路径下的所有动画名称列表
     * @param animationPath 动画路径
     * @returns 动画名称数组
     */
    public static getAnimationNames(animationPath: string): string[] {
        const pathClips = this.animationCache.get(animationPath);
        if (pathClips) {
            return Array.from(pathClips.keys());
        }
        return [];
    }

    /**
     * 检查指定路径的动画是否已加载
     * @param animationPath 动画路径
     * @returns 是否已加载
     */
    public static isPathLoaded(animationPath: string): boolean {
        return this.animationCache.has(animationPath);
    }

    /**
     * 清除指定路径的动画缓存
     * @param animationPath 动画路径
     */
    public static clearPathCache(animationPath: string): void {
        this.animationCache.delete(animationPath);
        console.log(`AnimationLoader: Cleared cache for ${animationPath}`);
    }

    /**
     * 清除所有动画缓存
     */
    public static clearAllCache(): void {
        this.animationCache.clear();
        console.log('AnimationLoader: Cleared all animation cache');
    }

    /**
     * 获取缓存状态信息
     */
    public static getCacheInfo(): string {
        let info = `AnimationLoader Cache Info:\n`;
        this.animationCache.forEach((clips, path) => {
            info += `  ${path}: ${clips.size} clips\n`;
        });
        return info;
    }
} 