/* =====================================================================
   COAGRO POS · Prototipo interactivo funcional
   Sin dependencias. Vanilla JS. Todo corre abriendo index.html.
   ===================================================================== */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const money = n => 'L ' + Number(n || 0).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const today = () => new Date().toLocaleDateString('es-HN', { day: '2-digit', month: '2-digit', year: 'numeric' });
const DEMO_TODAY = new Date(2026, 10, 25);
const daysUntil = str => { const [d,m,y] = str.split('/').map(Number); return Math.round((new Date(y, m-1, d) - DEMO_TODAY) / 86400000); };
const porVencer = () => cxc.filter(k => k.status === 'Vigente' && daysUntil(k.due) >= 0 && daysUntil(k.due) <= 15)
  .reduce((s,k) => s + k.balance, 0);

/* ------------------------------------------------------------------ DATOS */
const products = [
  { id:'P001', code:'7791234001', name:'Arroz 5 lb',            cat:'Abarrotes',  price:78,   dist:72,   mayor:68,   cost:58,   stock:45, isv:15, promo:'' },
  { id:'P014', code:'7791234014', name:'Aceite 1 L',            cat:'Abarrotes',  price:92,   dist:86,   mayor:82,   cost:68,   stock:28, isv:15, promo:'-5%' },
  { id:'P022', code:'7791234022', name:'Frijol rojo 2 lb',      cat:'Abarrotes',  price:68,   dist:63,   mayor:60,   cost:49,   stock:60, isv:15, promo:'2 x L 125' },
  { id:'P031', code:'7791234031', name:'Azúcar 2 lb',           cat:'Abarrotes',  price:34,   dist:31,   mayor:29,   cost:24,   stock:12, isv:15, promo:'' },
  { id:'P045', code:'7791234045', name:'Leche 1 L',             cat:'Lácteos',    price:45,   dist:42,   mayor:39,   cost:33,   stock:34, isv:15, promo:'' },
  { id:'P052', code:'7791234052', name:'Harina 5 lb',           cat:'Abarrotes',  price:55,   dist:51,   mayor:48,   cost:40,   stock:21, isv:15, promo:'' },
  { id:'P060', code:'7791234060', name:'Café 400 g',            cat:'Abarrotes',  price:90,   dist:84,   mayor:79,   cost:66,   stock:17, isv:18, promo:'2 x L 170' },
  { id:'P071', code:'7791234071', name:'Pasta 200 g',           cat:'Abarrotes',  price:30,   dist:27,   mayor:25,   cost:20,   stock:80, isv:15, promo:'' },
  { id:'P083', code:'7791234083', name:'Jabón barra',           cat:'Limpieza',   price:30,   dist:27,   mayor:25,   cost:19,   stock:40, isv:15, promo:'' },
  { id:'P090', code:'7791234090', name:'Sal 1 lb',              cat:'Abarrotes',  price:15,   dist:13,   mayor:12,   cost:9,    stock:95, isv:0,  promo:'' },
  { id:'P104', code:'7791234104', name:'Fertilizante NPK 50 lb',cat:'Agro',       price:680,  dist:640,  mayor:610,  cost:520,  stock:14, isv:15, promo:'' },
  { id:'P118', code:'7791234118', name:'Machete acero 20"',     cat:'Ferretería', price:320,  dist:300,  mayor:285,  cost:235,  stock:9,  isv:18, promo:'' },
  { id:'P126', code:'7791234126', name:'Taladro 1/2"',          cat:'Ferretería', price:2450, dist:2300, mayor:2180, cost:1820, stock:6,  isv:18, promo:'' },
  { id:'P133', code:'7791234133', name:'Alambre galvanizado',   cat:'Ferretería', price:125,  dist:116,  mayor:110,  cost:88,   stock:0,  isv:15, promo:'' }
];

const clients = [
  { id:'C001', name:'María Fernanda López', doc:'0801-1990-12345', phone:'9999-0000', cat:'Frecuente',  limit:5000,  balance:1250,  purchases:28450, status:'Vigente', addr:'Catacamas, Olancho' },
  { id:'C002', name:'José A. Rivera',       doc:'0801-1985-09876', phone:'9988-1122', cat:'Crédito',    limit:8000,  balance:620,   purchases:41200, status:'Vencido', addr:'Dulce Nombre de Culmí' },
  { id:'C003', name:'Comercial El Sol',     doc:'0801-2001-05555', phone:'9977-3344', cat:'Mayorista',  limit:25000, balance:6800,  purchases:98750, status:'Vigente', addr:'San Francisco de Becerra' },
  { id:'C004', name:'Ana L. Zelaya',        doc:'0801-1995-07777', phone:'9966-2211', cat:'Frecuente',  limit:3500,  balance:0,     purchases:12380, status:'Vigente', addr:'Catacamas, Olancho' },
  { id:'C005', name:'Coop. Ganadera Olancho',doc:'0801-1992-03333',phone:'9955-6677', cat:'Corporativo',limit:30000, balance:1437.5, purchases:156400,status:'Vencido', addr:'Catacamas, Olancho' },
  { id:'C006', name:'Roberto Paredes',      doc:'0801-1988-01111', phone:'9944-8899', cat:'Crédito',    limit:2000,  balance:380,   purchases:7620,  status:'Vigente', addr:'Juticalpa, Olancho' }
];

const cxc = [
  { id:'K001', client:'María Fernanda López', doc:'FAC-00111', issue:'02/11/2026', due:'05/12/2026', balance:620,  days:0,  status:'Vigente' },
  { id:'K002', client:'José A. Rivera',       doc:'FAC-00098', issue:'18/10/2026', due:'02/11/2026', balance:620,   days:23, status:'Vencido' },
  { id:'K003', client:'Comercial El Sol',     doc:'FAC-00091', issue:'05/11/2026', due:'20/11/2026', balance:1180,  days:0,  status:'Vigente' },
  { id:'K004', client:'Coop. Ganadera Olancho',doc:'FAC-00083',issue:'28/09/2026', due:'12/10/2026', balance:1437.5,days:44, status:'Vencido' },
  { id:'K005', client:'Roberto Paredes',      doc:'FAC-00119', issue:'20/11/2026', due:'05/12/2026', balance:380,  days:0,  status:'Vigente' },
  { id:'K006', client:'María Fernanda López', doc:'FAC-00124', issue:'22/11/2026', due:'07/12/2026', balance:630,  days:0,  status:'Vigente' }
];

const history = {
  C001:[
    { date:'22/11/2026', doc:'FAC-00124', text:'Compra de abarrotes', total:630,  state:'Crédito' },
    { date:'08/11/2026', doc:'FAC-00128', text:'Compra de abarrotes', total:850,  state:'Pagada' },
    { date:'02/11/2026', doc:'FAC-00111', text:'Insumos agrícolas',   total:620,  state:'Crédito' }
  ],
  C002:[
    { date:'18/10/2026', doc:'FAC-00098', text:'Materiales de construcción', total:620, state:'Vencido' },
    { date:'29/09/2026', doc:'FAC-00087', text:'Repuestos de maquinaria', total:3180,  state:'Pagada' }
  ]
};

const topProducts = [
  { name:'Arroz 5 lb', units:124, sales:9672 }, { name:'Aceite 1 L', units:98, sales:9016 },
  { name:'Frijol rojo 2 lb', units:87, sales:5916 }, { name:'Café 400 g', units:49, sales:4410 },
  { name:'Harina 5 lb', units:55, sales:3025 }, { name:'Leche 1 L', units:61, sales:2745 },
  { name:'Azúcar 2 lb', units:72, sales:2448 }, { name:'Pasta 200 g', units:46, sales:1380 },
  { name:'Jabón barra', units:41, sales:1230 }, { name:'Sal 1 lb', units:38, sales:570 }
];

const sellers = [
  { name:'Alberto C.', pct:92, goal:'L 28,000', sales:25760 },
  { name:'Keyli M.', pct:78, goal:'L 24,000', sales:18720 },
  { name:'Carlos R.', pct:64, goal:'L 20,000', sales:12800 },
  { name:'Xiomara S.', pct:46, goal:'L 18,000', sales:8280 }
];

/* ------------------------------------------------------------------ ESTADO */
const state = {
  screen:'login', shift:null, cart:[], client:null, payMethod:'efectivo',
  user:null, token:null, talonarios:[], promotions:[], sellerLimits:{},
  category:'Todas', productFilter:'', productLimit:8, selectedClient:'C001', cxcTab:'todas',
  cxcFilter:'', promosOnly:false, revealed:false, lastSale:null,
  range:'hoy', ticketNo:428, receiptNo:912
};

const titles = {
  login:['Operación','Inicio de sesión'], pos:['Módulo 01 · TPS','Punto de venta'],
  clientes:['Módulo 04 · CRM','Clientes y crédito'], factura:['Módulo 02 · SAR','Factura fiscal'],
  productos:['Módulo 03 · Catálogo','Productos y precios'], cxc:['Módulo 04 · CxC','Cuentas por cobrar'],
  cierre:['Módulo 01 · Caja','Cierre de turno'], dashboard:['Módulo 06 · DSS','Panel comercial']
};
const roleAccess = {
  cajero:['pos','factura','cierre'],
  vendedor:['pos','clientes','factura'],
  creditos:['clientes','cxc','factura'],
  gerente:['dashboard','clientes','productos','cxc','factura'],
  admin:['pos','clientes','factura','productos','cxc','cierre','dashboard']
};
const defaultScreen = { cajero:'pos', vendedor:'pos', creditos:'cxc', gerente:'dashboard', admin:'dashboard' };
function canAccess(name) { return !API_ON || name === 'login' || !state.user || (roleAccess[state.user.role] || []).includes(name); }
function applyRole() {
  const user = state.user || { name:'Invitado', role:'—' };
  $('#userMiniName').textContent = user.name;
  $('#userMiniRole').textContent = user.role + ' · Terminal 01';
  $$('.avatar-top,.user-mini .avatar').forEach(el => el.textContent = user.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase());
  $$('[data-go]').forEach(b => { if (b.dataset.go !== 'login') b.hidden = !canAccess(b.dataset.go); });
}

/* Persistencia de datos maestros (catálogo, CRM, cartera y correlativos).
   La sesión de caja (turno, ticket, carrito) sigue siendo volátil a propósito. */
const STORE_KEY = 'coagro_pos_demo_v1';
function saveData() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      products, clients, cxc, ticketNo:state.ticketNo, receiptNo:state.receiptNo
    }));
  } catch (_) { /* modo privado o file:// sin almacenamiento */ }
}
function loadData() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (!d) return;
    if (Array.isArray(d.products) && d.products.length) products.splice(0, products.length, ...d.products);
    if (Array.isArray(d.clients) && d.clients.length) clients.splice(0, clients.length, ...d.clients);
    if (Array.isArray(d.cxc)) cxc.splice(0, cxc.length, ...d.cxc);
    if (Number.isFinite(d.ticketNo)) state.ticketNo = d.ticketNo;
    if (Number.isFinite(d.receiptNo)) state.receiptNo = d.receiptNo;
  } catch (_) { /* datos corruptos: se ignoran */ }
}

/* API real (SQLite) cuando se sirve por HTTP. file:// cae al modo local. */
const API_ON = /^https?:$/.test(location.protocol);
let useApi = false, syncTimer = null;
async function api(path, method='GET', body=null) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  const opts = { method, headers:{ 'Content-Type':'application/json' }, signal:controller.signal };
  if (state.token) opts.headers.Authorization = 'Bearer ' + state.token;
  if (body !== null) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(path, opts);
    if (!res.ok) {
      let msg = ''; try { msg = (await res.json()).error; } catch (_) {}
      throw new Error(msg || ('HTTP ' + res.status));
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('tiempo de espera agotado');
    throw err;
  } finally { clearTimeout(timer); }
}
function snapshot() { return { products, clients, cxc, ticketNo:state.ticketNo, receiptNo:state.receiptNo }; }
function normalizeShift(s) {
  return s ? { ...s, fund:s.initial_cash, opened:(s.opened_at || '').slice(11,16) || new Date().toLocaleTimeString('es-HN',{hour:'2-digit',minute:'2-digit'}),
    cashSales:s.cash_sales || 0, cardSales:s.card_sales || 0, achSales:s.ach_sales || 0 } : null;
}
function applyRemote(d) {
  products.splice(0, products.length, ...d.products);
  clients.splice(0, clients.length, ...d.clients);
  cxc.splice(0, cxc.length, ...d.cxc);
  state.ticketNo = d.ticketNo; state.receiptNo = d.receiptNo;
  if (Array.isArray(d.talonarios)) state.talonarios = d.talonarios;
  if (Array.isArray(d.promotions)) state.promotions = d.promotions;
  if (d.sellerLimits) state.sellerLimits = d.sellerLimits;
  state.shift = normalizeShift(d.activeShift);
}
function updateApiChip() {
  const el = $('#apiChip'); if (!el) return;
  el.textContent = useApi ? 'SQLite · API' : 'Modo local';
  el.classList.toggle('local', !useApi);
}
function persist() {
  if (!useApi) { saveData(); return; }
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try { applyRemote(await api('/api/state','PUT',snapshot())); }
    catch (err) {
      useApi = false; saveData(); updateApiChip();
      toast('API no disponible (' + err.message + ') · modo local', 'warn');
    }
  }, 60);
}

/* ------------------------------------------------------------------ UTILES */
function toast(msg, type='') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `<svg class="ico"><use href="#i-${type === 'error' || type === 'warn' ? 'alert' : 'check'}"/></svg><span>${msg}</span>`;
  const root = $('#toastRoot');
  root.appendChild(el);
  while (root.children.length > 2) root.firstElementChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 3000);
}

