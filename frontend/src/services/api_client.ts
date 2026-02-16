import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { AuthResponse, UserLogin, UserCreate } from '../types/user';
import { Task, TaskCreate, TaskUpdate } from '../types/task';

class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://helloworlds665-todo-full-stack-web-app.hf.space') {
    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds default timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token expiration and refresh
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        console.error('API Error:', error.message);
        if (error.response) {
          console.error('Error Data:', error.response.data);
          console.error('Error Status:', error.response.status);
        }

        const isAuthPage = typeof window !== 'undefined' && 
          (window.location.pathname.includes('/auth/signin') || 
           window.location.pathname.includes('/auth/signup'));

        if (error.response?.status === 401 && !isAuthPage) {
          // Token might be expired, try to refresh it
          const refreshToken = this.getRefreshToken();

          if (refreshToken) {
            try {
              const newAccessToken = await this.refreshAccessToken(refreshToken);
              if (newAccessToken) {
                // Retry the original request with the new token
                error.config!.headers!['Authorization'] = `Bearer ${newAccessToken}`;
                return this.client.request(error.config!);
              }
            } catch (refreshError) {
              // Refresh failed, clear tokens and redirect to login
              this.clearTokens();
              window.location.href = '/auth/signin';
              return Promise.reject(refreshError);
            }
          } else {
            // No refresh token available, redirect to login
            window.location.href = '/auth/signin';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get JWT access token from localStorage/sessionStorage
   */
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'access_token');
    }
    return null;
  }

  /**
   * Get JWT refresh token from localStorage/sessionStorage
   */
  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'refresh_token');
    }
    return null;
  }

  /**
   * Save JWT tokens to localStorage/sessionStorage
   */
  public saveTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'access_token', accessToken);
      localStorage.setItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'refresh_token', refreshToken);
    }
  }

  /**
   * Remove JWT tokens from storage
   */
  public clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'access_token');
      localStorage.removeItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'refresh_token');
    }
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(refreshToken: string): Promise<string | null> {
    if (this.refreshTokenPromise) {
      // If a refresh is already in progress, return the same promise
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const response = await axios.post(`${this.client.defaults.baseURL}/api/auth/refresh`, {
          refresh_token: refreshToken
        });

        const newAccessToken = response.data.access_token;
        this.saveTokens(newAccessToken, refreshToken);

        return newAccessToken;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  /**
   * Generic HTTP methods
   */

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  /**
   * Token management methods
   */

  public clearToken(): void {
    this.clearTokens();
  }

  /**
   * Authentication methods
   */

  public async register(userData: UserCreate): Promise<AuthResponse> {
    try {
      const response = await this.client.post<AuthResponse>('/api/auth/signup', userData);

      // Save tokens on successful registration (auto-login)
      const token = (response.data as any).access_token || response.data.token;
      if (token && response.data.refresh_token) {
        this.saveTokens(token, response.data.refresh_token);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.message);
      }
      throw error;
    }
  }

  public async login(credentials: UserLogin): Promise<AuthResponse> {
    try {
      const response = await this.client.post<AuthResponse>('/api/auth/signin', credentials);

      // Save tokens on successful login
      const token = (response.data as any).access_token || response.data.token;
      if (token && response.data.refresh_token) {
        this.saveTokens(token, response.data.refresh_token);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.message);
      }
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.client.post('/api/auth/signout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with clearing tokens even if backend logout fails
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Task-related methods
   */

  public async getTasks(): Promise<Task[]> {
    try {
      const response = await this.client.get<Task[]>('/api/tasks');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.message);
      }
      throw error;
    }
  }

  public async getTaskById(taskId: string): Promise<Task> {
    try {
      const response = await this.client.get<Task>(`/api/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.message);
      }
      throw error;
    }
  }

  public async createTask(taskData: TaskCreate): Promise<Task> {
    try {
      const response = await this.client.post<Task>('/api/tasks', taskData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.message);
      }
      throw error;
    }
  }

  public async updateTask(taskId: string, taskData: TaskUpdate): Promise<Task> {
    try {
      const response = await this.client.put<Task>(`/api/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.message);
      }
      throw error;
    }
  }

  public async deleteTask(taskId: string): Promise<void> {
    try {
      await this.client.delete(`/api/tasks/${taskId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.message);
      }
      throw error;
    }
  }

  public async completeTask(taskId: string, completed: boolean = true): Promise<Task> {
    try {
      const response = await this.client.patch<Task>(`/api/tasks/${taskId}/complete?completed=${String(completed)}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.message);
      }
      throw error;
    }
  }
}

// Singleton instance of the API client
export const apiClient = new ApiClient();

export default ApiClient;