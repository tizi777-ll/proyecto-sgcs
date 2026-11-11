/* =========================================================
   SGCS - Pruebas automáticas (QA / Tester)
   Cada prueba corresponde a un criterio [QA/Tester] de una historia de usuario.

   Cómo correrlas:
     1) npm install
     2) npx playwright install chromium   (solo la primera vez)
     3) npm test
   ========================================================= */

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const PAGINA = "file://" + path.resolve(__dirname, "..", "index.html").replace(/\\/g, "/");
const CARPETA_CAPTURAS = path.join(__dirname, "capturas");

const RESOLUCIONES = [
    { nombre: "Desktop", ancho: 1366, alto: 768 },
    { nombre: "Tablet", ancho: 768, alto: 1024 },
    { nombre: "Mobile", ancho: 375, alto: 667 }
];

/* ---------- Mini sistema de pruebas ---------- */
const pruebas = [];
const resultados = [];

function prueba(id, nombre, funcion) {
    pruebas.push({ id: id, nombre: nombre, funcion: funcion });
}

function comprobar(condicion, mensaje) {
    if (!condicion) throw new Error(mensaje);
}

function iguales(obtenido, esperado, mensaje) {
    if (JSON.stringify(obtenido) !== JSON.stringify(esperado)) {
        throw new Error(mensaje + " | esperado: " + JSON.stringify(esperado) + " | obtenido: " + JSON.stringify(obtenido));
    }
}

let navegador;
let erroresConsola = [];

// Abre la página nueva en una pestaña limpia
async function abrir(opciones) {
    const contexto = await navegador.newContext(Object.assign({ viewport: { width: 1366, height: 768 }, reducedMotion: "reduce" }, opciones || {}));
    const pagina = await contexto.newPage();
    pagina.on("pageerror", function (e) { erroresConsola.push(e.message); });
    pagina.on("console", function (m) { if (m.type() === "error") erroresConsola.push(m.text()); });
    await pagina.goto(PAGINA);
    return pagina;
}

async function cerrar(pagina) {
    await pagina.context().close();
}


/* =========================================================
   US-01: INICIO
   ========================================================= */
prueba("US-01", "Todos los enlaces internos (#) llevan a un elemento que existe", async function () {
    const p = await abrir();
    const rotos = await p.evaluate(function () {
        return Array.from(document.querySelectorAll('a[href^="#"]'))
            .map(function (a) { return a.getAttribute("href"); })
            .filter(function (href) { return href.length > 1 && !document.getElementById(href.slice(1)); });
    });
    iguales(rotos, [], "Hay enlaces internos rotos");
    await cerrar(p);
});

prueba("US-01", "Las tarjetas de la portada llevan a su sección", async function () {
    const p = await abrir();
    await p.click('.tarjeta a[href="#procesos"]');
    await p.waitForTimeout(900);
    const arriba = await p.evaluate(function () { return document.getElementById("procesos").getBoundingClientRect().top; });
    comprobar(arriba >= 0 && arriba < 150, "La sección Procesos no quedó arriba de la pantalla (top=" + arriba + ")");
    await cerrar(p);
});

prueba("US-01", "Menú hamburguesa: en celular empieza cerrado y se abre/cierra", async function () {
    const p = await abrir({ viewport: { width: 375, height: 667 } });
    comprobar(!(await p.isVisible("#menu")), "En celular el menú debería empezar cerrado");
    await p.click("#botonMenu");
    comprobar(await p.isVisible("#menu"), "El menú no se abrió");
    iguales(await p.getAttribute("#botonMenu", "aria-expanded"), "true", "aria-expanded debería ser true");
    await p.click("#botonMenu");
    comprobar(!(await p.isVisible("#menu")), "El menú no se cerró");

    // menú de la barra fija
    await p.evaluate(function () { window.scrollTo(0, 1500); });
    await p.waitForTimeout(400);
    await p.click("#botonMenuFijo");
    comprobar(await p.isVisible('#menuFijo a[href="#contacto"]'), "El menú de la barra fija no se abrió");
    await cerrar(p);
});

prueba("US-01", "Se resalta en el menú la sección que se está viendo", async function () {
    const p = await abrir();
    await p.evaluate(function () { document.getElementById("recursos").scrollIntoView(); });
    await p.waitForTimeout(500);
    const activo = await p.textContent("#menu a.activo");
    iguales(activo.trim(), "Recursos y aprendizaje", "No se resaltó la sección correcta");
    await cerrar(p);
});

