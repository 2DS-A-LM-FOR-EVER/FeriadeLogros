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

@media (max-width:620px){
  .pw-nav{gap:6px;padding:6px 8px}
  .pw-logo{font-size:20px}
  .pw-lk,.pw-salir{font-size:15px;padding:2px 8px}
}
`;

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
      '<a class="pw-salir" href="#" id="pwBtnSalir">SALIR</a>';
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
  function initTema() {
    var btn = document.getElementById('pwBtnTema');
    if (!btn) return;
    var aplicar = function (claro) {
      document.body.classList.toggle('light', claro);
      btn.textContent = claro ? '☀️' : '🌙';
    };
    var t = localStorage.getItem('tema');
    aplicar(t === 'light' || t === 'claro');

    btn.addEventListener('click', function () {
      var claro = !document.body.classList.contains('light');
      localStorage.setItem('tema', claro ? 'light' : 'dark');
      aplicar(claro);
      document.dispatchEvent(new CustomEvent('pw-theme-change', { detail: { light: claro } }));
    });
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
