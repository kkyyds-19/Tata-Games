import { BaseAPI } from "./BaseAPI";
import { 
    UserLoginRequest,
    UserLoginResponse,
    UserRegisterRequest,
    UserRegisterResponse,
    WxLoginRequest,
    WxLoginResponse,
    UserHomeResponse,
    UpdateNicknameRequest,
    UpdateNicknameResponse,
    UpdateIconRequest,
    UpdateIconResponse,
    UpdatePasswordRequest,
    UpdatePasswordResponse,
    UpdateLevelRequest,
    UpdateLevelResponse,
    HonorGrantRequest,
    HonorGrantResponse,
    GulchChallengeRequest,
    GulchChallengeResponse,
    GulchInfoResponse,
    UserListResponse,
    UserListItem,
    APIResponse,
    GulchReceiveResponse
} from "./APITypes";

/**
 * 用户相关 API
 */
export class UserAPI extends BaseAPI {
    /**
     * 用户登录
     * @param phone 手机号
     * @param password 密码
     * @returns Promise<UserLoginResponse>
     */
    login(phone: string, password: string): Promise<UserLoginResponse> {
        const params: UserLoginRequest = { phone, password };
        return this.request('user.login', params, '用户登录失败')
            .then((response: UserLoginResponse) => {
                console.log('用户登录响应:', response);
                return response;
            });
    }

    /**
     * 用户注册
     * @param phone 手机号
     * @param code 验证码
     * @param password 密码
     * @param vxCode 微信code
     * @returns Promise<UserRegisterResponse>
     */
    register(phone: string, code: string, password: string, vxCode: string): Promise<UserRegisterResponse> {
        const params: UserRegisterRequest = { phone, code, password, vxCode };
        return this.request('user.register', params, '用户注册失败')
            .then((response: UserRegisterResponse) => {
                console.log('用户注册响应:', response);
                return response;
            });
    }

    /**
     * 微信端用户登录
     * @param code 微信code
     * @returns Promise<WxLoginResponse>
     */
    wxLogin(code: string): Promise<WxLoginResponse> {
        const params: WxLoginRequest = { code };
        return this.request('user.wxLogin', params, '微信登录失败')
            .then((response: WxLoginResponse) => {
                console.log('微信登录响应:', response);
                return response;
            });
    }

    /**
     * 用户更改昵称
     * @param nickname 新昵称
     * @returns Promise<UpdateNicknameResponse>
     */
    updateNickname(nickname: string): Promise<UpdateNicknameResponse> {
        const params: UpdateNicknameRequest = { nickName: nickname };
        return this.request('user.updateNickname', params, '修改用户昵称失败')
            .then((response: UpdateNicknameResponse) => {
                console.log('修改用户昵称响应:', response);
                return response;
            });
    }

    /**
     * 用户更改头像
     * @param icon 新头像标识
     * @returns Promise<UpdateIconResponse>
     */
    updateIcon(icon: string): Promise<UpdateIconResponse> {
        const params: UpdateIconRequest = { key: icon };
        return this.request('user.updateIcon', params, '修改用户头像失败')
            .then((response: UpdateIconResponse) => {
                console.log('修改用户头像响应:', response);
                return response;
            });
    }

    /**
     * 用户更改密码
     * @param password 新密码
     * @returns Promise<UpdatePasswordResponse>
     */
    updatePassword(password: string): Promise<UpdatePasswordResponse> {
        const params: UpdatePasswordRequest = { key: password };
        return this.request('user.updatePassword', params, '修改用户密码失败')
            .then((response: UpdatePasswordResponse) => {
                console.log('修改用户密码响应:', response);
                return response;
            });
    }

    /**
     * 用户首页接口信息
     * @returns Promise<UserHomeResponse>
     */
    getHomeInfo(): Promise<UserHomeResponse> {
        return this.request('user.getHomeInfo', {}, '获取用户首页信息失败')
            .then((response: UserHomeResponse) => {
                console.log('用户首页信息响应:', response);
                return response;
            });
    }

    /**
     * 用户更新等级
     */
    updateLevel(level: number): Promise<UpdateLevelResponse> {
        const params: UpdateLevelRequest = { level };
        // 首选通过配置的端点调用；若404或失败，尝试备用端点降级处理
        return this.request('user.updateLevel', params, '更新用户等级失败')
            .then((response: UpdateLevelResponse) => {
                console.log('更新用户等级响应:', response);
                return response;
            })
            .catch(async (err) => {
                const msg = (err instanceof Error ? err.message : String(err)) || '';
                console.warn('[UserAPI] 更新等级主端点失败，尝试备用端点。原因:', msg);
                try {
                    // 备用端点：/api/user/level/update （与领取等级奖励的路径风格一致）
                    const fallback = await this.post('/api/user/level/update', params, '更新用户等级失败(备用)');
                    console.log('更新用户等级备用端点响应:', fallback);
                    return fallback as UpdateLevelResponse;
                } catch (fallbackErr) {
                    // 备用也失败则抛出，但上层可选择忽略
                    const fmsg = (fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)) || '';
                    console.error('[UserAPI] 更新等级备用端点仍失败:', fmsg);
                    throw fallbackErr;
                }
            });
    }

    /**
     * 荣誉竞技场挑战玩家直接获得荣誉积分
     * @param params { challengeUserId, challengeResult, change }
     * @returns Promise<HonorGrantResponse>
     * 示例请求: { challengeUserId: 999988, challengeResult: 0, change: 3 }
     * 示例响应: { code: 200, data: 1, msg: null }
     */
    grantHonor(params: HonorGrantRequest): Promise<HonorGrantResponse> {
        return this.request('user.honorGrant', params, '更新荣誉积分失败')
            .then((response: HonorGrantResponse) => {
                console.log('荣誉积分更新响应:', response);
                return response;
            });
    }

    gulchChallenge(params: GulchChallengeRequest): Promise<GulchChallengeResponse> {
        return this.request('user.gulchChallenge', params, '峡谷挑战结果上报失败')
            .then((response: GulchChallengeResponse) => {
                console.log('峡谷挑战结果上报响应:', response);
                return response;
            });
    }

    getGulchInfo(): Promise<GulchInfoResponse> {
        return this.request('user.getGulchInfo', {}, '获取峡谷信息失败')
            .then((response: GulchInfoResponse) => {
                return response;
            });
    }

    getUserList(): Promise<UserListResponse> {
        return this.request('user.getList', {}, '获取用户列表失败')
            .then((response: UserListResponse) => {
                console.log('用户列表响应:', response);
                const d: any = response.data as any;
                if (d && !Array.isArray(d) && Array.isArray(d.data)) {
                    (response as any).data = d.data as UserListItem[];
                }
                return response;
            });
    }

    claimFlamesVoucher(num: number): Promise<APIResponse<any>> {
        return this.request('user.flamesVoucher', { num }, '领取火焰凭证失败')
            .then((response: APIResponse<any>) => {
                console.log('领取火焰凭证响应:', response);
                return response;
            });
    }

    gulchReceive(): Promise<GulchReceiveResponse> {
        return this.request('user.gulchReceive', {}, '领取峡谷水晶失败')
            .then((response: GulchReceiveResponse) => {
                console.log('领取峡谷水晶响应:', response);
                return response;
            });
    }
}

// 创建并导出单例实例
export const userAPI = new UserAPI();
