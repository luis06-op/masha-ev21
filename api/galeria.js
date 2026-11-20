/**
 * GET /api/galeria
 * Devuelve las imágenes de la galería y sus categorías.
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
        titulo,
        descripcion,
        imagen,
        imagen_xl AS "imagenXl",
        categoria,
        alt
      FROM galeria
      ORDER BY orden, id
    `;

    responder(
      res,
      200,
      { ok: true, total: filas.length, datos: filas },
      "public, s-maxage=300, stale-while-revalidate=900"
    );
  } catch (error) {
    console.error("[api/galeria]", error);
    responder(res, 500, {
      ok: false,
      error: "No se pudo cargar la galería. Intenta de nuevo en un momento.",
    });
  }
};
