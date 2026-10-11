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

// Copia/actualiza al usuario en el ranking (sin contraseña)
async function sincronizarRanking(usuario){
  const s = await db.collection('usuarios').doc(usuario).get();
  if(!s.exists) return;
  const d = s.data();
  await db.collection('ranking').doc(usuario)
    .set({ usuario, xp: d.xp || 0, avatar: d.avatar || 'boy.gif' }, { merge: true });
}

// Suma XP en las dos colecciones (úsala desde los juegos)
async function sumarXP(n){
  const uid = (localStorage.getItem('usuarioActual') || '').trim().toLowerCase();
  if (!uid || !n) return;
  const inc = firebase.firestore.FieldValue.increment(Number(n));
  await db.collection('ranking').doc(uid).set(
    { usuario: uid, xp: inc },
    { merge: true }
  );
}
