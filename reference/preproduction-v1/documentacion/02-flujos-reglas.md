# Flujos y reglas de dominio

Cada flujo describe estado inicial, ruta principal, excepciones y resultado. Todos corresponden al actor Usuario; Servicio de medios y Sistema de archivos son participantes tecnicos.

## FL-01 - Inicio y proyecto

Pantallas: UI-01 -> UI-02 -> UI-04. Requisitos: RF-01 RF-02 RF-50 RF-54.

Precondicion: servicio disponible y proyecto abierto, salvo FL-01; FL-08 permite partir de un manifiesto importado.

Ruta principal: Elegir Nuevo proyecto; nombrar, seleccionar formato y confirmar; mostrar editor vacio y guardado inicial.

Alternativas: Proyecto existente: abrirlo. Servicio ausente: mostrar diagnóstico y reintento. Segunda sesión: abrir solo lectura.

Postcondicion: proyecto consistente o estado anterior intacto; errores se muestran con accion de recuperación y nunca se ocultan como exito.

## FL-02 - Importar y preparar

Pantallas: UI-04 -> UI-03 -> UI-04. Requisitos: RF-03 RF-04 RF-05 RF-06 RF-52.

Precondicion: servicio disponible y proyecto abierto, salvo FL-01; FL-08 permite partir de un manifiesto importado.

Ruta principal: Seleccionar o arrastrar lote; copiar a almacenamiento administrado, inspeccionar, mostrar errores individuales y crear derivados.

Alternativas: Duplicado: reutilizar asset por hash y dejar trazabilidad; codec no certificado: marcar incompatible o solicitar conversion cuando este disponible; cancelar conserva resto.

Postcondicion: proyecto consistente o estado anterior intacto; errores se muestran con accion de recuperación y nunca se ocultan como exito.

## FL-03 - Montar y editar

Pantallas: UI-04 -> UI-05 -> UI-04. Requisitos: RF-07 RF-08 RF-09 RF-10 RF-11 RF-12 RF-13 RF-14 RF-15 RF-25 RF-39 RF-40.

Precondicion: servicio disponible y proyecto abierto, salvo FL-01; FL-08 permite partir de un manifiesto importado.

Ruta principal: Agregar a pista libre; seleccionar; posicionar cabezal; dividir o recortar; mover; comprobar resultado; deshacer si procede.

Alternativas: Colision: rechazar y resaltar destino. Vinculo/bloqueo: actuar atomico. Ripple: elegir intervalo y pistas; preflight y vista previa del efecto temporal.

Postcondicion: proyecto consistente o estado anterior intacto; errores se muestran con accion de recuperación y nunca se ocultan como exito.

## FL-04 - Trabajar audio

Pantallas: UI-05 -> UI-06 -> UI-04. Requisitos: RF-16 RF-17 RF-18 RF-19.

Precondicion: servicio disponible y proyecto abierto, salvo FL-01; FL-08 permite partir de un manifiesto importado.

Ruta principal: Seleccionar par V/A; desvincular cuando se necesite; mover audio, ajustar ganancia y fundidos; escuchar mezcla; opcionalmente extraer WAV.

Alternativas: Sin stream de audio: deshabilitar extraccion. Evitar audio duplicado; avisar de clipping y mantener política de limitacion final visible.

Postcondicion: proyecto consistente o estado anterior intacto; errores se muestran con accion de recuperación y nunca se ocultan como exito.

## FL-05 - Componer y aplicar efectos

Pantallas: UI-05 -> UI-07 -> UI-04. Requisitos: RF-20 RF-21 RF-22 RF-23 RF-24.

Precondicion: servicio disponible y proyecto abierto, salvo FL-01; FL-08 permite partir de un manifiesto importado.

Ruta principal: Seleccionar clip; transformar; ajustar brillo/contraste/saturacion; configurar fade; agregar título o imagen en pista superior.

Alternativas: Datos inválidos: no aplicar. Texto fuera de lienzo: aviso. Desactivar efecto compara antes/despues sin perder parametros.

Postcondicion: proyecto consistente o estado anterior intacto; errores se muestran con accion de recuperación y nunca se ocultan como exito.

## FL-06 - Guardar y recuperar

Pantallas: UI-04 -> UI-10 -> UI-04. Requisitos: RF-26 RF-27 RF-32 RF-48 RF-54.

Precondicion: servicio disponible y proyecto abierto, salvo FL-01; FL-08 permite partir de un manifiesto importado.

Ruta principal: Confirmar cambios; guardar revisión; mantener snapshot; al reabrir comparar última revisión válida y ofrecer recuperación cuando sea necesario.

Alternativas: Disco lleno: indicar Sin guardar y exportar manifiesto. Copia corrupta: retroceder a revisión válida; manifiesto sin medios: relocalizar.

