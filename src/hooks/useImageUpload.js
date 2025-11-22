import { useState } from "react";
import { fileToBase64 } from "../firebase/firestoreService";

export function useImageUpload(maxSizeBytes = 5 * 1024 * 1024) {
  const [preview, setPreview] = useState("");
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    setError(null);
    if (!file) return;
    if (file.size > maxSizeBytes) {
      setError("File is too large");
      return null;
    }
    try {
      const base64 = await fileToBase64(file);
      setPreview(base64);
      return base64;
    } catch (err) {
      setError("Failed to read file");
      console.error(err);
      return null;
    }
  };

  const clear = () => {
    setPreview("");
    setError(null);
  };

  return { preview, error, handleFile, clear, setPreview };
}
