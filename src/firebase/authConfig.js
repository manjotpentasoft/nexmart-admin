import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import { COLLECTIONS } from "../constants/firebaseSchema";

export async function register(email, password, displayName, extraData = {}) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  const userDoc = {
    name: displayName,
    email,
    createdAt: serverTimestamp(),
    ...extraData,
  };
  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userDoc);
  return { uid: user.uid, ...userDoc };
}

export async function login(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  const userSnap = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
  if (userSnap.exists()) return { uid: user.uid, ...userSnap.data() };
  throw new Error("User data not found in Firestore");
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  const user = credential.user;
  const userRef = doc(db, COLLECTIONS.USERS, user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || "Unnamed",
      email: user.email,
      createdAt: serverTimestamp(),
    });
  }
  return { uid: user.uid, ...userSnap.data() };
}

export async function logout() {
  return signOut(auth);
}

export function listenToUser(uid, callback) {
  return onSnapshot(doc(db, COLLECTIONS.USERS, uid), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}
