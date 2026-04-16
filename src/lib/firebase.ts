import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  EmailAuthProvider,
  GithubAuthProvider,
  PhoneAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBC7GnUu6ZrrMrgbT15WC8k-TmHNxy6R-g",
  authDomain: "iba-website-d238f.firebaseapp.com",
  projectId: "iba-website-d238f",
  storageBucket: "iba-website-d238f.firebasestorage.app",
  messagingSenderId: "781233145983",
  appId: "1:781233145983:web:d4765f11c9bd8c496c574a",
  measurementId: "G-4R0PWB2EEK",
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
export const emailProvider = new EmailAuthProvider();

export default app;