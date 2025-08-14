// ======= Config =======
const API_BASE = ""; // same-origin; mock mode if API 404s

// ======= Session =======
const sessKey = "tinyshop:sessionId";
const sessionId = (localStorage.getItem(sessKey) || (() => {
  const id = (self.crypto?.randomUUID?.() || String(Math.random()).slice(2));
  localStorage.setItem(sessKey, id);
  return id;
})());

// ======= State =======
let products = [];
const charts = new Map();
const cart = new Map();
let MOCK_MODE = false;

// ======= Helpers =======
const euro = n => Number(n).toFixed(2);
const qs = s => document.querySelector(s);
function setBackendBadge(cls, text){
  const el = qs('#backendStatus');
  el.classList.remove('ok','warn');
  if (cls) el.classList.add(cls);
  el.textContent = text;
}
function toggleSimButtons(enabled){
  qs('#btnStart').disabled = !enabled;
  qs('#btnPause').disabled = !enabled;
  qs('#btnStep').disabled = !enabled;
}

// ======= Cart =======
function updateCartUI() {
  const itemsEl = document.getElementById('cartItems');
  itemsEl.innerHTML = '';
  let total = 0, count = 0;
  for (const [pid, {qty, price, name}] of cart.entries()) {
    total += qty * price; count += qty;
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
      <div>
        <div>${name}</div>
        <small>€ ${euro(price)} × ${qty}</small>
      </div>
      <div class="controls">
        <button data-action="dec" data-id="${pid}">−</button>
        <button data-action="inc" data-id="${pid}">+</button>
      </div>`;
    itemsEl.appendChild(row);
  }
  if (cart.size === 0) {
    const empty = document.createElement('div');
    empty.className = 'cart-empty';
    empty.textContent = 'Cart is empty.';
    itemsEl.appendChild(empty);
  }
  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartTotal').textContent = euro(total);
}
function addToCart(p) {
  const current = cart.get(p._id) || { qty: 0, price: p.currentPrice, name: p.name };
  current.qty += 1;
  current.price = p.currentPrice;
  current.name = p.name;
  cart.set(p._id, current);
  updateCartUI();
}
function changeQty(productId, delta) {
  const item = cart.get(productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart.delete(productId);
  updateCartUI();
}
document.getElementById('cart').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (action === 'inc') return changeQty(id, +1);
  if (action === 'dec') return changeQty(id, -1);
});

// ======= Rendering =======
function productCard(p) {
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <div class="row">
      <div class="name">${p.name}</div>
      <div class="price">€ ${euro(p.currentPrice)}</div>
    </div>
    <div class="row">
      <div class="stock">Stock: ${p.stock}</div>
      <span class="badge">SKU ${p.sku}</span>
    </div>
    <canvas id="chart-${p._id}"></canvas>
    <div class="row">
      <div class="muted">${MOCK_MODE ? 'Mock pricing' : 'Auto-pricing active'}</div>
      <div class="controls">
        <button data-buy="${p._id}">Buy 1</button>
      </div>
    </div>`;
  return el;
}
async function renderProducts() {
  const grid = document.getElementById('products');
  grid.innerHTML = '';
  products.forEach(p => grid.appendChild(productCard(p)));

  grid.onclick = (e) => {
    const btn = e.target.closest('button[data-buy]');
    if (!btn) return;
    const id = btn.getAttribute('data-buy');
    const p = products.find(x => String(x._id) === String(id));
    if (p) addToCart(p);
  };

  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const card = entry.target;
        const id = card.querySelector('canvas').id.replace('chart-','');
        trackView(id);
        io.unobserve(card);
      }
    }
  }, { threshold: 0.6 });
  document.querySelectorAll('.card').forEach(card => io.observe(card));

  for (const p of products) await loadChart(p._id);
}

// ======= API core =======
async function fetchJSON(path) {
  if (MOCK_MODE) throw new Error('mock');
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) throw new Error('HTTP content-type not json');
  return res.json();
}

// ======= Data access (with fallbacks) =======
async function getProducts() {
  try {
    products = await fetchJSON('/api/products');
  } catch {
    products = [
  { _id: 'p1', sku:'SKU-001', name:'JugoCoin', currentPrice: 199.99, stock: 87 },
  { _id: 'p2', sku:'SKU-002', name:'Rotom', currentPrice: 649.49, stock: 42 },
  { _id: 'p3', sku:'SKU-003', name:'Porygon', currentPrice: 425.75, stock: 120 },
  { _id: 'p4', sku:'SKU-004', name:'Kassir', currentPrice: 1150.00, stock: 200 }
];

  }
  await renderProducts();
  await loadAnalyticsCharts();

}
async function getHistory(productId, limit=40) {
  try {
    return await fetchJSON(`/api/products/${productId}/history?limit=${limit}`);
  } catch {
    const p = products.find(x => x._id === productId) || { currentPrice: 2.0 };
    const pts = []; let v = p.currentPrice;
    for (let i=0;i<limit;i++){ v = +(v * (1 + (Math.random()-0.5)*0.02)).toFixed(2); pts.push({ tick:i, price:v }); }
    return pts;
  }
}
async function trackView(productId){
  if (MOCK_MODE) return;
  try {
    await fetch(`${API_BASE}/api/track/view`, {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ productId, sessionId })
    });
  } catch {}
}
async function checkout(){
  const items = Array.from(cart.entries()).map(([productId, v])=>({ productId, qty: v.qty }));
  if (!items.length) return;
  if (MOCK_MODE) { cart.clear(); updateCartUI(); alert('Mock order placed!'); return; }
  try {
    const res = await fetch(`${API_BASE}/api/checkout`, {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ items, sessionId })
    });
    if (!res.ok) throw new Error('checkout failed');
    cart.clear(); updateCartUI();
    await getProducts(); // refresh
    alert('Order placed!');
  } catch (e) {
    alert('Checkout failed. Is the API running?');
  }
}
document.getElementById('btnCheckout').onclick = checkout;

