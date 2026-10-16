/* =========================================================
   MAPA DE JUEGOS - NIVELES / LENGUAJES
   - url: archivo html del juego (null = Proximamente)
   - principal:true -> se muestra como tarjeta destacada
   - El progreso x/5 y el XP se leen de localStorage:
     ca_<id>_v1_<usuario>  ->  { hechos:[bool x5] }
   ========================================================= */
const GAMES = [
  /* JUEGO PRINCIPAL */
  { id:'basico', name:'Aprendamos sobre Desarrollo de Software', short:'Desarrollo de Software',
    cat:'Basico', lvl:1, art:'basico', color:'#fdc815', url:'basico.html', principal:true,
    desc:'El punto de partida: que es el software, como se construye, ciclo de vida, roles y buenas practicas.' },

  { id:'html', name:'HTML', short:'HTML', cat:'Web', lvl:1, art:'html', color:'#ffa94d', url:'html.html',
    desc:'Construye el esqueleto de una pagina web con etiquetas: titulos, listas, enlaces e imagenes.' },

  { id:'css', name:'CSS', short:'CSS', cat:'Web', lvl:2, art:'css', color:'#4fd8ff', url:'css.html',
    desc:'Dale color, tamanos y estilo a tu pagina: selectores, modelo de caja y Flexbox.' },

  { id:'python', name:'Python', short:'Python', cat:'Basico', lvl:1, art:'python', color:'#7cffb2', url:'python.html',
    desc:'Tu primer lenguaje: print, variables, if y for. Resuelve 4 ejercicios y la prueba final.' },

  { id:'java', name:'JavaScript', short:'JS', cat:'Reto', lvl:3, art:'java', color:'#ff4f9a', url:'javascript.html',
    desc:'El reto final: clases, objetos y logica fuerte. Demuestra lo aprendido.' }
];
const XP_POR_HECHO = [50, 50, 50, 50, 100]; // 4 ejercicios + prueba final = 300 por lenguaje

/* ---------- Dibujos pixel 8x8 ---------- */
const SPRITES = {
  basico:{pal:{Y:'#fdc815',C:'#4fd8ff'},rows:[
    'YYYYYYYY','Y......Y','Y.CCCC.Y','Y.C..C.Y','Y.CCCC.Y','YYYYYYYY','...YY...','..YYYY..']},
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

/* ---------- Sesion y datos de usuario ---------- */
const $ = id => document.getElementById(id);
const usuario = (localStorage.getItem('usuarioActual') || '').normalize('NFC').trim();
if(!usuario){ location.replace('registro.html'); throw new Error('Inicia sesion primero'); }
const UID = usuario.toLocaleLowerCase('es');

const PROFILE_KEY = 'ca_arcade_profile_v1_' + UID;
const STATS_KEY   = 'ca_juegos_v1_'         + UID;

const readJSON = (k, def) => { try { return Object.assign({}, def, JSON.parse(localStorage.getItem(k) || '{}')); } catch(e){ return Object.assign({}, def); } };
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
  if(last){
    drawArt($('gxLastArt'), last.art);
    $('gxLastName').textContent = last.short || last.name;
    box.onclick = e => { e.preventDefault(); launch(last); };
  }
}

/* ---------- Tarjetas ---------- */
function cardOf(g){
  const hechos = hechosDe(g.id), completo = hechos === 5, fav = st.fav.includes(g.id);
  const d = document.createElement('article');
  d.className = 'gx-card'
    + (g.url ? '' : ' locked')
    + (completo ? ' done' : '')
    + (g.principal ? ' featured' : '');
  d.style.setProperty('--c', g.color);
  d.innerHTML = ''
    + '<div class="gx-art">'
    +   '<span class="gx-lvl">LV ' + g.lvl + '</span>'
    +   '<button class="gx-fav" type="button" aria-pressed="' + fav + '" aria-label="Marcar favorito">' + (fav ? '★' : '☆') + '</button>'
    +   '<canvas></canvas>'
    + '</div>'
    + '<div class="gx-body">'
    +   (g.principal ? '<span class="gx-badge">★ PRINCIPAL</span>' : '')
    +   '<span class="gx-cat">' + g.cat + '</span>'
    +   '<h2 class="gx-name">' + g.name + '</h2>'
    +   '<p class="gx-desc">' + g.desc + '</p>'
    +   '<div class="gx-meta"><span>' + hechos + '/5</span><span class="gx-bar"><i style="width:' + (hechos/5*100) + '%"></i></span></div>'
    +   '<button class="gx-play" type="button">' + (g.url ? (completo ? '↺ REPETIR' : '▶ JUGAR') : '🔒 PROXIMAMENTE') + '</button>'
    + '</div>';
  drawArt(d.querySelector('canvas'), g.art);

  d.querySelector('.gx-play').onclick = function(){ launch(g); };
  d.querySelector('.gx-fav').onclick = function(e){
    const b = e.currentTarget;
    st.fav = st.fav.includes(g.id) ? st.fav.filter(x => x !== g.id) : st.fav.concat([g.id]);
    save(STATS_KEY, st);
    b.setAttribute('aria-pressed', st.fav.includes(g.id));
    b.textContent = st.fav.includes(g.id) ? '★' : '☆';
    if(onlyFav) renderGrid();
  };
  d.addEventListener('mousemove', function(e){
    const r = d.getBoundingClientRect();
    d.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 8 + 'deg');
    d.style.setProperty('--rx', (0.5 - (e.clientY - r.top) / r.height) * 8 + 'deg');
  });
  d.addEventListener('mouseleave', function(){ d.style.setProperty('--rx','0deg'); d.style.setProperty('--ry','0deg'); });
  return d;
}

