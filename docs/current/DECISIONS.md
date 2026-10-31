# Registro de decisiones

| ID   | Decisión                                                        | Estado inicial                | Evidencia requerida                                      |
| ---- | --------------------------------------------------------------- | ----------------------------- | -------------------------------------------------------- |
| D-01 | Identidad Precision A, Manrope/Inter y continuidad con Jeni     | Dirección de trabajo elegida  | Referencias visuales incluidas.                          |
| D-02 | Usar alta fidelidad como referencia de apariencia               | Adoptada para implementar     | Comparación visual de las cuatro pantallas.              |
| D-03 | Interfaz web + servicio local                                   | Base a verificar al construir | SP-01/04; registrar alternativa si una capacidad falla.  |
| D-04 | React/TypeScript + Node/TypeScript + FFmpeg + SQLite            | Base técnica                  | Versiones y dependencias fijadas por el agente en H0.    |
| D-05 | 30 fps CFR, SDR y H.264/AAC M1                                  | Base funcional                | Matriz real de formatos y SP-03.                         |
| D-06 | Proxies de preview, fuentes originales para render              | Invariante de calidad         | Paridad y no exportar el proxy como maestro.             |
| D-07 | Un render activo y una sesión editora por proyecto              | Base operativa                | Reintentos, reconexión y pruebas de conflicto.           |
| D-08 | Hitos son verificación técnica, sin aprobación humana rutinaria | Instrucción del encargo       | Avance con evidencia y preguntas solo si son materiales. |

Añadir fecha, motivo, alternativa considerada, resultado y RF/RNF afectados al
cambiar una decisión. No reescribir el historial como si las mediciones ya
existieran.

## Implementación del 30 de octubre de 2026

- Código único en `src/`, conforme a la aclaración del usuario: Astro para las
  páginas, React para el editor, `src/domain` para comandos puros,
  `src/contracts` para tipos y `src/service/worker` para procesamiento. Sin apps
  ni monorepo. El servicio sigue separado en ejecución.
- Node 24.22.2 y pnpm 10.33.2 exactos, dependencias exactas y lockfile único.
  TypeScript 6.0.3 conserva compatibilidad declarada con Astro Check; 7.0.2 fue
  descartado por conflictos de peer dependencies.
- Servicio Fastify en Docker, puerto publicado exclusivamente en
  `127.0.0.1:4318`, volumen persistente `/data`. SQLite WAL mantiene índice y
  jobs; JSON Schema 2020-12 y dominio validan los manifiestos.
- El manifiesto es la autoridad. Cada comando/importación confirma escritura de
  temporal, fsync, rename y fsync del directorio antes de devolver Guardado.
  Conserva `.bak`. La revisión esperada y exclusión por proyecto impiden el
  último escritor silencioso. La sesión editora usa un lease de 30 s con
  heartbeat de 10 s. Recuperación avanzada y conflictos descargables siguen en
  H4.
- Preview inicial de montaje renderizado por FFmpeg desde originales a 720p,
  H.264/AAC CFR 30 fps. Un solo elemento de video reproduce imagen y mezcla.
  Cada revisión prepara su preview con espera explícita; no es un compositor
  interactivo en tiempo real. Exportar usa originales, nunca el proxy maestro.
- Tiempo de edición entero en frames. Split añade frames a PTS como fracción
  exacta reducida: la unidad racional serializada puede diferir del time base
  físico, pero representa el mismo instante sin acumular redondeo. Esta
  precisión es intencional y está probada con cortes a 31/30 s.
- El worker es un proceso Node separado que lanza FFmpeg sin shell, con progreso
  real. Captura revisión y preset inmutables. Inspecciona frames, duración,
  codecs, resolución, frecuencia y hashes antes de publicar por rename atómico.
  Un render activo; el resto queda en cola. Cancelación termina worker y FFmpeg;
  el resultado cancelado no se ofrece como final.
- shadcn/ui se instaló mediante su CLI y se adapta en `src/components/ui` a
  Precision A. Radix aporta foco, teclado y semántica. Phosphor sustituye los
  iconos de plantilla. El timeline y el visor permanecen específicos del editor.
  Se priorizan los tokens y las cuatro referencias sobre las reglas generales de
  una landing page. No se ha construido una landing comercial.
- Copias de proyecto comparten medios inmutables y generan nuevos IDs de
  proyecto, pistas, clips y vínculos. Quitar un recurso sin uso solo elimina su
  referencia; papelera conserva datos. No hay purga automática aún.
- Los fixtures son medios sintéticos de prueba. Las barras de color no son
  portadas de stock ni una maqueta incrustada: miniaturas, waveforms, preview y
  exportación se calculan con los archivos importados.
