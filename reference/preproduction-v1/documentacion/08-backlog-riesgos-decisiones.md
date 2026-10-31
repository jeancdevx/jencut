# Backlog, riesgos y decisiones

## Entregas e hitos

M0 - definición y viabilidad: revisar este paquete, ejecutar los spikes al comenzar el repositorio y certificar un flujo mínimo con medios de prueba. M0 no es una versión utilizable del editor.

M1.1 - proyecto y medios: modelo, manifiesto, inspección, proxies, biblioteca y layout. M1.2 - montaje: comandos, timeline, audio y undo. M1.3 - acabado: efectos básicos, títulos y render. M1.4 - confianza: recuperación, límites, accesibilidad y aceptacion. M1 solo se considera completo cuando todas estas partes y sus RNF pasan.

M2 y M3 se priorizan después del uso real. No se asignan fechas de calendario ni horas sin conocer dedicacion, hardware y resultados de los spikes. La estimación se realiza por historias verificables, incluyendo UX, pruebas y recuperacion.

## Spikes con salida obligatoria

| ID | Pregunta | Experimento | Criterio para decidir |
| --- | --- | --- | --- |
| SP-01 | Es viable el preview sincronizado? | Componer 2V+2A con proxy, seek aleatorio y original VFR; comparar cliente y alternativa servida. | Cumplir RNF-02/03; si no, elegir preview final servido y revisar alcance/latencia. |
| SP-02 | Coinciden efectos, color y texto? | Render de 10 casos golden con transformación, color, opacidad, alfa y tildes; comparar preview. | Misma geometria/tiempo; SSIM y audio dentro de tolerancias; documentar rango/gamma y fuente. |
| SP-03 | Que formatos reales del usuario funcionan? | Inventariar al menos 10 archivos representativos, codecs/rotacion/VFR; importar y exportar. | Matriz exacta con aceptar/normalizar/rechazar y costo; decidir si HEVC pasa a M1. |
| SP-04 | Es durable el guardado y cancelable el worker? | Matar procesos durante save/render; disco lleno; reintentar solicitudes; reconectar UI. | RNF-05/08/17 y ausencia de corrupcion o doble render. |
| SP-05 | Cual es la envolvente real? | Ejecutar C1 y C2 en H1 con versiones fijadas; medir latencias, memoria y render. | Ajustar E1 con evidencia antes de prometer 4K, 60 fps o proyecto mayor. |

## Riesgos reales del proyecto

| ID | Riesgo | Probabilidad/impacto | Mitigacion y disparador |
| --- | --- | --- | --- |
| R-01 | Preview y render difieren en texto/color o sincronización | Alta/Alta | SP-01/02 y golden tests; bloquear el efecto si no hay paridad o proveer preview final. |
| R-02 | Material de telefono HEVC/HDR/VFR fuera de M1 | Alta/Alta | SP-03 con archivos reales; conversion explicita y ampliar formatos solo tras certificar. |
| R-03 | Disco o memoria insuficientes | Media/Alta | Streaming, límites, cuota y preflight; detener limpiamente antes de publicar parciales. |
| R-04 | Corrupcion o sobrescritura de trabajo | Media/Alta | Revisión esperada, snapshots, atomicidad, solo lectura de segunda sesión y pruebas de falla. |
| R-05 | Crecimiento del alcance profesional | Alta/Alta | Requisitos M1 cerrados, M2/M3 separados y cambios con impacto visible. |
| R-06 | Servicio local expuesto a otro sitio o comandos inseguros | Media/Alta | Loopback, token, Origin/Host, argumentos sin shell, sandbox de worker y limites. |
| R-07 | Tiempo de instalación o uso offline no aceptable | Media/Media | Validar instalación local; dependencias y fuentes incluidas; sin servicios remotos por defecto. |
| R-08 | Licencias de binarios, fuentes y codecs al redistribuir | Media/Media | Registrar distribución exacta de FFmpeg y dependencias antes de distribuir; uso personal inicial no equivale a licencia universal de redistribucion. |
| R-09 | Mockup interpretado como capacidad implementada | Media/Media | Etiquetar prototipo y pruebas no ejecutadas; releases solo con evidencia funcional. |

## Registro de decisiones

| ID | Decisión | Estado | Motivo y consecuencia |
| --- | --- | --- | --- |
| D-01 | Jencut + Precision A + Manrope/Inter | Confirmada por usuario | Guia visual de todos los prototipos; masters finales de logo aún por producir. |
| D-02 | Jeni como mascota | Propuesta presentada | Se usa como referencia; ratificar nombre/arte y limpiar assets antes de integrar. |
| D-03 | Web orientada a escritorio y un usuario | Recomendada | Reduce complejidad; colaboracion/movil fuera de M1. |
| ADR-01 | Interfaz web + servicio local nativo | Recomendada; SP-01/04 | Mejora control sobre archivos/jobs; requiere instalación y no es 100% navegador. |
| ADR-02 | Manifiesto versionado y comandos de dominio | Recomendada | Montaje no destructivo y pruebas sin UI; SQLite no duplica autoridad del montaje. |
| ADR-03 | 30 fps CFR SDR y H.264/AAC inicial | Recomendada; SP-03 | Base temporal coherente y matriz acotada; 4K/fps avanzados M2. |
| ADR-04 | Preview por proxies, render por originales | Recomendada; SP-01/02 | Capacidad y paridad por validar; fallback servido si procede. |
| ADR-05 | Una sesión editora y un render activo | Recomendada | Previene conflictos y contencion; segunda pestana solo lectura. |

## Preguntas que pueden cambiar la línea base

Q-01: aceptar un servicio local, o exigir cero instalación? Si es cero instalación, reabrir ADR-01 y persistencia/render.

Q-02: hardware real y navegadores objetivo? Ajusta H1 y benchmarks, no los datos ya confirmados de marca.

Q-03: predominan videos de telefono HEVC/HDR o de grabacion de pantalla? Ajusta formatos y corpus.

Q-04: 4K, 60 fps y subtitulos son imprescindibles en primera entrega? Si lo son, mover sus requisitos a M1 y reevaluar costo/riesgos.

Q-05: preferencia entre cierre de hueco conservador y edición ripple más avanzada? La opcion conservadora propuesta evita cambios inesperados y puede ampliarse despues.

No es necesario resolver todas para revisar el prototipo. Antes de comprometer implementación M1 deben resolverse las que alteren arquitectura, formatos o alcance.
