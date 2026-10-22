/* ═══════════ PROGRESO EN LA NUBE (Firestore) ═══════════
   Fuente de verdad: ranking/{usuario}.pruebas  (html_0, css_2, python_4, ...)
   Respaldo extra:   ranking/{usuario}.progreso (copia de localStorage del usuario)
   Al entrar se reconstruye el progreso local y se repara la XP desde `pruebas`. */

const PREFIJOS_PROGRESO = [
  'ca_basico_v1_', 'ca_html_v1_', 'ca_css_v1_', 'ca_python_v1_', 'ca_javascript_v1_',
  'ca_juegos_v1_', 'ca_arcade_profile_v1_'
];
const PC_JUEGOS = ['basico', 'html', 'css', 'python', 'javascript'];
const PC_PRUEBAS_POR_JUEGO = 5;
const PC_XP_POR_PRUEBA = 100;

const esProgreso = k => PREFIJOS_PROGRESO.some(p => typeof k === 'string' && k.startsWith(p));
const usuarioActivo = () => (localStorage.getItem('usuarioActual') || '').trim().toLowerCase();
const pcEsDelUsuario = (k, user) => PREFIJOS_PROGRESO.some(p => k === p + user);

/* ── SUBIR: copia el progreso local DEL USUARIO ACTUAL (devuelve promesa) ── */
function guardarProgresoNube() {
  const user = usuarioActivo();
  if (!user || typeof db === 'undefined' || !db) return Promise.resolve();

  const progreso = {};
  Object.keys(localStorage).forEach(k => {
    if (pcEsDelUsuario(k, user)) progreso[k] = localStorage.getItem(k);
  });
  if (Object.keys(progreso).length === 0) return Promise.resolve();

  return db.collection('ranking').doc(user)
    .set({ progreso, ultimoRespaldo: new Date().toISOString() }, { merge: true })
    .catch(err => console.warn('[nube] no se pudo respaldar:', err));
}

/* ── Une lo local con lo de la nube (si está hecho en cualquiera, queda hecho) ── */
function fusionarProgreso(k, nubeStr) {
  const local = localStorage.getItem(k);
  if (local === null) { localStorage.setItem(k, nubeStr); return; }
  try {
    const a = JSON.parse(local), b = JSON.parse(nubeStr);
    let cambio = false;
    ['hechos', 'done'].forEach(campo => {
      if (Array.isArray(a[campo]) && Array.isArray(b[campo])) {
        const nuevo = a[campo].map((x, i) => !!(x || b[campo][i]));
        if (JSON.stringify(nuevo) !== JSON.stringify(a[campo].map(Boolean))) { a[campo] = nuevo; cambio = true; }
      }
    });
    if (cambio) localStorage.setItem(k, JSON.stringify(a));
  } catch (e) {}
}

/* ── Reconstruye ca_<juego>_v1_<usuario> desde ranking.pruebas ── */
function reconstruirDesdePruebas(user, pruebas) {
  PC_JUEGOS.forEach(j => {
    const hay = [0, 1, 2, 3, 4].some(i => pruebas[j + '_' + i] === true);
    const key = 'ca_' + j + '_v1_' + user;
    let est = null;
    try { est = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
    if (!est && !hay) return;

    const campo = j === 'basico' ? 'done' : 'hechos';
    const vacio = () => Array(PC_PRUEBAS_POR_JUEGO).fill(false);
    let cambio = false;
    if (!est || typeof est !== 'object') {
      est = j === 'basico'
        ? { done: vacio(), paso: [0, 0, 0, 0, 0], sel: 0, pend: { xp: 0, ins: false } }
        : { hechos: vacio(), codigo: {}, actual: 0, intro: true, pistasUsadas: {} };
      cambio = true;
    }
    if (!Array.isArray(est[campo]) || est[campo].length !== PC_PRUEBAS_POR_JUEGO) {
      const viejo = Array.isArray(est[campo]) ? est[campo] : [];
      est[campo] = vacio().map((_, i) => !!viejo[i]);
      cambio = true;
    }
    for (let i = 0; i < PC_PRUEBAS_POR_JUEGO; i++) {
      if (pruebas[j + '_' + i] === true && !est[campo][i]) { est[campo][i] = true; cambio = true; }
    }
    if (cambio) {
      if (j !== 'basico') {
        est.intro = true;
        const p = est.hechos.findIndex(h => !h);
        est.actual = p === -1 ? 0 : p;
      }
      localStorage.setItem(key, JSON.stringify(est));
    }
  });
}

/* ── Repara la XP: nunca debe ser menor que (pruebas hechas × 100) ── */
function repararXPDesdePruebas(ref, data) {
  const pr = data.pruebas || {};
  const n = Object.keys(pr).filter(k => pr[k] === true).length;
  const minimo = n * PC_XP_POR_PRUEBA;
  if ((Number(data.xp) || 0) < minimo) return ref.set({ xp: minimo }, { merge: true });
  return Promise.resolve();
}

/* ── BAJAR: restaura progreso + repara XP al iniciar sesión (devuelve promesa) ── */
function restaurarProgresoCompleto(user) {
  user = (user || usuarioActivo());
  if (!user || typeof db === 'undefined' || !db) return Promise.resolve();
  const ref = db.collection('ranking').doc(user);
  return ref.get().then(doc => {
    if (!doc.exists) return;
    const d = doc.data() || {};
    if (d.progreso) Object.entries(d.progreso).forEach(([k, v]) => { if (pcEsDelUsuario(k, user)) fusionarProgreso(k, v); });
    reconstruirDesdePruebas(user, d.pruebas || {});
    return repararXPDesdePruebas(ref, d);
  }).catch(err => console.warn('[nube] no se pudo restaurar:', err));
}

/* Compatibilidad con el nombre anterior */
function cargarProgresoNube(callback) {
  restaurarProgresoCompleto().then(() => { if (typeof callback === 'function') callback(); });
}

/* ── AUTOGUARDADO: respaldo 3 s después de cada guardado de progreso ── */
(function () {
  const original = Storage.prototype.setItem;
  let timer = null;
  Storage.prototype.setItem = function (k, v) {
    original.call(this, k, v);
    if (esProgreso(k)) {
      clearTimeout(timer);
      timer = setTimeout(guardarProgresoNube, 3000);
    }
  };
  window.addEventListener('beforeunload', guardarProgresoNube);
})();

/* ── AUTO-RESTAURAR en el mapa y en los juegos (recarga 1 vez si algo cambió) ── */
(function () {
  if (!/(juegos|basico|html|css|python|javascript)\.html$/i.test(location.pathname)) return;
  function auto() {
    const user = usuarioActivo();
    if (!user) return;
    try {
      if (sessionStorage.getItem('pc_rec') === location.pathname) { sessionStorage.removeItem('pc_rec'); return; }
    } catch (e) {}
    const foto = () => PC_JUEGOS.map(j => localStorage.getItem('ca_' + j + '_v1_' + user)).join('|');
    const antes = foto();
    restaurarProgresoCompleto(user).then(() => {
      if (foto() !== antes) {
        try { sessionStorage.setItem('pc_rec', location.pathname); } catch (e) {}
        location.reload();
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
})();
