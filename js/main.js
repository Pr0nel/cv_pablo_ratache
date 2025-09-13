/*
  ./js/main.js: A coordinator for the personal portfolio webpage.
  Copyright 2025 Pablo Ronel Ratache Rojas

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/

// js/main.js
import EventManager from './modules/EventManager.js';
import DataManager from './modules/DataManager.js';
import DOMRenderer from './modules/DOMRenderer.js';
import LazyLoader from './modules/LazyLoader.js';
import LanguageManager from './modules/LanguageManager.js';
import PrintManager from './modules/PrintManager.js';
import { staticTextConfig } from './utils/constants.js';
import { Utils } from './utils/utils.js';
import Logger from './utils/Logger.js';

/**
 * Clase principal de la aplicación
 */
class PortfolioApp {
  constructor() {
    this.currentLanguage = 'es';
    this.isInitialized = false;
    this.eventManager = EventManager;
  }

  /**
   * Inicializa la aplicación
   */
  async init() {
      try {
        // 1. Configurar logging al inicio
        if (Logger.isProduction()) { Logger.setLevel('warn'); }
        else { Logger.setLevel('debug'); }
        Logger.info('init: Inicializando aplicación...');
        // 2. Configurar callback para cambios de idioma
        const handleLanguageChange = async (language) => {
            await this.loadResumeData(language);
            this.saveLanguagePreference(language);
            // Re-inicializar LazyLoader para nuevas imágenes
            LazyLoader.refresh();
        };
        // 3. Inicializar módulos pasando dependencias necesarias
        LanguageManager.init(EventManager, handleLanguageChange);
        PrintManager.init(this.eventManager);
        // 4. Configurar Event Listeners básicos
        this.setupGlobalEventListeners();
        this.setupLanguageSwitcher();
        this.setupMenuControls();
        this.setupSkillsToggle();
        // 5. Cargar idioma inicial (esto puebla el DOM)
        await this.loadInitialLanguage();
        // 6. DESPUÉS de poblar DOM, inicializar LazyLoader
        LazyLoader.initialize();
        // 7. Precargar otro idioma en background
        this.preloadOtherLanguage();
        this.isInitialized = true;
        Logger.info('init: Aplicación inicializada correctamente');
      } catch (error) {
        Logger.error('init: Error inicializando aplicación:', error);
        this.handleInitializationError(error);
      }
  }

  /**
   * Configura event listeners globales
   */
  setupGlobalEventListeners() {
    const debouncedAlignCards = Utils.debounce(() => {
      Logger.info('setupGlobalEventListeners: Realineando tarjetas de proyecto...');
      DOMRenderer.alignProjectCards();
    }, 250);
    EventManager.removeSpecific(window, 'resize', debouncedAlignCards);
    EventManager.add(window, 'resize', debouncedAlignCards);
    // Cleanup cuando la página se descarga
    EventManager.add(window, 'beforeunload', () => {
      Logger.info('setupGlobalEventListeners: Limpiando recursos antes de salir...');
      EventManager.cleanup();
    });
  }

  /**
   * Configura el selector de idioma
   */
  setupLanguageSwitcher() {
    const languageSwitcher = document.getElementById('language-switcher');
    if (!languageSwitcher) {
      Logger.error("setupLanguageSwitcher: Language switcher element (#language-switcher) not found!");
      return;
    }
  }

