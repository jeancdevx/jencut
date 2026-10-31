# Plan de implementación

Los hitos ordenan el trabajo, no sustituyen los RF ni habilitan una espera
automática de aprobación. Al completar un hito y sus verificaciones, continuar
con el siguiente viable. El estado vigente está en `progress/STATE.json`: H0 y
H1 completos, H2 en curso.

## H0 - Entorno y base reproducible

Estado: completo. Evidencia: `progress/evidence/quality.txt` y
`environment.json`.

Leer el contexto mínimo; verificar Node/package manager, FFmpeg/ffprobe y SO;
fijar dependencias y lockfile; crear estructura de aplicación, comandos reales
de dev/build/check/test, registro de decisiones y diagnóstico local. Verificar
fixtures del paquete. Iniciar cliente/servicio en loopback sin exponer rutas
arbitrarias. Mostrar shell de Jencut con las fuentes y marca reales.

Aceptación: instalación reproducible en el entorno, UI y health/diagnóstico
reales, instrucciones exactas de arranque, inventario de versiones y al menos un
test de dominio. No etiquetar esto como M1 completo.

## H1 - Corte funcional de extremo a extremo

Estado: completo para este corte inicial. Evidencia:
`progress/evidence/h1-export.json`.

Capacidades implicadas, de forma inicial:
RF-01/03/04/07/09/10/11/12/25/26/28/29/30/38/51/52/54. Implementar una secuencia
con video y audio, importación en streaming, inspección, proxy/preview, trim y
split enteros, undo, manifiesto durable y render nativo. Mantener separación
dominio/UI/servicio/worker. Empezar por los casos mínimos necesarios y ampliar
hasta cubrir cada RF en sus hitos siguientes.

Aceptación: con un fixture real se crea proyecto, importa, reproduce,
divide/recorta, guarda, reabre y exporta un MP4 cuya duración y streams se
inspeccionan. Original hash igual. Archivo corrupto o rango inválido se rechaza.
Registrar limitaciones de fidelidad del preview.

## H2 - Montaje multipista completo

Estado: en curso. Incremento verificado de pistas, operaciones vinculadas y
biblioteca; pendiente selección múltiple arbitraria y completar
trim/cache/papelera.

RF-02/05/06/08/13/14/15/39/40/50 y completar RF de H1: recursos y proyectos,
miniaturas, hasta 4V+4A, mover/duplicar, colisiones, bloqueo, visibilidad,
snapping/zoom, cierre de hueco conservador y papelera. Operaciones de grupo
atómicas.

Aceptación: pruebas de colisión, bloqueo, ripple y grupos; no mutar
parcialmente; undo/redo de al menos 100 comandos por sesión y estados de pista
coherentes en render.

## H3 - Audio y acabado visual

RF-16/17/18/19/20/21/22/23/24. Desvincular sin duplicar sonido,
ganancia/mute/fades, extraer WAV, mezcla, transformaciones, corrección básica,
títulos e imágenes. Usar fuentes incluidas en preview y render.

Aceptación: paridad visual/audio medida con casos golden, sincronización de 10
minutos y sin deriva, texto con tildes, PNG alfa y sonido limitado según
política. Documentar estrategia de color y de limitación de picos; no prometer
corrección HDR ni funciones de M2.

## H4 - Persistencia y operaciones resistentes a fallos

RF-27/31/32/33/34/49 y completar RF-26/29/30/51/54: snapshots, revisión
esperada, segunda sesión de solo lectura, relocalización, manifiesto de
intercambio sin medios, cache con leases, cola/reconexión, cancelación y
reintento idempotente.

Aceptación: matar worker o servicio y reabrir; disco lleno/permiso denegado;
doble envío de exportación produce un job; cancelación no publica parcial;
último original compartido no se borra mientras haya referencias.

## H5 - Experiencia completa y fidelidad del diseño

RF-35/36/37/38 más revisión de todas las pantallas. Completar tema claro/oscuro,
escala, teclado, alternativa por click al arrastre, foco/errores, mensajes de
Jeni, navegación y pantallas vacías. Capturar proyectos, editor, audio y
exportación en tamaños 1440x900 y 1280x720.

Aceptación: comparar región por región con design/references, usar componentes
reales, ejecutar recorrido U1 sin pantalla falsa y validar contraste/foco. Una
aproximación genérica con nombres correctos no cumple la intención visual.

## H6 - Cierre M1

Ejecutar la matriz completa de 45 RF M1, 18 atributos aplicables y casos de
fallo con entorno/versiones/corpus. Medir, no inventar: latencia p95, memoria,
reproducción, sincronización y render. Preparar instalación local limpia y guía
de recuperación.

Aceptación: todos los Must satisfechos o un registro explícito de los que
impiden liberar. Sin defectos altos que comprometan medios/trabajo/exportación.
Guion U1 realizado con evidencia. Solo entonces marcar M1 terminado. M2/M3
quedan planificados.

## Experimentos integrados

SP-01 preview/seek/sincronización en H1 y H3; SP-02 color/texto/efectos en H3;
SP-03 formatos del corpus en H1, ampliable con medios reales; SP-04
guardado/cancelación/reinicio desde H1 y completo en H4; SP-05 presupuesto de
rendimiento en H6. Cada experimento deja hipótesis, método, entorno, resultados
y decisión en progress/VERIFICATION.md y docs/current/DECISIONS.md.
