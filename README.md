# Pablo Ratache - Sitio Web Personal / Personal Portfolio Website

Este repositorio contiene el código fuente del sitio web personal de Pablo Ratache.
El sitio muestra las habilidades de Pablo, su experiencia profesional, proyectos, educación y certificaciones.

This repository contains the source code for Pablo Ratache's personal portfolio website.
The website showcases Pablo's skills, professional experience, projects, education, and certifications.

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Styling:** Tailwind CSS (con algo de CSS personalizado en `style.css`)
- **Data Management:** El contenido del currículum se carga dinámicamente desde `data/resume_en.json` y `data/resume_es.json`.

## Descripción General / Overview

El sitio es una aplicación de página única. El contenido de varias secciones como "About Me", "Experience", "Projects", "Skills", etc., se rellena mediante `script.js` que obtiene los datos de `data/resume_en.json` o `data/resume_es.json` (dependiendo del idioma seleccionado).

El sitio también incluye estilos optimizados para impresión (`@media print` in `style.css`) para generar una salida similar a un CV ATG-compatible cuando se imprime.

The website is a single-page application. The content for various sections like "About Me", "Experience", "Projects", "Skills", etc., is populated by `script.js` which fetches data from `data/resume_en.json` o `data/resume_es.json` (dependiendo del idioma seleccionado).

The site also includes print-friendly styles (`@media print` in `style.css`) to generate a CV-like output when printed.

## Cómo se Gestiona el Contenido / How Content is Managed

Todos los datos textuales y estructurales del portafolio (experience, project details, skills, etc.) están almacenados en `data/resume_en.json` y `data/resume_es.json`. Para actualizar el contenido del sitio web, principalmente debes modificar estos archivos JSON. El JavaScript en `script.js` se encargará de renderizar dinámicamente la información actualizada en la página web.

All the textual and structural data for the portfolio (experience, project details, skills, etc.) is stored in `data/resume_en.json` and `data/resume_es.json`. To update the content of the website, you primarily need to modify these JSON files. The JavaScript in `script.js` will then dynamically render the updated information on the webpage.

---

## Licencia

Todo el contenido de este repositorio está disponible bajo la licencia [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0). Esto significa que eres libre de usar, compartir y adaptar este material para fines no comerciales, siempre y cuando des la atribución adecuada y cualquier obra derivada se distribuya bajo la misma licencia.
