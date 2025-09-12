// js/utils/constants.js
// --- Objeto de Configuración para Textos Estáticos y Traducciones ---
export const staticTextConfig = {
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
export const GITHUB_ICON_SVG = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="w-5 h-5 mr-2"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>';