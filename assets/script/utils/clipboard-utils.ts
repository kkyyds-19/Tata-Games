import { sys, System } from 'cc';

export async function getClipboardText(): Promise<string> {
    const platform = sys.platform;

    // ✅ 原生平台
    
    if (sys.isNative) {
        try {
             // @ts-ignore
            return await System.clipboard.getString();
        } catch (e) {
            console.warn('System.clipboard 获取失败:', e);
            return '';
        }
    }

    // ✅ Web 平台
    if ((platform === sys.Platform.DESKTOP_BROWSER||platform === sys.Platform.MOBILE_BROWSER) && navigator.clipboard?.readText) {
        try {
            return await navigator.clipboard.readText();
        } catch (e) {
            console.warn('Web clipboard 获取失败:', e);
            return '';
        }
    }

    // ✅ 微信小游戏平台
    // @ts-ignore
    if (typeof wx !== 'undefined' && typeof wx.getClipboardData === 'function') {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            wx.getClipboardData({
                success(res: any) {
                    resolve(res.data || '');
                },
                fail(err: any) {
                    console.warn('微信剪贴板获取失败:', err);
                    reject('');
                },
            });
        });
    }

    console.warn('当前平台不支持剪贴板读取');
    return '';
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 是否复制成功
 */
export async function setClipboardText(text: string): Promise<boolean> {
    if (!text) {
        console.warn('复制文本为空');
        return false;
    }

    const platform = sys.platform;

    // ✅ 原生平台
    if (sys.isNative) {
        try {
            // @ts-ignore
            await System.clipboard.setString(text);
            return true;
        } catch (e) {
            console.warn('System.clipboard 设置失败:', e);
            return false;
        }
    }

    // ✅ Web 平台
    if ((platform === sys.Platform.DESKTOP_BROWSER || platform === sys.Platform.MOBILE_BROWSER) && navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            console.warn('Web clipboard 设置失败:', e);
            return false;
        }
    }

    // ✅ 微信小游戏平台
    // @ts-ignore
    if (typeof wx !== 'undefined' && typeof wx.setClipboardData === 'function') {
        return new Promise((resolve) => {
            // @ts-ignore
            wx.setClipboardData({
                data: text,
                success() {
                    resolve(true);
                },
                fail(err: any) {
                    console.warn('微信剪贴板设置失败:', err);
                    resolve(false);
                },
            });
        });
    }

    console.warn('当前平台不支持剪贴板写入');
    return false;
}
