import { sys } from 'cc';

export type ChallengeRecord = {
    timestamp: number;
    dateKey: string;
    mode: 'arena';
    opponentName: string;
    result: 'win' | 'lose';
};

export class ChallengeLog {
    private static STORAGE_KEY = 'pk_challenge_records';

    private static getTodayKey(): string {
        const d = new Date();
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');
        return `${d.getFullYear()}${mm}${dd}`;
    }

    public static addRecord(partial: { opponentName: string; result: 'win' | 'lose'; timestamp?: number; dateKey?: string }) {
        const record: ChallengeRecord = {
            timestamp: partial.timestamp ?? Date.now(),
            dateKey: partial.dateKey ?? this.getTodayKey(),
            mode: 'arena',
            opponentName: partial.opponentName,
            result: partial.result,
        };
        let list: ChallengeRecord[] = [];
        try {
            const raw = sys.localStorage.getItem(this.STORAGE_KEY) || '[]';
            list = JSON.parse(raw);
            if (!Array.isArray(list)) list = [];
        } catch {
            list = [];
        }
        list.push(record);
        // 最多保留100条，按时间排序保留最新
        list.sort((a, b) => b.timestamp - a.timestamp);
        if (list.length > 100) list = list.slice(0, 100);
        try {
            sys.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
        } catch {
            // 忽略写入失败
        }
    }

    public static getRecords(limit = 50): ChallengeRecord[] {
        try {
            const raw = sys.localStorage.getItem(this.STORAGE_KEY) || '[]';
            const list: ChallengeRecord[] = JSON.parse(raw) || [];
            const sorted = [...list].sort((a, b) => b.timestamp - a.timestamp);
            return sorted.slice(0, limit);
        } catch {
            return [];
        }
    }
}