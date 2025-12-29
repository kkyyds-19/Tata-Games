# 微信API组件库

一个分离式的微信API组件库，包含独立的激励广告和分享功能组件，以及完善的模拟广告组件，参考了原始的 `RewardedVideoAd.ts` 和 `ShareMessage.ts` 实现。

## 📁 文件结构

```
assets/script/wx/
├── RewardedVideoAdManager.ts    // 激励视频广告管理器（纯TS）
├── ShareMessage.ts              // 微信分享组件
├── SimulatedAdComponent.ts      // 模拟广告组件
├── WeChatUserInfo.ts            // 微信用户信息管理
├── WeChatUserInfoExample.ts     // 用户信息使用示例
└── README.md                    // 说明文档
```

## 🎯 功能特性

### RewardedVideoAdManager - 激励广告管理器
- ✅ 纯TypeScript实现，无Component依赖
- ✅ 支持激励视频广告播放
- ✅ 广告次数限制和计数
- ✅ 广告加载状态管理
- ✅ 模拟广告（开发环境）
- ✅ 广告缓存机制
- ✅ 回调系统集成

### ShareMessage - 分享组件
- ✅ 分享给朋友
- ✅ 分享到朋友圈
- ✅ 随机分享标题
- ✅ 自定义分享图片
- ✅ 全局分享事件注册
- ✅ 动态标题管理

### SimulatedAdComponent - 模拟广告组件
- ✅ 完整的模拟广告界面
- ✅ 实时进度条显示
- ✅ 强制关闭功能
- ✅ 领取奖励功能
- ✅ 淡入淡出动画
- ✅ 游戏时间暂停/恢复
- ✅ 事件回调系统

### WeChatUserInfoManager - 用户信息管理
- ✅ 获取微信用户昵称和头像
- ✅ 获取用户登录凭证（code）
- ✅ 用户授权状态检查
- ✅ 信息缓存机制
- ✅ 非微信环境模拟数据
- ✅ 错误处理和超时机制
- ✅ 支持强制刷新
- ✅ 支持同时获取用户信息和登录凭证

## 🚀 使用方法

### 1. WeChatUserInfoManager 用户信息管理

#### 基本使用
```typescript
import { WeChatUserInfoManager } from './WeChatUserInfo';

// 获取单例实例
const userInfoManager = WeChatUserInfoManager.getInstance();

// 获取用户信息
userInfoManager.getUserInfo((userInfo, error) => {
    if (userInfo) {
        console.log('用户昵称:', userInfo.nickName);
        console.log('用户头像:', userInfo.avatarUrl);
        console.log('用户性别:', userInfo.gender);
        console.log('用户地区:', userInfo.country, userInfo.province, userInfo.city);
    } else {
        console.error('获取用户信息失败:', error);
    }
});
```

#### 高级功能
```typescript
// 强制刷新用户信息
userInfoManager.getUserInfo((userInfo, error) => {
    // 处理结果
}, true);

// 获取登录凭证
userInfoManager.getLoginData((loginData, error) => {
    if (loginData) {
        console.log('登录凭证:', loginData.code);
        // 发送到服务器进行验证
    }
});

// 同时获取用户信息和登录凭证
userInfoManager.getUserInfoWithLogin((userInfo, loginData, error) => {
    if (userInfo && loginData) {
        console.log('用户信息:', userInfo);
        console.log('登录凭证:', loginData.code);
    }
});

// 获取缓存的用户信息
const cachedUserInfo = userInfoManager.getCachedUserInfo();

// 获取缓存的登录凭证
const cachedLoginData = userInfoManager.getCachedLoginData();

// 获取用户昵称
const nickName = userInfoManager.getNickName();

// 获取头像地址
const avatarUrl = userInfoManager.getAvatarUrl();

// 获取登录凭证
const loginCode = userInfoManager.getLoginCode();

// 检查是否有用户信息
const hasInfo = userInfoManager.hasUserInfo();

// 检查是否有登录凭证
const hasLoginData = userInfoManager.hasLoginData();

// 清除缓存
userInfoManager.clearCache();
```

