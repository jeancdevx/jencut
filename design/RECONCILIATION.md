# Resolver diferencias entre imágenes, wireframes y requisitos

Las imágenes generadas fijan carácter y composición. No son la autoridad de cálculos temporales, tamaño de archivo ni compatibilidad. Estas precisiones evitan trasladar errores ilustrativos a la implementación.

| Tema | Comportamiento de implementación |
| --- | --- |
| Tecla Dividir | Usar S en contexto de timeline, conforme a la especificación. Algunas maquetas dibujan B; no copiar esa diferencia. |
| Atajos del navegador | Conservar alternativa en menú; no interceptar al escribir ni bloquear acciones nativas de forma global. |
| Duración del montaje | Calcular desde el final real de los clips. Miniaturas, regla, cabezal y duración exportada deben concordar; 00:48 en imágenes es un ejemplo. |
| Clip más largo que el montaje | La etiqueta debe indicar duración colocada o fuente con distinción clara. Nunca usar la duración de un asset como duración de su instancia. |
| Proyecto vertical | 9:16 usa 1080x1920 a 1080p y 720x1280 a 720p. La tarjeta que dibuja 9:16 con 1920x1080 tiene metadata ilustrativa incorrecta. |
| Proyecto cuadrado | 1080x1080 o 720x720 según preset. |
| Transiciones | M1 incluye fundidos del clip; disolución entre clips es M2. La imagen elegida del editor utiliza Imágenes, no Transiciones habilitadas. |
| Audio original | Desvincular conserva una única instancia de sonido. Un WAV independiente no tiene vínculo que romper. |
| Porcentaje y checks | Solo mostrar datos devueltos/derivados del trabajo real. No marcar exportación completada al terminar un temporizador. |
| Tamaño estimado | Cálculo aproximado según preset y duración; mostrar que es estimación. ~75 MB es ilustrativo. |
| 30 fps | M1 mantiene 30/1 CFR. No abrir un selector que permita fps aún no certificados. |
| Guardado | Mostrar Guardado solo tras confirmación durable y revisión correcta. |
| Niveles | Meter con valores y unidad del dato real; no barras animadas sin señal de audio. |
| Colores numéricos | Tokens definen valores base; validar contraste y ajustar con registro si hace falta. |
| Portadas | Generar desde medios importados. Los paisajes del mockup no son clips de stock incluidos. |
| Jeni | Nombre y diseño conservados. La referencia PNG puede necesitar revisar alfa al integrarla en ambos temas; no inventar poses/animaciones sin assets. |
| Modelo/API | Usar nombres de claves ASCII como revision. Un acento de la tabla narrativa no es un requisito de serialización. |

Si surge otra diferencia, conservar semántica y precisión del producto, documentar la resolución y aplicar el diseño sin reproducir el error. No hace falta pedir al usuario autorización para corregir metadata o un timecode imposible.
