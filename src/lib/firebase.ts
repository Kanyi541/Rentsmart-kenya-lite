// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFd6ZxS9K-NH-Asli0AjUiZ62meZQwoUc",
  authDomain: "rentals-4c318.firebaseapp.com",
  projectId: "rentals-4c318",
  storageBucket: "rentals-4c318.appspot.com",
  messagingSenderId: "488045362793",
  appId: "1:488045362793:web:39a8115f8cc8cfb3636cf8",
  measurementId: "G-3KFH4X16FG"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
