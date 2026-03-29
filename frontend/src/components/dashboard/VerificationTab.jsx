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

        {!isOwner && acceptedOffers.length > 0 && (
          <div className="alert-box mb-4" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', borderRadius: '8px' }}>
            <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Action Required: Police Verification</h4>
            <p className="text-sm text-secondary">You have Accepted Offers that require legal background verification before generating the smart lease.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {acceptedOffers.filter(o => !verifications.some(v => v.offerId === o.id)).map(offer => (
                <button key={offer.id} className="btn-secondary small" onClick={() => handleCreateVerification(offer.id)}>
                  Start Verification for #{offer.id.substring(0,6)}
                </button>
              ))}
            </div>
          </div>
        )}

        {verifications.length === 0 ? (
          <p className="text-secondary">No active verifications found.</p>
        ) : (
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {verifications.map(v => (
              <div key={v.id} style={{ border: '1px solid var(--border-glass)', padding: '1.5rem', borderRadius: '12px' }}>
                <h4>Status: <span className={`status-badge ${v.status === 'PENDING' ? 'pending' : ''}`}>{v.status}</span></h4>
                <p className="text-secondary text-sm mt-2">Offer ID: #{v.offerId.substring(0,6)}</p>
                
                {!isOwner && v.status === 'PENDING' && (
                  <div className="mt-2" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    
                    {!v.documents?.some(d => d.fileType === 'AADHAR_CARD') ? (
                      <label className="btn-primary" style={{ display: 'inline-block', cursor: 'pointer', textAlign: 'center', width: '100%', padding: '0.75rem' }}>
                        <Upload size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Upload Aadhar Card
                        <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, v.id, 'AADHAR_CARD')} />
                      </label>
                    ) : (
                      <div style={{ textAlign: 'center', width: '100%', padding: '0.75rem', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: '8px', border: '1px solid #4ade80', fontSize: '0.9rem' }}>
                        ✓ Aadhar Card Uploaded
                      </div>
                    )}

                    {!v.documents?.some(d => d.fileType === 'PAN_CARD') ? (
                      <label className="btn-primary" style={{ display: 'inline-block', cursor: 'pointer', textAlign: 'center', width: '100%', padding: '0.75rem' }}>
                        <Upload size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Upload PAN Card
                        <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, v.id, 'PAN_CARD')} />
                      </label>
                    ) : (
                      <div style={{ textAlign: 'center', width: '100%', padding: '0.75rem', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: '8px', border: '1px solid #4ade80', fontSize: '0.9rem' }}>
                        ✓ PAN Card Uploaded
                      </div>
                    )}

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2><FileText className="text-secondary" size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/>NOC Certificates</h2>
        {nocs.length === 0 ? (
          <p className="text-secondary mt-2">No NOC Certificates issued yet.</p>
        ) : (
          <div className="grid">
             {nocs.map(noc => (
               <div key={noc.id} className="badge">NOC Issued</div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationTab;
