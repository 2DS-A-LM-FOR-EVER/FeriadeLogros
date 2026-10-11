/* =========================================================
   MAPA DE JUEGOS · 4 LENGUAJES
   - url: archivo html del juego (null = "Próximamente")
   - El progreso x/5 y el XP se leen de localStorage:
     ca_<id>_v1_<usuario>  ->  { hechos:[bool x5] }
     (el mismo que guarda python.html)
   ========================================================= */
const GAMES = [
  { id:'python', name:'Python', cat:'Básico', lvl:1, art:'python', color:'#7cffb2', url:'python.html',
    desc:'Tu primer lenguaje: print, variables, if y for. Resuelve 4 ejercicios y la prueba final.' },
  { id:'html', name:'HTML', cat:'Web', lvl:1, art:'html', color:'#ffa94d', url:null,
    desc:'Construye el esqueleto de una página web con etiquetas. Muy pronto.' },
  { id:'css', name:'CSS', cat:'Web', lvl:2, art:'css', color:'#4fd8ff', url:null,
    desc:'Dale color, tamaños y estilo a tu página. Muy pronto.' },
  { id:'java', name:'Java', cat:'Reto', lvl:3, art:'java', color:'#ff4f9a', url:null,
    desc:'El reto final: clases y lógica fuerte. Muy pronto.' }
];
const XP_POR_HECHO = [50, 50, 50, 50, 100]; // 4 ejercicios + prueba final = 300 por lenguaje

/* ---------- Dibujos pixel 8x8 ---------- */
const SPRITES = {
  python:{pal:{G:'#7cffb2',W:'#050a24'},rows:[
    '..GGGG..','.G....G.','.G.WW.G.','.G....G.','.GGGGGG.','......G.','.GGGGGG.','.G......']},
  html:{pal:{C:'#ffa94d'},rows:[
    '..C..C..','.C....C.','C...C..C','C..C...C','.CC...C.','.CC..C..','........','........']},
  css:{pal:{C:'#4fd8ff'},rows:[
    '..C..C..','.C....C.','.C....C.','C......C','.C....C.','.C....C.','..C..C..','........']},
  java:{pal:{P:'#ff4f9a',D:'#6b3a10',W:'#ffffff'},rows:[
    '.W..W...','.W..W...','PPPPPP..','PDDDDPP.','PDDDDPP.','PPPPPP..','.PPPP...','........']}
};
function drawArt(cv, name){
  const s = SPRITES[name] || SPRITES.python, x = cv.getContext('2d');
  cv.width = cv.height = 8; x.clearRect(0,0,8,8);
  s.rows.forEach((row,y)=>[...row].forEach((ch,i)=>{
    if(ch==='.') return; x.fillStyle = s.pal[ch] || '#fff'; x.fillRect(i,y,1,1);
  }));
}

/* ---------- Sesión y datos de usuario ---------- */
const $ = id => document.getElementById(id);
const usuario = (localStorage.getItem('usuarioActual') || '').normalize('NFC').trim();
if(!usuario){ location.replace('registro.html'); throw new Error('Inicia sesión primero'); }
const UID = usuario.toLocaleLowerCase('es');

const PROFILE_KEY = 'ca_arcade_profile_v1_' + UID;
const STATS_KEY   = 'ca_juegos_v1_'         + UID;

const readJSON = (k, def) => { try { return { ...def, ...JSON.parse(localStorage.getItem(k) || '{}') }; } catch(e){ return { ...def }; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };

let profile = readJSON(PROFILE_KEY, { name:usuario, xp:0, char:0, gif:null });
let st = readJSON(STATS_KEY, { fav:[], played:{}, last:null });
let cat = 'Todos', onlyFav = false, query = '';

/* ---------- Progreso por lenguaje (desde localStorage) ---------- */
function progresoDe(id){
  try{
    const p = JSON.parse(localStorage.getItem('ca_' + id + '_v1_' + UID) || 'null');
    if(p && Array.isArray(p.hechos)) return p.hechos.map(Boolean);
  }catch(e){}
  return [false,false,false,false,false];
}
const hechosDe = id => progresoDe(id).filter(Boolean).length;
const xpDe     = id => progresoDe(id).reduce((s,h,i)=> s + (h ? XP_POR_HECHO[i] : 0), 0);

/* ---------- Toast ---------- */
let toastT;
function toast(m){
  const t = $('gxToast'); t.textContent = m; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove('show'), 2400);
}

