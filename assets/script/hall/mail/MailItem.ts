import { _decorator, Component, Node, Label, Button } from 'cc';
import { MailItem as MailData } from '../../global/config/MailConfig';
import { UserMailData } from '../../user/UserMailData';
import { Utils } from '../../utils/Utils';

const { ccclass, property } = _decorator;

@ccclass('MailItem')
export class MailItem extends Component {

    @property(Node)
    readIcon: Node = null!;

    @property(Node)
    unreadIcon: Node = null!;

    @property(Label)
    titleLabel: Label = null!;

    @property(Label)
    timeLabel: Label = null!;

    @property(Label)
    importantLabel: Label = null!;

    @property(Button)
    viewButton: Button = null!;

    private _mailData: MailData = null!;
    private _mailMain: any = null; // 稍后替换为 MailMain 控制器

    onLoad() {
        this.viewButton.node.on(Node.EventType.TOUCH_END, this.onViewButtonClicked, this);
    }

    private _padZero(num: number): string {
        return num < 10 ? '0' + num : String(num);
    }

    /**
     * 初始化邮件项
     * @param data 邮件数据
     * @param main 主控制器
     */
    public init(data: MailData, main: any) {
        this._mailData = data;
        this._mailMain = main;
        this.refresh();
    }

    /**
     * 根据当前数据刷新UI
     */
    public refresh() {
        if (!this._mailData) {
            return;
        }

        // 设置标题
        this.titleLabel.string = this._mailData.title;

        // 设置已读/未读图标
        this.readIcon.active = this._mailData.isRead;
        this.unreadIcon.active = !this._mailData.isRead;

        // 设置发送时间标签
        const sendDate = new Date(this._mailData.sendTime);
        const year = sendDate.getFullYear();
        const month = this._padZero(sendDate.getMonth() + 1);
        const day = this._padZero(sendDate.getDate());
        const hours = this._padZero(sendDate.getHours());
        const minutes = this._padZero(sendDate.getMinutes());
        this.timeLabel.string = `${year}/${month}/${day} ${hours}:${minutes}`;

        // 停止之前的倒计时
        this.unschedule(this.updateImportantLabel);
        
        // 设置重要信息标签（附件过期倒计时）
        if (this._mailData.hasAttachment && !this._mailData.isCollected) {
            this.importantLabel.node.active = true;
            this.updateImportantLabel(); // 立即更新一次
            this.schedule(this.updateImportantLabel, 1);
        } else {
            this.importantLabel.node.active = false;
        }
    }

    /**
     * 更新重要标签（附件过期倒计时）
     */
    private updateImportantLabel() {
        const remainingTime = this._mailData.expireTime - Date.now();

        if (remainingTime <= 0) {
            this.importantLabel.string = "附件已过期";
            this.unschedule(this.updateImportantLabel);
            return;
        }

        const DAY_MS = 24 * 60 * 60 * 1000;
        const HOUR_MS = 60 * 60 * 1000;

        if (remainingTime > DAY_MS) {
            const days = Math.ceil(remainingTime / DAY_MS);
            this.importantLabel.string = `有附件，将在 ${days}天 后过期`;
        } else if (remainingTime > HOUR_MS) {
            const hours = Math.ceil(remainingTime / HOUR_MS);
            this.importantLabel.string = `有附件，将在 ${hours}小时 后过期`;
        } else {
            const minutes = Math.floor(remainingTime / (60 * 1000));
            const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
            this.importantLabel.string = `有附件，将在 ${this._padZero(minutes)}分${this._padZero(seconds)}秒 后过期`;
        }
    }

    /**
     * 点击“查看”按钮
     */
    private onViewButtonClicked() {
        if (!this._mailData.isRead) {
            UserMailData.getInstance().readMail(this._mailData.id);
            this._mailData.isRead = true; // 立即更新本地状态
        }
        
        // 通知主控制器显示邮件详情
        if (this._mailMain && this._mailMain.showMailDetail) {
            this._mailMain.showMailDetail(this._mailData);
        }
        
        this.refresh(); // 刷新UI
    }

    onDestroy() {
        this.unschedule(this.updateImportantLabel);
    }
}
