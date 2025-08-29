// Script principal para la funcionalidad del portafolio, incluyendo carga de datos y manipulación del DOM.
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
    element.src = src || '';
    element.alt = alt || '';
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

// Icono SVG de GitHub (actualmente inline, el archivo assets/icons/github.svg es una copia para referencia)
const GITHUB_ICON_SVG = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="w-5 h-5 mr-2"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>';

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
 * Esto incluye áreas de texto, imágenes y listas.
 */
function clearDynamicContent() {
  setTextContent("name", "");
  setTextContent("title", "");
  setTextContent("summary", "Cargando contenido...");
  setImageAttributes("profile-image", "", "Cargando imagen de perfil");

  const oldGitHubLink = document.getElementById("github-profile-link");
  if (oldGitHubLink) oldGitHubLink.remove();
  const oldCopyEmailButton = document.getElementById("copy-email-button");
  if (oldCopyEmailButton) oldCopyEmailButton.remove();
  const oldContactLinksContainer = document.getElementById("contact-links-container");
  if (oldContactLinksContainer && oldContactLinksContainer.parentNode.id === 'about-text-content') {
    oldContactLinksContainer.remove();
  }

  const contactActionsContainer = document.getElementById("contact-actions-container");
  if (contactActionsContainer) {
    contactActionsContainer.innerHTML = '';
  }

  clearElementInnerHTML("experience-list");
  clearElementInnerHTML("project-list");
  clearElementInnerHTML("skills-section");
  clearElementInnerHTML("language-list");
  clearElementInnerHTML("education-list");
  clearElementInnerHTML("certification-list");
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

// --- Funciones para Rellenar Secciones Específicas del HTML ---
function populateAbout(data) {
  setTextContent("name", data.name);
  setTextContent("title", data.title);
  if (data.about) {
    setTextContent("summary", data.about.summary);
    setImageAttributes("profile-image", data.about.image, "");
  } else {
    setTextContent("summary", "La sección 'Acerca de mí' no está disponible para este idioma.");
    setImageAttributes("profile-image", "assets/profile_placeholder.png", "Imagen de perfil no disponible");
  }
}

function populateContactActions(data, texts, language) {
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

  if (data.contact && data.contact.email) {
    const emailLinkElement = document.createElement("a");
    emailLinkElement.id = "email-link";
    emailLinkElement.href = "mailto:" + data.contact.email;
    emailLinkElement.className = "btn-hover inline-flex min-w-[84px] max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-gradient-to-r from-[#197fe5] to-[#3b8dff] text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em] shadow-lg hover:shadow-xl no-print";
    actionsContainer.appendChild(emailLinkElement);
    const copyEmailContactBtn = document.createElement("button");
    copyEmailContactBtn.id = "copy-email-contact-button";
    copyEmailContactBtn.className = "btn-hover inline-flex min-w-[84px] max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em] shadow-lg no-print bg-slate-500 hover:bg-slate-600 transition-colors duration-300";
    copyEmailContactBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(data.contact.email)
        .then(() => {
          copyEmailContactBtn.innerHTML = texts.copyEmailButtonSuccessText || "Email Copied!";
          setTimeout(() => { copyEmailContactBtn.innerHTML = texts.copyEmailButtonText || "Copy Email"; }, 2000);
        }).catch(err => {
          console.error('Fallo al copiar el correo: ', err);
          copyEmailContactBtn.innerHTML = texts.copyEmailButtonFailText || "Copy Failed";
          setTimeout(() => { copyEmailContactBtn.innerHTML = texts.copyEmailButtonText || "Copy Email"; }, 2000);
        });
    });
    actionsContainer.appendChild(copyEmailContactBtn);
    const emailPrintText = document.createElement('p');
    emailPrintText.className = 'print-only-contact-info';
    actionsContainer.appendChild(emailPrintText);
  }
  if (data.githubProfileUrl) {
    const githubContactButton = document.createElement("a");
    githubContactButton.id = "github-contact-link";
    githubContactButton.href = data.githubProfileUrl;
    githubContactButton.target = "_blank";
    githubContactButton.rel = "noopener noreferrer";
    githubContactButton.className = "btn-hover inline-flex min-w-[84px] max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em] shadow-lg no-print bg-[#197fe5] hover:bg-[#156abc] transition-colors duration-300";
    actionsContainer.appendChild(githubContactButton);
    const githubPrintText = document.createElement('p');
    githubPrintText.className = 'print-only-contact-info';
    actionsContainer.appendChild(githubPrintText);
  }
  if (data.contact && data.contact.phone) {
    const phonePrintText = document.createElement('p');
    phonePrintText.className = 'print-only-contact-info';
    actionsContainer.appendChild(phonePrintText);
  }
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
    projectCard.className = "flex flex-col gap-4 p-6 bg-[#111a22] rounded-xl shadow-lg";
    const projectImage = project.image || 'https://via.placeholder.com/600x400.png?text=Image+Not+Available';
    const projectTitleText = project.title || 'Project Image'; // Renombrado para evitar confusión con el elemento title

    // Contenido HTML para la vista web (imagen, título, descripción, enlace interactivo)
    let webContentHTML = `
      <img src="${projectImage}" alt="${projectTitleText}" class="w-full aspect-video rounded-lg object-cover no-print" onerror="this.onerror=null; this.src='assets/project_placeholder.png'; console.error('Error loading image for project: ${projectTitleText} at ${projectImage}');">

      <h3 class="text-white text-xl font-semibold">${project.title || ''}</h3>
      <p class="text-slate-400 text-sm">${project.description || ''}</p>
    `;
    if (project.repositoryUrl) {
      webContentHTML += `<a href="${project.repositoryUrl}" target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex items-center text-[#197fe5] hover:text-[#3b8dff] transition-colors duration-300 no-print project-repo-link">${texts.projectRepoLinkText || "View Code"}</a>`;
    }
    projectCard.innerHTML = webContentHTML;

    // Añadir URL del repositorio para impresión (print-only)
    if (project.repositoryUrl) {
      const repoUrlPrintText = document.createElement('p');
      repoUrlPrintText.className = 'print-only-repo-url';
      // El texto se establecerá en applyStaticTranslations usando texts.projectRepoUrlLabelPrint
      projectCard.appendChild(repoUrlPrintText); // Se añade al final de la tarjeta del proyecto
    }
    projectList.appendChild(projectCard);
  });
}

