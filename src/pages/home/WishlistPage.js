import React, { useEffect, useState } from "react";
import "../../styles/home/WishlistPage.css";
import { auth } from "../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  loadWishlistFromFirestore,
  saveWishlistItem,
  removeWishlistItem,
  subscribeToWishlist,
} from "../../firebase/wishlistService";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/CartSlice";
import { useNavigate } from "react-router-dom";
import { FaEye, FaShoppingCart } from "react-icons/fa";
import { toast } from "react-toastify";

const WishlistPage = ({ userId: propUserId }) => {
  const [wishlist, setWishlist] = useState([]);
  const [userId, setUserId] = useState(propUserId || null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Detect user from props or auth
  useEffect(() => {
    if (propUserId) {
      setUserId(propUserId);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, [propUserId]);

  // Fetch + subscribe to wishlist
  useEffect(() => {
    if (!userId) {
      setWishlist([]);
      return;
    }

    loadWishlistFromFirestore(userId).then(setWishlist);
    const unsub = subscribeToWishlist(userId, setWishlist);
    return () => unsub && unsub();
  }, [userId]);  

  // Remove explicitly
  const handleRemove = async (id) => {
    if (!userId) return toast.error("Login required!");
    try {
      await removeWishlistItem(userId, id);
      toast.info("Item removed from wishlist");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  // Add to cart and remove from wishlist
  const handleAddToCart = async (product) => {
    if (!userId || !product?.id)
      return toast.error("Please log in to add items to your cart.");

    try {
      await dispatch(addToCart(userId, { ...product, quantity: 1 }));
      toast.success(`${product.name} added to cart!`);
      await removeWishlistItem(userId, product.id);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add item to cart. Please try again.");
    }
  };

  // Navigate to product view
  const handleView = (id) => navigate(`/product/view/${id}`);

  return (
    <div className="wishlist-wrapper">
      <h2 className="wishlist-title">My Wishlist</h2>

      <div className="wishlist-container">
        {wishlist.length === 0 ? (
          <div className="wishlist-empty">Your wishlist is empty.</div>
        ) : (
          <table className="wishlist-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Name</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {wishlist.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="wishlist-imgbox">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                      />
                    </div>
                  </td>
                  <td className="wishlist-name">{item.name}</td>
                  <td className="wishlist-price">
                    ₹{item.price?.toLocaleString() || 0}
                  </td>
                  <td>
                    <span
                      className={
                        item.inStock
                          ? "wishlist-badge instock"
                          : "wishlist-badge outstock"
                      }
                    >
                      {item.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="wishlist-actions">
                    <button
                      className="wishlist-view-btn"
                      title="View product"
                      onClick={() => handleView(item.id)}
                    >
                      <FaEye />
                    </button>

                    <button
                      className="wishlist-cart-btn"
                      title="Add to cart"
                      onClick={() => handleAddToCart(item)}
                    >
                      <FaShoppingCart />
                    </button>

                    <button
                      className="wishlist-remove-btn"
                      title="Remove item"
                      onClick={() => handleRemove(item.id)}
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
