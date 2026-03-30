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
    <div className="leases-tab glass-card animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <FileSignature className="text-secondary" /> 
          Active Smart Leases
        </h2>
        <button 
          className={`btn-secondary small ${refreshing ? 'animate-spin' : ''}`} 
          onClick={fetchLeases}
          disabled={refreshing}
          style={{ fontSize: '0.7rem' }}
        >
          {refreshing ? 'Syncing...' : 'Sync Leases'}
        </button>
      </div>
      
      {leases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', border: '1px dashed var(--border-glass)', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ marginBottom: '1rem', opacity: 0.5 }}><ShieldCheck size={48} style={{ margin: '0 auto' }}/></div>
          <h4 className="text-secondary">No Digital Leases Found</h4>
          <p className="text-secondary text-sm" style={{ maxWidth: '400px', margin: '0.5rem auto' }}>
            Your digital leases are generated automatically once the Police Verification in the <b>Trust Center</b> is approved.
          </p>
        </div>
      ) : (
        <div className="applications-table-wrapper">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>{isOwner ? "Resident" : "Provider"}</th>
                <th>Monthly Rent</th>
                <th>Term</th>
                <th>Renewal Date</th>
                <th>Security Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leases.map(lease => (
                <tr key={lease.id}>
                  <td className="font-medium">{lease.property?.title || "Residential Unit"}</td>
                  <td className="text-secondary">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{isOwner ? (lease.tenant?.name || "Verified Tenant") : (lease.owner?.name || "Verified Owner")}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{isOwner ? lease.tenant?.email : lease.owner?.email}</span>
                    </div>
                  </td>
                  <td className="font-bold text-gradient">₹{lease.rent}</td>
                  <td>{lease.duration} Months</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} className="text-secondary" />
                      {new Date(lease.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      <ShieldCheck size={10} style={{ marginRight: '4px' }}/> HIGH TRUST
                    </span>
                  </td>
                  <td>
                    <button className="btn-primary small" onClick={() => setSelectedLease(lease)} style={{ fontSize: '0.75rem', padding: '0.4rem 0.9rem' }}>
                      View/Print
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
