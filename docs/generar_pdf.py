#!/usr/bin/env python3
from pathlib import Path
from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image,
    PageBreak, KeepTogether, HRFlowable
)

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "docs" / "assets"
OUT = ROOT / "docs" / "COAGRO_Guia_Defensa.pdf"

pdfmetrics.registerFont(TTFont("DejaVu", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("DejaVu-Mono", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"))

INK = colors.HexColor("#231E1A")
MUTED = colors.HexColor("#6E6055")
ACCENT = colors.HexColor("#9C4F22")
ACCENT_SOFT = colors.HexColor("#F6E7D8")
CANVAS = colors.HexColor("#F7F3EE")
LINE = colors.HexColor("#E4DBD0")
WHITE = colors.white

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleCO", fontName="DejaVu-Bold", fontSize=28, leading=33, textColor=INK, spaceAfter=10))
styles.add(ParagraphStyle(name="SubtitleCO", fontName="DejaVu", fontSize=13, leading=18, textColor=MUTED, spaceAfter=12))
styles.add(ParagraphStyle(name="H1CO", fontName="DejaVu-Bold", fontSize=18, leading=22, textColor=INK, spaceBefore=6, spaceAfter=10))
styles.add(ParagraphStyle(name="H2CO", fontName="DejaVu-Bold", fontSize=12.5, leading=16, textColor=ACCENT, spaceBefore=10, spaceAfter=6))
styles.add(ParagraphStyle(name="BodyCO", fontName="DejaVu", fontSize=9.2, leading=13.2, textColor=INK, spaceAfter=7))
styles.add(ParagraphStyle(name="SmallCO", fontName="DejaVu", fontSize=7.8, leading=10.8, textColor=MUTED, spaceAfter=5))
styles.add(ParagraphStyle(name="CellCO", fontName="DejaVu", fontSize=7.4, leading=10, textColor=INK))
styles.add(ParagraphStyle(name="CellBoldCO", fontName="DejaVu-Bold", fontSize=7.4, leading=10, textColor=INK))
styles.add(ParagraphStyle(name="CellHeadCO", fontName="DejaVu-Bold", fontSize=7.4, leading=10, textColor=WHITE))
styles.add(ParagraphStyle(name="MonoCO", fontName="DejaVu-Mono", fontSize=7.6, leading=10.5, textColor=INK, backColor=colors.HexColor("#F2EDE6"), borderPadding=5, spaceAfter=7))
styles.add(ParagraphStyle(name="CalloutCO", fontName="DejaVu-Bold", fontSize=9.2, leading=13, textColor=ACCENT, backColor=ACCENT_SOFT, borderPadding=8, spaceBefore=6, spaceAfter=10))
styles.add(ParagraphStyle(name="CoverMetaCO", fontName="DejaVu", fontSize=10.5, leading=16, textColor=INK, alignment=TA_CENTER))

PAGE_W, PAGE_H = A4
MARGIN = 16 * mm
CONTENT_W = PAGE_W - 2 * MARGIN


def P(text, style="BodyCO"):
    return Paragraph(text, styles[style])


def img(path, max_w=CONTENT_W, max_h=150 * mm):
    with PILImage.open(path) as im:
        iw, ih = im.size
    scale = min(max_w / iw, max_h / ih)
    return Image(str(path), width=iw * scale, height=ih * scale)


def table(headers, rows, widths=None, font=7.4):
    data = [[P(str(h), "CellHeadCO") for h in headers]]
    for row in rows:
        data.append([P(str(c), "CellCO") for c in row])
    t = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), INK),
        ("TEXTCOLOR", (0,0), (-1,0), WHITE),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("GRID", (0,0), (-1,-1), .35, LINE),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, colors.HexColor("#FBF7F1")]),
    ]))
    return t


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(MARGIN, PAGE_H - 12 * mm, PAGE_W - MARGIN, PAGE_H - 12 * mm)
    canvas.setFont("DejaVu-Bold", 7.5)
    canvas.setFillColor(ACCENT)
    canvas.drawString(MARGIN, PAGE_H - 9 * mm, "COAGRO POS")
    canvas.setFont("DejaVu", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 9 * mm, "Guía de defensa · ISC-302")
    canvas.line(MARGIN, 12 * mm, PAGE_W - MARGIN, 12 * mm)
    canvas.setFont("DejaVu", 7)
    canvas.drawString(MARGIN, 8 * mm, "Proyecto integrador · Opción B · 26 de noviembre de 2026")
    canvas.drawRightString(PAGE_W - MARGIN, 8 * mm, f"{doc.page}")
    canvas.restoreState()


