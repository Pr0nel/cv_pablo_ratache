/*
  script.js: script principal para la funcionalidad del portafolio, incluyendo carga de datos y manipulación del DOM.
  Copyright 2025 Pablo Ronel Ratache Rojas

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/

// --- Objeto de Configuración para Textos Estáticos y Traducciones ---
const staticTextConfig = {
  es: {
    navAbout: 'Acerca de', navExperience: 'Experiencia', navProjects: 'Proyectos', navSkills: 'Habilidades', navLanguages: 'Idiomas', navEducation: 'Educación', navPublications: 'Publicaciones', navCertifications: 'Certificaciones', navContact: 'Contacto', printCV: 'Imprimir CV',
    titleExperience: 'Experiencia Laboral', titleProjects: 'Mis Proyectos', titleSkills: 'Habilidades', titleLanguages: 'Idiomas', titleEducation: 'Educación', titlePublications: 'Publicaciones', titleCertifications: 'Certificaciones',
    contactTitle: 'Ponte en Contacto', contactIntro: 'Actualmente estoy buscando nuevas oportunidades. Si tienes alguna pregunta o simplemente quieres saludar, ¡no dudes en contactarme!', emailLinkText: 'Envíame un Correo',
    copyEmailButtonText: 'Copiar Correo', copyEmailButtonSuccessText: '¡Correo Copiado!', copyEmailButtonFailText: 'Error al Copiar',
    projectRepoLinkText: 'Ver Código',
    githubProfileLinkText: 'Perfil de GitHub',
    publicationDoiLinkText: 'Ver Publicación',
    skillsToggle: 'Expandir',
    skillsToggleLess: 'Contraer',
    emailLabelPrint: 'Correo Electrónico:',
    githubLabelPrint: 'Perfil de GitHub:',
    phoneLabelPrint: 'Celular:',
    projectRepoUrlLabelPrint: 'Repositorio:',
    publicationUrlLabelPrint: 'DOI:',
    profileImageAlt: "Foto de perfil de ",
    referencesAvailableText: 'Referencias disponibles a solicitud.'
  },
  en: {
    navAbout: 'About', navExperience: 'Experience', navProjects: 'Projects', navSkills: 'Skills', navLanguages: 'Languages', navEducation: 'Education', navPublications: 'Publications', navCertifications: 'Certifications', navContact: 'Contact', printCV: 'Print CV',
    titleExperience: 'Work Experience', titleProjects: 'My Projects', titleSkills: 'Skills', titleLanguages: 'Languages', titleEducation: 'Education', titlePublications: 'Publications', titleCertifications: 'Certifications',
    contactTitle: 'Get In Touch', contactIntro: "I'm currently looking for new opportunities. Whether you have a question or just want to say hi, feel free to reach out!", emailLinkText: 'Email Me',
    copyEmailButtonText: 'Copy Email', copyEmailButtonSuccessText: 'Email Copied!', copyEmailButtonFailText: 'Copy Failed',
    projectRepoLinkText: 'View Code',
    githubProfileLinkText: 'GitHub Profile',
    publicationDoiLinkText: 'View Publication',
    skillsToggle: 'Expand',
    skillsToggleLess: 'Collapse',
    emailLabelPrint: 'Email:',
    githubLabelPrint: 'GitHub Profile:',
    phoneLabelPrint: 'Phone:',
    projectRepoUrlLabelPrint: 'Repository:',
    publicationUrlLabelPrint: 'DOI:',
    profileImageAlt: "Profile picture of ",
    referencesAvailableText: 'References available upon request.'
  }
};

// Icono SVG de GitHub (actualmente inline, el archivo assets/icons/github.svg es una copia para referencia)
const GITHUB_ICON_SVG = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="w-5 h-5 mr-2"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>';

// EventManager - Gestiona todos los event listeners dinámicos
const EventManager = {
  listeners: new Map(),
  
  // Añade un event listener y lo registra para cleanup posterior
  add(element, event, handler, options = {}) {
    if (!element) {
      console.warn('EventManager.add: elemento es null o undefined');
      return;
    }
    element.addEventListener(event, handler, options);
    // Registrar para cleanup
    if (!this.listeners.has(element)) { this.listeners.set(element, []); }
    this.listeners.get(element).push({ event, handler, options });
    console.log(`EventManager: Registrado ${event} en`, element);
  },
  // Limpia todos los event listeners registrados
  cleanup() {
    console.log('EventManager: Iniciando cleanup de event listeners');
    let cleanedCount = 0;  
    this.listeners.forEach((events, element) => {
      events.forEach(({ event, handler, options }) => {
        element.removeEventListener(event, handler, options);
        cleanedCount++;
      });
    });
    this.listeners.clear();
    console.log(`EventManager: ${cleanedCount} event listeners removidos`);
  },
  
  // Remueve listeners específicos de un elemento
  removeFrom(element) {
    if (!this.listeners.has(element)) return;
    const events = this.listeners.get(element);
    events.forEach(({ event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.listeners.delete(element);
  }
};

// Utility Functions
const Utils = {
  // Debounce: evita que una función se ejecute demasiado, frecuentemente
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
  },
  
  // Throttle: limita la ejecución a máximo una vez cada X ms
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Función auxiliar para establecer el contenido de texto de forma segura
function setTextContent(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text || '';
  } else {
    console.warn(`Element with ID '${elementId}' not found for setTextContent.`);
  }
}

// Función auxiliar para establecer src y alt de imagen de forma segura
function setImageAttributes(elementId, src, alt) {
  const element = document.getElementById(elementId);
  if (element) {
    if (elementId === 'profile-image') {
      // Configurar lazy loading para imagen de perfil
      element.dataset.src = src || '';
      element.src = "data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23334155'/%3E%3C/svg%3E";
      element.className += ' lazy-image';
      element.alt = alt || '';
      // Observer para imagen de perfil
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.src = entry.target.dataset.src;
            entry.target.classList.remove('lazy-image');
            observer.unobserve(entry.target);
          }
        });
      });
      observer.observe(element);
    } else {
        element.src = src || '';
        element.alt = alt || '';
    }
  } else {
    console.warn(`Element with ID '${elementId}' not found for setImageAttributes.`);
  }
}

// Función auxiliar para establecer href de forma segura
function setLinkHref(elementId, href) {
  const element = document.getElementById(elementId);
  if (element) {
    element.href = href || '#';
  } else {
    console.warn(`Element with ID '${elementId}' not found for setLinkHref.`);
  }
}

// Función auxiliar para limpiar el innerHTML de un elemento
function clearElementInnerHTML(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = '';
  } else {
    console.warn(`Element with ID '${elementId}' not found for clearElementInnerHTML.`);
  }
}

// --- Funciones de Limpieza y Configuración del DOM ---

/**
 * Limpia todo el contenido dinámico del DOM antes de cargar nuevos datos.
 * Esto incluye: áreas de texto, imágenes y listas; cleanup de event listeners para evitar memory leaks.
 */
