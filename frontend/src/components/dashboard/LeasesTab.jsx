import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileSignature, Calendar } from 'lucide-react';

const LeasesTab = ({ isOwner }) => {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const res = await axios.get('/leases');
        if (res.data.success) {
          setLeases(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeases();
  }, []);

  if (loading) return <div className="text-secondary p-4">Loading active leases...</div>;

  return (
    <div className="leases-tab glass-card animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <FileSignature className="text-secondary" /> 
        Active Digital Leases
      </h2>
      
      {leases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--border-glass)', borderRadius: '12px' }}>
          <p className="text-secondary">No active leases found. Fully verified applications will automatically generate digital leases here.</p>
        </div>
      ) : (
        <div className="applications-table-wrapper">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Tenant / Owner ID</th>
                <th>Rent Amount</th>
                <th>Duration (Months)</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leases.map(lease => (
                <tr key={lease.id}>
                  <td className="font-medium">{lease.property?.title || lease.propertyId}</td>
                  <td className="text-secondary">{isOwner ? lease.tenantId : lease.ownerId}</td>
                  <td className="font-bold text-gradient">₹{lease.rent}</td>
                  <td>{lease.duration}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} className="text-secondary" />
                      {new Date(lease.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td><span className="status-badge" style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80' }}>{lease.status}</span></td>
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
