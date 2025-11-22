// categoriesService.js
import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { batchUpdateLinkedProducts, safeDeleteEntity } from "./firestoreService";
import { COLLECTIONS, SUBCOLLECTIONS } from "../constants/firebaseSchema";

export const subscribeToCategories = (callback) => {
  const categoriesRef = collection(db, COLLECTIONS.CATEGORIES);
  const q = query(categoriesRef, orderBy("name"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(categories);
  });
  return unsubscribe;
};

/** Add category */
export const addCategory = async ({ name, status = "enabled", image = "" }) => {
  const ref = await addDoc(collection(db, COLLECTIONS.CATEGORIES), {
    name,
    status,
    image,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Update a category
 * Automatically updates linked products
 */
export const updateCategory = async (id, { name, status, image }) => {
  const categoryRef = doc(db, COLLECTIONS.CATEGORIES, id);
  await updateDoc(categoryRef, { name, status, image, updatedAt: new Date() });

  // Update linked products
  await batchUpdateLinkedProducts({ type: "category", id, newName: name });
};

/**
 * Delete a category
 */
export const deleteCategory = async (categoryId, cascade = false) => {
  // Delete subcategories first
  const subcategoriesRef = collection(
    db,
    COLLECTIONS.CATEGORIES,
    categoryId,
    SUBCOLLECTIONS.SUBCATEGORIES
  );
  const subSnap = await getDocs(subcategoriesRef);
  for (const subDoc of subSnap.docs) {
    await deleteSubcategory(categoryId, subDoc.id, cascade);
  }

  await safeDeleteEntity({ type: "category", id: categoryId, cascade });
};

/** Toggle a category status between enabled/disabled */
export const toggleCategoryStatus = async (category) => {
  const ref = doc(db, COLLECTIONS.CATEGORIES, category.id);
  await updateDoc(ref, {
    status: category.status === "enabled" ? "disabled" : "enabled",
    updatedAt: serverTimestamp(),
  });
};

/** Subscribe to subcategories of a category, ordered by name */
export const subscribeToSubcategories = (categoryId, callback) => {
  const ref = collection(db, COLLECTIONS.CATEGORIES, categoryId, SUBCOLLECTIONS.SUBCATEGORIES);
  const q = query(ref, orderBy("name"));
  return onSnapshot(q, (snap) => {
    const subs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(subs);
  });
};

/** Subscribe to all subcategories across categories (collectionGroup) */
export function subscribeToAllSubcategories(callback) {
  const ref = collectionGroup(db, SUBCOLLECTIONS.SUBCATEGORIES);
  return onSnapshot(ref, (snap) => {
    const subs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(subs);
  });
}

/** Add a subcategory under a category */
export const addSubcategory = async (categoryId, data) => {
  if (!categoryId) throw new Error("categoryId is required");
  const ref = collection(db, COLLECTIONS.CATEGORIES, categoryId, SUBCOLLECTIONS.SUBCATEGORIES);
  await addDoc(ref, {
    ...data,
    categoryId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Update a subcategory
 * Automatically updates linked products
 */
export const updateSubcategory = async (categoryId, subcategoryId, { name, status, image }) => {
  const subcategoryRef = doc(
    db,
    COLLECTIONS.CATEGORIES,
    categoryId,
    SUBCOLLECTIONS.SUBCATEGORIES,
    subcategoryId
  );
  await updateDoc(subcategoryRef, { name, status, image, updatedAt: new Date() });

  // Update linked products
  await batchUpdateLinkedProducts({
    type: "subcategory",
    id: subcategoryId,
    categoryId,
    newName: name,
  });
};

/**
 * Delete a subcategory
 */
export const deleteSubcategory = async (categoryId, subcategoryId, cascade = false) => {
  await safeDeleteEntity({
    type: "subcategory",
    id: subcategoryId,
    categoryId,
    cascade,
  });
};

/** Toggle subcategory status */
export const toggleSubcategoryStatus = async (categoryId, subcategory) => {
  const ref = doc(
    db,
    COLLECTIONS.CATEGORIES,
    categoryId,
    SUBCOLLECTIONS.SUBCATEGORIES,
    subcategory.id
  );
  await updateDoc(ref, {
    status: subcategory.status === "enabled" ? "disabled" : "enabled",
    updatedAt: serverTimestamp(),
  });
};
