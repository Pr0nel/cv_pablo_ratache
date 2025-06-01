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

// GitHub SVG Icon
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

// --- Funciones de Limpieza y Configuración ---

/**
 * Limpia todo el contenido dinámico del DOM antes de cargar nuevos datos.
 * Esto incluye áreas de texto, imágenes y listas.
 */
function clearDynamicContent() {
  // Limpieza de la sección 'About Me' (nombre, título, resumen, imagen)
  setTextContent("name", "");
  setTextContent("title", "");
  setTextContent("summary", "Cargando contenido..."); // Texto provisional mientras carga
  setImageAttributes("profile-image", "", "Cargando imagen de perfil");

  // Limpieza de elementos específicos que se añadían al 'About Me' y ahora están en 'Contact'
  const oldGitHubLink = document.getElementById("github-profile-link"); // ID antiguo
  if (oldGitHubLink) oldGitHubLink.remove();
  const oldCopyEmailButton = document.getElementById("copy-email-button"); // ID antiguo
  if (oldCopyEmailButton) oldCopyEmailButton.remove();
  const oldContactLinksContainer = document.getElementById("contact-links-container"); // Contenedor antiguo en 'About Me'
  if (oldContactLinksContainer && oldContactLinksContainer.parentNode.id === 'about-text-content') {
    oldContactLinksContainer.remove();
  }

  // Limpieza de los botones de acción en la sección 'Contact' y su contenedor
  // Los botones individuales (email-link, github-contact-link, copy-email-contact-button)
  // se eliminan al limpiar su contenedor.
  const contactActionsContainer = document.getElementById("contact-actions-container");
  if (contactActionsContainer) {
    contactActionsContainer.innerHTML = ''; // Limpia el contenedor de acciones de contacto
  }

  // Limpieza de las listas de secciones principales
  clearElementInnerHTML("experience-list");
  clearElementInnerHTML("project-list");
  clearElementInnerHTML("skills-section"); // Contenedor de todas las categorías de habilidades
  clearElementInnerHTML("language-list");
  clearElementInnerHTML("education-list");
  clearElementInnerHTML("certification-list");
}

/**
 * Configura el contenedor para mostrar errores de carga de datos.
 * Si no existe, lo crea y lo añade al DOM. Lo oculta por defecto.
 * @returns {HTMLElement} El elemento del DOM para mostrar errores.
 */
function setupErrorDisplay() {
  let errorDisplay = document.getElementById('error-display-container');
  if (!errorDisplay) {
    errorDisplay = document.createElement('div');
    errorDisplay.id = 'error-display-container';
    // Estilos para el contenedor de errores
    errorDisplay.style.cssText = 'color:red; padding:20px; text-align:center; background-color:#fff0f0; margin-top: 20px; border: 1px solid red; border-radius: 8px;';
    const mainArea = document.querySelector('main'); // Asume que 'main' es el mejor lugar para prepend
    if (mainArea) {
      mainArea.prepend(errorDisplay);
    } else {
      // Fallback si no hay 'main', añade al inicio del body
      document.body.prepend(errorDisplay);
    }
  }
  errorDisplay.style.display = 'none'; // Oculto por defecto
  return errorDisplay;
}

// --- Funciones de Obtención y Procesamiento de Datos ---

/**
 * Obtiene los datos del currículum desde un archivo JSON.
 * @param {string} filePath - La ruta al archivo JSON de datos.
 * @param {HTMLElement} errorDisplay - El elemento del DOM donde mostrar errores de fetch.
 * @returns {Promise<Object>} Una promesa que se resuelve con los datos del currículum.
 */
function fetchData(filePath, errorDisplay) {
  return fetch(filePath)
    .then(res => {
      if (!res.ok) {
        // Muestra el error en el contenedor de errores y en la consola
        const errorMsg = `Error: No se pudieron cargar los datos (Estado: ${res.status}). El archivo '${filePath}' podría no existir o no ser accesible.`;
        if (errorDisplay) {
          errorDisplay.textContent = errorMsg;
          errorDisplay.style.display = 'block';
        }
        // También actualiza el resumen para indicar el fallo
        setTextContent("summary", `Fallo al cargar el contenido. Por favor, intente con otro idioma o refresque la página.`);
        throw new Error(`HTTP error! status: ${res.status}, file: ${filePath}`);
      }
      return res.json(); // Parsea la respuesta como JSON
    });
}