doc = SimpleDocTemplate(
    str(OUT), pagesize=A4, rightMargin=MARGIN, leftMargin=MARGIN,
    topMargin=18 * mm, bottomMargin=18 * mm,
    title="COAGRO POS · Guía de defensa", author="Equipo COAGRO ISC-302"
)

story = []

# Portada
story += [Spacer(1, 28 * mm), P("COAGRO POS", "TitleCO"),
          P("Sistema de Punto de Venta, Facturación Fiscal y Fidelización de Clientes", "SubtitleCO"),
          HRFlowable(width="100%", thickness=2, color=ACCENT, spaceBefore=8, spaceAfter=18),
          P("GUÍA DE DEFENSA DEL PROTOTIPO", "H1CO"),
          P("Universidad Cristiana Evangélica Nuevo Milenio<br/>Campus Catacamas · Ingeniería en Sistemas<br/>Sistemas de Información (ISC-302)<br/>Docente: Ing. Carlos Heraldo Matute Lobo", "CoverMetaCO"),
          Spacer(1, 14 * mm),
          P("Equipo", "H2CO"),
          P("Keyli · Xiomara · Alberto · Carlos · Irving · Roberto", "CoverMetaCO"),
          Spacer(1, 10 * mm),
          P("Catacamas, Olancho · 26 de noviembre de 2026", "CoverMetaCO"),
          Spacer(1, 18 * mm),
          P("Esta guía permite explicar el proyecto con evidencia y admitir sus límites sin exagerar.", "CalloutCO"),
          PageBreak()]

# Cómo usar
story += [P("1. Cómo usar esta guía", "H1CO"),
          P("La defensa dura entre 8 y 10 minutos. Cada integrante domina una sección y todos deben conocer el flujo completo. La demostración se hace desde http://localhost:8000 o desde la URL pública de Render cuando esté verificada."),
          P("Regla de honestidad", "H2CO"),
          P("El proyecto demuestra un prototipo funcional con backend SQLite local. No demuestra autenticación real, integración SAR, persistencia de ventas y facturas, Figma/Balsamiq ni tiempo real. Esos vacíos están documentados y tienen tareas JET abiertas."),
          table(["Tema", "Qué se puede afirmar", "Qué no se debe afirmar"], [
              ["Producto", "Prototipo navegable de POS, CRM, CxC, cierre, comisiones y dashboard.", "Sistema productivo completo."],
              ["Datos", "Productos, clientes, cartera y correlativos viven en SQLite.", "Turnos, ventas, detalles y facturas ya son persistentes."],
              ["Fiscal", "Cálculo ISV 15/18, exento, retención 1% y comprobante visual.", "Integración o autorización real del SAR."],
              ["Seguridad", "CSP, permisos, nosniff, validación server-side y datos demo.", "Autenticación y roles reales."],
              ["Entrega", "Repositorio GitHub público y prototipo web.", "Enlace Figma/Balsamiq o URL Render verificada."],
          ], widths=[28*mm, 70*mm, 75*mm]),
          Spacer(1, 6*mm),
          P("Orden de exposición", "H2CO"),
          P("1. Problema y objetivos. 2. DFD. 3. Arquitectura. 4. Demostración. 5. UI/UX. 6. Evidencia. 7. Límites y trabajo pendiente."),
          PageBreak()]

