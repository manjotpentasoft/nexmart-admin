import { db } from "../../firebase/firebaseConfig.js";
import { collection, addDoc } from "firebase/firestore";

const products = [
  {
    name: "Sony Bluetooth-compatible Speaker Extra",
    category: "Music",
    brand: "Sony",
    price: 45.99,
    oldPrice: null,
    stock: "In Stock",
    productType: "physical",
    image: "./assets/images/shop/shop-13.png",
    rating: 2,
    reviewsCount: 19,
    salesCount: 120,
    description: "High-quality Bluetooth-compatible speaker with extra bass and portable design.",
    createdAt: new Date()
  },
  {
    name: "Sharp Full Auto Front Loading Inverter Washing Machine ES-FW105D7PS",
    category: "Front-load Washing Machines",
    brand: "Toshiba",
    price: 500.99,
    oldPrice: null,
    stock: "In Stock",
    productType: "physical",
    image: "./assets/images/shop/shop-1.png",
    rating: 4,
    reviewsCount: 19,
    salesCount: 75,
    description: "Spacious front-loading washing machine with multiple wash cycles and energy-efficient motor.",
    createdAt: new Date()
  },
  {
    "name": "Apple AirPods Pro 2nd Generation",
    "category": "Audio",
    "brand": "Apple",
    "price": 249.99,
    "oldPrice": 299.99,
    "stock": "In Stock",
    "productType": "physical",
    "image": "./assets/images/shop/shop-2.png",
    "rating": 5,
    "reviewsCount": 120,
    "salesCount": 200,
    "description": "Noise-cancelling true wireless earbuds with immersive sound quality.",
    "createdAt": "2025-10-08T12:00:00.000Z"
  },
  {
    "name": "Samsung 65-inch 4K Smart TV",
    "category": "TV & Video",
    "brand": "Samsung",
    "price": 799.99,
    "oldPrice": 899.99,
    "stock": "In Stock",
    "productType": "physical",
    "image": "./assets/images/shop/shop-3.png",
    "rating": 4,
    "reviewsCount": 54,
    "salesCount": 150,
    "description": "Ultra HD 4K Smart TV with HDR support and built-in streaming apps.",
    "createdAt": "2025-10-08T12:00:00.000Z"
  },
  {
    "name": "Fitbit Charge 6 Fitness Tracker",
    "category": "Watch",
    "brand": "Fitbit",
    "price": 149.99,
    "oldPrice": null,
    "stock": "In Stock",
    "productType": "physical",
    "image": "./assets/images/shop/shop-4.png",
    "rating": 3,
    "reviewsCount": 32,
    "salesCount": 90,
    "description": "Track your daily activity, heart rate, and sleep quality with this advanced fitness tracker.",
    "createdAt": "2025-10-08T12:00:00.000Z"
  }
];

const seedProducts = async () => {
  const colRef = collection(db, "products"); 
  for (const product of products) {
    await addDoc(colRef, product);
  }
};

export default seedProducts;