prueba("US-01 / US-05", "Sin desborde horizontal en Desktop, Tablet y Mobile (con capturas)", async function () {
    fs.mkdirSync(CARPETA_CAPTURAS, { recursive: true });
    for (const r of RESOLUCIONES) {
        const p = await abrir({ viewport: { width: r.ancho, height: r.alto } });
        const ancho = await p.evaluate(function () { return document.documentElement.scrollWidth; });
        comprobar(ancho <= r.ancho, r.nombre + ": la página es más ancha que la pantalla (" + ancho + "px > " + r.ancho + "px)");
        const anchoLinea = await p.evaluate(function () { return document.getElementById("lineaTiempo").scrollWidth; });
        const anchoSdlc = await p.evaluate(function () { return document.getElementById("sdlc").clientWidth; });
        comprobar(anchoLinea <= anchoSdlc, r.nombre + ": la línea de tiempo se desborda");
        await p.screenshot({ path: path.join(CARPETA_CAPTURAS, "inicio-" + r.nombre.toLowerCase() + ".png") });
        await cerrar(p);
    }
});


/* =========================================================
   US-02: FUNDAMENTOS
   ========================================================= */
prueba("US-02", "Jerarquía de encabezados: un solo h1 y ningún salto de nivel", async function () {
    const p = await abrir();
    const datos = await p.evaluate(function () {
        const niveles = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map(function (h) { return Number(h.tagName[1]); });
        const saltos = [];
        for (let i = 1; i < niveles.length; i++) {
            if (niveles[i] > niveles[i - 1] + 1) saltos.push(i);
        }
        return { h1: niveles.filter(function (n) { return n === 1; }).length, saltos: saltos };
    });
    iguales(datos.h1, 1, "Debe haber un solo h1");
    iguales(datos.saltos, [], "Hay saltos en la jerarquía de encabezados");
    await cerrar(p);
});

prueba("US-02", "Pestañas ISO 9126 / ISO 25000 cambian el contenido (clic y flechas)", async function () {
    const p = await abrir();
    comprobar(await p.isVisible("#panel-iso9126"), "Al inicio debería verse ISO 9126");
    await p.click("#tab-iso25000");
    comprobar(await p.isVisible("#panel-iso25000"), "No se mostró ISO 25000");
    comprobar(!(await p.isVisible("#panel-iso9126")), "ISO 9126 debería ocultarse");
    await p.focus("#tab-iso25000");
    await p.keyboard.press("ArrowRight");
    comprobar(await p.isVisible("#panel-iso9126"), "La flecha del teclado no cambió de pestaña");
    await cerrar(p);
});


/* =========================================================
   US-03: TÉCNICAS DE ASEGURAMIENTO
   ========================================================= */
prueba("US-03", "Las tarjetas se dan vuelta con clic del mouse", async function () {
    const p = await abrir();
    const tarjeta = p.locator(".tarjeta-giro").first();
    await tarjeta.click();
    iguales(await tarjeta.getAttribute("aria-pressed"), "true", "La tarjeta no se dio vuelta");
    await tarjeta.click();
    iguales(await tarjeta.getAttribute("aria-pressed"), "false", "La tarjeta no volvió");
    await cerrar(p);
});

prueba("US-03", "Las tarjetas se dan vuelta con toque (pantalla táctil)", async function () {
    const p = await abrir({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });
    const tarjeta = p.locator(".tarjeta-giro").nth(3);
    await tarjeta.scrollIntoViewIfNeeded();
    await tarjeta.tap();
    comprobar(await tarjeta.evaluate(function (t) { return t.classList.contains("girada"); }), "El toque no dio vuelta la tarjeta");
    await cerrar(p);
});


/* =========================================================
   US-04: HERRAMIENTAS
   ========================================================= */
prueba("US-04", "Los filtros muestran y ocultan las tarjetas correctas", async function () {
    const p = await abrir();
    const esperado = { bug: 3, linter: 3, pruebas: 2, analisis: 2, todas: 10 };
    for (const categoria of Object.keys(esperado)) {
        await p.click('.filtro[data-filtro="' + categoria + '"]');
        const visibles = await p.evaluate(function (cat) {
            const lista = Array.from(document.querySelectorAll(".herramienta")).filter(function (h) { return !h.hidden; });
            const incorrectas = lista.filter(function (h) { return cat !== "todas" && h.dataset.categoria !== cat; });
            return { cantidad: lista.length, incorrectas: incorrectas.length };
        }, categoria);
        iguales(visibles.cantidad, esperado[categoria], "Cantidad incorrecta con el filtro " + categoria);
        iguales(visibles.incorrectas, 0, "Se ven tarjetas de otra categoría con el filtro " + categoria);
        iguales(await p.getAttribute('.filtro[data-filtro="' + categoria + '"]', "aria-pressed"), "true", "El botón no quedó marcado");
    }
    await cerrar(p);
});


/* =========================================================
   US-05: SDLC
   ========================================================= */
