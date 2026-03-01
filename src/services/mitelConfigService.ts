import api from './api';

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
}

export const mitelConfigService = new MitelConfigService();
export default mitelConfigService;
