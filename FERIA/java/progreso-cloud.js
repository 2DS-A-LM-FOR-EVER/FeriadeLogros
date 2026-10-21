/* ═══════════ PROGRESO EN LA NUBE (Firestore) ═══════════
   Respalda el progreso de juegos en ranking/{usuario}/progreso.
   El Modo Kiosco puede borrar localStorage sin perder nada. */

const PREFIJOS_PROGRESO = [
  'ca_python_v1_', 'ca_html_v1_', 'ca_juegos_v1_', 'ca_arcade_profile_v1_'
];

const esProgreso = k => PREFIJOS_PROGRESO.some(p => typeof k === 'string' && k.startsWith(p));
const usuarioActivo = () => (localStorage.getItem('usuarioActual') || '').toLowerCase();

/* ── SUBIR: copia todo el progreso local a ranking/{usuario}/progreso ── */
function guardarProgresoNube() {
  const user = usuarioActivo();
  if (!user || typeof db === 'undefined' || !db) return;

  const progreso = {};
  Object.keys(localStorage).forEach(k => {
    if (esProgreso(k)) progreso[k] = localStorage.getItem(k);
  });

  // Solo guarda si hay algo que guardar
  if (Object.keys(progreso).length > 0) {
    db.collection('ranking').doc(user)
      .set({ progreso, ultimoRespaldo: new Date().toISOString() }, { merge: true })
      .catch(err => console.warn('[nube] no se pudo respaldar:', err));
  }
}

/* ── BAJAR: restaura el progreso al iniciar sesión ── */
function cargarProgresoNube(callback) {
  const user = usuarioActivo();
  const terminar = () => { if (typeof callback === 'function') callback(); };
  if (!user || typeof db === 'undefined' || !db) return terminar();

  db.collection('ranking').doc(user).get()
    .then(doc => {
      if (doc.exists && doc.data().progreso) {
        Object.entries(doc.data().progreso).forEach(([k, v]) => {
          // Solo restaura lo que NO exista local (no pisa progreso más nuevo)
          if ( localStorage.getItem(k) === null ) {
            localStorage.setItem(k, v);
          }
        });
      }
      terminar();
    })
    .catch(err => { console.warn('[nube] no se pudo cargar:', err); terminar(); });
}

/* ── AUTOGUARDADO: intercepta localStorage.setItem ──
   Cada vez que juegos.js guarda progreso, programa un respaldo 3s después. */
(function () {
  const original = Storage.prototype.setItem;
  let timer = null;
  Storage.prototype.setItem = function (k, v) {
    original.call(this, k, v); // Ejecuta el guardado normal
    if (esProgreso(k)) {
      clearTimeout(timer);
      timer = setTimeout(guardarProgresoNube, 3000); // Espera 3s para no saturar
    }
  };
  // Respaldo de emergencia si cierran la pestaña de golpe
  window.addEventListener('beforeunload', guardarProgresoNube);
})();