// firebase-init.js — Proyecto coding-232bc
const firebaseConfig = {
  apiKey: "AIzaSyCXxXUiIdPSz5uKnUijwd49ntGuJBtfQCY",
  authDomain: "coding-232bc.firebaseapp.com",
  projectId: "coding-232bc",
  storageBucket: "coding-232bc.firebasestorage.app",
  messagingSenderId: "335354654680",
  appId: "1:335354654680:web:0e8e10ec42aa29c0fd8cad"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // ← variable global para todas tus páginas

// Crea/actualiza al usuario en el ranking (sin contraseña).
// IMPORTANTE: NUNCA pisa la XP de un ranking que ya existe.
async function sincronizarRanking(usuario){
  const s = await db.collection('usuarios').doc(usuario).get();
  if(!s.exists) return;
  const d = s.data();
  const rRef = db.collection('ranking').doc(usuario);
  const r = await rRef.get();
  const datos = { usuario, avatar: d.avatar || 'boy.gif' };
  if(!r.exists) datos.xp = d.xp || 0;
  await rRef.set(datos, { merge: true });
}

// Suma XP en ranking/{uid} (1 solo argumento: la cantidad)
async function sumarXP(n){
  const uid = (localStorage.getItem('usuarioActual') || '').trim().toLowerCase();
  if (!uid || !n) return;
  const inc = firebase.firestore.FieldValue.increment(Number(n));
  await db.collection('ranking').doc(uid).set(
    { usuario: uid, xp: inc },
    { merge: true }
  );
}

// Repara la XP de un usuario: nunca debe ser menor que (pruebas hechas × 100).
// Sirve para recuperar XP que se perdió por el bug anterior (las pruebas siguen guardadas).
async function repararXPUsuario(usuario){
  usuario = (usuario || localStorage.getItem('usuarioActual') || '').trim().toLowerCase();
  if (!usuario) return;
  const ref = db.collection('ranking').doc(usuario);
  const s = await ref.get();
  if (!s.exists) return;
  const d = s.data() || {};
  const pr = d.pruebas || {};
  const minimo = Object.keys(pr).filter(k => pr[k] === true).length * 100;
  if ((Number(d.xp) || 0) < minimo) await ref.set({ xp: minimo }, { merge: true });
}
