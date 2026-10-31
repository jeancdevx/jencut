# feat(editor): deliver persistent M1 editing and inspected MP4 exports

Jencut pasa de la pantalla inicial de Astro a un editor local que crea y reabre
proyectos, importa medios reales, permite recortar y dividir sin reescribir los
originales y descarga un MP4 después de inspeccionarlo.

## Cambios

- Código en `src/`, con Astro, React y componentes shadcn adaptados a Precision
  A, Manrope e Inter locales.
- Dominio de montaje por frames, edición vinculada, colisiones y bloqueos
  atómicos, historial y revisiones esperadas.
- Servicio Fastify con SQLite y FFmpeg en Docker, manifiestos durables, imports
  inspeccionados, proxies, waveforms y exportación mediante workers.
- Node 24.22.2 y pnpm 10.33.2; Oxc, Husky, lint-staged, Conventional Commits y
  CI.
- Contexto original, referencias y recursos conservados y separados del runtime.

## Verificación ejecutada

- `pnpm verify`: lint, formato, TypeScript/Astro, 12 pruebas de dominio/servicio
  y build correctos.
- `pnpm dev`: imagen Docker reconstruida y servicio saludable; Astro background.
- `pnpm test:e2e`: tres recorridos con Chromium sobre el editor real.
- `pnpm evidence`: MP4 de 81 frames, 2,7 segundos, 1280×720, H.264 y AAC a 48
  kHz; hashes de originales sin cambios.
- Hooks ejecutados en los commits; mensajes convencionales y autoría del
  usuario.

Las evidencias y límites se detallan en `progress/VERIFICATION.md`.

## Alcance pendiente

H0 y H1 completos; H2 tiene un primer incremento verificable. M1 sigue abierto:
selección múltiple y extensión de trim, efectos/audio avanzado, recuperación y
paridad visual y de rendimiento pertenecen a los siguientes cortes. M2/M3
permanecen fuera del alcance de esta PR.

Base: `develop`. Integración mediante merge commit, conservando los commits
separados por responsabilidad.
