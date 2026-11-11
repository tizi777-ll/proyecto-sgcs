# Plan y casos de prueba – SGCS

**Proyecto:** Sistemas de gestión de calidad (SGCS)
**Herramienta:** Playwright (Chromium) – archivo `pruebas/pruebas.js`
**Resoluciones probadas:** Desktop 1366×768 · Tablet 768×1024 · Mobile 375×667
**Resultado:** 40 de 40 casos aprobados (detalle en `pruebas/resultados.json`, capturas en `pruebas/capturas/`)

| ID | Historia | Caso de prueba | Resultado esperado | Estado |
|----|----------|----------------|--------------------|--------|
| CP-01 | US-01 | Revisar todos los enlaces `#` | Todos llevan a un elemento existente | ✔ |
| CP-02 | US-01 | Clic en "Ver sección" de una tarjeta | La sección queda arriba de la pantalla | ✔ |
| CP-03 | US-01 | Menú hamburguesa en 375px | Empieza cerrado, abre y cierra, `aria-expanded` cambia | ✔ |
| CP-04 | US-01 | Bajar hasta Recursos | El menú resalta "Recursos y aprendizaje" | ✔ |
| CP-05 | US-01/05 | Cargar en Desktop, Tablet y Mobile | Sin scroll horizontal; el timeline no se desborda | ✔ |
| CP-06 | US-02 | Contar encabezados | Un solo `<h1>` y sin saltos de nivel | ✔ |
| CP-07 | US-02 | Pestañas ISO 9126 / 25000 (clic y flechas) | Cambia el panel visible | ✔ |
| CP-08 | US-03 | Clic en tarjeta de prueba | Se da vuelta y vuelve | ✔ |
| CP-09 | US-03 | Toque en pantalla táctil | Se da vuelta | ✔ |
| CP-10 | US-04 | Probar cada filtro | Bug 3, Linter 3, Pruebas 2, Análisis 2, Todas 10 | ✔ |
| CP-11 | US-05 | Botones Siguiente/Anterior | Etapa actual iluminada, anteriores marcadas | ✔ |
| CP-12 | US-06 | Clic en Cascada / V / Iterativo | Salta al modelo y cambia la URL (#) | ✔ |
| CP-13 | US-06 | Cajas de ventajas y desventajas | 3 verdes y 3 rojas | ✔ |
| CP-14 | US-07/09 | Revisar imágenes | Todas con `alt`, pie de foto y < 20 KB | ✔ |
| CP-15 | US-07/09 | Abrir los 6 diagramas | Lightbox muestra la imagen correcta; cierra con Esc y con × | ✔ |
| CP-16 | US-09 | Pantalla Retina (x2) | Diagramas SVG nítidos (ver `capturas/diagrama-retina.png`) | ✔ |
| CP-17 | US-08 | Contenido del manifiesto | 4 valores, 12 principios y apartados de Scrum, Kanban y XP | ✔ |
| CP-18 | US-08 | Índice: "Roles" de Kanban | Salta al apartado | ✔ |
| CP-19 | US-10 | Pestañas Roles / Eventos / Artefactos | Cambia el panel | ✔ |
| CP-20 | US-10 | Cronograma 1 a 4 semanas | Días = semanas×5; Planning 2 h por semana, Review 1 h por semana, Retro 45 min por semana, Daily 15 min | ✔ |
| CP-21 | US-11 | Mover una 3ra tarjeta a "En proceso" | Se bloquea y aparece aviso de límite WIP | ✔ |
| CP-22 | US-11 | Arrastrar y soltar | La tarjeta cambia de columna | ✔ |
| CP-23 | US-11 | Recargar la página | El tablero se mantiene; "Reiniciar" lo vuelve al inicio | ✔ |
| CP-24 | US-12 | Buscar "sprint", "SPRINT", "métrica"/"metrica" | Mismos resultados | ✔ |
| CP-25 | US-12 | Buscar `<script>`, `((`, `[*+?`, `\`, palabra inexistente | "Sin resultados", sin errores en consola | ✔ |
| CP-26 | US-12 | Índice A-Z | Letras vacías desactivadas, orden alfabético, salto a la letra | ✔ |
| CP-27 | US-13 | Abrir y cerrar una pregunta | Se anima, no tapa otras preguntas ni genera scroll horizontal | ✔ |
| CP-28 | US-14 | Revisar enlaces externos | Todos con `target="_blank"` y `rel="noopener noreferrer"` | ✔ |
| CP-29 | US-15 | Cargar la página | Las soluciones están ocultas; el botón cambia el texto | ✔ |
| CP-30 | US-16 | Pasar el cursor por un perfil | Se destaca; perfiles alineados y con igual altura | ✔ |
| CP-31 | US-17 | Campos del formulario | Todos tienen `<label>` vinculado | ✔ |
| CP-32 | US-17 | Enviar vacío | 4 mensajes de error y foco en el primero | ✔ |
| CP-33 | US-17 | Correos inválidos (`juan`, `juan@`, `@correo.com`, etc.) | Se rechazan; uno válido se acepta | ✔ |
| CP-34 | US-17 | Mensaje solo con espacios | Se rechaza | ✔ |
| CP-35 | US-17 | Nombre con `<b>`, `&`, `"`, `Ñ` | Se muestra como texto; aparece la confirmación | ✔ |
| CP-36 | US-18 | Marcar/desmarcar 0, 1, 2, 4 y 6 metodologías | La tabla aparece con ≥2, columnas correctas, se limpia sin errores | ✔ |
| CP-37 | US-19 | 4 rutas de respuestas (Cascada, Scrum, Kanban, empate) | Ganadora y porcentajes correctos | ✔ |
| CP-38 | US-19 | Usar el asistente | No avanza sin responder; barra 20%→100%; resumen final | ✔ |
| CP-39 | General | Cargar en las 3 resoluciones | Sin errores de JavaScript | ✔ |
| CP-40 | General | Capturas de página completa | Se generan en `pruebas/capturas/` | ✔ |

## Pruebas manuales recomendadas
- **Enlaces externos:** abrir cada enlace de "Enlaces de interés" con internet (las pruebas automáticas no revisan sitios externos).
- **Ortografía (US-02):** revisión de los textos por otro integrante.
- **Fidelidad del contenido (US-08):** comparar con la bibliografía de la materia (Guía de Scrum 2020, Manifiesto Ágil).
- **Celular real:** probar las tarjetas que se dan vuelta y el tablero Kanban con el dedo.
