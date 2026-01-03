type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LOG_LEVEL: LogLevel = __DEV__ ? 'debug' : 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LOG_LEVEL];
}

function formatMessage(prefix: string, message: string, ...args: any[]): string {
  const formattedArgs = args
    .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
    .join(' ');
  return `[${prefix}] ${message}${formattedArgs ? ' ' + formattedArgs : ''}`;
}

export function createLogger(prefix: string) {
  return {
    debug: (message: string, ...args: any[]) => {
      if (shouldLog('debug')) {
        console.log(formatMessage(prefix, message, ...args));
      }
    },
    info: (message: string, ...args: any[]) => {
      if (shouldLog('info')) {
        console.log(formatMessage(prefix, message, ...args));
      }
    },
    warn: (message: string, ...args: any[]) => {
      if (shouldLog('warn')) {
        console.warn(formatMessage(prefix, message, ...args));
      }
    },
    error: (message: string, ...args: any[]) => {
      if (shouldLog('error')) {
        console.error(formatMessage(prefix, message, ...args));
      }
    },
  };
}
