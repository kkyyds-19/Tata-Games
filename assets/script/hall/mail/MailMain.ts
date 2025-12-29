import { _decorator, Component, Node, Button, Prefab, instantiate, ScrollView, Label } from 'cc';
import { MailItem as MailData } from '../../global/config/MailConfig';
import { UserMailData } from '../../user/UserMailData';
import { MailItem } from './MailItem';
import { MailDetail } from './MailDetail';
import { Layout } from 'cc';
import { director } from 'cc';
import { emailAPI } from '../../api/API';
import { ShowToast } from '../../global/Toast';
import { convertEmailRecordsToMailItems } from '../../api/APITypes';

const { ccclass, property } = _decorator;

type MailFilterType = 'system' | 'important';

@ccclass('MailMain')
export class MailMain extends Component {

    @property(Button)
    systemFilterButton: Button = null!;

    @property(Button)
    importantFilterButton: Button = null!;

    @property(Button)
    claimAllButton: Button = null!;

    @property(Button)
    deleteAllButton: Button = null!;

    @property(Node)
    noMailPanel: Node = null!;

    @property(Prefab)
    mailItemPrefab: Prefab = null!;

    @property(Node)
    listContent: Node = null!;

    @property(MailDetail)
    mailDetail: MailDetail = null!;

    @property(Node)
    mailListContainer: Node = null!;

    @property(Node)
    loadingPanel: Node = null!;

    @property(Label)
    loadingLabel: Label = null!;

    private _currentFilter: MailFilterType = 'system'; // 默认显示系统邮件
    private _allMails: MailData[] = [];
    private _isLoading: boolean = false;
    
