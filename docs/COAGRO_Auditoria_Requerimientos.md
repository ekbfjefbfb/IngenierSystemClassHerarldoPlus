# COAGRO · Auditoría de cumplimiento de la consigna

Fecha: 26 de noviembre de 2026  
Fuentes verificadas: PDF oficial de seis páginas de la consigna, DOCX de fase 1, PDF de ocho pantallas, código del prototipo, esquema SQLite y ejecución en Chromium.

## Veredicto

No está cumpliendo el 100 % de la consigna. La base funcional es sólida, pero existen vacíos de persistencia transaccional, administración fiscal, promociones, seguridad y formato de entrega.

| Bloque | Cumple | Parcial | Falta |
|---|---:|---:|---:|
| Requerimientos funcionales RF | 10 | 4 | 0 |
| Requerimientos no funcionales RNF | 3 | 5 | 0 |
| Módulos funcionales | 2 | 4 | 0 |
| Tablas persistentes exigidas | 3 | 0 | 4 |
| DFD, diccionario y navegación | 3 | 1 | 0 |
| Entregables de fase | 2 | 3 | 2 |

## Requerimientos funcionales

| Código | Requisito | Estado | Evidencia real | Vacío o tarea |
|---|---|---|---|---|
| RF-01 | Autenticación de usuarios | Parcial | Login independiente, validación y foco de error. | No hay usuarios, contraseñas, sesión ni rol real. JET-P9VNP9. |
| RF-02 | Apertura de caja | Cumple | Turno, fondo inicial por denominación y terminal. | El turno no se guarda en SQLite. JET-RJWY8F. |
| RF-03 | Registro de ventas | Cumple | POS, búsqueda, carrito, cantidades, ISV y total. | La venta y su detalle no se guardan en SQLite. JET-RJWY8F. |
| RF-04 | Pagos efectivo, ACH, tarjeta y crédito | Cumple | Cuatro métodos y pago combinado con validación de suma. | Referencias simuladas, no pasarela bancaria. |
| RF-05 | CAI, rangos y fechas SAR | Parcial | Factura con CAI, correlativo, fecha límite y QR. | Falta administrar talonarios y validar rango/consumo. JET-5THMMC. |
| RF-06 | ISV 15 %, 18 %, exento y retención 1 % | Cumple | Cálculo automático y desglose fiscal. | Retención informativa; falta criterio fiscal real del cliente. |
| RF-07 | Gestión de productos | Cumple | Alta, edición, precios, stock, categorías y activación. | Ninguno para el alcance del prototipo. |
| RF-08 | Promociones, combos y descuentos por vendedor | Parcial | Campo de promoción y descuento manual. | Sin vigencia, combo ni máximo por vendedor. JET-N8HGZE. |
| RF-09 | Clientes e historial | Cumple | Ficha 360°, búsqueda, historial y alta de cliente. | Historial demostrativo, no derivado de ventas persistentes. JET-RJWY8F. |
| RF-10 | Límites, saldos y vencidos | Cumple | Límite, disponible, saldo, días de mora y alerta. | Sin evaluación crediticia automática. JET-N2T8HD. |
| RF-11 | Abonos y saldos | Cumple | Abono validado, recibo y recálculo en SQLite. | Ninguno para el flujo demostrado. |
| RF-12 | Cierre y arqueo ciego | Cumple | Conteo ciego, revelado, diferencia y cierre. | El cierre no queda persistido. JET-RJWY8F. |
| RF-13 | Comisiones por vendedor | Cumple | Meta, ventas, tasa y liquidación en dashboard. | Datos de demostración, no derivados de ventas. JET-RJWY8F. |
| RF-14 | Dashboard gerencial | Parcial | Brutas, ticket, morosidad, top 10, calor, metas y comisiones. | Faltan netas, margen por línea y datos en tiempo real. JET-WGW2DY. |

## Requerimientos no funcionales

