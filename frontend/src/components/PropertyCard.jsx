import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square } from 'lucide-react';
import { parseDescription } from '../utils/propertyParser';
import './PropertyCard.css';

const PropertyCard = ({ property, index }) => {
  const parsed = parseDescription(property.description);
  const image = property.imageUrls && property.imageUrls.length > 0 
    ? `http://localhost:5000/uploads/${property.imageUrls[0]}`
    : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

  return (
    <Link 
      to={`/property/${property.id}`} 
      className={`property-card glass-card animate-fade-in`} 
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="property-image-wrapper">
        <img 
          src={image} 
          alt={property.title} 
          className="property-image"
        />
        <div className="property-badge">{parsed.type}</div>
      </div>
      
      <div className="property-content">
        <div className="property-price">
          <span className="text-gradient">₹{property.price}</span>
          <span className="price-term">/mo</span>
        </div>
        
        <h3 className="property-title">{property.title}</h3>
        
        <div className="property-location">
          <MapPin size={16} />
          <span>{property.location}</span>
        </div>
        
        <div className="property-features">
          <div className="feature">
            <Bed size={16} />
            <span>{parsed.beds} Beds</span>
          </div>
          <div className="feature">
            <Bath size={16} />
            <span>{parsed.baths} Baths</span>
          </div>
          <div className="feature">
            <Square size={16} />
            <span>{parsed.sqft} sqft</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
