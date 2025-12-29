declare const window: any;

export class EncryptUtils {
    private static readonly publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCvTXtdGfd6XjPO1wHDX+yRQfg1jne0mdSZjpS/I2RPqDryUQdej2uRSTkld/f1RKrHCX2B3atlahQaWf2AmMFYhY5WncpMSUeN7BpBLKoaha5/CS8g5GAigOkAMbypOIoTqoqYxNJcue/jNdxpXTM4mYkgvOCTacce+v2tihuKhQIDAQAB';

    // 密码加密方法
    public static Encryption(passwordUser: string) {

        if (!this.publicKey) {
            console.error('公钥未加载，请先获取公钥');
            return;
        }
        let encryptor = new window.JSEncrypt(); // 创建 JSEncrypt 实例
        encryptor.setPublicKey(this.publicKey); // 设置公钥
        let passwordEncrypted = encryptor.encrypt(passwordUser); // 对密码进行加密
        if (!passwordEncrypted) {
            console.error('密码加密失败，请检查公钥是否正确');
            return;
        }
        // this.encryptedPassword = passwordEncrypted; // 存储加密后的密码
        // console.log('加密后的密码：', this.encryptedPassword);
        return passwordEncrypted;
    }
}