# Atributos de calidad y plan de pruebas

Los valores siguientes son metas de aceptacion propuestas, no mediciones. Se prueban con versiones fijadas, H1 real documentado y datos del corpus. Un requisito funcional existente no implica que su atributo de calidad ya se cumpla.

## Corpus reproducible

C1 nominal: 5 videos sinteticos de 12 s cada uno, H.264 1080p30 SDR 8 bit 4:2:0, GOP fijo registrado, audio AAC 48 kHz estéreo; texto con tildes, una imagen PNG alfa, musica WAV y montaje de 60 s. Incluir timeline 2V+2A con transformación y titulo. Guardar hashes, duraciones, generador y expectativas de frames.

C2 límites: 50 clips y 30 fuentes en 10 min; mezcla de 24/25/30/60 fps y VFR, rotación 90 grados, video sin audio, audio mono/44.1 kHz, nombres Unicode, duración menor de 1 frame de proyecto, archivo corrupto, falso MP4, medio ausente y codec no certificado. Para cada fuente anotar resultado esperado: aceptar/normalizar/rechazar, sin asumir compatibilidad general.

C3 fallas: disco lleno, permiso revocado, pestaña cerrada, servicio reiniciado, worker terminado, petición duplicada, red UI-servicio interrumpida, manifiesto corrupto y cache en uso. Usar copias desechables, nunca material personal unico.

## Atributos medibles

### RNF-01 - Respuesta de interacción

Categoria: Rendimiento.

Meta: En corpus C1, p95 <=100 ms para selección, mover, split y undo; medir desde entrada hasta actualizacion visual confirmada, 100 acciones por tipo, cache caliente.

Metodo: Trazas del navegador; excluir decodificación del frame solo cuando el indicador pendiente sea visible.

Requisitos relacionados: RF-09 RF-12 RF-13 RF-25. Prueba: PQ-01. Estado: no ejecutada.

### RNF-02 - Seek de preview

Categoria: Rendimiento.

Meta: En C1 y proxy listo, p95 <=300 ms al presentar frame objetivo tras 100 seeks aleatorios; probar al menos 2V+2A.

Metodo: Registrar frame solicitado/presentado y timestamps; no medir solo cambio del cabezal.

Requisitos relacionados: RF-10 RF-52. Prueba: PQ-02. Estado: no ejecutada.

### RNF-03 - Reproducción sostenida

Categoria: Rendimiento.

Meta: En C1, preview 720p30 con 2V+2A durante 60 s, frames perdidos <=2% y desfase A/V <=40 ms. Para 4V+4A se admite degradacion explicita y pausa de fidelidad.

Metodo: Contador de presentaciones, impulsos/flash sincronizados y captura de referencia.

Requisitos relacionados: RF-10 RF-52. Prueba: PQ-03. Estado: no ejecutada.

### RNF-04 - Rendimiento de exportación

Categoria: Rendimiento.

Meta: Meta inicial: exportar C1 de 60 s a 1080p30 H.264 en <=180 s en H1, CPU solamente. Es objetivo por validar, no capacidad demostrada.

Metodo: Cinco ejecuciones; reportar mediana/p95, preset, bitrate, versión binaria, max RSS y temperatura.

Requisitos relacionados: RF-28 RF-29 RF-30. Prueba: PQ-04. Estado: no ejecutada.

### RNF-05 - Perdida máxima de edición

Categoria: Fiabilidad.

Meta: Con servicio y disco operativos, tras matar pestaña o proceso en 30 puntos, recuperar última revisión confirmada y perder como máximo 10 s de comandos confirmados aún no persistidos.

Metodo: Fault injection y comparacion de revision/manifest; fallas de disco se reportan sin falsa promesa.

Requisitos relacionados: RF-26 RF-27 RF-54. Prueba: PQ-05. Estado: no ejecutada.

### RNF-06 - Integridad de originales

Categoria: Integridad.

Meta: SHA-256 de los originales antes y después de la suite de edicion/exportacion coincide en el 100% de casos.

Metodo: Comparar hashes; cache y outputs deben estar en otras rutas.

Requisitos relacionados: RF-11 RF-12 RF-20 RF-21. Prueba: PQ-06. Estado: no ejecutada.

### RNF-07 - Sincronización del render

Categoria: Correctitud.