function clearDynamicContent() {
  EventManager.cleanup();
  setTextContent("name", "");
  setTextContent("title", "");
  setTextContent("summary", "Cargando contenido...");
  setImageAttributes("profile-image", "", "Cargando imagen de perfil");

  const elementsToRemove = ["github-profile-link", "copy-email-button", "contact-links-container"];
  elementsToRemove.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      // Remover listeners específicos de este elemento antes de eliminarlo
      EventManager.removeFrom(element);
      element.remove();
    }
  });

  const oldContactLinksContainer = document.getElementById("contact-links-container");
  if (oldContactLinksContainer && oldContactLinksContainer.parentNode.id === 'about-text-content') {
    EventManager.removeFrom(oldContactLinksContainer);
    oldContactLinksContainer.remove();
  }

  const contactActionsContainer = document.getElementById("contact-actions-container");
  if (contactActionsContainer) {
    // Remover listeners de todos los hijos antes de limpiar innerHTML
    const children = contactActionsContainer.querySelectorAll('*');
    children.forEach(child => EventManager.removeFrom(child));
    contactActionsContainer.innerHTML = '';
  }

  const contentContainers = ["experience-list", "project-list", "skills-section", "language-list", "education-list", "publication-list", "certification-list"];
  contentContainers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      // Remover listeners de elementos hijos antes de limpiar
      const children = container.querySelectorAll('*');
      children.forEach(child => EventManager.removeFrom(child));
      clearElementInnerHTML(id);
    }
  });
  console.log('clearDynamicContent: Limpieza completa realizada');
}

/**
 * Configura el contenedor para mostrar errores de carga de datos.
 * @returns {HTMLElement} El elemento del DOM para mostrar errores.
 */
function setupErrorDisplay() {
  let errorDisplay = document.getElementById('error-display-container');
  if (!errorDisplay) {
    errorDisplay = document.createElement('div');
    errorDisplay.id = 'error-display-container';
    errorDisplay.style.cssText = 'color:red; padding:20px; text-align:center; background-color:#fff0f0; margin-top: 20px; border: 1px solid red; border-radius: 8px;';
    const mainArea = document.querySelector('main');
    if (mainArea) {
      mainArea.prepend(errorDisplay);
    } else {
      document.body.prepend(errorDisplay);
    }
  }
  errorDisplay.style.display = 'none';
  return errorDisplay;
}