prueba("US-05", "La línea de tiempo se ilumina paso a paso", async function () {
    const p = await abrir();
    await p.click("#etapaSiguiente");
    iguales((await p.textContent("#detalleEtapa h4")).trim(), "Etapa 1: Requisitos", "No arrancó en la etapa 1");
    await p.click("#etapaSiguiente");
    await p.click("#etapaSiguiente");
    iguales((await p.textContent("#detalleEtapa h4")).trim(), "Etapa 3: Desarrollo", "No avanzó a la etapa 3");
    iguales(await p.locator(".etapa.hecha").count(), 2, "Las etapas anteriores deberían quedar marcadas");
    await p.click('.etapa[data-etapa="5"]');
    comprobar(await p.isDisabled("#etapaSiguiente"), "En la última etapa el botón Siguiente debería desactivarse");
    await cerrar(p);
});


/* =========================================================
   US-06: MODELOS TRADICIONALES
   ========================================================= */
prueba("US-06", "La navegación interna lleva a Cascada, Modelo en V e Iterativo", async function () {
    const p = await abrir();
    for (const id of ["modelo-v", "iterativo", "cascada"]) {
        await p.click('#subnavModelos a[href="#' + id + '"]');
        await p.waitForTimeout(900);
        const top = await p.evaluate(function (i) { return document.getElementById(i).getBoundingClientRect().top; }, id);
        comprobar(top >= 0 && top < 150, "El ancla #" + id + " no quedó arriba (top=" + top + ")");
        comprobar(await p.evaluate(function (i) { return location.hash === "#" + i; }, id), "El hash no cambió a #" + id);
    }
    await cerrar(p);
});

prueba("US-06", "Ventajas en caja verde y desventajas en caja roja en los 3 modelos", async function () {
    const p = await abrir();
    iguales(await p.locator(".modelo .caja-ventajas").count(), 3, "Faltan cajas de ventajas");
    iguales(await p.locator(".modelo .caja-desventajas").count(), 3, "Faltan cajas de desventajas");
    const colores = await p.evaluate(function () {
        return [getComputedStyle(document.querySelector(".caja-ventajas")).backgroundColor,
                getComputedStyle(document.querySelector(".caja-desventajas")).backgroundColor];
    });
    iguales(colores, ["rgb(233, 246, 238)", "rgb(251, 238, 238)"], "Los colores verde/rojo no son los esperados");
    await cerrar(p);
});


/* =========================================================
   US-07 y US-09: IMÁGENES Y LIGHTBOX
   ========================================================= */
prueba("US-07 / US-09", "Todas las imágenes tienen alt, pie de foto y pesan poco", async function () {
    const p = await abrir();
    const sinAlt = await p.evaluate(function () {
        return Array.from(document.querySelectorAll("main img")).filter(function (i) { return !i.alt || i.alt.trim().length < 10; }).length;
    });
    iguales(sinAlt, 0, "Hay imágenes sin texto alternativo");
    const sinPie = await p.evaluate(function () {
        return Array.from(document.querySelectorAll("main img")).filter(function (i) { return !i.closest("figure").querySelector("figcaption"); }).length;
    });
    iguales(sinPie, 0, "Hay imágenes sin pie de foto");
    const carpeta = path.resolve(__dirname, "..", "img");
    fs.readdirSync(carpeta).forEach(function (archivo) {
        const kb = fs.statSync(path.join(carpeta, archivo)).size / 1024;
        comprobar(kb < 20, archivo + " pesa " + kb.toFixed(1) + " KB (máximo 20 KB)");
    });
    await cerrar(p);
});

prueba("US-07 / US-09", "El lightbox abre cualquier diagrama y se cierra con Escape o con la X", async function () {
    const p = await abrir();
    const botones = p.locator(".ampliar");
    const total = await botones.count();
    iguales(total, 6, "Deberían ser 6 diagramas (3 tradicionales + 3 ágiles)");
    for (let i = 0; i < total; i++) {
        const boton = botones.nth(i);
        const src = await boton.locator("img").getAttribute("src");
        await boton.click();
        comprobar(await p.isVisible("#lightbox"), "El lightbox no se abrió en el diagrama " + (i + 1));
        iguales(await p.getAttribute("#imagenAmpliada", "src"), src, "El lightbox mostró otra imagen");
        if (i % 2 === 0) await p.keyboard.press("Escape");
        else await p.click("#cerrarLightbox");
        comprobar(!(await p.isVisible("#lightbox")), "El lightbox no se cerró");
    }
    await cerrar(p);
});

