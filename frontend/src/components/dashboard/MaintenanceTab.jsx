import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';

const MaintenanceTab = ({ isOwner, user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Tenant Form State - map to backend-valid priorities
  const [formData, setFormData] = useState({ issue: '', propertyId: '', priority: 'medium' });
  const [tenantProperties, setTenantProperties] = useState([]);

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
      const res = await axios.get('/leases');
      if (res.data.success) {
        // Extract unique properties from active leases
        const props = res.data.data
          .filter(l => l.status?.toLowerCase() === 'active')
          .map(l => ({
            id: l.propertyId,
            title: l.property?.title || `Property ${l.propertyId.slice(0, 8)}...`,
          }));
        setTenantProperties(props);
        // Auto-select the first property if available
        if (props.length > 0 && !formData.propertyId) {
          setFormData(prev => ({ ...prev, propertyId: props[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch tenant properties", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.propertyId) {
      alert("Please select a property first. You need an active lease to submit maintenance requests.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post('/maintenance', formData);
      alert("Maintenance request submitted successfully!");
      setFormData(prev => ({ ...prev, issue: '', priority: 'medium' }));
      fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit request.";
      alert(msg);
    } finally {
      setSubmitting(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle style={{ color: '#f59e0b' }} size={18} />;
      case 'in_progress': return <Clock style={{ color: '#818cf8' }} size={18} />;
      case 'resolved': return <CheckCircle style={{ color: '#4ade80' }} size={18} />;
      default: return <AlertCircle className="text-secondary" size={18} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#f59e0b';
      case 'in_progress': return '#818cf8';
      case 'resolved': return '#4ade80';
      default: return 'var(--text-secondary)';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f87171';
      case 'medium': return '#f59e0b';
      case 'low': return '#4ade80';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading) return <div className="text-secondary p-4">Loading Maintenance Hub...</div>;

  return (
    <div className="maintenance-tab animate-fade-in glass-card" style={{ padding: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Wrench size={24} /> Maintenance Hub
      </h2>
      
      {/* Tenant: Report an Issue Form */}
      {!isOwner && (
        <form onSubmit={handleSubmit} className="mb-4" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> Report an Issue
          </h4>

          {tenantProperties.length === 0 && (
            <p style={{ color: '#f59e0b', marginBottom: '1rem', fontSize: '0.9rem' }}>
              ⚠️ No active leases found. You need an active lease to submit maintenance requests.
            </p>
          )}

          <div className="input-group">
            <textarea 
              className="input-field" 
              placeholder="Describe the issue in detail..." 
              required
              rows={3}
              style={{ resize: 'vertical', minHeight: '70px', width: '100%', fontFamily: 'inherit' }}
              value={formData.issue} 
              onChange={e => setFormData({...formData, issue: e.target.value})}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {/* Priority select with backend-valid values */}
            <select 
              className="input-field" 
              value={formData.priority} 
              onChange={e => setFormData({...formData, priority: e.target.value})}
              style={{ flex: '1', minWidth: '150px' }}
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>

            {/* Property dropdown from active leases */}
            <select
              className="input-field"
              value={formData.propertyId}
              onChange={e => setFormData({...formData, propertyId: e.target.value})}
              required
              style={{ flex: '2', minWidth: '200px' }}
            >
              <option value="">-- Select Property --</option>
              {tenantProperties.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={submitting || tenantProperties.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (submitting || tenantProperties.length === 0) ? 0.6 : 1 }}
            >
              {submitting ? <Loader2 size={18} className="spin" /> : <Wrench size={18} />}
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      )}

      {/* Requests List */}
      <div className="requests-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {requests.length === 0 && (
          <p className="text-secondary" style={{ textAlign: 'center', padding: '2rem' }}>
            No maintenance requests found.
          </p>
        )}
        {requests.map(req => (
          <div 
            key={req.id} 
            className="request-card" 
            style={{ 
              padding: '1.5rem', 
              border: '1px solid var(--border-glass)', 
              borderRadius: '12px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderLeft: `4px solid ${getStatusColor(req.status)}`,
              background: 'rgba(0,0,0,0.1)',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ flex: 1 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                {getStatusIcon(req.status)}
                <span>{req.issue}</span>
                <span 
                  style={{ 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    background: `${getStatusColor(req.status)}22`,
                    color: getStatusColor(req.status),
                    textTransform: 'uppercase'
                  }}
                >
                  {req.status.replace('_', ' ')}
                </span>
              </h4>
              <p className="text-secondary" style={{ fontSize: '0.9rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span>Priority: <strong style={{ color: getPriorityColor(req.priority) }}>{req.priority}</strong></span>
                <span>•</span>
                <span>Created: {new Date(req.createdAt).toLocaleDateString()}</span>
              </p>
            </div>

            {/* Owner: Status update buttons */}
            {isOwner && req.status !== 'resolved' && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {req.status === 'open' && (
                  <button 
                    className="btn-secondary small" 
                    style={{ borderColor: '#818cf8', color: '#818cf8', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={() => handleUpdateStatus(req.id, 'in_progress')}
                  >
                    Mark In Progress
                  </button>
                )}
                <button 
                  className="btn-secondary small" 
                  style={{ borderColor: '#4ade80', color: '#4ade80', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  onClick={() => handleUpdateStatus(req.id, 'resolved')}
                >
                  Mark Resolved
                </button>
              </div>
            )}

            {/* Resolved badge for resolved items */}
            {req.status === 'resolved' && (
              <span style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle size={16} /> Resolved
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceTab;
