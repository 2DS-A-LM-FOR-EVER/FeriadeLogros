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
const db = firebase.firestore();

/* Crea ranking/{usuario} SOLO si no existe.
   NUNCA toca xp / pruebas / insignias / progreso de un doc existente
   (antes esto reseteaba el XP a 0 en cada inicio de sesión). */
async function sincronizarRanking(usuario){
  const uid = String(usuario || '').trim().toLowerCase();
  if (!uid || typeof db === 'undefined') return;
  const ref = db.collection('ranking').doc(uid);
  const doc = await ref.get();
  if (doc.exists) return; // ← ya existe: NO se toca nada
  const s = await db.collection('usuarios').doc(uid).get();
  const d = s.exists ? s.data() : {};
  await ref.set({
    usuario: uid,
    avatar: d.avatar || 'boy.gif',
    xp: 0,
    insignias: [],
    pruebas: {},
    progreso: {}
  }, { merge: true });
}

// Suma XP en ranking/{uid}
async function sumarXP(n){
  const uid = (localStorage.getItem('usuarioActual') || '').trim().toLowerCase();
  if (!uid || !n) return;
  const inc = firebase.firestore.FieldValue.increment(Number(n));
  await db.collection('ranking').doc(uid).set(
    { usuario: uid, xp: inc },
    { merge: true }
  );
}