// --- Funciones para Obtener y Procesar Datos del JSON ---
function fetchData(filePath, errorDisplay) {
  return fetch(filePath)
    .then(res => {
      if (!res.ok) {
        const errorMsg = `Error: No se pudieron cargar los datos (Estado: ${res.status}). El archivo '${filePath}' podría no existir o no ser accesible.`;
        if (errorDisplay) {
          errorDisplay.textContent = errorMsg;
          errorDisplay.style.display = 'block';
        }
        setTextContent("summary", `Fallo al cargar el contenido. Por favor, intente con otro idioma o refresque la página.`);
        throw new Error(`HTTP error! status: ${res.status}, file: ${filePath}`);
      }
      return res.json();
    });
}

function createPrintContactLineInAbout(data) {
  // Remover TODAS las líneas de contacto existentes (tanto por ID como por clase)
  const existingContactLines = document.querySelectorAll('.print-contact-line, #print-contact-line');
  existingContactLines.forEach(line => line.remove());
  // Verificar si tenemos datos de contacto
  const hasContactData = (data.contact && (data.contact.email || data.contact.phone)) || data.githubProfileUrl;
  if (!hasContactData) {
    console.warn('createPrintContactLineInAbout: No hay datos de contacto disponibles');
    return;
  }
  // Crear nueva línea de contacto
  const contactLine = document.createElement('div');
  contactLine.id = 'print-contact-line';
  contactLine.className = 'print-contact-line';
  contactLine.style.display = 'none'; // Oculto por defecto
  // Construir elementos de contacto
  const contactElements = [];
  if (data.contact && data.contact.email) { contactElements.push(data.contact.email); }
  if (data.contact && data.contact.phone) { contactElements.push(data.contact.phone); }
  if (data.portfolioUrl) { contactElements.push(data.portfolioUrl); }
  if (data.githubProfileUrl) { contactElements.push(data.githubProfileUrl); }
  contactLine.textContent = contactElements.join(' | ');
  // Insertar después del elemento name
  const nameElement = document.getElementById('name');
  if (nameElement && nameElement.parentNode) {
    nameElement.parentNode.insertBefore(contactLine, nameElement.nextSibling);
  } else {
    console.warn('createPrintContactLineInAbout: Elemento name o su contenedor padre no encontrado');
    // Fallback al contenedor about
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.appendChild(contactLine);
    } else {
      console.warn('createPrintContactLineInAbout: No se pudo insertar la línea de contacto - elementos contenedores no encontrados');
    }
  }
}

// --- Funciones para Rellenar Secciones Específicas del HTML ---
function populateAbout(data) {
  setTextContent("name", data.name);
  setTextContent("title", data.title);
  if (data.about) {
    setTextContent("summary", data.about.summary);
    // Crear elemento oculto para professionalProfile (solo visible en impresión)
    let professionalProfileElement = document.getElementById("professional-profile");
    if (!professionalProfileElement) {
      professionalProfileElement = document.createElement("p");
      professionalProfileElement.id = "professional-profile";
      professionalProfileElement.className = "text-slate-300 text-base sm:text-lg font-normal leading-relaxed mt-4 text-justify md:text-left print-only-profile";
      const summaryElement = document.getElementById("summary");
      if (summaryElement && summaryElement.parentNode) {
        summaryElement.parentNode.insertBefore(professionalProfileElement, summaryElement.nextSibling);
      }
    }
    setTextContent("professional-profile", data.about.professionalProfile);
    setImageAttributes("profile-image", data.about.image, "");
  } else {
    setTextContent("summary", "La sección 'Acerca de mí' no está disponible para este idioma.");
    setImageAttributes("profile-image", "assets/profile_placeholder.webp", "Imagen de perfil no disponible");
  }
  createPrintContactLineInAbout(data);
}

