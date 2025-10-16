import { db } from "./firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

/**
 * Subscribe to all categories (ordered by name)
 * @param {function} callback - called with updated categories
 * @returns unsubscribe function
 */
export const subscribeToCategories = (callback) => {
  const categoriesRef = collection(db, "categories");
  const q = query(categoriesRef, orderBy("name"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(categories);
  });
  return unsubscribe;
};

/**
 * Add a new category
 */
export const addCategory = async ({ name, status = "enabled", image = "" }) => {
  const categoriesRef = collection(db, "categories");
  const docRef = await addDoc(categoriesRef, {
    name,
    status,
    image,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
};

/**
 * Update an existing category
 */
export const updateCategory = async (id, { name, status, image }) => {
  const categoryRef = doc(db, "categories", id);
  await updateDoc(categoryRef, {
    name,
    status,
    image,
    updatedAt: new Date(),
  });
};

/**
 * Delete a category and its subcategories
 */
export const deleteCategory = async (categoryId) => {
  // Delete subcategories
  const subcategoriesRef = collection(db, "categories", categoryId, "subcategories");
  const subSnap = await getDocs(subcategoriesRef);
  for (const subDoc of subSnap.docs) {
    await deleteDoc(doc(db, "categories", categoryId, "subcategories", subDoc.id));
  }

  // Delete category
  await deleteDoc(doc(db, "categories", categoryId));
};

/**
 * Toggle category status
 */
export const toggleCategoryStatus = async (category) => {
  const categoryRef = doc(db, "categories", category.id);
  await updateDoc(categoryRef, {
    status: category.status === "enabled" ? "disabled" : "enabled",
    updatedAt: new Date(),
  });
};

export const fetchCategories = async () => {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};


/**
 * Subscribe to subcategories of a category (ordered by name)
 * @param {string} categoryId
 * @param {function} callback
 * @returns unsubscribe function
 */
export const subscribeToSubcategories = (categoryId, callback) => {
  const subcategoriesRef = collection(db, "categories", categoryId, "subcategories");
  const q = query(subcategoriesRef, orderBy("name"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const subcategories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(subcategories);
  });
  return unsubscribe;
};

/**
 * Add a new subcategory
 */
export const addSubcategory = async (categoryId, { name, status = "enabled", image = "" }) => {
  const subcategoriesRef = collection(db, "categories", categoryId, "subcategories");
  const docRef = await addDoc(subcategoriesRef, {
    name,
    status,
    image,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
};

/**
 * Update a subcategory
 */
export const updateSubcategory = async (categoryId, subcategoryId, { name, status, image }) => {
  const subcategoryRef = doc(db, "categories", categoryId, "subcategories", subcategoryId);
  await updateDoc(subcategoryRef, {
    name,
    status,
    image,
    updatedAt: new Date(),
  });
};

/**
 * Delete a subcategory
 */
export const deleteSubcategory = async (categoryId, subcategoryId) => {
  await deleteDoc(doc(db, "categories", categoryId, "subcategories", subcategoryId));
};

/**
 * Toggle subcategory status
 */
export const toggleSubcategoryStatus = async (categoryId, subcategory) => {
  const subcategoryRef = doc(db, "categories", categoryId, "subcategories", subcategory.id);
  await updateDoc(subcategoryRef, {
    status: subcategory.status === "enabled" ? "disabled" : "enabled",
    updatedAt: new Date(),
  });
};
