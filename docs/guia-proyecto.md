# Cotizador HVAC EMASESOR — guía del proyecto

Front Angular 21 que sustituye el prototipo HTML único. Hoy es **solo cliente**: datos mock en memoria, sin API. La estructura está pensada para crecer hacia Back-core / Front-core de INTECORE sin reescribir las pantallas.

## 1. Qué se hizo

Se partió del prototipo empaquetado (`Cotizador HVAC - EMASESOR (cliente).html`) y se replicó el comportamiento en Angular, con estas decisiones:

| Decisión | Por qué |
|---|---|
| Angular 21 standalone, zoneless, signals, OnPush | Stack del equipo; sin Zone.js |
| Carpetas `domain` / `application` / `infrastructure` / `features` | Back-core (entidad + puerto + caso de uso) + Front-core (features lazy) en **un** app, no cinco proyectos .NET |
| Fórmulas en `domain/calculators`, no en templates | IVA, SLA, márgenes y BTU no se queman en la UI |
| Repositorios por `InjectionToken` | Hoy mock; mañana HTTP cambiando `environment.useMocks` |
| Sin NgRx, Material, ngx-datatable, JWT, PDF lib, Kafka | Fuera de alcance de esta fase |
| Impresión con `window.print` | Paridad con el prototipo |

**Paridad funcional cubierta**

- 3 roles: Ingeniería (Ing. Paredes), Ventas (M. Coello), Gerencia (D. Andrade)
- 11 vistas (ver rutas más abajo)
- Cotizador con pestañas: Resumen, Cálculo HVAC, Elementos, Tiempos/SLA, Reajuste, Informe
- Caso golden **Casa Vinueza (Q-014) = $5,357.16** con IVA 15% (test de dominio + UI)

**Qué no está (aún)**

- Persistencia: F5 vuelve al seed. No hay `localStorage`
- Backend / JWT / usuarios reales
- `HTTP_PROVIDERS` está vacío a propósito
- Visibilidad de menú por rol (el prototipo mostraba todo)
- PDF real (jsPDF o similar); hoy es HTML + print
- Nav móvil tipo hamburger (el sidebar ya no se oculta en viewports estrechos)

## 2. Cómo correrlo

```bash
npm install
npm start          # ng serve → http://localhost:4200/
npm run build      # obligatorio antes de dar un cambio de código por cerrado
npm test           # Vitest, una pasada
```

Alias de imports: `@app/*` → `src/app/*`.

## 3. Estructura

```
src/
  environments/                  useMocks + apiUrl
  styles.scss                    paleta del prototipo (teal #0e6b7b, header #0b2530)
  app/
    app.config.ts                router, zoneless, MOCK vs HTTP
    app.routes.ts                shell + lazy features
    domain/                      reglas de negocio (sin Angular HTTP)
      enums/
      models/
      settings/quote-settings.ts números de negocio (IVA, SLA, BTU, márgenes)
      calculators/               funciones puras + calculators.spec.ts
      ports/                     interfaces + InjectionTokens
    application/                 orquestación delgada
      quote-workspace.service.ts valida → obtiene → calcula → persiste → toast/print
      print.service.ts
    infrastructure/
      mock/                      seed + store in-memory + repos
      http/                      hueco para Http*Repository
    core/                        sesión mock + toast (hueco de Auth)
    layout/                      header, sidebar, router-outlet
    features/                    una carpeta por capacidad, páginas lazy
    shared/ui/presentation.ts    chips de estado/tipo (solo presentación)
```

### Features ↔ rutas

| Feature | Ruta | Quién la usa |
|---|---|---|
| `dashboard` | `/inicio` | Los 3 roles (KPIs distintos) |
| `solicitudes` | `/solicitudes` | Lista |
| `solicitudes` | `/solicitudes/nueva` | Ventas (formulario de solicitud) |
| `quote` | `/cotizaciones/:id` | Ingeniería / todos |
| `inbox` | `/bandeja` | Pool sin ingeniero asignado |
| `performance` | `/rendimiento` | Ciclos y SLA |
| `catalog` | `/productos` | Catálogo |
| `clients` | `/clientes` | Clientes / RUC |
| `templates` | `/plantillas` | PL-01 … PL-04 |
| `warehouse` | `/compras` | Bodega / OC mock |
| `analytics` | `/analitica` | Pipeline |

## 4. Flujo de una operación

Ejemplo: **aplicar plantilla** en una cotización.

```
Página (quote-workspace-page)
    → QuoteWorkspaceService.applyTemplate(id)
        → QUOTE_REPOSITORY.getById
        → TEMPLATE_REPOSITORY.getByCode
        → applyTemplateLines()          ← domain puro
        → QUOTE_REPOSITORY.upsert
        → ToastService
```

La página no calcula BTU ni IVA. Si mañana el upsert es HTTP, el servicio y la página no cambian de contrato.

```
environment.useMocks === true  → MOCK_PROVIDERS
environment.useMocks === false → HTTP_PROVIDERS  (hoy: [])
```

