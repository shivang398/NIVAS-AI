import { useState, useEffect } from 'react';
import { Search, Filter, Map as MapIcon, LayoutGrid, X, SlidersHorizontal } from 'lucide-react';
import axios from 'axios';
import PropertyCard from '../components/PropertyCard';
import { parseDescription } from '../utils/propertyParser';
import './Properties.css';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid or map
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedBeds, setSelectedBeds] = useState("any");
  const [selectedBaths, setSelectedBaths] = useState("any");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch real data from backend
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get('/properties');
        if (res.data.success) {
          setProperties(res.data.data);
          // Set max price dynamically
          const maxPrice = Math.max(...res.data.data.map(p => p.price), 100000);
          setPriceRange([0, maxPrice]);
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  const maxPriceInData = properties.length > 0 ? Math.max(...properties.map(p => p.price)) : 100000;

  const filteredProperties = properties
    .filter(prop => {
      // Search filter
      const matchesSearch = prop.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        prop.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Price filter
      const matchesPrice = prop.price >= priceRange[0] && prop.price <= priceRange[1];

      // Beds filter
      const parsed = parseDescription(prop.description);
      const matchesBeds = selectedBeds === "any" || parsed.beds >= parseInt(selectedBeds);

      // Baths filter
      const matchesBaths = selectedBaths === "any" || parsed.baths >= parseInt(selectedBaths);

      // Status filter
      const matchesStatus = selectedStatus === "all" || 
        (selectedStatus === "available" && prop.status === "AVAILABLE") ||
        (selectedStatus === "leased" && prop.status === "OCCUPIED");

      // Type filter
      const matchesType = selectedType === "all" || 
        parsed.type.toLowerCase().includes(selectedType.toLowerCase());

      return matchesSearch && matchesPrice && matchesBeds && matchesBaths && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  const activeFilterCount = [
    priceRange[1] < maxPriceInData ? 1 : 0,
    priceRange[0] > 0 ? 1 : 0,
    selectedBeds !== "any" ? 1 : 0,
    selectedBaths !== "any" ? 1 : 0,
    selectedStatus !== "all" ? 1 : 0,
    selectedType !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    setPriceRange([0, maxPriceInData]);
    setSelectedBeds("any");
    setSelectedBaths("any");
    setSelectedStatus("all");
    setSelectedType("all");
    setSortBy("newest");
  };

  // Collect unique property types from data
  const propertyTypes = [...new Set(properties.map(p => parseDescription(p.description).type))].filter(Boolean);

  return (
    <div className="main-content properties-page">
      <div className="properties-header animate-fade-in">
        <h1 className="page-title">Discover <span className="text-gradient">Properties</span></h1>
        
        <div className="search-filter-bar glass-card">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="input-field search-input" 
              placeholder="Search by location, neighborhood, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn-primary filter-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                background: viewMode === 'map' ? 'var(--secondary)' : 'linear-gradient(135deg, var(--secondary) 0%, #a855f7 100%)',
                color: 'white', fontWeight: 600, padding: '0.6rem 1.2rem'
              }}
            >
              {viewMode === 'grid' ? <><MapIcon size={18} /> Explore Map</> : <><LayoutGrid size={18} /> Show Grid</>}
            </button>
            <button 
              className={`btn-secondary filter-btn ${showFilters ? 'filter-active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              style={{ position: 'relative' }}
            >
              <SlidersHorizontal size={18} /> Filters
              {activeFilterCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  color: 'white', fontSize: '0.65rem', fontWeight: 700,
                  width: '18px', height: '18px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="filter-panel glass-card animate-fade-in" style={{
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <SlidersHorizontal size={18} className="text-gradient" /> Filter Properties
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} style={{
                  background: 'rgba(239, 68, 68, 0.1)', color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem',
                  padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600,
                }}>
                  <X size={14} /> Clear All
                </button>
              )}
              <button onClick={() => setShowFilters(false)} style={{
                background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem',
                padding: '0.4rem 0.6rem', cursor: 'pointer',
              }}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
          }}>
            {/* Price Range */}
            <div className="filter-group">
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Budget Range
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  placeholder="Min"
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.5rem', padding: '0.5rem 0.75rem', color: 'white',
                    fontSize: '0.85rem', width: '100%', outline: 'none',
                  }}
                />
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>to</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  placeholder="Max"
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.5rem', padding: '0.5rem 0.75rem', color: 'white',
                    fontSize: '0.85rem', width: '100%', outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div className="filter-group">
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Bedrooms
              </label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {["any", "1", "2", "3", "4", "5"].map(val => (
                  <button
                    key={val}
                    onClick={() => setSelectedBeds(val)}
                    style={{
                      padding: '0.45rem 0.7rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: selectedBeds === val ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                      background: selectedBeds === val ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: selectedBeds === val ? '#c084fc' : '#94a3b8',
                      transition: 'all 0.2s',
                    }}
                  >
                    {val === 'any' ? 'Any' : `${val}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Bathrooms */}
            <div className="filter-group">
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Bathrooms
              </label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {["any", "1", "2", "3", "4"].map(val => (
                  <button
                    key={val}
                    onClick={() => setSelectedBaths(val)}
                    style={{
                      padding: '0.45rem 0.7rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: selectedBaths === val ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                      background: selectedBaths === val ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: selectedBaths === val ? '#c084fc' : '#94a3b8',
                      transition: 'all 0.2s',
                    }}
                  >
                    {val === 'any' ? 'Any' : `${val}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div className="filter-group">
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Property Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.5rem', padding: '0.5rem 0.75rem', color: 'white',
                  fontSize: '0.85rem', width: '100%', outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="all" style={{ background: '#1a1a2e' }}>All Types</option>
                {propertyTypes.map(type => (
                  <option key={type} value={type} style={{ background: '#1a1a2e' }}>{type}</option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div className="filter-group">
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Availability
              </label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[
                  { val: "all", label: "All" },
                  { val: "available", label: "Available" },
                  { val: "leased", label: "Leased" },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setSelectedStatus(val)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: selectedStatus === val ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                      background: selectedStatus === val ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: selectedStatus === val ? '#c084fc' : '#94a3b8',
                      transition: 'all 0.2s',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="filter-group">
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.5rem', padding: '0.5rem 0.75rem', color: 'white',
                  fontSize: '0.85rem', width: '100%', outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="newest" style={{ background: '#1a1a2e' }}>Newest First</option>
                <option value="price_low" style={{ background: '#1a1a2e' }}>Price: Low to High</option>
                <option value="price_high" style={{ background: '#1a1a2e' }}>Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div style={{ 
            marginTop: '1.25rem', paddingTop: '1rem', 
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Showing <strong style={{ color: '#c084fc' }}>{filteredProperties.length}</strong> of {properties.length} properties
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Finding perfect matches...</p>
        </div>
      ) : viewMode === 'map' ? (
        <div className="map-view-container glass-card" style={{ height: '600px', width: '100%', overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
          <MapContainer center={[20.2961, 85.8245]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredProperties.map(prop => (
              (prop.latitude && prop.longitude) && (
                <Marker key={prop.id} position={[prop.latitude, prop.longitude]}>
                  <Popup>
                    <div style={{ padding: '0.5rem' }}>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{prop.title}</h4>
                      <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>₹{prop.price}/mo</p>
                      <a href={`/property/${prop.id}`} style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 600 }}>View Details</a>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="properties-grid">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property, idx) => (
              <PropertyCard key={property.id} property={property} index={idx} />
            ))
          ) : (
            <div className="empty-state glass-card">
              <h3>No properties found</h3>
              <p>Try adjusting your search criteria or filters</p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="btn-secondary" style={{ marginTop: '1rem' }}>
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Properties;
