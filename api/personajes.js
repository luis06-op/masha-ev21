/**
 * GET /api/personajes
 * Devuelve las fichas de los personajes activos, ordenadas para la interfaz.
 */
const { obtenerSql } = require("./_lib/db");
const { responder, metodoPermitido } = require("./_lib/http");

module.exports = async function handler(req, res) {
  if (!metodoPermitido(req, res, ["GET"])) return;

  try {
    const sql = obtenerSql();
    const filas = await sql`
      SELECT
        id,
        slug,
        nombre,
        emoji,
        rol,
        descripcion,
        descripcion_larga AS "descripcionLarga",
        rasgos,
        primera_aparicion AS "primeraAparicion",
        frase,
        imagen,
        color
      FROM personajes
      WHERE activo
      ORDER BY orden, id
    `;

    responder(
      res,
      200,
      { ok: true, total: filas.length, datos: filas },
      "public, s-maxage=120, stale-while-revalidate=600"
    );
  } catch (error) {
    console.error("[api/personajes]", error);
    responder(res, 500, {
      ok: false,
      error: "No se pudieron cargar los personajes. Intenta de nuevo en un momento.",
    });
  }
};