prueba("US-09", "Los diagramas se ven nítidos en pantallas Retina (SVG vectorial)", async function () {
    const p = await abrir({ deviceScaleFactor: 2 });
    const todosSvg = await p.evaluate(function () {
        return Array.from(document.querySelectorAll(".ampliar img")).every(function (i) { return i.getAttribute("src").endsWith(".svg"); });
    });
    comprobar(todosSvg, "Algún diagrama no es SVG");
    const imagen = p.locator('img[src="img/sprint.svg"]');
    await imagen.scrollIntoViewIfNeeded();
    await p.waitForTimeout(300);
    fs.mkdirSync(CARPETA_CAPTURAS, { recursive: true });
    await imagen.screenshot({ path: path.join(CARPETA_CAPTURAS, "diagrama-retina.png") });
    await cerrar(p);
});


/* =========================================================
   US-08: METODOLOGÍAS ÁGILES
   ========================================================= */
prueba("US-08", "Se muestran los 4 valores y los 12 principios del Manifiesto Ágil", async function () {
    const p = await abrir();
    iguales(await p.locator("#manifiesto .valor").count(), 4, "No están los 4 valores");
    iguales(await p.locator("#manifiesto .principios li").count(), 12, "No están los 12 principios");
    for (const m of ["scrum", "kanban", "xp"]) {
        for (const parte of ["principios", "roles", "ceremonias", "artefactos"]) {
            comprobar(await p.locator("#" + m + "-" + parte).count() === 1, "Falta el apartado " + m + "-" + parte);
        }
    }
    await cerrar(p);
});

prueba("US-08", "El índice lleva a Principios, Roles y Artefactos", async function () {
    const p = await abrir();
    await p.click('#indiceAgiles a[href="#kanban-roles"]');
    await p.waitForTimeout(900);
    const top = await p.evaluate(function () { return document.getElementById("kanban-roles").getBoundingClientRect().top; });
    comprobar(top >= 0 && top < 150, "El índice no llevó a Roles de Kanban");
    await cerrar(p);
});


/* =========================================================
   US-10: SCRUM EN PROFUNDIDAD
   ========================================================= */
prueba("US-10", "Pestañas Roles / Eventos / Artefactos", async function () {
    const p = await abrir();
    await p.click("#tab-eventos");
    comprobar(await p.isVisible("#panel-eventos"), "No se mostró Eventos");
    await p.click("#tab-artefactos");
    comprobar(await p.isVisible("#panel-artefactos") && !(await p.isVisible("#panel-eventos")), "No cambió a Artefactos");
    await cerrar(p);
});

prueba("US-10", "Cronograma: días y duraciones correctas según las semanas del sprint", async function () {
    const p = await abrir();
    // [semanas, evento, texto esperado, minutos]
    const casos = [
        [1, "planning", "2 horas", 120],
        [2, "planning", "4 horas", 240],
        [4, "planning", "8 horas", 480],
        [1, "retro", "45 min", 45],
        [2, "retro", "1 h 30 min", 90],
        [3, "review", "3 horas", 180],
        [4, "daily", "15 min", 15]
    ];
    for (const c of casos) {
        await p.check('input[name="semanas"][value="' + c[0] + '"]');
        iguales(await p.locator("#cronograma .dia").count(), c[0] * 5, "Cantidad de días incorrecta para " + c[0] + " semanas");
        await p.click('.eventos-sprint [data-evento="' + c[1] + '"]');
        const texto = await p.textContent("#detalleEvento");
        comprobar(texto.includes(c[2]), c[1] + " con " + c[0] + " semanas debería decir " + c[2] + " y dice: " + texto);
        iguales(await p.getAttribute("#detalleEvento [data-minutos]", "data-minutos"), String(c[3]), "Minutos incorrectos");
    }
    // también se puede hacer clic en el evento dentro del calendario
    await p.click("#cronograma .mini-evento.ev-review");
    comprobar((await p.textContent("#detalleEvento h6")).includes("Sprint Review"), "Clic en el calendario no mostró la Review");
    await cerrar(p);
});


/* =========================================================
   US-11: KANBAN
   ========================================================= */
async function columnaDe(p, texto) {
    return p.evaluate(function (t) {
        const tarjeta = Array.from(document.querySelectorAll(".tarjeta-kanban")).find(function (x) { return x.textContent.includes(t); });
        return tarjeta ? tarjeta.closest(".columna").dataset.columna : null;
    }, texto);
}

prueba("US-11", "Mover con botones respeta el límite WIP de 2", async function () {
    const p = await abrir();
    await p.click("#reiniciarTablero");
    await p.click('.tarjeta-kanban:has-text("Diseñar la pantalla") button[aria-label*="siguiente"]');
    iguales(await columnaDe(p, "Diseñar la pantalla"), "proceso", "La tarjeta no pasó a En proceso");
    iguales((await p.textContent('[data-cuenta="proceso"]')).trim(), "2 / 2", "El contador WIP no es 2 / 2");
    await p.click('.tarjeta-kanban:has-text("Escribir casos") button[aria-label*="siguiente"]');
    iguales(await columnaDe(p, "Escribir casos"), "hacer", "Se superó el límite WIP");
    comprobar((await p.textContent("#avisoKanban")).includes("Límite WIP"), "No apareció el aviso de límite WIP");
    await cerrar(p);
});

