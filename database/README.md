# Base de datos · Masha y el Oso (Evidencia 21)

La aplicación usa **PostgreSQL 18** alojado en **Neon** (plan gratuito). La base
ya está creada y conectada a Vercel, así que **no hay nada que configurar para
ver el sitio funcionando**.

## Datos de conexión

- Base de datos: `masha_ev21`
- Proveedor: Neon (región US East)
- Cadena de conexión: variable de entorno `DATABASE_URL` en Vercel y en
  `.env.local` para desarrollo local.
- Driver: `@neondatabase/serverless` (HTTP, sin pools ni servidores que mantener).

> La contraseña no aparece en este repositorio. Nunca subas `.env.local`,
> `.env` ni ningún archivo con la cadena de conexión.

## Modelo de datos (5 tablas)

| Tabla | Contenido | Uso en la web |
|---|---|---|
| `personajes` | 5 personajes con slug, descripción, rasgos, color e imagen. | Tarjetas, modales y selector del formulario. |
| `episodios` | 9 episodios con temporada, sinopsis, popularidad e imagen. | Listado, filtros y valoraciones. |
| `galeria` | 27 imágenes con versión normal y ampliada. | Galería y visor (lightbox). |
| `mensajes` | Envíos reales del formulario de contacto. | Panel de administración. |
| `valoraciones` | 1 voto por episodio y visitante (1–5 estrellas). | Promedios y estrellas. |

`mensajes` guarda `ip_hash` (SHA-256 de la IP con sal fija), nunca la IP en
claro. `valoraciones` tiene `UNIQUE (episodio_id, ip_hash)` para que cada
visitante vote una sola vez por episodio.

## Archivos

- **`esquema.sql`** — crea las cinco tablas, sus restricciones y sus índices.
  Empieza con `DROP TABLE IF EXISTS … CASCADE`: solo se ejecuta sobre una base
  vacía o de prueba.
- **`datos.sql`** — siembra los contenidos. Usa `ON CONFLICT`, así que se puede
  ejecutar varias veces sin duplicar registros.
- **`../scripts/init-db.mjs`** — ejecuta ambos archivos en orden. Se usa con
  `npm run db:init` (reinicio completo) o `npm run db:datos` (solo datos).

## ¿Por qué el usuario no tiene que intervenir?

1. El motor de base de datos es administrado por Neon: no hay que instalarlo,
   arrancarlo ni mantenerlo.
2. Vercel inyecta `DATABASE_URL` en las funciones serverless: no hay que copiar
   claves ni editar archivos para desplegar.
3. Los datos iniciales ya están cargados. El formulario y las valoraciones
   escriben directamente en la base desde el navegador, sin pasos manuales.
4. Si algún día se borra la base, basta con ejecutar `npm run db:init` desde el
   entorno del administrador para dejarla como estaba.

## Copia de seguridad manual (opcional)

Desde un equipo con `psql` y la cadena de conexión:

```bash
pg_dump "$DATABASE_URL" > respaldo_masha_ev21.sql
```

Para restaurar en una base vacía:

```bash
psql "$DATABASE_URL" -f respaldo_masha_ev21.sql
```
