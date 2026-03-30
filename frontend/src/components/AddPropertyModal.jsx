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
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
        <h2 className="modal-title">List <span className="text-gradient">New Property</span></h2>
        
        <form onSubmit={handleSubmit} className="add-property-form">
          <div className="input-group">
            <label className="input-label">Property Title</label>
            <div className="input-wrapper">
              <Home className="input-icon" size={18} />
              <input type="text" name="title" className="input-field with-icon" required value={formData.title} onChange={handleChange} placeholder="e.g. Luxury Sky Penthouse" />
            </div>
          </div>
          
          <div className="form-row">
            <div className="input-group flex-1">
              <label className="input-label">Monthly Rent (₹)</label>
              <div className="input-wrapper">
                <IndianRupee className="input-icon" size={18} />
                <input type="number" name="price" className="input-field with-icon" required value={formData.price} onChange={handleChange} placeholder="e.g. 2500" />
              </div>
            </div>
            
            <div className="input-group flex-1">
              <label className="input-label">Location</label>
              <div className="input-wrapper">
                <MapPin className="input-icon" size={18} />
                <input type="text" name="location" className="input-field with-icon" required value={formData.location} onChange={handleChange} placeholder="City, Neighborhood" />
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="input-group flex-1">
              <label className="input-label">Beds</label>
              <input type="number" name="beds" className="input-field" min="0" value={formData.beds} onChange={handleChange} />
            </div>
            
            <div className="input-group flex-1">
              <label className="input-label">Baths</label>
              <input type="number" name="baths" className="input-field" min="0" value={formData.baths} onChange={handleChange} />
            </div>
            
            <div className="input-group flex-1">
              <label className="input-label">Sqft</label>
              <input type="number" name="sqft" className="input-field" placeholder="e.g. 1200" value={formData.sqft} onChange={handleChange} />
            </div>
          </div>

          {/* Amenities Section */}
          <div className="input-group">
            <label className="input-label">Amenities</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
              gap: '0.5rem', 
              marginTop: '0.5rem' 
            }}>
              {AMENITIES_LIST.map(amenity => {
                const isSelected = formData.amenities.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.05)',
                      color: isSelected ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                  >
                    <span>{amenity.icon}</span>
                    <span>{amenity.label}</span>
                  </button>
                );
              })}
            </div>
            {formData.amenities.length > 0 && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {formData.amenities.length} amenities selected
              </p>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea name="description" className="input-field textarea-field" rows="4" required value={formData.description} onChange={handleChange} placeholder="Describe the key features and amenities..."></textarea>
          </div>

          <div 
            className="upload-area" 
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={32} className="text-secondary" />
            <p>
              {selectedFiles.length > 0 
                ? `${selectedFiles.length} file(s) selected` 
                : <span>Drag & drop images here or <strong>browse</strong></span>}
            </p>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          <button type="submit" className="btn-primary form-submit-btn w-100" disabled={loading}>
            {loading ? "Publishing..." : "Publish Listing"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyModal;
