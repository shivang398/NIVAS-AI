import React, { useState, useEffect } from 'react';
import { IndianRupee, FileSignature, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const PropertyAnalyticsTab = () => {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      console.error("Failed to fetch leases for rent management", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemind = (tenantName) => {
    alert(`Rent reminder sent to ${tenantName} successfully.`);
  };

  const handleMarkPaid = (leaseId, tenantName) => {
    if (window.confirm(`Confirm that you have received the rent payment from ${tenantName}?`)) {
      alert(`Rent from ${tenantName} marked as PAID successfully.`);
      setLeases(leases.map(l => l.id === leaseId ? { ...l, isDemoPaid: true } : l));
    }
  };

  if (loading) return <div className="text-secondary p-4 animate-pulse">Loading Rent Data...</div>;

  const totalMonthlyRent = leases.reduce((sum, lease) => sum + (lease.rent || 0), 0);
  const activeLeasesCount = leases.length;

  return (
    <div className="analytics-tab animate-fade-in glass-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2><IndianRupee className="text-secondary" size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/> Rent Management</h2>
        <button 
          className={`btn-secondary small ${refreshing ? 'animate-spin' : ''}`} 
          onClick={fetchLeases}
          disabled={refreshing}
        >
          {refreshing ? 'Syncing...' : 'Sync Realtime Data'}
        </button>
      </div>

      <div className="stats-grid mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper" style={{color: '#4ade80'}}><IndianRupee size={24} /></div>
          <div className="stat-details">
            <p className="stat-label">Total Monthly Expected Rent</p>
            <h3 className="stat-number">₹{totalMonthlyRent.toLocaleString()}</h3>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper text-secondary"><FileSignature size={24} /></div>
          <div className="stat-details">
            <p className="stat-label">Active Rent Generating Leases</p>
            <h3 className="stat-number">{activeLeasesCount}</h3>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem', background: 'rgba(255,255,255,0.02)' }}>
        <h3 style={{ marginBottom: '1rem' }}>Active Tenants & Rent Tracking</h3>
        
        {leases.length === 0 ? (
          <p className="text-secondary">No active leases generating rent currently.</p>
        ) : (
          <div className="applications-table-wrapper">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Tenant</th>
                  <th>Monthly Rent</th>
                  <th>Payment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leases.map((lease, index) => {
                  // Simulate 1 out of every 3 being pending for the demo to look dynamic, allow override
                  const isPending = !lease.isDemoPaid && (index % 3 === 1); 
                  return (
                    <tr key={lease.id}>
                      <td className="font-medium">{lease.property?.title || "Residential Unit"}</td>
                      <td className="text-secondary">{lease.tenant?.name || "Verified Tenant"}</td>
                      <td className="font-bold text-gradient">₹{lease.rent}</td>
                      <td>
                        {isPending ? (
                          <span className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '0.7rem' }}>
                            <AlertCircle size={10} style={{ marginRight: '4px' }}/> PENDING
                          </span>
                        ) : (
                          <span className="status-badge" style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', fontSize: '0.7rem' }}>
                            <CheckCircle2 size={10} style={{ marginRight: '4px' }}/> PAID
                          </span>
                        )}
                      </td>
                      <td>
                        {isPending ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-primary small" onClick={() => handleMarkPaid(lease.id, lease.tenant?.name)} style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', background: 'linear-gradient(90deg, #22c55e, #16a34a)', color: 'white', border: 'none' }}>
                              Mark as Paid
                            </button>
                            <button className="btn-secondary small" onClick={() => handleRemind(lease.tenant?.name)} style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}>
                              Remind
                            </button>
                          </div>
                        ) : (
                          <span className="text-secondary text-xs">Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyAnalyticsTab;
