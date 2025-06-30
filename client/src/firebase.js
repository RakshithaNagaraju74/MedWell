import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDNCmvk9nRxJ7v57pkajeRiaxpK-PX8hM4",
  authDomain: "medai-f558a.firebaseapp.com",
  projectId: "medai-f558a",
  storageBucket: "medai-f558a.firebasestorage.app",
  messagingSenderId: "1057741481572",
  appId: "1:1057741481572:web:04c760d0daeacbf4dca171"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();