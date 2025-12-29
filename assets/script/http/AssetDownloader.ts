import { assetManager, Asset } from 'cc';

/**
 * 下载选项接口
 */
interface DownloadOptions {
    /**
     * 下载进度回调
     * @param progress - 下载进度 (0.0 to 1.0)
     */
    onProgress?: (progress: number) => void;
    /**
     * 自定义请求头
     */
    headers?: Record<string, string>;
}

/**
 * 远程资源下载器，封装了 Cocos Creator 的 assetManager.loadRemote API。
 * 提供单例模式，支持进度回调和 Promise-based 的完成处理。
 */
export class AssetDownloader {
    private static instance: AssetDownloader;

    private constructor() {}

    /**
     * 获取 AssetDownloader 的单例。
     */
    public static getInstance(): AssetDownloader {
        if (!AssetDownloader.instance) {
            AssetDownloader.instance = new AssetDownloader();
        }
        return AssetDownloader.instance;
    }

    /**
     * 下载远程资源。
     * @param url - 资源的 URL 地址。
     * @param options - 下载选项，包括进度回调和自定义请求头。
     * @returns - 返回一个 Promise，成功时解析为下载的资源 (Asset)，失败时拒绝并返回错误信息。
     * 
     * @example
     * try {
     *     const imageAsset = await AssetDownloader.getInstance().download('http://example.com/image.png', {
     *         onProgress: (p) => console.log(`下载进度: ${p.toFixed(2)}`)
     *     });
     *     // 使用下载好的 imageAsset
     * } catch (error) {
     *     console.error('下载失败:', error);
     * }
     */
    public download<T extends Asset>(url: string, options: DownloadOptions = {}): Promise<T> {
        return new Promise((resolve, reject) => {
            const { onProgress, headers } = options;

            assetManager.loadRemote<T>(url, {
                headers,
                onProgress: (bytesLoaded, bytesTotal) => {
                    if (onProgress) {
                        const progress = bytesTotal > 0 ? bytesLoaded / bytesTotal : 0;
                        onProgress(progress);
                    }
                }
            }, (err, asset) => {
                if (err) {
                    console.error(`[AssetDownloader] Failed to download asset from ${url}:`, err);
                    reject(err);
                } else {
                    resolve(asset);
                }
            });
        });
    }
} 