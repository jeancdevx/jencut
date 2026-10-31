# Jencut - paquete de preproducción v1.0

Fecha de línea base: 28 de octubre de 2026. Propietario del producto: Jeancarlo. Estado: especificación propuesta y prototipo de navegacion; no hay editor implementado ni benchmarks ejecutados.

Este paquete convierte la idea de editor personal en un alcance verificable. Nombre, ruta visual A / Precision y Manrope + Inter fueron elegidos por el usuario. Jeni se conserva como propuesta de mascota presentada en esta conversacion, pendiente de ratificar como arte final. Las decisiones funcionales y técnicas nuevas son recomendaciones de esta línea base, no preferencias previamente confirmadas.

## Como revisarlo

1. Leer visión y límites en 01. Revisar especialmente el procesamiento local, formatos y envolvente de trabajo.
2. Recorrer los flujos y reglas de 02. Acordar que significan dividir, recortar, desvincular, extraer y cerrar hueco.
3. Revisar requisitos de 03 y sus criterios. La primera entrega M1 ya incluye los efectos básicos solicitados.
4. Abrir Jencut-wireframes-prototipo.pdf y navegar con los botones. Es un prototipo de estados enlazados: no procesa medios ni demuestra rendimiento.
5. Consultar calidad/pruebas, arquitectura y trazabilidad. Ejecutar los spikes al comenzar implementación, antes de comprometer soporte avanzado.

## Archivos

- 01: visión, alcance, supuestos, objetivos y resultados esperados.
- 02: nueve flujos completos, reglas y maquinas de estados.
- 03: requisitos funcionales con dependencias y aceptacion.
- 04: atributos medibles, corpus, casos de prueba y plan de aceptacion.
- 05: arquitectura propuesta, modelo de datos y contratos.
- 06: sistema de interacción, pantallas, atajos y guion de prototipo.
- 07: matriz completa de trazabilidad, con pruebas aún no ejecutadas.
- 08: backlog por entregas, riesgos, decisiones y preguntas pendientes.
- 09: puertas de entrada a desarrollo, orden de trabajo y definición de terminado.
- 10: fuentes técnicas consultadas y distincion entre evidencia y recomendacion.
- 11: diagramas editables de componentes, estados y modelo de dominio.
- especificacion.json: datos estructurados editables que respaldan tablas y requisitos.
- Dos PDF: especificación consolidada y wireframes/prototipo con enlaces internos.
- assets/fonts: tipografías y licencias obtenidas de Google Fonts, más instancias para los PDF.

## Lo que ya se puede hacer con este paquete

Crear issues, estimar tareas, revisar UX, escribir pruebas y comenzar los experimentos de compatibilidad. No se certifica aún soporte de codecs, velocidad de render, igualdad de color o fiabilidad del software, porque todavia no existe una implementacion.

No se ha escrito ni publicado codigo de la aplicacion. Los scripts usados para preparar estos documentos son herramientas de preparación documental y no forman parte del producto.
