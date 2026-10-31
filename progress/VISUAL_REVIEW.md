# Revisión visual de Jencut

Referencia elegida por el usuario: Precision A, Manrope e Inter y las cuatro
imágenes de `design/references`. No se sorteó otra dirección ni se sustituyó por
un dashboard. Los componentes de shadcn/ui se adaptaron a esos tokens y a las
funciones que existen en el motor.

## Pantallas comprobadas

| Pantalla       | Pregunta que responde                                         | Evidencia                                                |
| -------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| Proyectos      | ¿Qué proyecto puedo continuar o crear?                        | `progress/evidence/projects-1440.png`                    |
| Nuevo proyecto | ¿Cómo se llama y qué encuadre tendrá?                         | `create-project.png`; Select/Field reales, tres formatos |
| Editor         | ¿Qué material está colocado y qué corte estoy viendo?         | `editor-1440.png`, `editor-1280.png`                     |
| Audio          | ¿Qué fuente y rango de audio tengo seleccionado?              | `audio-1440.png`; no se dibujan niveles ficticios        |
| Exportación    | ¿Qué revisión y preset se procesan y dónde está el resultado? | `export-1440.png`, `export-completed.png`                |

Se abrieron las cuatro referencias originales y todas las capturas finales de
Playwright. También se abrieron los seis contactos del inspector de diseño en
1440, 1280 y 390 px, incluidos los contenidos tras el primer viewport.

## Correcciones realizadas

1. Clips demasiado bajos: se fijó la geometría visible de 48 px dentro de pistas
   de 56 px, conservando miniaturas de los medios y la selección con handles.
2. Desbordamiento a 1280 px: el input de archivo oculto heredaba ancho completo.
   Se confinó su caja y se comprobó el ancho real del documento.
3. Transporte cortado y divisor vertical: el layout de editor distribuye su alto
   con ResizablePanel y el handle horizontal conserva su orientación visual. Un
   error de servicio no debe empujar controles fuera de la ventana.
4. Botones de biblioteca y portadas: las variantes de shadcn se ajustaron para
   conservar aspect ratio y densidad. Card usa composición Header/Title/
   Description/Content/Footer; las portadas siguen siendo imágenes derivadas.
5. Formularios: Select, Field, InputGroup, validación, etiquetas y foco
   reemplazan los controles genéricos. El Select de formato se probó cambiando a
   vertical y volviendo a horizontal. El sidebar se puede plegar con su control.
6. Contraste: el texto de pista vacía se elevó desde 4,18:1. Axe dejó de
   informar violaciones en las superficies examinadas. Los sliders anuncian su
   nombre en los thumbs de Radix.

## Puerta del inspector

Build de producción, comando
`inspect.mjs --app --widths 1440,1280,390 --allow palette-purple`. Resultado:
**0 FAIL, 4 WARN**. Reporte preservado en
`progress/evidence/design-inspection.json` y contactos en `.taste-skill/final/`.

La única excepción de regla es `palette-purple`: el violeta es la identidad
Precision A solicitada explícitamente, no una paleta elegida por defecto.

Justificación de los avisos:

- `colour-sprawl`: el color intenso procede de las miniaturas SMPTE y del video
  sintético importado; el chrome es grafito. No se atenúa ni reemplaza el
  contenido real del usuario para obtener otra medición.
- `tiny-text`: el tamaño de 12 px se reserva para metadata, ejes y controles
  densos siguiendo la referencia de editor; los campos y acciones principales
  conservan tamaños mayores. La auditoría manual completa queda en H5.
- `below-fold`: las tarjetas son proyectos creados por pruebas reales y la
  biblioteca debe poder desplazarse; creación y continuación siguen arriba.
- `app-title-size`: el saludo de Proyectos conserva la jerarquía grande de la
  segunda referencia. El editor usa encabezados compactos y prioriza el visor.

## Crítica de aplicación, segunda ronda

1. La biblioteca destaca el proyecto reciente y las acciones reales. El editor
   destaca el video; la duración y el timeline corresponden al mismo manifiesto.
2. Los bordes de biblioteca/visor/inspector y timeline comparten marco. A 1280
   el inspector desplaza sus propios campos y puede ocultarse con un control.
3. La marca, Jeni, las dos fuentes locales y el timeline con selección lavanda
   identifican a Jencut. El violeta se usa en acción y selección, no en métricas
   inventadas. Se conservaron los tokens elegidos, sin redibujar la identidad.
4. Los timecodes se derivan de frames. El corte probado dura 81 frames tanto en
   footer como en exportación. Las copias pueden tener revisión 0 y la misma
   duración porque comparten el montaje inicial, con nuevos IDs.
5. Cero proyectos y cero clips tienen vistas vacías reales. Un derivado ausente
   no se presenta como un recurso listo y un render en cola no tiene un
   porcentaje inventado.
6. No hay leyendas de datos ficticias. Waveforms derivan de muestras; la escala
   es normalizada y no representa dBFS ni niveles en vivo.
7. En 390 px la biblioteca de proyectos usa una columna y la navegación abre un
   Sheet. Esto no certifica el editor móvil; H5 aún debe completar ese
   recorrido.

Valoración de esta entrega: diseño 7,3; usabilidad 7,4; identidad 7,8; contenido
7,0. La fidelidad completa sigue pendiente: inspector de audio avanzado,
títulos, color, tema claro y equivalencia de controles con las maquetas
pertenecen a H3/H5. Las barras de color hacen que las capturas sean menos
cinematográficas que las referencias; son el fixture real y se sustituirán al
importar medios propios, no mediante fotografías incrustadas como una interfaz
falsa.

## Contenido de prueba

`Estudio de color · montaje H1`, sus copias y `Historia H1 …` son proyectos
sintéticos creados por las pruebas. Sus portadas proceden de
`fixtures/smoke/clip-with-audio.mp4`. No hay fotos de stock, personas,
testimonios ni números de usuarios inventados. Los logos y Jeni proceden del
paquete del usuario. El paquete original se conserva con sus licencias y
checksums.
