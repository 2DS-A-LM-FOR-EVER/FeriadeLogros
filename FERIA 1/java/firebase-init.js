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
async function sumarXP(usuario, n){
  const inc = firebase.firestore.FieldValue.increment(n);
  const b = db.batch();
  b.update(db.collection('usuarios').doc(usuario), { xp: inc });
  b.set(db.collection('ranking').doc(usuario), { usuario, xp: inc }, { merge: true });
  await b.commit();
}