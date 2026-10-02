import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Inicializar la aplicación de Firebase con la configuración del proyecto
const app = initializeApp(firebaseConfig);

// Inicializar Firestore con la ID de base de datos específica
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Inicializar servicio de Autenticación
export const auth = getAuth(app);

// Validar conexión con Firestore
async function validateConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Firebase connection check: client offline or configuration issue.");
    }
  }
}

validateConnection();

export default app;
