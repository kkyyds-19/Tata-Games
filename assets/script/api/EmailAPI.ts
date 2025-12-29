import { BaseAPI } from "./BaseAPI";
import { 
    EmailListResponse,
    ReceiveEmailRewardRequest,
    ReceiveEmailRewardResponse,
    DeleteEmailRequest,
    DeleteEmailResponse,
    ReceiveAllRewardsResponse,
    DeleteAllEmailsResponse,
    EmailRecord,
    convertEmailRecordsToMailItems
} from "./APITypes";
import { MailItem } from "../global/config/MailConfig";

/**
 * 邮箱相关 API
 */
export class EmailAPI extends BaseAPI {
    /**
     * 查询用户邮件记录列表
     * @returns Promise<EmailListResponse>
     */
    getEmailList(): Promise<EmailListResponse> {
        return this.request('email.getEmailList', {}, '获取邮件列表失败')
            .then((response: EmailListResponse) => {
                console.log('邮件列表响应:', response);
                return response;
            });
    }

    /**
     * 领取奖励
     * @param id 邮件ID
     * @returns Promise<ReceiveEmailRewardResponse>
     */
    receiveEmailReward(id: number): Promise<ReceiveEmailRewardResponse> {
        const params: ReceiveEmailRewardRequest = { id };
        return this.request('email.receiveEmailReward', params, '领取邮件奖励失败')
            .then((response: ReceiveEmailRewardResponse) => {
                console.log('领取邮件奖励响应:', response);
                return response;
            });
    }

    /**
     * 删除用户邮件记录
     * @param id 邮件ID
     * @returns Promise<DeleteEmailResponse>
     */
    deleteEmail(id: number): Promise<DeleteEmailResponse> {
        const params: DeleteEmailRequest = { id };
        return this.request('email.deleteEmail', params, '删除邮件失败')
            .then((response: DeleteEmailResponse) => {
                console.log('删除邮件响应:', response);
                return response;
            });
    }

    /**
     * 一键领取奖励
     * @returns Promise<ReceiveAllRewardsResponse>
     */
    receiveAllRewards(): Promise<ReceiveAllRewardsResponse> {
        return this.request('email.receiveAllRewards', {}, '一键领取奖励失败')
            .then((response: ReceiveAllRewardsResponse) => {
                console.log('一键领取奖励响应:', response);
                return response;
            });
    }

    /**
     * 一键删除用户邮件记录
     * @returns Promise<DeleteAllEmailsResponse>
     */
    deleteAllEmails(): Promise<DeleteAllEmailsResponse> {
        return this.request('email.deleteAllEmails', {}, '一键删除邮件失败')
            .then((response: DeleteAllEmailsResponse) => {
                console.log('一键删除邮件响应:', response);
                return response;
            });
    }