#### 组件使用
```typescript
import { WeChatUserInfo } from './WeChatUserInfo';

@ccclass('UserInfoExample')
export class UserInfoExample extends Component {
    @property(WeChatUserInfo)
    public userInfoComponent: WeChatUserInfo = null!;

    start() {
        // 自动获取用户信息和登录凭证（如果autoGetUserInfo和autoGetLoginData为true）
        // 或者手动获取
        this.userInfoComponent.getUserInfoWithLogin((userInfo, loginData, error) => {
            if (userInfo && loginData) {
                this.displayUserInfo(userInfo);
                this.sendLoginToServer(loginData.code);
            }
        });
    }

    private displayUserInfo(userInfo: WeChatUserInfoData) {
        // 显示用户信息
        console.log('用户信息:', userInfo);
    }

    private sendLoginToServer(loginCode: string) {
        // 发送登录凭证到服务器
        console.log('发送登录凭证到服务器:', loginCode);
        // 这里添加实际的网络请求代码
    }
}
```

### 2. SimulatedAdComponent 模拟广告组件

#### 组件配置
在场景中添加 `SimulatedAdComponent` 组件：

```typescript
// UI组件引用
titleLabel: Label;              // 标题标签
progressBar: ProgressBar;       // 进度条
progressLabel: Label;           // 进度文本
forceCloseButton: Button;       // 强制关闭按钮
claimRewardButton: Button;      // 领取奖励按钮
titleBanner: Node;              // 标题横幅

// 配置参数
adDuration: number = 10;        // 广告播放时长（秒）
forceCloseDelay: number = 3;    // 强制关闭按钮延迟显示时间（秒）
onAdComplete: EventHandler[];   // 广告完成事件
onAdClose: EventHandler[];      // 广告关闭事件
```

#### 代码调用
```typescript
// 开始播放广告
simulatedAdComponent.startPlay();

// 设置广告时长
simulatedAdComponent.setAdDuration(15);

// 设置强制关闭延迟
simulatedAdComponent.setForceCloseDelay(5);

// 检查播放状态
const isPlaying = simulatedAdComponent.isAdPlaying();
const isCompleted = simulatedAdComponent.isAdCompleted();
const progress = simulatedAdComponent.getCurrentProgress();
```

#### UI界面说明
根据图片显示，模拟广告界面包含：
- **标题横幅**：紫色横幅显示"模拟广告"
- **进度条**：橙色背景，蓝色进度块，显示播放进度
- **进度文本**：显示"播放进度 XX%"
- **强制关闭按钮**：延迟显示，允许用户提前关闭
- **领取奖励按钮**：播放完成后显示，点击获得奖励

### 3. RewardedVideoAdManager 使用

#### 基本使用
```typescript
import { RewardedVideoAdManager } from './RewardedVideoAdManager';

// 获取单例实例
const adManager = RewardedVideoAdManager.getInstance();

// 初始化配置
adManager.init({
    adUnitId: 'your-ad-unit-id',
    maxAdCount: 10,
    simulationPrefabPath: 'prefabs/SimulatedAd',
    simulationDuration: 10
});

// 播放广告
adManager.playRewardedAd(
    (data) => {
        console.log('广告播放成功，获得奖励');
        // 处理奖励逻辑
    },
    (error) => {
        console.error('广告播放失败:', error);
    }
);
```

#### 高级功能
```typescript
// 检查广告是否可用
const isAvailable = adManager.isAdAvailable();

// 获取剩余广告次数
const remaining = adManager.getRemainingAdCount();

// 设置模拟模式
adManager.setUseSimulation(true);

// 检查是否使用模拟模式
const useSimulation = adManager.getUseSimulation();
```

### 4. RewardedVideoAd 组件配置（旧版本，已废弃）

在场景中添加 `RewardedVideoAd` 组件：

```typescript
// 激励广告配置
adUnitId: string = '';           // 激励视频广告ID
maxAdCount: number = 10;         // 最大播放次数
playAdOnLoad: boolean = false;   // 加载后立即播放
adEvents: EventHandler[] = [];   // 激励事件函数
simulationVideoPrefab: Prefab;   // 模拟广告预制体（使用SimulatedAdComponent）
adTimesLabel: Label;             // 广告次数显示标签
```

#### 代码调用
```typescript
// 播放广告
rewardedVideoAd.playRewardedAd();

// 检查广告是否可用
if (rewardedVideoAd.isAdAvailable()) {
    // 播放广告
}

// 获取剩余广告次数
const remaining = rewardedVideoAd.getRemainingAdCount();

// 重置广告计数（测试用）
rewardedVideoAd.resetAdCount();

// 清理所有广告缓存
RewardedVideoAd.clearAllAdCaches();
```

