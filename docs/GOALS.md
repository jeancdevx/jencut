# Resultados del proyecto

Jencut es el editor personal de Jeancarlo: arrastrar varios fragmentos, montar,
cortar/dividir, controlar audio, aplicar efectos básicos y obtener un archivo
final. Debe conservar el trabajo y los originales, y mostrar estados honestos.

## Resultado M1

Una aplicación web de escritorio que se ejecute con su servicio local y permita
completar el guion U1 de la especificación: cinco clips, imagen, música, split,
trim, audio desvinculado, título, corrección básica, undo/redo,
cierre/reapertura y exportación verificada. Debe incluir los 45 RF de M1 y los
atributos de calidad relacionados.

## Requisitos invariantes

- Tiempo de proyecto entero en frames a 30/1 fps; audio a 48 kHz; fuentes con
  PTS racionales.
- Montaje no destructivo; ninguna acción de edición reescribe originales.
- Máximo inicial 4 pistas visuales y 4 de audio; sin solapamiento de clips en
  una misma pista.
- Imagen, título, transformación, color básico, fades, ganancia y mute tienen
  significado consistente entre preview y render.
- Guardado durable, revisión esperada, recuperación, medios ausentes y fallos de
  exportación están contemplados desde el diseño.
- Resultado final publicado después de inspección; los archivos parciales no son
  éxitos.
- Nada de medios a servicios de terceros por defecto. Servicio local con límites
  y controles de acceso.

## Presupuesto inicial por validar

M1: 720p/1080p SDR y 30 fps; formatos 16:9, 9:16 y 1:1; 10 minutos, 50 clips, 30
assets y 10 GiB de medios por proyecto como envolvente objetivo. Los valores de
rendimiento no están medidos. Registrar el equipo real y probar, sin atribuirle
al usuario el hardware H1 propuesto.

M2/M3 conservan sus IDs y quedan fuera de la primera entrega: keyframes,
transiciones entre clips, velocidad, subtítulos, 4K/fps avanzados, proyecto
portable completo e IA opcional. No crear login, pagos, colaboración o
publicación en redes.
