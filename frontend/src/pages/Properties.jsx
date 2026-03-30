import { useState, useEffect } from 'react';
import { Search, Filter, Map as MapIcon, LayoutGrid } from 'lucide-react';
import axios from 'axios';
import PropertyCard from '../components/PropertyCard';
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

  // Fetch real data from backend
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get('/properties');
        if (res.data.success) {
          setProperties(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(prop => 
    prop.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    prop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <button className="btn-secondary filter-btn">
              <Filter size={18} /> Filters
            </button>
          </div>
        </div>
      </div>

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
              <p>Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Properties;
