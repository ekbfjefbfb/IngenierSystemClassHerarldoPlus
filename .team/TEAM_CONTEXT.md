# JET, Contexto compartido del equipo

> Archivo generado automáticamente por JET. No lo edites a mano.
> Proyecto: **IngenierSystemClassHerarldoPlus**  Actualizado: `2026-11-26T03:52:14.332664019+00:00`

**Resumen:** 7 abiertas, 1 en curso, 0 bloqueadas, 5 completadas, 1 personas

## Reglas obligatorias para agentes de IA

1. Antes de tocar código, ejecuta `.team/bin/jet status` (o `jet status`) y lee tu bandeja local.
2. Trabaja únicamente en tareas asignadas a tu identidad local. Si no tienes tareas, pide instrucciones; no inventes trabajo.
3. Actúa como un compañero senior: entiende, planifica, verifica con pruebas y revisa tu diff. No declares terminado sin evidencia.
4. Respeta los archivos y ramas bloqueados por otras personas. Si necesitas uno, coordina primero.
5. Registra el avance con `jet log <ID> "nota"` y cierra con `jet done <ID> --note "..."`.
6. No edites `.team/state.json` ni este archivo manualmente. Usa siempre el CLI. JET sincroniza el estado automáticamente.
7. Antes de crear código o una rama, revisa las tareas completadas para no duplicar trabajo.
8. Asignación a colaboradores: Cuando crees tareas para tus compañeros, aparecen en el listado de ese colaborador. Tu bandeja personal (`jet status`) solo muestra tareas asignadas a ti; es normal que esté en 0 si creaste tareas para otros. No consideres esto un error.
9. Cero dudas al crear: Si recibes nombres o temas, crea las tareas de inmediato con `jet create --to ...`. No pidas confirmaciones previas.

## Tareas activas

### ekbfjefbfb

- **JET-RJWY8F**  Persistir turnos, ventas, detalles y facturas en SQLite — `En curso`  rama `main`
  - Contexto: La consigna exige TurnosCaja, VentasPOS, DetalleVentas y FacturasFiscalesSAR. Hoy solo productos, clientes y CxC son persistentes; turno, carrito y factura viven en memoria. Crear tablas y API transaccional ACID, modelo relacional consolidado y pruebas de recarga/rollback. Verificar que una venta con pago combinado genere turno, venta, detalle, factura y CxC si aplica, sin duplicados.
  - Prioridad: Alta
  - Archivos sensibles: docs/COAGRO_Modelo_Datos.md, prototipo/app.js, prototipo/server.py
- **JET-5THMMC**  Administrar talonarios fiscales CAI, rangos y fechas límite — `Abierta`  rama `sin rama`
  - Contexto: RF-05 exige control y administración de talonarios autorizados por SAR. La factura muestra CAI y fecha límite, pero no hay alta/edición de talonarios ni validación de rango correlativo. Implementar catalogación de CAI, rango inicial/final, fecha límite, consumo correlativo y bloqueo por vencimiento/agotamiento. Verificar emisión dentro y fuera de rango.
  - Prioridad: Alta
  - Archivos sensibles: prototipo/app.js, prototipo/index.html, prototipo/server.py, prototipo/styles.css
- **JET-N8HGZE**  Implementar promociones temporales, combos y descuentos por vendedor — `Abierta`  rama `sin rama`
  - Contexto: RF-08 exige ofertas temporales, combos y descuentos máximos por vendedor. Hoy la promoción es texto libre y el descuento solo se limita al subtotal. Implementar vigencia, tipo de promoción, combo y máximo por vendedor con validación en POS. Verificar promoción vencida, combo y descuento no autorizado.
  - Prioridad: Alta
  - Archivos sensibles: prototipo/app.js, prototipo/index.html, prototipo/server.py, prototipo/styles.css
- **JET-WGW2DY**  Agregar ventas netas y margen por línea al dashboard — `Abierta`  rama `sin rama`
  - Contexto: El módulo 6 exige ventas brutas vs. netas y margen por línea comercial. El dashboard muestra brutas, ticket, morosidad, top 10 y metas, pero no netas ni margen por línea. Calcular desde ventas persistentes, mostrar comparación y margen por categoría con tooltip y filtro de periodo. Verificar cuadre bruto = neto + descuentos/devoluciones según definición documentada.
  - Prioridad: Alta
  - Archivos sensibles: prototipo/app.js, prototipo/index.html, prototipo/server.py, prototipo/styles.css