const io = new IntersectionObserver(function(es){
  es.forEach(function(e){
    if(e.isIntersecting){
      e.target.style.transitionDelay = (e.target.dataset.i * 70) + 'ms';
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold:.1 });

function renderGrid(){
  const q = query.trim().toLowerCase();
  const list = GAMES
    .filter(function(g){
      return (cat === 'Todos' || g.cat === cat) &&
             (!onlyFav || st.fav.includes(g.id)) &&
             (!q || (g.name + ' ' + g.cat + ' ' + g.desc).toLowerCase().includes(q));
    })
    .sort(function(a,b){ return (b.principal ? 1 : 0) - (a.principal ? 1 : 0); });
  $('gxGrid').replaceChildren.apply($('gxGrid'), list.map(function(g,i){
    const c = cardOf(g); c.dataset.i = i; io.observe(c); return c;
  }));
  $('gxEmpty').hidden = list.length > 0;
}
function renderChips(){
  const cats = ['Todos'].concat(Array.from(new Set(GAMES.map(function(g){ return g.cat; }))));
  $('gxChips').replaceChildren.apply($('gxChips'), cats.map(function(c){
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'gx-chip'; b.textContent = c;
    b.setAttribute('aria-pressed', c === cat);
    b.onclick = function(){ cat = c; renderChips(); renderGrid(); };
    return b;
  }));
}

/* ---------- Entrar a un juego ---------- */
function launch(g){
  if(!g.url){ toast('🔒 ' + (g.short || g.name) + ' aun no esta disponible'); return; }
  st.played[g.id] = (st.played[g.id] || 0) + 1;
  st.last = g.id; save(STATS_KEY, st);
  $('gxLoadT').textContent = 'Cargando ' + (g.short || g.name) + '...';
  $('gxLoad').classList.add('on');
  setTimeout(function(){ location.href = g.url; }, 900);
}

/* ---------- Eventos ---------- */
$('gxQ').addEventListener('input', function(e){ query = e.target.value; renderGrid(); });
$('gxFavOnly').onclick = function(e){
  onlyFav = !onlyFav; e.currentTarget.setAttribute('aria-pressed', onlyFav); renderGrid();
};
document.addEventListener('keydown', function(e){
  if(e.key === '/' && document.activeElement !== $('gxQ')){ e.preventDefault(); $('gxQ').focus(); }
  if(e.key === 'Escape') $('gxQ').blur();
});
$('gxTheme').onclick = function(){
  const light = document.documentElement.getAttribute('data-theme') === 'light';
  if(light) document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme','light');
  try { localStorage.setItem('tema', light ? 'dark' : 'light'); } catch(e){}
};
$('gxLogout').onclick = function(){ localStorage.removeItem('usuarioActual'); location.href = 'registro.html'; };
window.addEventListener('pageshow', function(){ $('gxLoad').classList.remove('on'); });

/* ---------- Cursor de espada ---------- */
(function(){
  const s = document.getElementById('espada-cursor');
  if(!s){ console.warn('No se encontro #espada-cursor'); return; }
  const raise = function(){ try{s.hidePopover()}catch(e){} try{s.showPopover()}catch(e){} };
  window.raiseSword = raise; raise();
  document.addEventListener('mousemove', function(e){
    s.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    s.classList.add('on');
  });
  document.documentElement.addEventListener('mouseleave', function(){ s.classList.remove('on'); });
})();

/* ---------- Cielo: estrellas en canvas + meteoritos ---------- */
(function sky(){
  const cv = $('gxSky'), x = cv.getContext('2d'); let w, h, stars = [];
  function size(){
    w = cv.width = innerWidth; h = cv.height = innerHeight;
    stars = Array.from({ length: Math.round(w * h / 9000) }, function(){
      return {
        x: Math.random() * w, y: Math.random() * h, s: Math.random() * 2.2 + 1,
        p: Math.random() * 6.28, v: Math.random() * 0.03 + 0.01,
        c: ['#ffffff','#38bdf8','#fdc815'][Math.floor(Math.random() * 3)]
      };
    });
  }
  function frame(){
    x.clearRect(0, 0, w, h);
    stars.forEach(function(s){
      s.p += s.v;
      x.globalAlpha = 0.25 + Math.abs(Math.sin(s.p)) * 0.75;
      x.fillStyle = s.c;
      x.fillRect(s.x, s.y, s.s, s.s);
    });
    x.globalAlpha = 1; requestAnimationFrame(frame);
  }
  addEventListener('resize', size); size(); frame();

  (function meteoro(){
    setTimeout(function(){
      const m = document.createElement('div'); m.className = 'gx-meteor';
      m.style.left = (Math.random() * innerWidth + 200) + 'px';
      m.style.top  = (Math.random() * innerHeight / 2) + 'px';
      document.body.appendChild(m);
      setTimeout(function(){ m.remove(); }, 1200);
      meteoro();
    }, Math.random() * 2500 + 1500);
  })();
})();

/* ---------- Inicio ---------- */
drawMiniAvatar(); renderStats(); renderChips(); renderGrid();
