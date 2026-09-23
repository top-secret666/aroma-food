import { Provider } from "react-redux"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import RoleRoute from "./components/RoleRoute"
import { useAuthBootstrap } from "./hooks/useAuthBootstrap"
import AdminRestaurantsPage from "./pages/AdminRestaurantsPage"
import AdminUsersPage from "./pages/AdminUsersPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/login/LoginPage"
import OrderDetailPage from "./pages/OrderDetailPage"
import OrdersPage from "./pages/OrdersPage"
import ProfilePage from "./pages/ProfilePage"
import RegisterPage from "./pages/RegisterPage"
import RestaurantPage from "./pages/RestaurantPage"
import { store } from "./store/store"
import "./App.css"

function AppRoutes() {
  useAuthBootstrap()

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      <Route
        path="/restaurants/:id"
        element={
          <Layout>
            <RestaurantPage />
          </Layout>
        }
      />
      <Route
        path="/cart"
        element={
          <Layout>
            <CartPage />
          </Layout>
        }
      />
      <Route
        path="/checkout"
        element={
          <Layout>
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/orders"
        element={
          <Layout>
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/manager/orders"
        element={
          <Layout>
            <RoleRoute allow={["MANAGER", "ADMIN"]}>
              <OrdersPage desk />
            </RoleRoute>
          </Layout>
        }
      />
      <Route
        path="/admin/users"
        element={
          <Layout>
            <RoleRoute allow={["ADMIN"]}>
              <AdminUsersPage />
            </RoleRoute>
          </Layout>
        }
      />
      <Route
        path="/admin/restaurants"
        element={
          <Layout>
            <RoleRoute allow={["ADMIN"]}>
              <AdminRestaurantsPage />
            </RoleRoute>
          </Layout>
        }
      />
      <Route
        path="/admin"
        element={<Navigate to="/admin/users" replace />}
      />
      <Route
        path="/orders/:id"
        element={
          <Layout>
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/profile"
        element={
          <Layout>
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/login"
        element={
          <Layout bare>
            <LoginPage />
          </Layout>
        }
      />
      <Route
        path="/register"
        element={
          <Layout bare>
            <RegisterPage />
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter basename={process.env.PUBLIC_URL || ""}>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  )
}
