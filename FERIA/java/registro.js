// registro.js — Crear cuenta (Firestore puro, con restauración de progreso)
(function () {
  const form    = document.getElementById('registerForm');
  const msg     = document.getElementById('msg');
  const overlay = document.getElementById('loadingOverlay');
  const btn     = document.getElementById('btnSubmit');
  const REDIRECT = 'juegos.html';

  const firebaseConfig = {
    apiKey: "AIzaSyCXxXUiIdPSz5uKnUijwd49ntGuJBtfQCY",
    authDomain: "coding-232bc.firebaseapp.com",
    projectId: "coding-232bc",
    storageBucket: "coding-232bc.firebasestorage.app",
    messagingSenderId: "335354654680",
    appId: "1:335354654680:web:0e8e10ec42aa29c0fd8cad"
  };

  function conectar() {
    if (typeof firebase === 'undefined' || !firebase.initializeApp) return null;
    try {
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      return firebase.firestore();
    } catch (e) {
      console.error('[registro] no se pudo iniciar Firebase', e);
      return null;
    }
  }

  function mostrar(texto, tipo) {
    msg.textContent = texto;
    msg.className = 'msg ' + (tipo || '');
  }

  function limpiarTelefono(v) {
    let d = String(v || '').replace(/\D/g, '');
    if (d.length === 11 && d.startsWith('503')) d = d.slice(3);
    return /^[267]\d{7}$/.test(d) ? d : null;
  }

  function ocupado(si) {
    overlay.classList.toggle('active', si);
    btn.disabled = si;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const usuario  = document.getElementById('username').value.trim().toLowerCase().normalize('NFC');
    const password = document.getElementById('password').value;
    const telefono = limpiarTelefono(document.getElementById('telefono').value);

    if (!usuario) return mostrar('Escribe un nombre de usuario', 'err');
    if (usuario.includes('/')) return mostrar('El usuario no puede contener el símbolo "/"', 'err');
    if (!telefono) return mostrar('Escribe un teléfono válido de 8 dígitos (ej: 7000 0000)', 'err');

    const store = conectar();
    if (!store) return mostrar('No cargó Firebase. Revisa tu internet.', 'err');

    mostrar('', '');
    ocupado(true);

    try {
      const ref  = store.collection('usuarios').doc(usuario);
      const snap = await ref.get();
      let nuevo = false;

      if (snap.exists) {
        const d = snap.data();
        if (d['contraseña'] !== password) {
          ocupado(false);
          return mostrar('Ese usuario ya existe y la contraseña no coincide', 'err');
        }
        if (!d.telefono) await ref.set({ telefono: telefono }, { merge: true });
      } else {
        nuevo = true;
        await ref.set({
          usuario: usuario,
          'contraseña': password,
          avatar: 'boy.gif',
          fecha: new Date().toISOString(),
          xp: 0,
          telefono: telefono
        });
      }

      const d2 = (await ref.get()).data() || {};
      const rRef  = store.collection('ranking').doc(usuario);
      const rSnap = await rRef.get();
      if (!rSnap.exists) {
        // Solo si el ranking NO existía se crea con XP inicial
        await rRef.set({ usuario: usuario, xp: d2.xp || 0, avatar: d2.avatar || 'boy.gif', insignias: [] }, { merge: true });
      } else {
        // Si ya existe: NO se toca la XP (antes se pisaba con 0 en cada login)
        await rRef.set({ usuario: usuario, avatar: d2.avatar || 'boy.gif' }, { merge: true });
      }

      localStorage.setItem('usuarioActual', usuario);
      mostrar(nuevo ? '¡Cuenta creada! Sincronizando progreso...' : '¡Bienvenido! Sincronizando progreso...', 'ok');

      // Restaura progreso desde la nube (pruebas + respaldo) y repara la XP antes de entrar
      if (typeof restaurarProgresoCompleto === 'function') {
        await Promise.race([restaurarProgresoCompleto(usuario), new Promise(r => setTimeout(r, 6000))]);
      }
      setTimeout(() => { window.location.href = REDIRECT; }, 600);

    } catch (err) {
      console.error('[registro]', err);
      ocupado(false);
      const permisos = err && err.code === 'permission-denied';
      mostrar(permisos ? 'Firebase rechazó el permiso. Revisa las reglas.' : 'No se pudo conectar. Revisa tu internet.', 'err');
    }
  });
})();