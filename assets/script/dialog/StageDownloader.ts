import { _decorator, Component, Node, ProgressBar, Label, Button, JsonAsset, game } from 'cc';
import { AssetDownloader } from '../http/AssetDownloader';
import { NetworkConfig } from '../global/config/NetworkConfig';
import { VersionManager } from '../global/VersionManager';

const { ccclass, property } = _decorator;

@ccclass('StageDownloader')
export class StageDownloader extends Component {

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(Label)
    detailLabel: Label = null;

    @property(Button)
    downloadButton: Button = null;

    private _totalStages = 30;
    private _downloadedCount = 0;
    private _isDownloading = false;
    private _shouldStop = false;

    onLoad() {
        this.downloadButton.node.on(Button.EventType.CLICK, this.onDownloadClicked, this);
        this.resetUI();
    }

    /**
     * 显示下载组件。
     */
    public show(): void {
        this.node.active = true;
        this.resetUI();
    }

    /**
     * 隐藏下载组件。
     */
    public hide(): void {
        this.node.active = false;
        // 停止下载任务
        this.stopDownload();
    }

    /**
     * 停止下载任务
     */
    private stopDownload(): void {
        this._shouldStop = true;
        this._isDownloading = false;
        console.log('下载任务已停止');
    }

    /**
     * 重置UI到初始状态。
     */
    private resetUI(): void {
        this.progressBar.progress = 0;
        this.detailLabel.string = '准备下载关卡文件...';
        this.downloadButton.interactable = true;
        this._shouldStop = false;
        this._isDownloading = false;
    }

    /**
     * "开始下载"按钮点击事件处理函数。
     */
    private async onDownloadClicked(): Promise<void> {
        if (this._isDownloading) {
            return;
        }

        this._isDownloading = true;
        this._shouldStop = false;
        this.downloadButton.interactable = false;
        
        if (!this._shouldStop) {
            await this.fetchVersionData();
        }
        
        // 2. 然后开始下载关卡文件
        this._downloadedCount = 0;

        for (let i = 1; i <= this._totalStages && !this._shouldStop; i++) {
            const fileName = `stage${i}.json`;
            let url = `${NetworkConfig.STAGE_DATA_BASE_URL}${i}.json`;
            
            const version = VersionManager.getInstance().getVersion(fileName);
            if (version) {
                url += `?v=${version}`;
            }

            this.detailLabel.string = `正在下载: ${fileName}... v=${version}`;

            try {
                if (!this._shouldStop) {
                    await AssetDownloader.getInstance().download<JsonAsset>(url);
                    game.myGlobal.downloadedAssets.add(url);
                }
            } catch (error) {
                if (!this._shouldStop) {
                    console.error(`❌ 下载失败: ${fileName}`, error);
                }
                // 即使失败，也继续尝试下一个
            } finally {
                if (!this._shouldStop) {
                    this._downloadedCount++;
                    const progress = this._downloadedCount / this._totalStages;
                    this.progressBar.progress = progress;
                }
            }
        }

        if (this._shouldStop) {
            this.detailLabel.string = '下载已停止';
            this.downloadButton.interactable = true;
        } else {
            this.detailLabel.string = '所有关卡文件下载完成！';
            
            // 自动隐藏
            this.scheduleOnce(() => {
                if (!this._shouldStop) {
                    this.hide();
                }
            }, 2);
        }

        this._isDownloading = false;
    }

    /**
     * 获取并初始化版本数据，与 welcome.ts 中的方法类似。
     */
    private async fetchVersionData(): Promise<void> {
        try {
            this.detailLabel.string = "正在获取版本信息...";
            // 附加时间戳来"破坏"缓存，确保每次都获取最新的版本文件
            const url = `${NetworkConfig.ASSETS_VERSIONS_URL}?nocache=${new Date().getTime()}`;
            const versionAsset = await AssetDownloader.getInstance().download<JsonAsset>(url);
            VersionManager.getInstance().initialize(versionAsset.json);
        } catch (error) {
            console.warn("获取远程版本文件失败，下载将使用旧版本信息或不带版本号。", error);
            // 此处不重置VersionManager，以防welcome.ts中已有成功获取的版本
            this.detailLabel.string = "获取版本信息失败，继续下载...";
            // 短暂显示错误后继续
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    onDestroy() {
        // 组件销毁时停止下载
        this.stopDownload();
    }
} 
