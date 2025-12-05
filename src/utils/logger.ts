class Logger {
  private logger = console;
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  updateName(name: string) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  info(...args: unknown[]) {
    this.logger.info(`[${this.name}]`, ...args);
  }

  error(...args: unknown[]) {
    this.logger.error(`[${this.name}]`, ...args);
  }

  warn(...args: unknown[]) {
    this.logger.warn(`[${this.name}]`, ...args);
  }

  debug(...args: unknown[]) {
    this.logger.debug(`[${this.name}]`, ...args);
  }

  log(...args: unknown[]) {
    this.logger.log(`[${this.name}]`, ...args);
  }
}
let logger: Logger;

function initLogger(name?: string) {
  if (!logger) {
    logger = new Logger(name ?? 'Logger');
  }

  return logger;
}

export { initLogger };
