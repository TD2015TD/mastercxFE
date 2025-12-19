// services/mitelSignalRService.ts
import * as signalR from '@microsoft/signalr';

export interface EmployeeStateUpdate {
  Id: string;
  Name?: string;
  FirstName?: string;
  LastName?: string;
  Presence?: {
    Aggregate?: {
      State?: string;
      EnteredStateOn?: string;
      Reason?: string;
    };
  };
}

// Get Mitel base URL from Vite environment
const mitelBaseUrl = import.meta.env.MITEL_BASE_URL;

class MitelSignalRService {
  private connection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  /**
   * Initialize connection to Mitel SignalR hub
   * @param baseUrl - Mitel base URL (e.g., "https://your-mitel-server.com/miccsdk")
   * @param accessToken - Bearer token for authentication
   */
  async connect(baseUrl: string = mitelBaseUrl, accessToken: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('Already connected to Mitel SignalR');
      return;
    }

    const hubUrl = `${baseUrl}/signalr`;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => accessToken,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          }
          return null; // Stop reconnecting
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Set up event handlers
    this.setupEventHandlers();

    try {
      await this.connection.start();
      console.log('Connected to Mitel SignalR hub');
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('Error connecting to Mitel SignalR:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Connection lifecycle events
    this.connection.onclose((error) => {
      console.log('SignalR connection closed', error);
      this.notifyListeners('connectionClosed', { error });
    });

    this.connection.onreconnecting((error) => {
      console.log('SignalR reconnecting...', error);
      this.notifyListeners('reconnecting', { error });
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected', connectionId);
      this.notifyListeners('reconnected', { connectionId });
    });

    // Employee state updates
    this.connection.on('employeeStateChanged', (data: EmployeeStateUpdate) => {
      console.log('Employee state changed:', data);
      this.notifyListeners('employeeStateChanged', data);
    });

    // Employee presence updates
    this.connection.on('employeePresenceChanged', (data: any) => {
      console.log('Employee presence changed:', data);
      this.notifyListeners('employeePresenceChanged', data);
    });

    // Other possible events from Mitel
    this.connection.on('agentStateChanged', (data: any) => {
      console.log('Agent state changed:', data);
      this.notifyListeners('agentStateChanged', data);
    });
  }

  /**
   * Subscribe to employee hub for a specific employee
   * @param employeeId - Employee ID or "me" for current user
   */
  async subscribeToEmployee(employeeId: string = 'me'): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR not connected. Call connect() first.');
    }

    try {
      // Subscribe to employee updates
      await this.connection.invoke('SubscribeToEmployee', employeeId);
      console.log(`Subscribed to employee: ${employeeId}`);
    } catch (error) {
      console.error('Error subscribing to employee:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from employee updates
   * @param employeeId - Employee ID or "me"
   */
  async unsubscribeFromEmployee(employeeId: string = 'me'): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('UnsubscribeFromEmployee', employeeId);
      console.log(`Unsubscribed from employee: ${employeeId}`);
    } catch (error) {
      console.error('Error unsubscribing from employee:', error);
    }
  }

  /**
   * Subscribe to queue hub
   * @param queueId - Queue ID
   */
  async subscribeToQueue(queueId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR not connected. Call connect() first.');
    }

    try {
      await this.connection.invoke('SubscribeToQueue', queueId);
      console.log(`Subscribed to queue: ${queueId}`);
    } catch (error) {
      console.error('Error subscribing to queue:', error);
      throw error;
    }
  }

  /**
   * Add event listener
   * @param event - Event name
   * @param callback - Callback function
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Remove event listener
   * @param event - Event name
   * @param callback - Callback function
   */
  off(event: string, callback: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  /**
   * Notify all listeners of an event
   */
  private notifyListeners(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  /**
   * Disconnect from SignalR hub
   */
  async disconnect(): Promise<void> {
    // Get Mitel base URL from Vite environment
    const mitelBaseUrl = import.meta.env.MITEL_BASE_URL;
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('Disconnected from Mitel SignalR');
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
      this.connection = null;
    }
  }

  /**
   * Check if connected
   */

  isConnected(): boolean {
    return !!this.connection && this.connection.state === signalR.HubConnectionState.Connected;
  }
}

// Export singleton instance
export const mitelSignalRService = new MitelSignalRService();
export default mitelSignalRService;