import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCs4_z1UOeS-C0cH9jG_suotHosdj9Kufs",
  authDomain: "smartclaim-405a8.firebaseapp.com",
  projectId: "smartclaim-405a8",
  storageBucket: "smartclaim-405a8.firebasestorage.app",
  messagingSenderId: "530338406205",
  appId: "1:530338406205:web:a22a79eec910d5c8c2af54",
  measurementId: "G-05L46S09FP"
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
