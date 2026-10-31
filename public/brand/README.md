# Marca vectorial para implementar

Estos SVG son una **reconstrucción de producción** de la dirección A aprobada, basada en su símbolo de dos segmentos y corte diagonal. No son los archivos vectoriales originales de una agencia: la exploración inicial era una imagen raster. Se entregan como fuente editable coherente para la implementación.

- symbol.svg: símbolo lavanda, fondo transparente y viewBox cuadrado.
- symbol-monochrome.svg: usa currentColor cuando se integra como SVG inline.
- logo-on-dark.svg / logo-on-light.svg: composición horizontal con lettering convertido a trazados de Manrope 700; no depende de una fuente instalada para visualizarse.
- logo-monochrome.svg: versión de un color.
- favicon.svg: símbolo sobre grafito.
- png/: exportaciones derivadas del SVG si están presentes; no se redimensiona un screenshot del logo.

Usar logo completo en cabeceras y símbolo en favicon/rail. Mantener al menos un cuarto del ancho del símbolo como espacio libre en composiciones grandes; no estirar ni poner glow. Verificar 16/24/32 px y ambos temas al integrar; si se ajusta la geometría conservar el SVG como autoridad y regenerar derivados.

Regenerar derivados: `python scripts/export_brand.py --overwrite`, con FFmpeg que incluya librsvg. El rasterizador recibe la resolución de salida antes de leer el SVG, para evitar ampliar una imagen pequeña. El SVG conserva su geometría como fuente.
