export  class  GameConfig {

  public static HERO_TYPES = {
    TANK: { name: '坦克', abbreviation: 'T', id: 0, color: '#FF5733' },    // 坦克，颜色为红色
    HEALER: { name: '治疗', abbreviation: 'H', id: 1, color: '#33FF57' },  // 治疗，颜色为绿色
    ARCHER: { name: '弓箭手', abbreviation: 'A', id: 2, color: '#57A3FF' },  // 弓箭手，颜色为蓝色
    MAGE: { name: '法爷', abbreviation: 'M', id: 3, color: '#9B59B6' },      // 法师，颜色为紫色
    ASSASSIN: { name: '刺客', abbreviation: 'S', id: 4, color: '#E74C3C' }, // 刺客，颜色为红色
  };

  // 关卡配置
  public static readonly MAX_STAGE = 5;        // 最大大关数量
  public static readonly MAX_SUB_STAGE = 6;    // 每大关的最大小关数量 (0-5)

  // 技能树配置
  public static readonly SKILL_TREE_MAX_LEVEL = 60; // 技能树最大等级

  // 难度系统配置
  // 用于StageComponent根据game.myGlobal.stageDifficulty调整怪物和Boss属性
  // hpMultiplier: 生命值倍数，attackMultiplier: 攻击力倍数
  public static readonly DIFFICULTY_CONFIG = {
    NORMAL: {
      id: 0,
      name: '普通',
      hpMultiplier: 1.0,      // 普通难度生命值倍数
      attackMultiplier: 1.0   // 普通难度攻击力倍数
    },
    ELITE: {
      id: 1,
      name: '精英',
      hpMultiplier: 1.5,      // 精英难度生命值倍数
      attackMultiplier: 1.3   // 精英难度攻击力倍数
    }
  };

  // 难度系统辅助方法
  public static getDifficultyConfig(difficultyId: number) {
    switch (difficultyId) {
      case 0:
        return this.DIFFICULTY_CONFIG.NORMAL;
      case 1:
        return this.DIFFICULTY_CONFIG.ELITE;
      default:
        console.warn(`未知难度ID: ${difficultyId}，使用普通难度`);
        return this.DIFFICULTY_CONFIG.NORMAL;
    }
  }

  public static getDifficultyName(difficultyId: number): string {
    return this.getDifficultyConfig(difficultyId).name;
  }

  public static getAllDifficulties() {
    return [this.DIFFICULTY_CONFIG.NORMAL, this.DIFFICULTY_CONFIG.ELITE];
  }

  // 1-200级升级所需经验值列表，公式：100 × level^2
  public static LEVEL_EXP_LIST: number[] = [
    // 1-200级，每级所需经验
    100, 400, 900, 1600, 2500, 3600, 4900, 6400, 8100, 10000,
    12100, 14400, 16900, 19600, 22500, 25600, 28900, 32400, 36100, 40000,
    44100, 48400, 52900, 57600, 62500, 67600, 72900, 78400, 84100, 90000,
    96100, 102400, 108900, 115600, 122500, 129600, 136900, 144400, 152100, 160000,
    168100, 176400, 184900, 193600, 202500, 211600, 220900, 230400, 240100, 250000,
    260100, 270400, 280900, 291600, 302500, 313600, 324900, 336400, 348100, 360000,
    372100, 384400, 396900, 409600, 422500, 435600, 448900, 462400, 476100, 490000,
    504100, 518400, 532900, 547600, 562500, 577600, 592900, 608400, 624100, 640000,
    656100, 672400, 688900, 705600, 722500, 739600, 756900, 774400, 792100, 810000,
    828100, 846400, 864900, 883600, 902500, 921600, 940900, 960400, 980100, 1000000,
    1020100, 1040400, 1060900, 1081600, 1102500, 1123600, 1144900, 1166400, 1188100, 1210000,
    1232100, 1254400, 1276900, 1299600, 1322500, 1345600, 1368900, 1392400, 1416100, 1440000,
    1464100, 1488400, 1512900, 1537600, 1562500, 1587600, 1612900, 1638400, 1664100, 1690000,
    1716100, 1742400, 1768900, 1795600, 1822500, 1849600, 1876900, 1904400, 1932100, 1960000,
    1988100, 2016400, 2044900, 2073600, 2102500, 2131600, 2160900, 2190400, 2220100, 2250000,
    2280100, 2310400, 2340900, 2371600, 2402500, 2433600, 2464900, 2496400, 2528100, 2560000,
    2592100, 2624400, 2656900, 2689600, 2722500, 2755600, 2788900, 2822400, 2856100, 2890000,
    2924100, 2958400, 2992900, 3027600, 3062500, 3097600, 3132900, 3168400, 3204100, 3240000,
    3276100, 3312400, 3348900, 3385600, 3422500, 3459600, 3496900, 3534400, 3572100, 3610000,
    3648100, 3686400, 3724900, 3763600, 3802500, 3841600, 3880900, 3920400, 3960100, 4000000
  ];

}







