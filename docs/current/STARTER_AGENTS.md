# Jencut - instrucciones de proyecto

## Producto y fuentes

Construye un editor de video personal con interfaz web orientada a escritorio. Identidad: Jencut / Precision A / Manrope e Inter / mascota Jeni. El objetivo de la primera entrega es M1: montaje no destructivo, audio, efectos básicos, persistencia y exportación real.

Lee primero START_HERE.md, GOALS.md, PLANS.md y STATUS.md. Después consulta solo las secciones, requisitos e imágenes relevantes para el hito. La base vigente está en docs/current/BASELINE.md. reference/preproduction-v1 conserva el contexto anterior; sus avisos de planning-only o de validación humana pendiente no impiden ejecutar el encargo actual.

Para comportamiento mandan los requisitos y reglas vigentes. Para aspecto mandan design/references/01-editor.png a 04-export.png, design/tokens.json y design/DESIGN_SPEC.md. Los datos y atajos dibujados en imágenes son ilustrativos: aplica design/RECONCILIATION.md. No conviertas las maquetas en fondos de una falsa interfaz.

## Implementación

- Avanza por hitos verificables. Comienza a construir después de una comprobación breve del entorno; no termines solo con otro plan.
- Base técnica: React + TypeScript para cliente; Node.js + TypeScript para servicio y worker; FFmpeg/ffprobe nativos; manifiesto JSON como autoridad del montaje y SQLite para índice/jobs. Confirma versiones compatibles y crea lockfile. Detalles reemplazables se resuelven y documentan, sin reabrir la marca ni el alcance rutinariamente.
- Verifica el sistema operativo real. Windows es objetivo de pruebas, no una suposición sobre la máquina actual. Mantén rutas y arranque compatibles con Windows y Linux; no certifiques un entorno que no hayas probado.
- Separa dominio temporal, UI, persistencia y procesos de medios. Usa frames enteros a 30/1 fps y PTS racionales; rangos [inicio, fin). Un comando es atómico y reversible.
- Conserva originales inmutables. Preview por derivados; render por originales/intermedios de calidad. No anuncies paridad de color, texto o sincronización sin evidencia.
- Servicio en loopback por defecto, Host/Origin restringidos y token local; rutas confinadas al workspace, procesos sin shell e importación por streaming. No expongas el servicio a Internet como parte de este encargo.
- Mantén M2/M3 en backlog. Si un efecto esencial necesita una alternativa de preview, impleméntala y explica el límite; no lo elimines silenciosamente de M1.
- Usa assets y fuentes incluidos. El logo SVG es una reconstrucción de producción de la dirección A; Jeni es una ilustración estática. No inventes una mascota nueva, emojis como sustituto ni animaciones inexistentes.

## Verificación y continuidad

- Prueba invariantes de edición, round-trip del manifiesto, audio vinculado, errores de guardado y ciclo real de exportación. Cada operación temporal debe ser consistente en dominio, UI y resultado final.
- Ejecuta checks apropiados al cambio y registra comandos, resultado, entorno y artefactos en progress/VERIFICATION.md. Capturas de la UI no demuestran render ni recuperación.
- Actualiza progress/STATE.json y STATUS.md al cerrar un hito o antes de terminar una sesión. No marques una tarea como hecha si solo existe documentación o un botón sin comportamiento real.
- Resuelve decisiones reversibles de implementación y continúa sin pedir aprobación entre hitos. Si falta FFmpeg, red o una dependencia, registra el bloqueo exacto y sigue con tareas independientes; no inventes resultados. Pregunta solo por una decisión material que no pueda inferirse o resolverse técnicamente.
- Respeta trabajo preexistente e instrucciones de mayor alcance. No uses resets destructivos ni borres medios del usuario. Mantén cambios revisables y explica qué funciona, cómo se probó y qué falta.
