import { useEffect, useState, useRef } from "react";
import { collection, collectionGroup, query, orderBy, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export function useCollection({ path = null, group = false, name = null, orderByField = "name", filters = [] }) {
  const [items, setItems] = useState([]);
  const unsubRef = useRef(null);

  useEffect(() => {
    let unsub = null;

    try {
      if (group) {
        if (!name) return;
        const baseRef = collectionGroup(db, name);
        const constraints = [];
        if (filters.length) filters.forEach(([field, op, value]) => constraints.push(where(field, op, value)));
        if (orderByField) constraints.push(orderBy(orderByField));
        const q = query(baseRef, ...constraints);
        unsub = onSnapshot(q, (snap) => {
          const list = snap.docs.map((d) => {
            const parent = d.ref.parent;
            const parentDoc = parent.parent;
            const parentId = parentDoc ? parentDoc.id : null;
            return { id: d.id, ...d.data(), parentId };
          });
          setItems(list);
        });
      } else if (path) {
        const col = collection(db, path);
        const constraints = [];
        if (filters.length) filters.forEach(([field, op, value]) => constraints.push(where(field, op, value)));
        if (orderByField) constraints.push(orderBy(orderByField));
        const q = query(col, ...constraints);
        unsub = onSnapshot(q, (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setItems(list);
        });
      }
    } catch (err) {
      console.error(err);
    }

    unsubRef.current = unsub;
    return () => unsub && unsub();
  }, [path, group, name, orderByField, JSON.stringify(filters)]);

  return items;
}
