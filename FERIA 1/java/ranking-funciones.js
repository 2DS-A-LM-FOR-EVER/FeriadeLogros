(function () {
  const RANGOS = [
    { n: 'Bronce',   min: 0,    c: '#cd7f32' },
    { n: 'Plata',    min: 500,  c: '#c4cbdc' },
    { n: 'Oro',      min: 1500, c: '#ffc24b' },
    { n: 'Platino',  min: 2500, c: '#8fe8d8' }
  ];
  const rangoDe = xp => RANGOS.reduce((a, r) => xp >= r.min ? r : a, RANGOS[0]);

  const lista = document.getElementById('rkList');
  if (!lista) return;
  const yo = (localStorage.getItem('usuarioActual') || '').toLowerCase();

  const mensaje = t => {
    const li = document.createElement('li');
    li.className = 'rk-msg'; li.textContent = t;
    lista.replaceChildren(li);
  };

  function fila(d, i) {
    const r = rangoDe(d.xp || 0);
    const li = document.createElement('li');
    li.className = 'rk-row' + (d.usuario === yo ? ' me' : '');
    li.style.animationDelay = (i * 60) + 'ms';

    const pos = document.createElement('div'); pos.className = 'rk-pos'; pos.textContent = i + 1;
    const av = document.createElement('img'); av.className = 'rk-av'; av.alt = '';
    av.src = d.avatar || 'boy.gif'; av.onerror = () => { av.onerror = null; av.src = 'boy.gif'; };
    const nm = document.createElement('div'); nm.className = 'rk-name'; nm.textContent = d.usuario;
    const ch = document.createElement('span'); ch.className = 'rk-chip'; ch.textContent = r.n.toUpperCase(); ch.style.background = r.c;
    const xp = document.createElement('div'); xp.className = 'rk-xp'; xp.textContent = (d.xp || 0) + ' XP';

    li.append(pos, av, nm, ch, xp);
    return li;
  }

  db.collection('ranking').orderBy('xp', 'desc').limit(10).onSnapshot(
    snap => {
      if (snap.empty) return mensaje('Aún no hay jugadores. ¡Sé el primero!');
      lista.replaceChildren(...snap.docs.map((doc, i) => fila(doc.data(), i)));
    },
    err => { console.error(err); mensaje('No se pudo cargar el ranking.'); }
  );
})();