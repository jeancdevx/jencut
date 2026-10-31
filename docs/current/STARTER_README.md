# Jencut - paquete de arranque para Codex

Versión 1.0 / 30 de octubre de 2026. Propietario: Jeancarlo. Este paquete reúne la definición del producto, su identidad, los diseños de alta fidelidad y las instrucciones para comenzar a implementarlo.

## Empezar en tres pasos

1. Extrae el ZIP en una carpeta nueva. Abre **jencut-codex-starter-v1** como carpeta de trabajo de Codex, con acceso de lectura y escritura a ella.
2. Abre **PROMPT_INICIO_CODEX.md** y pega su contenido completo en la conversación del agente.
3. El agente debe leer **AGENTS.md** y **START_HERE.md**, verificar el entorno y comenzar el primer hito. El historial de este chat no es necesario.

No necesitas instalar este paquete como skill ni crear otro agente con la API. Es contexto de proyecto e instrucciones de ejecución para tu agente de Codex. Si ya tienes un repositorio con trabajo propio, incorpora el paquete sin reemplazar sus instrucciones ni archivos existentes.

## Qué contiene

| Ruta | Uso |
| --- | --- |
| AGENTS.md | Instrucciones persistentes y breves del proyecto. |
| PROMPT_INICIO_CODEX.md | Encargo inicial: implementar y verificar, comenzando por el primer corte funcional. |
| PROMPT_CONTINUAR_CODEX.md | Reanudar desde el estado y la evidencia guardados. |
| START_HERE.md | Orden de lectura y autoridad de las fuentes. |
| GOALS.md / PLANS.md | Resultados, límites y secuencia de hitos. |
| STATUS.md | Estado real inicial, sin capacidades del producto declaradas como hechas. |
| docs/current/ | Base vigente, arquitectura, decisiones, calidad, pruebas y backlog. |
| specification/ | 54 requisitos, 18 atributos de calidad y esquema propuesto del manifiesto. |
| design/ | Cuatro pantallas de alta fidelidad, tokens, interacción y diferencias que resolver. |
| assets/ | Fuentes con licencia, Jeni, SVG de la marca y favicon. |
| fixtures/ | Medios sintéticos pequeños de prueba y manifiesto de ejemplo. |
| scripts/ | Generación reproducible de fixtures y comprobación del paquete. |
| reference/preproduction-v1/ | Paquete documental anterior completo, con PDF y Markdown originales. |
| progress/ | Plantillas para registrar avance, decisiones y evidencia. |

## Qué recibes y qué hará Codex

La documentación, los diseños y los recursos están incluidos. **El editor todavía debe implementarse.** No hay un servidor, un cliente ejecutable ni benchmarks del producto aprobados. Los scripts y fixtures de este paquete son utilidades de preparación; no sustituyen la aplicación.

El primer resultado esperado de Codex es una base ejecutable: interfaz con la identidad de Jencut, un servicio local, importación real de un clip, división/recorte, guardado y una exportación inspeccionada. Después continúa por los hitos hasta completar M1. Una página que solo muestra las maquetas no satisface el encargo.

## Comprobar el paquete

Con Python 3: `python scripts/validate_handoff.py`. Con FFmpeg y ffprobe instalados: `python scripts/generate_test_media.py --profile smoke --output fixtures/generated-smoke`. El generador conserva archivos existentes y comprueba su identidad; no descarga videos de terceros.

Para regenerar los PNG e ICO a partir de los SVG: `python scripts/export_brand.py --overwrite` (FFmpeg con librsvg). Los hashes son un snapshot de entrega: tras modificar el proyecto, `--skip-checksums` permite verificar los materiales sin exigir que el contexto siga intacto.

Los comandos de aplicación como `pnpm dev` aún deben ser creados y documentados por el agente en el primer hito. No se presentan aquí como comandos ya disponibles.

## Referencias de instrucciones

AGENTS.md sigue la convención de instrucciones de proyecto documentada por OpenAI. Los demás archivos son convenciones de este proyecto y deben leerse mediante las rutas indicadas. Fuente: https://learn.chatgpt.com/docs/agent-configuration/agents-md
