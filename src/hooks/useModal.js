// src/hooks/useModal.js
import { useState } from "react";

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState(null);

  const open = (p = null) => {
    setPayload(p);
    setIsOpen(true);
  };
  const close = () => {
    setPayload(null);
    setIsOpen(false);
  };

  return { isOpen, payload, open, close };
}
