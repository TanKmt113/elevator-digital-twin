type RealtimeListener = (payload: unknown) => void;
type ConnectionStateListener = (state: 'connecting' | 'live' | 'stale' | 'degraded') => void;

function buildWebSocketUrl(buildingId: string, token?: string): string {
  const explicitUrl = import.meta.env.VITE_WS_URL?.replace(/\/$/, '');
  const baseUrl =
    explicitUrl ||
    (import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/^http/, 'ws').replace(/\/$/, '')
      : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);
  const url = new URL(`${baseUrl}/ws`);
  url.searchParams.set('buildingId', buildingId);

  if (token) {
    url.searchParams.set('token', token);
  }

  return url.toString();
}

export class RealtimeClient {
  private readonly listeners = new Set<RealtimeListener>();
  private readonly connectionListeners = new Set<ConnectionStateListener>();
  private socket?: WebSocket;
  private reconnectTimer?: number;
  private buildingId?: string;
  private token?: string;
  private shouldReconnect = false;

  onMessage(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onConnectionState(listener: ConnectionStateListener): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  connect(buildingId: string, token?: string): void {
    this.buildingId = buildingId;
    this.token = token;
    this.shouldReconnect = true;
    this.emitConnectionState('connecting');
    this.open();
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    this.socket?.close();
    this.socket = undefined;
  }

  emit(payload: unknown): void {
    this.listeners.forEach((listener) => listener(payload));
  }

  private open(): void {
    if (!this.buildingId) {
      return;
    }

    this.socket?.close();
    this.socket = new WebSocket(buildWebSocketUrl(this.buildingId, this.token));

    this.socket.addEventListener('open', () => {
      this.emitConnectionState('live');
    });

    this.socket.addEventListener('message', (event) => {
      try {
        this.emit(JSON.parse(String(event.data)));
      } catch {
        this.emitConnectionState('degraded');
      }
    });

    this.socket.addEventListener('close', () => {
      this.emitConnectionState('stale');
      this.scheduleReconnect();
    });

    this.socket.addEventListener('error', () => {
      this.emitConnectionState('degraded');
      this.scheduleReconnect();
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || !this.buildingId || !this.shouldReconnect) {
      return;
    }

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = undefined;
      this.open();
    }, 1000);
  }

  private emitConnectionState(state: 'connecting' | 'live' | 'stale' | 'degraded'): void {
    this.connectionListeners.forEach((listener) => listener(state));
  }
}
