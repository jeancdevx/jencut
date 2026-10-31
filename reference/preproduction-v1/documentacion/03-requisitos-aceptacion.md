# Requisitos funcionales y aceptacion

Todos estan especificados, no implementados. Must=M1, Should=M2 y Could=M3. Las dependencias se refieren a capacidad de producto, no implican que cada requisito deba producir un módulo separado. RF-53 es una épica exploratoria y requiere desglose posterior.

## RF-01 - Crear proyecto

Entrega: M1 / Must. Objetivo: OBJ-01. Flujo: FL-01. Pantalla de referencia: UI-02.

Como usuario quiero crear proyecto para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Crear un proyecto con nombre de 1 a 80 caracteres, formato 16:9, 9:16 o 1:1 y 30 fps CFR; asignar ID estable y abrir el editor vacio.

Caso límite o error: Rechazar nombre vacio o caracteres de control; un nombre repetido no reutiliza ni sobrescribe otro ID.

Reglas: RN-01, RN-02. Dependencias: ninguna. Verificación: PF-01; incluir escenario nominal y caso límite anterior.

## RF-02 - Biblioteca de proyectos

Entrega: M1 / Must. Objetivo: OBJ-03. Flujo: FL-01. Pantalla de referencia: UI-01.

Como usuario quiero biblioteca de proyectos para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Listar proyectos por última modificacion, buscar por nombre, abrir y duplicar con nuevo ID y nuevas referencias de montaje.

Caso límite o error: La copia comparte medios inmutables; editar su timeline no altera el original. Si falla la apertura, conservarlo y mostrar recuperacion.

Reglas: RN-16. Dependencias: RF-01. Verificación: PF-02; incluir escenario nominal y caso límite anterior.

## RF-03 - Importación multiple

Entrega: M1 / Must. Objetivo: OBJ-01. Flujo: FL-02. Pantalla de referencia: UI-03.

Como usuario quiero importación multiple para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Importar varios archivos por arrastre o selector, mostrar progreso individual y permitir continuar con los válidos de un lote.

Caso límite o error: Cancelar una importación incompleta limpia su temporal; el resto del lote no se pierde. El arrastre tiene alternativa mediante boton.

Reglas: RN-03, RN-04. Dependencias: RF-01. Verificación: PF-03; incluir escenario nominal y caso límite anterior.

## RF-04 - Inspección de compatibilidad

Entrega: M1 / Must. Objetivo: OBJ-05. Flujo: FL-02. Pantalla de referencia: UI-03.

Como usuario quiero inspección de compatibilidad para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Inspeccionar contenedor, streams, duración, dimensiones, frecuencia, rotación y tasa variable antes de habilitar un recurso.

Caso límite o error: Un archivo con extension MP4 pero contenido inválido se rechaza sin bloquear el editor; HEVC/HDR se identifica sin prometer soporte M1.

Reglas: RN-03, RN-05. Dependencias: RF-03. Verificación: PF-04; incluir escenario nominal y caso límite anterior.

## RF-05 - Miniaturas y formas de onda

Entrega: M1 / Must. Objetivo: OBJ-01. Flujo: FL-02. Pantalla de referencia: UI-04.

Como usuario quiero miniaturas y formas de onda para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Generar miniaturas y waveform como tareas cancelables y cacheadas con clave de archivo y versión de procesamiento.

Caso límite o error: Si falla una miniatura, usar placeholder y conservar el recurso; una waveform pendiente no impide colocar el audio.

Reglas: RN-04, RN-19. Dependencias: RF-04. Verificación: PF-05; incluir escenario nominal y caso límite anterior.

## RF-06 - Organizar recursos

Entrega: M1 / Must. Objetivo: OBJ-01. Flujo: FL-02. Pantalla de referencia: UI-04.

Como usuario quiero organizar recursos para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Filtrar por tipo, buscar por nombre y renombrar la etiqueta de un recurso sin cambiar el nombre del archivo fuente.

Caso límite o error: Eliminar un recurso utilizado exige resolver primero sus instancias o cancelar; no borrar originales externos.

Reglas: RN-04. Dependencias: RF-03. Verificación: PF-06; incluir escenario nominal y caso límite anterior.

## RF-07 - Agregar a la línea de tiempo

Entrega: M1 / Must. Objetivo: OBJ-01. Flujo: FL-03. Pantalla de referencia: UI-04.

