# Matriz de trazabilidad

Línea base v1.0. Cada requisito funcional tiene objetivo, flujo, pantalla, regla, dependencia y caso de verificacion. Estado de todas las pruebas: no ejecutada. Cobertura documental no equivale a cobertura de software ni a aceptacion del usuario.

| Requisito | Título | Entrega | Objetivo | Flujo | Pantalla | Reglas | Dependencias | Prueba | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-01 | Crear proyecto | M1 | OBJ-01 | FL-01 | UI-02 | RN-01, RN-02 | - | PF-01 | No ejecutada |
| RF-02 | Biblioteca de proyectos | M1 | OBJ-03 | FL-01 | UI-01 | RN-16 | RF-01 | PF-02 | No ejecutada |
| RF-03 | Importación multiple | M1 | OBJ-01 | FL-02 | UI-03 | RN-03, RN-04 | RF-01 | PF-03 | No ejecutada |
| RF-04 | Inspección de compatibilidad | M1 | OBJ-05 | FL-02 | UI-03 | RN-03, RN-05 | RF-03 | PF-04 | No ejecutada |
| RF-05 | Miniaturas y formas de onda | M1 | OBJ-01 | FL-02 | UI-04 | RN-04, RN-19 | RF-04 | PF-05 | No ejecutada |
| RF-06 | Organizar recursos | M1 | OBJ-01 | FL-02 | UI-04 | RN-04 | RF-03 | PF-06 | No ejecutada |
| RF-07 | Agregar a la línea de tiempo | M1 | OBJ-01 | FL-03 | UI-04 | RN-06, RN-07 | RF-04, RF-08 | PF-07 | No ejecutada |
| RF-08 | Pistas multiples | M1 | OBJ-01 | FL-03 | UI-04 | RN-06, RN-08 | RF-01 | PF-08 | No ejecutada |
| RF-09 | Selección y posición temporal | M1 | OBJ-01 | FL-03 | UI-04 | RN-02, RN-09 | RF-07 | PF-09 | No ejecutada |
| RF-10 | Previsualización y avance por frame | M1 | OBJ-01 | FL-03 | UI-04 | RN-02, RN-10 | RF-07, RF-52 | PF-10 | No ejecutada |
| RF-11 | Recortar extremos | M1 | OBJ-01 | FL-03 | UI-05 | RN-02, RN-07, RN-09 | RF-09 | PF-11 | No ejecutada |
| RF-12 | Dividir clip | M1 | OBJ-01 | FL-03 | UI-05 | RN-09, RN-11 | RF-09 | PF-12 | No ejecutada |
| RF-13 | Mover y reordenar clips | M1 | OBJ-01 | FL-03 | UI-05 | RN-06, RN-07, RN-11 | RF-09 | PF-13 | No ejecutada |
| RF-14 | Eliminar y cerrar hueco | M1 | OBJ-01 | FL-03 | UI-05 | RN-07, RN-12 | RF-09 | PF-14 | No ejecutada |
| RF-15 | Duplicar clips | M1 | OBJ-01 | FL-03 | UI-05 | RN-04, RN-07 | RF-09 | PF-15 | No ejecutada |
| RF-16 | Vincular y desvincular audio | M1 | OBJ-02 | FL-04 | UI-06 | RN-11, RN-13 | RF-07, RF-08 | PF-16 | No ejecutada |
| RF-17 | Extraer audio a archivo | M1 | OBJ-02 | FL-04 | UI-06 | RN-13, RN-17 | RF-04, RF-30 | PF-17 | No ejecutada |
| RF-18 | Ganancia y silencio | M1 | OBJ-02 | FL-04 | UI-06 | RN-13 | RF-07 | PF-18 | No ejecutada |
| RF-19 | Fundidos de audio | M1 | OBJ-02 | FL-04 | UI-06 | RN-13 | RF-18 | PF-19 | No ejecutada |
| RF-20 | Transformación visual | M1 | OBJ-02 | FL-05 | UI-07 | RN-08, RN-14 | RF-07 | PF-20 | No ejecutada |
| RF-21 | Corrección visual básica | M1 | OBJ-02 | FL-05 | UI-07 | RN-14 | RF-20 | PF-21 | No ejecutada |
| RF-22 | Fundidos de video | M1 | OBJ-02 | FL-05 | UI-07 | RN-14 | RF-20 | PF-22 | No ejecutada |
| RF-23 | Títulos y textos | M1 | OBJ-02 | FL-05 | UI-07 | RN-08, RN-14 | RF-08, RF-20 | PF-23 | No ejecutada |
| RF-24 | Imagenes y superposiciones | M1 | OBJ-02 | FL-05 | UI-07 | RN-03, RN-08 | RF-04, RF-20 | PF-24 | No ejecutada |
| RF-25 | Deshacer y rehacer | M1 | OBJ-03 | FL-03 | UI-05 | RN-15 | RF-01 | PF-25 | No ejecutada |
| RF-26 | Guardado automático y manual | M1 | OBJ-03 | FL-06 | UI-04 | RN-15, RN-16 | RF-01 | PF-26 | No ejecutada |
| RF-27 | Recuperar trabajo | M1 | OBJ-03 | FL-06 | UI-10 | RN-16 | RF-26 | PF-27 | No ejecutada |
| RF-28 | Configurar exportación | M1 | OBJ-04 | FL-07 | UI-08 | RN-02, RN-17 | RF-07 | PF-28 | No ejecutada |
| RF-29 | Progreso y cancelación de render | M1 | OBJ-04 | FL-07 | UI-09 | RN-17, RN-18 | RF-28 | PF-29 | No ejecutada |
| RF-30 | Validar y descargar resultado | M1 | OBJ-04 | FL-07 | UI-09 | RN-17 | RF-29 | PF-30 | No ejecutada |
| RF-31 | Relocalizar medios ausentes | M1 | OBJ-03 | FL-08 | UI-10 | RN-04, RN-16 | RF-04 | PF-31 | No ejecutada |
| RF-32 | Exportar manifiesto de proyecto | M1 | OBJ-03 | FL-06 | UI-10 | RN-04, RN-16 | RF-26 | PF-32 | No ejecutada |
| RF-33 | Importar manifiesto | M1 | OBJ-03 | FL-08 | UI-10 | RN-16 | RF-32 | PF-33 | No ejecutada |
| RF-34 | Gestión de almacenamiento | M1 | OBJ-05 | FL-09 | UI-11 | RN-19 | RF-05 | PF-34 | No ejecutada |
| RF-35 | Atajos y alternativas al arrastre | M1 | OBJ-05 | FL-09 | UI-11 | RN-20 | RF-09 | PF-35 | No ejecutada |
| RF-36 | Preferencias visuales | M1 | OBJ-05 | FL-09 | UI-11 | RN-20 | RF-01 | PF-36 | No ejecutada |
| RF-37 | Mensajes y estados de Jeni | M1 | OBJ-05 | FL-09 | UI-12 | RN-20 | RF-29 | PF-37 | No ejecutada |
| RF-38 | Diagnóstico y perfil compatible | M1 | OBJ-05 | FL-09 | UI-11 | RN-05 | RF-04 | PF-38 | No ejecutada |
| RF-39 | Bloqueo y visibilidad de pistas | M1 | OBJ-02 | FL-03 | UI-04 | RN-08, RN-12 | RF-08 | PF-39 | No ejecutada |
| RF-40 | Zoom y ajuste magnetico | M1 | OBJ-01 | FL-03 | UI-05 | RN-02, RN-09 | RF-09 | PF-40 | No ejecutada |
| RF-41 | Marcadores y rangos de exportación | M2 | OBJ-01 | FL-03 | UI-05 | RN-02, RN-17 | RF-28 | PF-41 | No ejecutada |
| RF-42 | Velocidad de clip | M2 | OBJ-02 | FL-05 | UI-07 | RN-02, RN-11 | RF-20 | PF-42 | No ejecutada |
| RF-43 | Transicion entre clips | M2 | OBJ-02 | FL-05 | UI-07 | RN-14 | RF-22 | PF-43 | No ejecutada |
| RF-44 | Animacion por keyframes | M2 | OBJ-02 | FL-05 | UI-07 | RN-02, RN-14 | RF-20 | PF-44 | No ejecutada |
| RF-45 | Subtitulos manuales y SRT | M2 | OBJ-02 | FL-05 | UI-07 | RN-02, RN-20 | RF-23 | PF-45 | No ejecutada |
| RF-46 | Subtitulos automáticos | M3 | OBJ-02 | FL-05 | UI-07 | RN-21 | RF-45 | PF-46 | No ejecutada |
| RF-47 | Exportación avanzada 4K y fps | M2 | OBJ-04 | FL-07 | UI-08 | RN-02, RN-05 | RF-28 | PF-47 | No ejecutada |
| RF-48 | Proyecto portatil con medios | M2 | OBJ-03 | FL-06 | UI-10 | RN-04, RN-16 | RF-32 | PF-48 | No ejecutada |
| RF-49 | Reintentar una tarea | M1 | OBJ-04 | FL-07 | UI-09 | RN-17, RN-18 | RF-29 | PF-49 | No ejecutada |
| RF-50 | Eliminar proyecto con alcance claro | M1 | OBJ-03 | FL-01 | UI-01 | RN-04, RN-16 | RF-02 | PF-50 | No ejecutada |
| RF-51 | Configuración del espacio de trabajo | M1 | OBJ-05 | FL-09 | UI-11 | RN-19, RN-22 | RF-01 | PF-51 | No ejecutada |
| RF-52 | Proxies y normalización de entrada | M1 | OBJ-01 | FL-02 | UI-03 | RN-05, RN-10 | RF-04 | PF-52 | No ejecutada |
| RF-53 | Efectos avanzados y seguimiento | M3 | OBJ-02 | FL-05 | UI-07 | RN-21 | RF-21, RF-43 | PF-53 | No ejecutada |
| RF-54 | Estado de guardado y conflictos | M1 | OBJ-03 | FL-06 | UI-10 | RN-15, RN-16 | RF-26 | PF-54 | No ejecutada |

