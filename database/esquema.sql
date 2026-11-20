-- ============================================================================
--  EVIDENCIA 21 · "Masha y el Oso" — Esquema de la base de datos
--  Motor: PostgreSQL 18 (Neon, plan gratuito)
--  Base:  masha_ev21
--
--  Este archivo crea las cinco tablas del aplicativo. Está pensado para
--  ejecutarse sobre una base vacía: empieza borrando las tablas si existen.
--  No lo ejecutes sobre una base con datos reales.
-- ============================================================================

DROP TABLE IF EXISTS valoraciones CASCADE;
DROP TABLE IF EXISTS mensajes CASCADE;
DROP TABLE IF EXISTS galeria CASCADE;
DROP TABLE IF EXISTS episodios CASCADE;
DROP TABLE IF EXISTS personajes CASCADE;

-- ----------------------------------------------------------------------------
-- 1. Personajes del bosque
-- ----------------------------------------------------------------------------
CREATE TABLE personajes (
  id                serial PRIMARY KEY,
  slug              text        NOT NULL UNIQUE,
  nombre            text        NOT NULL,
  emoji             text        NOT NULL DEFAULT '🐻',
  rol               text        NOT NULL,
  descripcion       text        NOT NULL,
  descripcion_larga text        NOT NULL,
  rasgos            text[]      NOT NULL DEFAULT '{}',
  primera_aparicion text,
  frase             text,
  imagen            text        NOT NULL,
  color             text        NOT NULL DEFAULT '#d81b60',
  orden             integer     NOT NULL DEFAULT 0,
  activo            boolean     NOT NULL DEFAULT true
);

COMMENT ON TABLE  personajes IS 'Fichas de los personajes que se muestran en las tarjetas y los modales.';
COMMENT ON COLUMN personajes.slug IS 'Identificador legible usado por la API y por el formulario de contacto.';

CREATE INDEX idx_personajes_orden ON personajes (orden) WHERE activo;

-- ----------------------------------------------------------------------------
-- 2. Episodios y su popularidad
-- ----------------------------------------------------------------------------
CREATE TABLE episodios (
  id               serial PRIMARY KEY,
  temporada        integer NOT NULL CHECK (temporada > 0),
  numero           integer NOT NULL CHECK (numero > 0),
  titulo           text    NOT NULL,
  titulo_original  text,
  sinopsis         text    NOT NULL,
  duracion         text    NOT NULL DEFAULT '7 min',
  popularidad      integer NOT NULL DEFAULT 50 CHECK (popularidad BETWEEN 0 AND 100),
  imagen           text    NOT NULL,
  destacado        boolean NOT NULL DEFAULT false,
  orden            integer NOT NULL DEFAULT 0,
  UNIQUE (temporada, numero)
);

COMMENT ON COLUMN episodios.popularidad IS 'Porcentaje de popularidad mostrado en la barra de progreso (dato de ejemplo del sitio).';

CREATE INDEX idx_episodios_orden ON episodios (orden);

-- ----------------------------------------------------------------------------
-- 3. Galería de imágenes
-- ----------------------------------------------------------------------------
CREATE TABLE galeria (
  id          serial PRIMARY KEY,
  titulo      text    NOT NULL,
  descripcion text    NOT NULL,
  imagen      text    NOT NULL,
  imagen_xl   text    NOT NULL,
  categoria   text    NOT NULL CHECK (categoria IN ('Masha', 'El Oso', 'Juntos', 'Amigos')),
  alt         text    NOT NULL,
  orden       integer NOT NULL DEFAULT 0
);

COMMENT ON COLUMN galeria.imagen_xl IS 'Versión de mayor resolución que se muestra en el visor (lightbox).';

CREATE INDEX idx_galeria_categoria ON galeria (categoria, orden);

-- ----------------------------------------------------------------------------
-- 4. Mensajes enviados desde el formulario de contacto
-- ----------------------------------------------------------------------------
CREATE TABLE mensajes (
  id                  bigserial   PRIMARY KEY,
  nombre              text        NOT NULL CHECK (char_length(nombre) BETWEEN 2 AND 60),
  apellido            text        NOT NULL CHECK (char_length(apellido) BETWEEN 2 AND 60),
  email               text        NOT NULL CHECK (position('@' IN email) > 1),
  edad                integer     CHECK (edad BETWEEN 3 AND 120),
  personaje_favorito  text,
  motivo              text        NOT NULL CHECK (motivo IN ('fan', 'sugerencia', 'colaboracion')),
  intereses           text[]      NOT NULL DEFAULT '{}',
  mensaje             text        NOT NULL CHECK (char_length(mensaje) BETWEEN 10 AND 800),
  acepta_terminos     boolean     NOT NULL DEFAULT false,
  creado_en           timestamptz NOT NULL DEFAULT now(),
  ip_hash             text,
  user_agent          text
);

COMMENT ON TABLE  mensajes IS 'Registro real de los envíos del formulario de contacto.';
COMMENT ON COLUMN mensajes.ip_hash IS 'Huella SHA-256 de la IP (nunca se guarda la IP en claro); se usa para limitar el spam.';

CREATE INDEX idx_mensajes_creado ON mensajes (creado_en DESC);
CREATE INDEX idx_mensajes_ip     ON mensajes (ip_hash, creado_en DESC);

-- ----------------------------------------------------------------------------
-- 5. Valoraciones de episodios (1 a 5 estrellas)
-- ----------------------------------------------------------------------------
CREATE TABLE valoraciones (
  id           bigserial   PRIMARY KEY,
  episodio_id  integer     NOT NULL REFERENCES episodios (id) ON DELETE CASCADE,
  puntuacion   integer     NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  ip_hash      text        NOT NULL,
  creado_en    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (episodio_id, ip_hash)
);

COMMENT ON TABLE valoraciones IS 'Un voto por episodio y por visitante (identificado con el hash de su IP).';

CREATE INDEX idx_valoraciones_episodio ON valoraciones (episodio_id);
