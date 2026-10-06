// Enlace del formulario "Crear Cuenta" con CouchDB: cada usuario nuevo se guarda como un documento.
const COUCH = 'http://localhost:5984';  // dirección de tu CouchDB
const DB    = 'registros';              // nombre de la base de datos (el que ves en Fauxton)
const MIN_PASS = 5;                     // la contraseña debe tener más de 4 caracteres (cualquier carácter vale)

// Devuelve el código HTTP (201 = guardado, 409 = el usuario ya existe) y lo que CouchDB explique del error
async function guardarUsuario(usuario, password) {
  const nombre = usuario.normalize('NFC');       // mismas letras = mismo usuario (aunque el teclado las escriba distinto)
  
  // Obtenemos solo la fecha en formato YYYY-MM-DD
  const fechaSoloDia = new Date().toISOString().split('T')[0];

  const doc = {
    _id: 'usuario:' + nombre.toLowerCase(),      // el id sale del usuario: si ya existe, CouchDB lo rechaza (409)
    usuario: nombre,
    contraseña: password,                        // se guarda la contraseña normal (texto plano)
    fecha: fechaSoloDia                          // solo guarda la fecha sin hora (ej. 2026-10-06)
  };

  const r = await fetch(`${COUCH}/${DB}/${encodeURIComponent(doc._id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc)
  });
  let info = {};
  try { info = await r.json(); } catch (_) {}
  return { estado: r.status, error: info.error, razon: info.reason };
}

const form = document.getElementById('registerForm');
if (form) {
  const msg = document.getElementById('msg');
  const btn = form.querySelector('button[type="submit"]');
  const mostrar = (texto, ok) => { msg.textContent = texto; msg.className = 'msg ' + (ok ? 'ok' : 'err'); };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const usuario  = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!usuario)
      return mostrar('Escribe un nombre de usuario.', false);
    if (password.length < MIN_PASS)
      return mostrar(`La contraseña debe tener más de ${MIN_PASS - 1} caracteres.`, false);

    btn.disabled = true;
    mostrar('Guardando…', true);
    try {
      const { estado, error, razon } = await guardarUsuario(usuario, password);
      const detalle = [error, razon].filter(Boolean).join(' – ') || 'sin más detalles';
      if (estado === 201 || estado === 202) { mostrar('¡Cuenta creada! Ya quedó guardada en la base de datos.', true); form.reset(); }
      else if (estado === 409)              mostrar('Ese usuario ya existe. Prueba con otro nombre.', false);
      else if (estado === 401 || estado === 403) mostrar(`CouchDB no deja guardar sin permiso (${estado}). En Fauxton: abre "${DB}" → Permisos → quita "_admin" de Miembros.`, false);
      else if (estado === 404)              mostrar(`CouchDB respondió 404 al guardar en ${COUCH}/${DB} → ${detalle}`, false);
      else                                  mostrar(`No se pudo guardar (error ${estado}: ${detalle}).`, false);
    } catch (err) {
      mostrar('No se pudo conectar con CouchDB. ¿Está encendido y con CORS activado?', false);
    } finally {
      btn.disabled = false;
    }
  });
}