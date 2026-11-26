# COAGRO · Auditoría de cumplimiento de la consigna

Fecha: 26 de noviembre de 2026  
Fuentes verificadas: PDF oficial de seis páginas, DOCX de fase 1, PDF de ocho pantallas, código, SQLite, pruebas en Chromium y repositorio GitHub.

## Veredicto actual

Los requerimientos funcionales, no funcionales, módulos y tablas ya están implementados en el prototipo. Queda un bloqueo externo de formato: la consigna exige Figma o Balsamiq y todavía no existe un archivo o enlace en esas herramientas.

| Bloque | Cumple | Parcial | Falta |
|---|---:|---:|---:|
| Requerimientos funcionales RF | 14 | 0 | 0 |
| Requerimientos no funcionales RNF | 8 | 0 | 0 |
| Módulos funcionales | 6 | 0 | 0 |
| Tablas persistentes exigidas | 7 | 0 | 0 |
| DFD, diccionario, navegación y wireframes | 4 | 0 | 0 |
| Entregables de fase | 5 | 1 | 0 |

## Requerimientos funcionales

| Código | Requisito | Estado | Evidencia |
|---|---|---|---|
| RF-01 | Autenticación | Cumple | PBKDF2, sesiones de 8 h, roles y bitácora. |
| RF-02 | Apertura de caja | Cumple | Turno persistente, fondo por denominación y terminal. |
| RF-03 | Registro de ventas | Cumple | Venta, detalle, promociones, stock e ISV en SQLite. |
| RF-04 | Pagos combinados | Cumple | Efectivo, ACH, tarjeta, crédito y división en dos métodos. |
| RF-05 | CAI, rangos y fechas SAR | Cumple | Administración de talonarios y bloqueo por rango/vencimiento. |
| RF-06 | ISV y retención | Cumple | 15 %, 18 %, exento y retención informativa del 1 %. |
| RF-07 | Productos | Cumple | Alta, edición, precios, costo, stock y activación. |
| RF-08 | Promociones y descuentos | Cumple | Vigencia, porcentaje, monto, combo y límite por vendedor. |
| RF-09 | Clientes e historial | Cumple | Ficha 360°, RTN, compras y ventas persistentes. |
| RF-10 | Créditos | Cumple | Límite, saldo, disponible, score y facturas vencidas. |
| RF-11 | Abonos | Cumple | Abono validado, recibo y saldo actualizado. |
| RF-12 | Cierre y arqueo | Cumple | Conteo ciego, retiros, diferencia y cierre persistente. |
| RF-13 | Comisiones | Cumple | Metas, ventas, tasa y liquidación por vendedor. |
| RF-14 | Dashboard | Cumple | Brutas/netas, ticket, margen por línea, top 10 y morosidad. |

## Requerimientos no funcionales

| Código | Requisito | Estado | Evidencia |
|---|---|---|---|
| RNF-01 | Seguridad por rol | Cumple | Autorización en API y navegación; usuarios y sesiones reales. |
| RNF-02 | Integridad | Cumple | Venta transaccional ACID, validación server-side y rollback. |
| RNF-03 | Usabilidad | Cumple | UI/UX auditada, ayuda, foco, ARIA y recuperación. |
| RNF-04 | Rendimiento | Cumple | Cinco suites, caché, debounce y catálogo progresivo. |
| RNF-05 | Disponibilidad | Cumple | PWA, lectura offline, cola y reconciliación idempotente. |
| RNF-06 | Trazabilidad | Cumple | Bitácora de login, estado, turno, venta, crédito y cobranza. |
| RNF-07 | Validación | Cumple | Mensajes en lenguaje natural y foco al campo inválido. |
| RNF-08 | Protección de datos | Cumple | CSP, permisos, sesión, hash, roles y datos demo. |

## Módulos y base de datos

