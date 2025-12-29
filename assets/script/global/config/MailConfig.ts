/**
 * 邮件类型
 * - important: 重要邮件（例如成就、稀有奖励），通常不能一键删除
 * - system: 系统邮件（例如维护补偿、公告）
 * - normal: 普通邮件（例如日常奖励、好友赠送）
 */
export type MailType = 'important' | 'system' | 'normal';

/**
 * 邮件结构定义
 */
export interface MailItem {
    id: number;                  // 邮件唯一 ID
    type: MailType;              // 邮件类型
    title: string;               // 邮件标题
    content: string;             // 邮件正文内容（可富文本）
    sender: string;              // 发件人（如“系统”、“官方”、“活动中心”等）
    sendTime: number;           // 发送时间（时间戳）
    expireTime: number;         // 过期时间（时间戳）
    isRead: boolean;             // 是否已读
    hasAttachment: boolean;      // 是否包含附件
    isCollected: boolean;        // 附件是否已领取
    attachments?: MailAttachment[];  // 附件列表
  }
  
  /**
   * 邮件附件结构（如金币、钻石、道具等）
   */
  export interface MailAttachment {
    itemId: number;              // 道具/资源 ID（与 gameItemConfigs 对应）
    amount: number;              // 数量
  }
  