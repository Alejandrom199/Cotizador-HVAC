# Plan de alineación — PY-INF-001 vs app actual

**Fuente:** `PY-INF-001 INFORME DE LEVANTAMIENTO - PROTOTIPADO` (v1, 23/06/2026, cliente EMASESOR, 20 págs.).  
**App:** Angular 21 en este repo (paridad con el prototipo HTML interactivo, no con este PDF).

Este informe es el **contrato de proceso y pantallas maestras**. El HTML que ya convertimos es un prototipo **más amplio** (motor HVAC, SLA, roles, reajuste, analítica). El plan no tira lo extra: cierra huecos del informe y deja lo demás como valor de ingeniería.

## 0. Lectura del documento (proceso esperado)

Flujo que el informe describe, en orden:

```
Productos (alta/edición) ─┐
Clientes (alta + validar RUC) ─┤
                               ▼
                    Nueva solicitud (Ventas)
                               ▼
                    Bandeja / recepción (Ingeniería)
                               ▼
              Dashboard del proyecto (4 etapas)
                 Revisión → Planos → Cálculos → Cotización
                               ▼
              Elementos (bloques + catálogo insumos/equipos)
                               ▼
              Informe detallado  +  Informe final (PDF)
                               ▼
              Proyectos finalizados → envío al cliente por correo
```

Objetivo de negocio (pág. 3): eliminar operación manual y bajar tiempo de respuesta. Eso **sí** está alineado con el motor de cálculo que ya tenemos; el PDF casi no lo nombra.

## 1. Localización (no negociar a ciegas)

El PDF usa ejemplos de **Perú** (RUC 11 dígitos `20601234567`, `+51`, Lima, S.A.C., IVA genérico).  
La app y EMASESOR operan **Ecuador** (RUC 13, `+593`, Quito, IVA 15 %).

**Decisión de plan:** el proceso se alinea al informe; los datos fiscales se quedan en Ecuador salvo que el cliente pida Perú. Placeholders del PDF no se copian literalmente.

## 2. Matriz de alineación

Leyenda: **OK** cubierto · **PARCIAL** existe pero no cumple el informe · **FALTA** no está · **EXTRA** está en la app y no en el PDF (conservar).

### 2.1 Productos (cap. 2)

| Requisito PY-INF-001 | App hoy | Estado |
|---|---|---|
| Listado con categoría, costo, PVP | `/productos` tabla | PARCIAL (falta búsqueda, unidad, estado) |
| Filtro por categoría | chips Todas/Equipos/… | OK |
| Buscador | — | FALTA |
| Botón Nuevo | — | FALTA |
| Formulario: código, categoría, nombre, UM, costo, PVP, imagen, estado, descripción | modelo sin `activo` ni `imagen` | FALTA |
| Editar / inactivar | filas de solo lectura | FALTA |

### 2.2 Clientes (cap. 3)

| Requisito | App hoy | Estado |
|---|---|---|
| Listado centralizado | `/clientes` cards | PARCIAL (sin búsqueda ni acciones) |
| Alta desde módulo Clientes | solo modal en Nueva solicitud | FALTA |
| RUC + validación “¿registrar?” | Nueva solicitud sí | PARCIAL (no en el módulo Clientes) |
| Correo de facturación + aviso “se envía copia del presupuesto” | `mail` genérico, sin aviso | FALTA |
| Dirección fiscal / obra | solo `city` | FALTA |
| Teléfono con prefijo | existe en seed, no en el alta | PARCIAL |
| Cancelar / Guardar | modal mínimo | PARCIAL |

### 2.3 Solicitud de cotización (cap. 4.1–4.2)

| Requisito | App hoy | Estado |
|---|---|---|
| Listado con avance, responsables, estados | `/solicitudes` | OK |
| Nueva solicitud: RUC, empresa (lupa), proyecto auto | `/solicitudes/nueva` | OK |
| Adjuntos PDF/DWG/JPG + tamaño | UI sí, persistencia solo nombre | PARCIAL |
| Tipo Instalación / Mantenimiento | OK | OK |
| Subtipo Insumos / Materiales / Completa | OK | OK |
| Prioridad + observaciones | OK | OK |
| Exportar PDF solicitud | `window.print` | PARCIAL (no PDF archivo) |
| Finalizar (verde) | botón “Registrar solicitud” teal | PARCIAL (copy/color) |

### 2.4 Envío al cliente (cap. 4.3)