function populateContactActions(data, texts) {
  const contactSection = document.getElementById("contact");
  const contactIntroP = contactSection ? contactSection.querySelector('p.text-slate-300') : null;
  if (!contactSection || !contactIntroP) {
    console.warn("populateContactActions: Elementos de la sección de contacto no encontrados.");
    return;
  }
  let actionsContainer = document.getElementById("contact-actions-container");
  if (!actionsContainer) {
    actionsContainer = document.createElement("div");
    actionsContainer.id = "contact-actions-container";
    actionsContainer.className = "mt-6 flex flex-wrap justify-center items-center gap-4";
    contactIntroP.parentNode.insertBefore(actionsContainer, contactIntroP.nextSibling);
  }
  // Botones para la web (sin cambios)
  if (data.contact && data.contact.email) {
    const emailLinkElement = document.createElement("a");
    emailLinkElement.id = "email-link";
    emailLinkElement.href = "mailto:" + data.contact.email;
    emailLinkElement.className = "btn-hover inline-flex min-w-[84px] max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-gradient-to-r from-[#197fe5] to-[#3b8dff] text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em] shadow-lg hover:shadow-xl no-print";
    actionsContainer.appendChild(emailLinkElement);
    const copyEmailContactBtn = document.createElement("button");
    copyEmailContactBtn.id = "copy-email-contact-button";
    copyEmailContactBtn.className = "btn-hover inline-flex min-w-[84px] max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em] shadow-lg no-print bg-slate-500 hover:bg-slate-600 transition-colors duration-300";
    const copyEmailHandler = () => {
      navigator.clipboard.writeText(data.contact.email)
        .then(() => {
          copyEmailContactBtn.innerHTML = texts.copyEmailButtonSuccessText || "Email Copied!";
          setTimeout(() => { 
            copyEmailContactBtn.innerHTML = texts.copyEmailButtonText || "Copy Email"; 
          }, 2000);
        }).catch(err => {
          console.error('Fallo al copiar el correo: ', err);
          copyEmailContactBtn.innerHTML = texts.copyEmailButtonFailText || "Copy Failed";
          setTimeout(() => { 
            copyEmailContactBtn.innerHTML = texts.copyEmailButtonText || "Copy Email"; 
          }, 2000);
        });
    };
    EventManager.add(copyEmailContactBtn, 'click', copyEmailHandler);
    actionsContainer.appendChild(copyEmailContactBtn);
  }

  if (data.githubProfileUrl) {
    const githubContactButton = document.createElement("a");
    githubContactButton.id = "github-contact-link";
    githubContactButton.href = data.githubProfileUrl;
    githubContactButton.target = "_blank";
    githubContactButton.rel = "noopener noreferrer";
    githubContactButton.className = "btn-hover inline-flex min-w-[84px] max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em] shadow-lg no-print bg-[#197fe5] hover:bg-[#156abc] transition-colors duration-300";
    actionsContainer.appendChild(githubContactButton);
  }
  createPrintContactLineInAbout(data);
}

function populatePublications(publicationsData, texts) {
  const publicationsSection = document.getElementById("publications");
  const publicationList = document.getElementById("publication-list");
  // Si no hay datos o la lista está vacía, ocultar la sección
  if (!publicationsData || publicationsData.length === 0) {
    if (publicationsSection) {
      publicationsSection.style.display = 'none';
    }
    return;
  }
  // Mostrar la sección si hay datos
  if (publicationsSection) {
    publicationsSection.style.display = 'block';
  }
  // Verificar que publicationList existe antes de usarlo
  if (!publicationList) {
    console.warn("populatePublications: Elemento 'publication-list' no encontrado.");
    return;
  }
  publicationsData.forEach(publication => {
    const publicationCard = document.createElement("div");
    publicationCard.className = "p-6 bg-[#111a22] rounded-xl shadow-lg";
    // Construir HTML para web (con enlace clickeable)
    const webContent = `
      <h3 class="text-white text-xl font-semibold mb-2">${publication.title || ''}</h3>
      <p class="text-slate-400 text-sm mb-2">${publication.journal || ''} | ${publication.date || ''}</p>
      ${publication.doiUrl ? `
        <a href="${publication.doiUrl}" target="_blank" rel="noopener noreferrer" 
           class="publication-doi-link text-[#197fe5] hover:text-[#3b8dff] text-sm font-medium flex items-center gap-2">
          ${texts.publicationDoiLinkText || "View Publication"}
        </a>
      ` : ''}
    `;
    publicationCard.innerHTML = webContent;
    // Añadir URL completa para impresión (ATS compatible)
    if (publication.doiUrl) {
      const printUrlElement = document.createElement('p');
      printUrlElement.className = 'print-only-publication-url';
      printUrlElement.textContent = `${texts.publicationUrlLabelPrint || 'DOI:'} ${publication.doiUrl}`;
      publicationCard.appendChild(printUrlElement);
    }
    publicationList.appendChild(publicationCard);
  });
}

/**
 * Renderiza la lista de experiencias laborales.
 * @param {Array<Object>} experienceData - Array de objetos con role, company, dates, description.
 */
function populateExperience(experienceData) {
  const experienceList = document.getElementById("experience-list");
  if (!experienceData || !experienceList) { return; }
  experienceData.forEach(job => {
    const div = document.createElement("div");
    div.className = "p-6 bg-[#111a22] rounded-xl shadow-lg";
    div.innerHTML = `<h3 class="text-white text-xl font-semibold">${job.role || ''}</h3><p class="text-slate-400 text-sm">${job.company || ''} | ${job.dates || ''}</p><p class="text-slate-300 text-base mt-2 whitespace-pre-line">${job.description || ''}</p>`;
    experienceList.appendChild(div);
  });
}

function alignProjectCards() {
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    const titleElement = card.querySelector('.project-title');
    const descriptionElement = card.querySelector('.project-description');
    if (titleElement && descriptionElement) {
      const titleHeight = titleElement.offsetHeight;
      const descriptionHeight = descriptionElement.offsetHeight;
      const maxHeight = Math.max(titleHeight, descriptionHeight);
      card.style.minHeight = `${maxHeight}px`; // Establecer el alto mínimo para alinear verticalmente
    }
  });
}