| Módulo | Estado | Evidencia |
|---|---|---|
| POS y turnos | Cumple | Apertura, venta, pagos combinados, tickets, retiros y arqueo. |
| Facturación SAR | Cumple | Talonarios, CAI, rango, fecha, ISV, exento, retención y QR ilustrativo. |
| Catálogo y promociones | Cumple | Tres precios, stock, vigencia, combos y descuentos autorizados. |
| CRM y créditos | Cumple | Ficha 360°, score, cupo, alertas, abonos y cobranza automática. |
| Comisiones | Cumple | Liquidación y métricas por vendedor. |
| Dashboard | Cumple | Datos persistentes, netas, margen, cartera, calor, metas y top 10. |

| Tabla | Estado |
|---|---|
| Clientes | Persistente |
| Productos | Persistente |
| TurnosCaja | Persistente |
| VentasPOS | Persistente |
| DetalleVentas | Persistente |
| FacturasFiscalesSAR | Persistente |
| CuentasPorCobrar | Persistente |

## DFD y entregables

| Entregable | Estado | Evidencia |
|---|---|---|
| Documento fase 1 de 8 a 12 páginas | Cumple | `docs/COAGRO_Fase1_Compacta.pdf` tiene 12 páginas. |
| DFD nivel 0 y nivel 1 | Cumple | Imágenes 2 y 3 del DOCX original, incluidas en el documento compacto. |
| Diccionario de datos | Cumple | 19 elementos con tipo y restricción. |
| Mapa y wireframes | Cumple | Mapa completo y ocho wireframes en `docs/wireframes/`. |
| Prototipo funcional | Cumple | Web navegable con backend SQLite y PWA. |
| Figma o Balsamiq | Pendiente externo | No existe cuenta o archivo en esas herramientas. |
| Enlace público | Cumple para web estática | https://ekbfjefbfb.github.io/IngenierSystemClassHerarldoPlus/ |
| Calidad visual y dashboard | Cumple | Cinco suites, contraste AA, responsive y KPIs reales. |
| Modelo y manual | Cumple | `docs/COAGRO_Modelo_Datos.md` y `docs/COAGRO_Guia_Defensa.pdf`. |
| Defensa | Preparado | Guion por integrante, demostración y preguntas en el PDF. |

## Rúbrica oficial

| Criterio | Puntos | Estado |
|---|---:|---|
| F1. Problema y requerimientos | 30 | Documento compacto de 12 páginas con RF y RNF completos. |
| F1. DFD y diccionario | 40 | Nivel 0, nivel 1 y 19 elementos. |
| F1. Mapa y wireframes | 30 | Mapa y ocho bocetos. |
| F2. Funcionalidad e interactividad | 30 | Web funcional y pública; falta convertir o replicar en Figma/Balsamiq. |
| F2. Calidad visual y dashboard | 30 | Responsive, validaciones, modales, ARIA y KPIs persistentes. |
| F2. Documentación y modelo | 20 | Modelo relacional, diccionario y manual de defensa. |
| F2. Dominio y defensa | 20 | Guía PDF lista para ensayo. |

## Tareas JET ejecutadas

| ID | Resultado |
|---|---|
| JET-RJWY8F | Persistencia transaccional de turnos, ventas, detalles, tenders y facturas. |
| JET-P9VNP9 | Autenticación, roles, sesiones y bitácora. |
| JET-5THMMC | Talonarios CAI, rangos y fechas. |
| JET-N8HGZE | Promociones, combos y límites de descuento. |
| JET-N2T8HD | Evaluación crediticia y cobranza automatizada. |
| JET-WGW2DY | Ventas netas y margen por línea. |
| JET-RZNGXE | PWA, cola offline y reconciliación. |
| JET-TVD6WK | Documento compacto, wireframes y URL pública listos; Figma/Balsamiq bloqueado por cuenta externa. |

## Límites reales

La factura y el QR son ilustrativos; no existe integración SAR real. Las pasarelas bancarias están simuladas. GitHub Pages publica solo el front-end en modo local; el backend completo se ejecuta en local o Render. SQLite es efímero en Render sin disco persistente. Figma/Balsamiq sigue pendiente hasta disponer de cuenta y aceptación del docente.
