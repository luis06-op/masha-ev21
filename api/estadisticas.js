/**
 * GET /api/estadisticas
 * Cifras generales que se muestran en la portada. Se calculan en la base
 * de datos, no están escritas a mano en el HTML.
 */
const { obtenerSql } = require("./_lib/db");
const { responder, metodoPermitido } = require("./_lib/http");

module.exports = async function handler(req, res) {
  if (!metodoPermitido(req, res, ["GET"])) return;

  try {
    const sql = obtenerSql();
    const [fila] = await sql`
      SELECT
        (SELECT COUNT(*) FROM personajes WHERE activo)::int AS personajes,
        (SELECT COUNT(*) FROM episodios)::int AS episodios,
        (SELECT COUNT(*) FROM galeria)::int AS imagenes,
        (SELECT COUNT(*) FROM valoraciones)::int AS valoraciones,
        (SELECT COUNT(*) FROM mensajes)::int AS mensajes,
        COALESCE(
          (SELECT ROUND(AVG(puntuacion)::numeric, 2)::float FROM valoraciones),
          0
        ) AS promedio
    `;

    responder(
      res,
      200,
      { ok: true, datos: fila },
      "public, s-maxage=30, stale-while-revalidate=120"
    );
  } catch (error) {
    console.error("[api/estadisticas]", error);
    responder(res, 500, {
      ok: false,
      error: "No se pudieron calcular las estadísticas.",
    });
  }
};
