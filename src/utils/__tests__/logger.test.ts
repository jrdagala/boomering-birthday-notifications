import { initLogger } from '../logger';

describe('Logger', () => {
  let consoleInfoSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Logger instance', () => {
    it('should return singleton logger instance', () => {
      const logger1 = initLogger('Test1');
      const logger2 = initLogger('Test2');
      expect(logger1).toBe(logger2);
    });

    it('should have getName method', () => {
      const logger = initLogger('TestLogger');
      expect(logger.getName()).toBeDefined();
      expect(typeof logger.getName()).toBe('string');
    });

    it('should have updateName method', () => {
      const logger = initLogger('InitialName');
      const initialName = logger.getName();
      logger.updateName('UpdatedName');
      const updatedName = logger.getName();

      expect(initialName).not.toBe(updatedName);
      expect(updatedName).toBe('UpdatedName');
    });
  });

  describe('Logger methods', () => {
    it('should log info messages with logger name', () => {
      const logger = initLogger();
      logger.info('test message', 'additional arg');

      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('['),
        'test message',
        'additional arg'
      );
    });

    it('should log error messages with logger name', () => {
      const logger = initLogger();
      const error = new Error('test error');
      logger.error('error occurred:', error);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('['),
        'error occurred:',
        error
      );
    });

    it('should log warn messages with logger name', () => {
      const logger = initLogger();
      logger.warn('warning message');

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('['), 'warning message');
    });

    it('should log debug messages with logger name', () => {
      const logger = initLogger();
      logger.debug('debug info', { key: 'value' });

      expect(consoleDebugSpy).toHaveBeenCalled();
      expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('['), 'debug info', {
        key: 'value',
      });
    });

    it('should log messages with logger name', () => {
      const logger = initLogger();
      logger.log('general log message');

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('['),
        'general log message'
      );
    });

    it('should use updated name in log messages', () => {
      const logger = initLogger();
      logger.updateName('CustomName');
      logger.info('test');

      expect(consoleInfoSpy).toHaveBeenCalledWith('[CustomName]', 'test');
    });

    it('should handle multiple arguments', () => {
      const logger = initLogger();
      logger.info('arg1', 'arg2', 'arg3', { key: 'value' });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('['),
        'arg1',
        'arg2',
        'arg3',
        { key: 'value' }
      );
    });
  });
});
