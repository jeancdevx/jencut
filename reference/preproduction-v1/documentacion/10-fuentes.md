# Fuentes y fundamento de decisiones

Consulta: 28 de octubre de 2026. Fuentes técnicas oficiales; las decisiones del producto se identifican como recomendaciones y no como exigencias de estas fuentes. Las fuentes no garantizan que Jencut cumpla atributos de calidad.

| ID | Referencia | URL | Uso acotado |
| --- | --- | --- | --- |
| S-01 | MDN - WebCodecs API | https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API | WebCodecs ofrece codificacion/decodificacion; el contenedor requiere tratamiento adicional. No se presupone un editor completo por disponer de la API. |
| S-02 | MDN - Storage quotas and eviction | https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria | El almacenamiento de origen esta sujeto a cuotas y políticas de eliminacion; la cache del navegador no se define como respaldo unico. |
| S-03 | FFmpeg - Filters | https://ffmpeg.org/ffmpeg-filters.html | Referencia de operaciones de filtrado. La paridad entre preview y render debe demostrarse en un spike. |
| S-04 | W3C - Dragging movements | https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements | La alternativa al arrastre requiere operación de puntero sin arrastre; el teclado también se contempla y no sustituye esa alternativa. |
| S-05 | Chrome - File System Access | https://developer.chrome.com/docs/capabilities/web-apis/file-system-access | El acceso a archivos desde el navegador requiere permisos y capacidades del entorno; el servicio administrado evita depender exclusivamente de handles persistentes. |
| S-06 | W3C - WCAG 2.2 | https://www.w3.org/TR/WCAG22/ | Base del objetivo de accesibilidad; la especificación del producto no acredita por si misma conformidad. |
| S-07 | Google Fonts - Manrope | https://github.com/google/fonts/tree/main/ofl/manrope | Fuente y licencia de la tipografía de marca. |
| S-08 | Google Fonts - Inter | https://github.com/google/fonts/tree/main/ofl/inter | Fuente y licencia de la tipografía de interfaz. |

La arquitectura hibrida local es una inferencia de diseño que combina estas restricciones con el uso personal solicitado. Los límites, números de pistas y umbrales de prueba son propuestas de ingenieria; no se atribuyen a MDN, W3C o FFmpeg.
