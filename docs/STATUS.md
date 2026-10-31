# Estado de Jencut

Sesión: 30 de octubre de 2026. Build de trabajo 0.1.0, organizado en commits
convencionales separados por responsabilidad. Todo el código está dentro de
`src/`; el paquete original permanece intacto y sus checksums siguen
coincidiendo.

## Entrega

H0 y el corte funcional H1 están completos y verificados. H2 está en curso. No
se declara M1 completo. La evidencia está en `progress/VERIFICATION.md`.

Funciona:

- Estilo reproducible con `pnpm format`: comillas simples, sin punto y coma
  finales, imports agrupados y ordenados, y separación de bloques exigida por
  Oxlint. Integrado con el guardado en VS Code y lint-staged; configuración en
  `docs/current/CODE_STYLE.md`.
- Astro + React con Precision A, Manrope e Inter locales y componentes
  shadcn/ui: Sidebar, Dialog, Select, Field, InputGroup, Tabs, ToggleGroup,
  Slider, Switch, Tooltip, DropdownMenu, ScrollArea, Resizable, Progress, Alert
  y Skeleton.
- Servicio Fastify y FFmpeg dentro de Docker; SQLite WAL y workspace
  persistentes en el volumen `jencut_jencut-data`, puerto local 4318.
- Proyectos estables; búsqueda, apertura, duplicación con nuevos IDs de montaje
  y medios compartidos inmutables; papelera recuperable sin purga automática.
- Importación en streaming y por lotes; inspección real; rechazo de archivo
  corrupto; thumbnails, waveform y proxies derivados de los originales.
- Secuencia de video y audio, cortes vinculados con S, recorte y posición
  exactos por campos, mover/duplicar, bloqueo, visibilidad y mute de pistas.
- Hasta 4V + 4A; crear, renombrar y ordenar pistas. Colisiones, bloqueos y
  ripple conservador se validan antes de aplicar nada. Retirada de recursos sin
  uso.
- Undo/redo de 150 comandos en sesión; probado con 105 comandos consecutivos.
- Guardado inmediato con revisión esperada, fsync y publicación atómica del
  manifiesto; reapertura y sesión editora exclusiva con lease.
- Preview FFmpeg de montaje a 720p y un solo elemento A/V. Confirmación de frame
  presentado mediante requestVideoFrameCallback en Chromium.
- Exportación en worker separado, revisión fija, cola, progreso real,
  cancelación, preflight y descarga únicamente después de inspeccionar
  H.264/AAC, frames, duración, resolución, frecuencia y hashes de originales.

## Arranque y evidencias

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm dev:status
pnpm fixtures:verify
pnpm verify
pnpm test:e2e
```

Node 24.22.2 y pnpm 10.33.2. Interfaz: http://127.0.0.1:4321. `pnpm dev:stop`
conserva el volumen. El build se revisa con `pnpm build` y `pnpm preview` en
http://127.0.0.1:4173.

Los reportes y capturas están en `progress/evidence/`. El MP4 descargado por la
prueba está en `.jencut/evidence/h1-export.mp4`; su job también conserva el MP4
original en `/data/renders/` dentro del volumen Docker. El JSON de evidencia
fija el ID exacto, revisión, hash e inspección.

## Límites actuales

- H2 aún necesita selección múltiple arbitraria y comandos atómicos para grupos
  que no sean los vínculos V/A. No hay purga de papelera a siete días ni gestión
  completa de cache/derivados cancelables.
- El recorte inicial reduce el rango actual; extenderlo de nuevo hacia fuera se
  realiza mediante undo. La ampliación directa del IN/OUT hasta el límite de la
  fuente queda pendiente de completar en H2.
- El preview requiere generar cada revisión. No se certifican latencia de seek,
  reproducción del corpus C1/C2, sincronización a diez minutos ni rendimiento
  p95. Windows y navegadores distintos del Chromium ejecutado no se probaron.
- Audio avanzado, desvinculación, ganancia/fades, títulos, transformaciones y
  corrección de color quedan para H3. La imagen alfa requiere golden tests antes
  de declararse fiel. No se han añadido funciones de M2/M3.
- Snapshots/recuperación avanzada, relocalización, fallos de disco/permiso,
  reconexión resistente e idempotencia completa de reintentos se completan en
  H4.
- Tema claro, escalado, distribución móvil y equivalencia completa con las
  cuatro maquetas se cierran en H5. La auditoría automática de accesibilidad no
  sustituye una certificación WCAG ni pruebas con lectores de pantalla.

## Entrega por GitHub

Rama de trabajo: `feature/m1-editor-foundation`; base: `develop`. La identidad
de todos los commits nuevos es `jeancdev <jcode2006@gmail.com>`, sin coautores.
El flujo y la plantilla de PR están en `docs/current/GIT_WORKFLOW.md` y
`.github/pull_request_template.md`. La descripción preparada está en
`progress/PULL_REQUEST.md`.

La entrega corresponde a la [PR #1](https://github.com/jeancdevx/jencut/pull/1),
con base `develop` e integración mediante merge commit para conservar los
commits. GitHub CLI autentica a `jeancdevx`. La siguiente tarea funcional es el
corte de H2 descrito abajo.

## Próxima tarea precisa

Continuar H2: modelar selección múltiple con offsets internos y expansión de
vínculos; implementar mover, duplicar y eliminar como una sola transacción.
Probar colisión en un miembro, pista bloqueada y cruce de intervalo sin mutación
parcial, más undo/redo del grupo. Después completar extensión de trim, cache
cancelable y papelera según RF-05/06/11/13/14/15/50.
