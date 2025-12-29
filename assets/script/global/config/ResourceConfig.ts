export class ResourceConfig {
  // 版本信息
  public static version = '1.0';
  public static buildTime = '2024-07-08 20:00'; // 请根据实际时间调整

  // 预制体资源列表
  public static prefabList = [
    // hall
    { scene: "hall", name: 'army', path: 'prefab/hall/army', parent: '' },
    { scene: "hall", name: 'attack_stat', path: 'prefab/hall/attack_stat', parent: '' },
    { scene: "hall", name: 'hall_bottom', path: 'prefab/hall/hall_bottom', parent: '' },
    { scene: "hall", name: 'hall_top', path: 'prefab/hall/hall_top', parent: '' },
    { scene: "hall", name: 'nav_bar', path: 'prefab/hall/nav_bar', parent: '' },
    { scene: "hall", name: 'skill_tree', path: 'prefab/hall/skill_tree', parent: '' },
    { scene: "hall", name: 'skill_leaf', path: 'prefab/hall/skill_leaf', parent: '' },
    { scene: "hall", name: 'ac_menu', path: 'prefab/hall/ac_menu', parent: '' },
    { scene: "hall", name: 'activity_menus', path: 'prefab/hall/activity_menus', parent: '' },
    { scene: "hall", name: 'hall_settings', path: 'prefab/hall/hall_settings', parent: '' },
    { scene: "hall", name: 'mail_popu_menus', path: 'prefab/hall/mail_popu_menus', parent: '' },
    { scene: "hall", name: 'stage_info_board', path: 'prefab/hall/stage_info_board', parent: '' },





    // hall/army_panel 子目录下的 prefab
    { scene: "hall", name: 'am_down', path: 'prefab/hall/army_panel/am_down', parent: '' },
    { scene: "hall", name: 'am_up', path: 'prefab/hall/army_panel/am_up', parent: '' },
    { scene: "hall", name: 'full_screen_tupo', path: 'prefab/hall/army_panel/full_screen_tupo', parent: '' },
    { scene: "hall", name: 'hero_card_detail', path: 'prefab/hall/army_panel/hero_card_detail', parent: '' },

    // hall/equip 子目录下的 prefab
    { scene: "hall", name: 'equip_detail', path: 'prefab/hall/equip/equip_detail', parent: '' },
    { scene: "hall", name: 'equip_icon', path: 'prefab/hall/equip/equip_icon', parent: '' },
    { scene: "hall", name: 'hall_equip', path: 'prefab/hall/equip/hall_equip', parent: '' },

    // hall/legacy 子目录下的 prefab（遗物模块）
    { scene: "hall", name: 'legacy_block', path: 'prefab/hall/legacy/legacy_block', parent: '' },
    { scene: "hall", name: 'legacy_icon', path: 'prefab/hall/legacy/legacy_icon', parent: '' },
    { scene: "hall", name: 'legacy_mian', path: 'prefab/hall/legacy/legacy_mian', parent: '' },

    // hall/partner 子目录下的 prefab（伙伴模块）
    { scene: "hall", name: 'partner_edit', path: 'prefab/hall/partner/partner_edit', parent: '' },
    { scene: "hall", name: 'partner_mian', path: 'prefab/hall/partner/partner_mian', parent: '' },
    { scene: "hall", name: 'partner_small_icon', path: 'prefab/hall/partner/partner_small_icon', parent: '' },

    // hall/relic 子目录下的 prefab（圣物模块）
    { scene: "hall", name: 'relic_bonus', path: 'prefab/hall/relic/relic_bonus', parent: '' },
    { scene: "hall", name: 'relic_detail', path: 'prefab/hall/relic/relic_detail', parent: '' },
    { scene: "hall", name: 'relic_icon', path: 'prefab/hall/relic/relic_icon', parent: '' },
    { scene: "hall", name: 'relic_main_panel', path: 'prefab/hall/relic/relic_main_panel', parent: '' },
    { scene: "hall", name: 'relic_summon_card', path: 'prefab/hall/relic/relic_summon_card', parent: '' },

    // hall/skin_preview 子目录下的 prefab（皮肤预览模块）
    { scene: "hall", name: 'skin_preview_detail', path: 'prefab/hall/skin_preview/skin_preview_detail', parent: '' },
    { scene: "hall", name: 'skin_preview_icon', path: 'prefab/hall/skin_preview/skin_preview_icon', parent: '' },
    { scene: "hall", name: 'skin_preview_main', path: 'prefab/hall/skin_preview/skin_preview_main', parent: '' },
    { scene: "hall", name: 'skin_previw_block', path: 'prefab/hall/skin_preview/skin_previw_block', parent: '' },




    // game
    { scene: "game", name: 'ui_frame_top', path: 'prefab/game/ui_frame_top', parent: '' },
    { scene: "game", name: 'hero_panel', path: 'prefab/game/hero_panel', parent: '' },
    { scene: "game", name: 'warning_container', path: 'prefab/game/warning_container', parent: '' },

    // dialog
    { scene: "game", name: 'game_result', path: 'prefab/dialog/game_result', parent: 'dialog_container' },
    { scene: "game", name: 'luck_wheel', path: 'prefab/dialog/luck_wheel', parent: 'dialog_container' },
    { scene: "game", name: 'revive_hero', path: 'prefab/dialog/revive_hero', parent: 'dialog_container' },
    { scene: "game", name: 'skills_choose', path: 'prefab/dialog/skills_choose', parent: 'dialog_container' },
    { scene: "game", name: 'game_pause', path: 'prefab/dialog/game_pause', parent: 'dialog_container' },
    { scene: "game", name: 'small_dialog', path: 'prefab/dialog/small_dialog', parent: 'bg' },

    // icons
    { scene: "game", name: 'result_hero_icon', path: 'prefab/icons/result_hero_icon', parent: '' },
  ];

  public static game_bg_list = [
    "img/game/game_bg/game_bg_1",
    "img/game/game_bg/game_bg_2",
    "img/game/game_bg/game_bg_3",
    "img/game/game_bg/game_bg_4",
    "img/game/game_bg/game_bg_5",
  ]

  // 其他大图资源列表（背景图等）
  public static ther_big_img_list = [
    "img/hall/bg/1170_2532",                 // 通用背景图（高分辨）
    "img/hall/bg/dialog_bg",                 // 对话框背景
    "img/hall/bg/equip_bg",                  // 装备界面背景
    "img/hall/bg/hall_bg_1287_2593",         // 主大厅背景
    "img/hall/bg/hero_card_detail",          // 英雄卡牌详情背景
    "img/hall/bg/partner_bg_1170_2592",      // 伙伴界面背景
    "img/hall/bg/partner_ui",                // 伙伴 UI 背景
    "img/hall/bg/skin_bg_1407X2598",         // 皮肤界面背景
    "img/hall/bg/ui_bg_1170_2532",           // 通用 UI 背景
    "img/hall/bg/legacy_bg",                 // 考古背景
    "img/hall/bg/transformation_bg",          // 地下城背景
    "img/hall/bg/transformation_up",         // 幻化背景
    "img/hall/bg/daily_task_bg",             // 每日任务背景
    "img/hall/bg/player_info_bg",             // 玩家信息背景
    "img/hall/bg/user_agreement",            // 用户协议背景
    "img/hall/bg/forge_9",//锻造 9
    "img/hall/bg/forge_12",//锻造12
    "img/hall/bg/leaderboard_bg_1",//排行榜主页
    "img/hall/bg/leaderboard_bg_2",//排行榜
  ];


  public static spriteAtlas_plist_list = [
    //hall
    "img/hall/active_menus",
    "img/hall/army_fonts",
    "img/hall/army_img",
    "img/hall/hall_card_detail",
    "img/hall/hall_equip_ui",
    "img/hall/hall_ui_1",
    "img/hall/hall_ui_2",
    "img/hall/hall_ui_font",
    "img/hall/lucky_boxs",
    "img/hall/mail_menus",
    "img/hall/settings_ui",
    "img/hall/skill_tree",



    // general
    "img/general/buttons",
    "img/general/equip_frame",
    "img/general/frame",


    // game
    "img/game/bullet",
    "img/game/game_status",
    "img/game/game_ui",
    "img/game/luck_wheel",
    "img/game/pause_ui",
    "img/game/skill_selection",
    "img/game/skill_selection_fram",
    "img/game/story_dialog",
    "img/game/warning_panel",



    "anim/die",



    //icons
    "img/icons/class_icons",
    "img/icons/equip_icons",
    "img/icons/hero_icons",
    "img/icons/hero_icons1",
    "img/icons/monster_icons",


  ]

  // 音效文件
  public static soundFiles = [
    'audio/button-click',         // 按钮点击音
    'audio/effect/arrow',        // 箭矢射击
    'audio/effect/arrow_2',      // 箭矢射击2
    'audio/effect/arrow_3',      // 箭矢射击3
    'audio/effect/atk_1',        // 普通攻击1
    'audio/effect/atk_2',        // 普通攻击2
    'audio/effect/boom_1',       // 爆炸音效
    'audio/effect/fire_ball',    // 火球发射
    'audio/effect/hp_add',       // 回复生命
    'audio/effect/level_up_1',   // 升级提示1
    'audio/effect/level_up_2',   // 升级提示2
    'audio/effect/light',        // 闪电/光效
    'audio/effect/ston',         // 石头砸击
    'audio/effect/wild',         // 野性吼叫
    'audio/effect/monsterWarnings',// 怪物警告
    'audio/effect/bossWarning',//  boss警告
    'audio/effect/boss',//  boss 出来
  ];

  // 音乐大文件 - 背景音乐列表
  public static bgmFiles = [
    'audio/bgm_hall',   // 大厅背景音乐
    'audio/bgm_0',      // 游戏背景音乐0
    'audio/bgm_1',      // 游戏背景音乐1
    'audio/bgm_2',      // 游戏背景音乐2
    'audio/bgm_3',      // 游戏背景音乐3
    'audio/bgm_4'       // 游戏背景音乐4
  ];





  //字体文件TTFFont
  public static ttffont_list = [
    'font/AlimamaShuHeiTi-Bold',
    'font/ZQKfreefont'

  ]

  public static scene_list = [
    "scene/hall",
    "scene/game",
  ]


  // 英雄资源列表  icon不用加载 直接在图集里加载
  public static heros_list = [

    {
      id: "1000",
      name: '巨人之岭',
      path: 'spine/heros/h_0_0_0',
      class: 0,
      description: '物理系弹道技能，投掷滚石攻击目标，并获得硬化皮肤使受到的伤害减少',
      maxhp: 6000,
      defense: 80,
      attack: 100,
      iconFrameName: 'h_0_0_0',
      bonids: ['1000', '1001'],
      bond_description: '草木皆兵，巨人之岭获得护甲提升，知识古树获得医疗提升',
    },
    {
      id: "1001",
      name: '知识古树',
      path: 'spine/heros/h_1_0_0',
      class: 1,
      skinName: 'h_1_0_0',
      description: '提供治疗和增益效果的支援英雄',
      maxhp: 3000,
      defense: 20,
      attack: 120,
      iconFrameName: 'h_1_0_0',
      healing_power: 10,
      bonids: ['1001', '1000'],
      bond_description: '草木皆兵，巨人之岭获得护甲提升，知识古树获得医疗提升'
    },
    {
      id: "1002",
      name: '亡灵射手',
      path: 'spine/heros/h_2_0_0',
      class: 2,
      description: '远程物理输出英雄',
      maxhp: 2200,
      defense: 20,
      attack: 150,
      iconFrameName: 'h_2_0_0',
      bonids: ['1002', '1003'],
      bond_description: '亡灵射手 获得爆炸箭，炎魔获得火球穿刺'
    },
    {
      id: "1003",
      name: '炎魔',
      path: 'spine/heros/h_3_0_0',
      class: 3,
      description: '命中时爆炸造成范围伤害，并点燃敌人',
      maxhp: 2000,
      defense: 10,
      attack: 140,
      iconFrameName: 'h_3_0_0',
      bonids: ['1002', '1003'],
      bond_description: '亡灵射手 获得爆炸箭，炎魔获得火球穿刺'
    },
    {
      id: "1004",
      name: '狮鹫骑士',
      path: 'spine/heros/h_4_0_0',
      class: 4,
      description: '降下落雷造成范围伤害，并使敌人触电，暴击时还可生成感电区域',
      maxhp: 2000,
      defense: 20,
      attack: 130,
      iconFrameName: 'h_4_0_0',
      bonids: ['1004', '1005'],
      bond_description: '狮鹫骑士 获得狮鹫骑士获得暴击提升，骑士团长获得护甲提升'
    },

    // 基础5个   新5个
    {
      id: "1005",
      name: "骑士小兵",
      path: "spine/heros/h_0_0_1",
      class: 0,  // 0 表示坦克职业，保留
      skinName: 'h_0_0_1',
      description: "手持大剑的重甲前锋，拥有稳定的输出与格挡能力",
      attack: 110,
      maxhp: 5200,      // 稍低于石头人，但仍为前排高血量
      defense: 60,       // 防御稍弱于石头人，更偏进攻
      iconFrameName: 'h_0_0_1',
      bonids: ['1004', '1005'],
      bond_description: '狮鹫骑士 获得狮鹫骑士获得护甲提升，狮鹫获得护甲提升'
    },

    {
      id: "1006",
      name: "森林贤者",
      path: "spine/heros/h_1_0_1",
      class: 1,  // 1 表示治疗职业
      skinName: 'h_1_0_1',
      description: "掌控自然之力的古老德鲁伊，擅长群体治疗与恢复。",
      attack: 130,
      maxhp: 2800,
      defense: 20,
      healing_power: 10,
      iconFrameName: 'h_1_0_1',
      bonids: ['1006', '1007'],
      bond_description: '森林贤者 获得治疗提升，疯狂博士获得暴击提升'
    },

    {
      id: "1007",
      name: '邪恶药剂师',
      path: 'spine/heros/h_2_0_1',
      skinName: 'h_2_0_1',
      class: 2,
      description: '丢出带有各种效果的药瓶',
      maxhp: 1000,
      defense: 10,
      attack: 130,
      iconFrameName: 'h_2_0_1',
      bonids: ['1006', '1007'],
      bond_description: '森林贤者 获得治疗提升，疯狂博士获得暴击提升'
    },
    {
      id: "1008",
      name: "冰魔导师",
      path: "spine/heros/h_3_0_1",
      class: 3,  // 法师职业
      skinName: 'h_3_0_1',
      description: "攻击释放冰珠，可以减慢敌人移动速度。",
      attack: 180,
      maxhp: 2400,
      defense: 18,
      iconFrameName: 'h_3_0_1',
      bonids: ['1008', '1009'],
      bond_description: '冰魔导师 获得冰冻提升，绿林刺客获得暴击提升'
    },
    {
      id: "1009",
      name: "绿林刺客",
      path: "spine/heros/h_4_0_2",
      class: 4,  // 刺客职业
      skinName: 'h_4_0_2',
      description: "攻击释放匕首，有概率对敌人造成流血.",
      attack: 170,
      maxhp: 2000,
      defense: 12,
      iconFrameName: 'h_4_0_2',
      bonids: ['1008', '1009'],
      bond_description: '冰魔导师 获得冰冻提升，绿林刺客获得暴击提升'
    },






    //s英雄  砰砰博士 地精炸弹
    {
      id: "1010",
      name: "砰砰博士",
      path: "spine/heros/h_4_0_1",
      class: 4,
      skinName: 'h_4_0_1',
      super_skinName: 'h_4_0_1',
      super_skin_enable: true,
      description: "释放炸弹，对敌人造成范围伤害.",
      attack: 170,
      maxhp: 2000,
      defense: 12,
      iconFrameName: 'h_4_0_1',
      bonids: ['1010', '1011'],
      bond_description: '砰砰博士 获得速度提升，艾格文获得暴击提升'
    },
    //s英雄 艾格文
    {
      id: "1011",
      name: "艾格文",
      path: "spine/heros/h_3_0_3",
      class: 3,
      skinName: 'h_3_0_3',
      super_skinName: 'h_3_0_6',
      super_skin_enable: true,
      description: "释放魔法，对敌人造成范围伤害.",
      attack: 170,
      maxhp: 2000,
      defense: 12,
      iconFrameName: 'h_3_0_3',
      bonids: ['1011', '1010'],
      bond_description: '砰砰博士 获得速度提升，艾格文获得暴击提升'
    },


    // 可继续添加更多英雄


     //10.28新增英雄


     {
      id: "1012", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "硝烟游侠", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_2_0_4", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 2, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_2_0_4', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_2_0_4', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_2_0_4', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1012', '1012'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },

  {
      id: "1013", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "林歌猎手", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_2_0_2", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 2, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_2_0_2', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_2_0_2', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_2_0_2', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1013', '1013'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },
 {
      id: "1014", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "地精骑手", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_1_0_2", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 1, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_1_0_2', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_1_0_2', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_1_0_2', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1014', '1014'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },
 {
      id: "1015", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "蛮角督军", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_0_0_2", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 0, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_0_0_2', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_0_0_2', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_0_0_2', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1015', '1015'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },
 
    {
      id: "1016", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "先祖战吼者", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_2_0_3", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 2, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_2_0_3', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_2_0_3', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_2_0_3', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1016', '1016'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },

    {
      id: "1017", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "恶魔猎手", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_3_0_2", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 3, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_3_0_2', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_3_0_2', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_3_0_2', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1017', '1017'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },

    {
      id: "1018", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "赤炎剑魔", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_4_0_3", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 4, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_4_0_3', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_4_0_3', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_4_0_3', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1018', '1018'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },


       {
      id: "1019", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "幽冥骑士", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_0_0_3", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 0, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_0_0_3', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_0_0_3', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_0_0_3', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1019', '1019'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },

     {
      id: "1020", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "竹海宗师", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_0_0_4", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 0, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_0_0_4', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_0_0_4', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_0_0_4', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1020', '1020'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },

        {
      id: "1021", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "霜冠帝王", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_0_0_5", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 0, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_0_0_5', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_0_0_5', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_0_0_5', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1021', '1021'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },
    {
      id: "1022", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "光铸勇士", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_1_0_3", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 1, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_1_0_3', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_1_0_3', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_1_0_3', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1021', '1021'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },

    {
      id: "1023", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "影渊皇子", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_1_0_4", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 1, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_1_0_4', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_1_0_4', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_1_0_4', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1022', '1022'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },
       {
      id: "1024", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "暮光教长", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_1_0_5", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 1, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_1_0_5', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_1_0_5', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_1_0_5', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1023', '1023'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },

   {
      id: "1025", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "岚语信使", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_2_0_5", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 2, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_2_0_6', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_2_0_6', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_2_0_5', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1025', '1025'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },

       {
      id: "1026", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "神谕者", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_3_0_4", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 3, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_3_0_4', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_3_0_4', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_3_0_4', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1025', '1025'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },

  {
      id: "1027", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "猩红巫师", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_3_0_5", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 3, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_3_0_5', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_3_0_5', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_3_0_5', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1026', '1026'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },

    {
      id: "1028", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "炸弹人", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_4_0_4", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 4, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_4_0_4', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_4_0_4', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_4_0_4', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1027', '1027'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },

 {
      id: "1029", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "秘境守护者", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_4_0_5", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 4, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_4_0_5', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_4_0_5', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_4_0_5', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1028', '1028'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    },

    {
      id: "1030", // 英雄的唯一标识符，用于在游戏中引用该英雄。
      name: "蒸汽空骑", // 英雄的名称，用于在UI中显示。
      path: "spine/heros/h_4_0_6", // Spine动画资源的路径，指向heros文件夹下的具体Spine动画文件。
      class: 4, // 英雄的职业或类型，例如法师、战士等，数字3可能代表特定的职业ID。
      skinName: 'h_4_0_6', // 英雄的默认皮肤名称，对应Spine动画中的一个皮肤。
      super_skinName: 'h_4_0_6', // 英雄的超级皮肤名称，可能是一个更高级或特殊的皮肤。
      description: "释放魔法，对敌人造成范围伤害.", // 英雄的描述或技能介绍。
      attack: 170, // 英雄的攻击力数值。
      maxhp: 2000, // 英雄的最大生命值数值。
      defense: 12, // 英雄的防御力数值。
      iconFrameName: 'h_4_0_6', // 英雄在UI中显示的图标帧名称，通常与Spine动画资源名称相关。
      bonids: ['1029', '1029'], // 英雄的羁绊ID列表，表示该英雄与其他哪些英雄存在羁绊关系。
      bond_description: '羁绊暂时未知' // 羁绊效果的描述。
    }

  ];

} 