| Código | Requisito | Estado | Evidencia real | Vacío o tarea |
|---|---|---|---|---|
| RNF-01 | Seguridad por rol | Parcial | Login y permisos visuales. | Sin autenticación real ni autorización server-side. JET-P9VNP9. |
| RNF-02 | Integridad | Parcial | SQLite y transacción atómica de instantánea. | Ventas, facturas y turnos no son transaccionales. JET-RJWY8F. |
| RNF-03 | Usabilidad | Cumple | UI/UX auditada, ayuda, foco, ARIA y recuperación de errores. | Ninguno crítico. |
| RNF-04 | Rendimiento | Cumple | Cinco suites, caché, debounce y catálogo progresivo. | Medir en dispositivos físicos antes de producción. |
| RNF-05 | Disponibilidad | Parcial | Respaldo local si la API falla. | Sin PWA, cola offline ni reconciliación. JET-RZNGXE. |
| RNF-06 | Trazabilidad | Parcial | Turno y cajero visibles en la interfaz. | Sin bitácora persistente de operaciones. JET-P9VNP9. |
| RNF-07 | Validación de formularios | Cumple | Mensajes en lenguaje natural y foco al campo inválido. | Mantener validación también en servidor. |
| RNF-08 | Protección de datos | Parcial | CSP, permisos, nosniff y datos de demostración. | Sin roles ni cifrado de datos personales reales. JET-P9VNP9. |

## Módulos obligatorios

| Módulo | Estado | Evidencia | Vacío |
|---|---|---|---|
| 1. POS y turnos | Cumple en interfaz | Apertura, POS, pagos combinados, tickets y arqueo. | Persistencia del turno y la venta. JET-RJWY8F. |
| 2. Facturación SAR | Parcial | Vista previa, CAI visible, ISV, exento, retención y QR. | Talonarios, rangos y consumo correlativo. JET-5THMMC. |
| 3. Catálogo y promociones | Parcial | Tres precios, stock, promoción y descuento. | Vigencia, combos y máximo por vendedor. JET-N8HGZE. |
| 4. CRM y créditos | Parcial | Ficha 360°, historial, crédito, alertas, abonos y estado de cuenta. | Evaluación crediticia y cobranza automatizada. JET-N2T8HD. |
| 5. Comisiones | Cumple en interfaz | Liquidación y metas por vendedor. | Derivar cifras de ventas reales. JET-RJWY8F. |
| 6. Dashboard | Parcial | KPIs, gráfica, cartera, calor, metas, top 10 y comisiones. | Netas, margen por línea y tiempo real. JET-WGW2DY. |

## Base de datos exigida

| Tabla | Estado actual | Acción |
|---|---|---|
| Clientes | Persistente | Correcta para el prototipo. |
| Productos | Persistente | Correcta para el prototipo. |
| TurnosCaja | Solo memoria | Crear tabla y API. JET-RJWY8F. |
| VentasPOS | Solo memoria | Crear encabezado transaccional. JET-RJWY8F. |
| DetalleVentas | Solo memoria | Crear líneas con precio, descuento e ISV. JET-RJWY8F. |
| FacturasFiscalesSAR | Solo memoria | Crear factura, CAI, rango y QR. JET-RJWY8F. |
| CuentasPorCobrar | Persistente | Correcta para abonos y saldos. |

## DFD, diccionario y navegación

| Entregable | Estado | Evidencia |
|---|---|---|
| DFD nivel 0 | Cumple | Imagen 2 del DOCX: cliente, cajero, vendedor, SAR, banco, proveedor, créditos y gerencia. |
| DFD nivel 1 | Cumple | Imagen 3: seis procesos y almacenes D1 a D5. |
| Diccionario de datos | Cumple | Tabla con 19 elementos, tipo, descripción y restricción. |
| Mapa de navegación | Cumple | Imagen 4 del DOCX. |
| Wireframes de baja fidelidad | Parcial | Imagen 5 contiene cuatro pantallas; faltan cuatro para cubrir las ocho obligatorias. JET-TVD6WK. |

