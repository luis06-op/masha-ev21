/**
 * GET  /api/admin/mensajes  → lista los mensajes guardados y un resumen.
 * DELETE /api/admin/mensajes?id=123 → elimina un mensaje.
 *
 * Requiere el encabezado `x-admin-token` con el valor de la variable de
 * entorno ADMIN_TOKEN. El panel solo es una comodidad para la evidencia:
 * no hay cuentas de usuario ni datos sensibles más allá de los mensajes.
 */
const crypto = require("node:crypto");
const { obtenerSql } = require("../_lib/db");
const { responder, metodoPermitido } = require("../_lib/http");

function tokenValido(recibido) {
  const esperado = process.env.ADMIN_TOKEN;
  if (!esperado) return false;

  const a = crypto.createHash("sha256").update(String(recibido || "")).digest();
  const b = crypto.createHash("sha256").update(esperado).digest();
  return crypto.timingSafeEqual(a, b);
}

module.exports = async function handler(req, res) {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");

  if (!metodoPermitido(req, res, ["GET", "DELETE"])) return;

  if (!process.env.ADMIN_TOKEN) {
    return responder(res, 503, {
      ok: false,
      error: "El panel no está configurado: falta la variable ADMIN_TOKEN en el servidor.",
    });
  }

  if (!tokenValido(req.headers["x-admin-token"])) {
    await new Promise((listo) => setTimeout(listo, 400));
    return responder(res, 401, {
      ok: false,
      error: "Clave incorrecta. Vuelve a intentarlo.",
    });
  }

  try {
    const sql = obtenerSql();

    if (req.method === "DELETE") {
      const id = Number(req.query?.id);
      if (!Number.isInteger(id) || id <= 0) {
        return responder(res, 400, { ok: false, error: "Identificador no válido." });
      }

      const borrados = await sql`
        DELETE FROM mensajes WHERE id = ${id} RETURNING id
      `;
      if (borrados.length === 0) {
        return responder(res, 404, { ok: false, error: "El mensaje ya no existe." });
      }
      return responder(res, 200, { ok: true, eliminado: id });
    }

    const [resumen] = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE creado_en > now() - interval '7 days')::int AS "ultimos7",
        COUNT(*) FILTER (WHERE motivo = 'fan')::int AS fans,
        COUNT(*) FILTER (WHERE motivo = 'sugerencia')::int AS sugerencias,
        COUNT(*) FILTER (WHERE motivo = 'colaboracion')::int AS colaboraciones,
        COUNT(DISTINCT lower(email))::int AS correos
      FROM mensajes
    `;

    const porPersonaje = await sql`
      SELECT personaje_favorito AS personaje, COUNT(*)::int AS total
      FROM mensajes
      WHERE personaje_favorito IS NOT NULL
      GROUP BY personaje_favorito
      ORDER BY total DESC, personaje
    `;

    const mensajes = await sql`
      SELECT
        id,
        nombre,
        apellido,
        email,
        edad,
        personaje_favorito AS "personajeFavorito",
        motivo,
        intereses,
        mensaje,
        acepta_terminos AS "aceptaTerminos",
        creado_en AS "creadoEn"
      FROM mensajes
      ORDER BY creado_en DESC
      LIMIT 200
    `;

    return responder(res, 200, {
      ok: true,
      resumen,
      porPersonaje,
      mensajes,
    });
  } catch (error) {
    console.error("[api/admin/mensajes]", error);
    return responder(res, 500, {
      ok: false,
      error: "No se pudieron consultar los mensajes.",
    });
  }
};
