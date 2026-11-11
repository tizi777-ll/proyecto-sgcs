# SGCS – Sistemas de gestión de calidad

Sitio educativo sobre calidad del software, procesos de desarrollo y metodologías ágiles.
Hecho con **HTML, CSS y JavaScript** (sin librerías).

## Cómo verlo
Abrir `index.html` con el navegador.

## Estructura
```
index.html            → página (todas las secciones)
css/estilos.css       → estilos y diseño adaptable
js/script.js          → funciones interactivas (separadas por historia de usuario)
img/                  → diagramas en SVG
pruebas/pruebas.js    → 40 pruebas automáticas
pruebas/casos-de-prueba.md → plan de pruebas
pruebas/capturas/     → capturas en Desktop, Tablet y Mobile
```

## Historias de usuario
| US | Sección | Qué tiene |
|----|---------|-----------|
| 01 | Inicio | Portada, tarjetas, menú hamburguesa, sección activa |
| 02 | Fundamentos | Conceptos, métricas, pestañas ISO 9126 / 25000 |
| 03 | Técnicas | Esquema de niveles, tarjetas que se dan vuelta, cuadro comparativo |
| 04 | Herramientas | Grilla con íconos y filtro por categoría |
| 05 | SDLC | Línea de tiempo paso a paso |
| 06 | Modelos tradicionales | Navegación interna, ventajas (verde) / desventajas (rojo) |
| 07 | Ilustraciones | Diagramas SVG con pie de foto y lightbox |
| 08 | Metodologías ágiles | 4 valores, 12 principios, Scrum/Kanban/XP, índice flotante |
| 09 | Ilustraciones ágiles | Sprint, Kanban y XP con el mismo lightbox |
| 10 | Scrum | Pestañas y cronograma interactivo del sprint |
| 11 | Kanban | Tablero con arrastrar y soltar y límite WIP |
| 12 | Glosario | Buscador en tiempo real e índice A-Z |
| 13 | FAQ | Acordeón animado |
| 14 | Enlaces | Tarjetas por tipo y apertura segura |
| 15 | Ejercicios | Mostrar / ocultar solución |
| 16 | Sobre nosotros | Perfiles con efecto hover |
| 17 | Contacto | Formulario con validación |
| 18 | Comparador | Tabla dinámica según las casillas elegidas |
| 19 | Encuesta | Asistente con barra de progreso y resultado en % |

## Cómo correr las pruebas
```
npm install
npx playwright install chromium
npm test
```
