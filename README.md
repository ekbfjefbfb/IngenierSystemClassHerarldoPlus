# IngenierSystemClassHerarldoPlus

Proyecto integrador de **Sistemas de Información (ISC-302)** — Opción B:
Sistema de Punto de Venta (POS), Facturación Electrónica Fiscal y Fidelización (CRM)
para **Comercializadora Agropecuaria y Ferretera de Catacamas (COAGRO)**.

## Contenido

- `prototipo/` — prototipo web interactivo (8 pantallas), backend SQLite y documentación.
  - `index.html`, `styles.css`, `app.js` — front-end responsive, sin dependencias.
  - `server.py` — backend Python (stdlib) con SQLite y API REST local.
  - `README.md` — instrucciones, endpoints y decisiones de UI/UX.
  - `UIUX_AUDIT.md` — auditoría HCI por pantalla, agentes aplicados y evidencia.
- Documentos base del caso de estudio y consigna (PDF/DOCX).

## Ejecutar

```bash
cd prototipo
python3 server.py
# abrir http://localhost:8000
```

Sin servidor también funciona abriendo `prototipo/index.html` (modo local con `localStorage`).

Verificación del backend: `http://localhost:8000/api/health`.
La base de datos se crea automáticamente en `prototipo/data/coagro.db` con datos semilla deterministas.
