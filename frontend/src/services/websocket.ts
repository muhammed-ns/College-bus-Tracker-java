import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BusLocation } from '../types';

export class BusWebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private locationCallback: ((location: BusLocation) => void) | null = null;
  private connectionStatusCallback: ((connected: boolean) => void) | null = null;

  public connect(
    onLocation: (location: BusLocation) => void,
    onStatusChange?: (connected: boolean) => void
  ) {
    this.locationCallback = onLocation;
    if (onStatusChange) {
      this.connectionStatusCallback = onStatusChange;
    }

    if (this.client && this.client.active) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws-bus';

    this.client = new Client({
      // Use SockJS fallback factory for compatibility with Spring Boot's SockJS endpoint
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg: string) => {
        // console.debug('[STOMP]', msg);
      },
      onConnect: () => {
        this.isConnected = true;
        if (this.connectionStatusCallback) {
          this.connectionStatusCallback(true);
        }

        // Subscribe to live bus location topic
        this.client?.subscribe('/topic/bus/1/location', (message) => {
          try {
            const data: BusLocation = JSON.parse(message.body);
            if (this.locationCallback) {
              this.locationCallback(data);
            }
          } catch (err) {
            console.error('Failed to parse STOMP bus location message:', err);
          }
        });
      },
      onDisconnect: () => {
        this.isConnected = false;
        if (this.connectionStatusCallback) {
          this.connectionStatusCallback(false);
        }
      },
      onStompError: (frame) => {
        console.error('STOMP protocol error:', frame.headers['message']);
        this.isConnected = false;
        if (this.connectionStatusCallback) {
          this.connectionStatusCallback(false);
        }
      },
      onWebSocketClose: () => {
        this.isConnected = false;
        if (this.connectionStatusCallback) {
          this.connectionStatusCallback(false);
        }
      },
    });

    this.client.activate();
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.isConnected = false;
    if (this.connectionStatusCallback) {
      this.connectionStatusCallback(false);
    }
  }

  public getConnected(): boolean {
    return this.isConnected;
  }
}

export const busWebSocket = new BusWebSocketService();
export default busWebSocket;
