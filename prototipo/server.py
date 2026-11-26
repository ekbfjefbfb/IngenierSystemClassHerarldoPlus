#!/usr/bin/env python3
"""COAGRO POS · backend local con SQLite (solo stdlib).

Arranque:  python3 server.py
Verifica:  http://localhost:8000/api/health
Datos:     data/coagro.db (semilla determinista, se crea sola)

API
  GET    /api/state   -> estado canonico (productos, clientes, cartera, correlativos)
  PUT    /api/state   -> reemplaza datos maestros en una transicion atomica
  POST   /api/reset   -> restaura la semilla original
  GET    /api/health  -> estado del servidor

La sesion de caja (turno, carrito, ticket) no se guarda en el servidor: es volatil
por diseno. Todo lo demas vive en SQLite y sobrevive a recargas y reinicios.
"""

import hashlib
import json
import os
import secrets
import sqlite3
import threading
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "data" / "coagro.db"
# Render inyecta PORT; en local se usa COAGRO_PORT o 8000.
PORT = int(os.environ.get("PORT") or os.environ.get("COAGRO_PORT") or "8000")
HOST = os.environ.get("HOST", "0.0.0.0")
LOCK = threading.RLock()

SEED = {
    "products": [
        {"id":"P001","code":"7791234001","name":"Arroz 5 lb","cat":"Abarrotes","price":78,"dist":72,"mayor":68,"cost":58,"stock":45,"isv":15,"promo":""},
        {"id":"P014","code":"7791234014","name":"Aceite 1 L","cat":"Abarrotes","price":92,"dist":86,"mayor":82,"cost":68,"stock":28,"isv":15,"promo":"-5%"},
        {"id":"P022","code":"7791234022","name":"Frijol rojo 2 lb","cat":"Abarrotes","price":68,"dist":63,"mayor":60,"cost":49,"stock":60,"isv":15,"promo":"2 x L 125"},
        {"id":"P031","code":"7791234031","name":"Azúcar 2 lb","cat":"Abarrotes","price":34,"dist":31,"mayor":29,"cost":24,"stock":12,"isv":15,"promo":""},
        {"id":"P045","code":"7791234045","name":"Leche 1 L","cat":"Lácteos","price":45,"dist":42,"mayor":39,"cost":33,"stock":34,"isv":15,"promo":""},
        {"id":"P052","code":"7791234052","name":"Harina 5 lb","cat":"Abarrotes","price":55,"dist":51,"mayor":48,"cost":40,"stock":21,"isv":15,"promo":""},
        {"id":"P060","code":"7791234060","name":"Café 400 g","cat":"Abarrotes","price":90,"dist":84,"mayor":79,"cost":66,"stock":17,"isv":18,"promo":"2 x L 170"},
        {"id":"P071","code":"7791234071","name":"Pasta 200 g","cat":"Abarrotes","price":30,"dist":27,"mayor":25,"cost":20,"stock":80,"isv":15,"promo":""},
        {"id":"P083","code":"7791234083","name":"Jabón barra","cat":"Limpieza","price":30,"dist":27,"mayor":25,"cost":19,"stock":40,"isv":15,"promo":""},
        {"id":"P090","code":"7791234090","name":"Sal 1 lb","cat":"Abarrotes","price":15,"dist":13,"mayor":12,"cost":9,"stock":95,"isv":0,"promo":""},
        {"id":"P104","code":"7791234104","name":"Fertilizante NPK 50 lb","cat":"Agro","price":680,"dist":640,"mayor":610,"cost":520,"stock":14,"isv":15,"promo":""},
        {"id":"P118","code":"7791234118",'name':'Machete acero 20"',"cat":"Ferretería","price":320,"dist":300,"mayor":285,"cost":235,"stock":9,"isv":18,"promo":""},
        {"id":"P126","code":"7791234126",'name':'Taladro 1/2"',"cat":"Ferretería","price":2450,"dist":2300,"mayor":2180,"cost":1820,"stock":6,"isv":18,"promo":""},
        {"id":"P133","code":"7791234133","name":"Alambre galvanizado","cat":"Ferretería","price":125,"dist":116,"mayor":110,"cost":88,"stock":0,"isv":15,"promo":""},
    ],
    "clients": [
        {"id":"C001","name":"María Fernanda López","doc":"0801-1990-12345","phone":"9999-0000","cat":"Frecuente","credit_limit":5000,"balance":1250,"purchases":28450,"status":"Vigente","addr":"Catacamas, Olancho"},
        {"id":"C002","name":"José A. Rivera","doc":"0801-1985-09876","phone":"9988-1122","cat":"Crédito","credit_limit":8000,"balance":620,"purchases":41200,"status":"Vencido","addr":"Dulce Nombre de Culmí"},
        {"id":"C003","name":"Comercial El Sol","doc":"0801-2001-05555","phone":"9977-3344","cat":"Mayorista","credit_limit":25000,"balance":6800,"purchases":98750,"status":"Vigente","addr":"San Francisco de Becerra"},
        {"id":"C004","name":"Ana L. Zelaya","doc":"0801-1995-07777","phone":"9966-2211","cat":"Frecuente","credit_limit":3500,"balance":0,"purchases":12380,"status":"Vigente","addr":"Catacamas, Olancho"},
        {"id":"C005","name":"Coop. Ganadera Olancho","doc":"0801-1992-03333","phone":"9955-6677","cat":"Corporativo","credit_limit":30000,"balance":1437.5,"purchases":156400,"status":"Vencido","addr":"Catacamas, Olancho"},
        {"id":"C006","name":"Roberto Paredes","doc":"0801-1988-01111","phone":"9944-8899","cat":"Crédito","credit_limit":2000,"balance":380,"purchases":7620,"status":"Vigente","addr":"Juticalpa, Olancho"},
    ],
    "cxc": [
        {"id":"K001","client":"María Fernanda López","doc":"FAC-00111","issue":"02/11/2026","due":"05/12/2026","balance":620,"days":0,"status":"Vigente"},
        {"id":"K002","client":"José A. Rivera","doc":"FAC-00098","issue":"18/10/2026","due":"02/11/2026","balance":620,"days":23,"status":"Vencido"},
        {"id":"K003","client":"Comercial El Sol","doc":"FAC-00091","issue":"05/11/2026","due":"20/11/2026","balance":1180,"days":0,"status":"Vigente"},
        {"id":"K004","client":"Coop. Ganadera Olancho","doc":"FAC-00083","issue":"28/09/2026","due":"12/10/2026","balance":1437.5,"days":44,"status":"Vencido"},
        {"id":"K005","client":"Roberto Paredes","doc":"FAC-00119","issue":"20/11/2026","due":"05/12/2026","balance":380,"days":0,"status":"Vigente"},
        {"id":"K006","client":"María Fernanda López","doc":"FAC-00124","issue":"22/11/2026","due":"07/12/2026","balance":630,"days":0,"status":"Vigente"},
    ],
    "ticketNo": 428,
    "receiptNo": 912,
}