Postcondicion: proyecto consistente o estado anterior intacto; errores se muestran con accion de recuperación y nunca se ocultan como exito.

## FL-07 - Exportar resultado

Pantallas: UI-04 -> UI-08 -> UI-09 -> UI-12. Requisitos: RF-28 RF-29 RF-30 RF-49.

Precondicion: servicio disponible y proyecto abierto, salvo FL-01; FL-08 permite partir de un manifiesto importado.

Ruta principal: Fijar revisión; elegir preset/ruta; ejecutar preflight; encolar render; seguir progreso; inspeccionar y publicar; abrir o descargar.

Alternativas: Cancelar, fallar o desconectar tienen estados distintos. Reintento es job nuevo; si se edito durante render indicar revisión exportada.

Postcondicion: proyecto consistente o estado anterior intacto; errores se muestran con accion de recuperación y nunca se ocultan como exito.

## FL-08 - Resolver medios

Pantallas: UI-10 -> UI-03 -> UI-04. Requisitos: RF-31 RF-33.

Precondicion: servicio disponible y proyecto abierto, salvo FL-01; FL-08 permite partir de un manifiesto importado.

Ruta principal: Detectar referencias ausentes; elegir archivos; comparar identidad; aceptar sustitucion si procede; revalidar todas las instancias.

Alternativas: No aceptar homonimos automaticamente; si fuente más corta, listar clips fuera de rango y bloquear exportación hasta resolver.

Postcondicion: proyecto consistente o estado anterior intacto; errores se muestran con accion de recuperación y nunca se ocultan como exito.

## FL-09 - Preferencias y soporte

Pantallas: UI-04 -> UI-11 -> UI-04. Requisitos: RF-34 RF-35 RF-36 RF-37 RF-38 RF-51.

Precondicion: servicio disponible y proyecto abierto, salvo FL-01; FL-08 permite partir de un manifiesto importado.

Ruta principal: Consultar almacenamiento y diagnóstico; limpiar cache regenerable; ajustar tema, escala, atajos y visibilidad de Jeni.

Alternativas: Limpieza respeta tareas activas; una preferencia de UI no altera video final; no perder montaje al cerrar preferencias.

Postcondicion: proyecto consistente o estado anterior intacto; errores se muestran con accion de recuperación y nunca se ocultan como exito.

## Reglas de negocio y edición

