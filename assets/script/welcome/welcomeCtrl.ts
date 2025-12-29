import { Singleton } from "../utils/Singleton";

const LOCAL_STORAGE_KEY = 'knight_welcomeCtrl';

export class mobileData {
    zone: string;
    mobileNum: string;
}

export class welcomeData {
    /**未加密的手机号 */
    mobile: mobileData;
    /**未加密的密码 */
    password: string;
    /**验证码 */
    code: string;

    //并不存在以下说明的逻辑
    encryptid: string;
    encryptpassword: string;
    encryptcode: string;

}

export class welcomeCtrl extends Singleton<welcomeCtrl>() {
    data: welcomeData;

    useStorageData: boolean = true;

    load() {
        try {
            const data = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (data) {
                this.data = JSON.parse(data);

            } else {
                this.data = null;
            }

        } catch (error) {
            console.error('UserInfoData: 加载用户信息失败:', error);
            this.data = null;
        }
        this.fill();
        // console.log(`load>>>>>>> ${JSON.stringify(this.data.mobile)}`);

    }

    fill() {
        if (!this.data) this.data = {} as welcomeData;
        const d = this.data;
        if (!d.mobile) d.mobile = {} as mobileData;
        if (!d.mobile.zone) d.mobile.zone = "+86";
        if (!d.mobile.mobileNum) d.mobile.mobileNum = "";
        if (!d.password) d.password = "";
        if (!d.encryptid) d.encryptid = "";
        if (!d.encryptpassword) d.encryptpassword = "";
    }

    save() {
        let data = {} as welcomeData;
        data.mobile = { zone: this.data.mobile.zone, mobileNum: this.data.mobile.mobileNum };
        const data1 = JSON.stringify(data);
        // console.log(`save>>>>>>>>>> ${data1}`);
        localStorage.setItem(LOCAL_STORAGE_KEY, data1);
    }

}