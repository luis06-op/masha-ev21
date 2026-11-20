/**
 * Conexión a PostgreSQL (Neon) mediante el driver HTTP serverless.
 * La cadena de conexión se configura en la variable de entorno DATABASE_URL.
 */
const { neon } = require("@neondatabase/serverless");

let cliente = null;

function obtenerSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!url) {
    throw new Error(
      "No está definida la variable de entorno DATABASE_URL. " +
        "Consulta database/README.md para configurar la base de datos."
    );
  }

  if (!cliente) {
    cliente = neon(url);
  }

  return cliente;
}

module.exports = { obtenerSql };
