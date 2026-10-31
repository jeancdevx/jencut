# Diagramas del sistema y de estados

Estos diagramas describen la propuesta de arquitectura y las transiciones del producto; no representan una implementación desplegada. Se incluyen como Mermaid editable y como figuras en el PDF.

## Componentes

```mermaid
flowchart TD
  C["Cliente web: UI, comandos y preview"] --> A["Servicio local: API, revisiones y jobs"]
  A --> W["Worker: ffprobe y FFmpeg"]
  A --> D["SQLite: índice de proyectos y jobs"]
  A --> F["Workspace: medios, manifiestos y derivados"]
  W --> F
  W --> A
```

## Exportación

```mermaid
stateDiagram-v2
  [*] --> Validando
  Validando --> EnCola: preflight correcto
  Validando --> Fallido: problema bloqueante
  EnCola --> Procesando
  EnCola --> Cancelando: cancelar
  Procesando --> Verificando
  Procesando --> Cancelando: cancelar
  Verificando --> Cancelando: cancelar antes del commit
  Verificando --> Completado: verificar y publicar atómico
  Procesando --> Fallido: error del worker
  Verificando --> Fallido: salida inválida
  Cancelando --> Cancelado: worker detenido y temporales aislados
  Completado --> [*]
  Cancelado --> [*]
  Fallido --> [*]
```

Una cancelación posterior a la publicación recibe ALREADY_TERMINAL y muestra el archivo completado. Al reiniciar el servicio, un job que no tenga worker ni salida verificada pasa a interrumpido/fallido recuperable; no se reanuda ni duplica silenciosamente. Reintentar crea otro job con preflight nuevo.

## Modelo de dominio

```mermaid
erDiagram
  PROJECT ||--o{ TRACK : contiene
  PROJECT ||--o{ ASSET : referencia
  TRACK ||--o{ CLIP : contiene
  ASSET ||--o{ CLIP : instancia
  PROJECT ||--o{ SNAPSHOT : conserva
  PROJECT ||--o{ EXPORT_JOB : produce
  CLIP }o--o| LINK_GROUP : pertenece
  ASSET ||--o{ DERIVATIVE : genera
```

M1. Los recursos compartidos se preservan mientras haya referencias desde proyectos activos o papelera. Una exportación fija una revisión y no lee cambios posteriores de la sesion.
