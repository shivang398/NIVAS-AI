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
    <div className="maintenance-tab animate-fade-in glass-card" style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, fontSize: '1.75rem' }}>
            <Wrench size={28} className="text-gradient" /> 
            Maintenance Hub
          </h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Manage property repairs and service requests in real-time.</p>
        </div>
      </div>
      
      {/* Tenant: Report an Issue Form */}
      {!isOwner && (
        <form onSubmit={handleSubmit} style={{ 
          marginBottom: '2.5rem', 
          padding: '2rem', 
          background: 'rgba(255,255,255,0.02)', 
          borderRadius: '24px', 
          border: '1px solid var(--border-glass)',
          boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02)'
        }}>
          <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem' }}>
            <AlertCircle size={20} className="text-secondary" /> Submit New Request
          </h4>

          {tenantProperties.length === 0 && (
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(245, 158, 11, 0.1)', 
              borderRadius: '12px', 
              border: '1px solid rgba(245, 158, 11, 0.2)',
              marginBottom: '1.5rem',
              color: '#f59e0b',
              fontSize: '0.85rem'
            }}>
              ⚠️ Verification protocol active: An active smart lease is required to submit maintenance requests.
            </div>
          )}

          <div className="input-group">
            <textarea 
              className="input-field" 
              placeholder="Provide a detailed description of the maintenance requirement..." 
              required
              rows={3}
              style={{ resize: 'vertical', minHeight: '80px', width: '100%', padding: '1rem' }}
              value={formData.issue} 
              onChange={e => setFormData({...formData, issue: e.target.value})}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <select 
              className="input-field" 
              value={formData.priority} 
              onChange={e => setFormData({...formData, priority: e.target.value})}
              style={{ padding: '0.75rem' }}
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>

            <select
              className="input-field"
              value={formData.propertyId}
              onChange={e => setFormData({...formData, propertyId: e.target.value})}
              required
              style={{ padding: '0.75rem' }}
            >
              <option value="">-- Targeted Unit --</option>
              {tenantProperties.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={submitting || tenantProperties.length === 0}
              style={{ height: '100%', opacity: (submitting || tenantProperties.length === 0) ? 0.6 : 1 }}
            >
              {submitting ? <Loader2 size={18} className="spin" /> : <Wrench size={18} />}
              {submitting ? 'Processing...' : 'Deploy Request'}
            </button>
          </div>
        </form>
      )}

      {/* Requests List */}
      <div className="requests-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {requests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
            <Wrench size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
            <p className="text-secondary">Maintenance log remains clear. No active tickets.</p>
          </div>
        )}
        {requests.map(req => (
          <div 
            key={req.id} 
            className="request-card" 
            style={{ 
              padding: '1.5rem', 
              border: '1px solid var(--border-glass)', 
              borderRadius: '20px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderLeft: `5px solid ${getStatusColor(req.status)}`,
              background: 'rgba(255,255,255,0.01)',
              flexWrap: 'wrap',
              gap: '1.5rem',
              transition: 'transform 0.2s ease'
            }}
          >
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ background: `${getStatusColor(req.status)}15`, padding: '0.5rem', borderRadius: '10px' }}>
                  {getStatusIcon(req.status)}
                </div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{req.issue}</h4>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Priority: <strong style={{ color: getPriorityColor(req.priority), textTransform: 'uppercase' }}>{req.priority}</strong>
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>•</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={12} /> Logged {new Date(req.createdAt).toLocaleDateString()}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>•</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: getStatusColor(req.status), 
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>{req.status.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Owner: Status update buttons */}
            {isOwner && req.status !== 'resolved' && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {req.status === 'open' && (
                  <button 
                    className="btn-secondary" 
                    style={{ borderColor: '#818cf8', color: '#818cf8', padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '10px' }}
                    onClick={() => handleUpdateStatus(req.id, 'in_progress')}
                  >
                    Deploy Technician
                  </button>
                )}
                <button 
                  className="btn-primary" 
                  style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: '10px', border: '1px solid rgba(74, 222, 128, 0.4)' }}
                  onClick={() => handleUpdateStatus(req.id, 'resolved')}
                >
                  Confirm Resolution
                </button>
              </div>
            )}

            {/* Resolved badge for resolved items */}
            {req.status === 'resolved' && (
              <div style={{ 
                background: 'rgba(74, 222, 128, 0.1)', 
                color: '#4ade80', 
                padding: '0.5rem 1rem', 
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: '1px solid rgba(74, 222, 128, 0.2)'
              }}>
                <CheckCircle size={18} /> Ticket Resolved
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceTab;