prueba("US-11", "Arrastrar y soltar (drag and drop) mueve la tarjeta", async function () {
    const p = await abrir();
    await p.click("#reiniciarTablero");
    await p.dragAndDrop('.tarjeta-kanban:has-text("Programar el menú")', '[data-columna="hecho"]');
    iguales(await columnaDe(p, "Programar el menú"), "hecho", "El arrastre no movió la tarjeta");
    await cerrar(p);
});

prueba("US-11", "El tablero se mantiene igual después de recargar la página", async function () {
    const p = await abrir();
    await p.click("#reiniciarTablero");
    await p.click('.tarjeta-kanban:has-text("Armar el glosario") button[aria-label*="siguiente"]');
    await p.reload();
    iguales(await columnaDe(p, "Armar el glosario"), "proceso", "El tablero no se guardó al recargar");
    await p.click("#reiniciarTablero");
    iguales(await columnaDe(p, "Armar el glosario"), "hacer", "Reiniciar no volvió al estado inicial");
    await cerrar(p);
});


/* =========================================================
   US-12: GLOSARIO
   ========================================================= */
async function buscar(p, texto) {
    await p.fill("#buscadorGlosario", texto);
    return p.locator("#listaGlosario dt").count();
}

prueba("US-12", "Buscador: mayúsculas, minúsculas y acentos dan el mismo resultado", async function () {
    const p = await abrir();
    const a = await buscar(p, "sprint");
    const b = await buscar(p, "SPRINT");
    const c = await buscar(p, "SpRiNt");
    comprobar(a > 0, "No encontró 'sprint'");
    iguales([b, c], [a, a], "Mayúsculas/minúsculas cambian el resultado");
    iguales(await buscar(p, "metrica"), await buscar(p, "métrica"), "Los acentos cambian el resultado");
    await cerrar(p);
});

prueba("US-12", "Caracteres especiales y términos inexistentes muestran 'Sin resultados'", async function () {
    const p = await abrir();
    const antes = erroresConsola.length;
    for (const texto of ["<script>alert(1)</script>", "((", "[*+?", "\\", "palabrainexistente"]) {
        iguales(await buscar(p, texto), 0, "Debería dar 0 resultados con " + texto);
        comprobar(await p.isVisible("#sinResultados"), "No se mostró 'Sin resultados' con " + texto);
    }
    iguales(erroresConsola.length, antes, "Hubo errores en la consola");
    iguales(await p.locator("#sinResultados script").count(), 0, "Se insertó HTML del usuario");
    await buscar(p, "");
    comprobar(!(await p.isVisible("#sinResultados")), "Al borrar la búsqueda debería ocultarse el mensaje");
    await cerrar(p);
});

prueba("US-12", "Índice A-Z: letras sin términos desactivadas y lista en orden", async function () {
    const p = await abrir();
    comprobar(await p.isDisabled('#indiceLetras [data-letra="Y"]'), "La Y debería estar desactivada");
    comprobar(!(await p.isDisabled('#indiceLetras [data-letra="S"]')), "La S debería estar activa");
    const letras = await p.locator(".grupo-letra h4").allTextContents();
    iguales(letras, letras.slice().sort(), "Las letras no están en orden alfabético");
    await p.click('#indiceLetras [data-letra="K"]');
    await p.waitForTimeout(900);
    const top = await p.evaluate(function () { return document.getElementById("letra-K").getBoundingClientRect().top; });
    comprobar(top >= 0 && top < 150, "El índice no llevó a la letra K");
    await cerrar(p);
});


/* =========================================================
   US-13: PREGUNTAS FRECUENTES
   ========================================================= */
prueba("US-13", "El acordeón abre y cierra sin romper el diseño", async function () {
    const p = await abrir();
    const altoAntes = await p.evaluate(function () { return document.getElementById("resp2").getBoundingClientRect().height; });
    iguales(Math.round(altoAntes), 0, "La respuesta debería empezar cerrada");
    const posFooter = await p.evaluate(function () { return document.querySelector("footer").getBoundingClientRect().top + scrollY; });

    await p.click("#preg2");
    await p.waitForTimeout(500);
    iguales(await p.getAttribute("#preg2", "aria-expanded"), "true", "aria-expanded no cambió");
    const altoDespues = await p.evaluate(function () { return document.getElementById("resp2").getBoundingClientRect().height; });
    comprobar(altoDespues > 20, "La respuesta no se abrió");

    // las demás preguntas siguen visibles y el resto de la página baja (no se tapa)
    comprobar(await p.isVisible("#preg3"), "La pregunta siguiente quedó oculta");
    const posFooter2 = await p.evaluate(function () { return document.querySelector("footer").getBoundingClientRect().top + scrollY; });
    comprobar(posFooter2 > posFooter, "El contenido de abajo no se desplazó, puede haber superposición");
    const ancho = await p.evaluate(function () { return document.documentElement.scrollWidth; });
    comprobar(ancho <= 1366, "Se generó scroll horizontal");

    await p.click("#preg2");
    await p.waitForTimeout(500);
    const altoFinal = await p.evaluate(function () { return document.getElementById("resp2").getBoundingClientRect().height; });
    iguales(Math.round(altoFinal), 0, "La respuesta no se cerró");
    await cerrar(p);
});


