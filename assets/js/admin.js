/**
 * Panel de mensajes: consulta protegida por clave, resumen, búsqueda,
 * exportación a CSV y eliminación de registros.
 *
 * La clave se guarda en sessionStorage (solo dura la pestaña) y viaja en el
 * encabezado x-admin-token. El servidor la compara con ADMIN_TOKEN.
 */
"use strict";

const CLAVE_SESION = "masha-ev21-clave";

const estadoAdmin = {
  clave: "",
  mensajes: [],
  resumen: {},
  porPersonaje: [],
  nombres: {},
};

document.addEventListener("DOMContentLoaded", () => {
  conectarEventos();

  const guardada = sessionStorage.getItem(CLAVE_SESION);
  if (guardada) {
    estadoAdmin.clave = guardada;
    entrarAlPanel();
  }
});

function conectarEventos() {
  document.getElementById("formAcceso")?.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const campo = document.getElementById("claveAdmin");
    const clave = campo?.value.trim();
    if (!clave) return;

    estadoAdmin.clave = clave;
    entrarAlPanel(true);
  });

  document.getElementById("btnSalir")?.addEventListener("click", salir);
  document.getElementById("btnActualizar")?.addEventListener("click", entrarAlPanel);
  document.getElementById("btnExportar")?.addEventListener("click", exportarCsv);
  document.getElementById("buscarMensajes")?.addEventListener("input", pintarTabla);
  document.getElementById("cuerpoMensajes")?.addEventListener("click", manejarAcciones);
}

async function entrarAlPanel(desdeFormulario = false) {
  const boton = document.getElementById("btnAcceder");
  const alerta = document.getElementById("alertaAcceso");

  if (desdeFormulario) {
    boton.disabled = true;
    boton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Comprobando…';
    alerta?.classList.add("d-none");
  }

  try {
    const datos = await pedirAdmin();

    estadoAdmin.mensajes = datos.mensajes || [];
    estadoAdmin.resumen = datos.resumen || {};
    estadoAdmin.porPersonaje = datos.porPersonaje || [];

    sessionStorage.setItem(CLAVE_SESION, estadoAdmin.clave);
    document.getElementById("panelAcceso")?.classList.add("d-none");
    document.getElementById("panelMensajes")?.classList.remove("d-none");
    document.getElementById("claveAdmin").value = "";

    await cargarNombresPersonajes();
    pintarResumen();
    pintarTabla();

    const estado = document.getElementById("estadoPanel");
    if (estado) {
      estado.textContent = `Actualizado ${new Date().toLocaleTimeString("es-CO")} · ${
        estadoAdmin.mensajes.length
      } registros cargados`;
    }

    if (desdeFormulario) MA.aviso("Bienvenido al panel de mensajes.", "success");
    document.getElementById("panelMensajes")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    sessionStorage.removeItem(CLAVE_SESION);
    document.getElementById("panelMensajes")?.classList.add("d-none");
    document.getElementById("panelAcceso")?.classList.remove("d-none");

    if (alerta) {
      alerta.textContent =
        error.estado === 401
          ? "La clave no es correcta. Vuelve a intentarlo."
          : error.message;
      alerta.classList.remove("d-none");
    }
    document.getElementById("claveAdmin")?.focus();
  } finally {
    boton.disabled = false;
    boton.innerHTML = '<i class="bi bi-unlock-fill me-2" aria-hidden="true"></i>Entrar';
  }
}

async function pedirAdmin() {
  const respuesta = await fetch("/api/admin/mensajes", {
    headers: {
      Accept: "application/json",
      "x-admin-token": estadoAdmin.clave,
    },
  });

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }

  if (!respuesta.ok) {
    const error = new Error(datos?.error || "No se pudo consultar el panel.");
    error.estado = respuesta.status;
    throw error;
  }

  return datos;
}

async function cargarNombresPersonajes() {
  if (Object.keys(estadoAdmin.nombres).length > 0) return;
  try {
    const { datos } = await MA.pedirJSON("/api/personajes");
    estadoAdmin.nombres = Object.fromEntries(datos.map((p) => [p.slug, p.nombre]));
  } catch {
    // Si falla, se muestra el slug tal cual.
  }
}

