import api from './api';

export interface MitelConfig {
  MITEL_BASE_URL: string;
  MITEL_API_PATH: string;
  MITEL_SIGNALR_URL: string;
  MITEL_CLIENT_ID: string;
  MITEL_CLIENT_SECRET: string;
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
    try {
      const response = await api.get('/mitel-config');
      
      if (response.data.status === 'success') {
        return response.data.data as MitelConfig;
      }
      
      throw new Error('Failed to fetch Mitel configuration');
    } catch (error) {
      console.error('Error fetching Mitel config:', error);
      
      // Fallback to environment variables if API fails
      return {
        MITEL_BASE_URL: import.meta.env.VITE_MITEL_BASE_URL || 'https://mcx.telediant.com.my',
        MITEL_API_PATH: '/MiccSdk',
        MITEL_SIGNALR_URL: import.meta.env.VITE_MITEL_SIGNALR_URL || 'https://mcx.telediant.com.my/MiccSdk/signalr',
        MITEL_CLIENT_ID: 'CXCRM',
        MITEL_CLIENT_SECRET: '98538800-3af7-4b8f-bfca-f9065b88e5b4',
      };
    }
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
}

export const mitelConfigService = new MitelConfigService();
export default mitelConfigService;
