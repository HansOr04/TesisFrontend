# Documentación de la web

El código no lleva comentarios: todo lo que hay que saber está aquí.

| Si quieres… | Lee |
|---|---|
| Usar la plataforma | [manual-usuario.md](manual-usuario.md) |
| Entender cómo está construida | [arquitectura.md](arquitectura.md) |
| **Ampliarla** | [como-expandir.md](como-expandir.md) |
| Saber por qué algo está hecho así | [decisiones.md](decisiones.md) |
| Buscar un archivo, componente o función | [referencia](referencia/index.md) |

La del servidor (base de datos, API, reglas, despliegue y operación) está en
[TesisProyectoBack/docs](https://github.com/HansOr04/TesisProyectoBack/tree/main/docs).

`npm run comentarios` falla si alguien agrega un comentario al código.

Quedan fuera las instrucciones que leen las herramientas (`eslint-disable`, `@ts-nocheck`) y
`.env.example`, que documenta cada variable.