SCHEMA = """
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY, code TEXT NOT NULL, name TEXT NOT NULL, cat TEXT NOT NULL,
  price REAL NOT NULL, dist REAL NOT NULL, mayor REAL NOT NULL, cost REAL NOT NULL,
  stock REAL NOT NULL, isv INTEGER NOT NULL, promo TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, doc TEXT NOT NULL, phone TEXT NOT NULL,
  cat TEXT NOT NULL, credit_limit REAL NOT NULL, balance REAL NOT NULL,
  purchases REAL NOT NULL, status TEXT NOT NULL, addr TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS cxc (
  id TEXT PRIMARY KEY, client TEXT NOT NULL, doc TEXT NOT NULL, issue TEXT NOT NULL,
  due TEXT NOT NULL, balance REAL NOT NULL, days INTEGER NOT NULL, status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
  name TEXT NOT NULL, role TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, action TEXT NOT NULL,
  entity TEXT NOT NULL, entity_id TEXT, detail TEXT, created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, opened_at TEXT NOT NULL,
  closed_at TEXT, initial_cash REAL NOT NULL, cash_sales REAL NOT NULL DEFAULT 0,
  card_sales REAL NOT NULL DEFAULT 0, ach_sales REAL NOT NULL DEFAULT 0,
  credit_sales REAL NOT NULL DEFAULT 0, withdrawals REAL NOT NULL DEFAULT 0,
  counted_cash REAL, difference REAL, note TEXT, status TEXT NOT NULL DEFAULT 'open',
  FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY, shift_id TEXT NOT NULL, client_id TEXT, seller_id TEXT NOT NULL,
  ticket_no INTEGER NOT NULL, created_at TEXT NOT NULL, base15 REAL NOT NULL,
  base18 REAL NOT NULL, exempt REAL NOT NULL, tax REAL NOT NULL, discount REAL NOT NULL,
  total REAL NOT NULL, status TEXT NOT NULL DEFAULT 'paid',
  FOREIGN KEY(shift_id) REFERENCES shifts(id), FOREIGN KEY(client_id) REFERENCES clients(id),
  FOREIGN KEY(seller_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT, sale_id TEXT NOT NULL, product_id TEXT NOT NULL,
  qty REAL NOT NULL, unit_price REAL NOT NULL, discount_pct REAL NOT NULL DEFAULT 0,
  subtotal REAL NOT NULL, margin REAL NOT NULL,
  FOREIGN KEY(sale_id) REFERENCES sales(id), FOREIGN KEY(product_id) REFERENCES products(id)
);
CREATE TABLE IF NOT EXISTS sale_tenders (
  id INTEGER PRIMARY KEY AUTOINCREMENT, sale_id TEXT NOT NULL, method TEXT NOT NULL,
  amount REAL NOT NULL, reference TEXT,
  FOREIGN KEY(sale_id) REFERENCES sales(id)
);
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY, sale_id TEXT UNIQUE NOT NULL, client_id TEXT,
  number TEXT UNIQUE NOT NULL, cai_id TEXT NOT NULL, issued_at TEXT NOT NULL,
  due_date TEXT NOT NULL, qr_hash TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft',
  FOREIGN KEY(sale_id) REFERENCES sales(id), FOREIGN KEY(client_id) REFERENCES clients(id),
  FOREIGN KEY(cai_id) REFERENCES fiscal_talonarios(id)
);
CREATE TABLE IF NOT EXISTS fiscal_talonarios (
  id TEXT PRIMARY KEY, cai TEXT NOT NULL, range_start INTEGER NOT NULL,
  range_end INTEGER NOT NULL, due_date TEXT NOT NULL, current_number INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, value REAL NOT NULL,
  starts_at TEXT NOT NULL, ends_at TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1,
  product_id TEXT, combo_json TEXT, FOREIGN KEY(product_id) REFERENCES products(id)
);
CREATE TABLE IF NOT EXISTS credit_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT, client_id TEXT NOT NULL, score INTEGER NOT NULL,
  decision TEXT NOT NULL, reason TEXT NOT NULL, created_at TEXT NOT NULL,
  FOREIGN KEY(client_id) REFERENCES clients(id)
);
CREATE TABLE IF NOT EXISTS collection_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT, client_id TEXT NOT NULL, invoice_id TEXT,
  kind TEXT NOT NULL, scheduled_at TEXT NOT NULL, sent_at TEXT, status TEXT NOT NULL,
  detail TEXT, FOREIGN KEY(client_id) REFERENCES clients(id), FOREIGN KEY(invoice_id) REFERENCES invoices(id)
);
"""


def connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB_PATH, timeout=10)
    con.row_factory = sqlite3.Row
    con.executescript(SCHEMA)
    return con


def hash_password(password, salt=None, iterations=120000):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", str(password).encode(), salt.encode(), iterations).hex()
    return f"pbkdf2${iterations}${salt}${digest}"


def verify_password(password, stored):
    if stored.startswith("pbkdf2$"):
        _, iterations, salt, digest = stored.split("$", 3)
        candidate = hashlib.pbkdf2_hmac("sha256", str(password).encode(), salt.encode(), int(iterations)).hex()
        return secrets.compare_digest(candidate, digest)
    return secrets.compare_digest(hashlib.sha256(str(password).encode()).hexdigest(), stored)


def create_session(con, user_id):
    token = secrets.token_urlsafe(32)
    expires = (datetime.utcnow() + timedelta(hours=8)).isoformat(timespec="seconds")
    con.execute("INSERT INTO sessions VALUES (?,?,?,?)", (token, user_id, now_iso(), expires))
    return token


def user_from_token(con, token):
    if not token:
        return None
    row = con.execute(
        "SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>? AND u.active=1",
        (token, now_iso()),
    ).fetchone()
    return dict(row) if row else None


def insert_reference(con):
    with con:
        if not con.execute("SELECT 1 FROM users LIMIT 1").fetchone():
            demo_hash = hash_password(os.environ.get("COAGRO_DEMO_PASSWORD", "demo"))
            con.executemany(
                "INSERT OR IGNORE INTO users VALUES (?,?,?,?,?,?)",
                [
                    ("U001", "cajero01", demo_hash, "Alberto C.", "cajero", 1),
                    ("U002", "vendedor01", demo_hash, "Carlos R.", "vendedor", 1),
                    ("U003", "creditos01", demo_hash, "Irving M.", "creditos", 1),
                    ("U004", "gerente01", demo_hash, "Roberto P.", "gerente", 1),
                    ("U005", "admin", demo_hash, "Administrador", "admin", 1),
                ],
            )
        con.execute(
            "INSERT OR IGNORE INTO fiscal_talonarios VALUES (?,?,?,?,?,?,?)",
            ("T001", "A1B2-C3D4-E5F6-G7H8-I9J0-K1L2", 1, 99999, "2026-12-31", 45231, 1),
        )
        con.execute(
            "INSERT OR IGNORE INTO promotions VALUES (?,?,?,?,?,?,?,?,?)",
            ("PR001", "Aceite 5%", "percent", 5.0, "2026-11-01", "2026-12-31", 1, "P014", None),
        )
        con.execute("INSERT OR IGNORE INTO meta VALUES ('invoiceNo','45231')")
        con.execute("INSERT OR IGNORE INTO meta VALUES ('shiftNo','428')")


