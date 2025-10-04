import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

// Register new user and save to Firestore
export async function register(email, password, name) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
    createdAt: serverTimestamp(),
  });

  return user;
}

// Login user and get Firestore data
export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    return { uid: user.uid, ...userDoc.data() };
  } else {
    throw new Error("User data not found in Firestore");
  }
}

// Login with Google and store in Firestore if new
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName || "Unnamed",
      email: user.email,
      createdAt: serverTimestamp(),
    });
  }

  return { uid: user.uid, ...userDoc.data() };
}

// Logout
export async function logout() {
  return signOut(auth);
}

// Listen to user data in real-time
export function listenToUser(uid, callback) {
  return onSnapshot(doc(db, "users", uid), (doc) => {
    callback(doc.exists() ? doc.data() : null);
  });
}
