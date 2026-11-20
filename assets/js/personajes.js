/**
 * Personajes: búsqueda, filtro por rol, orden y ficha en modal.
 */
"use strict";

const estadoPersonajes = {
  datos: [],
  rol: "Todos",
  busqueda: "",
  orden: "orden",
};

document.addEventListener("DOMContentLoaded", async () => {
  await cargarPersonajes();
  conectarFiltros();
  abrirDesdeHash();
});

async function cargarPersonajes() {
  const contenedor = document.getElementById("listaPersonajes");
  if (!contenedor) return;

  try {
    const { datos } = await MA.pedirJSON("/api/personajes");
    estadoPersonajes.datos = datos;
    crearFiltros(datos);
    pintarPersonajes();
    contenedor.setAttribute("aria-busy", "false");
  } catch (error) {
    contenedor.innerHTML = MA.componentes.estadoError(error.message);
    contenedor.setAttribute("aria-busy", "false");
    const contador = document.getElementById("contadorPersonajes");
    if (contador) contador.textContent = "Sin datos";
  }
}

function crearFiltros(datos) {
  const contenedor = document.getElementById("filtrosRol");
  if (!contenedor) return;

  const roles = ["Todos", ...new Set(datos.map((personaje) => personaje.rol))];
  contenedor.innerHTML = roles
    .map(
      (rol) => `
        <button type="button" class="filtro-chip${rol === estadoPersonajes.rol ? " activo" : ""}"
                data-rol="${MA.esc(rol)}" aria-pressed="${rol === estadoPersonajes.rol}">
          ${MA.esc(rol)}
        </button>
      `
    )
    .join("");

  contenedor.querySelectorAll("[data-rol]").forEach((boton) => {
    boton.addEventListener("click", () => {
      estadoPersonajes.rol = boton.dataset.rol;
      contenedor.querySelectorAll("[data-rol]").forEach((otro) => {
        const activo = otro === boton;
        otro.classList.toggle("activo", activo);
        otro.setAttribute("aria-pressed", String(activo));
      });
      pintarPersonajes();
    });
  });
}

function conectarFiltros() {
  const buscador = document.getElementById("buscadorPersonajes");
  const limpiar = document.getElementById("limpiarBusqueda");
  const orden = document.getElementById("ordenPersonajes");

  buscador?.addEventListener("input", () => {
    estadoPersonajes.busqueda = buscador.value.trim().toLowerCase();
    pintarPersonajes();
  });

  limpiar?.addEventListener("click", () => {
    if (!buscador) return;
    buscador.value = "";
    estadoPersonajes.busqueda = "";
    buscador.focus();
    pintarPersonajes();
  });

  orden?.addEventListener("change", () => {
    estadoPersonajes.orden = orden.value;
    pintarPersonajes();
  });
}

function pintarPersonajes() {
  const contenedor = document.getElementById("listaPersonajes");
  const contador = document.getElementById("contadorPersonajes");
  if (!contenedor) return;

  const texto = estadoPersonajes.busqueda;
  let lista = estadoPersonajes.datos.filter((personaje) => {
    const coincideRol =
      estadoPersonajes.rol === "Todos" || personaje.rol === estadoPersonajes.rol;
    const heno = `${personaje.nombre} ${personaje.descripcion} ${personaje.rasgos.join(" ")}`
      .toLowerCase();
    const coincideTexto = !texto || heno.includes(texto);
    return coincideRol && coincideTexto;
  });

  if (estadoPersonajes.orden === "nombre") {
    lista = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  } else if (estadoPersonajes.orden === "rol") {
    lista = [...lista].sort((a, b) => a.rol.localeCompare(b.rol, "es"));
  }

  if (contador) {
    contador.textContent = `${lista.length} de ${estadoPersonajes.datos.length} personajes`;
  }

  if (lista.length === 0) {
    contenedor.innerHTML = MA.componentes.estadoVacio(
      "No encontramos ese personaje",
      "Prueba con otro nombre, un rasgo o cambia el filtro de rol."
    );
    return;
  }

  contenedor.innerHTML = lista
    .map(
      (personaje) =>
        `<div class="col-12 col-sm-6 col-lg-4">${MA.componentes.tarjetaPersonaje(personaje, { enlace: false })}</div>`
    )
    .join("");

  MA.observarRevelado(contenedor);
  conectarModal();
}

function conectarModal() {
  const modal = document.getElementById("modalPersonaje");
  if (!modal) return;

  modal.addEventListener("show.bs.modal", (evento) => {
    const disparador = evento.relatedTarget;
    const slug = disparador?.dataset?.slug;
    const personaje = estadoPersonajes.datos.find((dato) => dato.slug === slug);
    if (!personaje) return;

    document.getElementById("tituloPersonaje").textContent = personaje.nombre;
    document.getElementById("pjRol").textContent = personaje.rol;
    document.getElementById("pjEmoji").textContent = personaje.emoji;
    document.getElementById("pjDescripcion").textContent = personaje.descripcionLarga;
    document.getElementById("pjAparicion").textContent = personaje.primeraAparicion || "—";
    document.getElementById("pjFrase").textContent = personaje.frase || "—";

    const figura = document.getElementById("pjFigura");
    figura.style.setProperty("--tono", `${personaje.color}55`);

    const imagen = document.getElementById("pjImagen");
    imagen.src = personaje.imagen;
    imagen.alt = `Ilustración de ${personaje.nombre}`;

    const rasgos = document.getElementById("pjRasgos");
    rasgos.innerHTML = (personaje.rasgos || [])
      .map((rasgo) => `<span class="badge badge-suave rounded-pill">${MA.esc(rasgo)}</span>`)
      .join("");
  });

  modal.addEventListener("hidden.bs.modal", () => {
    const imagen = document.getElementById("pjImagen");
    imagen.removeAttribute("src");
    imagen.alt = "";
  });
}

function abrirDesdeHash() {
  const slug = decodeURIComponent(window.location.hash.replace("#", "").trim());
  if (!slug) return;

  const personaje = estadoPersonajes.datos.find((dato) => dato.slug === slug);
  if (!personaje) return;

  // Se busca el botón de esa ficha y se abre el modal con sus datos.
  const boton = document.querySelector(`[data-slug="${CSS.escape(slug)}"]`);
  if (boton) {
    boton.click();
  }
}