# Arquitectura
story += [P("2. Arquitectura y stack", "H1CO"),
          P("El front-end es HTML, CSS y JavaScript puro. El backend es Python con biblioteca estándar y SQLite. No hay dependencias externas que instalar."),
          table(["Capa", "Tecnología", "Responsabilidad"], [
              ["Interfaz", "HTML + CSS + JavaScript", "8 pantallas, formularios, modales, gráficos y navegación responsive."],
              ["API", "Python http.server", "Estado canónico, validación, reset, salud y archivos estáticos."],
              ["Datos", "SQLite", "Productos, clientes, cuentas por cobrar y correlativos."],
              ["Respaldo", "localStorage", "Funcionamiento local si la API no responde."],
              ["Despliegue", "Render Web Service", "python3 server.py; PORT inyectado por Render."],
          ], widths=[27*mm, 42*mm, 104*mm]),
          Spacer(1, 5*mm),
          P("Endpoints", "H2CO"),
          P("GET /api/state<br/>PUT /api/state<br/>POST /api/reset<br/>GET /api/health<br/>GET /health", "MonoCO"),
          P("Seguridad aplicada", "H2CO"),
          P("CSP, Permissions-Policy, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, límite de cuerpo JSON de 2 MB y consultas SQL parametrizadas."),
          P("Flujo de datos", "H2CO"),
          P("Una venta en el POS calcula ISV y total en el navegador. El cobro registra el resultado. Los datos maestros se sincronizan a SQLite. Si la API falla, la interfaz muestra Modo local y usa localStorage. El turno, carrito y factura actual siguen en memoria."),
          PageBreak()]

# DFD 0
story += [P("3. DFD nivel 0", "H1CO"),
          P("El sistema aparece como un único proceso central. Las entidades externas son Cliente, Cajero, Vendedor, SAR, Banco, Proveedor, Encargado de créditos y Gerencia."),
          img(ASSETS / "dfd_nivel0.png", max_h=120*mm),
          Spacer(1, 4*mm),
          P("Qué decir", "H2CO"),
          P("El límite del sistema separa COAGRO de su entorno. Cliente y cajero envían solicitudes y ventas; SAR recibe datos fiscales; Banco valida pagos; Proveedor entrega información comercial; Créditos envía cartera y abonos; Gerencia consulta indicadores."),
          P("No confundir", "H2CO"),
          P("El DFD nivel 0 no muestra almacenes internos. Solo procesos, entidades externas y flujos de datos."),
          PageBreak()]

# DFD 1
story += [P("4. DFD nivel 1", "H1CO"),
          P("El proceso central se descompone en seis procesos: ventas y caja, facturación fiscal, productos y promociones, clientes y créditos, comisiones y reportes."),
          img(ASSETS / "dfd_nivel1.png", max_h=125*mm),
          Spacer(1, 4*mm),
          P("Balanceo que se debe explicar", "H2CO"),
          P("Los datos de venta alimentan facturación y reportes. Las facturas emitidas alimentan cuentas por cobrar cuando la venta es a crédito. Productos y clientes alimentan ventas. Ventas alimentan comisiones. Clientes, cartera y ventas alimentan reportes."),
          P("Almacenes", "H2CO"),
          P("D1 Productos, D2 Clientes, D3 Ventas, D4 Facturas y D5 Cuentas por cobrar. El prototipo actual persiste D1, D2 y D5; D3, D4 y turnos están en la tarea JET-RJWY8F."),
          PageBreak()]

# Mapa
story += [P("5. Mapa de navegación", "H1CO"),
          img(ASSETS / "mapa_navegacion.png", max_h=125*mm),
          Spacer(1, 4*mm),
          P("La entrada actual es independiente del shell. Después de abrir turno se entra al POS. El cierre de turno regresa al login. En móvil, la navegación principal queda en la barra inferior y el botón Cobrar se fija sobre ella."),
          PageBreak()]

# Cobertura
story += [P("6. Cobertura de requerimientos", "H1CO"),
          P("La auditoría completa está en docs/COAGRO_Auditoria_Requerimientos.md. El resultado no es 100 % de cumplimiento."),
          table(["Bloque", "Cumple", "Parcial", "Falta"], [
              ["RF funcionales", "10", "4", "0"],
              ["RNF no funcionales", "3", "5", "0"],
              ["Módulos", "2", "4", "0"],
              ["Tablas persistentes", "3", "0", "4"],
              ["DFD, diccionario y navegación", "3", "1", "0"],
              ["Entregables", "2", "3", "2"],
          ], widths=[80*mm, 30*mm, 30*mm, 30*mm]),
          Spacer(1, 5*mm),
          P("Funcionales completos", "H2CO"),
          P("RF-02 apertura, RF-03 ventas, RF-04 pagos, RF-06 impuestos, RF-07 productos, RF-09 clientes, RF-10 créditos, RF-11 abonos, RF-12 cierre y RF-13 comisiones."),
          P("Funcionales parciales", "H2CO"),
          P("RF-01 autenticación, RF-05 talonarios SAR, RF-08 promociones y descuentos, RF-14 dashboard con netas y margen."),
          P("No funcionales completos", "H2CO"),
          P("RNF-03 usabilidad, RNF-04 rendimiento y RNF-07 validación."),
          P("Tablas persistentes actuales", "H2CO"),
          P("Clientes, Productos y CuentasPorCobrar. Faltan TurnosCaja, VentasPOS, DetalleVentas y FacturasFiscalesSAR."),
          PageBreak()]

