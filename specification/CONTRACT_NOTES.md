# Contratos iniciales

requirements-v1.json conserva los requisitos y sus IDs originales. project.schema.json propone un formato concreto de manifiesto M1 para comenzar H1. El dominio y la API del agente deben validarlo con una biblioteca de JSON Schema 2020-12, más las invariantes cruzadas. El esquema todavía no tiene una implementación consumidora.

## Validaciones que van fuera del esquema

IDs únicos; cada clip pertenece a su pista y referencia un asset/stream existente; visuales y audio en pistas compatibles; máximo 4 pistas por tipo y 50 clips totales; ninguna colisión en una misma pista; fin de proyecto <=18000 frames; fuente IN/rango dentro de los PTS; time base consistente con el stream; fadeIn + fadeOut <= durationFrames; grupos V/A con asset y alineación idénticos; paths resueltos dentro de las raíces autorizadas incluso con symlinks. La regex de rutas no es un sandbox de filesystem.

sourceInPTS y sourceTimeBase definen un tiempo racional de fuente. durationFrames vive en el reloj del proyecto, no en el time base de la fuente. El render elige muestras/frames según PTS y política de normalización, no mediante conversiones float acumuladas. No hay velocidad variable en M1.

## Ejemplo de fixtures

fixtures/project-example.jencut.json corresponde a 90 frames de video con su audio vinculado, más un título de 60 frames. Sus hashes y time bases se obtienen de los medios smoke incluidos. Las rutas managedRelativePath son rutas futuras dentro del workspace del servicio; para usar el ejemplo, importar/copiar medios a esas rutas mediante el flujo real. fixtures/import-map.json indica qué entrada del paquete corresponde a cada asset. No asumir que cargar el JSON copia los medios automáticamente.

fixtures/empty-project.jencut.json es el estado inicial sin clips. El contrato de error al exportarlo es proyecto vacío. El ejemplo y el proyecto vacío no cuentan como proyectos guardados por un editor que aún no se ha implementado.
