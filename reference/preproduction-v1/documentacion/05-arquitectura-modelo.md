# Arquitectura propuesta y modelo de dominio

## Decisión principal ADR-01

Recomendar interfaz web + servicio de medios local. La interfaz gestiona interacción y preview; el servicio administra el espacio de trabajo y ejecuta ffprobe/FFmpeg nativos. La recomendacion deriva del volumen de medios, la necesidad de exportación cancelable y la conveniencia de no depender exclusivamente del almacenamiento del navegador. Debe validarse en SP-01 a SP-04 antes de fijar detalles de implementacion.

Alternativas: 100% navegador simplifica instalación pero exige resolver codecs, contenedores, memoria y persistencia; servicio remoto permite acceso desde otros equipos pero cambia privacidad, red y autenticacion. Aplicación nativa empaquetada puede evaluarse después; no es requisito de la interfaz web inicial.

## Componentes y límites

1. Cliente web: paneles, timeline, comandos de edición, accesibilidad y cache visual. React + TypeScript es una propuesta de stack, con versiones por fijar al iniciar el repositorio.
2. Motor de dominio independiente del DOM: tipos temporales, invariantes, comandos atómicos y validación del manifiesto. Misma definición de operaciones usada por cliente y servidor.
3. Servicio local: API, revisión esperada, rutas autorizadas y tareas. Node.js + TypeScript es una propuesta coherente con un modelo compartido; no se fija framework hasta cerrar ADR.
4. Worker de medios: proceso separado que usa ffprobe/FFmpeg, concurrencia y cancelación; errores convertidos a codigos recuperables. No exponer una consola de comandos arbitrarios.
5. Persistencia: manifiesto JSON versionado por proyecto como autoridad del montaje; SQLite para índice de proyectos, jobs y referencias. El índice puede reconstruirse desde manifiestos y registros; no mantiene otra copia editable de la timeline.
6. Espacio de trabajo: originals/, proxies/, cache/, renders/, snapshots/, trash/. Originales importados inmutables; derivados eliminables; renders publicados atomicos. Respaldos completos externos al workspace siguen siendo responsabilidad explicita del flujo de backup.

## Preview y render

No usar multiples elementos video independientes como garantía de sincronización profesional. SP-01 compara un compositor de preview con proxies/CFR y un preview servido en segmentos por el servicio para efectos no paritarios. Si la paridad no se logra, el modo de preview final se obtiene del mismo grafo de render, con latencia visible.

El render interpreta una revisión inmutable del manifiesto en un grafo normalizado. Debe compartir rangos, orden de transformaciones y parámetros de texto/audio con el preview. Color, gamma, escalado, kerning y redondeo se incluyen en los golden tests. Un efecto sin preview fiel se deshabilita en M1 o ofrece preview final generado por servicio; no se libera con una diferencia silenciosa.

## Entidades

| Entidad | Campos esenciales | Invariante |
| --- | --- | --- |
| Project | id, name, schemaVersion, revisión, fpsNum/fpsDen, canvas, tracks, assets, createdAt | M1 fps=30/1; revisión crece; una sesión editora. |
| Asset | id, kind, contentHash, managedRelativePath, streams, sourceTimeBase, durationPTS, rotation, color | Ruta relativa autorizada; contenido inmutable. |
| Track | id, kind, order, name, locked, hidden/muted, clips | Hasta 4 visuales y 4 audio M1; mismo tipo de clips. |
| Clip | id, assetId/type, trackId, startFrame, durationFrames, sourceInPTS, sourceTimeBase, effectStack, linkGroupId | Duración >=1; sin colision en pista; rango dentro de fuente. |
| LinkGroup | id, memberClipIds, sourceAlignment | M1 par V/A del mismo recurso y rango fuente. |
| Title | clipId, text, fontFamily, bundledFontId, sizePx, weight, lineHeight, color, align | Texto plano; fuente instalada y reproducible. |
| Command | id, type, payload, expectedRevision, inverse, createdAt | Validar todo antes de aplicar; una transaccion reversible. |
| ExportJob | id, idempotencyKey, projectId, revisión, preset, state, progress, outputRelativePath, error | Snapshot inmutable; estados válidos; resultado solo al verificar. |
| Snapshot | projectId, revisión, manifestHash, createdAt, relativePath | Última copia durable válida disponible. |
| Derivative | assetHash, processorVersion, optionsHash, path, leaseCount | Derivable; no borrar con lease activo. |

## Contratos de API propuestos

Todos devuelven error estructurado {code, message, recoveryAction, requestId}; límites y esquemas validados. No se incluye una implementación de endpoints en este paquete.

| Operación | Contrato | Errores relevantes |
| --- | --- | --- |
| Crear/abrir | POST /projects; GET /projects/:id | VALIDATION, NOT_FOUND, READ_ONLY |
| Importar | POST /projects/:id/assets, multipart por streaming; devolver taskId | UNSUPPORTED_CODEC, CORRUPT_MEDIA, NO_SPACE, CANCELLED |
| Guardar | PUT /projects/:id/manifest con expectedRevision; devolver revisión durable | REVISION_CONFLICT, NO_SPACE, PERMISSION_DENIED |
| Exportar | POST /projects/:id/exports con revisión, preset, idempotencyKey | MISSING_MEDIA, INVALID_TIMELINE, NO_SPACE |
| Seguir job | GET /jobs/:id y stream SSE con eventos versionados | SERVICE_UNAVAILABLE; reconexión consulta GET |
| Cancelar | POST /jobs/:id/cancel con resultado de carrera explicito | ALREADY_TERMINAL; nunca fabricar cancelación exitosa |
| Resultado | GET /jobs/:id/output solo si completado | NOT_READY, NOT_FOUND |
| Relocalizar | POST /projects/:id/assets/:assetId/relink con upload y confirmacion | IDENTITY_MISMATCH, RANGE_OUT_OF_BOUNDS |
| Diagnostico/cache | GET /diagnostics; POST /cache/cleanup | IN_USE, PERMISSION_DENIED |

## Seguridad concreta del servicio

Escuchar en 127.0.0.1 por defecto y publicar contenedores solo en loopback. Restringir Host/Origin, autenticar llamadas con token de sesión local y proteger mutaciones contra CSRF. No usar CORS comodin ni aceptar sitios ajenos porque la red sea local. Validar reales de rutas/symlinks dentro de raices permitidas, evitar shell, limitar CPU/memoria/tiempo y ejecutar workers con usuario sin privilegios. No enviar medios a servicios externos ni incluir contenido en logs de error.

Si se cambia a LAN o VPS, se requiere una ADR nueva con TLS, autenticación, autorización y política de subida; no basta con cambiar el bind a 0.0.0.0.

## Datos, retención y recuperación

Guardar snapshot cada 60 s mientras haya cambios y conservar los 20 más recientes más el último manual, con cuota visible. Papelera 7 dias; bajo presión de disco avisar antes de purgar. Cache inicial 5 GiB configurable y umbral libre mínimo de 5 GiB; el preflight estima necesidad por proyecto y trabajo, que puede ser mayor. El proyecto JSON se guarda por temporal + fsync/reemplazo según plataforma y registro de revisión confirmado; SP-04 válida las garantías reales del filesystem.