let modalCleanup = null, modalIsDismissible = true;
function modal({ title='', sub='', body='', foot='', wide=false, onMount=null, dismissible=true }) {
  modalIsDismissible = dismissible;
  closeModal();
  const root = $('#modalRoot');
  root.innerHTML = `
    <div class="backdrop" data-close></div>
    <div class="modal-panel ${wide ? 'wide' : ''}" role="document">
      <div class="modal-head"><div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div>
      ${dismissible ? '<button class="modal-close" data-close aria-label="Cerrar"><svg class="ico"><use href="#i-x"/></svg></button>' : ''}</div>
      <div class="modal-body">${body}</div>
      ${foot ? `<div class="modal-foot">${foot}</div>` : ''}
    </div>`;
  if (dismissible) $$('[data-close]', root).forEach(b => b.addEventListener('click', closeModal));
  const panel = $('.modal-panel', root);
  const focusables = () => $$('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', panel);
  const first = focusables()[0];
  if (first) setTimeout(() => first.focus(), 40);
  const trap = e => {
    if (e.key !== 'Tab') return;
    const f = focusables(); if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  };
  document.addEventListener('keydown', trap);
  const cleanup = onMount ? onMount(root) : null;
  modalCleanup = () => {
    if (typeof cleanup === 'function') cleanup();
    document.removeEventListener('keydown', trap);
  };
  return root;
}
function closeModal() {
  if (modalCleanup && typeof modalCleanup === 'function') { modalCleanup(); modalCleanup = null; }
  $('#modalRoot').innerHTML = '';
}
function confirmDialog(title, text, onYes, yesLabel='Confirmar', danger=false) {
  modal({
    title, body:`<p style="font-size:12px;color:var(--muted);margin:0;line-height:1.6">${text}</p>`,
    foot:`<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn ${danger ? 'btn-danger-solid' : 'btn-primary'}" id="confirmYes">${yesLabel}</button>`,
    onMount(r) { $('#confirmYes', r).style.background = danger ? 'var(--red)' : '';
      $('#confirmYes', r).addEventListener('click', () => { closeModal(); onYes(); }); }
  });
}
function processing(text, done) {
  modal({ title:'Procesando…', body:`<div class="processing"><div class="dots"><i></i><i></i><i></i></div><span>${text}</span></div>`, dismissible:false });
  setTimeout(() => { closeModal(); done(); }, 300);
}
function emptyState(title, hint, action='', label='') {
  return `<div class="empty-state"><svg class="ico"><use href="#i-search"/></svg><b>${title}</b><span>${hint}</span>${action ? `<button type="button" class="btn btn-soft" data-empty="${action}">${label}</button>` : ''}</div>`;
}
function debounce(fn, ms=100) {
  let timer = null;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-empty]'); if (!b) return;
  if (b.dataset.empty === 'clients') { $('#clientSearch').value = ''; renderClientList(); }
  if (b.dataset.empty === 'products') { $('#productTableSearch').value = ''; $('#categoryFilter').value = 'todas'; state.promosOnly = false; $('#filterPromos').classList.remove('btn-primary'); $('#filterPromos').classList.add('btn-soft'); renderProductTable(); }
  if (b.dataset.empty === 'cxc') { $('#cxcSearch').value = ''; state.cxcFilter = ''; state.cxcTab = 'todas'; $$('#cxcTabs .tab').forEach(x => x.classList.toggle('active', x.dataset.tab === 'todas')); renderCxc(); }
});

/* ------------------------------------------------------------------ NAVEGACIÓN */
function navTo(name) {
  if (!titles[name]) return;
  if (!canAccess(name)) name = defaultScreen[state.user.role] || 'login';
  state.screen = name;
  document.body.classList.toggle('auth-mode', name === 'login');
  applyRole();
  if (name === 'login') {
    $('#loginCard').hidden = false;
    $('#openingCard').hidden = true;
    $('#openingError').textContent = '';
  }
  $$('.screen').forEach(s => s.classList.toggle('active', s.dataset.screen === name));
  $$('[data-go]').forEach(b => {
    const active = b.dataset.go === name;
    b.classList.toggle('active', active);
    if (active) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
  });
  $('#crumbModule').textContent = titles[name][0];
  $('#crumbTitle').textContent = titles[name][1];
  $('#sidebar').classList.remove('open');
  $('#scrim').classList.remove('show');
  window.scrollTo({ top:0, behavior:'smooth' });
  renderAll();
  if (name !== 'pos') $('#mobileCheckout').classList.remove('show');
  const closeBtn = $('#topCloseShift');
  if (closeBtn) closeBtn.hidden = !state.shift || name === 'login' || name === 'cierre' || !canAccess('cierre');
}
$('#topCloseShift').addEventListener('click', () => {
  if (!state.shift) return;
  navTo('cierre');
  toast('Cierre de turno · complete el conteo ciego', 'warn');
});
document.addEventListener('click', e => {
  const go = e.target.closest('[data-go]');
  if (go) { e.preventDefault(); navTo(go.dataset.go); }
});

/* ------------------------------------------------------------------ 01 LOGIN */
function renderOpeningDenoms() {
  const vals = [500,100,50,20,10,5,1,0.5,0.25,0.1,0.05];
  $('#openingDenoms').innerHTML = vals.map((v, i) => `
    <div class="denom-row">
      <span class="denom-label">${v < 1 ? v.toFixed(2) : v}</span>
      <div class="denom-stepper">
        <button type="button" data-step="dec" data-i="${i}" aria-label="Restar"><svg class="ico"><use href="#i-minus"/></svg></button>
        <input type="number" min="0" step="1" value="0" inputmode="numeric" data-open-denom data-i="${i}" aria-label="Cantidad de ${v}">
        <button type="button" data-step="inc" data-i="${i}" aria-label="Sumar"><svg class="ico"><use href="#i-plus"/></svg></button>
      </div>
      <span class="denom-amount" data-open-amount="${i}">L 0.00</span>
    </div>`).join('');
}
const openingValues = [500,100,50,20,10,5,1,0.5,0.25,0.1,0.05];
function updateOpening() {
  let total = 0;
  $$('[data-open-denom]').forEach((inp, i) => {
    const n = Math.max(0, parseInt(inp.value || 0, 10));
    total += n * openingValues[i];
    $(`[data-open-amount="${i}"]`).textContent = money(n * openingValues[i]);
  });
  $('#openingTotal').textContent = money(total);
  return total;
}
$('#openingDenoms').addEventListener('click', e => {
  const btn = e.target.closest('[data-step]');
  if (!btn) return;
  const inp = $(`[data-open-denom][data-i="${btn.dataset.i}"]`);
  inp.value = Math.max(0, (parseInt(inp.value || 0, 10) + (btn.dataset.step === 'inc' ? 1 : -1)));
  updateOpening();
});
$('#openingDenoms').addEventListener('input', updateOpening);

$('#togglePass').addEventListener('click', () => {
  const p = $('#loginPass');
  p.type = p.type === 'password' ? 'text' : 'password';
  $('#togglePass').style.color = p.type === 'text' ? 'var(--accent)' : '';
});
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const u = $('#loginUser').value.trim(), p = $('#loginPass').value;
  $('#userError').textContent = u.length < 3 ? 'Ingrese un usuario válido (3+ caracteres).' : '';
  $('#passError').textContent = p.length < 4 ? 'La contraseña debe tener al menos 4 caracteres.' : '';
  if (u.length < 3 || p.length < 4) { $(u.length < 3 ? '#loginUser' : '#loginPass').focus(); return; }
  $('#loginSubmit').disabled = true;
  try {
    if (useApi) {
      const res = await api('/api/login','POST',{ username:u, password:p });
      state.token = res.token; state.user = res.user;
      try { sessionStorage.setItem('coagro_token', res.token); } catch (_) {}
    } else state.user = { id:'U001', name:'Alberto C.', role:'cajero' };
    applyRole();
    if (['creditos','gerente'].includes(state.user.role)) { navTo(defaultScreen[state.user.role]); toast('Sesión iniciada · ' + state.user.name); return; }
    $('#loginCard').hidden = true;
    $('#openingCard').hidden = false;
    $('#openingDate').textContent = today();
    updateOpening();
    toast('Credenciales verificadas · terminal Caja 01');
  } catch (err) { $('#passError').textContent = err.message; $('#loginPass').focus(); }
  finally { $('#loginSubmit').disabled = false; }
});
$('#backLogin').addEventListener('click', () => { $('#openingCard').hidden = true; $('#loginCard').hidden = false; });
$('#forgotBtn').addEventListener('click', () => modal({
  title:'Recuperar contraseña', sub:'Demostración del flujo de seguridad',
  body:'<p style="font-size:12px;color:var(--muted);line-height:1.6;margin:0">El administrador del sistema recibe la solicitud y envía un enlace temporal al correo institucional del usuario. (Mock funcional)</p>',
  foot:'<button class="btn btn-primary" data-close>Enviar solicitud</button>'
}));
$('#openShiftBtn').addEventListener('click', async () => {
  const total = updateOpening();
  if (total <= 0) { $('#openingError').textContent = 'Registre un fondo inicial mayor a cero para abrir el turno.'; return; }
  $('#openingError').textContent = '';
  $('#openShiftBtn').disabled = true;
  try {
    if (useApi) {
      const res = await api('/api/shifts/open','POST',{ initial_cash:total, user_id:state.user.id });
      state.shift = normalizeShift(res.shift);
      applyRemote(res.state);
    } else {
      state.shift = { id:'T-00428', opened:new Date().toLocaleTimeString('es-HN',{hour:'2-digit',minute:'2-digit'}), fund:total, cashSales:0, cardSales:0, achSales:0, withdrawals:0 };
    }
    $('#shiftState').textContent = 'Turno ' + state.shift.id + ' activo';
    $('#shiftMeta').textContent = 'Fondo: ' + money(total);
    $('.shift-mini').classList.remove('closed');
    toast('Turno abierto · fondo ' + money(total));
    navTo('pos');
  } catch (err) { $('#openingError').textContent = 'No se pudo abrir el turno: ' + err.message; }
  finally { $('#openShiftBtn').disabled = false; }
});

