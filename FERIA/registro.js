
const COUCH = 'http://localhost:5984';
const DB = 'registros';

async function autenticarORegistrar(usuario, password) {
  const nombre = usuario.normalize('NFC').trim();
  const docId = 'usuario:' + nombre.toLowerCase();
  const url = `${COUCH}/${DB}/${encodeURIComponent(docId)}`;

  // Consultar si el usuario ya existe.
  const consulta = await fetch(url);

  if (consulta.ok) {
    const cuenta = await consulta.json();

    // Si existe, comprobar su contraseña.
    if (cuenta.contraseña !== password) {
      return {
        estado: 401,
        error: 'La contraseña es incorrecta.'
      };
    }

    return {
      estado: 200,
      accion: 'login',
      usuario: cuenta.usuario
    };
  }

  // Solo crear si CouchDB confirma que no existe.
  if (consulta.status !== 404) {
    throw new Error('No se pudo consultar la base de datos.');
  }

  const doc = {
    _id: docId,
    usuario: nombre,
    contraseña: password,
    fecha: new Date().toISOString().slice(0, 10)
  };

  const respuesta = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc)
  });

  const resultado = await respuesta.json();

  if (respuesta.status === 201) {
    return {
      estado: 201,
      accion: 'registro',
      usuario: nombre
    };
  }

  // Otra petición pudo registrar ese usuario al mismo tiempo.
  if (respuesta.status === 409) {
    return {
      estado: 409,
      error: 'Ese nombre de usuario ya está registrado.'
    };
  }

  throw new Error(resultado.reason || resultado.error ||
                  'No se pudo crear la cuenta.');
}

const form = document.getElementById('registerForm');

if (form) {
  const msg = document.getElementById('msg');
  const btn = form.querySelector('button[type="submit"]');
  const loadingOverlay = document.getElementById('loadingOverlay');

  function mostrar(texto, ok) {
    msg.textContent = texto;
    msg.className = 'msg ' + (ok ? 'ok' : 'err');
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const usuario = document.getElementById('username')
      .value.trim();
    const password = document.getElementById('password').value;

    if (!usuario || !password) {
      mostrar('Completa el usuario y la contraseña.', false);
      return;
    }

    btn.disabled = true;
    mostrar('Verificando cuenta...', true);

    try {
      const resultado = await autenticarORegistrar(
        usuario, password
      );

      if (resultado.estado === 200 ||
          resultado.estado === 201) {

        // Guardar el nombre canónico de la cuenta.
        localStorage.setItem(
          'usuarioActual',
          resultado.usuario
        );

        mostrar(
          resultado.accion === 'login'
            ? '¡Bienvenido de nuevo! Entrando...'
            : '¡Cuenta creada! Preparando tu perfil...',
          true
        );

        if (loadingOverlay) {
          loadingOverlay.classList.add('active');
        }

        setTimeout(() => {
          window.location.href = 'perfil.html';
        }, 1000);

      } else if (resultado.estado === 401) {
        mostrar(resultado.error, false);
        btn.disabled = false;

      } else {
        mostrar(resultado.error, false);
        btn.disabled = false;
      }

    } catch (error) {
      console.error(error);
      mostrar(
        'No se pudo conectar con CouchDB. Revisa que esté funcionando.',
        false
      );
      btn.disabled = false;
    }
  });
}
