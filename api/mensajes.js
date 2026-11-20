/**
 * POST /api/mensajes
 * Guarda en PostgreSQL un envío del formulario de contacto.
 *
 * Capas de protección:
 *  - Solo acepta POST y peticiones del mismo origen.
 *  - Campo trampa (honeypot) para bots.
 *  - Validación completa en el servidor.
 *  - Límite de un mensaje cada 20 segundos por visitante (hash de IP).
 */
const { obtenerSql } = require("./_lib/db");
const {
  responder,
  metodoPermitido,
  leerCuerpo,
  huellaIp,
  mismoOrigen,
  recortar,
} = require("./_lib/http");
const { validarMensaje } = require("./_lib/validacion");

const ESPERA_MINIMA_MS = 20_000;

module.exports = async function handler(req, res) {
  if (!metodoPermitido(req, res, ["POST"])) return;

  if (!mismoOrigen(req)) {
    return responder(res, 403, {
      ok: false,
      error: "La petición debe realizarse desde el mismo sitio.",
    });
  }

  const cuerpo = await leerCuerpo(req);
  if (!cuerpo || typeof cuerpo !== "object") {
    return responder(res, 400, {
      ok: false,
      error: "No se recibieron datos válidos.",
    });
  }

  // Honeypot: un humano nunca ve este campo, los bots suelen rellenarlo.
  if (recortar(cuerpo.sitioWeb, 200)) {
    return responder(res, 201, { ok: true, id: null });
  }

  const { valido, datos, errores } = validarMensaje(cuerpo);
  if (!valido) {
    return responder(res, 422, {
      ok: false,
      error: "Revisa los campos marcados en el formulario.",
      errores,
    });
  }

  try {
    const sql = obtenerSql();
    const ip = huellaIp(req);

    const personaje = await sql`
      SELECT slug FROM personajes
      WHERE slug = ${datos.personaje_favorito} AND activo
      LIMIT 1
    `;
    if (personaje.length === 0) {
      return responder(res, 422, {
        ok: false,
        error: "El personaje seleccionado no existe.",
        errores: { personajeFavorito: "Selecciona un personaje de la lista." },
      });
    }

    const reciente = await sql`
      SELECT id FROM mensajes
      WHERE ip_hash = ${ip}
        AND creado_en > now() - (${ESPERA_MINIMA_MS} || ' milliseconds')::interval
      LIMIT 1
    `;
    if (reciente.length > 0) {
      return responder(res, 429, {
        ok: false,
        error: "Recibimos tu mensaje hace un momento. Espera unos segundos antes de enviar otro.",
      });
    }

    const intereses =
      datos.intereses.length > 0 ? `{${datos.intereses.join(",")}}` : "{}";

    const [fila] = await sql`
      INSERT INTO mensajes
        (nombre, apellido, email, edad, personaje_favorito, motivo,
         intereses, mensaje, acepta_terminos, ip_hash, user_agent)
      VALUES
        (${datos.nombre}, ${datos.apellido}, ${datos.email}, ${datos.edad},
         ${datos.personaje_favorito}, ${datos.motivo}, ${intereses}::text[],
         ${datos.mensaje}, ${datos.acepta_terminos}, ${ip},
         ${recortar(req.headers["user-agent"], 300)})
      RETURNING id, creado_en AS "creadoEn"
    `;

    return responder(res, 201, {
      ok: true,
      id: fila.id,
      creadoEn: fila.creadoEn,
      mensaje: "¡Mensaje guardado! Gracias por escribirnos.",
    });
  } catch (error) {
    console.error("[api/mensajes]", error);
    return responder(res, 500, {
      ok: false,
      error: "No pudimos guardar tu mensaje. Intenta de nuevo en un momento.",
    });
  }
};
