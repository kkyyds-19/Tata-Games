import { EventManager, ChatEvents } from '../global/EventManager';
import { UserInfoData } from '../user/UserInfoData';
import { NetworkConfig } from '../global/config/NetworkConfig';

export interface ChatMessage {
    userId: string;
    userName: string;
    content: string;
    channel?: string;
    time?: number;
}

export class ChatService {
    private static _instance: ChatService;
    public static getInstance(): ChatService {
        if (!this._instance) this._instance = new ChatService();
        return this._instance;
    }

    private ws: WebSocket | null = null;
    private url: string | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private reconnectDelayMs = 2000;
    private heartbeatTimer: any = null;
    private heartbeatIntervalMs = 30000;

    private hasAuthed = false;
    private pendingMessages: any[] = [];
    private manualClose = false;

    private urlCandidates: string[] = [];
    private urlCandidateIndex = 0;

    private constructor() {}

    public init(url?: string) {
        this.manualClose = false;
        if (url && url.length > 0) {
            this.urlCandidates = [url];
            this.urlCandidateIndex = 0;
        } else {
            this.urlCandidates = this.composeUrlCandidates();
            this.urlCandidateIndex = 0;
        }
        this.url = this.urlCandidates[this.urlCandidateIndex] || null;
        EventManager.getInstance().emit(ChatEvents.CHAT_CONNECT, { url: this.url });
        this.connect();
    }

    private getPreferredWsProto(apiUrl: string): 'ws' | 'wss' {
        let fromApi: 'ws' | 'wss' = apiUrl.startsWith('https') ? 'wss' : 'ws';
        try {
            const u = new URL(apiUrl);
            fromApi = u.protocol === 'https:' ? 'wss' : 'ws';
        } catch {}

        const locProto = (globalThis as any)?.location?.protocol;
        if (locProto === 'https:') {
            return 'wss';
        }
        return fromApi;
    }

