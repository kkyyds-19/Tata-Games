/**
 * 品质配置接口
 */
export interface QualityConfigData {
    id: number;         // 品质ID（从0开始递增）
    name: string;       // 品质名称
    key: string;        // Key值
    description: string; // 层级说明
    color?: string;     // 品质颜色（可选）
    stars: number;      // 星星数量
}

/**
 * 品质配置数据
 */
export const qualityConfigs: QualityConfigData[] = [
    {
        id: 0,
        name: "普通",
        key: "quality_normal",
        description: "基础品质（白色）",
        color: "#FFFFFF",
        stars: 0
    },
    {
        id: 1,
        name: "优秀",
        key: "quality_good",
        description: "初级强化（绿色）",
        color: "#00FF00",
        stars: 0
    },
    {
        id: 2,
        name: "稀有",
        key: "quality_rare",
        description: "中级稀有（蓝色）",
        color: "#0080FF",
        stars: 0
    },
    {
        id: 3,
        name: "精英",
        key: "quality_elite",
        description: "高级精英（紫色）",
        color: "#8A2BE2",
        stars: 0
    },
    {
        id: 4,
        name: "精英一星",
        key: "quality_elite_1star",
        description: "精英+1星强化",
        color: "#9932CC",
        stars: 1
    },
    {
        id: 5,
        name: "精英两星",
        key: "quality_elite_2star",
        description: "精英+2星强化",
        color: "#BA55D3",
        stars: 2
    },
    {
        id: 6,
        name: "传说",
        key: "quality_legendary",
        description: "传说品质（橙色）",
        color: "#FF8C00",
        stars: 0
    },
    {
        id: 7,
        name: "传说一星",
        key: "quality_legendary_1star",
        description: "传说+1星强化",
        color: "#FF7F00",
        stars: 1
    },
    {
        id: 8,
        name: "传说二星",
        key: "quality_legendary_2star",
        description: "传说+2星强化",
        color: "#FF6347",
        stars: 2
    },
    {
        id: 9,
        name: "传说三星",
        key: "quality_legendary_3star",
        description: "传说+3星强化",
        color: "#FF4500",
        stars: 3
    },
    {
        id: 10,
        name: "神话",
        key: "quality_mythic",
        description: "神话品质（红色）",
        color: "#FF0000",
        stars: 0
    },
    {
        id: 11,
        name: "神话一星",
        key: "quality_mythic_1star",
        description: "神话级+1星",
        color: "#DC143C",
        stars: 1
    },
    {
        id: 12,
        name: "神话二星",
        key: "quality_mythic_2star",
        description: "神话级+2星",
        color: "#B22222",
        stars: 2
    },
    {
        id: 13,
        name: "神话三星",
        key: "quality_mythic_3star",
        description: "神话级+3星",
        color: "#8B0000",
        stars: 3
    },
    {
        id: 14,
        name: "泰坦",
        key: "quality_titan",
        description: "终极品质（彩色/特殊S级英雄）",
        color: "#FFD700",
        stars: 0
    }
];
//品质映射 -- hero_card_bg
export const qualityHeroCardBgMap = {
    0: "hero_card_bg_0",
    1: "hero_card_bg_1",
    2: "hero_card_bg_2",
    3: "hero_card_bg_3",
    4: "hero_card_bg_3",
    5: "hero_card_bg_3",
    6: "hero_card_bg_4",
    7: "hero_card_bg_4",
    8: "hero_card_bg_4",
    9: "hero_card_bg_4",
    10: "hero_card_bg_5",
    11: "hero_card_bg_5",
    12: "hero_card_bg_5",
    13: "hero_card_bg_5",
    14: "hero_card_bg_6",
    15: "hero_card_bg_6",
    16: "hero_card_bg_6",
    17: "hero_card_bg_6",
    18: "hero_card_bg_6",
    19: "hero_card_bg_6",
    20: "hero_card_bg_6",
    21: "hero_card_bg_6",
    22: "hero_card_bg_6",
    23: "hero_card_bg_6",
    24: "hero_card_bg_6",
}

//品质映射 -- class_rec
export const qualityClassRecMap = {
    0: "class_rec_0",
    1: "class_rec_1",
    2: "class_rec_2",
    3: "class_rec_3",
    4: "class_rec_3",
    5: "class_rec_3",
    6: "class_rec_4",
    7: "class_rec_4",
    8: "class_rec_4",
    9: "class_rec_4",
    10: "class_rec_5",
    11: "class_rec_5",
    12: "class_rec_5",
    13: "class_rec_5",
    14: "class_rec_6",
    15: "class_rec_6",
    16: "class_rec_6",
    17: "class_rec_6",
    18: "class_rec_6",
    19: "class_rec_6",
    20: "class_rec_6",
    21: "class_rec_6",
    22: "class_rec_6",
    23: "class_rec_6",
    24: "class_rec_6"
}

//品质   -   技能选择框
export const qualitySkillSelectBgMap = {
    0: "s_h_fram_0",
    1: "s_h_fram_1",
    2: "s_h_fram_2",
    3: "s_h_fram_3",
    4: "s_h_fram_3",
    5: "s_h_fram_3",
    6: "s_h_fram_4",
    7: "s_h_fram_4",
    8: "s_h_fram_4",
    9: "s_h_fram_4",
    10: "s_h_fram_5",
    11: "s_h_fram_5",
    12: "s_h_fram_5",
    13: "s_h_fram_5",
    14: "s_h_fram_6",
    15: "s_h_fram_6",
    16: "s_h_fram_6",
    17: "s_h_fram_6",
    18: "s_h_fram_6",
    19: "s_h_fram_6",
    20: "s_h_fram_6",
    21: "s_h_fram_6",
    22: "s_h_fram_6",
    23: "s_h_fram_6",
    24: "s_h_fram_6"
}
//品质 星星 
export const qualityStarMap = {
    0: "card_detail_c_4",
    1: "card_detail_c_4",
    2: "card_detail_c_4",
    3: "card_detail_c_4",
    4: "card_detail_c_4",
    5: "card_detail_c_4",
    6: "card_detail_c_5",
    7: "card_detail_c_5",
    8: "card_detail_c_5",
    9: "card_detail_c_5",
    10: "card_detail_c_6",
    11: "card_detail_c_6",
    12: "card_detail_c_6",
    13: "card_detail_c_6",
    14: "card_detail_c_7",
    15: "card_detail_c_7",
    16: "card_detail_c_7",
    17: "card_detail_c_7",
    18: "card_detail_c_7",
    19: "card_detail_c_7",
    20: "card_detail_c_7",
    21: "card_detail_c_7",
}

//品质  英雄底座 
export const qualityHeroBaseMap = {
    0: "f_b_0",
    1: "f_b_1",
    2: "f_b_2",
    3: "f_b_3",
    4: "f_b_3",
    5: "f_b_3",
    6: "f_b_4",
    7: "f_b_4",
    8: "f_b_4",
    9: "f_b_4",
    10: "f_b_5",
    11: "f_b_5",
    12: "f_b_5",
    13: "f_b_5",
    14: "f_b_5",
    15: "f_b_5",
    16: "f_b_5",
    17: "f_b_5",
    18: "f_b_5",
    19: "f_b_5",
    20: "f_b_5",
    21: "f_b_5",
    22: "f_b_5",
    23: "f_b_5",
    24: "f_b_5"
}