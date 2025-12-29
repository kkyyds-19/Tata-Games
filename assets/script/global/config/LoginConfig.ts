/**
 * 登录配置
 * 存放共享的登录数据和配置信息
 */

// 测试登录专用数据 - 当前测试阶段保持硬编码
// export const UserLogin = {
//     "phone": "S+fOxBMTki0dqQR6o0ap+rytFC5D6AzJpZ4oQ/kwBTP7V4bIjyivBJ7x9i09z+Sn9ZDz/mKZYmiocASY/+PvFZvwt1f+wRgAVRllUzAkrMz3ilWtsuaQQ9bgUYbEOuUu/4uSipmqCiovR0vUAmKTE2S2QJoWR5394EuS4Ciyde0=",
//     "password": "UUVWbjxgYDnE2cwmWX7ErspFpmt0LA6MNcu+LNCmsDWBfpcLFBMcqcO/iaNW/UjDIWa+h9AeZUC0KYfoKKoYkjatMQTMIaLUdpSqp3Z657HK6Tem11EZA8U9yNjZUtU++OxXUVQq8taotZnBtQ9k59eHCkxqZiV1S/xvsXIrf7o="
// };

/**
 * 登录相关配置
 */
export const LoginConfig = {
    // 自动重试配置
    autoRetry: {
        enabled: true,
        maxRetryCount: 3,
        retryDelay: 1000,
        timeout: 30000
    },

    // 平台配置
    platforms: {
        wechat: {
            name: '微信小游戏',
            loginMethod: 'wx'
        },
        web: {
            name: 'Web平台',
            loginMethod: 'password'
        }
    },

    // API 端点
    endpoints: {
        /**现在废弃了 */
        login: '/api/user/login',
        wxLogin: '/api/user/wx/register', // 微信登录和注册同一个接口
        register: '/api/user/register',
        getUserInfo: '/api/user/home', // 获取用户信息接口

        /**发送短信验证 */
        smslogin: '/api/sms/login',
        /**短信验证登录 */
        logincode: '/api/user/login/code'
    },

    // API 请求方法
    methods: {
        /**现在废弃了 */
        login: 'POST',
        wxLogin: 'GET', // 微信登录使用GET方法
        register: 'POST',
        getUserInfo: 'GET', // 获取用户信息使用GET方法

        /**发送短信验证 */
        smslogin: "POST",
        /**短信验证登录 */
        logincode: "POST"
    }
}; 