import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home/Home';
import Restaurant from './pages/Restaurant/Restaurant';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Login from './pages/Login/Login';
import Orders from './pages/Orders/Orders';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminRestaurants from './pages/Admin/AdminRestaurants';
import AdminCouriers from './pages/Admin/AdminCouriers';
import AdminOrders from './pages/Admin/AdminOrders';
import RestaurantDashboard from './pages/Restaurant/RestaurantDashboard';
import CourierDashboard from './pages/Courier/CourierDashboard';
import Profile from './pages/Profile/Profile';
import Restaurants from './pages/Restaurants/Restaurants';
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!user.is_staff && !user.is_superuser) return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif' } }} />
      <Routes>
        {/* Customer routes with bottom nav */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<Restaurant />} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/restaurant-dashboard" element={<PrivateRoute><RestaurantDashboard /></PrivateRoute>} />
          <Route path="/courier-dashboard" element={<PrivateRoute><CourierDashboard /></PrivateRoute>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/restaurants" element={<Restaurants />} />
        </Route>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        {/* Admin routes with sidebar */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/restaurants" element={<AdminRestaurants />} />
          <Route path="/admin/couriers" element={<AdminCouriers />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}