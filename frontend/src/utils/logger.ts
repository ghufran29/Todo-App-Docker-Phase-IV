/**
 * Logger utility for the frontend application
 * Provides structured logging with different log levels and environment-aware behavior
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
}

class Logger {
  private isDevelopment: boolean;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Get current user ID from localStorage if available
   */
  private getUserId(): string | undefined {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          // Decode JWT to get user ID (simplified - in production use a proper JWT library)
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.sub || payload.user_id;
        }
      } catch (error) {
        // Ignore errors in token parsing
      }
    }
    return undefined;
  }

  /**
   * Create a log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.getUserId(),
    };
  }

  /**
   * Store log entry in memory
   */
  private storeLog(entry: LogEntry): void {
    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Send log to external service (placeholder for future implementation)
   */
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    // In production, send logs to a service like Sentry, LogRocket, or custom backend
    // For now, this is a placeholder
    if (!this.isDevelopment && entry.level === LogLevel.ERROR) {
      // Example: await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) });
    }
  }

  /**
   * Debug level logging - only in development
   */
  public debug(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
      console.debug(`[${entry.timestamp}] DEBUG:`, message, context || '');
      this.storeLog(entry);
    }
  }

  /**
   * Info level logging
   */
  public info(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    console.info(`[${entry.timestamp}] INFO:`, message, context || '');
    this.storeLog(entry);
  }

  /**
   * Warning level logging
   */
  public warn(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    console.warn(`[${entry.timestamp}] WARN:`, message, context || '');
    this.storeLog(entry);
    this.sendToExternalService(entry);
  }

  /**
   * Error level logging
   */
  public error(message: string, error?: Error, context?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
    console.error(`[${entry.timestamp}] ERROR:`, message, error || '', context || '');
    this.storeLog(entry);
    this.sendToExternalService(entry);
  }

  /**
   * Log user actions for analytics and debugging
   */
  public logAction(
    action: string,
    category: 'auth' | 'task' | 'navigation' | 'ui',
    metadata?: Record<string, any>
  ): void {
    const entry = this.createLogEntry(LogLevel.INFO, `User action: ${action}`, {
      category,
      ...metadata,
    });

    if (this.isDevelopment) {
      console.log(`[${entry.timestamp}] ACTION [${category}]:`, action, metadata || '');
    }

    this.storeLog(entry);
  }

  /**
   * Get all stored logs
   */
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all stored logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON string
   */
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get logs by level
   */
  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Get logs by user ID
   */
  public getLogsByUserId(userId: string): LogEntry[] {
    return this.logs.filter((log) => log.userId === userId);
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience functions
export const logDebug = (message: string, context?: Record<string, any>) =>
  logger.debug(message, context);

export const logInfo = (message: string, context?: Record<string, any>) =>
  logger.info(message, context);

export const logWarn = (message: string, context?: Record<string, any>) =>
  logger.warn(message, context);

export const logError = (message: string, error?: Error, context?: Record<string, any>) =>
  logger.error(message, error, context);

export const logUserAction = (
  action: string,
  category: 'auth' | 'task' | 'navigation' | 'ui',
  metadata?: Record<string, any>
) => logger.logAction(action, category, metadata);

export default logger;