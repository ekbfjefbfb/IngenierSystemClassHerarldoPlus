#!/usr/bin/env python3
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import cairosvg, subprocess

ROOT=Path(__file__).resolve().parents[1]
DOCS=ROOT/'docs'; WF=DOCS/'wireframes'; WF.mkdir(exist_ok=True)
ASSETS=DOCS/'assets'


def svg_wrap(title, body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <rect width="800" height="500" fill="#FFFFFF"/><rect x="8" y="8" width="784" height="484" rx="10" fill="none" stroke="#7A8790" stroke-width="3"/>
    <rect x="8" y="8" width="784" height="54" rx="10" fill="#EDF1F3"/><text x="28" y="43" font-family="Arial" font-size="24" font-weight="700" fill="#26343D">{title}</text>
    {body}</svg>'''


def box(x,y,w,h,label='',fill='#F7F9FA'):
    text=f'<text x="{x+12}" y="{y+26}" font-family="Arial" font-size="15" fill="#64747F">{label}</text>' if label else ''
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="7" fill="{fill}" stroke="#9AA8B1" stroke-width="2"/>{text}'


def line(x1,y1,x2,y2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#9AA8B1" stroke-width="2"/>'


def btn(x,y,w,label):
    return box(x,y,w,38,label,'#E4E9EC')


wireframes={
'01_login':('Pantalla 1 · Login y apertura', box(250,90,300,40,'Usuario')+box(250,145,300,40,'Contraseña')+btn(310,205,180,'Ingresar')+box(250,275,300,40,'Fondo inicial')+btn(310,330,180,'Abrir turno')),
'02_pos':('Pantalla 2 · POS', box(30,85,300,45,'Buscar producto')+box(30,145,190,120,'Productos')+box(235,145,95,120,'Combos')+box(355,85,415,265,'Ticket / carrito')+box(355,365,250,55,'Totales')+btn(620,365,150,'Cobrar')),
'03_clientes':('Pantalla 3 · Cliente 360°', box(30,85,230,320,'Lista de clientes')+box(285,85,485,70,'Nombre / RTN')+box(285,170,110,80,'Compras')+box(405,170,110,80,'Saldo')+box(525,170,110,80,'Límite')+box(645,170,125,80,'Disponible')+box(285,265,485,140,'Historial / facturas')),
'04_factura':('Pantalla 4 · Factura SAR', box(60,85,680,70,'COAGRO / CAI / correlativo')+box(60,170,320,75,'Adquirente')+box(395,170,345,75,'Fechas / pago')+box(60,260,680,140,'Detalle gravado / exento / ISV')+box(510,325,230,75,'Total')+box(60,420,120,55,'QR')),
'05_productos':('Pantalla 5 · Productos y promociones', box(30,85,350,45,'Buscar')+box(395,85,170,45,'Categoría')+btn(580,85,190,'Nuevo producto')+box(30,150,740,230,'Tabla de productos / precios / stock')+box(30,395,350,70,'Promociones y combos')+box(395,395,375,70,'Descuentos autorizados')),
'06_cxc':('Pantalla 6 · Cuentas por cobrar', box(30,85,230,90,'Saldo total')+box(275,85,230,90,'Vencido')+box(520,85,250,90,'Por vencer')+box(30,195,740,220,'Tabla de facturas / abonos')+btn(30,435,220,'Registrar abono')+btn(270,435,220,'Estado de cuenta')+btn(510,435,260,'Ejecutar cobranza')),
'07_cierre':('Pantalla 7 · Cierre de caja', box(30,85,740,60,'Turno / cajero / fondo')+box(30,160,430,230,'Conteo ciego por denominación')+box(485,160,285,230,'Cuadre protegido')+btn(200,415,400,'Revelar cuadre')),
'08_dashboard':('Pantalla 8 · Dashboard', box(30,85,175,90,'Ventas netas')+box(215,85,175,90,'Ticket')+box(400,85,175,90,'Margen')+box(585,85,185,90,'Morosidad')+box(30,195,470,190,'Gráfica de ventas')+box(515,195,255,190,'Cartera / metas')+box(30,400,470,75,'Margen por línea')+box(515,400,255,75,'Top 10'))
}

for key,(title,body) in wireframes.items():
    svg=svg_wrap(title,body)
    (WF/f'{key}.svg').write_text(svg)
    cairosvg.svg2png(bytestring=svg.encode(),write_to=str(WF/f'{key}.png'),output_width=1200,output_height=750)

D=Document()
sec=D.sections[0]; sec.top_margin=Inches(.55); sec.bottom_margin=Inches(.55); sec.left_margin=Inches(.6); sec.right_margin=Inches(.6)
styles=D.styles
styles['Normal'].font.name='Arial'; styles['Normal'].font.size=Pt(9)
for name,size,color in [('Title',24,'10231B'),('Heading 1',16,'10231B'),('Heading 2',12,'9C4F22')]:
    styles[name].font.name='Arial'; styles[name].font.size=Pt(size); styles[name].font.color.rgb=RGBColor.from_string(color)

header=sec.header.paragraphs[0]; header.text='UCENM · ISC-302 · COAGRO POS · Fase 1 compacta'; header.style='Caption'
footer=sec.footer.paragraphs[0]; footer.alignment=WD_ALIGN_PARAGRAPH.CENTER
run=footer.add_run('Proyecto integrador Opción B · '); fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); footer._p.append(fld)

def page(): D.add_page_break()
def h(text,level=1): D.add_heading(text,level)
def p(text): D.add_paragraph(text)
def table(headers,rows,widths=None):
    t=D.add_table(rows=1,cols=len(headers)); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.style='Table Grid'
    for i,x in enumerate(headers): t.rows[0].cells[i].text=x
    for row in rows:
        cells=t.add_row().cells
        for i,x in enumerate(row): cells[i].text=str(x)
    for row in t.rows:
        for cell in row.cells:
            cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            for par in cell.paragraphs:
                for run in par.runs: run.font.size=Pt(7.5)
    return t

def image(path,width=6.8):
    D.add_picture(str(path),width=Inches(width))

# 1
D.add_paragraph('UNIVERSIDAD CRISTIANA EVANGÉLICA NUEVO MILENIO',style='Title')
p('Campus Catacamas · Ingeniería en Sistemas · Sistemas de Información (ISC-302)')
h('Sistema de Punto de Venta, Facturación Fiscal y Fidelización de Clientes',1)
p('Empresa: Comercializadora Agropecuaria y Ferretera de Catacamas (COAGRO)')
p('Docente: Ing. Carlos Heraldo Matute Lobo')
p('Equipo: Keyli · Xiomara · Alberto · Carlos · Irving · Roberto')
p('Catacamas, Olancho · Octubre de 2026')
h('Propósito',2)
p('Analizar requerimientos, modelar procesos con DFD y construir un prototipo navegable de POS, facturación SAR y CRM para COAGRO.')

# 2
page(); h('1. Problema, justificación y objetivos')
p('COAGRO atiende más de 600 clientes diarios y 120 corporativos en tres sucursales. El sistema monousuario provoca colas de hasta 35 minutos, errores de ISV, mora superior a L 1.2 millones y ausencia de historial centralizado.')
h('Objetivo general',2); p('Diseñar un sistema integrado que agilice ventas, asegure el cálculo fiscal, controle créditos y fidelice clientes.')
h('Objetivos específicos',2)
for x in ['Levantar requerimientos funcionales y no funcionales IEEE 830.','Modelar el sistema con DFD nivel 0 y nivel 1.','Definir diccionario de datos y modelo relacional.','Diseñar navegación y wireframes de ocho pantallas.','Construir un prototipo funcional para defensa.']: p(x)
h('Alcance',2); p('POS y turnos, facturación SAR, catálogo y promociones, CRM y créditos, comisiones y dashboard. La integración bancaria y SAR real queda fuera del prototipo.')

# 3
page(); h('2. Requerimientos funcionales RF-01 a RF-07')
table(['Código','Requisito','Descripción'],[
['RF-01','Autenticación','Acceso por usuario y contraseña con rol.'],['RF-02','Apertura de caja','Turno, terminal y fondo por denominación.'],['RF-03','Registro de ventas','Búsqueda, carrito, cantidades e ISV.'],['RF-04','Pagos','Efectivo, ACH, tarjeta, crédito y combinados.'],['RF-05','Facturación SAR','CAI, rango, fecha límite y correlativo.'],['RF-06','Impuestos','ISV 15/18, exento y retención 1%.'],['RF-07','Productos','Código, barras, precios, costo y stock.']])

# 4
page(); h('2. Requerimientos funcionales RF-08 a RF-14')
table(['Código','Requisito','Descripción'],[
['RF-08','Promociones','Ofertas temporales, combos y descuentos por vendedor.'],['RF-09','Clientes','Ficha, RTN e historial de consumo.'],['RF-10','Créditos','Límite, saldo, disponible y vencidos.'],['RF-11','Abonos','Pago parcial, recibo y nuevo saldo.'],['RF-12','Cierre','Arqueo ciego, diferencia y supervisor.'],['RF-13','Comisiones','Ventas, metas y liquidación por vendedor.'],['RF-14','Dashboard','Brutas/netas, ticket, margen, top 10 y morosidad.']])

# 5
page(); h('3. Requerimientos no funcionales y usuarios')
table(['Código','Categoría','Requisito'],[[f'RNF-{i:02d}',c,r] for i,(c,r) in enumerate([
('Seguridad','Autenticación y permisos por rol.'),('Integridad','Consistencia y transacciones ACID.'),('Usabilidad','Controles claros y navegación consistente.'),('Rendimiento','Respuesta oportuna en horas pico.'),('Disponibilidad','Operación offline y reconciliación.'),('Trazabilidad','Registro de quién, qué y cuándo.'),('Validación','Campos obligatorios y reglas de negocio.'),('Protección','Acceso restringido a información sensible.')],1)])
h('Usuarios',2); table(['Usuario','Funciones'],[['Administrador','Usuarios, permisos y configuración.'],['Cajero','Turnos, ventas, pagos y cierre.'],['Vendedor','Productos, clientes y ventas.'],['Créditos','Saldos, abonos, evaluación y cobranza.'],['Gerente','Indicadores, cartera y resultados.']])

# 6
page(); h('4. DFD nivel 0'); image(ASSETS/'dfd_nivel0.png',6.8)
p('Entidades: Cliente, Cajero, Vendedor, SAR, Banco, Proveedor, Encargado de créditos y Gerencia. Flujos bidireccionales de solicitudes, ventas, datos fiscales, pagos, cartera e indicadores.')

# 7
page(); h('5. DFD nivel 1'); image(ASSETS/'dfd_nivel1.png',6.8)
p('Procesos: 1 ventas y caja, 2 facturación fiscal, 3 productos y promociones, 4 clientes y créditos, 5 comisiones, 6 reportes. Almacenes D1 a D5.')

# 8
page(); h('6. Diccionario de datos 1/2')
table(['Elemento','Tipo','Restricción'],[
['ID_Cliente','VARCHAR(20)','Único.'],['NombreCliente','VARCHAR(150)','Obligatorio.'],['RTN','VARCHAR(20)','Formato válido.'],['ID_Producto','VARCHAR(30)','Único.'],['CodigoBarras','VARCHAR(50)','Único si existe.'],['NombreProducto','VARCHAR(150)','Obligatorio.'],['PrecioVenta','DECIMAL(12,2)','No negativo.'],['Stock','DECIMAL(12,3)','No negativo.'],['ID_Venta','INT','Clave primaria.'],['FechaHoraVenta','DATETIME','Obligatoria.']])

# 9
page(); h('6. Diccionario de datos 2/2')
table(['Elemento','Tipo','Restricción'],[
['SubtotalGravado','DECIMAL(12,2)','No negativo.'],['ISV','DECIMAL(12,2)','Según tasa y base.'],['TotalVenta','DECIMAL(12,2)','Cuadra con detalle.'],['NumeroFacturaSAR','VARCHAR(30)','Único y en rango.'],['CAI','VARCHAR(50)','Autorización vigente.'],['SaldoPendiente','DECIMAL(12,2)','No negativo.'],['FechaVencimiento','DATE','Fecha válida.'],['ID_Turno','INT','Debe existir.'],['MontoAbono','DECIMAL(12,2)','Mayor a cero.']])

# 10
page(); h('7. Mapa de navegación'); image(ASSETS/'mapa_navegacion.png',6.6)
p('Login y apertura → POS → clientes o productos → factura, CxC o cierre → dashboard. En móvil se usa navegación inferior y cobro fijo en la zona del pulgar.')

# 11
page(); h('8. Wireframes 1 a 4')
t=D.add_table(rows=2,cols=2); t.alignment=WD_TABLE_ALIGNMENT.CENTER
for i,key in enumerate(['01_login','02_pos','03_clientes','04_factura']):
    cell=t.cell(i//2,i%2); cell.paragraphs[0].add_run().add_picture(str(WF/f'{key}.png'),width=Inches(3.25))

# 12
page(); h('8. Wireframes 5 a 8')
t=D.add_table(rows=2,cols=2); t.alignment=WD_TABLE_ALIGNMENT.CENTER
for i,key in enumerate(['05_productos','06_cxc','07_cierre','08_dashboard']):
    cell=t.cell(i//2,i%2); cell.paragraphs[0].add_run().add_picture(str(WF/f'{key}.png'),width=Inches(3.25))

out=DOCS/'COAGRO_Fase1_Compacta.docx'; D.save(out)
subprocess.run(['libreoffice','--headless','--convert-to','pdf','--outdir',str(DOCS),str(out)],check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
print(out)
