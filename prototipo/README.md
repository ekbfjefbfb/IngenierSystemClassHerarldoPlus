# COAGRO POS · Prototipo UI/UX 2026

Prototipo **navegable y funcional** del Sistema de Punto de Venta, Facturación Fiscal SAR y CRM
para COAGRO. Front-end en HTML/CSS/JavaScript puro + backend local en Python (solo stdlib) con SQLite.

## Cómo abrir (recomendado: con backend)

```bash
cd prototipo
python3 server.py
# abrir http://localhost:8000
```

Comprobación: `http://localhost:8000/api/health`. La barra superior muestra **SQLite · API**
cuando el servidor responde; si no, muestra **Modo local**.

También se puede abrir `index.html` con doble clic: funciona con `localStorage` como respaldo,
pero la fuente de verdad es la base de datos cuando el backend está activo.

Probado en Chromium 120 (escritorio 1440×900 y móvil 390×844). Sin errores de consola.

URL pública estática: https://ekbfjefbfb.github.io/IngenierSystemClassHerarldoPlus/<br>
Esa URL funciona en modo local porque GitHub Pages no ejecuta `server.py`. El backend SQLite completo corre en local o Render.

## Credenciales de la demo

Con API activa se usan cuentas reales de demostración: `cajero01`, `vendedor01`, `creditos01`, `gerente01` y `admin`. La contraseña de demo es `demo` y puede cambiarse con `COAGRO_DEMO_PASSWORD`. Las contraseñas se almacenan con PBKDF2 y las sesiones expiran en 8 horas. Al abrir `index.html` sin backend se mantiene el acceso simulado local.
Tras ingresar, registre el **fondo inicial** con los steppers y presione **Abrir turno**.

## 8 pantallas y qué simula cada control

| # | Pantalla | Interacciones funcionales |
|---|---|---|
| 1 | Inicio + apertura de caja | Validación de credenciales, mostrar/ocultar contraseña, desglose por denominación con total en vivo, apertura de turno. |
| 2 | Terminal POS | Búsqueda predictiva, filtros por categoría, steppers, descuento con límite, ISV 15 % / 18 % / exento automático, 4 métodos de pago, **cobro combinado** (dividir en dos métodos con validación de suma), modal de cambio, escaneo simulado, atajos `/` y `Enter`, barra fija de cobrar en móvil. |
| 3 | Ficha 360° del cliente | Búsqueda, KPIs, barra de uso de crédito, alerta por mora, historial, botón «Nueva venta» (carga cliente al POS), cobranza y bloqueo por mora, alta de clientes. |
| 4 | Factura fiscal SAR | Comprobante con CAI, correlativo, fecha límite, desglose gravado/exento, ISV, retención 1 %, descuento, QR generado en el navegador, emisión con estado «Emitida y reportada» e impresión (`Ctrl+P`). |
| 5 | Productos y precios | Tabla filtrable, 3 listas de precios, stock, promociones, activar/desactivar, editor con validaciones y creación de productos. |
| 6 | Cuentas por cobrar | Resumen de cartera derivado de los datos, pestañas Vigentes/Vencidas, búsqueda, registrar abono con validación (`0 < abono ≤ saldo`), recibo de dinero y recálculo automático. |
| 7 | Cierre y arqueo ciego | Conteo por denominación **sin ver el teórico**, **registro de retiros parciales** con motivo, botón «Revelar cuadre», diferencia, aviso al supervisor si supera L 50, observación obligatoria en ese caso y cierre de turno. |
| 8 | Dashboard | KPIs animados, gráfica de líneas con selector de periodo, dona de cartera calculada desde CxC, mapa de calor, metas, **liquidación de comisiones por vendedor** (tasa por cumplimiento de meta) y top 10. |

## Decisiones de UI/UX aplicadas (referencias 2026)

