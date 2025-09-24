import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPI7-vAf85xKq9dJUrcZVtBDdtGvs8b6U",
  authDomain: "quant-algo-4430a.firebaseapp.com",
  projectId: "quant-algo-4430a",
  storageBucket: "quant-algo-4430a.firebasestorage.app",
  messagingSenderId: "678462391640",
  appId: "1:678462391640:web:21df7b57d826db2b83d12d",
  measurementId: "G-G91M88C4MT",
};

// Declare typed variables
const app: FirebaseApp = initializeApp(firebaseConfig);
let analytics: Analytics | null = null;



// Initialize Analytics if supported
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Initialize Authentication and Firestore services
const auth = getAuth(app);
const firestore = getFirestore(app);

// Export typed services
export { app, analytics, auth, firestore };
