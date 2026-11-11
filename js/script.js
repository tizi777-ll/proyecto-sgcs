/* =========================================================
   SGCS - Programación del sitio
   Cada bloque dice a qué historia de usuario (US) corresponde.
   ========================================================= */

/* ---------- Funciones de ayuda ---------- */

// Pasa un texto a minúsculas y le saca los acentos, para buscar sin problemas
function normalizar(texto) {
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .trim();
}

// Guarda y lee datos en el navegador sin que se rompa si está bloqueado
function guardarDato(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
    } catch (e) {
        // si el navegador no deja guardar, seguimos igual
    }
}

function leerDato(clave) {
    try {
        const dato = localStorage.getItem(clave);
        return dato ? JSON.parse(dato) : null;
    } catch (e) {
        return null;
    }
}


/* =========================================================
   US-01: MENÚ HAMBURGUESA Y SECCIÓN ACTIVA
   ========================================================= */
const botonMenu = document.getElementById("botonMenu");
const menu = document.getElementById("menu");
const barraFija = document.getElementById("barraFija");
const botonMenuFijo = document.getElementById("botonMenuFijo");
const menuFijo = document.getElementById("menuFijo");
const botonArriba = document.getElementById("botonArriba");
const esCelular = window.matchMedia("(max-width: 760px)");

// En celulares el menú de la portada empieza cerrado
function acomodarMenuSegunPantalla() {
    const abierto = !esCelular.matches;
    menu.hidden = !abierto;
    botonMenu.setAttribute("aria-expanded", String(abierto));
    cerrarMenuFijo();
}

botonMenu.addEventListener("click", function () {
    const abierto = botonMenu.getAttribute("aria-expanded") === "true";
    botonMenu.setAttribute("aria-expanded", String(!abierto));
    menu.hidden = abierto;
});

function cerrarMenuFijo() {
    menuFijo.classList.remove("abierto");
    botonMenuFijo.setAttribute("aria-expanded", "false");
}

botonMenuFijo.addEventListener("click", function () {
    const abierto = menuFijo.classList.toggle("abierto");
    botonMenuFijo.setAttribute("aria-expanded", String(abierto));
});

// Al tocar un link del menú en el celular, el menú se cierra
document.querySelectorAll("#menu a, #menuFijo a").forEach(function (enlace) {
    enlace.addEventListener("click", function () {
        if (esCelular.matches) {
            cerrarMenuFijo();
            if (enlace.closest("#menu")) {
                menu.hidden = true;
                botonMenu.setAttribute("aria-expanded", "false");
            }
        }
    });
});

esCelular.addEventListener("change", acomodarMenuSegunPantalla);
acomodarMenuSegunPantalla();

// La barra fija y el botón "arriba" aparecen cuando pasás la portada
function revisarScroll() {
    const pasoPortada = window.scrollY > 320;
    barraFija.classList.toggle("mostrar", pasoPortada);
    botonArriba.classList.toggle("mostrar", pasoPortada);
    if (!pasoPortada) cerrarMenuFijo();
}

window.addEventListener("scroll", revisarScroll, { passive: true });
revisarScroll();

botonArriba.addEventListener("click", function () {
    window.scrollTo({ top: 0 });
    document.getElementById("tituloPrincipal").focus({ preventScroll: true });
});

// Resaltar en el menú la sección que se está viendo
const seccionesPrincipales = ["calidad", "procesos", "agiles", "recursos", "interactivo", "nosotros", "contacto"];

function marcarActiva(id) {
    document.querySelectorAll("[data-seccion]").forEach(function (enlace) {
        enlace.classList.toggle("activo", enlace.dataset.seccion === id);
    });
}

function actualizarSeccionActiva() {
    let actual = "inicio";
    const linea = window.innerHeight * 0.35;
    seccionesPrincipales.forEach(function (id) {
        const seccion = document.getElementById(id);
        if (seccion && seccion.getBoundingClientRect().top <= linea) {
            actual = id;
        }
    });
    // si llegamos al final de la página, la activa es la última
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        actual = "contacto";
    }
    marcarActiva(actual);
}

window.addEventListener("scroll", actualizarSeccionActiva, { passive: true });
actualizarSeccionActiva();


/* =========================================================
   US-02 y US-10: PESTAÑAS (TABS) ACCESIBLES
   ========================================================= */
document.querySelectorAll("[data-pestanas]").forEach(function (grupo) {
    const pestanas = Array.from(grupo.querySelectorAll('[role="tab"]'));

    function activar(pestana) {
        pestanas.forEach(function (p) {
            const elegida = p === pestana;
            p.setAttribute("aria-selected", String(elegida));
            p.tabIndex = elegida ? 0 : -1;
            document.getElementById(p.getAttribute("aria-controls")).hidden = !elegida;
        });
    }

    pestanas.forEach(function (pestana, i) {
        pestana.addEventListener("click", function () {
            activar(pestana);
        });

        // Con las flechas del teclado se cambia de pestaña
        pestana.addEventListener("keydown", function (evento) {
            let nueva = null;
            if (evento.key === "ArrowRight") nueva = pestanas[(i + 1) % pestanas.length];
            if (evento.key === "ArrowLeft") nueva = pestanas[(i - 1 + pestanas.length) % pestanas.length];
            if (nueva) {
                evento.preventDefault();
                activar(nueva);
                nueva.focus();
            }
        });
    });
});


/* =========================================================
   US-03: TARJETAS QUE SE DAN VUELTA (FLIP CARDS)
   Funcionan con clic, con toque en el celular y con teclado
   ========================================================= */
document.querySelectorAll(".tarjeta-giro").forEach(function (tarjeta) {
    tarjeta.addEventListener("click", function () {
        const girada = tarjeta.classList.toggle("girada");
        tarjeta.setAttribute("aria-pressed", String(girada));
    });
});


/* =========================================================
   US-04: FILTRO DE HERRAMIENTAS
   ========================================================= */
const botonesFiltro = document.querySelectorAll(".filtro");
const herramientas = document.querySelectorAll(".herramienta");
const contadorHerramientas = document.getElementById("contadorHerramientas");

function filtrarHerramientas(categoria) {
    let visibles = 0;

    herramientas.forEach(function (herramienta) {
        const mostrar = categoria === "todas" || herramienta.dataset.categoria === categoria;
        herramienta.hidden = !mostrar;
        if (mostrar) visibles++;
    });

    botonesFiltro.forEach(function (boton) {
        boton.setAttribute("aria-pressed", String(boton.dataset.filtro === categoria));
    });

    contadorHerramientas.textContent = "Mostrando " + visibles + (visibles === 1 ? " herramienta" : " herramientas");
    return visibles;
}

