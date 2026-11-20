/**
 * Validación del formulario de contacto.
 * Se ejecuta siempre en el servidor: la validación del navegador es solo
 * una ayuda visual y puede saltarse.
 */

const MOTIVOS = ["fan", "sugerencia", "colaboracion"];
const INTERESES = ["noticias", "estrenos", "sorteos"];

const RE_NOMBRE = /^[\p{L}][\p{L}\s'.-]{1,59}$/u;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

function limpiar(valor, maximo = 200) {
  if (typeof valor !== "string") return "";
  return valor
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim()
    .slice(0, maximo);
}

function validarMensaje(cuerpo) {
  const errores = {};
  const datos = {};

  datos.nombre = limpiar(cuerpo.nombre, 60).replace(/\s+/g, " ");
  if (datos.nombre.length < 2) {
    errores.nombre = "Escribe tu nombre (mínimo 2 caracteres).";
  } else if (!RE_NOMBRE.test(datos.nombre)) {
    errores.nombre = "El nombre solo puede llevar letras, espacios, guiones y puntos.";
  }

  datos.apellido = limpiar(cuerpo.apellido, 60).replace(/\s+/g, " ");
  if (datos.apellido.length < 2) {
    errores.apellido = "Escribe tu apellido (mínimo 2 caracteres).";
  } else if (!RE_NOMBRE.test(datos.apellido)) {
    errores.apellido = "El apellido solo puede llevar letras, espacios, guiones y puntos.";
  }

  datos.email = limpiar(cuerpo.email, 120).toLowerCase();
  if (!RE_EMAIL.test(datos.email)) {
    errores.email = "Escribe un correo electrónico válido (ejemplo@dominio.com).";
  }

  const edadCruda = cuerpo.edad;
  if (edadCruda === "" || edadCruda === null || edadCruda === undefined) {
    datos.edad = null;
  } else {
    const edad = Number(edadCruda);
    if (!Number.isInteger(edad) || edad < 3 || edad > 120) {
      errores.edad = "La edad debe ser un número entero entre 3 y 120.";
    } else {
      datos.edad = edad;
    }
  }

  datos.personaje_favorito = limpiar(cuerpo.personajeFavorito, 40) || null;
  if (!datos.personaje_favorito) {
    errores.personajeFavorito = "Selecciona tu personaje favorito.";
  }

  datos.motivo = limpiar(cuerpo.motivo, 20);
  if (!MOTIVOS.includes(datos.motivo)) {
    errores.motivo = "Selecciona un motivo válido para tu mensaje.";
  }

  const interesesRecibidos = Array.isArray(cuerpo.intereses) ? cuerpo.intereses : [];
  datos.intereses = [...new Set(interesesRecibidos.filter((i) => INTERESES.includes(i)))];

  datos.mensaje = limpiar(cuerpo.mensaje, 800);
  if (datos.mensaje.length < 10) {
    errores.mensaje = "El mensaje debe tener al menos 10 caracteres.";
  }

  datos.acepta_terminos = cuerpo.terminos === true;
  if (!datos.acepta_terminos) {
    errores.terminos = "Debes aceptar los términos y condiciones.";
  }

  return {
    valido: Object.keys(errores).length === 0,
    datos,
    errores,
  };
}

module.exports = { validarMensaje, MOTIVOS, INTERESES };
