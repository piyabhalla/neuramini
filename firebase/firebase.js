import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQHkjeDIyorUPSbc-k9md97chSA_46NXk",
  authDomain: "neuramini-29bdf.firebaseapp.com",
  projectId: "neuramini-29bdf",
  storageBucket: "neuramini-29bdf.appspot.com",
  messagingSenderId: "339644242826",
  appId: "1:339644242826:web:35361f6f91cca7db8e8673",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);