/* ------------------------------------------------------------------ 02 POS */
$('#categoryChips').innerHTML = ['Todas','Abarrotes','Agro','Ferretería','Lácteos','Limpieza']
  .map(c => `<button class="chip ${c === 'Todas' ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('');

function renderProducts() {
  const q = norm(state.productFilter.trim());
  const list = products.filter(p =>
    (state.category === 'Todas' || p.cat === state.category) &&
    (!q || norm(p.name).includes(q) || p.code.includes(q) || norm(p.id).includes(q)) &&
    (!state.promosOnly || p.promo)
  );
  $('#resultCount').textContent = list.length + (list.length === 1 ? ' producto' : ' productos');
  const visible = list.slice(0, state.productLimit);
  $('#productGrid').innerHTML = visible.length ? visible.map((p, i) => `
    <button class="product-card ${p.stock === 0 ? 'oos' : ''}" data-add="${p.id}" style="animation-delay:${Math.min(i * 14, 90)}ms">
      ${p.promo ? `<span class="p-promo">${p.promo}</span>` : ''}
      <span class="p-icon"><svg class="ico"><use href="#i-box"/></svg></span>
      <span class="p-name">${p.name}</span>
      <span class="p-code">${p.id} · ${p.cat}</span>
      <span class="p-bottom"><span class="p-price">${money(p.price)}</span><span class="p-stock">${p.stock === 0 ? 'Agotado' : p.stock + ' und'}</span></span>
    </button>`).join('') : `<div class="catalog-empty"><svg class="ico"><use href="#i-search"/></svg><div>No se encontraron productos</div><small>Intente con otro código o categoría</small></div>`;
  if (list.length > visible.length) $('#productGrid').insertAdjacentHTML('beforeend', `<button class="catalog-more" id="showMoreProducts">Mostrar ${Math.min(8, list.length - visible.length)} productos más</button>`);
}
$('#productSearch').addEventListener('input', debounce(e => { state.productFilter = e.target.value; state.productLimit = 8; renderProducts(); }));
$('#categoryChips').addEventListener('click', e => {
  const chip = e.target.closest('[data-cat]'); if (!chip) return;
  state.category = chip.dataset.cat;
  state.productLimit = 8;
  $$('#categoryChips .chip').forEach(c => { c.classList.toggle('active', c === chip); c.setAttribute('aria-pressed', String(c === chip)); });
  renderProducts();
});
$('#productGrid').addEventListener('click', e => {
  if (e.target.closest('#showMoreProducts')) { state.productLimit += 8; renderProducts(); return; }
  const card = e.target.closest('[data-add]'); if (card) addToCart(card.dataset.add);
});

function addToCart(id) {
  const p = products.find(x => x.id === id); if (!p) return;
  if (p.stock === 0) { toast('Producto agotado: ' + p.name, 'warn'); return; }
  const line = state.cart.find(l => l.id === id);
  if (line) {
    if (line.qty >= p.stock) { toast('Stock máximo disponible: ' + p.stock, 'warn'); return; }
    line.qty++;
  } else state.cart.push({ id, qty:1 });
  renderCart();
  toast(p.name + ' agregado al ticket');
}
function activePromotion(productId) {
  const todayISO = new Date().toISOString().slice(0,10);
  return state.promotions.find(pr => pr.product_id === productId && pr.active && pr.starts_at <= todayISO && pr.ends_at >= todayISO);
}
function lineSubtotal(product, qty) {
  const base = round(product.price * qty), promo = activePromotion(product.id);
  if (!promo) return base;
  if (promo.kind === 'percent') return round(base * (1 - promo.value / 100));
  if (promo.kind === 'fixed') return round(Math.max(0, base - promo.value));
  if (promo.kind === 'combo') {
    try {
      const combo = JSON.parse(promo.combo_json || '{}');
      const groups = Math.floor(qty / combo.qty), remainder = qty - groups * combo.qty;
      return round(groups * combo.price + remainder * product.price);
    } catch (_) { return base; }
  }
  return base;
}
function maxDiscountAmount() {
  const base = state.cart.reduce((sum,l) => { const p = products.find(x=>x.id===l.id); return sum + lineSubtotal(p,l.qty); }, 0);
  const pct = state.sellerLimits[state.user?.id] ?? (['admin','gerente'].includes(state.user?.role) ? 10 : 5);
  return round(base * pct / 100);
}
function totals() {
  let b15 = 0, b18 = 0, ex = 0;
  state.cart.forEach(l => {
    const p = products.find(x => x.id === l.id);
    const base = lineSubtotal(p, l.qty);
    if (p.isv === 15) b15 += base; else if (p.isv === 18) b18 += base; else ex += base;
  });
  const isv = round(b15 * .15 + b18 * .18);
  const disc = Math.min(parseFloat($('#discountInput').value || 0), b15 + b18 + ex);
  return { b15:round(b15), b18:round(b18), ex:round(ex), isv, disc:round(disc), total:round(b15 + b18 + ex + isv - disc) };
}
function renderCart() {
  const t = totals();
  $('#cartLines').innerHTML = state.cart.length ? state.cart.map((l, i) => {
    const p = products.find(x => x.id === l.id);
    return `<div class="cart-row">
      <div><div class="c-name">${p.name}</div><div class="c-sub">${p.id} · ${money(p.price)} · ISV ${p.isv || 'exento'}%${activePromotion(p.id) ? ' · ' + activePromotion(p.id).name : ''}</div></div>
      <div class="qty-ctrl"><button data-q="dec" data-i="${i}" aria-label="Restar"><svg class="ico"><use href="#i-minus"/></svg></button><b>${l.qty}</b><button data-q="inc" data-i="${i}" aria-label="Sumar"><svg class="ico"><use href="#i-plus"/></svg></button></div>
      <div class="c-amount">${money(lineSubtotal(p, l.qty))}</div>
    </div>`;
  }).join('') : `<div class="cart-empty"><svg class="ico"><use href="#i-scan"/></svg><span>Escanee un producto o escriba en el buscador</span></div>`;
  $('#sumBase15').textContent = money(t.b15);
  $('#sumBase18').textContent = money(t.b18);
  $('#sumExento').textContent = money(t.ex);
  $('#sumIsv').textContent = money(t.isv);
  $('#sumTotal').textContent = money(t.total);
  $('#chargeTotal').textContent = money(t.total);
  const maxDiscount = maxDiscountAmount();
  $('#discountInput').max = maxDiscount;
  $('#discountInput').title = 'Máximo autorizado: ' + money(maxDiscount);
  $('#discountError').textContent = t.disc > maxDiscount + .001 ? 'Descuento no autorizado. Máximo ' + money(maxDiscount) + '.' : '';
  $('#chargeBtn').disabled = state.cart.length === 0 || t.disc > maxDiscount + .001;
  $('#mobileTotal').textContent = money(t.total);
  $('#mobileCheckout').classList.toggle('show', state.cart.length > 0 && state.screen === 'pos');
}
$('#mobileCharge').addEventListener('click', () => $('#chargeBtn').click());
$('#discountInput').addEventListener('input', renderCart);
$('#cartLines').addEventListener('click', e => {
  const btn = e.target.closest('[data-q]'); if (!btn) return;
  const i = +btn.dataset.i, l = state.cart[i], p = products.find(x => x.id === l.id);
  if (btn.dataset.q === 'inc') {
    if (l.qty >= p.stock) { toast('Stock máximo: ' + p.stock, 'warn'); return; }
    l.qty++;
  } else { l.qty--; if (l.qty <= 0) state.cart.splice(i, 1); }
  renderCart();
});
$('#clearCart').addEventListener('click', () => {
  if (!state.cart.length) return;
  confirmDialog('¿Vaciar el ticket?', 'Se eliminarán todos los productos agregados a la venta actual.', () => {
    state.cart = []; $('#discountInput').value = 0; renderCart(); toast('Ticket vaciado');
  }, 'Vaciar', true);
});
$('#clientSelect').addEventListener('click', () => {
  modal({
    title:'Seleccionar cliente', sub:'Consulta rápida desde el punto de venta', wide:true,
    body:`<div class="modal-list">${clients.map(c => `
      <button class="client-row ${state.client && state.client.id === c.id ? 'active' : ''}" data-pick="${c.id}">
        <span class="avatar">${c.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</span>
        <span class="cr-body"><strong>${c.name}</strong><small>${c.doc} · ${c.cat}</small></span>
        <span class="cr-badge ${c.status === 'Vencido' ? 'warn' : ''}">${c.status}</span>
      </button>`).join('')}
      <button class="client-row" data-pick="final"><span class="avatar">CF</span><span class="cr-body"><strong>Consumidor final</strong><small>Sin crédito · factura a nombre del adquirente</small></span></button></div>`,
    onMount(root) {
      $$('[data-pick]', root).forEach(b => b.addEventListener('click', () => {
        const id = b.dataset.pick;
        state.client = id === 'final' ? null : clients.find(c => c.id === id);
        $('#ticketClient').textContent = state.client ? state.client.name : 'Consumidor final';
        $('#ticketClient').previousElementSibling.textContent = state.client ? 'Cliente' : 'Cliente';
        closeModal(); renderCart();
      }));
    }
  });
});
$('#payMethods').addEventListener('click', e => {
  const chip = e.target.closest('[data-pay]'); if (!chip) return;
  state.payMethod = chip.dataset.pay;
  $$('.pay-chip').forEach(c => { c.classList.toggle('active', c === chip); c.setAttribute('aria-pressed', String(c === chip)); });
});
$('#holdBtn').addEventListener('click', () => toast('Venta guardada en espera · referencia ESP-' + state.ticketNo, 'warn'));
$('#posScanTop').addEventListener('click', () => $('#scanBtn').click());
$('#scanBtn').addEventListener('click', () => {
  const line = $('#scanLine'); line.classList.add('show');
  state.scanned = ((state.scanned || 0) + 1) % products.length;
  const pick = products[state.scanned];
  setTimeout(() => { line.classList.remove('show'); addToCart(pick.id); toast('Lector: ' + pick.code + ' → ' + pick.name); }, 360);
});
const payLabels = { efectivo:'Efectivo', ach:'Transferencia ACH', tarjeta:'Tarjeta', credito:'Crédito autorizado' };
const payOptions = Object.entries(payLabels).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');
$('#chargeBtn').addEventListener('click', () => {
  const t = totals();
  if (!state.cart.length) return;
  if (state.payMethod === 'credito') {
    if (!state.client) { toast('Seleccione un cliente para venta a crédito', 'warn'); return; }
    if (t.total > state.client.limit - state.client.balance) { toast('Crédito insuficiente', 'error'); return; }
  }
  const methodLabel = payLabels[state.payMethod];
  modal({
    title:'Confirmar cobro', sub:methodLabel + ' · Ticket #' + state.ticketNo,
    body:`<div class="pay-confirm"><div class="big">${money(t.total)}</div>
      <div style="text-align:center;font-size:10.5px;color:var(--muted);margin-top:4px">Total a cobrar · ISV incluido ${money(t.isv)}</div></div>
      <div id="singlePay">${state.payMethod === 'efectivo' ? `
        <label class="field"><span>Monto recibido</span><div class="input-wrap"><span style="font-family:var(--mono)">L</span><input id="payAmount" type="number" min="0" step="0.01" value="${Math.ceil(t.total)}" inputmode="decimal"></div><small class="field-error" id="payError"></small></label>
        <div class="quick-amounts"><button type="button" data-amt="${t.total}">Exacto</button><button type="button" data-amt="500">L 500</button><button type="button" data-amt="1000">L 1,000</button><button type="button" data-amt="2000">L 2,000</button></div>
        <div class="change-box"><span>Cambio a entregar</span><b id="changeOut">L 0.00</b></div>` : `
        <label class="field"><span>Referencia / autorización</span><div class="input-wrap"><svg class="ico"><use href="#i-card"/></svg><input id="payRef" placeholder="N.º de operación o autorización" value="AUT-882910"></div><small class="field-error" id="refError"></small></label>
        <div class="receipt-mini"><div class="r-row"><span>Método</span><b>${methodLabel}</b></div><div class="r-row"><span>Cliente</span><b>${state.client ? state.client.name : 'Consumidor final'}</b></div>${state.payMethod === 'credito' ? `<div class="r-row"><span>Disponible antes</span><b>${money(state.client.limit - state.client.balance)}</b></div>` : ''}</div>`}</div>
      <div class="split-wrap"><button type="button" class="link-btn" id="splitToggle"><svg class="ico"><use href="#i-plus"/></svg> Dividir pago en dos métodos</button>
        <div class="split-box" id="splitBox" hidden>
          <div class="split-grid">
            <label class="field"><span>Método 1</span><select id="splitM1" class="select">${payOptions}</select></label>
            <label class="field"><span>Monto 1</span><div class="input-wrap"><span style="font-family:var(--mono)">L</span><input id="splitA1" type="number" min="0" step="0.01" value="${t.total}" inputmode="decimal"></div></label>
            <label class="field"><span>Método 2</span><select id="splitM2" class="select">${payOptions.replace('<option value="efectivo">Efectivo</option>','')}</select></label>
            <label class="field"><span>Monto 2</span><div class="input-wrap"><span style="font-family:var(--mono)">L</span><input id="splitA2" type="number" min="0" step="0.01" value="0" inputmode="decimal"></div></label>
          </div>
          <div class="split-status" id="splitStatus"></div><small class="field-error" id="splitError"></small>
        </div>
      </div>`,
    foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="doCharge">Confirmar cobro</button>',
    onMount(root) {
      const amt = $('#payAmount', root);
      const updateChange = () => { if (amt) $('#changeOut', root).textContent = money(Math.max(0, parseFloat(amt.value || 0) - t.total)); };
      if (amt) { amt.addEventListener('input', updateChange); updateChange(); }
      $$('[data-amt]', root).forEach(b => b.addEventListener('click', () => { amt.value = b.dataset.amt; updateChange(); }));

      const updateSplit = () => {
        const a1 = parseFloat($('#splitA1', root).value || 0), a2 = parseFloat($('#splitA2', root).value || 0);
        const diff = round(a1 + a2 - t.total), box = $('#splitStatus', root);
        box.classList.toggle('ok', Math.abs(diff) < .005);
        box.textContent = `Suma: ${money(a1 + a2)} · ${Math.abs(diff) < .005 ? 'exacto' : diff > 0 ? 'sobrante ' + money(diff) : 'faltan ' + money(-diff)}`;
      };
      $('#splitToggle', root).addEventListener('click', () => {
        const box = $('#splitBox', root), single = $('#singlePay', root), opening = box.hidden;
        box.hidden = !opening; single.hidden = opening;
        $('#splitToggle', root).innerHTML = `<svg class="ico"><use href="#i-${opening ? 'x' : 'plus'}"/></svg> ${opening ? 'Usar un solo método' : 'Dividir pago en dos métodos'}`;
        if (opening) updateSplit();
      });
      ['#splitA1','#splitA2'].forEach(s => $(s, root).addEventListener('input', updateSplit));

      $('#doCharge', root).addEventListener('click', () => {
        let tenders;
        if (!$('#splitBox', root).hidden) {
          const m1 = $('#splitM1', root).value, m2 = $('#splitM2', root).value;
          const a1 = parseFloat($('#splitA1', root).value || 0), a2 = parseFloat($('#splitA2', root).value || 0);
          const diff = round(a1 + a2 - t.total), err = $('#splitError', root);
          err.textContent = '';
          if (!(a1 > 0) || !(a2 > 0)) { err.textContent = 'Ambos montos deben ser mayores a cero.'; return; }
          if (m1 === m2) { err.textContent = 'Seleccione dos métodos diferentes.'; return; }
          if (diff < -.005) { err.textContent = 'La suma de los métodos no cubre el total.'; return; }
          if (diff > .005 && m1 !== 'efectivo' && m2 !== 'efectivo') { err.textContent = 'Sin efectivo, los montos deben sumar el total exacto.'; return; }
          const creditPart = (m1 === 'credito' ? a1 : 0) + (m2 === 'credito' ? a2 : 0);
          if (creditPart > 0) {
            if (!state.client) { err.textContent = 'Se requiere cliente para la parte a crédito.'; return; }
            if (creditPart > state.client.limit - state.client.balance) { err.textContent = 'Crédito insuficiente para el monto a crédito.'; return; }
          }
          tenders = [{ method:payLabels[m1], amount:a1, ref:'SPLIT-1' }, { method:payLabels[m2], amount:a2, ref:'SPLIT-2' }];
        } else {
          if (amt && parseFloat(amt.value || 0) < t.total) { $('#payError', root).textContent = 'El monto recibido debe cubrir el total.'; return; }
          const refInput = $('#payRef', root), ref = refInput ? refInput.value.trim() : 'EFECTIVO';
          if (refInput && !ref) { $('#refError', root).textContent = 'Ingrese la referencia de la operación.'; return; }
          tenders = [{ method:methodLabel, amount:amt ? Math.max(parseFloat(amt.value || 0), t.total) : t.total, ref }];
        }
        processing('Registrando pago y generando comprobante fiscal…', () => finalizeSale(t, tenders));
      });
    }
  });
});
async function finalizeSale(t, tenders) {
  const overpaid = round(tenders.reduce((s,x) => s + x.amount, 0)) > t.total + .005;
  const ordered = overpaid ? [...tenders].sort((a,b) => (a.method === 'Efectivo' ? 1 : 0) - (b.method === 'Efectivo' ? 1 : 0)) : [...tenders];
  let remaining = t.total, change = 0;
  const apiTenders = [];
  for (const x of ordered) {
    const amount = round(Math.min(x.amount, remaining));
    if (amount > 0) { apiTenders.push({ ...x, amount }); remaining = round(remaining - amount); }
    if (x.method === 'Efectivo') change = round(change + Math.max(0, x.amount - amount));
  }
  const method = tenders.map(x => x.method).join(' + ');
  const ref = apiTenders.map(x => x.ref).filter(Boolean).join(' / ') || 'EFECTIVO';
  let sale;
  if (useApi && state.shift) {
    try {
      const res = await api('/api/sales','POST',{
        shift_id:state.shift.id, client_id:state.client ? state.client.id : null,
        seller_id:state.user.id, discount:t.disc,
        items:state.cart.map(l => ({ product_id:l.id, qty:l.qty })),
        tenders:apiTenders.map(x => ({ method:x.method, amount:x.amount, reference:x.ref }))
      });
      sale = res.sale;
      applyRemote(res.state);
    } catch (err) { toast('No se pudo registrar la venta: ' + err.message, 'error'); return; }
  } else {
    const creditPart = apiTenders.filter(x => x.method === 'Crédito autorizado').reduce((s,x) => s + x.amount, 0);
    sale = {
      no:state.ticketNo++, date:today(), time:new Date().toLocaleTimeString('es-HN',{hour:'2-digit',minute:'2-digit'}),
      client:state.client, method, ref, tenders:apiTenders, lines:state.cart.map(l => {
        const p = products.find(x => x.id === l.id);
        return { name:p.name, qty:l.qty, price:p.price, isv:p.isv, subtotal:p.price * l.qty };
      }), totals:t, invoice:'001-001-01-00045231'
    };
    if (state.client && creditPart > 0) {
      state.client.balance = round(state.client.balance + creditPart);
      cxc.unshift({ id:'K' + (cxc.length + 100), client:state.client.name, doc:'FAC-' + sale.no, issue:sale.date,
        due:'07/12/2026', balance:creditPart, days:0, status:'Vigente' });
    }
    if (state.shift) {
      const cashPart = apiTenders.filter(x => x.method === 'Efectivo').reduce((s,x) => s + x.amount, 0);
      state.shift.cashSales = round((state.shift.cashSales || 0) + cashPart);
    }
    persist();
  }
  state.lastSale = sale;
  state.cart = []; $('#discountInput').value = 0; renderCart();
  renderInvoice(sale);
  modal({
    title:'¡Cobro registrado!', sub:'Comprobante listo para emisión fiscal',
    body:`<div class="success-ico"><svg class="ico"><use href="#i-check"/></svg></div>
      <div class="modal-center"><p>Venta por <strong>${money(t.total)}</strong> registrada correctamente.<br>Factura <b class="mono">${sale.invoice}</b></p></div>
      <div class="receipt-mini"><div class="r-row"><span>Método de pago</span><b>${method}</b></div><div class="r-row"><span>ISV liquidado</span><b>${money(t.isv)}</b></div><div class="r-row"><span>Referencia</span><b class="mono">${ref}</b></div>${change > 0 ? `<div class="r-row"><span>Cambio</span><b>${money(change)}</b></div>` : ''}<div class="r-row total"><span>TOTAL</span><span>${money(t.total)}</span></div></div>`,
    foot:'<button class="btn btn-ghost" id="onlyClose">Cerrar</button><button class="btn btn-primary" id="seeInvoice">Ver factura fiscal</button>',
    onMount(root) {
      $('#onlyClose', root).addEventListener('click', closeModal);
      $('#seeInvoice', root).addEventListener('click', () => { closeModal(); navTo('factura'); });
    }
  });
}

/* ------------------------------------------------------------------ 04 FACTURA */
function makeQR(text) {
  const n = 21; let seed = 0;
  for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const m = Array.from({ length:n }, () => Array(n).fill(false));
  const finder = (ox, oy) => {
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
      const edge = x === 0 || y === 0 || x === 6 || y === 6;
      const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
      m[oy + y][ox + x] = edge || core;
    }
    for (let y = -1; y <= 7; y++) for (let x = -1; x <= 7; x++) {
      const yy = oy + y, xx = ox + x;
      if (yy >= 0 && yy < n && xx >= 0 && xx < n && (y === -1 || y === 7 || x === -1 || x === 7)) m[yy][xx] = false;
    }
  };
  finder(0,0); finder(n-7,0); finder(0,n-7);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const inFinder = (x < 8 && y < 8) || (x > n-9 && y < 8) || (x < 8 && y > n-9);
    if (!inFinder) m[y][x] = rnd() > .52;
  }
  let rects = '';
  m.forEach((row, y) => row.forEach((v, x) => { if (v) rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`; }));
  return `<svg viewBox="-1 -1 ${n+2} ${n+2}" xmlns="http://www.w3.org/2000/svg" fill="#231E1A" shape-rendering="crispEdges">${rects}</svg>`;
}
function renderInvoice(sale) {
  const t = sale.totals;
  $('#invDate').textContent = sale.date;
  const lim = new Date(); lim.setMonth(lim.getMonth() + 1);
  $('#invLimit').textContent = lim.toLocaleDateString('es-HN', { day:'2-digit', month:'2-digit', year:'numeric' });
  $('#invNumber').textContent = sale.invoice;
  $('#invClient').textContent = sale.client ? sale.client.name : 'Consumidor final';
  $('#invClientDoc').textContent = sale.client ? 'RTN ' + sale.client.doc : 'RTN 0000-0000-000000';
  $('#invClientAddr').textContent = sale.client ? sale.client.addr : 'Catacamas, Olancho';
  $('#invPay').textContent = sale.method + ' · ' + (sale.method.includes('Crédito') ? 'Crédito' : 'Contado');
  $('#invExento').textContent = t.ex > 0 ? `Exonerado: ${money(t.ex)}` : 'Cliente no exonerado';
  $('#invLines').innerHTML = sale.lines.map(l => `<tr><td>${l.qty}</td><td>${l.name}</td><td>${l.isv === 15 ? money(l.subtotal) : '—'}</td><td>${l.isv === 18 ? money(l.subtotal) : '—'}</td><td>${l.isv === 0 ? money(l.subtotal) : '—'}</td><td>${money(l.subtotal * l.isv / 100)}</td><td>${money(l.subtotal * (1 + l.isv / 100))}</td></tr>`).join('');
  $('#invSubtotal').textContent = money(t.b15 + t.b18);
  $('#invIsv15').textContent = money(round(t.b15 * .15));
  $('#invIsv18').textContent = money(round(t.b18 * .18));
  $('#invRet').textContent = money(round((t.b15 + t.b18) * .01));
  $('#invDisc').textContent = '(' + money(t.disc) + ')';
  $('#invTotal').textContent = money(t.total);
  $('#invQr').innerHTML = makeQR(sale.invoice + '|' + t.total + '|' + sale.date);
  $('#invHash').textContent = 'SAR-' + (sale.invoice.slice(-4) + '9F3B').slice(0,8);
  $('#invTurno').textContent = (state.shift ? state.shift.id : 'T-00428') + ' · Alberto C.';
  $('#invStatusTitle').textContent = 'Borrador';
  $('#invStatusText').textContent = 'Revise los importes y datos del adquirente antes de emitir.';
  $('#invReleased').textContent = 'Pendiente';
  $$('#invSteps span').forEach((s,i) => s.classList.toggle('done', i < 2));
}
$('#emitInvoice').addEventListener('click', () => {
  if (!state.lastSale) { toast('No hay una venta reciente para emitir', 'warn'); return; }
  processing('Firmando comprobante y reportando al SAR…', () => {
    $('#invStatusTitle').textContent = 'Emitida y reportada';
    $('#invStatusText').textContent = 'Comprobante autorizado. CAI vigente y correlativo dentro del rango.';
    $('#invReleased').textContent = new Date().toLocaleTimeString('es-HN',{hour:'2-digit',minute:'2-digit'});
    $$('#invSteps span').forEach(s => s.classList.add('done'));
    toast('Factura emitida y reportada al SAR');
  });
});
$('#printInvoice').addEventListener('click', () => window.print());

