// js/modules/LanguageManager.js
import { staticTextConfig, GITHUB_ICON_SVG } from '../utils/constants.js';
import Logger from '../utils/Logger.js';

/**
 * Gestiona cambios de idioma, traducciones y localStorage
 * @namespace LanguageManager
 */
const LanguageManager = {
  eventManager: null,
  onLanguageChange: null,
  currentLanguage: 'es',
  availableLanguages: ['es', 'en'],
  storageKey: 'preferredLanguage',
  /**
   * Inicializa el gestor de idiomas
   */
  init(eventManager, onLanguageChangeCallback) {
    this.eventManager = eventManager;
    this.onLanguageChange = onLanguageChangeCallback;
    this.setupLanguageSwitcher();
    const savedLanguage = this.getSavedLanguage();
    this.setLanguage(savedLanguage);
  },

  /**
   * Obtiene el idioma guardado del localStorage con fallback
   * @returns {string} Código de idioma
   */
  getSavedLanguage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved && this.availableLanguages.includes(saved)) { return saved; }
    } catch (error) {
      Logger.warn('LanguageManager: localStorage no disponible:', error.message);
    }
    // Fallback: detectar idioma del navegador
    const browserLang = this.detectBrowserLanguage();
    return this.availableLanguages.includes(browserLang) ? browserLang : 'es';
  },

  /**
   * Detecta el idioma preferido del navegador
   * @returns {string} Código de idioma
   */
  detectBrowserLanguage() {
    const lang = navigator.language || navigator.userLanguage || 'es';
    return lang.startsWith('en') ? 'en' : 'es';
  },

  /**
   * Guarda el idioma en localStorage de forma segura
   * @param {string} language Código de idioma
   */
  saveLanguage(language) {
    try { localStorage.setItem(this.storageKey, language); }
    catch (error) { Logger.warn('LanguageManager: No se pudo guardar idioma:', error.message); }
  },

  /**
   * Establece el idioma actual
   * @param {string} language Código de idioma
   */
  setLanguage(language) {
    if (!this.availableLanguages.includes(language)) {
      Logger.warn(`LanguageManager: Idioma '${language}' no disponible, usando 'es'`);
      language = 'es';
    }
    this.currentLanguage = language;
    document.documentElement.lang = language;
    // Actualizar selector si existe
    const switcher = document.getElementById('language-switcher');
    if (switcher && switcher.value !== language) { switcher.value = language; }
    this.saveLanguage(language);
  },

  /**
   * Obtiene las traducciones para el idioma actual
   * @param {Object} data Datos del usuario para traducciones dinámicas
   * @returns {Object} Objeto con todas las traducciones
   */
  getTranslations(data = {}) {
    const baseTranslations = staticTextConfig[this.currentLanguage] || staticTextConfig.es;
    // Agregar traducciones dinámicas basadas en datos
    let profileImageAlt = baseTranslations.profileImageAlt || "Profile picture of ";
    if (data.name) { profileImageAlt += data.name; }
    else { profileImageAlt += (this.currentLanguage === 'es' ? "el usuario" : "the user"); }
    return { ...baseTranslations, profileImageAlt };
  },

  /**
   * Aplica traducciones estáticas a elementos del DOM
   * @param {Object} texts Objeto de traducciones
   * @param {Object} data Datos del resume para traducciones dinámicas
   */
  applyStaticTranslations(texts, data) {
    const setQueryText = (selector, text) => {
        const el = document.querySelector(selector);
        if (el) { el.textContent = text; }
        else { Logger.warn(`applyStaticTranslations: Elemento no encontrado para selector: ${selector}`); }
    };
    setQueryText('a[href="#about"]', texts.navAbout);
    setQueryText('a[href="#experience"]', texts.navExperience);
    setQueryText('a[href="#projects"]', texts.navProjects);
    setQueryText('a[href="#skills"]', texts.navSkills);
    setQueryText('a[href="#languages"]', texts.navLanguages);
    setQueryText('a[href="#education"]', texts.navEducation);
    setQueryText('a[href="#publications"]', texts.navPublications);
    setQueryText('a[href="#certifications"]', texts.navCertifications);
    setQueryText('a[href="#contact"]', texts.navContact);
    const sideMenuNavLinks = document.querySelectorAll('#side-menu nav a[data-translate-key]');
    sideMenuNavLinks.forEach(link => {
      const key = link.dataset.translateKey;
      if (texts[key]) { link.textContent = texts[key]; }
      else { Logger.warn(`applyStaticTranslations: Clave de traducción "${key}" no encontrada para el menú lateral.`); }
    });
    setQueryText('#print-cv-button', texts.printCV);
    setQueryText('section#experience h2', texts.titleExperience);
    setQueryText('section#projects h2', texts.titleProjects);
    setQueryText('section#skills h2', texts.titleSkills);
    setQueryText('section#languages h2', texts.titleLanguages);
    setQueryText('section#education h2', texts.titleEducation);
    setQueryText('section#publications h2', texts.titlePublications);
    setQueryText('section#certifications h2', texts.titleCertifications);
    setQueryText('#contact h2', texts.contactTitle);
    setQueryText('#contact p.text-slate-300', texts.contactIntro);
    // Enlaces y botones dinámicos
    this.updateDynamicElements(texts, data);
    // Referencias para impresión
    this.updatePrintReferences(texts);
    // Actualizar toggle de skills
    this.updateSkillsToggle(texts);
  },

  /**
   * Actualiza elementos dinámicos con traducciones
   * @param {Object} texts Traducciones
   * @param {Object} data Datos del resume
   */
  updateDynamicElements(texts, data) {
    // Enlaces de contacto
    const emailLink = document.getElementById("email-link");
    if (emailLink) emailLink.textContent = texts.emailLinkText;
    const githubProfileLink = document.getElementById("github-contact-link");
    if (githubProfileLink) {
      githubProfileLink.innerHTML = GITHUB_ICON_SVG + (texts.githubProfileLinkText || "GitHub Profile");
    }
    const copyEmailButton = document.getElementById("copy-email-contact-button");
    if (copyEmailButton) { copyEmailButton.innerHTML = texts.copyEmailButtonText || "Copy Email"; }
    // Enlaces de proyectos
    const projectRepoLinks = document.querySelectorAll(".project-repo-link");
    projectRepoLinks.forEach(link => {
      link.innerHTML = GITHUB_ICON_SVG + (texts.projectRepoLinkText || "View Code");
      const projectTitle = link.closest('div').querySelector('h3')?.textContent || 'proyecto';
      link.setAttribute('aria-label', `${texts.projectRepoLinkText || "View Code"} de ${projectTitle}`);
    });
    // Imagen de perfil
    const profileImg = document.getElementById("profile-image");
    if (profileImg) { profileImg.alt = texts.profileImageAlt; }
    // URLs de repositorios para impresión
    this.updateProjectPrintUrls(texts, data);
  },

  /**
   * Actualiza URLs de proyectos para impresión
   * @param {Object} texts Traducciones
   * @param {Object} data Datos del resume
   */
  updateProjectPrintUrls(texts, data) {
    const projectCards = document.querySelectorAll('#project-list > div');
    projectCards.forEach((card, index) => {
      if (data.projects && data.projects[index] && data.projects[index].repositoryUrl) {
        const repoUrlPrintElement = card.querySelector('p.print-only-repo-url');
        if (repoUrlPrintElement) {
          const label = texts.projectRepoUrlLabelPrint || 'Repository:';
          repoUrlPrintElement.textContent = `${label} ${data.projects[index].repositoryUrl}`;
        }
      }
    });
  },

  /**
   * Actualiza referencias para impresión
   * @param {Object} texts Traducciones
   */
  updatePrintReferences(texts) {
    // Limpiar elementos existentes
    const existingElements = document.querySelectorAll('.print-only-contact-info');
    existingElements.forEach(el => el.remove());
    // Crear nuevo elemento de referencias
    const referencesText = document.createElement('p');
    referencesText.className = 'print-only-contact-info';
    referencesText.textContent = texts.referencesAvailableText || 
      (this.currentLanguage === 'es' ? 'Referencias disponibles a solicitud.' : 'References available upon request.');
    document.body.appendChild(referencesText);
  },

  /**
   * Actualiza el texto del botón toggle de skills
   * @param {Object} texts Traducciones
   */
  updateSkillsToggle(texts) {
    const skillsSection = document.getElementById("skills-section");
    const skillsToggleText = document.getElementById("toggle-text");
    if (skillsToggleText && skillsSection) {
      const isExpanded = skillsSection.classList.contains('expanded');
      const correctText = isExpanded ? (texts.skillsToggleLess || 'Collapse') : (texts.skillsToggle || 'Expand');
      skillsToggleText.textContent = correctText;
    }
  },

  /**
   * Configura el selector de idiomas
   */
  setupLanguageSwitcher() {
    const switcher = document.getElementById('language-switcher');
    if (!switcher) {
      Logger.error("LanguageManager: Language switcher not found");
      return;
    }
    this.eventManager.add(switcher, 'change', async (event) => {
      const selectedLanguage = event.target.value;
      if (this.onLanguageChange) {
        await this.onLanguageChange(selectedLanguage);
      }
    });
  },

  /**
   * Maneja el cambio de idioma
   * @param {string} language Nuevo idioma
   */
  handleLanguageChange(language) {
    if (!this.availableLanguages.includes(language)) {
      Logger.warn(`LanguageManager: Idioma inválido '${language}', usando 'es'`);
      language = 'es';
    }
    this.setLanguage(language);
    // Disparar evento personalizado para que main.js recargue datos
    const event = new CustomEvent('languageChanged', { detail: { language } });
    document.dispatchEvent(event);
  },

  /**
   * Obtiene el idioma actual
   * @returns {string} Código de idioma
   */
  getCurrentLanguage() { return this.currentLanguage; },

  /**
   * Verifica si un idioma está disponible
   * @param {string} language Código de idioma
   * @returns {boolean}
   */
  isLanguageAvailable(language) { return this.availableLanguages.includes(language); }
};
export default LanguageManager;