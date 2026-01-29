import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";

// Firebase Configuration
// Can be overridden with environment variables (VITE_FIREBASE_*)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCs4_z1UOeS-C0cH9jG_suotHosdj9Kufs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smartclaim-405a8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smartclaim-405a8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smartclaim-405a8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "530338406205",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:530338406205:web:a22a79eec910d5c8c2af54",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-05L46S09FP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
