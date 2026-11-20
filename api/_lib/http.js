/**
 * Utilidades compartidas por las funciones serverless:
 * respuestas JSON, lectura del cuerpo, control de métodos y hash de la IP.
 */
const crypto = require("node:crypto");

function responder(res, estado, datos, cache = "no-store") {
  res.statusCode = estado;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.end(JSON.stringify(datos));
}

function metodoPermitido(req, res, metodos) {
  if (metodos.includes(req.method)) return true;

  res.setHeader("Allow", metodos.join(", "));
  responder(res, 405, {
    ok: false,
    error: `Método ${req.method} no permitido. Usa ${metodos.join(" o ")}.`,
  });
  return false;
}

async function leerCuerpo(req) {
  if (req.body && typeof req.body === "object") return req.body;

  const partes = [];
  for await (const parte of req) partes.push(parte);

  const texto = Buffer.concat(partes).toString("utf8").trim();
  if (!texto) return null;

  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

/**
 * Huella de la IP: se guarda un hash, nunca la dirección en claro.
 * Se usa para limitar el spam y para que cada visitante vote una vez.
 */
function huellaIp(req) {
  const reenviada = req.headers["x-forwarded-for"];
  const ip =
    (typeof reenviada === "string" ? reenviada.split(",")[0] : "") ||
    req.socket?.remoteAddress ||
    "desconocida";

  return crypto
    .createHash("sha256")
    .update(`${ip.trim()}|masha-ev21|2026`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Comprobación básica de mismo origen para las peticiones POST.
 * No sustituye a un CSRF token, pero evita envíos desde otros dominios.
 */
function mismoOrigen(req) {
  const origen = req.headers.origin;
  if (!origen) return true; // curl, Postman o pruebas locales

  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (!host) return false;

  try {
    return new URL(origen).host === host;
  } catch {
    return false;
  }
}

function recortar(valor, maximo) {
  if (typeof valor !== "string") return "";
  return valor.trim().slice(0, maximo);
}

module.exports = {
  responder,
  metodoPermitido,
  leerCuerpo,
  huellaIp,
  mismoOrigen,
  recortar,
};
