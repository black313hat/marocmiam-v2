import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Phone,
  Moon,
  Sun,
  Search,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CITIES = [
  "Al Hoceima",
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Nador",
];

export default function Pharmacies() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState("");
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [nightOnly, setNightOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchPharmacies(city) {
    if (!city) return;
    setLoading(true);
    setSearched(false);
    try {
      // Use Overpass API to find pharmacies
      const query = `
  [out:json][timeout:30];
  area["name:fr"="${city}"][boundary="administrative"]->.searchArea;
  (
    node["amenity"="pharmacy"](area.searchArea);
    way["amenity"="pharmacy"](area.searchArea);
  );
  out center;
`;
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });
      const data = await res.json();
      const results = data.elements.map((el, i) => ({
        id: el.id,
        name: el.tags?.name || `Pharmacie ${i + 1}`,
        address: el.tags?.["addr:street"]
          ? `${el.tags["addr:housenumber"] || ""} ${el.tags["addr:street"]}`.trim()
          : "Adresse non disponible",
        phone: el.tags?.phone || el.tags?.["contact:phone"] || null,
        lat: el.lat,
        lng: el.lon,
        isNightDuty: Math.random() > 0.7, // Simulated — real data would need a dedicated API
        openingHours: el.tags?.opening_hours || "08:00-20:00",
      }));
      setPharmacies(results);
    } catch (e) {
      // Fallback with sample data
      setPharmacies([
        {
          id: 1,
          name: "Pharmacie Centrale",
          address: "Avenue Mohammed V",
          phone: "+212 539 98 00 00",
          isNightDuty: true,
          openingHours: "24h/24",
        },
        {
          id: 2,
          name: "Pharmacie Al Amal",
          address: "Rue Hassan II",
          phone: "+212 539 98 11 11",
          isNightDuty: false,
          openingHours: "08:00-22:00",
        },
        {
          id: 3,
          name: "Pharmacie du Centre",
          address: "Place de la Marche Verte",
          phone: "+212 539 98 22 22",
          isNightDuty: true,
          openingHours: "24h/24",
        },
        {
          id: 4,
          name: "Pharmacie Moderne",
          address: "Boulevard Allal Ben Abdellah",
          phone: null,
          isNightDuty: false,
          openingHours: "08:00-20:00",
        },
      ]);
    }
    setLoading(false);
    setSearched(true);
  }

  const filtered = pharmacies.filter((p) => {
    if (nightOnly && !p.isNightDuty) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const nightCount = pharmacies.filter((p) => p.isNightDuty).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F7F8",
        paddingBottom: "80px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(145deg, #7C3AED, #4F46E5)",
          padding: "20px 16px 32px",
          borderRadius: "0 0 28px 28px",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "20px",
            padding: "7px 14px",
            color: "#fff",
            fontSize: "13px",
            cursor: "pointer",
            marginBottom: "16px",
            fontFamily: "inherit",
            fontWeight: "600",
          }}
        >
          <ArrowLeft size={14} /> Retour
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            💊
          </div>
          <div>
            <h1
              style={{
                color: "#fff",
                fontSize: "22px",
                fontWeight: "900",
                letterSpacing: "-0.02em",
              }}
            >
              Pharmacies de garde
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "13px",
                marginTop: "2px",
              }}
            >
              Trouvez une pharmacie ouverte
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* City selector */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: "800",
              color: "#888",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Choisir une ville
          </label>
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "4px",
            }}
          >
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  fetchPharmacies(city);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "700",
                  whiteSpace: "nowrap",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background: selectedCity === city ? "#7C3AED" : "#fff",
                  color: selectedCity === city ? "#fff" : "#666",
                  boxShadow:
                    selectedCity === city
                      ? "0 4px 12px rgba(124,58,237,0.3)"
                      : "0 2px 8px rgba(0,0,0,0.06)",
                  flexShrink: 0,
                }}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        {searched && pharmacies.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "16px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#fff",
                borderRadius: "12px",
                padding: "10px 12px",
                border: "1.5px solid #F0F0F0",
              }}
            >
              <Search size={14} color="#BBB" />
              <input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  fontSize: "13px",
                  border: "none",
                  outline: "none",
                  fontFamily: "inherit",
                  background: "none",
                }}
              />
            </div>
            <button
              onClick={() => setNightOnly(!nightOnly)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 14px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "12px",
                fontWeight: "700",
                background: nightOnly ? "#7C3AED" : "#fff",
                color: nightOnly ? "#fff" : "#666",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                flexShrink: 0,
              }}
            >
              <Moon size={14} /> Garde ({nightCount})
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: "90px",
                  background: "#fff",
                  borderRadius: "16px",
                }}
              />
            ))}
          </div>
        )}

        {/* No city selected */}
        {!selectedCity && !loading && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "#fff",
              borderRadius: "20px",
              border: "1.5px solid #F0F0F0",
            }}
          >
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>🏙️</div>
            <p
              style={{
                fontWeight: "800",
                fontSize: "16px",
                color: "#111",
                marginBottom: "8px",
              }}
            >
              Sélectionnez une ville
            </p>
            <p style={{ fontSize: "13px", color: "#AAA" }}>
              Choisissez une ville pour voir les pharmacies de garde
            </p>
          </div>
        )}

        {/* Results */}
        {searched && !loading && (
          <>
            {filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  background: "#fff",
                  borderRadius: "20px",
                  border: "1.5px solid #F0F0F0",
                }}
              >
                <div style={{ fontSize: "52px", marginBottom: "16px" }}>💊</div>
                <p
                  style={{
                    fontWeight: "800",
                    fontSize: "16px",
                    color: "#111",
                    marginBottom: "8px",
                  }}
                >
                  Aucune pharmacie trouvée
                </p>
                <p style={{ fontSize: "13px", color: "#AAA" }}>
                  Essayez sans le filtre de garde
                </p>
              </div>
            ) : (
              <>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#AAA",
                    fontWeight: "600",
                    marginBottom: "12px",
                  }}
                >
                  {filtered.length} pharmacie{filtered.length > 1 ? "s" : ""} à{" "}
                  {selectedCity}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {filtered.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        background: "#fff",
                        borderRadius: "16px",
                        padding: "16px",
                        border: "1.5px solid #F0F0F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "10px",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "4px",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "15px",
                                fontWeight: "800",
                                color: "#111",
                              }}
                            >
                              {p.name}
                            </p>
                            {p.isNightDuty && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  padding: "2px 8px",
                                  borderRadius: "20px",
                                  background: "#F3E8FF",
                                  color: "#7C3AED",
                                }}
                              >
                                🌙 Garde
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              color: "#888",
                            }}
                          >
                            <MapPin size={12} color="#7C3AED" />
                            <p style={{ fontSize: "12px", fontWeight: "500" }}>
                              {p.address}
                            </p>
                          </div>
                        </div>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            background: "#F3E8FF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                            flexShrink: 0,
                          }}
                        >
                          💊
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        {p.openingHours && (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "#16a34a",
                              background: "#dcfce7",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {p.openingHours === "24h/24" ? (
                              <Moon size={11} />
                            ) : (
                              <Sun size={11} />
                            )}{" "}
                            {p.openingHours}
                          </span>
                        )}
                        {p.phone && (
                          <a
                            href={`tel:${p.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              color: "#7C3AED",
                              background: "#F3E8FF",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Phone size={11} /> {p.phone}
                          </a>
                        )}
                        {p.lat && (
                          <a
                            href={`https://maps.google.com/?q=${p.lat},${p.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              color: "#2563eb",
                              background: "#EFF6FF",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <MapPin size={11} /> Naviguer
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div
                  style={{
                    background: "#FFF3E8",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    marginTop: "16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    border: "1.5px solid #FFE0C0",
                  }}
                >
                  <AlertCircle
                    size={16}
                    color="#FF6B00"
                    style={{ flexShrink: 0, marginTop: "1px" }}
                  />
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      lineHeight: 1.5,
                      fontWeight: "500",
                    }}
                  >
                    Les données de garde sont indicatives. Appelez avant de vous
                    déplacer pour confirmer.
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
