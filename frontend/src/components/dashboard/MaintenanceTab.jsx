import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, CheckCircle, AlertCircle } from 'lucide-react';

const MaintenanceTab = ({ isOwner, user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tenant Form State
  const [formData, setFormData] = useState({ issue: '', propertyId: '', priority: 'normal' });
  const [tenantProperties, setTenantProperties] = useState([]); // Simplified for mock

  useEffect(() => {
    fetchRequests();
    if (!isOwner) fetchTenantProperties();
  }, [isOwner]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/maintenance');
      if (res.data.success) setRequests(res.data.data);
    } catch (err) {
      console.error("Failed to fetch maintenance", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantProperties = async () => {
    try {
      // Typically tenant fetches their active leases to submit maintenance against
      const res = await axios.get('/leases');
      if (res.data.success) setTenantProperties(res.data.data.map(l => l.property));
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/maintenance', formData);
      alert("Maintenance request submitted.");
      setFormData({ issue: '', propertyId: '', priority: 'normal' });
      fetchRequests();
    } catch (err) {
      alert("Failed to submit request.");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.patch(`/maintenance/${id}`, { status });
      fetchRequests();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (loading) return <div className="text-secondary p-4">Loading maintenance Hub...</div>;

  return (
    <div className="maintenance-tab animate-fade-in glass-card" style={{ padding: '2rem' }}>
      <h2>Maintenance Hub</h2>
      
      {!isOwner && (
        <form onSubmit={handleSubmit} className="mb-4" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
          <h4 style={{ marginBottom: '1rem' }}>Report an Issue</h4>
          <div className="input-group">
            <input 
              type="text" className="input-field" placeholder="Describe the issue..." required
              value={formData.issue} onChange={e => setFormData({...formData, issue: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <select className="input-field" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
              <option value="low">Low Priority</option>
              <option value="normal">Normal Priority</option>
              <option value="urgent">Urgent</option>
            </select>
            <input 
              type="text" className="input-field" placeholder="Property ID" required
              value={formData.propertyId} onChange={e => setFormData({...formData, propertyId: e.target.value})}
            />
            <button type="submit" className="btn-primary"><Wrench size={18}/> Submit</button>
          </div>
        </form>
      )}

      <div className="requests-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {requests.length === 0 && <p className="text-secondary">No maintenance requests found.</p>}
        {requests.map(req => (
          <div key={req.id} className="request-card" style={{ padding: '1.5rem', border: '1px solid var(--border-glass)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {req.status === 'open' ? <AlertCircle className="text-secondary" size={18}/> : <CheckCircle style={{color: '#4ade80'}} size={18}/>}
                <span>{req.issue}</span>
                <span className={`status-badge ${req.status === 'open' ? 'pending' : ''}`}>{req.status}</span>
              </h4>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Priority: <strong>{req.priority}</strong> | Property: {req.propertyId}</p>
            </div>
            {isOwner && req.status === 'open' && (
              <button className="btn-secondary small" onClick={() => handleUpdateStatus(req.id, 'resolved')}>
                Mark Resolved
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceTab;