function pintarResumen() {
  const resumen = estadoAdmin.resumen || {};
  const set = (id, valor) => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = MA.numero(valor);
  };

  set("adminTotal", resumen.total);
  set("adminSemana", resumen.ultimos7);
  set("adminCorreos", resumen.correos);
  set("adminFans", resumen.fans);

  const motivos = [
    { texto: "Fans", valor: resumen.fans, icono: "bi-heart-fill", color: "text-danger" },
    { texto: "Sugerencias", valor: resumen.sugerencias, icono: "bi-lightbulb-fill", color: "text-warning" },
    { texto: "Colaboraciones", valor: resumen.colaboraciones, icono: "bi-people-fill", color: "text-success" },
  ];

  const contenedorMotivos = document.getElementById("adminMotivos");
  if (contenedorMotivos) {
    contenedorMotivos.innerHTML = motivos
      .map(
        (motivo) => `
          <div class="col-sm-4">
            <div class="p-3 rounded-3 bg-light h-100">
              <i class="bi ${motivo.icono} ${motivo.color}" aria-hidden="true"></i>
              <span class="d-block h4 mb-0">${MA.numero(motivo.valor)}</span>
              <span class="text-muted">${motivo.texto}</span>
            </div>
          </div>
        `
      )
      .join("");
  }

  const contenedorPersonajes = document.getElementById("adminPersonajes");
  if (contenedorPersonajes) {
    if (!estadoAdmin.porPersonaje.length) {
      contenedorPersonajes.innerHTML = '<p class="text-muted mb-0">Todavía no hay votos de personajes.</p>';
      return;
    }

    const maximo = Math.max(...estadoAdmin.porPersonaje.map((fila) => fila.total));
    contenedorPersonajes.innerHTML = estadoAdmin.porPersonaje
      .map((fila) => {
        const nombre = estadoAdmin.nombres[fila.personaje] || fila.personaje;
        const ancho = Math.round((fila.total / maximo) * 100);
        return `
          <div class="distribucion-personaje">
            <span class="text-truncate" style="min-width: 6.5rem;">${MA.esc(nombre)}</span>
            <span class="barra"><span style="width:${ancho}%"></span></span>
            <strong class="small">${MA.numero(fila.total)}</strong>
          </div>
        `;
      })
      .join("");
  }
}

function motivoEtiqueta(motivo) {
  const etiquetas = {
    fan: { texto: "Fan", clase: "text-bg-danger" },
    sugerencia: { texto: "Sugerencia", clase: "text-bg-warning" },
    colaboracion: { texto: "Colaboración", clase: "text-bg-success" },
  };
  return etiquetas[motivo] || { texto: motivo, clase: "text-bg-secondary" };
}