- **JET-P9VNP9**  Implementar autenticación, roles y trazabilidad real — `Abierta`  rama `sin rama`
  - Contexto: RNF-01, RNF-06 y RNF-08 requieren seguridad por rol, trazabilidad y protección de datos. Hoy el login es simulado, el usuario es fijo y no hay bitácora. Implementar usuarios, hash de contraseña, sesión, roles cajero/vendedor/créditos/gerente/admin y auditoría de operaciones. Verificar acceso denegado, cambio de turno y registro de quién/cuándo.
  - Prioridad: Alta
  - Archivos sensibles: prototipo/app.js, prototipo/index.html, prototipo/requirements.txt, prototipo/server.py, prototipo/styles.css
- **JET-TVD6WK**  Cerrar cumplimiento de entregables Moodle y Figma/Balsamiq — `Abierta`  rama `sin rama`
  - Contexto: La consigna pide documento fase 1 de 8–12 páginas; el DOCX actual tiene 16. Pide prototipo Figma/Balsamiq con enlace público; existe prototipo web pero no enlace Figma/Balsamiq ni URL pública verificada. Pide wireframes de baja fidelidad de las pantallas clave; hay 4 bocetos. Ajustar documento, completar bocetos o documentar sustitución aceptada, publicar URL y adjuntar evidencia. Bloqueo: confirmar con el docente s…
  - Prioridad: Alta
  - Archivos sensibles: README.md, UNIVERSIDAD CRISTIANA EVANGÉLICA NUEVO MILENIO(1).docx, docs
- **JET-N2T8HD**  Completar evaluación crediticia y cobranza automatizada — `Abierta`  rama `sin rama`
  - Contexto: El CRM tiene límite, saldo, historial y alertas, pero no evaluación de crédito ni cobranza automatizada. Implementar score/reglas explicables, autorización de venta a crédito, programación de recordatorios y registro automático de intentos. Verificar cliente apto, moroso y recordatorio generado.
  - Archivos sensibles: prototipo/app.js, prototipo/index.html, prototipo/server.py, prototipo/styles.css
- **JET-RZNGXE**  Mejorar disponibilidad y respaldo operativo — `Abierta`  rama `sin rama`
  - Contexto: RNF-05 exige reducir interrupciones. Hoy hay fallback a localStorage, pero no hay service worker, cola de sincronización ni recuperación completa de turno. Implementar PWA/offline para lectura, cola de escrituras y reconciliación al volver la API. Verificar venta offline, reconexión y ausencia de duplicados.
  - Archivos sensibles: prototipo/app.js, prototipo/index.html, prototipo/server.py, prototipo/styles.css, prototipo/sw.js

## Bloqueos de archivos y ramas

- **BLOQUEO** `docs/COAGRO_Modelo_Datos.md` → JET-RJWY8F (responsable ekbfjefbfb, En curso)
- **BLOQUEO** `prototipo/app.js` → JET-RJWY8F (responsable ekbfjefbfb, En curso)
- **BLOQUEO** `prototipo/server.py` → JET-RJWY8F (responsable ekbfjefbfb, En curso)
- **RAMA** `main` → JET-RJWY8F (responsable ekbfjefbfb)

## Completadas recientemente

- **JET-LTYA4A**  Auditar consigna y generar PDF de defensa  completada por ekbfjefbfb  rama `main`  commit `82bef43`
  - Resultado: Completado. Auditoría contra PDF oficial, DOCX y código: 10/14 RF, 3/8 RNF, 3/7 tablas persistentes; entregables y rúbrica evaluados. Creadas 8 tareas pendientes JET-RJWY8F, JET-P9VNP9, JET-5THMMC, JET-N8HGZE, JET-WGW2DY, JET-N2T8HD, JET-RZNGXE y JET-TVD6WK. PDF de 23 páginas co…
- **JET-8D88LZ**  Auditoría HCI por pantalla y aplicación de los 18 agentes  completada por ekbfjefbfb  rama `main`  commit `e0012ac`
  - Resultado: Completado y validado. Leídos los 18 agentes y aplicado lo procedente a web; agentes geoespaciales marcados no aplicables. Auditoría por 8 pantallas y secciones en UIUX_AUDIT.md. Corregidos overflow móvil, targets WCAG 2.2, contraste AA, credencial demo, foco, ayuda, confirmacio…
