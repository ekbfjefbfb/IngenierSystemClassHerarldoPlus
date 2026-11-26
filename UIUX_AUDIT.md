# Auditoría HCI COAGRO POS

Fecha: 25 de noviembre de 2026  
Alcance: 8 pantallas, navegación compartida, modales, formularios, estados vacíos, movimiento, accesibilidad, rendimiento y seguridad.

## Criterios aplicados

| Fuente | Aplicación concreta |
|---|---|
| Ley de Fitts | Acciones principales grandes y cercanas al pulgar; controles de cantidad de 24 × 24; cobro fijo en móvil. |
| Ley de Hick | Una acción primaria por pantalla; catálogo inicial de 8 productos; carga progresiva. |
| Ley de Jakob | Navegación lateral en escritorio, inferior en móvil, buscadores, tablas y modales convencionales. |
| Ley de Miller | Cliente, crédito e historial agrupados; catálogo paginado; resumen fiscal por bloques. |
| Ley de Tesler | ISV, cambio, saldos, morosidad, cuadre y comisiones calculados por el sistema. |
| Efecto estético | Paleta marfil, carbón y cobre; jerarquía consistente; ausencia de azul y verde. |
| Prägnanz | Alineación, espacio en blanco, agrupación y contraste; eliminación de bloques oscuros competidores. |
| Umbral de Doherty | Confirmación de cobro medida en ≈370 ms desde el clic real; búsqueda con 100 ms de debounce. |
| Nielsen 1 | Estado de turno, API, procesamiento, totales y cuadre siempre visibles. |
| Nielsen 2 | Lenguaje comercial: caja, ticket, factura, cliente, cartera y CAI. |
| Nielsen 3 | Cancelar en modales, cerrar turno, ayuda rápida y retorno al login. |
| Nielsen 4 | Botón primario, secundario y destructivo con roles consistentes. |
| Nielsen 5 | Confirmación para vaciar ticket, bloquear crédito y desactivar producto. |
| Nielsen 6 | Búsquedas, filtros, acciones visibles, atajos y ayuda integrada. |
| Nielsen 7 | `/`, `Enter` y `Esc`; carga progresiva; cobro combinado. |
| Nielsen 8 | Una acción dominante; 8 productos iniciales; dashboard cacheado. |
| Nielsen 9 | Errores en lenguaje natural, campo afectado y foco automático. |
| Nielsen 10 | Guía rápida en la barra superior y README técnico. |
| WCAG 2.2 SC 2.5.8 | Objetivos interactivos de al menos 24 × 24 CSS px. |
| Contraste WCAG AA | Texto principal 14.94:1; secundario 5.48:1; acento 5.91:1; aviso 5.18:1; error 5.12:1. |

## Agentes leídos y resultado

| Agente | Resultado |
|---|---|
| detailer | Sin TODO, FIXME, console.log ni debugger; nomenclatura y formato revisados. |
| mobile-expert | Auditoría en 360, 390, 768, 1440 y 844 × 390; cero desbordamiento horizontal y cero objetivos pequeños. |
| empath | Login independiente, guía rápida, confirmaciones positivas y errores recuperables. |
| auditor | Reducida la densidad visual; una acción primaria por pantalla. |
| choreographer | Movimiento de 240–360 ms; curvas físicas; sin animaciones bloqueantes. |
| cleaner | Renders ocultos eliminados; búsquedas con debounce; dashboard con caché. |
| geo-conductor | No aplica: el caso no requiere mapas ni geolocalización. |
| elite-architect | Microdetalles de estado, foco, ARIA, tipografía monoespacio y bordes consistentes. |
| drill-sergeant | Ejecución directa, sin bucles ni iteraciones decorativas. |
| coder-boss | Ediciones dirigidas, lectura previa, sintaxis verificada y pruebas ejecutadas. |
| gatekeeper | 5 suites, salud HTTP, seguridad, performance y compatibilidad verificadas. |
| cartographer | No aplica: no existe flujo geoespacial en el alcance funcional. |
| commissar | Cambios acotados; sin reescrituras masivas innecesarias. |
| scout-web | Fuentes W3C, Nielsen Norman Group y Doherty consultadas. |
| forensic | Hallazgos basados en DOM, estilos computados, código y mediciones reales. |
| hunter | Bugs corregidos: overflow móvil, foco, búsqueda sin acentos, estado oculto y credencial demo. |
| architect | SQLite canónico, API con timeout, caché local y persistencia de datos maestros. |
| sec-ops | PBKDF2, sesiones, roles, bitácora, CSP, permisos, nosniff, anti-clickjacking y validación server-side. |

