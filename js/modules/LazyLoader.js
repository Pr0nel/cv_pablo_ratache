// js/modules/LazyLoader.js
import Logger from '../utils/Logger.js';

/**
 * Gestiona la carga perezosa de imágenes para mejorar el rendimiento
 * @namespace LazyLoader
 */
const LazyLoader = {
  observer: null,
  config: {
    rootMargin: '50px', // Cargar imagen 50px antes de ser visible
    threshold: 0.1,
    placeholderSvg: "data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23334155'/%3E%3C/svg%3E"
  },

  /**
   * Inicializa el lazy loading para todas las imágenes con clase lazy-image
   */
  initialize() {
    if (!('IntersectionObserver' in window)) {
      // Fallback para navegadores sin soporte
      Logger.warn('LazyLoader: IntersectionObserver no soportado, cargando todas las imágenes inmediatamente.');
      this.loadAllImages();
      return;
    }
    this.createObserver();
    this.observeImages();
  },

  /**
   * Crea el IntersectionObserver
   */
  createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { this.loadImage(entry.target); }
      });
    }, {
      rootMargin: this.config.rootMargin,
      threshold: this.config.threshold
    });
  },

  /**
   * Observa todas las imágenes lazy
   */
  observeImages() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    lazyImages.forEach(img => { this.observer.observe(img); });
  },

  /**
   * Carga una imagen específica
   * @param {HTMLImageElement} img - Elemento de imagen
   */
  loadImage(img) {
    if (!img.dataset.src) {
      Logger.warn('LazyLoader: Imagen sin data-src:', img);
      return;
    }
    // Crear nueva imagen para precargar
    const imageLoader = new Image();
    imageLoader.onload = () => {
      // Imagen cargada exitosamente
      img.src = img.dataset.src;
      img.classList.remove('lazy-image');
      img.classList.add('loaded');
      // Animación de fade-in suave
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease';
      requestAnimationFrame(() => { img.style.opacity = '1'; });
    };
    imageLoader.onerror = () => {
      // Error al cargar imagen
      Logger.error('LazyLoader: Error cargando imagen:', img.dataset.src);
      img.classList.remove('lazy-image');
      img.classList.add('error');
      // Mantener placeholder o mostrar imagen de error
      if (img.alt) { img.title = `Error cargando: ${img.alt}`; }
    };
    // Iniciar carga
    imageLoader.src = img.dataset.src;
    // Dejar de observar esta imagen
    if (this.observer) { this.observer.unobserve(img); }
  },

  /**
   * Configura una imagen para lazy loading
   * @param {HTMLImageElement} img - Elemento de imagen
   * @param {string} src - URL de la imagen
   * @param {string} [alt] - Texto alternativo
   */
  setupImage(img, src, alt = '') {
    if (!img || !src) return;
    img.dataset.src = src;
    img.src = this.config.placeholderSvg;
    img.alt = alt;
    img.classList.add('lazy-image');
    img.loading = 'lazy'; // Soporte nativo adicional
    // Si el observer ya existe, observar esta imagen
    if (this.observer) { this.observer.observe(img); }
  },

  /**
   * Carga todas las imágenes inmediatamente (fallback)
   */
  loadAllImages() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.remove('lazy-image');
        img.classList.add('loaded');
      }
    });
  },

  /**
   * Refresca las imágenes lazy (útil después de añadir contenido dinámico)
   */
  refresh() {
    if (!this.observer) {
      this.initialize();
      return;
    }
    // Observar nuevas imágenes lazy
    const newLazyImages = document.querySelectorAll('.lazy-image:not([data-observed])');
    newLazyImages.forEach(img => {
      img.dataset.observed = 'true';
      this.observer.observe(img);
    });
  },

  /**
   * Limpia el observer (útil para cleanup)
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  },

  /**
   * Fuerza la carga de una imagen específica
   * @param {HTMLImageElement} img - Elemento de imagen
   */
  forceLoad(img) {
    if (img && img.classList.contains('lazy-image')) { this.loadImage(img); }
  },

  /**
   * Obtiene estadísticas de carga
   * @returns {Object} Estadísticas
   */
  getStats() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    const loadedImages = document.querySelectorAll('img.loaded');
    const errorImages = document.querySelectorAll('img.error');
    return {
      pending: lazyImages.length,
      loaded: loadedImages.length,
      errors: errorImages.length,
      total: document.querySelectorAll('img').length,
      observerActive: !!this.observer
    };
  }
};
export default LazyLoader;