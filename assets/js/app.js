/**
 * Masha y el Oso · Utilidades compartidas por todas las páginas
 * Evidencia 21 — SENA
 *
 * Aquí viven las funciones que usan varias vistas: peticiones a la API,
 * escape de texto, estrellas, avisos y los detalles de interfaz comunes.
 */
"use strict";

const MA = (() => {
  /**
   * Petición JSON con manejo de errores uniforme.
   * Lanza un Error con el mensaje que envía la API.
   */
  async function pedirJSON(url, opciones = {}) {
    const configuracion = { ...opciones };
    configuracion.headers = {
      Accept: "application/json",
      ...(opciones.headers || {}),
    };

    const respuesta = await fetch(url, configuracion);

    let datos = null;
    try {
      datos = await respuesta.json();
    } catch {
      datos = null;
    }

    if (!respuesta.ok) {
      const error = new Error(
        datos?.error || "Ocurrió un error inesperado. Intenta de nuevo."
      );
      error.estado = respuesta.status;
      error.datos = datos;
      throw error;
    }

    return datos || {};
  }

  /** Escapa texto antes de insertarlo con innerHTML. */
  function esc(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, (caracter) => {
      const mapa = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return mapa[caracter];
    });
  }

  const formatoFecha = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  /** Fecha legible en español (hora de Colombia). */
  function fecha(iso) {
    if (!iso) return "—";
    const valor = new Date(iso);
    return Number.isNaN(valor.getTime()) ? "—" : formatoFecha.format(valor);
  }

  function numero(valor) {
    return new Intl.NumberFormat("es-CO").format(Number(valor) || 0);
  }

  /** Dibuja 5 estrellas a partir de un promedio (0 a 5). */
  function estrellas(promedio) {
    const valor = Number(promedio) || 0;
    let html = "";
    for (let i = 1; i <= 5; i += 1) {
      if (valor >= i - 0.25) {
        html += '<i class="bi bi-star-fill" aria-hidden="true"></i>';
      } else if (valor >= i - 0.75) {
        html += '<i class="bi bi-star-half" aria-hidden="true"></i>';
      } else {
        html += '<i class="bi bi-star" aria-hidden="true"></i>';
      }
    }
    return html;
  }

  /** Aviso flotante (toast) para confirmaciones y errores. */
  function aviso(mensaje, tipo = "success", titulo = "") {
    const contenedor = document.getElementById("contenedorAvisos");
    if (!contenedor) return;

    const iconos = {
      success: "bi-check-circle-fill",
      danger: "bi-exclamation-octagon-fill",
      warning: "bi-exclamation-triangle-fill",
      info: "bi-info-circle-fill",
    };
    const titulos = {
      success: "Listo",
      danger: "No se pudo completar",
      warning: "Atención",
      info: "Información",
    };

    const elemento = document.createElement("div");
    elemento.className = "toast align-items-center border-0 shadow-lg";
    elemento.setAttribute("role", "status");
    elemento.setAttribute("aria-live", "polite");
    elemento.setAttribute("aria-atomic", "true");
    elemento.innerHTML = `
      <div class="d-flex">
        <div class="toast-body d-flex align-items-start gap-2">
          <i class="bi ${iconos[tipo] || iconos.info} text-${tipo} mt-1" aria-hidden="true"></i>
          <span>
            <strong class="d-block">${esc(titulo || titulos[tipo] || "Aviso")}</strong>
            <span>${esc(mensaje)}</span>
          </span>
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar aviso"></button>
      </div>
    `;

    contenedor.appendChild(elemento);
    const instancia = new bootstrap.Toast(elemento, { delay: 5000 });
    elemento.addEventListener("hidden.bs.toast", () => elemento.remove());
    instancia.show();
  }

  /** Animación suave de aparición para tarjetas y secciones. */
  function observarRevelado(raiz = document) {
    const elementos = raiz.querySelectorAll(".revelar:not(.visible)");
    if (!elementos.length) return;

    if (!("IntersectionObserver" in window)) {
      elementos.forEach((elemento) => elemento.classList.add("visible"));
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    elementos.forEach((elemento) => observador.observe(elemento));
  }

  function iniciarInterfaz() {
    const barra = document.querySelector(".navbar-masha");
    const botonArriba = document.getElementById("btnArriba");

    const alDesplazar = () => {
      if (barra) barra.classList.toggle("con-sombra", window.scrollY > 8);
      if (botonArriba) botonArriba.classList.toggle("visible", window.scrollY > 420);
    };

    window.addEventListener("scroll", alDesplazar, { passive: true });
    alDesplazar();

    botonArriba?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.querySelector(".enlace-saltar")?.focus({ preventScroll: true });
    });

    document.querySelectorAll("[data-anio]").forEach((elemento) => {
      elemento.textContent = String(new Date().getFullYear());
    });

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((elemento) => {
      new bootstrap.Tooltip(elemento);
    });

    document.querySelectorAll('[data-bs-toggle="collapse"]').forEach((elemento) => {
      const destino = elemento.getAttribute("data-bs-target");
      if (!destino) return;
      const menu = document.querySelector(destino);
      if (!menu) return;
      menu.querySelectorAll("a").forEach((enlace) => {
        enlace.addEventListener("click", () => {
          const instancia = bootstrap.Collapse.getInstance(menu);
          if (instancia) instancia.hide();
        });
      });
    });

    observarRevelado();
  }

  document.addEventListener("DOMContentLoaded", iniciarInterfaz);

  return {
    pedirJSON,
    esc,
    fecha,
    numero,
    estrellas,
    aviso,
    observarRevelado,
  };
})();
