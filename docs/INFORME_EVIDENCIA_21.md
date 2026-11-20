# Evidencia 21: Desarrollo de aplicativo Bootstrap

> **Borrador para el documento Word.** Cópialo en tu Word, pega las capturas en
> los puntos indicados y completa los datos de portada institucional. La guía
> pide: portada, capturas del sitio funcionando y enlaces del proyecto.

---

## Portada (sugerencia)

**SENA · Centro de Formación (completar) · Programa: Análisis y Desarrollo de
Software**

**EVIDENCIA 21: Desarrollo de aplicativo Bootstrap**

Aprendiz: Luis Ángel Muñoz Márquez  
Fecha: 20 de noviembre de 2026

---

## 1. Descripción del aplicativo

Se desarrolló un **fan site de «Masha y el Oso»** como aplicativo web
interactivo construido con **HTML5, CSS3, Bootstrap 5.3.8 y JavaScript**. El
proyecto se implementó en seis vistas: inicio, personajes, episodios, galería,
contacto y panel de mensajes.

A diferencia de la versión anterior (una sola página estática), esta versión
incorpora una **base de datos PostgreSQL real** alojada en Neon y conectada a
través de funciones serverless de Vercel. Los textos, las imágenes y las cifras
se obtienen de la base de datos, y tanto el formulario de contacto como las
valoraciones de episodios escriben en ella.

**Enlaces del proyecto**

- Sitio desplegado: https://masha-ev21.vercel.app/
- Repositorio público en GitHub: https://github.com/luis06-op/masha-ev21
- Base de datos: PostgreSQL (Neon), integrada en el despliegue de Vercel.
  No requiere intervención del usuario ni configuración adicional.

---

## 2. Requerimientos de la guía y cómo se cumplen

| Requerimiento de la Evidencia 21 | Implementación |
|---|---|
| Maquetación con framework Bootstrap | Grid, utilidades, navbar, tarjetas, modales, progreso, badges, toasts, acordeón y formularios de Bootstrap 5. |
| Interfaz responsiva (móvil, tableta y escritorio) | Breakpoints `sm/md/lg`, navegación colapsable y rejilla adaptativa en las seis vistas. |
| Navegación y formularios de captura | Menú fijo con seis secciones y formulario de contacto con validación en cliente y servidor. |
| Tarjetas de contenido | Fichas de personajes, tarjetas de episodios con barra de popularidad y galería de imágenes. |
| Componentes dinámicos (modales) | Ficha de personaje, detalle de episodio con valoración, visor de galería, términos y confirmación de envío. |
| Código limpio, comentado y modular | CSS por secciones, JS compartido (`app.js`, `componentes.js`) y un script por vista; API separada por recursos. |
| Accesibilidad y usabilidad | Etiquetas ARIA, enlace de salto, foco visible, contraste, texto alternativo, navegación por teclado y `prefers-reduced-motion`. |
| Publicación del código en GitHub | Repositorio público `luis06-op/masha-ev21`. |
| Aplicativo **junto con su base de datos** en hosting gratuito | Web en Vercel y PostgreSQL administrada en Neon; `DATABASE_URL` inyectada como variable de entorno. |
| Capturas y enlaces en el Word | Ver el listado de capturas de la sección 5. |

---

## 3. Base de datos

Se diseñaron cinco tablas:

1. **personajes** (5 registros): nombre, rol, descripción, rasgos, frase, color e imagen.
2. **episodios** (9 registros): temporada, número, título, sinopsis, duración, popularidad e imagen.
3. **galeria** (27 registros): título, descripción, categoría, miniatura e imagen ampliada.
4. **mensajes**: cada envío del formulario, con fecha, motivo, intereses y personaje favorito.
5. **valoraciones**: un voto por episodio y visitante (1 a 5 estrellas), con promedio calculado en SQL.

La conexión se realiza con el driver HTTP `@neondatabase/serverless` desde
funciones serverless de Vercel (`/api/*`). Las consultas son preparadas, la
salida se escapa en el navegador y los datos del visitante se almacenan como
hash, sin guardar la IP en claro.

### Funcionalidades que usan la base de datos

