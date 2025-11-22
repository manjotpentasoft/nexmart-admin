// productsService.js
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  where,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { validateProductReferences } from "./firestoreService";
import { COLLECTIONS } from "../constants/firebaseSchema";

/** Fetch all products once */
export const fetchProducts = async () => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** Subscribe to products realtime */
export const subscribeToProducts = (callback) => {
  return onSnapshot(collection(db, COLLECTIONS.PRODUCTS), (snap) => {
    const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(products);
  });
};

export const addProduct = async (productData) => {
  await validateProductReferences({
    brandId: productData.brandId,
    categoryId: productData.categoryId,
    subcategoryId: productData.subcategoryId,
  });

  const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef;
};

export const updateProduct = async (productId, updatedData) => {
  await validateProductReferences({
    brandId: updatedData.brandId,
    categoryId: updatedData.categoryId,
    subcategoryId: updatedData.subcategoryId,
  });

  await updateDoc(doc(db, COLLECTIONS.PRODUCTS, productId), {
    ...updatedData,
    updatedAt: serverTimestamp(),
  });
};

/** Delete product */
export const deleteProduct = async (productId) => {
  await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
};

/** Resize & image helpers (kept as in original productsService) */
export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });

export const resizeFile = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/** Process files - single or multiple */
export const processImages = async (files) => {
  if (Array.isArray(files)) {
    return Promise.all(files.map((file) => resizeFile(file)));
  } else if (files) {
    return resizeFile(files);
  }
  return null;
};

/** Get products with optional filters (brand, price, category) */
export async function getProducts(filter = { brand: [], price: null, category: null }) {
  let q = collection(db, COLLECTIONS.PRODUCTS);
  const qArr = [];

  if (filter.brand?.length) qArr.push(where("brand", "in", filter.brand));
  if (filter.category) qArr.push(where("category", "==", filter.category));
  if (filter.price && Array.isArray(filter.price) && filter.price.length === 2) {
    qArr.push(
      where("price", ">=", filter.price[0]),
      where("price", "<=", filter.price[1])
    );
  }

  if (qArr.length) q = query(q, ...qArr);

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
