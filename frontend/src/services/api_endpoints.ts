/**
 * API Endpoint Utilities
 * Centralized definition of all API endpoints for the Todo application
 */

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  SIGNUP: '/auth/signup',
  SIGNIN: '/auth/signin',
  SIGNOUT: '/auth/signout',
  REFRESH: '/auth/refresh',
  VERIFY: '/auth/verify',
  ME: '/users/me'
} as const;

// User endpoints
export const USER_ENDPOINTS = {
  GET_USER: (userId: string) => `/users/${userId}`,
  UPDATE_USER: (userId: string) => `/users/${userId}`,
  DELETE_USER: (userId: string) => `/users/${userId}`
} as const;

// Task endpoints
export const TASK_ENDPOINTS = {
  GET_ALL_TASKS: '/tasks',
  GET_TASK_BY_ID: (taskId: string) => `/tasks/${taskId}`,
  CREATE_TASK: '/tasks',
  UPDATE_TASK: (taskId: string) => `/tasks/${taskId}`,
  DELETE_TASK: (taskId: string) => `/tasks/${taskId}`,
  COMPLETE_TASK: (taskId: string) => `/tasks/${taskId}/complete`,
  GET_TASKS_BY_STATUS: (status: string) => `/tasks/status/${status}`,
  GET_TASKS_BY_USER: (userId: string) => `/users/${userId}/tasks`
} as const;

// Chat endpoints
export const CHAT_ENDPOINTS = {
  SEND_MESSAGE: (userId: string) => `/${userId}/chat`,
  LIST_CONVERSATIONS: '/conversations',
  GET_MESSAGES: (conversationId: string) => `/conversations/${conversationId}/messages`,
} as const;

/**
 * API Utility Functions
 */
export class ApiEndpoints {
  static auth = AUTH_ENDPOINTS;
  static user = USER_ENDPOINTS;
  static task = TASK_ENDPOINTS;

  /**
   * Construct a task endpoint with proper ID
   */
  static getTaskEndpoint(operation: keyof typeof TASK_ENDPOINTS, taskId?: string): string {
    if (operation === 'GET_TASK_BY_ID' || operation === 'UPDATE_TASK' || operation === 'DELETE_TASK' || operation === 'COMPLETE_TASK') {
      if (!taskId) {
        throw new Error(`Task ID is required for ${operation} operation`);
      }
      return TASK_ENDPOINTS[operation](taskId);
    }
    const endpoint = TASK_ENDPOINTS[operation as 'GET_ALL_TASKS' | 'CREATE_TASK'];
    return typeof endpoint === 'string' ? endpoint : endpoint as any;
  }

  /**
   * Construct a user endpoint with proper ID
   */
  static getUserEndpoint(operation: keyof typeof USER_ENDPOINTS, userId?: string): string {
    if (!userId) {
      throw new Error(`User ID is required for ${operation} operation`);
    }
    return USER_ENDPOINTS[operation](userId);
  }

  /**
   * Get all endpoints as a flat list (useful for API documentation)
   */
  static getAllEndpoints(): string[] {
    const endpoints: string[] = [];

    // Add auth endpoints (non-parameterized)
    Object.values(AUTH_ENDPOINTS).forEach(endpoint => {
      if (typeof endpoint === 'string') {
        endpoints.push(endpoint);
      }
    });

    // Add task endpoints (some are parameterized)
    endpoints.push(TASK_ENDPOINTS.GET_ALL_TASKS);
    endpoints.push(TASK_ENDPOINTS.CREATE_TASK);

    return [...new Set(endpoints)]; // Remove duplicates
  }
}

// Export specific endpoint groups
export type AuthEndpoints = typeof AUTH_ENDPOINTS;
export type UserEndpoints = typeof USER_ENDPOINTS;
export type TaskEndpoints = typeof TASK_ENDPOINTS;