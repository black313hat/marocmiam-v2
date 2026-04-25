import { useEffect, useRef, useState } from 'react';
import API from '../services/api';

export default function LiveCourierMap({ orderId, deliveryLat, deliveryLng, restaurantLat, restaurantLng }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const courierMarkerRef = useRef(null);
  const [courierPos, setCourierPos] = useState(null);
  const [eta, setEta] = useState(null);

  useEffect(() => {
    loadMap();
    // Poll courier location every 8 seconds
    const interval = setInterval(fetchCourierLocation, 8000);
    fetchCourierLocation();
    return () => {
      clearInterval(interval);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [orderId]);

  async function fetchCourierLocation() {
    try {
      const res = await API.get(`/courier/location/${orderId}/`);
      if (res.data?.lat && res.data?.lng) {
        setCourierPos({ lat: res.data.lat, lng: res.data.lng });
        updateCourierMarker(res.data.lat, res.data.lng);
        // Calculate rough ETA
        if (deliveryLat && deliveryLng) {
          const dist = getDistance(res.data.lat, res.data.lng, deliveryLat, deliveryLng);
          setEta(Math.max(2, Math.round(dist * 3))); // ~3 min per km
        }
      }
    } catch { }
  }

  function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function loadMap() {
    const L = window.L;
    if (!L) {
      // Load Leaflet dynamically
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }

  function initMap() {
    if (!mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    const centerLat = deliveryLat || 35.2517;
    const centerLng = deliveryLng || -3.9372;

    const map = L.map(mapRef.current, { center: [centerLat, centerLng], zoom: 14, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    // Delivery destination marker
    if (deliveryLat && deliveryLng) {
      const destIcon = L.divIcon({
        html: `<div style="width:36px;height:36px;background:#3b82f6;border-radius:50%;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:16px;">🏠</div>`,
        iconSize: [36, 36], iconAnchor: [18, 18], className: '',
      });
      L.marker([deliveryLat, deliveryLng], { icon: destIcon }).addTo(map).bindPopup('Votre adresse');
    }

    // Restaurant marker
    if (restaurantLat && restaurantLng) {
      const restIcon = L.divIcon({
        html: `<div style="width:36px;height:36px;background:#FF6B00;border-radius:50%;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:16px;">🍽️</div>`,
        iconSize: [36, 36], iconAnchor: [18, 18], className: '',
      });
      L.marker([restaurantLat, restaurantLng], { icon: restIcon }).addTo(map).bindPopup('Restaurant');
    }

    mapInstanceRef.current = map;
  }

  function updateCourierMarker(lat, lng) {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    const courierIcon = L.divIcon({
      html: `
        <div style="position:relative;width:48px;height:48px;">
          <div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(16,185,129,0.2);animation:livepulse 2s ease-out infinite;"></div>
          <div style="width:48px;height:48px;border-radius:50%;background:#10b981;border:3px solid #fff;box-shadow:0 4px 16px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:20px;position:relative;z-index:1;">🛵</div>
        </div>
        <style>@keyframes livepulse{0%{transform:scale(0.7);opacity:0.9}70%{transform:scale(1.6);opacity:0}100%{transform:scale(1.6);opacity:0}}</style>
      `,
      iconSize: [48, 48], iconAnchor: [24, 24], className: '',
    });

    if (courierMarkerRef.current) {
      courierMarkerRef.current.setLatLng([lat, lng]);
    } else {
      courierMarkerRef.current = L.marker([lat, lng], { icon: courierIcon }).addTo(mapInstanceRef.current).bindPopup('Votre livreur');
      mapInstanceRef.current.setView([lat, lng], 15);
    }
  }

  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #F0F0F0' }}>
      {/* ETA bar */}
      {eta && (
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', animation: 'pulse 1s infinite' }} />
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>🛵 Livreur en route</span>
          </div>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>~{eta} min</span>
        </div>
      )}
      {!eta && (
        <div style={{ background: '#F9F9F9', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1s infinite' }} />
          <span style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>Localisation du livreur en cours...</span>
        </div>
      )}
      {/* Map */}
      <div ref={mapRef} style={{ height: '220px', width: '100%' }} />
    </div>
  );
}
