# Masha y el Oso · Evidencia 21 (SENA)

Fan site completo de **Masha y el Oso** construido con **Bootstrap 5**, JavaScript
y una **base de datos PostgreSQL real alojada en Neon**. Es una aplicación web
estática + funciones serverless desplegadas en **Vercel**: la base de datos ya
está creada, poblada y conectada, así que **no hay que instalar MySQL, ni XAMPP,
ni ejecutar scripts de base de datos para verla funcionando**.

> Sitio en producción: **https://masha-ev21.vercel.app/**
> Repositorio: **https://github.com/luis06-op/masha-ev21**

---

## 1. ¿Qué incluye?

| Sección | Archivo | Qué hace |
|---|---|---|
| Inicio | `index.html` | Portada con cifras leídas de la BD, personajes, episodios y galería destacados. |
| Personajes | `personajes.html` | 5 fichas con descripción, rasgos, frase y modal de detalle. |
| Episodios | `episodios.html` | 9 episodios con filtros por temporada, orden y valoración de 1 a 5 estrellas. |
| Galería | `galeria.html` | 27 imágenes (más versiones ampliadas) con filtros y visor con teclado. |
| Contacto | `contacto.html` | Formulario validado cuyos datos se guardan en PostgreSQL. |
| Panel | `admin.html` | Consulta protegida de los mensajes recibidos, con búsqueda, CSV y borrado. |

Cosas que antes no estaban y ahora sí:

- **Base de datos real**: 5 tablas (`personajes`, `episodios`, `galeria`,
  `mensajes`, `valoraciones`). Los textos, las imágenes y las cifras salen de la
  BD, no están escritos a mano en el HTML.
- **Base de datos administrada**: Neon (PostgreSQL en la nube). Vercel guarda
  la cadena de conexión como variable de entorno `DATABASE_URL`. El visitante
  (y el profesor) solo abre la URL: no configura nada.
- **Formulario funcional**: cada envío queda registrado con fecha, motivo,
  intereses y personaje favorito.
- **Valoraciones persistentes**: un voto por episodio y visitante, con
  promedio calculado en la base de datos.
- **Más imágenes**: se optimizaron 53 PNG originales a 75 archivos WebP
  (miniaturas + ampliadas, personajes, episodios, marca y hero). Todo el sitio
  pesa ~5 MB en imágenes.
- **Bootstrap 5.3.8, Bootstrap Icons y tipografías** alojados dentro del
  proyecto: no depende de CDNs externos para verse bien.
- **Accesibilidad y seguridad**: etiquetas ARIA, navegación por teclado,
  escape de salida, validación en servidor, honeypot anti-bots, límite de
  envíos y hash de IP en vez de guardar la IP en claro.

---

## 2. Arquitectura

```
Navegador
   │  HTML/CSS/JS (Bootstrap)
   ▼
Vercel  ── rutas estáticas (/index.html, /galeria.html, …)
   │
   └── /api/*  (funciones serverless Node.js)
            │
            └── @neondatabase/serverless ──► PostgreSQL (Neon)
```

Cada endpoint es una función independiente en `api/`:

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/personajes` | Fichas activas. |
| GET | `/api/episodios` | Episodios con promedio y número de votos. |
| GET | `/api/galeria` | Imágenes con su versión ampliada. |
| GET | `/api/estadisticas` | Conteos y promedio general. |
| POST | `/api/mensajes` | Guarda un mensaje del formulario. |
| POST | `/api/valoraciones` | Guarda/actualiza el voto de un visitante. |
| GET/DELETE | `/api/admin/mensajes` | Panel protegido por `x-admin-token`. |

El código compartido (conexión, respuestas, validación) está en `api/_lib/`.

---

## 3. Base de datos (sin intervención del usuario)

La base se llama **`masha_ev21`** y vive en el proyecto de Neon ya vinculado a
Vercel. No hay que crearla ni importarla: Vercel inyecta `DATABASE_URL` en cada
función serverless y la app se conecta sola.

- `database/esquema.sql`: crea las 5 tablas desde cero.
- `database/datos.sql`: carga personajes, episodios, galería y valoraciones de
  ejemplo. Se puede repetir sin duplicar filas.
- `scripts/init-db.mjs`: reinicia y siembra la base de forma controlada
  (`npm run db:init`). Solo para quien administra el proyecto.

Detalles y copias de seguridad: [`database/README.md`](database/README.md).

### Variables de entorno (ya configuradas en Vercel)

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL (Neon). |
| `ADMIN_TOKEN` | Clave de acceso al panel `/admin.html`. |

Para desarrollo local se usa `.env.local` (no se sube a GitHub). Hay un
ejemplo en `.env.example`.

**Clave del panel:** `MashaOso-VeHDYfmW` (la misma que usa el despliegue).
Se escribe en la pantalla de acceso de `admin.html` y solo se guarda en la
memoria de la pestaña (`sessionStorage`).

---

## 4. Ejecutar en local (opcional)

El sitio ya funciona en Vercel; esto solo es para probar cambios.

```bash
cd masha-ev21
npm install
cp .env.example .env.local   # y pegar DATABASE_URL y ADMIN_TOKEN reales
npx vercel dev --listen 3000
```

Luego abrir http://localhost:3000.

`package.json` **no** define un script `dev` que llame a `vercel dev`, porque
Vercel lo detectaría como una recursión. Hay que ejecutar `npx vercel dev`
directamente.

---

## 5. Despliegue

```bash
# GitHub
git init
git add .
git commit -m "Evidencia 21: sitio de Masha y el Oso con base de datos"
gh repo create luis06-op/masha-ev21 --public --source=. --push

# Vercel (proyecto ya vinculado en .vercel/project.json)
npx vercel --prod
```

Cada `git push` a `main` produce un nuevo despliegue automático en Vercel.

---

## 6. Guía para el informe de la Evidencia 21

En [`docs/INFORME_EVIDENCIA_21.md`](docs/INFORME_EVIDENCIA_21.md) hay un borrador
listo para copiar al Word, la lista de capturas recomendadas y la relación entre
los requerimientos de la guía y lo que hace este aplicativo.

---

## 7. Estructura del repositorio

```
masha-ev21/
├── index.html, personajes.html, episodios.html, galeria.html,
│   contacto.html, admin.html
├── api/                  Funciones serverless (GET/POST/DELETE)
├── assets/
│   ├── css/estilos.css   Tema propio (tokens .emi/.masha, tarjetas, forms…)
│   ├── js/               app.js, componentes.js y una vista por página
│   ├── img/              75 imágenes WebP + favicons + OG
│   └── vendor/           Bootstrap, Bootstrap Icons y fuentes locales
├── database/             esquema.sql, datos.sql y README
├── scripts/init-db.mjs   Reinicio controlado de la BD
├── docs/                 Borrador del informe y capturas
└── vercel.json           Cabeceras, caché y redirecciones
```

---

## 8. Créditos

Proyecto de proyecto 6 · Evidencia 21 — SENA.
Desarrollado por **Luis Ángel Muñoz Márquez**.
Personajes e imágenes: «Masha y el Oso» (Animaccord Animation Studio).
Material usado con fines educativos y de demostración.
