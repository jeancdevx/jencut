# Diseño de experiencia e interacción

## Principios

Video protagonista; herramientas agrupadas por tarea; operaciones reversibles; estado de guardado y revisión visibles; acciones complejas con resultado temporal explicito; controles con alternativa al arrastre. Los wireframes muestran jerarquía y el prototipo muestra rutas entre estados, no un motor audiovisual.

## Sistema visual Precision

Marca Jencut y ruta A elegidas. Manrope 600/700 para marca y títulos; Inter 400/600 para controles. Fondo #101114, panel #191B20, superficie #242730, texto #F4F4F5, secundario #A1A1AA, lavanda #A78BFA. Accion violeta #7C3AED con contraste verificado en cada contexto. El lavanda aparece en foco/seleccion y marca; la mayor parte del area es neutral.

Tema claro propuesto: fondo #F5F4F8, panel #FFFFFF, superficie #EEEAF4, texto #181923, secundario #5F596B, borde #D6D0E0 y accion #6D28D9. Verificar contrastes por componente. Espaciado base: 4, 8, 12, 16, 24 y 32 px; radios: 4 en clips, 6 en controles, 10 en dialogos. Una alternativa de error siempre lleva texto y accion.

Pistas visuales llevan prefijo V y audio A además de color; selección tiene borde y etiqueta. Iconos de una familia consistente, con nombre accesible. Se recomienda Lucide como candidato, verificando licencia y versión antes de integrarlo. No convertir los bocetos del logo en un falso master vectorial.

Texto esencial 12-14 px como mínimo de partida; dialogos y formularios 14-16 px. Targets habituales 32 px y alternativa amplia en menus; objetivo WCAG 2.2 AA sujeto a auditoria. Foco visible, error junto al campo, aria-live para eventos pertinentes y retorno de foco al control que abrio el dialogo.

## Layout objetivo

1440x900 de referencia: barra superior 56 px, lateral biblioteca 260 px, inspector 280 px, centro flexible; timeline inferior con altura inicial 300 px y redimensionable. Mínimo de escritorio objetivo 1280x720: inspector colapsable y biblioteca en pestanas; no obligar a reducir texto para encajar todo. Por debajo, mostrar modo de consulta y recomendar ampliar ventana; la edición movil no se certifica en M1.

## Pantallas trazables

| ID | Pantalla | Contenido y comportamiento | Requisitos |
| --- | --- | --- | --- |
| UI-01 | Proyectos | Lista de proyectos recientes, Nuevo proyecto, buscar, duplicar y papelera. Jeni solo en vacio. | RF-01 RF-02 RF-50 |
| UI-02 | Nuevo proyecto | Nombre, formato, fps M1 fijo visible, ubicación administrada y Crear. Cancelar vuelve a la lista. | RF-01 RF-51 |
| UI-03 | Importación | Lote con estado individual, detalles de codec, progreso, cancelar por archivo y resultado parcial. | RF-03 RF-04 RF-05 RF-52 |
| UI-04 | Editor principal | Biblioteca izquierda; visor central; inspector derecho; timeline inferior; barra superior con revisión y Exportar. | RF-07 RF-08 RF-09 RF-10 RF-26 RF-39 |
| UI-05 | Edición de clip | Selección, campos inicio/IN/OUT, botones Dividir, Duplicar, Eliminar y Cerrar hueco; grupos y bloqueo visibles. | RF-11 RF-12 RF-13 RF-14 RF-15 RF-25 RF-40 |
| UI-06 | Audio | Vinculo, ganancia, silencio, fundidos, forma de onda, medidor de mezcla y Extraer WAV. | RF-16 RF-17 RF-18 RF-19 |
| UI-07 | Inspector visual | Transformación, color, opacidad/fades; título y superposicion; secciones futuras M2 fuera de los controles M1. | RF-20 RF-21 RF-22 RF-23 RF-24 |
| UI-08 | Exportación | Revisión fijada, preset, resolucion, fps, destino, estimación y lista de preflight. | RF-28 |
| UI-09 | Render y trabajos | Estado real, progreso, cancelar, reintentar tras fallo, revisión y enlace a resultado verificado. | RF-29 RF-30 RF-49 |
| UI-10 | Recuperación y relocalización | Revisión durable, copia previa, conflictos, manifiesto, medios ausentes y accion de localizar. | RF-27 RF-31 RF-32 RF-33 RF-54 |
| UI-11 | Preferencias y diagnóstico | Tema, movimiento, escala, atajos, uso de disco, cache y perfil compatible. | RF-34 RF-35 RF-36 RF-38 RF-51 |
| UI-12 | Resultado y feedback | Confirmacion con nombre, revisión, formato y Abrir carpeta; error con causa, recuperación y Jeni opcional. | RF-30 RF-37 |