Como usuario quiero agregar a la línea de tiempo para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Colocar recursos en una pista compatible con tiempo inicial numérico o arrastre; por defecto solo se aceptan zonas libres.

Caso límite o error: Si hay colision en la misma pista, rechazar con indicacion y ofrecer otra pista; nunca sobrescribir silenciosamente.

Reglas: RN-06, RN-07. Dependencias: RF-04, RF-08. Verificación: PF-07; incluir escenario nominal y caso límite anterior.

## RF-08 - Pistas multiples

Entrega: M1 / Must. Objetivo: OBJ-01. Flujo: FL-03. Pantalla de referencia: UI-04.

Como usuario quiero pistas multiples para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Crear, renombrar y reordenar hasta cuatro pistas visuales y cuatro pistas de audio, identificadas por texto y color.

Caso límite o error: Impedir un quinto track de cada tipo en M1 con explicacion; una pista con clips no se elimina sin confirmacion explicita de alcance.

Reglas: RN-06, RN-08. Dependencias: RF-01. Verificación: PF-08; incluir escenario nominal y caso límite anterior.

## RF-09 - Selección y posición temporal

Entrega: M1 / Must. Objetivo: OBJ-01. Flujo: FL-03. Pantalla de referencia: UI-04.

Como usuario quiero selección y posición temporal para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Seleccionar uno o varios clips, mostrar su posición y duración y desplazar el cabezal por click, botones o entrada de frame.

Caso límite o error: Una posición fuera del proyecto se ajusta a sus límites; seleccionar no modifica el documento ni crea historial.

Reglas: RN-02, RN-09. Dependencias: RF-07. Verificación: PF-09; incluir escenario nominal y caso límite anterior.

## RF-10 - Previsualización y avance por frame

Entrega: M1 / Must. Objetivo: OBJ-01. Flujo: FL-03. Pantalla de referencia: UI-04.

Como usuario quiero previsualización y avance por frame para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Reproducir, pausar y avanzar o retroceder un frame del proyecto; ajustar volumen de monitor sin cambiar volumen exportado.

Caso límite o error: Si no se alcanza tiempo real, bajar calidad de preview y avisar; el seek confirma frame presentado, no solo posición solicitada.

Reglas: RN-02, RN-10. Dependencias: RF-07, RF-52. Verificación: PF-10; incluir escenario nominal y caso límite anterior.

## RF-11 - Recortar extremos

Entrega: M1 / Must. Objetivo: OBJ-01. Flujo: FL-03. Pantalla de referencia: UI-05.

Como usuario quiero recortar extremos para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Editar IN y OUT con asas o campos numéricos; actualizar duración sin reescribir el original ni mover clips vecinos.

Caso límite o error: No admitir duración menor a un frame ni límites fuera de la fuente. El recorte de un grupo vinculado conserva sincronizacion.

Reglas: RN-02, RN-07, RN-09. Dependencias: RF-09. Verificación: PF-11; incluir escenario nominal y caso límite anterior.

## RF-12 - Dividir clip

Entrega: M1 / Must. Objetivo: OBJ-01. Flujo: FL-03. Pantalla de referencia: UI-05.

Como usuario quiero dividir clip para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Dividir en un frame interior en dos clips contiguos, con rangos fuente complementarios e IDs nuevos; dividir también audio vinculado.

Caso límite o error: En el primer o último límite la accion queda deshabilitada. Al deshacer vuelven el ID original, efectos y vinculos.

Reglas: RN-09, RN-11. Dependencias: RF-09. Verificación: PF-12; incluir escenario nominal y caso límite anterior.

## RF-13 - Mover y reordenar clips

Entrega: M1 / Must. Objetivo: OBJ-01. Flujo: FL-03. Pantalla de referencia: UI-05.

Como usuario quiero mover y reordenar clips para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Mover selección por tiempo exacto y pista compatible manteniendo offsets internos del grupo y audio vinculado.

Caso límite o error: Una colision, tiempo negativo o pista bloqueada rechaza toda la operación; no se aplica parcialmente a la seleccion.

Reglas: RN-06, RN-07, RN-11. Dependencias: RF-09. Verificación: PF-13; incluir escenario nominal y caso límite anterior.

## RF-14 - Eliminar y cerrar hueco

