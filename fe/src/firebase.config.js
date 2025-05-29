// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAyzd3spxI173KGKEL6yQl_MI8qM-UBxJ0",
  authDomain: "shopping-clothes-39a97.firebaseapp.com",
  projectId: "shopping-clothes-39a97",
  storageBucket: "shopping-clothes-39a97.appspot.com",
  messagingSenderId: "832965783331",
  appId: "1:832965783331:web:c0a34292da3f5cd8772696",
  measurementId: "G-7MT9GQS584",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, analytics, auth, db, storage };
