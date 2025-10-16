import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "../../styles/home/ProductView.css";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer"
import { FaHeart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/CartSlice";

export default function ProductView() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const dispatch = useDispatch();

  const displayText = (item) => {
    if (!item) return "";
    if (typeof item === "string" || typeof item === "number") return item;
    if (typeof item === "object") {
      if ("value" in item) return item.value;
      if ("url" in item) return item.url;
      return JSON.stringify(item);
    }
    return String(item);
  };

  const getImageUrl = (img) => {
    if (!img) return "/placeholder.png";
    if (typeof img === "string") return img;
    if (typeof img === "object" && img.url) return img.url;
    return "/placeholder.png";
  };

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        const docSnap = await getDoc(doc(db, "products", productId));
        if (docSnap.exists()) {
          const data = docSnap.data();

          const sizesArr = Array.isArray(data.sizes)
            ? data.sizes
            : data.size
            ? [data.size]
            : [];
          setSelectedSize(displayText(sizesArr[0]) || "");

          // Ensure main image is first
          const mainImage = data.image ? [data.image] : [];
          const galleryImages = Array.isArray(data.galleryImages)
            ? data.galleryImages.filter((img) => img !== data.image)
            : [];

          setProduct({
            id: docSnap.id, // important for Redux
            ...data,
            images: [...mainImage, ...galleryImages],
            colors: Array.isArray(data.color)
              ? data.color
              : data.color
              ? [data.color]
              : [],
            sizes: sizesArr,
            tags: Array.isArray(data.tags)
              ? data.tags
              : data.tags
              ? [data.tags]
              : [],
            specifications: Array.isArray(data.specifications)
              ? data.specifications
              : [],
            features: Array.isArray(data.features) ? data.features : [],
          });
        } else {
          console.error("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    }
    fetchProduct();
  }, [productId]);

  // Auto slideshow for gallery thumbnails
  useEffect(() => {
    if (!product?.images || product.images.length <= 1) return;
    const interval = setInterval(() => {
      setImgIdx((prev) => (prev + 1) % product.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [product]);

  // Fetch category name
  useEffect(() => {
    async function fetchCategory() {
      if (!product?.category) return;
      try {
        const catSnap = await getDoc(doc(db, "categories", product.category));
        if (catSnap.exists()) setCategoryName(catSnap.data().name || "");
      } catch (err) {
        console.error("Error fetching category:", err);
      }
    }
    fetchCategory();
  }, [product]);

  if (!product) return <div className="loader"></div>;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product.id,
        name: displayText(product.name),
        price: parseFloat(product.price || 0),
        image: getImageUrl(product.images[0]), // always main image
        quantity, // selected quantity
        color: product.colors[selectedColor] || "",
        size: selectedSize,
      })
    );
    setQuantity(1); // reset quantity after adding
  };

  return (
    <>
      <Header />
      <div className="pv-root">
        <div className="pv-breadcrumbs">Home &nbsp;–&nbsp; Shop Details</div>

        <div className="pv-main">
          {/* Gallery */}
          <div className="pv-gallery">
            <div className="pv-thumbs">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={getImageUrl(img)}
                  alt={`Thumbnail ${idx}`}
                  className={`pv-thumb${imgIdx === idx ? " selected" : ""}`}
                  onClick={() => setImgIdx(idx)}
                />
              ))}
            </div>
            <div className="pv-img-box">
              <img
                src={getImageUrl(product.images[imgIdx])}
                alt={displayText(product.name)}
                className="pv-main-img-large" // increase in CSS
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="pv-details">
            {categoryName && <div className="pv-cat">{categoryName}</div>}
            <h1 className="pv-title">{displayText(product.name)}</h1>

            <div className="pv-price">
              ₹{parseFloat(product.price || 0).toFixed(2)}
              {product.previousPrice &&
                product.previousPrice !== product.price && (
                  <span className="pv-prev-price">
                    {" "}
                    ${parseFloat(product.previousPrice).toFixed(2)}
                  </span>
                )}
            </div>

            {product.shortDescription && (
              <div className="pv-desc">{displayText(product.shortDescription)}</div>
            )}

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="pv-colors">
                <span>Color*</span>
                {product.colors.map((c, i) => (
                  <span
                    key={i}
                    className={`pv-color-dot${selectedColor === i ? " selected" : ""}`}
                    style={{ background: displayText(c) }}
                    onClick={() => setSelectedColor(i)}
                  ></span>
                ))}
              </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className="pv-sizes">
                <span>Size*</span>
                {product.sizes.map((sz, i) => (
                  <button
                    key={i}
                    className={`pv-size-btn${
                      selectedSize === displayText(sz) ? " selected" : ""
                    }`}
                    onClick={() => setSelectedSize(displayText(sz))}
                  >
                    {displayText(sz)}
                  </button>
                ))}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="pv-cart-row">
              <button
                className="pv-qty-btn pv-minus"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span className="pv-qty-label">{quantity}</span>
              <button
                className="pv-qty-btn pv-plus"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
              <button className="pv-add-btn" onClick={handleAddToCart}>
                Add To Cart
              </button>
              <span className="pv-wishlist-btn">
                <FaHeart />
              </span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