Entrega: M1 / Must. Objetivo: OBJ-01. Flujo: FL-03. Pantalla de referencia: UI-05.

Como usuario quiero eliminar y cerrar hueco para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Ofrecer eliminar dejando hueco y eliminar con cierre de hueco; esta última usa un intervalo y las pistas participantes desbloqueadas.

Caso límite o error: Antes de cerrar hueco, mostrar pistas afectadas. Si algun clip cruza el intervalo o un vinculo quedaria desfasado, bloquear y explicar.

Reglas: RN-07, RN-12. Dependencias: RF-09. Verificación: PF-14; incluir escenario nominal y caso límite anterior.

## RF-15 - Duplicar clips

Entrega: M1 / Must. Objetivo: OBJ-01. Flujo: FL-03. Pantalla de referencia: UI-05.

Como usuario quiero duplicar clips para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Duplicar una selección con IDs nuevos y los mismos ajustes; conservar offsets y vinculos internos del grupo duplicado.

Caso límite o error: Exigir una posición libre; no copiar un vinculo hacia la instancia original ni duplicar los bytes del medio.

Reglas: RN-04, RN-07. Dependencias: RF-09. Verificación: PF-15; incluir escenario nominal y caso límite anterior.

## RF-16 - Vincular y desvincular audio

Entrega: M1 / Must. Objetivo: OBJ-02. Flujo: FL-04. Pantalla de referencia: UI-06.

Como usuario quiero vincular y desvincular audio para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Desvincular un par video/audio para moverlo por separado sin duplicar sonido; permitir volver a vincular una selección compatible.

Caso límite o error: Solo aceptar pares con el mismo asset, rango fuente y alineacion temporal; otros casos muestran por que no pueden vincularse en M1.

Reglas: RN-11, RN-13. Dependencias: RF-07, RF-08. Verificación: PF-16; incluir escenario nominal y caso límite anterior.

## RF-17 - Extraer audio a archivo

Entrega: M1 / Must. Objetivo: OBJ-02. Flujo: FL-04. Pantalla de referencia: UI-06.

Como usuario quiero extraer audio a archivo para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Exportar el stream de audio del rango fuente seleccionado a WAV PCM 48 kHz, sin modificar ni silenciar automaticamente el video.

Caso límite o error: Si la fuente no contiene audio se deshabilita. Esta operación genera un archivo, a diferencia de desvincular pistas.

Reglas: RN-13, RN-17. Dependencias: RF-04, RF-30. Verificación: PF-17; incluir escenario nominal y caso límite anterior.

## RF-18 - Ganancia y silencio

Entrega: M1 / Must. Objetivo: OBJ-02. Flujo: FL-04. Pantalla de referencia: UI-06.

Como usuario quiero ganancia y silencio para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Ajustar ganancia por clip entre -60 y +12 dB, silenciar clips y mostrar picos estimados de la mezcla.

Caso límite o error: El silencio no elimina el medio; avisar de picos superiores a 0 dBFS. La mezcla exportada se limita a -1 dBTP mediante política documentada.

Reglas: RN-13. Dependencias: RF-07. Verificación: PF-18; incluir escenario nominal y caso límite anterior.

## RF-19 - Fundidos de audio

Entrega: M1 / Must. Objetivo: OBJ-02. Flujo: FL-04. Pantalla de referencia: UI-06.

Como usuario quiero fundidos de audio para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Configurar fade-in y fade-out lineales de ganancia por duración, en segundos mostrados y frames del proyecto almacenados.

Caso límite o error: La suma de fundidos no excede la duración del clip; valores inválidos se rechazan sin aplicación parcial.

Reglas: RN-13. Dependencias: RF-18. Verificación: PF-19; incluir escenario nominal y caso límite anterior.

## RF-20 - Transformación visual

Entrega: M1 / Must. Objetivo: OBJ-02. Flujo: FL-05. Pantalla de referencia: UI-07.

Como usuario quiero transformación visual para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Ajustar posición, escala, rotación y opacidad; ofrecer ajustar y rellenar conservando aspecto; usar coordenadas del lienzo.

Caso límite o error: Restablecer vuelve a valores por defecto. El modo rellenar informa visualmente del recorte; validar valores finitos y límites de escala.

Reglas: RN-08, RN-14. Dependencias: RF-07. Verificación: PF-20; incluir escenario nominal y caso límite anterior.