    private composeUrlCandidates(): string[] {
        const direct = (NetworkConfig as any).CHAT_WS_URL as string | undefined;
        const api = NetworkConfig.API_URL;
        const suffix = NetworkConfig.CHAT_WS_PATH || '/ws/chat';

        const candidates: string[] = [];
        const add = (raw: string) => {
            const u = this.appendTokenQuery(raw);
            if (candidates.indexOf(u) < 0) {
                candidates.push(u);
            }
        };

        if (direct && direct.length > 0) {
            add(direct);
            return candidates;
        }

        const primaryProto = this.getPreferredWsProto(api);
        const altProto: 'ws' | 'wss' = primaryProto === 'ws' ? 'wss' : 'ws';

        try {
            const u = new URL(api);
            const apiPrefix = (u.pathname || '').replace(/\/+$/, '');
            const fullPath = `${apiPrefix}${suffix.startsWith('/') ? '' : '/'}${suffix}`;
            const fullPathNoPrefix = `${suffix.startsWith('/') ? '' : '/'}${suffix}`;
            add(`${primaryProto}://${u.host}${fullPath}`);
            add(`${primaryProto}://${u.host}${fullPathNoPrefix}`);
            add(`${altProto}://${u.host}${fullPath}`);
            add(`${altProto}://${u.host}${fullPathNoPrefix}`);
        } catch {
            const host = api.replace(/^https?:\/\//, '').split('/')[0];
            const fullPathNoPrefix = `${suffix.startsWith('/') ? '' : '/'}${suffix}`;
            add(`${primaryProto}://${host}${fullPathNoPrefix}`);
            add(`${altProto}://${host}${fullPathNoPrefix}`);
        }

        return candidates;
    }

    private connect() {
        if (!this.url) return;
        try {
            this.hasAuthed = false;
            if (this.ws) {
                try { this.ws.close(); } catch { /* noop */ }
            }
            console.log('[ChatService] connect url =', this.url.replace(/(usertoken=)[^&]+/i, '$1<redacted>'));
            this.ws = new WebSocket(this.url);
            this.ws.onopen = this.onOpen.bind(this);
            this.ws.onmessage = this.onMessage.bind(this);
            this.ws.onclose = this.onClose.bind(this);
            this.ws.onerror = this.onError.bind(this);
        } catch (e) {
            this.scheduleReconnect();
        }
    }

    private onOpen() {
        this.reconnectAttempts = 0;
        console.log('[ChatService] onOpen');
        EventManager.getInstance().emit(ChatEvents.CHAT_CONNECTED);
        this.startHeartbeat();
        this.authenticate();
        if (this.pendingMessages.length > 0) {
            const list = this.pendingMessages.slice();
            this.pendingMessages.length = 0;
            for (let i = 0; i < list.length; i++) {
                this.sendRaw(list[i]);
            }
        }
    }

    private authenticate() {
        if (this.hasAuthed) return;
        const token = UserInfoData.getInstance().getBearer();
        if (token && token.length > 0) {
            this.sendRaw({ type: 'auth', usertoken: token });
            this.hasAuthed = true;
        }
    }

    private appendTokenQuery(url: string): string {
        const token = UserInfoData.getInstance().getBearer();
        if (!token) return url;
        try {
            const u = new URL(url);
            u.searchParams.set('usertoken', token);
            return u.toString();
        } catch {
            const hasQuery = url.indexOf('?') >= 0;
            const sep = hasQuery ? '&' : '?';
            return `${url}${sep}usertoken=${encodeURIComponent(token)}`;
        }
    }

    private onMessage(evt: MessageEvent) {
        let raw: any = evt.data as any;
        console.log('[ChatService] onMessage raw =', raw);
        let data: any;
        try {
            if (typeof raw === 'string') {
                data = JSON.parse(raw);
            } else {
                data = raw;
            }
        } catch {
            data = { content: String(raw) };
        }

        if (!data) {
            return;
        }

        const content = data.content ?? data.msg ?? data.message ?? '';
        if (!content || String(content).trim().length === 0) {
            return;
        }

        const msg: ChatMessage = {
            userId: data.userId ?? data.uid ?? data.id ?? '',
            userName: data.userName ?? data.nickname ?? data.name ?? '玩家',
            content: String(content),
            channel: data.channel ?? 'global',
            time: data.time ?? Date.now()
        };
        EventManager.getInstance().emit(ChatEvents.CHAT_MESSAGE_RECEIVED, msg);
    }

    private onClose(ev?: any) {
        this.stopHeartbeat();
        try {
            if (ev && typeof ev.code === 'number') {
                console.log('[ChatService] onClose code =', ev.code, 'reason =', ev.reason || '', 'url =', (this.url || '').replace(/(usertoken=)[^&]+/i, '$1<redacted>'));
            } else {
                console.log('[ChatService] onClose url =', (this.url || '').replace(/(usertoken=)[^&]+/i, '$1<redacted>'));
            }
        } catch {}
        EventManager.getInstance().emit(ChatEvents.CHAT_DISCONNECTED);
        if (!this.manualClose) {
            this.scheduleReconnect();
        }
    }

    private onError(ev?: any) {
        try {
            console.log('[ChatService] onError', ev, 'readyState =', this.ws ? this.ws.readyState : -1, 'url =', (this.url || '').replace(/(usertoken=)[^&]+/i, '$1<redacted>'));
        } catch {}
        EventManager.getInstance().emit(ChatEvents.CHAT_ERROR);
    }

    private scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
        this.reconnectAttempts++;
        setTimeout(() => {
            if (this.urlCandidates.length > 0 && this.urlCandidateIndex < this.urlCandidates.length - 1) {
                this.urlCandidateIndex++;
            } else {
                this.urlCandidates = this.composeUrlCandidates();
                this.urlCandidateIndex = 0;
            }
            this.url = this.urlCandidates[this.urlCandidateIndex] || null;
            this.connect();
        }, this.reconnectDelayMs);
    }

    private startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            this.sendRaw({ type: 'ping', time: Date.now() });
        }, this.heartbeatIntervalMs);
    }

    private stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    public disconnect() {
        this.manualClose = true;
        this.stopHeartbeat();
        if (this.ws) {
            try { this.ws.close(); } catch { /* noop */ }
            this.ws = null;
        }
    }

    public sendMessage(content: string, channel: string = 'global') {
        this.authenticate();
        const ui = UserInfoData.getInstance();
        const msg = {
            type: 'chat',
            content,
            channel,
            userId: ui.getUserId(),
            userName: ui.getUserName(),
            time: Date.now(),
            usertoken: ui.getBearer()
        };
        console.log('[ChatService] sendMessage', msg);
        EventManager.getInstance().emit(ChatEvents.CHAT_SEND, msg);
        this.sendRaw(msg);
    }

    private sendRaw(payload: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                console.log('[ChatService] sendRaw', payload);
                this.ws.send(JSON.stringify(payload));
            } catch { /* noop */ }
        } else {
            console.log('[ChatService] socket not open, queue message');
            this.pendingMessages.push(payload);
        }
    }
}
