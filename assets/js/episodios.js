/**
 * Episodios: filtros, orden, ficha en modal y valoración con estrellas.
 * Cada voto se envía a POST /api/valoraciones y se guarda en PostgreSQL.
 */
"use strict";

const estadoEpisodios = {
  datos: [],
  temporada: "Todas",
  orden: "orden",
  episodioActual: null,
};

document.addEventListener("DOMContentLoaded", async () => {
  await cargarEpisodios();
  conectarControles();
  abrirDesdeHash();
});

async function cargarEpisodios() {
  const contenedor = document.getElementById("listaEpisodios");
  if (!contenedor) return;

  try {
    const { datos } = await MA.pedirJSON("/api/episodios");
    estadoEpisodios.datos = datos;
    crearFiltrosTemporada(datos);
    pintarEpisodios();
    actualizarResumen();
    contenedor.setAttribute("aria-busy", "false");
  } catch (error) {
    contenedor.innerHTML = MA.componentes.estadoError(error.message);
    contenedor.setAttribute("aria-busy", "false");
    const contador = document.getElementById("contadorEpisodios");
    if (contador) contador.textContent = "Sin datos";
  }
}

function crearFiltrosTemporada(datos) {
  const contenedor = document.getElementById("filtrosTemporada");
  if (!contenedor) return;

  const temporadas = [...new Set(datos.map((episodio) => episodio.temporada))].sort();
  const opciones = ["Todas", ...temporadas];

  contenedor.innerHTML = opciones
    .map(
      (temporada) => `
        <button type="button" class="filtro-chip${temporada === estadoEpisodios.temporada ? " activo" : ""}"
                data-temporada="${MA.esc(temporada)}" aria-pressed="${temporada === estadoEpisodios.temporada}">
          ${temporada === "Todas" ? "Todas" : `Temporada ${MA.esc(temporada)}`}
        </button>
      `
    )
    .join("");

  contenedor.querySelectorAll("[data-temporada]").forEach((boton) => {
    boton.addEventListener("click", () => {
      estadoEpisodios.temporada = boton.dataset.temporada;
      contenedor.querySelectorAll("[data-temporada]").forEach((otro) => {
        const activo = otro === boton;
        otro.classList.toggle("activo", activo);
        otro.setAttribute("aria-pressed", String(activo));
      });
      pintarEpisodios();
    });
  });
}

function conectarControles() {
  document.getElementById("ordenEpisodios")?.addEventListener("change", (evento) => {
    estadoEpisodios.orden = evento.target.value;
    pintarEpisodios();
  });

  const modal = document.getElementById("modalEpisodio");
  modal?.addEventListener("show.bs.modal", (evento) => {
    const id = Number(evento.relatedTarget?.dataset?.id);
    mostrarEpisodio(id);
  });

  modal?.addEventListener("hidden.bs.modal", () => {
    estadoEpisodios.episodioActual = null;
    document.getElementById("formValoracion")?.reset();
    const estado = document.getElementById("estadoValoracion");
    if (estado) estado.textContent = "";
  });

  document.getElementById("formValoracion")?.addEventListener("submit", enviarValoracion);
}

function pintarEpisodios() {
  const contenedor = document.getElementById("listaEpisodios");
  const contador = document.getElementById("contadorEpisodios");
  if (!contenedor) return;

  let lista = estadoEpisodios.datos.filter(
    (episodio) =>
      estadoEpisodios.temporada === "Todas" ||
      String(episodio.temporada) === String(estadoEpisodios.temporada)
  );

  if (estadoEpisodios.orden === "popularidad") {
    lista = [...lista].sort((a, b) => b.popularidad - a.popularidad);
  } else if (estadoEpisodios.orden === "promedio") {
    lista = [...lista].sort((a, b) => b.promedio - a.promedio);
  }

  if (contador) contador.textContent = `${lista.length} episodios`;

  if (lista.length === 0) {
    contenedor.innerHTML = MA.componentes.estadoVacio(
      "No hay episodios en esta temporada",
      "Prueba con otra temporada o vuelve a “Todas”."
    );
    return;
  }

  contenedor.innerHTML = lista
    .map(
      (episodio) =>
        `<div class="col-12 col-sm-6 col-lg-4">${MA.componentes.tarjetaEpisodio(episodio, { enlace: false })}</div>`
    )
    .join("");

  MA.observarRevelado(contenedor);
}