/* =========================================================
   US-14: ENLACES DE INTERÉS
   ========================================================= */
prueba("US-14", "Enlaces externos con target=_blank y rel=noopener noreferrer", async function () {
    const p = await abrir();
    const malos = await p.evaluate(function () {
        return Array.from(document.querySelectorAll('a[href^="http"]')).filter(function (a) {
            const rel = (a.getAttribute("rel") || "").split(" ");
            return a.getAttribute("target") !== "_blank" || rel.indexOf("noopener") === -1 || rel.indexOf("noreferrer") === -1;
        }).map(function (a) { return a.href; });
    });
    iguales(malos, [], "Hay enlaces externos inseguros");
    const tipos = await p.locator("#enlaces .chip").allTextContents();
    ["Web", "PDF", "Libro", "Organización"].forEach(function (t) {
        comprobar(tipos.indexOf(t) !== -1, "Falta un recurso del tipo " + t);
    });
    await cerrar(p);
});


/* =========================================================
   US-15: EJERCICIOS
   ========================================================= */
prueba("US-15", "Las soluciones están ocultas al cargar y el botón cambia de estado", async function () {
    const p = await abrir();
    const visibles = await p.evaluate(function () {
        return Array.from(document.querySelectorAll(".solucion")).filter(function (s) { return s.offsetParent !== null; }).length;
    });
    iguales(visibles, 0, "Hay soluciones visibles al cargar la página");
    const boton = p.locator(".boton-solucion").first();
    await boton.click();
    comprobar(await p.isVisible("#sol1"), "La solución no se mostró");
    iguales((await boton.textContent()).trim(), "Ocultar solución", "El texto del botón no cambió");
    await boton.click();
    comprobar(!(await p.isVisible("#sol1")), "La solución no se ocultó");
    iguales((await boton.textContent()).trim(), "Mostrar solución", "El texto del botón no volvió");
    await cerrar(p);
});


/* =========================================================
   US-16: SOBRE NOSOTROS
   ========================================================= */
prueba("US-16", "Efecto hover en los perfiles y tarjetas alineadas", async function () {
    const p = await abrir();
    const perfil = p.locator(".perfil").nth(1);
    await perfil.hover();
    comprobar(await perfil.evaluate(function (x) { return x.classList.contains("destacado"); }), "El hover no agregó el efecto");
    await p.mouse.move(0, 0);
    comprobar(!(await perfil.evaluate(function (x) { return x.classList.contains("destacado"); })), "El efecto no se quitó");
    const datos = await p.evaluate(function () {
        const cajas = Array.from(document.querySelectorAll(".perfil")).map(function (x) { return x.getBoundingClientRect(); });
        return { tops: cajas.map(function (c) { return Math.round(c.top); }), altos: cajas.map(function (c) { return Math.round(c.height); }) };
    });
    iguales(new Set(datos.tops).size, 1, "Los perfiles no están alineados arriba");
    iguales(new Set(datos.altos).size, 1, "Los perfiles no tienen la misma altura");
    const roles = await p.locator(".perfil .rol").allTextContents();
    iguales(roles, ["Scrum Master", "Diseñador/a", "Programador/a", "Tester"], "Faltan roles");
    await cerrar(p);
});


/* =========================================================
   US-17: CONTACTO
   ========================================================= */
prueba("US-17", "Cada campo tiene su <label> vinculado", async function () {
    const p = await abrir();
    const sinLabel = await p.evaluate(function () {
        return Array.from(document.querySelectorAll("#formContacto input, #formContacto select, #formContacto textarea"))
            .filter(function (c) { return !document.querySelector('label[for="' + c.id + '"]'); }).length;
    });
    iguales(sinLabel, 0, "Hay campos sin label");
    await cerrar(p);
});