  /**
   * Configura controles del menú hamburguesa
   */
  setupMenuControls() {
    const hamburgerButton = document.getElementById('hamburger-button');
    const sideMenu = document.getElementById('side-menu');
    const closeMenuButton = document.getElementById('close-menu-button');
    const menuOverlay = document.getElementById('menu-overlay');
    if (!sideMenu || !hamburgerButton || !closeMenuButton || !menuOverlay) {
      Logger.warn("setupMenuControls: Algunos elementos del menú no encontrados. Funcionalidad de menú deshabilitada.");
      return;
    }
    const toggleSideMenu = () => {
      sideMenu.classList.toggle('-translate-x-full');
      const isMenuOpen = sideMenu.classList.toggle('translate-x-0');
      menuOverlay.classList.toggle('hidden');
      document.body.classList.toggle('overflow-hidden');
      hamburgerButton.setAttribute('aria-expanded', isMenuOpen ? 'true' : 'false');
    };
    // Event listeners para el menú
    EventManager.add(hamburgerButton, 'click', toggleSideMenu);
    EventManager.add(closeMenuButton, 'click', toggleSideMenu);
    EventManager.add(menuOverlay, 'click', toggleSideMenu);
    // Cerrar menú al hacer click en enlaces
    const sideMenuLinks = sideMenu.querySelectorAll('nav a');
    sideMenuLinks.forEach(link => {
      EventManager.add(link, 'click', () => {
        // Forzar cierre del menú y limpieza de overflow
        if (!sideMenu.classList.contains('-translate-x-full')) {
          sideMenu.classList.remove('translate-x-0');
          sideMenu.classList.add('-translate-x-full');
          menuOverlay.classList.add('hidden');
          document.body.classList.remove('overflow-hidden');
          hamburgerButton.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /**
   * Configura el toggle de skills
   */
  setupSkillsToggle() {
    const skillsSection = document.getElementById('skills-section');
    const toggleBtn = document.getElementById('skills-toggle');
    const toggleText = document.getElementById('toggle-text');
    const toggleIcon = document.getElementById('toggle-icon');
    if (!toggleBtn || !toggleText || !toggleIcon || !skillsSection) {
      Logger.warn("setupSkillsToggle: Elementos del toggle de skills no encontrados");
      return;
    }
    EventManager.add(toggleBtn, 'click', () => {
      // Alternar clase y luego leer el estado actual
      skillsSection.classList.toggle('expanded');
      const expanded = skillsSection.classList.contains('expanded');
      toggleBtn.setAttribute('aria-expanded', expanded);
      // Obtener textos del idioma actual
      const currentTexts = staticTextConfig[this.currentLanguage] || staticTextConfig.es;
      toggleText.textContent = expanded 
        ? (currentTexts.skillsToggleLess || 'Collapse')
        : (currentTexts.skillsToggle || 'Expand');
      toggleIcon.classList.toggle('rotate', expanded);
    });
  }

  /**
   * Carga el idioma inicial basado en preferencias
   */
  async loadInitialLanguage() {
    const languageSwitcher = document.getElementById('language-switcher');
    const savedLanguage = this.getSavedLanguagePreference();
    let initialLanguage = languageSwitcher?.value || 'es';
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      initialLanguage = savedLanguage;
      if (languageSwitcher) {
        languageSwitcher.value = savedLanguage;
      }
    }
    await this.loadResumeData(initialLanguage);
  }

  /**
   * Precarga el otro idioma en background
   */
  async preloadOtherLanguage() {
    const otherLanguage = this.currentLanguage === 'es' ? 'en' : 'es';
    try {
      await DataManager.fetchResumeData(otherLanguage);
      Logger.info(`preloadOtherLanguage: Idioma ${otherLanguage} precargado exitosamente`);
    } catch (error) {
      Logger.warn(`preloadOtherLanguage: No se pudo precargar idioma ${otherLanguage}:`, error.message);
    }
  }

  /**
   * Carga y muestra datos del resume para el idioma especificado
   */
  async loadResumeData(language) {
    Logger.info(`loadResumeData: Cargando datos para idioma: ${language}`);
    // Actualizar idioma actual
    this.currentLanguage = language;
    document.documentElement.lang = language;
    LazyLoader.destroy();
    // Limpiar contenido anterior
    DOMRenderer.clearDynamicContent();
    const errorDisplay = DOMRenderer.setupErrorDisplay();
    try {
      const data = await DataManager.fetchResumeData(language, errorDisplay);
      // Preparar textos de traducción
      const texts = this.prepareTranslationTexts(data, language);
      // Renderizar todas las secciones
      this.renderAllSections(data, texts);
      // Aplicar traducciones estáticas
      LanguageManager.applyStaticTranslations(texts, data);
      // Re-inicializar funcionalidades que dependen del DOM
      this.reinitializeAfterLanguageChange();
      Logger.info(`loadResumeData: Datos cargados exitosamente para ${language}`);
    } catch (structuredError) {
        // Aquí recibimos el objeto lanzado por handleFetchError
        Logger.error(`loadResumeData: Error crítico para ${language}:`, structuredError.technicalMessage);
        // Ya se mostró el error en `errorDisplay` dentro de handleFetchError
        // Pero aún debemos actualizar el resumen con el mensaje amigable
        DOMRenderer.setTextContent("summary", structuredError.userMessage);
    }
  }

  /**
   * Prepara textos de traducción
   */
  prepareTranslationTexts(data, language) {
    let profileImageAlt = staticTextConfig[language]?.profileImageAlt || staticTextConfig.en.profileImageAlt;
    if (data.name) { profileImageAlt += data.name; }
    else { profileImageAlt += (language === 'es' ? "el usuario" : "the user"); }
    return { ...(staticTextConfig[language] || staticTextConfig.en), profileImageAlt };
  }

  /**
  * Renderiza todas las secciones del CV basado en los datos
  * @param {Object} data - Datos del resume
  * @param {Object} texts - Textos traducidos
  */
  renderAllSections(data, texts) {
    DOMRenderer.populateAbout(data);
    DOMRenderer.populateContactActions(data, texts);
    if (data.experience) DOMRenderer.populateExperience(data.experience);
    if (data.projects) DOMRenderer.populateProjects(data.projects, texts);
    if (data.skills) DOMRenderer.populateSkills(data.skills, this.currentLanguage, data.languages);
    if (data.languages) DOMRenderer.populateLanguages(data.languages);
    if (data.education) DOMRenderer.populateEducation(data.education);
    if (data.publications) DOMRenderer.populatePublications(data.publications, texts);
    if (data.certifications) DOMRenderer.populateCertifications(data.certifications);
    // Alinear tarjetas después del renderizado
    setTimeout(() => DOMRenderer.alignProjectCards(), 100);
  }

  /**
   * Re-inicializa funcionalidades después del cambio de idioma
   */
  reinitializeAfterLanguageChange() {
    // Re-configurar event listeners que dependen del nuevo DOM
    const debouncedAlignCards = Utils.debounce(() => DOMRenderer.alignProjectCards(), 250);
    EventManager.removeSpecific(window, 'resize', debouncedAlignCards);
    EventManager.add(window, 'resize', debouncedAlignCards);
  }

  /**
   * Maneja errores de inicialización
   */
  handleInitializationError(error) {
    const errorMessage = 'Error crítico inicializando la aplicación. Verifique la consola para más detalles.';
    // Mostrar error básico en la página
    document.body.insertAdjacentHTML('afterbegin', `
      <div style="background-color: #fee; color: #c00; padding: 20px; text-align: center; border: 1px solid #fcc;">
        ${errorMessage}
      </div>
    `);
  }

  /**
   * Guarda preferencia de idioma
   */
  saveLanguagePreference(language) {
    try { localStorage.setItem('preferredLanguage', language); }
    catch (error) { Logger.warn('No se pudo guardar preferencia de idioma:', error.message); }
  }

  /**
   * Obtiene preferencia de idioma guardada
   */
  getSavedLanguagePreference() {
    try { return localStorage.getItem('preferredLanguage'); }
    catch (error) { Logger.warn('No se pudo leer preferencia de idioma:', error.message); return null; }
  }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const app = new PortfolioApp();
    if (typeof app.init !== 'function') {
      Logger.error('Error: La clase PortfolioApp no tiene el método init');
      return;
    }
    await app.init();
    // Hacer la app disponible globalmente para debugging
    if (typeof window !== 'undefined') { window.PortfolioApp = app; }
  } catch (error) {
    Logger.error('Error crítico al inicializar la aplicación:', error);
    // Mostrar mensaje amigable al usuario
    document.body.innerHTML = `
      <div style="text-align:center; padding:40px; color:#d32f2f; font-family:system-ui">
        <h2>❌ Error al cargar el portafolio</h2>
        <p>Por favor, revisa la consola para más detalles.</p>
      </div>
    `;
  }
});