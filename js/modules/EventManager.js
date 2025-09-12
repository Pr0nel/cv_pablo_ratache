// js/modules/EventManager.js
import Logger from '../utils/Logger.js';

/**
* Gestiona todos los event listeners dinámicos con cleanup automático
* @namespace EventManager
*/
const EventManager = {
  listeners: new Map(),
  silent: false, // Modo silencioso para producción
  /**
  * Añade un event listener y lo registra para cleanup posterior
  * @param {HTMLElement} element - El elemento del DOM
  * @param {string} event - Tipo de evento
  * @param {Function} handler - Función manejadora
  * @param {Object} [options={}] - Opciones del addEventListener
  * @returns {void}
  */
  add(element, event, handler, options = {}) {
    if (!element) {
      Logger.debug('EventManager.add: elemento es null o undefined', 'warn');
      return;
    }
    element.addEventListener(event, handler, options);
    // Registrar para cleanup
    if (!this.listeners.has(element)) { this.listeners.set(element, []); }
    this.listeners.get(element).push({ event, handler, options });
    Logger.debug(`EventManager: Registrado ${event} en`, element);
  },
  /**
  * Limpia todos los event listeners registrados
  * @returns {void}
  */
  cleanup() {
    Logger.debug('EventManager: Iniciando cleanup de event listeners');
    let cleanedCount = 0;
    this.listeners.forEach((events, element) => {
      events.forEach(({ event, handler, options }) => {
        element.removeEventListener(event, handler, options);
        cleanedCount++;
      });
    });
    this.listeners.clear();
    Logger.debug(`EventManager: ${cleanedCount} event listeners removidos`);
  },
  // Remueve listeners específicos de un elemento
  removeFrom(element) {
    if (!this.listeners.has(element)) return;
    const events = this.listeners.get(element);
    events.forEach(({ event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.listeners.delete(element);
    Logger.debug(`EventManager: Removidos listeners de`, element);
  },
  // Remueve un listener específico
  removeSpecific(element, event, handler) {
    if (!element || !handler || !this.listeners.has(element)) return false;
    const events = this.listeners.get(element);
    const eventIndex = events.findIndex(e =>
        e.event === event &&
        e.handler === handler
    );
    if (eventIndex !== -1) {
      const { options } = events[eventIndex];
      element.removeEventListener(event, handler, options);
      events.splice(eventIndex, 1);
      if (events.length === 0) {
        this.listeners.delete(element);
      }
      Logger.debug(`EventManager: Removido listener ${event} de`, element);
      return true;
    }
    return false;
  },
  /**
  * Verifica si un elemento tiene listeners registrados
  * @param {HTMLElement} element - El elemento a verificar
  * @returns {boolean} - true si tiene listeners, false si no
  */
  hasListeners(element) {
    return this.listeners.has(element) && this.listeners.get(element).length > 0;
  },
  /**
  * Obtiene estadísticas de listeners registrados
  * @returns {Object} Estadísticas detalladas
  */
  getStats() {
    const stats = {
        totalElements: this.listeners.size,
        totalListeners: Array.from(this.listeners.values()).reduce((sum, events) => sum + events.length, 0),
        elementBreakdown: new Map()
    };
    // Agregar breakdown por elemento para debugging
    this.listeners.forEach((events, element) => {
        const tagName = element.constructor.name || 'unknown';
        const id = element.id || 'no-id';
        stats.elementBreakdown.set(`${tagName}#${id}`, events.length);
    });
    return stats;
  }
};
export default EventManager;