    /**
     * 生成模拟邮件数据用于测试
     * 根据MD文档中的邮件结构生成
     * @returns Promise<MailItem[]>
     */
    getMockEmailList(): Promise<MailItem[]> {
        console.log('使用模拟邮件数据进行测试');
        
        // 模拟服务器响应结构
        const mockResponse = {
            code: 200,
            data: [
                {
                    id: 1001,
                    userId: 999989,
                    emailName: "开服福利",
                    reward: "{\"energy\":15,\"currency_gold\":100}",
                    rewardDescription: "欢迎来到元素骑士！这是为您准备的开服福利。",
                    isReceive: 0,
                    receiveTime: null,
                    lostTime: "2025-12-31 23:59:59"
                },
                {
                    id: 1002,
                    userId: 999989,
                    emailName: "每日登录奖励",
                    reward: "{\"energy\":30,\"currency_diamond\":50}",
                    rewardDescription: "感谢您的每日登录，这是今天的奖励。",
                    isReceive: 1,
                    receiveTime: "2025-01-15 10:30:00",
                    lostTime: "2025-01-16 23:59:59"
                },
                {
                    id: 1003,
                    userId: 999989,
                    emailName: "成就解锁：一血",
                    reward: "{\"badge_assassin\":1}",
                    rewardDescription: "恭喜您解锁了\"一血\"成就！获得刺客徽章一枚。",
                    isReceive: 0,
                    receiveTime: null,
                    lostTime: "2025-12-31 23:59:59"
                },
                {
                    id: 1004,
                    userId: 999989,
                    emailName: "维护补偿",
                    reward: "{\"currency_gold\":500,\"key_common\":2}",
                    rewardDescription: "服务器维护已完成，这是给您的补偿奖励。",
                    isReceive: 0,
                    receiveTime: null,
                    lostTime: "2025-02-28 23:59:59"
                },
                {
                    id: 1005,
                    userId: 999989,
                    emailName: "活动奖励：寻宝",
                    reward: "{\"relic_targeted_potion\":1,\"currency_diamond\":100}",
                    rewardDescription: "恭喜您在寻宝活动中获得奖励！",
                    isReceive: 1,
                    receiveTime: "2025-01-14 15:20:00",
                    lostTime: "2025-01-15 23:59:59"
                },
                {
                    id: 1006,
                    userId: 999989,
                    emailName: "好友赠送",
                    reward: "{\"energy\":20,\"equip_dark_iron\":5}",
                    rewardDescription: "您的好友\"Bard\"给您送了一份礼物。",
                    isReceive: 0,
                    receiveTime: null,
                    lostTime: "2025-01-20 23:59:59"
                },
                {
                    id: 1007,
                    userId: 999989,
                    emailName: "月度订阅奖励",
                    reward: "{\"badge_random\":1,\"key_legendary\":1}",
                    rewardDescription: "您的月度订阅已续订，这是您的专属奖励。",
                    isReceive: 0,
                    receiveTime: null,
                    lostTime: "2025-12-31 23:59:59"
                },
                {
                    id: 1008,
                    userId: 999989,
                    emailName: "调查问卷奖励",
                    reward: "{\"energy\":5000}",
                    rewardDescription: "感谢您完成我们的调查问卷，这是我们的一点心意。",
                    isReceive: 1,
                    receiveTime: "2025-01-10 09:15:00",
                    lostTime: "2025-01-11 23:59:59"
                },
                {
                    id: 1009,
                    userId: 999989,
                    emailName: "新版本更新奖励",
                    reward: "{\"currency_diamond\":200,\"skin_essence\":3}",
                    rewardDescription: "v1.2.0版本现已上线，感谢您的支持！",
                    isReceive: 0,
                    receiveTime: null,
                    lostTime: "2025-03-31 23:59:59"
                },
                {
                    id: 1010,
                    userId: 999989,
                    emailName: "系统公告",
                    reward: "{}",
                    rewardDescription: "S1和S2服务器将于下周进行合并，请做好准备。",
                    isReceive: 1,
                    receiveTime: "2025-01-12 14:30:00",
                    lostTime: "2025-12-31 23:59:59"
                }
            ],
            msg: null
        };

        // 模拟API响应延迟
        return new Promise((resolve) => {
            setTimeout(() => {
                const emailRecords: EmailRecord[] = mockResponse.data;
                console.log('模拟邮件数据:', emailRecords);
                const mailItems = convertEmailRecordsToMailItems(emailRecords);
                console.log('转换后的邮件项:', mailItems);
                resolve(mailItems);
            }, 500); // 模拟500ms网络延迟
        });
    }

    /**
     * 模拟一键领取所有奖励响应
     * @returns Promise<any>
     */
    mockReceiveAllRewards(): Promise<any> {
        console.log('模拟一键领取所有奖励');
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 0,
                    data: {
                        collectedCount: 5,
                        rewards: [
                            { itemId: 507, amount: 15, itemType: 'energy' },
                            { itemId: 508, amount: 100, itemType: 'currency_gold' },
                            { itemId: 500, amount: 1, itemType: 'badge_assassin' }
                        ]
                    },
                    msg: "成功领取5封邮件的奖励"
                });
            }, 500);
        });
    }

    /**
     * 模拟一键删除所有邮件响应
     * @returns Promise<any>
     */
    mockDeleteAllEmails(): Promise<any> {
        console.log('模拟一键删除所有邮件');
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 0,
                    data: {
                        deletedCount: 3
                    },
                    msg: "成功删除3封邮件"
                });
            }, 500);
        });
    }
}

// 创建并导出单例实例
export const emailAPI = new EmailAPI(); 