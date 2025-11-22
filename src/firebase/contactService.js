// contactService.js
import {
  collection,
  getDocs,
  addDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import FIREBASE_SCHEMA from "../constants/firebaseSchema";

const { COLLECTIONS, CONTACT_MESSAGE_FIELDS } = FIREBASE_SCHEMA;

/** Fetch contact messages ordered by createdAt (descending) */
export const fetchContacts = async () => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CONTACT_MESSAGES),
      orderBy(CONTACT_MESSAGE_FIELDS.CREATED_AT, "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Error fetching contacts:", err);
    throw err;
  }
};

/** Add a new contact message */
export const addContactMessage = async (contactData) => {
  try {
    await addDoc(collection(db, COLLECTIONS.CONTACT_MESSAGES), {
      ...contactData,
      [CONTACT_MESSAGE_FIELDS.CREATED_AT]: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error("Error adding contact message:", err);
    throw err;
  }
};
