// Centralized logging service
// Replaces console statements and prepares for production error tracking

type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';

  /**
   * Log informational messages (development only)
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Log warning messages (development only)
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    }
  }

  /**
   * Log error messages
   * In development: logs to console
   * In production: can be configured to send to error tracking service
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error || '', context || '');
    } else {
      // TODO: In production, send to error tracking service (Sentry, LogRocket, etc.)
      // Example:
      // Sentry.captureException(error instanceof Error ? error : new Error(message), {
      //   extra: context,
      // });
    }
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }
}

export const logger = new Logger();
