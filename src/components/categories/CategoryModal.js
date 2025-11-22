import React, { useEffect, useState } from "react";

export default function CategoryModal({
  title,
  initial = {},
  imagePreview = "",
  onImageChange,
  onSubmit,
  onClose,
  children,
}) {
  const [name, setName] = useState(initial.name || "");
  const [status, setStatus] = useState(initial.status || "enabled");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initial.name !== undefined) setName(initial.name);
    if (initial.status !== undefined) setStatus(initial.status);
  }, [initial.name, initial.status]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    onClose();

    try {
      await onSubmit({ name: name.trim(), status });
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>

        {children}

        <div className="form-group">
          <label>Name:</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name..."
          />
        </div>

        <div className="form-group">
          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <div className="form-group">
          <label>Image:</label>
          <input type="file" accept="image/*" onChange={onImageChange} />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : title.includes("Add")
              ? "Add"
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
