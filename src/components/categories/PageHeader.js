import React from "react";
import { FaPlus } from "react-icons/fa";

export default function PageHeader({ title, subtitle, onAdd, addLabel = "Add" }) {
  return (
    <div className="categories-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="categories-controls">
        <div className="categories-search-container"></div>
        {onAdd && (
          <button className="add-category-btn" onClick={onAdd}>
            <FaPlus style={{ marginRight: "8px" }} />
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}
