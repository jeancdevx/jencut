# Verificación de Jencut 0.1.0

Fecha: 30 de octubre de 2026. Validación en la rama
feature/m1-editor-foundation. La identidad y los cuatro estados siguen Precision
A; la matriz completa de RF/RNF se cierra en H6.

## Entorno real

Node v24.22.2, pnpm 10.33.2, linux 6.12.108-1-MANJARO x64. CPU: AMD Ryzen 7
5825U with Radeon Graphics; 16 hilos lógicos; memoria física 14.9 GiB. Docker
29.7.2, Compose 5.5.1. Host: ffmpeg version n9.0.1 Copyright (c) 2000-2026 the
FFmpeg developers. Servicio: ffmpeg version 5.1.9-0+deb12u1 Copyright (c)
2000-2026 the FFmpeg developers. El entorno comenzó con Node 26.8.1; las
comprobaciones se ejecutaron con Node 24.22.2, también fijado en la imagen
Docker, engines, .nvmrc y .node-version.

`progress/evidence/environment.json` conserva versiones, navegador, código y
lockfile con sus hashes. Se ejecutó Chromium de Playwright sobre Manjaro usando
su distribución de Linux de respaldo; Windows no se probó. Ese registro
corresponde al último recorrido funcional H1. El mantenimiento anterior del
estilo conserva sus propios hashes y resultados en
`progress/evidence/code-style.json` y `progress/evidence/code-style.txt`.

## Comandos y resultados

| Comando                                               | Resultado y evidencia                                      |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                      | Instalación repetida sin resolver otro lockfile            |
| `pnpm dev`                                            | Docker saludable y Astro en loopback, con modo background  |
| `pnpm fixtures:verify`                                | Los seis hashes coinciden con el manifiesto                |
| `sha256sum -c SHA256SUMS.txt` en el paquete           | Todos coinciden; paquete original intacto                  |
| `pnpm lint`                                           | Oxlint sin avisos ni errores                               |
| `pnpm format:check`                                   | Oxfmt, incluida sintaxis Astro y orden de Tailwind         |
| `pnpm check`                                          | TypeScript y Astro sin errores, avisos ni hints            |
| `pnpm test`                                           | 12 pruebas; dominio, persistencia, FFmpeg, fallos y corpus |
| `pnpm build`                                          | Build estático real, dos rutas                             |
| `pnpm test:e2e`                                       | Tres recorridos sobre desarrollo                           |
| `JENCUT_TEST_URL=http://127.0.0.1:4173 pnpm test:e2e` | Tres recorridos sobre producción                           |
| `pnpm evidence`                                       | Snapshot, comando FFmpeg y hashes del render real          |

Los logs finales están en `progress/evidence/quality.txt`, `e2e-development.txt`
y `e2e-production.txt`. Los hooks están activos en `.husky/_`; pre-commit usa
lint-staged y commit-msg usa Commitlint con Conventional Commits.

## Mantenimiento del estilo de código

30 de octubre de 2026. Oxfmt mantiene `singleQuote: true`,
`jsxSingleQuote: true` y `semi: false`; ahora el orden de grupos de imports es
explícito y separa módulos nativos, dependencias, internos, padres, hermanos y
estilos. Oxlint ordena los nombres importados y exige separación entre imports y
código.

Se incorporó `@stylistic/eslint-plugin` 5.10.0 como plugin de Oxlint para exigir
líneas en blanco entre bloques, antes de return/throw y entre métodos. Las
variables consecutivas pueden seguir agrupadas. La excepción import → código de
la regla de padding delega esa frontera a `import/newline-after-import`,
evitando que dos reglas intenten corregir el mismo espacio.

- `pnpm format`: aplica Oxlint con correcciones seguras y luego Oxfmt al código
  del proyecto. El paquete de contexto se mantiene excluido.
- Control negativo temporal: código con comillas dobles, punto y coma, imports
  desordenados y bloques pegados provoca exit 1 tanto en lint como en
  format:check. Los comandos reales de lint-staged lo corrigen, ambos checks
  pasan y una segunda ejecución deja el contenido idéntico.
- `pnpm verify`: lint, formato, TypeScript/Astro, las 12 pruebas de
  dominio/servicio y build completos.
- VS Code: Oxc como formateador para Astro, JS, JSX, TS y TSX; fixAll al guardar
  y organización de imports delegada a Oxc. Husky conserva el hook de
  lint-staged con autocorrección.

Este mantenimiento conserva el punto de reanudación en H2. Los recorridos E2E y
el MP4 documentados abajo pertenecen a la entrega funcional H1 anterior.

## H1: resultado medido

Proyecto `16be4a2a-8b27-4974-8cd1-06e20f291842`, revisión 6, trabajo
`0f52972e-b705-4184-9a0e-a2702d9ea17a`. Se importó el fixture H.264/AAC de tres
segundos, se reprodujo, se confirmó el frame presentado 45, se dividió con S
junto con su audio, se deshizo y rehizo, se redujo el segundo clip de 45 a 36
frames y se reabrió el proyecto. Duración esperada y observada: **81 frames, 2,7
s**.

Salida: **1280×720, H.264, yuv420p, CFR 30/1, AAC estéreo a 48 kHz**. El MP4 se
obtuvo mediante la descarga de la UI y se inspeccionó con ffprobe del host,
además de la inspección del worker. Salida guardada en
`.jencut/evidence/h1-export.mp4`; el job conserva su copia en el volumen Docker.