# Rúbrica oficial
story += [P("6.1 Rúbrica oficial y entregables", "H1CO"),
          table(["Criterio", "Puntos", "Situción actual"], [
              ["F1. Problema y requerimientos", "30", "Contenido completo; DOCX de 16 páginas supera el máximo de 12."],
              ["F1. DFD y diccionario", "40", "Nivel 0, nivel 1 y 19 elementos presentes."],
              ["F1. Mapa y wireframes", "30", "Mapa completo; cuatro bocetos de ocho."],
              ["F2. Funcionalidad e interactividad", "30", "Web funcional; falta Figma/Balsamiq y URL pública verificada."],
              ["F2. Calidad visual y dashboard", "30", "Responsive, validaciones, modales, ARIA y KPIs."],
              ["F2. Documentación y modelo", "20", "Falta modelo relacional completo y manual consolidado."],
              ["F2. Dominio y defensa", "20", "Esta guía cubre guion, demostración y preguntas."],
          ], widths=[58*mm, 18*mm, 97*mm]),
          Spacer(1, 5*mm),
          P("Conclusión de rúbrica", "H2CO"),
          P("El riesgo más alto no es técnico: es entregar un prototipo web donde la consigna exige Figma o Balsamiq y un enlace público. También debe ajustarse el documento de fase 1 a 12 páginas y completarse el modelo relacional."),
          PageBreak()]

# Pantalla 1
story += [P("7. Demostración por pantalla", "H1CO"),
          P("Pantalla 1 · Login y apertura de turno", "H2CO"),
          img(ASSETS / "01_login.png", max_h=105*mm),
          Spacer(1, 3*mm),
          P("Qué mostrar", "H2CO"),
          P("El login no muestra menú lateral. Al enviar una contraseña vacía, el foco pasa al campo afectado. Después de ingresar, se registra el fondo inicial por denominación y se abre el turno."),
          P("Qué decir", "H2CO"),
          P("La entrada es independiente para reducir carga cognitiva. El estado de conexión es visible. La apertura usa desglose de efectivo para evitar errores de arqueo."),
          P("Límite", "H2CO"),
          P("La autenticación es simulada. No hay usuarios ni roles reales. Tarea JET-P9VNP9."),
          PageBreak()]

# Pantalla 2
story += [P("Pantalla 2 · POS y venta rápida", "H2CO"),
          img(ASSETS / "03_pos_venta.png", max_h=105*mm),
          Spacer(1, 3*mm),
          P("Qué mostrar", "H2CO"),
          P("Buscar cafe sin acento, agregar Arroz y Frijol, cambiar cantidades, aplicar descuento y observar ISV y total. El catálogo muestra ocho productos y un botón para cargar más."),
          P("Qué decir", "H2CO"),
          P("La búsqueda ignora acentos y usa debounce. Los objetivos cumplen 24 px. El total se anuncia a lectores de pantalla. En móvil, Cobrar queda en la zona del pulgar."),
          P("Límite", "H2CO"),
          P("El lector de barras está simulado y la venta aún no se guarda en SQLite. Tarea JET-RJWY8F."),
          PageBreak()]

# Pantalla 3 factura
story += [P("Pantalla 3 · Pago combinado y factura SAR", "H2CO"),
          img(ASSETS / "04_factura.png", max_h=105*mm),
          Spacer(1, 3*mm),
          P("Qué mostrar", "H2CO"),
          P("En el modal de cobro elegir Dividir pago, usar Efectivo y Tarjeta, validar la suma y continuar. Abrir la factura y mostrar CAI, correlativo, gravado, exento, ISV, retención y QR."),
          P("Qué decir", "H2CO"),
          P("El pago combinado responde a RF-04. El ISV se calcula por producto al 15 % o 18 %, con exentos. La retención del 1 % se presenta como información fiscal."),
          P("Límite", "H2CO"),
          P("No hay conexión SAR ni administración de talonarios. El QR es ilustrativo. Tarea JET-5THMMC."),
          PageBreak()]

