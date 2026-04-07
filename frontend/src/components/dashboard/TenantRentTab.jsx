import React, { useState, useEffect } from 'react';
import { IndianRupee, FileSignature, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';

const TenantRentTab = () => {
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
      console.error("Failed to fetch leases for tenant rent management", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePayRent = (propertyName) => {
    alert(`Initiating secure rent payment for ${propertyName}...`);
    // Placeholder for payment gateway logic
  };

  if (loading) return <div className="text-secondary p-4 animate-pulse">Loading Rent Portal...</div>;

  const totalMonthlyRent = leases.reduce((sum, lease) => sum + (lease.rent || 0), 0);
  const activeLeasesCount = leases.length;

  return (
    <div className="analytics-tab animate-fade-in glass-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2><IndianRupee className="text-secondary" size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/> Rent Due & Payments</h2>
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
          <div className="stat-icon-wrapper" style={{color: '#f59e0b'}}><IndianRupee size={24} /></div>
          <div className="stat-details">
            <p className="stat-label">Total Monthly Rent Due</p>
            <h3 className="stat-number">₹{totalMonthlyRent.toLocaleString()}</h3>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper text-secondary"><FileSignature size={24} /></div>
          <div className="stat-details">
            <p className="stat-label">Active Smart Leases</p>
            <h3 className="stat-number">{activeLeasesCount}</h3>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem', background: 'rgba(255,255,255,0.02)' }}>
        <h3 style={{ marginBottom: '1rem' }}>Active Properties & Invoices</h3>
        
        {leases.length === 0 ? (
          <p className="text-secondary">No active leases requiring rent payment currently.</p>
        ) : (
          <div className="applications-table-wrapper">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Owner</th>
                  <th>Monthly Rent</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leases.map((lease, index) => {
                  // Simulate 1 out of every 3 being pending for the demo to look dynamic
                  const isPending = index % 3 === 1; 
                  return (
                    <tr key={lease.id}>
                      <td className="font-medium">{lease.property?.title || "Residential Unit"}</td>
                      <td className="text-secondary">{lease.owner?.name || "Verified Owner"}</td>
                      <td className="font-bold text-gradient">₹{lease.rent}</td>
                      <td>
                        {isPending ? (
                          <span className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '0.7rem' }}>
                            <AlertCircle size={10} style={{ marginRight: '4px' }}/> DUE SOON
                          </span>
                        ) : (
                          <span className="status-badge" style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', fontSize: '0.7rem' }}>
                            <CheckCircle2 size={10} style={{ marginRight: '4px' }}/> SECURED
                          </span>
                        )}
                      </td>
                      <td>
                        {isPending ? (
                          <button className="btn-primary small" onClick={() => handlePayRent(lease.property?.title)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', background: 'linear-gradient(90deg, #f59e0b, #d97706)', color: 'white' }}>
                            Pay Now
                          </button>
                        ) : (
                          <span className="text-secondary text-xs">Payment Complete</span>
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

export default TenantRentTab;