// ======= Charts =======
async function loadChart(productId){
  const ctx = document.getElementById(`chart-${productId}`);
  if (!ctx) return;
  const history = await getHistory(productId, 40);
  const labels = history.map(h => h.tick);
  const data = history.map(h => h.price);
  const chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: '€', data, tension: 0.25, pointRadius: 0, borderWidth: 2 }] },
    options: {
      plugins: { legend: { display:false } },
      scales: {
        x: { grid:{ display:false }, ticks:{ display:false } },
        y: { grid:{ color:'#1e2633' }, ticks:{ callback: v => '€'+v } }
      },
      animation: false,
      responsive: true,
      maintainAspectRatio: false
    }
  });
  charts.set(productId, chart);
}

// ======= Analytics (Best sellers & Stock distribution) =======
let bestSellersChart = null;
let stockDistChart = null;

// Try backend first; fall back to mock
async function getBestSellers(limit = 6) {
  try {
    const data = await fetchJSON(`/api/analytics/bestsellers?limit=${limit}`);
    // expected shape: [{productId,name,units}]
    return data;
  } catch {
    // Mock: generate pseudo sales proportional to price attractiveness
    const mock = products.map(p => ({
      productId: p._id,
      name: p.name,
      // cheaper items tend to “sell” more in mock
      units: Math.max(1, Math.round((200 / (p.currentPrice + 1)) + Math.random()*20))
    }));
    // sort and take top N
    mock.sort((a,b) => b.units - a.units);
    return mock.slice(0, limit);
  }
}

async function getStockDistribution() {
  try {
    const data = await fetchJSON(`/api/analytics/stock-distribution`);
    // expected shape: [{productId,name,stock}]
    return data;
  } catch {
    // Mock: derive from current product list
    return products.map(p => ({ productId: p._id, name: p.name, stock: p.stock }));
  }
}

async function renderBestSellersChart() {
  const canvas = document.getElementById('chart-bestsellers');
  if (!canvas) return;
  const rows = await getBestSellers(6);
  const labels = rows.map(r => r.name);
  const values = rows.map(r => r.units);

  // destroy if exists to avoid duplicate instances on re-render
  if (bestSellersChart) bestSellersChart.destroy();
  bestSellersChart = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Units sold', data: values }] },
    options: {
      plugins: { legend: { display: false } },
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { grid: { display:false } }, y: { beginAtZero: true } }
    }
  });
}

async function renderStockDistributionChart() {
  const canvas = document.getElementById('chart-stockdist');
  if (!canvas) return;
  const rows = await getStockDistribution();
  const labels = rows.map(r => r.name);
  const values = rows.map(r => r.stock);

  if (stockDistChart) stockDistChart.destroy();
  stockDistChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values }]
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      responsive: true,
      maintainAspectRatio: false,
      cutout: '55%'
    }
  });
}

async function loadAnalyticsCharts() {
  await renderBestSellersChart();
  await renderStockDistributionChart();
}


// ======= Sim controls =======
async function fetchSimState(){
  if (MOCK_MODE) { qs('#tickStatus').textContent = 'sim: mock'; return; }
  try {
    const s = await fetchJSON('/api/sim/state');
    qs('#tickStatus').textContent = `sim: ${s.status || 'unknown'} · tick ${s.tick ?? '?'}`;
  } catch { qs('#tickStatus').textContent = 'sim: unavailable'; }
}
function simAction(path){
  if (MOCK_MODE) return;
  fetch(`${API_BASE}/api/sim/${path}`, { method:'POST' }).then(fetchSimState).catch(()=>{});
}
document.getElementById('btnStart').onclick = () => simAction('start');
document.getElementById('btnPause').onclick = () => simAction('pause');
document.getElementById('btnStep').onclick  = () => simAction('step');

// ======= Backend detection =======
async function detectBackend(){
  const probe = ['/api/health','/api/products'];
  for (const p of probe) {
    try {
      const res = await fetch(`${API_BASE}${p}`);
      if (res.ok && (res.headers.get('content-type')||'').includes('application/json')) {
        MOCK_MODE = false; setBackendBadge('ok','backend: live'); toggleSimButtons(true); return;
      }
    } catch {}
  }
  MOCK_MODE = true; setBackendBadge('warn','backend: mock'); toggleSimButtons(false);
}

// ======= Self-tests (UI sanity) =======
function runSelfTests(){
  const results = [];
  function t(name, fn){
    try { fn(); console.info('✅', name); results.push({name, ok:true}); }
    catch(e){ console.error('❌', name, e); results.push({name, ok:false, e}); }
  }
  t('renders product cards', ()=>{
    if (document.querySelectorAll('.card').length === 0) throw new Error('no product cards');
  });
  t('cart add/remove', ()=>{
    const first = products[0];
    addToCart(first);
    if (!cart.has(first._id)) throw new Error('add failed');
    changeQty(first._id, -1);
    if (cart.has(first._id)) throw new Error('remove failed');
  });
  console.log('Self-tests finished:', results);
}

// ======= Init =======
(async function init(){
  await detectBackend();
  await getProducts();
  await fetchSimState();
  updateCartUI();
  runSelfTests();
})();

setInterval(() => {
  getProducts(); // re-renders cards & mini charts
}, 8000);
