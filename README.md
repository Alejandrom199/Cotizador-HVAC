# Cotizador-HVAC

Aplicación Angular 21 (front-only) del cotizador HVAC. Sustituye el prototipo HTML único. Datos mock en memoria; la lógica de negocio (IVA, SLA, BTU, márgenes) vive en `src/app/domain/`.

Guía completa: **[docs/guia-proyecto.md](docs/guia-proyecto.md)** — qué se hizo, estructura, convenciones y cómo avanzar.

Alineación con el informe de levantamiento PY-INF-001: **[docs/plan-alineacion-PY-INF-001.md](docs/plan-alineacion-PY-INF-001.md)**.

## Requisitos

- Node.js 20+
- npm 10+

## Arranque

```bash
npm install
npm start
```

Abrir [http://localhost:4200/](http://localhost:4200/).

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Dev server |
| `npm run build` | Build de producción (exit 0 antes de dar un cambio por cerrado) |
| `npm test` | Vitest (incluye el caso golden Casa Vinueza = $5,357.16) |

## Roles de demo

En el header: **Ingeniería** · **Ventas** · **Gerencia**. No hay login; es un switch de sesión mock.

Caso de referencia: cotización **Q-014 Casa Vinueza**, total **$5,357.16** (IVA 15 %).
