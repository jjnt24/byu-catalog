// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhwm0DHNmt7tAcd_rk89iVUEQfvtVHods",
  authDomain: "byusoul-member.firebaseapp.com",
  projectId: "byusoul-member",
  storageBucket: "byusoul-member.firebasestorage.app",
  messagingSenderId: "168618143221",
  appId: "1:168618143221:web:9075656f78acd891a084bc",
  measurementId: "G-9F29Z8TETV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);