Tokens: `QUOTE_REPOSITORY`, `PRODUCT_REPOSITORY`, `CLIENT_REPOSITORY`, `TEMPLATE_REPOSITORY`, `STAFF_REPOSITORY`, `QUOTE_SETTINGS`.

## 5. Dominio (números que no van en la UI)

Fuente: `src/app/domain/settings/quote-settings.ts`.

| Concepto | Valor actual |
|---|---|
| IVA Ecuador | 15 % |
| Margen instalación / mantenimiento | 22 % / 30 % |
| SLA por complejidad | 8 / 24 / 56 / 96 h |
| Validez de oferta | 15 días |
| Descuento máximo | 40 % |
| Multiplicador ambiente | crítico 1.25 · comercial 1 · residencial 0.9 |
| Factor BTU por plantilla | PL-01 600 · PL-02 650 · PL-03 700 |

El prototipo tenía knobs huérfanos (`factorBTU` global, `indirectos`, `utilidad`, `accesorios`). Están en `unusedPrototypeKnobs` para **no** reintroducirlos en pantallas.

**Caso golden (no romper):**

- Complejidad Casa Vinueza: Simple / 8 h
- Precio: subtotal 4,658.40 + IVA 698.76 = **5,357.16**
- Test: `src/app/domain/calculators/calculators.spec.ts`

Si cambias IVA, márgenes o líneas de Q-014, el test debe seguir en verde o actualizarse con acuerdo de negocio.

## 6. Convención al tocar código

1. Fórmula nueva → `domain/calculators` + test. No en el `.html`.
2. Dato persistible → puerto + implementación mock (y más adelante HTTP). No `fetch` en el componente.
3. Página → inyecta `QuoteWorkspaceService` / `SessionService`. No el store mock.
4. Feature nueva → carpeta en `features/` + `loadComponent` en `app.routes.ts`.
5. Antes de dar por cerrado: `npm run build` (y `npm test` si tocaste dominio).

El orquestador (`QuoteWorkspaceService`) debe seguir delgado. Si crece demasiado, extraer casos de uso (`apply-template.usecase.ts`, etc.) **dentro de `application/`**, no meter lógica en la página.

## 7. Cómo avanzar (orden recomendado)

No hace falta un backend para seguir mejorando el front. El orden de menor riesgo:

### Fase A — endurecer el front (esta semana)

1. **Persistencia local opcional** en el mock store (`localStorage` o `indexedDB`) para que F5 no borre el trabajo de demo.
2. **Menú por rol**: Ventas no necesita Rendimiento técnico; Ingeniería no crea “Nueva solicitud” igual que Ventas (ya hay rama en `startNew()`).
3. **Tests de aplicación** sobre `QuoteWorkspaceService` (tomar bandeja, clonar, descuento > 40 %, cliente duplicado).
4. Pulir UX que el prototipo tenía y aún está cruda (modales, vacíos, validación de RUC).

### Fase B — contrato con backend (cuando exista API)

1. Definir DTOs = modelos de `domain/` (o mapper 1:1). No filtrar entidades SQL al HTML.
2. Implementar `HttpQuoteRepository` etc. en `infrastructure/http/`.
3. Rellenar `HTTP_PROVIDERS` y poner `useMocks: false` en el environment de quality.
4. Auth: sustituir `SessionService` (switch de rol) por el hueco de JWT de Front-core. Los roles de dominio (`UserRole`) se mantienen.
5. No poner connection strings ni tokens en el repo.

El backend, si se alinea a INTECORE, sería algo así (aún no existe en este folder):

```
Quote (entidad)  →  IQuoteRepository (puerto)  →  QuoteApplication (casos de uso)
                                                     ↑
                                              Angular solo consume HTTP
```

### Fase C — producto

- PDF de cotización/solicitud con librería, no solo print
- Adjuntos reales (hoy se simulan nombre/tamaño)
- Órdenes de compra contra stock
- Línea base de analítica (el dashboard de Gerencia ya habla de “primera medición”)

## 8. Mapa mental para un cambio típico

**“El IVA pasa a 13 %”**  
Editar `DEFAULT_QUOTE_SETTINGS.ivaRate`. Actualizar el test golden. La UI lee `workspace.settings.ivaRate`.

**“Nueva plantilla PL-05”**  
`seed-data.ts` + si hay factores, `quote-settings` / `apply-template.ts`. No hardcodear en el select de la página (ya itera `templates()`).

**“Endpoint GET /quotes”**  
Clase `HttpQuoteRepository implements QuoteRepository` + provider. El dashboard no se entera.

**“Nueva pantalla Historial”**  
`features/history/pages/...` + ruta lazy. Si necesita datos, puerto nuevo o método en `QuoteRepository`.

## 9. Deuda conocida (no es bloqueo)

- Navegación del shell usa `(click) + navigateByUrl` en lugar de `routerLink` (en zoneless el clic de `RouterLink` no estaba cambiando la URL).
- `QuoteWorkspaceService` concentra muchos casos de uso; se puede partir cuando duela.
- Seed y store viven solo en memoria.
- No hay e2e en el CLI; la verificación de UI se hizo a mano / Chrome contra `ng serve`.
