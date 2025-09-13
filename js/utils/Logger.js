// js/utils/Logger.js

class Logger {
  static levels = ['debug', 'info', 'warn', 'error'];
  static level = 'info'; 
  static silentMode = false; // true: Desactivar logs en producción por defecto
  static setLevel(level) {
    if (Logger.levels.includes(level)) { Logger.level = level; }
    else { console.warn(`Logger: Invalid log level: ${level}. Valid levels: ${Logger.levels.join(', ')}`); }
  }
  static setSilentMode(silent) {
    Logger.silentMode = Boolean(silent);
  }
  static isProduction() {
    try {
      if (typeof window === 'undefined') return true;
      const hostname = window.location?.hostname || '';
      return !(
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.endsWith('.local')
      );
    } catch { return true; }
  }
  static shouldLog(level) {
    if (Logger.silentMode) return false;
    if (!Logger.levels.includes(level)) {
        console.warn(`Logger: Unknown log level: ${level}`);
        return false;
    }
    if (Logger.isProduction() && !['warn', 'error'].includes(level)) return false;
    const messageLevel = Logger.levels.indexOf(level);
    const configuredLevel = Logger.levels.indexOf(Logger.level);
    return messageLevel >= configuredLevel;
  }
  static log(message, level = 'info', data = null) {
    if (!message || typeof message !== 'string') return;
    if (!Logger.shouldLog(level)) return;
    const logMethod = console[level] || console.log;
    const timestamp = new Date().toISOString().slice(11, 23);
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    if (data !== null && data !== undefined) {
      logMethod(`${prefix} ${message}`, data);
    } else {
      logMethod(`${prefix} ${message}`);
    }
  }
  static error(message, data = null) { Logger.log(message, 'error', data); }
  static warn(message, data = null) { Logger.log(message, 'warn', data); }
  static info(message, data = null) { Logger.log(message, 'info', data); }
  static debug(message, data = null) { Logger.log(message, 'debug', data); }
}
export default Logger;