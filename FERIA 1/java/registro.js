// registro.js — Versión Firestore (proyecto coding-232bc)
const form = document.getElementById('registerForm');
if (form) {
  const msg = document.getElementById('msg');
  const btn = form.querySelector('button[type="submit"]');
  const loadingOverlay = document.getElementById('loadingOverlay');

  const mostrar = (texto, ok) => {
    if (msg) { msg.textContent = texto; msg.className = 'msg ' + (ok ? 'ok' : 'err'); }
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const usuario = document.getElementById('username').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    if (!usuario) return mostrar('Escribe un nombre de usuario.', false);
    if (!password) return mostrar('Escribe una contraseña.', false);

    btn.disabled = true;
    mostrar('Verificando cuenta...', true);

    try {
      const userRef = db.collection('usuarios').doc(usuario);
      const snap = await userRef.get();

      if (snap.exists) {
        // Ya existe → login
        if (snap.data().contraseña !== password) {
          mostrar('Contraseña incorrecta.', false);
          btn.disabled = false;
          return;
        }
        mostrar('¡Inicio de sesión exitoso! Redirigiendo...', true);
      } else {
        // No existe → registro
        await userRef.set({
          usuario: usuario,
          contraseña: password,
          avatar: 'boy.gif',
          fecha: new Date().toISOString().split('T')[0],
          xp: 0
        });
        mostrar('¡Cuenta creada con éxito! Redirigiendo...', true);
      }
            await sincronizarRanking(usuario);

      localStorage.setItem('usuarioActual', usuario);
      form.reset();
      if (loadingOverlay) loadingOverlay.classList.add('active');
      setTimeout(() => { window.location.href = 'perfil.html'; }, 1500);

    } catch (err) {
      console.error(err);
      mostrar('No se pudo conectar con Firebase (revisa la consola F12).', false);
      btn.disabled = false;
    }
  });
}