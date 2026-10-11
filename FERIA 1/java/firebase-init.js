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

// Suma XP de forma atómica y segura (úsala desde los juegos)
async function sumarXP(usuario, n) {
  const inc = firebase.firestore.FieldValue.increment(n);
  
  // 1. Siempre actualizamos 'ranking' (que es el que lee el perfil y el ranking)
  await db.collection('ranking').doc(usuario).set({ 
      xp: inc,
      usuario: usuario
  }, { merge: true }).catch(err => console.error("Error sumando XP en ranking:", err));
  
  // 2. Intentamos actualizar 'usuarios' solo si ya existe (para evitar errores)
  try {
      await db.collection('usuarios').doc(usuario).update({ xp: inc });
  } catch(e) {
      // Si no existe el documento en usuarios, no pasa nada, el ranking ya se actualizó correctamente
  }
}
