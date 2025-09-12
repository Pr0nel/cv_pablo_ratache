// js/modules/PrintManager.js
import Logger from '../utils/Logger.js';

/**
 * Gestiona la funcionalidad de impresión y optimizaciones para ATS
 * @namespace PrintManager
 */
const PrintManager = {
  isPreparingForPrint: false,
  
  /**
   * Inicializa el gestor de impresión
   */
  init() {
    this.setupPrintButton();
    this.setupPrintMediaQueries();
    this.setupBeforePrintOptimizations();
  },

  /**
   * Configura el botón de impresión
   * Nota: No usa EventManager para mantener independencia del sistema de eventos global,
   * ya que este listener se registra una sola vez y no requiere gestión dinámica.
   */
  setupPrintButton() {
    const printButton = document.getElementById('print-cv-button');
    if (printButton) {
      printButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handlePrint();
      });
    }
  },

  /**
   * Maneja el proceso de impresión
   */
  async handlePrint() {
    if (this.isPreparingForPrint) return;
    try {
      this.isPreparingForPrint = true;
      await this.prepareForPrint();
      this.triggerPrint();
    } catch (error) { Logger.error('PrintManager: Error preparando impresión:', error);
    } finally { this.isPreparingForPrint = false; }
  },

  /**
   * Prepara el documento para impresión
   * - Optimiza para ATS
   * - Asegura estilos cargados
   * - Valida contenido
   */
  async prepareForPrint() {
    // Optimizar contenido para ATS
    this.optimizeForATS();    
    // Asegurar que todos los estilos críticos estén cargados
    this.ensureCriticalStyles();
  },

  /**
   * Optimiza el contenido para ATS (Applicant Tracking Systems)
   */
  optimizeForATS() {
    // Asegurar que toda la información crítica esté visible en texto plano
    this.ensureTextContent();
    // Verificar estructura semántica
    this.validateSemanticStructure();
    // Optimizar URLs para impresión
    this.optimizePrintUrls();
  },

  /**
   * Asegura que todo el contenido de texto esté presente
   */
  ensureTextContent() {
    // Verificar que los elementos críticos tengan contenido
    const criticalElements = [
      '#name',
      '#title', 
      '#professional-profile',
      '#experience-list',
      '#education-list'
    ];
    criticalElements.forEach(selector => {
      const element = document.querySelector(selector);
      if (element && !element.textContent.trim()) { Logger.warn(`PrintManager: Elemento crítico vacío: ${selector}`); }
    });
  },

  /**
   * Valida la estructura semántica del documento
   */
  validateSemanticStructure() {
    // Verificar jerarquía de headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) { Logger.warn('PrintManager: No se encontraron headings para estructura semántica'); }
    // Verificar que existe al menos un h1
    const h1Elements = document.querySelectorAll('h1');
    if (h1Elements.length === 0) { Logger.warn('PrintManager: No se encontró elemento h1 principal'); }
  },

  /**
   * Optimiza URLs para impresión
   */
  optimizePrintUrls() {
    // Las URLs ya se manejan en CSS con ::after, pero podemos validar que existan
    const linksWithUrls = document.querySelectorAll('a[href^="http"], a[href^="mailto"]');
    linksWithUrls.forEach(link => {
      if (!link.getAttribute('href')) { Logger.warn('PrintManager: Link sin href encontrado:', link); }
    });
  },

  /**
   * Asegura que los estilos críticos estén cargados
   */
  ensureCriticalStyles() {
    // Verificar que el CSS principal esté cargado
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    let cssLoaded = false;    
    stylesheets.forEach(sheet => {
      try { if (sheet.sheet && sheet.sheet.cssRules) { cssLoaded = true; } }
      catch (e) { Logger.warn('PrintManager: No se pudo verificar hoja de estilos:', sheet.href); }
    });
    if (!cssLoaded) { Logger.warn('PrintManager: Las hojas de estilo podrían no estar completamente cargadas'); }
  },

  /**
   * Configura optimizaciones antes de imprimir
   */
  setupBeforePrintOptimizations() {
    // Evento antes de imprimir
    window.addEventListener('beforeprint', () => { this.onBeforePrint(); });
    // Evento después de imprimir
    window.addEventListener('afterprint', () => { this.onAfterPrint(); });
  },

  /**
   * Se ejecuta antes de imprimir
   */
  onBeforePrint() {
    // Forzar recalculo de layout
    document.body.offsetHeight;    
    // Asegurar que elementos print-only sean visibles
    const printOnlyElements = document.querySelectorAll('.print-only-profile, .print-only-contact-info');
    printOnlyElements.forEach(el => { el.style.display = 'block'; });
  },

  /**
   * Se ejecuta después de imprimir
   */
  onAfterPrint() {
    // Restaurar estado normal si es necesario
    const printOnlyElements = document.querySelectorAll('.print-only-profile, .print-only-contact-info');
    printOnlyElements.forEach(el => { el.style.display = ''; });
  },

  /**
   * Configura media queries específicas para impresión
   */
  setupPrintMediaQueries() {
    // Verificar si existe el media query de impresión
    if (window.matchMedia) {
      const printMediaQuery = window.matchMedia('print');
      printMediaQuery.addListener((mq) => {
        if (mq.matches) { this.onEnterPrintMode(); }
        else { this.onExitPrintMode(); }
      });
    }
  },

  /**
   * Se ejecuta al entrar en modo impresión
   */
  onEnterPrintMode() {
    // Optimizaciones específicas para modo impresión
    document.body.classList.add('print-mode');
  },

  /**
   * Se ejecuta al salir del modo impresión
   */
  onExitPrintMode() {
    document.body.classList.remove('print-mode');
  },

  /**
   * Dispara la impresión
   */
  triggerPrint() {
    // Pequeño delay para asegurar que todo esté listo
    setTimeout(() => {
      window.print();
    }, 100);
  },

  /**
   * Genera vista previa de impresión (abre en nueva ventana)
   */
  openPrintPreview() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Logger.error('PrintManager: No se pudo abrir ventana de vista previa');
      return;
    }
    // Clonar contenido actual
    const clonedContent = document.documentElement.cloneNode(true);
    // Escribir contenido en nueva ventana
    printWindow.document.write('<!DOCTYPE html>');
    printWindow.document.write(clonedContent.outerHTML);
    printWindow.document.close();
    // Enfocar nueva ventana
    printWindow.focus();
  },

  /**
   * Valida que el documento esté listo para impresión ATS
   * @returns {Object} Resultado de validación
   */
  validateForATS() {
    const validation = {
      valid: true,
      warnings: [],
      errors: []
    };
    // Verificar elementos críticos
    const requiredElements = {
      name: '#name',
      title: '#title',
      contact: '.print-contact-line',
      experience: '#experience-list',
      education: '#education-list'
    };
    Object.entries(requiredElements).forEach(([key, selector]) => {
      const element = document.querySelector(selector);
      if (!element || !element.textContent.trim()) {
        validation.errors.push(`Elemento requerido faltante o vacío: ${key}`);
        validation.valid = false;
      }
    });
    // Verificar estructura semántica
    const h1Count = document.querySelectorAll('h1').length;
    if (h1Count !== 1) { validation.warnings.push(`Debería haber exactamente un h1, encontrados: ${h1Count}`); }
    // Verificar longitud del contenido
    const textLength = document.body.textContent.length;
    if (textLength < 1000) { validation.warnings.push('Contenido muy corto, podría no ser suficiente para ATS'); }
    return validation;
  },

  /**
   * Obtiene estadísticas del documento para impresión
   * @returns {Object} Estadísticas
   */
  getStats() {
    return {
      totalElements: document.querySelectorAll('*').length,
      textLength: document.body.textContent.length,
      headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
      links: document.querySelectorAll('a[href]').length,
      lazyImages: document.querySelectorAll('.lazy-image').length,
      printOnlyElements: document.querySelectorAll('[class*="print-only"]').length
    };
  }
};
export default PrintManager;