function populateSkills(skillsData, language) {
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
    div.innerHTML = `<h3 class="text-white text-xl font-semibold">${edu.degree || ''}</h3><p class="text-slate-400 text-sm">${edu.institution || ''} | ${edu.dates || ''}</p><p class="text-slate-300 text-base mt-2">${edu.details || ''}</p>`;
    educationList.appendChild(div);
  });
}

function populateCertifications(certificationsData) {
  const certificationSection = document.getElementById("certifications");
  const certificationList = document.getElementById("certification-list");
  if (!certificationsData || !certificationList) { return; }
  // Si no hay datos de certificaciones, oculta la sección completa
  if (certificationsData.length === 0) {
    certificationSection.style.display = 'none';
    certificationList.style.display = 'none';
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
  setQueryText('section#certifications h2', texts.titleCertifications);
  setQueryText('#contact h2', texts.contactTitle);
  setQueryText('#contact p.text-slate-300', texts.contactIntro);
  const emailLink = document.getElementById("email-link");
  if(emailLink) emailLink.textContent = texts.emailLinkText;
  const githubProfileLink = document.getElementById("github-contact-link");
  if (githubProfileLink) { githubProfileLink.innerHTML = GITHUB_ICON_SVG + (texts.githubProfileLinkText || "GitHub Profile"); }
  const copyEmailButton = document.getElementById("copy-email-contact-button");
  if (copyEmailButton) { copyEmailButton.innerHTML = texts.copyEmailButtonText || "Copy Email"; }
  const projectRepoLinks = document.querySelectorAll(".project-repo-link");
  projectRepoLinks.forEach(link => { link.innerHTML = GITHUB_ICON_SVG + (texts.projectRepoLinkText || "View Code"); link.setAttribute('aria-label', `${texts.projectRepoLinkText || "View Code"} de ${link.closest('div').querySelector('h3')?.textContent || 'proyecto'}`);});
  const profileImg = document.getElementById("profile-image");
  if (profileImg) { profileImg.alt = texts.profileImageAlt; }

  const actionsContainer = document.getElementById('contact-actions-container');
  if (actionsContainer) {
    const printOnlyElements = actionsContainer.querySelectorAll('p.print-only-contact-info');
    let currentPrintElementIndex = 0;
    if (data.contact && data.contact.email && printOnlyElements[currentPrintElementIndex]) {
      printOnlyElements[currentPrintElementIndex].textContent = (texts.emailLabelPrint || 'Email:') + ' ' + data.contact.email;
      currentPrintElementIndex++;
    }
    if (data.githubProfileUrl && printOnlyElements[currentPrintElementIndex]) {
      printOnlyElements[currentPrintElementIndex].textContent = (texts.githubLabelPrint || 'GitHub Profile:') + ' ' + data.githubProfileUrl;
      currentPrintElementIndex++;
    }
    if (data.contact && data.contact.phone && printOnlyElements[currentPrintElementIndex]) {
      printOnlyElements[currentPrintElementIndex].textContent = (texts.phoneLabelPrint || 'Phone:') + ' ' + data.contact.phone;
    }
  }
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
}

// --- Objeto de Configuración para Textos Estáticos y Traducciones ---
const staticTextConfig = {
  es: {
    navAbout: 'Acerca de', navExperience: 'Experiencia', navProjects: 'Proyectos', navSkills: 'Habilidades', navLanguages: 'Idiomas', navEducation: 'Educación', navCertifications: 'Certificaciones', navContact: 'Contacto', printCV: 'Imprimir CV',
    titleExperience: 'Experiencia Laboral', titleProjects: 'Mis Proyectos', titleSkills: 'Habilidades Técnicas', titleLanguages: 'Idiomas', titleEducation: 'Educación', titleCertifications: 'Certificaciones',
    contactTitle: 'Ponte en Contacto', contactIntro: 'Actualmente estoy buscando nuevas oportunidades. Si tienes alguna pregunta o simplemente quieres saludar, ¡no dudes en contactarme!', emailLinkText: 'Envíame un Correo',
    copyEmailButtonText: 'Copiar Correo', copyEmailButtonSuccessText: '¡Correo Copiado!', copyEmailButtonFailText: 'Error al Copiar',
    projectRepoLinkText: 'Ver Código',
    githubProfileLinkText: 'Perfil de GitHub',
    emailLabelPrint: 'Correo Electrónico:',
    githubLabelPrint: 'Perfil de GitHub:',
    phoneLabelPrint: 'Celular:',
    projectRepoUrlLabelPrint: 'Repositorio:',
    profileImageAlt: "Foto de perfil de "
  },
  en: {
    navAbout: 'About', navExperience: 'Experience', navProjects: 'Projects', navSkills: 'Skills', navLanguages: 'Languages', navEducation: 'Education', navCertifications: 'Certifications', navContact: 'Contact', printCV: 'Print CV',
    titleExperience: 'Work Experience', titleProjects: 'My Projects', titleSkills: 'Technical Skills', titleLanguages: 'Languages', titleEducation: 'Education', titleCertifications: 'Certifications',
    contactTitle: 'Get In Touch', contactIntro: "I'm currently looking for new opportunities. Whether you have a question or just want to say hi, feel free to reach out!", emailLinkText: 'Email Me',
    copyEmailButtonText: 'Copy Email', copyEmailButtonSuccessText: 'Email Copied!', copyEmailButtonFailText: 'Copy Failed',
    projectRepoLinkText: 'View Code',
    githubProfileLinkText: 'GitHub Profile',
    emailLabelPrint: 'Email:',
    githubLabelPrint: 'GitHub Profile:',
    phoneLabelPrint: 'Phone:',
    projectRepoUrlLabelPrint: 'Repository:',
    profileImageAlt: "Profile picture of "
  }
};

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
      populateContactActions(data, texts, language);
      if (data.experience) populateExperience(data.experience);
      if (data.projects) populateProjects(data.projects, texts);
      if (data.skills) populateSkills(data.skills, language);
      if (data.languages) populateLanguages(data.languages);
      if (data.education) populateEducation(data.education);
      if (data.certifications) populateCertifications(data.certifications);
      applyStaticTranslations(texts, data);
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

document.addEventListener('DOMContentLoaded', () => {
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
});