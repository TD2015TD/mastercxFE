import api from './api';

// ========================================================================
// INTERFACES
// ========================================================================

/** Interface for Mitel ACD Agent (Minimal for existing functions) */
export interface MitelAgent {
  id: string;
  name?: string;
  extension?: string;
  state?: string;
  queue_count?: number;
  queues?: string[];
}

/** Interface for a Mitel Employee (Used by /mitel/employees routes) */
export interface MitelEmployee {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  // Add other employee properties as needed
}

/** Interface for a Mitel Reason Code (Busy, DND, etc.) */
export interface MitelReasonCode {
  id: string;
  type: 'Busy' | 'Dnd' | string;
  name: string;
  // Add other reason code properties
}

/** Interface for a Mitel Queue Group */
export interface MitelQueueGroup {
  id: string;
  name: string;
  // Add other queue group properties
}

/** Interface for a Mitel Case */
export interface MitelCase {
  id: string;
  monthYearCreated: string;
  // Add other case properties
}

/** Generic Response for array data (OData) */
export interface MitelODataResponse<T> {
  success: boolean;
  data?: {
    // The Mitel service returns a structure like { _embedded: { items: T[] }, count: number }
    _embedded: {
      items: T[];
    }
    count: number;
    // Add other OData pagination/meta fields
  };
  message?: string;
}

// Specific Employee response for clarity
export interface MitelEmployeesResponse extends MitelODataResponse<MitelEmployee> { }
export interface MitelReasonCodesResponse extends MitelODataResponse<MitelReasonCode> { }

/** Generic Response for single item data (could be agent, employee, status, or stats) */
export interface MitelResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

/** Payload structure for updating an employee/agent state */
export interface MitelStateUpdatePayload {
  state: string;          // State value (e.g., 'Available', 'Busy')
  reason?: string | null; // Optional reason code/text
  availableReason?: string | null; // Optional available reason
}

// ========================================================================
// EXISTING AGENT ROUTES (Keeping original logic)
// ========================================================================

/**
 * Get list of Mitel agents (Maps to MitelAgentController::index)
 */
export const getMitelAgents = async (): Promise<MitelResponse<MitelAgent[]>> => {
  const response = await api.get('/mitel/agents');
  return response.data;
};

/**
 * Get specific Mitel agent details (Maps to MitelAgentController::show)
 */
export const getMitelAgent = async (agentId: string): Promise<MitelResponse<MitelAgent>> => {
  const response = await api.get(`/mitel/agents/${agentId}`);
  return response.data;
};

/**
 * Get Mitel agent state (Maps to MitelAgentController::getState)
 */
export const getMitelAgentState = async (agentId: string) => {
  const response = await api.get(`/mitel/agents/${agentId}/state`);
  return response.data;
};

/**
 * Update employee Mitel state (Maps to AgentController::updateMitelState - internal wrapper)
 */
export const updateEmployeeState = async (userId: string, payload: MitelStateUpdatePayload) => {
  const response = await api.put(`/agents/${userId}/mitel/state`, payload);
  return response.data;
};


// ========================================================================
// EMPLOYEE ROUTES
// ========================================================================

/**
 * Get list of Mitel employees with optional OData parameters
 * Maps to: GET /mitel/employees
 */
export const getMitelEmployees = async (params?: Record<string, any>): Promise<MitelEmployeesResponse> => {
  const response = await api.get('/mitel/employees', { params });
  return response.data;
};

/**
 * Get specific Mitel employee details by ID, username, or 'me'
 * Maps to: GET /mitel/employees/{id}
 */
export const getMitelEmployeeDetails = async (employeeId: string): Promise<MitelResponse<MitelEmployee>> => {
  const response = await api.get(`/mitel/employees/${employeeId}`);
  return response.data;
};

/**
 * Get Mitel employee presence state (Often returns /stats data)
 * Maps to: GET /mitel/employees/{id}/state
 */
export const getMitelEmployeeState = async (employeeId: string) => {
  const response = await api.get(`/mitel/employees/${employeeId}/state`);
  return response.data;
};

/**
 * Update Mitel Employee State
 * Maps to: PUT /mitel/employees/{id}/state
 */
export const updateMitelEmployeeState = async (employeeId: string, payload: MitelStateUpdatePayload) => {
  const response = await api.put(`/mitel/employees/${employeeId}/state`, payload);
  return response.data;
};

/**
 * Get Mitel employee statistics
 * Maps to: GET /mitel/employees/{id}/stats
 */
export const getMitelEmployeeStats = async (employeeId: string) => {
  const response = await api.get(`/mitel/employees/${employeeId}/stats`);
  return response.data;
};

// ========================================================================
// REASON CODE ROUTES
// ========================================================================

/**
 * Get list of Mitel Reason Codes (Busy, DND, etc.) with optional OData parameters
 * Maps to: GET /mitel/reasoncodes
 */