def insert_seed(con):
    with con:
        for table in ("sale_tenders", "sale_items", "invoices", "sales", "shifts",
                      "collection_events", "credit_evaluations", "promotions",
                      "fiscal_talonarios", "audit_log", "sessions", "products", "clients", "cxc"):
            con.execute(f"DELETE FROM {table}")
        con.executemany(
            "INSERT INTO products VALUES (:id,:code,:name,:cat,:price,:dist,:mayor,:cost,:stock,:isv,:promo)",
            SEED["products"],
        )
        con.executemany(
            "INSERT INTO clients VALUES (:id,:name,:doc,:phone,:cat,:credit_limit,:balance,:purchases,:status,:addr)",
            SEED["clients"],
        )
        con.executemany(
            "INSERT INTO cxc VALUES (:id,:client,:doc,:issue,:due,:balance,:days,:status)",
            SEED["cxc"],
        )
        insert_reference(con)
        con.executemany(
            "INSERT OR REPLACE INTO meta VALUES (?,?)",
            [("ticketNo", str(SEED["ticketNo"])), ("receiptNo", str(SEED["receiptNo"])),
             ("shiftNo", "428"), ("seeded", "1")],
        )


def ensure_seed(con):
    row = con.execute("SELECT value FROM meta WHERE key='seeded'").fetchone()
    if not row:
        insert_seed(con)
    insert_reference(con)


def read_state(con):
    products = [dict(r) for r in con.execute("SELECT * FROM products ORDER BY rowid")]
    clients = [dict(r) for r in con.execute("SELECT * FROM clients ORDER BY rowid")]
    cxc = [dict(r) for r in con.execute("SELECT * FROM cxc ORDER BY rowid")]
    meta = {r["key"]: r["value"] for r in con.execute("SELECT * FROM meta")}
    # El front-end usa `limit`; la BD usa `credit_limit` para evitar la palabra reservada.
    for c in clients:
        c["limit"] = c.pop("credit_limit")
    return {
        "products": products, "clients": clients, "cxc": cxc,
        "ticketNo": int(meta.get("ticketNo", 428)), "receiptNo": int(meta.get("receiptNo", 912)),
        "activeShift": dict(con.execute("SELECT * FROM shifts WHERE status='open' ORDER BY opened_at DESC LIMIT 1").fetchone()) if con.execute("SELECT 1 FROM shifts WHERE status='open' LIMIT 1").fetchone() else None,
        "talonarios": [dict(r) for r in con.execute("SELECT * FROM fiscal_talonarios ORDER BY rowid")],
        "promotions": [dict(r) for r in con.execute("SELECT * FROM promotions ORDER BY rowid")],
    }


def validate(payload):
    if not isinstance(payload, dict):
        raise ValueError("El cuerpo debe ser un objeto JSON")
    for key in ("products", "clients", "cxc"):
        if not isinstance(payload.get(key), list):
            raise ValueError(f"Falta la lista '{key}'")
    ids = {}
    for key in ("products", "clients", "cxc"):
        seen = set()
        for row in payload[key]:
            if not isinstance(row, dict) or not row.get("id"):
                raise ValueError(f"Registro sin id en {key}")
            if row["id"] in seen:
                raise ValueError(f"Id duplicado {row['id']} en {key}")
            seen.add(row["id"])
        ids[key] = seen
    for p in payload["products"]:
        for field in ("price", "dist", "mayor", "cost", "stock"):
            if float(p.get(field, -1)) < 0:
                raise ValueError(f"{p['id']}: {field} no puede ser negativo")
        if int(p.get("isv", -1)) not in (0, 15, 18):
            raise ValueError(f"{p['id']}: ISV debe ser 0, 15 o 18")
    for c in payload["clients"]:
        for field in ("balance", "purchases"):
            if float(c.get(field, -1)) < 0:
                raise ValueError(f"{c['id']}: {field} no puede ser negativo")
        if float(c.get("credit_limit", c.get("limit", -1))) < 0:
            raise ValueError(f"{c['id']}: límite de crédito no puede ser negativo")
    for k in payload["cxc"]:
        if float(k.get("balance", -1)) < 0:
            raise ValueError(f"{k['id']}: balance no puede ser negativo")
    return True


def write_state(payload):
    validate(payload)
    with LOCK:
        con = connect()
        try:
            with con:
                con.execute("DELETE FROM products")
                con.execute("DELETE FROM clients")
                con.execute("DELETE FROM cxc")
                con.executemany(
                    "INSERT INTO products VALUES (:id,:code,:name,:cat,:price,:dist,:mayor,:cost,:stock,:isv,:promo)",
                    payload["products"],
                )
                clients = []
                for c in payload["clients"]:
                    row = dict(c)
                    row["credit_limit"] = row.pop("limit", row.get("credit_limit", 0))
                    clients.append(row)
                con.executemany(
                    "INSERT INTO clients VALUES (:id,:name,:doc,:phone,:cat,:credit_limit,:balance,:purchases,:status,:addr)",
                    clients,
                )
                con.executemany(
                    "INSERT INTO cxc VALUES (:id,:client,:doc,:issue,:due,:balance,:days,:status)",
                    payload["cxc"],
                )
                con.executemany(
                    "INSERT OR REPLACE INTO meta VALUES (?,?)",
                    [("ticketNo", str(int(payload.get("ticketNo", 428)))),
                     ("receiptNo", str(int(payload.get("receiptNo", 912))))],
                )
            return read_state(con)
        finally:
            con.close()