function renderTalonarios() {
  const list = state.talonarios.length ? state.talonarios : [{ id:'T001', cai:'A1B2-C3D4-E5F6-G7H8-I9J0-K1L2', range_start:1, range_end:99999, current_number:45231, due_date:'2026-12-31', active:1 }];
  const canManage = !API_ON || ['admin','gerente'].includes(state.user?.role);
  $('#newTalonarioBtn').hidden = !canManage;
  $('#talonarioList').innerHTML = list.map(t => {
    const span = Math.max(1, t.range_end - t.range_start + 1);
    const used = Math.max(0, t.current_number - t.range_start);
    const pct = Math.min(100, used / span * 100);
    const expired = t.due_date < today().split('/').reverse().join('-');
    const full = t.current_number > t.range_end;
    return `<div class="talonario-row"><div class="tr-top"><span class="tr-cai" title="${t.cai}">${t.cai}</span><span class="badge ${!t.active||expired||full?'bad':'ok'}">${!t.active?'Inactivo':expired?'Vencido':full?'Agotado':'Activo'}</span></div><div class="tr-meta"><span>${String(t.range_start).padStart(5,'0')}–${String(t.range_end).padStart(5,'0')}</span><span>Próximo ${String(t.current_number).padStart(8,'0')}</span></div><div class="tr-bar"><i style="width:${pct}%"></i></div><div class="tr-meta"><span>Vence ${t.due_date}</span>${canManage?`<button class="link-btn" data-talonario="${t.id}">Editar</button>`:''}</div></div>`;
  }).join('');
}
function openTalonario(t=null) {
  const data = t || { cai:'', range_start:1, range_end:99999, current_number:1, due_date:'2026-12-31', active:1 };
  modal({
    title:t ? 'Editar talonario' : 'Nuevo talonario', sub:'Autorización fiscal SAR', wide:true,
    body:`<label class="field"><span>CAI</span><div class="input-wrap"><input id="tCai" value="${data.cai}" placeholder="Código de autorización de impresión"></div><small class="field-error" id="tErr"></small></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><label class="field"><span>Rango inicial</span><div class="input-wrap"><input id="tStart" type="number" min="1" value="${data.range_start}"></div></label><label class="field"><span>Rango final</span><div class="input-wrap"><input id="tEnd" type="number" min="1" value="${data.range_end}"></div></label><label class="field"><span>Próximo correlativo</span><div class="input-wrap"><input id="tCurrent" type="number" min="1" value="${data.current_number}"></div></label><label class="field"><span>Fecha límite</span><div class="input-wrap"><input id="tDue" type="date" value="${data.due_date}"></div></label></div>
      <label class="check"><input type="checkbox" id="tActive" ${data.active?'checked':''}><span></span> Talonario activo</label>`,
    foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="saveTalonario">Guardar talonario</button>',
    onMount(root) {
      $('#saveTalonario', root).addEventListener('click', async () => {
        const payload = { cai:$('#tCai',root).value.trim(), range_start:+$('#tStart',root).value, range_end:+$('#tEnd',root).value,
          current_number:+$('#tCurrent',root).value, due_date:$('#tDue',root).value, active:$('#tActive',root).checked };
        if (!payload.cai || payload.range_start<1 || payload.range_end<payload.range_start || payload.current_number<payload.range_start || payload.current_number>payload.range_end || !payload.due_date) {
          $('#tErr',root).textContent = 'Complete CAI, rango, correlativo y fecha válidos.'; return;
        }
        try {
          if (useApi) {
            const res = t ? await api('/api/talonarios/'+t.id,'PUT',payload) : await api('/api/talonarios','POST',payload);
            state.talonarios = res.talonarios;
          } else {
            if (t) Object.assign(t,payload);
            else state.talonarios.push({ id:'T'+(state.talonarios.length+1), ...payload });
          }
          closeModal(); renderTalonarios(); toast('Talonario guardado');
        } catch (err) { $('#tErr',root).textContent = err.message; }
      });
    }
  });
}
$('#newTalonarioBtn').addEventListener('click', () => openTalonario());
$('#talonarioList').addEventListener('click', e => {
  const b = e.target.closest('[data-talonario]'); if (!b) return;
  openTalonario(state.talonarios.find(t => t.id === b.dataset.talonario));
});