botonesFiltro.forEach(function (boton) {
    boton.addEventListener("click", function () {
        filtrarHerramientas(boton.dataset.filtro);
    });
});


/* =========================================================
   US-05: LÍNEA DE TIEMPO DEL SDLC
   ========================================================= */
const etapasSDLC = [
    { nombre: "Requisitos", texto: "Se habla con el cliente para entender qué necesita y se escriben los requisitos.", importancia: "Si los requisitos están mal, todo lo demás va a estar mal." },
    { nombre: "Diseño", texto: "Se decide cómo se va a construir: arquitectura, base de datos y pantallas.", importancia: "Un buen diseño hace que el sistema sea fácil de mantener." },
    { nombre: "Desarrollo", texto: "Los programadores escriben el código siguiendo el diseño.", importancia: "Es donde el sistema se vuelve real." },
    { nombre: "Pruebas", texto: "Se verifica que el software funcione y cumpla los requisitos.", importancia: "Encontrar errores antes que el usuario ahorra tiempo y dinero." },
    { nombre: "Despliegue", texto: "Se instala el sistema para que lo usen las personas.", importancia: "Sin despliegue el usuario no recibe ningún valor." },
    { nombre: "Mantenimiento", texto: "Se corrigen errores y se agregan mejoras después de la entrega.", importancia: "Es la etapa más larga: el software sigue cambiando." }
];

const botonesEtapa = document.querySelectorAll(".etapa");
const detalleEtapa = document.getElementById("detalleEtapa");
const lineaTiempo = document.getElementById("lineaTiempo");
let etapaActual = -1;

function mostrarEtapa(numero) {
    if (numero < 0) numero = 0;
    if (numero > etapasSDLC.length - 1) numero = etapasSDLC.length - 1;
    etapaActual = numero;

    botonesEtapa.forEach(function (boton, i) {
        boton.classList.toggle("actual", i === numero);
        boton.classList.toggle("hecha", i < numero);
        if (i === numero) {
            boton.setAttribute("aria-current", "step");
        } else {
            boton.removeAttribute("aria-current");
        }
    });

    const etapa = etapasSDLC[numero];
    detalleEtapa.innerHTML = "";
    const titulo = document.createElement("h4");
    titulo.textContent = "Etapa " + (numero + 1) + ": " + etapa.nombre;
    const texto = document.createElement("p");
    texto.textContent = etapa.texto;
    const importancia = document.createElement("p");
    importancia.innerHTML = "<strong>¿Por qué es importante?</strong> ";
    importancia.append(etapa.importancia);
    detalleEtapa.append(titulo, texto, importancia);

    document.getElementById("etapaAnterior").disabled = numero === 0;
    document.getElementById("etapaSiguiente").disabled = numero === etapasSDLC.length - 1;
}

botonesEtapa.forEach(function (boton) {
    boton.addEventListener("click", function () {
        mostrarEtapa(Number(boton.dataset.etapa));
    });
});

document.getElementById("etapaAnterior").addEventListener("click", function () {
    mostrarEtapa(etapaActual - 1);
});

document.getElementById("etapaSiguiente").addEventListener("click", function () {
    mostrarEtapa(etapaActual + 1);
});

document.getElementById("etapaAnterior").disabled = true;

// Cuando la línea de tiempo aparece en pantalla, se "enciende" etapa por etapa
if ("IntersectionObserver" in window) {
    const observadorLinea = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
            if (entrada.isIntersecting) {
                botonesEtapa.forEach(function (boton, i) {
                    boton.style.transitionDelay = (i * 0.12) + "s";
                });
                lineaTiempo.classList.add("visible");
                observadorLinea.disconnect();
            }
        });
    }, { threshold: 0.3 });
    observadorLinea.observe(lineaTiempo);
} else {
    lineaTiempo.classList.add("visible");
}


/* =========================================================
   US-06 y US-08: NAVEGACIÓN INTERNA (resalta el apartado visible)
   ========================================================= */
function resaltarAlBajar(selectorEnlaces) {
    const enlaces = Array.from(document.querySelectorAll(selectorEnlaces));
    const destinos = enlaces
        .map(function (enlace) { return document.querySelector(enlace.getAttribute("href")); })
        .filter(Boolean);

    function revisar() {
        let actual = null;
        destinos.forEach(function (destino) {
            if (destino.getBoundingClientRect().top <= window.innerHeight * 0.4) {
                actual = destino.id;
            }
        });
        enlaces.forEach(function (enlace) {
            enlace.classList.toggle("activo", enlace.getAttribute("href") === "#" + actual);
        });
    }

    window.addEventListener("scroll", revisar, { passive: true });
    revisar();
}

resaltarAlBajar("#subnavModelos a");
resaltarAlBajar("#indiceAgiles > li > a");


/* =========================================================
   US-07 y US-09: LIGHTBOX PARA AMPLIAR DIAGRAMAS
   (un solo script que sirve para todos los diagramas)
   ========================================================= */
const lightbox = document.getElementById("lightbox");
const imagenAmpliada = document.getElementById("imagenAmpliada");
const pieAmpliado = document.getElementById("pieAmpliado");
const cerrarLightbox = document.getElementById("cerrarLightbox");
let elementoAnterior = null;

function abrirLightbox(boton) {
    const imagen = boton.querySelector("img");
    const pie = boton.closest("figure").querySelector("figcaption");
    elementoAnterior = boton;
    imagenAmpliada.src = imagen.getAttribute("src");
    imagenAmpliada.alt = imagen.alt;
    pieAmpliado.textContent = pie ? pie.textContent : "";
    lightbox.hidden = false;
    document.body.classList.add("sin-scroll");
    cerrarLightbox.focus();
}

function ocultarLightbox() {
    lightbox.hidden = true;
    imagenAmpliada.removeAttribute("src");
    document.body.classList.remove("sin-scroll");
    if (elementoAnterior) elementoAnterior.focus();
}

document.querySelectorAll(".ampliar").forEach(function (boton) {
    boton.addEventListener("click", function () {
        abrirLightbox(boton);
    });
});

cerrarLightbox.addEventListener("click", ocultarLightbox);

lightbox.addEventListener("click", function (evento) {
    if (evento.target === lightbox) ocultarLightbox();
});

