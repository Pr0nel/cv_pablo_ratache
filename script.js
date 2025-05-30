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
  setLinkHref("email-link", "#");

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

      if (data.contact && data.contact.email) {
        setLinkHref("email-link", "mailto:" + data.contact.email);
      } else {
        setLinkHref("email-link", "mailto:contact-not-available@example.com");
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
          profileImageAlt: "Foto de perfil de " + (data.name || "el usuario")
        },
        en: {
          navAbout: 'About', navExperience: 'Experience', navProjects: 'Projects', navSkills: 'Skills', navLanguages: 'Languages', navEducation: 'Education', navCertifications: 'Certifications', navContact: 'Contact', printCV: 'Print CV',
          titleExperience: 'Work Experience', titleProjects: 'My Projects', titleSkills: 'Technical Skills', titleLanguages: 'Languages', titleEducation: 'Education', titleCertifications: 'Certifications',
          contactTitle: 'Get In Touch', contactIntro: "I'm currently looking for new opportunities. Whether you have a question or just want to say hi, feel free to reach out!", emailLinkText: 'Email Me',
          profileImageAlt: "Profile picture of " + (data.name || "the user")
        }
      };
      const texts = staticTextConfig[language] || staticTextConfig.en; // Por defecto a Inglés si no se encuentra el idioma

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
      
      // Actualizar el texto alternativo de la imagen de perfil específicamente
      const profileImg = document.getElementById("profile-image");
      if (profileImg) profileImg.alt = texts.profileImageAlt;

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
});