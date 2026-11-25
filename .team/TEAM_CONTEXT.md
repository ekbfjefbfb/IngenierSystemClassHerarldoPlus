# JET, Contexto compartido del equipo

> Archivo generado automáticamente por JET. No lo edites a mano.
> Proyecto: **IngenierSystemClassHerarldoPlus**  Actualizado: `2026-11-25T22:16:40.112245822+00:00`

**Resumen:** 0 abiertas, 1 en curso, 0 bloqueadas, 0 completadas, 1 personas

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

- **JET-3R9S92**  Reducir fatiga visual y validar apertura/cierre con mouse — `En curso`  rama `main`
  - Contexto: El usuario reporta que la interfaz actual cansa la vista y quiere que sea elite, sin colores agresivos, con jerarquía clara, entrada de sesión independiente y apertura/cierre de turno operables solo con mouse. Archivos implicados: prototipo/styles.css, prototipo/index.html, prototipo/app.js, prototipo/server.py, prototipo/README.md. Criterio: paleta carbón/cobre neutra sin azul ni verde, contraste accesible, una sol…
  - Prioridad: Alta
  - Archivos sensibles: prototipo/README.md, prototipo/app.js, prototipo/index.html, prototipo/server.py, prototipo/styles.css
  - Último avance: ekbfjefbfb — Paleta cambiada a marfil/carbón/cobre sin azul ni verde. Login separado del shell. Añadido cierre de turno desde la barra superior. Reducida la competencia visual: total y arqueo en superficies suaves, toasts claros limitados a 2, escaneo/nuevo cliente/revelar como acciones secu…

## Bloqueos de archivos y ramas

- **BLOQUEO** `prototipo/README.md` → JET-3R9S92 (responsable ekbfjefbfb, En curso)
- **BLOQUEO** `prototipo/app.js` → JET-3R9S92 (responsable ekbfjefbfb, En curso)
- **BLOQUEO** `prototipo/index.html` → JET-3R9S92 (responsable ekbfjefbfb, En curso)
- **BLOQUEO** `prototipo/server.py` → JET-3R9S92 (responsable ekbfjefbfb, En curso)
- **BLOQUEO** `prototipo/styles.css` → JET-3R9S92 (responsable ekbfjefbfb, En curso)
- **RAMA** `main` → JET-3R9S92 (responsable ekbfjefbfb)

## Completadas recientemente

_Todavía no hay tareas completadas._

## Conversación reciente

_Sin mensajes del equipo._

## Últimos eventos

- `2026-11-25T22:10:34.589741515+00:00`  **EQUIPO**  ekbfjefbfb  ekbfjefbfb se unió al espacio de equipo
- `2026-11-25T22:12:50.535074202+00:00`  **TAREA CREADA**  ekbfjefbfb  JET-3R9S92  creó «Reducir fatiga visual y validar apertura/cierre con mouse» para ekbfjefbfb
- `2026-11-25T22:13:05.786771770+00:00`  **TAREA TOMADA**  ekbfjefbfb  JET-3R9S92  tomó «Reducir fatiga visual y validar apertura/cierre con mouse» y comenzó a trabajar
- `2026-11-25T22:16:40.111817130+00:00`  **AVANCE**  ekbfjefbfb  JET-3R9S92  avanzó «Reducir fatiga visual y validar apertura/cierre con mouse»: Paleta cambiada a marfil/carbón/cobre sin azul ni verde. Login separado del shell. Añadido cierre de turno desde la barra superior. Reducida la competencia visual: total y…

## Equipo

- ekbfjefbfb  id `ekbfjefbfb`  rol **Jefe**  última señal `2026-11-25T22:10:34.589741515+00:00`

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