document.addEventListener("keydown", function (evento) {
    if (lightbox.hidden) return;
    if (evento.key === "Escape") ocultarLightbox();
    // el foco queda dentro del lightbox
    if (evento.key === "Tab") {
        evento.preventDefault();
        cerrarLightbox.focus();
    }
});


/* =========================================================
   US-10: CRONOGRAMA INTERACTIVO DEL SPRINT
   Duraciones máximas de la Guía de Scrum para un sprint de 1 mes,
   se reducen en proporción para sprints más cortos.
   ========================================================= */
const eventosScrum = {
    planning: { nombre: "Sprint Planning", maximoMinutos: 480, objetivo: "Definir el objetivo del sprint, elegir los elementos del Product Backlog y planificar cómo hacerlos.", cuando: "Primer día del sprint" },
    daily: { nombre: "Daily Scrum", maximoMinutos: 15, objetivo: "Revisar el avance hacia el objetivo del sprint y ajustar el plan del día.", cuando: "Todos los días, a la misma hora y en el mismo lugar" },
    review: { nombre: "Sprint Review", maximoMinutos: 240, objetivo: "Mostrar el incremento a los interesados y recibir su opinión para adaptar el Product Backlog.", cuando: "Último día del sprint" },
    retro: { nombre: "Sprint Retrospective", maximoMinutos: 180, objetivo: "Analizar cómo trabajó el equipo y elegir mejoras para el próximo sprint.", cuando: "Último día, después de la Review" }
};

// Calcula la duración sugerida en minutos según las semanas del sprint
function duracionEvento(evento, semanas) {
    const datos = eventosScrum[evento];
    if (!datos) return 0;
    if (evento === "daily") return 15;
    return Math.round(datos.maximoMinutos * semanas / 4);
}

// Pasa minutos a un texto como "1 h 30 min"
function formatearMinutos(minutos) {
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    if (horas === 0) return resto + " min";
    if (resto === 0) return horas + (horas === 1 ? " hora" : " horas");
    return horas + " h " + resto + " min";
}

const cronograma = document.getElementById("cronograma");
const detalleEvento = document.getElementById("detalleEvento");
let semanasSprint = 2;
let eventoElegido = null;

function crearMiniEvento(tipo, texto) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "mini-evento ev-" + tipo;
    boton.textContent = texto;
    boton.dataset.evento = tipo;
    boton.tabIndex = -1; // con teclado se usan los botones grandes de arriba
    return boton;
}

function dibujarCronograma() {
    cronograma.innerHTML = "";
    const totalDias = semanasSprint * 5; // días hábiles

    for (let dia = 1; dia <= totalDias; dia++) {
        const casilla = document.createElement("div");
        casilla.className = "dia";
        const titulo = document.createElement("span");
        titulo.className = "dia-titulo";
        titulo.textContent = "Día " + dia;
        casilla.appendChild(titulo);

        if (dia === 1) casilla.appendChild(crearMiniEvento("planning", "Planning"));
        casilla.appendChild(crearMiniEvento("daily", "Daily"));
        if (dia === totalDias) {
            casilla.appendChild(crearMiniEvento("review", "Review"));
            casilla.appendChild(crearMiniEvento("retro", "Retro"));
        }
        cronograma.appendChild(casilla);
    }

    if (eventoElegido) mostrarEvento(eventoElegido);
}

function mostrarEvento(evento) {
    const datos = eventosScrum[evento];
    if (!datos) return;
    eventoElegido = evento;

    document.querySelectorAll(".evento").forEach(function (boton) {
        boton.classList.toggle("seleccionado", boton.dataset.evento === evento);
    });

    const minutos = duracionEvento(evento, semanasSprint);
    detalleEvento.innerHTML = "";
    const titulo = document.createElement("h6");
    titulo.textContent = datos.nombre;
    const duracion = document.createElement("p");
    duracion.innerHTML = "<strong>Duración sugerida:</strong> ";
    duracion.append(formatearMinutos(minutos) + (evento === "daily" ? " por día" : " como máximo") +
        " (sprint de " + semanasSprint + (semanasSprint === 1 ? " semana)" : " semanas)"));
    duracion.dataset.minutos = minutos;
    const cuando = document.createElement("p");
    cuando.innerHTML = "<strong>Cuándo:</strong> ";
    cuando.append(datos.cuando);
    const objetivo = document.createElement("p");
    objetivo.innerHTML = "<strong>Objetivo:</strong> ";
    objetivo.append(datos.objetivo);
    detalleEvento.append(titulo, duracion, cuando, objetivo);
}

document.querySelectorAll('input[name="semanas"]').forEach(function (opcion) {
    opcion.addEventListener("change", function () {
        semanasSprint = Number(opcion.value);
        dibujarCronograma();
    });
});

document.querySelector(".eventos-sprint").addEventListener("click", function (evento) {
    const boton = evento.target.closest("[data-evento]");
    if (boton) mostrarEvento(boton.dataset.evento);
});

cronograma.addEventListener("click", function (evento) {
    const boton = evento.target.closest("[data-evento]");
    if (boton) mostrarEvento(boton.dataset.evento);
});

dibujarCronograma();


/* =========================================================
   US-11: TABLERO KANBAN CON LÍMITE WIP
   ========================================================= */
const LIMITE_WIP = 2;
const ordenColumnas = ["hacer", "proceso", "hecho"];
const nombresColumnas = { hacer: "Por hacer", proceso: "En proceso", hecho: "Hecho" };

const tableroInicial = [
    { id: "t1", texto: "Diseñar la pantalla de inicio", columna: "hacer" },
    { id: "t2", texto: "Escribir casos de prueba", columna: "hacer" },
    { id: "t3", texto: "Armar el glosario", columna: "hacer" },
    { id: "t4", texto: "Programar el menú", columna: "proceso" },
    { id: "t5", texto: "Definir la paleta de colores", columna: "hecho" }
];

let tarjetasKanban = leerDato("sgcs-kanban") || JSON.parse(JSON.stringify(tableroInicial));
const avisoKanban = document.getElementById("avisoKanban");

function contarEn(columna) {
    return tarjetasKanban.filter(function (t) { return t.columna === columna; }).length;
}

function avisar(texto, esError) {
    avisoKanban.textContent = texto;
    avisoKanban.classList.toggle("ok", !esError);
}

