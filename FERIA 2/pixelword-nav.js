/* ============================================================
   PIXELWORD · NAV REUTILIZABLE
   Uso en cualquier página:
       <script src="pixelword-nav.js"></script>

   Opcional (ANTES del script), para personalizar:
       <script>
         window.PIXELNAV_CONFIG = {
           active : 'juegos',        // 'inicio' | 'juegos' | 'ranking' | 'perfil'
           salirUrl: 'registro.html',
           logoUrl : 'ho.png',
           marca   : 'PIXELWORD'
         };
       </script>
   ============================================================ */
(function () {
  'use strict';

  var CFG = Object.assign({
    active: null,                 // null = se detecta solo por el nombre del archivo
    salirUrl: 'registro.html',
    logoUrl: 'ho.png',
    marca: 'PIXELWORD',
    limpiarAlSalir: true
  }, window.PIXELNAV_CONFIG || {});

  var LINKS = [
    { k: 'inicio',  txt: 'Inicio',  href: 'index.html'   },
    { k: 'juegos',  txt: 'Juegos',  href: 'juegos.html'  },
    { k: 'ranking', txt: 'Ranking', href: 'ranking.html' },
    { k: 'perfil',  txt: 'Perfil',  href: 'perfil.html'  }
  ];

  /* ------------------------- CSS ------------------------- */
  var CSS = `
.pw-nav{
  position:sticky;top:0;z-index:9999;
  background:var(--nav,#050a24);
  border-bottom:4px solid #000;
  display:flex;align-items:center;gap:10px;
  padding:8px 14px;flex-wrap:wrap;color:#fff;box-sizing:border-box;
}
.pw-nav,.pw-nav *{font-family:'Pixelify Sans',monospace !important;box-sizing:border-box}
.pw-nav::after{
  content:'';position:absolute;left:0;right:0;bottom:-8px;height:4px;
  background:linear-gradient(90deg,var(--pink,#ff4f9a),var(--yellow,#fdc815),var(--green,#7cffb2),var(--cyan,#4fd8ff),var(--pink,#ff4f9a));
  background-size:200% 100%;animation:pwLinea 4s linear infinite;
}
@keyframes pwLinea{to{background-position:200% 0}}

.pw-logo{
  display:flex;align-items:center;gap:8px;
  font-weight:700;font-size:24px;text-decoration:none;
  color:var(--yellow,#fdc815);text-shadow:3px 3px 0 #000;
  margin-right:auto;
}
.pw-logo img{
  width:34px;height:34px;image-rendering:pixelated;
  animation:pwSpin 6s steps(8) infinite;
}
@keyframes pwSpin{to{transform:rotate(360deg)}}

.pw-lk{
  background:#0e1a5c;color:#fff;border:3px solid #000;
  box-shadow:3px 3px 0 #000;padding:3px 12px;
  text-decoration:none;font-size:17px;
}
.pw-lk:hover{background:var(--yellow,#fdc815);color:#000}
.pw-lk.on{background:linear-gradient(#ffe066,var(--yellow,#fdc815));color:#000}

.pw-tema{
  width:38px;height:38px;border:3px solid #000;
  background:#0e1a5c;color:#fff;box-shadow:3px 3px 0 #000;
  font-size:18px;padding:0;cursor:pointer;
}
.pw-chip{
  border:3px solid var(--green,#7cffb2);color:var(--green,#7cffb2);
  padding:2px 10px;font-size:16px;background:#031c14;
}
.pw-salir{
  background:linear-gradient(#ff7ab5,var(--pink,#ff4f9a));
  color:#fff;border:3px solid #000;box-shadow:3px 3px 0 #000;
  padding:3px 12px;font-size:17px;text-decoration:none;cursor:pointer;
}
.pw-salir:active{transform:translate(3px,3px);box-shadow:none}

/* ---- Menú hamburguesa (celular, tablet y laptop pequeña) ---- */
.pw-burger,.pw-overlay,.pw-drawer{display:none}
@media (max-width:1024px){
  .pw-nav{flex-wrap:nowrap;padding:8px 14px;padding-top:calc(8px + env(safe-area-inset-top,0px))}
  .pw-lk,.pw-tema,.pw-chip,.pw-salir{display:none}
  .pw-logo{min-width:0;font-size:clamp(18px,5vw,24px)}
  .pw-burger{
    display:flex;align-items:center;justify-content:center;flex:none;
    width:42px;height:42px;padding:0;color:var(--yellow,#fdc815);
    background:#0e1a5c;border:3px solid #000;box-shadow:3px 3px 0 #000;cursor:pointer;
  }
  .pw-burger svg{width:24px;height:24px}
  .pw-burger:active{transform:translate(3px,3px);box-shadow:none}
  .pw-overlay{
    display:block;position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.62);
    opacity:0;pointer-events:none;transition:opacity .25s;
  }
  .pw-drawer{
    display:flex;flex-direction:column;position:fixed;top:0;right:0;bottom:0;z-index:10001;
    width:min(88vw,380px);background:#050a24;border-left:4px solid #000;
    box-shadow:-6px 0 0 #0e1a5c;color:#fff;overflow-y:auto;overscroll-behavior:contain;
    transform:translateX(100%);visibility:hidden;
    transition:transform .25s ease,visibility 0s linear .25s;
  }
  html.pw-dr-open .pw-overlay{opacity:1;pointer-events:auto}
  html.pw-dr-open .pw-drawer{transform:none;visibility:visible;transition:transform .25s ease,visibility 0s}
  html.pw-dr-open body{overflow:hidden}
}
.pw-drawer,.pw-drawer *{font-family:'Pixelify Sans',monospace !important;box-sizing:border-box}
.pw-drhead{
  display:flex;align-items:center;gap:14px;padding:14px 16px;
  padding-top:calc(14px + env(safe-area-inset-top,0px));border-bottom:2px solid #1b2a6b;
}
.pw-drclose{
  display:flex;align-items:center;justify-content:center;width:42px;height:42px;padding:0;
  background:none;border:0;color:#8fa0d6;cursor:pointer;
}
.pw-drclose svg{width:22px;height:22px}
.pw-drtitle{font-size:22px;font-weight:700;color:#fff}
.pw-drlist{list-style:none;margin:0;padding:6px 14px calc(20px + env(safe-area-inset-bottom,0px))}
.pw-drlist li{border-bottom:1px solid #1b2a6b}
.pw-dritem{
  display:flex;align-items:center;gap:16px;width:100%;min-height:60px;padding:14px 8px;
  background:none;border:0;color:#e8ecff;font-size:19px;font-weight:700;text-align:left;
  text-decoration:none;cursor:pointer;
}
.pw-dritem svg{width:24px;height:24px;flex:none;color:#8fa0d6}
.pw-dritem:hover,.pw-dritem:focus-visible{background:#0e1a5c;outline:0}
.pw-dritem.on,.pw-dritem.on svg{color:var(--yellow,#fdc815)}
.pw-druser,.pw-druser svg{color:var(--green,#7cffb2);cursor:default}
.pw-druser:hover{background:none}
.pw-drout,.pw-drout svg{color:#ff8ab8}
/* Tema claro: el panel cambia a colores claros con letras oscuras */
body.light .pw-drawer{background:#f2f5ff;color:#0a1240;box-shadow:-6px 0 0 #c8d2f0}
body.light .pw-drhead{border-bottom-color:#c8d2f0}
body.light .pw-drtitle{color:#0a1240}
body.light .pw-drclose{color:#4a5a99}
body.light .pw-drlist li{border-bottom-color:#c8d2f0}
body.light .pw-dritem{color:#0a1240}
body.light .pw-dritem svg{color:#4a5a99}
body.light .pw-dritem:hover,body.light .pw-dritem:focus-visible{background:#e3e9ff}
body.light .pw-dritem.on,body.light .pw-dritem.on svg{color:#8a5a00}
body.light .pw-druser,body.light .pw-druser svg{color:#0b7a45}
body.light .pw-druser:hover{background:none}
body.light .pw-drout,body.light .pw-drout svg{color:#c0225f}
.pw-dritem .pw-i-sun{display:none}
body.light .pw-dritem .pw-i-sun{display:block}
body.light .pw-dritem .pw-i-moon{display:none}
@media (max-width:620px){
  .pw-nav{padding:6px 10px}
}
`;

  /* ------------------------ Iconos ------------------------ */
  var ICO = {
    inicio:  '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
    juegos:  '<path d="M6 8h12a4 4 0 014 4v2a3 3 0 01-5 2l-2-2H9l-2 2a3 3 0 01-5-2v-2a4 4 0 014-4zM8 10v4M6 12h4M16 11h.01M18 13h.01"/>',
    ranking: '<path d="M8 4h8v5a4 4 0 01-8 0V4zM8 6H4v2a3 3 0 003 3M16 6h4v2a3 3 0 01-3 3M12 13v4M8 20h8M10 17h4"/>',
    perfil:  '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    luna:    '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>',
    sol:     '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    salir:   '<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>',
    menu:    '<path d="M4 7h16M4 12h16M4 17h16"/>',
    cerrar:  '<path d="M5 5l14 14M19 5L5 19"/>'
  };
  function svg(n, cls) {
    return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">' + ICO[n] + '</svg>';
  }

  /* --------------------- Detectar activo --------------------- */
  function autoActivo() {
    var f = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!f || f === '') f = 'index.html';
    for (var i = 0; i < LINKS.length; i++) {
      if (LINKS[i].href.toLowerCase() === f) return LINKS[i].k;
    }
    return null;
  }

  /* --------------------------- HTML --------------------------- */
  function navHTML() {
    var activo = CFG.active || autoActivo();
    var links = LINKS.map(function (l) {
      return '<a class="pw-lk' + (l.k === activo ? ' on' : '') + '" href="' + l.href + '">' + l.txt + '</a>';
    }).join('');

    return '' +
      '<a class="pw-logo" href="index.html">' +
        '<img src="' + CFG.logoUrl + '" alt="" onerror="this.style.display=\'none\'">' +
        CFG.marca +
      '</a>' +
      links +
      '<button class="pw-tema" id="pwBtnTema" title="Cambiar tema claro/oscuro" aria-label="Cambiar tema">🌙</button>' +
      '<span class="pw-chip" id="pwChipUser">Invitado</span>' +
      '<a class="pw-salir" href="#" id="pwBtnSalir">SALIR</a>' +
      '<button type="button" class="pw-burger" id="pwBurger" aria-label="Abrir menú" aria-haspopup="dialog" aria-expanded="false" aria-controls="pwDrawer">' + svg('menu') + '</button>';
  }

  function drawerHTML() {
    var activo = CFG.active || autoActivo();
    var items = LINKS.map(function (l) {
      var on = l.k === activo;
      return '<li><a class="pw-dritem' + (on ? ' on' : '') + '" href="' + l.href + '"' + (on ? ' aria-current="page"' : '') + '>' +
             svg(l.k) + '<span>' + l.txt + '</span></a></li>';
    }).join('');
    return '' +
      '<div class="pw-drhead">' +
        '<button type="button" class="pw-drclose" id="pwDrClose" aria-label="Cerrar menú">' + svg('cerrar') + '</button>' +
        '<span class="pw-drtitle">Menu</span>' +
      '</div>' +
      '<ul class="pw-drlist">' + items +
        '<li><button type="button" class="pw-dritem" id="pwDrTema">' + svg('luna', 'pw-i-moon') + svg('sol', 'pw-i-sun') + '<span>Cambiar tema</span></button></li>' +
        '<li><div class="pw-dritem pw-druser">' + svg('perfil') + '<span id="pwDrUser">Invitado</span></div></li>' +
        '<li><button type="button" class="pw-dritem pw-drout" id="pwDrSalir">' + svg('salir') + '<span id="pwDrSalirTxt">Salir</span></button></li>' +
      '</ul>';
  }

  /* -------------------- Lógica de usuario -------------------- */
  function getUid() {
    var r = localStorage.getItem('usuarioActual');
    if (!r) return null;
    try {
      var j = JSON.parse(r);
      r = (j && typeof j === 'object') ? (j.usuario || j.uid || j.name || '') : String(j);
    } catch (e) {}
    r = String(r || '').trim().toLowerCase();
    return r || null;
  }

  function pintaUsuario() {
    var uid = getUid();
    var chip = document.getElementById('pwChipUser');
    if (chip) chip.textContent = uid ? '👤 ' + uid : 'Invitado';
    var du = document.getElementById('pwDrUser');
    if (du) du.textContent = uid || 'Invitado';
    var ds = document.getElementById('pwDrSalirTxt');
    if (ds) ds.textContent = uid ? 'Salir' : 'Entrar';
  }

  /* ------------------------ Kiosco ---------------------------- */
  function resetKiosco() {
    if (CFG.limpiarAlSalir) {
      var pref = ['ca_basico_v1_', 'ca_python_v1_', 'ca_juegos_v1_', 'ca_arcade_profile_v1_'];
      Object.keys(localStorage).forEach(function (k) {
        if (pref.some(function (p) { return k.indexOf(p) === 0; })) localStorage.removeItem(k);
      });
      localStorage.removeItem('usuarioActual');
    }
    location.href = CFG.salirUrl;
  }

  /* -------------------------- Tema ---------------------------- */
  /* Aplica el tema al instante en todas las "señales" que usan las páginas:
     body.light (básico/nav), html[data-theme="light"] (index, juegos, perfil)
     y html[data-tema="claro"] (ranking). */
  function aplicarTema(claro) {
    var root = document.documentElement;
    document.body.classList.toggle('light', claro);
    if (claro) {
      root.setAttribute('data-theme', 'light');
      root.setAttribute('data-tema', 'claro');
    } else {
      root.removeAttribute('data-theme');
      root.removeAttribute('data-tema');
    }
    var btn = document.getElementById('pwBtnTema');
    if (btn) btn.textContent = claro ? '☀️' : '🌙';
  }

  function alternarTema() {
    var claro = !document.body.classList.contains('light');
    localStorage.setItem('tema', claro ? 'light' : 'dark');
    aplicarTema(claro);
    document.dispatchEvent(new CustomEvent('pw-theme-change', { detail: { light: claro } }));
  }

  function initTema() {
    var btn = document.getElementById('pwBtnTema');
    if (!btn) return;
    var t = localStorage.getItem('tema');
    aplicarTema(t === 'light' || t === 'claro');
    btn.addEventListener('click', alternarTema);
  }

  /* ----------------------- Menú hamburguesa ----------------------- */
  function initMenu() {
    ['pwOverlay', 'pwDrawer'].forEach(function (id) {
      var viejo = document.getElementById(id);
      if (viejo) viejo.remove();
    });

    var ov = document.createElement('div');
    ov.className = 'pw-overlay'; ov.id = 'pwOverlay';
    var dr = document.createElement('aside');
    dr.className = 'pw-drawer'; dr.id = 'pwDrawer';
    dr.setAttribute('role', 'dialog'); dr.setAttribute('aria-modal', 'true'); dr.setAttribute('aria-label', 'Menú');
    dr.innerHTML = drawerHTML();
    document.body.appendChild(ov);
    document.body.appendChild(dr);

    var html = document.documentElement;
    var burger = document.getElementById('pwBurger');
    var mq = window.matchMedia('(max-width:1024px)');

    function abrir() {
      html.classList.add('pw-dr-open');
      burger.setAttribute('aria-expanded', 'true');
      document.getElementById('pwDrClose').focus();
    }
    function cerrar() {
      if (!html.classList.contains('pw-dr-open')) return;
      html.classList.remove('pw-dr-open');
      burger.setAttribute('aria-expanded', 'false');
    }

    burger.addEventListener('click', abrir);
    ov.addEventListener('click', cerrar);
    document.getElementById('pwDrClose').addEventListener('click', cerrar);
    document.getElementById('pwDrTema').addEventListener('click', function () {
      alternarTema();
      cerrar();
    });
    document.getElementById('pwDrSalir').addEventListener('click', resetKiosco);
    dr.addEventListener('click', function (e) { if (e.target.closest('a')) cerrar(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });
    var alCambiar = function () { if (!mq.matches) cerrar(); };
    if (mq.addEventListener) mq.addEventListener('change', alCambiar); else mq.addListener(alCambiar);
  }

  /* ------------------------- Arranque ------------------------- */
  function init() {
    // Fuente pixel (solo una vez)
    if (!document.getElementById('pw-font')) {
      var l1 = document.createElement('link');
      l1.rel = 'preconnect'; l1.href = 'https://fonts.gstatic.com'; l1.crossOrigin = '';
      document.head.appendChild(l1);
      var l2 = document.createElement('link');
      l2.id = 'pw-font'; l2.rel = 'stylesheet';
      l2.href = 'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&display=swap';
      document.head.appendChild(l2);
    }

    // Estilos (solo una vez)
    if (!document.getElementById('pw-nav-css')) {
      var st = document.createElement('style');
      st.id = 'pw-nav-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }

    // Dónde insertar: <div id="pixelword-nav"></div> o arriba del body
    var host = document.getElementById('pixelword-nav');
    if (!host) {
      host = document.createElement('header');
      host.id = 'pixelword-nav';
      document.body.insertBefore(host, document.body.firstChild);
    }
    host.className = 'pw-nav';
    host.innerHTML = navHTML();

    document.documentElement.setAttribute('data-pw-nav', '4');
    initMenu();
    pintaUsuario();
    initTema();

    document.getElementById('pwBtnSalir').addEventListener('click', function (e) {
      e.preventDefault();
      resetKiosco();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'F8') { e.preventDefault(); resetKiosco(); }
    });

    // Refresca el nombre si otra pestaña inicia sesión
    window.addEventListener('storage', function (e) {
      if (e.key === 'usuarioActual') pintaUsuario();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
