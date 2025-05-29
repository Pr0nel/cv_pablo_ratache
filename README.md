# Pablo Ratache - Sitio Web Personal

Este repositorio contiene el código fuente del sitio web personal de Pablo Ratache.
El sitio muestra las habilidades de Pablo, su experiencia profesional, proyectos, educación y certificaciones.

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Styling:** Tailwind CSS (con algo de CSS personalizado en `style.css`)
- **Data Management:** El contenido del currículum se carga dinámicamente desde `data/resume.json`.

## Descripción General

El sitio es una aplicación de página única. El contenido de varias secciones como "About Me", "Experience", "Projects", "Skills", etc., se rellena mediante `script.js` que obtiene los datos de `data/resume.json`.

El sitio también incluye estilos optimizados para impresión (`@media print` in `style.css`) para generar una salida similar a un CV ATG-compatible cuando se imprime.

## Cómo se Gestiona el Contenido

Todos los datos textuales y estructurales del portafolio (experience, project details, skills, etc.) están almacenados en `data/resume.json`. Para actualizar el contenido del sitio web, principalmente debes modificar el archivo JSON. El JavaScript en `script.js` se encargará de renderizar dinámicamente la información actualizada en la página web.
