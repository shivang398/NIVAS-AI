import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Upload, FileText } from 'lucide-react';

const VerificationTab = ({ isOwner, user }) => {
  const [verifications, setVerifications] = useState([]);
  const [acceptedOffers, setAcceptedOffers] = useState([]);
  const [nocs, setNocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vRes, oRes, nRes] = await Promise.all([
        axios.get('/verification'),
        axios.get('/offers'),
        axios.get('/noc').catch(() => ({ data: { data: [] } })) // Fallback if NOC not ready
      ]);
      if (vRes.data.success) setVerifications(vRes.data.data);
      if (oRes.data.success) setAcceptedOffers(oRes.data.data.filter(o => o.status === 'ACCEPTED'));
      if (nRes?.data?.success) setNocs(nRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVerification = async (offerId) => {
    try {
      await axios.post('/verification', { offerId });
      alert("Verification sequence initialized! Upload your documents now.");
      fetchData();
    } catch (err) {
      alert("Failed to initialize verification sequence.");
    }
  };

  const handleFileUpload = async (e, vId, fileType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);
    fd.append('verificationId', vId);
    fd.append('fileType', fileType);

    try {
      await axios.post('/verification/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      alert("Document verified and uploaded.");
      fetchData();
    } catch (err) {
      alert("Upload failed.");
    }
  };

  if (loading) return <div className="text-secondary p-4">Loading Trust Center...</div>;

  return (
    <div className="verification-tab">
      <div className="glass-card mb-4" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2><ShieldCheck className="text-gradient" size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/>Trust Center</h2>
        </div>

        {!isOwner && (
          (() => {
            const pendingActions = acceptedOffers.filter(o => !verifications.some(v => v.offerId === o.id));
            if (pendingActions.length === 0) return null;

            return (
              <div className="alert-box mb-4" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', borderRadius: '12px' }}>
                <h4 style={{ color: '#4ade80', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <ShieldCheck size={20} style={{ marginRight: '8px' }}/> Action Required: Police Verification
                </h4>
                <p className="text-sm text-secondary">New Accepted Offers found! Initiate your background verification to generate the smart lease.</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                  {pendingActions.map(offer => (
                    <button key={offer.id} className="btn-secondary small" onClick={() => handleCreateVerification(offer.id)}>
                      Start Verification for #{offer.id.substring(0,6)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()
        )}

        {verifications.length > 0 && (
          <div className="progress-section mb-4" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <span className="text-secondary">Verification Progress</span>
              <span className="text-gradient" style={{ fontWeight: 600 }}>
                {Math.round((verifications.filter(v => v.status === 'APPROVED').length / verifications.length) * 100)}% Complete
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${(verifications.filter(v => v.status === 'APPROVED').length / verifications.length) * 100}%`, 
                background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        )}

        {verifications.length === 0 ? (
          <p className="text-secondary">No active verifications found.</p>
        ) : (
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {verifications.map(v => (
              <div key={v.id} className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', border: v.status === 'APPROVED' ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                   <h4 style={{ margin: 0 }}>ID #{v.offerId.substring(0,6)}</h4>
                   <span className={`status-badge ${v.status.toLowerCase()}`} style={{ 
                     background: v.status === 'APPROVED' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)',
                     color: v.status === 'APPROVED' ? '#4ade80' : 'inherit'
                   }}>{v.status}</span>
                </div>
                
                {v.fraudCheck && (
                  <div className="mb-2" style={{ fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '1rem' }}>
                    AI Trust Score: <span style={{ color: v.fraudCheck.score < 30 ? '#4ade80' : '#f59e0b', fontWeight: 600 }}>{100 - v.fraudCheck.score}/100</span>
                  </div>
                )}
                
                {!isOwner && v.status === 'PENDING' && (
                  <div className="mt-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {!v.documents?.some(d => d.fileType === 'AADHAR_CARD') ? (
                      <label className="btn-primary small" style={{ display: 'block', cursor: 'pointer', textAlign: 'center' }}>
                        <Upload size={14} /> Upload Aadhar
                        <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, v.id, 'AADHAR_CARD')} />
                      </label>
                    ) : <div className="text-center text-xs text-secondary">✓ Aadhar Verified</div>}

                    {!v.documents?.some(d => d.fileType === 'PAN_CARD') ? (
                      <label className="btn-primary small" style={{ display: 'block', cursor: 'pointer', textAlign: 'center' }}>
                        <Upload size={14} /> Upload PAN
                        <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, v.id, 'PAN_CARD')} />
                      </label>
                    ) : <div className="text-center text-xs text-secondary">✓ PAN Verified</div>}
                  </div>
                )}

                {v.status === 'APPROVED' && (
                   <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(74, 222, 128, 0.05)', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.2)', textAlign: 'center' }}>
                     <p className="text-secondary" style={{ fontSize: '0.75rem', margin: 0 }}>
                       <ShieldCheck size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }}/> 
                       Identity & Trust Verified. Your Smart Lease is now available in the <b>Leases</b> tab.
                     </p>
                   </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2><FileText className="text-secondary" size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/>NOC Certificates</h2>
        {verifications.filter(v => v.status === 'APPROVED').length === 0 ? (
          <p className="text-secondary mt-2">No NOC Certificates issued yet.</p>
        ) : (
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
             {verifications.filter(v => v.status === 'APPROVED').map(v => (
               <div key={v.id} style={{ 
                 padding: '1rem', background: 'rgba(74, 222, 128, 0.05)', border: '1px dashed #4ade80', borderRadius: '12px',
                 display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center'
               }}>
                 <ShieldCheck size={32} color="#4ade80" />
                 <div>
                   <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>NOC Issued</div>
                   <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Ref: {v.id.substring(0,8)}</div>
                 </div>
                 <button className="btn-secondary small" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }} onClick={() => window.print()}>Download</button>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationTab;