prueba("US-17", "Enviar vacío muestra los 4 errores", async function () {
    const p = await abrir();
    await p.click('#formContacto button[type="submit"]');
    for (const campo of ["nombre", "email", "tipo", "mensaje"]) {
        comprobar((await p.textContent("#error-" + campo)).length > 0, "Falta el error del campo " + campo);
    }
    comprobar(!(await p.isVisible("#confirmacion")), "No debería mostrar confirmación");
    iguales(await p.evaluate(function () { return document.activeElement.id; }), "nombre", "El foco debería ir al primer error");
    await cerrar(p);
});

prueba("US-17", "Correos con sintaxis inválida son rechazados", async function () {
    const p = await abrir();
    const invalidos = ["juan", "juan@", "@correo.com", "juan@correo", "juan correo@mail.com", "juan@@mail.com", "juan@mail.c"];
    for (const email of invalidos) {
        await p.fill("#email", email);
        await p.click('#formContacto button[type="submit"]');
        comprobar((await p.textContent("#error-email")).includes("formato"), "Aceptó un correo inválido: " + email);
    }
    await p.fill("#email", "ana.perez@escuela.edu.ar");
    await p.click('#formContacto button[type="submit"]');
    iguales(await p.textContent("#error-email"), "", "Rechazó un correo válido");
    await cerrar(p);
});

prueba("US-17", "Mensaje solo con espacios no se acepta", async function () {
    const p = await abrir();
    await p.fill("#mensaje", "            ");
    await p.click('#formContacto button[type="submit"]');
    comprobar((await p.textContent("#error-mensaje")).includes("obligatorio"), "Aceptó un mensaje vacío con espacios");
    await cerrar(p);
});

prueba("US-17", "Caracteres especiales se muestran como texto y se confirma el envío", async function () {
    const p = await abrir();
    await p.fill("#nombre", "<b>Ñandú</b> & \"Cía\"");
    await p.fill("#email", "nandu@correo.com");
    await p.selectOption("#tipo", "feedback");
    await p.fill("#mensaje", "¡Muy buena página! <script>alert('x')</script> 100% útil.");
    await p.click('#formContacto button[type="submit"]');
    comprobar(await p.isVisible("#confirmacion"), "No se mostró la confirmación");
    const texto = await p.textContent("#confirmacion");
    comprobar(texto.includes("<b>Ñandú</b>"), "El nombre con caracteres especiales no se mostró como texto");
    iguales(await p.locator("#confirmacion b").count(), 0, "Se interpretó HTML del usuario");
    iguales(await p.inputValue("#nombre"), "", "El formulario no se limpió");
    await cerrar(p);
});


/* =========================================================
   US-18: COMPARADOR
   ========================================================= */
prueba("US-18", "Matriz de selección: la tabla se crea y se limpia sin errores en consola", async function () {
    const p = await abrir();
    const antes = erroresConsola.length;
    const columnas = function () { return p.locator("#tablaComparador thead th").count(); };

    comprobar(!(await p.isVisible("#contenedorTabla")), "Con 0 elegidas no debería haber tabla");
    await p.check('input[value="scrum"]');
    comprobar(!(await p.isVisible("#contenedorTabla")), "Con 1 elegida no debería haber tabla");
    await p.check('input[value="cascada"]');
    iguales(await columnas(), 3, "Con 2 elegidas debería haber 3 columnas (característica + 2)");
    await p.check('input[value="kanban"]');
    await p.check('input[value="xp"]');
    iguales(await columnas(), 5, "Con 4 elegidas debería haber 5 columnas");
    iguales(await p.locator("#tablaComparador tbody tr").count(), 8, "Deberían ser 8 características");
    await p.uncheck('input[value="xp"]');
    iguales(await columnas(), 4, "Al deseleccionar no se quitó la columna");
    const encabezados = await p.locator("#tablaComparador thead th").allTextContents();
    iguales(encabezados, ["Característica", "Cascada", "Scrum", "Kanban"], "Encabezados incorrectos");

    // marcar todas
    for (const v of ["cascada", "modeloV", "iterativo", "scrum", "kanban", "xp"]) await p.check('input[value="' + v + '"]');
    iguales(await columnas(), 7, "Con las 6 elegidas deberían ser 7 columnas");
    await p.click("#limpiarComparador");
    comprobar(!(await p.isVisible("#contenedorTabla")), "Limpiar no ocultó la tabla");
    iguales(await columnas(), 0, "La tabla no se vació");
    iguales(erroresConsola.length, antes, "Hubo errores en la consola: " + erroresConsola.slice(antes).join(" / "));
    await cerrar(p);
});


/* =========================================================
   US-19: ENCUESTA
   ========================================================= */
