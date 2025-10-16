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
      try {
        const snapshot = await getDocs(collection(db, "categories"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
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
      try {
        const snapshot = await getDocs(
          collection(db, "categories", selectedCategoryId, "subcategories")
        );
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSubCategories(data);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    };
    fetchSubcategories();
  }, [selectedCategoryId]);

  // Fetch all brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const snapshot = await getDocs(collection(db, "brands"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBrands(data);
      } catch (err) {
        console.error("Error fetching brands:", err);
      }
    };
    fetchBrands();
  }, []);

  return { categories, subCategories, brands };
}
