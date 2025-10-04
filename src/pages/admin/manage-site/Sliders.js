import React, { useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "./SlidersPage.css";

function SlidersPage() {
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [sliders, setSliders] = useState([
    {
      image: "https://via.placeholder.com/100x50?text=40%25+OFF",
      title: "40% OFF",
      homePage: "THEME2",
      details:
        "It is a long established fact that a reader will be distracted by the readable content",
    },
    {
      image: "https://via.placeholder.com/100x50?text=70%25+OFF",
      title: "70% OFF",
      homePage: "THEME1",
      details: "Women Clothing",
    },
    {
      image: "https://via.placeholder.com/100x50?text=50%25+OFF",
      title: "50% OFF",
      homePage: "THEME1",
      details: "Sleeve Party Dress",
    },
    {
      image: "https://via.placeholder.com/100x50?text=No+Image",
      title: "--",
      homePage: "THEME4",
      details: "--",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    image: "",
    title: "",
    homePage: "",
    details: "",
  });

  const handleOpenAdd = () => {
    setFormData({ image: "", title: "", homePage: "", details: "" });
    setEditIndex(null);
    setShowModal(true);
  };

  const handleOpenEdit = (index) => {
    setFormData(sliders[index]);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editIndex !== null) {
      const updated = [...sliders];
      updated[editIndex] = formData;
      setSliders(updated);
    } else {
      setSliders([...sliders, formData]);
    }
    setShowModal(false);
  };

  const handleDelete = (index) => {
    const updated = sliders.filter((_, i) => i !== index);
    setSliders(updated);
  };

  const filteredSliders = sliders.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.homePage.toLowerCase().includes(search.toLowerCase()) ||
      s.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="sliders-table-section">
        <div className="sliders-header">
          <div className="sliders-title">
            <h1>Sliders</h1>
            <p>Manage and customize your homepage sliders</p>
          </div>
          <div className="sliders-actions">
            <input
              type="text"
              placeholder="Search sliders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="slider-add-btn" onClick={handleOpenAdd}>
              <FaPlus /> Add
            </button>
          </div>
        </div>

        {/* <div className="slider-controls">
          <div className="slider-entries">
            Show{" "}
            <select
              value={entries}
              onChange={(e) => setEntries(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>{" "}
            entries
          </div>
        </div> */}

        <div className="slider-table-container">
          <table className="sliders-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Homepage</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSliders.slice(0, entries).map((slider, i) => (
                <tr key={i}>
                  <td>
                    <img
                      src={slider.image}
                      alt={slider.title || "Slider Image"}
                      className="slider-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/100x50?text=No+Image";
                      }}
                    />
                  </td>
                  <td>{slider.title}</td>
                  <td>{slider.homePage}</td>
                  <td>{slider.details}</td>
                  <td className="slider-actions">
                    <button
                      className="slider-edit"
                      onClick={() => handleOpenEdit(i)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="slider-delete"
                      onClick={() => handleDelete(i)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSliders.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="slider-modal">
            <div className="slider-modal-content">
              <h3>{editIndex !== null ? "Edit Slider" : "Add Slider"}</h3>

              <label htmlFor="slider-image">Image URL</label>
              <input
                id="slider-image"
                type="text"
                placeholder="Image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />

              <label htmlFor="slider-title">Title</label>
              <input
                id="slider-title"
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              <label htmlFor="slider-homepage">Home Page</label>
              <input
                id="slider-homepage"
                type="text"
                placeholder="Home Page"
                value={formData.homePage}
                onChange={(e) =>
                  setFormData({ ...formData, homePage: e.target.value })
                }
              />

              <label htmlFor="slider-details">Details</label>
              <textarea
                id="slider-details"
                placeholder="Details"
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
              />

              <div className="slider-modal-buttons">
                <button onClick={handleSave}>
                  {editIndex !== null ? "Update" : "Save"}
                </button>
                <button onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default SlidersPage;