## RF-21 - Corrección visual básica

Entrega: M1 / Must. Objetivo: OBJ-02. Flujo: FL-05. Pantalla de referencia: UI-07.

Como usuario quiero corrección visual básica para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Ajustar brillo, contraste y saturacion con rangos definidos en la especificación de diseño; previsualizar, desactivar y restablecer.

Caso límite o error: Aplicar el mismo orden de efectos en preview y render. No presentar los controles básicos como corrección HDR o gestión de color profesional.

Reglas: RN-14. Dependencias: RF-20. Verificación: PF-21; incluir escenario nominal y caso límite anterior.

## RF-22 - Fundidos de video

Entrega: M1 / Must. Objetivo: OBJ-02. Flujo: FL-05. Pantalla de referencia: UI-07.

Como usuario quiero fundidos de video para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Configurar entrada y salida mediante opacidad sobre la composición inferior; en V1 sin fondo se desvanece a negro.

Caso límite o error: La suma de fades no supera la duracion. Es un efecto del clip; no es todavia una transicion automática entre dos clips.

Reglas: RN-14. Dependencias: RF-20. Verificación: PF-22; incluir escenario nominal y caso límite anterior.

## RF-23 - Títulos y textos

Entrega: M1 / Must. Objetivo: OBJ-02. Flujo: FL-05. Pantalla de referencia: UI-07.

Como usuario quiero títulos y textos para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Crear títulos de hasta 500 caracteres, con fuente, tamaño, peso, color, alineacion, posición y duración; permitir tildes y saltos de linea.

Caso límite o error: Tratar el contenido como texto, nunca HTML; advertir desbordamiento del lienzo. Fuentes de proyecto incluidas en el render, sin descarga externa.

Reglas: RN-08, RN-14. Dependencias: RF-08, RF-20. Verificación: PF-23; incluir escenario nominal y caso límite anterior.

## RF-24 - Imagenes y superposiciones

Entrega: M1 / Must. Objetivo: OBJ-02. Flujo: FL-05. Pantalla de referencia: UI-07.

Como usuario quiero imagenes y superposiciones para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Usar PNG/JPEG como clips visuales de duración elegida y respetar el canal alfa de PNG; permitir superponer sobre video.

Caso límite o error: Corregir orientacion de imagen; si se elimina una pista superior, la inferior permanece intacta.

Reglas: RN-03, RN-08. Dependencias: RF-04, RF-20. Verificación: PF-24; incluir escenario nominal y caso límite anterior.

## RF-25 - Deshacer y rehacer

Entrega: M1 / Must. Objetivo: OBJ-03. Flujo: FL-03. Pantalla de referencia: UI-05.

Como usuario quiero deshacer y rehacer para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Mantener al menos 100 comandos de edición en la sesión; cada gesto o cambio confirmado es una única transaccion deshacible.

Caso límite o error: Una nueva edición tras undo inválida la rama redo. Guardar y navegar no crean comandos; reabrir no promete restaurar todo el historial de sesion.

Reglas: RN-15. Dependencias: RF-01. Verificación: PF-25; incluir escenario nominal y caso límite anterior.

## RF-26 - Guardado automático y manual

Entrega: M1 / Must. Objetivo: OBJ-03. Flujo: FL-06. Pantalla de referencia: UI-04.

Como usuario quiero guardado automático y manual para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Guardar cambios confirmados tras 2 s de inactividad y como máximo cada 10 s durante edición continua; mostrar revisión guardada solo tras confirmacion durable.

Caso límite o error: Si falla disco o permiso, mantener estado sin guardar visible y permitir descargar el manifiesto; nunca mostrar Guardado ante un error.

Reglas: RN-15, RN-16. Dependencias: RF-01. Verificación: PF-26; incluir escenario nominal y caso límite anterior.

## RF-27 - Recuperar trabajo

Entrega: M1 / Must. Objetivo: OBJ-03. Flujo: FL-06. Pantalla de referencia: UI-10.

Como usuario quiero recuperar trabajo para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Tras un cierre inesperado, ofrecer última revisión durable y copia previa válida, mostrando fecha y diferencias de revision.

Caso límite o error: Un JSON corrupto no reemplaza una copia válida; abrir en recuperación de solo lectura si no existe una revisión consistente.

