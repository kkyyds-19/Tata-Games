import { director } from "cc";
import { MailAttachment, MailItem } from "../global/config/MailConfig";
import { UserItemData } from "./UserItemData";
import { game } from "cc";

/**
 * 用户邮件数据管理器
 */
export class UserMailData {
    private static _instance: UserMailData = null;

    public static getInstance(): UserMailData {
        if (!this._instance) {
            this._instance = new UserMailData();
        }
        return this._instance;
    }

    private _mails: { [id: number]: MailItem } = {};
    private _nextMailId = 1;

    constructor() {
        this.initForTest();
    }
    
    /**
     * 用于测试：生成 10-20 封模拟邮件
     */

    public initForTest() {
        this._mails = {};
        this._nextMailId = 1;

        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;

        // 生成模拟邮件
        const mockMails: Omit<MailItem, 'id' | 'sendTime' | 'expireTime'>[] = [
            { type: 'system', title: "欢迎奖励", content: "欢迎来到我们的游戏！这里有一些为您准备的礼物。", sender: "系统", isRead: false, hasAttachment: true, isCollected: false, attachments: [{ itemId: 507, amount: 10000 }, { itemId: 505, amount: 200 }] },
            { type: 'system', title: "维护补偿", content: "我们已经完成了服务器维护。请接受这份补偿。", sender: "系统", isRead: false, hasAttachment: true, isCollected: false, attachments: [{ itemId: 521, amount: 2 }, { itemId: 522, amount: 5 }] },
            { type: 'normal', title: "每日登录奖励", content: "这是您的每日登录奖励。", sender: "系统", isRead: true, hasAttachment: true, isCollected: false, attachments: [{ itemId: 506, amount: 50 }] },
            { type: 'important', title: "成就解锁：一血", content: "您已解锁“一血”成就。恭喜！", sender: "成就中心", isRead: true, hasAttachment: true, isCollected: true, attachments: [{ itemId: 500, amount: 1 }] },
            { type: 'system', title: "每周报告", content: "查看您本周的表现和统计数据。", sender: "系统", isRead: true, hasAttachment: false, isCollected: false },
            { type: 'normal', title: "特别优惠！", content: "不要错过我们的钻石礼包特别优惠！", sender: "推广", isRead: false, hasAttachment: false, isCollected: false },
            { type: 'normal', title: "好友请求已接受", content: "用户“Gemini”已接受您的好友请求。", sender: "社交中心", isRead: true, hasAttachment: false, isCollected: false },
            { type: 'system', title: "合服公告", content: "S1 和 S2 服务器将于下周进行合并。请做好准备。", sender: "系统", isRead: false, hasAttachment: false, isCollected: false },
            { type: 'important', title: "新活动：寻宝", content: "参加我们新的寻宝活动，赢取惊人奖品！", sender: "活动中心", isRead: false, hasAttachment: true, isCollected: false, attachments: [{ itemId: 519, amount: 1 }] },
            { type: 'system', title: "v1.2.0 更新说明", content: "1.2.0 版本现已上线。阅读更新说明以了解新内容。", sender: "系统", isRead: true, hasAttachment: false, isCollected: false },
            { type: 'important', title: "您的月度订阅", content: "您的月度订阅已续订。这是您的奖励。", sender: "系统", isRead: false, hasAttachment: true, isCollected: false, attachments: [{ itemId: 505, amount: 500 }, { itemId: 523, amount: 1 }] },
            { type: 'normal', title: "来自朋友的礼物", content: "您的朋友“Bard”给您送了一份礼物。", sender: "社交中心", isRead: false, hasAttachment: true, isCollected: false, attachments: [{ itemId: 514, amount: 10 }] },
            { type: 'system', title: "调查问卷奖励", content: "感谢您完成我们的调查问卷。这是我们的一点心意。", sender: "系统", isRead: true, hasAttachment: true, isCollected: true, attachments: [{ itemId: 507, amount: 5000 }] },
            { type: 'normal', title: "传说英雄试用", content: "您现在可以试用新的传说英雄3天！", sender: "活动中心", isRead: true, hasAttachment: false, isCollected: false },
            { type: 'important', title: "账号安全警告", content: "我们检测到有新设备登录。如果不是您本人操作，请立即保护您的账号。", sender: "安全中心", isRead: false, hasAttachment: false, isCollected: false },
        ];
        
        mockMails.forEach((mail, index) => {
            const newMail: MailItem = {
                ...mail,
                id: this._nextMailId++,
                sendTime: now - (index * day), // 错开发送时间
                expireTime: now + ((30 - index) * day) // 错开过期时间
            };
            this._mails[newMail.id] = newMail;
        });
    }

