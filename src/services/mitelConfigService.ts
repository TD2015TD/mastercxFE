import api from './api';
import { getEcho } from './echo';

export interface MitelConfig {
  MITEL_BASE_URL: string;
  MITEL_API_PATH: string;
  MITEL_SIGNALR_URL: string;
  MITEL_CLIENT_ID: string;
  MITEL_CLIENT_SECRET: string;
  TELEPHONY_ENABLED?: string;
}

class MitelConfigService {
  private config: MitelConfig | null = null;
  private configPromise: Promise<MitelConfig> | null = null;
  private telephonyListeners: Array<(enabled: boolean) => void> = [];
  private telephonySubscribed = false;

  /**
   * Get Mitel configuration from API (with caching)
   */
  async getConfig(): Promise<MitelConfig> {
    // If already cached, return immediately
    if (this.config) {
      return this.config;
    }

    // If a request is already in progress, wait for it
    if (this.configPromise) {
      return this.configPromise;
    }

    // Make the API request
    this.configPromise = this.fetchConfig();
    
    try {
      this.config = await this.configPromise;
      return this.config;
    } finally {
      this.configPromise = null;
    }
  }

  /**
   * Fetch configuration from API
   */
  private async fetchConfig(): Promise<MitelConfig> {
    const response = await api.get('/mitel-config');

    if (response.data.status === 'success') {
      return response.data.data as MitelConfig;
    }

    throw new Error('Failed to fetch Mitel configuration');
  }

  /**
   * Clear cached configuration (useful for testing or config updates)
   */
  clearCache(): void {
    this.config = null;
    this.configPromise = null;
  }

  /**
   * Get base URL directly (convenience method)
   */
  async getBaseUrl(): Promise<string> {
    const config = await this.getConfig();
    return config.MITEL_BASE_URL;
  }

  /**
   * Get SignalR URL directly (convenience method)
   */
  async getSignalRUrl(): Promise<string> {
    const config = await this.getConfig();
    return config.MITEL_SIGNALR_URL;
  }

  /**
   * Get telephony enabled state from admin configuration (convenience method)
   * Defaults to false if not set
   */
  async getTelephonyEnabled(): Promise<boolean> {
    const config = await this.getConfig();
    if (config.TELEPHONY_ENABLED === undefined) return false;
    return config.TELEPHONY_ENABLED === 'true';
  }

  /**
   * Get telephony enabled state directly from the API, bypassing the cache.
   *
   * getConfig() caches indefinitely and components that read it typically fetch once on mount,
   * so an already-open tab never sees an admin's flag change until it does a full browser
   * reload. Callers that need to notice a change without one (e.g. periodic polling) should use
   * this instead of getTelephonyEnabled().
   */
  async getTelephonyEnabledFresh(): Promise<boolean> {
    const response = await api.get('/mitel-config');

    if (response.data.status === 'success') {
      return response.data.data?.TELEPHONY_ENABLED === 'true';
    }

    throw new Error('Failed to fetch Mitel configuration');
  }

  /**
   * Subscribe to instant push updates of TELEPHONY_ENABLED (backend:
   * MitelConfigurationController::update() firing TelephonyConfigChanged over
   * the 'telephony-config' Reverb channel the moment an admin flips it).
   * Lazily joins the channel once and fans the event out to every caller, so
   * TelephonyBar/UserProfileDropdown/EmployeeInbox can each just subscribe
   * without three separate WebSocket subscriptions. Callers should keep
   * their own poll as a fallback in case this connection ever drops —
   * this is the fast path, not the only path.
   */
  onTelephonyEnabledChanged(callback: (enabled: boolean) => void): () => void {
    if (!this.telephonySubscribed) {
      this.telephonySubscribed = true;
      try {
        getEcho()
          .channel('telephony-config')
          .listen('.telephony.config.changed', (data: { enabled: boolean }) => {
            if (this.config) {
              this.config.TELEPHONY_ENABLED = data.enabled ? 'true' : 'false';
            }
            this.telephonyListeners.forEach((fn) => fn(data.enabled));
          });
      } catch (err) {
        console.error('[mitelConfigService] Failed to subscribe to telephony-config channel', err);
        this.telephonySubscribed = false;
      }
    }

    this.telephonyListeners.push(callback);
    return () => {
      this.telephonyListeners = this.telephonyListeners.filter((fn) => fn !== callback);
    };
  }
}

export const mitelConfigService = new MitelConfigService();
export default mitelConfigService;
