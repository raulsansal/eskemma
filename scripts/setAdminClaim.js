// scripts/setAdminClaim.js
const admin = require('firebase-admin');

// Inicializar con credenciales de tu proyecto
// Opción 1: Si tienes serviceAccountKey.json
// const serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// Opción 2: Usar variables de entorno (si ya configuraste Firebase Admin)
admin.initializeApp();

const uid = 'TU_UID_AQUI'; // ← Reemplaza con tu UID real

admin.auth().setCustomUserClaims(uid, { role: 'admin' })
  .then(() => {
    console.log('✅ Custom claim "admin" asignado correctamente');
    console.log('⚠️  Cierra sesión y vuelve a iniciar para aplicar cambios');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });