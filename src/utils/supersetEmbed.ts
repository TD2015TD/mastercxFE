import { embedDashboard } from '@superset-ui/embedded-sdk';
import type { UIConfig, RLSRule } from '../types/superset';
import supersetService from '../services/supersetService';

/**
 * Embed Superset dashboard in a container element
 *
 * @param containerId - ID of the container element
 * @param dashboardId - Superset dashboard ID (UUID)
 * @param options - UI configuration options
 * @param rls - Optional Row-Level Security rules to filter data
 * @returns Promise that resolves when dashboard is loaded
 */
export async function embedSupersetDashboard(
  containerId: string,
  dashboardId: string,
  options: UIConfig = {},
  rls?: RLSRule[]
): Promise<void> {
  const container = document.getElementById(containerId);

  if (!container) {
    throw new Error(`Container element with ID "${containerId}" not found`);
  }

  try {
    // Clear any existing content
    container.innerHTML = '';

    await embedDashboard({
      id: dashboardId,
      supersetDomain: await supersetService.getSupersetDomain(),
      mountPoint: container,
      fetchGuestToken: async () => {
        // Fetch guest token from backend with optional RLS rules
        return await supersetService.getGuestToken(dashboardId, rls);
      },
      dashboardUiConfig: {
        hideTitle: options.hideTitle ?? false,
        hideTab: options.hideTab ?? false,
        hideChartControls: options.hideChartControls ?? false,
        filters: {
          expanded: options.filtersExpanded ?? false,
          visible: options.filtersVisible ?? true,
        },
      },
    });

    // Force the iframe to fill the container
    setTimeout(() => {
      const iframe = container.querySelector('iframe');
      if (iframe) {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
      }
    }, 100);
  } catch (error) {
    console.error('Error embedding Superset dashboard:', error);

    // Show error message in container
    container.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 2rem;
        text-align: center;
        background-color: #fee;
        border: 1px solid #fcc;
        border-radius: 0.5rem;
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; color: #c00;">
          Failed to Load Dashboard
        </h3>
        <p style="color: #666; margin-bottom: 1rem;">
          ${error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <p style="color: #666; font-size: 0.875rem;">
          Please check your connection or contact support if the problem persists.
        </p>
      </div>
    `;

    throw error;
  }
}

/**
 * Unmount Superset dashboard from container
 *
 * @param containerId - ID of the container element
 */
export function unmountSupersetDashboard(containerId: string): void {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }
}
