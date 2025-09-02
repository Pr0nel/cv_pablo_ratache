# Pablo Ratache - Sitio Web Personal / Personal Portfolio Website

Este repositorio contiene el código fuente del sitio web personal de Pablo Ratache.
El sitio muestra las habilidades, experiencia profesional, proyectos y educación.

This repository contains the source code for Pablo Ratache's personal portfolio website.
The site showcases skills, professional experience, projects, and education.

## 🚀 Live Demo
[pr0nel.github.io/cv_pablo_ratache/](URL)

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Styling:** Tailwind CSS (con algo de CSS personalizado en `src/input.css`)
- **Data Management:** El contenido del currículum se carga dinámicamente desde `data/resume_en.json` y `data/resume_es.json`.

- **Frontend:** HTML, CSS, JavaScript
- **Styling:** Tailwind CSS (with some custom CSS in `src/input.css`)
- **Data Management:** Resume content is dynamically loaded from `data/resume_en.json` and `data/resume_es.json`.

## Performance
- Lighthouse Score: 95+
- Load time: <2s
- Mobile optimized

## 🏗️ Build Process
```npm install && npm run build```

## Descripción General / Overview

El sitio es una aplicación de página única. El contenido de varias secciones como "About Me", "Experience", "Projects", "Skills", etc., se rellena mediante `script.js` que obtiene los datos de `data/resume_en.json` o `data/resume_es.json` (dependiendo del idioma seleccionado).

El sitio también incluye estilos optimizados para impresión (`@media print` in `src/input.css`) y para generar una salida similar a un CV ATS-compatible cuando se imprime (ATS: Applicant Tracking System).

The site is a single-page application. The content of various sections such as "About Me," "Experience," "Projects," "Skills," etc., is populated using `script.js` that retrieves data from `data/resume_en.json` or `data/resume_es.json` (depending on the selected language).

The site also includes print-optimized styles (`@media print` in `src/input.css`) to generate output similar to an ATS-compatible resume when printed (ATS: Applicant Tracking System).

## Cómo se Gestiona el Contenido / How Content is Managed

Todos los datos textuales y estructurales del portafolio (experience, project details, skills, etc.) están almacenados en `data/resume_en.json` y `data/resume_es.json`. Para actualizar el contenido del sitio web, principalmente debes modificar estos archivos JSON. El JavaScript en `script.js` se encargará de renderizar dinámicamente la información actualizada en la página web.

All textual and structural portfolio data (experience, project details, skills, etc.) is stored in `data/resume_en.json` and `data/resume_es.json`. To update the website content, you must primarily modify these JSON files. The JavaScript in `script.js` will dynamically render the updated information on the web page.

---

## Licencia / License

Todo el contenido de este repositorio está disponible bajo la licencia [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0). Esto significa que eres libre de usar, compartir y adaptar este material para fines no comerciales, siempre y cuando des la atribución adecuada y cualquier obra derivada se distribuya bajo la misma licencia.

All content in this repository is available under the license [Apache License, Version 2.0] (http://www.apache.org/licenses/LICENSE-2.0). This means you are free to use, share, and adapt this material for non-commercial purposes, as long as you give proper attribution and any derivative works are distributed under the same license.