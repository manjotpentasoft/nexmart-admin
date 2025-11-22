import { useEffect, useState } from "react";
import { subscribeToAllSubcategories } from "../firebase/categoriesService";
import { useCollection } from "./useCollection";

export function useSubcategoriesWithCategories() {
  const [subcategories, setSubcategories] = useState([]);
  const categories = useCollection({ path: "categories" });

  useEffect(() => {
    const unsubscribe = subscribeToAllSubcategories((subs) => {
      setSubcategories(subs);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  // Recompute categoryName dynamically whenever categories or subcategories change
  const merged = subcategories.map((sub) => {
    const cat = categories.find((c) => c.id === sub.categoryId);
    return {
      ...sub,
      categoryName: cat ? cat.name : "Uncategorized",
    };
  });

  return merged;
}