def now_iso():
    return datetime.utcnow().isoformat(timespec="seconds")


def meta_int(con, key, default=0):
    row = con.execute("SELECT value FROM meta WHERE key=?", (key,)).fetchone()
    return int(row["value"]) if row else default


def set_meta(con, key, value):
    con.execute("INSERT OR REPLACE INTO meta VALUES (?,?)", (key, str(value)))


def audit(con, user_id, action, entity, entity_id=None, detail=None):
    con.execute(
        "INSERT INTO audit_log(user_id,action,entity,entity_id,detail,created_at) VALUES (?,?,?,?,?,?)",
        (user_id, action, entity, entity_id, json.dumps(detail, ensure_ascii=False) if detail else None, now_iso()),
    )


def open_shift(con, initial_cash, user_id="U001"):
    if float(initial_cash) <= 0:
        raise ValueError("El fondo inicial debe ser mayor a cero")
    user = con.execute("SELECT id FROM users WHERE id=? AND active=1", (user_id,)).fetchone()
    if not user:
        raise ValueError("Usuario no válido")
    existing = con.execute("SELECT id FROM shifts WHERE user_id=? AND status='open'", (user_id,)).fetchone()
    if existing:
        return dict(con.execute("SELECT * FROM shifts WHERE id=?", (existing["id"],)).fetchone())
    number = meta_int(con, "shiftNo", 428)
    set_meta(con, "shiftNo", number + 1)
    shift_id = f"T-{number:05d}"
    con.execute(
        "INSERT INTO shifts(id,user_id,opened_at,initial_cash,status) VALUES (?,?,?,?,'open')",
        (shift_id, user_id, now_iso(), float(initial_cash)),
    )
    audit(con, user_id, "open_shift", "shift", shift_id, {"initial_cash": initial_cash})
    return dict(con.execute("SELECT * FROM shifts WHERE id=?", (shift_id,)).fetchone())


def shift_action(con, shift_id, action, amount=0, note=None, user_id="U001"):
    shift = con.execute("SELECT * FROM shifts WHERE id=?", (shift_id,)).fetchone()
    if not shift or shift["status"] != "open":
        raise ValueError("Turno no encontrado o ya cerrado")
    if action == "withdraw":
        amount = float(amount)
        available = float(shift["initial_cash"] + shift["cash_sales"] - shift["withdrawals"])
        if amount <= 0 or amount > available:
            raise ValueError("Monto de retiro inválido")
        con.execute("UPDATE shifts SET withdrawals=withdrawals+? WHERE id=?", (amount, shift_id))
    elif action == "close":
        counted = float(amount)
        if counted < 0:
            raise ValueError("Efectivo contado inválido")
        theoretical = float(shift["initial_cash"] + shift["cash_sales"] - shift["withdrawals"])
        difference = round(counted - theoretical, 2)
        if abs(difference) > 50 and not note:
            raise ValueError("Explique la diferencia antes de cerrar")
        con.execute(
            "UPDATE shifts SET closed_at=?,counted_cash=?,difference=?,note=?,status='closed' WHERE id=?",
            (now_iso(), counted, difference, note, shift_id),
        )
    else:
        raise ValueError("Acción de turno no válida")
    audit(con, user_id, action, "shift", shift_id, {"amount": amount, "note": note})
    return dict(con.execute("SELECT * FROM shifts WHERE id=?", (shift_id,)).fetchone())


