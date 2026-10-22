/* ═══════════ PROGRESO EN LA NUBE (Firestore) ═══════════
   Respalda el progreso de juegos en ranking/{usuario}/progreso.
   v2: restaura MEZCLANDO hechos (nunca pisa progreso completado)
       y agrega curarInsignia() para reparar el campo insignias. */

const PREFIJOS_PROGRESO = [
  'ca_python_v1_', 'ca_html_v1_', 'ca_juegos_v1_', 'ca_arcade_profile_v1_', 'ca_basico_v1_', 'ca_css_v1_'
];

const esProgreso = k => PREFIJOS_PROGRESO.some(p => typeof k === 'string' && k.startsWith(p));
const esJuego    = k => /^ca_[a-z]+_v1_/.test(k || '');
const usuarioActivo = () => (localStorage.getItem('usuarioActual') || '').trim().toLowerCase();

/* ── SUBIR: copia todo el progreso local a ranking/{usuario}/progreso ── */
function guardarProgresoNube() {
  const user = usuarioActivo();
  if (!user || typeof db === 'undefined' || !db) return;

  const progreso = {};
  Object.keys(localStorage).forEach(k => {
    if (esProgreso(k)) progreso[k] = localStorage.getItem(k);
  });

  if (Object.keys(progreso).length > 0) {
    db.collection('ranking').doc(user)
      .set({ progreso, ultimoRespaldo: new Date().toISOString() }, { merge: true })
      .catch(err => console.warn('[nube] no se pudo respaldar:', err));
  }
}

/* ── MEZCLA: unión de hechos entre local y nube (nunca pierde completados) ── */
function mezclarHechos(localStr, nubeStr){
  try {
    const L = JSON.parse(localStr || 'null');
    const N = JSON.parse(nubeStr || 'null');
    if (!N || !Array.isArray(N.hechos)) return localStr;
    if (!L || !Array.isArray(L.hechos)) return nubeStr;
    let cambio = false;
    const hechos = L.hechos.map((h, i) => {
      const u = !!(h || N.hechos[i]);
      if (u !== !!h) cambio = true;
      return u;
    });
    if (!cambio) return localStr;
    L.hechos = hechos;
    return JSON.stringify(L);
  } catch(e){ return localStr; }
}

/* ── BAJAR: restaura al iniciar sesión, MEZCLANDO juegos ── */
function cargarProgresoNube(callback) {
  const user = usuarioActivo();
  const terminar = () => { if (typeof callback === 'function') callback(); };
  if (!user || typeof db === 'undefined' || !db) return terminar();

  db.collection('ranking').doc(user).get()
    .then(doc => {
      if (doc.exists && doc.data().progreso) {
        Object.entries(doc.data().progreso).forEach(([k, v]) => {
          if (esJuego(k)) {
            // juegos: unión de hechos (local + nube)
            const mezclado = mezclarHechos(localStorage.getItem(k), v);
            if (mezclado !== null && mezclado !== localStorage.getItem(k)) localStorage.setItem(k, mezclado);
          } else if (localStorage.getItem(k) === null) {
            localStorage.setItem(k, v);
          }
        });
      }
      terminar();
    })
    .catch(err => { console.warn('[nube] no se pudo cargar:', err); terminar(); });
}

/* ── CURAR INSIGNIA: si el campo insignias quedó como mapa/string, lo repara a array ── */
async function curarInsignia(nombre) {
  const uid = usuarioActivo();
  if (!uid || typeof db === 'undefined' || !db) return;
  const ref = db.collection('ranking').doc(uid);
  try {
    await ref.set({ insignias: firebase.firestore.FieldValue.arrayUnion(nombre) }, { merge: true });
    return;
  } catch(e){ /* el campo no es array: reconstruir abajo */ }
  try {
    const doc = await ref.get();
    const actual = doc.exists ? doc.data().insignias : null;
    let lista = [];
    if (Array.isArray(actual)) lista = actual.slice();
    else if (actual && typeof actual === 'object') {
      // rescata el respaldo que quedó atrapado dentro de insignias
      if (actual.progreso) await ref.set({ progreso: actual.progreso }, { merge: true });
      lista = Object.keys(actual).filter(k => k !== 'progreso');
    }
    if (!lista.includes(nombre)) lista.push(nombre);
    await ref.set({ insignias: lista }, { merge: true });
  } catch(e){ console.warn('[nube] no se pudo curar insignia:', e); }
}

/* ── AUTOGUARDADO: intercepta localStorage.setItem ── */
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