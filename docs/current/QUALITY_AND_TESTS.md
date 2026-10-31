# Verificar comportamiento y calidad

Los 18 RNF completos y sus métodos están en specification/requirements-v1.json y
en el capítulo 04 original. Aquí se precisan las prioridades para
implementación.

## Capas

- Dominio: propiedades temporales, split/undo como round-trip, trim dentro de
  fuente, colisiones, grupos vinculados, ripple y bloqueo atómicos.
- Persistencia: guardar/cargar, revision esperada, segunda sesión, copia previa,
  fallo de disco y recuperación después de reiniciar.
- Medios: inspección y rechazo seguro, proxies, fuente VFR, archivo sin audio,
  44.1 kHz, rotación, alfa y texto con tildes. Golden render para geometría,
  color y sonido.
- Jobs: idempotencia, un render activo, cancelación y carrera con publicación,
  desconexión UI, interrupción de worker y reintento.
- UI/E2E: operaciones reales con teclado y click sin arrastre, errores
  recuperables, guardado y exportación; comparación visual con maquetas.

## Evidencia mínima de un render

Registrar build y versiones, projectId/revision y preset, hash de fuentes
antes/después, comando de verificación, streams/duración de salida, resultado
esperado y observado. Salida cero del proceso por sí sola no demuestra
sincronización o paridad del montaje.

## Rendimiento y entornos

RNF-01 a 04 y 14 tienen presupuestos por medir, no capacidades certificadas.
Registrar el hardware real y ejecutar C1/C2 según la especificación; los dos
clips smoke incluidos no sustituyen esos corpus. Separar debug/release y cache
fría/caliente al medir. No inventar p95 ni extrapolar desde una sola corrida.

## Fallos que bloquean completar M1

Corrupción o sobrescritura de originales, pérdida silenciosa de guardado, audio
duplicado, desincronización creciente, render parcial anunciado como final,
clips fuera de rango, comandos parcialmente aplicados y servicio expuesto sin
controles. Registrar los requisitos afectados y resolver antes de declarar
aceptación.

## Estado de verificación

Todo caso del producto comienza no ejecutado. Las comprobaciones incluidas de
este ZIP solo validan archivos, referencias, esquema de ejemplo y fixtures. El
agente actualiza la matriz con código, entorno y evidencia antes de cambiar un
estado a aprobado.
