import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Upload, FileText, Download } from 'lucide-react';
import NocDocument from './NocDocument';

const VerificationTab = ({ isOwner, user }) => {
  const [verifications, setVerifications] = useState([]);
  const [acceptedOffers, setAcceptedOffers] = useState([]);
  const [nocs, setNocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNoc, setSelectedNoc] = useState(null);

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
    <div className="verification-tab animate-fade-in">
      <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, fontSize: '1.75rem' }}>
              <ShieldCheck size={28} className="text-gradient" /> 
              Trust Center
            </h2>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Managed identity verification and digital security clearances.</p>
          </div>
        </div>

        {!isOwner && (
          (() => {
            const pendingActions = acceptedOffers.filter(o => !verifications.some(v => v.offerId === o.id));
            if (pendingActions.length === 0) return null;

            return (
              <div className="alert-box" style={{ 
                marginBottom: '2.5rem', 
                padding: '1.5rem', 
                background: 'rgba(74, 222, 128, 0.05)', 
                border: '1px solid rgba(74, 222, 128, 0.2)', 
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShieldCheck size={24} style={{ color: '#4ade80' }}/>
                  <h4 style={{ color: '#4ade80', margin: 0, fontSize: '1.1rem' }}>Background Verification Required</h4>
                </div>
                <p className="text-secondary" style={{ fontSize: '0.9rem', margin: 0 }}>
                  Initiate your official background check to generate your smart lease for accepted property offers.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {pendingActions.map(offer => (
                    <button key={offer.id} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }} onClick={() => handleCreateVerification(offer.id)}>
                      Start Verification • Ref: #{offer.id.substring(0,6)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()
        )}

        {verifications.length > 0 && (
          <div className="progress-section" style={{ marginBottom: '2.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.75rem', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Global Trust Compliance Status</span>
              <span className="text-gradient" style={{ fontWeight: 700, fontSize: '1rem' }}>
                {Math.round((verifications.filter(v => v.status === 'APPROVED').length / verifications.length) * 100)}% Verified
              </span>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${(verifications.filter(v => v.status === 'APPROVED').length / verifications.length) * 100}%`, 
                background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)',
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </div>
          </div>
        )}

        {verifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
            <ShieldCheck size={40} style={{ margin: '0 auto 1rem' }}/>
            <p>No active verification protocols detected.</p>
          </div>
        ) : (
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {verifications.map(v => (
              <div key={v.id} className="verification-card" style={{ 
                padding: '1.5rem', 
                borderRadius: '20px', 
                background: 'rgba(255,255,255,0.01)',
                border: v.status === 'APPROVED' ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid var(--border-glass)',
                transition: 'transform 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                   <div>
                     <h4 style={{ margin: 0, fontSize: '1rem' }}>Application #{v.offerId.substring(0,6)}</h4>
                     <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>ID: {v.id.slice(0,8)}</span>
                   </div>
                   <span style={{ 
                     padding: '0.35rem 0.75rem', 
                     borderRadius: '8px', 
                     fontSize: '0.7rem', 
                     fontWeight: 700,
                     letterSpacing: '0.05em',
                     background: v.status === 'APPROVED' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)',
                     color: v.status === 'APPROVED' ? '#4ade80' : 'var(--text-secondary)',
                     border: v.status === 'APPROVED' ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid rgba(255,255,255,0.1)'
                   }}>{v.status}</span>
                </div>
                
                {!isOwner && v.status === 'PENDING' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ 
                      padding: '1rem', 
                      background: 'rgba(0,0,0,0.15)', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      {!v.documents?.some(d => d.fileType === 'AADHAR_CARD') ? (
                        <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', padding: '0.6rem' }}>
                          <Upload size={14} /> Aadhaar Identification
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, v.id, 'AADHAR_CARD')} />
                        </label>
                      ) : <div style={{ color: '#4ade80', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}><ShieldCheck size={14}/> Aadhaar Verified</div>}

                      {!v.documents?.some(d => d.fileType === 'PAN_CARD') ? (
                        <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', padding: '0.6rem' }}>
                          <Upload size={14} /> PAN Documentation
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, v.id, 'PAN_CARD')} />
                        </label>
                      ) : <div style={{ color: '#4ade80', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}><ShieldCheck size={14}/> PAN Verified</div>}
                    </div>
                  </div>
                )}

                {v.status === 'APPROVED' && (
                   <div style={{ 
                     marginTop: '0.5rem', 
                     padding: '1rem', 
                     background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%)', 
                     borderRadius: '12px', 
                     border: '1px solid rgba(74, 222, 128, 0.1)', 
                     textAlign: 'center' 
                   }}>
                     <p style={{ fontSize: '0.8rem', margin: 0, color: 'rgba(74, 222, 128, 0.9)', lineHeight: '1.5' }}>
                       Compliance verified. Your smart lease has been authorized and issued.
                     </p>
                   </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '1.5rem' }}>
          <FileText className="text-secondary" size={24} /> 
          Issued Certificates
        </h2>
        {verifications.filter(v => v.status === 'APPROVED').length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '20px', opacity: 0.5 }}>
            <FileText size={40} style={{ margin: '0 auto 1rem' }}/>
            <p>Certificates will appear here once verified.</p>
          </div>
        ) : (
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
             {verifications.filter(v => v.status === 'APPROVED').map(v => (
               <div key={v.id} style={{ 
                 padding: '1.5rem', 
                 background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                 border: '1px solid rgba(74, 222, 128, 0.2)', 
                 borderRadius: '20px',
                 display: 'flex', 
                 flexDirection: 'column', 
                 gap: '1rem', 
                 alignItems: 'center', 
                 textAlign: 'center',
                 boxShadow: '0 10px 20px -10px rgba(0,0,0,0.3)'
               }}>
                 <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                   <ShieldCheck size={32} color="#4ade80" />
                 </div>
                 <div>
                   <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>NOC Certificate</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>UID: {v.id.substring(0,12).toUpperCase()}</div>
                 </div>
                 <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', width: '100%', borderRadius: '10px' }} onClick={() => setSelectedNoc(v)}>
                    <Download size={14} /> View Certificate
                 </button>
               </div>
             ))}
          </div>
        )}
      </div>

      {selectedNoc && (
        <div className="animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.9)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', gap: '1rem',
          overflowY: 'auto', padding: '2rem'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
             <button className="btn-secondary" onClick={() => setSelectedNoc(null)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}>
                Close Vault
             </button>
          </div>
          <NocDocument verification={selectedNoc} />
        </div>
      )}
    </div>
  );
};

export default VerificationTab;
