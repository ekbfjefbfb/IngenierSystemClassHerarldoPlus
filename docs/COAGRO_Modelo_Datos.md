# COAGRO · Modelo relacional transaccional

Base: SQLite. Motor: `prototipo/server.py`. Las tablas maestras y transaccionales comparten la misma base.

## Entidades

| Tabla | Clave primaria | Claves foráneas | Contenido |
|---|---|---|---|
| users | id | — | Usuario, hash de contraseña, nombre, rol y estado. |
| sessions | token | user_id → users.id | Sesión y expiración. |
| audit_log | id | user_id → users.id | Acción, entidad, registro, detalle y fecha. |
| products | id | — | Código, barras, categoría, precios, costo, ISV y stock. |
| clients | id | — | Nombre, RTN, teléfono, categoría, límite, saldo, compras y estado. |
| shifts | id | user_id → users.id | Apertura, cierre, fondo, ventas por método, retiros, conteo y diferencia. |
| sales | id | shift_id → shifts.id; client_id → clients.id; seller_id → users.id | Encabezado, bases fiscales, impuesto, descuento y total. |
| sale_items | id | sale_id → sales.id; product_id → products.id | Cantidad, precio, descuento, subtotal y margen. |
| sale_tenders | id | sale_id → sales.id | Método, monto y referencia de cada cobro. |
| fiscal_talonarios | id | — | CAI, rango inicial/final, fecha límite y correlativo actual. |
| invoices | id | sale_id → sales.id; client_id → clients.id; cai_id → fiscal_talonarios.id | Número fiscal, emisión, vencimiento, QR y estado. |
| cxc | id | client_id lógico; doc → invoices.number | Saldo, vencimiento, días de mora y estado. |
| promotions | id | product_id → products.id | Tipo, valor, vigencia, estado y combo JSON. |
| credit_evaluations | id | client_id → clients.id | Score, decisión, motivo y fecha. |
| collection_events | id | client_id → clients.id; invoice_id → invoices.id | Recordatorio, programación, envío y detalle. |

## Relaciones principales

Un usuario abre muchos turnos. Un turno contiene muchas ventas. Una venta tiene muchos detalles y muchos tenders. Cada venta emitida genera una factura. Una factura a crédito genera una cuenta por cobrar. Un producto aparece en muchos detalles. Un cliente tiene muchas ventas, facturas, evaluaciones y eventos de cobranza.

## Transacción de venta

La API `POST /api/sales` ejecuta una sola transacción SQLite:

1. Valida turno abierto, cliente, productos, stock, descuento y pagos.
2. Calcula bases 15 %, 18 %, exento, ISV y total en el servidor.
3. Inserta venta, detalles, tenders y factura.
4. Descuenta stock.
5. Actualiza totales del turno por método.
6. Si hay crédito, actualiza saldo del cliente y crea CxC.
7. Consume el siguiente correlativo del talonario.
8. Registra auditoría.
9. Confirma todo junto o revierte todo si falla.

## Pruebas de integridad

- Venta válida con pago combinado: una venta, dos detalles, dos tenders y una factura.
- Pago insuficiente: HTTP 400, cero ventas y stock sin cambios.
- Turno abierto: persiste al recargar y se restaura desde `activeShift`.
- Cierre: persiste efectivo contado, diferencia, observación y estado `closed`.
- Reinicio: restaura semilla y correlativos sin dejar ventas huérfanas.