    // 控制使用真实数据还是模拟数据
    private _useMockData: boolean = false; // true=使用模拟数据, false=使用真实数据

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, (event) => {
            // 阻止事件冒泡到下层，避免误触关闭
            // event.propagationStopped = true;
            return
        });

        this.systemFilterButton.node.on(Node.EventType.TOUCH_END, this.onSystemFilterClicked, this);
        this.importantFilterButton.node.on(Node.EventType.TOUCH_END, this.onImportantFilterClicked, this);
        this.claimAllButton.node.on(Node.EventType.TOUCH_END, this.onClaimAllClicked, this);
        this.deleteAllButton.node.on(Node.EventType.TOUCH_END, this.onDeleteAllClicked, this);
        director.on('mail_collect', this.onMailCollect, this);

        // 添加全局访问方法，方便在控制台调试
        // (window as any).mailMain = this;
        // console.log('MailMain已加载，可通过以下方法调试:');
        // console.log('- mailMain.switchDataSource(true/false) - 切换数据源');
        // console.log('- mailMain.toggleDataSource() - 切换数据源状态');
        // console.log('- mailMain.getDataSourceStatus() - 获取当前数据源状态');
        // console.log('- mailMain.testLoadFromServer() - 手动加载数据');
    }

    private onMailCollect(id: number) {
        // 单个邮件收集后，重新加载邮件列表
        this.refreshMailList();
        this.closeDetail();
    }

    onDestroy() {
        director.off('mail_collect', this.onMailCollect, this);
    }

    onEnable() {
        this.mailDetail.hide();
        this.mailListContainer.active = true;
        this.showLoading(false); // 确保加载面板隐藏
        // 应用默认筛选状态
        this.updateFilterButtons();
    }

    /**
     * 显示邮件主界面
     */
    public show() {
        this.node.active = true;
        // 显示时强制从服务器刷新数据
        this.refreshMailList();
    }
    public hide() {
        this.node.active = false;
    }

    /**
     * 刷新整个邮件列表
     */
    public refreshMailList() {
        this.loadMailsFromServer();
    }

    /**
     * 从服务器加载邮件数据
     */
    private loadMailsFromServer() {
        if (this._isLoading) {
            return; // 防止重复请求
        }

        this._isLoading = true;
        this.showLoading(true);
        this.updateLoadingText('正在加载邮件...');

        // 根据配置选择数据源
        const dataPromise = this._useMockData 
            ? emailAPI.getMockEmailList() 
            : emailAPI.getEmailList();
            
        dataPromise.then((result: any) => {
            const dataType = this._useMockData ? '模拟' : '真实';
            let mailItems: MailData[];
            
            if (this._useMockData) {
                // 模拟数据直接返回MailItem[]
                mailItems = result;
            } else {
                // 真实数据需要从EmailListResponse中提取
                const emailRecords = result.data || [];
                mailItems = convertEmailRecordsToMailItems(emailRecords);
            }
            
            console.log(`${dataType}邮件数据加载成功，数量:`, mailItems.length);
            console.log('邮件数据详情:', mailItems);
            this._allMails = mailItems;
            this.renderFilteredMails();
            this.updateActionButtons();
            this.showLoading(false);
        })
            .catch((error) => {
                console.error('邮件数据加载失败:', error);
                console.error('错误详情:', {
                    message: error.message,
                    stack: error.stack,
                    error: error
                });
                ShowToast('邮件加载失败，请重试');
                this.showLoading(false);
                // 清空邮件列表，不显示任何数据
                this._allMails = [];
                this.renderFilteredMails();
                this.updateActionButtons();
            })
            .finally(() => {
                this._isLoading = false;
            });
    }

    /**
     * 显示/隐藏加载状态
     */
    private showLoading(show: boolean) {
        if (this.loadingPanel) {
            this.loadingPanel.active = show;
        }
        if (this.mailListContainer) {
            this.mailListContainer.active = !show;
        }
    }

    /**
     * 更新加载文本
     */
    private updateLoadingText(text: string) {
        if (this.loadingLabel) {
            this.loadingLabel.string = text;
        }
    }

    /**
     * 由 MailItem 调用，用于显示邮件详情
     * @param data 邮件数据
     */
    public showMailDetail(data: MailData) {
        this.mailListContainer.active = false;
        this.mailDetail.show(data);
    }

    /**
     * 从详情返回列表时调用
     */
    public hideMailDetail() {
        this.mailDetail.hide();
        this.mailListContainer.active = true;
        this.refreshMailList(); // 刷新列表以反映状态变化（如已读/已领取）
    }

    // private onFilterClicked(button: Button) {
    //     // const filterType = button === this.systemFilterButton ? 'system' : 'important';

    //      this._currentFilter=this._currentFilter==='system'?'important':'system';

    //     this.applyFilter();
    // }

    //系统邮件按钮按下
    private onSystemFilterClicked() {
        this._currentFilter = 'system';
        this.applyFilter();
    }

    //重要邮件按钮按下
    private onImportantFilterClicked() {
        this._currentFilter = 'important';
        this.applyFilter();
    }

    private applyFilter() {
        this.updateFilterButtons();
        // 总是重新加载数据，确保数据最新
        this.refreshMailList();
    }

    private updateFilterButtons() {
        const systemLight = this.systemFilterButton.node.getChildByName('light');
        const importantLight = this.importantFilterButton.node.getChildByName('light');
        systemLight.active=false
        importantLight.active=false
        if(this._currentFilter==='system'){
            systemLight.active=true
        }else{
            importantLight.active=true
        }
        // if (systemLight) systemLight.active = this._currentFilter === 'system';
        // if (importantLight) importantLight.active = this._currentFilter === 'important';




    }
    
    private onClaimAllClicked() {
        this.updateLoadingText('正在领取所有奖励...');
        this.showLoading(true);

        // 根据配置选择操作方式
        const operationPromise = this._useMockData 
            ? emailAPI.mockReceiveAllRewards() 
            : emailAPI.receiveAllRewards();
            
        operationPromise.then((result) => {
            const dataType = this._useMockData ? '模拟' : '真实';
            console.log(`${dataType}一键领取成功:`, result);
            
            if (this._useMockData && result.data.collectedCount) {
                ShowToast(`奖励领取成功！${result.data.collectedCount}封邮件`);
            } else {
                ShowToast('奖励领取成功！');
            }
            
            this.refreshMailList(); // 重新加载邮件列表
        })
            .catch((error) => {
                console.error('一键领取失败:', error);
                console.error('领取错误详情:', {
                    message: error.message,
                    stack: error.stack,
                    error: error
                });
                ShowToast('领取失败，请重试');
                this.showLoading(false);
            });
    }

    private onDeleteAllClicked() {
        this.updateLoadingText('正在删除所有邮件...');
        this.showLoading(true);

        // 根据配置选择操作方式
        const operationPromise = this._useMockData 
            ? emailAPI.mockDeleteAllEmails() 
            : emailAPI.deleteAllEmails();
            
        operationPromise.then((result) => {
            const dataType = this._useMockData ? '模拟' : '真实';
            console.log(`${dataType}一键删除成功:`, result);
            
            if (this._useMockData && result.data.deletedCount) {
                ShowToast(`邮件删除成功！${result.data.deletedCount}封邮件`);
            } else {
                ShowToast('邮件删除成功！');
            }
            
            this.refreshMailList(); // 重新加载邮件列表
        })
            .catch((error) => {
                console.error('一键删除失败:', error);
                console.error('删除错误详情:', {
                    message: error.message,
                    stack: error.stack,
                    error: error
                });
                ShowToast('删除失败，请重试');
                this.showLoading(false);
            });
    }

    private renderFilteredMails() {
        const content = this.listContent;
        content.removeAllChildren();
        
        const filteredMails = this._allMails.filter(mail => {
            if (this._currentFilter === 'important') {
                // 重要邮件筛选：只显示重要邮件
                return mail.type === 'important';
            } else if (this._currentFilter === 'system') {
                // 系统邮件筛选：显示系统邮件和普通邮件（非重要邮件）
                return mail.type !== 'important';
            }
            return false; // 默认不显示任何邮件
        });

        console.log(`筛选条件: ${this._currentFilter}, 筛选结果: ${filteredMails.length}封邮件`);
        this.noMailPanel.active = filteredMails.length === 0;

        filteredMails.forEach(mailData => {
            const mailNode = instantiate(this.mailItemPrefab);
            const mailItem = mailNode.getComponent(MailItem)!;
            mailItem.init(mailData, this);
            content.addChild(mailNode);
        });
        content.getComponent(Layout).updateLayout();
    }

    private updateActionButtons() {
        // 检查是否有任何可领取的邮件
        // const hasClaimable = this._allMails.some(m => m.hasAttachment && !m.isCollected);
        // this.claimAllButton.interactable = hasClaimable;

        // // 检查是否有任何可删除的邮件（非重要，已读，无未领取附件）
        // const hasDeletable = this._allMails.some(m => m.type !== 'important' && m.isRead && (!m.hasAttachment || m.isCollected));
        // this.deleteAllButton.interactable = hasDeletable;
    }

    public closeDetail() {
        this.mailDetail.hide();
        this.mailListContainer.active = true;
    }

    /**
     * 测试方法：手动触发服务器数据加载
     * 用于调试和测试
     */
    public testLoadFromServer() {
        console.log('手动触发服务器数据加载测试');
        this.loadMailsFromServer();
    }

    /**
     * 切换数据源（模拟数据/真实数据）
     * @param useMockData true=使用模拟数据, false=使用真实数据
     */
    public switchDataSource(useMockData: boolean) {
        this._useMockData = useMockData;
        const dataType = useMockData ? '模拟数据' : '真实数据';
        console.log(`切换到${dataType}`);
        ShowToast(`已切换到${dataType}`);
        
        // 重新加载数据
        this.refreshMailList();
    }

    /**
     * 获取当前数据源状态
     * @returns true=使用模拟数据, false=使用真实数据
     */
    public getDataSourceStatus(): boolean {
        return this._useMockData;
    }

    /**
     * 切换数据源状态（在模拟和真实之间切换）
     */
    public toggleDataSource() {
        this.switchDataSource(!this._useMockData);
    }
}