- **JET-LPSNR9**  Aligerar rendimiento y densidad visual de la interfaz  completada por ekbfjefbfb  rama `main`  commit `ea33582`
  - Resultado: Completado y validado. Catálogo progresivo de 8, búsquedas con debounce y sin acentos, dashboard cacheado, renders ocultos eliminados, animaciones/sombras reducidas y blur retirado en móvil. Métricas: dashboard 55→36-38 layouts y 0.316→0.267-0.273 s; repetido 0.141 s/3 layouts; …
- **JET-WP7RDV**  Pulido final de producción y accesibilidad  completada por ekbfjefbfb  rama `main`  commit `53bc88b`
  - Resultado: Completado y validado. Pulido de producción: favicon y metadatos, ARIA, arranque seguro, timeout/aborto API, CSP y Permissions-Policy, límite de cuerpo, hover táctil y contraste preferido. Pruebas: 4 suites Chromium 0 errores, /health 200, favicon 200, ciclo mouse login-abrir-ce…
- **JET-3R9S92**  Reducir fatiga visual y validar apertura/cierre con mouse  completada por ekbfjefbfb  rama `main`  commit `5a716f3`
  - Resultado: Completado y validado. Paleta marfil/carbón/cobre sin azul ni verde, tokens semánticos, login independiente, cierre de turno desde barra superior, ciclo abrir/cerrar solo con mouse, superficies suaves y una sola acción primaria por pantalla. Pruebas: 4 suites Chromium con 0 erro…

## Conversación reciente

_Sin mensajes del equipo._

## Últimos eventos

