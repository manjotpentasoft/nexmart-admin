import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProductsPage from "./pages/admin/manage-products/Products";
import OrdersPage from "./pages/admin/Orders";
import AdminDashboard from "./pages/admin/Dashboard";
import CategoriesPage from "./pages/admin/categories-manage/Categories";
import { SidebarProvider } from "./contexts/SidebarContext";
import MyProfile from "./pages/admin/profile/MyProfile";
import NotificationsPage from "./pages/admin/Notifications";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/LoginPage";
import SubCategoriesPage from "./pages/admin/categories-manage/SubCategories";
import BrandsPage from "./pages/admin/manage-products/Brands";
import AddProductPage from "./pages/admin/manage-products/add-product/page";
import CreateDigitalProduct from "./pages/admin/manage-products/add-product/PhysicalProduct";
import CreatePhysicalProduct from "./pages/admin/manage-products/add-product/PhysicalProduct";
import StockOutProductsPage from "./pages/admin/manage-products/StockOutProductsPage";
import ChangePassword from "./pages/admin/profile/ChangePassword";
import OrderInvoice from "./components/OrderInvoice";
import CouponsPage from "./pages/admin/ecommerce/CouponsPage";
import ShippingPage from "./pages/admin/ecommerce/ShippingPage";
import StateChargePage from "./pages/admin/ecommerce/StateChargePage";
import TaxPage from "./pages/admin/ecommerce/TaxPage";
import CurrencyPage from "./pages/admin/ecommerce/CurrencyPage";
import CustomersListPage from "./pages/admin/CustomerListPage";
import CustomerDetailsPage from "./pages/admin/CustomerDetailsPage";
import Signup from "./pages/SignupPage";
import PublicRoute from "./components/PublicRoute";
import ManagePages from "./pages/admin/ManagePages";
import SlidersPage from "./pages/admin/manage-site/Sliders";

export default function App() {
  return (
    <div className="App">
      {/* <AuthProvider> */}
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route
              path="/dashboard"
              element={
                  <PrivateRoute>
                <AdminDashboard />
                  </PrivateRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                  <PrivateRoute>
                  <OrdersPage />
                  </PrivateRoute>
              }
            />
            <Route
              path="/admin/orders/invoice/:orderId"
              element={<OrderInvoice />}
            />
            <Route
              path="/admin/products"
              element={
                  <PrivateRoute>
                <ProductsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/brand"
              element={
                  <PrivateRoute>
                <BrandsPage />
                  </PrivateRoute>
              }
            />
            <Route
              path="/admin/create"
              element={
                  <PrivateRoute>
                <AddProductPage />
                 </PrivateRoute>
              }
            />
            <Route
              path="/admin/create/physical"
              element={
                  <PrivateRoute>
                <CreatePhysicalProduct />
                  </PrivateRoute>
              }
            />
            <Route
              path="/admin/create/digital"
              element={
                  <PrivateRoute>
                <CreateDigitalProduct />
                  </PrivateRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                  <PrivateRoute>
                <ProductsPage />
                  </PrivateRoute>
              }
            />
            <Route
              path="/admin/stock/out/product"
              element={
                  <PrivateRoute>
                <StockOutProductsPage />
                  </PrivateRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                  <PrivateRoute>
                <CategoriesPage />
                  </PrivateRoute>
              }
            />
            <Route
              path="/admin/subcategories"
              element={
                  <PrivateRoute>
                <SubCategoriesPage />
                  </PrivateRoute>
              }
            />
            <Route 
              path="/admin/coupons"
              element={
                  <PrivateRoute>
                <CouponsPage />
                  </PrivateRoute>
              }
            />
            <Route
              path="/admin/shipping"
              element={
                  <PrivateRoute>
                <ShippingPage />
                  </PrivateRoute>
              }
            />
            <Route
              path="/admin/state-charge"
              element={
                  <PrivateRoute>
                <StateChargePage />
                  </PrivateRoute>
              }
            />
            <Route path="/admin/currency" element={<CurrencyPage />} />
            <Route
            path="/admin/tax"
            element={
                <PrivateRoute>
              <TaxPage />
                </PrivateRoute>
            }
            />
            <Route
              path="/admin/customers"
              element={
                  <PrivateRoute>
                <CustomersListPage />
                  </PrivateRoute>
              }
            />
            <Route path="/admin/customers/:id" element={<CustomerDetailsPage />} />
            <Route
              path="/admin/profile"
              element={
                  <PrivateRoute>
                <MyProfile />
                  </PrivateRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                  <PrivateRoute>
                <NotificationsPage />
                  </PrivateRoute>
              }
            />
            <Route
              path="/admin/change-password"
              element={
                  <PrivateRoute>
                <ChangePassword />
                  </PrivateRoute>
              }
            />
            <Route
              path="/admin/sliders"
              element={
                  <PrivateRoute>
                <SlidersPage />
                  </PrivateRoute>
              }
            />
            <Route
              path="/admin/pages"
              element={
                  <PrivateRoute>
                <ManagePages />
                  </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
      {/* </AuthProvider> */}
    </div>
  );
}
