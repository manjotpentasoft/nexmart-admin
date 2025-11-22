import { useEffect, useState } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export function useFirestoreCRUD(path) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const colRef = collection(db, path);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setData(list);
    });

    return () => unsubscribe();
  }, [path]);

  const createItem = async (item) => addDoc(collection(db, path), item);
  const updateItem = async (id, updates) => updateDoc(doc(db, path, id), updates);
  const deleteItem = async (id) => deleteDoc(doc(db, path, id));

  return { data, createItem, updateItem, deleteItem };
}