- **Minimalismo con propósito:** una sola acción principal por pantalla, jerarquía tipográfica clara.
- **Mobile-first y zona del pulgar:** navegación inferior, botón **Cobrar** fijo sobre la barra inferior, targets ≥ 44 px y formularios cortos.
- **Movimiento con intención:** transiciones de pantalla, entrada escalonada de tarjetas, contadores, trazo de gráfica, ripple, modales con spring, estados «Procesando…» breves para generar confianza. Todo respeta `prefers-reduced-motion`.
- **Alta densidad donde importa:** tablas y ticket compactos con cifras monoespacio alineadas (tabular figures).
- **Accesibilidad:** foco visible y automático al abrir modal, *focus trap* (Tab no sale del diálogo), `aria-pressed` en chips/pestañas, `aria-label`, contraste AA, navegación por teclado y `Esc` para cerrar modales descartables.
- **Estados vacíos accionables:** búsquedas sin resultados muestran mensaje y botón «Limpiar» en clientes, productos y CxC.
- **Paleta:** marfil, carbón cálido y cobre; sin azul ni verde. Superficies claras, contraste alto y un solo acento para reducir la fatiga visual.
- **Entrada independiente:** el login no muestra el shell. Al abrir turno entra al POS; el botón «Cerrar turno» de la barra superior lleva al arqueo y, al confirmar, regresa al login.
- **Rendimiento:** catálogo inicial de 8 productos con carga progresiva, búsquedas con *debounce* e ignoración de acentos, dashboard con caché de gráficos y tablas estáticas, sin renders ocultos y sin `backdrop-filter` en móvil.
- **Disponibilidad:** service worker, manifiesto PWA, lectura offline y cola de ventas con reconciliación e idempotencia al reconectar.
- **Ayuda integrada:** guía rápida y atajos desde la barra superior. Auditoría detallada en `UIUX_AUDIT.md`.
- **Defensa:** auditoría de consigna en `../docs/COAGRO_Auditoria_Requerimientos.md`, modelo relacional en `../docs/COAGRO_Modelo_Datos.md` y guía PDF en `../docs/COAGRO_Guia_Defensa.pdf`.

## Backend y datos

`server.py` crea `data/coagro.db` con una semilla determinista (14 productos, 6 clientes, 6 cuentas
por cobrar y correlativos fijos) y expone:

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/state` | Estado canónico desde SQLite |
| POST | `/api/login` | Autenticación PBKDF2 y creación de sesión |
| POST | `/api/logout` | Cierre de sesión |
| GET | `/api/me` | Usuario de la sesión activa |
| GET | `/api/audit` | Bitácora para admin o gerente |
| GET | `/api/dashboard?range=hoy|semana|mes` | Ventas brutas/netas, ticket, margen, series y top 10 |
| PUT | `/api/state` | Reemplaza datos maestros en una transacción atómica y validada |
| POST | `/api/reset` | Restaura la semilla original |
| POST | `/api/shifts/open` | Abre turno con fondo inicial |
| POST | `/api/shifts/:id/withdraw` | Registra retiro parcial |
| POST | `/api/shifts/:id/close` | Cierra turno con conteo y diferencia |
| POST | `/api/sales` | Venta transaccional con detalles, tenders y factura |
| POST | `/api/talonarios` | Alta de CAI, rango y fecha límite |
| PUT | `/api/talonarios/:id` | Edición de talonario y correlativo |
| POST | `/api/promotions` | Alta de oferta temporal o combo |
| PUT | `/api/promotions/:id` | Edición de promoción |
| POST | `/api/seller-limits` | Límite de descuento por vendedor |
| POST | `/api/credit/evaluate` | Score crediticio explicable |
| POST | `/api/collections/run` | Generación y registro de recordatorios |
| GET | `/api/health` o `/health` | Estado del servidor (compatible con Render) |

Validación del servidor: ids únicos, importes no negativos, ISV en {0, 15, 18}, cuerpo JSON máximo 2 MB.
Una escritura inválida responde `400` y **no modifica la base**. Se envían cabeceras CSP, `nosniff`,
anti-clickjacking y `Permissions-Policy`. Cada cambio de catálogo, CRM o cartera se sincroniza a
SQLite (diferido ~60 ms) y la interfaz aplica el estado canónico devuelto. El escaneo y los códigos
de producto son deterministas, no aleatorios.

La sesión de caja (turno, carrito y ticket) es volátil por diseño. Para reiniciar: avatar →
**Reiniciar datos** → confirmar, o `curl -X POST http://localhost:8000/api/reset`.

Código original construido para este proyecto; no se reutilizó código de terceros.