Reglas: RN-16. Dependencias: RF-26. Verificación: PF-27; incluir escenario nominal y caso límite anterior.

## RF-28 - Configurar exportación

Entrega: M1 / Must. Objetivo: OBJ-04. Flujo: FL-07. Pantalla de referencia: UI-08.

Como usuario quiero configurar exportación para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Elegir preset MP4 H.264/AAC, 1080p o 720p, 30 fps y relación del proyecto; mostrar duración, resolucion y ruta destino.

Caso límite o error: El preflight bloquea recursos ausentes, disco insuficiente o proyecto vacio. Estimación de tamaño se etiqueta como aproximada.

Reglas: RN-02, RN-17. Dependencias: RF-07. Verificación: PF-28; incluir escenario nominal y caso límite anterior.

## RF-29 - Progreso y cancelación de render

Entrega: M1 / Must. Objetivo: OBJ-04. Flujo: FL-07. Pantalla de referencia: UI-09.

Como usuario quiero progreso y cancelación de render para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Mostrar cola y estados pendiente, procesando, cancelando, cancelado, fallido o completado; cancelar termina el proceso y libera temporales.

Caso límite o error: Una desconexión de la interfaz no cancela el trabajo. Al reabrir se consulta el estado del servicio; no inventar porcentaje mientras falta duracion.

Reglas: RN-17, RN-18. Dependencias: RF-28. Verificación: PF-29; incluir escenario nominal y caso límite anterior.

## RF-30 - Validar y descargar resultado

Entrega: M1 / Must. Objetivo: OBJ-04. Flujo: FL-07. Pantalla de referencia: UI-09.

Como usuario quiero validar y descargar resultado para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Publicar como completado solo después de salida cero, archivo final movido atomicamente e inspección de streams y duración; permitir abrir carpeta o descargar.

Caso límite o error: Un archivo parcial nunca se ofrece como final. Si el nombre ya existe, proponer sufijo o confirmacion explicita para reemplazar.

Reglas: RN-17. Dependencias: RF-29. Verificación: PF-30; incluir escenario nominal y caso límite anterior.

## RF-31 - Relocalizar medios ausentes

Entrega: M1 / Must. Objetivo: OBJ-03. Flujo: FL-08. Pantalla de referencia: UI-10.

Como usuario quiero relocalizar medios ausentes para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Resolver referencias ausentes mediante selector; comparar identidad, duración y streams, y mostrar las instancias afectadas.

Caso límite o error: No sustituir silenciosamente por un homonimo. Aceptar un archivo diferente requiere accion explicita y revalidar rangos de todos sus clips.

Reglas: RN-04, RN-16. Dependencias: RF-04. Verificación: PF-31; incluir escenario nominal y caso límite anterior.

## RF-32 - Exportar manifiesto de proyecto

Entrega: M1 / Must. Objetivo: OBJ-03. Flujo: FL-06. Pantalla de referencia: UI-10.

Como usuario quiero exportar manifiesto de proyecto para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Descargar un archivo .jencut.json versionado con montaje, fuentes referenciadas, ajustes y revisión; explicar que no contiene los videos.

Caso límite o error: La exportación del manifiesto no se anuncia como copia completa de medios; no incluir rutas externas sensibles innecesarias ni tokens.

Reglas: RN-04, RN-16. Dependencias: RF-26. Verificación: PF-32; incluir escenario nominal y caso límite anterior.

## RF-33 - Importar manifiesto

Entrega: M1 / Must. Objetivo: OBJ-03. Flujo: FL-08. Pantalla de referencia: UI-10.

Como usuario quiero importar manifiesto para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Validar esquema y versión antes de crear un proyecto nuevo; abrir referencias no resueltas en el asistente de relocalizacion.

Caso límite o error: Versión futura o estructura inválida se rechaza sin alterar otros proyectos; rutas recibidas no permiten leer archivos arbitrarios del host.

Reglas: RN-16. Dependencias: RF-32. Verificación: PF-33; incluir escenario nominal y caso límite anterior.

## RF-34 - Gestión de almacenamiento

Entrega: M1 / Must. Objetivo: OBJ-05. Flujo: FL-09. Pantalla de referencia: UI-11.

Como usuario quiero gestión de almacenamiento para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Mostrar uso de originales administrados, proxies, cache y renders; limpiar solo derivados regenerables seleccionados.

