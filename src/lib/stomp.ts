'use client';

import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken } from '@/api/client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws-chat';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
export type MessageHandler = (message: IMessage) => void;

class StompClientManager {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Set<(state: ConnectionState) => void> = new Set();
  private pendingSubscriptions: Map<string, MessageHandler> = new Map();

  getClient(): Client {
    if (!this.client) {
      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
        connectHeaders: {
          Authorization: `Bearer ${getAccessToken() || ''}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.notifyListeners();

          // 연결 후 대기 중인 구독 처리
          this.pendingSubscriptions.forEach((handler, destination) => {
            this.subscribeInternal(destination, handler);
          });
          this.pendingSubscriptions.clear();

          if (process.env.NODE_ENV === 'development') {
            console.log('[STOMP] Connected');
          }
        },
        onDisconnect: () => {
          this.connectionState = 'disconnected';
          this.subscriptions.clear();
          this.notifyListeners();

          if (process.env.NODE_ENV === 'development') {
            console.log('[STOMP] Disconnected');
          }
        },
        onStompError: (frame) => {
          console.error('[STOMP] Error:', frame.headers['message']);
          this.connectionState = 'error';
          this.notifyListeners();
        },
        onWebSocketClose: () => {
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.connectionState = 'connecting';

            if (process.env.NODE_ENV === 'development') {
              console.log(`[STOMP] Reconnecting... (attempt ${this.reconnectAttempts})`);
            }
          } else {
            this.connectionState = 'error';
            console.error('[STOMP] Max reconnect attempts reached');
          }
          this.notifyListeners();
        },
      });
    }
    return this.client;
  }

  connect(): void {
    const client = this.getClient();
    if (!client.active) {
      this.connectionState = 'connecting';
      this.notifyListeners();

      // 토큰 업데이트
      client.connectHeaders = {
        Authorization: `Bearer ${getAccessToken() || ''}`,
      };

      client.activate();
    }
  }

  disconnect(): void {
    if (this.client?.active) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.pendingSubscriptions.clear();
      this.client.deactivate();
    }
    this.client = null;
    this.connectionState = 'disconnected';
    this.reconnectAttempts = 0;
    this.notifyListeners();
  }

  private subscribeInternal(destination: string, handler: MessageHandler): void {
    if (this.client?.connected && !this.subscriptions.has(destination)) {
      const subscription = this.client.subscribe(destination, handler);
      this.subscriptions.set(destination, subscription);

      if (process.env.NODE_ENV === 'development') {
        console.log('[STOMP] Subscribed to:', destination);
      }
    }
  }

  subscribe(partyId: number, handler: MessageHandler): () => void {
    const destination = `/topic/room/${partyId}`;

    if (this.client?.connected) {
      this.subscribeInternal(destination, handler);
    } else {
      // 연결 전이면 대기 목록에 추가
      this.pendingSubscriptions.set(destination, handler);
    }

    return () => {
      const sub = this.subscriptions.get(destination);
      if (sub) {
        sub.unsubscribe();
        this.subscriptions.delete(destination);

        if (process.env.NODE_ENV === 'development') {
          console.log('[STOMP] Unsubscribed from:', destination);
        }
      }
      this.pendingSubscriptions.delete(destination);
    };
  }

  sendMessage(partyId: number, message: string): void {
    if (!this.client?.connected) {
      console.warn('[STOMP] Cannot send message: not connected');
      return;
    }

    this.client.publish({
      destination: `/app/chat.send/${partyId}`,
      body: JSON.stringify({ message }),
    });
  }

  joinRoom(partyId: number): void {
    if (!this.client?.connected) {
      console.warn('[STOMP] Cannot join room: not connected');
      return;
    }

    this.client.publish({
      destination: `/app/chat.join/${partyId}`,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[STOMP] Joined room:', partyId);
    }
  }

  leaveRoom(partyId: number): void {
    if (!this.client?.connected) {
      console.warn('[STOMP] Cannot leave room: not connected');
      return;
    }

    this.client.publish({
      destination: `/app/chat.leave/${partyId}`,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[STOMP] Left room:', partyId);
    }
  }

  kickMember(partyId: number, targetMemberId: number): void {
    if (!this.client?.connected) {
      console.warn('[STOMP] Cannot kick member: not connected');
      return;
    }

    this.client.publish({
      destination: `/app/chat.kick/${partyId}/${targetMemberId}`,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[STOMP] Kicked member:', targetMemberId, 'from room:', partyId);
    }
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  onStateChange(listener: (state: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    // 즉시 현재 상태 전달
    listener(this.connectionState);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.connectionState));
  }
}

// 싱글톤 인스턴스
export const stompClient = new StompClientManager();
