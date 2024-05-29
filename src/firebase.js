import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.React_App_FIREBASE_API_KEY,
  authDomain: process.env.React_App_AUTH_DOMAIN,
  projectId: process.env.React_App_PROJECT_ID,
  storageBucket: process.env.React_App_STORAGE_BUCKET,
  messagingSenderId: process.env.React_App_MESSAGING_SENDER_ID,
  appId: process.env.React_App_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const facebookAuthProvider = new FacebookAuthProvider();
export const db = getFirestore();
export const storage = getStorage(app);

export default app;