/* ------------------------------------------------------------------ 03 CLIENTES */
function initials(name) { return name.split(' ').map(w => w[0]).slice(0,2).join(''); }
function renderClientList() {
  const q = norm($('#clientSearch').value.trim());
  const list = clients.filter(c => !q || norm(c.name).includes(q) || c.doc.includes(q));
  $('#clientList').innerHTML = list.map(c => `
    <button class="client-row ${c.id === state.selectedClient ? 'active' : ''}" data-client="${c.id}">
      <span class="avatar">${initials(c.name)}</span>
      <span class="cr-body"><strong>${c.name}</strong><small>${c.doc} · ${c.cat}</small></span>
      <span class="cr-badge ${c.status === 'Vencido' ? 'warn' : ''}">${c.status}</span>
    </button>`).join('') || emptyState('Sin clientes', 'No hay coincidencias con la búsqueda actual.', 'clients', 'Limpiar búsqueda');
}
$('#clientSearch').addEventListener('input', debounce(renderClientList));
$('#clientList').addEventListener('click', e => {
  const b = e.target.closest('[data-client]'); if (!b) return;
  state.selectedClient = b.dataset.client; renderClientList(); renderClientDetail();
});
function renderClientDetail() {
  const c = clients.find(x => x.id === state.selectedClient) || clients[0];
  const available = Math.max(0, c.limit - c.balance);
  const used = Math.min(100, c.balance / c.limit * 100);
  const hist = history[c.id] || [
    { date:'12/11/2026', doc:'FAC-00122', text:'Compra de insumos', total:c.purchases * .12, state:'Pagada' },
    { date:'28/10/2026', doc:'FAC-00104', text:'Compra general', total:c.purchases * .08, state:'Pagada' }
  ];
  $('#clientDetail').innerHTML = `
    <div class="cd-head"><span class="avatar" style="background:linear-gradient(145deg,${c.status === 'Vencido' ? '#9E4139,#7A3430' : '#7A4A2E,#2C211B'})">${initials(c.name)}</span>
      <div class="cd-id"><h2>${c.name}</h2><p>Identidad: ${c.doc} · Tel. ${c.phone} · ${c.addr}</p></div>
      <div class="cd-tags"><span class="tag ${c.status === 'Vencido' ? 'warn' : 'good'}">${c.status}</span><span class="tag">${c.cat}</span></div>
    </div>
    <div class="cd-kpis">
      <div class="cd-kpi big"><small>Compras acumuladas</small><b>${money(c.purchases)}</b></div>
      <div class="cd-kpi ${c.status === 'Vencido' ? 'big' : ''}"><small>Saldo pendiente</small><b>${money(c.balance)}</b></div>
      <div class="cd-kpi"><small>Límite autorizado</small><b>${money(c.limit)}</b></div>
      <div class="cd-kpi"><small>Disponible</small><b>${money(available)}</b></div>
    </div>
    <div class="credit-block">
      <div class="credit-top"><strong>Uso de línea de crédito</strong><span>${used.toFixed(0)}% consumido</span></div>
      <div class="progress ${used > 75 ? 'warn' : ''}"><i style="width:${used}%"></i></div>
      <div class="credit-foot"><span>Disponible ${money(available)}</span><span>Plazo 30 días · SAR al día</span></div>
    </div>
    ${c.status === 'Vencido' ? `<div class="cd-alert"><svg class="ico"><use href="#i-alert"/></svg><span>Cliente con facturas vencidas. Crédito en revisión; requiere autorización del encargado para nuevas ventas.</span></div>` : ''}
    <div class="cd-actions">
      <button class="btn btn-primary" id="saleToClient"><svg class="ico"><use href="#i-grid"/></svg> Nueva venta</button>
      <button class="btn btn-soft" id="collectBtn"><svg class="ico"><use href="#i-wallet"/></svg> Registrar cobranza</button>
      <button class="btn btn-ghost" id="blockBtn"><svg class="ico"><use href="#i-lock"/></svg> ${c.status === 'Vencido' ? 'Bloquear crédito' : 'Bloqueo por mora'}</button>
    </div>
    <h4 class="section-title">Historial reciente <button class="link-btn" id="statementMini">Ver estado completo →</button></h4>
    <div class="timeline">${hist.map(h => `
      <div class="tl-item ${h.state === 'Vencido' || h.state === 'Crédito' ? 'warn' : ''}">
        <span class="mono">${money(h.total)}</span><b>${h.text}</b><small>${h.date} · ${h.doc} · ${h.state}</small>
      </div>`).join('')}</div>`;
  $('#saleToClient').addEventListener('click', () => { state.client = c; $('#ticketClient').textContent = c.name; navTo('pos'); toast('Cliente cargado en el ticket: ' + c.name); });
  $('#collectBtn').addEventListener('click', () => { navTo('cxc'); openPayment(c.name); });
  $('#blockBtn').addEventListener('click', () => confirmDialog('Bloquear crédito', 'El cliente ' + c.name + ' quedará sin autorización para compras a crédito hasta regularizar su saldo.', () => { c.status = 'Vencido'; persist(); renderClientList(); renderClientDetail(); toast('Crédito bloqueado para ' + c.name, 'warn'); }, 'Bloquear', true));
  $('#statementMini').addEventListener('click', () => openStatement(c));
}
$('#newClientBtn').addEventListener('click', () => modal({
  title:'Nuevo cliente', sub:'Ficha maestre · CRM',
  body:`<label class="field"><span>Nombre o razón social</span><div class="input-wrap"><input id="ncName" placeholder="Ej. Juan Pérez"></div><small class="field-error" id="ncNameErr"></small></label>
    <label class="field"><span>RTN / Identidad</span><div class="input-wrap"><input id="ncDoc" placeholder="0000-0000-00000"></div><small class="field-error" id="ncDocErr"></small></label>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <label class="field"><span>Límite de crédito (L)</span><div class="input-wrap"><input id="ncLimit" type="number" min="0" value="1000"></div></label>
      <label class="field"><span>Categoría</span><select id="ncCat" class="select" style="width:100%;height:45px"><option>Frecuente</option><option>Crédito</option><option>Mayorista</option><option>Corporativo</option></select></label>
    </div>`,
  foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="saveClient">Guardar cliente</button>',
  onMount(root) {
    $('#saveClient', root).addEventListener('click', () => {
      const name = $('#ncName', root).value.trim(), doc = $('#ncDoc', root).value.trim();
      $('#ncNameErr', root).textContent = name.length < 4 ? 'Ingrese un nombre válido.' : '';
      $('#ncDocErr', root).textContent = doc.length < 8 ? 'RTN/identidad inválido.' : '';
      if (name.length < 4 || doc.length < 8) return;
      clients.unshift({ id:'C' + (clients.length + 10), name, doc, phone:'0000-0000', cat:$('#ncCat', root).value,
        limit:parseFloat($('#ncLimit', root).value || 0), balance:0, purchases:0, status:'Vigente', addr:'Catacamas, Olancho' });
      state.selectedClient = clients[0].id; persist(); closeModal(); renderClientList(); renderClientDetail(); toast('Cliente registrado correctamente');
    });
  }
}));
function openStatement(c) {
  modal({
    title:'Estado de cuenta', sub:c.name + ' · ' + c.doc, wide:true,
    body:`<div class="receipt-mini"><div class="r-row"><span>Saldo actual</span><b>${money(c.balance)}</b></div><div class="r-row"><span>Límite</span><b>${money(c.limit)}</b></div><div class="r-row"><span>Disponible</span><b>${money(c.limit - c.balance)}</b></div></div>
      <table class="data-table" style="min-width:0;margin-top:12px"><thead><tr><th>FACTURA</th><th>FECHA</th><th>SALDO</th><th>ESTADO</th></tr></thead><tbody>
      ${cxc.filter(k => k.client === c.name).map(k => `<tr><td class="mono">${k.doc}</td><td>${k.due}</td><td class="mono">${money(k.balance)}</td><td><span class="badge ${k.status === 'Vencido' ? 'bad' : 'ok'}">${k.status}</span></td></tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--muted)">Sin movimientos pendientes</td></tr>'}
      </tbody></table>`,
    foot:'<button class="btn btn-primary" data-close>Listo</button>'
  });
}

/* ------------------------------------------------------------------ 05 PRODUCTOS */
function renderProductStats() {
  const low = products.filter(p => p.stock > 0 && p.stock < 15).length;
  $('#productStats').innerHTML = `
    <div class="stat-card"><small>Productos activos</small><b>${products.length}</b><span class="delta">+3 este mes</span></div>
    <div class="stat-card"><small>Stock bajo (menos de 15)</small><b>${low}</b><span class="delta down">Reabastecer</span></div>
    <div class="stat-card"><small>Promociones activas</small><b>${products.filter(p => p.promo).length}</b><span class="delta">Vigentes</span></div>
    <div class="stat-card"><small>Valor del inventario</small><b>${money(products.reduce((s,p)=>s+p.cost*p.stock,0))}</b></div>`;
}
function renderProductTable() {
  const q = norm($('#productTableSearch').value.trim()), cat = $('#categoryFilter').value;
  const list = products.filter(p => (!q || norm(p.name).includes(q) || norm(p.id).includes(q) || p.code.includes(q)) && (cat === 'todas' || p.cat === cat) && (!state.promosOnly || p.promo));
  $('#productTableBody').innerHTML = list.map(p => `<tr>
    <td><div class="p-name-cell"><span class="p-dot"><svg class="ico"><use href="#i-box"/></svg></span><div><div>${p.name}</div><small class="mono" style="color:var(--muted);font-size:9px">${p.id} · ${p.code}</small></div></div></td>
    <td>${p.cat}</td><td class="mono">${money(p.price)}</td><td class="mono">${money(p.dist)}</td><td class="mono">${money(p.mayor)}</td>
    <td class="mono ${p.stock < 15 ? 'stock-low' : ''}">${p.stock}</td>
    <td>${p.promo ? `<span class="badge promo">${p.promo}</span>` : '<span class="badge">Sin promoción</span>'}</td>
    <td><div class="row-actions"><button class="mini-btn" data-edit="${p.id}" title="Editar" aria-label="Editar ${p.name}"><svg class="ico"><use href="#i-tag"/></svg></button><button class="mini-btn" data-toggle="${p.id}" title="${p.stock === 0 ? 'Activar' : 'Desactivar'}" aria-label="${p.stock === 0 ? 'Activar' : 'Desactivar'} ${p.name}"><svg class="ico"><use href="#i-${p.stock === 0 ? 'check' : 'x'}"/></svg></button></div></td>
  </tr>`).join('') || `<tr class="empty-state-row"><td colspan="8">${emptyState('Sin productos', 'Ajuste la búsqueda, la categoría o el filtro de promociones.', 'products', 'Limpiar filtros')}</td></tr>`;
}
$('#productTableSearch').addEventListener('input', debounce(renderProductTable));
$('#categoryFilter').addEventListener('change', renderProductTable);
$('#filterPromos').addEventListener('click', e => {
  state.promosOnly = !state.promosOnly;
  const b = e.currentTarget;
  b.classList.toggle('btn-primary', state.promosOnly);
  b.classList.toggle('btn-soft', !state.promosOnly);
  renderProductTable();
});
$('#productTableBody').addEventListener('click', e => {
  const edit = e.target.closest('[data-edit]'), toggle = e.target.closest('[data-toggle]');
  if (edit) openProductEditor(products.find(p => p.id === edit.dataset.edit));
  if (toggle) {
    const p = products.find(x => x.id === toggle.dataset.toggle);
    const apply = () => { p.stock = p.stock === 0 ? 10 : 0; persist(); renderProductTable(); renderProductStats(); renderProducts(); toast(p.name + (p.stock === 0 ? ' desactivado' : ' activado')); };
    if (p.stock === 0) apply();
    else confirmDialog('Desactivar producto', 'El producto ' + p.name + ' dejará de estar disponible para la venta.', apply, 'Desactivar', true);
  }
});
function openProductEditor(p) {
  modal({
    title:'Editar producto', sub:p.name + ' · ' + p.id, wide:true,
    body:`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <label class="field"><span>Precio mostrador</span><div class="input-wrap"><input id="ePrice" type="number" min="0.01" step="0.01" value="${p.price}"></div></label>
      <label class="field"><span>Precio distribuidor</span><div class="input-wrap"><input id="eDist" type="number" min="0" step="0.01" value="${p.dist}"></div></label>
      <label class="field"><span>Precio por mayor</span><div class="input-wrap"><input id="eMayor" type="number" min="0" step="0.01" value="${p.mayor}"></div></label>
      <label class="field"><span>Existencia</span><div class="input-wrap"><input id="eStock" type="number" min="0" step="1" value="${p.stock}"></div></label>
      <label class="field"><span>Promoción</span><div class="input-wrap"><input id="ePromo" value="${p.promo}" placeholder="Ej. -5% o 2 x L 125"></div></label>
      <label class="field"><span>ISV aplicable</span><select id="eIsv" class="select" style="width:100%;height:45px"><option value="15" ${p.isv===15?'selected':''}>15%</option><option value="18" ${p.isv===18?'selected':''}>18%</option><option value="0" ${p.isv===0?'selected':''}>Exento</option></select></label>
    </div><small class="field-error" id="eErr"></small>
    <div class="cd-alert" style="margin:6px 0 0"><svg class="ico"><use href="#i-alert"/></svg><span>Descuento máximo autorizado por vendedor: <b>5%</b>. Para autorizar un descuento mayor se requiere aprobación del supervisor.</span></div>`,
    foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="saveProduct">Guardar cambios</button>',
    onMount(root) {
      $('#saveProduct', root).addEventListener('click', () => {
        const price = parseFloat($('#ePrice', root).value), stock = parseFloat($('#eStock', root).value);
        if (!(price > 0) || !(stock >= 0)) { $('#eErr', root).textContent = 'Precio debe ser mayor a cero y existencia no negativa.'; return; }
        p.price = price; p.dist = parseFloat($('#eDist', root).value) || 0; p.mayor = parseFloat($('#eMayor', root).value) || 0;
        p.stock = stock; p.promo = $('#ePromo', root).value.trim(); p.isv = +$('#eIsv', root).value;
        persist(); closeModal(); renderProductTable(); renderProductStats(); renderProducts(); toast('Producto actualizado');
      });
    }
  });
}
$('#newProductBtn').addEventListener('click', () => modal({
  title:'Nuevo producto', sub:'Catálogo maestro · precios segmentados',
  body:`<label class="field"><span>Nombre del producto</span><div class="input-wrap"><input id="npName" placeholder="Ej. Herbicida 1 L"></div><small class="field-error" id="npErr"></small></label>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <label class="field"><span>Código</span><div class="input-wrap"><input id="npCode" value="P${products.length + 140}"></div></label>
      <label class="field"><span>Categoría</span><select id="npCat" class="select" style="width:100%;height:45px"><option>Abarrotes</option><option>Agro</option><option>Ferretería</option><option>Lácteos</option><option>Limpieza</option></select></label>
      <label class="field"><span>Precio venta</span><div class="input-wrap"><input id="npPrice" type="number" min="0.01" value="100"></div></label>
      <label class="field"><span>Existencia</span><div class="input-wrap"><input id="npStock" type="number" min="0" value="10"></div></label>
    </div>`,
  foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="saveNewProduct">Guardar</button>',
  onMount(root) {
    $('#saveNewProduct', root).addEventListener('click', () => {
      const name = $('#npName', root).value.trim(), price = parseFloat($('#npPrice', root).value);
      if (name.length < 3 || !(price > 0)) { $('#npErr', root).textContent = 'Nombre (3+) y precio mayor a cero son obligatorios.'; return; }
      products.unshift({ id:$('#npCode', root).value, code:'7791234' + String(4000 + products.length).slice(-4), name,
        cat:$('#npCat', root).value, price, dist:price*.94, mayor:price*.89, cost:price*.72,
        stock:parseFloat($('#npStock', root).value) || 0, isv:15, promo:'' });
      persist(); closeModal(); renderProductTable(); renderProductStats(); renderProducts(); toast('Producto creado correctamente');
    });
  }
}));

function renderPromotions() {
  const canManage = !API_ON || ['admin','gerente'].includes(state.user?.role);
  $('#newPromotionBtn').hidden = !canManage;
  $('#sellerLimitInput').hidden = !canManage;
  $('#saveSellerLimit').hidden = !canManage;
  $('#sellerLimitName').textContent = state.user?.name || 'este vendedor';
  $('#sellerLimitInput').value = state.sellerLimits[state.user?.id] ?? 5;
  const todayISO = new Date().toISOString().slice(0,10);
  $('#promotionList').innerHTML = state.promotions.map(pr => {
    const product = products.find(p=>p.id===pr.product_id);
    const expired = pr.ends_at < todayISO, future = pr.starts_at > todayISO;
    const detail = pr.kind === 'combo' ? `Combo ${JSON.parse(pr.combo_json||'{}').qty||'?'} por L ${JSON.parse(pr.combo_json||'{}').price||'?'}` : pr.kind === 'percent' ? `${pr.value}% de descuento` : `L ${pr.value} de descuento`;
    return `<div class="promo-item"><div class="pi-top"><b>${pr.name}</b><span class="badge ${!pr.active||expired?'bad':future?'promo':'ok'}">${!pr.active?'Inactiva':expired?'Vencida':future?'Programada':'Activa'}</span></div><small>${product?.name || pr.product_id} · ${detail}</small><small>${pr.starts_at} a ${pr.ends_at}</small><div class="pi-actions"><span class="mono" style="font-size:9px;color:var(--muted)">${pr.id}</span>${canManage?`<button class="link-btn" data-promo="${pr.id}">Editar</button>`:''}</div></div>`;
  }).join('') || '<div class="empty-state"><b>Sin promociones</b><span>Cree una oferta temporal o un combo.</span></div>';
}
function openPromotion(pr=null) {
  const data = pr || { name:'', kind:'percent', value:5, product_id:products[0]?.id, starts_at:new Date().toISOString().slice(0,10), ends_at:'2026-12-31', active:1, combo_json:'{"qty":2,"price":100}' };
  let combo = { qty:2, price:100 }; try { combo = JSON.parse(data.combo_json || '{}'); } catch (_) {}
  modal({
    title:pr ? 'Editar promoción' : 'Nueva promoción', sub:'Vigencia, combo y descuento', wide:true,
    body:`<label class="field"><span>Nombre</span><div class="input-wrap"><input id="prName" value="${data.name}" placeholder="Ej. Aceite 5%"></div><small class="field-error" id="prErr"></small></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><label class="field"><span>Tipo</span><select id="prKind" class="select" style="width:100%;height:45px"><option value="percent" ${data.kind==='percent'?'selected':''}>Porcentaje</option><option value="fixed" ${data.kind==='fixed'?'selected':''}>Monto fijo</option><option value="combo" ${data.kind==='combo'?'selected':''}>Combo</option></select></label><label class="field"><span>Valor</span><div class="input-wrap"><input id="prValue" type="number" min="0" step="0.01" value="${data.value}"></div></label><label class="field"><span>Producto</span><select id="prProduct" class="select" style="width:100%;height:45px">${products.map(p=>`<option value="${p.id}" ${p.id===data.product_id?'selected':''}>${p.name}</option>`).join('')}</select></label><label class="field"><span>Inicio</span><div class="input-wrap"><input id="prStart" type="date" value="${data.starts_at}"></div></label><label class="field"><span>Fin</span><div class="input-wrap"><input id="prEnd" type="date" value="${data.ends_at}"></div></label><label class="field"><span>Cantidad del combo</span><div class="input-wrap"><input id="prComboQty" type="number" min="1" value="${combo.qty||2}"></div></label><label class="field"><span>Precio del combo</span><div class="input-wrap"><input id="prComboPrice" type="number" min="0" step="0.01" value="${combo.price||100}"></div></label></div>
      <label class="check"><input type="checkbox" id="prActive" ${data.active?'checked':''}><span></span> Promoción activa</label>`,
    foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="savePromotion">Guardar promoción</button>',
    onMount(root) {
      $('#savePromotion',root).addEventListener('click',async ()=>{
        const kind=$('#prKind',root).value;
        const payload={name:$('#prName',root).value.trim(),kind,value:+$('#prValue',root).value,product_id:$('#prProduct',root).value,starts_at:$('#prStart',root).value,ends_at:$('#prEnd',root).value,active:$('#prActive',root).checked,combo_json:kind==='combo'?JSON.stringify({qty:+$('#prComboQty',root).value,price:+$('#prComboPrice',root).value}):null};
        if(!payload.name||payload.value<0||!payload.starts_at||!payload.ends_at||payload.ends_at<payload.starts_at||(kind==='combo'&&(+$('#prComboQty',root).value<=0||+$('#prComboPrice',root).value<0))){$('#prErr',root).textContent='Complete nombre, valor, producto y vigencia válidos.';return;}
        try{
          if(useApi){const res=pr?await api('/api/promotions/'+pr.id,'PUT',payload):await api('/api/promotions','POST',payload);state.promotions=res.promotions;}
          else if(pr)Object.assign(pr,payload);else state.promotions.push({id:'PR'+(state.promotions.length+1),...payload});
          closeModal();renderPromotions();renderProducts();toast('Promoción guardada');
        }catch(err){$('#prErr',root).textContent=err.message;}
      });
    }
  });
}
$('#newPromotionBtn').addEventListener('click',()=>openPromotion());
$('#promotionList').addEventListener('click',e=>{const b=e.target.closest('[data-promo]');if(b)openPromotion(state.promotions.find(p=>p.id===b.dataset.promo));});
$('#saveSellerLimit').addEventListener('click',async()=>{
  const pct=parseFloat($('#sellerLimitInput').value||0);
  try{
    if(useApi){const res=await api('/api/seller-limits','POST',{user_id:state.user.id,max_discount_pct:pct});state.sellerLimits=res.sellerLimits;}
    else state.sellerLimits[state.user.id]=pct;
    toast('Límite de descuento actualizado');
  }catch(err){toast(err.message,'error');}
});

/* ------------------------------------------------------------------ 06 CxC */
function renderCxc() {
  const total = cxc.reduce((s,k)=>s+k.balance,0) || 1;
  const overdue = cxc.filter(k=>k.status==='Vencido').reduce((s,k)=>s+k.balance,0);
  const soon = porVencer();
  const current = round(total - overdue - soon);
  $('#cxcSummary').innerHTML = `
    <div class="cxc-card"><small>Saldo total de cartera</small><b>${money(total)}</b><div class="progress"><i style="width:100%"></i></div></div>
    <div class="cxc-card"><small>Al corriente</small><b>${money(current)}</b><div class="progress"><i style="width:${(current/total*100).toFixed(0)}%"></i></div></div>
    <div class="cxc-card"><small>Por vencer (≤ 15 días)</small><b>${money(soon)}</b><div class="progress"><i style="width:${(soon/total*100).toFixed(0)}%"></i></div></div>
    <div class="cxc-card warn"><small>Vencido · ${(overdue/total*100).toFixed(1)}% morosidad</small><b>${money(overdue)}</b><div class="progress warn"><i style="width:${(overdue/total*100).toFixed(0)}%"></i></div></div>`;
  const q = norm(state.cxcFilter.trim());
  const list = cxc.filter(k => (state.cxcTab==='todas'||norm(k.status)===state.cxcTab) && (!q||norm(k.client).includes(q)||norm(k.doc).includes(q)));
  $('#cxcTableBody').innerHTML = list.map(k => `<tr>
    <td><b>${k.client}</b></td><td class="mono">${k.doc}</td><td>${k.issue}</td><td>${k.due}</td>
    <td class="mono"><b>${money(k.balance)}</b></td><td class="mono ${k.days>0?'stock-low':''}">${k.days}</td>
    <td><span class="badge ${k.status==='Vencido'?'bad':'ok'}">${k.status}</span></td>
    <td><div class="row-actions"><button class="mini-btn" data-payrow="${k.client}" title="Registrar abono" aria-label="Registrar abono de ${k.client}"><svg class="ico"><use href="#i-plus"/></svg></button><button class="mini-btn" data-stmt="${k.client}" title="Estado de cuenta" aria-label="Estado de cuenta de ${k.client}"><svg class="ico"><use href="#i-receipt"/></svg></button></div></td>
  </tr>`).join('') || `<tr class="empty-state-row"><td colspan="8">${emptyState('Sin cuentas', 'No hay registros para el filtro o la búsqueda actuales.', 'cxc', 'Limpiar filtros')}</td></tr>`;
  $('#navMoraDot').style.display = overdue > 0 ? '' : 'none';
}
$('#cxcTabs').addEventListener('click', e => {
  const t = e.target.closest('[data-tab]'); if (!t) return;
  state.cxcTab = t.dataset.tab; $$('.tab').forEach(x=>{ x.classList.toggle('active',x===t); x.setAttribute('aria-pressed', String(x===t)); }); renderCxc();
});
$('#cxcSearch').addEventListener('input', debounce(e => { state.cxcFilter = e.target.value; renderCxc(); }));
$('#cxcTableBody').addEventListener('click', e => {
  const p = e.target.closest('[data-payrow]'), s = e.target.closest('[data-stmt]');
  if (p) openPayment(p.dataset.payrow);
  if (s) openStatement(clients.find(c=>c.name===s.dataset.stmt) || { name:s.dataset.stmt, doc:'—', balance:0, limit:0 });
});
$('#newPaymentBtn').addEventListener('click', () => openPayment(cxc[0].client));
$('#statementBtn').addEventListener('click', () => openStatement(clients.find(c=>c.id===state.selectedClient) || clients[0]));
function openPayment(clientName) {
  const k = cxc.find(x=>x.client===clientName) || cxc[0];
  modal({
    title:'Registrar abono', sub:k.client + ' · ' + k.doc,
    body:`<div class="pay-confirm"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:11px;color:var(--muted)">Saldo pendiente</span><b class="mono" style="font-size:20px">${money(k.balance)}</b></div></div>
      <label class="field"><span>Monto del abono</span><div class="input-wrap"><span style="font-family:var(--mono)">L</span><input id="abonoAmount" type="number" min="0.01" step="0.01" value="${Math.min(k.balance,100)}" inputmode="decimal"></div><small class="field-error" id="abonoErr"></small></label>
      <label class="field"><span>Método de pago</span><select id="abonoMethod" class="select" style="width:100%;height:45px"><option>Efectivo</option><option>Transferencia ACH</option><option>Tarjeta</option></select></label>
      <label class="field"><span>Referencia</span><div class="input-wrap"><input id="abonoRef" placeholder="Opcional"></div></label>`,
    foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="doAbono">Registrar pago</button>',
    onMount(root) {
      $('#doAbono', root).addEventListener('click', () => {
        const amt = parseFloat($('#abonoAmount', root).value);
        if (!(amt > 0) || amt > k.balance) { $('#abonoErr', root).textContent = 'El abono debe ser mayor a cero y no superar el saldo.'; return; }
        const method = $('#abonoMethod', root).value, ref = $('#abonoRef', root).value.trim() || 'SIN-REF';
        processing('Aplicando abono y recalculando cartera…', () => {
          k.balance = round(k.balance - amt);
          if (k.balance === 0) { k.status = 'Vigente'; k.days = 0; }
          const c = clients.find(x=>x.name===k.client);
          if (c) c.balance = round(Math.max(0, c.balance - amt));
          const no = ++state.receiptNo;
          persist();
          renderCxc();
          if (state.screen === 'clientes') renderClientDetail();
          if (state.screen === 'dashboard') renderDashboard();
          modal({
            title:'Recibo de dinero', sub:'Pago registrado correctamente',
            body:`<div class="success-ico"><svg class="ico"><use href="#i-check"/></svg></div>
              <div class="modal-center"><p>Recibo <b class="mono">REC-${no}</b> emitido</p></div>
              <div class="receipt-mini"><div class="r-row"><span>Cliente</span><b>${k.client}</b></div><div class="r-row"><span>Factura</span><b class="mono">${k.doc}</b></div><div class="r-row"><span>Monto abonado</span><b>${money(amt)}</b></div><div class="r-row"><span>Método</span><b>${method}</b></div><div class="r-row"><span>Referencia</span><b class="mono">${ref}</b></div><div class="r-row total"><span>Nuevo saldo</span><span>${money(k.balance)}</span></div></div>`,
            foot:'<button class="btn btn-primary" data-close>Listo</button>'
          });
        });
      });
    }
  });
}

/* ------------------------------------------------------------------ 07 CIERRE */
const denoms = [500,100,50,20,10,5,1,'Monedas'];
function renderClosingDenoms() {
  $('#closingDenoms').innerHTML = denoms.map((d,i) => `<div class="denom-card">
    <span class="denom-bill">${d === 'Monedas' ? '¢' : 'L ' + d}</span>
    <input type="number" min="0" step="1" value="0" inputmode="numeric" data-denom="${i}" aria-label="Cantidad de ${d}">
    <small>${d === 'Monedas' ? 'L 0.05 – 0.50' : 'billetes'}</small>
  </div>`).join('');
}
$('#closingDenoms').addEventListener('input', () => {
  const counted = countCash();
  $('#blindTotal').textContent = 'L ••••••';
  $('#blindTotal').dataset.counted = counted;
});
function countCash() {
  let sum = 0;
  $$('[data-denom]').forEach((inp,i) => { sum += (parseFloat(inp.value||0) || 0) * (denoms[i] === 'Monedas' ? 0.25 : denoms[i]); });
  return round(sum);
}
$('#fillDemo').addEventListener('click', () => {
  const sh = state.shift || { fund:2000, cashSales:1650, withdrawals:0 };
  let remaining = round(sh.fund + sh.cashSales - sh.withdrawals);
  const vals = [500,100,50,20,10,5,1,0.25];
  const counts = vals.map(v => { const n = Math.floor(remaining / v); remaining = round(remaining - n * v); return n; });
  if (remaining > 0) counts[7] += 1; // tolerancia de centavos para el cuadre
  $$('[data-denom]').forEach((inp,i) => inp.value = counts[i]);
  $('#blindTotal').textContent = 'L ••••••';
  toast('Conteo demo cuadrado · listo para revelar');
});
$('#withdrawBtn').addEventListener('click', () => {
  const sh = state.shift;
  if (!sh) { toast('Abra un turno antes de registrar retiros', 'warn'); return; }
  const available = round(sh.fund + sh.cashSales - sh.withdrawals);
  modal({
    title:'Registrar retiro parcial', sub:'Efectivo retirado de caja durante el turno',
    body:`<div class="pay-confirm"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:11px;color:var(--muted)">Efectivo disponible en caja</span><b class="mono" style="font-size:18px">${money(available)}</b></div></div>
      <label class="field"><span>Monto a retirar</span><div class="input-wrap"><span style="font-family:var(--mono)">L</span><input id="withdrawAmount" type="number" min="0.01" step="0.01" value="100" inputmode="decimal"></div><small class="field-error" id="withdrawError"></small></label>
      <label class="field"><span>Motivo / autorizado por</span><div class="input-wrap"><input id="withdrawReason" placeholder="Ej. Pago a proveedor · Autoriza gerencia"></div></label>`,
    foot:'<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="doWithdraw">Registrar retiro</button>',
    onMount(root) {
      $('#doWithdraw', root).addEventListener('click', async () => {
        const amt = parseFloat($('#withdrawAmount', root).value || 0);
        if (!(amt > 0) || amt > available) { $('#withdrawError', root).textContent = 'El monto debe ser mayor a cero y no superar el efectivo disponible.'; return; }
        const reason = $('#withdrawReason', root).value.trim() || 'Sin motivo registrado';
        try {
          if (useApi) {
            const res = await api('/api/shifts/' + sh.id + '/withdraw','POST',{ amount:amt, reason, user_id:state.user.id });
            state.shift = normalizeShift(res.shift); applyRemote(res.state);
          } else sh.withdrawals = round(sh.withdrawals + amt);
          closeModal();
          toast('Retiro de ' + money(amt) + ' registrado · ' + reason);
        } catch (err) { $('#withdrawError', root).textContent = err.message; }
      });
    }
  });
});
$('#revealBtn').addEventListener('click', () => {
  const counted = countCash(), sh = state.shift || { fund:2000, cashSales:1650, withdrawals:0 };
  const theoretical = round(sh.fund + sh.cashSales - sh.withdrawals);
  const diff = round(counted - theoretical);
  state.revealed = true;
  const p = $('#reconcilePanel');
  p.innerHTML = `<div class="recon-head"><svg class="ico"><use href="#i-eye"/></svg><h3>Reporte de cuadre</h3></div>
    <div class="recon-row"><span>Fondo inicial</span><b>${money(sh.fund)}</b></div>
    <div class="recon-row"><span>Ventas en efectivo</span><b>${money(sh.cashSales)}</b></div>
    <div class="recon-row"><span>Retiros parciales</span><b>${money(sh.withdrawals)}</b></div>
    <div class="recon-row"><span>Saldo teórico</span><b>${money(theoretical)}</b></div>
    <div class="recon-row"><span>Efectivo contado</span><b>${money(counted)}</b></div>
    <div class="recon-diff ${Math.abs(diff) <= 1 ? 'ok' : 'bad'}"><small>${Math.abs(diff) <= 1 ? 'Cuadre correcto' : 'Diferencia detectada'}</small><b>${diff >= 0 ? '+' : '−'} ${money(Math.abs(diff))}</b></div>
    ${Math.abs(diff) > 50 ? '<div class="supervisor-warn"><svg class="ico"><use href="#i-alert"/></svg><span>Diferencia mayor a L 50. Se notificará al supervisor antes de autorizar el cierre.</span></div>' : ''}
    <label class="field"><span>Observación del cajero</span><textarea id="closeNote" class="recon-note" placeholder="Explique cualquier diferencia…"></textarea></label>
    <button class="btn btn-primary btn-block" id="confirmClose">Confirmar cierre de turno</button>`;
  $('#confirmClose').addEventListener('click', () => {
    const note = $('#closeNote').value.trim();
    if (Math.abs(diff) > 50 && !note) { toast('Explique la diferencia antes de confirmar', 'warn'); $('#closeNote').focus(); return; }
    processing('Cerrando turno y generando reporte…', async () => {
      try {
        if (useApi && state.shift) {
          const res = await api('/api/shifts/' + state.shift.id + '/close','POST',{ counted_cash:counted, note, user_id:state.user.id });
          applyRemote(res.state);
        }
        state.shift = null; state.revealed = false;
        $('#shiftState').textContent = 'Turno cerrado'; $('#shiftMeta').textContent = 'Caja 01 · Catacamas';
        $('.shift-mini').classList.add('closed');
        renderClosingDenoms();
        $('#reconcilePanel').innerHTML = '<div class="empty-reconcile"><svg class="ico"><use href="#i-lock"/></svg><h3>Cuadre protegido</h3><p>Complete el conteo ciego y presione <b>Revelar cuadre</b> para comparar contra el saldo del sistema.</p></div>';
        toast('Turno cerrado · reporte de cuadre generado');
        navTo('login');
      } catch (err) { toast('No se pudo cerrar el turno: ' + err.message, 'error'); }
    });
  });
});

/* ------------------------------------------------------------------ 08 DASHBOARD */
function countUp(el, target, prefix='', dec=0, instant=false) {
  const suffix = el.dataset.suffix || '';
  const token = (parseInt(el.dataset.animToken || 0, 10) + 1);
  el.dataset.animToken = token;
  const paint = v => el.textContent = prefix + v.toLocaleString('es-HN',{minimumFractionDigits:dec,maximumFractionDigits:dec}) + suffix;
  if (instant || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { paint(target); return; }
  const dur = 600, start = performance.now();
  const step = now => {
    if (+el.dataset.animToken !== token) return;
    const p = Math.min(1,(now-start)/dur), e = 1-Math.pow(1-p,3);
    paint(target*e);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const chartData = {
  hoy:[1200,1850,2400,3100,2850,3600,4200,3900,4800,5200,4100,3300],
  semana:[8200,9100,8700,11200,10600,13400,14850],
  mes:[42000,48000,45500,52000,58000,62000,71000,76000,82000,88000,94000,101000]
};
function renderCommissions() {
  const rows = sellers.map(s => {
    const rate = s.pct >= 90 ? .045 : s.pct >= 70 ? .035 : .025;
    return { ...s, rate, pay:round(s.sales * rate) };
  });
  const totalPay = rows.reduce((sum,x) => sum + x.pay, 0);
  $('#commissionsCard').innerHTML = `
    <div class="card-title"><div><span class="eyebrow">MÓDULO 05 · COMISIONES</span><h3>Liquidación por vendedor</h3></div><button class="link-btn" id="liquidateBtn">Liquidar <svg class="ico"><use href="#i-chev"/></svg></button></div>
    <div class="comm-list">${rows.map(r => `<div class="comm-row"><span class="avatar">${initials(r.name)}</span>
      <span class="comm-name"><b>${r.name}</b><small>Ventas ${money(r.sales)} · meta ${r.goal} · ${(r.rate*100).toFixed(1)}%</small></span>
      <span class="comm-pay">${money(r.pay)}<small>comisión</small></span></div>`).join('')}</div>
    <div class="recon-row" style="border-top:1px solid var(--line);margin-top:4px"><span>Total a liquidar</span><b>${money(totalPay)}</b></div>`;
  $('#liquidateBtn').addEventListener('click', () => confirmDialog(
    'Liquidar comisiones', 'Se generará el reporte de liquidación del periodo para ' + rows.length + ' vendedores por un total de ' + money(totalPay) + '.',
    () => toast('Liquidación generada · ' + money(totalPay) + ' (mock funcional)'), 'Liquidar'
  ));
}
function renderDashboard() {
  const r = state.range, d = chartData[r];
  const kpiReady = $('#kpiGrid').dataset.ready === '1';
  const overdueAmt = cxc.filter(k => k.status === 'Vencido').reduce((s,k) => s + k.balance, 0);
  const totalCxc = cxc.reduce((s,k) => s + k.balance, 0) || 1;
  const morosidad = +(overdueAmt / totalCxc * 100).toFixed(1);
  const cards = [
    { label:'Ventas brutas', value:'24,850', pre:'L ', dec:0, delta:'+8.4%', down:false },
    { label:'Ticket promedio', value:'415', pre:'L ', dec:0, delta:'+3.1%', down:false },
    { label:'Morosidad cartera', value:morosidad, pre:'', dec:1, suf:'%', delta:'−1.2%', down:false, warn:true },
    { label:'Clientes activos', value:'328', pre:'', dec:0, delta:'+14', down:false }
  ];
  $('#kpiGrid').innerHTML = cards.map((c,i) => `<div class="kpi-card ${c.warn?'warn':''}">
    <small>${c.label}</small><div><b data-kpi="${i}">${c.pre}0${c.suf||''}</b><span class="delta ${c.down?'down':''}">${c.delta}</span></div>
    <svg class="kpi-spark" viewBox="0 0 64 26"><path d="M0 22 L10 18 L20 20 L30 12 L40 15 L50 7 L64 3" fill="none" stroke="${c.warn?'#98531F':'#9C4F22'}" stroke-width="2"/></svg>
  </div>`).join('');
  cards.forEach((c,i) => {
    const el = $(`[data-kpi="${i}"]`);
    if (c.suf) el.dataset.suffix = c.suf;
    const target = typeof c.value === 'number' ? c.value : parseFloat(c.value.replace(',',''));
    countUp(el, target, c.pre, c.dec, kpiReady);
  });
  $('#kpiGrid').dataset.ready = '1';

  if ($('#lineChart').dataset.range !== r) {
    const w=620,h=170,pad=18, max=Math.max(...d)*1.12;
    const pts=d.map((v,i)=>[pad+i*(w-2*pad)/(d.length-1), h-pad-(v/max)*(h-2*pad)]);
    const line='M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L ');
    const area=line+` L ${pts[pts.length-1][0].toFixed(1)} ${h-pad} L ${pts[0][0].toFixed(1)} ${h-pad} Z`;
    const labels=r==='hoy'?['8a','10a','12p','2p','4p','6p']:r==='semana'?['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']:['Ene','Mar','May','Jul','Sep','Nov'];
    $('#lineChart').innerHTML=`<svg viewBox="0 0 ${w} ${h+16}" preserveAspectRatio="none">
      <defs><linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9C4F22" stop-opacity=".26"/><stop offset="1" stop-color="#9C4F22" stop-opacity="0"/></linearGradient></defs>
      ${[0,1,2,3].map(i=>`<line class="chart-grid" x1="${pad}" y1="${pad+i*(h-2*pad)/3}" x2="${w-pad}" y2="${pad+i*(h-2*pad)/3}"/>`).join('')}
      <path class="chart-area" d="${area}"/><path class="chart-line" d="${line}"/>
      ${pts.map(p=>`<circle class="chart-dot" cx="${p[0]}" cy="${p[1]}" r="3.2"/>`).join('')}
      ${labels.map((l,i)=>`<text class="chart-label" x="${pad+i*(w-2*pad)/(labels.length-1)}" y="${h+9}" text-anchor="middle">${l}</text>`).join('')}
    </svg>`;
    $('#lineChart').dataset.range = r;
  }

  const vencidoPct = morosidad;
  const porVencerPct = +(porVencer() / totalCxc * 100).toFixed(1);
  const alCorrientePct = Math.max(0, +(100 - vencidoPct - porVencerPct).toFixed(1));
  $('#donutCenterPct').textContent = vencidoPct.toFixed(1) + '%';
  $('#morosityDonut').style.background = `conic-gradient(#9C4F22 0 ${alCorrientePct}%, #98531F ${alCorrientePct}% ${alCorrientePct + porVencerPct}%, #A83C35 ${alCorrientePct + porVencerPct}% 100%)`;
  $('#donutLegend').innerHTML=`<div class="dl-row"><i style="background:#9C4F22"></i> Al corriente <b>${alCorrientePct.toFixed(1)}%</b></div>
    <div class="dl-row"><i style="background:#98531F"></i> Por vencer <b>${porVencerPct.toFixed(1)}%</b></div>
    <div class="dl-row"><i style="background:#A83C35"></i> Vencido <b>${vencidoPct.toFixed(1)}%</b></div>`;

  if ($('#heatmap').dataset.ready !== '1') {
    const heat=[[1,2,4],[2,3,4],[1,3,3],[2,4,3]];
    $('#heatmap').innerHTML=`<table class="heat-table"><thead><tr><th>SEGMENTO</th><th>BAJA</th><th>MEDIA</th><th>ALTA</th></tr></thead><tbody>
      ${['Frecuentes','Mayoristas','Crédito','Corporativo'].map((seg,i)=>`<tr><td>${seg}</td>${heat[i].map(v=>`<td><div class="heat-cell h-${v}">${['Bajo','Medio','Alto','Máximo'][v-1]}</div></td>`).join('')}</tr>`).join('')}
    </tbody></table>`;
    $('#heatmap').dataset.ready = '1';
  }

  if ($('#sellerGoals').dataset.ready !== '1') {
    $('#sellerGoals').innerHTML=sellers.map(s=>`<div class="goal-row"><div class="goal-top"><b>${s.name}</b><span>${s.pct}% de ${s.goal}</span></div><div class="goal-bar"><i style="width:${s.pct}%"></i></div></div>`).join('');
    $('#sellerGoals').dataset.ready = '1';
  }
  if ($('#commissionsCard').dataset.ready !== '1') { renderCommissions(); $('#commissionsCard').dataset.ready = '1'; }

  if ($('#topProducts').dataset.ready !== '1') {
    const maxSales=Math.max(...topProducts.map(p=>p.sales));
    $('#topProducts').innerHTML=topProducts.map((p,i)=>`<tr><td class="mono" style="color:var(--muted)">${String(i+1).padStart(2,'0')}</td><td><b>${p.name}</b></td><td class="mono">${p.units}</td><td class="mono">${money(p.sales)}</td><td><div class="top-share"><div class="bar"><i style="width:${p.sales/maxSales*100}%"></i></div><span>${(p.sales/maxSales*100).toFixed(0)}%</span></div></td></tr>`).join('');
    $('#topProducts').dataset.ready = '1';
  }
}
$('#rangeChips').addEventListener('click', e => {
  const b=e.target.closest('[data-range]'); if(!b)return;
  state.range=b.dataset.range; $$('#rangeChips button').forEach(x=>{ x.classList.toggle('active',x===b); x.setAttribute('aria-pressed', String(x===b)); }); renderDashboard();
});
$('#exportDash').addEventListener('click',()=>toast('Reporte exportado (simulación de descarga CSV)'));
$('#goProducts').addEventListener('click',()=>navTo('productos'));

/* ------------------------------------------------------------------ GLOBALES */
$('#menuBtn').addEventListener('click', () => { $('#sidebar').classList.add('open'); $('#scrim').classList.add('show'); });
$('#scrim').addEventListener('click', () => { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('show'); });
$('#moreBtn').addEventListener('click', () => modal({
  title:'Más módulos', sub:'Acceso rápido',
  body:`<div class="modal-list">${[['factura','Facturación SAR','i-receipt'],['productos','Productos y precios','i-box'],['cierre','Cierre de caja','i-cash'],['dashboard','Panel comercial','i-chart']].filter(([go])=>canAccess(go)).map(([go,label,icon])=>`<button class="client-row" data-more="${go}"><span class="avatar"><svg class="ico"><use href="#${icon}"/></svg></span><span class="cr-body"><strong>${label}</strong></span><svg class="ico"><use href="#i-chev"/></svg></button>`).join('')}</div>`,
  onMount(root) { $$('[data-more]',root).forEach(b=>b.addEventListener('click',()=>{closeModal();navTo(b.dataset.more);})); }
}));
$('#helpBtn').addEventListener('click', () => modal({
  title:'Guía rápida', sub:'COAGRO POS · flujo de mostrador',
  body:`<div class="receipt-mini">
    <div class="r-row"><span>1</span><b>Ingresar y registrar el fondo inicial</b></div>
    <div class="r-row"><span>2</span><b>Abrir turno y vender desde el POS</b></div>
    <div class="r-row"><span>3</span><b>Cerrar turno y completar el conteo ciego</b></div>
    <div class="r-row"><span>4</span><b>Confirmar el cuadre para volver al login</b></div>
  </div>
  <div class="receipt-mini" style="margin-top:10px">
    <div class="r-row"><span>Buscar producto</span><b><kbd>/</kbd></b></div>
    <div class="r-row"><span>Agregar primer resultado</span><b><kbd>Enter</kbd></b></div>
    <div class="r-row"><span>Cerrar diálogo</span><b><kbd>Esc</kbd></b></div>
    <div class="r-row"><span>Persistencia</span><b>SQLite · API</b></div>
  </div>`,
  foot:'<button class="btn btn-primary" data-close>Entendido</button>'
}));
$('#notifyBtn').addEventListener('click', () => modal({
  title:'Alertas del sistema', sub:'3 notificaciones pendientes',
  body:`<div class="modal-list">
    <div class="cd-alert" style="margin:0"><svg class="ico"><use href="#i-alert"/></svg><span><b>Cartera vencida</b><br>2 clientes superan los 20 días de mora.</span></div>
    <div class="cd-alert" style="margin:0;background:var(--neutral-soft);border-color:#D8C9B6;color:#6A4A34"><svg class="ico"><use href="#i-calendar"/></svg><span><b>CAI por vencer</b><br>Rango fiscal vigente hasta el 30/11/2026.</span></div>
    <div class="cd-alert" style="margin:0;background:var(--amber-soft)"><svg class="ico"><use href="#i-box"/></svg><span><b>Stock bajo</b><br>4 productos requieren reposición.</span></div>
  </div>`, foot:'<button class="btn btn-primary" data-close>Entendido</button>'
}));
$('#userMini').addEventListener('click', () => {
  const user = state.user || { name:'Invitado', role:'—' };
  const canAudit = ['admin','gerente'].includes(user.role);
  const foot = `${(user.role === 'admin' || !API_ON) ? '<button class="btn btn-ghost" id="resetDemo" style="color:var(--red)">Reiniciar datos</button>' : ''}${canAudit ? '<button class="btn btn-ghost" id="auditBtn">Bitácora</button>' : ''}<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-soft" id="logoutBtn">Cerrar sesión</button>`;
  modal({
    title:'Sesión activa', sub:user.name + ' · ' + user.role + ' · Caja 01',
    body:`<div class="receipt-mini"><div class="r-row"><span>Rol</span><b>${user.role}</b></div><div class="r-row"><span>Turno</span><b>${state.shift ? state.shift.id : 'Cerrado'}</b></div><div class="r-row"><span>Permisos</span><b>${(roleAccess[user.role] || []).join(', ')}</b></div></div>`,
    foot,
    onMount(root) {
      $('#logoutBtn',root).addEventListener('click',async ()=>{
        closeModal();
        try { if (useApi && state.token) await api('/api/logout','POST',{}); } catch (_) {}
        state.token = null; state.user = null; state.shift = null;
        try { sessionStorage.removeItem('coagro_token'); } catch (_) {}
        $('#shiftState').textContent = 'Turno cerrado'; $('#shiftMeta').textContent = 'Caja 01 · Catacamas'; $('.shift-mini').classList.add('closed');
        navTo('login'); toast('Sesión cerrada');
      });
      if ($('#resetDemo',root)) $('#resetDemo',root).addEventListener('click',()=>confirmDialog('Reiniciar datos de demostración','Se restaurará la semilla original de la base de datos (o el modo local).',async ()=>{
        try { if (useApi) await api('/api/reset','POST'); else localStorage.removeItem(STORE_KEY); }
        catch (err) { toast('No se pudo reiniciar: ' + err.message, 'error'); return; }
        location.reload();
      },'Reiniciar',true));
      if ($('#auditBtn',root)) $('#auditBtn',root).addEventListener('click',async ()=>{
        try {
          const res = await api('/api/audit');
          modal({ title:'Bitácora de operaciones', sub:'Últimos 100 eventos', wide:true,
            body:`<div class="table-scroll"><table class="data-table" style="min-width:0"><thead><tr><th>FECHA</th><th>USUARIO</th><th>ACCIÓN</th><th>ENTIDAD</th><th>REGISTRO</th></tr></thead><tbody>${res.events.map(e=>`<tr><td>${e.created_at}</td><td>${e.user_id||'—'}</td><td>${e.action}</td><td>${e.entity}</td><td class="mono">${e.entity_id||'—'}</td></tr>`).join('')}</tbody></table></div>`,
            foot:'<button class="btn btn-primary" data-close>Cerrar</button>' });
        } catch (err) { toast('No se pudo cargar la bitácora: ' + err.message, 'error'); }
      });
    }
  });
});
document.addEventListener('click', e => {
  const b = e.target.closest('.btn.ripple');
  if (!b) return;
  const r = b.getBoundingClientRect(), s = document.createElement('span');
  s.className = 'ripple-wave';
  const size = Math.max(r.width, r.height);
  s.style.width = s.style.height = size + 'px';
  s.style.left = (e.clientX - r.left - size/2) + 'px';
  s.style.top = (e.clientY - r.top - size/2) + 'px';
  b.appendChild(s); setTimeout(() => s.remove(), 560);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!modalIsDismissible) return;
    closeModal(); $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('show');
  }
  if (e.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName) && state.screen === 'pos') {
    e.preventDefault(); $('#productSearch').focus();
  }
  if (e.key === 'Enter' && document.activeElement === $('#productSearch') && state.screen === 'pos') {
    state.productFilter = $('#productSearch').value; state.productLimit = 8; renderProducts();
    const first = $('#productGrid [data-add]'); if (first) addToCart(first.dataset.add);
  }
});
function tick() {
  $('#liveClock').textContent = new Date().toLocaleTimeString('es-HN',{hour:'2-digit',minute:'2-digit'});
  if (state.shift) {
    const [h,m] = state.shift.opened.split(':').map(Number);
    const now = new Date();
    const mins = Math.max(0, (now.getHours()*60 + now.getMinutes()) - (h*60 + m));
    $('#shiftMeta').textContent = `Fondo ${money(state.shift.fund)} · ${Math.floor(mins/60)}h ${String(mins%60).padStart(2,'0')}m`;
  }
}
setInterval(tick, 30000); tick();