| Requisito | App hoy | Estado |
|---|---|---|
| Vista **Proyectos finalizados** (archivo) | filtro Aprobada en solicitudes | PARCIAL |
| Envío oficial por correo | toast “enviada”; no hay mail real ni historial de envíos | FALTA (mock de correo + log) |

### 2.5 Recepción / ingeniería (cap. 4.4)

| Requisito | App hoy | Estado |
|---|---|---|
| Bandeja de pedidos | `/bandeja` pool sin ingeniero | PARCIAL (el informe habla también de “los que tiene a cargo”) |
| Dashboard del proyecto: 4 etapas visibles | pestaña Resumen + Tiempos | PARCIAL (no es el dashboard de obra del PDF) |
| Botones Informe final / Informe detallado | un solo PDF print | FALTA (dos documentos) |
| Elementos por bloques expandibles | pestaña Elementos, 4 cats | PARCIAL |
| + Agregar material, qty, basurero, subtotal auto | sí | OK |
| Bloques extra: Grúa, Mant. preventivo | Grúa está en Logística; no hay cat. Preventivo | PARCIAL |
| Recuadro negro total + “incluye IVA” + Finalizar cotización | total en informe; Finalizar = Enviar/Aprobar | PARCIAL |
| Catálogo insumos (buscar, cat, check/suma, Grabar) | modal corto | FALTA (pantalla) |
| Catálogo equipos (cant. +/−, stock verde/naranja/rojo, Grabar) | mismo modal | FALTA (pantalla) |
| Informe detallado: inversión, +eficiencia, 3 grupos, col. Sistemas | tabla plana | FALTA |
| Informe final: preview propuesta, condiciones, firmas | print HTML simple | FALTA |

### 2.6 Lo que el PDF no pide y la app sí tiene (conservar)

- Roles Ingeniería / Ventas / Gerencia  
- Motor térmico (ambientes, BTU, plantillas PL-01…04)  
- Complejidad + SLA 8/24/56/96 h  
- Reajuste con tope 40 % y bitácora  
- Inicio, Analítica, Rendimiento, Compras/Bodega, Plantillas  
- Caso golden Q-014 = $5,357.16  

Esto cubre el **objetivo** del informe (menos tiempo, menos Excel) mejor que las pantallas CRUD del PDF. No se elimina.

## 3. Diseño visual

El PDF habla de azul marino, verde de finalizar, recuadro negro de inversión, iconos en campos, botones Grabar arriba a la derecha.

La app actual: header `#0b2530`, teal `#0e6b7b`, verde `#1f9d64`, Figtree/Archivo — es el prototipo HTML, no el wireframe genérico del PDF.

**Plan de diseño:**

1. No rediseñar de cero.  
2. Adoptar del informe solo patrones de **proceso**: primario teal, finalizar/guardar en verde, recuadro de total oscuro en Elementos e Informes.  
3. Iconos en campos de alta (RUC, mail, teléfono) sin copiar Lima/+51.  
4. Formularios de Producto/Cliente en **un bloque** como el PDF (no wizard).

## 4. Fases de implementación

Cada fase deja `npm run build` en verde. No se toca el golden case salvo que negocio cambie IVA/líneas.

### Fase 1 — Maestros (proceso 2 y 3)  ← empezar aquí

**Productos**

- Extender `Product`: `activo`, `imagenUrl` (mock; sin binario en git), opcional `unidad` ya existe.  
- `/productos`: buscador, botón Nuevo, acciones Editar / Inactivar.  
- Página o modal `productos/nuevo` y `productos/:code` con los campos del cap. 2.2.  
- Catálogo de cotización ignora inactivos.

**Clientes**

- Extender `Client`: `direccion`, `mailFacturacion` (o reutilizar `mail` + label), aviso de copia de presupuesto.  
- `/clientes`: búsqueda, Nuevo, Editar.  
- Reutilizar el alta que ya existe en Nueva solicitud (mismo caso de uso `registerClient`).  
- Validación RUC Ecuador 13 dígitos; “no registrado → ¿desea registrarlo?” ya está en solicitud; repetir consistencia en el módulo.

**Dominio:** no hay fórmula nueva. Puertos `ProductRepository` / `ClientRepository` ganan `upsert` (client ya lo tiene; product hoy es list-only).

### Fase 2 — Proceso de cotización (cap. 4.4.1–4.4.4)

