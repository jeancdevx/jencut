# Especificación visual de implementación

## Carácter

Un estudio cinematográfico personal. Superficies de grafito y fotografía protagonista; lavanda para foco y selección, violeta para acción principal. Organización densa y legible, con separadores discretos. No usar gradients enormes, glassmorphism sobre el visor, tarjetas de métricas ni controles de adorno sin función.

## Tipografía y recursos

Manrope 600/700 para marca/títulos y secciones; Inter 400/600 para UI, con cifras tabulares para timecode. Cargar fuentes desde assets/fonts, sin CDN. Usar assets/brand para el logo y assets/mascot para Jeni. No usar screenshots completos como fondos de UI. La fotografía dentro de la maqueta representa contenido del usuario: el producto genera miniaturas de los videos importados, no trata el screenshot como una película real.

## Geometría

Referencia de trabajo: 1440x900. Barra superior 56-64 px; rail 48-56 px; biblioteca 240-280 px; inspector 280-320 px; centro flexible. Timeline inicial aproximadamente un tercio del alto, redimensionable. Divisores y paneles ajustables; a 1280x720 colapsar inspector/biblioteca mediante controles sin ocultar acciones esenciales. Fuera del viewport de escritorio certificado, comunicar límites y ofrecer consulta.

Espaciado 4/8/12/16/24/32; radio 4 en clips, 6 en controles, 8 en paneles y 10 en diálogos. Densidad profesional, texto esencial 12-14 px de partida, formularios/dialogs 14-16 px. Targets y contraste se verifican en la auditoría de accesibilidad; no declarar conformidad solo por los tokens.

## Pantallas

- Editor: rail y biblioteca izquierda; visor y transporte central; inspector por selección; timeline con V2/V1/A1/A2 de muestra y capacidad de hasta 4V+4A. Miniaturas reales, handles claros y cabezal con tiempo consistente.
- Proyectos: panel lateral de estudio, proyecto más reciente destacado, portadas reales o placeholder honesto, búsqueda/orden/menú y Nuevo proyecto. No inventar cuentas, pago o nube.
- Audio: inspector muestra el asset/stream seleccionado y si conserva vínculo; ganancia numérica, mute, fundidos, niveles y extracción. Un input WAV independiente no se presenta como audio desvinculado de un MP4.
- Exportar: modal con foco atrapado, Escape/cierre seguro, retorno de foco, revisión fijada, preset/resolución/destino, tamaño aproximado y errores accionables. Comprobaciones vienen del servicio, no son checks verdes fijos.
- Estados adicionales: vacío, importando/parcial/error, medio ausente, sin guardar/conflicto, trabajo pendiente/procesando/verificando/cancelado/fallido/completado. No se entregan como maquetas detalladas de alta fidelidad, pero sí están definidos en los flujos y deben implementarse con el mismo sistema.

## Semántica visual

Selección: borde lavanda + handle/etiqueta, no solo color. Video: violeta desaturado y miniaturas; títulos: lavanda; audio original/ambiente: azul; música: verde. Track headers incluyen prefijo y acción con nombre accesible. Foco de teclado visible independiente de selección.

Jeni aparece en bienvenida, vacío, espera y resultado, sin tapar visor/timeline/errores. Decorativa cuando el texto ya comunica el estado. Respeta movimiento reducido y opción de ocultar. Una ilustración PNG no demuestra que exista animación.

## Revisión visual

Comparar cuatro estados en 1440x900 y editor en 1280x720: proporciones, espaciado, tipografía, bordes, jerarquía, color, estados y foco. El contenido importado puede ser distinto; la estructura y carácter deben conservarse. Guardar capturas reales y observaciones en progress/VISUAL_REVIEW.md.
