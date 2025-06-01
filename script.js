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

// Carga y muestra toda la información del currículum para el idioma seleccionado.
function loadResumeData(language) {
  const filePath = `data/resume_${language}.json`;

  // 1. Limpiar todas las áreas de contenido dinámico antes de obtener nuevos datos
  setTextContent("name", "");
  setTextContent("title", "");
  setTextContent("summary", "Loading content...");
  setImageAttributes("profile-image", "", "Loading profile image");
  // setLinkHref("email-link", "#"); // No longer needed here, email-link is fully dynamic

  // Remove existing GitHub profile link (old ID from About Me)
  const oldGitHubLink = document.getElementById("github-profile-link");
  if (oldGitHubLink) {
    oldGitHubLink.remove();
  }
  // Remove existing Copy Email button (old ID from About Me)
  const oldCopyEmailButton = document.getElementById("copy-email-button");
  if (oldCopyEmailButton) {
    oldCopyEmailButton.remove();
  }
  // Remove contact-links-container from About me section if it exists
  const oldContactLinksContainer = document.getElementById("contact-links-container");
  if (oldContactLinksContainer && oldContactLinksContainer.parentNode.id === 'about-text-content') {
      oldContactLinksContainer.remove();
  }

  // Cleanup for new buttons in Contact section
  const githubContactLink = document.getElementById("github-contact-link");
  if (githubContactLink) {
    githubContactLink.remove();
  }
  const copyEmailContactButton = document.getElementById("copy-email-contact-button");
  if (copyEmailContactButton) {
    copyEmailContactButton.remove();
  }
  // Cleanup for the new container in the Contact section
  const contactActionsContainer = document.getElementById("contact-actions-container");
  if (contactActionsContainer) {
    contactActionsContainer.innerHTML = ''; // Clear its content before repopulating
  }


  clearElementInnerHTML("experience-list");
  clearElementInnerHTML("project-list");
  clearElementInnerHTML("skills-section");
  clearElementInnerHTML("language-list");
  clearElementInnerHTML("education-list");
  clearElementInnerHTML("certification-list");

  let errorDisplay = document.getElementById('error-display-container');
  if (!errorDisplay) {
    errorDisplay = document.createElement('div');
    errorDisplay.id = 'error-display-container';
    errorDisplay.style.cssText = 'color:red; padding:20px; text-align:center; background-color:#fff0f0; margin-top: 20px;';
    const mainArea = document.querySelector('main');
    if (mainArea) mainArea.prepend(errorDisplay); else document.body.prepend(errorDisplay);
  }
  errorDisplay.style.display = 'none';

  // Obtiene los datos del currículum desde el archivo JSON correspondiente.
  fetch(filePath)
    .then(res => {
      if (!res.ok) {
        errorDisplay.textContent = `Error: Could not load data for ${language} (Status: ${res.status}). File may be missing or not accessible.`;
        errorDisplay.style.display = 'block';
        setTextContent("summary", `Failed to load content for ${language}. Please try another language or refresh.`);
        throw new Error(`HTTP error! status: ${res.status}, file: ${filePath}`);
      }
      return res.json();
    })
    .then(data => {
      // 2. Poblar todas las secciones con los datos obtenidos
      setTextContent("name", data.name);
      setTextContent("title", data.title);

      if (data.about) {
        setTextContent("summary", data.about.summary);
        setImageAttributes("profile-image", data.about.image, "Profile picture of " + data.name);
      } else {
        setTextContent("summary", "About section summary is not available for this language.");
        setImageAttributes("profile-image", "assets/profile_placeholder.png", "Placeholder profile image");
      }

      // The primary setLinkHref for "email-link" is now handled during its dynamic creation below.
      // However, if data.contact.email is missing, we need to ensure the link is either not created
      // or handled gracefully. The creation logic below already checks for data.contact.email.

      // Create contact actions (Email, GitHub, Copy Email) in the Contact section
      const contactSection = document.getElementById("contact");
      const contactIntroP = contactSection ? contactSection.querySelector('p.text-slate-300') : null;

      if (contactSection && contactIntroP) {
        let actionsContainer = document.getElementById("contact-actions-container");
        if (!actionsContainer) {
          actionsContainer = document.createElement("div");
          actionsContainer.id = "contact-actions-container";
          actionsContainer.className = "mt-6 flex flex-wrap justify-center items-center gap-4";
          contactIntroP.parentNode.insertBefore(actionsContainer, contactIntroP.nextSibling);
        }
        // Dynamically create the "Email Me" link
        if (data.contact && data.contact.email) {
          const emailLinkElement = document.createElement("a");
          emailLinkElement.id = "email-link";
          emailLinkElement.href = "mailto:" + data.contact.email;
          emailLinkElement.className = "btn-hover inline-flex min-w-[84px] max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-gradient-to-r from-[#197fe5] to-[#3b8dff] text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em] shadow-lg hover:shadow-xl no-print";
          // emailLinkElement.textContent will be set by the translation logic later
          actionsContainer.appendChild(emailLinkElement);
        } else {
          // Optionally, if email is critical, display a placeholder or log that it's missing
          // For now, if no email, the link just won't be created.
          // Ensure that setLinkHref("email-link", "mailto:contact-not-available@example.com"); from above is removed or conditional.
          // And ensure setTextContent('email-link', texts.emailLinkText) handles missing element.
           const emailLinkPlaceholder = document.getElementById("email-link");
           if(emailLinkPlaceholder) emailLinkPlaceholder.remove(); // Remove if a static one was somehow left in HTML
        }

        // GitHub Profile Button (Contact Section)
        if (data.githubProfileUrl) {
          const githubContactButton = document.createElement("a");
          githubContactButton.id = "github-contact-link"; // New ID
          githubContactButton.href = data.githubProfileUrl;
          githubContactButton.target = "_blank";
          githubContactButton.rel = "noopener noreferrer";
          githubContactButton.className = "btn-hover inline-flex min-w-[84px] max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em] shadow-lg no-print bg-[#197fe5] hover:bg-[#156abc] transition-colors duration-300";
          // textContent will be set by translation logic using GITHUB_ICON_SVG
          actionsContainer.appendChild(githubContactButton);
        }

        // Copy Email Button (Contact Section)
        if (data.contact && data.contact.email) {
          const copyEmailContactBtn = document.createElement("button");
          copyEmailContactBtn.id = "copy-email-contact-button"; // New ID
          copyEmailContactBtn.className = "btn-hover inline-flex min-w-[84px] max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em] shadow-lg no-print bg-slate-500 hover:bg-slate-600 transition-colors duration-300";
          // textContent will be set by translation logic

          copyEmailContactBtn.addEventListener('click', () => {
            const texts = staticTextConfig[language] || staticTextConfig.en; // Ensure access to translations
            navigator.clipboard.writeText(data.contact.email)
              .then(() => {
                copyEmailContactBtn.innerHTML = texts.copyEmailButtonSuccessText || "Email Copied!";
                setTimeout(() => {
                  copyEmailContactBtn.innerHTML = texts.copyEmailButtonText || "Copy Email";
                }, 2000);
              })
              .catch(err => {
                console.error('Failed to copy email: ', err);
                copyEmailContactBtn.innerHTML = texts.copyEmailButtonFailText || "Copy Failed";
                setTimeout(() => {
                  copyEmailContactBtn.innerHTML = texts.copyEmailButtonText || "Copy Email";
                }, 2000);
              });
          });
          actionsContainer.appendChild(copyEmailContactBtn);
        }
      } else {
        if (!contactSection) console.warn("Contact section not found.");
        if (!contactIntroP) console.warn("Contact intro paragraph not found for placing actions container.");
      }

      // Experiencia
      const experienceList = document.getElementById("experience-list");
      if (data.experience && experienceList) {
        data.experience.forEach(job => {
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

      // Proyectos
      const projectList = document.getElementById("project-list");
      if (data.projects && projectList) {
        data.projects.forEach(project => {
          const div = document.createElement("div");
          div.className = "flex flex-col gap-4 p-6 bg-[#111a22] rounded-xl shadow-lg";
          const projectImage = project.image || 'https://via.placeholder.com/600x400.png?text=Image+Not+Available';
          const projectTitle = project.title || 'Project Image';
          div.innerHTML = `
            <img src="${projectImage}" alt="${projectTitle}" class="w-full aspect-video rounded-lg object-cover" onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400.png?text=Project+Image+Not+Found'; console.error('Error loading image for project: ${projectTitle} at ${projectImage}');">
            <h3 class="text-white text-xl font-semibold">${project.title || ''}</h3>
            <p class="text-slate-400 text-sm">${project.description || ''}</p>
            ${project.repositoryUrl ? `<a href="${project.repositoryUrl}" target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex items-center text-[#197fe5] hover:text-[#3b8dff] transition-colors duration-300 no-print project-repo-link">View Code</a>` : ''}
          `;
          projectList.appendChild(div);
        });
      }

      // Habilidades
      const skillsSection = document.getElementById("skills-section");
      if (data.skills && skillsSection) {
        const skillCategories = [
          { key: 'languages', title_en: 'Programming Languages', title_es: 'Lenguajes de Programación' },
          { key: 'tools', title_en: 'Tools', title_es: 'Herramientas' },
          { key: 'concepts', title_en: 'Concepts', title_es: 'Conceptos' }
        ];
        skillCategories.forEach(category => {
          if (data.skills[category.key] && data.skills[category.key].length > 0) {
            const container = document.createElement("div");
            const sectionTitleText = (language === 'es' ? category.title_es : category.title_en) || category.key.charAt(0).toUpperCase() + category.key.slice(1);
            container.innerHTML = `<h3 class="text-[#197fe5] text-2xl font-semibold mb-6">${sectionTitleText}</h3><div class="space-y-6" id="skills-${category.key}"></div>`;
            skillsSection.appendChild(container);
            const listElement = document.getElementById(`skills-${category.key}`);
            if (listElement) {
              data.skills[category.key].forEach(skill => {
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

      // Competencias en idiomas
      const languageProficiencyList = document.getElementById("language-list");
      if (data.languages && languageProficiencyList) {
        data.languages.forEach(lang => {
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

      // Educación
      const educationList = document.getElementById("education-list");
      if (data.education && educationList) {
        data.education.forEach(edu => {
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

      // Certificaciones
      const certificationList = document.getElementById("certification-list");
      if (data.certifications && certificationList) {
        data.certifications.forEach(cert => {
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

      // 3. Traducir elementos de texto estático (Navegación, Títulos de Sección, Botones, etc.)
      const staticTextConfig = {
        es: {
          navAbout: 'Acerca de', navExperience: 'Experiencia', navProjects: 'Proyectos', navSkills: 'Habilidades', navLanguages: 'Idiomas', navEducation: 'Educación', navCertifications: 'Certificaciones', navContact: 'Contacto', printCV: 'Imprimir CV',
          titleExperience: 'Experiencia Laboral', titleProjects: 'Mis Proyectos', titleSkills: 'Habilidades Técnicas', titleLanguages: 'Idiomas', titleEducation: 'Educación', titleCertifications: 'Certificaciones',
          contactTitle: 'Ponte en Contacto', contactIntro: 'Actualmente estoy buscando nuevas oportunidades. Si tienes alguna pregunta o simplemente quieres saludar, ¡no dudes en contactarme!', emailLinkText: 'Envíame un Correo',
          copyEmailButtonText: 'Copiar Correo', copyEmailButtonSuccessText: '¡Correo Copiado!', copyEmailButtonFailText: 'Error al Copiar',
          projectRepoLinkText: 'Ver Código', // Text for project repo links
          githubProfileLinkText: 'Perfil de GitHub', // Text for the main GitHub profile button
          profileImageAlt: "Foto de perfil de " + (data.name || "el usuario")
        },
        en: {
          navAbout: 'About', navExperience: 'Experience', navProjects: 'Projects', navSkills: 'Skills', navLanguages: 'Languages', navEducation: 'Education', navCertifications: 'Certifications', navContact: 'Contact', printCV: 'Print CV',
          titleExperience: 'Work Experience', titleProjects: 'My Projects', titleSkills: 'Technical Skills', titleLanguages: 'Languages', titleEducation: 'Education', titleCertifications: 'Certifications',
          contactTitle: 'Get In Touch', contactIntro: "I'm currently looking for new opportunities. Whether you have a question or just want to say hi, feel free to reach out!", emailLinkText: 'Email Me',
          copyEmailButtonText: 'Copy Email', copyEmailButtonSuccessText: 'Email Copied!', copyEmailButtonFailText: 'Copy Failed',
          projectRepoLinkText: 'View Code', // Text for project repo links
          githubProfileLinkText: 'GitHub Profile', // Text for the main GitHub profile button
          profileImageAlt: "Profile picture of " + (data.name || "the user")
        }
      };
      const texts = staticTextConfig[language] || staticTextConfig.en; // Por defecto a Inglés si no se encuentra el idioma

      // Set initial text for Copy Email button (new ID, new location)
      const newCopyEmailButton = document.getElementById("copy-email-contact-button");
      if (newCopyEmailButton) {
        newCopyEmailButton.innerHTML = texts.copyEmailButtonText || "Copy Email"; // Use innerHTML if icon is planned, else textContent
      }

      // Set text for GitHub Profile link (new ID, new location)
      const newGithubProfileLink = document.getElementById("github-contact-link");
      if (newGithubProfileLink) {
        newGithubProfileLink.innerHTML = GITHUB_ICON_SVG + (texts.githubProfileLinkText || "GitHub Profile");
      }

      // Update project repo link texts and prepend icon (no change here, already correct)
      const projectRepoLinks = document.querySelectorAll(".project-repo-link");
      projectRepoLinks.forEach(link => {
        link.innerHTML = GITHUB_ICON_SVG + (texts.projectRepoLinkText || "View Code");
      });

      const setQueryText = (selector, text) => { const el = document.querySelector(selector); if (el) el.textContent = text; else console.warn(`Static text element not found for selector: ${selector}`);};

      setQueryText('a[href="#about"]', texts.navAbout);
      setQueryText('a[href="#experience"]', texts.navExperience);
      setQueryText('a[href="#projects"]', texts.navProjects);
      setQueryText('a[href="#skills"]', texts.navSkills);
      setQueryText('a[href="#languages"]', texts.navLanguages);
      setQueryText('a[href="#education"]', texts.navEducation);
      setQueryText('a[href="#certifications"]', texts.navCertifications);
      setQueryText('a[href="#contact"]', texts.navContact);
      setTextContent('print-cv-button', texts.printCV);

      setQueryText('section#experience h2', texts.titleExperience);
      setQueryText('section#projects h2', texts.titleProjects);
      setQueryText('section#skills h2', texts.titleSkills); // Título principal para el área de habilidades
      setQueryText('section#languages h2', texts.titleLanguages);
      setQueryText('section#education h2', texts.titleEducation);
      setQueryText('section#certifications h2', texts.titleCertifications);

      setQueryText('#contact h2', texts.contactTitle);
      setQueryText('#contact p.text-slate-300', texts.contactIntro);
      setTextContent('email-link', texts.emailLinkText);


      // Update copy email button text on language change (if button exists and text needs to change)
      // This is slightly redundant if the button text is set when created using `texts.copyEmailButtonText`
      // However, this ensures it's updated if it was somehow created with a default before `texts` was available.
      // The main setting of text happens during button creation now.

      // Actualizar el texto alternativo de la imagen de perfil específicamente
      const profileImg = document.getElementById("profile-image");
      if (profileImg) profileImg.alt = texts.profileImageAlt;

      // Traducir enlaces de navegación en el menú lateral
      const sideMenuNavLinks = document.querySelectorAll('#side-menu nav a[data-translate-key]');
      sideMenuNavLinks.forEach(link => {
        const key = link.dataset.translateKey; // e.g., "navAbout"
        if (texts && texts[key]) { // 'texts' is from staticTextConfig[language]
          link.textContent = texts[key];
        } else {
          console.warn(`Translation key "${key}" not found for language "${language}" in side menu static texts.`);
          // Optionally, keep the original text or set a default: link.textContent = link.dataset.originalText || key;
        }
      });

    })
    .catch(error => {
      console.error(`Error in loadResumeData for ${language}:`, error.message);
      setTextContent("summary", `An error occurred while loading content for ${language}. Details in console.`);
      if (errorDisplay) {
        errorDisplay.textContent = `A general error occurred loading data for ${language}. Please check console.`;
        errorDisplay.style.display = 'block';
      }
    });
}

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