    /**
     * 返回所有邮件，排序规则：未读 > 未领取 > 其他
     */
    public getAllMails(): MailItem[] {
        const mails = Object.keys(this._mails).map(key => this._mails[parseInt(key)]);
        mails.sort((a, b) => {
            // 重要邮件总是在最前
            if (a.type === 'important' && b.type !== 'important') return -1;
            if (a.type !== 'important' && b.type === 'important') return 1;

            if (!a.isRead && b.isRead) return -1;
            if (a.isRead && !b.isRead) return 1;
            if (a.hasAttachment && !a.isCollected && (!b.hasAttachment || b.isCollected)) return -1;
            if ((!a.hasAttachment || a.isCollected) && b.hasAttachment && !b.isCollected) return 1;
            return b.sendTime - a.sendTime; // 最新的在前
        });
        return mails;
    }

    /**
     * 通过ID获取特定邮件。
     * @param id 邮件ID
     */
    public getMail(id: number): MailItem | null {
        return this._mails[id] || null;
    }

    /**
     * 将邮件标记为已读。
     * @param id 邮件ID
     */
    public readMail(id: number) {
        if (this._mails[id]) {
            this._mails[id].isRead = true;
        }
    }

    /**
     * 收取单封邮件的附件。
     * @param id 邮件ID
     * @returns 如果收取成功则返回 true，否则返回 false。
     */
    public collectAttachment(id: number): boolean {
        const mail = this._mails[id];
        if (mail && mail.hasAttachment && !mail.isCollected) {
            mail.attachments?.forEach(att => {
                UserItemData.getInstance().addItem(att.itemId, att.amount);
            });
            mail.isCollected = true;
            mail.isRead = true; // 收取附件会将邮件标记为已读
            console.log(`已收取邮件 ${id} 的附件`);
            director.emit(game.gameEvent.DIALOG_ITEM_SHOW, mail.attachments);
            return true;
        }
        console.warn(`无法收取邮件 ${id}。邮件未找到、没有附件或附件已被领取。`);
        return false;
    }

    /**
     * 收取所有可收取邮件的附件。
     * @returns 成功收取附件的邮件数量。
     */
    public collectAllAttachments(): number {
        let collectedCount = 0;
        for (const id in this._mails) {
            const mail = this._mails[id];
            if (mail.hasAttachment && !mail.isCollected) {
                if (this.collectAttachment(mail.id)) {
                    collectedCount++;
                }
            }
        }
        console.log(`一键收取了 ${collectedCount} 封邮件的附件。`);
        return collectedCount;
    }

    /**
     * 删除单封邮件。只有已读/已领取的邮件可以被删除。
     * @param id 邮件ID
     */
    public deleteMail(id: number) {
        const mail = this._mails[id];
        if (mail) {
            // 重要邮件不能被手动删除
            if (mail.type === 'important') {
                console.warn(`无法删除邮件 ${id}。重要邮件不能被删除。`);
                return;
            }
            // 只能删除已读邮件。如果邮件有未领取的附件，则不能删除。
            if (mail.isRead && (!mail.hasAttachment || mail.isCollected)) {
                delete this._mails[id];
                console.log(`已删除邮件 ${id}`);
            } else {
                console.warn(`无法删除邮件 ${id}。邮件未读或有未领取的附件。`);
            }
        }
    }

    /**
     * 删除所有已读且没有未领取附件的邮件。
     * @returns 被删除的邮件数量。
     */
    public deleteAllMails(): number {
        let deletedCount = 0;
        const mailIdsToDelete = [];
        for (const id in this._mails) {
            const mail = this._mails[id];
            // 不删除重要邮件
            if (mail.type !== 'important' && mail.isRead && (!mail.hasAttachment || mail.isCollected)) {
                mailIdsToDelete.push(mail.id);
            }
        }

        mailIdsToDelete.forEach(id => {
            delete this._mails[id];
            deletedCount++;
        });

        console.log(`一键删除了 ${deletedCount} 封邮件。`);
        return deletedCount;
    }
} 