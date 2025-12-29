export class Utils {



    public static ABS(num: number): number {
        if (num < 0) {
            return -num;
        }
        return num;
    }


    public static modulo(a: number, b: number): number {
        if (b === 0) {
            throw new Error("除数不能为零")
        }

        return a % b;
    }

    public static replaceString(targetString: string, fixedString: string): string {
        // 使用正则表达式进行替换，将 "@_@" 替换为固定字符串
        const replacedString = targetString.replace(/@_@/g, fixedString)
        return replacedString;
    }
    //[0,)
    public static myRandom(inValue: number): number {
        const randomValue = -inValue * 0.5 + Math.random() * inValue;

        return randomValue;
    }

    public static myRandomMinMAX(min: number, max: number): number {
        if (min >= max) {
            [min, max] = [max, min]; // 交换 min 和 max
        }

        // 计算范围内的随机数
        const range = max - min;
        const randomValue = Math.random() * range;

        // 平移随机数，使其位于 min 和 max 之间
        const result = randomValue + min;

        return result;
    }

    public static areRectanglesColliding(rect1: { x: number; y: number; width: number; height: number }, rect2: { x: number; y: number; width: number; height: number }): boolean {
        // 计算矩形的左上角和右下角坐标
        const rect1Left = rect1.x - rect1.width / 2;
        const rect1Top = rect1.y - rect1.height / 2;
        const rect1Right = rect1.x + rect1.width / 2;
        const rect1Bottom = rect1.y + rect1.height / 2;

        const rect2Left = rect2.x - rect2.width / 2;
        const rect2Top = rect2.y - rect2.height / 2;
        const rect2Right = rect2.x + rect2.width / 2;
        const rect2Bottom = rect2.y + rect2.height / 2;

        // 检查是否相撞
        if (
            rect1Left < rect2Right &&
            rect1Right > rect2Left &&
            rect1Top < rect2Bottom &&
            rect1Bottom > rect2Top
        ) {
            // 矩形相撞
            return true;
        } else {
            // 矩形不相撞
            return false;
        }
    }

    public static isNotEmpty(input: string): boolean {
        // 使用条件判断，检查字符串是否不为空或不为 undefined
        if (input && input.trim() !== '') {
            return true; // 字符串不为空
        } else {
            return false; // 字符串为空
        }
    }

    /**
     * 格式化数字，用于显示
     * - 小于1000的数字，有小数则保留两位
     * - 大于等于1000的数字，转换为 k, m, b, t 等单位
     * @param num 待格式化的数字
     * @returns 格式化后的字符串
     */
    public static formatNumber(num: number): string {
        if (num < 1000) {
            return num % 1 === 0 ? num.toString() : num.toFixed(2);
        }

        const si = [
            { value: 1, symbol: "" },
            { value: 1E3, symbol: "k" },
            { value: 1E6, symbol: "m" },
            { value: 1E9, symbol: "b" },
            { value: 1E12, symbol: "t" },
            { value: 1E15, symbol: "p" },
            { value: 1E18, symbol: "e" }
        ];

        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

        let i;
        for (i = si.length - 1; i > 0; i--) {
            if (num >= si[i].value) {
                break;
            }
        }

        const formattedNum = (num / si[i].value).toFixed(2).replace(rx, "$1");
        return formattedNum + si[i].symbol;
    }

    /**
     * 将总秒数格式化为"d天h小时m分s秒"的字符串
     * @param totalSeconds 总秒数
     * @returns 格式化后的字符串
     */
    public static formatTimeCountdown(totalSeconds: number): string {
        if (totalSeconds <= 0) {
            return "活动已结束";
        }
    
        const days = Math.floor(totalSeconds / 86400); // 60 * 60 * 24
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
    
        return `${days}天${hours}小时${minutes}分${seconds}秒`;
    }

    /**
     * 梯度经验系统 - 获取指定等级所需的经验值（使用配置表）
     * @param level 目标等级
     * @returns 该等级所需的经验值
     */
    public static getExpRequiredForLevel(level: number): number {
        // 确保等级最小为1
        if (level < 1) {
            level = 1;
        }
        
        // 使用内联配置表数据
        const levelExps: { [key: string]: number } = {
            "level_1": 16,
            "level_2": 16,
            "level_3": 16,
            "level_4": 16,
            "level_5": 16,
            "level_6": 31,
            "level_7": 31,
            "level_8": 31,
            "level_9": 31,
            "level_10": 31,
            "level_11": 31,
            "level_12": 31,
            "level_13": 31,
            "level_14": 31,
            "level_15": 31,
            "level_16": 48,
            "level_17": 48,
            "level_18": 48,
            "level_19": 48,
            "level_20": 48
        };
        
        const key = `level_${level}`;
        const exp = levelExps[key];
        
        // 如果配置表中没有对应等级，使用默认值48
        return exp !== undefined ? exp : 48;
    }

    /**
     * 梯度经验系统 - 计算达到指定等级所需的总经验值
     * @param level 目标等级
     * @returns 累计总经验值
     */
    public static getTotalExpForLevel(level: number): number {
        let totalExp = 0;
        
        for (let i = 1; i < level; i++) {
            totalExp += Utils.getExpRequiredForLevel(i);
        }
        
        return totalExp;
    }

    /**
     * 梯度经验系统 - 根据总经验值计算等级
     * @param totalExp 总经验值
     * @returns 当前等级（最小为1级）
     */
    public static getLevelFromTotalExp(totalExp: number): number {
        // 如果总经验为0或负数，返回1级
        if (totalExp <= 0) {
            return 1;
        }
        
        let level = 1;
        let accumulatedExp = 0;
        
        // 从1级开始计算，累加每级所需经验
        while (true) {
            const expForCurrentLevel = Utils.getExpRequiredForLevel(level);
            
            // 如果当前累积经验 + 本级经验 > 总经验，说明玩家还在当前等级
            if (accumulatedExp + expForCurrentLevel > totalExp) {
                break;
            }
            
            // 累加本级经验，升到下一级
            accumulatedExp += expForCurrentLevel;
            level++;
        }
        
        return level;
    }

    /**
     * 梯度经验系统 - 计算当前等级内的经验进度
     * @param totalExp 总经验值
     * @param currentLevel 当前等级
     * @returns 当前等级内的经验值和该等级所需总经验值
     */
    public static getCurrentLevelProgress(totalExp: number, currentLevel: number): { currentLevelExp: number; requiredExpForLevel: number } {
        const totalExpForCurrentLevel = Utils.getTotalExpForLevel(currentLevel);
        const currentLevelExp = totalExp - totalExpForCurrentLevel;
        const requiredExpForLevel = Utils.getExpRequiredForLevel(currentLevel);
        
        return { currentLevelExp, requiredExpForLevel };
    }

    /**
     * 测试梯度经验系统配置表
     */
    public static testLevelExpConfig(): void {
        console.log('=== Utils.梯度经验系统测试（从1级开始）===');
        
        console.log('\n等级经验配置表:');
        console.log('1-5级: 每级16经验');
        console.log('6-15级: 每级31经验');
        console.log('16-20+级: 每级48经验');
        
        console.log('\n各等级累计经验测试:');
        for (let level = 1; level <= 25; level++) {
            const expForLevel = Utils.getExpRequiredForLevel(level);
            const totalExp = Utils.getTotalExpForLevel(level);
            console.log(`等级 ${level}: 本级需要 ${expForLevel} 经验, 累计需要 ${totalExp} 经验`);
        }
        
        // 测试等级计算
        console.log('\n经验值到等级的转换测试:');
        const testExpValues = [0, 15, 16, 31, 47, 48, 79, 110, 140, 170, 200, 240, 280, 320, 360, 400, 450, 500, 600, 700, 800, 900, 1000];
        testExpValues.forEach(exp => {
            const level = Utils.getLevelFromTotalExp(exp);
            const { currentLevelExp, requiredExpForLevel } = Utils.getCurrentLevelProgress(exp, level);
            console.log(`总经验 ${exp}: 等级 ${level}, 当前等级内经验 ${currentLevelExp}/${requiredExpForLevel}`);
        });
        
        // 验证等级从1开始
        console.log('\n等级边界测试:');
        console.log(`总经验 0: 等级 ${Utils.getLevelFromTotalExp(0)} (应该是1级)`);
        console.log(`总经验 -10: 等级 ${Utils.getLevelFromTotalExp(-10)} (应该是1级)`);
        console.log(`总经验 1: 等级 ${Utils.getLevelFromTotalExp(1)} (应该是1级)`);
        console.log(`总经验 15: 等级 ${Utils.getLevelFromTotalExp(15)} (应该是1级)`);
        console.log(`总经验 16: 等级 ${Utils.getLevelFromTotalExp(16)} (应该是2级)`);
    }

}


