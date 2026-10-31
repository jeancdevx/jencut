# Visión y alcance

## Visión

Jencut será un editor de video personal con interfaz web, orientado a escritorio, que permita a Jeancarlo transformar fragmentos de video, audio e imagen en piezas terminadas mediante montaje no destructivo, control temporal preciso y exportación verificable. Su identidad Precision combina claridad, control y el uso moderado de lavanda.

## Problema y propuesta de valor

La necesidad expresada es reunir en una herramienta propia la importación de varios clips, corte, division, separacion de audio y efectos. No se atribuyen dolores o habitos adicionales al usuario sin validarlos. La propuesta es una herramienta a medida, con un flujo consistente de importar -> montar -> ajustar -> exportar y recuperación visible del trabajo.

El objetivo no es replicar todas las funciones de una suite comercial de una sola vez. Se prioriza un nucleo utilizable y extensible, con contratos temporales y de medios capaces de sostener las ampliaciones.

## Persona y contexto de uso

Usuario principal: Jeancarlo, desarrollador y propietario del producto. Uso inicialmente individual, con teclado, mouse y pantalla de escritorio. Ejemplos de tareas por validar: montajes personales, demostraciones de software, piezas verticales y contenido para proyectos. Estos ejemplos no se convierten automaticamente en funciones comerciales, colaboracion o IA.

Hipotesis de operación: Windows 11 y Chromium de escritorio; la interfaz se abre en el navegador y un servicio local administra archivos y procesa medios. Es una aplicación web local, no una aplicación nativa de escritorio. Si el servicio se aloja después en otro equipo, los medios vivirian en ese host y requeririan una nueva decisión de privacidad y acceso.

## Alcance M1 - primera versión utilizable

Crear/reabrir/duplicar proyectos; importar MP4 H.264/AAC, audio e imagen certificados; biblioteca; hasta 4 pistas visuales y 4 de audio; preview y avance por frame; seleccionar, mover, trim, split, duplicar y borrar; cierre de hueco conservador; audio vinculado/desvinculado, extracción WAV, ganancia y fundidos; transformar, brillo/contraste/saturacion, opacidad/fades; títulos e imagenes; undo/redo; autosave, snapshots y relocalización; exportación 720p/1080p30; cola, cancelación y reintento; manifiesto portable sin medios; cache y diagnóstico; alternativas accesibles al arrastre.

M1 conserva una base temporal fija de 30/1 fps CFR y SDR. Se ofrecen formatos 1920x1080, 1080x1920 o 1080x1080, con variantes 720 equivalentes. El proyecto no cambia de fps después de editar; formatos avanzados requieren una nueva secuencia en M2.

## Envolvente objetivo por validar

- H1: equipo de referencia propuesto de 6 núcleos físicos o rendimiento equivalente, 16 GiB RAM, SSD y 40 GiB libres; registrar modelo real antes de medir. No es un dato confirmado del equipo del usuario.
- E1: salida de hasta 10 minutos, hasta 50 clips de montaje y 30 assets fuente, hasta 10 GiB de originales administrados por proyecto. Límite individual inicial de archivo: 2 GiB, configurable solo tras pruebas de streaming y disco.
- Preview de referencia C1: 2V+2A a 720p30. La interfaz admite hasta 4V+4A, pero esa carga puede requerir degradacion explicita del preview; no se promete tiempo real en todos los casos.
- El servicio mantiene importación y exportación por streaming, sin cargar videos completos en memoria. Preflight informa que falta espacio incluso dentro de E1.
- Estos límites son presupuesto de ingenieria y objetivos de prueba. No son capacidades ya demostradas ni límites universales del navegador.

## M2 y M3

M2: marcadores/rangos, velocidad, disoluciones entre clips, keyframes, subtitulos manuales/SRT, 4K y fps adicionales certificados, paquete portable con medios. M3: transcripción local opcional y efectos avanzados descompuestos en futuras historias verificables.

## Fuera del alcance inicial

Colaboracion multiusuario, cuentas SaaS, facturacion, marketplace, publicación directa a redes, aplicaciones moviles de edición, HDR profesional, multicamara, RAW de camara, plugins arbitrarios y render distribuido. Una segunda pestana del mismo proyecto se abre en solo lectura para evitar conflictos.

## Resultados y medidas de exito

El usuario completa un montaje de cinco clips con corte, audio separado, título, ajuste visual y exportación; puede cerrar/reabrir sin perder la última revisión confirmada; el original conserva su hash; el archivo exportado tiene streams y duración correctos. Latencia, memoria y exportación se miden con los criterios de calidad de 04, aún pendientes de ejecutar.

## Objetivos trazables

| ID | Objetivo |
| --- | --- |
| OBJ-01 | Convertir fragmentos de video en un montaje completo sin modificar los archivos originales. |
| OBJ-02 | Controlar audio, composición, títulos y efectos básicos en una misma interfaz. |
| OBJ-03 | Conservar y recuperar el trabajo de forma verificable. |
| OBJ-04 | Exportar un archivo reproducible y coherente con la línea de tiempo. |
| OBJ-05 | Trabajar con privacidad, respuesta predecible y operaciones accesibles. |

## Supuestos y decisiones pendientes

Procesamiento local, hardware H1, formatos y límites E1 son supuestos propuestos. Falta validar videos reales del usuario, tolerancia a instalar un servicio local, necesidad de HEVC de telefono y prioridad de 4K/subtitulos. Mientras no se cambien, esta especificación mantiene una línea base coherente y evita bloquear las tareas de diseno.