Caso límite o error: Una limpieza no borra medios originales ni renders finales. Una tarea que usa cache obtiene lease y evita su eliminacion mientras trabaja.

Reglas: RN-19. Dependencias: RF-05. Verificación: PF-34; incluir escenario nominal y caso límite anterior.

## RF-35 - Atajos y alternativas al arrastre

Entrega: M1 / Must. Objetivo: OBJ-05. Flujo: FL-09. Pantalla de referencia: UI-11.

Como usuario quiero atajos y alternativas al arrastre para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Proporcionar atajos documentados y campos o menus para agregar, mover, recortar y reordenar sin arrastrar.

Caso límite o error: No capturar atajos de edición al escribir en un campo; una alternativa de click permite seleccionar objeto y destino, además del teclado.

Reglas: RN-20. Dependencias: RF-09. Verificación: PF-35; incluir escenario nominal y caso límite anterior.

## RF-36 - Preferencias visuales

Entrega: M1 / Must. Objetivo: OBJ-05. Flujo: FL-09. Pantalla de referencia: UI-11.

Como usuario quiero preferencias visuales para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Cambiar tema oscuro/claro, escala de interfaz y movimiento reducido sin cambiar la composición exportada.

Caso límite o error: Reabrir conserva preferencias. Las animaciones de Jeni se desactivan al solicitar movimiento reducido; no bloquear tareas por un asset faltante.

Reglas: RN-20. Dependencias: RF-01. Verificación: PF-36; incluir escenario nominal y caso límite anterior.

## RF-37 - Mensajes y estados de Jeni

Entrega: M1 / Must. Objetivo: OBJ-05. Flujo: FL-09. Pantalla de referencia: UI-12.

Como usuario quiero mensajes y estados de jeni para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Usar mensajes con accion recuperable en bienvenida, exportación, exito y revisión; Jeni es decorativa y prescindible.

Caso límite o error: El error siempre tiene texto y no depende de expresion o color. Un timeout no se interpreta como exito; se ofrece consultar estado y reintentar cuando proceda.

Reglas: RN-20. Dependencias: RF-29. Verificación: PF-37; incluir escenario nominal y caso límite anterior.

## RF-38 - Diagnóstico y perfil compatible

Entrega: M1 / Must. Objetivo: OBJ-05. Flujo: FL-09. Pantalla de referencia: UI-11.

Como usuario quiero diagnóstico y perfil compatible para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Comprobar servicio, espacio libre, soporte real de codecs y reproducción de un clip de prueba; registrar navegador y capacidades detectadas.

Caso límite o error: El diagnóstico identifica una capacidad no probada como tal; no asume que un formato funciona solo por su extension.

Reglas: RN-05. Dependencias: RF-04. Verificación: PF-38; incluir escenario nominal y caso límite anterior.

## RF-39 - Bloqueo y visibilidad de pistas

Entrega: M1 / Must. Objetivo: OBJ-02. Flujo: FL-03. Pantalla de referencia: UI-04.

Como usuario quiero bloqueo y visibilidad de pistas para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Bloquear ediciones por pista, ocultar pistas visuales y silenciar o aislar audio; reflejar estos estados también en exportacion.

Caso límite o error: Una operación grupal con elementos bloqueados se rechaza como conjunto; al salir de solo se restaura la mezcla previa sin sobrescribir mutes.

Reglas: RN-08, RN-12. Dependencias: RF-08. Verificación: PF-39; incluir escenario nominal y caso límite anterior.

## RF-40 - Zoom y ajuste magnetico

Entrega: M1 / Must. Objetivo: OBJ-01. Flujo: FL-03. Pantalla de referencia: UI-05.

Como usuario quiero zoom y ajuste magnetico para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Cambiar zoom y desplazamiento del timeline y activar snapping de 6 px a bordes y cabezal, sin cambiar posiciones guardadas.

Caso límite o error: La tolerancia se calcula en pantalla y se convierte a frames según zoom; puede desactivarse temporalmente y existe entrada numérica exacta.

Reglas: RN-02, RN-09. Dependencias: RF-09. Verificación: PF-40; incluir escenario nominal y caso límite anterior.

## RF-41 - Marcadores y rangos de exportación

Entrega: M2 / Should. Objetivo: OBJ-01. Flujo: FL-03. Pantalla de referencia: UI-05.

