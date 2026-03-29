import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import axios from 'axios';
import PropertyCard from '../components/PropertyCard';
import './Properties.css';

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <button className="btn-secondary filter-btn">
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Finding perfect matches...</p>
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