function renderAll() {
  if (state.screen === 'pos') { renderProducts(); renderCart(); }
  if (state.screen === 'clientes') { renderClientList(); renderClientDetail(); }
  if (state.screen === 'factura' && !state.lastSale) {
    state.lastSale = { no:428, date:today(), client:clients[0], method:'Efectivo · Contado', invoice:'001-001-01-00045231',
      lines:[{name:'Arroz 5 lb',qty:2,price:78,isv:15,subtotal:156},{name:'Aceite 1 L',qty:1,price:92,isv:15,subtotal:92},{name:'Frijol rojo 2 lb',qty:1,price:68,isv:15,subtotal:68}],
      totals:{b15:316,b18:0,ex:0,isv:round(316*.15),disc:0,total:round(316*1.15)} };
    renderInvoice(state.lastSale);
  }
  if (state.screen === 'factura') renderTalonarios();
  if (state.screen === 'productos') { $('#categoryFilter').innerHTML = '<option value="todas">Todas las categorías</option>' + [...new Set(products.map(p=>p.cat))].map(c=>`<option value="${c}">${c}</option>`).join(''); renderProductStats(); renderProductTable(); renderPromotions(); }
  if (state.screen === 'cxc') renderCxc();
  if (state.screen === 'dashboard') renderDashboard();
}