Meta: En salida de 10 min con flash y click cada 30 s, error A/V <=1 frame del proyecto (33.34 ms) y sin deriva creciente; duración video difiere <=1 frame.

Metodo: Análisis de fotogramas y muestras del archivo final; comprobar padding AAC por timestamps.

Requisitos relacionados: RF-16 RF-28 RF-30 RF-52. Prueba: PQ-07. Estado: no ejecutada.

### RNF-08 - Recuperación de almacenamiento

Categoria: Fiabilidad.

Meta: Con disco lleno, permiso revocado o medio desconectado no se publica salida parcial ni se pierde la última revisión valida.

Metodo: Inyectar tres fallas y reabrir; limpiar temporales solo cuando no estan en uso.

Requisitos relacionados: RF-26 RF-27 RF-30 RF-34. Prueba: PQ-08. Estado: no ejecutada.

### RNF-09 - Privacidad de contenido

Categoria: Privacidad.

Meta: En el flujo M1 completo no hay solicitudes a terceros ni telemetria; fuentes, medios y modelos instalados se sirven localmente.

Metodo: Capturar trafico DNS/HTTP y operar sin internet tras instalación; las copias viven en el host del servicio.

Requisitos relacionados: RF-03 RF-23 RF-37 RF-51. Prueba: PQ-09. Estado: no ejecutada.

### RNF-10 - Servicio y archivos protegidos

Categoria: Seguridad.

Meta: Rechazar origen/Host no permitido, token ausente, traversal, nombre con metacaracteres e intento de inyección; límites de archivo y recursos activos.

Metodo: Pruebas negativas de API, jobs y rutas; archivos importados se tratan como no confiables.

Requisitos relacionados: RF-04 RF-33 RF-51. Prueba: PQ-10. Estado: no ejecutada.

### RNF-11 - Teclado y sin arrastre

Categoria: Accesibilidad.

Meta: Completar importar, agregar, mover, recortar, dividir, guardar y exportar solo con teclado; repetir mover/agregar por click sin mantener pulsado.

Metodo: Prueba manual con foco visible, orden lógico y retorno de foco tras dialogo.

Requisitos relacionados: RF-03 RF-11 RF-13 RF-35. Prueba: PQ-11. Estado: no ejecutada.

### RNF-12 - Contraste y legibilidad

Categoria: Accesibilidad.

Meta: Objetivo WCAG 2.2 AA: texto normal >=4.5:1, texto grande >=3:1 y componentes/foco >=3:1; no afirmar conformidad sin auditoría completa.

Metodo: Medicion en ambos temas; texto esencial >=12 px en editor, dialogos 14-16 px; zoom 200% conserva tareas por paneles alternativos.

Requisitos relacionados: RF-36 RF-37. Prueba: PQ-12. Estado: no ejecutada.

### RNF-13 - Compatibilidad certificada

Categoria: Compatibilidad.

Meta: Pasar corpus C1/C2 en dos versiones estables de Chromium objetivo y H1; persistir la matriz exacta de SO, navegador, FFmpeg y codecs probados.

Metodo: No usar latest como versión reproducible; repetir antes de cada release.

Requisitos relacionados: RF-04 RF-38. Prueba: PQ-13. Estado: no ejecutada.

### RNF-14 - Uso de memoria

Categoria: Eficiencia.

Meta: En C1 después de 10 min, pestaña <=1.5 GiB RSS y conjunto de workers nativos <=4 GiB RSS, sin crecimiento >10% entre ciclos 2 y 5 de abrir/cerrar.

Metodo: Medicion SO por procesos, no solo heap JS; 4V+4A se caracteriza aparte.

Requisitos relacionados: RF-05 RF-34 RF-52. Prueba: PQ-14. Estado: no ejecutada.

### RNF-15 - Exportación repetible

Categoria: Correctitud.

Meta: La misma revisión y ajustes produce equivalencia temporal y visual/audio dentro de tolerancias del corpus; no se exige SHA identico por metadatos o encoder.

Metodo: Comparar frames y PCM decodificados; color objetivo SSIM >=0.98 frente a referencia certificada, excluyendo fuentes diferentes.

Requisitos relacionados: RF-21 RF-23 RF-28. Prueba: PQ-15. Estado: no ejecutada.

### RNF-16 - Mantenibilidad

Categoria: Mantenibilidad.