// --- Funciones para Poblar Secciones Específicas ---

/**
 * Puebla la sección "About Me" con los datos proporcionados.
 * @param {Object} data - El objeto de datos del currículum (debe contener name, title, about).
 */
function populateAbout(data) {
  setTextContent("name", data.name);
  setTextContent("title", data.title);

  if (data.about) {
    setTextContent("summary", data.about.summary);
    // El alt de la imagen de perfil se actualiza en applyStaticTranslations
    setImageAttributes("profile-image", data.about.image, "");
  } else {
    setTextContent("summary", "La sección 'Acerca de mí' no está disponible para este idioma.");
    setImageAttributes("profile-image", "assets/profile_placeholder.png", "Imagen de perfil no disponible");
  }
}

/**
 * Puebla los botones de acción (Email, GitHub, Copiar Email) en la sección "Contact".
 * @param {Object} data - El objeto de datos del currículum (necesita contact.email, githubProfileUrl).
 * @param {Object} texts - El objeto de traducciones para los textos de los botones.
 * @param {string} language - El idioma actual (necesario para el event listener del botón de copiar).
 */
function populateContactActions(data, texts, language) {
  const contactSection = document.getElementById("contact");
  const contactIntroP = contactSection ? contactSection.querySelector('p.text-slate-300') : null;

  if (!contactSection || !contactIntroP) {
    if (!contactSection) console.warn("populateContactActions: Sección de contacto no encontrada.");
    if (!contactIntroP) console.warn("populateContactActions: Párrafo de introducción de contacto no encontrado.");
    return;
  }

  let actionsContainer = document.getElementById("contact-actions-container");
  if (!actionsContainer) {
    actionsContainer = document.createElement("div");
    actionsContainer.id = "contact-actions-container";
    actionsContainer.className = "mt-6 flex flex-wrap justify-center items-center gap-4";
    contactIntroP.parentNode.insertBefore(actionsContainer, contactIntroP.nextSibling);
  }

  // Crear y añadir el enlace "Email Me"
  if (data.contact && data.contact.email) {
    const emailLinkElement = document.createElement("a");
    emailLinkElement.id = "email-link";
    emailLinkElement.href = "mailto:" + data.contact.email;
    emailLinkElement.className = "btn-hover inline-flex min-w-[84px] max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-gradient-to-r from-[#197fe5] to-[#3b8dff] text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em] shadow-lg hover:shadow-xl no-print";
    // El texto se actualiza en applyStaticTranslations
    actionsContainer.appendChild(emailLinkElement);
  }

  // Crear y añadir el botón de perfil de GitHub
  if (data.githubProfileUrl) {
    const githubContactButton = document.createElement("a");
    githubContactButton.id = "github-contact-link";
    githubContactButton.href = data.githubProfileUrl;
    githubContactButton.target = "_blank";
    githubContactButton.rel = "noopener noreferrer";
    githubContactButton.className = "btn-hover inline-flex min-w-[84px] max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em] shadow-lg no-print bg-[#197fe5] hover:bg-[#156abc] transition-colors duration-300";
    // El innerHTML (icono + texto) se actualiza en applyStaticTranslations
    actionsContainer.appendChild(githubContactButton);
  }

  // Crear y añadir el botón "Copy Email"
  if (data.contact && data.contact.email) {
    const copyEmailContactBtn = document.createElement("button");
    copyEmailContactBtn.id = "copy-email-contact-button";
    copyEmailContactBtn.className = "btn-hover inline-flex min-w-[84px] max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em] shadow-lg no-print bg-slate-500 hover:bg-slate-600 transition-colors duration-300";
    // El texto inicial se actualiza en applyStaticTranslations

    copyEmailContactBtn.addEventListener('click', () => {
      // Accede a staticTextConfig directamente o pasa 'texts' si es preferible.
      // Para simplificar, asumimos que staticTextConfig está accesible o 'texts' se pasa de alguna manera.
      // Aquí usamos el 'texts' pasado a la función, que es mejor.
      navigator.clipboard.writeText(data.contact.email)
        .then(() => {
          copyEmailContactBtn.innerHTML = texts.copyEmailButtonSuccessText || "Email Copied!";
          setTimeout(() => {
            copyEmailContactBtn.innerHTML = texts.copyEmailButtonText || "Copy Email";
          }, 2000);
        })
        .catch(err => {
          console.error('Fallo al copiar el correo: ', err);
          copyEmailContactBtn.innerHTML = texts.copyEmailButtonFailText || "Copy Failed";
          setTimeout(() => {
            copyEmailContactBtn.innerHTML = texts.copyEmailButtonText || "Copy Email";
          }, 2000);
        });
    });
    actionsContainer.appendChild(copyEmailContactBtn);
  }
}