/* ------------------------------------------------------------------ INICIO */
document.body.classList.add('auth-mode');
renderOpeningDenoms();
renderClosingDenoms();
$$('#categoryChips .chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.cat === state.category)));
$$('#payMethods .pay-chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.pay === state.payMethod)));
$$('#cxcTabs .tab').forEach(t => t.setAttribute('aria-pressed', String(t.dataset.tab === state.cxcTab)));
$$('#rangeChips button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.range === state.range)));

async function boot() {
  const app = $('#app'), submit = $('#loginSubmit');
  const originalSubmit = submit.innerHTML;
  app.setAttribute('aria-busy','true'); submit.disabled = true;
  if (API_ON) submit.innerHTML = '<span>Conectando…</span>';
  try {
    if (API_ON) {
      try { state.token = sessionStorage.getItem('coagro_token'); } catch (_) {}
      if (state.token) {
        try { const me = await api('/api/me'); state.user = me.user; }
        catch (_) { state.token = null; state.user = null; try { sessionStorage.removeItem('coagro_token'); } catch (_) {} }
      }
      try {
        const d = await api('/api/state');
        if (d && Array.isArray(d.products) && d.products.length) { applyRemote(d); useApi = true; }
      } catch (err) { toast('API no disponible (' + err.message + ') · modo local', 'warn'); }
    }
    if (!useApi) loadData();
    if (state.shift) {
      $('#shiftState').textContent = 'Turno ' + state.shift.id + ' activo';
      $('#shiftMeta').textContent = 'Fondo: ' + money(state.shift.fund);
      $('.shift-mini').classList.remove('closed');
    }
    updateApiChip();
    $$('.art-stat b[data-count]').forEach(el => countUp(el, parseInt(el.dataset.count, 10)));
    renderAll();
    applyRole();
    if (state.user) navTo(defaultScreen[state.user.role] || 'pos');
  } finally {
    app.removeAttribute('aria-busy');
    submit.innerHTML = originalSubmit;
    submit.disabled = false;
  }
}
boot();
})();
