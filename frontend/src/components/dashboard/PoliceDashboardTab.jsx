import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, FileText, CheckCircle, XCircle, AlertTriangle, UserX } from 'lucide-react';

const PoliceDashboardTab = ({ user }) => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'queue' ? '/verification' : '/verification?status=APPROVED';
      const res = await axios.get(endpoint);
      if (res.data.success) {
        setVerifications(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch verification data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, status) => {
    try {
      if (!window.confirm(`Are you sure you want to ${status} this application?`)) return;
      
      const res = await axios.patch(`/verification/${id}`, { status });
      if (res.data.success) {
        alert(`Verification successfully ${status}. Lease engine triggered if approved.`);
        setVerifications(prev => prev.filter(v => v.id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${status} verification.`);
    }
  };

  const handleCriminalDiscard = async (id) => {
    try {
      if (!window.confirm(`WARNING: Are you sure you want to log a CRIMINAL RECORD against this applicant? This will automatically discard and permanently reject their application and any further process.`)) return;
      
      // Update backend to reject the application
      const res = await axios.patch(`/verification/${id}`, { status: 'REJECTED' });
      if (res.data.success) {
        alert('CRIMINAL RECORD LOGGED. Applicant has been officially discarded and banned from further processing.');
        setVerifications(prev => prev.filter(v => v.id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || `Failed to log criminal record.`);
    }
  };

  return (
    <div className="police-tab animate-fade-in glass-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>{activeTab === 'queue' ? 'Verification Queue' : 'Verified Tenants History'}</h2>
        <div className="role-badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '2rem', display: 'flex', alignItems: 'center' }}>
          <ShieldCheck size={16} style={{ marginRight: '6px' }}/> 
          Authorized Police Portal
        </div>
      </div>
      
      <div style={{ 
        display: 'inline-flex', 
        background: 'rgba(255,255,255,0.03)', 
        padding: '0.3rem', 
        borderRadius: '0.75rem', 
        marginBottom: '2rem',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <button 
          onClick={() => setActiveTab('queue')}
          style={{
            padding: '0.6rem 1.5rem',
            background: activeTab === 'queue' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'queue' ? '#818cf8' : '#94a3b8',
            border: activeTab === 'queue' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginRight: '0.3rem'
          }}
        >
          Pending Queue
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.6rem 1.5rem',
            background: activeTab === 'history' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'history' ? '#818cf8' : '#94a3b8',
            border: activeTab === 'history' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Verified Tenants DB
        </button>
      </div>

      {loading ? (
        <p className="text-secondary">Connecting to secure encrypted queue...</p>
      ) : verifications.length === 0 ? (
        <div className="empty-state text-center" style={{ padding: '4rem 2rem' }}>
          <ShieldCheck size={48} className="text-secondary" style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <h3>{activeTab === 'queue' ? 'All Clear' : 'No Records Found'}</h3>
          <p className="text-secondary">{activeTab === 'queue' ? 'There are no pending background checks in your jurisdiction.' : 'No verified tenants found in the database.'}</p>
        </div>
      ) : (
        <div className="verification-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {verifications.map(v => (
            <div key={v.id} className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Applicant ID: {v.tenantId.substring(0,8)}...</h3>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Proposed Lease Details:</h4>
                    {v.offer ? (
                      <p style={{ margin: '0.5rem 0 0 0', fontWeight: '500' }}>
                        {v.offer.property?.title || 'Property'} • Rent: ₹{v.offer.price}
                      </p>
                    ) : (
                      <p style={{ margin: '0.5rem 0 0 0', fontWeight: '500' }}>Reference Offer: {v.offerId}</p>
                    )}
                  </div>
                  


                  <div className="documents-list" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {v.documents?.map(doc => {
                      const fileUrl = doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:5000/${doc.fileUrl.replace(/\\/g, '/')}`;
                      return (
                      <a 
                        key={doc.id} 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn-secondary small"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <FileText size={16} /> View {doc.fileType}
                      </a>
                    )})}
                    {(!v.documents || v.documents.length === 0) && (
                      <span className="text-secondary" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>No documents uploaded.</span>
                    )}
                  </div>
                </div>

                {activeTab === 'queue' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '180px' }}>
                    <button 
                      className="btn-primary" 
                      onClick={() => handleDecision(v.id, 'APPROVED')}
                      style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', justifyContent: 'center' }}
                    >
                      <CheckCircle size={16} /> Approve & Sign
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={() => handleDecision(v.id, 'REJECTED')}
                      style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)', justifyContent: 'center' }}
                    >
                      <XCircle size={16} /> Reject Informally
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={() => handleCriminalDiscard(v.id)}
                      style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.1)', justifyContent: 'center', fontWeight: 'bold' }}
                      title="Log Criminal Data & Discard Applicant"
                    >
                      <UserX size={16} /> Mark as Criminal
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '180px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      padding: '0.5rem 1rem', 
                      background: 'rgba(34, 197, 94, 0.1)', 
                      border: '1px solid rgba(34, 197, 94, 0.3)', 
                      borderRadius: '2rem', 
                      color: '#4ade80',
                      boxShadow: '0 4px 14px rgba(34, 197, 94, 0.1)',
                    }}>
                      <CheckCircle size={16} />
                      <strong style={{ fontSize: '0.85rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>VERIFIED SECURE</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PoliceDashboardTab;