- `2026-11-25T21:30:27+00:00`  **GIT**  ekbfjefbfb  7a5be329: COAGRO POS: prototipo UI/UX con backend SQLite y documentacion del proyecto
- `2026-11-25T21:34:49+00:00`  **GIT**  ekbfjefbfb  22c1dd72: Backend compatible con Render: usar PORT y escuchar en 0.0.0.0
- `2026-11-25T21:35:25+00:00`  **GIT**  ekbfjefbfb  ab74c02d: Añadir requirements.txt vacío para build de Python en Render
- `2026-11-25T22:10:34.589741515+00:00`  **EQUIPO**  ekbfjefbfb  ekbfjefbfb se unió al espacio de equipo
- `2026-11-25T22:12:50.535074202+00:00`  **TAREA CREADA**  ekbfjefbfb  JET-3R9S92  creó «Reducir fatiga visual y validar apertura/cierre con mouse» para ekbfjefbfb
- `2026-11-25T22:13:05.786771770+00:00`  **TAREA TOMADA**  ekbfjefbfb  JET-3R9S92  tomó «Reducir fatiga visual y validar apertura/cierre con mouse» y comenzó a trabajar
- `2026-11-25T22:16:40.111817130+00:00`  **AVANCE**  ekbfjefbfb  JET-3R9S92  avanzó «Reducir fatiga visual y validar apertura/cierre con mouse»: Paleta cambiada a marfil/carbón/cobre sin azul ni verde. Login separado del shell. Añadido cierre de turno desde la barra superior. Reducida la competencia visual: total y…
- `2026-11-25T22:31:06+00:00`  **RAMA**  ekbfjefbfb  rama main (5a716f31)
- `2026-11-25T22:31:06+00:00`  **RAMA**  ekbfjefbfb  rama origin/main (5a716f31)
- `2026-11-25T22:31:06+00:00`  **GIT**  ekbfjefbfb  5a716f31: UI marfil-carbon-cobre, login independiente y cierre de turno directo
- `2026-11-25T22:31:24.651628669+00:00`  **AVANCE**  ekbfjefbfb  JET-3R9S92  avanzó «Reducir fatiga visual y validar apertura/cierre con mouse»: Validación completa: 4 suites en Chromium con 0 errores de consola; /health responde 200 con cabeceras de seguridad; ciclo mouse login→abrir→cerrar→login OK; SQLite verifi…
- `2026-11-25T22:31:41.101661823+00:00`  **COMPLETADA**  ekbfjefbfb  JET-3R9S92  completó «Reducir fatiga visual y validar apertura/cierre con mouse», rama main, commit 5a716f3
- `2026-11-25T22:38:50.060926917+00:00`  **TAREA CREADA**  ekbfjefbfb  JET-WP7RDV  creó «Pulido final de producción y accesibilidad» para ekbfjefbfb
- `2026-11-25T22:39:02.071687228+00:00`  **TAREA TOMADA**  ekbfjefbfb  JET-WP7RDV  tomó «Pulido final de producción y accesibilidad» y comenzó a trabajar
- `2026-11-25T22:45:38.578654909+00:00`  **AVANCE**  ekbfjefbfb  JET-WP7RDV  avanzó «Pulido final de producción y accesibilidad»: Pulido final aplicado y validado: favicon, meta theme-color y descripción, aria-current/aria-live/aria-label, login bloqueado durante arranque, API con AbortController y timeout de 5 s, …
- `2026-11-25T22:45:52.331844535+00:00`  **COMPLETADA**  ekbfjefbfb  JET-WP7RDV  completó «Pulido final de producción y accesibilidad», rama main, commit 53bc88b
- `2026-11-25T23:03:22.901699644+00:00`  **TAREA CREADA**  ekbfjefbfb  JET-LPSNR9  creó «Aligerar rendimiento y densidad visual de la interfaz» para ekbfjefbfb
- `2026-11-25T23:03:43.828755925+00:00`  **TAREA TOMADA**  ekbfjefbfb  JET-LPSNR9  tomó «Aligerar rendimiento y densidad visual de la interfaz» y comenzó a trabajar
- `2026-11-25T23:18:29.499356167+00:00`  **AVANCE**  ekbfjefbfb  JET-LPSNR9  avanzó «Aligerar rendimiento y densidad visual de la interfaz»: Optimización validada. Catálogo inicial 8 con carga progresiva, debounce de búsquedas, búsqueda sin acentos, caché de gráfico/tablas del dashboard, renders ocultos eliminados,…
- `2026-11-25T23:18:54.253239789+00:00`  **COMPLETADA**  ekbfjefbfb  JET-LPSNR9  completó «Aligerar rendimiento y densidad visual de la interfaz», rama main, commit ea33582
- `2026-11-25T23:20:16.660266946+00:00`  **TAREA CREADA**  ekbfjefbfb  JET-8D88LZ  creó «Auditoría HCI por pantalla y aplicación de los 18 agentes» para ekbfjefbfb
- `2026-11-25T23:20:31.529984123+00:00`  **TAREA TOMADA**  ekbfjefbfb  JET-8D88LZ  tomó «Auditoría HCI por pantalla y aplicación de los 18 agentes» y comenzó a trabajar
- `2026-11-25T23:47:47.873120314+00:00`  **AVANCE**  ekbfjefbfb  JET-8D88LZ  avanzó «Auditoría HCI por pantalla y aplicación de los 18 agentes»: Auditoría HCI aplicada. Corregidos overflow de factura y barra superior en 360/390, objetivos pequeños, credencial demo, foco de error, confirmación de desactivación, ayud…
- `2026-11-25T23:48:14.373625555+00:00`  **COMPLETADA**  ekbfjefbfb  JET-8D88LZ  completó «Auditoría HCI por pantalla y aplicación de los 18 agentes», rama main, commit e0012ac
- `2026-11-26T03:34:27.334919365+00:00`  **TAREA CREADA**  ekbfjefbfb  JET-LTYA4A  creó «Auditar consigna y generar PDF de defensa» para ekbfjefbfb

## Equipo

- ekbfjefbfb  id `ekbfjefbfb`  rol **Jefe**  última señal `2026-11-25T22:32:17.009768279+00:00`

## CLI JET

```bash
.team/bin/team status --json        # mi bandeja + bloqueos del equipo
.team/bin/team list --all --json    # todas las tareas y estado
.team/bin/team create --to "Nombre" --title "..." --context "..." --branch "feat/..." --files "a,b"
.team/bin/team take JET-XXXX        # empezar una tarea asignada a mí
.team/bin/team log JET-XXXX "avance"
.team/bin/team done JET-XXXX --note "resultado" --pr "https://..."
.team/bin/team sync                  # forzar sincronización con GitHub
```

_La sincronización de JET usa una rama dedicada `team-sync`; la rama de trabajo nunca se modifica._
