import { _decorator, Component, Node, Label, Prefab, instantiate } from 'cc';
import { MailItem as MailData } from '../../global/config/MailConfig';
import { GameItemIcon } from '../GameItemIcon';
import { UserMailData } from '../../user/UserMailData';
import { director } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('MailDetail')
export class MailDetail extends Component {

    @property(Label)
    titleLabel: Label = null!;

    @property(Label)
    contentLabel: Label = null!;

    @property(Label)
    senderLabel: Label = null!;

    @property(Node)
    bouns_tag: Node = null!;

    @property(Node)
    attachmentContainer: Node = null!;

    @property(Prefab)
    itemIconPrefab: Prefab = null!;

    @property(Node)
    collectButton: Node = null!;

    private _mailData: MailData = null!;

    onLoad() {
        this.collectButton.on(Node.EventType.TOUCH_END, this.onCollectButtonClicked, this);
        
    }

    /**
     * 显示邮件详情
     * @param data 邮件数据
     */
    public show(data: MailData) {
        this._mailData = data;
        this.node.active = true;
        this.refresh();
    }

    /**
     * 隐藏邮件详情
     */
    public hide() {
        this.node.active = false;
    }

    /**
     * 根据当前数据刷新UI
     */
    public refresh() {
        if (!this._mailData) {
            this.hide();
            return;
        }

        this.titleLabel.string = this._mailData.title;
        this.contentLabel.string = this._mailData.content;
        this.senderLabel.string = `发件人: ${this._mailData.sender}`;

        this.attachmentContainer.removeAllChildren();

        if (this._mailData.hasAttachment && this._mailData.attachments) {
            this._mailData.attachments.forEach(attachment => {
                const itemNode = instantiate(this.itemIconPrefab);
                const itemIcon = itemNode.getComponent(GameItemIcon);
                if (itemIcon) {
                    itemIcon.init(attachment.itemId); // 假设图集在预制体上已经挂好
                }
                itemIcon.setCollected(this._mailData.isCollected);
                itemIcon.setCount(attachment.amount);
                this.attachmentContainer.addChild(itemNode);
            });
        }

        //如果attachmentContainer 子节点大于0则显示，否则隐藏
        this.attachmentContainer.active = this._mailData.attachments && this._mailData.attachments.length > 0;

        this.bouns_tag.active=this.attachmentContainer.active
        
        // 如果有附件且未领取，则显示收取按钮
        this.collectButton.active = this._mailData.hasAttachment && !this._mailData.isCollected;
    }

    /**
     * 点击“收取”按钮
     */
    private onCollectButtonClicked() {
        if (!this._mailData || !this._mailData.hasAttachment || this._mailData.isCollected) {
            return;
        }

        const success = UserMailData.getInstance().collectAttachment(this._mailData.id);
        if (success) {
            // 更新邮件数据并刷新UI
            this._mailData = UserMailData.getInstance().getMail(this._mailData.id)!;
            this.refresh();
            
            // 这里可以通知主界面刷新列表，或者由主界面自己监听
            
            // this._mailMain.refreshMailList(); 
        }

        director.emit('mail_collect', this._mailData.id);
       
        // this.hide();
    }

    onDestroy() {
    }
}
