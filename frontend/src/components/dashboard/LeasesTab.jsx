import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileSignature, Calendar, ShieldCheck } from 'lucide-react';

import SmartLeaseDocument from './SmartLeaseDocument';

const LeasesTab = ({ isOwner }) => {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLease, setSelectedLease] = useState(null);

  useEffect(() => {
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get('/leases');
      if (res.data.success) {
        setLeases(res.data.data);
      }
    } catch (err) {
      console.error("❌ FAILED TO FETCH LEASES:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) return <div className="text-secondary p-4 animate-pulse">Initializing legal vault...</div>;

  if (selectedLease) {
    return (
      <div className="lease-viewer-modal animate-fade-in" style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.95)', zIndex: 9999, padding: '2rem',
        display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
           <button className="btn-secondary no-print" style={{ color: 'white' }} onClick={() => setSelectedLease(null)}>← Close Viewer</button>
           <button className="btn-primary no-print" onClick={() => window.print()}>Print / Save as PDF</button>
        </div>
        
        <SmartLeaseDocument lease={selectedLease} />

        <style>{`
          @media print {
            .no-print, .dashboard-sidebar, .dashboard-header, .app-container > *:not(.dashboard-page), .dashboard-nav, aside {
                display: none !important;
            }
            .dashboard-page, .dashboard-content, .lease-viewer-modal, .legal-document {
                position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important;
                background: white !important; z-index: 99999 !important;
            }
            .legal-document { border: none !important; box-shadow: none !important; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="leases-tab glass-card animate-fade-in" style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, fontSize: '1.75rem' }}>
            <FileSignature size={28} className="text-gradient" /> 
            Active Smart Leases
          </h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Secure digital agreements backed by blockchain verification.</p>
        </div>
        <button 
          className={`btn-secondary small ${refreshing ? 'animate-spin' : ''}`} 
          onClick={fetchLeases}
          disabled={refreshing}
          style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
        >
          {refreshing ? 'Syncing...' : 'Refresh Vault'}
        </button>
      </div>
      
      {leases.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '5rem 2rem', 
          border: '1px dashed rgba(255,255,255,0.1)', 
          borderRadius: '24px', 
          background: 'rgba(255,255,255,0.01)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.1)', 
            padding: '1.5rem', 
            borderRadius: '50%',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <ShieldCheck size={40} style={{ color: '#818cf8' }}/>
          </div>
          <div style={{ maxWidth: '450px' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Secure Vault is Empty</h3>
            <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              Your digital leases are generated automatically once property applications are finalized and 
              the <b>Police Verification</b> is successfully completed.
            </p>
          </div>
          <button className="btn-secondary" style={{ fontSize: '0.85rem' }} onClick={fetchLeases}>Check for New Agreements</button>
        </div>
      ) : (
        <div className="applications-table-wrapper" style={{ margin: '0 -1rem' }}>
          <table className="applications-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '1.5rem' }}>Property Details</th>
                <th>{isOwner ? "Resident" : "Provider"}</th>
                <th>Rent Model</th>
                <th>Term Logic</th>
                <th>Security Tier</th>
                <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leases.map(lease => (
                <tr key={lease.id} style={{ transition: 'background 0.2s' }} className="hover-row">
                  <td style={{ paddingLeft: '1.5rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{lease.property?.title || "Residential Unit"}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>ID: {lease.id.slice(0, 8).toUpperCase()}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        background: 'var(--bg-glass-hover)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
                        border: '1px solid var(--border-glass)'
                      }}>
                        {(isOwner ? lease.tenant?.name : lease.owner?.name)?.charAt(0) || 'U'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500 }}>{isOwner ? (lease.tenant?.name || "Verified Tenant") : (lease.owner?.name || "Verified Owner")}</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{isOwner ? lease.tenant?.email : lease.owner?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#4ade80', fontSize: '1.05rem' }}>₹{lease.rent.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Per Month</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{lease.duration} Months</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} /> Ends {new Date(lease.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      background: 'rgba(74, 222, 128, 0.1)', 
                      color: '#4ade80', 
                      fontSize: '0.7rem', 
                      padding: '0.35rem 0.75rem', 
                      borderRadius: '100px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      border: '1px solid rgba(74, 222, 128, 0.2)'
                    }}>
                      <ShieldCheck size={12}/> HIGH TRUST
                    </span>
                  </td>
                  <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                    <button className="btn-primary" onClick={() => setSelectedLease(lease)} style={{ fontSize: '0.8rem', padding: '0.5rem 1.25rem', borderRadius: '10px' }}>
                      View Agreement
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeasesTab;
