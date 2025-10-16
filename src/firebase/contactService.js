// src/firebase/contactService.js
import { collection, getDocs, addDoc, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * Fetch all contact messages from Firestore, ordered by createdAt descending
 */
export const fetchContacts = async () => {
  try {
    const q = query(
      collection(db, "contactMessages"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return data;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

/**
 * Add a new contact message to Firestore
 * @param {Object} contactData - { name, email, phone, subject, message }
 */
export const addContactMessage = async (contactData) => {
  try {
    await addDoc(collection(db, "contactMessages"), {
      ...contactData,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error adding contact message:", error);
    throw error;
  }
};