Como usuario quiero marcadores y rangos de exportación para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Crear marcadores nombrados y exportar un rango IN/OUT de la secuencia con duración mayor a cero.

Caso límite o error: Fuera del rango no se renderiza contenido; un marcador no corta clips ni altera sincronizacion.

Reglas: RN-02, RN-17. Dependencias: RF-28. Verificación: PF-41; incluir escenario nominal y caso límite anterior.

## RF-42 - Velocidad de clip

Entrega: M2 / Should. Objetivo: OBJ-02. Flujo: FL-05. Pantalla de referencia: UI-07.

Como usuario quiero velocidad de clip para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Cambiar velocidad entre 0.25x y 4x con estrategia explicita de audio y conservación de tono; recalcular duración y limites.

Caso límite o error: Un cambio que cause colision requiere resolverla; deshacer restaura rangos, vinculos y duracion.

Reglas: RN-02, RN-11. Dependencias: RF-20. Verificación: PF-42; incluir escenario nominal y caso límite anterior.

## RF-43 - Transicion entre clips

Entrega: M2 / Should. Objetivo: OBJ-02. Flujo: FL-05. Pantalla de referencia: UI-07.

Como usuario quiero transicion entre clips para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Crear disolucion entre clips con duración y material disponible claramente visibles; preview y render comparten el calculo temporal.

Caso límite o error: Sin handles suficientes se limita la transicion y se explica; no alargar artificialmente la fuente ni modificar duración sin mostrarlo.

Reglas: RN-14. Dependencias: RF-22. Verificación: PF-43; incluir escenario nominal y caso límite anterior.

## RF-44 - Animacion por keyframes

Entrega: M2 / Should. Objetivo: OBJ-02. Flujo: FL-05. Pantalla de referencia: UI-07.

Como usuario quiero animacion por keyframes para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Animar posición, escala, rotación y opacidad con keyframes e interpolacion lineal y hold.

Caso límite o error: Definir propiedad del tiempo local al clip; al dividir se preserva continuidad evaluando un keyframe de frontera.

Reglas: RN-02, RN-14. Dependencias: RF-20. Verificación: PF-44; incluir escenario nominal y caso límite anterior.

## RF-45 - Subtitulos manuales y SRT

Entrega: M2 / Should. Objetivo: OBJ-02. Flujo: FL-05. Pantalla de referencia: UI-07.

Como usuario quiero subtitulos manuales y srt para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Importar, editar y exportar SRT UTF-8; permitir quemar subtitulos en video y exportar archivo separado.

Caso límite o error: Detectar timestamps inválidos y superposiciones; un SRT no se ejecuta como HTML ni contiene formato activo.

Reglas: RN-02, RN-20. Dependencias: RF-23. Verificación: PF-45; incluir escenario nominal y caso límite anterior.

## RF-46 - Subtitulos automáticos

Entrega: M3 / Could. Objetivo: OBJ-02. Flujo: FL-05. Pantalla de referencia: UI-07.

Como usuario quiero subtitulos automáticos para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Transcribir con un modelo local opcional y permitir revisar tiempos y texto antes de publicar subtitulos.

Caso límite o error: No enviar audio a terceros por defecto; falta de modelo o recursos no bloquea edición y se informa del estado real.

Reglas: RN-21. Dependencias: RF-45. Verificación: PF-46; incluir escenario nominal y caso límite anterior.

## RF-47 - Exportación avanzada 4K y fps

Entrega: M2 / Should. Objetivo: OBJ-04. Flujo: FL-07. Pantalla de referencia: UI-08.

Como usuario quiero exportación avanzada 4k y fps para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Habilitar perfiles 4K y 24/25/29.97/50/59.94/60 fps solo tras superar su matriz de compatibilidad y benchmarks.

Caso límite o error: No convertir de forma implicita un proyecto M1; duplicar secuencia y advertir del cambio de base temporal.

Reglas: RN-02, RN-05. Dependencias: RF-28. Verificación: PF-47; incluir escenario nominal y caso límite anterior.

## RF-48 - Proyecto portatil con medios

Entrega: M2 / Should. Objetivo: OBJ-03. Flujo: FL-06. Pantalla de referencia: UI-10.

Como usuario quiero proyecto portatil con medios para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Empaquetar manifiesto y medios seleccionados en un archivo portable transmitido por streaming, con inventario e integridad.