Meta: Motor de comandos sin dependencias del DOM; esquema y contratos versionados; invariantes temporales cubiertas por propiedades y fixtures; CI impide fixtures fallidos.

Metodo: Revisión de dependencias y suite de round-trip, split/undo, colisiones y render golden. Sin cuota arbitraria de cobertura como única evidencia.

Requisitos relacionados: RF-12 RF-25 RF-33. Prueba: PQ-16. Estado: no ejecutada.

### RNF-17 - Cancelación y reconexión

Categoria: Operabilidad.

Meta: Cancelación reconoce solicitud <=1 s y termina worker <=5 s en H1; reconectar recupera estado sin doble job ni perdida del resultado.

Metodo: Desconectar UI, cancelar trabajos y simular caida del worker; comprobar locks y temporales.

Requisitos relacionados: RF-29 RF-49. Prueba: PQ-17. Estado: no ejecutada.

### RNF-18 - Aprendizaje del flujo

Categoria: Usabilidad.

Meta: Jeancarlo completa el guion U1 con cinco clips, split, desvincular, título y exportar en <=15 min sin ayuda externa tras una orientacion de 2 min.

Metodo: Sesión observada, medir errores y retrocesos; es criterio personal de aceptacion, no estudio estadistico.

Requisitos relacionados: RF-07 RF-12 RF-16 RF-23 RF-28. Prueba: PQ-18. Estado: no ejecutada.

## Casos funcionales planificados

Cada PF tiene dos subcasos A (nominal) y B (límite). Ejecutar sobre proyecto y medios de prueba desechables. Verificar el manifiesto antes/despues, la representacion UI y, si procede, el archivo renderizado; no limitar la prueba a que el boton responda.

### PF-01 - Crear proyecto

Precondicion: servicio iniciado disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar crear proyecto y comprobar: Crear un proyecto con nombre de 1 a 80 caracteres, formato 16:9, 9:16 o 1:1 y 30 fps CFR; asignar ID estable y abrir el editor vacio.

B: provocar el caso límite: Rechazar nombre vacio o caracteres de control; un nombre repetido no reutiliza ni sobrescribe otro ID.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-02 - Biblioteca de proyectos

Precondicion: RF-01 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar biblioteca de proyectos y comprobar: Listar proyectos por última modificacion, buscar por nombre, abrir y duplicar con nuevo ID y nuevas referencias de montaje.

B: provocar el caso límite: La copia comparte medios inmutables; editar su timeline no altera el original. Si falla la apertura, conservarlo y mostrar recuperacion.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-03 - Importación multiple

Precondicion: RF-01 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar importación multiple y comprobar: Importar varios archivos por arrastre o selector, mostrar progreso individual y permitir continuar con los válidos de un lote.

B: provocar el caso límite: Cancelar una importación incompleta limpia su temporal; el resto del lote no se pierde. El arrastre tiene alternativa mediante boton.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-04 - Inspección de compatibilidad

Precondicion: RF-03 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar inspección de compatibilidad y comprobar: Inspeccionar contenedor, streams, duración, dimensiones, frecuencia, rotación y tasa variable antes de habilitar un recurso.

B: provocar el caso límite: Un archivo con extension MP4 pero contenido inválido se rechaza sin bloquear el editor; HEVC/HDR se identifica sin prometer soporte M1.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-05 - Miniaturas y formas de onda

Precondicion: RF-04 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar miniaturas y formas de onda y comprobar: Generar miniaturas y waveform como tareas cancelables y cacheadas con clave de archivo y versión de procesamiento.

B: provocar el caso límite: Si falla una miniatura, usar placeholder y conservar el recurso; una waveform pendiente no impide colocar el audio.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-06 - Organizar recursos

Precondicion: RF-03 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar organizar recursos y comprobar: Filtrar por tipo, buscar por nombre y renombrar la etiqueta de un recurso sin cambiar el nombre del archivo fuente.

B: provocar el caso límite: Eliminar un recurso utilizado exige resolver primero sus instancias o cancelar; no borrar originales externos.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-07 - Agregar a la línea de tiempo

Precondicion: RF-04, RF-08 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar agregar a la línea de tiempo y comprobar: Colocar recursos en una pista compatible con tiempo inicial numérico o arrastre; por defecto solo se aceptan zonas libres.