- Las cifras de la portada (personajes, episodios, imágenes y promedio) se
  calculan en la base de datos.
- El formulario de contacto guarda cada mensaje y muestra el número de folio.
- El panel de mensajes permite buscar, exportar a CSV y eliminar registros;
  está protegido con una clave enviada en el encabezado `x-admin-token`.
- Las valoraciones se actualizan en la base y recalculan el promedio de cada
  episodio.

---

## 4. Mejoras respecto al aplicativo original

- Se pasó de una página estática a **seis vistas** con contenido dinámico.
- Se optimizaron las imágenes originales a **75 archivos WebP** (~5 MB), con
  miniaturas y versiones ampliadas para el visor.
- Se añadieron filtros, búsqueda, ordenación, valoraciones, exportación CSV,
  favicons, imagen Open Graph y estados vacíos/de error.
- Se unificaron estilos, colores y tipografías con Bootstrap y un tema propio,
  sin depender de CDNs externos.

---

## 5. Capturas de pantalla (pegar en el Word)

Tomar las capturas con el navegador en **1920 × 1080** (o 1440 × 900) y pegarlas
debajo de cada título. En producción: https://masha-ev21.vercel.app/

| # | Captura | Qué debe verse |
|---|---|---|
| 1 | Portada completa | Hero, cifras desde la BD, tarjetas de personajes y episodios, galería. |
| 2 | Personajes | Las 5 fichas y, abierto, el modal de detalle de Masha. |
| 3 | Episodios | Listado con filtros y modal de valoración con estrellas. |
| 4 | Galería | Cuadrícula de 27 imágenes y visor ampliado con flechas. |
| 5 | Contacto | Formulario diligenciado y modal de confirmación con el folio guardado en la BD. |
| 6 | Panel de mensajes | Acceso con clave y tabla con el mensaje recibido. |
| 7 | Repositorio GitHub | Página pública del repo con la lista de archivos. |
| 8 | Despliegue Vercel | Vista del proyecto con el dominio `masha-ev21.vercel.app` en verde. |
| 9 | Base de datos (opcional) | Consola de Neon con el esquema de las 5 tablas, o respuesta de `/api/estadisticas`. |
| 10 | Vista móvil (opcional) | Portada o galería en 390 × 844 para demostrar el diseño responsivo. |

> Para la captura 9 también sirve abrir
> `https://masha-ev21.vercel.app/api/estadisticas`: se ve el JSON con los
> conteos leídos directamente de PostgreSQL.

### Capturas ya preparadas en `docs/capturas/`

| Archivo | Contenido |
|---|---|
| `01-inicio.png` | Portada completa del sitio en producción. |
| `02-personajes-modal.png` | Modal de detalle de Masha. |
| `03-episodios-valoracion.png` | Modal de valoración con 4 estrellas seleccionadas. |
| `04-galeria.png` | Galería completa con las 27 imágenes. |
| `05-galeria-visor.png` | Visor ampliado de la galería. |
| `06-contacto-formulario.png` | Formulario de contacto diligenciado. |
| `07-contacto-confirmacion.png` | Modal de confirmación con el folio guardado en PostgreSQL. |
| `08-admin-mensajes.png` | Panel con el mensaje recibido y el resumen. |
| `09-github-repositorio.png` | Repositorio público en GitHub. |
| `10-inicio-movil.png` | Portada en 390 × 844 (diseño responsivo). |

> Puedes tomar tus propias capturas reemplazando estos archivos. El mensaje de
> ejemplo del panel (`Sofía Ramírez`) quedó registrado para que la captura 8
> muestre datos reales guardados en la base de datos.

---

## 6. Conclusiones

El aplicativo cumple con la Evidencia 21: es una interfaz responsiva hecha con
Bootstrap, con formularios, tarjetas y modales, publicada en GitHub y desplegada
en Vercel **junto con una base de datos administrada**. La base no exige
instalación, importación ni intervención por parte de quien abre el sitio: todo
el contenido y los registros están listos para usarse desde la URL pública.

Como trabajo futuro se podría añadir autenticación real para el panel,
paginación en la galería y un sistema de comentarios por episodio.
