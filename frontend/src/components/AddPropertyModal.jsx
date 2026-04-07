import { useState, useRef } from 'react';
import { Home, IndianRupee, MapPin, UploadCloud, X } from 'lucide-react';
import { encodeDescription, AMENITIES_LIST } from '../utils/propertyParser';
import './AddProperty.css';

const AddPropertyModal = ({ isOpen, onClose, onSubmit }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    type: 'Apartment',
    beds: 1,
    baths: 1,
    sqft: '',
    description: '',
    amenities: []
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAmenity = (amenityId) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('price', formData.price);
    payload.append('location', formData.location);
    
    // Combine custom fields into the description
    const encodedDesc = encodeDescription(formData.description, {
      beds: formData.beds,
      baths: formData.baths,
      sqft: formData.sqft,
      type: formData.type,
      amenities: formData.amenities
    });
    
    payload.append('description', encodedDesc);

    // Append files
    selectedFiles.forEach((file) => {
      payload.append('images', file);
    });

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card animate-fade-in">
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 className="modal-title" style={{ margin: 0, fontSize: '1.75rem' }}>List <span className="text-gradient">New Property</span></h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Onboard your unit to the Nivas AI ecosystem.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="add-property-form" style={{ gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label">Title / Heading</label>
            <div className="input-wrapper">
              <Home className="input-icon" size={18} />
              <input type="text" name="title" className="input-field with-icon" required value={formData.title} onChange={handleChange} placeholder="e.g. Modern Executive Suite" />
            </div>
          </div>
          
          <div className="form-row" style={{ gap: '1.25rem' }}>
            <div className="input-group flex-1">
              <label className="input-label">Monthly Rent</label>
              <div className="input-wrapper">
                <IndianRupee className="input-icon" size={18} />
                <input type="number" name="price" className="input-field with-icon" required value={formData.price} onChange={handleChange} placeholder="Rent amount" />
              </div>
            </div>
            
            <div className="input-group flex-1">
              <label className="input-label">Precise Location</label>
              <div className="input-wrapper">
                <MapPin className="input-icon" size={18} />
                <input type="text" name="location" className="input-field with-icon" required value={formData.location} onChange={handleChange} placeholder="City, Area" />
              </div>
            </div>
          </div>
          
          <div className="form-row" style={{ gap: '1.25rem' }}>
            <div className="input-group flex-1">
              <label className="input-label">Configuration</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="number" name="beds" className="input-field" min="0" value={formData.beds} onChange={handleChange} placeholder="Beds" style={{ flex: 1 }} />
                <input type="number" name="baths" className="input-field" min="0" value={formData.baths} onChange={handleChange} placeholder="Baths" style={{ flex: 1 }} />
              </div>
            </div>
            
            <div className="input-group flex-1">
              <label className="input-label">Total Area (Sqft)</label>
              <input type="number" name="sqft" className="input-field" placeholder="e.g. 1450" value={formData.sqft} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Property Type</label>
            <select name="type" className="input-field" value={formData.type} onChange={handleChange}>
              <option value="Apartment">Apartment / Flat</option>
              <option value="House">Independent House</option>
              <option value="Villa">Luxury Villa</option>
              <option value="Studio">Studio / Loft</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Infrastructure & Amenities</label>
            <div className="amenities-container" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
              gap: '0.75rem', 
              marginTop: '0.75rem' 
            }}>
              {AMENITIES_LIST.map(amenity => {
                const isSelected = formData.amenities.includes(amenity.id);
                return (
                  <div
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`amenity-chip ${isSelected ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '12px',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                      color: isSelected ? '#818cf8' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 700 : 500,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>{amenity.icon}</span>
                    <span>{amenity.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Marketing Highlights</label>
            <textarea name="description" className="input-field textarea-field" rows="3" required value={formData.description} onChange={handleChange} placeholder="Highlight the key benefits of this property..."></textarea>
          </div>

          <div 
            className="upload-area" 
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={28} className={selectedFiles.length > 0 ? 'text-gradient' : 'text-secondary'} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                {selectedFiles.length > 0 
                  ? `${selectedFiles.length} Images Selected` 
                  : 'Capture & Upload Images'}
              </p>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.7rem', opacity: 0.5 }}>Supported formats: JPG, PNG, WEBP</p>
            </div>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          <button type="submit" className="btn-primary form-submit-btn" style={{ padding: '1rem', width: '100%', borderRadius: '14px', fontSize: '1rem' }} disabled={loading}>
            {loading ? "Synchronizing..." : "Initialize Property Listing"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyModal;
