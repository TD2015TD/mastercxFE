import api from './api';

export interface SupersetConfig {
  SUPERSET_URL: string;
  SUPERSET_USERNAME: string | null; // null = secret, not exposed to frontend
  SUPERSET_PASSWORD: null;          // always null (secret)
}

class SupersetConfigService {
  private config: SupersetConfig | null = null;
  private configPromise: Promise<SupersetConfig> | null = null;

  async getConfig(): Promise<SupersetConfig> {
    if (this.config) {
      return this.config;
    }

    if (this.configPromise) {
      return this.configPromise;
    }

    this.configPromise = this.fetchConfig();

    try {
      this.config = await this.configPromise;
      return this.config;
    } finally {
      this.configPromise = null;
    }
  }

  private async fetchConfig(): Promise<SupersetConfig> {
    const response = await api.get('/superset-config');

    if (response.data.status === 'success') {
      return response.data.data as SupersetConfig;
    }

    throw new Error('Failed to fetch Superset configuration');
  }

  clearCache(): void {
    this.config = null;
    this.configPromise = null;
  }

  async getUrl(): Promise<string> {
    const config = await this.getConfig();
    return config.SUPERSET_URL;
  }
}

export const supersetConfigService = new SupersetConfigService();
export default supersetConfigService;