## Auditoría por pantalla

| Pantalla o sección | Hallazgo | Corrección aplicada | Verificación |
|---|---|---|---|
| Login y apertura | Contraseña demo incrustada; shell visible durante el login; sin estado de conexión. | Entrada independiente, contraseña sin valor secreto, botón «Conectando…», foco al campo inválido y reinicio al volver del cierre. | Ciclo login → apertura → cierre → login solo con mouse. |
| POS | Demasiadas tarjetas, objetivos de 20 px, búsqueda con acentos y espera de cobro alta. | 8 productos iniciales, «Mostrar más», controles de 24 px, búsqueda sin acentos, total anunciado y cobro combinado. | 0 objetivos pequeños; feedback de cobro ≈370 ms. |
| Clientes | Dos acciones primarias competían; búsqueda sin estado vacío accionable. | «Nuevo cliente» secundario; «Nueva venta» primaria; vacío con «Limpiar búsqueda». | Flujo de crédito, bloqueo y cobranza probado. |
| Factura SAR | Desbordamiento horizontal en 360 y 390 px. | Encabezado apilado, tabla con scroll interno y ancho mínimo contenido. | `scrollWidth = innerWidth` en todos los tamaños. |
| Productos | Desactivación inmediata sin confirmación; filtros sin vacío accionable. | Confirmación destructiva, estado vacío y limpieza de filtros. | Confirmación y restauración probadas. |
| Cuentas por cobrar | Resumen dependía de valores fijos; búsqueda podía quedar sin resultado visible. | Cálculo desde SQLite, estados Al corriente/Por vencer/Vencido y vacío accionable. | Abono real verificado en la base: 620 → 520. |
| Cierre de caja | Botón de cierre duplicado en la barra; teoría oculta correctamente. | Botón superior oculto en cierre, retiro parcial, revelado y confirmación con observación obligatoria si procede. | Cuadre correcto y retorno al login comprobados. |
| Dashboard | Reconstrucción completa al volver; animaciones repetidas. | Gráfico y tablas estáticas cacheados; KPIs actualizados sin repetir animación; dona derivada de CxC. | Primer render 55 → 36–38 layouts; repetido 3 layouts. |
| Barra superior | Desbordamiento a 360 px por demasiados controles. | API oculta en móvil, cierre como icono, ayuda accesible y `aria-current`. | 0 desbordamiento horizontal. |
| Modales | Foco podía salir; procesamiento percibido lento. | Foco inicial, trampa de Tab, cancelación y procesamiento de 360 ms. | Foco dentro del modal y feedback menores a 400 ms. |
| Estados vacíos | Pantallas en blanco sin salida. | Mensaje, explicación y botón de limpieza en clientes, productos y CxC. | Tres flujos de recuperación probados. |

## Evidencia de rendimiento

| Medición | Antes | Después |
|---|---:|---:|
| Dashboard, primer render, layouts | 55 | 36–38 |
| Dashboard, primer render, TaskDuration | 0.3162 s | 0.267–0.348 s, variable sin tareas largas |
| Dashboard repetido | No cacheado | 0.1412 s, 3 layouts |
| Búsqueda POS, nodos añadidos | 892 | 262–365 |
| Búsqueda POS, layouts | 16 | 12–14 |
| Tareas largas en dashboard | 0 | 0 |

## Seguridad y calidad

- `node --check` y `py_compile` sin errores.
- Cinco suites de Chromium con cero errores de consola.
- `/health` y `/api/health` responden 200.
- Favicon responde 200.
- Escritura inválida responde 400 sin modificar SQLite.
- Cuerpo JSON limitado a 2 MB.
- CSP, `Permissions-Policy`, `nosniff`, anti-clickjacking y `no-referrer` activos.
- Base de datos generada excluida de Git.

## Límites reales

La autenticación y los roles son reales en el backend local. El QR fiscal es ilustrativo y no hay conexión real con SAR. GitHub Pages publica solo el front-end en modo local. SQLite es efímero en Render sin disco persistente. Los agentes geoespaciales no aplican porque el alcance no incluye mapas.