prueba("US-19", "Algoritmo: distintas rutas de respuesta dan el resultado correcto", async function () {
    const p = await abrir();
    const casos = [
        { respuestas: [0, 0, 0, 0, 0], ganadoras: ["cascada"], porcentajes: { scrum: 26, kanban: 16, cascada: 58 } },
        { respuestas: [2, 1, 1, 1, 0], ganadoras: ["scrum"], porcentajes: { scrum: 67, kanban: 24, cascada: 10 } },
        { respuestas: [1, 2, 2, 0, 1], ganadoras: ["kanban"], porcentajes: { scrum: 25, kanban: 65, cascada: 10 } },
        { respuestas: [2, 0, 0, 0, 0], ganadoras: ["scrum", "cascada"], porcentajes: { scrum: 40, kanban: 20, cascada: 40 } }
    ];
    for (const c of casos) {
        const r = await p.evaluate(function (resp) { return calcularResultado(resp); }, c.respuestas);
        iguales(r.ganadoras, c.ganadoras, "Ganadora incorrecta para " + c.respuestas);
        iguales(r.porcentajes, c.porcentajes, "Porcentajes incorrectos para " + c.respuestas);
    }
    await cerrar(p);
});

prueba("US-19", "Asistente: valida la respuesta, avanza la barra y muestra el resumen", async function () {
    const p = await abrir();
    await p.click("#encuestaSiguiente");
    comprobar((await p.textContent("#errorEncuesta")).length > 0, "Dejó avanzar sin responder");
    iguales(await p.getAttribute("#barraProgreso", "aria-valuenow"), "20", "La barra debería empezar en 20%");

    const ruta = [2, 1, 1, 1, 0];
    for (let i = 0; i < ruta.length; i++) {
        await p.check('#preguntaActual input[value="' + ruta[i] + '"]');
        if (i === 2) {
            // volver atrás conserva la respuesta
            await p.click("#encuestaSiguiente");
            await p.click("#encuestaAnterior");
            comprobar(await p.isChecked('#preguntaActual input[value="' + ruta[i] + '"]'), "Al volver se perdió la respuesta");
        }
        await p.click("#encuestaSiguiente");
    }
    comprobar(await p.isVisible("#resultadoEncuesta"), "No se mostró el resultado");
    iguales(await p.getAttribute("#barraProgreso", "aria-valuenow"), "100", "La barra no llegó a 100%");
    comprobar((await p.textContent("#textoRecomendacion")).includes("Scrum"), "La recomendación no es Scrum");
    await p.click("#repetirEncuesta");
    iguales((await p.textContent("#pasoTexto")).trim(), "Pregunta 1 de 5", "No volvió a empezar");
    await cerrar(p);
});


/* =========================================================
   GENERAL
   ========================================================= */
prueba("General", "La página carga sin errores de JavaScript en ninguna resolución", async function () {
    const antes = erroresConsola.length;
    for (const r of RESOLUCIONES) {
        const p = await abrir({ viewport: { width: r.ancho, height: r.alto } });
        await p.evaluate(function () { window.scrollTo(0, document.body.scrollHeight); });
        await p.waitForTimeout(300);
        await cerrar(p);
    }
    iguales(erroresConsola.slice(antes), [], "Hubo errores de JavaScript");
});

prueba("General", "Capturas de página completa para el informe", async function () {
    fs.mkdirSync(CARPETA_CAPTURAS, { recursive: true });
    for (const r of RESOLUCIONES) {
        const p = await abrir({ viewport: { width: r.ancho, height: r.alto } });
        await p.evaluate(function () { document.getElementById("lineaTiempo").classList.add("visible"); });
        await p.screenshot({ path: path.join(CARPETA_CAPTURAS, "completa-" + r.nombre.toLowerCase() + ".png"), fullPage: true });
        await cerrar(p);
    }
});


/* ---------- Ejecutar todo y mostrar el informe ---------- */
(async function () {
    navegador = await chromium.launch();
    console.log("\nSGCS - Pruebas automáticas\n" + "=".repeat(60));

    for (const t of pruebas) {
        const inicio = Date.now();
        try {
            await t.funcion();
            resultados.push({ id: t.id, nombre: t.nombre, ok: true });
            console.log("  ✔ [" + t.id + "] " + t.nombre + " (" + (Date.now() - inicio) + " ms)");
        } catch (error) {
            resultados.push({ id: t.id, nombre: t.nombre, ok: false, error: error.message });
            console.log("  ✘ [" + t.id + "] " + t.nombre + "\n      → " + error.message);
        }
    }

    await navegador.close();

    const aprobadas = resultados.filter(function (r) { return r.ok; }).length;
    console.log("=".repeat(60));
    console.log("Resultado: " + aprobadas + " de " + resultados.length + " pruebas aprobadas\n");

    fs.writeFileSync(path.join(__dirname, "resultados.json"), JSON.stringify({
        fecha: new Date().toISOString(),
        aprobadas: aprobadas,
        total: resultados.length,
        resultados: resultados
    }, null, 2));

    process.exit(aprobadas === resultados.length ? 0 : 1);
})();