1. **Resumen de proyecto** (pestaña Resumen): las 4 etapas como el PDF (Revisión / Planos / Cálculos / Cotización) con estado hecho / en curso / pendiente; botones *Informe detallado* e *Informe final* (navegan a pestañas o abren print).  
2. **Elementos:** recuadro oscuro de total + nota IVA + botón verde “Finalizar cotización” (equivale a pasar a Validación/Enviada según rol). Qty editable a teclado, no solo +/−.  
3. **Selector de catálogo** a pantalla (ruta `cotizaciones/:id/catalogo?cat=Insumos|Equipos`): buscador, filtros, check vs +, stock semáforo, Grabar (cierra y vuelve a Elementos). Equipos con stepper de cantidad.  
4. **Bandeja:** dos listas — “Sin asignar” y “Mis cotizaciones”.

No meter HTTP real. Mock de archivos sigue siendo metadatos.

### Fase 3 — Informes y cierre (cap. 4.3, 4.4.5, 4.4.6)

1. **Informe detallado:** total destacado, desglose Equipos / MO+instalación / Logística, tabla con descripción + categoría (columna “Sistemas” del PDF se mapea a categoría o plantilla; no inventar Clima/Vent si el catálogo no lo tiene).  
2. **Informe final:** preview tipo propuesta (cliente, RUC, proyecto, IVA, validez 15 días, línea de firma) — ampliar `PrintService`.  
3. **Proyectos finalizados:** ruta `/finalizados` o filtro persistente “Enviada/Aprobada” con acción Enviar (log de fecha + correo del cliente). Correo = toast + entrada en `quote.log` hasta que exista API.

Eficiencia “+15%” del PDF no tiene fórmula en el dominio: **no se inventa**. O se omite o se deriva de margen vs piso (documentar la regla con negocio).

### Fase 4 — Pulido de copy/UX del informe

- “Finalizar solicitud” verde vs “Registrar solicitud”.  
- “Exportar PDF” con icono.  
- PNG en adjuntos: el PDF dice PDF/DWG/JPG; la app acepta PNG — dejar JPG/PNG o recortar a lo del informe.  
- Grúa: puede seguir dentro de Logística (un bloque “Logística y transporte” con líneas de grúa). Mant. preventivo: usar plantilla PL-04 / categoría MO, no crear un quinto enum salvo que catálogo lo pida.

### Fuera de este plan (sigue válido, no lo pide el PDF)

Inicio, Analítica, Rendimiento, Plantillas, Compras, Cálculo HVAC, Reajuste, switch de rol.  
Backend / JWT: cuando exista API, mismas pantallas, otros adapters.

## 5. Orden de trabajo concreto (tickets)

1. Dominio Product/Client + repos mock upsert/inactivar  
2. UI Productos alta/edición/búsqueda  
3. UI Clientes alta/edición/búsqueda + aviso correo  
4. Resumen 4 etapas + dos informes (wire a PrintService)  
5. Catálogo picker a ruta propia (insumos y equipos)  
6. Total oscuro + Finalizar en Elementos  
7. Bandeja “mías” + Finalizados + log de envío  
8. Copy botones + recuadro IVA  

Criterio de listo por ticket: `npm run build` exit 0; golden Q-014 intacto; flujo Ventas→solicitud→bandeja→elementos→informe se puede recorrer a mano.

## 6. Qué no hacer

- No copiar textos Perú (RUC 11, +51, Lima).  
- No borrar el motor HVAC para “parecerse más al PDF”.  
- No poner IVA 18 % ni knobs huérfanos del prototipo (`indirectos`, `utilidad`) en la UI.  
- No implementar SMTP real en esta fase.  
- No crear categoría de producto “Grúa” / “Preventivo” sin acuerdo de catálogo; se agrupan en UI.

## 7. Criterio de “alineado”

El sistema está alineado con PY-INF-001 cuando un usuario puede, sin atajos:

1. Dar de alta producto e inactivar.  
2. Dar de alta cliente con RUC y ver el aviso de copia de presupuesto.  
3. Crear solicitud con adjuntos y tipo/prioridad.  
4. Tomar la solicitud en bandeja.  
5. Ver las 4 etapas, armar elementos desde catálogo (insumos y equipos).  
6. Abrir informe detallado e informe final.  
7. Marcar envío al cliente desde finalizados.

El cálculo automático (plantilla → líneas → total $5,357.16) es el cumplimiento del **objetivo** del informe, aunque el PDF no lo detalle.