// Mueve una tarjeta. Devuelve true si se pudo mover y false si no.
function moverTarjeta(id, destino) {
    const tarjeta = tarjetasKanban.find(function (t) { return t.id === id; });
    if (!tarjeta || ordenColumnas.indexOf(destino) === -1) return false;
    if (tarjeta.columna === destino) return false;

    if (destino === "proceso" && contarEn("proceso") >= LIMITE_WIP) {
        avisar("⚠ Límite WIP alcanzado: terminá una tarea antes de empezar otra (máximo " + LIMITE_WIP + " en proceso).", true);
        const columna = document.querySelector('[data-columna="proceso"]');
        columna.classList.add("rechazo");
        setTimeout(function () { columna.classList.remove("rechazo"); }, 700);
        return false;
    }

    tarjeta.columna = destino;
    guardarDato("sgcs-kanban", tarjetasKanban);
    avisar("“" + tarjeta.texto + "” se movió a " + nombresColumnas[destino] + ".", false);
    dibujarTablero();
    return true;
}

function dibujarTablero() {
    ordenColumnas.forEach(function (columna) {
        const lista = document.querySelector('[data-lista="' + columna + '"]');
        lista.innerHTML = "";

        tarjetasKanban
            .filter(function (t) { return t.columna === columna; })
            .forEach(function (t) {
                const posicion = ordenColumnas.indexOf(columna);
                const tarjeta = document.createElement("div");
                tarjeta.className = "tarjeta-kanban";
                tarjeta.draggable = true;
                tarjeta.dataset.id = t.id;

                const texto = document.createElement("p");
                texto.textContent = t.texto;

                const flechas = document.createElement("div");
                flechas.className = "flechas-kanban";

                const izquierda = document.createElement("button");
                izquierda.type = "button";
                izquierda.textContent = "◀";
                izquierda.disabled = posicion === 0;
                izquierda.setAttribute("aria-label", "Mover “" + t.texto + "” a la columna anterior");
                izquierda.addEventListener("click", function () {
                    moverTarjeta(t.id, ordenColumnas[posicion - 1]);
                });

                const derecha = document.createElement("button");
                derecha.type = "button";
                derecha.textContent = "▶";
                derecha.disabled = posicion === ordenColumnas.length - 1;
                derecha.setAttribute("aria-label", "Mover “" + t.texto + "” a la columna siguiente");
                derecha.addEventListener("click", function () {
                    moverTarjeta(t.id, ordenColumnas[posicion + 1]);
                });

                flechas.append(izquierda, derecha);
                tarjeta.append(texto, flechas);

                tarjeta.addEventListener("dragstart", function (evento) {
                    evento.dataTransfer.setData("text/plain", t.id);
                    tarjeta.classList.add("arrastrando");
                });
                tarjeta.addEventListener("dragend", function () {
                    tarjeta.classList.remove("arrastrando");
                });

                lista.appendChild(tarjeta);
            });

        const cuenta = document.querySelector('[data-cuenta="' + columna + '"]');
        const cantidad = contarEn(columna);
        cuenta.textContent = columna === "proceso" ? cantidad + " / " + LIMITE_WIP : cantidad;
        document.querySelector('[data-columna="' + columna + '"]')
            .classList.toggle("llena", columna === "proceso" && cantidad >= LIMITE_WIP);
    });
}

// Arrastrar y soltar en las columnas
document.querySelectorAll(".columna").forEach(function (columna) {
    columna.addEventListener("dragover", function (evento) {
        evento.preventDefault();
        columna.classList.add("sobre");
    });
    columna.addEventListener("dragleave", function () {
        columna.classList.remove("sobre");
    });
    columna.addEventListener("drop", function (evento) {
        evento.preventDefault();
        columna.classList.remove("sobre");
        const id = evento.dataTransfer.getData("text/plain");
        moverTarjeta(id, columna.dataset.columna);
    });
});

document.getElementById("reiniciarTablero").addEventListener("click", function () {
    tarjetasKanban = JSON.parse(JSON.stringify(tableroInicial));
    guardarDato("sgcs-kanban", tarjetasKanban);
    avisar("El tablero volvió al estado inicial.", false);
    dibujarTablero();
});

dibujarTablero();


/* =========================================================
   US-12: GLOSARIO CON BUSCADOR E ÍNDICE A-Z
   ========================================================= */