function pintarTabla() {
  const cuerpo = document.getElementById("cuerpoMensajes");
  if (!cuerpo) return;

  const busqueda = (document.getElementById("buscarMensajes")?.value || "").trim().toLowerCase();
  const lista = estadoAdmin.mensajes.filter((mensaje) => {
    if (!busqueda) return true;
    const texto = `${mensaje.nombre} ${mensaje.apellido} ${mensaje.email} ${mensaje.mensaje} ${
      estadoAdmin.nombres[mensaje.personajeFavorito] || ""
    }`.toLowerCase();
    return texto.includes(busqueda);
  });

  if (lista.length === 0) {
    cuerpo.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          ${estadoAdmin.mensajes.length === 0
            ? "Todavía no hay mensajes. Envía uno desde la página de contacto."
            : "Ningún mensaje coincide con la búsqueda."}
        </td>
      </tr>
    `;
    return;
  }

  cuerpo.innerHTML = lista
    .map((mensaje) => {
      const motivo = motivoEtiqueta(mensaje.motivo);
      const personaje = estadoAdmin.nombres[mensaje.personajeFavorito] || mensaje.personajeFavorito || "—";
      const intereses = (mensaje.intereses || [])
        .map((interes) => `<span class="badge text-bg-light border">${MA.esc(interes)}</span>`)
        .join(" ");

      return `
        <tr>
          <td class="small text-nowrap">${MA.esc(MA.fecha(mensaje.creadoEn))}</td>
          <td class="small">
            <strong class="d-block">${MA.esc(mensaje.nombre)} ${MA.esc(mensaje.apellido)}</strong>
            <a href="mailto:${MA.esc(mensaje.email)}" class="text-decoration-none">${MA.esc(mensaje.email)}</a>
            ${mensaje.edad ? `<span class="d-block text-muted">${MA.esc(mensaje.edad)} años</span>` : ""}
          </td>
          <td class="small">${MA.esc(personaje)}</td>
          <td class="small">
            <span class="badge rounded-pill ${motivo.clase}">${MA.esc(motivo.texto)}</span>
            ${intereses ? `<div class="mt-1 d-flex flex-wrap gap-1">${intereses}</div>` : ""}
          </td>
          <td class="small">
            <div class="mensaje-texto">${MA.esc(mensaje.mensaje)}</div>
          </td>
          <td class="text-end">
            <button type="button" class="btn btn-outline-danger btn-sm" data-eliminar="${mensaje.id}"
                    aria-label="Eliminar el mensaje de ${MA.esc(mensaje.nombre)}">
              <i class="bi bi-trash3" aria-hidden="true"></i>
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function manejarAcciones(evento) {
  const boton = evento.target.closest("[data-eliminar]");
  if (!boton) return;

  const id = Number(boton.dataset.eliminar);
  const mensaje = estadoAdmin.mensajes.find((fila) => Number(fila.id) === id);
  const nombre = mensaje ? `${mensaje.nombre} ${mensaje.apellido}` : `#${id}`;

  if (!window.confirm(`¿Eliminar definitivamente el mensaje de ${nombre}?`)) return;

  boton.disabled = true;
  try {
    const respuesta = await fetch(`/api/admin/mensajes?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": estadoAdmin.clave, Accept: "application/json" },
    });

    if (!respuesta.ok) throw new Error("No se pudo eliminar el mensaje.");

    estadoAdmin.mensajes = estadoAdmin.mensajes.filter((fila) => Number(fila.id) !== id);
    pintarTabla();
    pintarResumen();
    MA.aviso("El mensaje se eliminó de la base de datos.", "success");
  } catch (error) {
    boton.disabled = false;
    MA.aviso(error.message, "danger");
  }
}

function exportarCsv() {
  if (!estadoAdmin.mensajes.length) {
    MA.aviso("No hay mensajes para exportar.", "warning");
    return;
  }

  const escapar = (valor) => `"${String(valor ?? "").replace(/"/g, '""')}"`;
  const filas = [
    ["Fecha", "Nombre", "Apellido", "Correo", "Edad", "Personaje", "Motivo", "Intereses", "Mensaje"],
    ...estadoAdmin.mensajes.map((mensaje) => [
      MA.fecha(mensaje.creadoEn),
      mensaje.nombre,
      mensaje.apellido,
      mensaje.email,
      mensaje.edad ?? "",
      estadoAdmin.nombres[mensaje.personajeFavorito] || mensaje.personajeFavorito || "",
      mensaje.motivo,
      (mensaje.intereses || []).join(" | "),
      mensaje.mensaje,
    ]),
  ];

  const contenido = "\uFEFF" + filas.map((fila) => fila.map(escapar).join(";")).join("\r\n");
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = `mensajes-masha-${new Date().toISOString().slice(0, 10)}.csv`;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
  MA.aviso("Se descargó el archivo CSV con todos los mensajes.", "success");
}

function salir() {
  sessionStorage.removeItem(CLAVE_SESION);
  estadoAdmin.clave = "";
  estadoAdmin.mensajes = [];
  document.getElementById("panelMensajes")?.classList.add("d-none");
  document.getElementById("panelAcceso")?.classList.remove("d-none");
  document.getElementById("formAcceso")?.reset();
  document.getElementById("claveAdmin")?.focus();
  MA.aviso("Sesión cerrada.", "info");
}
