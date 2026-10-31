# Base vigente de implementación - 1.1 de contexto

Fecha: 30 de octubre de 2026. Este documento complementa, sin reescribir, la
especificación v1.0 del 28 de octubre. El usuario ha pedido preparar el paquete
para que Codex empiece a trabajar después de revisar la identidad, wireframes y
diseños finales.

## Decisiones de arranque

| Tema         | Base para actuar                                                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Marca        | Jencut, ruta A / Precision, Manrope e Inter; Jeni como mascota de la continuidad elegida.                                                                                     |
| Apariencia   | Las cuatro imágenes de design/references son la referencia visual principal; no reemplazar por un dashboard genérico.                                                         |
| Arquitectura | Adoptar interfaz web + servicio local como base de implementación; verificar mediante SP y ajustar con evidencia si falla.                                                    |
| Stack        | React y TypeScript, servicio/worker Node.js y TypeScript, FFmpeg/ffprobe nativos y SQLite para índice y jobs. Frameworks concretos y versiones se fijan al crear el proyecto. |
| Gestión      | pnpm preferido y lockfile único. No se exige una versión inventada; comprobar compatibilidad actual del entorno.                                                              |
| Entorno      | Detectar SO real; Windows/Chromium es un objetivo previo de pruebas, no un dato del equipo actual. Soportar arranque Windows/Linux con scripts portables.                     |
| Alcance      | 45 RF M1; los 9 RF restantes conservan M2/M3.                                                                                                                                 |
| Aprobaciones | Ejecutar la implementación y las comprobaciones por hitos. Las puertas son criterios técnicos, no solicitudes obligatorias al usuario después de cada paso.                   |

## Qué cambia frente a la preparación anterior

La sección planning-only de
reference/preproduction-v1/documentacion/09-preparacion-desarrollo.md describe
el momento en que se creó esa documentación. El encargo de arranque permite al
agente construir y ejecutar SP-01 a SP-05; no tiene que esperar archivos reales
del usuario para comenzar con medios sintéticos.

Las preguntas Q-01 a Q-04 se usan como variables de validación. Hasta que el
usuario cambie una condición, adoptar procesamiento local, formatos M1 y límites
propuestos; registrar hardware real y compatibilidad observada. Si descubre que
no puede satisfacer una función esencial, presentar el problema concreto y una
alternativa verificable, sin afirmar que la función pasó.

El diseño final es posterior a los wireframes. Mantener su carácter visual y la
organización del editor. Corregir valores ilustrativos, duraciones, atajos y
estados según la especificación, sin copiar inconsistencias de una imagen
generada.

## Estado actual

Al preparar el paquete original todavía no existía una implementación del
editor. La aplicación vigente está ahora en `src/`; consultar `docs/STATUS.md` y
`progress/STATE.json`. Están presentes contexto, assets, contratos de ejemplo y
utilidades para preparar pruebas. Los resultados de verificación del paquete no
certifican requisitos del software futuro.