const terminosGlosario = [
    { termino: "Aceptación (prueba de)", definicion: "Prueba que hace el cliente o usuario para decidir si acepta el sistema." },
    { termino: "Artefacto", definicion: "Producto de trabajo que se genera en un proceso, como el Product Backlog o un documento de requisitos." },
    { termino: "Backlog", definicion: "Lista ordenada de trabajo pendiente. En Scrum hay Product Backlog y Sprint Backlog." },
    { termino: "Bug", definicion: "Nombre informal de un defecto en el software." },
    { termino: "Caja blanca", definicion: "Tipo de prueba que se diseña mirando el código y su lógica interna." },
    { termino: "Caja negra", definicion: "Tipo de prueba que se diseña con las entradas y salidas esperadas, sin mirar el código." },
    { termino: "Calidad del software", definicion: "Grado en que el software cumple los requisitos y las expectativas de los usuarios." },
    { termino: "Cobertura de código", definicion: "Porcentaje del código que se ejecuta al correr las pruebas." },
    { termino: "Daily Scrum", definicion: "Reunión diaria de 15 minutos del equipo de desarrollo en Scrum." },
    { termino: "Defecto", definicion: "Imperfección en el código o en un documento que puede causar una falla." },
    { termino: "Definición de terminado", definicion: "Acuerdo del equipo sobre qué condiciones debe cumplir el trabajo para considerarse terminado." },
    { termino: "Despliegue", definicion: "Instalar y poner en funcionamiento el software para que lo usen." },
    { termino: "Falla", definicion: "Cuando el sistema no hace lo que se esperaba al ejecutarse." },
    { termino: "Historia de usuario", definicion: "Descripción corta de una necesidad: “Como [usuario], quiero [algo] para [beneficio]”." },
    { termino: "Incremento", definicion: "Parte del producto terminada y utilizable que se suma al final de un sprint." },
    { termino: "Integración continua", definicion: "Práctica de unir el código de todos varias veces al día y probarlo automáticamente." },
    { termino: "ISO/IEC 9126", definicion: "Norma de calidad de producto con 6 características. Fue reemplazada por la ISO 25000." },
    { termino: "ISO/IEC 25000", definicion: "Familia de normas SQuaRE para evaluar la calidad del software. Incluye la ISO/IEC 25010." },
    { termino: "Iteración", definicion: "Ciclo corto de trabajo que se repite, en el que se planifica, construye y prueba." },
    { termino: "Kanban", definicion: "Método que visualiza el trabajo en un tablero y limita el trabajo en curso." },
    { termino: "Lead time", definicion: "Tiempo desde que se pide una tarea hasta que se entrega." },
    { termino: "Linter", definicion: "Herramienta que analiza el código y marca errores de estilo o posibles problemas." },
    { termino: "Métrica", definicion: "Medida numérica de una característica del software o del proceso." },
    { termino: "Modelo en cascada", definicion: "Modelo de desarrollo en el que las fases se hacen una detrás de otra." },
    { termino: "Modelo en V", definicion: "Variante de la cascada que relaciona cada fase de desarrollo con una fase de prueba." },
    { termino: "Product Owner", definicion: "Rol de Scrum responsable de maximizar el valor del producto y ordenar el Product Backlog." },
    { termino: "Programación en pareja", definicion: "Práctica de XP: dos personas programan juntas en una misma computadora." },
    { termino: "QA (aseguramiento de la calidad)", definicion: "Actividades para prevenir defectos mejorando el proceso." },
    { termino: "Refactorización", definicion: "Mejorar la estructura del código sin cambiar lo que hace." },
    { termino: "Regresión (prueba de)", definicion: "Volver a probar después de un cambio para ver que no se rompió nada." },
    { termino: "Requisito", definicion: "Condición o capacidad que el sistema debe cumplir." },
    { termino: "Retrospectiva", definicion: "Reunión al final del sprint para mejorar la forma de trabajo del equipo." },
    { termino: "Scrum Master", definicion: "Rol de Scrum que ayuda al equipo a aplicar Scrum y quita impedimentos." },
    { termino: "SDLC", definicion: "Ciclo de vida del desarrollo de software: etapas desde la idea hasta el mantenimiento." },
    { termino: "Sprint", definicion: "Ciclo de trabajo de Scrum que dura de 1 a 4 semanas." },
    { termino: "TDD", definicion: "Desarrollo guiado por pruebas: primero se escribe la prueba y después el código." },
    { termino: "Trazabilidad", definicion: "Poder seguir la relación entre un requisito, su diseño, su código y sus pruebas." },
    { termino: "Unitaria (prueba)", definicion: "Prueba de una parte chica del código, como una función, de forma aislada." },
    { termino: "Validación", definicion: "Comprobar que se construyó el producto correcto (lo que el cliente necesita)." },
    { termino: "Verificación", definicion: "Comprobar que el producto se construyó correctamente (según la especificación)." },
    { termino: "WIP", definicion: "Work In Progress: trabajo en curso. En Kanban se le pone un límite." },
    { termino: "XP (Extreme Programming)", definicion: "Metodología ágil centrada en prácticas técnicas como TDD y programación en pareja." }
];

const buscadorGlosario = document.getElementById("buscadorGlosario");
const listaGlosario = document.getElementById("listaGlosario");
const indiceLetras = document.getElementById("indiceLetras");
const sinResultados = document.getElementById("sinResultados");
const contadorGlosario = document.getElementById("contadorGlosario");
const abecedario = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

function primeraLetra(texto) {
    return normalizar(texto).charAt(0).toUpperCase();
}

// Devuelve los términos que coinciden con la búsqueda
function buscarTerminos(busqueda) {
    const texto = normalizar(busqueda);
    if (texto === "") return terminosGlosario.slice();
    return terminosGlosario.filter(function (t) {
        return normalizar(t.termino).includes(texto) || normalizar(t.definicion).includes(texto);
    });
}

function dibujarGlosario() {
    const resultados = buscarTerminos(buscadorGlosario.value);
    listaGlosario.innerHTML = "";

    // se agrupan por letra
    const grupos = {};
    resultados
        .sort(function (a, b) { return a.termino.localeCompare(b.termino, "es"); })
        .forEach(function (t) {
            const letra = primeraLetra(t.termino);
            if (!grupos[letra]) grupos[letra] = [];
            grupos[letra].push(t);
        });

    Object.keys(grupos).sort().forEach(function (letra) {
        const grupo = document.createElement("div");
        grupo.className = "grupo-letra";
        grupo.id = "letra-" + letra;

        const titulo = document.createElement("h4");
        titulo.textContent = letra;
        const lista = document.createElement("dl");

        grupos[letra].forEach(function (t) {
            const dt = document.createElement("dt");
            dt.textContent = t.termino;
            const dd = document.createElement("dd");
            dd.textContent = t.definicion;
            lista.append(dt, dd);
        });

        grupo.append(titulo, lista);
        listaGlosario.appendChild(grupo);
    });

    sinResultados.hidden = resultados.length > 0;
    if (resultados.length === 0) {
        sinResultados.textContent = "Sin resultados para “" + buscadorGlosario.value.trim() + "”. Probá con otra palabra.";
    }
    contadorGlosario.textContent = resultados.length + (resultados.length === 1 ? " término encontrado" : " términos encontrados");

    // el índice de letras solo habilita las que tienen términos
    indiceLetras.querySelectorAll("button").forEach(function (boton) {
        boton.disabled = !grupos[boton.dataset.letra];
    });

    return resultados.length;
}

abecedario.forEach(function (letra) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = letra;
    boton.dataset.letra = letra;
    boton.setAttribute("aria-label", "Ir a la letra " + letra);
    boton.addEventListener("click", function () {
        const grupo = document.getElementById("letra-" + letra);
        if (grupo) grupo.scrollIntoView();
    });
    indiceLetras.appendChild(boton);
});

buscadorGlosario.addEventListener("input", dibujarGlosario);
dibujarGlosario();


/* =========================================================
   US-13: PREGUNTAS FRECUENTES (ACORDEÓN)
   ========================================================= */
document.querySelectorAll(".pregunta").forEach(function (pregunta) {
    pregunta.addEventListener("click", function () {
        const abierta = pregunta.getAttribute("aria-expanded") === "true";
        pregunta.setAttribute("aria-expanded", String(!abierta));
        document.getElementById(pregunta.getAttribute("aria-controls")).classList.toggle("abierta", !abierta);
    });
});


/* =========================================================
   US-14: APERTURA SEGURA DE ENLACES EXTERNOS
   Si algún enlace externo no tiene los atributos, se los agrega.
   ========================================================= */
function asegurarEnlacesExternos() {
    let corregidos = 0;
    document.querySelectorAll('a[href^="http"]').forEach(function (enlace) {
        if (enlace.hostname !== window.location.hostname) {
            if (enlace.target !== "_blank" || enlace.rel !== "noopener noreferrer") corregidos++;
            enlace.target = "_blank";
            enlace.rel = "noopener noreferrer";
        }
    });
    return corregidos;
}

