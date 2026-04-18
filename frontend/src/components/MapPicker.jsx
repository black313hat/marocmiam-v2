import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader } from 'lucide-react';

export default function MapPicker({ onSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ lat: 35.2517, lng: -3.9372 }); // Al Hoceima

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const L = window.L;
    if (!L) {
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

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  function initMap() {
    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap ©CartoDB',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="
        width:36px;height:36px;border-radius:50% 50% 50% 0;
        background:var(--primary);transform:rotate(-45deg);
        border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      className: '',
    });

    const marker = L.marker([coords.lat, coords.lng], { icon, draggable: true }).addTo(map);
    markerRef.current = marker;
    mapInstanceRef.current = map;

    reverseGeocode(coords.lat, coords.lng);

    marker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng();
      setCoords({ lat, lng });
      reverseGeocode(lat, lng);
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setCoords({ lat, lng });
      reverseGeocode(lat, lng);
    });
  }

  async function reverseGeocode(lat, lng) {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      const short = [
        data.address?.road,
        data.address?.suburb,
        data.address?.city || data.address?.town,
      ].filter(Boolean).join(', ') || addr;
      setAddress(short);
      onSelect({ lat, lng, address: short });
    } catch {
      const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(fallback);
      onSelect({ lat, lng, address: fallback });
    }
    setLoading(false);
  }

  function locateMe() {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        mapInstanceRef.current?.setView([lat, lng], 16);
        markerRef.current?.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
      },
      () => setLoading(false)
    );
  }

  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* Map */}
      <div ref={mapRef} style={{ height: '240px', width: '100%' }} />

      {/* Address bar */}
      <div style={{
        background: '#fff', padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: '10px',
        borderTop: '1px solid var(--border)',
      }}>
        <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '13px', color: 'var(--foreground)', flex: 1, fontWeight: '500' }}>
          {loading ? 'Getting address...' : address || 'Tap on the map to select location'}
        </span>
        <button onClick={locateMe} style={{
          fontSize: '11px', fontWeight: '700', color: 'var(--primary)',
          background: 'var(--primary-light)', padding: '4px 10px', borderRadius: '8px',
          flexShrink: 0,
        }}>
          📍 Me
        </button>
      </div>
    </div>
  );
}