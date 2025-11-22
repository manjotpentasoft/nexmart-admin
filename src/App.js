import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import OrdersPage from "./pages/admin/Orders";
import ProductsPage from "./pages/admin/manage-products/Products";
import BrandsPage from "./pages/admin/manage-products/Brands";
import AddProductPage from "./pages/admin/manage-products/add-product/page";
import CreateDigitalProduct from "./pages/admin/manage-products/add-product/DigitalProduct";
import CreatePhysicalProduct from "./pages/admin/manage-products/add-product/PhysicalProduct";
import StockOutProductsPage from "./pages/admin/manage-products/StockOutProductsPage";
import CategoriesPage from "./pages/admin/categories-manage/Categories";
import SubCategoriesPage from "./pages/admin/categories-manage/SubCategories";
import CouponsPage from "./pages/admin/ecommerce/CouponsPage";
import ShippingPage from "./pages/admin/ecommerce/ShippingPage";
import StateChargePage from "./pages/admin/ecommerce/StateChargePage";
import TaxPage from "./pages/admin/ecommerce/TaxPage";
import CurrencyPage from "./pages/admin/ecommerce/CurrencyPage";
import CustomersListPage from "./pages/admin/CustomerListPage";
import CustomerDetailsPage from "./pages/admin/CustomerDetailsPage";
import MyProfile from "./pages/admin/profile/MyProfile";
import ChangePassword from "./pages/admin/profile/ChangePassword";
import NotificationsPage from "./pages/admin/Notifications";
import SlidersPage from "./pages/admin/manage-site/Sliders";
import ManagePages from "./pages/admin/ManagePages";
import ContactsPage from "./pages/admin/ContactsPage";
import OrderInvoice from "./components/OrderInvoice";

// User Pages
import HomePage from "./pages/home/HomePage";
import ShopPage from "./pages/home/ShopPage";
import ProductView from "./pages/home/ProductView";
import CartPage from "./pages/home/CartPage";
import WishlistPage from "./pages/home/WishlistPage";
import CheckoutPage from "./pages/home/CheckoutPage";
import UserAccountPage from "./pages/home/UserAccountPage";
import AboutPage from "./pages/home/AboutPage";
import ContactPage from "./pages/home/ContactPage";

// Auth Pages
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage";
import CategoryPage from "./pages/home/CategoryPage";

// Environment variable for admin UID
const ADMIN_UID = process.env.REACT_APP_ADMIN_UID;

// Central AppRoutes Component
function AppRoutes() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  return user.uid === ADMIN_UID ? <AdminPanel /> : <UserPanel />;
}

function AdminPanel() {
  return (
    <SidebarProvider>
      <Routes>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<OrdersPage />} />
        <Route path="/admin/orders/:orderId" element={<OrderInvoice />} />
        <Route path="/admin/products" element={<ProductsPage />} />
        <Route path="/admin/brand" element={<BrandsPage />} />
        <Route path="/admin/create" element={<AddProductPage />} />
        <Route path="/admin/create/physical" element={<CreatePhysicalProduct />} />
        <Route path="/admin/create/digital" element={<CreateDigitalProduct />} />
        <Route path="/admin/stock/out/product" element={<StockOutProductsPage />} />
        <Route path="/admin/categories" element={<CategoriesPage />} />
        <Route path="/admin/subcategories" element={<SubCategoriesPage />} />
        <Route path="/admin/coupons" element={<CouponsPage />} />
        <Route path="/admin/shipping" element={<ShippingPage />} />
        <Route path="/admin/state-charge" element={<StateChargePage />} />
        <Route path="/admin/currency" element={<CurrencyPage />} />
        <Route path="/admin/tax" element={<TaxPage />} />
        <Route path="/admin/customers" element={<CustomersListPage />} />
        <Route path="/admin/customers/:id" element={<CustomerDetailsPage />} />
        <Route path="/admin/profile" element={<MyProfile />} />
        <Route path="/admin/change-password" element={<ChangePassword />} />
        <Route path="/admin/notifications" element={<NotificationsPage />} />
        <Route path="/admin/sliders" element={<SlidersPage />} />
        <Route path="/admin/pages" element={<ManagePages />} />
        <Route path="/admin/contacts" element={<ContactsPage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" />} />
      </Routes>
    </SidebarProvider>
  );
}

function UserPanel() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/category/:id" element={<CategoryPage />} />
      <Route path="/product/view/:productId" element={<ProductView />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/account" element={<UserAccountPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Private/Admin/User Routes */}
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
