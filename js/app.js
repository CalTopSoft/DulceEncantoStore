/* ============ Dulce Encanto · Prototipo interactivo (sin servidor) ============ */
(function(){
'use strict';
const $  = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const money = n => '$' + (Math.round(n*100)/100).toFixed(2);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic = (n, cls='') => `<svg class="ic ${cls}"><use href="#i-${n}"/></svg>`;
const store = {
  get(k,d){ try{ const v = localStorage.getItem('de_'+k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem('de_'+k, JSON.stringify(v)); }catch(e){} }
};
const byId = id => DE.products.find(p => p.id === id);
const catLabel = {pasteles:'Pasteles', postres:'Postres', porciones:'Porciones'};
const catIcon  = {pasteles:'cake', postres:'cupcake', porciones:'slice'};

/* ---------------- Estado ---------------- */
const S = {
  cart:   store.get('cart', []),
  user:   store.get('user', null),
  users:  store.get('users', []),
  orders: store.get('orders', []),
  favs:   store.get('favs', []),
  cookies:store.get('cookies', null),
  promo:  store.get('promo', null),
  ui: {tab:'todos', sort:'rec', avail:'all', q:'', blogCat:'todos', step:1, view:'checkout', lastOrder:null,
       profileTab:'pedidos', authTab:'login', slide:0, branch:'centro', qty:1}
};
const C = { name:'', phone:'', email:'', date:'', time:'', notes:'', delivery:'retiro', branch:'centro', address:'', zone:'norte', ref:'', cnum:'', cname:'', cexp:'', ccvv:'' };
const CFG = { size:'12', flavor:'vainilla', fillings:['manjar','fresas'], design:'cumple', color:'rosa', msg:'', date:'' };
let timers = [];
const persist = () => { store.set('cart',S.cart); store.set('user',S.user); store.set('users',S.users); store.set('orders',S.orders); store.set('favs',S.favs); store.set('promo',S.promo); };

/* ---------------- Utilidades ---------------- */
function toast(msg, type='ok'){
  const t = document.createElement('div');
  t.className = 'toast ' + (type==='warn'?'warn':'');
  t.innerHTML = ic(type==='warn'?'info':'check') + `<span>${msg}</span>`;
  $('#toasts').appendChild(t);
  setTimeout(()=>{ t.classList.add('out'); setTimeout(()=>t.remove(), 300); }, 2800);
}
const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const addDays = n => { const d = new Date(); d.setHours(12); d.setDate(d.getDate()+n); return d; };
const fmtDate = s => { if(!s) return ''; const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('es-EC',{weekday:'long',day:'numeric',month:'long'}); };
const orderId = () => 'DE-' + Math.floor(10000 + Math.random()*89999);
const stars = n => `<div class="stars">${Array.from({length:5},(_,i)=>`<svg class="ic" style="${i<n?'':'opacity:.25'}"><use href="#i-star"/></svg>`).join('')}</div>`;
const hasCustomOrEncargo = () => S.cart.some(i => i.custom || (byId(i.id)||{}).avail === 'encargo');

/* ---------------- Carrito ---------------- */
function cartCount(){ return S.cart.reduce((a,i)=>a+i.qty,0); }
function addToCart(item, qty=1){
  const ex = !item.custom && S.cart.find(i => i.key === item.key);
  if(ex) ex.qty += qty; else S.cart.push({...item, qty});
  persist(); updateCartUI(true);
  toast(`<b>${esc(item.name)}</b> agregado al carrito`);
}
function totals(){
  const sub = S.cart.reduce((a,i)=>a + i.price*i.qty, 0);
  let disc = 0, freeShip = false;
  const p = S.promo && DE.promos[S.promo];
  if(p){
    if(p.type==='pct') disc = sub*p.value;
    if(p.type==='flat' && sub >= (p.min||0)) disc = p.value;
    if(p.type==='ship') freeShip = true;
  }
  let fee = 0;
  if(C.delivery === 'delivery'){
    fee = DE.zones[C.zone].fee;
    if(sub >= 40 || freeShip) fee = 0;
  }
  return {sub, disc, fee, total: Math.max(0, sub - disc + fee), freeShip};
}
function applyPromo(code){
  code = (code||'').trim().toUpperCase();
  if(!code) return toast('Escribe un código', 'warn');
  const p = DE.promos[code];
  if(!p) return toast('Ese código no es válido', 'warn');
  if(p.min && totals().sub < p.min) return toast(`Este código requiere compras desde ${money(p.min)}`, 'warn');
  S.promo = code; persist(); toast(`Código <b>${code}</b> aplicado: ${p.label}`);
  refreshCheckout(); renderDrawer();
}
function updateCartUI(bump){
  const n = cartCount(), b = $('#cart-count');
  b.textContent = n; b.hidden = n===0;
  if(bump){ const btn = $('#btn-cart'); btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump'); }
  $('#account-dot').hidden = !S.user;
  if(!$('#drawer').hidden) renderDrawer();
}
function cartLineHTML(i, mini){
  const art = i.artSvg || DE.art(byId(i.id).art);
  const bg = i.bg || (byId(i.id)||{}).bg || '#fff0f3';
  return `<div class="cart-line">
    <div style="background:${bg};border-radius:16px;display:grid;place-items:center">${art}</div>
    <div><h4>${esc(i.name)}</h4><small>${esc(i.note || catLabel[(byId(i.id)||{}).cat] || '')}</small><small>${money(i.price)} c/u</small></div>
    <div class="line-end">
      <div class="qty-ctl"><button data-act="qty" data-key="${i.key}" data-d="-1" aria-label="Menos">${ic('minus','sm')}</button><span>${i.qty}</span><button data-act="qty" data-key="${i.key}" data-d="1" aria-label="Más">${ic('plus','sm')}</button></div>
      <strong>${money(i.price*i.qty)}</strong>
      <button class="rm" data-act="rm" data-key="${i.key}">${ic('trash','sm')} Quitar</button>
    </div></div>`;
}
function renderDrawer(){
  const body = $('#drawer-body'), foot = $('#drawer-foot');
  if(!S.cart.length){
    body.innerHTML = `<div class="empty-cart">${DE.art({type:'cupcake',c:['#f6dca0','#ffc2cf','#e0708f','#c9b8e8']})}<h3>Tu carrito está vacío</h3><p class="muted">Agrega algo dulce para empezar.</p><a href="#/productos" class="btn" style="margin-top:1rem" data-act="cart-close">Ver productos</a></div>`;
    foot.innerHTML = ''; return;
  }
  body.innerHTML = S.cart.map(i => cartLineHTML(i,true)).join('');
  const t = totals();
  foot.innerHTML = `<div class="sum-line"><span>Subtotal</span><strong>${money(t.sub)}</strong></div>
    ${t.disc?`<div class="sum-line"><span>Descuento (${S.promo})</span><strong>- ${money(t.disc)}</strong></div>`:''}
    <p class="muted" style="font-size:.78rem;margin:.3rem 0 .9rem">El costo de entrega se calcula en el pedido.</p>
    <a href="#/pedidos" class="btn block" data-act="checkout-go">Continuar con el pedido ${ic('arrow')}</a>`;
}
function openDrawer(){ $('#overlay').hidden = false; $('#drawer').hidden = false; renderDrawer(); }
function closeDrawer(){ $('#overlay').hidden = true; $('#drawer').hidden = true; }

/* ---------------- Tarjetas de producto ---------------- */
function pcard(p){
  const fav = S.favs.includes(p.id);
  const av = {hoy:['', 'Disponible hoy'], encargo:['order','Por encargo · 24 h'], agotado:['out','Agotado hoy']}[p.avail];
  const tagCols = {'Más pedido':'rose','Nuevo':'mint','Temporada':'sun','Del día':'sky','Sin gluten':'lilac'};
  return `<article class="pcard">
    <div class="pcard-art" style="background:${p.bg}" data-act="detail" data-id="${p.id}">
      <div class="tags">${p.tags.map(t=>`<span class="chip ${tagCols[t]||''}">${t}</span>`).join('')}</div>
      <button class="fav ${fav?'on':''}" data-act="fav" data-id="${p.id}" aria-label="Favorito">${ic('heart')}</button>
      ${DE.art(p.art)}
    </div>
    <div class="pcard-body">
      <span class="avail ${av[0]}"><i></i>${av[1]}</span>
      <h3>${p.name}</h3>
      <div class="rate">${ic('star')} <b>${p.rating}</b> · ${p.reviews} opiniones</div>
      <p>${p.desc}</p>
      <div class="pcard-foot">
        <div class="price">${money(p.price)}</div>
        <button class="btn sm" data-act="add" data-id="${p.id}" ${p.avail==='agotado'?'disabled':''}>${ic('plus','sm')} Agregar</button>
      </div>
    </div></article>`;
}
function openDetail(id){
  const p = byId(id); S.ui.qty = 1;
  const av = {hoy:'Disponible hoy', encargo:'Por encargo (24 h de anticipación)', agotado:'Agotado hoy'}[p.avail];
  openModal(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.6rem;align-items:center" class="detail">
    <div style="background:${p.bg};border-radius:22px;padding:1.5rem;display:grid;place-items:center">${DE.art(p.art)}</div>
    <div>
      <span class="chip ${p.cat==='pasteles'?'rose':p.cat==='postres'?'':'sun'}">${ic(catIcon[p.cat],'sm')} ${catLabel[p.cat]}</span>
      <h2 style="margin:.7rem 0 .3rem;font-size:1.6rem">${p.name}</h2>
      <div class="rate">${ic('star')} <b>${p.rating}</b> · ${p.reviews} opiniones</div>
      <p style="margin:.8rem 0">${p.desc}</p>
      <h4>Ingredientes</h4><p class="muted" style="font-size:.85rem">${p.ingredients}</p>
      <p class="avail ${p.avail==='encargo'?'order':p.avail==='agotado'?'out':''}" style="margin:.4rem 0"><i></i> ${av}</p>
      <div class="price" style="margin:.6rem 0">${money(p.price)}</div>
      <div style="display:flex;gap:.8rem;align-items:center;flex-wrap:wrap">
        <div class="qty-ctl"><button data-act="dqty" data-d="-1" aria-label="Menos">${ic('minus','sm')}</button><span id="dqty">1</span><button data-act="dqty" data-d="1" aria-label="Más">${ic('plus','sm')}</button></div>
        <button class="btn" data-act="add-detail" data-id="${p.id}" ${p.avail==='agotado'?'disabled':''}>${ic('cart')} Agregar al carrito</button>
      </div>
    </div></div>`, true);
}

/* ---------------- Modal ---------------- */
function openModal(html, wide){
  $('#modal-body').innerHTML = html;
  $('.modal').classList.toggle('wide', !!wide);
  $('#modal').hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeModal(){ $('#modal').hidden = true; document.body.style.overflow = ''; }
function openLegal(k){
  if(k === 'faq'){
    openModal(`<h2>Preguntas frecuentes</h2>` + DE.faq.map((f,i)=>`<div class="acc ${i===0?'open':''}"><button data-act="acc">${f[0]} ${ic('plus')}</button><div class="a"><p>${f[1]}</p></div></div>`).join(''));
  } else if(k === 'cookies'){
    const c = S.cookies || {analytics:true, marketing:false};
    openModal(`<h2>Política de cookies</h2><p>Usamos cookies para que el sitio funcione, recordar tu carrito y entender cómo lo usas.</p>
      <div class="card" style="margin:1rem 0;display:grid;gap:.8rem">
        <label style="display:flex;gap:.7rem;align-items:center"><input type="checkbox" checked disabled> <span><b>Necesarias</b><br><small class="muted">Carrito, sesión y seguridad.</small></span></label>
        <label style="display:flex;gap:.7rem;align-items:center"><input type="checkbox" id="ck-an" ${c.analytics?'checked':''}> <span><b>Analíticas</b><br><small class="muted">Estadísticas anónimas de uso.</small></span></label>
        <label style="display:flex;gap:.7rem;align-items:center"><input type="checkbox" id="ck-mk" ${c.marketing?'checked':''}> <span><b>Marketing</b><br><small class="muted">Promociones personalizadas.</small></span></label>
      </div><button class="btn" data-act="save-cookies">Guardar preferencias</button>`);
  } else {
    openModal(`<h2>${DE.legal[k].t}</h2>${DE.legal[k].h}`);
  }
}

/* ---------------- Búsqueda global ---------------- */
function doSearch(q){
  q = q.trim().toLowerCase();
  const box = $('#search-results');
  if(!q){ box.innerHTML = ''; return; }
  const res = DE.products.filter(p => (p.name+' '+p.desc+' '+p.cat+' '+p.ingredients).toLowerCase().includes(q)).slice(0,8);
  box.innerHTML = res.length ? res.map(p => `<button class="sr-item" data-act="detail" data-id="${p.id}">${DE.art(p.art).replace('class="art"',`class="art" style="background:${p.bg}"`)}<span><b>${p.name}</b><small>${catLabel[p.cat]} · ${money(p.price)}</small></span></button>`).join('')
    : `<p class="muted">No encontramos «${esc(q)}». Prueba con «chocolate», «tres leches» o «macarons».</p>`;
}

/* ============================================================
   VISTAS
   ============================================================ */
const V = {};

/* ---- Componentes compartidos ---- */
function promosHTML(){
  return `<div class="grid c3">
    <div class="promo p1"><div class="big">10%</div><h3>En tu primera compra</h3><p class="muted">Aplica en cualquier producto del catálogo.</p><span class="code" data-act="promo-apply" data-code="DULCE10" title="Aplicar código">DULCE10</span></div>
    <div class="promo p2"><div class="big">$5</div><h3>De descuento desde $30</h3><p class="muted">Perfecto para pasteles y combos de oficina.</p><span class="code" data-act="promo-apply" data-code="CUMPLE5">CUMPLE5</span></div>
    <div class="promo p3"><div class="big">${ic('truck','lg')}</div><h3>Delivery gratis</h3><p class="muted">Sin costo de envío en Guayaquil y Samborondón.</p><span class="code" data-act="promo-apply" data-code="ENVIOGRATIS">ENVIOGRATIS</span></div></div>`;
}
function campanasHTML(){
  const camp = [
    {t:'Black Friday Dulce', d:'27 de noviembre', x:'Porciones en combo y cajas de cupcakes con precio especial.', bg:'var(--sun-l)', art:{type:'cupcake',c:['#f6dca0','#ffc2cf','#e0708f','#c9b8e8']}},
    {t:'Navidad Dulce', d:'Reservas abiertas', x:'Tortas navideñas, panetones artesanales y cajas de regalo.', bg:'var(--rose-xl)', art:{type:'layer',c:['#c4455f','#ffffff','#2e7d4f','#f7cf9b']}},
    {t:'Fin de año', d:'28–31 de diciembre', x:'Bandejas de postres para brindar con familia y amigos.', bg:'var(--lilac-l)', art:{type:'macarons',c:['#ffc2cf','#cfe5bd','#d9c8f2','#fff']}}];
  return `<div class="grid c3">${camp.map(c=>`<a href="#/productos/personalizar" class="cat-card" style="background:${c.bg}">${DE.art(c.art)}<span class="chip sun" style="align-self:flex-start;margin-bottom:.5rem">${c.d}</span><h3>${c.t}</h3><span>${c.x}</span></a>`).join('')}</div>`;
}
function reviewsHTML(){
  return `<div class="grid c4" style="grid-template-columns:repeat(auto-fit,minmax(250px,1fr))">${DE.reviews.map(r=>`<div class="review">${stars(r.r)}<p>“${r.t}”</p><div class="who"><div class="ava">${r.n[0]}</div><div><b>${r.n}</b><small>${r.w}</small></div></div></div>`).join('')}</div>`;
}
function sectionHead(eb, h, p, right=''){
  return `<div class="section-head"><div><span class="eyebrow">${ic('sparkle','sm')} ${eb}</span><h2>${h}</h2>${p?`<p>${p}</p>`:''}</div>${right}</div>`;
}

/* ---- INICIO ---- */
V.inicio = function(){
  const slides = [
    {cls:'s1', eb:'Hecho a mano en Guayaquil', h:'Tortas que cuentan <em>tu historia</em>', p:'Elige sabor, relleno y diseño. Nosotros la hacemos realidad en 48 horas.', cta:[['Personalizar mi torta','#/productos/personalizar',''],['Ver catálogo','#/productos','ghost']], art:{type:'layer',c:['#f6dca0','#ffc2cf','#e0708f','#fff']}},
    {cls:'s2', eb:'Campaña de temporada', h:'Navidad <em>Dulce</em> ya está aquí', p:'Reserva tu torta navideña y recibe un detalle de regalo en pedidos antes del 10 de diciembre.', cta:[['Reservar ahora','#/productos/personalizar',''],['Ver promociones','#/productos','ghost']], art:{type:'layer',c:['#c4455f','#ffffff','#2e7d4f','#f7cf9b']}},
    {cls:'s3', eb:'Porciones del día', h:'Un antojo, <em>hoy mismo</em>', p:'Porciones recién horneadas desde $3.20. Retira en local o pídelas a domicilio.', cta:[['Ver porciones','#/productos/porciones',''],['Pedir ahora','#/pedidos','ghost']], art:{type:'slice',c:['#8b5a46','#b98368','#e0708f','#fff']}}];
  const feat = DE.products.filter(p => p.tags.includes('Más pedido')).slice(0,4);
  return `<section class="hero"><div class="wrap">
    <div class="slider" id="slider">
      <div class="slides" id="slides">${slides.map(s=>`<div class="slide ${s.cls}">
        <div class="blob" style="width:260px;height:260px;right:-60px;top:-70px;background:#fff"></div>
        <div class="blob" style="width:140px;height:140px;left:38%;bottom:-50px;background:rgba(255,255,255,.7)"></div>
        <div><span class="chip" style="background:#fff;border:1.5px solid var(--ink)">${ic('sparkle','sm')} ${s.eb}</span><h1>${s.h}</h1><p>${s.p}</p>
        <div class="cta">${s.cta.map(c=>`<a class="btn lg ${c[2]}" href="${c[1]}">${c[0]}</a>`).join('')}</div></div>
        <div class="slide-art"><span class="spark" style="left:6%;top:6%">${ic('sparkle','lg')}</span><span class="spark" style="right:4%;bottom:10%;animation-delay:1s">${ic('sparkle')}</span>${DE.art(s.art)}</div>
      </div>`).join('')}</div>
      <button class="icon-btn s-arrow l" data-act="slide-prev" aria-label="Anterior">${ic('chevron-l')}</button>
      <button class="icon-btn s-arrow r" data-act="slide-next" aria-label="Siguiente">${ic('chevron-r')}</button>
      <div class="s-dots">${slides.map((_,i)=>`<button data-act="slide" data-i="${i}" class="${i===0?'on':''}" aria-label="Diapositiva ${i+1}"></button>`).join('')}</div>
    </div>
    <div class="perks">
      <div class="perk"><div class="pi" style="background:var(--rose-l)">${ic('palette','lg')}</div><div><strong>Personaliza tu torta</strong><small>Sabor, relleno y diseño</small></div></div>
      <div class="perk"><div class="pi" style="background:var(--mint-l)">${ic('truck','lg')}</div><div><strong>Entrega a domicilio</strong><small>O retiro en local</small></div></div>
      <div class="perk"><div class="pi" style="background:var(--sky-l)">${ic('shield','lg')}</div><div><strong>Pago seguro</strong><small>Conexión cifrada SSL</small></div></div>
      <div class="perk"><div class="pi" style="background:var(--sun-l)">${ic('clock','lg')}</div><div><strong>Confirmación rápida</strong><small>Correo o WhatsApp</small></div></div>
    </div></div></section>

  <section class="section" style="padding-top:1rem"><div class="wrap">
    ${sectionHead('Menú de productos','¿Qué se te antoja hoy?','Tres formas de endulzar tu día.')}
    <div class="grid c3">
      <a href="#/productos/pasteles" class="cat-card" style="background:var(--rose-l)">${DE.art({type:'layer',c:['#f6dca0','#ffffff','#e0708f','#ffd9e0']})}<span>Para celebrar</span><h3>Pasteles</h3></a>
      <a href="#/productos/postres" class="cat-card" style="background:var(--lilac-l)">${DE.art({type:'cupcake',c:['#f6dca0','#ffc2cf','#e0708f','#c9b8e8']})}<span>Para compartir</span><h3>Postres</h3></a>
      <a href="#/productos/porciones" class="cat-card" style="background:var(--sun-l)">${DE.art({type:'slice',c:['#8b5a46','#b98368','#e0708f','#fff']})}<span>Para ahora mismo</span><h3>Porciones</h3></a>
    </div></div></section>

  <section class="section tint"><div class="wrap">
    ${sectionHead('Los favoritos','Más pedidos de la semana','Lo que más piden nuestros clientes.',`<a class="btn ghost sm" href="#/productos">Ver todo ${ic('arrow','sm')}</a>`)}
    <div class="pgrid">${feat.map(pcard).join('')}</div></div></section>

  <section class="section"><div class="wrap">
    ${sectionHead('Campañas de temporada','Fechas especiales, sabores especiales')}
    ${campanasHTML()}</div></section>

  <section class="section tint"><div class="wrap">
    ${sectionHead('Opiniones de clientes','Dulces palabras')}
    ${reviewsHTML()}</div></section>

  <section class="section"><div class="wrap">
    ${sectionHead('Blog de repostería','Aprende con nosotros','Recetas, tendencias y consejos. Actualizamos cada semana.',`<a class="btn ghost sm" href="#/blog">Ir al blog ${ic('arrow','sm')}</a>`)}
    <div class="grid c3">${DE.posts.filter(p=>p.isNew||['b3','b8'].includes(p.id)).slice(0,3).map(postCard).join('')}</div></div></section>`;
};
V.inicio.after = function(){
  const go = i => {
    const n = 3; S.ui.slide = (i+n)%n;
    $('#slides').style.transform = `translateX(-${S.ui.slide*100}%)`;
    $$('.s-dots button').forEach((b,k)=>b.classList.toggle('on', k===S.ui.slide));
  };
  window._slideGo = go; go(0);
  timers.push(setInterval(()=>{ if(!document.hidden && !$('#slider:hover')) go(S.ui.slide+1); }, 6000));
};

/* ---- PRODUCTOS ---- */
function filteredProducts(){
  let list = DE.products.filter(p => S.ui.tab==='todos' || p.cat===S.ui.tab);
  if(S.ui.avail !== 'all') list = list.filter(p => p.avail === S.ui.avail);
  if(S.ui.q) list = list.filter(p => (p.name+p.desc).toLowerCase().includes(S.ui.q.toLowerCase()));
  const s = S.ui.sort;
  if(s==='asc') list.sort((a,b)=>a.price-b.price);
  if(s==='desc') list.sort((a,b)=>b.price-a.price);
  if(s==='rate') list.sort((a,b)=>b.rating-a.rating);
  return list;
}
function productGrid(){
  const l = filteredProducts();
  return l.length ? l.map(pcard).join('') : `<div class="empty">${ic('search','lg')}<p>No hay productos con esos filtros.</p></div>`;
}
V.productos = function(){
  const T = S.ui.tab;
  return `<div class="wrap page-head"><div class="crumbs">Inicio / Productos</div><h1>Nuestros productos</h1><p>Postres, pasteles y porciones elaborados cada día con ingredientes frescos. ¿Quieres algo único? Diseña tu propia torta más abajo.</p></div>
  <section class="wrap" style="padding-bottom:3rem">
    <div class="toolbar">
      <div class="tabs" role="tablist">
        ${[['todos','Todos','sparkle'],['postres','Postres','cupcake'],['pasteles','Pasteles','cake'],['porciones','Porciones','slice']].map(t=>`<button class="tab ${T===t[0]?'on':''}" data-act="tab" data-tab="${t[0]}">${ic(t[2],'sm')} ${t[1]}</button>`).join('')}
      </div>
      <div class="tool-r">
        <select class="select" id="f-avail" aria-label="Disponibilidad"><option value="all">Toda la disponibilidad</option><option value="hoy" ${S.ui.avail==='hoy'?'selected':''}>Disponible hoy</option><option value="encargo" ${S.ui.avail==='encargo'?'selected':''}>Por encargo</option></select>
        <select class="select" id="f-sort" aria-label="Ordenar"><option value="rec">Recomendados</option><option value="asc" ${S.ui.sort==='asc'?'selected':''}>Precio: menor a mayor</option><option value="desc" ${S.ui.sort==='desc'?'selected':''}>Precio: mayor a menor</option><option value="rate" ${S.ui.sort==='rate'?'selected':''}>Mejor valorados</option></select>
        <a class="btn lilac sm" href="#/productos/personalizar">${ic('palette','sm')} Personalizados</a>
      </div>
    </div>
    <div class="pgrid" id="pgrid">${productGrid()}</div>
  </section>

  <section class="section tint" id="personalizar"><div class="wrap">
    ${sectionHead('Personalizados','Diseña tu torta soñada','Elige cada detalle y mira cómo queda en tiempo real.')}
    ${configHTML()}
  </div></section>

  <section class="section"><div class="wrap">${sectionHead('Promociones','Ahorra en tu próximo pedido','Haz clic en un código para aplicarlo a tu carrito.')}${promosHTML()}</div></section>
  <section class="section tint"><div class="wrap">${sectionHead('Campañas de temporada','Lo que viene este fin de año')}${campanasHTML()}</div></section>
  <section class="section"><div class="wrap">${sectionHead('Opiniones de clientes','Lo que dicen de nosotros')}${reviewsHTML()}</div></section>`;
};
V.productos.after = function(sub){
  updateCfg();
  if(sub === 'personalizar') setTimeout(()=> $('#personalizar').scrollIntoView({behavior:'smooth'}), 80);
};

/* ---- Configurador de tortas ---- */
function configHTML(){
  const c = DE.cfg, minD = iso(addDays(2));
  return `<div class="config" id="cfg-form">
    <div class="config-preview">
      <div id="cfg-art"></div>
      <div class="config-sum"><span class="muted" id="cfg-sum-txt"></span><div class="price" id="cfg-price"></div><small class="muted">IVA incluido</small></div>
    </div>
    <div>
      <div class="cfg-block"><div class="lbl"><span class="cfg-num">1</span> Tamaño</div><div class="opts">${c.sizes.map(s=>`<label class="opt"><input type="radio" name="size" value="${s.id}" ${CFG.size===s.id?'checked':''}><span>${s.label}</span></label>`).join('')}</div></div>
      <div class="cfg-block"><div class="lbl"><span class="cfg-num">2</span> Sabor del bizcocho</div><div class="opts">${c.flavors.map(f=>`<label class="opt"><input type="radio" name="flavor" value="${f.id}" ${CFG.flavor===f.id?'checked':''}><span><i class="swatch" style="background:${f.color}"></i>${f.label}${f.extra?` <small>+$${f.extra}</small>`:''}</span></label>`).join('')}</div></div>
      <div class="cfg-block"><div class="lbl"><span class="cfg-num">3</span> Ingredientes y rellenos <small class="muted">(2 incluidos, luego +$1.50)</small></div><div class="opts">${c.fillings.map(f=>`<label class="opt"><input type="checkbox" name="fillings" value="${f.id}" ${CFG.fillings.includes(f.id)?'checked':''}><span>${f.label}</span></label>`).join('')}</div></div>
      <div class="cfg-block"><div class="lbl"><span class="cfg-num">4</span> Diseño</div><div class="opts">${c.designs.map(f=>`<label class="opt"><input type="radio" name="design" value="${f.id}" ${CFG.design===f.id?'checked':''}><span>${f.label}${f.extra?` <small>+$${f.extra}</small>`:''}</span></label>`).join('')}</div></div>
      <div class="cfg-block"><div class="lbl"><span class="cfg-num">5</span> Color del glaseado</div><div class="opts">${c.colors.map(f=>`<label class="opt"><input type="radio" name="color" value="${f.id}" ${CFG.color===f.id?'checked':''}><span><i class="swatch" style="background:${f.hex}"></i>${f.label}</span></label>`).join('')}</div></div>
      <div class="form-grid">
        <div class="field"><label for="cfg-msg">Mensaje en la torta <small class="muted">(+$2)</small></label><input id="cfg-msg" maxlength="20" placeholder="Ej.: Feliz cumple Sofi" value="${esc(CFG.msg)}"></div>
        <div class="field"><label for="cfg-date">Fecha de entrega</label><input type="date" id="cfg-date" min="${minD}" value="${CFG.date}"></div>
      </div>
      <div id="cfg-avail"></div>
      <button class="btn lg block" style="margin-top:1.2rem" data-act="cfg-add">${ic('cart')} Agregar torta al carrito</button>
    </div></div>`;
}
function cfgPrice(){
  const c = DE.cfg;
  const size = c.sizes.find(s=>s.id===CFG.size), fl = c.flavors.find(f=>f.id===CFG.flavor), de = c.designs.find(d=>d.id===CFG.design);
  const extraFill = Math.max(0, CFG.fillings.length - c.freeFillings) * c.fillingPrice;
  return size.price + fl.extra + extraFill + de.extra + (CFG.msg.trim() ? c.msgPrice : 0);
}
function availFor(ds){
  if(!ds) return {state:'warn', msg:'Elige una fecha para verificar disponibilidad.'};
  const [y,m,d] = ds.split('-').map(Number), dt = new Date(y,m-1,d);
  if(dt < addDays(2) && iso(dt) !== iso(addDays(2))) return {state:'no', msg:'Las tortas personalizadas requieren al menos 48 horas de anticipación.'};
  if(d % 7 === 0) return {state:'no', msg:'Ese día ya completamos nuestros cupos de tortas personalizadas. Prueba con el día anterior o posterior.'};
  if(dt.getDay() === 0) return {state:'warn', msg:'Los domingos entregamos solo por retiro en local, hasta las 14:00.'};
  if((m===12 && [24,25,31].includes(d))) return {state:'warn', msg:'Fecha de alta demanda: quedan pocos cupos. ¡Reserva ya!'};
  return {state:'ok', msg:`¡Disponible! Quedan ${2 + (d%4)} cupos para ${fmtDate(ds)}.`};
}
function cfgSummary(){
  const c = DE.cfg;
  const f = c.fillings.filter(x=>CFG.fillings.includes(x.id)).map(x=>x.label).join(', ') || 'sin relleno';
  return `${c.sizes.find(s=>s.id===CFG.size).label.split(' · ')[1]} · ${c.flavors.find(x=>x.id===CFG.flavor).label} · ${f} · ${c.designs.find(x=>x.id===CFG.design).label}`;
}
function updateCfg(){
  if(!$('#cfg-art')) return;
  $('#cfg-art').innerHTML = DE.customArt(CFG);
  $('#cfg-price').textContent = money(cfgPrice());
  $('#cfg-sum-txt').textContent = cfgSummary();
  const a = availFor(CFG.date);
  $('#cfg-avail').innerHTML = `<div class="avail-box ${a.state}">${ic(a.state==='ok'?'check':'info')}<span>${a.msg}</span></div>`;
}
function readCfg(e){
  const t = e.target;
  if(t.name === 'fillings'){ CFG.fillings = $$('input[name=fillings]:checked').map(i=>i.value); }
  else if(['size','flavor','design','color'].includes(t.name)) CFG[t.name] = t.value;
  else if(t.id === 'cfg-msg') CFG.msg = t.value;
  else if(t.id === 'cfg-date') CFG.date = t.value;
  updateCfg();
}
function addCustom(){
  const a = availFor(CFG.date);
  if(!CFG.date) return toast('Elige la fecha de entrega primero', 'warn');
  if(a.state === 'no') return toast('Esa fecha no está disponible', 'warn');
  const note = cfgSummary() + (CFG.msg.trim() ? ` · «${CFG.msg.trim()}»` : '') + ` · Para el ${fmtDate(CFG.date)}`;
  addToCart({key:'custom-'+Date.now(), id:'custom', custom:true, name:'Torta personalizada', price:cfgPrice(), note, artSvg:DE.customArt(CFG), bg:'#fff0f3', date:CFG.date});
  if(!C.date) C.date = CFG.date;
  openDrawer();
}

/* ---- PEDIDOS (checkout) ---- */
const STEPS = ['Carrito','Datos del pedido','Forma de entrega','Método de pago','Confirmación'];
function stepsBar(){
  return `<div class="steps">${STEPS.map((s,i)=>{
    const n = i+1, cls = S.ui.step===n ? 'active' : S.ui.step>n ? 'done' : '';
    return `<div class="step ${cls}"><b>${S.ui.step>n ? ic('check') : n}</b>${s}</div>`;
  }).join('')}</div>`;
}
function summaryHTML(){
  const t = totals();
  return `<aside class="summary" id="summary"><h3>${ic('bag')} Resumen</h3>
    <div class="sum-items">${S.cart.map(i=>`<div class="sum-line"><span>${i.qty} × ${esc(i.name)}</span><span>${money(i.price*i.qty)}</span></div>`).join('') || '<p class="muted">Sin productos</p>'}</div>
    <div class="sum-line"><span>Subtotal</span><span>${money(t.sub)}</span></div>
    ${t.disc?`<div class="sum-line" style="color:var(--ok)"><span>Descuento ${S.promo}</span><span>- ${money(t.disc)}</span></div>`:''}
    <div class="sum-line"><span>Entrega</span><span>${C.delivery==='retiro' ? 'Retiro en local' : (t.fee?money(t.fee):'Gratis')}</span></div>
    <div class="sum-line total"><span>Total</span><span>${money(t.total)}</span></div>
    <div class="promo-row"><input id="promo-in" placeholder="Código promo" value="${S.promo||''}" aria-label="Código promocional"><button class="btn sm" data-act="promo-in">Aplicar</button></div>
    <p class="muted" style="font-size:.76rem;margin-top:.7rem">${ic('lock','sm')} Pago seguro · Tus datos están protegidos</p></aside>`;
}
function minDate(){
  if(hasCustomOrEncargo()) return iso(addDays(2));
  return new Date().getHours() >= 16 ? iso(addDays(1)) : iso(addDays(0));
}
function stepBody(){
  const f = (id,label,type='text',extra='',val) => `<div class="field" data-f="${id}"><label for="c-${id}">${label}</label><input id="c-${id}" data-c="${id}" type="${type}" value="${esc(val ?? C[id])}" ${extra}><span class="err"></span></div>`;
  switch(S.ui.step){
    case 1: return S.cart.length ? `<div class="panel"><h3>${ic('cart')} Productos y cantidades</h3>${S.cart.map(i=>cartLineHTML(i)).join('')}
        <div class="nav-btns"><a class="btn ghost" href="#/productos">${ic('arrow-left')} Seguir comprando</a><button class="btn" data-act="next">Continuar ${ic('arrow')}</button></div></div>`
      : `<div class="panel empty-cart">${DE.art({type:'cupcake',c:['#f6dca0','#ffc2cf','#e0708f','#c9b8e8']})}<h3>Aún no tienes productos</h3><p class="muted">Explora el catálogo y arma tu pedido.</p><a class="btn" href="#/productos" style="margin-top:1rem">Ver productos</a></div>`;
    case 2: {
      const slots = []; for(let h=9;h<=19;h++){ slots.push(`${String(h).padStart(2,'0')}:00`); if(h<19) slots.push(`${String(h).padStart(2,'0')}:30`); }
      return `<div class="panel"><h3>${ic('calendar')} Datos del pedido</h3>
        ${hasCustomOrEncargo() ? `<div class="avail-box warn" style="margin:0 0 1rem">${ic('info')}<span>Tu pedido incluye productos por encargo: la fecha mínima es ${fmtDate(minDate())}.</span></div>` : ''}
        <div class="form-grid">
          ${f('name','Nombre y apellido','text','autocomplete="name" placeholder="Ej.: Valeria Mendoza"')}
          ${f('phone','Teléfono / WhatsApp','tel','autocomplete="tel" placeholder="099 123 4567"')}
          ${f('email','Correo electrónico','email','autocomplete="email" placeholder="tucorreo@ejemplo.com"')}
          <div></div>
          ${f('date','Fecha de entrega','date',`min="${minDate()}"`)}
          <div class="field" data-f="time"><label for="c-time">Hora de entrega</label><select id="c-time" data-c="time"><option value="">Selecciona una hora</option>${slots.map(s=>`<option ${C.time===s?'selected':''}>${s}</option>`).join('')}</select><span class="err"></span></div>
          <div class="field full"><label for="c-notes">Notas o dedicatoria (opcional)</label><textarea id="c-notes" data-c="notes" rows="2" placeholder="Alergias, dedicatoria, indicaciones…">${esc(C.notes)}</textarea></div>
        </div>
        <div class="nav-btns"><button class="btn ghost" data-act="back">${ic('arrow-left')} Volver</button><button class="btn" data-act="next">Continuar ${ic('arrow')}</button></div></div>`; }
    case 3: return `<div class="panel"><h3>${ic('truck')} Forma de entrega</h3>
        <div class="rcards">
          <label class="rcard"><input type="radio" name="delivery" data-c="delivery" value="retiro" ${C.delivery==='retiro'?'checked':''}><div>${ic('store')}<strong>Retiro en local</strong><small>Gratis · listo en la hora que elijas</small></div></label>
          <label class="rcard"><input type="radio" name="delivery" data-c="delivery" value="delivery" ${C.delivery==='delivery'?'checked':''}><div>${ic('truck')}<strong>Delivery</strong><small>Desde $2.00 · gratis desde $40</small></div></label>
        </div>
        <div class="sub-panel" id="deliv-sub">${delivSub()}</div>
        <div class="nav-btns"><button class="btn ghost" data-act="back">${ic('arrow-left')} Volver</button><button class="btn" data-act="next">Continuar ${ic('arrow')}</button></div></div>`;
    case 4: return `<div class="panel"><h3>${ic('card')} Método de pago</h3>
        <label class="rcard" style="display:block;margin-bottom:1.4rem"><input type="radio" checked disabled><div style="flex-direction:row;align-items:center;gap:.8rem;border-color:var(--ink);background:var(--lilac-l)">${ic('card')}<div><strong>Pago con tarjeta</strong><br><small>Crédito o débito · Visa, Mastercard</small></div></div></label>
        <div class="credit-card"><div style="display:flex;justify-content:space-between;align-items:center"><div class="cc-chip"></div><strong style="font-style:italic;font-family:var(--serif)">Dulce Encanto</strong></div><div class="cc-num" id="cc-num">${esc(C.cnum) || '•••• •••• •••• ••••'}</div><div class="cc-row"><span id="cc-name">${esc(C.cname) || 'Nombre del titular'}</span><span id="cc-exp">${esc(C.cexp) || 'MM/AA'}</span></div></div>
        <div class="form-grid">
          <div class="field full" data-f="cnum"><label for="c-cnum">Número de tarjeta</label><input id="c-cnum" data-c="cnum" inputmode="numeric" maxlength="19" placeholder="4242 4242 4242 4242" autocomplete="cc-number" value="${esc(C.cnum)}"><span class="err"></span></div>
          <div class="field full" data-f="cname"><label for="c-cname">Nombre del titular</label><input id="c-cname" data-c="cname" placeholder="Como aparece en la tarjeta" autocomplete="cc-name" value="${esc(C.cname)}"><span class="err"></span></div>
          <div class="field" data-f="cexp"><label for="c-cexp">Vencimiento</label><input id="c-cexp" data-c="cexp" inputmode="numeric" maxlength="5" placeholder="MM/AA" autocomplete="cc-exp" value="${esc(C.cexp)}"><span class="err"></span></div>
          <div class="field" data-f="ccvv"><label for="c-ccvv">CVV</label><input id="c-ccvv" data-c="ccvv" inputmode="numeric" maxlength="4" placeholder="123" type="password" autocomplete="cc-csc" value="${esc(C.ccvv)}"><span class="err"></span></div>
        </div>
        <button class="btn ghost sm" style="margin-top:1rem" data-act="test-card">${ic('bolt','sm')} Usar tarjeta de prueba</button>
        <div class="secure-note">${ic('lock')}<span>Prototipo: no se realiza ningún cobro real ni se guarda información de tarjetas.</span></div>
        <div class="nav-btns"><button class="btn ghost" data-act="back">${ic('arrow-left')} Volver</button><button class="btn lg" data-act="pay">${ic('lock')} Pagar ${money(totals().total)}</button></div></div>`;
    case 5: return confirmHTML();
  }
}
function delivSub(){
  const f = (id,label,ph,type='text') => `<div class="field ${id==='address'?'full':''}" data-f="${id}"><label for="c-${id}">${label}</label><input id="c-${id}" data-c="${id}" type="${type}" placeholder="${ph}" value="${esc(C[id])}"><span class="err"></span></div>`;
  if(C.delivery === 'retiro') return `<div class="field"><label for="c-branch">Elige la sucursal</label><select id="c-branch" data-c="branch">${DE.branches.map(b=>`<option value="${b.id}" ${C.branch===b.id?'selected':''}>${b.name}</option>`).join('')}</select></div>
    ${(()=>{ const b = DE.branches.find(x=>x.id===C.branch); return `<p class="muted" style="margin-top:.8rem">${ic('pin','sm')} ${b.addr}<br>${ic('clock','sm')} ${b.hours}</p>`; })()}`;
  return `<div class="form-grid">${f('address','Dirección de entrega','Calle principal y secundaria, número')}
    <div class="field"><label for="c-zone">Zona</label><select id="c-zone" data-c="zone">${Object.entries(DE.zones).map(([k,z])=>`<option value="${k}" ${C.zone===k?'selected':''}>${z.label} · ${money(z.fee)}</option>`).join('')}</select></div>
    ${f('ref','Referencia','Cerca de…')}</div>`;
}
function confirmHTML(){
  const o = S.orders.find(x => x.id === S.ui.lastOrder);
  if(!o) return '';
  return `<div class="panel confirm"><div class="check-big">${ic('check')}</div><h2>¡Gracias, ${esc(o.info.name.split(' ')[0])}!</h2>
    <p class="muted">Tu pedido fue recibido. Enviamos la confirmación a ${esc(o.info.email)}.</p>
    <div class="order-no">${o.id}</div>
    <div class="send-row"><button class="btn lilac" data-act="send-email" data-id="${o.id}">${ic('mail')} Confirmación por correo</button><button class="btn mint" data-act="send-wa" data-id="${o.id}">${ic('whatsapp')} Confirmación por WhatsApp</button></div>
    <div class="recap">
      <div><span>Entrega</span><b>${fmtDate(o.info.date)}, ${o.info.time}</b></div>
      <div><span>Forma</span><b>${o.delivery.type==='retiro' ? 'Retiro · ' + DE.branches.find(b=>b.id===o.delivery.branch).name : 'Delivery · ' + esc(o.delivery.address)}</b></div>
      <div><span>Pago</span><b>Tarjeta •••• ${o.card}</b></div>
      <div><span>Total</span><b>${money(o.totals.total)}</b></div></div>
    <h3 style="margin-top:2rem">Estado del pedido</h3>${trackerHTML(o)}
    <div class="proto-bar">${ic('info','sm')} Prototipo: simula el avance del pedido <button class="btn sm sun" data-act="advance" data-id="${o.id}">Avanzar estado ${ic('arrow','sm')}</button></div>
    <div class="nav-btns" style="justify-content:center"><a class="btn ghost" href="#/productos">Seguir comprando</a><a class="btn" href="#/cuenta" data-act="goto-orders">Ver mis pedidos</a></div></div>`;
}
const trackSteps = o => o.delivery.type === 'delivery'
  ? [['Pedido recibido','check'],['En preparación','cake'],['Pedido listo','bag'],['Pedido en camino','truck'],['Entregado','gift']]
  : [['Pedido recibido','check'],['En preparación','cake'],['Pedido listo','bag'],['Entregado','gift']];
function trackerHTML(o){
  const st = trackSteps(o), pct = o.status / (st.length-1) * 84;
  return `<div class="track"><div class="fillbar" style="width:${pct}%"></div>${st.map((s,i)=>`<div class="t-step ${i<o.status?'done':i===o.status?'now':''}"><div class="tc">${ic(i<o.status?'check':s[1])}</div>${s[0]}</div>`).join('')}</div>`;
}
V.pedidos = function(){
  if(S.ui.view === 'confirm') S.ui.step = 5;
  return `<div class="wrap page-head"><div class="crumbs">Inicio / Pedidos</div><h1>Tu pedido</h1><p>Completa los pasos y recibe tu confirmación por correo o WhatsApp.</p></div>
  <section class="wrap" style="padding-bottom:3rem" id="checkout-root">${stepsBar()}
    <div class="${S.ui.step===5?'':'checkout'}" id="co-grid"><div id="co-main">${stepBody()}</div>${S.ui.step===5 ? '' : summaryHTML()}</div>
    <div class="panel" style="margin-top:2rem"><h3>${ic('search')} ¿Ya hiciste un pedido? Consulta su estado</h3>
      <form data-form="track" style="display:flex;gap:.7rem;flex-wrap:wrap"><div class="field" style="flex:1;min-width:220px"><input id="track-id" placeholder="Número de pedido, ej.: DE-10482" aria-label="Número de pedido"></div><button class="btn">Consultar</button></form></div></section>`;
};
function refreshCheckout(){
  if(!$('#checkout-root')) return;
  $('#checkout-root').innerHTML = `${stepsBar()}<div class="${S.ui.step===5?'':'checkout'}" id="co-grid"><div id="co-main">${stepBody()}</div>${S.ui.step===5 ? '' : summaryHTML()}</div>` + checkoutTail();
  updateCartUI();
}
function checkoutTail(){
  return `<div class="panel" style="margin-top:2rem"><h3>${ic('search')} ¿Ya hiciste un pedido? Consulta su estado</h3>
      <form data-form="track" style="display:flex;gap:.7rem;flex-wrap:wrap"><div class="field" style="flex:1;min-width:220px"><input id="track-id" placeholder="Número de pedido, ej.: DE-10482" aria-label="Número de pedido"></div><button class="btn">Consultar</button></form></div>`;
}
function refreshSummary(){ const s = $('#summary'); if(s) s.outerHTML = summaryHTML(); }
function setErr(id, msg){
  const w = $(`[data-f="${id}"]`); if(!w) return;
  w.classList.toggle('bad', !!msg); const e = $('.err', w); if(e) e.textContent = msg || '';
}
function validateStep(){
  const errs = {}; const s = S.ui.step;
  if(s === 2){
    if(C.name.trim().length < 3) errs.name = 'Escribe tu nombre completo';
    if(!/^[0-9+\s-]{9,15}$/.test(C.phone.trim())) errs.phone = 'Ingresa un teléfono válido (9–10 dígitos)';
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(C.email.trim())) errs.email = 'Ingresa un correo válido';
    if(!C.date) errs.date = 'Elige la fecha de entrega'; else if(C.date < minDate()) errs.date = `La fecha mínima es ${fmtDate(minDate())}`;
    if(!C.time) errs.time = 'Elige una hora';
  }
  if(s === 3 && C.delivery === 'delivery' && C.address.trim().length < 6) errs.address = 'Escribe la dirección completa';
  if(s === 4){
    const n = C.cnum.replace(/\s/g,'');
    const luhn = x => { let sum=0, alt=false; for(let i=x.length-1;i>=0;i--){ let d=+x[i]; if(alt){ d*=2; if(d>9) d-=9; } sum+=d; alt=!alt; } return sum%10===0; };
    if(!/^\d{16}$/.test(n) || !luhn(n)) errs.cnum = 'Número de tarjeta no válido';
    if(C.cname.trim().length < 3) errs.cname = 'Escribe el nombre del titular';
    const m = C.cexp.match(/^(\d{2})\/(\d{2})$/);
    if(!m || +m[1]<1 || +m[1]>12 || (2000+ +m[2])*12 + +m[1] < new Date().getFullYear()*12 + new Date().getMonth()+1) errs.cexp = 'Fecha inválida o vencida';
    if(!/^\d{3,4}$/.test(C.ccvv)) errs.ccvv = '3 o 4 dígitos';
  }
  ['name','phone','email','date','time','address','cnum','cname','cexp','ccvv'].forEach(k => setErr(k, errs[k]));
  const first = Object.keys(errs)[0];
  if(first){ const el = $('#c-'+first); if(el) el.focus(); toast('Revisa los campos marcados', 'warn'); }
  return !first;
}
function goStep(n){ S.ui.step = n; refreshCheckout(); window.scrollTo({top:0, behavior:'smooth'}); }
function placeOrder(){
  const t = totals();
  const o = { id:orderId(), at:new Date().toISOString(), status:0,
    items:S.cart.map(i=>({name:i.name, qty:i.qty, price:i.price, note:i.note||'', artSvg:i.artSvg||null, id:i.id, bg:i.bg, key:i.key})),
    totals:t, info:{name:C.name, phone:C.phone, email:C.email, date:C.date, time:C.time, notes:C.notes},
    delivery:{type:C.delivery, branch:C.branch, address:C.address, zone:C.zone, ref:C.ref}, card:C.cnum.replace(/\s/g,'').slice(-4) };
  S.orders.unshift(o); S.ui.lastOrder = o.id; S.ui.view = 'confirm';
  S.cart = []; S.promo = null; C.ccvv = ''; persist(); updateCartUI();
  S.ui.step = 5; refreshCheckout(); window.scrollTo({top:0, behavior:'smooth'});
  toast('¡Pedido confirmado! ' + o.id);
}
function showTracking(id){
  const o = S.orders.find(x => x.id === id.trim().toUpperCase());
  if(!o) return toast('No encontramos ese pedido. Prueba con el código que recibiste.', 'warn');
  openModal(`<h2>Pedido ${o.id}</h2><p class="muted">${fmtDate(o.info.date)}, ${o.info.time} · ${o.delivery.type==='retiro'?'Retiro en local':'Delivery'}</p>${trackerHTML(o)}
    <div class="proto-bar">${ic('info','sm')} Prototipo: <button class="btn sm sun" data-act="advance-modal" data-id="${o.id}">Avanzar estado ${ic('arrow','sm')}</button></div>`, true);
}
function advance(id){
  const o = S.orders.find(x=>x.id===id); if(!o) return;
  const n = trackSteps(o).length - 1;
  if(o.status >= n) return toast('El pedido ya fue entregado', 'warn');
  o.status++; persist();
  toast('Estado: <b>' + trackSteps(o)[o.status][0] + '</b>');
}
function sendConfirmation(kind, id){
  const o = S.orders.find(x=>x.id===id);
  const lines = o.items.map(i=>`${i.qty} × ${esc(i.name)}`).join('<br>');
  if(kind === 'email'){
    openModal(`<h2>Correo enviado ${ic('check')}</h2><p class="muted">Vista previa del correo para ${esc(o.info.email)}</p>
      <div class="card" style="background:#fff"><p><b>Asunto:</b> Tu pedido ${o.id} en Dulce Encanto</p><hr style="border:0;border-top:1.5px dashed var(--line);margin:.8rem 0">
      <p>Hola ${esc(o.info.name.split(' ')[0])}, ¡gracias por tu compra! 🎂</p><p>${lines}</p><p><b>Entrega:</b> ${fmtDate(o.info.date)}, ${o.info.time}<br><b>Total:</b> ${money(o.totals.total)}</p><p>Te avisaremos cuando esté listo.</p></div>`);
  } else {
    openModal(`<h2>WhatsApp enviado ${ic('check')}</h2><p class="muted">Vista previa del mensaje a ${esc(o.info.phone)}</p>
      <div style="background:#e8f0dc;border-radius:18px;padding:1rem"><div class="msg bot" style="max-width:100%;align-self:auto">✅ <b>Pedido ${o.id} confirmado</b><br>${lines}<br><br>📅 ${fmtDate(o.info.date)}, ${o.info.time}<br>💳 Total: ${money(o.totals.total)}<br><br>¡Gracias por elegir Dulce Encanto! 🧁</div></div>`);
  }
}

/* ---- BLOG ---- */
function postCard(p){
  const cat = DE.blogCats.find(c=>c.id===p.cat);
  return `<button class="post" data-act="post" data-id="${p.id}"><div class="post-art" style="background:${p.bg}"><span class="chip ${cat.color}">${cat.label}</span>${p.isNew?`<span class="chip mint" style="position:absolute;top:12px;right:12px;left:auto;border:1.5px solid var(--ink)">Nuevo</span>`:''}${DE.art(p.art)}</div>
    <div class="post-body"><div class="post-meta"><span>${ic('calendar','sm')} ${p.date}</span><span>${ic('clock','sm')} ${p.read}</span></div><h3>${p.title}</h3><p>${p.excerpt}</p><span class="chip rose" style="align-self:flex-start">Leer más ${ic('arrow','sm')}</span></div></button>`;
}
V.blog = function(){
  const cnt = id => DE.posts.filter(p=>p.cat===id).length;
  const list = DE.posts.filter(p => S.ui.blogCat==='todos' || p.cat===S.ui.blogCat);
  return `<div class="wrap page-head"><div class="crumbs">Inicio / Blog</div><h1>El blog de Dulce Encanto</h1><p>Recetas, trucos, tendencias y novedades del mundo de la repostería.</p></div>
  <section class="wrap" style="padding-bottom:3rem"><div class="blog-layout">
    <aside class="cat-list"><h4>Categorías</h4>
      <button class="cat-btn ${S.ui.blogCat==='todos'?'on':''}" data-act="blog-cat" data-cat="todos">Todas <small>${DE.posts.length}</small></button>
      ${DE.blogCats.map(c=>`<button class="cat-btn ${S.ui.blogCat===c.id?'on':''}" data-act="blog-cat" data-cat="${c.id}">${c.label} <small>${cnt(c.id)}</small></button>`).join('')}
      <div class="note-weekly">${ic('calendar')}<span><b>Actualización semanal</b> y contenido organizado por categorías.</span></div>
    </aside>
    <div><div class="posts">${list.map(postCard).join('') || '<p class="muted">Pronto habrá contenido en esta categoría.</p>'}</div>
      <div class="card" style="margin-top:2rem;background:var(--lilac-l)"><h3>${ic('mail')} Recibe las novedades cada semana</h3><p class="muted">Una receta, un consejo y promociones. Sin spam.</p>
        <form class="newsletter" data-form="news"><input type="email" required placeholder="tucorreo@ejemplo.com" aria-label="Correo"><button class="btn">Suscribirme</button></form></div></div>
  </div></section>`;
};
function openPost(id){
  const p = DE.posts.find(x=>x.id===id), cat = DE.blogCats.find(c=>c.id===p.cat);
  openModal(`<div class="article"><div class="hero-art" style="background:${p.bg}">${DE.art(p.art)}</div><span class="chip ${cat.color}">${cat.label}</span><h2>${p.title}</h2>
    <div class="meta"><span>${ic('calendar','sm')} ${p.date}</span><span>${ic('clock','sm')} ${p.read} de lectura</span></div>${p.body.join('')}
    <div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1.2rem"><a class="btn" href="#/productos" data-act="close-modal">Ver productos</a><button class="btn ghost" data-act="close-modal">Cerrar</button></div></div>`, true);
}

/* ---- CUENTA ---- */
V.cuenta = function(){
  if(!S.user) return authHTML();
  const u = S.user, mine = S.orders;
  const spent = mine.reduce((a,o)=>a+o.totals.total, 0);
  const tab = S.ui.profileTab;
  return `<div class="wrap page-head"><div class="crumbs">Inicio / Mi cuenta</div><h1>Mi cuenta</h1></div>
  <section class="wrap" style="padding-bottom:3rem"><div class="profile">
    <aside class="card pside"><div class="big-ava">${esc(u.name[0].toUpperCase())}</div><h3>${esc(u.name)}</h3><p class="muted" style="font-size:.85rem">${esc(u.email)}</p><span class="chip mint" style="margin-top:.6rem">${ic('sparkle','sm')} Cliente Encanto</span>
      <div class="pnav"><button class="${tab==='pedidos'?'on':''}" data-act="ptab" data-tab="pedidos">${ic('package')} Mis pedidos</button><button class="${tab==='datos'?'on':''}" data-act="ptab" data-tab="datos">${ic('user')} Mis datos</button><button data-act="logout">${ic('logout')} Cerrar sesión</button></div></aside>
    <div>${tab==='pedidos' ? `
      <div class="stats"><div class="stat" style="background:var(--rose-l)"><b>${mine.length}</b>pedidos</div><div class="stat" style="background:var(--lilac-l)"><b>${money(spent)}</b>en compras</div><div class="stat" style="background:var(--sun-l)"><b>${S.favs.length}</b>favoritos</div></div>
      <h3 style="margin-bottom:1rem">Historial de pedidos</h3>
      ${mine.length ? mine.map(orderCard).join('') : `<div class="card empty-cart">${DE.art({type:'slice',c:['#8b5a46','#b98368','#e0708f','#fff']})}<h3>Aún no tienes pedidos</h3><p class="muted">Cuando compres, verás aquí su estado.</p><a href="#/productos" class="btn" style="margin-top:1rem">Hacer mi primer pedido</a></div>`}
      ${S.favs.length?`<h3 style="margin:2rem 0 1rem">Tus favoritos</h3><div class="pgrid">${S.favs.map(id=>byId(id)).filter(Boolean).map(pcard).join('')}</div>`:''}`
    : `<div class="card"><h3 style="margin-bottom:1.2rem">${ic('edit')} Datos personales</h3>
      <form data-form="profile" class="form-grid">
        <div class="field"><label for="u-name">Nombre completo</label><input id="u-name" value="${esc(u.name)}" required></div>
        <div class="field"><label for="u-email">Correo</label><input id="u-email" type="email" value="${esc(u.email)}" required></div>
        <div class="field"><label for="u-phone">Teléfono</label><input id="u-phone" value="${esc(u.phone||'')}"></div>
        <div class="field"><label for="u-addr">Dirección de entrega</label><input id="u-addr" value="${esc(u.address||'')}"></div>
        <label class="full" style="display:flex;gap:.6rem;align-items:center"><input type="checkbox" id="u-news" ${u.news?'checked':''}> Quiero recibir novedades del blog y promociones</label>
        <div class="full" style="display:flex;gap:.7rem;flex-wrap:wrap"><button class="btn">Guardar cambios</button><button type="button" class="btn ghost" data-legal="datos">${ic('shield','sm')} Protección de datos</button><button type="button" class="btn ghost" data-act="delete-account">Eliminar mi cuenta</button></div>
      </form></div>`}</div>
  </div></section>`;
};
function orderCard(o){
  const st = trackSteps(o), cur = st[o.status][0];
  return `<div class="order-card"><header><div><b>${o.id}</b> <span class="muted" style="font-size:.82rem">· ${new Date(o.at).toLocaleDateString('es-EC',{day:'numeric',month:'short',year:'numeric'})}</span></div><span class="status s${Math.min(o.status,3)}">${cur}</span></header>
    <div class="items">${o.items.map(i=>`${i.qty} × ${esc(i.name)}`).join(' · ')}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.6rem"><b>${money(o.totals.total)}</b><div style="display:flex;gap:.5rem;flex-wrap:wrap"><button class="btn ghost sm" data-act="track" data-id="${o.id}">${ic('truck','sm')} Ver seguimiento</button><button class="btn sm" data-act="repeat" data-id="${o.id}">Repetir pedido</button></div></div></div>`;
}
function authHTML(){
  const reg = S.ui.authTab === 'reg';
  return `<div class="wrap page-head" style="text-align:center"><div class="crumbs">Inicio / Mi cuenta</div><h1>${reg?'Crea tu cuenta':'Bienvenido de vuelta'}</h1><p style="margin-inline:auto">Guarda tus pedidos, direcciones y favoritos.</p></div>
  <section class="wrap" style="padding-bottom:3rem"><div class="auth">
    <div class="auth-side">${DE.art({type:'cupcake',c:['#f6dca0','#ffc2cf','#e0708f','#c9b8e8']})}<ul><li>${ic('check')} Repite tus pedidos con un clic</li><li>${ic('check')} Sigue el estado de tu entrega</li><li>${ic('check')} Guarda favoritos y direcciones</li><li>${ic('check')} Promociones exclusivas</li></ul></div>
    <div class="auth-form"><div class="seg"><button class="${!reg?'on':''}" data-act="auth-tab" data-tab="login">Iniciar sesión</button><button class="${reg?'on':''}" data-act="auth-tab" data-tab="reg">Registrarse</button></div>
    ${reg ? `<form data-form="register" class="stack" novalidate>
        <div class="field" data-f="rname"><label for="r-name">Nombre completo</label><input id="r-name" autocomplete="name"><span class="err"></span></div>
        <div class="field" data-f="remail"><label for="r-email">Correo</label><input id="r-email" type="email" autocomplete="email"><span class="err"></span></div>
        <div class="field" data-f="rphone"><label for="r-phone">Teléfono</label><input id="r-phone" type="tel" autocomplete="tel"><span class="err"></span></div>
        <div class="field" data-f="rpass"><label for="r-pass">Contraseña</label><input id="r-pass" type="password" autocomplete="new-password" placeholder="Mínimo 6 caracteres"><span class="err"></span></div>
        <div data-f="rterms"><label style="display:flex;gap:.6rem;font-size:.85rem"><input type="checkbox" id="r-terms"><span>Acepto los <button type="button" class="linklike inline" data-legal="terminos">términos</button> y el tratamiento de mis datos según la <button type="button" class="linklike inline" data-legal="datos">política de protección de datos</button>.</span></label><span class="err"></span></div>
        <button class="btn lg block">Crear cuenta</button></form>`
    : `<form data-form="login" class="stack" novalidate>
        <div class="field" data-f="lemail"><label for="l-email">Correo</label><input id="l-email" type="email" autocomplete="email"><span class="err"></span></div>
        <div class="field" data-f="lpass"><label for="l-pass">Contraseña</label><input id="l-pass" type="password" autocomplete="current-password"><span class="err"></span></div>
        <button class="btn lg block">Iniciar sesión</button>
        <button type="button" class="btn ghost block" data-act="demo-login">${ic('bolt')} Entrar con cuenta de demostración</button></form>`}
    </div></div></section>`;
}
function seedDemo(){
  const mk = (id, status, type, days, items, total) => ({id, at:new Date(Date.now()-days*864e5).toISOString(), status,
    items, totals:{sub:total, disc:0, fee:0, total}, info:{name:'Valeria Mendoza', phone:'0991234567', email:'valeria@correo.com', date:iso(addDays(-days+1)), time:'15:00', notes:''},
    delivery:{type, branch:'urdesa', address:'Urdesa Central, Ebanos 123', zone:'norte', ref:''}, card:'4242'});
  return [
    mk('DE-20431', 3, 'retiro', 21, [{name:'Torta Triple Chocolate', qty:1, price:28, id:'p1'}, {name:'Macarons Pastel (x6)', qty:1, price:8.5, id:'p7'}], 36.5),
    mk('DE-20877', 3, 'delivery', 9, [{name:'Cupcakes de Vainilla (x6)', qty:2, price:9.5, id:'p6'}], 19),
    mk('DE-21093', 2, 'delivery', 1, [{name:'Red Velvet Clásica', qty:1, price:32, id:'p2'}, {name:'Porción Cheesecake de Mora', qty:2, price:4, id:'p14'}], 40)];
}

/* ---- CONTACTO ---- */
V.contacto = function(){
  const br = DE.branches.find(b=>b.id===S.ui.branch);
  return `<div class="wrap page-head"><div class="crumbs">Inicio / Contacto</div><h1>Hablemos</h1><p>¿Dudas sobre una receta, un pedido o una sugerencia? Escríbenos, nos encanta escucharte.</p></div>
  <section class="wrap" style="padding-bottom:3rem"><div class="contact-grid">
    <div>
      <div class="chip sky" style="margin-bottom:.8rem">${ic('pin','sm')} Ubicaciones</div>
      <div class="map" id="map"><svg viewBox="0 0 400 210" preserveAspectRatio="none"><rect width="400" height="210" fill="#e9f1dd"/><path d="M0 150 C80 120 140 170 230 130 S360 90 400 110 V210 H0z" fill="#cfe2f3"/><path d="M-10 60 L410 90 M120 -10 L160 220 M290 -10 L250 220 M-10 130 L410 40" stroke="#fff" stroke-width="9" fill="none"/><path d="M-10 60 L410 90 M120 -10 L160 220 M290 -10 L250 220 M-10 130 L410 40" stroke="#e2d6c4" stroke-width="1.5" fill="none" stroke-dasharray="6 6"/></svg>
        ${DE.branches.map(b=>`<div class="pin ${b.id===S.ui.branch?'on':''}" data-pin="${b.id}" style="left:${b.x}%;top:${b.y}%">${ic('pin')}</div>`).join('')}</div>
      <div id="branches">${DE.branches.map(b=>`<button class="branch ${b.id===S.ui.branch?'on':''}" data-act="branch" data-id="${b.id}"><div class="bi">${ic('store')}</div><div><b>${b.name}</b><small>${b.addr}</small><small>${b.hours}</small></div></button>`).join('')}</div>
      <div class="card" style="margin-top:1.2rem"><h3 style="margin-bottom:.4rem">Información de contacto</h3>
        <div class="info-row"><div class="ii">${ic('phone')}</div><div><b>Teléfonos</b><br><span class="muted">099 123 4567 · ${br.phone}</span></div></div>
        <div class="info-row"><div class="ii">${ic('mail')}</div><div><b>Correo</b><br><span class="muted">hola@dulceencanto.ec</span></div></div>
        <div class="info-row"><div class="ii">${ic('whatsapp')}</div><div><b>WhatsApp</b><br><span class="muted">099 123 4567 · respuesta en minutos</span></div></div></div>
    </div>
    <div>
      <div class="card"><h3 style="margin-bottom:1rem">${ic('send')} Formulario de contacto</h3>
        <form data-form="contact" class="stack" novalidate>
          <div class="lbl" style="font-weight:600;font-size:.88rem">¿Sobre qué nos escribes?</div>
          <div class="motivos" role="radiogroup">
            <label><input type="radio" name="motivo" value="Consulta de recetas" checked><span>${ic('book')}Consultas de recetas</span></label>
            <label><input type="radio" name="motivo" value="Queja de delivery"><span>${ic('truck')}Quejas de delivery</span></label>
            <label><input type="radio" name="motivo" value="Sugerencia"><span>${ic('sparkle')}Sugerencias</span></label></div>
          <div class="form-grid"><div class="field" data-f="kname"><label for="k-name">Nombre</label><input id="k-name"><span class="err"></span></div><div class="field" data-f="kemail"><label for="k-email">Correo</label><input id="k-email" type="email"><span class="err"></span></div></div>
          <div class="field" data-f="kmsg"><label for="k-msg">Mensaje</label><textarea id="k-msg" rows="5" placeholder="Cuéntanos…"></textarea><span class="err"></span></div>
          <label style="display:flex;gap:.6rem;font-size:.82rem;align-items:flex-start"><input type="checkbox" id="k-terms" checked> <span>Acepto el tratamiento de mis datos según la <button type="button" class="linklike inline" data-legal="datos">política de protección de datos</button>.</span></label>
          <button class="btn lg">Enviar mensaje ${ic('send')}</button></form></div>
      <div class="card" style="margin-top:1.2rem"><h3 style="margin-bottom:1rem">Síguenos en redes</h3><div class="social-big"><a href="#/contacto" data-act="social" data-n="Facebook">${ic('facebook')} Facebook</a><a href="#/contacto" data-act="social" data-n="Instagram">${ic('instagram')} Instagram</a><a href="#/contacto" data-act="social" data-n="WhatsApp">${ic('whatsapp')} WhatsApp</a></div></div>
    </div></div></section>`;
};

/* ============================================================
   ROUTER
   ============================================================ */
function route(){
  const h = (location.hash || '#/inicio').replace(/^#\/?/, '').split('/');
  const page = V[h[0]] ? h[0] : 'inicio', sub = h[1] || '';
  timers.forEach(clearInterval); timers = [];
  closeDrawer(); $('#searchbar').hidden = true; $('#main-nav').classList.remove('open');
  if(page === 'productos' && ['pasteles','postres','porciones'].includes(sub)) S.ui.tab = sub;
  else if(page === 'productos' && !sub) S.ui.tab = 'todos';
  if(S.ui.view === 'confirm' && (page !== 'pedidos' || S.cart.length)){ S.ui.view = 'checkout'; S.ui.step = 1; }
  if(page === 'pedidos' && S.ui.view !== 'confirm') S.ui.step = Math.min(S.ui.step, 4);
  const view = $('#view');
  view.innerHTML = `<div class="view-in">${V[page](sub)}</div>`;
  $$('.main-nav a').forEach(a => a.classList.toggle('active', a.dataset.route === page));
  if(V[page].after) V[page].after(sub);
  document.title = ({inicio:'Dulce Encanto · Pastelería artesanal en Guayaquil', productos:'Productos · Dulce Encanto', pedidos:'Tu pedido · Dulce Encanto', blog:'Blog · Dulce Encanto', cuenta:'Mi cuenta · Dulce Encanto', contacto:'Contacto · Dulce Encanto'})[page];
  if(sub !== 'personalizar') window.scrollTo({top:0});
  updateCartUI();
}
window.addEventListener('hashchange', route);

/* ============================================================
   EVENTOS
   ============================================================ */
const A = {
  add: t => { const p = byId(t.dataset.id); addToCart({key:p.id, id:p.id, name:p.name, price:p.price}); },
  'add-detail': t => { const p = byId(t.dataset.id); addToCart({key:p.id, id:p.id, name:p.name, price:p.price}, S.ui.qty); closeModal(); },
  dqty: t => { S.ui.qty = Math.max(1, Math.min(20, S.ui.qty + +t.dataset.d)); $('#dqty').textContent = S.ui.qty; },
  detail: t => { $('#searchbar').hidden = true; openDetail(t.dataset.id); },
  fav: (t,e) => { e.stopPropagation(); const id = t.dataset.id; const i = S.favs.indexOf(id); if(i>-1){ S.favs.splice(i,1); toast('Quitado de favoritos'); } else { S.favs.push(id); toast('¡Agregado a favoritos!'); } persist(); t.classList.toggle('on'); },
  qty: t => { const it = S.cart.find(i=>i.key===t.dataset.key); if(!it) return; it.qty += +t.dataset.d; if(it.qty<=0) S.cart = S.cart.filter(i=>i!==it); persist(); updateCartUI(); renderDrawer(); refreshCheckout(); },
  rm: t => { S.cart = S.cart.filter(i=>i.key!==t.dataset.key); persist(); updateCartUI(); renderDrawer(); refreshCheckout(); toast('Producto eliminado'); },
  'cart-close': () => closeDrawer(),
  'checkout-go': () => { closeDrawer(); S.ui.view = 'checkout'; S.ui.step = 1; if(location.hash === '#/pedidos') refreshCheckout(); },
  tab: t => { S.ui.tab = t.dataset.tab; $$('.tab').forEach(b=>b.classList.toggle('on', b===t)); $('#pgrid').innerHTML = productGrid(); },
  slide: t => window._slideGo(+t.dataset.i),
  'slide-prev': () => window._slideGo(S.ui.slide-1),
  'slide-next': () => window._slideGo(S.ui.slide+1),
  'promo-apply': t => applyPromo(t.dataset.code),
  'promo-in': () => applyPromo($('#promo-in').value),
  next: () => { if(S.ui.step === 1 && !S.cart.length) return; if(S.ui.step>1 && !validateStep()) return; goStep(S.ui.step+1); },
  back: () => goStep(S.ui.step-1),
  'test-card': () => { C.cnum='4242 4242 4242 4242'; C.cname = C.cname || C.name || 'VALERIA MENDOZA'; C.cexp='12/29'; C.ccvv='123'; refreshCheckout(); toast('Tarjeta de prueba cargada'); },
  pay: () => { if(!validateStep()) return; const b = $('[data-act=pay]'); b.disabled = true; b.innerHTML = 'Procesando pago…'; setTimeout(placeOrder, 1100); },
  'send-email': t => sendConfirmation('email', t.dataset.id),
  'send-wa': t => sendConfirmation('wa', t.dataset.id),
  advance: t => { advance(t.dataset.id); refreshCheckout(); },
  'advance-modal': t => { advance(t.dataset.id); showTracking(t.dataset.id); if(location.hash==='#/cuenta') route(); },
  track: t => showTracking(t.dataset.id),
  'goto-orders': () => { S.ui.profileTab = 'pedidos'; S.ui.view = 'checkout'; S.ui.step = 1; },
  'cfg-add': () => addCustom(),
  post: t => openPost(t.dataset.id),
  'blog-cat': t => { S.ui.blogCat = t.dataset.cat; route(); },
  'close-modal': () => closeModal(),
  acc: t => { const a = t.closest('.acc'); a.classList.toggle('open'); },
  'save-cookies': () => { S.cookies = {analytics:$('#ck-an').checked, marketing:$('#ck-mk').checked}; store.set('cookies', S.cookies); $('#cookies').hidden = true; closeModal(); toast('Preferencias guardadas'); },
  'auth-tab': t => { S.ui.authTab = t.dataset.tab; route(); },
  'demo-login': () => { S.user = {name:'Valeria Mendoza', email:'valeria@correo.com', phone:'0991234567', address:'Urdesa Central, Ebanos 123, Guayaquil', news:true, demo:true}; seedDemo().forEach(o => { if(!S.orders.some(x=>x.id===o.id)) S.orders.push(o); }); fillFromUser(); persist(); toast('Sesión iniciada como Valeria'); route(); },
  logout: () => { S.user = null; persist(); toast('Sesión cerrada'); route(); },
  ptab: t => { S.ui.profileTab = t.dataset.tab; route(); },
  repeat: t => { const o = S.orders.find(x=>x.id===t.dataset.id); o.items.forEach(i => { if(i.id && byId(i.id)) addToCart({key:i.id, id:i.id, name:i.name, price:i.price}, i.qty); else if(i.artSvg) addToCart({key:'custom-'+Date.now(), id:'custom', custom:true, name:i.name, price:i.price, note:i.note, artSvg:i.artSvg, bg:i.bg}, i.qty); }); openDrawer(); },
  'delete-account': () => { if(confirm('¿Seguro que quieres eliminar tu cuenta y tus datos?')){ S.users = S.users.filter(u=>u.email!==S.user.email); S.user = null; S.orders = []; S.favs = []; persist(); toast('Cuenta eliminada'); route(); } },
  branch: t => { S.ui.branch = t.dataset.id; $$('.branch').forEach(b=>b.classList.toggle('on', b.dataset.id===S.ui.branch)); $$('.pin').forEach(p=>p.classList.toggle('on', p.dataset.pin===S.ui.branch)); },
  social: (t,e) => { e.preventDefault(); toast(`Abriría el perfil de <b>${t.dataset.n}</b> (prototipo)`); }
};
function fillFromUser(){ if(S.user){ C.name = C.name || S.user.name; C.email = C.email || S.user.email; C.phone = C.phone || S.user.phone || ''; C.address = C.address || S.user.address || ''; } }

document.addEventListener('click', e => {
  const leg = e.target.closest('[data-legal]'); if(leg){ openLegal(leg.dataset.legal); return; }
  const pin = e.target.closest('[data-pin]'); if(pin){ A.branch({dataset:{id:pin.dataset.pin}}); return; }
  const t = e.target.closest('[data-act]'); if(!t) return;
  const fn = A[t.dataset.act]; if(fn) fn(t, e);
});
document.addEventListener('input', e => {
  const t = e.target;
  if(t.closest('#cfg-form')) return readCfg(e);
  if(t.id === 'search-input') return doSearch(t.value);
  const k = t.dataset.c; if(!k) return;
  if(k === 'cnum'){ t.value = t.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim(); }
  if(k === 'cexp'){ let v = t.value.replace(/\D/g,'').slice(0,4); if(v.length>2) v = v.slice(0,2)+'/'+v.slice(2); t.value = v; }
  if(k === 'ccvv') t.value = t.value.replace(/\D/g,'').slice(0,4);
  C[k] = t.value;
  setErr(k, '');
  if(k==='cnum') $('#cc-num').textContent = C.cnum || '•••• •••• •••• ••••';
  if(k==='cname') $('#cc-name').textContent = C.cname.toUpperCase() || 'NOMBRE DEL TITULAR';
  if(k==='cexp') $('#cc-exp').textContent = C.cexp || 'MM/AA';
});
document.addEventListener('change', e => {
  const t = e.target;
  if(t.closest('#cfg-form')) return readCfg(e);
  if(t.id === 'f-sort'){ S.ui.sort = t.value; $('#pgrid').innerHTML = productGrid(); return; }
  if(t.id === 'f-avail'){ S.ui.avail = t.value; $('#pgrid').innerHTML = productGrid(); return; }
  const k = t.dataset.c; if(!k) return;
  C[k] = t.value;
  if(['delivery','branch','zone'].includes(k)){ $('#deliv-sub').innerHTML = delivSub(); refreshSummary(); }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form]'); if(!f) return; e.preventDefault();
  const kind = f.dataset.form;
  if(kind === 'track') return showTracking($('#track-id').value || '');
  if(kind === 'news'){ toast('¡Suscrito! Te escribiremos cada semana'); f.reset(); return; }
  if(kind === 'profile'){
    S.user = {...S.user, name:$('#u-name').value.trim(), email:$('#u-email').value.trim(), phone:$('#u-phone').value.trim(), address:$('#u-addr').value.trim(), news:$('#u-news').checked};
    S.users = S.users.map(u => u.email === S.user.email ? {...u, ...S.user} : u); persist(); toast('Datos actualizados'); return route();
  }
  if(kind === 'login'){
    const em = $('#l-email').value.trim().toLowerCase(), pw = $('#l-pass').value; let ok = true;
    setErr('lemail', ''); setErr('lpass', '');
    if(!/^\S+@\S+\.\S+$/.test(em)){ setErr('lemail','Correo no válido'); ok = false; }
    if(!pw){ setErr('lpass','Escribe tu contraseña'); ok = false; }
    if(!ok) return;
    const u = S.users.find(x => x.email === em && x.pass === pw);
    if(!u) return setErr('lpass', 'Correo o contraseña incorrectos. Prueba la cuenta de demostración.');
    S.user = {name:u.name, email:u.email, phone:u.phone, address:'', news:true}; fillFromUser(); persist(); toast('¡Hola de nuevo, ' + u.name.split(' ')[0] + '!'); return route();
  }
  if(kind === 'register'){
    const v = {n:$('#r-name').value.trim(), e:$('#r-email').value.trim().toLowerCase(), p:$('#r-phone').value.trim(), w:$('#r-pass').value}; let ok = true;
    const chk = (id, cond, msg) => { setErr(id, cond ? '' : msg); if(!cond) ok = false; };
    chk('rname', v.n.length>=3, 'Escribe tu nombre'); chk('remail', /^\S+@\S+\.\S+$/.test(v.e), 'Correo no válido');
    chk('rphone', /^[0-9+\s-]{9,15}$/.test(v.p), 'Teléfono no válido'); chk('rpass', v.w.length>=6, 'Mínimo 6 caracteres');
    chk('rterms', $('#r-terms').checked, 'Debes aceptar para continuar');
    if(!ok) return;
    if(S.users.some(u=>u.email===v.e)) return setErr('remail','Ese correo ya está registrado');
    S.users.push({name:v.n, email:v.e, phone:v.p, pass:v.w}); S.user = {name:v.n, email:v.e, phone:v.p, address:'', news:true};
    fillFromUser(); persist(); toast('¡Cuenta creada! Bienvenido/a, ' + v.n.split(' ')[0]); return route();
  }
  if(kind === 'contact'){
    const n = $('#k-name').value.trim(), em = $('#k-email').value.trim(), m = $('#k-msg').value.trim(); let ok = true;
    const chk = (id, cond, msg) => { setErr(id, cond ? '' : msg); if(!cond) ok = false; };
    chk('kname', n.length>=2, 'Escribe tu nombre'); chk('kemail', /^\S+@\S+\.\S+$/.test(em), 'Correo no válido'); chk('kmsg', m.length>=10, 'Cuéntanos un poco más (mín. 10 caracteres)');
    if(!$('#k-terms').checked){ toast('Debes aceptar la política de datos', 'warn'); ok = false; }
    if(!ok) return;
    const motivo = $('input[name=motivo]:checked').value;
    openModal(`<div class="confirm"><div class="check-big">${ic('check')}</div><h2>¡Mensaje enviado!</h2><p class="muted">Gracias, ${esc(n.split(' ')[0])}. Recibimos tu <b>${motivo.toLowerCase()}</b> y te responderemos a ${esc(em)} en menos de 24 horas.</p><button class="btn" style="margin-top:1rem" data-act="close-modal">Listo</button></div>`);
    f.reset(); return;
  }
});

/* Cabecera, buscador, chat y varios */
$('#btn-cart').addEventListener('click', openDrawer);
$('#drawer-close').addEventListener('click', closeDrawer);
$('#overlay').addEventListener('click', closeDrawer);
$('#modal-close').addEventListener('click', closeModal);
$('#modal').addEventListener('click', e => { if(e.target.id === 'modal') closeModal(); });
$('#btn-burger').addEventListener('click', () => $('#main-nav').classList.toggle('open'));
$('#btn-search').addEventListener('click', () => { const b = $('#searchbar'); b.hidden = !b.hidden; if(!b.hidden) $('#search-input').focus(); });
$('#search-close').addEventListener('click', () => { $('#searchbar').hidden = true; });
document.addEventListener('keydown', e => { if(e.key === 'Escape'){ closeModal(); closeDrawer(); $('#searchbar').hidden = true; $('#chat').hidden = true; } });
$('#cookie-accept').addEventListener('click', () => { S.cookies = {analytics:true, marketing:true}; store.set('cookies', S.cookies); $('#cookies').hidden = true; toast('Gracias, preferencias guardadas'); });
$('#cookie-reject').addEventListener('click', () => { S.cookies = {analytics:false, marketing:false}; store.set('cookies', S.cookies); $('#cookies').hidden = true; });

/* ---- Chat en línea ---- */
const BOT = [
  [/hora|abierto|atienden|horario/i, 'Atendemos de lunes a sábado de 9:00 a 19:00 y domingos de 10:00 a 14:00 (sucursal Centro). 🕘'],
  [/delivery|domicilio|entrega|envío|envio/i, 'Sí, hacemos delivery en Guayaquil y Samborondón desde $2.00. ¡Es gratis en compras desde $40! 🚚'],
  [/torta|pastel|personaliz|cumple|boda/i, 'Puedes diseñar tu torta en <a href="#/productos/personalizar" style="color:var(--rose-d);text-decoration:underline">el personalizador</a>. Necesitamos 48 horas de anticipación. 🎂'],
  [/pago|tarjeta|pagar|efectivo/i, 'Aceptamos tarjetas de crédito y débito en línea, y efectivo en nuestros locales. 💳 Tu pago es seguro (SSL).'],
  [/gluten|celiac|lactosa|vegan/i, 'Los macarons y brownies son sin gluten. Para otras adaptaciones, escríbenos con 72 horas de anticipación. 🌾'],
  [/promo|descuento|cupon|cupón|código|codigo/i, 'Prueba <b>DULCE10</b> (10 % en tu primera compra) o <b>ENVIOGRATIS</b> para delivery sin costo. 🎁'],
  [/pedido|estado|seguimiento/i, 'Puedes consultar el estado de tu pedido en la sección <a href="#/pedidos" style="color:var(--rose-d);text-decoration:underline">Pedidos</a> con tu número (ej. DE-10482).'],
  [/hola|buen[oa]s|hey|ola/i, '¡Hola! 👋 Soy el asistente de Dulce Encanto. ¿En qué te puedo ayudar?'],
  [/gracias|chao|adiós|adios/i, '¡Con gusto! Que tengas un día muy dulce. 🧁']
];
let chatInit = false;
function botSay(t, delay=700){
  const body = $('#chat-body');
  const typing = document.createElement('div'); typing.className = 'msg bot typing'; typing.innerHTML = '<i></i><i></i><i></i>'; body.appendChild(typing); body.scrollTop = body.scrollHeight;
  setTimeout(() => { typing.remove(); const m = document.createElement('div'); m.className = 'msg bot'; m.innerHTML = t; body.appendChild(m); body.scrollTop = body.scrollHeight; }, delay);
}
function userSay(t){
  const m = document.createElement('div'); m.className = 'msg me'; m.textContent = t; $('#chat-body').appendChild(m); $('#chat-body').scrollTop = 1e6;
  const r = BOT.find(b => b[0].test(t));
  botSay(r ? r[1] : 'Gracias por escribirnos. Una persona del equipo te responderá en unos minutos. ¿Quieres dejarnos tu número de WhatsApp? 📱');
}
$('#chat-fab').addEventListener('click', () => {
  const c = $('#chat'); c.hidden = !c.hidden;
  if(!c.hidden){ if(!chatInit){ chatInit = true; botSay('¡Hola! 👋 Bienvenido/a a Dulce Encanto. ¿Buscas una torta, porciones o información de un pedido?', 400); } $('#chat-input').focus(); }
});
$('#chat-close').addEventListener('click', () => { $('#chat').hidden = true; });
$('#chat-form').addEventListener('submit', e => { e.preventDefault(); const i = $('#chat-input'); const v = i.value.trim(); if(!v) return; i.value = ''; userSay(v); });
$('#chat-quick').addEventListener('click', e => { if(e.target.tagName === 'BUTTON') userSay(e.target.textContent); });

/* ---- Inicio ---- */
fillFromUser();
if(!S.cookies) setTimeout(() => { $('#cookies').hidden = false; }, 1200);
route();
})();