/**
 * Puebla la sección de proyectos.
 * @param {Array<Object>} projectsData - Array de objetos de proyecto.
 * @param {Object} texts - Objeto de traducciones para el texto del enlace al repositorio y la etiqueta de URL para impresión.
 */
function populateProjects(projectsData, texts) {
  const projectList = document.getElementById("project-list");
  if (!projectsData || !projectList) {
    if (!projectList) console.warn("populateProjects: Elemento 'project-list' no encontrado.");
    return;
  }
  projectsData.forEach(project => {
    const projectCard = document.createElement("div"); // Renombrado de 'div' a 'projectCard' para claridad
    projectCard.className = "flex flex-col p-6 bg-[#111a22] rounded-xl shadow-lg h-full";
    const projectImage = project.image || 'assets/project_placeholder.webp';
    const projectTitleText = project.title || 'Project Image'; // Renombrado para evitar confusión con el elemento title

    // Contenido HTML para la vista web (imagen, título, descripción, enlace interactivo)
    projectCard.innerHTML = `
      <div class="flex justify-center w-full">
        <img data-src="${projectImage}" 
            src="data:image/svg+xml,%3Csvg width='600' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23334155'/%3E%3C/svg%3E"
            alt="${project.title || ''}"
            class="lazy-image w-full aspect-video rounded-lg object-cover no-print"
            loading="lazy">
      </div>
      <div class="flex flex-col flex-grow p-4">
        <h3 class="text-white text-xl font-semibold mb-2">${project.title || ''}</h3>
        <p class="text-slate-300 text-sm mb-3 whitespace-pre-line flex-grow">${project.description || ''}</p>
        ${project.repositoryUrl ? `
          <a href="${project.repositoryUrl}" target="_blank" rel="noopener noreferrer"
            class="project-repo-link text-[#197fe5] hover:text-[#3b8dff] text-sm font-medium mt-auto flex items-center gap-2">
            ${texts.projectRepoLinkText || "View Code"}
          </a>
        ` : ''}
      </div>
    `;

    // Añadir URL del repositorio para impresión (print-only)
    if (project.repositoryUrl) {
      const repoUrlPrintText = document.createElement('p');
      repoUrlPrintText.className = 'print-only-repo-url';
      // El texto se establecerá en applyStaticTranslations usando texts.projectRepoUrlLabelPrint
      projectCard.appendChild(repoUrlPrintText); // Se añade al final de la tarjeta del proyecto
    }
    projectList.appendChild(projectCard);
  });
  initializeLazyLoading();
  // Alineación vertical de las tarjetas de proyectos
  alignProjectCards();
}

function populateSkills(skillsData, language, languagesData) {
  const skillsSection = document.getElementById("skills-section");
  if (!skillsData || !skillsSection) { return; }
  const skillCategoriesConfig = [
    { key: 'languages', title_en: 'Programming Languages', title_es: 'Lenguajes de Programación' },
    { key: 'tools', title_en: 'Tools', title_es: 'Herramientas' },
    { key: 'concepts', title_en: 'Concepts', title_es: 'Conceptos' }
  ];
  skillCategoriesConfig.forEach(category => {
    if (skillsData[category.key] && skillsData[category.key].length > 0) {
      const container = document.createElement("div");
      const sectionTitleText = (language === 'es' ? category.title_es : category.title_en) || category.key.charAt(0).toUpperCase() + category.key.slice(1);
      const titleElement = document.createElement('h3');
      titleElement.className = "text-[#197fe5] text-2xl font-semibold mb-6";
      titleElement.textContent = sectionTitleText;
      container.appendChild(titleElement);
      const webDisplayContainer = document.createElement('div');
      webDisplayContainer.className = 'space-y-6 web-skills-display';
      webDisplayContainer.id = `skills-${category.key}`;
      const printList = document.createElement('ul');
      printList.className = 'print-only-skills-list';
      skillsData[category.key].forEach(skill => {
        const skillDiv = document.createElement("div");
        skillDiv.className = "flex flex-col gap-2";
        skillDiv.innerHTML = `<div class="flex gap-4 justify-between items-center"><p class="text-white text-lg font-medium">${skill.name || ''}</p><p class="text-slate-300 text-sm">${skill.level || 0}%</p></div><div class="rounded-full h-3 bg-[#344d65] overflow-hidden" role="progressbar" aria-valuenow="${skill.level || 0}" aria-valuemin="0" aria-valuemax="100" aria-label="Skill level for ${skill.name || 'Unknown skill'}"><div class="h-3 rounded-full progress-bar-fill" style="width: ${skill.level || 0}%"></div></div>`;
        webDisplayContainer.appendChild(skillDiv);
        const listItem = document.createElement('li');
        listItem.textContent = skill.name || '';
        printList.appendChild(listItem);
      });
      if (category.key === 'concepts' && languagesData && languagesData.length > 0) {
        languagesData.forEach(lang => {
          const listItem = document.createElement('li');
          listItem.textContent = `${lang.language || ''} (${lang.level || ''})`;
          printList.appendChild(listItem);
        });
      }
      container.appendChild(webDisplayContainer);
      container.appendChild(printList);
      skillsSection.appendChild(container);
    }
  });
}

