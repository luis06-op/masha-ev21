/**
 * Contacto: carga los personajes en el select, valida y envía el formulario
 * a POST /api/mensajes. El mensaje queda guardado en PostgreSQL.
 */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  cargarPersonajesSelect();
  iniciarContador();
  document.getElementById("formContacto")?.addEventListener("submit", enviarFormulario);
});

async function cargarPersonajesSelect() {
  const select = document.getElementById("personajeFavorito");
  if (!select) return;

  try {
    const { datos } = await MA.pedirJSON("/api/personajes");
    select.innerHTML =
      '<option value="" selected disabled>-- Elige un personaje --</option>' +
      datos
        .map(
          (personaje) =>
            `<option value="${MA.esc(personaje.slug)}">${MA.esc(personaje.emoji)} ${MA.esc(personaje.nombre)}</option>`
        )
        .join("");
  } catch (error) {
    select.innerHTML = '<option value="" selected disabled>No se pudieron cargar los personajes</option>';
    select.disabled = true;
    MA.aviso("No se pudo cargar la lista de personajes. Recarga la página.", "warning");
  }
}

function iniciarContador() {
  const campo = document.getElementById("mensaje");
  const contador = document.getElementById("contadorMensaje");
  if (!campo || !contador) return;

  const actualizar = () => {
    contador.textContent = String(campo.value.length);
    contador.classList.toggle("limite", campo.value.length >= 780);
  };

  campo.addEventListener("input", actualizar);
  actualizar();
}

function marcarError(campo, mensaje) {
  const elemento = document.getElementById(campo);
  if (!elemento) return;

  elemento.classList.add("is-invalid");
  elemento.setAttribute("aria-invalid", "true");

  const contenedor = elemento.closest(".col-12, .col-sm-6, .col-sm-4, .col-sm-8, .form-check, .input-group");
  const feedback = contenedor?.querySelector(".invalid-feedback");
  if (feedback && mensaje) feedback.textContent = mensaje;
}

function limpiarErrores() {
  const alerta = document.getElementById("alertaFormulario");
  alerta?.classList.add("d-none");
  document.getElementById("listaErrores").innerHTML = "";
  document.querySelectorAll("#formContacto .is-invalid").forEach((elemento) => {
    elemento.classList.remove("is-invalid");
    elemento.removeAttribute("aria-invalid");
  });
}

async function enviarFormulario(evento) {
  evento.preventDefault();

  const formulario = evento.currentTarget;
  const boton = document.getElementById("btnEnviar");
  const alerta = document.getElementById("alertaFormulario");
  const lista = document.getElementById("listaErrores");

  limpiarErrores();
  formulario.classList.add("was-validated");

  if (!formulario.checkValidity()) {
    const primero = formulario.querySelector(":invalid");
    primero?.focus();
    MA.aviso("Faltan datos obligatorios en el formulario.", "warning");
    return;
  }

  const datos = new FormData(formulario);
  const intereses = [...formulario.querySelectorAll('input[name="intereses"]:checked')].map(
    (checkbox) => checkbox.value
  );

  const cuerpo = {
    nombre: datos.get("nombre"),
    apellido: datos.get("apellido"),
    email: datos.get("email"),
    edad: datos.get("edad") || null,
    personajeFavorito: datos.get("personajeFavorito"),
    motivo: datos.get("motivo"),
    intereses,
    mensaje: datos.get("mensaje"),
    terminos: datos.get("terminos") === "on",
    sitioWeb: datos.get("sitioWeb") || "",
  };

  boton.disabled = true;
  boton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Enviando…';

  try {
    const respuesta = await MA.pedirJSON("/api/mensajes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });

    document.getElementById("folioMensaje").textContent = respuesta.id ? `#${respuesta.id}` : "—";
    document.getElementById("textoExito").textContent =
      "Gracias por escribirnos. Tu mensaje ya está guardado en la base de datos de PostgreSQL.";

    bootstrap.Modal.getOrCreateInstance(document.getElementById("modalExito")).show();

    formulario.reset();
    formulario.classList.remove("was-validated");
    const contador = document.getElementById("contadorMensaje");
    if (contador) {
      contador.textContent = "0";
      contador.classList.remove("limite");
    }
  } catch (error) {
    const errores = error.datos?.errores || {};
    const entradas = Object.entries(errores);

    if (entradas.length > 0) {
      lista.innerHTML = entradas
        .map(([, mensaje]) => `<li>${MA.esc(mensaje)}</li>`)
        .join("");
      alerta.classList.remove("d-none");

      entradas.forEach(([campo, mensaje]) => marcarError(campo, mensaje));
      const primerCampo = document.getElementById(entradas[0][0]);
      primerCampo?.focus();

      alerta.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      lista.innerHTML = `<li>${MA.esc(error.message)}</li>`;
      alerta.classList.remove("d-none");
      alerta.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    MA.aviso(error.message, "danger");
  } finally {
    boton.disabled = false;
    boton.innerHTML = '<i class="bi bi-send-fill me-2" aria-hidden="true"></i>Enviar mensaje';
  }
}

// Al corregir un campo, se quita la marca de error.
document.addEventListener("input", (evento) => {
  if (evento.target.matches("#formContacto .is-invalid")) {
    evento.target.classList.remove("is-invalid");
    evento.target.removeAttribute("aria-invalid");
  }
});