def create_sale(con, payload):
    items = payload.get("items")
    tenders = payload.get("tenders")
    if not isinstance(items, list) or not items:
        raise ValueError("La venta debe tener productos")
    if not isinstance(tenders, list) or not tenders:
        raise ValueError("La venta debe tener un método de pago")
    shift_id = payload.get("shift_id")
    shift = con.execute("SELECT * FROM shifts WHERE id=? AND status='open'", (shift_id,)).fetchone()
    if not shift:
        raise ValueError("No hay turno abierto")
    client_id = payload.get("client_id")
    if client_id and not con.execute("SELECT id FROM clients WHERE id=?", (client_id,)).fetchone():
        raise ValueError("Cliente no válido")
    seller_id = payload.get("seller_id") or "U001"
    base15 = base18 = exempt = tax = total = 0.0
    lines = []
    for item in items:
        product = con.execute("SELECT * FROM products WHERE id=?", (item.get("product_id"),)).fetchone()
        if not product:
            raise ValueError("Producto no válido")
        qty = float(item.get("qty", 0))
        if qty <= 0 or qty > float(product["stock"]):
            raise ValueError(f"Stock insuficiente para {product['name']}")
        price = float(product["price"])
        subtotal = round(qty * price, 2)
        if int(product["isv"]) == 15:
            base15 += subtotal
        elif int(product["isv"]) == 18:
            base18 += subtotal
        else:
            exempt += subtotal
        lines.append((product, qty, price, subtotal))
    tax = round(base15 * .15 + base18 * .18, 2)
    discount = round(float(payload.get("discount", 0)), 2)
    if discount < 0 or discount > base15 + base18 + exempt:
        raise ValueError("Descuento inválido")
    total = round(base15 + base18 + exempt + tax - discount, 2)
    allowed = {"Efectivo", "Transferencia ACH", "Tarjeta", "Crédito autorizado"}
    clean_tenders = []
    for tender in tenders:
        method = tender.get("method")
        amount = round(float(tender.get("amount", 0)), 2)
        if method not in allowed or amount <= 0:
            raise ValueError("Método o monto de pago inválido")
        clean_tenders.append((method, amount, str(tender.get("reference") or "")))
    paid = round(sum(t[1] for t in clean_tenders), 2)
    if paid + .005 < total:
        raise ValueError("Los pagos no cubren el total")
    credit_part = round(sum(t[1] for t in clean_tenders if t[0] == "Crédito autorizado"), 2)
    if credit_part > 0:
        if not client_id:
            raise ValueError("Se requiere cliente para crédito")
        client = con.execute("SELECT * FROM clients WHERE id=?", (client_id,)).fetchone()
        if credit_part > float(client["credit_limit"] - client["balance"]):
            raise ValueError("Crédito insuficiente")
    talonario = con.execute(
        "SELECT * FROM fiscal_talonarios WHERE active=1 AND current_number<range_end AND due_date>=date('now') ORDER BY rowid LIMIT 1"
    ).fetchone()
    if not talonario:
        raise ValueError("No hay talonario fiscal disponible")
    ticket_no = meta_int(con, "ticketNo", 428)
    invoice_no = meta_int(con, "invoiceNo", 45231)
    sale_id = f"V-{ticket_no:05d}"
    invoice_id = f"FAC-{ticket_no:05d}"
    invoice_number = f"001-001-01-{invoice_no:08d}"
    created_at = now_iso()
    due_date = (datetime.utcnow() + timedelta(days=30)).date().isoformat()
    qr_hash = "SAR-" + hashlib.sha256(f"{invoice_number}|{total}|{created_at}".encode()).hexdigest()[:10].upper()
    with con:
        con.execute(
            "INSERT INTO sales VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'paid')",
            (sale_id, shift_id, client_id, seller_id, ticket_no, created_at,
             round(base15,2), round(base18,2), round(exempt,2), tax, discount, total),
        )
        for product, qty, price, subtotal in lines:
            margin = round((price - float(product["cost"])) * qty, 2)
            con.execute(
                "INSERT INTO sale_items(sale_id,product_id,qty,unit_price,discount_pct,subtotal,margin) VALUES (?,?,?,?,?,?,?)",
                (sale_id, product["id"], qty, price, 0, subtotal, margin),
            )
            con.execute("UPDATE products SET stock=stock-? WHERE id=?", (qty, product["id"]))
        for method, amount, reference in clean_tenders:
            con.execute(
                "INSERT INTO sale_tenders(sale_id,method,amount,reference) VALUES (?,?,?,?)",
                (sale_id, method, amount, reference),
            )
            if method == "Efectivo":
                con.execute("UPDATE shifts SET cash_sales=cash_sales+? WHERE id=?", (amount, shift_id))
            elif method == "Tarjeta":
                con.execute("UPDATE shifts SET card_sales=card_sales+? WHERE id=?", (amount, shift_id))
            elif method == "Transferencia ACH":
                con.execute("UPDATE shifts SET ach_sales=ach_sales+? WHERE id=?", (amount, shift_id))
            elif method == "Crédito autorizado":
                con.execute("UPDATE shifts SET credit_sales=credit_sales+? WHERE id=?", (amount, shift_id))
        con.execute(
            "INSERT INTO invoices VALUES (?,?,?,?,?,?,?,?,'issued')",
            (invoice_id, sale_id, client_id, invoice_number, talonario["id"], created_at, due_date, qr_hash),
        )
        con.execute(
            "UPDATE fiscal_talonarios SET current_number=current_number+1 WHERE id=?", (talonario["id"],)
        )
        if credit_part > 0:
            con.execute("UPDATE clients SET balance=balance+?,purchases=purchases+? WHERE id=?", (credit_part, total, client_id))
            cxc_id = f"K-{ticket_no:05d}"
            con.execute(
                "INSERT INTO cxc VALUES (?,?,?,?,?,?,?,?)",
                (cxc_id, con.execute("SELECT name FROM clients WHERE id=?", (client_id,)).fetchone()["name"],
                 invoice_number, created_at[:10], due_date, credit_part, 0, "Vigente"),
            )
        set_meta(con, "ticketNo", ticket_no + 1)
        set_meta(con, "invoiceNo", invoice_no + 1)
        audit(con, seller_id, "create_sale", "sale", sale_id, {"total": total, "invoice": invoice_number})
    sale = dict(con.execute("SELECT * FROM sales WHERE id=?", (sale_id,)).fetchone())
    sale["lines"] = []
    for row in con.execute(
        "SELECT si.*,p.name,p.isv FROM sale_items si JOIN products p ON p.id=si.product_id WHERE sale_id=?", (sale_id,)
    ):
        sale["lines"].append({"name":row["name"],"qty":row["qty"],"price":row["unit_price"],"isv":row["isv"],"subtotal":row["subtotal"]})
    sale["tenders"] = [dict(r) for r in con.execute("SELECT method,amount,reference FROM sale_tenders WHERE sale_id=?", (sale_id,))]
    sale["client"] = dict(con.execute("SELECT * FROM clients WHERE id=?", (client_id,)).fetchone()) if client_id else None
    if sale["client"]:
        sale["client"]["limit"] = sale["client"].pop("credit_limit")
    sale["invoice"] = invoice_number
    sale["invoice_id"] = invoice_id
    sale["qr_hash"] = qr_hash
    sale["cai"] = talonario["cai"]
    sale["due_date"] = due_date
    sale["date"] = created_at[:10]
    sale["time"] = created_at[11:16]
    sale["totals"] = {"b15":round(base15,2),"b18":round(base18,2),"ex":round(exempt,2),"isv":tax,"disc":discount,"total":total}
    sale["method"] = " + ".join(t[0] for t in clean_tenders)
    sale["ref"] = " / ".join(t[2] for t in clean_tenders if t[2]) or "EFECTIVO"
    return sale