/* ---------- Cabecera: avatar y datos ---------- */
function drawMiniAvatar(){
  const box = $('gxAv'); box.replaceChildren();
  if(profile.char === -1 && profile.gif){
    const im = document.createElement('img'); im.src = profile.gif; im.alt = ''; box.append(im);
  } else {
    const c = document.createElement('canvas'); c.width = c.height = 8;
    const x = c.getContext('2d');
    ['..KKKK..','.KSSSSK.','.KEKKEK.','.KSSSSK.','..KOOK..','.KOOOOK.','.KOKKOK.','..KK.KK.']
      .forEach((r,y)=>[...r].forEach((ch,i)=>{
        const col = {K:'#0b0f1a',S:'#f2c9a0',E:'#14121f',O:'#c0392b'}[ch];
        if(col){ x.fillStyle = col; x.fillRect(i,y,1,1); }
      }));
    box.append(c);
  }
}
function renderStats(){
  $('gxName').textContent = profile.name || usuario;
  const xpTotal = GAMES.reduce((s,g)=> s + xpDe(g.id), 0);
  $('stGames').textContent  = GAMES.length;
  $('stPlayed').textContent = GAMES.filter(g => hechosDe(g.id) > 0 || st.played[g.id]).length;
  $('stXp').textContent     = xpTotal;
  $('stLvl').textContent    = Math.floor(xpTotal / 100) + 1;
  const last = GAMES.find(g => g.id === st.last && g.url);
  const box = $('gxLast');
  box.hidden = !last;
  if(last){ drawArt($('gxLastArt'), last.art); $('gxLastName').textContent = last.name; box.onclick = e => { e.preventDefault(); launch(last); }; }
}

/* ---------- Tarjetas ---------- */
function cardOf(g){
  const hechos = hechosDe(g.id), completo = hechos === 5, fav = st.fav.includes(g.id);
  const d = document.createElement('article');
  d.className = 'gx-card' + (g.url ? '' : ' locked') + (completo ? ' done' : '');
  d.style.setProperty('--c', g.color);
  d.innerHTML = `
    <div class="gx-art">
      <span class="gx-lvl">LV ${g.lvl}</span>
      <button class="gx-fav" type="button" aria-pressed="${fav}" aria-label="Marcar favorito">${fav ? '★' : '☆'}</button>
      <canvas></canvas>
    </div>
    <div class="gx-body">
      <span class="gx-cat">${g.cat}</span>
      <h2 class="gx-name">${g.name}</h2>
      <p class="gx-desc">${g.desc}</p>
      <div class="gx-meta"><span>${hechos}/5</span><span class="gx-bar"><i style="width:${hechos/5*100}%"></i></span></div>
      <button class="gx-play" type="button">${g.url ? (completo ? '↺ REPETIR' : '▶ JUGAR') : '🔒 PRÓXIMAMENTE'}</button>
    </div>`;
  drawArt(d.querySelector('canvas'), g.art);

  d.querySelector('.gx-play').onclick = () => launch(g);
  d.querySelector('.gx-fav').onclick = e => {
    const b = e.currentTarget;
    st.fav = st.fav.includes(g.id) ? st.fav.filter(x => x !== g.id) : [...st.fav, g.id];
    save(STATS_KEY, st);
    b.setAttribute('aria-pressed', st.fav.includes(g.id));
    b.textContent = st.fav.includes(g.id) ? '★' : '☆';
    if(onlyFav) renderGrid();
  };
  // inclinación 3D suave
  d.addEventListener('mousemove', e => {
    const r = d.getBoundingClientRect();
    d.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 8 + 'deg');
    d.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 8 + 'deg');
  });
  d.addEventListener('mouseleave', () => { d.style.setProperty('--rx','0deg'); d.style.setProperty('--ry','0deg'); });
  return d;
}

