import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home/Home';
import Restaurant from './pages/Restaurant/Restaurant';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Login from './pages/Login/Login';
import Orders from './pages/Orders/Orders';
import RestaurantDashboard from './pages/Restaurant/RestaurantDashboard';
import CourierDashboard from './pages/Courier/CourierDashboard';
import Profile from './pages/Profile/Profile';
import Restaurants from './pages/Restaurants/Restaurants';
import AdminApp from './pages/Admin/AdminApp';
import ApplyRestaurant from './pages/Apply/ApplyRestaurant';
import ApplyCourier from './pages/Apply/ApplyCourier';
import CourierApp from './pages/CourierApp/CourierApp';
import RestaurantOwnerApp from './pages/RestaurantOwner/RestaurantOwnerApp';

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
        <Route path="/admin-panel" element={<AdminApp />} />
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
          <Route path="/apply/restaurant" element={<ApplyRestaurant />} />
          <Route path="/apply/courier" element={<ApplyCourier />} />
          <Route path="/courier-app" element={<PrivateRoute><CourierApp /></PrivateRoute>} />
          <Route path="/restaurant-owner" element={<PrivateRoute><RestaurantOwnerApp /></PrivateRoute>} />
        </Route>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
       
      </Routes>
    </BrowserRouter>
  );
}