asegurarEnlacesExternos();


/* =========================================================
   US-15: MOSTRAR / OCULTAR SOLUCIÓN
   ========================================================= */
document.querySelectorAll(".boton-solucion").forEach(function (boton) {
    boton.addEventListener("click", function () {
        const solucion = document.getElementById(boton.getAttribute("aria-controls"));
        const mostrar = solucion.hidden;
        solucion.hidden = !mostrar;
        boton.setAttribute("aria-expanded", String(mostrar));
        boton.textContent = mostrar ? "Ocultar solución" : "Mostrar solución";
    });
});


/* =========================================================
   US-16: EFECTO AL PASAR EL CURSOR POR LOS PERFILES
   ========================================================= */
document.querySelectorAll(".perfil").forEach(function (perfil) {
    function encender() { perfil.classList.add("destacado"); }
    function apagar() { perfil.classList.remove("destacado"); }
    perfil.addEventListener("mouseenter", encender);
    perfil.addEventListener("mouseleave", apagar);
    perfil.addEventListener("focus", encender);
    perfil.addEventListener("blur", apagar);
});


/* =========================================================
   US-17: FORMULARIO DE CONTACTO CON VALIDACIÓN
   ========================================================= */
const formContacto = document.getElementById("formContacto");
const confirmacion = document.getElementById("confirmacion");
const campoMensaje = document.getElementById("mensaje");
const contadorMensaje = document.getElementById("contadorMensaje");

function emailValido(email) {
    // algo@algo.algo, sin espacios
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// Revisa los datos y devuelve un objeto con los errores encontrados
function validarContacto(datos) {
    const errores = {};
    const nombre = datos.nombre.trim();
    const email = datos.email.trim();
    const mensaje = datos.mensaje.trim();

    if (nombre === "") errores.nombre = "El nombre es obligatorio.";
    else if (nombre.length < 3) errores.nombre = "El nombre debe tener al menos 3 letras.";

    if (email === "") errores.email = "El correo es obligatorio.";
    else if (!emailValido(email)) errores.email = "El correo no tiene un formato válido (ejemplo: nombre@correo.com).";

    if (datos.tipo === "") errores.tipo = "Elegí el tipo de mensaje.";

    if (mensaje === "") errores.mensaje = "El mensaje es obligatorio.";
    else if (mensaje.length < 10) errores.mensaje = "El mensaje debe tener al menos 10 caracteres.";

    return errores;
}

function mostrarErrores(errores) {
    ["nombre", "email", "tipo", "mensaje"].forEach(function (campo) {
        const input = document.getElementById(campo);
        const error = document.getElementById("error-" + campo);
        const hayError = Boolean(errores[campo]);
        error.textContent = hayError ? errores[campo] : "";
        input.classList.toggle("invalido", hayError);
        input.setAttribute("aria-invalid", String(hayError));
    });
}

campoMensaje.addEventListener("input", function () {
    contadorMensaje.textContent = campoMensaje.value.length + " / 500 caracteres";
});

formContacto.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const datos = {
        nombre: document.getElementById("nombre").value,
        email: document.getElementById("email").value,
        tipo: document.getElementById("tipo").value,
        mensaje: campoMensaje.value
    };

    const errores = validarContacto(datos);
    mostrarErrores(errores);

    const camposConError = Object.keys(errores);
    if (camposConError.length > 0) {
        confirmacion.hidden = true;
        document.getElementById(camposConError[0]).focus();
        return;
    }

    // No hay servidor: se muestra la confirmación en pantalla.
    // Se usa textContent para que caracteres como < > no se ejecuten como HTML.
    confirmacion.textContent = "¡Gracias, " + datos.nombre.trim() + "! Recibimos tu mensaje y te vamos a responder a " + datos.email.trim() + ".";
    confirmacion.hidden = false;
    formContacto.reset();
    contadorMensaje.textContent = "0 / 500 caracteres";
});


/* =========================================================
   US-18: COMPARADOR DE METODOLOGÍAS
   ========================================================= */
const datosMetodologias = {
    cascada: { nombre: "Cascada", tipo: "Tradicional", enfoque: "Secuencial por fases", roles: "Jefe de proyecto, analistas, programadores, testers", flexibilidad: "baja", entregas: "Una sola al final", documentacion: "Mucha y formal", cliente: "Al inicio y al final", ideal: "Requisitos fijos y claros" },
    modeloV: { nombre: "Modelo en V", tipo: "Tradicional", enfoque: "Secuencial con pruebas por etapa", roles: "Jefe de proyecto, analistas, programadores, testers", flexibilidad: "baja", entregas: "Una sola al final", documentacion: "Mucha y formal", cliente: "Al inicio y en la aceptación", ideal: "Sistemas críticos que exigen verificación" },
    iterativo: { nombre: "Iterativo e incremental", tipo: "Tradicional / evolutivo", enfoque: "Ciclos que agregan funciones", roles: "Jefe de proyecto y equipo de desarrollo", flexibilidad: "media", entregas: "Al final de cada iteración", documentacion: "Moderada", cliente: "Al final de cada iteración", ideal: "Requisitos que pueden cambiar en parte" },
    scrum: { nombre: "Scrum", tipo: "Ágil", enfoque: "Sprints de 1 a 4 semanas", roles: "Product Owner, Scrum Master, Developers", flexibilidad: "alta", entregas: "Un incremento por sprint", documentacion: "La necesaria", cliente: "Constante (Product Owner)", ideal: "Productos nuevos con requisitos cambiantes" },
    kanban: { nombre: "Kanban", tipo: "Ágil", enfoque: "Flujo continuo con límite WIP", roles: "No exige roles nuevos", flexibilidad: "alta", entregas: "Continuas, cuando la tarea está lista", documentacion: "Mínima", cliente: "Constante", ideal: "Soporte y mantenimiento con pedidos continuos" },
    xp: { nombre: "XP", tipo: "Ágil", enfoque: "Prácticas técnicas e iteraciones cortas", roles: "Cliente, programadores, coach, tracker, tester", flexibilidad: "alta", entregas: "Pequeñas y frecuentes (1 a 2 semanas)", documentacion: "Mínima (el código y las pruebas)", cliente: "En el lugar, todo el tiempo", ideal: "Equipos chicos con requisitos muy cambiantes" }
};

