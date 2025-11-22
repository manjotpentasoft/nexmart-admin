// brandsService.js
import { db } from "./firebaseConfig";
import { fileToBase64 } from "./firestoreService";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { batchUpdateLinkedProducts, safeDeleteEntity } from "./firestoreService";
import FIREBASE_SCHEMA from "../constants/firebaseSchema";

const { COLLECTIONS, BRAND_FIELDS, PRODUCT_FIELDS } = FIREBASE_SCHEMA;

/**
 * Fetch brands by merging product brand names and brands collection
 * Returns array of { id, name, logo, productIds }
 */
export const fetchBrands = async () => {
  const productSnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
  const brandMap = new Map();

  productSnapshot.forEach((p) => {
    const data = p.data();
    if (data?.[PRODUCT_FIELDS.BRAND]) {
      const name = data[PRODUCT_FIELDS.BRAND].trim();
      const entry =
        brandMap.get(name) || {
          [BRAND_FIELDS.ID]: null,
          [BRAND_FIELDS.NAME]: name,
          productIds: [],
          [BRAND_FIELDS.LOGO]: null,
        };
      entry.productIds.push(p.id);
      brandMap.set(name, entry);
    }
  });

  const brandsSnapshot = await getDocs(collection(db, COLLECTIONS.BRANDS));
  brandsSnapshot.forEach((b) => {
    const data = b.data();
    const name = data?.[BRAND_FIELDS.NAME] || "";
    if (brandMap.has(name)) {
      const entry = brandMap.get(name);
      entry[BRAND_FIELDS.LOGO] = data[BRAND_FIELDS.LOGO] || null;
      entry[BRAND_FIELDS.ID] = b.id;
      entry.productIds = entry.productIds || [];
    } else {
      brandMap.set(name, {
        [BRAND_FIELDS.ID]: b.id,
        [BRAND_FIELDS.NAME]: name,
        [BRAND_FIELDS.LOGO]: data[BRAND_FIELDS.LOGO] || null,
        productIds: [],
      });
    }
  });

  return Array.from(brandMap.values());
};

/**
 * Add a new brand
 */
export const addBrand = async (name, logoFile) => {
  const logoBase64 = logoFile ? await fileToBase64(logoFile) : null;
  const ref = await addDoc(collection(db, COLLECTIONS.BRANDS), {
    [BRAND_FIELDS.NAME]: name.trim(),
    [BRAND_FIELDS.LOGO]: logoBase64,
    [BRAND_FIELDS.CREATED_AT]: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Update an existing brand
 * Automatically updates linked products
 */
export const updateBrand = async (brand) => {
  if (!brand[BRAND_FIELDS.ID]) throw new Error("Brand ID is required to update");

  const logoBase64 =
    brand[BRAND_FIELDS.LOGO] instanceof File
      ? await fileToBase64(brand[BRAND_FIELDS.LOGO])
      : brand[BRAND_FIELDS.LOGO] || null;

  await updateDoc(doc(db, COLLECTIONS.BRANDS, brand[BRAND_FIELDS.ID]), {
    [BRAND_FIELDS.NAME]: brand[BRAND_FIELDS.NAME],
    [BRAND_FIELDS.LOGO]: logoBase64,
  });

  // Update all products linked to this brand
  await batchUpdateLinkedProducts({
    type: "brand",
    id: brand[BRAND_FIELDS.ID],
    newName: brand[BRAND_FIELDS.NAME],
  });
};

/**
 * Delete a brand
 * Automatically checks for linked products
 */
export const deleteBrand = async (brandId, cascade = false) => {
  await safeDeleteEntity({ type: "brand", id: brandId, cascade });
};