B: provocar el caso límite: Si hay colision en la misma pista, rechazar con indicacion y ofrecer otra pista; nunca sobrescribir silenciosamente.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-08 - Pistas multiples

Precondicion: RF-01 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar pistas multiples y comprobar: Crear, renombrar y reordenar hasta cuatro pistas visuales y cuatro pistas de audio, identificadas por texto y color.

B: provocar el caso límite: Impedir un quinto track de cada tipo en M1 con explicacion; una pista con clips no se elimina sin confirmacion explicita de alcance.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-09 - Selección y posición temporal

Precondicion: RF-07 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar selección y posición temporal y comprobar: Seleccionar uno o varios clips, mostrar su posición y duración y desplazar el cabezal por click, botones o entrada de frame.

B: provocar el caso límite: Una posición fuera del proyecto se ajusta a sus límites; seleccionar no modifica el documento ni crea historial.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-10 - Previsualización y avance por frame

Precondicion: RF-07, RF-52 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar previsualización y avance por frame y comprobar: Reproducir, pausar y avanzar o retroceder un frame del proyecto; ajustar volumen de monitor sin cambiar volumen exportado.

B: provocar el caso límite: Si no se alcanza tiempo real, bajar calidad de preview y avisar; el seek confirma frame presentado, no solo posición solicitada.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-11 - Recortar extremos

Precondicion: RF-09 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar recortar extremos y comprobar: Editar IN y OUT con asas o campos numéricos; actualizar duración sin reescribir el original ni mover clips vecinos.

B: provocar el caso límite: No admitir duración menor a un frame ni límites fuera de la fuente. El recorte de un grupo vinculado conserva sincronizacion.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-12 - Dividir clip

Precondicion: RF-09 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar dividir clip y comprobar: Dividir en un frame interior en dos clips contiguos, con rangos fuente complementarios e IDs nuevos; dividir también audio vinculado.

B: provocar el caso límite: En el primer o último límite la accion queda deshabilitada. Al deshacer vuelven el ID original, efectos y vinculos.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-13 - Mover y reordenar clips

Precondicion: RF-09 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar mover y reordenar clips y comprobar: Mover selección por tiempo exacto y pista compatible manteniendo offsets internos del grupo y audio vinculado.

B: provocar el caso límite: Una colision, tiempo negativo o pista bloqueada rechaza toda la operación; no se aplica parcialmente a la seleccion.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-14 - Eliminar y cerrar hueco

Precondicion: RF-09 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar eliminar y cerrar hueco y comprobar: Ofrecer eliminar dejando hueco y eliminar con cierre de hueco; esta última usa un intervalo y las pistas participantes desbloqueadas.

B: provocar el caso límite: Antes de cerrar hueco, mostrar pistas afectadas. Si algun clip cruza el intervalo o un vinculo quedaria desfasado, bloquear y explicar.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-15 - Duplicar clips

Precondicion: RF-09 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar duplicar clips y comprobar: Duplicar una selección con IDs nuevos y los mismos ajustes; conservar offsets y vinculos internos del grupo duplicado.

B: provocar el caso límite: Exigir una posición libre; no copiar un vinculo hacia la instancia original ni duplicar los bytes del medio.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-16 - Vincular y desvincular audio

Precondicion: RF-07, RF-08 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar vincular y desvincular audio y comprobar: Desvincular un par video/audio para moverlo por separado sin duplicar sonido; permitir volver a vincular una selección compatible.

B: provocar el caso límite: Solo aceptar pares con el mismo asset, rango fuente y alineacion temporal; otros casos muestran por que no pueden vincularse en M1.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-17 - Extraer audio a archivo

Precondicion: RF-04, RF-30 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar extraer audio a archivo y comprobar: Exportar el stream de audio del rango fuente seleccionado a WAV PCM 48 kHz, sin modificar ni silenciar automaticamente el video.

B: provocar el caso límite: Si la fuente no contiene audio se deshabilita. Esta operación genera un archivo, a diferencia de desvincular pistas.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-18 - Ganancia y silencio

Precondicion: RF-07 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar ganancia y silencio y comprobar: Ajustar ganancia por clip entre -60 y +12 dB, silenciar clips y mostrar picos estimados de la mezcla.

