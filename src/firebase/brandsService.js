import { db } from "./firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { fileToBase64 } from "./firestoreService";

/**
 * Fetch all brands (from products + brands collection)
 * Returns an array of { id, name, logo, productIds }
 */
export const fetchBrands = async () => {
  // Step 1: Gather brands from products
  const productSnapshot = await getDocs(collection(db, "products"));
  const brandMap = new Map();

  productSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.brand) {
      const name = data.brand.trim();
      if (!brandMap.has(name))
        brandMap.set(name, {
          id: null,
          name,
          productIds: [doc.id],
          logo: null,
        });
      else brandMap.get(name).productIds.push(doc.id);
    }
  });

  // Step 2: Merge existing brands collection (logos, IDs)
  const brandsSnapshot = await getDocs(collection(db, "brands"));
  brandsSnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (brandMap.has(data.name)) {
      brandMap.get(data.name).logo = data.logo || null;
      brandMap.get(data.name).id = docSnap.id;
      // Ensure productIds always exists
      if (!brandMap.get(data.name).productIds)
        brandMap.get(data.name).productIds = [];
    } else {
      brandMap.set(data.name, {
        id: docSnap.id,
        name: data.name,
        logo: data.logo || null,
        productIds: [], // Always initialize
      });
    }
  });
  return Array.from(brandMap.values());
};

/**
 * Add a new brand document
 */
export const addBrand = async (name, logoFile) => {
  const logoBase64 = logoFile ? await fileToBase64(logoFile) : null;
  const ref = await addDoc(collection(db, "brands"), {
    name: name.trim(),
    logo: logoBase64,
    createdAt: new Date(),
  });
  return ref.id;
};

/**
 * Update an existing brand document
 */
export const updateBrand = async (brand) => {
  if (!brand.id) throw new Error("Brand ID is required to update");
  const logoBase64 =
    brand.logo instanceof File
      ? await fileToBase64(brand.logo)
      : brand.logo || null;
  await updateDoc(doc(db, "brands", brand.id), {
    name: brand.name,
    logo: logoBase64,
  });
};

/**
 * Delete a brand document
 */
export const deleteBrand = async (brand) => {
  if (!brand.id) return;
  await deleteDoc(doc(db, "brands", brand.id));
};
