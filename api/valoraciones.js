/**
 * POST /api/valoraciones
 * Registra (o actualiza) la puntuación de un episodio.
 * Cada visitante puede votar una vez por episodio: se identifica con el
 * hash de su IP y la tabla tiene una restricción UNIQUE (episodio_id, ip_hash).
 */
const { obtenerSql } = require("./_lib/db");
const {
  responder,
  metodoPermitido,
  leerCuerpo,
  huellaIp,
  mismoOrigen,
} = require("./_lib/http");

module.exports = async function handler(req, res) {
  if (!metodoPermitido(req, res, ["POST"])) return;

  if (!mismoOrigen(req)) {
    return responder(res, 403, {
      ok: false,
      error: "La petición debe realizarse desde el mismo sitio.",
    });
  }

  const cuerpo = await leerCuerpo(req);
  const episodioId = Number(cuerpo?.episodioId);
  const puntuacion = Number(cuerpo?.puntuacion);

  if (!Number.isInteger(episodioId) || episodioId <= 0) {
    return responder(res, 400, { ok: false, error: "Episodio no válido." });
  }
  if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
    return responder(res, 400, {
      ok: false,
      error: "La puntuación debe ser un número entero entre 1 y 5.",
    });
  }

  try {
    const sql = obtenerSql();
    const episodio = await sql`
      SELECT id FROM episodios WHERE id = ${episodioId} LIMIT 1
    `;
    if (episodio.length === 0) {
      return responder(res, 404, { ok: false, error: "El episodio no existe." });
    }

    const ip = huellaIp(req);

    await sql`
      INSERT INTO valoraciones (episodio_id, puntuacion, ip_hash)
      VALUES (${episodioId}, ${puntuacion}, ${ip})
      ON CONFLICT (episodio_id, ip_hash)
      DO UPDATE SET puntuacion = EXCLUDED.puntuacion, creado_en = now()
    `;

    const [resumen] = await sql`
      SELECT
        ROUND(AVG(puntuacion)::numeric, 2)::float AS promedio,
        COUNT(*)::int AS total,
        (SELECT puntuacion FROM valoraciones
          WHERE episodio_id = ${episodioId} AND ip_hash = ${ip}) AS "miPuntuacion"
      FROM valoraciones
      WHERE episodio_id = ${episodioId}
    `;

    return responder(res, 200, {
      ok: true,
      promedio: resumen.promedio,
      total: resumen.total,
      miPuntuacion: resumen.miPuntuacion,
      mensaje: "¡Gracias por calificar este episodio!",
    });
  } catch (error) {
    console.error("[api/valoraciones]", error);
    return responder(res, 500, {
      ok: false,
      error: "No pudimos guardar tu valoración. Intenta de nuevo.",
    });
  }
};
