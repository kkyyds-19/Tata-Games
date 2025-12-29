export class GameEvent {
    /**登录界面显示UI */
    public readonly WELCOME_UI_SHOW = "GameEvent.WELCOME_UI_SHOW";
    /**密码登录 */
    public readonly WELCOME_PASSWORD_LOGIN = "GameEvent.WELCOME_PASSWORD_LOGIN";

    public readonly RICHTEXT_CLICK = "GameEvent.RICHTEXT_CLICK";
    /**发送验证短信Login */
    public readonly WELCOME_SMS_LOGIN = "GameEvent.WELCOME_SMS_LOGIN";
    /**发送验证短信返回成功 */
    public readonly WELCOME_SMS_SEND_SUCCESS = "GameEvent.WELCOME_SMS_SEND_SUCCESS";
    /**验证码Login */
    public readonly WELCOME_LOGIN_CODE = "GameEvent.WELCOME_LOGIN_CODE";

    /**显示手机前缀选择窗口 */
    public readonly WELCOME_ZONE_SHOW = "GameEvent.WELCOME_PREFIX_SHOW";
    /**关闭或者选择了手机前缀选择窗口 */
    public readonly WELCOME_ZONE_HIDE = "GameEvent.WELCOME_PREFIX_HIDE";


    public GAME_LEVEL_UP: string = 'GameEvent.GAME_LEVEL_UP'
    public GAME_EXP_UPDATE: string = 'GameEvent.GAME_EXP_UPDATE'

    public GAME_SHOW_HERO_CHOICE: string = 'GameEvent.GAME_SHOW_HERO_CHOICE'
    public GAME_SHOW_SKILL_CHOICE: string = 'GameEvent.GAME_SHOW_SKILL_CHOICE'

    public GAME_HERO_SELECTED: string = 'GameEvent.GAME_HERO_SELECTED'
    public GAME_SKILL_SELECTED: string = 'GameEvent.GAME_SKILL_SELECTED'

    public FIRE_BULLET: string = 'GameEvent.FIRE_BULLET'

    public GAME_HEAL_EFFECT: string = 'GameEvent.GAME_HEAL_EFFECT'

    public GAME_BOOS_HP_UPDATE: string = 'GameEvent.Game_boos_hp_update'

    public GAME_HERO_REVIVE: string = 'GameEvent.GAME_HERO_REVIVE'

    public GAME_LUCK_WHEEL_SHOW: string = 'GameEvent.GAME_LUCK_WHEEL_SHOW'

    //难度切换
    public GAME_DIFFICULTY_CHANGE: string = 'GameEvent.GAME_DIFFICULTY_CHANGE'

    //临时装备职业加成已更新
    public GAME_TEMPORARY_EQUIPMENT_CLASS_BONUSES_UPDATED: string = 'GameEvent.GAME_TEMPORARY_EQUIPMENT_CLASS_BONUSES_UPDATED'

    //皮肤主面板显示
    public GAME_SKIN_PREVIEW_PAGE_SHOW: string = 'GameEvent.GAME_SKIN_PREVIEW_PAGE_SHOW'

    /**
     * 游戏开始
     */
    public readonly GAME_START: string = 'GameEvent.GAME_START'

    //游戏胜利
    public GAME_VICTORY: string = 'GameEvent.GAME_VICTORY'

    /**加载关卡配置完成 */
    public readonly GAME_MAP_CFG_LOADED: string = 'GameEvent.GAME_MAP_CFG_LOADED';

    //遗物主面板显示
    public GAME_LEGACY_MAIN_PAGE_SHOW: string = 'GameEvent.GAME_LEGACY_MAIN_PAGE_SHOW'

    /**主界面显示UI */
    public readonly GAME_HALL_UI_SHOW = "GameEvent.GAME_HALL_UI_SHOW";
    /**主界面地图变更 */
    public readonly GAME_HALL_WORLD_CHANGE = "GameEvent.GAME_HALL_WORLD_CHANGE";


    //toast 显示
    public GAME_TOAST_SHOW: string = 'GameEvent.GAME_TOAST_SHOW'




    //游戏设置
    //高画质
    public GAME_HIGH_QUALITY_CHANGE: string = 'GameEvent.GAME_HIGH_QUALITY_CHANGE'

    //伙伴自动
    public GAME_PARTNER_AUTO_CHANGE: string = 'GameEvent.GAME_PARTNER_AUTO_CHANGE'
    //伤害显示
    public GAME_DAMAGE_DISPLAY_CHANGE: string = 'GameEvent.GAME_DAMAGE_DISPLAY_CHANGE'

    //特效显示
    public GAME_EFFECT_DISPLAY_CHANGE: string = 'GameEvent.GAME_EFFECT_DISPLAY_CHANGE'

    //活动菜单点击事件

    public GAME_ACTIVITY_MENU_CLICK: string = 'GameEvent.GAME_ACTIVITY_MENU_CLICK'

    //装备页面
    public GAME_EQUIP_PAGE_SHOW: string = 'GameEvent.GAME_EQUIP_PAGE_SHOW'

    //圣物页面
    public GAME_RELIC_PAGE_SHOW: string = 'GameEvent.GAME_RELIC_PAGE_SHOW'

    //圣物抽卡
    public GAME_RELIC_SUMMON_PAGE_SHOW: string = 'GameEvent.GAME_RELIC_SUMMON_PAGE_SHOW'

    //伙伴主面板
    public GAME_PARTNER_MAIN_PAGE_SHOW: string = 'GameEvent.GAME_PARTNER_MAIN_PAGE_SHOW'
    public GAME_SOULBEAST_MAIN_PAGE_SHOW: string = 'GameEvent.GAME_SOULBEAST_MAIN_PAGE_SHOW'
    public GAME_WATCHTOWER_MAIN_PAGE_SHOW: string = 'GameEvent.GAME_WATCHTOWER_MAIN_PAGE_SHOW'
    public GAME_WATCHTOWER_OPTION_PAGE_SHOW: string = 'GameEvent.GAME_WATCHTOWER_OPTION_PAGE_SHOW'
    public GAME_WATCHTOWER_TAKE_PAGE_SHOW: string = 'GameEvent.GAME_WATCHTOWER_TAKE_PAGE_SHOW'
    public GAME_WATCHTOWER_UPGRADE_PAGE_SHOW: string = 'GameEvent.GAME_WATCHTOWER_UPGRADE_PAGE_SHOW'
    public GAME_WATCHTOWER_UPGRADE_STAR_PAGE_SHOW: string = 'GameEvent.GAME_WATCHTOWER_UPGRADE_STAR_PAGE_SHOW'
    public GAME_WATCHTOWER_SUMMON_SUCCESS: string = 'GameEvent.GAME_WATCHTOWER_SUMMON_SUCCESS'
    public GAME_WATCHTOWER_RECEIVE_PAGE_SHOW: string = 'GameEvent.GAME_WATCHTOWER_RECEIVE_PAGE_SHOW'
    public GAME_PARTNER_SUMMON_PAGE_SHOW: string = 'GameEvent.GAME_PARTNER_SUMMON_PAGE_SHOW'
    //通知伙伴上阵编辑页面刷新
    public GAME_PARTNER_EDITOR_PAGE_REFRESH: string = 'GameEvent.GAME_PARTNER_EDITOR_PAGE_REFRESH'



    //hall 英雄卡片突破点击事件
    public HALL_HERO_CARD_BREAKTHROUGH_CLICK: string = 'GameEvent.HALL_HERO_CARD_BREAKTHROUGH_CLICK'

    public HALL_STAGE_SELECTED: string = 'GameEvent.HALL_STAGE_SELECTED'
    public HALL_OPEN_TEAM_UP: string = 'GameEvent.HALL_OPEN_TEAM_UP'
    public HALL_NAV_BUTTON_CLICK: string = 'GameEvent.HALL_NAV_BUTTON_CLICK'


    public HALL_USER_INFO_UPDATE: string = 'GameEvent.HALL_USER_INFO_UPDATE'
    public HALL_REWARD_POPUP_SHOW: string = 'GameEvent.HALL_REWARD_POPUP_SHOW'

    public HALL_HERO_CARD_DETAIL_SHOW: string = 'GameEvent.HALL_HERO_CARD_DETAIL_SHOW'
    public HALL_HERO_CARD_DETAIL_HIDE: string = 'GameEvent.HALL_HERO_CARD_DETAIL_HIDE'
    public HALL_ARMY_FORMATION_CHANGED: string = 'GameEvent.HALL_ARMY_FORMATION_CHANGED'





    //dialog 显示
    public DIALOG_ITEM_SHOW: string = 'GameEvent.DIALOG_ITEM_SHOW'





    //debug fps 显示
    public DEBUG_FPS_SHOW_HIDE: string = 'GameEvent.DEBUG_FPS_SHOW_HIDE'

}