### 5. ShareMessage 组件配置

在场景中添加 `ShareMessage` 组件：

```typescript
// 分享配置
enableClickShare: boolean = true;    // 启用点击分享
shareTitles: string[] = [];          // 分享标题数组
shareImageUrl: string = '';          // 分享图片URL
shareButtonNode: Node;               // 分享按钮节点
```

#### 代码调用
```typescript
// 分享给朋友
shareMessage.shareAppMessage();

// 手动触发分享
shareMessage.triggerShare();

// 设置分享标题
shareMessage.setShareTitles(['新标题1', '新标题2']);

// 添加分享标题
shareMessage.addShareTitle('新标题');

// 设置分享图片
shareMessage.setShareImage('https://example.com/image.jpg');

// 获取分享信息
const titleCount = shareMessage.getShareTitleCount();
const isInitialized = shareMessage.checkShareInitialized();
```

### 6. 组合使用示例

参考 `WeChatUserInfoExample.ts` 文件：

```typescript
@ccclass('WeChatUserInfoExample')
export class WeChatUserInfoExample extends Component {
    @property(Label)
    public nickNameLabel: Label = null!;

    @property(Sprite)
    public avatarSprite: Sprite = null!;

    @property(Label)
    public statusLabel: Label = null!;

    private userInfoManager: WeChatUserInfoManager;

    onLoad() {
        this.userInfoManager = WeChatUserInfoManager.getInstance();
    }

    start() {
        // 获取用户信息
        this.getUserInfo();
    }

    public getUserInfo(): void {
        this.userInfoManager.getUserInfo((userInfo, error) => {
            if (userInfo) {
                this.displayUserInfo(userInfo);
            } else {
                console.error('获取用户信息失败:', error);
            }
        });
    }

    private displayUserInfo(userInfo: WeChatUserInfoData): void {
        // 显示用户信息
        if (this.nickNameLabel) {
            this.nickNameLabel.string = userInfo.nickName;
        }
        console.log('用户信息:', userInfo);
    }
}
```

## 🔧 技术特点

### 分离式设计
- **独立组件**：每个功能都是独立的组件，可以单独使用
- **职责单一**：每个组件只负责自己的功能领域
- **易于维护**：代码结构清晰，便于维护和扩展

### 完善的模拟广告
- **真实体验**：模拟真实的广告播放体验
- **进度显示**：实时显示播放进度
- **用户交互**：支持强制关闭和领取奖励
- **时间控制**：自动暂停和恢复游戏时间

### 用户信息管理
- **授权检查**：自动检查用户授权状态
- **缓存机制**：智能缓存用户信息，避免重复请求
- **模拟数据**：非微信环境提供模拟数据
- **错误处理**：完善的错误处理和超时机制

### 环境适配
- **微信环境检测**：自动检测是否在微信环境中运行
- **模拟模式**：在非微信环境中提供模拟功能
- **错误处理**：完善的错误处理和日志输出

### 事件系统
- **EventHandler集成**：使用Cocos Creator的事件系统
- **回调机制**：支持广告播放完成和分享成功的回调
- **全局事件**：自动注册全局分享事件

## 📋 配置说明

### WeChatUserInfo 配置项
| 属性 | 类型 | 说明 |
|------|------|------|
| autoGetUserInfo | boolean | 是否自动获取用户信息 |
| autoGetLoginData | boolean | 是否自动获取登录凭证 |
| showLogs | boolean | 是否显示日志 |

### SimulatedAdComponent 配置项
| 属性 | 类型 | 说明 |
|------|------|------|
| titleLabel | Label | 标题标签 |
| progressBar | ProgressBar | 进度条组件 |
| progressLabel | Label | 进度文本标签 |
| forceCloseButton | Button | 强制关闭按钮 |
| claimRewardButton | Button | 领取奖励按钮 |
| titleBanner | Node | 标题横幅节点 |
| adDuration | number | 广告播放时长（秒） |
| forceCloseDelay | number | 强制关闭按钮延迟显示时间（秒） |
| onAdComplete | EventHandler[] | 广告完成事件 |
| onAdClose | EventHandler[] | 广告关闭事件 |