const filasComparador = [
    { clave: "tipo", titulo: "Tipo" },
    { clave: "enfoque", titulo: "Enfoque" },
    { clave: "roles", titulo: "Roles principales" },
    { clave: "flexibilidad", titulo: "Flexibilidad ante cambios" },
    { clave: "entregas", titulo: "Entregas" },
    { clave: "documentacion", titulo: "Documentación" },
    { clave: "cliente", titulo: "Participación del cliente" },
    { clave: "ideal", titulo: "Ideal para" }
];

const formComparador = document.getElementById("formComparador");
const tablaComparador = document.getElementById("tablaComparador");
const contenedorTabla = document.getElementById("contenedorTabla");
const mensajeComparador = document.getElementById("mensajeComparador");

function metodologiasElegidas() {
    return Array.from(formComparador.querySelectorAll('input[name="metodo"]:checked'))
        .map(function (casilla) { return casilla.value; });
}

function dibujarComparador() {
    const elegidas = metodologiasElegidas().filter(function (id) { return datosMetodologias[id]; });
    const thead = tablaComparador.querySelector("thead");
    const tbody = tablaComparador.querySelector("tbody");
    thead.innerHTML = "";
    tbody.innerHTML = "";

    if (elegidas.length < 2) {
        contenedorTabla.hidden = true;
        mensajeComparador.textContent = elegidas.length === 0
            ? "Seleccioná al menos dos metodologías para ver la tabla."
            : "Elegiste 1. Seleccioná al menos una más para comparar.";
        return 0;
    }

    // Encabezado
    const filaTitulos = document.createElement("tr");
    const esquina = document.createElement("th");
    esquina.scope = "col";
    esquina.textContent = "Característica";
    filaTitulos.appendChild(esquina);
    elegidas.forEach(function (id) {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = datosMetodologias[id].nombre;
        filaTitulos.appendChild(th);
    });
    thead.appendChild(filaTitulos);

    // Filas
    filasComparador.forEach(function (fila) {
        const tr = document.createElement("tr");
        const th = document.createElement("th");
        th.scope = "row";
        th.textContent = fila.titulo;
        tr.appendChild(th);

        elegidas.forEach(function (id) {
            const td = document.createElement("td");
            const valor = datosMetodologias[id][fila.clave];
            if (fila.clave === "flexibilidad") {
                const indicador = document.createElement("span");
                indicador.className = "indicador " + valor;
                indicador.textContent = valor.charAt(0).toUpperCase() + valor.slice(1);
                td.appendChild(indicador);
            } else {
                td.textContent = valor;
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    contenedorTabla.hidden = false;
    mensajeComparador.textContent = "Comparando " + elegidas.length + " metodologías.";
    return elegidas.length;
}

formComparador.addEventListener("change", dibujarComparador);

document.getElementById("limpiarComparador").addEventListener("click", function () {
    formComparador.querySelectorAll('input[name="metodo"]').forEach(function (casilla) {
        casilla.checked = false;
    });
    dibujarComparador();
});

dibujarComparador();


/* =========================================================
   US-19: ENCUESTA DE PREFERENCIAS (ASISTENTE PASO A PASO)
   Cada respuesta suma puntos a Scrum, Kanban o Cascada.
   ========================================================= */
const preguntasEncuesta = [
    {
        texto: "¿Qué tan claros están los requisitos al empezar?",
        opciones: [
            { texto: "Muy claros y no van a cambiar", puntos: { scrum: 0, kanban: 1, cascada: 3 } },
            { texto: "Bastante claros, pero puede haber cambios", puntos: { scrum: 2, kanban: 2, cascada: 1 } },
            { texto: "Poco claros, van a ir apareciendo", puntos: { scrum: 3, kanban: 2, cascada: 0 } }
        ]
    },
    {
        texto: "¿Cómo le llega el trabajo al equipo?",
        opciones: [
            { texto: "Todo planificado desde el principio", puntos: { scrum: 1, kanban: 0, cascada: 3 } },
            { texto: "En bloques de funciones que se pueden priorizar", puntos: { scrum: 3, kanban: 1, cascada: 0 } },
            { texto: "Pedidos continuos e imprevisibles (soporte, mantenimiento)", puntos: { scrum: 1, kanban: 3, cascada: 0 } }
        ]
    },
    {
        texto: "¿Cada cuánto quiere ver avances el cliente?",
        opciones: [
            { texto: "Solo cuando esté todo terminado", puntos: { scrum: 0, kanban: 0, cascada: 3 } },
            { texto: "Cada 2 a 4 semanas", puntos: { scrum: 3, kanban: 1, cascada: 0 } },
            { texto: "Apenas cada tarea esté lista", puntos: { scrum: 1, kanban: 3, cascada: 0 } }
        ]
    },
    {
        texto: "¿Cómo es el tamaño y la complejidad del proyecto?",
        opciones: [
            { texto: "Chico y simple", puntos: { scrum: 1, kanban: 2, cascada: 1 } },
            { texto: "Mediano, con varias partes", puntos: { scrum: 2, kanban: 1, cascada: 1 } },
            { texto: "Grande, complejo y con documentación obligatoria (normas, contratos)", puntos: { scrum: 1, kanban: 0, cascada: 3 } }
        ]
    },
    {
        texto: "¿Cómo prefiere organizarse el equipo?",
        opciones: [
            { texto: "Con roles fijos (Product Owner, Scrum Master) y reuniones periódicas", puntos: { scrum: 3, kanban: 0, cascada: 1 } },
            { texto: "Con pocas reglas, mejorando el flujo de trabajo", puntos: { scrum: 0, kanban: 3, cascada: 0 } },
            { texto: "Con un jefe de proyecto y etapas que se aprueban", puntos: { scrum: 0, kanban: 0, cascada: 3 } }
        ]
    }
];

const nombresResultado = {
    scrum: { nombre: "Scrum", tipo: "ágil" },
    kanban: { nombre: "Kanban", tipo: "ágil" },
    cascada: { nombre: "Cascada", tipo: "tradicional" }
};

/* Calcula el resultado a partir de las respuestas (posición de la opción elegida en cada pregunta).
   Devuelve los puntos, los porcentajes y la(s) metodología(s) ganadora(s). */
function calcularResultado(respuestas) {
    const puntos = { scrum: 0, kanban: 0, cascada: 0 };

    respuestas.forEach(function (opcionElegida, i) {
        const pregunta = preguntasEncuesta[i];
        if (!pregunta || !pregunta.opciones[opcionElegida]) return;
        const suma = pregunta.opciones[opcionElegida].puntos;
        puntos.scrum += suma.scrum;
        puntos.kanban += suma.kanban;
        puntos.cascada += suma.cascada;
    });

    const total = puntos.scrum + puntos.kanban + puntos.cascada;
    const porcentajes = {};
    Object.keys(puntos).forEach(function (clave) {
        porcentajes[clave] = total === 0 ? 0 : Math.round(puntos[clave] * 100 / total);
    });

    const maximo = Math.max(puntos.scrum, puntos.kanban, puntos.cascada);
    const ganadoras = Object.keys(puntos).filter(function (clave) { return puntos[clave] === maximo; });

    return { puntos: puntos, porcentajes: porcentajes, ganadoras: ganadoras };
}

const formEncuesta = document.getElementById("formEncuesta");
const preguntaActual = document.getElementById("preguntaActual");
const errorEncuesta = document.getElementById("errorEncuesta");
const botonAnteriorEncuesta = document.getElementById("encuestaAnterior");
const botonSiguienteEncuesta = document.getElementById("encuestaSiguiente");
const resultadoEncuesta = document.getElementById("resultadoEncuesta");
const pasoTexto = document.getElementById("pasoTexto");
const barraProgreso = document.getElementById("barraProgreso");
const rellenoProgreso = document.getElementById("rellenoProgreso");

let pasoEncuesta = 0;
let respuestasEncuesta = [];

function actualizarProgreso(porcentaje, texto) {
    rellenoProgreso.style.width = porcentaje + "%";
    barraProgreso.setAttribute("aria-valuenow", String(porcentaje));
    pasoTexto.textContent = texto;
}

function mostrarPregunta() {
    const pregunta = preguntasEncuesta[pasoEncuesta];
    errorEncuesta.textContent = "";
    preguntaActual.innerHTML = "";

    const grupo = document.createElement("fieldset");
    grupo.className = "pregunta-encuesta";
    const leyenda = document.createElement("legend");
    leyenda.textContent = (pasoEncuesta + 1) + ". " + pregunta.texto;
    grupo.appendChild(leyenda);

    pregunta.opciones.forEach(function (opcion, i) {
        const etiqueta = document.createElement("label");
        etiqueta.className = "opcion-encuesta";
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "respuesta";
        radio.value = String(i);
        if (respuestasEncuesta[pasoEncuesta] === i) radio.checked = true;
        const texto = document.createElement("span");
        texto.textContent = opcion.texto;
        etiqueta.append(radio, texto);
        grupo.appendChild(etiqueta);
    });

    preguntaActual.appendChild(grupo);

    const total = preguntasEncuesta.length;
    actualizarProgreso(Math.round((pasoEncuesta + 1) * 100 / total), "Pregunta " + (pasoEncuesta + 1) + " de " + total);
    botonAnteriorEncuesta.disabled = pasoEncuesta === 0;
    botonSiguienteEncuesta.textContent = pasoEncuesta === total - 1 ? "Ver resultado" : "Siguiente →";
}

function mostrarResultado() {
    const resultado = calcularResultado(respuestasEncuesta);
    formEncuesta.hidden = true;
    resultadoEncuesta.hidden = false;
    resultadoEncuesta.innerHTML = "";
    actualizarProgreso(100, "¡Encuesta completa!");

    const titulo = document.createElement("h4");
    titulo.textContent = "Resultado de la encuesta";
    resultadoEncuesta.appendChild(titulo);

    // barras ordenadas de mayor a menor
    Object.keys(resultado.porcentajes)
        .sort(function (a, b) { return resultado.puntos[b] - resultado.puntos[a]; })
        .forEach(function (clave) {
            const barra = document.createElement("div");
            barra.className = "barra-resultado" + (resultado.ganadoras.indexOf(clave) !== -1 ? " ganadora" : "");
            barra.dataset.metodo = clave;
            barra.innerHTML = '<div class="fila"><span></span><span></span></div><div class="fondo"><div class="relleno"></div></div>';
            barra.querySelector(".fila span:first-child").textContent = nombresResultado[clave].nombre;
            barra.querySelector(".fila span:last-child").textContent = resultado.porcentajes[clave] + "%";
            barra.querySelector(".relleno").style.width = resultado.porcentajes[clave] + "%";
            resultadoEncuesta.appendChild(barra);
        });

    const recomendacion = document.createElement("div");
    recomendacion.className = "recomendacion";
    recomendacion.id = "textoRecomendacion";
    const ganadora = nombresResultado[resultado.ganadoras[0]];
    if (resultado.ganadoras.length === 1) {
        recomendacion.innerHTML = "<strong>Te recomendamos: </strong>";
        recomendacion.append(ganadora.nombre + " (enfoque " + ganadora.tipo + "), con " + resultado.porcentajes[resultado.ganadoras[0]] + "% de coincidencia.");
    } else {
        const nombres = resultado.ganadoras.map(function (c) { return nombresResultado[c].nombre; }).join(" y ");
        recomendacion.innerHTML = "<strong>Hay un empate: </strong>";
        recomendacion.append(nombres + " se adaptan igual de bien. Podrías combinarlas.");
    }
    resultadoEncuesta.appendChild(recomendacion);

    const repetir = document.createElement("button");
    repetir.type = "button";
    repetir.className = "boton boton-secundario";
    repetir.id = "repetirEncuesta";
    repetir.textContent = "Volver a empezar";
    repetir.addEventListener("click", reiniciarEncuesta);
    resultadoEncuesta.appendChild(repetir);
    titulo.tabIndex = -1;
    titulo.focus();
}

function reiniciarEncuesta() {
    pasoEncuesta = 0;
    respuestasEncuesta = [];
    resultadoEncuesta.hidden = true;
    formEncuesta.hidden = false;
    mostrarPregunta();
}

botonSiguienteEncuesta.addEventListener("click", function () {
    const elegida = formEncuesta.querySelector('input[name="respuesta"]:checked');
    if (!elegida) {
        errorEncuesta.textContent = "Elegí una opción para continuar.";
        return;
    }
    respuestasEncuesta[pasoEncuesta] = Number(elegida.value);

    if (pasoEncuesta < preguntasEncuesta.length - 1) {
        pasoEncuesta++;
        mostrarPregunta();
    } else {
        mostrarResultado();
    }
});

botonAnteriorEncuesta.addEventListener("click", function () {
    if (pasoEncuesta > 0) {
        pasoEncuesta--;
        mostrarPregunta();
    }
});

mostrarPregunta();
