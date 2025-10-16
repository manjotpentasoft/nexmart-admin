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
} from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * Fetch all products once
 */
export const fetchProducts = async () => {
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Subscribe to real-time updates for products
 * @param {function} callback - Function called with updated product list
 * @returns unsubscribe function
 */
export const subscribeToProducts = (callback) => {
  const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(products);
  });

  return unsubscribe;
};

/**
 * Add a new product
 * @param {object} productData
 * @returns created document reference
 */
export const addProduct = async (productData) => {
  const docRef = await addDoc(collection(db, "products"), {
    ...productData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef;
};

/**
 * Update a product
 * @param {string} productId
 * @param {object} updatedData
 */
export const updateProduct = async (productId, updatedData) => {
  const productRef = doc(db, "products", productId);
  await updateDoc(productRef, {
    ...updatedData,
    updatedAt: new Date(),
  });
};

/**
 * Delete a product
 * @param {string} productId
 */
export const deleteProduct = async (productId) => {
  const productRef = doc(db, "products", productId);
  await deleteDoc(productRef);
};

/**
 * Convert file to Base64
 * @param {File} file
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });

/**
 * Resize and compress image to a maximum width/height
 * @param {File} file
 * @param {number} maxWidth
 * @param {number} maxHeight
 * @param {number} quality (0-1)
 * @returns {Promise<string>} Base64 string
 */
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

/**
 * Process single or multiple files and return Base64
 * @param {File|File[]} files
 * @returns {Promise<string|string[]>} Base64 string(s)
 */
export const processImages = async (files) => {
  if (Array.isArray(files)) {
    return await Promise.all(files.map((file) => resizeFile(file)));
  } else if (files) {
    return await resizeFile(files);
  }
  return null;
};

export async function getProducts(filter) {
  let q = collection(db, "products");
  const qArr = [];
  if (filter.brand.length) qArr.push(where('brand', 'in', filter.brand));
  if (filter.price) qArr.push(where('price', '>=', filter.price[0]), where('price', '<=', filter.price[1]));

  if (qArr.length) q = query(q, ...qArr);

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}