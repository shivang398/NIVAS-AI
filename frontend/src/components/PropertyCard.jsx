import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Lock, Map as MapIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { parseDescription } from '../utils/propertyParser';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyCard.css';

// Fix Leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const PropertyCard = ({ property, index }) => {
  const [showMiniMap, setShowMiniMap] = useState(false);
  const parsed = parseDescription(property.description);
  const image = property.imageUrls && property.imageUrls.length > 0 
    ? `http://localhost:5000/uploads/${property.imageUrls[0]}`
    : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

  const isOccupied = property.status === 'OCCUPIED';

  const toggleMiniMap = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMiniMap(!showMiniMap);
  };

  return (
    <div 
      className={`property-card glass-card animate-fade-in ${showMiniMap ? 'mini-map-active' : ''}`} 
      style={{ animationDelay: `${index * 0.1}s`, opacity: isOccupied ? 0.75 : 1 }}
    >
      <Link to={`/property/${property.id}`} className="card-link">
        <div className="property-image-wrapper">
          <img 
            src={image} 
            alt={property.title} 
            className="property-image"
            style={isOccupied ? { filter: 'brightness(0.7)' } : {}}
          />
          <div className="property-badge">{parsed.type}</div>
          {isOccupied && (
            <div className="property-status-badge">
              <Lock size={12} /> Leased
            </div>
          )}
        </div>
        
        <div className="property-content">
          <div className="property-price">
            <span className="text-gradient">₹{property.price}</span>
            <span className="price-term">/mo</span>
          </div>
          
          <h3 className="property-title">{property.title}</h3>
          
          <div className="property-location-row">
            <div className="property-location">
              <MapPin size={16} />
              <span>{property.location}</span>
            </div>
            {(property.latitude && property.longitude) && (
              <button 
                className="mini-map-toggle" 
                onClick={toggleMiniMap}
                title={showMiniMap ? "Hide Map" : "Show Map"}
              >
                {showMiniMap ? <ChevronUp size={16} /> : <MapIcon size={16} />}
              </button>
            )}
          </div>
          
          <div className="property-features">
            <div className="feature"><Bed size={16} /><span>{parsed.beds} Beds</span></div>
            <div className="feature"><Bath size={16} /><span>{parsed.baths} Baths</span></div>
            <div className="feature"><Square size={16} /><span>{parsed.sqft} sqft</span></div>
          </div>
        </div>
      </Link>

      {showMiniMap && property.latitude && property.longitude && (
        <div className="property-mini-map animate-slide-down">
          <MapContainer 
            center={[property.latitude, property.longitude]} 
            zoom={14} 
            style={{ height: '150px', width: '100%', borderRadius: '0 0 16px 16px' }}
            scrollWheelZoom={false}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[property.latitude, property.longitude]} />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default PropertyCard;
