# QA Automation Demo

Proyecto de demostración de automatización de pruebas en tres capas:

- **Móvil** con [Maestro](https://maestro.mobile.dev) sobre la app de Contactos de Android.
- **API** con [Playwright](https://playwright.dev) contra [JSONPlaceholder](https://jsonplaceholder.typicode.com).
- **Performance** con [k6](https://k6.io).

Todo se ejecuta en CI con Azure Pipelines. La estrategia está en [docs/estrategia.md](docs/estrategia.md).

## Estructura

```
qa-automation-demo/
├── README.md
├── .gitignore
├── azure-pipelines.yml
├── docs/
│   └── estrategia.md
├── mobile/
│   ├── .env.example
│   ├── flows/
│   │   ├── smoke/crear_contacto.yaml
│   │   └── regression/crear_contacto_sin_telefono.yaml
│   └── subflows/
│       ├── abrir_app.yaml
│       └── llenar_contacto.yaml
├── api/                      # proyecto Playwright
│   ├── package.json
│   ├── playwright.config.ts
│   └── tests/posts.spec.ts
└── performance/
    └── smoke-load.js
```

## Requisitos

- Node.js 20+
- Java 17+ y Maestro CLI (para móvil), más un emulador o dispositivo Android
- k6

## Cómo ejecutar

### API (Playwright)

```bash
cd api
npm install
npm test            # todas las pruebas
npm run test:smoke  # solo @smoke
npm run report      # abre el reporte HTML
```

Para apuntar a otra URL: `API_BASE_URL=https://mi-api npm test`.

### Móvil (Maestro)

Con un emulador Android encendido:

```bash
maestro test mobile/flows \
  -e APP_ID=com.google.android.contacts \
  -e CONTACT_FIRST_NAME=Juan \
  -e CONTACT_LAST_NAME=Perez \
  -e CONTACT_PHONE=+56912345678
```

Solo smoke: `maestro test mobile/flows/smoke ...` (mismas variables).
Los valores por defecto están en [mobile/.env.example](mobile/.env.example).

### Performance (k6)

```bash
k6 run performance/smoke-load.js
k6 run -e BASE_URL=https://mi-api performance/smoke-load.js
```

## CI (Azure Pipelines)

[azure-pipelines.yml](azure-pipelines.yml) define tres etapas:

1. **API**: ejecuta Playwright y publica resultados JUnit y el reporte HTML.
2. **Performance**: corre k6 después de API; falla si no se cumplen los umbrales.
3. **Mobile**: levanta un emulador Android en macOS y corre los flujos de Maestro (solo en `main`).
