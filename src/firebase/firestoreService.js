import { db } from "./firebaseConfig";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

/**
 * Convert a file to base64 (for images/logos)
 */
export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

/**
 * Fetch all documents from a collection once
 */
export const fetchCollection = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Subscribe to real-time updates in a collection
 * @returns unsubscribe function
 */
export const subscribeToCollection = (collectionName, callback) => {
  const unsubscribe = onSnapshot(collection(db, collectionName), (snapshot) => {
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
  return unsubscribe;
};

/**
 * Get a single document by ID
 */
export const fetchDocument = async (collectionName, id) => {
  const ref = doc(db, collectionName, id);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

/**
 * Add a new document
 */
export const addDocument = async (collectionName, data) => {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: new Date(),
  });
  return ref.id;
};

/**
 * Update an existing document
 */
export const updateDocument = async (collectionName, id, data) => {
  const ref = doc(db, collectionName, id);
  await updateDoc(ref, data);
};

/* Delete a document */
export const deleteDocument = async (collectionName, id) => {
  await deleteDoc(doc(db, collectionName, id));
};

export const saveCartToFirestore = async (userId, cartItems) => {
  if (!userId) return;
  try {
    const cartRef = doc(db, "carts", userId);
    await setDoc(cartRef, { items: cartItems }, { merge: true });
  } catch (error) {
    console.error("Error saving cart:", error);
  }
};

export const getCartFromFirestore = async (userId) => {
  if (!userId) return [];
  try {
    const cartRef = doc(db, "carts", userId);
    const docSnap = await getDoc(cartRef);
    if (docSnap.exists()) {
      return docSnap.data().items || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
};
