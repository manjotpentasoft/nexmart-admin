import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATgB_XlBAqKy8ZmC6MwB8HZvsfi4VULpE",
  authDomain: "nexmart-367ec.firebaseapp.com",
  projectId: "nexmart-367ec",
  storageBucket: "nexmart-367ec.firebasestorage.app",
  messagingSenderId: "69752878959",
  appId: "1:69752878959:web:93e11d8262c8e93c055a9a",
  measurementId: "G-3KV5KXR8WF"
};

const app = initializeApp(firebaseConfig);
export const  auth = getAuth(app);
export const db = getFirestore(app);

export default app;