B: provocar el caso límite: El silencio no elimina el medio; avisar de picos superiores a 0 dBFS. La mezcla exportada se limita a -1 dBTP mediante política documentada.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-19 - Fundidos de audio

Precondicion: RF-18 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar fundidos de audio y comprobar: Configurar fade-in y fade-out lineales de ganancia por duración, en segundos mostrados y frames del proyecto almacenados.

B: provocar el caso límite: La suma de fundidos no excede la duración del clip; valores inválidos se rechazan sin aplicación parcial.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-20 - Transformación visual

Precondicion: RF-07 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar transformación visual y comprobar: Ajustar posición, escala, rotación y opacidad; ofrecer ajustar y rellenar conservando aspecto; usar coordenadas del lienzo.

B: provocar el caso límite: Restablecer vuelve a valores por defecto. El modo rellenar informa visualmente del recorte; validar valores finitos y límites de escala.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-21 - Corrección visual básica

Precondicion: RF-20 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar corrección visual básica y comprobar: Ajustar brillo, contraste y saturacion con rangos definidos en la especificación de diseño; previsualizar, desactivar y restablecer.

B: provocar el caso límite: Aplicar el mismo orden de efectos en preview y render. No presentar los controles básicos como corrección HDR o gestión de color profesional.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-22 - Fundidos de video

Precondicion: RF-20 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar fundidos de video y comprobar: Configurar entrada y salida mediante opacidad sobre la composición inferior; en V1 sin fondo se desvanece a negro.

B: provocar el caso límite: La suma de fades no supera la duracion. Es un efecto del clip; no es todavia una transicion automática entre dos clips.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-23 - Títulos y textos

Precondicion: RF-08, RF-20 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar títulos y textos y comprobar: Crear títulos de hasta 500 caracteres, con fuente, tamaño, peso, color, alineacion, posición y duración; permitir tildes y saltos de linea.

B: provocar el caso límite: Tratar el contenido como texto, nunca HTML; advertir desbordamiento del lienzo. Fuentes de proyecto incluidas en el render, sin descarga externa.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-24 - Imagenes y superposiciones

Precondicion: RF-04, RF-20 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar imagenes y superposiciones y comprobar: Usar PNG/JPEG como clips visuales de duración elegida y respetar el canal alfa de PNG; permitir superponer sobre video.

B: provocar el caso límite: Corregir orientacion de imagen; si se elimina una pista superior, la inferior permanece intacta.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-25 - Deshacer y rehacer

Precondicion: RF-01 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar deshacer y rehacer y comprobar: Mantener al menos 100 comandos de edición en la sesión; cada gesto o cambio confirmado es una única transaccion deshacible.

B: provocar el caso límite: Una nueva edición tras undo inválida la rama redo. Guardar y navegar no crean comandos; reabrir no promete restaurar todo el historial de sesion.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-26 - Guardado automático y manual

Precondicion: RF-01 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar guardado automático y manual y comprobar: Guardar cambios confirmados tras 2 s de inactividad y como máximo cada 10 s durante edición continua; mostrar revisión guardada solo tras confirmacion durable.

B: provocar el caso límite: Si falla disco o permiso, mantener estado sin guardar visible y permitir descargar el manifiesto; nunca mostrar Guardado ante un error.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-27 - Recuperar trabajo

Precondicion: RF-26 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar recuperar trabajo y comprobar: Tras un cierre inesperado, ofrecer última revisión durable y copia previa válida, mostrando fecha y diferencias de revision.

B: provocar el caso límite: Un JSON corrupto no reemplaza una copia válida; abrir en recuperación de solo lectura si no existe una revisión consistente.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-28 - Configurar exportación

Precondicion: RF-07 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar configurar exportación y comprobar: Elegir preset MP4 H.264/AAC, 1080p o 720p, 30 fps y relación del proyecto; mostrar duración, resolucion y ruta destino.

B: provocar el caso límite: El preflight bloquea recursos ausentes, disco insuficiente o proyecto vacio. Estimación de tamaño se etiqueta como aproximada.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-29 - Progreso y cancelación de render

Precondicion: RF-28 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar progreso y cancelación de render y comprobar: Mostrar cola y estados pendiente, procesando, cancelando, cancelado, fallido o completado; cancelar termina el proceso y libera temporales.

