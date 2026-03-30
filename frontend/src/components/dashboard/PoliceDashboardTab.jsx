import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const PoliceDashboardTab = ({ user }) => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await axios.get('/verification');
      if (res.data.success) {
        setVerifications(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch verification queue", err);
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

  return (
    <div className="police-tab animate-fade-in glass-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Verification Queue</h2>
        <div className="role-badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '2rem', display: 'flex', alignItems: 'center' }}>
          <ShieldCheck size={16} style={{ marginRight: '6px' }}/> 
          Authorized Police Portal
        </div>
      </div>

      {loading ? (
        <p className="text-secondary">Connecting to secure encrypted queue...</p>
      ) : verifications.length === 0 ? (
        <div className="empty-state text-center" style={{ padding: '4rem 2rem' }}>
          <ShieldCheck size={48} className="text-secondary" style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <h3>All Clear</h3>
          <p className="text-secondary">There are no pending background checks in your jurisdiction.</p>
        </div>
      ) : (
        <div className="verification-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {verifications.map(v => (
            <div key={v.id} className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Applicant ID: {v.tenantId.substring(0,8)}...</h3>
                  <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Reference Offer: {v.offerId}
                  </p>
                  
                  {v.fraudCheck && (() => {
                    const trustScore = 100 - v.fraudCheck.score;
                    const scoreColor = trustScore >= 70 ? '#4ade80' : trustScore >= 30 ? '#f59e0b' : '#ef4444';
                    let fraudReasons = [];
                    try {
                      const parsed = JSON.parse(v.fraudCheck.remarks);
                      fraudReasons = parsed.reasons || [];
                    } catch { fraudReasons = []; }

                    return (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <AlertTriangle size={16} color={scoreColor} />
                          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: scoreColor }}>
                            AI Trust Score: {trustScore}/100
                          </span>
                          <span style={{ 
                            padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                            background: `${scoreColor}22`, color: scoreColor, textTransform: 'uppercase'
                          }}>
                            {v.fraudCheck.status}
                          </span>
                        </div>
                        {fraudReasons.length > 0 && (
                          <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `3px solid ${scoreColor}` }}>
                            {fraudReasons.map((reason, i) => (
                              <p key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0' }}>
                                ⚠ {reason}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

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
                    style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', justifyContent: 'center' }}
                  >
                    <XCircle size={16} /> Reject Application
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PoliceDashboardTab;