## Calidad

| Atributo | Título | Requisitos | Prueba | Estado |
| --- | --- | --- | --- | --- |
| RNF-01 | Respuesta de interacción | RF-09 RF-12 RF-13 RF-25 | PQ-01 | No ejecutada |
| RNF-02 | Seek de preview | RF-10 RF-52 | PQ-02 | No ejecutada |
| RNF-03 | Reproducción sostenida | RF-10 RF-52 | PQ-03 | No ejecutada |
| RNF-04 | Rendimiento de exportación | RF-28 RF-29 RF-30 | PQ-04 | No ejecutada |
| RNF-05 | Perdida máxima de edición | RF-26 RF-27 RF-54 | PQ-05 | No ejecutada |
| RNF-06 | Integridad de originales | RF-11 RF-12 RF-20 RF-21 | PQ-06 | No ejecutada |
| RNF-07 | Sincronización del render | RF-16 RF-28 RF-30 RF-52 | PQ-07 | No ejecutada |
| RNF-08 | Recuperación de almacenamiento | RF-26 RF-27 RF-30 RF-34 | PQ-08 | No ejecutada |
| RNF-09 | Privacidad de contenido | RF-03 RF-23 RF-37 RF-51 | PQ-09 | No ejecutada |
| RNF-10 | Servicio y archivos protegidos | RF-04 RF-33 RF-51 | PQ-10 | No ejecutada |
| RNF-11 | Teclado y sin arrastre | RF-03 RF-11 RF-13 RF-35 | PQ-11 | No ejecutada |
| RNF-12 | Contraste y legibilidad | RF-36 RF-37 | PQ-12 | No ejecutada |
| RNF-13 | Compatibilidad certificada | RF-04 RF-38 | PQ-13 | No ejecutada |
| RNF-14 | Uso de memoria | RF-05 RF-34 RF-52 | PQ-14 | No ejecutada |
| RNF-15 | Exportación repetible | RF-21 RF-23 RF-28 | PQ-15 | No ejecutada |
| RNF-16 | Mantenibilidad | RF-12 RF-25 RF-33 | PQ-16 | No ejecutada |
| RNF-17 | Cancelación y reconexión | RF-29 RF-49 | PQ-17 | No ejecutada |
| RNF-18 | Aprendizaje del flujo | RF-07 RF-12 RF-16 RF-23 RF-28 | PQ-18 | No ejecutada |

## Control de cambio

Todo cambio registra motivo, IDs afectados, impacto en flujos/pantallas/reglas, pruebas nuevas o actualizadas y versión de línea base. No reutilizar un ID eliminado; marcarlo obsoleto con sustituto. Los estados válidos de ejecución son no ejecutada, aprobada, fallida y bloqueada con evidencia y build.
