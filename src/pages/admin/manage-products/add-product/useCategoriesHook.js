import { useState, useEffect } from "react";
import { db } from "../../../../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function useCategories(selectedCategoryId) {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesRef = collection(db, "categories");
      const snapshot = await getDocs(categoriesRef);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // Fetch subcategories for selected category
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategoryId) {
        setSubCategories([]);
        return;
      }
      const subRef = collection(db, "categories", selectedCategoryId, "subcategories");
      const snapshot = await getDocs(subRef);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSubCategories(data);
    };
    fetchSubcategories();
  }, [selectedCategoryId]);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      const brandsRef = collection(db, "brands");
      const snapshot = await getDocs(brandsRef);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBrands(data);
    };
    fetchBrands();
  }, []);

  return { categories, subCategories, brands };
}