function populateLanguages(languagesData) {
  const languageProficiencyList = document.getElementById("language-list");
  if (!languagesData || !languageProficiencyList) { return; }
  languagesData.forEach(lang => {
    const div = document.createElement("div");
    div.className = "flex flex-col gap-2 p-6 bg-[#111a22] rounded-xl shadow-lg";
    div.innerHTML = `<div class="flex gap-4 justify-between items-center"><p class="text-white text-lg font-medium">${lang.language || ''}</p><p class="text-slate-300 text-sm">${lang.level || ''}</p></div><div class="rounded-full h-3 bg-[#344d65] overflow-hidden" role="progressbar" aria-valuenow="${lang.progress || 0}" aria-valuemin="0" aria-valuemax="100" aria-label="Proficiency level for ${lang.language || 'Unknown language'}"><div class="h-3 rounded-full progress-bar-fill" style="width: ${lang.progress || 0}%"></div></div>`;
    languageProficiencyList.appendChild(div);
  });
}

function populateEducation(educationData) {
  const educationList = document.getElementById("education-list");
  if (!educationData || !educationList) { return; }
  educationData.forEach(edu => {
    const div = document.createElement("div");
    div.className = "p-6 bg-[#111a22] rounded-xl shadow-lg";
    div.innerHTML = `<h3 class="text-white text-xl font-semibold">${edu.degree || ''}</h3><p class="text-slate-400 text-sm">${edu.institution || ''} | ${edu.dates || ''}</p><p class="text-slate-300 text-base mt-2 no-print">${edu.details || ''}</p>`;
    educationList.appendChild(div);
  });
}

function populateCertifications(certificationsData) {
  const certificationSection = document.getElementById("certifications");
  const certificationList = document.getElementById("certification-list");
  // Si no hay datos o la lista está vacía, ocultar la sección
  if (!certificationsData || certificationsData.length === 0) {
    if (certificationSection) {
      certificationSection.style.display = 'none';
    }
    return;
  }
  // Mostrar la sección si hay datos
  if (certificationSection) {
    certificationSection.style.display = 'block';
  }
  // Verificar que certificationList existe antes de usarlo
  if (!certificationList) {
    console.warn("populateCertifications: Elemento 'certification-list' no encontrado.");
    return;
  }
  certificationsData.forEach(cert => {
    const div = document.createElement("div");
    div.className = "p-6 bg-[#111a22] rounded-xl shadow-lg";
    div.innerHTML = `<h3 class="text-white text-xl font-semibold">${cert.title || ''}</h3><p class="text-slate-400 text-sm">${cert.issuer || ''} | Issued: ${cert.date || ''}</p>${cert.description ? `<p class="text-slate-300 text-base mt-2">${cert.description}</p>` : ''}`;
    certificationList.appendChild(div);
  });
}

