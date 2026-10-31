# Medios y ejemplos de prueba

smoke/ contiene material sintético generado con FFmpeg: video H.264/AAC 1080p30 de 3 s, otro sin audio, WAV estéreo 48 kHz, WAV mono 44.1 kHz de 1 s, PNG con alfa y un falso MP4 que debe rechazarse. El manifiesto guarda hashes y resultados reales de ffprobe para los archivos válidos.

Estos fixtures sirven para comenzar a probar importación, streams, split/trim, audio, alfa y errores sin pedir archivos personales. **No son un benchmark C1/C2 ni videos cinematográficos de las maquetas.** No anuncian capacidades del editor.

Generar otro conjunto smoke: `python scripts/generate_test_media.py --profile smoke --output fixtures/generated-smoke`.

Preparar entradas sintéticas del corpus nominal: `python scripts/generate_test_media.py --profile c1 --output fixtures/generated-c1`. El perfil genera cinco videos de 12 s y recursos adicionales; el agente aún debe construir el montaje C1 completo, añadir títulos, fijar el preset y ejecutar las mediciones indicadas en la especificación.

El generador no usa red ni paquetes Python de terceros. Requiere FFmpeg con libx264/AAC/PNG y ffprobe en PATH. No sobrescribe archivos desconocidos; solo reutiliza aquellos cuyo hash coincide con su manifiesto.

project-example.jencut.json y empty-project.jencut.json son ejemplos de contrato. import-map.json relaciona el asset con el fixture que debe importarse; las rutas del workspace se crean por el servicio, no se asumen en la carpeta del paquete.
