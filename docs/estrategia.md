# Estrategia de pruebas

## Objetivo

Demostrar una estrategia de automatización en tres capas (móvil, API y
performance) integrada en un pipeline de CI en Azure DevOps.

## Pirámide de pruebas

| Capa        | Herramienta | Alcance                                   | Cuándo corre              |
|-------------|-------------|-------------------------------------------|---------------------------|
| API         | Playwright  | Contrato y CRUD del recurso `/posts`      | Cada push y PR            |
| Performance | k6          | Smoke de carga: 5 VUs, ~1 minuto          | Después de API            |
| Móvil (E2E) | Maestro     | Flujos críticos de la app de Contactos    | Solo en `main` (costoso)  |

La mayor parte de la cobertura vive en la capa de API, que es rápida y estable.
Las pruebas E2E móviles se limitan a los flujos de negocio críticos.

## Suites

- **Smoke**: verifica lo mínimo para dar por sano un build.
  - Móvil: `flows/smoke/crear_contacto.yaml`
  - API: tests etiquetados `@smoke` (`npm run test:smoke`)
- **Regresión**: casos borde y escenarios negativos.
  - Móvil: `flows/regression/crear_contacto_sin_telefono.yaml`
  - API: resto de `posts.spec.ts` (filtros, 404, POST/PUT/DELETE)

## Criterios de aceptación de performance

| Métrica              | Umbral       |
|----------------------|--------------|
| `http_req_failed`    | < 1 %        |
| `http_req_duration`  | p95 < 800 ms |
| `checks`             | > 99 %       |

Si algún umbral falla, k6 termina con código distinto de cero y el pipeline falla.

## Buenas prácticas aplicadas

- **Reutilización**: los pasos repetidos de Maestro están en `subflows/`.
- **Configuración externa**: URLs y datos de prueba vía variables de entorno
  (`API_BASE_URL`, `BASE_URL`, `mobile/.env.example`).
- **Reportes**: JUnit publicado en Azure DevOps; reporte HTML de Playwright y
  resumen de k6 como artefactos del pipeline.
- **Estabilidad**: reintentos de Playwright solo en CI; `clearState` en Maestro
  para que cada flujo parta de un estado limpio.

## Riesgos y limitaciones

- JSONPlaceholder es una API simulada: `POST`, `PUT` y `DELETE` no persisten.
- Los selectores de la app de Contactos pueden variar entre versiones de Android
  y fabricantes; los flujos aceptan textos en inglés y español.
- El emulador en CI agrega tiempo y posibles inestabilidades; por eso la etapa
  móvil corre solo en `main`.