/**
 * Puebla la sección de experiencia laboral.
 * @param {Array<Object>} experienceData - Array de objetos de experiencia.
 */
function populateExperience(experienceData) {
  const experienceList = document.getElementById("experience-list");
  if (!experienceData || !experienceList) {
    if (!experienceList) console.warn("populateExperience: Elemento 'experience-list' no encontrado.");
    return;
  }
  experienceData.forEach(job => {
    const div = document.createElement("div");
    div.className = "p-6 bg-[#111a22] rounded-xl shadow-lg";
    div.innerHTML = `
      <h3 class="text-white text-xl font-semibold">${job.role || ''}</h3>
      <p class="text-slate-400 text-sm">${job.company || ''} | ${job.dates || ''}</p>
      <p class="text-slate-300 text-base mt-2">${job.description || ''}</p>
    `;
    experienceList.appendChild(div);
  });
}

/**
 * Puebla la sección de proyectos.
 * @param {Array<Object>} projectsData - Array de objetos de proyecto.
 * @param {Object} texts - Objeto de traducciones para el texto del enlace al repositorio.
 */
function populateProjects(projectsData, texts) {
  const projectList = document.getElementById("project-list");
  if (!projectsData || !projectList) {
     if (!projectList) console.warn("populateProjects: Elemento 'project-list' no encontrado.");
    return;
  }
  projectsData.forEach(project => {
    const div = document.createElement("div");
    div.className = "flex flex-col gap-4 p-6 bg-[#111a22] rounded-xl shadow-lg";
    const projectImage = project.image || 'https://via.placeholder.com/600x400.png?text=Image+Not+Available';
    const projectTitle = project.title || 'Project Image';

    // El texto del enlace 'View Code' se actualizará en applyStaticTranslations
    // usando la clase 'project-repo-link' y GITHUB_ICON_SVG.
    div.innerHTML = `
      <img src="${projectImage}" alt="${projectTitle}" class="w-full aspect-video rounded-lg object-cover" onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400.png?text=Project+Image+Not+Found'; console.error('Error loading image for project: ${projectTitle} at ${projectImage}');">
      <h3 class="text-white text-xl font-semibold">${project.title || ''}</h3>
      <p class="text-slate-400 text-sm">${project.description || ''}</p>
      ${project.repositoryUrl ? `<a href="${project.repositoryUrl}" target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex items-center text-[#197fe5] hover:text-[#3b8dff] transition-colors duration-300 no-print project-repo-link">${texts.projectRepoLinkText || "View Code"}</a>` : ''}
    `;
    projectList.appendChild(div);
  });
}

/**
 * Puebla la sección de habilidades técnicas.
 * @param {Object} skillsData - Objeto con categorías de habilidades.
 * @param {string} language - El idioma actual para los títulos de las categorías.
 */
function populateSkills(skillsData, language) {
  const skillsSection = document.getElementById("skills-section");
  if (!skillsData || !skillsSection) {
    if (!skillsSection) console.warn("populateSkills: Elemento 'skills-section' no encontrado.");
    return;
  }

  // Definición de categorías de habilidades y sus títulos traducibles
  const skillCategoriesConfig = [
    { key: 'languages', title_en: 'Programming Languages', title_es: 'Lenguajes de Programación' },
    { key: 'tools', title_en: 'Tools', title_es: 'Herramientas' },
    { key: 'concepts', title_en: 'Concepts', title_es: 'Conceptos' }
  ];

  skillCategoriesConfig.forEach(category => {
    if (skillsData[category.key] && skillsData[category.key].length > 0) {
      const container = document.createElement("div");
      // Determina el título de la categoría según el idioma
      const sectionTitleText = (language === 'es' ? category.title_es : category.title_en) || category.key.charAt(0).toUpperCase() + category.key.slice(1);
      container.innerHTML = `<h3 class="text-[#197fe5] text-2xl font-semibold mb-6">${sectionTitleText}</h3><div class="space-y-6" id="skills-${category.key}"></div>`;
      skillsSection.appendChild(container);

      const listElement = document.getElementById(`skills-${category.key}`);
      if (listElement) {
        skillsData[category.key].forEach(skill => {
          const skillDiv = document.createElement("div");
          skillDiv.className = "flex flex-col gap-2";
          skillDiv.innerHTML = `
            <div class="flex gap-4 justify-between items-center">
              <p class="text-white text-lg font-medium">${skill.name || ''}</p>
              <p class="text-slate-300 text-sm">${skill.level || 0}%</p>
            </div>
            <div class="rounded-full h-3 bg-[#344d65] overflow-hidden" role="progressbar" aria-valuenow="${skill.level || 0}" aria-valuemin="0" aria-valuemax="100" aria-label="Skill level for ${skill.name || 'Unknown skill'}">
              <div class="h-3 rounded-full progress-bar-fill" style="width: ${skill.level || 0}%"></div>
            </div>`;
          listElement.appendChild(skillDiv);
        });
      }
    }
  });
}

/**
 * Puebla la sección de competencias en idiomas.
 * @param {Array<Object>} languagesData - Array de objetos de idioma.
 */
function populateLanguages(languagesData) {
  const languageProficiencyList = document.getElementById("language-list");
  if (!languagesData || !languageProficiencyList) {
    if (!languageProficiencyList) console.warn("populateLanguages: Elemento 'language-list' no encontrado.");
    return;
  }
  languagesData.forEach(lang => {
    const div = document.createElement("div");
    div.className = "flex flex-col gap-2 p-6 bg-[#111a22] rounded-xl shadow-lg";
    div.innerHTML = `
      <div class="flex gap-4 justify-between items-center">
        <p class="text-white text-lg font-medium">${lang.language || ''}</p>
        <p class="text-slate-300 text-sm">${lang.level || ''}</p>
      </div>
      <div class="rounded-full h-3 bg-[#344d65] overflow-hidden" role="progressbar" aria-valuenow="${lang.progress || 0}" aria-valuemin="0" aria-valuemax="100" aria-label="Proficiency level for ${lang.language || 'Unknown language'}">
        <div class="h-3 rounded-full progress-bar-fill" style="width: ${lang.progress || 0}%"></div>
      </div>`;
    languageProficiencyList.appendChild(div);
  });
}

/**
 * Puebla la sección de educación.
 * @param {Array<Object>} educationData - Array de objetos de educación.
 */
function populateEducation(educationData) {
  const educationList = document.getElementById("education-list");
  if (!educationData || !educationList) {
    if (!educationList) console.warn("populateEducation: Elemento 'education-list' no encontrado.");
    return;
  }
  educationData.forEach(edu => {
    const div = document.createElement("div");
    div.className = "p-6 bg-[#111a22] rounded-xl shadow-lg";
    div.innerHTML = `
      <h3 class="text-white text-xl font-semibold">${edu.degree || ''}</h3>
      <p class="text-slate-400 text-sm">${edu.institution || ''} | ${edu.dates || ''}</p>
      <p class="text-slate-300 text-base mt-2">${edu.details || ''}</p>
    `;
    educationList.appendChild(div);
  });
}

/**
 * Puebla la sección de certificaciones.
 * @param {Array<Object>} certificationsData - Array de objetos de certificación.
 */
function populateCertifications(certificationsData) {
  const certificationList = document.getElementById("certification-list");
  if (!certificationsData || !certificationList) {
    if (!certificationList) console.warn("populateCertifications: Elemento 'certification-list' no encontrado.");
    return;
  }
  certificationsData.forEach(cert => {
    const div = document.createElement("div");
    div.className = "p-6 bg-[#111a22] rounded-xl shadow-lg";
    div.innerHTML = `
      <h3 class="text-white text-xl font-semibold">${cert.title || ''}</h3>
      <p class="text-slate-400 text-sm">${cert.issuer || ''} | Issued: ${cert.date || ''}</p>
      ${cert.description ? `<p class="text-slate-300 text-base mt-2">${cert.description}</p>` : ''}
    `;
    certificationList.appendChild(div);
  });
}

/**
 * Aplica las traducciones a los elementos de texto estático de la página.
 * @param {Object} texts - Objeto con las cadenas de texto traducidas para el idioma actual.
 * @param {string} dataName - El nombre del titular del currículum, para el alt de la imagen de perfil.
 */
function applyStaticTranslations(texts, dataName) {
  // Función auxiliar para simplificar la asignación de texto a elementos por selector
  const setQueryText = (selector, text) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
    else console.warn(`applyStaticTranslations: Elemento no encontrado para selector: ${selector}`);
  };

  // Navegación principal y del menú lateral (usando data-translate-key)
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
    if (texts[key]) {
      link.textContent = texts[key];
    } else {
      console.warn(`applyStaticTranslations: Clave de traducción "${key}" no encontrada para el menú lateral.`);
    }
  });

  // Botón de imprimir CV
  setTextContent('print-cv-button', texts.printCV);

  // Títulos de las secciones principales
  setQueryText('section#experience h2', texts.titleExperience);
  setQueryText('section#projects h2', texts.titleProjects);
  setQueryText('section#skills h2', texts.titleSkills);
  setQueryText('section#languages h2', texts.titleLanguages);
  setQueryText('section#education h2', texts.titleEducation);
  setQueryText('section#certifications h2', texts.titleCertifications);

  // Sección de contacto: título, introducción y botones/enlaces
  setQueryText('#contact h2', texts.contactTitle);
  setQueryText('#contact p.text-slate-300', texts.contactIntro); // Asume que este es el párrafo de introducción

  // Enlaces/Botones en la sección de contacto (actualizados para usar innerHTML con SVG)
  const emailLink = document.getElementById("email-link");
  if(emailLink) emailLink.textContent = texts.emailLinkText; // El enlace de email es solo texto

  const githubProfileLink = document.getElementById("github-contact-link");
  if (githubProfileLink) {
    githubProfileLink.innerHTML = GITHUB_ICON_SVG + (texts.githubProfileLinkText || "GitHub Profile");
  }

  const copyEmailButton = document.getElementById("copy-email-contact-button");
  if (copyEmailButton) {
    // El texto del botón de copiar correo se actualiza aquí y en su event listener para los mensajes de feedback
    copyEmailButton.innerHTML = texts.copyEmailButtonText || "Copy Email";
  }

  // Enlaces de proyectos (actualizados para usar innerHTML con SVG)
  const projectRepoLinks = document.querySelectorAll(".project-repo-link");
  projectRepoLinks.forEach(link => {
    link.innerHTML = GITHUB_ICON_SVG + (texts.projectRepoLinkText || "View Code");
  });

  // Texto alternativo para la imagen de perfil
  // (Se usa dataName en lugar de texts.profileImageAlt para mayor flexibilidad si el 'alt' no está en staticTextConfig)
  const profileImg = document.getElementById("profile-image");
  if (profileImg) {
      // Construye el texto alt usando el nombre del data y una cadena base del objeto texts
      // Esto asume que profileImageAlt en staticTextConfig es una plantilla como "Profile picture of %s"
      // o que texts.profileImageAlt ya contiene el nombre.
      // Por simplicidad y consistencia con el código original, usamos la concatenación directa si dataName está disponible.
      profileImg.alt = texts.profileImageAlt || `Profile picture of ${dataName || 'the user'}`;
  }
}


// --- Constante de Configuración de Textos Estáticos ---
// Se define fuera de loadResumeData para que sea accesible globalmente en este script si es necesario,
// o podría pasarse a applyStaticTranslations si se prefiere mantenerla encapsulada.
const staticTextConfig = {
  es: {
    navAbout: 'Acerca de', navExperience: 'Experiencia', navProjects: 'Proyectos', navSkills: 'Habilidades', navLanguages: 'Idiomas', navEducation: 'Educación', navCertifications: 'Certificaciones', navContact: 'Contacto', printCV: 'Imprimir CV',
    titleExperience: 'Experiencia Laboral', titleProjects: 'Mis Proyectos', titleSkills: 'Habilidades Técnicas', titleLanguages: 'Idiomas', titleEducation: 'Educación', titleCertifications: 'Certificaciones',
    contactTitle: 'Ponte en Contacto', contactIntro: 'Actualmente estoy buscando nuevas oportunidades. Si tienes alguna pregunta o simplemente quieres saludar, ¡no dudes en contactarme!', emailLinkText: 'Envíame un Correo',
    copyEmailButtonText: 'Copiar Correo', copyEmailButtonSuccessText: '¡Correo Copiado!', copyEmailButtonFailText: 'Error al Copiar',
    projectRepoLinkText: 'Ver Código',
    githubProfileLinkText: 'Perfil de GitHub',
    profileImageAlt: "Foto de perfil de " // Se completará con el nombre del usuario
  },
  en: {
    navAbout: 'About', navExperience: 'Experience', navProjects: 'Projects', navSkills: 'Skills', navLanguages: 'Languages', navEducation: 'Education', navCertifications: 'Certifications', navContact: 'Contact', printCV: 'Print CV',
    titleExperience: 'Work Experience', titleProjects: 'My Projects', titleSkills: 'Technical Skills', titleLanguages: 'Languages', titleEducation: 'Education', titleCertifications: 'Certifications',
    contactTitle: 'Get In Touch', contactIntro: "I'm currently looking for new opportunities. Whether you have a question or just want to say hi, feel free to reach out!", emailLinkText: 'Email Me',
    copyEmailButtonText: 'Copy Email', copyEmailButtonSuccessText: 'Email Copied!', copyEmailButtonFailText: 'Copy Failed',
    projectRepoLinkText: 'View Code',
    githubProfileLinkText: 'GitHub Profile',
    profileImageAlt: "Profile picture of " // Will be completed with the user's name
  }
};


// Carga y muestra toda la información del currículum para el idioma seleccionado.
// Esta es la función principal que orquesta la carga y visualización de datos.
function loadResumeData(language) {
  // Actualiza el atributo 'lang' de la etiqueta <html> al idioma seleccionado.
  document.documentElement.lang = language;
  const filePath = `data/resume_${language}.json`;

  // 1. Limpiar contenido dinámico existente y configurar área de errores.
  clearDynamicContent();
  const errorDisplay = setupErrorDisplay(); // Asegura que el contenedor de errores esté listo.

  // 2. Obtener y procesar los datos del currículum.
  fetchData(filePath, errorDisplay)
    .then(data => {
      // 3. Preparar las traducciones para el idioma actual.
      // El objeto 'texts' contendrá todas las cadenas traducidas necesarias.
      // staticTextConfig.es.profileImageAlt se completa con el nombre de data.name
      let currentProfileImageAlt = staticTextConfig[language].profileImageAlt || staticTextConfig.en.profileImageAlt;
      if (data.name) {
        currentProfileImageAlt += data.name;
      } else {
        currentProfileImageAlt += (language === 'es' ? "el usuario" : "the user");
      }
      // Crea una copia de las traducciones para el idioma actual y añade el alt de la imagen de perfil.
      const texts = {
        ...(staticTextConfig[language] || staticTextConfig.en),
        profileImageAlt: currentProfileImageAlt
      };

      // 4. Poblar todas las secciones del currículum con los datos obtenidos.
      populateAbout(data); // Usa 'data' directamente ya que accede a data.name, data.title, data.about
      populateContactActions(data, texts, language); // Necesita 'data' para email/github, 'texts' para botones, 'language' para el listener de copiar.

      if (data.experience) populateExperience(data.experience);
      if (data.projects) populateProjects(data.projects, texts); // Necesita 'texts' para el enlace "View Code"
      if (data.skills) populateSkills(data.skills, language); // Necesita 'language' para títulos de categoría
      if (data.languages) populateLanguages(data.languages);
      if (data.education) populateEducation(data.education);
      if (data.certifications) populateCertifications(data.certifications);

      // 5. Aplicar traducciones a elementos estáticos y aquellos que necesitan actualización post-población.
      applyStaticTranslations(texts, data.name); // data.name es opcional aquí si profileImageAlt ya está completo en texts.
    })
    .catch(error => {
      // Manejo de errores que puedan ocurrir durante fetchData o el procesamiento en .then()
      console.error(`Error en loadResumeData para ${language}:`, error.message);
      // Muestra un mensaje genérico en el área de resumen si no se ha mostrado uno más específico.
      if (errorDisplay && errorDisplay.style.display === 'none') {
        setTextContent("summary", `Ocurrió un error al cargar el contenido para ${language}. Detalles en la consola.`);
      }
      // Adicionalmente, se podría mostrar el error en el errorDisplay si no fue un error de fetch.
      if (errorDisplay && errorDisplay.style.display === 'none') {
         errorDisplay.textContent = `Ocurrió un error general al cargar los datos para ${language}. Por favor, revise la consola.`;
         errorDisplay.style.display = 'block';
      }
    });
}

// --- Configuración Inicial y Manejadores de Eventos ---

// Configuración inicial al cargar la página: determina el idioma y carga los datos.
document.addEventListener('DOMContentLoaded', () => {
  const languageSwitcher = document.getElementById('language-switcher');
  if (!languageSwitcher) {
    console.error("Language switcher element (#language-switcher) not found!");
    // Intentar cargar contenido por defecto de todos modos o mostrar un error más prominente
    loadResumeData('es'); // Por defecto a Español si falta el selector
    return;
  }

  const savedLanguage = localStorage.getItem('preferredLanguage');
  // Usar el valor actual del selector como respaldo si no hay nada en localStorage o si es inválido
  let initialLanguage = languageSwitcher.value || 'es';

  if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
    initialLanguage = savedLanguage;
    languageSwitcher.value = savedLanguage; // Asegurar que la interfaz del selector coincida con el idioma cargado
  } else {
    // Si el idioma guardado es inválido, o no es 'es'/'en', usar el valor del selector o 'es'
    // y actualizar localStorage a un valor por defecto válido si es necesario.
    localStorage.setItem('preferredLanguage', initialLanguage);
  }

  loadResumeData(initialLanguage); // Cargar contenido inicial basado en el idioma determinado

  // Maneja el cambio de idioma seleccionado por el usuario.
  languageSwitcher.addEventListener('change', (event) => {
    const selectedLanguage = event.target.value;
    if (selectedLanguage === 'es' || selectedLanguage === 'en') {
      loadResumeData(selectedLanguage);
      localStorage.setItem('preferredLanguage', selectedLanguage);
    } else {
      console.warn(`Invalid language selected: ${selectedLanguage}. Defaulting to 'es'.`);
      loadResumeData('es');
      localStorage.setItem('preferredLanguage', 'es');
      languageSwitcher.value = 'es'; // Restablecer el selector a un valor por defecto válido
    }
  });

  // --- Lógica para el menú hamburguesa ---
  const hamburgerButton = document.getElementById('hamburger-button');
  const sideMenu = document.getElementById('side-menu');
  const closeMenuButton = document.getElementById('close-menu-button');
  const menuOverlay = document.getElementById('menu-overlay');

  if (sideMenu) { // Solo proceder si el menú lateral existe
    const sideMenuLinks = sideMenu.querySelectorAll('nav a');

    const toggleSideMenu = () => {
      if (sideMenu && menuOverlay) { // Asegurarse que sideMenu y menuOverlay no son null
        sideMenu.classList.toggle('-translate-x-full');
        sideMenu.classList.toggle('translate-x-0');
        menuOverlay.classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden'); // Bloquear/desbloquear scroll del body
      } else {
        console.error("Side menu or menu overlay element not found for toggleSideMenu.");
      }
    };

    if (hamburgerButton && closeMenuButton && menuOverlay) {
      hamburgerButton.addEventListener('click', toggleSideMenu);
      closeMenuButton.addEventListener('click', toggleSideMenu);
      menuOverlay.addEventListener('click', toggleSideMenu);

      sideMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
          // Solo cerrar si el menú está visible (translate-x-0)
          if (sideMenu.classList.contains('translate-x-0')) {
            toggleSideMenu();
          }
        });
      });
    } else {
      console.error("One or more menu control elements (hamburger, close button, overlay) not found.");
    }
  } else {
    console.error("Side menu element (#side-menu) not found. Hamburger functionality disabled.");
  }
});