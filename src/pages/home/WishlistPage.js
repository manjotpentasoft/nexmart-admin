import React, { useEffect, useState } from "react";
import "../../styles/home/WishlistPage.css";
import Header from "../../components/home/Header";
import HighlightsSection from "../../components/home/HighlightSection";
import Footer from "../../components/home/Footer";
import PopularProducts from "../../components/home/popularProducts";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  fetchWishlist,
  removeFromWishlist,
  subscribeToWishlist,
} from "../../firebase/wishlistService";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/CartSlice";
import { useNavigate } from "react-router-dom";
import { FaEye, FaShoppingCart } from "react-icons/fa";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const auth = getAuth();
  const [userId, setUserId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch wishlist when userId changes
  useEffect(() => {
    if (!userId) return;
    fetchWishlist(userId).then(setWishlist);
    const unsub = subscribeToWishlist(userId, setWishlist);
    return () => unsub();
  }, [userId]);

  const handleRemove = async (id) => {
    if (!userId) return;
    await removeFromWishlist(userId, id);
  };

  const handleAddToCart = async (product) => {
    if (!userId || !product?.id) return;
    try {
      await dispatch(addToCart(userId, product));
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const handleView = (id) => navigate(`/product/view/${id}`);

  return (
    <>
      <Header />
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
                        <img src={item.image} alt={item.name} />
                      </div>
                    </td>
                    <td className="wishlist-name">{item.name}</td>
                    <td className="wishlist-price">${item.price}</td>
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
                        onClick={() => handleView(item.id)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="wishlist-cart-btn"
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
      <PopularProducts />
      <HighlightsSection />
      <Footer />
    </>
  );
};

export default WishlistPage;