export const getMitelReasonCodes = async (params?: Record<string, any>): Promise<MitelReasonCodesResponse> => {
  const response = await api.get('/mitel/reasoncodes', { params });
  return response.data;
};

/**
 * Get a specific Mitel Reason Code by ID
 * Maps to: GET /mitel/reasoncodes/{id}
 */
export const getMitelReasonCodeById = async (reasonCodeId: string): Promise<MitelResponse<MitelReasonCode>> => {
  const response = await api.get(`/mitel/reasoncodes/${reasonCodeId}`);
  return response.data;
};

// ========================================================================
// CASE ROUTES
// ========================================================================

/**
 * Get list of Mitel Cases with optional OData parameters
 * Maps to: GET /mitel/cases
 */
export const getMitelCases = async (params?: Record<string, any>): Promise<MitelODataResponse<MitelCase>> => {
  const response = await api.get('/mitel/cases', { params });
  return response.data;
};

/**
 * Get a specific Mitel Case by ID and creation month/year
 * Maps to: GET /mitel/cases/{id}/{monthYearCreated}
 */
export const getMitelCaseById = async (caseId: string, monthYearCreated: string): Promise<MitelResponse<MitelCase>> => {
  const response = await api.get(`/mitel/cases/${caseId}/${monthYearCreated}`);
  return response.data;
};


// ========================================================================
// QUEUE ROUTES
// ========================================================================

/**
 * Get list of Mitel Queue Groups with optional OData parameters
 * Maps to: GET /mitel/queues/groups
 */
export const getMitelQueueGroups = async (params?: Record<string, any>): Promise<MitelODataResponse<MitelQueueGroup>> => {
  const response = await api.get('/mitel/queues/groups', { params });
  return response.data;
};

/**
 * Get the current state (Queue Now) for a Queue Group
 * Maps to: GET /mitel/queues/groups/{id}/state
 */
export const getMitelQueueGroupState = async (groupId: string) => {
  const response = await api.get(`/mitel/queues/groups/${groupId}/state`);
  return response.data;
};


// ========================================================================
// AGENT GROUP ROUTES
// ========================================================================

/**
 * Get all Mitel Agent Groups
 * Maps to: GET /mitel/agents/groups
 */
export const getMitelAgentGroups = async (params?: Record<string, any>) => {
  const response = await api.get('/mitel/agents/groups', { params });
  return response.data;
};

/**
 * Get a specific Mitel Agent Group
 * Maps to: GET /mitel/agents/groups/{id}
 */
export const getMitelAgentGroupById = async (groupId: string) => {
  const response = await api.get(`/mitel/agents/groups/${groupId}`);
  return response.data;
};

/**
 * Get agent states for a Mitel Agent Group
 * Maps to: GET /mitel/agents/groups/{id}/states
 */
export const getMitelAgentGroupStates = async (groupId: string) => {
  const response = await api.get(`/mitel/agents/groups/${groupId}/states`);
  return response.data;
};


// ========================================================================
// EXTENSIONS ROUTES
// ========================================================================

/**
 * Get all Mitel Extensions
 * Maps to: GET /mitel/extensions
 */
export const getMitelExtensions = async (params?: Record<string, any>) => {
  const response = await api.get('/mitel/extensions', { params });
  return response.data;
};

/**
 * Get a specific Mitel Extension
 * Maps to: GET /mitel/extensions/{id}
 */
export const getMitelExtensionById = async (extensionId: string) => {
  const response = await api.get(`/mitel/extensions/${extensionId}`);
  return response.data;
};


// ========================================================================
// DNIS ROUTES
// ========================================================================

/**
 * Get all Mitel DNIS numbers
 * Maps to: GET /mitel/dnis
 */
export const getMitelDnis = async (params?: Record<string, any>) => {
  const response = await api.get('/mitel/dnis', { params });
  return response.data;
};

/**
 * Get a specific Mitel DNIS number
 * Maps to: GET /mitel/dnis/{id}
 */
export const getMitelDnisById = async (dnisId: string) => {
  const response = await api.get(`/mitel/dnis/${dnisId}`);
  return response.data;
};


// ========================================================================
// GLOBAL REPLY TEMPLATE ROUTES
// ========================================================================

/**
 * Get all Mitel Global Reply Templates
 * Maps to: GET /mitel/globalreplytemplate
 */
export const getMitelGlobalReplyTemplates = async (params?: Record<string, any>) => {
  const response = await api.get('/mitel/globalreplytemplate', { params });
  return response.data;
};

/**
 * Get a specific Mitel Global Reply Template
 * Maps to: GET /mitel/globalreplytemplate/{id}
 */
export const getMitelGlobalReplyTemplateById = async (templateId: string) => {
  const response = await api.get(`/mitel/globalreplytemplate/${templateId}`);
  return response.data;
};


