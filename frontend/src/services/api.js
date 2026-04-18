import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post('http://localhost:8000/api/auth/refresh/', { refresh });
          localStorage.setItem('access_token', res.data.access);
          original.headers.Authorization = `Bearer ${res.data.access}`;
          return API(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ───── AUTH ─────
export const registerUser = (data) => API.post('/auth/register/', data);
export const loginUser = (data) => API.post('/auth/login/', data);

// ───── RESTAURANTS ─────
export const getRestaurants = (params) => API.get('/restaurants/', { params });
export const getRestaurant = (id) => API.get(`/restaurants/${id}/`);
export const getMenu = (restaurantId) => API.get(`/restaurants/${restaurantId}/menu/`);

// ───── ORDERS ─────
export const createOrder = (data) => API.post('/orders/create/', data);
export const getOrders = () => API.get('/orders/');
export const getOrder = (id) => API.get(`/orders/${id}/`);

// ───── COURIER ─────
export const getCourierLocation = (orderId) => API.get(`/courier/location/${orderId}/`);
export const updateCourierLocation = (data) => API.patch('/courier/location/', data);

export default API;