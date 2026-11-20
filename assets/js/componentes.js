/**
 * Componentes reutilizables: tarjetas de personaje, episodio y galería.
 * Se construyen con plantillas de texto y se escapan todos los datos que
 * vienen de la base de datos con MA.esc().
 */
"use strict";

MA.componentes = (() => {
  function colorSeguro(color) {
    return /^#[0-9a-f]{6}$/i.test(String(color || "")) ? color : "#d81b60";
  }

  function tarjetaPersonaje(personaje, { enlace = true } = {}) {
    const destino = `personajes.html#${encodeURIComponent(personaje.slug)}`;
    const boton = enlace
      ? `<a class="btn btn-sm btn-contorno" href="${destino}">
           Ver ficha <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>
         </a>`
      : `<button type="button" class="btn btn-sm btn-contorno" data-bs-toggle="modal"
                 data-bs-target="#modalPersonaje" data-slug="${MA.esc(personaje.slug)}">
           Ver ficha <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>
         </button>`;

    return `
      <article class="tarjeta-personaje revelar">
        <figure class="personaje-figura" style="--tono:${colorSeguro(personaje.color)}55;">
          <span class="personaje-emoji" aria-hidden="true">${MA.esc(personaje.emoji)}</span>
          <img src="${MA.esc(personaje.imagen)}" alt="Ilustración de ${MA.esc(personaje.nombre)}"
               loading="lazy" width="360" height="330">
        </figure>
        <div class="personaje-cuerpo">
          <p class="personaje-rol mb-1">${MA.esc(personaje.rol)}</p>
          <h3 class="personaje-nombre">${MA.esc(personaje.nombre)}</h3>
          <p class="personaje-descripcion">${MA.esc(personaje.descripcion)}</p>
          ${boton}
        </div>
      </article>
    `;
  }

  function tarjetaEpisodio(episodio, { enlace = true } = {}) {
    const promedio = Number(episodio.promedio) || 0;
    const total = Number(episodio.totalValoraciones) || 0;
    const destino = `episodios.html#ep-${episodio.id}`;
    const boton = enlace
      ? `<a class="btn btn-sm btn-contorno" href="${destino}">
           Calificar <i class="bi bi-star ms-1" aria-hidden="true"></i>
         </a>`
      : `<button type="button" class="btn btn-sm btn-contorno" data-bs-toggle="modal"
                 data-bs-target="#modalEpisodio" data-id="${episodio.id}">
           Calificar <i class="bi bi-star ms-1" aria-hidden="true"></i>
         </button>`;

    return `
      <article class="tarjeta-episodio revelar">
        <figure class="episodio-figura">
          <span class="episodio-temporada">T${episodio.temporada} · E${episodio.numero}</span>
          <img src="${MA.esc(episodio.imagen)}" alt="Escena del episodio ${MA.esc(episodio.titulo)}"
               loading="lazy" width="300" height="220">
        </figure>
        <div class="episodio-cuerpo">
          <h3 class="episodio-titulo">${MA.esc(episodio.titulo)}</h3>
          <p class="episodio-sinopsis lineas-3">${MA.esc(episodio.sinopsis)}</p>

          <div class="episodio-meta">
            <span><i class="bi bi-clock me-1" aria-hidden="true"></i>${MA.esc(episodio.duracion)}</span>
            <span><i class="bi bi-star-fill text-warning me-1" aria-hidden="true"></i>${promedio.toFixed(1)} (${total})</span>
          </div>

          <div class="d-flex justify-content-between align-items-center small fw-bold">
            <span>Popularidad</span><span>${Number(episodio.popularidad) || 0}%</span>
          </div>
          <div class="progress progreso-popularidad mt-1" role="progressbar"
               aria-label="Popularidad de ${MA.esc(episodio.titulo)}"
               aria-valuenow="${Number(episodio.popularidad) || 0}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar" style="width:${Number(episodio.popularidad) || 0}%"></div>
          </div>

          <div class="episodio-pie">
            <span>
              <span class="estrellas" aria-hidden="true">${MA.estrellas(promedio)}</span>
              <span class="promedio-numero ms-1">${promedio.toFixed(1)}</span>
            </span>
            ${boton}
          </div>
        </div>
      </article>
    `;
  }

  function itemGaleria(imagen, indice) {
    return `
      <button type="button" class="galeria-item revelar" data-indice="${indice}"
              data-imagen="${MA.esc(imagen.imagenXl || imagen.imagen)}"
              data-titulo="${MA.esc(imagen.titulo)}"
              data-descripcion="${MA.esc(imagen.descripcion)}"
              aria-label="Ampliar imagen: ${MA.esc(imagen.titulo)}">
        <img src="${MA.esc(imagen.imagen)}" alt="${MA.esc(imagen.alt)}" loading="lazy" width="500" height="500">
        <span class="galeria-overlay" aria-hidden="true"><i class="bi bi-zoom-in fs-3"></i></span>
        <span class="galeria-titulo">${MA.esc(imagen.titulo)}</span>
      </button>
    `;
  }

  function estadoVacio(titulo, texto) {
    return `
      <div class="col-12">
        <div class="estado-vacio">
          <img src="assets/img/hero/masha-corazon.webp" alt="" width="120" height="200" loading="lazy">
          <h3 class="h5 mb-2">${MA.esc(titulo)}</h3>
          <p class="text-muted mb-0">${MA.esc(texto)}</p>
        </div>
      </div>
    `;
  }

  function estadoError(texto) {
    return `
      <div class="col-12">
        <div class="alert alert-warning d-flex align-items-start gap-2 mb-0" role="alert">
          <i class="bi bi-exclamation-triangle-fill mt-1" aria-hidden="true"></i>
          <div>
            <strong>No pudimos cargar esta sección.</strong>
            <p class="mb-0 small">${MA.esc(texto)} Revisa tu conexión y recarga la página.</p>
          </div>
        </div>
      </div>
    `;
  }

  return { tarjetaPersonaje, tarjetaEpisodio, itemGaleria, estadoVacio, estadoError };
})();