// ========================================================================
// WARNING REASON ROUTES
// ========================================================================

/**
 * Get all Mitel Warning Reasons
 * Maps to: GET /mitel/warningreasons
 */
export const getMitelWarningReasons = async (params?: Record<string, any>) => {
  const response = await api.get('/mitel/warningreasons', { params });
  return response.data;
};

/**
 * Get a specific Mitel Warning Reason
 * Maps to: GET /mitel/warningreasons/{id}
 */
export const getMitelWarningReasonById = async (reasonId: string) => {
  const response = await api.get(`/mitel/warningreasons/${reasonId}`);
  return response.data;
};


// ========================================================================
// CHAT & EMAIL ROUTES (Minimal Implementation based on PHP service functions)
// ========================================================================

/**
 * Get list of Personal Chat Reply Template folders.
 * Maps to: GET /mitel/chat/replytemplatefolders
 */
export const getChatReplyTemplateFolders = async () => {
  const response = await api.get('/mitel/chat/replytemplatefolders');
  return response.data;
};

/**
 * Get a reusable email case (often used to initiate an email response).
 * Maps to: GET /mitel/email/reusablecase
 */
export const getEmailReusableCase = async (toAddress: string) => {
  const response = await api.get('/mitel/email/reusablecase', { params: { to: toAddress } });
  return response.data;
};


// ========================================================================
// HELPER FUNCTIONS (Kept as is)
// ========================================================================

/**
 * Helper function to map UI status values to Mitel API PresenceAvailability enum
 */
export const mapStatusToMitelState = (status: string): number => {
  const statusMap: { [key: string]: number } = {
    'available': 1,      // PresenceAvailability.Available
    'busy': 2,           // PresenceAvailability.Busy
    'on-call': 2,        // PresenceAvailability.Busy
    'after-call-work': 2, // PresenceAvailability.Busy
    'away': 4,           // PresenceAvailability.Away
    'offline': 5,        // PresenceAvailability.Offline
    'do-not-disturb': 3  // PresenceAvailability.DoNotDisturb
  };

  return statusMap[status.toLowerCase()] || 1; // Default to Available
};

/**
 * Helper function to determine AvailableReason based on status
 */
export const mapStatusToAvailableReason = (status: string): number => {
  const reasonMap: { [key: string]: number } = {
    'available': 0,      // AvailableReason.Available
    'busy': 0,           // AvailableReason.Available
    'on-call': 0,        // AvailableReason.Available
    'after-call-work': 1, // AvailableReason.ClearWorkTimer
    'away': 0,           // AvailableReason.Available
    'offline': 0,        // AvailableReason.Available
    'do-not-disturb': 3  // AvailableReason.ClearDoNotDisturb
  };



  return reasonMap[status.toLowerCase()] || 0;
};

/**
 * Create presence state payload for Mitel API
 */
export const createPresenceStatePayload = (status: string, reason?: string): MitelStateUpdatePayload => {
  if (status === 'Available') {
    return {
      state: status,
      availableReason: "Login"
    };
  } else if (status === 'Busy') {
    return { state: "Busy", reason: "54bbba16-7858-4f62-b89a-4d4d5ed1d69e" };
  } else if (status === 'DoNotDisturb') {
    return { state: "DoNotDisturb", reason: "eb591174-3ba3-441a-bf1f-6553bf6de8ef" };
  }
  return {
    state: status, // Changed from State to state for consistency with payload interface
    reason: reason || null
  };
};

// ========================================================================
// EXPORTS
// ========================================================================

export default {
  // Existing
  getMitelAgents,
  getMitelAgent,
  getMitelAgentState,
  updateEmployeeState,

  // Employee Endpoints
  getMitelEmployees,
  getMitelEmployeeDetails,
  getMitelEmployeeState,
  updateMitelEmployeeState,
  getMitelEmployeeStats, // Added

  // Reason Code Endpoints
  getMitelReasonCodes,
  getMitelReasonCodeById,

  // Case Endpoints
  getMitelCases,
  getMitelCaseById,

  // Queue Endpoints
  getMitelQueueGroups,
  getMitelQueueGroupState,

  // Agent Group Endpoints
  getMitelAgentGroups,
  getMitelAgentGroupById,
  getMitelAgentGroupStates,

  // Extensions Endpoints
  getMitelExtensions,
  getMitelExtensionById,

  // DNIS Endpoints
  getMitelDnis,
  getMitelDnisById,

  // Global Reply Template Endpoints
  getMitelGlobalReplyTemplates,
  getMitelGlobalReplyTemplateById,

  // Warning Reason Endpoints
  getMitelWarningReasons,
  getMitelWarningReasonById,

  // Chat & Email Endpoints
  getChatReplyTemplateFolders,
  getEmailReusableCase,

  // Helpers
  mapStatusToMitelState,
  createPresenceStatePayload,
};