SHA-256 del original antes y después:
`156be3a45f19513bf12dd8a99584d4c2f7217b15cd000a6cf8684c25d1dc7de7`. El hash
administrado de Docker también se volvió a leer y coincide. El hash del MP4
final, la inspección completa y el user agent están en `h1-export.json`.
`h1-job-snapshot.json` fija el montaje exportado; `h1-ffmpeg.json` conserva la
lista real de argumentos. No hay render por temporizador ni salida simulada.

## Experimentos técnicos

| Experimento   | Hipótesis, método y resultado                                                                                                                                                                                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SP-01         | Un preview de montaje FFmpeg reproducido por un único video conserva cortes y mezcla. Reproducción real y seek a frame 45 confirmados con requestVideoFrameCallback; exportación 81 frames. Adoptado para H1. El coste de regenerar revisiones se muestra; p95, diez minutos y paridad de efectos aún no están medidos.         |
| SP-03         | Importar e inspeccionar el corpus antes de habilitar recursos. Pasaron H.264 con/sin audio, WAV 44,1 kHz mono, WAV 48 kHz estéreo y PNG. Se mezclaron los dos WAV con el video sin audio y se inspeccionó salida de 90 frames con AAC estéreo 48 kHz. PNG solo acredita importación, no paridad alfa. HEVC/HDR no certificados. |
| SP-04 inicial | Confirmar manifiestos durables y separar montaje/jobs. Guardado y reapertura del servicio reales, revisión obsoleta 409, segunda sesión 423, idempotencia de envío y cancelación sin descarga final. Se probaron 105 comandos y su undo. Los crash tests de worker, disco lleno y carrera de publicación quedan en H4.          |
| SP-02 / SP-05 | No ejecutados: efectos/color/texto y presupuesto de rendimiento pertenecen a H3/H6.                                                                                                                                                                                                                                             |

## Fallos y aislamiento

- MP4 corrupto: 422 INVALID_MEDIA; el mismo lote sigue con el archivo válido.
- Trim fuera de rango y split en borde: rechazados sin mutar el proyecto.
- Colisión, miembro vinculado bloqueado y ripple con clip cruzado: rechazo
  atómico; se conserva montaje y revisión.
- Proyecto vacío: exportación bloqueada. Revisión obsoleta: 409. Otro
  origen: 403. Segunda sesión: solo lectura con 423 al intentar adquirir
  edición.
- Cancelación básica: estado cancelado, output no disponible. Reenviar el mismo
  render devuelve el mismo ID. No se certifican aún todas las carreras de H4.
- Pista visual oculta: el render se decodificó a un pixel RGB negro. Pista de
  audio silenciada: PCM decodificado con amplitud máxima de una unidad de s16.

## Incremento H2

Crear, renombrar y ordenar pistas; mover/duplicar vinculados; rechazo de
colisión como conjunto; bloqueo; hide/mute coherentes en render; ripple
conservador; retirar un recurso sin uso mediante DropdownMenu; copia de proyecto
con nuevos IDs y medios compartidos inmutables. El recorrido de navegador
registra el rechazo de movimiento bloqueado comparando los manifiestos antes y
después. `h2-increment.json` conserva resultados. H2 sigue en curso: falta
selección múltiple arbitraria y completar los casos descritos en
`docs/STATUS.md`.

## UI y límites de la certificación

Capturas reales de proyectos, editor, audio y exportación en
`progress/evidence/`, editor también a 1280×720. Auditoría axe sin violaciones
en las superficies de escritorio examinadas, foco de modal y retorno de foco
probados. Esto no equivale a WCAG completo ni a M1 terminado.

El preview inicial reduce calidad y requiere preparar cada revisión; no se
promete tiempo real, seek de precisión profesional en todos los navegadores,
color HDR, composición alfa o sincronización larga. El waveform es una
envolvente normalizada de muestras decodificadas, no un medidor de nivel de
salida.

## Publicación y flujo Git

La entrega se organiza en commits convencionales separados por responsabilidad
en `feature/m1-editor-foundation`, con base `develop`. Los hooks se ejecutaron
en cada commit, con autor y committer `jeancdev <jcode2006@gmail.com>` y sin
coautores. El commit local inicial que agrupaba contextos y herramientas se
retiró antes de publicar y sus archivos se repartieron por propósito.

Se corrigió un fallo real del hook: Oxfmt devolvía error si todos los archivos
preparados estaban excluidos intencionadamente. lint-staged usa ahora
`--no-error-on-unmatched-pattern`; los errores reales de formato, sintaxis y
Commitlint siguen bloqueando los commits.

Se repitieron `pnpm verify`, `pnpm dev`, `pnpm test:e2e` y `pnpm evidence`: doce
pruebas, tres recorridos de Chromium, Docker reconstruido y exportación de 81
frames inspeccionada. Los registros actualizados están en `quality.txt` y
`e2e-development.txt`. El recorrido sobre producción de `e2e-production.txt`
pertenece a la verificación anterior.

El acceso SSH y la API de GitHub autentican a `jeancdevx`. Se preparó GitHub CLI
oficial 2.103.3, con SHA-256 del release comprobado, en
`/tmp/jencut-github-cli/gh`. La entrega se revisa en la
[PR #1](https://github.com/jeancdevx/jencut/pull/1) con base `develop` y método
de integración merge commit. CI verifica los commits, el título de la PR y los
recorridos reales antes de la integración.
