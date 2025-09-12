// js/modules/DataManager.js
import Logger from '../utils/Logger.js';

/**
 * Gestiona la carga, cache y validación de datos JSON
 * @namespace DataManager
 */
const DataManager = {
  cache: new Map(),  
  config: {
    ttl: 5 * 60 * 1000, // 5 minutos TTL
    maxRetries: 3, // máximo 3 reintentos
    retryDelay: 1000, // 1 segundo
    maxCacheSize: 10 // máximo 10 entradas en cache
  },
  /**
   * Obtiene datos del cache si están disponibles y no han expirado
   * @param {string} key - Clave del cache
   * @returns {*|null} - Datos cacheados o null si no existen/expiraron
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    const now = Date.now();
    if (now - cached.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  },
  /**
   * Guarda datos en el cache con timestamp
   * @param {string} key - Clave del cache
   * @param {*} data - Datos a cachear
   */
  setCachedData(key, data) {
    // Limpiar cache si excede el tamaño máximo
    if (this.cache.size >= this.config.maxCacheSize) {
      this.clearExpiredCache();
      // Si aún está lleno, eliminar el más antiguo
      if (this.cache.size >= this.config.maxCacheSize) {
        // Eliminar el elemento más antiguo (FIFO) si aún excede el límite
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  },
  /**
   * Limpia entradas expiradas del cache
   */
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.config.ttl) { this.cache.delete(key); }
    }
  },
  /**
   * Valida la estructura básica de datos del resume
   * @param {Object} data - Datos a validar
   * @returns {boolean} - true si es válido
   */
  validateResumeData(data) {
    // Verificar si data es null, undefined o no es un objeto
    if (!data || typeof data !== 'object' || Array.isArray(data)) { return false; }
    const requiredFields = {
      name:         'string',
      title:        'string',
      portfolioUrl: 'string',
      contact:      'object',
      about:        'object',
      experience:   'array'
    };
    for (const [field, expectedType] of Object.entries(requiredFields)) {
      const value = data[field];
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      // Validar tipo y existencia
      if (actualType !== expectedType) { return false; }
      // Validación adicional por tipo
      if (expectedType === 'string') { if (!value.trim()) return false; } // Cadena vacía o con espacios solos
      else if (expectedType === 'object') { if (Object.keys(value).length === 0) return false; } // Objeto vacío
      else if (expectedType === 'array') { if (value.length === 0) return false; } // Array vacío
    }
    return true;
  },
  /**
   * Realiza fetch con retry automático
   * @param {string} url - URL a fetchear
   * @param {number} attempt - Número de intento actual
   * @returns {Promise<Response>} - Promise del response
   */
  async fetchWithRetry(url, attempt = 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      return response;
    } catch (error) {
      if (attempt >= this.config.maxRetries) { throw error; }
      // Esperar antes del siguiente intento (exponential backoff)
      const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.fetchWithRetry(url, attempt + 1);
    }
  },
  /**
   * Carga datos desde archivo con cache automático
   * @param {string} filePath - Ruta del archivo JSON
   * @param {HTMLElement} [errorDisplay] - Elemento para mostrar errores
   * @returns {Promise<Object>} - Promise con los datos
   */
  async fetchData(filePath, errorDisplay = null) {
    const cachedData = this.getCachedData(filePath);
    if (cachedData) { return cachedData; }
    try {
      const response = await this.fetchWithRetry(filePath);
      const data = await response.json();
      if (!this.validateResumeData(data)) {
        throw new Error('Invalid data structure or missing fields in JSON file');
      }
      this.setCachedData(filePath, data);
      return data;
    } catch (error) {
      // Solo delega el manejo del error, sin tocar el DOM
      this.handleFetchError(error, filePath, errorDisplay);
    }
  },
  /**
   * Maneja errores de fetch de forma centralizada y retorna mensaje para UI
   * @param {Error} error - Error capturado
   * @param {string} filePath - Archivo que se intentó cargar
   * @param {HTMLElement|null} errorDisplay - Contenedor opcional para mostrar error en pantalla
   * @returns {string} Mensaje amigable para mostrar al usuario
   */
  handleFetchError(error, filePath, errorDisplay) {
    let errorMsg;
    // Clasificación de errores
    if (error.message.includes('HTTP error') || error.message.includes('404') || error.message.includes('403')) {
      const statusMatch = error.message.match(/status: (\d+)/);
      const status = statusMatch ? statusMatch[1] : 'unknown';
      errorMsg = `Error al cargar datos: ${status}. El archivo '${filePath}' no está disponible.`;
    } 
    else if (error.message.includes('Invalid data structure')) {
      errorMsg = `Error: Los datos en '${filePath}' tienen una estructura inválida o faltan campos clave.`;
    } 
    else if (!navigator.onLine) {
      errorMsg = `Error: Sin conexión a internet. Verifica tu red e intenta nuevamente.`;
    } 
    else if (error.name === 'SyntaxError') {
      errorMsg = `Error: El archivo '${filePath}' no es un JSON válido.`;
    } 
    else { errorMsg = `Error inesperado al cargar '${filePath}'. Por favor, recarga la página.`; }
    // Mostrar en contenedor de errores si existe
    if (errorDisplay) {
      errorDisplay.textContent = errorMsg;
      errorDisplay.style.display = 'block';
    }
    // Log detallado para debugging
    Logger.error(`DataManager: Error al cargar '${filePath}':`, {
      message: error.message,
      stack: error.stack,
      online: navigator.onLine,
      timestamp: new Date().toISOString()
    });
    // Retornar mensaje simple para quien quiera actualizar la UI
    throw {
      userMessage: "Fallo al cargar el contenido. Por favor, intente con otro idioma o refresque la página.",
      technicalMessage: errorMsg,
      originalError: error,
      filePath
    };
  },
  /**
   * Carga datos específicos del resume con lógica mejorada
   * @param {string} language - Idioma ('es' o 'en')
   * @param {HTMLElement} [errorDisplay] - Elemento para errores
   * @returns {Promise<Object>} - Promise con datos del resume
   */
  async fetchResumeData(language, errorDisplay = null) {
    const filePath = `data/resume_${language}.json`;
    return this.fetchData(filePath, errorDisplay);
  },
  /**
   * Precarga datos de ambos idiomas para mejor UX
   * @returns {Promise<Object>} - Promise con estadísticas de precarga
   */
  async preloadAllLanguages() {
    const languages = ['es', 'en'];
    const results = await Promise.allSettled(
      languages.map(lang => this.fetchResumeData(lang))
    );
    const stats = {
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      total: languages.length
    };
    Logger.info('DataManager preload stats:', stats);
    return stats;
  },
  /**
   * Limpia todo el cache
   */
  clearCache() {
    this.cache.clear();
    Logger.info('DataManager: Cache cleared');
  },
  /**
   * Obtiene estadísticas del cache para debugging
   * @returns {Object} - Estadísticas del cache
   */
  getCacheStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, cached]) => ({
      key,
      age: Math.round((now - cached.timestamp) / 1000), // segundos
      expired: (now - cached.timestamp) > this.config.ttl
    }));
    return {
      totalEntries: this.cache.size,
      maxSize: this.config.maxCacheSize,
      ttlMinutes: this.config.ttl / (60 * 1000),
      entries
    };
  }
};
export default DataManager;