fetch('data/resume.json')
  .then(res => res.json())
  .then(data => {
    // About Section
    document.getElementById("name").textContent = data.name;
    document.getElementById("title").textContent = data.title;
    document.getElementById("summary").textContent = data.about.summary;
    document.getElementById("profile-image").src = data.about.image;
    document.getElementById("profile-image").alt = "Foto de perfil de " + data.name;

    // Email link
    document.getElementById("email-link").href = "mailto:" + data.contact.email;

    // Experience
    const experienceList = document.getElementById("experience-list");
    data.experience.forEach(job => {
      const div = document.createElement("div");
      div.className = "p-6 bg-[#111a22] rounded-xl shadow-lg";
      div.innerHTML = `
        <h3 class="text-white text-xl font-semibold">${job.role}</h3>
        <p class="text-slate-400 text-sm">${job.company} | ${job.dates}</p>
        <p class="text-slate-300 text-base mt-2">${job.description}</p>
      `;
      experienceList.appendChild(div);
    });

    // Projects
    const projectList = document.getElementById("project-list");
    data.projects.forEach(project => {
      const div = document.createElement("div");
      div.className = "flex flex-col gap-4 p-6 bg-[#111a22] rounded-xl shadow-lg";
      div.innerHTML = `
        <img src="${project.image}" alt="${project.title}" class="w-full aspect-video rounded-lg object-cover">
        <h3 class="text-white text-xl font-semibold">${project.title}</h3>
        <p class="text-slate-400 text-sm">${project.description}</p>
      `;
      projectList.appendChild(div);
    });

    // Skills
    const skillsSection = document.getElementById("skills-section");
    const skillTypes = ['languages', 'tools', 'concepts'];
    skillTypes.forEach(type => {
      const container = document.createElement("div");
      container.innerHTML = `
        <h3 class="text-[#197fe5] text-2xl font-semibold mb-6">${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
        <div class="space-y-6" id="skills-${type}"></div>
      `;
      skillsSection.appendChild(container);

      const list = document.getElementById(`skills-${type}`);
      data.skills[type].forEach(skill => {
        const div = document.createElement("div");
        div.className = "flex flex-col gap-2";
        div.innerHTML = `
          <div class="flex gap-4 justify-between items-center">
            <p class="text-white text-lg font-medium">${skill.name}</p>
            <p class="text-slate-300 text-sm">${skill.level}%</p>
          </div>
          <div class="rounded-full h-3 bg-[#344d65] overflow-hidden"
               role="progressbar"
               aria-valuenow="${skill.level}"
               aria-valuemin="0"
               aria-valuemax="100"
               aria-label="Skill level for ${skill.name}">
            <div class="h-3 rounded-full progress-bar-fill" style="width: ${skill.level}%"></div>
          </div>
        `;
        list.appendChild(div);
      });
    });

    // Languages
    const languageList = document.getElementById("language-list");
    data.languages.forEach(lang => {
      const div = document.createElement("div");
      div.className = "flex flex-col gap-2 p-6 bg-[#111a22] rounded-xl shadow-lg";
      div.innerHTML = `
        <div class="flex gap-4 justify-between items-center">
          <p class="text-white text-lg font-medium">${lang.language}</p>
          <p class="text-slate-300 text-sm">${lang.level}</p>
        </div>
        <div class="rounded-full h-3 bg-[#344d65] overflow-hidden"
             role="progressbar"
             aria-valuenow="${lang.progress}"
             aria-valuemin="0"
             aria-valuemax="100"
             aria-label="Proficiency level for ${lang.language}">
          <div class="h-3 rounded-full progress-bar-fill" style="width: ${lang.progress}%"></div>
        </div>
      `;
      languageList.appendChild(div);
    });

    // Education
    const educationList = document.getElementById("education-list");
    data.education.forEach(edu => {
      const div = document.createElement("div");
      div.className = "p-6 bg-[#111a22] rounded-xl shadow-lg";
      div.innerHTML = `
        <h3 class="text-white text-xl font-semibold">${edu.degree}</h3>
        <p class="text-slate-400 text-sm">${edu.institution} | ${edu.dates}</p>
        <p class="text-slate-300 text-base mt-2">${edu.details}</p>
      `;
      educationList.appendChild(div);
    });

    // Certifications
    const certificationList = document.getElementById("certification-list");
    data.certifications.forEach(cert => {
      const div = document.createElement("div");
      div.className = "p-6 bg-[#111a22] rounded-xl shadow-lg";
      div.innerHTML = `
        <h3 class="text-white text-xl font-semibold">${cert.title}</h3>
        <p class="text-slate-400 text-sm">${cert.issuer} | Issued: ${cert.date}</p>
        <p class="text-slate-300 text-base mt-2">${cert.description}</p>
      `;
      certificationList.appendChild(div);
    });
  })
  .catch(error => {
    console.error('Error loading resume data:', error);
    const errorDiv = document.createElement('div');
    errorDiv.textContent = 'No se pudieron cargar los datos del CV. Intente actualizar la página o contacte con el servicio de asistencia.';
    errorDiv.style.color = 'red';
    errorDiv.style.padding = '20px';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.backgroundColor = '#fff0f0'; // Light red background
    document.body.prepend(errorDiv); // Prepend to make it more visible
  });