B: provocar el caso límite: Una desconexión de la interfaz no cancela el trabajo. Al reabrir se consulta el estado del servicio; no inventar porcentaje mientras falta duracion.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-30 - Validar y descargar resultado

Precondicion: RF-29 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar validar y descargar resultado y comprobar: Publicar como completado solo después de salida cero, archivo final movido atomicamente e inspección de streams y duración; permitir abrir carpeta o descargar.

B: provocar el caso límite: Un archivo parcial nunca se ofrece como final. Si el nombre ya existe, proponer sufijo o confirmacion explicita para reemplazar.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-31 - Relocalizar medios ausentes

Precondicion: RF-04 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar relocalizar medios ausentes y comprobar: Resolver referencias ausentes mediante selector; comparar identidad, duración y streams, y mostrar las instancias afectadas.

B: provocar el caso límite: No sustituir silenciosamente por un homonimo. Aceptar un archivo diferente requiere accion explicita y revalidar rangos de todos sus clips.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-32 - Exportar manifiesto de proyecto

Precondicion: RF-26 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar exportar manifiesto de proyecto y comprobar: Descargar un archivo .jencut.json versionado con montaje, fuentes referenciadas, ajustes y revisión; explicar que no contiene los videos.

B: provocar el caso límite: La exportación del manifiesto no se anuncia como copia completa de medios; no incluir rutas externas sensibles innecesarias ni tokens.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-33 - Importar manifiesto

Precondicion: RF-32 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar importar manifiesto y comprobar: Validar esquema y versión antes de crear un proyecto nuevo; abrir referencias no resueltas en el asistente de relocalizacion.

B: provocar el caso límite: Versión futura o estructura inválida se rechaza sin alterar otros proyectos; rutas recibidas no permiten leer archivos arbitrarios del host.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-34 - Gestión de almacenamiento

Precondicion: RF-05 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar gestión de almacenamiento y comprobar: Mostrar uso de originales administrados, proxies, cache y renders; limpiar solo derivados regenerables seleccionados.

B: provocar el caso límite: Una limpieza no borra medios originales ni renders finales. Una tarea que usa cache obtiene lease y evita su eliminacion mientras trabaja.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-35 - Atajos y alternativas al arrastre

Precondicion: RF-09 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar atajos y alternativas al arrastre y comprobar: Proporcionar atajos documentados y campos o menus para agregar, mover, recortar y reordenar sin arrastrar.

B: provocar el caso límite: No capturar atajos de edición al escribir en un campo; una alternativa de click permite seleccionar objeto y destino, además del teclado.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-36 - Preferencias visuales

Precondicion: RF-01 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar preferencias visuales y comprobar: Cambiar tema oscuro/claro, escala de interfaz y movimiento reducido sin cambiar la composición exportada.

B: provocar el caso límite: Reabrir conserva preferencias. Las animaciones de Jeni se desactivan al solicitar movimiento reducido; no bloquear tareas por un asset faltante.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-37 - Mensajes y estados de Jeni

Precondicion: RF-29 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar mensajes y estados de jeni y comprobar: Usar mensajes con accion recuperable en bienvenida, exportación, exito y revisión; Jeni es decorativa y prescindible.

B: provocar el caso límite: El error siempre tiene texto y no depende de expresion o color. Un timeout no se interpreta como exito; se ofrece consultar estado y reintentar cuando proceda.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-38 - Diagnóstico y perfil compatible

Precondicion: RF-04 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar diagnóstico y perfil compatible y comprobar: Comprobar servicio, espacio libre, soporte real de codecs y reproducción de un clip de prueba; registrar navegador y capacidades detectadas.

B: provocar el caso límite: El diagnóstico identifica una capacidad no probada como tal; no asume que un formato funciona solo por su extension.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-39 - Bloqueo y visibilidad de pistas

Precondicion: RF-08 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar bloqueo y visibilidad de pistas y comprobar: Bloquear ediciones por pista, ocultar pistas visuales y silenciar o aislar audio; reflejar estos estados también en exportacion.

B: provocar el caso límite: Una operación grupal con elementos bloqueados se rechaza como conjunto; al salir de solo se restaura la mezcla previa sin sobrescribir mutes.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-40 - Zoom y ajuste magnetico