function actualizarResumen() {
  const datos = estadoEpisodios.datos;
  const votos = datos.reduce((total, episodio) => total + Number(episodio.totalValoraciones || 0), 0);
  const suma = datos.reduce(
    (total, episodio) => total + Number(episodio.promedio || 0) * Number(episodio.totalValoraciones || 0),
    0
  );
  const promedio = votos > 0 ? suma / votos : 0;

  const set = (id, valor) => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor;
  };

  set("resumenEpisodios", MA.numero(datos.length));
  set("resumenVotos", MA.numero(votos));
  set("resumenPromedio", promedio.toFixed(1));
}

function mostrarEpisodio(id) {
  const episodio = estadoEpisodios.datos.find((dato) => Number(dato.id) === Number(id));
  if (!episodio) return;

  estadoEpisodios.episodioActual = episodio;

  document.getElementById("tituloEpisodio").textContent = episodio.titulo;
  document.getElementById("epTemporada").textContent = `T${episodio.temporada} · E${episodio.numero}`;
  document.getElementById("epSinopsis").textContent = episodio.sinopsis;
  document.getElementById("epMeta").textContent =
    `${episodio.duracion} · Título original: ${episodio.tituloOriginal || "—"}`;

  const imagen = document.getElementById("epImagen");
  imagen.src = episodio.imagen;
  imagen.alt = `Escena del episodio ${episodio.titulo}`;

  document.getElementById("epPopularidadTexto").textContent = `${episodio.popularidad}%`;
  document.getElementById("epPopularidadFill").style.width = `${episodio.popularidad}%`;
  document.getElementById("epPopularidadBarra").setAttribute("aria-valuenow", episodio.popularidad);

  actualizarValoracionModal(episodio);

  document.getElementById("formValoracion").reset();
  const estado = document.getElementById("estadoValoracion");
  if (estado) estado.textContent = "";
}

function actualizarValoracionModal(episodio) {
  document.getElementById("epPromedio").textContent = Number(episodio.promedio || 0).toFixed(1);
  document.getElementById("epTotal").textContent =
    `(${MA.numero(episodio.totalValoraciones)} ${Number(episodio.totalValoraciones) === 1 ? "valoración" : "valoraciones"})`;
  document.getElementById("epEstrellas").innerHTML = MA.estrellas(episodio.promedio);
}

async function enviarValoracion(evento) {
  evento.preventDefault();

  const episodio = estadoEpisodios.episodioActual;
  const estado = document.getElementById("estadoValoracion");
  const boton = document.getElementById("btnValorar");
  if (!episodio) return;

  const seleccion = document.querySelector('input[name="puntuacion"]:checked');
  if (!seleccion) {
    if (estado) {
      estado.textContent = "Elige una calificación de 1 a 5 estrellas.";
      estado.className = "small mt-2 mb-0 text-danger fw-bold";
    }
    return;
  }

  const puntuacion = Number(seleccion.value);
  boton.disabled = true;
  boton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Enviando…';

  try {
    const respuesta = await MA.pedirJSON("/api/valoraciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodioId: episodio.id, puntuacion }),
    });

    episodio.promedio = respuesta.promedio;
    episodio.totalValoraciones = respuesta.total;

    actualizarValoracionModal(episodio);
    pintarEpisodios();
    actualizarResumen();

    if (estado) {
      estado.textContent = respuesta.mensaje || "¡Gracias por calificar!";
      estado.className = "small mt-2 mb-0 text-success fw-bold";
    }
    MA.aviso("Tu calificación quedó guardada en la base de datos.", "success", "¡Voto registrado!");
  } catch (error) {
    if (estado) {
      estado.textContent = error.message;
      estado.className = "small mt-2 mb-0 text-danger fw-bold";
    }
    MA.aviso(error.message, "danger");
  } finally {
    boton.disabled = false;
    boton.innerHTML = '<i class="bi bi-star me-1" aria-hidden="true"></i>Enviar calificación';
  }
}

function abrirDesdeHash() {
  const coincidencia = window.location.hash.match(/^#ep-(\d+)$/);
  if (!coincidencia) return;

  const boton = document.querySelector(`[data-id="${coincidencia[1]}"]`);
  if (boton) boton.click();
}