### RewardedVideoAdManager 配置项
| 属性 | 类型 | 说明 |
|------|------|------|
| adUnitId | string | 激励视频广告ID |
| maxAdCount | number | 最大播放次数 |
| simulationPrefabPath | string | 模拟广告预制体路径 |
| simulationDuration | number | 模拟广告播放时长 |
| useSimulation | boolean | 是否使用模拟模式 |

### RewardedVideoAd 配置项（旧版本）
| 属性 | 类型 | 说明 |
|------|------|------|
| adUnitId | string | 激励视频广告ID |
| maxAdCount | number | 最大播放次数 |
| playAdOnLoad | boolean | 加载后立即播放 |
| adEvents | EventHandler[] | 激励事件函数 |
| simulationVideoPrefab | Prefab | 模拟广告预制体 |
| adTimesLabel | Label | 广告次数显示标签 |

### ShareMessage 配置项
| 属性 | 类型 | 说明 |
|------|------|------|
| enableClickShare | boolean | 启用点击分享 |
| shareTitles | string[] | 分享标题数组 |
| shareImageUrl | string | 分享图片URL |
| shareButtonNode | Node | 分享按钮节点 |

## ⚠️ 注意事项

1. **微信环境检测**：组件会自动检测是否在微信环境中运行
2. **微信API兼容性**：使用最新的wx.getUserProfile API，兼容新旧版本微信小游戏
3. **用户授权**：getUserProfile会弹出授权框，用户需要主动授权
4. **隐私政策**：需要在微信公众平台声明隐私使用用途，详见 [PRIVACY_SETUP.md](./PRIVACY_SETUP.md)
5. **广告ID配置**：需要在微信小游戏后台配置广告ID
6. **分享图片**：建议使用网络图片URL，本地图片可能无法正常显示
7. **模拟模式**：在非微信环境中会自动使用模拟模式
8. **事件清理**：组件会自动处理事件监听器的清理
9. **组件独立性**：各个组件可以独立使用，也可以组合使用
10. **模拟广告预制体**：需要创建包含SimulatedAdComponent的预制体
11. **时间管理**：模拟广告会自动暂停和恢复游戏时间

## 🔄 更新日志

### v3.1.2 - 隐私政策问题处理
- 添加隐私政策问题的自动检测和处理
- 提供模拟数据作为备用方案
- 新增隐私政策设置指南文档
- 优化错误提示信息

### v3.1.1 - 微信API兼容性修复
- 修复wx.onGetUserInfo废弃问题
- 使用wx.getUserProfile替代废弃的API
- 优化用户信息获取流程
- 增强错误处理和兼容性
- 支持新旧版本微信小游戏

### v3.1.0 - 登录凭证功能
- 新增获取微信用户登录凭证功能
- 支持wx.login接口调用
- 新增getUserInfoWithLogin方法，同时获取用户信息和登录凭证
- 增强缓存机制，支持登录凭证缓存
- 新增登录凭证相关的检查方法
- 完善错误处理和模拟数据

### v3.0.0 - 用户信息管理
- 新增WeChatUserInfoManager用户信息管理类
- 支持获取微信用户昵称和头像
- 用户授权状态检查和缓存机制
- 非微信环境模拟数据支持
- 完善的错误处理和超时机制
- 新增WeChatUserInfo组件，支持挂载到节点

### v2.2.0 - 广告管理器重构
- 将RewardedVideoAd重构为RewardedVideoAdManager
- 纯TypeScript实现，移除Component依赖
- 使用回调机制替代EventHandler
- 增强模拟广告集成
- 添加useSimulation控制开关

### v2.1.0 - 模拟广告完善
- 新增SimulatedAdComponent模拟广告组件
- 完整的模拟广告界面，包含进度条和按钮
- 支持强制关闭和领取奖励功能
- 自动时间暂停/恢复功能
- 淡入淡出动画效果

### v2.0.0 - 分离式重构
- 将WeChatAPI拆分为RewardedVideoAd和ShareMessage两个独立组件
- 每个组件职责单一，便于维护和扩展
- 增强了分享组件的功能，支持动态标题管理
- 优化了代码结构和错误处理

### v1.0.0 - 初始版本
- 支持激励广告和分享功能
- 集成事件系统
- 添加模拟模式支持 