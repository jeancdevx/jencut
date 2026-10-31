# Flujo de contribución

`develop` es la rama principal de integración. El trabajo nuevo parte de esa
rama y se incorpora mediante una pull request.

## Ramas y commits

- `feature/<tema>` para capacidades nuevas.
- `fix/<tema>` para correcciones.
- `chore/<tema>` o `docs/<tema>` para mantenimiento o documentación.

Los commits siguen `tipo(ámbito): descripción`, con un propósito verificable por
commit. Por ejemplo: `feat(export): inspect MP4 output before publication` o
`fix(media): reject invalid stream metadata`.

Un commit puede incluir implementación, pruebas y documentación de la misma
responsabilidad. Los recursos que componen una misma identidad o un archivo
histórico se mantienen juntos. No se agrupan módulos independientes para reducir
artificialmente el número de commits ni se crea un commit por archivo.

Husky ejecuta lint-staged y Commitlint. Los archivos de contexto que se excluyen
del formateador conservan su contenido; un conjunto compuesto únicamente por
esos archivos no hace fallar el hook. Los errores de sintaxis y lint siguen
bloqueando el commit.

## Pull requests

1. Publicar la rama y abrir una PR con base `develop`.
2. Usar un título Conventional Commits y describir el resultado, los cambios, la
   verificación ejecutada y el alcance pendiente.
3. Comprobar los commits, autores, diff y resultados de CI. No incluir
   credenciales, medios del workspace ni salidas generadas ajenas a la evidencia
   seleccionada.
4. Integrar mediante merge commit para conservar los commits del trabajo. El
   título del merge también sigue Conventional Commits.
5. Actualizar `develop` con fast forward y retirar la rama ya integrada.

La identidad de autor y committer procede de la configuración de Git del
usuario. No se añaden coautores automáticos.
