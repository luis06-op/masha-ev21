/**
 * Portada: carga las cifras, tres personajes, tres episodios y una
 * vista previa de la galería desde la API.
 */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  cargarCifras();
  cargarPersonajes();
  cargarEpisodios();
  cargarGaleria();
});

async function cargarCifras() {
  try {
    const { datos } = await MA.pedirJSON("/api/estadisticas");
    document.querySelectorAll('[data-stat="personajes"]').forEach((el) => {
      el.textContent = MA.numero(datos.personajes);
    });
    document.querySelectorAll('[data-stat="episodios"]').forEach((el) => {
      el.textContent = MA.numero(datos.episodios);
    });
    document.querySelectorAll('[data-stat="imagenes"]').forEach((el) => {
      el.textContent = MA.numero(datos.imagenes);
    });
    document.querySelectorAll('[data-stat="promedio"]').forEach((el) => {
      el.textContent = Number(datos.promedio || 0).toFixed(1);
    });
  } catch (error) {
    console.warn("No se pudieron cargar las cifras:", error.message);
  }
}

async function cargarPersonajes() {
  const contenedor = document.getElementById("personajesDestacados");
  if (!contenedor) return;

  try {
    const { datos } = await MA.pedirJSON("/api/personajes");
    const favoritos = ["masha", "el-oso", "las-liebres"];
    const seleccion = favoritos
      .map((slug) => datos.find((personaje) => personaje.slug === slug))
      .filter(Boolean);

    const lista = (seleccion.length >= 3 ? seleccion : datos).slice(0, 3);

    contenedor.innerHTML = lista
      .map((personaje) => `<div class="col-12 col-sm-6 col-lg-4">${MA.componentes.tarjetaPersonaje(personaje)}</div>`)
      .join("");

    contenedor.setAttribute("aria-busy", "false");
    MA.observarRevelado(contenedor);
  } catch (error) {
    contenedor.innerHTML = MA.componentes.estadoError(error.message);
    contenedor.setAttribute("aria-busy", "false");
  }
}

async function cargarEpisodios() {
  const contenedor = document.getElementById("episodiosDestacados");
  if (!contenedor) return;

  try {
    const { datos } = await MA.pedirJSON("/api/episodios");
    const destacados = datos.filter((episodio) => episodio.destacado);
    const lista = (destacados.length >= 3 ? destacados : datos).slice(0, 3);

    contenedor.innerHTML = lista
      .map((episodio) => `<div class="col-12 col-md-4">${MA.componentes.tarjetaEpisodio(episodio)}</div>`)
      .join("");

    contenedor.setAttribute("aria-busy", "false");
    MA.observarRevelado(contenedor);
  } catch (error) {
    contenedor.innerHTML = MA.componentes.estadoError(error.message);
    contenedor.setAttribute("aria-busy", "false");
  }
}

async function cargarGaleria() {
  const contenedor = document.getElementById("galeriaDestacada");
  if (!contenedor) return;

  try {
    const { datos } = await MA.pedirJSON("/api/galeria");
    const indices = [0, 4, 7, 11, 17, 22];
    const lista = indices
      .map((indice) => datos[indice])
      .filter(Boolean);

    contenedor.innerHTML = lista
      .map(
        (imagen, indice) =>
          `<div class="col-6 col-md-4">${MA.componentes.itemGaleria(imagen, indice)}</div>`
      )
      .join("");

    contenedor.setAttribute("aria-busy", "false");
    MA.observarRevelado(contenedor);
    prepararVisor(lista);
  } catch (error) {
    contenedor.innerHTML = MA.componentes.estadoError(error.message);
    contenedor.setAttribute("aria-busy", "false");
  }
}

function prepararVisor(imagenes) {
  const modal = document.getElementById("modalGaleria");
  const imagen = document.getElementById("visorImagen");
  const texto = document.getElementById("visorTexto");
  const titulo = document.getElementById("tituloVisor");
  if (!modal || !imagen || !texto) return;

  const mostrar = (indice) => {
    const datos = imagenes[indice];
    if (!datos) return;
    imagen.src = datos.imagenXl || datos.imagen;
    imagen.alt = datos.alt;
    texto.textContent = `${datos.titulo} · ${datos.descripcion}`;
    if (titulo) titulo.textContent = datos.titulo;
  };

  document.querySelectorAll("#galeriaDestacada .galeria-item").forEach((boton) => {
    boton.addEventListener("click", () => {
      mostrar(Number(boton.dataset.indice));
      bootstrap.Modal.getOrCreateInstance(modal).show();
    });
  });

  modal.addEventListener("hidden.bs.modal", () => {
    imagen.removeAttribute("src");
    imagen.alt = "";
    texto.textContent = "";
  });
}
