# 微信小游戏隐私政策设置指南

## 问题描述

当您使用 `WeChatUserInfoManager` 获取用户信息时，可能会遇到以下错误：

```
getUserProfile:fail please go to mp to announce your privacy usage
```

这个错误表示您需要在微信公众平台声明隐私使用用途。

## 解决方案

### 1. 微信公众平台设置

#### 步骤 1：登录微信公众平台
1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 使用您的微信小游戏管理员账号登录

#### 步骤 2：进入小游戏管理
1. 在左侧菜单中找到您的小游戏
2. 点击进入小游戏管理页面

#### 步骤 3：设置隐私政策
1. 在左侧菜单中找到 **"设置"** → **"基本设置"**
2. 找到 **"隐私设置"** 部分
3. 点击 **"隐私政策"** 进行设置

#### 步骤 4：声明用户信息使用用途
在隐私政策中，您需要明确声明：

1. **收集的用户信息类型**：
   - 用户昵称
   - 用户头像
   - 性别
   - 地区信息

2. **使用目的**：
   - 用于完善用户资料
   - 用于个性化游戏体验
   - 用于用户身份识别

3. **使用方式**：
   - 仅在游戏内使用
   - 不会向第三方分享
   - 符合相关法律法规

### 2. 代码层面的处理

我们的 `WeChatUserInfoManager` 已经内置了隐私政策问题的处理：

```typescript
// 当遇到隐私政策问题时，会自动提供模拟数据
if (err.errMsg && err.errMsg.includes('privacy usage')) {
    console.warn('WeChatUserInfoManager: 需要在微信公众平台声明隐私使用用途');
    
    // 提供模拟数据作为备用方案
    const mockUserInfo: WeChatUserInfoData = {
        nickName: '微信用户',
        avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
        gender: 0,
        country: 'China',
        province: '',
        city: '',
        language: 'zh_CN'
    };
    // 使用模拟数据继续游戏
}
```

### 3. 临时解决方案

在您完成微信公众平台的隐私政策设置之前，可以使用以下临时方案：

#### 方案 1：使用模拟数据
```typescript
const userInfoManager = WeChatUserInfoManager.getInstance();

userInfoManager.getUserInfo((userInfo, error) => {
    if (userInfo) {
        // 正常获取到用户信息
        console.log('用户信息:', userInfo);
    } else {
        // 如果遇到隐私政策问题，会返回模拟数据
        console.log('使用模拟数据:', userInfo);
    }
});
```

#### 方案 2：跳过用户信息获取
```typescript
// 只获取登录凭证，不获取用户信息
userInfoManager.getLoginData((loginData, error) => {
    if (loginData) {
        console.log('登录凭证:', loginData.code);
        // 发送到服务器进行验证
    }
});
```

### 4. 隐私政策模板

以下是一个基本的隐私政策模板，您可以根据实际情况修改：

```markdown
# 隐私政策

## 信息收集
我们收集以下用户信息：
- 用户昵称：用于游戏内显示
- 用户头像：用于游戏内显示
- 性别：用于个性化游戏体验
- 地区信息：用于本地化服务

## 信息使用
收集的信息仅用于：
- 完善用户游戏资料
- 提供个性化游戏体验
- 用户身份识别和登录

## 信息保护
- 所有信息仅在游戏内使用
- 不会向第三方分享用户信息
- 采用安全措施保护用户隐私

## 用户权利
用户有权：
- 查看我们收集的信息
- 要求删除个人信息
- 拒绝提供某些信息

## 联系方式
如有隐私相关问题，请联系：[您的联系方式]
```

### 5. 审核时间

设置隐私政策后，微信官方通常需要 1-3 个工作日进行审核。审核通过后，`getUserProfile` 就可以正常使用了。

### 6. 测试建议

在隐私政策审核期间，建议：

1. **使用模拟数据**：确保游戏功能正常运行
2. **测试登录流程**：验证登录凭证获取是否正常
3. **准备备用方案**：如果用户拒绝授权，提供替代的用户体验

### 7. 注意事项

1. **合规性**：确保隐私政策符合相关法律法规
2. **透明度**：明确告知用户信息收集和使用方式
3. **必要性**：只收集必要的用户信息
4. **安全性**：采取适当的安全措施保护用户信息

## 相关链接

- [微信小游戏开发文档](https://developers.weixin.qq.com/minigame/dev/guide/)
- [微信公众平台](https://mp.weixin.qq.com/)
- [个人信息保护法](http://www.npc.gov.cn/npc/c30834/202108/a8c4e3672c74491a80b53a172bb753fe.shtml) 