## Controles y rangos M1

- Posición temporal: frames enteros >=0 y timecode HH:MM:SS:FF no drop-frame a 30 fps.
- Brillo: -1 a +1, neutro 0; contraste: 0 a 2, neutro 1; saturacion: 0 a 2, neutro 1. Traduccion exacta al motor se fija y prueba en SP-02.
- Escala: 1% a 1000%, neutro definido por Ajustar al lienzo; rotación: -180 a +180 grados; opacidad 0 a 100%; posición X/Y en px de lienzo, negativos permitidos y finitos.
- Texto: 8 a 300 px, hasta 500 caracteres, interlineado 0.8 a 2.0, familias incluidas y color con alfa. Advertir contenido fuera del lienzo. Un título o imagen nuevo dura por defecto 90 frames (3 s), editable dentro de E1.
- Audio: -60 a +12 dB, mute independiente; fades en frames/segundos con suma <=duracion. Indicador de picos y política de limitacion exportada visible.
- Cambiar un slider durante drag actualiza preview; confirmar produce un comando. Escape cancela al valor inicial. No generar un comando por cada pixel.

## Atajos propuestos

| Atajo | Accion | Contexto |
| --- | --- | --- |
| Espacio | Reproducir/pausar | Fuera de campos de texto |
| Flecha izquierda/derecha | Frame anterior/siguiente | Timeline/visor |
| Ctrl+O | Importar medios | Editor; no interferir si el navegador lo reserva |
| Ctrl+S | Guardar proyecto | Editor; indicar resultado real |
| Ctrl+Z / Ctrl+Shift+Z | Deshacer/rehacer | Editor; campos conservan su undo textual |
| S | Dividir en cabezal | Timeline con selección |
| Delete | Eliminar dejando hueco | Selección válida |
| Ctrl+D | Duplicar | Timeline, resolver destino libre |
| M | Mute de clip seleccionado | Timeline; no crear marcador en M1 |
| N | Activar/desactivar snapping | Timeline |
| Escape | Cancelar gesto/cerrar dialogo | Devuelve foco al origen |

Los conflictos con el navegador se evalucan en la prueba de usabilidad; menu y controles visibles siguen disponibles. No se usa Backspace como accion destructiva global.

## Uso de Jeni

Mascota estatica en bienvenida, estados vacios, espera y resultado. No tapar visor, timeline ni errores. Ilustracion decorativa con alternativa vacia si el texto ya explica el estado. La mascara alfa de los recortes generados requiere limpieza/validacion antes de producir assets finales; la hoja visual es referencia, no especificación geometrica del logo.

## Prototipo de navegacion

El PDF contiene wireframes anotados W-01 a W-03 y estados UI-01 a UI-12 con hotspots. Secuencia principal: UI-01 -> UI-02 -> UI-04 -> UI-03 -> UI-04 -> UI-05 -> UI-06/UI-07 -> UI-08 -> UI-09 -> UI-12. Ruta alternativa de recuperación: UI-10 -> UI-03 -> UI-04. Preferencias: UI-11 -> UI-04.

Los enlaces cambian de pagina/estado. No simulan calculos, no leen archivos y no exportan video. La evidencia de la navegacion no se usa como prueba funcional del futuro editor. Los lectores PDF deben permitir enlaces internos.

## Sesión de revisión de UX

U1 sigue el flujo completo en el prototipo. U2 localiza un medio ausente y revisa un conflicto de guardado. U3 encuentra como mover un clip sin arrastrar. Anotar que accion esperaba, donde hizo click y si el texto hizo comprensible el estado. Ajustar requisitos si cambia el significado de una operación, no solo las pantallas.
