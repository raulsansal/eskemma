// scripts/callSetAdminRole.js
const admin = require('firebase-admin');

// Inicializar (asegúrate de tener las credenciales configuradas)
admin.initializeApp();

const uid = 'TU_UID_AQUI'; // ← Reemplaza con tu UID real

// Llamar a la Cloud Function
admin.functions().httpsCallable('setAdminRole')({ uid })
  .then((result) => {
    console.log('✅ Resultado:', result.data);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });