# Jencut

Editor de video personal y local con Astro, React, TypeScript, shadcn/ui y
FFmpeg. Identidad Precision A, con Manrope e Inter servidas desde el proyecto.

## Arranque

Requiere **Node 24.22.2**, **pnpm 10.33.2** y Docker con Compose. `.nvmrc` y
`.node-version` fijan Node. Si usas nvm, ejecuta `nvm install && nvm use`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abre **http://127.0.0.1:4321**. El comando inicia el servicio con Docker y Astro
con `astro dev --background`. SQLite, originales, proxies y renders viven en el
volumen `jencut_jencut-data`; no requieren una base de datos externa.

```sh
pnpm dev:status
pnpm dev:logs
pnpm dev:stop
```

`pnpm dev:stop` conserva los proyectos y medios. Para trabajar únicamente en la
interfaz con el servicio ya iniciado: `pnpm dev:web`. Tras editar el backend,
vuelve a ejecutar `pnpm dev` para reconstruir su imagen conservando el volumen.

## Comprobaciones

```sh
pnpm fixtures:verify
pnpm verify
pnpm exec playwright install chromium
pnpm test:e2e
pnpm evidence
```

`verify` ejecuta Oxlint, Oxfmt, TypeScript/Astro, pruebas de dominio/servicio y
build. Las pruebas del servicio requieren FFmpeg y ffprobe en el host. Las
pruebas E2E usan el servicio de Docker y generan una exportación real,
inspeccionada con ffprobe del host. Husky ejecuta lint-staged antes del commit y
Commitlint valida Conventional Commits, por ejemplo
`feat(editor): add linked clip splitting`.

Para aplicar el estilo completo, ejecuta `pnpm format`: comillas simples, sin
punto y coma finales, imports ordenados y separación entre bloques. También se
aplica al guardar en VS Code y antes del commit. Las reglas están descritas en
[Estilo de código](docs/current/CODE_STYLE.md).

Para comprobar el build: `pnpm build && pnpm preview`, después
http://127.0.0.1:4173. `pnpm preview:stop` detiene ese servidor.

## Primer recorrido

Crea un proyecto e importa `fixtures/smoke/clip-with-audio.mp4`. Pulsa su
miniatura para añadirlo a la secuencia. Selecciona el clip, sitúa el cabezal
dentro de él y pulsa **S** para dividir video y audio juntos. El inspector
permite recortar y mover usando frames enteros. Exporta y descarga el MP4 cuando
la inspección haya terminado. `invalid-media.mp4` permite comprobar el rechazo
de un archivo corrupto.

## Código y documentación

Todo el código vive en `src/`: `pages`, `components/ui` (shadcn/ui), `styles`,
`domain`, `contracts` y `service/worker`. Los comandos están en `scripts/` y las
pruebas en `tests/`.

- [Estado y reanudación](docs/STATUS.md)
- [Ramas, commits y pull requests](docs/current/GIT_WORKFLOW.md)
- [Plan por hitos](docs/PLANS.md)
- [Evidencias y límites](progress/VERIFICATION.md)
- [Arquitectura vigente](docs/current/ARCHITECTURE.md)
- [Referencia visual](design/DESIGN_SPEC.md)

El paquete original `jencut-codex-starter-v1/` se conserva íntegro. Su contexto
se copió a `docs/`, `design/`, `assets/`, `specification/`, `reference/`,
`fixtures/` y `scripts/`. Los manifiestos históricos del paquete están en
`docs/context/`. H0 y H1 son cortes iniciales; M1 completo aún no está
certificado.
