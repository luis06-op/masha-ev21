/**
 * GET /api/episodios
 * Lista los episodios junto con el promedio de sus valoraciones.
 */
const { obtenerSql } = require("./_lib/db");
const { responder, metodoPermitido } = require("./_lib/http");

module.exports = async function handler(req, res) {
  if (!metodoPermitido(req, res, ["GET"])) return;

  try {
    const sql = obtenerSql();
    const filas = await sql`
      SELECT
        e.id,
        e.temporada,
        e.numero,
        e.titulo,
        e.titulo_original AS "tituloOriginal",
        e.sinopsis,
        e.duracion,
        e.popularidad,
        e.imagen,
        e.destacado,
        COALESCE(ROUND(AVG(v.puntuacion)::numeric, 2)::float, 0) AS promedio,
        COUNT(v.id)::int AS "totalValoraciones"
      FROM episodios e
      LEFT JOIN valoraciones v ON v.episodio_id = e.id
      GROUP BY e.id
      ORDER BY e.orden, e.id
    `;

    responder(
      res,
      200,
      { ok: true, total: filas.length, datos: filas },
      "public, s-maxage=60, stale-while-revalidate=300"
    );
  } catch (error) {
    console.error("[api/episodios]", error);
    responder(res, 500, {
      ok: false,
      error: "No se pudieron cargar los episodios. Intenta de nuevo en un momento.",
    });
  }
};