MIME = {
    ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
    ".md": "text/markdown; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml",
}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("[COAGRO] " + (fmt % args))

    def send_json(self, obj, status=200):
        data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        self.end_headers()
        self.wfile.write(data)

    def body(self):
        size = int(self.headers.get("Content-Length", 0))
        if size > 2_000_000:
            raise ValueError("Cuerpo JSON demasiado grande (máximo 2 MB)")
        return json.loads(self.rfile.read(size).decode("utf-8") or "{}")

    def auth(self, con, required=False):
        token = self.headers.get("Authorization", "").replace("Bearer ", "")
        user = user_from_token(con, token)
        if required and not user:
            raise PermissionError("Sesión no válida o expirada")
        return user

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path in ("/api/health", "/health"):
            self.send_json({"ok": True, "db": str(DB_PATH.relative_to(ROOT)), "seed": "determinista v1"})
            return
        if path == "/api/me":
            with LOCK:
                con = connect()
                try:
                    ensure_seed(con)
                    user = self.auth(con)
                    self.send_json({"user": user})
                finally:
                    con.close()
            return
        if path == "/api/audit":
            with LOCK:
                con = connect()
                try:
                    ensure_seed(con)
                    user = self.auth(con, True)
                    if user["role"] not in ("admin", "gerente"):
                        self.send_json({"error": "Acceso denegado"}, 403)
                        return
                    rows = [dict(r) for r in con.execute("SELECT * FROM audit_log ORDER BY id DESC LIMIT 100")]
                    self.send_json({"events": rows})
                finally:
                    con.close()
            return
        if path == "/api/state":
            with LOCK:
                con = connect()
                try:
                    ensure_seed(con)
                    self.send_json(read_state(con))
                finally:
                    con.close()
            return
        if path.startswith("/api/"):
            self.send_json({"error": "Endpoint no encontrado"}, 404)
            return
        rel = "index.html" if path == "/" else path.lstrip("/")
        target = (ROOT / rel).resolve()
        if ROOT not in target.parents and target != ROOT:
            self.send_json({"error": "Acceso denegado"}, 403)
            return
        if not target.is_file():
            self.send_json({"error": "No encontrado"}, 404)
            return
        data = target.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", MIME.get(target.suffix.lower(), "application/octet-stream"))
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        self.end_headers()
        self.wfile.write(data)

    def do_PUT(self):
        if self.path.split("?", 1)[0] != "/api/state":
            self.send_json({"error": "Endpoint no encontrado"}, 404)
            return
        try:
            payload = self.body()
            with LOCK:
                con = connect()
                try:
                    ensure_seed(con)
                    user = self.auth(con, True)
                    before = read_state(con)
                    if payload["products"] != before["products"] and user["role"] not in ("admin", "gerente"):
                        self.send_json({"error": "Rol no autorizado para modificar productos"}, 403)
                        return
                    if payload["cxc"] != before["cxc"] and user["role"] not in ("creditos", "gerente", "admin"):
                        self.send_json({"error": "Rol no autorizado para modificar cartera"}, 403)
                        return
                    if payload["clients"] != before["clients"] and user["role"] not in ("vendedor", "creditos", "gerente", "admin"):
                        self.send_json({"error": "Rol no autorizado para modificar clientes"}, 403)
                        return
                    result = write_state(payload)
                    audit(con, user["id"], "update_state", "master_data", None, {"products":len(payload["products"]),"clients":len(payload["clients"]),"cxc":len(payload["cxc"])})
                    con.commit()
                    self.send_json(result)
                finally:
                    con.close()
        except PermissionError as exc:
            self.send_json({"error": str(exc)}, 403)
        except (ValueError, TypeError, sqlite3.Error) as exc:
            self.send_json({"error": str(exc)}, 400)

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        try:
            payload = self.body()
            if path == "/api/login":
                with LOCK:
                    con = connect()
                    try:
                        ensure_seed(con)
                        username = str(payload.get("username", "")).strip()
                        password = str(payload.get("password", ""))
                        user = con.execute("SELECT * FROM users WHERE username=? AND active=1", (username,)).fetchone()
                        if not user or not verify_password(password, user["password_hash"]):
                            self.send_json({"error": "Usuario o contraseña incorrectos"}, 401)
                            return
                        if not user["password_hash"].startswith("pbkdf2$"):
                            con.execute("UPDATE users SET password_hash=? WHERE id=?", (hash_password(password), user["id"]))
                        token = create_session(con, user["id"])
                        audit(con, user["id"], "login", "session", token[:8], {"username":username})
                        con.commit()
                        safe = dict(user); safe.pop("password_hash", None)
                        self.send_json({"token":token,"user":safe})
                    finally:
                        con.close()
                return
            if path == "/api/logout":
                with LOCK:
                    con = connect()
                    try:
                        ensure_seed(con)
                        token = payload.get("token") or self.headers.get("Authorization", "").replace("Bearer ", "")
                        user = self.auth(con)
                        con.execute("DELETE FROM sessions WHERE token=?", (token,))
                        if user: audit(con, user["id"], "logout", "session", token[:8], None)
                        con.commit()
                        self.send_json({"ok":True})
                    finally:
                        con.close()
                return
            if path == "/api/reset":
                with LOCK:
                    con = connect()
                    try:
                        insert_seed(con)
                        self.send_json(read_state(con))
                    finally:
                        con.close()
                return
            if path == "/api/shifts/open":
                with LOCK:
                    con = connect()
                    try:
                        ensure_seed(con)
                        user = self.auth(con, True)
                        if user["role"] not in ("cajero", "vendedor", "admin"):
                            self.send_json({"error": "Rol no autorizado para abrir turno"}, 403)
                            return
                        with con:
                            shift = open_shift(con, payload.get("initial_cash", 0), user["id"])
                        self.send_json({"shift": shift, "state": read_state(con)})
                    finally:
                        con.close()
                return
            if path.startswith("/api/shifts/") and path.endswith("/close"):
                shift_id = path.split("/")[-2]
                with LOCK:
                    con = connect()
                    try:
                        ensure_seed(con)
                        user = self.auth(con, True)
                        if user["role"] not in ("cajero", "admin"):
                            self.send_json({"error": "Rol no autorizado para cerrar turno"}, 403)
                            return
                        with con:
                            shift = shift_action(con, shift_id, "close", payload.get("counted_cash", 0), payload.get("note"), user["id"])
                        self.send_json({"shift": shift, "state": read_state(con)})
                    finally:
                        con.close()
                return
            if path.startswith("/api/shifts/") and path.endswith("/withdraw"):
                shift_id = path.split("/")[-2]
                with LOCK:
                    con = connect()
                    try:
                        ensure_seed(con)
                        user = self.auth(con, True)
                        if user["role"] not in ("cajero", "admin"):
                            self.send_json({"error": "Rol no autorizado para retiros"}, 403)
                            return
                        with con:
                            shift = shift_action(con, shift_id, "withdraw", payload.get("amount", 0), payload.get("reason"), user["id"])
                        self.send_json({"shift": shift, "state": read_state(con)})
                    finally:
                        con.close()
                return
            if path == "/api/sales":
                with LOCK:
                    con = connect()
                    try:
                        ensure_seed(con)
                        user = self.auth(con, True)
                        if user["role"] not in ("cajero", "vendedor", "admin"):
                            self.send_json({"error": "Rol no autorizado para vender"}, 403)
                            return
                        payload["seller_id"] = user["id"]
                        sale = create_sale(con, payload)
                        self.send_json({"sale": sale, "state": read_state(con)})
                    finally:
                        con.close()
                return
            self.send_json({"error": "Endpoint no encontrado"}, 404)
        except PermissionError as exc:
            self.send_json({"error": str(exc)}, 403)
        except (ValueError, TypeError, sqlite3.Error, json.JSONDecodeError) as exc:
            self.send_json({"error": str(exc)}, 400)


if __name__ == "__main__":
    con = connect()
    try:
        ensure_seed(con)
    finally:
        con.close()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"COAGRO POS backend → http://localhost:{PORT}  (SQLite: {DB_PATH})")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
    finally:
        server.server_close()