function applyStaticTranslations(texts, data) {
  const setQueryText = (selector, text) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
    else console.warn(`applyStaticTranslations: Elemento no encontrado para selector: ${selector}`);
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
    else { console.warn(`applyStaticTranslations: Clave de traducción "${key}" no encontrada para el menú lateral.`); }
  });
  setTextContent('print-cv-button', texts.printCV);
  setQueryText('section#experience h2', texts.titleExperience);
  setQueryText('section#projects h2', texts.titleProjects);
  setQueryText('section#skills h2', texts.titleSkills);
  setQueryText('section#languages h2', texts.titleLanguages);
  setQueryText('section#education h2', texts.titleEducation);
  setQueryText('section#publications h2', texts.titlePublications);
  setQueryText('section#certifications h2', texts.titleCertifications);
  setQueryText('#contact h2', texts.contactTitle);
  setQueryText('#contact p.text-slate-300', texts.contactIntro);
  // Limpiar los elementos existentes con la clase 'print-only-contact-info'
  const existingElements = document.querySelectorAll('.print-only-contact-info');
  existingElements.forEach(el => el.remove());
  const referencesText = document.createElement('p');
  referencesText.className = 'print-only-contact-info';
  referencesText.textContent = texts.referencesAvailableText || (texts.lang === 'es' ? 'Referencias disponibles a solicitud.' : 'References available upon request.');
  document.body.appendChild(referencesText);

  const emailLink = document.getElementById("email-link");
  if (emailLink) emailLink.textContent = texts.emailLinkText;
  const githubProfileLink = document.getElementById("github-contact-link");
  if (githubProfileLink) { githubProfileLink.innerHTML = GITHUB_ICON_SVG + (texts.githubProfileLinkText || "GitHub Profile"); }
  const copyEmailButton = document.getElementById("copy-email-contact-button");
  if (copyEmailButton) { copyEmailButton.innerHTML = texts.copyEmailButtonText || "Copy Email"; }
  const projectRepoLinks = document.querySelectorAll(".project-repo-link");
  projectRepoLinks.forEach(link => { link.innerHTML = GITHUB_ICON_SVG + (texts.projectRepoLinkText || "View Code"); link.setAttribute('aria-label', `${texts.projectRepoLinkText || "View Code"} de ${link.closest('div').querySelector('h3')?.textContent || 'proyecto'}`); });
  const profileImg = document.getElementById("profile-image");
  if (profileImg) { profileImg.alt = texts.profileImageAlt; }

  // Poblar URLs de repositorios de proyectos para impresión
  const projectCards = document.querySelectorAll('#project-list > div'); // Asume que cada tarjeta es un div directo hijo de #project-list
  projectCards.forEach((card, index) => {
    if (data.projects && data.projects[index] && data.projects[index].repositoryUrl) {
      const repoUrlPrintElement = card.querySelector('p.print-only-repo-url');
      if (repoUrlPrintElement) {
        repoUrlPrintElement.textContent = (texts.projectRepoUrlLabelPrint || 'Repository:') + ' ' + data.projects[index].repositoryUrl;
      }
    }
  });
  // Actualizar texto del botón toggle de skills
  const skillsSection = document.getElementById("skills-section");
  const skillsToggleBtn = document.getElementById("skills-toggle");
  const skillsToggleText = document.getElementById("toggle-text");
  if (skillsToggleBtn && skillsToggleText && skillsSection) {
    // Verificar si está expandido actualmente
    const isExpanded = skillsSection.classList.contains('expanded');
    // Aplicar el texto correcto según el estado actual
    const correctText = isExpanded ? (texts.skillsToggleLess || 'Collapse') : (texts.skillsToggle || 'Expand');
    skillsToggleText.textContent = correctText;
  }
}

// Funciones de inicialización de la aplicación
function initializeApp() {
  console.log('Inicializando aplicación...');
  // Configurar event listeners globales con debouncing
  const debouncedAlignCards = Utils.debounce(() => {
    console.log('Realineando tarjetas de proyecto...');
    alignProjectCards();
  }, 250);
  EventManager.add(window, 'resize', debouncedAlignCards);
  // Cleanup cuando la página se descarga (opcional, para SPA)
  EventManager.add(window, 'beforeunload', () => {
    console.log('Limpiando recursos antes de salir...');
    EventManager.cleanup();
  });
  console.log('Aplicación inicializada correctamente');
}

// Función para reinicializar después de cambios de idioma
function reinitializeAfterLanguageChange() {
  // Solo reinicializar los event listeners de resize
  // (los otros se limpian automáticamente en clearDynamicContent)
  const debouncedAlignCards = Utils.debounce(alignProjectCards, 250);
  EventManager.add(window, 'resize', debouncedAlignCards);
}

// Función principal para cargar y mostrar toda la información del currículum para el idioma seleccionado.
function loadResumeData(language) {
  document.documentElement.lang = language;
  const filePath = `data/resume_${language}.json`;
  clearDynamicContent();
  const errorDisplay = setupErrorDisplay();
  fetchData(filePath, errorDisplay)
    .then(data => {
      let currentProfileImageAlt = (staticTextConfig[language] && staticTextConfig[language].profileImageAlt) ? staticTextConfig[language].profileImageAlt : staticTextConfig.en.profileImageAlt;
      if (data.name) { currentProfileImageAlt += data.name; }
      else { currentProfileImageAlt += (language === 'es' ? "el usuario" : "the user"); }
      const texts = { ...(staticTextConfig[language] || staticTextConfig.en), profileImageAlt: currentProfileImageAlt };
      populateAbout(data);
      populateContactActions(data, texts);
      if (data.experience) populateExperience(data.experience);
      if (data.projects) populateProjects(data.projects, texts);
      if (data.skills) populateSkills(data.skills, language, data.languages);
      if (data.languages) populateLanguages(data.languages);
      if (data.education) populateEducation(data.education);
      if (data.publications) populatePublications(data.publications, texts);
      if (data.certifications) populateCertifications(data.certifications);
      applyStaticTranslations(texts, data);
      alignProjectCards(); // Llamar a alignProjectCards después de poblar los proyectos
      reinitializeAfterLanguageChange();
    })
    .catch(error => {
      console.error(`Error en loadResumeData para ${language}:`, error.message);
      if (errorDisplay && errorDisplay.style.display === 'none') {
        setTextContent("summary", `Ocurrió un error al cargar el contenido para ${language}. Detalles en la consola.`);
      }
      if (errorDisplay && errorDisplay.style.display === 'none') {
        errorDisplay.textContent = `Ocurrió un error general al cargar los datos para ${language}. Por favor, revise la consola.`;
        errorDisplay.style.display = 'block';
      }
    });
}

