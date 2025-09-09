import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";  // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyCPI7-vAf85xKq9dJUrcZVtBDdtGvs8b6U",
  authDomain: "quant-algo-4430a.firebaseapp.com",
  projectId: "quant-algo-4430a",
  storageBucket: "quant-algo-4430a.firebasestorage.app",
  messagingSenderId: "678462391640",
  appId: "1:678462391640:web:21df7b57d826db2b83d12d",
  measurementId: "G-G91M88C4MT"
};

let app, analytics, auth, firestore;

  // Initialize Firebase only on the client-side
  
    app = initializeApp(firebaseConfig);
    
    // Initialize Analytics only if supported in the browser environment
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });

    // Initialize Authentication and Firestore services
    auth = getAuth(app);
    firestore = getFirestore(app);  // Initialize Firestore
  

// Export the initialized services for use in other parts of your project
export { app, analytics, auth, firestore };
