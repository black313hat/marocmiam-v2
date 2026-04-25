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
import Profile from './pages/Profile/Profile';
import Restaurants from './pages/Restaurants/Restaurants';
import AdminApp from './pages/Admin/AdminApp';
import ApplyRestaurant from './pages/Apply/ApplyRestaurant';
import ApplyCourier from './pages/Apply/ApplyCourier';
import CourierApp from './pages/CourierApp/CourierApp';
import RestaurantOwnerApp from './pages/RestaurantOwner/RestaurantOwnerApp';
import Search from './pages/Search/Search';
import Pharmacies from './pages/Pharmacies/Pharmacies';
import Favorites from './pages/Favorites/Favorites';


const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif' } }} />
      <Routes>
        <Route path="/admin-panel" element={<AdminApp />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurant/:id" element={<Restaurant />} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/apply/restaurant" element={<ApplyRestaurant />} />
          <Route path="/apply/courier" element={<ApplyCourier />} />
          <Route path="/courier-app" element={<PrivateRoute><CourierApp /></PrivateRoute>} />
          <Route path="/restaurant-owner" element={<PrivateRoute><RestaurantOwnerApp /></PrivateRoute>} />
          <Route path="/restaurant-dashboard" element={<Navigate to="/restaurant-owner" />} />
          <Route path="/courier-dashboard" element={<Navigate to="/courier-app" />} />
          // Add inside Routes:
          <Route path="/search" element={<Search />} />
          <Route path="/pharmacies" element={<Pharmacies />} />
          <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}