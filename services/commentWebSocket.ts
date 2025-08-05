import { CONFIG } from '@/Constants/config';
import { Comment } from '@/types/Comments';

export interface CommentWebSocketEvents {
  onNewComment: (comment: Comment) => void;
  onCommentUpdate: (comment: Comment) => void;
  onCommentDelete: (commentId: string) => void;
  onError: (error: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export class CommentWebSocket {
  private ws: WebSocket | null = null;
  private videoId: string | null = null;
  private token: string | null = null;
  private events: Partial<CommentWebSocketEvents> = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(videoId: string, token: string) {
    this.videoId = videoId;
    this.token = token;
  }

  connect() {
    if (!this.videoId || !this.token) {
      console.log('❌ Cannot connect: missing videoId or token');
      return;
    }

    try {
      // Convert HTTP URL to WebSocket URL
      const wsUrl = CONFIG.API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
      const url = `${wsUrl}/ws/comments/${this.videoId}?token=${this.token}`;
      
      console.log('🔌 Connecting to WebSocket:', url);
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected for video:', this.videoId);
        this.reconnectAttempts = 0;
        this.events.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message:', data);

          switch (data.type) {
            case 'new_comment':
              this.events.onNewComment?.(data.comment);
              break;
            case 'comment_updated':
              this.events.onCommentUpdate?.(data.comment);
              break;
            case 'comment_deleted':
              this.events.onCommentDelete?.(data.commentId);
              break;
            case 'error':
              this.events.onError?.(data.message);
              break;
            default:
              console.log('🤷‍♂️ Unknown WebSocket message type:', data.type);
          }
        } catch (err) {
          console.log('❌ Error parsing WebSocket message:', err);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        this.events.onDisconnect?.();
        
        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
        }
      };

      this.ws.onerror = (error) => {
        console.log('❌ WebSocket error:', error);
        this.events.onError?.('Connection error');
      };

    } catch (err) {
      console.log('❌ Error creating WebSocket:', err);
      this.events.onError?.('Failed to connect');
    }
  }

  disconnect() {
    if (this.ws) {
      console.log('🔌 Disconnecting WebSocket');
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
  }

  on<K extends keyof CommentWebSocketEvents>(event: K, callback: CommentWebSocketEvents[K]) {
    this.events[event] = callback;
  }

  off<K extends keyof CommentWebSocketEvents>(event: K) {
    delete this.events[event];
  }

  // Send a message (for future use)
  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.log('❌ WebSocket not connected, cannot send message');
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Hook for using WebSocket in React components
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export const useCommentWebSocket = (videoId: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<CommentWebSocket | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!videoId || !token) {
      return;
    }

    // Create WebSocket connection
    wsRef.current = new CommentWebSocket(videoId, token);
    
    wsRef.current.on('onConnect', () => {
      setIsConnected(true);
    });

    wsRef.current.on('onDisconnect', () => {
      setIsConnected(false);
    });

    wsRef.current.on('onError', (error) => {
      console.log('WebSocket error:', error);
      setIsConnected(false);
    });

    wsRef.current.connect();

    return () => {
      wsRef.current?.disconnect();
      wsRef.current = null;
      setIsConnected(false);
    };
  }, [videoId, token]);

  return {
    ws: wsRef.current,
    isConnected,
  };
};