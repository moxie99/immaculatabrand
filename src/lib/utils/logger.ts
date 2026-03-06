/**
 * Logger utility for consistent logging throughout the application
 * Supports multiple log levels and request ID tracking for debugging
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  requestId?: string;
  [key: string]: any;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.logLevel = this.getLogLevel();
  }

  private getLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
    const validLevels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    
    if (envLevel && validLevels.includes(envLevel)) {
      return envLevel;
    }
    
    return this.isDevelopment ? 'debug' : 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    
    let formattedMessage = `[${timestamp}] [${levelStr}]`;
    
    if (context?.requestId) {
      formattedMessage += ` [${context.requestId}]`;
    }
    
    formattedMessage += ` ${message}`;
    
    return formattedMessage;
  }

  private logWithContext(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, context);
    
    // Extract context without requestId for additional logging
    const additionalContext = context ? { ...context } : {};
    delete additionalContext.requestId;
    
    const hasAdditionalContext = Object.keys(additionalContext).length > 0;

    switch (level) {
      case 'error':
        console.error(formattedMessage);
        if (hasAdditionalContext) {
          console.error('Context:', additionalContext);
        }
        break;
      case 'warn':
        console.warn(formattedMessage);
        if (hasAdditionalContext) {
          console.warn('Context:', additionalContext);
        }
        break;
      case 'info':
        console.info(formattedMessage);
        if (hasAdditionalContext) {
          console.info('Context:', additionalContext);
        }
        break;
      case 'debug':
        console.debug(formattedMessage);
        if (hasAdditionalContext) {
          console.debug('Context:', additionalContext);
        }
        break;
    }
  }

  /**
   * Log an error message
   */
  error(message: string, context?: LogContext): void {
    this.logWithContext('error', message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    this.logWithContext('warn', message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    this.logWithContext('info', message, context);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    this.logWithContext('debug', message, context);
  }

  /**
   * Create a child logger with a specific request ID
   */
  withRequestId(requestId: string): {
    error: (message: string, context?: Omit<LogContext, 'requestId'>) => void;
    warn: (message: string, context?: Omit<LogContext, 'requestId'>) => void;
    info: (message: string, context?: Omit<LogContext, 'requestId'>) => void;
    debug: (message: string, context?: Omit<LogContext, 'requestId'>) => void;
  } {
    return {
      error: (message: string, context?: Omit<LogContext, 'requestId'>) =>
        this.error(message, { ...context, requestId }),
      warn: (message: string, context?: Omit<LogContext, 'requestId'>) =>
        this.warn(message, { ...context, requestId }),
      info: (message: string, context?: Omit<LogContext, 'requestId'>) =>
        this.info(message, { ...context, requestId }),
      debug: (message: string, context?: Omit<LogContext, 'requestId'>) =>
        this.debug(message, { ...context, requestId }),
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for child logger
export type ChildLogger = ReturnType<typeof logger.withRequestId>;