function initializeLazyLoading() {
  const lazyImages = document.querySelectorAll('.lazy-image');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy-image');
        imageObserver.unobserve(img);
        // Callback cuando la imagen se carga
        img.onload = () => { img.classList.add('loaded'); };
      }
    });
  }, {
    rootMargin: '50px' // Cargar imagen 50px antes de ser visible
  });
  lazyImages.forEach(img => imageObserver.observe(img));
}

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  const languageSwitcher = document.getElementById('language-switcher');
  if (!languageSwitcher) {
    console.error("Language switcher element (#language-switcher) not found!");
    loadResumeData('es');
    return;
  }
  const savedLanguage = localStorage.getItem('preferredLanguage');
  let initialLanguage = languageSwitcher.value || 'es';
  if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
    initialLanguage = savedLanguage;
    languageSwitcher.value = savedLanguage;
  } else {
    localStorage.setItem('preferredLanguage', initialLanguage);
  }
  loadResumeData(initialLanguage);
  languageSwitcher.addEventListener('change', (event) => {
    const selectedLanguage = event.target.value;
    if (selectedLanguage === 'es' || selectedLanguage === 'en') {
      loadResumeData(selectedLanguage);
      localStorage.setItem('preferredLanguage', selectedLanguage);
    } else {
      console.warn(`Invalid language selected: ${selectedLanguage}. Defaulting to 'es'.`);
      loadResumeData('es');
      localStorage.setItem('preferredLanguage', 'es');
      languageSwitcher.value = 'es';
    }
  });

  const hamburgerButton = document.getElementById('hamburger-button');
  const sideMenu = document.getElementById('side-menu');
  const closeMenuButton = document.getElementById('close-menu-button');
  const menuOverlay = document.getElementById('menu-overlay');
  const skillsSection = document.getElementById('skills-section');
  const toggleBtn = document.getElementById('skills-toggle');
  const toggleText = document.getElementById('toggle-text');
  const toggleIcon = document.getElementById('toggle-icon');
  if (sideMenu) {
    const sideMenuLinks = sideMenu.querySelectorAll('nav a');
    const toggleSideMenu = () => {
      if (sideMenu && menuOverlay && hamburgerButton) {
        sideMenu.classList.toggle('-translate-x-full');
        const isMenuOpen = sideMenu.classList.toggle('translate-x-0');
        menuOverlay.classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden');
        hamburgerButton.setAttribute('aria-expanded', isMenuOpen ? 'true' : 'false');
      } else {
        console.error("Alguno de los elementos del menú lateral (sideMenu, menuOverlay, o hamburgerButton) no fue encontrado para toggleSideMenu.");
      }
    };
    if (hamburgerButton && closeMenuButton && menuOverlay) {
      hamburgerButton.addEventListener('click', toggleSideMenu);
      closeMenuButton.addEventListener('click', toggleSideMenu);
      menuOverlay.addEventListener('click', toggleSideMenu);
      sideMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (sideMenu.classList.contains('translate-x-0')) { toggleSideMenu(); }
        });
      });
    } else {
      console.error("One or more menu control elements (hamburger, close button, overlay) not found.");
    }
  } else {
    console.error("Side menu element (#side-menu) not found. Hamburger functionality disabled.");
  }
  if (!toggleBtn || !toggleText || !toggleIcon || !skillsSection) return;
  if (toggleBtn){
    toggleBtn.addEventListener('click', () => {
      const expanded = skillsSection.classList.toggle('expanded');
      toggleBtn.setAttribute('aria-expanded', expanded);
      // Obtener el idioma actual del selector
      const currentLanguage = document.getElementById('language-switcher').value || 'es';
      const currentTexts = staticTextConfig[currentLanguage] || staticTextConfig.es;
      toggleText.textContent = expanded ? (currentTexts.skillsToggleLess || 'Collapse') : (currentTexts.skillsToggle || 'Expand');
      toggleIcon.classList.toggle('rotate', expanded);
    });
  }
});

// Evento para realineación cuando se cambia el tamaño de la ventana
const debouncedAlignCards = Utils.debounce(() => {
  console.log('Realineando tarjetas de proyecto...');
  alignProjectCards();
}, 250);

// Usar EventManager para el resize
EventManager.add(window, 'resize', debouncedAlignCards);