## Entregables por fase

| Entregable | Estado | Observación |
|---|---|---|
| Fase 1: documento técnico de 8 a 12 páginas | No cumple formato | El DOCX convertido a PDF tiene 16 páginas. JET-TVD6WK. |
| Fase 1: DFD y diccionario | Cumple | Nivel 0, nivel 1 y 19 elementos. |
| Fase 1: mapa y wireframes | Parcial | Mapa completo; cuatro wireframes de ocho. JET-TVD6WK. |
| Fase 2: prototipo Figma o Balsamiq | No cumple formato | Existe prototipo web funcional, no archivo/enlace Figma o Balsamiq. JET-TVD6WK. |
| Fase 2: enlace público | No verificado | El repositorio GitHub es público; falta confirmar la URL de Render y su salud. JET-TVD6WK. |
| Fase 2: calidad visual y dashboard | Cumple | Cinco suites, contraste AA, responsive y dashboard. |
| Fase 2: documento final y manual | Parcial | README y auditorías existen; falta modelo relacional completo y manual breve consolidado. |
| Fase 2: defensa | En preparación | La guía PDF de esta entrega cubre guion, demostración y preguntas. |

## Rúbrica oficial

| Criterio | Puntos | Riesgo actual | Acción |
|---|---:|---|---|
| Fase 1. Problema y requerimientos | 30 | Documento de 16 páginas supera el máximo de 12; el contenido técnico sí está estructurado. | Ajustar extensión sin perder RF, RNF, problema y objetivos. JET-TVD6WK. |
| Fase 1. Rigor DFD y diccionario | 40 | Bajo. Nivel 0, nivel 1 y 19 elementos están presentes. | Revisar balanceo y notación antes de subir. |
| Fase 1. Mapa y wireframes | 30 | Parcial. Hay mapa y cuatro bocetos de ocho pantallas. | Completar los cuatro faltantes. JET-TVD6WK. |
| Fase 2. Funcionalidad e interactividad | 30 | Alto. El prototipo web es funcional, pero la rúbrica exige Figma/Balsamiq y enlace público. | Migrar o confirmar aceptación del sustituto y publicar URL. JET-TVD6WK. |
| Fase 2. Calidad visual y dashboard | 30 | Bajo. UI responsive, validaciones, modales, ARIA y KPIs. | Mantener evidencia de las cinco suites. |
| Fase 2. Documentación y modelo de datos | 20 | Parcial. Falta modelo relacional completo y manual breve consolidado. | Completar con JET-RJWY8F y la guía PDF. |
| Fase 2. Dominio y defensa | 20 | En preparación. La guía PDF cubre guion, demo y preguntas. | Ensayar y asignar responsables. |

## Orden de ejecución recomendado

1. JET-RJWY8F. Persistencia transaccional y modelo relacional.
2. JET-P9VNP9. Autenticación, roles y bitácora.
3. JET-5THMMC. Talonarios fiscales.
4. JET-N8HGZE. Promociones y descuentos autorizados.
5. JET-WGW2DY. Ventas netas y margen.
6. JET-N2T8HD. Evaluación crediticia y cobranza.
7. JET-RZNGXE. Disponibilidad offline.
8. JET-TVD6WK. Formato Moodle, wireframes, Figma/Balsamiq y URL pública.

## Qué se puede defender sin exagerar

Se puede demostrar un prototipo funcional de POS y CRM con backend SQLite local, cálculo fiscal, pagos combinados, arqueo ciego, cuentas por cobrar, comisiones y dashboard. También se puede defender el análisis DFD, el diccionario y el mapa de navegación del DOCX.

No se debe afirmar que hay autenticación real, integración SAR, persistencia de ventas y facturas, Figma/Balsamiq, cobranza automática ni tiempo real. Esos vacíos tienen tareas JET abiertas y deben presentarse como trabajo pendiente.