# Pantalla 4 clientes
story += [P("Pantalla 4 · Cliente 360° y crédito", "H2CO"),
          img(ASSETS / "05_clientes.png", max_h=105*mm),
          Spacer(1, 3*mm),
          P("Qué mostrar", "H2CO"),
          P("Buscar un cliente, revisar compras, saldo, límite y disponible. Abrir el estado de cuenta y mostrar el bloqueo por mora."),
          P("Qué decir", "H2CO"),
          P("La ficha reúne información comercial y crediticia en bloques. El uso de crédito es visible. Las alertas ayudan a prevenir nuevas ventas a clientes vencidos."),
          P("Límite", "H2CO"),
          P("No hay score crediticio ni cobranza automatizada. Tarea JET-N2T8HD."),
          PageBreak()]

# Pantalla 5 productos
story += [P("Pantalla 5 · Catálogo y promociones", "H2CO"),
          img(ASSETS / "02_pos.png", max_h=105*mm),
          Spacer(1, 3*mm),
          P("Qué mostrar en la pantalla de Productos", "H2CO"),
          P("Abrir Productos y precios, filtrar, editar un precio y desactivar un producto. El sistema pide confirmación antes de desactivar."),
          P("Qué decir", "H2CO"),
          P("Existen precios mostrador, distribuidor y mayor. La edición valida importes y existencia. La promoción actual es un campo textual."),
          P("Límite", "H2CO"),
          P("Faltan vigencia, combos y descuento máximo por vendedor. Tarea JET-N8HGZE."),
          PageBreak()]

# Pantalla 6 CxC
story += [P("Pantalla 6 · Cuentas por cobrar", "H2CO"),
          img(ASSETS / "06_cxc.png", max_h=105*mm),
          Spacer(1, 3*mm),
          P("Qué mostrar", "H2CO"),
          P("Revisar saldo total, al corriente, por vencer y vencido. Registrar un abono de 100 y verificar el nuevo saldo y el recibo."),
          P("Qué decir", "H2CO"),
          P("Los importes se derivan de SQLite. El abono no puede superar el saldo. La prueba de integración comprobó el cambio real de 620 a 520 en la base."),
          P("Límite", "H2CO"),
          P("No hay pasarela de pago ni conciliación bancaria."),
          PageBreak()]

# Pantalla 7 cierre
story += [P("Pantalla 7 · Cierre y arqueo ciego", "H2CO"),
          img(ASSETS / "07_cierre.png", max_h=105*mm),
          Spacer(1, 3*mm),
          P("Qué mostrar", "H2CO"),
          P("El cajero cuenta efectivo sin ver el teórico. Al revelar, aparece saldo teórico, efectivo contado y diferencia. Si la diferencia supera L 50, se exige explicación."),
          P("Qué decir", "H2CO"),
          P("El arqueo ciego evita que el cajero ajuste el conteo al saldo esperado. El botón Cerrar turno de la barra superior lleva directamente a esta pantalla. Al confirmar, regresa al login."),
          P("Límite", "H2CO"),
          P("El cierre no queda persistido. Tarea JET-RJWY8F."),
          PageBreak()]

# Pantalla 8 dashboard
story += [P("Pantalla 8 · Dashboard comercial", "H2CO"),
          img(ASSETS / "08_dashboard.png", max_h=105*mm),
          Spacer(1, 3*mm),
          P("Qué mostrar", "H2CO"),
          P("Ventas brutas, ticket promedio, morosidad, clientes activos, gráfica por hora, dona de cartera, mapa de calor, metas, comisiones y top 10."),
          P("Qué decir", "H2CO"),
          P("El dashboard usa caché para no reconstruir gráficos y tablas en cada visita. La dona se calcula desde CxC. Las comisiones aplican tasa según cumplimiento de meta."),
          P("Límite", "H2CO"),
          P("Faltan ventas netas, margen por línea y tiempo real. Tarea JET-WGW2DY."),
          PageBreak()]

# Móvil
story += [P("8. Evidencia móvil", "H1CO"),
          img(ASSETS / "09_movil.png", max_h=150*mm),
          Spacer(1, 4*mm),
          P("La navegación inferior y la barra de cobro fija respetan la zona del pulgar. Se verificaron 360, 390, 768 y 1440 px sin desbordamiento horizontal y sin objetivos menores de 24 px."),
          PageBreak()]

