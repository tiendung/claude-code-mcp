// Logger utility for Docker MCP server

export const Logger = {
  LEVELS: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  },
  
  // Default log level
  level: 1, // INFO
  
  // Initialize with environment variable if available
  init() {
    const envLevel = process.env.LOG_LEVEL;
    if (envLevel) {
      const upperEnvLevel = envLevel.toUpperCase();
      if (upperEnvLevel === 'DEBUG' || upperEnvLevel === 'INFO' || 
          upperEnvLevel === 'WARN' || upperEnvLevel === 'ERROR') {
        this.level = this.LEVELS[upperEnvLevel as keyof typeof this.LEVELS];
      }
    }
  },
  
  // Log methods for different levels
  debug(message: string, ...args: any[]) {
    if (this.level <= this.LEVELS.DEBUG) {
      console.error(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info(message: string, ...args: any[]) {
    if (this.level <= this.LEVELS.INFO) {
      console.error(`[INFO] ${message}`, ...args);
    }
  },
  
  warn(message: string, ...args: any[]) {
    if (this.level <= this.LEVELS.WARN) {
      console.error(`[WARN] ${message}`, ...args);
    }
  },
  
  error(message: string, ...args: any[]) {
    if (this.level <= this.LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
};