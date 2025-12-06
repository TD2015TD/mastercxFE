import api from './api';

export interface Lookup {
  id: number;
  code: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

export interface LookupResponse {
  success: boolean;
  data: Lookup[];
}

/**
 * Get lookups by type with localized names
 * @param type The lookup type (e.g., 'department', 'ticket_priority')
 * @param locale Optional locale (defaults to current language from localStorage)
 * @returns Array of lookup items with localized names
 */
export const getLookupsByType = async (
  type: string,
  locale?: string
): Promise<Lookup[]> => {
  try {
    // Get locale from localStorage if not provided
    const currentLocale = locale || localStorage.getItem('preferred-language') || 'en';
    
    const response = await api.get<LookupResponse>(`/lookups`, {
      params: {
        type,
        locale: currentLocale
      }
    });

    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch lookups for type: ${type}`, error);
    throw error;
  }
};

/**
 * Get all lookup types available in the system
 * @returns Array of lookup type strings
 */
export const getLookupTypes = async (): Promise<string[]> => {
  try {
    const response = await api.get<{ success: boolean; data: string[] }>('/lookups/types');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch lookup types', error);
    throw error;
  }
};

/**
 * Get all lookups grouped by type
 * @param locale Optional locale (defaults to current language from localStorage)
 * @returns Object with lookup types as keys and arrays of lookups as values
 */
export const getAllLookupsGrouped = async (
  locale?: string
): Promise<Record<string, Lookup[]>> => {
  try {
    const currentLocale = locale || localStorage.getItem('preferred-language') || 'en';
    
    const response = await api.get<{ success: boolean; data: Record<string, Lookup[]> }>('/lookups', {
      params: {
        locale: currentLocale
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch grouped lookups', error);
    throw error;
  }
};

/**
 * Helper function to get department lookups
 */
export const getDepartments = async (locale?: string): Promise<Lookup[]> => {
  return getLookupsByType('department', locale);
};

/**
 * Helper function to get priority lookups
 */
export const getPriorities = async (locale?: string): Promise<Lookup[]> => {
  return getLookupsByType('ticket_priority', locale);
};

/**
 * Helper function to get ticket status lookups
 */
export const getTicketStatuses = async (locale?: string): Promise<Lookup[]> => {
  return getLookupsByType('ticket_status', locale);
};

/**
 * Helper function to get urgency lookups
 */
export const getUrgencies = async (locale?: string): Promise<Lookup[]> => {
  return getLookupsByType('urgency', locale);
};

/**
 * Helper function to get impact lookups
 */
export const getImpacts = async (locale?: string): Promise<Lookup[]> => {
  return getLookupsByType('impact', locale);
};

/**
 * Helper function to get channel lookups
 */
export const getChannels = async (locale?: string): Promise<Lookup[]> => {
  return getLookupsByType('channel', locale);
};

/**
 * Helper function to get ID type lookups
 */
export const getIdTypes = async (locale?: string): Promise<Lookup[]> => {
  return getLookupsByType('id_type', locale);
};

export default {
  getLookupsByType,
  getLookupTypes,
  getAllLookupsGrouped,
  getDepartments,
  getPriorities,
  getTicketStatuses,
  getUrgencies,
  getImpacts,
  getChannels,
  getIdTypes,
};
