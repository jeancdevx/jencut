# Servicio local de Jencut

El cliente usa `/api` en su mismo origen; Astro lo redirige al servicio local.
No se permite CORS arbitrario. Las mutaciones requieren
`x-jencut-client: jencut-local-v1`. Los errores contienen `code`, `message`,
`recoveryAction` y `requestId`.

| Ruta                                                 | Uso                                                 |
| ---------------------------------------------------- | --------------------------------------------------- |
| GET `/health`, `/diagnostics`                        | Estado, versiones y espacio real                    |
| GET/POST `/projects`                                 | Biblioteca y creación `{name,ratio}`                |
| GET `/projects/:id`                                  | Manifiesto confirmado                               |
| POST `/projects/:id/lease`, `/release`               | Sesión editora `{sessionId}`                        |
| POST `/projects/:id/commands`                        | `{sessionId,expectedRevision,command}`              |
| POST `/projects/:id/undo`, `/redo`                   | Historial de sesión, mismo control de revisión      |
| GET `/projects/:id/history`                          | Cantidad de comandos disponibles                    |
| POST `/projects/:id/import`                          | Multipart, un archivo por petición en streaming     |
| GET `/projects/:id/derivatives`                      | Nombre, inspección, proxy, thumbnail y waveform     |
| GET `/assets/:id/thumbnail`, `/proxy`                | Derivados de medios administrados                   |
| POST `/projects/:id/duplicate`, `/trash`, `/restore` | Operaciones de biblioteca                           |
| GET `/projects/:id/preflight`                        | Validez, existencia de medios y espacio             |
| POST `/projects/:id/exports`                         | `{expectedRevision,resolution,kind,idempotencyKey}` |
| GET `/jobs`, `/jobs/:id`                             | Trabajos persistidos y estados reales               |
| POST `/jobs/:id/cancel`                              | Cancelación                                         |
| GET `/jobs/:id/output`                               | MP4 completo, con soporte HTTP Range                |

Importación añade `x-jencut-session` y `x-jencut-revision`. Límite por petición:
512 MiB, un archivo. Un lote del cliente continúa tras un archivo rechazado. El
esquema limita a 30 assets, 50 clips, 4V + 4A y 18 000 frames de montaje. La
exportación exige proyecto no vacío. `resolution` es 720 o 1080 y conserva el
formato; 9:16 produce 720×1280 o 1080×1920. `kind` es `preview` o `export`.

Comandos actuales: add, split, trim, move, duplicate, delete con ripple
opcional, track con nombre/orden/bloqueo/visibilidad/mute, addTrack y
removeAsset. Las operaciones vinculadas se validan como una transacción antes de
guardar. No hay endpoints para rutas arbitrarias del host.