# Guion equipo
story += [P("9. Guion por integrante", "H1CO"),
          table(["Integrante", "Tema", "Guion sugerido"], [
              ["Keyli", "Problema, objetivos y DFD", "Explicar las colas de 35 minutos, la mora de L 1.2 millones y la falta de historial. Presentar el DFD nivel 0 y el balanceo del nivel 1."],
              ["Xiomara", "UI/UX y HCI", "Explicar Fitts, Hick, Miller, Prägnanz y Doherty. Mostrar una acción primaria, objetivos de 24 px, contraste AA, foco y ayuda."],
              ["Alberto", "Arquitectura y datos", "Explicar HTML/CSS/JS, API Python, SQLite, endpoints, transacción de instantánea, cabeceras y fallback local."],
              ["Carlos", "POS y fiscal", "Demostrar búsqueda, carrito, ISV, pago combinado, cambio y factura. Aclarar que SAR y QR son simulados."],
              ["Irving", "CRM, crédito y CxC", "Demostrar ficha 360°, límite disponible, bloqueo, abono, recibo y comisiones."],
              ["Roberto", "Dashboard, pruebas y cierre", "Mostrar indicadores, citar las cinco suites y métricas, enumerar límites y tareas JET, cerrar con la conclusión."],
          ], widths=[24*mm, 39*mm, 110*mm]),
          Spacer(1, 5*mm),
          P("Tiempos", "H2CO"),
          P("Keyli 60 s. Xiomara 60 s. Alberto 60 s. Carlos 90 s. Irving 60 s. Roberto 60 s. Demostración adicional 90 s. Total aproximado 8 minutos."),
          PageBreak()]

# Demo rápida
story += [P("10. Demostración en diez pasos", "H1CO"),
          table(["Paso", "Acción", "Resultado esperado"], [
              ["1", "Abrir la URL y mostrar el login.", "No aparece el shell del sistema."],
              ["2", "Enviar sin contraseña y luego ingresar.", "Foco en el campo inválido; acceso simulado."],
              ["3", "Registrar fondo inicial y abrir turno.", "Aparece POS y estado Turno activo."],
              ["4", "Buscar cafe y agregar dos productos.", "Cantidades, ISV y total actualizados."],
              ["5", "Aplicar descuento y dividir pago.", "Suma validada; Efectivo + Tarjeta."],
              ["6", "Abrir la factura.", "CAI, desglose, retención y QR visibles."],
              ["7", "Abrir un cliente y su crédito.", "Límite, saldo, disponible e historial."],
              ["8", "Registrar un abono de 100.", "Recibo y saldo recalculado."],
              ["9", "Cerrar turno y revelar cuadre.", "Diferencia y observación si procede."],
              ["10", "Abrir dashboard.", "KPIs, gráficas, cartera, metas y top 10."],
          ], widths=[14*mm, 74*mm, 85*mm]),
          PageBreak()]

# Preguntas
story += [P("11. Preguntas probables y respuestas", "H1CO"),
          table(["Pregunta", "Respuesta defendible"], [
              ["¿Por qué no está en Figma o Balsamiq?", "La consigna lo pide. El equipo construyó un prototipo web funcional para demostrar lógica y UI/UX. La migración o aceptación del sustituto está en JET-TVD6WK."],
              ["¿Dónde se guardan las ventas?", "Todavía no en SQLite. Se guardan productos, clientes, CxC y correlativos. Turnos, ventas, detalles y facturas están en JET-RJWY8F."],
              ["¿La factura es real ante el SAR?", "No. Es un comprobante visual con cálculo fiscal y QR ilustrativo. No existe integración SAR."],
              ["¿Cómo calculan el ISV?", "Cada producto tiene tasa 0, 15 o 18. El sistema suma bases, calcula impuesto, aplica descuento y muestra retención informativa del 1 %."],
              ["¿Qué ocurre si cae la API?", "La interfaz cambia a Modo local y usa localStorage. No se pierde la navegación, pero no hay reconciliación automática todavía."],
              ["¿Por qué Python?", "Permite un backend sin dependencias, con SQLite y despliegue simple en Render. El puerto lo inyecta Render."],
              ["¿Dónde está lo ACID?", "La escritura de la instantánea maestra usa una transacción SQLite. La venta completa aún no es transaccional porque no se persiste."],
              ["¿Hay seguridad real?", "Hay CSP, permisos, nosniff, anti-clickjacking, validación y datos demo. No hay autenticación ni roles reales."],
              ["¿Cómo midieron rendimiento?", "Cinco suites, caché, debounce y catálogo progresivo. Dashboard repetido: 0.1412 s y 3 layouts. Sin tareas largas."],
              ["¿Qué faltaría para producción?", "Auth y roles, persistencia transaccional, SAR real, auditoría, PWA, secretos, copias de seguridad y pruebas en dispositivos físicos."],
          ], widths=[53*mm, 120*mm]),
          PageBreak()]

