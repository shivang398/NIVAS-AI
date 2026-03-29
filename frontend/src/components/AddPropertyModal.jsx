import { useState, useRef } from 'react';
import { Home, IndianRupee, MapPin, UploadCloud, X } from 'lucide-react';
import { encodeDescription } from '../utils/propertyParser';
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
    description: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      type: formData.type
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
