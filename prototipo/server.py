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

import json
import os
import sqlite3
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "data" / "coagro.db"
# Render inyecta PORT; en local se usa COAGRO_PORT o 8000.
PORT = int(os.environ.get("PORT") or os.environ.get("COAGRO_PORT") or "8000")
HOST = os.environ.get("HOST", "0.0.0.0")
LOCK = threading.Lock()

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
"""


def connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB_PATH, timeout=10)
    con.row_factory = sqlite3.Row
    con.executescript(SCHEMA)
    return con


def insert_seed(con):
    with con:
        for table in ("products", "clients", "cxc"):
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
        con.executemany(
            "INSERT OR REPLACE INTO meta VALUES (?,?)",
            [("ticketNo", str(SEED["ticketNo"])), ("receiptNo", str(SEED["receiptNo"])), ("seeded", "1")],
        )


def ensure_seed(con):
    row = con.execute("SELECT value FROM meta WHERE key='seeded'").fetchone()
    if not row:
        insert_seed(con)


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
        self.end_headers()
        self.wfile.write(data)

    def body(self):
        size = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(size).decode("utf-8") or "{}")

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/health":
            self.send_json({"ok": True, "db": str(DB_PATH.relative_to(ROOT)), "seed": "determinista v1"})
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
        self.end_headers()
        self.wfile.write(data)

    def do_PUT(self):
        if self.path.split("?", 1)[0] != "/api/state":
            self.send_json({"error": "Endpoint no encontrado"}, 404)
            return
        try:
            self.send_json(write_state(self.body()))
        except (ValueError, TypeError, sqlite3.Error) as exc:
            self.send_json({"error": str(exc)}, 400)

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if path != "/api/reset":
            self.send_json({"error": "Endpoint no encontrado"}, 404)
            return
        with LOCK:
            con = connect()
            try:
                insert_seed(con)
                self.send_json(read_state(con))
            finally:
                con.close()


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
