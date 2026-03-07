/**
 * Centralized logging utility
 * Provides consistent logging with environment-aware behavior
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogOptions {
  context?: string
  data?: Record<string, unknown>
}

const isDevelopment = process.env.NODE_ENV === 'development'
const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG === 'true'
const consoleSink = globalThis.console

function formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
  const timestamp = new Date().toISOString()
  const context = options?.context ? `[${options.context}]` : ''
  return `${timestamp} ${level.toUpperCase()} ${context} ${message}`
}

function shouldLog(level: LogLevel): boolean {
  if (level === 'error') return true
  if (level === 'warn') return true
  if (level === 'info') return isDevelopment || isDebugEnabled
  if (level === 'debug') return isDebugEnabled
  return false
}

export const logger = {
  debug(message: string, options?: LogOptions): void {
    if (!shouldLog('debug')) return
    consoleSink?.debug?.(formatMessage('debug', message, options), options?.data || '')
  },

  info(message: string, options?: LogOptions): void {
    if (!shouldLog('info')) return
    consoleSink?.info?.(formatMessage('info', message, options), options?.data || '')
  },

  warn(message: string, options?: LogOptions): void {
    if (!shouldLog('warn')) return
    consoleSink?.warn?.(formatMessage('warn', message, options), options?.data || '')
  },

  error(message: string, error?: Error | unknown, options?: LogOptions): void {
    if (!shouldLog('error')) return
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : { error }
    consoleSink?.error?.(formatMessage('error', message, options), { ...options?.data, ...errorData })
  },

  /**
   * Create a scoped logger with a fixed context
   */
  scope(context: string) {
    return {
      debug: (message: string, data?: Record<string, unknown>) => 
        logger.debug(message, { context, data }),
      info: (message: string, data?: Record<string, unknown>) => 
        logger.info(message, { context, data }),
      warn: (message: string, data?: Record<string, unknown>) => 
        logger.warn(message, { context, data }),
      error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) => 
        logger.error(message, error, { context, data }),
    }
  },
}

// Pre-configured loggers for common contexts
export const authLogger = logger.scope('Auth')
export const storageLogger = logger.scope('Storage')
export const apiLogger = logger.scope('API')
