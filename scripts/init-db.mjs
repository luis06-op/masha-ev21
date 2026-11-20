/**
 * Crea (o reinicia) las tablas y carga los datos iniciales en la base
 * configurada en DATABASE_URL.
 *
 * Uso:
 *   node --env-file=.env.local scripts/init-db.mjs
 *   node --env-file=.env.local scripts/init-db.mjs --solo-datos
 *
 * Advertencia: esquema.sql elimina las tablas existentes antes de crearlas.
 * Úsalo solo en la base de datos de la evidencia, nunca en producción con
 * datos reales.
 */
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Sin .env.local: se usan las variables del entorno.
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ Falta DATABASE_URL. Copia .env.example a .env.local y complétalo.");
  process.exit(1);
}

const sql = neon(url);
const soloDatos = process.argv.includes("--solo-datos");

function separarSentencias(texto) {
  return texto
    .split("\n")
    .filter((linea) => !/^\s*--/.test(linea))
    .join("\n")
    .split(/;\s*(?:\n|$)/)
    .map((sentencia) => sentencia.trim())
    .filter(Boolean);
}

async function ejecutarArchivo(ruta) {
  const contenido = await readFile(ruta, "utf8");
  const sentencias = separarSentencias(contenido);

  console.log(`→ ${ruta}: ${sentencias.length} sentencias`);

  for (const [indice, sentencia] of sentencias.entries()) {
    try {
      await sql.query(sentencia);
    } catch (error) {
      console.error(`✗ Error en la sentencia ${indice + 1}:`);
      console.error(sentencia.slice(0, 180) + "…");
      throw error;
    }
  }
}

try {
  if (!soloDatos) {
    await ejecutarArchivo("database/esquema.sql");
  }
  await ejecutarArchivo("database/datos.sql");

  const [conteo] = await sql`
    SELECT
      (SELECT COUNT(*) FROM personajes)::int AS personajes,
      (SELECT COUNT(*) FROM episodios)::int AS episodios,
      (SELECT COUNT(*) FROM galeria)::int AS imagenes,
      (SELECT COUNT(*) FROM valoraciones)::int AS valoraciones
  `;

  console.log("✓ Base de datos lista:", conteo);
} catch (error) {
  console.error("✗ No se pudo inicializar la base de datos:", error.message);
  process.exit(1);
}