Precondicion: RF-09 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar zoom y ajuste magnetico y comprobar: Cambiar zoom y desplazamiento del timeline y activar snapping de 6 px a bordes y cabezal, sin cambiar posiciones guardadas.

B: provocar el caso límite: La tolerancia se calcula en pantalla y se convierte a frames según zoom; puede desactivarse temporalmente y existe entrada numérica exacta.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-41 - Marcadores y rangos de exportación

Precondicion: RF-28 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar marcadores y rangos de exportación y comprobar: Crear marcadores nombrados y exportar un rango IN/OUT de la secuencia con duración mayor a cero.

B: provocar el caso límite: Fuera del rango no se renderiza contenido; un marcador no corta clips ni altera sincronizacion.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M2. Estado: no ejecutada.

### PF-42 - Velocidad de clip

Precondicion: RF-20 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar velocidad de clip y comprobar: Cambiar velocidad entre 0.25x y 4x con estrategia explicita de audio y conservación de tono; recalcular duración y limites.

B: provocar el caso límite: Un cambio que cause colision requiere resolverla; deshacer restaura rangos, vinculos y duracion.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M2. Estado: no ejecutada.

### PF-43 - Transicion entre clips

Precondicion: RF-22 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar transicion entre clips y comprobar: Crear disolucion entre clips con duración y material disponible claramente visibles; preview y render comparten el calculo temporal.

B: provocar el caso límite: Sin handles suficientes se limita la transicion y se explica; no alargar artificialmente la fuente ni modificar duración sin mostrarlo.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M2. Estado: no ejecutada.

### PF-44 - Animacion por keyframes

Precondicion: RF-20 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar animacion por keyframes y comprobar: Animar posición, escala, rotación y opacidad con keyframes e interpolacion lineal y hold.

B: provocar el caso límite: Definir propiedad del tiempo local al clip; al dividir se preserva continuidad evaluando un keyframe de frontera.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M2. Estado: no ejecutada.

### PF-45 - Subtitulos manuales y SRT

Precondicion: RF-23 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar subtitulos manuales y srt y comprobar: Importar, editar y exportar SRT UTF-8; permitir quemar subtitulos en video y exportar archivo separado.

B: provocar el caso límite: Detectar timestamps inválidos y superposiciones; un SRT no se ejecuta como HTML ni contiene formato activo.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M2. Estado: no ejecutada.

### PF-46 - Subtitulos automáticos

Precondicion: RF-45 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar subtitulos automáticos y comprobar: Transcribir con un modelo local opcional y permitir revisar tiempos y texto antes de publicar subtitulos.

B: provocar el caso límite: No enviar audio a terceros por defecto; falta de modelo o recursos no bloquea edición y se informa del estado real.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M3. Estado: no ejecutada.

### PF-47 - Exportación avanzada 4K y fps

Precondicion: RF-28 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar exportación avanzada 4k y fps y comprobar: Habilitar perfiles 4K y 24/25/29.97/50/59.94/60 fps solo tras superar su matriz de compatibilidad y benchmarks.

B: provocar el caso límite: No convertir de forma implicita un proyecto M1; duplicar secuencia y advertir del cambio de base temporal.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M2. Estado: no ejecutada.

### PF-48 - Proyecto portatil con medios

Precondicion: RF-32 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar proyecto portatil con medios y comprobar: Empaquetar manifiesto y medios seleccionados en un archivo portable transmitido por streaming, con inventario e integridad.

B: provocar el caso límite: Verificar espacio, cancelación y ZIP traversal al importar; un respaldo incompleto queda identificado y no se anuncia como completo.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M2. Estado: no ejecutada.

### PF-49 - Reintentar una tarea

Precondicion: RF-29 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar reintentar una tarea y comprobar: Permitir reintento solo tras estado terminal, creando nuevo job con la misma revisión y ajustes o eligiendo explicitamente la revisión actual.

B: provocar el caso límite: Antes de reintentar, repetir preflight. Nunca ejecutar dos renders por doble click de la misma solicitud idempotente.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-50 - Eliminar proyecto con alcance claro

Precondicion: RF-02 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar eliminar proyecto con alcance claro y comprobar: Mostrar nombre y que datos se borraran; enviar a papelera de 7 dias, recuperable y con control de espacio.

