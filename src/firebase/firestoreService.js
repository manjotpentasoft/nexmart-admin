import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { COLLECTIONS, SUBCOLLECTIONS } from "../constants/firebaseSchema";

export function subscribeToCollection(
  collectionPath,
  onUpdate,
  constraints = [],
  orderByField = null
) {
  const colRef = collection(db, collectionPath);
  const clauses = [...constraints];
  if (orderByField) clauses.push(orderBy(orderByField));
  const q = query(colRef, ...clauses);

  const unsubscribe = onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onUpdate(list);
  });

  return () => unsubscribe();
 }

export async function getDocument(collectionPath, id) {
  const snap = await getDoc(doc(db, collectionPath, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getCollectionOnce(collectionPath, constraints = []) {
  const colRef = collection(db, collectionPath);
  const q = query(colRef, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createDocument(collectionPath, data) {
  const payload = { ...data };
  if (!payload.createdAt) payload.createdAt = serverTimestamp();
  return addDoc(collection(db, collectionPath), payload);
}

export async function updateDocument(collectionPath, id, updates) {
  if (!id) throw new Error("Missing document id");
  return updateDoc(doc(db, collectionPath, id), updates);
}

export async function deleteDocument(collectionPath, id) {
  return deleteDoc(doc(db, collectionPath, id));
}

export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function validateProductReferences({
  brandId,
  categoryId,
  subcategoryId,
}) {
  const errors = [];
  if (brandId) {
    const snap = await getDoc(doc(db, COLLECTIONS.BRANDS, brandId));
    if (!snap.exists()) errors.push("Invalid brand selected.");
  }
  if (categoryId) {
    const snap = await getDoc(doc(db, COLLECTIONS.CATEGORIES, categoryId));
    if (!snap.exists()) errors.push("Invalid category selected.");
  }
  if (subcategoryId && categoryId) {
    const snap = await getDoc(
      doc(
        db,
        `${COLLECTIONS.CATEGORIES}/${categoryId}/${SUBCOLLECTIONS.SUBCATEGORIES}`,
        subcategoryId
      )
    );
    if (!snap.exists()) errors.push("Invalid subcategory selected.");
  }
  if (errors.length) throw new Error(errors.join(" "));
  return true;
}

export async function batchUpdateLinkedProducts({
  type,
  id,
  newName,
  categoryId = null,
}) {
  const batch = writeBatch(db);
  let q;
  switch (type) {
    case "brand":
      q = query(collection(db, COLLECTIONS.PRODUCTS), where("brandId", "==", id));
      break;
    case "category":
      q = query(collection(db, COLLECTIONS.PRODUCTS), where("categoryId", "==", id));
      break;
    case "subcategory":
      q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where("subcategoryId", "==", id),
        where("categoryId", "==", categoryId)
      );
      break;
    default:
      throw new Error("Invalid relation type for batch update.");
  }

  const snap = await getDocs(q);
  snap.forEach((d) => {
    const updates = {};
    if (type === "brand") updates.brandName = newName;
    if (type === "category") updates.categoryName = newName;
    if (type === "subcategory") updates.subcategoryName = newName;
    batch.update(d.ref, updates);
  });
  await batch.commit();
  return snap.size;
}

export async function safeDeleteEntity({
  type,
  id,
  categoryId = null,
  cascade = false,
}) {
  let q;
  switch (type) {
    case "brand":
      q = query(collection(db, COLLECTIONS.PRODUCTS), where("brandId", "==", id));
      break;
    case "category":
      q = query(collection(db, COLLECTIONS.PRODUCTS), where("categoryId", "==", id));
      break;
    case "subcategory":
      q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where("subcategoryId", "==", id),
        where("categoryId", "==", categoryId)
      );
      break;
    default:
      throw new Error("Invalid relation type for deletion.");
  }

  const snap = await getDocs(q);

  if (!cascade && !snap.empty) {
    throw new Error(
      `Cannot delete ${type}: ${snap.size} product(s) still reference it.`
    );
  }

  if (cascade && !snap.empty) {
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  const refPath =
    type === "subcategory"
      ? `${COLLECTIONS.CATEGORIES}/${categoryId}/${SUBCOLLECTIONS.SUBCATEGORIES}`
      : `${type}s`;
  await deleteDoc(doc(db, refPath, id));
  return { deletedProducts: cascade ? snap.size : 0 };
}