# Evidencia
story += [P("12. Evidencia técnica", "H1CO"),
          table(["Prueba", "Resultado"], [
              ["node --check", "Sin errores de sintaxis."],
              ["py_compile", "Sin errores de sintaxis del backend."],
              ["Suite POS y cierre", "0 errores de consola."],
              ["Suite pago combinado y comisiones", "0 errores de consola."],
              ["Suite persistencia, ARIA y vacíos", "0 errores de consola."],
              ["Suite API y SQLite", "0 errores; precio 83 y abono 620 → 520 verificados."],
              ["Suite HCI", "360/390/768/1440 sin overflow ni targets < 24; cobro ≈370 ms."],
              ["/health", "HTTP 200."],
              ["Favicon", "HTTP 200 image/svg+xml."],
              ["Escritura inválida", "HTTP 400 sin modificar la base."],
          ], widths=[64*mm, 109*mm]),
          Spacer(1, 5*mm),
          P("Contraste", "H2CO"),
          P("Texto principal 14.94:1. Secundario 5.48:1. Acento 5.91:1. Aviso 5.18:1. Error 5.12:1."),
          P("Rendimiento", "H2CO"),
          P("Dashboard primer render: 55 → 36–38 layouts. Búsqueda POS: 892 → 262–365 nodos. No se observaron tareas largas. TaskDuration es variable entre 0.267 y 0.348 s."),
          PageBreak()]

# Tareas
story += [P("13. Trabajo pendiente en JET", "H1CO"),
          table(["ID", "Tarea", "Prioridad"], [
              ["JET-RJWY8F", "Persistir turnos, ventas, detalles y facturas.", "Alta"],
              ["JET-P9VNP9", "Autenticación, roles y trazabilidad.", "Alta"],
              ["JET-5THMMC", "Talonarios CAI, rangos y fechas.", "Alta"],
              ["JET-N8HGZE", "Promociones, combos y descuentos por vendedor.", "Alta"],
              ["JET-WGW2DY", "Ventas netas y margen por línea.", "Alta"],
              ["JET-N2T8HD", "Evaluación crediticia y cobranza automatizada.", "Normal"],
              ["JET-RZNGXE", "Disponibilidad offline y reconciliación.", "Normal"],
              ["JET-TVD6WK", "Moodle, wireframes, Figma/Balsamiq y URL pública.", "Alta"],
          ], widths=[30*mm, 120*mm, 23*mm]),
          Spacer(1, 5*mm),
          P("Conclusión", "H2CO"),
          P("El prototipo demuestra el flujo principal y una base técnica verificable. La defensa debe separar lo demostrado de lo pendiente. Esa precisión es más sólida que afirmar cumplimiento total."),
          PageBreak()]

# Referencias
story += [P("14. Referencias", "H1CO"),
          P("Consigna y documentos del curso: DOCX de fase 1 y PDF de ocho pantallas visuales."),
          P("W3C. Web Content Accessibility Guidelines 2.2. https://www.w3.org/TR/WCAG22/"),
          P("Nielsen Norman Group. 10 Usability Heuristics for User Interface Design. https://www.nngroup.com/articles/ten-usability-heuristics"),
          P("Doherty Threshold. Referencias de investigación y aplicación a respuesta de interfaz. https://www.ux-guidelines.com/doherty-threshold.html"),
          P("Perfiles de agentes: /home/alberto/Jet/agents. Aplicación documentada en prototipo/UIUX_AUDIT.md."),
          P("Código y evidencia: https://github.com/ekbfjefbfb/IngenierSystemClassHerarldoPlus"),
          Spacer(1, 8*mm),
          P("Fin de la guía", "CalloutCO")]

doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
print(OUT)
