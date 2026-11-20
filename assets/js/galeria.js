/**
 * Galería: filtros por categoría y visor con navegación (ratón y teclado).
 */
"use strict";

const estadoGaleria = {
  datos: [],
  categoria: "Todas",
  visibles: [],
  indice: 0,
};

document.addEventListener("DOMContentLoaded", async () => {
  await cargarGaleria();
  conectarVisor();
});

async function cargarGaleria() {
  const contenedor = document.getElementById("listaGaleria");
  if (!contenedor) return;

  try {
    const { datos } = await MA.pedirJSON("/api/galeria");
    estadoGaleria.datos = datos;
    crearFiltrosGaleria(datos);
    pintarGaleria();
    contenedor.setAttribute("aria-busy", "false");
  } catch (error) {
    contenedor.innerHTML = MA.componentes.estadoError(error.message);
    contenedor.setAttribute("aria-busy", "false");
    const contador = document.getElementById("contadorGaleria");
    if (contador) contador.textContent = "No se pudieron cargar las imágenes.";
  }
}

function crearFiltrosGaleria(datos) {
  const contenedor = document.getElementById("filtrosGaleria");
  if (!contenedor) return;

  const categorias = ["Todas", ...new Set(datos.map((imagen) => imagen.categoria))];
  contenedor.innerHTML = categorias
    .map(
      (categoria) => `
        <button type="button" class="filtro-chip${categoria === estadoGaleria.categoria ? " activo" : ""}"
                data-categoria="${MA.esc(categoria)}" aria-pressed="${categoria === estadoGaleria.categoria}">
          ${MA.esc(categoria)}
        </button>
      `
    )
    .join("");

  contenedor.querySelectorAll("[data-categoria]").forEach((boton) => {
    boton.addEventListener("click", () => {
      estadoGaleria.categoria = boton.dataset.categoria;
      contenedor.querySelectorAll("[data-categoria]").forEach((otro) => {
        const activo = otro === boton;
        otro.classList.toggle("activo", activo);
        otro.setAttribute("aria-pressed", String(activo));
      });
      pintarGaleria();
    });
  });
}

function pintarGaleria() {
  const contenedor = document.getElementById("listaGaleria");
  const contador = document.getElementById("contadorGaleria");
  if (!contenedor) return;

  estadoGaleria.visibles = estadoGaleria.datos.filter(
    (imagen) =>
      estadoGaleria.categoria === "Todas" || imagen.categoria === estadoGaleria.categoria
  );

  if (contador) {
    const total = estadoGaleria.visibles.length;
    contador.textContent = `${total} ${total === 1 ? "imagen" : "imágenes"} en ${
      estadoGaleria.categoria === "Todas" ? "todas las categorías" : estadoGaleria.categoria
    } · Toca una para ampliarla`;
  }

  if (estadoGaleria.visibles.length === 0) {
    contenedor.innerHTML = MA.componentes.estadoVacio(
      "No hay imágenes en esta categoría",
      "Selecciona otra categoría para seguir explorando."
    );
    return;
  }

  contenedor.innerHTML = estadoGaleria.visibles
    .map(
      (imagen, indice) =>
        `<div class="col-6 col-md-4 col-lg-3">${MA.componentes.itemGaleria(imagen, indice)}</div>`
    )
    .join("");

  MA.observarRevelado(contenedor);
  conectarItems();
}

function conectarItems() {
  document.querySelectorAll("#listaGaleria .galeria-item").forEach((boton) => {
    boton.addEventListener("click", () => {
      mostrarImagen(Number(boton.dataset.indice));
      bootstrap.Modal.getOrCreateInstance(document.getElementById("modalGaleria")).show();
    });
  });
}

function mostrarImagen(indice) {
  const total = estadoGaleria.visibles.length;
  if (!total) return;

  estadoGaleria.indice = ((indice % total) + total) % total;
  const imagen = estadoGaleria.visibles[estadoGaleria.indice];

  const visor = document.getElementById("visorImagen");
  visor.src = imagen.imagenXl || imagen.imagen;
  visor.alt = imagen.alt;
  document.getElementById("tituloVisor").textContent = imagen.titulo;
  document.getElementById("visorTexto").textContent = `${imagen.descripcion} · ${imagen.categoria}`;
  document.getElementById("visorContador").textContent =
    `${estadoGaleria.indice + 1} / ${total}`;
}

function conectarVisor() {
  const modal = document.getElementById("modalGaleria");
  if (!modal) return;

  document.getElementById("visorAnterior")?.addEventListener("click", () => {
    mostrarImagen(estadoGaleria.indice - 1);
  });
  document.getElementById("visorSiguiente")?.addEventListener("click", () => {
    mostrarImagen(estadoGaleria.indice + 1);
  });

  document.addEventListener("keydown", (evento) => {
    if (!modal.classList.contains("show")) return;
    if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      mostrarImagen(estadoGaleria.indice - 1);
    } else if (evento.key === "ArrowRight") {
      evento.preventDefault();
      mostrarImagen(estadoGaleria.indice + 1);
    }
  });

  modal.addEventListener("hidden.bs.modal", () => {
    const visor = document.getElementById("visorImagen");
    visor.removeAttribute("src");
    visor.alt = "";
  });
}