const io = new IntersectionObserver(es => es.forEach(e => {
  if(e.isIntersecting){ e.target.style.transitionDelay = (e.target.dataset.i * 70) + 'ms'; e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold:.1 });

function renderGrid(){
  const q = query.trim().toLowerCase();
  const list = GAMES.filter(g =>
    (cat === 'Todos' || g.cat === cat) &&
    (!onlyFav || st.fav.includes(g.id)) &&
    (!q || (g.name + ' ' + g.cat + ' ' + g.desc).toLowerCase().includes(q)));
  $('gxGrid').replaceChildren(...list.map((g,i) => { const c = cardOf(g); c.dataset.i = i; io.observe(c); return c; }));
  $('gxEmpty').hidden = list.length > 0;
}
function renderChips(){
  const cats = ['Todos', ...new Set(GAMES.map(g => g.cat))];
  $('gxChips').replaceChildren(...cats.map(c => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'gx-chip'; b.textContent = c; b.setAttribute('aria-pressed', c === cat);
    b.onclick = () => { cat = c; renderChips(); renderGrid(); };
    return b;
  }));
}

/* ---------- Entrar a un juego (el XP lo dan los ejercicios, no la entrada) ---------- */
function launch(g){
  if(!g.url){ toast('🔒 ' + g.name + ' aún no está disponible'); return; }
  st.played[g.id] = (st.played[g.id] || 0) + 1;
  st.last = g.id; save(STATS_KEY, st);
  $('gxLoadT').textContent = 'Cargando ' + g.name + '…';
  $('gxLoad').classList.add('on');
  setTimeout(() => { location.href = g.url; }, 900);
}

/* ---------- Eventos ---------- */
$('gxQ').addEventListener('input', e => { query = e.target.value; renderGrid(); });
$('gxFavOnly').onclick = e => {
  onlyFav = !onlyFav; e.currentTarget.setAttribute('aria-pressed', onlyFav); renderGrid();
};
document.addEventListener('keydown', e => {
  if(e.key === '/' && document.activeElement !== $('gxQ')){ e.preventDefault(); $('gxQ').focus(); }
  if(e.key === 'Escape') $('gxQ').blur();
});
$('gxTheme').onclick = () => {
  const light = document.documentElement.getAttribute('data-theme') === 'light';
  if(light) document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme','light');
  try { localStorage.setItem('tema', light ? 'dark' : 'light'); } catch(e){}
};
$('gxLogout').onclick = () => { localStorage.removeItem('usuarioActual'); location.href = 'registro.html'; };
window.addEventListener('pageshow', () => $('gxLoad').classList.remove('on')); // al volver con "atrás"

/* ---------- Cursor de espada (bloque estándar) ---------- */
(function(){
  const s = document.getElementById('espada-cursor');
  if(!s){ console.warn('⚠️ No se encontró #espada-cursor'); return; }
  const raise = () => { try{s.hidePopover()}catch(e){} try{s.showPopover()}catch(e){} };
  window.raiseSword = raise; raise();
  document.addEventListener('mousemove', e => {
    s.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    s.classList.add('on');
  });
  document.documentElement.addEventListener('mouseleave', () => s.classList.remove('on'));
})();

/* ---------- Cielo: estrellas en canvas + meteoritos ---------- */
(function sky(){
  const cv = $('gxSky'), x = cv.getContext('2d'); let w, h, stars = [];
  function size(){
    w = cv.width = innerWidth; h = cv.height = innerHeight;
    stars = Array.from({ length: Math.round(w * h / 9000) }, () => ({
      x: Math.random() * w, y: Math.random() * h, s: Math.random() * 2.2 + 1,
      p: Math.random() * 6.28, v: Math.random() * .03 + .01,
      c: ['#ffffff','#38bdf8','#fdc815'][Math.floor(Math.random() * 3)]
    }));
  }
  function frame(){
    x.clearRect(0, 0, w, h);
    stars.forEach(s => { s.p += s.v; x.globalAlpha = .25 + Math.abs(Math.sin(s.p)) * .75; x.fillStyle = s.c; x.fillRect(s.x, s.y, s.s, s.s); });
    x.globalAlpha = 1; requestAnimationFrame(frame);
  }
  addEventListener('resize', size); size(); frame();

  (function meteoro(){
    setTimeout(() => {
      const m = document.createElement('div'); m.className = 'gx-meteor';
      m.style.left = (Math.random() * innerWidth + 200) + 'px';
      m.style.top  = (Math.random() * innerHeight / 2) + 'px';
      document.body.appendChild(m); setTimeout(() => m.remove(), 1200); meteoro();
    }, Math.random() * 2500 + 1500);
  })();
})();

/* ---------- Inicio ---------- */
drawMiniAvatar(); renderStats(); renderChips(); renderGrid();