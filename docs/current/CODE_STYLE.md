# Estilo de código

## Formato e imports

Oxfmt aplica comillas simples en JavaScript/TypeScript y JSX, sin punto y coma
al final de las instrucciones, con dos espacios de indentación. La configuración
está en `.oxfmtrc.json`.

Los imports se ordenan alfabéticamente por módulo y se agrupan en este orden,
con una línea en blanco entre grupos:

1. Módulos nativos de Node.
2. Dependencias externas.
3. Módulos internos con `@/` y subpaths.
4. Rutas relativas del directorio padre.
5. Rutas relativas del directorio actual.
6. Estilos.

Los imports de tipos acompañan al grupo de su módulo. Oxlint ordena también los
nombres dentro de `{ ... }`, exige imports al principio del módulo y una línea
en blanco antes de comenzar el código. Los imports de efectos secundarios
conservan su orden de ejecución.

Referencia:
[orden de imports en Oxfmt](https://oxc.rs/docs/guide/usage/formatter/sorting.html).

## Separación de bloques

Oxlint ejecuta las reglas de ESLint Stylistic mediante `jsPlugins`, configuradas
en `.oxlintrc.json`:

- Una línea en blanco después de un grupo de declaraciones de variables.
- Variables consecutivas pueden permanecer juntas; se conservan las separaciones
  manuales entre grupos lógicos.
- Una línea en blanco antes de `return`, `throw` y estructuras de control.
- Separación entre funciones, clases, exports y declaraciones de tipos.
- Una línea en blanco después de bloques y entre métodos de clases, conservando
  agrupadas las propiedades consecutivas.

Ejemplo:

```ts
export function readName(value: string) {
  const name = value.trim()
  const valid = name.length > 0

  if (!valid) {
    const error = new Error('Escribe un nombre.')

    throw error
  }

  return name
}
```

Referencias:
[plugins JS de Oxlint](https://oxc.rs/docs/guide/usage/linter/js-plugins.html) y
[regla de separación](https://eslint.style/rules/padding-line-between-statements).

## Aplicación y comprobación

```sh
pnpm format
pnpm lint
pnpm format:check
```

`pnpm format` aplica las correcciones seguras de Oxlint y después Oxfmt.
`pnpm lint:fix` ejecuta solamente las correcciones del linter. `pnpm verify`
comprueba ambas configuraciones junto con tipos, pruebas y build.

VS Code usa la extensión recomendada `oxc.oxc-vscode`: al guardar, aplica
`source.fixAll.oxc` y el formato. El hook pre-commit ejecuta Oxlint con `--fix`
y Oxfmt mediante lint-staged sobre los archivos preparados para el commit.
