import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Bed, Bath, Square, Calendar, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { parseDescription } from '../utils/propertyParser';
import './PropertyDetails.css';

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && location.state?.autoApply && property && !isApplying) {
      // Clear the state so it doesn't try to apply again on refresh
      navigate(location.pathname, { replace: true, state: {} });
      handleApply();
    }
  }, [user, location.state, property]);

  const handleApply = async () => {
    if (user.role !== 'TENANT' && user.role !== 'tenant') return alert("Only registered Tenants can logically apply for properties.");
    if (property.ownerId === user.id) return alert("You cannot apply to your own listed property.");
    try {
      setIsApplying(true);
      await axios.post('/offers', { propertyId: property.id, price: property.price });
      alert("Application submitted successfully! Redirecting to your tracking dashboard...");
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setIsApplying(false);
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`/properties/${id}`);
        if (res.data.success) {
          setProperty(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load property details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperty();
  }, [id]);

  if (loading) return <div className="loading-state"><div className="spinner"></div><p>Loading details...</p></div>;
  if (error || !property) return <div className="loading-state"><p>{error || "Property not found"}</p><Link to="/properties" className="btn-secondary">Go Back</Link></div>;

  const parsed = parseDescription(property.description);
  const image = property.imageUrls && property.imageUrls.length > 0 
    ? `http://localhost:5000/uploads/${property.imageUrls[0]}`
    : "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="main-content property-details-page animate-fade-in">
      <Link to="/properties" className="back-link">
        <ChevronLeft size={20} /> Back to Properties
      </Link>
      
      <div className="details-hero">
        <img src={image} alt={property.title} className="details-image" />
        <div className="details-badge">{parsed.type}</div>
      </div>
      
      <div className="details-grid">
        <div className="details-main">
          <div className="details-header glass-card">
            <h1 className="details-title">{property.title}</h1>
            <div className="details-location">
              <MapPin size={18} /> {property.location}
            </div>
            
            <div className="details-stats row-flex">
              <div className="stat-pill"><Bed size={18} /> {parsed.beds} Bedrooms</div>
              <div className="stat-pill"><Bath size={18} /> {parsed.baths} Bathrooms</div>
              <div className="stat-pill"><Square size={18} /> {parsed.sqft} sqft</div>
            </div>
          </div>
          
          <div className="details-section glass-card">
            <h2>About this property</h2>
            <p className="property-description">{parsed.cleanDescription}</p>
          </div>
          
          <div className="details-section glass-card">
            <h2>Key Features</h2>
            <ul className="features-list">
              <li><ShieldCheck size={16} className="text-secondary" /> Secure Lease Verification</li>
              <li><ShieldCheck size={16} className="text-secondary" /> 24/7 Digital Support</li>
              {/* Derived features mock if none provided */}
              {parsed.type === 'Premium' && <li><ShieldCheck size={16} className="text-secondary" /> Luxury Finishings</li>}
            </ul>
          </div>
        </div>
        
        <div className="details-sidebar">
          <div className="action-card glass-card sticky-sidebar">
            <div className="price-tag">
              <span className="price-amount text-gradient">₹{property.price}</span>
              <span className="price-term">/month</span>
            </div>
            
            <div className="availability row-flex">
              <Calendar size={16} /> <span>{property.status === 'AVAILABLE' ? 'Available Now' : 'Occupied'}</span>
            </div>
            
            <div className="owner-info">
              <div className="owner-avatar">{property.owner?.name?.charAt(0) || 'U'}</div>
              <div>
                <p className="owner-label">Listed by</p>
                <p className="owner-name">{property.owner?.name || 'Owner'}</p>
                <div className="verified-badge"><ShieldCheck size={14} /> Verified Owner</div>
              </div>
            </div>
            
            <div className="action-buttons">
              {user ? (
                <>
                  <button 
                    className="btn-primary w-100" 
                    onClick={handleApply} 
                    disabled={isApplying || (user.role !== 'TENANT' && user.role !== 'tenant')}
                  >
                    {isApplying ? "Submitting..." : ((user.role === 'TENANT' || user.role === 'tenant') ? "Apply Now" : "Tenant Accounts Only")}
                  </button>
                  <button className="btn-secondary w-100" disabled={user.role !== 'TENANT' && user.role !== 'tenant'}>Negotiate Rent</button>
                </>
              ) : (
                <Link to="/login" state={{ from: location.pathname, autoApply: true }} className="btn-primary w-100 login-prompt">Log in to Apply</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