B: provocar el caso límite: Medios compartidos se conservan mientras exista una referencia; originales externos nunca se eliminan. Vaciado exige confirmacion y no afecta proyectos activos.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-51 - Configuración del espacio de trabajo

Precondicion: RF-01 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar configuración del espacio de trabajo y comprobar: Elegir un directorio administrado del servicio y mostrar su ubicación; exigir acceso de lectura/escritura y espacio suficiente.

B: provocar el caso límite: No aceptar rutas de red o montajes desconectados como fiables sin diagnóstico; una ruta recibida por API se resuelve dentro de raices autorizadas.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-52 - Proxies y normalización de entrada

Precondicion: RF-04 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar proxies y normalización de entrada y comprobar: Generar un proxy CFR de hasta 720p para preview y conservar original; mapear cada frame del proyecto al tiempo de presentacion fuente.

B: provocar el caso límite: Una fuente VFR se normaliza con política repeticion/descarte documentada; el render usa original o intermedio de calidad, nunca el proxy 720p como maestro.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

### PF-53 - Efectos avanzados y seguimiento

Precondicion: RF-21, RF-43 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar efectos avanzados y seguimiento y comprobar: Investigar chroma key, tracking, estabilizacion y denoise como capacidades independientes con sus propios criterios y benchmark.

B: provocar el caso límite: Esta fila reserva la épica; antes de implementarla se descompone en requisitos verificables y no cuenta como alcance M1 listo.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M3. Estado: no ejecutada.

### PF-54 - Estado de guardado y conflictos

Precondicion: RF-26 disponible en un proyecto de prueba; medios del corpus correspondiente, revisión inicial registrada.

A: ejecutar estado de guardado y conflictos y comprobar: Usar revisión esperada en cada guardado y una sola sesión editora por proyecto; una segunda pestana abre en solo lectura.

B: provocar el caso límite: Si hay conflicto, no aplicar último escritor silenciosamente; ofrecer recargar o duplicar la revisión local no guardada.

Evidencia: revision/manifest antes y después, captura relevante y log o media de salida cuando corresponda. Resultado esperado: criterio satisfecho y sin alteracion de originales. Entrega de ejecución: M1. Estado: no ejecutada.

## Pruebas adicionales de invariantes

- PI-01: split y undo restauran manifiesto normalizado del clip original; split preserva union de rangos y duración total.
- PI-02: mover un grupo con un elemento bloqueado no cambia ninguno de los elementos.
- PI-03: guardar -> cargar -> guardar conserva equivalencia semántica, aunque varie el orden serializado de claves.
- PI-04: 10 min de VFR, audio 44.1 kHz y AAC no generan deriva creciente tras normalizacion.
- PI-05: exportar revisión r mientras se edita r+1 produce r y muestra el número correcto en el resultado.
- PI-06: cancelar durante verificando nunca publica un archivo parcial; definir atomicamente el punto de publicación y carrera entre cancelacion/finalizacion.
- PI-07: doble click y reenvio tras timeout producen un solo job para la misma clave idempotente.
- PI-08: último original compartido no se elimina mientras una referencia de un proyecto o papelera siga viva.
- PI-09: path traversal, URL externa de archivo y caracteres de shell se rechazan o tratan como texto en todas las entradas.
- PI-10: la limpieza de cache respeta leases y regenera derivados sin modificar el montaje.

## Guion U1 - aceptacion del usuario

Crear proyecto vertical; importar cinco clips, una imagen y musica; montar clips; dividir el segundo; recortar el primero; desvincular voz y moverla; agregar musica a -12 dB con fundido; poner título; ajustar saturacion; deshacer y rehacer; cerrar/reabrir; exportar; comprobar resultado. Registrar duración, dudas, errores y si se necesito asistencia.

## Estrategia de verificación

Unitarias y propiedades para tiempo/commands; integracion para guardado, API y jobs; golden media para render; E2E para flujos esenciales; pruebas manuales de teclado, foco, contraste y uso personal. Las pruebas de rendimiento y seguridad se ejecutan separadas de la captura de prototipo. Todo resultado se asocia a build, hardware y corpus.

Condicion de release: todos los Must y RNF bloqueantes pasan en la matriz certificada, ningun defecto crítico o alto abierto que comprometa trabajo/medios/exportacion, recuperación probada y guion U1 aprobado. Un mockup no cuenta como evidencia de ninguna de estas pruebas.