| ID | Regla | Definición |
| --- | --- | --- |
| RN-01 | Identidad de proyecto | Un proyecto usa UUID y versión de esquema. El nombre es una etiqueta, no una ruta ni una clave unica. |
| RN-02 | Tiempo preciso | El proyecto M1 usa frames enteros a 30/1 fps y rangos semiabiertos [inicio, fin). Las fuentes conservan PTS racional. Audio se evalua a 48 000 muestras/s. No acumular tiempos mediante sumas float. |
| RN-03 | Medios M1 | Entrada certificada objetivo: MP4/H.264 8 bit SDR y AAC; WAV PCM, MP3, PNG y JPEG. MOV, WebM, HEVC, HDR y codecs adicionales quedan detectados pero requieren una extension de la matriz certificada. |
| RN-04 | No destructivo | Un asset conserva contenido inmutable y huella SHA-256 calculada en streaming; varias instancias referencian la misma fuente. Un cambio de montaje nunca reescribe el original. |
| RN-05 | Compatibilidad explicita | Detectar codec, no inferirlo de la extension. M1 se evalua en Windows 11 + Chromium de escritorio con servicio local; otros entornos son experimentales hasta probarse. |
| RN-06 | Tipos de pista | Una pista visual admite video, imagen o título; audio va en pistas de audio. Importar video con sonido crea instancias V/A vinculadas en pistas libres. Sin sitio para ambas se solicita ubicación, sin perder sonido. |
| RN-07 | Colisiones | En M1 los clips de una misma pista no se solapan. Un movimiento o trim que colisiona se rechaza. Clips de diferentes pistas si pueden coincidir y se componen/mezclan. |
| RN-08 | Composición | V1 es fondo y V4 la superior. Componer de abajo arriba con alfa; zonas sin video son negras y sin audio son silencio. Pistas ocultas/silenciadas no contribuyen al render. |
| RN-09 | Edición por límites | Duración mínima: un frame del proyecto. Split solo en inicio < cabezal < fin. Trim conserva la posición de vecinos. Entradas numéricas y arrastre comparten el mismo comando validado. |
| RN-10 | Preview frente a maestro | Los proxies son derivados. El resultado final usa originales o intermedios de calidad. Un seek se considera realizado al presentar el frame solicitado, con indicador si esta pendiente. |
| RN-11 | Vinculo de audio | Un par vinculado conserva asset, rangos fuente y offset temporal. Split/move/trim actuan sobre el grupo salvo desvinculación explicita. Desvincular no genera copia ni mezcla duplicada. |
| RN-12 | Cierre de hueco | Ripple actua sobre un intervalo y conjunto explicito de pistas; desplaza clips completamente posteriores. Si cruza clips, pistas bloqueadas o vinculos externos incompatibles, la operación se rechaza y se explica. |
| RN-13 | Cadena de audio | Decodificar -> remuestrear 48 kHz -> rango -> ganancia -> fundidos -> mezcla -> limitador final a -1 dBTP -> AAC o WAV. El control de monitor solo cambia escucha. Registrar que el limitador puede alterar picos. |
| RN-14 | Cadena visual | Orientacion fuente -> rango temporal -> escala/crop -> corrección básica -> transformación en lienzo -> opacidad/fades -> composición por pistas -> títulos según su orden -> codificación SDR Rec.709. Definir políticas de rango y gamma en el spike. |
| RN-15 | Comandos atómicos | Un gesto confirmado equivale a un comando validado y reversible. Si falla una condicion se rechaza todo el comando. Guardado durable y estado de historial son conceptos separados. |
| RN-16 | Versionado y durabilidad | Guardar con revisión esperada, escribir temporal y publicar mediante reemplazo atomico. Conservar revisión previa válida y snapshots. Un manifiesto exportado no incluye medios. |
| RN-17 | Exportación consistente | Cada job fija revisión inmutable y ajustes. Validar recursos antes de iniciar; el progreso refleja tiempo procesado, no garantiza ETA. Finalizar exige inspección y publicación atómica; no sobrescribir sin accion explicita. |
| RN-18 | Jobs y concurrencia | Un render activo por equipo en M1; proxies con concurrencia máxima 2 configurable. Solicitudes usan idempotency key. Cancelacion/fallo son terminales; reintento crea job nuevo. Edición puede continuar sobre revisión posterior. |
| RN-19 | Almacenamiento administrado | El servicio administra medios importados, cache, proxies y renders en directorios separados. Cache usa claves versionadas, cuota configurable y leases. Se monitoriza espacio antes y durante tareas. |
| RN-20 | Interacción accesible | Toda accion de arrastre tiene alternativa por teclado y por click sin arrastre. No depender solo de color. Jeni es decorativa, ocultable y respeta movimiento reducido. |
| RN-21 | Funciones opcionales | Ningun servicio externo recibe medios sin una decisión posterior explicita. Funciones M3 requieren requisitos detallados antes de entrar en desarrollo. |
| RN-22 | Límites del servicio local | Bind loopback por defecto, origen/Host permitidos y token de sesion. Construir argumentos de procesos sin shell; resolver rutas dentro de raices autorizadas y controlar recursos de cada tarea. |

## Ejemplos temporales de referencia

- A 30 fps, un clip en [0, 300) dura 10 s. Split en frame 120 produce [0,120) y [120,300), sin duplicar ni omitir el frame de frontera.
- Un clip fuente de 20 s colocado en timeline frame 300, con IN fuente 5 s y duración 120 frames, muestra el intervalo fuente [5 s,9 s) durante [300,420). La conversion usa PTS racional y la política de muestreo de la fuente.
- Eliminar [90,150) deja un hueco de 60 frames. Cerrar ese hueco en pistas participantes desplaza los clips posteriores 60 frames a la izquierda, solo si nadie cruza el intervalo y todos los vinculos quedan consistentes.
- Desvincular V/A no crea otro sonido: cambia la relación entre las dos instancias existentes. Extraer audio crea un archivo WAV y no cambia la mezcla por si mismo.

## Estados de proyecto

Nuevo -> limpio -> modificado -> guardando -> limpio. Un error de guardado vuelve a modificado con aviso persistente. Un conflicto lleva a recuperación; la revisión durable anterior permanece. Recuperación -> limpio cuando se carga o duplica una revisión valida. Solo lectura nunca admite comandos de escritura.

## Estados de asset

Registrado -> copiando -> inspeccionando -> listo. Los derivados pueden seguir en preparando sin bloquear información ya validada. Incompatible/fallido/cancelado son resultados visibles; una referencia perdida pasa a ausente y vuelve a inspeccionando tras relocalizar.

## Estados de render

Validando -> en cola -> procesando -> verificando -> completado. Desde en cola/procesando/verificando antes del commit: cancelando -> cancelado. Después de la publicación, cancelar responde ALREADY_TERMINAL y conserva el resultado completado. Al reiniciar, un job sin worker ni salida verificada se marca fallido recuperable por interrupcion; no se reanuda silenciosamente. Cualquier fallo verificable termina en fallido. No hay transicion de cancelado a completado. Un reintento crea un job nuevo; una respuesta de red desconocida obliga a consultar el job existente mediante idempotency key antes de crear otro.