Caso límite o error: Verificar espacio, cancelación y ZIP traversal al importar; un respaldo incompleto queda identificado y no se anuncia como completo.

Reglas: RN-04, RN-16. Dependencias: RF-32. Verificación: PF-48; incluir escenario nominal y caso límite anterior.

## RF-49 - Reintentar una tarea

Entrega: M1 / Must. Objetivo: OBJ-04. Flujo: FL-07. Pantalla de referencia: UI-09.

Como usuario quiero reintentar una tarea para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Permitir reintento solo tras estado terminal, creando nuevo job con la misma revisión y ajustes o eligiendo explicitamente la revisión actual.

Caso límite o error: Antes de reintentar, repetir preflight. Nunca ejecutar dos renders por doble click de la misma solicitud idempotente.

Reglas: RN-17, RN-18. Dependencias: RF-29. Verificación: PF-49; incluir escenario nominal y caso límite anterior.

## RF-50 - Eliminar proyecto con alcance claro

Entrega: M1 / Must. Objetivo: OBJ-03. Flujo: FL-01. Pantalla de referencia: UI-01.

Como usuario quiero eliminar proyecto con alcance claro para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Mostrar nombre y que datos se borraran; enviar a papelera de 7 dias, recuperable y con control de espacio.

Caso límite o error: Medios compartidos se conservan mientras exista una referencia; originales externos nunca se eliminan. Vaciado exige confirmacion y no afecta proyectos activos.

Reglas: RN-04, RN-16. Dependencias: RF-02. Verificación: PF-50; incluir escenario nominal y caso límite anterior.

## RF-51 - Configuración del espacio de trabajo

Entrega: M1 / Must. Objetivo: OBJ-05. Flujo: FL-09. Pantalla de referencia: UI-11.

Como usuario quiero configuración del espacio de trabajo para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Elegir un directorio administrado del servicio y mostrar su ubicación; exigir acceso de lectura/escritura y espacio suficiente.

Caso límite o error: No aceptar rutas de red o montajes desconectados como fiables sin diagnóstico; una ruta recibida por API se resuelve dentro de raices autorizadas.

Reglas: RN-19, RN-22. Dependencias: RF-01. Verificación: PF-51; incluir escenario nominal y caso límite anterior.

## RF-52 - Proxies y normalización de entrada

Entrega: M1 / Must. Objetivo: OBJ-01. Flujo: FL-02. Pantalla de referencia: UI-03.

Como usuario quiero proxies y normalización de entrada para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Generar un proxy CFR de hasta 720p para preview y conservar original; mapear cada frame del proyecto al tiempo de presentacion fuente.

Caso límite o error: Una fuente VFR se normaliza con política repeticion/descarte documentada; el render usa original o intermedio de calidad, nunca el proxy 720p como maestro.

Reglas: RN-05, RN-10. Dependencias: RF-04. Verificación: PF-52; incluir escenario nominal y caso límite anterior.

## RF-53 - Efectos avanzados y seguimiento

Entrega: M3 / Could. Objetivo: OBJ-02. Flujo: FL-05. Pantalla de referencia: UI-07.

Como usuario quiero efectos avanzados y seguimiento para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Investigar chroma key, tracking, estabilizacion y denoise como capacidades independientes con sus propios criterios y benchmark.

Caso límite o error: Esta fila reserva la épica; antes de implementarla se descompone en requisitos verificables y no cuenta como alcance M1 listo.

Reglas: RN-21. Dependencias: RF-21, RF-43. Verificación: PF-53; incluir escenario nominal y caso límite anterior.

## RF-54 - Estado de guardado y conflictos

Entrega: M1 / Must. Objetivo: OBJ-03. Flujo: FL-06. Pantalla de referencia: UI-10.

Como usuario quiero estado de guardado y conflictos para avanzar en el objetivo descrito, conservando un proyecto consistente.

Criterio de aceptacion: Usar revisión esperada en cada guardado y una sola sesión editora por proyecto; una segunda pestana abre en solo lectura.

Caso límite o error: Si hay conflicto, no aplicar último escritor silenciosamente; ofrecer recargar o duplicar la revisión local no guardada.

Reglas: RN-15, RN-16. Dependencias: RF-26. Verificación: PF-54; incluir escenario nominal y caso límite anterior.

