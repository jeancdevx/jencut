# Reanudar Jencut

1. Leer `AGENTS.md` en la raíz.
2. Leer `docs/STATUS.md` y `progress/STATE.json`.
3. Consultar `docs/current/BASELINE.md`, `docs/current/DECISIONS.md` y
   `design/RECONCILIATION.md` para decisiones vigentes.
4. Seguir el primer trabajo pendiente de H2 en `docs/PLANS.md`. Los RF/RNF
   originales permanecen en `specification/requirements-v1.json`.
5. Verificar el estado real con `pnpm dev:status`, `pnpm verify` y las
   evidencias.

El código está en `src/`. El servicio y SQLite se ejecutan en Docker; Astro usa
`astro dev --background`. Ver `README.md` para el arranque reproducible. El
paquete original se conserva como referencia histórica, sin editarlo.
