// js/modules/DOMRenderer.js
// --- Funciones de Limpieza y Configuración del DOM ---
import EventManager from './EventManager.js';
import LazyLoader from './LazyLoader.js';
import Logger from '../utils/Logger.js';

/**
 * Limpia todo el contenido dinámico del DOM antes de cargar nuevos datos.
 * Esto incluye: áreas de texto, imágenes y listas; cleanup de event listeners para evitar memory leaks.
 */
const DOMRenderer = {
    // Función auxiliar para establecer el contenido de texto de forma segura
    setTextContent(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) { element.textContent = text || ''; }
        else { Logger.warn(`Element with ID '${elementId}' not found for setTextContent.`); }
    },

    // Función auxiliar para establecer src y alt de imagen de forma segura
    setImageAttributes(elementId, src, alt, useLazyLoading = false) {
        const element = document.getElementById(elementId);
        if (element) {
            if (useLazyLoading) {
            LazyLoader.setupImage(element, src, alt);
            } else {
                element.src = src || '';
                element.alt = alt || '';
            }
        } else { Logger.warn(`Element with ID '${elementId}' not found for setImageAttributes.`); }
    },

    // Función auxiliar para establecer href de forma segura
    setLinkHref(elementId, href) {
        const element = document.getElementById(elementId);
        if (element) { element.href = href || '#'; }
        else { Logger.warn(`Element with ID '${elementId}' not found for setLinkHref.`); }
    },

    /**
     * Limpia el contenido de un elemento de forma segura, incluyendo event listeners
     * @param {string} elementId - ID del elemento a limpiar
     * @param {boolean} removeListeners - Si debe limpiar event listeners (default: true)
     * @returns {boolean} - true si se limpió exitosamente
     */
    clearElementContent(elementId, removeListeners = true) {
        const element = document.getElementById(elementId);
        if (!element) {
            Logger.warn(`DOMRenderer.clearElementContent: Element '${elementId}' not found`);
            return false;
        }
        // Limpiar event listeners de elementos hijos si se solicita
        if (removeListeners) {
            const children = element.querySelectorAll('*');
            children.forEach(child => EventManager.removeFrom(child));
        }
        // Limpiar contenido
        element.innerHTML = '';
        return true;
    },

    clearDynamicContent() {
        this.setTextContent("name", "");
        this.setTextContent("title", "");
        this.setTextContent("summary", "Cargando contenido...");
        this.setImageAttributes("profile-image", "", "Cargando imagen de perfil", false);
        const elementsToRemove = ["github-profile-link", "copy-email-button", "contact-links-container"];
        elementsToRemove.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Remover listeners específicos de este elemento antes de eliminarlo
                EventManager.removeFrom(element);
                element.remove();
            }
        });
        const contactActionsContainer = document.getElementById("contact-actions-container");
        if (contactActionsContainer) {
            // Remover listeners de todos los hijos antes de limpiar innerHTML
            const children = contactActionsContainer.querySelectorAll('*');
            children.forEach(child => EventManager.removeFrom(child));
            contactActionsContainer.innerHTML = '';
        }
        const contentContainers = ["experience-list", "project-list", "skills-section", "language-list", "education-list", "publication-list", "certification-list"];
        contentContainers.forEach(id => {
            this.clearElementContent(id, true);
        });
        Logger.info('clearDynamicContent: Limpieza completa realizada');
    },

  /**
   * Configura el contenedor para mostrar errores de carga de datos.
   * @returns {HTMLElement} El elemento del DOM para mostrar errores.
   */
  setupErrorDisplay() {
    let errorDisplay = document.getElementById('error-display-container');
    if (!errorDisplay) {
        errorDisplay = document.createElement('div');
        errorDisplay.id = 'error-display-container';
        errorDisplay.style.cssText = 'color:red; padding:20px; text-align:center; background-color:#fff0f0; margin-top: 20px; border: 1px solid red; border-radius: 8px;';
        const mainArea = document.querySelector('main');
        if (mainArea) { mainArea.prepend(errorDisplay); }
        else { document.body.prepend(errorDisplay); }
    }
    errorDisplay.style.display = 'none';
    return errorDisplay;
  },

  // --- Funciones para Rellenar Secciones Específicas del HTML ---
  populateAbout(data) {
    this.setTextContent("name", data.name);
    this.setTextContent("title", data.title);
    if (data.about) {
        this.setTextContent("summary", data.about.summary);
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
        this.setTextContent("professional-profile", data.about.professionalProfile);
        this.setImageAttributes("profile-image", data.about.image, "", false);
    } else {
        this.setTextContent("summary", "La sección 'Acerca de mí' no está disponible para este idioma.");
        this.setImageAttributes("profile-image", "./assets/fotoperfil.webp", "Imagen de perfil no disponible", true);
    }
    this.createPrintContactLineInAbout(data);
  },

  populateContactActions(data, texts) {
    const contactSection = document.getElementById("contact");
    const contactIntroP = contactSection ? contactSection.querySelector('p.text-slate-300') : null;
    if (!contactSection || !contactIntroP) {
        Logger.warn("populateContactActions: Elementos de la sección de contacto no encontrados.");
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
                    Logger.error('Fallo al copiar el correo: ', err);
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
    this.createPrintContactLineInAbout(data);
  },

/**
 * Renderiza la lista de experiencias laborales.
 * @param {Array<Object>} experienceData - Array de objetos con role, company, dates, description.
 */
  populateExperience(experienceData) {
    const experienceList = document.getElementById("experience-list");
    if (!experienceData || !experienceList) { return; }
    experienceData.forEach(job => {
        const div = document.createElement("div");
        div.className = "p-6 bg-[#111a22] rounded-xl shadow-lg";
        // Une el array con saltos de línea
        const descriptionText = job.description.join('\n');
        div.innerHTML = `<h3 class="text-white text-xl font-semibold">${job.role || ''}</h3><p class="text-slate-400 text-sm">${job.company || ''} \u2022 ${job.dates || ''}</p><p class="text-slate-300 text-base mt-2 whitespace-pre-line">${descriptionText}</p>`;
        experienceList.appendChild(div);
    });
  },

  /**
   * Puebla la sección de proyectos.
   * @param {Array<Object>} projectsData - Array de objetos de proyecto.
   * @param {Object} texts - Objeto de traducciones para el texto del enlace al repositorio y la etiqueta de URL para impresión.
   */
  populateProjects(projectsData, texts) {
    const projectList = document.getElementById("project-list");
    if (!projectsData || !projectList) {
        if (!projectList) Logger.warn("populateProjects: Elemento 'project-list' no encontrado.");
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
    // Alineación vertical de las tarjetas de proyectos
    this.alignProjectCards();
  },

  populateSkills(skillsData, language, languagesData) {
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
  },

  populateLanguages(languagesData) {
    const languageProficiencyList = document.getElementById("language-list");
    if (!languagesData || !languageProficiencyList) { return; }
    languagesData.forEach(lang => {
        const div = document.createElement("div");
        div.className = "flex flex-col gap-2 p-6 bg-[#111a22] rounded-xl shadow-lg";
        div.innerHTML = `<div class="flex gap-4 justify-between items-center"><p class="text-white text-lg font-medium">${lang.language || ''}</p><p class="text-slate-300 text-sm">${lang.level || ''}</p></div><div class="rounded-full h-3 bg-[#344d65] overflow-hidden" role="progressbar" aria-valuenow="${lang.progress || 0}" aria-valuemin="0" aria-valuemax="100" aria-label="Proficiency level for ${lang.language || 'Unknown language'}"><div class="h-3 rounded-full progress-bar-fill" style="width: ${lang.progress || 0}%"></div></div>`;
        languageProficiencyList.appendChild(div);
    });
  },

  populateEducation(educationData) {
    const educationList = document.getElementById("education-list");
    if (!educationData || !educationList) { return; }
    educationData.forEach(edu => {
        const div = document.createElement("div");
        div.className = "p-6 bg-[#111a22] rounded-xl shadow-lg";
        div.innerHTML = `<h3 class="text-white text-xl font-semibold">${edu.degree || ''}</h3><p class="text-slate-400 text-sm">${edu.institution || ''} \u2022 ${edu.dates || ''}</p><p class="text-slate-300 text-base mt-2 no-print">${edu.details || ''}</p>`;
        educationList.appendChild(div);
    });
  },

  populatePublications(publicationsData, texts) {
    const publicationsSection = document.getElementById("publications");
    const publicationList = document.getElementById("publication-list");
    // Si no hay datos o la lista está vacía, ocultar la sección
    if (!publicationsData || publicationsData.length === 0) {
        if (publicationsSection) { publicationsSection.classList.add('hidden'); }
        return;
    }
    // Mostrar la sección si hay datos
    if (publicationsSection) { publicationsSection.classList.remove('hidden'); }
    // Verificar que publicationList existe antes de usarlo
    if (!publicationList) {
        Logger.warn("populatePublications: Elemento 'publication-list' no encontrado.");
        return;
    }
    publicationsData.forEach(publication => {
        const publicationCard = document.createElement("div");
        publicationCard.className = "p-6 bg-[#111a22] rounded-xl shadow-lg";
        // Construir HTML para web (con enlace clickeable)
        const webContent = `
            <h3 class="text-white text-xl font-semibold mb-2">${publication.title || ''}</h3>
            <p class="text-slate-400 text-sm mb-2">${publication.journal || ''} \u2022 ${publication.date || ''}</p>
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
            printUrlElement.className = 'hidden print-only-publication-url';
            printUrlElement.textContent = `${texts.publicationUrlLabelPrint || 'DOI:'} ${publication.doiUrl}`;
            publicationCard.appendChild(printUrlElement);
        }
        publicationList.appendChild(publicationCard);
    });
  },

  populateCertifications(certificationsData) {
    const certificationSection = document.getElementById("certifications");
    const certificationList = document.getElementById("certification-list");
    // Si no hay datos o la lista está vacía, ocultar la sección
    if (!certificationsData || certificationsData.length === 0) {
        if (certificationSection) {
            certificationSection.classList.add('hidden');
        }
        return;
    }
    // Mostrar la sección si hay datos
    if (certificationSection) {
        certificationSection.classList.remove('hidden');
    }
    // Verificar que certificationList existe antes de usarlo
    if (!certificationList) {
        Logger.warn("populateCertifications: Elemento 'certification-list' no encontrado.");
        return;
    }
    certificationsData.forEach(cert => {
        const div = document.createElement("div");
        div.className = "p-6 bg-[#111a22] rounded-xl shadow-lg";
        div.innerHTML = `<h3 class="text-white text-xl font-semibold">${cert.title || ''}</h3><p class="text-slate-400 text-sm">${cert.issuer || ''} \u2022 Issued: ${cert.date || ''}</p>${cert.description ? `<p class="text-slate-300 text-base mt-2">${cert.description}</p>` : ''}`;
        certificationList.appendChild(div);
    });
  },

  createPrintContactLineInAbout(data) {
    // Remover TODAS las líneas de contacto existentes (tanto por ID como por clase)
    const existingContactLines = document.querySelectorAll('.print-contact-line, #print-contact-line');
    existingContactLines.forEach(line => line.remove());
    // Verificar si tenemos datos de contacto
    const hasContactData = (data.contact && (data.contact.email || data.contact.phone)) || data.githubProfileUrl;
    if (!hasContactData) {
        Logger.warn('createPrintContactLineInAbout: No hay datos de contacto disponibles');
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
    contactLine.textContent = contactElements.join(' \u2022 '); // Separador " • "
    // Insertar después del elemento name
    const nameElement = document.getElementById('name');
    if (nameElement && nameElement.parentNode) {
        nameElement.parentNode.insertBefore(contactLine, nameElement.nextSibling);
    } else {
        Logger.warn('createPrintContactLineInAbout: Elemento name o su contenedor padre no encontrado');
        // Fallback al contenedor about
        const aboutSection = document.getElementById('about');
        if (aboutSection) { aboutSection.appendChild(contactLine); }
        else {
            Logger.warn('createPrintContactLineInAbout: No se pudo insertar la línea de contacto - elementos contenedores no encontrados');
        }
    }
  },

  alignProjectCards() {
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
}
export default DOMRenderer;